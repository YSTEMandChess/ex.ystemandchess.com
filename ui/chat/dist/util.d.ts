import { VNode } from 'snabbdom/vnode';
export declare function userLink(u: string, title?: string): VNode;
export declare function spinner(): VNode;
export declare function bind(eventName: string, f: (e: Event) => void): {
    insert: (vnode: VNode) => void;
};
