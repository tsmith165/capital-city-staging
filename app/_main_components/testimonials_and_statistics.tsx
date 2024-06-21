import React from 'react';
import Testimonials from './testimonials';
import Statistics from './statistics';

export default function TestimonialsAndStatistics() {
    return (
        <div className="min-h-[calc(100dvh-50px)] h-[calc(100dvh-50px)] w-full flex flex-col justify-evenly">
            <div className="w-full">
                <Testimonials />
            </div>
            <div className="w-full flex">
                <Statistics arrows={false}/>
            </div>
        </div>
    );
}
