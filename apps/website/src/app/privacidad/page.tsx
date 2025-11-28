'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacidadPage() {
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
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Politica de Privacidad
            </h1>
            <p className="text-gray-600">
              Ultima actualizacion: Noviembre 2025
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informacion que Recopilamos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Recopilamos la siguiente informacion:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Informacion de registro: nombre, correo electronico, telefono</li>
                <li>Datos del restaurante: nombre, direccion, menu</li>
                <li>Datos de uso: interacciones con el chatbot, pedidos, reservas</li>
                <li>Datos tecnicos: IP, navegador, dispositivo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Uso de la Informacion</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos su informacion para:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Proveer y mejorar nuestros servicios</li>
                <li>Procesar pedidos y reservas</li>
                <li>Enviar comunicaciones relacionadas con el servicio</li>
                <li>Analizar y mejorar la experiencia del usuario</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Proteccion de Datos</h2>
              <p className="text-gray-700 leading-relaxed">
                Implementamos medidas de seguridad tecnicas y organizativas para proteger sus datos personales, incluyendo cifrado SSL/TLS, acceso restringido a datos, y auditorias de seguridad regulares. Cumplimos con las normativas chilenas de proteccion de datos personales (Ley 19.628).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartir Informacion</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                No vendemos ni compartimos su informacion personal con terceros, excepto:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Proveedores de servicios (hosting, pagos, WhatsApp API)</li>
                <li>Cuando sea requerido por ley</li>
                <li>Con su consentimiento explicito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Retencion de Datos</h2>
              <p className="text-gray-700 leading-relaxed">
                Conservamos sus datos mientras mantenga una cuenta activa o segun sea necesario para proveer servicios. Los datos de conversaciones se conservan por 90 dias para fines de calidad y soporte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Sus Derechos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Acceder a sus datos personales</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la eliminacion de sus datos</li>
                <li>Oponerse al procesamiento de sus datos</li>
                <li>Exportar sus datos en formato portable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos cookies esenciales para el funcionamiento del servicio y cookies analiticas para mejorar la experiencia. Puede gestionar sus preferencias de cookies en la configuracion de su navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contacto</h2>
              <p className="text-gray-700 leading-relaxed">
                Para ejercer sus derechos o consultas sobre privacidad:{' '}
                <a href="mailto:privacidad@chatbotdysa.cl" className="text-blue-600 hover:underline">
                  privacidad@chatbotdysa.cl
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
