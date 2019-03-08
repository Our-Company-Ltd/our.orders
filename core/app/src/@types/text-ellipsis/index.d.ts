declare module 'text-ellipsis' {
    type ellipsisOptions = { side: 'start' | 'end', ellipsis: string }
    const ellipsis: (input: string, length: number, options?: Partial<ellipsisOptions>) => string;
    export default ellipsis;
}