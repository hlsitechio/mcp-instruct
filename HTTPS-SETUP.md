# HTTPS Setup for MCP Instruct

## 🌐 Option 1: Ngrok (Quick & Easy)

### Setup
```bash
# Install dependencies
npm install

# Start HTTPS bridge
npm run https
```

This will:
1. Start the HTTP bridge on port 3000
2. Create an HTTPS tunnel via ngrok
3. Display a URL like: `https://abc123.ngrok.io`
4. Save the URL to `current-mcp-url.txt`

### Use in ChatGPT Desktop
Copy the HTTPS URL and paste it in the "URL du serveur MCP" field.

---

## 🔒 Option 2: Cloudflare Tunnel (Free & Permanent)

### One-time Setup
1. Install Cloudflare Tunnel:
```bash
# Windows (winget)
winget install Cloudflare.cloudflared

# Or download from:
# https://github.com/cloudflare/cloudflared/releases
```

2. Authenticate:
```bash
cloudflared tunnel login
```

3. Create a tunnel:
```bash
cloudflared tunnel create mcp-instruct
```

4. Create config file `~/.cloudflared/config.yml`:
```yaml
tunnel: mcp-instruct
credentials-file: C:\Users\hlaro\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: mcp-instruct.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

5. Route the tunnel:
```bash
cloudflared tunnel route dns mcp-instruct mcp-instruct.yourdomain.com
```

6. Start the tunnel:
```bash
# Terminal 1: Start HTTP bridge
npm run bridge

# Terminal 2: Start Cloudflare tunnel
cloudflared tunnel run mcp-instruct
```

Your MCP URL will be: `https://mcp-instruct.yourdomain.com`

---

## 🚀 Option 3: GitHub Pages + Web Worker (Serverless)

### Setup
1. Fork/create a GitHub repo
2. Enable GitHub Pages
3. Deploy a service worker that proxies to your local bridge

This approach requires additional setup but provides a permanent URL.

---

## 🌍 Option 4: Replit/Glitch (Free Hosting)

### Replit Setup
1. Create new Repl: https://replit.com
2. Import this project
3. Run the HTTP bridge
4. Get URL like: `https://mcp-instruct.username.repl.co`

### Glitch Setup
1. Create new project: https://glitch.com
2. Import from GitHub
3. Your URL: `https://mcp-instruct.glitch.me`

---

## 🔧 Quick Start Commands

### For temporary HTTPS (ngrok):
```bash
npm run deploy
```

### For local HTTP only:
```bash
npm run bridge
# Use: http://localhost:3000
```

### For development:
```bash
npm run dev
```

---

## 📝 ChatGPT Desktop Configuration

Once you have your HTTPS URL:

1. Open ChatGPT Desktop
2. Click "Nouveau connecteur"
3. Fill in:
   - **Nom**: MCP Instruct
   - **URL du serveur MCP**: `https://your-url-here`
   - **Authentification**: OAuth (default)
4. Check "Je fais confiance à cette application"
5. Click "Créer"

---

## 🔑 API Key (for HTTP Bridge)

The HTTP bridge generates an API key on startup. Look for:
```
🔑 Default API Key: mcp_xxxxxxxxxxxxx
```

Save this key for ChatGPT configuration if needed.