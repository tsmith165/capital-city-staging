import React, { useState, useEffect } from 'react';
import { MdArrowForwardIos, MdArrowBackIos } from 'react-icons/md';
import { statistics } from '../../lib/statistics';

function shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

export default function Statistics({ arrows }: { arrows?: boolean }) {
    const [current, setCurrent] = useState(0);
    const [shuffledStats, setShuffledStats] = useState(statistics);

    const nextStat = () => setCurrent((prev) => (prev + 1) % shuffledStats.length);
    const prevStat = () => setCurrent((prev) => (prev - 1 + shuffledStats.length) % shuffledStats.length);

    useEffect(() => {
        setShuffledStats(shuffleArray(statistics));
    }, []);

    useEffect(() => {
        const interval = setInterval(nextStat, 5000);
        return () => clearInterval(interval);
    }, [shuffledStats]);

    return (
        <div className="relative flex max-h-full min-h-full w-full items-center justify-center p-4">
            {arrows && (
                <button
                    onClick={prevStat}
                    className="absolute left-4 flex items-center justify-center font-bold text-secondary hover:text-secondary_light"
                >
                    <MdArrowBackIos size={48} />
                </button>
            )}
            <div className="flex-grow px-2 text-center md:px-16">
                <div className="text-3xl font-bold gradient-gold-main-text md:text-4xl">{`"${shuffledStats[current].text}"`}</div>
                <div className="mt-2 text-lg gradient-secondary-main-text">{`- ${shuffledStats[current].attributor}`}</div>
            </div>
            {arrows && (
                <button
                    onClick={nextStat}
                    className="absolute right-4 flex items-center justify-center font-bold text-secondary hover:text-secondary_light"
                >
                    <MdArrowForwardIos size={48} />
                </button>
            )}
        </div>
    );
}
