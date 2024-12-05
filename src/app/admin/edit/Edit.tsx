'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { MdPageview } from 'react-icons/md';
import { useQueryState } from 'nuqs';
import EditForm from './EditForm';
import InventoryOrderPanel from './InventoryOrderPanel';
import { handleTitleUpdate } from './actions';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { idParser } from './parsers';
import { useRouter } from 'next/navigation';
import { preloadImage } from '@/utils/imageUtils';

interface EditProps {
    inventoryDataPromise: Promise<any>;
    current_id: number;
    nextInventoryPromise: Promise<any>;
    lastInventoryPromise: Promise<any>;
}

const Edit: React.FC<EditProps> = ({ inventoryDataPromise, current_id, nextInventoryPromise, lastInventoryPromise }) => {
    const router = useRouter();
    const [id, setId] = useQueryState('id', idParser);
    const [inventoryData, setInventoryData] = useState<any>(null);
    const [nextInventory, setNextInventory] = useState<any>(null);
    const [lastInventory, setLastInventory] = useState<any>(null);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [titleInput, setTitleInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [currentData, nextData, lastData] = await Promise.all([
                    inventoryDataPromise,
                    nextInventoryPromise,
                    lastInventoryPromise,
                ]);

                setInventoryData(currentData);
                setNextInventory(nextData);
                setLastInventory(lastData);
                setTitleInput(currentData.name || '');

                if (nextData?.image_path) {
                    preloadImage(nextData.image_path);
                }
                if (lastData?.image_path) {
                    preloadImage(lastData.image_path);
                }

                console.log(`LOADING EDIT DETAILS PAGE - Inventory ID: ${current_id}`);
            } catch (error) {
                console.error('Error fetching inventory data:', error);
                setSubmitMessage({ type: 'error', text: 'Failed to load inventory data.' });
            }
        };

        fetchData();
    }, [inventoryDataPromise, nextInventoryPromise, lastInventoryPromise, current_id]);

    const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleInput(e.target.value);
    };

    const handleTitleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitMessage(null);
        try {
            const formData = new FormData();
            formData.append('inventoryId', current_id.toString());
            formData.append('newTitle', titleInput);

            const result = await handleTitleUpdate(formData);
            if (result.success) {
                setSubmitMessage({ type: 'success', text: 'Title updated successfully!' });
                const updatedData = await inventoryDataPromise;
                setInventoryData(updatedData);
            } else {
                setSubmitMessage({ type: 'error', text: result.error || 'An error occurred while updating the title.' });
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', text: 'An unexpected error occurred.' });
        }
    };

    const handleNavigate = async (direction: 'next' | 'last') => {
        const newData = direction === 'next' ? nextInventory : lastInventory;
        if (!newData) return;

        setInventoryData(newData);
        setTitleInput(newData.name || '');

        await setId(newData.id.toString());

        router.push(`/admin/edit?id=${newData.id}`, { scroll: false });
    };

    if (!inventoryData) {
        return <LoadingSpinner page="Edit Details" />;
    }

    const next_id = inventoryData?.next_id ?? -1;
    const last_id = inventoryData?.last_id ?? -1;

    return (
        <div className="flex h-full w-full flex-col bg-stone-800 md:flex-row">
            <div className="flex h-1/3 items-center justify-center rounded-lg p-8 md:h-[calc(100dvh-50px)] md:w-2/5 lg:w-1/2">
                <Image
                    src={inventoryData.image_path}
                    alt={inventoryData.name}
                    width={inventoryData.width}
                    height={inventoryData.height}
                    quality={100}
                    className="h-fit max-h-full w-auto rounded-lg object-contain"
                />
            </div>
            <div className="h-2/3 overflow-y-auto md:h-full md:w-3/5 lg:w-1/2">
                <div className="flex h-fit flex-row items-center space-x-2 p-2">
                    <div className="flex h-[48px] flex-col space-y-1">
                        <button
                            onClick={() => handleNavigate('next')}
                            disabled={!nextInventory}
                            className="h-[22px] w-8 cursor-pointer rounded-lg bg-secondary hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <IoIosArrowUp className="h-full w-full fill-stone-400 hover:fill-secondary_dark" />
                        </button>
                        <button
                            onClick={() => handleNavigate('last')}
                            disabled={!lastInventory}
                            className="h-[22px] w-8 cursor-pointer rounded-lg bg-secondary hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <IoIosArrowDown className="h-full w-full fill-stone-400 hover:fill-secondary_dark" />
                        </button>
                    </div>
                    <Link href={`/admin/inventory/?item=${current_id}`}>
                        <MdPageview className="h-[48px] w-[48px] cursor-pointer rounded-lg bg-secondary fill-stone-400 p-1 hover:bg-primary hover:fill-secondary_dark" />
                    </Link>
                    <form onSubmit={handleTitleUpdateSubmit} className="flex w-full flex-grow flex-row rounded-lg bg-secondary_dark">
                        <input
                            type="text"
                            name="newTitle"
                            value={titleInput}
                            onChange={handleTitleInputChange}
                            className="m-0 flex w-full flex-grow rounded-lg border-none bg-secondary_dark px-3 py-1 text-2xl font-bold text-stone-400 outline-none"
                        />
                        <button
                            type="submit"
                            className="ml-2 rounded-md bg-secondary px-3 py-1 font-bold text-stone-400 hover:bg-primary_dark hover:text-secondary_dark"
                        >
                            Save
                        </button>
                    </form>
                </div>
                {submitMessage && (
                    <div className={`mt-2 rounded-md p-2 ${submitMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {submitMessage.text}
                    </div>
                )}
                <EditForm current_inventory={inventoryData} />
                <InventoryOrderPanel current_inventory={inventoryData} />
            </div>
        </div>
    );
};

export default Edit;
