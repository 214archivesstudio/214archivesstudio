interface SearchInputProps {
  readonly section: string;
  readonly defaultValue: string;
}

export function SearchInput({ section, defaultValue }: SearchInputProps) {
  return (
    <form
      method="get"
      action="/admin/posts"
      className="flex w-[320px] items-center gap-2.5 rounded-[2px] border border-[#2a2a2a] px-3.5 py-2 transition-colors duration-200 focus-within:border-foreground"
    >
      {section && <input type="hidden" name="section" value={section} />}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#666"
        strokeWidth="1.5"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="제목 또는 슬러그 검색…"
        className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-[#555] outline-none"
      />
      <button
        type="submit"
        aria-label="검색"
        className="rounded-[2px] border border-[#2a2a2a] px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-muted transition-colors hover:border-foreground hover:text-foreground"
      >
        ⏎
      </button>
    </form>
  );
}
