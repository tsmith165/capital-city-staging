import React from 'react';

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
    <html>
      <head>
        <style>{`/* Add your custom Tailwind CSS styles here */`}</style>
      </head>
      <body>
        <h1 className="text-2xl font-bold mb-4">New Contact Form Submission</h1>
        <p>Name: {name}</p>
        <p>Email: {email}</p>
        <p>Phone: {phone}</p>
        <p>Square Footage: {square_ft}</p>
        <p>Staging Type: {staging_type}</p>
        <p>Message: {message}</p>
      </body>
    </html>
  );
};

export default ContactFormEmail;
