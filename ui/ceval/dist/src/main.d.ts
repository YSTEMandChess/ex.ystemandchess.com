/// <reference types="lichess" />
import ctrl from './ctrl';
import * as view from './view';
import * as winningChances from './winningChances';
export { CevalCtrl, NodeEvals, Eval, Work, CevalOpts } from './types';
export { ctrl, view, winningChances };
export declare function isEvalBetter(a: Tree.ClientEval, b?: Tree.ClientEval): boolean;
