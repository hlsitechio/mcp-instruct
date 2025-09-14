# MCP Instruct - Personal Knowledge Base with AI Agent Personas

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/hlsitechio/mcp-instruct)

A sophisticated MCP (Model Context Protocol) server that provides persistent personal and organizational knowledge across AI agents. This server acts as a memory layer that any LLM can connect to, instantly giving them context about who you are, what you do, and your preferences.

## 🌟 Features

- **Persistent Knowledge Storage**: Information persists across sessions and can be shared between different AI agents
- **Structured Data Categories**:
  - Personal Information (name, location, languages, etc.)
  - Professional Background (job, skills, experience)
  - Preferences (communication style, technical level)
  - Project Context (current projects, technologies, goals)
  - Custom Knowledge (any category you want)
- **JSON-Based Forms**: Quick and structured data collection
- **Semantic Search**: Find information using natural language queries
- **History Tracking**: Keep track of all changes to your knowledge base
- **Export/Import**: Backup and share your knowledge base

## 📦 Installation

1. Clone or download this repository
2. Install dependencies:
```bash
cd mcp-instruct
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## 🚀 Usage

### Adding to Claude Desktop

Add this to your Claude Desktop configuration file (`%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "personal-kb": {
      "command": "node",
      "args": ["G:\\master_it\\mcp-instruct\\dist\\index.js"]
    }
  }
}
```

### Adding to Other AI Agents

For other AI agents that support MCP, add similar configuration pointing to the built server file.

## 🛠️ Available Tools

### Setup & Onboarding

- **`kb_initialize`**: Check knowledge base status and initialize
- **`kb_onboard`**: Start interactive onboarding with questions
- **`kb_quick_setup`**: Quick setup using predefined forms (identity, technical, organization)
- **`kb_list_forms`**: List all available forms and their structures

### Information Management

- **`kb_update_personal`**: Update personal information
- **`kb_update_professional`**: Update professional information
- **`kb_update_preferences`**: Update communication preferences
- **`kb_update_projects`**: Update project context
- **`kb_add_custom`**: Add custom knowledge to any category
- **`kb_remove_custom`**: Remove custom knowledge

### Retrieval Commands

- **`kb_get_all`**: Get complete knowledge base (formats: full, summary, categories)
- **`kb_get_personal`**: Get personal information
- **`kb_get_professional`**: Get professional information
- **`kb_get_preferences`**: Get preferences
- **`kb_get_projects`**: Get project context
- **`kb_get_custom`**: Get custom knowledge by category
- **`kb_search`**: Search using natural language
- **`kb_get_context`**: Get AI-ready formatted context string

### Management

- **`kb_get_history`**: View recent changes
- **`kb_export`**: Export knowledge base as JSON
- **`kb_import`**: Import knowledge base from JSON

## 💡 Example Usage

### First Time Setup

1. Initialize the knowledge base:
```
kb_initialize
```

2. Start onboarding:
```
kb_onboard category="all"
```

3. Or use quick setup:
```
kb_quick_setup formType="identity" data={
  "name": "Hubert",
  "occupation": "IT Professional",
  "location": "Montreal, Canada",
  "languages": "English, French"
}
```

### Updating Information

```
kb_update_personal {
  "name": "Hubert",
  "birthYear": 1987,
  "currentLocation": "Montreal, Canada",
  "languages": ["English", "French"]
}

kb_update_professional {
  "occupation": "IT Professional",
  "yearsOfExperience": 15,
  "specializations": ["System Administration", "Security", "Automation"],
  "skills": ["PowerShell", "Python", "Network Security", "Cloud Infrastructure"]
}

kb_update_preferences {
  "communicationStyle": "technical",
  "responseDetail": "detailed",
  "technicalLevel": "expert"
}
```

### Adding Custom Knowledge

```
kb_add_custom category="tools" key="favorite_editor" value="VS Code" tags=["development", "tools"]

kb_add_custom category="workflows" key="daily_routine" value={
  "morning": "Check emails and tickets",
  "afternoon": "Project work",
  "evening": "Documentation"
}
```

### Retrieving Information

```
# Get everything
kb_get_all format="full"

# Get summary
kb_get_all format="summary"

# Search for specific info
kb_search query="programming languages"

# Get AI-ready context
kb_get_context categories=["personal", "professional"]
```

## 📁 Data Storage

Your knowledge base is stored in:
- Windows: `C:\Users\[username]\.mcp-personal-kb\default.json`
- Mac/Linux: `~/.mcp-personal-kb/default.json`

## 🔒 Privacy

- All data is stored locally on your machine
- No data is sent to external servers
- You have full control over your information
- Can export/import for backup or sharing

## 🤝 How It Works

When an AI agent connects to this MCP server, it can:
1. Check if you have an existing profile
2. Ask questions to build your knowledge base (if new)
3. Retrieve your information to provide personalized responses
4. Update information as you work together
5. Search for specific information when needed

The knowledge persists between sessions, so you don't have to re-introduce yourself every time you start a new conversation.

## 📊 Knowledge Structure

```json
{
  "personal": {
    "name": "Your Name",
    "currentLocation": "City, Country",
    "languages": ["Language1", "Language2"]
  },
  "professional": {
    "occupation": "Your Job",
    "yearsOfExperience": 15,
    "skills": ["Skill1", "Skill2"]
  },
  "preferences": {
    "communicationStyle": "technical",
    "technicalLevel": "expert"
  },
  "projects": {
    "currentProjects": ["Project1", "Project2"],
    "technologies": ["Tech1", "Tech2"]
  },
  "custom": [
    {
      "category": "tools",
      "key": "favorite_ide",
      "value": "VS Code"
    }
  ]
}
```

## 🎯 Use Cases

- **Personal Assistant**: Give any AI agent instant context about you
- **Team Knowledge**: Share organizational knowledge across team AI tools
- **Project Context**: Maintain project-specific information
- **Learning Profile**: Store your learning preferences and progress
- **Tool Preferences**: Remember your favorite tools and workflows

## 📝 License

MIT

## 👤 Author

Hubert - IT Professional with 15+ years of experience

---

Built with ❤️ to give AI agents long-term memory about you!