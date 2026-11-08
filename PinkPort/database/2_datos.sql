-- =============================================
-- PinkPort - Datos de ejemplo
-- Ejecutar DESPUÉS de 1_tablas.sql
-- =============================================

insert into categoria (nombre, descripcion) values
  ('Skincare',   'Cuidado de la piel: sérums, cremas y limpiadores'),
  ('Maquillaje', 'Paletas, labiales, rubores y brochas'),
  ('Cabello',    'Herramientas y productos para el cabello'),
  ('Moda',       'Ropa y accesorios'),
  ('Hogar',      'Velas, decoración y aromas para la casa'),
  ('Ofertas',    'Sets y productos con precio especial');

insert into producto (id_categoria, nombre, marca, precio, stock, imagen_url) values
  (1, 'Sérum iluminador de vitamina C', 'Auréa',      149900, 25, '/img/prod-serum.jpg'),
  (2, 'Paleta de sombras Rosé Edit',    'Nuvé',       189900, 18, '/img/prod-paleta.jpg'),
  (3, 'Estilizador AirSilk 5 en 1',     'Lumière',    729900, 10, '/img/prod-estilizador.jpg'),
  (5, 'Vela aromática Flor de Higo',    'Cora Home',  119900, 30, '/img/prod-vela.jpg'),
  (1, 'Set de cuidado facial Glow',     'Auréa',      219900, 15, '/img/cat-skincare.jpg'),
  (2, 'Kit de labiales Berry Kiss',     'Nuvé',       159900, 20, '/img/cat-maquillaje.jpg'),
  (3, 'Plancha alisadora Silk Pro',     'Lumière',    459900, 12, '/img/cat-cabello.jpg'),
  (4, 'Blusa de satín y bolso mini',    'Maison Rose',329900,  8, '/img/cat-moda.jpg'),
  (5, 'Jarrón de cerámica Blush',       'Cora Home',   99900, 14, '/img/cat-hogar.jpg'),
  (6, 'Set de regalo Pink Box',         'PinkPort',   249900, 10, '/img/cat-ofertas.jpg');
