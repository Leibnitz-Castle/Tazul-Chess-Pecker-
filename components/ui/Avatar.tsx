interface AvatarProps {
  name?: string;
  size?: number;
}

export function Avatar({ name = "T", size = 36 }: AvatarProps) {
  return (
    <div
      className="rounded-full bg-bg-elevated flex items-center justify-center font-bold text-amber-bright border border-border-subtle flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name[0].toUpperCase()}
    </div>
  );
}
