'use client';

import React, { useState, useEffect } from 'react';

// Custom slider styles
const sliderStyles = `
  .custom-slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #355e3b;
    border: 2px solid #fff;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .custom-slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #355e3b;
    border: 2px solid #fff;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
`;

if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = sliderStyles;
    document.head.appendChild(styleElement);
}
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { sendContactFormEmail } from './actions';
import { calculateStagingQuote, formatPrice, type QuoteDetails } from '@/utils/calculateQuote';
import { Calculator, Send, CheckCircle, AlertCircle, Info, Ruler, Bed, MapPin, Trees, Building, Home, Users, Bath, Sofa, Briefcase, UtensilsCrossed } from 'lucide-react';

const schema = z.object({
    name: z.string().nonempty('Name is required'),
    email: z.string().email('Invalid email').nonempty('Email is required'),
    phone: z.string().nonempty('Phone number is required'),
    squareFootage: z
        .number()
        .positive('Square footage must be positive')
        .min(500, 'Square footage seems too small')
        .max(10000, 'Square footage seems too large'),
    bedrooms: z.number().min(0, 'Number of bedrooms must be 0 or more').max(10, 'Maximum 10 bedrooms'),
    bathrooms: z.number().min(0, 'Number of bathrooms must be 0 or more').max(10, 'Maximum 10 bathrooms'),
    livingAreas: z.number().min(0, 'Number of living areas must be 0 or more').max(10, 'Maximum 10 living areas'),
    offices: z.number().min(0, 'Number of offices must be 0 or more').max(5, 'Maximum 5 offices'),
    diningSpaces: z.number().min(0, 'Number of dining spaces must be 0 or more').max(5, 'Maximum 5 dining spaces'),
    distanceFromDowntown: z.number().min(0, 'Distance must be positive').max(100, 'Distance seems too far'),
    outdoorStaging: z.boolean(),
    multiFloor: z.boolean(),
    stagingType: z.enum(['vacant', 'occupied']),
    message: z.string().nonempty('Message is required'),
});

type FormData = z.infer<typeof schema>;

// Custom Toggle Component
const Toggle = ({
    enabled,
    onChange,
    label,
    icon,
}: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
    icon: React.ReactNode;
}) => (
    <div className="flex items-center gap-4 rounded-lg border border-stone-600 bg-stone-700/50 p-4">
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-secondary' : 'bg-stone-600'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
        <div className="flex items-center gap-3">
            <div className="text-primary">{icon}</div>
            <span className="font-medium text-stone-300">{label}</span>
        </div>
    </div>
);

// Custom Slider Component
const Slider = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    label,
    icon,
    formatValue,
}: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    label: string;
    icon: React.ReactNode;
    formatValue?: (value: number) => string;
}) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="text-primary">{icon}</div>
                <span className="font-medium text-stone-300">{label}</span>
            </div>
            <span className="font-bold text-primary">{formatValue ? formatValue(value) : value}</span>
        </div>
        <div className="relative">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="custom-slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-600"
                style={{
                    background: `linear-gradient(to right, #b99727 0%, #b99727 ${((value - min) / (max - min)) * 100}%, #57534e ${((value - min) / (max - min)) * 100}%, #57534e 100%)`,
                }}
            />
            <div className="mt-1 flex justify-between text-xs text-stone-500">
                <span>{formatValue ? formatValue(min) : min}</span>
                <span>{formatValue ? formatValue(max) : max}</span>
            </div>
        </div>
    </div>
);

const ContactForm = () => {
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        squareFootage: 2000,
        bedrooms: 3,
        bathrooms: 2,
        livingAreas: 1,
        offices: 0,
        diningSpaces: 1,
        distanceFromDowntown: 10,
        outdoorStaging: false,
        multiFloor: false,
        stagingType: 'vacant',
        message: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showQuote, setShowQuote] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const quote = calculateStagingQuote({
        squareFootage: formData.squareFootage,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        livingAreas: formData.livingAreas,
        offices: formData.offices,
        diningSpaces: formData.diningSpaces,
        distanceFromDowntown: formData.distanceFromDowntown,
        outdoorStaging: formData.outdoorStaging,
        multiFloor: formData.multiFloor,
        stagingType: formData.stagingType,
    });

    // Check if there are any additional items to show separator after room counts
    const hasAdditionalItems = quote.outdoorAdjustment > 0 || 
                              quote.multiFloorAdjustment > 0 || 
                              quote.largeSquareFootageAdjustment > 0 || 
                              quote.distanceAdjustment > 0;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            schema.parse(formData);
            setErrors({});

            const response = await sendContactFormEmail({
                ...formData,
                quote: quote,
            });

            if (!response.success) {
                throw new Error('Failed to submit form');
            }

            setSubmitMessage({
                type: 'success',
                message: 'Your quote request has been sent! Mia will contact you within 24 hours.',
            });

            // Reset form
            setTimeout(() => {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    squareFootage: 2000,
                    bedrooms: 3,
                    bathrooms: 2,
                    livingAreas: 1,
                    offices: 0,
                    diningSpaces: 1,
                    distanceFromDowntown: 10,
                    outdoorStaging: false,
                    multiFloor: false,
                    stagingType: 'vacant',
                    message: '',
                });
                setSubmitMessage(null);
            }, 5000);
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
                setSubmitMessage({
                    type: 'error',
                    message: 'An error occurred. Please try again or call us directly.',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                    <Calculator className="text-primary" size={32} />
                    <h2 className="text-3xl font-bold gradient-gold-main-text">Instant Quote Calculator</h2>
                </div>
                <p className="text-stone-400">Get an instant estimate and submit for your personalized consultation</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div className="space-y-6 rounded-xl border border-stone-700 bg-stone-800/30 p-6">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-primary">
                        <Info size={24} />
                        Contact Information
                    </h3>

                    <div className="space-y-6">
                        {/* Name and Phone Row */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-stone-300">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full rounded-lg border border-stone-600 bg-stone-700 px-4 py-3 text-white placeholder-stone-400 transition-colors focus:border-primary focus:outline-none"
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-stone-300">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full rounded-lg border border-stone-600 bg-stone-700 px-4 py-3 text-white placeholder-stone-400 transition-colors focus:border-primary focus:outline-none"
                                    placeholder="(555) 123-4567"
                                />
                                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Email Row */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-stone-300">Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full rounded-lg border border-stone-600 bg-stone-700 px-4 py-3 text-white placeholder-stone-400 transition-colors focus:border-primary focus:outline-none"
                                placeholder="john@example.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4 rounded-xl border border-stone-700 bg-stone-800/30 p-6">
                    <h3 className="text-xl font-semibold text-primary">Tell us about your project</h3>
                    <textarea
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-stone-600 bg-stone-700 px-4 py-3 text-white placeholder-stone-400 transition-colors focus:border-primary focus:outline-none"
                        placeholder="Tell us about your timeline, specific needs, or any questions you have..."
                    />
                    {errors.message && <p className="text-xs text-red-400">{errors.message}</p>}
                </div>

                {/* Property Details */}
                <div className="space-y-6 rounded-xl border border-stone-700 bg-stone-800/30 p-6">
                        <h3 className="flex items-center gap-2 text-xl font-semibold text-primary">
                            <Home size={24} />
                            Property Details
                        </h3>

                        <div className="space-y-6">
                            {/* First Row: Square Footage and Distance */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Slider
                                    value={formData.squareFootage}
                                    onChange={(value) => handleChange('squareFootage', value)}
                                    min={500}
                                    max={8000}
                                    step={100}
                                    label="Square Footage"
                                    icon={<Ruler size={20} />}
                                    formatValue={(value) => `${value.toLocaleString()} sq ft`}
                                />

                                <Slider
                                    value={formData.distanceFromDowntown}
                                    onChange={(value) => handleChange('distanceFromDowntown', value)}
                                    min={0}
                                    max={50}
                                    step={1}
                                    label="Miles from Downtown Sacramento"
                                    icon={<MapPin size={20} />}
                                    formatValue={(value) => `${value} miles`}
                                />
                            </div>

                            {/* Second Row: Bedrooms and Bathrooms */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Slider
                                    value={formData.bedrooms}
                                    onChange={(value) => handleChange('bedrooms', value)}
                                    min={0}
                                    max={6}
                                    step={1}
                                    label="Number of Bedrooms"
                                    icon={<Bed size={20} />}
                                    formatValue={(value) => `${value} ${value === 1 ? 'Bedroom' : 'Bedrooms'}`}
                                />

                                <Slider
                                    value={formData.bathrooms}
                                    onChange={(value) => handleChange('bathrooms', value)}
                                    min={0}
                                    max={5}
                                    step={1}
                                    label="Number of Bathrooms"
                                    icon={<Bath size={20} />}
                                    formatValue={(value) => `${value} ${value === 1 ? 'Bathroom' : 'Bathrooms'}`}
                                />
                            </div>

                            {/* Third Row: Living Areas and Offices */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Slider
                                    value={formData.livingAreas}
                                    onChange={(value) => handleChange('livingAreas', value)}
                                    min={0}
                                    max={4}
                                    step={1}
                                    label="Living Areas"
                                    icon={<Sofa size={20} />}
                                    formatValue={(value) => `${value} ${value === 1 ? 'Area' : 'Areas'}`}
                                />

                                <Slider
                                    value={formData.offices}
                                    onChange={(value) => handleChange('offices', value)}
                                    min={0}
                                    max={3}
                                    step={1}
                                    label="Home Offices"
                                    icon={<Briefcase size={20} />}
                                    formatValue={(value) => `${value} ${value === 1 ? 'Office' : 'Offices'}`}
                                />
                            </div>

                            {/* Fourth Row: Dining Spaces and Staging Type */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Slider
                                    value={formData.diningSpaces}
                                    onChange={(value) => handleChange('diningSpaces', value)}
                                    min={0}
                                    max={3}
                                    step={1}
                                    label="Dining Spaces"
                                    icon={<UtensilsCrossed size={20} />}
                                    formatValue={(value) => `${value} ${value === 1 ? 'Space' : 'Spaces'}`}
                                />
                                
                                {/* Staging Type Toggle Buttons */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Home className="text-primary" size={20} />
                                        <span className="font-medium text-stone-300">Staging Type</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => handleChange('stagingType', 'vacant')}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all ${
                                                formData.stagingType === 'vacant'
                                                    ? 'border-primary bg-primary text-stone-300'
                                                    : 'border-primary bg-transparent text-primary hover:bg-primary/70 hover:text-stone-300'
                                            } border`}
                                        >
                                            <Building size={18} />
                                            Vacant Home
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleChange('stagingType', 'occupied')}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all ${
                                                formData.stagingType === 'occupied'
                                                    ? 'border-primary bg-primary text-stone-300'
                                                    : 'border-primary bg-transparent text-primary hover:bg-primary/70 hover:text-stone-300'
                                            } border`}
                                        >
                                            <Users size={18} />
                                            Occupied Home
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Toggle Options */}
                            <div className="space-y-4">
                                <Toggle
                                    enabled={formData.outdoorStaging}
                                    onChange={(enabled) => handleChange('outdoorStaging', enabled)}
                                    label="Outdoor staging required (patio, deck, yard)"
                                    icon={<Trees size={20} />}
                                />

                                <Toggle
                                    enabled={formData.multiFloor}
                                    onChange={(enabled) => handleChange('multiFloor', enabled)}
                                    label="Multi-floor home (2+ stories)"
                                    icon={<Building size={20} />}
                                />
                            </div>
                        </div>
                </div>

                {/* Instant Quote Display */}
                <div>
                        <AnimatePresence>
                            {showQuote && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="h-fit rounded-xl border-2 border-primary bg-gradient-to-br from-primary/5 via-primary_dark/10 to-primary/5 p-6 shadow-xl"
                                >
                                    {/* Header */}
                                    <div className="mb-6 text-center">
                                        <div className="mb-1 flex items-center justify-center gap-2">
                                            <Calculator className="text-primary" size={24} />
                                            <h3 className="text-2xl font-bold text-primary">Your Estimated Quote</h3>
                                        </div>
                                    </div>

                                    {/* Main Quote Display */}
                                    <div className="mb-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary_dark/15 to-primary/10 border border-primary/30 p-6 text-center">
                                        <div className="mb-2">
                                            <div className="text-sm uppercase tracking-wider text-stone-400 mb-2">Estimated Price Range</div>
                                            <div className="text-3xl font-bold gradient-gold-main-text">
                                                {formatPrice(quote.priceRange.min)} - {formatPrice(quote.priceRange.max)}
                                            </div>
                                        </div>
                                        <div className="text-xs text-stone-400 mt-3">
                                            Final pricing determined after consultation
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="mb-6 rounded-xl bg-stone-900/70 p-5 backdrop-blur-sm border border-stone-700/50">
                                        <h4 className="mb-4 text-center text-lg font-bold text-secondary">Price Breakdown</h4>
                                        
                                        <div className="space-y-3">
                                            {/* Base Price */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-stone-300 font-medium">Base {formData.stagingType} staging package</span>
                                                    <div className="text-sm text-stone-400">Kitchen + entryway</div>
                                                </div>
                                                <span className="font-bold text-stone-100 text-lg">{formatPrice(quote.basePrice)}</span>
                                            </div>

                                            {/* Bedrooms */}
                                            {quote.bedroomCount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Bedrooms</span>
                                                        <div className="text-sm text-stone-400">
                                                            {quote.bedroomCount} × {formatPrice(quote.bedroomRate)} each
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-stone-100 text-lg">{formatPrice(quote.bedroomTotal)}</span>
                                                </div>
                                            )}

                                            {/* Bathrooms */}
                                            {quote.bathroomCount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Bathrooms</span>
                                                        <div className="text-sm text-stone-400">
                                                            {quote.bathroomCount} × {formatPrice(quote.bathroomRate)} each
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-stone-100 text-lg">{formatPrice(quote.bathroomTotal)}</span>
                                                </div>
                                            )}

                                            {/* Living Areas */}
                                            {quote.livingAreaCount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Living Areas</span>
                                                        <div className="text-sm text-stone-400">
                                                            {quote.livingAreaCount} × {formatPrice(quote.livingAreaRate)} each
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-stone-100 text-lg">{formatPrice(quote.livingAreaTotal)}</span>
                                                </div>
                                            )}

                                            {/* Home Offices */}
                                            {quote.officeCount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Home Offices</span>
                                                        <div className="text-sm text-stone-400">
                                                            {quote.officeCount} × {formatPrice(quote.officeRate)} each
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-stone-100 text-lg">{formatPrice(quote.officeTotal)}</span>
                                                </div>
                                            )}

                                            {/* Dining Spaces */}
                                            {quote.diningSpaceCount > 0 && (
                                                <div className={`flex justify-between items-center ${hasAdditionalItems ? 'border-b border-stone-600/50 pb-3' : ''}`}>
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Dining Spaces</span>
                                                        <div className="text-sm text-stone-400">
                                                            {quote.diningSpaceCount} × {formatPrice(quote.diningSpaceRate)} each
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-stone-100 text-lg">{formatPrice(quote.diningSpaceTotal)}</span>
                                                </div>
                                            )}

                                            {/* Additional Services */}
                                            {quote.outdoorAdjustment > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Outdoor Staging</span>
                                                        <div className="text-sm text-stone-400">Patio, deck, yard areas</div>
                                                    </div>
                                                    <span className="font-medium text-secondary text-lg">
                                                        +{formatPrice(quote.outdoorAdjustment)}
                                                    </span>
                                                </div>
                                            )}

                                            {quote.multiFloorAdjustment > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Multi-Floor Fee</span>
                                                        <div className="text-sm text-stone-400">Additional story surcharge</div>
                                                    </div>
                                                    <span className="font-medium text-secondary text-lg">
                                                        +{formatPrice(quote.multiFloorAdjustment)}
                                                    </span>
                                                </div>
                                            )}

                                            {quote.largeSquareFootageAdjustment > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Very Large Home Fee</span>
                                                        <div className="text-sm text-stone-400">Properties over 3,500 sq ft</div>
                                                    </div>
                                                    <span className="font-medium text-secondary text-lg">
                                                        +{formatPrice(quote.largeSquareFootageAdjustment)}
                                                    </span>
                                                </div>
                                            )}

                                            {quote.distanceAdjustment > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-stone-300 font-medium">Distance Fee</span>
                                                        <div className="text-sm text-stone-400">Properties over 20 miles away</div>
                                                    </div>
                                                    <span className="font-medium text-secondary text-lg">
                                                        +{formatPrice(quote.distanceAdjustment)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                                        <p className="flex items-start gap-2 text-sm text-amber-200">
                                            <Info size={18} className="mt-0.5 flex-shrink-0 text-amber-400" />
                                            <span>
                                                <strong>Important:</strong> This is an estimate only. Final pricing will be confirmed after Mia reviews your property details and conducts a walkthrough consultation.
                                            </span>
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`flex transform items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-bold transition-all hover:scale-[1.02] hover:rotate-1 ${
                                                isSubmitting
                                                    ? 'cursor-not-allowed bg-stone-600 text-stone-400'
                                                    : 'bg-gradient-to-r from-primary via-primary_dark to-primary text-white shadow-2xl hover:shadow-primary/40 hover:shadow-2xl border-2 border-primary_dark/50'
                                            }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
                                                    <span>Sending Your Quote...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={24} />
                                                    <span>Send Your Estimate to Mia!</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                </div>

                {/* Submit Messages */}
                <div className="flex flex-col items-center">
                    <AnimatePresence>
                        {submitMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`flex items-center gap-3 rounded-lg p-4 ${
                                    submitMessage.type === 'success'
                                        ? 'border border-green-500/50 bg-green-500/10 text-green-400'
                                        : 'border border-red-500/50 bg-red-500/10 text-red-400'
                                }`}
                            >
                                {submitMessage.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                <span className="font-medium">{submitMessage.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
