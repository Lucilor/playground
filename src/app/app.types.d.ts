declare module "colorthief" {
    type Color = [number, number, number];
    const ColorThief: new () => {
        getColor: (image: HTMLImageElement, quality?: number) => Color;
        getPalette: (image: HTMLImageElement, colorCount?: number, quality?: number) => [Color];
    };
    export default ColorThief;
}
