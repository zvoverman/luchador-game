import io, { Socket } from 'socket.io-client';
import { handleUpdatePlayers } from '../handlers/playerHandler';
import { BackendPlayers } from '../common/types';
import { timeSync } from './gameLogic';
import { TIME_SYNC_INTERVAL } from '../common/constants';

export let socket: Socket;

export function setupSocket() {
	socket = io();

	socket.on(
		'updatePlayers',
		(playerStates: BackendPlayers, timestamp: number) => {
			handleUpdatePlayers(playerStates, timestamp);
		}
	);

	socket.on('time-sync', (timestamp: number) => {
		timeSync(timestamp);
	});

	socket.emit('request-time-sync');

	// periodically resynchronize the time
	setInterval(() => {
		socket.emit('request-time-sync');
	}, TIME_SYNC_INTERVAL);

	console.log('Socket set up successfully');
}

export function emitMessage(eventName: string, data: any) {
	if (!socket) {
		console.error('Socket is not initialized.');
		return;
	}
	socket.emit(eventName, data);
}
