# AutomataLab — Mealy ↔ Moore Machine Conversion Simulator

An interactive **Theory of Computation (TOC)** web application for designing, validating, converting, visualizing, and testing **Mealy** and **Moore** finite-state transducers.

---

## Project Overview

**AutomataLab** enables students and educators to explore the mathematical equivalence between Mealy and Moore machines through an end-to-end interactive workflow:

1. **Select Conversion Mode** (`Mealy → Moore` or `Moore → Mealy`)
2. **Create / Load Machine** (interactive builder or 6 curated example machines)
3. **Validate Machine** (deterministic completeness, unique states/alphabet, valid outputs)
4. **Inspect Original Machine** (formal transition table + interactive state diagram)
5. **Convert Machine** (mathematically sound state-splitting & output-propagation algorithms)
6. **Step-by-Step Conversion Walkthrough** (play/pause/step through every stage of the algorithm)
7. **Inspect Converted Machine** (converted transition table, state output table, and state diagram)
8. **Input String Simulation** (step-by-step execution table + animated graph playback)
9. **Equivalence Verification** (single-string comparison + automated 30-test-case suite)

---

## Features

- **Full Bidirectional Conversion**:
  - **Mealy → Moore**: Automatically detects when a state is entered with multiple distinct outputs and performs **state splitting** ($q \to q_{z_1}, q_{z_2}, \dots$).
  - **Moore → Mealy**: Propagates destination state outputs onto incoming transitions ($\lambda_{\text{mealy}}(q, a) = \lambda_{\text{moore}}(\delta(q, a))$).
- **Deterministic Validation Engine**: Prevents invalid conversions and highlights missing or duplicate $(q, a)$ transitions.
- **Interactive State Diagrams**: Built with `@xyflow/react` (React Flow), supporting circular nodes, self-loops, zoom/pan, minimap, and draggable rearrangement.
- **Animated String Simulator**: Play, pause, step forward/backward, and watch active states highlight live on both original and converted graphs.
- **Explicit Output Timing Convention**: Accurately accounts for the initial state output $\lambda(q_0)$ in Moore machines during simulation and equivalence verification.
- **JSON Import / Export**: Save and reload machine definitions as JSON files.

---

## Theory

### Mealy Machine
A Mealy machine is a 6-tuple $M = (Q, \Sigma, \Delta, \delta, \lambda, q_0)$ where the output depends on both the **current state** and the **current input symbol**:
$$\delta: Q \times \Sigma \to Q, \qquad \lambda: Q \times \Sigma \to \Delta$$
Transitions are labeled `input / output` (e.g., `q0 -- 0/1 --> q1`).

### Moore Machine
A Moore machine is a 6-tuple $M = (Q, \Sigma, \Delta, \delta, \lambda, q_0)$ where the output depends **solely on the current state**:
$$\delta: Q \times \Sigma \to Q, \qquad \lambda: Q \to \Delta$$
States are labeled `state / output` (e.g., `q0 / 0`), and transitions carry only the input symbol.

### Conversion Algorithms
- **Mealy → Moore**: For each state $q \in Q$, collect all incoming outputs $\text{InOut}(q) = \{ \lambda(p, a) \mid \delta(p, a) = q \}$. If $|\text{InOut}(q)| > 1$, split $q$ into $q_{z_1}, q_{z_2}, \dots$ so each Moore state has a single well-defined output.
- **Moore → Mealy**: Keep the same states and transitions, and assign each transition $(p, a) \to q$ the output $\lambda_{\text{moore}}(q)$.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Flow** (`@xyflow/react`)
- **Lucide React**

---

## Installation

```bash
cd automatalab
npm install
npm run dev
```

---

## Project Structure

```text
automatalab/
├── public/
├── src/
│   ├── algorithms/
│   │   ├── mealyToMoore.ts
│   │   ├── mooreToMealy.ts
│   │   ├── validateMachine.ts
│   │   └── equivalence.ts
│   ├── simulation/
│   │   └── simulateMachine.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── MachineSelector.tsx
│   │   ├── MachineBuilder.tsx
│   │   ├── TransitionTable.tsx
│   │   ├── StateTable.tsx
│   │   ├── ValidationPanel.tsx
│   │   ├── StateDiagram.tsx
│   │   ├── ConversionSteps.tsx
│   │   ├── SimulationPanel.tsx
│   │   ├── ExecutionTable.tsx
│   │   ├── EquivalencePanel.tsx
│   │   ├── ExampleSelector.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Simulator.tsx
│   │   ├── Theory.tsx
│   │   └── About.tsx
│   ├── data/
│   │   └── exampleMachines.ts
│   ├── types/
│   │   └── machine.ts
│   ├── utils/
│   │   └── machineUtils.ts
│   ├── tests/
│   │   └── algorithms.test.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── README.md
```

