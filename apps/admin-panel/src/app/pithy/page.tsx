"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Brain,
  TrendingUp,
  MessageSquare,
  Clock,
  Target,
  Zap,
  BarChart3,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Send,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { apiService } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

interface PithyStats {
  totalExperiences: number;
  averageSentiment: number;
  averageComplexity: number;
  averageReward: number;
  uniqueIntents: string[];
  qTableSize: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  complexityDistribution: Record<string, number>;
  intentDistribution: Record<string, number>;
  hourlyDistribution: Record<string, number>;
  successRate: number;
}

interface AnalysisResult {
  wordCount: number;
  sentiment: number;
  complexity: number;
  keywords: string[];
  intent: string;
  contextCategory: string;
  communicationStyle: string;
  usesEmojis: boolean;
  messageLength: string;
  politenessLevel: string;
  language: string;
}

export default function PithyPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PithyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzeText, setAnalyzeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.pithy.getStats();
      // Transform API response to match expected interface
      const apiData = response.data;
      const learning = apiData.learning || {};

      const transformedStats: PithyStats = {
        totalExperiences: learning.totalExperiences || 0,
        averageSentiment: learning.averageSentiment || 0,
        averageComplexity: learning.averageComplexity || 5,
        averageReward: learning.averageReward || 0,
        uniqueIntents: learning.uniqueIntents || [],
        qTableSize: learning.qTableSize || 0,
        successRate: learning.successRate || 0,
        sentimentDistribution: learning.sentimentDistribution || { positive: 0, negative: 0, neutral: 0 },
        complexityDistribution: learning.complexityDistribution || {},
        intentDistribution: learning.intentDistribution || {},
        hourlyDistribution: learning.hourlyDistribution || {},
      };

      setStats(transformedStats);
    } catch (error) {
      console.error('Error fetching Pithy stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAnalyze = async () => {
    if (!analyzeText.trim()) return;

    try {
      setAnalyzing(true);
      const response = await apiService.pithy.analyzeMessage(analyzeText);
      // API returns data inside features object
      const apiData = response.data?.features || response.data || {};
      const transformedResult: AnalysisResult = {
        wordCount: apiData.wordCount ?? 0,
        sentiment: apiData.sentiment ?? 0,
        complexity: apiData.complexity ?? 5,
        keywords: apiData.keywords ?? [],
        intent: apiData.intent ?? 'unknown',
        contextCategory: apiData.contextCategory ?? 'general',
        communicationStyle: apiData.communicationStyle ?? 'neutral',
        usesEmojis: apiData.usesEmojis ?? false,
        messageLength: apiData.messageLength ?? 'short',
        politenessLevel: apiData.politenessLevel ?? 'neutral',
        language: apiData.language ?? 'es',
      };
      setAnalysisResult(transformedResult);
    } catch (error) {
      console.error('Error analyzing message:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper function to translate analysis values
  const translateValue = (category: string, value: string): string => {
    const key = `pithy.${category}.${value}`;
    const translated = t(key);
    // If translation key not found (returns the key), show original value capitalized
    return translated === key ? value.charAt(0).toUpperCase() + value.slice(1) : translated;
  };

  // Colors for charts
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  // Prepare sentiment data for pie chart
  const sentimentData = stats ? [
    { name: t('pithy.sentiment.positive'), value: stats.sentimentDistribution.positive, color: '#10B981' },
    { name: t('pithy.sentiment.neutral'), value: stats.sentimentDistribution.neutral, color: '#F59E0B' },
    { name: t('pithy.sentiment.negative'), value: stats.sentimentDistribution.negative, color: '#EF4444' },
  ] : [];

  // Prepare intent data for bar chart
  const intentData = stats ? Object.entries(stats.intentDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })).slice(0, 6) : [];

  // Prepare hourly data for area chart
  const hourlyData = stats ? Object.entries(stats.hourlyDistribution).map(([hour, count]) => ({
    hour: `${hour}:00`,
    conversaciones: count
  })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour)) : [];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Sparkles className="h-12 w-12 animate-pulse mx-auto mb-4 text-purple-500" />
            <p>{t('pithy.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            {t('pithy.title')}
          </h1>
          <p className="text-muted-foreground">{t('pithy.subtitle')}</p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pithy.stats.totalExperiences')}
            </CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalExperiences || 0}</div>
            <p className="text-xs text-muted-foreground">
              Interacciones aprendidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pithy.stats.averageSentiment')}
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageSentiment !== undefined
                ? (stats.averageSentiment > 0 ? '+' : '') + stats.averageSentiment.toFixed(2)
                : '0.00'}
            </div>
            <Progress
              value={stats ? (stats.averageSentiment + 1) * 50 : 50}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pithy.stats.qTableSize')}
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.qTableSize || 0}</div>
            <p className="text-xs text-muted-foreground">
              Estados aprendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pithy.stats.successRate')}
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.successRate !== undefined ? `${(stats.successRate * 100).toFixed(1)}%` : '0%'}
            </div>
            <Progress
              value={stats ? stats.successRate * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analyze">Analizar Mensaje</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Distribución de Sentimiento
                </CardTitle>
                <CardDescription>Análisis emocional de las conversaciones</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && stats.totalExperiences > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                    <p>{t('pithy.noData')}</p>
                    <p className="text-sm">{t('pithy.startLearning')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Intent Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Intenciones Detectadas
                </CardTitle>
                <CardDescription>Qué buscan los clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {intentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={intentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                    <Target className="h-12 w-12 mb-2 opacity-50" />
                    <p>{t('pithy.noData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hourly Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Actividad por Hora
                </CardTitle>
                <CardDescription>Cuándo interactúan más los clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {hourlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="conversaciones"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                    <Clock className="h-12 w-12 mb-2 opacity-50" />
                    <p>{t('pithy.noData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Unique Intents */}
          {stats && stats.uniqueIntents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('pithy.stats.uniqueIntents')}</CardTitle>
                <CardDescription>Categorías de intención aprendidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.uniqueIntents.map((intent, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {intent}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {t('pithy.analyze.title')}
              </CardTitle>
              <CardDescription>
                Prueba cómo Pithy analiza un mensaje de cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('pithy.analyze.placeholder')}
                  value={analyzeText}
                  onChange={(e) => setAnalyzeText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <Button onClick={handleAnalyze} disabled={analyzing || !analyzeText.trim()}>
                  {analyzing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t('pithy.analyze.button')}
                    </>
                  )}
                </Button>
              </div>

              {analysisResult && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                  <h4 className="font-semibold">{t('pithy.analyze.results')}</h4>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Intención</p>
                      <Badge variant="default">{translateValue('intents', analysisResult.intent)}</Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Estilo de Comunicación</p>
                      <Badge variant="outline">{translateValue('communication', analysisResult.communicationStyle)}</Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nivel de Cortesía</p>
                      <Badge variant="outline">{translateValue('politeness', analysisResult.politenessLevel)}</Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Sentimiento</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(analysisResult.sentiment + 1) * 50}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {analysisResult.sentiment > 0 ? '+' : ''}{analysisResult.sentiment.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Complejidad</p>
                      <div className="flex items-center gap-2">
                        <Progress value={analysisResult.complexity * 10} className="flex-1" />
                        <span className="text-sm font-medium">{analysisResult.complexity}/10</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Idioma</p>
                      <Badge variant="secondary">{translateValue('languages', analysisResult.language)}</Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Palabras Clave</p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Palabras: <strong>{analysisResult.wordCount}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Longitud: <strong>{translateValue('messageLength', analysisResult.messageLength)}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Emojis: <strong>{analysisResult.usesEmojis ? 'Sí' : 'No'}</strong>
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Example Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Mensajes de Ejemplo</CardTitle>
              <CardDescription>Prueba con estos mensajes para ver cómo funciona el análisis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {[
                  "Hola! Me gustaría hacer una reserva para 4 personas mañana a las 8pm 😊",
                  "Buenas tardes, ¿podrían informarme sobre el menú vegetariano?",
                  "quiero pedir una pizza grande con extra queso",
                  "Estimados, solicito información sobre eventos corporativos",
                  "oye tienen delivery? cuanto demora?",
                  "Excelente servicio! La comida estuvo deliciosa, muchas gracias"
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-2 text-left"
                    onClick={() => {
                      setAnalyzeText(example);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{example}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Q-Learning Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  {t('pithy.qlearning.title')}
                </CardTitle>
                <CardDescription>Parámetros del algoritmo de aprendizaje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('pithy.qlearning.explorationRate')}</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <Progress value={10} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('pithy.qlearning.learningRate')}</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <Progress value={10} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('pithy.qlearning.discountFactor')}</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <Progress value={95} />
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('pithy.stats.learningProgress')}
                </CardTitle>
                <CardDescription>Progreso del sistema de aprendizaje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4">
                  <div className="text-5xl font-bold text-purple-500 mb-2">
                    {stats?.totalExperiences || 0}
                  </div>
                  <p className="text-muted-foreground">experiencias recolectadas</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {stats?.uniqueIntents?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">intenciones</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {stats?.qTableSize || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">estados Q</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Cómo mejorar el aprendizaje</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                  <span>Cuantas más conversaciones tenga el bot, mejor aprenderá los patrones de tus clientes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                  <span>El bot detecta automáticamente el estilo de comunicación de cada cliente y se adapta.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                  <span>El sistema Q-Learning optimiza las respuestas basándose en el feedback implícito.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                  <span>Los insights se actualizan en tiempo real con cada nueva conversación.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
