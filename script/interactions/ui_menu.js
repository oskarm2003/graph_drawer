// init
const tabs = document.querySelector(".menu-tabs")
const pages = [
    document.querySelector(".buttons"),
    document.querySelector(".script-wrapper"),
    document.querySelector("#help")
]

for (const tab of tabs.children) {
    tab.onclick = function () { select(this) }
}


// functions
function unselect_all_tabs() {
    for (const tab of tabs.children)
        tab.removeAttribute("selected")
}

function select(tab) {
    switch (tab.innerText) {
        case "tools":
            show(document.querySelector(".buttons"))
            break;

        case "script":
            show(document.querySelector(".script-wrapper"))
            break

        case "help":
            show(document.querySelector("#help"))
            break

        default:
            return;
    }

    document.querySelector(".menu-wrapper").scrollTo(0, 0)
    unselect_all_tabs()
    tab.setAttribute("selected", "true")
}

function show(element) {
    for (const page of pages)
        page.style.display = "none"
    element.style.display = "flex"
}