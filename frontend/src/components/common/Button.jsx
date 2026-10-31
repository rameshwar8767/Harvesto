import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    type = "button",
    onClick,
    ...props
}) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantClasses = {
        primary: "bg-primary hover:bg-primary-dull text-white shadow-sm",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
        outline: "border border-primary text-primary hover:bg-primary hover:text-white",
        danger: "bg-rose-600 hover:bg-rose-700 text-white",
        ghost: "hover:bg-gray-100 text-gray-700",
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-5 py-2.5 text-sm gap-2",
        lg: "px-7 py-3 text-base gap-2.5",
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
            {...props}
        >
            {loading && <LoadingSpinner size="sm" className={variant === "outline" || variant === "ghost" ? "border-primary" : "border-white"} />}
            {children}
        </button>
    );
};

export default Button;

