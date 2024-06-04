const SELECTED = []

// returns performed action status text
function vertex_click(v) {

    if (IS_SHIFT_DOWN) {
        toggle_vertex_selection(v)
        return "selected"
    }

    if (SETTINGS_ON.includes("vertex-highlight-mode")) {
        const color = document.querySelector("#highlight-color").value
        highlight_vertex(GRABBED, color)
        unselect_all()
        return "highlighted"
    }

    if (SELECTED.length === 0) {
        SELECTED.push(v)
        return "selected"
    }

    if (SETTINGS_ON.includes("edge-highlight-mode")) {
        highlight_edges_between_v_and_selected(v)
        return "highlighted"
    }


    if (SELECTED.includes(v)) {
        unselect_all()
        select_vertex(v)
        return "selected"
    }

    connect_with_selected(v)
    return "connected"

}

function move_vertex_to(v, x, y) {
    VERTICES_POS[v] = [x, y]
}

function toggle_vertex_selection(v) {
    if (SELECTED.includes(v))
        SELECTED.splice(SELECTED.indexOf(v), 1)
    else
        SELECTED.push(v)
}

function select_vertex(v) {
    if (!SELECTED.includes(v))
        SELECTED.push(v)
}

function unselect_all() {
    SELECTED.length = 0
}

function connect_with_selected(v) {

    for (const u of SELECTED)
        toggle_edge(u, v)

}

function highlight_edges_between_v_and_selected(v) {

    const color = document.querySelector('#highlight-color').value
    for (const u of SELECTED)
        highlight_edge(u, v, color)

}