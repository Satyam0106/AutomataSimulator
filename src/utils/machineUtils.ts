import type { MealyMachine, MooreMachine, MealyTransition, MooreTransition } from '../types/machine';

function gid() {
  return Math.random().toString(36).slice(2, 9);
}

export function createEmptyMealy(): MealyMachine {
  return {
    type: 'mealy',
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    initialState: 'q0',
    transitions: [],
  };
}

export function createEmptyMoore(): MooreMachine {
  return {
    type: 'moore',
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    initialState: 'q0',
    stateOutputs: { q0: '0', q1: '1' },
    transitions: [],
  };
}

export function addMealyTransition(
  machine: MealyMachine,
  currentState: string,
  input: string,
  nextState: string,
  output: string
): MealyMachine {
  const t: MealyTransition = { id: gid(), currentState, input, nextState, output };
  return { ...machine, transitions: [...machine.transitions, t] };
}

export function addMooreTransition(
  machine: MooreMachine,
  currentState: string,
  input: string,
  nextState: string
): MooreMachine {
  const t: MooreTransition = { id: gid(), currentState, input, nextState };
  return { ...machine, transitions: [...machine.transitions, t] };
}

export function removeMealyTransition(machine: MealyMachine, id: string): MealyMachine {
  return { ...machine, transitions: machine.transitions.filter((t) => t.id !== id) };
}

export function removeMooreTransition(machine: MooreMachine, id: string): MooreMachine {
  return { ...machine, transitions: machine.transitions.filter((t) => t.id !== id) };
}

export function updateMealyTransition(
  machine: MealyMachine,
  id: string,
  update: Partial<Omit<MealyTransition, 'id'>>
): MealyMachine {
  return {
    ...machine,
    transitions: machine.transitions.map((t) => (t.id === id ? { ...t, ...update } : t)),
  };
}

export function updateMooreTransition(
  machine: MooreMachine,
  id: string,
  update: Partial<Omit<MooreTransition, 'id'>>
): MooreMachine {
  return {
    ...machine,
    transitions: machine.transitions.map((t) => (t.id === id ? { ...t, ...update } : t)),
  };
}

export function addState(machine: MealyMachine | MooreMachine, state: string) {
  if (machine.states.includes(state)) return machine;
  if (machine.type === 'mealy') {
    return { ...machine, states: [...machine.states, state] };
  } else {
    return {
      ...machine,
      states: [...machine.states, state],
      stateOutputs: { ...machine.stateOutputs, [state]: '0' },
    };
  }
}

export function removeState(machine: MealyMachine | MooreMachine, state: string) {
  const newStates = machine.states.filter((s) => s !== state);
  if (machine.type === 'mealy') {
    return {
      ...machine,
      states: newStates,
      initialState: machine.initialState === state ? (newStates[0] ?? '') : machine.initialState,
      transitions: machine.transitions.filter(
        (t) => t.currentState !== state && t.nextState !== state
      ),
    };
  } else {
    const newOutputs = { ...machine.stateOutputs };
    delete newOutputs[state];
    return {
      ...machine,
      states: newStates,
      stateOutputs: newOutputs,
      initialState: machine.initialState === state ? (newStates[0] ?? '') : machine.initialState,
      transitions: machine.transitions.filter(
        (t) => t.currentState !== state && t.nextState !== state
      ),
    };
  }
}

