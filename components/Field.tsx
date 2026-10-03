type FieldProps = {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  inputMode?: "decimal" | "numeric" | "text";
  placeholder?: string;
};

export function Field({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  inputMode = "decimal",
  placeholder,
}: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        className="h-11 w-full rounded-md border border-line bg-card px-3 font-mono text-[15px] tabular-nums text-foreground outline-none placeholder:font-sans placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <p id={hintId} className="text-xs leading-5 text-muted">
        {hint}
      </p>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium leading-5 text-foreground"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
