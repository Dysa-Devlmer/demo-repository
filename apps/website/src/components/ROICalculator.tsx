'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, DollarSign, Users, Clock, MessageSquare } from 'lucide-react'

interface CalculatorInputs {
  monthlyOrders: number
  averageOrderValue: number
  supportHoursPerDay: number
  hourlyStaffCost: number
}

export default function ROICalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyOrders: 500,
    averageOrderValue: 15000,
    supportHoursPerDay: 8,
    hourlyStaffCost: 5000,
  })

  const [showResults, setShowResults] = useState(false)

  // Cálculos
  const monthlyRevenue = inputs.monthlyOrders * inputs.averageOrderValue
  const currentStaffCost = inputs.supportHoursPerDay * inputs.hourlyStaffCost * 30

  // Con ChatBotDysa
  const automationRate = 0.75 // 75% de consultas automatizadas
  const reducedStaffHours = inputs.supportHoursPerDay * (1 - automationRate)
  const newStaffCost = reducedStaffHours * inputs.hourlyStaffCost * 30
  const staffSavings = currentStaffCost - newStaffCost

  // Incremento de conversión (15% más pedidos por disponibilidad 24/7)
  const newMonthlyOrders = Math.round(inputs.monthlyOrders * 1.15)
  const additionalRevenue = (newMonthlyOrders - inputs.monthlyOrders) * inputs.averageOrderValue

  // Plan Enterprise (99.990 CLP/mes)
  const chatbotCost = 99990
  const totalBenefit = staffSavings + additionalRevenue - chatbotCost
  const roi = ((totalBenefit / chatbotCost) * 100).toFixed(0)
  const paybackDays = Math.round((chatbotCost / totalBenefit) * 30)

  const handleCalculate = () => {
    setShowResults(true)
  }

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 font-semibold text-sm mb-4">
            <Calculator className="w-4 h-4" />
            <span>Calculadora ROI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Cuánto puedes <span className="text-gradient">ahorrar y ganar</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calcula el retorno de inversión real de ChatBotDysa para tu restaurante
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary-600" />
              Datos de tu restaurante
            </h3>

            <div className="space-y-6">
              {/* Pedidos mensuales */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Pedidos mensuales promedio
                </label>
                <input
                  type="number"
                  value={inputs.monthlyOrders}
                  onChange={(e) => setInputs({ ...inputs, monthlyOrders: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Ej: 500 pedidos/mes</p>
              </div>

              {/* Ticket promedio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Ticket promedio por pedido (CLP)
                </label>
                <input
                  type="number"
                  value={inputs.averageOrderValue}
                  onChange={(e) => setInputs({ ...inputs, averageOrderValue: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">Ej: $15.000 CLP</p>
              </div>

              {/* Horas de atención */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Horas diarias de atención al cliente
                </label>
                <input
                  type="number"
                  value={inputs.supportHoursPerDay}
                  onChange={(e) => setInputs({ ...inputs, supportHoursPerDay: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  min="0"
                  max="24"
                />
                <p className="text-xs text-gray-500 mt-1">Ej: 8 horas/día</p>
              </div>

              {/* Costo por hora de personal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Costo por hora de personal (CLP)
                </label>
                <input
                  type="number"
                  value={inputs.hourlyStaffCost}
                  onChange={(e) => setInputs({ ...inputs, hourlyStaffCost: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  min="0"
                  step="500"
                />
                <p className="text-xs text-gray-500 mt-1">Ej: $5.000 CLP/hora</p>
              </div>

              <motion.button
                onClick={handleCalculate}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Calcular mi ROI
              </motion.button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Tu ahorro mensual proyectado
            </h3>

            {showResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* ROI Principal */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-white/80">
                    Beneficio Neto Mensual
                  </p>
                  <p className="text-5xl font-bold mb-2">
                    {formatCLP(totalBenefit)}
                  </p>
                  <p className="text-sm text-white/90">
                    {roi}% ROI • Recuperas inversión en {paybackDays} días
                  </p>
                </div>

                {/* Desglose */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">Ahorro en personal</p>
                        <p className="text-xs text-white/60">75% consultas automatizadas</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-300">
                      +{formatCLP(staffSavings)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">Ingresos adicionales</p>
                        <p className="text-xs text-white/60">+15% pedidos (24/7 disponible)</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-300">
                      +{formatCLP(additionalRevenue)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-400/20 flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">Inversión ChatBotDysa</p>
                        <p className="text-xs text-white/60">Plan Enterprise+++++</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-purple-300">
                      -{formatCLP(chatbotCost)}
                    </p>
                  </div>
                </div>

                {/* Stats adicionales */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-2xl font-bold">{newMonthlyOrders}</p>
                    <p className="text-sm text-white/80">Pedidos/mes nuevos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(reducedStaffHours)}h</p>
                    <p className="text-sm text-white/80">Personal liberado/día</p>
                  </div>
                </div>

                <motion.a
                  href="/demo"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full bg-white text-primary-600 font-bold py-4 px-6 rounded-xl text-center hover:bg-gray-50 transition-all mt-6"
                >
                  🚀 Pide tu Demo Gratis
                </motion.a>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-white/60">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Completa los datos y calcula tu ROI</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">Datos promedio basados en 200+ restaurantes activos</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>75% automatización promedio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>+15% conversión 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>ROI promedio 312%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
