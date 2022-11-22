/**
 * Game room
 */

import {Game} from "./game";
import {User} from './user';
import * as crypto from 'crypto';

export class Room {
    static rooms = new Map<string, Room>();
    id = crypto.randomBytes(10).toString('hex');
    game = new Game(this);
    users = {} as Record<string, User>;
    lastActiveTime = Date.now();
    broadcast(message: any) {
        this.lastActiveTime = Date.now();
        for (const user of Object.values(this.users)) {
            user.send(message);
        }
    }
    receive(user: User, message: any) {
        if (!message.type) {
            return user.send({
                type: 'error',
                message: 'Malformed message sent',
            });
        }
        this.lastActiveTime = Date.now();
        const player = this.game.getPlayer(user.id);
        const slot = this.game.getSlot(player);
        switch (message.type) {
        case 'move':
            if (!player || !slot) {
                return user.send({
                    type: 'error',
                    message: "You're not a player in this match.",
                });
            }
            if (!message.data) {
                return player.error("No coordinates sent.");
            }
            if (!['to', 'from'].every(m => Array.isArray(message.data[m]))) {
                return player.error("Malformed coordinates sent.");
            }
            this.game.tryMove(player, message.data.from, message.data.to);
            break;
        case 'joinGame':
            if (!this.game.addPlayer(user)) {
                return user.send({
                    type: 'error',
                    message: 'This game already has two players.',
                });
            }
            user.send({
                type: 'gameStarted',
                message: this.id,
            });
            user.send({
                room: this.id,
                type: 'beginSelect',
            });
            user.send({
                roomid: this.id,
                type: 'joinedGame',
            });
            break;
        case 'setTeam':
            if (!player || !slot) {
                return user.send({
                    type: 'error',
                    message: "You're not a player in this game.",
                });
            }
            if (!message.team) {
                return user.send({
                    type: 'error',
                    message: "No team sent",
                });
            }
            this.game.setTeam(slot, player, message.team);
            break;
        case 'action':
            if (!player || !slot) {
                return user.send({
                    type: 'error',
                    message: "You're not a player in this game",
                });
            }
            if (this.game.turn !== player.slot) {
                return player.error("It's not your turn.");
            }
            if (!message.data) {
                return player.error("Invalid message sent");
            }
            return this.game.dispatchMove(player, message.data);
        }
    }
}

export function getRoom(id: string) {
    return Room.rooms.get(id) || null;
}