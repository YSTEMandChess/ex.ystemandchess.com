import { SquareSet } from './squareSet';
import { Board } from './board';
import { Setup } from './setup';
export declare function flipVertical(s: SquareSet): SquareSet;
export declare function flipHorizontal(s: SquareSet): SquareSet;
export declare function flipDiagonal(s: SquareSet): SquareSet;
export declare function rotate180(s: SquareSet): SquareSet;
export declare function transformBoard(board: Board, f: (s: SquareSet) => SquareSet): Board;
export declare function transformSetup(setup: Setup, f: (s: SquareSet) => SquareSet): Setup;
