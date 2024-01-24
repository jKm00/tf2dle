<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import duration from 'dayjs/plugin/duration';
	import { onDestroy } from 'svelte';

	dayjs.extend(utc);
	dayjs.extend(relativeTime);
	dayjs.extend(duration);

	export let nextReset: string = dayjs().toISOString();

	let interval: number;
	let timeTilReset = initializeResetTime();

	$: hours = timeTilReset.hours() < 10 ? `0${timeTilReset.hours()}` : timeTilReset.hours();
	$: minutes = timeTilReset.minutes() < 10 ? `0${timeTilReset.minutes()}` : timeTilReset.minutes();
	$: seconds = timeTilReset.seconds() < 10 ? `0${timeTilReset.seconds()}` : timeTilReset.seconds();

	onDestroy(() => {
		clearInterval(interval);
	});

	function initializeResetTime() {
		const now = dayjs();
		const resetTime = dayjs(nextReset);
		const diff = resetTime.diff(now);

		const duration = dayjs.duration(diff);

		interval = setInterval(() => {
			updateTime();
		}, 1000) as unknown as number;

		return duration;
	}

	function updateTime() {
		if (timeTilReset.asSeconds() <= 0) {
			timeTilReset = initializeResetTime();
		} else {
			timeTilReset = timeTilReset.subtract(1, 'second');
		}
	}
</script>

<div class="text-center">
	<p class="grid">
		Games will reset in: <span class="text-3xl">{hours}:{minutes}:{seconds}</span>
	</p>
</div>

<footer class="text-muted-foreground text-sm">
	<p>Made by <a href="https://edvardsen.dev" class="underline">Joakim Edvardsen</a></p>
	<p>
		Like the product? Support me <a
			href="https://www.buymeacoffee.com/joakimedvam"
			class="underline">here</a
		>
	</p>
</footer>
