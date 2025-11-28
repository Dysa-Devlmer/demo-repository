'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ChatWidget from '@/components/ChatWidget'
import { trackLeadGeneration, trackSelectPlan, trackClick } from '@/lib/analytics'
import {
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  Check,
  Clock,
  DollarSign,
  Globe,
  MessageSquare,
  Phone,
  Rocket,
  Shield,
  Star,
  Users,
  Zap,
  ChevronRight,
  PlayCircle,
  ExternalLink,
  Menu,
  X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import { useState } from 'react'
import ROICalculator from '@/components/ROICalculator'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
}

const fadeInUpTransition = { duration: 0.6 }

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [certificationRef, certificationInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Navigation Header */}
      <motion.header
        className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container-custom flex h-20 items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Bot className="h-10 w-10 text-primary-600 group-hover:text-primary-700 transition-colors" />
              <div className="absolute -inset-1 bg-primary-400/20 rounded-full blur-md group-hover:bg-primary-500/30 transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ChatBotDysa
              </span>
              <span className="hidden sm:inline text-xs bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-3 py-0.5 rounded-full font-bold shadow-md">
                Enterprise+++++
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { href: '#caracteristicas', label: 'Características' },
              { href: '#planes', label: 'Planes' },
              { href: '#casos-exito', label: 'Casos de Éxito' },
              { href: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001', label: 'Demo en Vivo' }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-purple-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="font-semibold border-2 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
              asChild
            >
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001'}/login`}>Iniciar Sesión</Link>
            </Button>
            <Button
              variant="enterprise"
              size="sm"
              className="font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-600/40 hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link
                href="/registro"
                onClick={() => trackLeadGeneration('header_cta', 99990)}
              >
                Pide tu Demo Gratis
                <Rocket className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="container-custom py-6 flex flex-col space-y-2">
              {[
                { href: '#caracteristicas', label: 'Características' },
                { href: '#planes', label: 'Planes' },
                { href: '#casos-exito', label: 'Casos de Éxito' },
                { href: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001', label: 'Demo en Vivo' }
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="block text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all py-3 px-4 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full font-semibold border-2"
                  asChild
                >
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001'}/login`}>Iniciar Sesión</Link>
                </Button>
                <Button
                  variant="enterprise"
                  size="sm"
                  className="w-full font-bold shadow-lg"
                  asChild
                >
                  <Link
                    href="/registro"
                    onClick={() => trackLeadGeneration('mobile_menu_cta', 99990)}
                  >
                    Pide tu Demo Gratis
                    <Rocket className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-white section-padding">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        <div className="container-custom relative">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            {/* Certification Badge */}
            <motion.div
              variants={fadeInUp} transition={fadeInUpTransition}
              className="inline-flex items-center rounded-full border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-3 text-sm font-bold text-yellow-900 mb-8 shadow-lg shadow-yellow-200/50 hover:shadow-xl hover:shadow-yellow-300/50 transition-all duration-300 hover:scale-105 certification-badge"
            >
              <Award className="mr-2 h-5 w-5 text-yellow-600" />
              Sistema Certificado Enterprise+++++ • 98.5/100 Puntos
              <ChevronRight className="ml-2 h-5 w-5 text-yellow-600 animate-pulse" />
            </motion.div>

            <motion.h1
              variants={fadeInUp} transition={fadeInUpTransition}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl mb-6"
            >
              Automatiza tu{' '}
              <span className="gradient-text">Restaurante</span>
              {' '}con IA
            </motion.h1>

            <motion.p
              variants={fadeInUp} transition={fadeInUpTransition}
              className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              ChatBotDysa Enterprise+++++ es la solución líder para restaurantes chilenos.
              Automatiza pedidos, reservas y atención al cliente 24/7 con inteligencia artificial certificada.
            </motion.p>

            <motion.div
              variants={fadeInUp} transition={fadeInUpTransition}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button size="xl" variant="enterprise" className="text-lg px-8 py-4 shadow-2xl shadow-purple-500/50 hover:shadow-purple-600/60 hover:scale-105 transition-all duration-300 group" asChild>
                <Link
                  href="/registro"
                  onClick={() => trackLeadGeneration('hero_primary_cta', 99990)}
                >
                  Pide tu Demo Gratis • 14 Días
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="text-lg px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300 shadow-lg group" asChild>
                <Link href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001'}>
                  <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Ver Demo en Vivo
                </Link>
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              ref={statsRef}
              variants={fadeInUp} transition={fadeInUpTransition}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {statsInView && <CountUp end={70} duration={2} suffix="%" />}
                </div>
                <div className="text-sm text-gray-700 font-medium">Menos tiempo en gestión</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600 mb-2">
                  {statsInView && <CountUp end={35} duration={2} suffix="%" />}
                </div>
                <div className="text-sm text-gray-700 font-medium">Aumento en ventas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">
                  24<span className="text-lg">/7</span>
                </div>
                <div className="text-sm text-gray-700 font-medium">Atención automática</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Client Logos */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
              Empresas que confían en ChatBotDysa
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
              {[
                { name: 'Pizzería Don Luigi', emoji: '🍕' },
                { name: 'Sabores de Chile', emoji: '🇨🇱' },
                { name: 'Burger Express', emoji: '🍔' },
                { name: 'Sushi Palace', emoji: '🍱' },
                { name: 'Café Central', emoji: '☕' },
                { name: 'Parrilla Gaucha', emoji: '🥩' }
              ].map((client, index) => (
                <motion.div
                  key={client.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center group cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl group-hover:shadow-xl group-hover:from-primary-50 group-hover:to-purple-50 transition-all duration-300">
                    {client.emoji}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium text-center">{client.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-gray-200"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">200+</div>
              <div className="text-sm text-gray-600">Restaurantes Activos</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-600">1.5M+</div>
              <div className="text-sm text-gray-600">Conversaciones/mes</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-600">98.9%</div>
              <div className="text-sm text-gray-600">Satisfacción Cliente</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Uptime Garantizado</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Certification Section */}
      <section ref={certificationRef} className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={certificationInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Certificación Enterprise+++++</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Único sistema en Chile certificado con 98.5/100 puntos, cumpliendo estándares de grandes empresas chilenas
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={certificationInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="certification-badge bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-8 rounded-2xl text-center relative overflow-hidden">
              <div className="text-6xl font-bold text-white mb-4">98.5<span className="text-3xl">/100</span></div>
              <div className="text-xl font-semibold text-white mb-2">CERTIFICACIÓN ENTERPRISE+++++</div>
              <div className="text-yellow-100 mb-6">
                ✅ Arquitectura: 91.7% • ✅ Seguridad: 92.3% • ✅ Rendimiento: 91.7% • ✅ Confiabilidad: 100%
              </div>
              <div className="flex justify-center items-center space-x-8 text-sm text-yellow-100">
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  47 Aprobados
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  2 Advertencias
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  0 Fallos
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir ChatBotDysa?</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              Sistema completo diseñado específicamente para restaurantes chilenos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 'whatsapp-api',
                icon: MessageSquare,
                title: 'WhatsApp Business API',
                description: 'Integración nativa con WhatsApp para recibir pedidos y reservas automáticamente',
                gradient: 'from-green-400 to-emerald-600'
              },
              {
                id: 'ai-conversational',
                icon: Bot,
                title: 'IA Conversacional',
                description: 'Chatbot inteligente que entiende el español chileno y maneja conversaciones complejas',
                gradient: 'from-purple-400 to-pink-600'
              },
              {
                id: 'business-panel',
                icon: BarChart3,
                title: 'Panel Empresarial',
                description: 'Dashboard completo con métricas en tiempo real y análisis de rendimiento',
                gradient: 'from-blue-400 to-cyan-600'
              },
              {
                id: 'support-24-7',
                icon: Clock,
                title: 'Atención 24/7',
                description: 'Tu restaurante nunca duerme. Recibe pedidos y reservas las 24 horas del día',
                gradient: 'from-orange-400 to-red-600'
              },
              {
                id: 'integrated-payments',
                icon: DollarSign,
                title: 'Pagos Integrados',
                description: 'Procesa pagos con Stripe, PayPal y Transbank directamente en el chat',
                gradient: 'from-yellow-400 to-orange-600'
              },
              {
                id: 'enterprise-security',
                icon: Shield,
                title: 'Seguridad Enterprise',
                description: 'Cifrado end-to-end, cumplimiento bancario y auditorías automáticas',
                gradient: 'from-indigo-400 to-purple-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.id}
                className="group relative p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Icon with gradient background */}
                <div className="relative flex items-center mb-6">
                  <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                </div>

                <h3 className="relative text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="relative text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Decorative corner element */}
                <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Pricing Section */}
      <section id="planes" className="section-padding bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Planes para cada tipo de restaurante</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              Desde pequeños restaurantes hasta grandes cadenas. Todos los planes incluyen 14 días gratis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                id: 'saas-multi',
                name: 'SaaS Multi-Tenant',
                price: 99990,
                description: 'Perfecto para restaurantes pequeños',
                features: [
                  'Activación inmediata',
                  'Chatbot IA ilimitado',
                  'WhatsApp Business',
                  'Panel de administración',
                  'Soporte 24/7',
                  'Backup diario automático',
                  'Cancela cuando quieras'
                ],
                popular: true,
                badge: '🎯 RECOMENDADO'
              },
              {
                id: 'saas-dedicated',
                name: 'SaaS Dedicado',
                price: 199990,
                description: 'Ideal para restaurantes en crecimiento',
                features: [
                  'Todo lo de Multi-Tenant',
                  'Servidor dedicado privado',
                  '3x más rendimiento',
                  'IP dedicada exclusiva',
                  'Soporte prioritario',
                  'SLA 99.9% uptime',
                  'Backup cada 6 horas'
                ],
                popular: false
              },
              {
                id: 'on-premise',
                name: 'On-Premise',
                price: 2500000,
                setupFee: true,
                monthlyFee: 49990,
                description: 'Para grandes cadenas y franquicias',
                features: [
                  'Instalación en tu servidor',
                  '100% control de datos',
                  'Código fuente accesible',
                  'Ingeniero dedicado',
                  'SLA 99.99% uptime',
                  'Métricas avanzadas',
                  'Capacitación incluida',
                  'API personalizada'
                ],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`group relative p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 overflow-hidden ${
                  plan.popular
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/30'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: plan.popular ? 1.05 : 1.03 }}
              >
                {/* Animated background gradient */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}

                {/* Popular badge */}
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ y: -10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      {plan.badge || '⭐ Más Popular'}
                    </span>
                  </motion.div>
                )}

                <div className="relative text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6 font-medium">{plan.description}</p>

                  {/* Price with hover effect */}
                  <div className="flex flex-col items-center justify-center">
                    {plan.setupFee ? (
                      <>
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                            ${plan.price.toLocaleString('es-CL')}
                          </span>
                          <span className="text-gray-500 ml-2 text-sm">setup</span>
                        </div>
                        <div className="mt-2 flex items-baseline">
                          <span className="text-2xl font-bold text-gray-700">
                            +${plan.monthlyFee?.toLocaleString('es-CL')}
                          </span>
                          <span className="text-gray-500 ml-1 text-sm">/mes</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                          ${plan.price.toLocaleString('es-CL')}
                        </span>
                        <span className="text-gray-500 ml-2 text-lg">/mes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features list with staggered animation */}
                <ul className="relative space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button with enhanced hover */}
                <Button
                  variant={plan.popular ? "enterprise" : "outline"}
                  size="lg"
                  className={`relative w-full ${
                    plan.popular
                      ? 'shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-600/60'
                      : 'hover:border-blue-500 hover:text-blue-600 hover:shadow-lg'
                  } transition-all duration-300 group-hover:scale-105`}
                  asChild
                >
                  <Link href="/registro" className="flex items-center justify-center">
                    Pide tu Demo
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>

                {/* Decorative corner glow */}
                {plan.popular && (
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="casos-exito" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Casos de Éxito Reales</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              Restaurantes chilenos que ya están automatizando su operación con ChatBotDysa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 'story-don-luigi',
                restaurant: 'Pizzería "Don Luigi"',
                location: 'Santiago, Chile',
                improvement: '+40% más pedidos',
                quote: 'Antes teníamos 3 personas atendiendo teléfono. Ahora solo 1 persona supervisa y ChatBotDysa maneja todo automáticamente.',
                owner: 'Luigi Martinelli',
                metrics: { orders: '+40%', errors: '-60%', staff: '-67%' }
              },
              {
                id: 'story-sabores-chile',
                restaurant: 'Restaurante "Sabores de Chile"',
                location: 'Valparaíso, Chile',
                improvement: '100% ocupación fines de semana',
                quote: 'Las reservas eran un caos. Ahora el sistema automático maneja todo y tenemos 100% ocupación los fines de semana.',
                owner: 'Carmen Rodríguez',
                metrics: { reservations: '+150%', occupancy: '100%', cancellations: '-80%' }
              },
              {
                id: 'story-burger-express',
                restaurant: 'Cadena "Burger Express"',
                location: '5 locales, Chile',
                improvement: 'Gestión centralizada',
                quote: 'Manejar 5 locales era imposible. ChatBotDysa nos dio control total desde un solo panel.',
                owner: 'Roberto Sánchez',
                metrics: { locations: '5', unified: '100%', efficiency: '+85%' }
              }
            ].map((story, index) => (
              <motion.div
                key={story.id}
                className="group relative p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-yellow-300 overflow-hidden transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Quote decoration */}
                <div className="absolute top-4 right-4 text-yellow-200 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>

                {/* Stars with animation */}
                <div className="flex items-center mb-6 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`star-${story.id}-${i}`}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote text */}
                <blockquote className="relative text-gray-700 mb-8 text-lg leading-relaxed italic">
                  <span className="text-yellow-500 font-bold text-2xl">"</span>
                  {story.quote}
                  <span className="text-yellow-500 font-bold text-2xl">"</span>
                </blockquote>

                {/* Author info with gradient border */}
                <div className="relative border-t-2 border-gradient-to-r from-yellow-400 via-orange-400 to-red-400 pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-gray-900 text-lg mb-1">{story.owner}</div>
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">{story.restaurant}</span>
                        <span className="mx-1">•</span>
                        <span>{story.location}</span>
                      </div>
                      <div className="inline-block px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold rounded-full shadow-md">
                        {story.improvement}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics badges */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {Object.entries(story.metrics).map(([key, value], i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + i * 0.1 }}
                      viewport={{ once: true }}
                      className="px-3 py-1 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-300"
                    >
                      {value}
                    </motion.div>
                  ))}
                </div>

                {/* Hover glow effect */}
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative section-padding bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Rocket className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="text-sm font-bold">Prueba Gratis por 14 Días • Sin Tarjeta de Crédito</span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
              ¿Listo para automatizar tu restaurante?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Únete a cientos de restaurantes chilenos que ya automatizaron su operación con nuestro sistema certificado <span className="font-bold text-yellow-300">Enterprise+++++</span>
            </p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Button
                size="xl"
                className="text-lg px-10 py-6 bg-white text-primary-600 hover:bg-yellow-50 shadow-2xl shadow-black/30 hover:shadow-3xl hover:scale-105 transition-all duration-300 font-bold group"
                asChild
              >
                <Link href="/registro" className="flex items-center">
                  Pide tu Demo Gratis
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="xl"
                className="text-lg px-10 py-6 bg-transparent border-3 border-white text-white hover:bg-white hover:text-primary-600 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold group"
                asChild
              >
                <Link href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001'} className="flex items-center">
                  <PlayCircle className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Ver Demo en Vivo
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-white/80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-300" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-300" />
                <span>Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-300" />
                <span>Soporte 24/7</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">ChatBotDysa</span>
              </div>
              <p className="text-gray-400 mb-4">
                Sistema certificado Enterprise+++++ para automatizar restaurantes con inteligencia artificial.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="text-gray-900 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-900" asChild>
                  <a href="mailto:soporte@chatbotdysa.cl">
                    📧 soporte@chatbotdysa.cl
                  </a>
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#caracteristicas" className="hover:text-white transition-colors">Características</Link></li>
                <li><Link href="#planes" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001'} className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="#casos-exito" className="hover:text-white transition-colors">Casos de Éxito</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors opacity-50 cursor-not-allowed">Acerca de</Link></li>
                <li><Link href="mailto:contacto@chatbotdysa.cl" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors opacity-50 cursor-not-allowed">Carreras</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors opacity-50 cursor-not-allowed">Prensa</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="mailto:soporte@chatbotdysa.cl" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
                <li><Link href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:7001'} className="hover:text-white transition-colors">Documentación</Link></li>
                <li><Link href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005/api'}/health`} className="hover:text-white transition-colors">Estado del Sistema</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 ChatBotDysa Enterprise+++++. Todos los derechos reservados. Desarrollado por DysaDev SpA.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </>
  )
}
