'use client';

import React from 'react';
import Link from 'next/link';

import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputTextArea from '@/components/inputs/InputTextArea';

import { onSubmitEditForm } from '../actions';

interface EditFormProps {
    current_inventory: any;
}

const EditForm: React.FC<EditFormProps> = ({ current_inventory }) => {
    const [formData, setFormData] = React.useState({
        ...current_inventory,
        inventory_id: current_inventory.id,
        inventory_name: current_inventory.name,
        image_path: current_inventory.image_path,
        extra_images: current_inventory.extra_images,
        extra_images_count: current_inventory.extra_images?.length.toString(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData: typeof formData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form Data (Next Line):');
        console.log(formData);
        await onSubmitEditForm(formData);
    };

    return (
        <div className="flex h-fit w-full p-2">
            <form onSubmit={handleSubmit} className="flex w-full flex-col space-y-2">
                {/* Row 2.) Category Select */}
                <div className="flex h-fit w-full">
                    <InputSelect
                        idName='category'
                        name="Category"
                        value={formData.category}
                        onChange={handleChange}
                        select_options={[
                            ['Couch', 'Couch'],
                            ['Table', 'Table'],
                            ['Chair', 'Chair'],
                            ['Bed', 'Bed'],
                            ['Other', 'Other'],
                        ]}
                    />
                </div>

                {/* Row 3.) Vendor Textbox */}
                <div className="flex h-fit w-full">
                    <InputTextbox idName="vendor" name="Vendor" value={formData.vendor} onChange={handleChange} />
                </div>

                {/* Row 4.) Price Textbox */}
                <div className="flex h-fit w-full">
                    <InputTextbox idName="price" name="Price" value={formData.price.toString()} onChange={handleChange} />
                </div>

                {/* Row 5.) Real Width / Height / Depth Text Boxes */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <div className="w-full md:w-1/3">
                        <InputTextbox
                            idName="real_width"
                            name="Width (in)"
                            value={formData.real_width.toString()}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <InputTextbox
                            idName="real_height"
                            name="Height (in)"
                            value={formData.real_height.toString()}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <InputTextbox
                            idName="real_depth"
                            name="Depth (in)"
                            value={formData.real_depth.toString()}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Row 6.) Location Textbox */}
                <div className="flex h-fit w-full">
                    <InputTextbox idName="location" name="Location" value={formData.location} onChange={handleChange} />
                </div>

                {/* Row 7.) Count Textbox */}
                <div className="flex h-fit w-full">
                    <InputTextbox idName="count" name="Count" value={formData.count.toString()} onChange={handleChange} />
                </div>

                {/* Row 8.) Width / Height Text Box */}
                <div className="flex h-fit w-full flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <div className="w-full md:w-1/2">
                        <InputTextbox idName="width" name="Width (px)" value={formData.width.toString()} onChange={handleChange} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <InputTextbox idName="height" name="Height (PX)" value={formData.height.toString()} onChange={handleChange} />
                    </div>
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
                    <Link
                        href={`/admin/edit/images/${formData.id}`}
                        className={
                            'rounded-md bg-secondary px-3 py-1 text-center font-bold text-stone-400 ' +
                            'hover:bg-primary hover:text-secondary_dark'
                        }
                    >
                        Edit Images
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EditForm;