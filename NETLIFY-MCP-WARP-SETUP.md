# 🚀 Netlify MCP Server Setup for Warp Terminal

## ✅ Installation Complete!

The Netlify MCP Server has been successfully installed and configured for your Warp terminal.

## 📦 Installed Components

```bash
# Global packages installed:
netlify-cli@23.5.1    # Netlify CLI
@netlify/mcp          # Netlify MCP Server
```

## 🔧 Configuration

### MCP Config Location
`C:\Users\hlaro\AppData\Roaming\Warp\mcp\mcp.json`

### Configuration Content
```json
{
  "mcpServers": {
    "netlify": {
      "command": "npx",
      "args": ["-y", "@netlify/mcp"],
      "description": "Build, deploy, and manage sites with Netlify's official MCP server"
    }
  }
}
```

## 👤 Authentication Status

- **User**: Hubert Larose Surprenant
- **Email**: hlarosesurprenant@gmail.com
- **Team**: hlsitech
- **Status**: ✅ Authenticated

## 🎯 Available Features

With the Netlify MCP Server in Warp, you can now:

1. **Project Management**
   - Create new Netlify projects
   - Deploy sites from local directories
   - Manage existing projects

2. **Build & Deploy**
   - Trigger builds
   - Deploy to production or preview branches
   - Manage deploy settings

3. **Configuration**
   - Set environment variables
   - Manage build settings
   - Configure site domains

4. **Extensions**
   - Install/uninstall Netlify extensions
   - Configure form submissions
   - Set up serverless functions

5. **Security**
   - Modify access controls
   - Manage API tokens
   - Configure authentication

## 🚦 How to Use in Warp

1. **Restart Warp** to load the new MCP configuration
2. In Warp, you'll see Netlify MCP in your available tools
3. Use natural language to interact with Netlify:
   - "Deploy my current project to Netlify"
   - "Create a new Netlify site"
   - "Show my Netlify sites"
   - "Set environment variable API_KEY on my-site"

## 📝 Common Commands

```bash
# Check authentication
netlify status

# Link current directory to a Netlify site
netlify link

# Deploy current directory
netlify deploy

# Deploy to production
netlify deploy --prod

# Open Netlify dashboard
netlify open

# View site info
netlify sites:list

# Create new site
netlify sites:create

# Set environment variable
netlify env:set VAR_NAME value
```

## 🔐 Personal Access Token (If Needed)

If you encounter authentication issues, create a PAT:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Navigate to: User settings → OAuth → New access token
3. Add to your MCP config temporarily:

```json
{
  "mcpServers": {
    "netlify": {
      "command": "npx",
      "args": ["-y", "@netlify/mcp"],
      "env": {
        "NETLIFY_PERSONAL_ACCESS_TOKEN": "YOUR-PAT-HERE"
      }
    }
  }
}
```

⚠️ **Important**: Remove the PAT from config once authentication is working!

## 🧪 Test the Setup

```bash
# Test Netlify CLI
netlify --version

# Test authentication
netlify status

# List your sites
netlify sites:list
```

## 🔗 Resources

- [Netlify MCP GitHub](https://github.com/netlify/netlify-mcp)
- [Netlify Documentation](https://docs.netlify.com)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Warp Terminal](https://www.warp.dev)

## ✨ Next Steps

1. **Restart Warp** to activate the MCP server
2. **Try a command** like "Show my Netlify sites"
3. **Deploy your mcp-instruct project** to Netlify!

---

**Setup completed**: 2025-09-14
**Configuration saved**: `C:\Users\hlaro\AppData\Roaming\Warp\mcp\mcp.json`