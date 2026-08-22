export interface StagingStatistic {
    value: string;
    claim: string;
    source: string;
}

/**
 * Buyer-behaviour figures only. The outcome numbers (73% less time on market, 6-20% higher sale
 * price) substantiate the headline claim and belong to the hero proof strip; repeating them here
 * made the same two statistics appear twice on one page.
 */
export const statistics: StagingStatistic[] = [
    {
        value: '81%',
        claim: 'of buyers find it easier to picture a staged home as their own',
        source: 'National Association of Exclusive Buyer Agents',
    },
    {
        value: '48%',
        claim: 'of buyers are more likely to tour a staged home they found online',
        source: 'Zillow',
    },
];
