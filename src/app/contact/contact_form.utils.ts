import { formatPrice, type QuoteBreakdown, type QuoteDetails } from '@/utils/calculateQuote';

type SubmissionDetails = QuoteDetails & { message?: string };

/**
 * The inbox stores one message per submission, but a quote request is only actionable with the
 * property details attached. This flattens both into the record so Mia can read a request without
 * needing the original email.
 */
export function buildSubmissionRecord(details: SubmissionDetails, quote: QuoteBreakdown): string {
    const estimate = quote.requiresCustomQuote
        ? `Custom quote required — ${quote.customQuoteReason}`
        : `${formatPrice(quote.priceRange.min)}–${formatPrice(quote.priceRange.max)} (estimate ${formatPrice(quote.totalEstimate)})`;

    const property = [
        `${details.squareFootage.toLocaleString()} sq ft, ${details.stagingType}`,
        `${details.bedrooms} bed / ${details.bathrooms} bath`,
        `${details.livingAreas} living, ${details.diningSpaces} dining, ${details.offices} office`,
        `${details.distanceFromDowntown} mi from downtown`,
        details.multiFloor ? 'multi-floor' : null,
        details.outdoorStaging ? 'outdoor staging' : null,
    ]
        .filter(Boolean)
        .join(' · ');

    const note = details.message?.trim();

    return [note || '(No message provided)', '', `Property: ${property}`, `Quote: ${estimate}`].join('\n');
}
