import React from 'react';

const Input = ({
    label,
    error,
    helperText,
    id,
    type = "text",
    placeholder,
    value,
    onChange,
    name,
    required = false,
    className = "",
    ...props
}) => {
    const inputId = id || name;

    return (
        <div className={`w-full flex flex-col gap-1 ${className}`}>
            {label && (
                <label htmlFor={inputId} className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full px-3.5 py-2.5 border rounded-md outline-none text-gray-800 text-sm transition-all duration-150 ${
                    error 
                        ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200" 
                        : "border-gray-300 focus:border-primary focus:ring-1 focus:ring-emerald-100"
                }`}
                {...props}
            />
            {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
            {!error && helperText && <p className="text-xs text-gray-400 mt-0.5">{helperText}</p>}
        </div>
    );
};

export default Input;

