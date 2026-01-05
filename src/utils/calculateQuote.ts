/**
 * Calculate staging quote based on property details
 *
 * VACANT HOMES (New Tier-Based Pricing):
 * - Square footage determines base tier:
 *   - 800-1,100 sq ft: $1,700 base
 *   - 1,100-2,200 sq ft: $2,200 base
 *   - 2,200-3,000 sq ft: $2,600 base (includes 1 office)
 *   - 3,000-4,000 sq ft: $3,000 base (includes 1 office)
 * - Base includes: Entry, Kitchen, 2 Bedrooms, 2 Bathrooms
 * - Add-ons: Living Room $150, Dining Room $150
 * - Extra bedrooms/offices: $100/$200/$250 (tier-based)
 * - Extra bathrooms: $50 each
 * - Travel: 0-25mi included, 25-30mi $100, 30-35mi $150, 35-40mi $200, 40+ custom
 * - Outdoor: $200, Multi-floor: $200
 *
 * OCCUPIED HOMES (Legacy Pricing - unchanged):
 * - Base: $500 (Kitchen + Entryway)
 * - Per room pricing applies
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

export interface TierInfo {
    tier: number;
    tierName: string;
    sqftRange: string;
    includedRooms: string;
    includedBedrooms: number;
    includedBathrooms: number;
    includedOffices: number;
}

export interface QuoteBreakdown {
    // Core pricing
    basePrice: number;
    stagingType: 'vacant' | 'occupied';

    // For vacant - tier info
    tierInfo?: TierInfo;
    requiresCustomQuote: boolean;
    customQuoteReason?: string;

    // Room counts and pricing (for display)
    bedroomCount: number;
    bedroomRate: number;
    bedroomTotal: number;
    extraBedroomCount: number; // For vacant: only extras beyond included

    bathroomCount: number;
    bathroomRate: number;
    bathroomTotal: number;
    extraBathroomCount: number; // For vacant: only extras beyond 2 included

    livingAreaCount: number;
    livingAreaRate: number;
    livingAreaTotal: number;

    officeCount: number;
    officeRate: number;
    officeTotal: number;
    extraOfficeCount: number; // For vacant: only extras beyond included

    diningSpaceCount: number;
    diningSpaceRate: number;
    diningSpaceTotal: number;

    // Adjustments
    distanceAdjustment: number;
    multiFloorAdjustment: number;
    largeSquareFootageAdjustment: number; // Only for occupied
    outdoorAdjustment: number;

    // Totals
    totalEstimate: number;
    priceRange: {
        min: number;
        max: number;
    };
}

// Get tier info for vacant staging based on square footage
function getVacantTierInfo(sqft: number): TierInfo | null {
    if (sqft < 800) return null;
    if (sqft <= 1100) {
        return {
            tier: 1,
            tierName: 'Tier 1',
            sqftRange: '800-1,100 sq ft',
            includedRooms: 'Entry, Kitchen, 2 Bedrooms, 2 Bathrooms',
            includedBedrooms: 2,
            includedBathrooms: 2,
            includedOffices: 0,
        };
    }
    if (sqft <= 2200) {
        return {
            tier: 2,
            tierName: 'Tier 2',
            sqftRange: '1,100-2,200 sq ft',
            includedRooms: 'Entry, Kitchen, 2 Bedrooms, 2 Bathrooms',
            includedBedrooms: 2,
            includedBathrooms: 2,
            includedOffices: 0,
        };
    }
    if (sqft <= 3000) {
        return {
            tier: 3,
            tierName: 'Tier 3',
            sqftRange: '2,200-3,000 sq ft',
            includedRooms: 'Entry, Kitchen, 2 Bedrooms, 2 Bathrooms, 1 Office',
            includedBedrooms: 2,
            includedBathrooms: 2,
            includedOffices: 1,
        };
    }
    if (sqft <= 4000) {
        return {
            tier: 4,
            tierName: 'Tier 4',
            sqftRange: '3,000-4,000 sq ft',
            includedRooms: 'Entry, Kitchen, 2 Bedrooms, 2 Bathrooms, 1 Office',
            includedBedrooms: 2,
            includedBathrooms: 2,
            includedOffices: 1,
        };
    }
    return null; // Over 4000 not serviced
}

// Get base price for vacant tier
function getVacantBasePrice(tier: number): number {
    switch (tier) {
        case 1: return 1700;
        case 2: return 2200;
        case 3: return 2600;
        case 4: return 3000;
        default: return 0;
    }
}

// Get extra room rate for vacant (bedrooms/offices beyond included)
function getVacantExtraRoomRate(sqft: number): number {
    if (sqft <= 1100) return 100;
    if (sqft <= 2200) return 200;
    return 250; // 2200-4000
}

// Get travel fee for vacant staging
function getVacantTravelFee(distance: number): number | null {
    if (distance <= 25) return 0;
    if (distance <= 30) return 100;
    if (distance <= 35) return 150;
    if (distance <= 40) return 200;
    return null; // Over 40 miles not serviced
}

// Calculate quote for VACANT homes (new tier-based pricing)
function calculateVacantQuote(details: QuoteDetails): QuoteBreakdown {
    const tierInfo = getVacantTierInfo(details.squareFootage);
    const travelFee = getVacantTravelFee(details.distanceFromDowntown);

    // Check if requires custom quote
    if (!tierInfo || travelFee === null) {
        const reason = !tierInfo
            ? (details.squareFootage < 800
                ? 'Property under 800 sq ft requires custom quote'
                : 'Property over 4,000 sq ft requires custom quote')
            : 'Property over 40 miles from Sacramento requires custom quote';

        return {
            basePrice: 0,
            stagingType: 'vacant',
            tierInfo: undefined,
            requiresCustomQuote: true,
            customQuoteReason: reason,
            bedroomCount: details.bedrooms,
            bedroomRate: 0,
            bedroomTotal: 0,
            extraBedroomCount: 0,
            bathroomCount: details.bathrooms,
            bathroomRate: 0,
            bathroomTotal: 0,
            extraBathroomCount: 0,
            livingAreaCount: details.livingAreas,
            livingAreaRate: 0,
            livingAreaTotal: 0,
            officeCount: details.offices,
            officeRate: 0,
            officeTotal: 0,
            extraOfficeCount: 0,
            diningSpaceCount: details.diningSpaces,
            diningSpaceRate: 0,
            diningSpaceTotal: 0,
            distanceAdjustment: 0,
            multiFloorAdjustment: 0,
            largeSquareFootageAdjustment: 0,
            outdoorAdjustment: 0,
            totalEstimate: 0,
            priceRange: { min: 0, max: 0 },
        };
    }

    const basePrice = getVacantBasePrice(tierInfo.tier);
    const extraRoomRate = getVacantExtraRoomRate(details.squareFootage);

    // Living rooms - always $150 each (never included)
    const livingAreaRate = 150;
    const livingAreaTotal = details.livingAreas * livingAreaRate;

    // Dining rooms - always $150 each (never included)
    const diningSpaceRate = 150;
    const diningSpaceTotal = details.diningSpaces * diningSpaceRate;

    // Extra bedrooms - only charge for those beyond the 2 included
    const extraBedroomCount = Math.max(0, details.bedrooms - tierInfo.includedBedrooms);
    const bedroomTotal = extraBedroomCount * extraRoomRate;

    // Extra bathrooms - $50 each beyond the 2 included
    const extraBathroomCount = Math.max(0, details.bathrooms - tierInfo.includedBathrooms);
    const bathroomRate = 50;
    const bathroomTotal = extraBathroomCount * bathroomRate;

    // Extra offices - charge for those beyond included (0 for tier 1-2, 1 for tier 3-4)
    const extraOfficeCount = Math.max(0, details.offices - tierInfo.includedOffices);
    const officeTotal = extraOfficeCount * extraRoomRate;

    // Travel fee (tiered)
    const distanceAdjustment = travelFee;

    // Multi-floor fee: $200 (was $250)
    const multiFloorAdjustment = details.multiFloor ? 200 : 0;

    // Outdoor staging: $200 (was $250)
    const outdoorAdjustment = details.outdoorStaging ? 200 : 0;

    // No large home fee for vacant (handled by tiers, max 4000 sq ft)
    const largeSquareFootageAdjustment = 0;

    // Calculate total
    const totalEstimate = basePrice + livingAreaTotal + diningSpaceTotal +
        bedroomTotal + bathroomTotal + officeTotal +
        distanceAdjustment + multiFloorAdjustment + outdoorAdjustment;

    // Price range: ±$200 from exact price
    const priceRange = {
        min: totalEstimate - 200,
        max: totalEstimate + 200,
    };

    return {
        basePrice,
        stagingType: 'vacant',
        tierInfo,
        requiresCustomQuote: false,
        bedroomCount: details.bedrooms,
        bedroomRate: extraRoomRate,
        bedroomTotal,
        extraBedroomCount,
        bathroomCount: details.bathrooms,
        bathroomRate,
        bathroomTotal,
        extraBathroomCount,
        livingAreaCount: details.livingAreas,
        livingAreaRate,
        livingAreaTotal,
        officeCount: details.offices,
        officeRate: extraRoomRate,
        officeTotal,
        extraOfficeCount,
        diningSpaceCount: details.diningSpaces,
        diningSpaceRate,
        diningSpaceTotal,
        distanceAdjustment,
        multiFloorAdjustment,
        largeSquareFootageAdjustment,
        outdoorAdjustment,
        totalEstimate,
        priceRange,
    };
}

// Calculate quote for OCCUPIED homes (legacy pricing - unchanged)
function calculateOccupiedQuote(details: QuoteDetails): QuoteBreakdown {
    // Base price always includes kitchen + entryway
    const basePrice = 500;

    // Room pricing rates (original occupied rates)
    const bedroomRate = 250;
    const bathroomRate = 100;
    const livingAreaRate = 250;
    const officeRate = 100;
    const diningSpaceRate = 100;

    // Calculate room totals
    const bedroomTotal = details.bedrooms * bedroomRate;
    const bathroomTotal = details.bathrooms * bathroomRate;
    const livingAreaTotal = details.livingAreas * livingAreaRate;
    const officeTotal = details.offices * officeRate;
    const diningSpaceTotal = details.diningSpaces * diningSpaceRate;

    // Additional fees (original occupied logic)
    const distanceAdjustment = details.distanceFromDowntown > 20 ? 500 : 0;
    const multiFloorAdjustment = details.multiFloor ? 250 : 0;
    const largeSquareFootageAdjustment = details.squareFootage >= 3500 ? 1000 : 0;
    const outdoorAdjustment = details.outdoorStaging ? 250 : 0;

    // Calculate total
    const totalEstimate = basePrice + bedroomTotal + bathroomTotal +
        livingAreaTotal + officeTotal + diningSpaceTotal +
        distanceAdjustment + multiFloorAdjustment +
        largeSquareFootageAdjustment + outdoorAdjustment;

    // Price range: ±15% (original logic for occupied)
    const variance = 0.15;
    const priceRange = {
        min: Math.round((totalEstimate * (1 - variance)) / 100) * 100,
        max: Math.round((totalEstimate * (1 + variance)) / 100) * 100,
    };

    return {
        basePrice,
        stagingType: 'occupied',
        tierInfo: undefined,
        requiresCustomQuote: false,
        bedroomCount: details.bedrooms,
        bedroomRate,
        bedroomTotal,
        extraBedroomCount: details.bedrooms, // For occupied, all bedrooms are "extra" (charged)
        bathroomCount: details.bathrooms,
        bathroomRate,
        bathroomTotal,
        extraBathroomCount: details.bathrooms,
        livingAreaCount: details.livingAreas,
        livingAreaRate,
        livingAreaTotal,
        officeCount: details.offices,
        officeRate,
        officeTotal,
        extraOfficeCount: details.offices,
        diningSpaceCount: details.diningSpaces,
        diningSpaceRate,
        diningSpaceTotal,
        distanceAdjustment,
        multiFloorAdjustment,
        largeSquareFootageAdjustment,
        outdoorAdjustment,
        totalEstimate,
        priceRange,
    };
}

export function calculateStagingQuote(details: QuoteDetails): QuoteBreakdown {
    if (details.stagingType === 'occupied') {
        return calculateOccupiedQuote(details);
    }
    return calculateVacantQuote(details);
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}
