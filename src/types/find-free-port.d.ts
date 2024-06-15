declare module 'find-free-port' {
    type Callback = (err: Error | null, freePort: number) => void;
    function findFreePort(startPort: number, cb: Callback): void;
    export default findFreePort;
}
