import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Copy, Trash2, Calendar, Building2, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  new: 'bg-[#203050]/10 text-[#203050] border-[#203050]/20',
  renewal: 'bg-[#405060]/10 text-[#405060] border-[#405060]/20'
};

const serviceTypeLabels = {
  full: 'Full Rental',
  split: 'Split Rental',
  wash_only: 'Wash Only'
};

export default function QuoteCard({ quote, onOpen, onDuplicate, onDelete }) {
  return (
    <Card className="p-5 border border-[#E0E0E0] hover:border-[#203050]/30 transition-all duration-200 hover:shadow-md bg-white">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-[#203050] text-lg">{quote.quote_ref}</span>
            <Badge variant="outline" className={`${statusColors[quote.status]} border`}>
              {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1)}
            </Badge>
          </div>
          
          <div className="space-y-1.5 text-sm text-[#1A1F2A]">
            {quote.customer_name && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5B6472]" />
                <span className="font-medium">{quote.customer_name}</span>
              </div>
            )}
            {quote.site_name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#5B6472]" />
                <span>{quote.site_name}</span>
              </div>
            )}
            <div className="flex items-center gap-4 text-[#5B6472]">
              {quote.service_type && (
                <span>{serviceTypeLabels[quote.service_type]}</span>
              )}
              {quote.contract_weeks && (
                <span>{quote.contract_weeks} weeks</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[#5B6472] text-xs pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {format(new Date(quote.created_date), 'dd MMM yyyy')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <Button
            variant="default"
            size="sm"
            className="bg-[#203050] hover:bg-[#304060] text-white"
            onClick={() => onOpen(quote)}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Open
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#E0E0E0] hover:border-[#203050] hover:bg-[#F7F8FA]"
              onClick={() => onDuplicate(quote)}
            >
              <Copy className="w-4 h-4 text-[#203050]" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#E0E0E0] hover:border-red-300 hover:bg-red-50"
              onClick={() => onDelete(quote)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}