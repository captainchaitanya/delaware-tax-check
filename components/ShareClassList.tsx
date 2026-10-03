import { Field } from "./Field";
import { parseNonNegativeDecimal, parseWholeNumber } from "@/lib/formValidation";
import type { ClassForm } from "@/lib/formTypes";

type ShareClassListProps = {
  classes: ClassForm[];
  onChange: (classes: ClassForm[]) => void;
};

export function ShareClassList({ classes, onChange }: ShareClassListProps) {
  function update(id: string, patch: Partial<ClassForm>) {
    onChange(classes.map((cls) => (cls.id === id ? { ...cls, ...patch } : cls)));
  }

  function remove(id: string) {
    if (classes.length === 1) {
      return;
    }
    onChange(classes.filter((cls) => cls.id !== id));
  }

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-medium text-foreground">
        Share classes
      </legend>
      <p className="text-xs leading-5 text-muted">
        Authorized shares and par value are on the Certificate of
        Incorporation, listed per class.
      </p>

      <div className="flex flex-col gap-5">
        {classes.map((cls, index) => {
          const authorized = parseWholeNumber(cls.authorized);
          const parValue = parseNonNegativeDecimal(cls.parValue);
          const label = cls.name.trim() || `Class ${index + 1}`;

          return (
            <div
              key={cls.id}
              className="flex flex-col gap-3 rounded-md border border-line bg-paper/60 p-3 sm:p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`class-name-${cls.id}`}
                  className="text-xs font-medium uppercase tracking-wide text-muted"
                >
                  Class {index + 1}
                </label>
                {classes.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(cls.id)}
                    className="text-sm text-foreground underline decoration-line underline-offset-4 hover:decoration-foreground"
                  >
                    Remove {label}
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  id={`class-name-${cls.id}`}
                  label="Name"
                  hint="Common, Preferred, etc."
                  value={cls.name}
                  onChange={(name) => update(cls.id, { name })}
                  error={null}
                  inputMode="text"
                  placeholder="Common"
                />
                <Field
                  id={`class-auth-${cls.id}`}
                  label="Authorized shares"
                  hint="Total authorized for this class."
                  value={cls.authorized}
                  onChange={(authorized) => update(cls.id, { authorized })}
                  error={authorized.ok || authorized.empty ? null : authorized.message}
                  inputMode="numeric"
                  placeholder="10,000,000"
                />
                <Field
                  id={`class-par-${cls.id}`}
                  label="Par value"
                  hint="Stated par per share, e.g. 0.00001."
                  value={cls.parValue}
                  onChange={(next) => update(cls.id, { parValue: next })}
                  error={parValue.ok || parValue.empty ? null : parValue.message}
                  inputMode="decimal"
                  placeholder="0.00001"
                />
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
