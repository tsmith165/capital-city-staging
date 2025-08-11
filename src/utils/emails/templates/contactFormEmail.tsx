import React from 'react';
import { 
  Html, 
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
  Row,
  Column,
  Tailwind,
} from '@react-email/components';

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
              }
            },
          },
        }}
      >
        <Body className="bg-stone-100 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-2xl">
            
            {/* Header */}
            <Section className="text-center mb-6">
              <Heading className="text-3xl font-bold text-primary mb-2">
                Your Staging Estimate
              </Heading>
              <Text className="text-sm text-gray-600 m-0">
                Prepared on {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </Section>

            {/* Customer Information */}
            <Section className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <Heading className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Customer Information
              </Heading>
              
              <Row>
                <Column>
                  <Text className="text-sm text-gray-600 m-0 mb-1">Name</Text>
                  <Text className="text-base font-semibold text-gray-800 m-0 mb-3">{name}</Text>
                </Column>
              </Row>

              <Row>
                <Column width="50%">
                  <Text className="text-sm text-gray-600 m-0 mb-1">Email</Text>
                  <Link href={`mailto:${email}`} className="text-base text-primary font-medium">
                    {email}
                  </Link>
                </Column>
                <Column width="50%">
                  <Text className="text-sm text-gray-600 m-0 mb-1">Phone</Text>
                  <Link href={`tel:${phone}`} className="text-base text-primary font-medium">
                    {phone}
                  </Link>
                </Column>
              </Row>

              {message && (
                <Row className="mt-4">
                  <Column>
                    <Text className="text-sm text-gray-600 m-0 mb-1">Message</Text>
                    <Text className="text-base text-gray-700 leading-6 whitespace-pre-wrap m-0 bg-gray-50 p-3 rounded">
                      {message}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Property Details */}
            <Section className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <Heading className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Property Details
              </Heading>
              
              <Row className="mb-3">
                <Column width="50%">
                  <Text className="text-sm text-gray-600 m-0 mb-1">Square Footage</Text>
                  <Text className="text-base font-semibold text-gray-800 m-0">{squareFootage.toLocaleString()} sq ft</Text>
                </Column>
                <Column width="50%">
                  <Text className="text-sm text-gray-600 m-0 mb-1">Distance from Downtown</Text>
                  <Text className="text-base font-semibold text-gray-800 m-0">{distanceFromDowntown} miles</Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column width="50%">
                  <Text className="text-sm text-gray-600 m-0 mb-1">Staging Type</Text>
                  <Text className="text-base font-semibold text-gray-800 m-0 capitalize">{stagingType} Home</Text>
                </Column>
                <Column width="50%">
                  <Text className="text-sm text-gray-600 m-0 mb-1">Room Counts</Text>
                  <Text className="text-base font-semibold text-gray-800 m-0">
                    {bedrooms} BR • {bathrooms} BA • {livingAreas} Living • {offices} Office • {diningSpaces} Dining
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column>
                  <Text className="text-sm text-gray-600 m-0 mb-2">Additional Features</Text>
                  <div>
                    {outdoorStaging && (
                      <Text className="text-sm bg-secondary text-white p-2 rounded inline-block mr-2 mb-1">
                        Outdoor Staging
                      </Text>
                    )}
                    {multiFloor && (
                      <Text className="text-sm bg-secondary text-white p-2 rounded inline-block mr-2 mb-1">
                        Multi-Floor
                      </Text>
                    )}
                    {!outdoorStaging && !multiFloor && (
                      <Text className="text-sm text-gray-500 m-0">None</Text>
                    )}
                  </div>
                </Column>
              </Row>
            </Section>

            {/* Quote Breakdown */}
            {quote && (
              <Section className="bg-gradient-to-r from-primary/5 to-primary_dark/5 rounded-lg border-2 border-primary p-6 mb-6">
                <Heading className="text-xl font-semibold text-gray-800 mb-4 border-b border-primary/30 pb-2">
                  💰 Estimated Quote Breakdown
                </Heading>
                
                <div className="space-y-2 mb-4">
                  <Row>
                    <Column width="70%">
                      <Text className="text-sm text-gray-600 m-0">Base Package ({stagingType}):</Text>
                      <Text className="text-xs text-gray-500 m-0">Kitchen + entryway</Text>
                    </Column>
                    <Column width="30%" align="right">
                      <Text className="text-sm font-semibold text-gray-800 m-0">{formatPrice(quote.basePrice)}</Text>
                    </Column>
                  </Row>

                  {quote.bedroomTotal > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Bedrooms ({quote.bedroomCount} × {formatPrice(quote.bedroomRate)}):</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">{formatPrice(quote.bedroomTotal)}</Text>
                      </Column>
                    </Row>
                  )}

                  {quote.bathroomTotal > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Bathrooms ({quote.bathroomCount} × {formatPrice(quote.bathroomRate)}):</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">{formatPrice(quote.bathroomTotal)}</Text>
                      </Column>
                    </Row>
                  )}

                  {quote.livingAreaTotal > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Living Areas ({quote.livingAreaCount} × {formatPrice(quote.livingAreaRate)}):</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">{formatPrice(quote.livingAreaTotal)}</Text>
                      </Column>
                    </Row>
                  )}

                  {quote.officeTotal > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Home Offices ({quote.officeCount} × {formatPrice(quote.officeRate)}):</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">{formatPrice(quote.officeTotal)}</Text>
                      </Column>
                    </Row>
                  )}

                  {quote.diningSpaceTotal > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Dining Spaces ({quote.diningSpaceCount} × {formatPrice(quote.diningSpaceRate)}):</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">{formatPrice(quote.diningSpaceTotal)}</Text>
                      </Column>
                    </Row>
                  )}

                  {quote.outdoorAdjustment > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Outdoor Staging:</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">+{formatPrice(quote.outdoorAdjustment)}</Text>
                      </Column>
                    </Row>
                  )}

                  {quote.distanceAdjustment > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Distance Fee ({'>'}20 miles):</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">+{formatPrice(quote.distanceAdjustment)}</Text>
                      </Column>
                    </Row>
                  )}

                  {quote.multiFloorAdjustment > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Multi-Floor Fee:</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">+{formatPrice(quote.multiFloorAdjustment)}</Text>
                      </Column>
                    </Row>
                  )}

                  {quote.largeSquareFootageAdjustment > 0 && (
                    <Row>
                      <Column width="70%">
                        <Text className="text-sm text-gray-600 m-0">Very Large Home Fee (3500{'+'}  sq ft):</Text>
                      </Column>
                      <Column width="30%" align="right">
                        <Text className="text-sm font-semibold text-gray-800 m-0">+{formatPrice(quote.largeSquareFootageAdjustment)}</Text>
                      </Column>
                    </Row>
                  )}
                </div>

                <Hr className="border-primary/30 my-4" />
                
                <Row className="mb-2">
                  <Column width="70%">
                    <Text className="text-base font-bold text-gray-800 m-0">Estimated Total:</Text>
                  </Column>
                  <Column width="30%" align="right">
                    <Text className="text-xl font-bold text-primary m-0">{formatPrice(quote.totalEstimate)}</Text>
                  </Column>
                </Row>

                <Row>
                  <Column width="70%">
                    <Text className="text-sm text-gray-600 m-0">Expected Range:</Text>
                  </Column>
                  <Column width="30%" align="right">
                    <Text className="text-sm text-gray-600 m-0">
                      {formatPrice(quote.priceRange.min)} - {formatPrice(quote.priceRange.max)}
                    </Text>
                  </Column>
                </Row>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <Text className="text-sm text-amber-800 m-0 leading-relaxed">
                    ⚠️ <strong>Important:</strong> This is an automated estimate only. Final pricing will be confirmed after reviewing property details and conducting a walkthrough consultation.
                  </Text>
                </div>
              </Section>
            )}

            {/* What Happens Next */}
            <Section className="bg-secondary rounded-lg p-6">
              <Heading className="text-lg font-semibold mb-3 text-white">
                ✨ What Happens Next
              </Heading>
              <Text className="text-sm text-white mb-2">
                <strong>1. Within 24 hours:</strong> Mia will contact you to discuss your staging needs and timeline
              </Text>
              <Text className="text-sm text-white mb-2">
                <strong>2. Property walkthrough:</strong> Schedule a visit to see your home and finalize pricing
              </Text>
              <Text className="text-sm text-white mb-2">
                <strong>3. Custom proposal:</strong> Receive a detailed plan with timeline and services
              </Text>
              <Text className="text-sm text-white m-0">
                <strong>4. Transform your home:</strong> Begin staging to maximize your home's appeal
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center mt-8">
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