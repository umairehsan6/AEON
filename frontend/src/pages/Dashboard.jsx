import React, { useState, useEffect } from 'react';
import { getAllOrders } from '../services/orders';
import { getProducts } from '../services/inventory';
import { getCollections } from '../services/collection';

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalCollections: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        returnedOrders: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [ordersRes, productsRes, collectionsRes] = await Promise.all([
                    getAllOrders(),
                    getProducts(),
                    getCollections()
                ]);

                const orders = ordersRes.data || [];
                const products = productsRes.data || [];
                const collections = collectionsRes.data || [];

                const statusCounts = orders.reduce((acc, order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1;
                    return acc;
                }, {});

                setStats({
                    totalOrders: orders.length,
                    totalProducts: products.length,
                    totalCollections: collections.length,
                    pendingOrders: statusCounts.pending || 0,
                    deliveredOrders: statusCounts.delivered || 0,
                    returnedOrders: statusCounts.returned || 0,
                    recentOrders: orders.slice(0, 5)
                });
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            packaging: 'bg-blue-100 text-blue-800',
            on_the_way: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            returned: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-light tracking-wider text-gray-600">Loading dashboard...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 text-neutral-900 font-sans">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                <h1 className="text-4xl font-bold uppercase tracking-wider mb-10">Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600 mb-2">Total Orders</h3>
                        <p className="text-3xl font-light">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600 mb-2">Total Products</h3>
                        <p className="text-3xl font-light">{stats.totalProducts}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600 mb-2">Total Collections</h3>
                        <p className="text-3xl font-light">{stats.totalCollections}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600 mb-2">Pending Orders</h3>
                        <p className="text-3xl font-light">{stats.pendingOrders}</p>
                    </div>
                </div>

                {/* Order Status Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-green-500 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-green-600 mb-2">Delivered</h3>
                        <p className="text-2xl font-light text-green-800">{stats.deliveredOrders}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-red-500 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-red-600 mb-2">Returned</h3>
                        <p className="text-2xl font-light text-red-800">{stats.returnedOrders}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-yellow-500 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-sm font-medium uppercase tracking-wide text-yellow-600 mb-2">Pending</h3>
                        <p className="text-2xl font-light text-yellow-800">{stats.pendingOrders}</p>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-100">
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b pb-3">Recent Orders</h2>
                    {stats.recentOrders.length === 0 ? (
                        <p className="text-gray-600 text-center py-8 italic">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentOrders.map(order => (
                                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <div>
                                        <p className="font-medium">Order #{order.id}</p>
                                        <p className="text-sm text-gray-600">
                                            {order.first_name} {order.last_name} • {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

