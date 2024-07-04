'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { MdPageview } from 'react-icons/md';
import EditForm from './EditForm';
import InventoryOrderPanel from './InventoryOrderPanel';
import { handleTitleUpdate } from '../actions';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

interface EditProps {
    inventoryDataPromise: Promise<any>;
    current_id: number;
}

const Edit: React.FC<EditProps> = ({ inventoryDataPromise, current_id }) => {
    const [inventoryData, setInventoryData] = useState<any>(null);

    useEffect(() => {
        inventoryDataPromise.then((data) => {
            setInventoryData(data);
        });
    }, [inventoryDataPromise]);

    const next_id = inventoryData?.next_id ?? -1;
    const last_id = inventoryData?.last_id ?? -1;
    const inventory_name = inventoryData?.name ?? '';
    const price = inventoryData?.price ?? '';

    console.log(`LOADING EDIT DETAILS PAGE - Inventory ID: ${current_id}`);

    return (
        <div className="flex h-full w-full flex-col md:flex-row">
            <div className="h-1/3 bg-secondary_dark md:h-full md:w-2/5 lg:w-1/2">
                {inventoryData ? (
                    <Image
                        src={inventoryData.image_path}
                        alt={inventoryData.name}
                        width={inventoryData.width}
                        height={inventoryData.height}
                        quality={100}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <LoadingSpinner page="Edit Details" />
                )}
            </div>
            <div className="h-2/3 overflow-y-auto bg-secondary md:h-full md:w-3/5 lg:w-1/2">
                <div className="flex h-fit flex-row items-center space-x-2 bg-primary p-2">
                    <div className="flex h-[48px] flex-col space-y-1">
                        <Link href={`/admin/edit/${next_id}`}>
                            <IoIosArrowUp className="h-[22px] w-8 cursor-pointer rounded-lg bg-secondary fill-secondary_dark hover:bg-secondary_dark hover:fill-primary" />
                        </Link>
                        <Link href={`/admin/edit/${last_id}`}>
                            <IoIosArrowDown className="h-[22px] w-8 cursor-pointer rounded-lg bg-secondary fill-secondary_dark hover:bg-secondary_dark hover:fill-primary" />
                        </Link>
                    </div>
                    <Link href={`/details/${current_id}`}>
                        <MdPageview className="h-[48px] w-[48px] cursor-pointer rounded-lg bg-secondary fill-secondary_dark p-1 hover:bg-secondary_dark hover:fill-primary" />
                    </Link>
                    <form action={handleTitleUpdate} className="flex w-full flex-grow flex-row rounded-lg bg-secondary_dark">
                        <input type="hidden" name="inventoryId" value={current_id} />
                        <input
                            type="text"
                            name="newTitle"
                            defaultValue={inventory_name}
                            className="m-0 flex w-full flex-grow rounded-lg border-none bg-secondary_dark px-3 py-1 text-2xl font-bold text-primary outline-none"
                        />
                        <button
                            type="submit"
                            className="ml-2 rounded-md bg-secondary px-3 py-1 font-bold text-primary hover:bg-primary_dark hover:text-secondary_dark"
                        >
                            Save
                        </button>
                    </form>
                </div>
                {inventoryData ? (
                    <>
                        <EditForm current_inventory={inventoryData} />
                        <InventoryOrderPanel current_inventory={inventoryData} />
                    </>
                ) : (
                    <LoadingSpinner page="" />
                )}
            </div>
        </div>
    );
};

export default Edit;