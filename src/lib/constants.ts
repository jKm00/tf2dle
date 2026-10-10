import { dev } from '$app/env';
import { PUBLIC_CDN_URL } from '$app/env/public';

export const CDN_URL = dev
	? '/images'
	: PUBLIC_CDN_URL || 'https://cdn.jsdelivr.net/gh/edvardsen-dev/tf2dle@main/static/images';
