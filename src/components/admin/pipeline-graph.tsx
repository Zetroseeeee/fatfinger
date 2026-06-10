"use client";

import { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Status = "shipped" | "live" | "next" | "later";

const STATUS: Record<Status, { color: string; label: string }> = {
  shipped: { color: "#0f9d63", label: "Shipped" },
  live: { color: "#3d5aff", label: "Live & self-running" },
  next: { color: "#e5342b", label: "Next up" },
  later: { color: "#8a8d94", label: "Later" },
};

type Leaf = { label: string; status: Status; note: string };
const TREE: { cat: string; items: Leaf[] }[] = [
  {
    cat: "Product",
    items: [
      { label: "Brand + site", status: "shipped", note: "The marketing site, wordmark, type system and palette." },
      { label: "Newsletter + charts", status: "shipped", note: "The dark issue template and the FatFinger chart components." },
      { label: "Audio narration", status: "shipped", note: "Listen button — ElevenLabs voice when keyed, browser voice otherwise." },
      { label: "Light/dark reading", status: "shipped", note: "Toggle on issue pages, remembered per reader." },
    ],
  },
  {
    cat: "Content engine",
    items: [
      { label: "Daily AI writer", status: "live", note: "Skinny Finger Engine writes a full in-voice issue every weekday." },
      { label: "Auto-publish", status: "live", note: "Each issue appears on /issues automatically." },
      { label: "Auto-send", status: "live", note: "The issue emails itself to confirmed subscribers." },
      { label: "Multi-model engine", status: "later", note: "Blend several models / data feeds for richer analysis." },
    ],
  },
  {
    cat: "Growth",
    items: [
      { label: "Self-optimizing A/B", status: "live", note: "Splits traffic and auto-promotes the winner at 95% confidence." },
      { label: "Attribution + pixels", status: "live", note: "First-touch source on every signup; Meta/GA/TikTok conversions." },
      { label: "£50 ad launch", status: "next", note: "One Google Search campaign — see LAUNCH.md." },
      { label: "Pricing A/B test", status: "next", note: "Test price points on /subscribe via the A/B engine." },
      { label: "SEO pages", status: "next", note: "Indexable evergreen explainers to pull organic traffic." },
      { label: "Social auto-poster", status: "later", note: "Cron posts the day's hook to X/LinkedIn (needs your tokens)." },
    ],
  },
  {
    cat: "Money",
    items: [
      { label: "Stripe payments", status: "next", note: "Premium tier checkout + webhooks." },
      { label: "Premium tier", status: "later", note: "Paid quant/macro edition." },
      { label: "Sponsorships", status: "later", note: "Sold ad slots in the daily brief." },
    ],
  },
];

const hHandle = "!h-1 !w-1 !min-h-0 !min-w-0 !border-0 !bg-transparent !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2";

function CenterNode() {
  return (
    <div className="flex h-28 w-28 select-none items-center justify-center rounded-full border-[2.5px] border-signal bg-[#0a0b0d] font-body text-lg font-bold text-white shadow-[0_0_40px_rgba(229,52,43,0.35)]">
      fatfinger<span className="text-signal">.</span>
      <Handle id="s" type="source" position={Position.Top} className={hHandle} />
      <Handle id="t" type="target" position={Position.Top} className={hHandle} />
    </div>
  );
}

function CategoryNode({ data }: { data: { label: string } }) {
  return (
    <div className="select-none whitespace-nowrap rounded-full border-2 border-white/25 bg-[#16181d] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-white">
      {data.label}
      <Handle id="s" type="source" position={Position.Top} className={hHandle} />
      <Handle id="t" type="target" position={Position.Top} className={hHandle} />
    </div>
  );
}

function LeafNode({ data }: { data: Leaf & { selected?: boolean } }) {
  const c = STATUS[data.status].color;
  return (
    <div
      className={`flex select-none items-center gap-2 whitespace-nowrap rounded-full px-2 py-1 transition-colors ${
        data.selected ? "bg-white/10" : ""
      }`}
    >
      <span
        className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
        style={{ background: c, boxShadow: `0 0 10px ${c}77` }}
      />
      <span className="font-mono text-[13px] text-[#e6e7ea]">{data.label}</span>
      <Handle id="s" type="source" position={Position.Left} className={hHandle} />
      <Handle id="t" type="target" position={Position.Left} className={hHandle} />
    </div>
  );
}

const nodeTypes = { center: CenterNode, category: CategoryNode, leaf: LeafNode };

function buildGraph() {
  const nodes: Node[] = [
    { id: "center", type: "center", position: { x: 0, y: 0 }, data: { label: "fatfinger" } },
  ];
  const edges: Edge[] = [];
  const nCat = TREE.length;

  TREE.forEach((cat, ci) => {
    const aC = (ci / nCat) * 2 * Math.PI - Math.PI / 2;
    const RC = 360;
    const cx = Math.cos(aC) * RC;
    const cy = Math.sin(aC) * RC;
    const cid = `cat-${ci}`;
    nodes.push({ id: cid, type: "category", position: { x: cx, y: cy }, data: { label: cat.cat } });
    edges.push({
      id: `ec-${ci}`,
      source: "center",
      target: cid,
      type: "straight",
      style: { stroke: "rgba(255,255,255,0.22)", strokeWidth: 1.5 },
    });

    const k = cat.items.length;
    const spread = 1.7;
    cat.items.forEach((it, j) => {
      const aL = aC + (j - (k - 1) / 2) * (spread / Math.max(k - 1, 1));
      const RL = 280;
      const lid = `leaf-${ci}-${j}`;
      nodes.push({
        id: lid,
        type: "leaf",
        position: { x: cx + Math.cos(aL) * RL, y: cy + Math.sin(aL) * RL },
        data: { ...it },
      });
      edges.push({
        id: `el-${ci}-${j}`,
        source: cid,
        target: lid,
        type: "straight",
        style: { stroke: `${STATUS[it.status].color}66`, strokeWidth: 1.5 },
      });
    });
  });
  return { nodes, edges };
}

export function PipelineGraph() {
  const { nodes: initNodes, edges: initEdges } = useMemo(buildGraph, []);
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);
  const [selected, setSelected] = useState<(Leaf & { cat?: string }) | null>(null);

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (node.type === "leaf") setSelected(node.data as Leaf);
    else setSelected(null);
  }, []);

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-3xl border-2 border-ink bg-[#0a0b0d]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelected(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        nodesDraggable
      >
        <Background variant={BackgroundVariant.Dots} color="#2a2d34" gap={26} size={1} />
        <Controls className="!border !border-white/15 !bg-[#16181d] [&_button]:!border-white/10 [&_button]:!bg-[#16181d] [&_button]:!fill-white [&_button:hover]:!bg-white/10" />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(10,11,13,0.7)"
          className="!bg-[#16181d]"
          nodeColor={(n) =>
            n.type === "center"
              ? "#e5342b"
              : n.type === "category"
                ? "#6b7280"
                : STATUS[(n.data as Leaf).status]?.color ?? "#888"
          }
        />
      </ReactFlow>

      {/* detail panel */}
      {selected ? (
        <div className="absolute left-4 top-4 z-10 max-w-xs rounded-2xl border-2 border-white/15 bg-[#16181d]/95 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: STATUS[selected.status].color }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
              {STATUS[selected.status].label}
            </span>
          </div>
          <h4 className="mt-2 font-display text-xl uppercase leading-none text-white">
            {selected.label}
          </h4>
          <p className="mt-2 text-sm leading-snug text-white/70">{selected.note}</p>
        </div>
      ) : (
        <div className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[11px] uppercase tracking-[0.12em] text-white/40">
          Drag · scroll to zoom · click a node
        </div>
      )}

      {/* legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-3 rounded-xl border border-white/10 bg-[#16181d]/90 px-3 py-2">
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <span
            key={s}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/60"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS[s].color }} />
            {STATUS[s].label}
          </span>
        ))}
      </div>
    </div>
  );
}
