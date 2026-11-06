#!/usr/bin/env python3
"""
Rebuild the 3D avatar from a new photo.

    python scripts/make-avatar-3d.py "C:/path/front.jpg" --blink "C:/path/eyes-closed.jpg"

Needs Python 3.10+ and, one time:
    pip install rembg onnxruntime opencv-python pillow numpy

What it does
  1. Removes the background (rembg).
  2. Estimates a depth map with Depth-Anything-V2 (downloads ~100 MB once into scripts/.models/).
  3. Writes public/avatar/3d/color.webp, color_blink.webp and depth.png.
     content/profile.yaml already points at these files, so just refresh the site.

Tips for the photo: front-facing, shoulders visible, plain background, even light.
For the blink frame, take a second photo from the same spot with eyes closed.
"""
import argparse, os, sys, urllib.request
import numpy as np
import cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'avatar', '3d')
MODEL_DIR = os.path.join(ROOT, 'scripts', '.models')
MODEL = os.path.join(MODEL_DIR, 'depth_anything_v2_vits.onnx')
MODEL_URL = 'https://github.com/fabio-sim/Depth-Anything-ONNX/releases/download/v2.0.0/depth_anything_v2_vits.onnx'


def cutout(path, height=1800):
    from rembg import remove, new_session
    im = Image.open(path).convert('RGB')
    w, h = im.size
    im = im.resize((round(w * height / h), height), Image.LANCZOS)
    out = remove(im, session=new_session('u2net_human_seg'), post_process_mask=True,
                 alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=15)
    return cv2.cvtColor(np.array(out), cv2.COLOR_RGBA2BGRA)


def head_box(alpha):
    """Rough head bounding box from the silhouette: rows above the narrowest point of the neck."""
    m = alpha > 128
    rows = np.where(m.any(1))[0]
    top = rows[0]
    widths = m.sum(1).astype(float)
    h = alpha.shape[0]
    lo, hi = top + int(0.12 * h), top + int(0.5 * h)
    neck = lo + int(np.argmin(widths[lo:hi] + 1e9 * (widths[lo:hi] == 0)))
    cols = np.where(m[top:neck].any(0))[0]
    return cols[0], top, cols[-1] - cols[0], neck - top  # x, y, w, h


def make_blink(open_img, blink_img):
    gB = cv2.cvtColor(open_img[:, :, :3], cv2.COLOR_BGR2GRAY)
    gC = cv2.cvtColor(blink_img[:, :, :3], cv2.COLOR_BGR2GRAY)
    if gC.shape != gB.shape:
        blink_img = cv2.resize(blink_img, (gB.shape[1], gB.shape[0]))
        gC = cv2.cvtColor(blink_img[:, :, :3], cv2.COLOR_BGR2GRAY)
    x, y, w, h = head_box(open_img[:, :, 3])
    mask = np.zeros_like(gB)
    mask[y:y + h, x:x + w] = 255
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(cv2.GaussianBlur(gB, (5, 5), 0).astype(np.float32),
                                       cv2.GaussianBlur(gC, (5, 5), 0).astype(np.float32), warp,
                                       cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), mask, 5)
    except cv2.error:
        print('! could not align the blink photo; using it as-is')
    Cw = cv2.warpAffine(blink_img, warp, (gB.shape[1], gB.shape[0]), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP)
    # eye band ≈ 38–62% down the head box
    m = np.zeros(gB.shape, np.float32)
    m[y + int(h * 0.38):y + int(h * 0.62), x + int(w * 0.12):x + int(w * 0.88)] = 1
    m = cv2.GaussianBlur(m, (0, 0), h * 0.04)[..., None]
    out = (open_img.astype(np.float32) * (1 - m) + Cw.astype(np.float32) * m).astype(np.uint8)
    out[:, :, 3] = open_img[:, :, 3]
    return out


def depth(img):
    import onnxruntime as ort
    if not os.path.exists(MODEL):
        os.makedirs(MODEL_DIR, exist_ok=True)
        print('Downloading depth model (~100 MB, one time)…')
        urllib.request.urlretrieve(MODEL_URL, MODEL)
    s = ort.InferenceSession(MODEL, providers=['CPUExecutionProvider'])
    name = s.get_inputs()[0].name
    h, w = img.shape[:2]
    m = img[:, :, 3] > 128
    al = img[:, :, 3:] / 255.0
    rgb = (img[:, :, :3] * al + 128 * (1 - al)).astype(np.uint8)

    def run(im):
        H, W = im.shape[:2]
        S = max(H, W)
        pad = np.full((S, S, 3), 128, np.uint8)
        ox, oy = (S - W) // 2, (S - H) // 2
        pad[oy:oy + H, ox:ox + W] = im
        x = cv2.resize(pad, (518, 518), interpolation=cv2.INTER_CUBIC)[:, :, ::-1].astype(np.float32) / 255.0
        x = ((x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]).transpose(2, 0, 1)[None].astype(np.float32)
        d = s.run(None, {name: x})[0][0]
        return cv2.resize(d, (S, S), interpolation=cv2.INTER_CUBIC)[oy:oy + H, ox:ox + W]

    def norm(d, mask):
        lo, hi = np.percentile(d[mask], 1), np.percentile(d[mask], 99.5)
        return np.clip((d - lo) / (hi - lo + 1e-6), 0, 1)

    full = norm(run(rgb), m)
    hx, hy, hw, hh = head_box(img[:, :, 3])
    x0, x1 = max(0, hx - hw // 6), min(w, hx + hw + hw // 6)
    y1 = min(h, hy + int(hh * 1.25))
    hd = norm(run(rgb[:y1, x0:x1]), m[:y1, x0:x1])
    hp = hd - cv2.GaussianBlur(hd, (0, 0), 12)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy, rx, ry = hx + hw / 2, hy + hh * 0.55, hw * 0.48, hh * 0.62
    bulge = np.sqrt(np.clip(1 - ((xx - cx) / rx) ** 2 - ((yy - cy) / ry) ** 2, 0, 1))
    D = full * 0.75 + bulge * 0.45
    detail = np.zeros_like(D)
    detail[:y1, x0:x1] = hp
    D += detail * 1.4 * cv2.GaussianBlur((bulge > 0).astype(np.float32), (0, 0), 15)
    D[~m] = 0
    edge = np.clip(cv2.distanceTransform(m.astype(np.uint8), cv2.DIST_L2, 5) / 22.0, 0, 1)
    D = D * (0.25 + 0.75 * edge ** 0.7)
    D = cv2.GaussianBlur(D.astype(np.float32), (0, 0), 1.6)
    D[~m] = 0
    return (D / D.max() * 255).astype(np.uint8)


def decontaminate(im):
    """Bleed solid colours into the semi-transparent edge so no grey halo shows in 3D."""
    f = im.astype(np.float32)
    a = f[:, :, 3:] / 255.0
    solid = (a > 0.97).astype(np.float32)
    acc, wsum, out = f[:, :, :3] * solid, solid, f[:, :, :3].copy()
    for s in (2, 4, 8, 16, 32):
        bc = cv2.GaussianBlur(acc, (0, 0), s)
        bw = cv2.GaussianBlur(wsum, (0, 0), s)[..., None]
        out = np.where((a < 0.97) & (bw > 0.02), bc / np.maximum(bw, 1e-4), out)
    return np.dstack([out, f[:, :, 3]]).clip(0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('photo')
    ap.add_argument('--blink', help='same pose, eyes closed (optional)')
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    print('1/3 removing background…')
    img = cutout(a.photo)
    blink = make_blink(img, cutout(a.blink)) if a.blink else img.copy()
    alpha = img[:, :, 3]
    ys, xs = np.where(alpha > 10)
    y0, y1 = max(ys.min() - 16, 0), ys.max() + 1
    x0, x1 = max(xs.min() - 32, 0), min(xs.max() + 32, img.shape[1])
    img, blink = img[y0:y1, x0:x1], blink[y0:y1, x0:x1]
    print('2/3 estimating depth…')
    d = depth(img)
    print('3/3 writing files…')
    for name, im in (('color', img), ('color_blink', blink)):
        Image.fromarray(cv2.cvtColor(decontaminate(im), cv2.COLOR_BGRA2RGBA)).save(os.path.join(OUT, f'{name}.webp'), quality=90, method=6)
    Image.fromarray(d).save(os.path.join(OUT, 'depth.png'), optimize=True)
    print('✓ public/avatar/3d updated. Refresh the site.')


if __name__ == '__main__':
    sys.exit(main())
