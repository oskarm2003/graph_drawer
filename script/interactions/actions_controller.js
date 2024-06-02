class ActionController {

    constructor() {

        //settings
        this.max_depth = 25

        //functional
        this.undo_stack = []
    }

    undo() {
        if (this.undo_stack.length === 0)
            return

        const action = this.undo_stack.pop()
        action()
        render()
    }

    add_to_undo(action) {
        if (this.undo_stack.length >= this.max_depth)
            this.undo_stack.shift()

        this.undo_stack.push(action)
    }

}