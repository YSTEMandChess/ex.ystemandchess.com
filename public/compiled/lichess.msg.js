(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessMsg = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
// Ensures calls to the wrapped function are spaced by the given delay.
// Any extra calls are dropped, except the last one.
function throttle(delay, callback) {
    let timer;
    let lastExec = 0;
    return function (...args) {
        const self = this;
        const elapsed = performance.now() - lastExec;
        function exec() {
            timer = undefined;
            lastExec = performance.now();
            callback.apply(self, args);
        }
        if (timer)
            clearTimeout(timer);
        if (elapsed > delay)
            exec();
        else
            timer = setTimeout(exec, delay - elapsed);
    };
}
exports.default = throttle;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_1 = require("common/notification");
const throttle_1 = require("common/throttle");
const network = require("./network");
const scroller_1 = require("./view/scroller");
class MsgCtrl {
    constructor(data, trans, redraw) {
        this.trans = trans;
        this.redraw = redraw;
        this.search = {
            input: ''
        };
        this.loading = false;
        this.connected = () => true;
        this.msgsPerPage = 100;
        this.openConvo = (userId) => {
            var _a;
            if (((_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user.id) != userId) {
                this.data.convo = undefined;
                this.loading = true;
            }
            network.loadConvo(userId).then(data => {
                this.data = data;
                this.search.result = undefined;
                this.loading = false;
                if (data.convo) {
                    history.replaceState({ contact: userId }, '', `/inbox/${data.convo.user.name}`);
                    this.onLoadConvo(data.convo);
                    this.redraw();
                }
                else
                    this.showSide();
            });
            this.pane = 'convo';
            this.redraw();
        };
        this.showSide = () => {
            this.pane = 'side';
            this.redraw();
        };
        this.getMore = () => {
            if (this.data.convo && this.canGetMoreSince)
                network.getMore(this.data.convo.user.id, this.canGetMoreSince)
                    .then(data => {
                    if (!this.data.convo || !data.convo || data.convo.user.id != this.data.convo.user.id || !data.convo.msgs[0])
                        return;
                    if (data.convo.msgs[0].date >= this.data.convo.msgs[this.data.convo.msgs.length - 1].date)
                        return;
                    this.data.convo.msgs = this.data.convo.msgs.concat(data.convo.msgs);
                    this.onLoadMsgs(data.convo.msgs);
                    this.redraw();
                });
            this.canGetMoreSince = undefined;
            this.redraw();
        };
        this.onLoadConvo = (convo) => {
            this.textStore = window.lichess.storage.make(`msg:area:${convo.user.id}`);
            this.onLoadMsgs(convo.msgs);
        };
        this.onLoadMsgs = (msgs) => {
            var _a;
            const oldFirstMsg = msgs[this.msgsPerPage - 1];
            this.canGetMoreSince = (_a = oldFirstMsg) === null || _a === void 0 ? void 0 : _a.date;
        };
        this.post = (text) => {
            if (this.data.convo) {
                network.post(this.data.convo.user.id, text);
                const msg = {
                    text,
                    user: this.data.me.id,
                    date: new Date(),
                    read: true
                };
                this.data.convo.msgs.unshift(msg);
                const contact = this.currentContact();
                if (contact)
                    this.addMsg(msg, contact);
                else
                    setTimeout(() => network.loadContacts().then(data => {
                        this.data.contacts = data.contacts;
                        this.redraw();
                    }), 1000);
                scroller_1.scroller.enable(true);
                this.redraw();
            }
        };
        this.receive = (msg) => {
            var _a;
            const contact = this.findContact(msg.user);
            this.addMsg(msg, contact);
            if (contact) {
                let redrawn = false;
                if (msg.user == ((_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user.id)) {
                    this.data.convo.msgs.unshift(msg);
                    if (document.hasFocus())
                        redrawn = this.setRead();
                    else
                        this.notify(contact, msg);
                    this.receiveTyping(msg.user, true);
                }
                if (!redrawn)
                    this.redraw();
            }
            else
                network.loadContacts().then(data => {
                    this.data.contacts = data.contacts;
                    this.notify(this.findContact(msg.user), msg);
                    this.redraw();
                });
        };
        this.addMsg = (msg, contact) => {
            if (contact) {
                contact.lastMsg = msg;
                this.data.contacts = [contact].concat(this.data.contacts.filter(c => c.user.id != contact.user.id));
            }
        };
        this.findContact = (userId) => this.data.contacts.find(c => c.user.id == userId);
        this.currentContact = () => this.data.convo && this.findContact(this.data.convo.user.id);
        this.notify = (contact, msg) => {
            notification_1.default(() => `${contact.user.name}: ${msg.text}`);
        };
        this.searchInput = (q) => {
            this.search.input = q;
            if (q[1])
                network.search(q).then((res) => {
                    this.search.result = this.search.input[1] ? res : undefined;
                    this.redraw();
                });
            else {
                this.search.result = undefined;
                this.redraw();
            }
        };
        this.setRead = () => {
            var _a;
            const msg = (_a = this.currentContact()) === null || _a === void 0 ? void 0 : _a.lastMsg;
            if (msg && msg.user != this.data.me.id && !msg.read) {
                msg.read = true;
                network.setRead(msg.user);
                this.redraw();
                return true;
            }
            return false;
        };
        this.delete = () => {
            var _a;
            const userId = (_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user.id;
            if (userId)
                network.del(userId).then(data => {
                    this.data = data;
                    this.redraw();
                    history.replaceState({}, '', '/inbox');
                });
        };
        this.report = () => {
            var _a, _b, _c;
            const user = (_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user;
            if (user) {
                const text = (_c = (_b = this.data.convo) === null || _b === void 0 ? void 0 : _b.msgs.find(m => m.user != this.data.me.id)) === null || _c === void 0 ? void 0 : _c.text.slice(0, 140);
                if (text)
                    network.report(user.name, text).then(_ => alert('Your report has been sent.'));
            }
        };
        this.block = () => {
            var _a;
            const userId = (_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user.id;
            if (userId)
                network.block(userId).then(() => this.openConvo(userId));
        };
        this.unblock = () => {
            var _a;
            const userId = (_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user.id;
            if (userId)
                network.unblock(userId).then(() => this.openConvo(userId));
        };
        this.changeBlockBy = (userId) => {
            var _a;
            if (userId == ((_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user.id))
                this.openConvo(userId);
        };
        this.sendTyping = throttle_1.default(3000, (user) => {
            var _a;
            if ((_a = this.textStore) === null || _a === void 0 ? void 0 : _a.get())
                network.typing(user);
        });
        this.receiveTyping = (userId, cancel) => {
            var _a;
            if (this.typing) {
                clearTimeout(this.typing.timeout);
                this.typing = undefined;
            }
            if (!cancel && ((_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user.id) == userId) {
                this.typing = {
                    user: userId,
                    timeout: setTimeout(() => {
                        var _a;
                        if (((_a = this.data.convo) === null || _a === void 0 ? void 0 : _a.user.id) == userId)
                            this.typing = undefined;
                        this.redraw();
                    }, 3000)
                };
            }
            this.redraw();
        };
        this.onReconnect = () => {
            this.data.convo && this.openConvo(this.data.convo.user.id);
            this.redraw();
        };
        this.data = data;
        this.pane = data.convo ? 'convo' : 'side';
        this.connected = network.websocketHandler(this);
        if (this.data.convo)
            this.onLoadConvo(this.data.convo);
        window.addEventListener('focus', this.setRead);
    }
    ;
}
exports.default = MsgCtrl;

},{"./network":13,"./view/scroller":21,"common/notification":9,"common/throttle":10}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./view/main");
const snabbdom_1 = require("snabbdom");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const network_1 = require("./network");
const ctrl_1 = require("./ctrl");
const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
function LichessMsg(element, opts) {
    const appHeight = () => document.body.style.setProperty('--app-height', `${window.innerHeight}px`);
    window.addEventListener('resize', appHeight);
    appHeight();
    let vnode, ctrl;
    function redraw() {
        vnode = patch(vnode, main_1.default(ctrl));
    }
    ctrl = new ctrl_1.default(network_1.upgradeData(opts.data), window.lichess.trans(opts.i18n), redraw);
    const blueprint = main_1.default(ctrl);
    element.innerHTML = '';
    vnode = patch(element, blueprint);
    redraw();
}
exports.default = LichessMsg;
;

},{"./ctrl":11,"./network":13,"./view/main":19,"snabbdom":6,"snabbdom/modules/attributes":4,"snabbdom/modules/class":5}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function xhr(url, init = {}) {
    return fetch(url, Object.assign({ headers: { 'Accept': 'application/vnd.lichess.v5+json' }, cache: 'no-cache', credentials: 'same-origin' }, init)).then(res => {
        if (res.ok)
            return res.json();
        alert(res.statusText);
        throw res.statusText;
    });
}
function loadConvo(userId) {
    return xhr(`/inbox/${userId}`).then(upgradeData);
}
exports.loadConvo = loadConvo;
function getMore(userId, before) {
    return xhr(`/inbox/${userId}?before=${before.getTime()}`).then(upgradeData);
}
exports.getMore = getMore;
function loadContacts() {
    return xhr(`/inbox`).then(upgradeData);
}
exports.loadContacts = loadContacts;
function search(q) {
    return xhr(`/inbox/search?q=${q}`)
        .then(res => (Object.assign(Object.assign({}, res), { contacts: res.contacts.map(upgradeContact) })));
}
exports.search = search;
function block(u) {
    return xhr(`/rel/block/${u}`, { method: 'post' });
}
exports.block = block;
function unblock(u) {
    return xhr(`/rel/unblock/${u}`, { method: 'post' });
}
exports.unblock = unblock;
function del(u) {
    return xhr(`/inbox/${u}`, { method: 'delete' })
        .then(upgradeData);
}
exports.del = del;
function report(name, text) {
    const formData = new FormData();
    formData.append('username', name);
    formData.append('text', text);
    formData.append('resource', 'msg');
    return xhr('/report/flag', {
        method: 'post',
        body: formData
    });
}
exports.report = report;
function post(dest, text) {
    window.lichess.pubsub.emit('socket.send', 'msgSend', { dest, text });
}
exports.post = post;
function setRead(dest) {
    window.lichess.pubsub.emit('socket.send', 'msgRead', dest);
}
exports.setRead = setRead;
function typing(dest) {
    window.lichess.pubsub.emit('socket.send', 'msgType', dest);
}
exports.typing = typing;
function websocketHandler(ctrl) {
    const listen = window.lichess.pubsub.on;
    listen('socket.in.msgNew', msg => {
        ctrl.receive(Object.assign(Object.assign({}, upgradeMsg(msg)), { read: false }));
    });
    listen('socket.in.msgType', ctrl.receiveTyping);
    listen('socket.in.blockedBy', ctrl.changeBlockBy);
    listen('socket.in.unblockedBy', ctrl.changeBlockBy);
    let connected = true;
    listen('socket.close', () => {
        connected = false;
        ctrl.redraw();
    });
    listen('socket.open', () => {
        if (!connected) {
            connected = true;
            ctrl.onReconnect();
        }
    });
    return () => connected;
}
exports.websocketHandler = websocketHandler;
// the upgrade functions convert incoming timestamps into JS dates
function upgradeData(d) {
    return Object.assign(Object.assign({}, d), { convo: d.convo && upgradeConvo(d.convo), contacts: d.contacts.map(upgradeContact) });
}
exports.upgradeData = upgradeData;
function upgradeMsg(m) {
    return Object.assign(Object.assign({}, m), { date: new Date(m.date) });
}
function upgradeUser(u) {
    return Object.assign(Object.assign({}, u), { id: u.name.toLowerCase() });
}
function upgradeContact(c) {
    return Object.assign(Object.assign({}, c), { user: upgradeUser(c.user), lastMsg: upgradeMsg(c.lastMsg) });
}
function upgradeConvo(c) {
    return Object.assign(Object.assign({}, c), { user: upgradeUser(c.user), msgs: c.msgs.map(upgradeMsg) });
}

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function renderActions(ctrl, convo) {
    if (convo.user.id == 'lichess')
        return [];
    const nodes = [];
    const cls = 'msg-app__convo__action.button.button-empty';
    nodes.push(snabbdom_1.h(`a.${cls}.play`, {
        key: 'play',
        attrs: {
            'data-icon': 'U',
            href: `/?user=${convo.user.name}#friend`,
            title: ctrl.trans.noarg('challengeToPlay')
        }
    }));
    nodes.push(snabbdom_1.h('div.msg-app__convo__action__sep', '|'));
    if (convo.relations.out === false)
        nodes.push(snabbdom_1.h(`button.${cls}.text.hover-text`, {
            key: 'unblock',
            attrs: {
                'data-icon': 'k',
                title: ctrl.trans.noarg('blocked'),
                'data-hover-text': ctrl.trans.noarg('unblock')
            },
            hook: util_1.bind('click', ctrl.unblock)
        }));
    else
        nodes.push(snabbdom_1.h(`button.${cls}.bad`, {
            key: 'block',
            attrs: {
                'data-icon': 'k',
                title: ctrl.trans.noarg('block')
            },
            hook: util_1.bind('click', withConfirm(ctrl.block))
        }));
    nodes.push(snabbdom_1.h(`button.${cls}.bad`, {
        key: 'delete',
        attrs: {
            'data-icon': 'q',
            title: ctrl.trans.noarg('delete')
        },
        hook: util_1.bind('click', withConfirm(ctrl.delete))
    }));
    if (!!convo.msgs[0])
        nodes.push(snabbdom_1.h(`button.${cls}.bad`, {
            key: 'report',
            attrs: {
                'data-icon': '!',
                title: ctrl.trans('reportXToModerators', convo.user.name)
            },
            hook: util_1.bind('click', withConfirm(ctrl.report))
        }));
    return nodes;
}
exports.default = renderActions;
const withConfirm = (f) => (e) => {
    if (confirm(`${e.target.getAttribute('title') || 'Confirm'}?`))
        f();
};

},{"./util":23,"snabbdom":6}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function renderContact(ctrl, contact, active) {
    const user = contact.user, msg = contact.lastMsg, isNew = !msg.read && msg.user != ctrl.data.me.id;
    return snabbdom_1.h('div.msg-app__side__contact', {
        key: user.id,
        class: { active: active == user.id, },
        hook: util_1.bindMobileMousedown(_ => ctrl.openConvo(user.id)),
    }, [
        util_1.userIcon(user, 'msg-app__side__contact__icon'),
        snabbdom_1.h('div.msg-app__side__contact__user', [
            snabbdom_1.h('div.msg-app__side__contact__head', [
                snabbdom_1.h('div.msg-app__side__contact__name', util_1.userName(user)),
                snabbdom_1.h('div.msg-app__side__contact__date', renderDate(msg))
            ]),
            snabbdom_1.h('div.msg-app__side__contact__body', [
                snabbdom_1.h('div.msg-app__side__contact__msg', {
                    class: { 'msg-app__side__contact__msg--new': isNew }
                }, msg.text),
                isNew ? snabbdom_1.h('i.msg-app__side__contact__new', {
                    attrs: { 'data-icon': '' }
                }) : null
            ])
        ])
    ]);
}
exports.default = renderContact;
function renderDate(msg) {
    return snabbdom_1.h('time.timeago', {
        key: msg.date.getTime(),
        attrs: {
            title: msg.date.toLocaleString(),
            datetime: msg.date.getTime()
        }
    }, window.lichess.timeago.format(msg.date));
}

},{"./util":23,"snabbdom":6}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
const msgs_1 = require("./msgs");
const actions_1 = require("./actions");
const interact_1 = require("./interact");
function renderConvo(ctrl, convo) {
    const user = convo.user;
    return snabbdom_1.h('div.msg-app__convo', {
        key: user.id
    }, [
        snabbdom_1.h('div.msg-app__convo__head', [
            snabbdom_1.h('div.msg-app__convo__head__left', [
                snabbdom_1.h('span.msg-app__convo__head__back', {
                    attrs: { 'data-icon': 'I' },
                    hook: util_1.bindMobileMousedown(ctrl.showSide)
                }),
                snabbdom_1.h('a.user-link.ulpt', {
                    attrs: { href: `/@/${user.name}` },
                    class: {
                        online: user.online,
                        offline: !user.online
                    }
                }, [
                    snabbdom_1.h('i.line' + (user.id == 'lichess' ? '.moderator' : (user.patron ? '.patron' : ''))),
                    ...util_1.userName(user)
                ])
            ]),
            snabbdom_1.h('div.msg-app__convo__head__actions', actions_1.default(ctrl, convo))
        ]),
        msgs_1.default(ctrl, convo),
        snabbdom_1.h('div.msg-app__convo__reply', [
            convo.relations.out === false || convo.relations.in === false ?
                snabbdom_1.h('div.msg-app__convo__reply__block.text', {
                    attrs: { 'data-icon': 'k' }
                }, 'This conversation is blocked.') : (convo.postable ?
                interact_1.default(ctrl, user) :
                snabbdom_1.h('div.msg-app__convo__reply__block.text', {
                    attrs: { 'data-icon': 'k' }
                }, `${user.name} doesn't accept new messages.`))
        ])
    ]);
}
exports.default = renderConvo;

},{"./actions":14,"./interact":18,"./msgs":20,"./util":23,"snabbdom":6}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scroller_1 = require("./scroller");
// looks like it has a @mention or a url.tld
exports.isMoreThanText = (str) => /(\n|(@|\.)\w{2,})/.test(str);
exports.enhance = (str) => expandMentions(expandUrls(window.lichess.escapeHtml(str))).replace(/\n/g, '<br>');
const expandMentions = (html) => html.replace(/(^|[^\w@#/])@([\w-]{2,})/g, (orig, prefix, user) => user.length > 20 ? orig : `${prefix}${a('/@/' + user, '@' + user)}`);
// from https://github.com/bryanwoods/autolink-js/blob/master/autolink.js
const urlRegex = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
const expandUrls = (html) => html.replace(urlRegex, (_, space, url) => `${space}${expandUrl(url)}`);
const expandUrl = (url) => expandImgur(url) || expandGiphy(url) || expandImage(url) || expandLink(url);
const imgurRegex = /https?:\/\/(?:i\.)?imgur\.com\/(\w+)(?:\.jpe?g|\.png|\.gif)?/;
const expandImgur = (url) => imgurRegex.test(url) ? url.replace(imgurRegex, (_, id) => img(`https://i.imgur.com/${id}.jpg`)) : undefined;
const giphyRegex = /https:\/\/(?:media\.giphy\.com\/media\/|giphy\.com\/gifs\/(?:\w+-)*)(\w+)(?:\/giphy\.gif)?/;
const expandGiphy = (url) => giphyRegex.test(url) ? url.replace(giphyRegex, (_, id) => img(`https://media.giphy.com/media/${id}/giphy.gif`)) : undefined;
const expandImage = (url) => /\.(jpg|jpeg|png|gif)$/.test(url) ? a(url, img(url)) : undefined;
const expandLink = (url) => a(url, url.replace(/^https?:\/\//, ''));
const a = (href, body) => `<a target="_blank" href="${href}">${body}</a>`;
const img = (src) => `<img src="${src}"/>`;
const domain = window.location.host;
const gameRegex = new RegExp(`(?:https?://)${domain}/(?:embed/)?(\\w{8})(?:(?:/(white|black))|\\w{4}|)(#\\d+)?$`);
const notGames = ['training', 'analysis', 'insights', 'practice', 'features', 'password', 'streamer'];
function expandIFrames(el) {
    const expandables = [];
    el.querySelectorAll('a:not(.text)').forEach((a) => {
        const link = parseLink(a);
        if (link)
            expandables.push({
                element: a,
                link: link
            });
    });
    expandGames(expandables.filter(e => e.link.type == 'game'));
}
exports.expandIFrames = expandIFrames;
function expandGames(games) {
    if (games.length < 3)
        games.forEach(expand);
    else
        games.forEach(game => {
            game.element.title = 'Click to expand';
            game.element.classList.add('text');
            game.element.setAttribute('data-icon', '=');
            game.element.addEventListener('click', e => {
                if (e.button === 0) {
                    e.preventDefault();
                    expand(game);
                }
            });
        });
}
function expand(exp) {
    const $iframe = $('<iframe>').attr('src', exp.link.src);
    $(exp.element).parent().parent().addClass('has-embed');
    $(exp.element).replaceWith($('<div class="embed"></div>').html($iframe));
    return $iframe
        .on('load', function () {
        var _a;
        if ((_a = this.contentDocument) === null || _a === void 0 ? void 0 : _a.title.startsWith("404"))
            this.parentNode.classList.add('not-found');
        scroller_1.scroller.auto();
    })
        .on('mouseenter', function () { $(this).focus(); });
}
function parseLink(a) {
    const [id, pov, ply] = Array.from(a.href.match(gameRegex) || []).slice(1);
    if (id && !notGames.includes(id))
        return {
            type: 'game',
            src: configureSrc(`/embed/${id}${pov ? `/${pov}` : ''}${ply || ''}`)
        };
    return undefined;
}
const themes = ['blue', 'blue2', 'blue3', 'blue-marble', 'canvas', 'wood', 'wood2', 'wood3', 'wood4', 'maple', 'maple2', 'brown', 'leather', 'green', 'marble', 'green-plastic', 'grey', 'metal', 'olive', 'newspaper', 'purple', 'purple-diag', 'pink', 'ic'];
function configureSrc(url) {
    if (url.includes('://'))
        return url;
    const parsed = new URL(url, window.location.href);
    parsed.searchParams.append('theme', themes.find(theme => document.body.classList.contains(theme)));
    parsed.searchParams.append('bg', document.body.getAttribute('data-theme'));
    return parsed.href;
}

},{"./scroller":21}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
const throttle_1 = require("common/throttle");
function renderInteract(ctrl, user) {
    const connected = ctrl.connected();
    return snabbdom_1.h('form.msg-app__convo__post', {
        hook: util_1.bind('submit', e => {
            e.preventDefault();
            const area = e.target.querySelector('textarea');
            if (area) {
                area.dispatchEvent(new Event('send'));
                area.focus();
            }
        })
    }, [
        renderTextarea(ctrl, user),
        snabbdom_1.h('button.msg-app__convo__post__submit.button', {
            class: { connected },
            attrs: {
                type: 'submit',
                'data-icon': 'G',
                disabled: !connected
            }
        })
    ]);
}
exports.default = renderInteract;
function renderTextarea(ctrl, user) {
    return snabbdom_1.h('textarea.msg-app__convo__post__text', {
        attrs: {
            rows: 1,
        },
        hook: {
            insert(vnode) {
                setupTextarea(vnode.elm, user.id, ctrl);
            }
        }
    });
}
function setupTextarea(area, contact, ctrl) {
    const storage = ctrl.textStore;
    let prev = 0;
    function send() {
        const now = Date.now();
        if (prev > now - 1000 || !ctrl.connected())
            return;
        prev = now;
        const txt = area.value.trim();
        if (txt.length > 8000)
            return alert("The message is too long.");
        if (txt)
            ctrl.post(txt);
        area.value = '';
        area.dispatchEvent(new Event('input')); // resize the textarea
        storage.remove();
    }
    // hack to automatically resize the textarea based on content
    area.value = '';
    let baseScrollHeight = area.scrollHeight;
    area.addEventListener('input', throttle_1.default(500, () => {
        const text = area.value.trim();
        area.rows = 1;
        // the resize magic
        if (text)
            area.rows = Math.min(10, 1 + Math.ceil((area.scrollHeight - baseScrollHeight) / 19));
        // and save content
        storage.set(text);
        ctrl.sendTyping(contact);
    }));
    // restore previously saved content
    area.value = storage.get() || '';
    if (area.value)
        area.dispatchEvent(new Event('input'));
    // send the content on <enter.
    area.addEventListener('keypress', (e) => {
        if ((e.which == 10 || e.which == 13) && !e.shiftKey) {
            e.preventDefault();
            setTimeout(send);
        }
    });
    area.addEventListener('send', send);
    if (!window.lichess.hasTouchEvents)
        area.focus();
}

},{"./util":23,"common/throttle":10,"snabbdom":6}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const convo_1 = require("./convo");
const contact_1 = require("./contact");
const search = require("./search");
const util_1 = require("./util");
function default_1(ctrl) {
    var _a;
    const activeId = (_a = ctrl.data.convo) === null || _a === void 0 ? void 0 : _a.user.id;
    return snabbdom_1.h('main.box.msg-app', {
        class: {
            [`pane-${ctrl.pane}`]: true
        }
    }, [
        snabbdom_1.h('div.msg-app__side', [
            search.renderInput(ctrl),
            ctrl.search.result ?
                search.renderResults(ctrl, ctrl.search.result) :
                snabbdom_1.h('div.msg-app__contacts.msg-app__side__content', ctrl.data.contacts.map(t => contact_1.default(ctrl, t, activeId)))
        ]),
        ctrl.data.convo ? convo_1.default(ctrl, ctrl.data.convo) : (ctrl.loading ?
            snabbdom_1.h('div.msg-app__convo', { key: ':' }, [
                snabbdom_1.h('div.msg-app__convo__head'),
                util_1.spinner()
            ]) : '')
    ]);
}
exports.default = default_1;

},{"./contact":15,"./convo":16,"./search":22,"./util":23,"snabbdom":6}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const enhance = require("./enhance");
const scroller_1 = require("./scroller");
const util_1 = require("./util");
function renderMsgs(ctrl, convo) {
    return snabbdom_1.h('div.msg-app__convo__msgs', {
        hook: {
            insert: setupMsgs(true),
            postpatch: setupMsgs(false)
        }
    }, [
        snabbdom_1.h('div.msg-app__convo__msgs__init'),
        snabbdom_1.h('div.msg-app__convo__msgs__content', [
            ctrl.canGetMoreSince ? snabbdom_1.h('button.msg-app__convo__msgs__more.button.button-empty', {
                key: 'more',
                hook: util_1.bind('click', _ => {
                    scroller_1.scroller.setMarker();
                    ctrl.getMore();
                })
            }, 'Load more') : null,
            ...contentMsgs(ctrl, convo.msgs),
            ctrl.typing ? snabbdom_1.h('div.msg-app__convo__msgs__typing', `${convo.user.name} is typing...`) : null
        ])
    ]);
}
exports.default = renderMsgs;
function contentMsgs(ctrl, msgs) {
    const dailies = groupMsgs(msgs);
    const nodes = [];
    dailies.forEach(daily => nodes.push(...renderDaily(ctrl, daily)));
    return nodes;
}
function renderDaily(ctrl, daily) {
    return [
        snabbdom_1.h('day', {
            key: `d${daily.date.getTime()}`
        }, renderDate(daily.date, ctrl.trans)),
        ...daily.msgs.map(group => snabbdom_1.h('group', {
            key: `g${daily.date.getTime()}`
        }, group.map(msg => renderMsg(ctrl, msg))))
    ];
}
function renderMsg(ctrl, msg) {
    return snabbdom_1.h(msg.user == ctrl.data.me.id ? 'mine' : 'their', [
        renderText(msg),
        snabbdom_1.h('em', `${pad2(msg.date.getHours())}:${pad2(msg.date.getMinutes())}`)
    ]);
}
function pad2(num) {
    return (num < 10 ? '0' : '') + num;
}
function groupMsgs(msgs) {
    let prev = msgs[0];
    if (!prev)
        return [{ date: new Date(), msgs: [] }];
    const dailies = [{
            date: prev.date,
            msgs: [[prev]]
        }];
    msgs.slice(1).forEach(msg => {
        if (sameDay(msg.date, prev.date)) {
            if (msg.user == prev.user)
                dailies[0].msgs[0].unshift(msg);
            else
                dailies[0].msgs.unshift([msg]);
        }
        else
            dailies.unshift({
                date: msg.date,
                msgs: [[msg]]
            });
        prev = msg;
    });
    return dailies;
}
const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
function renderDate(date, trans) {
    if (sameDay(date, today))
        return trans.noarg('today').toUpperCase();
    if (sameDay(date, yesterday))
        return trans.noarg('yesterday').toUpperCase();
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
function sameDay(d, e) {
    return d.getDate() == e.getDate() && d.getMonth() == e.getMonth() && d.getFullYear() == e.getFullYear();
}
function renderText(msg) {
    return enhance.isMoreThanText(msg.text) ? snabbdom_1.h('t', {
        hook: {
            create(_, vnode) {
                const el = vnode.elm;
                el.innerHTML = enhance.enhance(msg.text);
                el.querySelectorAll('img').forEach(c => c.addEventListener('load', scroller_1.scroller.auto, { once: true }));
            }
        }
    }) : snabbdom_1.h('t', msg.text);
}
const setupMsgs = (insert) => (vnode) => {
    const el = vnode.elm;
    if (insert)
        scroller_1.scroller.init(el);
    enhance.expandIFrames(el);
    scroller_1.scroller.toMarker() || scroller_1.scroller.auto();
};

},{"./enhance":17,"./scroller":21,"./util":23,"snabbdom":6}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throttle_1 = require("common/throttle");
class Scroller {
    constructor() {
        this.enabled = false;
        this.init = (e) => {
            this.enabled = true;
            this.element = e;
            this.element.addEventListener('scroll', throttle_1.default(500, _ => {
                const el = this.element;
                this.enable(!!el && el.offsetHeight + el.scrollTop > el.scrollHeight - 20);
            }), { passive: true });
            window.el = this.element;
        };
        this.auto = () => {
            if (this.element && this.enabled)
                requestAnimationFrame(() => this.element.scrollTop = 9999999);
        };
        this.enable = (v) => { this.enabled = v; };
        this.setMarker = () => {
            this.marker = this.element && this.element.querySelector('mine,their');
        };
        this.toMarker = () => {
            if (this.marker && this.to(this.marker)) {
                this.marker = undefined;
                return true;
            }
            return false;
        };
        this.to = (target) => {
            if (this.element) {
                const top = target.offsetTop - this.element.offsetHeight / 2 + target.offsetHeight / 2;
                if (top > 0)
                    this.element.scrollTop = top;
                return top > 0;
            }
            return false;
        };
    }
}
exports.scroller = new Scroller;

},{"common/throttle":10}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const throttle_1 = require("common/throttle");
const contact_1 = require("./contact");
const util_1 = require("./util");
function renderInput(ctrl) {
    return snabbdom_1.h('div.msg-app__side__search', [
        ctrl.data.me.kid ? null : snabbdom_1.h('input', {
            attrs: {
                value: '',
                placeholder: ctrl.trans.noarg('searchOrStartNewDiscussion')
            },
            hook: {
                insert(vnode) {
                    const input = vnode.elm;
                    input.addEventListener('input', throttle_1.default(500, () => ctrl.searchInput(input.value.trim())));
                    input.addEventListener('blur', () => setTimeout(() => {
                        input.value = '';
                        ctrl.searchInput('');
                    }, 500));
                }
            }
        })
    ]);
}
exports.renderInput = renderInput;
function renderResults(ctrl, res) {
    return snabbdom_1.h('div.msg-app__search.msg-app__side__content', [
        res.contacts[0] && snabbdom_1.h('section', [
            snabbdom_1.h('h2', ctrl.trans.noarg('discussions')),
            snabbdom_1.h('div.msg-app__search__contacts', res.contacts.map(t => contact_1.default(ctrl, t)))
        ]),
        res.friends[0] && snabbdom_1.h('section', [
            snabbdom_1.h('h2', ctrl.trans.noarg('friends')),
            snabbdom_1.h('div.msg-app__search__users', res.friends.map(u => renderUser(ctrl, u)))
        ]),
        res.users[0] && snabbdom_1.h('section', [
            snabbdom_1.h('h2', ctrl.trans.noarg('players')),
            snabbdom_1.h('div.msg-app__search__users', res.users.map(u => renderUser(ctrl, u)))
        ])
    ]);
}
exports.renderResults = renderResults;
function renderUser(ctrl, user) {
    return snabbdom_1.h('div.msg-app__side__contact', {
        key: user.id,
        hook: util_1.bindMobileMousedown(_ => ctrl.openConvo(user.id)),
    }, [
        util_1.userIcon(user, 'msg-app__side__contact__icon'),
        snabbdom_1.h('div.msg-app__side__contact__user', [
            snabbdom_1.h('div.msg-app__side__contact__head', [
                snabbdom_1.h('div.msg-app__side__contact__name', util_1.userName(user))
            ])
        ])
    ]);
}

},{"./contact":15,"./util":23,"common/throttle":10,"snabbdom":6}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
function userIcon(user, cls) {
    return snabbdom_1.h('div.user-link.' + cls, {
        class: {
            online: user.online,
            offline: !user.online
        }
    }, [
        snabbdom_1.h('i.line' + (user.patron ? '.patron' : ''))
    ]);
}
exports.userIcon = userIcon;
function userName(user) {
    return user.title ? [
        snabbdom_1.h('span.title', user.title == 'BOT' ? { attrs: { 'data-bot': true } } : {}, user.title), ' ', user.name
    ] : [user.name];
}
exports.userName = userName;
function bind(eventName, f) {
    return {
        insert(vnode) {
            vnode.elm.addEventListener(eventName, e => {
                e.stopPropagation();
                f(e);
                return false;
            });
        }
    };
}
exports.bind = bind;
function bindMobileMousedown(f) {
    return bind(window.lichess.hasTouchEvents ? 'click' : 'mousedown', f);
}
exports.bindMobileMousedown = bindMobileMousedown;
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

},{"snabbdom":6}]},{},[12])(12)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3RodW5rLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3Zub2RlLmpzIiwiLi4vY29tbW9uL3NyYy9ub3RpZmljYXRpb24udHMiLCIuLi9jb21tb24vc3JjL3Rocm90dGxlLnRzIiwic3JjL2N0cmwudHMiLCJzcmMvbWFpbi50cyIsInNyYy9uZXR3b3JrLnRzIiwic3JjL3ZpZXcvYWN0aW9ucy50cyIsInNyYy92aWV3L2NvbnRhY3QudHMiLCJzcmMvdmlldy9jb252by50cyIsInNyYy92aWV3L2VuaGFuY2UudHMiLCJzcmMvdmlldy9pbnRlcmFjdC50cyIsInNyYy92aWV3L21haW4udHMiLCJzcmMvdmlldy9tc2dzLnRzIiwic3JjL3ZpZXcvc2Nyb2xsZXIudHMiLCJzcmMvdmlldy9zZWFyY2gudHMiLCJzcmMvdmlldy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBLElBQUksYUFBYSxHQUF3QixFQUFFLENBQUM7QUFDNUMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBRXRCLFNBQVMsYUFBYTtJQUNwQixJQUFJLENBQUMsU0FBUyxFQUFFO1FB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RSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTthQUMvQyxDQUFDO1NBQUMsQ0FBQztLQUFDLENBQUMsQ0FBQztBQUNiLENBQUM7QUFORCwwQkFNQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuZnVuY3Rpb24gYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCkge1xuICAgIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICAgIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZERhdGEgPSBjaGlsZHJlbltpXS5kYXRhO1xuICAgICAgICAgICAgaWYgKGNoaWxkRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWRkTlMoY2hpbGREYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGgoc2VsLCBiLCBjKSB7XG4gICAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhID0gYjtcbiAgICAgICAgaWYgKGlzLmFycmF5KGMpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjICYmIGMuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtjXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzLmFycmF5KGIpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiICYmIGIuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtiXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSlcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IHZub2RlXzEudm5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxbMF0gPT09ICdzJyAmJiBzZWxbMV0gPT09ICd2JyAmJiBzZWxbMl0gPT09ICdnJyAmJlxuICAgICAgICAoc2VsLmxlbmd0aCA9PT0gMyB8fCBzZWxbM10gPT09ICcuJyB8fCBzZWxbM10gPT09ICcjJykpIHtcbiAgICAgICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZV8xLnZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59XG5leHBvcnRzLmggPSBoO1xuO1xuZXhwb3J0cy5kZWZhdWx0ID0gaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xufVxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpIHtcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCkge1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuZnVuY3Rpb24gcGFyZW50Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cbmZ1bmN0aW9uIHRhZ05hbWUoZWxtKSB7XG4gICAgcmV0dXJuIGVsbS50YWdOYW1lO1xufVxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCkge1xuICAgIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRleHRDb250ZW50O1xufVxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cbmZ1bmN0aW9uIGlzVGV4dChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5leHBvcnRzLmh0bWxEb21BcGkgPSB7XG4gICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgICBjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcbiAgICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBnZXRUZXh0Q29udGVudDogZ2V0VGV4dENvbnRlbnQsXG4gICAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gICAgaXNUZXh0OiBpc1RleHQsXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5odG1sRG9tQXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbGRvbWFwaS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYXJyYXkgPSBBcnJheS5pc0FycmF5O1xuZnVuY3Rpb24gcHJpbWl0aXZlKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMucHJpbWl0aXZlID0gcHJpbWl0aXZlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIga2V5LCBlbG0gPSB2bm9kZS5lbG0sIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzO1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgdmFyIGN1ciA9IGF0dHJzW2tleV07XG4gICAgICAgIHZhciBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgICAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgICAgICAgIGlmIChjdXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZShrZXksIGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdpZCcsIHNlbC5zbGljZShoYXNoICsgMSwgZG90KSk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdjbGFzcycsIHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAob2xkQXJnc1tpXSAhPT0gYXJnc1tpXSkge1xuICAgICAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5VG9UaHVuayhvbGRWbm9kZSwgdGh1bmspO1xufVxuZXhwb3J0cy50aHVuayA9IGZ1bmN0aW9uIHRodW5rKHNlbCwga2V5LCBmbiwgYXJncykge1xuICAgIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncyA9IGZuO1xuICAgICAgICBmbiA9IGtleTtcbiAgICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaF8xLmgoc2VsLCB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBob29rOiB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCB9LFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnRodW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGh1bmsuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB2bm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gICAgcmV0dXJuIHsgc2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5IH07XG59XG5leHBvcnRzLnZub2RlID0gdm5vZGU7XG5leHBvcnRzLmRlZmF1bHQgPSB2bm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZub2RlLmpzLm1hcCIsImxldCBub3RpZmljYXRpb25zOiBBcnJheTxOb3RpZmljYXRpb24+ID0gW107XG5sZXQgbGlzdGVuaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGxpc3RlblRvRm9jdXMoKSB7XG4gIGlmICghbGlzdGVuaW5nKSB7XG4gICAgbGlzdGVuaW5nID0gdHJ1ZTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiB7XG4gICAgICBub3RpZmljYXRpb25zLmZvckVhY2gobiA9PiBuLmNsb3NlKCkpO1xuICAgICAgbm90aWZpY2F0aW9ucyA9IFtdO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vdGlmeShtc2c6IHN0cmluZyB8ICgoKSA9PiBzdHJpbmcpKSB7XG4gIGNvbnN0IHN0b3JhZ2UgPSB3aW5kb3cubGljaGVzcy5zdG9yYWdlLm1ha2UoJ2p1c3Qtbm90aWZpZWQnKTtcbiAgaWYgKGRvY3VtZW50Lmhhc0ZvY3VzKCkgfHwgRGF0ZS5ub3coKSAtIHBhcnNlSW50KHN0b3JhZ2UuZ2V0KCkhLCAxMCkgPCAxMDAwKSByZXR1cm47XG4gIHN0b3JhZ2Uuc2V0KCcnICsgRGF0ZS5ub3coKSk7XG4gIGlmICgkLmlzRnVuY3Rpb24obXNnKSkgbXNnID0gbXNnKCk7XG4gIGNvbnN0IG5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oJ2xpY2hlc3Mub3JnJywge1xuICAgIGljb246IHdpbmRvdy5saWNoZXNzLmFzc2V0VXJsKCdsb2dvL2xpY2hlc3MtZmF2aWNvbi0yNTYucG5nJywge25vVmVyc2lvbjogdHJ1ZX0pLFxuICAgIGJvZHk6IG1zZ1xuICB9KTtcbiAgbm90aWZpY2F0aW9uLm9uY2xpY2sgPSAoKSA9PiB3aW5kb3cuZm9jdXMoKTtcbiAgbm90aWZpY2F0aW9ucy5wdXNoKG5vdGlmaWNhdGlvbik7XG4gIGxpc3RlblRvRm9jdXMoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obXNnOiBzdHJpbmcgfCAoKCkgPT4gc3RyaW5nKSkge1xuICBpZiAoZG9jdW1lbnQuaGFzRm9jdXMoKSB8fCAhKCdOb3RpZmljYXRpb24nIGluIHdpbmRvdykpIHJldHVybjtcbiAgaWYgKE5vdGlmaWNhdGlvbi5wZXJtaXNzaW9uID09PSAnZ3JhbnRlZCcpIHtcbiAgICAvLyBpbmNyZWFzZSBjaGFuY2VzIHRoYXQgdGhlIGZpcnN0IHRhYiBjYW4gcHV0IGEgbG9jYWwgc3RvcmFnZSBsb2NrXG4gICAgc2V0VGltZW91dChub3RpZnksIDEwICsgTWF0aC5yYW5kb20oKSAqIDUwMCwgbXNnKTtcbiAgfVxufVxuIiwiLy8gRW5zdXJlcyBjYWxscyB0byB0aGUgd3JhcHBlZCBmdW5jdGlvbiBhcmUgc3BhY2VkIGJ5IHRoZSBnaXZlbiBkZWxheS5cbi8vIEFueSBleHRyYSBjYWxscyBhcmUgZHJvcHBlZCwgZXhjZXB0IHRoZSBsYXN0IG9uZS5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRocm90dGxlKGRlbGF5OiBudW1iZXIsIGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQge1xuICBsZXQgdGltZXI6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgbGV0IGxhc3RFeGVjID0gMDtcblxuICByZXR1cm4gZnVuY3Rpb24odGhpczogYW55LCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGY6IGFueSA9IHRoaXM7XG4gICAgY29uc3QgZWxhcHNlZCA9IHBlcmZvcm1hbmNlLm5vdygpIC0gbGFzdEV4ZWM7XG5cbiAgICBmdW5jdGlvbiBleGVjKCkge1xuICAgICAgdGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICBsYXN0RXhlYyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgY2FsbGJhY2suYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgfVxuXG4gICAgaWYgKHRpbWVyKSBjbGVhclRpbWVvdXQodGltZXIpO1xuXG4gICAgaWYgKGVsYXBzZWQgPiBkZWxheSkgZXhlYygpO1xuICAgIGVsc2UgdGltZXIgPSBzZXRUaW1lb3V0KGV4ZWMsIGRlbGF5IC0gZWxhcHNlZCk7XG4gIH07XG59XG4iLCJpbXBvcnQgeyBNc2dEYXRhLCBDb250YWN0LCBDb252bywgTXNnLCBMYXN0TXNnLCBTZWFyY2gsIFNlYXJjaFJlc3VsdCwgVHlwaW5nLCBQYW5lLCBSZWRyYXcgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IG5vdGlmeSBmcm9tICdjb21tb24vbm90aWZpY2F0aW9uJztcbmltcG9ydCB0aHJvdHRsZSBmcm9tICdjb21tb24vdGhyb3R0bGUnO1xuaW1wb3J0ICogYXMgbmV0d29yayBmcm9tICcuL25ldHdvcmsnO1xuaW1wb3J0IHsgc2Nyb2xsZXIgfSBmcm9tICcuL3ZpZXcvc2Nyb2xsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNc2dDdHJsIHtcblxuICBkYXRhOiBNc2dEYXRhO1xuICBzZWFyY2g6IFNlYXJjaCA9IHtcbiAgICBpbnB1dDogJydcbiAgfTtcbiAgcGFuZTogUGFuZTtcbiAgbG9hZGluZyA9IGZhbHNlO1xuICBjb25uZWN0ZWQgPSAoKSA9PiB0cnVlO1xuICBtc2dzUGVyUGFnZSA9IDEwMDtcbiAgY2FuR2V0TW9yZVNpbmNlPzogRGF0ZTtcbiAgdHlwaW5nPzogVHlwaW5nO1xuICB0ZXh0U3RvcmU/OiBMaWNoZXNzU3RvcmFnZTtcblxuICBjb25zdHJ1Y3RvcihkYXRhOiBNc2dEYXRhLCByZWFkb25seSB0cmFuczogVHJhbnMsIHJlYWRvbmx5IHJlZHJhdzogUmVkcmF3KSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLnBhbmUgPSBkYXRhLmNvbnZvID8gJ2NvbnZvJyA6ICdzaWRlJztcbiAgICB0aGlzLmNvbm5lY3RlZCA9IG5ldHdvcmsud2Vic29ja2V0SGFuZGxlcih0aGlzKTtcbiAgICBpZiAodGhpcy5kYXRhLmNvbnZvKSB0aGlzLm9uTG9hZENvbnZvKHRoaXMuZGF0YS5jb252byk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5zZXRSZWFkKTtcbiAgfTtcblxuICBvcGVuQ29udm8gPSAodXNlcklkOiBzdHJpbmcpID0+IHtcbiAgICBpZiAodGhpcy5kYXRhLmNvbnZvPy51c2VyLmlkICE9IHVzZXJJZCkge1xuICAgICAgdGhpcy5kYXRhLmNvbnZvID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgbmV0d29yay5sb2FkQ29udm8odXNlcklkKS50aGVuKGRhdGEgPT4ge1xuICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgIHRoaXMuc2VhcmNoLnJlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgaWYgKGRhdGEuY29udm8pIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe2NvbnRhY3Q6IHVzZXJJZH0sICcnLCBgL2luYm94LyR7ZGF0YS5jb252by51c2VyLm5hbWV9YCk7XG4gICAgICAgIHRoaXMub25Mb2FkQ29udm8oZGF0YS5jb252byk7XG4gICAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICBlbHNlIHRoaXMuc2hvd1NpZGUoKTtcbiAgICB9KTtcbiAgICB0aGlzLnBhbmUgPSAnY29udm8nO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH1cblxuICBzaG93U2lkZSA9ICgpID0+IHtcbiAgICB0aGlzLnBhbmUgPSAnc2lkZSc7XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfVxuXG4gIGdldE1vcmUgPSAoKSA9PiB7XG4gICAgaWYgKHRoaXMuZGF0YS5jb252byAmJiB0aGlzLmNhbkdldE1vcmVTaW5jZSlcbiAgICAgIG5ldHdvcmsuZ2V0TW9yZSh0aGlzLmRhdGEuY29udm8udXNlci5pZCwgdGhpcy5jYW5HZXRNb3JlU2luY2UpXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5kYXRhLmNvbnZvIHx8ICFkYXRhLmNvbnZvIHx8IGRhdGEuY29udm8udXNlci5pZCAhPSB0aGlzLmRhdGEuY29udm8udXNlci5pZCB8fCAhZGF0YS5jb252by5tc2dzWzBdKSByZXR1cm47XG4gICAgICAgICAgaWYgKGRhdGEuY29udm8ubXNnc1swXS5kYXRlID49IHRoaXMuZGF0YS5jb252by5tc2dzW3RoaXMuZGF0YS5jb252by5tc2dzLmxlbmd0aCAtIDFdLmRhdGUpIHJldHVybjtcbiAgICAgICAgICB0aGlzLmRhdGEuY29udm8ubXNncyA9IHRoaXMuZGF0YS5jb252by5tc2dzLmNvbmNhdChkYXRhLmNvbnZvLm1zZ3MpO1xuICAgICAgICAgIHRoaXMub25Mb2FkTXNncyhkYXRhLmNvbnZvLm1zZ3MpO1xuICAgICAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgICAgIH0pO1xuICAgIHRoaXMuY2FuR2V0TW9yZVNpbmNlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH1cblxuICBwcml2YXRlIG9uTG9hZENvbnZvID0gKGNvbnZvOiBDb252bykgPT4ge1xuICAgIHRoaXMudGV4dFN0b3JlID0gd2luZG93LmxpY2hlc3Muc3RvcmFnZS5tYWtlKGBtc2c6YXJlYToke2NvbnZvLnVzZXIuaWR9YCk7XG4gICAgdGhpcy5vbkxvYWRNc2dzKGNvbnZvLm1zZ3MpO1xuICB9XG4gIHByaXZhdGUgb25Mb2FkTXNncyA9IChtc2dzOiBNc2dbXSkgPT4ge1xuICAgIGNvbnN0IG9sZEZpcnN0TXNnID0gbXNnc1t0aGlzLm1zZ3NQZXJQYWdlIC0gMV07XG4gICAgdGhpcy5jYW5HZXRNb3JlU2luY2UgPSBvbGRGaXJzdE1zZz8uZGF0ZTtcbiAgfVxuXG4gIHBvc3QgPSAodGV4dDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKHRoaXMuZGF0YS5jb252bykge1xuICAgICAgbmV0d29yay5wb3N0KHRoaXMuZGF0YS5jb252by51c2VyLmlkLCB0ZXh0KTtcbiAgICAgIGNvbnN0IG1zZzogTGFzdE1zZyA9IHtcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdXNlcjogdGhpcy5kYXRhLm1lLmlkLFxuICAgICAgICBkYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICByZWFkOiB0cnVlXG4gICAgICB9O1xuICAgICAgdGhpcy5kYXRhLmNvbnZvLm1zZ3MudW5zaGlmdChtc2cpO1xuICAgICAgY29uc3QgY29udGFjdCA9IHRoaXMuY3VycmVudENvbnRhY3QoKTtcbiAgICAgIGlmIChjb250YWN0KSB0aGlzLmFkZE1zZyhtc2csIGNvbnRhY3QpO1xuICAgICAgZWxzZSBzZXRUaW1lb3V0KCgpID0+IG5ldHdvcmsubG9hZENvbnRhY3RzKCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgdGhpcy5kYXRhLmNvbnRhY3RzID0gZGF0YS5jb250YWN0cztcbiAgICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICAgIH0pLCAxMDAwKTtcbiAgICAgIHNjcm9sbGVyLmVuYWJsZSh0cnVlKTtcbiAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgfVxuICB9XG5cbiAgcmVjZWl2ZSA9IChtc2c6IExhc3RNc2cpID0+IHtcbiAgICBjb25zdCBjb250YWN0ID0gdGhpcy5maW5kQ29udGFjdChtc2cudXNlcik7XG4gICAgdGhpcy5hZGRNc2cobXNnLCBjb250YWN0KTtcbiAgICBpZiAoY29udGFjdCkge1xuICAgICAgbGV0IHJlZHJhd24gPSBmYWxzZTtcbiAgICAgIGlmIChtc2cudXNlciA9PSB0aGlzLmRhdGEuY29udm8/LnVzZXIuaWQpIHtcbiAgICAgICAgdGhpcy5kYXRhLmNvbnZvLm1zZ3MudW5zaGlmdChtc2cpO1xuICAgICAgICBpZiAoZG9jdW1lbnQuaGFzRm9jdXMoKSkgcmVkcmF3biA9IHRoaXMuc2V0UmVhZCgpO1xuICAgICAgICBlbHNlIHRoaXMubm90aWZ5KGNvbnRhY3QsIG1zZyk7XG4gICAgICAgIHRoaXMucmVjZWl2ZVR5cGluZyhtc2cudXNlciwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoIXJlZHJhd24pIHRoaXMucmVkcmF3KCk7XG4gICAgfSBlbHNlIG5ldHdvcmsubG9hZENvbnRhY3RzKCkudGhlbihkYXRhID0+IHtcbiAgICAgIHRoaXMuZGF0YS5jb250YWN0cyA9IGRhdGEuY29udGFjdHM7XG4gICAgICB0aGlzLm5vdGlmeSh0aGlzLmZpbmRDb250YWN0KG1zZy51c2VyKSEsIG1zZyk7XG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRNc2cgPSAobXNnOiBMYXN0TXNnLCBjb250YWN0PzogQ29udGFjdCkgPT4ge1xuICAgIGlmIChjb250YWN0KSB7XG4gICAgICBjb250YWN0Lmxhc3RNc2cgPSBtc2c7XG4gICAgICB0aGlzLmRhdGEuY29udGFjdHMgPSBbY29udGFjdF0uY29uY2F0KHRoaXMuZGF0YS5jb250YWN0cy5maWx0ZXIoYyA9PiBjLnVzZXIuaWQgIT0gY29udGFjdC51c2VyLmlkKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kQ29udGFjdCA9ICh1c2VySWQ6IHN0cmluZyk6IENvbnRhY3QgfCB1bmRlZmluZWQgPT5cbiAgICB0aGlzLmRhdGEuY29udGFjdHMuZmluZChjID0+IGMudXNlci5pZCA9PSB1c2VySWQpO1xuXG4gIHByaXZhdGUgY3VycmVudENvbnRhY3QgPSAoKTogQ29udGFjdCB8IHVuZGVmaW5lZCA9PlxuICAgdGhpcy5kYXRhLmNvbnZvICYmIHRoaXMuZmluZENvbnRhY3QodGhpcy5kYXRhLmNvbnZvLnVzZXIuaWQpO1xuXG4gIHByaXZhdGUgbm90aWZ5ID0gKGNvbnRhY3Q6IENvbnRhY3QsIG1zZzogTXNnKSA9PiB7XG4gICAgbm90aWZ5KCgpID0+IGAke2NvbnRhY3QudXNlci5uYW1lfTogJHttc2cudGV4dH1gKTtcbiAgfVxuXG4gIHNlYXJjaElucHV0ID0gKHE6IHN0cmluZykgPT4ge1xuICAgIHRoaXMuc2VhcmNoLmlucHV0ID0gcTtcbiAgICBpZiAocVsxXSkgbmV0d29yay5zZWFyY2gocSkudGhlbigocmVzOiBTZWFyY2hSZXN1bHQpID0+IHtcbiAgICAgIHRoaXMuc2VhcmNoLnJlc3VsdCA9IHRoaXMuc2VhcmNoLmlucHV0WzFdID8gcmVzIDogdW5kZWZpbmVkO1xuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9KTtcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2VhcmNoLnJlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgfVxuICB9XG5cbiAgc2V0UmVhZCA9ICgpID0+IHtcbiAgICBjb25zdCBtc2cgPSB0aGlzLmN1cnJlbnRDb250YWN0KCk/Lmxhc3RNc2c7XG4gICAgaWYgKG1zZyAmJiBtc2cudXNlciAhPSB0aGlzLmRhdGEubWUuaWQgJiYgIW1zZy5yZWFkKSB7XG4gICAgICBtc2cucmVhZCA9IHRydWU7XG4gICAgICBuZXR3b3JrLnNldFJlYWQobXNnLnVzZXIpO1xuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBkZWxldGUgPSAoKSA9PiB7XG4gICAgY29uc3QgdXNlcklkID0gdGhpcy5kYXRhLmNvbnZvPy51c2VyLmlkO1xuICAgIGlmICh1c2VySWQpIG5ldHdvcmsuZGVsKHVzZXJJZCkudGhlbihkYXRhID0+IHtcbiAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCAnL2luYm94Jyk7XG4gICAgfSk7XG4gIH1cblxuICByZXBvcnQgPSAoKSA9PiB7XG4gICAgY29uc3QgdXNlciA9IHRoaXMuZGF0YS5jb252bz8udXNlcjtcbiAgICBpZiAodXNlcikge1xuICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZGF0YS5jb252bz8ubXNncy5maW5kKG0gPT4gbS51c2VyICE9IHRoaXMuZGF0YS5tZS5pZCk/LnRleHQuc2xpY2UoMCwgMTQwKTtcbiAgICAgIGlmICh0ZXh0KSBuZXR3b3JrLnJlcG9ydCh1c2VyLm5hbWUsIHRleHQpLnRoZW4oXyA9PiBhbGVydCgnWW91ciByZXBvcnQgaGFzIGJlZW4gc2VudC4nKSk7XG4gICAgfVxuICB9XG5cbiAgYmxvY2sgPSAoKSA9PiB7XG4gICAgY29uc3QgdXNlcklkID0gdGhpcy5kYXRhLmNvbnZvPy51c2VyLmlkO1xuICAgIGlmICh1c2VySWQpIG5ldHdvcmsuYmxvY2sodXNlcklkKS50aGVuKCgpID0+IHRoaXMub3BlbkNvbnZvKHVzZXJJZCkpO1xuICB9XG5cbiAgdW5ibG9jayA9ICgpID0+IHtcbiAgICBjb25zdCB1c2VySWQgPSB0aGlzLmRhdGEuY29udm8/LnVzZXIuaWQ7XG4gICAgaWYgKHVzZXJJZCkgbmV0d29yay51bmJsb2NrKHVzZXJJZCkudGhlbigoKSA9PiB0aGlzLm9wZW5Db252byh1c2VySWQpKTtcbiAgfVxuXG4gIGNoYW5nZUJsb2NrQnkgPSAodXNlcklkOiBzdHJpbmcpID0+IHtcbiAgICBpZiAodXNlcklkID09IHRoaXMuZGF0YS5jb252bz8udXNlci5pZCkgdGhpcy5vcGVuQ29udm8odXNlcklkKTtcbiAgfVxuXG4gIHNlbmRUeXBpbmcgPSB0aHJvdHRsZSgzMDAwLCAodXNlcjogc3RyaW5nKSA9PiB7XG4gICAgaWYgKHRoaXMudGV4dFN0b3JlPy5nZXQoKSkgbmV0d29yay50eXBpbmcodXNlcik7XG4gIH0pO1xuXG4gIHJlY2VpdmVUeXBpbmcgPSAodXNlcklkOiBzdHJpbmcsIGNhbmNlbD86IGJvb2xlYW4pID0+IHtcbiAgICBpZiAodGhpcy50eXBpbmcpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnR5cGluZy50aW1lb3V0KTtcbiAgICAgIHRoaXMudHlwaW5nID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoIWNhbmNlbCAmJiB0aGlzLmRhdGEuY29udm8/LnVzZXIuaWQgPT0gdXNlcklkKSB7XG4gICAgICB0aGlzLnR5cGluZyA9IHtcbiAgICAgICAgdXNlcjogdXNlcklkLFxuICAgICAgICB0aW1lb3V0OiBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5kYXRhLmNvbnZvPy51c2VyLmlkID09IHVzZXJJZCkgdGhpcy50eXBpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICAgICAgfSwgMzAwMClcbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMucmVkcmF3KCk7XG4gIH1cblxuICBvblJlY29ubmVjdCA9ICgpID0+IHtcbiAgICB0aGlzLmRhdGEuY29udm8gJiYgdGhpcy5vcGVuQ29udm8odGhpcy5kYXRhLmNvbnZvLnVzZXIuaWQpO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH1cbn1cbiIsImltcG9ydCB2aWV3IGZyb20gJy4vdmlldy9tYWluJztcblxuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3NuYWJiZG9tJztcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQga2xhc3MgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9jbGFzcyc7XG5pbXBvcnQgYXR0cmlidXRlcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnO1xuXG5pbXBvcnQgeyBNc2dPcHRzIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0IHsgdXBncmFkZURhdGEgfSBmcm9tICcuL25ldHdvcmsnXG5pbXBvcnQgTXNnQ3RybCBmcm9tICcuL2N0cmwnO1xuXG5jb25zdCBwYXRjaCA9IGluaXQoW2tsYXNzLCBhdHRyaWJ1dGVzXSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExpY2hlc3NNc2coZWxlbWVudDogSFRNTEVsZW1lbnQsIG9wdHM6IE1zZ09wdHMpIHtcblxuICBjb25zdCBhcHBIZWlnaHQgPSAoKSA9PiBkb2N1bWVudC5ib2R5LnN0eWxlLnNldFByb3BlcnR5KCctLWFwcC1oZWlnaHQnLCBgJHt3aW5kb3cuaW5uZXJIZWlnaHR9cHhgKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGFwcEhlaWdodCk7XG4gIGFwcEhlaWdodCgpO1xuXG4gIGxldCB2bm9kZTogVk5vZGUsIGN0cmw6IE1zZ0N0cmw7XG5cbiAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIHZub2RlID0gcGF0Y2godm5vZGUsIHZpZXcoY3RybCkpO1xuICB9XG5cbiAgY3RybCA9IG5ldyBNc2dDdHJsKFxuICAgIHVwZ3JhZGVEYXRhKG9wdHMuZGF0YSksXG4gICAgd2luZG93LmxpY2hlc3MudHJhbnMob3B0cy5pMThuKSxcbiAgICByZWRyYXdcbiAgKTtcblxuICBjb25zdCBibHVlcHJpbnQgPSB2aWV3KGN0cmwpO1xuICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICB2bm9kZSA9IHBhdGNoKGVsZW1lbnQsIGJsdWVwcmludCk7XG5cbiAgcmVkcmF3KCk7XG59O1xuIiwiaW1wb3J0IE1zZ0N0cmwgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IE1zZ0RhdGEsIENvbnRhY3QsIFVzZXIsIE1zZywgQ29udm8sIFNlYXJjaFJlc3VsdCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmZ1bmN0aW9uIHhocih1cmw6IHN0cmluZywgaW5pdDogUmVxdWVzdEluaXQgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICBoZWFkZXJzOiB7ICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmxpY2hlc3MudjUranNvbicgfSxcbiAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAuLi5pbml0XG4gIH0pLnRoZW4ocmVzID0+IHtcbiAgICBpZiAocmVzLm9rKSByZXR1cm4gcmVzLmpzb24oKTtcbiAgICBhbGVydChyZXMuc3RhdHVzVGV4dCk7XG4gICAgdGhyb3cgcmVzLnN0YXR1c1RleHQ7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZENvbnZvKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxNc2dEYXRhPiB7XG4gIHJldHVybiB4aHIoYC9pbmJveC8ke3VzZXJJZH1gKS50aGVuKHVwZ3JhZGVEYXRhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1vcmUodXNlcklkOiBzdHJpbmcsIGJlZm9yZTogRGF0ZSk6IFByb21pc2U8TXNnRGF0YT4ge1xuICByZXR1cm4geGhyKGAvaW5ib3gvJHt1c2VySWR9P2JlZm9yZT0ke2JlZm9yZS5nZXRUaW1lKCl9YCkudGhlbih1cGdyYWRlRGF0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQ29udGFjdHMoKTogUHJvbWlzZTxNc2dEYXRhPiB7XG4gIHJldHVybiB4aHIoYC9pbmJveGApLnRoZW4odXBncmFkZURhdGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoKHE6IHN0cmluZyk6IFByb21pc2U8U2VhcmNoUmVzdWx0PiB7XG4gIHJldHVybiB4aHIoYC9pbmJveC9zZWFyY2g/cT0ke3F9YClcbiAgICAudGhlbihyZXMgPT4gKHtcbiAgICAgIC4uLnJlcyxcbiAgICAgIGNvbnRhY3RzOiByZXMuY29udGFjdHMubWFwKHVwZ3JhZGVDb250YWN0KVxuICAgIH0gYXMgU2VhcmNoUmVzdWx0KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBibG9jayh1OiBzdHJpbmcpIHtcbiAgcmV0dXJuIHhocihgL3JlbC9ibG9jay8ke3V9YCwgeyBtZXRob2Q6ICdwb3N0JyB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuYmxvY2sodTogc3RyaW5nKSB7XG4gIHJldHVybiB4aHIoYC9yZWwvdW5ibG9jay8ke3V9YCwgeyBtZXRob2Q6ICdwb3N0JyB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbCh1OiBzdHJpbmcpOiBQcm9taXNlPE1zZ0RhdGE+IHtcbiAgcmV0dXJuIHhocihgL2luYm94LyR7dX1gLCB7IG1ldGhvZDogJ2RlbGV0ZScgfSlcbiAgICAudGhlbih1cGdyYWRlRGF0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBvcnQobmFtZTogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpXG4gIGZvcm1EYXRhLmFwcGVuZCgndXNlcm5hbWUnLCBuYW1lKTtcbiAgZm9ybURhdGEuYXBwZW5kKCd0ZXh0JywgdGV4dCk7XG4gIGZvcm1EYXRhLmFwcGVuZCgncmVzb3VyY2UnLCAnbXNnJyk7XG4gIHJldHVybiB4aHIoJy9yZXBvcnQvZmxhZycsIHtcbiAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICBib2R5OiBmb3JtRGF0YVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvc3QoZGVzdDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpIHtcbiAgd2luZG93LmxpY2hlc3MucHVic3ViLmVtaXQoJ3NvY2tldC5zZW5kJywgJ21zZ1NlbmQnLCB7IGRlc3QsIHRleHQgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRSZWFkKGRlc3Q6IHN0cmluZykge1xuICB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnc29ja2V0LnNlbmQnLCAnbXNnUmVhZCcsIGRlc3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHlwaW5nKGRlc3Q6IHN0cmluZykge1xuICB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnc29ja2V0LnNlbmQnLCAnbXNnVHlwZScsIGRlc3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2Vic29ja2V0SGFuZGxlcihjdHJsOiBNc2dDdHJsKSB7XG4gIGNvbnN0IGxpc3RlbiA9IHdpbmRvdy5saWNoZXNzLnB1YnN1Yi5vbjtcbiAgbGlzdGVuKCdzb2NrZXQuaW4ubXNnTmV3JywgbXNnID0+IHtcbiAgICBjdHJsLnJlY2VpdmUoe1xuICAgICAgLi4udXBncmFkZU1zZyhtc2cpLFxuICAgICAgcmVhZDogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG4gIGxpc3Rlbignc29ja2V0LmluLm1zZ1R5cGUnLCBjdHJsLnJlY2VpdmVUeXBpbmcpO1xuICBsaXN0ZW4oJ3NvY2tldC5pbi5ibG9ja2VkQnknLCBjdHJsLmNoYW5nZUJsb2NrQnkpO1xuICBsaXN0ZW4oJ3NvY2tldC5pbi51bmJsb2NrZWRCeScsIGN0cmwuY2hhbmdlQmxvY2tCeSk7XG5cbiAgbGV0IGNvbm5lY3RlZCA9IHRydWU7XG4gIGxpc3Rlbignc29ja2V0LmNsb3NlJywgKCkgPT4ge1xuICAgIGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIGN0cmwucmVkcmF3KCk7XG4gIH0pO1xuICBsaXN0ZW4oJ3NvY2tldC5vcGVuJywgKCkgPT4ge1xuICAgIGlmICghY29ubmVjdGVkKSB7XG4gICAgICBjb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgY3RybC5vblJlY29ubmVjdCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuICgpID0+IGNvbm5lY3RlZDtcbn1cblxuLy8gdGhlIHVwZ3JhZGUgZnVuY3Rpb25zIGNvbnZlcnQgaW5jb21pbmcgdGltZXN0YW1wcyBpbnRvIEpTIGRhdGVzXG5leHBvcnQgZnVuY3Rpb24gdXBncmFkZURhdGEoZDogYW55KTogTXNnRGF0YSB7XG4gIHJldHVybiB7XG4gICAgLi4uZCxcbiAgICBjb252bzogZC5jb252byAmJiB1cGdyYWRlQ29udm8oZC5jb252byksXG4gICAgY29udGFjdHM6IGQuY29udGFjdHMubWFwKHVwZ3JhZGVDb250YWN0KVxuICB9O1xufVxuZnVuY3Rpb24gdXBncmFkZU1zZyhtOiBhbnkpOiBNc2cge1xuICByZXR1cm4ge1xuICAgIC4uLm0sXG4gICAgZGF0ZTogbmV3IERhdGUobS5kYXRlKVxuICB9O1xufVxuZnVuY3Rpb24gdXBncmFkZVVzZXIodTogYW55KTogVXNlciB7XG4gIHJldHVybiB7XG4gICAgLi4udSxcbiAgICBpZDogdS5uYW1lLnRvTG93ZXJDYXNlKClcbiAgfTtcbn1cbmZ1bmN0aW9uIHVwZ3JhZGVDb250YWN0KGM6IGFueSk6IENvbnRhY3Qge1xuICByZXR1cm4ge1xuICAgIC4uLmMsXG4gICAgdXNlcjogdXBncmFkZVVzZXIoYy51c2VyKSxcbiAgICBsYXN0TXNnOiB1cGdyYWRlTXNnKGMubGFzdE1zZylcbiAgfTtcbn1cbmZ1bmN0aW9uIHVwZ3JhZGVDb252byhjOiBhbnkpOiBDb252byB7XG4gIHJldHVybiB7XG4gICAgLi4uYyxcbiAgICB1c2VyOiB1cGdyYWRlVXNlcihjLnVzZXIpLFxuICAgIG1zZ3M6IGMubXNncy5tYXAodXBncmFkZU1zZylcbiAgfTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBDb252byB9IGZyb20gJy4uL2ludGVyZmFjZXMnXG5pbXBvcnQgeyBiaW5kIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBNc2dDdHJsIGZyb20gJy4uL2N0cmwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXJBY3Rpb25zKGN0cmw6IE1zZ0N0cmwsIGNvbnZvOiBDb252byk6IFZOb2RlW10ge1xuICBpZiAoY29udm8udXNlci5pZCA9PSAnbGljaGVzcycpIHJldHVybiBbXTtcbiAgY29uc3Qgbm9kZXMgPSBbXTtcbiAgY29uc3QgY2xzID0gJ21zZy1hcHBfX2NvbnZvX19hY3Rpb24uYnV0dG9uLmJ1dHRvbi1lbXB0eSc7XG4gIG5vZGVzLnB1c2goXG4gICAgaChgYS4ke2Nsc30ucGxheWAsIHtcbiAgICAgIGtleTogJ3BsYXknLFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdVJyxcbiAgICAgICAgaHJlZjogYC8/dXNlcj0ke2NvbnZvLnVzZXIubmFtZX0jZnJpZW5kYCxcbiAgICAgICAgdGl0bGU6IGN0cmwudHJhbnMubm9hcmcoJ2NoYWxsZW5nZVRvUGxheScpXG4gICAgICB9XG4gICAgfSlcbiAgKTtcbiAgbm9kZXMucHVzaChoKCdkaXYubXNnLWFwcF9fY29udm9fX2FjdGlvbl9fc2VwJywgJ3wnKSk7XG4gIGlmIChjb252by5yZWxhdGlvbnMub3V0ID09PSBmYWxzZSkgbm9kZXMucHVzaChcbiAgICBoKGBidXR0b24uJHtjbHN9LnRleHQuaG92ZXItdGV4dGAsIHtcbiAgICAgIGtleTogJ3VuYmxvY2snLFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdrJyxcbiAgICAgICAgdGl0bGU6IGN0cmwudHJhbnMubm9hcmcoJ2Jsb2NrZWQnKSxcbiAgICAgICAgJ2RhdGEtaG92ZXItdGV4dCc6IGN0cmwudHJhbnMubm9hcmcoJ3VuYmxvY2snKVxuICAgICAgfSxcbiAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgY3RybC51bmJsb2NrKVxuICAgIH0pXG4gICk7XG4gIGVsc2Ugbm9kZXMucHVzaChcbiAgICBoKGBidXR0b24uJHtjbHN9LmJhZGAsIHtcbiAgICAgIGtleTogJ2Jsb2NrJyxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAnaycsXG4gICAgICAgIHRpdGxlOiBjdHJsLnRyYW5zLm5vYXJnKCdibG9jaycpXG4gICAgICB9LFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCB3aXRoQ29uZmlybShjdHJsLmJsb2NrKSlcbiAgICB9KVxuICApO1xuICBub2Rlcy5wdXNoKFxuICAgIGgoYGJ1dHRvbi4ke2Nsc30uYmFkYCwge1xuICAgICAga2V5OiAnZGVsZXRlJyxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAncScsXG4gICAgICAgIHRpdGxlOiBjdHJsLnRyYW5zLm5vYXJnKCdkZWxldGUnKVxuICAgICAgfSxcbiAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgd2l0aENvbmZpcm0oY3RybC5kZWxldGUpKVxuICAgIH0pXG4gICk7XG4gIGlmICghIWNvbnZvLm1zZ3NbMF0pIG5vZGVzLnB1c2goXG4gICAgaChgYnV0dG9uLiR7Y2xzfS5iYWRgLCB7XG4gICAgICBrZXk6ICdyZXBvcnQnLFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICchJyxcbiAgICAgICAgdGl0bGU6IGN0cmwudHJhbnMoJ3JlcG9ydFhUb01vZGVyYXRvcnMnLCBjb252by51c2VyLm5hbWUpXG4gICAgICB9LFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCB3aXRoQ29uZmlybShjdHJsLnJlcG9ydCkpXG4gICAgfSlcbiAgKTtcbiAgcmV0dXJuIG5vZGVzO1xufVxuXG5jb25zdCB3aXRoQ29uZmlybSA9IChmOiAoKSA9PiB2b2lkKSA9PiAoZTogTW91c2VFdmVudCkgPT4ge1xuICBpZiAoY29uZmlybShgJHsoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCAnQ29uZmlybSd9P2ApKSBmKCk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgQ29udGFjdCwgTGFzdE1zZyB9IGZyb20gJy4uL2ludGVyZmFjZXMnXG5pbXBvcnQgTXNnQ3RybCBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IHVzZXJOYW1lLCB1c2VySWNvbiwgYmluZE1vYmlsZU1vdXNlZG93biB9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlckNvbnRhY3QoY3RybDogTXNnQ3RybCwgY29udGFjdDogQ29udGFjdCwgYWN0aXZlPzogc3RyaW5nKTogVk5vZGUge1xuICBjb25zdCB1c2VyID0gY29udGFjdC51c2VyLCBtc2cgPSBjb250YWN0Lmxhc3RNc2csXG4gICAgaXNOZXcgPSAhbXNnLnJlYWQgJiYgbXNnLnVzZXIgIT0gY3RybC5kYXRhLm1lLmlkO1xuICByZXR1cm4gaCgnZGl2Lm1zZy1hcHBfX3NpZGVfX2NvbnRhY3QnLCB7XG4gICAga2V5OiB1c2VyLmlkLFxuICAgIGNsYXNzOiB7IGFjdGl2ZTogYWN0aXZlID09IHVzZXIuaWQsIH0sXG4gICAgaG9vazogYmluZE1vYmlsZU1vdXNlZG93bihfID0+IGN0cmwub3BlbkNvbnZvKHVzZXIuaWQpKSxcbiAgfSwgW1xuICAgIHVzZXJJY29uKHVzZXIsICdtc2ctYXBwX19zaWRlX19jb250YWN0X19pY29uJyksXG4gICAgaCgnZGl2Lm1zZy1hcHBfX3NpZGVfX2NvbnRhY3RfX3VzZXInLCBbXG4gICAgICBoKCdkaXYubXNnLWFwcF9fc2lkZV9fY29udGFjdF9faGVhZCcsIFtcbiAgICAgICAgaCgnZGl2Lm1zZy1hcHBfX3NpZGVfX2NvbnRhY3RfX25hbWUnLCB1c2VyTmFtZSh1c2VyKSksXG4gICAgICAgIGgoJ2Rpdi5tc2ctYXBwX19zaWRlX19jb250YWN0X19kYXRlJywgcmVuZGVyRGF0ZShtc2cpKVxuICAgICAgXSksXG4gICAgICBoKCdkaXYubXNnLWFwcF9fc2lkZV9fY29udGFjdF9fYm9keScsIFtcbiAgICAgICAgaCgnZGl2Lm1zZy1hcHBfX3NpZGVfX2NvbnRhY3RfX21zZycsIHtcbiAgICAgICAgICBjbGFzczogeyAnbXNnLWFwcF9fc2lkZV9fY29udGFjdF9fbXNnLS1uZXcnOiBpc05ldyB9XG4gICAgICAgIH0sIG1zZy50ZXh0KSxcbiAgICAgICAgaXNOZXcgPyBoKCdpLm1zZy1hcHBfX3NpZGVfX2NvbnRhY3RfX25ldycsIHtcbiAgICAgICAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ+6AjycgfVxuICAgICAgICB9KSA6IG51bGxcbiAgICAgIF0pXG4gICAgXSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckRhdGUobXNnOiBMYXN0TXNnKTogVk5vZGUge1xuICByZXR1cm4gaCgndGltZS50aW1lYWdvJywge1xuICAgIGtleTogbXNnLmRhdGUuZ2V0VGltZSgpLFxuICAgIGF0dHJzOiB7XG4gICAgICB0aXRsZTogbXNnLmRhdGUudG9Mb2NhbGVTdHJpbmcoKSxcbiAgICAgIGRhdGV0aW1lOiBtc2cuZGF0ZS5nZXRUaW1lKClcbiAgICB9XG4gIH0sIHdpbmRvdy5saWNoZXNzLnRpbWVhZ28uZm9ybWF0KG1zZy5kYXRlKSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgQ29udm8gfSBmcm9tICcuLi9pbnRlcmZhY2VzJ1xuaW1wb3J0IHsgdXNlck5hbWUsIGJpbmRNb2JpbGVNb3VzZWRvd24gfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHJlbmRlck1zZ3MgZnJvbSAnLi9tc2dzJztcbmltcG9ydCByZW5kZXJBY3Rpb25zIGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQgcmVuZGVySW50ZXJhY3QgZnJvbSAnLi9pbnRlcmFjdCc7XG5pbXBvcnQgTXNnQ3RybCBmcm9tICcuLi9jdHJsJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyQ29udm8oY3RybDogTXNnQ3RybCwgY29udm86IENvbnZvKTogVk5vZGUge1xuICBjb25zdCB1c2VyID0gY29udm8udXNlcjtcbiAgcmV0dXJuIGgoJ2Rpdi5tc2ctYXBwX19jb252bycsIHtcbiAgICBrZXk6IHVzZXIuaWRcbiAgfSwgW1xuICAgIGgoJ2Rpdi5tc2ctYXBwX19jb252b19faGVhZCcsIFtcbiAgICAgIGgoJ2Rpdi5tc2ctYXBwX19jb252b19faGVhZF9fbGVmdCcsIFtcbiAgICAgICAgaCgnc3Bhbi5tc2ctYXBwX19jb252b19faGVhZF9fYmFjaycsIHtcbiAgICAgICAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ0knIH0sXG4gICAgICAgICAgaG9vazogYmluZE1vYmlsZU1vdXNlZG93bihjdHJsLnNob3dTaWRlKVxuICAgICAgICB9KSxcbiAgICAgICAgaCgnYS51c2VyLWxpbmsudWxwdCcsIHtcbiAgICAgICAgICBhdHRyczogeyBocmVmOiBgL0AvJHt1c2VyLm5hbWV9YCB9LFxuICAgICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgICBvbmxpbmU6IHVzZXIub25saW5lLFxuICAgICAgICAgICAgb2ZmbGluZTogIXVzZXIub25saW5lXG4gICAgICAgICAgfVxuICAgICAgICB9LCBbXG4gICAgICAgICAgaCgnaS5saW5lJyArICh1c2VyLmlkID09ICdsaWNoZXNzJyA/ICcubW9kZXJhdG9yJyA6ICh1c2VyLnBhdHJvbiA/ICcucGF0cm9uJyA6ICcnKSkpLFxuICAgICAgICAgIC4uLnVzZXJOYW1lKHVzZXIpXG4gICAgICAgIF0pXG4gICAgICBdKSxcbiAgICAgIGgoJ2Rpdi5tc2ctYXBwX19jb252b19faGVhZF9fYWN0aW9ucycsIHJlbmRlckFjdGlvbnMoY3RybCwgY29udm8pKVxuICAgIF0pLFxuICAgIHJlbmRlck1zZ3MoY3RybCwgY29udm8pLFxuICAgIGgoJ2Rpdi5tc2ctYXBwX19jb252b19fcmVwbHknLCBbXG4gICAgICBjb252by5yZWxhdGlvbnMub3V0ID09PSBmYWxzZSB8fCBjb252by5yZWxhdGlvbnMuaW4gPT09IGZhbHNlID9cbiAgICAgICAgaCgnZGl2Lm1zZy1hcHBfX2NvbnZvX19yZXBseV9fYmxvY2sudGV4dCcsIHtcbiAgICAgICAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ2snIH1cbiAgICAgICAgfSwgJ1RoaXMgY29udmVyc2F0aW9uIGlzIGJsb2NrZWQuJykgOiAoXG4gICAgICAgICAgY29udm8ucG9zdGFibGUgP1xuICAgICAgICAgICAgcmVuZGVySW50ZXJhY3QoY3RybCwgdXNlcikgOlxuICAgICAgICAgICAgaCgnZGl2Lm1zZy1hcHBfX2NvbnZvX19yZXBseV9fYmxvY2sudGV4dCcsIHtcbiAgICAgICAgICAgICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6ICdrJyB9XG4gICAgICAgICAgICB9LCBgJHt1c2VyLm5hbWV9IGRvZXNuJ3QgYWNjZXB0IG5ldyBtZXNzYWdlcy5gKVxuICAgICAgICApXG4gICAgXSlcbiAgXSk7XG59XG4iLCJpbXBvcnQgeyBzY3JvbGxlciB9IGZyb20gJy4vc2Nyb2xsZXInO1xuXG4vLyBsb29rcyBsaWtlIGl0IGhhcyBhIEBtZW50aW9uIG9yIGEgdXJsLnRsZFxuZXhwb3J0IGNvbnN0IGlzTW9yZVRoYW5UZXh0ID0gKHN0cjogc3RyaW5nKSA9PiAvKFxcbnwoQHxcXC4pXFx3ezIsfSkvLnRlc3Qoc3RyKTtcblxuZXhwb3J0IGNvbnN0IGVuaGFuY2UgPSAoc3RyOiBzdHJpbmcpID0+XG4gIGV4cGFuZE1lbnRpb25zKFxuICAgIGV4cGFuZFVybHMod2luZG93LmxpY2hlc3MuZXNjYXBlSHRtbChzdHIpKVxuICApLnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpO1xuXG5jb25zdCBleHBhbmRNZW50aW9ucyA9IChodG1sOiBzdHJpbmcpID0+XG4gIGh0bWwucmVwbGFjZSgvKF58W15cXHdAIy9dKUAoW1xcdy1dezIsfSkvZywgKG9yaWc6IHN0cmluZywgcHJlZml4OiBzdHJpbmcsIHVzZXI6IHN0cmluZykgPT5cbiAgICB1c2VyLmxlbmd0aCA+IDIwID8gb3JpZyA6IGAke3ByZWZpeH0ke2EoJy9ALycgKyB1c2VyLCAnQCcgKyB1c2VyKX1gXG4gICk7XG5cbi8vIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2JyeWFud29vZHMvYXV0b2xpbmstanMvYmxvYi9tYXN0ZXIvYXV0b2xpbmsuanNcbmNvbnN0IHVybFJlZ2V4ID0gLyhefFtcXHNcXG5dfDxbQS1aYS16XSpcXC8/PikoKD86aHR0cHM/fGZ0cCk6XFwvXFwvW1xcLUEtWjAtOStcXHUwMDI2XFx1MjAxOUAjXFwvJT89KCl+X3whOiwuO10qW1xcLUEtWjAtOStcXHUwMDI2QCNcXC8lPX4oKV98XSkvZ2k7XG5jb25zdCBleHBhbmRVcmxzID0gKGh0bWw6IHN0cmluZykgPT5cbiAgaHRtbC5yZXBsYWNlKHVybFJlZ2V4LCAoXywgc3BhY2U6IHN0cmluZywgdXJsOiBzdHJpbmcpID0+IGAke3NwYWNlfSR7ZXhwYW5kVXJsKHVybCl9YCk7XG5cbmNvbnN0IGV4cGFuZFVybCA9ICh1cmw6IHN0cmluZykgPT5cbiAgZXhwYW5kSW1ndXIodXJsKSB8fCBleHBhbmRHaXBoeSh1cmwpIHx8IGV4cGFuZEltYWdlKHVybCkgfHwgZXhwYW5kTGluayh1cmwpO1xuXG5jb25zdCBpbWd1clJlZ2V4ID0gL2h0dHBzPzpcXC9cXC8oPzppXFwuKT9pbWd1clxcLmNvbVxcLyhcXHcrKSg/OlxcLmpwZT9nfFxcLnBuZ3xcXC5naWYpPy87XG5jb25zdCBleHBhbmRJbWd1ciA9ICh1cmw6IHN0cmluZykgPT5cbiAgaW1ndXJSZWdleC50ZXN0KHVybCkgPyB1cmwucmVwbGFjZShpbWd1clJlZ2V4LCAoXywgaWQpID0+IGltZyhgaHR0cHM6Ly9pLmltZ3VyLmNvbS8ke2lkfS5qcGdgKSkgOiB1bmRlZmluZWQ7XG5cbmNvbnN0IGdpcGh5UmVnZXggPSAvaHR0cHM6XFwvXFwvKD86bWVkaWFcXC5naXBoeVxcLmNvbVxcL21lZGlhXFwvfGdpcGh5XFwuY29tXFwvZ2lmc1xcLyg/OlxcdystKSopKFxcdyspKD86XFwvZ2lwaHlcXC5naWYpPy87XG5jb25zdCBleHBhbmRHaXBoeSA9ICh1cmw6IHN0cmluZykgPT5cbiAgZ2lwaHlSZWdleC50ZXN0KHVybCkgPyB1cmwucmVwbGFjZShnaXBoeVJlZ2V4LCAoXywgaWQpID0+IGltZyhgaHR0cHM6Ly9tZWRpYS5naXBoeS5jb20vbWVkaWEvJHtpZH0vZ2lwaHkuZ2lmYCkpIDogdW5kZWZpbmVkO1xuXG5jb25zdCBleHBhbmRJbWFnZSA9ICh1cmw6IHN0cmluZykgPT4gL1xcLihqcGd8anBlZ3xwbmd8Z2lmKSQvLnRlc3QodXJsKSA/IGEodXJsLCBpbWcodXJsKSkgOiB1bmRlZmluZWQ7XG5cbmNvbnN0IGV4cGFuZExpbmsgPSAodXJsOiBzdHJpbmcpID0+IGEodXJsLCB1cmwucmVwbGFjZSgvXmh0dHBzPzpcXC9cXC8vLCAnJykpO1xuXG5jb25zdCBhID0gKGhyZWY6IHN0cmluZywgYm9keTogc3RyaW5nKSA9PiBgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiR7aHJlZn1cIj4ke2JvZHl9PC9hPmA7XG5cbmNvbnN0IGltZyA9IChzcmM6IHN0cmluZykgPT4gYDxpbWcgc3JjPVwiJHtzcmN9XCIvPmA7XG5cbi8qIG5vdyB3aXRoIHRoZSBpZnJhbWUgZXhwYW5zaW9uICovXG5cbmludGVyZmFjZSBFeHBhbmRhYmxlIHtcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIGxpbms6IExpbms7XG59XG5pbnRlcmZhY2UgTGluayB7XG4gIHR5cGU6IExpbmtUeXBlO1xuICBzcmM6IHN0cmluZztcbn1cbnR5cGUgTGlua1R5cGUgPSAnZ2FtZSc7XG5cbmNvbnN0IGRvbWFpbiA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0O1xuY29uc3QgZ2FtZVJlZ2V4ID0gbmV3IFJlZ0V4cChgKD86aHR0cHM/Oi8vKSR7ZG9tYWlufS8oPzplbWJlZC8pPyhcXFxcd3s4fSkoPzooPzovKHdoaXRlfGJsYWNrKSl8XFxcXHd7NH18KSgjXFxcXGQrKT8kYCk7XG5jb25zdCBub3RHYW1lcyA9IFsndHJhaW5pbmcnLCAnYW5hbHlzaXMnLCAnaW5zaWdodHMnLCAncHJhY3RpY2UnLCAnZmVhdHVyZXMnLCAncGFzc3dvcmQnLCAnc3RyZWFtZXInXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZElGcmFtZXMoZWw6IEhUTUxFbGVtZW50KSB7XG5cbiAgY29uc3QgZXhwYW5kYWJsZXM6IEV4cGFuZGFibGVbXSA9IFtdO1xuXG4gIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2E6bm90KC50ZXh0KScpLmZvckVhY2goKGE6IEhUTUxBbmNob3JFbGVtZW50KSA9PiB7XG4gICAgY29uc3QgbGluayA9IHBhcnNlTGluayhhKTtcbiAgICBpZiAobGluaykgZXhwYW5kYWJsZXMucHVzaCh7XG4gICAgICBlbGVtZW50OiBhLFxuICAgICAgbGluazogbGlua1xuICAgIH0pO1xuICB9KTtcblxuICBleHBhbmRHYW1lcyhleHBhbmRhYmxlcy5maWx0ZXIoZSA9PiBlLmxpbmsudHlwZSA9PSAnZ2FtZScpKTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kR2FtZXMoZ2FtZXM6IEV4cGFuZGFibGVbXSk6IHZvaWQge1xuICBpZiAoZ2FtZXMubGVuZ3RoIDwgMykgZ2FtZXMuZm9yRWFjaChleHBhbmQpO1xuICBlbHNlIGdhbWVzLmZvckVhY2goZ2FtZSA9PiB7XG4gICAgZ2FtZS5lbGVtZW50LnRpdGxlID0gJ0NsaWNrIHRvIGV4cGFuZCc7XG4gICAgZ2FtZS5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3RleHQnKTtcbiAgICBnYW1lLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWljb24nLCAnPScpO1xuICAgIGdhbWUuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgaWYgKGUuYnV0dG9uID09PSAwKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXhwYW5kKGdhbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kKGV4cDogRXhwYW5kYWJsZSk6IHZvaWQge1xuICBjb25zdCAkaWZyYW1lOiBhbnkgPSAkKCc8aWZyYW1lPicpLmF0dHIoJ3NyYycsIGV4cC5saW5rLnNyYyk7XG4gICQoZXhwLmVsZW1lbnQpLnBhcmVudCgpLnBhcmVudCgpLmFkZENsYXNzKCdoYXMtZW1iZWQnKTtcbiAgJChleHAuZWxlbWVudCkucmVwbGFjZVdpdGgoJCgnPGRpdiBjbGFzcz1cImVtYmVkXCI+PC9kaXY+JykuaHRtbCgkaWZyYW1lKSk7XG4gIHJldHVybiAkaWZyYW1lXG4gICAgLm9uKCdsb2FkJywgZnVuY3Rpb24odGhpczogSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRlbnREb2N1bWVudD8udGl0bGUuc3RhcnRzV2l0aChcIjQwNFwiKSlcbiAgICAgICAgKHRoaXMucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudCkuY2xhc3NMaXN0LmFkZCgnbm90LWZvdW5kJyk7XG4gICAgICBzY3JvbGxlci5hdXRvKCk7XG4gICAgfSlcbiAgICAub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbih0aGlzOiBIVE1MSUZyYW1lRWxlbWVudCkgeyAkKHRoaXMpLmZvY3VzKCkgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTGluayhhOiBIVE1MQW5jaG9yRWxlbWVudCk6IExpbmsgfCB1bmRlZmluZWQge1xuICBjb25zdCBbaWQsIHBvdiwgcGx5XSA9IEFycmF5LmZyb20oYS5ocmVmLm1hdGNoKGdhbWVSZWdleCkgfHwgW10pLnNsaWNlKDEpO1xuICBpZiAoaWQgJiYgIW5vdEdhbWVzLmluY2x1ZGVzKGlkKSlcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ2dhbWUnLFxuICAgICAgc3JjOiBjb25maWd1cmVTcmMoYC9lbWJlZC8ke2lkfSR7cG92ID8gYC8ke3Bvdn1gIDogJyd9JHtwbHkgfHwgJyd9YClcbiAgICB9O1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5jb25zdCB0aGVtZXMgPSBbJ2JsdWUnLCAnYmx1ZTInLCAnYmx1ZTMnLCAnYmx1ZS1tYXJibGUnLCAnY2FudmFzJywgJ3dvb2QnLCAnd29vZDInLCAnd29vZDMnLCAnd29vZDQnLCAnbWFwbGUnLCAnbWFwbGUyJywgJ2Jyb3duJywgJ2xlYXRoZXInLCAnZ3JlZW4nLCAnbWFyYmxlJywgJ2dyZWVuLXBsYXN0aWMnLCAnZ3JleScsICdtZXRhbCcsICdvbGl2ZScsICduZXdzcGFwZXInLCAncHVycGxlJywgJ3B1cnBsZS1kaWFnJywgJ3BpbmsnLCAnaWMnXTtcblxuZnVuY3Rpb24gY29uZmlndXJlU3JjKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHVybC5pbmNsdWRlcygnOi8vJykpIHJldHVybiB1cmw7XG4gIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsLCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gIHBhcnNlZC5zZWFyY2hQYXJhbXMuYXBwZW5kKCd0aGVtZScsIHRoZW1lcy5maW5kKHRoZW1lID0+XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnModGhlbWUpXG4gICkhKTtcbiAgcGFyc2VkLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ2JnJywgZG9jdW1lbnQuYm9keS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnKSEpO1xuICByZXR1cm4gcGFyc2VkLmhyZWY7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL2ludGVyZmFjZXMnXG5pbXBvcnQgTXNnQ3RybCBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IGJpbmQgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHRocm90dGxlIGZyb20gJ2NvbW1vbi90aHJvdHRsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlckludGVyYWN0KGN0cmw6IE1zZ0N0cmwsIHVzZXI6IFVzZXIpOiBWTm9kZSB7XG4gIGNvbnN0IGNvbm5lY3RlZCA9IGN0cmwuY29ubmVjdGVkKCk7XG4gIHJldHVybiBoKCdmb3JtLm1zZy1hcHBfX2NvbnZvX19wb3N0Jywge1xuICAgIGhvb2s6IGJpbmQoJ3N1Ym1pdCcsIGUgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgYXJlYSA9IChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkucXVlcnlTZWxlY3RvcigndGV4dGFyZWEnKTtcbiAgICAgIGlmIChhcmVhKSB7XG4gICAgICAgIGFyZWEuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3NlbmQnKSk7XG4gICAgICAgIGFyZWEuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbXG4gICAgcmVuZGVyVGV4dGFyZWEoY3RybCwgdXNlciksXG4gICAgaCgnYnV0dG9uLm1zZy1hcHBfX2NvbnZvX19wb3N0X19zdWJtaXQuYnV0dG9uJywge1xuICAgICAgY2xhc3M6IHsgY29ubmVjdGVkIH0sXG4gICAgICBhdHRyczoge1xuICAgICAgICB0eXBlOiAnc3VibWl0JyxcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdHJyxcbiAgICAgICAgZGlzYWJsZWQ6ICFjb25uZWN0ZWRcbiAgICAgIH1cbiAgICB9KVxuICBdKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVGV4dGFyZWEoY3RybDogTXNnQ3RybCwgdXNlcjogVXNlcik6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ3RleHRhcmVhLm1zZy1hcHBfX2NvbnZvX19wb3N0X190ZXh0Jywge1xuICAgIGF0dHJzOiB7XG4gICAgICByb3dzOiAxLFxuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgIHNldHVwVGV4dGFyZWEodm5vZGUuZWxtIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQsIHVzZXIuaWQsIGN0cmwpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldHVwVGV4dGFyZWEoYXJlYTogSFRNTFRleHRBcmVhRWxlbWVudCwgY29udGFjdDogc3RyaW5nLCBjdHJsOiBNc2dDdHJsKSB7XG4gIFxuICBjb25zdCBzdG9yYWdlID0gY3RybC50ZXh0U3RvcmUhO1xuXG4gIGxldCBwcmV2ID0gMDtcblxuICBmdW5jdGlvbiBzZW5kKCkge1xuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgaWYgKHByZXYgPiBub3cgLSAxMDAwIHx8ICFjdHJsLmNvbm5lY3RlZCgpKSByZXR1cm47XG4gICAgcHJldiA9IG5vdztcbiAgICBjb25zdCB0eHQgPSBhcmVhLnZhbHVlLnRyaW0oKTtcbiAgICBpZiAodHh0Lmxlbmd0aCA+IDgwMDApIHJldHVybiBhbGVydChcIlRoZSBtZXNzYWdlIGlzIHRvbyBsb25nLlwiKTtcbiAgICBpZiAodHh0KSBjdHJsLnBvc3QodHh0KTtcbiAgICBhcmVhLnZhbHVlID0gJyc7XG4gICAgYXJlYS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnKSk7IC8vIHJlc2l6ZSB0aGUgdGV4dGFyZWFcbiAgICBzdG9yYWdlLnJlbW92ZSgpO1xuICB9XG5cbiAgLy8gaGFjayB0byBhdXRvbWF0aWNhbGx5IHJlc2l6ZSB0aGUgdGV4dGFyZWEgYmFzZWQgb24gY29udGVudFxuICBhcmVhLnZhbHVlID0gJyc7XG4gIGxldCBiYXNlU2Nyb2xsSGVpZ2h0ID0gYXJlYS5zY3JvbGxIZWlnaHQ7XG4gIGFyZWEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aHJvdHRsZSg1MDAsICgpID0+IHtcbiAgICBjb25zdCB0ZXh0ID0gYXJlYS52YWx1ZS50cmltKCk7XG4gICAgYXJlYS5yb3dzID0gMTtcbiAgICAvLyB0aGUgcmVzaXplIG1hZ2ljXG4gICAgaWYgKHRleHQpIGFyZWEucm93cyA9IE1hdGgubWluKDEwLCAxICsgTWF0aC5jZWlsKChhcmVhLnNjcm9sbEhlaWdodCAtIGJhc2VTY3JvbGxIZWlnaHQpIC8gMTkpKTtcbiAgICAvLyBhbmQgc2F2ZSBjb250ZW50XG4gICAgc3RvcmFnZS5zZXQodGV4dCk7XG4gICAgY3RybC5zZW5kVHlwaW5nKGNvbnRhY3QpO1xuICB9KSk7XG5cbiAgLy8gcmVzdG9yZSBwcmV2aW91c2x5IHNhdmVkIGNvbnRlbnRcbiAgYXJlYS52YWx1ZSA9IHN0b3JhZ2UuZ2V0KCkgfHwgJyc7XG4gIGlmIChhcmVhLnZhbHVlKSBhcmVhLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcpKTtcblxuICAvLyBzZW5kIHRoZSBjb250ZW50IG9uIDxlbnRlci5cbiAgYXJlYS5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgaWYgKChlLndoaWNoID09IDEwIHx8IGUud2hpY2ggPT0gMTMpICYmICFlLnNoaWZ0S2V5KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZXRUaW1lb3V0KHNlbmQpXG4gICAgfVxuICB9KTtcbiAgYXJlYS5hZGRFdmVudExpc3RlbmVyKCdzZW5kJywgc2VuZCk7XG5cbiAgaWYgKCF3aW5kb3cubGljaGVzcy5oYXNUb3VjaEV2ZW50cykgYXJlYS5mb2N1cygpO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCBNc2dDdHJsIGZyb20gJy4uL2N0cmwnO1xuaW1wb3J0IHJlbmRlckNvbnZvIGZyb20gJy4vY29udm8nO1xuaW1wb3J0IHJlbmRlckNvbnRhY3QgZnJvbSAnLi9jb250YWN0JztcbmltcG9ydCAqIGFzIHNlYXJjaCBmcm9tICcuL3NlYXJjaCc7XG5pbXBvcnQgeyBzcGlubmVyIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY3RybDogTXNnQ3RybCk6IFZOb2RlIHtcbiAgY29uc3QgYWN0aXZlSWQgPSBjdHJsLmRhdGEuY29udm8/LnVzZXIuaWQ7XG4gIHJldHVybiBoKCdtYWluLmJveC5tc2ctYXBwJywge1xuICAgIGNsYXNzOiB7XG4gICAgICBbYHBhbmUtJHtjdHJsLnBhbmV9YF06IHRydWVcbiAgICB9XG4gIH0sIFtcbiAgICBoKCdkaXYubXNnLWFwcF9fc2lkZScsIFtcbiAgICAgIHNlYXJjaC5yZW5kZXJJbnB1dChjdHJsKSxcbiAgICAgIGN0cmwuc2VhcmNoLnJlc3VsdCA/XG4gICAgICAgIHNlYXJjaC5yZW5kZXJSZXN1bHRzKGN0cmwsIGN0cmwuc2VhcmNoLnJlc3VsdCkgOlxuICAgICAgICBoKCdkaXYubXNnLWFwcF9fY29udGFjdHMubXNnLWFwcF9fc2lkZV9fY29udGVudCcsXG4gICAgICAgICAgY3RybC5kYXRhLmNvbnRhY3RzLm1hcCh0ID0+IHJlbmRlckNvbnRhY3QoY3RybCwgdCwgYWN0aXZlSWQpKVxuICAgICAgICApXG4gICAgXSksXG4gICAgY3RybC5kYXRhLmNvbnZvID8gcmVuZGVyQ29udm8oY3RybCwgY3RybC5kYXRhLmNvbnZvKSA6IChcbiAgICAgIGN0cmwubG9hZGluZyA/XG4gICAgICAgIGgoJ2Rpdi5tc2ctYXBwX19jb252bycsIHsga2V5OiAnOicgfSwgW1xuICAgICAgICAgIGgoJ2Rpdi5tc2ctYXBwX19jb252b19faGVhZCcpLFxuICAgICAgICAgIHNwaW5uZXIoKVxuICAgICAgICBdKSA6ICcnXG4gICAgKVxuICBdKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBDb252bywgTXNnLCBEYWlseSB9IGZyb20gJy4uL2ludGVyZmFjZXMnXG5pbXBvcnQgKiBhcyBlbmhhbmNlIGZyb20gJy4vZW5oYW5jZSc7XG5pbXBvcnQgeyBzY3JvbGxlciB9IGZyb20gJy4vc2Nyb2xsZXInO1xuaW1wb3J0IHsgYmluZCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgTXNnQ3RybCBmcm9tICcuLi9jdHJsJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyTXNncyhjdHJsOiBNc2dDdHJsLCBjb252bzogQ29udm8pOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYubXNnLWFwcF9fY29udm9fX21zZ3MnLCB7XG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0OiBzZXR1cE1zZ3ModHJ1ZSksXG4gICAgICBwb3N0cGF0Y2g6IHNldHVwTXNncyhmYWxzZSlcbiAgICB9XG4gIH0sIFtcbiAgICBoKCdkaXYubXNnLWFwcF9fY29udm9fX21zZ3NfX2luaXQnKSxcbiAgICBoKCdkaXYubXNnLWFwcF9fY29udm9fX21zZ3NfX2NvbnRlbnQnLCBbXG4gICAgICBjdHJsLmNhbkdldE1vcmVTaW5jZSA/IGgoJ2J1dHRvbi5tc2ctYXBwX19jb252b19fbXNnc19fbW9yZS5idXR0b24uYnV0dG9uLWVtcHR5Jywge1xuICAgICAgICBrZXk6ICdtb3JlJyxcbiAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCBfID0+IHtcbiAgICAgICAgICBzY3JvbGxlci5zZXRNYXJrZXIoKTtcbiAgICAgICAgICBjdHJsLmdldE1vcmUoKTtcbiAgICAgICAgfSlcbiAgICAgIH0sICdMb2FkIG1vcmUnKSA6IG51bGwsXG4gICAgICAuLi5jb250ZW50TXNncyhjdHJsLCBjb252by5tc2dzKSxcbiAgICAgIGN0cmwudHlwaW5nID8gaCgnZGl2Lm1zZy1hcHBfX2NvbnZvX19tc2dzX190eXBpbmcnLCBgJHtjb252by51c2VyLm5hbWV9IGlzIHR5cGluZy4uLmApIDogbnVsbFxuICAgIF0pXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBjb250ZW50TXNncyhjdHJsOiBNc2dDdHJsLCBtc2dzOiBNc2dbXSk6IFZOb2RlW10ge1xuICBjb25zdCBkYWlsaWVzID0gZ3JvdXBNc2dzKG1zZ3MpO1xuICBjb25zdCBub2RlczogVk5vZGVbXSA9IFtdO1xuICBkYWlsaWVzLmZvckVhY2goZGFpbHkgPT4gbm9kZXMucHVzaCguLi5yZW5kZXJEYWlseShjdHJsLCBkYWlseSkpKTtcbiAgcmV0dXJuIG5vZGVzO1xufVxuXG5mdW5jdGlvbiByZW5kZXJEYWlseShjdHJsOiBNc2dDdHJsLCBkYWlseTogRGFpbHkpOiBWTm9kZVtdIHtcbiAgcmV0dXJuIFtcbiAgICBoKCdkYXknLCB7XG4gICAgICBrZXk6IGBkJHtkYWlseS5kYXRlLmdldFRpbWUoKX1gXG4gICAgfSwgcmVuZGVyRGF0ZShkYWlseS5kYXRlLCBjdHJsLnRyYW5zKSksXG4gICAgLi4uZGFpbHkubXNncy5tYXAoZ3JvdXAgPT5cbiAgICAgIGgoJ2dyb3VwJywge1xuICAgICAgICBrZXk6IGBnJHtkYWlseS5kYXRlLmdldFRpbWUoKX1gXG4gICAgICB9LCBncm91cC5tYXAobXNnID0+IHJlbmRlck1zZyhjdHJsLCBtc2cpKSlcbiAgICApXG4gIF07XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1zZyhjdHJsOiBNc2dDdHJsLCBtc2c6IE1zZykge1xuICByZXR1cm4gaChtc2cudXNlciA9PSBjdHJsLmRhdGEubWUuaWQgPyAnbWluZScgOiAndGhlaXInLCBbXG4gICAgcmVuZGVyVGV4dChtc2cpLFxuICAgIGgoJ2VtJywgYCR7cGFkMihtc2cuZGF0ZS5nZXRIb3VycygpKX06JHtwYWQyKG1zZy5kYXRlLmdldE1pbnV0ZXMoKSl9YClcbiAgXSk7XG59XG5mdW5jdGlvbiBwYWQyKG51bTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIChudW0gPCAxMCA/ICcwJyA6ICcnKSArIG51bTtcbn1cblxuZnVuY3Rpb24gZ3JvdXBNc2dzKG1zZ3M6IE1zZ1tdKTogRGFpbHlbXSB7XG4gIGxldCBwcmV2OiBNc2cgPSBtc2dzWzBdO1xuICBpZiAoIXByZXYpIHJldHVybiBbeyBkYXRlOiBuZXcgRGF0ZSgpLCBtc2dzOiBbXSB9XTtcbiAgY29uc3QgZGFpbGllczogRGFpbHlbXSA9IFt7XG4gICAgZGF0ZTogcHJldi5kYXRlLFxuICAgIG1zZ3M6IFtbcHJldl1dXG4gIH1dO1xuICBtc2dzLnNsaWNlKDEpLmZvckVhY2gobXNnID0+IHtcbiAgICBpZiAoc2FtZURheShtc2cuZGF0ZSwgcHJldi5kYXRlKSkge1xuICAgICAgaWYgKG1zZy51c2VyID09IHByZXYudXNlcikgZGFpbGllc1swXS5tc2dzWzBdLnVuc2hpZnQobXNnKTtcbiAgICAgIGVsc2UgZGFpbGllc1swXS5tc2dzLnVuc2hpZnQoW21zZ10pO1xuICAgIH0gZWxzZSBkYWlsaWVzLnVuc2hpZnQoe1xuICAgICAgZGF0ZTogbXNnLmRhdGUsXG4gICAgICBtc2dzOiBbW21zZ11dXG4gICAgfSk7XG4gICAgcHJldiA9IG1zZztcbiAgfSk7XG4gIHJldHVybiBkYWlsaWVzO1xufVxuXG5jb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG5jb25zdCB5ZXN0ZXJkYXkgPSBuZXcgRGF0ZSgpO1xueWVzdGVyZGF5LnNldERhdGUoeWVzdGVyZGF5LmdldERhdGUoKSAtIDEpO1xuXG5mdW5jdGlvbiByZW5kZXJEYXRlKGRhdGU6IERhdGUsIHRyYW5zOiBUcmFucykge1xuICBpZiAoc2FtZURheShkYXRlLCB0b2RheSkpIHJldHVybiB0cmFucy5ub2FyZygndG9kYXknKS50b1VwcGVyQ2FzZSgpO1xuICBpZiAoc2FtZURheShkYXRlLCB5ZXN0ZXJkYXkpKSByZXR1cm4gdHJhbnMubm9hcmcoJ3llc3RlcmRheScpLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiBgJHtkYXRlLmdldERhdGUoKX0vJHtkYXRlLmdldE1vbnRoKCkgKyAxfS8ke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xufVxuXG5mdW5jdGlvbiBzYW1lRGF5KGQ6IERhdGUsIGU6IERhdGUpIHtcbiAgcmV0dXJuIGQuZ2V0RGF0ZSgpID09IGUuZ2V0RGF0ZSgpICYmIGQuZ2V0TW9udGgoKSA9PSBlLmdldE1vbnRoKCkgJiYgZC5nZXRGdWxsWWVhcigpID09IGUuZ2V0RnVsbFllYXIoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVGV4dChtc2c6IE1zZykge1xuICByZXR1cm4gZW5oYW5jZS5pc01vcmVUaGFuVGV4dChtc2cudGV4dCkgPyBoKCd0Jywge1xuICAgIGhvb2s6IHtcbiAgICAgIGNyZWF0ZShfLCB2bm9kZTogVk5vZGUpIHtcbiAgICAgICAgY29uc3QgZWwgPSAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gZW5oYW5jZS5lbmhhbmNlKG1zZy50ZXh0KTtcbiAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnaW1nJykuZm9yRWFjaChjID0+XG4gICAgICAgICAgYy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgc2Nyb2xsZXIuYXV0bywgeyBvbmNlOiB0cnVlIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KSA6IGgoJ3QnLCBtc2cudGV4dCk7XG59XG5cbmNvbnN0IHNldHVwTXNncyA9IChpbnNlcnQ6IGJvb2xlYW4pID0+ICh2bm9kZTogVk5vZGUpID0+IHtcbiAgY29uc3QgZWwgPSAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgaWYgKGluc2VydCkgc2Nyb2xsZXIuaW5pdChlbCk7XG4gIGVuaGFuY2UuZXhwYW5kSUZyYW1lcyhlbCk7XG4gIHNjcm9sbGVyLnRvTWFya2VyKCkgfHwgc2Nyb2xsZXIuYXV0bygpO1xufVxuIiwiaW1wb3J0IHRocm90dGxlIGZyb20gJ2NvbW1vbi90aHJvdHRsZSc7XG5cbmNsYXNzIFNjcm9sbGVyIHtcbiAgZW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBlbGVtZW50PzogSFRNTEVsZW1lbnQ7XG4gIG1hcmtlcj86IEhUTUxFbGVtZW50O1xuXG4gIGluaXQgPSAoZTogSFRNTEVsZW1lbnQpID0+IHtcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMuZWxlbWVudCA9IGU7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRocm90dGxlKDUwMCwgXyA9PiB7XG4gICAgICBjb25zdCBlbCA9IHRoaXMuZWxlbWVudDtcbiAgICAgIHRoaXMuZW5hYmxlKCEhZWwgJiYgZWwub2Zmc2V0SGVpZ2h0ICsgZWwuc2Nyb2xsVG9wID4gZWwuc2Nyb2xsSGVpZ2h0IC0gMjApO1xuICAgIH0pLCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgd2luZG93LmVsID0gdGhpcy5lbGVtZW50O1xuICB9XG4gIGF1dG8gPSAoKSA9PiB7XG4gICAgaWYgKHRoaXMuZWxlbWVudCAmJiB0aGlzLmVuYWJsZWQpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5lbGVtZW50IS5zY3JvbGxUb3AgPSA5OTk5OTk5KTtcbiAgfVxuICBlbmFibGUgPSAodjogYm9vbGVhbikgPT4geyB0aGlzLmVuYWJsZWQgPSB2OyB9XG4gIHNldE1hcmtlciA9ICgpID0+IHtcbiAgICB0aGlzLm1hcmtlciA9IHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluZSx0aGVpcicpIGFzIEhUTUxFbGVtZW50O1xuICB9XG4gIHRvTWFya2VyID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgIGlmICh0aGlzLm1hcmtlciAmJiB0aGlzLnRvKHRoaXMubWFya2VyKSkge1xuICAgICAgdGhpcy5tYXJrZXIgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHRvID0gKHRhcmdldDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XG4gICAgICBjb25zdCB0b3AgPSB0YXJnZXQub2Zmc2V0VG9wIC0gdGhpcy5lbGVtZW50Lm9mZnNldEhlaWdodCAvIDIgKyB0YXJnZXQub2Zmc2V0SGVpZ2h0IC8gMjtcbiAgICAgIGlmICh0b3AgPiAwKSB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wID0gdG9wO1xuICAgICAgcmV0dXJuIHRvcCA+IDA7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc2Nyb2xsZXIgPSBuZXcgU2Nyb2xsZXI7XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHRocm90dGxlIGZyb20gJ2NvbW1vbi90aHJvdHRsZSc7XG5pbXBvcnQgTXNnQ3RybCBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IFNlYXJjaFJlc3VsdCwgVXNlciB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHJlbmRlckNvbnRhY3RzIGZyb20gJy4vY29udGFjdCc7XG5pbXBvcnQgeyB1c2VyTmFtZSwgdXNlckljb24sIGJpbmRNb2JpbGVNb3VzZWRvd24gfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVySW5wdXQoY3RybDogTXNnQ3RybCk6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5tc2ctYXBwX19zaWRlX19zZWFyY2gnLCBbXG4gICAgY3RybC5kYXRhLm1lLmtpZCA/IG51bGwgOiBoKCdpbnB1dCcsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6IGN0cmwudHJhbnMubm9hcmcoJ3NlYXJjaE9yU3RhcnROZXdEaXNjdXNzaW9uJylcbiAgICAgIH0sXG4gICAgICBob29rOiB7XG4gICAgICAgIGluc2VydCh2bm9kZSkge1xuICAgICAgICAgIGNvbnN0IGlucHV0ID0gKHZub2RlLmVsbSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcbiAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRocm90dGxlKDUwMCwgKCkgPT4gY3RybC5zZWFyY2hJbnB1dChpbnB1dC52YWx1ZS50cmltKCkpKSk7XG4gICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgIGN0cmwuc2VhcmNoSW5wdXQoJycpXG4gICAgICAgICAgfSwgNTAwKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclJlc3VsdHMoY3RybDogTXNnQ3RybCwgcmVzOiBTZWFyY2hSZXN1bHQpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYubXNnLWFwcF9fc2VhcmNoLm1zZy1hcHBfX3NpZGVfX2NvbnRlbnQnLCBbXG4gICAgcmVzLmNvbnRhY3RzWzBdICYmIGgoJ3NlY3Rpb24nLCBbXG4gICAgICBoKCdoMicsIGN0cmwudHJhbnMubm9hcmcoJ2Rpc2N1c3Npb25zJykpLFxuICAgICAgaCgnZGl2Lm1zZy1hcHBfX3NlYXJjaF9fY29udGFjdHMnLCByZXMuY29udGFjdHMubWFwKHQgPT4gcmVuZGVyQ29udGFjdHMoY3RybCwgdCkpKVxuICAgIF0pLFxuICAgIHJlcy5mcmllbmRzWzBdICYmIGgoJ3NlY3Rpb24nLCBbXG4gICAgICBoKCdoMicsIGN0cmwudHJhbnMubm9hcmcoJ2ZyaWVuZHMnKSksXG4gICAgICBoKCdkaXYubXNnLWFwcF9fc2VhcmNoX191c2VycycsIHJlcy5mcmllbmRzLm1hcCh1ID0+IHJlbmRlclVzZXIoY3RybCwgdSkpKVxuICAgIF0pLFxuICAgIHJlcy51c2Vyc1swXSAmJiBoKCdzZWN0aW9uJywgW1xuICAgICAgaCgnaDInLCBjdHJsLnRyYW5zLm5vYXJnKCdwbGF5ZXJzJykpLFxuICAgICAgaCgnZGl2Lm1zZy1hcHBfX3NlYXJjaF9fdXNlcnMnLCByZXMudXNlcnMubWFwKHUgPT4gcmVuZGVyVXNlcihjdHJsLCB1KSkpXG4gICAgXSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclVzZXIoY3RybDogTXNnQ3RybCwgdXNlcjogVXNlcik6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5tc2ctYXBwX19zaWRlX19jb250YWN0Jywge1xuICAgIGtleTogdXNlci5pZCxcbiAgICBob29rOiBiaW5kTW9iaWxlTW91c2Vkb3duKF8gPT4gY3RybC5vcGVuQ29udm8odXNlci5pZCkpLFxuICB9LCBbXG4gICAgdXNlckljb24odXNlciwgJ21zZy1hcHBfX3NpZGVfX2NvbnRhY3RfX2ljb24nKSxcbiAgICBoKCdkaXYubXNnLWFwcF9fc2lkZV9fY29udGFjdF9fdXNlcicsIFtcbiAgICAgIGgoJ2Rpdi5tc2ctYXBwX19zaWRlX19jb250YWN0X19oZWFkJywgW1xuICAgICAgICBoKCdkaXYubXNnLWFwcF9fc2lkZV9fY29udGFjdF9fbmFtZScsIHVzZXJOYW1lKHVzZXIpKVxuICAgICAgXSlcbiAgICBdKVxuICBdKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vaW50ZXJmYWNlcydcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJJY29uKHVzZXI6IFVzZXIsIGNsczogc3RyaW5nKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2LnVzZXItbGluay4nICsgY2xzLCB7XG4gICAgY2xhc3M6IHtcbiAgICAgIG9ubGluZTogdXNlci5vbmxpbmUsXG4gICAgICBvZmZsaW5lOiAhdXNlci5vbmxpbmVcbiAgICB9XG4gIH0sIFtcbiAgICBoKCdpLmxpbmUnICsgKHVzZXIucGF0cm9uID8gJy5wYXRyb24nIDogJycpKVxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJOYW1lKHVzZXI6IFVzZXIpOiBBcnJheTxzdHJpbmcgfCBWTm9kZT4ge1xuICByZXR1cm4gdXNlci50aXRsZSA/IFtcbiAgICBoKFxuICAgICAgJ3NwYW4udGl0bGUnLFxuICAgICAgdXNlci50aXRsZSA9PSAnQk9UJyA/IHsgYXR0cnM6IHsnZGF0YS1ib3QnOiB0cnVlIH0gfSA6IHt9LFxuICAgICAgdXNlci50aXRsZVxuICAgICksICcgJywgdXNlci5uYW1lXG4gIF0gOiBbdXNlci5uYW1lXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmQoZXZlbnROYW1lOiBzdHJpbmcsIGY6IChlOiBFdmVudCkgPT4gdm9pZCkge1xuICByZXR1cm4ge1xuICAgIGluc2VydCh2bm9kZTogVk5vZGUpIHtcbiAgICAgICh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBlID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZihlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZE1vYmlsZU1vdXNlZG93bihmOiAoZTogRXZlbnQpID0+IGFueSkge1xuICByZXR1cm4gYmluZCh3aW5kb3cubGljaGVzcy5oYXNUb3VjaEV2ZW50cyA/ICdjbGljaycgOiAnbW91c2Vkb3duJywgZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGlubmVyKCk6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zcGlubmVyJywgW1xuICAgIGgoJ3N2ZycsIHsgYXR0cnM6IHsgdmlld0JveDogJzAgMCA0MCA0MCcgfSB9LCBbXG4gICAgICBoKCdjaXJjbGUnLCB7XG4gICAgICAgIGF0dHJzOiB7IGN4OiAyMCwgY3k6IDIwLCByOiAxOCwgZmlsbDogJ25vbmUnIH1cbiAgICAgIH0pXSldKTtcbn1cbiJdfQ==
