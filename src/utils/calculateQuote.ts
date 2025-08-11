/**
 * Calculate staging quote based on property details
 * 
 * Base Pricing Structure:
 * - Base price: $1000 occupied / $1500 vacant (includes kitchen, living room, entryway)
 * - Per bedroom: $500 occupied / $750 vacant
 * 
 * Adjustments:
 * - Distance >20 miles from downtown Sacramento: +$500
 * - Multi-floor home (2+ stories): +$250
 * - Very large homes (3500+ sq ft): +$1000
 * - Outdoor staging: +$250
 */

export interface QuoteDetails {
    squareFootage: number;
    bedrooms: number;
    distanceFromDowntown: number;
    outdoorStaging: boolean;
    multiFloor: boolean;
    stagingType: 'vacant' | 'occupied';
}

export interface QuoteBreakdown {
    basePrice: number;
    bedroomCount: number;
    bedroomRate: number;
    bedroomTotal: number;
    distanceAdjustment: number;
    multiFloorAdjustment: number;
    largeSquareFootageAdjustment: number;
    outdoorAdjustment: number;
    totalEstimate: number;
    priceRange: {
        min: number;
        max: number;
    };
}

export function calculateStagingQuote(details: QuoteDetails): QuoteBreakdown {
    const isOccupied = details.stagingType === 'occupied';
    
    // Base price (includes kitchen, living room, entryway)
    const basePrice = isOccupied ? 1000 : 1500;
    
    // Per bedroom pricing
    const bedroomRate = isOccupied ? 500 : 750;
    const bedroomCount = details.bedrooms;
    const bedroomTotal = bedroomCount * bedroomRate;
    
    // Additional fees
    let distanceAdjustment = 0;
    if (details.distanceFromDowntown > 20) {
        distanceAdjustment = 500;
    }

    let multiFloorAdjustment = 0;
    if (details.multiFloor) {
        multiFloorAdjustment = 250;
    }

    let largeSquareFootageAdjustment = 0;
    if (details.squareFootage >= 3500) {
        largeSquareFootageAdjustment = 1000;
    }

    let outdoorAdjustment = 0;
    if (details.outdoorStaging) {
        outdoorAdjustment = 250;
    }

    // Calculate total
    const totalEstimate = basePrice + bedroomTotal + distanceAdjustment + multiFloorAdjustment + largeSquareFootageAdjustment + outdoorAdjustment;

    // Calculate price range (±15% for estimate variance) with rounded values
    const variance = 0.15;
    const minEstimate = totalEstimate * (1 - variance);
    const maxEstimate = totalEstimate * (1 + variance);
    
    // Round to nearest $100 for cleaner appearance
    const priceRange = {
        min: Math.round(minEstimate / 100) * 100,
        max: Math.round(maxEstimate / 100) * 100
    };

    return {
        basePrice,
        bedroomCount,
        bedroomRate,
        bedroomTotal,
        distanceAdjustment,
        multiFloorAdjustment,
        largeSquareFootageAdjustment,
        outdoorAdjustment,
        totalEstimate,
        priceRange
    };
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}