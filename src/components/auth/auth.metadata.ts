import type { Metadata } from 'next';

/**
 * The sign-in, sign-up and profile routes each shipped a thirty-line metadata block
 * describing JWS Fine Art, including icons and an OG image that do not exist in this repo.
 * Authentication screens only need a title and to stay out of search.
 */
export function authMetadata(title: string, description: string): Metadata {
    return {
        title,
        description,
        robots: { index: false, follow: false },
    };
}
