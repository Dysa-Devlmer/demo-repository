'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Award,
  Bot,
  CheckCircle,
  ExternalLink,
  Mail,
  MessageSquare,
  Rocket,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

export default function WelcomePage() {
  const searchParams = useSearchParams()
  const subdomain = searchParams?.get('subdomain') || 'tu-restaurante'
  const [countdown, setCountdown] = useState(3)
  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001'

  useEffect(() => {
    // Trigger confetti celebration
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#9333ea', '#facc15']
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#9333ea', '#facc15']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="h-20 w-20 mx-auto mb-4" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold mb-2"
            >
              🎉 ¡Solicitud Enviada Exitosamente!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl opacity-90"
            >
              Tu demo personalizado está en camino
            </motion.p>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-8">
            {/* Success Message */}
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 border-2 border-green-200 rounded-full mb-6">
                <Sparkles className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-semibold">Tu cuenta está siendo configurada</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Qué sigue ahora?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nuestro equipo está preparando tu entorno personalizado con los datos de tu restaurante.
                Te contactaremos en las próximas <strong>24 horas</strong> para:
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200"
              >
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-center">Configurar tu Demo</h3>
                <p className="text-sm text-gray-700 text-center">
                  Cargaremos tu menú, configuraremos tu marca y personalizaremos el chatbot con tu información
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200"
              >
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-center">Agendar tu Demo</h3>
                <p className="text-sm text-gray-700 text-center">
                  Te llamaremos para coordinar una videollamada de 30 minutos donde verás todo en acción
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200"
              >
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-center">Activar tu Cuenta</h3>
                <p className="text-sm text-gray-700 text-center">
                  Si te gusta, activamos tu cuenta y empiezas tu trial de 14 días gratis inmediatamente
                </p>
              </motion.div>
            </div>

            {/* Your URL */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <Award className="h-12 w-12 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Tu URL personalizado reservado:</h3>
                  <div className="bg-white px-4 py-3 rounded-lg border border-yellow-300 font-mono text-lg text-primary-600 mb-2">
                    https://{subdomain}.chatbotdysa.cl
                  </div>
                  <p className="text-sm text-gray-700">
                    Este será tu panel de administración único. ¡Ya está reservado para ti!
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-center">📧 Revisa tu Email</h3>
              <p className="text-gray-700 text-center mb-4">
                Te hemos enviado un correo de confirmación con toda la información y los próximos pasos.
                Si no lo ves, revisa tu carpeta de spam.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:soporte@chatbotdysa.cl">
                    <Mail className="mr-2 h-4 w-4" />
                    Contactar Soporte
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button variant="enterprise" size="lg" className="flex-1" asChild>
                <Link href={demoUrl}>
                  <Rocket className="mr-2 h-5 w-5" />
                  Explorar Demo Interactivo Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="flex-1" asChild>
                <Link href="/">
                  <Bot className="mr-2 h-5 w-5" />
                  Volver al Inicio
                </Link>
              </Button>
            </div>

            {/* Footer Note */}
            <div className="text-center text-sm text-gray-500 pt-4">
              <p>
                ¿Tienes preguntas? Escríbenos a{' '}
                <a href="mailto:soporte@chatbotdysa.cl" className="text-primary-600 hover:underline">
                  soporte@chatbotdysa.cl
                </a>
                {' '}o llámanos al{' '}
                <a href="tel:+56912345678" className="text-primary-600 hover:underline">
                  +56 9 1234 5678
                </a>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Powered by */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <Bot className="h-5 w-5 text-primary-600" />
            <span className="font-bold gradient-text">ChatBotDysa</span>
            <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold">
              Enterprise+++++
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
