export class GameCanvas {
	private canvas: HTMLCanvasElement;
	public context: CanvasRenderingContext2D;
	private width: number;
	private height: number;

	constructor(canvasId: string, width: number, height: number) {
		const canvasElement = document.getElementById(
			canvasId
		) as HTMLCanvasElement;
		if (!canvasElement) {
			throw new Error(`Canvas with ID "${canvasId}" not found.`);
		}

		this.canvas = canvasElement;
		this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		this.width = width;
		this.height = height;

		this.setupCanvas();
	}

	private setupCanvas(): void {
		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}
}
