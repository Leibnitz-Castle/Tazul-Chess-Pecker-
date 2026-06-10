"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MasteryRing } from "./MasteryRing";

interface RepertoireMetrics {
  totalLines: number;
  totalNodes: number;
  memorization: number;
  weakLines: number;
  dueForReview: number;
}

interface RepertoireCardProps {
  id: string;
  name: string;
  color: string;
  metrics: RepertoireMetrics;
  onStudy: () => void;
  onPractice: () => void;
  onTree: () => void;
}

export function RepertoireCard({
  name,
  color,
  metrics,
  onStudy,
  onPractice,
  onTree,
}: RepertoireCardProps) {
  const isWhite = color === "WHITE";
  const pct = Math.round(metrics.memorization * 100);

  return (
    <Card
      hover
      className={`relative overflow-hidden cursor-pointer`}
      style={{
        background: isWhite
          ? "linear-gradient(145deg, rgba(200,169,107,.05), transparent 40%), var(--surface)"
          : "linear-gradient(145deg, rgba(0,0,0,.12), transparent 40%), var(--surface)",
      }}
      onClick={onStudy}
    >
      {/* glyph watermark */}
      <span
        style={{
          position: "absolute",
          right: -10,
          bottom: -24,
          fontSize: 150,
          lineHeight: 1,
          color: isWhite ? "var(--text)" : "#000",
          opacity: isWhite ? 0.035 : 0.14,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {isWhite ? "♔" : "♚"}
      </span>

      {/* top row */}
      <div className="flex items-center justify-between mb-4 relative">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 24,
            padding: "0 10px",
            borderRadius: 6,
            background: isWhite ? "rgba(242,236,227,.08)" : "rgba(0,0,0,.3)",
            border: "1px solid var(--line)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background: isWhite ? "#F2ECE3" : "#1E1A16",
              border: "1px solid var(--line)",
              flexShrink: 0,
            }}
          />
          {isWhite ? "White" : "Black"}
        </span>
        <MasteryRing value={metrics.memorization} size={34} />
      </div>

      {/* name */}
      <div
        className="relative mb-4"
        style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}
      >
        {name}
      </div>

      {/* stats row */}
      <div className="flex gap-6 mb-5 relative">
        <div>
          <div
            style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}
          >
            {metrics.totalLines}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--text-3)",
              marginTop: 2,
            }}
          >
            lines
          </div>
        </div>
        <div>
          <div
            style={{ fontSize: 22, fontWeight: 700, color: "var(--amber)" }}
          >
            {pct}%
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--text-3)",
              marginTop: 2,
            }}
          >
            memorized
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color:
                metrics.dueForReview > 0
                  ? "var(--warning, #C48A41)"
                  : "var(--text)",
            }}
          >
            {metrics.dueForReview}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--text-3)",
              marginTop: 2,
            }}
          >
            due today
          </div>
        </div>
        {metrics.weakLines > 0 && (
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--red, #A44D45)",
              }}
            >
              {metrics.weakLines}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "var(--text-3)",
                marginTop: 2,
              }}
            >
              weak
            </div>
          </div>
        )}
      </div>

      {/* buttons */}
      <div className="flex items-center justify-between relative">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="amber"
            icon="bolt"
            onClick={(e) => {
              e.stopPropagation();
              onStudy();
            }}
          >
            Study
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onPractice();
            }}
          >
            Practice
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onTree();
            }}
          >
            Tree
          </Button>
        </div>
        <span
          style={{ fontSize: 11.5, color: "var(--text-3)" }}
        >
          {metrics.totalNodes} nodes
        </span>
      </div>
    </Card>
  );
}
