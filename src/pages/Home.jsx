import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const GARMENT_CATEGORIES = [
  {
    title: 'Coveralls',
    description: 'Complete protection workwear solutions',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696a9314c17d9cb3d4e952c0/75d52baa3_Screenshot2026-01-24152241.png',
    category: 'coveralls'
  },
  {
    title: 'Trousers',
    description: 'Durable work trousers and pants',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696a9314c17d9cb3d4e952c0/5d6645e39_Screenshot2026-01-24152209.png',
    category: 'trousers'
  },
  {
    title: 'Jackets',
    description: 'Professional workwear jackets and coats',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696a9314c17d9cb3d4e952c0/4ef619345_Screenshot2026-01-24152033.png',
    category: 'jackets'
  },
  {
    title: 'Hi-Vis Jackets',
    description: 'High visibility safety workwear',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696a9314c17d9cb3d4e952c0/d1967db6c_Screenshot2026-01-24153215.png',
    category: 'jackets'
  }
];

export default function Home() {
  const navigate = useNavigate();

  const handleGetQuote = () => {
    navigate(createPageUrl('QuoteStart'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F8FA] to-white">
      {/* Hero Section */}
      <div className="bg-[#203050] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            LB Pricing Solutions
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Professional workwear rental solutions for your business
          </p>
          <Button
            size="lg"
            className="bg-white text-[#203050] hover:bg-gray-100 text-lg px-8"
            onClick={handleGetQuote}
          >
            Get a Quote
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Catalogue Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#203050] mb-4">Our Workwear Range</h2>
          <p className="text-[#5B6472] text-lg">
            Browse our comprehensive selection of professional workwear
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {GARMENT_CATEGORIES.map((category, index) => (
            <Card 
              key={index}
              className="group cursor-pointer border border-[#E0E0E0] overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-[#203050]"
              onClick={handleGetQuote}
            >
              <div className="aspect-square bg-white flex items-center justify-center p-8 overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-[#203050] mb-2 group-hover:text-[#405060] transition-colors">
                  {category.title}
                </h3>
                <p className="text-[#5B6472] text-sm mb-4">
                  {category.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-[#203050] text-[#203050] hover:bg-[#203050] hover:text-white"
                >
                  View Options
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 border-t border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-[#203050] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">✓</span>
              </div>
              <h3 className="text-xl font-bold text-[#203050] mb-2">Quality Workwear</h3>
              <p className="text-[#5B6472]">
                Premium quality garments from trusted suppliers
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#203050] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">£</span>
              </div>
              <h3 className="text-xl font-bold text-[#203050] mb-2">Flexible Pricing</h3>
              <p className="text-[#5B6472]">
                Full rental, split rental, and wash-only options
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#203050] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white font-bold">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-[#203050] mb-2">Fast Quotes</h3>
              <p className="text-[#5B6472]">
                Get instant pricing tailored to your requirements
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#203050] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-white/90 mb-8">
            Create a custom quote for your workwear needs today
          </p>
          <Button
            size="lg"
            className="bg-white text-[#203050] hover:bg-gray-100 text-lg px-8"
            onClick={handleGetQuote}
          >
            Start Your Quote
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}