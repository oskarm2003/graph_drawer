function run_script() {
    const script = preProcess(script_input.value)
    console.log(JSON.stringify(script))
    eval("(async function () {" + script + "})();")
}

function preProcess(script) {

    comment_start = -1
    string_start = -1

    for (let i = 0; i < script.length; i++) {

        if (script[i] == "\"" || script[i] == "'") {
            if (string_start == -1)
                string_start = i
            else if (script[string_start] == script[i])
                string_start = -1
        }

        // if comment char is not within string
        if (script[i] == "#" && string_start == -1)
            comment_start = i

        if ((script[i] == "\n" || i == script.length - 1) && comment_start != -1) {
            script = script.slice(0, comment_start) + script.slice(i + 1, script.length)
            comment_start = -1
            i -= i - comment_start
        }
    }

    return script

}

// functions to use in internal script:

function print(string) {
    const internal_console = document.querySelector("#internal-console")
    internal_console.innerText += string + "\n"
}

function clear() {
    const internal_console = document.querySelector("#internal-console")
    internal_console.innerText = ""
}

function sleep(time) {
    return new Promise((resolve) =>
        setTimeout(() => resolve(), time))
}

function getGraph(type) {

    if (type == "matrix") {
        return EDGE_MATRIX
    }

    if (type == "adjacency" || type == "adjacency list") {

        adj_list = []
        for (let r = 0; r < EDGE_MATRIX.length; r++) {

            adj_list.push([])

            for (let c = 0; c < EDGE_MATRIX.length; c++) {

                if (EDGE_MATRIX[r][c] != 0) {
                    adj_list[adj_list.length - 1].push(c)
                }
            }
        }

        return adj_list
    }

    if (type == "edges") {
        return JSON.parse(generate_data("math_object"))[1]
    }

    if (type == "vertices") {
        return JSON.parse(generate_data("math_object"))[0]
    }

}

function highlightVertex(v, color, time) {
    // console.log(v, color, time);
    const old_color = VERTEX_HIGHLIGHT[v]
    highlight_vertex(v, color)
    render()

    if (time) {
        setTimeout(() => {
            highlight_vertex(v, old_color)
            render()
        }, time)
    }
}

function highlightEdge(u, v, color, time) {

    const old_color = EDGE_HIGHLIGHT[u][v]
    highlight_edge(u, v, color)
    render()

    if (time) {
        setTimeout(() => {
            highlight_edge(u, v, old_color)
            render()
        }, time)
    }

}