/**
 * Player wrapper (todo)
 */
import {User} from './user';
import {Game} from './game';
import {Piece} from './piece';

export class Player {
    id: string;
    slot!: string;
    overcharged?: Piece;
    team: Piece[] = [];
    constructor(public user: User, public game: Game) {
        this.id = user.id;
    }
    error(message: string) {
        return this.user.send({
            type: 'error',
            roomid: this.game.room.id,
            message,
        });
    }
    send(message: {type: string} & any) {
        this.user.send(message);
    }
}