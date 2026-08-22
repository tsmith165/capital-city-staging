import type { Metadata } from 'next';

/**
 * Admin pages previously each carried a copied 30-line metadata block, one of which still
 * described a different business entirely. They only need a title and to stay out of search.
 */
export function adminMetadata(title: string, description: string): Metadata {
    return {
        title,
        description,
        robots: { index: false, follow: false },
    };
}
