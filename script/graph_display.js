//GLOBALS
let CANVAS = null
let CTX = null

//settings
let VERTEX_RADIUS = 8

function change_vertex_size(size) {
    VERTEX_RADIUS = size
    render()
}

function init_canvas() {

    CANVAS = document.querySelector('#board')
    CANVAS.width = window.innerWidth
    CANVAS.height = window.innerHeight - document.querySelector('.menu-wrapper').offsetHeight
    CTX = CANVAS.getContext('2d')

}

//translate screen pos to canvas pos
function translate_pos(x, y, output_multiplier = 1) {
    return [(x + Math.floor(CANVAS.width / 2)) * output_multiplier, (y + Math.floor(CANVAS.height / 2)) * output_multiplier]
}

//returns the index of the edge that has been clicked
function map_edge(x, y) {
    [x, y] = translate_pos(-x, -y, -1)
    for (let i = 0; i < VERTEZIES_POS.length; i++) {
        vertex = VERTEZIES_POS[i]
        if (vertex == null) continue
        const d = Math.sqrt((vertex[0] - x) ** 2 + (vertex[1] - y) ** 2)
        if (d <= VERTEX_RADIUS * 1.5) {
            return i
        }

    }
    return null

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
        for (let c = r; c < EDGE_MATRIX.length; c++) {
            if (EDGE_MATRIX[c][r] != 0) {
                CTX.beginPath()
                CTX.strokeStyle = EDGE_MATRIX[c][r] % 2 != 0 ? '#ef7f7f' : '#000000'
                CTX.lineWidth = EDGE_MATRIX[c][r] % 2 == 0 ? 1 : 5
                CTX.moveTo(...translate_pos(...VERTEZIES_POS[r]))
                CTX.lineTo(...translate_pos(...VERTEZIES_POS[c]))
                CTX.stroke()
            }
        }
    }

    //graph vertezies
    for (let i = 0; i < VERTEZIES_POS.length; i++) {
        let vertex = VERTEZIES_POS[i]
        if (vertex == null) continue
        //translate pos to be relational to the center
        let [x, y] = translate_pos(vertex[0], vertex[1])
        CTX.beginPath()
        CTX.arc(x, y, VERTEX_RADIUS, 0, 2 * Math.PI)
        CTX.fillStyle = (SELECTED.includes(i)) ? '#9f3f3f' : '#000000'
        CTX.fill()
        if (SETTINGS_ON.includes('show_alias')) {
            const alias = ALIASES[i] ? ALIASES[i] : i + 1
            CTX.font = "20px Arial"
            CTX.fillText(alias, x, y - 20)
        }
    }
}