import React from 'react';
import Testimonials from './testimonials';
import Statistics from './statistics';

export default function TestimonialsAndStatistics() {
    return (
        <div className="min-h-[calc(100dvh-50px)] h-[calc(100dvh-50px)] w-full flex flex-col">
            <div className="w-full h-[60%] sm:h-[70%] md:h-[60%] flex justify-center items-center">   
                <Testimonials />
            </div>
            <div className="w-full flex h-[40%] sm:h-[30%] md:h-[40%]">
                <Statistics arrows={false}/>
            </div>
        </div>
    );
}
