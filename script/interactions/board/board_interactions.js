class BoardController {

    constructor(canvas) {

        this.mouse_down_position = null // null - mouse is not down
        this.board_position_memo = null

        this.selection_mode // selection zone mode
        this.selection = document.querySelector("#selection")

        canvas.onmousedown = (e) => this.on_mouse_down.bind(this)(e)
        canvas.onmousemove = (e) => this.on_mouse_move.bind(this)(e)
        canvas.onmouseup = (e) => this.on_mouse_up.bind(this)(e)
        canvas.addEventListener("mouseout", this.on_mouse_out.bind(this))

    }

    on_mouse_down(e) {

        const [x, y] = [e.clientX + CANVAS.offsetLeft, e.clientY - CANVAS.offsetTop]
        this.mouse_down_position = [x, y]

        if (IS_CTRL_DOWN)
            return

        const detected_vertex = map_vertex(x, y)

        if (detected_vertex === null)
            this.selection_mode = true
        else {
            GRABBED = detected_vertex
            if (IS_SHIFT_DOWN)
                toggle_vertex_selection(GRABBED)
        }

        render()

    }

    on_mouse_move(e) {

        // display weight icon
        if (SETTINGS_ON.includes("weight-on-click")) {
            weight_icon.style.display = "block"
            weight_icon.style.left = e.clientX + "px"
            weight_icon.style.top = e.clientY + "px"
        }
        else
            weight_icon.style.display = "none"

        // moving the whole view
        if (this.mouse_down_position != null && IS_CTRL_DOWN) {

            if (this.board_position_memo == null)
                this.board_position_memo = [...CENTER]

            const [dx, dy] = [e.clientX - this.mouse_down_position[0], e.clientY - this.mouse_down_position[1]]
            CENTER[0] = this.board_position_memo[0] + dx
            CENTER[1] = this.board_position_memo[1] + dy
            render()
        }

        // selection zone
        else if (this.selection_mode) {
            this.multi_select(e.clientX, e.clientY)
            render()
        }

        // move the vertex
        else if (GRABBED != -1) {

            const [x, y] = [e.clientX + CANVAS.offsetLeft, e.clientY - CANVAS.offsetTop]
            const d_pos = translate_screen_pos(x, y)

            if (!SELECTED.includes(GRABBED))
                unselect_all()

            for (const v of SELECTED) {
                if (v === GRABBED) continue
                move_vertex_to(v, // calculate the pos relative to grabbed vertex
                    d_pos[0] + (VERTICES_POS[v][0] - VERTICES_POS[GRABBED][0]),
                    d_pos[1] + (VERTICES_POS[v][1] - VERTICES_POS[GRABBED][1])
                )
            }

            move_vertex_to(GRABBED, ...d_pos)
            render()
        }

    }

    on_mouse_up(e) {

        const [x, y] = [e.clientX + CANVAS.offsetLeft, e.clientY - CANVAS.offsetTop]

        // mouse not moved (or moved less than accuracy_forgiveness)
        const accuracy_forgiveness = 10
        if (Math.abs(x - this.mouse_down_position[0]) < accuracy_forgiveness &&
            Math.abs(y - this.mouse_down_position[1]) < accuracy_forgiveness) {

            // nothing grabbed
            if (GRABBED === -1) {

                // click on edge
                if (WEIGHTED && SETTINGS_ON.includes("weight-on-click")) {
                    const detected_edge = detect_edge(x, y)
                    if (detected_edge != undefined) {
                        const [x, y] = detected_edge
                        const weight = parseInt(document.querySelector("#weight").value)
                        if (weight != NaN) {
                            add_weight(x, y, weight)
                        }
                    }
                }

                if (SETTINGS_ON.includes("click_create")) {
                    const create_pos = translate_screen_pos(x, y)
                    add_vertex(...create_pos)

                    if (SETTINGS_ON.includes("join_on_create"))
                        connect_with_selected(EDGE_MATRIX.length - 1)

                    if (!SETTINGS_ON.includes("keep_selected"))
                        unselect_all()

                    if (SETTINGS_ON.includes("select_connected") && SETTINGS_ON.includes("join_on_create"))
                        select_vertex(EDGE_MATRIX.length - 1)
                }
                else
                    unselect_all()
            }

            // something grabbed
            else if (!IS_SHIFT_DOWN) {

                if (vertex_click(GRABBED) == "connected") {

                    if (!SETTINGS_ON.includes("keep_selected"))
                        unselect_all()

                    if (SETTINGS_ON.includes("select_connected"))
                        select_vertex(GRABBED)

                }
            }
        }

        //clean up
        GRABBED = -1
        this.mouse_down_position = null
        this.board_position_memo = null
        this.hide_selection()
        render()

    }

    on_mouse_out() {
        GRABBED = -1
        this.mouse_down_position = null
        this.board_position_memo = null
        this.hide_selection()
    }


    hide_selection() {
        this.selection.style.display = "none"
        this.selection_mode = false
    }

    multi_select(mouse_x, mouse_y) {

        const [x0, y0] = this.mouse_down_position
        const [w, h] = [(mouse_x - x0) / ZOOM, (mouse_y - y0) / ZOOM] // calc dimensions

        // display
        if (window.getComputedStyle(this.selection).display === "none") {
            this.selection.style.display = "block"
            this.selection.style.left = x0 + "px"
            this.selection.style.top = y0 + "px"
        }

        this.selection.style.width = Math.abs(mouse_x - x0) + 'px' // preventing negative dimensions
        this.selection.style.height = Math.abs(mouse_y - y0) + 'px'

        this.selection.style.left = mouse_x < x0 ? x0 - Math.abs(mouse_x - x0) + 'px' : x0 + 'px'
        this.selection.style.top = mouse_y < y0 ? y0 - Math.abs(y0 - mouse_y) + 'px' : y0 + 'px'

        // logic
        unselect_all()

        const [sx, sy] = translate_screen_pos(x0, y0) // start selection pos

        for (let v = 0; v < EDGE_MATRIX.length; v++) {
            const [vx, vy] = VERTICES_POS[v]
            if (is_num_between(vx, sx, sx + w) && is_num_between(vy, sy, sy + h))
                select_vertex(v)
        }

    }

}

function is_num_between(num, a, b) {
    return Math.abs(b - a) >= Math.abs(num - a) + Math.abs(b - num)
}
