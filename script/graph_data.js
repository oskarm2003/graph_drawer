let VERTICES_POS = []
let ALIASES = []
let EDGE_MATRIX = []
let EDGE_HIGHLIGHT = []
let EDGE_WEIGHTS = []
let VERTEX_HIGHLIGHT = []
let GRAPH_TYPE = 'undirected'
let WEIGHTED = false

function load_graph_data(data) {
    VERTICES_POS = data.vertices_pos
    ALIASES = data.aliases
    EDGE_MATRIX = data.edge_matrix
    EDGE_HIGHLIGHT = data.edge_highlight
    VERTEX_HIGHLIGHT = data.vertex_highlight
    GRAPH_TYPE = data.graph_type
    WEIGHTED = data.is_weighted
}

function save_graph_data(output) {
    output.vertices_pos = VERTICES_POS
    output.aliases = ALIASES
    output.edge_highlight = EDGE_HIGHLIGHT
    output.vertex_highlight = VERTEX_HIGHLIGHT
    output.edge_matrix = EDGE_MATRIX
    output.graph_type = GRAPH_TYPE
    output.is_weighted = WEIGHTED
}

function add_vertex(x, y) {

    if (x == undefined || y == undefined) {
        x = 0
        y = 0
    }

    VERTICES_POS.push([x, y])
    ALIASES.push(null)

    //add matrix row and column
    len = EDGE_MATRIX.length
    for (let i = 0; i < len; i++) {
        EDGE_MATRIX[i].push(0)
        EDGE_WEIGHTS[i].push(0)
        EDGE_HIGHLIGHT[i].push(null)
    }

    EDGE_MATRIX.push(new Array(len + 1).fill(0))
    EDGE_WEIGHTS.push(new Array(len + 1).fill(0))
    EDGE_HIGHLIGHT.push(new Array(len + 1).fill(null))

    VERTEX_HIGHLIGHT.push(null)

    render()

}

// delete selected vertex
function remove_vertex(vertex) {
    if (vertex == null) return
    for (let i = 0; i < EDGE_MATRIX.length; i++) {
        EDGE_MATRIX[i].splice(vertex, 1)
    }
    EDGE_MATRIX.splice(vertex, 1)
    VERTICES_POS.splice(vertex, 1)
    ALIASES.splice(vertex, 1)
}

//connect vertezies
function toggle_edge(v1, v2) {

    EDGE_MATRIX[v2][v1] = +!EDGE_MATRIX[v2][v1]
    if (GRAPH_TYPE == 'undirected') {
        EDGE_MATRIX[v1][v2] = +!EDGE_MATRIX[v1][v2]
    }

}

function highlight_edge(v1, v2, color) {

    if (!EDGE_MATRIX[v1][v2] && !EDGE_MATRIX[v2][v1]) {
        notify("cannot highlight non existing edge")
        return
    }

    if (EDGE_HIGHLIGHT[v1][v2] == null) {
        EDGE_HIGHLIGHT[v2][v1] = color
        EDGE_HIGHLIGHT[v1][v2] = color
    }
    else {
        EDGE_HIGHLIGHT[v2][v1] = null
        EDGE_HIGHLIGHT[v1][v2] = null
    }

}

function highlight_vertex(v, color) {
    if (VERTEX_HIGHLIGHT[v] == color) {
        VERTEX_HIGHLIGHT[v] = null
        return
    }
    VERTEX_HIGHLIGHT[v] = color
}

function no_highlight() {
    for (let i = 0; i < EDGE_HIGHLIGHT.length; i++) {
        VERTEX_HIGHLIGHT[i] = null
        for (let j = 0; j < EDGE_HIGHLIGHT.length; j++)
            EDGE_HIGHLIGHT[i][j] = null
    }
    render()
}

function reset_names() {
    for (let i = 0; i < ALIASES.length; i++)
        ALIASES[i] = null
    render()
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

function convert_weighted() {

    WEIGHTED = !WEIGHTED
    render()

    if (WEIGHTED) {
        notify("converted to weighted")
        document.querySelector("#convert_weighted").textContent = "convert to unweighted"
    }
    else {
        notify("converted to unweighted")
        document.querySelector("#convert_weighted").textContent = "convert to weighted"
    }
}

function convert_graph_type() {

    if (GRAPH_TYPE == "undirected") {
        GRAPH_TYPE = "directed"
    }

    else if (GRAPH_TYPE == "directed") {
        for (let i = 0; i < EDGE_MATRIX.length; i++) {
            for (let j = 0; j < EDGE_MATRIX.length; j++) {
                if (EDGE_MATRIX[i][j]) {
                    EDGE_MATRIX[j][i] = 1
                }
            }
        }
        GRAPH_TYPE = "undirected"
    }

    notify("converted graph to " + GRAPH_TYPE)
    rename_convert_button()
    render()

}