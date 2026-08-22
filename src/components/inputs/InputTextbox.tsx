'use client';

import React, { useEffect, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { FIELD_CONTROL_CLASSES, FIELD_LABEL_CLASSES } from './inputs.constants';
import { formatFieldName } from './inputs.utils';

interface InputTextboxProps {
    idName: string;
    name: string;
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputTextbox: React.FC<InputTextboxProps> = ({ idName, name, value, placeholder, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const prevValueRef = useRef<string | undefined>(value);

    useEffect(() => {
        if (value !== prevValueRef.current) {
            prevValueRef.current = value;
            if (inputRef.current && !onChange) {
                inputRef.current.value = value || '';
            }
        }
    }, [idName, value, onChange]);

    const formattedName = formatFieldName(name);

    return (
        <div className="m-0 flex h-full w-full max-w-full flex-row overflow-hidden p-0">
            <label
                htmlFor={idName}
                className={`h-8 ${FIELD_LABEL_CLASSES}`}
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formattedName}
            >
                {formattedName}
            </label>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <input
                ref={inputRef}
                id={idName}
                name={idName}
                className={`h-8 ${FIELD_CONTROL_CLASSES}`}
                value={onChange ? value : undefined}
                defaultValue={!onChange ? value : undefined}
                placeholder={placeholder || ''}
                onChange={onChange}
            />
        </div>
    );
};

export default InputTextbox;
