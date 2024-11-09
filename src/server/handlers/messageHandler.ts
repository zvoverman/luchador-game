import { DisconnectReason } from 'socket.io';
import { emitMessage } from '../socket';
import { GameEvent, PlayerInput } from '../common/types';
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

export function handleValidateUsername(socket: Socket, input: any) {
	const userInput = input.userInput;

	// sanitize user input
	const username = sanitizeUserInput(userInput) || 'guest fighter';

	// set new player's username
	if (username != null && socket.id != null) {
		// join game room
		socket.join('game');

		// add a new player
		addPlayer(socket.id, username);
	}

	console.log(getPlayer(socket.id));

	// send sanitized username back to client
	emitMessage(
		'setUsername',
		{ username, state: getPlayers(), time: Date.now() },
		'game'
	);
}

// update players to reflect deleted backEndPlayer on client-side
export function handleClientDisconnect(id: string, reason: DisconnectReason) {
	console.log('User disconnected:', reason);
	removePlayer(id);
	emitMessage('removePlayer', { id }, 'game');
}

function sanitizeUserInput(userInput: string | null): string | null {
	if (userInput === null || userInput === undefined) {
		return null;
	}

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
