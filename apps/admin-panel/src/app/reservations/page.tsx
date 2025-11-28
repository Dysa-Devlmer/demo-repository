"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import useDemoMode from '@/hooks/useDemoMode';
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Search,
  Filter,
  Eye
} from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Reservation {
  id: number;
  reservation_code: string;
  customer?: Customer | null;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string | null;
  reservation_date: string;
  reservation_time?: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  preferred_section?: 'indoor' | 'outdoor' | 'private' | 'bar';
  table_number?: string;
  special_requests?: string | null;
  occasion?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ReservationFormData {
  customerId: number;
  date: string;
  time: string;
  people: number;
  section: 'indoor' | 'outdoor' | 'private' | 'bar';
  table_number: string;
  special_requests: string;
  occasion: string;
}

const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  seated: 'bg-green-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
  no_show: 'bg-red-700'
};


export default function ReservationsPage() {
  const { t } = useTranslation();
  const { isDemoMode, demoData, updateReservations } = useDemoMode();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<ReservationFormData>({
    customerId: 0,
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    people: 2,
    section: 'indoor',
    table_number: '',
    special_requests: '',
    occasion: ''
  });

  const { toast } = useToast();

  const statusLabels = {
    pending: t('reservations.pending'),
    confirmed: t('reservations.confirmed'),
    seated: t('reservations.seated'),
    completed: t('reservations.completed'),
    cancelled: t('reservations.cancelled'),
    no_show: t('reservations.noShow')
  };

  // Función para cargar datos (reutilizable)
  const loadData = async () => {
    if (isDemoMode) {
      console.log('🚀 Demo mode detected - using mock reservations data');
      setReservations(Array.isArray(demoData.reservations) ? demoData.reservations : []);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.reservations.getAll();
      console.log('📦 Reservations API response:', response);
      // La API devuelve { success: true, data: { data: [...], total, page, limit } }
      const reservationsData = response.data?.data || response.data || [];
      console.log('📋 Reservations loaded:', reservationsData.length);
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setReservations([]);
      toast({
        title: t('common.error'),
        description: t('reservations.errorLoading'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
    loadCustomers();
  }, [isDemoMode]);

  const loadCustomers = async () => {
    if (isDemoMode) {
      console.log('🚀 Demo mode detected - using mock customers data');
      setCustomers(demoData.customers);
      return;
    }

    try {
      const response = await apiService.customers.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const filteredReservations = (Array.isArray(reservations) ? reservations : []).filter(reservation => {
    const matchesSearch =
      (reservation.reservation_code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reservation.customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reservation.customer?.phone || '').includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      console.log('🚀 Demo mode - reservation operation locally');

      if (isEditing && selectedReservation) {
        // Actualizar reservación existente
        const updatedReservations = reservations.map(r =>
          r.id === selectedReservation.id
            ? {
                ...r,
                reservation_date: formData.date,
                reservation_time: formData.time,
                party_size: formData.people,
                preferred_section: formData.section,
                table_number: formData.table_number,
                special_requests: formData.special_requests,
                occasion: formData.occasion,
                updated_at: new Date().toISOString(),
              }
            : r
        );
        setReservations(updatedReservations);
        updateReservations(updatedReservations as any);

        toast({
          title: t('common.success'),
          description: t('reservations.reservationUpdated'),
        });
      } else {
        // Crear nueva reservación
        const selectedCustomer = customers.find(c => c.id === formData.customerId);

        if (!selectedCustomer) {
          toast({
            title: t('common.error'),
            description: 'Debe seleccionar un cliente válido',
            variant: "destructive",
          });
          return;
        }

        const newReservation: Reservation = {
          id: Date.now(),
          reservation_code: `RES-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(reservations.length + 1).padStart(3, '0')}`,
          customer: {
            id: selectedCustomer.id,
            name: selectedCustomer.name,
            email: selectedCustomer.email,
            phone: selectedCustomer.phone,
          },
          reservation_date: formData.date,
          reservation_time: formData.time,
          party_size: formData.people,
          status: 'pending',
          preferred_section: formData.section,
          table_number: formData.table_number,
          special_requests: formData.special_requests,
          occasion: formData.occasion,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedReservations = [...reservations, newReservation];
        setReservations(updatedReservations);
        updateReservations(updatedReservations as any);

        toast({
          title: t('common.success'),
          description: t('reservations.reservationCreated'),
        });
      }

      resetForm();
      return;
    }

    try {
      const reservationData = {
        customerId: formData.customerId,
        date: formData.date,
        time: formData.time,
        people: formData.people,
        section: formData.section,
        table_number: formData.table_number,
        special_requests: formData.special_requests,
        occasion: formData.occasion,
        status: isEditing ? selectedReservation?.status : 'pending'
      };

      if (isEditing && selectedReservation) {
        // Actualización optimista: actualizar el estado primero
        const selectedCustomer = customers.find(c => c.id === formData.customerId);
        const updatedReservations = reservations.map(r =>
          r.id === selectedReservation.id
            ? {
                ...r,
                customer_name: selectedCustomer?.name || r.customer_name,
                customer_phone: selectedCustomer?.phone || r.customer_phone,
                customer_email: selectedCustomer?.email || r.customer_email,
                reservation_date: formData.date,
                party_size: formData.people,
                updated_at: new Date().toISOString(),
              }
            : r
        );
        setReservations(updatedReservations);

        // Luego llamar a la API
        await apiService.reservations.update(selectedReservation.id, reservationData);

        toast({
          title: t('common.success'),
          description: t('reservations.reservationUpdated'),
        });
        resetForm();
      } else {
        // Crear nueva reservación - llamar API primero para obtener el ID
        const response = await apiService.reservations.create(reservationData);

        // Actualizar lista con la nueva reserva
        await loadData();

        toast({
          title: t('common.success'),
          description: t('reservations.reservationCreated'),
        });
        resetForm();
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      // Si falla, recargar para restaurar el estado correcto
      await loadData();
      toast({
        title: t('common.error'),
        description: t('reservations.errorSaving'),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);

    // Safe date handling
    let dateValue = new Date().toISOString().split('T')[0];
    if (reservation.reservation_date) {
      try {
        dateValue = reservation.reservation_date.includes('T')
          ? reservation.reservation_date.split('T')[0]
          : reservation.reservation_date;
      } catch (error) {
        console.warn('Invalid reservation date:', reservation.reservation_date);
      }
    }

    // Find customer ID by matching phone or name
    let customerId = reservation.customer?.id || 0;
    if (!customerId && (reservation.customer_phone || reservation.customer_name)) {
      const matchingCustomer = customers.find(c =>
        (reservation.customer_phone && c.phone === reservation.customer_phone) ||
        (reservation.customer_name && c.name === reservation.customer_name)
      );
      if (matchingCustomer) {
        customerId = matchingCustomer.id;
      }
    }

    console.log('📝 Editing reservation:', {
      id: reservation.id,
      customerId,
      customer_name: reservation.customer_name,
      customer_phone: reservation.customer_phone,
      date: dateValue,
      people: reservation.party_size
    });

    setFormData({
      customerId,
      date: dateValue,
      time: reservation.reservation_time || '19:00',
      people: reservation.party_size || 2,
      section: reservation.preferred_section || 'indoor',
      table_number: reservation.table_number || '',
      special_requests: reservation.special_requests || '',
      occasion: reservation.occasion || ''
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('reservations.confirmDelete'))) {
      if (isDemoMode) {
        console.log('🚀 Demo mode - reservation deletion locally');
        const updatedReservations = reservations.filter(r => r.id !== id);
        setReservations(updatedReservations);
        updateReservations(updatedReservations as any);

        toast({
          title: t('common.success'),
          description: t('reservations.reservationDeleted'),
        });
        return;
      }

      try {
        // Actualización optimista: eliminar del estado primero
        const updatedReservations = reservations.filter(r => r.id !== id);
        setReservations(updatedReservations);

        // Luego llamar a la API
        await apiService.reservations.delete(id);

        toast({
          title: t('common.success'),
          description: t('reservations.reservationDeleted'),
        });
      } catch (error) {
        console.error('Error deleting reservation:', error);
        // Si falla, recargar para restaurar el estado correcto
        await loadData();
        toast({
          title: t('common.error'),
          description: t('reservations.errorDeleting'),
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (isDemoMode) {
      console.log('🚀 Demo mode - reservation status update locally');
      const updatedReservations = reservations.map(r =>
        r.id === id
          ? {
              ...r,
              status: newStatus as Reservation['status'],
              updated_at: new Date().toISOString(),
            }
          : r
      );
      setReservations(updatedReservations);
      updateReservations(updatedReservations as any);

      toast({
        title: t('common.success'),
        description: t('reservations.statusUpdated'),
      });
      return;
    }

    try {
      // Actualización optimista: actualizar el estado primero
      const updatedReservations = reservations.map(r =>
        r.id === id
          ? {
              ...r,
              status: newStatus as Reservation['status'],
              updated_at: new Date().toISOString(),
            }
          : r
      );
      setReservations(updatedReservations);

      // Luego llamar a la API
      await apiService.reservations.updateStatus(id, newStatus);

      toast({
        title: t('common.success'),
        description: t('reservations.statusUpdated'),
      });
    } catch (error) {
      console.error('Error updating status:', error);
      // Si falla, recargar para restaurar el estado correcto
      await loadData();
      toast({
        title: t('common.error'),
        description: t('reservations.errorUpdatingStatus'),
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: 0,
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      people: 2,
      section: 'indoor',
      table_number: '',
      special_requests: '',
      occasion: ''
    });
    setIsEditing(false);
    setSelectedReservation(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4">{t('reservations.loadingReservations')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reservations.title')}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsEditing(false)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('reservations.newReservation')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? t('reservations.editReservation') : t('reservations.newReservation')}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? t('reservations.editReservationDescription') : t('reservations.newReservationDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">{t('reservations.client')}</Label>
                    <Select value={formData.customerId ? formData.customerId.toString() : ""} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: parseInt(value) }))}>
                      <SelectTrigger id="customer">
                        <SelectValue placeholder={t('reservations.selectClient')} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="people">{t('reservations.people')}</Label>
                    <Input
                      type="number"
                      id="people"
                      min="1"
                      value={formData.people || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, people: parseInt(e.target.value) || 1 }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">{t('reservations.date')}</Label>
                    <Input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">{t('reservations.time')}</Label>
                    <Input
                      type="time"
                      id="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section">{t('reservations.preferredSection')}</Label>
                    <Select value={formData.section} onValueChange={(value) => setFormData(prev => ({ ...prev, section: value as any }))}>
                      <SelectTrigger id="section">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">{t('reservations.indoor')}</SelectItem>
                        <SelectItem value="outdoor">{t('reservations.outdoor')}</SelectItem>
                        <SelectItem value="private">{t('reservations.private')}</SelectItem>
                        <SelectItem value="bar">{t('reservations.bar')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="table_number">{t('reservations.tableOptional')}</Label>
                    <Input
                      id="table_number"
                      placeholder={t('reservations.tableExample')}
                      value={formData.table_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, table_number: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occasion">{t('reservations.specialOccasion')}</Label>
                  <Input
                    id="occasion"
                    placeholder={t('reservations.occasionExample')}
                    value={formData.occasion}
                    onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="special_requests">{t('reservations.specialRequests')}</Label>
                  <Textarea
                    id="special_requests"
                    placeholder={t('reservations.requestsPlaceholder')}
                    value={formData.special_requests}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit">
                    {isEditing ? t('common.update') : t('common.create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reservations.filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full sm:w-auto">
                <Label htmlFor="search">{t('common.search')}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder={t('reservations.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Label htmlFor="status">{t('reservations.status')}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('reservations.all')}</SelectItem>
                    <SelectItem value="pending">{t('reservations.pending_filter')}</SelectItem>
                    <SelectItem value="confirmed">{t('reservations.confirmed_filter')}</SelectItem>
                    <SelectItem value="seated">{t('reservations.seated_filter')}</SelectItem>
                    <SelectItem value="completed">{t('reservations.completed_filter')}</SelectItem>
                    <SelectItem value="cancelled">{t('reservations.cancelled_filter')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('reservations.reservationsCount', { count: filteredReservations.length })}
            </CardTitle>
            <CardDescription>
              {t('reservations.manageReservations')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('reservations.noReservations')}</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? t('reservations.noMatchingReservations')
                    : t('reservations.startCreating')
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('reservations.newReservation')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <div key={reservation.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[reservation.status]}>
                            {statusLabels[reservation.status]}
                          </Badge>
                          <span className="font-mono text-sm text-gray-500">
                            {reservation.reservation_code}
                          </span>
                        </div>
                        <div className="w-full">
                          <h3 className="font-semibold text-sm sm:text-base">{reservation.customer_name || reservation.customer?.name || 'Cliente desconocido'}</h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(reservation.reservation_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {reservation.reservation_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {reservation.party_size} {t('reservations.personsLabel')}
                            </span>
                            {reservation.customer?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {reservation.customer?.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select 
                          value={reservation.status} 
                          onValueChange={(value) => handleStatusChange(reservation.id, value)}
                        >
                          <SelectTrigger className="w-full sm:w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t('reservations.pending')}</SelectItem>
                            <SelectItem value="confirmed">{t('reservations.confirmed')}</SelectItem>
                            <SelectItem value="seated">{t('reservations.seated')}</SelectItem>
                            <SelectItem value="completed">{t('reservations.completed')}</SelectItem>
                            <SelectItem value="cancelled">{t('reservations.cancelled')}</SelectItem>
                            <SelectItem value="no_show">{t('reservations.noShow')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(reservation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(reservation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {(reservation.special_requests || reservation.occasion) && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        {reservation.occasion && (
                          <p><span className="font-medium">{t('reservations.occasion')}:</span> {reservation.occasion}</p>
                        )}
                        {reservation.special_requests && (
                          <p><span className="font-medium">{t('reservations.requests')}:</span> {reservation.special_requests}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}