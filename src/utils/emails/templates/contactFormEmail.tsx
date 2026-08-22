import React from 'react';
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Link, Hr, Row, Column, Tailwind } from '@react-email/components';

interface QuoteBreakdown {
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

interface ContactFormEmailProps {
    name: string;
    email: string;
    phone: string;
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
    message: string;
    quote?: QuoteBreakdown;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

const ContactFormEmail: React.FC<ContactFormEmailProps> = ({
    name,
    email,
    phone,
    squareFootage,
    bedrooms,
    bathrooms,
    livingAreas,
    offices,
    diningSpaces,
    distanceFromDowntown,
    outdoorStaging,
    multiFloor,
    stagingType,
    message,
    quote,
}) => {
    return (
        <Html>
            <Head />
            <Preview>New Staging Quote Request from {name}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                primary: '#b99727',
                                primary_dark: '#d4af37',
                                secondary_light: '#498352',
                                secondary: '#355e3b',
                                secondary_dark: '#2c4e31',
                            },
                        },
                    },
                }}
            >
                <Body className="bg-stone-100 font-sans">
                    <Container className="mx-auto max-w-2xl px-4 py-8">
                        {/* Header */}
                        <Section className="mb-6 text-center">
                            <Heading className="text-primary mb-2 text-3xl font-bold">Your Staging Estimate</Heading>
                            <Text className="m-0 text-sm text-gray-600">
                                Prepared on{' '}
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Text>
                        </Section>

                        {/* Customer Information */}
                        <Section className="mb-6 rounded-lg bg-white p-6 shadow-lg">
                            <Heading className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-800">
                                Customer Information
                            </Heading>

                            <Row>
                                <Column>
                                    <Text className="m-0 mb-1 text-sm text-gray-600">Name</Text>
                                    <Text className="m-0 mb-3 text-base font-semibold text-gray-800">{name}</Text>
                                </Column>
                            </Row>

                            <Row>
                                <Column width="50%">
                                    <Text className="m-0 mb-1 text-sm text-gray-600">Email</Text>
                                    <Link href={`mailto:${email}`} className="text-primary text-base font-medium">
                                        {email}
                                    </Link>
                                </Column>
                                <Column width="50%">
                                    <Text className="m-0 mb-1 text-sm text-gray-600">Phone</Text>
                                    <Link href={`tel:${phone}`} className="text-primary text-base font-medium">
                                        {phone}
                                    </Link>
                                </Column>
                            </Row>

                            {message && (
                                <Row className="mt-4">
                                    <Column>
                                        <Text className="m-0 mb-1 text-sm text-gray-600">Message</Text>
                                        <Text className="m-0 rounded bg-gray-50 p-3 text-base leading-6 whitespace-pre-wrap text-gray-700">
                                            {message}
                                        </Text>
                                    </Column>
                                </Row>
                            )}
                        </Section>

                        {/* Property Details */}
                        <Section className="mb-6 rounded-lg bg-white p-6 shadow-lg">
                            <Heading className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-800">
                                Property Details
                            </Heading>

                            <Row className="mb-3">
                                <Column width="50%">
                                    <Text className="m-0 mb-1 text-sm text-gray-600">Square Footage</Text>
                                    <Text className="m-0 text-base font-semibold text-gray-800">
                                        {squareFootage.toLocaleString()} sq ft
                                    </Text>
                                </Column>
                                <Column width="50%">
                                    <Text className="m-0 mb-1 text-sm text-gray-600">Distance from Downtown</Text>
                                    <Text className="m-0 text-base font-semibold text-gray-800">{distanceFromDowntown} miles</Text>
                                </Column>
                            </Row>

                            <Row className="mb-3">
                                <Column width="50%">
                                    <Text className="m-0 mb-1 text-sm text-gray-600">Staging Type</Text>
                                    <Text className="m-0 text-base font-semibold text-gray-800 capitalize">{stagingType} Home</Text>
                                </Column>
                                <Column width="50%">
                                    <Text className="m-0 mb-1 text-sm text-gray-600">Room Counts</Text>
                                    <Text className="m-0 text-base font-semibold text-gray-800">
                                        {bedrooms} BR • {bathrooms} BA • {livingAreas} Living • {offices} Office • {diningSpaces} Dining
                                    </Text>
                                </Column>
                            </Row>

                            <Row>
                                <Column>
                                    <Text className="m-0 mb-2 text-sm text-gray-600">Additional Features</Text>
                                    <div>
                                        {outdoorStaging && (
                                            <Text className="bg-secondary mr-2 mb-1 inline-block rounded p-2 text-sm text-white">
                                                Outdoor Staging
                                            </Text>
                                        )}
                                        {multiFloor && (
                                            <Text className="bg-secondary mr-2 mb-1 inline-block rounded p-2 text-sm text-white">
                                                Multi-Floor
                                            </Text>
                                        )}
                                        {!outdoorStaging && !multiFloor && <Text className="m-0 text-sm text-gray-500">None</Text>}
                                    </div>
                                </Column>
                            </Row>
                        </Section>

                        {/* Quote Breakdown */}
                        {quote && (
                            <Section className="from-primary/5 to-primary_dark/5 border-primary mb-6 rounded-lg border-2 bg-gradient-to-r p-6">
                                <Heading className="border-primary/30 mb-4 border-b pb-2 text-xl font-semibold text-gray-800">
                                    💰 Estimated Quote Breakdown
                                </Heading>

                                <div className="mb-4 space-y-2">
                                    <Row>
                                        <Column width="70%">
                                            <Text className="m-0 text-sm text-gray-600">Base Package ({stagingType}):</Text>
                                            <Text className="m-0 text-xs text-gray-500">Kitchen + entryway</Text>
                                        </Column>
                                        <Column width="30%" align="right">
                                            <Text className="m-0 text-sm font-semibold text-gray-800">{formatPrice(quote.basePrice)}</Text>
                                        </Column>
                                    </Row>

                                    {quote.bedroomTotal > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">
                                                    Bedrooms ({quote.bedroomCount} × {formatPrice(quote.bedroomRate)}):
                                                </Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    {formatPrice(quote.bedroomTotal)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}

                                    {quote.bathroomTotal > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">
                                                    Bathrooms ({quote.bathroomCount} × {formatPrice(quote.bathroomRate)}):
                                                </Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    {formatPrice(quote.bathroomTotal)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}

                                    {quote.livingAreaTotal > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">
                                                    Living Areas ({quote.livingAreaCount} × {formatPrice(quote.livingAreaRate)}):
                                                </Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    {formatPrice(quote.livingAreaTotal)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}

                                    {quote.officeTotal > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">
                                                    Home Offices ({quote.officeCount} × {formatPrice(quote.officeRate)}):
                                                </Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    {formatPrice(quote.officeTotal)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}

                                    {quote.diningSpaceTotal > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">
                                                    Dining Spaces ({quote.diningSpaceCount} × {formatPrice(quote.diningSpaceRate)}):
                                                </Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    {formatPrice(quote.diningSpaceTotal)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}

                                    {quote.outdoorAdjustment > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">Outdoor Staging:</Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    +{formatPrice(quote.outdoorAdjustment)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}

                                    {quote.distanceAdjustment > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">Distance Fee ({'>'}20 miles):</Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    +{formatPrice(quote.distanceAdjustment)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}

                                    {quote.multiFloorAdjustment > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">Multi-Floor Fee:</Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    +{formatPrice(quote.multiFloorAdjustment)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}

                                    {quote.largeSquareFootageAdjustment > 0 && (
                                        <Row>
                                            <Column width="70%">
                                                <Text className="m-0 text-sm text-gray-600">Very Large Home Fee (3500{'+'} sq ft):</Text>
                                            </Column>
                                            <Column width="30%" align="right">
                                                <Text className="m-0 text-sm font-semibold text-gray-800">
                                                    +{formatPrice(quote.largeSquareFootageAdjustment)}
                                                </Text>
                                            </Column>
                                        </Row>
                                    )}
                                </div>

                                <Hr className="border-primary/30 my-4" />

                                <Row>
                                    <Column>
                                        <div style={{ textAlign: 'center' }}>
                                            <Text className="m-0 mb-2 text-sm text-gray-500 uppercase" style={{ letterSpacing: '0.05em' }}>
                                                Estimated Price Range
                                            </Text>
                                            <Text className="text-primary m-0 text-2xl font-bold">
                                                {formatPrice(quote.priceRange.min)} - {formatPrice(quote.priceRange.max)}
                                            </Text>
                                            <Text className="m-0 mt-2 text-xs text-gray-500">
                                                Final pricing determined after consultation
                                            </Text>
                                        </div>
                                    </Column>
                                </Row>

                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <Text className="m-0 text-sm leading-relaxed text-amber-800">
                                        ⚠️ <strong>Important:</strong> This is an automated estimate only. Final pricing will be confirmed
                                        after reviewing property details and conducting a walkthrough consultation.
                                    </Text>
                                </div>
                            </Section>
                        )}

                        {/* What Happens Next */}
                        <Section className="bg-secondary rounded-lg p-6">
                            <Heading className="mb-3 text-lg font-semibold text-white">✨ What Happens Next</Heading>
                            <Text className="mb-2 text-sm text-white">
                                <strong>1. Within 24 hours:</strong> Mia will contact you to discuss your staging needs and timeline
                            </Text>
                            <Text className="mb-2 text-sm text-white">
                                <strong>2. Property walkthrough:</strong> Schedule a visit to see your home and finalize pricing
                            </Text>
                            <Text className="mb-2 text-sm text-white">
                                <strong>3. Custom proposal:</strong> Receive a detailed plan with timeline and services
                            </Text>
                            <Text className="m-0 text-sm text-white">
                                <strong>4. Transform your home:</strong> Begin staging to maximize your home's appeal
                            </Text>
                        </Section>

                        {/* Footer */}
                        <Section className="mt-8 text-center">
                            <Text className="text-xs text-gray-500">
                                This email was sent from the Capital City Staging contact form.
                                <br />
                                For questions, contact: mdofflemyer.realestate@gmail.com
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ContactFormEmail;
