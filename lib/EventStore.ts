import { decodeTime, ulid } from "ulid";
import * as v from "valibot";
import { EventTypes, SchemaRegistry } from "./SchemaRegistry";

const EventSchema = v.object({
	data: v.union(SchemaRegistry),
	id: v.pipe(v.string(), v.ulid()),
	timestamp: v.pipe(v.string(), v.isoTimestamp()),
	type: v.pipe(v.string(), v.enum(EventTypes)),
});

type Event = v.InferOutput<typeof EventSchema>;

type BaseEvent = Pick<Event, "data" | "type">;

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
	 * @param {string} event.type - The type of the event
	 */
	append(baseEvent: BaseEvent) {
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
	 * Build a valid event to append to the store.
	 *
	 * Merges event data with generated event metadata, including a ULID-based event ID and timestamp.
	 *
	 * @private
	 *
	 * @param {Object} baseEvent - The data to use for the base of the event
	 * @param {string} baseEvent.type - The type of the event
	 * @param {Object} baseEvent.data - The event payload
	 *
	 * @returns {Object} The built event
	 */
	private buildEvent(baseEvent: BaseEvent): Event {
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
	 * @param callback - Function to call when new events are appended
	 *
	 * @returns Unsubscribe function
	 */
	subscribe(callback: EventSubscriber): { unsubscribe: () => void } {
		this.subscribers.push(callback);

		// Return unsubscribe function
		return {
			unsubscribe: () => {
				this.subscribers = this.subscribers.filter((sub) => sub !== callback);
			},
		};
	}

	/**
	 * Validate an event against the schema registry
	 *
	 * @param {Object} event - The event to validate
	 * @param {Object} event.data - The event payload
	 * @param {string} event.id - The event id
	 * @param {string} event.timestamp - The timestamp of the event
	 * @param {string} event.type - The type of the event
	 */
	private validateEvent(event: Event) {
		v.parse(EventSchema, event);
	}
}
