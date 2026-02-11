import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import WizardProgress from '@/components/quotes/WizardProgress';

const HYGIENE_ITEMS = [
  { type: 'mat_5x3', label: 'Mat 5x3', price: 2.00 },
  { type: 'mat_6x4', label: 'Mat 6x4', price: 2.50 },
  { type: 'mat_10x3', label: 'Mat 10x3', price: 3.00 },
  { type: 'tea_towels', label: 'Tea Towels (10)', price: 2.00 },
  { type: 'hand_towels', label: 'Hand Towels (5)', price: 2.00 }
];

export default function QuoteHygiene() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('id');

  const [hygieneItems, setHygieneItems] = useState(
    HYGIENE_ITEMS.map(item => ({ ...item, quantity: 0 }))
  );
  const [saving, setSaving] = useState(false);

  const { data: existingLines = [], isLoading } = useQuery({
    queryKey: ['quoteHygieneLines', quoteId],
    queryFn: () => base44.entities.QuoteLine.filter({ quote_id: quoteId, item_type: 'hygiene' }),
    enabled: !!quoteId
  });

  useEffect(() => {
    if (existingLines.length > 0) {
      setHygieneItems(prev => prev.map(item => {
        const existing = existingLines.find(l => l.hygiene_item_type === item.type);
        return existing ? { ...item, id: existing.id, quantity: existing.quantity } : item;
      }));
    }
  }, [existingLines]);

  useEffect(() => {
    const handlePopState = () => {
      navigate(createPageUrl('QuoteGarments') + `?id=${quoteId}`, { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quoteId, navigate]);

  const updateQuantity = (type, quantity) => {
    setHygieneItems(prev => prev.map(item => 
      item.type === type ? { ...item, quantity: Math.max(0, quantity) } : item
    ));
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const existingIds = existingLines.map(l => l.id);

      // Delete items with quantity 0
      for (const existing of existingLines) {
        const current = hygieneItems.find(h => h.type === existing.hygiene_item_type);
        if (!current || current.quantity === 0) {
          await base44.entities.QuoteLine.delete(existing.id);
        }
      }

      // Update or create hygiene items
      for (const item of hygieneItems) {
        if (item.quantity > 0) {
          const lineData = {
            quote_id: quoteId,
            department_id: null,
            item_type: 'hygiene',
            name: item.label,
            hygiene_item_type: item.type,
            weekly_price: item.price,
            quantity: item.quantity
          };

          if (item.id && existingIds.includes(item.id)) {
            await base44.entities.QuoteLine.update(item.id, lineData);
          } else {
            await base44.entities.QuoteLine.create(lineData);
          }
        }
      }

      navigate(createPageUrl('QuoteReview') + `?id=${quoteId}`);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(createPageUrl('QuoteGarments') + `?id=${quoteId}`);
  };

  if (!quoteId || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#203050]" />
      </div>
    );
  }

  const weeklyTotal = hygieneItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div>
      <WizardProgress currentStep="hygiene" />
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#203050] mb-2">Hygiene Items</h1>
          <p className="text-[#5B6472]">Add hygiene rental items (optional)</p>
        </div>

        <Card className="border border-[#E0E0E0] p-6">
          <div className="space-y-4">
            {hygieneItems.map(item => (
              <div key={item.type} className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-[#1A1F2A]">{item.label}</div>
                  <div className="text-sm text-[#5B6472]">£{item.price.toFixed(2)} per week</div>
                </div>
                <div className="w-24">
                  <Label className="text-xs text-[#5B6472]">Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.type, parseInt(e.target.value) || 0)}
                    className="mt-1 border-[#E0E0E0]"
                  />
                </div>
                <div className="w-24 text-right">
                  <div className="text-sm text-[#5B6472]">Weekly</div>
                  <div className="font-bold text-[#203050]">
                    £{(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#E0E0E0] flex justify-between items-center">
            <span className="font-medium text-[#1A1F2A]">Total Weekly Hygiene</span>
            <span className="text-xl font-bold text-[#203050]">£{weeklyTotal.toFixed(2)}</span>
          </div>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-[#E0E0E0]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            className="bg-[#203050] hover:bg-[#304060] text-white"
            onClick={handleNext}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}