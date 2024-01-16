/// <reference path="../Modules/Extensions.js" />

declare function alertAsync(message: string, title ?: string): Promise<void>;
declare function confirmAsync(message: string, title ?: string): Promise<boolean>;
declare function promptAsync(message: string, title ?: string): Promise<string | null>;
declare function load<T>(promise: Promise<T>, duration ?: number, delay ?: number): Promise<T>;
declare function prevent(message: Error, locked ?: boolean): Promise<void>;

interface Window {
	alertAsync(message: string, title?: string): Promise<void>;
	confirmAsync(message: string, title?: string): Promise<boolean>;
	promptAsync(message: string, title?: string): Promise<string | null>;
	load<T>(promise: Promise<T>, duration?: number, delay?: number): Promise<T>;
	prevent(message: Error, locked?: boolean): Promise<void>;
}

interface Math {
	between(value: number, min: number, max: number): number;
	toDegrees(radians: number): number;
	toRadians(degrees: number): number;
	/**
	 * @returns [0 - 1]
	 */
	toFactor(value: number, period: number): number;
	/**
	 * @returns [-1 - 1]
	 */
	toSignedFactor(value: number, period: number): number;
}

interface HTMLElement {
	getElement<T extends typeof HTMLElement>(type: T, selectors: string): InstanceType<T>;
	tryGetElement<T extends typeof HTMLElement>(type: T, selectors: string, strict?: boolean): Promise<InstanceType<T>>;
}

interface Document {
	getElement<T extends typeof HTMLElement>(type: T, selectors: string): InstanceType<T>;
	tryGetElement<T extends typeof HTMLElement>(type: T, selectors: string, strict?: boolean): Promise<InstanceType<T>>;
	log(...data: any[]): void;
	analysis(error: any): Error;
}

interface Navigator {
	download(file: File): void;
}

interface Location {
	getSearchMap(): Map<string, string>;
}