import { getTagValue } from "applesauce-core/helpers";

/**
 * Helper function to get matching tags from AppleSauce events
 * @param {Object} release - The Nostr event containing release information
 * @param {string} tagName - The tag name to search for
 * @returns {Array} Array of matching tags
 */
const getMatchingTags = (release, tagName) => {
  if (typeof release.getMatchingTags === 'function') {
    return release.getMatchingTags(tagName);
  }
  // AppleSauce format: tags is an array of [tagName, value, ...] arrays
  return release.tags?.filter(tag => tag[0] === tagName) || [];
};

/**
 * Get a display-friendly version number from a Nostr event
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} A formatted version string
 */
export const getReleaseVersion = (release) => {
  // Prefer new standardized 'version' tag
  const version = getTagValue(release, "version")
  if (version) return version;
  
  // Fallback to deprecated format tags
  return getTagValue(release, "tollgate_os_version") ||
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
 * Get the formatted release date and time for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} A formatted date and time string
 */
export const getReleaseDateWithTime = (release) => {
  if (!release.created_at) return "Unknown";
  
  const date = new Date(release.created_at * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get the release channel from a release event
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The release channel
 */
export const getReleaseChannel = (release) => {
  return getMatchingTags(release, "release_channel")?.[0]?.[1] || 'dev';
};

/**
 * Get architecture details for a release
 * @param {Object} release - The Nostr event containing release information 
 * @returns {string} The architecture or "Unknown"
 */
export const getReleaseArchitecture = (release) => {
  return getMatchingTags(release, "architecture")?.[0]?.[1] || "Unknown";
};

/**
 * Get compression type for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The compression type or "none"
 */
export const getReleaseCompression = (release) => {
  return getMatchingTags(release, "compression")?.[0]?.[1] || "none";
};

/**
 * Get OpenWRT version details
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The OpenWRT version or "Unknown"
 */
export const getReleaseOpenWrtVersion = (release) => {
  return getMatchingTags(release, "openwrt_version")?.[0]?.[1] || "Unknown";
};

/**
 * Get device ID for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The device ID or "Unknown"
 */
export const getReleaseDeviceId = (release) => {
  return getMatchingTags(release, "device_id")?.[0]?.[1] || "Unknown";
};

/**
 * Get supported devices for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The supported devices or "Unknown"
 */
export const getReleaseSupportedDevices = (release) => {
  return getMatchingTags(release, "supported_devices")?.[0]?.[1] || "Unknown";
};

/**
 * Get the download URL for a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The download URL or null
 */
export const getReleaseDownloadUrl = (release) => {
  return getMatchingTags(release, "url")?.[0]?.[1] || null;
};

/**
 * Get the file hash for verification
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The file hash or null
 */
export const getReleaseFileHash = (release) => {
  return getMatchingTags(release, "x")?.[0]?.[1] ||
         getMatchingTags(release, "ox")?.[0]?.[1] || null;
};

/**
 * Get the MIME type of the release file
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} The MIME type or "application/octet-stream"
 */
export const getReleaseMimeType = (release) => {
  return getMatchingTags(release, "m")?.[0]?.[1] || "application/octet-stream";
};

/**
 * Determine the product type from a release
 * @param {Object} release - The Nostr event containing release information
 * @returns {string} Either 'tollgate-os', 'tollgate-wrt', or 'tollgate-module-basic-go'
 */
export const getReleaseProductType = (release) => {
  // Prefer new standardized 'name' tag
  const name = getMatchingTags(release, "name")?.[0]?.[1];
  if (name) {
    if (name.includes('tollgate-os')) return 'tollgate-os';
    if (name.includes('tollgate-wrt')) return 'tollgate-wrt';
    if (name.includes('tollgate-module-basic-go')) return 'tollgate-module-basic-go';
  }
  
  // Fallback to deprecated 'package_name' tag
  const packageName = getMatchingTags(release, "package_name")?.[0]?.[1];
  if (packageName) {
    if (packageName.includes('tollgate-module-basic-go')) return 'tollgate-module-basic-go';
    if (packageName.includes('tollgate-wrt')) return 'tollgate-wrt';
  }
  
  // Check if it has deprecated version tags
  if (getMatchingTags(release, "tollgate_os_version")?.[0]?.[1]) {
    return 'tollgate-os';
  }

  
  // Fallback: check content, filename, or URL
  const content = release.content?.toLowerCase() || '';
  const url = getReleaseDownloadUrl(release)?.toLowerCase() || '';
  const filename = getMatchingTags(release, "filename")?.[0]?.[1]?.toLowerCase() || '';
  
  if (content.includes('basic') || url.includes('basic') || filename.includes('basic') ||
      content.includes('module') || url.includes('module') || filename.includes('module')) {
    return 'tollgate-module-basic-go';
  }
  
  if (content.includes('core') || url.includes('core') || filename.includes('core')) {
    return 'tollgate-wrt';
  }
  
  // Default to OS
  return 'tollgate-os';
};

/**
 * Get a human-readable product name
 * @param {string} productType - The product type ('tollgate-os', 'tollgate-wrt', or 'tollgate-module-basic-go')
 * @returns {string} Human-readable product name
 */
export const getProductDisplayName = (productType) => {
  switch (productType) {
    case 'tollgate-os':
      return 'TollGate OS';
    case 'tollgate-wrt':
      return 'TollGate WRT';
    case 'tollgate-module-basic-go':
      return 'TollGate Basic Module';
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
    
    return true;
  });
};

/**
 * Deduplicate releases by version only, keeping the first release found for each version
 * This shows one release per version regardless of product type or architecture
 * @param {Array} releases - Array of release events
 * @returns {Array} Deduplicated releases
 */
export const deduplicateReleases = (releases) => {
  if (!releases || !Array.isArray(releases)) return [];
  
  const releaseMap = new Map();
  
  releases.forEach(release => {
    const version = getReleaseVersion(release);
    
    // Only keep the first release for each version (by creation time)
    if (!releaseMap.has(version) || release.created_at > releaseMap.get(version).created_at) {
      releaseMap.set(version, release);
    }
  });
  
  return Array.from(releaseMap.values());
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
 * Check if a release is a development release
 * @param {Object} release - The Nostr event containing release information
 * @returns {boolean} True if this is a dev release
 */
export const isDevRelease = (release) => {
  const channel = getReleaseChannel(release);
  return channel === 'dev';
};

/**
 * Check if a release is a pre-release (beta, alpha, or dev)
 * @param {Object} release - The Nostr event containing release information
 * @returns {boolean} True if this is a pre-release
 */
export const isPreRelease = (release) => {
  const channel = getReleaseChannel(release);
  return ['beta', 'alpha', 'dev'].includes(channel);
};

/**
 * Count releases excluding dev releases
 * @param {Array} releases - Array of release events
 * @returns {Object} Object with stable and prerelease counts
 */
export const countReleases = (releases) => {
  if (!releases || !Array.isArray(releases)) {
    return { total: 0, stable: 0, prerelease: 0 };
  }
  
  const nonDevReleases = releases.filter(release => !isDevRelease(release));
  const stableReleases = nonDevReleases.filter(release => !isPreRelease(release));
  const prereleases = nonDevReleases.filter(release => isPreRelease(release));
  
  return {
    total: nonDevReleases.length,
    stable: stableReleases.length,
    prerelease: prereleases.length
  };
};

/**
 * Get display text for release count
 * @param {Array} releases - Array of release events
 * @returns {string} Formatted release count text
 */
export const getReleaseCountText = (releases) => {
  const counts = countReleases(releases);
  
  if (counts.total === 0) {
    return '0 releases';
  }
  
  if (counts.prerelease === 0) {
    return `${counts.total} releases`;
  }
  
  return `${counts.total} releases ,${counts.prerelease} pre`;
};

/**
 * Find all releases with the same version and product type but different architectures/devices
 * @param {Array} releases - Array of all release events
 * @param {Object} currentRelease - The current release to find alternatives for
 * @returns {Array} Array of alternative releases
 */
export const findAlternativeReleases = (releases, currentRelease) => {
  if (!releases || !Array.isArray(releases) || !currentRelease) return [];
  
  const currentVersion = getReleaseVersion(currentRelease);
  const currentProductType = getReleaseProductType(currentRelease);
  const currentArchitecture = getReleaseArchitecture(currentRelease);
  const currentDeviceId = getReleaseDeviceId(currentRelease);
  
  return releases.filter(release => {
    if (release.id === currentRelease.id) return false; // Exclude current release
    
    const version = getReleaseVersion(release);
    const productType = getReleaseProductType(release);
    
    // Must match version and product type
    if (version !== currentVersion || productType !== currentProductType) {
      return false;
    }
    
    // For OS releases, show different device_ids
    if (productType === 'tollgate-os') {
      const deviceId = getReleaseDeviceId(release);
      return deviceId !== currentDeviceId;
    }
    
    // For packages (core, modules), show different architectures
    const architecture = getReleaseArchitecture(release);
    return architecture !== currentArchitecture;
  });
};

/**
 * Group releases by architecture, with compression variants for each architecture
 * @param {Array} releases - Array of release events
 * @returns {Array} Array of architecture groups with compression variants
 */
export const groupReleasesByArchitecture = (releases) => {
  if (!releases || !Array.isArray(releases)) return [];
  
  const architectureMap = new Map();
  
  releases.forEach(release => {
    const architecture = getReleaseArchitecture(release);
    const compression = getReleaseCompression(release);
    
    if (!architectureMap.has(architecture)) {
      architectureMap.set(architecture, {
        architecture,
        compressionVariants: new Map() // Use Map to deduplicate by compression type
      });
    }
    
    const archGroup = architectureMap.get(architecture);
    
    // Only add if this compression type hasn't been added yet, or if it's newer
    if (!archGroup.compressionVariants.has(compression) ||
        release.created_at > archGroup.compressionVariants.get(compression).created_at) {
      archGroup.compressionVariants.set(compression, release);
    }
  });
  
  // Convert Maps to arrays and sort compression variants
  const result = Array.from(architectureMap.values()).map(group => ({
    architecture: group.architecture,
    compressionVariants: Array.from(group.compressionVariants.entries())
      .map(([compression, release]) => ({ compression, release }))
      .sort((a, b) => {
        if (a.compression === 'none') return -1;
        if (b.compression === 'none') return 1;
        return a.compression.localeCompare(b.compression);
      })
  }));
  
  return result;
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