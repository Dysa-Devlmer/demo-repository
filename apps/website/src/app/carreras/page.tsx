'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Briefcase, MapPin, Clock, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const openPositions = [
  {
    title: 'Senior Full Stack Developer',
    department: 'Ingenieria',
    location: 'Santiago, Chile (Hibrido)',
    type: 'Tiempo completo',
    description: 'Buscamos un desarrollador senior para liderar el desarrollo de nuevas funcionalidades en nuestra plataforma.'
  },
  {
    title: 'Customer Success Manager',
    department: 'Exito del Cliente',
    location: 'Remoto (Chile)',
    type: 'Tiempo completo',
    description: 'Ayuda a nuestros clientes a sacar el maximo provecho de ChatBotDysa.'
  },
  {
    title: 'UX/UI Designer',
    department: 'Diseno',
    location: 'Santiago, Chile (Hibrido)',
    type: 'Tiempo completo',
    description: 'Disena experiencias intuitivas y hermosas para nuestra plataforma.'
  }
]

const benefits = [
  { icon: '🏠', title: 'Trabajo Hibrido', description: 'Flexibilidad para trabajar desde casa o la oficina' },
  { icon: '📚', title: 'Aprendizaje Continuo', description: 'Presupuesto anual para cursos y certificaciones' },
  { icon: '🏥', title: 'Seguro de Salud', description: 'Cobertura medica completa para ti y tu familia' },
  { icon: '🌴', title: 'Vacaciones Extra', description: '20 dias habiles + tu cumpleanos libre' },
  { icon: '💻', title: 'Equipo de Trabajo', description: 'Macbook Pro y setup completo para tu home office' },
  { icon: '🎉', title: 'Cultura Increible', description: 'Team buildings, happy hours y celebraciones' }
]

export default function CarrerasPage() {
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

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Briefcase className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Unete a Nuestro Equipo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos construyendo el futuro de la atencion al cliente para restaurantes.
            Buscamos personas apasionadas que quieran hacer la diferencia.
          </p>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Beneficios de Trabajar con Nosotros
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
            >
              <div className="text-4xl mb-3">{benefit.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Posiciones Abiertas
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {openPositions.map((position, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{position.title}</h3>
                  <p className="text-purple-600 text-sm font-medium">{position.department}</p>
                  <p className="text-gray-600 text-sm mt-2">{position.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {position.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {position.type}
                    </span>
                  </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
                  Aplicar Ahora
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white max-w-3xl mx-auto">
          <Heart className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            No ves la posicion que buscas?
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Siempre estamos buscando talento excepcional. Envianos tu CV y cuentanos
            como te gustaria contribuir a ChatBotDysa.
          </p>
          <a href="mailto:carreras@chatbotdysa.cl">
            <Button size="lg" variant="secondary">
              Enviar CV Espontaneo
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md mt-8">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            2025 ChatBotDysa Enterprise+++++. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
