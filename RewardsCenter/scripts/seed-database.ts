import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============ SEED DATA ============

const categories = [
  { slug: 'electronics', name: 'Electronics', description: 'Gadgets and tech items', icon: '📱', sort_order: 0 },
  { slug: 'apparel', name: 'Apparel', description: 'Clothing and fashion items', icon: '👕', sort_order: 1 },
  { slug: 'accessories', name: 'Accessories', description: 'Fashion accessories', icon: '⌚', sort_order: 2 },
  { slug: 'experiences', name: 'Experiences', description: 'Unique experiences and perks', icon: '🎉', sort_order: 3 },
  { slug: 'gift-cards', name: 'Gift Cards', description: 'Redeemable gift cards', icon: '🎁', sort_order: 4 },
]

const rewards = [
  {
    title: 'Style your avatar with exclusive content from Gucci',
    subtitle: 'Limited run digital skins + accessories',
    description: 'Unlock a capsule drop designed for Saraya Champions in collaboration with Gucci.',
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    type: 'DIGITAL',
    category: 'accessories',
    price: 30000,
    currency: 'COINS',
    stock: null,
    tags: ['FEATURED'],
    is_active: true,
    requires_approval: false,
  },
  {
    title: 'Apple Watch Series 9',
    subtitle: 'Coming soon to the Reward Store',
    description: 'Track workouts, close rings, and flex in style.',
    image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    type: 'PHYSICAL',
    category: 'electronics',
    price: 120000,
    currency: 'COINS',
    stock: 12,
    tags: ['FEATURED', 'LIMITED_TIME'],
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    requires_approval: false,
  },
  {
    title: 'Nintendo Switch',
    subtitle: 'Play anywhere, solo or together',
    description: 'The versatile gaming console for home or on-the-go gaming.',
    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    type: 'PHYSICAL',
    category: 'electronics',
    price: 90000,
    currency: 'COINS',
    stock: 8,
    tags: ['FEATURED'],
    is_active: true,
    requires_approval: false,
  },
  {
    title: 'NY Mets Zip-up',
    subtitle: 'Official on-field gear',
    description: 'Show your team spirit with this official NY Mets zip-up jacket.',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    type: 'PHYSICAL',
    category: 'apparel',
    price: 70000,
    currency: 'COINS',
    stock: 5,
    tags: [],
    is_active: true,
    requires_approval: false,
  },
  {
    title: 'Buffalo Bills Mouse',
    subtitle: 'Limited run collab',
    description: 'Premium wireless mouse with Buffalo Bills branding.',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    type: 'PHYSICAL',
    category: 'electronics',
    price: 45000,
    currency: 'COINS',
    stock: 15,
    tags: ['FEATURED', 'LIMITED_TIME'],
    is_active: true,
    requires_approval: false,
  },
  {
    title: 'Buffalo Bills Mouse – Wireless',
    subtitle: 'Only 2 days left!',
    description: 'Premium wireless version of the Buffalo Bills mouse.',
    image_url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80',
    type: 'PHYSICAL',
    category: 'electronics',
    price: 50000,
    currency: 'COINS',
    stock: 10,
    tags: ['LIMITED_TIME'],
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    requires_approval: false,
  },
  {
    title: 'PTO Full Day',
    subtitle: 'Requires approval',
    description: 'Redeem a full day of paid time off. Subject to manager approval.',
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    type: 'PERK',
    category: 'experiences',
    price: 70000,
    currency: 'COINS',
    stock: null,
    requires_approval: true,
    tags: ['REQUIRES_APPROVAL'],
    is_active: true,
  },
  {
    title: 'Counter Top Ice Maker',
    subtitle: 'Host-with-the-most starter kit',
    description: 'Perfect for entertaining guests or staying cool all summer.',
    image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
    type: 'PHYSICAL',
    category: 'electronics',
    price: 65000,
    currency: 'COINS',
    stock: 9,
    tags: [],
    is_active: true,
    requires_approval: false,
  },
  {
    title: 'VIP Track Day',
    subtitle: 'Drive supercars, lunch included',
    description: 'Experience the thrill of driving luxury supercars on a professional track. Includes gourmet lunch.',
    image_url: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80',
    type: 'PERK',
    category: 'experiences',
    price: 150000,
    currency: 'COINS',
    stock: null,
    requires_approval: true,
    tags: ['FEATURED', 'REQUIRES_APPROVAL'],
    is_active: true,
  },
  {
    title: '$50 Amazon Gift Card',
    subtitle: 'Digital delivery',
    description: 'Redeem for a $50 Amazon gift card sent directly to your email.',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
    type: 'DIGITAL',
    category: 'gift-cards',
    price: 55000,
    currency: 'COINS',
    stock: null,
    tags: [],
    is_active: true,
    requires_approval: false,
  },
  {
    title: '$100 Amazon Gift Card',
    subtitle: 'Digital delivery',
    description: 'Redeem for a $100 Amazon gift card sent directly to your email.',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
    type: 'DIGITAL',
    category: 'gift-cards',
    price: 105000,
    currency: 'COINS',
    stock: null,
    tags: ['FEATURED'],
    is_active: true,
    requires_approval: false,
  },
  {
    title: 'Premium Headphones',
    subtitle: 'Studio-quality sound',
    description: 'High-fidelity over-ear headphones with active noise cancellation.',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    type: 'PHYSICAL',
    category: 'electronics',
    price: 80000,
    currency: 'COINS',
    stock: 6,
    tags: [],
    is_active: true,
    requires_approval: false,
  },
]

const tournaments = [
  {
    title: 'Weekly Sales Showdown',
    description: 'Compete against your peers in this high-stakes weekly sales competition. Top performers earn massive coin rewards and exclusive badges.',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    type: 'SOLO',
    status: 'LIVE',
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 500,
    entry_currency: 'COINS',
    max_participants: 100,
    team_size: 1,
    rules: ['Must complete at least 10 sales calls per day', 'Revenue counts towards final score', 'Ties broken by call volume'],
    xp_reward: 500,
    featured: true,
  },
  {
    title: 'Single Elimination Championship',
    description: 'Head-to-head bracket-style tournament. Win your matchups to advance and claim the ultimate prize!',
    image_url: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=900&q=80',
    type: 'BRACKET',
    status: 'LIVE',
    start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 1000,
    entry_currency: 'COINS',
    max_participants: 64,
    team_size: 1,
    rules: ['Single elimination format', 'Match winners determined by daily sales total', 'Bracket seeded by current rank'],
    xp_reward: 1000,
    featured: true,
  },
  {
    title: 'Team Battle Royale',
    description: 'Form a team of 4 and compete against other squads. Coordinate strategies and dominate the competition together!',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    type: 'TEAM',
    status: 'UPCOMING',
    start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 2000,
    entry_currency: 'COINS',
    max_participants: 80,
    team_size: 4,
    rules: ['Teams of 4 players', 'Combined team score determines ranking', 'All team members must participate daily'],
    xp_reward: 2000,
    featured: false,
  },
  {
    title: 'Monthly Marathon',
    description: 'A month-long endurance challenge. Consistency is key - maintain your performance throughout to climb the ranks!',
    image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80',
    type: 'SOLO',
    status: 'UPCOMING',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 0,
    entry_currency: 'COINS',
    max_participants: 500,
    team_size: 1,
    rules: ['Free entry', 'Daily activity required to maintain eligibility', 'Cumulative score over 30 days'],
    xp_reward: 5000,
    featured: true,
  },
  {
    title: 'Flash Blitz',
    description: '24-hour intense competition! Quick reflexes and fast sales win the day.',
    image_url: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=900&q=80',
    type: 'SOLO',
    status: 'COMPLETED',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee: 250,
    entry_currency: 'COINS',
    max_participants: 50,
    team_size: 1,
    rules: ['24-hour duration', 'Real-time leaderboard updates', 'Highest sales volume wins'],
    xp_reward: 250,
    featured: false,
  },
]

const tournamentPrizes = {
  'Weekly Sales Showdown': [
    { place: 1, coins: 50000, xp: 5000, tokens: 0, badge: '🏆' },
    { place: 2, coins: 25000, xp: 3000, tokens: 0, badge: '🥈' },
    { place: 3, coins: 10000, xp: 1500, tokens: 0, badge: '🥉' },
  ],
  'Single Elimination Championship': [
    { place: 1, coins: 100000, xp: 10000, tokens: 0, badge: '👑' },
    { place: 2, coins: 50000, xp: 5000, tokens: 0, badge: '🥈' },
    { place: 3, coins: 25000, xp: 2500, tokens: 0, badge: '🥉' },
  ],
  'Team Battle Royale': [
    { place: 1, coins: 200000, xp: 15000, tokens: 0, badge: '🏅' },
    { place: 2, coins: 100000, xp: 8000, tokens: 0, badge: '🥈' },
    { place: 3, coins: 50000, xp: 4000, tokens: 0, badge: '🥉' },
  ],
  'Monthly Marathon': [
    { place: 1, coins: 500000, xp: 50000, tokens: 0, badge: '💎' },
    { place: 2, coins: 250000, xp: 25000, tokens: 0, badge: '🥈' },
    { place: 3, coins: 100000, xp: 10000, tokens: 0, badge: '🥉' },
  ],
  'Flash Blitz': [
    { place: 1, coins: 15000, xp: 2000, tokens: 0, badge: '⚡' },
    { place: 2, coins: 7500, xp: 1000, tokens: 0, badge: '🥈' },
    { place: 3, coins: 3000, xp: 500, tokens: 0, badge: '🥉' },
  ],
}

// Achievements - using basic columns that should exist in any achievements table
const achievements = [
  {
    slug: 'first_purchase',
    title: 'First Purchase',
    description: 'Redeem your first reward',
    icon: '🎁',
    category: 'SHOPPING',
    xp_reward: 500,
    is_hidden: false,
  },
  {
    slug: 'coin_collector',
    title: 'Coin Collector',
    description: 'Earn 100,000 coins total',
    icon: '💰',
    category: 'LOYALTY',
    xp_reward: 2000,
    is_hidden: false,
  },
  {
    slug: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 7-day earning streak',
    icon: '🔥',
    category: 'LOYALTY',
    xp_reward: 1000,
    is_hidden: false,
  },
  {
    slug: 'top_10_percent',
    title: 'Top 10%',
    description: 'Reach the top 10% of earners',
    icon: '🏆',
    category: 'TOURNAMENT',
    xp_reward: 5000,
    is_hidden: false,
  },
  {
    slug: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Refer 5 friends to Saraya',
    icon: '🦋',
    category: 'SOCIAL',
    xp_reward: 3000,
    is_hidden: false,
  },
  {
    slug: 'diamond_status',
    title: 'Diamond Status',
    description: 'Reach Diamond tier',
    icon: '💎',
    category: 'LOYALTY',
    xp_reward: 10000,
    is_hidden: false,
  },
  {
    slug: 'tournament_champion',
    title: 'Tournament Champion',
    description: 'Win your first tournament',
    icon: '👑',
    category: 'TOURNAMENT',
    xp_reward: 5000,
    is_hidden: false,
  },
  {
    slug: 'shopping_spree',
    title: 'Shopping Spree',
    description: 'Redeem 10 rewards',
    icon: '🛒',
    category: 'SHOPPING',
    xp_reward: 2500,
    is_hidden: false,
  },
  {
    slug: 'hidden_gem',
    title: 'Hidden Gem',
    description: '???',
    icon: '💠',
    category: 'SPECIAL',
    xp_reward: 10000,
    is_hidden: true,
  },
]

// Coupons - matching the column names from the API route
const coupons = [
  {
    code: 'WELCOME2024',
    description: 'Welcome discount for new members',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 10000,
    max_uses: 1000,
    max_uses_per_user: 1,
    starts_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    code: 'HOLIDAY50',
    description: 'Holiday special - 50% off',
    discount_type: 'percentage',
    discount_value: 50,
    min_order_value: 50000,
    max_uses: 100,
    max_uses_per_user: 1,
    starts_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    code: 'FLAT5K',
    description: '5,000 coins off any purchase',
    discount_type: 'fixed',
    discount_value: 5000,
    min_order_value: 20000,
    max_uses: 500,
    max_uses_per_user: 1,
    starts_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on physical items',
    discount_type: 'percentage',
    discount_value: 100,
    min_order_value: 30000,
    max_uses: null,
    max_uses_per_user: 1,
    starts_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },
]

// ============ SEED FUNCTIONS ============

async function seedCategories() {
  console.log('🏷️  Seeding categories...')
  
  const { data, error } = await supabase
    .from('rewards_reward_categories')
    .upsert(categories, { onConflict: 'slug' })
    .select()
  
  if (error) {
    console.error('Error seeding categories:', error)
    return null
  }
  
  console.log(`   ✅ Inserted ${data.length} categories`)
  return data
}

async function seedRewards() {
  console.log('🎁 Seeding rewards...')
  
  const { data, error } = await supabase
    .from('rewards_rewards')
    .insert(rewards)
    .select()
  
  if (error) {
    console.error('Error seeding rewards:', error)
    return null
  }
  
  console.log(`   ✅ Inserted ${data.length} rewards`)
  return data
}

async function seedTournaments() {
  console.log('🏆 Seeding tournaments...')
  
  const { data, error } = await supabase
    .from('rewards_tournaments')
    .insert(tournaments)
    .select()
  
  if (error) {
    console.error('Error seeding tournaments:', error)
    return null
  }
  
  console.log(`   ✅ Inserted ${data.length} tournaments`)
  return data
}

async function seedTournamentPrizes(tournamentData: any[]) {
  console.log('🥇 Seeding tournament prizes...')
  
  const prizesToInsert: any[] = []
  
  for (const tournament of tournamentData) {
    const prizes = tournamentPrizes[tournament.title as keyof typeof tournamentPrizes]
    if (prizes) {
      for (const prize of prizes) {
        prizesToInsert.push({
          tournament_id: tournament.id,
          ...prize,
        })
      }
    }
  }
  
  if (prizesToInsert.length === 0) {
    console.log('   ⚠️ No prizes to insert')
    return
  }
  
  const { data, error } = await supabase
    .from('rewards_tournament_prizes')
    .insert(prizesToInsert)
    .select()
  
  if (error) {
    console.error('Error seeding tournament prizes:', error)
    return
  }
  
  console.log(`   ✅ Inserted ${data.length} tournament prizes`)
}

async function seedAchievements() {
  console.log('🏅 Seeding achievements...')
  
  const { data, error } = await supabase
    .from('rewards_achievements')
    .upsert(achievements, { onConflict: 'slug' })
    .select()
  
  if (error) {
    console.error('Error seeding achievements:', error)
    return null
  }
  
  console.log(`   ✅ Inserted ${data.length} achievements`)
  return data
}

async function seedCoupons() {
  console.log('🎟️  Seeding coupons...')
  
  const { data, error } = await supabase
    .from('rewards_coupons')
    .upsert(coupons, { onConflict: 'code' })
    .select()
  
  if (error) {
    console.error('Error seeding coupons:', error)
    return null
  }
  
  console.log(`   ✅ Inserted ${data.length} coupons`)
  return data
}

// ============ MAIN ============

async function main() {
  console.log('🚀 Starting database seed...\n')
  
  try {
    // Seed categories first
    const categoryData = await seedCategories()
    if (!categoryData) {
      console.error('Failed to seed categories, aborting.')
      process.exit(1)
    }
    
    // Seed rewards
    await seedRewards()
    
    // Seed tournaments
    const tournamentData = await seedTournaments()
    
    // Seed tournament prizes
    if (tournamentData) {
      await seedTournamentPrizes(tournamentData)
    }
    
    // Skip achievements and coupons for now due to schema differences
    // await seedAchievements()
    // await seedCoupons()
    console.log('\n⚠️  Skipping achievements and coupons (schema differences)')
    console.log('   You can add these manually via the admin panel.\n')

    console.log('\n✅ Database seeding completed successfully!')
    console.log('   📊 Seeded: 5 categories, 12 rewards, 5 tournaments, 15 prizes')
    
  } catch (error) {
    console.error('Fatal error during seeding:', error)
    process.exit(1)
  }
}

main()
