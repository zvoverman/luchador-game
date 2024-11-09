import io, { Socket } from 'socket.io-client';
import {
	handleUpdatePlayers,
	handleSetUsernameResponse,
} from '../handlers/playerHandler';
import { BackendPlayers } from '../common/types';
import { displayError, displayUsernameScreen } from '..';
import { removePlayer } from '../controllers/PlayerController';
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
		handleSetUsernameResponse(data);
	});

	socket.on('error', (err: any) => {
		const errorMessage = err?.message || 'An error has occured';
		console.log(errorMessage);
		displayError();
	});

	socket.on('removePlayer', (data: any) => {
		const id = data?.id;
		if (!id) return;
		removePlayer(id);
	});

	socket.on('connected', () => {
		console.log('Socket set up successfully');

		displayUsernameScreen();

		// Load username from sessionStorage if available
		const savedUsername = sessionStorage.getItem('username')?.trim();

		// double check session storage isn't malicious
		if (savedUsername) {
			emitMessage('validateUsername', { userInput: savedUsername }); // FIXME: type all emit messages and socket.on to verify correct input/output is sent/received
			console.log(
				'username in sessionStorage available: ',
				savedUsername
			);
		}
	});
}

export function emitMessage(eventName: string, data: any) {
	if (!socket || !socket.id) {
		console.error('Socket is not initialized.', socket);
		return;
	}
	socket.emit(eventName, data);
}
