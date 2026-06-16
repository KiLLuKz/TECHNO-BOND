import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// อัปเดต Path ให้ถอยหลัง 1 ชั้นเพื่อเจอ Constants และ models
import { initialBoard } from "../Constants";
import { Piece } from "../models/Piece";
import { Position } from "../models/Position";
import { Pawn } from "../models/Pawn";

// อัปเดต Path ของ rules ให้ถอยออกมาแล้วเข้าไปใหม่
import {
  bishopMove, getPossibleBishopMoves, getPossibleKingMoves, getPossibleKnightMoves, getPossiblePawnMoves, getPossibleQueenMoves, getPossibleRookMoves, kingMove, knightMove, pawnMove, queenMove, rookMove,
} from "../referee/rules";

import { PieceType, TeamType } from "../Types";
import Chessboard from "../Chessboard";

// โหลดเสียงด้วย HTML5 Audio (ไม่ต้องลงแพ็กเกจเพิ่ม)
const moveSound = new Audio("/sounds/move-self.mp3");
const captureSound = new Audio("/sounds/capture.mp3");
const checkmateSound = new Audio("/sounds/move-check.mp3");

export default function Referee() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(initialBoard.clone());
  const [promotionPawn, setPromotionPawn] = useState(undefined);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showCheckmateModal, setShowCheckmateModal] = useState(false);

  function playMove(playedPiece, destination) {
    if (playedPiece.possibleMoves === undefined) return false;

    // ล็อกไม่ให้เดินสลับตา
    if (playedPiece.team === TeamType.OUR && board.totalTurns % 2 !== 1) return false;
    if (playedPiece.team === TeamType.OPPONENT && board.totalTurns % 2 !== 0) return false;

    let playedMoveIsValid = false;
    const validMove = playedPiece.possibleMoves.some((m) => m.samePosition(destination));

    if (!validMove) return false;

    const enPassantMove = isEnPassantMove(playedPiece.position, destination, playedPiece.type, playedPiece.team);

    setBoard((prevBoard) => {
      const clonedBoard = prevBoard.clone();
      clonedBoard.totalTurns += 1;
      
      playedMoveIsValid = clonedBoard.playMove(enPassantMove, validMove, playedPiece, destination);

      if (playedMoveIsValid) {
        // เช็คว่ามีตัวโดนกินไหม เพื่อเล่นเสียง
        const isCapture = prevBoard.pieces.find(p => p.samePosition(destination));
        if (isCapture) captureSound.play();
        else moveSound.play();
      }

      if (clonedBoard.winningTeam !== undefined && clonedBoard.winningTeam !== null) {
        setShowCheckmateModal(true);
        checkmateSound.play();
      }

      return clonedBoard;
    });

    let promotionRow = playedPiece.team === TeamType.OUR ? 7 : 0;
    if (destination.y === promotionRow && playedPiece.isPawn) {
      setShowPromotionModal(true);
      setPromotionPawn(() => {
        const clonedPlayedPiece = playedPiece.clone();
        clonedPlayedPiece.position = destination.clone();
        return clonedPlayedPiece;
      });
    }

    return playedMoveIsValid;
  }

  function isEnPassantMove(initialPosition, desiredPosition, type, team) {
    const pawnDirection = team === TeamType.OUR ? 1 : -1;
    if (type === PieceType.PAWN) {
      if ((desiredPosition.x - initialPosition.x === -1 || desiredPosition.x - initialPosition.x === 1) && desiredPosition.y - initialPosition.y === pawnDirection) {
        const piece = board.pieces.find(
          (p) => p.position.x === desiredPosition.x && p.position.y === desiredPosition.y - pawnDirection && p.isPawn && p.enPassant
        );
        if (piece) return true;
      }
    }
    return false;
  }

  function promotePawn(pieceType) {
    if (promotionPawn === undefined) return;

    setBoard((previousBoard) => {
      const clonedBoard = previousBoard.clone();
      clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(promotionPawn)) {
          results.push(new Piece(piece.position.clone(), pieceType, piece.team, true));
        } else {
          results.push(piece);
        }
        return results;
      }, []);
      clonedBoard.calculateAllMoves();
      return clonedBoard;
    });

    setShowPromotionModal(false);
  }

  function promotionTeamType() {
    return promotionPawn?.team === TeamType.OUR ? "w" : "b";
  }

  function restartGame() {
    setShowCheckmateModal(false);
    setBoard(initialBoard.clone());
  }

  return (
    <div className="min-h-screen bg-[#08050f] text-white font-['Orbitron'] flex flex-col items-center pt-8 px-4 relative overflow-hidden isolate">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#779556]/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      {/* Header Controls */}
      <div className="w-full max-w-[800px] flex items-center justify-between mb-6 z-10">
        <button onClick={() => navigate('/dashboard/minigames')} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#ebecd0] to-[#779556] drop-shadow-lg">
            CLASSIC CHESS
          </h1>
          <div className="flex items-center gap-3 mt-2 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <span className={`w-3 h-3 rounded-full ${board.totalTurns % 2 !== 0 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-black shadow-[0_0_10px_black] border border-gray-600'} transition-colors`}></span>
            <span className="text-sm tracking-widest font-bold">TURN {board.totalTurns}</span>
          </div>
        </div>

        <button onClick={restartGame} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all backdrop-blur-md">
          <RotateCcw size={24} />
        </button>
      </div>

      {/* The Board */}
      <div className="relative z-10 flex justify-center items-center">
        <Chessboard playMove={playMove} pieces={board.pieces} />
      </div>

      {/* Modal: เลือกยศหมาก (Pawn Promotion) */}
      {showPromotionModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate__animated animate__fadeIn">
          <div className="bg-[#110b1c] border border-white/10 p-8 rounded-3xl text-center shadow-2xl flex gap-6">
            <img onClick={() => promotePawn(PieceType.ROOK)} src={`/assets/images/rook_${promotionTeamType()}.png`} className="w-24 h-24 hover:bg-white/20 p-2 rounded-xl cursor-pointer transition-all" alt="Rook" />
            <img onClick={() => promotePawn(PieceType.BISHOP)} src={`/assets/images/bishop_${promotionTeamType()}.png`} className="w-24 h-24 hover:bg-white/20 p-2 rounded-xl cursor-pointer transition-all" alt="Bishop" />
            <img onClick={() => promotePawn(PieceType.KNIGHT)} src={`/assets/images/knight_${promotionTeamType()}.png`} className="w-24 h-24 hover:bg-white/20 p-2 rounded-xl cursor-pointer transition-all" alt="Knight" />
            <img onClick={() => promotePawn(PieceType.QUEEN)} src={`/assets/images/queen_${promotionTeamType()}.png`} className="w-24 h-24 hover:bg-white/20 p-2 rounded-xl cursor-pointer transition-all" alt="Queen" />
          </div>
        </div>
      )}

      {/* Modal: สรุปผลแพ้ชนะ (Checkmate) */}
      {showCheckmateModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate__animated animate__fadeIn">
          <div className="bg-[#110b1c] border border-[#779556]/50 p-10 rounded-3xl text-center shadow-2xl">
            <Trophy size={64} className="mx-auto mb-4 text-[#779556]" />
            <h2 className="text-3xl font-bold text-white mb-2 font-['Orbitron'] tracking-widest">CHECKMATE!</h2>
            <p className="text-xl text-gray-400 mb-8 font-['Rajdhani'] uppercase">
              {board.winningTeam === TeamType.OUR ? "White" : "Black"} Wins
            </p>
            <button onClick={restartGame} className="w-full bg-[#779556] text-white py-4 px-10 rounded-xl font-bold tracking-widest hover:bg-[#5e7743] transition-all">
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}