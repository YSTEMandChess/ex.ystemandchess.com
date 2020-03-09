(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessDasher = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vnode_1 = require("./vnode");
var is = require("./is");
function addNS(data, children, sel) {
    data.ns = 'http://www.w3.org/2000/svg';
    if (sel !== 'foreignObject' && children !== undefined) {
        for (var i = 0; i < children.length; ++i) {
            var childData = children[i].data;
            if (childData !== undefined) {
                addNS(childData, children[i].children, children[i].sel);
            }
        }
    }
}
function h(sel, b, c) {
    var data = {}, children, text, i;
    if (c !== undefined) {
        data = b;
        if (is.array(c)) {
            children = c;
        }
        else if (is.primitive(c)) {
            text = c;
        }
        else if (c && c.sel) {
            children = [c];
        }
    }
    else if (b !== undefined) {
        if (is.array(b)) {
            children = b;
        }
        else if (is.primitive(b)) {
            text = b;
        }
        else if (b && b.sel) {
            children = [b];
        }
        else {
            data = b;
        }
    }
    if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
            if (is.primitive(children[i]))
                children[i] = vnode_1.vnode(undefined, undefined, undefined, children[i]);
        }
    }
    if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
        (sel.length === 3 || sel[3] === '.' || sel[3] === '#')) {
        addNS(data, children, sel);
    }
    return vnode_1.vnode(sel, data, children, text, undefined);
}
exports.h = h;
;
exports.default = h;

},{"./is":3,"./vnode":8}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createElement(tagName) {
    return document.createElement(tagName);
}
function createElementNS(namespaceURI, qualifiedName) {
    return document.createElementNS(namespaceURI, qualifiedName);
}
function createTextNode(text) {
    return document.createTextNode(text);
}
function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
    node.removeChild(child);
}
function appendChild(node, child) {
    node.appendChild(child);
}
function parentNode(node) {
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function tagName(elm) {
    return elm.tagName;
}
function setTextContent(node, text) {
    node.textContent = text;
}
function getTextContent(node) {
    return node.textContent;
}
function isElement(node) {
    return node.nodeType === 1;
}
function isText(node) {
    return node.nodeType === 3;
}
exports.htmlDomApi = {
    createElement: createElement,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    getTextContent: getTextContent,
    isElement: isElement,
    isText: isText,
};
exports.default = exports.htmlDomApi;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
exports.primitive = primitive;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateAttrs(oldVnode, vnode) {
    var key, elm = vnode.elm, oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs;
    if (!oldAttrs && !attrs)
        return;
    if (oldAttrs === attrs)
        return;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    // update modified attributes, add new attributes
    for (key in attrs) {
        var cur = attrs[key];
        var old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                elm.setAttribute(key, "");
            }
            else if (cur === false) {
                elm.removeAttribute(key);
            }
            else {
                elm.setAttribute(key, cur);
            }
        }
    }
    // remove removed attributes
    // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
    // the other option is to remove all attributes with value == undefined
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
}
exports.attributesModule = { create: updateAttrs, update: updateAttrs };
exports.default = exports.attributesModule;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateClass(oldVnode, vnode) {
    var cur, name, elm = vnode.elm, oldClass = oldVnode.data.class, klass = vnode.data.class;
    if (!oldClass && !klass)
        return;
    if (oldClass === klass)
        return;
    oldClass = oldClass || {};
    klass = klass || {};
    for (name in oldClass) {
        if (!klass[name]) {
            elm.classList.remove(name);
        }
    }
    for (name in klass) {
        cur = klass[name];
        if (cur !== oldClass[name]) {
            elm.classList[cur ? 'add' : 'remove'](name);
        }
    }
}
exports.classModule = { create: updateClass, update: updateClass };
exports.default = exports.classModule;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vnode_1 = require("./vnode");
var is = require("./is");
var htmldomapi_1 = require("./htmldomapi");
function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }
var emptyNode = vnode_1.default('', {}, [], undefined, undefined);
function sameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
function isVnode(vnode) {
    return vnode.sel !== undefined;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var i, map = {}, key, ch;
    for (i = beginIdx; i <= endIdx; ++i) {
        ch = children[i];
        if (ch != null) {
            key = ch.key;
            if (key !== undefined)
                map[key] = i;
        }
    }
    return map;
}
var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
var h_1 = require("./h");
exports.h = h_1.h;
var thunk_1 = require("./thunk");
exports.thunk = thunk_1.thunk;
function init(modules, domApi) {
    var i, j, cbs = {};
    var api = domApi !== undefined ? domApi : htmldomapi_1.default;
    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            var hook = modules[j][hooks[i]];
            if (hook !== undefined) {
                cbs[hooks[i]].push(hook);
            }
        }
    }
    function emptyNodeAt(elm) {
        var id = elm.id ? '#' + elm.id : '';
        var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
        return vnode_1.default(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                var parent_1 = api.parentNode(childElm);
                api.removeChild(parent_1, childElm);
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        var i, data = vnode.data;
        if (data !== undefined) {
            if (isDef(i = data.hook) && isDef(i = i.init)) {
                i(vnode);
                data = vnode.data;
            }
        }
        var children = vnode.children, sel = vnode.sel;
        if (sel !== undefined) {
            // Parse selector
            var hashIdx = sel.indexOf('#');
            var dotIdx = sel.indexOf('.', hashIdx);
            var hash = hashIdx > 0 ? hashIdx : sel.length;
            var dot = dotIdx > 0 ? dotIdx : sel.length;
            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
            var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                : api.createElement(tag);
            if (hash < dot)
                elm.setAttribute('id', sel.slice(hash + 1, dot));
            if (dotIdx > 0)
                elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);
            if (is.array(children)) {
                for (i = 0; i < children.length; ++i) {
                    var ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            else if (is.primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            i = vnode.data.hook; // Reuse variable
            if (isDef(i)) {
                if (i.create)
                    i.create(emptyNode, vnode);
                if (i.insert)
                    insertedVnodeQueue.push(vnode);
            }
        }
        else {
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            var ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        var i, j, data = vnode.data;
        if (data !== undefined) {
            if (isDef(i = data.hook) && isDef(i = i.destroy))
                i(vnode);
            for (i = 0; i < cbs.destroy.length; ++i)
                cbs.destroy[i](vnode);
            if (vnode.children !== undefined) {
                for (j = 0; j < vnode.children.length; ++j) {
                    i = vnode.children[j];
                    if (i != null && typeof i !== "string") {
                        invokeDestroyHook(i);
                    }
                }
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1)
                        cbs.remove[i_1](ch, rm);
                    if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                        i_1(ch, rm);
                    }
                    else {
                        rm();
                    }
                }
                else {
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        var oldStartIdx = 0, newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartVnode = oldCh[0];
        var oldEndVnode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartVnode = newCh[0];
        var newEndVnode = newCh[newEndIdx];
        var oldKeyToIdx;
        var idxInOld;
        var elmToMove;
        var before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    }
                    else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if (oldStartIdx > oldEndIdx) {
            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        }
        else if (newStartIdx > newEndIdx) {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var i, hook;
        if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
            i(oldVnode, vnode);
        }
        var elm = vnode.elm = oldVnode.elm;
        var oldCh = oldVnode.children;
        var ch = vnode.children;
        if (oldVnode === vnode)
            return;
        if (vnode.data !== undefined) {
            for (i = 0; i < cbs.update.length; ++i)
                cbs.update[i](oldVnode, vnode);
            i = vnode.data.hook;
            if (isDef(i) && isDef(i = i.update))
                i(oldVnode, vnode);
        }
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch)
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            }
            else if (isDef(ch)) {
                if (isDef(oldVnode.text))
                    api.setTextContent(elm, '');
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            }
            else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            else if (isDef(oldVnode.text)) {
                api.setTextContent(elm, '');
            }
        }
        else if (oldVnode.text !== vnode.text) {
            api.setTextContent(elm, vnode.text);
        }
        if (isDef(hook) && isDef(i = hook.postpatch)) {
            i(oldVnode, vnode);
        }
    }
    return function patch(oldVnode, vnode) {
        var i, elm, parent;
        var insertedVnodeQueue = [];
        for (i = 0; i < cbs.pre.length; ++i)
            cbs.pre[i]();
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        }
        else {
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            createElm(vnode, insertedVnodeQueue);
            if (parent !== null) {
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }
        for (i = 0; i < insertedVnodeQueue.length; ++i) {
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0; i < cbs.post.length; ++i)
            cbs.post[i]();
        return vnode;
    };
}
exports.init = init;

},{"./h":1,"./htmldomapi":2,"./is":3,"./thunk":7,"./vnode":8}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var h_1 = require("./h");
function copyToThunk(vnode, thunk) {
    thunk.elm = vnode.elm;
    vnode.data.fn = thunk.data.fn;
    vnode.data.args = thunk.data.args;
    thunk.data = vnode.data;
    thunk.children = vnode.children;
    thunk.text = vnode.text;
    thunk.elm = vnode.elm;
}
function init(thunk) {
    var cur = thunk.data;
    var vnode = cur.fn.apply(undefined, cur.args);
    copyToThunk(vnode, thunk);
}
function prepatch(oldVnode, thunk) {
    var i, old = oldVnode.data, cur = thunk.data;
    var oldArgs = old.args, args = cur.args;
    if (old.fn !== cur.fn || oldArgs.length !== args.length) {
        copyToThunk(cur.fn.apply(undefined, args), thunk);
        return;
    }
    for (i = 0; i < args.length; ++i) {
        if (oldArgs[i] !== args[i]) {
            copyToThunk(cur.fn.apply(undefined, args), thunk);
            return;
        }
    }
    copyToThunk(oldVnode, thunk);
}
exports.thunk = function thunk(sel, key, fn, args) {
    if (args === undefined) {
        args = fn;
        fn = key;
        key = undefined;
    }
    return h_1.h(sel, {
        key: key,
        hook: { init: init, prepatch: prepatch },
        fn: fn,
        args: args
    });
};
exports.default = exports.thunk;

},{"./h":1}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
}
exports.vnode = vnode;
exports.default = vnode;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function ctrl(data, trans, redraw, close) {
    const list = [
        { key: 'light', name: trans.noarg('light') },
        { key: 'dark', name: trans.noarg('dark') },
        { key: 'transp', name: trans.noarg('transparent') }
    ];
    return {
        list,
        trans,
        get: () => data.current,
        set(c) {
            data.current = c;
            $.post('/pref/bg', { bg: c }, reloadAllTheThings);
            applyBackground(data, list);
            redraw();
        },
        getImage: () => data.image,
        setImage(i) {
            data.image = i;
            $.post('/pref/bgImg', { bgImg: i }, reloadAllTheThings);
            applyBackground(data, list);
            redraw();
        },
        close
    };
}
exports.ctrl = ctrl;
function view(ctrl) {
    const cur = ctrl.get();
    return snabbdom_1.h('div.sub.background', [
        util_1.header(ctrl.trans.noarg('background'), ctrl.close),
        snabbdom_1.h('div.selector.large', ctrl.list.map(bg => {
            return snabbdom_1.h('a.text', {
                class: { active: cur === bg.key },
                attrs: { 'data-icon': 'E' },
                hook: util_1.bind('click', () => ctrl.set(bg.key))
            }, bg.name);
        })),
        cur === 'transp' ? imageInput(ctrl) : null
    ]);
}
exports.view = view;
function imageInput(ctrl) {
    return snabbdom_1.h('div.image', [
        snabbdom_1.h('p', ctrl.trans.noarg('backgroundImageUrl')),
        snabbdom_1.h('input', {
            attrs: {
                type: 'text',
                placeholder: 'https://',
                value: ctrl.getImage()
            },
            hook: {
                insert: vnode => {
                    $(vnode.elm).on('change keyup paste', window.lichess.debounce(function () {
                        ctrl.setImage($(this).val());
                    }, 200));
                }
            }
        })
    ]);
}
function applyBackground(data, list) {
    const key = data.current;
    $('body')
        .removeClass(list.map(b => b.key).join(' '))
        .addClass(key === 'transp' ? 'transp dark' : key);
    const prev = $('body').data('theme');
    $('body').data('theme', key);
    $('link[href*=".' + prev + '."]').each(function () {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = $(this).attr('href').replace('.' + prev + '.', '.' + key + '.');
        link.onload = () => setTimeout(() => this.remove(), 100);
        document.head.appendChild(link);
    });
    if (key === 'transp') {
        const bgData = document.getElementById('bg-data');
        bgData ? bgData.innerHTML = 'body.transp::before{background-image:url(' + data.image + ');}' :
            $('head').append('<style id="bg-data">body.transp::before{background-image:url(' + data.image + ');}</style>');
    }
}
function reloadAllTheThings() {
    if (window.Highcharts)
        window.lichess.reload();
}

},{"./util":19,"snabbdom":6}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function ctrl(data, trans, redraw, close) {
    const readZoom = () => parseInt(getComputedStyle(document.body).getPropertyValue('--zoom')) + 100;
    const saveZoom = window.lichess.debounce(() => {
        $.ajax({ method: 'post', url: '/pref/zoom?v=' + readZoom() });
    }, 1000);
    return {
        data,
        trans,
        setIs3d(v) {
            data.is3d = v;
            $.post('/pref/is3d', { is3d: v }, window.lichess.reload);
            redraw();
        },
        readZoom,
        setZoom(v) {
            document.body.setAttribute('style', '--zoom:' + (v - 100));
            window.lichess.dispatchEvent(window, 'resize');
            redraw();
            saveZoom();
        },
        close
    };
}
exports.ctrl = ctrl;
function view(ctrl) {
    const domZoom = ctrl.readZoom();
    return snabbdom_1.h('div.sub.board', [
        util_1.header(ctrl.trans.noarg('boardGeometry'), ctrl.close),
        snabbdom_1.h('div.selector.large', [
            snabbdom_1.h('a.text', {
                class: { active: !ctrl.data.is3d },
                attrs: { 'data-icon': 'E' },
                hook: util_1.bind('click', () => ctrl.setIs3d(false))
            }, '2D'),
            snabbdom_1.h('a.text', {
                class: { active: ctrl.data.is3d },
                attrs: { 'data-icon': 'E' },
                hook: util_1.bind('click', () => ctrl.setIs3d(true))
            }, '3D')
        ]),
        snabbdom_1.h('div.zoom', isNaN(domZoom) ? [
            snabbdom_1.h('p', 'No board to zoom here!')
        ] : [
            snabbdom_1.h('p', [
                ctrl.trans.noarg('boardSize'),
                ': ',
                (domZoom - 100),
                '%'
            ]),
            snabbdom_1.h('div.slider', {
                hook: { insert: vnode => makeSlider(ctrl, vnode.elm) }
            })
        ])
    ]);
}
exports.view = view;
function makeSlider(ctrl, el) {
    window.lichess.slider().done(() => {
        $(el).slider({
            orientation: 'horizontal',
            min: 100,
            max: 200,
            range: 'min',
            step: 1,
            value: ctrl.readZoom(),
            slide: (_, ui) => ctrl.setZoom(ui.value)
        });
    });
}

},{"./util":19,"snabbdom":6}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ping_1 = require("./ping");
const langs_1 = require("./langs");
const sound_1 = require("./sound");
const background_1 = require("./background");
const board_1 = require("./board");
const theme_1 = require("./theme");
const piece_1 = require("./piece");
const util_1 = require("./util");
const defaultMode = 'links';
function makeCtrl(opts, data, redraw) {
    const trans = window.lichess.trans(data.i18n);
    let mode = util_1.prop(defaultMode);
    function setMode(m) {
        mode(m);
        redraw();
    }
    function close() { setMode(defaultMode); }
    const ping = ping_1.ctrl(trans, redraw);
    const subs = {
        langs: langs_1.ctrl(data.lang, trans, redraw, close),
        sound: sound_1.ctrl(data.sound.list, trans, redraw, close),
        background: background_1.ctrl(data.background, trans, redraw, close),
        board: board_1.ctrl(data.board, trans, redraw, close),
        theme: theme_1.ctrl(data.theme, trans, () => data.board.is3d ? 'd3' : 'd2', redraw, setMode),
        piece: piece_1.ctrl(data.piece, trans, () => data.board.is3d ? 'd3' : 'd2', redraw, setMode)
    };
    window.lichess.pubsub.on('top.toggle.user_tag', () => setMode(defaultMode));
    return {
        mode,
        setMode,
        data,
        trans,
        ping,
        subs,
        opts
    };
}
exports.makeCtrl = makeCtrl;
;

},{"./background":9,"./board":10,"./langs":12,"./piece":15,"./ping":16,"./sound":17,"./theme":18,"./util":19}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
const xhr_1 = require("./xhr");
function ctrl(data, trans, redraw, close) {
    let list;
    return {
        data,
        list: () => list,
        load() {
            xhr_1.get(window.lichess.assetUrl('trans/refs.json'), true).then(d => {
                const accs = [];
                const others = [];
                d.forEach((l) => {
                    if (data.accepted.includes(l[0]))
                        accs.push(l);
                    else
                        others.push(l);
                });
                list = accs.concat(others);
                redraw();
            });
        },
        trans,
        close
    };
}
exports.ctrl = ctrl;
function view(ctrl) {
    const list = ctrl.list();
    if (!list)
        ctrl.load();
    return snabbdom_1.h('div.sub.langs', [
        util_1.header(ctrl.trans.noarg('language'), ctrl.close),
        list ? snabbdom_1.h('form', {
            attrs: { method: 'post', action: '/translation/select' }
        }, langLinks(ctrl, list)) : util_1.spinner()
    ]);
}
exports.view = view;
function langLinks(ctrl, list) {
    const links = list.map(langView(ctrl.data.current, ctrl.data.accepted));
    links.push(snabbdom_1.h('a', {
        attrs: { href: 'https://crowdin.com/project/lichess' }
    }, 'Help translate lichess'));
    return links;
}
function langView(current, accepted) {
    return (l) => snabbdom_1.h('button' + (current === l[0] ? '.current' : '') + (accepted.includes(l[0]) ? '.accepted' : ''), {
        attrs: {
            type: 'submit',
            name: 'lang',
            value: l[0],
            title: l[0]
        },
    }, l[1]);
}

},{"./util":19,"./xhr":21,"snabbdom":6}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const ping_1 = require("./ping");
const util_1 = require("./util");
function default_1(ctrl) {
    const d = ctrl.data, trans = ctrl.trans, noarg = trans.noarg;
    function userLinks() {
        return d.user ? snabbdom_1.h('div.links', [
            snabbdom_1.h('a.user-link.online.text.is-green', linkCfg(`/@/${d.user.name}`, d.user.patron ? '' : ''), noarg('profile')),
            d.inbox ? snabbdom_1.h('a.text', linkCfg('/inbox', 'e'), noarg('inbox')) : null,
            snabbdom_1.h('a.text', linkCfg('/account/preferences/game-display', '%', ctrl.opts.playing ? { target: '_blank' } : undefined), noarg('preferences')),
            !d.coach ? null : snabbdom_1.h('a.text', linkCfg('/coach/edit', ':'), 'Coach manager'),
            !d.streamer ? null : snabbdom_1.h('a.text', linkCfg('/streamer/edit', ''), 'Streamer manager'),
            snabbdom_1.h('form.logout', {
                attrs: { method: 'post', action: '/logout' }
            }, [
                snabbdom_1.h('button.text', {
                    attrs: {
                        type: 'submit',
                        'data-icon': 'w'
                    }
                }, noarg('logOut'))
            ])
        ]) : null;
    }
    const langs = snabbdom_1.h('a.sub', modeCfg(ctrl, 'langs'), noarg('language'));
    const sound = snabbdom_1.h('a.sub', modeCfg(ctrl, 'sound'), noarg('sound'));
    const background = snabbdom_1.h('a.sub', modeCfg(ctrl, 'background'), noarg('background'));
    const board = snabbdom_1.h('a.sub', modeCfg(ctrl, 'board'), noarg('boardGeometry'));
    const theme = snabbdom_1.h('a.sub', modeCfg(ctrl, 'theme'), noarg('boardTheme'));
    const piece = snabbdom_1.h('a.sub', modeCfg(ctrl, 'piece'), noarg('pieceSet'));
    const zenToggle = ctrl.opts.playing ? snabbdom_1.h('div.zen.selector', [
        snabbdom_1.h('a.text', {
            attrs: {
                'data-icon': 'K',
                title: 'Keyboard: z'
            },
            hook: util_1.bind('click', () => window.lichess.pubsub.emit('zen'))
        }, noarg('zenMode'))
    ]) : null;
    return snabbdom_1.h('div', [
        userLinks(),
        snabbdom_1.h('div.subs', [
            langs,
            sound,
            background,
            board,
            theme,
            piece,
            zenToggle
        ]),
        ping_1.view(ctrl.ping)
    ]);
}
exports.default = default_1;
function linkCfg(href, icon, more = undefined) {
    const cfg = {
        attrs: {
            href,
            'data-icon': icon
        }
    };
    if (more)
        for (let i in more)
            cfg.attrs[i] = more[i];
    return cfg;
}
function modeCfg(ctrl, m) {
    return {
        hook: util_1.bind('click', () => ctrl.setMode(m)),
        attrs: { 'data-icon': 'H' }
    };
}

},{"./ping":16,"./util":19,"snabbdom":6}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dasher_1 = require("./dasher");
const view_1 = require("./view");
const xhr_1 = require("./xhr");
const snabbdom_1 = require("snabbdom");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
function LichessDasher(element, opts) {
    let vnode, ctrl;
    const redraw = () => {
        vnode = patch(vnode || element, ctrl ? view_1.loaded(ctrl) : view_1.loading());
    };
    redraw();
    return xhr_1.get('/dasher').then(data => {
        ctrl = dasher_1.makeCtrl(opts, data, redraw);
        redraw();
        return ctrl;
    });
}
exports.default = LichessDasher;
;

},{"./dasher":11,"./view":20,"./xhr":21,"snabbdom":6,"snabbdom/modules/attributes":4,"snabbdom/modules/class":5}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function ctrl(data, trans, dimension, redraw, open) {
    function dimensionData() {
        return data[dimension()];
    }
    return {
        dimension,
        trans,
        data: dimensionData,
        set(t) {
            const d = dimensionData();
            d.current = t;
            applyPiece(t, d.list, dimension() === 'd3');
            $.post('/pref/pieceSet' + (dimension() === 'd3' ? '3d' : ''), {
                set: t
            });
            redraw();
        },
        open
    };
}
exports.ctrl = ctrl;
function view(ctrl) {
    const d = ctrl.data();
    return snabbdom_1.h('div.sub.piece.' + ctrl.dimension(), [
        util_1.header(ctrl.trans.noarg('pieceSet'), () => ctrl.open('links')),
        snabbdom_1.h('div.list', d.list.map(pieceView(d.current, ctrl.set, ctrl.dimension() == 'd3')))
    ]);
}
exports.view = view;
function pieceImage(t, is3d) {
    if (is3d) {
        const preview = t == 'Staunton' ? '-Preview' : '';
        return `images/staunton/piece/${t}/White-Knight${preview}.png`;
    }
    return `piece/${t}/wN.svg`;
}
function pieceView(current, set, is3d) {
    return (t) => snabbdom_1.h('a.no-square', {
        attrs: { title: t },
        hook: util_1.bind('click', () => set(t)),
        class: { active: current === t }
    }, [
        snabbdom_1.h('piece', {
            attrs: { style: `background-image:url(${window.lichess.assetUrl(pieceImage(t, is3d))})` }
        })
    ]);
}
function applyPiece(t, list, is3d) {
    if (is3d) {
        $('body').removeClass(list.join(' ')).addClass(t);
    }
    else {
        const sprite = $('#piece-sprite');
        sprite.attr('href', sprite.attr('href').replace(/\w+\.css/, t + '.css'));
    }
}

},{"./util":19,"snabbdom":6}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function ctrl(trans, redraw) {
    const data = {
        ping: undefined,
        server: undefined
    };
    const hub = window.lichess.pubsub;
    hub.emit('socket.send', 'moveLat', true);
    hub.on('socket.lag', lag => {
        data.ping = Math.round(lag);
        redraw();
    });
    hub.on('socket.in.mlat', lat => {
        data.server = lat;
        redraw();
    });
    return { data, trans };
}
exports.ctrl = ctrl;
function signalBars(d) {
    const lagRating = !d.ping ? 0 :
        (d.ping < 150) ? 4 :
            (d.ping < 300) ? 3 :
                (d.ping < 500) ? 2 : 1;
    const bars = [];
    for (let i = 1; i <= 4; i++)
        bars.push(snabbdom_1.h(i <= lagRating ? 'i' : 'i.off'));
    return snabbdom_1.h('signal.q' + lagRating, bars);
}
function showMillis(m) {
    return [
        '' + Math.floor(m),
        snabbdom_1.h('small', '.' + Math.round((m - Math.floor(m)) * 10))
    ];
}
function view(ctrl) {
    const d = ctrl.data;
    return snabbdom_1.h('a.status', { attrs: { href: '/lag' } }, [
        signalBars(d),
        snabbdom_1.h('span.ping', {
            attrs: { title: 'PING: ' + ctrl.trans.noarg('networkLagBetweenYouAndLichess') }
        }, [
            snabbdom_1.h('em', 'PING'),
            snabbdom_1.h('strong', util_1.defined(d.ping) ? '' + d.ping : '?'),
            snabbdom_1.h('em', 'ms')
        ]),
        snabbdom_1.h('span.server', {
            attrs: { title: 'SERVER: ' + ctrl.trans.noarg('timeToProcessAMoveOnLichessServer') }
        }, [
            snabbdom_1.h('em', 'SERVER'),
            snabbdom_1.h('strong', util_1.defined(d.server) ? showMillis(d.server) : ['?']),
            snabbdom_1.h('em', 'ms')
        ])
    ]);
}
exports.view = view;

},{"./util":19,"snabbdom":6}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function ctrl(raw, trans, redraw, close) {
    const list = raw.map(s => s.split(' '));
    const api = window.lichess.sound;
    return {
        makeList() {
            const canSpeech = window.speechSynthesis && window.speechSynthesis.getVoices().length;
            return list.filter(s => s[0] != 'speech' || canSpeech);
        },
        api,
        set(k) {
            api.speech(k == 'speech');
            window.lichess.pubsub.emit('speech.enabled', api.speech());
            if (api.speech())
                api.say('Speech synthesis ready');
            else {
                api.changeSet(k);
                api.genericNotify();
                $.post('/pref/soundSet', { set: k });
            }
            redraw();
        },
        volume(v) {
            api.setVolume(v);
            // plays a move sound if speech is off
            api.move('knight F 7');
        },
        redraw,
        trans,
        close
    };
}
exports.ctrl = ctrl;
function view(ctrl) {
    const current = ctrl.api.speech() ? 'speech' : ctrl.api.set();
    return snabbdom_1.h('div.sub.sound.' + ctrl.api.set(), {
        hook: {
            insert() {
                window.speechSynthesis.onvoiceschanged = ctrl.redraw;
            }
        }
    }, [
        util_1.header(ctrl.trans('sound'), ctrl.close),
        snabbdom_1.h('div.content', [
            snabbdom_1.h('div.slider', { hook: { insert: vn => makeSlider(ctrl, vn) } }),
            snabbdom_1.h('div.selector', {
                attrs: { method: 'post', action: '/pref/soundSet' }
            }, ctrl.makeList().map(soundView(ctrl, current)))
        ])
    ]);
}
exports.view = view;
function makeSlider(ctrl, vnode) {
    const setVolume = window.lichess.debounce(ctrl.volume, 50);
    window.lichess.slider().done(() => {
        $(vnode.elm).slider({
            orientation: 'vertical',
            min: 0,
            max: 1,
            range: 'min',
            step: 0.01,
            value: ctrl.api.getVolume(),
            slide: (_, ui) => setVolume(ui.value)
        });
    });
}
function soundView(ctrl, current) {
    return (s) => snabbdom_1.h('a.text', {
        hook: util_1.bind('click', () => ctrl.set(s[0])),
        class: { active: current === s[0] },
        attrs: { 'data-icon': 'E' }
    }, s[1]);
}

},{"./util":19,"snabbdom":6}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function ctrl(data, trans, dimension, redraw, open) {
    function dimensionData() {
        return data[dimension()];
    }
    return {
        dimension,
        trans,
        data: dimensionData,
        set(t) {
            const d = dimensionData();
            d.current = t;
            applyTheme(t, d.list);
            $.post('/pref/theme' + (dimension() === 'd3' ? '3d' : ''), {
                theme: t
            });
            redraw();
        },
        open
    };
}
exports.ctrl = ctrl;
function view(ctrl) {
    const d = ctrl.data();
    return snabbdom_1.h('div.sub.theme.' + ctrl.dimension(), [
        util_1.header(ctrl.trans.noarg('boardTheme'), () => ctrl.open('links')),
        snabbdom_1.h('div.list', d.list.map(themeView(d.current, ctrl.set)))
    ]);
}
exports.view = view;
function themeView(current, set) {
    return (t) => snabbdom_1.h('a', {
        hook: util_1.bind('click', () => set(t)),
        attrs: { title: t },
        class: { active: current === t }
    }, [
        snabbdom_1.h('span.' + t)
    ]);
}
function applyTheme(t, list) {
    $('body').removeClass(list.join(' ')).addClass(t);
}

},{"./util":19,"snabbdom":6}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
function defined(v) {
    return typeof v !== 'undefined';
}
exports.defined = defined;
// like mithril prop but with type safety
function prop(initialValue) {
    let value = initialValue;
    const fun = function (v) {
        if (typeof v !== 'undefined')
            value = v;
        return value;
    };
    return fun;
}
exports.prop = prop;
function bind(eventName, f, redraw = undefined) {
    return {
        insert: (vnode) => {
            vnode.elm.addEventListener(eventName, e => {
                e.stopPropagation();
                f(e);
                if (redraw)
                    redraw();
                return false;
            });
        }
    };
}
exports.bind = bind;
function header(name, close) {
    return snabbdom_1.h('a.head.text', {
        attrs: { 'data-icon': 'I' },
        hook: bind('click', close)
    }, name);
}
exports.header = header;
function spinner() {
    return snabbdom_1.h('div.spinner', [
        snabbdom_1.h('svg', { attrs: { viewBox: '0 0 40 40' } }, [
            snabbdom_1.h('circle', {
                attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
            })
        ])
    ]);
}
exports.spinner = spinner;

},{"snabbdom":6}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const links_1 = require("./links");
const langs_1 = require("./langs");
const sound_1 = require("./sound");
const background_1 = require("./background");
const board_1 = require("./board");
const theme_1 = require("./theme");
const piece_1 = require("./piece");
const util_1 = require("./util");
function loading() {
    return snabbdom_1.h('div#dasher_app.dropdown', snabbdom_1.h('div.initiating', util_1.spinner()));
}
exports.loading = loading;
function loaded(ctrl) {
    let content;
    switch (ctrl.mode()) {
        case 'langs':
            content = langs_1.view(ctrl.subs.langs);
            break;
        case 'sound':
            content = sound_1.view(ctrl.subs.sound);
            break;
        case 'background':
            content = background_1.view(ctrl.subs.background);
            break;
        case 'board':
            content = board_1.view(ctrl.subs.board);
            break;
        case 'theme':
            content = theme_1.view(ctrl.subs.theme);
            break;
        case 'piece':
            content = piece_1.view(ctrl.subs.piece);
            break;
        default:
            content = links_1.default(ctrl);
    }
    return snabbdom_1.h('div#dasher_app.dropdown', content);
}
exports.loaded = loaded;

},{"./background":9,"./board":10,"./langs":12,"./links":13,"./piece":15,"./sound":17,"./theme":18,"./util":19,"snabbdom":6}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const headers = {
    'Accept': 'application/vnd.lichess.v4+json'
};
function get(url, cache = false) {
    return $.ajax({
        url,
        headers,
        cache
    });
}
exports.get = get;

},{}]},{},[14])(14)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3RodW5rLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3Zub2RlLmpzIiwic3JjL2JhY2tncm91bmQudHMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZGFzaGVyLnRzIiwic3JjL2xhbmdzLnRzIiwic3JjL2xpbmtzLnRzIiwic3JjL21haW4udHMiLCJzcmMvcGllY2UudHMiLCJzcmMvcGluZy50cyIsInNyYy9zb3VuZC50cyIsInNyYy90aGVtZS50cyIsInNyYy91dGlsLnRzIiwic3JjL3ZpZXcudHMiLCJzcmMveGhyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFpQixLQUFLO0lBQ3JELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNaLEdBQUc7UUFDSCxPQUFPO1FBQ1AsS0FBSztLQUNOLENBQUMsQ0FBQztBQUNMLENBQUM7QUFORCxrQkFNQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuZnVuY3Rpb24gYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCkge1xuICAgIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICAgIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZERhdGEgPSBjaGlsZHJlbltpXS5kYXRhO1xuICAgICAgICAgICAgaWYgKGNoaWxkRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWRkTlMoY2hpbGREYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGgoc2VsLCBiLCBjKSB7XG4gICAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhID0gYjtcbiAgICAgICAgaWYgKGlzLmFycmF5KGMpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjICYmIGMuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtjXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzLmFycmF5KGIpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiICYmIGIuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtiXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSlcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IHZub2RlXzEudm5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxbMF0gPT09ICdzJyAmJiBzZWxbMV0gPT09ICd2JyAmJiBzZWxbMl0gPT09ICdnJyAmJlxuICAgICAgICAoc2VsLmxlbmd0aCA9PT0gMyB8fCBzZWxbM10gPT09ICcuJyB8fCBzZWxbM10gPT09ICcjJykpIHtcbiAgICAgICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZV8xLnZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59XG5leHBvcnRzLmggPSBoO1xuO1xuZXhwb3J0cy5kZWZhdWx0ID0gaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xufVxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpIHtcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCkge1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuZnVuY3Rpb24gcGFyZW50Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cbmZ1bmN0aW9uIHRhZ05hbWUoZWxtKSB7XG4gICAgcmV0dXJuIGVsbS50YWdOYW1lO1xufVxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCkge1xuICAgIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRleHRDb250ZW50O1xufVxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cbmZ1bmN0aW9uIGlzVGV4dChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5leHBvcnRzLmh0bWxEb21BcGkgPSB7XG4gICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgICBjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcbiAgICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBnZXRUZXh0Q29udGVudDogZ2V0VGV4dENvbnRlbnQsXG4gICAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gICAgaXNUZXh0OiBpc1RleHQsXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5odG1sRG9tQXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbGRvbWFwaS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYXJyYXkgPSBBcnJheS5pc0FycmF5O1xuZnVuY3Rpb24gcHJpbWl0aXZlKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMucHJpbWl0aXZlID0gcHJpbWl0aXZlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIga2V5LCBlbG0gPSB2bm9kZS5lbG0sIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzO1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgdmFyIGN1ciA9IGF0dHJzW2tleV07XG4gICAgICAgIHZhciBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgICAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgICAgICAgIGlmIChjdXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZShrZXksIGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdpZCcsIHNlbC5zbGljZShoYXNoICsgMSwgZG90KSk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdjbGFzcycsIHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAob2xkQXJnc1tpXSAhPT0gYXJnc1tpXSkge1xuICAgICAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5VG9UaHVuayhvbGRWbm9kZSwgdGh1bmspO1xufVxuZXhwb3J0cy50aHVuayA9IGZ1bmN0aW9uIHRodW5rKHNlbCwga2V5LCBmbiwgYXJncykge1xuICAgIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncyA9IGZuO1xuICAgICAgICBmbiA9IGtleTtcbiAgICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaF8xLmgoc2VsLCB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBob29rOiB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCB9LFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnRodW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGh1bmsuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB2bm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gICAgcmV0dXJuIHsgc2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5IH07XG59XG5leHBvcnRzLnZub2RlID0gdm5vZGU7XG5leHBvcnRzLmRlZmF1bHQgPSB2bm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZub2RlLmpzLm1hcCIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5cbmltcG9ydCB7IFJlZHJhdywgQ2xvc2UsIGJpbmQsIGhlYWRlciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGludGVyZmFjZSBCYWNrZ3JvdW5kQ3RybCB7XG4gIGxpc3Q6IEJhY2tncm91bmRbXVxuICBzZXQoazogc3RyaW5nKTogdm9pZFxuICAgIGdldCgpOiBzdHJpbmdcbiAgZ2V0SW1hZ2UoKTogc3RyaW5nXG4gIHNldEltYWdlKGk6IHN0cmluZyk6IHZvaWRcbiAgICB0cmFuczogVHJhbnNcbiAgY2xvc2U6IENsb3NlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFja2dyb3VuZERhdGEge1xuICBjdXJyZW50OiBzdHJpbmdcbiAgaW1hZ2U6IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgQmFja2dyb3VuZCB7XG4gIGtleTogc3RyaW5nXG4gIG5hbWU6IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3RybChkYXRhOiBCYWNrZ3JvdW5kRGF0YSwgdHJhbnM6IFRyYW5zLCByZWRyYXc6IFJlZHJhdywgY2xvc2U6IENsb3NlKTogQmFja2dyb3VuZEN0cmwge1xuXG4gIGNvbnN0IGxpc3Q6IEJhY2tncm91bmRbXSA9IFtcbiAgICB7IGtleTogJ2xpZ2h0JywgbmFtZTogdHJhbnMubm9hcmcoJ2xpZ2h0JykgfSxcbiAgICB7IGtleTogJ2RhcmsnLCBuYW1lOiB0cmFucy5ub2FyZygnZGFyaycpIH0sXG4gICAgeyBrZXk6ICd0cmFuc3AnLCBuYW1lOiB0cmFucy5ub2FyZygndHJhbnNwYXJlbnQnKSB9XG4gIF07XG5cbiAgcmV0dXJuIHtcbiAgICBsaXN0LFxuICAgIHRyYW5zLFxuICAgIGdldDogKCkgPT4gZGF0YS5jdXJyZW50LFxuICAgIHNldChjOiBzdHJpbmcpIHtcbiAgICAgIGRhdGEuY3VycmVudCA9IGM7XG4gICAgICAkLnBvc3QoJy9wcmVmL2JnJywgeyBiZzogYyB9LCByZWxvYWRBbGxUaGVUaGluZ3MpO1xuICAgICAgYXBwbHlCYWNrZ3JvdW5kKGRhdGEsIGxpc3QpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSxcbiAgICBnZXRJbWFnZTogKCkgPT4gZGF0YS5pbWFnZSxcbiAgICBzZXRJbWFnZShpOiBzdHJpbmcpIHtcbiAgICAgIGRhdGEuaW1hZ2UgPSBpO1xuICAgICAgJC5wb3N0KCcvcHJlZi9iZ0ltZycsIHsgYmdJbWc6IGkgfSwgcmVsb2FkQWxsVGhlVGhpbmdzKTtcbiAgICAgIGFwcGx5QmFja2dyb3VuZChkYXRhLCBsaXN0KTtcbiAgICAgIHJlZHJhdygpO1xuICAgIH0sXG4gICAgY2xvc2VcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpZXcoY3RybDogQmFja2dyb3VuZEN0cmwpOiBWTm9kZSB7XG5cbiAgY29uc3QgY3VyID0gY3RybC5nZXQoKTtcblxuICByZXR1cm4gaCgnZGl2LnN1Yi5iYWNrZ3JvdW5kJywgW1xuICAgIGhlYWRlcihjdHJsLnRyYW5zLm5vYXJnKCdiYWNrZ3JvdW5kJyksIGN0cmwuY2xvc2UpLFxuICAgIGgoJ2Rpdi5zZWxlY3Rvci5sYXJnZScsIGN0cmwubGlzdC5tYXAoYmcgPT4ge1xuICAgICAgcmV0dXJuIGgoJ2EudGV4dCcsIHtcbiAgICAgICAgY2xhc3M6IHsgYWN0aXZlOiBjdXIgPT09IGJnLmtleSB9LFxuICAgICAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ0UnIH0sXG4gICAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgKCkgPT4gY3RybC5zZXQoYmcua2V5KSlcbiAgICAgIH0sIGJnLm5hbWUpO1xuICAgIH0pKSxcbiAgICBjdXIgPT09ICd0cmFuc3AnID8gaW1hZ2VJbnB1dChjdHJsKSA6IG51bGxcbiAgXSlcbn1cblxuZnVuY3Rpb24gaW1hZ2VJbnB1dChjdHJsOiBCYWNrZ3JvdW5kQ3RybCkge1xuICByZXR1cm4gaCgnZGl2LmltYWdlJywgW1xuICAgIGgoJ3AnLCBjdHJsLnRyYW5zLm5vYXJnKCdiYWNrZ3JvdW5kSW1hZ2VVcmwnKSksXG4gICAgaCgnaW5wdXQnLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnaHR0cHM6Ly8nLFxuICAgICAgICB2YWx1ZTogY3RybC5nZXRJbWFnZSgpXG4gICAgICB9LFxuICAgICAgaG9vazoge1xuICAgICAgICBpbnNlcnQ6IHZub2RlID0+IHtcbiAgICAgICAgICAkKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZScsIHdpbmRvdy5saWNoZXNzLmRlYm91bmNlKGZ1bmN0aW9uKHRoaXM6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBjdHJsLnNldEltYWdlKCQodGhpcykudmFsKCkpO1xuICAgICAgICAgIH0sIDIwMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5QmFja2dyb3VuZChkYXRhOiBCYWNrZ3JvdW5kRGF0YSwgbGlzdDogQmFja2dyb3VuZFtdKSB7XG5cbiAgY29uc3Qga2V5ID0gZGF0YS5jdXJyZW50O1xuXG4gICQoJ2JvZHknKVxuICAgIC5yZW1vdmVDbGFzcyhsaXN0Lm1hcChiID0+IGIua2V5KS5qb2luKCcgJykpXG4gICAgLmFkZENsYXNzKGtleSA9PT0gJ3RyYW5zcCcgPyAndHJhbnNwIGRhcmsnIDoga2V5KTtcblxuICBjb25zdCBwcmV2ID0gJCgnYm9keScpLmRhdGEoJ3RoZW1lJyk7XG4gICQoJ2JvZHknKS5kYXRhKCd0aGVtZScsIGtleSk7XG4gICQoJ2xpbmtbaHJlZio9XCIuJyArIHByZXYgKyAnLlwiXScpLmVhY2goZnVuY3Rpb24odGhpczogSFRNTEVsZW1lbnQpIHtcbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICBsaW5rLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgIGxpbmsuaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpLnJlcGxhY2UoJy4nICsgcHJldiArICcuJywgJy4nICsga2V5ICsgJy4nKTtcbiAgICBsaW5rLm9ubG9hZCA9ICgpID0+IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZW1vdmUoKSwgMTAwKTtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICB9KTtcblxuICBpZiAoa2V5ID09PSAndHJhbnNwJykge1xuICAgIGNvbnN0IGJnRGF0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiZy1kYXRhJyk7XG4gICAgYmdEYXRhID8gYmdEYXRhLmlubmVySFRNTCA9ICdib2R5LnRyYW5zcDo6YmVmb3Jle2JhY2tncm91bmQtaW1hZ2U6dXJsKCcgKyBkYXRhLmltYWdlICsgJyk7fScgOlxuICAgICAgJCgnaGVhZCcpLmFwcGVuZCgnPHN0eWxlIGlkPVwiYmctZGF0YVwiPmJvZHkudHJhbnNwOjpiZWZvcmV7YmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIGRhdGEuaW1hZ2UgKyAnKTt9PC9zdHlsZT4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWxvYWRBbGxUaGVUaGluZ3MoKSB7XG4gIGlmICh3aW5kb3cuSGlnaGNoYXJ0cykgd2luZG93LmxpY2hlc3MucmVsb2FkKCk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuXG5pbXBvcnQgeyBSZWRyYXcsIENsb3NlLCBiaW5kLCBoZWFkZXIgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBpbnRlcmZhY2UgQm9hcmRDdHJsIHtcbiAgZGF0YTogQm9hcmREYXRhXG4gIHRyYW5zOiBUcmFuc1xuICBzZXRJczNkKHY6IGJvb2xlYW4pOiB2b2lkO1xuICByZWFkWm9vbSgpOiBudW1iZXI7XG4gIHNldFpvb20odjogbnVtYmVyKTogdm9pZDtcbiAgY2xvc2UoKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCb2FyZERhdGEge1xuICBpczNkOiBib29sZWFuXG59XG5cbmV4cG9ydCB0eXBlIFB1Ymxpc2hab29tID0gKHY6IG51bWJlcikgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGN0cmwoZGF0YTogQm9hcmREYXRhLCB0cmFuczogVHJhbnMsIHJlZHJhdzogUmVkcmF3LCBjbG9zZTogQ2xvc2UpOiBCb2FyZEN0cmwge1xuXG4gIGNvbnN0IHJlYWRab29tID0gKCkgPT4gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5nZXRQcm9wZXJ0eVZhbHVlKCctLXpvb20nKSkgKyAxMDA7XG5cbiAgY29uc3Qgc2F2ZVpvb20gPSB3aW5kb3cubGljaGVzcy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgJC5hamF4KHsgbWV0aG9kOiAncG9zdCcsIHVybDogJy9wcmVmL3pvb20/dj0nICsgcmVhZFpvb20oKSB9KTtcbiAgfSwgMTAwMCk7XG5cbiAgcmV0dXJuIHtcbiAgICBkYXRhLFxuICAgIHRyYW5zLFxuICAgIHNldElzM2QodjogYm9vbGVhbikge1xuICAgICAgZGF0YS5pczNkID0gdjtcbiAgICAgICQucG9zdCgnL3ByZWYvaXMzZCcsIHsgaXMzZDogdiB9LCB3aW5kb3cubGljaGVzcy5yZWxvYWQpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSxcbiAgICByZWFkWm9vbSxcbiAgICBzZXRab29tKHY6IG51bWJlcikge1xuICAgICAgZG9jdW1lbnQuYm9keS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJy0tem9vbTonICsgKHYgLSAxMDApKTtcbiAgICAgIHdpbmRvdy5saWNoZXNzLmRpc3BhdGNoRXZlbnQod2luZG93LCAncmVzaXplJyk7XG4gICAgICByZWRyYXcoKTtcbiAgICAgIHNhdmVab29tKCk7XG4gICAgfSxcbiAgICBjbG9zZVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlldyhjdHJsOiBCb2FyZEN0cmwpOiBWTm9kZSB7XG5cbiAgY29uc3QgZG9tWm9vbSA9IGN0cmwucmVhZFpvb20oKTtcblxuICByZXR1cm4gaCgnZGl2LnN1Yi5ib2FyZCcsIFtcbiAgICBoZWFkZXIoY3RybC50cmFucy5ub2FyZygnYm9hcmRHZW9tZXRyeScpLCBjdHJsLmNsb3NlKSxcbiAgICBoKCdkaXYuc2VsZWN0b3IubGFyZ2UnLCBbXG4gICAgICBoKCdhLnRleHQnLCB7XG4gICAgICAgIGNsYXNzOiB7IGFjdGl2ZTogIWN0cmwuZGF0YS5pczNkIH0sXG4gICAgICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiAnRScgfSxcbiAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnNldElzM2QoZmFsc2UpKVxuICAgICAgfSwgJzJEJyksXG4gICAgICBoKCdhLnRleHQnLCB7XG4gICAgICAgIGNsYXNzOiB7IGFjdGl2ZTogY3RybC5kYXRhLmlzM2QgfSxcbiAgICAgICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6ICdFJyB9LFxuICAgICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwuc2V0SXMzZCh0cnVlKSlcbiAgICAgIH0sICczRCcpXG4gICAgXSksXG4gICAgaCgnZGl2Lnpvb20nLFxuICAgICAgaXNOYU4oZG9tWm9vbSkgPyBbXG4gICAgICAgIGgoJ3AnLCAnTm8gYm9hcmQgdG8gem9vbSBoZXJlIScpXG4gICAgICBdIDogW1xuICAgICAgICBoKCdwJywgW1xuICAgICAgICAgIGN0cmwudHJhbnMubm9hcmcoJ2JvYXJkU2l6ZScpLFxuICAgICAgICAgICc6ICcsXG4gICAgICAgICAgKGRvbVpvb20gLSAxMDApLFxuICAgICAgICAgICclJ1xuICAgICAgICBdKSxcbiAgICAgICAgaCgnZGl2LnNsaWRlcicsIHtcbiAgICAgICAgICBob29rOiB7IGluc2VydDogdm5vZGUgPT4gbWFrZVNsaWRlcihjdHJsLCB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpIH1cbiAgICAgICAgfSlcbiAgICAgIF0pXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBtYWtlU2xpZGVyKGN0cmw6IEJvYXJkQ3RybCwgZWw6IEhUTUxFbGVtZW50KSB7XG4gIHdpbmRvdy5saWNoZXNzLnNsaWRlcigpLmRvbmUoKCkgPT4ge1xuICAgICQoZWwpLnNsaWRlcih7XG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgICAgbWluOiAxMDAsXG4gICAgICBtYXg6IDIwMCxcbiAgICAgIHJhbmdlOiAnbWluJyxcbiAgICAgIHN0ZXA6IDEsXG4gICAgICB2YWx1ZTogY3RybC5yZWFkWm9vbSgpLFxuICAgICAgc2xpZGU6IChfOiBhbnksIHVpOiBhbnkpID0+IGN0cmwuc2V0Wm9vbSh1aS52YWx1ZSlcbiAgICB9KTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgeyBQaW5nQ3RybCwgY3RybCBhcyBwaW5nQ3RybCB9IGZyb20gJy4vcGluZydcbmltcG9ydCB7IExhbmdzQ3RybCwgY3RybCBhcyBsYW5nc0N0cmwgfSBmcm9tICcuL2xhbmdzJ1xuaW1wb3J0IHsgU291bmRDdHJsLCBjdHJsIGFzIHNvdW5kQ3RybCB9IGZyb20gJy4vc291bmQnXG5pbXBvcnQgeyBCYWNrZ3JvdW5kQ3RybCwgQmFja2dyb3VuZERhdGEsIGN0cmwgYXMgYmFja2dyb3VuZEN0cmwgfSBmcm9tICcuL2JhY2tncm91bmQnXG5pbXBvcnQgeyBCb2FyZEN0cmwsIEJvYXJkRGF0YSwgY3RybCBhcyBib2FyZEN0cmwgfSBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgVGhlbWVDdHJsLCBUaGVtZURhdGEsIGN0cmwgYXMgdGhlbWVDdHJsIH0gZnJvbSAnLi90aGVtZSdcbmltcG9ydCB7IFBpZWNlQ3RybCwgUGllY2VEYXRhLCBjdHJsIGFzIHBpZWNlQ3RybCB9IGZyb20gJy4vcGllY2UnXG5pbXBvcnQgeyBSZWRyYXcsIFByb3AsIHByb3AgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGFzaGVyRGF0YSB7XG4gIHVzZXI/OiBMaWdodFVzZXI7XG4gIGxhbmc6IHtcbiAgICBjdXJyZW50OiBzdHJpbmc7XG4gICAgYWNjZXB0ZWQ6IHN0cmluZ1tdO1xuICB9XG4gIHNvdW5kOiB7XG4gICAgbGlzdDogc3RyaW5nW107XG4gIH1cbiAgYmFja2dyb3VuZDogQmFja2dyb3VuZERhdGE7XG4gIGJvYXJkOiBCb2FyZERhdGE7XG4gIHRoZW1lOiBUaGVtZURhdGE7XG4gIHBpZWNlOiBQaWVjZURhdGE7XG4gIGluYm94OiBib29sZWFuO1xuICBjb2FjaDogYm9vbGVhbjtcbiAgc3RyZWFtZXI6IGJvb2xlYW47XG4gIGkxOG46IGFueTtcbn1cblxuZXhwb3J0IHR5cGUgTW9kZSA9ICdsaW5rcycgfCAnbGFuZ3MnIHwgJ3NvdW5kJyB8ICdiYWNrZ3JvdW5kJyB8ICdib2FyZCcgfCAndGhlbWUnIHwgJ3BpZWNlJztcblxuY29uc3QgZGVmYXVsdE1vZGUgPSAnbGlua3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERhc2hlckN0cmwge1xuICBtb2RlOiBQcm9wPE1vZGU+O1xuICBzZXRNb2RlKG06IE1vZGUpOiB2b2lkO1xuICBkYXRhOiBEYXNoZXJEYXRhO1xuICB0cmFuczogVHJhbnM7XG4gIHBpbmc6IFBpbmdDdHJsO1xuICBzdWJzOiB7XG4gICAgbGFuZ3M6IExhbmdzQ3RybDtcbiAgICBzb3VuZDogU291bmRDdHJsO1xuICAgIGJhY2tncm91bmQ6IEJhY2tncm91bmRDdHJsO1xuICAgIGJvYXJkOiBCb2FyZEN0cmw7XG4gICAgdGhlbWU6IFRoZW1lQ3RybDtcbiAgICBwaWVjZTogUGllY2VDdHJsO1xuICB9O1xuICBvcHRzOiBEYXNoZXJPcHRzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERhc2hlck9wdHMge1xuICBwbGF5aW5nOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUN0cmwob3B0czogRGFzaGVyT3B0cywgZGF0YTogRGFzaGVyRGF0YSwgcmVkcmF3OiBSZWRyYXcpOiBEYXNoZXJDdHJsIHtcblxuICBjb25zdCB0cmFucyA9IHdpbmRvdy5saWNoZXNzLnRyYW5zKGRhdGEuaTE4bik7XG5cbiAgbGV0IG1vZGU6IFByb3A8TW9kZT4gPSBwcm9wKGRlZmF1bHRNb2RlIGFzIE1vZGUpO1xuXG4gIGZ1bmN0aW9uIHNldE1vZGUobTogTW9kZSkge1xuICAgIG1vZGUobSk7XG4gICAgcmVkcmF3KCk7XG4gIH1cbiAgZnVuY3Rpb24gY2xvc2UoKSB7IHNldE1vZGUoZGVmYXVsdE1vZGUpOyB9XG5cbiAgY29uc3QgcGluZyA9IHBpbmdDdHJsKHRyYW5zLCByZWRyYXcpO1xuXG4gIGNvbnN0IHN1YnMgPSB7XG4gICAgbGFuZ3M6IGxhbmdzQ3RybChkYXRhLmxhbmcsIHRyYW5zLCByZWRyYXcsIGNsb3NlKSxcbiAgICBzb3VuZDogc291bmRDdHJsKGRhdGEuc291bmQubGlzdCwgdHJhbnMsIHJlZHJhdywgY2xvc2UpLFxuICAgIGJhY2tncm91bmQ6IGJhY2tncm91bmRDdHJsKGRhdGEuYmFja2dyb3VuZCwgdHJhbnMsIHJlZHJhdywgY2xvc2UpLFxuICAgIGJvYXJkOiBib2FyZEN0cmwoZGF0YS5ib2FyZCwgdHJhbnMsIHJlZHJhdywgY2xvc2UpLFxuICAgIHRoZW1lOiB0aGVtZUN0cmwoZGF0YS50aGVtZSwgdHJhbnMsICgpID0+IGRhdGEuYm9hcmQuaXMzZCA/ICdkMycgOiAnZDInLCByZWRyYXcsIHNldE1vZGUpLFxuICAgIHBpZWNlOiBwaWVjZUN0cmwoZGF0YS5waWVjZSwgdHJhbnMsICgpID0+IGRhdGEuYm9hcmQuaXMzZCA/ICdkMycgOiAnZDInLCByZWRyYXcsIHNldE1vZGUpXG4gIH07XG5cbiAgd2luZG93LmxpY2hlc3MucHVic3ViLm9uKCd0b3AudG9nZ2xlLnVzZXJfdGFnJywgKCkgPT4gc2V0TW9kZShkZWZhdWx0TW9kZSkpO1xuXG4gIHJldHVybiB7XG4gICAgbW9kZSxcbiAgICBzZXRNb2RlLFxuICAgIGRhdGEsXG4gICAgdHJhbnMsXG4gICAgcGluZyxcbiAgICBzdWJzLFxuICAgIG9wdHNcbiAgfTtcbn07XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuXG5pbXBvcnQgeyBSZWRyYXcsIENsb3NlLCBzcGlubmVyLCBoZWFkZXIgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBnZXQgfSBmcm9tICcuL3hocidcblxuZXhwb3J0IGludGVyZmFjZSBMYW5nIHtcbiAgMDogQ29kZSxcbiAgMTogc3RyaW5nXG59XG5cbnR5cGUgQ29kZSA9IHN0cmluZztcblxuZXhwb3J0IGludGVyZmFjZSBMYW5nc0RhdGEge1xuICBjdXJyZW50OiBDb2RlXG4gIGFjY2VwdGVkOiBDb2RlW11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYW5nc0N0cmwge1xuICBkYXRhOiBMYW5nc0RhdGFcbiAgbGlzdCgpOiBMYW5nW10gfCB1bmRlZmluZWRcbiAgbG9hZCgpOiB2b2lkXG4gIHRyYW5zOiBUcmFuc1xuICBjbG9zZTogQ2xvc2Vcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN0cmwoZGF0YTogTGFuZ3NEYXRhLCB0cmFuczogVHJhbnMsIHJlZHJhdzogUmVkcmF3LCBjbG9zZTogQ2xvc2UpOiBMYW5nc0N0cmwge1xuXG4gIGxldCBsaXN0OiBMYW5nW10gfCB1bmRlZmluZWQ7XG5cbiAgcmV0dXJuIHtcbiAgICBkYXRhLFxuICAgIGxpc3Q6ICgpID0+IGxpc3QsXG4gICAgbG9hZCgpIHtcbiAgICAgIGdldCh3aW5kb3cubGljaGVzcy5hc3NldFVybCgndHJhbnMvcmVmcy5qc29uJyksIHRydWUpLnRoZW4oZCA9PiB7XG4gICAgICAgIGNvbnN0IGFjY3M6IExhbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBvdGhlcnM6IExhbmdbXSA9IFtdO1xuICAgICAgICBkLmZvckVhY2goKGw6IExhbmcpID0+IHtcbiAgICAgICAgICBpZiAoZGF0YS5hY2NlcHRlZC5pbmNsdWRlcyhsWzBdKSkgYWNjcy5wdXNoKGwpO1xuICAgICAgICAgIGVsc2Ugb3RoZXJzLnB1c2gobCk7XG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0ID0gYWNjcy5jb25jYXQob3RoZXJzKSBhcyBMYW5nW107XG4gICAgICAgIHJlZHJhdygpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB0cmFucyxcbiAgICBjbG9zZVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlldyhjdHJsOiBMYW5nc0N0cmwpOiBWTm9kZSB7XG5cbiAgY29uc3QgbGlzdCA9IGN0cmwubGlzdCgpO1xuICBpZiAoIWxpc3QpIGN0cmwubG9hZCgpO1xuXG4gIHJldHVybiBoKCdkaXYuc3ViLmxhbmdzJywgW1xuICAgIGhlYWRlcihjdHJsLnRyYW5zLm5vYXJnKCdsYW5ndWFnZScpLCBjdHJsLmNsb3NlKSxcbiAgICBsaXN0ID8gaCgnZm9ybScsIHtcbiAgICAgIGF0dHJzOiB7IG1ldGhvZDogJ3Bvc3QnLCBhY3Rpb246ICcvdHJhbnNsYXRpb24vc2VsZWN0JyB9XG4gICAgfSwgbGFuZ0xpbmtzKGN0cmwsIGxpc3QpKSA6IHNwaW5uZXIoKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gbGFuZ0xpbmtzKGN0cmw6IExhbmdzQ3RybCwgbGlzdDogTGFuZ1tdKSB7XG4gIGNvbnN0IGxpbmtzID0gbGlzdC5tYXAobGFuZ1ZpZXcoY3RybC5kYXRhLmN1cnJlbnQsIGN0cmwuZGF0YS5hY2NlcHRlZCkpO1xuICBsaW5rcy5wdXNoKGgoJ2EnLCB7XG4gICAgYXR0cnM6IHsgaHJlZjogJ2h0dHBzOi8vY3Jvd2Rpbi5jb20vcHJvamVjdC9saWNoZXNzJyB9XG4gIH0sICdIZWxwIHRyYW5zbGF0ZSBsaWNoZXNzJykpO1xuICByZXR1cm4gbGlua3M7XG59XG5cbmZ1bmN0aW9uIGxhbmdWaWV3KGN1cnJlbnQ6IENvZGUsIGFjY2VwdGVkOiBDb2RlW10pIHtcbiAgcmV0dXJuIChsOiBMYW5nKSA9PlxuICBoKCdidXR0b24nICsgKGN1cnJlbnQgPT09IGxbMF0gPyAnLmN1cnJlbnQnIDogJycpICsgKGFjY2VwdGVkLmluY2x1ZGVzKGxbMF0pID8gJy5hY2NlcHRlZCcgOiAnJyksIHtcbiAgICBhdHRyczoge1xuICAgICAgdHlwZTogJ3N1Ym1pdCcsXG4gICAgICBuYW1lOiAnbGFuZycsXG4gICAgICB2YWx1ZTogbFswXSxcbiAgICAgIHRpdGxlOiBsWzBdXG4gICAgfSxcbiAgfSwgbFsxXSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuXG5pbXBvcnQgeyBEYXNoZXJDdHJsLCBNb2RlIH0gZnJvbSAnLi9kYXNoZXInXG5pbXBvcnQgeyB2aWV3IGFzIHBpbmdWaWV3IH0gZnJvbSAnLi9waW5nJ1xuaW1wb3J0IHsgYmluZCB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY3RybDogRGFzaGVyQ3RybCk6IFZOb2RlIHtcblxuICBjb25zdCBkID0gY3RybC5kYXRhLCB0cmFucyA9IGN0cmwudHJhbnMsIG5vYXJnID0gdHJhbnMubm9hcmc7XG5cbiAgZnVuY3Rpb24gdXNlckxpbmtzKCk6IFZOb2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIGQudXNlciA/IGgoJ2Rpdi5saW5rcycsIFtcbiAgICAgIGgoXG4gICAgICAgICdhLnVzZXItbGluay5vbmxpbmUudGV4dC5pcy1ncmVlbicsXG4gICAgICAgIGxpbmtDZmcoYC9ALyR7ZC51c2VyLm5hbWV9YCwgZC51c2VyLnBhdHJvbiA/ICfugJknIDogJ+6AkCcpLFxuICAgICAgICBub2FyZygncHJvZmlsZScpKSxcblxuICAgICAgZC5pbmJveCA/IGgoXG4gICAgICAgICdhLnRleHQnLFxuICAgICAgICBsaW5rQ2ZnKCcvaW5ib3gnLCAnZScpLFxuICAgICAgICBub2FyZygnaW5ib3gnKSkgOiBudWxsLFxuXG4gICAgICBoKFxuICAgICAgICAnYS50ZXh0JyxcbiAgICAgICAgbGlua0NmZygnL2FjY291bnQvcHJlZmVyZW5jZXMvZ2FtZS1kaXNwbGF5JywgJyUnLCBjdHJsLm9wdHMucGxheWluZyA/IHt0YXJnZXQ6ICdfYmxhbmsnfSA6IHVuZGVmaW5lZCksXG4gICAgICAgIG5vYXJnKCdwcmVmZXJlbmNlcycpKSxcblxuICAgICAgIWQuY29hY2ggPyBudWxsIDogaChcbiAgICAgICAgJ2EudGV4dCcsXG4gICAgICAgIGxpbmtDZmcoJy9jb2FjaC9lZGl0JywgJzonKSxcbiAgICAgICAgJ0NvYWNoIG1hbmFnZXInKSxcblxuICAgICAgIWQuc3RyZWFtZXIgPyBudWxsIDogaChcbiAgICAgICAgJ2EudGV4dCcsXG4gICAgICAgIGxpbmtDZmcoJy9zdHJlYW1lci9lZGl0JywgJ+6AgycpLFxuICAgICAgICAnU3RyZWFtZXIgbWFuYWdlcicpLFxuXG4gICAgICBoKCdmb3JtLmxvZ291dCcsIHtcbiAgICAgICAgYXR0cnM6IHsgbWV0aG9kOiAncG9zdCcsIGFjdGlvbjogJy9sb2dvdXQnIH1cbiAgICAgIH0sIFtcbiAgICAgICAgaCgnYnV0dG9uLnRleHQnLCB7XG4gICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWJtaXQnLFxuICAgICAgICAgICAgJ2RhdGEtaWNvbic6ICd3J1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgbm9hcmcoJ2xvZ091dCcpKVxuICAgICAgXSlcbiAgICBdKSA6IG51bGw7XG4gIH1cblxuICBjb25zdCBsYW5ncyA9IGgoXG4gICAgJ2Euc3ViJyxcbiAgICBtb2RlQ2ZnKGN0cmwsICdsYW5ncycpLFxuICAgIG5vYXJnKCdsYW5ndWFnZScpKVxuXG4gIGNvbnN0IHNvdW5kID0gaChcbiAgICAnYS5zdWInLFxuICAgIG1vZGVDZmcoY3RybCwgJ3NvdW5kJyksXG4gICAgbm9hcmcoJ3NvdW5kJykpXG5cbiAgY29uc3QgYmFja2dyb3VuZCA9IGgoXG4gICAgJ2Euc3ViJyxcbiAgICBtb2RlQ2ZnKGN0cmwsICdiYWNrZ3JvdW5kJyksXG4gICAgbm9hcmcoJ2JhY2tncm91bmQnKSlcblxuICBjb25zdCBib2FyZCA9IGgoXG4gICAgJ2Euc3ViJyxcbiAgICBtb2RlQ2ZnKGN0cmwsICdib2FyZCcpLFxuICAgIG5vYXJnKCdib2FyZEdlb21ldHJ5JykpXG5cbiAgY29uc3QgdGhlbWUgPSBoKFxuICAgICdhLnN1YicsXG4gICAgbW9kZUNmZyhjdHJsLCAndGhlbWUnKSxcbiAgICBub2FyZygnYm9hcmRUaGVtZScpKVxuXG4gIGNvbnN0IHBpZWNlID0gaChcbiAgICAnYS5zdWInLFxuICAgIG1vZGVDZmcoY3RybCwgJ3BpZWNlJyksXG4gICAgbm9hcmcoJ3BpZWNlU2V0JykpXG5cbiAgY29uc3QgemVuVG9nZ2xlID0gY3RybC5vcHRzLnBsYXlpbmcgPyBoKCdkaXYuemVuLnNlbGVjdG9yJywgW1xuICAgIGgoJ2EudGV4dCcsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAnSycsXG4gICAgICAgIHRpdGxlOiAnS2V5Ym9hcmQ6IHonXG4gICAgICB9LFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnemVuJykpXG4gICAgfSwgbm9hcmcoJ3plbk1vZGUnKSlcbiAgXSkgOiBudWxsO1xuXG4gIHJldHVybiBoKCdkaXYnLCBbXG4gICAgdXNlckxpbmtzKCksXG4gICAgaCgnZGl2LnN1YnMnLCBbXG4gICAgICBsYW5ncyxcbiAgICAgIHNvdW5kLFxuICAgICAgYmFja2dyb3VuZCxcbiAgICAgIGJvYXJkLFxuICAgICAgdGhlbWUsXG4gICAgICBwaWVjZSxcbiAgICAgIHplblRvZ2dsZVxuICAgIF0pLFxuICAgIHBpbmdWaWV3KGN0cmwucGluZylcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIGxpbmtDZmcoaHJlZjogc3RyaW5nLCBpY29uOiBzdHJpbmcsIG1vcmU6IGFueSA9IHVuZGVmaW5lZCk6IGFueSB7XG4gIGNvbnN0IGNmZzogYW55ID0ge1xuICAgIGF0dHJzOiB7XG4gICAgICBocmVmLFxuICAgICAgJ2RhdGEtaWNvbic6IGljb25cbiAgICB9XG4gIH07XG4gIGlmIChtb3JlKSBmb3IobGV0IGkgaW4gbW9yZSkgY2ZnLmF0dHJzW2ldID0gbW9yZVtpXTtcbiAgcmV0dXJuIGNmZztcbn1cblxuZnVuY3Rpb24gbW9kZUNmZyhjdHJsOiBEYXNoZXJDdHJsLCBtOiBNb2RlKTogYW55IHtcbiAgcmV0dXJuIHtcbiAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwuc2V0TW9kZShtKSksXG4gICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6ICdIJyB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBSZWRyYXcgfSBmcm9tICcuL3V0aWwnXG5cbmltcG9ydCB7IERhc2hlckN0cmwsIERhc2hlck9wdHMsIG1ha2VDdHJsIH0gZnJvbSAnLi9kYXNoZXInO1xuaW1wb3J0IHsgbG9hZGluZywgbG9hZGVkIH0gZnJvbSAnLi92aWV3JztcbmltcG9ydCB7IGdldCB9IGZyb20gJy4veGhyJztcblxuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3NuYWJiZG9tJztcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQga2xhc3MgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9jbGFzcyc7XG5pbXBvcnQgYXR0cmlidXRlcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnO1xuY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlc10pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMaWNoZXNzRGFzaGVyKGVsZW1lbnQ6IEVsZW1lbnQsIG9wdHM6IERhc2hlck9wdHMpIHtcblxuICBsZXQgdm5vZGU6IFZOb2RlLCBjdHJsOiBEYXNoZXJDdHJsO1xuXG4gIGNvbnN0IHJlZHJhdzogUmVkcmF3ID0gKCkgPT4ge1xuICAgIHZub2RlID0gcGF0Y2godm5vZGUgfHwgZWxlbWVudCwgY3RybCA/IGxvYWRlZChjdHJsKSA6IGxvYWRpbmcoKSk7XG4gIH1cblxuICByZWRyYXcoKTtcblxuICByZXR1cm4gZ2V0KCcvZGFzaGVyJykudGhlbihkYXRhID0+IHtcbiAgICBjdHJsID0gbWFrZUN0cmwob3B0cywgZGF0YSwgcmVkcmF3KTtcbiAgICByZWRyYXcoKTtcbiAgICByZXR1cm4gY3RybDtcbiAgfSk7XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuaW1wb3J0IHsgUmVkcmF3LCBPcGVuLCBiaW5kLCBoZWFkZXIgfSBmcm9tICcuL3V0aWwnXG5cbnR5cGUgUGllY2UgPSBzdHJpbmc7XG5cbmludGVyZmFjZSBQaWVjZURpbURhdGEge1xuICBjdXJyZW50OiBQaWVjZVxuICBsaXN0OiBQaWVjZVtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VEYXRhIHtcbiAgZDI6IFBpZWNlRGltRGF0YVxuICBkMzogUGllY2VEaW1EYXRhXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VDdHJsIHtcbiAgZGltZW5zaW9uOiAoKSA9PiBrZXlvZiBQaWVjZURhdGFcbiAgZGF0YTogKCkgPT4gUGllY2VEaW1EYXRhXG4gIHRyYW5zOiBUcmFuc1xuICBzZXQodDogUGllY2UpOiB2b2lkXG4gICAgb3BlbjogT3BlblxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3RybChkYXRhOiBQaWVjZURhdGEsIHRyYW5zOiBUcmFucywgZGltZW5zaW9uOiAoKSA9PiBrZXlvZiBQaWVjZURhdGEsIHJlZHJhdzogUmVkcmF3LCBvcGVuOiBPcGVuKTogUGllY2VDdHJsIHtcblxuICBmdW5jdGlvbiBkaW1lbnNpb25EYXRhKCkge1xuICAgIHJldHVybiBkYXRhW2RpbWVuc2lvbigpXTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGltZW5zaW9uLFxuICAgIHRyYW5zLFxuICAgIGRhdGE6IGRpbWVuc2lvbkRhdGEsXG4gICAgc2V0KHQ6IFBpZWNlKSB7XG4gICAgICBjb25zdCBkID0gZGltZW5zaW9uRGF0YSgpO1xuICAgICAgZC5jdXJyZW50ID0gdDtcbiAgICAgIGFwcGx5UGllY2UodCwgZC5saXN0LCBkaW1lbnNpb24oKSA9PT0gJ2QzJyk7XG4gICAgICAkLnBvc3QoJy9wcmVmL3BpZWNlU2V0JyArIChkaW1lbnNpb24oKSA9PT0gJ2QzJyA/ICczZCcgOiAnJyksIHtcbiAgICAgICAgc2V0OiB0XG4gICAgICB9KTtcbiAgICAgIHJlZHJhdygpO1xuICAgIH0sXG4gICAgb3BlblxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlldyhjdHJsOiBQaWVjZUN0cmwpOiBWTm9kZSB7XG5cbiAgY29uc3QgZCA9IGN0cmwuZGF0YSgpO1xuXG4gIHJldHVybiBoKCdkaXYuc3ViLnBpZWNlLicgKyBjdHJsLmRpbWVuc2lvbigpLCBbXG4gICAgaGVhZGVyKGN0cmwudHJhbnMubm9hcmcoJ3BpZWNlU2V0JyksICgpID0+IGN0cmwub3BlbignbGlua3MnKSksXG4gICAgaCgnZGl2Lmxpc3QnLCBkLmxpc3QubWFwKHBpZWNlVmlldyhkLmN1cnJlbnQsIGN0cmwuc2V0LCBjdHJsLmRpbWVuc2lvbigpID09ICdkMycpKSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlSW1hZ2UodDogUGllY2UsIGlzM2Q6IGJvb2xlYW4pIHtcbiAgaWYgKGlzM2QpIHtcbiAgICBjb25zdCBwcmV2aWV3ID0gdCA9PSAnU3RhdW50b24nID8gJy1QcmV2aWV3JyA6ICcnO1xuICAgIHJldHVybiBgaW1hZ2VzL3N0YXVudG9uL3BpZWNlLyR7dH0vV2hpdGUtS25pZ2h0JHtwcmV2aWV3fS5wbmdgO1xuICB9XG4gIHJldHVybiBgcGllY2UvJHt0fS93Ti5zdmdgO1xufVxuXG5mdW5jdGlvbiBwaWVjZVZpZXcoY3VycmVudDogUGllY2UsIHNldDogKHQ6IFBpZWNlKSA9PiB2b2lkLCBpczNkOiBib29sZWFuKSB7XG4gIHJldHVybiAodDogUGllY2UpID0+IGgoJ2Eubm8tc3F1YXJlJywge1xuICAgIGF0dHJzOiB7IHRpdGxlOiB0IH0sXG4gICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBzZXQodCkpLFxuICAgIGNsYXNzOiB7IGFjdGl2ZTogY3VycmVudCA9PT0gdCB9XG4gIH0sIFtcbiAgICBoKCdwaWVjZScsIHtcbiAgICAgIGF0dHJzOiB7IHN0eWxlOiBgYmFja2dyb3VuZC1pbWFnZTp1cmwoJHt3aW5kb3cubGljaGVzcy5hc3NldFVybChwaWVjZUltYWdlKHQsIGlzM2QpKX0pYCB9XG4gICAgfSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5UGllY2UodDogUGllY2UsIGxpc3Q6IFBpZWNlW10sIGlzM2Q6IGJvb2xlYW4pIHtcbiAgaWYgKGlzM2QpIHtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MobGlzdC5qb2luKCcgJykpLmFkZENsYXNzKHQpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHNwcml0ZSA9ICQoJyNwaWVjZS1zcHJpdGUnKTtcbiAgICBzcHJpdGUuYXR0cignaHJlZicsIHNwcml0ZS5hdHRyKCdocmVmJykucmVwbGFjZSgvXFx3K1xcLmNzcy8sIHQgKyAnLmNzcycpKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuaW1wb3J0IHsgUmVkcmF3LCBkZWZpbmVkIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFBpbmdEYXRhIHtcbiAgcGluZzogbnVtYmVyIHwgdW5kZWZpbmVkXG4gIHNlcnZlcjogbnVtYmVyIHwgdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGluZ0N0cmwge1xuICBkYXRhOiBQaW5nRGF0YVxuICB0cmFuczogVHJhbnNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN0cmwodHJhbnM6IFRyYW5zLCByZWRyYXc6IFJlZHJhdyk6IFBpbmdDdHJsIHtcblxuICBjb25zdCBkYXRhOiBQaW5nRGF0YSA9IHtcbiAgICBwaW5nOiB1bmRlZmluZWQsXG4gICAgc2VydmVyOiB1bmRlZmluZWRcbiAgfTtcblxuICBjb25zdCBodWIgPSB3aW5kb3cubGljaGVzcy5wdWJzdWI7XG5cbiAgaHViLmVtaXQoJ3NvY2tldC5zZW5kJywgJ21vdmVMYXQnLCB0cnVlKTtcbiAgaHViLm9uKCdzb2NrZXQubGFnJywgbGFnID0+IHtcbiAgICBkYXRhLnBpbmcgPSBNYXRoLnJvdW5kKGxhZyk7XG4gICAgcmVkcmF3KCk7XG4gIH0pO1xuICBodWIub24oJ3NvY2tldC5pbi5tbGF0JywgbGF0ID0+IHtcbiAgICBkYXRhLnNlcnZlciA9IGxhdCBhcyBudW1iZXI7XG4gICAgcmVkcmF3KCk7XG4gIH0pO1xuXG4gIHJldHVybiB7IGRhdGEsIHRyYW5zIH07XG59XG5cbmZ1bmN0aW9uIHNpZ25hbEJhcnMoZDogUGluZ0RhdGEpIHtcbiAgY29uc3QgbGFnUmF0aW5nID1cbiAgICAhZC5waW5nID8gMCA6XG4gICAgKGQucGluZyA8IDE1MCkgPyA0IDpcbiAgICAoZC5waW5nIDwgMzAwKSA/IDMgOlxuICAgIChkLnBpbmcgPCA1MDApID8gMiA6IDE7XG4gIGNvbnN0IGJhcnMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gNDsgaSsrKSBiYXJzLnB1c2goaChpIDw9IGxhZ1JhdGluZyA/ICdpJyA6ICdpLm9mZicpKTtcbiAgcmV0dXJuIGgoJ3NpZ25hbC5xJyArIGxhZ1JhdGluZywgYmFycyk7XG59XG5cbmZ1bmN0aW9uIHNob3dNaWxsaXMobTogbnVtYmVyKTogW3N0cmluZywgVk5vZGVdIHtcbiAgcmV0dXJuIFtcbiAgICAnJyArIE1hdGguZmxvb3IobSksXG4gICAgaCgnc21hbGwnLCAnLicgKyBNYXRoLnJvdW5kKChtIC0gTWF0aC5mbG9vcihtKSkgKiAxMCkpXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aWV3KGN0cmw6IFBpbmdDdHJsKTogVk5vZGUge1xuXG4gIGNvbnN0IGQgPSBjdHJsLmRhdGE7XG5cbiAgcmV0dXJuIGgoJ2Euc3RhdHVzJywgeyBhdHRyczoge2hyZWY6ICcvbGFnJ30gfSwgW1xuICAgIHNpZ25hbEJhcnMoZCksXG4gICAgaCgnc3Bhbi5waW5nJywge1xuICAgICAgYXR0cnM6IHsgdGl0bGU6ICdQSU5HOiAnICsgY3RybC50cmFucy5ub2FyZygnbmV0d29ya0xhZ0JldHdlZW5Zb3VBbmRMaWNoZXNzJykgfVxuICAgIH0sIFtcbiAgICAgIGgoJ2VtJywgJ1BJTkcnKSxcbiAgICAgIGgoJ3N0cm9uZycsIGRlZmluZWQoZC5waW5nKSA/ICcnICsgZC5waW5nIDogJz8nKSxcbiAgICAgIGgoJ2VtJywgJ21zJylcbiAgICBdKSxcbiAgICBoKCdzcGFuLnNlcnZlcicsIHtcbiAgICAgIGF0dHJzOiB7IHRpdGxlOiAnU0VSVkVSOiAnICsgY3RybC50cmFucy5ub2FyZygndGltZVRvUHJvY2Vzc0FNb3ZlT25MaWNoZXNzU2VydmVyJykgfVxuICAgIH0sIFtcbiAgICAgIGgoJ2VtJywgJ1NFUlZFUicpLFxuICAgICAgaCgnc3Ryb25nJywgZGVmaW5lZChkLnNlcnZlcikgPyBzaG93TWlsbGlzKGQuc2VydmVyKSA6IFsnPyddKSxcbiAgICAgIGgoJ2VtJywgJ21zJylcbiAgICBdKVxuICBdKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5cbmltcG9ydCB7IFJlZHJhdywgQ2xvc2UsIGJpbmQsIGhlYWRlciB9IGZyb20gJy4vdXRpbCdcblxudHlwZSBLZXkgPSBzdHJpbmc7XG5cbmV4cG9ydCB0eXBlIFNvdW5kID0gc3RyaW5nW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgU291bmREYXRhIHtcbiAgY3VycmVudDogS2V5XG4gIGxpc3Q6IFNvdW5kW11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBTb3VuZEN0cmwge1xuICBtYWtlTGlzdCgpOiBTb3VuZFtdO1xuICBhcGk6IGFueTtcbiAgc2V0KGs6IEtleSk6IHZvaWQ7XG4gIHZvbHVtZSh2OiBudW1iZXIpOiB2b2lkO1xuICByZWRyYXc6IFJlZHJhdztcbiAgdHJhbnM6IFRyYW5zO1xuICBjbG9zZTogQ2xvc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdHJsKHJhdzogc3RyaW5nW10sIHRyYW5zOiBUcmFucywgcmVkcmF3OiBSZWRyYXcsIGNsb3NlOiBDbG9zZSk6IFNvdW5kQ3RybCB7XG5cbiAgY29uc3QgbGlzdDogU291bmRbXSA9IHJhdy5tYXAocyA9PiBzLnNwbGl0KCcgJykpO1xuXG4gIGNvbnN0IGFwaSA9IHdpbmRvdy5saWNoZXNzLnNvdW5kO1xuXG4gIHJldHVybiB7XG4gICAgbWFrZUxpc3QoKSB7XG4gICAgICBjb25zdCBjYW5TcGVlY2ggPSB3aW5kb3cuc3BlZWNoU3ludGhlc2lzICYmIHdpbmRvdy5zcGVlY2hTeW50aGVzaXMuZ2V0Vm9pY2VzKCkubGVuZ3RoO1xuICAgICAgcmV0dXJuIGxpc3QuZmlsdGVyKHMgPT4gc1swXSAhPSAnc3BlZWNoJyB8fCBjYW5TcGVlY2gpO1xuICAgIH0sXG4gICAgYXBpLFxuICAgIHNldChrOiBLZXkpIHtcbiAgICAgIGFwaS5zcGVlY2goayA9PSAnc3BlZWNoJyk7XG4gICAgICB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnc3BlZWNoLmVuYWJsZWQnLCBhcGkuc3BlZWNoKCkpO1xuICAgICAgaWYgKGFwaS5zcGVlY2goKSkgYXBpLnNheSgnU3BlZWNoIHN5bnRoZXNpcyByZWFkeScpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGFwaS5jaGFuZ2VTZXQoayk7XG4gICAgICAgIGFwaS5nZW5lcmljTm90aWZ5KCk7XG4gICAgICAgICQucG9zdCgnL3ByZWYvc291bmRTZXQnLCB7IHNldDogayB9KTtcbiAgICAgIH1cbiAgICAgIHJlZHJhdygpO1xuICAgIH0sXG4gICAgdm9sdW1lKHY6IG51bWJlcikge1xuICAgICAgYXBpLnNldFZvbHVtZSh2KTtcbiAgICAgIC8vIHBsYXlzIGEgbW92ZSBzb3VuZCBpZiBzcGVlY2ggaXMgb2ZmXG4gICAgICBhcGkubW92ZSgna25pZ2h0IEYgNycpO1xuICAgIH0sXG4gICAgcmVkcmF3LFxuICAgIHRyYW5zLFxuICAgIGNsb3NlXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aWV3KGN0cmw6IFNvdW5kQ3RybCk6IFZOb2RlIHtcblxuICBjb25zdCBjdXJyZW50ID0gY3RybC5hcGkuc3BlZWNoKCkgPyAnc3BlZWNoJyA6IGN0cmwuYXBpLnNldCgpO1xuXG4gIHJldHVybiBoKCdkaXYuc3ViLnNvdW5kLicgKyBjdHJsLmFwaS5zZXQoKSwge1xuICAgIGhvb2s6IHtcbiAgICAgIGluc2VydCgpIHtcbiAgICAgICAgd2luZG93LnNwZWVjaFN5bnRoZXNpcy5vbnZvaWNlc2NoYW5nZWQgPSBjdHJsLnJlZHJhdztcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtcbiAgICBoZWFkZXIoY3RybC50cmFucygnc291bmQnKSwgY3RybC5jbG9zZSksXG4gICAgaCgnZGl2LmNvbnRlbnQnLCBbXG4gICAgICBoKCdkaXYuc2xpZGVyJywgeyBob29rOiB7IGluc2VydDogdm4gPT4gbWFrZVNsaWRlcihjdHJsLCB2bikgfSB9KSxcbiAgICAgIGgoJ2Rpdi5zZWxlY3RvcicsIHtcbiAgICAgICAgYXR0cnM6IHsgbWV0aG9kOiAncG9zdCcsIGFjdGlvbjogJy9wcmVmL3NvdW5kU2V0JyB9XG4gICAgICB9LCBjdHJsLm1ha2VMaXN0KCkubWFwKHNvdW5kVmlldyhjdHJsLCBjdXJyZW50KSkpXG4gICAgXSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIG1ha2VTbGlkZXIoY3RybDogU291bmRDdHJsLCB2bm9kZTogVk5vZGUpIHtcbiAgY29uc3Qgc2V0Vm9sdW1lID0gd2luZG93LmxpY2hlc3MuZGVib3VuY2UoY3RybC52b2x1bWUsIDUwKTtcbiAgd2luZG93LmxpY2hlc3Muc2xpZGVyKCkuZG9uZSgoKSA9PiB7XG4gICAgJCh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLnNsaWRlcih7XG4gICAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcbiAgICAgIG1pbjogMCxcbiAgICAgIG1heDogMSxcbiAgICAgIHJhbmdlOiAnbWluJyxcbiAgICAgIHN0ZXA6IDAuMDEsXG4gICAgICB2YWx1ZTogY3RybC5hcGkuZ2V0Vm9sdW1lKCksXG4gICAgICBzbGlkZTogKF86IGFueSwgdWk6IGFueSkgPT4gc2V0Vm9sdW1lKHVpLnZhbHVlKVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc291bmRWaWV3KGN0cmw6IFNvdW5kQ3RybCwgY3VycmVudDogS2V5KSB7XG4gIHJldHVybiAoczogU291bmQpID0+IGgoJ2EudGV4dCcsIHtcbiAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwuc2V0KHNbMF0pKSxcbiAgICBjbGFzczogeyBhY3RpdmU6IGN1cnJlbnQgPT09IHNbMF0gfSxcbiAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ0UnIH1cbiAgfSwgc1sxXSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuXG5pbXBvcnQgeyBSZWRyYXcsIE9wZW4sIGJpbmQsIGhlYWRlciB9IGZyb20gJy4vdXRpbCdcblxudHlwZSBUaGVtZSA9IHN0cmluZztcblxuaW50ZXJmYWNlIFRoZW1lRGltRGF0YSB7XG4gIGN1cnJlbnQ6IFRoZW1lXG4gIGxpc3Q6IFRoZW1lW11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBUaGVtZURhdGEge1xuICBkMjogVGhlbWVEaW1EYXRhXG4gIGQzOiBUaGVtZURpbURhdGFcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUaGVtZUN0cmwge1xuICBkaW1lbnNpb246ICgpID0+IGtleW9mIFRoZW1lRGF0YVxuICBkYXRhOiAoKSA9PiBUaGVtZURpbURhdGFcbiAgdHJhbnM6IFRyYW5zXG4gIHNldCh0OiBUaGVtZSk6IHZvaWRcbiAgb3BlbjogT3BlblxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3RybChkYXRhOiBUaGVtZURhdGEsIHRyYW5zOiBUcmFucywgZGltZW5zaW9uOiAoKSA9PiBrZXlvZiBUaGVtZURhdGEsIHJlZHJhdzogUmVkcmF3LCBvcGVuOiBPcGVuKTogVGhlbWVDdHJsIHtcblxuICBmdW5jdGlvbiBkaW1lbnNpb25EYXRhKCkge1xuICAgIHJldHVybiBkYXRhW2RpbWVuc2lvbigpXTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGltZW5zaW9uLFxuICAgIHRyYW5zLFxuICAgIGRhdGE6IGRpbWVuc2lvbkRhdGEsXG4gICAgc2V0KHQ6IFRoZW1lKSB7XG4gICAgICBjb25zdCBkID0gZGltZW5zaW9uRGF0YSgpO1xuICAgICAgZC5jdXJyZW50ID0gdDtcbiAgICAgIGFwcGx5VGhlbWUodCwgZC5saXN0KTtcbiAgICAgICQucG9zdCgnL3ByZWYvdGhlbWUnICsgKGRpbWVuc2lvbigpID09PSAnZDMnID8gJzNkJyA6ICcnKSwge1xuICAgICAgICB0aGVtZTogdFxuICAgICAgfSk7XG4gICAgICByZWRyYXcoKTtcbiAgICB9LFxuICAgIG9wZW5cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpZXcoY3RybDogVGhlbWVDdHJsKTogVk5vZGUge1xuXG4gIGNvbnN0IGQgPSBjdHJsLmRhdGEoKTtcblxuICByZXR1cm4gaCgnZGl2LnN1Yi50aGVtZS4nICsgY3RybC5kaW1lbnNpb24oKSwgW1xuICAgIGhlYWRlcihjdHJsLnRyYW5zLm5vYXJnKCdib2FyZFRoZW1lJyksICgpID0+IGN0cmwub3BlbignbGlua3MnKSksXG4gICAgaCgnZGl2Lmxpc3QnLCBkLmxpc3QubWFwKHRoZW1lVmlldyhkLmN1cnJlbnQsIGN0cmwuc2V0KSkpXG4gIF0pO1xufVxuXG5mdW5jdGlvbiB0aGVtZVZpZXcoY3VycmVudDogVGhlbWUsIHNldDogKHQ6IFRoZW1lKSA9PiB2b2lkKSB7XG4gIHJldHVybiAodDogVGhlbWUpID0+IGgoJ2EnLCB7XG4gICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBzZXQodCkpLFxuICAgIGF0dHJzOiB7IHRpdGxlOiB0IH0sXG4gICAgY2xhc3M6IHsgYWN0aXZlOiBjdXJyZW50ID09PSB0IH1cbiAgfSwgW1xuICAgIGgoJ3NwYW4uJyArIHQpXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBhcHBseVRoZW1lKHQ6IFRoZW1lLCBsaXN0OiBUaGVtZVtdKSB7XG4gICQoJ2JvZHknKS5yZW1vdmVDbGFzcyhsaXN0LmpvaW4oJyAnKSkuYWRkQ2xhc3ModCk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuXG5leHBvcnQgdHlwZSBSZWRyYXcgPSAoKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgQ2xvc2UgPSAoKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgT3BlbiA9IChzdWI6IHN0cmluZykgPT4gdm9pZDtcblxuZXhwb3J0IGludGVyZmFjZSBQcm9wPFQ+IHtcbiAgKCk6IFRcbiAgKHY6IFQpOiBUXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVkPEE+KHY6IEEgfCB1bmRlZmluZWQpOiB2IGlzIEEge1xuICByZXR1cm4gdHlwZW9mIHYgIT09ICd1bmRlZmluZWQnO1xufVxuXG4vLyBsaWtlIG1pdGhyaWwgcHJvcCBidXQgd2l0aCB0eXBlIHNhZmV0eVxuZXhwb3J0IGZ1bmN0aW9uIHByb3A8QT4oaW5pdGlhbFZhbHVlOiBBKTogUHJvcDxBPiB7XG4gIGxldCB2YWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgY29uc3QgZnVuID0gZnVuY3Rpb24gKHY6IEEgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIHYgIT09ICd1bmRlZmluZWQnKSB2YWx1ZSA9IHY7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuICByZXR1cm4gZnVuIGFzIFByb3A8QT47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kKGV2ZW50TmFtZTogc3RyaW5nLCBmOiAoZTogRXZlbnQpID0+IHZvaWQsIHJlZHJhdzogUmVkcmF3IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gIHJldHVybiB7XG4gICAgaW5zZXJ0OiAodm5vZGU6IFZOb2RlKSA9PiB7XG4gICAgICAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGYoZSk7XG4gICAgICAgIGlmIChyZWRyYXcpIHJlZHJhdygpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZWFkZXIobmFtZTogc3RyaW5nLCBjbG9zZTogQ2xvc2UpIHtcbiAgcmV0dXJuIGgoJ2EuaGVhZC50ZXh0Jywge1xuICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiAnSScgfSxcbiAgICBob29rOiBiaW5kKCdjbGljaycsIGNsb3NlKVxuICB9LCBuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwaW5uZXIoKSB7XG4gIHJldHVybiBoKCdkaXYuc3Bpbm5lcicsIFtcbiAgICBoKCdzdmcnLCB7IGF0dHJzOiB7IHZpZXdCb3g6ICcwIDAgNDAgNDAnIH0gfSwgW1xuICAgICAgaCgnY2lyY2xlJywge1xuICAgICAgICBhdHRyczogeyBjeDogMjAsIGN5OiAyMCwgcjogMTgsIGZpbGw6ICdub25lJyB9XG4gICAgICB9KV0pXSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuXG5pbXBvcnQgeyBEYXNoZXJDdHJsIH0gZnJvbSAnLi9kYXNoZXInXG5pbXBvcnQgbGlua3MgZnJvbSAnLi9saW5rcydcbmltcG9ydCB7IHZpZXcgYXMgbGFuZ3NWaWV3IH0gZnJvbSAnLi9sYW5ncydcbmltcG9ydCB7IHZpZXcgYXMgc291bmRWaWV3IH0gZnJvbSAnLi9zb3VuZCdcbmltcG9ydCB7IHZpZXcgYXMgYmFja2dyb3VuZFZpZXcgfSBmcm9tICcuL2JhY2tncm91bmQnXG5pbXBvcnQgeyB2aWV3IGFzIGJvYXJkVmlldyB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyB2aWV3IGFzIHRoZW1lVmlldyB9IGZyb20gJy4vdGhlbWUnXG5pbXBvcnQgeyB2aWV3IGFzIHBpZWNlVmlldyB9IGZyb20gJy4vcGllY2UnXG5pbXBvcnQgeyBzcGlubmVyIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZGluZygpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYjZGFzaGVyX2FwcC5kcm9wZG93bicsIGgoJ2Rpdi5pbml0aWF0aW5nJywgc3Bpbm5lcigpKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkZWQoY3RybDogRGFzaGVyQ3RybCk6IFZOb2RlIHtcbiAgbGV0IGNvbnRlbnQ6IFZOb2RlIHwgdW5kZWZpbmVkO1xuICBzd2l0Y2goY3RybC5tb2RlKCkpIHtcbiAgICBjYXNlICdsYW5ncyc6XG4gICAgICBjb250ZW50ID0gbGFuZ3NWaWV3KGN0cmwuc3Vicy5sYW5ncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzb3VuZCc6XG4gICAgICBjb250ZW50ID0gc291bmRWaWV3KGN0cmwuc3Vicy5zb3VuZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiYWNrZ3JvdW5kJzpcbiAgICAgIGNvbnRlbnQgPSBiYWNrZ3JvdW5kVmlldyhjdHJsLnN1YnMuYmFja2dyb3VuZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdib2FyZCc6XG4gICAgICBjb250ZW50ID0gYm9hcmRWaWV3KGN0cmwuc3Vicy5ib2FyZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0aGVtZSc6XG4gICAgICBjb250ZW50ID0gdGhlbWVWaWV3KGN0cmwuc3Vicy50aGVtZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwaWVjZSc6XG4gICAgICBjb250ZW50ID0gcGllY2VWaWV3KGN0cmwuc3Vicy5waWVjZSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29udGVudCA9IGxpbmtzKGN0cmwpO1xuICB9XG4gIHJldHVybiBoKCdkaXYjZGFzaGVyX2FwcC5kcm9wZG93bicsIGNvbnRlbnQpO1xufVxuIiwiY29uc3QgaGVhZGVycyA9IHtcbiAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQubGljaGVzcy52NCtqc29uJ1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldCh1cmw6IHN0cmluZywgY2FjaGU6IGJvb2xlYW4gPSBmYWxzZSkge1xuICByZXR1cm4gJC5hamF4KHtcbiAgICB1cmwsXG4gICAgaGVhZGVycyxcbiAgICBjYWNoZVxuICB9KTtcbn1cbiJdfQ==
