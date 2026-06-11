import { cn } from "@/lib/utils";

const ICONS: Record<string, string> = {
  home: "M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10",
  practice: "M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  openings: "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5ZM18 3v16M8 7h6M8 11h6",
  warehouse: "M3 9 12 4l9 5v11H3V9ZM7 20v-6h10v6M7 14h10",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  flame: "M12 3c1 3-1 4-1 6a3 3 0 0 0 6 0c1 2 1 4 1 5a6 6 0 1 1-12 0c0-3 2-5 3-7 1 1 1 2 3 3 0-3-2-4 0-7Z",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  plus: "M12 5v14M5 12h14",
  filter: "M3 5h18l-7 8v6l-4 2v-8L3 5Z",
  flip: "M3 8a9 9 0 0 1 15-3l3 3M21 16a9 9 0 0 1-15 3l-3-3M21 5v4h-4M3 19v-4h4",
  prev: "M15 6l-6 6 6 6",
  next: "M9 6l6 6-6 6",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12h.01",
  trophy: "M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 19h6M10 15v4M14 15v4",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  chart: "M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3M20 16v-7",
  chevDown: "M6 9l6 6 6-6",
  chevRight: "M9 6l6 6-6 6",
  star: "M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L3.4 9.4l6-.8L12 3Z",
  link: "M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
  lichess: "M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z",
  layers: "M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5",
  refresh: "M3 12a9 9 0 0 1 15-6.7L21 8M21 12a9 9 0 0 1-15 6.7L3 16M21 4v4h-4M3 20v-4h4",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4-4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  upload: "M12 16V4M7 9l5-5 5 5M5 20h14",
  puzzle: "M9 4h6v3a2 2 0 1 0 4 0V4h1v5h-3a2 2 0 1 0 0 4h3v5h-5v-3a2 2 0 1 0-4 0v3H4v-5h3a2 2 0 1 0 0-4H4V4h5Z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z",
  library: "M2 3h5v16H2ZM9 6h5v13H9ZM16 9h5v10h-5ZM1 21h22",
};

interface IconProps {
  name: string;
  size?: number;
  fill?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 18, fill = false, strokeWidth = 1.8, className, style }: IconProps) {
  const d = ICONS[name] || "";
  const segments = d.split("M").filter(Boolean);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {segments.map((seg, i) => (
        <path key={i} d={"M" + seg} />
      ))}
    </svg>
  );
}
