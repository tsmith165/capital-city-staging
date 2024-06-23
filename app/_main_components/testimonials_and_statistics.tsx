import React from 'react';
import Testimonials from './testimonials';
import Statistics from './statistics';

export default function TestimonialsAndStatistics() {
    return (
        <div className="h-[calc(100dvh-50px)] w-full flex flex-col">
            <div className="w-full h-[70%] flex justify-center items-center">   
                <Testimonials />
            </div>
            <div className="w-full flex h-[30%]">
                <Statistics arrows={false}/>
            </div>
        </div>
    );
}
