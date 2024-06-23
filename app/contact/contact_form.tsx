'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { sendContactFormEmail } from './actions';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputTextArea from '@/components/inputs/InputTextArea';

const schema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email('Invalid email').nonempty('Email is required'),
  phone: z.string().nonempty('Phone number is required'),
  square_ft: z.number().positive('Square footage must be a positive number').nullable().refine((val) => val !== null, 'Square footage is required'),
  type: z.enum(['vacant', 'occupied']),
  message: z.string().nonempty('Message is required')
});

type FormData = z.infer<typeof schema>;

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    square_ft: null,
    type: 'vacant',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'square_ft' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      schema.parse(formData);
      setErrors({});

      const response = await sendContactFormEmail(formData);

      if (!response.success) {
        throw new Error('Failed to submit form');
      }

      alert('Form submitted successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        square_ft: null,
        type: 'vacant',
        message: '',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error('Error submitting form:', error);
        alert('An error occurred while submitting the form');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-2">
      <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
        <InputTextbox
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
        />
        <InputTextbox
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
        />
      </div>
      <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
        <InputTextbox
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />
        <InputTextbox
          name="square_ft"
          value={formData.square_ft === null ? '' : `${formData.square_ft.toString()}`}
          onChange={handleChange}
          placeholder="Enter square footage"
        />
      </div>
      <div className="flex w-full">
        <InputSelect
          name="type"
          value={formData.type}
          onChange={handleChange}
          select_options={[
            ['vacant', 'Vacant'],
            ['occupied', 'Occupied'],
          ]}
        />
      </div>
      <InputTextArea
        name="message"
        value={formData.message}
        onChange={handleChange}
        rows={4}
      />
      {Object.entries(errors).map(([key, value]) => (
        <p key={key} className="text-red-500 text-sm">{value}</p>
      ))}
      <button
        type="submit"
        className="px-4 py-2 font-bold text-white bg-primary rounded-md hover:bg-primary_dark focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Submit
      </button>
    </form>
  );
};

export default ContactForm;
