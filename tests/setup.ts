// Svelte's async cleanup needs a DOM and must not run in Node-only test files.
if (typeof document !== 'undefined') {
	await import('@testing-library/svelte/vitest');
}

export {};
