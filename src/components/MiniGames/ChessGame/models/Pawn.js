import { Piece } from "./Piece";

export class Pawn extends Piece {
    constructor(position, team, hasMoved, enPassant = false, possibleMoves = []) {
        super(position, 'pawn', team, hasMoved, possibleMoves);
        this.enPassant = enPassant;
    }

    clone() {
        return new Pawn(
            this.position.clone(),
            this.team, 
            this.hasMoved, 
            this.enPassant, 
            this.possibleMoves ? this.possibleMoves.map(m => m.clone()) : []
        );
    }
}