'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';

interface InputTextAreaProps {
    idName: string;
    name: string;
    rows: number;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InputTextArea: React.FC<InputTextAreaProps> = ({ idName, name, rows, value, onChange }) => {
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="m-0 flex w-full p-0">
            <div 
                className="flex min-w-28 max-w-28 items-center justify-center rounded-l-md bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 px-2.5 py-1.5"
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formatted_name}
            >
                <div className="text-neutral-950 font-bold">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <textarea
                id={idName}
                name={idName}
                className="h-full w-full whitespace-pre-wrap rounded-r-md border-none bg-secondary_light py-1.5 pl-2.5 text-sm font-bold text-neutral-950 placeholder-neutral-600"
                value={value}
                rows={rows}
                onChange={onChange}
            />
        </div>
    );
};

export default InputTextArea;