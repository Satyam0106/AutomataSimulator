/**
 * Mealy → Moore Conversion Algorithm
 *
 * Mathematical Algorithm:
 *   1. Read the Mealy machine M = (Q, Σ, Δ, δ, λ, q0).
 *   2. For each state q ∈ Q, collect the set of all incoming transition outputs:
 *      InOut(q) = { λ(p, a) | δ(p, a) = q }.
 *   3. Construct Moore states Q' and output function λ':
 *      - If |InOut(q)| = 0 (no incoming transitions):
 *        Create single Moore state q with default output "0".
 *      - If |InOut(q)| = 1 (all incoming transitions produce the same output z):
 *        Create single Moore state q with λ'(q) = z (no splitting needed).
 *      - If |InOut(q)| > 1 (incoming transitions produce distinct outputs z1, z2, ...):
 *        Split state q into multiple Moore states q_z1, q_z2, ... with λ'(q_zi) = zi.
 *   4. Initial State:
 *      - If q0 was not split, the Moore initial state is q0.
 *      - If q0 was split into q0_z1, q0_z2, ..., select the first split state q0_z1
 *        as the initial state (all split copies of q0 share identical outgoing transitions).
 *   5. Construct Moore transitions δ':
 *      For every Moore state q_rep (representing Mealy state q) and every input a ∈ Σ:
 *      Let δ(q, a) = r and λ(q, a) = z.
 *      Then δ'(q_rep, a) = r_target, where r_target is the Moore state for (r, z).
 */

import type {
  MealyMachine,
  MooreMachine,
  ConversionResult,
  ConversionStep,
  MooreTransition,
} from '../types/machine';

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function mealyToMoore(mealy: MealyMachine): ConversionResult {
  const steps: ConversionStep[] = [];
  const stateMapping: Record<string, string> = {};

  // ── Step 1: Analyze original machine ──────────────────────────────────
  steps.push({
    stepNumber: 1,
    title: 'Analyze Original Mealy Machine',
    description:
      'Examine the Mealy machine structure: collect all states, input alphabet, initial state, and transition rules δ(q, a) / λ(q, a).',
    details: [
      `States Q = { ${mealy.states.join(', ')} }`,
      `Alphabet Σ = { ${mealy.alphabet.join(', ')} }`,
      `Initial state q₀ = ${mealy.initialState}`,
      `Total transitions = ${mealy.transitions.length}`,
    ],
    highlightStates: mealy.states,
  });

  // ── Step 2: Analyze incoming transition outputs per destination state ─
  const destOutputMap: Record<string, Set<string>> = {};
  for (const state of mealy.states) {
    destOutputMap[state] = new Set();
  }
  for (const t of mealy.transitions) {
    if (!destOutputMap[t.nextState]) {
      destOutputMap[t.nextState] = new Set();
    }
    destOutputMap[t.nextState].add(t.output);
  }

  const splitInfo: string[] = [];
  for (const state of mealy.states) {
    const outputs = [...(destOutputMap[state] ?? [])].sort();
    if (outputs.length === 0) {
      splitInfo.push(
        `State ${state}: no incoming transitions → keep single state ${state} (default output "0")`
      );
    } else if (outputs.length === 1) {
      splitInfo.push(
        `State ${state}: entered only with output "${outputs[0]}" → no splitting needed`
      );
    } else {
      splitInfo.push(
        `State ${state}: entered with multiple distinct outputs { ${outputs.join(', ')} } → SPLIT REQUIRED into ${outputs
          .map((o) => `${state}_${o}`)
          .join(', ')}`
      );
    }
  }

  steps.push({
    stepNumber: 2,
    title: 'Analyze Incoming Transition Outputs',
    description:
      'For each state, inspect the outputs of all transitions entering that state. Any state entered with two or more different outputs must be split in the Moore machine.',
    details: splitInfo,
  });

  // ── Step 3: Create equivalent Moore states (with state splitting) ─────
  interface MooreStateEntry {
    mooreName: string;
    mealyState: string;
    output: string;
  }

  const mooreStateEntries: MooreStateEntry[] = [];
  const pairToMooreName = new Map<string, string>();
  const firstMooreForState = new Map<string, string>();

  for (const state of mealy.states) {
    const outputs = [...(destOutputMap[state] ?? [])].sort();
    if (outputs.length === 0) {
      const mooreName = state;
      mooreStateEntries.push({ mooreName, mealyState: state, output: '0' });
      pairToMooreName.set(`${state}__0`, mooreName);
      firstMooreForState.set(state, mooreName);
      stateMapping[state] = mooreName;
    } else if (outputs.length === 1) {
      const out = outputs[0];
      const mooreName = state;
      mooreStateEntries.push({ mooreName, mealyState: state, output: out });
      pairToMooreName.set(`${state}__${out}`, mooreName);
      firstMooreForState.set(state, mooreName);
      stateMapping[state] = mooreName;
    } else {
      outputs.forEach((out, idx) => {
        const mooreName = `${state}_${out}`;
        mooreStateEntries.push({ mooreName, mealyState: state, output: out });
        pairToMooreName.set(`${state}__${out}`, mooreName);
        stateMapping[`${state}:${out}`] = mooreName;
        if (idx === 0) {
          firstMooreForState.set(state, mooreName);
          stateMapping[state] = mooreName;
        }
      });
    }
  }

  const initMooreName =
    firstMooreForState.get(mealy.initialState) ?? mealy.initialState;

  steps.push({
    stepNumber: 3,
    title: 'Create Equivalent Moore States',
    description:
      'Generate Moore states from the (state, output) pairs. States with multiple incoming outputs are split into distinct Moore states.',
    details: mooreStateEntries.map(
      (entry) =>
        `${entry.mooreName} ← Mealy state "${entry.mealyState}" with output "${entry.output}"${entry.mooreName === initMooreName ? ' [Initial State]' : ''
        }`
    ),
    highlightStates: mooreStateEntries.map((e) => e.mooreName),
  });

  // ── Step 4: Construct Moore transitions ───────────────────────────────
  const mooreTransitions: MooreTransition[] = [];
  const transitionDetails: string[] = [];

  for (const entry of mooreStateEntries) {
    const { mooreName: fromMooreName, mealyState } = entry;
    for (const symbol of mealy.alphabet) {
      const mealyTrans = mealy.transitions.find(
        (t) => t.currentState === mealyState && t.input === symbol
      );
      if (!mealyTrans) continue;

      const destMooreName =
        pairToMooreName.get(`${mealyTrans.nextState}__${mealyTrans.output}`) ??
        firstMooreForState.get(mealyTrans.nextState) ??
        mealyTrans.nextState;

      mooreTransitions.push({
        id: generateId(),
        currentState: fromMooreName,
        input: symbol,
        nextState: destMooreName,
      });

      transitionDetails.push(
        `δ'(${fromMooreName}, ${symbol}) = ${destMooreName}   [from Mealy: δ(${mealyState}, ${symbol}) = ${mealyTrans.nextState}, λ = ${mealyTrans.output}]`
      );
    }
  }

  steps.push({
    stepNumber: 4,
    title: 'Construct Moore Transitions',
    description:
      'For each Moore state and input symbol, route the transition to the Moore state corresponding to (nextState, transitionOutput).',
    details: transitionDetails,
  });

  // ── Step 5: Assign outputs to Moore states ────────────────────────────
  const stateOutputs: Record<string, string> = {};
  const outputDetails: string[] = [];
  for (const entry of mooreStateEntries) {
    stateOutputs[entry.mooreName] = entry.output;
    outputDetails.push(`λ'(${entry.mooreName}) = "${entry.output}"`);
  }

  steps.push({
    stepNumber: 5,
    title: 'Assign State Outputs',
    description:
      'Assign each Moore state its fixed state output λ\'(q) corresponding to the Mealy transition output that enters it.',
    details: outputDetails,
    highlightStates: mooreStateEntries.map((e) => e.mooreName),
  });

  // ── Step 6: Final converted Moore machine ─────────────────────────────
  const mooreStates = mooreStateEntries.map((e) => e.mooreName);
  const mooreMachine: MooreMachine = {
    type: 'moore',
    states: mooreStates,
    alphabet: [...mealy.alphabet],
    initialState: initMooreName,
    stateOutputs,
    transitions: mooreTransitions,
  };

  steps.push({
    stepNumber: 6,
    title: 'Final Converted Moore Machine',
    description:
      'The equivalent Moore machine is complete and ready for state-diagram inspection, input simulation, and equivalence testing.',
    details: [
      `States Q' = { ${mooreStates.join(', ')} }`,
      `Alphabet Σ = { ${mooreMachine.alphabet.join(', ')} }`,
      `Initial state q₀' = ${mooreMachine.initialState}`,
      `State outputs: ${Object.entries(stateOutputs)
        .map(([s, o]) => `λ'(${s})="${o}"`)
        .join(', ')}`,
      `Total transitions = ${mooreTransitions.length}`,
    ],
    highlightStates: mooreStates,
  });

  return {
    originalMachine: mealy,
    convertedMachine: mooreMachine,
    steps,
    stateMapping,
  };
}
