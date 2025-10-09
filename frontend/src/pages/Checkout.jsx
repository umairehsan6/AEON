import React, { useState, useEffect } from 'react';
import { checkoutOrder, getUserCheckoutData } from '../services/orders';
import { getCart } from '../services/cart';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [firstAddress, setFirstAddress] = useState('');
    const [secondAddress, setSecondAddress] = useState('');
    const [isOffice, setIsOffice] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [cartEmpty, setCartEmpty] = useState(false);
    const navigate = useNavigate();
    const { refreshCount } = useCart();

    // Load user data, addresses, and cart items on component mount
    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const [userDataResponse, cartResponse] = await Promise.all([
                    getUserCheckoutData(),
                    getCart()
                ]);
                
                const { user, addresses } = userDataResponse.data;
                
                // Pre-fill user details (read-only)
                setFirstName(user.first_name || '');
                setLastName(user.last_name || '');
                setEmail(user.email || '');
                setPhone(user.phone || '');
                
                // Pre-fill addresses (editable)
                setFirstAddress(addresses.first_address || '');
                setSecondAddress(addresses.second_address || '');
                setIsOffice(addresses.is_office_address || false);
                
                // Load cart items
                const cartData = cartResponse.data;
                const items = cartData.items || [];
                
                // Check if cart is empty
                if (items.length === 0) {
                    setCartEmpty(true);
                    setLoading(false);
                    return;
                }
                
                setCartItems(items);
                
                // Calculate total
                const total = items.reduce((sum, item) => {
                    return sum + (parseFloat(item.price_at_add) * item.quantity);
                }, 0);
                setTotalAmount(total);
                
                // Calculate expected delivery date (7 days from now)
                const today = new Date();
                const deliveryDate = new Date(today);
                deliveryDate.setDate(today.getDate() + 7);
                setExpectedDeliveryDate(deliveryDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }));
                
            } catch (error) {
                console.error('Failed to load checkout data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadCheckoutData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!firstAddress.trim()) {
            alert('Please enter your first address.');
            return;
        }
        if (!secondAddress.trim()) {
            alert('Please enter your second address.');
            return;
        }
        
        console.log('Form submitted, starting checkout...');
        setSubmitting(true);
        try {
            console.log('Sending checkout data:', { 
                first_address: firstAddress, 
                second_address: secondAddress, 
                is_office_address: isOffice 
            });
            console.log('Cart items being checked out:', cartItems);
            const result = await checkoutOrder({ 
                first_address: firstAddress, 
                second_address: secondAddress, 
                is_office_address: isOffice 
            });
            console.log('Checkout successful:', result);
            setShowSuccess(true);
            await refreshCount();
            setTimeout(() => {
                setShowSuccess(false);
                navigate('/profile');
            }, 1200);
        } catch (e) {
            console.error('Checkout failed', e);
            alert('Checkout failed: ' + (e.response?.data?.detail || e.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-neutral-900 font-sans flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-light uppercase tracking-widest mb-4">Loading...</h2>
                    <p className="text-gray-600">Preparing your checkout information</p>
                </div>
            </div>
        );
    }

    if (cartEmpty) {
        return (
            <div className="min-h-screen bg-white text-neutral-900 font-sans flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="mb-8">
                        <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-light uppercase tracking-widest mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-8">You need to add items to your cart before you can checkout.</p>
                    <button 
                        onClick={() => navigate('/cart')}
                        className="px-8 py-3 text-sm uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition duration-150"
                    >
                        View Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-neutral-900 font-sans">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
                <h1 className="text-4xl font-light uppercase tracking-[0.3em] mb-10">Checkout</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
                            <h3 className="text-lg font-medium uppercase tracking-widest mb-6">Order Summary</h3>
                            
                            {/* Cart Items */}
                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 pb-4">
                                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                                            {item.product_detail?.image_url?.[0] ? (
                                                <img 
                                                    src={item.product_detail.image_url[0]} 
                                                    alt={item.product_detail.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                {item.product_detail?.name || 'Product'}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Size: {item.size || 'One Size'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium">
                                            ${(parseFloat(item.price_at_add) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center text-lg font-medium">
                                    <span className="uppercase tracking-widest">Total</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            {/* Expected Delivery */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Expected Delivery</p>
                                    <p className="text-sm font-medium text-gray-900">{expectedDeliveryDate}</p>
                                </div>
                            </div>
                            
                            {/* Payment Method Notice */}
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-yellow-800 uppercase tracking-widest">
                                            Cash on Delivery
                                        </h4>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Payment will be collected when your order is delivered.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column - Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Details Section - Read Only */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium uppercase tracking-widest mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest mb-2">First Name</label>
                                <input value={firstName} readOnly className="w-full border-b border-gray-300 py-2 bg-transparent text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest mb-2">Last Name</label>
                                <input value={lastName} readOnly className="w-full border-b border-gray-300 py-2 bg-transparent text-gray-600" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest mb-2">Email</label>
                                <input type="email" value={email} readOnly className="w-full border-b border-gray-300 py-2 bg-transparent text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest mb-2">Phone</label>
                                <input type="tel" value={phone} readOnly className="w-full border-b border-gray-300 py-2 bg-transparent text-gray-600" />
                            </div>
                        </div>
                    </div>

                    {/* Address Section - Editable */}
                    <div>
                        <h3 className="text-lg font-medium uppercase tracking-widest mb-4">Delivery Address</h3>
                        <p className="text-xs text-gray-500 mb-4">* All fields are required</p>
                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-2">First Address *</label>
                            <input value={firstAddress} onChange={(e) => setFirstAddress(e.target.value)} required className="w-full border-b border-black py-2 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest mb-2">Second Address *</label>
                            <input value={secondAddress} onChange={(e) => setSecondAddress(e.target.value)} required className="w-full border-b border-black py-2 focus:outline-none" />
                        </div>
                        <div className="flex items-center gap-3">
                            <input id="office" type="checkbox" checked={isOffice} onChange={(e) => setIsOffice(e.target.checked)} />
                            <label htmlFor="office" className="text-xs uppercase tracking-widest">Is this your office address?</label>
                        </div>
                        <div className="flex justify-end">
                            <button disabled={submitting} className="px-8 py-3 text-sm uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition duration-150">{submitting ? 'Placing...' : 'Place Order'}</button>
                        </div>
                    </div>
                        </form>
                    </div>
                </div>
            </div>

            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 shadow-lg">
                        <p className="uppercase tracking-widest">Your order has been placed.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;


