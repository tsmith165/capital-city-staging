'use client';

export default function GenerateSmallImages() {
    return (
        <div className="rounded-lg bg-surface-raised p-6">
            <h3 className="text-lg font-semibold text-body mb-4">Generate Small Images</h3>
            <p className="text-body-subtle mb-4">
                Small image generation is now handled automatically during upload via UploadThing.
            </p>
            <button 
                disabled
                className="rounded bg-gray-500 px-4 py-2 text-white cursor-not-allowed"
            >
                Feature Integrated into Upload
            </button>
        </div>
    );
}
