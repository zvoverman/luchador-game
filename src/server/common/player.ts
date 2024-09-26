import {
	PLAYER_WIDTH,
	PLAYER_HEIGHT,
	MAX_HEALTH,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	GROUND_FRICTION,
	GRAVITY_CONSTANT,
	AIR_FRICTION,
} from './constants';
import { PlayerColor } from './types';
import { randNumberInRange } from './helpers';

export class Player {
	id: string;
	position: { x: number; y: number };
	velocity: { x: number; y: number };
	width: number;
	height: number;
	currentHealth: number;
	playerColor: PlayerColor;

	isStopping: boolean;
	isJumping: boolean;

	timestamp: number;

	constructor(id: string) {
		this.id = id;
		this.position = {
			x: randNumberInRange(100 - PLAYER_WIDTH, CANVAS_WIDTH - 100),
			y: randNumberInRange(PLAYER_HEIGHT, CANVAS_HEIGHT - 300),
		};
		this.velocity = { x: 0, y: 0 };
		this.width = PLAYER_WIDTH;
		this.height = PLAYER_HEIGHT;
		this.currentHealth = MAX_HEALTH;
		this.playerColor = Math.floor(Math.random() * 4);

		this.isStopping = false;
		this.isJumping = true;

		this.timestamp = 0;
	}

	setPosition(position: { x: number; y: number }) {
		this.position = position;
	}

	// woah... javascript treating component x = 0 as !x
	// must explicitly check for velocity.x !== undefined rather than !velocity.x
	public setVelocity(velocity: { x?: number; y?: number }) {
		const inputForce = {
			x: velocity.x !== undefined ? velocity.x : this.velocity.x,
			y: velocity.y !== undefined ? velocity.y : this.velocity.y,
		};
		this.velocity = inputForce;
	}

	public applyForces(deltaTime: number) {
		if (this.isJumping) {
			this.applyGravity(deltaTime);
		}

		if (this.isStopping) {
			this.applyFriction(deltaTime);
		}
	}

	private applyGravity(deltaTime: number) {
		// if player will be beyond the FLOOR after forces are applied...
		if (
			this.position.y + this.velocity.y * deltaTime >
			CANVAS_HEIGHT - this.height
		) {
			// stop gravity
			this.isJumping = false;
			this.setPosition({
				x: this.position.x,
				y: CANVAS_HEIGHT - this.height,
			});
			this.setVelocity({ y: 0 });
		} else {
			// else apply gravity
			this.setVelocity({
				y: (this.velocity.y += GRAVITY_CONSTANT * deltaTime),
			});
		}
	}

	private applyFriction(deltaTime: number) {
		const FRICTION = this.isJumping ? AIR_FRICTION : GROUND_FRICTION;
		if (this.velocity.x > 0) {
			this.setVelocity({
				x: (this.velocity.x -= FRICTION * deltaTime),
			});
			if (this.velocity.x < 0) {
				this.setVelocity({ x: 0 });
			}
		} else if (this.velocity.x < 0) {
			this.setVelocity({
				x: (this.velocity.x += FRICTION * deltaTime),
			});
			if (this.velocity.x > 0) {
				this.setVelocity({ x: 0 });
			}
		}
	}

	move(deltaTime: number) {
		this.setPosition({
			x: this.position.x + this.velocity.x * deltaTime,
			y: this.position.y + this.velocity.y * deltaTime,
		});
	}
}
