'use client';

import React from 'react';

type Variant = 'primary' | 'ghost' | 'subtle' | 'rose' | 'danger' | 'default';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  subtle: 'btn-subtle',
  rose: 'btn-rose',
  danger: 'btn-danger',
  default: '',
};

export function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  block = false,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    variantClass[variant],
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
      {children}
    </button>
  );
}
