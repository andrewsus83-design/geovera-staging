"use client";

interface ImpactFireIconsProps {
  level: 1 | 2 | 3;
}

export default function ImpactFireIcons({ level }: ImpactFireIconsProps) {
  return (
    <span className="flex items-center gap-0.5" title={`Impact: ${level}/3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < level ? "" : "opacity-20"}`}>
          🔥
        </span>
      ))}
    </span>
  );
}
