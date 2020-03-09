(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessNotify = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
let notifications = [];
let listening = false;
function listenToFocus() {
    if (!listening) {
        listening = true;
        window.addEventListener('focus', () => {
            notifications.forEach(n => n.close());
            notifications = [];
        });
    }
}
function notify(msg) {
    const storage = window.lichess.storage.make('just-notified');
    if (document.hasFocus() || Date.now() - parseInt(storage.get(), 10) < 1000)
        return;
    storage.set('' + Date.now());
    if ($.isFunction(msg))
        msg = msg();
    const notification = new Notification('lichess.org', {
        icon: window.lichess.assetUrl('logo/lichess-favicon-256.png', { noVersion: true }),
        body: msg
    });
    notification.onclick = () => window.focus();
    notifications.push(notification);
    listenToFocus();
}
function default_1(msg) {
    if (document.hasFocus() || !('Notification' in window))
        return;
    if (Notification.permission === 'granted') {
        // increase chances that the first tab can put a local storage lock
        setTimeout(notify, 10 + Math.random() * 500, msg);
    }
}
exports.default = default_1;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_1 = require("common/notification");
const view_1 = require("./view");
const li = window.lichess;
function ctrl(opts, redraw) {
    let data;
    let initiating = true;
    let scrolling = false;
    const readAllStorage = li.storage.make('notify-read-all');
    readAllStorage.listen(_ => {
        if (data) {
            data.unread = 0;
            opts.setCount(0);
            redraw();
        }
    });
    function update(d, incoming) {
        data = d;
        if (data.pager.currentPage === 1 && data.unread && opts.isVisible()) {
            opts.setNotified();
            data.unread = 0;
            readAllStorage.fire();
        }
        initiating = false;
        scrolling = false;
        opts.setCount(data.unread);
        if (incoming)
            notifyNew();
        redraw();
    }
    function notifyNew() {
        if (!data || data.pager.currentPage !== 1)
            return;
        const notif = data.pager.currentPageResults.find(n => !n.read);
        if (!notif)
            return;
        opts.pulse();
        if (!li.quietMode)
            li.sound.newPM();
        const text = view_1.asText(notif);
        const pushSubsribed = parseInt(li.storage.get('push-subscribed') || '0', 10) + 86400000 >= Date.now(); // 24h
        if (!pushSubsribed && text)
            notification_1.default(text);
    }
    function loadPage(page) {
        return $.get('/notify', { page: page || 1 }).then(d => update(d, false));
    }
    function nextPage() {
        if (!data || !data.pager.nextPage)
            return;
        scrolling = true;
        loadPage(data.pager.nextPage);
        redraw();
    }
    function previousPage() {
        if (!data || !data.pager.previousPage)
            return;
        scrolling = true;
        loadPage(data.pager.previousPage);
        redraw();
    }
    function setVisible() {
        if (!data || data.pager.currentPage === 1)
            loadPage(1);
    }
    return {
        data: () => data,
        initiating: () => initiating,
        scrolling: () => scrolling,
        update,
        nextPage,
        previousPage,
        loadPage,
        setVisible
    };
}
exports.default = ctrl;

},{"./view":13,"common/notification":9}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const ctrl_1 = require("./ctrl");
const view_1 = require("./view");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
function LichessNotify(element, opts) {
    let vnode, ctrl;
    function redraw() {
        vnode = patch(vnode, view_1.default(ctrl));
    }
    ctrl = ctrl_1.default(opts, redraw);
    vnode = patch(element, view_1.default(ctrl));
    if (opts.data)
        ctrl.update(opts.data, opts.incoming);
    else
        ctrl.loadPage(1);
    return {
        update: ctrl.update,
        setVisible: ctrl.setVisible,
        redraw
    };
}
exports.default = LichessNotify;
;

},{"./ctrl":10,"./view":13,"snabbdom":6,"snabbdom/modules/attributes":4,"snabbdom/modules/class":5}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
// function generic(n: Notification, url: string | undefined, icon: string, content: VNode[]): VNode {
exports.renderers = {
    genericLink: {
        html: n => generic(n, n.content.url, n.content.icon, [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', n.content.title),
                drawTime(n)
            ]),
            snabbdom_1.h('span', n.content.text)
        ]),
        text: n => n.content.title || n.content.text
    },
    mention: {
        html: n => generic(n, "/forum/redirect/post/" + n.content.postId, 'd', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', userFullName(n.content.mentionedBy)),
                drawTime(n)
            ]),
            snabbdom_1.h('span', ' mentioned you in « ' + n.content.topic + ' ».')
        ]),
        text: n => userFullName(n.content.mentionedBy) + ' mentioned you in « ' + n.content.topic + ' ».'
    },
    invitedStudy: {
        html: n => generic(n, "/study/" + n.content.studyId, '4', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', userFullName(n.content.invitedBy)),
                drawTime(n)
            ]),
            snabbdom_1.h('span', ' invited you to « ' + n.content.studyName + ' ».')
        ]),
        text: n => userFullName(n.content.invitedBy) + ' invited you to « ' + n.content.studyName + ' ».'
    },
    privateMessage: {
        html: n => generic(n, "/inbox/" + n.content.user.name, 'c', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', userFullName(n.content.user)),
                drawTime(n)
            ]),
            snabbdom_1.h('span', n.content.text)
        ]),
        text: n => userFullName(n.content.sender) + ': ' + n.content.text
    },
    teamJoined: {
        html: n => generic(n, "/team/" + n.content.id, 'f', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', n.content.name),
                drawTime(n)
            ]),
            snabbdom_1.h('span', "You are now part of the team.")
        ]),
        text: n => "You have joined  « " + n.content.name + "  »."
    },
    teamMadeOwner: {
        html: n => generic(n, "/team/" + n.content.id, 'f', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', n.content.name),
                drawTime(n)
            ]),
            snabbdom_1.h('span', "You are appointed as team owner.")
        ]),
        text: n => "You are now the owner of  « " + n.content.name + "  »."
    },
    titledTourney: {
        html: n => generic(n, '/tournament/' + n.content.id, 'g', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', 'Lichess Titled Arena'),
                drawTime(n)
            ]),
            snabbdom_1.h('span', n.content.text)
        ]),
        text: _ => 'Lichess Titled Arena'
    },
    reportedBanned: {
        html: n => generic(n, undefined, '', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', 'Someone you reported was banned')
            ]),
            snabbdom_1.h('span', 'Thank you for the help!')
        ]),
        text: _ => 'Someone you reported was banned'
    },
    gameEnd: {
        html: n => {
            let result;
            switch (n.content.win) {
                case true:
                    result = 'Congratulations, you won!';
                    break;
                case false:
                    result = 'You lost!';
                    break;
                default:
                    result = "It's a draw.";
            }
            return generic(n, "/" + n.content.id, ';', [
                snabbdom_1.h('span', [
                    snabbdom_1.h('strong', 'Game vs ' + userFullName(n.content.opponent)),
                    drawTime(n)
                ]),
                snabbdom_1.h('span', result)
            ]);
        },
        text: function (n) {
            let result;
            switch (n.content.win) {
                case true:
                    result = 'Victory';
                    break;
                case false:
                    result = 'Defeat';
                    break;
                default:
                    result = 'Draw';
            }
            return result + ' vs ' + userFullName(n.content.opponent);
        }
    },
    planStart: {
        html: n => generic(n, '/patron', '', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', 'Thank you!'),
                drawTime(n)
            ]),
            snabbdom_1.h('span', 'You just became a lichess Patron.')
        ]),
        text: _ => 'You just became a lichess Patron.'
    },
    planExpire: {
        html: n => generic(n, '/patron', '', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', 'Patron account expired'),
                drawTime(n)
            ]),
            snabbdom_1.h('span', 'Please consider renewing it!')
        ]),
        text: _ => 'Patron account expired'
    },
    coachReview: {
        html: n => generic(n, '/coach/edit', ':', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', 'New pending review'),
                drawTime(n)
            ]),
            snabbdom_1.h('span', 'Someone reviewed your coach profile.')
        ]),
        text: _ => 'New pending review'
    },
    ratingRefund: {
        html: n => generic(n, '/player/myself', '', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', 'You lost to a cheater'),
                drawTime(n)
            ]),
            snabbdom_1.h('span', 'Refund: ' + n.content.points + ' ' + n.content.perf + ' rating points.')
        ]),
        text: n => 'Refund: ' + n.content.points + ' ' + n.content.perf + ' rating points.'
    },
    corresAlarm: {
        html: n => generic(n, '/' + n.content.id, ';', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', 'Time is almost up!'),
                drawTime(n)
            ]),
            snabbdom_1.h('span', 'Game vs ' + n.content.op)
        ]),
        text: _ => 'Time is almost up!'
    },
    irwinDone: {
        html: n => generic(n, '/@/' + n.content.user.name + '?mod', '', [
            snabbdom_1.h('span', [
                snabbdom_1.h('strong', userFullName(n.content.user)),
                drawTime(n)
            ]),
            snabbdom_1.h('span', 'Irwin job complete!')
        ]),
        text: n => n.content.user.name + ': Irwin job complete!'
    }
};
function generic(n, url, icon, content) {
    return snabbdom_1.h(url ? 'a' : 'span', {
        class: {
            site_notification: true,
            [n.type]: true,
            'new': !n.read
        },
        attrs: url ? { href: url } : undefined
    }, [
        snabbdom_1.h('i', {
            attrs: { 'data-icon': icon }
        }),
        snabbdom_1.h('span.content', content)
    ]);
}
function drawTime(n) {
    var date = new Date(n.date);
    return snabbdom_1.h('time.timeago', {
        attrs: {
            title: date.toLocaleString(),
            datetime: n.date
        }
    }, window.lichess.timeago.format(date));
}
function userFullName(u) {
    if (!u)
        return 'Anonymous';
    return u.title ? u.title + ' ' + u.name : u.name;
}

},{"snabbdom":6}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const renderers_1 = require("./renderers");
function default_1(ctrl) {
    const d = ctrl.data();
    return snabbdom_1.h('div#notify-app.links.dropdown', d && !ctrl.initiating() ? renderContent(ctrl, d) : [snabbdom_1.h('div.initiating', spinner())]);
}
exports.default = default_1;
function renderContent(ctrl, d) {
    const pager = d.pager;
    const nb = pager.currentPageResults.length;
    const nodes = [];
    if (pager.previousPage)
        nodes.push(snabbdom_1.h('div.pager.prev', {
            attrs: { 'data-icon': 'S' },
            hook: clickHook(ctrl.previousPage)
        }));
    else if (pager.nextPage)
        nodes.push(snabbdom_1.h('div.pager.prev.disabled', {
            attrs: { 'data-icon': 'S' },
        }));
    nodes.push(nb ? recentNotifications(d, ctrl.scrolling()) : empty());
    if (pager.nextPage)
        nodes.push(snabbdom_1.h('div.pager.next', {
            attrs: { 'data-icon': 'R' },
            hook: clickHook(ctrl.nextPage)
        }));
    if (!('Notification' in window))
        nodes.push(snabbdom_1.h('div.browser-notification', 'Browser does not support notification popups'));
    else if (Notification.permission == 'denied')
        nodes.push(notificationDenied());
    return nodes;
}
function asText(n) {
    return renderers_1.renderers[n.type] ? renderers_1.renderers[n.type].text(n) : undefined;
}
exports.asText = asText;
function notificationDenied() {
    return snabbdom_1.h('a.browser-notification.denied', {
        attrs: {
            href: '/faq#browser-notifications',
            target: '_blank'
        }
    }, 'Notification popups disabled by browser setting');
}
function asHtml(n) {
    return renderers_1.renderers[n.type] ? renderers_1.renderers[n.type].html(n) : undefined;
}
function clickHook(f) {
    return {
        insert: (vnode) => {
            vnode.elm.addEventListener('click', f);
        }
    };
}
const contentLoaded = () => window.lichess.pubsub.emit('content_loaded');
function recentNotifications(d, scrolling) {
    return snabbdom_1.h('div', {
        class: {
            notifications: true,
            scrolling
        },
        hook: {
            insert: contentLoaded,
            postpatch: contentLoaded
        }
    }, d.pager.currentPageResults.map(asHtml));
}
function empty() {
    return snabbdom_1.h('div.empty.text', { attrs: { 'data-icon': '' } }, 'No notifications.');
}
function spinner() {
    return snabbdom_1.h('div.spinner', [
        snabbdom_1.h('svg', { attrs: { viewBox: '0 0 40 40' } }, [
            snabbdom_1.h('circle', { attrs: { cx: 20, cy: 20, r: 18, fill: 'none' } })
        ])
    ]);
}

},{"./renderers":12,"snabbdom":6}]},{},[11])(11)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3RodW5rLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3Zub2RlLmpzIiwiLi4vY29tbW9uL3NyYy9ub3RpZmljYXRpb24udHMiLCJzcmMvY3RybC50cyIsInNyYy9tYWluLnRzIiwic3JjL3JlbmRlcmVycy50cyIsInNyYy92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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RUFBRSxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDbkYsQ0FBQztBQUVELFNBQVMsT0FBTztJQUNkLE9BQU8sWUFBQyxDQUFDLGFBQWEsRUFBRTtRQUN0QixZQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUU7WUFDNUMsWUFBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1NBQUMsQ0FBQztLQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gICAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4gICAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkRGF0YSA9IGNoaWxkcmVuW2ldLmRhdGE7XG4gICAgICAgICAgICBpZiAoY2hpbGREYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhZGROUyhjaGlsZERhdGEsIGNoaWxkcmVuW2ldLmNoaWxkcmVuLCBjaGlsZHJlbltpXS5zZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgICBpZiAoYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGEgPSBiO1xuICAgICAgICBpZiAoaXMuYXJyYXkoYykpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHtcbiAgICAgICAgICAgIHRleHQgPSBjO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMgJiYgYy5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2NdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXMuYXJyYXkoYikpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYikpIHtcbiAgICAgICAgICAgIHRleHQgPSBiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIgJiYgYi5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2JdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YSA9IGI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKVxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldID0gdm5vZGVfMS52bm9kZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnICYmXG4gICAgICAgIChzZWwubGVuZ3RoID09PSAzIHx8IHNlbFszXSA9PT0gJy4nIHx8IHNlbFszXSA9PT0gJyMnKSkge1xuICAgICAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlXzEudm5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn1cbmV4cG9ydHMuaCA9IGg7XG47XG5leHBvcnRzLmRlZmF1bHQgPSBoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xufVxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkge1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ2hpbGQobm9kZSwgY2hpbGQpIHtcbiAgICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlO1xufVxuZnVuY3Rpb24gbmV4dFNpYmxpbmcobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xufVxuZnVuY3Rpb24gdGFnTmFtZShlbG0pIHtcbiAgICByZXR1cm4gZWxtLnRhZ05hbWU7XG59XG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChub2RlLCB0ZXh0KSB7XG4gICAgbm9kZS50ZXh0Q29udGVudCA9IHRleHQ7XG59XG5mdW5jdGlvbiBnZXRUZXh0Q29udGVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dENvbnRlbnQ7XG59XG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxO1xufVxuZnVuY3Rpb24gaXNUZXh0KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMztcbn1cbmV4cG9ydHMuaHRtbERvbUFwaSA9IHtcbiAgICBjcmVhdGVFbGVtZW50OiBjcmVhdGVFbGVtZW50LFxuICAgIGNyZWF0ZUVsZW1lbnROUzogY3JlYXRlRWxlbWVudE5TLFxuICAgIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gICAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICAgIHBhcmVudE5vZGU6IHBhcmVudE5vZGUsXG4gICAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgc2V0VGV4dENvbnRlbnQ6IHNldFRleHRDb250ZW50LFxuICAgIGdldFRleHRDb250ZW50OiBnZXRUZXh0Q29udGVudCxcbiAgICBpc0VsZW1lbnQ6IGlzRWxlbWVudCxcbiAgICBpc1RleHQ6IGlzVGV4dCxcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmh0bWxEb21BcGk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1odG1sZG9tYXBpLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5hcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBwcmltaXRpdmUocykge1xuICAgIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5wcmltaXRpdmUgPSBwcmltaXRpdmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBrZXksIGVsbSA9IHZub2RlLmVsbSwgb2xkQXR0cnMgPSBvbGRWbm9kZS5kYXRhLmF0dHJzLCBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnM7XG4gICAgaWYgKCFvbGRBdHRycyAmJiAhYXR0cnMpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQXR0cnMgPT09IGF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQXR0cnMgPSBvbGRBdHRycyB8fCB7fTtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuICAgIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgICBmb3IgKGtleSBpbiBhdHRycykge1xuICAgICAgICB2YXIgY3VyID0gYXR0cnNba2V5XTtcbiAgICAgICAgdmFyIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgICAgICAgaWYgKGN1ciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGN1ciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgY3VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyByZW1vdmUgcmVtb3ZlZCBhdHRyaWJ1dGVzXG4gICAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAgIC8vIHRoZSBvdGhlciBvcHRpb24gaXMgdG8gcmVtb3ZlIGFsbCBhdHRyaWJ1dGVzIHdpdGggdmFsdWUgPT0gdW5kZWZpbmVkXG4gICAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICAgICAgaWYgKCEoa2V5IGluIGF0dHJzKSkge1xuICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUF0dHJzLCB1cGRhdGU6IHVwZGF0ZUF0dHJzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmF0dHJpYnV0ZXNNb2R1bGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdHRyaWJ1dGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gdXBkYXRlQ2xhc3Mob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBvbGRDbGFzcyA9IG9sZFZub2RlLmRhdGEuY2xhc3MsIGtsYXNzID0gdm5vZGUuZGF0YS5jbGFzcztcbiAgICBpZiAoIW9sZENsYXNzICYmICFrbGFzcylcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChvbGRDbGFzcyA9PT0ga2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBvbGRDbGFzcyA9IG9sZENsYXNzIHx8IHt9O1xuICAgIGtsYXNzID0ga2xhc3MgfHwge307XG4gICAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgICAgIGlmICgha2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgICAgICBjdXIgPSBrbGFzc1tuYW1lXTtcbiAgICAgICAgaWYgKGN1ciAhPT0gb2xkQ2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3RbY3VyID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmNsYXNzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmNsYXNzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2xhc3MuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG52YXIgaHRtbGRvbWFwaV8xID0gcmVxdWlyZShcIi4vaHRtbGRvbWFwaVwiKTtcbmZ1bmN0aW9uIGlzVW5kZWYocykgeyByZXR1cm4gcyA9PT0gdW5kZWZpbmVkOyB9XG5mdW5jdGlvbiBpc0RlZihzKSB7IHJldHVybiBzICE9PSB1bmRlZmluZWQ7IH1cbnZhciBlbXB0eU5vZGUgPSB2bm9kZV8xLmRlZmF1bHQoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuZnVuY3Rpb24gc2FtZVZub2RlKHZub2RlMSwgdm5vZGUyKSB7XG4gICAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cbmZ1bmN0aW9uIGlzVm5vZGUodm5vZGUpIHtcbiAgICByZXR1cm4gdm5vZGUuc2VsICE9PSB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICAgIHZhciBpLCBtYXAgPSB7fSwga2V5LCBjaDtcbiAgICBmb3IgKGkgPSBiZWdpbklkeDsgaSA8PSBlbmRJZHg7ICsraSkge1xuICAgICAgICBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAga2V5ID0gY2gua2V5O1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcFtrZXldID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxudmFyIGhvb2tzID0gWydjcmVhdGUnLCAndXBkYXRlJywgJ3JlbW92ZScsICdkZXN0cm95JywgJ3ByZScsICdwb3N0J107XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmV4cG9ydHMuaCA9IGhfMS5oO1xudmFyIHRodW5rXzEgPSByZXF1aXJlKFwiLi90aHVua1wiKTtcbmV4cG9ydHMudGh1bmsgPSB0aHVua18xLnRodW5rO1xuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBkb21BcGkpIHtcbiAgICB2YXIgaSwgaiwgY2JzID0ge307XG4gICAgdmFyIGFwaSA9IGRvbUFwaSAhPT0gdW5kZWZpbmVkID8gZG9tQXBpIDogaHRtbGRvbWFwaV8xLmRlZmF1bHQ7XG4gICAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNic1tob29rc1tpXV0gPSBbXTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIHZhciBob29rID0gbW9kdWxlc1tqXVtob29rc1tpXV07XG4gICAgICAgICAgICBpZiAoaG9vayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2JzW2hvb2tzW2ldXS5wdXNoKGhvb2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgICAgICB2YXIgaWQgPSBlbG0uaWQgPyAnIycgKyBlbG0uaWQgOiAnJztcbiAgICAgICAgdmFyIGMgPSBlbG0uY2xhc3NOYW1lID8gJy4nICsgZWxtLmNsYXNzTmFtZS5zcGxpdCgnICcpLmpvaW4oJy4nKSA6ICcnO1xuICAgICAgICByZXR1cm4gdm5vZGVfMS5kZWZhdWx0KGFwaS50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSArIGlkICsgYywge30sIFtdLCB1bmRlZmluZWQsIGVsbSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcm1DYigpIHtcbiAgICAgICAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRfMSA9IGFwaS5wYXJlbnROb2RlKGNoaWxkRWxtKTtcbiAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50XzEsIGNoaWxkRWxtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuaW5pdCkpIHtcbiAgICAgICAgICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgICAgICBpZiAoc2VsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIFBhcnNlIHNlbGVjdG9yXG4gICAgICAgICAgICB2YXIgaGFzaElkeCA9IHNlbC5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgICB2YXIgZG90SWR4ID0gc2VsLmluZGV4T2YoJy4nLCBoYXNoSWR4KTtcbiAgICAgICAgICAgIHZhciBoYXNoID0gaGFzaElkeCA+IDAgPyBoYXNoSWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkb3QgPSBkb3RJZHggPiAwID8gZG90SWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciB0YWcgPSBoYXNoSWR4ICE9PSAtMSB8fCBkb3RJZHggIT09IC0xID8gc2VsLnNsaWNlKDAsIE1hdGgubWluKGhhc2gsIGRvdCkpIDogc2VsO1xuICAgICAgICAgICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgICAgICAgIGlmIChoYXNoIDwgZG90KVxuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ2lkJywgc2VsLnNsaWNlKGhhc2ggKyAxLCBkb3QpKTtcbiAgICAgICAgICAgIGlmIChkb3RJZHggPiAwKVxuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgc2VsLnNsaWNlKGRvdCArIDEpLnJlcGxhY2UoL1xcLi9nLCAnICcpKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5jcmVhdGVbaV0oZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzLnByaW1pdGl2ZSh2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gdm5vZGUuZGF0YS5ob29rOyAvLyBSZXVzZSB2YXJpYWJsZVxuICAgICAgICAgICAgaWYgKGlzRGVmKGkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkuY3JlYXRlKVxuICAgICAgICAgICAgICAgICAgICBpLmNyZWF0ZShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoaS5pbnNlcnQpXG4gICAgICAgICAgICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZub2RlLmVsbSA9IGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm5vZGUuZWxtO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0oY2gsIGluc2VydGVkVm5vZGVRdWV1ZSksIGJlZm9yZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gaW52b2tlRGVzdHJveUhvb2sodm5vZGUpIHtcbiAgICAgICAgdmFyIGksIGosIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuZGVzdHJveSkpXG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLmRlc3Ryb3lbaV0odm5vZGUpO1xuICAgICAgICAgICAgaWYgKHZub2RlLmNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgaSA9IHZub2RlLmNoaWxkcmVuW2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPSBudWxsICYmIHR5cGVvZiBpICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVWbm9kZXMocGFyZW50RWxtLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgpIHtcbiAgICAgICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgICAgICAgdmFyIGlfMSA9IHZvaWQgMCwgbGlzdGVuZXJzID0gdm9pZCAwLCBybSA9IHZvaWQgMCwgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYoY2guc2VsKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhjaCk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgICAgICAgICAgICAgcm0gPSBjcmVhdGVSbUNiKGNoLmVsbSwgbGlzdGVuZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpXzEgPSAwOyBpXzEgPCBjYnMucmVtb3ZlLmxlbmd0aDsgKytpXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICBjYnMucmVtb3ZlW2lfMV0oY2gsIHJtKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmKGlfMSA9IGNoLmRhdGEpICYmIGlzRGVmKGlfMSA9IGlfMS5ob29rKSAmJiBpc0RlZihpXzEgPSBpXzEucmVtb3ZlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaV8xKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBybSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1cGRhdGVDaGlsZHJlbihwYXJlbnRFbG0sIG9sZENoLCBuZXdDaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBvbGRTdGFydElkeCA9IDAsIG5ld1N0YXJ0SWR4ID0gMDtcbiAgICAgICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciBvbGRTdGFydFZub2RlID0gb2xkQ2hbMF07XG4gICAgICAgIHZhciBvbGRFbmRWbm9kZSA9IG9sZENoW29sZEVuZElkeF07XG4gICAgICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWzBdO1xuICAgICAgICB2YXIgbmV3RW5kVm5vZGUgPSBuZXdDaFtuZXdFbmRJZHhdO1xuICAgICAgICB2YXIgb2xkS2V5VG9JZHg7XG4gICAgICAgIHZhciBpZHhJbk9sZDtcbiAgICAgICAgdmFyIGVsbVRvTW92ZTtcbiAgICAgICAgdmFyIGJlZm9yZTtcbiAgICAgICAgd2hpbGUgKG9sZFN0YXJ0SWR4IDw9IG9sZEVuZElkeCAmJiBuZXdTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgICAgICAgIGlmIChvbGRTdGFydFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07IC8vIFZub2RlIG1pZ2h0IGhhdmUgYmVlbiBtb3ZlZCBsZWZ0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvbGRFbmRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdTdGFydFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdFbmRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkU3RhcnRWbm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhvbGRFbmRWbm9kZS5lbG0pKTtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZEtleVRvSWR4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkS2V5VG9JZHggPSBjcmVhdGVLZXlUb09sZElkeChvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkeEluT2xkID0gb2xkS2V5VG9JZHhbbmV3U3RhcnRWbm9kZS5rZXldO1xuICAgICAgICAgICAgICAgIGlmIChpc1VuZGVmKGlkeEluT2xkKSkge1xuICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxtVG9Nb3ZlID0gb2xkQ2hbaWR4SW5PbGRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxtVG9Nb3ZlLnNlbCAhPT0gbmV3U3RhcnRWbm9kZS5zZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgZWxtVG9Nb3ZlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICAgICAgICBiZWZvcmUgPSBuZXdDaFtuZXdFbmRJZHggKyAxXSA9PSBudWxsID8gbnVsbCA6IG5ld0NoW25ld0VuZElkeCArIDFdLmVsbTtcbiAgICAgICAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBob29rO1xuICAgICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEpICYmIGlzRGVmKGhvb2sgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBob29rLnByZXBhdGNoKSkge1xuICAgICAgICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgIHZhciBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuO1xuICAgICAgICB2YXIgY2ggPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKG9sZFZub2RlID09PSB2bm9kZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHZub2RlLmRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy51cGRhdGUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLnVwZGF0ZVtpXShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vaztcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKVxuICAgICAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkQ2ggIT09IGNoKVxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSlcbiAgICAgICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgICAgIGFkZFZub2RlcyhlbG0sIG51bGwsIGNoLCAwLCBjaC5sZW5ndGggLSAxLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlVm5vZGVzKGVsbSwgb2xkQ2gsIDAsIG9sZENoLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2xkVm5vZGUudGV4dCAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRGVmKGhvb2spICYmIGlzRGVmKGkgPSBob29rLnBvc3RwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gcGF0Y2gob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBlbG0sIHBhcmVudDtcbiAgICAgICAgdmFyIGluc2VydGVkVm5vZGVRdWV1ZSA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnByZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wcmVbaV0oKTtcbiAgICAgICAgaWYgKCFpc1Zub2RlKG9sZFZub2RlKSkge1xuICAgICAgICAgICAgb2xkVm5vZGUgPSBlbXB0eU5vZGVBdChvbGRWbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICAgICAgICBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgICAgICAgIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGVsbSk7XG4gICAgICAgICAgICBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnQsIHZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKGVsbSkpO1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnQsIFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbnNlcnRlZFZub2RlUXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KGluc2VydGVkVm5vZGVRdWV1ZVtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wb3N0Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgY2JzLnBvc3RbaV0oKTtcbiAgICAgICAgcmV0dXJuIHZub2RlO1xuICAgIH07XG59XG5leHBvcnRzLmluaXQgPSBpbml0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c25hYmJkb20uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmZ1bmN0aW9uIGNvcHlUb1RodW5rKHZub2RlLCB0aHVuaykge1xuICAgIHRodW5rLmVsbSA9IHZub2RlLmVsbTtcbiAgICB2bm9kZS5kYXRhLmZuID0gdGh1bmsuZGF0YS5mbjtcbiAgICB2bm9kZS5kYXRhLmFyZ3MgPSB0aHVuay5kYXRhLmFyZ3M7XG4gICAgdGh1bmsuZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdGh1bmsuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICB0aHVuay50ZXh0ID0gdm5vZGUudGV4dDtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG59XG5mdW5jdGlvbiBpbml0KHRodW5rKSB7XG4gICAgdmFyIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIHZub2RlID0gY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgY3VyLmFyZ3MpO1xuICAgIGNvcHlUb1RodW5rKHZub2RlLCB0aHVuayk7XG59XG5mdW5jdGlvbiBwcmVwYXRjaChvbGRWbm9kZSwgdGh1bmspIHtcbiAgICB2YXIgaSwgb2xkID0gb2xkVm5vZGUuZGF0YSwgY3VyID0gdGh1bmsuZGF0YTtcbiAgICB2YXIgb2xkQXJncyA9IG9sZC5hcmdzLCBhcmdzID0gY3VyLmFyZ3M7XG4gICAgaWYgKG9sZC5mbiAhPT0gY3VyLmZuIHx8IG9sZEFyZ3MubGVuZ3RoICE9PSBhcmdzLmxlbmd0aCkge1xuICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChvbGRBcmdzW2ldICE9PSBhcmdzW2ldKSB7XG4gICAgICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvcHlUb1RodW5rKG9sZFZub2RlLCB0aHVuayk7XG59XG5leHBvcnRzLnRodW5rID0gZnVuY3Rpb24gdGh1bmsoc2VsLCBrZXksIGZuLCBhcmdzKSB7XG4gICAgaWYgKGFyZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhcmdzID0gZm47XG4gICAgICAgIGZuID0ga2V5O1xuICAgICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBoXzEuaChzZWwsIHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGhvb2s6IHsgaW5pdDogaW5pdCwgcHJlcGF0Y2g6IHByZXBhdGNoIH0sXG4gICAgICAgIGZuOiBmbixcbiAgICAgICAgYXJnczogYXJnc1xuICAgIH0pO1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMudGh1bms7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aHVuay5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIGVsbSkge1xuICAgIHZhciBrZXkgPSBkYXRhID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBkYXRhLmtleTtcbiAgICByZXR1cm4geyBzZWw6IHNlbCwgZGF0YTogZGF0YSwgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICB0ZXh0OiB0ZXh0LCBlbG06IGVsbSwga2V5OiBrZXkgfTtcbn1cbmV4cG9ydHMudm5vZGUgPSB2bm9kZTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZub2RlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dm5vZGUuanMubWFwIiwibGV0IG5vdGlmaWNhdGlvbnM6IEFycmF5PE5vdGlmaWNhdGlvbj4gPSBbXTtcbmxldCBsaXN0ZW5pbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gbGlzdGVuVG9Gb2N1cygpIHtcbiAgaWYgKCFsaXN0ZW5pbmcpIHtcbiAgICBsaXN0ZW5pbmcgPSB0cnVlO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHtcbiAgICAgIG5vdGlmaWNhdGlvbnMuZm9yRWFjaChuID0+IG4uY2xvc2UoKSk7XG4gICAgICBub3RpZmljYXRpb25zID0gW107XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbm90aWZ5KG1zZzogc3RyaW5nIHwgKCgpID0+IHN0cmluZykpIHtcbiAgY29uc3Qgc3RvcmFnZSA9IHdpbmRvdy5saWNoZXNzLnN0b3JhZ2UubWFrZSgnanVzdC1ub3RpZmllZCcpO1xuICBpZiAoZG9jdW1lbnQuaGFzRm9jdXMoKSB8fCBEYXRlLm5vdygpIC0gcGFyc2VJbnQoc3RvcmFnZS5nZXQoKSEsIDEwKSA8IDEwMDApIHJldHVybjtcbiAgc3RvcmFnZS5zZXQoJycgKyBEYXRlLm5vdygpKTtcbiAgaWYgKCQuaXNGdW5jdGlvbihtc2cpKSBtc2cgPSBtc2coKTtcbiAgY29uc3Qgbm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbignbGljaGVzcy5vcmcnLCB7XG4gICAgaWNvbjogd2luZG93LmxpY2hlc3MuYXNzZXRVcmwoJ2xvZ28vbGljaGVzcy1mYXZpY29uLTI1Ni5wbmcnLCB7bm9WZXJzaW9uOiB0cnVlfSksXG4gICAgYm9keTogbXNnXG4gIH0pO1xuICBub3RpZmljYXRpb24ub25jbGljayA9ICgpID0+IHdpbmRvdy5mb2N1cygpO1xuICBub3RpZmljYXRpb25zLnB1c2gobm90aWZpY2F0aW9uKTtcbiAgbGlzdGVuVG9Gb2N1cygpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtc2c6IHN0cmluZyB8ICgoKSA9PiBzdHJpbmcpKSB7XG4gIGlmIChkb2N1bWVudC5oYXNGb2N1cygpIHx8ICEoJ05vdGlmaWNhdGlvbicgaW4gd2luZG93KSkgcmV0dXJuO1xuICBpZiAoTm90aWZpY2F0aW9uLnBlcm1pc3Npb24gPT09ICdncmFudGVkJykge1xuICAgIC8vIGluY3JlYXNlIGNoYW5jZXMgdGhhdCB0aGUgZmlyc3QgdGFiIGNhbiBwdXQgYSBsb2NhbCBzdG9yYWdlIGxvY2tcbiAgICBzZXRUaW1lb3V0KG5vdGlmeSwgMTAgKyBNYXRoLnJhbmRvbSgpICogNTAwLCBtc2cpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBDdHJsLCBOb3RpZnlPcHRzLCBOb3RpZnlEYXRhLCBSZWRyYXcgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IG5vdGlmeSBmcm9tICdjb21tb24vbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IGFzVGV4dCB9IGZyb20gJy4vdmlldyc7XG5cbmNvbnN0IGxpID0gd2luZG93LmxpY2hlc3M7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGN0cmwob3B0czogTm90aWZ5T3B0cywgcmVkcmF3OiBSZWRyYXcpOiBDdHJsIHtcblxuICBsZXQgZGF0YTogTm90aWZ5RGF0YSB8IHVuZGVmaW5lZFxuICBsZXQgaW5pdGlhdGluZyA9IHRydWU7XG4gIGxldCBzY3JvbGxpbmcgPSBmYWxzZTtcblxuICBjb25zdCByZWFkQWxsU3RvcmFnZSA9IGxpLnN0b3JhZ2UubWFrZSgnbm90aWZ5LXJlYWQtYWxsJyk7XG5cbiAgcmVhZEFsbFN0b3JhZ2UubGlzdGVuKF8gPT4ge1xuICAgIGlmIChkYXRhKSB7XG4gICAgICBkYXRhLnVucmVhZCA9IDA7XG4gICAgICBvcHRzLnNldENvdW50KDApO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiB1cGRhdGUoZDogTm90aWZ5RGF0YSwgaW5jb21pbmc6IGJvb2xlYW4pIHtcbiAgICBkYXRhID0gZDtcbiAgICBpZiAoZGF0YS5wYWdlci5jdXJyZW50UGFnZSA9PT0gMSAmJiBkYXRhLnVucmVhZCAmJiBvcHRzLmlzVmlzaWJsZSgpKSB7XG4gICAgICBvcHRzLnNldE5vdGlmaWVkKCk7XG4gICAgICBkYXRhLnVucmVhZCA9IDA7XG4gICAgICByZWFkQWxsU3RvcmFnZS5maXJlKCk7XG4gICAgfVxuICAgIGluaXRpYXRpbmcgPSBmYWxzZTtcbiAgICBzY3JvbGxpbmcgPSBmYWxzZTtcbiAgICBvcHRzLnNldENvdW50KGRhdGEudW5yZWFkKTtcbiAgICBpZiAoaW5jb21pbmcpIG5vdGlmeU5ldygpO1xuICAgIHJlZHJhdygpO1xuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZ5TmV3KCkge1xuICAgIGlmICghZGF0YSB8fCBkYXRhLnBhZ2VyLmN1cnJlbnRQYWdlICE9PSAxKSByZXR1cm47XG4gICAgY29uc3Qgbm90aWYgPSBkYXRhLnBhZ2VyLmN1cnJlbnRQYWdlUmVzdWx0cy5maW5kKG4gPT4gIW4ucmVhZCk7XG4gICAgaWYgKCFub3RpZikgcmV0dXJuO1xuICAgIG9wdHMucHVsc2UoKTtcbiAgICBpZiAoIWxpLnF1aWV0TW9kZSkgbGkuc291bmQubmV3UE0oKTtcbiAgICBjb25zdCB0ZXh0ID0gYXNUZXh0KG5vdGlmKTtcbiAgICBjb25zdCBwdXNoU3Vic3JpYmVkID0gcGFyc2VJbnQobGkuc3RvcmFnZS5nZXQoJ3B1c2gtc3Vic2NyaWJlZCcpIHx8ICcwJywgMTApICsgODY0MDAwMDAgPj0gRGF0ZS5ub3coKTsgLy8gMjRoXG4gICAgaWYgKCFwdXNoU3Vic3JpYmVkICYmIHRleHQpIG5vdGlmeSh0ZXh0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRQYWdlKHBhZ2U6IG51bWJlcikge1xuICAgIHJldHVybiAkLmdldCgnL25vdGlmeScsIHtwYWdlOiBwYWdlIHx8IDF9KS50aGVuKGQgPT4gdXBkYXRlKGQsIGZhbHNlKSk7XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0UGFnZSgpIHtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEucGFnZXIubmV4dFBhZ2UpIHJldHVybjtcbiAgICBzY3JvbGxpbmcgPSB0cnVlO1xuICAgIGxvYWRQYWdlKGRhdGEucGFnZXIubmV4dFBhZ2UpO1xuICAgIHJlZHJhdygpO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJldmlvdXNQYWdlKCkge1xuICAgIGlmICghZGF0YSB8fCAhZGF0YS5wYWdlci5wcmV2aW91c1BhZ2UpIHJldHVybjtcbiAgICBzY3JvbGxpbmcgPSB0cnVlO1xuICAgIGxvYWRQYWdlKGRhdGEucGFnZXIucHJldmlvdXNQYWdlKTtcbiAgICByZWRyYXcoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFZpc2libGUoKSB7XG4gICAgaWYgKCFkYXRhIHx8IGRhdGEucGFnZXIuY3VycmVudFBhZ2UgPT09IDEpIGxvYWRQYWdlKDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBkYXRhOiAoKSA9PiBkYXRhLFxuICAgIGluaXRpYXRpbmc6ICgpID0+IGluaXRpYXRpbmcsXG4gICAgc2Nyb2xsaW5nOiAoKSA9PiBzY3JvbGxpbmcsXG4gICAgdXBkYXRlLFxuICAgIG5leHRQYWdlLFxuICAgIHByZXZpb3VzUGFnZSxcbiAgICBsb2FkUGFnZSxcbiAgICBzZXRWaXNpYmxlXG4gIH07XG59XG4iLCJpbXBvcnQgeyBpbml0IH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuaW1wb3J0IG1ha2VDdHJsIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgdmlldyBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHsgTm90aWZ5T3B0cywgQ3RybCB9IGZyb20gJy4vaW50ZXJmYWNlcydcblxuaW1wb3J0IGtsYXNzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnO1xuaW1wb3J0IGF0dHJpYnV0ZXMgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJztcblxuY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlc10pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMaWNoZXNzTm90aWZ5KGVsZW1lbnQ6IEVsZW1lbnQsIG9wdHM6IE5vdGlmeU9wdHMpIHtcblxuICBsZXQgdm5vZGU6IFZOb2RlLCBjdHJsOiBDdHJsXG5cbiAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIHZub2RlID0gcGF0Y2godm5vZGUsIHZpZXcoY3RybCkpO1xuICB9XG5cbiAgY3RybCA9IG1ha2VDdHJsKG9wdHMsIHJlZHJhdyk7XG5cbiAgdm5vZGUgPSBwYXRjaChlbGVtZW50LCB2aWV3KGN0cmwpKTtcblxuICBpZiAob3B0cy5kYXRhKSBjdHJsLnVwZGF0ZShvcHRzLmRhdGEsIG9wdHMuaW5jb21pbmcpO1xuICBlbHNlIGN0cmwubG9hZFBhZ2UoMSk7XG5cbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGN0cmwudXBkYXRlLFxuICAgIHNldFZpc2libGU6IGN0cmwuc2V0VmlzaWJsZSxcbiAgICByZWRyYXdcbiAgfTtcbn07XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuXG5pbXBvcnQgeyBOb3RpZmljYXRpb24sIFJlbmRlcmVycyB9IGZyb20gJy4vaW50ZXJmYWNlcydcblxuLy8gZnVuY3Rpb24gZ2VuZXJpYyhuOiBOb3RpZmljYXRpb24sIHVybDogc3RyaW5nIHwgdW5kZWZpbmVkLCBpY29uOiBzdHJpbmcsIGNvbnRlbnQ6IFZOb2RlW10pOiBWTm9kZSB7XG5leHBvcnQgY29uc3QgcmVuZGVyZXJzOiBSZW5kZXJlcnMgPSB7XG4gIGdlbmVyaWNMaW5rOiB7XG4gICAgaHRtbDogbiA9PiBnZW5lcmljKG4sIG4uY29udGVudC51cmwsIG4uY29udGVudC5pY29uLCBbXG4gICAgICBoKCdzcGFuJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCBuLmNvbnRlbnQudGl0bGUpLFxuICAgICAgICBkcmF3VGltZShuKVxuICAgICAgXSksXG4gICAgICBoKCdzcGFuJywgbi5jb250ZW50LnRleHQpXG4gICAgXSksXG4gICAgdGV4dDogbiA9PiBuLmNvbnRlbnQudGl0bGUgfHwgbi5jb250ZW50LnRleHRcbiAgfSxcbiAgbWVudGlvbjoge1xuICAgIGh0bWw6IG4gPT4gZ2VuZXJpYyhuLCBcIi9mb3J1bS9yZWRpcmVjdC9wb3N0L1wiICsgbi5jb250ZW50LnBvc3RJZCwgJ2QnLCBbXG4gICAgICBoKCdzcGFuJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCB1c2VyRnVsbE5hbWUobi5jb250ZW50Lm1lbnRpb25lZEJ5KSksXG4gICAgICAgIGRyYXdUaW1lKG4pXG4gICAgICBdKSxcbiAgICAgIGgoJ3NwYW4nLCAnIG1lbnRpb25lZCB5b3UgaW4gwqsgJyArIG4uY29udGVudC50b3BpYyArICcgwrsuJylcbiAgICBdKSxcbiAgICB0ZXh0OiBuID0+IHVzZXJGdWxsTmFtZShuLmNvbnRlbnQubWVudGlvbmVkQnkpICsgJyBtZW50aW9uZWQgeW91IGluIMKrICcgKyBuLmNvbnRlbnQudG9waWMgKyAnIMK7LidcbiAgfSxcbiAgaW52aXRlZFN0dWR5OiB7XG4gICAgaHRtbDogbiA9PiBnZW5lcmljKG4sIFwiL3N0dWR5L1wiICsgbi5jb250ZW50LnN0dWR5SWQsICc0JywgW1xuICAgICAgaCgnc3BhbicsIFtcbiAgICAgICAgaCgnc3Ryb25nJywgdXNlckZ1bGxOYW1lKG4uY29udGVudC5pbnZpdGVkQnkpKSxcbiAgICAgICAgZHJhd1RpbWUobilcbiAgICAgIF0pLFxuICAgICAgaCgnc3BhbicsICcgaW52aXRlZCB5b3UgdG8gwqsgJyArIG4uY29udGVudC5zdHVkeU5hbWUgKyAnIMK7LicpXG4gICAgXSksXG4gICAgdGV4dDogbiA9PiB1c2VyRnVsbE5hbWUobi5jb250ZW50Lmludml0ZWRCeSkgKyAnIGludml0ZWQgeW91IHRvIMKrICcgKyBuLmNvbnRlbnQuc3R1ZHlOYW1lICsgJyDCuy4nXG4gIH0sXG4gIHByaXZhdGVNZXNzYWdlOiB7XG4gICAgaHRtbDogbiA9PiBnZW5lcmljKG4sIFwiL2luYm94L1wiICsgbi5jb250ZW50LnVzZXIubmFtZSwgJ2MnLCBbXG4gICAgICBoKCdzcGFuJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCB1c2VyRnVsbE5hbWUobi5jb250ZW50LnVzZXIpKSxcbiAgICAgICAgZHJhd1RpbWUobilcbiAgICAgIF0pLFxuICAgICAgaCgnc3BhbicsIG4uY29udGVudC50ZXh0KVxuICAgIF0pLFxuICAgIHRleHQ6IG4gPT4gdXNlckZ1bGxOYW1lKG4uY29udGVudC5zZW5kZXIpICsgJzogJyArIG4uY29udGVudC50ZXh0XG4gIH0sXG4gIHRlYW1Kb2luZWQ6IHtcbiAgICBodG1sOiBuID0+IGdlbmVyaWMobiwgXCIvdGVhbS9cIiArIG4uY29udGVudC5pZCwgJ2YnLCBbXG4gICAgICBoKCdzcGFuJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCBuLmNvbnRlbnQubmFtZSksXG4gICAgICAgIGRyYXdUaW1lKG4pXG4gICAgICBdKSxcbiAgICAgIGgoJ3NwYW4nLCBcIllvdSBhcmUgbm93IHBhcnQgb2YgdGhlIHRlYW0uXCIpXG4gICAgXSksXG4gICAgdGV4dDogbiA9PiBcIllvdSBoYXZlIGpvaW5lZCAgwqsgXCIgKyBuLmNvbnRlbnQubmFtZSArIFwiICDCuy5cIlxuICB9LFxuICB0ZWFtTWFkZU93bmVyOiB7XG4gICAgaHRtbDogbiA9PiBnZW5lcmljKG4sIFwiL3RlYW0vXCIgKyBuLmNvbnRlbnQuaWQsICdmJywgW1xuICAgICAgaCgnc3BhbicsIFtcbiAgICAgICAgaCgnc3Ryb25nJywgbi5jb250ZW50Lm5hbWUpLFxuICAgICAgICBkcmF3VGltZShuKVxuICAgICAgXSksXG4gICAgICBoKCdzcGFuJywgXCJZb3UgYXJlIGFwcG9pbnRlZCBhcyB0ZWFtIG93bmVyLlwiKVxuICAgIF0pLFxuICAgIHRleHQ6IG4gPT4gXCJZb3UgYXJlIG5vdyB0aGUgb3duZXIgb2YgIMKrIFwiICsgbi5jb250ZW50Lm5hbWUgKyBcIiAgwrsuXCJcbiAgfSxcbiAgdGl0bGVkVG91cm5leToge1xuICAgIGh0bWw6IG4gPT4gZ2VuZXJpYyhuLCAnL3RvdXJuYW1lbnQvJyArIG4uY29udGVudC5pZCwgJ2cnLCBbXG4gICAgICBoKCdzcGFuJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCAnTGljaGVzcyBUaXRsZWQgQXJlbmEnKSxcbiAgICAgICAgZHJhd1RpbWUobilcbiAgICAgIF0pLFxuICAgICAgaCgnc3BhbicsIG4uY29udGVudC50ZXh0KVxuICAgIF0pLFxuICAgIHRleHQ6IF8gPT4gJ0xpY2hlc3MgVGl0bGVkIEFyZW5hJ1xuICB9LFxuICByZXBvcnRlZEJhbm5lZDoge1xuICAgIGh0bWw6IG4gPT4gZ2VuZXJpYyhuLCB1bmRlZmluZWQsICfugIUnLCBbXG4gICAgICBoKCdzcGFuJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCAnU29tZW9uZSB5b3UgcmVwb3J0ZWQgd2FzIGJhbm5lZCcpXG4gICAgICBdKSxcbiAgICAgIGgoJ3NwYW4nLCAnVGhhbmsgeW91IGZvciB0aGUgaGVscCEnKVxuICAgIF0pLFxuICAgIHRleHQ6IF8gPT4gJ1NvbWVvbmUgeW91IHJlcG9ydGVkIHdhcyBiYW5uZWQnXG4gIH0sXG4gIGdhbWVFbmQ6IHtcbiAgICBodG1sOiBuID0+IHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBzd2l0Y2ggKG4uY29udGVudC53aW4pIHtcbiAgICAgICAgY2FzZSB0cnVlOlxuICAgICAgICAgIHJlc3VsdCA9ICdDb25ncmF0dWxhdGlvbnMsIHlvdSB3b24hJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBmYWxzZTpcbiAgICAgICAgICByZXN1bHQgPSAnWW91IGxvc3QhJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXN1bHQgPSBcIkl0J3MgYSBkcmF3LlwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGdlbmVyaWMobiwgXCIvXCIgKyBuLmNvbnRlbnQuaWQsICc7JywgW1xuICAgICAgICBoKCdzcGFuJywgW1xuICAgICAgICAgIGgoJ3N0cm9uZycsICdHYW1lIHZzICcgKyB1c2VyRnVsbE5hbWUobi5jb250ZW50Lm9wcG9uZW50KSksXG4gICAgICAgICAgZHJhd1RpbWUobilcbiAgICAgICAgXSksXG4gICAgICAgIGgoJ3NwYW4nLCByZXN1bHQpXG4gICAgICBdKTtcbiAgICB9LFxuICAgIHRleHQ6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBzd2l0Y2ggKG4uY29udGVudC53aW4pIHtcbiAgICAgICAgY2FzZSB0cnVlOlxuICAgICAgICAgIHJlc3VsdCA9ICdWaWN0b3J5JztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBmYWxzZTpcbiAgICAgICAgICByZXN1bHQgPSAnRGVmZWF0JztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXN1bHQgPSAnRHJhdyc7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0ICsgJyB2cyAnICsgdXNlckZ1bGxOYW1lKG4uY29udGVudC5vcHBvbmVudCk7XG4gICAgfVxuICB9LFxuICBwbGFuU3RhcnQ6IHtcbiAgICBodG1sOiBuID0+IGdlbmVyaWMobiwgJy9wYXRyb24nLCAn7oCZJywgW1xuICAgICAgaCgnc3BhbicsIFtcbiAgICAgICAgaCgnc3Ryb25nJywgJ1RoYW5rIHlvdSEnKSxcbiAgICAgICAgZHJhd1RpbWUobilcbiAgICAgIF0pLFxuICAgICAgaCgnc3BhbicsICdZb3UganVzdCBiZWNhbWUgYSBsaWNoZXNzIFBhdHJvbi4nKVxuICAgIF0pLFxuICAgIHRleHQ6IF8gPT4gJ1lvdSBqdXN0IGJlY2FtZSBhIGxpY2hlc3MgUGF0cm9uLidcbiAgfSxcbiAgcGxhbkV4cGlyZToge1xuICAgIGh0bWw6IG4gPT4gZ2VuZXJpYyhuLCAnL3BhdHJvbicsICfugJknLCBbXG4gICAgICBoKCdzcGFuJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCAnUGF0cm9uIGFjY291bnQgZXhwaXJlZCcpLFxuICAgICAgICBkcmF3VGltZShuKVxuICAgICAgXSksXG4gICAgICBoKCdzcGFuJywgJ1BsZWFzZSBjb25zaWRlciByZW5ld2luZyBpdCEnKVxuICAgIF0pLFxuICAgIHRleHQ6IF8gPT4gJ1BhdHJvbiBhY2NvdW50IGV4cGlyZWQnXG4gIH0sXG4gIGNvYWNoUmV2aWV3OiB7XG4gICAgaHRtbDogbiA9PiBnZW5lcmljKG4sICcvY29hY2gvZWRpdCcsICc6JywgW1xuICAgICAgaCgnc3BhbicsIFtcbiAgICAgICAgaCgnc3Ryb25nJywgJ05ldyBwZW5kaW5nIHJldmlldycpLFxuICAgICAgICBkcmF3VGltZShuKVxuICAgICAgXSksXG4gICAgICBoKCdzcGFuJywgJ1NvbWVvbmUgcmV2aWV3ZWQgeW91ciBjb2FjaCBwcm9maWxlLicpXG4gICAgXSksXG4gICAgdGV4dDogXyA9PiAnTmV3IHBlbmRpbmcgcmV2aWV3J1xuICB9LFxuICByYXRpbmdSZWZ1bmQ6IHtcbiAgICBodG1sOiBuID0+IGdlbmVyaWMobiwgJy9wbGF5ZXIvbXlzZWxmJywgJ+6AhScsIFtcbiAgICAgIGgoJ3NwYW4nLCBbXG4gICAgICAgIGgoJ3N0cm9uZycsICdZb3UgbG9zdCB0byBhIGNoZWF0ZXInKSxcbiAgICAgICAgZHJhd1RpbWUobilcbiAgICAgIF0pLFxuICAgICAgaCgnc3BhbicsICdSZWZ1bmQ6ICcgKyBuLmNvbnRlbnQucG9pbnRzICsgJyAnICsgbi5jb250ZW50LnBlcmYgKyAnIHJhdGluZyBwb2ludHMuJylcbiAgICBdKSxcbiAgICB0ZXh0OiBuID0+ICdSZWZ1bmQ6ICcgKyBuLmNvbnRlbnQucG9pbnRzICsgJyAnICsgbi5jb250ZW50LnBlcmYgKyAnIHJhdGluZyBwb2ludHMuJ1xuICB9LFxuICBjb3JyZXNBbGFybToge1xuICAgIGh0bWw6IG4gPT4gZ2VuZXJpYyhuLCAnLycgKyBuLmNvbnRlbnQuaWQsICc7JywgW1xuICAgICAgaCgnc3BhbicsIFtcbiAgICAgICAgaCgnc3Ryb25nJywgJ1RpbWUgaXMgYWxtb3N0IHVwIScpLFxuICAgICAgICBkcmF3VGltZShuKVxuICAgICAgXSksXG4gICAgICBoKCdzcGFuJywgJ0dhbWUgdnMgJyArIG4uY29udGVudC5vcClcbiAgICBdKSxcbiAgICB0ZXh0OiBfID0+ICdUaW1lIGlzIGFsbW9zdCB1cCEnXG4gIH0sXG4gIGlyd2luRG9uZToge1xuICAgIGh0bWw6IG4gPT4gZ2VuZXJpYyhuLCAnL0AvJyArIG4uY29udGVudC51c2VyLm5hbWUgKyAnP21vZCcsICfugIInLCBbXG4gICAgICBoKCdzcGFuJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCB1c2VyRnVsbE5hbWUobi5jb250ZW50LnVzZXIpKSxcbiAgICAgICAgZHJhd1RpbWUobilcbiAgICAgIF0pLFxuICAgICAgaCgnc3BhbicsICdJcndpbiBqb2IgY29tcGxldGUhJylcbiAgICBdKSxcbiAgICB0ZXh0OiBuID0+IG4uY29udGVudC51c2VyLm5hbWUgKyAnOiBJcndpbiBqb2IgY29tcGxldGUhJ1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZW5lcmljKG46IE5vdGlmaWNhdGlvbiwgdXJsOiBzdHJpbmcgfCB1bmRlZmluZWQsIGljb246IHN0cmluZywgY29udGVudDogVk5vZGVbXSk6IFZOb2RlIHtcbiAgcmV0dXJuIGgodXJsID8gJ2EnIDogJ3NwYW4nLCB7XG4gICAgY2xhc3M6IHtcbiAgICAgIHNpdGVfbm90aWZpY2F0aW9uOiB0cnVlLFxuICAgICAgW24udHlwZV06IHRydWUsXG4gICAgICAnbmV3JzogIW4ucmVhZFxuICAgIH0sXG4gICAgYXR0cnM6IHVybCA/IHsgaHJlZjogdXJsIH0gOiB1bmRlZmluZWRcbiAgfSwgW1xuICAgIGgoJ2knLCB7XG4gICAgICBhdHRyczogeyAnZGF0YS1pY29uJzogaWNvbiB9XG4gICAgfSksXG4gICAgaCgnc3Bhbi5jb250ZW50JywgY29udGVudClcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUaW1lKG46IE5vdGlmaWNhdGlvbikge1xuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKG4uZGF0ZSk7XG4gIHJldHVybiBoKCd0aW1lLnRpbWVhZ28nLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgIHRpdGxlOiBkYXRlLnRvTG9jYWxlU3RyaW5nKCksXG4gICAgICBkYXRldGltZTogbi5kYXRlXG4gICAgfVxuICB9LCB3aW5kb3cubGljaGVzcy50aW1lYWdvLmZvcm1hdChkYXRlKSk7XG59XG5cbmZ1bmN0aW9uIHVzZXJGdWxsTmFtZSh1PzogTGlnaHRVc2VyKSB7XG4gIGlmICghdSkgcmV0dXJuICdBbm9ueW1vdXMnO1xuICByZXR1cm4gdS50aXRsZSA/IHUudGl0bGUgKyAnICcgKyB1Lm5hbWUgOiB1Lm5hbWU7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgQ3RybCwgTm90aWZ5RGF0YSwgTm90aWZpY2F0aW9uIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0IHsgcmVuZGVyZXJzIH0gZnJvbSAnLi9yZW5kZXJlcnMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IEN0cmwpOiBWTm9kZSB7XG5cbiAgY29uc3QgZCA9IGN0cmwuZGF0YSgpO1xuXG4gIHJldHVybiBoKCdkaXYjbm90aWZ5LWFwcC5saW5rcy5kcm9wZG93bicsXG4gICAgZCAmJiAhY3RybC5pbml0aWF0aW5nKCkgPyByZW5kZXJDb250ZW50KGN0cmwsIGQpIDogW2goJ2Rpdi5pbml0aWF0aW5nJywgc3Bpbm5lcigpKV0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb250ZW50KGN0cmw6IEN0cmwsIGQ6IE5vdGlmeURhdGEpOiBWTm9kZVtdIHtcblxuICBjb25zdCBwYWdlciA9IGQucGFnZXI7XG4gIGNvbnN0IG5iID0gcGFnZXIuY3VycmVudFBhZ2VSZXN1bHRzLmxlbmd0aDtcblxuICBjb25zdCBub2RlczogVk5vZGVbXSA9IFtdO1xuXG4gIGlmIChwYWdlci5wcmV2aW91c1BhZ2UpIG5vZGVzLnB1c2goaCgnZGl2LnBhZ2VyLnByZXYnLCB7XG4gICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6ICdTJyB9LFxuICAgIGhvb2s6IGNsaWNrSG9vayhjdHJsLnByZXZpb3VzUGFnZSlcbiAgfSkpO1xuICBlbHNlIGlmIChwYWdlci5uZXh0UGFnZSkgbm9kZXMucHVzaChoKCdkaXYucGFnZXIucHJldi5kaXNhYmxlZCcsIHtcbiAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ1MnIH0sXG4gIH0pKTtcblxuICBub2Rlcy5wdXNoKG5iID8gcmVjZW50Tm90aWZpY2F0aW9ucyhkLCBjdHJsLnNjcm9sbGluZygpKSA6IGVtcHR5KCkpO1xuXG4gIGlmIChwYWdlci5uZXh0UGFnZSkgbm9kZXMucHVzaChoKCdkaXYucGFnZXIubmV4dCcsIHtcbiAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ1InIH0sXG4gICAgaG9vazogY2xpY2tIb29rKGN0cmwubmV4dFBhZ2UpXG4gIH0pKTtcblxuICBpZiAoISgnTm90aWZpY2F0aW9uJyBpbiB3aW5kb3cpKSBub2Rlcy5wdXNoKGgoJ2Rpdi5icm93c2VyLW5vdGlmaWNhdGlvbicsICdCcm93c2VyIGRvZXMgbm90IHN1cHBvcnQgbm90aWZpY2F0aW9uIHBvcHVwcycpKTtcbiAgZWxzZSBpZiAoTm90aWZpY2F0aW9uLnBlcm1pc3Npb24gPT0gJ2RlbmllZCcpIG5vZGVzLnB1c2gobm90aWZpY2F0aW9uRGVuaWVkKCkpO1xuXG4gIHJldHVybiBub2Rlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzVGV4dChuOiBOb3RpZmljYXRpb24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gcmVuZGVyZXJzW24udHlwZV0gPyByZW5kZXJlcnNbbi50eXBlXS50ZXh0KG4pIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBub3RpZmljYXRpb25EZW5pZWQoKTogVk5vZGUge1xuICByZXR1cm4gaCgnYS5icm93c2VyLW5vdGlmaWNhdGlvbi5kZW5pZWQnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgIGhyZWY6ICcvZmFxI2Jyb3dzZXItbm90aWZpY2F0aW9ucycsXG4gICAgICB0YXJnZXQ6ICdfYmxhbmsnXG4gICAgfVxuICB9LCAnTm90aWZpY2F0aW9uIHBvcHVwcyBkaXNhYmxlZCBieSBicm93c2VyIHNldHRpbmcnKTtcbn1cblxuZnVuY3Rpb24gYXNIdG1sKG46IE5vdGlmaWNhdGlvbik6IFZOb2RlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHJlbmRlcmVyc1tuLnR5cGVdID8gcmVuZGVyZXJzW24udHlwZV0uaHRtbChuKSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gY2xpY2tIb29rKGY6ICgpID0+IHZvaWQpIHtcbiAgcmV0dXJuIHtcbiAgICBpbnNlcnQ6ICh2bm9kZTogVk5vZGUpID0+IHtcbiAgICAgICh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZik7XG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBjb250ZW50TG9hZGVkID0gKCkgPT4gd2luZG93LmxpY2hlc3MucHVic3ViLmVtaXQoJ2NvbnRlbnRfbG9hZGVkJyk7XG5cbmZ1bmN0aW9uIHJlY2VudE5vdGlmaWNhdGlvbnMoZDogTm90aWZ5RGF0YSwgc2Nyb2xsaW5nOiBib29sZWFuKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2Jywge1xuICAgIGNsYXNzOiB7XG4gICAgICBub3RpZmljYXRpb25zOiB0cnVlLFxuICAgICAgc2Nyb2xsaW5nXG4gICAgfSxcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQ6IGNvbnRlbnRMb2FkZWQsXG4gICAgICBwb3N0cGF0Y2g6IGNvbnRlbnRMb2FkZWRcbiAgICB9XG4gIH0sIGQucGFnZXIuY3VycmVudFBhZ2VSZXN1bHRzLm1hcChhc0h0bWwpIGFzIFZOb2RlW10pO1xufVxuXG5mdW5jdGlvbiBlbXB0eSgpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5lbXB0eS50ZXh0JywgeyBhdHRyczogeyAnZGF0YS1pY29uJzogJ+6AhScgfSB9LCAnTm8gbm90aWZpY2F0aW9ucy4nKTtcbn1cblxuZnVuY3Rpb24gc3Bpbm5lcigpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zcGlubmVyJywgW1xuICAgIGgoJ3N2ZycsIHsgYXR0cnM6IHsgdmlld0JveDogJzAgMCA0MCA0MCcgfSB9LCBbXG4gICAgICBoKCdjaXJjbGUnLCB7IGF0dHJzOiB7IGN4OiAyMCwgY3k6IDIwLCByOiAxOCwgZmlsbDogJ25vbmUnIH0gfSldKV0pO1xufVxuIl19
