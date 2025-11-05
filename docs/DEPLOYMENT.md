# 🚀 Cloudflare Pages Deployment Guide

## Custom Domain: jwst.andernet.dev

## Quick Setup

### 1. **Cloudflare Account Setup**

1. Sign up for [Cloudflare](https://dash.cloudflare.com/sign-up) if you haven't already
2. Go to **Pages** in your Cloudflare dashboard
3. Click **"Create a project"** → **"Connect to Git"**

### 2. **GitHub Repository Connection**

1. Connect your GitHub account
2. Select the `telescope` repository
3. Choose **"main"** branch for production

### 3. **Build Configuration**

```yaml
Build command: npm run build
Build output directory: dist
Root directory: /
```

### 4. **Environment Variables** (Optional)

Add these in Cloudflare Pages → Settings → Environment Variables:

```
NODE_VERSION=20.19.0
NPM_VERSION=10.9.0
NODE_ENV=production
VITE_NASA_API_BASE=https://images-api.nasa.gov
```

## 🌐 Custom Domain Setup

### Method 1: Purchase Domain through Cloudflare

1. Go to **Domain Registration** in Cloudflare dashboard
2. Search for your desired domain (e.g., `jwst-explorer.com`)
3. Complete purchase and DNS will be automatically configured

### Method 2: Use Existing Domain

1. Transfer DNS to Cloudflare:
   - Go to **Websites** → **Add a site**
   - Enter your domain name
   - Follow nameserver configuration steps

2. Configure Custom Domain:
   - Go to **Pages** → Your project → **Custom domains**
   - Click **"Set up a custom domain"**
   - Enter your domain (e.g., `jwst-explorer.com`)
   - Cloudflare will automatically handle SSL certificates

## 🔧 Advanced Configuration

### Build Optimization

The project includes several performance optimizations:

- **Asset caching**: Static files cached for 1 year
- **Security headers**: CSP, XSS protection, frame options
- **Compression**: Automatic Brotli/Gzip compression
- **SPA routing**: Client-side routing support

### Monitoring & Analytics

Enable in Cloudflare dashboard:

1. **Web Analytics**: Track visitor metrics
2. **Speed Brain**: Automatic performance optimization
3. **Bot Fight Mode**: Protection against malicious bots

## 🚀 Deployment Commands

### Local Commands

```bash
# Build for production
npm run build:production

# Preview build locally
npm run preview

# Deploy to Cloudflare (requires authentication)
npm run deploy

# Deploy preview branch
npm run deploy:preview
```

### Automatic Deployment

Every push to `main` branch automatically:

1. ✅ Runs quality checks (ESLint, TypeScript, Prettier)
2. ✅ Builds the application
3. ✅ Deploys to Cloudflare Pages
4. ✅ Updates your live domain

## 🔐 GitHub Secrets Setup

For automated deployment, add these secrets to your GitHub repository:

1. Go to **Repository Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

### Getting Cloudflare Credentials

1. **API Token**: Cloudflare dashboard → **My Profile** → **API Tokens** → **Create Token**
   - Use "Custom token" template
   - Permissions: `Zone:Read`, `Page:Edit`

2. **Account ID**: Cloudflare dashboard → Right sidebar → **Account ID**

## 🌟 Configured Domain

**Primary Domain**: `jwst.andernet.dev`

- ✅ Configured for this deployment
- ✅ SSL/TLS automatic provisioning
- ✅ Global CDN acceleration
- ✅ Security headers enabled

**Additional domain options** (if you want alternatives):

- `jwst-explorer.com` - Direct telescope reference
- `deepsky-explorer.com` - Emphasizes deep space exploration  
- `cosmic-timeline.com` - Highlights time-travel concept

## 📊 Performance Features

Your deployment includes:

- ⚡ **Cloudflare CDN**: Global edge caching
- 🔒 **SSL/TLS**: Automatic HTTPS certificates
- 🛡️ **DDoS Protection**: Built-in security
- 🚀 **HTTP/3 & Brotli**: Latest web standards
- 📱 **Mobile Optimization**: Responsive design
- 🔍 **SEO Ready**: Meta tags and structured data

## 🚨 Troubleshooting

### Build Fails

```bash
# Check locally first
npm run check-all
npm run build
```

### Domain Issues

- Ensure DNS propagation (can take up to 24 hours)
- Verify nameservers point to Cloudflare
- Check SSL/TLS settings in Cloudflare dashboard

### Performance Issues

- Enable **Rocket Loader** in Speed settings
- Configure **Polish** for image optimization
- Enable **Mirage** for mobile optimization

---

## 🎯 Next Steps

1. **Deploy**: Follow the setup guide above
2. **Domain**: Choose and configure your custom domain
3. **Monitor**: Set up analytics and performance monitoring
4. **Optimize**: Enable Cloudflare performance features
5. **Share**: Your JWST Deep Sky Explorer is live! 🔭✨

**Live URL**: `https://jwst.andernet.dev`  
**Fallback URL**: `https://jwst-deep-sky-explorer.pages.dev`
