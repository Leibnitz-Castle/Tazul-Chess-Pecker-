interface LogoProps {
  size?: number;
  mark?: boolean;
  wordmark?: boolean;
}

export function Logo({ size = 22, mark = true, wordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      {mark && (
        <span
          style={{
            width: size + 12,
            height: size + 12,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(150deg,#1c1d22,#101116)",
            border: "1px solid var(--line)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.05)",
          }}
        >
          <span
            style={{
              fontSize: size,
              lineHeight: 1,
              color: "var(--amber)",
              textShadow: "0 0 10px rgba(200,169,107,.30)",
            }}
          >
            ♞
          </span>
        </span>
      )}
      {wordmark && (
        <span style={{ fontWeight: 800, letterSpacing: "-0.03em", fontSize: size * 0.82 }}>
          Pecker<span style={{ color: "var(--amber)" }}>.</span>
        </span>
      )}
    </div>
  );
}
