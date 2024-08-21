import { InputQueue, PlayerInput, RawPlayerInput } from '../common/types';
import { Player } from '../components/Player';
import { emitMessage } from '../helpers/socket';

const inputQueue: InputQueue = [];
let buffer: Array<RawPlayerInput> = [];

function addInputToQueue(input: PlayerInput): void {
	inputQueue.push(input);
}

// TODO: Can return an undefined input? Return an error instead?
export function consumeInputFromQueue(): PlayerInput | undefined {
	const input = inputQueue.shift();
	return input;
}

export function addInputToBuffer(input: RawPlayerInput): void {
	buffer.push(input);
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
		emitMessage('sendInput', input);
	}
	buffer = [];
}
