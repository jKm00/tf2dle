import { createCanvas, loadImage } from 'canvas';

export async function GET() {
	return new Response(
		`
    <canvas id="myCanvas" width="200" height="200" style="border:1px solid #000; background-color: red;">
        Your browser does not support the canvas element.
    </canvas>
`,
		{
			headers: {
				'Content-Type': 'text/html'
			}
		}
	);

	try {
		const canvas = createCanvas(200, 200);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 200, 200);

		const imageName = '-5122163875809550055.png';
		const image = await loadImage(`/images/maps/originals/${imageName}`);
		ctx.drawImage(image, 50, 50, 100, 100);

		const dataUrl = canvas.toDataURL();

		return new Response(dataUrl, {
			headers: {
				'Content-Type': 'text/html'
			}
		});
	} catch (err) {
		return new Response('Failed to load image', { status: 500 });
	}
}
