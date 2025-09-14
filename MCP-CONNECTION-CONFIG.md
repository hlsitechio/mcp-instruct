# 🔗 MCP Instruct Connection Configuration

## 📋 Your Deployment Details

- **Project ID**: `50e72970-27ba-4525-9a3f-dce5d5e8acbd`
- **Site URL**: `https://superb-trifle-6be3cb.netlify.app`
- **Function Endpoint**: `https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge`

## 🔧 Connection Configurations

### For Warp Terminal MCP

Add to your Warp MCP configuration (`C:\Users\hlaro\AppData\Roaming\Warp\mcp\mcp.json`):

```json
{
  "mcpServers": {
    "mcp-instruct": {
      "url": "https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge",
      "description": "Personal Knowledge Base MCP Server with AI Agent Personas",
      "env": {
        "MCP_API_KEY": "your_api_key_here",
        "PROJECT_ID": "50e72970-27ba-4525-9a3f-dce5d5e8acbd"
      }
    }
  }
}
```

### For ChatGPT Desktop MCP

```json
{
  "mcp-instruct": {
    "url": "https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge",
    "project_id": "50e72970-27ba-4525-9a3f-dce5d5e8acbd",
    "headers": {
      "Authorization": "Bearer YOUR_API_KEY"
    }
  }
}
```

### For API Direct Access

Using the project ID in API calls:

```bash
# Health Check
curl -X GET \
  -H "X-Project-ID: 50e72970-27ba-4525-9a3f-dce5d5e8acbd" \
  https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge/health

# With Authentication
curl -X GET \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Project-ID: 50e72970-27ba-4525-9a3f-dce5d5e8acbd" \
  https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge/agents
```

### For Netlify CLI Access

```bash
# Using project ID directly
netlify api getSite --data '{"site_id": "50e72970-27ba-4525-9a3f-dce5d5e8acbd"}'

# Link to project by ID
netlify link --id 50e72970-27ba-4525-9a3f-dce5d5e8acbd

# Deploy to specific project
netlify deploy --prod --site 50e72970-27ba-4525-9a3f-dce5d5e8acbd
```

## 🎯 Test Your Connection

### 1. Quick Health Test
```powershell
# PowerShell
Invoke-RestMethod -Uri "https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge/health" -Method GET
```

### 2. Test with Auth
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "X-Project-ID" = "50e72970-27ba-4525-9a3f-dce5d5e8acbd"
}
Invoke-RestMethod -Uri "https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge/agents" -Headers $headers
```

## 🚀 ChatGPT Integration

### Custom GPT Configuration

When creating a Custom GPT, use these settings:

**Name**: MCP Instruct Assistant
**Description**: Personal Knowledge Base with AI Agent Personas

**Instructions**:
```
You are connected to the MCP Instruct server (Project ID: 50e72970-27ba-4525-9a3f-dce5d5e8acbd).

Available commands:
- "mcp-instruct-onboarding" - Start user onboarding
- "switch:it-expert" - Switch to IT Expert mode
- "switch:ethical-hacker" - Switch to Ethical Hacker mode
- "switch:sales" - Switch to Sales Expert mode

Always include the Project ID in your requests for consistency.
```

**Actions Configuration**:
```yaml
openapi: 3.0.0
info:
  title: MCP Instruct API
  version: 1.0.0
  x-project-id: 50e72970-27ba-4525-9a3f-dce5d5e8acbd
servers:
  - url: https://superb-trifle-6be3cb.netlify.app/.netlify/functions/mcp-bridge
    description: MCP Instruct Server (Project 50e72970-27ba-4525-9a3f-dce5d5e8acbd)
paths:
  /health:
    get:
      operationId: checkHealth
      summary: Health check
      parameters:
        - name: X-Project-ID
          in: header
          schema:
            type: string
            default: "50e72970-27ba-4525-9a3f-dce5d5e8acbd"
      responses:
        '200':
          description: Server healthy
  /chat:
    post:
      operationId: chat
      summary: Chat with MCP
      parameters:
        - name: X-Project-ID
          in: header
          schema:
            type: string
            default: "50e72970-27ba-4525-9a3f-dce5d5e8acbd"
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
          description: Success
  /agents:
    get:
      operationId: listAgents
      summary: List available agents
      parameters:
        - name: X-Project-ID
          in: header
          schema:
            type: string
            default: "50e72970-27ba-4525-9a3f-dce5d5e8acbd"
      responses:
        '200':
          description: List of agents
  /agents/switch:
    post:
      operationId: switchAgent
      summary: Switch active agent
      parameters:
        - name: X-Project-ID
          in: header
          schema:
            type: string
            default: "50e72970-27ba-4525-9a3f-dce5d5e8acbd"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                agent:
                  type: string
                  enum: [default, it-expert, ethical-hacker, sales]
      responses:
        '200':
          description: Agent switched
```

## 🔐 Environment Variables

Remember to set in Netlify dashboard:
- **Key**: `MCP_API_KEY`
- **Value**: Generate a secure key (e.g., `mcp_50e72970_secure_key_here`)

## 📊 Monitor Your Project

Direct links using your Project ID:
- **Dashboard**: https://app.netlify.com/sites/superb-trifle-6be3cb
- **Functions**: https://app.netlify.com/sites/superb-trifle-6be3cb/functions
- **Logs**: https://app.netlify.com/sites/superb-trifle-6be3cb/logs
- **Environment**: https://app.netlify.com/sites/superb-trifle-6be3cb/configuration/env

## ✅ Benefits of Using Project ID

1. **Stable Reference**: Won't change even if domain changes
2. **Direct API Access**: Can use Netlify API directly
3. **Consistent Tracking**: Easy to track across different environments
4. **Audit Trail**: Clear project identification in logs

---

**Your Project ID**: `50e72970-27ba-4525-9a3f-dce5d5e8acbd`
**Ready for connection!** 🚀