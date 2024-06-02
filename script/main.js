GRAPHS = [
    {
        VERTICES_POS: VERTICES_POS,
        aliases: ALIASES,
        edge_highlight: EDGE_HIGHLIGHT,
        edge_matrix: EDGE_MATRIX,
        graph_type: GRAPH_TYPE,
    }
]

const action_controller = new ActionController()

Array.prototype.insert = function (index, value) {
    this.splice(index, 0, value)
}

init_canvas()
render()

//basic edge and vertex managment
document.querySelector('#add_vertex').onclick = add_vertex
document.querySelector('#delete_vertex').onclick = delete_selected
document.querySelector('#click_create').onclick = check
document.querySelector('#keep_selected').onclick = check

//graph data
document.querySelector('#save_graph').onclick = open_saver
document.querySelector('#convert_type').onclick = convert_graph_type
document.querySelector('#convert_weighted').onclick = convert_weighted

//display
document.querySelector('#blank_background').onclick = check

//projects
// document.querySelector('#projects').onclick = manage_projects
// document.querySelector('#projects').oncontextmenu = open_menu

//naming
document.querySelector('#show_alias').onclick = check
document.querySelector('#reset_names').onclick = reset_names
document.querySelector('#change_alias').onclick = change_alias

//highlighting
document.querySelector('#edge-highlight-mode').onclick = check
document.querySelector('#vertex-highlight-mode').onclick = check
document.querySelector('#highlight-vertices').onclick = highlight_selected_vertices
document.querySelector('#clear_highlight').onclick = no_highlight

//actions
document.querySelector('#undo').onclick = () => action_controller.undo()

//weights
document.querySelector('#weight-on-click').onclick = check

// internal script
document.querySelector('#go-to-script').onclick = () => {
    document.querySelector("#script-tab").click()
}
document.querySelector('#run-script').onclick = run_script
document.querySelector('#clear-console').onclick = clear

//help
document.querySelector('#help_button').onclick = () => document.querySelector("#help-tab").click()


document.querySelector('#board').onwheel = scrolling


//custom range
const range_handler = () => {

    const range_wrapper = document.querySelector('#size')
    const [_, range, indicator] = range_wrapper.children
    const pointer = range.children[0]

    let mouse_down = false

    pointer.onmousedown = () => { mouse_down = true; range_wrapper.style.userSelect = 'none' }
    window.onmouseup = () => { mouse_down = false; range_wrapper.style.userSelect = 'auto' }
    // range_wrapper.onmouseout = () => { console.log('mouse out');; mouse_down = false }

    range_wrapper.onmousemove = (e) => {
        if (!mouse_down) return
        const x = e.clientX - range.offsetLeft
        const pos = (x / range.offsetWidth)
        if (pos > 0 && pos < 1) {
            pointer.style.left = x + 'px'
            const size = parseInt(pos * range.offsetWidth / 5)
            indicator.innerText = size
            change_vertex_size(size)
        }
    }

}
range_handler()

CANVAS.onmousedown = on_down
CANVAS.onmousemove = on_move
CANVAS.onmouseup = on_up
CANVAS.onmouseout = mouse_out

ACCEPT_HOTKEYS = true

document.onkeydown = (e) => {
    if (!ACCEPT_HOTKEYS) return
    switch (e.code) {

        case 'KeyC':
            document.querySelector('#click_create').click()
            break;

        case 'KeyS':
            document.querySelector('#keep_selected').click()
            break

        case 'KeyN':
            document.querySelector('#show_alias').click()
            break

        case 'KeyB':
            document.querySelector('#blank_background').click()
            break

        case 'KeyE':
            document.querySelector('#edge-highlight-mode').click()
            break

        case 'KeyV':
            document.querySelector('#vertex-highlight-mode').click()
            break

        case 'KeyW':
            document.querySelector('#weight-on-click').click()
            break

        case 'KeyZ':
            if (IS_CTRL_DOWN)
                document.querySelector('#undo').click()

        default:
            break;
    }
    onkeydown(e)
}

document.onkeyup = onkeyup
window.onresize = () => { init_canvas(); render() }