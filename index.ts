import EventStore from "./lib/EventStore";

const eventStore = new EventStore();

eventStore.subscribe((event) => {
	console.log("new", event);
});

eventStore.append(
	eventStore.buildEvent({
		data: { test: true },
		type: "Test",
	}),
);
