/// <reference types="lichess" />
import piotr from './piotr';
export declare const initialFen: Fen;
export declare function fixCrazySan(san: San): San;
export declare function decomposeUci(uci: Uci): [Key, Key, string];
export declare function renderEval(e: number): string;
export interface Dests {
    [square: string]: Key[];
}
export declare function readDests(lines?: string): Dests | null;
export declare function readDrops(line?: string | null): string[] | null;
export declare const roleToSan: {
    pawn: string;
    knight: string;
    bishop: string;
    rook: string;
    queen: string;
    king: string;
};
export declare const sanToRole: {
    P: string;
    N: string;
    B: string;
    R: string;
    Q: string;
    K: string;
};
export { piotr };
export declare function variantToRules(variant: VariantKey): 'chess' | 'antichess' | 'kingofthehill' | '3check' | 'atomic' | 'horde' | 'racingkings' | 'crazyhouse';
