import React from 'react';
import Button from './Button';

const EmptyState = ({
    icon,
    title,
    description,
    actionText,
    onAction,
    className = "",
}) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-8 min-h-[40vh] ${className}`}>
            {icon && <div className="mb-4 opacity-50">{icon}</div>}
            {title && <h3 className="text-xl font-semibold text-gray-800">{title}</h3>}
            {description && <p className="text-gray-500 text-sm mt-1.5 max-w-sm">{description}</p>}
            {actionText && onAction && (
                <Button onClick={onAction} className="mt-6" variant="primary">
                    {actionText}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
