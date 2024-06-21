import React from 'react';

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
            price: 2000,
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
            price: 4000,
            includedItems: ['All furniture & decor updated', 'Lighting improvments', '2D design mockups provided'],
            tag: "Mia's fav",
        },
        {
            title: 'Custom Staging',
            description: 'Mia will tailor your space to highlight all its qualities and ensure you see the best possible return.',
            price: 'Schedule a call with Mia',
            includedItems: ['Purpose-specific pieces', '3D design models provided', 'Professional lighting', 'Event planning by Mia'],
        },
    ];

    return (
        <div className="h-auto md:h-[calc(100dvh-50px)] w-full flex flex-col items-center justify-center space-y-2 py-4">
            <h1 className="text-4xl font-bold text-white text-center">Focus on your next moves,</h1>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% via-secondary_light via-70% to-secondary_dark to-90% text-center">
                we'll handle your history.
            </h1>
            <p className="text-lg text-white !mb-4 text-center px-12">
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
                        <button className="items-baseline w-full py-2 text-md bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 hover:from-secondary hover:via-secondary_light hover:to-secondary text-white font-bold rounded-md mb-4">
                            {typeof service.price === 'string' ? service.price : `$${service.price.toFixed(2)}`}
                        </button>
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
    );
}