import { readFile, readdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

export interface AgentTemplate {
  id: string;
  name: string;
  content: string;
  metadata: {
    role?: string;
    expertise?: string[];
    category?: string;
    lastModified?: string;
  };
}

export class AgentManager {
  private agentsPath: string;
  private templates: Map<string, AgentTemplate>;
  private activeAgent: string | null;

  constructor(agentsPath: string = join(process.cwd(), 'agents')) {
    this.agentsPath = agentsPath;
    this.templates = new Map();
    this.activeAgent = null;
  }

  async initialize(): Promise<void> {
    if (!existsSync(this.agentsPath)) {
      throw new Error(`Agents directory not found: ${this.agentsPath}`);
    }
    await this.loadTemplates();
  }

  private async loadTemplates(): Promise<void> {
    const files = await readdir(this.agentsPath);
    const mdFiles = files.filter(file => extname(file) === '.md');

    for (const file of mdFiles) {
      const filePath = join(this.agentsPath, file);
      const content = await readFile(filePath, 'utf-8');
      const id = file.replace('.md', '');
      
      const template: AgentTemplate = {
        id,
        name: this.formatName(id),
        content,
        metadata: this.extractMetadata(content)
      };

      this.templates.set(id, template);
    }
  }

  private formatName(id: string): string {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private extractMetadata(content: string): AgentTemplate['metadata'] {
    const metadata: AgentTemplate['metadata'] = {};
    
    // Extract role from ## Role section
    const roleMatch = content.match(/## Role\n(.+?)(?=\n\n|$)/s);
    if (roleMatch) {
      metadata.role = roleMatch[1].trim();
    }

    // Extract expertise from ## Core Expertise section
    const expertiseMatch = content.match(/## Core Expertise\n([\s\S]+?)(?=\n##|$)/);
    if (expertiseMatch) {
      const expertiseLines = expertiseMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
      metadata.expertise = expertiseLines;
    }

    // Extract category from content patterns
    if (content.includes('Blue Team')) {
      metadata.category = 'Cybersecurity - Defensive';
    } else if (content.includes('Red Team')) {
      metadata.category = 'Cybersecurity - Offensive';
    } else if (content.includes('Purple Team')) {
      metadata.category = 'Cybersecurity - Collaborative';
    } else if (content.includes('IT Expert') || content.includes('IT Professional')) {
      metadata.category = 'Technology';
    } else if (content.includes('Sales')) {
      metadata.category = 'Business';
    } else if (content.includes('Ethical Hacker')) {
      metadata.category = 'Cybersecurity';
    }

    return metadata;
  }

  // Get all available templates
  getTemplates(): AgentTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get template by ID
  getTemplate(id: string): AgentTemplate | undefined {
    return this.templates.get(id);
  }

  // Get templates by category
  getTemplatesByCategory(category: string): AgentTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.metadata.category === category);
  }

  // Set active agent
  setActiveAgent(id: string): boolean {
    if (this.templates.has(id)) {
      this.activeAgent = id;
      return true;
    }
    return false;
  }

  // Get active agent
  getActiveAgent(): AgentTemplate | null {
    if (this.activeAgent) {
      return this.templates.get(this.activeAgent) || null;
    }
    return null;
  }

  // Get agent instructions (formatted for LLM)
  getAgentInstructions(id: string): string | null {
    const template = this.templates.get(id);
    if (!template) return null;

    // Format the content for LLM consumption
    return `# AI AGENT INSTRUCTIONS - ${template.name}\n\n${template.content}`;
  }

  // Get agent context (summary for quick reference)
  getAgentContext(id: string): any {
    const template = this.templates.get(id);
    if (!template) return null;

    return {
      id: template.id,
      name: template.name,
      role: template.metadata.role,
      category: template.metadata.category,
      expertise: template.metadata.expertise?.slice(0, 5), // Top 5 expertise areas
      active: this.activeAgent === id
    };
  }

  // List all available categories
  getCategories(): string[] {
    const categories = new Set<string>();
    this.templates.forEach(template => {
      if (template.metadata.category) {
        categories.add(template.metadata.category);
      }
    });
    return Array.from(categories);
  }

  // Quick switch between common agents
  quickSwitch(type: 'it' | 'hacker' | 'sales' | 'blue' | 'red' | 'purple'): boolean {
    const mapping: Record<string, string> = {
      'it': 'it-expert',
      'hacker': 'ethical-hacker',
      'sales': 'sales-expert',
      'blue': 'blue-team',
      'red': 'red-team',
      'purple': 'purple-team'
    };

    const id = mapping[type];
    if (id) {
      return this.setActiveAgent(id);
    }
    return false;
  }

  // Reload templates (useful for development)
  async reload(): Promise<void> {
    this.templates.clear();
    await this.loadTemplates();
  }

  // Get formatted list for display
  getFormattedList(): string {
    const categories = this.getCategories();
    let output = '# Available AI Agent Templates\n\n';

    for (const category of categories) {
      output += `## ${category}\n`;
      const templates = this.getTemplatesByCategory(category);
      
      for (const template of templates) {
        const active = this.activeAgent === template.id ? ' ✓ [ACTIVE]' : '';
        output += `- **${template.name}** (${template.id})${active}\n`;
        if (template.metadata.role) {
          output += `  ${template.metadata.role.substring(0, 100)}...\n`;
        }
      }
      output += '\n';
    }

    return output;
  }
}