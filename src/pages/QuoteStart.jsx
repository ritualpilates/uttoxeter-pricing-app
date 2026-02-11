import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import WizardProgress from '@/components/quotes/WizardProgress';

const SERVICE_TYPES = [
  { value: 'full', label: 'Full Rental' },
  { value: 'split', label: 'Split Rental' },
  { value: 'wash_only', label: 'Wash Only' }
];

const CONTRACT_WEEKS = [52, 104, 156];

export default function QuoteStart() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('id');

  const [loading, setLoading] = useState(!!quoteId);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    quote_ref: '',
    customer_name: '',
    status: 'renewal',
    service_type: 'full',
    contract_weeks: 52
  });

  useEffect(() => {
    if (quoteId) {
      base44.entities.Quote.filter({ id: quoteId }).then(quotes => {
        if (quotes.length > 0) {
          const quote = quotes[0];
          setFormData({
            quote_ref: quote.quote_ref || '',
            customer_name: quote.customer_name || '',
            status: quote.status || 'renewal',
            service_type: quote.service_type || 'full',
            contract_weeks: quote.contract_weeks || 52
          });
        }
        setLoading(false);
      });
    }
  }, [quoteId]);

  const handleNext = async () => {
    setSaving(true);
    try {
      let savedQuoteId = quoteId;
      
      if (quoteId) {
        await base44.entities.Quote.update(quoteId, formData);
      } else {
        const newQuote = await base44.entities.Quote.create(formData);
        savedQuoteId = newQuote.id;
      }
      
      navigate(createPageUrl('QuoteDepartments') + `?id=${savedQuoteId}`);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = formData.quote_ref.trim() && formData.customer_name.trim();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#203050]" />
      </div>
    );
  }

  return (
    <div>
      <WizardProgress currentStep="start" />
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Quotes'))}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#203050]">New Quote</h1>
              <p className="text-[#5B6472]">Enter customer and quote details</p>
            </div>
          </div>
        </div>

        <Card className="border border-[#E0E0E0] p-6 space-y-6">
          <div>
            <Label className="text-[#1A1F2A] font-medium">Quote Reference *</Label>
            <Input
              value={formData.quote_ref}
              onChange={(e) => setFormData({ ...formData, quote_ref: e.target.value })}
              placeholder="e.g. Q2026-001"
              className="mt-1.5 border-[#E0E0E0]"
            />
          </div>

          <div>
            <Label className="text-[#1A1F2A] font-medium">Customer Name *</Label>
            <Input
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Enter customer or company name"
              className="mt-1.5 border-[#E0E0E0]"
            />
          </div>

          <div>
            <Label className="text-[#1A1F2A] font-medium">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger className="mt-1.5 border-[#E0E0E0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="renewal">Renewal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[#1A1F2A] font-medium">Service Type</Label>
            <Select 
              value={formData.service_type} 
              onValueChange={(v) => setFormData({ ...formData, service_type: v })}
            >
              <SelectTrigger className="mt-1.5 border-[#E0E0E0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[#1A1F2A] font-medium">Contract Weeks</Label>
            <Select 
              value={String(formData.contract_weeks)} 
              onValueChange={(v) => setFormData({ ...formData, contract_weeks: parseInt(v) })}
            >
              <SelectTrigger className="mt-1.5 border-[#E0E0E0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_WEEKS.map(weeks => (
                  <SelectItem key={weeks} value={String(weeks)}>{weeks} weeks</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="flex justify-end mt-6">
          <Button
            className="bg-[#203050] hover:bg-[#304060] text-white"
            onClick={handleNext}
            disabled={!canProceed || saving}
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