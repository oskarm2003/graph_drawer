const script_input = document.querySelector("#internal-script")

script_input.onfocus = () => {
    ACCEPT_HOTKEYS = false
}
script_input.onblur = () => {
    ACCEPT_HOTKEYS = true
}

const placeCursor = (pos) => {
    script_input.selectionStart = pos
    script_input.selectionEnd = pos
}

const insertChar = (pos, char) => {
    const len = script_input.value.length
    script_input.value = script_input.value.slice(0, pos) + char + script_input.value.slice(pos, len)
}

script_input.onkeydown = (e) => {

    cursor_pos = script_input.selectionStart

    if (e.key == "Tab") {
        e.preventDefault()
        insertChar(cursor_pos, '\t')
        placeCursor(cursor_pos + 1)
    }

    if (e.key == "(") {
        insertChar(cursor_pos, ")")
        placeCursor(cursor_pos)
    }

    if (e.key == "{") {
        insertChar(cursor_pos, "}")
        placeCursor(cursor_pos)
    }

    if (e.key == "[") {
        insertChar(cursor_pos, "]")
        placeCursor(cursor_pos)
    }

    if (e.key == "\"") {
        insertChar(cursor_pos, "\"")
        placeCursor(cursor_pos)
    }

    if (e.key == "'") {
        insertChar(cursor_pos, "'")
        placeCursor(cursor_pos)
    }

    if (e.key == "Enter") {
        if (script_input.value[cursor_pos - 1] == "{") {
            e.preventDefault()
            insertChar(cursor_pos, "\n\t\n")
            placeCursor(cursor_pos + 2)
        }
    }

    autoResize()

}

function autoResize() {
    let base_font_size = window.getComputedStyle(document.body).getPropertyValue("font-size")
    base_font_size = parseInt(base_font_size.slice(0, base_font_size.length - 2));

    script_input.style.height = Math.min(
        Math.max(
            20 * base_font_size,
            script_input.scrollHeight
        ),
        80 * base_font_size) + "px"

    script_input.style.width = Math.min(
        Math.max(
            30 * base_font_size,
            script_input.scrollWidth
        ),
        70 * base_font_size) + "px"
}

script_input.textContent = "// example code - BFS\n\nconst G = getGraph(\"adjacency list\")\nconst visited = new Array(G.length).fill(false)\nconst queue = []\nqueue.push(0)\n\n// only for better algorithm visualization\nlet curr_queue = []\nlet depth = 0\n\nwhile (queue.length != 0 || curr_queue.length != 0) {\n\t\n\tif (curr_queue.length == 0) {\n\t\tcurr_queue = [...queue]\n\t\tqueue.length = 0\n\t\tprint(++depth)\n\t\tawait sleep(500)\n\t}\n\n\tconst v = curr_queue.shift()\n    \n   \tif (visited[v])\n\t\tcontinue\n    \n    \tvisited[v] = true\n\thighlightVertex(v,\"#3f8fff\")\n\t\n\tfor (const u of G[v]) {\n\t\tif (!visited[u])\n\t\t\tqueue.push(u)\n\t}\n\nprint(\"graph's depth is \" + depth)}"
autoResize()