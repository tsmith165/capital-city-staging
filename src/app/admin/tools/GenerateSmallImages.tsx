import React, { useState, useRef, useCallback } from 'react';
import { generateMissingSmallImages } from './actions';
import { IoIosSpeedometer } from 'react-icons/io';

const GenerateSmallImages: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<'success' | 'error' | null>(null);
    const [result, setResult] = useState<{
        updatedItems: number;
        updatedExtraImages: number;
    } | null>(null);
    const [currentItem, setCurrentItem] = useState<any | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [generateTimeout, setGenerateTimeout] = useState(1000); // Default to 1 second
    const generateTimeoutRef = useRef(generateTimeout); // Create a ref to store the current timeout value
    const [showSlider, setShowSlider] = useState(false);
    const stopGenerationRef = useRef(false);

    const handleGenerateSmallImages = useCallback(async () => {
        setIsGenerating(true);
        setStatus(null);
        setResult(null);
        stopGenerationRef.current = false;

        try {
            const result = await generateMissingSmallImages(async (updatedItem, current, total) => {
                if (stopGenerationRef.current) return true;
                console.log(`Generating small image for piece ${current} of ${total} with timeout ${generateTimeoutRef.current}ms`);
                setCurrentItem(updatedItem);
                setProgress({ current, total });
                await new Promise((resolve) => setTimeout(resolve, generateTimeoutRef.current));
                return false;
            });
            if (!result.success) {
                console.error('Failed to generate small images:', result.error);
                setStatus('error');
                return;
            }
            if (!result.updatedItem) {
                console.error('No pieces returned from generateMissingSmallImages:', result.error);
                setStatus('error');
                return;
            }
            setStatus('success');
            setResult(result.updatedItem);
        } catch (error) {
            console.error('Failed to generate small images:', error);
            setStatus('error');
        }

        setIsGenerating(false);
        setCurrentItem(null);
    }, []);

    const handleStopGeneration = () => {
        stopGenerationRef.current = true;
    };

    const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTimeout = parseInt(e.target.value, 10);
        setGenerateTimeout(newTimeout);
        generateTimeoutRef.current = newTimeout; // Update the ref value
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                    <button
                        onClick={handleGenerateSmallImages}
                        disabled={isGenerating}
                        className="font-lato flex w-fit items-center rounded-md border-none bg-secondary_dark px-4 py-2 uppercase text-white hover:bg-stone-400 hover:font-bold hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Missing Small Images'}
                    </button>
                    {isGenerating && (
                        <button
                            onClick={handleStopGeneration}
                            className="font-lato flex w-fit items-center rounded-md border-none bg-red-600 px-4 py-2 uppercase text-white hover:bg-red-700 hover:font-bold"
                        >
                            Stop
                        </button>
                    )}
                </div>
                <div
                    className="group relative flex items-center"
                    onMouseEnter={() => setShowSlider(true)}
                    onMouseLeave={() => setShowSlider(false)}
                >
                    <IoIosSpeedometer className="h-6 w-6 cursor-pointer fill-stone-900" />
                    {showSlider && (
                        <div className="flex items-center space-x-2 p-2">
                            <input
                                type="range"
                                min={250}
                                max={10000}
                                step={100}
                                value={generateTimeout}
                                onChange={handleTimeoutChange}
                                className="w-24 cursor-pointer appearance-none rounded-lg bg-stone-600 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:bg-stone-900 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                            />
                            <span className="w-16 text-center text-stone-900">{(generateTimeout / 1000).toFixed(2)}s</span>
                        </div>
                    )}
                </div>
            </div>
            {isGenerating && currentItem && (
                <div className="text-center text-stone-900">
                    <p>Generating small image for: {currentItem.title}</p>
                    <p>
                        Progress: {progress.current} of {progress.total}
                    </p>
                </div>
            )}
            {status === 'success' && result && (
                <div className="text-center text-green-500">
                    <p>Small images generated successfully!</p>
                    <p>Updated inventory items: {result.updatedItems}</p>
                    <p>Updated extra images: {result.updatedExtraImages}</p>
                </div>
            )}
            {status === 'error' && <p className="text-center text-red-500">Failed to generate small images.</p>}
            {currentItem && (
                <div className="mt-4 text-stone-900">
                    <p>
                        <strong className="font-bold text-stone-900">{currentItem.title}</strong>
                    </p>
                    {currentItem.piece_type && <p className="text-stone-900">Type: {currentItem.piece_type}</p>}
                    {currentItem.width && currentItem.height && (
                        <p className="text-stone-900">
                            Dimensions: {currentItem.width}" x {currentItem.height}"
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GenerateSmallImages;
