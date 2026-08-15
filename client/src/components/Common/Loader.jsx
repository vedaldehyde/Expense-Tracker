import React from 'react';

export const Spinner = ({ size = 'medium', text = '' }) => {
    const sizeClass = size === 'small' ? 'spinner-sm' : size === 'large' ? 'spinner-lg' : 'spinner-md';
    return (
        <div className="spinner-container">
            <div className={`spinner ${sizeClass}`}></div>
            {text && <span className="spinner-text">{text}</span>}
        </div>
    );
};

export const CardSkeleton = ({ count = 3 }) => {
    return (
        <div className="skeleton-wrapper">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-card">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line subtitle"></div>
                    <div className="skeleton-line short"></div>
                </div>
            ))}
        </div>
    );
};

export default Spinner;
