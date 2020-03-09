import { VNode } from 'snabbdom/vnode';
import { ModerationCtrl, ModerationOpts } from './interfaces';
export declare function moderationCtrl(opts: ModerationOpts): ModerationCtrl;
export declare function lineAction(username: string): VNode;
export declare function moderationView(ctrl?: ModerationCtrl): VNode[] | undefined;
