import React from 'react';
import Statistics from './statistics';
import Link from 'next/link';

interface Service {
    title: string;
    description: string;
    price: number | string;
    includedItems: string[];
    tag?: string;
}

export default function Services() {
    const services: Service[] = [
        {
            title: 'Partial Staging',
            description:
                'Mia will make adjustments to your furniture and decor that will make your home ready to sell with minimal hassle.',
            price: "Starting at $2,000",
            includedItems: [
                'Decor, Art, & Linens updated',
                'Items not fit for purpose removed',
                'Furniture arranged to fit the room',
                'Lighting adjusted as possible',
            ],
        },
        {
            title: 'Full Staging',
            description: 'Mia will bring in all the latest furniture and decor to your home to make it pop.',
            price: "Starting at $4,000",
            includedItems: ['All furniture & decor updated', 'Lighting improvments', '2D design mockups provided'],
            tag: "Mia's fav",
        },
        {
            title: 'Custom Staging',
            description: 'Mia will tailor your space to highlight all its qualities and ensure you see the best possible return.',
            price: 'Schedule a call',
            includedItems: ['Purpose-specific pieces', '3D design models provided', 'Professional lighting', 'Event planning by Mia'],
        },
    ];

    return (
        <div className="h-auto md:min-h-[calc(100dvh-50px)] w-full flex flex-col justify-evenly items-center">
            <div className="h-fit w-full flex flex-col items-center justify-center space-y-2 pb-4 lg:w-[90%]">
                <h1 className="text-4xl px-4 font-bold text-white text-center">Focus on your next moves,</h1>
                <h1 className="text-4xl px-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% via-secondary_light via-70% to-secondary_dark to-90% text-center">
                    we'll handle your history.
                </h1>
                <p className="text-lg text-white !mb-4 text-center px-8">
                    With a home staged by Mia, you can trust that every room tells your story.
                </p>
                <div className="w-full px-4 flex md:flex-row md:space-x-4 flex-col space-y-4 md:space-y-0">
                    {services.map((service, index) => (
                        <div key={index} className="w-full md:w-1/3 flex flex-col ring-neutral-500 bg-neutral-800 ring-1 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 text-lg font-bold">
                                    {service.title}
                                </div>
                                {service.tag && (
                                    <span className="bg-gradient-to-r from-secondary from-10% via-secondary_light via-70% to-secondary_dark to-90% text-white px-2 py-1 rounded-full text-sm">
                                        {service.tag}
                                    </span>
                                )}
                            </div>
                            <p className="text-md text-white mb-4">{service.description}</p>
                            <Link href="/contact">
                                <div className={
                                    `flex group items-center justify-center w-full py-2 font-bold rounded-md mb-4 px-2 text-md ` +
                                    `bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 `
                                    + `hover:from-secondary hover:via-secondary_light hover:to-secondary`
                                }>
                                    <div className="group-hover:text-white text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary_light to-secondary">
                                        {typeof service.price === 'string' ? service.price : `$${service.price.toFixed(2)}`}
                                    </div>
                                </div>
                            </Link>
                            <ul className="list-disc list-outside space-y-1 p-3 ml-1">
                                {service.includedItems.map((item, itemIndex) => (
                                    <li key={itemIndex} className="text-md text-white leading-tight hover:text-secondary_light text-lg">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden h-fit w-full md:flex flex-col items-center justify-center space-y-2 py-4 px-4">
                <Statistics arrows={false}/>
            </div>  
        </div>
    );
}
