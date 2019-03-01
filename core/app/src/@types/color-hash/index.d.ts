declare module 'color-hash' {
    class ColorHash {
        hsl: (input: string) => number[];
        rgb: (input: string) => number[];
        hex: (input: string) => string;
    }


    export default ColorHash;
}