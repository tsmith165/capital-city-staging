'use client';

import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FIELD_CONTROL_CLASSES, FIELD_LABEL_CLASSES } from './inputs.constants';
import { formatFieldName } from './inputs.utils';

interface InputTextAreaProps {
    idName: string;
    name: string;
    rows: number;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InputTextArea: React.FC<InputTextAreaProps> = ({ idName, name, rows, value, onChange }) => {
    const formattedName = formatFieldName(name);

    return (
        <div className="m-0 flex w-full p-0">
            <label
                htmlFor={idName}
                className={FIELD_LABEL_CLASSES}
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formattedName}
            >
                {formattedName}
            </label>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <textarea
                id={idName}
                name={idName}
                className={`whitespace-pre-wrap py-1.5 ${FIELD_CONTROL_CLASSES}`}
                value={value}
                rows={rows}
                onChange={onChange}
            />
        </div>
    );
};

export default InputTextArea;
