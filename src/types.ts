export interface PersonalInfo {
  name?: string;
  birthYear?: number;
  birthPlace?: string;
  currentLocation?: string;
  languages?: string[];
  nationality?: string;
  timezone?: string;
  pronouns?: string;
}

export interface ProfessionalInfo {
  occupation?: string;
  yearsOfExperience?: number;
  industry?: string;
  specializations?: string[];
  currentCompany?: string;
  role?: string;
  skills?: string[];
  certifications?: string[];
  education?: string[];
}

export interface Preferences {
  communicationStyle?: string;
  learningStyle?: string;
  workingHours?: string;
  responseDetail?: 'concise' | 'detailed' | 'balanced';
  technicalLevel?: 'beginner' | 'intermediate' | 'expert';
  favoriteTools?: string[];
  interests?: string[];
}

export interface ProjectContext {
  currentProjects?: string[];
  technologies?: string[];
  goals?: string[];
  challenges?: string[];
  teamSize?: number;
  methodology?: string;
}

export interface CustomKnowledge {
  category: string;
  key: string;
  value: any;
  metadata?: {
    addedAt: string;
    lastUpdated: string;
    importance?: 'low' | 'medium' | 'high';
    tags?: string[];
  };
}

export interface KnowledgeBase {
  id: string;
  version: string;
  personal: PersonalInfo;
  professional: ProfessionalInfo;
  preferences: Preferences;
  projects: ProjectContext;
  custom: CustomKnowledge[];
  history: HistoryEntry[];
  lastUpdated: string;
  createdAt: string;
}

export interface HistoryEntry {
  timestamp: string;
  action: 'add' | 'update' | 'delete' | 'query';
  category: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  category: keyof Omit<KnowledgeBase, 'id' | 'version' | 'custom' | 'history' | 'lastUpdated' | 'createdAt'>;
  field: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  options?: string[];
  required?: boolean;
  skipIf?: (kb: KnowledgeBase) => boolean;
}

export interface SearchResult {
  category: string;
  field: string;
  value: any;
  relevance: number;
  context?: string;
}