// File: /app/manage/Manage.tsx

import Link from 'next/link';
import Image from 'next/image';
import { IoIosArrowForward } from 'react-icons/io';
import { MdDeleteForever, MdRestore } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import { changeOrder } from './actions';
import { Inventory } from '@/db/schema';
import { revalidatePath } from 'next/cache';

interface ManageProps {
    inventory: Inventory[];
    activeTab: string;
}

export function Manage({ inventory, activeTab }: ManageProps) {
    async function handleOrderChange(formData: FormData) {
        'use server';
        const currId = Number(formData.get('currId'));
        const currOrderId = Number(formData.get('currOrderId'));
        const nextId = Number(formData.get('nextId'));
        const nextOrderId = Number(formData.get('nextOrderId'));

        if (nextId !== null && nextOrderId !== null) {
            console.log(`Handle Order Change: currId: ${currId} (${currOrderId}) | nextId: ${nextId} (${nextOrderId})`);
            await changeOrder([currId, currOrderId], [nextId, nextOrderId]);
            revalidatePath(`/admin/manage`);
        }
    }

    console.log(`Current pieces length: ${inventory.length}`);

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-primary_dark text-lg font-bold text-secondary_dark md:w-4/5">
                <div className="w-full rounded-t-md bg-primary_dark text-lg font-bold text-secondary_dark">
                    <div className="flex pt-1">
                        {inventory.length > 0 && (
                            <Link
                                href="/manage?tab=manage"
                                className={`rounded-t-md px-2 py-1 ${
                                    activeTab === 'manage'
                                        ? 'bg-secondary_dark text-primary'
                                        : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
                                }`}
                            >
                                Order
                            </Link>
                        )}
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
                                            <input type="hidden" name="lastId" value={last_item.id.toString()} />
                                            <input type="hidden" name="lastOrderId" value={last_item.o_id.toString()} />
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
                                        <Link href={`/admin/edit/${item.id.toString()}`} className="">
                                            <FaEdit className="h-10 w-10 rounded-lg bg-secondary_dark fill-primary p-1.5 hover:bg-primary_dark hover:fill-secondary_dark" />
                                        </Link>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-secondary_dark">{item.name}</h3>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
