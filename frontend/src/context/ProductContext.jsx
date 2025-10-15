import React, { createContext, useContext, useState, useCallback } from 'react';

const ProductContext = createContext();

export const useProductRefresh = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductRefresh must be used within a ProductProvider');
    }
    return context;
};

export const ProductProvider = ({ children }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerProductRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const value = {
        refreshTrigger,
        triggerProductRefresh
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
