'use client';

import React from 'react';
import Select, { components } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

interface InputMultiSelectProps {
    defaultValue?: { value: string; label: string }[];
    idName: string;
    name: string;
    select_options: [string, string][];
    onChange?: (selectedOptions: { value: string; label: string }[]) => void;
}

const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <FaArrowDown className="fill-secondary_dark" />
        </components.DropdownIndicator>
    );
};

const InputMultiSelect: React.FC<InputMultiSelectProps> = ({ defaultValue, idName, name, select_options, onChange }) => {
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
                <div className="text-stone-950 font-bold">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <Select
                defaultValue={defaultValue}
                isMulti={true}
                id={idName}
                name={idName}
                className="h-full flex-grow rounded-r-md border-none bg-primary text-sm font-bold text-stone-950"
                classNamePrefix="select"
                components={{
                    DropdownIndicator,
                }}
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: '',
                        backgroundColor: 'var(--color-secondary)',
                    }),
                    multiValue: (styles) => ({
                        ...styles,
                        backgroundColor: 'var(--color-secondary-light)',
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        color: 'var(--color-secondary)',
                    }),
                }}
                options={react_select_options}
                onChange={(selectedOptions) => {
                    if (onChange) {
                        onChange(selectedOptions as { value: string; label: string }[]);
                    }
                }}
            />
        </div>
    );
};

export default InputMultiSelect;