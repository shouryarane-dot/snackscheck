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
// Handles both slim rows (nutriscore extracted as top-level field)
// and full rows (product_info is the full JSONB object)
export const mapProduct = (row) => ({
  id: row.id,
  productCode: row.product_code,
  brand: row.brand,
  name: row.name,
  flavor: row.flavor,
  category: row.category,
  // Full fetch (PAGE_SELECT): product_info is the complete object
  // Slim fetch (LIST_SELECT): product_info is null; individual fields extracted separately
  productInfo: row.product_info
    ? row.product_info
    : (row.nutriscore || row.per100g || row.allergens)
      ? { nutriscore: row.nutriscore || null, per100g: row.per100g || null, allergens: row.allergens || null }
      : null,
  imageUrl: row.image_url || null,
  countryOfOrigin: row.country_of_origin || null,
  barcode: row.barcode || null,
  source: row.source || null,
})

// Upsert a product and return it (creates if new, updates info if exists)
export const upsertProduct = async (brand, name, flavor, category, productCode, productInfo, extra={}) => {
  const { data, error } = await supabase
    .from('products')
    .upsert({
      product_code: productCode,
      brand,
      name,
      flavor,
      category,
      product_info: productInfo || null,
      image_url: extra.imageUrl || null,
      country_of_origin: extra.countryOfOrigin || null,
      barcode: extra.barcode || null,
      source: extra.source || null,
    }, { onConflict: 'product_code' })
    .select()
    .single()
  if (error) console.error('upsertProduct error:', error)
  return data
}

// Columns for list/bulk fetches — slim but includes the sub-fields the filters need.
// Avoids fetching full product_info (which includes large ingredientsByLang strings).
const LIST_SELECT = 'id, product_code, brand, name, flavor, category, image_url, country_of_origin, barcode, source, product_info->>nutriscore, product_info->per100g, product_info->allergens'

// Full columns — used for paginated page fetches when we need everything.
const PAGE_SELECT = 'id, product_code, brand, name, flavor, category, image_url, country_of_origin, barcode, source, product_info'

// Fetch all products in parallel pages (slim payload — no full product_info)
export const fetchProducts = async () => {
  const PAGE = 1000;

  // Step 1: get total count (single lightweight HEAD request)
  const { count, error: countErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  if (countErr || !count) {
    console.error('fetchProducts count error:', countErr);
    return [];
  }

  // Step 2: fetch all pages in parallel
  const pages = Math.ceil(count / PAGE);
  const promises = Array.from({ length: pages }, (_, i) =>
    supabase
      .from('products')
      .select(LIST_SELECT)
      .order('brand', { ascending: true })
      .range(i * PAGE, (i + 1) * PAGE - 1)
  );

  const results = await Promise.all(promises);
  const all = results.flatMap(({ data }) => data || []);
  return all.map(mapProduct);
}

// Fetch a single product with full product_info (for detail view)
export const fetchProductDetail = async (productCode) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_code', productCode)
    .single();
  if (error) { console.error('fetchProductDetail error:', error); return null; }
  return mapProduct(data);
}

export const PAGE_SIZE = 30;

// Fetch one page of products with server-side search/category/nutriscore/sort
export const fetchProductsPage = async ({ page=0, search='', category='', nutriscoreMax='' }={}) => {
  let query = supabase.from('products').select(PAGE_SELECT, { count: 'exact' });
  if (search) query = query.or(`brand.ilike.%${search}%,name.ilike.%${search}%,flavor.ilike.%${search}%`);
  if (category && category !== 'all') query = query.eq('category', category);
  if (nutriscoreMax) {
    query = query.not('product_info', 'is', null)
      .lte('product_info->>nutriscore', nutriscoreMax.toLowerCase())
      .gte('product_info->>nutriscore', 'a');
  }
  query = query.order('brand', { ascending: true }).order('name', { ascending: true });
  query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  const { data, error, count } = await query;
  if (error) { console.error('fetchProductsPage:', error); return { products: [], count: 0 }; }
  return { products: (data || []).map(mapProduct), count: count || 0 };
};

// Fetch specific products by product_code (for score-based sorts using rated codes)
export const fetchProductsByCodes = async (codes) => {
  if (!codes.length) return [];
  const BATCH = 150;
  const batches = Array.from({ length: Math.ceil(codes.length / BATCH) }, (_, i) =>
    supabase.from('products').select(LIST_SELECT).in('product_code', codes.slice(i * BATCH, (i + 1) * BATCH))
  );
  const results = await Promise.all(batches);
  return results.flatMap(({ data }) => (data || []).map(mapProduct));
};

// Update nutritional info for a product
export const updateProductInfo = async (productCode, productInfo) => {
  const { error } = await supabase
    .from('products')
    .update({ product_info: productInfo })
    .eq('product_code', productCode)
  if (error) console.error('updateProductInfo error:', error)
}
