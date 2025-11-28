const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const { join } = require('path');

dotenv.config({ path: './.env' });

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  entities: [
    join(__dirname, '/src/entities/*.{ts,js}'),  // 🔥 ahora apunta bien
  ],
  migrations: [
    join(__dirname, '/src/migrations/*.{ts,js}')
  ],
  synchronize: false,
});
