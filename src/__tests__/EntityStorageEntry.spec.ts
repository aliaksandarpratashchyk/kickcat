import EntityStorageEntry, { CLEAN, DIRTY, KILLED, NEW, type EntityStorageEntryConfiguration } from "../EntityStorageEntry";

describe(EntityStorageEntry.name, () => {
    describe(EntityStorageEntry.prototype.change.name, () => {
        describe.each`
        state
        ${NEW}
        ${KILLED}        
        `('when the state is $state', ({ state }) => {
            it(`should throw an error.`, () => {
                const entry = new EntityStorageEntry({ state } as EntityStorageEntryConfiguration);

                expect(() => { entry.change({}); }).toThrow();
            });
        });
        describe.each`
        state    | payload           | changes           | expectedPayload
        ${CLEAN} | ${{ foo: 'bar' }} | ${{ foo: 'baz' }} | ${{ foo: 'baz' }}
        ${DIRTY} | ${{ foo: 'bar' }} | ${{ foo: 'baz' }} | ${{ foo: 'baz' }}
        `('when the state is $state', ({ state, payload, changes, expectedPayload }) => {
            it(`should set the state to ${DIRTY}.`, () => {
                const entry = new EntityStorageEntry({ state, entity: payload } as EntityStorageEntryConfiguration);

                entry.change(changes);

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

                expect(() => { entry.delete(); }).toThrow();
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