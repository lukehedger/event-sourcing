import { beforeAll, expect, mock, spyOn, test } from "bun:test";
import { randomUUIDv7 } from "bun";
import EventStore, { type EventSubscriber } from "../lib/EventStore";
import { type EventBody, EventTypes } from "../lib/SchemaRegistry";

// Generate a deterministic UUIDv7 ID for use in test assertions
const UUID_V7_DATE = "2025-09-11T13:38:24.255Z";
const UUID_V7 = randomUUIDv7("hex", new Date(UUID_V7_DATE));

beforeAll(() => {
	spyOn(EventStore.prototype, "generateEventId").mockImplementation(
		() => UUID_V7,
	);
});

test("subscribe", () => {
	const eventStore = new EventStore();

	const subscriptionCallback: EventSubscriber = mock(() => {});

	const subscription = eventStore.subscribe(subscriptionCallback);

	const event = {
		data: { test: true } as EventBody.Test,
		type: EventTypes.Test,
	};

	eventStore.append(event);

	expect(subscriptionCallback).toHaveBeenCalledWith({
		id: UUID_V7,
		timestamp: UUID_V7_DATE,
		...event,
	});

	subscription.unsubscribe();

	eventStore.append(event);

	expect(subscriptionCallback).toHaveBeenCalledTimes(1);
});

test("getAllEvents", () => {
	const eventStore = new EventStore();

	eventStore.append({
		data: { test: true } as EventBody.Test,
		type: EventTypes.Test,
	});

	eventStore.append({
		data: { amount: 100 } as EventBody.Credit,
		type: EventTypes.Credit,
	});

	const events = eventStore.getAllEvents();

	expect(events).toBeArray();

	expect(events).toHaveLength(2);

	expect(events[0]).toEqual({
		id: UUID_V7,
		timestamp: UUID_V7_DATE,
		data: { test: true },
		type: EventTypes.Test,
	});

	expect(events[1]).toEqual({
		id: UUID_V7,
		timestamp: UUID_V7_DATE,
		data: { amount: 100 },
		type: EventTypes.Credit,
	});
});
