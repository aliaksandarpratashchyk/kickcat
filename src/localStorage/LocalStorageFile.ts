/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { readFile, unlink, writeFile } from 'fs/promises';
import { dirname, posix as pathPosix } from 'path';
import { groupBy, isString, isUndefined, sortBy } from 'underscore';
import { Document, YAMLMap, parseAllDocuments } from 'yaml';

import hash from '../hash';
import nonNullable from '../nonNullable';
import toYAML from '../toYAML';
import EntityStorageEntry, {
    CLEAN,
    DIRTY,
    KILLED,
    NEW,
} from '../EntityStorageEntry';
import { type Entity } from "../Entity";
import type { LocalStorageCookie } from './LocalStorageCookie';
import EntitySchemaRegistry from '../EntitySchemaRegistry';
import { isEntityType, type EntityType } from '../EntityType';
import { inject } from 'tsyringe';
import type { EntityStorage } from '../EntityStorage';
import EntityRegistry from '../EntityRegistry';
import unsafe from '../unsafe';
import type EntitySchema from '../EntitySchema';

export interface LocalStorageFileConfiguration {
    filePath: string;
}

const COMMENT_REGEX = /^#?\s*(?<key>[^:]+):\s*(?<value>.+)\s*$/u;

function parseCommentBefore(comment: string): [ string, string ] | null {
    const match = COMMENT_REGEX.exec(comment);
    
    if (match === null || isUndefined(match[1]) || isUndefined(match[2]))
        return null;

    return [ match[1], match[2] ];
}

function parseAllCommentBefore(commentBefore: string): Record<string, string> {
    return Object.fromEntries(commentBefore.
        split(/(?:\r\n|\r|\n)+/u).
        map(line => parseCommentBefore(line.trim())).
        filter(match => match !== null));
}

export default class LocalStorageFile implements EntityStorage<LocalStorageCookie> {
    readonly filePath: string;
    readonly entitySchemaRegistry: EntitySchemaRegistry;
    readonly #entityRegistry: EntityRegistry<LocalStorageCookie>;
    #eof = false;

    constructor({
        filePath
    }: LocalStorageFileConfiguration,
        @inject(EntitySchemaRegistry) entitySchemaRegistry: EntitySchemaRegistry
    ) {
        this.filePath = filePath;
        this.entitySchemaRegistry = entitySchemaRegistry;
        this.#entityRegistry = new EntityRegistry<LocalStorageCookie>(this.entitySchemaRegistry);
    }

    async one<TEntity extends Entity>(of: EntityType, where: Partial<TEntity>):
        Promise<EntityStorageEntry<TEntity, LocalStorageCookie> | undefined> {

        await this.#reindex();
        return this.#entityRegistry.one<TEntity>(of, where);
    }

    async *all<TEntity extends Entity>(of?: EntityType):
            AsyncIterable<EntityStorageEntry<TEntity, LocalStorageCookie>> {

        await this.#reindex();        

		for (const entry of this.#entityRegistry.all<TEntity>(of))
			yield entry;	
    }	

    async new<TEntity extends Entity>(
        of: EntityType,
        entity: TEntity): Promise<EntityStorageEntry<TEntity, LocalStorageCookie>> {

        const entry = new EntityStorageEntry<TEntity, LocalStorageCookie>({ 
            type: of, 
            entity, 
            state: NEW,
            cookie: {
                file: this
            }
         });

        const entitySchema = this.entitySchemaRegistry.get(of);

        if (isUndefined(entitySchema))
            throw new Error(`Can't find "${of}" entity schema.`);

        this.#entityRegistry.set(entry);
        return Promise.resolve(entry);
    }

    // eslint-disable-next-line max-statements
    async commit(): Promise<void> {
        console.log(`Commiting changes to "${this.filePath}"...`);

        await this.#reindex();

        const entries = this.#entityRegistry.all();
        const isSingleType = Object.entries(groupBy(entries, entry => entry.type)).length <= 1;
        const hasSomethingToCommit = entries.some(
            (entry) => [DIRTY, KILLED, NEW].includes(entry.state) || hash(entry.entity) !== entry.hash);

        const grouped = groupBy(entries, entry => entry.state);
        console.log(`Have ${Object.entries(grouped).map(([state, group]) => `[${state.toUpperCase()}]: ${group.length}`).join(', ')}`);

        if (hasSomethingToCommit) {
            const toCommit = entries.filter((entry) => ![KILLED].includes(entry.state));

            if (toCommit.length === 0)
                await unlink(this.filePath);
            else {
                const documents = sortBy(
                    toCommit,
                    (entry) => entry.cookie.index ?? Number.MAX_SAFE_INTEGER).
                    map((entry) => this.#toDocument(entry, !isSingleType));

                const yaml = documents
                    .map((document) => document.toString().trimEnd())
                    .join('\n\n---\n\n')
                    .concat('\n');

                await writeFile(this.filePath, yaml);
            }
        }
        else {
            console.log(`Skipping commit to "${this.filePath}". Nothing changed.`);
        }
    }

    // eslint-disable-next-line max-statements, max-lines-per-function
    async #reindex(): Promise<void> {
        if (this.#eof)
            return;

        const raw = await readFile(this.filePath, 'utf8');
        const documents = parseAllDocuments(raw);

        for (let index = 0; index < documents.length; index++) {
            const document = nonNullable(documents[index]);                        
            const entity = unsafe<Entity>(document.toJS());
            let savedHash = '';
            let schemaPath: string | null = null;
            let savedType: EntityType | null = null;            
            let comment: string | null = null;

            if (isString(document.commentBefore))
                comment = document.commentBefore;
            else if (isString(document.contents?.commentBefore))
                comment = document.contents.commentBefore;            

            if (comment !== null) {
                const parsedCommentBefore = parseAllCommentBefore(comment);
                if ('hash' in parsedCommentBefore)
                    savedHash = parsedCommentBefore['hash'];
                if ('yaml-language-server' in parsedCommentBefore) {
                    const match = /\$schema=(?<schema>.+)/u.exec(parsedCommentBefore['yaml-language-server']);

                    if (match !== null)
                        schemaPath = match[1] ?? null;
                }
                if ('type' in parsedCommentBefore) {
                    const savedTypeAsString = parsedCommentBefore['type'];
                    if (isEntityType(savedTypeAsString))
                        savedType = savedTypeAsString;
                }
                    
            }                        

            let entitySchema: EntitySchema | undefined | null = null;
                        
            if (savedType !== null)
                entitySchema = this.entitySchemaRegistry.get(savedType);
            else if (schemaPath !== null)
                entitySchema = this.entitySchemaRegistry.resolve(schemaPath);

            if (isUndefined(entitySchema))
                entitySchema = this.entitySchemaRegistry.all.find(schema => schema.validate(entity));

            if (isUndefined(entitySchema) || entitySchema === null)
                throw new Error(`Can't resolve schema for entity.`);

            if (entitySchema.validate(entity)) {
                this.#entityRegistry.set(
                    new EntityStorageEntry({
                        type: entitySchema.type,
                        entity,
                        hash: savedHash,                        
                        state: CLEAN,
                        cookie: {
                            file: this,
                            index
                        }
                    }),
                );
            }
        }

        this.#eof = true;
    }    

    #toDocument(entry: EntityStorageEntry, writeType = false): Document {
        const schema = this.entitySchemaRegistry.get(entry.type);

        if (isUndefined(schema))
            throw new Error(`Can't find schema "${schema}".`);

        const document = new Document();
        const schemaPath = this.#relativePosix(dirname(this.filePath), schema.filePath);
        document.commentBefore = [
            ...(writeType ? [` type: ${entry.type}`]: [ ]),
            ` yaml-language-server: $schema=${schemaPath}`,
            ` hash: ${hash(entry.entity)}`
        ].join('\n');
        document.contents = this.#toOrderedYamlMap(entry.entity, schema);

        return document;
    }

    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    #toOrderedYamlMap(entity: Entity, entitySchema: EntitySchema): YAMLMap {
        const map = new YAMLMap();
        const orderedKeys = Object.
            entries(entitySchema.properties).
            sort(([, left], [, right]) => left.order - right.order).
            map(([key]) => key);
        const extraKeys = Object.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            keys(entity as Record<string, unknown>).
            filter((key) => !orderedKeys.includes(key)).
            toSorted();

        for (const key of [...orderedKeys, ...extraKeys]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            if (!(key in (entity as Record<string, unknown>)))
                // eslint-disable-next-line no-continue
                continue;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const value = (entity as Record<string, unknown>)[key];
            map.add({ key, value: toYAML(value) });
        }

        return map;
    }

    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    #relativePosix(from: string, to: string): string {
        // eslint-disable-next-line func-style
        const toPosix = (path: string): string =>
            path.
                replaceAll('\\', '/').
                replace(/^(?<temp1>[A-Za-z]):/u, (_match, drive: string) => `/${drive.toLowerCase()}`);

        return pathPosix.relative(toPosix(from), toPosix(to));
    }
}
