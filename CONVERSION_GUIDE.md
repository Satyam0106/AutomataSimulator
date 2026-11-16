# AutomataLab — Complete Conversion & Algorithm Guide

This document explains **what algorithms power AutomataLab**, **how the conversions work mathematically and in code**, **walkthrough examples**, and **how to explain the project during your presentation/viva**.

---

## 1. Fundamental Theory: Why Conversion is Needed

Both **Mealy** and **Moore** machines are deterministic finite-state transducers defined as a 6-tuple:
$$M = (Q, \Sigma, \Delta, \delta, \lambda, q_0)$$

| Component | Meaning | Mealy Machine | Moore Machine |
| :--- | :--- | :--- | :--- |
| $Q$ | Finite set of states | Same | Same |
| $\Sigma$ | Input alphabet | Same | Same |
| $\Delta$ | Output alphabet | Same | Same |
| $q_0 \in Q$ | Initial state | Same | Same |
| $\delta$ | Transition function | $\delta: Q \times \Sigma \to Q$ | $\delta: Q \times \Sigma \to Q$ |
| $\lambda$ | **Output function** | $\lambda: Q \times \Sigma \to \Delta$ *(depends on state & input)* | $\lambda: Q \to \Delta$ *(depends ONLY on state)* |

### Core Theorem of Equivalence
> For every Mealy machine $M_{\text{mealy}}$, there exists an equivalent Moore machine $M_{\text{moore}}$ (and vice versa) such that for any input string $w = a_1 a_2 \dots a_n$, the transition-triggered output of $M_{\text{moore}}$ is identical to the output of $M_{\text{mealy}}$.

---

## 2. Algorithm 1: Mealy $\to$ Moore Conversion (`src/algorithms/mealyToMoore.ts`)

### Why is Mealy $\to$ Moore Non-Trivial? (The State-Splitting Problem)
In a Mealy machine, outputs sit on **directed edges (transitions)**. Suppose two transitions enter the same state $q_1$ with **different outputs**:
- $q_0 \xrightarrow{a / 0} q_1$ (enters $q_1$ and outputs `0`)
- $q_2 \xrightarrow{a / 1} q_1$ (enters $q_1$ and outputs `1`)

In a Moore machine, the output must live **inside the state** $q_1$. A single state $q_1$ cannot simultaneously have output `0` and output `1`.  
Therefore, the algorithm **splits** $q_1$ into two separate Moore states:
- `q1_0` with fixed state output `0`
- `q1_1` with fixed state output `1`

---

### Exact 6-Step Algorithm Implemented in `mealyToMoore.ts`

#### **Step 1: Read & Validate the 6-Tuple**
The function `mealyToMoore(mealy: MealyMachine)` receives the validated Mealy machine containing `states`, `alphabet`, `initialState`, and `transitions`.

#### **Step 2: Collect Incoming Outputs per Destination State (`destOutputMap`)**
We scan all transitions $t \in \text{mealy.transitions}$ and group every output that enters each destination state `t.nextState`:
$$\text{InOut}(q) = \{ \lambda(p, a) \mid \delta(p, a) = q \}$$

In code (`mealyToMoore.ts`):
```ts
const destOutputMap: Record<string, Set<string>> = {};
for (const state of mealy.states) {
  destOutputMap[state] = new Set();
}
for (const t of mealy.transitions) {
  destOutputMap[t.nextState].add(t.output);
}
```

#### **Step 3: Construct Moore States (State Splitting Decision)**
For every Mealy state $q \in Q$, we inspect the size of `destOutputMap[q]`:

1. **Case A — Single Incoming Output ($|\text{InOut}(q)| = 1$):**  
   All transitions entering $q$ produce the same output $z$.  
   $\to$ **No split needed.** Create a single Moore state named `q` with output $\lambda'(q) = z$.
2. **Case B — Multiple Incoming Outputs ($|\text{InOut}(q)| > 1$):**  
   Transitions entering $q$ produce distinct outputs $\{z_1, z_2, \dots, z_k\}$.  
   $\to$ **State Splitting Required.** Create $k$ Moore states named `q_z1`, `q_z2`, ..., `q_zk`, where each split state has output $\lambda'(q_{z_i}) = z_i$.
3. **Case C — Unreachable / Zero Incoming Transitions ($|\text{InOut}(q)| = 0$):**  
   Only possible for the initial state if no transition loops back to it.  
   $\to$ Create a single Moore state `q` with default output `"0"`.

We store a lookup table `pairToMooreName` mapping `(mealyState, output)` $\to$ `mooreStateName`.

#### **Step 4: Reconstruct Transitions (`mooreTransitions`)**
For each newly created Moore state `q_rep` (which came from original Mealy state `q`) and for each input symbol $a \in \Sigma$:
1. Look up the original Mealy transition: $\delta(q, a) = r$ with output $\lambda(q, a) = z$.
2. Find the target Moore state corresponding to the pair $(r, z)$ in `pairToMooreName`.
3. Create the Moore transition:
   $$\delta'(q_{\text{rep}}, a) = \text{MooreState}(r, z)$$

> **Crucial Insight:** If state `q1` was split into `q1_0` and `q1_1`, both `q1_0` and `q1_1` receive the **exact same outgoing transitions** because in the original Mealy machine both represent being in state `q1`.

#### **Step 5: Assign State Outputs (`stateOutputs`)**
Each Moore state `mooreName` is assigned its fixed output `entry.output` in `stateOutputs[mooreName]`.

#### **Step 6: Select Initial State & Return Result**
- If $q_0$ was not split, the Moore initial state is $q_0$.
- If $q_0$ was split into $q_{0\_z_1}, q_{0\_z_2}, \dots$, we designate the first split state $q_{0\_z_1}$ as the initial state (since all split copies of $q_0$ have identical outgoing transitions).

---

### Dry-Run Example: Mealy State-Splitting Example

**Input Mealy Machine:**
- States: `{q0, q1, q2}`, Alphabet: `{a, b}`, Initial: `q0`
- Transitions:
  - `q0 -- a/0 --> q1`, `q0 -- b/1 --> q2`
  - `q1 -- a/1 --> q1`, `q1 -- b/0 --> q0`
  - `q2 -- a/1 --> q1`, `q2 -- b/0 --> q0`

**How `mealyToMoore.ts` Converts It:**
1. **Incoming Outputs (`destOutputMap`):**
   - `q0` receives outputs: `{0}` (from `q1` on `b`, and `q2` on `b`) $\to$ **No split** (`q0` gets output `0`)
   - `q1` receives outputs: `{0, 1}` (`0` from `q0` on `a`; `1` from `q1` on `a` and `q2` on `a`) $\to$ **SPLIT into `q1_0` and `q1_1`**
   - `q2` receives outputs: `{1}` (from `q0` on `b`) $\to$ **No split** (`q2` gets output `1`)
2. **Resulting Moore States & Outputs:**
   - `q0 / 0`, `q1_0 / 0`, `q1_1 / 1`, `q2 / 1`
3. **Resulting Moore Transitions:**
   - From `q0`: on `a` $\to$ `q1_0` (since Mealy gave `q1` with `0`); on `b` $\to$ `q2` (Mealy gave `q2` with `1`)
   - From `q1_0`: on `a` $\to$ `q1_1` (Mealy gave `q1` with `1`); on `b` $\to$ `q0` (Mealy gave `q0` with `0`)
   - From `q1_1`: on `a` $\to$ `q1_1` (Mealy gave `q1` with `1`); on `b` $\to$ `q0` (Mealy gave `q0` with `0`)
   - From `q2`: on `a` $\to$ `q1_1` (Mealy gave `q1` with `1`); on `b` $\to$ `q0` (Mealy gave `q0` with `0`)

---

## 3. Algorithm 2: Moore $\to$ Mealy Conversion (`src/algorithms/mooreToMealy.ts`)

### Why Moore $\to$ Mealy Never Splits States
In a Moore machine, every state $q$ already has a single deterministic output $\lambda_{\text{moore}}(q)$. When converting to a Mealy machine, we simply **push the destination state's output onto every incoming transition edge**.

### Mathematical Rule
For every Moore transition $\delta_{\text{moore}}(p, a) = q$:
$$\delta_{\text{mealy}}(p, a) = q, \qquad \lambda_{\text{mealy}}(p, a) = \lambda_{\text{moore}}(q)$$

### Code Implementation (`mooreToMealy.ts`)
```ts
for (const t of moore.transitions) {
  const output = moore.stateOutputs[t.nextState] ?? '';
  mealyTransitions.push({
    id: generateId(),
    currentState: t.currentState,
    input: t.input,
    nextState: t.nextState,
    output, // Output of the DESTINATION Moore state
  });
}
```
- **Number of States:** Always unchanged ($|Q_{\text{mealy}}| = |Q_{\text{moore}}|$).
- **Number of Transitions:** Always unchanged ($|Q| \times |\Sigma|$).

---

## 4. Algorithm 3: Deterministic Validation (`src/algorithms/validateMachine.ts`)

Before any conversion is allowed, `validateMachine(machine)` enforces **Deterministic Finite Transducer** rules:
1. $Q \neq \emptyset$ and $\Sigma \neq \emptyset$ (non-empty states and alphabet).
2. All state names and alphabet symbols are unique.
3. Initial state $q_0 \in Q$.
4. **Total / Deterministic Transition Function:** Every pair $(q, a) \in Q \times \Sigma$ must have **exactly one** transition:
   - If a $(q, a)$ pair appears twice $\to$ flags **Duplicate Transition Error** (non-determinism).
   - If a $(q, a)$ pair is missing $\to$ flags **Missing Transition Error** (incomplete DFA transducer).
5. Every Mealy transition has a non-empty output; every Moore state has a defined output.

---

## 5. Algorithm 4: Simulation & Equivalence Verification

### Simulation Engine (`src/simulation/simulateMachine.ts`)
- **Mealy Simulation (`simulateMealy`):**
  Starts at $q_0$. For each input symbol $a_i$ ($i = 1 \dots n$):
  - Finds transition $(q_{\text{curr}}, a_i) \to (q_{\text{next}}, z_i)$
  - Appends $z_i$ to `outputSequence`
  - **Total Output Length:** $n$
- **Moore Simulation (`simulateMoore`):**
  Starts at $q_0$ and **immediately emits** $\lambda(q_0)$ at Step 0 (before reading any input).
  For each input symbol $a_i$ ($i = 1 \dots n$):
  - Finds transition $(q_{\text{curr}}, a_i) \to q_{\text{next}}$
  - Emits destination state output $\lambda(q_{\text{next}})$
  - **Total Output Length:** $n + 1$

### Equivalence Engine (`src/algorithms/equivalence.ts`)
To compare an original and converted machine across 30+ generated strings ($\epsilon$, single symbols, pairs, and strings up to length 5):
- For a Moore machine, we drop the Step 0 initial output (`rawResult.outputSequence.slice(1).join('')`) and compare the $n$ transition-triggered outputs against the Mealy machine's $n$ outputs.
- If all test strings produce identical normalized outputs, the test suite reports **100% behavioral consistency**.

---

## 6. Quick Reference: Where Each File Lives

| File | Responsibility |
| :--- | :--- |
| `src/types/machine.ts` | Core TypeScript interfaces for Mealy, Moore, Validation, Conversion, and Simulation |
| `src/algorithms/validateMachine.ts` | Deterministic completeness & structural validation |
| `src/algorithms/mealyToMoore.ts` | Mealy $\to$ Moore conversion with automatic state splitting |
| `src/algorithms/mooreToMealy.ts` | Moore $\to$ Mealy conversion via destination output propagation |
| `src/simulation/simulateMachine.ts` | Step-by-step execution engine for input strings |
| `src/algorithms/equivalence.ts` | Automated test-string generator and normalized output comparator |
| `src/components/StateDiagram.tsx` | Interactive React Flow graph with circular nodes, curved bidirectional edges, and self-loops |

