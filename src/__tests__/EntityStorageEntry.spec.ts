/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import EntityStorageEntry, {
	CLEAN,
	DIRTY,
	type EntityStorageEntryConfiguration,
	KILLED,
	NEW,
} from '../EntityStorageEntry';

describe(EntityStorageEntry.name, () => {
	describe(EntityStorageEntry.prototype.substitute.name, () => {
		describe.each`
			state
			${NEW}
			${KILLED}
		`('when the state is $state', ({ state }) => {
			it(`should throw an error.`, () => {
				const entry = new EntityStorageEntry({ state } as EntityStorageEntryConfiguration);

				expect(() => {
					entry.substitute({});
				}).toThrow();
			});
		});
		describe.each`
			state    | payload           | changes           | expectedPayload
			${CLEAN} | ${{ foo: 'bar' }} | ${{ foo: 'baz' }} | ${{ foo: 'baz' }}
			${DIRTY} | ${{ foo: 'bar' }} | ${{ foo: 'baz' }} | ${{ foo: 'baz' }}
		`('when the state is $state', ({ changes, expectedPayload, payload, state }) => {
			it(`should set the state to ${DIRTY}.`, () => {
				const entry = new EntityStorageEntry({
					entity: payload,
					state,
				} as EntityStorageEntryConfiguration);

				entry.substitute(changes);

				expect(entry.state).toBe(DIRTY);
				expect(entry.entity).toEqual(expectedPayload);
			});
		});
	});
	describe(EntityStorageEntry.prototype.delete.name, () => {
		describe.each`
			state
			${NEW}
		`('when the state is $state', ({ state }) => {
			it(`should throw an error.`, () => {
				const entry = new EntityStorageEntry({ state } as EntityStorageEntryConfiguration);

				expect(() => {
					entry.delete();
				}).toThrow();
			});
		});
		describe.each`
			state
			${CLEAN}
			${DIRTY}
		`('when the state is $state', ({ state }) => {
			it(`should set the state to "${KILLED}".`, () => {
				const entry = new EntityStorageEntry({ state } as EntityStorageEntryConfiguration);

				entry.delete();

				expect(entry.state).toBe(KILLED);
			});
		});
	});
});
