import React, { useState, useEffect } from 'react';
import { getAllOrders, getSalesStatistics } from '../services/orders';
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
    const [salesStats, setSalesStats] = useState({
        total_revenue: 0,
        total_orders: 0,
        total_shipping: 0,
        total_subtotal: 0,
        average_order_value: 0,
        revenue_growth: 0,
        orders_growth: 0,
        status_breakdown: [],
        daily_sales: [],
        top_products: []
    });
    const [loading, setLoading] = useState(true);
    const [salesLoading, setSalesLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('current');

    const loadSalesStatistics = async (period = 'current') => {
        try {
            setSalesLoading(true);
            const response = await getSalesStatistics({ period });
            // Ensure we have the expected data structure
            const data = response.data || {};
            setSalesStats({
                total_revenue: data.summary?.total_revenue || 0,
                total_orders: data.summary?.total_orders || 0,
                total_shipping: data.summary?.total_shipping || 0,
                total_subtotal: data.summary?.total_subtotal || 0,
                average_order_value: data.summary?.average_order_value || 0,
                revenue_growth: data.summary?.revenue_growth || 0,
                orders_growth: data.summary?.orders_growth || 0,
                status_breakdown: data.status_breakdown || [],
                daily_sales: data.daily_sales || [],
                top_products: data.top_products || []
            });
        } catch (error) {
            console.error('Failed to load sales statistics:', error);
            // Set default values on error
            setSalesStats({
                total_revenue: 0,
                total_orders: 0,
                total_shipping: 0,
                total_subtotal: 0,
                average_order_value: 0,
                revenue_growth: 0,
                orders_growth: 0,
                status_breakdown: [],
                daily_sales: [],
                top_products: []
            });
        } finally {
            setSalesLoading(false);
        }
    };

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
        loadSalesStatistics(selectedPeriod);
    }, [selectedPeriod]);

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
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold uppercase tracking-wider">Admin Dashboard</h1>
                    
                    {/* Period Filter */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium uppercase tracking-wide text-gray-600">Period:</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="current">This Month</option>
                            <option value="last">Last Month</option>
                        </select>
                    </div>
                </div>

                {/* Sales Statistics */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">Sales Statistics</h2>
                    {salesLoading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading sales data...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600 mb-2">Total Revenue</h3>
                                <p className="text-3xl font-light text-green-600">${(salesStats.total_revenue || 0).toFixed(2)}</p>
                                <p className={`text-sm mt-1 ${(salesStats.revenue_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(salesStats.revenue_growth || 0) >= 0 ? '+' : ''}{salesStats.revenue_growth || 0}% vs last period
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600 mb-2">Orders</h3>
                                <p className="text-3xl font-light text-blue-600">{salesStats.total_orders || 0}</p>
                                <p className={`text-sm mt-1 ${(salesStats.orders_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(salesStats.orders_growth || 0) >= 0 ? '+' : ''}{salesStats.orders_growth || 0}% vs last period
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600 mb-2">Shipping Revenue</h3>
                                <p className="text-3xl font-light text-purple-600">${(salesStats.total_shipping || 0).toFixed(2)}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600 mb-2">Avg Order Value</h3>
                                <p className="text-3xl font-light text-orange-600">${(salesStats.average_order_value || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* General Stats Grid */}
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

