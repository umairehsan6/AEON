import React from 'react';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  ChevronRight,
  Tag,
  BarChart2,
  Users,
  MapPin,
  Hash,
} from 'lucide-react';

/**
 * Reusable Metric Card component for the dashboard.
 */
const MetricCard = ({ title, value, icon: Icon, change }) => (
  <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100 transition duration-300 hover:shadow-xl">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{title}</p>
        <h2 className="text-3xl font-black text-gray-900 mt-2">{value}</h2>
      </div>
      <div className="p-3 rounded-full bg-gray-900 text-white">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm font-medium">
      <span className={`flex items-center ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
        <TrendingUp className="w-4 h-4 mr-1" />
        {change}
      </span>
      <span className="ml-2 text-gray-500">since last month</span>
    </div>
  </div>
);

/**
 * Mock Line Chart Component (for Monthly Sales & Traffic)
 */
const MockLineChart = () => (
    <svg viewBox="0 0 300 150" className="w-full h-full text-gray-900">
        {/* Y-Axis Grid Lines (Mock) */}
        <line x1="20" y1="130" x2="280" y2="130" stroke="#f3f4f6" strokeWidth="1" />
        <line x1="20" y1="90" x2="280" y2="90" stroke="#f3f4f6" strokeWidth="1" />
        <line x1="20" y1="50" x2="280" y2="50" stroke="#f3f4f6" strokeWidth="1" />
        <line x1="20" y1="10" x2="280" y2="10" stroke="#f3f4f6" strokeWidth="1" />

        {/* X-Axis */}
        <line x1="20" y1="130" x2="280" y2="130" stroke="#1f2937" strokeWidth="2" />

        {/* Data Line */}
        <polyline 
            points="20,100 70,60 120,80 170,40 220,70 270,20" 
            fill="none" 
            stroke="#1f2937" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        
        {/* Mock Data Points */}
        <circle cx="20" cy="100" r="3" fill="#1f2937" />
        <circle cx="70" cy="60" r="3" fill="#1f2937" />
        <circle cx="120" cy="80" r="3" fill="#1f2937" />
        <circle cx="170" cy="40" r="3" fill="#1f2937" />
        <circle cx="220" cy="70" r="3" fill="#1f2937" />
        <circle cx="270" cy="20" r="3" fill="#1f2937" />
    </svg>
);

/**
 * Mock Bar Chart Component (for Order Fulfillment Cycle Time)
 */
const MockBarChart = () => (
    <svg viewBox="0 0 300 150" className="w-full h-full text-gray-900">
        {/* X-Axis */}
        <line x1="20" y1="130" x2="280" y2="130" stroke="#1f2937" strokeWidth="2" />

        {/* Bars */}
        <rect x="30" y="80" width="30" height="50" fill="#1f2937" rx="3" />
        <rect x="70" y="50" width="30" height="80" fill="#1f2937" rx="3" />
        <rect x="110" y="100" width="30" height="30" fill="#1f2937" rx="3" />
        <rect x="150" y="30" width="30" height="100" fill="#1f2937" rx="3" />
        <rect x="190" y="70" width="30" height="60" fill="#1f2937" rx="3" />
        <rect x="230" y="95" width="30" height="35" fill="#1f2937" rx="3" />
    </svg>
);

/**
 * Component for a generic chart container.
 */
const ChartContainer = ({ title, children }) => (
    <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100 h-96 flex flex-col">
        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest">{title}</h3>
        <div className="flex-1 flex items-end justify-center pb-4">
            {children}
        </div>
    </div>
);

/**
 * Component for displaying customer demographic insights.
 */
const CustomerDemographics = () => (
    <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100 h-full">
        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest">Most Ordered Customer Profile</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Age Distribution */}
            <div className="flex flex-col items-start p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
                <Hash className="w-6 h-6 text-gray-900 mb-2" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Age Group</p>
                <div className="text-2xl font-black text-gray-900 mt-1">25 - 34</div>
                <p className="text-sm text-gray-400">45% of orders</p>
            </div>
            
            {/* Gender Distribution */}
            <div className="flex flex-col items-start p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
                <Users className="w-6 h-6 text-gray-900 mb-2" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Gender</p>
                <div className="text-2xl font-black text-gray-900 mt-1">Female</div>
                <p className="text-sm text-gray-400">62% of revenue</p>
            </div>
            
            {/* Top Area/Region */}
            <div className="flex flex-col items-start p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
                <MapPin className="w-6 h-6 text-gray-900 mb-2" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Top Region</p>
                <div className="text-2xl font-black text-gray-900 mt-1">New York, US</div>
                <p className="text-sm text-gray-400">Highest volume</p>
            </div>
        </div>
    </div>
);

/**
 * Component for displaying recent order activity in a list format.
 */
const RecentActivity = () => {
  const activities = [
    { id: '#89201', time: '5 mins ago', description: 'New Order placed for "Essential White Tee"', status: 'Processing' },
    { id: '#89200', time: '1 hour ago', description: 'Shipped Order to Customer ID 4321', status: 'Shipped' },
    { id: '#89199', time: '3 hours ago', description: 'Restock Alert: Black Jeans low stock', status: 'Alert' },
    { id: '#89198', time: 'Yesterday', description: 'Return initiated for "Leather Blazer"', status: 'Return' },
  ];

  // Helper to determine status color
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-green-100 text-green-800';
      case 'Alert':
        return 'bg-red-100 text-red-800';
      case 'Return':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
      <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-4" />
              <div>
                <p className="font-semibold text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-500 mt-0.5">{activity.id} &middot; {activity.time}</p>
              </div>
            </div>
            <div className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(activity.status)}`}>
              {activity.status}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <div className="inline-flex items-center text-sm font-medium text-gray-900 cursor-pointer hover:text-gray-700 transition duration-150">
          View All Logs
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  );
};


/**
 * AEON Dashboard Page Component (Pure Static UI)
 * This component provides a clean overview of key metrics and activities.
 */
export const DashboardPage = () => {
  return (
    // Main container for the dashboard content
    <div className="flex-1 p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-wider uppercase">
          AEON DASHBOARD
        </h1>
        <p className="text-gray-500 mt-2">
          Overview of key performance indicators for AEON Global.
        </p>
      </header>
      
      {/* 1. Primary Metrics Grid (Consolidated Single Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Total Revenue" 
          value="$125,890" 
          icon={DollarSign} 
          change="+12.5%" 
        />
        <MetricCard 
          title="New Orders" 
          value="452" 
          icon={ShoppingCart} 
          change="+8.1%" 
        />
        <MetricCard 
          title="Active SKUs" 
          value="1,854" 
          icon={Package} 
          change="+1.2%" 
        />
        <MetricCard 
          title="Inventory Value" 
          value="$5.2M" 
          icon={Tag} 
          change="-0.5%" 
        />
      </div>
      
      {/* 2. Visual Analytics (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartContainer title="Monthly Sales & Traffic">
            <MockLineChart />
        </ChartContainer>
        <ChartContainer title="Order Fulfillment Cycle Time">
            <MockBarChart />
        </ChartContainer>
      </div>

      {/* 3. Operational Insights (Demographics & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Demographics (Takes 2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <CustomerDemographics />
        </div>
        
        {/* Recent Activity List (Takes 1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
