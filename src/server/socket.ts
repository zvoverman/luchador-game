import { Server as SocketIOServer, Socket, DisconnectReason } from 'socket.io';
import { Server } from 'http';
import { PlayerInput } from './common/types';
import {
	handleClientInput,
	handleClientDisconnect,
	handleClientConnect,
} from './handlers/messageHandler';
import {
	addPlayer,
	getPlayer,
	getPlayers,
} from './controllers/PlayerController';
import { MAX_CLIENT_CAPACITY } from './common/constants';

const io = new SocketIOServer();

let socketCount: number = 0;

export function setupSocket(server: Server) {
	io.attach(server, {
		cors: {
			origin: 'http://localhost:3000',
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket: Socket) => {
		socketCount++;
		handleClientConnect(socket.id);

		// maximum number of players has been reached, disconnect any new socket connections
		if (socketCount > MAX_CLIENT_CAPACITY) {
			console.log('Maximum number of clients connected');
			emitMessage(
				'error',
				{
					message: 'maximum number of players reached',
				},
				socket.id
			);
			// must decrement socketCount outside socket.on('disconnect') because disconnection from the server does not send an event
			socketCount--;
			socket.disconnect();
		}

		emitMessage('connected', {}, socket.id);

		/**
		 * Socket Events from Client
		 */
		socket.on('sendInput', (input: any) => {
			// only handle client input if they have joined the 'game' room
			if (socket.rooms.has('game')) {
				handleClientInput(socket.id, input);
			}
		});

		socket.on('setUsername', (data: any) => {
			const userInput = data.userInput;

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
		});

		socket.on('disconnect', (reason: DisconnectReason) => {
			socketCount--;
			handleClientDisconnect(socket.id, reason);
		});

		socket.on('disconnecting', () => {
			console.log(socket.rooms); // the Set contains at least the socket ID
		});
	});
}

export function emitMessage(eventName: string, data: any, room?: string) {
	if (room === undefined || room === null) {
		io.emit(eventName, data);
		return;
	}
	io.to(room).emit(eventName, data);
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
