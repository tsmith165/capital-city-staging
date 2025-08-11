import React from 'react';
import Link from 'next/link';

import Statistics from '@/app/_main_components/statistics';

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
            title: 'Occupied Staging',
            description:
                'Mia will make adjustments to your furniture and decor that will make your home ready to sell with minimal hassle.',
            price: 'Call Mia for a quote',
            includedItems: [
                'Conduct a walkthrough of your home to assess overall space, room count and available furniture and accessories',
                'Create a proposal with recommended services based on your requirements, budget, and timeline',
                'Use marketing and design to create an environment that buyers aspire to live in',
                'Transform each room to enhance appeal for a faster, more profitable sale',
            ],
        },
        {
            title: 'Vacant Staging',
            description: 'Mia will assess your current decor to determine what furniture and decor will make your home pop.',
            price: 'Call Mia for a quote',
            includedItems: [
                'Visit the home for measurements and blueprint development',
                "Select furniture, artwork, and accessories that complement the home and suit the buyer's lifestyle",
                "Arrange furnishings expertly to enhance each room's appeal and functionality",
                'Remove staged items promptly and complete inventory retrieval after the property sells',
            ],
        },
    ];

    return (
        <div className="flex h-auto w-full flex-col items-center justify-evenly md:min-h-[calc(100dvh-50px)]">
            <div className="flex h-fit w-full flex-col items-center justify-center p-4 lg:w-[90%]">
                <h1 className="px-4 text-center text-4xl font-bold text-white">Focus on your next moves,</h1>
                <h1 className="px-4 text-center text-4xl font-bold gradient-secondary-main-text">we'll handle the rest.</h1>
                <p className="px-8 pb-4 text-center text-lg text-white">
                    With a home staged by Mia, you can trust that your home has reached its full potential.
                </p>
                <div className="flex w-full flex-col justify-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                    {services.map((service, index) => (
                        <div key={index} className="flex w-full flex-col rounded-lg bg-stone-800 p-4 ring-1 ring-stone-500 md:w-1/3">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="text-lg font-bold gradient-gold-main-text">{service.title}</div>
                                {service.tag && (
                                    <span className="rounded-full px-2 py-1 text-sm gradient-secondary-main-text">{service.tag}</span>
                                )}
                            </div>
                            <p className="text-md mb-4 text-white">{service.description}</p>
                            <Link href="/contact">
                                <div
                                    className={
                                        `text-md group mb-4 flex w-full items-center justify-center rounded-md px-2 py-2 font-bold ` +
                                        ` bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400` +
                                        ` hover:from-secondary hover:via-secondary_light hover:to-secondary`
                                    }
                                >
                                    <div className="gradient-secondary-main-text group-hover:text-white">
                                        {typeof service.price === 'string' ? service.price : `$${service.price.toFixed(2)}`}
                                    </div>
                                </div>
                            </Link>
                            <ul className="ml-1 list-outside list-disc space-y-1 p-3">
                                {service.includedItems.map((item, itemIndex) => (
                                    <li key={itemIndex} className="text-md text-lg leading-tight text-white hover:text-secondary_light">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden h-fit w-full flex-col items-center justify-center space-y-2 px-4 py-4 md:flex">
                <Statistics arrows={false} />
            </div>
        </div>
    );
}
