# Cloudflare Pages Setup Guide

This guide will help you configure the GitHub repository secrets needed for
automatic deployment to Cloudflare Pages.

## Required GitHub Secrets

You need to add two secrets to your GitHub repository for the deployment
workflow to function:

### 1. `CLOUDFLARE_API_TOKEN`

This token allows GitHub Actions to deploy to your Cloudflare Pages project.

**How to create:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on your profile icon (top right) → **My Profile**
3. Navigate to **API Tokens** in the left sidebar
4. Click **Create Token**
5. Use the **"Edit Cloudflare Workers"** template or create a custom token with
   these permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
6. Set the Account Resources to include your account
7. Click **Continue to summary** → **Create Token**
8. **Copy the token** (you won't be able to see it again!)

### 2. `CLOUDFLARE_ACCOUNT_ID`

This is your Cloudflare Account ID.

**How to find:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on **Workers & Pages** in the left sidebar
3. Your Account ID is displayed in the right sidebar
4. Or find it in the URL:
   `https://dash.cloudflare.com/<ACCOUNT_ID>/workers-and-pages`

## Adding Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/and3rn3t/telescope`
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: (paste the API token from Cloudflare)
   - Click **Add secret**
5. Repeat for the second secret:
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: (paste your account ID)
   - Click **Add secret**

## Deployment Behavior

The workflow is configured to:

- ✅ **Run quality checks** on all pushes and pull requests (lint, format,
  type-check)
- ✅ **Build the application** on all pushes and pull requests
- ✅ **Deploy to Cloudflare Pages** ONLY on pushes to the `main` branch
- ✅ **Skip deployment** on pull requests (to avoid deployment failures while
  testing)

This means:

- Pull requests will build and test but won't deploy
- Only merged changes to `main` will trigger a deployment
- You can still manually deploy using: `npm run deploy`

## Troubleshooting

### Error: "Input required and not supplied: apiToken"

**Cause:** The `CLOUDFLARE_API_TOKEN` secret is not set in GitHub.

**Solution:** Follow the steps above to add the secret to your repository.

### Error: "Authentication error"

**Cause:** The API token is invalid or doesn't have the correct permissions.

**Solution:**

1. Verify the token has **Cloudflare Pages: Edit** permission
2. Ensure the token hasn't expired
3. Create a new token if needed and update the GitHub secret

### Error: "Project not found"

**Cause:** The Cloudflare Pages project doesn't exist yet.

**Solution:**

1. Create the project in Cloudflare Dashboard first:
   - Go to **Workers & Pages** → **Create application** → **Pages**
   - Connect to your Git repository OR create a blank project
   - Name it: `jwst-deep-sky-explorer`
2. Or update the `projectName` in `.github/workflows/deploy.yml` to match your
   existing project

## Manual Deployment

If you prefer to deploy manually or need to deploy a preview:

```bash
# Deploy to production
npm run deploy

# Deploy a preview
npm run deploy:preview
```

These commands use the Wrangler CLI and will use your local Cloudflare
authentication.

## Alternative: Skip Cloudflare Deployment

If you don't want to use Cloudflare Pages, you can:

1. Remove or comment out the "Deploy to Cloudflare Pages" step in
   `.github/workflows/deploy.yml`
2. Or fork the workflow to only run quality checks:

```yaml
- name: Deploy to Cloudflare Pages
  if: false # Disable deployment
  uses: cloudflare/pages-action@v1
  # ... rest of config
```

## Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
