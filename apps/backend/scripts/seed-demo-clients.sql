-- ============================================
-- ChatBotDysa - Demo Data Seeder
-- 3 Clientes Reales: Don Luigi, Sabores de Chile, Burger Express
-- ============================================

-- Limpiar datos previos de demo
DELETE FROM orders WHERE "customerPhone" LIKE '+569%';
DELETE FROM reservations WHERE "customerPhone" LIKE '+569%';
DELETE FROM menu_items WHERE name LIKE '%Pizza%' OR name LIKE '%Burger%' OR name LIKE '%Pastel%';
DELETE FROM customers WHERE phone LIKE '+569%';

-- ============================================
-- CLIENTE 1: PIZZERÍA DON LUIGI 🍕
-- ============================================

-- Menú de Don Luigi
INSERT INTO menu_items (name, description, price, category, dietary_type, ingredients, allergens, "preparationTime", available, "createdAt", "updatedAt")
VALUES
-- Pizzas
('Pizza Margherita', 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva', 12990, 'main_course', 'vegetarian', '["tomate","mozzarella","albahaca","aceite de oliva"]', '["gluten","lactosa"]', 15, true, NOW(), NOW()),
('Pizza Pepperoni', 'Salsa de tomate, mozzarella, pepperoni italiano premium', 14990, 'main_course', 'regular', '["tomate","mozzarella","pepperoni"]', '["gluten","lactosa"]', 15, true, NOW(), NOW()),
('Pizza 4 Quesos', 'Mozzarella, gorgonzola, parmesano y queso de cabra', 15990, 'main_course', 'vegetarian', '["mozzarella","gorgonzola","parmesano","queso de cabra"]', '["gluten","lactosa"]', 18, true, NOW(), NOW()),
('Pizza Prosciutto e Funghi', 'Jamón serrano, champiñones frescos, mozzarella', 16990, 'main_course', 'regular', '["jamón serrano","champiñones","mozzarella"]', '["gluten","lactosa"]', 18, true, NOW(), NOW()),
('Pizza Vegetariana', 'Pimientos, champiñones, aceitunas, cebolla, tomate', 13990, 'main_course', 'vegan', '["pimientos","champiñones","aceitunas","cebolla","tomate"]', '["gluten"]', 15, true, NOW(), NOW()),

-- Entradas
('Bruschetta Italiana', 'Pan tostado con tomate fresco, ajo, albahaca y aceite de oliva', 5990, 'appetizer', 'vegetarian', '["pan","tomate","ajo","albahaca"]', '["gluten"]', 8, true, NOW(), NOW()),
('Focaccia al Rosmarino', 'Pan italiano con romero y aceite de oliva extra virgen', 4990, 'appetizer', 'vegan', '["harina","romero","aceite de oliva"]', '["gluten"]', 10, true, NOW(), NOW()),
('Antipasto Misto', 'Selección de embutidos italianos y quesos', 8990, 'appetizer', 'regular', '["salami","prosciutto","quesos","aceitunas"]', '["gluten","lactosa"]', 5, true, NOW(), NOW()),

-- Pastas
('Lasagna Bolognese', 'Capas de pasta con ragú de carne y bechamel', 11990, 'main_course', 'regular', '["pasta","carne molida","tomate","bechamel"]', '["gluten","lactosa","huevo"]', 25, true, NOW(), NOW()),
('Spaghetti Carbonara', 'Panceta, huevo, pecorino romano y pimienta negra', 10990, 'main_course', 'regular', '["pasta","panceta","huevo","pecorino"]', '["gluten","lactosa","huevo"]', 12, true, NOW(), NOW()),

-- Postres
('Tiramisú Casero', 'Bizcocho, café, mascarpone y cacao', 6990, 'dessert', 'vegetarian', '["bizcocho","café","mascarpone","cacao"]', '["gluten","lactosa","huevo"]', 5, true, NOW(), NOW()),
('Panna Cotta', 'Crema de vainilla con coulis de frutos rojos', 5990, 'dessert', 'vegetarian', '["crema","vainilla","frutos rojos"]', '["lactosa"]', 5, true, NOW(), NOW()),

-- Bebidas
('Coca Cola 350ml', 'Refresco', 1990, 'beverage', 'regular', '[]', '[]', 1, true, NOW(), NOW()),
('Agua Mineral 500ml', 'Agua sin gas', 1500, 'beverage', 'regular', '[]', '[]', 1, true, NOW(), NOW()),
('Vino Tinto Copa', 'Vino reserva chileno', 3990, 'beverage', 'regular', '[]', '[]', 2, true, NOW(), NOW());

-- Clientes de Don Luigi
INSERT INTO customers (name, email, phone, "whatsappPhone", source, address, preferences, "createdAt", "updatedAt")
VALUES
('María González', 'maria.gonzalez@email.com', '+56987654321', '+56987654321', 'web_widget', 'Av. Providencia 1234, Santiago',
 '{"dietary_restrictions": [], "favorite_dishes": ["Pizza Margherita"], "preferred_contact_method": "whatsapp", "language": "es"}',
 NOW() - INTERVAL '30 days', NOW()),

('Carlos Ramírez', 'carlos.r@gmail.com', '+56912345678', '+56912345678', 'whatsapp', 'Los Leones 456, Providencia',
 '{"dietary_restrictions": [], "favorite_dishes": ["Pizza Pepperoni", "Tiramisú"], "preferred_contact_method": "whatsapp", "language": "es"}',
 NOW() - INTERVAL '45 days', NOW()),

('Sofía Pérez', 'sofia.perez@hotmail.com', '+56923456789', '+56923456789', 'web_widget', 'Las Condes 789, Santiago',
 '{"dietary_restrictions": ["vegetarian"], "favorite_dishes": ["Pizza 4 Quesos", "Pizza Vegetariana"], "preferred_contact_method": "email", "language": "es"}',
 NOW() - INTERVAL '20 days', NOW());

-- Pedidos de Don Luigi (últimos 7 días)
INSERT INTO orders ("orderNumber", "customerName", "customerPhone", "customerEmail", "orderType", status, items, subtotal, tax, tip, total, "deliveryAddress", notes, "paymentStatus", "whatsappNotified", "emailNotified", "createdAt", "updatedAt")
VALUES
-- Pedido 1: María González - Ayer
('DL-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-001', 'María González', '+56987654321', 'maria.gonzalez@email.com', 'delivery', 'delivered',
 '[{"item":"Pizza Margherita","quantity":2,"price":12990},{"item":"Coca Cola 350ml","quantity":2,"price":1990}]',
 29960, 5693, 2000, 37653, 'Av. Providencia 1234, Santiago', 'Sin cebolla por favor', 'paid', true, true,
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Pedido 2: Carlos Ramírez - Hace 3 días
('DL-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-002', 'Carlos Ramírez', '+56912345678', 'carlos.r@gmail.com', 'delivery', 'delivered',
 '[{"item":"Pizza Pepperoni","quantity":1,"price":14990},{"item":"Tiramisú Casero","quantity":1,"price":6990},{"item":"Vino Tinto Copa","quantity":1,"price":3990}]',
 25970, 4934, 3000, 33904, 'Los Leones 456, Providencia', 'Extra pepperoni', 'paid', true, true,
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Pedido 3: Sofía Pérez - Hace 2 días
('DL-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDD') || '-003', 'Sofía Pérez', '+56923456789', 'sofia.perez@hotmail.com', 'takeaway', 'completed',
 '[{"item":"Pizza 4 Quesos","quantity":1,"price":15990},{"item":"Bruschetta Italiana","quantity":1,"price":5990}]',
 21980, 4176, 0, 26156, NULL, 'Para retirar a las 20:00', 'paid', true, true,
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Pedido 4: Cliente nuevo - Hoy
('DL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-004', 'Ana Torres', '+56934567890', 'ana.torres@email.com', 'delivery', 'preparing',
 '[{"item":"Pizza Prosciutto e Funghi","quantity":2,"price":16990},{"item":"Antipasto Misto","quantity":1,"price":8990},{"item":"Agua Mineral 500ml","quantity":2,"price":1500}]',
 45470, 8639, 2500, 56609, 'Vitacura 1111, Santiago', 'Favor tocar timbre 302', 'paid', true, false,
 NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '5 minutes');

-- Reservas de Don Luigi (próximos 7 días)
INSERT INTO reservations ("reservation_code", "customerName", "customerPhone", "customerEmail", "partySize", status, "reservationDate", notes, "specialRequests", "createdAt", "updatedAt")
VALUES
('RES-DL-001', 'María González', '+56987654321', 'maria.gonzalez@email.com', 4, 'confirmed',
 NOW() + INTERVAL '2 days' + INTERVAL '19 hours', 'Celebración cumpleaños', '{"highchair": false, "outdoor": false, "quiet_area": true}',
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('RES-DL-002', 'Pedro Martínez', '+56945678901', 'pedro.m@gmail.com', 6, 'confirmed',
 NOW() + INTERVAL '4 days' + INTERVAL '20 hours', 'Cena de negocios', '{"private_area": true, "wine_menu": true}',
 NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

('RES-DL-003', 'Laura Sánchez', '+56956789012', 'laura.sanchez@email.com', 2, 'pending',
 NOW() + INTERVAL '1 day' + INTERVAL '21 hours', 'Cena romántica', '{"window_table": true, "candles": true}',
 NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');


-- ============================================
-- CLIENTE 2: SABORES DE CHILE 🇨🇱
-- ============================================

-- Menú de Sabores de Chile
INSERT INTO menu_items (name, description, price, category, dietary_type, ingredients, allergens, "preparationTime", available, "createdAt", "updatedAt")
VALUES
-- Platos principales
('Pastel de Choclo', 'Tradicional pastel chileno con carne, pollo y choclo gratinado', 9990, 'main_course', 'regular', '["choclo","carne","pollo","pasas","aceitunas"]', '["lactosa"]', 30, true, NOW(), NOW()),
('Cazuela de Vacuno', 'Cazuela tradicional con carne, zapallo, choclo y papas', 11990, 'main_course', 'regular', '["carne","zapallo","choclo","papas","arroz"]', '[]', 35, true, NOW(), NOW()),
('Porotos Granados', 'Porotos con mazamorra, zapallo y albahaca fresca', 8990, 'main_course', 'vegan', '["porotos","zapallo","choclo","albahaca"]', '[]', 25, true, NOW(), NOW()),
('Charquicán', 'Guiso de charqui con papas, zapallo y verduras', 10990, 'main_course', 'regular', '["charqui","papas","zapallo","arvejas","zanahoria"]', '[]', 28, true, NOW(), NOW()),
('Curanto Express', 'Mariscos, carnes y papas al vapor estilo Chiloé', 18990, 'main_course', 'regular', '["mariscos","chorizo","papas","milcao"]', '["mariscos"]', 40, true, NOW(), NOW()),

-- Entradas
('Empanadas de Pino (3 unidades)', 'Empanadas tradicionales con carne, cebolla, pasas y aceitunas', 7990, 'appetizer', 'regular', '["carne molida","cebolla","pasas","aceitunas","huevo"]', '["gluten","huevo"]', 20, true, NOW(), NOW()),
('Empanadas de Queso (3 unidades)', 'Empanadas rellenas de queso derretido', 6990, 'appetizer', 'vegetarian', '["queso","masa"]', '["gluten","lactosa"]', 15, true, NOW(), NOW()),
('Sopaipillas con Pebre', 'Sopaipillas caseras acompañadas de pebre picante', 4990, 'appetizer', 'vegan', '["zapallo","harina","pebre"]', '["gluten"]', 10, true, NOW(), NOW()),
('Pebre Chileno', 'Salsa fresca de tomate, cebolla, cilantro y ají', 2990, 'appetizer', 'vegan', '["tomate","cebolla","cilantro","ají"]', '[]', 5, true, NOW(), NOW()),

-- Completos y Sándwiches
('Completo Italiano', 'Vienesa con tomate, palta y mayonesa', 5990, 'main_course', 'regular', '["vienesa","pan","tomate","palta","mayonesa"]', '["gluten","huevo"]', 8, true, NOW(), NOW()),
('Completo Dinámico', 'Vienesa con chucrut, tomate y mayonesa picante', 5990, 'main_course', 'regular', '["vienesa","pan","chucrut","tomate","mayonesa"]', '["gluten","huevo"]', 8, true, NOW(), NOW()),
('Chacarero', 'Carne mechada con porotos verdes, tomate y ají verde', 8990, 'main_course', 'regular', '["carne","porotos verdes","tomate","ají verde"]', '["gluten"]', 12, true, NOW(), NOW()),

-- Postres
('Mote con Huesillos', 'Bebida tradicional chilena de mote y duraznos deshidratados', 3990, 'dessert', 'vegan', '["mote","huesillos","canela"]', '[]', 5, true, NOW(), NOW()),
('Leche Asada', 'Postre tradicional de leche y caramelo', 4990, 'dessert', 'vegetarian', '["leche","azúcar","huevos","vainilla"]', '["lactosa","huevo"]', 5, true, NOW(), NOW()),

-- Bebidas
('Chicha de Manzana', 'Bebida tradicional chilena', 2990, 'beverage', 'vegan', '["manzana"]', '[]', 2, true, NOW(), NOW()),
('Mote con Huesillos (bebida)', 'Tradicional bebida chilena', 3990, 'beverage', 'vegan', '["mote","huesillos"]', '[]', 3, true, NOW(), NOW());

-- Clientes de Sabores de Chile
INSERT INTO customers (name, email, phone, "whatsappPhone", source, address, preferences, "createdAt", "updatedAt")
VALUES
('Juan Muñoz', 'juan.munoz@email.com', '+56967890123', '+56967890123', 'whatsapp', 'San Diego 2345, Santiago Centro',
 '{"dietary_restrictions": [], "favorite_dishes": ["Pastel de Choclo", "Empanadas de Pino"], "preferred_contact_method": "whatsapp", "language": "es"}',
 NOW() - INTERVAL '60 days', NOW()),

('Daniela Flores', 'dani.flores@gmail.com', '+56978901234', '+56978901234', 'web_widget', 'Recoleta 567, Recoleta',
 '{"dietary_restrictions": ["vegan"], "favorite_dishes": ["Porotos Granados", "Sopaipillas con Pebre"], "preferred_contact_method": "whatsapp", "language": "es"}',
 NOW() - INTERVAL '25 days', NOW());

-- Pedidos de Sabores de Chile
INSERT INTO orders ("orderNumber", "customerName", "customerPhone", "customerEmail", "orderType", status, items, subtotal, tax, tip, total, "deliveryAddress", notes, "paymentStatus", "whatsappNotified", "emailNotified", "createdAt", "updatedAt")
VALUES
('SC-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-001', 'Juan Muñoz', '+56967890123', 'juan.munoz@email.com', 'delivery', 'delivered',
 '[{"item":"Pastel de Choclo","quantity":2,"price":9990},{"item":"Empanadas de Pino (3 unidades)","quantity":1,"price":7990}]',
 27970, 5314, 2000, 35284, 'San Diego 2345, Santiago Centro', 'Bien caliente por favor', 'paid', true, true,
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('SC-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-002', 'Daniela Flores', '+56978901234', 'dani.flores@gmail.com', 'takeaway', 'completed',
 '[{"item":"Porotos Granados","quantity":1,"price":8990},{"item":"Sopaipillas con Pebre","quantity":1,"price":4990}]',
 13980, 2656, 0, 16636, NULL, 'Sin ingredientes de origen animal', 'paid', true, true,
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('SC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-003', 'Roberto Silva', '+56989012345', 'roberto.silva@email.com', 'delivery', 'confirmed',
 '[{"item":"Cazuela de Vacuno","quantity":2,"price":11990},{"item":"Mote con Huesillos","quantity":2,"price":3990}]',
 31960, 6072, 3000, 41032, 'Independencia 890, Santiago', 'Tocar timbre', 'paid', true, false,
 NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '5 minutes');

-- Reservas de Sabores de Chile
INSERT INTO reservations ("reservation_code", "customerName", "customerPhone", "customerEmail", "partySize", status, "reservationDate", notes, "specialRequests", "createdAt", "updatedAt")
VALUES
('RES-SC-001', 'Juan Muñoz', '+56967890123', 'juan.munoz@email.com', 8, 'confirmed',
 NOW() + INTERVAL '3 days' + INTERVAL '13 hours', 'Almuerzo familiar domingo', '{"traditional_music": true, "outdoor": true}',
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');


-- ============================================
-- CLIENTE 3: BURGER EXPRESS 🍔
-- ============================================

-- Menú de Burger Express
INSERT INTO menu_items (name, description, price, category, dietary_type, ingredients, allergens, "preparationTime", available, "createdAt", "updatedAt")
VALUES
-- Hamburguesas
('Burger Clásica', 'Carne 180g, lechuga, tomate, cebolla, pepinillo y salsa especial', 8990, 'main_course', 'regular', '["carne","lechuga","tomate","cebolla","pepinillo","pan"]', '["gluten","huevo"]', 10, true, NOW(), NOW()),
('Burger Doble Queso', 'Doble carne 180g, doble queso cheddar, cebolla caramelizada', 11990, 'main_course', 'regular', '["carne","queso cheddar","cebolla","pan"]', '["gluten","lactosa","huevo"]', 12, true, NOW(), NOW()),
('Burger BBQ Bacon', 'Carne 180g, bacon ahumado, queso, cebolla crispy, salsa BBQ', 13990, 'main_course', 'regular', '["carne","bacon","queso","cebolla","salsa BBQ","pan"]', '["gluten","lactosa","huevo"]', 13, true, NOW(), NOW()),
('Burger Veggie', 'Hamburguesa de lentejas y quinoa, palta, lechuga, tomate', 9990, 'main_course', 'vegan', '["lentejas","quinoa","palta","lechuga","tomate","pan integral"]', '["gluten"]', 12, true, NOW(), NOW()),
('Burger Jalapeño', 'Carne 180g, queso pepper jack, jalapeños, guacamole picante', 12990, 'main_course', 'regular', '["carne","queso pepper jack","jalapeños","guacamole","pan"]', '["gluten","lactosa","huevo"]', 12, true, NOW(), NOW()),

-- Acompañamientos
('Papas Fritas', 'Papas corte americano con sal de mar', 3990, 'appetizer', 'vegan', '["papas","sal"]', '[]', 8, true, NOW(), NOW()),
('Papas con Cheddar y Bacon', 'Papas fritas con queso cheddar fundido y bacon', 6990, 'appetizer', 'regular', '["papas","queso cheddar","bacon"]', '["lactosa"]', 10, true, NOW(), NOW()),
('Aros de Cebolla', 'Aros de cebolla empanizados crujientes (8 unidades)', 5990, 'appetizer', 'vegetarian', '["cebolla","pan rallado"]', '["gluten","huevo"]', 8, true, NOW(), NOW()),
('Nuggets de Pollo (10 unidades)', 'Nuggets de pechuga de pollo con salsas', 6990, 'appetizer', 'regular', '["pollo","pan rallado"]', '["gluten"]', 10, true, NOW(), NOW()),

-- Combos
('Combo Burger Clásica', 'Burger Clásica + Papas Fritas + Bebida', 11990, 'special', 'regular', '["burger clásica","papas","bebida"]', '["gluten","huevo"]', 10, true, NOW(), NOW()),
('Combo Burger Doble Queso', 'Burger Doble Queso + Papas Fritas + Bebida', 14990, 'special', 'regular', '["burger doble queso","papas","bebida"]', '["gluten","lactosa","huevo"]', 12, true, NOW(), NOW()),

-- Postres
('Milkshake Chocolate', 'Batido de helado de chocolate', 4990, 'dessert', 'vegetarian', '["helado","leche","chocolate"]', '["lactosa"]', 5, true, NOW(), NOW()),
('Milkshake Frutilla', 'Batido de helado de frutilla', 4990, 'dessert', 'vegetarian', '["helado","leche","frutilla"]', '["lactosa"]', 5, true, NOW(), NOW()),
('Brownie con Helado', 'Brownie de chocolate caliente con helado de vainilla', 5990, 'dessert', 'vegetarian', '["brownie","helado","chocolate"]', '["gluten","lactosa","huevo"]', 8, true, NOW(), NOW()),

-- Bebidas
('Coca Cola 500ml', 'Refresco', 2490, 'beverage', 'regular', '[]', '[]', 1, true, NOW(), NOW()),
('Sprite 500ml', 'Refresco', 2490, 'beverage', 'regular', '[]', '[]', 1, true, NOW(), NOW()),
('Fanta 500ml', 'Refresco', 2490, 'beverage', 'regular', '[]', '[]', 1, true, NOW(), NOW());

-- Clientes de Burger Express
INSERT INTO customers (name, email, phone, "whatsappPhone", source, address, preferences, "createdAt", "updatedAt")
VALUES
('Andrés Castro', 'andres.castro@email.com', '+56990123456', '+56990123456', 'web_widget', 'Las Rejas 123, Estación Central',
 '{"dietary_restrictions": [], "favorite_dishes": ["Burger BBQ Bacon", "Papas con Cheddar y Bacon"], "preferred_contact_method": "whatsapp", "language": "es"}',
 NOW() - INTERVAL '20 days', NOW()),

('Valentina Rojas', 'vale.rojas@gmail.com', '+56901234567', '+56901234567', 'whatsapp', 'Maipú 456, Maipú',
 '{"dietary_restrictions": ["vegan"], "favorite_dishes": ["Burger Veggie"], "preferred_contact_method": "whatsapp", "language": "es"}',
 NOW() - INTERVAL '10 days', NOW());

-- Pedidos de Burger Express
INSERT INTO orders ("orderNumber", "customerName", "customerPhone", "customerEmail", "orderType", status, items, subtotal, tax, tip, total, "deliveryAddress", notes, "paymentStatus", "whatsappNotified", "emailNotified", "createdAt", "updatedAt")
VALUES
('BE-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-001', 'Andrés Castro', '+56990123456', 'andres.castro@email.com', 'delivery', 'delivered',
 '[{"item":"Burger BBQ Bacon","quantity":2,"price":13990},{"item":"Papas con Cheddar y Bacon","quantity":1,"price":6990},{"item":"Coca Cola 500ml","quantity":2,"price":2490}]',
 39960, 7592, 2500, 50052, 'Las Rejas 123, Estación Central', 'Extra bacon en las burgers', 'paid', true, true,
 NOW() - INTERVAL '1 day' - INTERVAL '19 hours', NOW() - INTERVAL '1 day' - INTERVAL '18 hours'),

('BE-' || TO_CHAR(NOW() - INTERVAL '2 days', 'YYYYMMDD') || '-002', 'Valentina Rojas', '+56901234567', 'vale.rojas@gmail.com', 'takeaway', 'completed',
 '[{"item":"Burger Veggie","quantity":1,"price":9990},{"item":"Papas Fritas","quantity":1,"price":3990}]',
 13980, 2656, 0, 16636, NULL, 'Sin salsas con lácteos', 'paid', true, true,
 NOW() - INTERVAL '2 days' - INTERVAL '13 hours', NOW() - INTERVAL '2 days' - INTERVAL '12 hours'),

('BE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-003', 'Diego Vargas', '+56912345098', 'diego.vargas@email.com', 'delivery', 'preparing',
 '[{"item":"Combo Burger Doble Queso","quantity":2,"price":14990},{"item":"Nuggets de Pollo (10 unidades)","quantity":1,"price":6990}]',
 36970, 7024, 3000, 46994, 'Pudahuel 789, Pudahuel', 'Llamar al llegar', 'paid', true, false,
 NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '10 minutes'),

('BE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-004', 'Camila Núñez', '+56923456109', 'camila.nunez@email.com', 'dine_in', 'confirmed',
 '[{"item":"Burger Jalapeño","quantity":1,"price":12990},{"item":"Milkshake Chocolate","quantity":1,"price":4990}]',
 17980, 3416, 0, 21396, NULL, 'Mesa para 2 personas', 'paid', false, false,
 NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes');

-- Reservas de Burger Express
INSERT INTO reservations ("reservation_code", "customerName", "customerPhone", "customerEmail", "partySize", status, "reservationDate", notes, "specialRequests", "createdAt", "updatedAt")
VALUES
('RES-BE-001', 'Andrés Castro', '+56990123456', 'andres.castro@email.com', 10, 'confirmed',
 NOW() + INTERVAL '5 days' + INTERVAL '18 hours', 'Cumpleaños de mi hijo', '{"kids_menu": true, "decorations": true, "private_area": true}',
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');


-- ============================================
-- ESTADÍSTICAS Y VERIFICACIÓN
-- ============================================

-- Mostrar resumen de datos insertados
SELECT
  'Menu Items' as tipo,
  COUNT(*) as total
FROM menu_items
WHERE name LIKE '%Pizza%' OR name LIKE '%Burger%' OR name LIKE '%Pastel%'
UNION ALL
SELECT
  'Customers' as tipo,
  COUNT(*) as total
FROM customers
WHERE phone LIKE '+569%'
UNION ALL
SELECT
  'Orders' as tipo,
  COUNT(*) as total
FROM orders
WHERE "customerPhone" LIKE '+569%'
UNION ALL
SELECT
  'Reservations' as tipo,
  COUNT(*) as total
FROM reservations
WHERE "customerPhone" LIKE '+569%';

-- Mensaje final
SELECT
  '✅ SEED DATA COMPLETADO EXITOSAMENTE' as mensaje,
  NOW() as timestamp,
  '3 Restaurantes: Don Luigi (Pizzería), Sabores de Chile (Comida Chilena), Burger Express (Hamburguesas)' as detalles;
