import { OnboardingQuestion } from './types.js';

export const onboardingForms: Record<string, OnboardingQuestion[]> = {
  initial: [
    {
      id: 'personal_name',
      question: 'What is your full name?',
      category: 'personal',
      field: 'name',
      type: 'text',
      required: true
    },
    {
      id: 'personal_birth_year',
      question: 'What year were you born?',
      category: 'personal',
      field: 'birthYear',
      type: 'number',
      required: false
    },
    {
      id: 'personal_location',
      question: 'Where are you currently located? (City, Country)',
      category: 'personal',
      field: 'currentLocation',
      type: 'text',
      required: false
    },
    {
      id: 'personal_languages',
      question: 'What languages do you speak? (comma-separated)',
      category: 'personal',
      field: 'languages',
      type: 'multiselect',
      required: false
    },
    {
      id: 'personal_pronouns',
      question: 'What are your pronouns?',
      category: 'personal',
      field: 'pronouns',
      type: 'text',
      required: false
    }
  ],
  professional: [
    {
      id: 'prof_occupation',
      question: 'What is your occupation/job title?',
      category: 'professional',
      field: 'occupation',
      type: 'text',
      required: true
    },
    {
      id: 'prof_experience',
      question: 'How many years of experience do you have?',
      category: 'professional',
      field: 'yearsOfExperience',
      type: 'number',
      required: false
    },
    {
      id: 'prof_industry',
      question: 'What industry do you work in?',
      category: 'professional',
      field: 'industry',
      type: 'text',
      required: false
    },
    {
      id: 'prof_specializations',
      question: 'What are your specializations? (comma-separated)',
      category: 'professional',
      field: 'specializations',
      type: 'multiselect',
      required: false
    },
    {
      id: 'prof_skills',
      question: 'What are your main technical skills? (comma-separated)',
      category: 'professional',
      field: 'skills',
      type: 'multiselect',
      required: false
    }
  ],
  preferences: [
    {
      id: 'pref_communication',
      question: 'How do you prefer communication? (formal/casual/technical)',
      category: 'preferences',
      field: 'communicationStyle',
      type: 'select',
      options: ['formal', 'casual', 'technical', 'balanced'],
      required: false
    },
    {
      id: 'pref_detail',
      question: 'How detailed should responses be?',
      category: 'preferences',
      field: 'responseDetail',
      type: 'select',
      options: ['concise', 'detailed', 'balanced'],
      required: false
    },
    {
      id: 'pref_technical',
      question: 'What is your technical expertise level?',
      category: 'preferences',
      field: 'technicalLevel',
      type: 'select',
      options: ['beginner', 'intermediate', 'expert'],
      required: false
    }
  ],
  projects: [
    {
      id: 'proj_current',
      question: 'What projects are you currently working on? (comma-separated)',
      category: 'projects',
      field: 'currentProjects',
      type: 'multiselect',
      required: false
    },
    {
      id: 'proj_tech',
      question: 'What technologies are you using? (comma-separated)',
      category: 'projects',
      field: 'technologies',
      type: 'multiselect',
      required: false
    },
    {
      id: 'proj_goals',
      question: 'What are your current goals? (comma-separated)',
      category: 'projects',
      field: 'goals',
      type: 'multiselect',
      required: false
    }
  ]
};

export const quickForms: Record<string, any> = {
  identity: {
    title: "Quick Identity Setup",
    fields: {
      name: { type: 'text', label: 'Full Name', required: true },
      occupation: { type: 'text', label: 'Job Title', required: true },
      location: { type: 'text', label: 'Location', required: false },
      languages: { type: 'array', label: 'Languages', required: false }
    }
  },
  technical: {
    title: "Technical Profile",
    fields: {
      role: { type: 'text', label: 'Role', required: true },
      experience: { type: 'number', label: 'Years of Experience', required: true },
      skills: { type: 'array', label: 'Skills', required: true },
      tools: { type: 'array', label: 'Favorite Tools', required: false }
    }
  },
  organization: {
    title: "Organization Setup",
    fields: {
      orgName: { type: 'text', label: 'Organization Name', required: true },
      industry: { type: 'text', label: 'Industry', required: true },
      size: { type: 'select', label: 'Company Size', options: ['1-10', '11-50', '51-200', '200+'], required: false },
      mission: { type: 'text', label: 'Mission', required: false }
    }
  }
};

export function parseFormInput(input: string, type: string): any {
  if (type === 'array' || type === 'multiselect') {
    return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } else if (type === 'number') {
    return parseInt(input, 10);
  } else if (type === 'boolean') {
    return input.toLowerCase() === 'true' || input.toLowerCase() === 'yes';
  }
  return input;
}