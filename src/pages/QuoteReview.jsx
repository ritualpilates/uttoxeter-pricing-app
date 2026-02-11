import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Loader2, X } from 'lucide-react';
import WizardProgress from '@/components/quotes/WizardProgress';
import jsPDF from 'jspdf';

export default function QuoteReview() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('id');

  const { data: quotes = [], isLoading: quoteLoading } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => base44.entities.Quote.filter({ id: quoteId }),
    enabled: !!quoteId
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['quoteDepartments', quoteId],
    queryFn: () => base44.entities.QuoteGroup.filter({ quote_id: quoteId }, 'sort_order'),
    enabled: !!quoteId
  });

  const { data: lines = [] } = useQuery({
    queryKey: ['quoteLines', quoteId],
    queryFn: () => base44.entities.QuoteLine.filter({ quote_id: quoteId }),
    enabled: !!quoteId
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.Settings.list()
  });

  useEffect(() => {
    const handlePopState = () => {
      navigate(createPageUrl('QuoteHygiene') + `?id=${quoteId}`, { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quoteId, navigate]);

  const quote = quotes[0];
  const serviceType = quote?.service_type || 'full';

  const rentalMultiplier = useMemo(() => {
    const setting = settings.find(s => s.key === 'rental_multiplier');
    return setting ? parseFloat(setting.value) : 2;
  }, [settings]);

  const totals = useMemo(() => {
    const garmentLines = lines.filter(l => l.item_type === 'garment');
    const hygieneLines = lines.filter(l => l.item_type === 'hygiene');

    let garmentWeekly = 0;
    let washWeekly = 0;

    garmentLines.forEach(line => {
      const dept = departments.find(d => d.id === line.department_id);
      const wearers = dept?.wearers || 1;
      const changesPerWeek = line.changes_per_week || 1;
      const setSize = line.set_size || 3;
      const contractWeeks = quote?.contract_weeks || 52;

      if (serviceType !== 'wash_only') {
        const rental = (line.unit_cost || 0) * rentalMultiplier * setSize * changesPerWeek / contractWeeks * wearers;
        garmentWeekly += rental;
      }

      if (serviceType !== 'full') {
        const wash = (line.wash_price_per_item || 0) * changesPerWeek * wearers;
        washWeekly += wash;
      }
    });

    const hygieneWeekly = hygieneLines.reduce((sum, l) => sum + ((l.weekly_price || 0) * (l.quantity || 0)), 0);
    const totalWeekly = garmentWeekly + hygieneWeekly;

    return { garmentWeekly, washWeekly, hygieneWeekly, totalWeekly };
  }, [lines, departments, quote, serviceType, rentalMultiplier]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text('Quote Summary', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Quote Ref: ${quote?.quote_ref || ''}`, 20, y);
    y += 5;
    doc.text(`Customer: ${quote?.customer_name || ''}`, 20, y);
    y += 5;
    doc.text(`Service Type: ${serviceType === 'full' ? 'Full Rental' : serviceType === 'split' ? 'Split Rental' : 'Wash Only'}`, 20, y);
    y += 10;

    doc.setFontSize(14);
    doc.text('Garment Rental', 20, y);
    y += 7;
    doc.setFontSize(10);

    const garmentLines = lines.filter(l => l.item_type === 'garment');
    departments.forEach(dept => {
      const deptLines = garmentLines.filter(l => l.department_id === dept.id);
      if (deptLines.length > 0) {
        doc.setFontSize(11);
        doc.text(dept.department_name, 20, y);
        y += 5;
        doc.setFontSize(9);
        deptLines.forEach(line => {
          doc.text(`${line.name} (Set of ${line.set_size})`, 25, y);
          if (serviceType !== 'full') {
            doc.text(`Wash: GBP ${line.wash_price_per_item?.toFixed(2)} per item`, 120, y);
          }
          y += 5;
        });
        y += 3;
      }
    });

    doc.setFontSize(11);
    doc.text(`Garment Weekly Total: GBP ${totals.garmentWeekly.toFixed(2)}`, 20, y);
    y += 10;

    if (serviceType !== 'full' && totals.washWeekly > 0) {
      doc.text(`Wash Weekly Total: GBP ${totals.washWeekly.toFixed(2)}`, 20, y);
      y += 10;
    }

    if (totals.hygieneWeekly > 0) {
      doc.setFontSize(14);
      doc.text('Hygiene Items', 20, y);
      y += 7;
      doc.setFontSize(10);
      const hygieneLines = lines.filter(l => l.item_type === 'hygiene');
      hygieneLines.forEach(line => {
        doc.text(`${line.name} x ${line.quantity}: GBP ${((line.weekly_price || 0) * (line.quantity || 0)).toFixed(2)}/week`, 25, y);
        y += 5;
      });
      doc.setFontSize(11);
      doc.text(`Hygiene Weekly Total: GBP ${totals.hygieneWeekly.toFixed(2)}`, 20, y);
      y += 10;
    }

    doc.setFontSize(16);
    doc.text(`Total Weekly: GBP ${totals.totalWeekly.toFixed(2)}`, 20, y);

    doc.save(`quote-${quote?.quote_ref || 'summary'}.pdf`);
  };

  const handleBack = () => {
    navigate(createPageUrl('QuoteHygiene') + `?id=${quoteId}`);
  };

  const handleExit = () => {
    navigate(createPageUrl('Quotes'));
  };

  if (!quoteId || quoteLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#203050]" />
      </div>
    );
  }

  const garmentLines = lines.filter(l => l.item_type === 'garment');
  const hygieneLines = lines.filter(l => l.item_type === 'hygiene');

  return (
    <div>
      <WizardProgress currentStep="review" />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#203050] mb-2">Review Quote</h1>
              <div className="flex items-center gap-3">
                <span className="text-[#5B6472]">{quote?.quote_ref}</span>
                <Badge variant="outline" className="border-[#203050] text-[#203050] bg-[#203050]/5">
                  {quote?.status === 'new' ? 'New' : 'Renewal'}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleExit}
              className="border-[#E0E0E0]"
            >
              <X className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>

        {/* Totals Summary */}
        <Card className="border border-[#E0E0E0] p-6 mb-6">
          <h2 className="text-lg font-bold text-[#203050] mb-4">Quote Totals</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#E0E0E0]">
              <span className="text-[#5B6472]">Garment Rental (Weekly)</span>
              <span className="font-bold text-[#203050]">£{totals.garmentWeekly.toFixed(2)}</span>
            </div>
            {serviceType !== 'full' && (
              <div className="flex justify-between items-center py-2 border-b border-[#E0E0E0]">
                <span className="text-[#5B6472]">Wash Cost (Weekly)</span>
                <span className="font-bold text-[#203050]">£{totals.washWeekly.toFixed(2)}</span>
              </div>
            )}
            {totals.hygieneWeekly > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-[#E0E0E0]">
                <span className="text-[#5B6472]">Hygiene Items (Weekly)</span>
                <span className="font-bold text-[#203050]">£{totals.hygieneWeekly.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 bg-[#203050]/5 px-4 rounded-lg">
              <span className="font-bold text-[#203050]">Total Weekly</span>
              <span className="text-2xl font-bold text-[#203050]">£{totals.totalWeekly.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Departments Breakdown */}
        <Card className="border border-[#E0E0E0] p-6 mb-6">
          <h2 className="text-lg font-bold text-[#203050] mb-4">Departments</h2>
          <div className="space-y-4">
            {departments.map(dept => {
              const deptLines = garmentLines.filter(l => l.department_id === dept.id);
              return (
                <div key={dept.id} className="border-b border-[#E0E0E0] pb-4 last:border-b-0">
                  <h3 className="font-bold text-[#1A1F2A] mb-2">{dept.department_name}</h3>
                  <p className="text-sm text-[#5B6472] mb-3">{dept.wearers} wearers</p>
                  <div className="space-y-2">
                    {deptLines.map((line, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex justify-between">
                          <span>{line.name} (Set of {line.set_size})</span>
                        </div>
                        {serviceType !== 'full' && (
                          <div className="text-xs text-[#5B6472] ml-4">
                            Wash: £{line.wash_price_per_item?.toFixed(2)} per item
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Hygiene Items */}
        {hygieneLines.length > 0 && (
          <Card className="border border-[#E0E0E0] p-6 mb-6">
            <h2 className="text-lg font-bold text-[#203050] mb-4">Hygiene Items</h2>
            <div className="space-y-2">
              {hygieneLines.map((line, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{line.name} x {line.quantity}</span>
                  <span className="font-medium">£{((line.weekly_price || 0) * (line.quantity || 0)).toFixed(2)}/week</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex justify-between gap-4">
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
            onClick={downloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}