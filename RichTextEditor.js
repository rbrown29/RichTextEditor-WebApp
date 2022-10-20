ToolButton.prototype.createImage = function (tool) {
    var image = document.createElement("img");
    image.src = "images/" + tool.image;
    image.className = "tool_button_image";
    return image;
}

ToolButton.prototype.createButton = function (tool, image) {
    var button = document.createElement("div");

    if (tool.command !== undefined) {
        button.className = "tool_button";
    } else {
        button.className = "dummy_button";
    }

    button.appendChild(image);
    if (tool.title != undefined) {
        button.title = tool.title;
    }
    return button;
}


function ToolButton(tool) {
    var image = this.createImage(tool);
    var button = this.createButton(tool, image);

    this.getButton = function () { return button };

    this.setActive = function () {
        var className = image.className;

        if (className != "active_tool_button_image") {
            image.className = "active_tool_button_image";
        }
    }

    this.setInactive = function () {
        var className = image.className;

        if (className != "tool_button_image") {
            image.className = "tool_button_image";
        }
    }
}

function EditToolButton(tool, editor) {
    var parent = new ToolButton(tool);

    var execute = function () {
        // for IE
        editor.focus();
        document.execCommand(tool.command, false, false);
        this.update();
    }

    parent.getButton().addEventListener("click", execute.bind(this));

    this.getButton = function () {
        return parent.getButton()
    };
    this.update = function () {
        if (tool.command !== undefined) {
            if (document.queryCommandState(tool.command)) {
                parent.setActive();
            } else {
                parent.setInactive();
            }
        }
    }
}

function HtmlToolButton(tool, editor) {
    var parent = new ToolButton(tool);
    var mode = "html";

    var execute = function () {
        if (mode == "html") {
            // switch to text mode
            mode = "text";
            var html = editor.innerHTML;
            editor.contentEditable = false;
            var pre = document.createElement("pre");
            pre.className = "html_text";
            // for firefox
            if (pre.innerText === undefined) {
                pre.textContent = html;
            } else {
                pre.innerText = html;
            }
            editor.innerHTML = "";
            editor.appendChild(pre);
            pre.contentEditable = true;
        } else {
            // switch to html mode
            mode = "html";
            var pre = editor.firstChild;
            var text;
            // for firefox
            if (pre.innerText === undefined) {
                text = pre.textContent;
            } else {
                text = pre.innerText;
            }
            editor.innerHTML = text;
            editor.contentEditable = true;
        }
        this.update();

    }

    parent.getButton().addEventListener("click", execute.bind(this));

    this.getButton = function () {
        return parent.getButton()
    };
    this.update = function () {

        if (mode == "text") {
            parent.setActive();
        } else {
            parent.setInactive();
        }

    }
    this.getMode = function () {
        return mode;
    }
}



function RightToolButton(tool) {
    var parent = new ToolButton(tool);

    parent.getButton().className = "right_tool_button";

    this.getButton = function () {
        return parent.getButton()
    };
}



function RichTextEditor(parent, callback) {
    var backup;

    var editButton = document.createElement("div");
    editButton.innerHTML = "[edit]";
    editButton.className = "edit_button";

    var editor = document.createElement("div");
    editor.className = "edit_box";
    editor.style.top = parent.style.top;
    editor.style.left = parent.style.left;
    editor.style.width = parent.clientWidth + "px";
    editor.style.height = parent.clientHeight + "px";


    var toolBar = document.createElement("div");
    toolBar.className = "edit_tools";

    var submitButton = new RightToolButton({ title: "Submit", command: "", image: "submit.png" }).getButton();
    var cancelButton = new RightToolButton({ title: "Cancel", command: "", image: "cancel.png" }).getButton();

    var htmlTool = new HtmlToolButton({ title: "HTML", command: "", image: "html.png"}, editor);
    var htmlButton = htmlTool.getButton();
    toolBar.appendChild(htmlButton);

    var buttons = tools.map(function (tool) {
        var tool = new EditToolButton(tool, editor);
        var button = tool.getButton();
        toolBar.appendChild(button);
        return tool;
    });

    buttons.push(htmlTool);
    toolBar.appendChild(submitButton);
    toolBar.appendChild(cancelButton);

    var edit = function () {
        backup = editor.innerHTML;
        // for IE
        if (backup == "") {
            backup = "<div></div>";
        }
        parent.replaceChild(toolBar, editButton);
        editor.style.height = parseInt(editor.style.height) - toolBar.clientHeight + "px";
        editor.contentEditable = "true";
        editor.focus();
    };

    var cancel = function () {
        editor.innerHTML = backup;
        editor.contentEditable = "false";
        editor.style.height = parent.clientHeight + "px";
        parent.replaceChild(editButton, toolBar);

    };

    var submit = function () {
        var mode = htmlTool.getMode();
        if (mode == "text") {
            htmlButton.click();
        }
        editor.contentEditable = "false";
        editor.style.height = parent.clientHeight + "px";
        parent.replaceChild(editButton, toolBar);
        callback(editor.innerHTML);
    };

    var update = function () {

        buttons.forEach(function (button) {
            button.update();
        });

    };

    editButton.addEventListener("click", edit);
    submitButton.addEventListener("click", submit);
    cancelButton.addEventListener("click", cancel);
   //htmlButton.addEventListener("click", update);
    editor.addEventListener("click", update);
    editor.addEventListener("keyup", update);
    editor.addEventListener("keydown", update);
    editor.addEventListener("keypress", update);
    editor
    parent.appendChild(editButton);
    parent.appendChild(editor);
}