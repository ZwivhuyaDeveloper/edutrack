
"use client"

import React, { useState, useEffect, useRef } from 'react';

// Custom hook for count-up animation
const useCountUp = (target: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible || target === 0) return;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
            
            // Easing function for smooth animation (easeOutCubic)
            const easeOutCubic = (t: number): number => {
                return 1 - Math.pow(1 - t, 3);
            };

            const currentValue = target * easeOutCubic(progress);
            setCount(currentValue);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isVisible, target, duration]);

    return { count, ref };
};

// Individual stat item component
interface StatItemProps {
    number: string;
    label: string;
    index: number;
}

const StatItem: React.FC<StatItemProps> = ({ number, label, index }) => {
    // Parse the target number from string format (e.g., "+25k" → 25000)
    const parseTargetNumber = (numStr: string): number => {
        const cleanStr = numStr.replace(/[+]/g, '');
        if (cleanStr.includes('k') || cleanStr.includes('K')) {
            return parseFloat(cleanStr.replace(/[kK]/g, '')) * 1000;
        }
        return parseFloat(cleanStr);
    };

    // Format the animated number back to the original format
    const formatAnimatedNumber = (num: number, originalFormat: string): string => {
        const hasPlus = originalFormat.includes('+');
        const hasK = originalFormat.includes('k') || originalFormat.includes('K');
        
        let formattedNum: string;
        
        if (hasK && num >= 1000) {
            formattedNum = (num / 1000).toFixed(0) + 'k';
        } else {
            formattedNum = Math.floor(num).toString();
        }
        
        return hasPlus ? '+' + formattedNum : formattedNum;
    };

    const targetNumber = parseTargetNumber(number);
    const { count, ref } = useCountUp(targetNumber, 2000 + index * 200); // Stagger animations

    // Format the current count to individual digits for vertical display
    const getVerticalDigits = (num: number, originalFormat: string): React.ReactNode[] => {
        const formattedNum = formatAnimatedNumber(num, originalFormat);
        return formattedNum.split('').map((char, charIndex) => {
            const isSpecialChar = char === ',' || char === '.';
            return (
                <div 
                    key={charIndex} 
                    className={`flex flex-col items-center justify-center ${isSpecialChar ? 'w-2 h-4' : 'w-4 h-6'} mx-[calc(0.4rem)]`}
                >
                    <span className="text-[clamp(1.5rem,4vw,3rem)] font-bold text-teal-800 leading-none">
                        {char}
                    </span>
                </div>
            );
        });
    };

    return (
        <div
            ref={ref}
            className="transition-transform duration-200 ease-in-out cursor-default p-2.5 md:p-3 rounded-lg bg-white/50 border border-white/25 hover:translate-y-[-4px] hover:bg-white/75 hover:shadow-none"
        >
            <div className="flex items-center justify-center h-[clamp(1.5rem,4vw,3rem)] mb-1">
                {getVerticalDigits(count, number)}
            </div>
            <div className="text-[clamp(0.75rem,1.8vw,0.95rem)] text-gray-600 font-medium leading-tight max-w-[160px] mx-auto">
                {label}
            </div>
        </div>
    );
};

function StatsSection() {
    const stats = [
        { number: "+25k", label: "Students trusted our app" },
        { number: "+153", label: "Schools using our app" },
        { number: "+13K", label: "Teachers and Administrators" },
        { number: "+46", label: "Programs available" }
    ];

    return (
        <section className="font-sans mx-auto my-8 max-w-full w-full px-4 border border-none rounded-xl p-5 md:p-6 lg:my-12 backdrop-blur-sm shadow-none">
            <div className="grid grid-cols-2 gap-4 text-center md:gap-4 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatItem
                        key={index}
                        number={stat.number}
                        label={stat.label}
                        index={index}
                    />
                ))}
            </div>
        </section>
    );
}

export default StatsSection;
