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

    // adding to UNDO_STACK
    action_controller.add_to_undo(() => {
        VERTICES_POS.pop()
        ALIASES.pop()
        len = EDGE_MATRIX.length
        for (let i = 0; i < len; i++) {
            EDGE_MATRIX[i].pop()
            EDGE_WEIGHTS[i].pop()
            EDGE_HIGHLIGHT[i].pop()
        }
        EDGE_MATRIX.pop()
        EDGE_WEIGHTS.pop()
        EDGE_HIGHLIGHT.pop()
        VERTEX_HIGHLIGHT.pop()
    })

}

// delete selected vertex
function remove_vertex(vertex) {
    if (vertex == null) return

    const memo = [JSON.parse(JSON.stringify(EDGE_MATRIX)), JSON.parse(JSON.stringify(EDGE_HIGHLIGHT)), JSON.parse(JSON.stringify(EDGE_WEIGHTS)), VERTICES_POS[vertex], ALIASES[vertex]]

    for (let i = 0; i < EDGE_MATRIX.length; i++) {
        EDGE_MATRIX[i].splice(vertex, 1)
        EDGE_HIGHLIGHT[i].splice(vertex, 1)
        EDGE_WEIGHTS[i].splice(vertex, 1)
    }
    EDGE_MATRIX.splice(vertex, 1)
    EDGE_WEIGHTS.splice(vertex, 1)
    EDGE_HIGHLIGHT.splice(vertex, 1)

    VERTICES_POS.splice(vertex, 1)
    ALIASES.splice(vertex, 1)

    // adding to UNDO_STACK
    action_controller.add_to_undo(() => {
        EDGE_MATRIX = memo[0]
        EDGE_HIGHLIGHT = memo[1]
        EDGE_WEIGHTS = memo[2]
        VERTICES_POS.insert(vertex, memo[3])
        ALIASES.insert(vertex, memo[4])
    })

}

//connect vertezies
function toggle_edge(v1, v2) {

    const action = () => {
        EDGE_MATRIX[v2][v1] = +!EDGE_MATRIX[v2][v1]
        if (GRAPH_TYPE == 'undirected')
            EDGE_MATRIX[v1][v2] = +!EDGE_MATRIX[v1][v2]
    }

    action()

    // adding to UNDO_STACK (reversed function is the same as base function)
    action_controller.add_to_undo(action)

}

function highlight_edge(v1, v2, color) {

    if (!EDGE_MATRIX[v1][v2] && !EDGE_MATRIX[v2][v1]) {
        notify("cannot highlight non existing edge")
        return
    }

    const action = () => {
        if (EDGE_HIGHLIGHT[v1][v2] == null) {
            EDGE_HIGHLIGHT[v2][v1] = color
            EDGE_HIGHLIGHT[v1][v2] = color
        }
        else {
            EDGE_HIGHLIGHT[v2][v1] = null
            EDGE_HIGHLIGHT[v1][v2] = null
        }
    }

    action()

    // adding to UNDO_STACK (reversed function is the same as base function)
    action_controller.add_to_undo(action)

}

function highlight_vertex(v, color) {

    const action = () => {
        if (VERTEX_HIGHLIGHT[v] == color) {
            VERTEX_HIGHLIGHT[v] = null
            return
        }
        VERTEX_HIGHLIGHT[v] = color
    }

    action()
    // adding to UNDO_STACK (reversed function is the same as base function)
    action_controller.add_to_undo(action)

}

function no_highlight() {

    const memo = [JSON.parse(JSON.stringify(EDGE_HIGHLIGHT)), [...VERTEX_HIGHLIGHT]]

    for (let i = 0; i < EDGE_HIGHLIGHT.length; i++) {
        VERTEX_HIGHLIGHT[i] = null
        for (let j = 0; j < EDGE_HIGHLIGHT.length; j++)
            EDGE_HIGHLIGHT[i][j] = null
    }
    render()

    // adding to UNDO_STACK
    action_controller.add_to_undo(() => {
        EDGE_HIGHLIGHT = memo[0]
        VERTEX_HIGHLIGHT = memo[1]
    })

}

function reset_names() {
    const memo = [...ALIASES]

    for (let i = 0; i < ALIASES.length; i++)
        ALIASES[i] = null
    render()

    // adding to UNDO_STACK
    action_controller.add_to_undo(() => {
        ALIASES = [...memo]
    })
}

// maps weights 
function map_matrix() {
    output = []
    for (let i = 0; i < EDGE_MATRIX.length; i++) {
        output.push([])
        for (let j = 0; j < EDGE_MATRIX.length; j++)
            output[i].push(null)
    }

    for (let c = 0; c < EDGE_MATRIX.length; c++) {
        for (let r = 0; r < EDGE_MATRIX.length; r++) {
            if (EDGE_MATRIX[r][c] != 0) {
                output[r][c] = EDGE_WEIGHTS[r][c]
                console.table(output)
            }
        }
    }

    return output
}

function convert_weighted() {

    const action = () => {
        WEIGHTED = !WEIGHTED

        if (WEIGHTED) {
            notify("converted to weighted")
            document.querySelector("#convert_weighted").textContent = "convert to unweighted"
        }
        else {
            notify("converted to unweighted")
            document.querySelector("#convert_weighted").textContent = "convert to weighted"
        }
    }

    action()
    render()

    // adding to UNDO_STACK (reversed function is the same as base function)
    action_controller.add_to_undo(action)

}

function add_weight(u, v, weight) {
    EDGE_WEIGHTS[u][v] += weight
    EDGE_WEIGHTS[v][u] = EDGE_WEIGHTS[u][v]
    // if (GRAPH_TYPE === "undirected")
    action_controller.add_to_undo(() => {
        EDGE_WEIGHTS[u][v] -= weight
        EDGE_WEIGHTS[v][u] = EDGE_WEIGHTS[u][v]
    })
}

function convert_graph_type() {

    const memo = JSON.parse(JSON.stringify(EDGE_MATRIX))
    const action = () => {
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
    }

    action()
    render()

    // adding to UNDO_STACK (reversed function is the same as base function)
    action_controller.add_to_undo(() => {
        action()
        EDGE_MATRIX = memo
    })

}

function generate_data(type) {


    if (type == 'matrix') {
        tmp = "[\n"
        if (WEIGHTED) {
            for (let row of map_matrix()) {
                tmp += '  ' + JSON.stringify(row) + ',\n'
            }
        }
        else {
            for (let row of EDGE_MATRIX) {
                tmp += '  ' + JSON.stringify(row).replaceAll('2', '1') + ',\n'
            }
        }
        return tmp + ']'
    }
    if (type == 'adjacency') {

        tmp = "[\n"
        for (let r = 0; r < EDGE_MATRIX.length; r++) {
            list = []
            for (let c = 0; c < EDGE_MATRIX.length; c++) {
                if (EDGE_MATRIX[r][c] != 0) {
                    if (WEIGHTED)
                        list.push([c, EDGE_WEIGHTS[r][c]])
                    else
                        list.push(c)
                }
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
                    const edge = [i, j]
                    if (WEIGHTED)
                        edge.push(EDGE_WEIGHTS[i][j])
                    edges.push(edge)
                }
            }
        }
        return tmp + ",\n  " + JSON.stringify(edges) + "\n]"
    }

    return "code will appear here..."

}