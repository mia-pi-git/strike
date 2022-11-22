/**
 * Piece wrapper
 */

import {pieces, PieceData, Side, terrains} from "./data";
import {Game} from './game';
import { toID } from "./user";

export class Piece {
    x: number = -1;
    y: number = -1;
    data: PieceData;
    direction: Side = 'front';
    /** obv */
    health!: number;
    /** Attack stat */
    attack!: number;
    /** Movement range */
    move!: number;
    /** Attack range */
    range!: number;
    side!: 'p1' | 'p2';
    active = true;
    constructor(public game: Game, data: PieceData | string) {
        this.data = typeof data === 'string' ? pieces[data] : data;
        for (const k in this.data.stats) {
            const key = k as keyof PieceData['stats'];
            this[key] = this.data.stats[key];
        }
    }
    canMove([x, y]: [number, number], isAttack = false) {
        const xChange = Math.abs(this.x - x);
        const yChange = Math.abs(this.y - y);
        const range = isAttack ? this.range : this.move;
        return !(yChange > range || xChange > range);
    }
    availableMoves() {}
    stat(key: keyof PieceData['stats']) {
        return this.data.stats[key];
    }
    static pieces = pieces;
    static get(name: string) {
        return this.pieces[toID(name)];
    }
    getDirection(target: Piece) {
        let direction;
        if (this.y > target.y) {
            direction = 'front';
        } else if (this.y < target.y) { 
            direction = 'back';
        } if (this.x < target.x) {
            direction = 'left';
        } else if (this.x > target.x) {
            direction = 'right'
        }
        return direction as Side;
    }
    getAttackPower(target: Piece) {
        const direction = this.getDirection(target);
        const terrain = this.game.board.getTerrain([target.x, target.y]);
        let power = this.attack;
        power += terrains[terrain.type].modifier;
        if (target.data.weakPoints?.includes(direction)) {
            power += 1;
        } else if (target.data.strengthPoints?.includes(direction)) {
            power -= 1;
        }
        return power;
    }
    toJSON() {
        return {
            name: this.data.name,
            health: this.health,
            attack: this.attack,
            move: this.move,
            range: this.range,
            location: [this.x, this.y],
            direction: this.direction,
        };
    }
}

export {pieces};