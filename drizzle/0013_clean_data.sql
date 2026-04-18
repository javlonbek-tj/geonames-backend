-- ============================================================
-- Barcha ma'lumotlarni tozalash (regions, districts,
-- object_categories, object_types saqlanadi)
-- ============================================================

-- FK bog'liqliklarni hisobga olib tartib bilan o'chirish
TRUNCATE TABLE
  public_votes,
  public_discussions,
  geo_object_flags,
  commission_approvals,
  documents,
  application_history,
  geographic_objects,
  applications,
  citizen_otps,
  citizens,
  refresh_tokens,
  users
RESTART IDENTITY CASCADE;

-- ============================================================
-- object_categories va object_types sequence larini tuzatish
-- (ID lar 5 dan emas, to'g'ri davomidan boshlanishi uchun)
-- ============================================================

SELECT setval(
  pg_get_serial_sequence('object_categories', 'id'),
  COALESCE((SELECT MAX(id) FROM object_categories), 0),
  true
);

SELECT setval(
  pg_get_serial_sequence('object_types', 'id'),
  COALESCE((SELECT MAX(id) FROM object_types), 0),
  true
);
