interface Math {
	toFactor(value: number, period: number): number;
	toSignedFactor(value: number, period: number): number;
}

interface Window {
	alertAsync(message: string, title?: string): Promise<void>;
	confirmAsync(message: string, title?: string): Promise<boolean>;
	promptAsync(message: string, title?: string): Promise<string | null>;
	load<T>(promise: Promise<T>, duration?: number, delay?: number): Promise<T>;
}

interface HTMLElement {
	getElement<T extends typeof HTMLElement>(type: T, selectors: string): InstanceType<T>;
}

interface Document {
	getElement<T extends typeof HTMLElement>(type: T, selectors: string): InstanceType<T>;
	// log(...data: any[]): void;
	analysis(error: any): Error;
	prevent(message: Error, locked?: boolean): Promise<void>;
}

interface Navigator {
	download(file: File): void;
}

interface Location {
	getSearchMap(): Map<string, string>;
}