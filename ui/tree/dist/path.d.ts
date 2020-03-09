/// <reference types="lichess" />
export declare const root: Tree.Path;
export declare function size(path: Tree.Path): number;
export declare function head(path: Tree.Path): Tree.Path;
export declare function tail(path: Tree.Path): string;
export declare function init(path: Tree.Path): Tree.Path;
export declare function last(path: Tree.Path): string;
export declare function contains(p1: Tree.Path, p2: Tree.Path): boolean;
export declare function fromNodeList(nodes: Tree.Node[]): Tree.Path;
export declare function isChildOf(child: Tree.Path, parent: Tree.Path): boolean;
