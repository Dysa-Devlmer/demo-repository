'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, X, Zap, ArrowLeft, Sparkles, Crown, Rocket } from 'lucide-react'
import { motion } from 'framer-motion'
import { trackSelectPlan } from '@/lib/analytics'

const planes = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49990,
    icon: Zap,
    color: 'from-green-600 to-emerald-600',
    popular: false,
    description: 'Perfecto para restaurantes pequeños que inician',
    features: [
      { text: 'Hasta 500 conversaciones/mes', included: true },
      { text: 'WhatsApp Business integrado', included: true },
      { text: 'Respuestas automáticas IA', included: true },
      { text: 'Panel de administración básico', included: true },
      { text: 'Menú digital simple', included: true },
      { text: 'Soporte por email', included: true },
      { text: 'Análisis de conversaciones', included: false },
      { text: 'Reservas automáticas', included: false },
      { text: 'Integraciones avanzadas', included: false },
      { text: 'Soporte prioritario 24/7', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99990,
    icon: Sparkles,
    color: 'from-blue-600 to-purple-600',
    popular: true,
    description: 'La opción más popular para restaurantes en crecimiento',
    features: [
      { text: 'Hasta 2,000 conversaciones/mes', included: true },
      { text: 'WhatsApp + Web Widget', included: true },
      { text: 'IA avanzada con aprendizaje', included: true },
      { text: 'Panel completo con analytics', included: true },
      { text: 'Menú digital avanzado', included: true },
      { text: 'Gestión de reservas automáticas', included: true },
      { text: 'Análisis detallado de métricas', included: true },
      { text: 'Integración con sistemas POS', included: true },
      { text: 'Soporte prioritario', included: true },
      { text: 'API personalizada', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199990,
    icon: Crown,
    color: 'from-purple-600 to-pink-600',
    popular: false,
    description: 'Solución completa para cadenas y grandes restaurantes',
    features: [
      { text: 'Conversaciones ilimitadas', included: true },
      { text: 'Todos los canales (WhatsApp, Web, Telegram)', included: true },
      { text: 'IA personalizada y entrenada', included: true },
      { text: 'Panel Enterprise con BI avanzado', included: true },
      { text: 'Multi-restaurante y multi-tenant', included: true },
      { text: 'Sistema completo de reservas', included: true },
      { text: 'Análisis predictivo con ML', included: true },
      { text: 'Integraciones ilimitadas', included: true },
      { text: 'Soporte 24/7 + Account Manager', included: true },
      { text: 'API completa + Webhooks', included: true },
    ],
  },
]

const billingOptions = [
  { id: 'monthly', label: 'Mensual', discount: 0 },
  { id: 'quarterly', label: 'Trimestral', discount: 10 },
  { id: 'annual', label: 'Anual', discount: 20 },
]

export default function PlanesPage() {
  const [billing, setBilling] = useState('monthly')

  const calculatePrice = (basePrice: number) => {
    const option = billingOptions.find((o) => o.id === billing)
    const discount = option?.discount || 0
    return Math.round(basePrice * (1 - discount / 100))
  }

  const handleSelectPlan = (planName: string, price: number) => {
    trackSelectPlan(planName, price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">CB</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChatBotDysa
              </span>
            </Link>

            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Planes y Precios
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan perfecto para tu restaurante. Sin permanencia, cancela cuando quieras.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-white rounded-full p-1 shadow-lg border border-gray-200">
            {billingOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setBilling(option.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billing === option.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
                {option.discount > 0 && (
                  <span className="ml-2 text-xs">(-{option.discount}%)</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {planes.map((plan, index) => {
            const Icon = plan.icon
            const finalPrice = calculatePrice(plan.price)

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all hover:scale-105 ${
                  plan.popular
                    ? 'border-blue-600 ring-4 ring-blue-100'
                    : 'border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      ⭐ Más Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        ${finalPrice.toLocaleString('es-CL')}
                      </span>
                      <span className="text-gray-600 ml-2">/mes</span>
                    </div>
                    {billing !== 'monthly' && (
                      <p className="text-sm text-green-600 mt-1">
                        Ahorras ${(plan.price - finalPrice).toLocaleString('es-CL')} al mes
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link href={`/registro?plan=${plan.id}`}>
                    <Button
                      onClick={() => handleSelectPlan(plan.name, finalPrice)}
                      className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all mb-6`}
                    >
                      {plan.popular ? 'Comenzar Ahora' : 'Seleccionar Plan'}
                    </Button>
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-gray-600">
                Sí, puedes cambiar tu plan cuando quieras. Los cambios se aplican inmediatamente.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-2">¿Hay contratos o permanencia?</h3>
              <p className="text-gray-600">
                No, todos nuestros planes son sin permanencia. Cancela cuando quieras.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-2">¿Qué pasa si supero el límite de conversaciones?</h3>
              <p className="text-gray-600">
                Te notificaremos cuando estés cerca del límite. Puedes actualizar tu plan o comprar paquetes adicionales.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <Rocket className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              ¿No sabes cuál elegir?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Agenda una demo gratuita y te ayudamos a encontrar el plan perfecto
            </p>
            <Link href="/demo">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Solicitar Demo Gratuita
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2025 ChatBotDysa Enterprise+++++. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
