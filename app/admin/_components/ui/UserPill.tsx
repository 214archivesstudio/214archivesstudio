function initials(value: string): string {
  const parts = value.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface UserPillProps {
  readonly email: string;
  readonly role: string;
}

export function UserPill({ email, role }: UserPillProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a2a2a] text-[11px] tracking-[0.05em] text-accent">
        {initials(email)}
      </div>
      <div className="hidden md:flex items-center gap-2 text-[12px] text-accent">
        <span className="max-w-[180px] truncate">{email}</span>
        <span className="text-[#555]">·</span>
        <span className="text-muted">{role}</span>
      </div>
    </div>
  );
}
