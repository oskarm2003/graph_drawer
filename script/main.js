init_canvas()
render()
document.querySelector('#add_vertex').onclick = add_vertex
document.querySelector('#delete_vertex').onclick = delete_selected
document.querySelector('#change_alias').onclick = change_alias
document.querySelector('#click_create').onclick = check
document.querySelector('#keep_selected').onclick = check
document.querySelector('#blank_background').onclick = check
document.querySelector('#show_alias').onclick = check
document.querySelector('#highlight').onclick = check

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

document.onkeydown = (e) => {
    switch (e.code) {
        case 'KeyC':
            document.querySelector('#click_create').click()
            break;
        case 'KeyS':
            document.querySelector('#keep_selected').click()
            break
        case 'KeyA':
            document.querySelector('#show_alias').click()
            break
        case 'KeyB':
            document.querySelector('#blank_background').click()
            break
        case 'KeyH':
            document.querySelector('#highlight').click()
            break
        default:
            break;
    }
    onkeydown(e)
}
document.onkeyup = onkeyup
window.onresize = () => { init_canvas(); render() }