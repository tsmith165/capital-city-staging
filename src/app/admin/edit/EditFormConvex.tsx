'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputTextArea from '@/components/inputs/InputTextArea';

const MAX_CHANGE_DISPLAY_LENGTH = 30;

interface EditFormConvexProps {
    inventoryData: any;
    onUpdate?: () => void;
}

interface SubmitFormData {
    inventory_id: string;
    inventory_name: string;
    description: string;
    category: string;
    vendor: string;
    price: string;
    cost: string;
    real_width: string;
    real_height: string;
    real_depth: string;
    location: string;
    count: string;
    image_path: string;
    width: string;
    height: string;
}

const EditFormConvex: React.FC<EditFormConvexProps> = ({ inventoryData, onUpdate }) => {
    const updateInventory = useMutation(api.inventory.updateInventory);
    
    const [initialFormData, setInitialFormData] = useState<SubmitFormData>({
        inventory_id: inventoryData._id,
        inventory_name: inventoryData.name,
        description: inventoryData.description || '',
        category: inventoryData.category || '',
        vendor: inventoryData.vendor || '',
        price: inventoryData.price?.toString() || '',
        cost: inventoryData.cost?.toString() || '',
        real_width: inventoryData.realWidth?.toString() || '',
        real_height: inventoryData.realHeight?.toString() || '',
        real_depth: inventoryData.realDepth?.toString() || '',
        location: inventoryData.location || '',
        count: inventoryData.count?.toString() || '',
        image_path: inventoryData.imagePath || '',
        width: inventoryData.width?.toString() || '',
        height: inventoryData.height?.toString() || '',
    });

    const [formData, setFormData] = useState<SubmitFormData>(initialFormData);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [changes, setChanges] = useState<{ field: string; oldValue: string; newValue: string }[]>([]);
    const [submittedChanges, setSubmittedChanges] = useState<{ field: string; oldValue: string; newValue: string }[]>([]);

    useEffect(() => {
        const newInitialFormData = {
            inventory_id: inventoryData._id,
            inventory_name: inventoryData.name,
            description: inventoryData.description || '',
            category: inventoryData.category || '',
            vendor: inventoryData.vendor || '',
            price: inventoryData.price?.toString() || '',
            cost: inventoryData.cost?.toString() || '',
            real_width: inventoryData.realWidth?.toString() || '',
            real_height: inventoryData.realHeight?.toString() || '',
            real_depth: inventoryData.realDepth?.toString() || '',
            location: inventoryData.location || '',
            count: inventoryData.count?.toString() || '',
            image_path: inventoryData.imagePath || '',
            width: inventoryData.width?.toString() || '',
            height: inventoryData.height?.toString() || '',
        };
        setInitialFormData(newInitialFormData);
        setFormData(newInitialFormData);
        setChanges([]);
    }, [inventoryData]);

    const getChanges = (newData: SubmitFormData) => {
        const changesArray: { field: string; oldValue: string; newValue: string }[] = [];
        Object.keys(newData).forEach((key) => {
            const typedKey = key as keyof SubmitFormData;
            if (newData[typedKey] !== initialFormData[typedKey]) {
                changesArray.push({
                    field: key,
                    oldValue: String(initialFormData[typedKey]),
                    newValue: String(newData[typedKey]),
                });
            }
        });
        return changesArray;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const newData = { ...prevData, [name]: value };
            setChanges(getChanges(newData));
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmittedChanges([]);
        setSubmitMessage(null);
        console.log('Form Data (Next Line):');
        console.log(formData);
        
        try {
            await updateInventory({
                id: inventoryData._id,
                updates: {
                    name: formData.inventory_name,
                    price: parseInt(formData.price) || 0,
                    cost: parseInt(formData.cost) || 0,
                    vendor: formData.vendor,
                    category: formData.category,
                    description: formData.description,
                    count: parseInt(formData.count) || 0,
                    location: formData.location,
                    realWidth: parseInt(formData.real_width) || 0,
                    realHeight: parseInt(formData.real_height) || 0,
                    realDepth: parseInt(formData.real_depth) || 0,
                    width: parseInt(formData.width) || 0,
                    height: parseInt(formData.height) || 0,
                    imagePath: formData.image_path,
                }
            });
            
            setSubmitMessage({ type: 'success', text: 'Changes submitted successfully!' });
            setSubmittedChanges(changes);
            setInitialFormData(formData); // Update initial data after successful submission
            setChanges([]); // Clear pending changes
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating inventory:', error);
            setSubmitMessage({ type: 'error', text: 'An unexpected error occurred.' });
        }
    };

    const truncateChange = (value: string) => {
        return value.length > MAX_CHANGE_DISPLAY_LENGTH ? value.substring(0, MAX_CHANGE_DISPLAY_LENGTH) + '...' : value;
    };

    return (
        <div className="flex h-fit w-full p-2">
            <form onSubmit={handleSubmit} className="flex w-full flex-col space-y-2">
                {/* Row 2.) Category Select */}
                <div className="flex h-fit w-full">
                    <InputSelect
                        idName="category"
                        name="Category"
                        value={formData.category}
                        onChange={handleChange}
                        select_options={[
                            ['Couch', 'Couch'],
                            ['Table', 'Table'],
                            ['Chair', 'Chair'],
                            ['Bedroom', 'Bedroom'],
                            ['Bathroom', 'Bathroom'],
                            ['Kitchen', 'Kitchen'],
                            ['Pillow', 'Pillow'],
                            ['Bookcase', 'Bookcase'],
                            ['Book', 'Book'],
                            ['Lamp', 'Lamp'],
                            ['Art', 'Art'],
                            ['Decor', 'Decor'],
                            ['Bench', 'Bench'],
                            ['Barstool', 'Barstool'],
                            ['Rug', 'Rug'],
                            ['Plant', 'Plant'],
                            ['Desk', 'Desk'],
                            ['Other', 'Other'],
                        ]}
                    />
                </div>

                {/* Row 3.) Vendor Textbox */}
                <div className="flex h-fit w-full">
                    <InputTextbox idName="vendor" name="Vendor" value={formData.vendor} onChange={handleChange} />
                </div>

                {/* Row 4.) Price / Cost Text Box */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <div className="w-full md:w-1/2">
                        <InputTextbox idName="price" name="Price" value={formData.price} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <InputTextbox idName="cost" name="Cost" value={formData.cost} onChange={handleChange} />
                    </div>
                </div>

                {/* Row 8.) Width / Height Text Box */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <div className="w-full md:w-1/2">
                        <InputTextbox idName="width" name="Width (px)" value={formData.width} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <InputTextbox idName="height" name="Height (PX)" value={formData.height} onChange={handleChange} />
                    </div>
                </div>

                {/* Row 5.) Real Width / Height / Depth Text Boxes */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <div className="w-full md:w-1/3">
                        <InputTextbox idName="real_width" name="Width (in)" value={formData.real_width} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/3">
                        <InputTextbox idName="real_height" name="Height (in)" value={formData.real_height} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/3">
                        <InputTextbox idName="real_depth" name="Depth (in)" value={formData.real_depth} onChange={handleChange} />
                    </div>
                </div>

                {/* Row 6.) Location Textbox */}
                <div className="flex h-fit w-full">
                    <InputTextbox idName="location" name="Location" value={formData.location} onChange={handleChange} />
                </div>

                {/* Row 7.) Count Textbox */}
                <div className="flex h-fit w-full">
                    <InputTextbox idName="count" name="Count" value={formData.count} onChange={handleChange} />
                </div>

                {/* Row 9.) Description Text Area */}
                <div className="flex h-fit w-full">
                    <InputTextArea idName="description" name="Description" value={formData.description} rows={5} onChange={handleChange} />
                </div>

                <div className="flex flex-row items-center space-x-2">
                    <button
                        type="submit"
                        className={
                            'rounded-md bg-secondary px-3 py-1 text-center font-bold text-stone-400 ' +
                            'hover:bg-primary hover:text-secondary_dark'
                        }
                    >
                        Submit Changes
                    </button>
                    <Link
                        href="/admin/edit/new"
                        className={
                            'rounded-md bg-secondary px-3 py-1 text-center font-bold text-stone-400 ' +
                            ' hover:bg-primary hover:text-secondary_dark'
                        }
                    >
                        Create New Inventory
                    </Link>
                </div>

                {changes.length > 0 && (
                    <div className="mt-2 rounded-md bg-yellow-100 p-2 text-yellow-800">
                        <p className="font-semibold">Pending Changes:</p>
                        <ul>
                            {changes.map((change, index) => (
                                <li key={index} className="text-sm">
                                    <span className="font-semibold">{change.field}:</span>{' '}
                                    <span className="line-through">{truncateChange(change.oldValue)}</span> →{' '}
                                    <span>{truncateChange(change.newValue)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {submittedChanges.length > 0 && (
                    <div className="mt-2 rounded-md bg-green-100 p-2 text-green-800">
                        <p className="font-semibold">Last Submitted Changes:</p>
                        <ul>
                            {submittedChanges.map((change, index) => (
                                <li key={index} className="text-sm">
                                    <span className="font-semibold">{change.field}:</span>{' '}
                                    <span className="line-through">{truncateChange(change.oldValue)}</span> →{' '}
                                    <span>{truncateChange(change.newValue)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {submitMessage && (
                    <div className={`mt-2 rounded-md p-2 ${submitMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {submitMessage.text}
                    </div>
                )}
            </form>
        </div>
    );
};

export default EditFormConvex;