import React, { useState, useCallback } from 'react';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ResizeUploaderProps {
    handleUploadComplete: (
        originalImageUrl: string, 
        smallImageUrl: string, 
        originalWidth: number, 
        originalHeight: number, 
        smallWidth: number, 
        smallHeight: number
    ) => void;
    handleResetInputs: () => void;
}

interface UploadResponse {
    name: string;
    url: string;
}

const ResizeUploader: React.FC<ResizeUploaderProps> = ({ handleUploadComplete, handleResetInputs }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { startUpload } = useUploadThing('imageUploader', {
        onClientUploadComplete: (res) => {
            console.log('Upload complete:', res);
            if (res && res.length === 2) {
                const smallImage = res.find((file: UploadResponse) => file.name.startsWith('small-'));
                const largeImage = res.find((file: UploadResponse) => !file.name.startsWith('small-'));
                
                if (smallImage && largeImage) {
                    const img = new Image();
                    img.onload = function() {
                        const smallImg = new Image();
                        smallImg.onload = function() {
                            handleUploadComplete(
                                largeImage.url, 
                                smallImage.url, 
                                img.naturalWidth, 
                                img.naturalHeight, 
                                smallImg.naturalWidth, 
                                smallImg.naturalHeight
                            );
                        };
                        smallImg.src = smallImage.url;
                    };
                    img.src = largeImage.url;
                } else {
                    console.error('Could not identify small and large images from the response');
                }
            } else {
                console.error('Unexpected response format');
            }
            setIsUploading(false);
            setUploadProgress(0);
        },
        onUploadError: (error: Error) => {
            alert(`ERROR! ${error.message}`);
            setIsUploading(false);
            setUploadProgress(0);
        },
        onUploadProgress: (progress: number) => {
            setUploadProgress(progress);
        },
    });

    const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const width = img.width;
                    const height = img.height;

                    if (width <= maxWidth && height <= maxHeight) {
                        resolve(file);
                    } else {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        const newWidth = width * ratio;
                        const newHeight = height * ratio;

                        canvas.width = newWidth;
                        canvas.height = newHeight;

                        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

                        canvas.toBlob((blob) => {
                            if (blob) {
                                const resizedFile = new File([blob], file.name, { type: file.type });
                                resolve(resizedFile);
                            }
                        }, file.type);
                    }
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const originalFile = selectedFiles[0];

            setIsUploading(true);
            handleResetInputs();

            const originalResizedFile = await resizeImage(originalFile, 1920, 1920);
            const smallResizedFile = await resizeImage(originalFile, 450, 450);

            const smallFileWithPrefix = new File([smallResizedFile], `small-${smallResizedFile.name}`, { type: smallResizedFile.type });

            await startUpload([smallFileWithPrefix, originalResizedFile]);
        }
    }, [handleResetInputs, startUpload]);

    return (
        <div className="flex space-x-2">
            <label
                htmlFor="file-upload"
                className={`cursor-pointer rounded-md px-4 py-1 text-lg font-bold shadow-xl ring-2 ring-primary_dark ${
                    isUploading ? 'bg-secondary_dark' : 'bg-primary_dark hover:bg-secondary_dark'
                }`}
            >
                <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />
                <span className="relative z-10 text-stone-300">
                    {isUploading ? 'Uploading...' : 'Select and Upload File'}
                </span>
                {isUploading && (
                    <div
                        className="absolute left-0 top-0 h-full bg-primary"
                        style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease-in-out' }}
                    />
                )}
            </label>
        </div>
    );
};

export default ResizeUploader;