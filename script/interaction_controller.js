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
        VERTICES_POS[el][0] += dx
        VERTICES_POS[el][1] += dy
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
                        highlight_edge(recently_selected, el)
                    }
                    else {
                        toggle_edge(recently_selected, el)
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
    for (let i = 0; i < VERTICES_POS.length; i++) {
        if (VERTICES_POS[i] == null) continue
        const [x, y] = VERTICES_POS[i]
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

function open_saver() {
    SAVER = document.querySelector("#saver")
    CODE = document.querySelector("#code_saver")
    SAVER.style.display = 'flex'

    //on option select
    MENU = document.querySelector("#choose_ds")
    CODE.innerText = generate_data(MENU.value)
    MENU.onclick = () => {
        CODE.innerText = generate_data(MENU.value)
    }

    //copy generated code to clipboard
    document.querySelector("#copy_saver").onclick = () => {
        navigator.clipboard.writeText(CODE.innerText)
        notify("copied to clipboard")
    }

    //close saver menu
    document.querySelector("#exit_saver").onclick = () => {
        SAVER.style.display = 'none'
    }
}

function notify(message) {
    notification = document.querySelector("#notification")
    notification.innerText = message
    notification.style.display = 'block'
    setTimeout(() => {
        notification.style.top = '92%'
    }, 1)
    setTimeout(() => {
        notification.style.top = '120%'
        setTimeout(() => {
            notification.style.display = 'none'
        }, 500)
    }, 3000)
}

function manage_projects(e) {

    let x = e.clientX
    let prev_selected = -1
    let curr_selected = -1

    for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        if (child.getAttribute("selected") == "1") {
            prev_selected = i
        }
        if (child.offsetLeft < x && x < child.offsetLeft + child.offsetWidth) {
            curr_selected = i
        }
    }

    const change_name = (div) => {
        ACCEPT_HOTKEYS = false
        let tmp = div.innerText
        div.innerHTML = ''
        div.append(document.createElement("input"))
        div.lastChild.value = tmp
        div.lastChild.focus()
        div.lastChild.onkeydown = (e) => {
            if (e.code == 'Enter') {
                const name = div.lastChild.value
                div.innerText = name
                ACCEPT_HOTKEYS = true
            }
        }
        div.lastChild.addEventListener("focusout", () => {
            const name = div.lastChild.value
            div.innerText = name
            ACCEPT_HOTKEYS = true
        });
    }

    //change selection
    if (prev_selected != curr_selected) {

        save_graph_data(GRAPHS[prev_selected])
        this.children[prev_selected].setAttribute("selected", "0")

        //if adding new graph
        if (curr_selected == this.children.length - 1) {
            const tmp = this.children[curr_selected]
            this.removeChild(this.lastChild)
            const div = document.createElement("div")
            this.append(div)

            // name new tab
            change_name(div)

            // create new graph object
            this.append(tmp)
            GRAPHS.push({
                VERTICES_POS: [],
                aliases: [],
                edge_highlight: [],
                edge_matrix: [],
                graph_type: "directed",
            })
        }

        this.children[curr_selected].setAttribute("selected", "1")
        load_graph_data(GRAPHS[curr_selected])
        rename_convert_button()
        render()

    }

    else {
        if (curr_selected != this.children.length - 1) {
            change_name(this.children[curr_selected])
        }
    }

}

function rename_convert_button() {
    if (GRAPH_TYPE == 'directed') {
        document.querySelector("#convert_type").innerText = "convert to undirected"
    }
    else if (GRAPH_TYPE == 'undirected') {
        document.querySelector("#convert_type").innerText = "convert to directed"
    }
}