<script lang="ts">
	import { Scroll } from 'lucide-svelte';
	import Settings from '$lib/components/Settings.svelte';
</script>

<header class="flex items-center justify-center">
	<Settings />
	<a href="/" class="cursor-pointer"><img class="w-80" src="/images/logo.png" alt="logo" /></a>
	<a href="/patch-notes" class="text-muted-foreground" title="Patch notes" aria-label="Patch notes"
		><Scroll /></a
	>
</header>
