"use client";

import { EcoBadge } from "./EcoBadge";
import { StatusDot } from "./StatusDot";
import { MasteryRing } from "./MasteryRing";
import type { MasteryStatus } from "@/lib/openings/opening-types";

interface LineItem {
  id: string;
  name: string;
  eco: string | null;
  moveCount: number;
  isMainLine: boolean;
  metrics: {
    attempts: number;
    accuracy: number;
    mastery: MasteryStatus;
    isWeak: boolean;
    isDueForReview: boolean;
  };
}

interface OpeningLineListProps {
  lines: LineItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function OpeningLineList({
  lines,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: OpeningLineListProps) {
  const filtered = lines.filter((l) =>
    (l.name + (l.eco ?? "")).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* search */}
      <div style={{ padding: "14px 14px 10px", position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 25,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-3)",
            pointerEvents: "none",
          }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={11} cy={11} r={7} />
            <path d="M21 21l-4-4" />
          </svg>
        </span>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search lines…"
          style={{
            width: "100%",
            height: 38,
            paddingLeft: 34,
            paddingRight: 12,
            fontSize: 13,
            background: "var(--surface-2)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            color: "var(--text)",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
        />
      </div>

      <div
        style={{
          borderTop: "1px solid var(--line)",
          maxHeight: 460,
          overflowY: "auto",
          padding: 8,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              fontSize: 13,
              color: "var(--text-3)",
            }}
          >
            No lines match &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filtered.map((line) => (
            <button
              key={line.id}
              onClick={() => onSelect(line.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 12px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background .14s",
                border:
                  selectedId === line.id
                    ? "1px solid rgba(200,169,107,.22)"
                    : "1px solid transparent",
                background:
                  selectedId === line.id
                    ? "rgba(200,169,107,.08)"
                    : "transparent",
                textAlign: "left",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (selectedId !== line.id)
                  e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                if (selectedId !== line.id)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <StatusDot status={line.metrics.mastery} />
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 3,
                  }}
                >
                  {line.eco && <EcoBadge eco={line.eco} />}
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {line.name}
                  </span>
                </div>
                <div
                  style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}
                >
                  {line.moveCount} moves
                  {line.metrics.attempts > 0
                    ? ` · ${Math.round(line.metrics.accuracy * 100)}% acc`
                    : " · not studied"}
                </div>
              </div>
              <MasteryRing
                value={line.metrics.accuracy}
                size={26}
                stroke={3}
                status={line.metrics.mastery}
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
