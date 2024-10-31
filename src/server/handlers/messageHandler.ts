import { DisconnectReason } from 'socket.io';
import { emitMessage } from '../socket';
import { GameEvent, PlayerInput } from '../common/types';
import { removePlayer, getPlayers } from '../controllers/PlayerController';
import { addInputToQueue } from '../controllers/InputController';
import { FAKE_LAG, LATENCY } from '../common/constants';

export function handleClientConnect(id: string) {
	console.log('A user connected: ' + id);
}

// do not assume client input type
export function handleClientInput(id: string, unfilteredInput: any) {
	// check that input has necessary fields
	if (!unfilteredInput.event || !unfilteredInput.timestamp) {
		console.error('Invalid input');
		return;
	}

	// check that necessary fields are of the correct type
	const isEventValidType =
		unfilteredInput.event === GameEvent.JUMP ||
		unfilteredInput.event === GameEvent.RUN_LEFT ||
		unfilteredInput.event === GameEvent.RUN_RIGHT ||
		unfilteredInput.event === GameEvent.STOPPING;

	const isTimestampValidType = typeof unfilteredInput.timestamp === 'number';

	if (!isEventValidType || !isTimestampValidType) {
		console.error('Input is of invalid type');
		return;
	}

	const input: PlayerInput = {
		id: null,
		event: unfilteredInput.event,
		timestamp: unfilteredInput.timestamp,
	};

	// add input to the queue
	const delay = FAKE_LAG ? LATENCY : 0;
	setTimeout(() => {
		input.id = id;
		addInputToQueue(input);
	}, delay);
}

// update players to reflect deleted backEndPlayer on client-side
export function handleClientDisconnect(id: string, reason: DisconnectReason) {
	console.log('User disconnected:', reason);
	removePlayer(id);
	emitMessage('removePlayer', { id }, 'game');
}
