'use client';

import type { ReactNode } from 'react';

const inputCls =
  'mt-1.5 w-full rounded-lg border border-espresso/15 bg-cream px-3 py-2.5 text-sm text-espresso outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/25';

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-espresso">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm font-medium text-espresso">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`${inputCls} resize-none`}
      />
    </label>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-milk p-5 shadow-card ring-1 ring-espresso/5 ${className}`}>
      {children}
    </div>
  );
}

export function SaveBar({
  saving,
  saved,
  onSave,
  label = 'Зберегти',
}: {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onSave} disabled={saving} className="btn-primary">
        {saving ? 'Збереження…' : label}
      </button>
      {saved && <span className="text-sm text-terracotta">Збережено ✓</span>}
    </div>
  );
}
