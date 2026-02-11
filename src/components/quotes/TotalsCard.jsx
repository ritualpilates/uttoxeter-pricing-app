import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, CalendarDays } from 'lucide-react';

export default function TotalsCard({ weeklyTotal, monthlyTotal, annualTotal, contractTotal, contractWeeks }) {
  return (
    <Card className="border border-[#E0E0E0] overflow-hidden shadow-sm">
      <div className="bg-[#203050] px-5 py-4">
        <h3 className="text-white font-bold text-lg">Quote Totals</h3>
      </div>
      
      <div className="p-5 space-y-4 bg-white">
        {/* Weekly Total - Highlighted */}
        <div className="bg-[#203050]/10 border-2 border-[#203050] rounded-xl p-5">
          <div className="flex items-center gap-2 text-[#203050] mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium text-sm">Weekly Total</span>
          </div>
          <div className="text-4xl font-bold text-[#203050]">
            £{weeklyTotal.toFixed(2)}
          </div>
        </div>

        {/* Monthly Total */}
        <div className="bg-[#F7F8FA] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#5B6472] mb-1">
            <Calendar className="w-4 h-4" />
            <span className="font-medium text-sm">Monthly Total</span>
          </div>
          <div className="text-2xl font-bold text-[#1A1F2A]">
            £{monthlyTotal.toFixed(2)}
          </div>
          <div className="text-xs text-[#5B6472] mt-1">Weekly × {contractWeeks} ÷ 12</div>
        </div>

        {/* Annual Total */}
        <div className="bg-[#F7F8FA] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#5B6472] mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium text-sm">Annual Total</span>
          </div>
          <div className="text-2xl font-bold text-[#1A1F2A]">
            £{annualTotal.toFixed(2)}
          </div>
          <div className="text-xs text-[#5B6472] mt-1">Weekly × {Math.min(contractWeeks, 52)}</div>
        </div>

        {/* Contract Total */}
        {contractWeeks && contractWeeks !== 52 && (
          <div className="bg-[#203050]/5 border border-[#203050]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#203050] mb-1">
              <CalendarDays className="w-4 h-4" />
              <span className="font-medium text-sm">Total Contract Value</span>
            </div>
            <div className="text-2xl font-bold text-[#203050]">
              £{contractTotal.toFixed(2)}
            </div>
            <div className="text-xs text-[#203050]/70 mt-1">Weekly × {contractWeeks} weeks</div>
          </div>
        )}
      </div>
    </Card>
  );
}