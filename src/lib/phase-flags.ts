export const PHASE = {
  // Set to 1 for Phase 1 launch (static only)
  // Set to 2 for full app (all features)
  CURRENT: Number(process.env.NEXT_PUBLIC_PHASE ?? 1),
}

export const FLAGS = {
  // Navigation & Auth
  SHOW_LOGIN:          PHASE.CURRENT >= 2,
  SHOW_REGISTER:       PHASE.CURRENT >= 2,
  SHOW_USER_DROPDOWN:  PHASE.CURRENT >= 2,
  SHOW_CART:           PHASE.CURRENT >= 2,

  // Plant catalog
  SHOW_PLANTS_PAGE:    PHASE.CURRENT >= 2,
  SHOW_ADD_TO_CART:    PHASE.CURRENT >= 2,
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
  SHOW_SHOP:           PHASE.CURRENT >= 2,

  // CMS
  SHOW_CMS_EDITOR:     PHASE.CURRENT >= 2,
}
