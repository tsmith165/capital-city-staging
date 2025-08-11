/**
 * Calculate staging quote based on property details
 * 
 * Room-Based Pricing Structure:
 * - Base package always includes: Kitchen + Entryway
 * - Per room pricing:
 *   - Bedrooms: $250 occupied / $500 vacant
 *   - Bathrooms: $100 (same for both)
 *   - Living Areas: $250 occupied / $500 vacant
 *   - Offices: $100 occupied / $250 vacant
 *   - Dining Spaces: $100 occupied / $250 vacant
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
    bathrooms: number;
    livingAreas: number;
    offices: number;
    diningSpaces: number;
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
    bathroomCount: number;
    bathroomRate: number;
    bathroomTotal: number;
    livingAreaCount: number;
    livingAreaRate: number;
    livingAreaTotal: number;
    officeCount: number;
    officeRate: number;
    officeTotal: number;
    diningSpaceCount: number;
    diningSpaceRate: number;
    diningSpaceTotal: number;
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
    
    // Base price always includes kitchen + entryway
    const basePrice = isOccupied ? 500 : 800;
    
    // Room pricing rates
    const bedroomRate = isOccupied ? 250 : 500;
    const bathroomRate = 100; // Same for both occupied and vacant
    const livingAreaRate = isOccupied ? 250 : 500;
    const officeRate = isOccupied ? 100 : 250;
    const diningSpaceRate = isOccupied ? 100 : 250;
    
    // Calculate room totals
    const bedroomCount = details.bedrooms;
    const bedroomTotal = bedroomCount * bedroomRate;
    
    const bathroomCount = details.bathrooms;
    const bathroomTotal = bathroomCount * bathroomRate;
    
    const livingAreaCount = details.livingAreas;
    const livingAreaTotal = livingAreaCount * livingAreaRate;
    
    const officeCount = details.offices;
    const officeTotal = officeCount * officeRate;
    
    const diningSpaceCount = details.diningSpaces;
    const diningSpaceTotal = diningSpaceCount * diningSpaceRate;
    
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
    const totalEstimate = basePrice + bedroomTotal + bathroomTotal + livingAreaTotal + officeTotal + diningSpaceTotal + distanceAdjustment + multiFloorAdjustment + largeSquareFootageAdjustment + outdoorAdjustment;

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
        bathroomCount,
        bathroomRate,
        bathroomTotal,
        livingAreaCount,
        livingAreaRate,
        livingAreaTotal,
        officeCount,
        officeRate,
        officeTotal,
        diningSpaceCount,
        diningSpaceRate,
        diningSpaceTotal,
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