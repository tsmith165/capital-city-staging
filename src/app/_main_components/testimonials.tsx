import React from 'react';
import Image from 'next/image';

const testimonials = [
    {
        name: 'Alex M',
        text: 'Mia did a fantastic job staging our home. We sold it within a week!',
        image: '/testimonials/homeowner-couple-6.jpg',
        width: 1067,
        height: 1067,
    },
    {
        name: 'Sarah S',
        text: 'The staging made our home look so beautiful. Highly recommend!',
        image: '/testimonials/homeowner-couple-5.jpg',
        width: 683,
        height: 683,
    },
];

export default function Testimonials() {
    return (
        <div className='flex flex-col w-full space-y-4 h-full justify-center items-center'>
            <div className="w-full h-auto flex items-center justify-center">
                <h1 className="text-4xl font-bold text-center gradient-secondary-main">
                    Testimonials
                </h1>
            </div>

            <div className="flex flex-col w-full md:flex-row flex-grow space-y-4 md:space-y-0 md:space-x-4 px-4">
                {testimonials.map((testimonial, index) => (
                    <div className="h-fit bg-secondary_dark text-white p-4 rounded-lg shadow-lg">
                        <p className="text-md md:text-lg">{`"${testimonial.text}"`}</p>
                        <p className="mt-2 text-md font-bold text-transparent gradient-gold-main">
                            {testimonial.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
