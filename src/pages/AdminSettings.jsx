import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, Plus, Trash2, Loader2, CheckCircle, Settings, Package, 
  AlertTriangle 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const CATEGORIES = [
  { value: 'coveralls', label: 'Coveralls' },
  { value: 'trousers', label: 'Trousers' },
  { value: 'jackets', label: 'Jackets' }
];

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('garments');
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Settings state
  const [rentalMultiplier, setRentalMultiplier] = useState(2);
  const [changesMapping, setChangesMapping] = useState({
    3: 1, 5: 2, 7: 3, 9: 5, 11: 5
  });

  // Garments state
  const [garments, setGarments] = useState([]);
  const [newGarment, setNewGarment] = useState({
    name: '',
    category: 'coveralls',
    default_cost_price: 0,
    wash_price_full: 1.0,
    wash_price_split: 1.1,
    wash_price_wash_only: 1.5,
    active: true,
    notes: ''
  });
  const [deleteGarment, setDeleteGarment] = useState(null);

  // Check user role
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  // Fetch garments
  const { data: garmentsData = [], isLoading: garmentsLoading } = useQuery({
    queryKey: ['garments'],
    queryFn: () => base44.entities.Garment.list('name')
  });

  // Fetch settings
  const { data: settingsData = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => base44.entities.Settings.list()
  });

  // Load garments into state
  useEffect(() => {
    if (garmentsData.length > 0) {
      setGarments(garmentsData);
    }
  }, [garmentsData]);

  // Load settings into state
  useEffect(() => {
    if (settingsData.length > 0) {
      const multiplierSetting = settingsData.find(s => s.key === 'rental_multiplier');
      const mappingSetting = settingsData.find(s => s.key === 'changes_mapping');
      
      if (multiplierSetting) {
        setRentalMultiplier(parseFloat(multiplierSetting.value) || 2);
      }
      if (mappingSetting) {
        try {
          setChangesMapping(JSON.parse(mappingSetting.value));
        } catch {}
      }
    }
  }, [settingsData]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-[#C41E3A] mb-2">Access Denied</h2>
        <p className="text-[#2F2F2F]/70">You need admin privileges to access this page.</p>
      </div>
    );
  }

  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const multiplierSetting = settingsData.find(s => s.key === 'rental_multiplier');
      const mappingSetting = settingsData.find(s => s.key === 'changes_mapping');

      if (multiplierSetting) {
        await base44.entities.Settings.update(multiplierSetting.id, {
          value: String(rentalMultiplier)
        });
      }

      if (mappingSetting) {
        await base44.entities.Settings.update(mappingSetting.id, {
          value: JSON.stringify(changesMapping)
        });
      }

      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Save settings failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add garment
  const handleAddGarment = async () => {
    if (!newGarment.name) return;
    
    setIsSaving(true);
    try {
      await base44.entities.Garment.create(newGarment);
      queryClient.invalidateQueries({ queryKey: ['garments'] });
      setNewGarment({
        name: '',
        category: 'coveralls',
        default_cost_price: 0,
        wash_price_full: 1.0,
        wash_price_split: 1.1,
        wash_price_wash_only: 1.5,
        active: true,
        notes: ''
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Add garment failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update garment
  const handleUpdateGarment = async (garment) => {
    setIsSaving(true);
    try {
      await base44.entities.Garment.update(garment.id, {
        name: garment.name,
        category: garment.category,
        default_cost_price: garment.default_cost_price,
        wash_price_full: garment.wash_price_full,
        wash_price_split: garment.wash_price_split,
        wash_price_wash_only: garment.wash_price_wash_only,
        active: garment.active,
        notes: garment.notes
      });
      queryClient.invalidateQueries({ queryKey: ['garments'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Update garment failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete garment
  const handleDeleteGarment = async () => {
    if (!deleteGarment) return;
    
    try {
      await base44.entities.Garment.delete(deleteGarment.id);
      queryClient.invalidateQueries({ queryKey: ['garments'] });
      setDeleteGarment(null);
    } catch (error) {
      console.error('Delete garment failed:', error);
    }
  };

  // Update garment in local state
  const updateGarmentField = (garmentId, field, value) => {
    setGarments(garments.map(g => 
      g.id === garmentId ? { ...g, [field]: value } : g
    ));
  };

  if (garmentsLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C41E3A]" />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#C41E3A] mb-2">Admin Settings</h1>
        <p className="text-[#2F2F2F]/70">Manage garments and pricing configuration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#C41E3A]/5 mb-6">
          <TabsTrigger 
            value="garments" 
            className="data-[state=active]:bg-[#C41E3A] data-[state=active]:text-white"
          >
            <Package className="w-4 h-4 mr-2" />
            Garments
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="data-[state=active]:bg-[#C41E3A] data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Pricing Settings
          </TabsTrigger>
        </TabsList>

        {/* Garments Tab */}
        <TabsContent value="garments" className="space-y-6">
          {/* Add New Garment */}
          <Card className="border border-[#E6E6E6] overflow-hidden">
            <div className="bg-[#C41E3A] px-5 py-4">
              <h3 className="text-white font-bold text-lg">Add New Garment</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-[#2F2F2F] font-medium">Name</Label>
                  <Input
                    value={newGarment.name}
                    onChange={(e) => setNewGarment({ ...newGarment, name: e.target.value })}
                    placeholder="Garment name"
                    className="mt-1.5 border-[#E6E6E6]"
                  />
                </div>
                <div>
                  <Label className="text-[#2F2F2F] font-medium">Category</Label>
                  <Select 
                    value={newGarment.category} 
                    onValueChange={(v) => setNewGarment({ ...newGarment, category: v })}
                  >
                    <SelectTrigger className="mt-1.5 border-[#E6E6E6]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#2F2F2F] font-medium">Default Cost (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newGarment.default_cost_price}
                    onChange={(e) => setNewGarment({ ...newGarment, default_cost_price: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 border-[#E6E6E6]"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="bg-[#C41E3A] hover:bg-[#a01730] text-white font-semibold w-full"
                    onClick={handleAddGarment}
                    disabled={!newGarment.name || isSaving}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Garment
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#2F2F2F] font-medium text-sm">Wash Price Full (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newGarment.wash_price_full}
                    onChange={(e) => setNewGarment({ ...newGarment, wash_price_full: parseFloat(e.target.value) || 0 })}
                    className="mt-1 border-[#E6E6E6]"
                  />
                </div>
                <div>
                  <Label className="text-[#2F2F2F] font-medium text-sm">Wash Price Split (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newGarment.wash_price_split}
                    onChange={(e) => setNewGarment({ ...newGarment, wash_price_split: parseFloat(e.target.value) || 0 })}
                    className="mt-1 border-[#E6E6E6]"
                  />
                </div>
                <div>
                  <Label className="text-[#2F2F2F] font-medium text-sm">Wash Price Wash Only (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newGarment.wash_price_wash_only}
                    onChange={(e) => setNewGarment({ ...newGarment, wash_price_wash_only: parseFloat(e.target.value) || 0 })}
                    className="mt-1 border-[#E6E6E6]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Garments List */}
          <Card className="border border-[#E6E6E6] overflow-hidden">
            <div className="bg-[#C41E3A] px-5 py-4">
              <h3 className="text-white font-bold text-lg">Garment List</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Cost (£)</TableHead>
                    <TableHead>Full (£)</TableHead>
                    <TableHead>Split (£)</TableHead>
                    <TableHead>Wash (£)</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {garments.map(garment => (
                    <TableRow key={garment.id}>
                      <TableCell>
                        <Input
                          value={garment.name}
                          onChange={(e) => updateGarmentField(garment.id, 'name', e.target.value)}
                          onBlur={() => handleUpdateGarment(garment)}
                          className="border-[#E6E6E6] h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={garment.category} 
                          onValueChange={(v) => {
                            updateGarmentField(garment.id, 'category', v);
                            handleUpdateGarment({ ...garment, category: v });
                          }}
                        >
                          <SelectTrigger className="border-[#E6E6E6] h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={garment.default_cost_price || ''}
                          onChange={(e) => updateGarmentField(garment.id, 'default_cost_price', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleUpdateGarment(garment)}
                          className="border-[#E6E6E6] h-8 w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={garment.wash_price_full || ''}
                          onChange={(e) => updateGarmentField(garment.id, 'wash_price_full', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleUpdateGarment(garment)}
                          className="border-[#E6E6E6] h-8 w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={garment.wash_price_split || ''}
                          onChange={(e) => updateGarmentField(garment.id, 'wash_price_split', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleUpdateGarment(garment)}
                          className="border-[#E6E6E6] h-8 w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={garment.wash_price_wash_only || ''}
                          onChange={(e) => updateGarmentField(garment.id, 'wash_price_wash_only', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleUpdateGarment(garment)}
                          className="border-[#E6E6E6] h-8 w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={garment.active}
                          onCheckedChange={(checked) => {
                            updateGarmentField(garment.id, 'active', checked);
                            handleUpdateGarment({ ...garment, active: checked });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteGarment(garment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border border-[#E6E6E6] overflow-hidden">
            <div className="bg-[#C41E3A] px-5 py-4">
              <h3 className="text-white font-bold text-lg">Pricing Configuration</h3>
            </div>
            <div className="p-5 space-y-6">
              {/* Rental Multiplier */}
              <div>
                <Label className="text-[#2F2F2F] font-medium">Rental Multiplier</Label>
                <p className="text-sm text-[#2F2F2F]/60 mb-2">
                  Used in rental recovery calculation: cost × multiplier × set_size × changes / contract_weeks
                </p>
                <Input
                  type="number"
                  step="0.1"
                  value={rentalMultiplier}
                  onChange={(e) => setRentalMultiplier(parseFloat(e.target.value) || 2)}
                  className="w-32 border-[#E6E6E6]"
                />
              </div>

              {/* Changes Mapping */}
              <div>
                <Label className="text-[#2F2F2F] font-medium">Set Size to Changes per Week Mapping</Label>
                <p className="text-sm text-[#2F2F2F]/60 mb-3">
                  Define how many changes per week for each set size
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[3, 5, 7, 9, 11].map(size => (
                    <div key={size} className="bg-gray-50 rounded-lg p-3">
                      <Label className="text-sm text-[#2F2F2F]/70">Set of {size}</Label>
                      <Input
                        type="number"
                        min="1"
                        value={changesMapping[size] || 1}
                        onChange={(e) => setChangesMapping({
                          ...changesMapping,
                          [size]: parseInt(e.target.value) || 1
                        })}
                        className="mt-1 border-[#E6E6E6]"
                      />
                      <span className="text-xs text-[#2F2F2F]/50">changes/week</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  className={`${saveSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-[#C41E3A] hover:bg-[#a01730]'} text-white font-semibold`}
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : saveSuccess ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saveSuccess ? 'Saved!' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Garment Dialog */}
      <AlertDialog open={!!deleteGarment} onOpenChange={() => setDeleteGarment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#C41E3A]">Delete Garment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteGarment?.name}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E6E6E6]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteGarment}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}