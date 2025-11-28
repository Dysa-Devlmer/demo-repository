'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, Building2, FileText, Check, Lock, ArrowLeft, Loader2 } from 'lucide-react'
import { trackAddPaymentInfo, trackClick } from '@/lib/analytics'

function PaymentForm() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') || 'saas-multi'

  const [selectedMethod, setSelectedMethod] = useState<'card' | 'transfer' | 'invoice'>('card')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Business info
    businessName: '',
    rut: '',
    email: '',
    phone: '',
    address: '',

    // Card info
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',

    // Invoice info
    invoiceEmail: '',
    invoicePhone: ''
  })

  const planDetails = {
    'saas-multi': {
      name: 'SaaS Multi-Tenant',
      price: 49995,
      originalPrice: 99990,
      setup: 0,
      total: 49995
    },
    'saas-dedicated': {
      name: 'SaaS Dedicado',
      price: 199990,
      originalPrice: 199990,
      setup: 0,
      total: 199990
    }
  }

  const plan = planDetails[planId as keyof typeof planDetails] || planDetails['saas-multi']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Track payment submission
    trackClick('submit_payment', 'form_submit')

    try {
      // Split business name into first/last name for Mercado Pago
      const nameParts = formData.businessName.trim().split(' ')
      const firstName = nameParts[0] || 'Cliente'
      const lastName = nameParts.slice(1).join(' ') || 'ChatBotDysa'

      // Prepare payment data for Mercado Pago
      const paymentData = {
        email: formData.email,
        firstName,
        lastName,
        rut: formData.rut,
        companyName: formData.businessName,
        planId: planId,
        planName: plan.name,
        billingPeriod: 'monthly',
        amount: plan.total,
        phone: formData.phone,
      }

      // Call backend to create Mercado Pago preference
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005/api'
      const response = await fetch(`${apiUrl}/payments/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error('Error creating payment preference')
      }

      const result = await response.json()

      // Redirect to Mercado Pago checkout
      if (result.success && result.data.initPoint) {
        window.location.href = result.data.initPoint
      } else {
        throw new Error('Invalid response from payment service')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error al procesar el pago. Por favor intenta nuevamente.')
      setLoading(false)
    }
  }

  const handleMethodSelect = (method: 'card' | 'transfer' | 'invoice') => {
    setSelectedMethod(method)

    // Track payment method selection
    const methodNames = {
      card: 'tarjeta',
      transfer: 'transferencia',
      invoice: 'factura'
    }
    trackAddPaymentInfo(methodNames[method])
    trackClick(`payment_method_${method}`, 'button')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="text-white hover:text-purple-300 mb-8 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a planes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10"
            >
              <h1 className="text-3xl font-bold text-white mb-8">
                Finalizar Compra
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business information */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Información del Restaurante
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre del Restaurante *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ej: Pizzería Don Luigi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        RUT *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.rut}
                        onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="12.345.678-9"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Av. Providencia 123, Santiago"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Método de Pago
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => handleMethodSelect('card')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMethod === 'card'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold text-sm">Tarjeta</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMethodSelect('transfer')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMethod === 'transfer'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold text-sm">Transferencia</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMethodSelect('invoice')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMethod === 'invoice'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <FileText className="w-6 h-6 text-white mx-auto mb-2" />
                      <div className="text-white font-semibold text-sm">Factura 30d</div>
                    </button>
                  </div>

                  {/* Card payment form */}
                  {selectedMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Número de Tarjeta *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre en la Tarjeta *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.cardName}
                          onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="JUAN PEREZ"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Vencimiento *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={formData.cardExpiry}
                            onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="MM/AA"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={4}
                            value={formData.cardCvv}
                            onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Lock className="w-4 h-4" />
                        <span>Pago seguro procesado por Mercado Pago</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Transfer info */}
                  {selectedMethod === 'transfer' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
                    >
                      <p className="text-white mb-4">
                        Recibirás un email con los datos bancarios para realizar la transferencia.
                      </p>
                      <div className="text-sm text-gray-300">
                        <p>• La activación ocurre al confirmar el pago (1-2 días hábiles)</p>
                        <p>• Envía el comprobante a pagos@chatbotdysa.com</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Invoice info */}
                  {selectedMethod === 'invoice' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6"
                    >
                      <p className="text-white mb-4">
                        Solo disponible para empresas. Pago a 30 días desde la emisión de la factura.
                      </p>
                      <div className="text-sm text-gray-300">
                        <p>• Activación inmediata</p>
                        <p>• Factura enviada por email</p>
                        <p>• Requiere aprobación crediticia</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Confirmar Pago ${plan.total.toLocaleString('es-CL')}
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Al confirmar aceptas nuestros{' '}
                  <a href="/terminos" className="text-purple-400 hover:underline">
                    términos y condiciones
                  </a>
                </p>
              </form>
            </motion.div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Resumen de Compra
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Plan seleccionado</div>
                  <div className="text-white font-semibold text-lg">{plan.name}</div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Precio mensual</span>
                    <span>${plan.originalPrice.toLocaleString('es-CL')}</span>
                  </div>

                  {plan.originalPrice !== plan.price && (
                    <div className="flex justify-between text-green-400">
                      <span>Descuento 50%</span>
                      <span>-${(plan.originalPrice - plan.price).toLocaleString('es-CL')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-300">
                    <span>Setup</span>
                    <span>{plan.setup === 0 ? 'Gratis' : `$${plan.setup.toLocaleString('es-CL')}`}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total hoy</span>
                    <span>${plan.total.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Luego ${plan.originalPrice.toLocaleString('es-CL')}/mes
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                <div className="text-green-400 font-semibold mb-2">
                  🎁 Bonos incluidos:
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Setup WhatsApp gratis ($50,000)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Capacitación 1:1 ($80,000)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Templates de menú
                  </li>
                </ul>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Activación inmediata
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Sin permanencia
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Garantía 30 días
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Soporte 24/7
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>}>
      <PaymentForm />
    </Suspense>
  )
}
