const round = Math.round;

export const hsvToRgb = (h: number, s: number, v: number) => {
    var s = s / 100, v = v / 100;
    var c = v * s;
    var hh = h / 60;
    var x = c * (1 - Math.abs(hh % 2 - 1));
    var m = v - c;

    var p = parseInt(hh.toString(), 10);
    var rgb = (
        p === 0 ? [c, x, 0] :
            p === 1 ? [x, c, 0] :
                p === 2 ? [0, c, x] :
                    p === 3 ? [0, x, c] :
                        p === 4 ? [x, 0, c] :
                            p === 5 ? [c, 0, x] :
                                []
    );

    return [
        round(255 * (rgb[0] + m)),
        round(255 * (rgb[1] + m)),
        round(255 * (rgb[2] + m))
    ];
};