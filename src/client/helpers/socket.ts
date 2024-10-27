import io, { Socket } from 'socket.io-client';
import {
	handleUpdatePlayers,
	handleSetUsernameResponse,
} from '../handlers/playerHandler';
import { BackendPlayers } from '../common/types';
export let socket: Socket;

export function setupSocket() {
	socket = io();

	socket.on(
		'updatePlayers',
		(playerStates: BackendPlayers, timestamp: number) => {
			handleUpdatePlayers(playerStates, timestamp);
		}
	);

	socket.on('setUsername', (data: any) => {
		handleSetUsernameResponse(data, socket.id);
	});

	console.log('Socket set up successfully');
}

export function emitMessage(eventName: string, data: any) {
	if (!socket || !socket.id) {
		console.error('Socket is not initialized.');
		return;
	}
	socket.emit(eventName, data);
}
