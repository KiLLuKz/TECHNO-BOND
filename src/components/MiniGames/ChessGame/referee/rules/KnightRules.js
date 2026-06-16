import { Position } from "../../models/Position";
import { tileIsEmptyOrOccupiedByOpponent } from "./GeneralRules";

export const knightMove = (initialPosition, desiredPosition, team, boardState) => {
  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      // ตรวจสอบการเดินรูปตัว L (แนวตั้ง 2 ช่อง แนวนอน 1 ช่อง หรือกลับกัน)
      if (desiredPosition.y - initialPosition.y === 2 * i) {
        if (desiredPosition.x - initialPosition.x === j) {
          if (tileIsEmptyOrOccupiedByOpponent(desiredPosition, boardState, team)) {
            return true;
          }
        }
      }

      if (desiredPosition.x - initialPosition.x === 2 * i) {
        if (desiredPosition.y - initialPosition.y === j) {
          if (tileIsEmptyOrOccupiedByOpponent(desiredPosition, boardState, team)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export const getPossibleKnightMoves = (knight, boardstate) => {
  const possibleMoves = [];

  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      const verticalMove = new Position(knight.position.x + j, knight.position.y + i * 2);
      const horizontalMove = new Position(knight.position.x + i * 2, knight.position.y + j);

      // เช็คขอบกระดานและเงื่อนไขการเดิน
      if(verticalMove.x >= 0 && verticalMove.x <= 7 && verticalMove.y >= 0 && verticalMove.y <= 7) {
          if(tileIsEmptyOrOccupiedByOpponent(verticalMove, boardstate, knight.team)) {
            possibleMoves.push(verticalMove);
          }
      }

      if(horizontalMove.x >= 0 && horizontalMove.x <= 7 && horizontalMove.y >= 0 && horizontalMove.y <= 7) {
          if(tileIsEmptyOrOccupiedByOpponent(horizontalMove, boardstate, knight.team)) {
            possibleMoves.push(horizontalMove);
          }
      }
    }
  }

  return possibleMoves;
}