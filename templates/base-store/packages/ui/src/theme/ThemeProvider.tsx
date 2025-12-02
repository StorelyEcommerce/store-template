import React, { createContext, useContext, useEffect } from 'react';
import { StoreThemeConfig } from '@store/shared-types';
import { DEFAULT_THEME } from '@store/shared-config';

interface ThemeContextType {
    theme: StoreThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({ theme: DEFAULT_THEME });

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    theme: StoreThemeConfig;
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--secondary-color', theme.secondaryColor);
        root.style.setProperty('--background-color', theme.backgroundColor);
        if (theme.fontFamily) {
            root.style.setProperty('--font-family', theme.fontFamily);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};
