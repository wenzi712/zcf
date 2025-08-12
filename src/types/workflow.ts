export type WorkflowType = 'sixStepsWorkflow' | 'featPlanUx' | 'bmadWorkflow' | 'gitWorkflow';

export type AgentType = 
  | 'planner' 
  | 'ui-ux-designer'
  | 'bmad-analyst'
  | 'bmad-pm'
  | 'bmad-architect'
  | 'bmad-sm'
  | 'bmad-dev'
  | 'bmad-qa'
  | 'bmad-po';

export interface WorkflowAgent {
  id: string;
  filename: string;
  required: boolean;
}

export interface WorkflowConfig {
  id: string;
  nameKey: string;
  descriptionKey?: string;
  defaultSelected: boolean;
  order: number;
  commands: string[];
  agents: WorkflowAgent[];
  autoInstallAgents: boolean;
  category: 'plan' | 'sixStep' | 'bmad' | 'git';
  outputDir: string;
}

export interface WorkflowInstallResult {
  workflow: string;
  success: boolean;
  installedCommands: string[];
  installedAgents: string[];
  errors?: string[];
}