# 🚀 Plan para Completar Sistema ChatBotDysa

**Fecha Inicio:** 22 de Octubre, 2025 - 9:30 PM
**Objetivo:** Completar TODAS las funcionalidades faltantes para producción
**Estimado:** 15-20 días de trabajo
**Estado:** 🟡 EN PROGRESO

---

## ✅ FASE 1: LIMPIEZA DE CÓDIGO - **COMPLETADA**

### Cambios Realizados:

#### `/apps/admin-panel/src/app/orders/page.tsx`
✅ **Eliminado:** Mock data hardcodeado (mockOrders array)
✅ **Agregado:** Manejo de errores con estado `error`
✅ **Agregado:** Estado vacío informativo con mensaje contextual
✅ **Agregado:** Botón "Reintentar" en caso de error
✅ **Mejorado:** Mensajes según filtros aplicados

**Antes:**
```typescript
catch (error) {
  // Use mock data on error
  setOrders(mockOrders);
  setFilteredOrders(mockOrders);
}
```

**Después:**
```typescript
catch (error) {
  console.error('Error loading orders:', error);
  setError('No se pudieron cargar las órdenes...');
  setOrders([]);
  setFilteredOrders([]);
}

// En el render:
{error ? (
  <div className="text-center py-12">
    <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
    <h3>Error al cargar órdenes</h3>
    <p>{error}</p>
    <Button onClick={() => window.location.reload()}>
      Reintentar
    </Button>
  </div>
) : filteredOrders.length === 0 ? (
  <div className="text-center py-12">
    <ShoppingBag className="mx-auto h-12 w-12" />
    <h3>No hay órdenes</h3>
    <p>Aún no hay órdenes en el sistema...</p>
  </div>
) : (
  // Tabla de órdenes
)}
```

---

#### `/apps/admin-panel/src/app/menu/page.tsx`
✅ **Eliminado:** Mock data hardcodeado (array con tacos, quesadillas, jamaica)
✅ **Agregado:** Manejo de errores con estado `error`
✅ **Agregado:** Estado vacío con botón "Agregar Primer Item"
✅ **Mejorado:** Diferencia entre "no hay items" vs "no se encontraron con filtros"

**Antes:**
```typescript
catch (error) {
  setMenuItems([
    { id: "1", name: "Tacos al Pastor", ... },
    { id: "2", name: "Quesadillas", ... },
    { id: "3", name: "Agua de Jamaica", ... },
  ]);
}
```

**Después:**
```typescript
catch (error) {
  console.error('Error loading menu items:', error);
  setError('No se pudieron cargar los items del menú...');
  setMenuItems([]);
}

// En el render:
{error ? (
  <Card className="col-span-full">
    <XCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3>Error al cargar el menú</h3>
    <p>{error}</p>
    <Button onClick={() => window.location.reload()}>
      Reintentar
    </Button>
  </Card>
) : filteredItems.length === 0 ? (
  <Card className="col-span-full">
    <Search className="h-12 w-12 mb-4" />
    <h3>{menuItems.length === 0 ? 'No hay items en el menú' : 'No se encontraron items'}</h3>
    {menuItems.length === 0 && (
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="mr-2" />
        Agregar Primer Item
      </Button>
    )}
  </Card>
) : (
  // Grid de items
)}
```

---

## 🔧 FASE 2: SISTEMA DE ÓRDENES COMPLETO

**Estado:** 🟡 EN PROGRESO
**Estimado:** 3-4 días
**Prioridad:** ⭐⭐⭐ ALTA

### 2.1 Formulario de Creación de Órdenes

**Archivo:** `/apps/admin-panel/src/app/orders/page.tsx`

**Funcionalidades a implementar:**

1. **Dialog/Modal para Nueva Orden**
```typescript
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [orderFormData, setOrderFormData] = useState({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  orderType: 'dine-in',
  items: [],
  deliveryAddress: '',
  notes: ''
});
```

2. **Selector de Items del Menú**
   - Componente `MenuItemSelector`
   - Mostrar items disponibles del menú
   - Agregar items con cantidad
   - Cálculo automático de subtotal

3. **Cálculo de Totals**
```typescript
const calculateTotals = (items: OrderItem[]) => {
  const subtotal = items.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0
  );
  const tax = subtotal * 0.19; // 19% IVA
  const deliveryFee = orderType === 'delivery' ? 3000 : 0;
  const total = subtotal + tax + deliveryFee;

  return { subtotal, tax, deliveryFee, total };
};
```

4. **Submit de Orden**
```typescript
const handleCreateOrder = async () => {
  try {
    const { subtotal, tax, deliveryFee, total } = calculateTotals(items);

    const orderData = {
      customer_name: orderFormData.customerName,
      customer_phone: orderFormData.customerPhone,
      customer_email: orderFormData.customerEmail,
      order_type: orderFormData.orderType,
      items: orderFormData.items,
      subtotal,
      tax,
      tip: 0,
      total,
      delivery_address: orderFormData.deliveryAddress,
      notes: orderFormData.notes,
      status: 'pending'
    };

    await apiService.orders.create(orderData);
    toast({ title: 'Orden creada exitosamente' });
    setIsCreateDialogOpen(false);
    fetchOrders(); // Reload
  } catch (error) {
    toast({
      title: 'Error al crear orden',
      variant: 'destructive'
    });
  }
};
```

**Componentes UI necesarios:**
- [x] Button "Nueva Orden"
- [ ] Dialog con formulario
- [ ] Select para tipo de orden
- [ ] Input para datos del cliente
- [ ] MenuItemSelector component
- [ ] Resumen de totales
- [ ] Botón Submit

---

### 2.2 Flujo de Estados de Orden

**Estados:** pending → confirmed → preparing → ready → delivered

**Implementación:**

1. **Dropdown de Acciones por Orden**
```typescript
const handleStatusChange = async (orderId: string, newStatus: string) => {
  try {
    await apiService.orders.update(orderId, { status: newStatus });
    toast({ title: `Orden ${newStatus}` });
    fetchOrders();
  } catch (error) {
    toast({ title: 'Error al actualizar estado', variant: 'destructive' });
  }
};
```

2. **Badges con Colores por Estado**
```typescript
const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-purple-500',
  ready: 'bg-green-500',
  delivered: 'bg-gray-500',
  cancelled: 'bg-red-500'
};
```

3. **Validaciones de Transiciones**
```typescript
const validTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
};
```

---

### 2.3 Integración con Menú

**Componente:** `MenuItemSelector.tsx` (NUEVO)

```typescript
interface MenuItemSelectorProps {
  onSelectItems: (items: OrderItem[]) => void;
  selectedItems: OrderItem[];
}

export function MenuItemSelector({ onSelectItems, selectedItems }: MenuItemSelectorProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar items del menú disponibles
    const fetchMenu = async () => {
      const response = await apiService.menu.getAll();
      setMenuItems(response.data.filter(item => item.available));
      setLoading(false);
    };
    fetchMenu();
  }, []);

  const handleAddItem = (menuItem: MenuItem) => {
    const existing = selectedItems.find(i => i.id === menuItem.id);
    if (existing) {
      // Incrementar cantidad
      const updated = selectedItems.map(i =>
        i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      onSelectItems(updated);
    } else {
      // Agregar nuevo
      onSelectItems([...selectedItems, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    onSelectItems(selectedItems.filter(i => i.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      const updated = selectedItems.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      );
      onSelectItems(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Lista de items del menú */}
      <div className="grid gap-2">
        {menuItems.map(item => (
          <Card key={item.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toLocaleString()}
                </p>
              </div>
              <Button onClick={() => handleAddItem(item)} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Items seleccionados */}
      {selectedItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Items Seleccionados</h4>
          {selectedItems.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm">${item.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </Button>
                <span>{item.quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🤖 FASE 3: AI CHATBOT CON OLLAMA

**Estado:** ⏳ PENDIENTE
**Estimado:** 2-3 días
**Prioridad:** ⭐⭐ MEDIA-ALTA

### 3.1 Conectar Ollama con Frontend

**Archivo:** `/apps/admin-panel/src/app/ai-chat/page.tsx`

**Cambios necesarios:**

1. **Eliminar Mock Models**
```typescript
// ANTES:
setAvailableModels([
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', ... },
  { id: 'gpt-4', name: 'GPT-4', ... },
  { id: 'claude-3', name: 'Claude', ... }
]);

// DESPUÉS:
const fetchModels = async () => {
  try {
    const response = await apiService.ai.getModels();
    setAvailableModels(response.data);
    setSelectedModel(response.data[0]?.id || 'phi3:mini');
  } catch (error) {
    console.error('Error loading models:', error);
  }
};
```

2. **Implementar Envío de Mensajes Real**
```typescript
const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: inputMessage,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);

  try {
    const response = await apiService.ai.sendMessage({
      message: inputMessage,
      model: selectedModel,
      systemPrompt: systemPrompt,
      history: messages.slice(-10) // Últimos 10 mensajes
    });

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.data.response,
      timestamp: new Date(),
      model: selectedModel
    };

    setMessages(prev => [...prev, assistantMessage]);
  } catch (error) {
    console.error('Error sending message:', error);
    toast({
      title: 'Error al enviar mensaje',
      description: 'No se pudo conectar con el servicio de IA.',
      variant: 'destructive'
    });
  } finally {
    setIsLoading(false);
  }
};
```

3. **Endpoint Backend para Ollama**

**Archivo:** `/apps/backend/src/modules/ai/ai.controller.ts`

```typescript
@Post('send-message')
async sendMessage(@Body() dto: SendMessageDto) {
  const { message, model, systemPrompt, history } = dto;

  try {
    // Llamar a Ollama
    const response = await this.httpService.post(
      'http://ollama:11434/api/generate',
      {
        model: model || 'phi3:mini',
        prompt: this.buildPrompt(systemPrompt, history, message),
        stream: false
      }
    ).toPromise();

    return {
      success: true,
      data: {
        response: response.data.response,
        model: model,
        timestamp: new Date()
      }
    };
  } catch (error) {
    throw new BadRequestException('Error al comunicarse con Ollama');
  }
}

@Get('models')
async getModels() {
  try {
    const response = await this.httpService.get(
      'http://ollama:11434/api/tags'
    ).toPromise();

    return {
      success: true,
      data: response.data.models.map(m => ({
        id: m.name,
        name: m.name,
        description: `Modelo ${m.name}`,
        available: true
      }))
    };
  } catch (error) {
    throw new BadRequestException('Error al listar modelos');
  }
}
```

---

### 3.2 Prompts para Restaurante

**Archivo:** `/apps/backend/src/modules/ai/prompts/restaurant.prompt.ts`

```typescript
export const RESTAURANT_SYSTEM_PROMPT = `
Eres un asistente virtual de ChatBotDysa, un sistema de gestión para restaurantes.

Tu rol es ayudar al personal del restaurante con:
1. Responder preguntas sobre el menú
2. Ayudar a crear pedidos
3. Consultar información de clientes
4. Sugerir platos según preferencias
5. Proporcionar información sobre reservas

Contexto del restaurante:
- Nombre: {{RESTAURANT_NAME}}
- Tipo de cocina: {{CUISINE_TYPE}}
- Horario: {{HOURS}}

Reglas:
- Sé amable y profesional
- Responde en español
- Si no sabes algo, dilo honestamente
- Mantén respuestas concisas
- Sugiere acciones concretas

Menú disponible:
{{MENU_ITEMS}}

Cliente actual (si aplica):
{{CURRENT_CUSTOMER}}
`;

export const buildRestaurantPrompt = (context: any) => {
  let prompt = RESTAURANT_SYSTEM_PROMPT;

  prompt = prompt.replace('{{RESTAURANT_NAME}}', context.restaurantName || 'Restaurante');
  prompt = prompt.replace('{{CUISINE_TYPE}}', context.cuisineType || 'variada');
  prompt = prompt.replace('{{HOURS}}', context.hours || '9:00 - 22:00');

  // Agregar items del menú
  if (context.menuItems && context.menuItems.length > 0) {
    const menuList = context.menuItems
      .map(item => `- ${item.name}: $${item.price} (${item.category})`)
      .join('\n');
    prompt = prompt.replace('{{MENU_ITEMS}}', menuList);
  } else {
    prompt = prompt.replace('{{MENU_ITEMS}}', 'No hay items en el menú');
  }

  // Agregar info del cliente si existe
  if (context.customer) {
    const customerInfo = `
Nombre: ${context.customer.name}
Email: ${context.customer.email}
Teléfono: ${context.customer.phone}
Órdenes previas: ${context.customer.totalOrders || 0}
`;
    prompt = prompt.replace('{{CURRENT_CUSTOMER}}', customerInfo);
  } else {
    prompt = prompt.replace('{{CURRENT_CUSTOMER}}', 'No hay cliente seleccionado');
  }

  return prompt;
};
```

---

## 🌐 FASE 4: WEB WIDGET DEPLOYMENT

**Estado:** ⏳ PENDIENTE
**Estimado:** 2 días
**Prioridad:** ⭐⭐ MEDIA

### 4.1 Build del Widget

**Directorio:** `/apps/web-widget`

**Pasos:**

1. **Configurar Build para Bundle**

`/apps/web-widget/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/widget.tsx',
      name: 'ChatBotDysaWidget',
      fileName: 'chatbot-widget',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  }
});
```

2. **Entry Point del Widget**

`/apps/web-widget/src/widget.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

// Widget initialization
(function() {
  window.ChatBotDysa = {
    init: function(config) {
      const container = document.createElement('div');
      container.id = 'chatbot-dysa-widget';
      document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);
      root.render(<ChatWidget config={config} />);
    }
  };
})();
```

3. **Build Command**
```bash
cd apps/web-widget
npm run build
# Genera: dist/chatbot-widget.iife.js
```

---

### 4.2 Script de Instalación

**Archivo:** `/apps/web-widget/README.md`

```markdown
# ChatBotDysa Web Widget

## Instalación

### Opción 1: CDN (Recomendada)

Agrega este código antes del cierre de `</body>`:

\`\`\`html
<!-- ChatBotDysa Widget -->
<script src="https://cdn.chatbotdysa.com/widget/v1/chatbot-widget.js"></script>
<script>
  ChatBotDysa.init({
    apiUrl: 'https://api.turestaurante.com',
    restaurantId: 'TU_RESTAURANT_ID',
    primaryColor: '#7C3AED',
    position: 'bottom-right',
    welcomeMessage: '¡Hola! ¿En qué puedo ayudarte?'
  });
</script>
\`\`\`

### Opción 2: NPM

\`\`\`bash
npm install @chatbotdysa/widget
\`\`\`

\`\`\`javascript
import { ChatBotDysa } from '@chatbotdysa/widget';

ChatBotDysa.init({
  apiUrl: 'https://api.turestaurante.com',
  restaurantId: 'TU_RESTAURANT_ID'
});
\`\`\`

## Configuración

### Opciones Disponibles

\`\`\`typescript
interface WidgetConfig {
  apiUrl: string;              // URL de tu backend
  restaurantId: string;        // ID de tu restaurante
  primaryColor?: string;       // Color principal (hex)
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  welcomeMessage?: string;     // Mensaje de bienvenida
  autoOpen?: boolean;          // Abrir automáticamente
  showBranding?: boolean;      // Mostrar "Powered by ChatBotDysa"
  language?: 'es' | 'en' | 'fr';
}
\`\`\`

## Personalización

### Colores

\`\`\`javascript
ChatBotDysa.init({
  primaryColor: '#7C3AED',    // Púrpura (default)
  // o
  primaryColor: '#10B981',    // Verde
  // o
  primaryColor: '#3B82F6'     // Azul
});
\`\`\`

### Posición

\`\`\`javascript
ChatBotDysa.init({
  position: 'bottom-right'  // Default
  // Opciones: bottom-right, bottom-left, top-right, top-left
});
\`\`\`

## API del Widget

### Métodos

\`\`\`javascript
// Abrir el chat
ChatBotDysa.open();

// Cerrar el chat
ChatBotDysa.close();

// Toggle
ChatBotDysa.toggle();

// Enviar mensaje programáticamente
ChatBotDysa.sendMessage('Hola');

// Escuchar eventos
ChatBotDysa.on('message', (message) => {
  console.log('Nuevo mensaje:', message);
});

ChatBotDysa.on('open', () => {
  console.log('Widget abierto');
});

ChatBotDysa.on('close', () => {
  console.log('Widget cerrado');
});
\`\`\`

## Ejemplo Completo

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Restaurante</title>
</head>
<body>
  <h1>Bienvenido a Mi Restaurante</h1>

  <!-- Tu contenido aquí -->

  <!-- ChatBotDysa Widget -->
  <script src="https://cdn.chatbotdysa.com/widget/v1/chatbot-widget.js"></script>
  <script>
    ChatBotDysa.init({
      apiUrl: 'https://api.mirestaurante.com',
      restaurantId: 'rest_123456',
      primaryColor: '#7C3AED',
      position: 'bottom-right',
      welcomeMessage: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?',
      autoOpen: false,
      showBranding: true,
      language: 'es'
    });

    // Evento: cuando el usuario envía un mensaje
    ChatBotDysa.on('message', function(message) {
      console.log('Usuario dijo:', message.content);
    });
  </script>
</body>
</html>
\`\`\`
\`\`\`

---

**Próximas Fases:**
- Fase 5: Integraciones (WhatsApp, SendGrid, Pagos)
- Fase 6: Producción (Secrets, SSL, Testing)
- Fase 7: Documentación Final

---

**Progreso Actual:**
- ✅ Fase 1 Completada: Limpieza de código
- 🟡 Fase 2 En Progreso: Sistema de órdenes
- ⏳ Fases 3-7 Pendientes

**Próximos Pasos:**
1. Completar formulario de creación de órdenes
2. Implementar flujo de estados
3. Crear componente MenuItemSelector
4. Testing del sistema de órdenes

---

**ChatBotDysa** - Plan de Completación
Version 1.0 | Actualizado: 22 Oct 2025 - 9:45 PM
