import { EventStore } from "applesauce-core";
import { createEventLoader } from "applesauce-loaders/loaders";
import { RelayPool } from "applesauce-relay";

// Create a relay pool
export const globalPool = new RelayPool();

// Create a single event store for the entire app
export const globalEventStore = new EventStore();

// Create an event loader (do this once at the app level)
export const globalEventLoader = createEventLoader(globalPool, globalEventStore);