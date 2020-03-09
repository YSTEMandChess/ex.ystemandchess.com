import { ChatOpts } from './interfaces';
import { PresetCtrl } from './preset';
export { Ctrl as ChatCtrl, ChatPlugin } from './interfaces';
export default function LichessChat(element: Element, opts: ChatOpts): {
    preset: PresetCtrl;
};
