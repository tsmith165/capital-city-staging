import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Test Page - Capital City Staging',
    description: 'This is a simple test page to verify metadata works.',
    openGraph: {
        title: 'Test Page - Capital City Staging',
        description: 'This is a simple test page to verify metadata works.',
        url: 'https://www.capitalcitystaging.com/test-metadata',
        siteName: 'Capital City Staging',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Test Page - Capital City Staging',
        description: 'This is a simple test page to verify metadata works.',
    },
};

export default function TestMetadataPage() {
    return (
        <div className="min-h-screen bg-stone-900 text-white p-8">
            <h1 className="text-4xl font-bold mb-4">Test Metadata Page</h1>
            <p className="text-lg">This is a simple test page to verify if metadata is working.</p>
            <div className="mt-8 p-4 bg-stone-800 rounded">
                <h2 className="text-xl font-semibold mb-2">Expected Metadata:</h2>
                <ul className="list-disc list-inside space-y-1">
                    <li>Title: Test Page - Capital City Staging</li>
                    <li>Description: This is a simple test page to verify metadata works.</li>
                    <li>OpenGraph: Should be set</li>
                    <li>Twitter: Should be set</li>
                </ul>
            </div>
        </div>
    );
}