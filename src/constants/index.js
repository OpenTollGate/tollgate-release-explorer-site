// Default TollGate pubkey for releases
export const DEFAULT_TOLLGATE_PUBKEY = '5075e61f0b048148b60105c1dd72bbeae1957336ae5824087e52efa374f8416a';

// NIP-94 kind for file metadata
export const NIP94_KIND = 1063;

// Release channels
export const RELEASE_CHANNELS = {
  STABLE: 'stable',
  BETA: 'beta',
  ALPHA: 'alpha',
  DEV: 'dev'
};

// Product types
export const PRODUCT_TYPES = {
  TOLLGATE_OS: 'tollgate-os',
  TOLLGATE_WRT: 'tollgate-wrt',
  TOLLGATE_BASIC: 'tollgate-module-basic-go',
};

// Product categories for tabs
export const PRODUCT_CATEGORIES = {
  OS: 'os',
  PACKAGES: 'packages'
};

// Mapping of product types to categories
export const PRODUCT_CATEGORY_MAP = {
  [PRODUCT_TYPES.TOLLGATE_OS]: PRODUCT_CATEGORIES.OS,
  [PRODUCT_TYPES.TOLLGATE_WRT]: PRODUCT_CATEGORIES.PACKAGES,
  [PRODUCT_TYPES.TOLLGATE_BASIC]: PRODUCT_CATEGORIES.PACKAGES,
};

// Get products by category
export const getProductsByCategory = (category) => {
  return Object.entries(PRODUCT_CATEGORY_MAP)
    .filter(([_, cat]) => cat === category)
    .map(([product]) => product);
};

// View modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

// Default Nostr relays.
// These are the public relays our release pipeline publishes to and
// that stay reachable from the browser. nostr.mom is important because
// it carries the full history without the 500-event cap damus/nos.lol
// impose. relay.tollgate.me is intentionally excluded — it returns
// HTTP 525 (SSL handshake failure) from the browser today; add it back
// once the cert is fixed.
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://nostr.mom'
];

// Filter defaults
export const DEFAULT_FILTERS = {
  channels: [RELEASE_CHANNELS.STABLE], // Default to stable only
  products: [PRODUCT_TYPES.TOLLGATE_OS, PRODUCT_TYPES.TOLLGATE_WRT, PRODUCT_TYPES.TOLLGATE_BASIC]
};

// Local storage keys
export const STORAGE_KEYS = {
  PUBLISHER_PUBKEY: 'tollgate_publisher_pubkey',
  VIEW_MODE: 'tollgate_view_mode',
  FILTERS: 'tollgate_filters',
  DEDUPLICATE: 'tollgate_deduplicate'
};