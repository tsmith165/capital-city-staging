import { describe, expect, it } from 'vitest';

import { calculateStagingQuote, formatPrice, type QuoteDetails } from '@/utils/calculateQuote';

const baseDetails: QuoteDetails = {
    squareFootage: 1500,
    bedrooms: 2,
    bathrooms: 2,
    livingAreas: 0,
    offices: 0,
    diningSpaces: 0,
    distanceFromDowntown: 10,
    outdoorStaging: false,
    multiFloor: false,
    stagingType: 'vacant',
};

const quoteFor = (overrides: Partial<QuoteDetails> = {}) => calculateStagingQuote({ ...baseDetails, ...overrides });

describe('calculateStagingQuote — vacant tiers', () => {
    it('places square footage in the correct tier at each boundary', () => {
        expect(quoteFor({ squareFootage: 800 }).tierInfo?.tier).toBe(1);
        expect(quoteFor({ squareFootage: 1100 }).tierInfo?.tier).toBe(1);
        expect(quoteFor({ squareFootage: 1101 }).tierInfo?.tier).toBe(2);
        expect(quoteFor({ squareFootage: 2200 }).tierInfo?.tier).toBe(2);
        expect(quoteFor({ squareFootage: 2201 }).tierInfo?.tier).toBe(3);
        expect(quoteFor({ squareFootage: 3000 }).tierInfo?.tier).toBe(3);
        expect(quoteFor({ squareFootage: 3001 }).tierInfo?.tier).toBe(4);
        expect(quoteFor({ squareFootage: 4000 }).tierInfo?.tier).toBe(4);
    });

    it('charges the tier base price when the property matches exactly what is included', () => {
        const quote = quoteFor();

        expect(quote.basePrice).toBe(2200);
        expect(quote.extraBedroomCount).toBe(0);
        expect(quote.extraBathroomCount).toBe(0);
        expect(quote.totalEstimate).toBe(2200);
        expect(quote.requiresCustomQuote).toBe(false);
    });

    it('bills only the rooms beyond the tier allowance', () => {
        const quote = quoteFor({ bedrooms: 3, livingAreas: 1, diningSpaces: 1 });

        // Tier 2 base 2200, one extra bedroom at 200, living 150, dining 150.
        expect(quote.extraBedroomCount).toBe(1);
        expect(quote.bedroomRate).toBe(200);
        expect(quote.totalEstimate).toBe(2700);
        expect(quote.priceRange).toEqual({ min: 2500, max: 2900 });
    });

    it('treats the first office as included from tier 3 up', () => {
        expect(quoteFor({ squareFootage: 1500, offices: 1 }).extraOfficeCount).toBe(1);
        expect(quoteFor({ squareFootage: 2500, offices: 1 }).extraOfficeCount).toBe(0);
    });

    it('accumulates every add-on into the total', () => {
        const quote = quoteFor({
            squareFootage: 2500,
            bedrooms: 4,
            bathrooms: 3,
            livingAreas: 2,
            offices: 2,
            diningSpaces: 1,
            distanceFromDowntown: 32,
            multiFloor: true,
            outdoorStaging: true,
        });

        // 2600 base + 300 living + 150 dining + 500 bedrooms + 50 bathroom
        // + 250 office + 150 travel + 200 multi-floor + 200 outdoor.
        expect(quote.totalEstimate).toBe(4400);
    });

    it('applies travel fees by distance band', () => {
        expect(quoteFor({ distanceFromDowntown: 25 }).distanceAdjustment).toBe(0);
        expect(quoteFor({ distanceFromDowntown: 30 }).distanceAdjustment).toBe(100);
        expect(quoteFor({ distanceFromDowntown: 35 }).distanceAdjustment).toBe(150);
        expect(quoteFor({ distanceFromDowntown: 40 }).distanceAdjustment).toBe(200);
    });
});

describe('calculateStagingQuote — vacant custom-quote fallbacks', () => {
    it('requires a custom quote below the serviced square footage', () => {
        const quote = quoteFor({ squareFootage: 700 });

        expect(quote.requiresCustomQuote).toBe(true);
        expect(quote.customQuoteReason).toBe('Property under 800 sq ft requires custom quote');
        expect(quote.totalEstimate).toBe(0);
    });

    it('requires a custom quote above the serviced square footage', () => {
        const quote = quoteFor({ squareFootage: 4001 });

        expect(quote.requiresCustomQuote).toBe(true);
        expect(quote.customQuoteReason).toBe('Property over 4,000 sq ft requires custom quote');
    });

    it('requires a custom quote beyond the travel radius', () => {
        const quote = quoteFor({ distanceFromDowntown: 41 });

        expect(quote.requiresCustomQuote).toBe(true);
        expect(quote.customQuoteReason).toBe('Property over 40 miles from Sacramento requires custom quote');
    });
});

describe('calculateStagingQuote — occupied homes', () => {
    it('bills every room, since nothing is included beyond kitchen and entryway', () => {
        const quote = quoteFor({
            stagingType: 'occupied',
            squareFootage: 2000,
            bedrooms: 3,
            bathrooms: 2,
            livingAreas: 1,
            offices: 1,
            diningSpaces: 1,
            distanceFromDowntown: 25,
        });

        // 500 base + 750 bedrooms + 200 bathrooms + 250 living + 100 office
        // + 100 dining + 500 distance surcharge.
        expect(quote.basePrice).toBe(500);
        expect(quote.totalEstimate).toBe(2400);
        expect(quote.extraBedroomCount).toBe(3);
        expect(quote.tierInfo).toBeUndefined();
    });

    it('rounds its price range to the nearest hundred', () => {
        const quote = quoteFor({
            stagingType: 'occupied',
            squareFootage: 2000,
            bedrooms: 3,
            bathrooms: 2,
            livingAreas: 1,
            offices: 1,
            diningSpaces: 1,
            distanceFromDowntown: 25,
        });

        expect(quote.priceRange).toEqual({ min: 2000, max: 2800 });
    });

    it('adds the large-home surcharge that vacant pricing does not use', () => {
        const occupied = quoteFor({ stagingType: 'occupied', squareFootage: 3500 });
        const vacant = quoteFor({ squareFootage: 3500 });

        expect(occupied.largeSquareFootageAdjustment).toBe(1000);
        expect(vacant.largeSquareFootageAdjustment).toBe(0);
    });
});

describe('formatPrice', () => {
    it('renders whole-dollar USD', () => {
        expect(formatPrice(2700)).toBe('$2,700');
        expect(formatPrice(0)).toBe('$0');
    });
});
