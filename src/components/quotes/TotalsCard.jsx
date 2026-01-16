import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, CalendarDays } from 'lucide-react';

export default function TotalsCard({ weeklyTotal, monthlyTotal, annualTotal, contractTotal, contractWeeks }) {
  return (
    <Card className="border border-[#E6E6E6] overflow-hidden">
      <div className="bg-[#C41E3A] px-5 py-4">
        <h3 className="text-white font-bold text-lg">Quote Totals</h3>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Weekly Total - Highlighted */}
        <div className="bg-[#C41E3A]/10 border-2 border-[#C41E3A] rounded-xl p-5">
          <div className="flex items-center gap-2 text-[#C41E3A] mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium text-sm">Weekly Total</span>
          </div>
          <div className="text-4xl font-bold text-[#C41E3A]">
            £{weeklyTotal.toFixed(2)}
          </div>
        </div>

        {/* Monthly Total */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#2F2F2F]/70 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="font-medium text-sm">Monthly Total</span>
          </div>
          <div className="text-2xl font-bold text-[#2F2F2F]">
            £{monthlyTotal.toFixed(2)}
          </div>
          <div className="text-xs text-[#2F2F2F]/50 mt-1">Weekly × {contractWeeks} ÷ 12</div>
        </div>

        {/* Annual Total */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#2F2F2F]/70 mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium text-sm">Annual Total</span>
          </div>
          <div className="text-2xl font-bold text-[#2F2F2F]">
            £{annualTotal.toFixed(2)}
          </div>
          <div className="text-xs text-[#2F2F2F]/50 mt-1">Weekly × {Math.min(contractWeeks, 52)}</div>
        </div>

        {/* Contract Total */}
        {contractWeeks && contractWeeks !== 52 && (
          <div className="bg-[#C41E3A]/5 border border-[#C41E3A]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#C41E3A] mb-1">
              <CalendarDays className="w-4 h-4" />
              <span className="font-medium text-sm">Total Contract Value</span>
            </div>
            <div className="text-2xl font-bold text-[#C41E3A]">
              £{contractTotal.toFixed(2)}
            </div>
            <div className="text-xs text-[#C41E3A]/70 mt-1">Weekly × {contractWeeks} weeks</div>
          </div>
        )}
      </div>
    </Card>
  );
}