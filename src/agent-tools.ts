export interface AgentTool {
  id: string;
  name: string;
  description: string;
  command?: string;
  category: string;
  platform?: string[];
  requiresAuth?: boolean;
  apiEndpoint?: string;
  parameters?: Record<string, any>;
}

export interface AgentToolset {
  agentId: string;
  tools: AgentTool[];
  defaultTools: string[]; // Tool IDs that are auto-enabled
  restrictions?: string[];
}

// Tool definitions for each agent type
export const AGENT_TOOLSETS: Record<string, AgentToolset> = {
  'it-expert': {
    agentId: 'it-expert',
    tools: [
      {
        id: 'powershell',
        name: 'PowerShell',
        description: 'Windows PowerShell for system administration',
        command: 'pwsh -Command',
        category: 'system',
        platform: ['windows']
      },
      {
        id: 'cmd',
        name: 'Command Prompt',
        description: 'Windows Command Prompt',
        command: 'cmd /c',
        category: 'system',
        platform: ['windows']
      },
      {
        id: 'wmic',
        name: 'WMIC',
        description: 'Windows Management Instrumentation Command',
        command: 'wmic',
        category: 'system',
        platform: ['windows']
      },
      {
        id: 'netsh',
        name: 'NetSH',
        description: 'Network Shell for network configuration',
        command: 'netsh',
        category: 'network',
        platform: ['windows']
      },
      {
        id: 'systeminfo',
        name: 'System Info',
        description: 'Display system configuration',
        command: 'systeminfo',
        category: 'diagnostics',
        platform: ['windows']
      },
      {
        id: 'eventlog',
        name: 'Event Log Query',
        description: 'Query Windows Event Logs',
        command: 'wevtutil qe',
        category: 'monitoring',
        platform: ['windows']
      },
      {
        id: 'terraform',
        name: 'Terraform',
        description: 'Infrastructure as Code',
        command: 'terraform',
        category: 'automation'
      },
      {
        id: 'docker',
        name: 'Docker',
        description: 'Container management',
        command: 'docker',
        category: 'containers'
      },
      {
        id: 'kubectl',
        name: 'Kubectl',
        description: 'Kubernetes control',
        command: 'kubectl',
        category: 'orchestration'
      },
      {
        id: 'azure-cli',
        name: 'Azure CLI',
        description: 'Azure cloud management',
        command: 'az',
        category: 'cloud'
      },
      {
        id: 'aws-cli',
        name: 'AWS CLI',
        description: 'AWS cloud management',
        command: 'aws',
        category: 'cloud'
      }
    ],
    defaultTools: ['powershell', 'cmd', 'systeminfo', 'netsh'],
    restrictions: ['No destructive operations without confirmation']
  },

  'ethical-hacker': {
    agentId: 'ethical-hacker',
    tools: [
      {
        id: 'nmap',
        name: 'Nmap',
        description: 'Network discovery and security auditing',
        command: 'nmap',
        category: 'reconnaissance'
      },
      {
        id: 'metasploit',
        name: 'Metasploit Framework',
        description: 'Penetration testing framework',
        command: 'msfconsole',
        category: 'exploitation'
      },
      {
        id: 'burpsuite',
        name: 'Burp Suite',
        description: 'Web application security testing',
        apiEndpoint: 'http://localhost:8080/burp/api',
        category: 'web-testing',
        requiresAuth: true
      },
      {
        id: 'sqlmap',
        name: 'SQLMap',
        description: 'SQL injection detection and exploitation',
        command: 'sqlmap',
        category: 'web-testing'
      },
      {
        id: 'nikto',
        name: 'Nikto',
        description: 'Web server scanner',
        command: 'nikto',
        category: 'web-testing'
      },
      {
        id: 'john',
        name: 'John the Ripper',
        description: 'Password cracking',
        command: 'john',
        category: 'password-analysis'
      },
      {
        id: 'hashcat',
        name: 'Hashcat',
        description: 'Advanced password recovery',
        command: 'hashcat',
        category: 'password-analysis'
      },
      {
        id: 'wireshark',
        name: 'Wireshark CLI',
        description: 'Network protocol analyzer',
        command: 'tshark',
        category: 'network-analysis'
      },
      {
        id: 'aircrack',
        name: 'Aircrack-ng',
        description: 'WiFi security auditing',
        command: 'aircrack-ng',
        category: 'wireless'
      },
      {
        id: 'gobuster',
        name: 'Gobuster',
        description: 'Directory/file enumeration',
        command: 'gobuster',
        category: 'reconnaissance'
      },
      {
        id: 'hydra',
        name: 'Hydra',
        description: 'Network authentication cracker',
        command: 'hydra',
        category: 'authentication'
      },
      {
        id: 'shodan',
        name: 'Shodan API',
        description: 'Internet-wide scanning database',
        apiEndpoint: 'https://api.shodan.io',
        category: 'osint',
        requiresAuth: true
      }
    ],
    defaultTools: ['nmap', 'nikto', 'gobuster', 'wireshark'],
    restrictions: ['Authorization required', 'No production systems', 'Legal boundaries']
  },

  'red-team': {
    agentId: 'red-team',
    tools: [
      {
        id: 'cobalt-strike',
        name: 'Cobalt Strike',
        description: 'Adversary simulation and red team operations',
        apiEndpoint: 'https://localhost:50050',
        category: 'c2',
        requiresAuth: true
      },
      {
        id: 'empire',
        name: 'Empire',
        description: 'PowerShell and Python post-exploitation',
        command: 'empire',
        category: 'c2'
      },
      {
        id: 'mimikatz',
        name: 'Mimikatz',
        description: 'Credential extraction',
        command: 'mimikatz',
        category: 'credential-access',
        platform: ['windows']
      },
      {
        id: 'bloodhound',
        name: 'BloodHound',
        description: 'Active Directory attack paths',
        command: 'bloodhound',
        category: 'reconnaissance'
      },
      {
        id: 'responder',
        name: 'Responder',
        description: 'LLMNR/NBT-NS/MDNS poisoner',
        command: 'responder',
        category: 'credential-access'
      },
      {
        id: 'impacket',
        name: 'Impacket Scripts',
        description: 'Network protocol manipulation',
        command: 'impacket-',
        category: 'lateral-movement'
      },
      {
        id: 'covenant',
        name: 'Covenant',
        description: '.NET C2 framework',
        apiEndpoint: 'https://localhost:7443',
        category: 'c2',
        requiresAuth: true
      },
      {
        id: 'sliver',
        name: 'Sliver',
        description: 'Cross-platform adversary emulation',
        command: 'sliver',
        category: 'c2'
      }
    ],
    defaultTools: ['bloodhound', 'responder', 'impacket'],
    restrictions: ['Authorized engagements only', 'Rules of engagement required']
  },

  'blue-team': {
    agentId: 'blue-team',
    tools: [
      {
        id: 'splunk',
        name: 'Splunk CLI',
        description: 'SIEM search and analytics',
        command: 'splunk search',
        category: 'siem',
        apiEndpoint: 'https://localhost:8089',
        requiresAuth: true
      },
      {
        id: 'elastic',
        name: 'Elasticsearch',
        description: 'Log analysis and search',
        apiEndpoint: 'http://localhost:9200',
        category: 'siem'
      },
      {
        id: 'yara',
        name: 'YARA',
        description: 'Malware classification',
        command: 'yara',
        category: 'threat-hunting'
      },
      {
        id: 'osquery',
        name: 'OSQuery',
        description: 'SQL-based OS instrumentation',
        command: 'osqueryi',
        category: 'endpoint-monitoring'
      },
      {
        id: 'volatility',
        name: 'Volatility',
        description: 'Memory forensics',
        command: 'volatility',
        category: 'forensics'
      },
      {
        id: 'snort',
        name: 'Snort',
        description: 'Network intrusion detection',
        command: 'snort',
        category: 'ids'
      },
      {
        id: 'suricata',
        name: 'Suricata',
        description: 'Network threat detection',
        command: 'suricata',
        category: 'ids'
      },
      {
        id: 'zeek',
        name: 'Zeek',
        description: 'Network security monitoring',
        command: 'zeek',
        category: 'network-monitoring'
      },
      {
        id: 'velociraptor',
        name: 'Velociraptor',
        description: 'Endpoint monitoring and forensics',
        apiEndpoint: 'https://localhost:8001',
        category: 'edr',
        requiresAuth: true
      }
    ],
    defaultTools: ['osquery', 'yara', 'zeek'],
    restrictions: ['Read-only operations preferred', 'Maintain evidence integrity']
  },

  'purple-team': {
    agentId: 'purple-team',
    tools: [
      {
        id: 'caldera',
        name: 'MITRE Caldera',
        description: 'Automated adversary emulation',
        apiEndpoint: 'http://localhost:8888',
        category: 'emulation',
        requiresAuth: true
      },
      {
        id: 'atomic-red',
        name: 'Atomic Red Team',
        description: 'Atomic test execution',
        command: 'Invoke-AtomicTest',
        category: 'testing',
        platform: ['windows']
      },
      {
        id: 'vectr',
        name: 'VECTR',
        description: 'Purple team tracking',
        apiEndpoint: 'https://localhost:8081',
        category: 'reporting',
        requiresAuth: true
      },
      {
        id: 'sigma',
        name: 'Sigma Rules',
        description: 'Detection rule converter',
        command: 'sigmac',
        category: 'detection-engineering'
      },
      {
        id: 'attack-navigator',
        name: 'ATT&CK Navigator',
        description: 'MITRE ATT&CK visualization',
        apiEndpoint: 'http://localhost:4200',
        category: 'planning'
      }
    ],
    defaultTools: ['caldera', 'atomic-red', 'sigma'],
    restrictions: ['Coordinated testing only']
  },

  'sales-expert': {
    agentId: 'sales-expert',
    tools: [
      {
        id: 'salesforce',
        name: 'Salesforce API',
        description: 'CRM operations',
        apiEndpoint: 'https://api.salesforce.com',
        category: 'crm',
        requiresAuth: true
      },
      {
        id: 'hubspot',
        name: 'HubSpot API',
        description: 'Marketing and sales automation',
        apiEndpoint: 'https://api.hubspot.com',
        category: 'crm',
        requiresAuth: true
      },
      {
        id: 'linkedin-sales',
        name: 'LinkedIn Sales Navigator',
        description: 'Lead generation and research',
        apiEndpoint: 'https://api.linkedin.com/v2',
        category: 'prospecting',
        requiresAuth: true
      },
      {
        id: 'clearbit',
        name: 'Clearbit',
        description: 'Company and contact enrichment',
        apiEndpoint: 'https://api.clearbit.com',
        category: 'intelligence',
        requiresAuth: true
      },
      {
        id: 'amazon-product',
        name: 'Amazon Product API',
        description: 'Product research and pricing',
        apiEndpoint: 'https://webservices.amazon.com',
        category: 'market-research',
        requiresAuth: true
      },
      {
        id: 'zoom',
        name: 'Zoom API',
        description: 'Meeting scheduling and management',
        apiEndpoint: 'https://api.zoom.us/v2',
        category: 'communication',
        requiresAuth: true
      },
      {
        id: 'calendly',
        name: 'Calendly',
        description: 'Appointment scheduling',
        apiEndpoint: 'https://api.calendly.com',
        category: 'scheduling',
        requiresAuth: true
      },
      {
        id: 'gong',
        name: 'Gong.io',
        description: 'Sales conversation intelligence',
        apiEndpoint: 'https://api.gong.io',
        category: 'analytics',
        requiresAuth: true
      }
    ],
    defaultTools: ['salesforce', 'linkedin-sales', 'zoom', 'calendly'],
    restrictions: ['GDPR compliance', 'No spam', 'Respect privacy']
  }
};

// Function to get tools for an agent
export function getAgentTools(agentId: string): AgentToolset | undefined {
  return AGENT_TOOLSETS[agentId];
}

// Function to check if a tool is available for the current platform
export function isToolAvailable(tool: AgentTool): boolean {
  if (!tool.platform) return true;
  
  const currentPlatform = process.platform === 'win32' ? 'windows' : 
                         process.platform === 'darwin' ? 'macos' : 'linux';
  
  return tool.platform.includes(currentPlatform);
}

// Function to execute a tool command
export async function executeTool(tool: AgentTool, args: string): Promise<string> {
  if (tool.command) {
    // Execute command-line tool
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout, stderr } = await execAsync(`${tool.command} ${args}`);
      return stdout || stderr;
    } catch (error: any) {
      return `Error executing ${tool.name}: ${error.message}`;
    }
  } else if (tool.apiEndpoint) {
    // Call API endpoint
    return `API call to ${tool.apiEndpoint} (requires implementation)`;
  }
  
  return `Tool ${tool.name} not configured for execution`;
}

// Function to validate tool access
export function validateToolAccess(agentId: string, toolId: string): boolean {
  const toolset = AGENT_TOOLSETS[agentId];
  if (!toolset) return false;
  
  return toolset.tools.some(t => t.id === toolId);
}