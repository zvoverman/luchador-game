import { Vector } from '../../lib/Vector';
import { JUMP_FORCE, SPEED } from '../common/constants';
import { GameEvent, InputQueue, PlayerInput } from '../common/types';
import { getPlayer } from './PlayerController';

// TODO: inputFrameBuffer or inputQueue?
const inputQueue: InputQueue = [];

export function addInputToQueue(input: PlayerInput): void {
	inputQueue.push(input);
}

export function processInputQueue(): void {
	while (inputQueue.length != 0) {
		const input = inputQueue.shift();
		if (!input || !input.id || !input.event) {
			console.log('Unable to process invalid input.');
			return;
		}

		const player = getPlayer(input.id);
		if (!player) continue;

		// for client reconciliation - DO NOT base movement on client passed values
		player.timestamp = input.timestamp;
		player.timeSinceInput = 0;

		const newVelocity: Vector = new Vector(
			player.velocity.x,
			player.velocity.y
		);

		switch (input.event) {
			case GameEvent.JUMP:
				player.isJumping = true;
				newVelocity.y = -1.0 * JUMP_FORCE;
				break;
			case GameEvent.RUN_LEFT:
				player.isStopping = false;
				newVelocity.x = -1.0 * SPEED;
				break;
			case GameEvent.RUN_RIGHT:
				player.isStopping = false;
				newVelocity.x = 1.0 * SPEED;
				break;
			case GameEvent.STOPPING:
				// flag to add friction in physics
				player.isStopping = true;
				newVelocity.x = player.velocity.x;
				break;
		}

		player.setVelocity(newVelocity.x, newVelocity.y);
	}
}
