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
        <div className="min-h-full max-h-full w-full flex items-center justify-center relative p-4">
            {arrows && (
                <button
                    onClick={prevStat}
                    className="absolute left-4 flex justify-center items-center text-secondary hover:text-secondary_light font-bold">
                    <MdArrowBackIos size={48} />
                </button>
            )}
            <div className="text-center flex-grow px-2 md:px-16">
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 text-3xl md:text-4xl font-bold">
                    {`"${shuffledStats[current].text}"`}
                </div>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% via-secondary_light via-70% to-secondary_dark to-90% text-lg mt-2">
                    {`- ${shuffledStats[current].attributor}`}
                </div>
            </div>
            {arrows && (
                <button
                    onClick={nextStat}
                    className="absolute right-4 flex justify-center items-center text-secondary hover:text-secondary_light font-bold">
                    <MdArrowForwardIos size={48} />
                </button>
            )}
        </div>
    );
}