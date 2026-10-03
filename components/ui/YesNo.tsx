type YesNoProps = {
  legend: string;
  hint?: string;
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function YesNo({ legend, hint, name, value, onChange }: YesNoProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      {hint ? <p className="text-xs leading-5 text-muted">{hint}</p> : null}
      <div className="flex gap-2">
        {[
          { label: "Yes", next: true },
          { label: "No", next: false },
        ].map((option) => {
          const selected = value === option.next;
          return (
            <label
              key={option.label}
              className={`flex h-11 flex-1 cursor-pointer items-center justify-center rounded-md border text-sm ${
                selected
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-line bg-card text-muted"
              }`}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={selected}
                onChange={() => onChange(option.next)}
              />
              <span>
                {option.label}
                {selected ? (
                  <span className="sr-only">, selected</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
