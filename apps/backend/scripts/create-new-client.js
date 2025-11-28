#!/usr/bin/env node

/**
 * Script de Creación de Cliente Nuevo
 * Uso: node create-new-client.js --name "Don Luigi" --email "admin@donluigi.cl" --phone "+56912345678"
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 15432,
  database: process.env.DB_NAME || 'chatbotdysa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'supersecret',
};

// Parse argumentos de línea de comando
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : null;
};

const restaurantName = getArg('--name');
const email = getArg('--email');
const phone = getArg('--phone');
const rut = getArg('--rut');
const plan = getArg('--plan') || 'enterprise';

// Validaciones
if (!restaurantName || !email || !phone) {
  console.error('❌ Faltan parámetros requeridos');
  console.log('\nUso:');
  console.log('  node create-new-client.js \\');
  console.log('    --name "Don Luigi" \\');
  console.log('    --email "admin@donluigi.cl" \\');
  console.log('    --phone "+56912345678" \\');
  console.log('    --rut "76.123.456-7" \\');
  console.log('    --plan "enterprise"');
  process.exit(1);
}

// Función para generar slug único
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Función para generar contraseña aleatoria
function generatePassword() {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Función principal
async function createClient() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Generar datos
    const slug = generateSlug(restaurantName);
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('📝 Creando cliente nuevo...');
    console.log(`   Restaurante: ${restaurantName}`);
    console.log(`   Slug: ${slug}`);
    console.log(`   Email: ${email}`);
    console.log(`   Teléfono: ${phone}`);
    console.log(`   RUT: ${rut || 'N/A'}`);
    console.log(`   Plan: ${plan}\n`);

    // Transacción
    await client.query('BEGIN');

    // 1. Verificar si ya existe
    const existingCheck = await client.query(
      'SELECT id FROM restaurants WHERE slug = $1 OR email = $2',
      [slug, email]
    );

    if (existingCheck.rows.length > 0) {
      throw new Error(`Ya existe un restaurante con slug "${slug}" o email "${email}"`);
    }

    // 2. Crear restaurante
    const restaurantResult = await client.query(
      `INSERT INTO restaurants (
        name, slug, rut, email, phone, plan, status,
        monthly_price, bot_settings, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id`,
      [
        restaurantName,
        slug,
        rut,
        email,
        phone,
        plan,
        'active',
        99990,
        JSON.stringify({
          bot: {
            name: `${restaurantName} Bot`,
            greeting: `¡Hola! Bienvenido a ${restaurantName}. ¿En qué puedo ayudarte hoy?`,
            tone: 'friendly',
            language: 'es-CL',
          },
        }),
      ]
    );

    const restaurantId = restaurantResult.rows[0].id;
    console.log(`✅ Restaurante creado (ID: ${restaurantId})`);

    // 3. Crear usuario administrador
    const userResult = await client.query(
      `INSERT INTO users (
        email, password, "firstName", "lastName", role, status,
        restaurant_id, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id`,
      [
        email,
        hashedPassword,
        restaurantName.split(' ')[0], // Primer palabra como firstName
        'Admin',
        'admin',
        'active',
        restaurantId,
      ]
    );

    const userId = userResult.rows[0].id;
    console.log(`✅ Usuario administrador creado (ID: ${userId})`);

    // 4. Asignar permisos completos
    await client.query(
      `INSERT INTO user_permissions (user_id, permission)
       VALUES
         ($1, 'menu.read'), ($1, 'menu.write'),
         ($1, 'orders.read'), ($1, 'orders.write'),
         ($1, 'reservations.read'), ($1, 'reservations.write'),
         ($1, 'customers.read'), ($1, 'customers.write'),
         ($1, 'analytics.read'), ($1, 'settings.read'), ($1, 'settings.write')`,
      [userId]
    );

    console.log(`✅ Permisos asignados`);

    await client.query('COMMIT');
    console.log('\n✅ Cliente creado exitosamente\n');

    // Mostrar información de acceso
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 INFORMACIÓN DE ACCESO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n🏢 Restaurante: ${restaurantName}`);
    console.log(`🆔 ID: ${restaurantId}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${password}`);
    console.log(`\n🌐 URLs:`);
    console.log(`   Admin Panel: http://localhost:7001/login`);
    console.log(`   API: http://localhost:8005/api`);
    console.log(`\n⚠️  IMPORTANTE: Guarda la contraseña de forma segura`);
    console.log(`   El cliente debe cambiarla en su primer login\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Generar email de bienvenida
    console.log('📧 Email de bienvenida:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`
Para: ${email}
Asunto: ¡Bienvenido a ChatBotDysa! 🎉

Hola ${restaurantName},

¡Felicidades por unirte a ChatBotDysa Enterprise+++++!

Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso:

📧 Email: ${email}
🔑 Contraseña temporal: ${password}

🌐 Accede al Admin Panel:
   http://localhost:7001/login

IMPORTANTE: Por seguridad, cambia tu contraseña en el primer login.

Próximos pasos:
1. Completa el formulario de onboarding: [link]
2. Agenda tu sesión de capacitación: [link]
3. Carga tu menú inicial

¿Dudas? Contáctanos:
📱 WhatsApp: +56 9 XXXX XXXX
📧 Email: soporte@chatbotdysa.cl

¡Éxito con tu automatización! 🚀

Equipo ChatBotDysa
    `);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Guardar credenciales en archivo
    const fs = require('fs');
    const credentialsFile = `./client-${slug}-credentials.txt`;
    fs.writeFileSync(
      credentialsFile,
      `Restaurante: ${restaurantName}\nID: ${restaurantId}\nEmail: ${email}\nPassword: ${password}\nCreated: ${new Date().toISOString()}\n`
    );
    console.log(`💾 Credenciales guardadas en: ${credentialsFile}\n`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar
createClient();
