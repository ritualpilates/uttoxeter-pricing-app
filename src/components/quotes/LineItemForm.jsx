import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'coveralls', label: 'Coveralls' },
  { value: 'trousers', label: 'Trousers' },
  { value: 'jackets', label: 'Jackets' }
];

export default function LineItemForm({ line, garments, serviceType, onChange, onRemove }) {
  const filteredGarments = garments.filter(g => g.category === line.category && g.active);

  const handleGarmentSelect = (garmentId) => {
    const garment = garments.find(g => g.id === garmentId);
    if (garment) {
      onChange('description', garment.name);
      onChange('cost_price', garment.default_cost_price || 0);
    }
  };

  return (
    <div className="bg-white border border-[#E6E6E6] rounded-lg p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Category */}
        <div>
          <label className="text-xs font-medium text-[#2F2F2F]/70 mb-1 block">Category</label>
          <Select value={line.category || ''} onValueChange={(v) => onChange('category', v)}>
            <SelectTrigger className="border-[#E6E6E6]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description - with garment quick select */}
        <div className="lg:col-span-2">
          <label className="text-xs font-medium text-[#2F2F2F]/70 mb-1 block">Description</label>
          <div className="flex gap-2">
            {filteredGarments.length > 0 && (
              <Select onValueChange={handleGarmentSelect}>
                <SelectTrigger className="w-[120px] border-[#E6E6E6]">
                  <SelectValue placeholder="Quick..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredGarments.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              value={line.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Item description"
              className="flex-1 border-[#E6E6E6]"
            />
          </div>
        </div>

        {/* Cost Price */}
        <div>
          <label className="text-xs font-medium text-[#2F2F2F]/70 mb-1 block">Cost Price (£)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={line.cost_price || ''}
            onChange={(e) => onChange('cost_price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="border-[#E6E6E6]"
          />
        </div>

        {/* Quantity */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium text-[#2F2F2F]/70 mb-1 block">Qty in Set</label>
            <Input
              type="number"
              min="0"
              value={line.quantity_in_set || ''}
              onChange={(e) => onChange('quantity_in_set', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="border-[#E6E6E6]"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-red-500 hover:bg-red-50 flex-shrink-0"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}