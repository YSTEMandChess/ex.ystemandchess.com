(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessTournamentSchedule = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
!function(e,n){"function"==typeof define&&define.amd?define(["exports"],n):n("undefined"!=typeof exports?exports:e.dragscroll={})}(this,function(e){var n,t,o=window,l=document,c="mousemove",r="mouseup",i="mousedown",m="EventListener",d="add"+m,s="remove"+m,f=[],u=function(e,m){for(e=0;e<f.length;)m=f[e++],m=m.container||m,m[s](i,m.md,0),o[s](r,m.mu,0),o[s](c,m.mm,0);for(f=[].slice.call(l.getElementsByClassName("dragscroll")),e=0;e<f.length;)!function(e,m,s,f,u,a){(a=e.container||e)[d](i,a.md=function(n){e.hasAttribute("nochilddrag")&&l.elementFromPoint(n.pageX,n.pageY)!=a||(f=1,m=n.clientX,s=n.clientY,n.preventDefault())},0),o[d](r,a.mu=function(){f=0},0),o[d](c,a.mm=function(o){f&&((u=e.scroller||e).scrollLeft-=n=-m+(m=o.clientX),u.scrollTop-=t=-s+(s=o.clientY),e==l.body&&((u=l.documentElement).scrollLeft-=n,u.scrollTop-=t))},0)}(f[e++])};"complete"==l.readyState?u():o[d]("load",u,0),e.reset=u});
},{}],2:[function(require,module,exports){
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

},{"./is":4,"./vnode":9}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
exports.primitive = primitive;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./h":2,"./htmldomapi":3,"./is":4,"./thunk":8,"./vnode":9}],8:[function(require,module,exports){
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

},{"./h":2}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
}
exports.vnode = vnode;
exports.default = vnode;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("./view");
const snabbdom_1 = require("snabbdom");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const dragscroll_1 = require("dragscroll");
const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
dragscroll_1.default; // required to include the dependency :( :( :(
function app(element, env) {
    let vnode, ctrl = {
        data: () => env.data,
        trans: window.lichess.trans(env.i18n)
    };
    function redraw() {
        vnode = patch(vnode || element, view_1.default(ctrl));
    }
    redraw();
    setInterval(redraw, 3700);
    return {
        update: d => {
            env.data = d;
            redraw();
        }
    };
}
exports.app = app;
;

},{"./view":11,"dragscroll":1,"snabbdom":7,"snabbdom/modules/attributes":5,"snabbdom/modules/class":6}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const scale = 8;
let now, startTime, stopTime;
function displayClockLimit(limit) {
    switch (limit) {
        case 15:
            return '¼';
        case 30:
            return '½';
        case 45:
            return '¾';
        case 90:
            return '1.5';
        default:
            return limit / 60;
    }
}
function displayClock(clock) {
    return displayClockLimit(clock.limit) + "+" + clock.increment;
}
function leftPos(time) {
    return scale * (time - startTime) / 1000 / 60;
}
function laneGrouper(t) {
    if (t.schedule && t.schedule.freq === 'unique') {
        return -1;
    }
    else if (t.variant.key !== 'standard') {
        return 99;
    }
    else if (t.perf.key === 'ultraBullet') {
        return 70;
    }
    else if (t.schedule && t.hasMaxRating) {
        return 50 + parseInt(t.fullName.slice(1, 5)) / 10000;
    }
    else if (t.schedule && t.schedule.speed === 'superblitz') {
        return t.perf.position - 0.5;
    }
    else {
        return t.perf.position;
    }
}
function group(arr, grouper) {
    const groups = {};
    let g;
    arr.forEach(e => {
        g = grouper(e);
        if (!groups[g])
            groups[g] = [];
        groups[g].push(e);
    });
    return Object.keys(groups).sort().map(function (k) {
        return groups[k];
    });
}
function fitLane(lane, tour2) {
    return !lane.some(function (tour1) {
        return !(tour1.finishesAt <= tour2.startsAt || tour2.finishesAt <= tour1.startsAt);
    });
}
// splits lanes that have collisions, but keeps
// groups separate by not compacting existing lanes
function splitOverlaping(lanes) {
    let ret = [], i;
    lanes.forEach(lane => {
        var newLanes = [
            []
        ];
        lane.forEach(tour => {
            let collision = true;
            for (i = 0; i < newLanes.length; i++) {
                if (fitLane(newLanes[i], tour)) {
                    newLanes[i].push(tour);
                    collision = false;
                    break;
                }
            }
            if (collision)
                newLanes.push([tour]);
        });
        ret = ret.concat(newLanes);
    });
    return ret;
}
function tournamentClass(tour) {
    const finished = tour.status === 30, userCreated = tour.createdBy !== 'lichess', classes = {
        'tsht-rated': tour.rated,
        'tsht-casual': !tour.rated,
        'tsht-finished': finished,
        'tsht-joinable': !finished,
        'tsht-user-created': userCreated,
        'tsht-major': tour.major,
        'tsht-thematic': !!tour.position,
        'tsht-battle': !!tour.battle,
        'tsht-short': tour.minutes <= 30,
        'tsht-max-rating': !userCreated && tour.hasMaxRating
    };
    if (tour.schedule)
        classes['tsht-' + tour.schedule.freq] = true;
    return classes;
}
function iconOf(tour, perfIcon) {
    return (tour.schedule && tour.schedule.freq === 'shield') ? '5' : perfIcon;
}
let mousedownAt;
function renderTournament(ctrl, tour) {
    let width = tour.minutes * scale;
    const left = leftPos(tour.startsAt);
    // moves content into viewport, for long tourneys and marathons
    const paddingLeft = tour.minutes < 90 ? 0 : Math.max(0, Math.min(width - 250, // max padding, reserved text space
    leftPos(now) - left - 380)); // distance from Now
    // cut right overflow to fit viewport and not widen it, for marathons
    width = Math.min(width, leftPos(stopTime) - left);
    return snabbdom_1.h('a.tsht', {
        class: tournamentClass(tour),
        attrs: {
            href: '/tournament/' + tour.id,
            style: 'width: ' + width + 'px; left: ' + left + 'px; padding-left: ' + paddingLeft + 'px'
        }
    }, [
        snabbdom_1.h('span.icon', tour.perf ? {
            attrs: {
                'data-icon': iconOf(tour, tour.perf.icon),
                title: tour.perf.name
            }
        } : {}),
        snabbdom_1.h('span.body', [
            snabbdom_1.h('span.name', tour.fullName),
            snabbdom_1.h('span.infos', [
                snabbdom_1.h('span.text', [
                    displayClock(tour.clock) + ' ',
                    tour.variant.key === 'standard' ? null : tour.variant.name + ' ',
                    tour.position ? 'Thematic ' : null,
                    tour.rated ? ctrl.trans('ratedTournament') : ctrl.trans('casualTournament')
                ]),
                tour.nbPlayers ? snabbdom_1.h('span.nb-players', {
                    attrs: { 'data-icon': 'r' }
                }, tour.nbPlayers) : null
            ])
        ])
    ]);
}
function renderTimeline() {
    const minutesBetween = 10;
    const time = new Date(startTime);
    time.setSeconds(0);
    time.setMinutes(Math.floor(time.getMinutes() / minutesBetween) * minutesBetween);
    const timeHeaders = [];
    const count = (stopTime - startTime) / (minutesBetween * 60 * 1000);
    for (let i = 0; i < count; i++) {
        timeHeaders.push(snabbdom_1.h('div.timeheader', {
            class: { hour: !time.getMinutes() },
            attrs: { style: 'left: ' + leftPos(time.getTime()) + 'px' }
        }, timeString(time)));
        time.setUTCMinutes(time.getUTCMinutes() + minutesBetween);
    }
    timeHeaders.push(snabbdom_1.h('div.timeheader.now', {
        attrs: { style: 'left: ' + leftPos(now) + 'px' }
    }));
    return snabbdom_1.h('div.timeline', timeHeaders);
}
// converts Date to "%H:%M" with leading zeros
function timeString(time) {
    return ('0' + time.getHours()).slice(-2) + ":" + ('0' + time.getMinutes()).slice(-2);
}
function isSystemTournament(t) {
    return !!t.schedule;
}
function default_1(ctrl) {
    now = Date.now();
    startTime = now - 3 * 60 * 60 * 1000;
    stopTime = startTime + 10 * 60 * 60 * 1000;
    const data = ctrl.data();
    const systemTours = [], majorTours = [], teamBattles = [], userTours = [];
    data.finished
        .concat(data.started)
        .concat(data.created)
        .filter(t => t.finishesAt > startTime)
        .forEach(t => {
        if (isSystemTournament(t))
            systemTours.push(t);
        else if (t.major)
            majorTours.push(t);
        else if (t.battle)
            teamBattles.push(t);
        else
            userTours.push(t);
    });
    // group system tournaments into dedicated lanes for PerfType
    const tourLanes = splitOverlaping(group(systemTours, laneGrouper)
        .concat([majorTours])
        .concat([teamBattles])
        .concat([userTours])).filter(lane => lane.length > 0);
    return snabbdom_1.h('div.tour-chart', [
        snabbdom_1.h('div.tour-chart__inner.dragscroll.', {
            hook: {
                insert: vnode => {
                    const el = vnode.elm;
                    const bitLater = now + 15 * 60 * 1000;
                    el.scrollLeft = leftPos(bitLater - el.clientWidth / 2.5 / scale * 60 * 1000);
                    el.addEventListener('mousedown', e => {
                        mousedownAt = [e.clientX, e.clientY];
                    });
                    el.addEventListener('click', e => {
                        if (mousedownAt && Math.pow(e.clientX - mousedownAt[0], 2) + Math.pow(e.clientY - mousedownAt[1], 2)) {
                            e.preventDefault();
                            return false;
                        }
                        return true;
                    });
                }
            }
        }, [
            renderTimeline(),
            ...tourLanes.map(lane => {
                const large = lane.find(t => isSystemTournament(t) || t.major || t.battle);
                return snabbdom_1.h('div.tournamentline' + (large ? '.large' : ''), lane.map(tour => renderTournament(ctrl, tour)));
            })
        ])
    ]);
}
exports.default = default_1;

},{"snabbdom":7}]},{},[10])(10)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZHJhZ3Njcm9sbC9kcmFnc2Nyb2xsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaHRtbGRvbWFwaS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9pcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9jbGFzcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9zbmFiYmRvbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS90aHVuay5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS92bm9kZS5qcyIsInNyYy9tYWluLnRzIiwic3JjL3ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LENBQUMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7NEJBQ3BHLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDbkIsT0FBTyxLQUFLLENBQUM7eUJBQ2Q7d0JBQ0QsT0FBTyxJQUFJLENBQUM7b0JBQ2QsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQzthQUNGO1NBQ0YsRUFBRTtZQUNELGNBQWMsRUFBRTtZQUNoQixHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDM0UsT0FBTyxZQUFDLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUN2RSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xDLENBQUMsQ0FBQztTQUNILENBQUM7S0FDSCxDQUFDLENBQUM7QUFDTCxDQUFDO0FBNURELDRCQTREQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIiFmdW5jdGlvbihlLG4pe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wiZXhwb3J0c1wiXSxuKTpuKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBleHBvcnRzP2V4cG9ydHM6ZS5kcmFnc2Nyb2xsPXt9KX0odGhpcyxmdW5jdGlvbihlKXt2YXIgbix0LG89d2luZG93LGw9ZG9jdW1lbnQsYz1cIm1vdXNlbW92ZVwiLHI9XCJtb3VzZXVwXCIsaT1cIm1vdXNlZG93blwiLG09XCJFdmVudExpc3RlbmVyXCIsZD1cImFkZFwiK20scz1cInJlbW92ZVwiK20sZj1bXSx1PWZ1bmN0aW9uKGUsbSl7Zm9yKGU9MDtlPGYubGVuZ3RoOyltPWZbZSsrXSxtPW0uY29udGFpbmVyfHxtLG1bc10oaSxtLm1kLDApLG9bc10ocixtLm11LDApLG9bc10oYyxtLm1tLDApO2ZvcihmPVtdLnNsaWNlLmNhbGwobC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZHJhZ3Njcm9sbFwiKSksZT0wO2U8Zi5sZW5ndGg7KSFmdW5jdGlvbihlLG0scyxmLHUsYSl7KGE9ZS5jb250YWluZXJ8fGUpW2RdKGksYS5tZD1mdW5jdGlvbihuKXtlLmhhc0F0dHJpYnV0ZShcIm5vY2hpbGRkcmFnXCIpJiZsLmVsZW1lbnRGcm9tUG9pbnQobi5wYWdlWCxuLnBhZ2VZKSE9YXx8KGY9MSxtPW4uY2xpZW50WCxzPW4uY2xpZW50WSxuLnByZXZlbnREZWZhdWx0KCkpfSwwKSxvW2RdKHIsYS5tdT1mdW5jdGlvbigpe2Y9MH0sMCksb1tkXShjLGEubW09ZnVuY3Rpb24obyl7ZiYmKCh1PWUuc2Nyb2xsZXJ8fGUpLnNjcm9sbExlZnQtPW49LW0rKG09by5jbGllbnRYKSx1LnNjcm9sbFRvcC09dD0tcysocz1vLmNsaWVudFkpLGU9PWwuYm9keSYmKCh1PWwuZG9jdW1lbnRFbGVtZW50KS5zY3JvbGxMZWZ0LT1uLHUuc2Nyb2xsVG9wLT10KSl9LDApfShmW2UrK10pfTtcImNvbXBsZXRlXCI9PWwucmVhZHlTdGF0ZT91KCk6b1tkXShcImxvYWRcIix1LDApLGUucmVzZXQ9dX0pOyIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuZnVuY3Rpb24gYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCkge1xuICAgIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICAgIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZERhdGEgPSBjaGlsZHJlbltpXS5kYXRhO1xuICAgICAgICAgICAgaWYgKGNoaWxkRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWRkTlMoY2hpbGREYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGgoc2VsLCBiLCBjKSB7XG4gICAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhID0gYjtcbiAgICAgICAgaWYgKGlzLmFycmF5KGMpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjICYmIGMuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtjXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzLmFycmF5KGIpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiICYmIGIuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtiXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSlcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IHZub2RlXzEudm5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxbMF0gPT09ICdzJyAmJiBzZWxbMV0gPT09ICd2JyAmJiBzZWxbMl0gPT09ICdnJyAmJlxuICAgICAgICAoc2VsLmxlbmd0aCA9PT0gMyB8fCBzZWxbM10gPT09ICcuJyB8fCBzZWxbM10gPT09ICcjJykpIHtcbiAgICAgICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZV8xLnZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59XG5leHBvcnRzLmggPSBoO1xuO1xuZXhwb3J0cy5kZWZhdWx0ID0gaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xufVxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpIHtcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCkge1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuZnVuY3Rpb24gcGFyZW50Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cbmZ1bmN0aW9uIHRhZ05hbWUoZWxtKSB7XG4gICAgcmV0dXJuIGVsbS50YWdOYW1lO1xufVxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCkge1xuICAgIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRleHRDb250ZW50O1xufVxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cbmZ1bmN0aW9uIGlzVGV4dChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5leHBvcnRzLmh0bWxEb21BcGkgPSB7XG4gICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgICBjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcbiAgICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBnZXRUZXh0Q29udGVudDogZ2V0VGV4dENvbnRlbnQsXG4gICAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gICAgaXNUZXh0OiBpc1RleHQsXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5odG1sRG9tQXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbGRvbWFwaS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYXJyYXkgPSBBcnJheS5pc0FycmF5O1xuZnVuY3Rpb24gcHJpbWl0aXZlKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMucHJpbWl0aXZlID0gcHJpbWl0aXZlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIga2V5LCBlbG0gPSB2bm9kZS5lbG0sIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzO1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgdmFyIGN1ciA9IGF0dHJzW2tleV07XG4gICAgICAgIHZhciBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgICAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgICAgICAgIGlmIChjdXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZShrZXksIGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdpZCcsIHNlbC5zbGljZShoYXNoICsgMSwgZG90KSk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdjbGFzcycsIHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAob2xkQXJnc1tpXSAhPT0gYXJnc1tpXSkge1xuICAgICAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5VG9UaHVuayhvbGRWbm9kZSwgdGh1bmspO1xufVxuZXhwb3J0cy50aHVuayA9IGZ1bmN0aW9uIHRodW5rKHNlbCwga2V5LCBmbiwgYXJncykge1xuICAgIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncyA9IGZuO1xuICAgICAgICBmbiA9IGtleTtcbiAgICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaF8xLmgoc2VsLCB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBob29rOiB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCB9LFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnRodW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGh1bmsuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB2bm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gICAgcmV0dXJuIHsgc2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5IH07XG59XG5leHBvcnRzLnZub2RlID0gdm5vZGU7XG5leHBvcnRzLmRlZmF1bHQgPSB2bm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZub2RlLmpzLm1hcCIsImltcG9ydCB2aWV3IGZyb20gJy4vdmlldyc7XG5cbmltcG9ydCB7IGluaXQgfSBmcm9tICdzbmFiYmRvbSc7XG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IGtsYXNzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnO1xuaW1wb3J0IGF0dHJpYnV0ZXMgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJztcbmltcG9ydCBkcmFnc2Nyb2xsIGZyb20gJ2RyYWdzY3JvbGwnO1xuXG5jb25zdCBwYXRjaCA9IGluaXQoW2tsYXNzLCBhdHRyaWJ1dGVzXSk7XG5cbmRyYWdzY3JvbGwgLy8gcmVxdWlyZWQgdG8gaW5jbHVkZSB0aGUgZGVwZW5kZW5jeSA6KCA6KCA6KFxuXG5leHBvcnQgZnVuY3Rpb24gYXBwKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBlbnY6IGFueSkge1xuXG4gIGxldCB2bm9kZTogVk5vZGUsIGN0cmwgPSB7XG4gICAgZGF0YTogKCkgPT4gZW52LmRhdGEsXG4gICAgdHJhbnM6IHdpbmRvdy5saWNoZXNzLnRyYW5zKGVudi5pMThuKVxuICB9O1xuXG4gIGZ1bmN0aW9uIHJlZHJhdygpIHtcbiAgICB2bm9kZSA9IHBhdGNoKHZub2RlIHx8IGVsZW1lbnQsIHZpZXcoY3RybCkpO1xuICB9XG5cbiAgcmVkcmF3KCk7XG5cbiAgc2V0SW50ZXJ2YWwocmVkcmF3LCAzNzAwKTtcblxuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZCA9PiB7XG4gICAgICBlbnYuZGF0YSA9IGQ7XG4gICAgICByZWRyYXcoKTtcbiAgICB9XG4gIH07XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuY29uc3Qgc2NhbGUgPSA4O1xubGV0IG5vdzogbnVtYmVyLCBzdGFydFRpbWU6IG51bWJlciwgc3RvcFRpbWU6IG51bWJlcjtcblxuZnVuY3Rpb24gZGlzcGxheUNsb2NrTGltaXQobGltaXQpIHtcbiAgc3dpdGNoIChsaW1pdCkge1xuICAgIGNhc2UgMTU6XG4gICAgICByZXR1cm4gJ8K8JztcbiAgICBjYXNlIDMwOlxuICAgICAgcmV0dXJuICfCvSc7XG4gICAgY2FzZSA0NTpcbiAgICAgIHJldHVybiAnwr4nO1xuICAgIGNhc2UgOTA6XG4gICAgICByZXR1cm4gJzEuNSc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBsaW1pdCAvIDYwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlDbG9jayhjbG9jaykge1xuICByZXR1cm4gZGlzcGxheUNsb2NrTGltaXQoY2xvY2subGltaXQpICsgXCIrXCIgKyBjbG9jay5pbmNyZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGxlZnRQb3ModGltZSkge1xuICByZXR1cm4gc2NhbGUgKiAodGltZSAtIHN0YXJ0VGltZSkgLyAxMDAwIC8gNjA7XG59XG5cbmZ1bmN0aW9uIGxhbmVHcm91cGVyKHQpIHtcbiAgaWYgKHQuc2NoZWR1bGUgJiYgdC5zY2hlZHVsZS5mcmVxID09PSAndW5pcXVlJykge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmICh0LnZhcmlhbnQua2V5ICE9PSAnc3RhbmRhcmQnKSB7XG4gICAgcmV0dXJuIDk5O1xuICB9IGVsc2UgaWYgKHQucGVyZi5rZXkgPT09ICd1bHRyYUJ1bGxldCcpIHtcbiAgICByZXR1cm4gNzA7XG4gIH0gZWxzZSBpZiAodC5zY2hlZHVsZSAmJiB0Lmhhc01heFJhdGluZykge1xuICAgIHJldHVybiA1MCArIHBhcnNlSW50KHQuZnVsbE5hbWUuc2xpY2UoMSw1KSkgLyAxMDAwMDtcbiAgfSBlbHNlIGlmICh0LnNjaGVkdWxlICYmIHQuc2NoZWR1bGUuc3BlZWQgPT09ICdzdXBlcmJsaXR6Jykge1xuICAgIHJldHVybiB0LnBlcmYucG9zaXRpb24gLSAwLjU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHQucGVyZi5wb3NpdGlvbjtcbiAgfVxufVxuXG5mdW5jdGlvbiBncm91cChhcnIsIGdyb3VwZXIpIHtcbiAgY29uc3QgZ3JvdXBzID0ge307XG4gIGxldCBnO1xuICBhcnIuZm9yRWFjaChlID0+IHtcbiAgICBnID0gZ3JvdXBlcihlKTtcbiAgICBpZiAoIWdyb3Vwc1tnXSkgZ3JvdXBzW2ddID0gW107XG4gICAgZ3JvdXBzW2ddLnB1c2goZSk7XG4gIH0pO1xuICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBzKS5zb3J0KCkubWFwKGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gZ3JvdXBzW2tdO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZml0TGFuZShsYW5lLCB0b3VyMikge1xuICByZXR1cm4gIWxhbmUuc29tZShmdW5jdGlvbih0b3VyMSkge1xuICAgIHJldHVybiAhKHRvdXIxLmZpbmlzaGVzQXQgPD0gdG91cjIuc3RhcnRzQXQgfHwgdG91cjIuZmluaXNoZXNBdCA8PSB0b3VyMS5zdGFydHNBdCk7XG4gIH0pO1xufVxuXG4vLyBzcGxpdHMgbGFuZXMgdGhhdCBoYXZlIGNvbGxpc2lvbnMsIGJ1dCBrZWVwc1xuLy8gZ3JvdXBzIHNlcGFyYXRlIGJ5IG5vdCBjb21wYWN0aW5nIGV4aXN0aW5nIGxhbmVzXG5mdW5jdGlvbiBzcGxpdE92ZXJsYXBpbmcobGFuZXMpIHtcbiAgbGV0IHJldDogYW55W10gPSBbXSwgaTogbnVtYmVyO1xuICBsYW5lcy5mb3JFYWNoKGxhbmUgPT4ge1xuICAgIHZhciBuZXdMYW5lczogYW55W10gPSBbXG4gICAgICBbXVxuICAgIF07XG4gICAgbGFuZS5mb3JFYWNoKHRvdXIgPT4ge1xuICAgICAgbGV0IGNvbGxpc2lvbiA9IHRydWU7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbmV3TGFuZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGZpdExhbmUobmV3TGFuZXNbaV0sIHRvdXIpKSB7XG4gICAgICAgICAgbmV3TGFuZXNbaV0ucHVzaCh0b3VyKTtcbiAgICAgICAgICBjb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNvbGxpc2lvbikgbmV3TGFuZXMucHVzaChbdG91cl0pO1xuICAgIH0pO1xuICAgIHJldCA9IHJldC5jb25jYXQobmV3TGFuZXMpO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gdG91cm5hbWVudENsYXNzKHRvdXIpIHtcbiAgY29uc3QgZmluaXNoZWQgPSB0b3VyLnN0YXR1cyA9PT0gMzAsXG4gICAgdXNlckNyZWF0ZWQgPSB0b3VyLmNyZWF0ZWRCeSAhPT0gJ2xpY2hlc3MnLFxuICAgIGNsYXNzZXMgPSB7XG4gICAgICAndHNodC1yYXRlZCc6IHRvdXIucmF0ZWQsXG4gICAgICAndHNodC1jYXN1YWwnOiAhdG91ci5yYXRlZCxcbiAgICAgICd0c2h0LWZpbmlzaGVkJzogZmluaXNoZWQsXG4gICAgICAndHNodC1qb2luYWJsZSc6ICFmaW5pc2hlZCxcbiAgICAgICd0c2h0LXVzZXItY3JlYXRlZCc6IHVzZXJDcmVhdGVkLFxuICAgICAgJ3RzaHQtbWFqb3InOiB0b3VyLm1ham9yLFxuICAgICAgJ3RzaHQtdGhlbWF0aWMnOiAhIXRvdXIucG9zaXRpb24sXG4gICAgICAndHNodC1iYXR0bGUnOiAhIXRvdXIuYmF0dGxlLFxuICAgICAgJ3RzaHQtc2hvcnQnOiB0b3VyLm1pbnV0ZXMgPD0gMzAsXG4gICAgICAndHNodC1tYXgtcmF0aW5nJzogIXVzZXJDcmVhdGVkICYmIHRvdXIuaGFzTWF4UmF0aW5nXG4gICAgfTtcbiAgaWYgKHRvdXIuc2NoZWR1bGUpIGNsYXNzZXNbJ3RzaHQtJyArIHRvdXIuc2NoZWR1bGUuZnJlcV0gPSB0cnVlO1xuICByZXR1cm4gY2xhc3Nlcztcbn1cblxuZnVuY3Rpb24gaWNvbk9mKHRvdXIsIHBlcmZJY29uKSB7XG4gIHJldHVybiAodG91ci5zY2hlZHVsZSAmJiB0b3VyLnNjaGVkdWxlLmZyZXEgPT09ICdzaGllbGQnKSA/ICc1JyA6IHBlcmZJY29uO1xufVxuXG5sZXQgbW91c2Vkb3duQXQ6IG51bWJlcltdIHwgdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiByZW5kZXJUb3VybmFtZW50KGN0cmwsIHRvdXIpIHtcbiAgbGV0IHdpZHRoID0gdG91ci5taW51dGVzICogc2NhbGU7XG4gIGNvbnN0IGxlZnQgPSBsZWZ0UG9zKHRvdXIuc3RhcnRzQXQpO1xuICAvLyBtb3ZlcyBjb250ZW50IGludG8gdmlld3BvcnQsIGZvciBsb25nIHRvdXJuZXlzIGFuZCBtYXJhdGhvbnNcbiAgY29uc3QgcGFkZGluZ0xlZnQgPSB0b3VyLm1pbnV0ZXMgPCA5MCA/IDAgOiBNYXRoLm1heCgwLFxuICAgIE1hdGgubWluKHdpZHRoIC0gMjUwLCAvLyBtYXggcGFkZGluZywgcmVzZXJ2ZWQgdGV4dCBzcGFjZVxuICAgICAgbGVmdFBvcyhub3cpIC0gbGVmdCAtIDM4MCkpOyAvLyBkaXN0YW5jZSBmcm9tIE5vd1xuICAvLyBjdXQgcmlnaHQgb3ZlcmZsb3cgdG8gZml0IHZpZXdwb3J0IGFuZCBub3Qgd2lkZW4gaXQsIGZvciBtYXJhdGhvbnNcbiAgd2lkdGggPSBNYXRoLm1pbih3aWR0aCwgbGVmdFBvcyhzdG9wVGltZSkgLSBsZWZ0KTtcblxuICByZXR1cm4gaCgnYS50c2h0Jywge1xuICAgIGNsYXNzOiB0b3VybmFtZW50Q2xhc3ModG91ciksXG4gICAgYXR0cnM6IHtcbiAgICAgIGhyZWY6ICcvdG91cm5hbWVudC8nICsgdG91ci5pZCxcbiAgICAgIHN0eWxlOiAnd2lkdGg6ICcgKyB3aWR0aCArICdweDsgbGVmdDogJyArIGxlZnQgKyAncHg7IHBhZGRpbmctbGVmdDogJyArIHBhZGRpbmdMZWZ0ICsgJ3B4J1xuICAgIH1cbiAgfSwgW1xuICAgIGgoJ3NwYW4uaWNvbicsIHRvdXIucGVyZiA/IHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiBpY29uT2YodG91ciwgdG91ci5wZXJmLmljb24pLFxuICAgICAgICB0aXRsZTogdG91ci5wZXJmLm5hbWVcbiAgICAgIH1cbiAgICB9IDoge30pLFxuICAgIGgoJ3NwYW4uYm9keScsIFtcbiAgICAgIGgoJ3NwYW4ubmFtZScsIHRvdXIuZnVsbE5hbWUpLFxuICAgICAgaCgnc3Bhbi5pbmZvcycsIFtcbiAgICAgICAgaCgnc3Bhbi50ZXh0JywgW1xuICAgICAgICAgIGRpc3BsYXlDbG9jayh0b3VyLmNsb2NrKSArICcgJyxcbiAgICAgICAgICB0b3VyLnZhcmlhbnQua2V5ID09PSAnc3RhbmRhcmQnID8gbnVsbCA6IHRvdXIudmFyaWFudC5uYW1lICsgJyAnLFxuICAgICAgICAgIHRvdXIucG9zaXRpb24gPyAnVGhlbWF0aWMgJyA6IG51bGwsXG4gICAgICAgICAgdG91ci5yYXRlZCA/IGN0cmwudHJhbnMoJ3JhdGVkVG91cm5hbWVudCcpIDogY3RybC50cmFucygnY2FzdWFsVG91cm5hbWVudCcpXG4gICAgICAgIF0pLFxuICAgICAgICB0b3VyLm5iUGxheWVycyA/IGgoJ3NwYW4ubmItcGxheWVycycsIHtcbiAgICAgICAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ3InIH1cbiAgICAgICAgfSwgdG91ci5uYlBsYXllcnMpIDogbnVsbFxuICAgICAgXSlcbiAgICBdKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVGltZWxpbmUoKSB7XG4gIGNvbnN0IG1pbnV0ZXNCZXR3ZWVuID0gMTA7XG4gIGNvbnN0IHRpbWUgPSBuZXcgRGF0ZShzdGFydFRpbWUpO1xuICB0aW1lLnNldFNlY29uZHMoMCk7XG4gIHRpbWUuc2V0TWludXRlcyhNYXRoLmZsb29yKHRpbWUuZ2V0TWludXRlcygpIC8gbWludXRlc0JldHdlZW4pICogbWludXRlc0JldHdlZW4pO1xuXG4gIGNvbnN0IHRpbWVIZWFkZXJzOiBWTm9kZVtdID0gW107XG4gIGNvbnN0IGNvdW50ID0gKHN0b3BUaW1lIC0gc3RhcnRUaW1lKSAvIChtaW51dGVzQmV0d2VlbiAqIDYwICogMTAwMCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIHRpbWVIZWFkZXJzLnB1c2goaCgnZGl2LnRpbWVoZWFkZXInLCB7XG4gICAgICBjbGFzczogeyBob3VyOiAhdGltZS5nZXRNaW51dGVzKCkgfSxcbiAgICAgIGF0dHJzOiB7IHN0eWxlOiAnbGVmdDogJyArIGxlZnRQb3ModGltZS5nZXRUaW1lKCkpICsgJ3B4JyB9XG4gICAgfSwgdGltZVN0cmluZyh0aW1lKSkpO1xuICAgIHRpbWUuc2V0VVRDTWludXRlcyh0aW1lLmdldFVUQ01pbnV0ZXMoKSArIG1pbnV0ZXNCZXR3ZWVuKTtcbiAgfVxuICB0aW1lSGVhZGVycy5wdXNoKGgoJ2Rpdi50aW1laGVhZGVyLm5vdycsIHtcbiAgICBhdHRyczogeyBzdHlsZTogJ2xlZnQ6ICcgKyBsZWZ0UG9zKG5vdykgKyAncHgnIH1cbiAgfSkpO1xuXG4gIHJldHVybiBoKCdkaXYudGltZWxpbmUnLCB0aW1lSGVhZGVycyk7XG59XG5cbi8vIGNvbnZlcnRzIERhdGUgdG8gXCIlSDolTVwiIHdpdGggbGVhZGluZyB6ZXJvc1xuZnVuY3Rpb24gdGltZVN0cmluZyh0aW1lKSB7XG4gIHJldHVybiAoJzAnICsgdGltZS5nZXRIb3VycygpKS5zbGljZSgtMikgKyBcIjpcIiArICgnMCcgKyB0aW1lLmdldE1pbnV0ZXMoKSkuc2xpY2UoLTIpO1xufVxuXG5mdW5jdGlvbiBpc1N5c3RlbVRvdXJuYW1lbnQodCkge1xuICByZXR1cm4gISF0LnNjaGVkdWxlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsKSB7XG4gIG5vdyA9IERhdGUubm93KCk7XG4gIHN0YXJ0VGltZSA9IG5vdyAtIDMgKiA2MCAqIDYwICogMTAwMDtcbiAgc3RvcFRpbWUgPSBzdGFydFRpbWUgKyAxMCAqIDYwICogNjAgKiAxMDAwO1xuXG4gIGNvbnN0IGRhdGEgPSBjdHJsLmRhdGEoKTtcblxuICBjb25zdCBzeXN0ZW1Ub3VyczogYW55W10gPSBbXSxcbiAgICBtYWpvclRvdXJzOiBhbnlbXSA9IFtdLFxuICAgIHRlYW1CYXR0bGVzOiBhbnlbXSA9IFtdLFxuICAgIHVzZXJUb3VyczogYW55W10gPSBbXTtcblxuICBkYXRhLmZpbmlzaGVkXG4gICAgLmNvbmNhdChkYXRhLnN0YXJ0ZWQpXG4gICAgLmNvbmNhdChkYXRhLmNyZWF0ZWQpXG4gICAgLmZpbHRlcih0ID0+IHQuZmluaXNoZXNBdCA+IHN0YXJ0VGltZSlcbiAgICAuZm9yRWFjaCh0ID0+IHtcbiAgICAgIGlmIChpc1N5c3RlbVRvdXJuYW1lbnQodCkpIHN5c3RlbVRvdXJzLnB1c2godCk7XG4gICAgICBlbHNlIGlmICh0Lm1ham9yKSBtYWpvclRvdXJzLnB1c2godCk7XG4gICAgICBlbHNlIGlmICh0LmJhdHRsZSkgdGVhbUJhdHRsZXMucHVzaCh0KTtcbiAgICAgIGVsc2UgdXNlclRvdXJzLnB1c2godCk7XG4gICAgfSk7XG5cbiAgLy8gZ3JvdXAgc3lzdGVtIHRvdXJuYW1lbnRzIGludG8gZGVkaWNhdGVkIGxhbmVzIGZvciBQZXJmVHlwZVxuICBjb25zdCB0b3VyTGFuZXMgPSBzcGxpdE92ZXJsYXBpbmcoXG4gICAgZ3JvdXAoc3lzdGVtVG91cnMsIGxhbmVHcm91cGVyKVxuICAgIC5jb25jYXQoW21ham9yVG91cnNdKVxuICAgIC5jb25jYXQoW3RlYW1CYXR0bGVzXSlcbiAgICAuY29uY2F0KFt1c2VyVG91cnNdKVxuICApLmZpbHRlcihsYW5lID0+IGxhbmUubGVuZ3RoID4gMCk7XG5cbiAgcmV0dXJuIGgoJ2Rpdi50b3VyLWNoYXJ0JywgW1xuICAgIGgoJ2Rpdi50b3VyLWNoYXJ0X19pbm5lci5kcmFnc2Nyb2xsLicsIHtcbiAgICAgIGhvb2s6IHtcbiAgICAgICAgaW5zZXJ0OiB2bm9kZSA9PiB7XG4gICAgICAgICAgY29uc3QgZWwgPSB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgY29uc3QgYml0TGF0ZXIgPSBub3cgKyAxNSAqIDYwICogMTAwMDtcbiAgICAgICAgICBlbC5zY3JvbGxMZWZ0ID0gbGVmdFBvcyhiaXRMYXRlciAtIGVsLmNsaWVudFdpZHRoIC8gMi41IC8gc2NhbGUgKiA2MCAqIDEwMDApO1xuXG4gICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZSA9PiB7XG4gICAgICAgICAgICBtb3VzZWRvd25BdCA9IFtlLmNsaWVudFgsIGUuY2xpZW50WV07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgIGlmIChtb3VzZWRvd25BdCAmJiBNYXRoLnBvdyhlLmNsaWVudFggLSBtb3VzZWRvd25BdFswXSwgMikgKyBNYXRoLnBvdyhlLmNsaWVudFkgLSBtb3VzZWRvd25BdFsxXSwgMikpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIFtcbiAgICAgIHJlbmRlclRpbWVsaW5lKCksXG4gICAgICAuLi50b3VyTGFuZXMubWFwKGxhbmUgPT4ge1xuICAgICAgICBjb25zdCBsYXJnZSA9IGxhbmUuZmluZCh0ID0+IGlzU3lzdGVtVG91cm5hbWVudCh0KSB8fCB0Lm1ham9yIHx8IHQuYmF0dGxlKTtcbiAgICAgICAgcmV0dXJuIGgoJ2Rpdi50b3VybmFtZW50bGluZScgKyAobGFyZ2UgPyAnLmxhcmdlJyA6ICcnKSwgbGFuZS5tYXAodG91ciA9PlxuICAgICAgICAgIHJlbmRlclRvdXJuYW1lbnQoY3RybCwgdG91cikpKVxuICAgICAgfSlcbiAgICBdKVxuICBdKTtcbn1cbiJdfQ==
