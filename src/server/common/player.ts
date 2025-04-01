import {
	PLAYER_WIDTH,
	PLAYER_HEIGHT,
	MAX_HEALTH,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	GROUND_FRICTION,
	GRAVITY_CONSTANT,
	AIR_FRICTION,
	JUMP_FORCE,
	SPEED,
} from './constants';
import { GameEvent, PlayerColor } from './types';
import { lerp, randNumberInRange } from './helpers';
import { Vector } from '../../lib/Vector';
import { getPlayers } from '../controllers/PlayerController';

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

	currentState: GameEvent;

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

		this.currentState = GameEvent.STOPPING;
	}

	setPosition(x: number, y: number) {
		this.position.x = x;
		this.position.y = y;
	}

	setVelocity(x: number, y: number) {
		this.velocity.x = x;
		this.velocity.y = y;
	}

	public setStateVelocity() {
		const newVelocity: Vector = new Vector(
			this.velocity.x,
			this.velocity.y
		);

		switch (this.currentState) {
			case GameEvent.JUMP:
				newVelocity.y = -1.0 * JUMP_FORCE;
				break;
			case GameEvent.RUN_LEFT:
				newVelocity.x = lerp(this.velocity.x, -1.0 * SPEED, 0.3);
				break;
			case GameEvent.RUN_RIGHT:
				newVelocity.x = lerp(this.velocity.x, 1.0 * SPEED, 0.3);
				break;
			case GameEvent.STOPPING:
				const currentFriction = this.isJumping
					? AIR_FRICTION
					: GROUND_FRICTION;
				newVelocity.x = lerp(this.velocity.x, 0, currentFriction);
				break;
		}

		this.setVelocity(newVelocity.x, newVelocity.y);
	}

	public applyForces(deltaTime: number) {
		if (this.isJumping) {
			this.applyGravity(deltaTime);
		}

		// if (this.isStopping) {
		// 	this.applyFriction(deltaTime);
		// }
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

	public move(deltaTime: number) {
		this.timeSinceInput += deltaTime;

		const newXPos = this.position.x + this.velocity.x * deltaTime;
		const newYPos = this.position.y + this.velocity.y * deltaTime;

		// const newPosition = new Vector(newXPos, newYPos);

		this.setPosition(newXPos, newYPos);

		if (this.checkCollisions()) {
			console.log('Collision resolved!');
		}
	}

	resolveCollision(player: Player): void {
		const overlapX = Math.min(
			this.position.x + this.width - player.position.x,
			player.position.x + player.width - this.position.x
		);
		const overlapY = Math.min(
			this.position.y + this.height - player.position.y,
			player.position.y + player.height - this.position.y
		);

		if (overlapX < overlapY) {
			// Horizontal collision
			if (this.position.x < player.position.x) {
				// Collided with the left side
				this.position.x = player.position.x - this.width;
			} else {
				// Collided with the right side
				this.position.x = player.position.x + player.width;
			}
			this.velocity.x = 0; // Stop horizontal movement
		} else {
			// Vertical collision
			if (this.position.y < player.position.y) {
				// Collided with the top
				this.position.y = player.position.y - this.height;
			} else {
				// Collided with the bottom
				this.position.y = player.position.y + player.height;
			}
			this.velocity.y = 0; // Stop vertical movement
		}
	}

	checkCollisions(): boolean {
		const players = getPlayers(); // Assuming `getPlayers()` retrieves all players

		for (const id in players) {
			const player = players[id];

			// Skip self
			if (player.id === this.id) continue;

			if (this.isColliding(player)) {
				this.resolveCollision(player);
				return true;
			}
		}

		return false;
	}

	isColliding(player: Player): boolean {
		return (
			this.position.x < player.position.x + player.width &&
			this.position.x + this.width > player.position.x &&
			this.position.y < player.position.y + player.height &&
			this.position.y + this.height > player.position.y
		);
	}
}
