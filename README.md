# Ghost Agency

Design request management platform built with React, Express, and Neon PostgreSQL, deployed on Netlify.

## Development

1. Clone the repository:
```bash
git clone https://github.com/RodrickRK/ghostagency.git
cd ghostagency
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Start the development server:
```bash
npm run dev:all
```

## Deployment

1. Push your changes to GitHub:
```bash
git add .
git commit -m "your commit message"
git push origin main
```

2. Set up environment variables in Netlify:
- Go to Site settings > Environment
- Add required variables:
  - DATABASE_URL
  - SESSION_SECRET
  - NODE_ENV

3. Deploy:
- Netlify will automatically deploy when you push to main
- The build command will:
  1. Run database migrations
  2. Build the React frontend
  3. Build the serverless functions

4. Verify the deployment:
- Visit your Netlify URL
- Test the frontend UI
- Test API endpoints (e.g. /api/tickets)

## Environment Variables

Required variables:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `NODE_ENV`: "development" or "production"

## Architecture

- Frontend: React + Vite + Tailwind CSS
- Backend: Express.js running as Netlify Functions
- Database: Neon PostgreSQL
- ORM: Drizzle
- File Storage: URL-based attachments