import { Chess } from 'chess.js'
import type { BoardOrientation } from '@/types/chess'

export function isValidFen(fen: string): boolean {
  try {
    new Chess(fen)
    return true
  } catch {
    return false
  }
}

export function getSideToMoveFromFen(fen: string): 'w' | 'b' {
  const side = fen.split(' ')[1]
  return side === 'b' ? 'b' : 'w'
}

export function fenToOrientation(sideToMove: 'w' | 'b'): BoardOrientation {
  return sideToMove === 'w' ? 'white' : 'black'
}
