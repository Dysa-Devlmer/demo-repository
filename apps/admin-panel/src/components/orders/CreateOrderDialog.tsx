"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import useDemoMode from "@/hooks/useDemoMode";
import { Plus, Minus, Trash2, ShoppingCart, Search, AlertCircle, CheckCircle, AlertTriangle, Info, XCircle, WifiOff } from "lucide-react";
import { formatCurrency } from '@/lib/formatters';

// Traducciones de categorías
const getCategoryLabel = (category: string): string => {
  const translations: Record<string, string> = {
    'appetizer': 'Entradas',
    'main_course': 'Platos Principales',
    'dessert': 'Postres',
    'beverage': 'Bebidas',
    'side': 'Acompañamientos',
    'salad': 'Ensaladas',
    'soup': 'Sopas',
    'pasta': 'Pastas',
    'pizza': 'Pizzas',
    'burger': 'Hamburguesas',
    'seafood': 'Mariscos',
    'vegetarian': 'Vegetarianos',
    'vegan': 'Veganos',
    'combo': 'Combos',
    'special': 'Especiales'
  };

  return translations[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

interface MenuItem {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
}

interface OrderItem {
  menuItemId: number | string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

export function CreateOrderDialog({ open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) {
  const { toast } = useToast();
  const { isDemoMode, demoData, updateOrders } = useDemoMode();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    orderType: "takeaway", // Cambiado a "takeaway" por defecto (Para Llevar)
    deliveryAddress: "",
    notes: "",
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (open) {
      loadMenuItems();
    }
  }, [open]);

  const loadMenuItems = async () => {
    try {
      if (isDemoMode) {
        console.log('🚀 Demo mode - using demo menu data');
        const availableItems = demoData.menu.filter((item: MenuItem) => item.available);
        setMenuItems(availableItems);
        return;
      }

      const response = await apiService.menu.getAll();
      const availableItems = response.data.filter((item: MenuItem) => item.available);
      setMenuItems(availableItems);
    } catch (error) {
      console.error("Error loading menu:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el menú",
        variant: "destructive",
      });
    }
  };

  const categories = ["all", ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItem.id);

    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const handleRemoveItem = (menuItemId: number | string) => {
    setOrderItems(orderItems.filter(item => item.menuItemId !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId: number | string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
    } else {
      setOrderItems(orderItems.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.19; // 19% IVA
    const deliveryFee = formData.orderType === "delivery" ? 3000 : 0;
    const total = subtotal + tax + deliveryFee;

    return { subtotal, tax, deliveryFee, total };
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.customerName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!formData.customerPhone.trim()) {
      toast({
        title: "Error",
        description: "El teléfono del cliente es requerido",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un item a la orden",
        variant: "destructive",
      });
      return;
    }

    if (formData.orderType === "delivery" && !formData.deliveryAddress.trim()) {
      toast({
        title: "Error",
        description: "La dirección de entrega es requerida para delivery",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { subtotal, tax, deliveryFee, total } = calculateTotals();

      // Generar número de orden único
      const orderNumber = `${Date.now()}`;

      if (isDemoMode) {
        console.log('🚀 Demo mode - creating order locally');

        const newOrder = {
          id: orderNumber,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          orderType: formData.orderType as 'delivery' | 'takeaway',
          status: "pending" as const,
          items: orderItems.map(item => ({
            id: `${orderNumber}-${item.menuItemId}`,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: total,
          deliveryAddress: formData.deliveryAddress || undefined,
          notes: formData.notes || undefined,
          createdAt: new Date().toISOString()
        };

        const updatedOrders = [...demoData.orders, newOrder];
        updateOrders(updatedOrders as any);

        toast({
          title: "¡Orden creada!",
          description: `Orden #${orderNumber} creada exitosamente`,
        });
      } else {
        // Step 1: Create or get customer
        const customerData: any = {
          name: formData.customerName,
          phone: formData.customerPhone,
          source: "admin" as const,
        };

        // Only add optional fields if they have values
        if (formData.customerEmail) {
          customerData.email = formData.customerEmail;
        }
        if (formData.deliveryAddress) {
          customerData.address = formData.deliveryAddress;
        }

        console.log('📦 Creating customer with data:', customerData);
        const customerResponse = await apiService.customers.create(customerData);
        console.log('✅ Customer response:', customerResponse.data);
        const customerId = customerResponse.data.data?.id || customerResponse.data.id;
        console.log('👤 Customer ID:', customerId);

        // Step 2: Create order with complete data
        const orderData: any = {
          customerId: customerId,
          items: orderItems.map(item => ({
            menuItemId: Number(item.menuItemId),
            quantity: item.quantity
          })),
          orderType: formData.orderType,
          tax: tax,
          tip: 0
        };

        // Only add optional fields if they have values
        if (formData.deliveryAddress) {
          orderData.deliveryAddress = formData.deliveryAddress;
        }
        if (formData.notes) {
          orderData.notes = formData.notes;
        }

        console.log('📦 Creating order with data:', JSON.stringify(orderData, null, 2));
        const orderResponse = await apiService.orders.create(orderData);
        console.log('✅ Orden creada:', orderResponse.data);

        toast({
          title: (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>¡Orden creada!</span>
            </>
          ),
          description: `Orden creada exitosamente`,
          variant: "success",
        });
      }

      // Reset form
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        orderType: "takeaway",
        deliveryAddress: "",
        notes: "",
      });
      setOrderItems([]);
      setSearchTerm("");
      setSelectedCategory("all");

      onOrderCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Error creating order:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      let errorTitle = "Error al crear orden";
      let errorMessage = "No se pudo crear la orden";
      let errorIcon = <XCircle className="h-5 w-5" />;
      let errorVariant: "destructive" | "warning" | "info" = "destructive";

      // Manejar errores específicos por código de estado HTTP
      if (error.response) {
        const status = error.response.status;
        const responseMessage = error.response.data?.message;

        if (status === 409) {
          // Conflicto - Email duplicado u otro conflicto de datos
          errorTitle = "Cliente ya existe";
          errorMessage = responseMessage || "Ya existe un cliente con este email. Por favor, use un email diferente o seleccione el cliente existente.";
          errorIcon = <AlertTriangle className="h-5 w-5" />;
          errorVariant = "warning";
        } else if (status === 400) {
          // Validación fallida
          errorTitle = "Datos inválidos";
          errorMessage = responseMessage || "Los datos ingresados no son válidos. Por favor, verifique la información.";
          errorIcon = <AlertCircle className="h-5 w-5" />;
          errorVariant = "warning";
        } else if (status === 404) {
          // Recurso no encontrado
          errorTitle = "Recurso no encontrado";
          errorMessage = responseMessage || "No se encontró el cliente o producto seleccionado.";
          errorIcon = <Info className="h-5 w-5" />;
          errorVariant = "info";
        } else if (status === 500) {
          // Error del servidor
          errorTitle = "Error del servidor";
          errorMessage = "Ocurrió un error en el servidor. Por favor, intente nuevamente.";
          errorIcon = <XCircle className="h-5 w-5" />;
          errorVariant = "destructive";
        } else {
          // Otros errores HTTP
          errorMessage = responseMessage || `Error ${status}: No se pudo completar la operación.`;
          errorIcon = <XCircle className="h-5 w-5" />;
          errorVariant = "destructive";
        }
      } else if (error.request) {
        // Error de red - no se recibió respuesta
        errorTitle = "Error de conexión";
        errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet.";
        errorIcon = <WifiOff className="h-5 w-5" />;
        errorVariant = "destructive";
      } else {
        // Otro tipo de error
        errorMessage = error.message || "Ocurrió un error inesperado.";
        errorIcon = <AlertCircle className="h-5 w-5" />;
        errorVariant = "destructive";
      }

      toast({
        title: (
          <>
            {errorIcon}
            <span>{errorTitle}</span>
          </>
        ),
        description: errorMessage,
        variant: errorVariant,
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, deliveryFee, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Orden</DialogTitle>
          <DialogDescription>
            Completa los datos del cliente y selecciona los items del pedido
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Teléfono *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+56912345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="cliente@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderType">Tipo de Orden *</Label>
                <Select
                  value={formData.orderType}
                  onValueChange={(value) => setFormData({ ...formData, orderType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="takeaway">Para Llevar</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.orderType === "delivery" && (
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Dirección de Entrega *</Label>
                <Input
                  id="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Av. Principal 123, Depto 4B"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notas / Instrucciones Especiales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Sin cebolla, extra salsa..."
                rows={2}
              />
            </div>
          </div>

          {/* Selección de Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Seleccionar Items</h3>

            {/* Búsqueda y Filtros */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.filter(c => c !== "all").map(category => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Items del Menú */}
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-2">
              {filteredItems.map(item => (
                <Card key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleAddItem(item)}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        <p className="text-sm font-semibold mt-1">{formatCurrency(item.price)}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAddItem(item); }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Items Seleccionados */}
            {orderItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Items Seleccionados ({orderItems.length})</h4>
                  <Badge variant="secondary">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
                  </Badge>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {orderItems.map(item => (
                    <div key={item.menuItemId} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveItem(item.menuItemId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resumen de Totales */}
          {orderItems.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-semibold text-lg">Resumen</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Costo de Delivery:</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || orderItems.length === 0}>
            {loading ? "Creando..." : "Crear Orden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
