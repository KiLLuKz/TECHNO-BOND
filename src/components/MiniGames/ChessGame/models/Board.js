import { Position } from "./Position";
import { Pawn } from "./Pawn";
import { Piece } from "./Piece";
// เดี๋ยวเราจะรับฟังก์ชันเหล่านี้มาจากโฟลเดอร์ rules ในขั้นตอนต่อไป
import {
  getPossibleBishopMoves,
  getPossibleKingMoves,
  getPossibleKnightMoves,
  getPossiblePawnMoves,
  getPossibleQueenMoves,
  getPossibleRookMoves,
  getCastlingMoves,
} from "../referee/rules";

export class Board {
    constructor(pieces, totalTurns) {
        this.pieces = pieces;
        this.totalTurns = totalTurns;
        this.winningTeam = null;
    }

    get currentTeam() {
        return this.totalTurns % 2 === 0 ? 'b' : 'w'; // b = black(opponent), w = white(our)
    }

    calculateAllMoves() {
        for (const piece of this.pieces) {
            piece.possibleMoves = this.getValidMoves(piece, this.pieces);
        }

        for (const king of this.pieces.filter((p) => p.isKing)) {
            if (king.possibleMoves === undefined) continue;
            king.possibleMoves = [
                ...king.possibleMoves,
                ...getCastlingMoves(king, this.pieces),
            ];
        }

        this.checkCurrentTeamMoves();

        for (const piece of this.pieces.filter((p) => p.team !== this.currentTeam)) {
            piece.possibleMoves = [];
        }

        if (this.pieces.filter((p) => p.team === this.currentTeam).some((p) => p.possibleMoves !== undefined && p.possibleMoves.length > 0)) {
            return;
        }

        this.winningTeam = this.currentTeam === 'w' ? 'b' : 'w';
    }

    checkCurrentTeamMoves() {
        for (const piece of this.pieces.filter((p) => p.team === this.currentTeam)) {
            if (piece.possibleMoves === undefined) continue;

            for (const move of piece.possibleMoves) {
                const simulatedBoard = this.clone();

                simulatedBoard.pieces = simulatedBoard.pieces.filter((p) => !p.samePosition(move));

                const clonedPiece = simulatedBoard.pieces.find((p) => p.samePiecePosition(piece));
                if (clonedPiece) clonedPiece.position = move.clone();

                const clonedKing = simulatedBoard.pieces.find((p) => p.isKing && p.team === simulatedBoard.currentTeam);

                if (!clonedKing) continue; // Safety check

                for (const enemy of simulatedBoard.pieces.filter((p) => p.team !== simulatedBoard.currentTeam)) {
                    enemy.possibleMoves = simulatedBoard.getValidMoves(enemy, simulatedBoard.pieces);

                    if (enemy.isPawn) {
                        if (enemy.possibleMoves.some((m) => m.x !== enemy.position.x && m.samePosition(clonedKing.position))) {
                            piece.possibleMoves = piece.possibleMoves.filter((m) => !m.samePosition(move));
                        }
                    } else {
                        if (enemy.possibleMoves.some((m) => m.samePosition(clonedKing.position))) {
                            piece.possibleMoves = piece.possibleMoves.filter((m) => !m.samePosition(move));
                        }
                    }
                }
            }
        }
    }

    getValidMoves(piece, boardState) {
        switch (piece.type) {
            case 'pawn': return getPossiblePawnMoves(piece, boardState);
            case 'knight': return getPossibleKnightMoves(piece, boardState);
            case 'bishop': return getPossibleBishopMoves(piece, boardState);
            case 'rook': return getPossibleRookMoves(piece, boardState);
            case 'queen': return getPossibleQueenMoves(piece, boardState);
            case 'king': return getPossibleKingMoves(piece, boardState);
            default: return [];
        }
    }

    playMove(enPassantMove, validMove, playedPiece, destination) {
        const pawnDirection = playedPiece.team === 'w' ? 1 : -1;
        const destinationPiece = this.pieces.find((p) => p.samePosition(destination));

        if (playedPiece.isKing && destinationPiece?.isRook && destinationPiece.team === playedPiece.team) {
            const direction = destinationPiece.position.x - playedPiece.position.x > 0 ? 1 : -1;
            const newKingXPosition = playedPiece.position.x + direction * 2;
            
            this.pieces = this.pieces.map((p) => {
                if (p.samePiecePosition(playedPiece)) {
                    p.position.x = newKingXPosition;
                } else if (p.samePiecePosition(destinationPiece)) {
                    p.position.x = newKingXPosition - direction;
                }
                return p;
            });

            this.calculateAllMoves();
            return true;
        }

        if (enPassantMove) {
            this.pieces = this.pieces.reduce((results, piece) => {
                if (piece.samePiecePosition(playedPiece)) {
                    if (piece.isPawn) piece.enPassant = false;
                    piece.position.x = destination.x;
                    piece.position.y = destination.y;
                    piece.hasMoved = true;
                    results.push(piece);
                } else if (!piece.samePosition(new Position(destination.x, destination.y - pawnDirection))) {
                    if (piece.isPawn) piece.enPassant = false;
                    results.push(piece);
                }
                return results;
            }, []);

            this.calculateAllMoves();
        } else if (validMove) {
            this.pieces = this.pieces.reduce((results, piece) => {
                if (piece.samePiecePosition(playedPiece)) {
                    if (piece.isPawn) {
                        piece.enPassant = Math.abs(playedPiece.position.y - destination.y) === 2 && piece.type === 'pawn';
                    }
                    piece.position.x = destination.x;
                    piece.position.y = destination.y;
                    piece.hasMoved = true;
                    results.push(piece);
                } else if (!piece.samePosition(destination)) {
                    if (piece.isPawn) piece.enPassant = false;
                    results.push(piece);
                }
                return results;
            }, []);

            this.calculateAllMoves();
        } else {
            return false;
        }

        return true;
    }

    clone() {
        return new Board(
            this.pieces.map((p) => p.clone()),
            this.totalTurns
        );
    }
}