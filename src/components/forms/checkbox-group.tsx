'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

interface Option {
  value: string
  label: string
  description?: string
}

interface CheckboxGroupProps {
  name: string
  label?: string
  description?: string
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  required?: boolean
  maxSelections?: number
  minSelections?: number
  className?: string
}

export function CheckboxGroup({
  name,
  label,
  description,
  options,
  value = [],
  onChange,
  error,
  required = false,
  maxSelections,
  minSelections,
  className,
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      // Add to selection if not at max limit
      if (!maxSelections || value.length < maxSelections) {
        onChange([...value, optionValue])
      }
    } else {
      // Remove from selection
      onChange(value.filter((v) => v !== optionValue))
    }
  }

  const isDisabled = (optionValue: string) => {
    const isSelected = value.includes(optionValue)
    return (
      !isSelected &&
      Boolean(maxSelections) &&
      value.length >= (maxSelections || 0)
    )
  }

  return (
    <fieldset className={cn('space-y-3', className)}>
      {label && (
        <legend className="text-ui-label text-text-gray font-medium">
          {label}
          {required && <span className="text-error-crimson ml-1">*</span>}
        </legend>
      )}

      {description && (
        <p className="text-body text-muted-gray">{description}</p>
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            id={`${name}-${option.value}`}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            disabled={isDisabled(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
          />
        ))}
      </div>

      {(maxSelections || minSelections) && (
        <p className="text-caption text-muted-gray">
          {maxSelections && minSelections
            ? `Select ${minSelections}-${maxSelections} options`
            : maxSelections
              ? `Select up to ${maxSelections} options`
              : `Select at least ${minSelections} options`}
          {maxSelections && ` (${value.length}/${maxSelections} selected)`}
        </p>
      )}

      {error && <p className="text-caption text-error-crimson">{error}</p>}
    </fieldset>
  )
}

interface MultiSelectProps {
  name: string
  label?: string
  placeholder?: string
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  helperText?: string
  required?: boolean
  maxSelections?: number
  searchable?: boolean
  className?: string
}

export function MultiSelect({
  name: _name,
  label,
  placeholder = 'Select options...',
  options,
  value = [],
  onChange,
  error,
  helperText,
  required = false,
  maxSelections,
  searchable = true,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOptions = searchable
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  )

  const handleToggleOption = (optionValue: string) => {
    const isSelected = value.includes(optionValue)

    if (isSelected) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      if (!maxSelections || value.length < maxSelections) {
        onChange([...value, optionValue])
      }
    }
  }

  const handleRemoveOption = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-ui-label text-text-gray font-medium">
          {label}
          {required && <span className="text-error-crimson ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Selected options display */}
        <div
          className={cn(
            'min-h-[40px] w-full rounded-card border bg-parchment-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-purple focus:ring-offset-2 cursor-pointer',
            {
              'border-border-gray': !error,
              'border-error-crimson': error,
            }
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-muted-gray text-body">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-1 rounded-sm bg-quill-blue text-parchment-white text-caption"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveOption(option.value)
                    }}
                    className="ml-1 text-blue-200 hover:text-parchment-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-parchment-white border border-border-gray rounded-card shadow-hover-card max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-border-gray">
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2 py-1 text-body border border-border-gray rounded focus:outline-none focus:ring-1 focus:ring-focus-purple"
                />
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-body text-muted-gray">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleToggleOption(option.value)}
                    disabled={
                      !value.includes(option.value) &&
                      Boolean(maxSelections) &&
                      value.length >= (maxSelections || 0)
                    }
                    className={cn(
                      'w-full text-left px-3 py-2 hover:bg-document-gray disabled:opacity-50 disabled:cursor-not-allowed',
                      {
                        'bg-quill-blue text-parchment-white': value.includes(
                          option.value
                        ),
                      }
                    )}
                  >
                    <div className="text-ui-label">{option.label}</div>
                    {option.description && (
                      <div className="text-caption text-muted-gray">
                        {option.description}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {maxSelections && (
        <p className="text-caption text-muted-gray">
          {value.length}/{maxSelections} selected
        </p>
      )}

      {(error || helperText) && (
        <p
          className={cn('text-caption', {
            'text-error-crimson': error,
            'text-muted-gray': helperText && !error,
          })}
        >
          {error || helperText}
        </p>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
