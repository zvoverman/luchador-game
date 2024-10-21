import io, { Socket } from 'socket.io-client';
import { handleUpdatePlayers } from '../handlers/playerHandler';
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

	console.log('Socket set up successfully');
}

export function emitMessage(eventName: string, data: any) {
	if (!socket) {
		console.error('Socket is not initialized.');
		return;
	}
	socket.emit(eventName, data);
}
