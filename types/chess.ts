export type BoardOrientation = 'white' | 'black'

type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'
type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
export type Square = `${File}${Rank}`

export type PromotionPiece = 'q' | 'r' | 'b' | 'n'
export type UciMove =
  | `${Square}${Square}`
  | `${Square}${Square}${PromotionPiece}`

export type BoardMove = {
  from: string
  to: string
  uci: string
  san?: string
  fenBefore: string
  fenAfter: string
  legal: boolean
  promotion?: string
}
