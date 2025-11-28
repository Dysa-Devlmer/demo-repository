'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Mail, Calendar, MessageSquare, ArrowRight, Download } from 'lucide-react'
import Link from 'next/link'
import { trackPurchase, trackClick } from '@/lib/analytics'

function SuccessContent() {
  const searchParams = useSearchParams()

  // Get transaction data from URL params
  const transactionId = searchParams.get('txn_id') || `TXN_${Date.now()}`
  const planId = searchParams.get('plan') || 'saas-multi'
  const amount = parseInt(searchParams.get('amount') || '49995')
  const planName = searchParams.get('plan_name') || 'SaaS Multi-Tenant'

  // Track successful purchase on page load
  useEffect(() => {
    trackPurchase(transactionId, planId as any, amount)
  }, [transactionId, planId, amount])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <CheckCircle2 className="w-24 h-24 text-green-400 relative" />
          </div>
        </motion.div>

        {/* Success message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¡Pago Exitoso! 🎉
          </h1>
          <p className="text-xl text-gray-300">
            Tu cuenta de ChatBotDysa está activada y lista para usar
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Plan: {planName} • ID: {transactionId}
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 mb-8"
        >
          {/* What happens next */}
          <h2 className="text-2xl font-bold text-white mb-6">
            ¿Qué sigue ahora?
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  1. Revisa tu email
                </h3>
                <p className="text-gray-300 text-sm">
                  Te enviamos tu factura, credenciales actualizadas y guía de inicio.
                  Revisa también spam/promociones.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  2. Agenda tu onboarding (Opcional)
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  Sesión 1:1 de 2 horas para configurar todo juntos.
                </p>
                <a
                  href="https://calendly.com/chatbotdysa/onboarding"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick('onboarding_calendly', 'link')}
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Agendar ahora
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  3. Conecta WhatsApp Business
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  Sigue nuestra guía paso a paso para conectar tu WhatsApp en 5 minutos.
                </p>
                <a
                  href="https://docs.chatbotdysa.com/whatsapp-setup"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick('whatsapp_guide', 'link')}
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
                >
                  Ver guía
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bonuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            🎁 Tus bonos incluidos
          </h2>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              Setup WhatsApp Business gratis (valor $50,000)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              Capacitación 1:1 de 2 horas (valor $80,000)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              Templates de menú personalizados
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              Soporte prioritario durante el primer mes
            </li>
          </ul>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link
            href="https://demo.chatbotdysa.com/login"
            onClick={() => trackClick('goto_admin_panel', 'button')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-center hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
          >
            Ir al Admin Panel
            <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href="https://wa.me/56912345678?text=Hola,%20acabo%20de%20activar%20mi%20cuenta%20y%20necesito%20ayuda"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('contact_support_whatsapp', 'button')}
            className="bg-white/10 text-white py-4 rounded-xl font-bold text-center border-2 border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Contactar Soporte
          </a>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm">
            ¿Problemas o preguntas?{' '}
            <a href="mailto:soporte@chatbotdysa.com" className="text-purple-400 hover:underline">
              soporte@chatbotdysa.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
