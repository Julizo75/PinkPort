-- =============================================
-- PinkPort - Cambios nuevos (ejecutar UNA vez)
-- Si ya habías creado las tablas, pega esto en:
-- Supabase > SQL Editor > New query > Run
-- =============================================

-- Dirección guardada en el perfil del usuario
alter table usuario add column ciudad text;
alter table usuario add column direccion text;

-- Desglose del precio en cada pedido
alter table pedido add column subtotal numeric;
alter table pedido add column costo_envio numeric;
alter table pedido add column iva numeric;
