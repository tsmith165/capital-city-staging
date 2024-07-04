'use client';

import React from 'react';
import Select, { components } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <FaArrowDown className="fill-secondary_dark" />
        </components.DropdownIndicator>
    );
};

interface InputSelectProps {
    defaultValue?: { value: string; label: string };
    idName: string;
    name: string;
    select_options: [string, string][];
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const InputSelect: React.FC<InputSelectProps> = ({ defaultValue, idName, name, select_options, value, onChange }) => {
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const react_select_options = select_options.map((option) => ({ value: option[0], label: option[1] }));

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
            {onChange === undefined ? (
                <Select
                    defaultValue={defaultValue}
                    value={react_select_options.find((option) => option.value === value)}
                    isMulti={false}
                    id={idName}
                    name={idName}
                    className="h-full flex-grow rounded-r-md border-none bg-secondary_light text-sm font-bold text-neutral-950"
                    classNamePrefix="select"
                    components={{
                        DropdownIndicator,
                    }}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: '',
                            backgroundColor: '#498352',
                        }),
                    }}
                    options={react_select_options}
                />
            ) : (
                <Select
                    defaultValue={defaultValue}
                    value={react_select_options.find((option) => option.value === value)}
                    isMulti={false}
                    id={idName}
                    name={idName}
                    className="h-full flex-grow rounded-r-md border-none bg-secondary_light text-sm font-bold text-neutral-950"
                    classNamePrefix="select"
                    components={{
                        DropdownIndicator,
                    }}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: '',
                            backgroundColor: '#498352',
                        }),
                    }}
                    options={react_select_options}
                    onChange={(selectedOption) =>
                        onChange?.({ target: { value: selectedOption?.value, name: idName } } as React.ChangeEvent<HTMLSelectElement>)
                    }
                />
            )}
        </div>
    );
};

export default InputSelect;