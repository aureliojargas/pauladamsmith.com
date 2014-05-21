(function() {
    var canvas, ctx, requestId, font, text;
    var stopped = false;
    var state = {
        mousex: 0,
        mousey: 0,
        mousedown: false,

        hotitem: 0,
        activeitem: 0,

        kbditem: 0,
        keyentered: 0,
        keymod: 0,
        keychar: 0,

        lastwidget: 0
    };

    var K_TAB       = 0x09,
        K_ENTER     = 0x0d,
        K_ESC       = 0x1b,
        K_BACKSPACE = 0x08;

    var MOD_SHIFT   = 1 << 0,
        MOD_OPT     = 1 << 1,
        MOD_CMD     = 1 << 2,
        MOD_CTRL    = 1 << 3;

    function isAlphaNum(keyCode) {
        if ("a".charCodeAt(0) <= keyCode <= "z".charCodeAt(0) ||
            "A".charCodeAt(0) <= keyCode <= "Z".charCodeAt(0) ||
            "0".charCodeAt(0) <= keyCode <= "9".charCodeAt(0)) {
            return true;
        }
        return false
    }

    function makeref(val) {
        var oldval = val;
        return function(newval) {
            if (newval !== undefined) {
                oldval = newval;
                return;
            }
            return oldval;
        };
    }

    function regionHit(x, y, w, h) {
        if (state.mousex < x ||
            state.mousey < y ||
            state.mousex >= x + w ||
            state.mousey >= y + h) {
            return false;
        }
        return true;
    }

    function drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function button(id, x, y) {
        if (regionHit(x, y, 64, 48)) {
            state.hotitem = id;
            if (state.activeitem == 0 && state.mousedown) {
                state.activeitem = id;
            }
        }

        if (state.kbditem === 0) {
            state.kbditem = id;
        }

        if (state.kbditem == id) {
            drawRect(x-6, y-6, 84, 68, rgb(0xff0000));
        }

        drawRect(x+8, y+8, 64, 48, rgb(0));

        if (state.hotitem === id) {
            if (state.activeitem === id) {
                drawRect(x+2, y+2, 64, 48, rgb(0xffffff));
            } else {
                drawRect(x, y, 64, 48, rgb(0xffffff));
            }
        } else {
            drawRect(x, y, 64, 48, rgb(0xaaaaaa));
        }

        if (state.kbditem == id) {
            switch (state.keyentered) {
            case K_TAB:
                state.kbditem = 0;
                if (state.keymod & MOD_SHIFT) {
                    state.kbditem = state.lastwidget;
                }
                state.keyentered = 0;
                break;
            case K_ENTER: // enter
                return true;
            }
        }

        state.lastwidget = id;

        if (!state.mousedown &&
            state.hotitem === id &&
            state.activeitem === id) {
            return true;
        }
        return false;
    }

    function textfield(id, x, y, ref) {
        var string = ref();
        var len = string.length;
        var changed = false;
        if (regionHit(x-4, y-4, 30*14+8, 24+8)) {
            state.hotitem = id;
            if (state.activeitem === 0 && state.mousedown) {
                state.activeitem = id;
            }
        }
        if (state.kbditem === 0) {
            state.kbditem = id;
        }
        if (state.kbditem === id) {
            drawRect(x-6, y-6, 30*14+12, 24+12, rgb(0xff0000));
        }
        if (state.activeitem === id || state.hotitem === id) {
            drawRect(x-4, y-4, 30*14+8, 24+8, rgb(0xaaaaaa));
        } else {
            drawRect(x-4, y-4, 30*14+8, 24+8, rgb(0x777777));
        }
        drawString(string, x, y);
        if (state.kbditem === id && ((new Date().getMilliseconds() >> 8) & 1)) {
            drawString("_", x + len * 14, y);
        }
        if (state.kbditem === id) {
            switch (state.keyentered) {
            case K_TAB:
                state.kbditem = 0;
                if (state.keymod & MOD_SHIFT) {
                    state.kbditem = state.lastwidget;
                }
                state.keyentered = 0;
                break;
            case K_BACKSPACE:
                if (len > 0) {
                    len--;
                    ref(string.slice(0, len));
                    changed = true;
                }
                break;
            }
            if (state.keychar >= 32 && state.keychar < 127 && len < 30) {
                len++;
                ref(string + String.fromCharCode(state.keychar));
                changed = true;
            }
        }
        if (!state.mousedown && 
            state.hotitem === id &&
            state.activeitem === id) {
            state.kbditem = id;
        }
        state.lastwidget = id;
        return changed;
    }

    function imguiPrepare() {
        state.hotitem = 0;
    }

    function imguiFinish() {
        if (!state.mousedown) {
            state.activeitem = 0;
        } else {
            if (state.activeitem === 0) {
                state.activeitem = -1;
            }
        }

        if (state.keyentered == K_TAB) {
            state.kbditem = 0;
        }
        state.keyentered = 0;
        state.keymod = 0;
        state.keychar = 0;
    }

    function rgb(n) {
        var r = (n >> 16 & 0xff);
        var g = (n >>  8 & 0xff);
        var b = (n       & 0xff);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    function drawChar(char, x, y) {
        var sx = 0;
        var sy = (char.charCodeAt(0) - 32) * 24;
        ctx.drawImage(font, sx, sy, 14, 24, x, y, 14, 24);
    }

    function drawString(string, x, y) {
        for (var i = 0, l = string.length; i < l; i++) {
            drawChar(string.charAt(i), x + (i * 14), y);
        }
    }

    var bgcolor = 0x77;

    function render() {
        drawRect(0, 0, 640, 480, rgb(bgcolor));

        imguiPrepare();

        button(1, 50, 50);

        button(2, 150, 50);

        if (button(3, 50, 150)) {
            bgcolor = new Date().getMilliseconds() * 0xc0cac0 | 0x77;
        }

        if (button(4, 150, 150)) {
            exit();
        }

        textfield(5, 50, 250, text);

        imguiFinish();
    }

    function exit() {
        console.log("exiting");
        cancelAnimationFrame(requestId);
        stopped = true;
    }

    function eventLoop() {
        render();
        if (!stopped) {
            requestId = requestAnimationFrame(eventLoop);
        }
    };

    function imgui(userCanvas) {
        canvas = userCanvas;
        ctx = canvas.getContext("2d");
        document.addEventListener("keyup", function(event) {
            switch (event.keyCode || event.which) {
            case K_ESC:
                exit();
                break;
            }
        }, false);
        document.addEventListener("keydown", function(event) {
            state.keyentered = event.keyCode || event.which;
            if (event.shiftKey) {
                state.keymod |= MOD_SHIFT;
            }
            if (event.altKey) {
                state.keymod |= MOD_OPT;
            }
            if (event.ctrlKey) {
                state.keymod |= MOD_CTRL;
            }
            if (state.keyentered === K_TAB) {
                event.preventDefault();
            }
        }, false);
        document.addEventListener("keypress", function(event) {
            if ((event.which & 0xff80) === 0) {
                state.keychar = event.which & 0x7f;
            }
        }, false);
        canvas.addEventListener("mousemove", function(event) {
            state.mousex = event.x;
            state.mousey = event.y;
        });
        document.addEventListener("mousedown", function(event) {
            if (event.button === 0) { // left button
                state.mousedown = true;
            }
        });
        document.addEventListener("mouseup", function(event) {
            if (event.button === 0) { // left button
                state.mousedown = false;
            }
        });

        font = new Image();
        font.addEventListener("load", function() {
            requestId = requestAnimationFrame(eventLoop);
        }, false);
        font.src = "font14x24.png";

        text = makeref("Some text");
    };

    window.imgui = imgui;
}());
