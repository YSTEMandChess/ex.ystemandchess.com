(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessChallenge = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
const xhr = require("./xhr");
const notification_1 = require("common/notification");
const li = window.lichess;
function default_1(opts, data, redraw) {
    let trans = (key) => key;
    let redirecting = false;
    function update(d) {
        data = d;
        if (d.i18n)
            trans = li.trans(d.i18n).noarg;
        opts.setCount(countActiveIn());
        notifyNew();
    }
    function countActiveIn() {
        return data.in.filter(c => !c.declined).length;
    }
    function notifyNew() {
        data.in.forEach(c => {
            if (li.once('c-' + c.id)) {
                if (!li.quietMode && data.in.length <= 3) {
                    opts.show();
                    li.sound.newChallenge();
                }
                const pushSubsribed = parseInt(li.storage.get('push-subscribed') || '0', 10) + 86400000 >= Date.now(); // 24h
                !pushSubsribed && c.challenger && notification_1.default(showUser(c.challenger) + ' challenges you!');
                opts.pulse();
            }
        });
    }
    function showUser(user) {
        var rating = user.rating + (user.provisional ? '?' : '');
        var fullName = (user.title ? user.title + ' ' : '') + user.name;
        return fullName + ' (' + rating + ')';
    }
    update(data);
    return {
        data: () => data,
        trans: () => trans,
        update,
        decline(id) {
            data.in.forEach(c => {
                if (c.id === id) {
                    c.declined = true;
                    xhr.decline(id);
                }
            });
        },
        cancel(id) {
            data.out.forEach(c => {
                if (c.id === id) {
                    c.declined = true;
                    xhr.cancel(id);
                }
            });
        },
        redirecting: () => redirecting,
        onRedirect() {
            redirecting = true;
            li.raf(redraw);
        }
    };
}
exports.default = default_1;
;

},{"./xhr":12,"common/notification":13}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const ctrl_1 = require("./ctrl");
const view_1 = require("./view");
const xhr_1 = require("./xhr");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
function LichessChallenge(element, opts) {
    let vnode, ctrl;
    function redraw() {
        vnode = patch(vnode || element, ctrl ? view_1.loaded(ctrl) : view_1.loading());
    }
    function update(d) {
        if (ctrl)
            ctrl.update(d);
        else {
            ctrl = ctrl_1.default(opts, d, redraw);
            element.innerHTML = '';
        }
        redraw();
    }
    if (opts.data)
        update(opts.data);
    else
        xhr_1.load().then(update);
    return {
        update
    };
}
exports.default = LichessChallenge;
;

},{"./ctrl":9,"./view":11,"./xhr":12,"snabbdom":6,"snabbdom/modules/attributes":4,"snabbdom/modules/class":5}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
function loaded(ctrl) {
    return ctrl.redirecting() ?
        snabbdom_1.h('div#challenge-app.dropdown', snabbdom_1.h('div.initiating', spinner())) :
        snabbdom_1.h('div#challenge-app.links.dropdown.rendered', renderContent(ctrl));
}
exports.loaded = loaded;
function loading() {
    return snabbdom_1.h('div#challenge-app.links.dropdown.rendered', [
        snabbdom_1.h('div.empty.loading', '-'),
        create()
    ]);
}
exports.loading = loading;
function renderContent(ctrl) {
    let d = ctrl.data();
    const nb = d.in.length + d.out.length;
    return nb ? [allChallenges(ctrl, d, nb)] : [
        empty(),
        create()
    ];
}
function userPowertips(vnode) {
    window.lichess.powertip.manualUserIn(vnode.elm);
}
function allChallenges(ctrl, d, nb) {
    return snabbdom_1.h('div.challenges', {
        class: { many: nb > 3 },
        hook: {
            insert: userPowertips,
            postpatch: userPowertips
        }
    }, d.in.map(challenge(ctrl, 'in')).concat(d.out.map(challenge(ctrl, 'out'))));
}
function challenge(ctrl, dir) {
    return (c) => {
        return snabbdom_1.h('div.challenge.' + dir + '.c-' + c.id, {
            class: {
                declined: !!c.declined
            }
        }, [
            snabbdom_1.h('div.content', [
                snabbdom_1.h('span.head', renderUser(dir === 'in' ? c.challenger : c.destUser)),
                snabbdom_1.h('span.desc', [
                    ctrl.trans()(c.rated ? 'rated' : 'casual'),
                    timeControl(c.timeControl),
                    c.variant.name
                ].join(' • '))
            ]),
            snabbdom_1.h('i', {
                attrs: { 'data-icon': c.perf.icon }
            }),
            snabbdom_1.h('div.buttons', (dir === 'in' ? inButtons : outButtons)(ctrl, c))
        ]);
    };
}
function inButtons(ctrl, c) {
    const trans = ctrl.trans();
    return [
        snabbdom_1.h('form', {
            attrs: {
                method: 'post',
                action: `/challenge/${c.id}/accept`
            }
        }, [
            snabbdom_1.h('button.button.accept', {
                attrs: {
                    'type': 'submit',
                    'data-icon': 'E',
                    title: trans('accept')
                },
                hook: onClick(ctrl.onRedirect)
            })
        ]),
        snabbdom_1.h('button.button.decline', {
            attrs: {
                'type': 'submit',
                'data-icon': 'L',
                title: trans('decline')
            },
            hook: onClick(() => ctrl.decline(c.id))
        })
    ];
}
function outButtons(ctrl, c) {
    const trans = ctrl.trans();
    return [
        snabbdom_1.h('div.owner', [
            snabbdom_1.h('span.waiting', ctrl.trans()('waiting')),
            snabbdom_1.h('a.view', {
                attrs: {
                    'data-icon': 'v',
                    href: '/' + c.id,
                    title: trans('viewInFullSize')
                }
            })
        ]),
        snabbdom_1.h('button.button.decline', {
            attrs: {
                'data-icon': 'L',
                title: trans('cancel')
            },
            hook: onClick(() => ctrl.cancel(c.id))
        })
    ];
}
function timeControl(c) {
    switch (c.type) {
        case 'unlimited':
            return 'Unlimited';
        case 'correspondence':
            return c.daysPerTurn + ' days';
        case 'clock':
            return c.show || '-';
    }
}
function renderUser(u) {
    if (!u)
        return snabbdom_1.h('span', 'Open challenge');
    const rating = u.rating + (u.provisional ? '?' : '');
    return snabbdom_1.h('a.ulpt.user-link', {
        attrs: { href: `/@/${u.name}` },
        class: { online: !!u.online }
    }, [
        snabbdom_1.h('i.line' + (u.patron ? '.patron' : '')),
        snabbdom_1.h('name', [
            u.title && snabbdom_1.h('span.title', u.title == 'BOT' ? { attrs: { 'data-bot': true } } : {}, u.title + ' '),
            u.name + ' (' + rating + ') '
        ]),
        snabbdom_1.h('signal', u.lag === undefined ? [] : [1, 2, 3, 4].map((i) => snabbdom_1.h('i', {
            class: { off: u.lag < i }
        })))
    ]);
}
function create() {
    return snabbdom_1.h('a.create', {
        attrs: {
            href: '/?any#friend',
            'data-icon': 'O'
        },
        title: 'Challenge someone'
    });
}
function empty() {
    return snabbdom_1.h('div.empty.text', {
        attrs: {
            'data-icon': '',
        }
    }, 'No challenges.');
}
function onClick(f) {
    return {
        insert: (vnode) => {
            vnode.elm.addEventListener('click', f);
        }
    };
}
function spinner() {
    return snabbdom_1.h('div.spinner', [
        snabbdom_1.h('svg', { attrs: { viewBox: '0 0 40 40' } }, [
            snabbdom_1.h('circle', {
                attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
            })
        ])
    ]);
}

},{"snabbdom":6}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function load() {
    return $.get('/challenge');
}
exports.load = load;
function decline(id) {
    return $.post(`/challenge/${id}/decline`);
}
exports.decline = decline;
function cancel(id) {
    return $.post(`/challenge/${id}/cancel`);
}
exports.cancel = cancel;

},{}],13:[function(require,module,exports){
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

},{}]},{},[10])(10)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3RodW5rLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3Zub2RlLmpzIiwic3JjL2N0cmwudHMiLCJzcmMvbWFpbi50cyIsInNyYy92aWV3LnRzIiwic3JjL3hoci50cyIsIi4uL2NvbW1vbi9zcmMvbm90aWZpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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RSxJQUFJLEVBQUMsQ0FBQztRQUNoRixJQUFJLEVBQUUsR0FBRztLQUNWLENBQUMsQ0FBQztJQUNILFlBQVksQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzVDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakMsYUFBYSxFQUFFLENBQUM7QUFDbEIsQ0FBQztBQUVELG1CQUF3QixHQUE0QjtJQUNsRCxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsY0FBYyxJQUFJLE1BQU0sQ0FBQztRQUFFLE9BQU87SUFDL0QsSUFBSSxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtRQUN6QyxtRUFBbUU7UUFDbkUsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNuRDtBQUNILENBQUM7QUFORCw0QkFNQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuZnVuY3Rpb24gYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCkge1xuICAgIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICAgIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZERhdGEgPSBjaGlsZHJlbltpXS5kYXRhO1xuICAgICAgICAgICAgaWYgKGNoaWxkRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWRkTlMoY2hpbGREYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGgoc2VsLCBiLCBjKSB7XG4gICAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhID0gYjtcbiAgICAgICAgaWYgKGlzLmFycmF5KGMpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjICYmIGMuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtjXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzLmFycmF5KGIpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiICYmIGIuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtiXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSlcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IHZub2RlXzEudm5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxbMF0gPT09ICdzJyAmJiBzZWxbMV0gPT09ICd2JyAmJiBzZWxbMl0gPT09ICdnJyAmJlxuICAgICAgICAoc2VsLmxlbmd0aCA9PT0gMyB8fCBzZWxbM10gPT09ICcuJyB8fCBzZWxbM10gPT09ICcjJykpIHtcbiAgICAgICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZV8xLnZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59XG5leHBvcnRzLmggPSBoO1xuO1xuZXhwb3J0cy5kZWZhdWx0ID0gaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xufVxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpIHtcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCkge1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuZnVuY3Rpb24gcGFyZW50Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cbmZ1bmN0aW9uIHRhZ05hbWUoZWxtKSB7XG4gICAgcmV0dXJuIGVsbS50YWdOYW1lO1xufVxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCkge1xuICAgIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRleHRDb250ZW50O1xufVxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cbmZ1bmN0aW9uIGlzVGV4dChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5leHBvcnRzLmh0bWxEb21BcGkgPSB7XG4gICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgICBjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcbiAgICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBnZXRUZXh0Q29udGVudDogZ2V0VGV4dENvbnRlbnQsXG4gICAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gICAgaXNUZXh0OiBpc1RleHQsXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5odG1sRG9tQXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbGRvbWFwaS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYXJyYXkgPSBBcnJheS5pc0FycmF5O1xuZnVuY3Rpb24gcHJpbWl0aXZlKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMucHJpbWl0aXZlID0gcHJpbWl0aXZlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIga2V5LCBlbG0gPSB2bm9kZS5lbG0sIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzO1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgdmFyIGN1ciA9IGF0dHJzW2tleV07XG4gICAgICAgIHZhciBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgICAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgICAgICAgIGlmIChjdXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZShrZXksIGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdpZCcsIHNlbC5zbGljZShoYXNoICsgMSwgZG90KSk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdjbGFzcycsIHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAob2xkQXJnc1tpXSAhPT0gYXJnc1tpXSkge1xuICAgICAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5VG9UaHVuayhvbGRWbm9kZSwgdGh1bmspO1xufVxuZXhwb3J0cy50aHVuayA9IGZ1bmN0aW9uIHRodW5rKHNlbCwga2V5LCBmbiwgYXJncykge1xuICAgIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncyA9IGZuO1xuICAgICAgICBmbiA9IGtleTtcbiAgICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaF8xLmgoc2VsLCB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBob29rOiB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCB9LFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnRodW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGh1bmsuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB2bm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gICAgcmV0dXJuIHsgc2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5IH07XG59XG5leHBvcnRzLnZub2RlID0gdm5vZGU7XG5leHBvcnRzLmRlZmF1bHQgPSB2bm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZub2RlLmpzLm1hcCIsImltcG9ydCAqIGFzIHhociBmcm9tICcuL3hocic7XG5pbXBvcnQgbm90aWZ5IGZyb20gJ2NvbW1vbi9ub3RpZmljYXRpb24nO1xuaW1wb3J0IHsgQ3RybCwgQ2hhbGxlbmdlT3B0cywgQ2hhbGxlbmdlRGF0YSwgQ2hhbGxlbmdlVXNlciB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmNvbnN0IGxpID0gd2luZG93LmxpY2hlc3M7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9wdHM6IENoYWxsZW5nZU9wdHMsIGRhdGE6IENoYWxsZW5nZURhdGEsIHJlZHJhdzogKCkgPT4gdm9pZCk6IEN0cmwge1xuXG4gIGxldCB0cmFucyA9IChrZXk6IHN0cmluZykgPT4ga2V5O1xuICBsZXQgcmVkaXJlY3RpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiB1cGRhdGUoZDogQ2hhbGxlbmdlRGF0YSkge1xuICAgIGRhdGEgPSBkO1xuICAgIGlmIChkLmkxOG4pIHRyYW5zID0gbGkudHJhbnMoZC5pMThuKS5ub2FyZztcbiAgICBvcHRzLnNldENvdW50KGNvdW50QWN0aXZlSW4oKSk7XG4gICAgbm90aWZ5TmV3KCk7XG4gIH1cblxuICBmdW5jdGlvbiBjb3VudEFjdGl2ZUluKCkge1xuICAgIHJldHVybiBkYXRhLmluLmZpbHRlcihjID0+ICFjLmRlY2xpbmVkKS5sZW5ndGg7XG4gIH1cblxuICBmdW5jdGlvbiBub3RpZnlOZXcoKSB7XG4gICAgZGF0YS5pbi5mb3JFYWNoKGMgPT4ge1xuICAgICAgaWYgKGxpLm9uY2UoJ2MtJyArIGMuaWQpKSB7XG4gICAgICAgIGlmICghbGkucXVpZXRNb2RlICYmIGRhdGEuaW4ubGVuZ3RoIDw9IDMpIHtcbiAgICAgICAgICBvcHRzLnNob3coKTtcbiAgICAgICAgICBsaS5zb3VuZC5uZXdDaGFsbGVuZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwdXNoU3Vic3JpYmVkID0gcGFyc2VJbnQobGkuc3RvcmFnZS5nZXQoJ3B1c2gtc3Vic2NyaWJlZCcpIHx8ICcwJywgMTApICsgODY0MDAwMDAgPj0gRGF0ZS5ub3coKTsgLy8gMjRoXG4gICAgICAgICFwdXNoU3Vic3JpYmVkICYmIGMuY2hhbGxlbmdlciAmJiBub3RpZnkoc2hvd1VzZXIoYy5jaGFsbGVuZ2VyKSArICcgY2hhbGxlbmdlcyB5b3UhJyk7XG4gICAgICAgIG9wdHMucHVsc2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dVc2VyKHVzZXI6IENoYWxsZW5nZVVzZXIpIHtcbiAgICB2YXIgcmF0aW5nID0gdXNlci5yYXRpbmcgKyAodXNlci5wcm92aXNpb25hbCA/ICc/JyA6ICcnKTtcbiAgICB2YXIgZnVsbE5hbWUgPSAodXNlci50aXRsZSA/IHVzZXIudGl0bGUgKyAnICcgOiAnJykgKyB1c2VyLm5hbWU7XG4gICAgcmV0dXJuIGZ1bGxOYW1lICsgJyAoJyArIHJhdGluZyArICcpJztcbiAgfVxuXG4gIHVwZGF0ZShkYXRhKTtcblxuICByZXR1cm4ge1xuICAgIGRhdGE6ICgpID0+IGRhdGEsXG4gICAgdHJhbnM6ICgpID0+IHRyYW5zLFxuICAgIHVwZGF0ZSxcbiAgICBkZWNsaW5lKGlkKSB7XG4gICAgICBkYXRhLmluLmZvckVhY2goYyA9PiB7XG4gICAgICAgIGlmIChjLmlkID09PSBpZCkge1xuICAgICAgICAgIGMuZGVjbGluZWQgPSB0cnVlO1xuICAgICAgICAgIHhoci5kZWNsaW5lKGlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBjYW5jZWwoaWQpIHtcbiAgICAgIGRhdGEub3V0LmZvckVhY2goYyA9PiB7XG4gICAgICAgIGlmIChjLmlkID09PSBpZCkge1xuICAgICAgICAgIGMuZGVjbGluZWQgPSB0cnVlO1xuICAgICAgICAgIHhoci5jYW5jZWwoaWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlZGlyZWN0aW5nOiAoKSA9PiByZWRpcmVjdGluZyxcbiAgICBvblJlZGlyZWN0KCkge1xuICAgICAgcmVkaXJlY3RpbmcgPSB0cnVlO1xuICAgICAgbGkucmFmKHJlZHJhdyk7XG4gICAgfVxuICB9O1xufTtcbiIsImltcG9ydCB7IGluaXQgfSBmcm9tICdzbmFiYmRvbSc7XG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuXG5pbXBvcnQgbWFrZUN0cmwgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IGxvYWRlZCwgbG9hZGluZyB9IGZyb20gJy4vdmlldyc7XG5pbXBvcnQgeyBsb2FkIH0gZnJvbSAnLi94aHInXG5pbXBvcnQgeyBDaGFsbGVuZ2VPcHRzLCBDaGFsbGVuZ2VEYXRhLCBDdHJsIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuXG5pbXBvcnQga2xhc3MgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9jbGFzcyc7XG5pbXBvcnQgYXR0cmlidXRlcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnO1xuXG5jb25zdCBwYXRjaCA9IGluaXQoW2tsYXNzLCBhdHRyaWJ1dGVzXSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExpY2hlc3NDaGFsbGVuZ2UoZWxlbWVudDogRWxlbWVudCwgb3B0czogQ2hhbGxlbmdlT3B0cykge1xuXG4gIGxldCB2bm9kZTogVk5vZGUsIGN0cmw6IEN0cmw7XG5cbiAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIHZub2RlID0gcGF0Y2godm5vZGUgfHwgZWxlbWVudCwgY3RybCA/IGxvYWRlZChjdHJsKSA6IGxvYWRpbmcoKSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGUoZDogQ2hhbGxlbmdlRGF0YSkge1xuICAgIGlmIChjdHJsKSBjdHJsLnVwZGF0ZShkKTtcbiAgICBlbHNlIHtcbiAgICAgIGN0cmwgPSBtYWtlQ3RybChvcHRzLCBkLCByZWRyYXcpO1xuICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICB9XG4gICAgcmVkcmF3KCk7XG4gIH1cblxuICBpZiAob3B0cy5kYXRhKSB1cGRhdGUob3B0cy5kYXRhKTtcbiAgZWxzZSBsb2FkKCkudGhlbih1cGRhdGUpO1xuXG4gIHJldHVybiB7XG4gICAgdXBkYXRlXG4gIH07XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IEN0cmwsIENoYWxsZW5nZSwgQ2hhbGxlbmdlRGF0YSwgQ2hhbGxlbmdlRGlyZWN0aW9uLCBDaGFsbGVuZ2VVc2VyLCBUaW1lQ29udHJvbCB9IGZyb20gJy4vaW50ZXJmYWNlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRlZChjdHJsOiBDdHJsKTogVk5vZGUge1xuICByZXR1cm4gY3RybC5yZWRpcmVjdGluZygpID9cbiAgaCgnZGl2I2NoYWxsZW5nZS1hcHAuZHJvcGRvd24nLCBoKCdkaXYuaW5pdGlhdGluZycsIHNwaW5uZXIoKSkpIDpcbiAgaCgnZGl2I2NoYWxsZW5nZS1hcHAubGlua3MuZHJvcGRvd24ucmVuZGVyZWQnLCByZW5kZXJDb250ZW50KGN0cmwpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRpbmcoKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2I2NoYWxsZW5nZS1hcHAubGlua3MuZHJvcGRvd24ucmVuZGVyZWQnLCBbXG4gICAgaCgnZGl2LmVtcHR5LmxvYWRpbmcnLCAnLScpLFxuICAgIGNyZWF0ZSgpXG4gIF0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb250ZW50KGN0cmw6IEN0cmwpOiBWTm9kZVtdIHtcbiAgbGV0IGQgPSBjdHJsLmRhdGEoKTtcbiAgY29uc3QgbmIgPSBkLmluLmxlbmd0aCArIGQub3V0Lmxlbmd0aDtcbiAgcmV0dXJuIG5iID8gW2FsbENoYWxsZW5nZXMoY3RybCwgZCwgbmIpXSA6IFtcbiAgICBlbXB0eSgpLFxuICAgIGNyZWF0ZSgpXG4gIF07XG59XG5cbmZ1bmN0aW9uIHVzZXJQb3dlcnRpcHModm5vZGU6IFZOb2RlKSB7XG4gIHdpbmRvdy5saWNoZXNzLnBvd2VydGlwLm1hbnVhbFVzZXJJbih2bm9kZS5lbG0pO1xufVxuXG5mdW5jdGlvbiBhbGxDaGFsbGVuZ2VzKGN0cmw6IEN0cmwsIGQ6IENoYWxsZW5nZURhdGEsIG5iOiBudW1iZXIpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYuY2hhbGxlbmdlcycsIHtcbiAgICBjbGFzczogeyBtYW55OiBuYiA+IDMgfSxcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQ6IHVzZXJQb3dlcnRpcHMsXG4gICAgICBwb3N0cGF0Y2g6IHVzZXJQb3dlcnRpcHNcbiAgICB9XG4gIH0sIGQuaW4ubWFwKGNoYWxsZW5nZShjdHJsLCAnaW4nKSkuY29uY2F0KGQub3V0Lm1hcChjaGFsbGVuZ2UoY3RybCwgJ291dCcpKSkpO1xufVxuXG5mdW5jdGlvbiBjaGFsbGVuZ2UoY3RybDogQ3RybCwgZGlyOiBDaGFsbGVuZ2VEaXJlY3Rpb24pIHtcbiAgcmV0dXJuIChjOiBDaGFsbGVuZ2UpID0+IHtcbiAgICByZXR1cm4gaCgnZGl2LmNoYWxsZW5nZS4nICsgZGlyICsgJy5jLScgKyBjLmlkLCB7XG4gICAgICBjbGFzczoge1xuICAgICAgICBkZWNsaW5lZDogISFjLmRlY2xpbmVkXG4gICAgICB9XG4gICAgfSwgW1xuICAgICAgaCgnZGl2LmNvbnRlbnQnLCBbXG4gICAgICAgIGgoJ3NwYW4uaGVhZCcsIHJlbmRlclVzZXIoZGlyID09PSAnaW4nID8gYy5jaGFsbGVuZ2VyIDogYy5kZXN0VXNlcikpLFxuICAgICAgICBoKCdzcGFuLmRlc2MnLCBbXG4gICAgICAgICAgY3RybC50cmFucygpKGMucmF0ZWQgPyAncmF0ZWQnIDogJ2Nhc3VhbCcpLFxuICAgICAgICAgIHRpbWVDb250cm9sKGMudGltZUNvbnRyb2wpLFxuICAgICAgICAgIGMudmFyaWFudC5uYW1lXG4gICAgICAgIF0uam9pbignIOKAoiAnKSlcbiAgICAgIF0pLFxuICAgICAgaCgnaScsIHtcbiAgICAgICAgYXR0cnM6IHsnZGF0YS1pY29uJzogYy5wZXJmLmljb259XG4gICAgICB9KSxcbiAgICAgIGgoJ2Rpdi5idXR0b25zJywgKGRpciA9PT0gJ2luJyA/IGluQnV0dG9ucyA6IG91dEJ1dHRvbnMpKGN0cmwsIGMpKVxuICAgIF0pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBpbkJ1dHRvbnMoY3RybDogQ3RybCwgYzogQ2hhbGxlbmdlKTogVk5vZGVbXSB7XG4gIGNvbnN0IHRyYW5zID0gY3RybC50cmFucygpO1xuICByZXR1cm4gW1xuICAgIGgoJ2Zvcm0nLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgYWN0aW9uOiBgL2NoYWxsZW5nZS8ke2MuaWR9L2FjY2VwdGBcbiAgICAgIH1cbiAgICB9LCBbXG4gICAgICBoKCdidXR0b24uYnV0dG9uLmFjY2VwdCcsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAndHlwZSc6ICdzdWJtaXQnLFxuICAgICAgICAgICdkYXRhLWljb24nOiAnRScsXG4gICAgICAgICAgdGl0bGU6IHRyYW5zKCdhY2NlcHQnKVxuICAgICAgICB9LFxuICAgICAgICBob29rOiBvbkNsaWNrKGN0cmwub25SZWRpcmVjdClcbiAgICAgIH0pXSksXG4gICAgaCgnYnV0dG9uLmJ1dHRvbi5kZWNsaW5lJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ3R5cGUnOiAnc3VibWl0JyxcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdMJyxcbiAgICAgICAgdGl0bGU6IHRyYW5zKCdkZWNsaW5lJylcbiAgICAgIH0sXG4gICAgICBob29rOiBvbkNsaWNrKCgpID0+IGN0cmwuZGVjbGluZShjLmlkKSlcbiAgICB9KVxuICBdO1xufVxuXG5mdW5jdGlvbiBvdXRCdXR0b25zKGN0cmw6IEN0cmwsIGM6IENoYWxsZW5nZSkge1xuICBjb25zdCB0cmFucyA9IGN0cmwudHJhbnMoKTtcbiAgcmV0dXJuIFtcbiAgICBoKCdkaXYub3duZXInLCBbXG4gICAgICBoKCdzcGFuLndhaXRpbmcnLCBjdHJsLnRyYW5zKCkoJ3dhaXRpbmcnKSksXG4gICAgICBoKCdhLnZpZXcnLCB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgJ2RhdGEtaWNvbic6ICd2JyxcbiAgICAgICAgICBocmVmOiAnLycgKyBjLmlkLFxuICAgICAgICAgIHRpdGxlOiB0cmFucygndmlld0luRnVsbFNpemUnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIF0pLFxuICAgIGgoJ2J1dHRvbi5idXR0b24uZGVjbGluZScsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAnTCcsXG4gICAgICAgIHRpdGxlOiB0cmFucygnY2FuY2VsJylcbiAgICAgIH0sXG4gICAgICBob29rOiBvbkNsaWNrKCgpID0+IGN0cmwuY2FuY2VsKGMuaWQpKVxuICAgIH0pXG4gIF07XG59XG5cbmZ1bmN0aW9uIHRpbWVDb250cm9sKGM6IFRpbWVDb250cm9sKTogc3RyaW5nIHtcbiAgc3dpdGNoIChjLnR5cGUpIHtcbiAgICBjYXNlICd1bmxpbWl0ZWQnOlxuICAgICAgcmV0dXJuICdVbmxpbWl0ZWQnO1xuICAgIGNhc2UgJ2NvcnJlc3BvbmRlbmNlJzpcbiAgICAgIHJldHVybiBjLmRheXNQZXJUdXJuICsgJyBkYXlzJztcbiAgICBjYXNlICdjbG9jayc6XG4gICAgICByZXR1cm4gYy5zaG93IHx8ICctJztcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJVc2VyKHU/OiBDaGFsbGVuZ2VVc2VyKTogVk5vZGUge1xuICBpZiAoIXUpIHJldHVybiBoKCdzcGFuJywgJ09wZW4gY2hhbGxlbmdlJyk7XG4gIGNvbnN0IHJhdGluZyA9IHUucmF0aW5nICsgKHUucHJvdmlzaW9uYWwgPyAnPycgOiAnJyk7XG4gIHJldHVybiBoKCdhLnVscHQudXNlci1saW5rJywge1xuICAgIGF0dHJzOiB7IGhyZWY6IGAvQC8ke3UubmFtZX1gfSxcbiAgICBjbGFzczogeyBvbmxpbmU6ICEhdS5vbmxpbmUgfVxuICB9LCBbXG4gICAgaCgnaS5saW5lJyArICh1LnBhdHJvbiA/ICcucGF0cm9uJyA6ICcnKSksXG4gICAgaCgnbmFtZScsIFtcbiAgICAgIHUudGl0bGUgJiYgaCgnc3Bhbi50aXRsZScsIHUudGl0bGUgPT0gJ0JPVCcgPyB7IGF0dHJzOiB7ICdkYXRhLWJvdCc6IHRydWUgfSB9IDoge30sIHUudGl0bGUgKyAnICcpLFxuICAgICAgdS5uYW1lICsgJyAoJyArIHJhdGluZyArICcpICdcbiAgICBdKSxcbiAgICAgIGgoJ3NpZ25hbCcsIHUubGFnID09PSB1bmRlZmluZWQgPyBbXSA6IFsxLCAyLCAzLCA0XS5tYXAoKGkpID0+IGgoJ2knLCB7XG4gICAgICAgIGNsYXNzOiB7IG9mZjogdS5sYWchIDwgaX1cbiAgICAgIH0pKSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZSgpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdhLmNyZWF0ZScsIHtcbiAgICBhdHRyczoge1xuICAgICAgaHJlZjogJy8/YW55I2ZyaWVuZCcsXG4gICAgICAnZGF0YS1pY29uJzogJ08nXG4gICAgfSxcbiAgICB0aXRsZTogJ0NoYWxsZW5nZSBzb21lb25lJ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZW1wdHkoKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2LmVtcHR5LnRleHQnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgICdkYXRhLWljb24nOiAn7oCFJyxcbiAgICB9XG4gIH0sICdObyBjaGFsbGVuZ2VzLicpO1xufVxuXG5mdW5jdGlvbiBvbkNsaWNrKGY6IChlOiBFdmVudCkgPT4gdm9pZCkge1xuICByZXR1cm4ge1xuICAgIGluc2VydDogKHZub2RlOiBWTm9kZSkgPT4ge1xuICAgICAgKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHNwaW5uZXIoKSB7XG4gIHJldHVybiBoKCdkaXYuc3Bpbm5lcicsIFtcbiAgICBoKCdzdmcnLCB7IGF0dHJzOiB7IHZpZXdCb3g6ICcwIDAgNDAgNDAnIH0gfSwgW1xuICAgICAgaCgnY2lyY2xlJywge1xuICAgICAgICBhdHRyczogeyBjeDogMjAsIGN5OiAyMCwgcjogMTgsIGZpbGw6ICdub25lJyB9XG4gICAgICB9KV0pXSk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gbG9hZCgpIHtcbiAgcmV0dXJuICQuZ2V0KCcvY2hhbGxlbmdlJyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGVjbGluZShpZDogc3RyaW5nKSB7XG4gIHJldHVybiAkLnBvc3QoYC9jaGFsbGVuZ2UvJHtpZH0vZGVjbGluZWApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChpZDogc3RyaW5nKSB7XG4gIHJldHVybiAkLnBvc3QoYC9jaGFsbGVuZ2UvJHtpZH0vY2FuY2VsYCk7XG59XG4iLCJsZXQgbm90aWZpY2F0aW9uczogQXJyYXk8Tm90aWZpY2F0aW9uPiA9IFtdO1xubGV0IGxpc3RlbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBsaXN0ZW5Ub0ZvY3VzKCkge1xuICBpZiAoIWxpc3RlbmluZykge1xuICAgIGxpc3RlbmluZyA9IHRydWU7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgbm90aWZpY2F0aW9ucy5mb3JFYWNoKG4gPT4gbi5jbG9zZSgpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMgPSBbXTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub3RpZnkobXNnOiBzdHJpbmcgfCAoKCkgPT4gc3RyaW5nKSkge1xuICBjb25zdCBzdG9yYWdlID0gd2luZG93LmxpY2hlc3Muc3RvcmFnZS5tYWtlKCdqdXN0LW5vdGlmaWVkJyk7XG4gIGlmIChkb2N1bWVudC5oYXNGb2N1cygpIHx8IERhdGUubm93KCkgLSBwYXJzZUludChzdG9yYWdlLmdldCgpISwgMTApIDwgMTAwMCkgcmV0dXJuO1xuICBzdG9yYWdlLnNldCgnJyArIERhdGUubm93KCkpO1xuICBpZiAoJC5pc0Z1bmN0aW9uKG1zZykpIG1zZyA9IG1zZygpO1xuICBjb25zdCBub3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKCdsaWNoZXNzLm9yZycsIHtcbiAgICBpY29uOiB3aW5kb3cubGljaGVzcy5hc3NldFVybCgnbG9nby9saWNoZXNzLWZhdmljb24tMjU2LnBuZycsIHtub1ZlcnNpb246IHRydWV9KSxcbiAgICBib2R5OiBtc2dcbiAgfSk7XG4gIG5vdGlmaWNhdGlvbi5vbmNsaWNrID0gKCkgPT4gd2luZG93LmZvY3VzKCk7XG4gIG5vdGlmaWNhdGlvbnMucHVzaChub3RpZmljYXRpb24pO1xuICBsaXN0ZW5Ub0ZvY3VzKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1zZzogc3RyaW5nIHwgKCgpID0+IHN0cmluZykpIHtcbiAgaWYgKGRvY3VtZW50Lmhhc0ZvY3VzKCkgfHwgISgnTm90aWZpY2F0aW9uJyBpbiB3aW5kb3cpKSByZXR1cm47XG4gIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2dyYW50ZWQnKSB7XG4gICAgLy8gaW5jcmVhc2UgY2hhbmNlcyB0aGF0IHRoZSBmaXJzdCB0YWIgY2FuIHB1dCBhIGxvY2FsIHN0b3JhZ2UgbG9ja1xuICAgIHNldFRpbWVvdXQobm90aWZ5LCAxMCArIE1hdGgucmFuZG9tKCkgKiA1MDAsIG1zZyk7XG4gIH1cbn1cbiJdfQ==
