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

		// TODO: set player velocty, position, etc based on client input
		const inputForce: { x?: number; y?: number } = {};

		switch (input.event) {
			case GameEvent.JUMP:
				player.isJumping = true;
				inputForce.y = -1.0 * JUMP_FORCE;
				break;
			case GameEvent.RUN_LEFT:
				player.isStopping = false;
				inputForce.x = -1.0 * SPEED;
				break;
			case GameEvent.RUN_RIGHT:
				player.isStopping = false;
				inputForce.x = 1.0 * SPEED;
				break;
			case GameEvent.STOPPING:
				// flag to add friction in physics
				player.isStopping = true;
				break;
		}

		player.setVelocity(inputForce);
	}
}
