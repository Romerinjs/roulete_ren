import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lkkvcodnbhoucaxbwtfy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxra3Zjb2RuYmhvdWNheGJ3dGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MDQzMTEsImV4cCI6MjA2Mzk4MDMxMX0.EcWkr1nOw40QJW1B7L4Hh0l8KucdEtZ2iHEGLgST61M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)