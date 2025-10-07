import React, { useState, useMemo, useCallback } from 'react';
import { Trash2 } from 'lucide-react'; // Using Lucide for a clean icon

// --- Configuration ---
const SHIPPING_COST = 15.00;
const FREE_SHIPPING_THRESHOLD = 150.00;

// Custom Tailwind classes defined inline for the Zara aesthetic
const customStyles = {
    zaraBlack: '#000000',
    zaraLightGray: '#F5F5F5',
    zaraMediumGray: '#333333',
    cartTitleClass: 'text-4xl font-light uppercase tracking-[0.3em] mb-12',
    // UPDATED: This class now only holds structural Tailwind properties.
    buttonClass: 'mt-8 w-full py-4 uppercase tracking-widest font-medium rounded-none transition duration-150',
    qtyButtonClass: 'border border-black w-6 h-6 leading-5 text-center cursor-pointer select-none transition duration-150 hover:bg-gray-100 flex items-center justify-center text-xs',
    summaryBackground: 'p-6 border border-gray-100 bg-zara-light-gray',
    divider: 'h-px bg-gray-200 my-6'
};

// --- Utility Functions ---

/**
 * Converts a number to a currency string format.
 */
const formatCurrency = (amount) => {
    return '$' + amount.toFixed(2);
};

// --- Initial Mock Data ---
// Added isSelected: true property for default selection
const initialCartData = [
    { id: 1, name: "Ribbed High-Neck Sweater", color: "Black", size: "M", price: 69.90, quantity: 1, imageUrl: "https://placehold.co/150x200/000000/FFFFFF?text=SWEATER", isSelected: true },
    { id: 2, name: "Structured Mini Skirt", color: "Cream", size: "S", price: 49.90, quantity: 2, imageUrl: "https://placehold.co/150x200/F5F5F5/333333?text=SKIRT", isSelected: true },
    { id: 3, name: "Oversized Linen Blazer", color: "Khaki", size: "L", price: 129.00, quantity: 1, imageUrl: "https://placehold.co/150x200/D3D3D3/000000?text=BLAZER", isSelected: true },
];

// --- Cart Item Component ---
const CartItem = React.memo(({ item, updateQuantity, removeItem, toggleSelection }) => {
    const { id, name, color, size, price, quantity, imageUrl, isSelected } = item;

    // Item total based on current quantity and price
    const itemTotal = price * quantity;

    return (
        <div className={`flex items-start py-6 border-b border-gray-100 ${isSelected ? '' : 'opacity-60'}`}>
            {/* Selection Checkbox Column */}
            <div className="pt-2 pr-4">
                 <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => toggleSelection(id)}
                    className="w-4 h-4 text-zara-black bg-white border-black rounded-none cursor-pointer focus:ring-zara-black"
                />
            </div>
            
            {/* Image Column */}
            <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-none">
                <img
                    src={imageUrl}
                    alt={name}
                    onError={(e) => e.currentTarget.src = "https://placehold.co/150x200/000000/FFFFFF?text=ITEM"}
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* Details Column */}
            <div className="ml-6 flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-base font-normal uppercase tracking-wide mb-1">{name}</h3>
                        {/* Highlight total if item is selected */}
                        <p className={`text-sm font-medium ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                            {formatCurrency(itemTotal)}
                        </p>
                    </div>
                    {/* Individual Remove Button (Negative Action for Item) */}
                    <button
                        onClick={() => removeItem(id)}
                        className="text-xs text-gray-400 hover:text-zara-black transition duration-150 uppercase font-medium flex items-center space-x-1"
                        aria-label={`Remove ${name}`}
                    >
                        <Trash2 className="w-3 h-3 hidden sm:block" />
                        <span>Remove</span>
                    </button>
                </div>

                <div className="mt-2 space-y-1 text-[0.8rem] uppercase tracking-wider text-gray-700">
                    <p>Color: {color}</p>
                    <p>Size: {size}</p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center mt-3">
                    <button
                        onClick={() => updateQuantity(id, quantity - 1)}
                        className={customStyles.qtyButtonClass}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        &mdash;
                    </button>
                    <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-10 h-6 text-center text-sm font-medium border-t border-b border-gray-300 rounded-none focus:outline-none bg-white"
                    />
                    <button
                        onClick={() => updateQuantity(id, quantity + 1)}
                        className={customStyles.qtyButtonClass}
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
});

// --- Main Application Component ---
export default function Cart() {
    const [cartItems, setCartItems] = useState(initialCartData);
    const [message, setMessage] = useState(null);
    const [messageStyle, setMessageStyle] = useState("bg-green-100 text-green-700");

    // Dynamic color setup...
    const containerStyle = {
        '--zara-black': customStyles.zaraBlack,
        '--zara-medium-gray': customStyles.zaraMediumGray,
    };

    /**
     * Displays a temporary message at the bottom.
     */
    const showMessage = (msg, style = "bg-green-100 text-green-700") => {
        setMessage(msg);
        setMessageStyle(style);
        setTimeout(() => {
            setMessage(null);
            setMessageStyle("bg-green-100 text-green-700"); // Reset style after timeout
        }, 3000);
    };

    /**
     * Calculates the summary data based *only* on the currently selected items.
     */
    const summaryData = useMemo(() => {
        let subtotal = 0;
        let totalSelectedItems = 0;

        cartItems.forEach(item => {
            if (item.isSelected) {
                subtotal += item.price * item.quantity;
                totalSelectedItems += item.quantity;
            }
        });

        // Shipping calculation based on selected items' subtotal
        const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
        const total = subtotal + shipping;

        // Total items in the entire cart (selected + unselected)
        const totalItemsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);

        return { subtotal, shipping, total, totalSelectedItems, totalItemsInCart };
    }, [cartItems]);

    /**
     * Toggles the selection status of a product.
     */
    const toggleSelection = useCallback((id) => {
        setCartItems(prevItems => {
            const newItems = prevItems.map(item =>
                item.id === id ? { ...item, isSelected: !item.isSelected } : item
            );
            
            const item = newItems.find(i => i.id === id);
            if (item) {
                showMessage(`${item.name} ${item.isSelected ? 'selected' : 'deselected'}.`, 'bg-blue-100 text-blue-700');
            }
            return newItems;
        });
    }, []);

    /**
     * Removes an item from the cart.
     */
    const removeItem = useCallback((id) => {
        const itemToRemove = cartItems.find(item => item.id === id);
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
        showMessage(`${itemToRemove ? itemToRemove.name : 'Item'} removed.`, "bg-red-100 text-red-700");
    }, [cartItems]);


    /**
     * Updates the quantity of a specific item.
     */
    const updateQuantity = useCallback((id, newQuantity) => {
        if (newQuantity < 1) {
            removeItem(id);
            return;
        }

        setCartItems(prevItems => {
            const itemToUpdate = prevItems.find(item => item.id === id);
            if (itemToUpdate && itemToUpdate.quantity !== newQuantity) {
                 showMessage(`Quantity updated for ${itemToUpdate.name}.`, 'bg-blue-100 text-blue-700');
                 return prevItems.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                );
            }
            return prevItems;
        });
    }, [removeItem]);

    const handleCheckout = () => {
        const selectedUniqueItems = cartItems.filter(item => item.isSelected).length;
        if (selectedUniqueItems > 0) {
            showMessage(`Proceeding to payment stage with ${summaryData.totalSelectedItems} items (Total: ${formatCurrency(summaryData.total)}).`, 'bg-green-100 text-green-700');
        } else {
            showMessage("Please select at least one item to proceed to checkout.", "bg-red-100 text-red-700");
        }
    };

    const isCartEmpty = summaryData.totalItemsInCart === 0;
    const isCheckoutPossible = summaryData.totalSelectedItems > 0;

    return (
        <div style={containerStyle} className="font-sans min-h-screen bg-white text-zara-black">
            <style>{`
                /* Injecting custom CSS variables for Tailwind usage */
                :root {
                    --zara-black: #000000;
                    --zara-medium-gray: #333333;
                }
                /* Custom checkbox styling for black/white aesthetic */
                input[type="checkbox"]:checked {
                    background-color: var(--zara-black);
                    border-color: var(--zara-black);
                }
                input[type="checkbox"] {
                    border-color: var(--zara-black);
                }
            `}</style>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Minimal Header */}
                <header className="text-center">
                    <h1 className={customStyles.cartTitleClass}>Shopping Bag</h1>
                </header>

                <main className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Cart Items List (Left/Top) */}
                    <section className="lg:w-3/5">
                        {isCartEmpty ? (
                            <p className="text-center py-10 text-gray-500 uppercase tracking-widest text-sm">
                                Your shopping bag is empty.
                            </p>
                        ) : (
                            cartItems.map(item => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    updateQuantity={updateQuantity}
                                    removeItem={removeItem}
                                    toggleSelection={toggleSelection}
                                />
                            ))
                        )}
                    </section>

                    {/* Order Summary (Right/Bottom) */}
                    <section className={`lg:w-2/5 lg:sticky lg:top-10 h-min ${customStyles.summaryBackground}`}>
                        <h2 className="text-xl font-normal mb-6 uppercase tracking-widest">Order Summary</h2>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center text-gray-700">
                                {/* Display total quantity of selected items */}
                                <span className="uppercase">Subtotal ({summaryData.totalSelectedItems} items)</span>
                                <span className="font-medium">{formatCurrency(summaryData.subtotal)}</span>
                            </div>

                            <div className="flex justify-between items-center text-gray-700">
                                <span className="uppercase">Shipping</span>
                                <span className="font-medium">
                                    {summaryData.shipping === 0 ? 'FREE' : formatCurrency(summaryData.shipping)}
                                </span>
                            </div>

                            <div className={customStyles.divider}></div>

                            <div className="flex justify-between items-center text-lg font-semibold">
                                <span className="uppercase">Total</span>
                                <span>{formatCurrency(summaryData.total)}</span>
                            </div>
                        </div>

                        <p className="text-xs mt-6 text-gray-600">
                            *Taxes calculated at checkout. Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
                        </p>

                        {/* Checkout Button (Primary Action) - FIXED TO BLACK BACKGROUND */}
                        <button
                            onClick={handleCheckout}
                            // Apply custom black background and white text using inline style for reliability
                            style={{ 
                                backgroundColor: customStyles.zaraBlack, 
                                color: 'white' 
                            }}
                            className={`${customStyles.buttonClass} hover:bg-gray-800 ${!isCheckoutPossible ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!isCheckoutPossible}
                        >
                            CHECKOUT
                        </button>

                        {/* Message Box */}
                        {message && (
                            <div className={`mt-4 p-3 rounded-sm text-center text-sm ${messageStyle}`} role="alert">
                                {message}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
