"use client";

import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ChefHat,
  Wine,
  Utensils,
  Filter,
  ArrowUpDown,
  X
} from "lucide-react";
import { apiService } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import useDemoMode from '@/hooks/useDemoMode';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  preparation_area: 'kitchen' | 'bar' | 'both';
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  preparation_area: 'kitchen' | 'bar' | 'both';
  is_active: boolean;
}

// Sortable Row Component for Drag & Drop
function SortableRow({ category, onEdit, onDelete, onToggle }: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPreparationAreaIcon = (area: string) => {
    switch (area) {
      case 'kitchen': return <ChefHat className="h-4 w-4" />;
      case 'bar': return <Wine className="h-4 w-4" />;
      case 'both': return <Utensils className="h-4 w-4" />;
      default: return null;
    }
  };

  const getPreparationAreaLabel = (area: string) => {
    switch (area) {
      case 'kitchen': return 'Cocina';
      case 'bar': return 'Barra';
      case 'both': return 'Ambas';
      default: return area;
    }
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'bg-muted/50' : ''}>
      <TableCell>
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="text-center">
        <span className="text-2xl">{category.icon || '-'}</span>
      </TableCell>
      <TableCell className="font-medium">
        {category.name}
      </TableCell>
      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
        {category.description || '-'}
      </TableCell>
      <TableCell className="text-sm">
        {getPreparationAreaLabel(category.preparation_area)}
      </TableCell>
      <TableCell>
        <Badge variant={category.is_active ? "default" : "secondary"}>
          {category.is_active ? "Activa" : "Inactiva"}
        </Badge>
      </TableCell>
      <TableCell className="text-center">{category.display_order}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(category.id)}
            title={category.is_active ? "Desactivar" : "Activar"}
            className="hover:bg-gray-100"
          >
            {category.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
            title="Editar categoría"
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category.id)}
            title="Eliminar categoría"
            className="text-destructive hover:bg-red-50 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { isDemoMode } = useDemoMode();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPreparationArea, setFilterPreparationArea] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    icon: "",
    preparation_area: "kitchen",
    is_active: true,
  });

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, [isDemoMode]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.categories.getAll({ includeInactive: true });
      const categoriesData = response.data || response || [];

      // Sort by display_order
      const sortedCategories = categoriesData.sort((a: Category, b: Category) =>
        a.display_order - b.display_order
      );

      setCategories(sortedCategories);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      setError('No se pudieron cargar las categorías. Por favor, intenta de nuevo.');
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);

      // Update display_order for all affected categories
      const orderUpdates = newCategories.map((cat, index) => ({
        id: cat.id,
        display_order: index + 1,
      }));

      // Optimistic update
      setCategories(newCategories.map((cat, index) => ({
        ...cat,
        display_order: index + 1,
      })));

      try {
        await apiService.categories.reorder(orderUpdates);
        toast({
          title: "Orden actualizado",
          description: "El orden de las categorías se ha actualizado correctamente",
        });
      } catch (error) {
        console.error('Error updating order:', error);
        // Revert on error
        fetchCategories();
        toast({
          title: "Error",
          description: "No se pudo actualizar el orden de las categorías",
          variant: "destructive",
        });
      }
    }
  };

  // Handle create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && editingId) {
        await apiService.categories.update(editingId, formData);
        toast({
          title: "Categoría actualizada",
          description: `La categoría "${formData.name}" ha sido actualizada correctamente`,
        });
      } else {
        // Generar slug automáticamente a partir del nombre
        const slug = formData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
          .replace(/[^a-z0-9\s-]/g, '')     // Eliminar caracteres especiales
          .trim()
          .replace(/\s+/g, '-')             // Espacios a guiones
          .replace(/-+/g, '-');             // Múltiples guiones a uno solo

        const categoryData = {
          ...formData,
          slug: slug
        };

        await apiService.categories.create(categoryData);
        toast({
          title: "Categoría creada",
          description: `La categoría "${formData.name}" ha sido creada correctamente`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo guardar la categoría",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }

    try {
      await apiService.categories.delete(id);
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
      });
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo eliminar la categoría",
        variant: "destructive",
      });
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: number) => {
    try {
      await apiService.categories.toggleActive(id);
      toast({
        title: "Estado actualizado",
        description: "El estado de la categoría ha sido actualizado",
      });
      fetchCategories();
    } catch (error: any) {
      console.error('Error toggling category:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la categoría",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog
  const handleEdit = (category: Category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      preparation_area: category.preparation_area,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      preparation_area: "kitchen",
      is_active: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Filtered and sorted categories
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPreparationArea = filterPreparationArea === "all" ||
                                     category.preparation_area === filterPreparationArea;
      const matchesActive = filterActive === "all" ||
                           (filterActive === "active" && category.is_active) ||
                           (filterActive === "inactive" && !category.is_active);

      return matchesSearch && matchesPreparationArea && matchesActive;
    });
  }, [categories, searchTerm, filterPreparationArea, filterActive]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: categories.length,
      active: categories.filter(c => c.is_active).length,
      inactive: categories.filter(c => !c.is_active).length,
      kitchen: categories.filter(c => c.preparation_area === 'kitchen').length,
      bar: categories.filter(c => c.preparation_area === 'bar').length,
      both: categories.filter(c => c.preparation_area === 'both').length,
    };
  }, [categories]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Categorías</h1>
            <p className="text-muted-foreground">
              Administra las categorías del menú y sus áreas de preparación
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? "Editar Categoría" : "Nueva Categoría"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditing
                      ? "Modifica los datos de la categoría"
                      : "Completa el formulario para crear una nueva categoría"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Entradas, Bebidas, Postres"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción de la categoría"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Icono (Opcional)</Label>
                    <div className="grid grid-cols-10 gap-2 p-4 border rounded-md max-h-64 overflow-y-auto bg-gray-50">
                      {[
                        // Sin icono
                        '',
                        // Platos generales y entradas (10)
                        '🍽️', '🍴', '🥄', '🥢', '🍖', '🍗', '🥩', '🍤', '🦐', '🦞',
                        // Comida rápida y casual (10)
                        '🍕', '🍔', '🌮', '🌯', '🥙', '🌭', '🥪', '🍟', '🍿', '🥨',
                        // Platos principales internacionales (10)
                        '🍣', '🍱', '🍜', '🍝', '🍲', '🥘', '🍛', '🥟', '🥠', '🍢',
                        // Carnes y parrilla (8)
                        '🥓', '🍗', '🦴', '🌭', '🥩', '🍖', '🦃', '🍗',
                        // Mariscos y pescados (8)
                        '🐟', '🐠', '🦈', '🐡', '🦑', '🦀', '🦞', '🍤',
                        // Postres y dulces (12)
                        '🍰', '🧁', '🍪', '🍩', '🎂', '🍮', '🍨', '🍧', '🥧', '🍫', '🍬', '🍭',
                        // Panadería (8)
                        '🥐', '🥖', '🥯', '🍞', '🥨', '🧇', '🥞', '🍳',
                        // Bebidas calientes (8)
                        '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🫖', '☕',
                        // Bebidas frías y jugos (8)
                        '🥤', '🧃', '🧊', '🥛', '🍼', '🧉', '🥃', '🍹',
                        // Bebidas alcohólicas - Barra (12)
                        '🍺', '🍻', '🍷', '🥂', '🍾', '🍸', '🍹', '🍶', '🥃', '🍵', '🧉', '🫗',
                        // Cocteles y mixología (8)
                        '🍸', '🍹', '🍷', '🥃', '🥂', '🍾', '🧉', '🫗',
                        // Ensaladas y saludable (8)
                        '🥗', '🥙', '🌯', '🥪', '🥖', '🧀', '🥚', '🍳',
                        // Frutas (20)
                        '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭',
                        '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝',
                        '🍅', '🫒', '🥥', '🥑',
                        // Vegetales (16)
                        '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄',
                        '🧅', '🥔', '🍠', '🫘', '🥜', '🌰', '🫚', '🫛',
                        // Quesos y lácteos (6)
                        '🧀', '🥛', '🍼', '🧈', '🥚', '🍳',
                        // Condimentos y especias (8)
                        '🧂', '🍯', '🥫', '🫙', '🍶', '🧴', '🫗', '🌶️',
                        // Extras y snacks (8)
                        '🍿', '🥜', '🌰', '🍪', '🍬', '🍭', '🍫', '🎂'
                      ].map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: emoji })}
                          className={`
                            h-12 w-12 flex items-center justify-center text-2xl rounded-md border-2
                            transition-all hover:scale-110 hover:shadow-md
                            ${formData.icon === emoji
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-gray-200 hover:border-primary/50 bg-white'
                            }
                          `}
                          title={emoji || 'Sin icono'}
                        >
                          {emoji || '∅'}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      170+ iconos disponibles. Scroll para ver más opciones. Haz clic en ∅ para no usar icono.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="preparation_area">Área de Preparación *</Label>
                    <Select
                      value={formData.preparation_area}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, preparation_area: value })
                      }
                    >
                      <SelectTrigger>
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
                            <Utensils className="h-4 w-4" />
                            <span>Ambas</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      Categoría activa
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inactivas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cocina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.kitchen}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Barra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bar}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ambas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.both}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Select value={filterPreparationArea} onValueChange={setFilterPreparationArea}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Área de preparación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  <SelectItem value="kitchen">Cocina</SelectItem>
                  <SelectItem value="bar">Barra</SelectItem>
                  <SelectItem value="both">Ambas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table with Drag & Drop */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>
                  Arrastra las filas para reordenar las categorías
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {filteredCategories.length} categoría{filteredCategories.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Cargando categorías...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                <p>{error}</p>
                <Button onClick={fetchCategories} variant="outline" className="mt-4">
                  Reintentar
                </Button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No se encontraron categorías</p>
                <Button onClick={resetForm} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera categoría
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="w-[60px]">Icono</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Área de Preparación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-center">Orden</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <SortableContext
                      items={filteredCategories.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <TableBody>
                        {filteredCategories.map((category) => (
                          <SortableRow
                            key={category.id}
                            category={category}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggle={handleToggleActive}
                          />
                        ))}
                      </TableBody>
                    </SortableContext>
                  </Table>
                </div>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
