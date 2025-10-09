import React, { useState, useEffect } from 'react';
import { getMyOrders, getAllOrders, updateOrderStatus, cancelOrder } from '../services/orders';
import { getUserRole } from '../services/authutils';
import { Package, X, AlertCircle } from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [returnReason, setReturnReason] = useState('');
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const isAdmin = getUserRole() === 'admin';

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = isAdmin ? await getAllOrders() : await getMyOrders();
                setOrders(response.data || []);
            } catch (error) {
                console.error('Failed to load orders:', error);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [isAdmin]);

    const handleStatusUpdate = async (orderId) => {
        try {
            await updateOrderStatus(orderId, { 
                status: newStatus, 
                return_reason: newStatus === 'returned' ? returnReason : '' 
            });
            setOrders(prev => prev.map(order => 
                order.id === orderId 
                    ? { ...order, status: newStatus, return_reason: newStatus === 'returned' ? returnReason : order.return_reason }
                    : order
            ));
            setEditingOrder(null);
            setNewStatus('');
            setReturnReason('');
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await cancelOrder(orderId, cancelReason);
            setOrders(prev => prev.map(order => 
                order.id === orderId 
                    ? { ...order, status: 'cancelled', return_reason: cancelReason }
                    : order
            ));
            setCancellingOrder(null);
            setCancelReason('');
        } catch (error) {
            console.error('Failed to cancel order:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            packaging: 'bg-blue-100 text-blue-800 border-blue-200',
            on_the_way: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            returned: 'bg-red-100 text-red-800 border-red-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const canCancelOrder = (order) => {
        return !isAdmin && (order.status === 'pending' || order.status === 'packaging');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-light tracking-wider text-gray-600">Loading orders...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-neutral-900 font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                <h1 className="text-4xl font-light uppercase tracking-[0.3em] mb-10">
                    {isAdmin ? 'All Orders' : 'My Orders'}
                </h1>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-light tracking-wider text-gray-600">No orders found</h2>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium uppercase tracking-wide text-gray-900">
                                                Order #{order.id}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                            {isAdmin && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Customer: {order.first_name} {order.last_name} ({order.email})
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setEditingOrder(order.id)}
                                                    className="text-xs uppercase tracking-widest border border-black px-3 py-2 hover:bg-black hover:text-white transition duration-200"
                                                >
                                                    Update Status
                                                </button>
                                            )}
                                            {canCancelOrder(order) && (
                                                <button
                                                    onClick={() => setCancellingOrder(order.id)}
                                                    className="text-xs uppercase tracking-widest border border-red-500 text-red-500 px-3 py-2 hover:bg-red-500 hover:text-white transition duration-200 flex items-center gap-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items - Prominently Displayed */}
                                <div className="px-6 py-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Package className="w-5 h-5 text-gray-600" />
                                        <h4 className="text-lg font-medium uppercase tracking-wide text-gray-900">
                                            Order Items
                                        </h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {order.items?.map(item => (
                                            <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-medium text-gray-900 text-sm">
                                                        {item.product_detail?.name}
                                                    </h5>
                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                                        {item.size}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-600">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span className="font-medium">${item.price_at_purchase}</span>
                                                </div>
                                                <div className="text-right mt-2">
                                                    <span className="font-semibold text-gray-900">
                                                        ${(item.quantity * item.price_at_purchase).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Admin Status Update Section */}
                                {editingOrder === order.id && (
                                    <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertCircle className="w-4 h-4 text-blue-600" />
                                            <h5 className="text-sm font-medium uppercase tracking-wide text-blue-900">
                                                Update Order Status
                                            </h5>
                                        </div>
                                        <div className="flex gap-4 items-end">
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-700">Status</label>
                                                <select
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="packaging">Packaging</option>
                                                    <option value="on_the_way">On the Way</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="returned">Returned</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                            {newStatus === 'returned' && (
                                                <div className="flex-1">
                                                    <label className="block text-xs uppercase tracking-widest mb-1 text-gray-700">Return Reason</label>
                                                    <input
                                                        type="text"
                                                        value={returnReason}
                                                        onChange={(e) => setReturnReason(e.target.value)}
                                                        placeholder="Reason for return"
                                                        className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleStatusUpdate(order.id)}
                                                disabled={!newStatus}
                                                className="px-4 py-2 text-xs uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 transition duration-200 disabled:opacity-50 rounded-md"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingOrder(null);
                                                    setNewStatus('');
                                                    setReturnReason('');
                                                }}
                                                className="px-4 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:bg-gray-100 transition duration-200 rounded-md"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* User Cancel Order Section */}
                                {cancellingOrder === order.id && (
                                    <div className="px-6 py-4 bg-red-50 border-t border-red-200">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                            <h5 className="text-sm font-medium uppercase tracking-wide text-red-900">
                                                Cancel Order
                                            </h5>
                                        </div>
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-xs uppercase tracking-widest mb-1 text-gray-700">Cancellation Reason</label>
                                                <input
                                                    type="text"
                                                    value={cancelReason}
                                                    onChange={(e) => setCancelReason(e.target.value)}
                                                    placeholder="Please provide a reason for cancellation"
                                                    className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={!cancelReason.trim()}
                                                className="px-4 py-2 text-xs uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition duration-200 disabled:opacity-50 rounded-md"
                                            >
                                                Cancel Order
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCancellingOrder(null);
                                                    setCancelReason('');
                                                }}
                                                className="px-4 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:bg-gray-100 transition duration-200 rounded-md"
                                            >
                                                Keep Order
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Order Details Section */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium uppercase tracking-wide mb-3 text-gray-900">Shipping Address</h4>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <p className="text-sm text-gray-700">
                                                    {order.first_address}
                                                    {order.second_address && <><br />{order.second_address}</>}
                                                    {order.is_office_address && <><br /><span className="text-xs text-gray-500 font-medium">(Office Address)</span></>}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium uppercase tracking-wide mb-3 text-gray-900">Order Summary</h4>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Items:</span>
                                                        <span className="font-medium">{order.items?.length || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Total Quantity:</span>
                                                        <span className="font-medium">
                                                            {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Order Total:</span>
                                                        <span className="font-semibold text-lg">
                                                            ${order.items?.reduce((sum, item) => sum + (item.quantity * item.price_at_purchase), 0).toFixed(2) || '0.00'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Return/Cancel Reason Display */}
                                {order.return_reason && (
                                    <div className="px-6 py-4 bg-red-50 border-t border-red-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                            <h4 className="text-sm font-medium uppercase tracking-wide text-red-900">
                                                {order.status === 'cancelled' ? 'Cancellation Reason' : 'Return Reason'}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-red-700 bg-white p-3 rounded-lg border border-red-200">
                                            {order.return_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
