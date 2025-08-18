'use client';

export default function ManageConvex() {
    return (
        <div className="container mx-auto max-w-7xl p-6">
            <h1 className="text-3xl font-bold text-stone-100 mb-6">Inventory Management</h1>
            
            <div className="rounded-lg bg-stone-800 p-6">
                <h2 className="text-xl font-semibold text-stone-100 mb-4">Advanced Management Features</h2>
                <p className="text-stone-400 mb-6">
                    Advanced inventory management features like ordering, priority settings, and bulk operations 
                    are now available through the main inventory page and individual item edit pages.
                </p>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-stone-700 rounded">
                        <div>
                            <h3 className="text-stone-100 font-medium">View & Edit Inventory</h3>
                            <p className="text-stone-400 text-sm">Browse, search, and edit individual inventory items</p>
                        </div>
                        <a 
                            href="/admin/inventory" 
                            className="rounded bg-primary px-4 py-2 text-white hover:bg-primary_dark transition-colors"
                        >
                            Go to Inventory
                        </a>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-stone-700 rounded">
                        <div>
                            <h3 className="text-stone-100 font-medium">Add New Items</h3>
                            <p className="text-stone-400 text-sm">Create new inventory items with images</p>
                        </div>
                        <a 
                            href="/admin/inventory/new" 
                            className="rounded bg-secondary px-4 py-2 text-white hover:bg-secondary_dark transition-colors"
                        >
                            Add New Item
                        </a>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-stone-700 rounded">
                        <div>
                            <h3 className="text-stone-100 font-medium">Admin Tools</h3>
                            <p className="text-stone-400 text-sm">Access backup and verification tools</p>
                        </div>
                        <a 
                            href="/admin/tools" 
                            className="rounded bg-stone-600 px-4 py-2 text-white hover:bg-stone-500 transition-colors"
                        >
                            View Tools
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}