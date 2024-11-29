'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { sendContactFormEmail } from './actions';
import InputTextbox from '@/components/inputs/InputTextbox';
import InputSelect from '@/components/inputs/InputSelect';
import InputTextArea from '@/components/inputs/InputTextArea';

const schema = z.object({
    name: z.string().nonempty('Name is required'),
    email: z.string().email('Invalid email').nonempty('Email is required'),
    phone: z.string().nonempty('Phone number is required'),
    square_ft: z
        .number()
        .positive('Square footage must be a positive number')
        .nullable()
        .refine((val) => val !== null, 'Square footage is required'),
    type: z.enum(['vacant', 'occupied']),
    message: z.string().nonempty('Message is required'),
});

type FormData = z.infer<typeof schema>;

const ContactForm = () => {
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        square_ft: null,
        type: 'vacant',
        message: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
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

            setSubmitMessage({ type: 'success', message: 'Form submitted successfully' });
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
                setSubmitMessage({ type: 'error', message: 'An error occurred while submitting the form' });
            }
        }
    };

    if (!mounted) {
        return null; // Return null on server-side and first render
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-2">
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
                <InputTextbox idName="name" name="Name" value={formData.name} onChange={handleChange} placeholder="Enter full name" />
                <InputTextbox
                    idName="email"
                    name="Email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                />
            </div>
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
                <InputTextbox
                    idName="phone"
                    name="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your contact number"
                />
                <InputTextbox
                    idName="square_ft"
                    name="Sq Footage"
                    value={formData.square_ft === null ? '' : formData.square_ft.toString()}
                    onChange={handleChange}
                    placeholder="Enter your home's square footage"
                />
            </div>
            <div className="flex w-full">
                <InputSelect
                    idName="type"
                    name="Type"
                    value={formData.type}
                    onChange={handleChange}
                    defaultValue={{ value: 'vacant', label: 'Vacant' }}
                    select_options={[
                        ['vacant', 'Vacant'],
                        ['occupied', 'Occupied'],
                    ]}
                />
            </div>
            <InputTextArea idName="message" name="Message" value={formData.message} onChange={handleChange} rows={4} />
            {Object.entries(errors).map(([key, value]) => (
                <p key={key} className="text-sm text-red-500">
                    {value}
                </p>
            ))}
            <div className="flex items-center space-x-4">
                <button
                    type="submit"
                    className="rounded-md bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 px-4 py-2 font-bold text-stone-950 hover:bg-gradient-to-r hover:from-secondary hover:via-secondary_light hover:to-secondary hover:text-white"
                >
                    Send details to Mia!
                </button>
                {submitMessage && (
                    <p className={`text-sm ${submitMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                        {submitMessage.message}
                    </p>
                )}
            </div>
        </form>
    );
};

export default ContactForm;
