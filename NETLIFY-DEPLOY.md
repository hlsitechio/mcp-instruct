# 🚀 Netlify Deployment Guide for MCP Instruct

## ✅ Why Netlify?

- **Free tier** with 100GB bandwidth/month
- **Automatic HTTPS** with SSL certificate
- **Serverless Functions** included
- **Custom domain** support (free)
- **GitHub integration** for auto-deploy
- **Permanent URL**: `https://your-app.netlify.app`

## 📋 Prerequisites

1. GitHub account
2. Netlify account (free at netlify.com)
3. Your MCP Instruct project

## 🔧 Step 1: Prepare Your Project

```bash
# In your project directory
cd G:\master_it\mcp-instruct

# Install Netlify CLI (optional but recommended)
npm install -g netlify-cli

# Install project dependencies
npm install

# Add Netlify Functions dependency
npm install --save-dev @netlify/functions
```

## 📦 Step 2: Update package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build:netlify": "tsc --outDir netlify/functions",
    "deploy": "netlify deploy --prod",
    "deploy:preview": "netlify deploy"
  }
}
```

## 🌐 Step 3: Deploy to Netlify

### Option A: Via Netlify CLI (Recommended)

```bash
# Login to Netlify
netlify login

# Initialize Netlify in your project
netlify init

# When prompted:
# - Create & configure a new site
# - Team: Your team name
# - Site name: mcp-instruct-[yourname]

# Deploy to production
netlify deploy --prod

# Your URL will be: https://mcp-instruct-yourname.netlify.app
```

### Option B: Via GitHub

1. Push your project to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/mcp-instruct.git
git push -u origin main
```

2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select your repo
5. Configure build settings:
   - Build command: `npm run build:netlify`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
6. Click "Deploy site"

## 🔐 Step 4: Set Environment Variables

1. Go to your Netlify dashboard
2. Site settings → Environment variables
3. Add:
   ```
   MCP_API_KEY = mcp_your_secure_key_here
   ```

## 🎯 Step 5: Test Your Deployment

```bash
# Test health endpoint
curl https://your-app.netlify.app/health

# Test with API key
curl -H "Authorization: Bearer mcp_your_secure_key_here" \
     https://your-app.netlify.app/agents
```

## 🔗 Step 6: Connect to ChatGPT

Use your Netlify URL in ChatGPT Desktop:

1. Open ChatGPT Desktop
2. Add new MCP connector
3. Enter URL: `https://your-app.netlify.app`
4. API Key: Your `MCP_API_KEY` value

## 📊 Monitoring

View function logs in Netlify dashboard:
- Functions tab → View logs
- See execution time, errors, and usage

## 🆓 Free Tier Limits

- **100GB** bandwidth/month
- **300 build minutes**/month
- **125,000** function requests/month
- **100 hours** function run time/month

## 🚨 Troubleshooting

### Function not working?
```bash
# Test locally first
netlify dev

# Check function logs
netlify functions:log mcp-bridge
```

### Build failing?
```bash
# Clear cache and redeploy
netlify deploy --prod --clear
```

### CORS issues?
Already configured in `netlify.toml`

## 🎉 Success!

Your MCP server is now live at:
```
https://your-app.netlify.app
```

## 🔄 Auto-Deploy from GitHub

Every push to `main` branch will auto-deploy!

```bash
git add .
git commit -m "Update MCP server"
git push
# Netlify auto-deploys in ~30 seconds
```

## 📝 Custom Domain (Optional)

1. Buy domain (or use existing)
2. Netlify dashboard → Domain settings
3. Add custom domain
4. Update DNS records
5. HTTPS automatically configured!

Your MCP URL becomes: `https://mcp.yourdomain.com`