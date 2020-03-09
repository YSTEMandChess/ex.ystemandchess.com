import { State } from './state';
import * as cg from './types';
export declare type Mutation<A> = (state: State) => A;
export declare type AnimVector = cg.NumberQuad;
export interface AnimVectors {
    [key: string]: AnimVector;
}
export interface AnimFadings {
    [key: string]: cg.Piece;
}
export interface AnimPlan {
    anims: AnimVectors;
    fadings: AnimFadings;
}
export interface AnimCurrent {
    start: cg.Timestamp;
    frequency: cg.KHz;
    plan: AnimPlan;
}
export declare function anim<A>(mutation: Mutation<A>, state: State): A;
export declare function render<A>(mutation: Mutation<A>, state: State): A;
