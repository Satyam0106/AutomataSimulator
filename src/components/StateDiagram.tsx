import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RotateCcw } from 'lucide-react';
import type { Machine, MealyMachine, MooreMachine } from '../types/machine';

// ── Custom State Node ─────────────────────────────────────────────────────

interface StateNodeData extends Record<string, unknown> {
  label: string;
  output?: string;
  isInitial: boolean;
  isHighlighted?: boolean;
  isMealy: boolean;
}

function StateNode({ data }: { data: StateNodeData }) {
  const { label, output, isInitial, isHighlighted, isMealy } = data;
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-full border-2 select-none transition-colors ${
        isHighlighted
          ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-200/80 ring-4 ring-amber-300/40'
          : isInitial
          ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100'
          : 'border-slate-500 bg-white shadow-sm'
      }`}
      style={{ width: 68, height: 68 }}
    >
      {/* Centered handles allow edges from any angle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 4,
          height: 4,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 4,
          height: 4,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {isInitial && (
        <div className="absolute -left-9 top-1/2 -translate-y-1/2 flex items-center text-indigo-600 font-bold text-xs pointer-events-none">
          <span className="mr-0.5 text-[10px] uppercase tracking-tighter font-semibold">
            start
          </span>
          <span className="text-base leading-none">→</span>
        </div>
      )}

      <span
        className={`font-mono font-bold text-sm leading-tight ${
          isHighlighted
            ? 'text-amber-800'
            : isInitial
            ? 'text-indigo-800'
            : 'text-slate-800'
        }`}
      >
        {label}
      </span>

      {!isMealy && output !== undefined && (
        <span
          className={`text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded mt-0.5 ${
            isHighlighted
              ? 'bg-amber-200/70 text-amber-900'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          /{output}
        </span>
      )}
    </div>
  );
}

const nodeTypes = { stateNode: StateNode };

// ── Custom Self-Loop Edge ─────────────────────────────────────────────────

function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  label,
  markerEnd,
  style,
}: EdgeProps) {
  const r = 34;
  // Start and end on the top edge of the circular node
  const startX = sourceX - 14;
  const startY = sourceY - r + 2;
  const endX = sourceX + 14;
  const endY = sourceY - r + 2;

  const ctrlX1 = sourceX - 42;
  const ctrlY1 = sourceY - r - 56;
  const ctrlX2 = sourceX + 42;
  const ctrlY2 = sourceY - r - 56;

  const path = `M ${startX} ${startY} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`;
  const labelX = sourceX;
  const labelY = sourceY - r - 48;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={path}
        markerEnd={markerEnd as string}
        fill="none"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan bg-white border border-indigo-200 rounded-md px-2 py-0.5 text-xs font-mono font-semibold text-indigo-900 shadow-sm whitespace-nowrap"
        >
          {String(label ?? '')}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// ── Custom Directed Edge (supports curved bidirectional edges) ────────────

function DirectedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  markerEnd,
  style,
  data,
}: EdgeProps) {
  const isBidirectional = Boolean(
    (data as { bidirectional?: boolean } | undefined)?.bidirectional
  );
  const r = 36; // Node radius + padding so arrowhead lands cleanly on rim

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const ux = dx / dist;
  const uy = dy / dist;
  // Normal vector perpendicular to edge
  const nx = -uy;
  const ny = ux;

  let path = '';
  let labelX = (sourceX + targetX) / 2;
  let labelY = (sourceY + targetY) / 2;

  if (isBidirectional) {
    // Offset start and end slightly toward normal so opposing edges don't touch
    const edgeShift = 10;
    const curveOffset = 38;

    const sx = sourceX + ux * r + nx * edgeShift;
    const sy = sourceY + uy * r + ny * edgeShift;
    const tx = targetX - ux * r + nx * edgeShift;
    const ty = targetY - uy * r + ny * edgeShift;

    const cx = (sourceX + targetX) / 2 + nx * curveOffset;
    const cy = (sourceY + targetY) / 2 + ny * curveOffset;

    path = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
    labelX = 0.25 * sx + 0.5 * cx + 0.25 * tx;
    labelY = 0.25 * sy + 0.5 * cy + 0.25 * ty;
  } else {
    const sx = sourceX + ux * r;
    const sy = sourceY + uy * r;
    const tx = targetX - ux * r;
    const ty = targetY - uy * r;

    path = `M ${sx} ${sy} L ${tx} ${ty}`;
    labelX = (sx + tx) / 2;
    labelY = (sy + ty) / 2;
  }

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={path}
        markerEnd={markerEnd as string}
        fill="none"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan bg-white border border-indigo-200 rounded-md px-2 py-0.5 text-xs font-mono font-semibold text-indigo-900 shadow-sm whitespace-nowrap"
        >
          {String(label ?? '')}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = {
  selfLoop: SelfLoopEdge,
  labeled: DirectedEdge,
};

// ── Layout helper ─────────────────────────────────────────────────────────

function layoutCircle(
  states: string[],
  cx: number,
  cy: number,
  radius: number
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  if (states.length === 1) {
    positions[states[0]] = { x: cx, y: cy };
    return positions;
  }
  if (states.length === 2) {
    positions[states[0]] = { x: cx - radius, y: cy };
    positions[states[1]] = { x: cx + radius, y: cy };
    return positions;
  }
  states.forEach((state, i) => {
    const angle = (2 * Math.PI * i) / states.length - Math.PI / 2;
    positions[state] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
  return positions;
}

// ── Main Diagram ──────────────────────────────────────────────────────────

interface StateDiagramInnerProps {
  machine: Machine;
  highlightedStates?: string[];
  highlightedTransitions?: string[];
  title?: string;
}

function StateDiagramInner({
  machine,
  highlightedStates = [],
  title,
}: StateDiagramInnerProps) {
  const isMealy = machine.type === 'mealy';
  const { fitView } = useReactFlow();

  // Memoize initial circular layout based on state names
  const statesKey = machine.states.join(',');
  const defaultPositions = useMemo(() => {
    const radius = Math.max(120, machine.states.length * 48);
    return layoutCircle(machine.states, 250, 190, radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statesKey]);

  const createNodes = useCallback(
    (posMap: Record<string, { x: number; y: number }>): Node[] => {
      return machine.states.map((state) => ({
        id: state,
        type: 'stateNode',
        position: posMap[state] ?? { x: 100, y: 100 },
        data: {
          label: state,
          output: !isMealy
            ? (machine as MooreMachine).stateOutputs[state]
            : undefined,
          isInitial: state === machine.initialState,
          isHighlighted: highlightedStates.includes(state),
          isMealy,
        } as StateNodeData,
      }));
    },
    [machine, highlightedStates, isMealy]
  );

  const createEdges = useCallback((): Edge[] => {
    const edgeMap = new Map<string, string[]>();

    if (isMealy) {
      (machine as MealyMachine).transitions.forEach((t) => {
        const key = `${t.currentState}__${t.nextState}`;
        const label = `${t.input} / ${t.output}`;
        if (!edgeMap.has(key)) edgeMap.set(key, []);
        edgeMap.get(key)!.push(label);
      });
    } else {
      (machine as MooreMachine).transitions.forEach((t) => {
        const key = `${t.currentState}__${t.nextState}`;
        const label = t.input;
        if (!edgeMap.has(key)) edgeMap.set(key, []);
        edgeMap.get(key)!.push(label);
      });
    }

    const edges: Edge[] = [];
    edgeMap.forEach((labels, key) => {
      const [from, to] = key.split('__');
      const isSelf = from === to;
      const reverseKey = `${to}__${from}`;
      const isBidirectional = !isSelf && edgeMap.has(reverseKey);

      edges.push({
        id: `e-${key}`,
        source: from,
        target: to,
        type: isSelf ? 'selfLoop' : 'labeled',
        label: labels.join(', '),
        data: { bidirectional: isBidirectional },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#4f46e5',
        },
        style: { stroke: '#4f46e5', strokeWidth: 2.2 },
      });
    });
    return edges;
  }, [machine, isMealy]);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    createNodes(defaultPositions)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());

  // When states list changes, rebuild positions and fit view
  useEffect(() => {
    setNodes(createNodes(defaultPositions));
    setEdges(createEdges());
    const t = setTimeout(() => fitView({ padding: 0.35, duration: 200 }), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statesKey, isMealy]);

  // When machine transitions/outputs/highlights change without changing state list, preserve dragged node positions
  useEffect(() => {
    setNodes((prevNodes) => {
      const currentPos: Record<string, { x: number; y: number }> = {
        ...defaultPositions,
      };
      prevNodes.forEach((n) => {
        currentPos[n.id] = n.position;
      });
      return createNodes(currentPos);
    });
    setEdges(createEdges());
  }, [machine, highlightedStates, createNodes, createEdges, defaultPositions, setNodes, setEdges]);

  const handleResetLayout = () => {
    setNodes(createNodes(defaultPositions));
    setTimeout(() => fitView({ padding: 0.35, duration: 250 }), 50);
  };

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">
            {title ?? 'State Diagram'}
          </h3>
          <span className="badge-blue">{isMealy ? 'Mealy' : 'Moore'}</span>
        </div>
        <button
          onClick={handleResetLayout}
          className="btn-secondary text-xs py-1 px-2.5"
          title="Reset circular node layout"
        >
          <RotateCcw size={12} /> Reset Layout
        </button>
      </div>

      <div style={{ height: 400 }} className="bg-slate-50/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.35 }}
          minZoom={0.25}
          maxZoom={2.5}
        >
          <Background color="#cbd5e1" gap={18} />
          <Controls />
          <MiniMap
            zoomable
            pannable
            nodeColor={(n) => {
              const d = n.data as StateNodeData;
              return d.isHighlighted
                ? '#f59e0b'
                : d.isInitial
                ? '#4f46e5'
                : '#94a3b8';
            }}
          />
        </ReactFlow>
      </div>

      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-50 border-2 border-indigo-600 inline-block" />
          Initial state (<code className="font-mono">start →</code>)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-50 border-2 border-amber-500 inline-block" />
          Highlighted / Active state
        </span>
        {isMealy ? (
          <span>
            Edge label: <code className="font-mono text-indigo-700">input / output</code>
          </span>
        ) : (
          <>
            <span>
              Node label: <code className="font-mono text-emerald-700">state / output</code>
            </span>
            <span>
              Edge label: <code className="font-mono text-indigo-700">input</code>
            </span>
          </>
        )}
        <span className="ml-auto text-gray-400">Drag nodes to rearrange</span>
      </div>
    </div>
  );
}

export const StateDiagram: React.FC<StateDiagramInnerProps> = (props) => (
  <ReactFlowProvider>
    <StateDiagramInner {...props} />
  </ReactFlowProvider>
);
