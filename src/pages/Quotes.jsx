import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import QuoteCard from '@/components/quotes/QuoteCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Quotes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteQuote, setDeleteQuote] = useState(null);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date'),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['quoteGroups'],
    queryFn: () => base44.entities.QuoteGroup.list(),
  });

  const { data: lines = [] } = useQuery({
    queryKey: ['quoteLines'],
    queryFn: () => base44.entities.QuoteLine.list(),
  });

  const createQuoteMutation = useMutation({
    mutationFn: async () => {
      const quoteRef = `QT-${Date.now().toString(36).toUpperCase()}`;
      return base44.entities.Quote.create({
        quote_ref: quoteRef,
        status: 'new'
      });
    },
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      navigate(createPageUrl(`QuoteBuilder?id=${newQuote.id}`));
    }
  });

  const duplicateQuoteMutation = useMutation({
    mutationFn: async (quote) => {
      const quoteRef = `QT-${Date.now().toString(36).toUpperCase()}`;
      const newQuote = await base44.entities.Quote.create({
        quote_ref: quoteRef,
        status: 'new',
        customer_name: quote.customer_name,
        site_name: quote.site_name,
        service_type: quote.service_type,
        contract_weeks: quote.contract_weeks
      });

      const quoteGroups = groups.filter(g => g.quote_id === quote.id);
      for (const group of quoteGroups) {
        const newGroup = await base44.entities.QuoteGroup.create({
          quote_id: newQuote.id,
          role_name: group.role_name,
          wearers: group.wearers,
          set_size: group.set_size,
          changes_per_week: group.changes_per_week,
          sort_order: group.sort_order
        });

        const groupLines = lines.filter(l => l.group_id === group.id);
        for (const line of groupLines) {
          await base44.entities.QuoteLine.create({
            group_id: newGroup.id,
            category: line.category,
            description: line.description,
            cost_price: line.cost_price,
            quantity_in_set: line.quantity_in_set
          });
        }
      }

      return newQuote;
    },
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quoteGroups'] });
      queryClient.invalidateQueries({ queryKey: ['quoteLines'] });
      navigate(createPageUrl(`QuoteBuilder?id=${newQuote.id}`));
    }
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quote) => {
      const quoteGroups = groups.filter(g => g.quote_id === quote.id);
      for (const group of quoteGroups) {
        const groupLines = lines.filter(l => l.group_id === group.id);
        for (const line of groupLines) {
          await base44.entities.QuoteLine.delete(line.id);
        }
        await base44.entities.QuoteGroup.delete(group.id);
      }
      await base44.entities.Quote.delete(quote.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quoteGroups'] });
      queryClient.invalidateQueries({ queryKey: ['quoteLines'] });
      setDeleteQuote(null);
    }
  });

  const filteredQuotes = quotes.filter(q => {
    const term = searchTerm.toLowerCase();
    return (
      q.quote_ref?.toLowerCase().includes(term) ||
      q.customer_name?.toLowerCase().includes(term) ||
      q.site_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#203050] mb-2">Quotes</h1>
        <p className="text-[#5B6472]">Manage your customer quotes and pricing</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5B6472]" />
          <Input
            placeholder="Search by customer, site, or quote ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#E0E0E0] focus:border-[#203050] focus:ring-[#203050]"
          />
        </div>
        <Button
          className="bg-[#203050] hover:bg-[#304060] text-white"
          onClick={() => createQuoteMutation.mutate()}
          disabled={createQuoteMutation.isPending}
        >
          {createQuoteMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          New Quote
        </Button>
      </div>

      {/* Quotes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#203050]" />
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#E0E0E0] shadow-sm">
          <FileText className="w-12 h-12 text-[#5B6472] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1A1F2A] mb-2">
            {searchTerm ? 'No quotes found' : 'No quotes yet'}
          </h3>
          <p className="text-[#5B6472] mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Create your first quote to get started'}
          </p>
          {!searchTerm && (
            <Button
              className="bg-[#203050] hover:bg-[#304060] text-white"
              onClick={() => createQuoteMutation.mutate()}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Quote
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map(quote => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onOpen={(q) => navigate(createPageUrl(`QuoteBuilder?id=${q.id}`))}
              onDuplicate={(q) => duplicateQuoteMutation.mutate(q)}
              onDelete={(q) => setDeleteQuote(q)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteQuote} onOpenChange={() => setDeleteQuote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#203050]">Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete quote <strong>{deleteQuote?.quote_ref}</strong>? 
              This will also delete all groups and line items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E0E0E0]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteQuoteMutation.mutate(deleteQuote)}
            >
              {deleteQuoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}