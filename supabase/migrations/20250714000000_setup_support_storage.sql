-- Migration: Criação do bucket de anexos no Supabase Storage
-- Timestamp: 20250714000000
 
INSERT INTO storage.buckets (id, name)
VALUES ('support_attachments', 'support_attachments')
ON CONFLICT (id) DO NOTHING; 