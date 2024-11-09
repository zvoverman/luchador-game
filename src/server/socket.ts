import { Server as SocketIOServer, Socket, DisconnectReason } from 'socket.io';
import { Server } from 'http';
import {
	handleClientInput,
	handleClientDisconnect,
	handleClientConnect,
	handleValidateUsername,
} from './handlers/messageHandler';
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
		/**
		 *   Initialization
		 */

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
		 *   Socket Events from Client
		 */

		// recieve new inputs from client
		socket.on('sendInput', (input: any) => {
			// only handle client input if they have joined the 'game' room
			if (socket.rooms.has('game')) {
				handleClientInput(socket.id, input);
			}
		});

		// validate client entered username
		socket.on('validateUsername', (input: any) => {
			handleValidateUsername(socket, input);
		});

		// handle cleanup of client disconnect
		socket.on('disconnect', (reason: DisconnectReason) => {
			socketCount--;
			handleClientDisconnect(socket.id, reason);
		});
	});
}

/**
 * Emits a message to clients
 *
 * @param eventName - name of socket event
 * @param data - json data to send to client
 * @param room - room to emit message to
 */
export function emitMessage(eventName: string, data: any, room?: string) {
	if (room === undefined || room === null) {
		io.emit(eventName, data);
		return;
	}
	io.to(room).emit(eventName, data);
}
