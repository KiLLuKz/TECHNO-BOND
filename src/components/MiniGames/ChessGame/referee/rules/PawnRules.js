import { TeamType } from "../../Types";
import { Position } from "../../models/Position";
import { tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

export const pawnMove = (initialPosition, desiredPosition, team, boardState) => {
  const specialRow = team === TeamType.OUR ? 1 : 6;
  const pawnDirection = team === TeamType.OUR ? 1 : -1;

  // MOVEMENT LOGIC
  if (
    initialPosition.x === desiredPosition.x &&
    initialPosition.y === specialRow &&
    desiredPosition.y - initialPosition.y === 2 * pawnDirection
  ) {
    if (
      !tileIsOccupied(desiredPosition, boardState) &&
      !tileIsOccupied(
        new Position(desiredPosition.x, desiredPosition.y - pawnDirection),
        boardState
      )
    ) {
      return true;
    }
  } else if (
    initialPosition.x === desiredPosition.x &&
    desiredPosition.y - initialPosition.y === pawnDirection
  ) {
    if (!tileIsOccupied(desiredPosition, boardState)) {
      return true;
    }
  }
  
  // ATTACK LOGIC
  else if (
    desiredPosition.x - initialPosition.x === -1 &&
    desiredPosition.y - initialPosition.y === pawnDirection
  ) {
    // ATTACK IN UPPER OR BOTTOM LEFT CORNER
    if (tileIsOccupiedByOpponent(desiredPosition, boardState, team)) {
      return true;
    }
  } else if (
    desiredPosition.x - initialPosition.x === 1 &&
    desiredPosition.y - initialPosition.y === pawnDirection
  ) {
    // ATTACK IN THE UPPER OR BOTTOM RIGHT CORNER
    if (tileIsOccupiedByOpponent(desiredPosition, boardState, team)) {
      return true;
    }
  }

  return false;
}

export const getPossiblePawnMoves = (pawn, boardState) => {
  const possibleMoves = [];

  const specialRow = pawn.team === TeamType.OUR ? 1 : 6;
  const pawnDirection = pawn.team === TeamType.OUR ? 1 : -1;

  const normalMove = new Position(pawn.position.x, pawn.position.y + pawnDirection);
  const specialMove = new Position(normalMove.x, normalMove.y + pawnDirection);
  const upperLeftAttack = new Position(pawn.position.x - 1, pawn.position.y + pawnDirection);
  const upperRightAttack = new Position(pawn.position.x + 1, pawn.position.y + pawnDirection);
  const leftPosition = new Position(pawn.position.x - 1, pawn.position.y);
  const rightPosition = new Position(pawn.position.x + 1, pawn.position.y);

  // เดินปกติ 1 ช่อง
  if (!tileIsOccupied(normalMove, boardState)) {
    possibleMoves.push(normalMove);

    // ก้าวแรกเดินได้ 2 ช่อง
    if (pawn.position.y === specialRow && !tileIsOccupied(specialMove, boardState)) {
      possibleMoves.push(specialMove);
    }
  }

  // กินเฉียงซ้าย
  if (tileIsOccupiedByOpponent(upperLeftAttack, boardState, pawn.team)) {
    possibleMoves.push(upperLeftAttack);
  } else if (!tileIsOccupied(upperLeftAttack, boardState)) {
    const leftPiece = boardState.find(p => p.samePosition(leftPosition));
    // ใน JS เราไม่ต้องใช้ "as Pawn" แค่เช็ค property ตรงๆ ได้เลย
    if (leftPiece && leftPiece.enPassant) {
      possibleMoves.push(upperLeftAttack);
    }
  }

  // กินเฉียงขวา
  if (tileIsOccupiedByOpponent(upperRightAttack, boardState, pawn.team)) {
    possibleMoves.push(upperRightAttack);
  } else if (!tileIsOccupied(upperRightAttack, boardState)) {
    const rightPiece = boardState.find(p => p.samePosition(rightPosition));
    if (rightPiece && rightPiece.enPassant) {
      possibleMoves.push(upperRightAttack);
    }
  }

  return possibleMoves;
}