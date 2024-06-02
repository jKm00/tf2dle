<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Axe, Settings, Map, GraduationCap } from 'lucide-svelte';
	import { buttonVariants } from './ui/button';
	import ColorblindModeToggler from './ColorblindModeToggler.svelte';
	import Button from './ui/button/button.svelte';
	import { useStats, type UseStats } from '$lib/composables/useStats';
	import { toast } from 'svelte-sonner';

	const weaponStats = useStats('weapon');
	const mapStats = useStats('map');
	const cosmeticStats = useStats('cosmetic');

	function clearStat(gamemode: string, stat: UseStats) {
		stat.clearStats();
		toast.success(`Stats related to the ${gamemode} gamemode has been deleted!`);
	}

	function clearAllStats() {
		weaponStats.clearStats();
		mapStats.clearStats();
		cosmeticStats.clearStats();
		toast.success('All stats have been deleted!');
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost' })}>
		<Settings class="text-muted-foreground" />
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Title>Settings</Dialog.Title>
		<Dialog.Description>Change your settings here</Dialog.Description>
		<div class="grid gap-8 py-4">
			<div class="grid gap-2">
				<h2 class="text-muted-foreground text-sm">Accessibility</h2>
				<ColorblindModeToggler />
			</div>
			<div class="grid gap-2">
				<h2 class="text-muted-foreground text-sm">Local Data</h2>
				<div class="flex justify-between items-center">
					<p class="flex items-center gap-2">
						<Axe />
						<span>Weapon</span>
					</p>
					<Button variant="outline" on:click={() => clearStat('weapon', weaponStats)}>Clear</Button>
				</div>
				<div class="flex justify-between items-center">
					<p class="flex items-center gap-2">
						<Map />
						<span>Map</span>
					</p>
					<Button variant="outline" on:click={() => clearStat('map', mapStats)}>Clear</Button>
				</div>
				<div class="flex justify-between items-center">
					<p class="flex items-center gap-2">
						<GraduationCap />
						<span>Cosmetic</span>
					</p>
					<Button variant="outline" on:click={() => clearStat('cosmetic', cosmeticStats)}
						>Clear</Button
					>
				</div>
				<Button variant="outline" class="w-full" on:click={clearAllStats}>Clear all</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
