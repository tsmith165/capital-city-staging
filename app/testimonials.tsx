import React from 'react';
import Image from 'next/image';

const testimonials = [
    {
        name: 'Alex M',
        text: 'Mia did a fantastic job staging our home. We sold it within a week!',
        image: '/homeowner-couple-3-square.jpg',
        width: 418,
        height: 418,
    },
    {
        name: 'Sarah S',
        text: 'The staging made our home look so beautiful. Highly recommend!',
        image: '/homeowner-couple-4-square.jpg',
        width: 500,
        height: 500,
    },
];

export default function Testimonials() {
    return (
        <>
            <div className="w-full h-auto flex items-center justify-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary_light via-secondary_dark to-secondary_light text-center w-fit">
                    Testimonials
                </h1>
            </div>

            <div className="min-h-full flex flex-row justify-center items-center space-x-4 p-4">
                {testimonials.map((testimonial, index) => (
                    <div className="relative flex flex-col w-full h-full" key={index}>
                        <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            width={testimonial.width}
                            height={testimonial.height}
                            className="rounded-lg shadow-lg w-auto h-auto"
                        />
                        <div className="md:absolute md:top-[75%] lg:top-[80%] h-fit bg-secondary_dark text-white p-4 rounded-lg shadow-lg">
                            <p className="text-md md:text-lg">{`"${testimonial.text}"`}</p>
                            <p className="mt-2 text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400">
                                {testimonial.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
