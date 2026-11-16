import type { ValidationIssue, ValidationResult, MealyMachine, MooreMachine, Machine } from '../types/machine';

function validateMealyMachine(machine: MealyMachine): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. At least one state
  if (machine.states.length === 0) {
    issues.push({ severity: 'error', message: 'Machine must have at least one state.' });
  }

  // 2. Unique state names
  const stateSet = new Set(machine.states);
  if (stateSet.size !== machine.states.length) {
    issues.push({ severity: 'error', message: 'State names must be unique.' });
  }

  // 3. At least one alphabet symbol
  if (machine.alphabet.length === 0) {
    issues.push({ severity: 'error', message: 'Alphabet must have at least one symbol.' });
  }

  // 4. Unique alphabet symbols
  const alphaSet = new Set(machine.alphabet);
  if (alphaSet.size !== machine.alphabet.length) {
    issues.push({ severity: 'error', message: 'Alphabet symbols must be unique.' });
  }

  // 5. Initial state exists
  if (machine.initialState === '') {
    issues.push({ severity: 'error', message: 'An initial state must be selected.' });
  } else if (!stateSet.has(machine.initialState)) {
    issues.push({ severity: 'error', message: `Initial state "${machine.initialState}" does not exist in states.` });
  }

  // 6. Validate transitions
  const transitionKeys = new Set<string>();
  for (const t of machine.transitions) {
    if (!stateSet.has(t.currentState)) {
      issues.push({ severity: 'error', message: `Transition source state "${t.currentState}" does not exist.` });
    }
    if (!stateSet.has(t.nextState)) {
      issues.push({ severity: 'error', message: `Transition destination state "${t.nextState}" does not exist.` });
    }
    if (!alphaSet.has(t.input)) {
      issues.push({ severity: 'error', message: `Transition input "${t.input}" is not in the alphabet.` });
    }
    if (t.output === '' || t.output === undefined) {
      issues.push({ severity: 'error', message: `Transition (${t.currentState}, ${t.input}) has no output.` });
    }
    const key = `${t.currentState}__${t.input}`;
    if (transitionKeys.has(key)) {
      issues.push({ severity: 'error', message: `Duplicate transition for state "${t.currentState}" with input "${t.input}".` });
    }
    transitionKeys.add(key);
  }

  // 7. Completeness check - every (state, input) must have a transition
  for (const state of machine.states) {
    for (const symbol of machine.alphabet) {
      if (!transitionKeys.has(`${state}__${symbol}`)) {
        issues.push({ severity: 'error', message: `Missing transition: state "${state}" with input "${symbol}".` });
      }
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}

function validateMooreMachine(machine: MooreMachine): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. At least one state
  if (machine.states.length === 0) {
    issues.push({ severity: 'error', message: 'Machine must have at least one state.' });
  }

  // 2. Unique state names
  const stateSet = new Set(machine.states);
  if (stateSet.size !== machine.states.length) {
    issues.push({ severity: 'error', message: 'State names must be unique.' });
  }

  // 3. At least one alphabet symbol
  if (machine.alphabet.length === 0) {
    issues.push({ severity: 'error', message: 'Alphabet must have at least one symbol.' });
  }

  // 4. Unique alphabet symbols
  const alphaSet = new Set(machine.alphabet);
  if (alphaSet.size !== machine.alphabet.length) {
    issues.push({ severity: 'error', message: 'Alphabet symbols must be unique.' });
  }

  // 5. Initial state exists
  if (machine.initialState === '') {
    issues.push({ severity: 'error', message: 'An initial state must be selected.' });
  } else if (!stateSet.has(machine.initialState)) {
    issues.push({ severity: 'error', message: `Initial state "${machine.initialState}" does not exist in states.` });
  }

  // 6. Every state has an output
  for (const state of machine.states) {
    if (machine.stateOutputs[state] === undefined || machine.stateOutputs[state] === '') {
      issues.push({ severity: 'error', message: `State "${state}" has no output defined.` });
    }
  }

  // 7. Validate transitions
  const transitionKeys = new Set<string>();
  for (const t of machine.transitions) {
    if (!stateSet.has(t.currentState)) {
      issues.push({ severity: 'error', message: `Transition source state "${t.currentState}" does not exist.` });
    }
    if (!stateSet.has(t.nextState)) {
      issues.push({ severity: 'error', message: `Transition destination state "${t.nextState}" does not exist.` });
    }
    if (!alphaSet.has(t.input)) {
      issues.push({ severity: 'error', message: `Transition input "${t.input}" is not in the alphabet.` });
    }
    const key = `${t.currentState}__${t.input}`;
    if (transitionKeys.has(key)) {
      issues.push({ severity: 'error', message: `Duplicate transition for state "${t.currentState}" with input "${t.input}".` });
    }
    transitionKeys.add(key);
  }

  // 8. Completeness check
  for (const state of machine.states) {
    for (const symbol of machine.alphabet) {
      if (!transitionKeys.has(`${state}__${symbol}`)) {
        issues.push({ severity: 'error', message: `Missing transition: state "${state}" with input "${symbol}".` });
      }
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}

export function validateMachine(machine: Machine): ValidationResult {
  if (machine.type === 'mealy') {
    return validateMealyMachine(machine);
  } else {
    return validateMooreMachine(machine);
  }
}

