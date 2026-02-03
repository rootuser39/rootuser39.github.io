# Infrastructure Command Console Portfolio - Next.js RSC

A premium, minimalist portfolio for infrastructure, networking, and security engineering built with Next.js App Router, React Server Components, Tailwind CSS, and Framer Motion.

## Features

- **Emperor Black/Grey Theme**: Minimal "infrastructure command console" aesthetic
- **React Server Components**: Fast, RSC-first architecture with small client bundles
- **Tailwind CSS**: Custom design tokens for consistent theming
- **Framer Motion**: Tasteful micro-animations (respects reduced motion)
- **Supabase Integration**: Optional content source with local fallback data
- **TanStack Query**: Client-side state management for interactive filtering
- **Accessibility**: Keyboard navigation, reduced motion support, ARIA labels
- **Mobile-First**: Fully responsive design
- **Static Export**: Deploys to GitHub Pages, Vercel, or any static host

## Pages

- **Home (/)**: Hero section with Ops Brief card, About, Experience, Projects, Education, Certifications, Skills, Contact
- **Projects (/projects)**: Filterable project showcase with tag-based filtering
- **Services (/services)**: Service offerings with detailed descriptions
- **Timeline (/timeline)**: Interactive console-style timeline with filtering and system log

## Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rootuser39/rootuser39.github.io.git
cd rootuser39.github.io
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your portfolio.

## Customization

### Update Content

All content is defined in seed data within `src/lib/data/index.ts`. Edit these arrays to customize:

- **Projects**: Modify `seedProjects` array
- **Services**: Modify `seedServices` array
- **Timeline**: Modify `seedTimelineEntries` array

### Update Personal Information

Edit these components:

- **Hero**: `src/components/home/Hero.tsx`
- **About**: `src/components/home/About.tsx`
- **Experience**: `src/components/home/Experience.tsx`
- **Contact links**: `src/components/home/Contact.tsx`

### Customize Theme

Edit Tailwind config at `tailwind.config.ts`:

```typescript
colors: {
  bg: "#050607",
  surface: "rgba(12, 13, 15, 0.72)",
  surface2: "rgba(18, 20, 23, 0.62)",
  border: "rgba(255, 255, 255, 0.10)",
  text: "#E7E9EE",
  muted: "#A8AFBC",
  highlight: "#D7DBE3",
}
```

### Add Resume PDF

Place your `resume.pdf` file in the `public` directory:

```bash
cp /path/to/your/resume.pdf public/resume.pdf
```

Update the resume link in:
- `src/components/home/Hero.tsx`
- `src/components/home/Contact.tsx`

## Supabase Setup (Optional)

If you want to use Supabase as a content source instead of local seed data:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

### 2. Set Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Create Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  build TEXT NOT NULL,
  outcome TEXT NOT NULL,
  stack TEXT[] NOT NULL,
  tags TEXT[] NOT NULL,
  repo TEXT,
  demo TEXT
);

-- Services table
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "whatYouGet" TEXT[] NOT NULL,
  deliverable TEXT NOT NULL,
  tooling TEXT[] NOT NULL
);

-- Timeline table
CREATE TABLE timeline (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  month TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT NOT NULL,
  type TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON timeline FOR SELECT USING (true);
```

### 4. Populate Data

Insert your content data into the tables via Supabase dashboard or SQL.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables (if using Supabase)
5. Deploy!

Vercel will automatically:
- Build your project with `npm run build`
- Set up automatic deployments for new commits
- Provide a production URL

### Deploy to GitHub Pages

1. Update `next.config.ts` if needed (already configured for static export)
2. Build the project:

```bash
npm run build
```

3. The static files will be in the `out` directory
4. Deploy the `out` directory to GitHub Pages

### Custom Domain

#### Vercel
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

#### GitHub Pages
1. Add a `CNAME` file to `public` directory with your domain
2. Update DNS records:
   - Add A records pointing to GitHub Pages IPs
   - Or CNAME record pointing to `username.github.io`
3. Enable custom domain in repository settings

## Project Structure

```
.
├── public/              # Static assets (resume.pdf, etc.)
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── layout.tsx  # Root layout with navigation
│   │   ├── page.tsx    # Home page
│   │   ├── projects/   # Projects page
│   │   ├── services/   # Services page
│   │   └── timeline/   # Timeline page
│   ├── components/     # React components
│   │   ├── home/       # Home page sections
│   │   ├── Background.tsx
│   │   ├── Navigation.tsx
│   │   ├── BackToTop.tsx
│   │   └── PageTransition.tsx
│   ├── lib/
│   │   ├── data/       # Data access layer with seed data
│   │   ├── query/      # TanStack Query setup
│   │   └── supabase/   # Supabase client config
│   └── types/          # TypeScript types
├── tailwind.config.ts  # Tailwind configuration
├── next.config.ts      # Next.js configuration
└── package.json
```

## Accessibility

This portfolio is built with accessibility in mind:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **ARIA Labels**: Proper ARIA labels for screen readers
- **Semantic HTML**: Uses semantic HTML elements
- **Color Contrast**: Meets WCAG AA standards
- **Focus Indicators**: Clear focus states for keyboard navigation

## Performance

- **Server Components**: Most components are server-rendered by default
- **Minimal JavaScript**: Only client components that need interactivity use JS
- **Optimized Images**: Next.js Image optimization (when using images)
- **Code Splitting**: Automatic code splitting by route
- **Static Export**: Pre-rendered pages for instant load times

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production (static export)
npm run start        # Start production server (not needed for static)

# Code Quality
npm run lint         # Run ESLint
```

## License

This portfolio template is provided for personal use. Customize freely for your own portfolio.

## Credits

**Built by Rishabh Durugkar** | Infrastructure · Networking · Security

**Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Supabase

---

For questions or support, reach out via the contact links in the portfolio.
