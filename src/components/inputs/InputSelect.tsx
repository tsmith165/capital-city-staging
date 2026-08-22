'use client';

import React from 'react';
import Select, { components } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { FIELD_LABEL_CLASSES, SELECT_CONTROL_STYLES } from './inputs.constants';
import { formatFieldName } from './inputs.utils';

interface InputSelectProps {
    defaultValue?: { value: string; label: string };
    idName: string;
    name: string;
    select_options: [string, string][];
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DropdownIndicator = (props: any) => (
    <components.DropdownIndicator {...props}>
        <FaArrowDown className="fill-gold-300" />
    </components.DropdownIndicator>
);

const InputSelect: React.FC<InputSelectProps> = ({ defaultValue, idName, name, select_options, value, onChange }) => {
    const formattedName = formatFieldName(name);
    const reactSelectOptions = select_options.map(([optionValue, label]) => ({ value: optionValue, label }));

    return (
        <div className="m-0 flex w-full p-0">
            <div
                className={FIELD_LABEL_CLASSES}
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formattedName}
            >
                {formattedName}
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <Select
                defaultValue={defaultValue}
                value={reactSelectOptions.find((option) => option.value === value)}
                isMulti={false}
                id={idName}
                name={idName}
                className="h-full flex-grow text-sm font-semibold"
                classNamePrefix="select"
                components={{ DropdownIndicator }}
                styles={{
                    control: (baseStyles: any) => ({ ...baseStyles, ...SELECT_CONTROL_STYLES }),
                    singleValue: (baseStyles: any) => ({ ...baseStyles, color: 'var(--color-body)' }),
                    menu: (baseStyles: any) => ({ ...baseStyles, backgroundColor: 'var(--color-surface-overlay)' }),
                    option: (baseStyles: any, state: any) => ({
                        ...baseStyles,
                        backgroundColor: state.isFocused ? 'var(--color-surface-hover)' : 'transparent',
                        color: 'var(--color-body)',
                    }),
                    input: (baseStyles: any) => ({ ...baseStyles, color: 'var(--color-body)' }),
                }}
                options={reactSelectOptions}
                onChange={
                    onChange
                        ? (selectedOption) =>
                              onChange({
                                  target: { value: selectedOption?.value ?? '', name: idName },
                              } as React.ChangeEvent<HTMLSelectElement>)
                        : undefined
                }
            />
        </div>
    );
};

export default InputSelect;
