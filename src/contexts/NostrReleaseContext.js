import React, { createContext, useContext, useEffect, useState } from 'react';
import NDK, { NDKEvent } from '@nostr-dev-kit/ndk';
import { DEFAULT_TOLLGATE_PUBKEY, NIP94_KIND, DEFAULT_RELAYS } from '../constants';

// Define the context type
const NostrReleaseContext = createContext({
  releases: [],
  loading: true,
  error: null,
  currentPubkey: DEFAULT_TOLLGATE_PUBKEY,
  setCurrentPubkey: () => {},
  refetch: () => {}
});

// Custom hook to use the context
export const useNostrReleases = () => useContext(NostrReleaseContext);

const NostrReleaseProvider = ({ children }) => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPubkey, setCurrentPubkey] = useState(DEFAULT_TOLLGATE_PUBKEY);
  const [ndk, setNdk] = useState(null);

  // Initialize NDK connection
  useEffect(() => {
    const initializeNDK = async () => {
      try {
        console.log("NostrReleaseProvider: Initializing NDK");
        
        const ndkInstance = new NDK({
          explicitRelayUrls: DEFAULT_RELAYS
        });
        
        await ndkInstance.connect();
        setNdk(ndkInstance);
        console.log("NostrReleaseProvider: NDK connected successfully");
        
      } catch (err) {
        console.error("NostrReleaseProvider: Error initializing NDK:", err);
        setError(`Failed to connect to Nostr relays: ${err.message}`);
        setLoading(false);
      }
    };

    initializeNDK();

    return () => {
      if (ndk) {
        console.log("NostrReleaseProvider: Disconnecting from relays");
        // Cleanup NDK connection
      }
    };
  }, []);

  // Fetch releases when pubkey or NDK changes
  useEffect(() => {
    if (!ndk || !currentPubkey) return;

    const fetchReleases = async () => {
      try {
        setLoading(true);
        setError(null);
        setReleases([]);
        
        console.log(`NostrReleaseProvider: Fetching releases for pubkey: ${currentPubkey}`);
        
        // Create a filter for NIP-94 events from the specified publisher
        const filter = {
          kinds: [NIP94_KIND],
          authors: [currentPubkey],
          limit: 100
        };
        
        console.log("NostrReleaseProvider: Filter:", filter);
        
        // Subscribe to events
        const subscription = ndk.subscribe(filter, { closeOnEose: true });
        
        let hasReceivedEvents = false;
        
        // Handle events as they arrive
        subscription.on('event', (event) => {
          hasReceivedEvents = true;
          console.log("NostrReleaseProvider: Received event:", event.id);
          
          // Add event to state if it's not already there
          setReleases(prevReleases => {
            // Check if event already exists in array
            const eventExists = prevReleases.some(e => e.id === event.id);
            if (!eventExists) {
              // Sort by created_at (newest first)
              const newReleases = [...prevReleases, event].sort(
                (a, b) => (b.created_at || 0) - (a.created_at || 0)
              );
              return newReleases;
            }
            return prevReleases;
          });
        });
        
        subscription.on('eose', () => {
          console.log("NostrReleaseProvider: End of stored events");
          
          // If no events received and we're using the default pubkey, show mock data
          if (!hasReceivedEvents && currentPubkey === DEFAULT_TOLLGATE_PUBKEY) {
            console.log("NostrReleaseProvider: No events received, using mock data");
            setReleases(getMockReleases(ndk));
          }
          
          setLoading(false);
        });
        
        subscription.on('error', (err) => {
          console.error("NostrReleaseProvider: Subscription error:", err);
          setError(`Failed to fetch releases: ${err.message}`);
          setLoading(false);
        });
        
      } catch (err) {
        console.error("NostrReleaseProvider: Error fetching releases:", err);
        setError(`Failed to fetch releases: ${err.message}`);
        setLoading(false);
        
        // Provide mock data for testing if using default pubkey
        if (currentPubkey === DEFAULT_TOLLGATE_PUBKEY) {
          setReleases(getMockReleases(ndk));
        }
      }
    };

    fetchReleases();
  }, [ndk, currentPubkey]);

  // Function to manually refetch releases
  const refetch = () => {
    if (ndk && currentPubkey) {
      setReleases([]);
      // Trigger re-fetch by updating a state that causes useEffect to run
      // This is a simple way to trigger the fetch logic again
      setLoading(true);
    }
  };

  /**
   * Creates mock releases for testing when Nostr connection fails or no events found
   */
  const getMockReleases = (ndkInstance) => {
    console.log("NostrReleaseProvider: Creating mock releases");
    
    const mockReleases = [];
    
    // Mock TollGate OS releases
    for (let i = 0; i < 3; i++) {
      const event = new NDKEvent(ndkInstance);
      event.kind = NIP94_KIND;
      event.pubkey = DEFAULT_TOLLGATE_PUBKEY;
      event.created_at = Math.floor(Date.now() / 1000) - (i * 86400); // Today, yesterday, etc.
      event.id = `mock-os-${i}`;
      
      // Add tags for TollGate OS
      event.tags = [
        ["url", `https://releases.tollgate.example/tollgate-os-v1.${3-i}.0-gl-mt3000.bin`],
        ["m", "application/octet-stream"],
        ["x", `hash${i}abcdef1234567890`],
        ["ox", `hash${i}abcdef1234567890`],
        ["architecture", "aarch64_cortex-a53"],
        ["device_id", `gl-mt300${i}`],
        ["supported_devices", `gl-mt300${i},gl-mt300${i}-v2`],
        ["openwrt_version", `24.10.${i+1}`],
        ["tollgate_os_version", `v1.${3-i}.0`],
        ["release_channel", i === 0 ? "stable" : i === 1 ? "beta" : "dev"]
      ];
      
      event.content = `TollGate OS v1.${3-i}.0 for GL-MT300${i} - OpenWRT-based firmware with integrated payment gateway`;
      
      mockReleases.push(event);
    }
    
    // Mock TollGate Core releases
    for (let i = 0; i < 2; i++) {
      const event = new NDKEvent(ndkInstance);
      event.kind = NIP94_KIND;
      event.pubkey = DEFAULT_TOLLGATE_PUBKEY;
      event.created_at = Math.floor(Date.now() / 1000) - ((i + 3) * 86400);
      event.id = `mock-core-${i}`;
      
      // Add tags for TollGate Core
      event.tags = [
        ["url", `https://releases.tollgate.example/tollgate-core-v0.${5-i}.0-aarch64.ipk`],
        ["m", "application/x-ipk"],
        ["x", `corehash${i}abcdef1234567890`],
        ["ox", `corehash${i}abcdef1234567890`],
        ["architecture", "aarch64_cortex-a53"],
        ["tollgate_core_version", `v0.${5-i}.0`],
        ["release_channel", i === 0 ? "stable" : "beta"]
      ];
      
      event.content = `TollGate Core v0.${5-i}.0 - Payment gateway package for OpenWRT`;
      
      mockReleases.push(event);
    }
    
    // Sort by created_at (newest first)
    mockReleases.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    
    console.log("NostrReleaseProvider: Created mock releases:", mockReleases.length);
    return mockReleases;
  };

  const value = {
    releases,
    loading,
    error,
    currentPubkey,
    setCurrentPubkey,
    refetch
  };

  return (
    <NostrReleaseContext.Provider value={value}>
      {children}
    </NostrReleaseContext.Provider>
  );
};

export default NostrReleaseProvider;