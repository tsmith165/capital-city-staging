'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface EditFormConvexProps {
    inventoryData: any;
    onUpdate?: () => void;
}

const EditFormConvex: React.FC<EditFormConvexProps> = ({ inventoryData, onUpdate }) => {
    const updateInventory = useMutation(api.inventory.updateInventory);
    const deleteInventory = useMutation(api.inventory.deleteInventory);
    
    const [formData, setFormData] = useState({
        name: inventoryData.name,
        price: inventoryData.price,
        cost: inventoryData.cost || 0,
        vendor: inventoryData.vendor,
        category: inventoryData.category,
        description: inventoryData.description,
        count: inventoryData.count,
        location: inventoryData.location,
        realWidth: inventoryData.realWidth,
        realHeight: inventoryData.realHeight,
        realDepth: inventoryData.realDepth,
        active: inventoryData.active,
    });
    
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' 
                ? (e.target as HTMLInputElement).checked 
                : type === 'number' 
                    ? Number(value) 
                    : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await updateInventory({
                id: inventoryData._id,
                updates: formData
            });
            
            setSubmitMessage({ type: 'success', text: 'Inventory updated successfully!' });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating inventory:', error);
            setSubmitMessage({ type: 'error', text: 'Failed to update inventory' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitMessage(null), 3000);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        try {
            await deleteInventory({ id: inventoryData._id });
            // Redirect to inventory page after deletion
            window.location.href = '/admin/inventory';
        } catch (error: any) {
            alert(error.message || 'Failed to delete item');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold">Edit Inventory Item</h2>
            
            {submitMessage && (
                <div className={`rounded p-3 ${
                    submitMessage.type === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    {submitMessage.text}
                </div>
            )}

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                />
            </div>

            {/* Price and Cost */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cost ($)</label>
                    <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                </div>
            </div>

            {/* Vendor and Category */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vendor</label>
                    <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
            </div>

            {/* Count and Location */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Count</label>
                    <input
                        type="number"
                        name="count"
                        value={formData.count}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                    />
                </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Width (inches)</label>
                    <input
                        type="number"
                        name="realWidth"
                        value={formData.realWidth}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Height (inches)</label>
                    <input
                        type="number"
                        name="realHeight"
                        value={formData.realHeight}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Depth (inches)</label>
                    <input
                        type="number"
                        name="realDepth"
                        value={formData.realDepth}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                    />
                </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    name="active"
                    id="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Active
                </label>
            </div>

            {/* Metadata */}
            <div className="rounded bg-gray-50 p-3 text-sm text-gray-600">
                <p>Original ID: {inventoryData.oId}</p>
                <p>In Use: {inventoryData.inUse} of {formData.count}</p>
                <p>Created: {new Date(inventoryData.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(inventoryData.updatedAt).toLocaleDateString()}</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={inventoryData.inUse > 0}
                    className={`rounded px-4 py-2 text-white ${
                        inventoryData.inUse > 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {inventoryData.inUse > 0 ? 'Cannot Delete (In Use)' : 'Delete'}
                </button>
                
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded bg-primary px-6 py-2 text-white transition-colors hover:bg-primary_dark disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default EditFormConvex;