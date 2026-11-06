#!/usr/bin/env python3
"""
Turn a photo into the pencil-sketch, paper-cut-out avatar used on the site.

    python scripts/make-avatar-sketch.py "C:/photos/front.jpg" --blink "C:/photos/eyes-closed.jpg"

One-time setup:  pip install rembg onnxruntime opencv-python pillow numpy
Writes public/avatar/sketch/open.webp and blink.webp (content/profile.yaml already points at them).
Best photo: front-facing, shoulders visible, plain background, even light.
The blink photo is optional: same spot, eyes closed.
"""
import argparse, os, importlib.util
import numpy as np, cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'public', 'avatar', 'sketch')
spec = importlib.util.spec_from_file_location('m3d', os.path.join(HERE, 'make-avatar-3d.py'))
m3d = importlib.util.module_from_spec(spec); spec.loader.exec_module(m3d)
rng = np.random.default_rng(7)

def orient(g):
    gx=cv2.Sobel(g,cv2.CV_32F,1,0,ksize=5); gy=cv2.Sobel(g,cv2.CV_32F,0,1,ksize=5)
    J11=cv2.GaussianBlur(gx*gx,(0,0),12); J22=cv2.GaussianBlur(gy*gy,(0,0),12); J12=cv2.GaussianBlur(gx*gy,(0,0),12)
    ang=0.5*np.arctan2(2*J12,J11-J22)+np.pi/2   # along edges
    coh=np.sqrt((J11-J22)**2+4*J12**2)/(J11+J22+1e-6)
    return ang,coh

def motion_kernel(L,theta):
    k=np.zeros((L,L),np.float32); c=L//2
    dx,dy=np.cos(theta),np.sin(theta)
    for t in np.linspace(-c,c,L*2):
        x=int(round(c+t*dx)); y=int(round(c+t*dy))
        if 0<=x<L and 0<=y<L: k[y,x]=1
    return k/k.sum()

def strokes(h,w,ang,L=31,bins=12,density=0.5,seed=0):
    r=np.random.default_rng(seed)
    noise=(r.random((h,w))<0.012*density/0.5).astype(np.float32)
    out=np.zeros((h,w),np.float32)
    q=((ang%np.pi)/np.pi*bins).astype(int)%bins
    for b in range(bins):
        th=(b+0.5)/bins*np.pi
        s=cv2.filter2D(noise,-1,motion_kernel(L,th))
        out=np.where(q==b,s,out)
    out=out/(np.percentile(out,99.7)+1e-6)
    return np.clip((out-0.18)/0.42,0,1)

def sketch(img):
    bgr=img[:,:,:3]; a=img[:,:,3].astype(np.float32)/255
    g0=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY)
    g=g0.copy()
    for _ in range(2): g=cv2.bilateralFilter(g,9,28,7)
    g=cv2.createCLAHE(1.4,(8,8)).apply(g)
    gf=g.astype(np.float32)/255
    h,w=g.shape
    # 1. fine graphite lines (colour dodge)
    inv=255-g; bl=cv2.GaussianBlur(inv,(0,0),5)
    dodge=np.clip(g.astype(np.float32)*255/np.maximum(255-bl.astype(np.float32),1),0,255)/255
    lines=np.clip((1-dodge-0.04)*2.8,0,1)
    # fine detail lines from the unsmoothed image only where edges are strong (hair strands, eyes)
    inv0=255-g0; bl0=cv2.GaussianBlur(inv0,(0,0),2)
    d0=np.clip(g0.astype(np.float32)*255/np.maximum(255-bl0.astype(np.float32),1),0,255)/255
    fine=np.clip((1-d0-0.06)*2.0,0,1)
    # 2. tone (soft shading)
    tone=cv2.GaussianBlur(gf,(0,0),2.5)
    # 3. orientation-following strokes for shading
    ang,coh=orient(cv2.GaussianBlur(gf,(0,0),2))
    # where the surface has no clear direction (jacket, skin) hatch at a steady 50° like a hand would
    cm=np.clip((coh-0.25)/0.35,0,1)
    yy=np.mgrid[0:h,0:w][0]/h
    ang=np.where((cm>0.6)&(yy<0.42),ang,np.deg2rad(128))
    s1=strokes(h,w,ang,L=45,density=0.7,seed=1)
    s2=strokes(h,w,ang+0.5,L=33,density=0.7,seed=2)
    dark=np.clip((0.92-tone)/0.92,0,1)
    hatch=np.clip(s1*np.clip((dark-0.28)*1.8,0,1) + s2*np.clip((dark-0.55)*2.4,0,1),0,1)
    # 4. soft graphite smudge for tone (heavier in the darks: hair, jacket)
    smudge=np.clip(dark**1.7*0.78 + cv2.GaussianBlur(np.clip((dark-0.1)*0.5,0,0.16)*(1-np.clip((dark-0.45)*3,0,1)),(0,0),4),0,1)
    edgew=np.clip(coh*1.8,0,1)
    # 5. contour lines
    ed=cv2.Canny(g,30,80); ed=cv2.GaussianBlur(ed.astype(np.float32)/255,(0,0),0.9)*0.7
    ink=np.clip(1-(1-lines*0.85)*(1-fine*0.6*edgew)*(1-hatch*0.6)*(1-smudge)*(1-ed*0.6),0,1)
    ink=cv2.GaussianBlur(ink,(0,0),0.6)
    # graphite colour on white paper
    paper=np.full((h,w,3),(246,247,248),np.float32)
    graphite=np.array([58,56,54],np.float32)
    out=paper*(1-ink[...,None])+graphite*ink[...,None]
    # paper grain
    grain=cv2.GaussianBlur(rng.normal(0,1,(h,w)).astype(np.float32),(0,0),0.8)
    out+=grain[...,None]*4
    return np.dstack([np.clip(out,0,255).astype(np.uint8),img[:,:,3]])


def paper_cutout(sk, width=1000):
    P = 40
    a = cv2.copyMakeBorder(sk, P, 0, P, P, cv2.BORDER_CONSTANT, value=(0, 0, 0, 0))
    al = a[:, :, 3]
    m = (al > 128).astype(np.uint8)
    border = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    border = (cv2.GaussianBlur(border.astype(np.float32), (0, 0), 5) > 0.5).astype(np.uint8)
    comp = np.zeros_like(a, dtype=np.float32)
    comp[:, :, :3] = (244, 246, 247)
    af = al.astype(np.float32)[..., None] / 255
    comp[:, :, :3] = a[:, :, :3] * af + comp[:, :, :3] * (1 - af)
    comp[:, :, 3] = cv2.GaussianBlur(np.maximum(border * 255, al).astype(np.float32), (0, 0), 0.8)
    im = Image.fromarray(cv2.cvtColor(comp.clip(0, 255).astype(np.uint8), cv2.COLOR_BGRA2RGBA))
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('photo')
    ap.add_argument('--blink')
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    print('1/3 removing background…')
    img = m3d.cutout(a.photo, 2400)
    blink = m3d.make_blink(img, m3d.cutout(a.blink, 2400)) if a.blink else None
    al = img[:, :, 3]
    ys, xs = np.where(al > 10)
    y0, y1 = max(ys.min() - 20, 0), ys.max() + 1
    x0, x1 = max(xs.min() - 40, 0), min(xs.max() + 40, img.shape[1])
    print('2/3 drawing…')
    for name, im in (('open', img), ('blink', blink)):
        if im is None:
            continue
        paper_cutout(sketch(im[y0:y1, x0:x1])).save(os.path.join(OUT, f'{name}.webp'), quality=88, method=6)
    if blink is None and os.path.exists(os.path.join(OUT, 'blink.webp')):
        os.remove(os.path.join(OUT, 'blink.webp'))
        print('  (no blink photo: remove "avatarSketchBlink" from content/profile.yaml or leave it empty)')
    print('3/3 done → public/avatar/sketch/. Refresh the site.')


if __name__ == '__main__':
    main()
