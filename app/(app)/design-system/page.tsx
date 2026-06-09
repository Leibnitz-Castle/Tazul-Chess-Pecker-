import { Card, CardHead } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, Chip } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Ring } from "@/components/ui/Ring";
import { Avatar } from "@/components/ui/Avatar";
import { Stat } from "@/components/ui/Stat";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ChessBoardShowcase } from "@/components/chess/ChessBoardShowcase";
import { LichessPgnViewer } from "@/components/chess/LichessPgnViewer";

const COLORS = [
  { name: "bg-main", value: "#161311", label: "App BG" },
  { name: "bg-sidebar", value: "#14110F", label: "Sidebar" },
  { name: "bg-card", value: "#26211D", label: "Card" },
  { name: "bg-panel", value: "#211C18", label: "Panel" },
  { name: "bg-elevated", value: "#2F2924", label: "Elevated" },
  { name: "border-subtle", value: "#3B342D", label: "Border" },
  { name: "amber", value: "#C8A96B", label: "Amber" },
  { name: "amber-bright", value: "#D6B77A", label: "Amber Bright" },
  { name: "success", value: "#4E8A62", label: "Success" },
  { name: "error", value: "#A44D45", label: "Error" },
  { name: "warning", value: "#C48A41", label: "Warning" },
  { name: "info", value: "#6E8BAB", label: "Info" },
  { name: "text-main", value: "#F2ECE3", label: "Text" },
  { name: "text-secondary", value: "#C1B29F", label: "Text 2" },
  { name: "text-muted", value: "#8B7E72", label: "Text 3" },
  { name: "board-light", value: "#D7C1A0", label: "Light sq." },
  { name: "board-dark", value: "#8A6A45", label: "Dark sq." },
  { name: "board-dark-2", value: "#99774E", label: "Dark sq. 2" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>Design System</h1>
        <p className="text-text-secondary" style={{ fontSize: 14, marginTop: 4 }}>
          Tazul Chess Platform — tokens, components, states
        </p>
      </div>

      {/* Logo */}
      <Section title="Brand">
        <div className="flex items-center gap-8 flex-wrap">
          <Logo size={24} />
          <Logo size={20} wordmark={false} />
          <Logo size={18} mark={false} />
        </div>
      </Section>

      {/* Colors */}
      <Section title="Color Palette">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {COLORS.map((c) => (
            <div key={c.name}>
              <div
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: c.value,
                  border: "1px solid var(--line)",
                  marginBottom: 6,
                }}
              />
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-2)" }}>{c.label}</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{c.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02 }}>Display — Train like the GMs.</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>Heading 1 — Welcome back.</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Heading 2 — Practice Hub</div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>Heading 3 — Active Sets</div>
            <div style={{ fontSize: 15 }}>Body — Spaced-repetition tactics trainer. Build sets, drill weak themes, master patterns through cycles.</div>
            <div className="eyebrow">Eyebrow — Active Set</div>
            <div className="mono" style={{ fontSize: 14 }}>Mono — e2e4 d7d5 · 2:34 · 1842 elo</div>
          </div>
        </Card>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <Card>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
            <Button variant="amber" icon="bolt">Primary</Button>
            <Button variant="outline" icon="filter">Outline</Button>
            <Button variant="ghost" icon="search">Ghost</Button>
            <Button variant="green" icon="check">Success</Button>
            <Button variant="danger" icon="x">Danger</Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
            <Button variant="amber" size="lg" icon="bolt">Large</Button>
            <Button variant="amber" icon="bolt">Default</Button>
            <Button variant="amber" size="sm" icon="bolt">Small</Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="amber" icon="bolt" loading>Loading</Button>
            <Button variant="amber" disabled>Disabled</Button>
            <Button variant="amber" icon="plus" />
            <Button variant="outline" icon="flip" size="sm" />
          </div>
        </Card>
      </Section>

      {/* Badges & Chips */}
      <Section title="Badges & Chips">
        <Card>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
            <Badge>Default</Badge>
            <Badge variant="amber"><Icon name="bolt" size={11} fill /> Amber</Badge>
            <Badge variant="green" dot>Completed</Badge>
            <Badge variant="red" dot>Error</Badge>
            <Badge variant="amber" dot>Due today</Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Chip>All</Chip>
            <Chip active>Active</Chip>
            <Chip>Completed</Chip>
            <Chip>Due</Chip>
          </div>
        </Card>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <Card>
            <CardHead title="Default Card" icon="target" />
            <p className="text-text-secondary" style={{ fontSize: 14 }}>Standard card surface.</p>
          </Card>
          <Card hover>
            <CardHead title="Hover Card" icon="star" />
            <p className="text-text-secondary" style={{ fontSize: 14 }}>Hover me — lifts with amber border.</p>
          </Card>
          <Card style={{ background: "linear-gradient(150deg,rgba(200,169,107,.07),var(--surface))", borderColor: "rgba(200,169,107,.28)" }}>
            <CardHead title="Accent Card" icon="bolt" action={<Badge variant="amber">Pro</Badge>} />
            <p className="text-text-secondary" style={{ fontSize: 14 }}>Featured card variant.</p>
          </Card>
        </div>
      </Section>

      {/* Progress */}
      <Section title="Progress">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>25%</div>
              <Progress value={0.25} />
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>60% (amber)</div>
              <Progress value={0.6} />
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>100% (green)</div>
              <Progress value={1} green />
            </div>
          </div>
        </Card>
      </Section>

      {/* Ring + Avatar + Stat */}
      <Section title="Data Widgets">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <Card>
            <CardHead title="Progress Ring" icon="target" />
            <div className="flex justify-center">
              <Ring value={0.74} size={120}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 750, fontSize: 22, color: "var(--amber)" }}>74%</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>accuracy</div>
                </div>
              </Ring>
            </div>
          </Card>
          <Stat label="Total Exercises" value="2,179" sub="Woodpecker Method" primary icon="puzzle" />
          <Card>
            <CardHead title="Avatars" icon="profile" />
            <div className="flex items-center gap-3">
              <Avatar name="A" size={48} />
              <Avatar name="B" size={36} />
              <Avatar name="C" size={28} />
            </div>
          </Card>
        </div>
      </Section>

      {/* Lichess PGN Viewer section */}
      <Section title="Lichess PGN Viewer">
        <Card style={{ marginBottom: 12 }}>
          <p className="text-text-secondary" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 8 }}>
            <strong style={{ color: "var(--text)" }}>Regla del proyecto:</strong> los visores de partidas PGN usan{" "}
            <span className="mono" style={{ color: "var(--amber)", fontSize: 12 }}>LichessPgnViewer</span>{" "}
            — el viewer oficial de Lichess (<strong>@lichess-org/pgn-viewer</strong>, GPL-3.0-or-later).
            Los tableros interactivos de puzzle siguen usando <span className="mono" style={{ fontSize: 12 }}>ChessgroundBoard</span>.
          </p>
        </Card>

        {/* 5-move combination from training data contract */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8 }}>
              5-move combination · White orientation
            </div>
            <LichessPgnViewer
              pgn={`[SetUp "1"]
[FEN "rnb3kr/ppp4p/3b3B/3Pp2n/2BP4/3K1Rp1/PPP3q1/RN1Q4 w - - 0 1"]

1. Rf8+ Bxf8 2. d6+ Be6 3. Bxe6#`}
              orientation="white"
              showMoves="right"
              showControls
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8 }}>
              Ruy López opening · Black orientation
            </div>
            <LichessPgnViewer
              pgn={`1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O`}
              orientation="black"
              showMoves="right"
              showControls
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8 }}>
              Board only · no move list
            </div>
            <LichessPgnViewer
              pgn={`1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 O-O 5. Bd3 d5`}
              orientation="white"
              showMoves={false}
              showControls
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 8 }}>
              Last position · initialPly last
            </div>
            <LichessPgnViewer
              pgn={`1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4`}
              orientation="white"
              showMoves="right"
              showControls
              initialPly="last"
            />
          </div>
        </div>
      </Section>

      {/* Chessground board section */}
      <Section title="Chessground Board (Puzzle Board)">
        <Card style={{ marginBottom: 12 }}>
          <p className="text-text-secondary" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 8 }}>
            <strong style={{ color: "var(--text)" }}>Tablero interactivo:</strong> los puzzles usan{" "}
            <span className="mono" style={{ color: "var(--amber)", fontSize: 12 }}>ChessgroundBoard</span>{" "}
            — <strong>chessground 9.2.1</strong> (MIT, Lichess open source).
            No se permite <span className="mono" style={{ fontSize: 12 }}>react-chessboard</span> ni tableros manuales.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div style={{ width: 20, height: 20, borderRadius: 4, background: "#D7C1A0" }} />
              <span style={{ fontSize: 12.5, color: "var(--text-2)" }}>Light #D7C1A0</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 20, height: 20, borderRadius: 4, background: "#8A6A45" }} />
              <span style={{ fontSize: 12.5, color: "var(--text-2)" }}>Dark #8A6A45</span>
            </div>
          </div>
        </Card>
        <ChessBoardShowcase />
      </Section>

      {/* Motion */}
      <Section title="Motion Classes">
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { cls: "animate-fade-in", label: "fade-in (220ms)" },
              { cls: "animate-fade-up", label: "fade-up (380ms)" },
              { cls: "animate-card-in", label: "card-in (500ms)" },
            ].map(({ cls, label }) => (
              <div
                key={cls}
                className={cls}
                style={{
                  padding: "14px 16px",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-2)",
                }}
              >
                <div className="mono" style={{ fontSize: 12, color: "var(--amber)", marginBottom: 4 }}>.{cls}</div>
                {label}
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Icons */}
      <Section title="Icons">
        <Card>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            {["home", "practice", "openings", "warehouse", "profile", "flame", "check", "x", "arrowRight", "arrowLeft", "plus", "filter", "flip", "clock", "target", "trophy", "bolt", "chart", "chevDown", "chevRight", "star", "link", "settings", "lichess", "layers", "refresh", "search", "grid", "upload", "puzzle", "book"].map((name) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <Icon name={name} size={20} style={{ color: "var(--text-2)" }} />
                <span style={{ fontSize: 9, color: "var(--text-3)" }}>{name}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </div>
  );
}
