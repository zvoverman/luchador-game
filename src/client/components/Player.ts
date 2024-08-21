import { PLAYER_WIDTH, PLAYER_HEIGHT, MAX_HEALTH } from '../common/constants';
import { PlayerColor } from '../common/types';

export class Player {
	position: { x: number; y: number };
	velocity: { x: number; y: number };
	width: number;
	height: number;
	currentHealth: number;
	playerColor: PlayerColor;
	flipX: number;
	lastDirection: 1 | -1;
	image: HTMLImageElement;

	constructor(position: { x: number; y: number }, playerColor: PlayerColor) {
		this.position = position;
		this.velocity = { x: 0, y: 0 };
		this.width = PLAYER_WIDTH;
		this.height = PLAYER_HEIGHT;
		this.currentHealth = MAX_HEALTH;
		this.playerColor = playerColor * 64;
		this.flipX = this.position.x;
		this.lastDirection = 1;
		this.image = new Image();
		this.image.src = '../../../assets/Luchadores.png';
	}

	// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
	// source image - destination canvas
	draw(c: CanvasRenderingContext2D): void {
		c.save();

		// Determine direction based on movement or last direction
		if (this.velocity.x > 0) {
			this.lastDirection = 1;
		} else if (this.velocity.x < 0) {
			this.lastDirection = -1;
		}

		// Flip image calculation based on last direction
		if (this.lastDirection > 0) {
			c.scale(1, 1);
			this.flipX = this.position.x;
		} else {
			c.scale(-1, 1);
			this.flipX = -this.position.x - this.width;
		}

		c.drawImage(
			this.image,
			this.playerColor,
			0,
			this.width,
			this.height,
			this.flipX,
			this.position.y,
			this.width,
			this.height
		);
		c.restore();
	}
}
