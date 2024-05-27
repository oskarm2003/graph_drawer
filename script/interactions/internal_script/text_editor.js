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
    script_input.style.height = Math.max(script_input.scrollHeight, 500) + "px"
    script_input.style.width = Math.max(script_input.scrollWidth, 400) + "px"
}

// autoResize()