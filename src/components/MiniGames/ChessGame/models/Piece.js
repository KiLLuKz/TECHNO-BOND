import { Position } from "./Position";

export class Piece {
    constructor(position, type, team, hasMoved, possibleMoves = []) {
        // แนะนำ: ให้เตรียมรูปภาพหมากรุก (เช่น pawn_w.png) ไว้ในโฟลเดอร์ public/assets/images/
        this.image = `/assets/images/${type}_${team}.png`;
        this.position = position;
        this.type = type;
        this.team = team;
        this.possibleMoves = possibleMoves;
        this.hasMoved = hasMoved;
    }

    get isPawn() { return this.type === 'pawn'; }
    get isRook() { return this.type === 'rook'; }
    get isKnight() { return this.type === 'knight'; }
    get isBishop() { return this.type === 'bishop'; }
    get isKing() { return this.type === 'king'; }
    get isQueen() { return this.type === 'queen'; }

    samePiecePosition(otherPiece) {
        return this.position.samePosition(otherPiece.position);
    }

    samePosition(otherPosition) {
        return this.position.samePosition(otherPosition);
    }

    clone() {
        return new Piece(
            this.position.clone(),
            this.type, 
            this.team, 
            this.hasMoved,
            this.possibleMoves ? this.possibleMoves.map(m => m.clone()) : []
        );
    }
}