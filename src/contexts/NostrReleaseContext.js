import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { globalPool, globalEventStore } from './appleSauce';
import { DEFAULT_TOLLGATE_PUBKEY, NIP94_KIND, DEFAULT_RELAYS, TEST_MARKER_TAG } from '../constants';
import { mapEventsToStore } from 'applesauce-core';
import { onlyEvents } from 'applesauce-relay';
import { usePublisherDiscovery } from './PublisherDiscoveryContext';


// Define the context type
const NostrReleaseContext = createContext({
  releases: [],
  loading: true,
  error: null,
  currentPubkey: DEFAULT_TOLLGATE_PUBKEY,
  setCurrentPubkey: () => {},
  selectedPubkeys: [DEFAULT_TOLLGATE_PUBKEY],
  refetch: () => {}
});

// Custom hook to use the context
export const useNostrReleases = () => useContext(NostrReleaseContext);

const NostrReleaseProvider = ({ children, channelFilters = ['stable'] }) => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPubkey, setCurrentPubkey] = useState(DEFAULT_TOLLGATE_PUBKEY);
  // Multi-publisher mode: when non-empty, the subscription uses this array
  // instead of the single currentPubkey. When mounted inside
  // PublisherDiscoveryProvider, the checkbox selection drives it; standalone
  // usage falls back to the single official publisher.
  const discovery = usePublisherDiscovery();
  const discoverySelection = discovery && discovery.selectedPubkeys;
  const [selectedPubkeys, setSelectedPubkeys] = useState(
    (discoverySelection && discoverySelection.length > 0)
      ? discoverySelection
      : [DEFAULT_TOLLGATE_PUBKEY]
  );

  // Track the discovery selection while mounted inside the provider tree.
  useEffect(() => {
    if (discoverySelection && discoverySelection.length > 0) {
      setSelectedPubkeys(discoverySelection);
    }
  }, [discoverySelection]);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const subscriptionRef = useRef(null);

  // Handle new release events
  const handleReleaseEvent = useCallback((event) => {
    
    // Ensure AppleSauce events have getMatchingTags method for compatibility
    if (!event.getMatchingTags) {
      event.getMatchingTags = function(tagName) {
        return this.tags?.filter(tag => tag[0] === tagName) || [];
      };
    }
    
    // Skip test-marked events: they carry ["t","test"] from pipeline tests
    // and would pollute the release list.
    const isTestEvent = (event.tags || []).some(
      (t) => Array.isArray(t) && t[0] === 't' && t[1] === TEST_MARKER_TAG
    );
    if (isTestEvent) return;
    
    // Update releases array reactively
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
    
    // Clear empty state and loading when we receive events
    setShowEmptyState(false);
    setLoading(false);
  }, []);

  // Set up subscription when pubkey or channel filters change
  useEffect(() => {
    const authors = selectedPubkeys.length > 0 ? selectedPubkeys : [currentPubkey];
    if (authors.length === 0 || authors.includes(null) || authors.includes(undefined)) return;

    const setupSubscription = () => {
      try {
        setLoading(true);
        setError(null);
        setReleases([]);
        setShowEmptyState(false);
        
        console.log(`NostrReleaseProvider: Setting up subscription for pubkey: ${currentPubkey}`);
        
        // Close existing subscription
        if (subscriptionRef.current) {
          if (subscriptionRef.current.unsubscribe) {
            subscriptionRef.current.unsubscribe();
          }
          if (subscriptionRef.current.emptyStateTimer) {
            clearTimeout(subscriptionRef.current.emptyStateTimer);
          }
        }

        // Create filter for NIP-94 events from the selected publishers.
        // authors is a native Nostr multi-value filter, so checkbox
        // selections collapse into ONE subscription.
        const filter = {
          kinds: [NIP94_KIND],
          authors,
          limit: 5000
        };

        // Add channel filter only if channelFilters is defined and has values
        if (channelFilters !== undefined && channelFilters.length > 0) {
          filter["#c"] = channelFilters;
        } else if (channelFilters !== undefined) {
          // If channelFilters is defined but empty, default to stable
          filter["#c"] = ['stable'];
        }
        // If channelFilters is undefined, don't add channel filter at all

        // Dev releases are a firehose (one per branch push). Relays like
        // damus/nos.lol cap responses at ~500 events per filter, so a
        // global fetch competes our dev builds out of the window. When
        // the user has dev selected, limit 'since' to the last 14 days
        // so only recent dev builds get returned. Stable/beta/alpha keep
        // the full history.
        const activeChannels = filter["#c"];
        if (activeChannels && activeChannels.includes('dev')) {
          const DEV_WINDOW_DAYS = 1;
          filter.since = Math.floor(Date.now() / 1000) - DEV_WINDOW_DAYS * 86400;
        }
        
        console.log("NostrReleaseProvider: Filter:", filter);
        
        // Create AppleSauce subscription
        const currentSubscription = globalPool
          .subscription(DEFAULT_RELAYS, filter)
          .pipe(
            onlyEvents(),
            mapEventsToStore(globalEventStore)
          )
          .subscribe(handleReleaseEvent);
        
        // Set a 5-second timer to stop loading and potentially show empty state
        // The stream remains open and events can still arrive after this
        const emptyStateTimer = setTimeout(() => {
          console.log("NostrReleaseProvider: 5 seconds elapsed, stopping loading spinner");
          setLoading(false);
          setReleases(prevReleases => {
            if (prevReleases.length === 0) {
              console.log("NostrReleaseProvider: No events received, showing empty state");
              setShowEmptyState(true);
            }
            return prevReleases;
          });
        }, 5000);
        
        // Store subscription and timer reference
        subscriptionRef.current = {
          ...currentSubscription,
          emptyStateTimer
        };
        
      } catch (err) {
        console.error("NostrReleaseProvider: Error setting up subscription:", err);
        setError(`Failed to fetch releases: ${err.message}`);
        setLoading(false);
      }
    };

    setupSubscription();
    
    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        console.log("NostrReleaseProvider: Cleaning up subscription");
        if (subscriptionRef.current.unsubscribe) {
          subscriptionRef.current.unsubscribe();
        }
        if (subscriptionRef.current.emptyStateTimer) {
          clearTimeout(subscriptionRef.current.emptyStateTimer);
        }
      }
    };
  }, [currentPubkey, selectedPubkeys, channelFilters, handleReleaseEvent]);

  // Function to manually refetch releases
  const refetch = useCallback(() => {
    if (currentPubkey) {
      setReleases([]);
      setLoading(true);
      setShowEmptyState(false);
      // The subscription will automatically refetch when we clear the releases
    }
  }, [currentPubkey]);


  const value = {
    releases,
    loading,
    error,
    currentPubkey,
    setCurrentPubkey,
    selectedPubkeys,
    setSelectedPubkeys,
    refetch,
    showEmptyState
  };

  return (
    <NostrReleaseContext.Provider value={value}>
      {children}
    </NostrReleaseContext.Provider>
  );
};

export default NostrReleaseProvider;