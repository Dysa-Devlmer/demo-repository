"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, UtensilsCrossed, ChefHat, Coffee, Cake, Wine, TrendingUp, Package, DollarSign } from "lucide-react";
import { apiService } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import useDemoMode from '@/hooks/useDemoMode';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  preparation_area: 'kitchen' | 'bar' | 'both';
  is_active: boolean;
}

interface MenuItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  category: string;
  category_id?: number;
  preparation_area?: 'kitchen' | 'bar' | 'both';
  available: boolean;
  imageUrl?: string;
}

interface MenuFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  category_id?: number;
  preparation_area: 'kitchen' | 'bar' | 'both';
  available: boolean;
}

export default function MenuPage() {
  const { t } = useTranslation();
  const { isDemoMode, demoData, updateMenu } = useDemoMode();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | number>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    category_id: undefined,
    preparation_area: "kitchen",
    available: true,
  });

  // Cargar categorías dinámicamente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await apiService.categories.getAll({ includeInactive: false });
        const categoriesData = response.data || response || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Si falla, usar categorías por defecto
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Cargar items del menú - unificado para evitar race conditions
  useEffect(() => {
    let isCancelled = false;

    const fetchMenuItems = async () => {
      // En modo demo, sincronizar con demoData
      if (isDemoMode) {
        setMenuItems(demoData.menu);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.menu.getAll();
        const menuData = response.data || [];

        // Normalizar datos: convertir precios string a number
        const normalizedData = menuData.map((item: any) => ({
          ...item,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }));

        if (!isCancelled) {
          setMenuItems(normalizedData);
        }
      } catch (error) {
        console.error('Error loading menu items:', error);
        if (!isCancelled) {
          setError('No se pudieron cargar los items del menú. Por favor, intenta de nuevo.');
          setMenuItems([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchMenuItems();

    return () => {
      isCancelled = true;
    };
  }, [isDemoMode, demoData.menu]);

  // Categorías para filtrado (usando las dinámicas del API)
  const allCategories = [
    { id: "all", name: t('menu.all'), slug: "all" },
    ...categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
  ];

  // Obtener el nombre de categoría basado en category_id o campo legacy
  const getCategoryLabel = (item: MenuItem | string) => {
    // Si es un string (para compatibilidad con otros usos)
    if (typeof item === 'string') {
      const categoryMap: Record<string, string> = {
        'main_course': t('menu.mainDishes'),
        'appetizer': t('menu.appetizers'),
        'beverage': t('menu.beverages'),
        'dessert': t('menu.desserts'),
        'special': t('menu.snacks'),
        'all': t('menu.all')
      };
      return categoryMap[item] || item;
    }

    // Si es un MenuItem, buscar por category_id
    const category = categories.find(c => c.id === item.category_id);
    if (category) {
      return category.name;
    }

    // Fallback al campo legacy category
    const categoryMap: Record<string, string> = {
      'main_course': t('menu.mainDishes'),
      'appetizer': t('menu.appetizers'),
      'beverage': t('menu.beverages'),
      'dessert': t('menu.desserts'),
      'special': t('menu.snacks')
    };
    return categoryMap[item.category] || item.category || 'Sin categoría';
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      category_id: undefined,
      preparation_area: "kitchen",
      available: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      category_id: item.category_id,
      preparation_area: item.preparation_area || "kitchen",
      available: item.available,
    });
    setIsEditing(true);
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: asegurar que se haya seleccionado una categoría
    if (!formData.category_id) {
      toast({
        title: t('common.error'),
        description: "Por favor selecciona una categoría antes de guardar",
        variant: "destructive",
      });
      return;
    }

    // Validación: asegurar que el nombre no esté vacío
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: t('common.error'),
        description: "Por favor ingresa un nombre para el platillo",
        variant: "destructive",
      });
      return;
    }

    if (isDemoMode) {
      console.log('🚀 Demo mode - menu item operation locally');

      if (isEditing && editingId) {
        // Actualizar item existente
        const updatedMenuItems = menuItems.map(item =>
          item.id === editingId
            ? {
                ...item,
                name: formData.name,
                description: formData.description,
                price: formData.price,
                category: formData.category,
                available: formData.available,
              }
            : item
        );
        setMenuItems(updatedMenuItems);
        updateMenu(updatedMenuItems as any);

        toast({
          title: t('common.success'),
          description: t('menu.dishUpdated'),
        });
      } else {
        // Crear nuevo item
        const newMenuItem: MenuItem = {
          id: Date.now(),
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          available: formData.available,
        };

        const updatedMenuItems = [...menuItems, newMenuItem];
        setMenuItems(updatedMenuItems);
        updateMenu(updatedMenuItems as any);

        toast({
          title: t('common.success'),
          description: t('menu.dishCreated'),
        });
      }

      setIsDialogOpen(false);
      resetForm();
      return;
    }

    try {
      // Preparar datos limpios para enviar al backend (solo campos que el DTO acepta)
      const cleanData = {
        name: formData.name,
        description: formData.description,
        price: typeof formData.price === 'string'
          ? parseFloat(formData.price as any)
          : formData.price,
        category_id: formData.category_id,
        preparation_area: formData.preparation_area,
        available: formData.available,
      };

      if (isEditing && editingId) {
        await apiService.menu.update(editingId.toString(), cleanData);

        // Normalizar el item actualizado
        const updatedData = {
          ...cleanData,
        };

        setMenuItems(menuItems.map(item =>
          item.id === editingId ? { ...item, ...updatedData } : item
        ));
        toast({
          title: t('common.success'),
          description: t('menu.dishUpdated'),
        });
      } else {
        const response = await apiService.menu.create(cleanData);

        // El backend devuelve { success: true, data: {...}, timestamp, path }
        // Necesitamos acceder a response.data.data para obtener el platillo
        const dishData = response.data.data || response.data;

        // Normalizar el nuevo item (convertir precio string a number si es necesario)
        const newItem = {
          ...dishData,
          price: typeof dishData.price === 'string'
            ? parseFloat(dishData.price)
            : dishData.price
        };

        setMenuItems([...menuItems, newItem]);
        toast({
          title: t('common.success'),
          description: t('menu.dishCreated'),
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ Error al crear/actualizar platillo:', error);
      toast({
        title: t('common.error'),
        description: isEditing ? t('menu.errorUpdating') : t('menu.errorCreating'),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm(t('menu.confirmDelete'))) {
      if (isDemoMode) {
        console.log('🚀 Demo mode - menu item deletion locally');
        const updatedMenuItems = menuItems.filter(item => item.id !== id);
        setMenuItems(updatedMenuItems);
        updateMenu(updatedMenuItems as any);

        toast({
          title: t('common.success'),
          description: t('menu.dishDeleted'),
        });
        return;
      }

      try {
        await apiService.menu.delete(id.toString());
        setMenuItems(menuItems.filter(item => item.id !== id));
        toast({
          title: t('common.success'),
          description: t('menu.dishDeleted'),
        });
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('menu.errorDeleting'),
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newAvailability = !item.available;
    const updatedItem = { ...item, available: newAvailability };

    if (isDemoMode) {
      const updatedMenuItems = menuItems.map(menuItem =>
        menuItem.id === item.id ? updatedItem : menuItem
      );
      setMenuItems(updatedMenuItems);
      updateMenu(updatedMenuItems as any);

      toast({
        title: t('common.success'),
        description: newAvailability ? t('menu.dishActivated') : t('menu.dishDeactivated'),
      });
      return;
    }

    try {
      // Solo enviar el campo que necesitamos actualizar para evitar errores de validación
      await apiService.menu.update(item.id.toString(), {
        available: newAvailability
      });

      setMenuItems(menuItems.map(menuItem =>
        menuItem.id === item.id ? updatedItem : menuItem
      ));

      toast({
        title: t('common.success'),
        description: newAvailability ? t('menu.dishActivated') : t('menu.dishDeactivated'),
      });
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      toast({
        title: t('common.error'),
        description: t('menu.errorUpdatingAvailability'),
        variant: "destructive",
      });
    }
  };

  // Helper para obtener el icono de categoría
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'main_course': ChefHat,
      'appetizer': UtensilsCrossed,
      'beverage': Coffee,
      'dessert': Cake,
      'special': Wine
    };
    return iconMap[category] || Package;
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('menu.title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Administra el menú de tu restaurante
          </p>
        </div>
        <Button onClick={handleCreate} size="lg" className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg">
          <Plus className="mr-2 h-5 w-5" />
          {t('menu.newDish')}
        </Button>
      </div>

      <Card className="mb-6 border-slate-200 dark:border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder={t('menu.searchDishes')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="default"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {loading ? (
          <Card className="col-span-full border-slate-200 dark:border-slate-800">
            <CardContent className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-slate-600 dark:text-slate-400">{t('menu.loadingMenu')}</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="col-span-full border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 mb-4">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Error al cargar el menú</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 text-center max-w-md">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card className="col-span-full border-slate-200 dark:border-slate-800">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-4 mb-4">
                <Search className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {menuItems.length === 0 ? 'No hay items en el menú' : 'No se encontraron items'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 text-center max-w-md">
                {menuItems.length === 0
                  ? 'Crea tu primer item del menú haciendo clic en "Agregar Platillo".'
                  : 'Intenta con otros filtros o términos de búsqueda.'}
              </p>
              {menuItems.length === 0 && (
                <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primer Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category);
            return (
              <Card
                key={item.id}
                className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="pb-4 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/20 dark:to-background">
                  <div className="space-y-3">
                    {/* Título y categoría en una línea */}
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-900/20 p-2.5 rounded-xl shadow-sm">
                        <CategoryIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight break-words">
                          {item.name}
                        </CardTitle>
                        <div className="mt-1.5">
                          <Badge
                            variant="outline"
                            className="text-[11px] font-medium border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50"
                          >
                            {getCategoryLabel(item)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {/* Estado de disponibilidad separado */}
                    <div className="flex justify-end">
                      <Badge
                        variant={item.available ? "default" : "secondary"}
                        className={cn(
                          "text-[11px] font-semibold px-2.5 py-0.5",
                          item.available
                            ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 dark:from-emerald-900/40 dark:to-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 dark:from-slate-800 dark:to-slate-900 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                        )}
                      >
                        {item.available ? '✓ Disponible' : '○ No disponible'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <CardDescription className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 min-h-[44px]">
                    {item.description || 'Sin descripción'}
                  </CardDescription>

                  {/* Sección de precio y disponibilidad con mejor espaciado */}
                  <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {/* Precio destacado */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-transparent p-1 rounded-lg">
                          <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Botón de disponibilidad con mejor diseño */}
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => handleToggleAvailability(item)}
                      className={cn(
                        "w-full h-10 font-medium transition-all duration-200",
                        item.available
                          ? "border-slate-200 hover:border-red-200 hover:bg-red-50 dark:border-slate-700 dark:hover:border-red-800 dark:hover:bg-red-950/50 group"
                          : "border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/50 group"
                      )}
                    >
                      {item.available ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                          <span className="group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                            Desactivar
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                          <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            Activar
                          </span>
                        </>
                      )}
                    </Button>

                    {/* Botones de acción mejorados */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="default"
                        className="h-10 font-medium border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50 dark:hover:border-indigo-700 transition-all group"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        className="h-10 font-medium border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:border-red-700 transition-all group"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/20 dark:to-background">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-slate-900 dark:text-slate-100">{t('menu.menuStats')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/20 dark:to-background">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('menu.totalDishes')}</p>
                <Package className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{menuItems.length}</p>
              <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-background">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t('menu.availableDishes')}</p>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {menuItems.filter(item => item.available).length}
              </p>
              <div className="h-1 w-full bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{
                    width: menuItems.length > 0
                      ? `${(menuItems.filter(item => item.available).length / menuItems.length) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50/50 to-white dark:from-red-900/10 dark:to-background">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{t('menu.unavailableDishes')}</p>
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {menuItems.filter(item => !item.available).length}
              </p>
              <div className="h-1 w-full bg-red-200 dark:bg-red-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600"
                  style={{
                    width: menuItems.length > 0
                      ? `${(menuItems.filter(item => !item.available).length / menuItems.length) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-background">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{t('menu.averagePrice')}</p>
                <DollarSign className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {(() => {
                  const validPrices = menuItems.filter(item =>
                    typeof item.price === 'number' && !isNaN(item.price) && item.price >= 0
                  );

                  const total = validPrices.reduce((sum, item) => sum + item.price, 0);
                  const average = validPrices.length > 0 ? total / validPrices.length : 0;

                  return formatCurrency(average);
                })()}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                <TrendingUp className="h-3 w-3" />
                <span>Promedio del menú</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar platillos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-slate-200 dark:border-slate-800">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                {isEditing ? (
                  <Edit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">
                  {isEditing ? t('menu.editDish') : t('menu.newDish')}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                  {isEditing ? t('menu.editDishInfo') : t('menu.createNewDish')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('menu.name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: Pastel de Choclo"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('menu.description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe el platillo..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px] border-slate-300 dark:border-slate-700 focus:border-indigo-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('menu.price')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="pl-10 h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category_id?.toString() || ""}
                    onValueChange={(value) => {
                      const categoryId = parseInt(value);
                      const category = categories.find(c => c.id === categoryId);
                      setFormData(prev => ({
                        ...prev,
                        category_id: categoryId,
                        category: category?.slug || "",
                        // Auto-asignar preparation_area basado en la categoría seleccionada
                        preparation_area: category?.preparation_area || prev.preparation_area
                      }));
                    }}
                    required
                  >
                    <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>Cargando...</SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="empty" disabled>No hay categorías disponibles</SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              {category.icon && <span>{category.icon}</span>}
                              <span>{category.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({category.preparation_area === 'kitchen' ? 'Cocina' :
                                  category.preparation_area === 'bar' ? 'Barra' : 'Ambas'})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparation_area" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Área de Preparación <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.preparation_area}
                    onValueChange={(value: 'kitchen' | 'bar' | 'both') =>
                      setFormData(prev => ({ ...prev, preparation_area: value }))
                    }
                    required
                  >
                    <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 focus:border-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kitchen">
                        <div className="flex items-center gap-2">
                          <ChefHat className="h-4 w-4" />
                          <span>Cocina</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bar">
                        <div className="flex items-center gap-2">
                          <Wine className="h-4 w-4" />
                          <span>Barra</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4" />
                          <span>Ambas Áreas</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define dónde se prepara este platillo
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <Label htmlFor="available" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  {t('menu.available')}
                </Label>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-200 dark:border-slate-800 pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
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
                    <Plus className="mr-2 h-4 w-4" />
                    {t('common.create')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}