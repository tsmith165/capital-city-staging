import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Sofa, CheckCircle, ArrowRight, Sparkles, Users } from 'lucide-react';

import Statistics from '@/app/_main_components/statistics';

interface Service {
    title: string;
    icon: React.ReactNode;
    description: string;
    price: number | string;
    includedItems: string[];
    tag?: string;
    color: 'primary' | 'secondary';
}

export default function Services() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    
    const services: Service[] = [
        {
            title: 'Occupied Staging',
            icon: <Users size={24} />,
            description: 'Transform your lived-in home into a buyer\'s dream with strategic adjustments to your existing furniture and decor.',
            price: 'Get a Custom Quote',
            color: 'primary',
            includedItems: [
                'Complete walkthrough & space assessment',
                'Custom proposal tailored to your budget',
                'Strategic design for maximum appeal',
                'Room-by-room transformation',
            ],
        },
        {
            title: 'Vacant Staging',
            icon: <Sofa size={24} />,
            description: 'Bring empty spaces to life with carefully curated furniture and accessories that showcase your home\'s full potential.',
            price: 'Get a Custom Quote',
            color: 'secondary',
            includedItems: [
                'Professional measurements & planning',
                'Curated furniture & artwork selection',
                'Expert room arrangement & styling',
                'Seamless removal after sale',
            ],
        },
    ];

    return (
        <div className="flex h-auto w-full flex-col items-center justify-evenly md:min-h-[calc(100dvh-50px)]">
            <div className="flex h-fit w-full flex-col items-center justify-center p-4 lg:w-[90%]">
                {/* Animated Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <div className="mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="text-primary" size={28} />
                        <h1 className="text-4xl font-bold lg:text-5xl">
                            <span className="text-white">Focus on your </span>
                            <span className="gradient-primary-main-text">next moves</span>
                        </h1>
                    </div>
                    <h2 className="text-3xl font-bold gradient-secondary-main-text lg:text-4xl">
                        We'll handle the rest.
                    </h2>
                    <p className="mt-4 text-lg text-stone-300 max-w-2xl mx-auto">
                        With professional staging expertise, we transform spaces into buyer-ready homes that sell faster and for top dollar.
                    </p>
                </motion.div>

                {/* Service Cards */}
                <div className="grid w-full gap-8 md:grid-cols-2 max-w-5xl mx-auto">
                    {services.map((service, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className="relative"
                        >
                            <div className={`
                                h-full rounded-2xl border-2 bg-stone-900/50 backdrop-blur-sm p-8
                                transition-all duration-300 transform
                                ${hoveredCard === index ? 'scale-105 shadow-2xl' : 'shadow-lg'}
                                ${service.color === 'primary' 
                                    ? 'border-primary hover:border-primary_dark' 
                                    : 'border-secondary hover:border-secondary_light'
                                }
                            `}>
                                {/* Icon and Title */}
                                <div className="mb-4 flex items-center gap-3">
                                    <div className={`
                                        rounded-lg p-2
                                        ${service.color === 'primary' 
                                            ? 'bg-gradient-to-br from-primary/20 to-primary_dark/20 text-primary_dark' 
                                            : 'bg-gradient-to-br from-secondary/20 to-secondary_light/20 text-secondary_light'
                                        }
                                    `}>
                                        {service.icon}
                                    </div>
                                    <h3 className={`text-3xl font-bold ${
                                        service.color === 'primary' 
                                            ? 'gradient-gold-main-text' 
                                            : 'gradient-secondary-main-text'
                                    }`}>
                                        {service.title}
                                    </h3>
                                </div>
                                
                                {/* Description */}
                                <p className="text-stone-300 leading-relaxed mb-6 min-h-[4.5rem]">
                                    {service.description}
                                </p>

                                {/* Features List */}
                                <div className="space-y-3 mb-8">
                                    {service.includedItems.map((item, itemIndex) => (
                                        <motion.div 
                                            key={itemIndex}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.1 * itemIndex }}
                                            className="flex items-start gap-3 group"
                                        >
                                            <CheckCircle 
                                                size={20} 
                                                className={`
                                                    mt-0.5 flex-shrink-0 transition-colors
                                                    ${service.color === 'primary' 
                                                        ? 'text-primary group-hover:text-primary_dark' 
                                                        : 'text-secondary group-hover:text-secondary_light'
                                                    }
                                                `} 
                                            />
                                            <span className="text-stone-300 group-hover:text-white transition-colors">
                                                {item}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <Link href="/contact">
                                    <button className={`
                                        w-full rounded-lg px-6 py-4 font-semibold text-white
                                        flex items-center justify-center gap-2 group
                                        transition-all duration-300 transform hover:scale-105
                                        ${service.color === 'primary' 
                                            ? 'bg-gradient-to-r from-primary to-primary_dark hover:shadow-lg hover:shadow-primary/30' 
                                            : 'bg-gradient-to-r from-secondary to-secondary_light hover:shadow-lg hover:shadow-secondary/30'
                                        }
                                    `}>
                                        <span>{service.price}</span>
                                        <ArrowRight 
                                            size={20} 
                                            className="transition-transform group-hover:translate-x-1" 
                                        />
                                    </button>
                                </Link>

                                {/* Hover Glow Effect */}
                                {hoveredCard === index && (
                                    <div className={`
                                        absolute inset-0 -z-10 rounded-2xl blur-xl opacity-20
                                        ${service.color === 'primary' 
                                            ? 'bg-gradient-to-r from-primary to-primary_dark' 
                                            : 'bg-gradient-to-r from-secondary to-secondary_light'
                                        }
                                    `} />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-12 text-center"
                >
                    <p className="text-stone-400 mb-4">Ready to transform your home?</p>
                    <Link href="/contact">
                        <button className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary_dark px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
                            <Home size={20} />
                            <span>Schedule a Consultation</span>
                            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    </Link>
                </motion.div>
            </div>
            
            {/* Statistics Section */}
            <div className="hidden h-fit w-full flex-col items-center justify-center space-y-2 px-4 py-8 md:flex">
                <Statistics arrows={false} />
            </div>
        </div>
    );
}
