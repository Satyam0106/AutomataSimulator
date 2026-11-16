/**
 * Moore → Mealy Conversion Algorithm
 *
 * This is the simpler conversion direction.
 *
 * For each Moore transition:   δ(p, a) = q
 * Create a Mealy transition:  δ(p, a) = q,  λ(p, a) = λ_moore(q)
 *
 * The output on a Mealy transition is the output of the DESTINATION Moore state.
 *
 * Convention note:
 *   The initial Moore state has an output λ(q0). In the Mealy machine there is
 *   no transition leading to the initial state (it's the start), so the initial
 *   output of the Moore machine has no direct Mealy equivalent. The simulator
 *   documents this and handles simulation accordingly.
 */

import type {
  MooreMachine,
  MealyMachine,
  ConversionResult,
  ConversionStep,
  MealyTransition,
} from '../types/machine';

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function mooreToMealy(moore: MooreMachine): ConversionResult {
  const steps: ConversionStep[] = [];
  const stateMapping: Record<string, string> = {};

  // Each Moore state maps 1:1 to a Mealy state
  for (const state of moore.states) {
    stateMapping[state] = state;
  }

  // ── Step 1: Analyze original machine ──────────────────────────────────
  steps.push({
    stepNumber: 1,
    title: 'Analyze Original Moore Machine',
    description:
      'Examine the Moore machine. Each state has an associated output. ' +
      'Transitions do not carry outputs — they only specify the next state.',
    details: [
      `States: { ${moore.states.join(', ')} }`,
      `Alphabet: { ${moore.alphabet.join(', ')} }`,
      `Initial state: ${moore.initialState}`,
      `State outputs: ${Object.entries(moore.stateOutputs).map(([s, o]) => `λ(${s})="${o}"`).join(', ')}`,
      `Total transitions: ${moore.transitions.length}`,
    ],
    highlightStates: moore.states,
  });

  // ── Step 2: Explain the conversion rule ───────────────────────────────
  steps.push({
    stepNumber: 2,
    title: 'Understand the Conversion Rule',
    description:
      'For every Moore transition δ(p, a) = q, we create a Mealy transition ' +
      'δ(p, a) = q with output λ(q). The output of the Mealy transition equals ' +
      'the output of the destination Moore state.',
    details: moore.transitions.map(
      (t) =>
        `Moore: δ(${t.currentState}, ${t.input}) = ${t.nextState}  →  ` +
        `Mealy: δ(${t.currentState}, ${t.input}) = ${t.nextState}, λ = "${moore.stateOutputs[t.nextState] ?? '?'}"`
    ),
  });

  // ── Step 3: Convert each transition ───────────────────────────────────
  const mealyTransitions: MealyTransition[] = [];
  const conversionDetails: string[] = [];

  for (const t of moore.transitions) {
    const output = moore.stateOutputs[t.nextState] ?? '';
    mealyTransitions.push({
      id: generateId(),
      currentState: t.currentState,
      input: t.input,
      nextState: t.nextState,
      output,
    });
    conversionDetails.push(
      `δ(${t.currentState}, ${t.input}) = ${t.nextState},  output = "${output}"  ` +
      `[λ_moore(${t.nextState}) = "${output}"]`
    );
  }

  steps.push({
    stepNumber: 3,
    title: 'Build Mealy Transitions',
    description:
      'Each Moore transition is converted into a Mealy transition carrying the output of the destination state.',
    details: conversionDetails,
  });

  // ── Step 4: Note about initial state output ───────────────────────────
  const initOutput = moore.stateOutputs[moore.initialState] ?? '—';
  steps.push({
    stepNumber: 4,
    title: 'Handle Initial State Output',
    description:
      `The Moore machine produces an initial output λ(${moore.initialState}) = "${initOutput}" ` +
      `before reading any input. This has no direct Mealy equivalent because Mealy outputs ` +
      `are produced only during transitions. When simulating, the Moore machine's initial output ` +
      `is included at the start of the output sequence, while the Mealy machine begins outputting ` +
      `only after the first transition.`,
    details: [
      `Moore initial output: λ(${moore.initialState}) = "${initOutput}"`,
      'Mealy machines do not produce an initial output.',
      'Simulation convention: Moore output sequence includes the initial state output; Mealy does not.',
      'Equivalence checking uses the transition outputs only (after the first symbol is read).',
    ],
    highlightStates: [moore.initialState],
  });

  // ── Step 5: States map 1:1 ────────────────────────────────────────────
  steps.push({
    stepNumber: 5,
    title: 'State Mapping',
    description:
      'Moore → Mealy conversion does not require state splitting. ' +
      'Each Moore state corresponds exactly to one Mealy state with the same name.',
    details: moore.states.map((s) => `${s} → ${s}  (output moves to transitions entering this state)`),
    highlightStates: moore.states,
  });

  // ── Step 6: Final Mealy machine ───────────────────────────────────────
  const mealyMachine: MealyMachine = {
    type: 'mealy',
    states: [...moore.states],
    alphabet: [...moore.alphabet],
    initialState: moore.initialState,
    transitions: mealyTransitions,
  };

  steps.push({
    stepNumber: 6,
    title: 'Final Mealy Machine',
    description: 'The converted Mealy machine is complete.',
    details: [
      `States: { ${mealyMachine.states.join(', ')} }`,
      `Alphabet: { ${mealyMachine.alphabet.join(', ')} }`,
      `Initial state: ${mealyMachine.initialState}`,
      `Transitions: ${mealyTransitions.length}`,
    ],
    highlightStates: mealyMachine.states,
  });

  return {
    originalMachine: moore,
    convertedMachine: mealyMachine,
    steps,
    stateMapping,
  };
}

