import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Users, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import LineItemForm from './LineItemForm';

const SET_SIZES = [3, 5, 7, 9, 11];

export default function WearerGroupForm({ 
  group, 
  groupIndex,
  changesMapping,
  garments,
  serviceType,
  onGroupChange, 
  onLineChange,
  onAddLine,
  onRemoveLine,
  onRemoveGroup,
  groupTotals
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const totalQuantity = group.lines?.reduce((sum, line) => sum + (line.quantity_in_set || 0), 0) || 0;
  const isValidQuantity = totalQuantity === group.set_size;

  return (
    <Card className="border border-[#E0E0E0] overflow-hidden shadow-sm">
      {/* Group Header */}
      <div 
        className="bg-[#203050]/5 px-5 py-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#203050] rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-[#203050]">
              {group.role_name || `Group ${groupIndex + 1}`}
            </h4>
            <div className="text-sm text-[#5B6472]">
              {group.wearers || 0} wearers • Set of {group.set_size || 3}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {groupTotals && (
            <div className="text-right mr-4">
              <div className="text-xs text-[#5B6472]">Group Weekly</div>
              <div className="font-bold text-[#203050]">£{groupTotals.groupWeekly.toFixed(2)}</div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onRemoveGroup(); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-[#203050]" /> : <ChevronDown className="w-5 h-5 text-[#203050]" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-5 bg-white">
          {/* Group Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-[#1A1F2A] font-medium">Role Name</Label>
              <Input
                value={group.role_name || ''}
                onChange={(e) => onGroupChange('role_name', e.target.value)}
                placeholder="e.g. Engineer, Technician"
                className="mt-1.5 border-[#E0E0E0] focus:border-[#203050] focus:ring-[#203050]"
              />
            </div>
            <div>
              <Label className="text-[#1A1F2A] font-medium">Number of Wearers</Label>
              <Input
                type="number"
                min="1"
                value={group.wearers || ''}
                onChange={(e) => onGroupChange('wearers', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="mt-1.5 border-[#E0E0E0] focus:border-[#203050] focus:ring-[#203050]"
              />
            </div>
            <div>
              <Label className="text-[#1A1F2A] font-medium">Set Size</Label>
              <Select 
                value={String(group.set_size || 3)} 
                onValueChange={(v) => onGroupChange('set_size', parseInt(v))}
              >
                <SelectTrigger className="mt-1.5 border-[#E0E0E0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SET_SIZES.map(size => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#1A1F2A] font-medium">Changes/Week</Label>
              <Input
                value={changesMapping[group.set_size] || 1}
                readOnly
                className="mt-1.5 bg-[#F7F8FA] border-[#E0E0E0] text-[#5B6472]"
              />
            </div>
          </div>

          {/* Validation Warning */}
          {!isValidQuantity && group.lines?.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                Quantity mismatch: {totalQuantity} items selected, but set size is {group.set_size}
              </span>
            </div>
          )}

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[#203050] font-bold">Line Items</Label>
              <Button
                variant="outline"
                size="sm"
                className="border-[#203050] text-[#203050] hover:bg-[#F7F8FA]"
                onClick={onAddLine}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Item
              </Button>
            </div>

            {group.lines?.length === 0 ? (
              <div className="text-center py-8 text-[#5B6472] bg-[#F7F8FA] rounded-lg">
                No items added. Click "Add Item" to add garments.
              </div>
            ) : (
              <div className="space-y-3">
                {group.lines?.map((line, lineIndex) => (
                  <LineItemForm
                    key={lineIndex}
                    line={line}
                    garments={garments}
                    serviceType={serviceType}
                    onChange={(field, value) => onLineChange(lineIndex, field, value)}
                    onRemove={() => onRemoveLine(lineIndex)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Group Summary */}
          {groupTotals && group.lines?.length > 0 && (
            <div className="bg-[#F7F8FA] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-[#5B6472]">Per Wearer/Week</div>
                <div className="font-bold text-[#1A1F2A]">£{groupTotals.perWearerWeekly.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[#5B6472]">Group Weekly</div>
                <div className="font-bold text-[#203050]">£{groupTotals.groupWeekly.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[#5B6472]">Rental Recovery</div>
                <div className="font-bold text-[#1A1F2A]">£{groupTotals.rentalRecovery.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[#5B6472]">Wash Cost</div>
                <div className="font-bold text-[#1A1F2A]">£{groupTotals.washCost.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}