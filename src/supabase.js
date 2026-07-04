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
  location: row.location || null,
  productInfo: row.product_info || null,
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
  location: r.location || null,
  product_info: r.productInfo || null,
})

// Map products table row → app object
export const mapProduct = (row) => ({
  id: row.id,
  productCode: row.product_code,
  brand: row.brand,
  name: row.name,
  flavor: row.flavor,
  category: row.category,
  productInfo: row.product_info || null,
})

// Upsert a product and return it (creates if new, updates info if exists)
export const upsertProduct = async (brand, name, flavor, category, productCode, productInfo) => {
  const { data, error } = await supabase
    .from('products')
    .upsert({
      product_code: productCode,
      brand,
      name,
      flavor,
      category,
      product_info: productInfo || null,
    }, { onConflict: 'product_code' })
    .select()
    .single()
  if (error) console.error('upsertProduct error:', error)
  return data
}

// Fetch all products (for autocomplete)
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('brand', { ascending: true })
  if (error) { console.error('fetchProducts error:', error); return [] }
  return (data || []).map(mapProduct)
}

// Update nutritional info for a product
export const updateProductInfo = async (productCode, productInfo) => {
  const { error } = await supabase
    .from('products')
    .update({ product_info: productInfo })
    .eq('product_code', productCode)
  if (error) console.error('updateProductInfo error:', error)
}
