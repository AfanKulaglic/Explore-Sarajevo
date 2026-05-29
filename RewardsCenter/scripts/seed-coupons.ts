import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const coupons = [
  {
    code: 'PRINT50',
    description: 'Get 50% off any digital print order. Perfect for custom posters, photos, and artwork!',
    discount_type: 'PERCENTAGE',
    discount_value: 50,
    min_order_value: 0,
    max_uses: 100,
    max_uses_per_user: 1,
    applicable_categories: ['digital-print'],
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    code: 'FREEPRINT',
    description: 'Redeem one free A4 size print of your choice. Limited to one per user.',
    discount_type: 'FIXED_COINS',
    discount_value: 5000, // 5000 coins value
    min_order_value: 0,
    max_uses: 50,
    max_uses_per_user: 1,
    applicable_categories: ['digital-print'],
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    code: 'COFFEE25',
    description: 'Enjoy 25% off at any Saraya partner cafe. Valid for drinks and snacks.',
    discount_type: 'PERCENTAGE',
    discount_value: 25,
    min_order_value: 500,
    max_uses: 200,
    max_uses_per_user: 3,
    applicable_categories: ['food-drink', 'experiences'],
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    code: 'SHOP15',
    description: 'Get 15% off any merchandise in the Saraya store. Excludes limited editions.',
    discount_type: 'PERCENTAGE',
    discount_value: 15,
    min_order_value: 10000,
    max_uses: 500,
    max_uses_per_user: 2,
    applicable_categories: ['apparel', 'accessories'],
    expires_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    code: 'BONUS500',
    description: 'Redeem this coupon to instantly receive 500 bonus coins to your wallet!',
    discount_type: 'FIXED_COINS',
    discount_value: 500,
    min_order_value: 0,
    max_uses: 100,
    max_uses_per_user: 1,
    applicable_categories: null,
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    code: 'GIFT20',
    description: 'Get 20% off any gift card purchase. Perfect for sharing the rewards!',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    min_order_value: 5000,
    max_uses: 150,
    max_uses_per_user: 2,
    applicable_categories: ['gift-cards'],
    expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    code: 'NEWYEAR2025',
    description: 'Celebrate the new year with 30% off your entire order!',
    discount_type: 'PERCENTAGE',
    discount_value: 30,
    min_order_value: 15000,
    max_uses: 1000,
    max_uses_per_user: 1,
    applicable_categories: null,
    starts_at: new Date('2025-01-01').toISOString(),
    expires_at: new Date('2025-01-15').toISOString(),
    is_active: true
  },
  {
    code: 'WELCOME10',
    description: 'Welcome to Saraya Rewards! Enjoy 10% off your first purchase.',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    min_order_value: 0,
    max_uses: null, // unlimited
    max_uses_per_user: 1,
    applicable_categories: null,
    expires_at: null, // never expires
    is_active: true
  },
  {
    code: 'FLASH40',
    description: 'Flash sale! 40% off electronics for the next 24 hours only!',
    discount_type: 'PERCENTAGE',
    discount_value: 40,
    min_order_value: 20000,
    max_uses: 25,
    max_uses_per_user: 1,
    applicable_categories: ['electronics'],
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on any physical reward order!',
    discount_type: 'FIXED_COINS',
    discount_value: 5000, // 5000 coins off to cover shipping
    min_order_value: 25000,
    max_uses: 200,
    max_uses_per_user: 5,
    applicable_categories: null,
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  }
]

async function seedCoupons() {
  console.log('🎟️  Seeding coupons...\n')

  for (const coupon of coupons) {
    const { data, error } = await supabase
      .from('rewards_coupons')
      .upsert(coupon, { onConflict: 'code' })
      .select()
      .single()

    if (error) {
      console.error(`❌ Error inserting coupon ${coupon.code}:`, error.message)
    } else {
      console.log(`✅ Inserted coupon: ${coupon.code} (${coupon.discount_type} ${coupon.discount_value}${coupon.discount_type === 'PERCENTAGE' ? '%' : ' coins'})`)
    }
  }

  console.log('\n🎉 Coupon seeding complete!')
}

seedCoupons()
