/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

// eslint-disable-next-line import-x/no-named-as-default
import Ajv, { type JSONSchemaType, type ValidateFunction } from "ajv";
import { isEntityType, type EntityType } from "./EntityType";
import type { Entity } from "./Entity";
import { isBoolean, isNull, isNumber, isObject, isString, isUndefined } from "underscore";
import climb from "./climb";
import { exists } from "./exists";
import { resolve } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { parse } from 'yaml';
import unsafe from "./unsafe";

export interface EntityPropertySchema {    
    unique: boolean;
    order: number;
    required: boolean;
    reference?: EntityType;    
    newUnique: boolean;
    primaryKey: boolean;
    type: string;
}

export default class EntitySchema<T extends Entity = Entity> {   
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
        this.#validate = ajv.compile<T>(this.#jsonSchema);   
        
        this.#parse();
    }

    validate(entity: T): boolean {        
        return this.#validate(entity);
    }    

    get referenceProperties(): string[] {        
        const refs: string[] = [];
        
        // eslint-disable-next-line guard-for-in
        for (const propertyName in this.properties) {
            const propertySchema = this.properties[propertyName];
            if (isEntityType(propertySchema?.reference))
                refs.push(propertyName);
        }
        
        return refs;
    }

    get references(): EntityType[] {
        const refs: EntityType[] = [];
        
        // eslint-disable-next-line guard-for-in
        for (const propertyName in this.properties) {
            const propertySchema = this.properties[propertyName];
            if (isEntityType(propertySchema?.reference))
                if (!refs.includes(propertySchema.reference))
                    refs.push(propertySchema.reference);
        }
        
        return refs;
    }

    get uniqueProperties(): string[] {
        const uniques: string[] = [];
        
        // eslint-disable-next-line guard-for-in
        for (const propertyName in this.properties) {
            const propertySchema = this.properties[propertyName];   
            if (propertySchema?.unique === true)
                uniques.push(propertyName);
        }
        
        return uniques;
    }     
    
    get newUniqueProperties(): string[] {
        const newUniques: string[] = [];
        
        // eslint-disable-next-line guard-for-in
        for (const propertyName in this.properties) {
            const propertySchema = this.properties[propertyName];   
            if (propertySchema?.newUnique === true)
                newUniques.push(propertyName);
        }
        
        return newUniques;
    }     

    get primaryKeyProperty(): string | null {
        // eslint-disable-next-line guard-for-in
        for (const propertyName in this.properties) {
            const propertySchema = this.properties[propertyName];
            if (propertySchema?.primaryKey === true)
                return propertyName;
        }
        
        return null;
    }

    get isPrimaryKeyRequired(): boolean {
        return isString(this.primaryKeyProperty) && 
            this.properties[this.primaryKeyProperty]?.required === true || 
            false;
    }

    canValueOfTypeBeOnlyPrimaryKey(type: string): boolean {
        if (isNull(this.primaryKeyProperty))
            return false;

        const primaryKeyPropertySchema = this.properties[this.primaryKeyProperty];

        if (isUndefined(primaryKeyPropertySchema))
            return false;

        if (primaryKeyPropertySchema.type !== type)
            return false;

        if (this.uniqueProperties.length === 0 && 
            this.newUniqueProperties.length === 0)
            return true;

        const uniquePropertyHaveSameType = this.uniqueProperties.
            map(uniquePropertyName => this.properties[uniquePropertyName]).
            some(propertySchema => propertySchema?.type === type);

        if (uniquePropertyHaveSameType)
            return false;
        
        const newUniquePropertyHaveSameType = this.newUniqueProperties.
            map(newUniquePropertyName => this.properties[newUniquePropertyName]).
            some(propertySchema => propertySchema?.type === type);  

        if (newUniquePropertyHaveSameType)
            return false;
        
        return true;
    }

    // eslint-disable-next-line max-statements, max-lines-per-function
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

            const newUnique = isBoolean(propertyDefition['x-kickcat-new-unique']) ?
                propertyDefition['x-kickcat-new-unique']:
                false;
                
            const order = isNumber(propertyDefition['order']) ?
                propertyDefition['order'] : 
                Number.MAX_SAFE_INTEGER;

            const reference = isEntityType(propertyDefition['x-kickcat-reference']) ?
                propertyDefition['x-kickcat-reference']:
                // eslint-disable-next-line no-undefined
                undefined;

            const required = Array.isArray(this.#jsonSchema.required) ?
                this.#jsonSchema.required.includes(propertyName) :
                false;

            const primaryKey = isBoolean(propertyDefition['x-kickcat-primary-key']) ?
                propertyDefition['x-kickcat-primary-key']:
                false;            

            const type = isString(propertyDefition['type']) ? propertyDefition['type'] : 'unknown';

            this.properties[propertyName] = { 
                primaryKey, 
                unique, 
                newUnique, 
                order, 
                reference, 
                required,
                type 
            };
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


export async function resolveEntitySchema<T extends Entity = Entity>(
    entityType: EntityType, 
    options?: EntitySchemaResolutionOptions): Promise<EntitySchema<T>> {
        const schemaPath = await resolveEntitySchemaPath(entityType, options);
        const raw = await readFile(
            schemaPath, 
            { encoding: 'utf-8' });        
        
        const parsed = unsafe<JSONSchemaType<T>>(parse(raw, { strict: false }));
        return new EntitySchema(entityType, schemaPath, parsed);
}
