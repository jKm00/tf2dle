import { dev } from '$app/environment';
import { inject } from '@vercel/analytics';

// Inject the Vercel Analytics script
inject({ mode: dev ? 'development' : 'production' });
