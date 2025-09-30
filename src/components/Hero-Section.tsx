import React from 'react';
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import { ArrowBigRight, ArrowRightLeft, ArrowUpCircle, ArrowUpRightIcon } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import First from '@/assets/drawing_1.png'
import Second from '@/assets/top_hero.png'
import Third from '@/assets/bottom_hero.png'
import Fourth from '@/assets/drawing_2.png'
import StatsSection from './Stats-Section';
import AnimatedCounter from './AnimatedCounter';


function HeroSection() {
      const items = [
        {
            header: (
              <div className="relative w-full h-full">
                <Image 
                  src={First} 
                  alt="Educational technology" 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ),
            className: "md:col-span-1 lg:col-span-1 h-[20rem]",
        },
        {
            header: (
              <div className="relative w-full h-full">
                <Image 
                  src={Second} 
                  alt="AI innovation in education" 
                  fill
                  quality={100} 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
                />
              </div>
            ),
            className: "md:col-span-2 lg:col-span-2 hidden lg:block md:block",
        },
        {
            header: (
                <div className="relative w-full h-full">
                <Image 
                  src={Third} 
                  alt="AI innovation in education" 
                  fill 
                  quality={100} 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
                />
              </div>
            ),
            className: "md:col-span-2 lg:col-span-2 hidden lg:block md:block",
        },
        {
            header: (
                <div className="relative w-full h-full">
                <Image 
                  src={Fourth} 
                  alt="Educational technology" 
                  fill 
                  quality={100} 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ),
            className: "md:col-span-1 lg:col-span-1 hidden lg:block md:block",
        },
      ];
    return (
        <div className='px-4 lg:px-60 w-full h-full'>

          <div className='flex font-sans flex-col  lg:flex-row items-center pt-30  lg:pt-50 gap-8 lg:gap-20 w-full h-full justify-between'>
          <div className='flex flex-col w-full lg:w-5xl h-full gap-6 lg:gap-10 items-center lg:items-start justify-center lg:justify-start text-center lg:text-left'>
                <div>
                    <span className='text-black text-4xl sm:text-4xl lg:text-5xl font-bold leading-tight'> <strong className='text-teal-800'> Comprehensive </strong>Smart Education <strong className='text-teal-800'>Software</strong></span>
                </div>
                <p className='text-gray-500 font-medium text-lg sm:text-xl max-w-2xl'>
                  Empowering Principals, Teachers, Parents, and Learners with <strong className='text-teal-800'> real-time performance, </strong> <strong className='text-teal-800'> attendance, </strong> <strong className='text-teal-800'> behavior tracking </strong> and <strong className='text-teal-800'> channelled communication </strong> — so no learner is left behind.
                </p>
                <div className='flex flex-row sm:flex-row gap-3 items-center w-full sm:w-auto justify-center lg:justify-start'>
                    <Button variant="default" className='bg-teal-800 text-white font-bold text-sm md:text-lg lg:text-xl py-3 sm:py-5 px-4 sm:px-6 rounded-lg sm:w-auto'>Get Started For Free</Button>
                    <Button variant="outline" className=' text-teal-800 font-bold text-sm md:text-lg lg:text-xl py-3 sm:py-5 px-4 sm:px-6 rounded-lg border-2 border-teal-800  sm:w-auto'>Contact</Button>
                    <Button variant="outline" className=' text-teal-800 font-bold text-sm md:text-lg lg:text-xl py-3 sm:py-5 px-4 sm:px-6 rounded-lg border-2 border-teal-800  sm:w-auto flex items-center justify-center'><ArrowUpRightIcon strokeWidth={3}  className="w-8 h-8" /></Button>
                </div>
            </div>

            <div className='flex flex-col w-full h-full items-center justify-center mt-2 lg:mt-0'>
            <BentoGrid className="w-full mx-auto max-w-4xl">
                {items.map((item, i) => (
                    <BentoGridItem
                    key={i}
                    header={item.header}
                    className={item.className}
                    />
                ))}
            </BentoGrid>
            </div>
          </div>
          <div className='mt-40 md:mt-4 lg:mt-0'>
            <StatsSection />
          </div>
        </div>
    );
}

export default HeroSection;