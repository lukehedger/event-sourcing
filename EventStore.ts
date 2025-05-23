import { decodeTime, ulid } from "ulid";
import * as v from "valibot";

const EventSchema = v.object({
  data: v.pipe(v.any()), // TODO: registry of accepted event schema
  type: v.pipe(v.string()), // TODO: enum of event types from schema registry
});

type Event = v.InferOutput<typeof EventSchema>;

/**
 * In-memory event store, with support for subscriptions
 */
export default class EventStore {
  events: Event[];
  subscribers: Function[];

  constructor() {
    this.events = [];
    this.subscribers = [];
  }

  /**
   * Append an event to the store
   *
   * @param {Object} event - The event to store
   * @param {string} event.type - The type of the event
   * @param {Object} event.data - The event payload
   *
   * @returns {Object} The stored event with metadata
   */
  append(event: Event) {
    // Validate event
    v.parse(EventSchema, event);

    const eventId = ulid();

    const storedEvent = {
      ...event,
      id: eventId,
      timestamp: decodeTime(eventId),
    };

    this.events.push(storedEvent);

    // Notify subscribers
    this.subscribers.forEach(subscriber => {
      subscriber(storedEvent);
    });

    return storedEvent;
  }

  /**
   * Get all events from the store
   *
   * @returns {Array} All events
   */
  getAllEvents() {
    return [...this.events];
  }

  /**
   * Subscribe to new events
   *
   * @param {Function} callback - Function to call when new events are appended
   *
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
}
