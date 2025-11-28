'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Newspaper, Download, Mail, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

const pressReleases = [
  {
    date: '15 Nov 2025',
    title: 'ChatBotDysa cierra ronda de financiamiento Serie A',
    summary: 'La startup chilena de IA para restaurantes asegura $5M USD para expandirse a toda Latinoamerica.',
    category: 'Financiamiento'
  },
  {
    date: '28 Oct 2025',
    title: 'ChatBotDysa supera los 500 restaurantes activos',
    summary: 'La plataforma alcanza un hito importante con mas de 1 millon de conversaciones procesadas mensualmente.',
    category: 'Hitos'
  },
  {
    date: '10 Sep 2025',
    title: 'Lanzamiento de ChatBotDysa Enterprise+++++',
    summary: 'Nueva version con capacidades avanzadas de IA y soporte multi-tenant para cadenas de restaurantes.',
    category: 'Producto'
  },
  {
    date: '05 Jul 2025',
    title: 'ChatBotDysa gana premio a la innovacion tecnologica',
    summary: 'Reconocimiento en los Chile Tech Awards por la mejor solucion de IA aplicada.',
    category: 'Premios'
  }
]

const mediaKit = [
  { name: 'Logo Principal (PNG)', size: '2.4 MB' },
  { name: 'Logo Principal (SVG)', size: '45 KB' },
  { name: 'Guia de Marca', size: '8.1 MB' },
  { name: 'Fotos del Equipo', size: '15.2 MB' },
  { name: 'Screenshots del Producto', size: '12.8 MB' }
]

export default function PrensaPage() {
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
          <Newspaper className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sala de Prensa
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Noticias, comunicados de prensa y recursos para medios de comunicacion.
          </p>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Press Releases */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comunicados de Prensa</h2>
            <div className="space-y-4">
              {pressReleases.map((release, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    {release.date}
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {release.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{release.title}</h3>
                  <p className="text-gray-600 text-sm">{release.summary}</p>
                  <Button variant="link" className="p-0 h-auto mt-2 text-blue-600">
                    Leer mas →
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Media Kit */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kit de Prensa</h3>
              <p className="text-gray-600 text-sm mb-4">
                Descarga logos, imagenes y materiales oficiales para tu publicacion.
              </p>
              <div className="space-y-2 mb-4">
                {mediaKit.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-400">{item.size}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar Todo
              </Button>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto de Prensa</h3>
              <p className="text-gray-600 text-sm mb-4">
                Para consultas de medios, entrevistas o mas informacion:
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:prensa@chatbotdysa.cl"
                  className="flex items-center gap-2 text-purple-600 hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  prensa@chatbotdysa.cl
                </a>
              </div>
            </div>

            {/* Company Facts */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Empresa</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Fundada</dt>
                  <dd className="text-gray-900 font-medium">2024, Santiago, Chile</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Industria</dt>
                  <dd className="text-gray-900 font-medium">SaaS / Inteligencia Artificial</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Clientes Activos</dt>
                  <dd className="text-gray-900 font-medium">+500 restaurantes</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Equipo</dt>
                  <dd className="text-gray-900 font-medium">25+ empleados</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Financiamiento</dt>
                  <dd className="text-gray-900 font-medium">Serie A ($5M USD)</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

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
