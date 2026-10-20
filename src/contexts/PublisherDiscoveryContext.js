import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { globalPool, globalEventStore } from './appleSauce';
import { DEFAULT_TOLLGATE_PUBKEY, NIP94_KIND, DEFAULT_RELAYS, DISCOVERY_TAG } from '../constants';
import { onlyEvents } from 'applesauce-relay';

const DISCOVERY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h rolling window for tag-scoped discovery

const PublisherDiscoveryContext = createContext({
  publishers: [],
  selectedPubkeys: [],
  togglePublisher: () => {},
  selectAll: () => {},
  clearAll: () => {},
  discoveryLoading: true
});

export const usePublisherDiscovery = () => useContext(PublisherDiscoveryContext);

export const PublisherDiscoveryProvider = ({ children }) => {
  const [publishers, setPublishers] = useState([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  const [selectedPubkeys, setSelectedPubkeys] = useState([DEFAULT_TOLLGATE_PUBKEY]);
  const subscriptionRef = useRef(null);

  // Restore persisted selection, seeded with the official key
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tollgate_selected_publishers');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) {
          setSelectedPubkeys(arr.includes(DEFAULT_TOLLGATE_PUBKEY) ? arr : [DEFAULT_TOLLGATE_PUBKEY, ...arr]);
        }
      }
    } catch (e) {
      console.warn('PublisherDiscovery: could not restore selection', e);
    }
  }, []);

  const persistSelection = useCallback((next) => {
    try {
      localStorage.setItem('tollgate_selected_publishers', JSON.stringify(next));
    } catch (e) { /* non-fatal */ }
  }, []);

  const togglePublisher = useCallback((pubkey) => {
    setSelectedPubkeys((prev) => {
      let next;
      if (prev.includes(pubkey)) {
        next = prev.filter((p) => p !== pubkey);
        if (next.length === 0) next = [DEFAULT_TOLLGATE_PUBKEY];
      } else {
        next = [...prev, pubkey];
      }
      persistSelection(next);
      return next;
    });
  }, [persistSelection]);

  const selectAll = useCallback(() => {
    setSelectedPubkeys((prev) => {
      const next = Array.from(new Set([DEFAULT_TOLLGATE_PUBKEY, ...publishers.map((p) => p.pubkey)]));
      persistSelection(next);
      return next;
    });
  }, [publishers, persistSelection]);

  const clearAll = useCallback(() => {
    setSelectedPubkeys(() => {
      persistSelection([DEFAULT_TOLLGATE_PUBKEY]);
      return [DEFAULT_TOLLGATE_PUBKEY];
    });
  }, [persistSelection]);

  // Tag-scoped discovery subscription: no author filter, only #t
  useEffect(() => {
    const filter = {
      kinds: [NIP94_KIND],
      '#t': [DISCOVERY_TAG],
      since: Math.floor((Date.now() - DISCOVERY_WINDOW_MS) / 1000)
    };
    console.log('PublisherDiscovery: scanning for tagged publishers');

    let sub;
    try {
      sub = globalPool.subscription(DEFAULT_RELAYS, filter).pipe(onlyEvents()).subscribe({
        next: (event) => {
          const pubkey = event.pubkey;
          if (!pubkey) return;
          setPublishers((prev) => {
            if (prev.some((p) => p.pubkey === pubkey)) return prev;
            const nameTag = (event.tags || []).find((t) => t[0] === 'name' || t[0] === 'n');
            const productName = nameTag ? nameTag[1] : null;
            return [...prev, { pubkey, name: nameTag ? nameTag[1] : null, lastSeen: event.created_at, productName }];
          });
        },
        error: (err) => console.warn('PublisherDiscovery: subscription error', err)
      });
    } catch (err) {
      console.warn('PublisherDiscovery: setup failed', err);
    }

    const timer = setTimeout(() => setDiscoveryLoading(false), 5000);

    return () => {
      if (sub && sub.unsubscribe) sub.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const value = {
    publishers,
    selectedPubkeys,
    togglePublisher,
    selectAll,
    clearAll,
    discoveryLoading
  };

  return (
    <PublisherDiscoveryContext.Provider value={value}>
      {children}
    </PublisherDiscoveryContext.Provider>
  );
};

export default PublisherDiscoveryProvider;
