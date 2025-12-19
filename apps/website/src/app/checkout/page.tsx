'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Shield, Clock, Building2, Server, Check, X, ArrowRight, Star } from 'lucide-react'
import { trackBeginCheckout, trackSelectPlan, trackClick } from '@/lib/analytics'

interface TrialStats {
  conversations: number
  orders: number
  revenue: number
  hoursSaved: number
}

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  tagline: string
  price: number
  originalPrice?: number
  discountLabel?: string
  period: string
  icon: any
  recommended?: boolean
  features: PlanFeature[]
  bonuses?: string[]
  cta: string
  ctaAction: 'activate' | 'contact' | 'demo'
}

export default function CheckoutPage() {
  const [trialStats, setTrialStats] = useState<TrialStats>({
    conversations: 127,
    orders: 34,
    revenue: 456000,
    hoursSaved: 89
  })

  const [selectedPlan, setSelectedPlan] = useState<string>('saas-multi')
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35
  })

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 }
        } else if (prev.hours > 0) {
          return { days: prev.days, hours: prev.hours - 1, minutes: 59 }
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59 }
        }
        return prev
      })
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const plans = useMemo<Plan[]>(() => ([
    {
      id: 'saas-multi',
      name: 'SaaS Multi-Tenant',
      tagline: 'Perfecto para empezar',
      price: 49995,
      originalPrice: 99990,
      discountLabel: '50% OFF primer mes',
      period: '/mes',
      icon: Zap,
      recommended: true,
      features: [
        { text: 'Activa HOY en 2 minutos', included: true },
        { text: 'Cero instalación física', included: true },
        { text: 'Chatbot con IA ilimitado', included: true },
        { text: 'WhatsApp Business integrado', included: true },
        { text: 'Panel de administración', included: true },
        { text: 'Gestión de menú digital', included: true },
        { text: 'Sistema de pedidos y reservas', included: true },
        { text: 'Soporte 24/7 por email/chat', included: true },
        { text: 'Backup diario automático', included: true },
        { text: 'SSL y dominio incluidos', included: true },
        { text: 'Actualizaciones automáticas', included: true },
        { text: 'Cancela cuando quieras', included: true },
        { text: 'Servidor dedicado', included: false },
        { text: 'Soporte telefónico', included: false },
        { text: 'SLA 99.9%', included: false }
      ],
      bonuses: [
        'Setup WhatsApp Business gratis ($50,000 valor)',
        'Capacitación 1:1 de 2 horas ($80,000 valor)',
        'Templates de menú personalizados',
        'Soporte prioritario primer mes'
      ],
      cta: 'Activar Ahora',
      ctaAction: 'activate'
    },
    {
      id: 'saas-dedicated',
      name: 'SaaS Dedicado',
      tagline: 'Mayor rendimiento',
      price: 199990,
      period: '/mes',
      icon: Server,
      features: [
        { text: 'Todo lo de Multi-Tenant', included: true },
        { text: 'Servidor dedicado privado', included: true },
        { text: 'IP dedicada exclusiva', included: true },
        { text: '3x más rendimiento', included: true },
        { text: 'Datos aislados 100%', included: true },
        { text: 'Backup cada 6 horas', included: true },
        { text: 'Soporte prioritario 24/7', included: true },
        { text: 'Soporte telefónico + WhatsApp', included: true },
        { text: 'SLA 99.9% uptime', included: true },
        { text: 'Configuración personalizada', included: true },
        { text: 'Setup en 24 horas', included: true },
        { text: 'Recursos escalables', included: true },
        { text: 'Instalación on-premise', included: false },
        { text: 'Código fuente accesible', included: false }
      ],
      cta: 'Contactar Ventas',
      ctaAction: 'contact'
    },
    {
      id: 'on-premise',
      name: 'On-Premise',
      tagline: 'Control total',
      price: 2500000,
      period: ' setup + $49,990/mes',
      icon: Building2,
      features: [
        { text: 'Todo lo de SaaS Dedicado', included: true },
        { text: 'Instalación en TU servidor', included: true },
        { text: '100% control de datos', included: true },
        { text: 'Sin límites de personalización', included: true },
        { text: 'Código fuente accesible', included: true },
        { text: 'Ingeniero dedicado asignado', included: true },
        { text: 'Instalación presencial incluida', included: true },
        { text: 'Capacitación in-situ completa', included: true },
        { text: 'Integración con sistemas legacy', included: true },
        { text: 'SLA 99.99% uptime', included: true },
        { text: 'Sin costos de hosting mensuales', included: true },
        { text: 'Setup en 1-2 semanas', included: true },
        { text: 'Soporte 24/7 incluido', included: true },
        { text: 'Actualizaciones incluidas 1 año', included: true }
      ],
      cta: 'Agendar Demo',
      ctaAction: 'demo'
    }
  ]), [])

  // Track begin checkout on page load
  useEffect(() => {
    const plan = plans.find(p => p.id === selectedPlan)
    if (plan) {
      trackBeginCheckout(selectedPlan as any, plan.price)
    }
  }, [plans, selectedPlan])

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)

    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    // Track plan selection
    trackSelectPlan(planId as any, plan.price)
    trackClick(`select_plan_${planId}`, 'button')

    switch (plan.ctaAction) {
      case 'activate':
        // Redirect to payment
        window.location.href = '/checkout/payment?plan=saas-multi'
        break
      case 'contact':
        // Open contact form or redirect to Calendly
        trackClick('contact_sales_calendly', 'link')
        window.location.href = 'https://calendly.com/chatbotdysa/ventas'
        break
      case 'demo':
        // Open demo booking
        trackClick('demo_onpremise_calendly', 'link')
        window.location.href = 'https://calendly.com/chatbotdysa/demo-onpremise'
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header con urgencia */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">
                Tu trial termina en: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Zap className="w-5 h-5" />
              <span className="font-bold">
                🎁 Oferta especial: 50% OFF primer mes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Trial Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ¡Tu prueba fue exitosa! 🎉
            </h1>
            <p className="text-xl text-gray-300">
              En 15 días con ChatBotDysa lograste resultados increíbles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="text-4xl mb-2">💬</div>
              <div className="text-3xl font-bold text-white mb-1">
                {trialStats.conversations}
              </div>
              <div className="text-gray-300">Conversaciones automatizadas</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="text-4xl mb-2">🍕</div>
              <div className="text-3xl font-bold text-white mb-1">
                {trialStats.orders}
              </div>
              <div className="text-gray-300">Pedidos procesados</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="text-4xl mb-2">💰</div>
              <div className="text-3xl font-bold text-white mb-1">
                ${(trialStats.revenue / 1000).toFixed(0)}K
              </div>
              <div className="text-gray-300">En ventas gestionadas</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="text-4xl mb-2">⏰</div>
              <div className="text-3xl font-bold text-white mb-1">
                {trialStats.hoursSaved}h
              </div>
              <div className="text-gray-300">Horas ahorradas</div>
            </motion.div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-center">
            <p className="text-white text-xl font-semibold">
              💵 Ahorro estimado vs contratar mesero: <span className="text-2xl font-bold">$560,000/mes</span>
            </p>
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Elige el plan perfecto para tu restaurante
          </h2>
          <p className="text-gray-300 text-center mb-12">
            Sin contratos, sin permanencia. Cancela cuando quieras.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 border-2 ${
                  plan.recommended
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
                    : 'border-white/10'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <Star className="w-4 h-4 fill-current" />
                      RECOMENDADO PARA TI
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <plan.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400">{plan.tagline}</p>
                </div>

                <div className="mb-6">
                  {plan.originalPrice && (
                    <div className="text-gray-400 line-through text-lg mb-1">
                      ${plan.originalPrice.toLocaleString('es-CL')}
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-white">
                      ${(plan.price / 1000).toFixed(0)}K
                    </span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  {plan.discountLabel && (
                    <div className="mt-2 inline-block bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                      🎁 {plan.discountLabel}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.slice(0, 8).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.bonuses && (
                  <div className="mb-6 p-4 bg-purple-600/10 rounded-xl border border-purple-500/20">
                    <div className="font-semibold text-purple-300 mb-2">
                      🎁 Bonos incluidos:
                    </div>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {plan.bonuses.map((bonus, idx) => (
                        <li key={idx}>✅ {bonus}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105'
                      : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-5 h-5" />
                </button>

                {plan.id === 'saas-multi' && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">
                      💬 &ldquo;Perfecto para empezar. Lo activé y seguí trabajando el mismo día.&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 mt-1">- Giuseppe, Don Luigi</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-white font-semibold mb-1">Pago 100% seguro</div>
            <div className="text-sm text-gray-400">Certificado SSL</div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-semibold mb-1">Cancela cuando quieras</div>
            <div className="text-sm text-gray-400">Sin permanencia</div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <span className="text-3xl mb-2 block">💰</span>
            <div className="text-white font-semibold mb-1">Garantía 30 días</div>
            <div className="text-sm text-gray-400">Devolución completa</div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2 fill-current" />
            <div className="text-white font-semibold mb-1">+50 restaurantes</div>
            <div className="text-sm text-gray-400">4.8/5 estrellas</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Preguntas Frecuentes
          </h3>
          <div className="space-y-4">
            <details className="bg-white/5 rounded-xl p-4">
              <summary className="text-white font-semibold cursor-pointer">
                ¿Qué pasa con mis datos del trial?
              </summary>
              <p className="text-gray-300 mt-2">
                Se migran automáticamente. No pierdes nada. Sigues exactamente donde lo dejaste.
              </p>
            </details>

            <details className="bg-white/5 rounded-xl p-4">
              <summary className="text-white font-semibold cursor-pointer">
                ¿Puedo cambiar de plan después?
              </summary>
              <p className="text-gray-300 mt-2">
                Sí, en cualquier momento. Puedes subir o bajar de plan según tus necesidades.
              </p>
            </details>

            <details className="bg-white/5 rounded-xl p-4">
              <summary className="text-white font-semibold cursor-pointer">
                ¿Hay contrato de permanencia?
              </summary>
              <p className="text-gray-300 mt-2">
                No. Es mes a mes. Cancelas cuando quieras sin penalización.
              </p>
            </details>

            <details className="bg-white/5 rounded-xl p-4">
              <summary className="text-white font-semibold cursor-pointer">
                ¿Qué métodos de pago aceptan?
              </summary>
              <p className="text-gray-300 mt-2">
                Tarjeta de crédito/débito, transferencia bancaria, y factura a 30 días para empresas.
              </p>
            </details>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12"
        >
          <div className="text-white text-xl mb-4">
            ⏰ Esta oferta expira en: <span className="font-bold">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</span>
          </div>

          <button
            onClick={() => handleSelectPlan('saas-multi')}
            className="bg-white text-purple-600 px-12 py-6 rounded-xl font-bold text-2xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl inline-flex items-center gap-3"
          >
            ACTIVAR MI CUENTA AHORA
            <ArrowRight className="w-6 h-6" />
          </button>

          <p className="text-white/80 mt-6 text-sm">
            😌 Tranquilo. Garantía de 30 días. Si no te gusta, te devolvemos todo.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
