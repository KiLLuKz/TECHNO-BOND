import { Position } from "../../models/Position";
import { tileIsEmptyOrOccupiedByOpponent, tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

export const queenMove = (initialPosition, desiredPosition, team, boardState) => {
    for(let i = 1; i < 8; i++) {
      //Diagonal logic
      let multiplierX = (desiredPosition.x < initialPosition.x) ? -1 : (desiredPosition.x > initialPosition.x) ? 1 : 0;
      let multiplierY = (desiredPosition.y < initialPosition.y) ? -1 : (desiredPosition.y > initialPosition.y) ? 1 : 0;

      let passedPosition = new Position(initialPosition.x + (i * multiplierX), initialPosition.y + (i * multiplierY));

      if(passedPosition.samePosition(desiredPosition)) {
        if(tileIsEmptyOrOccupiedByOpponent(passedPosition, boardState, team)) {
          return true;
        }
      } else {
        if(tileIsOccupied(passedPosition, boardState)) {
          break;
        }
      }
    }
    return false;
}

export const getPossibleQueenMoves = (queen, boardstate) => {
    const possibleMoves = [];
    const directions = [
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, // Rook-like
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 }, { dx: -1, dy: 1 }  // Bishop-like
    ];

    directions.forEach(({ dx, dy }) => {
        for(let i = 1; i < 8; i++) {
            const destX = queen.position.x + (i * dx);
            const destY = queen.position.y + (i * dy);
            
            if(destX < 0 || destX > 7 || destY < 0 || destY > 7) break;
            
            const destination = new Position(destX, destY);

            if(!tileIsOccupied(destination, boardstate)) {
                possibleMoves.push(destination);
            } else if(tileIsOccupiedByOpponent(destination, boardstate, queen.team)) {
                possibleMoves.push(destination);
                break;
            } else {
                break;
            }
        }
    });

    return possibleMoves;
}