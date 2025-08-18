'use client';

export default function VerifyImageDimensions() {
    return (
        <div className="rounded-lg bg-stone-800 p-6">
            <h3 className="text-lg font-semibold text-stone-100 mb-4">Verify Image Dimensions</h3>
            <p className="text-stone-400 mb-4">
                Image dimension verification is now handled automatically during upload via UploadThing.
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
