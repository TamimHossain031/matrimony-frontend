'use client';

import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent, SelectProps as BaseMuiSelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import FormHelperText from '@mui/material/FormHelperText';

export { MenuItem, ListSubheader };

export interface MuiSelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface MuiSelectProps
  extends Omit<BaseMuiSelectProps, 'onChange' | 'value'> {
  value?: string | number | readonly string[];
  options?: MuiSelectOption[];
  placeholder?: string;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  invalid?: boolean;
  onChange?: (event: { target: { value: string | number | readonly string[]; name?: string } }) => void;
  className?: string;
  selectClassName?: string;
}

const defaultSelectSx = {
  borderRadius: 'var(--radius, 8px)',
  backgroundColor: 'var(--paper-raised, #ffffff)',
  fontSize: '0.9rem',
  color: 'var(--ink, #1c2321)',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--rule, #c9cec6)',
    borderWidth: '1px',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--leaf, #2f5d50)',
  },
  '&.Mui-focused': {
    boxShadow: '0 0 0 3px var(--leaf-soft, #e3ebe5)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--leaf, #2f5d50)',
    borderWidth: '1px',
  },
  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--danger, #b4493f)',
  },
  '& .MuiSelect-select': {
    padding: '9.5px 12px',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'inherit',
  },
  '& .MuiSelect-icon': {
    color: 'var(--ink-soft, #52605c)',
  },
};

const defaultMenuPaperSx = {
  borderRadius: '10px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
  border: '1px solid var(--rule-soft, #e4e7e2)',
  backgroundColor: 'var(--paper-raised, #ffffff)',
  fontFamily: 'inherit',
  maxHeight: 340,
  overscrollBehavior: 'contain',
  '& .MuiMenuItem-root': {
    fontSize: '0.88rem',
    color: 'var(--ink, #1c2321)',
    fontFamily: 'inherit',
    padding: '8px 14px',
    transition: 'background-color 0.12s ease',
    '&:hover': {
      backgroundColor: 'var(--leaf-soft, #e3ebe5)',
      color: 'var(--leaf, #2f5d50)',
    },
    '&.Mui-selected': {
      backgroundColor: 'var(--leaf-soft, #e3ebe5)',
      color: 'var(--leaf, #2f5d50)',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: 'var(--leaf-soft, #e3ebe5)',
      },
    },
  },
  '& .MuiListSubheader-root': {
    fontSize: '0.74rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--ink-faint, #8a958f)',
    backgroundColor: 'var(--paper, #f2f4f1)',
    lineHeight: '32px',
    fontFamily: 'inherit',
  },
};

export const MuiSelect = React.forwardRef<HTMLDivElement, MuiSelectProps>(
  (
    {
      value = '',
      options,
      placeholder,
      label,
      helperText,
      invalid = false,
      error,
      onChange,
      children,
      className = '',
      size = 'small',
      fullWidth = true,
      sx,
      MenuProps,
      ...rest
    },
    ref,
  ) => {
    const isError = Boolean(invalid || error);
    const labelId = label
      ? `mui-select-label-${String(rest.id || rest.name || Math.random().toString(36).slice(2, 7))}`
      : undefined;

    const handleChange = (e: SelectChangeEvent<unknown>) => {
      if (onChange) {
        onChange({
          target: {
            value: e.target.value as string | number | readonly string[],
            name: rest.name,
          },
        });
      }
    };

    return (
      <FormControl
        fullWidth={fullWidth}
        size={size}
        error={isError}
        className={className}
        sx={{
          minWidth: 120,
          '& .MuiInputLabel-root': {
            fontSize: '0.88rem',
            color: 'var(--ink-soft, #52605c)',
            fontFamily: 'inherit',
            '&.Mui-focused': {
              color: 'var(--leaf, #2f5d50)',
            },
          },
        }}
      >
        {label && <InputLabel id={labelId}>{label}</InputLabel>}
        <Select
          ref={ref}
          labelId={labelId}
          value={value}
          label={label}
          onChange={handleChange}
          displayEmpty={Boolean(placeholder)}
          sx={{
            ...defaultSelectSx,
            ...sx,
          }}
          MenuProps={{
            disableScrollLock: true,
            slotProps: {
              paper: {
                sx: defaultMenuPaperSx,
                ...({ 'data-lenis-prevent': 'true' } as object),
                ...(MenuProps?.slotProps?.paper as object),
              },
              root: {
                ...({ 'data-lenis-prevent': 'true' } as object),
                ...(MenuProps?.slotProps?.root as object),
              },
            },
            ...MenuProps,
          }}
          {...rest}
        >
          {placeholder && (
            <MenuItem value="" disabled={rest.required}>
              <span style={{ color: 'var(--ink-faint, #8a958f)' }}>{placeholder}</span>
            </MenuItem>
          )}

          {options
            ? options.map((opt) => (
                <MenuItem key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </MenuItem>
              ))
            : children}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);

MuiSelect.displayName = 'MuiSelect';
export default MuiSelect;
