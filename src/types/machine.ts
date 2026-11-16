// ─── Core Machine Types ────────────────────────────────────────────────────

export interface MealyTransition {
  id: string;
  currentState: string;
  input: string;
  nextState: string;
  output: string;
}

export interface MooreTransition {
  id: string;
  currentState: string;
  input: string;
  nextState: string;
}

export interface MealyMachine {
  type: 'mealy';
  states: string[];
  alphabet: string[];
  initialState: string;
  transitions: MealyTransition[];
}

export interface MooreMachine {
  type: 'moore';
  states: string[];
  alphabet: string[];
  initialState: string;
  stateOutputs: Record<string, string>;
  transitions: MooreTransition[];
}

export type Machine = MealyMachine | MooreMachine;

// ─── Validation Types ─────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: ValidationSeverity;
  message: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

// ─── Conversion Types ─────────────────────────────────────────────────────

export interface ConversionStep {
  stepNumber: number;
  title: string;
  description: string;
  details: string[];
  highlightStates?: string[];
  highlightTransitions?: string[];
  data?: Record<string, unknown>;
}

export interface ConversionResult {
  originalMachine: Machine;
  convertedMachine: Machine;
  steps: ConversionStep[];
  stateMapping: Record<string, string>;  // original → converted
}

// ─── Simulation Types ─────────────────────────────────────────────────────

export interface ExecutionStep {
  stepIndex: number;
  input: string;
  currentState: string;
  nextState: string;
  output: string;
  transitionId: string;
}

export interface SimulationResult {
  inputString: string;
  stateSequence: string[];
  outputSequence: string[];
  executionSteps: ExecutionStep[];
  finalOutput: string;
  success: boolean;
  error?: string;
}

// ─── Equivalence Types ────────────────────────────────────────────────────

export interface TestCaseResult {
  input: string;
  originalOutput: string;
  convertedOutput: string;
  match: boolean;
}

export interface EquivalenceResult {
  passed: number;
  failed: number;
  totalTests: number;
  details: TestCaseResult[];
  equivalent: boolean;
  note: string;
}

// ─── App State Types ──────────────────────────────────────────────────────

export type ConversionMode = 'mealy-to-moore' | 'moore-to-mealy';
export type AppPage = 'home' | 'simulator' | 'theory' | 'about';

