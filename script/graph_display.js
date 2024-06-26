//GLOBALS
let CANVAS = null
let CTX = null
let CENTER = [0, 0]
let ZOOM = 1
let ORIENTATION = 'vertical'

//settings
let VERTEX_RADIUS = 8

function change_vertex_size(size) {
    VERTEX_RADIUS = size
    render()
}

function calc_orientation() {
    const [w, h] = [window.innerWidth, window.innerHeight]
    if (w / h >= 6 / 5) {
        ORIENTATION = 'horizontal'
    }
    else {
        ORIENTATION = 'vertical'
    }
}

function init_canvas() {

    calc_orientation()
    CANVAS = document.querySelector('#board')

    // //horizontal
    // if (ORIENTATION == 'horizontal') {
    //     CANVAS.height = CANVAS.offsetHeight
    //     CANVAS.width = window.innerWidth - document.querySelector(".menu-wrapper").offsetWidth
    // }
    // else {
    //     CANVAS.height = window.innerHeight
    // CANVAS.width = CANVAS.offsetWidth
    // }

    CANVAS.height = CANVAS.offsetHeight
    CANVAS.width = CANVAS.offsetWidth

    CTX = CANVAS.getContext('2d')

    CENTER = [
        Math.floor(CANVAS.width / 2),
        Math.floor(CANVAS.height / 2)
    ]

}

//translate screen pos to canvas pos
function translate_virtual_pos(x, y, output_multiplier = 1) {
    return [
        (x * ZOOM + CENTER[0]) * output_multiplier,
        (y * ZOOM + CENTER[1]) * output_multiplier]
}

function translate_screen_pos(x, y) {
    // gap = document.querySelector(".menu-wrapper").offsetWidth / ZOOM
    gap = 0
    return [
        (x - CENTER[0]) / ZOOM - gap,
        (y - CENTER[1]) / ZOOM
    ]
}

//returns the index of the vertex that has been clicked
function map_vertex(x, y) {
    [x, y] = translate_screen_pos(x, y)
    for (let i = 0; i < VERTICES_POS.length; i++) {
        vertex = VERTICES_POS[i]
        if (vertex == null) continue
        const d = Math.sqrt((vertex[0] - x) ** 2 + (vertex[1] - y) ** 2)
        if (d <= VERTEX_RADIUS * 1.5) {
            return i
        }

    }
    return null
}


function detect_edge(x, y) {

    [x, y] = translate_screen_pos(x, y)
    const detection_accuracy = 0.15

    for (let c = 0; c < EDGE_MATRIX.length; c++) {
        for (let r = 0; r < EDGE_MATRIX.length; r++) {

            //edge found
            if (EDGE_MATRIX[r][c] != 0) {

                const a = VERTICES_POS[r]
                const b = VERTICES_POS[c]

                // be more forgiving when accepted area decreases
                const horizontal_forgiveness = detection_accuracy + Math.max(0, 20 - Math.abs(a[0] - b[0]) ** 2)
                const vertical_forgiveness = detection_accuracy + Math.max(0, 20 - Math.abs(a[1] - b[1]) ** 2)

                // check if clicked between vertices
                if (Math.min(a[0], b[0]) - x > horizontal_forgiveness || Math.max(a[0], b[0]) - x < -horizontal_forgiveness)
                    continue

                if (Math.min(a[1], b[1]) - y > vertical_forgiveness || Math.max(a[1], b[1]) - y < -vertical_forgiveness)
                    continue

                // check if versors match
                const ab = [b[0] - a[0], b[1] - a[1]]
                const ab_len = Math.sqrt(Math.abs(ab[0] * ab[1] || Math.max(ab[0], ab[1]))) // eliminate 0 len
                const ab_versor = [ab[0] / ab_len, ab[1] / ab_len]

                const ap = [x - a[0], y - a[1]]
                const ap_len = Math.sqrt(Math.abs(ap[0] * ap[1] || Math.max(ap[0], ap[1])))  // eliminate 0 len
                const ap_versor = [ap[0] / ap_len, ap[1] / ap_len]

                // forgivenesses are flipped because as one dimension gets smaller the changes on other dimension get less significant when calculating vector's length
                // example: w1: 0.001 h2: 1000 l1: w1*h1=1
                // w2: 0.01 h2: 100 l2: 1  (change on height is much greater than on width)
                if (
                    Math.abs(ap_versor[0] - ab_versor[0]) < vertical_forgiveness &&
                    Math.abs(ap_versor[1] - ab_versor[1]) < horizontal_forgiveness
                ) {
                    return [r, c]
                }
            }
        }
    }
}


function render() {

    let [w, h] = [CANVAS.width, CANVAS.height]

    //background
    CTX.fillStyle = '#ffffff'
    CTX.fillRect(0, 0, w, h)

    if (!SETTINGS_ON.includes('blank_background')) {
        let gap = 32
        for (let x = 0; x < Math.ceil(w / gap); x++) {
            for (let y = 0; y < Math.ceil(h / gap); y++) {
                CTX.beginPath()
                CTX.arc((x + 0.5) * gap, (y + 0.5) * gap, 2, 0, 2 * Math.PI)
                CTX.fillStyle = '#cfcfcf'
                CTX.fill()
            }
        }
    }

    //graph edges
    for (let r = 0; r < EDGE_MATRIX.length; r++) {
        for (let c = 0; c < EDGE_MATRIX.length; c++) {
            if (EDGE_MATRIX[c][r] != 0) {
                CTX.beginPath()
                CTX.strokeStyle = '#000000'
                CTX.lineWidth = 1
                if (EDGE_HIGHLIGHT[c][r] != null) {
                    CTX.strokeStyle = EDGE_HIGHLIGHT[c][r]
                    CTX.lineWidth = 3
                }

                const a = translate_virtual_pos(...VERTICES_POS[r])
                const b = translate_virtual_pos(...VERTICES_POS[c])

                CTX.moveTo(...a)
                CTX.lineTo(...b)
                CTX.stroke()

                //draw direction arrows
                if (EDGE_MATRIX[c][r] != EDGE_MATRIX[r][c]) {
                    const density = Math.max(
                        Math.floor(Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) / 100)
                        , (WEIGHTED ? 3 : 2)
                    ) / ZOOM
                    const x = (b[0] - a[0]) / density
                    const y = (b[1] - a[1]) / density
                    const c = Math.sqrt(x * x + y * y)
                    const sin = -y / c
                    const cos = -x / c
                    for (let i = 1; i < density; i++) {

                        let radius = 8
                        radius *= ZOOM
                        const angle = 2 * Math.PI / 3

                        CTX.beginPath()
                        CTX.moveTo(
                            a[0] + x * i + cos * radius * 2,
                            a[1] + y * i + sin * radius * 2
                        )
                        CTX.lineTo(
                            a[0] + x * i + (cos * Math.cos(angle) - sin * Math.sin(angle)) * radius,
                            a[1] + y * i + (sin * Math.cos(angle) + Math.sin(angle) * cos) * radius
                        )
                        CTX.lineTo(
                            a[0] + x * i + (cos * Math.cos(-angle) - sin * Math.sin(-angle)) * radius,
                            a[1] + y * i + (sin * Math.cos(-angle) + Math.sin(-angle) * cos) * radius
                        )
                        CTX.lineTo(
                            a[0] + x * i + cos * radius * 2,
                            a[1] + y * i + sin * radius * 2
                        )
                        CTX.fillStyle = "#7f7faf"
                        CTX.fill()
                    }
                }

                // weights of the edges
                if (WEIGHTED) {
                    const vector = [Math.floor((b[0] - a[0]) / 2), Math.floor((b[1] - a[1]) / 2)]
                    CTX.font = (25 * ZOOM) + "px Arial"

                    CTX.fillStyle = "#ffffff"
                    CTX.fillRect(a[0] + vector[0] - 10 * ZOOM, a[1] + vector[1] - 10 * ZOOM, CTX.measureText(EDGE_WEIGHTS[c][r]).width, 20 * ZOOM)

                    CTX.fillStyle = "#c22937"
                    CTX.fillText(EDGE_WEIGHTS[c][r], a[0] + vector[0] - 10 * ZOOM, a[1] + vector[1] + 10 * ZOOM)
                }

            }
        }
    }

    //graph vertices
    for (let i = 0; i < VERTICES_POS.length; i++) {
        let vertex = VERTICES_POS[i]
        if (vertex == null) continue
        //translate pos to be relational to the center
        let [x, y] = translate_virtual_pos(vertex[0], vertex[1])
        CTX.beginPath()
        CTX.arc(x, y,
            VERTEX_RADIUS * ZOOM,
            0, 2 * Math.PI)

        CTX.fillStyle = "#000000"
        if (GRABBED === i) CTX.fillStyle = "#5f5fff"
        else if (SELECTED.includes(i)) CTX.fillStyle = "#9f3f3f"
        else if (VERTEX_HIGHLIGHT[i] != null) CTX.fillStyle = VERTEX_HIGHLIGHT[i]

        CTX.fill()

        if (SETTINGS_ON.includes('show_alias')) {
            const alias = ALIASES[i] ? ALIASES[i] : i
            CTX.font = (20 * ZOOM) + "px Arial"
            CTX.fillText(alias, x, y - 20)
        }
    }

}