import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface LayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, header, footer }) => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-[var(--background-color)] font-sans text-gray-900">
            {header}
            <main className={theme.layoutVariant === 'grid' ? 'container mx-auto p-4' : 'w-full'}>
                {children}
            </main>
            {footer}
        </div>
    );
};
