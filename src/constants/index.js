// Discovery tag: release events carry ["t","tollgate"] so implementations
// can be found by tag instead of by a hardcoded author list.
export const DISCOVERY_TAG = 'tollgate';

// Test marker tag: events published while testing carry ["t","test"] and are
// excluded from the default view (filterable out later).
export const TEST_MARKER_TAG = 'test';

// Official publisher pubkeys for releases.
// 5075e61f… is the legacy GitHub-Actions key: it signed every release until
// org-wide Actions died on 2026-08-27 and its events are still the history
// visitors may browse, so it stays known. 6cfc53c0… is the live ngit-ci
// release key (NGIT_CI_SECRET_TMBG__NSEC_HEX on the CI host) that has signed
// every release event since 2026-09-12. Both are selected by default so the
// explorer resolves releases from whichever pipeline published them.
export const DEFAULT_TOLLGATE_PUBKEY = '5075e61f0b048148b60105c1dd72bbeae1957336ae5824087e52efa374f8416a';
export const CI_PUBLISHER_PUBKEY = '6cfc53c04bda7d58dd4dd0471d66f6a4ea7d3e123e78006e0e0c1abc1208ac0d';
export const DEFAULT_PUBLISHER_PUBKEYS = [DEFAULT_TOLLGATE_PUBKEY, CI_PUBLISHER_PUBKEY];

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
// relay2.orangesync.tech and damus are the two relays measured reachable and
// carrying our kind-1063 history today; relay2 has no meaningful event cap.
// relay1.orangesync.tech points at a dead IP (66.92.204.38) and
// relay.tollgate.me no longer completes a Nostr websocket behind Cloudflare —
// both were measured dead from the browser path on 2026-10-20 and are removed
// until they are actually fixed. nos.lol / nostr.mom keep flapping from this
// network; they are kept as extras because browsers on other networks reach
// them, but the default view no longer depends on them.
export const DEFAULT_RELAYS = [
  'wss://relay2.orangesync.tech',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://nostr.mom'
];

// Filter defaults
export const DEFAULT_FILTERS = {
  // No release has ever carried c=stable — every published event today is
  // dev or (for the staged v0.5.0-alpha3) alpha. Defaulting the channel
  // filter to stable-only therefore showed an empty explorer. Show all
  // channels by default until a real stable channel exists.
  channels: [RELEASE_CHANNELS.STABLE, RELEASE_CHANNELS.BETA, RELEASE_CHANNELS.ALPHA, RELEASE_CHANNELS.DEV],
  products: [PRODUCT_TYPES.TOLLGATE_OS, PRODUCT_TYPES.TOLLGATE_WRT, PRODUCT_TYPES.TOLLGATE_BASIC]
};

// Local storage keys
export const STORAGE_KEYS = {
  PUBLISHER_PUBKEY: 'tollgate_publisher_pubkey',
  VIEW_MODE: 'tollgate_view_mode',
  FILTERS: 'tollgate_filters',
  DEDUPLICATE: 'tollgate_deduplicate',
  SELECTED_PUBLISHERS: 'tollgate_selected_publishers'
};