import io, { Socket } from 'socket.io-client';
import {
	handleUpdatePlayers,
	handleSetUsernameResponse,
} from '../handlers/playerHandler';
import {
	ClientToServerEvent,
	ClientToServerEvents,
	ErrorPayload,
	RemovePlayerPayload,
	ServerToClientEvent,
	SetUsernamePayload,
	UpdateGameStatePayload,
} from '../common/types';
import { displayError, displayUsernameScreen } from '..';
import {
	removePlayer,
	setAuthoritativeState,
} from '../controllers/PlayerController';
export let socket: Socket;

export function setupSocket() {
	socket = io();

	socket.on(
		ServerToClientEvent.UPDATE_GAME_STATE,
		(data: UpdateGameStatePayload) => {
			handleUpdatePlayers(data.state);
		}
	);

	socket.on(ServerToClientEvent.ERROR, (err: ErrorPayload) => {
		const errorMessage = err?.message || 'An error has occured';
		console.error(errorMessage);
		displayError();
	});

	socket.on(
		ServerToClientEvent.REMOVE_PLAYER,
		(data: RemovePlayerPayload) => {
			if (!data.playerToRemove || !data.state) {
				console.error('Could not remove player');
			}
			removePlayer(data.playerToRemove);
			setAuthoritativeState(data.state);
		}
	);

	// TODO: This is a weird way to verify connections.... there may be a better 'handshake' method
	socket.on(ServerToClientEvent.CONNECTED, () => {
		console.log('Socket set up successfully');

		displayUsernameScreen();

		// load username from sessionStorage if available and verify it is not malicious
		const savedUsername = sessionStorage.getItem('username')?.trim();
		if (savedUsername) {
			emitMessage(
				ClientToServerEvent.VALIDATE_USERNAME,
				{
					userInput: savedUsername,
				},
				validateUsernameAck
			);
			console.log('username in sessionStorage available:', savedUsername);
		}
	});
}

export function emitMessage<T extends ClientToServerEvent>(
	eventName: T,
	data: ClientToServerEvents[T],
	callback?: (response: any) => void
) {
	if (!socket || !socket.id) {
		console.error('Socket is not initialized.', socket);
		return;
	}

	// emit the message with an optional acknowledgment callback
	if (callback) {
		const ackCallback = (response: any) => {
			callback(response);
		};

		socket.emit(eventName, data, ackCallback);
	} else {
		socket.emit(eventName, data);
	}
}

export function validateUsernameAck(response: SetUsernamePayload) {
	if (!response.username) {
		console.error('Username is invalid');
		return;
	}

	handleSetUsernameResponse(response.username, response.state);
}
