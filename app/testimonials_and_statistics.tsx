import React from 'react';
import Testimonials from './testimonials';
import Statistics from './statistics';

export default function TestimonialsAndStatistics() {
    return (
        <div className="h-[calc(100vh-50px)] w-full flex flex-col">
            <div className="w-full min-h-[65%] max-h-[65%]">
                <Testimonials />
            </div>
            <div className="w-full min-h-[35%] max-h-[35%]">
                <Statistics />
            </div>
        </div>
    );
}
