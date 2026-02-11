import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Plus, Trash2, Users, Loader2 } from 'lucide-react';
import WizardProgress from '@/components/quotes/WizardProgress';

export default function QuoteDepartments() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('id');

  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: existingDepts = [], isLoading } = useQuery({
    queryKey: ['quoteDepartments', quoteId],
    queryFn: () => base44.entities.QuoteGroup.filter({ quote_id: quoteId }, 'sort_order'),
    enabled: !!quoteId
  });

  useEffect(() => {
    if (existingDepts.length > 0) {
      setDepartments(existingDepts.map(d => ({
        id: d.id,
        department_name: d.department_name,
        wearers: d.wearers
      })));
    }
  }, [existingDepts]);

  useEffect(() => {
    const handlePopState = () => {
      navigate(createPageUrl('QuoteStart') + `?id=${quoteId}`, { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quoteId, navigate]);

  const addDepartment = () => {
    setDepartments([...departments, { department_name: '', wearers: 1 }]);
  };

  const updateDepartment = (index, field, value) => {
    const updated = [...departments];
    updated[index][field] = value;
    setDepartments(updated);
  };

  const removeDepartment = (index) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const existingIds = existingDepts.map(d => d.id);
      
      // Delete removed departments
      for (const existing of existingDepts) {
        if (!departments.find(d => d.id === existing.id)) {
          await base44.entities.QuoteGroup.delete(existing.id);
        }
      }

      // Update or create departments
      for (let i = 0; i < departments.length; i++) {
        const dept = departments[i];
        if (dept.id && existingIds.includes(dept.id)) {
          await base44.entities.QuoteGroup.update(dept.id, {
            department_name: dept.department_name,
            wearers: dept.wearers,
            sort_order: i
          });
        } else {
          await base44.entities.QuoteGroup.create({
            quote_id: quoteId,
            department_name: dept.department_name,
            wearers: dept.wearers,
            sort_order: i
          });
        }
      }

      navigate(createPageUrl('QuoteGarments') + `?id=${quoteId}`);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(createPageUrl('QuoteStart') + `?id=${quoteId}`);
  };

  if (!quoteId || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#203050]" />
      </div>
    );
  }

  const canProceed = departments.length > 0 && departments.every(d => d.department_name.trim() && d.wearers > 0);

  return (
    <div>
      <WizardProgress currentStep="departments" />
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#203050] mb-2">Departments</h1>
          <p className="text-[#5B6472]">Add departments and number of wearers</p>
        </div>

        <Card className="border border-[#E0E0E0] p-6">
          <div className="space-y-4">
            {departments.map((dept, index) => (
              <div key={index} className="flex items-end gap-3 p-4 bg-[#F7F8FA] rounded-lg">
                <div className="w-10 h-10 bg-[#203050] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <Label className="text-[#1A1F2A] font-medium text-sm">Department Name</Label>
                  <Input
                    value={dept.department_name}
                    onChange={(e) => updateDepartment(index, 'department_name', e.target.value)}
                    placeholder="e.g. Engineers, Warehouse"
                    className="mt-1 border-[#E0E0E0]"
                  />
                </div>
                <div className="w-32">
                  <Label className="text-[#1A1F2A] font-medium text-sm">Wearers</Label>
                  <Input
                    type="number"
                    min="1"
                    value={dept.wearers}
                    onChange={(e) => updateDepartment(index, 'wearers', parseInt(e.target.value) || 1)}
                    className="mt-1 border-[#E0E0E0]"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => removeDepartment(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full border-[#203050] text-[#203050] hover:bg-[#F7F8FA]"
              onClick={addDepartment}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
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