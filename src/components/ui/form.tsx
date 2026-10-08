'use client';

import React, { ReactNode } from 'react';

export function Field({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label?: ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="field-error">{error}</span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className = '', ...rest }, ref) => (
    <input ref={ref} className={`input ${invalid ? 'error' : ''} ${className}`} {...rest} />
  ),
);
Input.displayName = 'Input';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, className = '', ...rest }, ref) => (
    <textarea ref={ref} className={`textarea ${invalid ? 'error' : ''} ${className}`} {...rest} />
  ),
);
Textarea.displayName = 'Textarea';

interface Option {
  value: string | number;
  label: string;
}
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  options: Option[];
  placeholder?: string;
};
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ invalid, className = '', options, placeholder, ...rest }, ref) => (
    <select ref={ref} className={`select ${invalid ? 'error' : ''} ${className}`} {...rest}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
);
Select.displayName = 'Select';

export function Checkbox({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="check">
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

// A chip toggle group for multi-select (religions, professions, etc.)
export function ChipGroup<T extends string | number>({
  options,
  value,
  onChange,
  multiple = true,
}: {
  options: { value: T; label: string }[];
  value: T[];
  onChange: (next: T[]) => void;
  multiple?: boolean;
}) {
  const toggle = (v: T) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange(multiple ? [...value, v] : [v]);
    }
  };
  return (
    <div className="row wrap gap-2">
      {options.map((o) => (
        <button
          type="button"
          key={String(o.value)}
          className={`chip ${value.includes(o.value) ? 'selected' : ''}`}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function RangeField({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  format = (n) => String(n),
}: {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (lo: number, hi: number) => void;
  format?: (n: number) => string;
}) {
  return (
    <div className="stack gap-2">
      <div className="row between small muted">
        <span>{format(valueMin)}</span>
        <span>{format(valueMax)}</span>
      </div>
      <div className="range-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax), valueMax)}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin))}
        />
      </div>
    </div>
  );
}
