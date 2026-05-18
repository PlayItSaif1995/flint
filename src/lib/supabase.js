import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bsursvkrlvbaytvtaite.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzdXJzdmtybHZiYXl0dnRhaXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzQ1MTEsImV4cCI6MjA5NDYxMDUxMX0._-hnbhYH8QuURJoaO_-GTzue0bXCU2ReW1Tqj73rbS0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
