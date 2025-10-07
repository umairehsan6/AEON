import React, { useState, useMemo } from 'react';
import getCollections from '../services/collection';

// --- MOCK DATA ---
const COLLECTIONS = getCollections();

// --- The root component for the application ---
const Collection = () => {
    // 1. Core State (Now local)
    const [collections, setCollections] = useState(COLLECTIONS);
    const [modalOpen, setModalOpen] = useState(false);
    
    // 2. Navigation State: 'list' (default) or 'addProducts' (when navigating)
    const [view, setView] = useState('list');
    const [selectedCollection, setSelectedCollection] = useState(null);

    // --- Utility Function (Mock Backend ID generation) ---
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

    // --- Handlers (Now local state manipulation) ---

    // 1. CREATE COLLECTION (Local State Update)
    const handleCreateCollection = (collectionName) => {
        if (!collectionName.trim()) return;

        const newCollection = {
            id: generateId(),
            name: collectionName.trim(),
            isLive: false,
            createdAt: new Date(),
        };

        // Add new collection to the front of the list
        setCollections(prev => [newCollection, ...prev]);
        setModalOpen(false);
    };

    // 2. TOGGLE LIVE STATUS (Local State Update)
    const handleToggleLive = (collectionId, currentStatus) => {
        // Update the isLive status in the local collections array
        setCollections(prev => prev.map(collection => 
            collection.id === collectionId ? { ...collection, isLive: !currentStatus } : collection
        ));
    };

    // 3. NAVIGATE TO ADD PRODUCTS PAGE
    const handleAddProductsClick = (collection) => {
        setSelectedCollection(collection);
        setView('addProducts');
    };

    // --- UI Components ---

    // B. Modal for Creating a Collection
    const CreationModal = () => {
        const [name, setName] = useState('');

        const handleSubmit = (e) => {
            e.preventDefault();
            if (name.trim()) {
                handleCreateCollection(name);
            }
        };

        if (!modalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 w-full max-w-md shadow-2xl rounded-lg">
                    <h2 className="text-2xl font-light mb-6 tracking-widest uppercase border-b pb-2">
                        New Collection
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="collectionName" className="block text-xs font-medium uppercase tracking-widest mb-2">
                                Collection Name
                            </label>
                            <input
                                id="collectionName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border-b border-black py-2 focus:outline-none focus:border-gray-500 text-sm tracking-wider"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-6 py-2 text-sm uppercase tracking-widest border border-black hover:bg-gray-100 transition duration-150 rounded-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 text-sm uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition duration-150 rounded-sm"
                                disabled={!name.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // C. Individual Collection Card Component
    const CollectionCard = useMemo(() => ({ collection }) => {
        // Use translate-x-6 to correctly position the w-5 thumb inside the w-12 button with p-0.5 padding.
        const positionClass = collection.isLive ? 'translate-x-6' : 'translate-x-0'; 
        const statusText = collection.isLive ? 'LIVE' : 'DRAFT';
        const statusColor = collection.isLive ? 'text-green-600' : 'text-gray-500';

        return (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                <div className="flex-1 min-w-0 mb-4 md:mb-0">
                    <h3 className="text-xl md:text-2xl font-light tracking-wider uppercase truncate max-w-full">
                        {collection.name}
                    </h3>
                    <p className={`text-xs font-semibold ${statusColor} tracking-widest mt-1`}>
                        {statusText}
                    </p>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Toggle Switch */}
                    <div className="flex items-center space-x-3">
                        <span className="text-xs uppercase tracking-widest font-medium text-gray-700">Live Status</span>
                        <button
                            onClick={() => handleToggleLive(collection.id, collection.isLive)}
                            className="w-12 h-6 flex items-center rounded-full transition-colors duration-300 focus:outline-none p-0.5"
                            style={{ backgroundColor: collection.isLive ? '#000' : '#d1d5db' }}
                            aria-checked={collection.isLive}
                            role="switch"
                        >
                            <span
                                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition duration-300 ease-in-out ${positionClass}`}
                            ></span>
                        </button>
                    </div>

                    {/* Add Products Button */}
                    <button
                        onClick={() => handleAddProductsClick(collection)}
                        className="px-4 py-2 text-sm uppercase tracking-widest border border-black text-black hover:bg-black hover:text-white transition duration-200 min-w-[150px] rounded-sm"
                    >
                        Add Products
                    </button>
                </div>
            </div>
        );
    }, [handleToggleLive, handleAddProductsClick]);


    // D. Main Collections List View
    const CollectionListView = () => (
        <div className="p-4 pt-10 md:p-10 max-w-7xl mx-auto">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-8 pt-4">
                <h2 className="text-3xl font-light tracking-widest uppercase">
                    All Collections
                </h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-3 text-sm uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition duration-150 rounded-sm shadow-md"
                >
                    + Create Collection
                </button>
            </div>

            {/* List Body */}
            <div className="mt-4">
                {collections.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-xl font-light tracking-wider text-gray-600">
                            No collections found. Start by creating one!
                        </p>
                    </div>
                ) : (
                    collections
                        // Sorting is now handled on collection creation/update (no need for complex in-memory sorting of Firestore timestamps)
                        .map(collection => (
                            <CollectionCard key={collection.id} collection={collection} />
                        ))
                )}
            </div>
            
            <p className="text-xs text-center text-gray-400 mt-10">
                User ID: MOCK_USER_ID (Frontend Only)
            </p>
        </div>
    );

    // E. Simulated Add Products View
    const AddProductsView = () => (
        <div className="p-4 pt-10 md:p-10 max-w-7xl mx-auto">
            <button
                onClick={() => setView('list')}
                className="mb-8 flex items-center space-x-2 text-sm uppercase tracking-widest text-black hover:text-gray-700 transition duration-150"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Back to Collections</span>
            </button>
            
            <h2 className="text-3xl font-light tracking-widest uppercase border-b pb-4 mb-8">
                Adding Products to: <span className="font-semibold">{selectedCollection.name}</span>
            </h2>

            {/* Simulated Content Area */}
            <div className="py-10 bg-gray-50 p-6 rounded-lg text-center border">
                <p className="text-lg text-gray-700 mb-4 tracking-wider">
                    This is the dedicated product assignment page for the **{selectedCollection.name}** collection.
                </p>
                <p className="text-sm text-gray-500">
                    You can integrate your backend API calls here to select, upload, and link products to this collection.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Current Live Status: <span className={`font-bold ${selectedCollection.isLive ? 'text-green-600' : 'text-red-500'}`}>{selectedCollection.isLive ? 'LIVE' : 'DRAFT'}</span>
                </p>
            </div>

            {/* Save Button Container */}
            <div className="flex justify-end mt-8">
                <button
                    // Placeholder for future API call
                    onClick={() => {
                        console.log('--- API CALL SIMULATED ---');
                        console.log('Collection:', selectedCollection.name);
                        console.log('Data to be sent to backend for saving products.');
                        // Add API call to your backend here
                    }}
                    className="px-8 py-3 text-sm uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition duration-150 rounded-sm shadow-md"
                >
                    Save Products
                </button>
            </div>
        </div>
    );


    // --- Main Render Logic ---
    return (
        <div className="min-h-screen bg-white font-['Inter',_sans-serif]">
            <CreationModal />
            
            {view === 'list' ? <CollectionListView /> : <AddProductsView />}

        </div>
    );
};

export default Collection;
