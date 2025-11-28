'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TerminosPage() {
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
            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terminos y Condiciones
            </h1>
            <p className="text-gray-600">
              Ultima actualizacion: Noviembre 2025
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptacion de los Terminos</h2>
              <p className="text-gray-700 leading-relaxed">
                Al acceder y utilizar ChatBotDysa Enterprise+++++ ("el Servicio"), usted acepta estar sujeto a estos terminos y condiciones. Si no esta de acuerdo con alguna parte de estos terminos, no podra acceder al servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripcion del Servicio</h2>
              <p className="text-gray-700 leading-relaxed">
                ChatBotDysa es una plataforma de automatizacion para restaurantes que incluye chatbot con inteligencia artificial, gestion de pedidos, reservas y atencion al cliente a traves de WhatsApp Business API.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Uso del Servicio</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                El usuario se compromete a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Proporcionar informacion veraz y actualizada</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                <li>No utilizar el servicio para fines ilegales o no autorizados</li>
                <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Pagos y Facturacion</h2>
              <p className="text-gray-700 leading-relaxed">
                Los planes de suscripcion se facturan mensualmente. Los pagos se procesan a traves de MercadoPago u otros metodos de pago disponibles. No se realizan reembolsos por periodos parciales de uso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Propiedad Intelectual</h2>
              <p className="text-gray-700 leading-relaxed">
                Todo el contenido, codigo, diseno y funcionalidades de ChatBotDysa son propiedad exclusiva de DysaDev SpA y estan protegidos por las leyes de propiedad intelectual de Chile y tratados internacionales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitacion de Responsabilidad</h2>
              <p className="text-gray-700 leading-relaxed">
                ChatBotDysa no sera responsable por danos indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de uso del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modificaciones</h2>
              <p className="text-gray-700 leading-relaxed">
                Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios entraran en vigencia inmediatamente despues de su publicacion en el sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contacto</h2>
              <p className="text-gray-700 leading-relaxed">
                Para consultas sobre estos terminos, contactenos en:{' '}
                <a href="mailto:legal@chatbotdysa.cl" className="text-blue-600 hover:underline">
                  legal@chatbotdysa.cl
                </a>
              </p>
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
