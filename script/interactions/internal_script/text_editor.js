const script_input = document.querySelector("#internal-script")
const script_display_canvas = document.querySelector("#internal-script-display")
const script_wrapper = document.querySelector("#script-textarea-wrapper")

script_input.onfocus = () => {
    ACCEPT_HOTKEYS = false
    script_wrapper.setAttribute("focused", "true")
}
script_input.onblur = () => {
    ACCEPT_HOTKEYS = true
    script_wrapper.removeAttribute("focused")
}

script_input.onscroll = () => {
    DISPLAY.displayText(script_input.value)
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

    // alterSize()
    cursor_pos = script_input.selectionStart

    if (e.key == "Tab") {
        e.preventDefault()
        insertChar(cursor_pos, '\t')
        placeCursor(cursor_pos + 1)
        DISPLAY.displayText(script_input.value)
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
            DISPLAY.displayText(script_input.value)
        }
    }

}

script_input.oninput = () => {
    DISPLAY.displayText(script_input.value)
}

let timeout = setTimeout(() => { })
const observer = new ResizeObserver(() => {

    clearTimeout(timeout)
    script_wrapper.style.backgroundColor = "#afafcf6f"

    timeout = setTimeout(() => {
        script_wrapper.style.backgroundColor = "white"
        DISPLAY.displayText(script_input.value)
    }, 50)
})
observer.observe(script_input)

// const max_width = Math.floor(
//     document.querySelector(".script-wrapper").getBoundingClientRect().width * 0.8
// )
// const max_height = script_input.getBoundingClientRect().height * 3

// function alterSize() {


//     const { width, height } = script_input.getBoundingClientRect()
//     console.log(max_width, width);
//     if (width < max_width) {
//         script_input.style.width = script_input.scrollWidth + "px"
//         DISPLAY.displayText(script_input.value)
//     }

// }

document.querySelector("#font-select").onchange = function () {
    const fontface = this.value
    script_input.style.fontFamily = fontface
    DISPLAY.onFontUpdate()
    DISPLAY.displayText(script_input.value)
}
document.querySelector("#font-size").onchange = function () {
    console.log("font size change");
    const font_size = this.value + "px"
    script_input.style.fontSize = font_size
    DISPLAY.onFontUpdate()
    DISPLAY.displayText(script_input.value)
}

script_input.value = "// example code - BFS\n\nconst G = getGraph(\"adjacency list\")\nconst visited = new Array(G.length).fill(false)\nconst queue = []\nqueue.push(0)\n\n// only for better algorithm visualization\nlet curr_queue = []\nlet depth = 0\n\nwhile (queue.length != 0 || curr_queue.length != 0) {\n\t\n\tif (curr_queue.length == 0) {\n\t\tcurr_queue = [...queue]\n\t\tqueue.length = 0\n\t\tprint(++depth)\n\t\tawait sleep(500)\n\t}\n\n\tconst v = curr_queue.shift()\n    \n   \tif (visited[v])\n\t\tcontinue\n    \n    \tvisited[v] = true\n\thighlightVertex(v,\"#3f8fff\")\n\t\n\tfor (const u of G[v]) {\n\t\tif (!visited[u])\n\t\t\tqueue.push(u)\n\t}\n}\n\nprint(\"furthest distance from vertex 0 is \" + (depth-1))"

const DISPLAY = new ScriptDisplay()
DISPLAY.displayText(script_input.value)