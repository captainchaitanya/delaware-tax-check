import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldWrapProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
};

export function FieldWrap({ id, label, hint, error, children }: FieldWrapProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-xs leading-5 text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium leading-5">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
};

export function TextInput({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}: TextInputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={`h-11 w-full rounded-md border border-line bg-card px-3 text-[15px] text-foreground outline-none placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 ${props.inputMode === "decimal" || props.inputMode === "numeric" ? "font-mono tabular-nums" : ""} ${className}`}
        {...props}
      />
    </FieldWrap>
  );
}

type SelectInputProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
};

export function SelectInput({
  id,
  label,
  hint,
  error,
  className = "",
  children,
  ...props
}: SelectInputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={`h-11 w-full rounded-md border border-line bg-card px-3 text-[15px] text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrap>
  );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
};

export function TextArea({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}: TextAreaProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={`min-h-40 w-full rounded-md border border-line bg-card px-3 py-2 text-[15px] text-foreground outline-none placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...props}
      />
    </FieldWrap>
  );
}
