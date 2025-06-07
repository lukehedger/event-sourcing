import EventStore from "./lib/EventStore";
import {
	type CreditEvent,
	EventTypes,
	type TestEvent,
} from "./lib/SchemaRegistry";

const eventStore = new EventStore();

eventStore.subscribe((event) => {
	console.log(event.type);
});

// TODO: Find better way to type this
eventStore.append({
	data: { test: true } as TestEvent,
	type: EventTypes.Test,
});

eventStore.append({
	data: { amount: 100 } as CreditEvent,
	type: EventTypes.Credit,
});

console.log(eventStore.getAllEvents());

// TODO: Replace this program with tests (using vitest)
