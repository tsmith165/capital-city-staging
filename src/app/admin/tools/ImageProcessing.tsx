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
            <p className="text-sm text-body-muted">
                Nothing to run here. Both jobs happen during upload, which is why the buttons that used to be on this page are
                gone rather than disabled.
            </p>

            <ul className="flex flex-col gap-3">
                {AUTOMATED_STEPS.map((step) => (
                    <li key={step.title} className="flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3.5">
                        <CheckCircle2 size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
                        <div className="flex flex-col gap-1">
                            <strong className="text-sm font-bold text-body">{step.title}</strong>
                            <p className="text-sm text-body-muted">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
