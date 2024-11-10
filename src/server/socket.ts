import { Server as SocketIOServer, Socket, DisconnectReason } from 'socket.io';
import { Server } from 'http';
import {
	handleClientInput,
	handleClientDisconnect,
	handleClientConnect,
	handleValidateUsername,
} from './handlers/messageHandler';
import { MAX_CLIENT_CAPACITY } from './common/constants';
import {
	PlayerInput,
	ServerToClientEvent,
	ServerToClientEvents,
	ClientToServerEvent,
} from './common/types';

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
				ServerToClientEvent.ERROR,
				{
					message: 'maximum number of players reached',
				},
				socket.id
			);
			// must decrement socketCount outside socket.on('disconnect') because disconnection from the server does not send an event
			socketCount--;
			socket.disconnect();
		}

		emitMessage(ServerToClientEvent.CONNECTED, {}, socket.id);

		/**
		 *   Socket Events from Client
		 */

		// recieve new inputs from client
		socket.on(ClientToServerEvent.PROCESS_CLIENT_INPUT, (data: any) => {
			// only handle client input if they have joined the 'game' room
			if (!socket.rooms.has('game')) return;

			const input: PlayerInput = data.input;
			handleClientInput(socket.id, input);
		});

		// validate client entered username
		socket.on(ClientToServerEvent.VALIDATE_USERNAME, (input: any) => {
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
export function emitMessage<T extends ServerToClientEvent>(
	eventName: T,
	data: ServerToClientEvents[T],
	room?: string
) {
	if (room === undefined || room === null) {
		io.emit(eventName, data);
	} else {
		io.to(room).emit(eventName, data);
	}
}
