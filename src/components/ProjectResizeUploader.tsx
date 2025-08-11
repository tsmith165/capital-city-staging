import React, { useState, useCallback, useRef } from 'react';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ProjectResizeUploaderProps {
    onUploadComplete: (images: Array<{
        fileName: string;
        originalImageUrl: string;
        smallImageUrl: string;
        originalWidth: number;
        originalHeight: number;
        smallWidth: number;
        smallHeight: number;
    }>) => void;
    onResetInputs: () => void;
    disabled?: boolean;
}

interface UploadResponse {
    name: string;
    url: string;
}

const ProjectResizeUploader: React.FC<ProjectResizeUploaderProps> = ({ 
    onUploadComplete, 
    onResetInputs, 
    disabled = false 
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingState, setLoadingState] = useState<string>('Resizing Images');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { startUpload } = useUploadThing('imageUploader', {
        onClientUploadComplete: async (res) => {
            console.log('Upload complete:', res);
            setLoadingState('Processing Images');
            
            if (res && res.length > 0) {
                try {
                    const processedImages = [];
                    
                    // Group files by pairs (small- prefix and regular)
                    const files = res as UploadResponse[];
                    const regularFiles = files.filter(file => !file.name.startsWith('small-'));
                    
                    for (const regularFile of regularFiles) {
                        const smallFile = files.find(file => 
                            file.name.startsWith('small-') && 
                            file.name.substring(6) === regularFile.name
                        );
                        
                        if (smallFile) {
                            const [imgDimensions, smallImgDimensions] = await Promise.all([
                                getImageDimensions(regularFile.url),
                                getImageDimensions(smallFile.url),
                            ]);

                            processedImages.push({
                                fileName: regularFile.name,
                                originalImageUrl: regularFile.url,
                                smallImageUrl: smallFile.url,
                                originalWidth: imgDimensions.width,
                                originalHeight: imgDimensions.height,
                                smallWidth: smallImgDimensions.width,
                                smallHeight: smallImgDimensions.height,
                            });
                        }
                    }
                    
                    onUploadComplete(processedImages);
                } catch (error) {
                    console.error('Error processing images:', error);
                }
            }
            
            setIsUploading(false);
            setUploadProgress(0);
            setLoadingState('Resizing Images');
        },
        onUploadError: (error: Error) => {
            alert(`ERROR! ${error.message}`);
            setIsUploading(false);
            setUploadProgress(0);
            setLoadingState('');
        },
        onUploadProgress: (progress: number) => {
            setUploadProgress(progress);
        },
    });

    const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = url;
        });
    };

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

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (selectedFiles && selectedFiles.length > 0) {
                setIsUploading(true);
                onResetInputs();

                const filesToUpload = [];

                for (let i = 0; i < selectedFiles.length; i++) {
                    const originalFile = selectedFiles[i];
                    
                    const originalResizedFile = await resizeImage(originalFile, 1920, 1920);
                    const smallResizedFile = await resizeImage(originalFile, 450, 450);
                    
                    const smallFileWithPrefix = new File(
                        [smallResizedFile], 
                        `small-${smallResizedFile.name}`, 
                        { type: smallResizedFile.type }
                    );
                    
                    filesToUpload.push(smallFileWithPrefix, originalResizedFile);
                }

                console.log('Resize complete...');
                setLoadingState('Uploading Images');
                
                // UploadThing has a limit, so we need to batch if too many files
                const maxFilesPerBatch = 2; // Since we have small + large for each image
                const batches = [];
                
                for (let i = 0; i < filesToUpload.length; i += maxFilesPerBatch) {
                    batches.push(filesToUpload.slice(i, i + maxFilesPerBatch));
                }
                
                // For now, just upload the first batch (1 image = 2 files)
                if (batches.length > 0) {
                    await startUpload(batches[0]);
                }
            }
        },
        [onResetInputs, startUpload],
    );

    const handleSelectFilesClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                disabled={isUploading || disabled}
                multiple
                accept="image/*"
            />
            <div className="flex flex-col items-center space-y-2">
                <button
                    onClick={handleSelectFilesClick}
                    disabled={isUploading || disabled}
                    className={
                        isUploading || disabled 
                            ? 'group relative overflow-hidden rounded-md px-6 py-3 text-lg font-bold transition-colors border-2 bg-stone-600 border-stone-600 text-stone-400 cursor-not-allowed' 
                            : 'group relative overflow-hidden rounded-md px-6 py-3 text-lg font-bold transition-colors border-2 bg-transparent border-primary text-primary hover:bg-secondary hover:border-secondary hover:text-stone-300'
                    }
                >
                    {isUploading && (
                        <div
                            className="absolute left-0 top-0 z-0 h-full bg-primary/20"
                            style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease-in-out' }}
                        />
                    )}
                    <span className="relative z-10">
                        {isUploading ? loadingState : 'Select Project Images'}
                    </span>
                </button>
                
                {isUploading && (
                    <div className="text-sm text-stone-400">
                        {uploadProgress}% complete
                    </div>
                )}
            </div>
        </>
    );
};

export default ProjectResizeUploader;