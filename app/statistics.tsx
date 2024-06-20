import React, { useState, useEffect } from 'react';
import { MdArrowForwardIos, MdArrowBackIos } from 'react-icons/md';

const statistics = [
    'Homes with staging sell 75% faster than those without.',
    'Staged homes sell for 6-10% more than non-staged homes.',
    '95% of buyers look at homes online first.',
];

export default function Statistics() {
    const [current, setCurrent] = useState(0);

    const nextStat = () => setCurrent((prev) => (prev + 1) % statistics.length);
    const prevStat = () => setCurrent((prev) => (prev - 1 + statistics.length) % statistics.length);

    useEffect(() => {
        const interval = setInterval(nextStat, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-full max-h-full flex items-center justify-center relative p-4">
            <button
                onClick={prevStat}
                className="absolute left-4 flex justify-center items-center text-secondary hover:text-secondary_light font-bold">
                <MdArrowBackIos size={48} />
            </button>
            <div className="text-center flex-grow px-16 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 text-xl md:text-4xl font-bold">
                {statistics[current]}
            </div>
            <button
                onClick={nextStat}
                className="absolute right-4 flex justify-center items-center text-secondary hover:text-secondary_light font-bold">
                <MdArrowForwardIos size={48} />
            </button>
        </div>
    );
}
