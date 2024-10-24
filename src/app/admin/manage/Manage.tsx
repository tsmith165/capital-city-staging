// File: /src/app/admin/manage/Manage.tsx

import Link from 'next/link';
import Image from 'next/image';
import { IoIosArrowForward } from 'react-icons/io';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever, MdRestore } from 'react-icons/md';
import { changeOrder, changePriority, setInactive, setActive } from './actions';
import { Inventory } from '@/db/schema';

interface ManageProps {
    inventory: Inventory[];
    archivedInventory: Inventory[];
    prioritizedInventory: Inventory[];
    activeTab: string;
}

export function Manage({ inventory, archivedInventory, prioritizedInventory, activeTab }: ManageProps) {
    async function handleOrderChange(formData: FormData) {
        'use server';
        const currId = Number(formData.get('currId'));
        const currOrderId = Number(formData.get('currOrderId'));
        const nextId = Number(formData.get('nextId'));
        const nextOrderId = Number(formData.get('nextOrderId'));

        if (nextId !== null && nextOrderId !== null) {
            console.log(`Handle Order Change: currId: ${currId} (${currOrderId}) | nextId: ${nextId} (${nextOrderId})`);
            await changeOrder([currId, currOrderId], [nextId, nextOrderId]);
        }
    }

    async function handlePriorityChange(formData: FormData) {
        'use server';
        const currId = Number(formData.get('currId'));
        const currPriorityId = Number(formData.get('currPriorityId'));
        const nextId = Number(formData.get('nextId'));
        const nextPriorityId = Number(formData.get('nextPriorityId'));

        if (nextId !== null && nextPriorityId !== null) {
            console.log(`Handle Priority Change: currId: ${currId} (${currPriorityId}) | nextId: ${nextId} (${nextPriorityId})`);
            await changePriority([currId, currPriorityId], [nextId, nextPriorityId]);
        }
    }

    async function handleSetInactive(formData: FormData) {
        'use server';
        const id = Number(formData.get('id'));
        console.log(`Handle Set Inactive: id: ${id}`);
        await setInactive(id);
    }

    async function handleSetActive(formData: FormData) {
        'use server';
        const id = Number(formData.get('id'));
        console.log(`Handle Set Active: id: ${id}`);
        await setActive(id);
    }

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-primary_dark text-lg font-bold text-secondary_dark md:w-4/5">
                <div className="w-full rounded-t-md bg-primary_dark text-lg font-bold text-secondary_dark">
                    <div className="flex pt-1">
                        {inventory.length > 0 && (
                            <Link
                                href="/admin/manage?tab=manage"
                                className={`rounded-t-md px-2 py-1 ${
                                    activeTab === 'manage'
                                        ? 'bg-secondary_dark text-primary'
                                        : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
                                }`}
                            >
                                Order
                            </Link>
                        )}
                        {archivedInventory.length > 0 && (
                            <Link
                                href="/admin/manage?tab=archived"
                                className={`rounded-t-md px-2 py-1 ${
                                    activeTab === 'archived'
                                        ? 'bg-secondary_dark text-primary'
                                        : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
                                }`}
                            >
                                Archive
                            </Link>
                        )}
                        <Link
                            href="/admin/manage?tab=priority"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'priority'
                                    ? 'bg-secondary_dark text-primary'
                                    : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
                            }`}
                        >
                            Priority
                        </Link>
                    </div>
                </div>

                <div className="flex h-fit w-full flex-col items-center">
                    {inventory.length > 0 &&
                        activeTab === 'manage' &&
                        inventory.reverse().map((item, i) => {
                            const last_item = inventory[i - 1] ?? inventory[inventory.length - 1];
                            const next_item = inventory[i + 1] ?? inventory[0];

                            return (
                                <div
                                    key={item.id.toString()}
                                    className="flex w-full flex-row items-center space-x-4 rounded-b-lg border-b-2 border-primary_dark bg-secondary p-1 hover:bg-primary"
                                >
                                    <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-secondary p-1">
                                        <Image
                                            src={item.image_path}
                                            alt={item.name}
                                            width={item.width}
                                            height={item.height}
                                            className="h-[5.5rem] w-[5.5rem] object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <form action={handleOrderChange}>
                                            <input type="hidden" name="currId" value={item.id.toString()} />
                                            <input type="hidden" name="currOrderId" value={item.o_id.toString()} />
                                            <input type="hidden" name="nextId" value={last_item.id.toString()} />
                                            <input type="hidden" name="nextOrderId" value={last_item.o_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 -rotate-90 transform cursor-pointer rounded-lg bg-secondary_dark fill-primary hover:bg-primary_dark hover:fill-secondary_dark" />
                                            </button>
                                        </form>

                                        <form action={handleOrderChange}>
                                            <input type="hidden" name="currId" value={item.id.toString()} />
                                            <input type="hidden" name="currOrderId" value={item.o_id.toString()} />
                                            <input type="hidden" name="nextId" value={next_item.id.toString()} />
                                            <input type="hidden" name="nextOrderId" value={next_item.o_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 rotate-90 transform cursor-pointer rounded-lg bg-secondary_dark fill-primary hover:bg-primary_dark hover:fill-secondary_dark" />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <Link href={`/admin/edit?id=${item.id.toString()}`} className="">
                                            <FaEdit className="h-10 w-10 rounded-lg bg-secondary_dark fill-primary p-1.5 hover:bg-primary_dark hover:fill-secondary_dark" />
                                        </Link>
                                        <form action={handleSetInactive} className="flex h-fit w-fit">
                                            <input type="hidden" name="id" value={item.id.toString()} />
                                            <button type="submit" className="h-full w-full">
                                                <MdDeleteForever className="h-10 w-10 rounded-lg bg-secondary_dark fill-red-700 p-1 hover:bg-primary_dark hover:fill-red-900" />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-secondary_dark">{item.name}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    {prioritizedInventory.length > 0 &&
                        activeTab === 'priority' &&
                        prioritizedInventory.map((item, i) => {
                            const last_item = prioritizedInventory[i - 1] ?? prioritizedInventory[prioritizedInventory.length - 1];
                            const next_item = prioritizedInventory[i + 1] ?? prioritizedInventory[0];

                            return (
                                <div
                                    key={item.id.toString()}
                                    className="flex w-full flex-row items-center space-x-4 rounded-lg border-b-2 border-primary_dark bg-primary p-1 hover:bg-secondary_light"
                                >
                                    <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-secondary p-1">
                                        <Image
                                            src={item.image_path}
                                            alt={item.name}
                                            width={item.width}
                                            height={item.height}
                                            className="h-[5.5rem] w-[5.5rem] object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <form action={handlePriorityChange}>
                                            <input type="hidden" name="currId" value={item.id.toString()} />
                                            <input type="hidden" name="currPriorityId" value={item.p_id.toString()} />
                                            <input type="hidden" name="nextId" value={last_item.id.toString()} />
                                            <input type="hidden" name="nextPriorityId" value={last_item.p_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 -rotate-90 transform cursor-pointer rounded-lg bg-secondary fill-primary hover:bg-primary hover:fill-secondary_dark" />
                                            </button>
                                        </form>

                                        <form action={handlePriorityChange}>
                                            <input type="hidden" name="currId" value={item.id.toString()} />
                                            <input type="hidden" name="currPriorityId" value={item.p_id.toString()} />
                                            <input type="hidden" name="nextId" value={next_item.id.toString()} />
                                            <input type="hidden" name="nextPriorityId" value={next_item.p_id.toString()} />
                                            <button type="submit">
                                                <IoIosArrowForward className="h-8 w-8 rotate-90 transform cursor-pointer rounded-lg bg-secondary fill-primary hover:bg-primary hover:fill-secondary_dark" />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-secondary_dark">{item.name}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    {archivedInventory.length > 0 &&
                        activeTab === 'archived' &&
                        archivedInventory.map((item) => (
                            <div
                                key={item.id.toString()}
                                className="flex w-full flex-row items-center space-x-4 rounded-lg border-b-2 border-primary_dark bg-primary p-1 hover:bg-secondary_light"
                            >
                                <div className="flex max-h-24 min-h-24 min-w-24 max-w-24 items-center justify-center rounded bg-secondary p-1">
                                    <Image
                                        src={item.image_path}
                                        alt={item.name}
                                        width={item.width}
                                        height={item.height}
                                        className="h-[5.5rem] w-[5.5rem] object-contain"
                                    />
                                </div>
                                <form action={handleSetActive} className="flex h-fit w-fit">
                                    <input type="hidden" name="id" value={item.id.toString()} />
                                    <button type="submit" className="h-full w-full">
                                        <MdRestore className="h-10 w-10 rounded-lg bg-secondary fill-green-700 p-1 hover:bg-primary hover:fill-green-900" />
                                    </button>
                                </form>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-secondary_dark">{item.name}</h3>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
