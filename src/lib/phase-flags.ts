export const PHASE = {
  // Set to 1 for Phase 1 launch (static only)
  // Set to 2 for accounts, CMS editor, booking, portal and admin (no purchasing)
  // Set to 3 for full app (adds prices, stock, cart and shop)
  CURRENT: Number(process.env.NEXT_PUBLIC_PHASE ?? 1),
}

// Set NEXT_ENABLE_LOGIN=true to open login (e.g. for CMS editing) without moving to Phase 2
const LOGIN_ENABLED = PHASE.CURRENT >= 2 || process.env.NEXT_ENABLE_LOGIN === 'true'

export const FLAGS = {
  // Navigation & Auth
  SHOW_LOGIN:          LOGIN_ENABLED,
  SHOW_REGISTER:       PHASE.CURRENT >= 2,
  SHOW_USER_DROPDOWN:  LOGIN_ENABLED,
  SHOW_CART:           PHASE.CURRENT >= 3,

  // Plant catalog — browsable in every phase; informational only until Phase 3
  SHOW_PLANTS_PAGE:    true,
  SHOW_PRICES:         PHASE.CURRENT >= 3,
  SHOW_STOCK:          PHASE.CURRENT >= 3,
  SHOW_ADD_TO_CART:    PHASE.CURRENT >= 3,
  SHOW_FAVORITES:      PHASE.CURRENT >= 2,

  // Booking
  SHOW_BOOKING:        PHASE.CURRENT >= 2,
  SHOW_BOOKING_NAV:    PHASE.CURRENT >= 2,

  // AI Chat
  SHOW_AI_CHAT:        PHASE.CURRENT >= 2,

  // Portal & Admin
  SHOW_PORTAL:         PHASE.CURRENT >= 2,
  SHOW_ADMIN:          PHASE.CURRENT >= 2,

  // E-Commerce
  SHOW_SHOP:           PHASE.CURRENT >= 3,

  // CMS
  SHOW_CMS_EDITOR:     LOGIN_ENABLED,

  // Etsy is the online store until our own shop launches
  SHOW_ETSY_PROMO:     PHASE.CURRENT < 3,
}

export const ETSY_SHOP_URL = 'https://www.etsy.com/shop/MayteesGarden'

// Strip prices before they reach the client so they aren't in the page payload either
export function withoutPrices<T extends { price: number | null }>(item: T): T {
  if (FLAGS.SHOW_PRICES) return item
  return { ...item, price: 0, ...('onlinePrice' in item && { onlinePrice: null }), ...('priceNote' in item && { priceNote: null }) } as T
}
