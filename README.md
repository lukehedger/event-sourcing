# Event Sourcing

## Overview

Event sourcing is a software design pattern that captures all changes to an application's state as a sequence of immutable events. Instead of storing the current state of an entity, event sourcing stores the history of all events that led to that state. The current state can then be reconstructed by replaying these events.

### Concepts

- Event - immutable record representing something that happened in the system
- Event Store - persistent, append-only log of events
- Aggregate - cluster of domain objects treated as a single unit
- Projection - view of the data built by applying events to create a readable state
- Command - instruction to perform an action (which will generate events)

### Benefits

- Every application state change is recorded as an event, providing a comprehensive history and audit trail
- Timetravel! Determine the state of the system at any point in time
- Fault tolerance - rebuild the system state by replaying events
- Observability - the exact sequence of state changes is observable through event logs
- Separation of write and read responsibilities

### Downsides

- Read performance - replaying a large number of events can be slow
- Handling changes to event schemas over time (i.e. schema evolution)
- Read models may be temporarily out of sync with writes (i.e. eventual consistency)
- Saving the current state periodically to avoid replaying all events (i.e. snapshotting)

### Use cases

Event sourcing is useful when:

- Your system needs an audit trail or historical state
- You have complex business domains with evolving requirements
- You often need to debug a sequence of state changes

## Implementation

### Run

To run the event sourcing application, execute the following command:

```bash
bun run start
```

> [Install Bun](https://bun.com/docs/installation) if you don't already have it

### EventStore

A simple in-memory event store.

Features:

- [UUID v7](https://bun.com/docs/api/utils#bun-randomuuidv7) event IDs
- [Valibot](https://valibot.dev) event validation
- Basic support for subscriptions using callbacks
- Event schema registry

### TODO

This project will be expanded to replace the in-memory event store with SlateDB, "an embedded storage engine built as a log-structured merge-tree" that writes all data to object storage.

The following properties of LSMs make them very suitable for implementing an event sourcing event store:

- Write performance optimisation
- Immutable by design
- Range query efficiency (e.g. for retrieving all events)
- Compaction (e.g. for snapshotting and data lifecycle management)

Other plans:

- Aggregates/partitions
- Optimistic concurrency
- CQRS and reporting database
