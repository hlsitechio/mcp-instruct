import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import Fuse from 'fuse.js';
import { 
  KnowledgeBase, 
  PersonalInfo, 
  ProfessionalInfo, 
  Preferences, 
  ProjectContext, 
  CustomKnowledge,
  HistoryEntry,
  SearchResult 
} from './types.js';

export class KnowledgeManager {
  private kb: KnowledgeBase;
  private dataPath: string;
  private filePath: string;
  private fuse?: Fuse<any>;

  constructor(profileId: string = 'default') {
    this.dataPath = join(homedir(), '.mcp-personal-kb');
    this.filePath = join(this.dataPath, `${profileId}.json`);
    this.kb = this.createEmptyKnowledgeBase();
  }

  private createEmptyKnowledgeBase(): KnowledgeBase {
    return {
      id: this.generateId(),
      version: '1.0.0',
      personal: {},
      professional: {},
      preferences: {},
      projects: {},
      custom: [],
      history: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  private generateId(): string {
    return `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initialize(): Promise<void> {
    // Ensure data directory exists
    if (!existsSync(this.dataPath)) {
      await mkdir(this.dataPath, { recursive: true });
    }

    // Load existing knowledge base if it exists
    if (existsSync(this.filePath)) {
      try {
        const data = await readFile(this.filePath, 'utf-8');
        this.kb = JSON.parse(data);
      } catch (error) {
        console.error('Error loading knowledge base:', error);
        // Keep the empty KB if loading fails
      }
    }

    this.initializeSearch();
  }

  private initializeSearch(): void {
    // Flatten the knowledge base for searching
    const searchableItems = this.flattenKnowledgeBase();
    
    this.fuse = new Fuse(searchableItems, {
      keys: ['category', 'field', 'value', 'tags'],
      threshold: 0.3,
      includeScore: true
    });
  }

  private flattenKnowledgeBase(): any[] {
    const items: any[] = [];

    // Flatten personal info
    Object.entries(this.kb.personal).forEach(([field, value]) => {
      if (value !== undefined) {
        items.push({ category: 'personal', field, value, original: value });
      }
    });

    // Flatten professional info
    Object.entries(this.kb.professional).forEach(([field, value]) => {
      if (value !== undefined) {
        items.push({ category: 'professional', field, value, original: value });
      }
    });

    // Flatten preferences
    Object.entries(this.kb.preferences).forEach(([field, value]) => {
      if (value !== undefined) {
        items.push({ category: 'preferences', field, value, original: value });
      }
    });

    // Flatten projects
    Object.entries(this.kb.projects).forEach(([field, value]) => {
      if (value !== undefined) {
        items.push({ category: 'projects', field, value, original: value });
      }
    });

    // Add custom knowledge
    this.kb.custom.forEach(item => {
      items.push({
        category: 'custom',
        field: item.key,
        value: item.value,
        tags: item.metadata?.tags || [],
        original: item
      });
    });

    return items;
  }

  async save(): Promise<void> {
    this.kb.lastUpdated = new Date().toISOString();
    await writeFile(this.filePath, JSON.stringify(this.kb, null, 2));
    this.initializeSearch(); // Reinitialize search after saving
  }

  private addHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
    this.kb.history.push({
      ...entry,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 history entries
    if (this.kb.history.length > 100) {
      this.kb.history = this.kb.history.slice(-100);
    }
  }

  // Personal information methods
  async updatePersonal(updates: Partial<PersonalInfo>): Promise<void> {
    Object.entries(updates).forEach(([field, value]) => {
      const oldValue = (this.kb.personal as any)[field];
      (this.kb.personal as any)[field] = value;
      this.addHistory({
        action: oldValue === undefined ? 'add' : 'update',
        category: 'personal',
        field,
        oldValue,
        newValue: value
      });
    });
    await this.save();
  }

  // Professional information methods
  async updateProfessional(updates: Partial<ProfessionalInfo>): Promise<void> {
    Object.entries(updates).forEach(([field, value]) => {
      const oldValue = (this.kb.professional as any)[field];
      (this.kb.professional as any)[field] = value;
      this.addHistory({
        action: oldValue === undefined ? 'add' : 'update',
        category: 'professional',
        field,
        oldValue,
        newValue: value
      });
    });
    await this.save();
  }

  // Preferences methods
  async updatePreferences(updates: Partial<Preferences>): Promise<void> {
    Object.entries(updates).forEach(([field, value]) => {
      const oldValue = (this.kb.preferences as any)[field];
      (this.kb.preferences as any)[field] = value;
      this.addHistory({
        action: oldValue === undefined ? 'add' : 'update',
        category: 'preferences',
        field,
        oldValue,
        newValue: value
      });
    });
    await this.save();
  }

  // Project context methods
  async updateProjects(updates: Partial<ProjectContext>): Promise<void> {
    Object.entries(updates).forEach(([field, value]) => {
      const oldValue = (this.kb.projects as any)[field];
      (this.kb.projects as any)[field] = value;
      this.addHistory({
        action: oldValue === undefined ? 'add' : 'update',
        category: 'projects',
        field,
        oldValue,
        newValue: value
      });
    });
    await this.save();
  }

  // Custom knowledge methods
  async addCustomKnowledge(category: string, key: string, value: any, tags?: string[]): Promise<void> {
    const existing = this.kb.custom.findIndex(k => k.category === category && k.key === key);
    
    const customKnowledge: CustomKnowledge = {
      category,
      key,
      value,
      metadata: {
        addedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        tags
      }
    };

    if (existing >= 0) {
      const oldValue = this.kb.custom[existing].value;
      this.kb.custom[existing] = customKnowledge;
      this.addHistory({
        action: 'update',
        category: `custom:${category}`,
        field: key,
        oldValue,
        newValue: value
      });
    } else {
      this.kb.custom.push(customKnowledge);
      this.addHistory({
        action: 'add',
        category: `custom:${category}`,
        field: key,
        newValue: value
      });
    }

    await this.save();
  }

  async removeCustomKnowledge(category: string, key: string): Promise<boolean> {
    const index = this.kb.custom.findIndex(k => k.category === category && k.key === key);
    if (index >= 0) {
      const oldValue = this.kb.custom[index].value;
      this.kb.custom.splice(index, 1);
      this.addHistory({
        action: 'delete',
        category: `custom:${category}`,
        field: key,
        oldValue
      });
      await this.save();
      return true;
    }
    return false;
  }

  // Search methods
  search(query: string): SearchResult[] {
    if (!this.fuse) {
      this.initializeSearch();
    }

    const results = this.fuse!.search(query);
    
    return results.map(result => ({
      category: result.item.category,
      field: result.item.field,
      value: result.item.original || result.item.value,
      relevance: 1 - (result.score || 0),
      context: this.getContext(result.item.category, result.item.field)
    }));
  }

  private getContext(category: string, field: string): string {
    const contexts: Record<string, Record<string, string>> = {
      personal: {
        name: "The person's full name",
        birthYear: "Year of birth",
        birthPlace: "Place of birth",
        currentLocation: "Current living location",
        languages: "Languages spoken",
        nationality: "Nationality",
        timezone: "Current timezone",
        pronouns: "Preferred pronouns"
      },
      professional: {
        occupation: "Current job title or occupation",
        yearsOfExperience: "Years of professional experience",
        industry: "Industry or sector",
        specializations: "Areas of specialization",
        currentCompany: "Current employer",
        role: "Current role",
        skills: "Technical and professional skills",
        certifications: "Professional certifications",
        education: "Educational background"
      },
      preferences: {
        communicationStyle: "Preferred communication style",
        learningStyle: "How they prefer to learn",
        workingHours: "Typical working hours",
        responseDetail: "Level of detail in responses",
        technicalLevel: "Technical expertise level",
        favoriteTools: "Preferred tools and software",
        interests: "Personal interests and hobbies"
      },
      projects: {
        currentProjects: "Active projects",
        technologies: "Technologies being used",
        goals: "Current goals and objectives",
        challenges: "Current challenges",
        teamSize: "Size of the team",
        methodology: "Development methodology"
      }
    };

    if (category.startsWith('custom:')) {
      return `Custom knowledge in category: ${category.replace('custom:', '')}`;
    }

    return contexts[category]?.[field] || `${category} information`;
  }

  // Getters
  getKnowledgeBase(): KnowledgeBase {
    return { ...this.kb };
  }

  getPersonal(): PersonalInfo {
    return { ...this.kb.personal };
  }

  getProfessional(): ProfessionalInfo {
    return { ...this.kb.professional };
  }

  getPreferences(): Preferences {
    return { ...this.kb.preferences };
  }

  getProjects(): ProjectContext {
    return { ...this.kb.projects };
  }

  getCustom(category?: string): CustomKnowledge[] {
    if (category) {
      return this.kb.custom.filter(k => k.category === category);
    }
    return [...this.kb.custom];
  }

  getHistory(limit: number = 20): HistoryEntry[] {
    return this.kb.history.slice(-limit);
  }

  // Export/Import
  async exportKnowledgeBase(): Promise<string> {
    return JSON.stringify(this.kb, null, 2);
  }

  async importKnowledgeBase(data: string): Promise<void> {
    try {
      const imported = JSON.parse(data);
      // Validate the structure
      if (imported.version && imported.personal !== undefined) {
        this.kb = imported;
        await this.save();
      } else {
        throw new Error('Invalid knowledge base format');
      }
    } catch (error) {
      throw new Error(`Failed to import knowledge base: ${error}`);
    }
  }

  // Check if this is a new/empty knowledge base
  isNew(): boolean {
    return Object.keys(this.kb.personal).length === 0 &&
           Object.keys(this.kb.professional).length === 0 &&
           Object.keys(this.kb.preferences).length === 0 &&
           Object.keys(this.kb.projects).length === 0 &&
           this.kb.custom.length === 0;
  }
}