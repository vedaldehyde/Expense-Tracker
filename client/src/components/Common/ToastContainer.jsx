import React from 'react';

const ToastContainer = ({ toasts, removeToast }) => {
    if (!toasts || toasts.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    return (
        <div className="toast-wrapper">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-item toast-${toast.type}`}>
                    <span className="toast-icon">{getIcon(toast.type)}</span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
