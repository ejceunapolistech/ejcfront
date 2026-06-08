import { getTeamInfo } from "@/constants/team-icons";

interface TeamLabelProps {
  teamCode: string;
  className?: string;
  size?: number;
}

export default function TeamLabel({ teamCode, className = "", size = 14 }: TeamLabelProps) {
  if (!teamCode) return null;
  const info = getTeamInfo(teamCode);
  if (!info) return <span className={className}>{teamCode}</span>;
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Icon size={size} className="shrink-0 opacity-75" />
      {info.label}
    </span>
  );
}
