import express from 'express';
import cors from 'cors';
import { createHash, randomBytes } from 'crypto';
import { KnowledgeManager } from './KnowledgeManager.js';
import { AgentManager } from './AgentManager.js';
import { getAgentTools, executeTool, isToolAvailable } from './agent-tools.js';
import { join } from 'path';

const app = express();
const PORT = process.env.MCP_BRIDGE_PORT || 3000;

// Simple API key authentication
const API_KEYS = new Map<string, { name: string; created: Date; lastUsed: Date }>();

// Initialize managers
const km = new KnowledgeManager();
const am = new AgentManager(join(process.cwd(), 'agents'));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Key generation utility
function generateApiKey(): string {
  return `mcp_${randomBytes(32).toString('hex')}`;
}

// Authentication middleware
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  if (!API_KEYS.has(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  // Update last used
  const keyData = API_KEYS.get(apiKey)!;
  keyData.lastUsed = new Date();
  API_KEYS.set(apiKey, keyData);
  
  req.headers['client-name'] = keyData.name;
  next();
}

// Initialize on startup
async function initialize() {
  await km.initialize();
  await am.initialize();
  
  // Create default API key for testing
  const defaultKey = generateApiKey();
  API_KEYS.set(defaultKey, {
    name: 'default',
    created: new Date(),
    lastUsed: new Date()
  });
  
  console.log(`🔑 Default API Key: ${defaultKey}`);
  console.log('Save this key - it won\'t be shown again!');
}

// ============ ENDPOINTS ============

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'MCP Personal Knowledge Base Bridge',
    version: '1.0.0'
  });
});

// Generate new API key
app.post('/auth/generate-key', authenticate, (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name required for API key' });
  }
  
  const newKey = generateApiKey();
  API_KEYS.set(newKey, {
    name,
    created: new Date(),
    lastUsed: new Date()
  });
  
  res.json({ 
    apiKey: newKey,
    name,
    message: 'Save this key - it won\'t be shown again!'
  });
});

// ============ KNOWLEDGE BASE ENDPOINTS ============

// Initialize/check knowledge base
app.get('/kb/status', authenticate, async (req, res) => {
  const isNew = km.isNew();
  const kb = km.getKnowledgeBase();
  
  res.json({
    initialized: true,
    isNew,
    needsOnboarding: isNew,
    profile: {
      id: kb.id,
      hasPersonal: Object.keys(kb.personal).length > 0,
      hasProfessional: Object.keys(kb.professional).length > 0,
      hasPreferences: Object.keys(kb.preferences).length > 0,
      hasProjects: Object.keys(kb.projects).length > 0
    }
  });
});

// Get all knowledge
app.get('/kb/all', authenticate, async (req, res) => {
  const kb = km.getKnowledgeBase();
  res.json({
    personal: kb.personal,
    professional: kb.professional,
    preferences: kb.preferences,
    projects: kb.projects,
    custom: kb.custom
  });
});

// Update personal info
app.post('/kb/personal', authenticate, async (req, res) => {
  await km.updatePersonal(req.body);
  res.json({ success: true, message: 'Personal information updated' });
});

// Update professional info
app.post('/kb/professional', authenticate, async (req, res) => {
  await km.updateProfessional(req.body);
  res.json({ success: true, message: 'Professional information updated' });
});

// Update preferences
app.post('/kb/preferences', authenticate, async (req, res) => {
  await km.updatePreferences(req.body);
  res.json({ success: true, message: 'Preferences updated' });
});

// Update projects
app.post('/kb/projects', authenticate, async (req, res) => {
  await km.updateProjects(req.body);
  res.json({ success: true, message: 'Projects updated' });
});

// Add custom knowledge
app.post('/kb/custom', authenticate, async (req, res) => {
  const { category, key, value, tags } = req.body;
  await km.addCustomKnowledge(category, key, value, tags);
  res.json({ success: true, message: 'Custom knowledge added' });
});

// Search knowledge base
app.post('/kb/search', authenticate, async (req, res) => {
  const { query } = req.body;
  const results = km.search(query);
  res.json({ results });
});

// Get AI-ready context
app.get('/kb/context', authenticate, async (req, res) => {
  const kb = km.getKnowledgeBase();
  let context = {
    name: kb.personal.name,
    role: kb.professional.occupation,
    location: kb.personal.currentLocation,
    languages: kb.personal.languages,
    experience: kb.professional.yearsOfExperience,
    skills: kb.professional.skills,
    preferences: {
      communicationStyle: kb.preferences.communicationStyle,
      technicalLevel: kb.preferences.technicalLevel,
      responseDetail: kb.preferences.responseDetail
    }
  };
  res.json(context);
});

// ============ AGENT ENDPOINTS ============

// List all agents
app.get('/agents', authenticate, async (req, res) => {
  const agents = am.getTemplates();
  res.json({
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      category: a.metadata.category,
      role: a.metadata.role?.substring(0, 100) + '...'
    }))
  });
});

// Get active agent
app.get('/agents/active', authenticate, async (req, res) => {
  const active = am.getActiveAgent();
  if (!active) {
    return res.json({ active: null });
  }
  
  res.json({
    active: {
      id: active.id,
      name: active.name,
      category: active.metadata.category,
      role: active.metadata.role
    }
  });
});

// Activate an agent
app.post('/agents/activate/:agentId', authenticate, async (req, res) => {
  const { agentId } = req.params;
  const success = am.setActiveAgent(agentId);
  
  if (!success) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  const agent = am.getTemplate(agentId);
  const tools = getAgentTools(agentId);
  
  res.json({
    success: true,
    agent: {
      id: agent!.id,
      name: agent!.name,
      instructions: agent!.content,
      tools: tools?.defaultTools || []
    }
  });
});

// Quick switch agent
app.post('/agents/quick-switch', authenticate, async (req, res) => {
  const { type } = req.body;
  
  if (!['it', 'hacker', 'sales', 'blue', 'red', 'purple'].includes(type)) {
    return res.status(400).json({ error: 'Invalid agent type' });
  }
  
  const success = am.quickSwitch(type as any);
  
  if (!success) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  const active = am.getActiveAgent();
  res.json({
    success: true,
    agent: {
      id: active!.id,
      name: active!.name,
      category: active!.metadata.category
    }
  });
});

// Get agent instructions
app.get('/agents/:agentId/instructions', authenticate, async (req, res) => {
  const { agentId } = req.params;
  const instructions = am.getAgentInstructions(agentId);
  
  if (!instructions) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  res.json({ instructions });
});

// Get agent tools
app.get('/agents/:agentId/tools', authenticate, async (req, res) => {
  const { agentId } = req.params;
  const toolset = getAgentTools(agentId);
  
  if (!toolset) {
    return res.status(404).json({ error: 'Agent tools not found' });
  }
  
  const availableTools = toolset.tools.filter(isToolAvailable);
  
  res.json({
    agentId: toolset.agentId,
    tools: availableTools,
    defaultTools: toolset.defaultTools,
    restrictions: toolset.restrictions
  });
});

// Execute agent tool
app.post('/agents/:agentId/tools/:toolId/execute', authenticate, async (req, res) => {
  const { agentId, toolId } = req.params;
  const { args } = req.body;
  
  const toolset = getAgentTools(agentId);
  if (!toolset) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  const tool = toolset.tools.find(t => t.id === toolId);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }
  
  if (!isToolAvailable(tool)) {
    return res.status(400).json({ error: 'Tool not available on this platform' });
  }
  
  if (tool.requiresAuth && !req.body.authToken) {
    return res.status(401).json({ error: 'Tool requires authentication token' });
  }
  
  try {
    const result = await executeTool(tool, args || '');
    res.json({
      success: true,
      tool: tool.name,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Tool execution failed',
      message: error.message
    });
  }
});

// ============ ONBOARDING ENDPOINTS ============

// Intelligent onboarding endpoint
app.post('/onboard', authenticate, async (req, res) => {
  const { clientType = 'chatgpt', sessionId } = req.body;
  
  const isNew = km.isNew();
  const kb = km.getKnowledgeBase();
  const activeAgent = am.getActiveAgent();
  
  if (isNew) {
    // New user onboarding
    res.json({
      status: 'new_user',
      isNew: true,
      message: '🎉 Welcome to MCP Instruct! First time setup required.',
      instructions: [
        'I see this is your first time connecting to MCP Instruct.',
        'I can help you set up your personal knowledge base and AI agent modes.',
        'This will allow me to remember who you are across all conversations.'
      ],
      options: [
        {
          id: 'personal_profile',
          emoji: '📝',
          title: 'Personal Profile',
          description: 'Set up your identity so I remember who you are',
          action: 'setup_personal'
        },
        {
          id: 'ai_agent',
          emoji: '🤖',
          title: 'AI Agent Mode',
          description: 'Activate specialized expertise (IT, Security, Sales)',
          action: 'choose_agent'
        },
        {
          id: 'quick_setup',
          emoji: '🎯',
          title: 'Quick Setup',
          description: 'Minimal configuration to get started fast',
          action: 'quick_setup'
        },
        {
          id: 'custom_setup',
          emoji: '🔧',
          title: 'Custom Setup',
          description: 'Full configuration with all options',
          action: 'custom_setup'
        }
      ],
      nextStep: 'Choose an option or tell me about yourself to get started'
    });
  } else {
    // Returning user
    res.json({
      status: 'returning_user',
      isNew: false,
      message: `Welcome back${kb.personal.name ? ', ' + kb.personal.name : ''}!`,
      user: {
        name: kb.personal.name,
        role: kb.professional.occupation,
        location: kb.personal.currentLocation,
        lastUpdated: kb.lastUpdated
      },
      activeAgent: activeAgent ? {
        id: activeAgent.id,
        name: activeAgent.name,
        category: activeAgent.metadata.category
      } : null,
      suggestions: [
        'Continue with current settings',
        'Switch to a different agent mode',
        'Update your information',
        'View your current profile',
        'Explore available tools'
      ],
      availableAgents: am.getTemplates().map(a => ({
        id: a.id,
        name: a.name,
        active: activeAgent?.id === a.id
      }))
    });
  }
});

// Quick setup endpoint
app.post('/setup/quick', authenticate, async (req, res) => {
  const { type, data } = req.body;
  
  try {
    switch (type) {
      case 'minimal':
        // Just name and role
        if (data.name) {
          await km.updatePersonal({ name: data.name });
        }
        if (data.role) {
          await km.updateProfessional({ occupation: data.role });
        }
        // Auto-select agent based on role
        if (data.role?.toLowerCase().includes('it')) {
          am.setActiveAgent('it-expert');
        } else if (data.role?.toLowerCase().includes('security') || data.role?.toLowerCase().includes('cyber')) {
          am.setActiveAgent('ethical-hacker');
        } else if (data.role?.toLowerCase().includes('sales') || data.role?.toLowerCase().includes('business')) {
          am.setActiveAgent('sales-expert');
        }
        break;
        
      case 'identity':
        // Personal identity setup
        await km.updatePersonal({
          name: data.name,
          currentLocation: data.location,
          languages: data.languages?.split(',').map((l: string) => l.trim())
        });
        if (data.role) {
          await km.updateProfessional({ occupation: data.role });
        }
        break;
        
      case 'technical':
        // Technical profile setup
        await km.updateProfessional({
          occupation: data.role,
          yearsOfExperience: data.experience,
          skills: data.skills?.split(',').map((s: string) => s.trim()),
          specializations: data.specializations?.split(',').map((s: string) => s.trim())
        });
        await km.updatePreferences({
          technicalLevel: data.level || 'expert',
          responseDetail: 'detailed'
        });
        // Auto-activate technical agent
        if (data.preferredAgent) {
          am.quickSwitch(data.preferredAgent as any);
        } else {
          am.setActiveAgent('it-expert');
        }
        break;
    }
    
    const activeAgent = am.getActiveAgent();
    res.json({
      success: true,
      message: 'Setup completed successfully!',
      profile: {
        name: km.getPersonal().name,
        role: km.getProfessional().occupation,
        activeAgent: activeAgent?.name
      },
      nextSteps: [
        activeAgent ? `You're now in ${activeAgent.name} mode` : 'Choose an AI agent mode',
        'Your information is saved and will persist across sessions',
        'You can update your profile anytime',
        'Say "switch agent" to change modes'
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Command processor endpoint
app.post('/command', authenticate, async (req, res) => {
  const { command, args } = req.body;
  
  // Process specific commands
  switch (command.toLowerCase()) {
    case 'mcp-instruct-onboarding':
    case 'onboarding':
    case 'setup':
      // Trigger onboarding flow
      const isNew = km.isNew();
      res.json({
        command: 'onboarding',
        action: 'start',
        isNew,
        message: isNew ? 
          '🚀 Starting MCP Instruct onboarding process...' :
          '👋 Starting profile review and setup...',
        flow: [
          'Check current status',
          'Guide through setup options',
          'Configure AI agent',
          'Save preferences'
        ]
      });
      break;
      
    case 'switch-agent':
    case 'change-agent':
      const agentType = args?.agent;
      if (agentType) {
        const success = am.quickSwitch(agentType);
        if (success) {
          const agent = am.getActiveAgent();
          res.json({
            command: 'switch-agent',
            success: true,
            agent: agent?.name,
            message: `Switched to ${agent?.name} mode`
          });
        } else {
          res.json({
            command: 'switch-agent',
            success: false,
            availableAgents: ['it', 'hacker', 'sales', 'blue', 'red', 'purple'],
            message: 'Invalid agent type'
          });
        }
      } else {
        res.json({
          command: 'switch-agent',
          needsInput: true,
          availableAgents: am.getTemplates().map(a => ({
            id: a.id,
            name: a.name,
            command: a.id.replace('-', '_')
          })),
          message: 'Which agent would you like to activate?'
        });
      }
      break;
      
    case 'status':
    case 'whoami':
      const kb = km.getKnowledgeBase();
      const currentAgent = am.getActiveAgent();
      res.json({
        command: 'status',
        user: {
          name: kb.personal.name,
          role: kb.professional.occupation,
          location: kb.personal.currentLocation
        },
        agent: currentAgent ? {
          name: currentAgent.name,
          category: currentAgent.metadata.category
        } : null,
        stats: {
          profileComplete: Object.keys(kb.personal).length > 2,
          customKnowledge: kb.custom.length,
          lastUpdated: kb.lastUpdated
        }
      });
      break;
      
    case 'help':
      res.json({
        command: 'help',
        availableCommands: [
          {
            command: 'mcp-instruct-onboarding',
            description: 'Start the onboarding process',
            aliases: ['onboarding', 'setup']
          },
          {
            command: 'switch-agent [type]',
            description: 'Switch to a different AI agent',
            options: 'it, hacker, sales, blue, red, purple'
          },
          {
            command: 'status',
            description: 'Show current profile and agent',
            aliases: ['whoami']
          },
          {
            command: 'update [category]',
            description: 'Update your information',
            options: 'personal, professional, preferences, projects'
          }
        ]
      });
      break;
      
    default:
      res.json({
        command: 'unknown',
        message: `Unknown command: ${command}`,
        suggestion: 'Try "help" to see available commands'
      });
  }
});

// ============ COMBINED ENDPOINT FOR CHATGPT ============

// Single endpoint for ChatGPT Custom Actions
app.post('/chat', authenticate, async (req, res) => {
  const { action, data } = req.body;
  
  try {
    switch (action) {
      case 'get_context':
        const kb = km.getKnowledgeBase();
        const active = am.getActiveAgent();
        res.json({
          user: {
            name: kb.personal.name,
            role: kb.professional.occupation,
            preferences: kb.preferences
          },
          agent: active ? {
            name: active.name,
            role: active.metadata.role
          } : null
        });
        break;
        
      case 'switch_agent':
        const { agentType } = data;
        const switched = am.quickSwitch(agentType);
        if (switched) {
          const agent = am.getActiveAgent();
          res.json({
            success: true,
            agent: agent!.name,
            instructions: agent!.content
          });
        } else {
          res.status(400).json({ error: 'Invalid agent type' });
        }
        break;
        
      case 'update_knowledge':
        const { category, updates } = data;
        switch (category) {
          case 'personal':
            await km.updatePersonal(updates);
            break;
          case 'professional':
            await km.updateProfessional(updates);
            break;
          case 'preferences':
            await km.updatePreferences(updates);
            break;
          case 'projects':
            await km.updateProjects(updates);
            break;
        }
        res.json({ success: true, message: `${category} updated` });
        break;
        
      case 'search':
        const { query } = data;
        const results = km.search(query);
        res.json({ results });
        break;
        
      default:
        res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  await initialize();
  console.log(`
🚀 MCP HTTP Bridge Server Running
📍 URL: http://localhost:${PORT}
📚 Docs: http://localhost:${PORT}/docs

For ChatGPT Custom Actions:
- Endpoint: http://localhost:${PORT}/chat
- Add API Key in Authentication header

For direct API access:
- Use individual endpoints with X-API-Key header
  `);
});

// Simple documentation endpoint
app.get('/docs', (req, res) => {
  res.json({
    title: 'MCP Personal Knowledge Base API',
    version: '1.0.0',
    authentication: 'Use X-API-Key header',
    quickStart: {
      step1: 'Get API key from console on startup',
      step2: 'Send POST /onboard to check status',
      step3: 'Use /command with "mcp-instruct-onboarding" to start',
      step4: 'Switch agents with /agents/quick-switch'
    },
    commands: {
      'mcp-instruct-onboarding': 'Start complete onboarding process',
      'switch-agent [type]': 'Switch to different AI agent',
      'status': 'Show current profile and agent',
      'help': 'List all available commands'
    },
    endpoints: {
      onboarding: {
        'POST /onboard': 'Intelligent onboarding check',
        'POST /setup/quick': 'Quick setup (minimal, identity, technical)',
        'POST /command': 'Process commands (onboarding, switch-agent, status, help)'
      },
      knowledge: {
        'GET /kb/status': 'Check knowledge base status',
        'GET /kb/all': 'Get all knowledge',
        'POST /kb/personal': 'Update personal info',
        'POST /kb/professional': 'Update professional info',
        'POST /kb/preferences': 'Update preferences',
        'POST /kb/projects': 'Update projects',
        'POST /kb/custom': 'Add custom knowledge',
        'POST /kb/search': 'Search knowledge base',
        'GET /kb/context': 'Get AI-ready context'
      },
      agents: {
        'GET /agents': 'List all agents',
        'GET /agents/active': 'Get active agent',
        'POST /agents/activate/:agentId': 'Activate specific agent',
        'POST /agents/quick-switch': 'Quick switch agent (it/hacker/sales/blue/red/purple)',
        'GET /agents/:agentId/instructions': 'Get agent instructions',
        'GET /agents/:agentId/tools': 'Get agent tools',
        'POST /agents/:agentId/tools/:toolId/execute': 'Execute agent tool'
      },
      chatgpt: {
        'POST /chat': 'Unified endpoint for ChatGPT Custom Actions',
        'POST /command': 'Process ChatGPT commands'
      }
    },
    availableAgents: [
      'it-expert - IT Professional with system admin expertise',
      'ethical-hacker - Security testing and vulnerability assessment',
      'sales-expert - B2B sales and business development',
      'blue-team - Defensive security operations',
      'red-team - Offensive security testing',
      'purple-team - Collaborative security'
    ]
  });
});
