import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Package } from 'lucide-react';

export default function BreakdownCard({ groups, groupTotals }) {
  if (!groups || groups.length === 0) return null;

  return (
    <Card className="border border-[#E6E6E6] overflow-hidden">
      <div className="bg-[#C41E3A] px-5 py-4">
        <h3 className="text-white font-bold text-lg">Breakdown by Group</h3>
      </div>
      
      <div className="divide-y divide-[#E6E6E6]">
        {groups.map((group, idx) => {
          const totals = groupTotals[idx];
          if (!totals) return null;
          
          return (
            <div key={idx} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C41E3A]" />
                  <span className="font-semibold text-[#C41E3A]">
                    {group.role_name || `Group ${idx + 1}`}
                  </span>
                </div>
                <span className="font-bold text-[#C41E3A]">
                  £{totals.groupWeekly.toFixed(2)}/wk
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between text-[#2F2F2F]/70">
                  <span>Wearers:</span>
                  <span className="font-medium text-[#2F2F2F]">{group.wearers || 0}</span>
                </div>
                <div className="flex justify-between text-[#2F2F2F]/70">
                  <span>Set Size:</span>
                  <span className="font-medium text-[#2F2F2F]">{group.set_size || 3}</span>
                </div>
                <div className="flex justify-between text-[#2F2F2F]/70">
                  <span>Per Wearer:</span>
                  <span className="font-medium text-[#2F2F2F]">£{totals.perWearerWeekly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#2F2F2F]/70">
                  <span>Changes/wk:</span>
                  <span className="font-medium text-[#2F2F2F]">{group.changes_per_week || 1}</span>
                </div>
              </div>

              {group.lines?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E6E6E6]">
                  <div className="text-xs font-medium text-[#2F2F2F]/60 mb-2">Items:</div>
                  <div className="space-y-1">
                    {group.lines.map((line, lineIdx) => (
                      <div key={lineIdx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Package className="w-3 h-3 text-[#C41E3A]/60" />
                          <span className="text-[#2F2F2F]">
                            {line.description || 'Item'} × {line.quantity_in_set || 0}
                          </span>
                        </div>
                        <span className="text-[#2F2F2F]/70">£{line.cost_price?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}