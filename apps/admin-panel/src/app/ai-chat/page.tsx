"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bot,
  Send,
  User,
  Brain,
  Settings,
  Trash2,
  MessageSquare,
  Sparkles,
  Download,
  Copy
} from "lucide-react";
import { apiService } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import useDemoMode from '@/hooks/useDemoMode';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export default function AIChatPage() {
  const { t, isLoading: translationsLoading } = useTranslation();
  const { demoData } = useDemoMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama3:8b");
  const [systemPrompt, setSystemPrompt] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Only initialize when translations are loaded
    if (translationsLoading) return;

    // Initialize system prompt
    setSystemPrompt(t('aiChat.defaultSystemPrompt'));

    // Initialize with a welcome message
    setMessages([
      {
        id: '1',
        role: 'system',
        content: t('aiChat.systemReady'),
        timestamp: new Date(),
        model: selectedModel
      },
      {
        id: '2',
        role: 'assistant',
        content: t('aiChat.welcomeMessage'),
        timestamp: new Date(),
        model: selectedModel
      }
    ]);

    // Ollama models available
    setAvailableModels([
      {
        id: 'llama3:8b',
        name: 'Llama 3 8B',
        description: 'Modelo balanceado para tareas generales (por defecto)',
        available: true
      },
      {
        id: 'phi3:mini',
        name: 'Phi-3 Mini',
        description: 'Modelo rápido y eficiente',
        available: true
      },
      {
        id: 'mistral:7b',
        name: 'Mistral 7B',
        description: 'Excelente para conversaciones naturales',
        available: true
      },
      {
        id: 'gemma:7b',
        name: 'Gemma 7B',
        description: 'Modelo de Google para tareas variadas',
        available: true
      }
    ]);
  }, [translationsLoading]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      model: selectedModel
    };

    setMessages(prev => [...prev, userMessage]);
    const userMessageContent = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call real backend Ollama endpoint
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
      const token = localStorage.getItem('auth_token');

      // Create or get conversation ID for this AI chat session
      const conversationId = localStorage.getItem('ai_chat_conversation_id');

      let finalConversationId = conversationId;

      // If no conversation exists, create one
      if (!finalConversationId) {
        const createResponse = await fetch(`${API_URL}/api/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            customer_phone: '+56900000000',
            platform: 'admin_ai_chat',
            status: 'active'
          })
        });

        if (createResponse.ok) {
          const createResult = await createResponse.json();
          finalConversationId = createResult.data?.id;
          if (finalConversationId) {
            localStorage.setItem('ai_chat_conversation_id', finalConversationId.toString());
          }
        }
      }

      if (!finalConversationId) {
        throw new Error('No se pudo crear la conversación');
      }

      // Send message to Ollama via backend
      const response = await fetch(`${API_URL}/api/conversations/${finalConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessageContent,
          sender: 'customer'
        })
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con Ollama');
      }

      const result = await response.json();
      const aiResponse = result.data?.ai_response || result.data?.content || 'Sin respuesta';

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        model: result.data?.model || selectedModel
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback to mock response if backend fails
      try {
        const aiResponse = await mockAIResponse(userMessageContent, selectedModel);
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          model: selectedModel + ' (fallback)'
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (fallbackError) {
        toast({
          title: t('common.error'),
          description: t('aiChat.errorSendingMessage'),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const mockAIResponse = async (message: string, model: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Get real restaurant data
    const menuItems = demoData.menu || [];
    const orders = demoData.orders || [];
    const customers = demoData.customers || [];
    const totalMenuItems = menuItems.length;
    const availableItems = menuItems.filter(item => item.available).length;
    const avgPrice = menuItems.length > 0
      ? (menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length / 100).toFixed(0)
      : '0';
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Mock responses based on message content
    const lowerMessage = message.toLowerCase();

    // SPECIFIC QUESTIONS - Handle precise queries
    // Check for "most expensive" queries
    if ((lowerMessage.includes('más caro') || lowerMessage.includes('mas caro') || lowerMessage.includes('mayor precio')) &&
        (lowerMessage.includes('plat') || lowerMessage.includes('cart') || lowerMessage.includes('menu'))) {
      const mostExpensive = menuItems.reduce((max, item) => item.price > max.price ? item : max, menuItems[0]);
      return `El platillo más caro de tu carta es:

🍽️ **${mostExpensive?.name}**
💰 Precio: $${(mostExpensive?.price / 100).toLocaleString('es-CL')}
📁 Categoría: ${mostExpensive?.category}
${mostExpensive?.available ? '✅ Disponible' : '❌ No disponible'}

${mostExpensive?.description || 'Sin descripción disponible'}

💡 **Análisis:**
- Es ${Math.round((mostExpensive?.price / parseFloat(avgPrice) / 100) * 100)}% más caro que el precio promedio del menú ($${avgPrice})
- Representa un producto premium en tu oferta`;
    }

    // Check for "cheapest" queries
    if ((lowerMessage.includes('más barato') || lowerMessage.includes('mas barato') || lowerMessage.includes('menor precio') || lowerMessage.includes('económico')) &&
        (lowerMessage.includes('plat') || lowerMessage.includes('cart') || lowerMessage.includes('menu'))) {
      const cheapest = menuItems.reduce((min, item) => item.price < min.price ? item : min, menuItems[0]);
      return `El platillo más económico de tu carta es:

🍽️ **${cheapest?.name}**
💰 Precio: $${(cheapest?.price / 100).toLocaleString('es-CL')}
📁 Categoría: ${cheapest?.category}
${cheapest?.available ? '✅ Disponible' : '❌ No disponible'}

${cheapest?.description || 'Sin descripción disponible'}

💡 **Análisis:**
- Perfecto como entrada o plato accesible
- Puede ser un gancho para atraer clientes sensibles al precio`;
    }

    // Check for "sort by price" queries
    if ((lowerMessage.includes('orden') || lowerMessage.includes('lista')) &&
        (lowerMessage.includes('precio') || lowerMessage.includes('barato') || lowerMessage.includes('caro'))) {
      const sortedItems = [...menuItems].sort((a, b) => a.price - b.price);
      return `📊 **Menú ordenado por precio (de menor a mayor):**

${sortedItems.map((item, i) => `${i+1}. ${item.name} - $${(item.price/100).toLocaleString('es-CL')} ${item.available ? '✅' : '❌'}`).join('\n')}

💡 **Análisis de precios:**
- Rango de precios: $${(sortedItems[0]?.price/100).toLocaleString('es-CL')} - $${(sortedItems[sortedItems.length-1]?.price/100).toLocaleString('es-CL')}
- Precio promedio: $${avgPrice}
- Productos accesibles (<$${avgPrice}): ${sortedItems.filter(i => i.price < parseFloat(avgPrice)*100).length}
- Productos premium (>$${avgPrice}): ${sortedItems.filter(i => i.price > parseFloat(avgPrice)*100).length}`;
    }

    // Handle "cuántos" - COUNT ONLY, no list
    if (lowerMessage.includes('cuántos') || lowerMessage.includes('cuantos')) {
      if (lowerMessage.includes('plat') || lowerMessage.includes('menu')) {
        return `Tienes ${totalMenuItems} platillos en total. ${availableItems} están disponibles y ${totalMenuItems - availableItems} no disponibles.`;
      }
      if (lowerMessage.includes('pedido') || lowerMessage.includes('orden')) {
        return `Hay ${orders.length} pedidos registrados en total. ${orders.filter(o => o.status === 'pending').length} están pendientes.`;
      }
      if (lowerMessage.includes('cliente')) {
        return `Tienes ${customers.length} clientes registrados. ${customers.filter(c => c.status === 'active').length} están activos.`;
      }
    }

    // Handle "lista" or "listar" - SHOW LIST
    if (lowerMessage.includes('lista') || lowerMessage.includes('listar') || lowerMessage.includes('muestra') || lowerMessage.includes('cuáles') || lowerMessage.includes('cuales')) {
      if (lowerMessage.includes('plat') || lowerMessage.includes('menu')) {
        return `Lista de platillos (${totalMenuItems} total):\n\n${menuItems.slice(0, 10).map((item, i) => `${i+1}. ${item.name} - $${(item.price/100).toLocaleString('es-CL')} ${item.available ? '✅' : '❌'}`).join('\n')}${totalMenuItems > 10 ? `\n\n... y ${totalMenuItems - 10} más` : ''}`;
      }
    }

    // Handle analysis
    if (lowerMessage.includes('análisis') || lowerMessage.includes('analisis')) {
      return `Tu restaurante tiene ${totalMenuItems} platillos, ${orders.length} pedidos (${orders.filter(o => o.status === 'pending').length} pendientes) y ${customers.length} clientes registrados. Ingresos totales: $${(totalRevenue / 100).toLocaleString('es-CL')}.`;
    }

    // Handle menu questions
    if (lowerMessage.includes('menú') || lowerMessage.includes('menu') || lowerMessage.includes('plat')) {
      return `Tienes ${totalMenuItems} platillos en el menú. Precio promedio: $${avgPrice}. ${availableItems} están disponibles actualmente.`;
    }

    if (lowerMessage.includes('cliente') || lowerMessage.includes('customer')) {
      return `Tienes ${customers.length} clientes registrados. ${customers.filter(c => c.status === 'active').length} están activos.`;
    }

    if (lowerMessage.includes('marketing') || lowerMessage.includes('promocion')) {
      return `Puedo ayudarte con estrategias de marketing. ¿Te gustaría promocionar algún platillo específico o crear una oferta especial?`;
    }

    if (lowerMessage.includes('pedido') || lowerMessage.includes('orden')) {
      return `Hay ${orders.length} pedidos en total. ${orders.filter(o => o.status === 'pending').length} están pendientes de atención.`;
    }

    // Default fallback - SIMPLE
    return `Entiendo que preguntas sobre "${message}". Como asistente del restaurante, puedo ayudarte con:
- Información del menú (pregunta "cuántos platillos" o "lista platillos")
- Estado de pedidos
- Datos de clientes
- Análisis de ventas

¿En qué puedo ayudarte específicamente?`;
  };

  const clearChat = () => {
    if (translationsLoading) return;

    // Reset conversation ID to create a new one
    localStorage.removeItem('ai_chat_conversation_id');

    setMessages([
      {
        id: '1',
        role: 'system',
        content: t('aiChat.chatRestarted'),
        timestamp: new Date(),
        model: selectedModel
      }
    ]);
    toast({
      title: "Chat reiniciado",
      description: t('aiChat.chatRestarted'),
    });
  };

  const exportChat = () => {
    const chatData = {
      messages: messages,
      model: selectedModel,
      exportDate: new Date().toISOString(),
      systemPrompt: systemPrompt
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `ai-chat-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: t('aiChat.copied'),
      description: t('aiChat.messageCopied'),
    });
  };

  const suggestedQuestions = [
    t('aiChat.analyzePerformance'),
    t('aiChat.promoteDishes'),
    t('aiChat.marketingSuggestions'),
    t('aiChat.improveCustomerSatisfaction'),
    t('aiChat.analyzeOrderTrends'),
    t('aiChat.optimizeMenu')
  ];

  return (
    <MainLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{t('aiChat.title')}</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('aiChat.selectModel')} />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id} disabled={!model.available}>
                  <div className="flex items-center space-x-2">
                    <span>{model.name}</span>
                    {!model.available && <Badge variant="secondary">{t('aiChat.notAvailable')}</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportChat}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={clearChat}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Chat Area */}
        <div className="md:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>{t('aiChat.chatWithAi')}</span>
                <Badge variant="outline">{availableModels.find(m => m.id === selectedModel)?.name}</Badge>
              </CardTitle>
              <CardDescription>
                {t('aiChat.getInsights')}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' ? 'bg-dysa-purple text-white' :
                        message.role === 'assistant' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> :
                         message.role === 'assistant' ? <Bot className="h-4 w-4" /> :
                         <Settings className="h-4 w-4" />}
                      </div>
                      <div className={`flex-1 space-y-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                          message.role === 'user' ? 'bg-dysa-purple text-white' :
                          message.role === 'assistant' ? 'bg-gray-100 text-gray-900' :
                          'bg-yellow-50 text-yellow-800 text-sm'
                        }`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 animate-pulse" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="mt-4 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder={t('aiChat.typeMessage')}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!inputMessage.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('aiChat.pressEnter')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('aiChat.systemPrompt')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={t('aiChat.configurePrompt')}
                className="min-h-[100px] text-xs"
              />
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>{t('aiChat.suggestedQuestions')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left text-xs h-auto p-2 justify-start"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('aiChat.modelInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              {availableModels.find(m => m.id === selectedModel) && (
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-sm">
                      {availableModels.find(m => m.id === selectedModel)?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {availableModels.find(m => m.id === selectedModel)?.description}
                    </div>
                  </div>
                  <Badge variant={availableModels.find(m => m.id === selectedModel)?.available ? "default" : "secondary"}>
                    {availableModels.find(m => m.id === selectedModel)?.available ? t('aiChat.available') : t('aiChat.notAvailable')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}