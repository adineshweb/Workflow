import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

const Input = React.forwardRef(
  ({ label, type = 'text', name, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';

    // Check if custom styles are passed to prevent collisions
    const hasBg = className && (className.includes('bg-') || className.includes('bg-[#'));
    const hasText = className && className.includes('text-');
    const hasBorder = className && className.includes('border-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={name}
            name={name}
            type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
            ref={ref}
            className={clsx(
              'block w-full rounded-lg border px-3.5 py-2 text-sm transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0',
              !hasText && 'text-slate-900',
              error
                ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200'
                : clsx(
                    !hasBorder && 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
                    !hasBg && 'bg-white'
                  ),
              isPasswordType && 'pr-10',
              className
            )}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none flex items-center justify-center"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs font-medium text-rose-600 animate-fadeIn" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
