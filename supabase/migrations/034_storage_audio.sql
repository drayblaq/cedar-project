UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'video/mp4',
  'video/quicktime',
  'image/jpeg',
  'image/png',
  'image/webp'
],
file_size_limit = 104857600
WHERE id = 'course-materials';
