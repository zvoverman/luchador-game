import {
	ClientToServerEvent,
	InputQueue,
	PlayerInput,
	RawPlayerInput,
} from '../common/types';
import { Player } from '../components/Player';
import { emitMessage, socket } from '../helpers/socket';
import { getPlayers } from './PlayerController';

const inputQueue: InputQueue = [];
let buffer: Array<RawPlayerInput> = [];

function addInputToQueue(input: PlayerInput): void {
	inputQueue.push(input);
}

export function getInputQueue(): InputQueue {
	return inputQueue;
}

// TODO: Can return an undefined input? Return an error instead?
export function consumeInputFromQueue(): PlayerInput | undefined {
	const input = inputQueue.shift();
	return input;
}

export function eraseInputQueue(): void {
	let input = consumeInputFromQueue();
	while (input) {
		input = consumeInputFromQueue();
	}
}

export function addInputToBuffer(input: RawPlayerInput): void {
	// disregard input if socket does not exist
	if (!socket || !socket.id) return;

	// disregard input if player or their respective username do not exist
	const players = getPlayers();
	const player = players[socket.id];
	if (!player || !players[socket.id].username) return;

	buffer.push(input);
}

export function getInputQueueLength(): number {
	return inputQueue.length;
}

export function peekInputQueue(): PlayerInput | undefined {
	return inputQueue[1];
}

export function processRawInputs(timestamp: number) {
	for (const i in buffer) {
		let rawInput = buffer[i];
		if (!rawInput.event) {
			return;
		}
		const input: PlayerInput = {
			event: rawInput.event,
			timestamp: timestamp,
		};
		addInputToQueue(input);
		emitMessage(ClientToServerEvent.PROCESS_CLIENT_INPUT, { input });
	}
	buffer = [];
}
