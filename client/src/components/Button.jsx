import React from 'react';
import clsx from 'clsx';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold tracking-wide shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-brand-800 hover:bg-brand-900 text-white border border-transparent focus:ring-brand-500',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border border-transparent focus:ring-rose-500',
    success:
      'bg-emerald-600 hover:bg-emerald-750 text-white border border-transparent focus:ring-emerald-500',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variants[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
