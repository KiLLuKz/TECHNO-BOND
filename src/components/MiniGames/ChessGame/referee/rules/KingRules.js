import { Position } from "../../models/Position";
import { tileIsEmptyOrOccupiedByOpponent, tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

export const kingMove = (initialPosition, desiredPosition, team, boardState) => {
  for (let i = 1; i < 2; i++) {
    //Diagonal
    let multiplierX = (desiredPosition.x < initialPosition.x) ? -1 : (desiredPosition.x > initialPosition.x) ? 1 : 0;
    let multiplierY = (desiredPosition.y < initialPosition.y) ? -1 : (desiredPosition.y > initialPosition.y) ? 1 : 0;

    let passedPosition = new Position(initialPosition.x + (i * multiplierX), initialPosition.y + (i * multiplierY));

    if (passedPosition.samePosition(desiredPosition)) {
      if (tileIsEmptyOrOccupiedByOpponent(passedPosition, boardState, team)) {
        return true;
      }
    } else {
      if (tileIsOccupied(passedPosition, boardState)) {
        break;
      }
    }
  }
  return false;
}

export const getPossibleKingMoves = (king, boardstate) => {
  const possibleMoves = [];

  // Directions: [dx, dy]
  const directions = [
    [0, 1], [0, -1], [-1, 0], [1, 0], // Straight
    [1, 1], [1, -1], [-1, -1], [-1, 1] // Diagonal
  ];

  for (const [dx, dy] of directions) {
    const destination = new Position(king.position.x + dx, king.position.y + dy);

    // เช็คขอบกระดาน
    if (destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) {
      continue;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOpponent(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
    }
  }

  return possibleMoves;
}

// ในส่วนนี้เช็คว่า King เข้าป้อมได้ไหม
export const getCastlingMoves = (king, boardstate) => {
  const possibleMoves = [];

  if (king.hasMoved) return possibleMoves;

  const rooks = boardstate.filter(p => p.isRook && p.team === king.team && !p.hasMoved);

  for (const rook of rooks) {
    const direction = (rook.position.x - king.position.x > 0) ? 1 : -1;

    const adjacentPosition = king.position.clone();
    adjacentPosition.x += direction;

    // เช็คว่า Rook มีตาเดินที่ไปถึงช่องข้างๆ King หรือไม่
    if(!rook.possibleMoves || !rook.possibleMoves.some(m => m.samePosition(adjacentPosition))) continue;

    const conceringTiles = rook.possibleMoves.filter(m => m.y === king.position.y);
    const enemyPieces = boardstate.filter(p => p.team !== king.team);

    let valid = true;

    for(const enemy of enemyPieces) {
      if(!enemy.possibleMoves) continue;

      for(const move of enemy.possibleMoves) {
        if(conceringTiles.some(t => t.samePosition(move))) {
          valid = false;
        }
        if(!valid) break;
      }
      if(!valid) break;
    }

    if(!valid) continue;

    possibleMoves.push(rook.position.clone());
  }

  return possibleMoves;
}