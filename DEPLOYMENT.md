# Deployment Setup

This project uses GitHub Actions for automated deployment. The workflow builds the application and can deploy to various platforms.

## Required GitHub Secrets

To enable deployment, you need to add these secrets to your GitHub repository:

### Environment Variables (Required for all deployments)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase publishable API key  
- `VITE_FORMSPREE_ENDPOINT` - Your Formspree form endpoint

### Platform-Specific Secrets

#### For Vercel Deployment
- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

#### For Netlify Deployment  
- `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token
- `NETLIFY_SITE_ID` - Your Netlify site ID

#### For GitHub Pages
No additional secrets required, but you need to enable GitHub Pages in repository settings.

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with its corresponding value

## Deployment Platforms

The workflow includes configurations for:

- **Vercel** - Recommended for React/Vite applications
- **Netlify** - Great alternative with good free tier
- **GitHub Pages** - Free option, good for static sites

To enable a specific deployment platform, uncomment the corresponding job in `.github/workflows/deploy.yml`.

## Vercel Setup Instructions

### 1. Create Vercel Account and Project
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository: `nicolelily/us-bsl-db`
4. Configure project settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

### 2. Get Vercel Project Information
After creating the project, you'll need these values for GitHub secrets:
- **Vercel Token**: Go to [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create new token
- **Organization ID**: Found in your Vercel team settings
- **Project ID**: Found in your project settings → General

### 3. Configure Custom Domain (bsldb.app)
1. In your Vercel project dashboard, go to **Settings** → **Domains**
2. Add `bsldb.app` and `www.bsldb.app`
3. Vercel will provide DNS records to configure with your domain registrar
4. Update your domain's DNS settings with the provided records

### 4. Add Environment Variables in Vercel
In your Vercel project settings → **Environment Variables**, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FORMSPREE_ENDPOINT`

## Current Status

- ✅ Build workflow configured
- ✅ Vercel deployment workflow enabled
- ✅ Vercel configuration file created
- ⏳ Create Vercel account and project
- ⏳ Add required secrets to GitHub repository
- ⏳ Configure custom domain (bsldb.app)

## Next Steps

1. **Create Vercel account** and import your GitHub repository
2. **Add GitHub secrets** (see instructions above)
3. **Configure custom domain** in Vercel dashboard
4. **Push changes** to trigger first deployment
5. **Update DNS** to point bsldb.app to Vercel