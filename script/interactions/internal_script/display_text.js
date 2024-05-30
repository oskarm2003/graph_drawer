class ScriptDisplay {
    constructor() {

        this.canvas = document.querySelector("#internal-script-display")
        this.textarea = document.querySelector("#internal-script")
        this.ctx = this.canvas.getContext("2d")

        const observer = new ResizeObserver(() => {
            this.canvas.height = this.textarea.clientHeight
            this.canvas.width = this.textarea.clientWidth

            const font_size = window.getComputedStyle(this.textarea).fontSize
            this.ctx.font = `${font_size} monospace`
            this.ctx.textAlign = "left"
            this.ctx.textBaseline = "top"

            const metrics = this.ctx.measureText("hello world;")
            this.line_height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        })

        observer.observe(this.canvas)

    }

    determineTabSize() {

        const pre = document.createElement("pre")
        pre.style.fontFamily = this.ctx.font.split(" ")[1]
        pre.style.fontSize = this.ctx.font.split(" ")[0]
        pre.style.color = "#ffffff"
        pre.style.position = "absolute"

        document.body.append(pre)
        pre.textContent = '\t'

        this.tab_size = pre.getBoundingClientRect().width
        pre.remove()

    }

    displayText(text) {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.determineTabSize()

        const gap = 2
        this.vertical_margin = this.textarea.scrollTop * -1 + gap

        for (const line of text.split("\n")) {
            this.processLine(line)
            this.vertical_margin += this.line_height
        }
    }

    processLine(line) {

        const words = line.split(/(".*"|'.*'|`.*`|\/\/|[{}\[\]() \t])/)
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
        const control = ["await", "function", "for", "while", "break", "continue", "return", "if", "else"]
        if (control.includes(string))
            return "#66388a"

        const keywords = ["let", "var", "const", "of", "in"]
        if (keywords.includes(string))
            return "#3399c4"

        const brackets = ["{", "}", "(", ")", "[", "]"]
        if (brackets.includes(string[0]) || brackets.includes(string[string.length - 1]))
            return "#eb6b34"

        if (string[0] == "\"" || string[0] == "'" || string[0] == "`")
            return "#45a159"


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