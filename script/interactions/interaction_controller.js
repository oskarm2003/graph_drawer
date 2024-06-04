let SETTINGS_ON = []
const weight_icon = document.querySelector("#weight-icon")


function onkeydown(e) {
    if (e.code == 'ShiftLeft') IS_SHIFT_DOWN = true
    if (e.code == 'ControlLeft') IS_CTRL_DOWN = true
    if (e.code == 'Delete') delete_selected()
}


function onkeyup(e) {
    if (e.code == 'ShiftLeft') IS_SHIFT_DOWN = false
    if (e.code == 'ControlLeft') IS_CTRL_DOWN = false
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

function toggle_weight_icon_visibility() {
    if (!SETTINGS_ON.includes("weight-on-click")) {
        weight_icon.style.display = "none"
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
    SELECTED.length = 0
    render()
}

function highlight_selected_vertices() {
    //possibly unique selected needed (omitted for now)
    const color = document.querySelector("#highlight-color").value
    for (let el of SELECTED)
        highlight_vertex(el, color)

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
            const memo = [...ALIASES]
            for (let el of SELECTED) {
                ALIASES[el] = input.value
            }
            // undo
            action_controller.add_to_undo(() => {
                ALIASES = memo
            })
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

const notification_queue = []
let is_displaying = false
function notify(message) {

    if (!is_displaying)
        display_notification(message)
    else
        notification_queue.push(message)

}

function display_notification(text) {
    is_displaying = true
    notification = document.querySelector("#notification")
    notification.innerText = text
    notification.style.top = '92%'

    setTimeout(() => {

        notification.style.top = '120%'

        setTimeout(() => {

            is_displaying = false

            if (notification_queue.length != 0)
                display_notification(notification_queue.shift())

        }, 100)

    }, 2000)
}


function rename_convert_button() {
    if (GRAPH_TYPE == 'directed') {
        document.querySelector("#convert_type").innerText = "convert to undirected"
    }
    else if (GRAPH_TYPE == 'undirected') {
        document.querySelector("#convert_type").innerText = "convert to directed"
    }
}

function scrolling(e) {
    ZOOM = Math.max(
        ZOOM + (Math.sign(-e.deltaY) * 0.1),
        0.25)
    ZOOM = Math.min(ZOOM, 2)
    render()

    prompt = document.querySelector("#zoom")
    prompt.innerText = "zoom: " + Math.floor(ZOOM * 100) + "%"
    prompt.onclick = () => {
        ZOOM = 1
        prompt.innerText = "zoom: " + Math.floor(ZOOM * 100) + "%"
        render()
    }

}