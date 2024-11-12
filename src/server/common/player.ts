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
import { Vector } from '../../lib/Vector';

export class Player {
	id: string;
	position: Vector;
	velocity: Vector;
	width: number;
	height: number;
	currentHealth: number;
	playerColor: PlayerColor;
	username: string | null;

	isStopping: boolean;
	isJumping: boolean;

	timestamp: number;
	timeSinceInput: number;

	constructor(id: string, username: string) {
		this.id = id;
		this.position = new Vector(
			randNumberInRange(100 - PLAYER_WIDTH, CANVAS_WIDTH - 100),
			randNumberInRange(PLAYER_HEIGHT, CANVAS_HEIGHT - 300)
		);
		this.velocity = new Vector(0, 0);
		this.width = PLAYER_WIDTH;
		this.height = PLAYER_HEIGHT;
		this.currentHealth = MAX_HEALTH;
		this.playerColor = Math.floor(Math.random() * 4);
		this.username = username;

		this.isStopping = false;
		this.isJumping = true;

		this.timestamp = 0;
		this.timeSinceInput = 0;
	}

	setPosition(x: number, y: number) {
		this.position.x = x;
		this.position.y = y;
	}

	setVelocity(x: number, y: number) {
		this.velocity.x = x;
		this.velocity.y = y;
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
			this.setPosition(this.position.x, CANVAS_HEIGHT - this.height);
			this.setVelocity(this.velocity.x, 0);
		} else {
			// else apply gravity
			this.setVelocity(
				this.velocity.x,
				this.velocity.y + GRAVITY_CONSTANT * deltaTime
			);
		}
	}

	private applyFriction(deltaTime: number) {
		const FRICTION = this.isJumping ? AIR_FRICTION : GROUND_FRICTION;
		if (this.velocity.x > 0) {
			this.setVelocity(
				this.velocity.x - FRICTION * deltaTime,
				this.velocity.y
			);
			if (this.velocity.x < 0) {
				this.setVelocity(0, this.velocity.y);
			}
		} else if (this.velocity.x < 0) {
			this.setVelocity(
				this.velocity.x + FRICTION * deltaTime,
				this.velocity.y
			);
			if (this.velocity.x > 0) {
				this.setVelocity(0, this.velocity.y);
			}
		}
	}

	move(deltaTime: number) {
		this.timeSinceInput += deltaTime;

		const newXPos = this.position.x + this.velocity.x * deltaTime;
		const newYPos = this.position.y + this.velocity.y * deltaTime;
		this.setPosition(newXPos, newYPos);
	}
}
