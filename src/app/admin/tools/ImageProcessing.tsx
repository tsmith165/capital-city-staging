import { CheckCircle2 } from 'lucide-react';

const AUTOMATED_STEPS = [
    {
        title: 'Small image generation',
        body: 'A thumbnail is produced when the file is uploaded, so the catalog never waits on a batch job.',
    },
    {
        title: 'Dimension verification',
        body: 'Width and height are read from the file on upload and stored with the record, so they cannot drift.',
    },
];

/**
 * Replaces two separate tabs that each rendered a disabled button explaining that the feature had
 * moved into the upload pipeline. Two dead tabs read as two broken tools.
 */
export default function ImageProcessing() {
    return (
        <div className="flex flex-col gap-4 p-5">
            <p className="text-body-muted text-sm">
                Nothing to run here. Both jobs happen during upload, which is why the buttons that used to be on this page are gone rather
                than disabled.
            </p>

            <ul className="flex flex-col gap-3">
                {AUTOMATED_STEPS.map((step) => (
                    <li key={step.title} className="border-line bg-surface flex items-start gap-3 rounded-lg border px-4 py-3.5">
                        <CheckCircle2 size={17} aria-hidden="true" className="text-success mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-1">
                            <strong className="text-body text-sm font-bold">{step.title}</strong>
                            <p className="text-body-muted text-sm">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
