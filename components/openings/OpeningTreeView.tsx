"use client";

import { useState, useRef, useCallback } from "react";
import { EcoBadge } from "./EcoBadge";
import { OpeningBoardPanel } from "./OpeningBoardPanel";

type MasteryStatus = "not_studied" | "learning" | "mastered" | "weak" | "due_for_review";

interface TreeNode {
  id: string;
  parentId: string | null;
  san: string;
  uci: string;
  fenAfter: string;
  fenBefore: string;
  moveNumber: number;
  ply: number;
  eco: string | null;
  lineName: string | null;
  path: string;
  depth: number;
  isMainLine: boolean;
  orderIndex: number;
  stats: {
    total: number;
    correct: number;
    accuracy: number | null;
    lastPracticed: Date | null;
  };
}

interface OpeningTreeViewProps {
  nodes: TreeNode[];
  repertoireName: string;
  color: string;
}

const STATUS_EDGE_COLOR = {
  mastered: "rgba(78,138,98,.55)",
  learning: "rgba(196,138,65,.5)",
  weak: "rgba(164,77,69,.5)",
  due_for_review: "rgba(196,138,65,.5)",
  not_studied: "var(--line)",
};

function getMasteryFromStats(stats: TreeNode["stats"]): MasteryStatus {
  if (stats.total === 0) return "not_studied";
  if (stats.total < 3) return "learning";
  if (stats.accuracy !== null && stats.accuracy >= 0.85) return "mastered";
  if (stats.accuracy !== null && stats.accuracy < 0.6) return "weak";
  return "learning";
}

interface LayoutNode {
  node: TreeNode;
  x: number; // depth column (0-based)
  y: number; // vertical slot
}

function layoutNodes(nodes: TreeNode[]): LayoutNode[] {
  if (nodes.length === 0) return [];

  // Build children map
  const childrenMap = new Map<string | null, TreeNode[]>();
  for (const n of nodes) {
    const arr = childrenMap.get(n.parentId) ?? [];
    arr.push(n);
    arr.sort((a, b) => a.orderIndex - b.orderIndex);
    childrenMap.set(n.parentId, arr);
  }

  const layout: LayoutNode[] = [];
  let yCounter = 0;

  function visit(nodeId: string | null, depth: number): number {
    const children = childrenMap.get(nodeId) ?? [];
    if (children.length === 0) {
      // Leaf — place at current y
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        layout.push({ node, x: depth, y: yCounter });
        yCounter++;
      }
      return yCounter - 1;
    }

    const childYs: number[] = [];
    for (const child of children) {
      layout.push({ node: child, x: depth + 1, y: -1 }); // placeholder
      const y = visit(child.id, depth + 1);
      childYs.push(y);
    }

    // Center parent at midpoint of children
    const parentY =
      childYs.length === 1
        ? childYs[0]
        : (childYs[0] + childYs[childYs.length - 1]) / 2;

    // Update placeholders
    for (const child of children) {
      const entry = layout.find((l) => l.node.id === child.id);
      if (entry && entry.y === -1) {
        // already set by recursive call
      }
    }

    // Find the parent node (could be null = root virtual)
    if (nodeId !== null) {
      const entry = layout.find((l) => l.node.id === nodeId);
      if (entry) entry.y = parentY;
    }

    return parentY;
  }

  // Root-level nodes (parentId === null)
  const roots = nodes.filter((n) => n.parentId === null);
  for (const root of roots) {
    layout.push({ node: root, x: 0, y: -1 });
    visit(root.id, 0);
  }

  // Normalize: remove placeholders with y=-1, assign sequentially
  let seqY = 0;
  const ordered = layout
    .filter((l) => l.y >= 0)
    .sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });

  // Re-assign y sequentially within each depth
  const depthYMap = new Map<number, number>();
  for (const l of ordered) {
    const nextY = depthYMap.get(l.x) ?? 0;
    l.y = nextY;
    depthYMap.set(l.x, nextY + 1);
  }

  return layout;
}

export function OpeningTreeView({
  nodes,
  repertoireName,
  color,
}: OpeningTreeViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    nodes.find((n) => n.isMainLine)?.id ?? nodes[0]?.id ?? null
  );
  const [zoom, setZoom] = useState(1);
  const [tooltip, setTooltip] = useState<{
    node: TreeNode;
    x: number;
    y: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;
  const orientation = color === "WHITE" ? "white" : "black";

  // Layout
  const layoutItems = useCallback(() => {
    // Simple depth/order layout for display
    const result: { node: TreeNode; col: number; row: number }[] = [];
    const childrenOf = new Map<string | null, TreeNode[]>();
    for (const n of nodes) {
      const arr = childrenOf.get(n.parentId) ?? [];
      arr.push(n);
      childrenOf.set(n.parentId, arr);
    }

    let rowCounter = 0;
    const processed = new Set<string>();

    function placeNode(id: string | null, col: number): number {
      const children = (childrenOf.get(id) ?? [])
        .filter((c) => !processed.has(c.id))
        .sort((a, b) => (a.isMainLine ? -1 : 1) - (b.isMainLine ? -1 : 1));

      if (children.length === 0) {
        const node = nodes.find((n) => n.id === id);
        if (node && !processed.has(node.id)) {
          result.push({ node, col, row: rowCounter });
          processed.add(node.id);
          rowCounter++;
        }
        return rowCounter - 1;
      }

      const childRows: number[] = [];
      for (const child of children) {
        if (!processed.has(child.id)) {
          result.push({ node: child, col: col + 1, row: -1 });
          processed.add(child.id);
          const r = placeNode(child.id, col + 1);
          childRows.push(r);
        }
      }

      const centerRow =
        childRows.length === 0
          ? rowCounter
          : (childRows[0] + childRows[childRows.length - 1]) / 2;

      const node = nodes.find((n) => n.id === id);
      if (node) {
        const existing = result.find((r) => r.node.id === id);
        if (existing) existing.row = centerRow;
      }

      return centerRow;
    }

    const roots = nodes.filter((n) => n.parentId === null);
    for (const root of roots) {
      result.push({ node: root, col: 0, row: -1 });
      processed.add(root.id);
      placeNode(root.id, 0);
    }

    // Fix row=-1 placeholders
    let fixY = 0;
    const fixed = result
      .sort((a, b) => {
        if (a.col !== b.col) return a.col - b.col;
        return a.row - b.row;
      })
      .map((l) => ({ ...l, row: l.row < 0 ? fixY++ : l.row }));

    return fixed;
  }, [nodes]);

  const items = layoutItems();
  const maxCol = Math.max(...items.map((i) => i.col), 0);
  const maxRow = Math.max(...items.map((i) => i.row), 0);

  const COL_W = 80; // px per column
  const ROW_H = 56; // px per row
  const PAD = 32;
  const canvasW = Math.max(600, (maxCol + 1) * COL_W + PAD * 2);
  const canvasH = Math.max(300, (maxRow + 1) * ROW_H + PAD * 2);

  const posOf = (col: number, row: number) => ({
    left: PAD + col * COL_W,
    top: PAD + row * ROW_H,
  });

  // Build edge list
  const edges = nodes
    .filter((n) => n.parentId !== null)
    .map((n) => {
      const parentItem = items.find((i) => i.node.id === n.parentId);
      const childItem = items.find((i) => i.node.id === n.id);
      if (!parentItem || !childItem) return null;
      const pa = posOf(parentItem.col, parentItem.row);
      const pb = posOf(childItem.col, childItem.row);
      const status = getMasteryFromStats(n.stats);
      return { from: pa, to: pb, status, isMainLine: n.isMainLine };
    })
    .filter(Boolean) as {
    from: { left: number; top: number };
    to: { left: number; top: number };
    status: MasteryStatus;
    isMainLine: boolean;
  }[];

  // Show only first 200 nodes to avoid perf issues with huge trees
  const visibleItems = items.slice(0, 200);

  // Path from root to selected
  const pathToSelected: string[] = [];
  if (selected) {
    let cur: TreeNode | undefined = selected;
    while (cur) {
      pathToSelected.unshift(cur.san);
      const parent = nodes.find((n) => n.id === cur!.parentId);
      cur = parent;
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 0.75fr)",
        gap: 24,
        alignItems: "start",
      }}
    >
      {/* Left: tree canvas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: 16,
              display: "grid",
              placeItems: "center",
            }}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: 16,
              display: "grid",
              placeItems: "center",
            }}
            aria-label="Zoom out"
          >
            −
          </button>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            {Math.round(zoom * 100)}%
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-3)" }}>
            {nodes.length} nodes · showing {visibleItems.length}
          </span>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          style={{
            position: "relative",
            width: "100%",
            height: 500,
            overflow: "auto",
            background:
              "radial-gradient(circle at 1px 1px, rgba(200,169,107,.05) 1px, transparent 0) 0 0 / 26px 26px, var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            cursor: "grab",
          }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              width: canvasW,
              height: canvasH,
              position: "relative",
            }}
          >
            {/* SVG edges */}
            <svg
              style={{
                position: "absolute",
                inset: 0,
                width: canvasW,
                height: canvasH,
                pointerEvents: "none",
                overflow: "visible",
              }}
            >
              {edges.map((edge, i) => {
                const midX = (edge.from.left + edge.to.left) / 2;
                const strokeColor =
                  STATUS_EDGE_COLOR[edge.status as keyof typeof STATUS_EDGE_COLOR] ??
                  "var(--line)";
                return (
                  <path
                    key={i}
                    d={`M ${edge.from.left} ${edge.from.top} C ${midX} ${edge.from.top}, ${midX} ${edge.to.top}, ${edge.to.left} ${edge.to.top}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={edge.isMainLine ? 2.4 : 1.6}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {visibleItems.map(({ node, col, row }) => {
              const pos = posOf(col, row);
              const isSelected = node.id === selectedId;
              const status = getMasteryFromStats(node.stats);
              const edgeColor =
                STATUS_EDGE_COLOR[status as keyof typeof STATUS_EDGE_COLOR] ??
                "var(--line)";
              const borderColor = isSelected
                ? "var(--amber)"
                : edgeColor.replace(/[\d.]+\)$/, "0.8)");

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedId(node.id)}
                  onMouseEnter={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (rect) {
                      setTooltip({
                        node,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }
                  }}
                  onMouseMove={(e) =>
                    setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t))
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    position: "absolute",
                    left: pos.left,
                    top: pos.top,
                    transform: "translate(-50%, -50%)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    transition: "transform .18s cubic-bezier(.2,.7,.2,1)",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      background: "var(--surface-3)",
                      border: `2px solid ${borderColor}`,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: isSelected ? "var(--amber)" : "var(--text-2)",
                      fontFamily: "var(--mono)",
                      boxShadow: isSelected
                        ? "0 0 0 4px rgba(200,169,107,.16)"
                        : undefined,
                      transition: "border-color .18s, box-shadow .18s",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 40,
                      padding: "0 2px",
                    }}
                    title={node.san}
                  >
                    {node.san.replace(/^1\./, "").slice(0, 5)}
                  </div>
                  {node.eco && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -16,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      <EcoBadge eco={node.eco} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              style={{
                position: "fixed",
                zIndex: 300,
                pointerEvents: "none",
                background: "var(--surface-3)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "9px 11px",
                boxShadow: "var(--sh)",
                minWidth: 150,
                fontSize: 12,
                left: tooltip.x + 14,
                top: tooltip.y + 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 4,
                  alignItems: "center",
                }}
              >
                {tooltip.node.eco && <EcoBadge eco={tooltip.node.eco} />}
                <span style={{ fontWeight: 700, fontSize: 12.5 }}>
                  {tooltip.node.san}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                Move {tooltip.node.moveNumber} · depth {tooltip.node.depth}
              </div>
              {tooltip.node.lineName && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-2)",
                    marginTop: 2,
                  }}
                >
                  {tooltip.node.lineName}
                </div>
              )}
              {tooltip.node.stats.total > 0 && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-2)",
                    marginTop: 2,
                    fontFamily: "var(--mono)",
                  }}
                >
                  {tooltip.node.stats.total} attempts ·{" "}
                  {Math.round((tooltip.node.stats.accuracy ?? 0) * 100)}% acc
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 11,
            color: "var(--text-3)",
          }}
        >
          {(
            [
              ["mastered", "#4E8A62"],
              ["learning", "#C48A41"],
              ["weak", "#A44D45"],
              ["not studied", "var(--line)"],
            ] as [string, string][]
          ).map(([label, color]) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: color,
                  flexShrink: 0,
                }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Right: board + node details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {selected ? (
          <>
            <OpeningBoardPanel
              fen={selected.fenAfter}
              orientation={orientation}
              lastMove={{ from: selected.uci.slice(0, 2), to: selected.uci.slice(2, 4) }}
            />

            {/* Path breadcrumb */}
            <div
              style={{
                fontSize: 12,
                color: "var(--text-3)",
                fontFamily: "var(--mono)",
                background: "var(--surface-2)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "8px 12px",
                wordBreak: "break-all",
              }}
            >
              {pathToSelected.join(" → ")}
            </div>

            {/* Node details */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{ display: "flex", gap: 8, alignItems: "center" }}
              >
                {selected.eco && <EcoBadge eco={selected.eco} />}
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  {selected.san}
                </span>
              </div>

              {selected.lineName && (
                <div
                  style={{ fontSize: 13, color: "var(--text-2)" }}
                >
                  {selected.lineName}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {[
                  ["Move", selected.moveNumber.toString()],
                  ["Depth", selected.depth.toString()],
                  [
                    "Attempts",
                    selected.stats.total > 0
                      ? selected.stats.total.toString()
                      : "—",
                  ],
                  [
                    "Accuracy",
                    selected.stats.accuracy !== null
                      ? `${Math.round(selected.stats.accuracy * 100)}%`
                      : "—",
                  ],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        color: "var(--text-3)",
                        fontWeight: 700,
                        marginBottom: 2,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-3)",
              fontSize: 14,
            }}
          >
            Select a node to see details
          </div>
        )}
      </div>
    </div>
  );
}
