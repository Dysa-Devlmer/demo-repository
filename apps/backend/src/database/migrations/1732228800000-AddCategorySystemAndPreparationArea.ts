/**
 * Migration: Add Category System and Preparation Area
 * ChatBotDysa Enterprise
 *
 * 1. Crea tabla "categories" con gestión dinámica de categorías
 * 2. Agrega campo "preparation_area" a menu_items (KITCHEN, BAR, BOTH)
 * 3. Agrega relación category_id en menu_items
 * 4. Inserta categorías iniciales (compatibilidad con ENUM legacy)
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategorySystemAndPreparationArea1732228800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear ENUM para preparation_area
    await queryRunner.query(`
      CREATE TYPE "preparation_area_enum" AS ENUM ('kitchen', 'bar', 'both')
    `);

    console.log('✅ ENUM preparation_area creado');

    // 2. Crear tabla categories
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL UNIQUE,
        "slug" VARCHAR(100) NOT NULL UNIQUE,
        "description" TEXT,
        "icon" VARCHAR(255),
        "preparation_area" preparation_area_enum NOT NULL DEFAULT 'kitchen',
        "display_order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    console.log('✅ Tabla categories creada');

    // 3. Insertar categorías iniciales (mapeo del ENUM legacy)
    await queryRunner.query(`
      INSERT INTO "categories"
        ("name", "slug", "description", "icon", "preparation_area", "display_order")
      VALUES
        ('Entradas', 'entradas', 'Aperitivos y entradas', 'utensils', 'kitchen', 1),
        ('Platos Principales', 'platos-principales', 'Platos principales del menú', 'utensils', 'kitchen', 2),
        ('Postres', 'postres', 'Postres y dulces', 'cake', 'kitchen', 3),
        ('Bebidas', 'bebidas', 'Bebidas y refrescos', 'coffee', 'bar', 4),
        ('Snacks', 'snacks', 'Bocadillos y snacks', 'cookie', 'both', 5)
    `);

    console.log('✅ Categorías iniciales insertadas');

    // 4. Agregar columna preparation_area a menu_items
    await queryRunner.query(`
      ALTER TABLE "menu_items"
      ADD COLUMN "preparation_area" preparation_area_enum DEFAULT 'kitchen'
    `);

    console.log('✅ Campo preparation_area agregado a menu_items');

    // 5. Agregar columna category_id a menu_items (relación con categories)
    await queryRunner.query(`
      ALTER TABLE "menu_items"
      ADD COLUMN "category_id" INTEGER,
      ADD CONSTRAINT "FK_menu_items_category"
        FOREIGN KEY ("category_id")
        REFERENCES "categories"("id")
        ON DELETE SET NULL
    `);

    console.log('✅ Relación category_id agregada a menu_items');

    // 6. Mapear items existentes del ENUM legacy a las nuevas categorías
    await queryRunner.query(`
      UPDATE "menu_items" m
      SET "category_id" = c.id
      FROM "categories" c
      WHERE
        (m."category" = 'appetizer' AND c."slug" = 'entradas') OR
        (m."category" = 'main_course' AND c."slug" = 'platos-principales') OR
        (m."category" = 'dessert' AND c."slug" = 'postres') OR
        (m."category" = 'beverage' AND c."slug" = 'bebidas') OR
        (m."category" = 'special' AND c."slug" = 'snacks')
    `);

    console.log('✅ Items existentes mapeados a nuevas categorías');

    // 7. Asignar preparation_area basado en categoría
    await queryRunner.query(`
      UPDATE "menu_items" m
      SET "preparation_area" = c."preparation_area"
      FROM "categories" c
      WHERE m."category_id" = c.id
    `);

    console.log('✅ Preparation areas asignadas según categoría');

    // 8. Crear índices para mejorar performance
    await queryRunner.query(`
      CREATE INDEX "IDX_categories_slug" ON "categories" ("slug");
      CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active");
      CREATE INDEX "IDX_categories_display_order" ON "categories" ("display_order");
      CREATE INDEX "IDX_menu_items_category_id" ON "menu_items" ("category_id");
      CREATE INDEX "IDX_menu_items_preparation_area" ON "menu_items" ("preparation_area");
    `);

    console.log('✅ Índices creados');

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ MIGRACIÓN COMPLETADA                                    ║
║                                                              ║
║  Sistema de categorías profesional implementado:            ║
║  • Tabla "categories" con CRUD completo                     ║
║  • Campo "preparation_area" (cocina/barra/ambas)            ║
║  • 5 categorías iniciales creadas                           ║
║  • Items existentes migrados automáticamente                ║
║  • Backward compatibility mantenida (campo "category")      ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback en orden inverso

    // 1. Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_preparation_area"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_items_category_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_display_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_slug"`);

    // 2. Eliminar columna category_id de menu_items
    await queryRunner.query(`
      ALTER TABLE "menu_items"
      DROP CONSTRAINT IF EXISTS "FK_menu_items_category",
      DROP COLUMN IF EXISTS "category_id"
    `);

    // 3. Eliminar columna preparation_area de menu_items
    await queryRunner.query(`
      ALTER TABLE "menu_items"
      DROP COLUMN IF EXISTS "preparation_area"
    `);

    // 4. Eliminar tabla categories
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);

    // 5. Eliminar ENUM preparation_area
    await queryRunner.query(`DROP TYPE IF EXISTS "preparation_area_enum"`);

    console.log('✅ Migración revertida exitosamente');
  }
}
