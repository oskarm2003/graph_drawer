PROJECTS = document.querySelector("#projects")
CONTEXT_MENU = document.querySelector("#context_menu")

for (const tab of PROJECTS.children) {
    tab.onclick = function () { select_project_tab(this) }
    tab.oncontextmenu = function (e) { open_menu(this, e) }
}

function select_project_tab(selected) {

    let prev_selected = find_selected()

    //if click on selected
    if (selected == PROJECTS.children[prev_selected]) {
        change_name(selected)
        return
    }

    if (GRAPHS[prev_selected]) {
        save_graph_data(GRAPHS[prev_selected])
        PROJECTS.children[prev_selected].removeAttribute("selected")
    }


    if (selected.getAttribute("id") == "add_new") {

        const new_tab = document.createElement("div")
        new_tab.onclick = function () { select_project_tab(this) }
        new_tab.oncontextmenu = function (e) { open_menu(this, e) }
        PROJECTS.children[PROJECTS.children.length - 1].insertAdjacentElement("beforebegin", new_tab)

        change_name(new_tab)
        GRAPHS.push({
            vertices_pos: [],
            aliases: [],
            edge_highlight: [],
            vertex_highlight: [],
            edge_matrix: [],
            graph_type: "directed"
        })

        selected = new_tab

    }

    selected.setAttribute("selected", "1")
    load_graph_data(GRAPHS[find_selected()])
    rename_convert_button()
    render()

}


function open_menu(element, event) {

    event.preventDefault()
    CONTEXT_MENU.style.left = event.clientX + 'px'
    CONTEXT_MENU.style.top = event.clientY + 'px'
    CONTEXT_MENU.style.display = 'flex'
    // focus to assert focusout on beyond the element click
    CONTEXT_MENU.focus()

    const element_index = map_project(element)

    //click on delete
    CONTEXT_MENU.children[0].onclick = () => {

        // if removing the last project
        if (PROJECTS.children.length == 2) {
            notify("at least one project has to exist")
        }
        else {
            delete_project(element_index)

            //if removed selected
            if (find_selected() == element_index) {
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

function map_project(proj) {
    for (let i = 0; i < PROJECTS.children.length; i++) {
        if (PROJECTS.children[i] === proj)
            return i
    }
    return -1
}

function find_selected() {
    for (let i = 0; i < PROJECTS.children.length; i++) {
        if (PROJECTS.children[i].getAttribute("selected") == "1") return i
    }
}

function delete_project(project_index) {

    for (let i = project_index; i < GRAPHS.length - 1; i++)
        GRAPHS[i] = GRAPHS[i + 1]

    GRAPHS.pop()
    PROJECTS.children[project_index].remove()
    PROJECTS.children[0].click()

}


const visibility_option = document.querySelector("#visibility")
visibility_option.onclick = () => {

    const option = visibility_option.getAttribute("visible")
    const menu = document.querySelector(".menu-wrapper")
    const show_icon = (num) => {
        for (const icon of visibility_option.children)
            icon.style.display = "none"
        visibility_option.children[num].style.display = "block"
    }

    if (option == "true") {
        visibility_option.setAttribute("visible", false)
        menu.style.display = "none"
        show_icon(1)
    }
    else {
        visibility_option.setAttribute("visible", true)
        menu.style.display = "block"
        show_icon(0)
    }

}