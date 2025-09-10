import EventStore from "./lib/EventStore";
import {
	type CreditEvent,
	type EventBody,
	EventTypes,
} from "./lib/SchemaRegistry";

const eventStore = new EventStore();

const subscription = eventStore.subscribe((event) => {
	console.log(`event received: ${event.type}`);
});

eventStore.append({
	data: { test: true } as EventBody.Test,
	type: EventTypes.Test,
});

subscription.unsubscribe();

eventStore.append({
	data: { amount: 100 } as CreditEvent,
	type: EventTypes.Credit,
});

console.log(eventStore.getAllEvents());

// TODO: Replace this program with tests (using vitest)
