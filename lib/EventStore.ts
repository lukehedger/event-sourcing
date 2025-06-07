import { decodeTime, ulid } from "ulid";
import * as v from "valibot";

const EventSchema = v.object({
	data: v.pipe(v.any()), // TODO: registry of accepted event schema
	id: v.pipe(v.string(), v.ulid()),
	timestamp: v.pipe(v.string(), v.isoTimestamp()),
	type: v.pipe(v.string()), // TODO: enum of event types from schema registry
});

type Event = v.InferOutput<typeof EventSchema>;

type EventSubscriber = (event: Event) => void;

/**
 * In-memory event store, with support for subscriptions
 */
export default class EventStore {
	events: Array<Event>;
	subscribers: Array<EventSubscriber>;

	constructor() {
		this.events = [];
		this.subscribers = [];
	}

	/**
	 * Append an event to the store
	 *
	 * @param {Object} event - The event to store
	 * @param {Object} event.data - The event payload
	 * @param {string} event.id - The event id
	 * @param {string} event.timestamp - The timestamp of the event
	 * @param {string} event.type - The type of the event
	 */
	append(event: Event) {
		// Validate event
		v.parse(EventSchema, event);

		// Store event
		this.events.push(event);

		// Notify subscribers
		for (const subscriber of this.subscribers) {
			subscriber(event);
		}

		return;
	}

	/**
	 * Build a valid event to append to the store.
	 *
	 * Automatically generates a valid ULID-based event ID and timestamp.
	 *
	 * @param {Object} event - The data to use for the base of the event
	 * @param {string} event.type - The type of the event
	 * @param {Object} event.data - The event payload
	 *
	 * @returns {Object} The built event
	 */
	buildEvent(baseEvent: Pick<Event, "data" | "type">): Event {
		const eventId = ulid();

		return {
			data: baseEvent.data,
			id: eventId,
			timestamp: new Date(decodeTime(eventId)).toISOString(),
			type: baseEvent.type,
		};
	}

	/**
	 * Get all events from the store
	 *
	 * @returns {Array} All events
	 */
	getAllEvents(): Array<Event> {
		return [...this.events];
	}

	/**
	 * Subscribe to new events
	 *
	 * @param {Function} callback - Function to call when new events are appended
	 *
	 * @returns {Function} Unsubscribe function
	 */
	subscribe(callback: EventSubscriber) {
		this.subscribers.push(callback);

		// Return unsubscribe function
		return () => {
			this.subscribers = this.subscribers.filter((sub) => sub !== callback);
		};
	}
}
