'use client';

import React, { useState, useEffect } from 'react';

import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { sendContactFormEmail } from './actions';
import { buildSubmissionRecord } from './contact_form.utils';
import { calculateStagingQuote, formatPrice } from '@/utils/calculateQuote';
import { track, trackOnce } from '@/lib/analytics';
import {
    Calculator,
    Send,
    CheckCircle,
    AlertCircle,
    Info,
    Ruler,
    Bed,
    MapPin,
    Trees,
    Building,
    Home,
    Users,
    Bath,
    Sofa,
    Briefcase,
    UtensilsCrossed,
    Phone,
} from 'lucide-react';

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

/** The quote fields carried no `id`, `name` or label association, so nothing announced them. */
const fieldId = (label: string) =>
    label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

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
    <div className="border-line-strong bg-surface-overlay/50 flex items-center gap-4 rounded-lg border p-4">
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-labelledby={`toggle-label-${fieldId(label)}`}
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                enabled ? 'bg-forest-400' : 'bg-surface-hover'
            }`}
        >
            <span
                className={`bg-body inline-block h-4 w-4 transform rounded-full transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
        <div className="flex items-center gap-3">
            <div className="text-forest-200" aria-hidden="true">
                {icon}
            </div>
            <span id={`toggle-label-${fieldId(label)}`} className="text-body-muted font-medium">
                {label}
            </span>
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
}) => {
    const id = `slider-${fieldId(label)}`;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="flex items-center gap-2">
                    <span className="text-primary" aria-hidden="true">
                        {icon}
                    </span>
                    <span className="text-body-muted font-medium">{label}</span>
                </label>
                <span className="text-primary font-bold">{formatValue ? formatValue(value) : value}</span>
            </div>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    aria-valuetext={formatValue ? formatValue(value) : String(value)}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="custom-slider bg-surface-hover h-2 w-full cursor-pointer appearance-none rounded-lg"
                    style={{
                        background: `linear-gradient(to right, #b99727 0%, #b99727 ${((value - min) / (max - min)) * 100}%, #57534e ${((value - min) / (max - min)) * 100}%, #57534e 100%)`,
                    }}
                />
                <div className="text-body-subtle mt-1 flex justify-between text-xs">
                    <span>{formatValue ? formatValue(min) : min}</span>
                    <span>{formatValue ? formatValue(max) : max}</span>
                </div>
            </div>
        </div>
    );
};

const ContactForm = () => {
    const createSubmission = useMutation(api.contactSubmissions.createSubmission);
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
    const [showQuote] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (field: keyof FormData, value: any) => {
        trackOnce('quote_started', { placement: 'contact_page' });
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
    const hasAdditionalItems =
        quote.outdoorAdjustment > 0 ||
        quote.multiFloorAdjustment > 0 ||
        quote.largeSquareFootageAdjustment > 0 ||
        quote.distanceAdjustment > 0;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            schema.parse(formData);
            setErrors({});

            // Record the lead before attempting delivery. Email is rate limited and can fail
            // outright, and a lost quote request is worse than a missing notification.
            try {
                await createSubmission({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    message: buildSubmissionRecord(formData, quote),
                });
            } catch (persistError) {
                console.error('Could not record the contact submission:', persistError);
            }

            const response = await sendContactFormEmail({
                ...formData,
                quote: quote,
            });

            if (!response.success) {
                throw new Error('Failed to submit form');
            }

            track('quote_submitted', {
                estimate: quote.totalEstimate,
                staging_type: formData.stagingType,
                square_footage: formData.squareFootage,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                distance_miles: formData.distanceFromDowntown,
                outdoor_staging: formData.outdoorStaging,
                multi_floor: formData.multiFloor,
            });

            setSubmitMessage({
                type: 'success',
                message: 'Your quote request has been sent. Mia will get back to you within one business day.',
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
                track('quote_failed', { reason: 'validation', fields: Object.keys(newErrors) });
            } else {
                console.error('Error submitting form:', error);
                track('quote_failed', { reason: 'delivery' });
                setSubmitMessage({
                    type: 'error',
                    message:
                        'Something went wrong sending that. Try again, or call (209) 817-4240 and we’ll take the details over the phone.',
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
                <div className="mb-3 flex items-center justify-center gap-3">
                    <Calculator className="text-forest-200" size={28} aria-hidden="true" />
                    <h2 className="font-display gradient-gold-main-text text-3xl font-bold">Estimate your staging</h2>
                </div>
                <p className="text-body-muted mx-auto max-w-xl text-pretty">
                    Answer a few questions and you&rsquo;ll see a price range before you send anything. The final number is confirmed at the
                    walkthrough.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div className="border-line bg-surface-raised/30 space-y-6 rounded-xl border p-6">
                    <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
                        <Info size={24} />
                        Contact Information
                    </h3>

                    <div className="space-y-6">
                        {/* Name and Phone Row */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="contact-name" className="text-body-muted mb-2 block text-sm font-medium">
                                    Full Name *
                                </label>
                                <input
                                    id="contact-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    aria-invalid={errors.name ? true : undefined}
                                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="border-line-strong bg-surface-overlay text-body placeholder-body-subtle focus:border-gold-400 w-full rounded-lg border px-4 py-3 transition-colors"
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p id="contact-name-error" className="text-danger mt-1 text-xs">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="contact-phone" className="text-body-muted mb-2 block text-sm font-medium">
                                    Phone Number *
                                </label>
                                <input
                                    id="contact-phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    aria-invalid={errors.phone ? true : undefined}
                                    aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="border-line-strong bg-surface-overlay text-body placeholder-body-subtle focus:border-gold-400 w-full rounded-lg border px-4 py-3 transition-colors"
                                    placeholder="(555) 123-4567"
                                />
                                {errors.phone && (
                                    <p id="contact-phone-error" className="text-danger mt-1 text-xs">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email Row */}
                        <div>
                            <label htmlFor="contact-email" className="text-body-muted mb-2 block text-sm font-medium">
                                Email Address *
                            </label>
                            <input
                                id="contact-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                aria-invalid={errors.email ? true : undefined}
                                aria-describedby={errors.email ? 'contact-email-error' : undefined}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="border-line-strong bg-surface-overlay text-body placeholder-body-subtle focus:border-gold-400 w-full rounded-lg border px-4 py-3 transition-colors"
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <p id="contact-email-error" className="text-danger mt-1 text-xs">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="border-line bg-surface-raised/30 space-y-4 rounded-xl border p-6">
                    <h3 className="text-primary text-xl font-semibold">
                        <label htmlFor="contact-message">Tell us about your project</label>
                    </h3>
                    <textarea
                        id="contact-message"
                        name="message"
                        required
                        aria-invalid={errors.message ? true : undefined}
                        aria-describedby={errors.message ? 'contact-message-error' : undefined}
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        rows={3}
                        className="border-line-strong bg-surface-overlay text-body placeholder-body-subtle focus:border-gold-400 w-full resize-none rounded-lg border px-4 py-3 transition-colors"
                        placeholder="Tell us about your timeline, specific needs, or any questions you have..."
                    />
                    {errors.message && (
                        <p id="contact-message-error" className="text-danger text-xs">
                            {errors.message}
                        </p>
                    )}
                </div>

                {/* Property Details */}
                <div className="border-line bg-surface-raised/30 space-y-6 rounded-xl border p-6">
                    <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
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
                                label="Bedrooms to be staged"
                                icon={<Bed size={20} />}
                                formatValue={(value) => `${value} ${value === 1 ? 'Bedroom' : 'Bedrooms'}`}
                            />

                            <Slider
                                value={formData.bathrooms}
                                onChange={(value) => handleChange('bathrooms', value)}
                                min={0}
                                max={5}
                                step={1}
                                label="Bathrooms to be staged"
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
                                    <span className="text-body-muted font-medium">Staging Type</span>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleChange('stagingType', 'vacant')}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all ${
                                            formData.stagingType === 'vacant'
                                                ? 'border-primary bg-primary text-body-muted'
                                                : 'border-primary text-primary hover:bg-primary/70 hover:text-body-muted bg-transparent'
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
                                                ? 'border-primary bg-primary text-body-muted'
                                                : 'border-primary text-primary hover:bg-primary/70 hover:text-body-muted bg-transparent'
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
                                className="border-primary from-primary/5 via-primary_dark/10 to-primary/5 h-fit rounded-xl border-2 bg-gradient-to-br p-6 shadow-xl"
                            >
                                {/* Header */}
                                <div className="mb-6 text-center">
                                    <div className="mb-1 flex items-center justify-center gap-2">
                                        <Calculator className="text-primary" size={24} />
                                        <h3 className="text-primary text-2xl font-bold">Your Estimated Quote</h3>
                                    </div>
                                </div>

                                {/* Custom Quote Required Message */}
                                {quote.requiresCustomQuote ? (
                                    <>
                                        <div className="mb-6 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-600/15 to-amber-500/10 p-6 text-center">
                                            <div className="mb-4">
                                                <Phone className="mx-auto mb-3 text-amber-400" size={40} />
                                                <div className="mb-2 text-xl font-bold text-amber-200">Custom Quote Required</div>
                                                <div className="text-sm text-amber-200/80">{quote.customQuoteReason}</div>
                                            </div>
                                            <div className="text-body-muted text-sm">
                                                Please submit your information below and Mia will provide a personalized quote for your
                                                property.
                                            </div>
                                        </div>

                                        {/* Submit Button for Custom Quote */}
                                        <div className="flex justify-center">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-bold transition-colors ${
                                                    isSubmitting
                                                        ? 'bg-surface-hover text-body-subtle cursor-not-allowed'
                                                        : 'bg-gold-400 text-body-inverse shadow-card hover:bg-gold-300'
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="border-body-inverse/40 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                                                        <span>Sending&hellip;</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={24} />
                                                        <span>Request a custom quote</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Main Quote Display */}
                                        <div className="from-primary/10 via-primary_dark/15 to-primary/10 border-primary/30 mb-6 rounded-xl border bg-gradient-to-br p-6 text-center">
                                            <div className="mb-2">
                                                <div className="text-body-subtle mb-2 text-sm tracking-wider uppercase">
                                                    Estimated Price Range
                                                </div>
                                                <div className="gradient-gold-main-text text-3xl font-bold">
                                                    {formatPrice(quote.priceRange.min)} - {formatPrice(quote.priceRange.max)}
                                                </div>
                                            </div>
                                            <div className="text-body-subtle mt-3 text-xs">Final pricing determined after consultation</div>
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="bg-surface/70 border-line/50 mb-6 rounded-xl border p-5 backdrop-blur-sm">
                                            <h4 className="text-secondary mb-4 text-center text-lg font-bold">Price Breakdown</h4>

                                            <div className="space-y-3">
                                                {/* Base Price - Different display for vacant vs occupied */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-body-muted font-medium">
                                                            {formData.stagingType === 'vacant' && quote.tierInfo
                                                                ? `Base Package (${quote.tierInfo.sqftRange})`
                                                                : `Base ${formData.stagingType} staging package`}
                                                        </span>
                                                        <div className="text-body-subtle text-sm">
                                                            {formData.stagingType === 'vacant' && quote.tierInfo
                                                                ? quote.tierInfo.includedRooms
                                                                : 'Kitchen + entryway'}
                                                        </div>
                                                    </div>
                                                    <span className="text-body text-lg font-bold">{formatPrice(quote.basePrice)}</span>
                                                </div>

                                                {/* Living Areas - Always shown for both (never included in base) */}
                                                {quote.livingAreaCount > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-body-muted font-medium">Living Areas</span>
                                                            <div className="text-body-subtle text-sm">
                                                                {quote.livingAreaCount} × {formatPrice(quote.livingAreaRate)} each
                                                            </div>
                                                        </div>
                                                        <span className="text-body text-lg font-bold">
                                                            {formatPrice(quote.livingAreaTotal)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Dining Spaces - Always shown for both (never included in base) */}
                                                {quote.diningSpaceCount > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-body-muted font-medium">Dining Spaces</span>
                                                            <div className="text-body-subtle text-sm">
                                                                {quote.diningSpaceCount} × {formatPrice(quote.diningSpaceRate)} each
                                                            </div>
                                                        </div>
                                                        <span className="text-body text-lg font-bold">
                                                            {formatPrice(quote.diningSpaceTotal)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Extra Bedrooms - For vacant, only show extras beyond included */}
                                                {formData.stagingType === 'vacant'
                                                    ? quote.extraBedroomCount > 0 && (
                                                          <div className="flex items-center justify-between">
                                                              <div>
                                                                  <span className="text-body-muted font-medium">Extra Bedrooms</span>
                                                                  <div className="text-body-subtle text-sm">
                                                                      {quote.extraBedroomCount} beyond included ×{' '}
                                                                      {formatPrice(quote.bedroomRate)} each
                                                                  </div>
                                                              </div>
                                                              <span className="text-body text-lg font-bold">
                                                                  {formatPrice(quote.bedroomTotal)}
                                                              </span>
                                                          </div>
                                                      )
                                                    : quote.bedroomCount > 0 && (
                                                          <div className="flex items-center justify-between">
                                                              <div>
                                                                  <span className="text-body-muted font-medium">Bedrooms</span>
                                                                  <div className="text-body-subtle text-sm">
                                                                      {quote.bedroomCount} × {formatPrice(quote.bedroomRate)} each
                                                                  </div>
                                                              </div>
                                                              <span className="text-body text-lg font-bold">
                                                                  {formatPrice(quote.bedroomTotal)}
                                                              </span>
                                                          </div>
                                                      )}

                                                {/* Extra Bathrooms - For vacant, only show extras beyond 2 included */}
                                                {formData.stagingType === 'vacant'
                                                    ? quote.extraBathroomCount > 0 && (
                                                          <div className="flex items-center justify-between">
                                                              <div>
                                                                  <span className="text-body-muted font-medium">Extra Bathrooms</span>
                                                                  <div className="text-body-subtle text-sm">
                                                                      {quote.extraBathroomCount} beyond included ×{' '}
                                                                      {formatPrice(quote.bathroomRate)} each
                                                                  </div>
                                                              </div>
                                                              <span className="text-body text-lg font-bold">
                                                                  {formatPrice(quote.bathroomTotal)}
                                                              </span>
                                                          </div>
                                                      )
                                                    : quote.bathroomCount > 0 && (
                                                          <div className="flex items-center justify-between">
                                                              <div>
                                                                  <span className="text-body-muted font-medium">Bathrooms</span>
                                                                  <div className="text-body-subtle text-sm">
                                                                      {quote.bathroomCount} × {formatPrice(quote.bathroomRate)} each
                                                                  </div>
                                                              </div>
                                                              <span className="text-body text-lg font-bold">
                                                                  {formatPrice(quote.bathroomTotal)}
                                                              </span>
                                                          </div>
                                                      )}

                                                {/* Extra Offices - For vacant, only show extras beyond included */}
                                                {formData.stagingType === 'vacant'
                                                    ? quote.extraOfficeCount > 0 && (
                                                          <div
                                                              className={`flex items-center justify-between ${hasAdditionalItems ? 'border-line-strong/50 border-b pb-3' : ''}`}
                                                          >
                                                              <div>
                                                                  <span className="text-body-muted font-medium">Extra Home Offices</span>
                                                                  <div className="text-body-subtle text-sm">
                                                                      {quote.extraOfficeCount} beyond included ×{' '}
                                                                      {formatPrice(quote.officeRate)} each
                                                                  </div>
                                                              </div>
                                                              <span className="text-body text-lg font-bold">
                                                                  {formatPrice(quote.officeTotal)}
                                                              </span>
                                                          </div>
                                                      )
                                                    : quote.officeCount > 0 && (
                                                          <div
                                                              className={`flex items-center justify-between ${hasAdditionalItems ? 'border-line-strong/50 border-b pb-3' : ''}`}
                                                          >
                                                              <div>
                                                                  <span className="text-body-muted font-medium">Home Offices</span>
                                                                  <div className="text-body-subtle text-sm">
                                                                      {quote.officeCount} × {formatPrice(quote.officeRate)} each
                                                                  </div>
                                                              </div>
                                                              <span className="text-body text-lg font-bold">
                                                                  {formatPrice(quote.officeTotal)}
                                                              </span>
                                                          </div>
                                                      )}

                                                {/* Additional Services */}
                                                {quote.outdoorAdjustment > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-body-muted font-medium">Outdoor Staging</span>
                                                            <div className="text-body-subtle text-sm">Patio, deck, yard areas</div>
                                                        </div>
                                                        <span className="text-secondary text-lg font-medium">
                                                            +{formatPrice(quote.outdoorAdjustment)}
                                                        </span>
                                                    </div>
                                                )}

                                                {quote.multiFloorAdjustment > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-body-muted font-medium">Multi-Floor Fee</span>
                                                            <div className="text-body-subtle text-sm">Additional story surcharge</div>
                                                        </div>
                                                        <span className="text-secondary text-lg font-medium">
                                                            +{formatPrice(quote.multiFloorAdjustment)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Large home fee - only for occupied */}
                                                {quote.largeSquareFootageAdjustment > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-body-muted font-medium">Very Large Home Fee</span>
                                                            <div className="text-body-subtle text-sm">Properties over 3,500 sq ft</div>
                                                        </div>
                                                        <span className="text-secondary text-lg font-medium">
                                                            +{formatPrice(quote.largeSquareFootageAdjustment)}
                                                        </span>
                                                    </div>
                                                )}

                                                {quote.distanceAdjustment > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-body-muted font-medium">Travel Fee</span>
                                                            <div className="text-body-subtle text-sm">
                                                                {formData.stagingType === 'vacant'
                                                                    ? `${formData.distanceFromDowntown} miles from Sacramento`
                                                                    : 'Properties over 20 miles away'}
                                                            </div>
                                                        </div>
                                                        <span className="text-secondary text-lg font-medium">
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
                                                    <strong>Important:</strong> This is an estimate only. Final pricing will be confirmed
                                                    after Mia reviews your property details and conducts a walkthrough consultation.
                                                </span>
                                            </p>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-center">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-bold transition-colors ${
                                                    isSubmitting
                                                        ? 'bg-surface-hover text-body-subtle cursor-not-allowed'
                                                        : 'bg-gold-400 text-body-inverse shadow-card hover:bg-gold-300'
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="border-body-inverse/40 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                                                        <span>Sending&hellip;</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={24} />
                                                        <span>Send quote request</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
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
