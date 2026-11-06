import { config, collection, singleton, fields } from '@keystatic/core';

/**
 * Everything on the site comes from here. Open http://localhost:3000/keystatic
 * while `npm run dev` is running, edit, then commit the changed files.
 */

const color = (label: string, defaultValue: string) =>
  fields.text({ label, defaultValue, description: 'Hex colour, e.g. #0e2418' });

const side = fields.select({
  label: 'Show on',
  options: [
    { label: 'Design world', value: 'design' },
    { label: 'Tech world', value: 'tech' },
    { label: 'Both', value: 'both' },
  ],
  defaultValue: 'both',
});

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Sathwik · Portfolio' },
    navigation: {
      'About me': ['profile'],
      'Design world': ['folders', 'designResumes'],
      'Tech world': ['projects', 'skills', 'techResumes'],
      Shared: ['experience', 'achievements'],
    },
  },
  singletons: {
    profile: singleton({
      label: 'Profile',
      path: 'content/profile',
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Full name' }),
        shortName: fields.text({ label: 'Short name / first name' }),
        tagline: fields.text({ label: 'One-line tagline (used for search/share previews)', multiline: true }),
        bio: fields.text({ label: 'Short bio (share previews)', multiline: true }),
        designTagline: fields.text({ label: 'Hero: design side tagline' }),
        techTagline: fields.text({ label: 'Hero: tech side tagline' }),
        designBio: fields.text({ label: 'Hero: design side description', multiline: true }),
        techBio: fields.text({ label: 'Hero: tech side description', multiline: true }),
        designIntro: fields.text({ label: 'Design world intro', multiline: true }),
        techIntro: fields.text({ label: 'Tech world intro', multiline: true }),
        designRoles: fields.array(fields.text({ label: 'Role' }), { label: 'Design roles (rotating)', itemLabel: (p) => p.value }),
        techRoles: fields.array(fields.text({ label: 'Role' }), { label: 'Tech roles (rotating)', itemLabel: (p) => p.value }),
        location: fields.text({ label: 'Location' }),
        education: fields.text({ label: 'Education line' }),
        email: fields.text({ label: 'Email' }),
        githubUser: fields.text({ label: 'GitHub username (for the GitHub preview)' }),
        githubRepos: fields.array(
          fields.object({
            name: fields.text({ label: 'Repo name (shown without the owner)' }),
            url: fields.url({ label: 'Repo URL' }),
            description: fields.text({ label: 'One-line description' }),
            language: fields.text({ label: 'Main language (e.g. Python)' }),
          }),
          { label: 'GitHub preview: pinned repos (up to 4)', itemLabel: (p) => p.fields.name.value }
        ),
        designsMade: fields.text({ label: 'Designs made (shown as a stat on the Design world, e.g. 400+)', defaultValue: '400+' }),
        leetcodeUser: fields.text({ label: 'LeetCode username' }),
        leetcodeSolved: fields.text({ label: 'LeetCode problems solved (shown as a stat, e.g. 200+)' }),
        whatsapp: fields.text({ label: 'WhatsApp number (digits with country code, e.g. 918374043278)' }),
        phoneDisplay: fields.text({ label: 'Phone (as shown)' }),
        available: fields.text({ label: 'Availability badge', defaultValue: 'Open to internships & freelance' }),
        socials: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            url: fields.url({ label: 'URL' }),
            icon: fields.select({
              label: 'Icon',
              options: ['linkedin', 'github', 'gitlab', 'leetcode', 'instagram', 'behance', 'dribbble', 'x', 'mail', 'link'].map((v) => ({ label: v, value: v })),
              defaultValue: 'link',
            }),
          }),
          { label: 'Social links', itemLabel: (p) => p.fields.label.value }
        ),
        photo: fields.image({ label: 'Photo', directory: 'public/me', publicPath: '/me/' }),
        avatarSketch: fields.image({ label: 'Avatar: pencil-sketch cut-out (transparent PNG/WebP)', directory: 'public/avatar/sketch', publicPath: '/avatar/sketch/' }),
        avatarSketchBlink: fields.image({ label: 'Avatar: same sketch with eyes closed (optional)', directory: 'public/avatar/sketch', publicPath: '/avatar/sketch/' }),
        avatar3dColor: fields.image({ label: '3D avatar: colour photo (transparent background)', directory: 'public/avatar/3d', publicPath: '/avatar/3d/' }),
        avatar3dBlink: fields.image({ label: '3D avatar: same photo with eyes closed', directory: 'public/avatar/3d', publicPath: '/avatar/3d/' }),
        avatar3dDepth: fields.image({ label: '3D avatar: depth map (white = near)', directory: 'public/avatar/3d', publicPath: '/avatar/3d/' }),
        interests: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            icon: fields.select({
              label: 'Icon',
              options: ['pen', 'palette', 'code', 'brain', 'music', 'cricket', 'film', 'calendar', 'clipboard', 'gamepad', 'crown', 'users', 'chat', 'camera', 'sparkle', 'trophy', 'shirt', 'terminal'].map((v) => ({ label: v, value: v })),
              defaultValue: 'sparkle',
            }),
            side,
          }),
          { label: 'Floating interests (hero)', itemLabel: (p) => p.fields.label.value }
        ),
      },
    }),
  },
  collections: {
    folders: collection({
      label: 'Design folders',
      path: 'content/folders/*',
      slugField: 'name',
      format: { data: 'yaml' },
      columns: ['order', 'kicker'],
      schema: {
        name: fields.slug({ name: { label: 'Folder name' } }),
        kicker: fields.text({ label: 'Kicker (small line above the title)' }),
        role: fields.text({ label: 'My role' }),
        period: fields.text({ label: 'Period' }),
        description: fields.text({ label: 'Description', multiline: true }),
        layout: fields.select({
          label: 'Theme / layout',
          description: 'Decides the look of the section',
          options: [
            { label: 'Comic (B/W halftone)', value: 'comic' },
            { label: 'Newspaper (vintage)', value: 'newspaper' },
            { label: 'Google (colour dots)', value: 'google' },
            { label: 'Festival (rich, ornamental)', value: 'festival' },
            { label: 'Sports (bold, athletic)', value: 'sports' },
            { label: 'Wedding (stationery table)', value: 'wedding' },
            { label: 'Rack (merch / apparel)', value: 'rack' },
            { label: 'Cinema (dark, spotlight)', value: 'cinema' },
            { label: 'Lanyard (ID cards)', value: 'lanyard' },
            { label: 'Masonry (clean)', value: 'masonry' },
            { label: 'Multiverse (UI/UX: neon city, glitch print)', value: 'spiderverse' },
          ],
          defaultValue: 'masonry',
        }),
        palette: fields.object(
          {
            bg: color('Background', '#111111'),
            ink: color('Text', '#f5f5f5'),
            accent: color('Accent', '#ffcc00'),
            accent2: color('Accent 2', '#ff3b3b'),
          },
          { label: 'Colours' }
        ),
        order: fields.integer({ label: 'Order (lower = earlier)', defaultValue: 50 }),
        topLevel: fields.checkbox({ label: 'Show as its own section', defaultValue: true, description: 'Untick for sub-folders that should only appear inside their parents.' }),
        highlight: fields.checkbox({ label: 'Highlight (bigger, featured)', defaultValue: false }),
        parents: fields.multiRelationship({ label: 'Also show inside these folders', collection: 'folders' }),
        fullParents: fields.multiRelationship({ label: 'Also show on the FULL page of these folders', description: 'Repeats this folder on another folder’s full page only (not in its short preview).', collection: 'folders' }),
        heroShortcut: fields.text({ label: 'Design hero shortcut label (optional)', description: 'Shows a small button to this issue in the Design World hero, e.g. "UI/UX case studies".' }),
        childrenAfter: fields.integer({ label: 'Short preview: show sub-folders after this many groups', description: 'Leave empty to show them after all groups.' }),
        previewGroups: fields.integer({ label: 'How many groups to show in the short preview', description: 'Leave empty for the default (2, or 3 when highlighted).' }),
        previewMerge: fields.checkbox({ label: 'Short preview: merge the chosen pieces into one grid', defaultValue: false }),
        previewStyle: fields.select({
          label: 'Merged preview style',
          options: [
            { label: 'Row (same height)', value: 'row' },
            { label: 'Poster line (hung on festival lights)', value: 'line' },
          ],
          defaultValue: 'row',
        }),
        cover: fields.image({ label: 'Cover image', directory: 'public/work', publicPath: '/work/' }),
        // ---- UI/UX case-study issues (optional; used by the Multiverse theme) ----
        process: fields.array(
          fields.object({ title: fields.text({ label: 'Step' }), detail: fields.text({ label: 'What happens', multiline: true }) }),
          { label: 'How I work (process steps, optional)', itemLabel: (p) => p.fields.title.value }
        ),
        callout: fields.text({ label: 'Callout note (optional)', multiline: true }),
        caseStudies: fields.array(
          fields.object({
            title: fields.text({ label: 'Project' }),
            role: fields.text({ label: 'My role' }),
            period: fields.text({ label: 'When' }),
            challenge: fields.text({ label: 'The challenge', multiline: true }),
            design: fields.array(fields.text({ label: 'Design move' }), { label: 'How I designed it', itemLabel: (p) => p.value }),
            build: fields.text({ label: 'How I built it (code side)', multiline: true }),
            tools: fields.array(fields.text({ label: 'Tool' }), { label: 'Tools', itemLabel: (p) => p.value }),
            liveUrl: fields.url({ label: 'Live link (optional)' }),
            alsoInTech: fields.checkbox({ label: 'Also shown in the Tech World', defaultValue: false }),
          }),
          { label: 'UI/UX case studies (optional)', itemLabel: (p) => p.fields.title.value }
        ),
        groups: fields.array(
          fields.object({
            title: fields.text({ label: 'Group title' }),
            kind: fields.select({
              label: 'Display as',
              options: [
                { label: 'Grid', value: 'grid' },
                { label: 'Carousel (swipe through)', value: 'carousel' },
                { label: 'Flipbook (brochure / magazine)', value: 'flipbook' },
                { label: 'Marquee (scrolling strip: stories, stickers)', value: 'marquee' },
                { label: 'Compare (drafts → final slider)', value: 'compare' },
                { label: 'Stack (fanned cards / invites)', value: 'stack' },
                { label: 'Row (one line, every piece the same height)', value: 'row' },
                { label: 'Poster line (hung on a string of lights)', value: 'line' },
                { label: 'Process (design → print → in hand, step by step)', value: 'process' },
                { label: 'Cinema (featured poster + now-showing board)', value: 'cinema' },
              ],
              defaultValue: 'grid',
            }),
            showIn: fields.select({
              label: 'Show this group in',
              options: [
                { label: 'Preview and full page', value: 'both' },
                { label: 'Short preview only', value: 'preview' },
                { label: 'Full page only', value: 'full' },
              ],
              defaultValue: 'both',
            }),
            note: fields.text({ label: 'Note (optional)' }),
            file: fields.file({ label: 'Downloadable PDF (optional)', description: 'Shows a "Download PDF" button next to this group', directory: 'public/work', publicPath: '/work/' }),
            items: fields.array(
              fields.object({
                image: fields.image({ label: 'Image (or video poster)', directory: 'public/work', publicPath: '/work/' }),
                video: fields.file({ label: 'Video (mp4, optional)', directory: 'public/work', publicPath: '/work/' }),
                caption: fields.text({ label: 'Caption' }),
                span: fields.select({
                  label: 'Size',
                  options: [
                    { label: 'Normal', value: 'normal' },
                    { label: 'Wide', value: 'wide' },
                    { label: 'Tall', value: 'tall' },
                    { label: 'Big', value: 'big' },
                  ],
                  defaultValue: 'normal',
                }),
                show: fields.checkbox({ label: 'Show on site', defaultValue: true }),
                previewOnly: fields.checkbox({ label: 'Only in the short preview (hide on the full folder page)', description: 'For a piece repeated here from another group, so the full page does not show it twice.', defaultValue: false }),
                preview: fields.checkbox({ label: 'Show in the short preview on the Design world page', description: 'Untick for slides with other people’s faces; they still show on the full folder page.', defaultValue: true }),
              }),
              { label: 'Pieces', itemLabel: (p) => p.fields.caption.value || 'Piece' }
            ),
          }),
          { label: 'Groups', itemLabel: (p) => `${p.fields.title.value} · ${p.fields.kind.value}` }
        ),
      },
    }),
    projects: collection({
      label: 'Tech projects',
      path: 'content/projects/*',
      slugField: 'title',
      format: { data: 'yaml' },
      columns: ['order', 'status'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        tagline: fields.text({ label: 'One-liner' }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Full-stack', value: 'fullstack' },
            { label: 'AI / Agents', value: 'ai' },
            { label: 'Machine learning', value: 'ml' },
            { label: 'Frontend / UI', value: 'frontend' },
          ],
          defaultValue: 'fullstack',
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Live', value: 'live' },
            { label: 'Shipped', value: 'shipped' },
            { label: 'In progress', value: 'wip' },
          ],
          defaultValue: 'shipped',
        }),
        featured: fields.checkbox({ label: 'Featured (big card)', defaultValue: false }),
        team: fields.checkbox({ label: 'Group project (shows a "Group project" badge)', defaultValue: false }),
        largePreview: fields.checkbox({ label: 'Bigger live preview (featured projects)', defaultValue: false }),
        badge: fields.text({ label: 'Highlight ribbon (optional, e.g. "Final Year Project"); highlighted cards come first in More projects' }),
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
        role: fields.text({ label: 'My role' }),
        period: fields.text({ label: 'Period' }),
        summary: fields.text({ label: 'Description', multiline: true }),
        highlights: fields.array(fields.text({ label: 'Point' }), { label: 'Highlights', itemLabel: (p) => p.value }),
        metrics: fields.array(
          fields.object({ value: fields.text({ label: 'Value' }), label: fields.text({ label: 'Label' }) }),
          { label: 'Metrics', itemLabel: (p) => `${p.fields.value.value} ${p.fields.label.value}` }
        ),
        stack: fields.array(fields.text({ label: 'Tech' }), { label: 'Tech stack', itemLabel: (p) => p.value }),
        liveUrl: fields.url({ label: 'Live URL' }),
        embedUrl: fields.url({ label: 'Embed URL (optional)', description: 'Different address for the in-portfolio preview, e.g. a Streamlit app with ?embed=true. Leave empty to use the Live URL.' }),
        repoUrl: fields.url({ label: 'Repository URL' }),
        repoNote: fields.text({ label: 'Note shown next to the code link (optional)', multiline: true }),
        extraLinks: fields.array(
          fields.object({ label: fields.text({ label: 'Label' }), url: fields.url({ label: 'URL' }) }),
          { label: 'Other links', itemLabel: (p) => p.fields.label.value }
        ),
        embed: fields.checkbox({ label: 'Show live site inside the portfolio', defaultValue: true, description: 'Turn off if the site refuses to load in a frame.' }),
        preview: fields.image({ label: 'Screenshot (optional, used if no live site)', directory: 'public/projects', publicPath: '/projects/' }),
        accent: fields.text({ label: 'Accent colour (optional)', defaultValue: '#3b82f6' }),
      },
    }),
    chat: collection({
      label: 'Chatbot answers',
      path: 'content/chat/*',
      slugField: 'question',
      format: { data: 'yaml' },
      columns: ['world', 'featured'],
      schema: {
        question: fields.slug({ name: { label: 'Question (as shown on the chip)' } }),
        world: fields.select({
          label: 'World',
          options: [
            { label: 'Design World', value: 'design' },
            { label: 'Tech World', value: 'tech' },
            { label: 'Both', value: 'both' },
          ],
          defaultValue: 'design',
        }),
        answer: fields.text({ label: 'Answer', multiline: true }),
        keywords: fields.array(fields.text({ label: 'Keyword or phrase' }), {
          label: 'Other ways people might ask (keywords / phrases)',
          itemLabel: (p) => p.value,
        }),
        featured: fields.checkbox({ label: 'Show as a suggested question chip', defaultValue: true }),
        linkLabel: fields.text({ label: 'Button label (optional)' }),
        linkUrl: fields.text({ label: 'Button link (optional, e.g. #ui-ux or /tech or https://…)' }),
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
      },
    }),
    skills: collection({
      label: 'Tech stack',
      path: 'content/skills/*',
      slugField: 'name',
      format: { data: 'yaml' },
      columns: ['group'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        group: fields.select({
          label: 'Group',
          options: [
            { label: 'Languages', value: 'languages' },
            { label: 'AI / ML', value: 'ai' },
            { label: 'Frontend', value: 'frontend' },
            { label: 'Backend & data', value: 'backend' },
            { label: 'Tools', value: 'tools' },
            { label: 'Design', value: 'design' },
          ],
          defaultValue: 'tools',
        }),
        icon: fields.text({ label: 'Icon slug', description: 'A slug from simpleicons.org, e.g. "python", "react". Leave blank for a text badge.' }),
        level: fields.integer({ label: 'Comfort (1–5)', defaultValue: 4 }),
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
      },
    }),
    experience: collection({
      label: 'Experience',
      path: 'content/experience/*',
      slugField: 'role',
      format: { data: 'yaml' },
      columns: ['org', 'period'],
      schema: {
        role: fields.slug({ name: { label: 'Role' } }),
        org: fields.text({ label: 'Organisation' }),
        period: fields.text({ label: 'Period' }),
        side,
        kind: fields.select({
          label: 'Type',
          options: [
            { label: 'Work / internship', value: 'work' },
            { label: 'Leadership', value: 'leadership' },
            { label: 'Freelance', value: 'freelance' },
            { label: 'Education', value: 'education' },
          ],
          defaultValue: 'work',
        }),
        points: fields.array(fields.text({ label: 'Point', multiline: true }), { label: 'What I did', itemLabel: (p) => p.value.slice(0, 60) }),
        current: fields.checkbox({ label: 'Current role (shows a "Now" badge)', defaultValue: false }),
        badge: fields.text({ label: 'Highlight badge (optional, design world). Makes the card stand out, e.g. "Biggest student design role"' }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Skills / tags', itemLabel: (p) => p.value }),
        metrics: fields.array(fields.object({ value: fields.text({ label: 'Value' }), label: fields.text({ label: 'Label' }) }), {
          label: 'Highlight numbers (optional)',
          itemLabel: (p) => `${p.fields.value.value} ${p.fields.label.value}`,
        }),
        link: fields.url({ label: 'Link (optional)' }),
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
      },
    }),
    achievements: collection({
      label: 'Achievements',
      path: 'content/achievements/*',
      slugField: 'title',
      format: { data: 'yaml' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        detail: fields.text({ label: 'Detail' }),
        stat: fields.text({ label: 'Big number (optional)', description: 'e.g. 300+' }),
        side,
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
      },
    }),
    designResumes: collection({
      label: 'Resumes: design',
      path: 'content/resumes-design/*',
      slugField: 'title',
      format: { data: 'yaml' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        subtitle: fields.text({ label: 'Subtitle' }),
        file: fields.file({ label: 'PDF', directory: 'public/resumes', publicPath: '/resumes/' }),
        preview: fields.image({ label: 'Preview image (page 1)', directory: 'public/resumes', publicPath: '/resumes/' }),
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
      },
    }),
    techResumes: collection({
      label: 'Resumes: tech',
      path: 'content/resumes-tech/*',
      slugField: 'title',
      format: { data: 'yaml' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        subtitle: fields.text({ label: 'Subtitle' }),
        file: fields.file({ label: 'PDF', directory: 'public/resumes', publicPath: '/resumes/' }),
        preview: fields.image({ label: 'Preview image (page 1)', directory: 'public/resumes', publicPath: '/resumes/' }),
        order: fields.integer({ label: 'Order', defaultValue: 50 }),
      },
    }),
  },
});
