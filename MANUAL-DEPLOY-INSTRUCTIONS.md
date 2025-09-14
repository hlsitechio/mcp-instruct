# 🚀 MANUAL DEPLOYMENT INSTRUCTIONS FOR MCP INSTRUCT

## ✅ Your Clean Deployment Package is Ready!

File: **`mcp-deploy-final.zip`**

This ZIP contains ONLY:
- `index.html` (landing page)
- `netlify/functions/mcp-bridge.js` (serverless function)

## 📦 Deploy Now (Manual Upload)

1. **The Netlify Dashboard is Already Open**
   - If not, go to: https://app.netlify.com/projects/mcp-instruct

2. **Upload Your Package**
   - Click on the **"Deploys"** tab
   - You'll see a drag-and-drop area
   - **Drag `mcp-deploy-final.zip`** onto the browser window
   - Or click "Upload" and select `mcp-deploy-final.zip`

3. **Wait for Deployment**
   - Should take about 15-30 seconds
   - You'll see "Published" when complete

## 🔧 IMPORTANT: Set Environment Variable

After deployment succeeds:

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Add:
   - Key: `MCP_API_KEY`
   - Value: `mcp_your_secure_key_here` (or generate a new one)
4. Click **Save**

## 🎯 Test Your Deployment

Once deployed, test these URLs:

### 1. Landing Page (should work immediately):
```
https://mcp-instruct.netlify.app
```

### 2. Health Check (no auth required for testing):
```bash
curl https://mcp-instruct.netlify.app/.netlify/functions/mcp-bridge/health
```

Expected response:
```json
{"status":"healthy","version":"1.0.0"}
```

### 3. With Authentication:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://mcp-instruct.netlify.app/.netlify/functions/mcp-bridge/agents
```

## 💬 Connect to ChatGPT Desktop

Once deployed and tested:

### MCP Configuration:
```json
{
  "mcp-instruct": {
    "url": "https://mcp-instruct.netlify.app/.netlify/functions/mcp-bridge",
    "env": {
      "MCP_API_KEY": "your_api_key_here"
    }
  }
}
```

### Test Commands in ChatGPT:
- `mcp-instruct-onboarding` - Start onboarding
- `switch:it-expert` - Switch to IT Expert mode
- `switch:ethical-hacker` - Switch to Hacker mode

## ✨ What's Included

The deployment package contains:

### Landing Page (`index.html`)
- Beautiful UI showing your MCP server is running
- API endpoint documentation
- Copy-paste ready URLs
- Test commands

### Serverless Function (`mcp-bridge.js`)
Clean, compiled JavaScript with:
- ✅ No TypeScript errors
- ✅ Proper Netlify function format
- ✅ CORS headers configured
- ✅ Bearer token authentication
- ✅ All endpoints working

### Endpoints Available:
- `GET /health` - Health check
- `POST /chat` - Main chat endpoint
- `POST /onboard` - User onboarding
- `GET /agents` - List available agents
- `POST /agents/switch` - Switch active agent
- `GET /knowledge` - Get knowledge base
- `PUT /knowledge` - Update knowledge

## 🎉 Success Indicators

You'll know it worked when:
1. ✅ Netlify shows "Published" status
2. ✅ Landing page loads at https://mcp-instruct.netlify.app
3. ✅ Health check returns `{"status":"healthy","version":"1.0.0"}`
4. ✅ ChatGPT can connect with your API key

## 🔍 If Something Goes Wrong

### "Function names invalid" error:
- Already fixed! The clean package only has `mcp-bridge.js`

### "404 Not Found":
- Make sure you uploaded `mcp-deploy-final.zip` (not the old one)
- Check that deployment shows "Published"

### Authentication fails:
- Verify you set `MCP_API_KEY` in Environment variables
- Make sure you're using "Bearer YOUR_KEY" format

## 📊 Monitor Your Function

After deployment:
- Go to **Functions** tab in Netlify
- Click on `mcp-bridge`
- View logs and invocations

---

**Ready to Deploy!** 🚀

Just drag `mcp-deploy-final.zip` to your Netlify dashboard!