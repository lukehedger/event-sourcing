import { randomUUIDv7 } from "bun";
import * as v from "valibot";
import { EventTypes, SchemaRegistry } from "./SchemaRegistry";

const EventSchema = v.object({
	data: v.union(SchemaRegistry),
	id: v.pipe(v.string(), v.uuid()),
	timestamp: v.pipe(v.string(), v.isoTimestamp()),
	type: v.pipe(v.string(), v.enum(EventTypes)),
});

type Event = v.InferOutput<typeof EventSchema>;

export type BaseEvent = Pick<Event, "data" | "type">;

export type EventSubscriber = (event: Event) => void;

/**
 * Extract timestamp from UUID v7
 *
 * @param {string} uuidv7 - The UUID v7 string
 *
 * @returns {number} Timestamp in milliseconds since Unix epoch
 */
function decodeTime(uuidv7: string): number {
	// Remove hyphens and convert to lowercase
	const hex = uuidv7.replace(/-/g, "").toLowerCase();

	// Extract the first 48 bits (12 hex characters) which contain the timestamp
	const timestampHex = hex.substring(0, 12);

	// Convert hex to number (timestamp in milliseconds)
	return Number.parseInt(timestampHex, 16);
}

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
	 * Build a valid event to append to the store.
	 *
	 * Merges event data with generated event metadata, including a UUID v7-based event ID and timestamp.
	 *
	 * @private
	 *
	 * @param {Object} baseEvent - The data to use for the base of the event
	 * @param {string} baseEvent.type - The type of the event
	 * @param {Object} baseEvent.data - The event body
	 *
	 * @returns {Object} The built event
	 */
	private buildEvent(baseEvent: BaseEvent): Event {
		const eventId = this.generateEventId();

		return {
			data: baseEvent.data,
			id: eventId,
			timestamp: new Date(decodeTime(eventId)).toISOString(),
			type: baseEvent.type,
		};
	}

	/**
	 * Validate an event against the schema registry
	 *
	 * @param {Object} event - The event to validate
	 * @param {Object} event.data - The event body
	 * @param {string} event.id - The event id
	 * @param {string} event.timestamp - The timestamp of the event
	 * @param {string} event.type - The type of the event
	 */
	private validateEvent(event: Event) {
		v.parse(EventSchema, event);
	}

	/**
	 * Append an event to the store
	 *
	 * @param {Object} event - The event to store
	 * @param {Object} event.data - The event body
	 * @param {string} event.type - The type of the event
	 */
	public append(baseEvent: BaseEvent) {
		// Combine event data with generated event metadata
		const event = this.buildEvent(baseEvent);

		// Validate event against schema registry
		this.validateEvent(event);

		// Store event
		this.events.push(event);

		// Notify subscribers
		for (const subscriber of this.subscribers) {
			subscriber(event);
		}

		return;
	}

	/**
	 * Generate a UUID v7-based identifier for use as an event ID
	 *
	 * @returns {string} UUID v7 event ID
	 */
	public generateEventId(): string {
		return randomUUIDv7();
	}

	/**
	 * Get all events from the store
	 *
	 * @returns {Array} All events
	 */
	public getAllEvents(): Array<Event> {
		return [...this.events];
	}

	/**
	 * Subscribe to new events
	 *
	 * @param callback - Function to call when new events are appended
	 *
	 * @returns Unsubscribe function
	 */
	public subscribe(callback: EventSubscriber): { unsubscribe: () => void } {
		this.subscribers.push(callback);

		// Return unsubscribe function
		return {
			unsubscribe: () => {
				this.subscribers = this.subscribers.filter((sub) => sub !== callback);
			},
		};
	}
}
