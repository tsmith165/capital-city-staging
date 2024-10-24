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
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
            <div className="flex h-auto w-full items-center justify-center">
                <h1 className="text-center text-4xl font-bold gradient-secondary-main-text">Testimonials</h1>
            </div>

            <div className="flex w-full flex-grow flex-col space-y-4 px-4 md:flex-row md:space-x-4 md:space-y-0">
                {testimonials.map((testimonial, index) => (
                    <div className="h-fit rounded-lg bg-secondary_dark p-4 text-white shadow-lg">
                        <p className="text-md md:text-lg">{`"${testimonial.text}"`}</p>
                        <p className="text-md mt-2 font-bold text-transparent gradient-gold-main-text">{testimonial.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
