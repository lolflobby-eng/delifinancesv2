
import React from 'react';

// Card Component
export const GlassCard = ({ children, className = '', style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => {
    return (
        <div className={`glass-panel ${className}`} style={{ padding: '1.5rem', ...style }}>
            {children}
        </div>
    );
};

// Neon Button Component
export const NeonButton = ({ children, onClick, variant = 'primary', className = '', style = {} }: { children: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'danger' | 'success', className?: string, style?: React.CSSProperties }) => {
    let colorVar = 'var(--accent-primary)';
    let glowVar = 'var(--neon-glow-primary)';

    if (variant === 'secondary') { colorVar = 'var(--accent-secondary)'; glowVar = 'var(--neon-glow-secondary)'; }
    if (variant === 'danger') { colorVar = 'var(--accent-danger)'; glowVar = 'none'; }
    if (variant === 'success') { colorVar = 'var(--accent-success)'; glowVar = 'none'; }

    return (
        <button
            onClick={onClick}
            className={className}
            style={{
                background: 'transparent',
                border: `1px solid ${colorVar}`,
                color: colorVar,
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: glowVar,
                textShadow: `0 0 5px ${colorVar}`,
                transition: 'all 0.2s ease',
                ...style
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = colorVar;
                e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colorVar;
            }}
        >
            {children}
        </button>
    );
};

// Input Component
export const NeonInput = ({ type = 'text', placeholder, value, onChange, style = {}, id }: { type?: string, placeholder?: string, value?: string | number, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, style?: React.CSSProperties, id?: string }) => {
    return (
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '0.8rem',
                borderRadius: '6px',
                outline: 'none',
                width: '100%',
                ...style
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
    );
};
