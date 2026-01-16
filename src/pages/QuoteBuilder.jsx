import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Plus, Loader2, CheckCircle } from 'lucide-react';
import WearerGroupForm from '@/components/quotes/WearerGroupForm';
import TotalsCard from '@/components/quotes/TotalsCard';
import BreakdownCard from '@/components/quotes/BreakdownCard';

const SERVICE_TYPES = [
  { value: 'full', label: 'Full Rental' },
  { value: 'split', label: 'Split Rental' },
  { value: 'wash_only', label: 'Wash Only' }
];

const CONTRACT_WEEKS = [52, 104, 156];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'expired', label: 'Expired' }
];

export default function QuoteBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('id');

  const [quote, setQuote] = useState({
    customer_name: '',
    site_name: '',
    service_type: 'full',
    contract_weeks: 52,
    status: 'draft'
  });
  const [groups, setGroups] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch quote data
  const { data: quoteData, isLoading: quoteLoading } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => base44.entities.Quote.filter({ id: quoteId }),
    enabled: !!quoteId
  });

  // Fetch groups
  const { data: groupsData = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['quoteGroups', quoteId],
    queryFn: () => base44.entities.QuoteGroup.filter({ quote_id: quoteId }, 'sort_order'),
    enabled: !!quoteId
  });

  // Fetch lines
  const { data: linesData = [] } = useQuery({
    queryKey: ['quoteLines'],
    queryFn: () => base44.entities.QuoteLine.list()
  });

  // Fetch garments
  const { data: garments = [] } = useQuery({
    queryKey: ['garments'],
    queryFn: () => base44.entities.Garment.filter({ active: true })
  });

  // Fetch settings
  const { data: settings = [] } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.Settings.list()
  });

  // Parse settings
  const rentalMultiplier = useMemo(() => {
    const setting = settings.find(s => s.key === 'rental_multiplier');
    return setting ? parseFloat(setting.value) : 2;
  }, [settings]);

  const changesMapping = useMemo(() => {
    const setting = settings.find(s => s.key === 'changes_mapping');
    if (setting) {
      try {
        return JSON.parse(setting.value);
      } catch {
        return { 3: 1, 5: 2, 7: 3, 9: 5, 11: 5 };
      }
    }
    return { 3: 1, 5: 2, 7: 3, 9: 5, 11: 5 };
  }, [settings]);

  // Load quote data
  useEffect(() => {
    if (quoteData && quoteData.length > 0) {
      const q = quoteData[0];
      setQuote({
        customer_name: q.customer_name || '',
        site_name: q.site_name || '',
        service_type: q.service_type || 'full',
        contract_weeks: q.contract_weeks || 52,
        status: q.status || 'draft',
        quote_ref: q.quote_ref
      });
    }
  }, [quoteData]);

  // Load groups with lines
  useEffect(() => {
    if (groupsData.length > 0) {
      const groupsWithLines = groupsData.map(g => ({
        ...g,
        lines: linesData.filter(l => l.group_id === g.id)
      }));
      setGroups(groupsWithLines);
    }
  }, [groupsData, linesData]);

  // Get wash price based on service type and category
  const getWashPrice = (category, serviceType) => {
    const garment = garments.find(g => g.category === category);
    if (!garment) {
      // Default wash prices
      const defaults = {
        full: { coveralls: 1.0, trousers: 0.6, jackets: 0.6 },
        split: { coveralls: 1.1, trousers: 0.7, jackets: 0.7 },
        wash_only: { coveralls: 1.5, trousers: 1.0, jackets: 1.0 }
      };
      return defaults[serviceType]?.[category] || 0;
    }
    switch (serviceType) {
      case 'full': return garment.wash_price_full || 0;
      case 'split': return garment.wash_price_split || 0;
      case 'wash_only': return garment.wash_price_wash_only || 0;
      default: return 0;
    }
  };

  // Calculate totals
  const calculateTotals = useMemo(() => {
    const groupTotals = groups.map(group => {
      const changesPerWeek = changesMapping[group.set_size] || 1;
      
      let rentalRecoveryTotal = 0;
      let washCostTotal = 0;

      (group.lines || []).forEach(line => {
        const washPrice = getWashPrice(line.category, quote.service_type);
        
        // Rental recovery: if wash_only then 0, else cost_price * multiplier * set_size * changes / contract_weeks
        let rentalRecoveryWeekly = 0;
        if (quote.service_type !== 'wash_only') {
          rentalRecoveryWeekly = (line.cost_price || 0) * rentalMultiplier * (group.set_size || 3) * changesPerWeek / (quote.contract_weeks || 52);
        }
        
        // Wash weekly: wash_price * changes_per_week * quantity_in_set
        const washWeekly = washPrice * changesPerWeek * (line.quantity_in_set || 0);
        
        rentalRecoveryTotal += rentalRecoveryWeekly;
        washCostTotal += washWeekly;
      });

      const perWearerWeekly = rentalRecoveryTotal + washCostTotal;
      const groupWeekly = perWearerWeekly * (group.wearers || 0);

      return {
        rentalRecovery: rentalRecoveryTotal,
        washCost: washCostTotal,
        perWearerWeekly,
        groupWeekly
      };
    });

    const weeklyTotal = groupTotals.reduce((sum, g) => sum + g.groupWeekly, 0);
    const contractWeeks = quote.contract_weeks || 52;
    const monthlyTotal = weeklyTotal * contractWeeks / 12;
    const annualTotal = weeklyTotal * Math.min(contractWeeks, 52);
    const contractTotal = weeklyTotal * contractWeeks;

    return { groupTotals, weeklyTotal, monthlyTotal, annualTotal, contractTotal, contractWeeks };
  }, [groups, quote.service_type, quote.contract_weeks, changesMapping, rentalMultiplier, garments]);

  // Save quote
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update quote
      await base44.entities.Quote.update(quoteId, {
        customer_name: quote.customer_name,
        site_name: quote.site_name,
        service_type: quote.service_type,
        contract_weeks: quote.contract_weeks,
        status: quote.status
      });

      // Get existing groups and lines
      const existingGroups = await base44.entities.QuoteGroup.filter({ quote_id: quoteId });
      const existingGroupIds = existingGroups.map(g => g.id);
      const existingLines = linesData.filter(l => existingGroupIds.includes(l.group_id));

      // Delete removed groups and their lines
      for (const existingGroup of existingGroups) {
        const stillExists = groups.find(g => g.id === existingGroup.id);
        if (!stillExists) {
          const groupLines = existingLines.filter(l => l.group_id === existingGroup.id);
          for (const line of groupLines) {
            await base44.entities.QuoteLine.delete(line.id);
          }
          await base44.entities.QuoteGroup.delete(existingGroup.id);
        }
      }

      // Update or create groups
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const changesPerWeek = changesMapping[group.set_size] || 1;
        
        let savedGroup;
        if (group.id && existingGroupIds.includes(group.id)) {
          // Update existing group
          await base44.entities.QuoteGroup.update(group.id, {
            role_name: group.role_name,
            wearers: group.wearers,
            set_size: group.set_size,
            changes_per_week: changesPerWeek,
            sort_order: i
          });
          savedGroup = { id: group.id };
        } else {
          // Create new group
          savedGroup = await base44.entities.QuoteGroup.create({
            quote_id: quoteId,
            role_name: group.role_name,
            wearers: group.wearers,
            set_size: group.set_size,
            changes_per_week: changesPerWeek,
            sort_order: i
          });
        }

        // Handle lines for this group
        const existingGroupLines = existingLines.filter(l => l.group_id === group.id);
        const existingLineIds = existingGroupLines.map(l => l.id);

        // Delete removed lines
        for (const existingLine of existingGroupLines) {
          const stillExists = (group.lines || []).find(l => l.id === existingLine.id);
          if (!stillExists) {
            await base44.entities.QuoteLine.delete(existingLine.id);
          }
        }

        // Update or create lines
        for (const line of (group.lines || [])) {
          if (line.id && existingLineIds.includes(line.id)) {
            await base44.entities.QuoteLine.update(line.id, {
              category: line.category,
              description: line.description,
              cost_price: line.cost_price,
              quantity_in_set: line.quantity_in_set
            });
          } else {
            await base44.entities.QuoteLine.create({
              group_id: savedGroup.id,
              category: line.category,
              description: line.description,
              cost_price: line.cost_price,
              quantity_in_set: line.quantity_in_set
            });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quoteGroups', quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quoteLines'] });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add new group
  const addGroup = () => {
    setGroups([...groups, {
      role_name: '',
      wearers: 1,
      set_size: 3,
      changes_per_week: changesMapping[3] || 1,
      sort_order: groups.length,
      lines: []
    }]);
  };

  // Update group field
  const updateGroup = (groupIndex, field, value) => {
    const newGroups = [...groups];
    newGroups[groupIndex] = { ...newGroups[groupIndex], [field]: value };
    if (field === 'set_size') {
      newGroups[groupIndex].changes_per_week = changesMapping[value] || 1;
    }
    setGroups(newGroups);
  };

  // Remove group
  const removeGroup = (groupIndex) => {
    setGroups(groups.filter((_, i) => i !== groupIndex));
  };

  // Add line to group
  const addLine = (groupIndex) => {
    const newGroups = [...groups];
    const group = newGroups[groupIndex];
    
    // Calculate remaining quantity needed
    const currentTotal = (group.lines || []).reduce((sum, line) => sum + (line.quantity_in_set || 0), 0);
    const remainingQty = Math.max(1, (group.set_size || 3) - currentTotal);
    
    newGroups[groupIndex].lines = [
      ...(newGroups[groupIndex].lines || []),
      { category: 'coveralls', description: '', cost_price: 0, quantity_in_set: remainingQty }
    ];
    setGroups(newGroups);
  };

  // Update line
  const updateLine = (groupIndex, lineIndex, field, value) => {
    const newGroups = [...groups];
    newGroups[groupIndex].lines[lineIndex] = {
      ...newGroups[groupIndex].lines[lineIndex],
      [field]: value
    };
    setGroups(newGroups);
  };

  // Remove line
  const removeLine = (groupIndex, lineIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex].lines = newGroups[groupIndex].lines.filter((_, i) => i !== lineIndex);
    setGroups(newGroups);
  };

  if (quoteLoading || groupsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#C41E3A] hover:bg-[#C41E3A]/5"
            onClick={() => navigate(createPageUrl('Quotes'))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#C41E3A]">{quote.quote_ref}</h1>
              <Badge variant="outline" className="border-[#C41E3A] text-[#C41E3A]">
                {STATUS_OPTIONS.find(s => s.value === quote.status)?.label}
              </Badge>
            </div>
            <p className="text-[#2F2F2F]/70 text-sm">Edit quote details and pricing</p>
          </div>
        </div>
        <Button
          className={`${saveSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-[#C41E3A] hover:bg-[#a01730]'} text-white font-semibold transition-colors`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saveSuccess ? 'Saved!' : 'Save Quote'}
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Details Card */}
          <Card className="border border-[#E6E6E6] overflow-hidden">
            <div className="bg-[#C41E3A] px-5 py-4">
              <h3 className="text-white font-bold text-lg">Quote Details</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#2F2F2F] font-medium">Customer Name</Label>
                  <Input
                    value={quote.customer_name}
                    onChange={(e) => setQuote({ ...quote, customer_name: e.target.value })}
                    placeholder="Enter customer name"
                    className="mt-1.5 border-[#E6E6E6] focus:border-[#C41E3A] focus:ring-[#C41E3A]"
                  />
                </div>
                <div>
                  <Label className="text-[#2F2F2F] font-medium">Site Name</Label>
                  <Input
                    value={quote.site_name}
                    onChange={(e) => setQuote({ ...quote, site_name: e.target.value })}
                    placeholder="Enter site name"
                    className="mt-1.5 border-[#E6E6E6] focus:border-[#C41E3A] focus:ring-[#C41E3A]"
                  />
                </div>
                <div>
                  <Label className="text-[#2F2F2F] font-medium">Service Type</Label>
                  <Select 
                    value={quote.service_type} 
                    onValueChange={(v) => setQuote({ ...quote, service_type: v })}
                  >
                    <SelectTrigger className="mt-1.5 border-[#E6E6E6]">
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
                  <Label className="text-[#2F2F2F] font-medium">Contract Weeks</Label>
                  <Select 
                    value={String(quote.contract_weeks)} 
                    onValueChange={(v) => setQuote({ ...quote, contract_weeks: parseInt(v) })}
                  >
                    <SelectTrigger className="mt-1.5 border-[#E6E6E6]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_WEEKS.map(weeks => (
                        <SelectItem key={weeks} value={String(weeks)}>{weeks} weeks</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#2F2F2F] font-medium">Status</Label>
                  <Select 
                    value={quote.status} 
                    onValueChange={(v) => setQuote({ ...quote, status: v })}
                  >
                    <SelectTrigger className="mt-1.5 border-[#E6E6E6]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Wearer Groups */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#C41E3A]">Wearer Groups</h2>
              <Button
                variant="outline"
                className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A]/5"
                onClick={addGroup}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Group
              </Button>
            </div>

            {groups.length === 0 ? (
              <Card className="border border-dashed border-[#E6E6E6] p-8 text-center">
                <p className="text-[#2F2F2F]/60 mb-4">No wearer groups added yet</p>
                <Button
                  variant="outline"
                  className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A]/5"
                  onClick={addGroup}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Group
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {groups.map((group, groupIndex) => (
                  <WearerGroupForm
                    key={groupIndex}
                    group={group}
                    groupIndex={groupIndex}
                    changesMapping={changesMapping}
                    garments={garments}
                    serviceType={quote.service_type}
                    onGroupChange={(field, value) => updateGroup(groupIndex, field, value)}
                    onLineChange={(lineIndex, field, value) => updateLine(groupIndex, lineIndex, field, value)}
                    onAddLine={() => addLine(groupIndex)}
                    onRemoveLine={(lineIndex) => removeLine(groupIndex, lineIndex)}
                    onRemoveGroup={() => removeGroup(groupIndex)}
                    groupTotals={calculateTotals.groupTotals[groupIndex]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Totals */}
        <div className="space-y-6">
          <div className="lg:sticky lg:top-8">
            <TotalsCard
              weeklyTotal={calculateTotals.weeklyTotal}
              monthlyTotal={calculateTotals.monthlyTotal}
              annualTotal={calculateTotals.annualTotal}
              contractTotal={calculateTotals.contractTotal}
              contractWeeks={calculateTotals.contractWeeks}
            />
            
            <div className="mt-6">
              <BreakdownCard
                groups={groups}
                groupTotals={calculateTotals.groupTotals}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}