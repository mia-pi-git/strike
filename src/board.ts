/**
 * Game board
 */
import {Piece} from './piece';
import type {Side} from './data';

export type Coords = [number, number];

export class Terrain {
    type!: string;
    piece: Piece | null = null;
    constructor(public board: Board) {}
    toJSON() {
        return {
            type: this.type,
            piece: this.piece,
        }
    }
}

export class Board {
    tiles: Terrain[][] = [];
    constructor() {
        for (let i = 0; i < 8; i++) {
            this.tiles[i] = new Array(8).fill(null);
            this.tiles[i] = this.tiles[i].map(f => new Terrain(this));
        }
    }
    static isSide(str: string): str is Side {
        return ['front', 'back', 'left', 'right'].includes(str);
    }
    place(piece: Piece, x: number, y: number) {
        this.tiles[x][y].piece = piece;
        piece.x = x;
        piece.y = y;
    }
    get(coords: Coords) {
        return this.getTerrain(coords).piece;
    }
    getTerrain(coords: Coords) {
        return this.tiles[coords[0]][coords[1]];
    }
    set(coords: Coords, val: Piece | null) {
        this.tiles[coords[0]][coords[1]].piece = val;
    }
    setType(coords: Coords, type: string) {
        this.tiles[coords[0]][coords[1]].type = type;
    }
    move(fromCoords: Coords, toCoords: Coords) {
        const piece = this.get(fromCoords);
        if (piece) {
            this.set(fromCoords, null);
            this.set(toCoords, piece);
        }
    }
}  