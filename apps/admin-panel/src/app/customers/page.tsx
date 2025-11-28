"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import useDemoMode from '@/hooks/useDemoMode';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Search,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Calendar,
  UserPlus,
  Filter,
  TrendingUp,
  Star,
  Award,
  Edit
} from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp_phone?: string;
  address?: string;
  source: 'whatsapp' | 'web_widget' | 'phone' | 'admin';
  is_active: boolean;
  last_interaction?: string;
  created_at: string;
  updated_at: string;
  preferences?: {
    dietary_restrictions?: string[];
    favorite_dishes?: string[];
    preferred_contact_method?: string;
    language?: string;
  };
  metadata?: {
    total_orders?: number;
    total_spent?: number;
    loyalty_points?: number;
    notes?: string;
  };
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp_phone: string;
  address: string;
  source: 'whatsapp' | 'web_widget' | 'phone' | 'admin';
  dietary_restrictions: string;
  favorite_dishes: string;
  preferred_contact_method: string;
  notes: string;
}

const sourceColors = {
  whatsapp: 'bg-green-500',
  web_widget: 'bg-blue-500',
  phone: 'bg-purple-500',
  admin: 'bg-gray-500'
};


export default function CustomersPage() {
  const { t } = useTranslation();
  const { isDemoMode, demoData, updateCustomers } = useDemoMode();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    whatsapp_phone: '',
    address: '',
    source: 'admin',
    dietary_restrictions: '',
    favorite_dishes: '',
    preferred_contact_method: 'whatsapp',
    notes: ''
  });

  const { toast } = useToast();

  const sourceLabels = {
    whatsapp: t('customers.whatsapp'),
    web_widget: t('customers.webWidget'),
    phone: t('customers.phone'),
    admin: t('customers.admin')
  };

  // Sincronizar con demoData cuando cambie
  useEffect(() => {
    if (isDemoMode) {
      setCustomers(demoData.customers);
    }
  }, [isDemoMode, demoData.customers]);

  useEffect(() => {
    loadCustomers();
  }, [isDemoMode]);

  const loadCustomers = async () => {
    if (isDemoMode) {
      console.log('🚀 Demo mode detected - using demo customers data');
      setCustomers(demoData.customers);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.customers.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: t('common.error'),
        description: t('customers.errorLoading'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesSource = sourceFilter === 'all' || customer.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      console.log('🚀 Demo mode - customer operation locally');

      if (isEditing && selectedCustomer) {
        // Actualizar cliente existente
        const updatedCustomers = customers.map(c =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                whatsapp_phone: formData.whatsapp_phone || undefined,
                address: formData.address || undefined,
                source: formData.source,
                updated_at: new Date().toISOString(),
                preferences: {
                  dietary_restrictions: formData.dietary_restrictions ? formData.dietary_restrictions.split(',').map(s => s.trim()) : [],
                  favorite_dishes: formData.favorite_dishes ? formData.favorite_dishes.split(',').map(s => s.trim()) : [],
                  preferred_contact_method: formData.preferred_contact_method,
                },
                metadata: {
                  ...c.metadata,
                  notes: formData.notes || '',
                }
              }
            : c
        );
        setCustomers(updatedCustomers);
        updateCustomers(updatedCustomers as any);

        toast({
          title: t('common.success'),
          description: t('customers.customerUpdated'),
        });
      } else {
        // Crear nuevo cliente
        const newCustomer: Customer = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          whatsapp_phone: formData.whatsapp_phone || undefined,
          address: formData.address || undefined,
          source: formData.source,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          preferences: {
            dietary_restrictions: formData.dietary_restrictions ? formData.dietary_restrictions.split(',').map(s => s.trim()) : [],
            favorite_dishes: formData.favorite_dishes ? formData.favorite_dishes.split(',').map(s => s.trim()) : [],
            preferred_contact_method: formData.preferred_contact_method,
          },
          metadata: {
            total_orders: 0,
            total_spent: 0,
            loyalty_points: 0,
            notes: formData.notes || '',
          }
        };

        const updatedCustomers = [...customers, newCustomer];
        setCustomers(updatedCustomers);
        updateCustomers(updatedCustomers as any);

        toast({
          title: t('common.success'),
          description: t('customers.customerCreated'),
        });
      }

      resetForm();
      return;
    }

    try {
      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        whatsapp_phone: formData.whatsapp_phone || null,
        address: formData.address || null,
        source: formData.source,
        preferences: {
          dietary_restrictions: formData.dietary_restrictions ? formData.dietary_restrictions.split(',').map(s => s.trim()) : [],
          favorite_dishes: formData.favorite_dishes ? formData.favorite_dishes.split(',').map(s => s.trim()) : [],
          preferred_contact_method: formData.preferred_contact_method,
        },
        metadata: {
          notes: formData.notes || null,
        }
      };

      if (isEditing && selectedCustomer) {
        await apiService.customers.update(selectedCustomer.id, customerData);
        toast({
          title: t('common.success'),
          description: t('customers.customerUpdated'),
        });
      } else {
        await apiService.customers.create(customerData);
        toast({
          title: t('common.success'),
          description: t('customers.customerCreated'),
        });
      }

      await loadCustomers();
      resetForm();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: t('common.error'),
        description: t('customers.errorSaving'),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      whatsapp_phone: customer.whatsapp_phone || '',
      address: customer.address || '',
      source: customer.source,
      dietary_restrictions: customer.preferences?.dietary_restrictions?.join(', ') || '',
      favorite_dishes: customer.preferences?.favorite_dishes?.join(', ') || '',
      preferred_contact_method: customer.preferences?.preferred_contact_method || 'whatsapp',
      notes: customer.metadata?.notes || ''
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('customers.confirmDelete'))) {
      if (isDemoMode) {
        console.log('🚀 Demo mode - customer deletion locally');
        const updatedCustomers = customers.filter(c => c.id !== id);
        setCustomers(updatedCustomers);
        updateCustomers(updatedCustomers as any);

        toast({
          title: t('common.success'),
          description: t('customers.customerDeleted'),
        });
        return;
      }

      try {
        await apiService.customers.delete(id);
        toast({
          title: t('common.success'),
          description: t('customers.customerDeleted'),
        });
        await loadCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast({
          title: t('common.error'),
          description: t('customers.errorDeleting'),
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      whatsapp_phone: '',
      address: '',
      source: 'admin',
      dietary_restrictions: '',
      favorite_dishes: '',
      preferred_contact_method: 'whatsapp',
      notes: ''
    });
    setIsEditing(false);
    setSelectedCustomer(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{t('customers.loadingCustomers')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('customers.title')}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Gestiona tu base de clientes y relaciones
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsEditing(false)} size="lg" className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {t('customers.newCustomer')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    {isEditing ? (
                      <Edit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">
                    {isEditing ? t('customers.editCustomer') : t('customers.newCustomer')}
                  </DialogTitle>
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('customers.fullName')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ej: Juan Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('customers.emailRequired')} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        id="email"
                        placeholder="juan@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('customers.phoneRequired')} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input
                        id="phone"
                        placeholder="+56912345678"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10 h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('customers.whatsappOptional')}
                    </Label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-emerald-600" />
                      <Input
                        id="whatsapp_phone"
                        placeholder="+56912345678"
                        value={formData.whatsapp_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_phone: e.target.value }))}
                        className="pl-10 h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('customers.address')}
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="address"
                      placeholder={t('customers.fullAddress')}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="pl-10 h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('customers.source')} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as any }))}>
                      <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-emerald-600" />
                            <span>{t('customers.whatsapp')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="web_widget">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                            <span>{t('customers.webWidget')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-indigo-600" />
                            <span>{t('customers.phone')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-slate-600" />
                            <span>{t('customers.admin')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_contact" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('customers.preferredContact')}
                    </Label>
                    <Select value={formData.preferred_contact_method} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_contact_method: value }))}>
                      <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-emerald-600" />
                            <span>{t('customers.whatsapp')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-600" />
                            <span>{t('customers.email')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-indigo-600" />
                            <span>{t('customers.phone')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietary_restrictions" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('customers.dietaryRestrictions')}
                  </Label>
                  <Input
                    id="dietary_restrictions"
                    placeholder={t('customers.dietaryExample')}
                    value={formData.dietary_restrictions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
                    className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favorite_dishes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('customers.favoriteDishes')}
                  </Label>
                  <Input
                    id="favorite_dishes"
                    placeholder={t('customers.dishesExample')}
                    value={formData.favorite_dishes}
                    onChange={(e) => setFormData(prev => ({ ...prev, favorite_dishes: e.target.value }))}
                    className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('customers.additionalNotes')}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={t('customers.notesPlaceholder')}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="min-h-[100px] border-slate-300 dark:border-slate-700 focus:border-indigo-500 resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                  >
                    {isEditing ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('common.update')}
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('common.create')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="search"
                  placeholder={t('customers.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 text-base border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{t('customers.all')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-emerald-600" />
                        <span>{t('customers.whatsapp')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="web_widget">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <span>{t('customers.webWidget')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-indigo-600" />
                        <span>{t('customers.phone')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-slate-600" />
                        <span>{t('customers.admin')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t('customers.customersCount', { count: filteredCustomers.length })}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('customers.manageCustomers')}
                </p>
              </div>
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-4 mb-4">
                  <Users className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {t('customers.noCustomers')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-center max-w-md">
                  {searchTerm || sourceFilter !== 'all'
                    ? t('customers.noMatchingCustomers')
                    : t('customers.startAdding')
                  }
                </p>
                {!searchTerm && sourceFilter === 'all' && (
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => {
                const sourceIconMap: Record<string, any> = {
                  whatsapp: MessageCircle,
                  web_widget: MessageCircle,
                  phone: Phone,
                  admin: UserPlus
                };
                const SourceIcon = sourceIconMap[customer.source] || Users;

                return (
                  <Card
                    key={customer.id}
                    className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header with name and status */}
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              customer.source === 'whatsapp'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : customer.source === 'web_widget'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : customer.source === 'phone'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30'
                                : 'bg-slate-100 dark:bg-slate-800'
                            }`}>
                              <SourceIcon className={`h-5 w-5 ${
                                customer.source === 'whatsapp'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : customer.source === 'web_widget'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : customer.source === 'phone'
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                                  {customer.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    customer.source === 'whatsapp'
                                      ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                                      : customer.source === 'web_widget'
                                      ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400'
                                      : customer.source === 'phone'
                                      ? 'border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-400'
                                      : 'border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {sourceLabels[customer.source]}
                                </Badge>
                                {!customer.is_active && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t('customers.inactive')}
                                  </Badge>
                                )}
                                {customer.metadata?.total_orders && customer.metadata.total_orders > 10 && (
                                  <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                                    <Star className="h-3 w-3 mr-1" />
                                    Cliente VIP
                                  </Badge>
                                )}
                              </div>

                              {/* Contact info */}
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                {customer.email && (
                                  <span className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    {customer.email}
                                  </span>
                                )}
                                {customer.phone && (
                                  <span className="flex items-center gap-1.5">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    {customer.phone}
                                  </span>
                                )}
                                {customer.whatsapp_phone && (
                                  <span className="flex items-center gap-1.5">
                                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                                    {customer.whatsapp_phone}
                                  </span>
                                )}
                              </div>

                              {/* Address */}
                              {customer.address && (
                                <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  {customer.address}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Additional info */}
                          {(customer.preferences?.dietary_restrictions?.length || customer.preferences?.favorite_dishes?.length || customer.metadata?.notes) && (
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-sm">
                              {customer.preferences?.dietary_restrictions?.length && (
                                <p className="text-slate-600 dark:text-slate-400">
                                  <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {t('customers.restrictions')}:
                                  </span>{' '}
                                  {customer.preferences.dietary_restrictions.join(', ')}
                                </p>
                              )}
                              {customer.preferences?.favorite_dishes?.length && (
                                <p className="text-slate-600 dark:text-slate-400">
                                  <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {t('customers.favDishes')}:
                                  </span>{' '}
                                  {customer.preferences.favorite_dishes.join(', ')}
                                </p>
                              )}
                              {customer.metadata?.notes && (
                                <p className="text-slate-600 dark:text-slate-400">
                                  <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {t('customers.notes')}:
                                  </span>{' '}
                                  {customer.metadata.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right side - stats and actions */}
                        <div className="flex flex-col items-end gap-3">
                          {/* Stats */}
                          <div className="text-right space-y-1">
                            {customer.metadata?.total_orders !== undefined && customer.metadata.total_orders > 0 && (
                              <div className="flex items-center gap-1.5 text-sm">
                                <ShoppingBag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {customer.metadata.total_orders}
                                </span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  {t('customers.orders')}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                              <Calendar className="h-4 w-4" />
                              {new Date(customer.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(customer)}
                              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}