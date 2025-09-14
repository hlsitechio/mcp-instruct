# ChatGPT Desktop MCP Setup Guide

## 🚀 Quick Setup

### Step 1: Build the MCP Server
```bash
cd G:\master_it\mcp-instruct
npm install
npm run build
```

### Step 2: Configure ChatGPT Desktop

1. Open ChatGPT Desktop
2. Click **"Nouveau connecteur"** (New Connector)
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Nom** | MCP Instruct |
| **Description** | Personal Knowledge Base & AI Agent Manager |
| **URL du serveur MCP** | `file://G:/master_it/mcp-instruct` |
| **Authentification** | None (keep OAuth unchecked) |

4. Check ✅ **"Je fais confiance à cette application"**
5. Click **"Créer"**

### Step 3: First Connection

When ChatGPT Desktop connects, it will have access to these tools:
- `mcp_instruct_onboarding` - Start setup
- `agent_list` - View available agents
- `agent_activate` - Activate an agent
- `kb_get_context` - Get your saved context

## 📝 Usage Examples

### First Time Setup
```
You: "Run mcp_instruct_onboarding to start"

ChatGPT will:
1. Check if you're new or returning
2. Guide you through profile setup
3. Suggest an appropriate AI agent
4. Save everything persistently
```

### Switch AI Agents
```
You: "Switch to IT Expert mode"
ChatGPT: Uses agent_activate with "it-expert"

You: "I need help with security"
ChatGPT: Suggests and activates "ethical-hacker" or "blue-team"

You: "Quick switch to red team"
ChatGPT: Uses agent_switch_quick with "red"
```

### Available Agents
- **it-expert** - IT Professional (PowerShell, System Admin, Cloud)
- **ethical-hacker** - Security Expert (Nmap, Metasploit, Burp Suite)
- **sales-expert** - Sales Professional (CRM, Negotiation, B2B)
- **blue-team** - Defensive Security (SIEM, Threat Hunting, IR)
- **red-team** - Offensive Security (Penetration Testing, C2)
- **purple-team** - Collaborative Security (Detection Engineering)

## 🛠️ Tool Commands

### Onboarding
- `mcp_instruct_onboarding` with action="start" - Begin onboarding
- `mcp_instruct_onboarding` with action="check_status" - Check current status
- `mcp_instruct_onboarding` with action="quick_setup" and data - Quick setup

### Knowledge Base
- `kb_get_all` - Get all stored information
- `kb_update_personal` - Update personal info
- `kb_update_professional` - Update professional info
- `kb_get_context` - Get formatted context

### Agent Management
- `agent_list` - List all available agents
- `agent_activate` - Activate specific agent
- `agent_switch_quick` - Quick switch (it/hacker/sales/blue/red/purple)
- `agent_get_active` - Get current active agent
- `agent_get_tools` - Get tools for current agent

## 🔧 Troubleshooting

### If ChatGPT can't connect:
1. Ensure the server is built: `npm run build`
2. Check the path is correct: `G:\master_it\mcp-instruct`
3. Verify `dist/index.js` exists

### If tools don't appear:
1. Restart ChatGPT Desktop
2. Remove and re-add the connector
3. Check console for errors: `npm run dev`

### Data Location
Your profile is saved in: `C:\Users\hlaro\.mcp-personal-kb\default.json`

## 📚 Advanced Configuration

### Custom Agent Path
To add custom agents, create `.md` files in the `agents/` directory.

### Environment Variables
```bash
# Optional: Set custom data path
MCP_DATA_PATH=C:\custom\path

# Optional: Enable debug logging
MCP_DEBUG=true
```

### Direct Testing
Test the MCP server directly:
```bash
# Run in development mode
npm run dev

# Test specific tool
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"mcp_instruct_onboarding","arguments":{"action":"start"}},"id":1}' | node dist/index.js
```

## 🔐 Security Notes

1. **Local Only**: All data stored locally, no external connections
2. **No Authentication**: Designed for local use only
3. **File Access**: Only accesses its own data directory
4. **Tool Safety**: Agent tools require explicit execution

## 💡 Tips

1. **Quick Onboarding**: Say "mcp-instruct-onboarding" to start
2. **Natural Commands**: ChatGPT understands "switch to IT mode" naturally
3. **Persistent Memory**: Your profile persists across all sessions
4. **Agent Context**: Each agent has specialized knowledge and tools
5. **Custom Knowledge**: Add custom categories with `kb_add_custom`

## 📞 Support

If you encounter issues:
1. Check `npm run dev` for detailed logs
2. Verify all files are in place
3. Ensure ChatGPT Desktop is updated
4. Review the MCP Beta documentation

---

**Ready to start?** Just tell ChatGPT: "Run mcp_instruct_onboarding to begin!"