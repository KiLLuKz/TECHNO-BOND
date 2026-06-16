import { Board } from "./models/Board";
import { Pawn } from "./models/Pawn";
import { Piece } from "./models/Piece";
import { Position } from "./models/Position";

export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const GRID_SIZE = 100; // ขนาดช่องหมากรุก (เดี๋ยวเราค่อยไปปรับให้ responsive ด้วย Tailwind อีกทีครับ)

// b = black (opponent), w = white (our)
export const initialBoard = new Board([
  new Piece(new Position(0, 7), 'rook', 'b', false),
  new Piece(new Position(1, 7), 'knight', 'b', false),
  new Piece(new Position(2, 7), 'bishop', 'b', false),
  new Piece(new Position(3, 7), 'queen', 'b', false),
  new Piece(new Position(4, 7), 'king', 'b', false),
  new Piece(new Position(5, 7), 'bishop', 'b', false),
  new Piece(new Position(6, 7), 'knight', 'b', false),
  new Piece(new Position(7, 7), 'rook', 'b', false),
  new Pawn(new Position(0, 6), 'b', false),
  new Pawn(new Position(1, 6), 'b', false),
  new Pawn(new Position(2, 6), 'b', false),
  new Pawn(new Position(3, 6), 'b', false),
  new Pawn(new Position(4, 6), 'b', false),
  new Pawn(new Position(5, 6), 'b', false),
  new Pawn(new Position(6, 6), 'b', false),
  new Pawn(new Position(7, 6), 'b', false),

  new Piece(new Position(0, 0), 'rook', 'w', false),
  new Piece(new Position(1, 0), 'knight', 'w', false),
  new Piece(new Position(2, 0), 'bishop', 'w', false),
  new Piece(new Position(3, 0), 'queen', 'w', false),
  new Piece(new Position(4, 0), 'king', 'w', false),
  new Piece(new Position(5, 0), 'bishop', 'w', false),
  new Piece(new Position(6, 0), 'knight', 'w', false),
  new Piece(new Position(7, 0), 'rook', 'w', false),
  new Pawn(new Position(0, 1), 'w', false),
  new Pawn(new Position(1, 1), 'w', false),
  new Pawn(new Position(2, 1), 'w', false),
  new Pawn(new Position(3, 1), 'w', false),
  new Pawn(new Position(4, 1), 'w', false),
  new Pawn(new Position(5, 1), 'w', false),
  new Pawn(new Position(6, 1), 'w', false),
  new Pawn(new Position(7, 1), 'w', false),
], 1);

initialBoard.calculateAllMoves();