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
	GameEvent,
	ProcessClientInputPayload,
	ValidateUsernamePayload,
} from './common/types';
import { getPlayers } from './controllers/PlayerController';

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

		if (socketCount > MAX_CLIENT_CAPACITY) {
			console.log('Maximum number of clients connected');
			emitMessage(
				ServerToClientEvent.ERROR, // TODO: ERROR and CONNECTED events should probably be the same -> CONNECTION_RESPONSE
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

		// Socket Events from Client

		socket.on(ClientToServerEvent.PROCESS_CLIENT_INPUT, (data: unknown) => {
			if (!socket.rooms.has('game')) return;

			if (typeof data !== 'object' || data === null) {
				console.error('Payload is not an object or is null', data);
				return;
			}

			if (!('input' in data) || typeof (data as any).input !== 'object') {
				console.error(
					'Payload does not include necessary fields or input is malformed',
					data
				);
				return;
			}

			const payload = data as ProcessClientInputPayload;

			if (!payload.input.event || !payload.input.timestamp) {
				console.error(
					'Payload Client Input does not include necessary fields',
					data
				);
				return;
			}

			const unfilteredInput = payload.input as PlayerInput;

			const isEventValidType =
				unfilteredInput.event === GameEvent.JUMP ||
				unfilteredInput.event === GameEvent.RUN_LEFT ||
				unfilteredInput.event === GameEvent.RUN_RIGHT ||
				unfilteredInput.event === GameEvent.STOPPING;

			const isTimestampValidType =
				typeof unfilteredInput.timestamp === 'number';

			if (!isEventValidType || !isTimestampValidType) {
				console.error(
					'Payload Client Input fields are of the wrong type',
					data
				);
				return;
			}

			const input: PlayerInput = {
				id: null,
				event: unfilteredInput.event,
				timestamp: unfilteredInput.timestamp,
			};

			handleClientInput(socket.id, input);
		});

		socket.on(
			ClientToServerEvent.VALIDATE_USERNAME,
			(data: unknown, callback: Function) => {
				if (typeof data !== 'object' || data === null) {
					console.error('Payload is not an object or is null', data);
					return;
				}

				if (
					!('userInput' in data) ||
					typeof (data as any).userInput !== 'string'
				) {
					console.error(
						'Payload does not include necessary fields or input is malformed',
						data
					);
					return;
				}

				const payload = data as ValidateUsernamePayload;

				const unfilteredUserInput = payload.userInput;

				// sanitize user inpupt and add player if username is valid
				const username = handleValidateUsername(
					socket,
					unfilteredUserInput
				);

				if (callback) {
					callback({
						username,
						state: getPlayers(),
						time: Date.now(),
					});
				} else {
					console.log('cannot ack', callback);
				}
			}
		);

		socket.on('disconnect', (reason: DisconnectReason) => {
			socketCount--;
			handleClientDisconnect(socket.id, reason);
		});
	});
}

/**
 * Generalized function to emit events to clients
 *
 * @param eventName - type of ServerToClientEvent
 * @param data - ServerToClientEvent's associated payload type
 * @param room - room to emit message to (optional param)
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
