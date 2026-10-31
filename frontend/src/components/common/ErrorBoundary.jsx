import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("[ErrorBoundary caught an error]:", error, errorInfo);
    }

    handleReload = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50">
                    <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl mb-4 text-rose-600">
                        ⚠️
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Something Went Wrong</h2>
                    <p className="text-slate-500 text-sm mt-1 max-w-md">
                        Harvesto encountered an unexpected error while loading this view. Your cart items and orders are safely preserved.
                    </p>
                    <button
                        onClick={this.handleReload}
                        className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary-dull text-white rounded-full font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                        Back to Fresh Groceries
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
