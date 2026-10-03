export type ClassForm = {
  id: string;
  name: string;
  authorized: string;
  parValue: string;
};

export type CalculatorForm = {
  issuedShares: string;
  grossAssets: string;
  classes: ClassForm[];
};

export type FieldParse<T> =
  | { ok: true; value: T }
  | { ok: false; empty: true; message: null }
  | { ok: false; empty: false; message: string };
