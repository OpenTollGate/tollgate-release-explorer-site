/**
 * Get a display-friendly version number from a Nostr event
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} A formatted version string
 */
export const getReleaseVersion = (release) => {
  return release.getMatchingTags("tollgate_os_version")?.[0]?.[1] || 
         release.getMatchingTags("tollgate_core_version")?.[0]?.[1] ||
         release.id?.substring(0, 8) || 'Unknown';
};

/**
 * Get the formatted release date for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} A formatted date string
 */
export const getReleaseDate = (release) => {
  if (!release.created_at) return "Unknown";
  
  const date = new Date(release.created_at * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get the release channel from a release event
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The release channel
 */
export const getReleaseChannel = (release) => {
  return release.getMatchingTags("release_channel")?.[0]?.[1] || 'stable';
};

/**
 * Get architecture details for a release
 * @param {Object} release - The Nostr event containing release information 
 * @returns {string} The architecture or "Unknown"
 */
export const getReleaseArchitecture = (release) => {
  return release.getMatchingTags("architecture")?.[0]?.[1] || "Unknown";
};

/**
 * Get OpenWRT version details
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The OpenWRT version or "Unknown"
 */
export const getReleaseOpenWrtVersion = (release) => {
  return release.getMatchingTags("openwrt_version")?.[0]?.[1] || "Unknown";
};

/**
 * Get device ID for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The device ID or "Unknown"
 */
export const getReleaseDeviceId = (release) => {
  return release.getMatchingTags("device_id")?.[0]?.[1] || "Unknown";
};

/**
 * Get supported devices for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The supported devices or "Unknown"
 */
export const getReleaseSupportedDevices = (release) => {
  return release.getMatchingTags("supported_devices")?.[0]?.[1] || "Unknown";
};

/**
 * Get the download URL for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The download URL or null
 */
export const getReleaseDownloadUrl = (release) => {
  return release.getMatchingTags("url")?.[0]?.[1] || null;
};

/**
 * Get the file hash for verification
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The file hash or null
 */
export const getReleaseFileHash = (release) => {
  return release.getMatchingTags("x")?.[0]?.[1] || 
         release.getMatchingTags("ox")?.[0]?.[1] || null;
};

/**
 * Get the MIME type of the release file
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The MIME type or "application/octet-stream"
 */
export const getReleaseMimeType = (release) => {
  return release.getMatchingTags("m")?.[0]?.[1] || "application/octet-stream";
};

/**
 * Determine the product type from a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} Either 'tollgate-os' or 'tollgate-core'
 */
export const getReleaseProductType = (release) => {
  // Check if it has TollGate OS version tag
  if (release.getMatchingTags("tollgate_os_version")?.[0]?.[1]) {
    return 'tollgate-os';
  }
  
  // Check if it has TollGate Core version tag
  if (release.getMatchingTags("tollgate_core_version")?.[0]?.[1]) {
    return 'tollgate-core';
  }
  
  // Fallback: check content or filename
  const content = release.content?.toLowerCase() || '';
  const url = getReleaseDownloadUrl(release)?.toLowerCase() || '';
  
  if (content.includes('core') || url.includes('core')) {
    return 'tollgate-core';
  }
  
  // Default to OS
  return 'tollgate-os';
};

/**
 * Get a human-readable product name
 * @param {string} productType - The product type ('tollgate-os' or 'tollgate-core')
 * @returns {string} Human-readable product name
 */
export const getProductDisplayName = (productType) => {
  switch (productType) {
    case 'tollgate-os':
      return 'TollGate OS';
    case 'tollgate-core':
      return 'TollGate Core';
    default:
      return 'TollGate';
  }
};

/**
 * Filter releases based on criteria
 * @param {Array} releases - Array of release events
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered releases
 */
export const filterReleases = (releases, filters) => {
  if (!releases || !Array.isArray(releases)) return [];
  
  return releases.filter(release => {
    // Filter by channels
    if (filters.channels && filters.channels.length > 0) {
      const channel = getReleaseChannel(release);
      if (!filters.channels.includes(channel)) return false;
    }
    
    // Filter by product types
    if (filters.products && filters.products.length > 0) {
      const productType = getReleaseProductType(release);
      if (!filters.products.includes(productType)) return false;
    }
    
    // Filter by architectures
    if (filters.architectures && filters.architectures.length > 0) {
      const architecture = getReleaseArchitecture(release);
      if (!filters.architectures.includes(architecture)) return false;
    }
    
    // Filter by devices
    if (filters.devices && filters.devices.length > 0) {
      const deviceId = getReleaseDeviceId(release);
      const supportedDevices = getReleaseSupportedDevices(release);
      
      const matchesDevice = filters.devices.some(device => 
        deviceId.includes(device) || supportedDevices.includes(device)
      );
      
      if (!matchesDevice) return false;
    }
    
    return true;
  });
};

/**
 * Sort releases by creation date (newest first)
 * @param {Array} releases - Array of release events
 * @returns {Array} Sorted releases
 */
export const sortReleasesByDate = (releases) => {
  if (!releases || !Array.isArray(releases)) return [];
  
  return [...releases].sort((a, b) => {
    const aTime = a.created_at || 0;
    const bTime = b.created_at || 0;
    return bTime - aTime; // Newest first
  });
};

/**
 * Get unique values from releases for filter options
 * @param {Array} releases - Array of release events
 * @param {string} field - Field to extract unique values from
 * @returns {Array} Array of unique values
 */
export const getUniqueReleaseValues = (releases, field) => {
  if (!releases || !Array.isArray(releases)) return [];
  
  const values = new Set();
  
  releases.forEach(release => {
    let value;
    switch (field) {
      case 'channels':
        value = getReleaseChannel(release);
        break;
      case 'architectures':
        value = getReleaseArchitecture(release);
        break;
      case 'devices':
        value = getReleaseDeviceId(release);
        break;
      case 'products':
        value = getReleaseProductType(release);
        break;
      default:
        return;
    }
    
    if (value && value !== 'Unknown') {
      values.add(value);
    }
  });
  
  return Array.from(values).sort();
};

/**
 * Truncate text to a specified maximum length, adding ellipsis if needed
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum allowed length (including ellipsis)
 * @returns {string} The truncated text with ellipsis if necessary
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
};