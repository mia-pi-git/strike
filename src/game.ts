/**
 * Game wrapper
 */
import {Board, Coords} from './board';
import {Piece} from './piece';
import {Player} from './player';
import {Room} from './room';
import {User, toID} from './user';

const Utils = {
    requireKeys(obj: any, keys: string[], checker?: (val: any) => boolean) {
        for (const k of keys) {
            if (!obj[k] || (checker && !checker(obj[k]))) {
                return false;
            }  
        }
        return true;
    }
}

export class Game {
    status: 'playing' | 'placing' | 'selecting' = 'selecting';
    board = new Board();
    p1!: Player;
    p2!: Player;
    teamsSent = 0;
    // TODO: impl overcharge
    // A single piece can only move and attack once in a turn.
    // However, you can choose to Overcharge that piece, which allows 
    //  you to move that piece or attack with it a second time. 
    // However, to do so, that piece must sacrifice 2 Health points. 
    // This damage is dealt after the Overcharge action is taken.
    turnActions: string[] = [];
    teams: Record<'p1' | 'p2', string[]> = {
        p1: [], p2: [],
    };
    piecesPlaced = {
        p1: 0,
        p2: 0,
    };
    turn!: 'p1' | 'p2';
    constructor(public room: Room) {}
    addPlayer(user: User) {
        const player = new Player(user, this);
        if (!this.p1) {
            this.p1 = player;
            player.slot = 'p1';
        } else if (!this.p2) {
            this.p2 = player;
            player.slot = 'p2';
        } else {
            return false;
        }
        return true;
    }
    getPlayer(id: string) {
        if (this.p1.id === id) return this.p1;
        if (this.p2.id === id) return this.p2;
        return null;
    }
    getSlot(player: Player | null) {
        if (this.p2 === player) return 'p2';
        if (this.p1 === player) return 'p1';
        return false;
    }
    setTeam(slot: string, player: Player, pieces: string[]) {
        let bank = 10;
        const seen = {} as Record<string, number>;
        const out = [];
        for (const piece of pieces) {
            const data = Piece.get(piece);
            if (!data) {
                player.error(`Invalid team member: '${piece}'`);
                return false;
            }
            if (!seen[piece]) seen[piece] = 0;
            seen[piece]++;
            if (seen[piece] > 4) {
                player.error(`You have more than 4 of the ${data.name} piece`);
                return false;
            }
            if (bank - data.victoryPoints < 0) {
                player.error(`You can only spend 10 VP for a set.`);
                return false;
            }
            bank -= data.victoryPoints;
            out.push(data.name);
        }
        this.teams[slot as 'p1' | 'p2'] = out;
        this.teamsSent++;
        this[slot as 'p1' | 'p2'].send({
            type: 'team',
            message: out,
        });
        if (this.teamsSent >= 2) {
            this.startPlacement();
        }
    }
    startPlacement() {
        // After choosing your set of pieces, the game will start. 
        // Each player must place their pieces onto the board within the two rows
        //  nearest to them.
        // then we randomize who starts.
        this.status = 'placing';
        for (const player of [this.p1, this.p2]) {
            player.send({
                roomid: this.room.id,
                type: 'gameStart',
            });
        }
    }
    place(slot: 'p1' | 'p2', coords: Coords, piece: string) {
        const player = this[slot];
        const [x, y] = coords;
        const data = Piece.get(piece);
        if (!data) {
            return player.error(`Invalid piece: '${piece}'`);
        }
        if (!this.teams[slot].includes(data.name)) {
            return player.error(`You don't have a ${data.name} on your team.`);
        }
        // TODO: enforce limitations on placing only as many as are in your team
        if (slot === 'p2') {
            if (y < 6) {
                player.error('You may only place on the first two rows on your side.');
                return false;
            }
        } else {
            if (y > 2) {
                player.error('You may only place on the first two rows on your side.');
                return false;
            }
        }
        const totalCount = this.teams[slot]
            .map(toID)
            .filter(f => f === toID(data.name))
            .length;
        const existingCount = player.team
            .filter(f => f.data.name === data.name)
            .length;
        if (totalCount >= existingCount) {
            return player.error(
                `You tried to place a ${data.name}, ` +
                `but you have already placed all of your ${data.name}s.`
            );
        }
        const pieceObj = new Piece(this, piece);
        pieceObj.side = slot;
        this.board.place(pieceObj, x, y);
        this.piecesPlaced[slot]++;
        this.checkStart();
    }
    checkStart() {
        const necessary = this.teams.p1.length + this.teams.p2.length;
        if ((this.piecesPlaced.p1 + this.piecesPlaced.p2) >= necessary) {
            this.startPlay();
        }
    }
    startPlay() {
        this.turn = 'p1';
        this.status = 'playing';
        this.updateBoard();
        this.p1.send({
            type: 'startTurn',
        });
    }
    updateBoard() {
        this.room.broadcast({
            type: 'boardUpdate',
            data: this.board.tiles,
        });
    }

    dispatchMove(player: Player, data: any) {
        if (!data.type) {
            return player.error("Invalid move data sent");
        }
        if (this.turn !== player.slot) {
            return player.error("It's not your turn.");
        }
        switch (data.type) {
        case 'Move': case 'Sprint': case 'Attack':
            if (!Utils.requireKeys(data, ['to', 'from'], Array.isArray)) {
                return player.error("Invalid request sent");
            }
            (this as any)[`try${data.type}`](player, data.from, data.to);
            break;
        case 'Overcharge':
            if (!Utils.requireKeys(data, ['coords'], Array.isArray)) {
                return player.error("Invalid request sent");
            }
            this.tryOvercharge(player, data.coords);
        }
    }

    // actions
    tryMove(player: Player, fromCoords: Coords, toCoords: Coords) {
        if (this.turn !== player.slot) {
            return player.error("It's not your turn.");
        }
        if (
            !this.turnActions.includes('overcharge') && 
            this.turnActions.includes('move')
        ) {
            return player.error("You've already moved once this turn.");
        }
        const piece = this.board.get(fromCoords);
        if (!piece || piece.side !== player.slot) {
            return player.error('You have no piece at those coordinates.');
        }
        if (!piece.canMove(toCoords)) {
            return player.error("You can't move to that location.");
        }
        const existing = this.board.get(toCoords);
        if (existing) {
            return player.error("That location already has a piece in it.");
        }
        this.board.move(fromCoords, toCoords);
        this.turnActions.push('move');
        this.updateBoard();
        this.afterMove();
    }

    trySprint(player: Player, to: Coords, from: Coords) {
        if (this.turn !== player.slot) {
            return player.error("It's not your turn.");
        }
        if (this.turnActions.includes('sprint')) {
            return player.error("You've already sprinted this turn.");
        }
        if (this.board.get(to)) {
            return player.error(
                "There's already someone at the location you're trying to move to"
            );
        }
        const piece = this.board.get(from);
        if (!piece || piece.side !== player.slot) {
            return player.error("You have no piece at that location.");
        }
        piece.range += 1;
        if (!piece.canMove(to)) {
            return player.error("You can't move to that location.");
        }
        piece.range -= 1;
        this.board.move(from, to);
        this.turnActions.push('sprint');
        this.updateBoard();
        this.afterMove(); 
    }

    tryAttack(player: Player, to: Coords, from: Coords) {
        if (this.turn !== player.slot) {
            return player.error("It's not your turn.");
        }
        if (
            !this.turnActions.includes('overcharge') && 
            this.turnActions.includes('attack')
        ) {
            return player.error("You've already attacked this turn.");
        }
        if (this.turnActions.includes('sprint')) {
            return player.error("You sprinted this turn, so you may not attack.");
        }
        const piece = this.board.get(from);
        if (!piece || piece.side !== player.slot) {
            return player.error('You have no piece at those coordinates.');
        }
        const target = this.board.get(to);
        if (!target) {
            return player.error("There's no target to attack at that location.");
        }
        const power = piece.getAttackPower(target);
        const diff = power - target.attack;
        target.health -= diff;
        if (power <= target.attack) {
            piece.health -= 1;
            // TODO: knock piece back (defense break effect)
            // also todo: Knockback
            // Defense Break: If an attacking piece has an equal or lower Combat Power than a defending piece, 
            //  both pieces will lose 1 Health point, and the defending piece will be knocked back one space.
            // Knockback: A piece that is knocked back moves one spot away from the attacking piece. 
            // If it isn't possible for the affected piece to move back, it will lose a point of Health instead. 
            // If the space behind the affected piece is already occupied, both of these pieces will lose a point of Health.
            // TODO: (3) - should they faint here?
        }
        if (target.health <= 0) {
            // remove, update board, inform players, etc
            this.faint(target);
        }
        this.turnActions.push('attack');
        this.afterMove();
    }

    faint(target: Piece) {
        target.active = false;
        this.board.set([target.x, target.y], null);
        this.updateBoard();
        // todo: check win here
    }

    tryOvercharge(player: Player, coords: Coords) {
        if (this.turn !== player.slot) {
            return player.error("It's not your turn.");
        }
        if (this.turnActions.includes('overcharge')) {
            return player.error("You've already overcharged once this turn.");
        }
        const piece = this.board.get(coords);
        if (!piece || piece.side !== player.slot) {
            return player.error("You have no piece at that location.");
        }
        player.overcharged = piece;
        this.turnActions.push('overcharge');
        this.broadcast({
            type: 'overcharged',
            data: coords,
        });
    }

    trySetDirection(player: Player, coords: Coords, direction: string) {
        const piece = this.board.get(coords);
        if (!piece || piece.side !== player.slot) {
            return player.error("You have no piece at that location.");
        }
        direction = toID(direction);
        if (!Board.isSide(direction)) {
            return player.error(
                "Invalid direction. Valid directions: left, right, front, back."
            );
        }
        piece.direction = direction;
        this.turnActions.push('rotate');
    }
    // no longer actions
    afterMove() {
        if (this.turnActions.length >= 2) {
            const charged = this[this.turn].overcharged;
            if (charged) {
                charged.health -= 2;
                if (charged.health <= 0) {
                    this.faint(charged);
                    this.broadcast({
                        type: 'pieceLost',
                        data: {
                            coords: [charged.x, charged.y], 
                            piece: charged.data.name,
                        },
                    });
                }
            }
            this.turn = this.turn === 'p1' ? 'p2' : 'p1';
            this[this.turn].send({
                type: 'startTurn',
            });
            this.turnActions = [];
        } else {
            this[this.turn].send({
                type: 'startTurn',
            });
        }
    }
    broadcast(message: any) {
        this.room.broadcast(message);
    }
    forfeit(id: string) {

    }
}