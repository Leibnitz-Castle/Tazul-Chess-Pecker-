import { Chess } from "chess.js";
import type {
  PgnHeaders,
  ParsedMove,
  ParsedPgnGame,
  ParseError,
} from "./opening-types";

const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// ── Header parsing ───────────────────────────────────────────────────────────

export function parsePgnHeaders(gameText: string): PgnHeaders {
  const headers: PgnHeaders = {};
  const headerRe = /\[(\w+)\s+"([^"]*)"\]/g;
  let m: RegExpExecArray | null;
  while ((m = headerRe.exec(gameText)) !== null) {
    headers[m[1]] = m[2];
  }
  return headers;
}

// ── Split multi-game PGN into individual game strings ────────────────────────

export function splitPgnGames(pgn: string): string[] {
  // Strip BOM and normalize line endings
  const normalized = pgn
    .replace(/^﻿/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const games: string[] = [];
  const lines = normalized.split("\n");
  let current: string[] = [];
  let inHeaders = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // A real PGN tag starts with [Letter... — ChessBase annotations start with [%
    const isRealHeader =
      trimmed.startsWith("[") && !trimmed.startsWith("[%");
    if (isRealHeader) {
      if (current.length > 0 && !inHeaders) {
        games.push(current.join("\n").trim());
        current = [];
      }
      inHeaders = true;
      current.push(line);
    } else {
      if (trimmed.length > 0) inHeaders = false;
      current.push(line);
    }
  }
  if (current.length > 0) {
    const g = current.join("\n").trim();
    if (g) games.push(g);
  }
  return games.filter((g) => g.includes("["));
}

// ── Strip annotations from move text ─────────────────────────────────────────

export function stripAnnotations(text: string): string {
  // Remove { } comments (including %cal %csl annotations)
  let result = text.replace(/\{[^}]*\}/g, " ");
  // Remove NAGs ($17, $2 etc.)
  result = result.replace(/\$\d+/g, " ");
  // Remove result markers
  result = result.replace(/(?:1-0|0-1|1\/2-1\/2|\*)\s*$/, "");
  // Normalize whitespace
  result = result.replace(/\s+/g, " ").trim();
  return result;
}

// ── Tokenizer ─────────────────────────────────────────────────────────────────

type Token =
  | { type: "move"; san: string }
  | { type: "open_variation" }
  | { type: "close_variation" }
  | { type: "move_number" };

export function tokenizeMoveText(text: string): Token[] {
  const clean = stripAnnotations(text);
  const tokens: Token[] = [];
  // Split on whitespace, keeping ( and ) as separate items
  const parts = clean
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .split(/\s+/)
    .filter((p) => p.length > 0);

  for (const part of parts) {
    if (part === "(") {
      tokens.push({ type: "open_variation" });
    } else if (part === ")") {
      tokens.push({ type: "close_variation" });
    } else if (/^\d+\.+$/.test(part)) {
      tokens.push({ type: "move_number" });
    } else if (part.length >= 2 && /^[a-zA-Z]/.test(part)) {
      // Looks like a SAN move
      tokens.push({ type: "move", san: part });
    }
    // Else skip (numbers without dots, etc.)
  }
  return tokens;
}

// ── Parse one line of moves (with nested variations) ─────────────────────────

interface MoveTreeNode {
  san: string;
  children: MoveTreeNode[];
}

function buildMoveTreeFromTokens(
  tokens: Token[],
  idx: number,
  depth: number
): { nodes: MoveTreeNode[]; nextIdx: number } {
  const nodes: MoveTreeNode[] = [];
  let i = idx;

  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok.type === "close_variation") {
      return { nodes, nextIdx: i + 1 };
    }
    if (tok.type === "open_variation") {
      // Parse the variation and attach it as alternative children of the last node
      const { nodes: varNodes, nextIdx } = buildMoveTreeFromTokens(
        tokens,
        i + 1,
        depth + 1
      );
      i = nextIdx;
      // Attach the first variation node as sibling of the last main-line move
      // We'll handle this in the flatten step
      if (nodes.length > 0 && varNodes.length > 0) {
        // The variation is alternative to the LAST node's previous context.
        // We'll use a special marker to store siblings:
        // Actually, for simplicity we add variation nodes as extra children
        // at the parent level using a special sentinel node.
        // Instead, we'll flatten into separate line paths at a higher level.
        (nodes as (MoveTreeNode & { _variations?: MoveTreeNode[][] })[])[
          nodes.length - 1
        ]._variations = [
          ...((
            nodes[nodes.length - 1] as MoveTreeNode & {
              _variations?: MoveTreeNode[][];
            }
          )._variations ?? []),
          varNodes,
        ];
      }
      continue;
    }
    if (tok.type === "move_number") {
      i++;
      continue;
    }
    if (tok.type === "move") {
      nodes.push({ san: tok.san, children: [] });
      i++;
      continue;
    }
    i++;
  }
  return { nodes, nextIdx: i };
}

// ── Flatten tree into all possible lines (main + variations) ─────────────────

type AnnotatedNode = MoveTreeNode & { _variations?: AnnotatedNode[][] };

function flattenToLines(nodes: AnnotatedNode[]): string[][] {
  if (nodes.length === 0) return [[]];

  const results: string[][] = [];

  // The main line goes through all nodes sequentially
  const mainSans = nodes.map((n) => n.san);
  results.push(mainSans);

  // For each node that has variations, produce alternative lines:
  // prefix = all nodes BEFORE the variation point (nodes 0..i-1 in original line)
  // then each variation line continues from the variation point
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i] as AnnotatedNode;
    if (node._variations && node._variations.length > 0) {
      const prefix = mainSans.slice(0, i); // moves BEFORE this node (i.e., before current move)
      for (const varNodes of node._variations) {
        const varLines = flattenToLines(varNodes as AnnotatedNode[]);
        for (const varLine of varLines) {
          if (varLine.length > 0) {
            results.push([...prefix, ...varLine]);
          }
        }
      }
    }
  }

  return results;
}

// ── Convert SAN sequence to ParsedMove[] using chess.js ──────────────────────

export function sanSequenceToParsedMoves(
  sanMoves: string[],
  startFen = STARTING_FEN
): ParsedMove[] | null {
  const chess = new Chess(startFen);
  const moves: ParsedMove[] = [];

  for (const san of sanMoves) {
    const fenBefore = chess.fen();
    let result: ReturnType<typeof chess.move> | null = null;
    try {
      result = chess.move(san);
    } catch {
      return null;
    }
    if (!result) return null;

    const uci =
      result.from +
      result.to +
      (result.promotion ? result.promotion : "");

    const fullMoveNumber = Math.floor(moves.length / 2) + 1;
    const ply = moves.length + 1;

    moves.push({
      san: result.san,
      uci,
      fenBefore,
      fenAfter: chess.fen(),
      moveNumber: fullMoveNumber,
      ply,
    });
  }
  return moves;
}

// ── Main parser function ──────────────────────────────────────────────────────

export function parsePgnGame(
  gameText: string,
  side: "white" | "black",
  gameIndex: number
): { game: ParsedPgnGame | null; error: ParseError | null } {
  const headers = parsePgnHeaders(gameText);
  const lineName =
    headers.White && headers.White !== "?" ? headers.White : `Line ${gameIndex + 1}`;
  const eco = headers.ECO ?? null;

  // Extract move text: PGN headers are separated from moves by a blank line
  // Using lastIndexOf("]") is wrong because annotations contain "]" too
  const blankLineIdx = gameText.indexOf("\n\n");
  if (blankLineIdx === -1) {
    return {
      game: null,
      error: { gameIndex, lineName, message: "No move text found" },
    };
  }
  const rawMoveText = gameText.slice(blankLineIdx).trim();

  const tokens = tokenizeMoveText(rawMoveText);
  const { nodes } = buildMoveTreeFromTokens(tokens, 0, 0);

  if (nodes.length === 0) {
    return {
      game: null,
      error: { gameIndex, lineName, message: "No moves parsed" },
    };
  }

  const allSanLines = flattenToLines(nodes as AnnotatedNode[]);

  // First line is the main line
  const mainParsed = sanSequenceToParsedMoves(allSanLines[0]);
  if (!mainParsed) {
    return {
      game: null,
      error: { gameIndex, lineName, message: "Failed to parse main line moves" },
    };
  }

  const allParsedLines: ParsedMove[][] = [mainParsed];

  for (let i = 1; i < allSanLines.length; i++) {
    const parsed = sanSequenceToParsedMoves(allSanLines[i]);
    if (parsed && parsed.length > 0) {
      allParsedLines.push(parsed);
    }
  }

  return {
    game: {
      headers,
      lineName,
      eco,
      side,
      mainLine: mainParsed,
      allLines: allParsedLines,
    },
    error: null,
  };
}

// ── Parse entire PGN file ─────────────────────────────────────────────────────

export function parsePgnFile(
  pgn: string,
  side: "white" | "black"
): { games: ParsedPgnGame[]; errors: ParseError[] } {
  const rawGames = splitPgnGames(pgn);
  const games: ParsedPgnGame[] = [];
  const errors: ParseError[] = [];

  for (let i = 0; i < rawGames.length; i++) {
    const { game, error } = parsePgnGame(rawGames[i], side, i);
    if (game) {
      games.push(game);
    } else if (error) {
      errors.push(error);
    }
  }

  return { games, errors };
}
