// File: /src/app/admin/edit/images/[id]/ImageEditor.tsx

import { useState, useEffect } from 'react';

import { storeUploadedImageDetails } from '@/app/admin/edit/actions';

import ResizeUploader from '@/app/admin/edit/ResizeUploader';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';

interface ImageEditorProps {
    inventoryId: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ inventoryId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [imageUrl, setImageUrl] = useState('Not yet uploaded');
    const [title, setTitle] = useState('Not yet uploaded');
    const [selectedOption, setSelectedOption] = useState('main');
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [smallImageUrl, setSmallImageUrl] = useState('Not yet uploaded');
    const [smallWidth, setSmallWidth] = useState(0);
    const [smallHeight, setSmallHeight] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleFilesSelected = (originalFile: File, smallFile: File) => {
        setFiles([originalFile, smallFile]);
        setTitle(originalFile.name.split('.')[0]);

        const img = document.createElement('img');
        img.src = URL.createObjectURL(originalFile);
        img.onload = function () {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            console.log('Original Image width:', width, 'height:', height);
            setWidth(width);
            setHeight(height);
        };

        const smallImg = document.createElement('img');
        smallImg.src = URL.createObjectURL(smallFile);
        smallImg.onload = function () {
            const smallWidth = smallImg.naturalWidth;
            const smallHeight = smallImg.naturalHeight;
            console.log('Small Image width:', smallWidth, 'height:', smallHeight);
            setSmallWidth(smallWidth);
            setSmallHeight(smallHeight);
        };
    };

    const handleUploadComplete = (
        originalImageUrl: string, 
        smallImageUrl: string, 
        originalWidth: number, 
        originalHeight: number, 
        smallWidth: number, 
        smallHeight: number
    ) => {
        setImageUrl(originalImageUrl);
        setSmallImageUrl(smallImageUrl);
        setWidth(originalWidth);
        setHeight(originalHeight);
        setSmallWidth(smallWidth);
        setSmallHeight(smallHeight);
        setIsSubmitted(false);
        setStatusMessage(null);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            await storeUploadedImageDetails({
                inventory_id: inventoryId,
                image_path: imageUrl,
                title: title,
                inventory_type: selectedOption,
                width: width.toString(),
                height: height.toString(),
                small_image_path: smallImageUrl,
                small_width: smallWidth.toString(),
                small_height: smallHeight.toString(),
            });
            setIsSubmitted(true);
            setStatusMessage({ type: 'success', message: 'Changes submitted successfully. You can upload another image.' });
        } catch (error) {
            console.error('Error submitting changes:', error);
            setStatusMessage({ type: 'error', message: 'Failed to submit changes. Please try again.' });
        }
    };

    const handleResetInputs = () => {
        setFiles([]);
        setImageUrl('Not yet uploaded');
        setWidth(0);
        setHeight(0);
        setTitle('Not yet uploaded');
        setSmallImageUrl('Not yet uploaded');
        setSmallWidth(0);
        setSmallHeight(0);
        setIsSubmitted(false);
        setStatusMessage(null);
    };

    useEffect(() => {
        if (isSubmitted) {
            handleResetInputs();
        }
    }, [isSubmitted]);

    const isFormValid = files.length > 0 && !isSubmitted;

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-secondary_dark">
            <div className="flex w-2/5 flex-col items-center justify-center rounded-lg bg-secondary_light">
                <div
                    id="header"
                    className="flex w-full items-center justify-center rounded-t-lg bg-secondary p-4 text-center text-4xl font-bold text-primary"
                >
                    Edit Images
                </div>
                <div className="flex w-full flex-col items-center space-y-2 p-2">
                    <ResizeUploader
                        onFilesSelected={handleFilesSelected}
                        handleUploadComplete={handleUploadComplete}
                        handleResetInputs={handleResetInputs}
                    />
                    <InputSelect
                        idName='inventory_type'
                        key="image_type"
                        name="Image Type"
                        defaultValue={{ value: selectedOption, label: selectedOption }}
                        select_options={[
                            ['main', 'Modify Main Image'],
                            ['extra', 'Add Extra Image'],
                        ]}
                        onChange={handleSelectChange}
                    />
                    <InputTextbox idName="title" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <InputTextbox idName="image_path" name="Image Path" value={imageUrl} />
                    <InputTextbox idName="px_width" name="Width (px)" value={width.toString()} />
                    <InputTextbox idName="px_height" name="Height (px)" value={height.toString()} />
                    <InputTextbox idName="small_image_path" name="Small Path" value={smallImageUrl} />
                    <InputTextbox idName="small_px_width" name="Sm Width" value={smallWidth.toString()} />
                    <InputTextbox idName="small_px_height" name="Sm Height" value={smallHeight.toString()} />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        className={
                            'rounded-md border-2 px-4 py-1 text-lg font-bold ' +
                            (isFormValid
                                ? 'border-primary bg-primary_dark text-primary hover:border-primary_dark hover:bg-primary hover:text-primary_dark'
                                : 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-500')
                        }
                    >
                        Submit Changes
                    </button>
                    {statusMessage && (
                        <div className={`mt-4 p-2 rounded ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {statusMessage.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;