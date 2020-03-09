import { Board } from './board';
import { Setup, MaterialSide, Material, RemainingChecks } from './setup';
export declare function fxhash32(word: number, state?: number): number;
export declare function hashBoard(board: Board, state?: number): number;
export declare function hashMaterialSide(side: MaterialSide, state?: number): number;
export declare function hashMaterial(material: Material, state?: number): number;
export declare function hashRemainingChecks(checks: RemainingChecks, state?: number): number;
export declare function hashSetup(setup: Setup, state?: number): number;
