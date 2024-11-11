import { DisconnectReason } from 'socket.io';
import { emitMessage } from '../socket';
import { GameEvent, PlayerInput, ServerToClientEvent } from '../common/types';
import {
	removePlayer,
	getPlayers,
	addPlayer,
	getPlayer,
} from '../controllers/PlayerController';
import { addInputToQueue } from '../controllers/InputController';
import { FAKE_LAG, LATENCY } from '../common/constants';
import { Socket } from 'socket.io';

export function handleClientConnect(id: string) {
	console.log('A user connected: ' + id);
}

export function handleClientInput(id: string, input: PlayerInput) {
	const delay = FAKE_LAG ? LATENCY : 0;
	setTimeout(() => {
		input.id = id;
		addInputToQueue(input);
	}, delay);
}

export function handleValidateUsername(
	socket: Socket,
	unfilteredUserInput: string
): string | null {
	const username = sanitizeUserInput(unfilteredUserInput);

	if (username != null && socket.id != null) {
		socket.join('game');
		addPlayer(socket.id, username);
	}

	console.log(getPlayer(socket.id));

	return username;
}

export function handleClientDisconnect(id: string, reason: DisconnectReason) {
	console.log('User disconnected:', reason);
	removePlayer(id);
	emitMessage(
		ServerToClientEvent.REMOVE_PLAYER,
		{ playerToRemove: id, state: getPlayers(), time: Date.now() },
		'game'
	);
}

function sanitizeUserInput(userInput: string): string | null {
	// espace HTML special characters to prevent XSS (Cross-Site Scripting) attacks
	const usernameEscapeHTML = sanitizeHTML(userInput.trim());

	// restrict allowed username length
	const username = sanitizeLength(usernameEscapeHTML, 20);

	// characters must be within ASCII range
	if (!sanitizeAlphanumeric(username)) {
		console.error('Invalid username');
		return null;
	}

	return username;
}

function sanitizeAlphanumeric(input: string): boolean {
	// regex to match only ASCII characters (0-127)
	const asciiRegex = /^[\x00-\x7F]*$/;
	return asciiRegex.test(input);
}

function sanitizeHTML(input: string): string {
	return input
		.replace(/&/g, '&amp;') // replace & with &amp;
		.replace(/</g, '&lt;') // replace < with &lt;
		.replace(/>/g, '&gt;') // replace > with &gt;
		.replace(/"/g, '&quot;') // replace " with &quot;
		.replace(/'/g, '&#039;'); // replace ' with &#039;
}

function sanitizeLength(input: string, maxLength: number): string {
	return input.length > maxLength ? input.substring(0, maxLength) : input;
}
