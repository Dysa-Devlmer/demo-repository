#!/bin/bash

# ================================
# Script de Testing - Mercado Pago
# ================================
#
# Este script facilita el testing del sistema de pagos
# con Mercado Pago en modo TEST.
#
# Uso:
#   chmod +x scripts/test-mercadopago.sh
#   ./scripts/test-mercadopago.sh health
#   ./scripts/test-mercadopago.sh create-preference
#   ./scripts/test-mercadopago.sh webhook
#
# ================================

set -e

API_URL="${API_URL:-http://localhost:8000}"
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo ""
    echo -e "${COLOR_BLUE}================================${COLOR_NC}"
    echo -e "${COLOR_BLUE}$1${COLOR_NC}"
    echo -e "${COLOR_BLUE}================================${COLOR_NC}"
    echo ""
}

print_success() {
    echo -e "${COLOR_GREEN}✅ $1${COLOR_NC}"
}

print_error() {
    echo -e "${COLOR_RED}❌ $1${COLOR_NC}"
}

print_info() {
    echo -e "${COLOR_YELLOW}ℹ️  $1${COLOR_NC}"
}

# Test 1: Health Check
test_health() {
    print_header "TEST 1: Health Check"

    print_info "Verificando configuración de Mercado Pago..."

    response=$(curl -s "${API_URL}/payments/health")
    echo "$response" | jq .

    status=$(echo "$response" | jq -r '.data.status')

    if [ "$status" = "ok" ]; then
        print_success "Mercado Pago configurado correctamente"
    else
        print_error "Mercado Pago NO está configurado"
        print_info "Asegúrate de tener MERCADOPAGO_ACCESS_TOKEN en .env"
        exit 1
    fi
}

# Test 2: Crear Preferencia
test_create_preference() {
    print_header "TEST 2: Crear Preferencia de Pago"

    print_info "Creando preferencia para plan SaaS Multi-Tenant..."

    payload='{
      "email": "test@test.com",
      "firstName": "Juan",
      "lastName": "Pérez Test",
      "rut": "12345678-9",
      "companyName": "Test SpA",
      "planId": "saas-multi",
      "planName": "SaaS Multi-Tenant",
      "billingPeriod": "monthly",
      "amount": 49995,
      "phone": "+56912345678"
    }'

    response=$(curl -s -X POST "${API_URL}/payments/create-preference" \
      -H "Content-Type: application/json" \
      -d "$payload")

    echo "$response" | jq .

    success=$(echo "$response" | jq -r '.success')
    init_point=$(echo "$response" | jq -r '.data.initPoint')

    if [ "$success" = "true" ] && [ "$init_point" != "null" ]; then
        print_success "Preferencia creada exitosamente"
        print_info "URL de checkout: $init_point"
        echo ""
        print_info "Abre esta URL en tu navegador para completar el pago de prueba:"
        echo -e "${COLOR_YELLOW}$init_point${COLOR_NC}"
    else
        print_error "Error al crear preferencia"
        exit 1
    fi
}

# Test 3: Simular Webhook
test_webhook() {
    print_header "TEST 3: Webhook de Pago Aprobado"

    print_info "Simulando webhook de Mercado Pago..."

    # Nota: Este es un payload simulado
    # En producción, Mercado Pago envía el webhook real
    payload='{
      "action": "payment.updated",
      "type": "payment",
      "data": {
        "id": "1234567890"
      },
      "date_created": 1696262400000
    }'

    print_info "Nota: Para probar webhooks reales necesitas:"
    print_info "1. Un pago real en Mercado Pago"
    print_info "2. Configurar webhook URL en panel de MP"
    print_info "3. Usar ngrok para exponer localhost"

    echo ""
    print_info "Enviando webhook simulado..."

    response=$(curl -s -X POST "${API_URL}/payments/webhook" \
      -H "Content-Type: application/json" \
      -d "$payload")

    echo "$response" | jq .

    success=$(echo "$response" | jq -r '.success')

    if [ "$success" = "true" ]; then
        print_success "Webhook procesado correctamente"
    else
        print_error "Error al procesar webhook"
    fi
}

# Test 4: Obtener Pricing
test_pricing() {
    print_header "TEST 4: Obtener Precios de Planes"

    print_info "Consultando precios de planes..."

    response=$(curl -s "${API_URL}/payments/pricing")
    echo "$response" | jq .

    print_success "Precios obtenidos correctamente"
}

# Test 5: Flujo Completo
test_full_flow() {
    print_header "TEST 5: Flujo Completo"

    print_info "Ejecutando flujo completo de prueba..."

    echo ""
    test_health

    echo ""
    test_pricing

    echo ""
    test_create_preference

    echo ""
    print_header "Instrucciones para completar el flujo"
    print_info "1. Abre la URL de checkout en tu navegador"
    print_info "2. Usa una tarjeta de prueba:"
    print_info "   • Número: 4170 0688 1010 8020"
    print_info "   • CVV: 123"
    print_info "   • Vencimiento: 11/25"
    print_info "   • Nombre: Test User"
    print_info "3. Completa el pago"
    print_info "4. Verifica que recibes el webhook"
    print_info "5. Verifica que el usuario se activa en la BD"
}

# Test 6: Consultar Pago
test_get_payment() {
    print_header "TEST 6: Consultar Pago"

    if [ -z "$1" ]; then
        print_error "Debes proporcionar un ID de pago"
        print_info "Uso: ./test-mercadopago.sh get-payment <payment_id>"
        exit 1
    fi

    payment_id="$1"

    print_info "Consultando pago: $payment_id"

    response=$(curl -s "${API_URL}/payments/${payment_id}")
    echo "$response" | jq .

    success=$(echo "$response" | jq -r '.success')

    if [ "$success" = "true" ]; then
        print_success "Pago consultado correctamente"
    else
        print_error "Error al consultar pago"
    fi
}

# Main
main() {
    if [ $# -eq 0 ]; then
        echo "Uso: $0 <comando>"
        echo ""
        echo "Comandos disponibles:"
        echo "  health              - Verificar configuración de MP"
        echo "  create-preference   - Crear preferencia de pago"
        echo "  webhook             - Simular webhook de MP"
        echo "  pricing             - Obtener precios de planes"
        echo "  get-payment <id>    - Consultar un pago específico"
        echo "  full                - Ejecutar flujo completo"
        echo ""
        echo "Ejemplos:"
        echo "  $0 health"
        echo "  $0 create-preference"
        echo "  $0 get-payment 1234567890"
        echo "  $0 full"
        exit 1
    fi

    command="$1"
    shift

    case "$command" in
        health)
            test_health
            ;;
        create-preference)
            test_create_preference
            ;;
        webhook)
            test_webhook
            ;;
        pricing)
            test_pricing
            ;;
        get-payment)
            test_get_payment "$@"
            ;;
        full)
            test_full_flow
            ;;
        *)
            print_error "Comando desconocido: $command"
            exit 1
            ;;
    esac
}

main "$@"
