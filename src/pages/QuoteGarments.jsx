import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Plus, Trash2, ExternalLink, Loader2, Users } from 'lucide-react';
import WizardProgress from '@/components/quotes/WizardProgress';

const SET_SIZES = [3, 5, 7, 9, 11];

export default function QuoteGarments() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('id');

  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const { data: quote } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => base44.entities.Quote.filter({ id: quoteId }),
    enabled: !!quoteId
  });

  const { data: depts = [], isLoading: deptsLoading } = useQuery({
    queryKey: ['quoteDepartments', quoteId],
    queryFn: () => base44.entities.QuoteGroup.filter({ quote_id: quoteId }, 'sort_order'),
    enabled: !!quoteId
  });

  const { data: lines = [] } = useQuery({
    queryKey: ['quoteLines', quoteId],
    queryFn: () => base44.entities.QuoteLine.filter({ quote_id: quoteId, item_type: 'garment' }),
    enabled: !!quoteId
  });

  const { data: garments = [] } = useQuery({
    queryKey: ['garments'],
    queryFn: () => base44.entities.Garment.filter({ active: true })
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.Settings.list()
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const changesMapping = (() => {
    const setting = settings.find(s => s.key === 'changes_mapping');
    if (setting) {
      try {
        return JSON.parse(setting.value);
      } catch {
        return { 3: 1, 5: 2, 7: 3, 9: 5, 11: 5 };
      }
    }
    return { 3: 1, 5: 2, 7: 3, 9: 5, 11: 5 };
  })();

  useEffect(() => {
    if (depts.length > 0) {
      const deptsWithLines = depts.map(d => ({
        ...d,
        lines: lines.filter(l => l.department_id === d.id).map(l => ({
          id: l.id,
          garment_id: l.garment_id,
          name: l.name,
          category: l.category,
          unit_cost: l.unit_cost,
          set_size: l.set_size,
          wash_price_per_item: l.wash_price_per_item
        }))
      }));
      setDepartments(deptsWithLines);
    }
  }, [depts, lines]);

  useEffect(() => {
    const handlePopState = () => {
      navigate(createPageUrl('QuoteDepartments') + `?id=${quoteId}`, { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quoteId, navigate]);

  const addLine = (deptIndex) => {
    const updated = [...departments];
    updated[deptIndex].lines = [
      ...(updated[deptIndex].lines || []),
      { name: '', category: 'coveralls', unit_cost: 0, set_size: 3, wash_price_per_item: 0 }
    ];
    setDepartments(updated);
  };

  const updateLine = (deptIndex, lineIndex, field, value) => {
    const updated = [...departments];
    updated[deptIndex].lines[lineIndex][field] = value;
    setDepartments(updated);
  };

  const selectGarment = (deptIndex, lineIndex, garmentId) => {
    const garment = garments.find(g => g.id === garmentId);
    if (!garment) return;

    const updated = [...departments];
    const serviceType = quote?.[0]?.service_type || 'full';
    let washPrice = 0;
    
    if (serviceType === 'full') {
      washPrice = garment.wash_price_full || 0;
    } else if (serviceType === 'split') {
      washPrice = garment.wash_price_split || 0;
    } else if (serviceType === 'wash_only') {
      washPrice = garment.wash_price_wash_only || 0;
    }

    updated[deptIndex].lines[lineIndex] = {
      ...updated[deptIndex].lines[lineIndex],
      garment_id: garmentId,
      name: garment.name,
      category: garment.category,
      unit_cost: garment.default_cost_price || 0,
      wash_price_per_item: washPrice
    };
    setDepartments(updated);
  };

  const removeLine = (deptIndex, lineIndex) => {
    const updated = [...departments];
    updated[deptIndex].lines = updated[deptIndex].lines.filter((_, i) => i !== lineIndex);
    setDepartments(updated);
  };

  const handleStockCheck = (garmentId) => {
    const garment = garments.find(g => g.id === garmentId);
    if (!garment) return;

    if (garment.product_url) {
      window.open(garment.product_url, '_blank');
    } else if (garment.supplier_name === 'Portwest' && garment.sku) {
      window.open(`https://www.portwest.com/search?q=${garment.sku}`, '_blank');
    }
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const existingLines = lines.filter(l => l.item_type === 'garment');
      const existingIds = existingLines.map(l => l.id);

      // Delete removed lines
      for (const existing of existingLines) {
        const stillExists = departments.some(d => 
          d.lines.some(l => l.id === existing.id)
        );
        if (!stillExists) {
          await base44.entities.QuoteLine.delete(existing.id);
        }
      }

      // Update or create lines
      for (const dept of departments) {
        for (let i = 0; i < dept.lines.length; i++) {
          const line = dept.lines[i];
          const lineData = {
            quote_id: quoteId,
            department_id: dept.id,
            item_type: 'garment',
            garment_id: line.garment_id,
            name: line.name,
            category: line.category,
            unit_cost: line.unit_cost,
            set_size: line.set_size,
            changes_per_week: changesMapping[line.set_size] || 1,
            wash_price_per_item: line.wash_price_per_item,
            sort_order: i
          };

          if (line.id && existingIds.includes(line.id)) {
            await base44.entities.QuoteLine.update(line.id, lineData);
          } else {
            await base44.entities.QuoteLine.create(lineData);
          }
        }
      }

      navigate(createPageUrl('QuoteHygiene') + `?id=${quoteId}`);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(createPageUrl('QuoteDepartments') + `?id=${quoteId}`);
  };

  if (!quoteId || deptsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#203050]" />
      </div>
    );
  }

  const canProceed = departments.every(d => d.lines && d.lines.length > 0);
  const serviceType = quote?.[0]?.service_type || 'full';
  const showWashPrice = serviceType !== 'full';

  return (
    <div>
      <WizardProgress currentStep="garments" />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#203050] mb-2">Garments</h1>
          <p className="text-[#5B6472]">Select garments and set sizes for each department</p>
        </div>

        <div className="space-y-6">
          {departments.map((dept, deptIndex) => (
            <Card key={dept.id} className="border border-[#E0E0E0] overflow-hidden">
              <div className="bg-[#203050]/5 px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#203050] rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#203050]">{dept.department_name}</h3>
                  <p className="text-sm text-[#5B6472]">{dept.wearers} wearers</p>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {dept.lines?.map((line, lineIndex) => (
                  <div key={lineIndex} className="grid grid-cols-1 lg:grid-cols-5 gap-3 p-4 bg-[#F7F8FA] rounded-lg">
                    <div className="lg:col-span-2">
                      <Label className="text-xs text-[#5B6472]">Garment</Label>
                      <Select 
                        value={line.garment_id || ''} 
                        onValueChange={(v) => selectGarment(deptIndex, lineIndex, v)}
                      >
                        <SelectTrigger className="mt-1 border-[#E0E0E0]">
                          <SelectValue placeholder="Select garment" />
                        </SelectTrigger>
                        <SelectContent>
                          {garments.filter(g => g.category === line.category).map(g => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-[#5B6472]">Category</Label>
                      <Select 
                        value={line.category} 
                        onValueChange={(v) => updateLine(deptIndex, lineIndex, 'category', v)}
                      >
                        <SelectTrigger className="mt-1 border-[#E0E0E0]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coveralls">Coveralls</SelectItem>
                          <SelectItem value="trousers">Trousers</SelectItem>
                          <SelectItem value="jackets">Jackets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-[#5B6472]">Set Size</Label>
                      <Select 
                        value={String(line.set_size)} 
                        onValueChange={(v) => updateLine(deptIndex, lineIndex, 'set_size', parseInt(v))}
                      >
                        <SelectTrigger className="mt-1 border-[#E0E0E0]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SET_SIZES.map(size => (
                            <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end gap-2">
                      {user && line.garment_id && (() => {
                        const garment = garments.find(g => g.id === line.garment_id);
                        return garment && (garment.product_url || (garment.supplier_name === 'Portwest' && garment.sku));
                      })() && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-[#E0E0E0] hover:bg-[#F7F8FA]"
                          onClick={() => handleStockCheck(line.garment_id)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => removeLine(deptIndex, lineIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {showWashPrice && (
                      <div className="lg:col-span-5">
                        <Label className="text-xs text-[#5B6472]">Wash Price Per Item</Label>
                        <div className="text-sm font-medium text-[#1A1F2A] mt-1">
                          £{line.wash_price_per_item?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-[#203050] text-[#203050] hover:bg-white"
                  onClick={() => addLine(deptIndex)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Garment
                </Button>
              </div>
            </Card>
          ))}
        </div>

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