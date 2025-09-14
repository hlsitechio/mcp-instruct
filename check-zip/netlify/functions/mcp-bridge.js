"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Serverless version of the MCP bridge for Netlify Functions
const API_KEY = process.env.MCP_API_KEY || 'mcp_default_key';
// In-memory storage (resets on each function invocation)
// For production, use Netlify Blobs or external database
let knowledgeBase = {
    personal: {},
    organizational: {}
};
let activeAgent = 'default';
// Agent templates (simplified for serverless)
const agents = {
    default: {
        name: "Default Assistant",
        role: "General Purpose AI Assistant",
        instructions: "You are a helpful assistant."
    },
    "it-expert": {
        name: "IT Expert",
        role: "Information Technology Specialist",
        instructions: "You are an IT expert with deep knowledge of systems, networks, and infrastructure."
    },
    "ethical-hacker": {
        name: "Ethical Hacker",
        role: "Cybersecurity Professional",
        instructions: "You are an ethical hacker specializing in penetration testing and security."
    }
};
// Helper to parse JSON body
const parseBody = (body) => {
    if (!body)
        return {};
    try {
        return JSON.parse(body);
    }
    catch {
        return {};
    }
};
// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};
const handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    // Check API key
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Missing or invalid API key' })
        };
    }
    const providedKey = authHeader.substring(7);
    if (providedKey !== API_KEY) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid API key' })
        };
    }
    const path = event.path.replace('/.netlify/functions/mcp-bridge', '');
    const method = event.httpMethod;
    const body = parseBody(event.body);
    try {
        // Route handling
        if (path === '/health' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: 'healthy', version: '1.0.0' })
            };
        }
        if (path === '/onboard' && method === 'POST') {
            const { name, role, preferences } = body;
            knowledgeBase.personal = {
                name: name || 'User',
                role: role || 'User',
                preferences: preferences || {},
                createdAt: new Date().toISOString()
            };
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `Welcome ${name}! Your profile has been created.`,
                    profile: knowledgeBase.personal
                })
            };
        }
        if (path === '/agents' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    agents: Object.keys(agents),
                    active: activeAgent,
                    details: agents
                })
            };
        }
        if (path === '/agents/switch' && method === 'POST') {
            const { agent } = body;
            if (!agents[agent]) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Agent not found' })
                };
            }
            activeAgent = agent;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `Switched to ${agents[agent].name}`,
                    agent: agents[agent]
                })
            };
        }
        if (path === '/knowledge' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(knowledgeBase)
            };
        }
        if (path === '/knowledge' && method === 'PUT') {
            const { category, key, value } = body;
            if (!knowledgeBase[category]) {
                knowledgeBase[category] = {};
            }
            knowledgeBase[category][key] = value;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Knowledge updated',
                    knowledge: knowledgeBase
                })
            };
        }
        if (path === '/chat' && method === 'POST') {
            const { message, command } = body;
            // Handle special commands
            if (command === 'mcp-instruct-onboarding') {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        type: 'onboarding',
                        message: 'Welcome to MCP Instruct! Please provide your name and role.',
                        fields: ['name', 'role', 'preferences']
                    })
                };
            }
            if (command?.startsWith('switch:')) {
                const agentName = command.replace('switch:', '');
                if (!agents[agentName]) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ error: 'Agent not found' })
                    };
                }
                activeAgent = agentName;
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        type: 'agent_switch',
                        message: `Switched to ${agents[agentName].name}`,
                        agent: agents[agentName]
                    })
                };
            }
            // Regular chat response
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    type: 'response',
                    message: `${agents[activeAgent].name} received: ${message}`,
                    agent: activeAgent,
                    context: knowledgeBase
                })
            };
        }
        // 404 for unmatched routes
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Endpoint not found' })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.handler = handler;
