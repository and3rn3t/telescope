# Custom Domain Configuration for webb.andernet.dev

## 🌐 Domain Setup Steps

### 1. **DNS Configuration**

Since you're using `webb.andernet.dev` (subdomain of `andernet.dev`), you'll need to configure DNS records:

**Add these DNS records in your DNS provider:**

```
Type: CNAME
Name: webb
Value: jwst-deep-sky-explorer.pages.dev
Proxy: Enabled (orange cloud in Cloudflare)
```

### 2. **Cloudflare Pages Custom Domain Setup**

1. Go to **Cloudflare Dashboard** → **Pages** → **jwst-deep-sky-explorer**
2. Navigate to **Custom domains** tab
3. Click **"Set up a custom domain"**
4. Enter: `webb.andernet.dev`
5. Cloudflare will automatically provision SSL certificate

### 3. **Verification**

After DNS propagation (5-60 minutes), verify:

- ✅ `https://webb.andernet.dev` loads your application
- ✅ SSL certificate is active (green lock icon)
- ✅ Redirects from HTTP to HTTPS work automatically

## 🔧 **Configuration Details**

### **Primary Domain:** `webb.andernet.dev`

- **SSL/TLS:** Automatic (Let's Encrypt)
- **CDN:** Cloudflare Global Network  
- **HTTP/2 & HTTP/3:** Enabled
- **Brotli Compression:** Enabled

### **Fallback Domain:** `jwst-deep-sky-explorer.pages.dev`

- **Purpose:** Preview deployments and fallback
- **Always Available:** Yes, even during DNS changes

## 🚀 **Deployment URLs**

### **Production**

- **Custom Domain:** <https://webb.andernet.dev>
- **Cloudflare Pages:** <https://jwst-deep-sky-explorer.pages.dev>

### **Preview Deployments**

- **Pull Requests:** https://[commit-hash].jwst-deep-sky-explorer.pages.dev
- **Branch Previews:** https://[branch-name].jwst-deep-sky-explorer.pages.dev

## 🔐 **Security Features**

All configured automatically for `webb.andernet.dev`:

- **HTTPS Enforcement:** HTTP → HTTPS redirects
- **HSTS Headers:** Strict Transport Security
- **Security Headers:** CSP, XSS Protection, Frame Options
- **DDoS Protection:** Cloudflare's enterprise-grade protection

## 📊 **Performance Optimizations**

Enabled for your custom domain:

- **Global CDN:** 320+ edge locations worldwide
- **Smart Routing:** Optimal path selection
- **Image Optimization:** Automatic WebP conversion
- **Minification:** CSS, JS, and HTML compression
- **Caching:** 1-year cache for assets, fresh HTML

## 🔍 **Monitoring & Analytics**

Available in Cloudflare Dashboard:

- **Real User Monitoring (RUM):** Performance metrics
- **Web Analytics:** Visitor statistics (privacy-friendly)
- **Security Analytics:** Threat detection and blocking
- **Core Web Vitals:** Google SEO metrics

---

## 🎯 **Quick Setup Checklist**

- [ ] Add CNAME record: `webb → jwst-deep-sky-explorer.pages.dev`
- [ ] Enable Cloudflare proxy (orange cloud)
- [ ] Configure custom domain in Cloudflare Pages
- [ ] Wait for SSL certificate provisioning (5-10 minutes)
- [ ] Test: `https://webb.andernet.dev`
- [ ] Verify security headers and performance
- [ ] Set up monitoring and analytics

**Result:** Your JWST Deep Sky Explorer will be live at `https://webb.andernet.dev` with enterprise-grade performance and security! 🔭✨
