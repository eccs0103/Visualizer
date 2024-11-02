/// <reference path="./extensions.js" />

/**
 * A mapping interface that associates primitive types with string keys.
 * This is used to handle conversions to different primitive types.
 */
interface PrimitivesHintMap {
	"number": number;
	"boolean": boolean;
	"string": string;
}

interface NumberConstructor {
	/**
	 * Imports a number from a source.
	 * @param source The source value to import.
	 * @param name The name of the source value.
	 * @returns The imported number value.
	 * @throws {ReferenceError} If the source is undefined.
	 * @throws {TypeError} If the source is not a number.
	 */
	import(source: any, name?: string): number;
}

interface Number {
	/**
	 * Exports the number value.
	 * @returns The exported number value.
	 */
	export(): number;
	/**
	 * Clamps a value between a minimum and maximum.
	 * @param min The minimum value.
	 * @param max The maximum value.
	 * @returns The clamped value.
	 */
	clamp(min: number, max: number): number;
	/**
	 * Interpolates the number from one range to another.
	 * @param min1 The minimum value of the original range.
	 * @param max1 The maximum value of the original range.
	 * @param min2 The minimum value of the target range.
	 * @param max2 The maximum value of the target range.
	 * @returns The interpolated value within the target range.
	 * @throws {Error} If the minimum and maximum values of either range are equal.
	 */
	interpolate(min1: number, max1: number, min2?: number, max2?: number): number;
	/**
	 * Returns the current number or a default value if the current number is NaN.
	 * @param value The default value to return if the current number is NaN.
	 * @returns The current number if it is not NaN, otherwise the default value.
	 */
	orDefault(value: number): number;
}

interface BooleanConstructor {
	/**
	 * Imports a boolean value from a source.
	 * @param source The source value to import.
	 * @param name The name of the source value.
	 * @returns The imported boolean value.
	 * @throws {ReferenceError} If the source is undefined.
	 * @throws {TypeError} If the source is not a boolean.
	 */
	import(source: any, name?: string): boolean;
}

interface Boolean {
	/**
	 * Exports the boolean value.
	 * @returns The exported boolean value.
	 */
	export(): boolean;
}

interface StringConstructor {
	/**
	 * Imports a string from a source.
	 * @param source The source value to import.
	 * @param name The name of the source value.
	 * @returns The imported string value.
	 * @throws {ReferenceError} If the source is undefined.
	 * @throws {TypeError} If the source is not a string.
	 */
	import(source: any, name?: string): string;
	/**
	 * A constant empty string.
	 */
	readonly empty: string;
	/**
	 * Checks if a string is empty.
	 * @param text The string to check.
	 * @returns True if the string is empty, otherwise false.
	 */
	isEmpty(text: string): boolean;
	/**
	 * Checks if a string contains only whitespace characters.
	 * @param text The string to check.
	 * @returns True if the string is empty or contains only whitespace, otherwise false.
	 */
	isWhitespace(text: string): boolean;
}

interface String {
	/**
	 * Exports the string value.
	 * @returns The exported string value.
	 */
	export(): string;
	/**
	 * Returns the current string value or a default value if the string is empty.
	 * @param value The default value to return if the string is empty.
	 * @returns The current string value or the provided default value.
	 */
	orDefault(value: string): string;
	/**
	 * Converts the string to title case, where the first letter of each word is capitalized.
	 * @returns The string converted to title case.
	 */
	toTitleCase(): string;
	/**
	 * Converts the string to title case based on the specified locale, where the first letter of each word is capitalized.
	 * @param locale The locale to use for the conversion, defaults to the user's language.
	 * @returns The string converted to title case based on the specified locale.
	 */
	toLocalTitleCase(locales?: Intl.LocalesArgument): string;
	/**
	 * Reverses the string.
	 * @returns The reversed string.
	 */
	reverse(): string;
}

interface FunctionConstructor {
	/**
	 * Checks if the given function is implemented by running it and seeing if it throws a specific `ReferenceError`.
	 * @param action The function to check for implementation.
	 * @returns A promise that resolves to `true` if the function is implemented, `false` otherwise.
	 */
	isImplemented(action: (...args: any) => unknown): Promise<boolean>;
	/**
	 * Ensures the given function is implemented by checking it and throwing an error if it is not.
	 * @param action The function to check for implementation.
	 * @param name The name of the function to be used in the error message if the function is not implemented.
	 * @returns A promise that resolves if the function is implemented, otherwise it rejects with an error.
	 * @throws {Error} Throws an error if the function is not implemented.
	 */
	ensureImplementation(action: (...args: any) => unknown, name: string): Promise<void>;
}

/**
 * Interface representing an instance that can be archived.
 * @template N The type of the archived data.
 */
interface ArchivableInstance<N> {
	/**
	 * Exports the instance.
	 * @returns The exported data.
	 */
	export(): N;
}

/**
 * Interface representing a prototype that can create archivable instances.
 * @template N The type of the archived data.
 * @template I The type of the archivable instance.
 * @template A The types of the constructor arguments for the instance.
 */
interface ArchivablePrototype<N, I extends ArchivableInstance<N>, A extends readonly any[]> {
	/**
	 * Imports data and creates an instance.
	 * @param source The source data to import.
	 * @param name An optional name for the source.
	 * @returns The created instance.
	 */
	import(source: any, name?: string): I;
	/**
	 * @param args The constructor arguments.
	 */
	new(...args: A): I;
}

interface ObjectConstructor {
	/**
	 * Imports an object from a source.
	 * @param source The source to import from.
	 * @param name The name of the source.
	 * @returns The imported object.
	 * @throws {ReferenceError} Throws a ReferenceError if the source is undefined.
	 * @throws {TypeError} Throws a TypeError if the source is not an object or null.
	 */
	import(source: any, name?: string): Object;
	/**
	 * Applies a callback function to a non-nullable value, or returns the original nullable value.
	 * @template T The type of the input value.
	 * @template N The type representing nullable.
	 * @template R The return type of the callback function.
	 * @param value The value to map.
	 * @param callback The function to apply if the value is non-nullable.
	 * @returns The mapped result.
	 */
	map<T, N extends Exclude<T, NonNullable<T>>, R>(value: NonNullable<T> | N, callback: (object: NonNullable<T>) => R): R | N;
	/**
	 * Ensures that a value is neither null nor undefined, throwing an error if it is.
	 * @template T
	 * @param value The value to check.
	 * @param name The name of the value, used in error messages.
	 * @returns The value if it is not null or undefined.
	 * @throws {Error} If the value is null or undefined.
	 */
	suppress<T>(value: T, name?: string): NonNullable<T>;
}

interface Object {
	/**
	 * Exports the object.
	 * @returns The exported object.
	 */
	export(): Object;
}

interface ArrayConstructor {
	/**
	 * Imports an array from a source.
	 * @param source The source to import from.
	 * @param name The name of the source.
	 * @returns The imported array.
	 * @throws {ReferenceError} Throws a ReferenceError if the source is undefined.
	 * @throws {TypeError} Throws a TypeError if the source is not an array.
	 */
	import(source: any, name?: string): any[];
	/**
	 * Generates a sequence of numbers from min to max (exclusive).
	 * @param min The starting number of the sequence (inclusive).
	 * @param max The ending number of the sequence (exclusive).
	 * @returns An array containing the sequence of numbers.
	 */
	sequence(min: number, max: number): number[];
}

interface Array<T> {
	/**
	 * Exports the array.
	 * @returns The exported array.
	 */
	export(): T[];
	/**
	 * Swaps the elements at the given indices in the array.
	 * @param index1 The index of the first element.
	 * @param index2 The index of the second element.
	 * @returns {void}
	 */
	swap(index1: number, index2: number): void;
}

interface Math {
	/**
	 * Splits a number into its integer and fractional parts.
	 * @param x The number to be split.
	 * @returns A tuple where the first element is the integer part and the second element is the fractional part.
	 */
	split(x: number): [number, number];
	/**
	 * Calculates the square of a number.
	 * @param x The number to square.
	 * @returns The square of the input number.
	 */
	sqpw(x: number): number;
	/**
	 * Converts radians to degrees.
	 * @param radians The angle in radians.
	 * @returns The angle in degrees.
	 */
	toDegrees(radians: number): number;
	/**
	 * Converts degrees to radians.
	 * @param degrees The angle in degrees.
	 * @returns The angle in radians.
	 */
	toRadians(degrees: number): number;
}

interface PromiseConstructor {
	/**
	 * Creates a promise that resolves after the specified timeout.
	 * @param timeout The timeout in milliseconds.
	 * @returns A promise that resolves after the timeout.
	 */
	withTimeout(timeout: number): Promise<void>;
	/**
	 * Creates a promise that can be controlled with an abort signal.
	 * @template T
	 * @param callback The callback to execute with an abort signal, resolve, and reject functions.
	 * @returns A promise that can be controlled with an abort signal.
	 */
	withSignal<T>(callback: (signal: AbortSignal, resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
}

interface ErrorConstructor {
	/**
	 * Generates an Error object from the provided input.
	 * @param exception The exception input.
	 * @returns An Error object representing the input.
	 */
	from(exception: any): Error;
}

interface Error {
	/**
	 * Returns a string representation of the Error object.
	 * @returns A string representation of the Error object.
	 */
	toString(): string;
}

namespace globalThis {
	/**
	 * Returns the prototype of the given non-nullable value.
	 * @template T
	 * @param value The value whose prototype is to be retrieved. It cannot be null or undefined.
	 */
	function prototype<T>(value: NonNullable<T>): Function;
	/**
	 * Gets the type name of a value.
	 * @param value The value to get the type name of.
	 * @returns The type name of the value.
	 */
	function typename(value: any): string;
}

interface ParentNode {
	/**
	 * Retrieves an element of the specified type and selectors.
	 * @template T
	 * @param type The type of element to retrieve.
	 * @param selectors The selectors to search for the element.
	 * @returns The element instance.
	 * @throws {TypeError} If the element is missing or has an invalid type.
	 */
	getElement<T extends typeof Element>(type: T, selectors: string): InstanceType<T>;
	/**
	 * Asynchronously retrieves an element of the specified type and selectors.
	 * @template T
	 * @param type The type of element to retrieve.
	 * @param selectors The selectors to search for the element.
	 * @returns The element instance.
	 * @throws {TypeError} If the element is missing or has an invalid type.
	 */
	getElementAsync<T extends typeof Element>(type: T, selectors: string): Promise<InstanceType<T>>;
	/**
	 * Retrieves elements of the specified type and selectors.
	 * @template T
	 * @param type The type of elements to retrieve.
	 * @param selectors The selectors to search for the elements.
	 * @returns The NodeList of element instances.
	 * @throws {TypeError} If any element is missing or has an invalid type.
	 */
	getElements<T extends typeof Element>(type: T, selectors: string): NodeListOf<InstanceType<T>>;
	/**
	 * Asynchronously retrieves elements of the specified type and selectors.
	 * @template T
	 * @param type The type of elements to retrieve.
	 * @param selectors The selectors to search for the elements.
	 * @returns The NodeList of element instances.
	 * @throws {TypeError} If any element is missing or has an invalid type.
	 */
	getElementsAsync<T extends typeof Element>(type: T, selectors: string): Promise<NodeListOf<InstanceType<T>>>;
}

interface Element {
	/**
	 * Retrieves the closest ancestor element of the specified type and selectors.
	 * @template T
	 * @param type The type of element to retrieve.
	 * @param selectors The selectors to search for the element.
	 * @returns The element instance.
	 * @throws {TypeError} If the element is missing or has an invalid type.
	 */
	getClosest<T extends typeof Element>(type: T, selectors: string): InstanceType<T>;
	/**
	 * Asynchronously retrieves the closest ancestor element of the specified type and selectors.
	 * @template T
	 * @param type The type of element to retrieve.
	 * @param selectors The selectors to search for the element.
	 * @returns The element instance.
	 * @throws {TypeError} If the element is missing or has an invalid type.
	 */
	getClosestAsync<T extends typeof Element>(type: T, selectors: string): Promise<InstanceType<T>>;
}

interface Document {
	/**
	 * Asynchronously loads an image from the specified URL.
	 * @param url The URL of the image to be loaded.
	 * @returns A promise that resolves with the loaded image element.
	 * @throws {Error} If the image fails to load.
	 */
	loadImage(url: string): Promise<HTMLImageElement>;
	/**
	 * Asynchronously loads multiple images from the provided URLs.
	 * @param urls An array of image URLs to be loaded.
	 * @returns A promise that resolves with an array of loaded image elements.
	 * @throws {Error} If any image fails to load.
	 */
	loadImages(urls: string[]): Promise<HTMLImageElement[]>;
}

interface Window {
	/**
	 * Asynchronously displays an alert message.
	 * @param message The message to display.
	 * @returns A promise that resolves when the alert is closed.
	 */
	alertAsync(message?: any): Promise<void>;
	/**
	 * Asynchronously displays a confirmation dialog.
	 * @param message The message to display.
	 * @returns A promise that resolves to true if the user confirms, and false otherwise.
	 */
	confirmAsync(message?: string): Promise<boolean>;
	/**
	 * Asynchronously displays a prompt dialog.
	 * @param message The message to display.
	 * @returns A promise that resolves to the user's input value if accepted, or null if canceled.
	 */
	promptAsync(message?: string, _default?: string): Promise<string?>;
	/**
	 * Executes an action and handles any errors that occur.
	 * @param action The action to be executed.
	 * @param silent In silent mode errors are silently ignored; otherwise, they are thrown and the page is reloaded.
	 * @returns A promise that resolves the action.
	 */
	assert(action: VoidFunction, silent?: boolean): Promise<void>;
	/**
	 * Asynchronously loads a promise with a loading animation.
	 * @template T
	 * @param promise The promise to load.
	 * @param delay The delay before the loading animation starts.
	 * @param duration The duration of the loading animation.
	 * @returns A promise that resolves to the result of the input promise.
	 */
	load<T>(promise: Promise<T>, delay?: number, duration?: number): Promise<T>;
}

/**
 * Asynchronously displays an alert message.
 * @param message The message to display.
 * @param title The title of the alert.
 * @returns A promise that resolves when the alert is closed.
 */
declare function alertAsync(message?: any): Promise<void>;
/**
 * Asynchronously displays a confirmation dialog.
 * @param message The message to display.
 * @param title The title of the confirmation dialog.
 * @returns A promise that resolves to true if the user confirms, and false otherwise.
 */
declare function confirmAsync(message?: string): Promise<boolean>;
/**
 * Asynchronously displays a prompt dialog.
 * @param message The message to display.
 * @param title The title of the prompt dialog.
 * @returns A promise that resolves to the user's input value if accepted, or null if canceled.
 */
declare function promptAsync(message?: string, _default?: string): Promise<string?>;
/**
 * Executes an action and handles any errors that occur.
 * @param action The action to be executed.
 * @param silent In silent mode errors are silently ignored; otherwise, they are thrown and the page is reloaded.
 * @returns A promise that resolves the action.
 */
declare function assert(action: VoidFunction, silent?: boolean): Promise<void>;
/**
 * Asynchronously loads a promise with a loading animation.
 * @template T
 * @param promise The promise to load.
 * @param duration The duration of the loading animation.
 * @param delay The delay before the loading animation starts.
 * @returns A promise that resolves to the result of the input promise.
 */
declare function load<T>(promise: Promise<T>, duration?: number, delay?: number): Promise<T>;

interface Navigator {
	/**
	 * Retrieves the data path based on developer and application name metadata.
	 * @returns The data path.
	 */
	readonly dataPath: string;
	/**
	 * Retrieves the version information from the metadata.
	 * @returns An instance representing the version.
	 */
	readonly version: VersionManager;
	/**
	 * А property to interact with the color scheme in webpage.
	 */
	colorScheme: string;
	/**
	 * Downloads the specified file.
	 * @param file The file to download.
	 */
	download(file: File): void;
}
