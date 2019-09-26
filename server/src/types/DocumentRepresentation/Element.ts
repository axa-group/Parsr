/**
 * Copyright 2019 AXA Group Operations S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import logger from '../../utils/Logger';
import { Metadata, Properties } from '../Metadata';
import { BoundingBox } from './BoundingBox';

/**
 * The abstract class Element, which represents the generalisation of all entities that constitute the
 * content of a document. This abstract class englobes all the shared attributes of the content classes.
 */
export abstract class Element {
	/**
	 * Getter content
	 * @return {Element[]}
	 */
	public abstract get content(): Element[] | string | undefined;

	/**
	 * Setter content
	 * @param {Element[]} value
	 */
	public abstract set content(value: Element[] | string | undefined);

	/**
	 * Getter id
	 * @return {number}
	 */
	public get id(): number {
		return this._id;
	}

	/**
	 * Setter id
	 * @param {id} value
	 */
	public set id(value: number) {
		this._id = value;
	}

	/**
	 * Getter parent
	 * @return {Element}
	 */
	public get parent(): Element {
		return this._parent;
	}

	/**
	 * Getter children
	 * @return {Element[]}
	 */
	public get children(): Element[] {
		return this._children;
	}

	/**
	 * Getter boundingBox
	 * @return {BoundingBox}
	 */
	public get box(): BoundingBox | undefined {
		return this._box;
	}

	/**
	 * Setter parent
	 * @param {Element} value
	 */
	public set parent(value: Element) {
		this._parent = value;
	}

	/**
	 * Setter children
	 * @param {Element[]} value
	 */
	public set children(value: Element[]) {
		this._children = value;
	}

	/**
	 * Setter boundingBox
	 * @param {BoundingBox} value
	 */
	public set box(value: BoundingBox) {
		this._box = value;
	}

	/**
	 * Getter metadata
	 * @return {Metadata[]}
	 */
	public get metadata(): Metadata[] {
		return this._metadata;
	}

	/**
	 * Setter metadata
	 * @param {Metadata[]} value
	 */
	public set metadata(value: Metadata[]) {
		this._metadata = value;
	}

	/**
	 * Getter properties
	 * @return {Properties}
	 */
	public get properties(): Properties {
		return this._properties;
	}

	/**
	 * Setter properties
	 * @param {Properties} value
	 */
	public set properties(value: Properties) {
		this._properties = value;
	}

	// Syntaxic sugars for getters and setters
	public set left(value: number) {
		this.box.left = value;
	}
	public get left(): number {
		return this.box.left;
	}
	public set top(value: number) {
		this.box.top = value;
	}
	public get top(): number {
		return this.box.top;
	}
	public set width(value: number) {
		this.box.width = value;
	}
	public get width(): number {
		return this.box.width;
	}
	public set height(value: number) {
		this.box.height = value;
	}
	public get height(): number {
		return this.box.height;
	}
	public set right(value: number) {
		this.box.right = value;
	}
	public get right(): number {
		return this.box.right;
	}
	public set bottom(value: number) {
		this.box.bottom = value;
	}
	public get bottom(): number {
		return this.box.bottom;
	}

	/**
	 * Check if a given element has a bounding box or not
	 * @param element The input element
	 * @returns true/false depending on weather or not the element has a bounding box.
	 */
	public static hasBoundingBox<T extends Element>(element: T): boolean {
		if (typeof element === 'undefined') {
			logger.warn('undefined: ', JSON.stringify(element));
			return false;
		}

		return (
			typeof element.box !== 'undefined' &&
			typeof element.left !== 'undefined' &&
			typeof element.top !== 'undefined' &&
			typeof element.width !== 'undefined' &&
			typeof element.height !== 'undefined'
		);
	}

	/**
	 * Reset global ID counter. DO NOT USE except for testing purpose.
	 * Reseting IDs IS dangerous and WILL create inconsistencies.
	 */
	public static resetGlobalId() {
		this.globalId = 1;
	}

	private static globalId = 1;
	private _id: number;
	private _metadata: Metadata[];
	private _properties: Properties;
	private _parent: Element;
	private _children: Element[];
	private _box?: BoundingBox;

	constructor(box?: BoundingBox) {
		this._id = Element.globalId++;
		this.box = box;
		this._metadata = [];
		this._properties = {};
		this.children = [];
	}
}
