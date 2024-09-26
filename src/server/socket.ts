import { Server as SocketIOServer, Socket, DisconnectReason } from 'socket.io';
import { Server } from 'http';
import { PlayerInput } from './common/types';
import {
	handleClientInput,
	handleClientDisconnect,
	handleClientConnect,
} from './handlers/messageHandler';
import { FAKE_LAG, LATENCY } from './common/constants';

const io = new SocketIOServer();

export function setupSocket(server: Server) {
	io.attach(server, {
		cors: {
			origin: 'http://localhost:3000',
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket: Socket) => {
		handleClientConnect(socket.id);

		socket.on('sendInput', (input: PlayerInput) => {
			handleClientInput(socket.id, input);
		});

		socket.on('disconnect', (reason: DisconnectReason) => {
			handleClientDisconnect(socket.id, reason);
		});

		socket.on('request-time-sync', () => {
			const delay = FAKE_LAG ? LATENCY : 0;
			const serverTime = Date.now();
			setTimeout(() => {
				socket.emit('time-sync', serverTime);
			}, delay);
		});
	});
}

export function emitMessage(eventName: string, data: any) {
	io.emit(eventName, data);
}
