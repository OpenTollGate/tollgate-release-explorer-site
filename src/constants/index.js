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
  TOLLGATE_CORE: 'tollgate-core'
};

// View modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

// Default Nostr relays
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social'
];

// Filter defaults
export const DEFAULT_FILTERS = {
  channels: [RELEASE_CHANNELS.STABLE], // Default to stable only
  products: [PRODUCT_TYPES.TOLLGATE_OS, PRODUCT_TYPES.TOLLGATE_CORE],
  architectures: [],
  devices: []
};

// Local storage keys
export const STORAGE_KEYS = {
  PUBLISHER_PUBKEY: 'tollgate_publisher_pubkey',
  VIEW_MODE: 'tollgate_view_mode',
  FILTERS: 'tollgate_filters'
};