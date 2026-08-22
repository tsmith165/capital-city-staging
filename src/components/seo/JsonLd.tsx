/**
 * Structured data was previously placed inside `next/head`, which the App Router ignores, so
 * none of it ever reached the page. In the App Router the script is rendered inline instead.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            // `<` is escaped so a string in the data can never close the script element early.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
        />
    );
}
