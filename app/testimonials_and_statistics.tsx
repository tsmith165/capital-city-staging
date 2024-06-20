import React from 'react';
import Testimonials from './testimonials';
import Statistics from './statistics';

export default function TestimonialsAndStatistics() {
    return (
        <div className="min-h-[calc(100vh-50px)] w-full flex flex-col">
            <div className="w-full ">
                <Testimonials />
            </div>
            <div className="w-full flex-grow flex ">
                <Statistics />
            </div>
        </div>
    );
}
