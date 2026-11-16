import React, { useState, useRef } from 'react';
import {
  RotateCcw,
  ArrowRightLeft,
  Download,
  Upload,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type {
  ConversionMode,
  Machine,
  MealyMachine,
  MooreMachine,
  ValidationResult,
  ConversionResult,
} from '../types/machine';
import { EXAMPLE_MACHINES } from '../data/exampleMachines';
import { createEmptyMealy, createEmptyMoore } from '../utils/machineUtils';
import { validateMachine } from '../algorithms/validateMachine';
import { mealyToMoore } from '../algorithms/mealyToMoore';
import { mooreToMealy } from '../algorithms/mooreToMealy';
import { MachineSelector } from '../components/MachineSelector';
import { ExampleSelector } from '../components/ExampleSelector';
import { MachineBuilder } from '../components/MachineBuilder';
import { TransitionTable } from '../components/TransitionTable';
import { StateTable } from '../components/StateTable';
import { ValidationPanel } from '../components/ValidationPanel';
import { StateDiagram } from '../components/StateDiagram';
import { ConversionSteps } from '../components/ConversionSteps';
import { SimulationPanel } from '../components/SimulationPanel';
import { EquivalencePanel } from '../components/EquivalencePanel';

export const Simulator: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>('mealy-to-moore');
  const [machine, setMachine] = useState<Machine>(() => {
    const firstMealy = EXAMPLE_MACHINES.find((e) => e.id === 'mealy-split');
    return firstMealy ? structuredClone(firstMealy.machine) : createEmptyMealy();
  });

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [simHighlightOrig, setSimHighlightOrig] = useState<string[]>([]);
  const [simHighlightConv, setSimHighlightConv] = useState<string[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Switch conversion mode
  const handleSelectMode = (newMode: ConversionMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setValidationResult(null);
    setConversionResult(null);
    setCurrentStepIndex(0);
    setSimHighlightOrig([]);
    setSimHighlightConv([]);
    setImportError(null);

    if (newMode === 'mealy-to-moore') {
      const ex = EXAMPLE_MACHINES.find((e) => e.id === 'mealy-split');
      setMachine(ex ? structuredClone(ex.machine) : createEmptyMealy());
    } else {
      const ex = EXAMPLE_MACHINES.find((e) => e.id === 'moore-convert');
      setMachine(ex ? structuredClone(ex.machine) : createEmptyMoore());
    }
  };

  // Update machine state and clear stale conversion
  const handleMachineChange = (updated: Machine) => {
    setMachine(updated);
    setValidationResult(null);
    setConversionResult(null);
    setSimHighlightOrig([]);
    setSimHighlightConv([]);
    setImportError(null);
  };

  // Load example machine
  const handleLoadExample = (exampleMachine: MealyMachine | MooreMachine) => {
    setMachine(structuredClone(exampleMachine));
    const v = validateMachine(exampleMachine);
    setValidationResult(v);
    setConversionResult(null);
    setCurrentStepIndex(0);
    setSimHighlightOrig([]);
    setSimHighlightConv([]);
    setImportError(null);
  };

  // Validate current machine
  const handleValidate = () => {
    const res = validateMachine(machine);
    setValidationResult(res);
    return res;
  };

  // Convert machine
  const handleConvert = () => {
    const v = validateMachine(machine);
    setValidationResult(v);
    if (!v.valid) {
      setConversionResult(null);
      return;
    }

    const result =
      machine.type === 'mealy'
        ? mealyToMoore(machine)
        : mooreToMealy(machine);

    setConversionResult(result);
    setCurrentStepIndex(0);
  };

  // Reset everything
  const handleReset = () => {
    setMachine(
      mode === 'mealy-to-moore' ? createEmptyMealy() : createEmptyMoore()
    );
    setValidationResult(null);
    setConversionResult(null);
    setCurrentStepIndex(0);
    setSimHighlightOrig([]);
    setSimHighlightConv([]);
    setImportError(null);
  };

  // Export JSON
  const handleExport = () => {
    const json = JSON.stringify(machine, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${machine.type}-machine.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (
          !parsed ||
          (parsed.type !== 'mealy' && parsed.type !== 'moore') ||
          !Array.isArray(parsed.states) ||
          !Array.isArray(parsed.alphabet) ||
          !Array.isArray(parsed.transitions)
        ) {
          setImportError('Invalid machine JSON structure.');
          return;
        }
        setImportError(null);
        const newMode: ConversionMode =
          parsed.type === 'mealy' ? 'mealy-to-moore' : 'moore-to-mealy';
        setMode(newMode);
        setMachine(parsed as Machine);
        setValidationResult(validateMachine(parsed as Machine));
        setConversionResult(null);
      } catch {
        setImportError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Determine highlighted states for diagrams
  const stepHighlightStates =
    conversionResult?.steps[currentStepIndex]?.highlightStates ?? [];

  const origHighlighted =
    simHighlightOrig.length > 0 ? simHighlightOrig : stepHighlightStates;

  const convHighlighted =
    simHighlightConv.length > 0 ? simHighlightConv : stepHighlightStates;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Machine Conversion Simulator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Design, validate, convert, visualize, and verify Mealy and Moore finite-state machines.
          </p>
        </div>

        {/* Toolbar: Example Selector, Import/Export, Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <ExampleSelector mode={mode} onLoad={handleLoadExample} />

          <button
            onClick={handleExport}
            className="btn-secondary text-xs py-1.5"
            title="Export machine configuration as JSON"
          >
            <Download size={13} /> Export
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-xs py-1.5"
            title="Import machine configuration from JSON"
          >
            <Upload size={13} /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImport}
          />

          <button
            onClick={handleReset}
            className="btn-danger text-xs py-1.5"
            title="Reset machine and clear all results"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {importError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{importError}</span>
        </div>
      )}

      {/* 1. Mode Selection */}
      <section className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Step 1 — Select Conversion Direction
        </div>
        <MachineSelector mode={mode} onSelect={handleSelectMode} />
      </section>

      {/* Output Convention Information Banner */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <strong>Output Convention:</strong> Moore machines produce an output associated with the current state (including an initial output <code className="font-mono bg-white px-1 rounded">λ(q₀)</code> before reading input), while Mealy machines produce output during transitions. Because of this, the initial output receives special handling during conversion and equivalence verification.
        </div>
      </div>

      {/* 2. Machine Builder + Transitions Table */}
      <section className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Step 2 — Configure {machine.type === 'mealy' ? 'Mealy' : 'Moore'} Machine
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <MachineBuilder machine={machine} onChange={handleMachineChange} />
          </div>
          <div className="lg:col-span-7 space-y-5">
            {machine.type === 'mealy' ? (
              <TransitionTable machine={machine} onChange={handleMachineChange} />
            ) : (
              <StateTable machine={machine} onChange={handleMachineChange} />
            )}

            {/* Validation + Convert Action Bar */}
            <ValidationPanel
              result={validationResult}
              onValidate={handleValidate}
            />

            <div className="card p-4 bg-gradient-to-r from-indigo-50 to-white border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Convert {machine.type === 'mealy' ? 'Mealy → Moore' : 'Moore → Mealy'}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Validates the machine first and generates the equivalent{' '}
                  {machine.type === 'mealy' ? 'Moore' : 'Mealy'} machine with step-by-step trace.
                </p>
              </div>
              <button
                onClick={handleConvert}
                className="btn-primary px-5 py-2.5 whitespace-nowrap shadow-sm"
              >
                <ArrowRightLeft size={16} />
                Convert Machine
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Original Machine Visualization & Summary Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Step 3 — Original Machine ({machine.type.toUpperCase()})
          </div>
          <span className="badge-blue">Original</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formal Summary Table */}
          <div className="lg:col-span-5 card overflow-hidden">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-gray-700">
                Original Transition Summary Table
              </h3>
              <span className="badge-blue">Original ({machine.type})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="table-header">
                    <th className="px-3 py-2.5 text-left">State</th>
                    {machine.alphabet.map((sym) => (
                      <th key={sym} className="px-3 py-2.5 text-left">
                        Input &apos;{sym}&apos;
                      </th>
                    ))}
                    {machine.type === 'moore' && (
                      <th className="px-3 py-2.5 text-left">Output λ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {machine.states.map((st) => (
                    <tr key={st} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono font-bold text-gray-800">
                        {st === machine.initialState ? `→ ${st}` : st}
                      </td>
                      {machine.alphabet.map((sym) => {
                        if (machine.type === 'mealy') {
                          const t = machine.transitions.find(
                            (tr) => tr.currentState === st && tr.input === sym
                          );
                          return (
                            <td key={sym} className="px-3 py-2 font-mono">
                              {t ? (
                                <span>
                                  <span className="text-indigo-700 font-semibold">
                                    {t.nextState}
                                  </span>{' '}
                                  / <span className="text-emerald-700">{t.output}</span>
                                </span>
                              ) : (
                                <span className="text-red-400">—</span>
                              )}
                            </td>
                          );
                        } else {
                          const t = machine.transitions.find(
                            (tr) => tr.currentState === st && tr.input === sym
                          );
                          return (
                            <td key={sym} className="px-3 py-2 font-mono">
                              {t ? (
                                <span className="text-indigo-700 font-semibold">
                                  {t.nextState}
                                </span>
                              ) : (
                                <span className="text-red-400">—</span>
                              )}
                            </td>
                          );
                        }
                      })}
                      {machine.type === 'moore' && (
                        <td className="px-3 py-2 font-mono font-bold text-emerald-700">
                          {machine.stateOutputs[st] ?? '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Original State Diagram */}
          <div className="lg:col-span-7">
            <StateDiagram
              machine={machine}
              highlightedStates={origHighlighted}
              title={`Original ${machine.type === 'mealy' ? 'Mealy' : 'Moore'} State Diagram`}
            />
          </div>
        </div>
      </section>

      {/* 4. Step-by-Step Conversion & Converted Machine Display */}
      {conversionResult && (
        <>
          <section className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Step 4 — Step-by-Step Conversion Walkthrough
            </div>
            <ConversionSteps
              steps={conversionResult.steps}
              currentStepIndex={currentStepIndex}
              onStepChange={setCurrentStepIndex}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                Step 5 — Converted Machine ({conversionResult.convertedMachine.type.toUpperCase()})
              </div>
              <span className="badge-green">Converted</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Converted Machine Tables */}
              <div className="lg:col-span-5 space-y-4">
                {/* Converted Transition Summary Table */}
                <div className="card overflow-hidden">
                  <div className="card-header">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Converted Transition Table
                    </h3>
                    <span className="badge-green">
                      Converted ({conversionResult.convertedMachine.type})
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="table-header">
                          <th className="px-3 py-2.5 text-left">State</th>
                          {conversionResult.convertedMachine.alphabet.map((sym) => (
                            <th key={sym} className="px-3 py-2.5 text-left">
                              Input &apos;{sym}&apos;
                            </th>
                          ))}
                          {conversionResult.convertedMachine.type === 'moore' && (
                            <th className="px-3 py-2.5 text-left">Output λ</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {conversionResult.convertedMachine.states.map((st) => {
                          const conv = conversionResult.convertedMachine;
                          return (
                            <tr key={st} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono font-bold text-gray-800">
                                {st === conv.initialState ? `→ ${st}` : st}
                              </td>
                              {conv.alphabet.map((sym) => {
                                if (conv.type === 'mealy') {
                                  const t = conv.transitions.find(
                                    (tr) => tr.currentState === st && tr.input === sym
                                  );
                                  return (
                                    <td key={sym} className="px-3 py-2 font-mono">
                                      {t ? (
                                        <span>
                                          <span className="text-indigo-700 font-semibold">
                                            {t.nextState}
                                          </span>{' '}
                                          / <span className="text-emerald-700">{t.output}</span>
                                        </span>
                                      ) : (
                                        '—'
                                      )}
                                    </td>
                                  );
                                } else {
                                  const t = conv.transitions.find(
                                    (tr) => tr.currentState === st && tr.input === sym
                                  );
                                  return (
                                    <td key={sym} className="px-3 py-2 font-mono">
                                      {t ? (
                                        <span className="text-indigo-700 font-semibold">
                                          {t.nextState}
                                        </span>
                                      ) : (
                                        '—'
                                      )}
                                    </td>
                                  );
                                }
                              })}
                              {conv.type === 'moore' && (
                                <td className="px-3 py-2 font-mono font-bold text-emerald-700">
                                  {conv.stateOutputs[st] ?? '—'}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Explicit State Output Table when converted machine is Moore */}
                {conversionResult.convertedMachine.type === 'moore' && (
                  <div className="card overflow-hidden">
                    <div className="card-header">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Converted Moore State Output Table
                      </h3>
                      <span className="badge-green">λ(q)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="table-header">
                            <th className="px-4 py-2 text-left">Moore State</th>
                            <th className="px-4 py-2 text-left">State Output λ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {conversionResult.convertedMachine.states.map((st) => (
                            <tr key={st}>
                              <td className="px-4 py-2 font-mono font-semibold text-gray-800">
                                {st}
                              </td>
                              <td className="px-4 py-2 font-mono font-bold text-emerald-700">
                                {(conversionResult.convertedMachine as MooreMachine).stateOutputs[st]}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Converted State Diagram */}
              <div className="lg:col-span-7">
                <StateDiagram
                  machine={conversionResult.convertedMachine}
                  highlightedStates={convHighlighted}
                  title={`Converted ${
                    conversionResult.convertedMachine.type === 'mealy' ? 'Mealy' : 'Moore'
                  } State Diagram`}
                />
              </div>
            </div>
          </section>
        </>
      )}

      {/* 5. Input String Simulation */}
      <section className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {conversionResult ? 'Step 6' : 'Step 4'} — Input String Simulation &amp; Animated Trace
        </div>
        <SimulationPanel
          originalMachine={machine}
          convertedMachine={conversionResult?.convertedMachine ?? null}
          onHighlightOriginalState={setSimHighlightOrig}
          onHighlightConvertedState={setSimHighlightConv}
        />
      </section>

      {/* 6. Equivalence Verification */}
      {conversionResult && (
        <section className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Step 7 — Compare Original vs. Converted Machine
          </div>
          <EquivalencePanel
            originalMachine={machine}
            convertedMachine={conversionResult.convertedMachine}
          />
        </section>
      )}
    </div>
  );
};

