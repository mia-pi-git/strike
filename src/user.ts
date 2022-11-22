/**
 * Connection wrapper
 */
import * as ws from 'ws';
import WebSocket from 'ws';
import {getRoom, Room} from './room';
import {Ladder} from './ladder';

export function toID(text: any): string {
	return (text && typeof text === "string" ? text : "").toLowerCase().replace(/[^a-z0-9]+/g, "") as string;
}

export class User {
    static users = new Map<string, User>();
    id: string = '';
    searching = false;
    activeGame?: Room;
    name: string = '';
    ip: string;
    constructor(
        public connection: WebSocket, 
        req: import('http').IncomingMessage
    ) {
        this.ip = req.socket.remoteAddress || "";
    }
    send(message: any) {
        return this.connection.send(JSON.stringify(message));
    }
    receive(message: any) {
        if (message.roomid) {
            const room = getRoom(message.roomid);
            if (!room) {
                return this.send({
                    type: 'error',
                    message: `Room ${message.roomid} not found.`,
                });
            }
            return room.receive(this, message);
        }
        switch (message.type) {
        case 'joinGame':
            if (this.activeGame) {
                return this.send({
                    type: 'error',
                    message: "You already have a game going.",
                });
            }
            if (!this.id) {
                return this.send({
                    type: 'error',
                    message: "You must choose a name before joining a match.",
                });
            }
            let target = getRoom(message.target);
            if (!target) {
                return this.send({
                    type: 'error',
                    message: `Room ${message.target} not found.`,
                });
            }
            target.users[this.id] = this;
            message.roomid = target.id;
            return target.receive(this, message);
        case 'startGame':
            if (this.activeGame) {
                return this.send({
                    type: 'error',
                    message: "You already have a game going.",
                });
            }
            if (!this.id) {
                return this.send({
                    type: 'error',
                    message: "You must choose a name before starting a game.",
                });
            }
            const room = new Room();
            this.activeGame = room;
            room.users[this.id] = this;
            room.game.addPlayer(this);
            this.send({
                type: 'gameStarted',
                message: room.id,
            });
            this.send({
                room: room.id,
                type: 'beginSelect',
            });
            return;
        case 'name':
            const id = toID(message.data);
            if (!id) {
                return this.send({
                    type: 'error',
                    message: 'Invalid username - must have at least one letter',
                });
            }
            if (User.users.get(id)) {
                return this.send({
                    type: 'loginfailed',
                    message: `The name '${id}' is already in use.`,
                });
            }
            this.id = id;
            this.name = message.name;
            User.users.set(id, this);
            this.send({
                type: 'loggedin',
                message: id,
            });
            break;
        default:
            return this.send({
                type: 'error',
                message: `Unrecognized message type '${message.type}'`,
            });
        }
    }
    destroy() {
        User.users.delete(this.id);
        delete Ladder.searches[this.id];
        if (this.activeGame) {
            this.activeGame.game.forfeit(this.id);
        }
        try {
            this.connection.close();
        } catch {}
    }
}