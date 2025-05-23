import EventStore from './EventStore';

const eventStore = new EventStore();

eventStore.append({
  data: { test: true },
  type: 'Test',
});
