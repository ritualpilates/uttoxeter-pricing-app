import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, CalendarDays } from 'lucide-react';

export default function TotalsCard({ weeklyTotal, monthlyTotal, annualTotal }) {
  return (
    <Card className="border border-[#E6E6E6] overflow-hidden">
      <div className="bg-[#00508C] px-5 py-4">
        <h3 className="text-white font-bold text-lg">Quote Totals</h3>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Weekly Total - Highlighted */}
        <div className="bg-[#C4D600]/15 border-2 border-[#C4D600] rounded-xl p-5">
          <div className="flex items-center gap-2 text-[#5a6b00] mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium text-sm">Weekly Total</span>
          </div>
          <div className="text-4xl font-bold text-[#5a6b00]">
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
          <div className="text-xs text-[#2F2F2F]/50 mt-1">Weekly × 52 ÷ 12</div>
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
          <div className="text-xs text-[#2F2F2F]/50 mt-1">Weekly × 52</div>
        </div>
      </div>
    </Card>
  );
}