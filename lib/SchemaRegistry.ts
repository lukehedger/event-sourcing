import * as v from "valibot";

// event definitions

export const CreditEventSchema = v.object({
	amount: v.number(),
});

export type CreditEvent = v.InferOutput<typeof CreditEventSchema>;

export const DebitEventSchema = v.object({
	amount: v.number(),
});

export type DebitEvent = v.InferOutput<typeof DebitEventSchema>;

export const TestEventSchema = v.object({
	test: v.boolean(),
});

export type TestEvent = v.InferOutput<typeof TestEventSchema>;

// general definitions

export namespace EventBody {
	export type Credit = CreditEvent;
	export type Debit = DebitEvent;
	export type Test = TestEvent;
}

export enum EventTypes {
	Credit = "Credit",
	Debit = "Debit",
	Test = "Test",
}

export const SchemaRegistry = [
	CreditEventSchema,
	DebitEventSchema,
	TestEventSchema,
];
