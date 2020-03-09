/// <reference types="lichess" />
import { Eval } from './types';
export declare function povChances(color: Color, ev: Eval): number;
export declare function povDiff(color: Color, e1: Eval, e2: Eval): number;
