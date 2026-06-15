import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Map Supabase row (snake_case) → app object (camelCase)
export const mapRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  productCode: row.product_code,
  brand: row.brand,
  name: row.name,
  flavor: row.flavor,
  category: row.category,
  score: row.score,
  pros: row.pros || [],
  cons: row.cons || [],
  image: row.image || null,
  timestamp: row.timestamp,
  rater: row.rater,
})

// Map app object (camelCase) → Supabase row (snake_case)
export const mapToRow = (r) => ({
  id: r.id,
  user_id: r.userId,
  product_code: r.productCode,
  brand: r.brand,
  name: r.name,
  flavor: r.flavor,
  category: r.category,
  score: r.score,
  pros: r.pros,
  cons: r.cons,
  image: r.image || null,
  timestamp: r.timestamp,
  rater: r.rater,
})
