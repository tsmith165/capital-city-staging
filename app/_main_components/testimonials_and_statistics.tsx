import React from 'react';
import Testimonials from './testimonials';
import Statistics from './statistics';

export default function TestimonialsAndStatistics() {
    return (
        <div className="min-h-[calc(100dvh-50px)] h-[calc(100dvh-50px)] w-full flex flex-col">
            <div className="w-full">
                <Testimonials />
            </div>
            <div className="w-full flex flex-grow">
                <Statistics arrows={false}/>
            </div>
        </div>
    );
}
