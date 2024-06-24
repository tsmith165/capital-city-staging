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
  Tailwind,
} from '@react-email/components';

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone: string;
  square_ft: number;
  staging_type: string;
  message: string;
}

const ContactFormEmail: React.FC<ContactFormEmailProps> = ({
  name,
  email,
  phone,
  square_ft,
  staging_type,
  message,
}) => {
  return (
    <Html>
      <Head />
      <Preview>New Contact Form Submission</Preview>
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
                accent_color: '#44403c',
                grey: '#D3D3D3',
              }
            },
          },
        }}
      >
        <Body className="w-full h-full">
          <Container className="bg-neutral-300 w-full h-full">
            <Heading className="text-2xl font-bold text-neutral-950 bg-secondary_light w-full h-fit p-4">
              {`${name} reached out`}
            </Heading>
            <Section className="p-2 flex-col space-y-0.5 px-4">
              <Text className="text-lg">
                <strong>Name:</strong> {name}
              </Text>
              <Text className="text-lg">  
                <strong>Email:</strong> {email}
              </Text>
              <Text className="text-lg">
                <strong>Phone:</strong> {phone}  
              </Text>
              <Text className="text-lg">
                <strong>Square Footage:</strong> {square_ft}
              </Text>
              <Text className="text-lg">
                <strong>Staging Type:</strong> {staging_type}
              </Text>
            </Section>
            <Section className="flex-col space-y-0.5 px-4">
              <Heading className="text-xl font-semibold text-secondary mb-2">
                Message:
              </Heading>
              <Text className="text-lg">{message}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ContactFormEmail;