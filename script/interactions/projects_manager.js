PROJECTS = document.querySelector("#projects")
CONTEXT_MENU = document.querySelector("#context_menu")

function manage_projects(e) {

    let prev_selected = find_selected()
    let curr_selected = map_project(e.clientX)

    //change selection
    if (prev_selected != curr_selected && curr_selected != -1) {

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
                graph_type: "directed"
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


function open_menu(e) {
    e.preventDefault()
    CONTEXT_MENU.style.left = e.clientX + 'px'
    CONTEXT_MENU.style.top = e.clientY + 'px'
    CONTEXT_MENU.style.display = 'flex'
    CONTEXT_MENU.focus()

    const element_index = map_project(e.clientX)

    //click on delete
    CONTEXT_MENU.children[0].onclick = () => {

        // if removing the last project
        if (PROJECTS.children.length == 2) {
            notify("at least one project has to exist")
        }
        else {
            const selected = find_selected()

            delete_project(element_index)

            //if removed selected
            if (selected == element_index) {
                PROJECTS.children[0].setAttribute("selected", "1")
                load_graph_data(GRAPHS[0])
                rename_convert_button()
                render()
            }

        }

        CONTEXT_MENU.style.display = "none"
    }

    //click on rename
    CONTEXT_MENU.children[1].onclick = () => {
        change_name(PROJECTS.children[element_index])
        CONTEXT_MENU.style.display = "none"
    }

    CONTEXT_MENU.addEventListener("focusout", () => {
        CONTEXT_MENU.style.display = "none"
    })

}


const change_name = (div) => {
    if (div.innerHTML == "<input>") return
    ACCEPT_HOTKEYS = false
    let tmp = div.innerText
    div.innerHTML = ''
    div.append(document.createElement("input"))
    div.lastChild.value = tmp
    if (tmp == "") tmp = "new graph"
    div.lastChild.focus()

    div.lastChild.onkeydown = (e) => {
        if (e.code == 'Enter') {
            let name = div.lastChild.value
            if (name == "") name = tmp
            div.innerText = name
            ACCEPT_HOTKEYS = true
        }
    }
    div.lastChild.addEventListener("focusout", () => {
        let name = div.lastChild.value
        if (name == "") name = tmp
        div.innerText = name
        ACCEPT_HOTKEYS = true
    });
}

function map_project(x) {
    x -= PROJECTS.offsetLeft
    for (let i = 0; i < PROJECTS.children.length; i++) {
        const child = PROJECTS.children[i]
        if (child.offsetLeft < x && x < child.offsetLeft + child.offsetWidth) {
            return i
        }
    }
}

function find_selected() {
    for (let i = 0; i < PROJECTS.children.length; i++) {
        if (PROJECTS.children[i].getAttribute("selected") == "1") return i
    }
}

function delete_project(project_index) {

    for (let i = project_index; i < GRAPHS.length - 1; i++) {
        GRAPHS[i] = GRAPHS[i + 1]
    }

    GRAPHS.pop()
    PROJECTS.children[project_index].remove()

}