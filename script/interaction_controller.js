let SELECTED = []
let MOUSE_DOWN_POS = null //saved without coordinates transformation
let SELECTION_MODE = false
let MOVED = false
let IS_DOWN = false
let IS_SHIFT_DOWN = false
let SETTINGS_ON = []

function on_down(e) {

    document.querySelector('#alias_input').style.display = 'none'

    IS_DOWN = true

    const [x, y] = [e.clientX, e.clientY - CANVAS.offsetTop]
    const detected = map_edge(x, y)
    MOUSE_DOWN_POS = [e.clientX, e.clientY]

    if (detected === null) {
        SELECTED = []
        SELECTION_MODE = true
        if (SETTINGS_ON.includes('click_create')) {
            const new_pos = translate_pos(-x, -y, -1)
            add_vertex(...new_pos)
        }
    }

    if (detected != null) {
        //vertex detected
        SELECTED.push(detected)
    }

    render()
}

function on_move(e) {

    if (!IS_DOWN) return
    MOVED = true

    if (SELECTION_MODE) {
        multi_select(e.clientX, e.clientY)
        return
    }

    if (!SELECTED.slice(0, SELECTED.length - 1).includes(SELECTED[SELECTED.length - 1])) {
        SELECTED = [SELECTED.pop()]
    }

    let [dx, dy] = [e.clientX - MOUSE_DOWN_POS[0], e.clientY - MOUSE_DOWN_POS[1]]
    for (let el of SELECTED.filter((value, index, array) => {
        return array.indexOf(value) === index
    })) {
        VERTEZIES_POS[el][0] += dx
        VERTEZIES_POS[el][1] += dy
    }

    MOUSE_DOWN_POS = [e.clientX, e.clientY]
    render()
}


function on_up() {
    if (!MOVED) {
        const len = SELECTED.length

        if (len != 0) {

            recently_selected = SELECTED[len - 1]

            //unselect the element
            if (SELECTED.slice(0, len - 1).includes(recently_selected)) {
                if (IS_SHIFT_DOWN) {
                    SELECTED.pop()
                    const index = SELECTED.indexOf(recently_selected)
                    SELECTED.splice(index, 1)
                }
                else {
                    SELECTED = []
                }
            }
            //connect the vertezies
            else if (len > 1 && !IS_SHIFT_DOWN) {
                for (let el of SELECTED.slice(0, len - 1)) {

                    if (SETTINGS_ON.includes('highlight')) {
                        highlight_edge(el, recently_selected)
                    }
                    else {
                        toggle_edge(el, recently_selected)
                    }

                    SELECTED = []
                    if (SETTINGS_ON.includes('keep_selected')) {
                        SELECTED.push(recently_selected)
                    }
                }
            }
        }

    }

    if (MOVED && !SELECTION_MODE && SELECTED.length === 1) {
        SELECTED = []
    }

    MOUSE_DOWN_POS = null
    MOVED = false
    IS_DOWN = false
    SELECTION_MODE = false
    document.querySelector('#selection').style.display = 'none'
    render()
}


function mouse_out() {
    MOVED = false
    IS_DOWN = false
    MOUSE_DOWN_POS = null
    selection.style.display = 'none'
}


function multi_select(end_x, end_y) {
    if (!SELECTION_MODE) return
    let [start_x, start_y] = MOUSE_DOWN_POS
    const selection = document.querySelector('#selection')

    //start the selection
    if (getComputedStyle(selection).display == 'none') {
        selection.style.display = 'block'
        selection.style.top = start_y + 'px'
        selection.style.left = start_x + 'px'
        SELECTED = []
    }

    //bad cpde
    const found = []
    const [w, h] = [end_x - start_x, end_y - start_y]
    let [cx, cy] = translate_pos(-start_x, -start_y, -1)
    cy -= CANVAS.offsetTop
    for (let i = 0; i < VERTEZIES_POS.length; i++) {
        if (VERTEZIES_POS[i] == null) continue
        const [x, y] = VERTEZIES_POS[i]
        if (Math.abs(w) > Math.abs(x - cx) && Math.sign(w) === Math.sign(x - cx) && Math.abs(h) > Math.abs(y - cy) && Math.sign(h) === Math.sign(y - cy)) {
            found.push(i)
        }
    }
    SELECTED = found
    render()

    selection.style.width = Math.abs(end_x - start_x) + 'px'
    selection.style.height = Math.abs(end_y - start_y) + 'px'

    selection.style.left = end_x < start_x ? start_x - Math.abs(end_x - start_x) + 'px' : start_x + 'px'
    selection.style.top = end_y < start_y ? start_y - Math.abs(start_y - end_y) + 'px' : start_y + 'px'
}


function onkeydown(e) {
    if (e.code == 'ShiftLeft') IS_SHIFT_DOWN = true
    if (e.code == 'Delete') delete_selected()
}


function onkeyup(e) {
    if (e.code == 'ShiftLeft') {
        IS_SHIFT_DOWN = false
    }
}

function toggle_setting(setting) {

    if (SETTINGS_ON.includes(setting)) {
        const index = SETTINGS_ON.indexOf(setting)
        SETTINGS_ON.splice(index, 1)
    }
    else {
        SETTINGS_ON.push(setting)
    }

}


function delete_selected() {
    let unique = SELECTED.filter((value, index, array) => {
        return array.indexOf(value) === index
    })
    for (let i = 0; i < unique.length; i++) {
        remove_vertex(unique[i])
        for (let j = i; j < unique.length; j++) {
            if (unique[j] > unique[i]) unique[j]--
        }
    }
    SELECTED = []
    render()
}


function check() {
    const attr = this.attributes.checked.value == 'true'
    this.setAttribute('checked', !attr)

    toggle_setting(this.id)

    const canvas = this.children[0]
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    render()

    if (attr) {
        ctx.clearRect(0, 0, 64, 64)
        return
    }

    ctx.beginPath()
    ctx.lineWidth = 10
    ctx.strokeStyle = '#ffffff'
    ctx.moveTo(16, 32)
    ctx.lineTo(32, 48)
    ctx.lineTo(48, 16)
    ctx.stroke()
}


function change_alias() {

    if (SELECTED.length === 0) return

    const alias_menu = document.querySelector('#alias_input')
    alias_menu.style.display = 'flex'

    const [_, input, button] = alias_menu.children

    const submit = () => {

        if (input.value != '') {
            for (let el of SELECTED) {
                ALIASES[el] = input.value
            }
        }

        input.value = ''
        alias_menu.style.display = 'none'
        render()
    }

    input.focus()
    input.onkeyup = (e) => {
        if (e.code == 'Enter') {
            submit()
        }
    }
    button.onclick = submit

}