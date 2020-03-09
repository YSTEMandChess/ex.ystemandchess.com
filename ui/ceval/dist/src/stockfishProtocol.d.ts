import { WorkerOpts, Work } from './types';
export default class Protocol {
    private send;
    private opts;
    private work;
    private curEval;
    private expectedPvs;
    private stopped;
    engineName: string | undefined;
    constructor(send: (cmd: string) => void, opts: WorkerOpts);
    private setOption;
    received(text: string): void;
    start(w: Work): void;
    stop(): Promise<void>;
    isComputing(): boolean;
}
