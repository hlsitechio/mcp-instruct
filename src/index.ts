#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { KnowledgeManager } from './KnowledgeManager.js';
import { onboardingForms, quickForms, parseFormInput } from './forms.js';
import { AGENT_PERSONAS, getPersonasByCategory, getPersonaCategories, applyPersonaToKnowledgeBase } from './personas.js';
import { AgentManager } from './AgentManager.js';
import { getAgentTools, validateToolAccess } from './agent-tools.js';
import chalk from 'chalk';

// Initialize the knowledge manager and agent manager
const km = new KnowledgeManager();
const am = new AgentManager();

// Create MCP server
const server = new Server(
  {
    name: 'personal-knowledge-base',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Define all available tools
const tools: any[] = [
  // ONBOARDING & SETUP TOOLS
  {
    name: 'kb_initialize',
    description: 'Initialize or check knowledge base status. Returns current profile summary and whether onboarding is needed.',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: {
          type: 'string',
          description: 'Profile ID to use (default: "default")',
          default: 'default'
        }
      }
    }
  },
  {
    name: 'kb_onboard',
    description: 'Start interactive onboarding to collect initial information. Returns questions for the specified category.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['initial', 'professional', 'preferences', 'projects', 'all'],
          description: 'Category of questions to ask',
          default: 'all'
        }
      }
    }
  },
  {
    name: 'kb_quick_setup',
    description: 'Quick setup using predefined forms for common scenarios',
    inputSchema: {
      type: 'object',
      properties: {
        formType: {
          type: 'string',
          enum: ['identity', 'technical', 'organization'],
          description: 'Type of quick setup form'
        },
        data: {
          type: 'object',
          description: 'Form data as key-value pairs'
        }
      },
      required: ['formType', 'data']
    }
  },

  // INFORMATION UPDATE TOOLS
  {
    name: 'kb_update_personal',
    description: 'Update personal information (name, location, languages, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        birthYear: { type: 'number' },
        birthPlace: { type: 'string' },
        currentLocation: { type: 'string' },
        languages: { type: 'array', items: { type: 'string' } },
        nationality: { type: 'string' },
        timezone: { type: 'string' },
        pronouns: { type: 'string' }
      }
    }
  },
  {
    name: 'kb_update_professional',
    description: 'Update professional information (job, skills, experience, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        occupation: { type: 'string' },
        yearsOfExperience: { type: 'number' },
        industry: { type: 'string' },
        specializations: { type: 'array', items: { type: 'string' } },
        currentCompany: { type: 'string' },
        role: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        certifications: { type: 'array', items: { type: 'string' } },
        education: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  {
    name: 'kb_update_preferences',
    description: 'Update user preferences (communication style, technical level, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        communicationStyle: { type: 'string' },
        learningStyle: { type: 'string' },
        workingHours: { type: 'string' },
        responseDetail: { type: 'string', enum: ['concise', 'detailed', 'balanced'] },
        technicalLevel: { type: 'string', enum: ['beginner', 'intermediate', 'expert'] },
        favoriteTools: { type: 'array', items: { type: 'string' } },
        interests: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  {
    name: 'kb_update_projects',
    description: 'Update project context (current projects, technologies, goals)',
    inputSchema: {
      type: 'object',
      properties: {
        currentProjects: { type: 'array', items: { type: 'string' } },
        technologies: { type: 'array', items: { type: 'string' } },
        goals: { type: 'array', items: { type: 'string' } },
        challenges: { type: 'array', items: { type: 'string' } },
        teamSize: { type: 'number' },
        methodology: { type: 'string' }
      }
    }
  },

  // CUSTOM KNOWLEDGE TOOLS
  {
    name: 'kb_add_custom',
    description: 'Add custom knowledge to any category',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Category name (e.g., "tools", "workflows", "contacts")'
        },
        key: {
          type: 'string',
          description: 'Knowledge key/identifier'
        },
        value: {
          description: 'Knowledge value (can be string, object, array, etc.)'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional tags for categorization'
        }
      },
      required: ['category', 'key', 'value']
    }
  },
  {
    name: 'kb_remove_custom',
    description: 'Remove custom knowledge',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        key: { type: 'string' }
      },
      required: ['category', 'key']
    }
  },

  // RETRIEVAL TOOLS
  {
    name: 'kb_get_all',
    description: 'Get complete knowledge base as formatted JSON',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['full', 'summary', 'categories'],
          default: 'full'
        }
      }
    }
  },
  {
    name: 'kb_get_personal',
    description: 'Get personal information',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'kb_get_professional',
    description: 'Get professional information',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'kb_get_preferences',
    description: 'Get user preferences',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'kb_get_projects',
    description: 'Get project context',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'kb_get_custom',
    description: 'Get custom knowledge by category',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Category to retrieve (optional, returns all if not specified)'
        }
      }
    }
  },
  {
    name: 'kb_search',
    description: 'Search knowledge base using semantic search',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        limit: {
          type: 'number',
          default: 10,
          description: 'Maximum results to return'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'kb_get_context',
    description: 'Get AI-ready context string for LLM consumption',
    inputSchema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Categories to include (default: all)',
          default: ['personal', 'professional', 'preferences', 'projects']
        }
      }
    }
  },

  // HISTORY & MANAGEMENT TOOLS
  {
    name: 'kb_get_history',
    description: 'Get recent history of knowledge base changes',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          default: 20,
          description: 'Number of history entries to return'
        }
      }
    }
  },
  {
    name: 'kb_export',
    description: 'Export knowledge base as JSON string',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'kb_import',
    description: 'Import knowledge base from JSON string',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'JSON string of knowledge base data'
        }
      },
      required: ['data']
    }
  },
  {
    name: 'kb_list_forms',
    description: 'List available forms and their structures',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['onboarding', 'quick', 'all'],
          default: 'all'
        }
      }
    }
  },

  // AI AGENT PERSONA TOOLS
  {
    name: 'agent_list',
    description: 'List all available AI agent personas',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'agent_activate',
    description: 'Activate a specialized AI agent (IT Expert, Hacker, Sales, Blue/Red/Purple Team)',
    inputSchema: {
      type: 'object',
      properties: {
        agent: {
          type: 'string',
          enum: ['it-expert', 'ethical-hacker', 'sales-expert', 'blue-team', 'red-team', 'purple-team'],
          description: 'Agent ID to activate'
        }
      },
      required: ['agent']
    }
  },
  {
    name: 'agent_switch_quick',
    description: 'Quick switch agent using shorthand (it/hacker/sales/blue/red/purple)',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['it', 'hacker', 'sales', 'blue', 'red', 'purple'],
          description: 'Quick switch type'
        }
      },
      required: ['type']
    }
  },
  {
    name: 'agent_get_active',
    description: 'Get the currently active agent',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'agent_get_tools',
    description: 'Get available tools for current agent',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  
  // SPECIAL ONBOARDING TOOL FOR CHATGPT DESKTOP
  {
    name: 'mcp_instruct_onboarding',
    description: 'Start the MCP Instruct onboarding process - sets up personal profile and AI agent',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['start', 'check_status', 'quick_setup'],
          default: 'start',
          description: 'Onboarding action to perform'
        },
        data: {
          type: 'object',
          description: 'Optional data for quick setup',
          properties: {
            name: { type: 'string' },
            role: { type: 'string' },
            preferredAgent: { type: 'string' }
          }
        }
      }
    }
  }
];

// Handler for listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handler for tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    // Initialize if not already done
    if (!(km as any).initialized) {
      await km.initialize();
      (km as any).initialized = true;
    }

    switch (name) {
      // INITIALIZATION
      case 'kb_initialize': {
        const isNew = km.isNew();
        const kb = km.getKnowledgeBase();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'initialized',
                isNew,
                needsOnboarding: isNew,
                profile: {
                  id: kb.id,
                  createdAt: kb.createdAt,
                  lastUpdated: kb.lastUpdated,
                  hasPersonal: Object.keys(kb.personal).length > 0,
                  hasProfessional: Object.keys(kb.professional).length > 0,
                  hasPreferences: Object.keys(kb.preferences).length > 0,
                  hasProjects: Object.keys(kb.projects).length > 0,
                  customCategories: [...new Set(kb.custom.map(c => c.category))]
                }
              }, null, 2)
            }
          ]
        };
      }

      // ONBOARDING
      case 'kb_onboard': {
        const category = (args as any).category || 'all';
        let questions: any[] = [];
        
        if (category === 'all') {
          questions = [
            ...onboardingForms.initial,
            ...onboardingForms.professional,
            ...onboardingForms.preferences,
            ...onboardingForms.projects
          ];
        } else if (onboardingForms[category as keyof typeof onboardingForms]) {
          questions = onboardingForms[category as keyof typeof onboardingForms];
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                category,
                totalQuestions: questions.length,
                questions: questions.map(q => ({
                  id: q.id,
                  question: q.question,
                  type: q.type,
                  field: q.field,
                  required: q.required,
                  options: q.options
                }))
              }, null, 2)
            }
          ]
        };
      }

      case 'kb_quick_setup': {
        const { formType, data } = args as any;
        const form = quickForms[formType];
        
        if (!form) {
          throw new Error(`Unknown form type: ${formType}`);
        }

        const updates: any = {};
        for (const [key, value] of Object.entries(data)) {
          const fieldDef = form.fields[key];
          if (fieldDef) {
            updates[key] = parseFormInput(value as string, fieldDef.type);
          }
        }

        // Apply updates based on form type
        if (formType === 'identity') {
          await km.updatePersonal({
            name: updates.name,
            currentLocation: updates.location,
            languages: updates.languages
          });
          await km.updateProfessional({
            occupation: updates.occupation
          });
        } else if (formType === 'technical') {
          await km.updateProfessional({
            role: updates.role,
            yearsOfExperience: updates.experience,
            skills: updates.skills
          });
          await km.updatePreferences({
            favoriteTools: updates.tools
          });
        } else if (formType === 'organization') {
          await km.addCustomKnowledge('organization', 'name', updates.orgName);
          await km.addCustomKnowledge('organization', 'industry', updates.industry);
          if (updates.size) await km.addCustomKnowledge('organization', 'size', updates.size);
          if (updates.mission) await km.addCustomKnowledge('organization', 'mission', updates.mission);
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Quick setup completed for ${formType}`
            }
          ]
        };
      }

      // UPDATE TOOLS
      case 'kb_update_personal': {
        await km.updatePersonal(args as any);
        return {
          content: [
            {
              type: 'text',
              text: '✅ Personal information updated successfully'
            }
          ]
        };
      }

      case 'kb_update_professional': {
        await km.updateProfessional(args as any);
        return {
          content: [
            {
              type: 'text',
              text: '✅ Professional information updated successfully'
            }
          ]
        };
      }

      case 'kb_update_preferences': {
        await km.updatePreferences(args as any);
        return {
          content: [
            {
              type: 'text',
              text: '✅ Preferences updated successfully'
            }
          ]
        };
      }

      case 'kb_update_projects': {
        await km.updateProjects(args as any);
        return {
          content: [
            {
              type: 'text',
              text: '✅ Project context updated successfully'
            }
          ]
        };
      }

      // CUSTOM KNOWLEDGE
      case 'kb_add_custom': {
        const { category, key, value, tags } = args as any;
        await km.addCustomKnowledge(category, key, value, tags);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Added custom knowledge: ${category}/${key}`
            }
          ]
        };
      }

      case 'kb_remove_custom': {
        const { category, key } = args as any;
        const removed = await km.removeCustomKnowledge(category, key);
        return {
          content: [
            {
              type: 'text',
              text: removed 
                ? `✅ Removed custom knowledge: ${category}/${key}`
                : `❌ Not found: ${category}/${key}`
            }
          ]
        };
      }

      // RETRIEVAL TOOLS
      case 'kb_get_all': {
        const format = (args as any).format || 'full';
        const kb = km.getKnowledgeBase();
        
        let result: any;
        if (format === 'summary') {
          result = {
            personal: {
              name: kb.personal.name,
              location: kb.personal.currentLocation,
              languages: kb.personal.languages
            },
            professional: {
              occupation: kb.professional.occupation,
              experience: kb.professional.yearsOfExperience,
              skills: kb.professional.skills
            },
            preferences: {
              communicationStyle: kb.preferences.communicationStyle,
              technicalLevel: kb.preferences.technicalLevel
            },
            projects: {
              current: kb.projects.currentProjects,
              technologies: kb.projects.technologies
            },
            customCategories: [...new Set(kb.custom.map(c => c.category))]
          };
        } else if (format === 'categories') {
          result = {
            categories: {
              personal: Object.keys(kb.personal).filter(k => (kb.personal as any)[k] !== undefined),
              professional: Object.keys(kb.professional).filter(k => (kb.professional as any)[k] !== undefined),
              preferences: Object.keys(kb.preferences).filter(k => (kb.preferences as any)[k] !== undefined),
              projects: Object.keys(kb.projects).filter(k => (kb.projects as any)[k] !== undefined),
              custom: [...new Set(kb.custom.map(c => c.category))]
            }
          };
        } else {
          result = {
            personal: kb.personal,
            professional: kb.professional,
            preferences: kb.preferences,
            projects: kb.projects,
            custom: kb.custom
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'kb_get_personal': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(km.getPersonal(), null, 2)
            }
          ]
        };
      }

      case 'kb_get_professional': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(km.getProfessional(), null, 2)
            }
          ]
        };
      }

      case 'kb_get_preferences': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(km.getPreferences(), null, 2)
            }
          ]
        };
      }

      case 'kb_get_projects': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(km.getProjects(), null, 2)
            }
          ]
        };
      }

      case 'kb_get_custom': {
        const category = (args as any).category;
        const custom = km.getCustom(category);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(custom, null, 2)
            }
          ]
        };
      }

      case 'kb_search': {
        const { query, limit = 10 } = args as any;
        const results = km.search(query).slice(0, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      case 'kb_get_context': {
        const categories = (args as any).categories || ['personal', 'professional', 'preferences', 'projects'];
        const kb = km.getKnowledgeBase();
        
        let context = '=== USER CONTEXT ===\n\n';
        
        if ((categories as any[]).includes('personal') && Object.keys(kb.personal).length > 0) {
          context += '**Personal Information:**\n';
          if (kb.personal.name) context += `- Name: ${kb.personal.name}\n`;
          if (kb.personal.currentLocation) context += `- Location: ${kb.personal.currentLocation}\n`;
          if (kb.personal.languages?.length) context += `- Languages: ${kb.personal.languages.join(', ')}\n`;
          if (kb.personal.birthYear) context += `- Birth Year: ${kb.personal.birthYear}\n`;
          if (kb.personal.pronouns) context += `- Pronouns: ${kb.personal.pronouns}\n`;
          context += '\n';
        }
        
        if ((categories as any[]).includes('professional') && Object.keys(kb.professional).length > 0) {
          context += '**Professional Background:**\n';
          if (kb.professional.occupation) context += `- Occupation: ${kb.professional.occupation}\n`;
          if (kb.professional.yearsOfExperience) context += `- Experience: ${kb.professional.yearsOfExperience} years\n`;
          if (kb.professional.industry) context += `- Industry: ${kb.professional.industry}\n`;
          if (kb.professional.skills?.length) context += `- Skills: ${kb.professional.skills.join(', ')}\n`;
          if (kb.professional.specializations?.length) context += `- Specializations: ${kb.professional.specializations.join(', ')}\n`;
          context += '\n';
        }
        
        if ((categories as any[]).includes('preferences') && Object.keys(kb.preferences).length > 0) {
          context += '**Communication Preferences:**\n';
          if (kb.preferences.communicationStyle) context += `- Style: ${kb.preferences.communicationStyle}\n`;
          if (kb.preferences.responseDetail) context += `- Response Detail: ${kb.preferences.responseDetail}\n`;
          if (kb.preferences.technicalLevel) context += `- Technical Level: ${kb.preferences.technicalLevel}\n`;
          if (kb.preferences.favoriteTools?.length) context += `- Favorite Tools: ${kb.preferences.favoriteTools.join(', ')}\n`;
          context += '\n';
        }
        
        if ((categories as any[]).includes('projects') && Object.keys(kb.projects).length > 0) {
          context += '**Current Projects:**\n';
          if (kb.projects.currentProjects?.length) context += `- Projects: ${kb.projects.currentProjects.join(', ')}\n`;
          if (kb.projects.technologies?.length) context += `- Technologies: ${kb.projects.technologies.join(', ')}\n`;
          if (kb.projects.goals?.length) context += `- Goals: ${kb.projects.goals.join(', ')}\n`;
          context += '\n';
        }

        context += '=== END CONTEXT ===';

        return {
          content: [
            {
              type: 'text',
              text: context
            }
          ]
        };
      }

      // HISTORY & MANAGEMENT
      case 'kb_get_history': {
        const limit = (args as any).limit || 20;
        const history = km.getHistory(limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(history, null, 2)
            }
          ]
        };
      }

      case 'kb_export': {
        const data = await km.exportKnowledgeBase();
        return {
          content: [
            {
              type: 'text',
              text: data
            }
          ]
        };
      }

      case 'kb_import': {
        const { data } = args as any;
        await km.importKnowledgeBase(data);
        return {
          content: [
            {
              type: 'text',
              text: '✅ Knowledge base imported successfully'
            }
          ]
        };
      }

      case 'kb_list_forms': {
        const type = (args as any).type || 'all';
        let forms: any = {};
        
        if (type === 'onboarding' || type === 'all') {
          forms.onboarding = onboardingForms;
        }
        if (type === 'quick' || type === 'all') {
          forms.quick = quickForms;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(forms, null, 2)
            }
          ]
        };
      }

      // AGENT TOOLS
      case 'agent_list': {
        await am.initialize();
        const agents = am.getTemplates();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                agents: agents.map(a => ({
                  id: a.id,
                  name: a.name,
                  category: a.metadata.category,
                  role: a.metadata.role?.substring(0, 100) + '...'
                }))
              }, null, 2)
            }
          ]
        };
      }

      case 'agent_activate': {
        await am.initialize();
        const { agent } = args as any;
        const success = am.setActiveAgent(agent);
        
        if (!success) {
          throw new Error(`Agent not found: ${agent}`);
        }
        
        const activeAgent = am.getActiveAgent();
        const tools = getAgentTools(agent);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Activated ${activeAgent?.name}\n\nTools available: ${tools?.defaultTools.join(', ') || 'none'}`
            }
          ]
        };
      }

      case 'agent_switch_quick': {
        await am.initialize();
        const { type } = args as any;
        const success = am.quickSwitch(type);
        
        if (!success) {
          throw new Error(`Invalid agent type: ${type}`);
        }
        
        const activeAgent = am.getActiveAgent();
        return {
          content: [
            {
              type: 'text',
              text: `✅ Switched to ${activeAgent?.name}`
            }
          ]
        };
      }

      case 'agent_get_active': {
        await am.initialize();
        const activeAgent = am.getActiveAgent();
        
        if (!activeAgent) {
          return {
            content: [
              {
                type: 'text',
                text: 'No agent currently active. Use agent_activate to select one.'
              }
            ]
          };
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                active: {
                  id: activeAgent.id,
                  name: activeAgent.name,
                  category: activeAgent.metadata.category,
                  role: activeAgent.metadata.role
                }
              }, null, 2)
            }
          ]
        };
      }

      case 'agent_get_tools': {
        await am.initialize();
        const activeAgent = am.getActiveAgent();
        
        if (!activeAgent) {
          return {
            content: [
              {
                type: 'text',
                text: 'No agent active. Activate an agent first to see available tools.'
              }
            ]
          };
        }
        
        const tools = getAgentTools(activeAgent.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                agent: activeAgent.name,
                tools: tools?.tools || [],
                defaultTools: tools?.defaultTools || []
              }, null, 2)
            }
          ]
        };
      }

      // SPECIAL ONBOARDING FOR CHATGPT DESKTOP
      case 'mcp_instruct_onboarding': {
        await am.initialize();
        const { action = 'start', data } = args as any;
        
        switch (action) {
          case 'start':
            const isNew = km.isNew();
            if (isNew) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `🎉 Welcome to MCP Instruct!\n\nI'll help you set up your personal knowledge base and AI agent.\n\nTell me:\n1. Your name\n2. Your role/occupation\n3. Preferred agent mode (IT, Security, Sales, etc.)\n\nOr use quick setup: mcp_instruct_onboarding with action="quick_setup"`
                  }
                ]
              };
            } else {
              const kb = km.getKnowledgeBase();
              const activeAgent = am.getActiveAgent();
              return {
                content: [
                  {
                    type: 'text',
                    text: `Welcome back, ${kb.personal.name || 'User'}!\n\nProfile: ${kb.professional.occupation || 'Not set'}\nActive Agent: ${activeAgent?.name || 'None'}\n\nYou can switch agents or update your profile anytime.`
                  }
                ]
              };
            }
            
          case 'check_status':
            const kb = km.getKnowledgeBase();
            const agent = am.getActiveAgent();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    isNew: km.isNew(),
                    profile: {
                      name: kb.personal.name,
                      role: kb.professional.occupation
                    },
                    activeAgent: agent?.name
                  }, null, 2)
                }
              ]
            };
            
          case 'quick_setup':
            if (data?.name) {
              await km.updatePersonal({ name: data.name });
            }
            if (data?.role) {
              await km.updateProfessional({ occupation: data.role });
              
              // Auto-select agent based on role
              if (data.role.toLowerCase().includes('it')) {
                am.setActiveAgent('it-expert');
              } else if (data.role.toLowerCase().includes('security')) {
                am.setActiveAgent('ethical-hacker');
              } else if (data.role.toLowerCase().includes('sales')) {
                am.setActiveAgent('sales-expert');
              }
            }
            if (data?.preferredAgent) {
              am.setActiveAgent(data.preferredAgent);
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ Setup complete!\n\nProfile: ${data?.name} - ${data?.role}\nActive Agent: ${am.getActiveAgent()?.name || 'None'}\n\nYour profile is saved and will persist across sessions.`
                }
              ]
            };
            
          default:
            return {
              content: [
                {
                  type: 'text',
                  text: 'Unknown onboarding action'
                }
              ]
            };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

// Start the server
async function main() {
  console.log(chalk.cyan('🧠 Personal Knowledge Base MCP Server'));
  console.log(chalk.gray('Initializing...'));
  
  await km.initialize();
  
  if (km.isNew()) {
    console.log(chalk.yellow('📝 New knowledge base detected. Run kb_initialize to start onboarding.'));
  } else {
    console.log(chalk.green('✅ Existing knowledge base loaded.'));
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log(chalk.green('🚀 Server running on stdio'));
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});