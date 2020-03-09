(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessChat = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
const preset_1 = require("./preset");
const note_1 = require("./note");
const moderation_1 = require("./moderation");
const common_1 = require("common");
const li = window.lichess;
function default_1(opts, redraw) {
    const data = opts.data;
    data.domVersion = 1; // increment to force redraw
    const maxLines = 200;
    const maxLinesDrop = 50; // how many lines to drop at once
    const palantir = {
        instance: undefined,
        loaded: false,
        enabled: common_1.prop(!!data.palantir)
    };
    const allTabs = ['discussion'];
    if (opts.noteId)
        allTabs.push('note');
    if (opts.plugin)
        allTabs.push(opts.plugin.tab.key);
    const tabStorage = li.storage.make('chat.tab'), storedTab = tabStorage.get();
    let moderation;
    const vm = {
        tab: allTabs.find(tab => tab === storedTab) || allTabs[0],
        enabled: opts.alwaysEnabled || !li.storage.get('nochat'),
        placeholderKey: 'talkInChat',
        loading: false,
        timeout: opts.timeout,
        writeable: opts.writeable
    };
    /* If discussion is disabled, and we have another chat tab,
     * then select that tab over discussion */
    if (allTabs.length > 1 && vm.tab === 'discussion' && li.storage.get('nochat'))
        vm.tab = allTabs[1];
    const post = function (text) {
        text = text.trim();
        if (!text)
            return;
        if (text.length > 140) {
            alert('Max length: 140 chars. ' + text.length + ' chars used.');
            return;
        }
        li.pubsub.emit('socket.send', 'talk', text);
    };
    const onTimeout = function (userId) {
        data.lines.forEach(l => {
            if (l.u && l.u.toLowerCase() == userId)
                l.d = true;
        });
        if (userId == data.userId)
            vm.timeout = true;
        data.domVersion++;
        redraw();
    };
    const onReinstate = function (userId) {
        if (userId == data.userId) {
            vm.timeout = false;
            redraw();
        }
    };
    const onMessage = function (line) {
        data.lines.push(line);
        const nb = data.lines.length;
        if (nb > maxLines) {
            data.lines.splice(0, nb - maxLines + maxLinesDrop);
            data.domVersion++;
        }
        redraw();
    };
    const onWriteable = function (v) {
        vm.writeable = v;
        redraw();
    };
    const onPermissions = function (obj) {
        let p;
        for (p in obj)
            opts.permissions[p] = obj[p];
        instanciateModeration();
        redraw();
    };
    const trans = li.trans(opts.i18n);
    function canMod() {
        return opts.permissions.timeout || opts.permissions.local;
    }
    function instanciateModeration() {
        moderation = canMod() ? moderation_1.moderationCtrl({
            reasons: opts.timeoutReasons || ([{ key: 'other', name: 'Inappropriate behavior' }]),
            permissions: opts.permissions,
            redraw
        }) : undefined;
        if (canMod())
            opts.loadCss('chat.mod');
    }
    instanciateModeration();
    const note = opts.noteId ? note_1.noteCtrl({
        id: opts.noteId,
        trans,
        redraw
    }) : undefined;
    const preset = preset_1.presetCtrl({
        initialGroup: opts.preset,
        post,
        redraw
    });
    const subs = [
        ['socket.in.message', onMessage],
        ['socket.in.chat_timeout', onTimeout],
        ['socket.in.chat_reinstate', onReinstate],
        ['chat.writeable', onWriteable],
        ['chat.permissions', onPermissions],
        ['palantir.toggle', palantir.enabled]
    ];
    subs.forEach(([eventName, callback]) => li.pubsub.on(eventName, callback));
    const destroy = () => {
        subs.forEach(([eventName, callback]) => li.pubsub.off(eventName, callback));
    };
    const emitEnabled = () => li.pubsub.emit('chat.enabled', vm.enabled);
    emitEnabled();
    return {
        data,
        opts,
        vm,
        allTabs,
        setTab(t) {
            vm.tab = t;
            tabStorage.set(t);
            // It's a lame way to do it. Give me a break.
            if (t === 'discussion')
                li.requestIdleCallback(() => $('.mchat__say').focus());
            redraw();
        },
        moderation: () => moderation,
        note,
        preset,
        post,
        trans,
        plugin: opts.plugin,
        setEnabled(v) {
            vm.enabled = v;
            emitEnabled();
            if (!v)
                li.storage.set('nochat', '1');
            else
                li.storage.remove('nochat');
            redraw();
        },
        redraw,
        palantir,
        destroy
    };
}
exports.default = default_1;
;

},{"./moderation":13,"./note":14,"./preset":15,"common":20}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const spam = require("./spam");
const enhance = require("./enhance");
const preset_1 = require("./preset");
const moderation_1 = require("./moderation");
const util_1 = require("./util");
const xhr_1 = require("./xhr");
const whisperRegex = /^\/w(?:hisper)?\s/;
function default_1(ctrl) {
    if (!ctrl.vm.enabled)
        return [];
    const scrollCb = (vnode) => {
        const el = vnode.elm;
        if (ctrl.data.lines.length > 5) {
            const autoScroll = (el.scrollTop === 0 || (el.scrollTop > (el.scrollHeight - el.clientHeight - 100)));
            if (autoScroll) {
                el.scrollTop = 999999;
                setTimeout((_) => el.scrollTop = 999999, 300);
            }
        }
    }, mod = ctrl.moderation();
    const vnodes = [
        snabbdom_1.h('ol.mchat__messages.chat-v-' + ctrl.data.domVersion, {
            attrs: {
                role: 'log',
                'aria-live': 'polite',
                'aria-atomic': false
            },
            hook: {
                insert(vnode) {
                    const $el = $(vnode.elm).on('click', 'a.jump', (e) => {
                        window.lichess.pubsub.emit('jump', e.target.getAttribute('data-ply'));
                    });
                    if (mod)
                        $el.on('click', '.mod', (e) => {
                            mod.open(e.target.getAttribute('data-username').split(' ')[0]);
                        });
                    else
                        $el.on('click', '.flag', (e) => report(ctrl, e.target.parentNode));
                    scrollCb(vnode);
                },
                postpatch: (_, vnode) => scrollCb(vnode)
            }
        }, selectLines(ctrl).map(line => renderLine(ctrl, line))),
        renderInput(ctrl)
    ];
    const presets = preset_1.presetView(ctrl.preset);
    if (presets)
        vnodes.push(presets);
    return vnodes;
}
exports.default = default_1;
function renderInput(ctrl) {
    if (!ctrl.vm.writeable)
        return;
    if ((ctrl.data.loginRequired && !ctrl.data.userId) || ctrl.data.restricted)
        return snabbdom_1.h('input.mchat__say', {
            attrs: {
                placeholder: ctrl.trans('loginToChat'),
                disabled: true
            }
        });
    let placeholder;
    if (ctrl.vm.timeout)
        placeholder = ctrl.trans('youHaveBeenTimedOut');
    else if (ctrl.opts.blind)
        placeholder = 'Chat';
    else
        placeholder = ctrl.trans.noarg(ctrl.vm.placeholderKey);
    return snabbdom_1.h('input.mchat__say', {
        attrs: {
            placeholder,
            autocomplete: 'off',
            maxlength: 140,
            disabled: ctrl.vm.timeout || !ctrl.vm.writeable
        },
        hook: {
            insert(vnode) {
                setupHooks(ctrl, vnode.elm);
            }
        }
    });
}
let mouchListener;
const setupHooks = (ctrl, chatEl) => {
    chatEl.addEventListener('keypress', (e) => setTimeout(() => {
        const el = e.target, txt = el.value, pub = ctrl.opts.public;
        if (e.which == 10 || e.which == 13) {
            if (txt === '')
                $('.keyboard-move input').focus();
            else {
                spam.report(txt);
                if (pub && spam.hasTeamUrl(txt))
                    alert("Please don't advertise teams in the chat.");
                else
                    ctrl.post(txt);
                el.value = '';
                if (!pub)
                    el.classList.remove('whisper');
            }
        }
        else {
            el.removeAttribute('placeholder');
            if (!pub)
                el.classList.toggle('whisper', !!txt.match(whisperRegex));
        }
    }));
    window.Mousetrap.bind('c', () => {
        chatEl.focus();
        return false;
    });
    window.Mousetrap(chatEl).bind('esc', () => chatEl.blur());
    // Ensure clicks remove chat focus.
    // See ornicar/chessground#109
    const mouchEvents = ['touchstart', 'mousedown'];
    if (mouchListener)
        mouchEvents.forEach(event => document.body.removeEventListener(event, mouchListener, { capture: true }));
    mouchListener = (e) => {
        if (!e.shiftKey && e.buttons !== 2 && e.button !== 2)
            chatEl.blur();
    };
    chatEl.onfocus = () => mouchEvents.forEach(event => document.body.addEventListener(event, mouchListener, { passive: true, capture: true }));
    chatEl.onblur = () => mouchEvents.forEach(event => document.body.removeEventListener(event, mouchListener, { capture: true }));
};
function sameLines(l1, l2) {
    return l1.d && l2.d && l1.u === l2.u;
}
function selectLines(ctrl) {
    let prev, ls = [];
    ctrl.data.lines.forEach(line => {
        if (!line.d &&
            (!prev || !sameLines(prev, line)) &&
            (!line.r || (line.u || '').toLowerCase() == ctrl.data.userId) &&
            !spam.skip(line.t))
            ls.push(line);
        prev = line;
    });
    return ls;
}
function updateText(parseMoves) {
    return (oldVnode, vnode) => {
        if (vnode.data.lichessChat !== oldVnode.data.lichessChat) {
            vnode.elm.innerHTML = enhance.enhance(vnode.data.lichessChat, parseMoves);
        }
    };
}
function renderText(t, parseMoves) {
    if (enhance.isMoreThanText(t)) {
        const hook = updateText(parseMoves);
        return snabbdom_1.h('t', {
            lichessChat: t,
            hook: {
                create: hook,
                update: hook
            }
        });
    }
    return snabbdom_1.h('t', t);
}
function report(ctrl, line) {
    const userA = line.querySelector('a.user-link');
    const text = line.querySelector('t').innerText;
    if (userA && confirm(`Report "${text}" to moderators?`))
        xhr_1.flag(ctrl.data.resourceId, userA.href.split('/')[4], text);
}
function renderLine(ctrl, line) {
    const textNode = renderText(line.t, ctrl.opts.parseMoves);
    if (line.u === 'lichess')
        return snabbdom_1.h('li.system', textNode);
    if (line.c)
        return snabbdom_1.h('li', [
            snabbdom_1.h('span.color', '[' + line.c + ']'),
            textNode
        ]);
    const userNode = snabbdom_1.thunk('a', line.u, util_1.userLink, [line.u, line.title]);
    return snabbdom_1.h('li', {}, ctrl.moderation() ? [
        line.u ? moderation_1.lineAction(line.u) : null,
        userNode,
        textNode
    ] : [
        ctrl.data.userId && line.u && ctrl.data.userId != line.u ? snabbdom_1.h('i.flag', {
            attrs: {
                'data-icon': '!',
                title: 'Report'
            }
        }) : null,
        userNode,
        textNode
    ]);
}

},{"./enhance":11,"./moderation":13,"./preset":15,"./spam":16,"./util":17,"./xhr":19,"snabbdom":6}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function enhance(text, parseMoves) {
    const escaped = window.lichess.escapeHtml(text);
    const linked = autoLink(escaped);
    const plied = parseMoves && linked === escaped ? addPlies(linked) : linked;
    return plied;
}
exports.enhance = enhance;
const moreThanTextPattern = /[&<>"@]/;
const possibleLinkPattern = /\.\w/;
function isMoreThanText(str) {
    return moreThanTextPattern.test(str) || possibleLinkPattern.test(str);
}
exports.isMoreThanText = isMoreThanText;
const linkPattern = /\b(https?:\/\/|lichess\.org\/)[-–—\w+&'@#\/%?=()~|!:,.;]+[\w+&@#\/%=~|]/gi;
function linkReplace(url, scheme) {
    if (url.includes('&quot;'))
        return url;
    const fullUrl = scheme === 'lichess.org/' ? 'https://' + url : url;
    const minUrl = url.replace(/^https:\/\//, '');
    return '<a target="_blank" rel="nofollow" href="' + fullUrl + '">' + minUrl + '</a>';
}
const userPattern = /(^|[^\w@#/])@([\w-]{2,})/g;
const pawnDropPattern = /^[a-h][2-7]$/;
function userLinkReplace(orig, prefix, user) {
    if (user.length > 20 || user.match(pawnDropPattern))
        return orig;
    return prefix + '<a href="/@/' + user + '">@' + user + "</a>";
}
function autoLink(html) {
    return html.replace(userPattern, userLinkReplace).replace(linkPattern, linkReplace);
}
const movePattern = /\b(\d+)\s*(\.+)\s*(?:[o0-]+[o0]|[NBRQKP]?[a-h]?[1-8]?[x@]?[a-z][1-8](?:=[NBRQK])?)\+?\#?[!\?=]{0,5}/gi;
function moveReplacer(match, turn, dots) {
    if (turn < 1 || turn > 200)
        return match;
    const ply = turn * 2 - (dots.length > 1 ? 0 : 1);
    return '<a class="jump" data-ply="' + ply + '">' + match + '</a>';
}
function addPlies(html) {
    return html.replace(movePattern, moveReplacer);
}

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const ctrl_1 = require("./ctrl");
const view_1 = require("./view");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
function LichessChat(element, opts) {
    const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
    let vnode, ctrl;
    function redraw() {
        vnode = patch(vnode, view_1.default(ctrl));
    }
    ctrl = ctrl_1.default(opts, redraw);
    const blueprint = view_1.default(ctrl);
    element.innerHTML = '';
    vnode = patch(element, blueprint);
    return ctrl;
}
exports.default = LichessChat;
;

},{"./ctrl":9,"./view":18,"snabbdom":6,"snabbdom/modules/attributes":4,"snabbdom/modules/class":5}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const xhr_1 = require("./xhr");
const util_1 = require("./util");
function moderationCtrl(opts) {
    let data;
    let loading = false;
    const open = (username) => {
        if (opts.permissions.timeout) {
            loading = true;
            xhr_1.userModInfo(username).then(d => {
                data = d;
                loading = false;
                opts.redraw();
            });
        }
        else {
            data = {
                id: username,
                username
            };
        }
        opts.redraw();
    };
    const close = () => {
        data = undefined;
        loading = false;
        opts.redraw();
    };
    return {
        loading: () => loading,
        data: () => data,
        reasons: opts.reasons,
        permissions: () => opts.permissions,
        open,
        close,
        timeout(reason) {
            data && window.lichess.pubsub.emit('socket.send', 'timeout', {
                userId: data.id,
                reason: reason.key
            });
            close();
            opts.redraw();
        },
        shadowban() {
            loading = true;
            data && $.post('/mod/' + data.id + '/troll/true').then(() => data && open(data.username));
            opts.redraw();
        }
    };
}
exports.moderationCtrl = moderationCtrl;
function lineAction(username) {
    return snabbdom_1.h('i.mod', {
        attrs: {
            'data-icon': '',
            'data-username': username,
            title: 'Moderation'
        }
    });
}
exports.lineAction = lineAction;
function moderationView(ctrl) {
    if (!ctrl)
        return;
    if (ctrl.loading())
        return [snabbdom_1.h('div.loading', util_1.spinner())];
    const data = ctrl.data();
    if (!data)
        return;
    const perms = ctrl.permissions();
    const infos = data.history ? snabbdom_1.h('div.infos.block', [
        window.lichess.numberFormat(data.games || 0) + ' games',
        data.troll ? 'TROLL' : undefined,
        data.engine ? 'ENGINE' : undefined,
        data.booster ? 'BOOSTER' : undefined
    ].map(t => t && snabbdom_1.h('span', t)).concat([
        snabbdom_1.h('a', {
            attrs: {
                href: '/@/' + data.username + '?mod'
            }
        }, 'profile')
    ]).concat(perms.shadowban ? [
        snabbdom_1.h('a', {
            attrs: {
                href: '/mod/' + data.username + '/communication'
            }
        }, 'coms')
    ] : [])) : undefined;
    const timeout = perms.timeout ? snabbdom_1.h('div.timeout.block', [
        snabbdom_1.h('strong', 'Timeout 10 minutes for'),
        ...ctrl.reasons.map(r => {
            return snabbdom_1.h('a.text', {
                attrs: { 'data-icon': 'p' },
                hook: util_1.bind('click', () => ctrl.timeout(r))
            }, r.name);
        }),
        ...((data.troll || !perms.shadowban) ? [] : [snabbdom_1.h('div.shadowban', [
                'Or ',
                snabbdom_1.h('button.button.button-red.button-empty', {
                    hook: util_1.bind('click', ctrl.shadowban)
                }, 'shadowban')
            ])])
    ]) : snabbdom_1.h('div.timeout.block', [
        snabbdom_1.h('strong', 'Moderation'),
        snabbdom_1.h('a.text', {
            attrs: { 'data-icon': 'p' },
            hook: util_1.bind('click', () => ctrl.timeout(ctrl.reasons[0]))
        }, 'Timeout 10 minutes')
    ]);
    const history = data.history ? snabbdom_1.h('div.history.block', [
        snabbdom_1.h('strong', 'Timeout history'),
        snabbdom_1.h('table', snabbdom_1.h('tbody.slist', {
            hook: {
                insert: () => window.lichess.pubsub.emit('content_loaded')
            }
        }, data.history.map(function (e) {
            return snabbdom_1.h('tr', [
                snabbdom_1.h('td.reason', e.reason),
                snabbdom_1.h('td.mod', e.mod),
                snabbdom_1.h('td', snabbdom_1.h('time.timeago', {
                    attrs: { datetime: e.date }
                }))
            ]);
        })))
    ]) : undefined;
    return [
        snabbdom_1.h('div.top', { key: 'mod-' + data.id }, [
            snabbdom_1.h('span.text', {
                attrs: { 'data-icon': '' },
            }, [util_1.userLink(data.username)]),
            snabbdom_1.h('a', {
                attrs: { 'data-icon': 'L' },
                hook: util_1.bind('click', ctrl.close)
            })
        ]),
        snabbdom_1.h('div.mchat__content.moderation', [
            infos,
            timeout,
            history
        ])
    ];
}
exports.moderationView = moderationView;
;

},{"./util":17,"./xhr":19,"snabbdom":6}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const xhr = require("./xhr");
const util_1 = require("./util");
function noteCtrl(opts) {
    let text;
    const doPost = window.lichess.debounce(() => {
        xhr.setNote(opts.id, text);
    }, 1000);
    return {
        id: opts.id,
        trans: opts.trans,
        text: () => text,
        fetch() {
            xhr.getNote(opts.id).then(t => {
                text = t || '';
                opts.redraw();
            });
        },
        post(t) {
            text = t;
            doPost();
        }
    };
}
exports.noteCtrl = noteCtrl;
function noteView(ctrl) {
    const text = ctrl.text();
    if (text == undefined)
        return snabbdom_1.h('div.loading', {
            hook: {
                insert: ctrl.fetch
            },
        }, [util_1.spinner()]);
    return snabbdom_1.h('textarea', {
        attrs: {
            placeholder: ctrl.trans('typePrivateNotesHere')
        },
        hook: {
            insert(vnode) {
                const $el = $(vnode.elm);
                $el.val(text).on('change keyup paste', () => {
                    ctrl.post($el.val());
                });
            }
        }
    });
}
exports.noteView = noteView;

},{"./util":17,"./xhr":19,"snabbdom":6}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
const groups = {
    start: [
        'hi/Hello', 'gl/Good luck', 'hf/Have fun!', 'u2/You too!'
    ].map(splitIt),
    end: [
        'gg/Good game', 'wp/Well played', 'ty/Thank you', 'gtg/I\'ve got to go', 'bye/Bye!'
    ].map(splitIt)
};
function presetCtrl(opts) {
    let group = opts.initialGroup;
    let said = [];
    return {
        group: () => group,
        said: () => said,
        setGroup(p) {
            if (p !== group) {
                group = p;
                if (!p)
                    said = [];
                opts.redraw();
            }
        },
        post(preset) {
            if (!group)
                return;
            const sets = groups[group];
            if (!sets)
                return;
            if (said.includes(preset.key))
                return;
            opts.post(preset.text);
            said.push(preset.key);
        }
    };
}
exports.presetCtrl = presetCtrl;
function presetView(ctrl) {
    const group = ctrl.group();
    if (!group)
        return;
    const sets = groups[group];
    const said = ctrl.said();
    return (sets && said.length < 2) ? snabbdom_1.h('div.mchat__presets', sets.map((p) => {
        const disabled = said.includes(p.key);
        return snabbdom_1.h('span', {
            class: {
                disabled
            },
            attrs: {
                title: p.text,
                disabled
            },
            hook: util_1.bind('click', () => { !disabled && ctrl.post(p); })
        }, p.key);
    })) : undefined;
}
exports.presetView = presetView;
function splitIt(s) {
    const parts = s.split('/');
    return {
        key: parts[0],
        text: parts[1]
    };
}

},{"./util":17,"snabbdom":6}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function skip(txt) {
    return analyse(txt) && window.lichess.storage.get('chat-spam') != '1';
}
exports.skip = skip;
function hasTeamUrl(txt) {
    return !!txt.match(teamUrlRegex);
}
exports.hasTeamUrl = hasTeamUrl;
function report(txt) {
    if (analyse(txt)) {
        $.post('/jslog/' + window.location.href.substr(-12) + '?n=spam');
        window.lichess.storage.set('chat-spam', '1');
    }
}
exports.report = report;
const spamRegex = new RegExp([
    'xcamweb.com',
    '(^|[^i])chess-bot',
    'chess-cheat',
    'coolteenbitch',
    'letcafa.webcam',
    'tinyurl.com/',
    'wooga.info/',
    'bit.ly/',
    'wbt.link/',
    'eb.by/',
    '001.rs/',
    'shr.name/',
    'u.to/',
    '.3-a.net',
    '.ssl443.org',
    '.ns02.us',
    '.myftp.info',
    '.flinkup.com',
    '.serveusers.com',
    'badoogirls.com',
    'hide.su',
    'wyon.de',
    'sexdatingcz.club'
].map(url => {
    return url.replace(/\./g, '\\.').replace(/\//g, '\\/');
}).join('|'));
function analyse(txt) {
    return !!txt.match(spamRegex);
}
const teamUrlRegex = /lichess\.org\/team\//;

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
function userLink(u, title) {
    const trunc = u.substring(0, 14);
    return snabbdom_1.h('a', {
        // can't be inlined because of thunks
        class: {
            'user-link': true,
            ulpt: true
        },
        attrs: {
            href: '/@/' + u
        }
    }, title ? [
        snabbdom_1.h('span.title', title == 'BOT' ? { attrs: { 'data-bot': true } } : {}, title), trunc
    ] : [trunc]);
}
exports.userLink = userLink;
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
function bind(eventName, f) {
    return {
        insert: (vnode) => {
            vnode.elm.addEventListener(eventName, f);
        }
    };
}
exports.bind = bind;

},{"snabbdom":6}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const discussion_1 = require("./discussion");
const note_1 = require("./note");
const moderation_1 = require("./moderation");
const util_1 = require("./util");
function default_1(ctrl) {
    const mod = ctrl.moderation();
    return snabbdom_1.h('section.mchat' + (ctrl.opts.alwaysEnabled ? '' : '.mchat-optional'), {
        class: {
            'mchat-mod': !!mod
        },
        hook: {
            destroy: ctrl.destroy
        }
    }, moderation_1.moderationView(mod) || normalView(ctrl));
}
exports.default = default_1;
function renderPalantir(ctrl) {
    const p = ctrl.palantir;
    if (!p.enabled())
        return;
    return p.instance ? p.instance.render(snabbdom_1.h) : snabbdom_1.h('div.mchat__tab.palantir.palantir-slot', {
        attrs: {
            'data-icon': '',
            title: 'Voice chat'
        },
        hook: util_1.bind('click', () => {
            if (!p.loaded) {
                p.loaded = true;
                const li = window.lichess;
                li.loadScript('javascripts/vendor/peerjs.min.js').then(() => {
                    li.loadScript(li.compiledScript('palantir')).then(() => {
                        p.instance = window.Palantir.palantir({
                            uid: ctrl.data.userId,
                            redraw: ctrl.redraw
                        });
                        ctrl.redraw();
                    });
                });
            }
        })
    });
}
function normalView(ctrl) {
    const active = ctrl.vm.tab;
    return [
        snabbdom_1.h('div.mchat__tabs.nb_' + ctrl.allTabs.length, [
            ...ctrl.allTabs.map(t => renderTab(ctrl, t, active)),
            renderPalantir(ctrl)
        ]),
        snabbdom_1.h('div.mchat__content.' + active, (active === 'note' && ctrl.note) ? [note_1.noteView(ctrl.note)] : (ctrl.plugin && active === ctrl.plugin.tab.key ? [ctrl.plugin.view()] : discussion_1.default(ctrl)))
    ];
}
function renderTab(ctrl, tab, active) {
    return snabbdom_1.h('div.mchat__tab.' + tab, {
        class: { 'mchat__tab-active': tab === active },
        hook: util_1.bind('click', () => ctrl.setTab(tab))
    }, tabName(ctrl, tab));
}
function tabName(ctrl, tab) {
    if (tab === 'discussion')
        return [
            snabbdom_1.h('span', ctrl.data.name),
            ctrl.opts.alwaysEnabled ? undefined : snabbdom_1.h('input', {
                attrs: {
                    type: 'checkbox',
                    title: ctrl.trans.noarg('toggleTheChat'),
                    checked: ctrl.vm.enabled
                },
                hook: util_1.bind('change', (e) => {
                    ctrl.setEnabled(e.target.checked);
                })
            })
        ];
    if (tab === 'note')
        return [snabbdom_1.h('span', ctrl.trans.noarg('notes'))];
    if (ctrl.plugin && tab === ctrl.plugin.tab.key)
        return [snabbdom_1.h('span', ctrl.plugin.tab.name)];
    return [];
}

},{"./discussion":10,"./moderation":13,"./note":14,"./util":17,"snabbdom":6}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function userModInfo(username) {
    return $.get('/mod/chat-user/' + username);
}
exports.userModInfo = userModInfo;
function flag(resource, username, text) {
    return $.post('/report/flag', { username, resource, text });
}
exports.flag = flag;
function getNote(id) {
    return $.get(noteUrl(id));
}
exports.getNote = getNote;
function setNote(id, text) {
    return $.post(noteUrl(id), { text });
}
exports.setNote = setNote;
function noteUrl(id) {
    return `/${id}/note`;
}

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function defined(v) {
    return typeof v !== 'undefined';
}
exports.defined = defined;
function empty(a) {
    return !a || a.length === 0;
}
exports.empty = empty;
// like mithril prop but with type safety
function prop(initialValue) {
    let value = initialValue;
    const fun = function (v) {
        if (defined(v))
            value = v;
        return value;
    };
    return fun;
}
exports.prop = prop;

},{}]},{},[12])(12)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3RodW5rLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3Zub2RlLmpzIiwic3JjL2N0cmwudHMiLCJzcmMvZGlzY3Vzc2lvbi50cyIsInNyYy9lbmhhbmNlLnRzIiwic3JjL21haW4udHMiLCJzcmMvbW9kZXJhdGlvbi50cyIsInNyYy9ub3RlLnRzIiwic3JjL3ByZXNldC50cyIsInNyYy9zcGFtLnRzIiwic3JjL3V0aWwudHMiLCJzcmMvdmlldy50cyIsInNyYy94aHIudHMiLCIuLi9jb21tb24vc3JjL2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFDO1FBQzFCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxHQUFjLENBQUM7QUFDeEIsQ0FBQztBQVBELG9CQU9DIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gICAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4gICAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkRGF0YSA9IGNoaWxkcmVuW2ldLmRhdGE7XG4gICAgICAgICAgICBpZiAoY2hpbGREYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhZGROUyhjaGlsZERhdGEsIGNoaWxkcmVuW2ldLmNoaWxkcmVuLCBjaGlsZHJlbltpXS5zZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgICBpZiAoYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGEgPSBiO1xuICAgICAgICBpZiAoaXMuYXJyYXkoYykpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHtcbiAgICAgICAgICAgIHRleHQgPSBjO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMgJiYgYy5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2NdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXMuYXJyYXkoYikpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYikpIHtcbiAgICAgICAgICAgIHRleHQgPSBiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIgJiYgYi5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2JdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YSA9IGI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKVxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldID0gdm5vZGVfMS52bm9kZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnICYmXG4gICAgICAgIChzZWwubGVuZ3RoID09PSAzIHx8IHNlbFszXSA9PT0gJy4nIHx8IHNlbFszXSA9PT0gJyMnKSkge1xuICAgICAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlXzEudm5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn1cbmV4cG9ydHMuaCA9IGg7XG47XG5leHBvcnRzLmRlZmF1bHQgPSBoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xufVxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkge1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ2hpbGQobm9kZSwgY2hpbGQpIHtcbiAgICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlO1xufVxuZnVuY3Rpb24gbmV4dFNpYmxpbmcobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xufVxuZnVuY3Rpb24gdGFnTmFtZShlbG0pIHtcbiAgICByZXR1cm4gZWxtLnRhZ05hbWU7XG59XG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChub2RlLCB0ZXh0KSB7XG4gICAgbm9kZS50ZXh0Q29udGVudCA9IHRleHQ7XG59XG5mdW5jdGlvbiBnZXRUZXh0Q29udGVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dENvbnRlbnQ7XG59XG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxO1xufVxuZnVuY3Rpb24gaXNUZXh0KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMztcbn1cbmV4cG9ydHMuaHRtbERvbUFwaSA9IHtcbiAgICBjcmVhdGVFbGVtZW50OiBjcmVhdGVFbGVtZW50LFxuICAgIGNyZWF0ZUVsZW1lbnROUzogY3JlYXRlRWxlbWVudE5TLFxuICAgIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gICAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICAgIHBhcmVudE5vZGU6IHBhcmVudE5vZGUsXG4gICAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgc2V0VGV4dENvbnRlbnQ6IHNldFRleHRDb250ZW50LFxuICAgIGdldFRleHRDb250ZW50OiBnZXRUZXh0Q29udGVudCxcbiAgICBpc0VsZW1lbnQ6IGlzRWxlbWVudCxcbiAgICBpc1RleHQ6IGlzVGV4dCxcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmh0bWxEb21BcGk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1odG1sZG9tYXBpLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5hcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBwcmltaXRpdmUocykge1xuICAgIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5wcmltaXRpdmUgPSBwcmltaXRpdmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBrZXksIGVsbSA9IHZub2RlLmVsbSwgb2xkQXR0cnMgPSBvbGRWbm9kZS5kYXRhLmF0dHJzLCBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnM7XG4gICAgaWYgKCFvbGRBdHRycyAmJiAhYXR0cnMpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQXR0cnMgPT09IGF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQXR0cnMgPSBvbGRBdHRycyB8fCB7fTtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuICAgIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgICBmb3IgKGtleSBpbiBhdHRycykge1xuICAgICAgICB2YXIgY3VyID0gYXR0cnNba2V5XTtcbiAgICAgICAgdmFyIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgICAgICAgaWYgKGN1ciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGN1ciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgY3VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyByZW1vdmUgcmVtb3ZlZCBhdHRyaWJ1dGVzXG4gICAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAgIC8vIHRoZSBvdGhlciBvcHRpb24gaXMgdG8gcmVtb3ZlIGFsbCBhdHRyaWJ1dGVzIHdpdGggdmFsdWUgPT0gdW5kZWZpbmVkXG4gICAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICAgICAgaWYgKCEoa2V5IGluIGF0dHJzKSkge1xuICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUF0dHJzLCB1cGRhdGU6IHVwZGF0ZUF0dHJzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmF0dHJpYnV0ZXNNb2R1bGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdHRyaWJ1dGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gdXBkYXRlQ2xhc3Mob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBvbGRDbGFzcyA9IG9sZFZub2RlLmRhdGEuY2xhc3MsIGtsYXNzID0gdm5vZGUuZGF0YS5jbGFzcztcbiAgICBpZiAoIW9sZENsYXNzICYmICFrbGFzcylcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChvbGRDbGFzcyA9PT0ga2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBvbGRDbGFzcyA9IG9sZENsYXNzIHx8IHt9O1xuICAgIGtsYXNzID0ga2xhc3MgfHwge307XG4gICAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgICAgIGlmICgha2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgICAgICBjdXIgPSBrbGFzc1tuYW1lXTtcbiAgICAgICAgaWYgKGN1ciAhPT0gb2xkQ2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3RbY3VyID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmNsYXNzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmNsYXNzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2xhc3MuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG52YXIgaHRtbGRvbWFwaV8xID0gcmVxdWlyZShcIi4vaHRtbGRvbWFwaVwiKTtcbmZ1bmN0aW9uIGlzVW5kZWYocykgeyByZXR1cm4gcyA9PT0gdW5kZWZpbmVkOyB9XG5mdW5jdGlvbiBpc0RlZihzKSB7IHJldHVybiBzICE9PSB1bmRlZmluZWQ7IH1cbnZhciBlbXB0eU5vZGUgPSB2bm9kZV8xLmRlZmF1bHQoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuZnVuY3Rpb24gc2FtZVZub2RlKHZub2RlMSwgdm5vZGUyKSB7XG4gICAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cbmZ1bmN0aW9uIGlzVm5vZGUodm5vZGUpIHtcbiAgICByZXR1cm4gdm5vZGUuc2VsICE9PSB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICAgIHZhciBpLCBtYXAgPSB7fSwga2V5LCBjaDtcbiAgICBmb3IgKGkgPSBiZWdpbklkeDsgaSA8PSBlbmRJZHg7ICsraSkge1xuICAgICAgICBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAga2V5ID0gY2gua2V5O1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcFtrZXldID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxudmFyIGhvb2tzID0gWydjcmVhdGUnLCAndXBkYXRlJywgJ3JlbW92ZScsICdkZXN0cm95JywgJ3ByZScsICdwb3N0J107XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmV4cG9ydHMuaCA9IGhfMS5oO1xudmFyIHRodW5rXzEgPSByZXF1aXJlKFwiLi90aHVua1wiKTtcbmV4cG9ydHMudGh1bmsgPSB0aHVua18xLnRodW5rO1xuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBkb21BcGkpIHtcbiAgICB2YXIgaSwgaiwgY2JzID0ge307XG4gICAgdmFyIGFwaSA9IGRvbUFwaSAhPT0gdW5kZWZpbmVkID8gZG9tQXBpIDogaHRtbGRvbWFwaV8xLmRlZmF1bHQ7XG4gICAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNic1tob29rc1tpXV0gPSBbXTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIHZhciBob29rID0gbW9kdWxlc1tqXVtob29rc1tpXV07XG4gICAgICAgICAgICBpZiAoaG9vayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2JzW2hvb2tzW2ldXS5wdXNoKGhvb2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgICAgICB2YXIgaWQgPSBlbG0uaWQgPyAnIycgKyBlbG0uaWQgOiAnJztcbiAgICAgICAgdmFyIGMgPSBlbG0uY2xhc3NOYW1lID8gJy4nICsgZWxtLmNsYXNzTmFtZS5zcGxpdCgnICcpLmpvaW4oJy4nKSA6ICcnO1xuICAgICAgICByZXR1cm4gdm5vZGVfMS5kZWZhdWx0KGFwaS50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSArIGlkICsgYywge30sIFtdLCB1bmRlZmluZWQsIGVsbSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcm1DYigpIHtcbiAgICAgICAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRfMSA9IGFwaS5wYXJlbnROb2RlKGNoaWxkRWxtKTtcbiAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50XzEsIGNoaWxkRWxtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuaW5pdCkpIHtcbiAgICAgICAgICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgICAgICBpZiAoc2VsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIFBhcnNlIHNlbGVjdG9yXG4gICAgICAgICAgICB2YXIgaGFzaElkeCA9IHNlbC5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgICB2YXIgZG90SWR4ID0gc2VsLmluZGV4T2YoJy4nLCBoYXNoSWR4KTtcbiAgICAgICAgICAgIHZhciBoYXNoID0gaGFzaElkeCA+IDAgPyBoYXNoSWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkb3QgPSBkb3RJZHggPiAwID8gZG90SWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciB0YWcgPSBoYXNoSWR4ICE9PSAtMSB8fCBkb3RJZHggIT09IC0xID8gc2VsLnNsaWNlKDAsIE1hdGgubWluKGhhc2gsIGRvdCkpIDogc2VsO1xuICAgICAgICAgICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgICAgICAgIGlmIChoYXNoIDwgZG90KVxuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ2lkJywgc2VsLnNsaWNlKGhhc2ggKyAxLCBkb3QpKTtcbiAgICAgICAgICAgIGlmIChkb3RJZHggPiAwKVxuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgc2VsLnNsaWNlKGRvdCArIDEpLnJlcGxhY2UoL1xcLi9nLCAnICcpKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5jcmVhdGVbaV0oZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzLnByaW1pdGl2ZSh2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gdm5vZGUuZGF0YS5ob29rOyAvLyBSZXVzZSB2YXJpYWJsZVxuICAgICAgICAgICAgaWYgKGlzRGVmKGkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkuY3JlYXRlKVxuICAgICAgICAgICAgICAgICAgICBpLmNyZWF0ZShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoaS5pbnNlcnQpXG4gICAgICAgICAgICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZub2RlLmVsbSA9IGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm5vZGUuZWxtO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0oY2gsIGluc2VydGVkVm5vZGVRdWV1ZSksIGJlZm9yZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gaW52b2tlRGVzdHJveUhvb2sodm5vZGUpIHtcbiAgICAgICAgdmFyIGksIGosIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuZGVzdHJveSkpXG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLmRlc3Ryb3lbaV0odm5vZGUpO1xuICAgICAgICAgICAgaWYgKHZub2RlLmNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgaSA9IHZub2RlLmNoaWxkcmVuW2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPSBudWxsICYmIHR5cGVvZiBpICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVWbm9kZXMocGFyZW50RWxtLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgpIHtcbiAgICAgICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgICAgICAgdmFyIGlfMSA9IHZvaWQgMCwgbGlzdGVuZXJzID0gdm9pZCAwLCBybSA9IHZvaWQgMCwgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYoY2guc2VsKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhjaCk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgICAgICAgICAgICAgcm0gPSBjcmVhdGVSbUNiKGNoLmVsbSwgbGlzdGVuZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpXzEgPSAwOyBpXzEgPCBjYnMucmVtb3ZlLmxlbmd0aDsgKytpXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICBjYnMucmVtb3ZlW2lfMV0oY2gsIHJtKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmKGlfMSA9IGNoLmRhdGEpICYmIGlzRGVmKGlfMSA9IGlfMS5ob29rKSAmJiBpc0RlZihpXzEgPSBpXzEucmVtb3ZlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaV8xKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBybSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1cGRhdGVDaGlsZHJlbihwYXJlbnRFbG0sIG9sZENoLCBuZXdDaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBvbGRTdGFydElkeCA9IDAsIG5ld1N0YXJ0SWR4ID0gMDtcbiAgICAgICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciBvbGRTdGFydFZub2RlID0gb2xkQ2hbMF07XG4gICAgICAgIHZhciBvbGRFbmRWbm9kZSA9IG9sZENoW29sZEVuZElkeF07XG4gICAgICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWzBdO1xuICAgICAgICB2YXIgbmV3RW5kVm5vZGUgPSBuZXdDaFtuZXdFbmRJZHhdO1xuICAgICAgICB2YXIgb2xkS2V5VG9JZHg7XG4gICAgICAgIHZhciBpZHhJbk9sZDtcbiAgICAgICAgdmFyIGVsbVRvTW92ZTtcbiAgICAgICAgdmFyIGJlZm9yZTtcbiAgICAgICAgd2hpbGUgKG9sZFN0YXJ0SWR4IDw9IG9sZEVuZElkeCAmJiBuZXdTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgICAgICAgIGlmIChvbGRTdGFydFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07IC8vIFZub2RlIG1pZ2h0IGhhdmUgYmVlbiBtb3ZlZCBsZWZ0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvbGRFbmRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdTdGFydFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdFbmRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkU3RhcnRWbm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhvbGRFbmRWbm9kZS5lbG0pKTtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZEtleVRvSWR4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkS2V5VG9JZHggPSBjcmVhdGVLZXlUb09sZElkeChvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkeEluT2xkID0gb2xkS2V5VG9JZHhbbmV3U3RhcnRWbm9kZS5rZXldO1xuICAgICAgICAgICAgICAgIGlmIChpc1VuZGVmKGlkeEluT2xkKSkge1xuICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxtVG9Nb3ZlID0gb2xkQ2hbaWR4SW5PbGRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxtVG9Nb3ZlLnNlbCAhPT0gbmV3U3RhcnRWbm9kZS5zZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgZWxtVG9Nb3ZlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICAgICAgICBiZWZvcmUgPSBuZXdDaFtuZXdFbmRJZHggKyAxXSA9PSBudWxsID8gbnVsbCA6IG5ld0NoW25ld0VuZElkeCArIDFdLmVsbTtcbiAgICAgICAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBob29rO1xuICAgICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEpICYmIGlzRGVmKGhvb2sgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBob29rLnByZXBhdGNoKSkge1xuICAgICAgICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgIHZhciBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuO1xuICAgICAgICB2YXIgY2ggPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKG9sZFZub2RlID09PSB2bm9kZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHZub2RlLmRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy51cGRhdGUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLnVwZGF0ZVtpXShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vaztcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKVxuICAgICAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkQ2ggIT09IGNoKVxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSlcbiAgICAgICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgICAgIGFkZFZub2RlcyhlbG0sIG51bGwsIGNoLCAwLCBjaC5sZW5ndGggLSAxLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlVm5vZGVzKGVsbSwgb2xkQ2gsIDAsIG9sZENoLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2xkVm5vZGUudGV4dCAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRGVmKGhvb2spICYmIGlzRGVmKGkgPSBob29rLnBvc3RwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gcGF0Y2gob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBlbG0sIHBhcmVudDtcbiAgICAgICAgdmFyIGluc2VydGVkVm5vZGVRdWV1ZSA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnByZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wcmVbaV0oKTtcbiAgICAgICAgaWYgKCFpc1Zub2RlKG9sZFZub2RlKSkge1xuICAgICAgICAgICAgb2xkVm5vZGUgPSBlbXB0eU5vZGVBdChvbGRWbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICAgICAgICBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgICAgICAgIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGVsbSk7XG4gICAgICAgICAgICBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnQsIHZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKGVsbSkpO1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnQsIFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbnNlcnRlZFZub2RlUXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KGluc2VydGVkVm5vZGVRdWV1ZVtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wb3N0Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgY2JzLnBvc3RbaV0oKTtcbiAgICAgICAgcmV0dXJuIHZub2RlO1xuICAgIH07XG59XG5leHBvcnRzLmluaXQgPSBpbml0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c25hYmJkb20uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmZ1bmN0aW9uIGNvcHlUb1RodW5rKHZub2RlLCB0aHVuaykge1xuICAgIHRodW5rLmVsbSA9IHZub2RlLmVsbTtcbiAgICB2bm9kZS5kYXRhLmZuID0gdGh1bmsuZGF0YS5mbjtcbiAgICB2bm9kZS5kYXRhLmFyZ3MgPSB0aHVuay5kYXRhLmFyZ3M7XG4gICAgdGh1bmsuZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdGh1bmsuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICB0aHVuay50ZXh0ID0gdm5vZGUudGV4dDtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG59XG5mdW5jdGlvbiBpbml0KHRodW5rKSB7XG4gICAgdmFyIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIHZub2RlID0gY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgY3VyLmFyZ3MpO1xuICAgIGNvcHlUb1RodW5rKHZub2RlLCB0aHVuayk7XG59XG5mdW5jdGlvbiBwcmVwYXRjaChvbGRWbm9kZSwgdGh1bmspIHtcbiAgICB2YXIgaSwgb2xkID0gb2xkVm5vZGUuZGF0YSwgY3VyID0gdGh1bmsuZGF0YTtcbiAgICB2YXIgb2xkQXJncyA9IG9sZC5hcmdzLCBhcmdzID0gY3VyLmFyZ3M7XG4gICAgaWYgKG9sZC5mbiAhPT0gY3VyLmZuIHx8IG9sZEFyZ3MubGVuZ3RoICE9PSBhcmdzLmxlbmd0aCkge1xuICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChvbGRBcmdzW2ldICE9PSBhcmdzW2ldKSB7XG4gICAgICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvcHlUb1RodW5rKG9sZFZub2RlLCB0aHVuayk7XG59XG5leHBvcnRzLnRodW5rID0gZnVuY3Rpb24gdGh1bmsoc2VsLCBrZXksIGZuLCBhcmdzKSB7XG4gICAgaWYgKGFyZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhcmdzID0gZm47XG4gICAgICAgIGZuID0ga2V5O1xuICAgICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBoXzEuaChzZWwsIHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGhvb2s6IHsgaW5pdDogaW5pdCwgcHJlcGF0Y2g6IHByZXBhdGNoIH0sXG4gICAgICAgIGZuOiBmbixcbiAgICAgICAgYXJnczogYXJnc1xuICAgIH0pO1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMudGh1bms7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aHVuay5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIGVsbSkge1xuICAgIHZhciBrZXkgPSBkYXRhID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBkYXRhLmtleTtcbiAgICByZXR1cm4geyBzZWw6IHNlbCwgZGF0YTogZGF0YSwgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICB0ZXh0OiB0ZXh0LCBlbG06IGVsbSwga2V5OiBrZXkgfTtcbn1cbmV4cG9ydHMudm5vZGUgPSB2bm9kZTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZub2RlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dm5vZGUuanMubWFwIiwiaW1wb3J0IHsgQ3RybCwgQ2hhdE9wdHMsIExpbmUsIFRhYiwgVmlld01vZGVsLCBSZWRyYXcsIFBlcm1pc3Npb25zLCBNb2RlcmF0aW9uQ3RybCB9IGZyb20gJy4vaW50ZXJmYWNlcydcbmltcG9ydCB7IHByZXNldEN0cmwgfSBmcm9tICcuL3ByZXNldCdcbmltcG9ydCB7IG5vdGVDdHJsIH0gZnJvbSAnLi9ub3RlJ1xuaW1wb3J0IHsgbW9kZXJhdGlvbkN0cmwgfSBmcm9tICcuL21vZGVyYXRpb24nXG5pbXBvcnQgeyBwcm9wIH0gZnJvbSAnY29tbW9uJztcblxuY29uc3QgbGkgPSB3aW5kb3cubGljaGVzcztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob3B0czogQ2hhdE9wdHMsIHJlZHJhdzogUmVkcmF3KTogQ3RybCB7XG5cbiAgY29uc3QgZGF0YSA9IG9wdHMuZGF0YTtcbiAgZGF0YS5kb21WZXJzaW9uID0gMTsgLy8gaW5jcmVtZW50IHRvIGZvcmNlIHJlZHJhd1xuICBjb25zdCBtYXhMaW5lcyA9IDIwMDtcbiAgY29uc3QgbWF4TGluZXNEcm9wID0gNTA7IC8vIGhvdyBtYW55IGxpbmVzIHRvIGRyb3AgYXQgb25jZVxuXG4gIGNvbnN0IHBhbGFudGlyID0ge1xuICAgIGluc3RhbmNlOiB1bmRlZmluZWQsXG4gICAgbG9hZGVkOiBmYWxzZSxcbiAgICBlbmFibGVkOiBwcm9wKCEhZGF0YS5wYWxhbnRpcilcbiAgfTtcblxuICBjb25zdCBhbGxUYWJzOiBUYWJbXSA9IFsnZGlzY3Vzc2lvbiddO1xuICBpZiAob3B0cy5ub3RlSWQpIGFsbFRhYnMucHVzaCgnbm90ZScpO1xuICBpZiAob3B0cy5wbHVnaW4pIGFsbFRhYnMucHVzaChvcHRzLnBsdWdpbi50YWIua2V5KTtcblxuICBjb25zdCB0YWJTdG9yYWdlID0gbGkuc3RvcmFnZS5tYWtlKCdjaGF0LnRhYicpLFxuICAgIHN0b3JlZFRhYiA9IHRhYlN0b3JhZ2UuZ2V0KCk7XG5cbiAgbGV0IG1vZGVyYXRpb246IE1vZGVyYXRpb25DdHJsIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHZtOiBWaWV3TW9kZWwgPSB7XG4gICAgdGFiOiBhbGxUYWJzLmZpbmQodGFiID0+IHRhYiA9PT0gc3RvcmVkVGFiKSB8fCBhbGxUYWJzWzBdLFxuICAgIGVuYWJsZWQ6IG9wdHMuYWx3YXlzRW5hYmxlZCB8fCAhbGkuc3RvcmFnZS5nZXQoJ25vY2hhdCcpLFxuICAgIHBsYWNlaG9sZGVyS2V5OiAndGFsa0luQ2hhdCcsXG4gICAgbG9hZGluZzogZmFsc2UsXG4gICAgdGltZW91dDogb3B0cy50aW1lb3V0LFxuICAgIHdyaXRlYWJsZTogb3B0cy53cml0ZWFibGVcbiAgfTtcblxuICAvKiBJZiBkaXNjdXNzaW9uIGlzIGRpc2FibGVkLCBhbmQgd2UgaGF2ZSBhbm90aGVyIGNoYXQgdGFiLFxuICAgKiB0aGVuIHNlbGVjdCB0aGF0IHRhYiBvdmVyIGRpc2N1c3Npb24gKi9cbiAgaWYgKGFsbFRhYnMubGVuZ3RoID4gMSAmJiB2bS50YWIgPT09ICdkaXNjdXNzaW9uJyAmJiBsaS5zdG9yYWdlLmdldCgnbm9jaGF0JykpIHZtLnRhYiA9IGFsbFRhYnNbMV07XG5cbiAgY29uc3QgcG9zdCA9IGZ1bmN0aW9uKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRleHQgPSB0ZXh0LnRyaW0oKTtcbiAgICBpZiAoIXRleHQpIHJldHVybjtcbiAgICBpZiAodGV4dC5sZW5ndGggPiAxNDApIHtcbiAgICAgIGFsZXJ0KCdNYXggbGVuZ3RoOiAxNDAgY2hhcnMuICcgKyB0ZXh0Lmxlbmd0aCArICcgY2hhcnMgdXNlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGkucHVic3ViLmVtaXQoJ3NvY2tldC5zZW5kJywgJ3RhbGsnLCB0ZXh0KTtcbiAgfTtcblxuICBjb25zdCBvblRpbWVvdXQgPSBmdW5jdGlvbih1c2VySWQ6IHN0cmluZykge1xuICAgIGRhdGEubGluZXMuZm9yRWFjaChsID0+IHtcbiAgICAgIGlmIChsLnUgJiYgbC51LnRvTG93ZXJDYXNlKCkgPT0gdXNlcklkKSBsLmQgPSB0cnVlO1xuICAgIH0pO1xuICAgIGlmICh1c2VySWQgPT0gZGF0YS51c2VySWQpIHZtLnRpbWVvdXQgPSB0cnVlO1xuICAgIGRhdGEuZG9tVmVyc2lvbisrO1xuICAgIHJlZHJhdygpO1xuICB9O1xuXG4gIGNvbnN0IG9uUmVpbnN0YXRlID0gZnVuY3Rpb24odXNlcklkOiBzdHJpbmcpIHtcbiAgICBpZiAodXNlcklkID09IGRhdGEudXNlcklkKSB7XG4gICAgICB2bS50aW1lb3V0ID0gZmFsc2U7XG4gICAgICByZWRyYXcoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgb25NZXNzYWdlID0gZnVuY3Rpb24obGluZTogTGluZSkge1xuICAgIGRhdGEubGluZXMucHVzaChsaW5lKTtcbiAgICBjb25zdCBuYiA9IGRhdGEubGluZXMubGVuZ3RoO1xuICAgIGlmIChuYiA+IG1heExpbmVzKSB7XG4gICAgICBkYXRhLmxpbmVzLnNwbGljZSgwLCBuYiAtIG1heExpbmVzICsgbWF4TGluZXNEcm9wKTtcbiAgICAgIGRhdGEuZG9tVmVyc2lvbisrO1xuICAgIH1cbiAgICByZWRyYXcoKTtcbiAgfTtcblxuICBjb25zdCBvbldyaXRlYWJsZSA9IGZ1bmN0aW9uKHY6IGJvb2xlYW4pIHtcbiAgICB2bS53cml0ZWFibGUgPSB2O1xuICAgIHJlZHJhdygpO1xuICB9XG5cbiAgY29uc3Qgb25QZXJtaXNzaW9ucyA9IGZ1bmN0aW9uKG9iajogUGVybWlzc2lvbnMpIHtcbiAgICBsZXQgcDoga2V5b2YgUGVybWlzc2lvbnM7XG4gICAgZm9yIChwIGluIG9iaikgb3B0cy5wZXJtaXNzaW9uc1twXSA9IG9ialtwXTtcbiAgICBpbnN0YW5jaWF0ZU1vZGVyYXRpb24oKTtcbiAgICByZWRyYXcoKTtcbiAgfVxuXG4gIGNvbnN0IHRyYW5zID0gbGkudHJhbnMob3B0cy5pMThuKTtcblxuICBmdW5jdGlvbiBjYW5Nb2QoKSB7XG4gICAgcmV0dXJuIG9wdHMucGVybWlzc2lvbnMudGltZW91dCB8fCBvcHRzLnBlcm1pc3Npb25zLmxvY2FsO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5zdGFuY2lhdGVNb2RlcmF0aW9uKCkge1xuICAgIG1vZGVyYXRpb24gPSBjYW5Nb2QoKSA/IG1vZGVyYXRpb25DdHJsKHtcbiAgICAgIHJlYXNvbnM6IG9wdHMudGltZW91dFJlYXNvbnMgfHwgKFt7a2V5OiAnb3RoZXInLCBuYW1lOiAnSW5hcHByb3ByaWF0ZSBiZWhhdmlvcid9XSksXG4gICAgICBwZXJtaXNzaW9uczogb3B0cy5wZXJtaXNzaW9ucyxcbiAgICAgIHJlZHJhd1xuICAgIH0pIDogdW5kZWZpbmVkO1xuICAgIGlmIChjYW5Nb2QoKSkgb3B0cy5sb2FkQ3NzKCdjaGF0Lm1vZCcpO1xuICB9XG4gIGluc3RhbmNpYXRlTW9kZXJhdGlvbigpO1xuXG4gIGNvbnN0IG5vdGUgPSBvcHRzLm5vdGVJZCA/IG5vdGVDdHJsKHtcbiAgICBpZDogb3B0cy5ub3RlSWQsXG4gICAgdHJhbnMsXG4gICAgcmVkcmF3XG4gIH0pIDogdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHByZXNldCA9IHByZXNldEN0cmwoe1xuICAgIGluaXRpYWxHcm91cDogb3B0cy5wcmVzZXQsXG4gICAgcG9zdCxcbiAgICByZWRyYXdcbiAgfSk7XG5cbiAgY29uc3Qgc3ViczogW3N0cmluZywgUHVic3ViQ2FsbGJhY2tdW10gID0gW1xuICAgIFsnc29ja2V0LmluLm1lc3NhZ2UnLCBvbk1lc3NhZ2VdLFxuICAgIFsnc29ja2V0LmluLmNoYXRfdGltZW91dCcsIG9uVGltZW91dF0sXG4gICAgWydzb2NrZXQuaW4uY2hhdF9yZWluc3RhdGUnLCBvblJlaW5zdGF0ZV0sXG4gICAgWydjaGF0LndyaXRlYWJsZScsIG9uV3JpdGVhYmxlXSxcbiAgICBbJ2NoYXQucGVybWlzc2lvbnMnLCBvblBlcm1pc3Npb25zXSxcbiAgICBbJ3BhbGFudGlyLnRvZ2dsZScsIHBhbGFudGlyLmVuYWJsZWRdXG4gIF07XG4gIHN1YnMuZm9yRWFjaCgoW2V2ZW50TmFtZSwgY2FsbGJhY2tdKSA9PiBsaS5wdWJzdWIub24oZXZlbnROYW1lLCBjYWxsYmFjaykpO1xuXG4gIGNvbnN0IGRlc3Ryb3kgPSAoKSA9PiB7XG4gICAgc3Vicy5mb3JFYWNoKChbZXZlbnROYW1lLCBjYWxsYmFja10pID0+IGxpLnB1YnN1Yi5vZmYoZXZlbnROYW1lLCBjYWxsYmFjaykpO1xuICB9O1xuXG4gIGNvbnN0IGVtaXRFbmFibGVkID0gKCkgPT4gbGkucHVic3ViLmVtaXQoJ2NoYXQuZW5hYmxlZCcsIHZtLmVuYWJsZWQpO1xuICBlbWl0RW5hYmxlZCgpO1xuXG4gIHJldHVybiB7XG4gICAgZGF0YSxcbiAgICBvcHRzLFxuICAgIHZtLFxuICAgIGFsbFRhYnMsXG4gICAgc2V0VGFiKHQ6IFRhYikge1xuICAgICAgdm0udGFiID0gdDtcbiAgICAgIHRhYlN0b3JhZ2Uuc2V0KHQpO1xuICAgICAgLy8gSXQncyBhIGxhbWUgd2F5IHRvIGRvIGl0LiBHaXZlIG1lIGEgYnJlYWsuXG4gICAgICBpZiAodCA9PT0gJ2Rpc2N1c3Npb24nKSBsaS5yZXF1ZXN0SWRsZUNhbGxiYWNrKCgpID0+ICQoJy5tY2hhdF9fc2F5JykuZm9jdXMoKSk7XG4gICAgICByZWRyYXcoKTtcbiAgICB9LFxuICAgIG1vZGVyYXRpb246ICgpID0+IG1vZGVyYXRpb24sXG4gICAgbm90ZSxcbiAgICBwcmVzZXQsXG4gICAgcG9zdCxcbiAgICB0cmFucyxcbiAgICBwbHVnaW46IG9wdHMucGx1Z2luLFxuICAgIHNldEVuYWJsZWQodjogYm9vbGVhbikge1xuICAgICAgdm0uZW5hYmxlZCA9IHY7XG4gICAgICBlbWl0RW5hYmxlZCgpO1xuICAgICAgaWYgKCF2KSBsaS5zdG9yYWdlLnNldCgnbm9jaGF0JywgJzEnKTtcbiAgICAgIGVsc2UgbGkuc3RvcmFnZS5yZW1vdmUoJ25vY2hhdCcpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSxcbiAgICByZWRyYXcsXG4gICAgcGFsYW50aXIsXG4gICAgZGVzdHJveVxuICB9O1xufTtcbiIsImltcG9ydCB7IGgsIHRodW5rIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVEYXRhIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBDdHJsLCBMaW5lIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0ICogYXMgc3BhbSBmcm9tICcuL3NwYW0nXG5pbXBvcnQgKiBhcyBlbmhhbmNlIGZyb20gJy4vZW5oYW5jZSc7XG5pbXBvcnQgeyBwcmVzZXRWaWV3IH0gZnJvbSAnLi9wcmVzZXQnO1xuaW1wb3J0IHsgbGluZUFjdGlvbiBhcyBtb2RMaW5lQWN0aW9uIH0gZnJvbSAnLi9tb2RlcmF0aW9uJztcbmltcG9ydCB7IHVzZXJMaW5rIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IGZsYWcgfSBmcm9tICcuL3hocidcblxuY29uc3Qgd2hpc3BlclJlZ2V4ID0gL15cXC93KD86aGlzcGVyKT9cXHMvO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBDdHJsKTogQXJyYXk8Vk5vZGUgfCB1bmRlZmluZWQ+IHtcbiAgaWYgKCFjdHJsLnZtLmVuYWJsZWQpIHJldHVybiBbXTtcbiAgY29uc3Qgc2Nyb2xsQ2IgPSAodm5vZGU6IFZOb2RlKSA9PiB7XG4gICAgY29uc3QgZWwgPSB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnRcbiAgICBpZiAoY3RybC5kYXRhLmxpbmVzLmxlbmd0aCA+IDUpIHtcbiAgICAgIGNvbnN0IGF1dG9TY3JvbGwgPSAoZWwuc2Nyb2xsVG9wID09PSAwIHx8IChlbC5zY3JvbGxUb3AgPiAoZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0IC0gMTAwKSkpO1xuICAgICAgaWYgKGF1dG9TY3JvbGwpIHtcbiAgICAgICAgZWwuc2Nyb2xsVG9wID0gOTk5OTk5O1xuICAgICAgICBzZXRUaW1lb3V0KChfOiBhbnkpID0+IGVsLnNjcm9sbFRvcCA9IDk5OTk5OSwgMzAwKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgbW9kID0gY3RybC5tb2RlcmF0aW9uKCk7XG4gIGNvbnN0IHZub2RlcyA9IFtcbiAgICBoKCdvbC5tY2hhdF9fbWVzc2FnZXMuY2hhdC12LScgKyBjdHJsLmRhdGEuZG9tVmVyc2lvbiwge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcm9sZTogJ2xvZycsXG4gICAgICAgICdhcmlhLWxpdmUnOiAncG9saXRlJyxcbiAgICAgICAgJ2FyaWEtYXRvbWljJzogZmFsc2VcbiAgICAgIH0sXG4gICAgICBob29rOiB7XG4gICAgICAgIGluc2VydCh2bm9kZSkge1xuICAgICAgICAgIGNvbnN0ICRlbCA9ICQodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5vbignY2xpY2snLCAnYS5qdW1wJywgKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnanVtcCcsIChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0QXR0cmlidXRlKCdkYXRhLXBseScpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAobW9kKSAkZWwub24oJ2NsaWNrJywgJy5tb2QnLCAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIG1vZC5vcGVuKCgoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEF0dHJpYnV0ZSgnZGF0YS11c2VybmFtZScpIGFzIHN0cmluZykuc3BsaXQoJyAnKVswXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWxzZSAkZWwub24oJ2NsaWNrJywgJy5mbGFnJywgKGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgcmVwb3J0KGN0cmwsIChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICApO1xuICAgICAgICAgIHNjcm9sbENiKHZub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdHBhdGNoOiAoXywgdm5vZGUpID0+IHNjcm9sbENiKHZub2RlKVxuICAgICAgfVxuICAgIH0sIHNlbGVjdExpbmVzKGN0cmwpLm1hcChsaW5lID0+IHJlbmRlckxpbmUoY3RybCwgbGluZSkpKSxcbiAgICByZW5kZXJJbnB1dChjdHJsKVxuICBdO1xuICBjb25zdCBwcmVzZXRzID0gcHJlc2V0VmlldyhjdHJsLnByZXNldCk7XG4gIGlmIChwcmVzZXRzKSB2bm9kZXMucHVzaChwcmVzZXRzKVxuICByZXR1cm4gdm5vZGVzO1xufVxuXG5mdW5jdGlvbiByZW5kZXJJbnB1dChjdHJsOiBDdHJsKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIWN0cmwudm0ud3JpdGVhYmxlKSByZXR1cm47XG4gIGlmICgoY3RybC5kYXRhLmxvZ2luUmVxdWlyZWQgJiYgIWN0cmwuZGF0YS51c2VySWQpIHx8IGN0cmwuZGF0YS5yZXN0cmljdGVkKVxuICAgIHJldHVybiBoKCdpbnB1dC5tY2hhdF9fc2F5Jywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcGxhY2Vob2xkZXI6IGN0cmwudHJhbnMoJ2xvZ2luVG9DaGF0JyksXG4gICAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIGxldCBwbGFjZWhvbGRlcjogc3RyaW5nO1xuICBpZiAoY3RybC52bS50aW1lb3V0KSBwbGFjZWhvbGRlciA9IGN0cmwudHJhbnMoJ3lvdUhhdmVCZWVuVGltZWRPdXQnKTtcbiAgZWxzZSBpZiAoY3RybC5vcHRzLmJsaW5kKSBwbGFjZWhvbGRlciA9ICdDaGF0JztcbiAgZWxzZSBwbGFjZWhvbGRlciA9IGN0cmwudHJhbnMubm9hcmcoY3RybC52bS5wbGFjZWhvbGRlcktleSk7XG4gIHJldHVybiBoKCdpbnB1dC5tY2hhdF9fc2F5Jywge1xuICAgIGF0dHJzOiB7XG4gICAgICBwbGFjZWhvbGRlcixcbiAgICAgIGF1dG9jb21wbGV0ZTogJ29mZicsXG4gICAgICBtYXhsZW5ndGg6IDE0MCxcbiAgICAgIGRpc2FibGVkOiBjdHJsLnZtLnRpbWVvdXQgfHwgIWN0cmwudm0ud3JpdGVhYmxlXG4gICAgfSxcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgICAgc2V0dXBIb29rcyhjdHJsLCB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmxldCBtb3VjaExpc3RlbmVyOiBFdmVudExpc3RlbmVyO1xuXG5jb25zdCBzZXR1cEhvb2tzID0gKGN0cmw6IEN0cmwsIGNoYXRFbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgY2hhdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJyxcbiAgICAoZTogS2V5Ym9hcmRFdmVudCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgICAgIHR4dCA9IGVsLnZhbHVlLFxuICAgICAgICBwdWIgPSBjdHJsLm9wdHMucHVibGljO1xuICAgICAgaWYgKGUud2hpY2ggPT0gMTAgfHwgZS53aGljaCA9PSAxMykge1xuICAgICAgICBpZiAodHh0ID09PSAnJykgJCgnLmtleWJvYXJkLW1vdmUgaW5wdXQnKS5mb2N1cygpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzcGFtLnJlcG9ydCh0eHQpO1xuICAgICAgICAgIGlmIChwdWIgJiYgc3BhbS5oYXNUZWFtVXJsKHR4dCkpIGFsZXJ0KFwiUGxlYXNlIGRvbid0IGFkdmVydGlzZSB0ZWFtcyBpbiB0aGUgY2hhdC5cIik7XG4gICAgICAgICAgZWxzZSBjdHJsLnBvc3QodHh0KTtcbiAgICAgICAgICBlbC52YWx1ZSA9ICcnO1xuICAgICAgICAgIGlmICghcHViKSBlbC5jbGFzc0xpc3QucmVtb3ZlKCd3aGlzcGVyJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyk7XG4gICAgICAgIGlmICghcHViKSBlbC5jbGFzc0xpc3QudG9nZ2xlKCd3aGlzcGVyJywgISF0eHQubWF0Y2god2hpc3BlclJlZ2V4KSk7XG4gICAgICB9XG4gICAgfSlcbiAgKTtcblxuICB3aW5kb3cuTW91c2V0cmFwLmJpbmQoJ2MnLCAoKSA9PiB7XG4gICAgY2hhdEVsLmZvY3VzKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICB3aW5kb3cuTW91c2V0cmFwKGNoYXRFbCkuYmluZCgnZXNjJywgKCkgPT4gY2hhdEVsLmJsdXIoKSk7XG5cblxuICAvLyBFbnN1cmUgY2xpY2tzIHJlbW92ZSBjaGF0IGZvY3VzLlxuICAvLyBTZWUgb3JuaWNhci9jaGVzc2dyb3VuZCMxMDlcblxuICBjb25zdCBtb3VjaEV2ZW50cyA9IFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXTtcblxuICBpZiAobW91Y2hMaXN0ZW5lcikgbW91Y2hFdmVudHMuZm9yRWFjaChldmVudCA9PlxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbW91Y2hMaXN0ZW5lciwge2NhcHR1cmU6IHRydWV9KVxuICApO1xuXG4gIG1vdWNoTGlzdGVuZXIgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgIGlmICghZS5zaGlmdEtleSAmJiBlLmJ1dHRvbnMgIT09IDIgJiYgZS5idXR0b24gIT09IDIpIGNoYXRFbC5ibHVyKCk7XG4gIH07XG5cbiAgY2hhdEVsLm9uZm9jdXMgPSAoKSA9PlxuICAgIG1vdWNoRXZlbnRzLmZvckVhY2goZXZlbnQgPT5cbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbW91Y2hMaXN0ZW5lcixcbiAgICAgICAge3Bhc3NpdmU6IHRydWUsIGNhcHR1cmU6IHRydWV9XG4gICAgICApKTtcblxuICBjaGF0RWwub25ibHVyID0gKCkgPT5cbiAgICBtb3VjaEV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG1vdWNoTGlzdGVuZXIsIHtjYXB0dXJlOiB0cnVlfSlcbiAgICApO1xufTtcblxuZnVuY3Rpb24gc2FtZUxpbmVzKGwxOiBMaW5lLCBsMjogTGluZSkge1xuICByZXR1cm4gbDEuZCAmJiBsMi5kICYmIGwxLnUgPT09IGwyLnU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdExpbmVzKGN0cmw6IEN0cmwpOiBBcnJheTxMaW5lPiB7XG4gIGxldCBwcmV2OiBMaW5lLCBsczogQXJyYXk8TGluZT4gPSBbXTtcbiAgY3RybC5kYXRhLmxpbmVzLmZvckVhY2gobGluZSA9PiB7XG4gICAgaWYgKCFsaW5lLmQgJiZcbiAgICAgICghcHJldiB8fCAhc2FtZUxpbmVzKHByZXYsIGxpbmUpKSAmJlxuICAgICAgKCFsaW5lLnIgfHwgKGxpbmUudSB8fCAnJykudG9Mb3dlckNhc2UoKSA9PSBjdHJsLmRhdGEudXNlcklkKSAmJlxuICAgICAgIXNwYW0uc2tpcChsaW5lLnQpXG4gICAgKSBscy5wdXNoKGxpbmUpO1xuICAgIHByZXYgPSBsaW5lO1xuICB9KTtcbiAgcmV0dXJuIGxzO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUZXh0KHBhcnNlTW92ZXM6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIChvbGRWbm9kZTogVk5vZGUsIHZub2RlOiBWTm9kZSkgPT4ge1xuICAgIGlmICgodm5vZGUuZGF0YSBhcyBWTm9kZURhdGEpLmxpY2hlc3NDaGF0ICE9PSAob2xkVm5vZGUuZGF0YSBhcyBWTm9kZURhdGEpLmxpY2hlc3NDaGF0KSB7XG4gICAgICAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5pbm5lckhUTUwgPSBlbmhhbmNlLmVuaGFuY2UoKHZub2RlLmRhdGEgYXMgVk5vZGVEYXRhKS5saWNoZXNzQ2hhdCwgcGFyc2VNb3Zlcyk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiByZW5kZXJUZXh0KHQ6IHN0cmluZywgcGFyc2VNb3ZlczogYm9vbGVhbikge1xuICBpZiAoZW5oYW5jZS5pc01vcmVUaGFuVGV4dCh0KSkge1xuICAgIGNvbnN0IGhvb2sgPSB1cGRhdGVUZXh0KHBhcnNlTW92ZXMpO1xuICAgIHJldHVybiBoKCd0Jywge1xuICAgICAgbGljaGVzc0NoYXQ6IHQsXG4gICAgICBob29rOiB7XG4gICAgICAgIGNyZWF0ZTogaG9vayxcbiAgICAgICAgdXBkYXRlOiBob29rXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGgoJ3QnLCB0KTtcbn1cblxuZnVuY3Rpb24gcmVwb3J0KGN0cmw6IEN0cmwsIGxpbmU6IEhUTUxFbGVtZW50KSB7XG4gIGNvbnN0IHVzZXJBID0gbGluZS5xdWVyeVNlbGVjdG9yKCdhLnVzZXItbGluaycpIGFzIEhUTUxMaW5rRWxlbWVudDtcbiAgY29uc3QgdGV4dCA9IChsaW5lLnF1ZXJ5U2VsZWN0b3IoJ3QnKSBhcyBIVE1MRWxlbWVudCkuaW5uZXJUZXh0O1xuICBpZiAodXNlckEgJiYgY29uZmlybShgUmVwb3J0IFwiJHt0ZXh0fVwiIHRvIG1vZGVyYXRvcnM/YCkpIGZsYWcoXG4gICAgY3RybC5kYXRhLnJlc291cmNlSWQsXG4gICAgdXNlckEuaHJlZi5zcGxpdCgnLycpWzRdLFxuICAgIHRleHRcbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTGluZShjdHJsOiBDdHJsLCBsaW5lOiBMaW5lKSB7XG5cbiAgY29uc3QgdGV4dE5vZGUgPSByZW5kZXJUZXh0KGxpbmUudCwgY3RybC5vcHRzLnBhcnNlTW92ZXMpO1xuXG4gIGlmIChsaW5lLnUgPT09ICdsaWNoZXNzJykgcmV0dXJuIGgoJ2xpLnN5c3RlbScsIHRleHROb2RlKTtcblxuICBpZiAobGluZS5jKSByZXR1cm4gaCgnbGknLCBbXG4gICAgaCgnc3Bhbi5jb2xvcicsICdbJyArIGxpbmUuYyArICddJyksXG4gICAgdGV4dE5vZGVcbiAgXSk7XG5cbiAgY29uc3QgdXNlck5vZGUgPSB0aHVuaygnYScsIGxpbmUudSwgdXNlckxpbmssIFtsaW5lLnUsIGxpbmUudGl0bGVdKTtcblxuICByZXR1cm4gaCgnbGknLCB7XG4gIH0sIGN0cmwubW9kZXJhdGlvbigpID8gW1xuICAgIGxpbmUudSA/IG1vZExpbmVBY3Rpb24obGluZS51KSA6IG51bGwsXG4gICAgdXNlck5vZGUsXG4gICAgdGV4dE5vZGVcbiAgXSA6IFtcbiAgICBjdHJsLmRhdGEudXNlcklkICYmIGxpbmUudSAmJiBjdHJsLmRhdGEudXNlcklkICE9IGxpbmUudSA/IGgoJ2kuZmxhZycsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAnIScsXG4gICAgICAgIHRpdGxlOiAnUmVwb3J0J1xuICAgICAgfVxuICAgIH0pIDogbnVsbCxcbiAgICB1c2VyTm9kZSxcbiAgICB0ZXh0Tm9kZVxuICBdKTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBlbmhhbmNlKHRleHQ6IHN0cmluZywgcGFyc2VNb3ZlczogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IGVzY2FwZWQgPSB3aW5kb3cubGljaGVzcy5lc2NhcGVIdG1sKHRleHQpO1xuICBjb25zdCBsaW5rZWQgPSBhdXRvTGluayhlc2NhcGVkKTtcbiAgY29uc3QgcGxpZWQgPSBwYXJzZU1vdmVzICYmIGxpbmtlZCA9PT0gZXNjYXBlZCA/IGFkZFBsaWVzKGxpbmtlZCkgOiBsaW5rZWQ7XG4gIHJldHVybiBwbGllZDtcbn1cblxuY29uc3QgbW9yZVRoYW5UZXh0UGF0dGVybiA9IC9bJjw+XCJAXS87XG5jb25zdCBwb3NzaWJsZUxpbmtQYXR0ZXJuID0gL1xcLlxcdy87XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01vcmVUaGFuVGV4dChzdHI6IHN0cmluZykge1xuICByZXR1cm4gbW9yZVRoYW5UZXh0UGF0dGVybi50ZXN0KHN0cikgfHwgcG9zc2libGVMaW5rUGF0dGVybi50ZXN0KHN0cik7XG59XG5cbmNvbnN0IGxpbmtQYXR0ZXJuID0gL1xcYihodHRwcz86XFwvXFwvfGxpY2hlc3NcXC5vcmdcXC8pWy3igJPigJRcXHcrJidAI1xcLyU/PSgpfnwhOiwuO10rW1xcdysmQCNcXC8lPX58XS9naTtcblxuZnVuY3Rpb24gbGlua1JlcGxhY2UodXJsOiBzdHJpbmcsIHNjaGVtZTogc3RyaW5nKSB7XG4gIGlmICh1cmwuaW5jbHVkZXMoJyZxdW90OycpKSByZXR1cm4gdXJsO1xuICBjb25zdCBmdWxsVXJsID0gc2NoZW1lID09PSAnbGljaGVzcy5vcmcvJyA/ICdodHRwczovLycgKyB1cmwgOiB1cmw7XG4gIGNvbnN0IG1pblVybCA9IHVybC5yZXBsYWNlKC9eaHR0cHM6XFwvXFwvLywgJycpO1xuICByZXR1cm4gJzxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vZm9sbG93XCIgaHJlZj1cIicgKyBmdWxsVXJsICsgJ1wiPicgKyBtaW5VcmwgKyAnPC9hPic7XG59XG5cbmNvbnN0IHVzZXJQYXR0ZXJuID0gLyhefFteXFx3QCMvXSlAKFtcXHctXXsyLH0pL2c7XG5jb25zdCBwYXduRHJvcFBhdHRlcm4gPSAvXlthLWhdWzItN10kLztcblxuZnVuY3Rpb24gdXNlckxpbmtSZXBsYWNlKG9yaWc6IHN0cmluZywgcHJlZml4OiBTdHJpbmcsIHVzZXI6IHN0cmluZykge1xuICBpZiAodXNlci5sZW5ndGggPiAyMCB8fCB1c2VyLm1hdGNoKHBhd25Ecm9wUGF0dGVybikpIHJldHVybiBvcmlnO1xuICByZXR1cm4gcHJlZml4ICsgJzxhIGhyZWY9XCIvQC8nICsgdXNlciArICdcIj5AJyArIHVzZXIgKyBcIjwvYT5cIjtcbn1cblxuZnVuY3Rpb24gYXV0b0xpbmsoaHRtbDogc3RyaW5nKSB7XG4gIHJldHVybiBodG1sLnJlcGxhY2UodXNlclBhdHRlcm4sIHVzZXJMaW5rUmVwbGFjZSkucmVwbGFjZShsaW5rUGF0dGVybiwgbGlua1JlcGxhY2UpO1xufVxuXG5jb25zdCBtb3ZlUGF0dGVybiA9IC9cXGIoXFxkKylcXHMqKFxcLispXFxzKig/OltvMC1dK1tvMF18W05CUlFLUF0/W2EtaF0/WzEtOF0/W3hAXT9bYS16XVsxLThdKD86PVtOQlJRS10pPylcXCs/XFwjP1shXFw/PV17MCw1fS9naTtcbmZ1bmN0aW9uIG1vdmVSZXBsYWNlcihtYXRjaDogc3RyaW5nLCB0dXJuOiBudW1iZXIsIGRvdHM6IHN0cmluZykge1xuICBpZiAodHVybiA8IDEgfHwgdHVybiA+IDIwMCkgcmV0dXJuIG1hdGNoO1xuICBjb25zdCBwbHkgPSB0dXJuICogMiAtIChkb3RzLmxlbmd0aCA+IDEgPyAwIDogMSk7XG4gIHJldHVybiAnPGEgY2xhc3M9XCJqdW1wXCIgZGF0YS1wbHk9XCInICsgcGx5ICsgJ1wiPicgKyBtYXRjaCArICc8L2E+Jztcbn1cblxuZnVuY3Rpb24gYWRkUGxpZXMoaHRtbDogc3RyaW5nKSB7XG4gIHJldHVybiBodG1sLnJlcGxhY2UobW92ZVBhdHRlcm4sIG1vdmVSZXBsYWNlcik7XG59XG4iLCJpbXBvcnQgeyBpbml0IH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuaW1wb3J0IG1ha2VDdHJsIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgdmlldyBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHsgQ2hhdE9wdHMsIEN0cmwgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgeyBQcmVzZXRDdHJsIH0gZnJvbSAnLi9wcmVzZXQnXG5cbmltcG9ydCBrbGFzcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJztcbmltcG9ydCBhdHRyaWJ1dGVzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcyc7XG5cbmV4cG9ydCB7IEN0cmwgYXMgQ2hhdEN0cmwsIENoYXRQbHVnaW4gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMaWNoZXNzQ2hhdChlbGVtZW50OiBFbGVtZW50LCBvcHRzOiBDaGF0T3B0cyk6IHtcbiAgcHJlc2V0OiBQcmVzZXRDdHJsXG59IHtcbiAgY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlc10pO1xuXG4gIGxldCB2bm9kZTogVk5vZGUsIGN0cmw6IEN0cmxcblxuICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgdm5vZGUgPSBwYXRjaCh2bm9kZSwgdmlldyhjdHJsKSk7XG4gIH1cblxuICBjdHJsID0gbWFrZUN0cmwob3B0cywgcmVkcmF3KTtcblxuICBjb25zdCBibHVlcHJpbnQgPSB2aWV3KGN0cmwpO1xuICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICB2bm9kZSA9IHBhdGNoKGVsZW1lbnQsIGJsdWVwcmludCk7XG5cbiAgcmV0dXJuIGN0cmw7XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IE1vZGVyYXRpb25DdHJsLCBNb2RlcmF0aW9uT3B0cywgTW9kZXJhdGlvbkRhdGEsIE1vZGVyYXRpb25SZWFzb24gfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgeyB1c2VyTW9kSW5mbyB9IGZyb20gJy4veGhyJ1xuaW1wb3J0IHsgdXNlckxpbmssIHNwaW5uZXIsIGJpbmQgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gbW9kZXJhdGlvbkN0cmwob3B0czogTW9kZXJhdGlvbk9wdHMpOiBNb2RlcmF0aW9uQ3RybCB7XG5cbiAgbGV0IGRhdGE6IE1vZGVyYXRpb25EYXRhIHwgdW5kZWZpbmVkO1xuICBsZXQgbG9hZGluZyA9IGZhbHNlO1xuXG4gIGNvbnN0IG9wZW4gPSAodXNlcm5hbWU6IHN0cmluZykgPT4ge1xuICAgIGlmIChvcHRzLnBlcm1pc3Npb25zLnRpbWVvdXQpIHtcbiAgICAgIGxvYWRpbmcgPSB0cnVlO1xuICAgICAgdXNlck1vZEluZm8odXNlcm5hbWUpLnRoZW4oZCA9PiB7XG4gICAgICAgIGRhdGEgPSBkO1xuICAgICAgICBsb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIG9wdHMucmVkcmF3KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgaWQ6IHVzZXJuYW1lLFxuICAgICAgICB1c2VybmFtZVxuICAgICAgfTtcbiAgICB9XG4gICAgb3B0cy5yZWRyYXcoKTtcbiAgfTtcblxuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBkYXRhID0gdW5kZWZpbmVkO1xuICAgIGxvYWRpbmcgPSBmYWxzZTtcbiAgICBvcHRzLnJlZHJhdygpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbG9hZGluZzogKCkgPT4gbG9hZGluZyxcbiAgICBkYXRhOiAoKSA9PiBkYXRhLFxuICAgIHJlYXNvbnM6IG9wdHMucmVhc29ucyxcbiAgICBwZXJtaXNzaW9uczogKCkgPT4gb3B0cy5wZXJtaXNzaW9ucyxcbiAgICBvcGVuLFxuICAgIGNsb3NlLFxuICAgIHRpbWVvdXQocmVhc29uOiBNb2RlcmF0aW9uUmVhc29uKSB7XG4gICAgICBkYXRhICYmIHdpbmRvdy5saWNoZXNzLnB1YnN1Yi5lbWl0KCdzb2NrZXQuc2VuZCcsICd0aW1lb3V0Jywge1xuICAgICAgICB1c2VySWQ6IGRhdGEuaWQsXG4gICAgICAgIHJlYXNvbjogcmVhc29uLmtleVxuICAgICAgfSk7XG4gICAgICBjbG9zZSgpO1xuICAgICAgb3B0cy5yZWRyYXcoKTtcbiAgICB9LFxuICAgIHNoYWRvd2JhbigpIHtcbiAgICAgIGxvYWRpbmcgPSB0cnVlO1xuICAgICAgZGF0YSAmJiAkLnBvc3QoJy9tb2QvJyArIGRhdGEuaWQgKyAnL3Ryb2xsL3RydWUnKS50aGVuKCgpID0+IGRhdGEgJiYgb3BlbihkYXRhLnVzZXJuYW1lKSk7XG4gICAgICBvcHRzLnJlZHJhdygpO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVBY3Rpb24odXNlcm5hbWU6IHN0cmluZykge1xuICByZXR1cm4gaCgnaS5tb2QnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgICdkYXRhLWljb24nOiAn7oCCJyxcbiAgICAgICdkYXRhLXVzZXJuYW1lJzogdXNlcm5hbWUsXG4gICAgICB0aXRsZTogJ01vZGVyYXRpb24nXG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZGVyYXRpb25WaWV3KGN0cmw/OiBNb2RlcmF0aW9uQ3RybCk6IFZOb2RlW10gfCB1bmRlZmluZWQge1xuICBpZiAoIWN0cmwpIHJldHVybjtcbiAgaWYgKGN0cmwubG9hZGluZygpKSByZXR1cm4gW2goJ2Rpdi5sb2FkaW5nJywgc3Bpbm5lcigpKV07XG4gIGNvbnN0IGRhdGEgPSBjdHJsLmRhdGEoKTtcbiAgaWYgKCFkYXRhKSByZXR1cm47XG4gIGNvbnN0IHBlcm1zID0gY3RybC5wZXJtaXNzaW9ucygpO1xuXG4gIGNvbnN0IGluZm9zID0gZGF0YS5oaXN0b3J5ID8gaCgnZGl2LmluZm9zLmJsb2NrJywgW1xuICAgIHdpbmRvdy5saWNoZXNzLm51bWJlckZvcm1hdChkYXRhLmdhbWVzIHx8IDApICsgJyBnYW1lcycsXG4gICAgZGF0YS50cm9sbCA/ICdUUk9MTCcgOiB1bmRlZmluZWQsXG4gICAgZGF0YS5lbmdpbmUgPyAnRU5HSU5FJyA6IHVuZGVmaW5lZCxcbiAgICBkYXRhLmJvb3N0ZXIgPyAnQk9PU1RFUicgOiB1bmRlZmluZWRcbiAgXS5tYXAodCA9PiB0ICYmIGgoJ3NwYW4nLCB0KSkuY29uY2F0KFtcbiAgICBoKCdhJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgaHJlZjogJy9ALycgKyBkYXRhLnVzZXJuYW1lICsgJz9tb2QnXG4gICAgICB9XG4gICAgfSwgJ3Byb2ZpbGUnKVxuICBdKS5jb25jYXQoXG4gICAgcGVybXMuc2hhZG93YmFuID8gW1xuICAgICAgaCgnYScsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBocmVmOiAnL21vZC8nICsgZGF0YS51c2VybmFtZSArICcvY29tbXVuaWNhdGlvbidcbiAgICAgICAgfVxuICAgICAgfSwgJ2NvbXMnKVxuICAgIF0gOiBbXSkpIDogdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgdGltZW91dCA9IHBlcm1zLnRpbWVvdXQgPyBoKCdkaXYudGltZW91dC5ibG9jaycsIFtcbiAgICAgIGgoJ3N0cm9uZycsICdUaW1lb3V0IDEwIG1pbnV0ZXMgZm9yJyksXG4gICAgICAuLi5jdHJsLnJlYXNvbnMubWFwKHIgPT4ge1xuICAgICAgICByZXR1cm4gaCgnYS50ZXh0Jywge1xuICAgICAgICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiAncCcgfSxcbiAgICAgICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwudGltZW91dChyKSlcbiAgICAgICAgfSwgci5uYW1lKTtcbiAgICAgIH0pLFxuICAgICAgLi4uKFxuICAgICAgICAoZGF0YS50cm9sbCB8fCAhcGVybXMuc2hhZG93YmFuKSA/IFtdIDogW2goJ2Rpdi5zaGFkb3diYW4nLCBbXG4gICAgICAgICAgJ09yICcsXG4gICAgICAgICAgaCgnYnV0dG9uLmJ1dHRvbi5idXR0b24tcmVkLmJ1dHRvbi1lbXB0eScsIHtcbiAgICAgICAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgY3RybC5zaGFkb3diYW4pXG4gICAgICAgICAgfSwgJ3NoYWRvd2JhbicpXG4gICAgICAgIF0pXSlcbiAgICBdKSA6IGgoJ2Rpdi50aW1lb3V0LmJsb2NrJywgW1xuICAgICAgaCgnc3Ryb25nJywgJ01vZGVyYXRpb24nKSxcbiAgICAgIGgoJ2EudGV4dCcsIHtcbiAgICAgICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6ICdwJyB9LFxuICAgICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwudGltZW91dChjdHJsLnJlYXNvbnNbMF0pKVxuICAgICAgfSwgJ1RpbWVvdXQgMTAgbWludXRlcycpXG4gICAgXSk7XG5cbiAgICBjb25zdCBoaXN0b3J5ID0gZGF0YS5oaXN0b3J5ID8gaCgnZGl2Lmhpc3RvcnkuYmxvY2snLCBbXG4gICAgICBoKCdzdHJvbmcnLCAnVGltZW91dCBoaXN0b3J5JyksXG4gICAgICBoKCd0YWJsZScsIGgoJ3Rib2R5LnNsaXN0Jywge1xuICAgICAgICBob29rOiB7XG4gICAgICAgICAgaW5zZXJ0OiAoKSA9PiB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnY29udGVudF9sb2FkZWQnKVxuICAgICAgICB9XG4gICAgICB9LCBkYXRhLmhpc3RvcnkubWFwKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIGgoJ3RyJywgW1xuICAgICAgICAgIGgoJ3RkLnJlYXNvbicsIGUucmVhc29uKSxcbiAgICAgICAgICBoKCd0ZC5tb2QnLCBlLm1vZCksXG4gICAgICAgICAgaCgndGQnLCBoKCd0aW1lLnRpbWVhZ28nLCB7XG4gICAgICAgICAgICBhdHRyczogeyBkYXRldGltZTogZS5kYXRlIH1cbiAgICAgICAgICB9KSlcbiAgICAgICAgXSk7XG4gICAgICB9KSkpXG4gICAgXSkgOiB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gW1xuICAgICAgaCgnZGl2LnRvcCcsIHsga2V5OiAnbW9kLScgKyBkYXRhLmlkIH0sIFtcbiAgICAgICAgaCgnc3Bhbi50ZXh0Jywge1xuICAgICAgICAgIGF0dHJzOiB7J2RhdGEtaWNvbic6ICfugIInIH0sXG4gICAgICAgIH0sIFt1c2VyTGluayhkYXRhLnVzZXJuYW1lKV0pLFxuICAgICAgICBoKCdhJywge1xuICAgICAgICAgIGF0dHJzOiB7J2RhdGEtaWNvbic6ICdMJ30sXG4gICAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCBjdHJsLmNsb3NlKVxuICAgICAgICB9KVxuICAgICAgXSksXG4gICAgICBoKCdkaXYubWNoYXRfX2NvbnRlbnQubW9kZXJhdGlvbicsIFtcbiAgICAgICAgaW5mb3MsXG4gICAgICAgIHRpbWVvdXQsXG4gICAgICAgIGhpc3RvcnlcbiAgICAgIF0pXG4gICAgXTtcbn07XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgTm90ZUN0cmwsIE5vdGVPcHRzIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0ICogYXMgeGhyIGZyb20gJy4veGhyJ1xuaW1wb3J0IHsgc3Bpbm5lciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIG5vdGVDdHJsKG9wdHM6IE5vdGVPcHRzKTogTm90ZUN0cmwge1xuICBsZXQgdGV4dDogc3RyaW5nXG4gIGNvbnN0IGRvUG9zdCA9IHdpbmRvdy5saWNoZXNzLmRlYm91bmNlKCgpID0+IHtcbiAgICB4aHIuc2V0Tm90ZShvcHRzLmlkLCB0ZXh0KTtcbiAgfSwgMTAwMCk7XG4gIHJldHVybiB7XG4gICAgaWQ6IG9wdHMuaWQsXG4gICAgdHJhbnM6IG9wdHMudHJhbnMsXG4gICAgdGV4dDogKCkgPT4gdGV4dCxcbiAgICBmZXRjaCgpIHtcbiAgICAgIHhoci5nZXROb3RlKG9wdHMuaWQpLnRoZW4odCA9PiB7XG4gICAgICAgIHRleHQgPSB0IHx8ICcnO1xuICAgICAgICBvcHRzLnJlZHJhdygpXG4gICAgICB9KVxuICAgIH0sXG4gICAgcG9zdCh0KSB7XG4gICAgICB0ZXh0ID0gdDtcbiAgICAgIGRvUG9zdCgpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RlVmlldyhjdHJsOiBOb3RlQ3RybCk6IFZOb2RlIHtcbiAgY29uc3QgdGV4dCA9IGN0cmwudGV4dCgpO1xuICBpZiAodGV4dCA9PSB1bmRlZmluZWQpIHJldHVybiBoKCdkaXYubG9hZGluZycsIHtcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQ6IGN0cmwuZmV0Y2hcbiAgICB9LFxuICB9LCBbc3Bpbm5lcigpXSlcbiAgcmV0dXJuIGgoJ3RleHRhcmVhJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBwbGFjZWhvbGRlcjogY3RybC50cmFucygndHlwZVByaXZhdGVOb3Rlc0hlcmUnKVxuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgIGNvbnN0ICRlbCA9ICQodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgJGVsLnZhbCh0ZXh0KS5vbignY2hhbmdlIGtleXVwIHBhc3RlJywgKCkgPT4ge1xuICAgICAgICAgIGN0cmwucG9zdCgkZWwudmFsKCkpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IGJpbmQgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBSZWRyYXcgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlc2V0Q3RybCB7XG4gIGdyb3VwKCk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBzYWlkKCk6IHN0cmluZ1tdXG4gIHNldEdyb3VwKGdyb3VwOiBzdHJpbmcgfCB1bmRlZmluZWQpOiB2b2lkXG4gIHBvc3QocHJlc2V0OiBQcmVzZXQpOiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIFByZXNldEtleSA9IHN0cmluZ1xuZXhwb3J0IHR5cGUgUHJlc2V0VGV4dCA9IHN0cmluZ1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZXNldCB7XG4gIGtleTogUHJlc2V0S2V5XG4gIHRleHQ6IFByZXNldFRleHRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVzZXRHcm91cHMge1xuICBzdGFydDogUHJlc2V0W11cbiAgZW5kOiBQcmVzZXRbXVxuICBba2V5OiBzdHJpbmddOiBQcmVzZXRbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByZXNldE9wdHMge1xuICBpbml0aWFsR3JvdXA/OiBzdHJpbmdcbiAgcmVkcmF3OiBSZWRyYXdcbiAgcG9zdCh0ZXh0OiBzdHJpbmcpOiB2b2lkXG59XG5cbmNvbnN0IGdyb3VwczogUHJlc2V0R3JvdXBzID0ge1xuICBzdGFydDogW1xuICAgICdoaS9IZWxsbycsICdnbC9Hb29kIGx1Y2snLCAnaGYvSGF2ZSBmdW4hJywgJ3UyL1lvdSB0b28hJ1xuICBdLm1hcChzcGxpdEl0KSxcbiAgZW5kOiBbXG4gICAgJ2dnL0dvb2QgZ2FtZScsICd3cC9XZWxsIHBsYXllZCcsICd0eS9UaGFuayB5b3UnLCAnZ3RnL0lcXCd2ZSBnb3QgdG8gZ28nLCAnYnllL0J5ZSEnXG4gIF0ubWFwKHNwbGl0SXQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVzZXRDdHJsKG9wdHM6IFByZXNldE9wdHMpOiBQcmVzZXRDdHJsIHtcblxuICBsZXQgZ3JvdXA6IHN0cmluZyB8IHVuZGVmaW5lZCA9IG9wdHMuaW5pdGlhbEdyb3VwO1xuXG4gIGxldCBzYWlkOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHJldHVybiB7XG4gICAgZ3JvdXA6ICgpID0+IGdyb3VwLFxuICAgIHNhaWQ6ICgpID0+IHNhaWQsXG4gICAgc2V0R3JvdXAocDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgICBpZiAocCAhPT0gZ3JvdXApIHtcbiAgICAgICAgZ3JvdXAgPSBwO1xuICAgICAgICBpZiAoIXApIHNhaWQgPSBbXTtcbiAgICAgICAgb3B0cy5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHBvc3QocHJlc2V0KSB7XG4gICAgICBpZiAoIWdyb3VwKSByZXR1cm47XG4gICAgICBjb25zdCBzZXRzID0gZ3JvdXBzW2dyb3VwXTtcbiAgICAgIGlmICghc2V0cykgcmV0dXJuO1xuICAgICAgaWYgKHNhaWQuaW5jbHVkZXMocHJlc2V0LmtleSkpIHJldHVybjtcbiAgICAgIG9wdHMucG9zdChwcmVzZXQudGV4dCk7XG4gICAgICBzYWlkLnB1c2gocHJlc2V0LmtleSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVzZXRWaWV3KGN0cmw6IFByZXNldEN0cmwpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGdyb3VwID0gY3RybC5ncm91cCgpO1xuICBpZiAoIWdyb3VwKSByZXR1cm47XG4gIGNvbnN0IHNldHMgPSBncm91cHNbZ3JvdXBdO1xuICBjb25zdCBzYWlkID0gY3RybC5zYWlkKCk7XG4gIHJldHVybiAoc2V0cyAmJiBzYWlkLmxlbmd0aCA8IDIpID8gaCgnZGl2Lm1jaGF0X19wcmVzZXRzJywgc2V0cy5tYXAoKHA6IFByZXNldCkgPT4ge1xuICAgIGNvbnN0IGRpc2FibGVkID0gc2FpZC5pbmNsdWRlcyhwLmtleSk7XG4gICAgcmV0dXJuIGgoJ3NwYW4nLCB7XG4gICAgICBjbGFzczoge1xuICAgICAgICBkaXNhYmxlZFxuICAgICAgfSxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIHRpdGxlOiBwLnRleHQsXG4gICAgICAgIGRpc2FibGVkXG4gICAgICB9LFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiB7ICFkaXNhYmxlZCAmJiBjdHJsLnBvc3QocCkgfSlcbiAgICB9LCBwLmtleSk7XG4gIH0pKSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gc3BsaXRJdChzOiBzdHJpbmcpOiBQcmVzZXQge1xuICBjb25zdCBwYXJ0cyA9IHMuc3BsaXQoJy8nKTtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IHBhcnRzWzBdLFxuICAgIHRleHQ6IHBhcnRzWzFdXG4gIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBza2lwKHR4dDogc3RyaW5nKSB7XG4gIHJldHVybiBhbmFseXNlKHR4dCkgJiYgd2luZG93LmxpY2hlc3Muc3RvcmFnZS5nZXQoJ2NoYXQtc3BhbScpICE9ICcxJztcbn1cbmV4cG9ydCBmdW5jdGlvbiBoYXNUZWFtVXJsKHR4dDogc3RyaW5nKSB7XG4gIHJldHVybiAhIXR4dC5tYXRjaCh0ZWFtVXJsUmVnZXgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydCh0eHQ6IHN0cmluZykge1xuICBpZiAoYW5hbHlzZSh0eHQpKSB7XG4gICAgJC5wb3N0KCcvanNsb2cvJyArIHdpbmRvdy5sb2NhdGlvbi5ocmVmLnN1YnN0cigtMTIpICsgJz9uPXNwYW0nKTtcbiAgICB3aW5kb3cubGljaGVzcy5zdG9yYWdlLnNldCgnY2hhdC1zcGFtJywgJzEnKTtcbiAgfVxufVxuXG5jb25zdCBzcGFtUmVnZXggPSBuZXcgUmVnRXhwKFtcbiAgJ3hjYW13ZWIuY29tJyxcbiAgJyhefFteaV0pY2hlc3MtYm90JyxcbiAgJ2NoZXNzLWNoZWF0JyxcbiAgJ2Nvb2x0ZWVuYml0Y2gnLFxuICAnbGV0Y2FmYS53ZWJjYW0nLFxuICAndGlueXVybC5jb20vJyxcbiAgJ3dvb2dhLmluZm8vJyxcbiAgJ2JpdC5seS8nLFxuICAnd2J0LmxpbmsvJyxcbiAgJ2ViLmJ5LycsXG4gICcwMDEucnMvJyxcbiAgJ3Noci5uYW1lLycsXG4gICd1LnRvLycsXG4gICcuMy1hLm5ldCcsXG4gICcuc3NsNDQzLm9yZycsXG4gICcubnMwMi51cycsXG4gICcubXlmdHAuaW5mbycsXG4gICcuZmxpbmt1cC5jb20nLFxuICAnLnNlcnZldXNlcnMuY29tJyxcbiAgJ2JhZG9vZ2lybHMuY29tJyxcbiAgJ2hpZGUuc3UnLFxuICAnd3lvbi5kZScsXG4gICdzZXhkYXRpbmdjei5jbHViJ1xuXS5tYXAodXJsID0+IHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC4vZywgJ1xcXFwuJykucmVwbGFjZSgvXFwvL2csICdcXFxcLycpO1xufSkuam9pbignfCcpKTtcblxuZnVuY3Rpb24gYW5hbHlzZSh0eHQ6IHN0cmluZykge1xuICByZXR1cm4gISF0eHQubWF0Y2goc3BhbVJlZ2V4KTtcbn1cblxuY29uc3QgdGVhbVVybFJlZ2V4ID0gL2xpY2hlc3NcXC5vcmdcXC90ZWFtXFwvL1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJMaW5rKHU6IHN0cmluZywgdGl0bGU/OiBzdHJpbmcpIHtcbiAgY29uc3QgdHJ1bmMgPSB1LnN1YnN0cmluZygwLCAxNCk7XG4gIHJldHVybiBoKCdhJywge1xuICAgIC8vIGNhbid0IGJlIGlubGluZWQgYmVjYXVzZSBvZiB0aHVua3NcbiAgICBjbGFzczoge1xuICAgICAgJ3VzZXItbGluayc6IHRydWUsXG4gICAgICB1bHB0OiB0cnVlXG4gICAgfSxcbiAgICBhdHRyczoge1xuICAgICAgaHJlZjogJy9ALycgKyB1XG4gICAgfVxuICB9LCB0aXRsZSA/IFtcbiAgICBoKFxuICAgICAgJ3NwYW4udGl0bGUnLFxuICAgICAgdGl0bGUgPT0gJ0JPVCcgPyB7IGF0dHJzOiB7J2RhdGEtYm90JzogdHJ1ZSB9IH0gOiB7fSxcbiAgICAgIHRpdGxlKSwgdHJ1bmNcbiAgXSA6IFt0cnVuY10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3Bpbm5lcigpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zcGlubmVyJywgW1xuICAgIGgoJ3N2ZycsIHsgYXR0cnM6IHsgdmlld0JveDogJzAgMCA0MCA0MCcgfSB9LCBbXG4gICAgICBoKCdjaXJjbGUnLCB7XG4gICAgICAgIGF0dHJzOiB7IGN4OiAyMCwgY3k6IDIwLCByOiAxOCwgZmlsbDogJ25vbmUnIH1cbiAgICAgIH0pXSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmQoZXZlbnROYW1lOiBzdHJpbmcsIGY6IChlOiBFdmVudCkgPT4gdm9pZCkge1xuICByZXR1cm4ge1xuICAgIGluc2VydDogKHZub2RlOiBWTm9kZSkgPT4ge1xuICAgICAgKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGYpO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBDdHJsLCBUYWIgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgZGlzY3Vzc2lvblZpZXcgZnJvbSAnLi9kaXNjdXNzaW9uJ1xuaW1wb3J0IHsgbm90ZVZpZXcgfSBmcm9tICcuL25vdGUnXG5pbXBvcnQgeyBtb2RlcmF0aW9uVmlldyB9IGZyb20gJy4vbW9kZXJhdGlvbidcbmltcG9ydCB7IGJpbmQgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IEN0cmwpOiBWTm9kZSB7XG5cbiAgY29uc3QgbW9kID0gY3RybC5tb2RlcmF0aW9uKCk7XG5cbiAgcmV0dXJuIGgoJ3NlY3Rpb24ubWNoYXQnICsgKGN0cmwub3B0cy5hbHdheXNFbmFibGVkID8gJycgOiAnLm1jaGF0LW9wdGlvbmFsJyksIHtcbiAgICBjbGFzczoge1xuICAgICAgJ21jaGF0LW1vZCc6ICEhbW9kXG4gICAgfSxcbiAgICBob29rOiB7XG4gICAgICBkZXN0cm95OiBjdHJsLmRlc3Ryb3lcbiAgICB9XG4gIH0sIG1vZGVyYXRpb25WaWV3KG1vZCkgfHwgbm9ybWFsVmlldyhjdHJsKSlcbn1cblxuZnVuY3Rpb24gcmVuZGVyUGFsYW50aXIoY3RybDogQ3RybCkge1xuICBjb25zdCBwID0gY3RybC5wYWxhbnRpcjtcbiAgaWYgKCFwLmVuYWJsZWQoKSkgcmV0dXJuO1xuICByZXR1cm4gcC5pbnN0YW5jZSA/IHAuaW5zdGFuY2UucmVuZGVyKGgpIDogaCgnZGl2Lm1jaGF0X190YWIucGFsYW50aXIucGFsYW50aXItc2xvdCcse1xuICAgIGF0dHJzOiB7XG4gICAgICAnZGF0YS1pY29uJzogJ+6AoCcsXG4gICAgICB0aXRsZTogJ1ZvaWNlIGNoYXQnXG4gICAgfSxcbiAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IHtcbiAgICAgIGlmICghcC5sb2FkZWQpIHtcbiAgICAgICAgcC5sb2FkZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBsaSA9IHdpbmRvdy5saWNoZXNzO1xuICAgICAgICBsaS5sb2FkU2NyaXB0KCdqYXZhc2NyaXB0cy92ZW5kb3IvcGVlcmpzLm1pbi5qcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGxpLmxvYWRTY3JpcHQobGkuY29tcGlsZWRTY3JpcHQoJ3BhbGFudGlyJykpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcC5pbnN0YW5jZSA9IHdpbmRvdy5QYWxhbnRpciEucGFsYW50aXIoe1xuICAgICAgICAgICAgICB1aWQ6IGN0cmwuZGF0YS51c2VySWQsXG4gICAgICAgICAgICAgIHJlZHJhdzogY3RybC5yZWRyYXdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSlcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbFZpZXcoY3RybDogQ3RybCkge1xuICBjb25zdCBhY3RpdmUgPSBjdHJsLnZtLnRhYjtcbiAgcmV0dXJuIFtcbiAgICBoKCdkaXYubWNoYXRfX3RhYnMubmJfJyArIGN0cmwuYWxsVGFicy5sZW5ndGgsIFtcbiAgICAgIC4uLmN0cmwuYWxsVGFicy5tYXAodCA9PiByZW5kZXJUYWIoY3RybCwgdCwgYWN0aXZlKSksXG4gICAgICByZW5kZXJQYWxhbnRpcihjdHJsKVxuICAgIF0pLFxuICAgIGgoJ2Rpdi5tY2hhdF9fY29udGVudC4nICsgYWN0aXZlLFxuICAgICAgKGFjdGl2ZSA9PT0gJ25vdGUnICYmIGN0cmwubm90ZSkgPyBbbm90ZVZpZXcoY3RybC5ub3RlKV0gOiAoXG4gICAgICAgIGN0cmwucGx1Z2luICYmIGFjdGl2ZSA9PT0gY3RybC5wbHVnaW4udGFiLmtleSA/IFtjdHJsLnBsdWdpbi52aWV3KCldIDogZGlzY3Vzc2lvblZpZXcoY3RybClcbiAgICAgICkpXG4gIF1cbn1cblxuZnVuY3Rpb24gcmVuZGVyVGFiKGN0cmw6IEN0cmwsIHRhYjogVGFiLCBhY3RpdmU6IFRhYikge1xuICByZXR1cm4gaCgnZGl2Lm1jaGF0X190YWIuJyArIHRhYiwge1xuICAgIGNsYXNzOiB7ICdtY2hhdF9fdGFiLWFjdGl2ZSc6IHRhYiA9PT0gYWN0aXZlIH0sXG4gICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnNldFRhYih0YWIpKVxuICB9LCB0YWJOYW1lKGN0cmwsIHRhYikpO1xufVxuXG5mdW5jdGlvbiB0YWJOYW1lKGN0cmw6IEN0cmwsIHRhYjogVGFiKSB7XG4gIGlmICh0YWIgPT09ICdkaXNjdXNzaW9uJykgcmV0dXJuIFtcbiAgICBoKCdzcGFuJywgY3RybC5kYXRhLm5hbWUpLFxuICAgIGN0cmwub3B0cy5hbHdheXNFbmFibGVkID8gdW5kZWZpbmVkIDogaCgnaW5wdXQnLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogY3RybC50cmFucy5ub2FyZygndG9nZ2xlVGhlQ2hhdCcpLFxuICAgICAgICBjaGVja2VkOiBjdHJsLnZtLmVuYWJsZWRcbiAgICAgIH0sXG4gICAgICBob29rOiBiaW5kKCdjaGFuZ2UnLCAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgY3RybC5zZXRFbmFibGVkKChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkKTtcbiAgICAgIH0pXG4gICAgfSlcbiAgXTtcbiAgaWYgKHRhYiA9PT0gJ25vdGUnKSByZXR1cm4gW2goJ3NwYW4nLCBjdHJsLnRyYW5zLm5vYXJnKCdub3RlcycpKV07XG4gIGlmIChjdHJsLnBsdWdpbiAmJiB0YWIgPT09IGN0cmwucGx1Z2luLnRhYi5rZXkpIHJldHVybiBbaCgnc3BhbicsIGN0cmwucGx1Z2luLnRhYi5uYW1lKV07XG4gIHJldHVybiBbXTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiB1c2VyTW9kSW5mbyh1c2VybmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiAkLmdldCgnL21vZC9jaGF0LXVzZXIvJyArIHVzZXJuYW1lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhZyhyZXNvdXJjZTogc3RyaW5nLCB1c2VybmFtZTogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuICQucG9zdCgnL3JlcG9ydC9mbGFnJywgeyB1c2VybmFtZSwgcmVzb3VyY2UsIHRleHQgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlKGlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuICQuZ2V0KG5vdGVVcmwoaWQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE5vdGUoaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiAkLnBvc3Qobm90ZVVybChpZCksIHsgdGV4dCB9KVxufVxuXG5mdW5jdGlvbiBub3RlVXJsKGlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGAvJHtpZH0vbm90ZWA7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZGVmaW5lZDxBPih2OiBBIHwgdW5kZWZpbmVkKTogdiBpcyBBIHtcbiAgcmV0dXJuIHR5cGVvZiB2ICE9PSAndW5kZWZpbmVkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtcHR5KGE6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWEgfHwgYS5sZW5ndGggPT09IDA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcDxUPiB7XG4gICgpOiBUXG4gICh2OiBUKTogVFxufVxuXG4vLyBsaWtlIG1pdGhyaWwgcHJvcCBidXQgd2l0aCB0eXBlIHNhZmV0eVxuZXhwb3J0IGZ1bmN0aW9uIHByb3A8QT4oaW5pdGlhbFZhbHVlOiBBKTogUHJvcDxBPiB7XG4gIGxldCB2YWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgY29uc3QgZnVuID0gZnVuY3Rpb24odjogQSB8IHVuZGVmaW5lZCkge1xuICAgIGlmIChkZWZpbmVkKHYpKSB2YWx1ZSA9IHY7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuICByZXR1cm4gZnVuIGFzIFByb3A8QT47XG59XG4iXX0=
