import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCart } from '../services/cart';

const CartContext = createContext({ count: 0, refreshCount: async () => {}, setCount: () => {}, addCount: () => {} });

export const CartProvider = ({ children }) => {
    const [count, setCount] = useState(0);

    const computeCount = (cartData) => {
        if (!cartData || !Array.isArray(cartData.items)) return 0;
        return cartData.items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
    };

    const refreshCount = useCallback(async () => {
        try {
            const res = await getCart();
            setCount(computeCount(res?.data));
        } catch (e) {
            // If not logged in, keep count at 0
            setCount(0);
        }
    }, []);

    const addCount = useCallback((qty) => {
        setCount((c) => c + Number(qty || 1));
    }, []);

    useEffect(() => {
        refreshCount();
    }, [refreshCount]);

    return (
        <CartContext.Provider value={{ count, setCount, refreshCount, addCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);


