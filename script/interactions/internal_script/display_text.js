class ScriptDisplay {
    constructor() {

        this.canvas = document.querySelector("#internal-script-display")
        this.textarea = document.querySelector("#internal-script")
        this.ctx = this.canvas.getContext("2d")

        const observer = new ResizeObserver(() => {

            // this.canvas.width = this.textarea.clientWidth
            // this.canvas.height = this.textarea.clientHeight

            const scale = 1.75
            this.canvas.width = this.textarea.clientWidth * scale
            this.canvas.height = this.textarea.clientHeight * scale
            this.ctx.scale(scale, scale)

            this.onFontUpdate()

        })

        observer.observe(this.canvas)

    }

    onFontUpdate() {

        const { fontFamily, fontSize } = window.getComputedStyle(this.textarea)
        this.ctx.font = `${fontSize} ${fontFamily}`
        this.ctx.textAlign = "left"
        this.ctx.textBaseline = "top"

        const metrics = this.ctx.measureText("hello world;")
        this.line_height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

        this.determineTabSize()
        this.calcLineGap()

    }

    determineTabSize() {

        const pre = document.createElement("pre")
        pre.style.fontFamily = this.ctx.font.split(" ")[1]
        pre.style.fontSize = this.ctx.font.split(" ")[0]
        pre.style.visibility = "hidden"
        pre.style.position = "absolute"

        document.body.append(pre)
        pre.textContent = '\t'

        this.tab_size = pre.getBoundingClientRect().width
        pre.remove()

    }

    calcLineGap() {

        const sample_text = "wqllM"

        const pre = document.createElement("pre")
        pre.style.fontFamily = this.ctx.font.split(" ")[1]
        pre.style.fontSize = this.ctx.font.split(" ")[0]
        pre.style.visibility = "hidden"
        pre.style.position = "absolute"

        document.body.append(pre)
        pre.textContent = sample_text
        const dom_size = pre.getBoundingClientRect().height

        this.line_gap = Math.max(0, dom_size - this.line_height)
        pre.remove()

    }


    displayText(text) {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // gap is used to adjust text top position to match the text in textarea
        const gap = 2
        this.vertical_margin = this.textarea.scrollTop * -1 + gap

        for (const line of text.split("\n")) {
            this.processLine(line)
            this.vertical_margin += this.line_height + this.line_gap
        }
    }

    processLine(line) {

        const words = line.split(/(".*"|'.*'|`.*`|\/\/|[{}\[\]() \t.,+-;=><!])/)
        let within_comment = false

        this.horizontal_margin = this.textarea.scrollLeft * -1

        for (const word of words) {

            if (word == "\t") {
                this.placeTab()
                continue
            }
            else if (word == "//")
                within_comment = true

            const color = within_comment ? "#8f8f8f" : this.determineColor(word)
            this.drawColored(word, color)

            const text_width = this.ctx.measureText(word).width
            this.horizontal_margin += text_width
        }
    }

    placeTab() {
        // scrollLeft is negative
        const curr_text_width = this.horizontal_margin + this.textarea.scrollLeft
        const indent = this.tab_size - (curr_text_width % this.tab_size)
        this.horizontal_margin += indent
    }

    determineColor(string) {

        const colors = {
            "string": "#e6505d",
            "number": "#f09b0a",
            "keywords": "#3d4f91",
            "controls": "#c734c0",
            "variables": "#859fff",
            "special_functions": "#2e5e43"
        }

        // is string
        if (string[0] == "\"" || string[0] == "'" || string[0] == "`")
            return colors.string


        // is number
        if (string.match(/^[0-9]+$/))
            return colors.number


        const brackets = ["{", "}", "(", ")", "[", "]"]
        if (brackets.includes(string[0]) || brackets.includes(string[string.length - 1]))
            return colors.controls


        const keywords = ["let", "var", "const", "of", "in", "true", "false"]
        if (keywords.includes(string))
            return colors.keywords


        const functions = ["getGraph", "print", "sleep", "highlightVertex", "highlightEdge", "clear"]
        if (functions.includes(string))
            return colors.special_functions


        const control = ["new", "async", "await", "function", "for", "while", "break", "continue", "return", "if", "else"]
        if (control.includes(string))
            return colors.controls


        if (string.match(/^[a-zA-z_]+$/))
            return colors.variables


        return "#1f1f1f"

    }

    drawColored(text, color) {
        this.ctx.fillStyle = color
        this.ctx.fillText(
            text,
            this.horizontal_margin,
            this.vertical_margin
        )
    }
}