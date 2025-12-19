'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Check,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { generateSubdomain, formatPhoneChile, validateEmail } from '@/lib/utils'

interface RegistrationData {
  // Step 1: Restaurant Info
  restaurantName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string

  // Step 2: Subdomain
  subdomain: string

  // Step 3: Plan Selection
  plan: 'saas-multi' | 'saas-dedicated' | 'on-premise'

  // Step 4: Payment
  paymentMethod: 'stripe' | 'paypal'

  // Step 5: Confirmation
  agreedToTerms: boolean
  agreedToPrivacy: boolean
}

interface PlanConfig {
  name: string
  price: number
  features: string[]
  color: string
  bgColor: string
  popular: boolean
  setupFee?: boolean
  monthlyFee?: number
}

const plans: Record<RegistrationData['plan'], PlanConfig> = {
  'saas-multi': {
    name: 'SaaS Multi-Tenant',
    price: 99990,
    features: ['Activación inmediata', 'Chatbot IA ilimitado', 'WhatsApp Business', 'Soporte 24/7'],
    color: 'border-primary-500',
    bgColor: 'bg-primary-50',
    popular: true
  },
  'saas-dedicated': {
    name: 'SaaS Dedicado',
    price: 199990,
    features: ['Servidor dedicado', '3x más rendimiento', 'IP dedicada', 'SLA 99.9%'],
    color: 'border-gray-300',
    bgColor: 'bg-white',
    popular: false
  },
  'on-premise': {
    name: 'On-Premise',
    price: 2500000,
    monthlyFee: 49990,
    setupFee: true,
    features: ['Instalación en tu servidor', '100% control de datos', 'Código fuente', 'Ingeniero dedicado'],
    color: 'border-purple-500',
    bgColor: 'bg-purple-50',
    popular: false
  }
}

export default function RegistroPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RegistrationData>({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    subdomain: '',
    plan: 'saas-multi',
    paymentMethod: 'stripe',
    agreedToTerms: false,
    agreedToPrivacy: false
  })

  const updateData = (updates: Partial<RegistrationData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const generateAutoSubdomain = (name: string) => {
    return generateSubdomain(name)
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005/api'

      const response = await fetch(`${apiUrl}/leads/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al registrar el restaurante')
      }

      const result = await response.json()
      console.log('Registro exitoso:', result)

      // Redirect to welcome page with tenant data
      window.location.href = `/welcome?subdomain=${data.subdomain}&tenantId=${result.data.tenantId}`
    } catch (error: any) {
      console.error('Registration failed:', error)
      alert(error.message || 'Error al procesar el registro. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = [
    'Información del Restaurante',
    'Dominio Personalizado',
    'Selección de Plan',
    'Método de Pago',
    'Confirmación'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="container-custom flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold gradient-text">ChatBotDysa</span>
            <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold">
              Enterprise+++++
            </span>
          </div>
        </div>
      </header>

      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold gradient-text">🎁 Pide tu Demo Gratis - Enterprise+++++</h1>
              <span className="text-sm text-gray-500">Paso {currentStep} de 5</span>
            </div>

            <div className="flex items-center space-x-4 mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <Check className="h-4 w-4" /> : step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded ${
                        step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-600 mt-4">
              {stepTitles[currentStep - 1]}
            </p>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Step 1: Restaurant Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Building className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">🎁 Solicita tu Demo Personalizado</h2>
                  <p className="text-gray-600">Completa esta información y te contactaremos para mostrarte ChatBotDysa en acción con los datos de TU restaurante</p>
                  <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-800 font-medium">✨ 14 días gratis + Demo personalizado con tus datos reales</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Restaurante *
                    </label>
                    <input
                      type="text"
                      value={data.restaurantName}
                      onChange={(e) => {
                        updateData({ restaurantName: e.target.value })
                        updateData({ subdomain: generateAutoSubdomain(e.target.value) })
                      }}
                      placeholder="Ej: Restaurante Don Luigi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Propietario *
                    </label>
                    <input
                      type="text"
                      value={data.ownerName}
                      onChange={(e) => updateData({ ownerName: e.target.value })}
                      placeholder="Tu nombre completo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => updateData({ email: e.target.value })}
                      placeholder="propietario@restaurante.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => updateData({ phone: formatPhoneChile(e.target.value) })}
                      placeholder="+56 9 1234 5678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={data.address}
                      onChange={(e) => updateData({ address: e.target.value })}
                      placeholder="Av. Providencia 123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <select
                      value={data.city}
                      onChange={(e) => updateData({ city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Selecciona tu ciudad</option>
                      <option value="santiago">Santiago</option>
                      <option value="valparaiso">Valparaíso</option>
                      <option value="concepcion">Concepción</option>
                      <option value="temuco">Temuco</option>
                      <option value="antofagasta">Antofagasta</option>
                      <option value="otra">Otra</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Subdomain */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Globe className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu dominio personalizado</h2>
                  <p className="text-gray-600">Este será tu URL único para acceder al sistema</p>
                </div>

                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subdomain personalizado
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={data.subdomain}
                      onChange={(e) => updateData({ subdomain: generateSubdomain(e.target.value) })}
                      placeholder="mi-restaurante"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                      .chatbotdysa.cl
                    </span>
                  </div>

                  <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm text-primary-700">
                      <strong>Tu URL será:</strong><br />
                      https://{data.subdomain || 'mi-restaurante'}.chatbotdysa.cl
                    </p>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p>Este será tu panel de administración personalizado donde:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Gestionarás pedidos y reservas</li>
                      <li>• Configurarás tu menú</li>
                      <li>• Verás estadísticas en tiempo real</li>
                      <li>• Administrarás conversaciones</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Plan Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Zap className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Elige tu plan</h2>
                  <p className="text-gray-600">Todos los planes incluyen 14 días gratis. Puedes cambiar en cualquier momento.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(plans).map(([key, plan]) => (
                    <motion.div
                      key={key}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        data.plan === key
                          ? `${plan.color} ${plan.bgColor} shadow-lg scale-105`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateData({ plan: key as typeof data.plan })}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Recomendado
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        {plan.setupFee ? (
                          <div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              ${plan.price.toLocaleString('es-CL')} <span className="text-sm text-gray-600">setup</span>
                            </div>
                            <div className="text-xl font-bold text-gray-700">
                              +${plan.monthlyFee?.toLocaleString('es-CL')} <span className="text-sm text-gray-600">/mes</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              ${plan.price.toLocaleString('es-CL')}
                            </div>
                            <div className="text-gray-600 text-sm">/mes</div>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {data.plan === key && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Payment Method */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <CreditCard className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Método de pago</h2>
                  <p className="text-gray-600">
                    {plans[data.plan].setupFee
                      ? `Setup ${plans[data.plan].price.toLocaleString('es-CL')} + ${plans[data.plan].monthlyFee?.toLocaleString('es-CL')}/mes`
                      : `14 días gratis, luego $${plans[data.plan].price.toLocaleString('es-CL')}/mes`}. Cancela cuando quieras.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      data.paymentMethod === 'stripe'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateData({ paymentMethod: 'stripe' })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="h-6 w-6 text-gray-600 mr-3" />
                        <div>
                          <div className="font-medium">Tarjeta de Crédito/Débito</div>
                          <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                        </div>
                      </div>
                      {data.paymentMethod === 'stripe' && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      data.paymentMethod === 'paypal'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateData({ paymentMethod: 'paypal' })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-6 w-6 bg-blue-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold">
                          PP
                        </div>
                        <div>
                          <div className="font-medium">PayPal</div>
                          <div className="text-sm text-gray-600">Paga con tu cuenta PayPal</div>
                        </div>
                      </div>
                      {data.paymentMethod === 'paypal' && (
                        <Check className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> El cobro comenzará después de los 14 días de prueba gratuita.
                      Puedes cancelar en cualquier momento desde tu panel de administración.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Users className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Ya casi estás listo!</h2>
                  <p className="text-gray-600">Revisa tu información y acepta los términos para continuar</p>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Resumen de tu registro</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Restaurante:</span>
                      <span className="font-medium">{data.restaurantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Propietario:</span>
                      <span className="font-medium">{data.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{data.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">URL:</span>
                      <span className="font-medium text-primary-600">
                        {data.subdomain}.chatbotdysa.cl
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{plans[data.plan].name}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Precio:</span>
                      <span className="font-bold text-lg">
                        {plans[data.plan].setupFee
                          ? `$${plans[data.plan].price.toLocaleString('es-CL')} setup + $${plans[data.plan].monthlyFee?.toLocaleString('es-CL')}/mes`
                          : `$${plans[data.plan].price.toLocaleString('es-CL')}/mes`
                        }
                      </span>
                    </div>
                    <div className="text-center text-green-600 font-medium">
                      Primeros 14 días GRATIS
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.agreedToTerms}
                      onChange={(e) => updateData({ agreedToTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Acepto los{' '}
                      <Link href="/terminos" className="text-primary-600 hover:text-primary-700 underline">
                        Términos y Condiciones
                      </Link>{' '}
                      de ChatBotDysa Enterprise+++++
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.agreedToPrivacy}
                      onChange={(e) => updateData({ agreedToPrivacy: e.target.checked })}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Acepto la{' '}
                      <Link href="/privacidad" className="text-primary-600 hover:text-primary-700 underline">
                        Política de Privacidad
                      </Link>{' '}
                      y el procesamiento de mis datos personales
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handlePrev} className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!data.restaurantName || !data.ownerName || !data.email || !validateEmail(data.email))) ||
                    (currentStep === 2 && !data.subdomain) ||
                    (currentStep === 3 && !data.plan) ||
                    (currentStep === 4 && !data.paymentMethod)
                  }
                  className="flex items-center"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!data.agreedToTerms || !data.agreedToPrivacy || loading}
                  variant="enterprise"
                  className="flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear Mi Restaurante
                      <Check className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
