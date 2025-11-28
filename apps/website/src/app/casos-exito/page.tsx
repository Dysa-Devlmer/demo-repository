'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Quote,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  ArrowRight,
  Award,
  CheckCircle2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const testimonios = [
  {
    id: 1,
    restaurant: 'Restaurante La Tradición',
    owner: 'María González',
    role: 'Propietaria',
    location: 'Santiago, Chile',
    image: '/testimonials/maria.jpg', // TODO: Add real images
    rating: 5,
    quote:
      'ChatBotDysa ha transformado completamente nuestra atención al cliente. Antes perdíamos muchas reservas porque no podíamos contestar a tiempo, ahora el chatbot atiende 24/7 y nuestras reservas aumentaron un 45%.',
    metrics: [
      { label: 'Aumento en reservas', value: '+45%', icon: TrendingUp },
      { label: 'Tiempo ahorrado', value: '20h/sem', icon: Users },
      { label: 'Satisfacción cliente', value: '4.9/5', icon: Star },
    ],
    period: '3 meses usando ChatBotDysa',
  },
  {
    id: 2,
    restaurant: 'Pizzería Don Giovanni',
    owner: 'Carlos Ramírez',
    role: 'Gerente General',
    location: 'Viña del Mar, Chile',
    image: '/testimonials/carlos.jpg',
    rating: 5,
    quote:
      'La integración con WhatsApp fue clave para nosotros. Nuestros clientes ya estaban ahí y ahora pueden hacer pedidos directamente desde el chat. Los pedidos online crecieron un 60% en solo 2 meses.',
    metrics: [
      { label: 'Pedidos online', value: '+60%', icon: TrendingUp },
      { label: 'Conversaciones/día', value: '150+', icon: MessageSquare },
      { label: 'ROI', value: '320%', icon: Award },
    ],
    period: '2 meses usando ChatBotDysa',
  },
  {
    id: 3,
    restaurant: 'Sushi Bar Sakura',
    owner: 'Ana Soto',
    role: 'Directora',
    location: 'Concepción, Chile',
    image: '/testimonials/ana.jpg',
    rating: 5,
    quote:
      'El sistema de reservas automáticas nos ha salvado la vida. Ya no tenemos que estar pendientes del teléfono todo el día y los clientes pueden reservar incluso cuando estamos cerrados. El panel de analytics nos ayuda a tomar mejores decisiones.',
    metrics: [
      { label: 'Reservas automatizadas', value: '95%', icon: CheckCircle2 },
      { label: 'Reducción errores', value: '-80%', icon: TrendingUp },
      { label: 'Clientes recurrentes', value: '+35%', icon: Users },
    ],
    period: '4 meses usando ChatBotDysa',
  },
]

const estadisticas = [
  {
    value: '150+',
    label: 'Restaurantes Activos',
    description: 'En toda Chile usando ChatBotDysa',
  },
  {
    value: '98.5%',
    label: 'Satisfacción',
    description: 'De nuestros clientes nos recomiendan',
  },
  {
    value: '+52%',
    label: 'Aumento Promedio',
    description: 'En reservas y pedidos online',
  },
  {
    value: '24/7',
    label: 'Atención',
    description: 'Sin días libres ni horarios',
  },
]

export default function CasosExitoPage() {
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <Award className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Casos de Éxito
          </h1>
          <p className="text-xl text-gray-600">
            Descubre cómo restaurantes como el tuyo están transformando su atención al cliente y aumentando sus ventas con ChatBotDysa.
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6"
        >
          {estadisticas.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-100"
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {stat.value}
              </div>
              <div className="font-medium text-gray-900 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-600">{stat.description}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {testimonios.map((testimonio, index) => (
            <motion.div
              key={testimonio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Left Side - Content */}
                <div className="flex flex-col justify-center">
                  {/* Restaurant Info */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {testimonio.restaurant}
                    </h3>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span className="font-medium">{testimonio.owner}</span>
                      <span>•</span>
                      <span>{testimonio.role}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{testimonio.location}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonio.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative mb-6">
                    <Quote className="absolute -left-2 -top-2 h-8 w-8 text-blue-200" />
                    <p className="text-lg text-gray-700 italic pl-6">
                      "{testimonio.quote}"
                    </p>
                  </div>

                  {/* Period */}
                  <p className="text-sm text-gray-500 mb-6">{testimonio.period}</p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    {testimonio.metrics.map((metric, i) => {
                      const Icon = metric.icon
                      return (
                        <div key={i} className="text-center">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-2">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="font-bold text-xl text-gray-900">{metric.value}</div>
                          <div className="text-xs text-gray-600">{metric.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Right Side - Image Placeholder */}
                <div className="flex items-center justify-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Award className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">{testimonio.restaurant}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para ser nuestro próximo caso de éxito?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Únete a más de 150 restaurantes que ya están transformando su atención al cliente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Solicitar Demo Gratuita
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-6">Confiado por restaurantes en toda Chile</p>
          <div className="flex flex-wrap justify-center items-center gap-8 grayscale opacity-50">
            {/* TODO: Add real restaurant logos */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 w-32 bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <span className="text-gray-400 font-medium">Logo {i}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

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
