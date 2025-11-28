#!/usr/bin/env node

/**
 * Script para generar claves secretas seguras para producción
 * Uso: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 GENERADOR DE CLAVES SECRETAS PARA PRODUCCIÓN\n');
console.log('================================================================\n');

// Función para generar clave aleatoria
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Generar todas las claves necesarias
const secrets = {
  JWT_SECRET: generateSecret(64),
  JWT_REFRESH_SECRET: generateSecret(64),
  SESSION_SECRET: generateSecret(64),
  WHATSAPP_VERIFY_TOKEN: generateSecret(32),
  DATABASE_PASSWORD: generateSecret(24),
  REDIS_PASSWORD: generateSecret(24),
};

console.log('📋 COPIAR ESTAS CLAVES A TU ARCHIVO .env.production:\n');
console.log('================================================================\n');

for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}=${value}`);
}

console.log('\n================================================================\n');
console.log('⚠️  IMPORTANTE:');
console.log('   • Guarda estas claves en un lugar seguro');
console.log('   • NO las subas a Git');
console.log('   • Cada entorno debe tener claves únicas');
console.log('   • Si las pierdes, tendrás que regenerarlas y todos');
console.log('     los usuarios tendrán que volver a iniciar sesión\n');

// Guardar en archivo temporal (opcional)
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../.env.secrets.temp');
const envContent = Object.entries(secrets)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(outputPath, envContent, 'utf8');

console.log(`✅ Claves también guardadas en: .env.secrets.temp`);
console.log(`   (eliminar este archivo después de copiar las claves)\n`);
