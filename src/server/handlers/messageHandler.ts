import { DisconnectReason } from 'socket.io';
import { emitMessage } from '../socket';
import { PlayerInput } from '../common/types';
import {
	addPlayer,
	removePlayer,
	getPlayers,
} from '../controllers/PlayerController';
import { addInputToQueue } from '../controllers/InputController';
import { FAKE_LAG, LATENCY } from '../common/constants';

export function handleClientConnect(id: string) {
	console.log('A user connected: ' + id);
	addPlayer(id);
}

export function handleClientInput(id: string, input: PlayerInput) {
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
	emitMessage('updatePlayers', getPlayers());
}
