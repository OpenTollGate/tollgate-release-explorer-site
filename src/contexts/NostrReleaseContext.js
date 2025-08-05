import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { globalPool, globalEventStore } from './appleSauce';
import { DEFAULT_TOLLGATE_PUBKEY, NIP94_KIND, DEFAULT_RELAYS } from '../constants';
import { mapEventsToStore } from 'applesauce-core';
import { onlyEvents } from 'applesauce-relay';


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
  const [subscription, setSubscription] = useState(null);
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Handle new release events
  const handleReleaseEvent = useCallback((event) => {
    console.log("NostrReleaseProvider: Received new release event:", event.id);
    
    // Ensure AppleSauce events have getMatchingTags method for compatibility
    if (!event.getMatchingTags) {
      event.getMatchingTags = function(tagName) {
        return this.tags?.filter(tag => tag[0] === tagName) || [];
      };
    }
    
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

  // Set up subscription when pubkey changes
  useEffect(() => {
    if (!currentPubkey) return;

    const setupSubscription = () => {
      try {
        setLoading(true);
        setError(null);
        setReleases([]);
        setShowEmptyState(false);
        
        console.log(`NostrReleaseProvider: Setting up subscription for pubkey: ${currentPubkey}`);
        
        // Close existing subscription
        if (subscription) {
          subscription.unsubscribe();
        }

        // Create filter for NIP-94 events from the specified publisher
        const filter = {
          kinds: [NIP94_KIND],
          authors: [currentPubkey],
          limit: 5000
        };
        
        console.log("NostrReleaseProvider: Filter:", filter);
        
        // Create AppleSauce subscription
        const currentSubscription = globalPool
          .subscription(DEFAULT_RELAYS, filter)
          .pipe(
            onlyEvents(),
            mapEventsToStore(globalEventStore)
          )
          .subscribe(handleReleaseEvent);
        
        setSubscription(currentSubscription);
        
        // Set a 5-second timer to show empty state if no events are received
        const emptyStateTimer = setTimeout(() => {
          if (releases.length === 0) {
            console.log("NostrReleaseProvider: No events received after 5 seconds, showing empty state");
            setShowEmptyState(true);
            setLoading(false);
          }
        }, 5000);
        
        // Store timer reference to clean it up
        setSubscription({
          ...currentSubscription,
          emptyStateTimer
        });
        
      } catch (err) {
        console.error("NostrReleaseProvider: Error setting up subscription:", err);
        setError(`Failed to fetch releases: ${err.message}`);
        setLoading(false);
      }
    };

    setupSubscription();
    
    // Cleanup function
    return () => {
      if (subscription) {
        console.log("NostrReleaseProvider: Cleaning up subscription");
        if (subscription.unsubscribe) {
          subscription.unsubscribe();
        }
        if (subscription.emptyStateTimer) {
          clearTimeout(subscription.emptyStateTimer);
        }
      }
    };
  }, [currentPubkey, handleReleaseEvent]);

  // Function to manually refetch releases
  const refetch = useCallback(() => {
    if (currentPubkey) {
      setReleases([]);
      setLoading(true);
      // The subscription will automatically refetch when we clear the releases
    }
  }, [currentPubkey]);


  const value = {
    releases,
    loading,
    error,
    currentPubkey,
    setCurrentPubkey,
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