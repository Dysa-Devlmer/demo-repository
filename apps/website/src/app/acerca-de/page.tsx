'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, Users, Target, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AcercaDePage() {
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

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Acerca de ChatBotDysa
            </h1>
            <p className="text-gray-600 text-lg">
              Transformando la industria restaurantera con inteligencia artificial
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Nuestra Mision</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                En ChatBotDysa, nuestra mision es empoderar a los restaurantes de toda Latinoamerica
                con tecnologia de inteligencia artificial accesible y efectiva. Creemos que cada
                restaurante, sin importar su tamano, merece tener acceso a herramientas que
                optimicen su atencion al cliente y aumenten sus ventas.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Nuestro Equipo</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Somos un equipo apasionado de desarrolladores, disenadores y expertos en
                experiencia de usuario con sede en Santiago, Chile. Combinamos conocimiento
                tecnico de vanguardia con un profundo entendimiento de las necesidades del
                sector gastronomico.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">+500</div>
                  <div className="text-sm text-gray-600">Restaurantes activos</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">+1M</div>
                  <div className="text-sm text-gray-600">Conversaciones mensuales</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-gray-600">Satisfaccion del cliente</div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Nuestros Valores</h2>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">Innovacion:</span>
                  Buscamos constantemente nuevas formas de mejorar la experiencia de nuestros clientes.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">Simplicidad:</span>
                  Creamos soluciones intuitivas que cualquier persona puede usar sin capacitacion.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">Compromiso:</span>
                  El exito de nuestros clientes es nuestro exito. Estamos disponibles 24/7.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">Transparencia:</span>
                  Sin costos ocultos, sin contratos de permanencia, sin sorpresas.
                </li>
              </ul>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Contactanos</h2>
              <p className="text-gray-700 mb-4">
                Estamos siempre disponibles para responder tus preguntas y ayudarte a comenzar.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="mailto:contacto@chatbotdysa.cl" className="text-blue-600 hover:underline">
                  contacto@chatbotdysa.cl
                </a>
                <span className="text-gray-300">|</span>
                <a href="https://wa.me/56912345678" className="text-green-600 hover:underline">
                  +56 9 1234 5678
                </a>
              </div>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            2025 ChatBotDysa Enterprise+++++. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
