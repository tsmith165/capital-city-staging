'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';

interface InputTextboxProps {
    name: string;
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputTextbox: React.FC<InputTextboxProps> = ({ name, value, placeholder, onChange }) => {
    const id = name.toLowerCase().replace(' ', '_');
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="m-0 flex h-full w-full max-w-full flex-row overflow-hidden p-0">
            <div 
                className="flex h-8 min-w-28 max-w-28 items-center justify-center rounded-l-md bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 px-2.5 py-1.5"
                data-tooltip-id={`tooltip-${id}`}
                data-tooltip-content={formatted_name}
            >
                <div className="text-neutral-950 font-bold">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${id}`} place="top" />
            {onChange ? (
                <input
                    id={id}
                    name={id}
                    className="flex h-8 w-full rounded-r-md border-none bg-secondary_light px-2 text-sm font-bold text-neutral-950 placeholder-neutral-600"
                    value={value}
                    placeholder={placeholder || ''}
                    onChange={onChange}
                />
            ) : (
                <input
                    id={id}
                    name={id}
                    className="flex h-8 w-full rounded-r-md border-none bg-secondary_light px-2 text-sm font-bold text-neutral-950 placeholder-neutral-600"
                    defaultValue={value}
                    placeholder={placeholder || ''}
                />
            )}
        </div>
    );
};

export default InputTextbox;
