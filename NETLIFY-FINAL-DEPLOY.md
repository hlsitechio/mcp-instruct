# 🚀 Netlify Final Deployment - MCP Instruct

## ✅ Your Site is Live!
- **URL**: https://superb-trifle-6be3cb.netlify.app
- **Project ID**: 50e72970-27ba-4525-9a3f-dce5d5e8acbd

## 📦 New Deployment Package Ready
**File**: `netlify-final.zip`

This package has the CORRECT structure for Netlify:
```
/
├── index.html          (landing page)
└── functions/
    └── mcp-bridge.js   (serverless function)
```

## 🔄 Re-deploy with Correct Structure

1. **Go to Netlify Dashboard**
   - https://app.netlify.com/sites/superb-trifle-6be3cb/deploys

2. **Deploy the New Package**
   - Drag and drop `netlify-final.zip`
   - Wait for "Published" status

3. **Set Environment Variable**
   - Go to: Site configuration → Environment variables
   - Add: `MCP_API_KEY = mcp_your_secure_key`
   - Click Deploy → Trigger deploy → Deploy site

## 🧪 Test Your Endpoints

After deployment, test these:

### 1. Landing Page:
```
https://superb-trifle-6be3cb.netlify.app/
```

### 2. Health Check (No Auth):
```bash
curl https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge
```

If you get HTML (404), the function isn't deployed yet.

### 3. Health Endpoint:
```bash
curl -X GET https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge/health
```

### 4. With Authentication:
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_API_KEY" \
  https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge/agents
```

## 🔗 ChatGPT Desktop Configuration

### For Warp MCP:
```json
{
  "mcpServers": {
    "mcp-instruct": {
      "url": "https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge",
      "env": {
        "MCP_API_KEY": "your_api_key"
      }
    }
  }
}
```

### For ChatGPT Custom GPT:
1. Create new Custom GPT
2. Add Action:
   - **Server URL**: `https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge`
   - **Auth Type**: API Key
   - **Auth Header**: `Authorization: Bearer YOUR_KEY`

3. OpenAPI Schema:
```yaml
openapi: 3.0.0
info:
  title: MCP Instruct API
  version: 1.0.0
servers:
  - url: https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge
paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: Server healthy
  /chat:
    post:
      summary: Chat endpoint
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                command:
                  type: string
      responses:
        '200':
          description: Chat response
  /agents:
    get:
      summary: List agents
      responses:
        '200':
          description: Available agents
  /agents/switch:
    post:
      summary: Switch agent
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                agent:
                  type: string
      responses:
        '200':
          description: Agent switched
```

## 🎯 Quick Test Commands

Once connected to ChatGPT:

1. **Start Onboarding**:
   ```
   mcp-instruct-onboarding
   ```

2. **Switch to IT Expert**:
   ```
   switch:it-expert
   ```

3. **Switch to Ethical Hacker**:
   ```
   switch:ethical-hacker
   ```

## ✨ Troubleshooting

### If Functions Still Don't Work:

1. **Check Functions Tab**
   - Go to: https://app.netlify.com/sites/superb-trifle-6be3cb/functions
   - Should show `mcp-bridge` function

2. **Check Logs**
   - Functions tab → `mcp-bridge` → View logs

3. **Verify Environment Variable**
   - Site configuration → Environment variables
   - Ensure `MCP_API_KEY` is set

4. **Clear Cache & Redeploy**
   - Deploy the `netlify-final.zip` again
   - Wait 2-3 minutes for propagation

## 📊 Success Indicators

✅ Landing page loads
✅ `/health` returns JSON (not HTML 404)
✅ Functions tab shows `mcp-bridge`
✅ ChatGPT can connect with API key

---

**Your HTTPS MCP Server**: `https://superb-trifle-6be3cb.netlify.app`