import { Sync } from 'common/sync';
import { PoolOpts, WorkerOpts, Work } from './types';
import Protocol from './stockfishProtocol';
export declare abstract class AbstractWorker {
    protected url: string;
    protected poolOpts: PoolOpts;
    protected workerOpts: WorkerOpts;
    protected protocol: Sync<Protocol>;
    constructor(url: string, poolOpts: PoolOpts, workerOpts: WorkerOpts);
    stop(): Promise<void>;
    start(work: Work): Promise<void>;
    isComputing: () => boolean;
    engineName: () => string | undefined;
    abstract boot(): Promise<Protocol>;
    abstract send(cmd: string): void;
    abstract destroy(): void;
}
export declare class Pool {
    private poolOpts;
    private protocolOpts;
    private workers;
    private token;
    constructor(poolOpts: PoolOpts, protocolOpts: WorkerOpts);
    getWorker(): Promise<AbstractWorker>;
    warmup: () => void;
    stop: () => void;
    destroy: () => void;
    start: (work: Work) => void;
    isComputing: () => boolean;
    engineName: () => string | undefined;
}
