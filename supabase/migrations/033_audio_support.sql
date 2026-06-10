ALTER TABLE materials DROP CONSTRAINT IF EXISTS materials_material_type_check;
ALTER TABLE materials ADD CONSTRAINT materials_material_type_check
  CHECK (material_type IN ('pdf', 'link', 'video', 'audio', 'document', 'other'));
