let VERTEZIES_POS = []
let ALIASES = []
let EDGE_MATRIX = []

function add_vertex(x, y) {

    if (x == undefined || y == undefined) {
        x = 0
        y = 0
    }

    VERTEZIES_POS.push([x, y])
    ALIASES.push(null)

    //add matrix row and column
    len = EDGE_MATRIX.length
    for (let i = 0; i < len; i++) {
        EDGE_MATRIX[i].push(0)
    }
    EDGE_MATRIX.push(new Array(len + 1).fill(0))

    render()

}

// delete selected vertex
function remove_vertex(vertex) {
    if (vertex == null) return
    for (let i = 0; i < EDGE_MATRIX.length; i++) {
        EDGE_MATRIX[i].splice(vertex, 1)
    }
    EDGE_MATRIX.splice(vertex, 1)
    VERTEZIES_POS.splice(vertex, 1)
    ALIASES.splice(vertex, 1)
}

//connect vertezies
function toggle_edge(v1, v2) {

    let value = 0

    if (EDGE_MATRIX[v1][v2] == 0) {
        value = 2
    }

    EDGE_MATRIX[v1][v2] = value
    EDGE_MATRIX[v2][v1] = value

}

function highlight_edge(v1, v2) {

    if (EDGE_MATRIX[v1][v2] == 0) return

    let value = 1

    if (EDGE_MATRIX[v1][v2] % 2 != 0) {
        value = -1
    }

    EDGE_MATRIX[v1][v2] += value
    EDGE_MATRIX[v2][v1] += value

}

function generate_data(type) {


    if (type == 'matrix') {
        tmp = "[\n"
        for (let row of EDGE_MATRIX) {
            tmp += '  ' + JSON.stringify(row).replaceAll('2', '1') + ',\n'
        }
        return tmp + ']'
    }
    if (type == 'adjacency') {
        tmp = "[\n"
        for (let row of EDGE_MATRIX) {
            list = []
            for (let i = 0; i < row.length; i++) {
                if (row[i] != 0) { list.push(i) }
            }
            tmp += '  ' + JSON.stringify(list) + ',\n'
        }
        return tmp + "]"
    }
    if (type == 'math_object') {
        tmp = "[\n  " +
            JSON.stringify(Array.from({ length: EDGE_MATRIX.length }, (_, index) => index))
        edges = []
        for (let i = 0; i < EDGE_MATRIX.length; i++) {
            for (let j = 0; j < EDGE_MATRIX.length; j++) {
                if (EDGE_MATRIX[i][j] != 0) {
                    edges.push([i, j])
                }
            }
        }
        return tmp + ",\n  " + JSON.stringify(edges) + "\n]"
    }

    return "code will appear here..."

}