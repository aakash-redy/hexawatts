# Hexawatts Racing Team — Website

The official website for **JNTU Hexawatts Racing Team** — India's first electric vehicle team from both the Telugu states.

The Next.js app lives in the [`hexa-revanth/`](./hexa-revanth) subdirectory. The repository root holds Vercel / project config only.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database / Auth:** Supabase
- **Animations:** Framer Motion
- **3D viewer:** Three.js + @react-three/fiber + @react-three/drei

## Local Development

```bash
cd hexa-revanth
npm install
npm run dev
```

The dev server will start on [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file inside `hexa-revanth/` with the following keys (get them from your Supabase project dashboard):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

These are required at build time because the Supabase client is initialised when the modules are first imported. Without them, data-fetching components will fail gracefully (returning `null`/empty arrays) but admin login will be unavailable.

## Deployment to Vercel

1. Push the repository to GitHub (already done at `origin/main`).
2. Import the project into Vercel.
3. In **Project Settings → General → Root Directory**, set the value to `hexa-revanth`.
4. In **Project Settings → Environment Variables**, add the two `NEXT_PUBLIC_SUPABASE_*` variables listed above for **Production**, **Preview**, and **Development** environments.
5. Deploy. Vercel will run `npm install && next build` from the `hexa-revanth/` directory.

The included `vercel.json` at the repo root mirrors these settings as a fallback, in case the Root Directory is not set explicitly.

## Supabase Schema

The app expects the following tables to exist in your Supabase project:

- `hero_slides` — homepage carousel slides
- `campaigns` — crowdfunding campaigns (with `goal_amount_paise`, `total_raised_paise`, `is_active`)
- `donations` — donation records (`donor_email`, `campaign_id`, `status`)
- `contact_submissions` — contact form submissions
- `captains` — team captain / vice-captain
- `domains` — team domain rows
- `team_leads` — domain lead rows
- `members` — domain member rows
- `mentors` — mentor rows
- `mechanical_specs` — mechanical car spec cards
- `electrical_specs` — electrical car spec cards
- `previous_sponsors` — sponsor logos for past seasons
- `preliminary_sponsors` — current-season sponsor logos
- `roadmap_checkpoints` — roadmap phases
- `site_settings` — key/value site settings (e.g. active roadmap checkpoint)
- `site_images` — image assets by `section` + `key`
- `admin_allowed_emails` — emails allowed to sign in to `/admin`

Storage buckets required: `team-photos`, `hero-slides`, `site-images`, `sponsor-logos`.
