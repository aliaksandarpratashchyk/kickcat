/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

// eslint-disable-next-line import-x/no-named-as-default
import Ajv, { type JSONSchemaType, type ValidateFunction } from "ajv";
import type { EntityType } from "./EntityType";
import type { Entity } from "./Entity";
import { isBoolean, isNumber, isObject } from "underscore";
import climb from "./climb";
import { exists } from "./exists";
import { resolve } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { parse } from 'yaml';

export interface EntityPropertySchema {    
    unique: boolean;
    order: number;
}

export default class EntitySchema<T = Entity> {   
    readonly type: EntityType;
    readonly filePath: string;     
    readonly #jsonSchema: JSONSchemaType<T>;
    readonly #validate: ValidateFunction<T>;
    readonly properties: Record<string, EntityPropertySchema> = {};
    
    constructor(type: EntityType, filePath: string, jsonSchema: JSONSchemaType<T>) {
        this.type = type;
        this.filePath = filePath;
        this.#jsonSchema = jsonSchema;
        
        const ajv = new Ajv({ allErrors: false, strict: false, verbose: false });
        ajv.addFormat('date', true);
        ajv.addFormat('textarea', true);
        this.#validate = ajv.compile(this.#jsonSchema);   
        
        this.#parse();
    }

    validate(entity: T): boolean {        
        return this.#validate(entity);
    }    

    #parse(): void {
        if (!isObject(this.#jsonSchema.properties))
            throw new Error(`Invalid JSON schema.`);      
        
        for (const propertyName in this.#jsonSchema.properties) {
            if (!Object.hasOwn(this.#jsonSchema.properties, propertyName)) 
                // eslint-disable-next-line no-continue
                continue;
            
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const propertyDefition = this.#jsonSchema.properties[propertyName];
            
            if (!isObject(propertyDefition))
                throw new Error(`Invlid JSON schema`);
            
            const unique = isBoolean(propertyDefition['x-kickcat-unique']) ? 
                propertyDefition['x-kickcat-unique']: 
                false;
            const order = isNumber(propertyDefition['order']) ?
                propertyDefition['order'] : 
                Number.MAX_SAFE_INTEGER;

            this.properties[propertyName] = { unique, order };
        }        
    }
}

export interface EntitySchemaResolutionOptions {
    applicationName: string;
}

// eslint-disable-next-line max-statements
async function resolveEntitySchemaPath(
    entityType: EntityType, 
    options?: EntitySchemaResolutionOptions): Promise<string> {
        for (const folderPath of climb(__dirname)) {
            const localSchemaPath = resolve(folderPath, `./schemas/${entityType}.schema.yml`);

            // eslint-disable-next-line no-await-in-loop
            if (await exists(localSchemaPath))
                return localSchemaPath;

            if (isObject(options)) {
                const localPackageSchemaPath = resolve(
                    folderPath, 
                    `node_modules/${options.applicationName}`, 
                    `./schemas/${entityType}.schema.yml`);

                // eslint-disable-next-line no-await-in-loop
                if (await exists(localPackageSchemaPath))
                    return localPackageSchemaPath;
            }            
        }

        if (isObject(options)) {
            const { stdout } = await promisify(exec)('npm root -g');
            const globalPackageSchemaPath = resolve(
                stdout, 
                options.applicationName, 
                `./schemas/${entityType}.schema.yml`);

            if (await exists(globalPackageSchemaPath))
                return globalPackageSchemaPath;
        }
        
        throw new Error(`Can't find a "${entityType}" schema.`);
}


export async function resolveEntitySchema<T = Entity>(
    entityType: EntityType, 
    options?: EntitySchemaResolutionOptions): Promise<EntitySchema<T>> {
        const schemaPath = await resolveEntitySchemaPath(entityType, options);
        const raw = await readFile(
            schemaPath, 
            { encoding: 'utf-8' });        

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const parsed = parse(raw, { strict: false }) as JSONSchemaType<T>;
        return new EntitySchema(entityType, schemaPath, parsed);
}
