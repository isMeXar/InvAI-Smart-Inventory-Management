import React from 'react';
import { cn } from '@/lib/utils';

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className
}) => {
  return (
    <div className={cn(
      "inline-flex bg-muted rounded-lg border overflow-hidden",
      className
    )}>
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors duration-200 flex-1 relative",
            "focus:outline-none focus:ring-0 focus:ring-transparent",
            // Add right border to all buttons except the last one
            index < options.length - 1 && "border-r",
            value === option.value
              ? "bg-primary text-primary-foreground border-r-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-r-border"
          )}
          style={{
            borderTop: 'none',
            borderBottom: 'none',
            borderLeft: 'none',
            // Only set right border for middle buttons
            borderRight: index < options.length - 1 ? '1px solid hsl(var(--border))' : 'none',
            outline: 'none',
            boxShadow: 'none'
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};