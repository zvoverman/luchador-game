import io, { Socket } from 'socket.io-client';
import {
	handleUpdatePlayers,
	handleSetUsernameResponse,
} from '../handlers/playerHandler';
import {
	BackendPlayers,
	ClientToServerEvent,
	ClientToServerEvents,
	ServerToClientEvent,
} from '../common/types';
import { displayError, displayUsernameScreen } from '..';
import {
	removePlayer,
	setAuthoritativeState,
} from '../controllers/PlayerController';
import { Server } from 'http';
export let socket: Socket;

export function setupSocket() {
	socket = io();

	socket.on(ServerToClientEvent.UPDATE_GAME_STATE, (data: any) => {
		const playerStates: BackendPlayers = data.state;
		handleUpdatePlayers(playerStates);
	});

	socket.on(ServerToClientEvent.SET_USERNAME, (data: any) => {
		handleSetUsernameResponse(data);
	});

	socket.on(ServerToClientEvent.ERROR, (err: any) => {
		const errorMessage = err?.message || 'An error has occured';
		console.log(errorMessage);
		displayError();
	});

	// TODO: type data and verify fields before calling functions
	socket.on(ServerToClientEvent.REMOVE_PLAYER, (data: any) => {
		const id = data?.playerToRemove;
		const state = data?.state;
		if (!id || !state) return;
		removePlayer(id);
		setAuthoritativeState(state);
	});

	socket.on(ServerToClientEvent.CONNECTED, () => {
		console.log('Socket set up successfully');

		displayUsernameScreen();

		// Load username from sessionStorage if available
		const savedUsername = sessionStorage.getItem('username')?.trim();

		// double check session storage isn't malicious
		if (savedUsername) {
			emitMessage(ClientToServerEvent.VALIDATE_USERNAME, {
				userInput: savedUsername,
			}); // FIXME: type all emit messages and socket.on to verify correct input/output is sent/received
			console.log(
				'username in sessionStorage available: ',
				savedUsername
			);
		}
	});
}

export function emitMessage<T extends ClientToServerEvent>(
	eventName: T,
	data: ClientToServerEvents[T]
) {
	if (!socket || !socket.id) {
		console.error('Socket is not initialized.', socket);
		return;
	}
	socket.emit(eventName, data);
}
