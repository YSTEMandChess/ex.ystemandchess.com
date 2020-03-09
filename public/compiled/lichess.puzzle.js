(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessPuzzle = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function r(r,t){r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.__proto__=t}var t,n=function(){function r(){}var t=r.prototype;return t.unwrap=function(r,t){var n=this._chain((function(t){return exports.Result.ok(r?r(t):t)}),(function(r){return t?exports.Result.ok(t(r)):exports.Result.err(r)}));if(n.isErr)throw n.error;return n.value},t.map=function(r,t){return this._chain((function(t){return exports.Result.ok(r(t))}),(function(r){return exports.Result.err(t?t(r):r)}))},t.chain=function(r,t){return this._chain(r,t||function(r){return exports.Result.err(r)})},r}(),e=function(t){function n(r){var n;return(n=t.call(this)||this).value=r,n.isOk=!0,n.isErr=!1,n}return r(n,t),n.prototype._chain=function(r,t){return r(this.value)},n}(n),u=function(t){function n(r){var n;return(n=t.call(this)||this).error=r,n.isOk=!1,n.isErr=!0,n}return r(n,t),n.prototype._chain=function(r,t){return t(this.error)},n}(n);(t=exports.Result||(exports.Result={})).ok=function(r){return new e(r)},t.err=function(r){return new u(r)},t.all=function(r){if(Array.isArray(r)){for(var n=[],e=0;e<r.length;e++){var u=r[e];if(u.isErr)return u;n.push(u.value)}return t.ok(n)}for(var o={},i=Object.keys(r),s=0;s<i.length;s++){var c=r[i[s]];if(c.isErr)return c;o[i[s]]=c.value}return t.ok(o)};


},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./util");
function anim(mutation, state) {
    return state.animation.enabled ? animate(mutation, state) : render(mutation, state);
}
exports.anim = anim;
function render(mutation, state) {
    const result = mutation(state);
    state.dom.redraw();
    return result;
}
exports.render = render;
function makePiece(key, piece) {
    return {
        key: key,
        pos: util.key2pos(key),
        piece: piece
    };
}
function closer(piece, pieces) {
    return pieces.sort((p1, p2) => {
        return util.distanceSq(piece.pos, p1.pos) - util.distanceSq(piece.pos, p2.pos);
    })[0];
}
function computePlan(prevPieces, current) {
    const anims = {}, animedOrigs = [], fadings = {}, missings = [], news = [], prePieces = {};
    let curP, preP, i, vector;
    for (i in prevPieces) {
        prePieces[i] = makePiece(i, prevPieces[i]);
    }
    for (const key of util.allKeys) {
        curP = current.pieces[key];
        preP = prePieces[key];
        if (curP) {
            if (preP) {
                if (!util.samePiece(curP, preP.piece)) {
                    missings.push(preP);
                    news.push(makePiece(key, curP));
                }
            }
            else
                news.push(makePiece(key, curP));
        }
        else if (preP)
            missings.push(preP);
    }
    news.forEach(newP => {
        preP = closer(newP, missings.filter(p => util.samePiece(newP.piece, p.piece)));
        if (preP) {
            vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
            anims[newP.key] = vector.concat(vector);
            animedOrigs.push(preP.key);
        }
    });
    missings.forEach(p => {
        if (!util.containsX(animedOrigs, p.key))
            fadings[p.key] = p.piece;
    });
    return {
        anims: anims,
        fadings: fadings
    };
}
function step(state, now) {
    const cur = state.animation.current;
    if (cur === undefined) {
        if (!state.dom.destroyed)
            state.dom.redrawNow();
        return;
    }
    const rest = 1 - (now - cur.start) * cur.frequency;
    if (rest <= 0) {
        state.animation.current = undefined;
        state.dom.redrawNow();
    }
    else {
        const ease = easing(rest);
        for (let i in cur.plan.anims) {
            const cfg = cur.plan.anims[i];
            cfg[2] = cfg[0] * ease;
            cfg[3] = cfg[1] * ease;
        }
        state.dom.redrawNow(true);
        requestAnimationFrame((now = performance.now()) => step(state, now));
    }
}
function animate(mutation, state) {
    const prevPieces = Object.assign({}, state.pieces);
    const result = mutation(state);
    const plan = computePlan(prevPieces, state);
    if (!isObjectEmpty(plan.anims) || !isObjectEmpty(plan.fadings)) {
        const alreadyRunning = state.animation.current && state.animation.current.start;
        state.animation.current = {
            start: performance.now(),
            frequency: 1 / state.animation.duration,
            plan: plan
        };
        if (!alreadyRunning)
            step(state, performance.now());
    }
    else {
        state.dom.redraw();
    }
    return result;
}
function isObjectEmpty(o) {
    for (let _ in o)
        return false;
    return true;
}
function easing(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

},{"./util":18}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board = require("./board");
const fen_1 = require("./fen");
const config_1 = require("./config");
const anim_1 = require("./anim");
const drag_1 = require("./drag");
const explosion_1 = require("./explosion");
function start(state, redrawAll) {
    function toggleOrientation() {
        board.toggleOrientation(state);
        redrawAll();
    }
    ;
    return {
        set(config) {
            if (config.orientation && config.orientation !== state.orientation)
                toggleOrientation();
            (config.fen ? anim_1.anim : anim_1.render)(state => config_1.configure(state, config), state);
        },
        state,
        getFen: () => fen_1.write(state.pieces),
        toggleOrientation,
        setPieces(pieces) {
            anim_1.anim(state => board.setPieces(state, pieces), state);
        },
        selectSquare(key, force) {
            if (key)
                anim_1.anim(state => board.selectSquare(state, key, force), state);
            else if (state.selected) {
                board.unselect(state);
                state.dom.redraw();
            }
        },
        move(orig, dest) {
            anim_1.anim(state => board.baseMove(state, orig, dest), state);
        },
        newPiece(piece, key) {
            anim_1.anim(state => board.baseNewPiece(state, piece, key), state);
        },
        playPremove() {
            if (state.premovable.current) {
                if (anim_1.anim(board.playPremove, state))
                    return true;
                state.dom.redraw();
            }
            return false;
        },
        playPredrop(validate) {
            if (state.predroppable.current) {
                const result = board.playPredrop(state, validate);
                state.dom.redraw();
                return result;
            }
            return false;
        },
        cancelPremove() {
            anim_1.render(board.unsetPremove, state);
        },
        cancelPredrop() {
            anim_1.render(board.unsetPredrop, state);
        },
        cancelMove() {
            anim_1.render(state => { board.cancelMove(state); drag_1.cancel(state); }, state);
        },
        stop() {
            anim_1.render(state => { board.stop(state); drag_1.cancel(state); }, state);
        },
        explode(keys) {
            explosion_1.default(state, keys);
        },
        setAutoShapes(shapes) {
            anim_1.render(state => state.drawable.autoShapes = shapes, state);
        },
        setShapes(shapes) {
            anim_1.render(state => state.drawable.shapes = shapes, state);
        },
        getKeyAtDomPos(pos) {
            return board.getKeyAtDomPos(pos, board.whitePov(state), state.dom.bounds());
        },
        redrawAll,
        dragNewPiece(piece, event, force) {
            drag_1.dragNewPiece(state, piece, event, force);
        },
        destroy() {
            board.stop(state);
            state.dom.unbind && state.dom.unbind();
            state.dom.destroyed = true;
        }
    };
}
exports.start = start;

},{"./anim":2,"./board":4,"./config":6,"./drag":7,"./explosion":11,"./fen":12}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const premove_1 = require("./premove");
function callUserFunction(f, ...args) {
    if (f)
        setTimeout(() => f(...args), 1);
}
exports.callUserFunction = callUserFunction;
function toggleOrientation(state) {
    state.orientation = util_1.opposite(state.orientation);
    state.animation.current =
        state.draggable.current =
            state.selected = undefined;
}
exports.toggleOrientation = toggleOrientation;
function reset(state) {
    state.lastMove = undefined;
    unselect(state);
    unsetPremove(state);
    unsetPredrop(state);
}
exports.reset = reset;
function setPieces(state, pieces) {
    for (let key in pieces) {
        const piece = pieces[key];
        if (piece)
            state.pieces[key] = piece;
        else
            delete state.pieces[key];
    }
}
exports.setPieces = setPieces;
function setCheck(state, color) {
    state.check = undefined;
    if (color === true)
        color = state.turnColor;
    if (color)
        for (let k in state.pieces) {
            if (state.pieces[k].role === 'king' && state.pieces[k].color === color) {
                state.check = k;
            }
        }
}
exports.setCheck = setCheck;
function setPremove(state, orig, dest, meta) {
    unsetPredrop(state);
    state.premovable.current = [orig, dest];
    callUserFunction(state.premovable.events.set, orig, dest, meta);
}
function unsetPremove(state) {
    if (state.premovable.current) {
        state.premovable.current = undefined;
        callUserFunction(state.premovable.events.unset);
    }
}
exports.unsetPremove = unsetPremove;
function setPredrop(state, role, key) {
    unsetPremove(state);
    state.predroppable.current = { role, key };
    callUserFunction(state.predroppable.events.set, role, key);
}
function unsetPredrop(state) {
    const pd = state.predroppable;
    if (pd.current) {
        pd.current = undefined;
        callUserFunction(pd.events.unset);
    }
}
exports.unsetPredrop = unsetPredrop;
function tryAutoCastle(state, orig, dest) {
    if (!state.autoCastle)
        return false;
    const king = state.pieces[orig];
    if (!king || king.role !== 'king')
        return false;
    const origPos = util_1.key2pos(orig);
    if (origPos[0] !== 5)
        return false;
    if (origPos[1] !== 1 && origPos[1] !== 8)
        return false;
    const destPos = util_1.key2pos(dest);
    let oldRookPos, newRookPos, newKingPos;
    if (destPos[0] === 7 || destPos[0] === 8) {
        oldRookPos = util_1.pos2key([8, origPos[1]]);
        newRookPos = util_1.pos2key([6, origPos[1]]);
        newKingPos = util_1.pos2key([7, origPos[1]]);
    }
    else if (destPos[0] === 3 || destPos[0] === 1) {
        oldRookPos = util_1.pos2key([1, origPos[1]]);
        newRookPos = util_1.pos2key([4, origPos[1]]);
        newKingPos = util_1.pos2key([3, origPos[1]]);
    }
    else
        return false;
    const rook = state.pieces[oldRookPos];
    if (!rook || rook.role !== 'rook')
        return false;
    delete state.pieces[orig];
    delete state.pieces[oldRookPos];
    state.pieces[newKingPos] = king;
    state.pieces[newRookPos] = rook;
    return true;
}
function baseMove(state, orig, dest) {
    const origPiece = state.pieces[orig], destPiece = state.pieces[dest];
    if (orig === dest || !origPiece)
        return false;
    const captured = (destPiece && destPiece.color !== origPiece.color) ? destPiece : undefined;
    if (dest == state.selected)
        unselect(state);
    callUserFunction(state.events.move, orig, dest, captured);
    if (!tryAutoCastle(state, orig, dest)) {
        state.pieces[dest] = origPiece;
        delete state.pieces[orig];
    }
    state.lastMove = [orig, dest];
    state.check = undefined;
    callUserFunction(state.events.change);
    return captured || true;
}
exports.baseMove = baseMove;
function baseNewPiece(state, piece, key, force) {
    if (state.pieces[key]) {
        if (force)
            delete state.pieces[key];
        else
            return false;
    }
    callUserFunction(state.events.dropNewPiece, piece, key);
    state.pieces[key] = piece;
    state.lastMove = [key];
    state.check = undefined;
    callUserFunction(state.events.change);
    state.movable.dests = undefined;
    state.turnColor = util_1.opposite(state.turnColor);
    return true;
}
exports.baseNewPiece = baseNewPiece;
function baseUserMove(state, orig, dest) {
    const result = baseMove(state, orig, dest);
    if (result) {
        state.movable.dests = undefined;
        state.turnColor = util_1.opposite(state.turnColor);
        state.animation.current = undefined;
    }
    return result;
}
function userMove(state, orig, dest) {
    if (canMove(state, orig, dest)) {
        const result = baseUserMove(state, orig, dest);
        if (result) {
            const holdTime = state.hold.stop();
            unselect(state);
            const metadata = {
                premove: false,
                ctrlKey: state.stats.ctrlKey,
                holdTime
            };
            if (result !== true)
                metadata.captured = result;
            callUserFunction(state.movable.events.after, orig, dest, metadata);
            return true;
        }
    }
    else if (canPremove(state, orig, dest)) {
        setPremove(state, orig, dest, {
            ctrlKey: state.stats.ctrlKey
        });
        unselect(state);
        return true;
    }
    unselect(state);
    return false;
}
exports.userMove = userMove;
function dropNewPiece(state, orig, dest, force) {
    if (canDrop(state, orig, dest) || force) {
        const piece = state.pieces[orig];
        delete state.pieces[orig];
        baseNewPiece(state, piece, dest, force);
        callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
            predrop: false
        });
    }
    else if (canPredrop(state, orig, dest)) {
        setPredrop(state, state.pieces[orig].role, dest);
    }
    else {
        unsetPremove(state);
        unsetPredrop(state);
    }
    delete state.pieces[orig];
    unselect(state);
}
exports.dropNewPiece = dropNewPiece;
function selectSquare(state, key, force) {
    callUserFunction(state.events.select, key);
    if (state.selected) {
        if (state.selected === key && !state.draggable.enabled) {
            unselect(state);
            state.hold.cancel();
            return;
        }
        else if ((state.selectable.enabled || force) && state.selected !== key) {
            if (userMove(state, state.selected, key)) {
                state.stats.dragged = false;
                return;
            }
        }
    }
    if (isMovable(state, key) || isPremovable(state, key)) {
        setSelected(state, key);
        state.hold.start();
    }
}
exports.selectSquare = selectSquare;
function setSelected(state, key) {
    state.selected = key;
    if (isPremovable(state, key)) {
        state.premovable.dests = premove_1.default(state.pieces, key, state.premovable.castle);
    }
    else
        state.premovable.dests = undefined;
}
exports.setSelected = setSelected;
function unselect(state) {
    state.selected = undefined;
    state.premovable.dests = undefined;
    state.hold.cancel();
}
exports.unselect = unselect;
function isMovable(state, orig) {
    const piece = state.pieces[orig];
    return !!piece && (state.movable.color === 'both' || (state.movable.color === piece.color &&
        state.turnColor === piece.color));
}
function canMove(state, orig, dest) {
    return orig !== dest && isMovable(state, orig) && (state.movable.free || (!!state.movable.dests && util_1.containsX(state.movable.dests[orig], dest)));
}
exports.canMove = canMove;
function canDrop(state, orig, dest) {
    const piece = state.pieces[orig];
    return !!piece && dest && (orig === dest || !state.pieces[dest]) && (state.movable.color === 'both' || (state.movable.color === piece.color &&
        state.turnColor === piece.color));
}
function isPremovable(state, orig) {
    const piece = state.pieces[orig];
    return !!piece && state.premovable.enabled &&
        state.movable.color === piece.color &&
        state.turnColor !== piece.color;
}
function canPremove(state, orig, dest) {
    return orig !== dest &&
        isPremovable(state, orig) &&
        util_1.containsX(premove_1.default(state.pieces, orig, state.premovable.castle), dest);
}
function canPredrop(state, orig, dest) {
    const piece = state.pieces[orig];
    const destPiece = state.pieces[dest];
    return !!piece && dest &&
        (!destPiece || destPiece.color !== state.movable.color) &&
        state.predroppable.enabled &&
        (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
        state.movable.color === piece.color &&
        state.turnColor !== piece.color;
}
function isDraggable(state, orig) {
    const piece = state.pieces[orig];
    return !!piece && state.draggable.enabled && (state.movable.color === 'both' || (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled)));
}
exports.isDraggable = isDraggable;
function playPremove(state) {
    const move = state.premovable.current;
    if (!move)
        return false;
    const orig = move[0], dest = move[1];
    let success = false;
    if (canMove(state, orig, dest)) {
        const result = baseUserMove(state, orig, dest);
        if (result) {
            const metadata = { premove: true };
            if (result !== true)
                metadata.captured = result;
            callUserFunction(state.movable.events.after, orig, dest, metadata);
            success = true;
        }
    }
    unsetPremove(state);
    return success;
}
exports.playPremove = playPremove;
function playPredrop(state, validate) {
    let drop = state.predroppable.current, success = false;
    if (!drop)
        return false;
    if (validate(drop)) {
        const piece = {
            role: drop.role,
            color: state.movable.color
        };
        if (baseNewPiece(state, piece, drop.key)) {
            callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
                predrop: true
            });
            success = true;
        }
    }
    unsetPredrop(state);
    return success;
}
exports.playPredrop = playPredrop;
function cancelMove(state) {
    unsetPremove(state);
    unsetPredrop(state);
    unselect(state);
}
exports.cancelMove = cancelMove;
function stop(state) {
    state.movable.color =
        state.movable.dests =
            state.animation.current = undefined;
    cancelMove(state);
}
exports.stop = stop;
function getKeyAtDomPos(pos, asWhite, bounds) {
    let file = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width));
    if (!asWhite)
        file = 9 - file;
    let rank = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)));
    if (!asWhite)
        rank = 9 - rank;
    return (file > 0 && file < 9 && rank > 0 && rank < 9) ? util_1.pos2key([file, rank]) : undefined;
}
exports.getKeyAtDomPos = getKeyAtDomPos;
function whitePov(s) {
    return s.orientation === 'white';
}
exports.whitePov = whitePov;

},{"./premove":13,"./util":18}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const config_1 = require("./config");
const state_1 = require("./state");
const wrap_1 = require("./wrap");
const events = require("./events");
const render_1 = require("./render");
const svg = require("./svg");
const util = require("./util");
function Chessground(element, config) {
    const state = state_1.defaults();
    config_1.configure(state, config || {});
    function redrawAll() {
        let prevUnbind = state.dom && state.dom.unbind;
        const relative = state.viewOnly && !state.drawable.visible, elements = wrap_1.default(element, state, relative), bounds = util.memo(() => elements.board.getBoundingClientRect()), redrawNow = (skipSvg) => {
            render_1.default(state);
            if (!skipSvg && elements.svg)
                svg.renderSvg(state, elements.svg);
        };
        state.dom = {
            elements,
            bounds,
            redraw: debounceRedraw(redrawNow),
            redrawNow,
            unbind: prevUnbind,
            relative
        };
        state.drawable.prevSvgHash = '';
        redrawNow(false);
        events.bindBoard(state);
        if (!prevUnbind)
            state.dom.unbind = events.bindDocument(state, redrawAll);
        state.events.insert && state.events.insert(elements);
    }
    redrawAll();
    return api_1.start(state, redrawAll);
}
exports.Chessground = Chessground;
;
function debounceRedraw(redrawNow) {
    let redrawing = false;
    return () => {
        if (redrawing)
            return;
        redrawing = true;
        requestAnimationFrame(() => {
            redrawNow();
            redrawing = false;
        });
    };
}

},{"./api":3,"./config":6,"./events":10,"./render":14,"./state":15,"./svg":16,"./util":18,"./wrap":19}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_1 = require("./board");
const fen_1 = require("./fen");
function configure(state, config) {
    if (config.movable && config.movable.dests)
        state.movable.dests = undefined;
    merge(state, config);
    if (config.fen) {
        state.pieces = fen_1.read(config.fen);
        state.drawable.shapes = [];
    }
    if (config.hasOwnProperty('check'))
        board_1.setCheck(state, config.check || false);
    if (config.hasOwnProperty('lastMove') && !config.lastMove)
        state.lastMove = undefined;
    else if (config.lastMove)
        state.lastMove = config.lastMove;
    if (state.selected)
        board_1.setSelected(state, state.selected);
    if (!state.animation.duration || state.animation.duration < 100)
        state.animation.enabled = false;
    if (!state.movable.rookCastle && state.movable.dests) {
        const rank = state.movable.color === 'white' ? 1 : 8, kingStartPos = 'e' + rank, dests = state.movable.dests[kingStartPos], king = state.pieces[kingStartPos];
        if (!dests || !king || king.role !== 'king')
            return;
        state.movable.dests[kingStartPos] = dests.filter(d => !((d === 'a' + rank) && dests.indexOf('c' + rank) !== -1) &&
            !((d === 'h' + rank) && dests.indexOf('g' + rank) !== -1));
    }
}
exports.configure = configure;
;
function merge(base, extend) {
    for (let key in extend) {
        if (isObject(base[key]) && isObject(extend[key]))
            merge(base[key], extend[key]);
        else
            base[key] = extend[key];
    }
}
function isObject(o) {
    return typeof o === 'object';
}

},{"./board":4,"./fen":12}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board = require("./board");
const util = require("./util");
const draw_1 = require("./draw");
const anim_1 = require("./anim");
function start(s, e) {
    if (e.button !== undefined && e.button !== 0)
        return;
    if (e.touches && e.touches.length > 1)
        return;
    const bounds = s.dom.bounds(), position = util.eventPosition(e), orig = board.getKeyAtDomPos(position, board.whitePov(s), bounds);
    if (!orig)
        return;
    const piece = s.pieces[orig];
    const previouslySelected = s.selected;
    if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || (!piece || piece.color !== s.turnColor)))
        draw_1.clear(s);
    if (e.cancelable !== false &&
        (!e.touches || !s.movable.color || piece || previouslySelected || pieceCloseTo(s, position)))
        e.preventDefault();
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    s.stats.ctrlKey = e.ctrlKey;
    if (s.selected && board.canMove(s, s.selected, orig)) {
        anim_1.anim(state => board.selectSquare(state, orig), s);
    }
    else {
        board.selectSquare(s, orig);
    }
    const stillSelected = s.selected === orig;
    const element = pieceElementByKey(s, orig);
    if (piece && element && stillSelected && board.isDraggable(s, orig)) {
        const squareBounds = computeSquareBounds(orig, board.whitePov(s), bounds);
        s.draggable.current = {
            orig,
            origPos: util.key2pos(orig),
            piece,
            rel: position,
            epos: position,
            pos: [0, 0],
            dec: s.draggable.centerPiece ? [
                position[0] - (squareBounds.left + squareBounds.width / 2),
                position[1] - (squareBounds.top + squareBounds.height / 2)
            ] : [0, 0],
            started: s.draggable.autoDistance && s.stats.dragged,
            element,
            previouslySelected,
            originTarget: e.target
        };
        element.cgDragging = true;
        element.classList.add('dragging');
        const ghost = s.dom.elements.ghost;
        if (ghost) {
            ghost.className = `ghost ${piece.color} ${piece.role}`;
            util.translateAbs(ghost, util.posToTranslateAbs(bounds)(util.key2pos(orig), board.whitePov(s)));
            util.setVisible(ghost, true);
        }
        processDrag(s);
    }
    else {
        if (hadPremove)
            board.unsetPremove(s);
        if (hadPredrop)
            board.unsetPredrop(s);
    }
    s.dom.redraw();
}
exports.start = start;
function pieceCloseTo(s, pos) {
    const asWhite = board.whitePov(s), bounds = s.dom.bounds(), radiusSq = Math.pow(bounds.width / 8, 2);
    for (let key in s.pieces) {
        const squareBounds = computeSquareBounds(key, asWhite, bounds), center = [
            squareBounds.left + squareBounds.width / 2,
            squareBounds.top + squareBounds.height / 2
        ];
        if (util.distanceSq(center, pos) <= radiusSq)
            return true;
    }
    return false;
}
exports.pieceCloseTo = pieceCloseTo;
function dragNewPiece(s, piece, e, force) {
    const key = 'a0';
    s.pieces[key] = piece;
    s.dom.redraw();
    const position = util.eventPosition(e), asWhite = board.whitePov(s), bounds = s.dom.bounds(), squareBounds = computeSquareBounds(key, asWhite, bounds);
    const rel = [
        (asWhite ? 0 : 7) * squareBounds.width + bounds.left,
        (asWhite ? 8 : -1) * squareBounds.height + bounds.top
    ];
    s.draggable.current = {
        orig: key,
        origPos: util.key2pos(key),
        piece,
        rel,
        epos: position,
        pos: [position[0] - rel[0], position[1] - rel[1]],
        dec: [-squareBounds.width / 2, -squareBounds.height / 2],
        started: true,
        element: () => pieceElementByKey(s, key),
        originTarget: e.target,
        newPiece: true,
        force: !!force
    };
    processDrag(s);
}
exports.dragNewPiece = dragNewPiece;
function processDrag(s) {
    requestAnimationFrame(() => {
        const cur = s.draggable.current;
        if (!cur)
            return;
        if (s.animation.current && s.animation.current.plan.anims[cur.orig])
            s.animation.current = undefined;
        const origPiece = s.pieces[cur.orig];
        if (!origPiece || !util.samePiece(origPiece, cur.piece))
            cancel(s);
        else {
            if (!cur.started && util.distanceSq(cur.epos, cur.rel) >= Math.pow(s.draggable.distance, 2))
                cur.started = true;
            if (cur.started) {
                if (typeof cur.element === 'function') {
                    const found = cur.element();
                    if (!found)
                        return;
                    found.cgDragging = true;
                    found.classList.add('dragging');
                    cur.element = found;
                }
                cur.pos = [
                    cur.epos[0] - cur.rel[0],
                    cur.epos[1] - cur.rel[1]
                ];
                const translation = util.posToTranslateAbs(s.dom.bounds())(cur.origPos, board.whitePov(s));
                translation[0] += cur.pos[0] + cur.dec[0];
                translation[1] += cur.pos[1] + cur.dec[1];
                util.translateAbs(cur.element, translation);
            }
        }
        processDrag(s);
    });
}
function move(s, e) {
    if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
        s.draggable.current.epos = util.eventPosition(e);
    }
}
exports.move = move;
function end(s, e) {
    const cur = s.draggable.current;
    if (!cur)
        return;
    if (e.type === 'touchend' && e.cancelable !== false)
        e.preventDefault();
    if (e.type === 'touchend' && cur && cur.originTarget !== e.target && !cur.newPiece) {
        s.draggable.current = undefined;
        return;
    }
    board.unsetPremove(s);
    board.unsetPredrop(s);
    const eventPos = util.eventPosition(e) || cur.epos;
    const dest = board.getKeyAtDomPos(eventPos, board.whitePov(s), s.dom.bounds());
    if (dest && cur.started && cur.orig !== dest) {
        if (cur.newPiece)
            board.dropNewPiece(s, cur.orig, dest, cur.force);
        else {
            s.stats.ctrlKey = e.ctrlKey;
            if (board.userMove(s, cur.orig, dest))
                s.stats.dragged = true;
        }
    }
    else if (cur.newPiece) {
        delete s.pieces[cur.orig];
    }
    else if (s.draggable.deleteOnDropOff && !dest) {
        delete s.pieces[cur.orig];
        board.callUserFunction(s.events.change);
    }
    if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest))
        board.unselect(s);
    else if (!s.selectable.enabled)
        board.unselect(s);
    removeDragElements(s);
    s.draggable.current = undefined;
    s.dom.redraw();
}
exports.end = end;
function cancel(s) {
    const cur = s.draggable.current;
    if (cur) {
        if (cur.newPiece)
            delete s.pieces[cur.orig];
        s.draggable.current = undefined;
        board.unselect(s);
        removeDragElements(s);
        s.dom.redraw();
    }
}
exports.cancel = cancel;
function removeDragElements(s) {
    const e = s.dom.elements;
    if (e.ghost)
        util.setVisible(e.ghost, false);
}
function computeSquareBounds(key, asWhite, bounds) {
    const pos = util.key2pos(key);
    if (!asWhite) {
        pos[0] = 9 - pos[0];
        pos[1] = 9 - pos[1];
    }
    return {
        left: bounds.left + bounds.width * (pos[0] - 1) / 8,
        top: bounds.top + bounds.height * (8 - pos[1]) / 8,
        width: bounds.width / 8,
        height: bounds.height / 8
    };
}
function pieceElementByKey(s, key) {
    let el = s.dom.elements.board.firstChild;
    while (el) {
        if (el.cgKey === key && el.tagName === 'PIECE')
            return el;
        el = el.nextSibling;
    }
    return undefined;
}

},{"./anim":2,"./board":4,"./draw":8,"./util":18}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_1 = require("./board");
const util_1 = require("./util");
const brushes = ['green', 'red', 'blue', 'yellow'];
function start(state, e) {
    if (e.touches && e.touches.length > 1)
        return;
    e.stopPropagation();
    e.preventDefault();
    e.ctrlKey ? board_1.unselect(state) : board_1.cancelMove(state);
    const pos = util_1.eventPosition(e), orig = board_1.getKeyAtDomPos(pos, board_1.whitePov(state), state.dom.bounds());
    if (!orig)
        return;
    state.drawable.current = {
        orig,
        pos,
        brush: eventBrush(e)
    };
    processDraw(state);
}
exports.start = start;
function processDraw(state) {
    requestAnimationFrame(() => {
        const cur = state.drawable.current;
        if (cur) {
            const mouseSq = board_1.getKeyAtDomPos(cur.pos, board_1.whitePov(state), state.dom.bounds());
            if (mouseSq !== cur.mouseSq) {
                cur.mouseSq = mouseSq;
                cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
                state.dom.redrawNow();
            }
            processDraw(state);
        }
    });
}
exports.processDraw = processDraw;
function move(state, e) {
    if (state.drawable.current)
        state.drawable.current.pos = util_1.eventPosition(e);
}
exports.move = move;
function end(state) {
    const cur = state.drawable.current;
    if (cur) {
        if (cur.mouseSq)
            addShape(state.drawable, cur);
        cancel(state);
    }
}
exports.end = end;
function cancel(state) {
    if (state.drawable.current) {
        state.drawable.current = undefined;
        state.dom.redraw();
    }
}
exports.cancel = cancel;
function clear(state) {
    if (state.drawable.shapes.length) {
        state.drawable.shapes = [];
        state.dom.redraw();
        onChange(state.drawable);
    }
}
exports.clear = clear;
function eventBrush(e) {
    return brushes[((e.shiftKey || e.ctrlKey) && util_1.isRightButton(e) ? 1 : 0) + (e.altKey ? 2 : 0)];
}
function addShape(drawable, cur) {
    const sameShape = (s) => s.orig === cur.orig && s.dest === cur.dest;
    const similar = drawable.shapes.filter(sameShape)[0];
    if (similar)
        drawable.shapes = drawable.shapes.filter(s => !sameShape(s));
    if (!similar || similar.brush !== cur.brush)
        drawable.shapes.push(cur);
    onChange(drawable);
}
function onChange(drawable) {
    if (drawable.onChange)
        drawable.onChange(drawable.shapes);
}

},{"./board":4,"./util":18}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board = require("./board");
const util = require("./util");
const drag_1 = require("./drag");
function setDropMode(s, piece) {
    s.dropmode = {
        active: true,
        piece
    };
    drag_1.cancel(s);
}
exports.setDropMode = setDropMode;
function cancelDropMode(s) {
    s.dropmode = {
        active: false
    };
}
exports.cancelDropMode = cancelDropMode;
function drop(s, e) {
    if (!s.dropmode.active)
        return;
    board.unsetPremove(s);
    board.unsetPredrop(s);
    const piece = s.dropmode.piece;
    if (piece) {
        s.pieces.a0 = piece;
        const position = util.eventPosition(e);
        const dest = position && board.getKeyAtDomPos(position, board.whitePov(s), s.dom.bounds());
        if (dest)
            board.dropNewPiece(s, 'a0', dest);
    }
    s.dom.redraw();
}
exports.drop = drop;

},{"./board":4,"./drag":7,"./util":18}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drag = require("./drag");
const draw = require("./draw");
const drop_1 = require("./drop");
const util_1 = require("./util");
function bindBoard(s) {
    if (s.viewOnly)
        return;
    const boardEl = s.dom.elements.board, onStart = startDragOrDraw(s);
    boardEl.addEventListener('touchstart', onStart, { passive: false });
    boardEl.addEventListener('mousedown', onStart, { passive: false });
    if (s.disableContextMenu || s.drawable.enabled) {
        boardEl.addEventListener('contextmenu', e => e.preventDefault());
    }
}
exports.bindBoard = bindBoard;
function bindDocument(s, redrawAll) {
    const unbinds = [];
    if (!s.dom.relative && s.resizable) {
        const onResize = () => {
            s.dom.bounds.clear();
            requestAnimationFrame(redrawAll);
        };
        unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
    }
    if (!s.viewOnly) {
        const onmove = dragOrDraw(s, drag.move, draw.move);
        const onend = dragOrDraw(s, drag.end, draw.end);
        ['touchmove', 'mousemove'].forEach(ev => unbinds.push(unbindable(document, ev, onmove)));
        ['touchend', 'mouseup'].forEach(ev => unbinds.push(unbindable(document, ev, onend)));
        const onScroll = () => s.dom.bounds.clear();
        unbinds.push(unbindable(window, 'scroll', onScroll, { passive: true }));
        unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
    }
    return () => unbinds.forEach(f => f());
}
exports.bindDocument = bindDocument;
function unbindable(el, eventName, callback, options) {
    el.addEventListener(eventName, callback, options);
    return () => el.removeEventListener(eventName, callback);
}
function startDragOrDraw(s) {
    return e => {
        if (s.draggable.current)
            drag.cancel(s);
        else if (s.drawable.current)
            draw.cancel(s);
        else if (e.shiftKey || util_1.isRightButton(e)) {
            if (s.drawable.enabled)
                draw.start(s, e);
        }
        else if (!s.viewOnly) {
            if (s.dropmode.active)
                drop_1.drop(s, e);
            else
                drag.start(s, e);
        }
    };
}
function dragOrDraw(s, withDrag, withDraw) {
    return e => {
        if (e.shiftKey || util_1.isRightButton(e)) {
            if (s.drawable.enabled)
                withDraw(s, e);
        }
        else if (!s.viewOnly)
            withDrag(s, e);
    };
}

},{"./drag":7,"./draw":8,"./drop":9,"./util":18}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function explosion(state, keys) {
    state.exploding = { stage: 1, keys };
    state.dom.redraw();
    setTimeout(() => {
        setStage(state, 2);
        setTimeout(() => setStage(state, undefined), 120);
    }, 120);
}
exports.default = explosion;
function setStage(state, stage) {
    if (state.exploding) {
        if (stage)
            state.exploding.stage = stage;
        else
            state.exploding = undefined;
        state.dom.redraw();
    }
}

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const cg = require("./types");
exports.initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const roles = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };
const letters = { pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k' };
function read(fen) {
    if (fen === 'start')
        fen = exports.initial;
    const pieces = {};
    let row = 8, col = 0;
    for (const c of fen) {
        switch (c) {
            case ' ': return pieces;
            case '/':
                --row;
                if (row === 0)
                    return pieces;
                col = 0;
                break;
            case '~':
                const piece = pieces[util_1.pos2key([col, row])];
                if (piece)
                    piece.promoted = true;
                break;
            default:
                const nb = c.charCodeAt(0);
                if (nb < 57)
                    col += nb - 48;
                else {
                    ++col;
                    const role = c.toLowerCase();
                    pieces[util_1.pos2key([col, row])] = {
                        role: roles[role],
                        color: (c === role ? 'black' : 'white')
                    };
                }
        }
    }
    return pieces;
}
exports.read = read;
function write(pieces) {
    return util_1.invRanks.map(y => cg.ranks.map(x => {
        const piece = pieces[util_1.pos2key([x, y])];
        if (piece) {
            const letter = letters[piece.role];
            return piece.color === 'white' ? letter.toUpperCase() : letter;
        }
        else
            return '1';
    }).join('')).join('/').replace(/1{2,}/g, s => s.length.toString());
}
exports.write = write;

},{"./types":17,"./util":18}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./util");
function diff(a, b) {
    return Math.abs(a - b);
}
function pawn(color) {
    return (x1, y1, x2, y2) => diff(x1, x2) < 2 && (color === 'white' ? (y2 === y1 + 1 || (y1 <= 2 && y2 === (y1 + 2) && x1 === x2)) : (y2 === y1 - 1 || (y1 >= 7 && y2 === (y1 - 2) && x1 === x2)));
}
const knight = (x1, y1, x2, y2) => {
    const xd = diff(x1, x2);
    const yd = diff(y1, y2);
    return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
};
const bishop = (x1, y1, x2, y2) => {
    return diff(x1, x2) === diff(y1, y2);
};
const rook = (x1, y1, x2, y2) => {
    return x1 === x2 || y1 === y2;
};
const queen = (x1, y1, x2, y2) => {
    return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
};
function king(color, rookFiles, canCastle) {
    return (x1, y1, x2, y2) => (diff(x1, x2) < 2 && diff(y1, y2) < 2) || (canCastle && y1 === y2 && y1 === (color === 'white' ? 1 : 8) && ((x1 === 5 && ((util.containsX(rookFiles, 1) && x2 === 3) || (util.containsX(rookFiles, 8) && x2 === 7))) ||
        util.containsX(rookFiles, x2)));
}
function rookFilesOf(pieces, color) {
    const backrank = color == 'white' ? '1' : '8';
    return Object.keys(pieces).filter(key => {
        const piece = pieces[key];
        return key[1] === backrank && piece && piece.color === color && piece.role === 'rook';
    }).map((key) => util.key2pos(key)[0]);
}
const allPos = util.allKeys.map(util.key2pos);
function premove(pieces, key, canCastle) {
    const piece = pieces[key], pos = util.key2pos(key), r = piece.role, mobility = r === 'pawn' ? pawn(piece.color) : (r === 'knight' ? knight : (r === 'bishop' ? bishop : (r === 'rook' ? rook : (r === 'queen' ? queen : king(piece.color, rookFilesOf(pieces, piece.color), canCastle)))));
    return allPos.filter(pos2 => (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1])).map(util.pos2key);
}
exports.default = premove;
;

},{"./util":18}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const board_1 = require("./board");
const util = require("./util");
function render(s) {
    const asWhite = board_1.whitePov(s), posToTranslate = s.dom.relative ? util.posToTranslateRel : util.posToTranslateAbs(s.dom.bounds()), translate = s.dom.relative ? util.translateRel : util.translateAbs, boardEl = s.dom.elements.board, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : {}, fadings = curAnim ? curAnim.plan.fadings : {}, curDrag = s.draggable.current, squares = computeSquareClasses(s), samePieces = {}, sameSquares = {}, movedPieces = {}, movedSquares = {}, piecesKeys = Object.keys(pieces);
    let k, p, el, pieceAtKey, elPieceName, anim, fading, pMvdset, pMvd, sMvdset, sMvd;
    el = boardEl.firstChild;
    while (el) {
        k = el.cgKey;
        if (isPieceNode(el)) {
            pieceAtKey = pieces[k];
            anim = anims[k];
            fading = fadings[k];
            elPieceName = el.cgPiece;
            if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
                el.classList.remove('dragging');
                translate(el, posToTranslate(util_1.key2pos(k), asWhite));
                el.cgDragging = false;
            }
            if (!fading && el.cgFading) {
                el.cgFading = false;
                el.classList.remove('fading');
            }
            if (pieceAtKey) {
                if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
                    const pos = util_1.key2pos(k);
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                    el.classList.add('anim');
                    translate(el, posToTranslate(pos, asWhite));
                }
                else if (el.cgAnimating) {
                    el.cgAnimating = false;
                    el.classList.remove('anim');
                    translate(el, posToTranslate(util_1.key2pos(k), asWhite));
                    if (s.addPieceZIndex)
                        el.style.zIndex = posZIndex(util_1.key2pos(k), asWhite);
                }
                if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.cgFading)) {
                    samePieces[k] = true;
                }
                else {
                    if (fading && elPieceName === pieceNameOf(fading)) {
                        el.classList.add('fading');
                        el.cgFading = true;
                    }
                    else {
                        if (movedPieces[elPieceName])
                            movedPieces[elPieceName].push(el);
                        else
                            movedPieces[elPieceName] = [el];
                    }
                }
            }
            else {
                if (movedPieces[elPieceName])
                    movedPieces[elPieceName].push(el);
                else
                    movedPieces[elPieceName] = [el];
            }
        }
        else if (isSquareNode(el)) {
            const cn = el.className;
            if (squares[k] === cn)
                sameSquares[k] = true;
            else if (movedSquares[cn])
                movedSquares[cn].push(el);
            else
                movedSquares[cn] = [el];
        }
        el = el.nextSibling;
    }
    for (const sk in squares) {
        if (!sameSquares[sk]) {
            sMvdset = movedSquares[squares[sk]];
            sMvd = sMvdset && sMvdset.pop();
            const translation = posToTranslate(util_1.key2pos(sk), asWhite);
            if (sMvd) {
                sMvd.cgKey = sk;
                translate(sMvd, translation);
            }
            else {
                const squareNode = util_1.createEl('square', squares[sk]);
                squareNode.cgKey = sk;
                translate(squareNode, translation);
                boardEl.insertBefore(squareNode, boardEl.firstChild);
            }
        }
    }
    for (const j in piecesKeys) {
        k = piecesKeys[j];
        p = pieces[k];
        anim = anims[k];
        if (!samePieces[k]) {
            pMvdset = movedPieces[pieceNameOf(p)];
            pMvd = pMvdset && pMvdset.pop();
            if (pMvd) {
                pMvd.cgKey = k;
                if (pMvd.cgFading) {
                    pMvd.classList.remove('fading');
                    pMvd.cgFading = false;
                }
                const pos = util_1.key2pos(k);
                if (s.addPieceZIndex)
                    pMvd.style.zIndex = posZIndex(pos, asWhite);
                if (anim) {
                    pMvd.cgAnimating = true;
                    pMvd.classList.add('anim');
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                }
                translate(pMvd, posToTranslate(pos, asWhite));
            }
            else {
                const pieceName = pieceNameOf(p), pieceNode = util_1.createEl('piece', pieceName), pos = util_1.key2pos(k);
                pieceNode.cgPiece = pieceName;
                pieceNode.cgKey = k;
                if (anim) {
                    pieceNode.cgAnimating = true;
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                }
                translate(pieceNode, posToTranslate(pos, asWhite));
                if (s.addPieceZIndex)
                    pieceNode.style.zIndex = posZIndex(pos, asWhite);
                boardEl.appendChild(pieceNode);
            }
        }
    }
    for (const i in movedPieces)
        removeNodes(s, movedPieces[i]);
    for (const i in movedSquares)
        removeNodes(s, movedSquares[i]);
}
exports.default = render;
function isPieceNode(el) {
    return el.tagName === 'PIECE';
}
function isSquareNode(el) {
    return el.tagName === 'SQUARE';
}
function removeNodes(s, nodes) {
    for (const i in nodes)
        s.dom.elements.board.removeChild(nodes[i]);
}
function posZIndex(pos, asWhite) {
    let z = 2 + (pos[1] - 1) * 8 + (8 - pos[0]);
    if (asWhite)
        z = 67 - z;
    return z + '';
}
function pieceNameOf(piece) {
    return `${piece.color} ${piece.role}`;
}
function computeSquareClasses(s) {
    const squares = {};
    let i, k;
    if (s.lastMove && s.highlight.lastMove)
        for (i in s.lastMove) {
            addSquare(squares, s.lastMove[i], 'last-move');
        }
    if (s.check && s.highlight.check)
        addSquare(squares, s.check, 'check');
    if (s.selected) {
        addSquare(squares, s.selected, 'selected');
        if (s.movable.showDests) {
            const dests = s.movable.dests && s.movable.dests[s.selected];
            if (dests)
                for (i in dests) {
                    k = dests[i];
                    addSquare(squares, k, 'move-dest' + (s.pieces[k] ? ' oc' : ''));
                }
            const pDests = s.premovable.dests;
            if (pDests)
                for (i in pDests) {
                    k = pDests[i];
                    addSquare(squares, k, 'premove-dest' + (s.pieces[k] ? ' oc' : ''));
                }
        }
    }
    const premove = s.premovable.current;
    if (premove)
        for (i in premove)
            addSquare(squares, premove[i], 'current-premove');
    else if (s.predroppable.current)
        addSquare(squares, s.predroppable.current.key, 'current-premove');
    const o = s.exploding;
    if (o)
        for (i in o.keys)
            addSquare(squares, o.keys[i], 'exploding' + o.stage);
    return squares;
}
function addSquare(squares, key, klass) {
    if (squares[key])
        squares[key] += ' ' + klass;
    else
        squares[key] = klass;
}

},{"./board":4,"./util":18}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fen = require("./fen");
const util_1 = require("./util");
function defaults() {
    return {
        pieces: fen.read(fen.initial),
        orientation: 'white',
        turnColor: 'white',
        coordinates: true,
        autoCastle: true,
        viewOnly: false,
        disableContextMenu: false,
        resizable: true,
        addPieceZIndex: false,
        pieceKey: false,
        highlight: {
            lastMove: true,
            check: true
        },
        animation: {
            enabled: true,
            duration: 200
        },
        movable: {
            free: true,
            color: 'both',
            showDests: true,
            events: {},
            rookCastle: true
        },
        premovable: {
            enabled: true,
            showDests: true,
            castle: true,
            events: {}
        },
        predroppable: {
            enabled: false,
            events: {}
        },
        draggable: {
            enabled: true,
            distance: 3,
            autoDistance: true,
            centerPiece: true,
            showGhost: true,
            deleteOnDropOff: false
        },
        dropmode: {
            active: false
        },
        selectable: {
            enabled: true
        },
        stats: {
            dragged: !('ontouchstart' in window)
        },
        events: {},
        drawable: {
            enabled: true,
            visible: true,
            eraseOnClick: true,
            shapes: [],
            autoShapes: [],
            brushes: {
                green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
                red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
                blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
                yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
                paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
                paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
                paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
                paleGrey: { key: 'pgr', color: '#4a4a4a', opacity: 0.35, lineWidth: 15 }
            },
            pieces: {
                baseUrl: 'https://lichess1.org/assets/piece/cburnett/'
            },
            prevSvgHash: ''
        },
        hold: util_1.timer()
    };
}
exports.defaults = defaults;

},{"./fen":12,"./util":18}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
function createElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}
exports.createElement = createElement;
function renderSvg(state, root) {
    const d = state.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : undefined, arrowDests = {};
    d.shapes.concat(d.autoShapes).concat(cur ? [cur] : []).forEach(s => {
        if (s.dest)
            arrowDests[s.dest] = (arrowDests[s.dest] || 0) + 1;
    });
    const shapes = d.shapes.concat(d.autoShapes).map((s) => {
        return {
            shape: s,
            current: false,
            hash: shapeHash(s, arrowDests, false)
        };
    });
    if (cur)
        shapes.push({
            shape: cur,
            current: true,
            hash: shapeHash(cur, arrowDests, true)
        });
    const fullHash = shapes.map(sc => sc.hash).join('');
    if (fullHash === state.drawable.prevSvgHash)
        return;
    state.drawable.prevSvgHash = fullHash;
    const defsEl = root.firstChild;
    syncDefs(d, shapes, defsEl);
    syncShapes(state, shapes, d.brushes, arrowDests, root, defsEl);
}
exports.renderSvg = renderSvg;
function syncDefs(d, shapes, defsEl) {
    const brushes = {};
    let brush;
    shapes.forEach(s => {
        if (s.shape.dest) {
            brush = d.brushes[s.shape.brush];
            if (s.shape.modifiers)
                brush = makeCustomBrush(brush, s.shape.modifiers);
            brushes[brush.key] = brush;
        }
    });
    const keysInDom = {};
    let el = defsEl.firstChild;
    while (el) {
        keysInDom[el.getAttribute('cgKey')] = true;
        el = el.nextSibling;
    }
    for (let key in brushes) {
        if (!keysInDom[key])
            defsEl.appendChild(renderMarker(brushes[key]));
    }
}
function syncShapes(state, shapes, brushes, arrowDests, root, defsEl) {
    const bounds = state.dom.bounds(), hashesInDom = {}, toRemove = [];
    shapes.forEach(sc => { hashesInDom[sc.hash] = false; });
    let el = defsEl.nextSibling, elHash;
    while (el) {
        elHash = el.getAttribute('cgHash');
        if (hashesInDom.hasOwnProperty(elHash))
            hashesInDom[elHash] = true;
        else
            toRemove.push(el);
        el = el.nextSibling;
    }
    toRemove.forEach(el => root.removeChild(el));
    shapes.forEach(sc => {
        if (!hashesInDom[sc.hash])
            root.appendChild(renderShape(state, sc, brushes, arrowDests, bounds));
    });
}
function shapeHash({ orig, dest, brush, piece, modifiers }, arrowDests, current) {
    return [current, orig, dest, brush, dest && arrowDests[dest] > 1,
        piece && pieceHash(piece),
        modifiers && modifiersHash(modifiers)
    ].filter(x => x).join('');
}
function pieceHash(piece) {
    return [piece.color, piece.role, piece.scale].filter(x => x).join('');
}
function modifiersHash(m) {
    return '' + (m.lineWidth || '');
}
function renderShape(state, { shape, current, hash }, brushes, arrowDests, bounds) {
    let el;
    if (shape.piece)
        el = renderPiece(state.drawable.pieces.baseUrl, orient(util_1.key2pos(shape.orig), state.orientation), shape.piece, bounds);
    else {
        const orig = orient(util_1.key2pos(shape.orig), state.orientation);
        if (shape.orig && shape.dest) {
            let brush = brushes[shape.brush];
            if (shape.modifiers)
                brush = makeCustomBrush(brush, shape.modifiers);
            el = renderArrow(brush, orig, orient(util_1.key2pos(shape.dest), state.orientation), current, arrowDests[shape.dest] > 1, bounds);
        }
        else
            el = renderCircle(brushes[shape.brush], orig, current, bounds);
    }
    el.setAttribute('cgHash', hash);
    return el;
}
function renderCircle(brush, pos, current, bounds) {
    const o = pos2px(pos, bounds), widths = circleWidth(bounds), radius = (bounds.width + bounds.height) / 32;
    return setAttributes(createElement('circle'), {
        stroke: brush.color,
        'stroke-width': widths[current ? 0 : 1],
        fill: 'none',
        opacity: opacity(brush, current),
        cx: o[0],
        cy: o[1],
        r: radius - widths[1] / 2
    });
}
function renderArrow(brush, orig, dest, current, shorten, bounds) {
    const m = arrowMargin(bounds, shorten && !current), a = pos2px(orig, bounds), b = pos2px(dest, bounds), dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
    return setAttributes(createElement('line'), {
        stroke: brush.color,
        'stroke-width': lineWidth(brush, current, bounds),
        'stroke-linecap': 'round',
        'marker-end': 'url(#arrowhead-' + brush.key + ')',
        opacity: opacity(brush, current),
        x1: a[0],
        y1: a[1],
        x2: b[0] - xo,
        y2: b[1] - yo
    });
}
function renderPiece(baseUrl, pos, piece, bounds) {
    const o = pos2px(pos, bounds), size = bounds.width / 8 * (piece.scale || 1), name = piece.color[0] + (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase();
    return setAttributes(createElement('image'), {
        className: `${piece.role} ${piece.color}`,
        x: o[0] - size / 2,
        y: o[1] - size / 2,
        width: size,
        height: size,
        href: baseUrl + name + '.svg'
    });
}
function renderMarker(brush) {
    const marker = setAttributes(createElement('marker'), {
        id: 'arrowhead-' + brush.key,
        orient: 'auto',
        markerWidth: 4,
        markerHeight: 8,
        refX: 2.05,
        refY: 2.01
    });
    marker.appendChild(setAttributes(createElement('path'), {
        d: 'M0,0 V4 L3,2 Z',
        fill: brush.color
    }));
    marker.setAttribute('cgKey', brush.key);
    return marker;
}
function setAttributes(el, attrs) {
    for (let key in attrs)
        el.setAttribute(key, attrs[key]);
    return el;
}
function orient(pos, color) {
    return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}
function makeCustomBrush(base, modifiers) {
    const brush = {
        color: base.color,
        opacity: Math.round(base.opacity * 10) / 10,
        lineWidth: Math.round(modifiers.lineWidth || base.lineWidth)
    };
    brush.key = [base.key, modifiers.lineWidth].filter(x => x).join('');
    return brush;
}
function circleWidth(bounds) {
    const base = bounds.width / 512;
    return [3 * base, 4 * base];
}
function lineWidth(brush, current, bounds) {
    return (brush.lineWidth || 10) * (current ? 0.85 : 1) / 512 * bounds.width;
}
function opacity(brush, current) {
    return (brush.opacity || 1) * (current ? 0.9 : 1);
}
function arrowMargin(bounds, shorten) {
    return (shorten ? 20 : 10) / 512 * bounds.width;
}
function pos2px(pos, bounds) {
    return [(pos[0] - 0.5) * bounds.width / 8, (8.5 - pos[1]) * bounds.height / 8];
}

},{"./util":18}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
exports.ranks = [1, 2, 3, 4, 5, 6, 7, 8];

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cg = require("./types");
exports.colors = ['white', 'black'];
exports.invRanks = [8, 7, 6, 5, 4, 3, 2, 1];
exports.allKeys = Array.prototype.concat(...cg.files.map(c => cg.ranks.map(r => c + r)));
exports.pos2key = (pos) => exports.allKeys[8 * pos[0] + pos[1] - 9];
exports.key2pos = (k) => [k.charCodeAt(0) - 96, k.charCodeAt(1) - 48];
function memo(f) {
    let v;
    const ret = () => {
        if (v === undefined)
            v = f();
        return v;
    };
    ret.clear = () => { v = undefined; };
    return ret;
}
exports.memo = memo;
exports.timer = () => {
    let startAt;
    return {
        start() { startAt = performance.now(); },
        cancel() { startAt = undefined; },
        stop() {
            if (!startAt)
                return 0;
            const time = performance.now() - startAt;
            startAt = undefined;
            return time;
        }
    };
};
exports.opposite = (c) => c === 'white' ? 'black' : 'white';
function containsX(xs, x) {
    return xs !== undefined && xs.indexOf(x) !== -1;
}
exports.containsX = containsX;
exports.distanceSq = (pos1, pos2) => {
    return Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2);
};
exports.samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
const posToTranslateBase = (pos, asWhite, xFactor, yFactor) => [
    (asWhite ? pos[0] - 1 : 8 - pos[0]) * xFactor,
    (asWhite ? 8 - pos[1] : pos[1] - 1) * yFactor
];
exports.posToTranslateAbs = (bounds) => {
    const xFactor = bounds.width / 8, yFactor = bounds.height / 8;
    return (pos, asWhite) => posToTranslateBase(pos, asWhite, xFactor, yFactor);
};
exports.posToTranslateRel = (pos, asWhite) => posToTranslateBase(pos, asWhite, 100, 100);
exports.translateAbs = (el, pos) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};
exports.translateRel = (el, percents) => {
    el.style.transform = `translate(${percents[0]}%,${percents[1]}%)`;
};
exports.setVisible = (el, v) => {
    el.style.visibility = v ? 'visible' : 'hidden';
};
exports.eventPosition = e => {
    if (e.clientX || e.clientX === 0)
        return [e.clientX, e.clientY];
    if (e.touches && e.targetTouches[0])
        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return undefined;
};
exports.isRightButton = (e) => e.buttons === 2 || e.button === 2;
exports.createEl = (tagName, className) => {
    const el = document.createElement(tagName);
    if (className)
        el.className = className;
    return el;
};

},{"./types":17}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const types_1 = require("./types");
const svg_1 = require("./svg");
function wrap(element, s, relative) {
    element.innerHTML = '';
    element.classList.add('cg-wrap');
    util_1.colors.forEach(c => element.classList.toggle('orientation-' + c, s.orientation === c));
    element.classList.toggle('manipulable', !s.viewOnly);
    const helper = util_1.createEl('cg-helper');
    element.appendChild(helper);
    const container = util_1.createEl('cg-container');
    helper.appendChild(container);
    const board = util_1.createEl('cg-board');
    container.appendChild(board);
    let svg;
    if (s.drawable.visible && !relative) {
        svg = svg_1.createElement('svg');
        svg.appendChild(svg_1.createElement('defs'));
        container.appendChild(svg);
    }
    if (s.coordinates) {
        const orientClass = s.orientation === 'black' ? ' black' : '';
        container.appendChild(renderCoords(types_1.ranks, 'ranks' + orientClass));
        container.appendChild(renderCoords(types_1.files, 'files' + orientClass));
    }
    let ghost;
    if (s.draggable.showGhost && !relative) {
        ghost = util_1.createEl('piece', 'ghost');
        util_1.setVisible(ghost, false);
        container.appendChild(ghost);
    }
    return {
        board,
        container,
        ghost,
        svg
    };
}
exports.default = wrap;
function renderCoords(elems, className) {
    const el = util_1.createEl('coords', className);
    let f;
    for (let i in elems) {
        f = util_1.createEl('coord');
        f.textContent = elems[i];
        el.appendChild(f);
    }
    return el;
}

},{"./svg":16,"./types":17,"./util":18}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const squareSet_1 = require("./squareSet");
function computeRange(square, deltas, stepper) {
    let range = squareSet_1.SquareSet.empty();
    for (const delta of deltas) {
        for (let sq = square + delta; 0 <= sq && sq < 64 && util_1.squareDist(sq, sq - delta) <= 2; sq += delta) {
            range = range.with(sq);
            if (stepper)
                break;
        }
    }
    return range;
}
function computeTable(deltas, stepper) {
    const table = [];
    for (let square = 0; square < 64; square++) {
        table[square] = computeRange(square, deltas, stepper);
    }
    return table;
}
const KING_ATTACKS = computeTable([-9, -8, -7, -1, 1, 7, 8, 9], true);
const KNIGHT_ATTACKS = computeTable([-17, -15, -10, -6, 6, 10, 15, 17], true);
const PAWN_ATTACKS = {
    white: computeTable([7, 9], true),
    black: computeTable([-7, -9], true),
};
function kingAttacks(square) {
    return KING_ATTACKS[square];
}
exports.kingAttacks = kingAttacks;
function knightAttacks(square) {
    return KNIGHT_ATTACKS[square];
}
exports.knightAttacks = knightAttacks;
function pawnAttacks(color, square) {
    return PAWN_ATTACKS[color][square];
}
exports.pawnAttacks = pawnAttacks;
const FILE_RANGE = computeTable([-8, 8], false);
const RANK_RANGE = computeTable([-1, 1], false);
const DIAG_RANGE = computeTable([-9, 9], false);
const ANTI_DIAG_RANGE = computeTable([-7, 7], false);
function hyperbola(bit, range, occupied) {
    let forward = occupied.intersect(range);
    let reverse = forward.bswap64(); // Assumes no more than 1 bit per rank
    forward = forward.minus64(bit);
    reverse = reverse.minus64(bit.bswap64());
    forward = forward.xor(reverse.bswap64());
    return forward.intersect(range);
}
function fileAttacks(square, occupied) {
    return hyperbola(squareSet_1.SquareSet.fromSquare(square), FILE_RANGE[square], occupied);
}
function rankAttacks(square, occupied) {
    const range = RANK_RANGE[square];
    let forward = occupied.intersect(range);
    let reverse = forward.rbit64();
    forward = forward.minus64(squareSet_1.SquareSet.fromSquare(square));
    reverse = reverse.minus64(squareSet_1.SquareSet.fromSquare(63 - square));
    forward = forward.xor(reverse.rbit64());
    return forward.intersect(range);
}
function diagAttacks(square, occupied) {
    return hyperbola(squareSet_1.SquareSet.fromSquare(square), DIAG_RANGE[square], occupied);
}
function antiDiagAttacks(square, occupied) {
    return hyperbola(squareSet_1.SquareSet.fromSquare(square), ANTI_DIAG_RANGE[square], occupied);
}
function bishopAttacks(square, occupied) {
    const bit = squareSet_1.SquareSet.fromSquare(square);
    return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
}
exports.bishopAttacks = bishopAttacks;
function rookAttacks(square, occupied) {
    return fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
}
exports.rookAttacks = rookAttacks;
function queenAttacks(square, occupied) {
    return bishopAttacks(square, occupied).xor(rookAttacks(square, occupied));
}
exports.queenAttacks = queenAttacks;
function attacks(piece, square, occupied) {
    switch (piece.role) {
        case 'pawn': return pawnAttacks(piece.color, square);
        case 'knight': return knightAttacks(square);
        case 'bishop': return bishopAttacks(square, occupied);
        case 'rook': return rookAttacks(square, occupied);
        case 'queen': return queenAttacks(square, occupied);
        case 'king': return kingAttacks(square);
    }
}
exports.attacks = attacks;
function rayTables() {
    const ray = [];
    const between = [];
    const zero = squareSet_1.SquareSet.empty();
    for (let a = 0; a < 64; a++) {
        ray[a] = [];
        between[a] = [];
        for (let b = 0; b < 64; b++) {
            ray[a][b] = zero;
            between[a][b] = zero;
        }
        for (const b of DIAG_RANGE[a]) {
            ray[a][b] = DIAG_RANGE[a].with(a);
            between[a][b] = diagAttacks(a, squareSet_1.SquareSet.fromSquare(b)).intersect(diagAttacks(b, squareSet_1.SquareSet.fromSquare(a)));
        }
        for (const b of ANTI_DIAG_RANGE[a]) {
            ray[a][b] = ANTI_DIAG_RANGE[a].with(a);
            between[a][b] = antiDiagAttacks(a, squareSet_1.SquareSet.fromSquare(b)).intersect(antiDiagAttacks(b, squareSet_1.SquareSet.fromSquare(a)));
        }
        for (const b of FILE_RANGE[a]) {
            ray[a][b] = FILE_RANGE[a].with(a);
            between[a][b] = fileAttacks(a, squareSet_1.SquareSet.fromSquare(b)).intersect(fileAttacks(b, squareSet_1.SquareSet.fromSquare(a)));
        }
        for (const b of RANK_RANGE[a]) {
            ray[a][b] = RANK_RANGE[a].with(a);
            between[a][b] = rankAttacks(a, squareSet_1.SquareSet.fromSquare(b)).intersect(rankAttacks(b, squareSet_1.SquareSet.fromSquare(a)));
        }
    }
    return [ray, between];
}
const [RAY, BETWEEN] = rayTables();
function ray(a, b) {
    return RAY[a][b];
}
exports.ray = ray;
function between(a, b) {
    return BETWEEN[a][b];
}
exports.between = between;

},{"./squareSet":26,"./util":28}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const squareSet_1 = require("./squareSet");
class Board {
    constructor() { }
    static default() {
        const board = new Board();
        board.reset();
        return board;
    }
    static racingKings() {
        const board = new Board();
        board.occupied = new squareSet_1.SquareSet(0xffff, 0);
        board.promoted = squareSet_1.SquareSet.empty();
        board.white = new squareSet_1.SquareSet(0xf0f0, 0);
        board.black = new squareSet_1.SquareSet(0x0f0f, 0);
        board.pawn = squareSet_1.SquareSet.empty();
        board.knight = new squareSet_1.SquareSet(0x1818, 0);
        board.bishop = new squareSet_1.SquareSet(0x2424, 0);
        board.rook = new squareSet_1.SquareSet(0x4242, 0);
        board.queen = new squareSet_1.SquareSet(0x0081, 0);
        board.king = new squareSet_1.SquareSet(0x8100, 0);
        return board;
    }
    static horde() {
        const board = new Board();
        board.occupied = new squareSet_1.SquareSet(4294967295, 4294901862);
        board.promoted = squareSet_1.SquareSet.empty();
        board.white = new squareSet_1.SquareSet(4294967295, 102);
        board.black = new squareSet_1.SquareSet(0, 4294901760);
        board.pawn = new squareSet_1.SquareSet(4294967295, 16711782);
        board.knight = new squareSet_1.SquareSet(0, 1107296256);
        board.bishop = new squareSet_1.SquareSet(0, 603979776);
        board.rook = new squareSet_1.SquareSet(0, 2164260864);
        board.queen = new squareSet_1.SquareSet(0, 134217728);
        board.king = new squareSet_1.SquareSet(0, 268435456);
        return board;
    }
    reset() {
        this.occupied = new squareSet_1.SquareSet(0xffff, 4294901760);
        this.promoted = squareSet_1.SquareSet.empty();
        this.white = new squareSet_1.SquareSet(0xffff, 0);
        this.black = new squareSet_1.SquareSet(0, 4294901760);
        this.pawn = new squareSet_1.SquareSet(0xff00, 16711680);
        this.knight = new squareSet_1.SquareSet(0x42, 1107296256);
        this.bishop = new squareSet_1.SquareSet(0x24, 603979776);
        this.rook = new squareSet_1.SquareSet(0x81, 2164260864);
        this.queen = new squareSet_1.SquareSet(0x8, 134217728);
        this.king = new squareSet_1.SquareSet(0x10, 268435456);
    }
    static empty() {
        const board = new Board();
        board.clear();
        return board;
    }
    clear() {
        this.occupied = squareSet_1.SquareSet.empty();
        this.promoted = squareSet_1.SquareSet.empty();
        for (const color of types_1.COLORS)
            this[color] = squareSet_1.SquareSet.empty();
        for (const role of types_1.ROLES)
            this[role] = squareSet_1.SquareSet.empty();
    }
    clone() {
        const board = new Board();
        board.occupied = this.occupied;
        board.promoted = this.promoted;
        for (const color of types_1.COLORS)
            board[color] = this[color];
        for (const role of types_1.ROLES)
            board[role] = this[role];
        return board;
    }
    getColor(square) {
        if (this.white.has(square))
            return 'white';
        if (this.black.has(square))
            return 'black';
        return;
    }
    getRole(square) {
        for (const role of types_1.ROLES) {
            if (this[role].has(square))
                return role;
        }
        return;
    }
    get(square) {
        const color = this.getColor(square);
        if (!color)
            return;
        const promoted = this.promoted.has(square);
        const role = this.getRole(square);
        return { color, role, promoted };
    }
    take(square) {
        const piece = this.get(square);
        if (piece) {
            this.occupied = this.occupied.without(square);
            this[piece.color] = this[piece.color].without(square);
            this[piece.role] = this[piece.role].without(square);
            if (piece.promoted)
                this.promoted = this.promoted.without(square);
        }
        return piece;
    }
    set(square, piece) {
        const old = this.take(square);
        this.occupied = this.occupied.with(square);
        this[piece.color] = this[piece.color].with(square);
        this[piece.role] = this[piece.role].with(square);
        if (piece.promoted)
            this.promoted = this.promoted.with(square);
        return old;
    }
    has(square) {
        return this.occupied.has(square);
    }
    [Symbol.iterator]() {
        const keys = this.occupied[Symbol.iterator]();
        const next = () => {
            const entry = keys.next();
            if (entry.done)
                return { done: true };
            return { value: [entry.value, this.get(entry.value)], done: false };
        };
        return { next };
    }
    pieces(color, role) {
        return this[color].intersect(this[role]);
    }
    rooksAndQueens() {
        return this.rook.union(this.queen);
    }
    bishopsAndQueens() {
        return this.bishop.union(this.queen);
    }
    kingOf(color) {
        return this.king.intersect(this[color]).diff(this.promoted).singleSquare();
    }
}
exports.Board = Board;

},{"./squareSet":26,"./types":27}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("@badrap/result");
const types_1 = require("./types");
const squareSet_1 = require("./squareSet");
const board_1 = require("./board");
const attacks_1 = require("./attacks");
const util_1 = require("./util");
var IllegalSetup;
(function (IllegalSetup) {
    IllegalSetup["Empty"] = "ERR_EMPTY";
    IllegalSetup["OppositeCheck"] = "ERR_OPPOSITE_CHECK";
    IllegalSetup["PawnsOnBackrank"] = "ERR_PAWNS_ON_BACKRANK";
    IllegalSetup["Kings"] = "ERR_KINGS";
    IllegalSetup["Variant"] = "ERR_VARIANT";
})(IllegalSetup = exports.IllegalSetup || (exports.IllegalSetup = {}));
class PositionError extends Error {
}
exports.PositionError = PositionError;
function attacksTo(square, attacker, board, occupied) {
    return board[attacker].intersect(attacks_1.rookAttacks(square, occupied).intersect(board.rooksAndQueens())
        .union(attacks_1.bishopAttacks(square, occupied).intersect(board.bishopsAndQueens()))
        .union(attacks_1.knightAttacks(square).intersect(board.knight))
        .union(attacks_1.kingAttacks(square).intersect(board.king))
        .union(attacks_1.pawnAttacks(util_1.opposite(attacker), square).intersect(board.pawn)));
}
function kingCastlesTo(color, side) {
    return color === 'white' ? (side === 'a' ? 2 : 6) : (side === 'a' ? 58 : 62);
}
function rookCastlesTo(color, side) {
    return color === 'white' ? (side === 'a' ? 3 : 5) : (side === 'a' ? 59 : 61);
}
class Castles {
    constructor() { }
    static default() {
        const castles = new Castles();
        castles.unmovedRooks = squareSet_1.SquareSet.corners();
        castles.rook = {
            white: { a: 0, h: 7 },
            black: { a: 56, h: 63 },
        };
        castles.path = {
            white: { a: new squareSet_1.SquareSet(0x60, 0), h: new squareSet_1.SquareSet(0, 0xe) },
            black: { a: new squareSet_1.SquareSet(0, 0x60000000), h: new squareSet_1.SquareSet(0, 0x0e000000) },
        };
        return castles;
    }
    static empty() {
        const castles = new Castles();
        castles.unmovedRooks = squareSet_1.SquareSet.empty();
        castles.rook = {
            white: { a: undefined, h: undefined },
            black: { a: undefined, h: undefined },
        };
        castles.path = {
            white: { a: squareSet_1.SquareSet.empty(), h: squareSet_1.SquareSet.empty() },
            black: { a: squareSet_1.SquareSet.empty(), h: squareSet_1.SquareSet.empty() },
        };
        return castles;
    }
    clone() {
        const castles = new Castles();
        castles.unmovedRooks = this.unmovedRooks;
        castles.rook = {
            white: { a: this.rook.white.a, h: this.rook.white.h },
            black: { a: this.rook.black.a, h: this.rook.black.h },
        };
        castles.path = {
            white: { a: this.path.white.a, h: this.path.white.h },
            black: { a: this.path.black.a, h: this.path.black.h },
        };
        return castles;
    }
    add(color, side, king, rook) {
        const kingTo = kingCastlesTo(color, side);
        const rookTo = rookCastlesTo(color, side);
        this.unmovedRooks = this.unmovedRooks.with(rook);
        this.rook[color][side] = rook;
        this.path[color][side] = attacks_1.between(rook, rookTo).with(rookTo)
            .union(attacks_1.between(king, kingTo).with(kingTo))
            .without(king).without(rook);
    }
    static fromSetup(setup) {
        const castles = Castles.empty();
        const rooks = setup.unmovedRooks.intersect(setup.board.rook);
        for (const color of types_1.COLORS) {
            const backrank = squareSet_1.SquareSet.backrank(color);
            const king = setup.board.kingOf(color);
            if (!util_1.defined(king) || !backrank.has(king))
                continue;
            const side = rooks.intersect(setup.board[color]).intersect(backrank);
            const aSide = side.first();
            if (util_1.defined(aSide) && aSide < king)
                castles.add(color, 'a', king, aSide);
            const hSide = side.last();
            if (util_1.defined(hSide) && king < hSide)
                castles.add(color, 'h', king, hSide);
        }
        return castles;
    }
    discardRook(square) {
        if (this.unmovedRooks.has(square)) {
            this.unmovedRooks = this.unmovedRooks.without(square);
            for (const color of types_1.COLORS) {
                for (const side of types_1.CASTLING_SIDES) {
                    if (this.rook[color][side] === square)
                        this.rook[color][side] = undefined;
                }
            }
        }
    }
    discardSide(color) {
        this.unmovedRooks = this.unmovedRooks.diff(squareSet_1.SquareSet.backrank(color));
        this.rook[color].a = undefined;
        this.rook[color].h = undefined;
    }
}
exports.Castles = Castles;
class Position {
    constructor(rules) {
        this.rules = rules;
    }
    kingAttackers(square, attacker, occupied) {
        return attacksTo(square, attacker, this.board, occupied);
    }
    dropDests(_ctx) {
        return squareSet_1.SquareSet.empty();
    }
    playCaptureAt(square, captured) {
        this.halfmoves = 0;
        if (captured.role === 'rook')
            this.castles.discardRook(square);
        if (this.pockets)
            this.pockets[util_1.opposite(captured.color)][captured.role]++;
    }
    ctx() {
        const variantEnd = this.isVariantEnd();
        const king = this.board.kingOf(this.turn);
        if (!util_1.defined(king))
            return { king, blockers: squareSet_1.SquareSet.empty(), checkers: squareSet_1.SquareSet.empty(), variantEnd, mustCapture: false };
        const snipers = attacks_1.rookAttacks(king, squareSet_1.SquareSet.empty()).intersect(this.board.rooksAndQueens())
            .union(attacks_1.bishopAttacks(king, squareSet_1.SquareSet.empty()).intersect(this.board.bishopsAndQueens()))
            .intersect(this.board[util_1.opposite(this.turn)]);
        let blockers = squareSet_1.SquareSet.empty();
        for (const sniper of snipers) {
            const b = attacks_1.between(king, sniper).intersect(this.board.occupied);
            if (!b.moreThanOne())
                blockers = blockers.union(b);
        }
        const checkers = this.kingAttackers(king, util_1.opposite(this.turn), this.board.occupied);
        return {
            king,
            blockers,
            checkers,
            variantEnd,
            mustCapture: false,
        };
    }
    // The following should be identical in all subclasses
    clone() {
        const pos = new this.constructor();
        pos.board = this.board.clone();
        pos.pockets = this.pockets && this.pockets.clone();
        pos.turn = this.turn;
        pos.castles = this.castles.clone();
        pos.epSquare = this.epSquare;
        pos.remainingChecks = this.remainingChecks && this.remainingChecks.clone();
        pos.halfmoves = this.halfmoves;
        pos.fullmoves = this.fullmoves;
        return pos;
    }
    toSetup() {
        return {
            board: this.board.clone(),
            pockets: this.pockets && this.pockets.clone(),
            turn: this.turn,
            unmovedRooks: this.castles.unmovedRooks,
            epSquare: this.hasLegalEp() ? this.epSquare : undefined,
            remainingChecks: this.remainingChecks && this.remainingChecks.clone(),
            halfmoves: Math.min(this.halfmoves, 150),
            fullmoves: Math.min(Math.max(this.fullmoves, 1), 9999),
        };
    }
    isInsufficientMaterial() {
        return types_1.COLORS.every(color => this.hasInsufficientMaterial(color));
    }
    hasDests(ctx) {
        for (const square of this.board[this.turn]) {
            if (this.dests(square, ctx).nonEmpty())
                return true;
        }
        return this.dropDests(ctx).nonEmpty();
    }
    isLegal(uci, ctx) {
        if (types_1.isDrop(uci)) {
            if (!this.pockets || this.pockets[this.turn][uci.role] <= 0)
                return false;
            if (uci.role === 'pawn' && squareSet_1.SquareSet.backranks().has(uci.to))
                return false;
            return this.dropDests(ctx).has(uci.to);
        }
        else {
            if (uci.promotion === 'pawn')
                return false;
            if (uci.promotion === 'king' && this.rules !== 'antichess')
                return false;
            if (!uci.promotion && this.board.pawn.has(uci.from) && squareSet_1.SquareSet.backranks().has(uci.to))
                return false;
            return this.dests(uci.from, ctx).has(uci.to);
        }
    }
    isCheck() {
        const king = this.board.kingOf(this.turn);
        return util_1.defined(king) && this.kingAttackers(king, util_1.opposite(this.turn), this.board.occupied).nonEmpty();
    }
    isEnd() {
        return this.isVariantEnd() || this.isInsufficientMaterial() || !this.hasDests(this.ctx());
    }
    isCheckmate() {
        if (this.isVariantEnd())
            return false;
        const ctx = this.ctx();
        return ctx.checkers.nonEmpty() && !this.hasDests(ctx);
    }
    isStalemate() {
        if (this.isVariantEnd())
            return false;
        const ctx = this.ctx();
        return ctx.checkers.isEmpty() && !this.hasDests(ctx);
    }
    outcome() {
        const variantOutcome = this.variantOutcome();
        if (variantOutcome)
            return variantOutcome;
        else if (this.isCheckmate())
            return { winner: util_1.opposite(this.turn) };
        else if (this.isInsufficientMaterial() || this.isStalemate())
            return { winner: undefined };
        else
            return;
    }
    allDests() {
        const ctx = this.ctx();
        const d = new Map();
        if (ctx.variantEnd)
            return d;
        for (const square of this.board[this.turn]) {
            d.set(square, this.dests(square, ctx));
        }
        return d;
    }
    play(uci) {
        const turn = this.turn, epSquare = this.epSquare;
        this.epSquare = undefined;
        this.halfmoves += 1;
        if (turn === 'black')
            this.fullmoves += 1;
        this.turn = util_1.opposite(turn);
        if (types_1.isDrop(uci)) {
            this.board.set(uci.to, { role: uci.role, color: turn });
            if (this.pockets)
                this.pockets[turn][uci.role]--;
            if (uci.role === 'pawn')
                this.halfmoves = 0;
        }
        else {
            const piece = this.board.take(uci.from);
            if (!piece)
                return;
            let epCapture;
            if (piece.role === 'pawn') {
                this.halfmoves = 0;
                if (uci.to === epSquare) {
                    epCapture = this.board.take(uci.to + (turn === 'white' ? -8 : 8));
                }
                const delta = uci.from - uci.to;
                if (Math.abs(delta) === 16 && 8 <= uci.from && uci.from <= 55) {
                    this.epSquare = (uci.from + uci.to) >> 1;
                }
                if (uci.promotion) {
                    piece.role = uci.promotion;
                    piece.promoted = true;
                }
            }
            else if (piece.role === 'rook') {
                this.castles.discardRook(uci.from);
            }
            else if (piece.role === 'king') {
                const delta = uci.to - uci.from;
                const isCastling = Math.abs(delta) === 2 || this.board[turn].has(uci.to);
                if (isCastling) {
                    const side = delta > 0 ? 'h' : 'a';
                    const rookFrom = this.castles.rook[turn][side];
                    if (util_1.defined(rookFrom)) {
                        const rook = this.board.take(rookFrom);
                        this.board.set(kingCastlesTo(turn, side), piece);
                        if (rook)
                            this.board.set(rookCastlesTo(turn, side), rook);
                    }
                }
                this.castles.discardSide(turn);
                if (isCastling)
                    return;
            }
            const capture = this.board.set(uci.to, piece) || epCapture;
            if (capture)
                this.playCaptureAt(uci.to, capture);
        }
    }
    hasLegalEp() {
        if (!this.epSquare)
            return false;
        const ctx = this.ctx();
        const ourPawns = this.board.pieces(this.turn, 'pawn');
        const candidates = ourPawns.intersect(attacks_1.pawnAttacks(util_1.opposite(this.turn), this.epSquare));
        for (const candidate of candidates) {
            if (this.dests(candidate, ctx).has(this.epSquare))
                return true;
        }
        return false;
    }
}
exports.Position = Position;
class Chess extends Position {
    constructor(rules) {
        super(rules || 'chess');
    }
    static default() {
        const pos = new this();
        pos.board = board_1.Board.default();
        pos.pockets = undefined;
        pos.turn = 'white';
        pos.castles = Castles.default();
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
    }
    static fromSetup(setup) {
        const pos = new this();
        pos.board = setup.board.clone();
        pos.pockets = undefined;
        pos.turn = setup.turn;
        pos.castles = Castles.fromSetup(setup);
        pos.epSquare = pos.validEpSquare(setup.epSquare);
        pos.remainingChecks = undefined;
        pos.halfmoves = setup.halfmoves;
        pos.fullmoves = setup.fullmoves;
        return pos.validate().map(_ => pos);
    }
    clone() {
        return super.clone();
    }
    validate() {
        if (this.board.occupied.isEmpty())
            return result_1.Result.err(new PositionError(IllegalSetup.Empty));
        if (this.board.king.size() !== 2)
            return result_1.Result.err(new PositionError(IllegalSetup.Kings));
        if (!util_1.defined(this.board.kingOf(this.turn)))
            return result_1.Result.err(new PositionError(IllegalSetup.Kings));
        const otherKing = this.board.kingOf(util_1.opposite(this.turn));
        if (!util_1.defined(otherKing))
            return result_1.Result.err(new PositionError(IllegalSetup.Kings));
        if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return result_1.Result.err(new PositionError(IllegalSetup.OppositeCheck));
        }
        if (squareSet_1.SquareSet.backranks().intersects(this.board.pawn)) {
            return result_1.Result.err(new PositionError(IllegalSetup.PawnsOnBackrank));
        }
        return result_1.Result.ok(undefined);
    }
    validEpSquare(square) {
        if (!square)
            return;
        const epRank = this.turn === 'white' ? 5 : 2;
        const forward = this.turn === 'white' ? 8 : -8;
        if ((square >> 3) !== epRank)
            return;
        if (this.board.occupied.has(square + forward))
            return;
        const pawn = square - forward;
        if (!this.board.pawn.has(pawn) || !this.board[util_1.opposite(this.turn)].has(pawn))
            return;
        return square;
    }
    castlingDest(side, ctx) {
        if (!util_1.defined(ctx.king) || ctx.checkers.nonEmpty())
            return squareSet_1.SquareSet.empty();
        const rook = this.castles.rook[this.turn][side];
        if (!util_1.defined(rook))
            return squareSet_1.SquareSet.empty();
        if (this.castles.path[this.turn][side].intersects(this.board.occupied))
            return squareSet_1.SquareSet.empty();
        const kingTo = kingCastlesTo(this.turn, side);
        const kingPath = attacks_1.between(ctx.king, kingTo);
        const occ = this.board.occupied.without(ctx.king);
        for (const sq of kingPath) {
            if (this.kingAttackers(sq, util_1.opposite(this.turn), occ).nonEmpty())
                return squareSet_1.SquareSet.empty();
        }
        const rookTo = rookCastlesTo(this.turn, side);
        const after = this.board.occupied.toggle(ctx.king).toggle(rook).toggle(rookTo);
        if (this.kingAttackers(kingTo, util_1.opposite(this.turn), after).nonEmpty())
            return squareSet_1.SquareSet.empty();
        return squareSet_1.SquareSet.fromSquare(rook);
    }
    canCaptureEp(pawn, ctx) {
        if (!util_1.defined(this.epSquare))
            return false;
        if (!attacks_1.pawnAttacks(this.turn, pawn).has(this.epSquare))
            return false;
        if (!util_1.defined(ctx.king))
            return true;
        const captured = this.epSquare + ((this.turn === 'white') ? -8 : 8);
        const occupied = this.board.occupied.toggle(pawn).toggle(this.epSquare).toggle(captured);
        return !this.kingAttackers(ctx.king, util_1.opposite(this.turn), occupied).intersects(occupied);
    }
    pseudoDests(square, ctx) {
        if (ctx.variantEnd)
            return squareSet_1.SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
            return squareSet_1.SquareSet.empty();
        let pseudo = attacks_1.attacks(piece, square, this.board.occupied);
        if (piece.role === 'pawn') {
            let captureTargets = this.board[util_1.opposite(this.turn)];
            if (util_1.defined(this.epSquare))
                captureTargets = captureTargets.with(this.epSquare);
            pseudo = pseudo.intersect(captureTargets);
            const delta = this.turn === 'white' ? 8 : -8;
            const step = square + delta;
            if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
                pseudo = pseudo.with(step);
                const canDoubleStep = this.turn === 'white' ? (square < 16) : (square >= 64 - 16);
                const doubleStep = step + delta;
                if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                    pseudo = pseudo.with(doubleStep);
                }
            }
            return pseudo;
        }
        else {
            pseudo = pseudo.diff(this.board[this.turn]);
        }
        if (square === ctx.king)
            return pseudo.union(this.castlingDest('a', ctx)).union(this.castlingDest('h', ctx));
        else
            return pseudo;
    }
    dests(square, ctx) {
        if (ctx.variantEnd)
            return squareSet_1.SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
            return squareSet_1.SquareSet.empty();
        let pseudo, legal;
        if (piece.role === 'pawn') {
            pseudo = attacks_1.pawnAttacks(this.turn, square).intersect(this.board[util_1.opposite(this.turn)]);
            const delta = this.turn === 'white' ? 8 : -8;
            const step = square + delta;
            if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
                pseudo = pseudo.with(step);
                const canDoubleStep = this.turn === 'white' ? (square < 16) : (square >= 64 - 16);
                const doubleStep = step + delta;
                if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                    pseudo = pseudo.with(doubleStep);
                }
            }
            if (util_1.defined(this.epSquare) && this.canCaptureEp(square, ctx)) {
                const pawn = this.epSquare - delta;
                if (ctx.checkers.isEmpty() || ctx.checkers.singleSquare() === pawn) {
                    legal = squareSet_1.SquareSet.fromSquare(this.epSquare);
                }
            }
        }
        else if (piece.role === 'bishop')
            pseudo = attacks_1.bishopAttacks(square, this.board.occupied);
        else if (piece.role === 'knight')
            pseudo = attacks_1.knightAttacks(square);
        else if (piece.role === 'rook')
            pseudo = attacks_1.rookAttacks(square, this.board.occupied);
        else if (piece.role === 'queen')
            pseudo = attacks_1.queenAttacks(square, this.board.occupied);
        else
            pseudo = attacks_1.kingAttacks(square);
        pseudo = pseudo.diff(this.board[this.turn]);
        if (util_1.defined(ctx.king)) {
            if (piece.role === 'king') {
                const occ = this.board.occupied.without(square);
                for (const to of pseudo) {
                    if (this.kingAttackers(to, util_1.opposite(this.turn), occ).nonEmpty())
                        pseudo = pseudo.without(to);
                }
                return pseudo.union(this.castlingDest('a', ctx)).union(this.castlingDest('h', ctx));
            }
            if (ctx.checkers.nonEmpty()) {
                const checker = ctx.checkers.singleSquare();
                if (!util_1.defined(checker))
                    return squareSet_1.SquareSet.empty();
                pseudo = pseudo.intersect(attacks_1.between(checker, ctx.king).with(checker));
            }
            if (ctx.blockers.has(square))
                pseudo = pseudo.intersect(attacks_1.ray(square, ctx.king));
        }
        if (legal)
            pseudo = pseudo.union(legal);
        return pseudo;
    }
    isVariantEnd() {
        return false;
    }
    variantOutcome() {
        return;
    }
    hasInsufficientMaterial(color) {
        if (this.board[color].intersect(this.board.pawn.union(this.board.rooksAndQueens())).nonEmpty())
            return false;
        if (this.board[color].intersects(this.board.knight)) {
            return this.board[color].size() <= 2 &&
                this.board[util_1.opposite(color)].diff(this.board.king).diff(this.board.queen).isEmpty();
        }
        if (this.board[color].intersects(this.board.bishop)) {
            const sameColor = !this.board.bishop.intersects(squareSet_1.SquareSet.darkSquares()) ||
                !this.board.bishop.intersects(squareSet_1.SquareSet.lightSquares());
            return sameColor && this.board[util_1.opposite(color)].diff(this.board.king).diff(this.board.rook).diff(this.board.queen).isEmpty();
        }
        return true;
    }
}
exports.Chess = Chess;

},{"./attacks":20,"./board":21,"./squareSet":26,"./types":27,"./util":28,"@badrap/result":1}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("@badrap/result");
const types_1 = require("./types");
const squareSet_1 = require("./squareSet");
const board_1 = require("./board");
const setup_1 = require("./setup");
const util_1 = require("./util");
exports.INITIAL_BOARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
exports.INITIAL_EPD = exports.INITIAL_BOARD_FEN + ' w KQkq -';
exports.INITIAL_FEN = exports.INITIAL_EPD + ' 0 1';
exports.EMPTY_BOARD_FEN = '8/8/8/8/8/8/8/8';
exports.EMPTY_EPD = exports.EMPTY_BOARD_FEN + ' w - -';
exports.EMPTY_FEN = exports.EMPTY_EPD + ' 0 1';
var InvalidFen;
(function (InvalidFen) {
    InvalidFen["Fen"] = "ERR_FEN";
    InvalidFen["Board"] = "ERR_BOARD";
    InvalidFen["Pockets"] = "ERR_POCKETS";
    InvalidFen["Turn"] = "ERR_TURN";
    InvalidFen["Castling"] = "ERR_CASTLING";
    InvalidFen["EpSquare"] = "ERR_EP_SQUARE";
    InvalidFen["RemainingChecks"] = "ERR_REMAINING_CHECKS";
    InvalidFen["Halfmoves"] = "ERR_HALFMOVES";
    InvalidFen["Fullmoves"] = "ERR_FULLMOVES";
})(InvalidFen = exports.InvalidFen || (exports.InvalidFen = {}));
class FenError extends Error {
}
exports.FenError = FenError;
function nthIndexOf(haystack, needle, n) {
    let index = haystack.indexOf(needle);
    while (n-- > 0) {
        if (index === -1)
            break;
        index = haystack.indexOf(needle, index + needle.length);
    }
    return index;
}
function parseSmallUint(str) {
    return /^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined;
}
function charToPiece(ch) {
    const role = util_1.charToRole(ch);
    return role && { role, color: ch.toLowerCase() === ch ? 'black' : 'white' };
}
function parseBoardFen(boardPart) {
    const board = board_1.Board.empty();
    let rank = 7;
    let file = 0;
    for (let i = 0; i < boardPart.length; i++) {
        const c = boardPart[i];
        if (c === '/' && file === 8) {
            file = 0;
            rank--;
        }
        else {
            const step = parseInt(c, 10);
            if (step)
                file += step;
            else {
                if (file >= 8 || rank < 0)
                    return result_1.Result.err(new FenError(InvalidFen.Board));
                const square = file + rank * 8;
                const piece = charToPiece(c);
                if (!piece)
                    return result_1.Result.err(new FenError(InvalidFen.Board));
                if (boardPart[i + 1] === '~') {
                    piece.promoted = true;
                    i++;
                }
                board.set(square, piece);
                file++;
            }
        }
    }
    if (rank !== 0 || file !== 8)
        return result_1.Result.err(new FenError(InvalidFen.Board));
    return result_1.Result.ok(board);
}
exports.parseBoardFen = parseBoardFen;
function parsePockets(pocketPart) {
    if (pocketPart.length > 64)
        return result_1.Result.err(new FenError(InvalidFen.Pockets));
    const pockets = setup_1.Material.empty();
    for (const c of pocketPart) {
        const piece = charToPiece(c);
        if (!piece)
            return result_1.Result.err(new FenError(InvalidFen.Pockets));
        pockets[piece.color][piece.role]++;
    }
    return result_1.Result.ok(pockets);
}
exports.parsePockets = parsePockets;
function parseCastlingFen(board, castlingPart) {
    let unmovedRooks = squareSet_1.SquareSet.empty();
    if (castlingPart === '-')
        return result_1.Result.ok(unmovedRooks);
    if (!/^[KQABCDEFGH]{0,2}[kqabcdefgh]{0,2}$/.test(castlingPart)) {
        return result_1.Result.err(new FenError(InvalidFen.Castling));
    }
    for (const c of castlingPart) {
        const lower = c.toLowerCase();
        const color = c === lower ? 'black' : 'white';
        const backrank = squareSet_1.SquareSet.backrank(color).intersect(board[color]);
        let candidates;
        if (lower === 'q')
            candidates = backrank;
        else if (lower === 'k')
            candidates = backrank.reversed();
        else
            candidates = squareSet_1.SquareSet.fromSquare(lower.charCodeAt(0) - 'a'.charCodeAt(0)).intersect(backrank);
        for (const square of candidates) {
            if (board.king.has(square) && !board.promoted.has(square))
                break;
            if (board.rook.has(square)) {
                unmovedRooks = unmovedRooks.with(square);
                break;
            }
        }
    }
    return result_1.Result.ok(unmovedRooks);
}
exports.parseCastlingFen = parseCastlingFen;
function parseRemainingChecks(part) {
    const parts = part.split('+');
    if (parts.length === 3 && parts[0] === '') {
        const white = parseSmallUint(parts[1]);
        const black = parseSmallUint(parts[2]);
        if (!util_1.defined(white) || white > 3 || !util_1.defined(black) || black > 3)
            return result_1.Result.err(new FenError(InvalidFen.RemainingChecks));
        return result_1.Result.ok(new setup_1.RemainingChecks(3 - white, 3 - black));
    }
    else if (parts.length === 2) {
        const white = parseSmallUint(parts[0]);
        const black = parseSmallUint(parts[1]);
        if (!util_1.defined(white) || white > 3 || !util_1.defined(black) || black > 3)
            return result_1.Result.err(new FenError(InvalidFen.RemainingChecks));
        return result_1.Result.ok(new setup_1.RemainingChecks(white, black));
    }
    else
        return result_1.Result.err(new FenError(InvalidFen.RemainingChecks));
}
exports.parseRemainingChecks = parseRemainingChecks;
function parseFen(fen) {
    const parts = fen.split(' ');
    const boardPart = parts.shift();
    // Board and pockets
    let board, pockets = result_1.Result.ok(undefined);
    if (boardPart.endsWith(']')) {
        const pocketStart = boardPart.indexOf('[');
        if (pocketStart === -1)
            return result_1.Result.err(new FenError(InvalidFen.Fen));
        board = parseBoardFen(boardPart.substr(0, pocketStart));
        pockets = parsePockets(boardPart.substr(pocketStart + 1, boardPart.length - 1 - pocketStart - 1));
    }
    else {
        const pocketStart = nthIndexOf(boardPart, '/', 7);
        if (pocketStart === -1)
            board = parseBoardFen(boardPart);
        else {
            board = parseBoardFen(boardPart.substr(0, pocketStart));
            pockets = parsePockets(boardPart.substr(pocketStart + 1));
        }
    }
    // Turn
    let turn;
    const turnPart = parts.shift();
    if (!util_1.defined(turnPart) || turnPart === 'w')
        turn = 'white';
    else if (turnPart === 'b')
        turn = 'black';
    else
        return result_1.Result.err(new FenError(InvalidFen.Turn));
    return board.chain(board => {
        // Castling
        const castlingPart = parts.shift();
        const unmovedRooks = util_1.defined(castlingPart) ? parseCastlingFen(board, castlingPart) : result_1.Result.ok(squareSet_1.SquareSet.empty());
        // En passant square
        const epPart = parts.shift();
        let epSquare;
        if (util_1.defined(epPart) && epPart !== '-') {
            epSquare = util_1.parseSquare(epPart);
            if (!util_1.defined(epSquare))
                return result_1.Result.err(new FenError(InvalidFen.EpSquare));
        }
        // Halfmoves or remaining checks
        let halfmovePart = parts.shift();
        let earlyRemainingChecks;
        if (util_1.defined(halfmovePart) && halfmovePart.includes('+')) {
            earlyRemainingChecks = parseRemainingChecks(halfmovePart);
            halfmovePart = parts.shift();
        }
        const halfmoves = util_1.defined(halfmovePart) ? parseSmallUint(halfmovePart) : 0;
        if (!util_1.defined(halfmoves))
            return result_1.Result.err(new FenError(InvalidFen.Halfmoves));
        const fullmovesPart = parts.shift();
        const fullmoves = util_1.defined(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
        if (!util_1.defined(fullmoves))
            return result_1.Result.err(new FenError(InvalidFen.Fullmoves));
        const remainingChecksPart = parts.shift();
        let remainingChecks = result_1.Result.ok(undefined);
        if (util_1.defined(remainingChecksPart)) {
            if (util_1.defined(earlyRemainingChecks))
                return result_1.Result.err(new FenError(InvalidFen.RemainingChecks));
            remainingChecks = parseRemainingChecks(remainingChecksPart);
        }
        else if (util_1.defined(earlyRemainingChecks)) {
            remainingChecks = earlyRemainingChecks;
        }
        ;
        if (parts.length)
            return result_1.Result.err(new FenError(InvalidFen.Fen));
        return pockets.chain(pockets => unmovedRooks.chain(unmovedRooks => remainingChecks.map(remainingChecks => {
            return {
                board,
                pockets,
                turn,
                unmovedRooks,
                remainingChecks,
                epSquare,
                halfmoves,
                fullmoves: Math.max(1, fullmoves)
            };
        })));
    });
}
exports.parseFen = parseFen;
function parsePiece(str) {
    if (!str)
        return;
    const piece = charToPiece(str[0]);
    if (!piece)
        return;
    if (str.length === 2 && str[1] === '~')
        piece.promoted = true;
    else if (str.length > 1)
        return;
    return piece;
}
exports.parsePiece = parsePiece;
function makePiece(piece, opts) {
    let r = util_1.roleToChar(piece.role);
    if (piece.color === 'white')
        r = r.toUpperCase();
    if (opts && opts.promoted && piece.promoted)
        r += '~';
    return r;
}
exports.makePiece = makePiece;
function makeBoardFen(board, opts) {
    let fen = '';
    let empty = 0;
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = file + rank * 8;
            const piece = board.get(square);
            if (!piece)
                empty++;
            else {
                if (empty) {
                    fen += empty;
                    empty = 0;
                }
                fen += makePiece(piece, opts);
            }
            if (file === 7) {
                if (empty) {
                    fen += empty;
                    empty = 0;
                }
                if (rank !== 0)
                    fen += '/';
            }
        }
    }
    return fen;
}
exports.makeBoardFen = makeBoardFen;
function makePocket(material) {
    return types_1.ROLES.map(role => util_1.roleToChar(role).repeat(material[role])).join('');
}
function makePockets(pocket) {
    return makePocket(pocket.white).toUpperCase() + makePocket(pocket.black);
}
exports.makePockets = makePockets;
function makeCastlingFen(board, unmovedRooks, opts) {
    const shredder = opts && opts.shredder;
    let fen = '';
    for (const color of types_1.COLORS) {
        const backrank = squareSet_1.SquareSet.backrank(color);
        const king = board.kingOf(color);
        if (!util_1.defined(king) || !backrank.has(king))
            continue;
        const candidates = board.pieces(color, 'rook').intersect(backrank);
        for (const rook of unmovedRooks.intersect(candidates).reversed()) {
            if (!shredder && rook === candidates.first() && rook < king) {
                fen += color === 'white' ? 'Q' : 'q';
            }
            else if (!shredder && rook === candidates.last() && king < rook) {
                fen += color === 'white' ? 'K' : 'k';
            }
            else {
                fen += (color === 'white' ? 'ABCDEFGH' : 'abcdefgh')[rook & 0x7];
            }
        }
    }
    return fen || '-';
}
exports.makeCastlingFen = makeCastlingFen;
function makeRemainingChecks(checks) {
    return `${checks.white}+${checks.black}`;
}
exports.makeRemainingChecks = makeRemainingChecks;
function makeFen(setup, opts) {
    return [
        makeBoardFen(setup.board, opts) + (setup.pockets ? `[${makePockets(setup.pockets)}]` : ''),
        setup.turn[0],
        makeCastlingFen(setup.board, setup.unmovedRooks, opts),
        util_1.defined(setup.epSquare) ? util_1.makeSquare(setup.epSquare) : '-',
        ...(setup.remainingChecks ? [makeRemainingChecks(setup.remainingChecks)] : []),
        ...(opts && opts.epd ? [] : [setup.halfmoves, setup.fullmoves])
    ].join(' ');
}
exports.makeFen = makeFen;

},{"./board":21,"./setup":25,"./squareSet":26,"./types":27,"./util":28,"@badrap/result":1}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const util_1 = require("./util");
const squareSet_1 = require("./squareSet");
const attacks_1 = require("./attacks");
function makeSanWithoutSuffix(pos, uci) {
    let san = '';
    if (types_1.isDrop(uci)) {
        if (uci.role !== 'pawn')
            san = util_1.roleToChar(uci.role).toUpperCase();
        san += '@' + util_1.makeSquare(uci.to);
    }
    else {
        const role = pos.board.getRole(uci.from);
        if (!role)
            return '--';
        if (role === 'king' && (pos.board[pos.turn].has(uci.to) || Math.abs(uci.to - uci.from) === 2)) {
            san = uci.to > uci.from ? 'O-O' : 'O-O-O';
        }
        else {
            const capture = pos.board.occupied.has(uci.to) || (role === 'pawn' && (uci.from & 0x7) !== (uci.to & 0x7));
            if (role !== 'pawn') {
                san = util_1.roleToChar(role).toUpperCase();
                // Disambiguation
                let others;
                if (role === 'king')
                    others = attacks_1.kingAttacks(uci.to).intersect(pos.board.king);
                else if (role === 'queen')
                    others = attacks_1.queenAttacks(uci.to, pos.board.occupied).intersect(pos.board.queen);
                else if (role === 'rook')
                    others = attacks_1.rookAttacks(uci.to, pos.board.occupied).intersect(pos.board.rook);
                else if (role === 'bishop')
                    others = attacks_1.bishopAttacks(uci.to, pos.board.occupied).intersect(pos.board.bishop);
                else
                    others = attacks_1.knightAttacks(uci.to).intersect(pos.board.knight);
                others = others.intersect(pos.board[pos.turn]).without(uci.from);
                if (others.nonEmpty()) {
                    const ctx = pos.ctx();
                    for (const from of others) {
                        if (!pos.dests(from, ctx).has(uci.to))
                            others = others.without(from);
                    }
                    if (others.nonEmpty()) {
                        let row = false;
                        let column = others.intersects(squareSet_1.SquareSet.fromRank(uci.from >> 3));
                        if (others.intersects(squareSet_1.SquareSet.fromFile(uci.from & 0x7)))
                            row = true;
                        else
                            column = true;
                        if (column)
                            san += 'abcdefgh'[uci.from & 0x7];
                        if (row)
                            san += '12345678'[uci.from >> 3];
                    }
                }
            }
            else if (capture)
                san = 'abcdefgh'[uci.from & 0x7];
            if (capture)
                san += 'x';
            san += util_1.makeSquare(uci.to);
            if (uci.promotion)
                san += '=' + util_1.roleToChar(uci.promotion).toUpperCase();
        }
    }
    return san;
}
function makeSanAndPlay(pos, uci) {
    const san = makeSanWithoutSuffix(pos, uci);
    pos.play(uci);
    const outcome = pos.outcome();
    if (outcome && outcome.winner)
        return san + '#';
    else if (pos.isCheck())
        return san + '+';
    else
        return san;
}
exports.makeSanAndPlay = makeSanAndPlay;
function makeSanVariation(pos, variation) {
    pos = pos.clone();
    let line = '';
    for (let i = 0; i < variation.length; i++) {
        if (i !== 0)
            line += ' ';
        if (pos.turn === 'white')
            line += pos.fullmoves + '. ';
        else if (i === 0)
            line = pos.fullmoves + '... ';
        const san = makeSanWithoutSuffix(pos, variation[i]);
        pos.play(variation[i]);
        line += san;
        if (san === '--')
            return line;
        let over = false;
        if (i === variation.length - 1) {
            const outcome = pos.outcome();
            over = !!(outcome && outcome.winner);
        }
        if (over)
            line += '#';
        else if (pos.isCheck())
            line += '+';
    }
    return line;
}
exports.makeSanVariation = makeSanVariation;
function makeSan(pos, uci) {
    return makeSanAndPlay(pos.clone(), uci);
}
exports.makeSan = makeSan;

},{"./attacks":20,"./squareSet":26,"./types":27,"./util":28}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const squareSet_1 = require("./squareSet");
const board_1 = require("./board");
class MaterialSide {
    constructor() { }
    static empty() {
        const m = new MaterialSide();
        for (const role of types_1.ROLES)
            m[role] = 0;
        return m;
    }
    clone() {
        const m = new MaterialSide();
        for (const role of types_1.ROLES)
            m[role] = this[role];
        return m;
    }
    nonEmpty() {
        return types_1.ROLES.some(role => this[role] > 0);
    }
    isEmpty() {
        return !this.nonEmpty();
    }
    hasPawns() {
        return this.pawn > 0;
    }
    hasNonPawns() {
        return this.knight > 0 || this.bishop > 0 || this.rook > 0 || this.queen > 0 || this.king > 0;
    }
    count() {
        return this.pawn + this.knight + this.bishop + this.rook + this.queen + this.king;
    }
}
exports.MaterialSide = MaterialSide;
class Material {
    constructor(white, black) {
        this.white = white;
        this.black = black;
    }
    static empty() {
        return new Material(MaterialSide.empty(), MaterialSide.empty());
    }
    clone() {
        return new Material(this.white.clone(), this.black.clone());
    }
    count() {
        return this.white.count() + this.black.count();
    }
    isEmpty() {
        return this.white.isEmpty() && this.black.isEmpty();
    }
    nonEmpty() {
        return !this.isEmpty();
    }
    hasPawns() {
        return this.white.hasPawns() || this.black.hasPawns();
    }
    hasNonPawns() {
        return this.white.hasNonPawns() || this.black.hasNonPawns();
    }
}
exports.Material = Material;
class RemainingChecks {
    constructor(white, black) {
        this.white = white;
        this.black = black;
    }
    static default() {
        return new RemainingChecks(3, 3);
    }
    clone() {
        return new RemainingChecks(this.white, this.black);
    }
}
exports.RemainingChecks = RemainingChecks;
function defaultSetup() {
    return {
        board: board_1.Board.default(),
        pockets: undefined,
        turn: 'white',
        unmovedRooks: squareSet_1.SquareSet.corners(),
        epSquare: undefined,
        remainingChecks: undefined,
        halfmoves: 0,
        fullmoves: 1,
    };
}
exports.defaultSetup = defaultSetup;

},{"./board":21,"./squareSet":26,"./types":27}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function popcnt32(n) {
    n = n - ((n >>> 1) & 1431655765);
    n = (n & 858993459) + ((n >>> 2) & 858993459);
    return ((n + (n >>> 4) & 252645135) * 16843009) >> 24;
}
function bswap32(n) {
    n = (n >>> 8) & 16711935 | ((n & 16711935) << 8);
    return (n >>> 16) & 0xffff | ((n & 0xffff) << 16);
}
function rbit32(n) {
    n = ((n >>> 1) & 1431655765) | ((n & 1431655765) << 1);
    n = ((n >>> 2) & 858993459) | ((n & 858993459) << 2);
    n = ((n >>> 4) & 252645135) | ((n & 252645135) << 4);
    n = ((n >>> 8) & 16711935) | ((n & 16711935) << 8);
    n = ((n >>> 16) & 65535) | ((n & 65535) << 16);
    return n;
}
class SquareSet {
    constructor(lo, hi) {
        this.lo = lo;
        this.hi = hi;
        this.lo = lo | 0;
        this.hi = hi | 0;
    }
    static fromSquare(square) {
        return square >= 32 ?
            new SquareSet(0, 1 << (square - 32)) :
            new SquareSet(1 << square, 0);
    }
    static fromRank(rank) {
        return new SquareSet(0xff, 0).shl64(8 * rank);
    }
    static fromFile(file) {
        return new SquareSet(16843009 << file, 16843009 << file);
    }
    static empty() {
        return new SquareSet(0, 0);
    }
    static full() {
        return new SquareSet(4294967295, 4294967295);
    }
    static corners() {
        return new SquareSet(0x81, 2164260864);
    }
    static center() {
        return new SquareSet(402653184, 0x18);
    }
    static backranks() {
        return new SquareSet(0xff, 4278190080);
    }
    static backrank(color) {
        return color === 'white' ? new SquareSet(0xff, 0) : new SquareSet(0, 4278190080);
    }
    static lightSquares() {
        return new SquareSet(1437226410, 1437226410);
    }
    static darkSquares() {
        return new SquareSet(2857740885, 2857740885);
    }
    complement() {
        return new SquareSet(~this.lo, ~this.hi);
    }
    xor(other) {
        return new SquareSet(this.lo ^ other.lo, this.hi ^ other.hi);
    }
    union(other) {
        return new SquareSet(this.lo | other.lo, this.hi | other.hi);
    }
    intersect(other) {
        return new SquareSet(this.lo & other.lo, this.hi & other.hi);
    }
    diff(other) {
        return new SquareSet(this.lo & ~other.lo, this.hi & ~other.hi);
    }
    intersects(other) {
        return this.intersect(other).nonEmpty();
    }
    isDisjoint(other) {
        return this.intersect(other).isEmpty();
    }
    supersetOf(other) {
        return other.diff(this).isEmpty();
    }
    subsetOf(other) {
        return this.diff(other).isEmpty();
    }
    shr64(shift) {
        if (shift >= 64)
            return SquareSet.empty();
        if (shift >= 32)
            return new SquareSet(this.hi >>> (shift - 32), 0);
        if (shift > 0)
            return new SquareSet((this.lo >>> shift) ^ (this.hi << (32 - shift)), this.hi >>> shift);
        return this;
    }
    shl64(shift) {
        if (shift >= 64)
            return SquareSet.empty();
        if (shift >= 32)
            return new SquareSet(0, this.lo << (shift - 32));
        if (shift > 0)
            return new SquareSet(this.lo << shift, (this.hi << shift) ^ (this.lo >>> (32 - shift)));
        return this;
    }
    bswap64() {
        return new SquareSet(bswap32(this.hi), bswap32(this.lo));
    }
    rbit64() {
        return new SquareSet(rbit32(this.hi), rbit32(this.lo));
    }
    equals(other) {
        return this.lo === other.lo && this.hi === other.hi;
    }
    size() {
        return popcnt32(this.lo) + popcnt32(this.hi);
    }
    isEmpty() {
        return this.lo === 0 && this.hi === 0;
    }
    nonEmpty() {
        return this.lo !== 0 || this.hi !== 0;
    }
    has(square) {
        return !!(square >= 32 ? this.hi & (1 << (square - 32)) : this.lo & (1 << square));
    }
    set(square, on) {
        return on ? this.with(square) : this.without(square);
    }
    with(square) {
        return square >= 32 ?
            new SquareSet(this.lo, this.hi | (1 << (square - 32))) :
            new SquareSet(this.lo | (1 << square), this.hi);
    }
    without(square) {
        return square >= 32 ?
            new SquareSet(this.lo, this.hi & ~(1 << (square - 32))) :
            new SquareSet(this.lo & ~(1 << square), this.hi);
    }
    toggle(square) {
        return square >= 32 ?
            new SquareSet(this.lo, this.hi ^ (1 << (square - 32))) :
            new SquareSet(this.lo ^ (1 << square), this.hi);
    }
    last() {
        if (this.hi !== 0)
            return 63 - Math.clz32(this.hi);
        if (this.lo !== 0)
            return 31 - Math.clz32(this.lo);
        return;
    }
    first() {
        if (this.lo !== 0)
            return 31 - Math.clz32(this.lo & -this.lo);
        if (this.hi !== 0)
            return 63 - Math.clz32(this.hi & -this.hi);
        return;
    }
    moreThanOne() {
        return !!((this.hi && this.lo) || this.lo & (this.lo - 1) || this.hi & (this.hi - 1));
    }
    singleSquare() {
        return this.moreThanOne() ? undefined : this.last();
    }
    isSingleSquare() {
        return this.nonEmpty() && !this.moreThanOne();
    }
    [Symbol.iterator]() {
        let lo = this.lo;
        let hi = this.hi;
        return {
            next() {
                if (lo) {
                    const idx = 31 - Math.clz32(lo & -lo);
                    lo ^= 1 << idx;
                    return { value: idx, done: false };
                }
                if (hi) {
                    const idx = 31 - Math.clz32(hi & -hi);
                    hi ^= 1 << idx;
                    return { value: 32 + idx, done: false };
                }
                return { done: true };
            }
        };
    }
    reversed() {
        let lo = this.lo;
        let hi = this.hi;
        return {
            [Symbol.iterator]() {
                return {
                    next() {
                        if (hi) {
                            const idx = 31 - Math.clz32(hi);
                            hi ^= 1 << idx;
                            return { value: 32 + idx, done: false };
                        }
                        if (lo) {
                            const idx = 31 - Math.clz32(lo);
                            lo ^= 1 << idx;
                            return { value: idx, done: false };
                        }
                        return { done: true };
                    }
                };
            }
        };
    }
    minus64(other) {
        const lo = this.lo - other.lo;
        const c = ((lo & other.lo & 1) + (other.lo >>> 1) + (lo >>> 1)) >>> 31;
        return new SquareSet(lo, this.hi - (other.hi + c));
    }
}
exports.SquareSet = SquareSet;

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLORS = ['white', 'black'];
exports.ROLES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
exports.CASTLING_SIDES = ['a', 'h'];
function isDrop(v) {
    return 'role' in v;
}
exports.isDrop = isDrop;
function isMove(v) {
    return 'from' in v;
}
exports.isMove = isMove;
exports.RULES = ['chess', 'antichess', 'kingofthehill', '3check', 'atomic', 'horde', 'racingkings', 'crazyhouse'];

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
function defined(v) {
    return typeof v !== 'undefined';
}
exports.defined = defined;
function opposite(color) {
    return color === 'white' ? 'black' : 'white';
}
exports.opposite = opposite;
function squareDist(a, b) {
    const x1 = a & 0x7, x2 = b & 0x7;
    const y1 = a >> 3, y2 = b >> 3;
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}
exports.squareDist = squareDist;
function squareRank(square) {
    return square >> 3;
}
exports.squareRank = squareRank;
function squareFile(square) {
    return square & 0x7;
}
exports.squareFile = squareFile;
function roleToChar(role) {
    switch (role) {
        case 'pawn': return 'p';
        case 'knight': return 'n';
        case 'bishop': return 'b';
        case 'rook': return 'r';
        case 'queen': return 'q';
        case 'king': return 'k';
    }
}
exports.roleToChar = roleToChar;
function charToRole(ch) {
    switch (ch) {
        case 'P':
        case 'p': return 'pawn';
        case 'N':
        case 'n': return 'knight';
        case 'B':
        case 'b': return 'bishop';
        case 'R':
        case 'r': return 'rook';
        case 'Q':
        case 'q': return 'queen';
        case 'K':
        case 'k': return 'king';
        default: return;
    }
}
exports.charToRole = charToRole;
function parseSquare(str) {
    if (!/^[a-h][1-8]$/.test(str))
        return;
    return str.charCodeAt(0) - 'a'.charCodeAt(0) + 8 * (str.charCodeAt(1) - '1'.charCodeAt(0));
}
exports.parseSquare = parseSquare;
function makeSquare(square) {
    return 'abcdefgh'[square & 0x7] + '12345678'[square >> 3];
}
exports.makeSquare = makeSquare;
function parseUci(str) {
    if (str[1] === '@' && str.length === 4) {
        const role = charToRole(str[0]);
        const to = parseSquare(str.slice(2));
        if (role && defined(to))
            return { role, to };
    }
    else if (str.length === 4 || str.length === 5) {
        const from = parseSquare(str.slice(0, 2));
        const to = parseSquare(str.slice(2, 4));
        let promotion;
        if (str.length === 5) {
            promotion = charToRole(str[4]);
            if (!promotion)
                return;
        }
        if (defined(from) && defined(to))
            return { from, to, promotion };
    }
    return;
}
exports.parseUci = parseUci;
function makeUci(uci) {
    if (types_1.isDrop(uci))
        return `${roleToChar(uci.role).toUpperCase()}@${makeSquare(uci.to)}`;
    return makeSquare(uci.from) + makeSquare(uci.to) + (uci.promotion ? roleToChar(uci.promotion) : '');
}
exports.makeUci = makeUci;

},{"./types":27}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("@badrap/result");
const types_1 = require("./types");
const util_1 = require("./util");
const attacks_1 = require("./attacks");
const squareSet_1 = require("./squareSet");
const board_1 = require("./board");
const setup_1 = require("./setup");
const chess_1 = require("./chess");
exports.PositionError = chess_1.PositionError;
exports.Position = chess_1.Position;
exports.IllegalSetup = chess_1.IllegalSetup;
exports.Castles = chess_1.Castles;
exports.Chess = chess_1.Chess;
class Crazyhouse extends chess_1.Chess {
    constructor() {
        super('crazyhouse');
    }
    static default() {
        const pos = super.default();
        pos.pockets = setup_1.Material.empty();
        return pos;
    }
    static fromSetup(setup) {
        return super.fromSetup(setup).map(pos => {
            pos.pockets = setup.pockets ? setup.pockets.clone() : setup_1.Material.empty();
            return pos;
        });
    }
    validate() {
        return super.validate().chain(_ => {
            if (this.pockets && (this.pockets.white.king > 0 || this.pockets.black.king > 0)) {
                return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Kings));
            }
            if ((this.pockets ? this.pockets.count() : 0) + this.board.occupied.size() > 64) {
                return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Variant));
            }
            return result_1.Result.ok(undefined);
        });
    }
    clone() {
        return super.clone();
    }
    hasInsufficientMaterial(color) {
        // No material can leave the game, but we can easily check this for
        // custom positions.
        if (!this.pockets)
            return super.hasInsufficientMaterial(color);
        return this.board.occupied.size() + this.pockets.count() <= 3 &&
            this.board.pawn.isEmpty() &&
            this.board.promoted.isEmpty() &&
            this.board.rooksAndQueens().isEmpty() &&
            this.pockets.white.pawn <= 0 &&
            this.pockets.black.pawn <= 0 &&
            this.pockets.white.rook <= 0 &&
            this.pockets.black.rook <= 0 &&
            this.pockets.white.queen <= 0 &&
            this.pockets.black.queen <= 0;
    }
    dropDests(ctx) {
        const mask = this.board.occupied.complement().intersect((this.pockets && this.pockets[this.turn].hasNonPawns()) ? squareSet_1.SquareSet.full() :
            (this.pockets && this.pockets[this.turn].pawn) ? squareSet_1.SquareSet.backranks().complement() :
                squareSet_1.SquareSet.empty());
        if (util_1.defined(ctx.king) && ctx.checkers.nonEmpty()) {
            const checker = ctx.checkers.singleSquare();
            if (!util_1.defined(checker))
                return squareSet_1.SquareSet.empty();
            return mask.intersect(attacks_1.between(checker, ctx.king));
        }
        else
            return mask;
    }
}
exports.Crazyhouse = Crazyhouse;
class Atomic extends chess_1.Chess {
    constructor() {
        super('atomic');
    }
    static default() {
        return super.default();
    }
    static fromSetup(setup) {
        return super.fromSetup(setup);
    }
    clone() {
        return super.clone();
    }
    validate() {
        // Like chess, but allow our king to be missing.
        if (this.board.occupied.isEmpty())
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Empty));
        if (this.board.king.size() > 2)
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Kings));
        const otherKing = this.board.kingOf(util_1.opposite(this.turn));
        if (!util_1.defined(otherKing))
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Kings));
        if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.OppositeCheck));
        }
        if (squareSet_1.SquareSet.backranks().intersects(this.board.pawn)) {
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.PawnsOnBackrank));
        }
        return result_1.Result.ok(undefined);
    }
    kingAttackers(square, attacker, occupied) {
        if (attacks_1.kingAttacks(square).intersects(this.board.pieces(attacker, 'king'))) {
            return squareSet_1.SquareSet.empty();
        }
        return super.kingAttackers(square, attacker, occupied);
    }
    playCaptureAt(square, captured) {
        super.playCaptureAt(square, captured);
        this.board.take(square);
        for (const explode of attacks_1.kingAttacks(square).intersect(this.board.occupied).diff(this.board.pawn)) {
            const piece = this.board.take(explode);
            if (piece && piece.role === 'rook')
                this.castles.discardRook(explode);
            if (piece && piece.role === 'king')
                this.castles.discardSide(piece.color);
        }
    }
    hasInsufficientMaterial(color) {
        // Remaining material does not matter if the enemy king is already
        // exploded.
        if (this.board.pieces(util_1.opposite(color), 'king').isEmpty())
            return false;
        // Bare king cannot mate.
        if (this.board[color].diff(this.board.king).isEmpty())
            return true;
        // As long as the enemy king is not alone, there is always a chance their
        // own pieces explode next to it.
        if (this.board[util_1.opposite(color)].diff(this.board.king).nonEmpty()) {
            // Unless there are only bishops that cannot explode each other.
            if (this.board.occupied.equals(this.board.bishop.union(this.board.king))) {
                if (!this.board.bishop.intersect(this.board.white).intersects(squareSet_1.SquareSet.darkSquares())) {
                    return !this.board.bishop.intersect(this.board.black).intersects(squareSet_1.SquareSet.lightSquares());
                }
                if (!this.board.bishop.intersect(this.board.white).intersects(squareSet_1.SquareSet.lightSquares())) {
                    return !this.board.bishop.intersect(this.board.black).intersects(squareSet_1.SquareSet.darkSquares());
                }
            }
            return false;
        }
        // Queen or pawn (future queen) can give mate against bare king.
        if (this.board.queen.nonEmpty() || this.board.pawn.nonEmpty())
            return false;
        // Single knight, bishop or rook cannot mate against bare king.
        if (this.board.knight.union(this.board.bishop).union(this.board.rook).isSingleSquare())
            return true;
        // If only knights, more than two are required to mate bare king.
        if (this.board.occupied.equals(this.board.knight.union(this.board.king))) {
            return this.board.knight.size() <= 2;
        }
        return false;
    }
    dests(square, ctx) {
        let dests = squareSet_1.SquareSet.empty();
        for (const to of this.pseudoDests(square, ctx)) {
            const after = this.clone();
            after.play({ from: square, to });
            const ourKing = after.board.kingOf(this.turn);
            if (util_1.defined(ourKing) && (!util_1.defined(after.board.kingOf(after.turn)) || after.kingAttackers(ourKing, after.turn, after.board.occupied).isEmpty())) {
                dests = dests.with(to);
            }
        }
        return dests;
    }
    isVariantEnd() {
        return !!this.variantOutcome();
    }
    variantOutcome() {
        for (const color of types_1.COLORS) {
            if (this.board.pieces(color, 'king').isEmpty())
                return { winner: util_1.opposite(color) };
        }
        return;
    }
}
exports.Atomic = Atomic;
class Antichess extends chess_1.Chess {
    constructor() {
        super('antichess');
    }
    static default() {
        const pos = new this();
        pos.board = board_1.Board.default();
        pos.turn = 'white';
        pos.castles = chess_1.Castles.empty();
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
    }
    static fromSetup(setup) {
        return super.fromSetup(setup).map(pos => {
            pos.castles = chess_1.Castles.empty();
            return pos;
        });
    }
    clone() {
        return super.clone();
    }
    validate() {
        if (this.board.occupied.isEmpty())
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Empty));
        if (squareSet_1.SquareSet.backranks().intersects(this.board.pawn))
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.PawnsOnBackrank));
        return result_1.Result.ok(undefined);
    }
    kingAttackers(_square, _attacker, _occupied) {
        return squareSet_1.SquareSet.empty();
    }
    ctx() {
        const ctx = super.ctx();
        const enemy = this.board[util_1.opposite(this.turn)];
        for (const from of this.board[this.turn]) {
            if (this.pseudoDests(from, ctx).intersects(enemy)) {
                ctx.mustCapture = true;
                break;
            }
        }
        return ctx;
    }
    dests(square, ctx) {
        const dests = this.pseudoDests(square, ctx);
        if (!ctx.mustCapture)
            return dests;
        else
            return dests.intersect(this.board[util_1.opposite(this.turn)]);
    }
    hasInsufficientMaterial(color) {
        if (this.board.occupied.equals(this.board.bishop)) {
            const weSomeOnLight = this.board[color].intersects(squareSet_1.SquareSet.lightSquares());
            const weSomeOnDark = this.board[color].intersects(squareSet_1.SquareSet.darkSquares());
            const theyAllOnDark = this.board[util_1.opposite(color)].isDisjoint(squareSet_1.SquareSet.lightSquares());
            const theyAllOnLight = this.board[util_1.opposite(color)].isDisjoint(squareSet_1.SquareSet.darkSquares());
            return (weSomeOnLight && theyAllOnDark) || (weSomeOnDark && theyAllOnLight);
        }
        return false;
    }
    isVariantEnd() {
        return this.board[this.turn].isEmpty();
    }
    variantOutcome() {
        if (this.isVariantEnd() || this.isStalemate()) {
            return { winner: this.turn };
        }
        return;
    }
}
exports.Antichess = Antichess;
class KingOfTheHill extends chess_1.Chess {
    constructor() {
        super('kingofthehill');
    }
    static default() {
        return super.default();
    }
    static fromSetup(setup) {
        return super.fromSetup(setup);
    }
    clone() {
        return super.clone();
    }
    hasInsufficientMaterial(_color) {
        return false;
    }
    isVariantEnd() {
        return this.board.king.intersects(squareSet_1.SquareSet.center());
    }
    variantOutcome() {
        for (const color of types_1.COLORS) {
            if (this.board.pieces(color, 'king').intersects(squareSet_1.SquareSet.center()))
                return { winner: color };
        }
        return;
    }
}
exports.KingOfTheHill = KingOfTheHill;
class ThreeCheck extends chess_1.Chess {
    constructor() {
        super('3check');
    }
    static default() {
        const pos = super.default();
        pos.remainingChecks = setup_1.RemainingChecks.default();
        return pos;
    }
    static fromSetup(setup) {
        return super.fromSetup(setup).map(pos => {
            pos.remainingChecks = setup.remainingChecks ? setup.remainingChecks.clone() : setup_1.RemainingChecks.default();
            return pos;
        });
    }
    clone() {
        return super.clone();
    }
    hasInsufficientMaterial(color) {
        return this.board.pieces(color, 'king').equals(this.board[color]);
    }
    isVariantEnd() {
        return !!this.remainingChecks && (this.remainingChecks.white <= 0 || this.remainingChecks.black <= 0);
    }
    variantOutcome() {
        if (this.remainingChecks) {
            for (const color of types_1.COLORS) {
                if (this.remainingChecks[color] <= 0)
                    return { winner: color };
            }
        }
        return;
    }
}
exports.ThreeCheck = ThreeCheck;
class RacingKings extends chess_1.Chess {
    constructor() {
        super('racingkings');
    }
    static default() {
        const pos = new this();
        pos.board = board_1.Board.racingKings();
        pos.turn = 'white';
        pos.castles = chess_1.Castles.empty();
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
    }
    static fromSetup(setup) {
        return super.fromSetup(setup).map(pos => {
            pos.castles = chess_1.Castles.empty();
            return pos;
        });
    }
    validate() {
        if (this.board.pawn.nonEmpty() || this.isCheck()) {
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Variant));
        }
        return super.validate();
    }
    clone() {
        return super.clone();
    }
    dests(square, ctx) {
        // Kings cannot give check.
        if (square === ctx.king)
            return super.dests(square, ctx);
        // TODO: This could be optimized considerably.
        let dests = squareSet_1.SquareSet.empty();
        for (const to of super.dests(square, ctx)) {
            // Valid, because there are no promotions (or even pawns).
            const uci = { from: square, to };
            const after = this.clone();
            after.play(uci);
            if (!after.isCheck())
                dests = dests.with(to);
        }
        return dests;
    }
    hasInsufficientMaterial(_color) {
        return false;
    }
    isVariantEnd() {
        const goal = squareSet_1.SquareSet.fromRank(7);
        const inGoal = this.board.king.intersect(goal);
        if (inGoal.isEmpty())
            return false;
        if (this.turn === 'white' || inGoal.intersects(this.board.black))
            return true;
        // White has reached the backrank. Check if black can catch up.
        const blackKing = this.board.kingOf('black');
        if (util_1.defined(blackKing)) {
            const occ = this.board.occupied.without(blackKing);
            for (const target of attacks_1.kingAttacks(blackKing).intersect(goal).diff(this.board.black)) {
                if (this.kingAttackers(target, util_1.opposite(this.turn), occ).isEmpty())
                    return false;
            }
        }
        return true;
    }
    variantOutcome() {
        if (!this.isVariantEnd())
            return;
        const goal = squareSet_1.SquareSet.fromRank(7);
        const blackInGoal = this.board.pieces('black', 'king').intersects(goal);
        const whiteInGoal = this.board.pieces('white', 'king').intersects(goal);
        if (blackInGoal && !whiteInGoal)
            return { winner: 'black' };
        if (whiteInGoal && !blackInGoal)
            return { winner: 'white' };
        return { winner: undefined };
    }
}
class Horde extends chess_1.Chess {
    constructor() {
        super('horde');
    }
    static default() {
        const pos = new this();
        pos.board = board_1.Board.horde();
        pos.pockets = undefined;
        pos.turn = 'white';
        pos.castles = chess_1.Castles.default();
        pos.castles.discardSide('white');
        pos.epSquare = undefined;
        pos.remainingChecks = undefined;
        pos.halfmoves = 0;
        pos.fullmoves = 1;
        return pos;
    }
    static fromSetup(setup) {
        return super.fromSetup(setup);
    }
    validate() {
        if (this.board.occupied.isEmpty())
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Empty));
        if (!this.board.king.isSingleSquare())
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Kings));
        if (!this.board.king.diff(this.board.promoted).isSingleSquare())
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.Kings));
        const otherKing = this.board.kingOf(util_1.opposite(this.turn));
        if (util_1.defined(otherKing) && this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty())
            return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.OppositeCheck));
        for (const color of types_1.COLORS) {
            if (this.board.pieces(color, 'pawn').intersects(squareSet_1.SquareSet.backrank(util_1.opposite(color)))) {
                return result_1.Result.err(new chess_1.PositionError(chess_1.IllegalSetup.PawnsOnBackrank));
            }
        }
        return result_1.Result.ok(undefined);
    }
    clone() {
        return super.clone();
    }
    hasInsufficientMaterial(_color) {
        // TODO: Could detect cases where the horde cannot mate.
        return false;
    }
    isVariantEnd() {
        return this.board.white.isEmpty() || this.board.black.isEmpty();
    }
    variantOutcome() {
        if (this.board.white.isEmpty())
            return { winner: 'black' };
        if (this.board.black.isEmpty())
            return { winner: 'white' };
        return;
    }
}
exports.Horde = Horde;
function defaultPosition(rules) {
    switch (rules) {
        case 'chess': return chess_1.Chess.default();
        case 'antichess': return Antichess.default();
        case 'atomic': return Atomic.default();
        case 'horde': return Horde.default();
        case 'racingkings': return RacingKings.default();
        case 'kingofthehill': return KingOfTheHill.default();
        case '3check': return ThreeCheck.default();
        case 'crazyhouse': return Crazyhouse.default();
    }
}
exports.defaultPosition = defaultPosition;
function setupPosition(rules, setup) {
    switch (rules) {
        case 'chess': return chess_1.Chess.fromSetup(setup);
        case 'antichess': return Antichess.fromSetup(setup);
        case 'atomic': return Atomic.fromSetup(setup);
        case 'horde': return Horde.fromSetup(setup);
        case 'racingkings': return RacingKings.fromSetup(setup);
        case 'kingofthehill': return KingOfTheHill.fromSetup(setup);
        case '3check': return ThreeCheck.fromSetup(setup);
        case 'crazyhouse': return Crazyhouse.fromSetup(setup);
    }
}
exports.setupPosition = setupPosition;

},{"./attacks":20,"./board":21,"./chess":22,"./setup":25,"./squareSet":26,"./types":27,"./util":28,"@badrap/result":1}],30:[function(require,module,exports){
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

},{"./is":32,"./vnode":37}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
exports.primitive = primitive;

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"./h":30,"./htmldomapi":31,"./is":32,"./thunk":36,"./vnode":37}],36:[function(require,module,exports){
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

},{"./h":30}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
}
exports.vnode = vnode;
exports.default = vnode;

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = require("./pool");
const common_1 = require("common");
const storage_1 = require("common/storage");
const throttle_1 = require("common/throttle");
const winningChances_1 = require("./winningChances");
const li = window.lichess;
function sanIrreversible(variant, san) {
    if (san.startsWith('O-O'))
        return true;
    if (variant === 'crazyhouse')
        return false;
    if (san.includes('x'))
        return true; // capture
    if (san.toLowerCase() === san)
        return true; // pawn move
    return variant === 'threeCheck' && san.includes('+');
}
function officialStockfish(variant) {
    return variant === 'standard' || variant === 'chess960';
}
function is64Bit() {
    const x64 = ['x86_64', 'x86-64', 'Win64', 'x64', 'amd64', 'AMD64'];
    for (const substr of x64)
        if (navigator.userAgent.includes(substr))
            return true;
    return navigator.platform === 'Linux x86_64' || navigator.platform === 'MacIntel';
}
function sharedWasmMemory(initial, maximum) {
    // In theory 32 bit should be supported just the same, but some 32 bit
    // browser builds seem to have trouble with WASMX. So for now detect and
    // require a 64 bit platform.
    if (!is64Bit())
        return;
    // Atomics
    if (typeof Atomics !== 'object')
        return;
    // SharedArrayBuffer
    if (typeof SharedArrayBuffer !== 'function')
        return;
    // Shared memory
    const mem = new WebAssembly.Memory({ shared: true, initial, maximum });
    if (!(mem.buffer instanceof SharedArrayBuffer))
        return;
    // Structured cloning
    try {
        window.postMessage(mem, '*');
    }
    catch (e) {
        return;
    }
    return mem;
}
function median(values) {
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2.0;
}
function default_1(opts) {
    const storageKey = (k) => {
        return opts.storageKeyPrefix ? `${opts.storageKeyPrefix}.${k}` : k;
    };
    // select wasmx with growable shared mem > wasmx > wasm > asmjs
    let technology = 'asmjs';
    let growableSharedMem = false;
    if (typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))) {
        technology = 'wasm'; // WebAssembly 1.0
        if (officialStockfish(opts.variant.key)) {
            const sharedMem = sharedWasmMemory(8, 16);
            if (sharedMem) {
                technology = 'wasmx';
                try {
                    sharedMem.grow(8);
                    growableSharedMem = true;
                }
                catch (e) { }
            }
        }
    }
    const maxThreads = Math.min(Math.max((navigator.hardwareConcurrency || 1) - 1, 1), growableSharedMem ? 16 : 2);
    const threads = storage_1.storedProp(storageKey('ceval.threads'), Math.min(Math.ceil((navigator.hardwareConcurrency || 1) / 4), maxThreads));
    const maxHashSize = Math.min((navigator.deviceMemory || 0.25) * 1024 / 8, growableSharedMem ? 1024 : 16);
    const hashSize = storage_1.storedProp(storageKey('ceval.hash-size'), 16);
    const minDepth = 6;
    const maxDepth = storage_1.storedProp(storageKey('ceval.max-depth'), 18);
    const multiPv = storage_1.storedProp(storageKey('ceval.multipv'), opts.multiPvDefault || 1);
    const infinite = storage_1.storedProp('ceval.infinite', false);
    let curEval = null;
    const enableStorage = li.storage.makeBoolean(storageKey('client-eval-enabled'));
    const allowed = common_1.prop(true);
    const enabled = common_1.prop(opts.possible && allowed() && enableStorage.get() && !document.hidden);
    let started = false;
    let lastStarted = false; // last started object (for going deeper even if stopped)
    const hovering = common_1.prop(null);
    const isDeeper = common_1.prop(false);
    const pool = new pool_1.Pool({
        technology,
        asmjs: 'vendor/stockfish.js/stockfish.js',
        wasm: 'vendor/stockfish.js/stockfish.wasm.js',
        wasmx: officialStockfish(opts.variant.key) ? 'vendor/stockfish.wasm/stockfish.js' : 'vendor/stockfish-mv.wasm/stockfish.js',
    }, {
        minDepth,
        variant: opts.variant.key,
        threads: technology == 'wasmx' && (() => Math.min(parseInt(threads()), maxThreads)),
        hashSize: technology == 'wasmx' && (() => Math.min(parseInt(hashSize()), maxHashSize)),
    });
    // adjusts maxDepth based on nodes per second
    const npsRecorder = (function () {
        const values = [];
        const applies = function (ev) {
            return ev.knps && ev.depth >= 16 &&
                typeof ev.cp !== 'undefined' && Math.abs(ev.cp) < 500 &&
                (ev.fen.split(/\s/)[0].split(/[nbrqkp]/i).length - 1) >= 10;
        };
        return function (ev) {
            if (!applies(ev))
                return;
            values.push(ev.knps);
            if (values.length > 9) {
                let depth = 18, knps = median(values) || 0;
                if (knps > 100)
                    depth = 19;
                if (knps > 150)
                    depth = 20;
                if (knps > 250)
                    depth = 21;
                if (knps > 500)
                    depth = 22;
                if (knps > 1000)
                    depth = 23;
                if (knps > 2000)
                    depth = 24;
                if (knps > 3500)
                    depth = 25;
                if (knps > 5000)
                    depth = 26;
                if (knps > 7000)
                    depth = 27;
                maxDepth(depth);
                if (values.length > 40)
                    values.shift();
            }
        };
    })();
    let lastEmitFen = null;
    const onEmit = throttle_1.default(200, (ev, work) => {
        sortPvsInPlace(ev.pvs, (work.ply % 2 === (work.threatMode ? 1 : 0)) ? 'white' : 'black');
        npsRecorder(ev);
        curEval = ev;
        opts.emit(ev, work);
        if (ev.fen !== lastEmitFen) {
            lastEmitFen = ev.fen;
            li.storage.fire('ceval.fen', ev.fen);
        }
    });
    const effectiveMaxDepth = () => (isDeeper() || infinite()) ? 99 : parseInt(maxDepth());
    const sortPvsInPlace = (pvs, color) => pvs.sort(function (a, b) {
        return winningChances_1.povChances(color, b) - winningChances_1.povChances(color, a);
    });
    const start = (path, steps, threatMode, deeper) => {
        if (!enabled() || !opts.possible)
            return;
        isDeeper(deeper);
        const maxD = effectiveMaxDepth();
        const step = steps[steps.length - 1];
        const existing = threatMode ? step.threat : step.ceval;
        if (existing && existing.depth >= maxD)
            return;
        const work = {
            initialFen: steps[0].fen,
            moves: [],
            currentFen: step.fen,
            path,
            ply: step.ply,
            maxDepth: maxD,
            multiPv: parseInt(multiPv()),
            threatMode,
            emit(ev) {
                if (enabled())
                    onEmit(ev, work);
            }
        };
        if (threatMode) {
            const c = step.ply % 2 === 1 ? 'w' : 'b';
            const fen = step.fen.replace(/ (w|b) /, ' ' + c + ' ');
            work.currentFen = fen;
            work.initialFen = fen;
        }
        else {
            // send fen after latest castling move and the following moves
            for (let i = 1; i < steps.length; i++) {
                let s = steps[i];
                if (sanIrreversible(opts.variant.key, s.san)) {
                    work.moves = [];
                    work.initialFen = s.fen;
                }
                else
                    work.moves.push(s.uci);
            }
        }
        pool.start(work);
        started = {
            path,
            steps,
            threatMode
        };
    };
    function goDeeper() {
        const s = started || lastStarted;
        if (s) {
            stop();
            start(s.path, s.steps, s.threatMode, true);
        }
    }
    ;
    function stop() {
        if (!enabled() || !started)
            return;
        pool.stop();
        lastStarted = started;
        started = false;
    }
    ;
    // ask other tabs if a game is in progress
    if (enabled()) {
        li.storage.fire('ceval.fen', 'start');
        li.storage.make('round.ongoing').listen(_ => {
            enabled(false);
            opts.redraw();
        });
    }
    return {
        technology,
        start,
        stop,
        allowed,
        possible: opts.possible,
        enabled,
        multiPv,
        threads: technology == 'wasmx' ? threads : undefined,
        hashSize: technology == 'wasmx' ? hashSize : undefined,
        maxThreads,
        maxHashSize,
        infinite,
        hovering,
        setHovering(fen, uci) {
            hovering(uci ? {
                fen,
                uci
            } : null);
            opts.setAutoShapes();
        },
        toggle() {
            if (!opts.possible || !allowed())
                return;
            stop();
            enabled(!enabled());
            if (document.visibilityState !== 'hidden')
                enableStorage.set(enabled());
        },
        curDepth: () => curEval ? curEval.depth : 0,
        effectiveMaxDepth,
        variant: opts.variant,
        isDeeper,
        goDeeper,
        canGoDeeper: () => !isDeeper() && !infinite() && !pool.isComputing(),
        isComputing: () => !!started && pool.isComputing(),
        engineName: pool.engineName,
        destroy: pool.destroy,
        redraw: opts.redraw
    };
}
exports.default = default_1;
;

},{"./pool":40,"./winningChances":43,"common":46,"common/storage":50,"common/throttle":52}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ctrl_1 = require("./ctrl");
exports.ctrl = ctrl_1.default;
const view = require("./view");
exports.view = view;
const winningChances = require("./winningChances");
exports.winningChances = winningChances;
function isEvalBetter(a, b) {
    return !b || a.depth > b.depth || (a.depth === b.depth && a.nodes > b.nodes);
}
exports.isEvalBetter = isEvalBetter;
// stop when another tab starts. Listen only once here,
// as the ctrl can be instanciated several times.
// gotta do the click on the toggle to have it visually change.
window.lichess.storage.make('ceval.pool.start').listen(_ => {
    const toggle = document.getElementById('analyse-toggle-ceval');
    if (toggle && toggle.checked)
        toggle.click();
});

},{"./ctrl":38,"./view":42,"./winningChances":43}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sync_1 = require("common/sync");
const stockfishProtocol_1 = require("./stockfishProtocol");
class AbstractWorker {
    constructor(url, poolOpts, workerOpts) {
        this.url = url;
        this.poolOpts = poolOpts;
        this.workerOpts = workerOpts;
        this.isComputing = () => !!this.protocol.sync && this.protocol.sync.isComputing();
        this.engineName = () => this.protocol.sync && this.protocol.sync.engineName;
        this.protocol = sync_1.sync(this.boot());
    }
    stop() {
        return this.protocol.promise.then(protocol => protocol.stop());
    }
    start(work) {
        return this.protocol.promise.then(protocol => {
            return protocol.stop().then(() => protocol.start(work));
        });
    }
}
exports.AbstractWorker = AbstractWorker;
class WebWorker extends AbstractWorker {
    boot() {
        this.worker = new Worker(window.lichess.assetUrl(this.url, { sameDomain: true }));
        const protocol = new stockfishProtocol_1.default(this.send.bind(this), this.workerOpts);
        this.worker.addEventListener('message', e => {
            protocol.received(e.data);
        }, true);
        return Promise.resolve(protocol);
    }
    start(work) {
        // wait for boot
        return this.protocol.promise.then(protocol => {
            const timeout = new Promise((_, reject) => setTimeout(reject, 1000));
            return Promise.race([protocol.stop(), timeout]).catch(() => {
                // reboot if not stopped after 1s
                this.destroy();
                this.protocol = sync_1.sync(this.boot());
            }).then(() => {
                return this.protocol.promise.then(protocol => protocol.start(work));
            });
        });
    }
    destroy() {
        this.worker.terminate();
    }
    send(cmd) {
        this.worker.postMessage(cmd);
    }
}
class ThreadedWasmWorker extends AbstractWorker {
    boot() {
        if (!ThreadedWasmWorker.global)
            ThreadedWasmWorker.global = window.lichess.loadScript(this.url, { sameDomain: true }).then(() => {
                const instance = this.instance = window['Stockfish'](), protocol = new stockfishProtocol_1.default(this.send.bind(this), this.workerOpts), listener = protocol.received.bind(protocol);
                instance.addMessageListener(listener);
                return {
                    instance,
                    protocol
                };
            });
        return ThreadedWasmWorker.global.then(global => {
            this.instance = global.instance;
            return global.protocol;
        });
    }
    destroy() {
        if (ThreadedWasmWorker.global) {
            console.log('stopping singleton wasmx worker (instead of destroying) ...');
            this.stop().then(() => console.log('... successfully stopped'));
        }
    }
    send(cmd) {
        if (this.instance)
            this.instance.postMessage(cmd);
    }
}
class Pool {
    constructor(poolOpts, protocolOpts) {
        this.poolOpts = poolOpts;
        this.protocolOpts = protocolOpts;
        this.workers = [];
        this.token = 0;
        this.warmup = () => {
            if (this.workers.length)
                return;
            if (this.poolOpts.technology == 'wasmx')
                this.workers.push(new ThreadedWasmWorker(this.poolOpts.wasmx, this.poolOpts, this.protocolOpts));
            else {
                for (let i = 1; i <= 2; i++)
                    this.workers.push(new WebWorker(this.poolOpts.technology == 'wasm' ? this.poolOpts.wasm : this.poolOpts.asmjs, this.poolOpts, this.protocolOpts));
            }
        };
        this.stop = () => this.workers.forEach(w => w.stop());
        this.destroy = () => {
            this.stop();
            this.workers.forEach(w => w.destroy());
        };
        this.start = (work) => {
            window.lichess.storage.fire('ceval.pool.start');
            this.getWorker().then(function (worker) {
                worker.start(work);
            }).catch(function (error) {
                console.log(error);
                setTimeout(() => window.lichess.reload(), 10000);
            });
        };
        this.isComputing = () => !!this.workers.length && this.workers[this.token].isComputing();
        this.engineName = () => this.workers[this.token] && this.workers[this.token].engineName();
    }
    getWorker() {
        this.warmup();
        // briefly wait and give a chance to reuse the current worker
        const worker = new Promise((resolve, reject) => {
            const currentWorker = this.workers[this.token];
            currentWorker.stop().then(() => resolve(currentWorker));
            setTimeout(reject, 50);
        });
        return worker.catch(() => {
            this.token = (this.token + 1) % this.workers.length;
            return Promise.resolve(this.workers[this.token]);
        });
    }
}
exports.Pool = Pool;

},{"./stockfishProtocol":41,"common/sync":51}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chess_1 = require("chess");
const EVAL_REGEX = new RegExp(''
    + /^info depth (\d+) seldepth \d+ multipv (\d+) /.source
    + /score (cp|mate) ([-\d]+) /.source
    + /(?:(upper|lower)bound )?nodes (\d+) nps \S+ /.source
    + /(?:hashfull \d+ )?(?:tbhits \d+ )?time (\S+) /.source
    + /pv (.+)/.source);
class Protocol {
    constructor(send, opts) {
        this.send = send;
        this.opts = opts;
        this.work = null;
        this.curEval = null;
        this.expectedPvs = 1;
        this.stopped = defer();
        this.stopped.resolve();
        // get engine name/version
        this.send('uci');
        // analyse without contempt
        this.setOption('UCI_AnalyseMode', 'true');
        this.setOption('Analysis Contempt', 'Off');
        if (opts.variant === 'fromPosition' || opts.variant === 'chess960')
            this.setOption('UCI_Chess960', 'true');
        else if (opts.variant === 'antichess')
            this.setOption('UCI_Variant', 'giveaway');
        else if (opts.variant !== 'standard')
            this.setOption('UCI_Variant', chess_1.variantToRules(opts.variant));
    }
    setOption(name, value) {
        this.send(`setoption name ${name} value ${value}`);
    }
    received(text) {
        if (text.startsWith('id name '))
            this.engineName = text.substring('id name '.length);
        else if (text.startsWith('bestmove ')) {
            if (!this.stopped)
                this.stopped = defer();
            this.stopped.resolve();
            if (this.work && this.curEval)
                this.work.emit(this.curEval);
            return;
        }
        if (!this.work)
            return;
        let matches = text.match(EVAL_REGEX);
        if (!matches)
            return;
        let depth = parseInt(matches[1]), multiPv = parseInt(matches[2]), isMate = matches[3] === 'mate', ev = parseInt(matches[4]), evalType = matches[5], nodes = parseInt(matches[6]), elapsedMs = parseInt(matches[7]), moves = matches[8].split(' ');
        // Sometimes we get #0. Let's just skip it.
        if (isMate && !ev)
            return;
        // Track max pv index to determine when pv prints are done.
        if (this.expectedPvs < multiPv)
            this.expectedPvs = multiPv;
        if (depth < this.opts.minDepth)
            return;
        let pivot = this.work.threatMode ? 0 : 1;
        if (this.work.ply % 2 === pivot)
            ev = -ev;
        // For now, ignore most upperbound/lowerbound messages.
        // The exception is for multiPV, sometimes non-primary PVs
        // only have an upperbound.
        // See: https://github.com/ddugovic/Stockfish/issues/228
        if (evalType && multiPv === 1)
            return;
        let pvData = {
            moves,
            cp: isMate ? undefined : ev,
            mate: isMate ? ev : undefined,
            depth,
        };
        if (multiPv === 1) {
            this.curEval = {
                fen: this.work.currentFen,
                maxDepth: this.work.maxDepth,
                depth,
                knps: nodes / elapsedMs,
                nodes,
                cp: isMate ? undefined : ev,
                mate: isMate ? ev : undefined,
                pvs: [pvData],
                millis: elapsedMs
            };
        }
        else if (this.curEval) {
            this.curEval.pvs.push(pvData);
            this.curEval.depth = Math.min(this.curEval.depth, depth);
        }
        if (multiPv === this.expectedPvs && this.curEval) {
            this.work.emit(this.curEval);
        }
    }
    start(w) {
        if (!this.stopped) {
            // TODO: Work is started by basically doing stop().then(() => start(w)).
            // There is a race condition where multiple callers are waiting for
            // completion of the same stop future, and so they will start work at
            // the same time.
            // This can lead to all kinds of issues, including deadlocks. Instead
            // we ignore all but the first request. The engine will show as loading
            // indefinitely. Until this is fixed, it is still better than a
            // possible deadlock.
            console.log('ceval: tried to start analysing before requesting stop');
            return;
        }
        this.work = w;
        this.curEval = null;
        this.stopped = null;
        this.expectedPvs = 1;
        if (this.opts.threads)
            this.setOption('Threads', this.opts.threads());
        if (this.opts.hashSize)
            this.setOption('Hash', this.opts.hashSize());
        this.setOption('MultiPV', this.work.multiPv);
        this.send(['position', 'fen', this.work.initialFen, 'moves'].concat(this.work.moves).join(' '));
        if (this.work.maxDepth >= 99)
            this.send('go depth 99');
        else
            this.send('go movetime 90000 depth ' + this.work.maxDepth);
    }
    stop() {
        if (!this.stopped) {
            this.work = null;
            this.stopped = defer();
            this.send('stop');
        }
        return this.stopped.promise;
    }
    isComputing() {
        return !this.stopped;
    }
}
exports.default = Protocol;
;
function defer() {
    const deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}

},{"chess":44}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winningChances = require("./winningChances");
const common_1 = require("common");
const chess_1 = require("chess");
const snabbdom_1 = require("snabbdom");
const util_1 = require("chessops/util");
const fen_1 = require("chessops/fen");
const san_1 = require("chessops/san");
const variant_1 = require("chessops/variant");
let gaugeLast = 0;
const gaugeTicks = [...Array(8).keys()].map(i => snabbdom_1.h(i === 3 ? 'tick.zero' : 'tick', { attrs: { style: `height: ${(i + 1) * 12.5}%` } }));
function localEvalInfo(ctrl, evs) {
    const ceval = ctrl.getCeval(), trans = ctrl.trans;
    if (!evs.client)
        return [
            evs.server && ctrl.nextNodeBest() ? trans.noarg('usingServerAnalysis') : trans.noarg('loadingEngine'),
        ];
    const t = evs.client.cloud ? [
        trans('depthX', evs.client.depth || 0),
        snabbdom_1.h('span.cloud', { attrs: { title: trans.noarg('cloudAnalysis') } }, 'Cloud')
    ] : [
        trans('depthX', (evs.client.depth || 0) + '/' + evs.client.maxDepth)
    ];
    if (ceval.canGoDeeper())
        t.push(snabbdom_1.h('a.deeper', {
            attrs: {
                title: trans.noarg('goDeeper'),
                'data-icon': 'O'
            },
            hook: {
                insert: vnode => vnode.elm.addEventListener('click', () => {
                    ceval.goDeeper();
                    ceval.redraw();
                })
            }
        }));
    else if (!evs.client.cloud && evs.client.knps)
        t.push(', ' + Math.round(evs.client.knps) + ' knodes/s');
    return t;
}
function threatInfo(ctrl, threat) {
    if (!threat)
        return ctrl.trans.noarg('loadingEngine');
    let t = ctrl.trans('depthX', (threat.depth || 0) + '/' + threat.maxDepth);
    if (threat.knps)
        t += ', ' + Math.round(threat.knps) + ' knodes/s';
    return t;
}
function threatButton(ctrl) {
    if (ctrl.disableThreatMode && ctrl.disableThreatMode())
        return null;
    return snabbdom_1.h('a.show-threat', {
        class: {
            active: ctrl.threatMode(),
            hidden: !!ctrl.getNode().check
        },
        attrs: {
            'data-icon': '7',
            title: ctrl.trans.noarg('showThreat') + ' (x)'
        },
        hook: {
            insert: vnode => vnode.elm.addEventListener('click', ctrl.toggleThreatMode)
        }
    });
}
function engineName(ctrl) {
    const version = ctrl.engineName();
    return [
        snabbdom_1.h('span', version ? { attrs: { title: version } } : {}, ctrl.technology == 'wasmx' ? window.lichess.engineName : 'Stockfish 10+'),
        ctrl.technology == 'wasmx' ? snabbdom_1.h('span.native', { attrs: { title: 'Multi-threaded WebAssembly (experimental)' } }, 'wasmx') :
            (ctrl.technology == 'wasm' ? snabbdom_1.h('span.native', { attrs: { title: 'WebAssembly' } }, 'wasm') :
                snabbdom_1.h('span.asmjs', { attrs: { title: 'JavaScript fallback' } }, 'asmjs'))
    ];
}
const serverNodes = 4e6;
function getBestEval(evs) {
    const serverEv = evs.server, localEv = evs.client;
    if (!serverEv)
        return localEv;
    if (!localEv)
        return serverEv;
    // Prefer localEv if it exeeds fishnet node limit or finds a better mate.
    if (localEv.nodes > serverNodes ||
        (typeof localEv.mate !== 'undefined' && (typeof serverEv.mate === 'undefined' || Math.abs(localEv.mate) < Math.abs(serverEv.mate))))
        return localEv;
    return serverEv;
}
exports.getBestEval = getBestEval;
function renderGauge(ctrl) {
    if (ctrl.ongoing || !ctrl.showEvalGauge())
        return;
    let ev, bestEv = getBestEval(ctrl.currentEvals());
    if (bestEv) {
        ev = winningChances.povChances('white', bestEv);
        gaugeLast = ev;
    }
    else
        ev = gaugeLast;
    return snabbdom_1.h('div.eval-gauge', {
        class: {
            empty: ev === null,
            reverse: ctrl.getOrientation() === 'black'
        }
    }, [
        snabbdom_1.h('div.black', { attrs: { style: `height: ${100 - (ev + 1) * 50}%` } }),
        ...gaugeTicks
    ]);
}
exports.renderGauge = renderGauge;
function renderCeval(ctrl) {
    const instance = ctrl.getCeval(), trans = ctrl.trans;
    if (!instance.allowed() || !instance.possible || !ctrl.showComputer())
        return;
    const enabled = instance.enabled(), evs = ctrl.currentEvals(), threatMode = ctrl.threatMode(), threat = threatMode && ctrl.getNode().threat, bestEv = threat || getBestEval(evs);
    let pearl, percent;
    if (bestEv && typeof bestEv.cp !== 'undefined') {
        pearl = chess_1.renderEval(bestEv.cp);
        percent = evs.client ? Math.min(100, Math.round(100 * evs.client.depth / (evs.client.maxDepth || instance.effectiveMaxDepth()))) : 0;
    }
    else if (bestEv && common_1.defined(bestEv.mate)) {
        pearl = '#' + bestEv.mate;
        percent = 100;
    }
    else if (ctrl.gameOver()) {
        pearl = '-';
        percent = 0;
    }
    else {
        pearl = enabled ? snabbdom_1.h('i.ddloader') : snabbdom_1.h('i');
        percent = 0;
    }
    if (threatMode) {
        if (threat)
            percent = Math.min(100, Math.round(100 * threat.depth / threat.maxDepth));
        else
            percent = 0;
    }
    const progressBar = enabled ? snabbdom_1.h('div.bar', snabbdom_1.h('span', {
        class: { threat: threatMode },
        attrs: { style: `width: ${percent}%` },
        hook: {
            postpatch: (old, vnode) => {
                if (old.data.percent > percent || !!old.data.threatMode != threatMode) {
                    const el = vnode.elm;
                    const p = el.parentNode;
                    p.removeChild(el);
                    p.appendChild(el);
                }
                vnode.data.percent = percent;
                vnode.data.threatMode = threatMode;
            }
        }
    })) : null;
    const body = enabled ? [
        snabbdom_1.h('pearl', [pearl]),
        snabbdom_1.h('div.engine', [
            ...(threatMode ? [trans.noarg('showThreat')] : engineName(instance)),
            snabbdom_1.h('span.info', ctrl.gameOver() ? [trans.noarg('gameOver')] :
                (threatMode ? [threatInfo(ctrl, threat)] : localEvalInfo(ctrl, evs)))
        ])
    ] : [
        pearl ? snabbdom_1.h('pearl', [pearl]) : null,
        snabbdom_1.h('help', [
            ...engineName(instance),
            snabbdom_1.h('br'),
            trans.noarg('inLocalBrowser')
        ])
    ];
    const switchButton = ctrl.mandatoryCeval && ctrl.mandatoryCeval() ? null : snabbdom_1.h('div.switch', {
        attrs: { title: trans.noarg('toggleLocalEvaluation') + ' (l)' }
    }, [
        snabbdom_1.h('input#analyse-toggle-ceval.cmn-toggle.cmn-toggle--subtle', {
            attrs: {
                type: 'checkbox',
                checked: enabled
            },
            hook: {
                insert: vnode => vnode.elm.addEventListener('change', ctrl.toggleCeval)
            }
        }),
        snabbdom_1.h('label', { attrs: { 'for': 'analyse-toggle-ceval' } })
    ]);
    return snabbdom_1.h('div.ceval' + (enabled ? '.enabled' : ''), {
        class: {
            computing: percent < 100 && instance.isComputing()
        }
    }, [
        progressBar,
        ...body,
        threatButton(ctrl),
        switchButton
    ]);
}
exports.renderCeval = renderCeval;
function getElFen(el) {
    return el.getAttribute('data-fen');
}
function getElUci(e) {
    return $(e.target).closest('div.pv').attr('data-uci');
}
function checkHover(el, instance) {
    window.lichess.requestIdleCallback(() => {
        instance.setHovering(getElFen(el), $(el).find('div.pv:hover').attr('data-uci'));
    });
}
function renderPvs(ctrl) {
    const instance = ctrl.getCeval();
    if (!instance.allowed() || !instance.possible || !instance.enabled())
        return;
    const multiPv = parseInt(instance.multiPv()), node = ctrl.getNode(), setup = fen_1.parseFen(node.fen).unwrap();
    let pvs, threat = false;
    if (ctrl.threatMode() && node.threat) {
        pvs = node.threat.pvs;
        threat = true;
    }
    else if (node.ceval)
        pvs = node.ceval.pvs;
    else
        pvs = [];
    if (threat)
        setup.turn = util_1.opposite(setup.turn);
    const pos = variant_1.setupPosition(chess_1.variantToRules(instance.variant.key), setup);
    return snabbdom_1.h('div.pv_box', {
        attrs: { 'data-fen': node.fen },
        hook: {
            insert: vnode => {
                const el = vnode.elm;
                el.addEventListener('mouseover', (e) => {
                    instance.setHovering(getElFen(el), getElUci(e));
                });
                el.addEventListener('mouseout', () => {
                    instance.setHovering(getElFen(el));
                });
                el.addEventListener('mousedown', (e) => {
                    const uci = getElUci(e);
                    if (uci)
                        ctrl.playUci(uci);
                });
                checkHover(el, instance);
            },
            postpatch: (_, vnode) => checkHover(vnode.elm, instance)
        }
    }, [...Array(multiPv).keys()].map(function (i) {
        if (!pvs[i])
            return snabbdom_1.h('div.pv');
        return snabbdom_1.h('div.pv', threat ? {} : {
            attrs: { 'data-uci': pvs[i].moves[0] }
        }, [
            multiPv > 1 ? snabbdom_1.h('strong', common_1.defined(pvs[i].mate) ? ('#' + pvs[i].mate) : chess_1.renderEval(pvs[i].cp)) : null,
            snabbdom_1.h('span', pos.unwrap(pos => san_1.makeSanVariation(pos, pvs[i].moves.slice(0, 12).map(m => util_1.parseUci(m))), _ => '--'))
        ]);
    }));
}
exports.renderPvs = renderPvs;

},{"./winningChances":43,"chess":44,"chessops/fen":23,"chessops/san":24,"chessops/util":28,"chessops/variant":29,"common":46,"snabbdom":35}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toPov(color, diff) {
    return color === 'white' ? diff : -diff;
}
/**
 * https://graphsketch.com/?eqn1_color=1&eqn1_eqn=100+*+%282+%2F+%281+%2B+exp%28-0.005+*+x%29%29+-+1%29&eqn2_color=2&eqn2_eqn=100+*+%282+%2F+%281+%2B+exp%28-0.004+*+x%29%29+-+1%29&eqn3_color=3&eqn3_eqn=&eqn4_color=4&eqn4_eqn=&eqn5_color=5&eqn5_eqn=&eqn6_color=6&eqn6_eqn=&x_min=-1000&x_max=1000&y_min=-100&y_max=100&x_tick=100&y_tick=10&x_label_freq=2&y_label_freq=2&do_grid=0&do_grid=1&bold_labeled_lines=0&bold_labeled_lines=1&line_width=4&image_w=850&image_h=525
 */
function rawWinningChances(cp) {
    return 2 / (1 + Math.exp(-0.004 * cp)) - 1;
}
function cpWinningChances(cp) {
    return rawWinningChances(Math.min(Math.max(-1000, cp), 1000));
}
function mateWinningChances(mate) {
    var cp = (21 - Math.min(10, Math.abs(mate))) * 100;
    var signed = cp * (mate > 0 ? 1 : -1);
    return rawWinningChances(signed);
}
function evalWinningChances(ev) {
    return typeof ev.mate !== 'undefined' ? mateWinningChances(ev.mate) : cpWinningChances(ev.cp);
}
// winning chances for a color
// 1  infinitely winning
// -1 infinitely losing
function povChances(color, ev) {
    return toPov(color, evalWinningChances(ev));
}
exports.povChances = povChances;
// computes the difference, in winning chances, between two evaluations
// 1  = e1 is infinately better than e2
// -1 = e1 is infinately worse  than e2
function povDiff(color, e1, e2) {
    return (povChances(color, e1) - povChances(color, e2)) / 2;
}
exports.povDiff = povDiff;

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const piotr_1 = require("./piotr");
exports.piotr = piotr_1.default;
exports.initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
function fixCrazySan(san) {
    return san[0] === 'P' ? san.slice(1) : san;
}
exports.fixCrazySan = fixCrazySan;
function decomposeUci(uci) {
    return [uci.slice(0, 2), uci.slice(2, 4), uci.slice(4, 5)];
}
exports.decomposeUci = decomposeUci;
function renderEval(e) {
    e = Math.max(Math.min(Math.round(e / 10) / 10, 99), -99);
    return (e > 0 ? '+' : '') + e;
}
exports.renderEval = renderEval;
function readDests(lines) {
    if (typeof lines === 'undefined')
        return null;
    const dests = {};
    if (lines)
        lines.split(' ').forEach(line => {
            dests[piotr_1.default[line[0]]] = line.slice(1).split('').map(c => piotr_1.default[c]);
        });
    return dests;
}
exports.readDests = readDests;
function readDrops(line) {
    if (typeof line === 'undefined' || line === null)
        return null;
    return line.match(/.{2}/g) || [];
}
exports.readDrops = readDrops;
exports.roleToSan = {
    pawn: 'P',
    knight: 'N',
    bishop: 'B',
    rook: 'R',
    queen: 'Q',
    king: 'K'
};
exports.sanToRole = {
    P: 'pawn',
    N: 'knight',
    B: 'bishop',
    R: 'rook',
    Q: 'queen',
    K: 'king'
};
function variantToRules(variant) {
    switch (variant) {
        case 'standard':
        case 'chess960':
        case 'fromPosition':
            return 'chess';
        case 'threeCheck':
            return '3check';
        case 'kingOfTheHill':
            return 'kingofthehill';
        case 'racingKings':
            return 'racingkings';
        default:
            return variant;
    }
}
exports.variantToRules = variantToRules;

},{"./piotr":45}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const piotr = {
    'a': 'a1',
    'b': 'b1',
    'c': 'c1',
    'd': 'd1',
    'e': 'e1',
    'f': 'f1',
    'g': 'g1',
    'h': 'h1',
    'i': 'a2',
    'j': 'b2',
    'k': 'c2',
    'l': 'd2',
    'm': 'e2',
    'n': 'f2',
    'o': 'g2',
    'p': 'h2',
    'q': 'a3',
    'r': 'b3',
    's': 'c3',
    't': 'd3',
    'u': 'e3',
    'v': 'f3',
    'w': 'g3',
    'x': 'h3',
    'y': 'a4',
    'z': 'b4',
    'A': 'c4',
    'B': 'd4',
    'C': 'e4',
    'D': 'f4',
    'E': 'g4',
    'F': 'h4',
    'G': 'a5',
    'H': 'b5',
    'I': 'c5',
    'J': 'd5',
    'K': 'e5',
    'L': 'f5',
    'M': 'g5',
    'N': 'h5',
    'O': 'a6',
    'P': 'b6',
    'Q': 'c6',
    'R': 'd6',
    'S': 'e6',
    'T': 'f6',
    'U': 'g6',
    'V': 'h6',
    'W': 'a7',
    'X': 'b7',
    'Y': 'c7',
    'Z': 'd7',
    '0': 'e7',
    '1': 'f7',
    '2': 'g7',
    '3': 'h7',
    '4': 'a8',
    '5': 'b8',
    '6': 'c8',
    '7': 'd8',
    '8': 'e8',
    '9': 'f8',
    '!': 'g8',
    '?': 'h8'
};
exports.default = piotr;

},{}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throttle_1 = require("./throttle");
function runner(hacks, throttleMs = 100) {
    let timeout;
    const runHacks = throttle_1.default(throttleMs, () => {
        window.lichess.raf(() => {
            hacks();
            schedule();
        });
    });
    function schedule() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(runHacks, 500);
    }
    runHacks();
}
exports.runner = runner;
let lastMainBoardHeight;
// Firefox 60- needs this to properly compute the grid layout.
function fixMainBoardHeight(container) {
    const mainBoard = container.querySelector('.main-board'), width = mainBoard.offsetWidth;
    if (lastMainBoardHeight != width) {
        lastMainBoardHeight = width;
        mainBoard.style.height = width + 'px';
        mainBoard.querySelector('.cg-wrap').style.height = width + 'px';
        window.lichess.dispatchEvent(document.body, 'chessground.resize');
    }
}
exports.fixMainBoardHeight = fixMainBoardHeight;
let boundChessgroundResize = false;
function bindChessgroundResizeOnce(f) {
    if (!boundChessgroundResize) {
        boundChessgroundResize = true;
        document.body.addEventListener('chessground.resize', f);
    }
}
exports.bindChessgroundResizeOnce = bindChessgroundResizeOnce;
function needsBoardHeightFix() {
    // Chrome, Chromium, Brave, Opera, Safari 12+ are OK
    if (window.chrome)
        return false;
    // Firefox >= 61 is OK
    const ffv = navigator.userAgent.split('Firefox/');
    return !ffv[1] || parseInt(ffv[1]) < 61;
}
exports.needsBoardHeightFix = needsBoardHeightFix;

},{"./throttle":52}],48:[function(require,module,exports){
"use strict";
/* Based on: */
/*!
 * hoverIntent v1.10.0 // 2019.02.25 // jQuery v1.7.0+
 * http://briancherne.github.io/jquery-hoverIntent/
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007-2019 Brian Cherne
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuHover = () => window.lichess.raf(function () {
    if (window.lichess.hasTouchEvents)
        return;
    let interval = 100;
    let sensitivity = 10;
    // current X and Y position of mouse, updated during mousemove tracking (shared across instances)
    let cX, cY;
    // saves the current pointer position coordinates based on the given mousemove event
    let track = function (ev) {
        cX = ev.pageX;
        cY = ev.pageY;
    };
    // state properties:
    // timeoutId = timeout ID, reused for tracking mouse position and delaying "out" handler
    // isActive = plugin state, true after `over` is called just until `out` is called
    // pX, pY = previously-measured pointer coordinates, updated at each polling interval
    // event = string representing the namespaced event used for mouse tracking
    let state = {};
    $('#topnav.hover').each(function () {
        const $el = $(this).removeClass('hover'), handler = () => $el.toggleClass('hover');
        // compares current and previous mouse positions
        const compare = function () {
            // compare mouse positions to see if pointer has slowed enough to trigger `over` function
            if (Math.sqrt((state.pX - cX) * (state.pX - cX) + (state.pY - cY) * (state.pY - cY)) < sensitivity) {
                $el.off(state.event, track);
                delete state.timeoutId;
                // set hoverIntent state as active for this element (permits `out` handler to trigger)
                state.isActive = true;
                handler();
            }
            else {
                // set previous coordinates for next comparison
                state.pX = cX;
                state.pY = cY;
                // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                state.timeoutId = setTimeout(compare, interval);
            }
        };
        // A private function for handling mouse 'hovering'
        var handleHover = function (ev) {
            // clear any existing timeout
            if (state.timeoutId) {
                state.timeoutId = clearTimeout(state.timeoutId);
            }
            // namespaced event used to register and unregister mousemove tracking
            var mousemove = state.event = 'mousemove';
            // handle the event, based on its type
            if (ev.type == 'mouseenter') {
                // do nothing if already active or a button is pressed (dragging a piece)
                if (state.isActive || ev.originalEvent.buttons)
                    return;
                // set "previous" X and Y position based on initial entry point
                state.pX = ev.pageX;
                state.pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $el.off(mousemove, track).on(mousemove, track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                state.timeoutId = setTimeout(compare, interval);
            }
            else { // "mouseleave"
                // do nothing if not already active
                if (!state.isActive)
                    return;
                // unbind expensive mousemove event
                $el.off(mousemove, track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                state = {};
                handler();
            }
        };
        $el.on('mouseenter', handleHover).on('mouseleave', handleHover);
    });
});

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resizeHandle(els, pref, ply, visible) {
    if (!pref)
        return;
    const el = document.createElement('cg-resize');
    els.container.appendChild(el);
    const startResize = (start) => {
        start.preventDefault();
        const mousemoveEvent = start.type === 'touchstart' ? 'touchmove' : 'mousemove';
        const mouseupEvent = start.type === 'touchstart' ? 'touchend' : 'mouseup';
        const startPos = eventPosition(start);
        const initialZoom = parseInt(getComputedStyle(document.body).getPropertyValue('--zoom'));
        let zoom = initialZoom;
        const saveZoom = window.lichess.debounce(() => {
            $.ajax({ method: 'post', url: '/pref/zoom?v=' + (100 + zoom) });
        }, 700);
        const resize = (move) => {
            const pos = eventPosition(move);
            const delta = pos[0] - startPos[0] + pos[1] - startPos[1];
            zoom = Math.round(Math.min(100, Math.max(0, initialZoom + delta / 10)));
            document.body.setAttribute('style', '--zoom:' + zoom);
            window.lichess.dispatchEvent(window, 'resize');
            saveZoom();
        };
        document.body.classList.add('resizing');
        document.addEventListener(mousemoveEvent, resize);
        document.addEventListener(mouseupEvent, () => {
            document.removeEventListener(mousemoveEvent, resize);
            document.body.classList.remove('resizing');
        }, { once: true });
    };
    el.addEventListener('touchstart', startResize);
    el.addEventListener('mousedown', startResize);
    if (pref == 1) {
        const toggle = (ply) => el.classList.toggle('none', visible ? !visible(ply) : ply >= 2);
        toggle(ply);
        window.lichess.pubsub.on('ply', toggle);
    }
    addNag(el);
}
exports.default = resizeHandle;
function eventPosition(e) {
    if (e.clientX || e.clientX === 0)
        return [e.clientX, e.clientY];
    if (e.touches && e.targetTouches[0])
        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return undefined;
}
function addNag(el) {
    const storage = window.lichess.storage.makeBoolean('resize-nag');
    if (storage.get())
        return;
    window.lichess.loadCssPath('nag-circle');
    el.title = 'Drag to resize';
    el.innerHTML = '<div class="nag-circle"></div>';
    for (const mousedownEvent of ['touchstart', 'mousedown']) {
        el.addEventListener(mousedownEvent, () => {
            storage.set(true);
            el.innerHTML = '';
        }, { once: true });
    }
    setTimeout(() => storage.set(true), 15000);
}

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const storage = window.lichess.storage;
function storedProp(k, defaultValue) {
    const sk = 'analyse.' + k;
    const isBoolean = defaultValue === true || defaultValue === false;
    let value;
    return function (v) {
        if (common_1.defined(v) && v != value) {
            value = v + '';
            storage.set(sk, v);
        }
        else if (!common_1.defined(value)) {
            value = storage.get(sk);
            if (value === null)
                value = defaultValue + '';
        }
        return isBoolean ? value === 'true' : value;
    };
}
exports.storedProp = storedProp;
function storedJsonProp(key, defaultValue) {
    return function (v) {
        if (common_1.defined(v)) {
            storage.set(key, JSON.stringify(v));
            return v;
        }
        const ret = JSON.parse(storage.get(key));
        return (ret !== null) ? ret : defaultValue;
    };
}
exports.storedJsonProp = storedJsonProp;

},{"./common":46}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sync(promise) {
    const sync = {
        sync: undefined,
        promise: promise.then(v => {
            sync.sync = v;
            return v;
        })
    };
    return sync;
}
exports.sync = sync;

},{}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ceval_1 = require("ceval");
const chess_1 = require("chess");
const util_1 = require("chessground/util");
function makeAutoShapesFromUci(uci, brush, modifiers) {
    const move = chess_1.decomposeUci(uci);
    return [{
            orig: move[0],
            dest: move[1],
            brush: brush,
            modifiers: modifiers
        }];
}
function default_1(opts) {
    const n = opts.vm.node, hovering = opts.ceval.hovering(), color = opts.ground.state.movable.color;
    let shapes = [];
    if (hovering && hovering.fen === n.fen)
        shapes = shapes.concat(makeAutoShapesFromUci(hovering.uci, 'paleBlue'));
    if (opts.vm.showAutoShapes() && opts.vm.showComputer()) {
        if (n.eval)
            shapes = shapes.concat(makeAutoShapesFromUci(n.eval.best, 'paleGreen'));
        if (!hovering) {
            let nextBest = opts.nextNodeBest;
            if (!nextBest && opts.ceval.enabled() && n.ceval)
                nextBest = n.ceval.pvs[0].moves[0];
            if (nextBest)
                shapes = shapes.concat(makeAutoShapesFromUci(nextBest, 'paleBlue'));
            if (opts.ceval.enabled() && n.ceval && n.ceval.pvs && n.ceval.pvs[1] && !(opts.threatMode && n.threat && n.threat.pvs[2])) {
                n.ceval.pvs.forEach(function (pv) {
                    if (pv.moves[0] === nextBest)
                        return;
                    var shift = ceval_1.winningChances.povDiff(color, n.ceval.pvs[0], pv);
                    if (shift > 0.2 || isNaN(shift) || shift < 0)
                        return;
                    shapes = shapes.concat(makeAutoShapesFromUci(pv.moves[0], 'paleGrey', {
                        lineWidth: Math.round(12 - shift * 50) // 12 to 2
                    }));
                });
            }
        }
    }
    if (opts.ceval.enabled() && opts.threatMode && n.threat) {
        if (n.threat.pvs[1]) {
            shapes = shapes.concat(makeAutoShapesFromUci(n.threat.pvs[0].moves[0], 'paleRed'));
            n.threat.pvs.slice(1).forEach(function (pv) {
                const shift = ceval_1.winningChances.povDiff(util_1.opposite(color), pv, n.threat.pvs[0]);
                if (shift > 0.2 || isNaN(shift) || shift < 0)
                    return;
                shapes = shapes.concat(makeAutoShapesFromUci(pv.moves[0], 'paleRed', {
                    lineWidth: Math.round(11 - shift * 45) // 11 to 2
                }));
            });
        }
        else
            shapes = shapes.concat(makeAutoShapesFromUci(n.threat.pvs[0].moves[0], 'red'));
    }
    return shapes;
}
exports.default = default_1;

},{"ceval":39,"chess":44,"chessground/util":18}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("tree");
function canGoForward(ctrl) {
    return ctrl.vm.node.children.length > 0;
}
exports.canGoForward = canGoForward;
function next(ctrl) {
    var child = ctrl.vm.node.children[0];
    if (!child)
        return;
    ctrl.userJump(ctrl.vm.path + child.id);
}
exports.next = next;
function prev(ctrl) {
    ctrl.userJump(tree_1.path.init(ctrl.vm.path));
}
exports.prev = prev;
function last(ctrl) {
    var toInit = !tree_1.path.contains(ctrl.vm.path, ctrl.vm.initialPath);
    ctrl.userJump(toInit ? ctrl.vm.initialPath : tree_1.path.fromNodeList(ctrl.vm.mainline));
}
exports.last = last;
function first(ctrl) {
    var toInit = ctrl.vm.path !== ctrl.vm.initialPath && tree_1.path.contains(ctrl.vm.path, ctrl.vm.initialPath);
    ctrl.userJump(toInit ? ctrl.vm.initialPath : tree_1.path.root);
}
exports.first = first;

},{"tree":74}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("tree");
const ceval_1 = require("ceval");
const chess_1 = require("chess");
const util_1 = require("chessground/util");
const keyboard_1 = require("./keyboard");
const socket_1 = require("./socket");
const moveTest_1 = require("./moveTest");
const solution_1 = require("./solution");
const promotion_1 = require("./promotion");
const autoShape_1 = require("./autoShape");
const common_1 = require("common");
const storage_1 = require("common/storage");
const throttle_1 = require("common/throttle");
const xhr = require("./xhr");
const speech = require("./speech");
const sound_1 = require("./sound");
function default_1(opts, redraw) {
    let vm = {};
    var data, tree, ceval, moveTest;
    const ground = common_1.prop(undefined);
    const threatMode = common_1.prop(false);
    // required by ceval
    vm.showComputer = () => vm.mode === 'view';
    vm.showAutoShapes = () => true;
    function setPath(path) {
        vm.path = path;
        vm.nodeList = tree.getNodeList(path);
        vm.node = tree_1.ops.last(vm.nodeList);
        vm.mainline = tree_1.ops.mainlineNodeList(tree.root);
    }
    ;
    function withGround(f) {
        const g = ground();
        if (g)
            return f(g);
    }
    function initiate(fromData) {
        data = fromData;
        tree = tree_1.build(tree_1.ops.reconstruct(data.game.treeParts));
        var initialPath = tree_1.path.fromNodeList(tree_1.ops.mainlineNodeList(tree.root));
        // play | try | view
        vm.mode = 'play';
        vm.loading = false;
        vm.round = undefined;
        vm.voted = undefined;
        vm.justPlayed = undefined;
        vm.resultSent = false;
        vm.lastFeedback = 'init';
        vm.initialPath = initialPath;
        vm.initialNode = tree.nodeAtPath(initialPath);
        setPath(tree_1.path.init(initialPath));
        setTimeout(function () {
            jump(initialPath);
            redraw();
        }, 500);
        // just to delay button display
        vm.canViewSolution = false;
        setTimeout(function () {
            vm.canViewSolution = true;
            redraw();
        }, 5000);
        moveTest = moveTest_1.default(vm, data.puzzle);
        withGround(function (g) {
            g.setAutoShapes([]);
            g.setShapes([]);
            showGround(g);
        });
        instanciateCeval();
        history.replaceState(null, '', '/training/' + data.puzzle.id);
    }
    ;
    var makeCgOpts = function () {
        const node = vm.node;
        const color = node.ply % 2 === 0 ? 'white' : 'black';
        const dests = chess_1.readDests(node.dests);
        const movable = (vm.mode === 'view' || color === data.puzzle.color) ? {
            color: (dests && Object.keys(dests).length > 0) ? color : undefined,
            dests: dests || {}
        } : {
            color: undefined,
            dests: {}
        };
        const config = {
            fen: node.fen,
            orientation: data.puzzle.color,
            turnColor: color,
            movable: movable,
            premovable: {
                enabled: false
            },
            check: !!node.check,
            lastMove: uciToLastMove(node.uci)
        };
        if (node.ply >= vm.initialNode.ply) {
            if (!dests && !node.check) {
                // premove while dests are loading from server
                // can't use when in check because it highlights the wrong king
                config.turnColor = util_1.opposite(color);
                config.movable.color = color;
                config.premovable.enabled = true;
            }
            else if (vm.mode !== 'view' && color !== data.puzzle.color) {
                config.movable.color = data.puzzle.color;
                config.premovable.enabled = true;
            }
        }
        vm.cgConfig = config;
        return config;
    };
    function showGround(g) {
        g.set(makeCgOpts());
        if (!vm.node.dests)
            getDests();
    }
    ;
    function userMove(orig, dest) {
        vm.justPlayed = orig;
        if (!promotion.start(orig, dest, sendMove))
            sendMove(orig, dest);
    }
    ;
    function sendMove(orig, dest, prom) {
        const move = {
            orig: orig,
            dest: dest,
            fen: vm.node.fen,
            path: vm.path
        };
        if (prom)
            move.promotion = prom;
        socket.sendAnaMove(move);
    }
    ;
    var getDests = throttle_1.default(800, function () {
        if (!vm.node.dests && tree_1.path.contains(vm.path, vm.initialPath))
            socket.sendAnaDests({
                fen: vm.node.fen,
                path: vm.path
            });
    });
    var uciToLastMove = function (uci) {
        return uci && [uci.substr(0, 2), uci.substr(2, 2)]; // assuming standard chess
    };
    var addNode = function (node, path) {
        var newPath = tree.addNode(node, path);
        jump(newPath);
        reorderChildren(path);
        redraw();
        withGround(function (g) { g.playPremove(); });
        var progress = moveTest();
        if (progress)
            applyProgress(progress);
        redraw();
        speech.node(node, false);
    };
    function reorderChildren(path, recursive) {
        var node = tree.nodeAtPath(path);
        node.children.sort(function (c1, _) {
            if (c1.puzzle === 'fail')
                return 1;
            if (c1.puzzle === 'retry')
                return 1;
            if (c1.puzzle === 'good')
                return -1;
            return 0;
        });
        if (recursive)
            node.children.forEach(function (child) {
                reorderChildren(path + child.id, true);
            });
    }
    ;
    var revertUserMove = function () {
        setTimeout(function () {
            withGround(function (g) { g.cancelPremove(); });
            userJump(tree_1.path.init(vm.path));
            redraw();
        }, 500);
    };
    var applyProgress = function (progress) {
        if (progress === 'fail') {
            vm.lastFeedback = 'fail';
            revertUserMove();
            if (vm.mode === 'play') {
                vm.canViewSolution = true;
                vm.mode = 'try';
                sendResult(false);
            }
        }
        else if (progress === 'retry') {
            vm.lastFeedback = 'retry';
            revertUserMove();
        }
        else if (progress === 'win') {
            if (vm.mode !== 'view') {
                if (vm.mode === 'play')
                    sendResult(true);
                vm.lastFeedback = 'win';
                vm.mode = 'view';
                withGround(showGround); // to disable premoves
                startCeval();
            }
        }
        else if (progress && progress.orig) {
            vm.lastFeedback = 'good';
            setTimeout(function () {
                socket.sendAnaMove(progress);
            }, 500);
        }
    };
    function sendResult(win) {
        if (vm.resultSent)
            return;
        vm.resultSent = true;
        nbToVoteCall(Math.max(0, parseInt(nbToVoteCall()) - 1));
        xhr.round(data.puzzle.id, win).then(function (res) {
            data.user = res.user;
            vm.round = res.round;
            vm.voted = res.voted;
            redraw();
            if (win)
                speech.success();
        });
    }
    ;
    function nextPuzzle() {
        ceval.stop();
        vm.loading = true;
        redraw();
        xhr.nextPuzzle().done(function (d) {
            vm.round = null;
            vm.loading = false;
            initiate(d);
            redraw();
        });
    }
    ;
    function addDests(dests, path, opening) {
        tree.addDests(dests, path, opening);
        if (path === vm.path) {
            withGround(showGround);
            // redraw();
            if (gameOver())
                ceval.stop();
        }
        withGround(function (g) { g.playPremove(); });
    }
    ;
    function instanciateCeval() {
        if (ceval)
            ceval.destroy();
        ceval = ceval_1.ctrl({
            redraw,
            storageKeyPrefix: 'puzzle',
            multiPvDefault: 3,
            variant: {
                short: 'Std',
                name: 'Standard',
                key: 'standard'
            },
            possible: true,
            emit: function (ev, work) {
                tree.updateAt(work.path, function (node) {
                    if (work.threatMode) {
                        if (!node.threat || node.threat.depth <= ev.depth || node.threat.maxDepth < ev.maxDepth)
                            node.threat = ev;
                    }
                    else if (!node.ceval || node.ceval.depth <= ev.depth || node.ceval.maxDepth < ev.maxDepth)
                        node.ceval = ev;
                    if (work.path === vm.path) {
                        setAutoShapes();
                        redraw();
                    }
                });
            },
            setAutoShapes: setAutoShapes,
        });
    }
    ;
    function setAutoShapes() {
        withGround(function (g) {
            g.setAutoShapes(autoShape_1.default({
                vm: vm,
                ceval: ceval,
                ground: g,
                threatMode: threatMode(),
                nextNodeBest: nextNodeBest()
            }));
        });
    }
    ;
    function canUseCeval() {
        return vm.mode === 'view' && !gameOver();
    }
    ;
    function startCeval() {
        if (ceval.enabled() && canUseCeval())
            doStartCeval();
    }
    ;
    const doStartCeval = throttle_1.default(800, function () {
        ceval.start(vm.path, vm.nodeList, threatMode());
    });
    function nextNodeBest() {
        return tree_1.ops.withMainlineChild(vm.node, function (n) {
            // return n.eval ? n.eval.pvs[0].moves[0] : null;
            return n.eval ? n.eval.best : undefined;
        });
    }
    ;
    function playUci(uci) {
        var move = chess_1.decomposeUci(uci);
        if (!move[2])
            sendMove(move[0], move[1]);
        else
            sendMove(move[0], move[1], chess_1.sanToRole[move[2].toUpperCase()]);
    }
    ;
    function getCeval() {
        return ceval;
    }
    ;
    function toggleCeval() {
        ceval.toggle();
        setAutoShapes();
        startCeval();
        if (!ceval.enabled())
            threatMode(false);
        vm.autoScrollRequested = true;
        redraw();
    }
    ;
    function toggleThreatMode() {
        if (vm.node.check)
            return;
        if (!ceval.enabled())
            ceval.toggle();
        if (!ceval.enabled())
            return;
        threatMode(!threatMode());
        setAutoShapes();
        startCeval();
        redraw();
    }
    ;
    function gameOver() {
        if (vm.node.dests !== '')
            return false;
        return vm.node.check ? 'checkmate' : 'draw';
    }
    ;
    function jump(path) {
        const pathChanged = path !== vm.path, isForwardStep = pathChanged && path.length === vm.path.length + 2;
        setPath(path);
        withGround(showGround);
        if (pathChanged) {
            if (isForwardStep) {
                if (!vm.node.uci)
                    sound_1.sound.move(); // initial position
                else if (!vm.justPlayed || vm.node.uci.includes(vm.justPlayed)) {
                    if (vm.node.san.includes('x'))
                        sound_1.sound.capture();
                    else
                        sound_1.sound.move();
                }
                if (/\+|\#/.test(vm.node.san))
                    sound_1.sound.check();
            }
            threatMode(false);
            ceval.stop();
            startCeval();
        }
        promotion.cancel();
        vm.justPlayed = undefined;
        vm.autoScrollRequested = true;
        window.lichess.pubsub.emit('ply', vm.node.ply);
    }
    ;
    function userJump(path) {
        withGround(function (g) {
            g.selectSquare(null);
        });
        jump(path);
        speech.node(vm.node, true);
    }
    ;
    function viewSolution() {
        if (!vm.canViewSolution)
            return;
        sendResult(false);
        vm.mode = 'view';
        solution_1.default(vm.initialNode, data.puzzle.branch, data.puzzle.color);
        reorderChildren(vm.initialPath, true);
        // try and play the solution next move
        var next = vm.node.children[0];
        if (next && next.puzzle === 'good')
            userJump(vm.path + next.id);
        else {
            var firstGoodPath = tree_1.ops.takePathWhile(vm.mainline, function (node) {
                return node.puzzle !== 'good';
            });
            if (firstGoodPath)
                userJump(firstGoodPath + tree.nodeAtPath(firstGoodPath).children[0].id);
        }
        vm.autoScrollRequested = true;
        redraw();
        startCeval();
    }
    ;
    const socket = socket_1.default({
        send: opts.socketSend,
        addNode: addNode,
        addDests: addDests,
        reset: function () {
            withGround(showGround);
            redraw();
        }
    });
    function recentHash() {
        return 'ph' + data.puzzle.id + (data.user ? data.user.recent.reduce(function (h, r) {
            return h + r[0];
        }, '') : '');
    }
    const nbToVoteCall = storage_1.storedProp('puzzle.vote-call', 3);
    let thanksUntil;
    const callToVote = () => parseInt(nbToVoteCall()) < 1;
    const vote = throttle_1.default(1000, function (v) {
        if (callToVote())
            thanksUntil = Date.now() + 2000;
        nbToVoteCall(5);
        vm.voted = v;
        xhr.vote(data.puzzle.id, v).then(function (res) {
            data.puzzle.vote = res[1];
            redraw();
        });
    });
    initiate(opts.data);
    const promotion = promotion_1.default(vm, ground, redraw);
    keyboard_1.default({
        vm,
        userJump,
        getCeval,
        toggleCeval,
        toggleThreatMode,
        redraw,
        playBestMove() {
            var uci = nextNodeBest() || (vm.node.ceval && vm.node.ceval.pvs[0].moves[0]);
            if (uci)
                playUci(uci);
        }
    });
    // If the page loads while being hidden (like when changing settings),
    // chessground is not displayed, and the first move is not fully applied.
    // Make sure chessground is fully shown when the page goes back to being visible.
    document.addEventListener('visibilitychange', function () {
        window.lichess.requestIdleCallback(function () {
            jump(vm.path);
        });
    });
    speech.setup();
    return {
        vm,
        getData() {
            return data;
        },
        getTree() {
            return tree;
        },
        ground,
        makeCgOpts,
        userJump,
        viewSolution,
        nextPuzzle,
        recentHash,
        callToVote,
        thanks() {
            return !!thanksUntil && Date.now() < thanksUntil;
        },
        vote,
        getCeval,
        pref: opts.pref,
        trans: window.lichess.trans(opts.i18n),
        socketReceive: socket.receive,
        gameOver,
        toggleCeval,
        toggleThreatMode,
        threatMode,
        currentEvals() {
            return { client: vm.node.ceval };
        },
        nextNodeBest,
        userMove,
        playUci,
        showEvalGauge() {
            return vm.showComputer() && ceval.enabled();
        },
        getOrientation() {
            return withGround(function (g) { return g.state.orientation; });
        },
        getNode() {
            return vm.node;
        },
        showComputer: vm.showComputer,
        promotion,
        redraw,
        ongoing: false
    };
}
exports.default = default_1;

},{"./autoShape":53,"./keyboard":56,"./moveTest":58,"./promotion":59,"./socket":60,"./solution":61,"./sound":62,"./speech":63,"./xhr":73,"ceval":39,"chess":44,"chessground/util":18,"common":46,"common/storage":50,"common/throttle":52,"tree":74}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const control = require("./control");
const preventing = (f) => (e) => {
    e.preventDefault();
    f();
};
function default_1(ctrl) {
    if (!window.Mousetrap)
        return;
    const kbd = window.Mousetrap;
    kbd.bind(['left', 'k'], preventing(function () {
        control.prev(ctrl);
        ctrl.redraw();
    }));
    kbd.bind(['right', 'j'], preventing(function () {
        control.next(ctrl);
        ctrl.redraw();
    }));
    kbd.bind(['up', '0'], preventing(function () {
        control.first(ctrl);
        ctrl.redraw();
    }));
    kbd.bind(['down', '$'], preventing(function () {
        control.last(ctrl);
        ctrl.redraw();
    }));
    kbd.bind('l', preventing(ctrl.toggleCeval));
    kbd.bind('x', preventing(ctrl.toggleThreatMode));
    kbd.bind('space', preventing(function () {
        if (ctrl.vm.mode !== 'view')
            return;
        if (ctrl.getCeval().enabled())
            ctrl.playBestMove();
        else
            ctrl.toggleCeval();
    }));
}
exports.default = default_1;

},{"./control":54}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ctrl_1 = require("./ctrl");
const main_1 = require("./view/main");
const chessground_1 = require("chessground");
const snabbdom_1 = require("snabbdom");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const menuHover_1 = require("common/menuHover");
menuHover_1.menuHover();
const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
function default_1(opts) {
    let vnode, ctrl;
    function redraw() {
        vnode = patch(vnode, main_1.default(ctrl));
    }
    ctrl = ctrl_1.default(opts, redraw);
    const blueprint = main_1.default(ctrl);
    opts.element.innerHTML = '';
    vnode = patch(opts.element, blueprint);
    return {
        socketReceive: ctrl.socketReceive
    };
}
exports.default = default_1;
;
// that's for the rest of lichess to access chessground
// without having to include it a second time
window.Chessground = chessground_1.Chessground;

},{"./ctrl":55,"./view/main":70,"chessground":5,"common/menuHover":48,"snabbdom":35,"snabbdom/modules/attributes":33,"snabbdom/modules/class":34}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("tree");
const chess_1 = require("chess");
const altCastles = {
    e1a1: 'e1c1',
    e1h1: 'e1g1',
    e8a8: 'e8c8',
    e8h8: 'e8g8'
};
function default_1(vm, puzzle) {
    return function () {
        if (vm.mode === 'view')
            return;
        if (!tree_1.path.contains(vm.path, vm.initialPath))
            return;
        var playedByColor = vm.node.ply % 2 === 1 ? 'white' : 'black';
        if (playedByColor !== puzzle.color)
            return;
        var nodes = vm.nodeList.slice(tree_1.path.size(vm.initialPath) + 1).map(function (node) {
            return {
                uci: node.uci,
                castle: node.san.startsWith('O-O')
            };
        });
        var progress = puzzle.lines;
        for (var i in nodes) {
            if (progress[nodes[i].uci])
                progress = progress[nodes[i].uci];
            else if (nodes[i].castle)
                progress = progress[altCastles[nodes[i].uci]] || 'fail';
            else
                progress = 'fail';
            if (typeof progress === 'string')
                break;
        }
        if (typeof progress === 'string') {
            vm.node.puzzle = progress;
            return progress;
        }
        var nextKey = Object.keys(progress)[0];
        if (progress[nextKey] === 'win') {
            vm.node.puzzle = 'win';
            return 'win';
        }
        // from here we have a next move
        vm.node.puzzle = 'good';
        var opponentUci = chess_1.decomposeUci(nextKey);
        var promotion = opponentUci[2] ? chess_1.sanToRole[opponentUci[2].toUpperCase()] : null;
        var move = {
            orig: opponentUci[0],
            dest: opponentUci[1],
            fen: vm.node.fen,
            path: vm.path
        };
        if (promotion)
            move.promotion = promotion;
        return move;
    };
}
exports.default = default_1;

},{"chess":44,"tree":74}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
const cgUtil = require("chessground/util");
function default_1(vm, getGround, redraw) {
    let promoting = false;
    function start(orig, dest, callback) {
        const g = getGround(), piece = g.state.pieces[dest];
        if (piece && piece.role == 'pawn' && ((dest[1] == 8 && g.state.turnColor == 'black') ||
            (dest[1] == 1 && g.state.turnColor == 'white'))) {
            promoting = {
                orig: orig,
                dest: dest,
                callback: callback
            };
            redraw();
            return true;
        }
        return false;
    }
    ;
    function promote(g, key, role) {
        var pieces = {};
        var piece = g.state.pieces[key];
        if (piece && piece.role == 'pawn') {
            pieces[key] = {
                color: piece.color,
                role: role,
                promoted: true
            };
            g.setPieces(pieces);
        }
    }
    function finish(role) {
        if (promoting)
            promote(getGround(), promoting.dest, role);
        if (promoting.callback)
            promoting.callback(promoting.orig, promoting.dest, role);
        promoting = false;
    }
    ;
    function cancel() {
        if (promoting) {
            promoting = false;
            getGround().set(vm.cgConfig);
            redraw();
        }
    }
    function renderPromotion(dest, pieces, color, orientation) {
        if (!promoting)
            return;
        let left = (8 - cgUtil.key2pos(dest)[0]) * 12.5;
        if (orientation === 'white')
            left = 87.5 - left;
        const vertical = color === orientation ? 'top' : 'bottom';
        return snabbdom_1.h('div#promotion-choice.' + vertical, {
            hook: util_1.onInsert(el => {
                el.addEventListener('click', cancel);
                el.oncontextmenu = () => false;
            })
        }, pieces.map(function (serverRole, i) {
            const top = (color === orientation ? i : 7 - i) * 12.5;
            return snabbdom_1.h('square', {
                attrs: {
                    style: 'top: ' + top + '%;left: ' + left + '%'
                },
                hook: util_1.bind('click', e => {
                    e.stopPropagation();
                    finish(serverRole);
                })
            }, [snabbdom_1.h('piece.' + serverRole + '.' + color)]);
        }));
    }
    ;
    return {
        start,
        cancel,
        view() {
            if (!promoting)
                return;
            const pieces = ['queen', 'knight', 'rook', 'bishop'];
            return renderPromotion(promoting.dest, pieces, cgUtil.opposite(getGround().state.turnColor), getGround().state.orientation);
        }
    };
}
exports.default = default_1;

},{"./util":64,"chessground/util":18,"snabbdom":35}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(opts) {
    var anaMoveTimeout;
    var anaDestsTimeout;
    var anaDestsCache = {};
    var handlers = {
        node: function (data) {
            clearTimeout(anaMoveTimeout);
            opts.addNode(data.node, data.path);
        },
        stepFailure: function () {
            clearTimeout(anaMoveTimeout);
            opts.reset();
        },
        dests: function (data) {
            anaDestsCache[data.path] = data;
            opts.addDests(data.dests, data.path, data.opening);
            clearTimeout(anaDestsTimeout);
        },
        destsFailure: function (data) {
            console.log(data);
            clearTimeout(anaDestsTimeout);
        }
    };
    var sendAnaMove = function (req) {
        clearTimeout(anaMoveTimeout);
        opts.send('anaMove', req);
        anaMoveTimeout = setTimeout(function () {
            sendAnaMove(req);
        }, 3000);
    };
    var sendAnaDests = function (req) {
        clearTimeout(anaDestsTimeout);
        if (anaDestsCache[req.path])
            setTimeout(function () {
                handlers.dests(anaDestsCache[req.path]);
            }, 10);
        else {
            opts.send('anaDests', req);
            anaDestsTimeout = setTimeout(function () {
                sendAnaDests(req);
            }, 3000);
        }
    };
    return {
        send: opts.send,
        receive: function (type, data) {
            if (handlers[type]) {
                handlers[type](data);
                return true;
            }
            return false;
        },
        sendAnaMove: sendAnaMove,
        sendAnaDests: sendAnaDests
    };
}
exports.default = default_1;

},{}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("tree");
function default_1(initialNode, solution, color) {
    tree_1.ops.updateAll(solution, function (node) {
        if ((color === 'white') === (node.ply % 2 === 1))
            node.puzzle = 'good';
    });
    const solutionNode = tree_1.ops.childById(initialNode, solution.id);
    if (solutionNode)
        tree_1.ops.merge(solutionNode, solution);
    else
        initialNode.children.push(solution);
}
exports.default = default_1;
;

},{"tree":74}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throttle_1 = require("common/throttle");
const sounds = window.lichess.sound;
exports.sound = {
    move: throttle_1.default(50, sounds.move),
    capture: throttle_1.default(50, sounds.capture),
    check: throttle_1.default(50, sounds.check)
};

},{"common/throttle":52}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setup() {
    window.lichess.pubsub.on('speech.enabled', onSpeechChange);
    onSpeechChange(window.lichess.sound.speech());
}
exports.setup = setup;
function onSpeechChange(enabled) {
    if (!window.LichessSpeech && enabled)
        window.lichess.loadScript(window.lichess.compiledScript('speech'));
    else if (window.LichessSpeech && !enabled)
        window.LichessSpeech = undefined;
}
function node(n, cut) {
    withSpeech(s => s.step(n, cut));
}
exports.node = node;
function success() {
    withSpeech(s => s.say("Success!", false));
}
exports.success = success;
function withSpeech(f) {
    if (window.LichessSpeech)
        f(window.LichessSpeech);
}

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
function bindMobileMousedown(el, f, redraw) {
    for (const mousedownEvent of ['touchstart', 'mousedown']) {
        el.addEventListener(mousedownEvent, e => {
            f(e);
            e.preventDefault();
            if (redraw)
                redraw();
        });
    }
}
exports.bindMobileMousedown = bindMobileMousedown;
function bind(eventName, f, redraw) {
    return onInsert(el => el.addEventListener(eventName, e => {
        const res = f(e);
        if (redraw)
            redraw();
        return res;
    }));
}
exports.bind = bind;
function onInsert(f) {
    return {
        insert: vnode => f(vnode.elm)
    };
}
exports.onInsert = onInsert;
function dataIcon(icon) {
    return {
        'data-icon': icon
    };
}
exports.dataIcon = dataIcon;
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

},{"snabbdom":35}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("../util");
function renderVote(ctrl) {
    var data = ctrl.getData();
    if (!data.puzzle.enabled)
        return;
    return snabbdom_1.h('div.vote', [
        snabbdom_1.h('a', {
            attrs: {
                'data-icon': 'S',
                title: ctrl.trans.noarg('thisPuzzleIsCorrect')
            },
            class: { active: ctrl.vm.voted === true },
            hook: util_1.bind('click', () => ctrl.vote(true))
        }),
        snabbdom_1.h('span.count', {
            attrs: {
                title: 'Popularity'
            }
        }, '' + Math.max(0, data.puzzle.vote)),
        snabbdom_1.h('a', {
            attrs: {
                'data-icon': 'R',
                title: ctrl.trans.noarg('thisPuzzleIsWrong')
            },
            class: { active: ctrl.vm.voted === false },
            hook: util_1.bind('click', () => ctrl.vote(false))
        })
    ]);
}
function default_1(ctrl) {
    const data = ctrl.getData();
    const voteCall = !!data.user && ctrl.callToVote() && data.puzzle.enabled && data.voted === undefined;
    return snabbdom_1.h('div.puzzle__feedback.after' + (voteCall ? '.call' : ''), [
        voteCall ? snabbdom_1.h('div.vote_call', [
            snabbdom_1.h('strong', ctrl.trans('wasThisPuzzleAnyGood')),
            snabbdom_1.h('br'),
            snabbdom_1.h('span', ctrl.trans('pleaseVotePuzzle'))
        ]) : (ctrl.thanks() ? snabbdom_1.h('div.vote_call', snabbdom_1.h('strong', ctrl.trans('thankYou'))) : null),
        snabbdom_1.h('div.half.half-top', [
            ctrl.vm.lastFeedback === 'win' ? snabbdom_1.h('div.complete.feedback.win', snabbdom_1.h('div.player', [
                snabbdom_1.h('div.icon', '✓'),
                snabbdom_1.h('div.instruction', ctrl.trans.noarg('success'))
            ])) : snabbdom_1.h('div.complete', 'Puzzle complete!'),
            data.user ? renderVote(ctrl) : null
        ]),
        snabbdom_1.h('a.half.continue', {
            hook: util_1.bind('click', ctrl.nextPuzzle)
        }, [
            snabbdom_1.h('i', { attrs: util_1.dataIcon('G') }),
            ctrl.trans.noarg('continueTraining')
        ])
    ]);
}
exports.default = default_1;

},{"../util":64,"snabbdom":35}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const chessground_1 = require("chessground");
const resize_1 = require("common/resize");
function default_1(ctrl) {
    return snabbdom_1.h('div.cg-wrap', {
        hook: {
            insert: vnode => ctrl.ground(chessground_1.Chessground(vnode.elm, makeConfig(ctrl))),
            destroy: _ => ctrl.ground().destroy()
        }
    });
}
exports.default = default_1;
function makeConfig(ctrl) {
    const opts = ctrl.makeCgOpts();
    return {
        fen: opts.fen,
        orientation: opts.orientation,
        turnColor: opts.turnColor,
        check: opts.check,
        lastMove: opts.lastMove,
        coordinates: ctrl.pref.coords !== 0,
        addPieceZIndex: ctrl.pref.is3d,
        movable: {
            free: false,
            color: opts.movable.color,
            dests: opts.movable.dests,
            showDests: ctrl.pref.destination,
            rookCastle: ctrl.pref.rookCastle
        },
        draggable: {
            enabled: ctrl.pref.moveEvent > 0,
            showGhost: ctrl.pref.highlight
        },
        selectable: {
            enabled: ctrl.pref.moveEvent !== 1
        },
        events: {
            move: ctrl.userMove,
            insert(elements) {
                resize_1.default(elements, ctrl.pref.resizeHandle, ctrl.vm.node.ply, (_) => true);
            }
        },
        premovable: {
            enabled: opts.premovable.enabled
        },
        drawable: {
            enabled: true
        },
        highlight: {
            lastMove: ctrl.pref.highlight,
            check: ctrl.pref.highlight
        },
        animation: {
            enabled: true,
            duration: ctrl.pref.animation.duration
        },
        disableContextMenu: true
    };
}

},{"chessground":5,"common/resize":49,"snabbdom":35}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const after_1 = require("./after");
const util_1 = require("../util");
function viewSolution(ctrl) {
    return snabbdom_1.h('div.view_solution', {
        class: { show: ctrl.vm.canViewSolution }
    }, [
        snabbdom_1.h('a.button.button-empty', {
            hook: util_1.bind('click', ctrl.viewSolution)
        }, ctrl.trans.noarg('viewTheSolution'))
    ]);
}
function initial(ctrl) {
    var puzzleColor = ctrl.getData().puzzle.color;
    return snabbdom_1.h('div.puzzle__feedback.play', [
        snabbdom_1.h('div.player', [
            snabbdom_1.h('div.no-square', snabbdom_1.h('piece.king.' + puzzleColor)),
            snabbdom_1.h('div.instruction', [
                snabbdom_1.h('strong', ctrl.trans.noarg('yourTurn')),
                snabbdom_1.h('em', ctrl.trans.noarg(puzzleColor === 'white' ? 'findTheBestMoveForWhite' : 'findTheBestMoveForBlack'))
            ])
        ]),
        viewSolution(ctrl)
    ]);
}
function good(ctrl) {
    return snabbdom_1.h('div.puzzle__feedback.good', [
        snabbdom_1.h('div.player', [
            snabbdom_1.h('div.icon', '✓'),
            snabbdom_1.h('div.instruction', [
                snabbdom_1.h('strong', ctrl.trans.noarg('bestMove')),
                snabbdom_1.h('em', ctrl.trans.noarg('keepGoing'))
            ])
        ]),
        viewSolution(ctrl)
    ]);
}
function retry(ctrl) {
    return snabbdom_1.h('div.puzzle__feedback.retry', [
        snabbdom_1.h('div.player', [
            snabbdom_1.h('div.icon', '!'),
            snabbdom_1.h('div.instruction', [
                snabbdom_1.h('strong', ctrl.trans.noarg('goodMove')),
                snabbdom_1.h('em', ctrl.trans.noarg('butYouCanDoBetter'))
            ])
        ]),
        viewSolution(ctrl)
    ]);
}
function fail(ctrl) {
    return snabbdom_1.h('div.puzzle__feedback.fail', [
        snabbdom_1.h('div.player', [
            snabbdom_1.h('div.icon', '✗'),
            snabbdom_1.h('div.instruction', [
                snabbdom_1.h('strong', ctrl.trans.noarg('puzzleFailed')),
                snabbdom_1.h('em', ctrl.trans.noarg('butYouCanKeepTrying'))
            ])
        ]),
        viewSolution(ctrl)
    ]);
}
function loading() {
    return snabbdom_1.h('div.puzzle__feedback.loading', util_1.spinner());
}
function default_1(ctrl) {
    if (ctrl.vm.loading)
        return loading();
    if (ctrl.vm.mode === 'view')
        return after_1.default(ctrl);
    if (ctrl.vm.lastFeedback === 'init')
        return initial(ctrl);
    if (ctrl.vm.lastFeedback === 'good')
        return good(ctrl);
    if (ctrl.vm.lastFeedback === 'retry')
        return retry(ctrl);
    if (ctrl.vm.lastFeedback === 'fail')
        return fail(ctrl);
}
exports.default = default_1;

},{"../util":64,"./after":65,"snabbdom":35}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gridHacks = require("common/gridHacks");
function start(container) {
    if (!gridHacks.needsBoardHeightFix())
        return;
    const runHacks = () => gridHacks.fixMainBoardHeight(container);
    gridHacks.runner(runHacks);
    gridHacks.bindChessgroundResizeOnce(runHacks);
}
exports.start = start;

},{"common/gridHacks":47}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const historySize = 15;
function render(ctrl) {
    const data = ctrl.getData();
    const slots = [];
    for (let i = 0; i < historySize; i++)
        slots[i] = data.user.recent[i] || null;
    return snabbdom_1.h('div.puzzle__history', slots.map(function (s) {
        if (s)
            return snabbdom_1.h('a', {
                class: {
                    current: data.puzzle.id === s[0],
                    win: s[1] >= 0,
                    loss: s[1] < 0
                },
                attrs: { href: '/training/' + s[0] }
            }, s[1] > 0 ? '+' + s[1] : '−' + (-s[1]));
    }));
}
function default_1(ctrl) {
    if (!ctrl.getData().user)
        return;
    return snabbdom_1.thunk('div.puzzle__history', render, [ctrl, ctrl.recentHash()]);
}
exports.default = default_1;
;

},{"snabbdom":35}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const chessground_1 = require("./chessground");
const tree_1 = require("./tree");
const ceval_1 = require("ceval");
const control = require("../control");
const feedback_1 = require("./feedback");
const history_1 = require("./history");
const side = require("./side");
const gridHacks = require("./gridHacks");
const util_1 = require("../util");
function renderOpeningBox(ctrl) {
    var opening = ctrl.getTree().getOpening(ctrl.vm.nodeList);
    if (opening)
        return snabbdom_1.h('div.opening_box', {
            attrs: { title: opening.eco + ' ' + opening.name }
        }, [
            snabbdom_1.h('strong', opening.eco),
            ' ' + opening.name
        ]);
}
function renderAnalyse(ctrl) {
    return snabbdom_1.h('div.puzzle__moves.areplay', [
        renderOpeningBox(ctrl),
        tree_1.render(ctrl)
    ]);
}
function wheel(ctrl, e) {
    const target = e.target;
    if (target.tagName !== 'PIECE' && target.tagName !== 'SQUARE' && target.tagName !== 'CG-BOARD')
        return;
    e.preventDefault();
    if (e.deltaY > 0)
        control.next(ctrl);
    else if (e.deltaY < 0)
        control.prev(ctrl);
    ctrl.redraw();
    return false;
}
function dataAct(e) {
    return e.target.getAttribute('data-act') || e.target.parentNode.getAttribute('data-act');
}
function jumpButton(icon, effect) {
    return snabbdom_1.h('button.fbt', {
        attrs: {
            'data-act': effect,
            'data-icon': icon
        }
    });
}
function controls(ctrl) {
    return snabbdom_1.h('div.puzzle__controls.analyse-controls', {
        hook: util_1.onInsert(el => {
            util_1.bindMobileMousedown(el, e => {
                const action = dataAct(e);
                if (action === 'prev')
                    control.prev(ctrl);
                else if (action === 'next')
                    control.next(ctrl);
                else if (action === 'first')
                    control.first(ctrl);
                else if (action === 'last')
                    control.last(ctrl);
            }, ctrl.redraw);
        })
    }, [
        snabbdom_1.h('div.jumps', [
            jumpButton('W', 'first'),
            jumpButton('Y', 'prev'),
            jumpButton('X', 'next'),
            jumpButton('V', 'last')
        ])
    ]);
}
let cevalShown = false;
function default_1(ctrl) {
    const showCeval = ctrl.vm.showComputer(), gaugeOn = ctrl.showEvalGauge();
    if (cevalShown !== showCeval) {
        if (!cevalShown)
            ctrl.vm.autoScrollNow = true;
        cevalShown = showCeval;
    }
    return snabbdom_1.h('main.puzzle', {
        class: { 'gauge-on': gaugeOn },
        hook: {
            postpatch(old, vnode) {
                gridHacks.start(vnode.elm);
                if (old.data.gaugeOn !== gaugeOn) {
                    if (ctrl.pref.coords == 2)
                        $('body').toggleClass('coords-in', gaugeOn).toggleClass('coords-out', !gaugeOn);
                    window.lichess.dispatchEvent(document.body, 'chessground.resize');
                }
                vnode.data.gaugeOn = gaugeOn;
            }
        }
    }, [
        snabbdom_1.h('aside.puzzle__side', [
            side.puzzleBox(ctrl),
            side.userBox(ctrl)
        ]),
        snabbdom_1.h('div.puzzle__board.main-board' + (ctrl.pref.blindfold ? '.blindfold' : ''), {
            hook: window.lichess.hasTouchEvents ? undefined : util_1.bind('wheel', e => wheel(ctrl, e))
        }, [
            chessground_1.default(ctrl),
            ctrl.promotion.view()
        ]),
        ceval_1.view.renderGauge(ctrl),
        snabbdom_1.h('div.puzzle__tools', [
            // we need the wrapping div here
            // so the siblings are only updated when ceval is added
            snabbdom_1.h('div.ceval-wrap', {
                class: { none: !showCeval }
            }, showCeval ? [
                ceval_1.view.renderCeval(ctrl),
                ceval_1.view.renderPvs(ctrl)
            ] : []),
            renderAnalyse(ctrl),
            feedback_1.default(ctrl)
        ]),
        controls(ctrl),
        history_1.default(ctrl)
    ]);
}
exports.default = default_1;

},{"../control":54,"../util":64,"./chessground":66,"./feedback":67,"./gridHacks":68,"./history":69,"./side":71,"./tree":72,"ceval":39,"snabbdom":35}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("../util");
function puzzleBox(ctrl) {
    var data = ctrl.getData();
    return snabbdom_1.h('div.puzzle__side__metas', [
        puzzleInfos(ctrl, data.puzzle),
        gameInfos(ctrl, data.game, data.puzzle)
    ]);
}
exports.puzzleBox = puzzleBox;
function puzzleInfos(ctrl, puzzle) {
    return snabbdom_1.h('div.infos.puzzle', {
        attrs: util_1.dataIcon('-')
    }, [snabbdom_1.h('div', [
            snabbdom_1.h('a.title', {
                attrs: { href: '/training/' + puzzle.id }
            }, ctrl.trans('puzzleId', puzzle.id)),
            snabbdom_1.h('p', ctrl.trans.vdom('ratingX', ctrl.vm.mode === 'play' ? snabbdom_1.h('span.hidden', ctrl.trans.noarg('hidden')) : snabbdom_1.h('strong', puzzle.rating))),
            snabbdom_1.h('p', ctrl.trans.vdom('playedXTimes', snabbdom_1.h('strong', window.lichess.numberFormat(puzzle.attempts))))
        ])]);
}
function gameInfos(ctrl, game, puzzle) {
    return snabbdom_1.h('div.infos', {
        attrs: util_1.dataIcon(game.perf.icon)
    }, [snabbdom_1.h('div', [
            snabbdom_1.h('p', ctrl.trans.vdom('fromGameLink', snabbdom_1.h('a', {
                attrs: { href: `/${game.id}/${puzzle.color}#${puzzle.initialPly}` }
            }, '#' + game.id))),
            snabbdom_1.h('p', [
                game.clock, ' • ',
                game.perf.name, ' • ',
                ctrl.trans.noarg(game.rated ? 'rated' : 'casual')
            ]),
            snabbdom_1.h('div.players', game.players.map(function (p) {
                return snabbdom_1.h('div.player.color-icon.is.text.' + p.color, p.userId ? snabbdom_1.h('a.user-link.ulpt', {
                    attrs: { href: '/@/' + p.userId }
                }, p.name) : p.name);
            }))
        ])]);
}
function userBox(ctrl) {
    const data = ctrl.getData();
    if (!data.user)
        return;
    const diff = ctrl.vm.round && ctrl.vm.round.ratingDiff;
    const hash = ctrl.recentHash();
    return snabbdom_1.h('div.puzzle__side__user', [
        snabbdom_1.h('h2', ctrl.trans.vdom('yourPuzzleRatingX', snabbdom_1.h('strong', [
            data.user.rating,
            ...(diff > 0 ? [' ', snabbdom_1.h('good.rp', '+' + diff)] : []),
            ...(diff < 0 ? [' ', snabbdom_1.h('bad.rp', '−' + (-diff))] : [])
        ]))),
        snabbdom_1.h('div', snabbdom_1.thunk('div.rating_chart.' + hash, ratingChart, [ctrl, hash]))
    ]);
}
exports.userBox = userBox;
function ratingChart(ctrl, hash) {
    return snabbdom_1.h('div.rating_chart.' + hash, {
        hook: {
            insert(vnode) { drawRatingChart(ctrl, vnode); },
            postpatch(_, vnode) { drawRatingChart(ctrl, vnode); }
        }
    });
}
function drawRatingChart(ctrl, vnode) {
    const $el = $(vnode.elm);
    const dark = document.body.classList.contains('dark');
    const points = ctrl.getData().user.recent.map(function (r) {
        return r[2] + r[1];
    });
    const redraw = () => $el['sparkline'](points, {
        type: 'line',
        width: Math.round($el.outerWidth()) + 'px',
        height: '80px',
        lineColor: dark ? '#4444ff' : '#0000ff',
        fillColor: dark ? '#222255' : '#ccccff',
        numberFormatter: (x) => { return x; }
    });
    window.lichess.raf(redraw);
    window.addEventListener('resize', redraw);
}

},{"../util":64,"snabbdom":35}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const common_1 = require("common");
const throttle_1 = require("common/throttle");
const chess_1 = require("chess");
const tree_1 = require("tree");
const autoScroll = throttle_1.default(150, (ctrl, el) => {
    var cont = el.parentNode;
    var target = el.querySelector('.active');
    if (!target) {
        cont.scrollTop = ctrl.vm.path === tree_1.path.root ? 0 : 99999;
        return;
    }
    cont.scrollTop = target.offsetTop - cont.offsetHeight / 2 + target.offsetHeight;
});
function pathContains(ctx, path) {
    return tree_1.path.contains(ctx.ctrl.vm.path, path);
}
function plyToTurn(ply) {
    return Math.floor((ply - 1) / 2) + 1;
}
function renderIndex(ply, withDots) {
    return snabbdom_1.h('index', plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? '.' : '...') : ''));
}
exports.renderIndex = renderIndex;
function renderChildrenOf(ctx, node, opts) {
    const cs = node.children, main = cs[0];
    if (!main)
        return [];
    if (opts.isMainline) {
        const isWhite = main.ply % 2 === 1;
        if (!cs[1])
            return [
                isWhite ? renderIndex(main.ply, false) : null,
                ...renderMoveAndChildrenOf(ctx, main, {
                    parentPath: opts.parentPath,
                    isMainline: true
                })
            ];
        const mainChildren = renderChildrenOf(ctx, main, {
            parentPath: opts.parentPath + main.id,
            isMainline: true
        }), passOpts = {
            parentPath: opts.parentPath,
            isMainline: true
        };
        return [
            isWhite ? renderIndex(main.ply, false) : null,
            renderMoveOf(ctx, main, passOpts),
            isWhite ? emptyMove() : null,
            snabbdom_1.h('interrupt', renderLines(ctx, cs.slice(1), {
                parentPath: opts.parentPath,
                isMainline: true
            })),
            ...(isWhite && mainChildren ? [
                renderIndex(main.ply, false),
                emptyMove()
            ] : []),
            ...mainChildren
        ];
    }
    return cs[1] ? [renderLines(ctx, cs, opts)] : renderMoveAndChildrenOf(ctx, main, opts);
}
function renderLines(ctx, nodes, opts) {
    return snabbdom_1.h('lines', {
        class: { single: !!nodes[1] }
    }, nodes.map(function (n) {
        return snabbdom_1.h('line', renderMoveAndChildrenOf(ctx, n, {
            parentPath: opts.parentPath,
            isMainline: false,
            withIndex: true
        }));
    }));
}
function renderMoveOf(ctx, node, opts) {
    return opts.isMainline ? renderMainlineMoveOf(ctx, node, opts) : renderVariationMoveOf(ctx, node, opts);
}
function renderMainlineMoveOf(ctx, node, opts) {
    const path = opts.parentPath + node.id;
    const classes = {
        active: path === ctx.ctrl.vm.path,
        current: path === ctx.ctrl.vm.initialPath,
        hist: node.ply < ctx.ctrl.vm.initialNode.ply
    };
    if (node.puzzle)
        classes[node.puzzle] = true;
    return snabbdom_1.h('move', {
        attrs: { p: path },
        class: classes
    }, renderMove(ctx, node));
}
function renderGlyph(glyph) {
    return snabbdom_1.h('glyph', {
        attrs: { title: glyph.name }
    }, glyph.symbol);
}
function puzzleGlyph(ctx, node) {
    switch (node.puzzle) {
        case 'good':
        case 'win':
            return renderGlyph({
                name: ctx.ctrl.trans.noarg('bestMove'),
                symbol: '✓'
            });
        case 'fail':
            return renderGlyph({
                name: ctx.ctrl.trans.noarg('puzzleFailed'),
                symbol: '✗'
            });
        case 'retry':
            return renderGlyph({
                name: ctx.ctrl.trans.noarg('goodMove'),
                symbol: '?!'
            });
    }
}
function renderMove(ctx, node) {
    const ev = node.eval || node.ceval || {};
    return [
        node.san,
        common_1.defined(ev.cp) ? renderEval(chess_1.renderEval(ev.cp)) : (common_1.defined(ev.mate) ? renderEval('#' + ev.mate) : null),
        puzzleGlyph(ctx, node)
    ];
}
exports.renderMove = renderMove;
function renderVariationMoveOf(ctx, node, opts) {
    const withIndex = opts.withIndex || node.ply % 2 === 1;
    const path = opts.parentPath + node.id;
    const active = path === ctx.ctrl.vm.path;
    const classes = {
        active,
        parent: !active && pathContains(ctx, path)
    };
    if (node.puzzle)
        classes[node.puzzle] = true;
    return snabbdom_1.h('move', {
        attrs: { p: path },
        class: classes
    }, [
        withIndex ? renderIndex(node.ply, true) : null,
        node.san,
        puzzleGlyph(ctx, node)
    ]);
}
function renderMoveAndChildrenOf(ctx, node, opts) {
    return [
        renderMoveOf(ctx, node, opts),
        ...renderChildrenOf(ctx, node, {
            parentPath: opts.parentPath + node.id,
            isMainline: opts.isMainline
        })
    ];
}
function emptyMove() {
    return snabbdom_1.h('move.empty', '...');
}
function renderEval(e) {
    return snabbdom_1.h('eval', e);
}
function eventPath(e) {
    return e.target.getAttribute('p') || e.target.parentNode.getAttribute('p');
}
function render(ctrl) {
    const root = ctrl.getTree().root;
    const ctx = {
        ctrl: ctrl,
        showComputer: false
    };
    return snabbdom_1.h('div.tview2.tview2-column', {
        hook: {
            insert: vnode => {
                const el = vnode.elm;
                if (ctrl.path !== tree_1.path.root)
                    autoScroll(ctrl, el);
                el.addEventListener('mousedown', (e) => {
                    if (common_1.defined(e.button) && e.button !== 0)
                        return; // only touch or left click
                    const path = eventPath(e);
                    if (path)
                        ctrl.userJump(path);
                    ctrl.redraw();
                });
            },
            postpatch: (_, vnode) => {
                if (ctrl.vm.autoScrollNow) {
                    autoScroll(ctrl, vnode.elm);
                    ctrl.vm.autoScrollNow = false;
                    ctrl.autoScrollRequested = false;
                }
                else if (ctrl.vm.autoScrollRequested) {
                    if (ctrl.vm.path !== tree_1.path.root)
                        autoScroll(ctrl, vnode.elm);
                    ctrl.vm.autoScrollRequested = false;
                }
            }
        }
    }, [
        ...(root.ply % 2 === 1 ? [
            renderIndex(root.ply, false),
            emptyMove()
        ] : []),
        ...renderChildrenOf(ctx, root, {
            parentPath: '',
            isMainline: true
        })
    ]);
}
exports.render = render;

},{"chess":44,"common":46,"common/throttle":52,"snabbdom":35,"tree":74}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// do NOT set mobile API headers here
// they trigger a compat layer
function round(puzzleId, win) {
    return $.ajax({
        method: 'POST',
        url: '/training/' + puzzleId + '/round2',
        data: {
            win: win ? 1 : 0
        }
    });
}
exports.round = round;
function vote(puzzleId, v) {
    return $.ajax({
        method: 'POST',
        url: '/training/' + puzzleId + '/vote',
        data: {
            vote: v ? 1 : 0
        }
    });
}
exports.vote = vote;
function nextPuzzle() {
    return $.ajax({
        url: '/training/new'
    });
}
exports.nextPuzzle = nextPuzzle;

},{}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("./tree");
exports.build = tree_1.build;
const path = require("./path");
exports.path = path;
const ops = require("./ops");
exports.ops = ops;

},{"./ops":75,"./path":76,"./tree":77}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function withMainlineChild(node, f) {
    const next = node.children[0];
    return next ? f(next) : undefined;
}
exports.withMainlineChild = withMainlineChild;
function findInMainline(fromNode, predicate) {
    const findFrom = function (node) {
        if (predicate(node))
            return node;
        return withMainlineChild(node, findFrom);
    };
    return findFrom(fromNode);
}
exports.findInMainline = findInMainline;
// returns a list of nodes collected from the original one
function collect(from, pickChild) {
    let nodes = [from], n = from, c;
    while (c = pickChild(n)) {
        nodes.push(c);
        n = c;
    }
    return nodes;
}
exports.collect = collect;
function pickFirstChild(node) {
    return node.children[0];
}
function childById(node, id) {
    return node.children.find(child => child.id === id);
}
exports.childById = childById;
function last(nodeList) {
    return nodeList[nodeList.length - 1];
}
exports.last = last;
function nodeAtPly(nodeList, ply) {
    return nodeList.find(node => node.ply === ply);
}
exports.nodeAtPly = nodeAtPly;
function takePathWhile(nodeList, predicate) {
    let path = '';
    for (let i in nodeList) {
        if (predicate(nodeList[i]))
            path += nodeList[i].id;
        else
            break;
    }
    return path;
}
exports.takePathWhile = takePathWhile;
function removeChild(parent, id) {
    parent.children = parent.children.filter(function (n) {
        return n.id !== id;
    });
}
exports.removeChild = removeChild;
function countChildrenAndComments(node) {
    const count = {
        nodes: 1,
        comments: (node.comments || []).length
    };
    node.children.forEach(function (child) {
        const c = countChildrenAndComments(child);
        count.nodes += c.nodes;
        count.comments += c.comments;
    });
    return count;
}
exports.countChildrenAndComments = countChildrenAndComments;
function reconstruct(parts) {
    const root = parts[0], nb = parts.length;
    let node = root, i;
    root.id = '';
    for (i = 1; i < nb; i++) {
        const n = parts[i];
        if (node.children)
            node.children.unshift(n);
        else
            node.children = [n];
        node = n;
    }
    node.children = node.children || [];
    return root;
}
exports.reconstruct = reconstruct;
// adds n2 into n1
function merge(n1, n2) {
    n1.eval = n2.eval;
    if (n2.glyphs)
        n1.glyphs = n2.glyphs;
    n2.comments && n2.comments.forEach(function (c) {
        if (!n1.comments)
            n1.comments = [c];
        else if (!n1.comments.filter(function (d) {
            return d.text === c.text;
        }).length)
            n1.comments.push(c);
    });
    n2.children.forEach(function (c) {
        const existing = childById(n1, c.id);
        if (existing)
            merge(existing, c);
        else
            n1.children.push(c);
    });
}
exports.merge = merge;
function hasBranching(node, maxDepth) {
    return maxDepth <= 0 || !!node.children[1] || (node.children[0] && hasBranching(node.children[0], maxDepth - 1));
}
exports.hasBranching = hasBranching;
function mainlineNodeList(from) {
    return collect(from, pickFirstChild);
}
exports.mainlineNodeList = mainlineNodeList;
function updateAll(root, f) {
    // applies f recursively to all nodes
    function update(node) {
        f(node);
        node.children.forEach(update);
    }
    ;
    update(root);
}
exports.updateAll = updateAll;

},{}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = '';
function size(path) {
    return path.length / 2;
}
exports.size = size;
function head(path) {
    return path.slice(0, 2);
}
exports.head = head;
function tail(path) {
    return path.slice(2);
}
exports.tail = tail;
function init(path) {
    return path.slice(0, -2);
}
exports.init = init;
function last(path) {
    return path.slice(-2);
}
exports.last = last;
function contains(p1, p2) {
    return p1.startsWith(p2);
}
exports.contains = contains;
function fromNodeList(nodes) {
    var path = '';
    for (var i in nodes)
        path += nodes[i].id;
    return path;
}
exports.fromNodeList = fromNodeList;
function isChildOf(child, parent) {
    return !!child && child.slice(0, -2) === parent;
}
exports.isChildOf = isChildOf;

},{}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const treePath = require("./path");
const ops = require("./ops");
const common_1 = require("common");
function build(root) {
    function lastNode() {
        return ops.findInMainline(root, function (node) {
            return !node.children.length;
        });
    }
    function nodeAtPath(path) {
        return nodeAtPathFrom(root, path);
    }
    function nodeAtPathFrom(node, path) {
        if (path === '')
            return node;
        const child = ops.childById(node, treePath.head(path));
        return child ? nodeAtPathFrom(child, treePath.tail(path)) : node;
    }
    function nodeAtPathOrNull(path) {
        return nodeAtPathOrNullFrom(root, path);
    }
    function nodeAtPathOrNullFrom(node, path) {
        if (path === '')
            return node;
        const child = ops.childById(node, treePath.head(path));
        return child ? nodeAtPathOrNullFrom(child, treePath.tail(path)) : undefined;
    }
    function longestValidPathFrom(node, path) {
        var id = treePath.head(path);
        const child = ops.childById(node, id);
        return child ? id + longestValidPathFrom(child, treePath.tail(path)) : '';
    }
    function getCurrentNodesAfterPly(nodeList, mainline, ply) {
        var node, nodes = [];
        for (var i in nodeList) {
            node = nodeList[i];
            if (node.ply <= ply && mainline[i].id !== node.id)
                break;
            if (node.ply > ply)
                nodes.push(node);
        }
        return nodes;
    }
    ;
    function pathIsMainline(path) {
        return pathIsMainlineFrom(root, path);
    }
    function pathExists(path) {
        return !!nodeAtPathOrNull(path);
    }
    function pathIsMainlineFrom(node, path) {
        if (path === '')
            return true;
        const pathId = treePath.head(path), child = node.children[0];
        if (!child || child.id !== pathId)
            return false;
        return pathIsMainlineFrom(child, treePath.tail(path));
    }
    function pathIsForcedVariation(path) {
        return !!getNodeList(path).find(n => n.forceVariation);
    }
    function lastMainlineNodeFrom(node, path) {
        if (path === '')
            return node;
        const pathId = treePath.head(path);
        const child = node.children[0];
        if (!child || child.id !== pathId)
            return node;
        return lastMainlineNodeFrom(child, treePath.tail(path));
    }
    function getNodeList(path) {
        return ops.collect(root, function (node) {
            const id = treePath.head(path);
            if (id === '')
                return;
            path = treePath.tail(path);
            return ops.childById(node, id);
        });
    }
    function getOpening(nodeList) {
        var opening;
        nodeList.forEach(function (node) {
            opening = node.opening || opening;
        });
        return opening;
    }
    function updateAt(path, update) {
        const node = nodeAtPathOrNull(path);
        if (node) {
            update(node);
            return node;
        }
        return;
    }
    // returns new path
    function addNode(node, path) {
        const newPath = path + node.id, existing = nodeAtPathOrNull(newPath);
        if (existing) {
            ['dests', 'drops', 'clock'].forEach(key => {
                if (common_1.defined(node[key]) && !common_1.defined(existing[key]))
                    existing[key] = node[key];
            });
            return newPath;
        }
        return updateAt(path, function (parent) {
            parent.children.push(node);
        }) ? newPath : undefined;
    }
    function addNodes(nodes, path) {
        var node = nodes[0];
        if (!node)
            return path;
        const newPath = addNode(node, path);
        return newPath ? addNodes(nodes.slice(1), newPath) : undefined;
    }
    function deleteNodeAt(path) {
        ops.removeChild(parentNode(path), treePath.last(path));
    }
    function promoteAt(path, toMainline) {
        var nodes = getNodeList(path);
        for (var i = nodes.length - 2; i >= 0; i--) {
            var node = nodes[i + 1];
            var parent = nodes[i];
            if (parent.children[0].id !== node.id) {
                ops.removeChild(parent, node.id);
                parent.children.unshift(node);
                if (!toMainline)
                    break;
            }
            else if (node.forceVariation) {
                node.forceVariation = false;
                if (!toMainline)
                    break;
            }
        }
    }
    function setCommentAt(comment, path) {
        return !comment.text ? deleteCommentAt(comment.id, path) : updateAt(path, function (node) {
            node.comments = node.comments || [];
            const existing = node.comments.find(function (c) {
                return c.id === comment.id;
            });
            if (existing)
                existing.text = comment.text;
            else
                node.comments.push(comment);
        });
    }
    function deleteCommentAt(id, path) {
        return updateAt(path, function (node) {
            var comments = (node.comments || []).filter(function (c) {
                return c.id !== id;
            });
            node.comments = comments.length ? comments : undefined;
        });
    }
    function setGlyphsAt(glyphs, path) {
        return updateAt(path, function (node) {
            node.glyphs = glyphs;
        });
    }
    function parentNode(path) {
        return nodeAtPath(treePath.init(path));
    }
    function getParentClock(node, path) {
        if (!('parentClock' in node)) {
            const par = path && parentNode(path);
            if (!par)
                node.parentClock = node.clock;
            else if (!('clock' in par))
                node.parentClock = undefined;
            else
                node.parentClock = par.clock;
        }
        return node.parentClock;
    }
    return {
        root,
        lastPly() {
            return lastNode().ply;
        },
        nodeAtPath,
        getNodeList,
        longestValidPath: (path) => longestValidPathFrom(root, path),
        getOpening,
        updateAt,
        addNode,
        addNodes,
        addDests(dests, path, opening) {
            return updateAt(path, function (node) {
                node.dests = dests;
                if (opening)
                    node.opening = opening;
            });
        },
        setShapes(shapes, path) {
            return updateAt(path, function (node) {
                node.shapes = shapes;
            });
        },
        setCommentAt,
        deleteCommentAt,
        setGlyphsAt,
        setClockAt(clock, path) {
            return updateAt(path, function (node) {
                node.clock = clock;
            });
        },
        pathIsMainline,
        pathIsForcedVariation,
        lastMainlineNode(path) {
            return lastMainlineNodeFrom(root, path);
        },
        pathExists,
        deleteNodeAt,
        promoteAt,
        forceVariationAt(path, force) {
            return updateAt(path, function (node) {
                node.forceVariation = force;
            });
        },
        getCurrentNodesAfterPly,
        merge(tree) {
            ops.merge(root, tree);
        },
        removeCeval() {
            ops.updateAll(root, function (n) {
                delete n.ceval;
                delete n.threat;
            });
        },
        removeComputerVariations() {
            ops.mainlineNodeList(root).forEach(function (n) {
                n.children = n.children.filter(function (c) {
                    return !c.comp;
                });
            });
        },
        parentNode,
        getParentClock
    };
}
exports.build = build;

},{"./ops":75,"./path":76,"common":46}]},{},[57])(57)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQGJhZHJhcC9yZXN1bHQvZGlzdC9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvYW5pbS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvYXBpLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9ib2FyZC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvY2hlc3Nncm91bmQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2NvbmZpZy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZHJhZy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZHJhdy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZHJvcC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZXZlbnRzLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9leHBsb3Npb24udHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2Zlbi50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvcHJlbW92ZS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvcmVuZGVyLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9zdGF0ZS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvc3ZnLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy90eXBlcy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvdXRpbC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvd3JhcC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc29wcy9hdHRhY2tzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzb3BzL2JvYXJkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzb3BzL2NoZXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzb3BzL2Zlbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc29wcy9zYW4uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3NvcHMvc2V0dXAuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3NvcHMvc3F1YXJlU2V0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzb3BzL3R5cGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzb3BzL3V0aWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3NvcHMvdmFyaWFudC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9oLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2h0bWxkb21hcGkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vdGh1bmsuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCIuLi9jZXZhbC9zcmMvY3RybC50cyIsIi4uL2NldmFsL3NyYy9tYWluLnRzIiwiLi4vY2V2YWwvc3JjL3Bvb2wudHMiLCIuLi9jZXZhbC9zcmMvc3RvY2tmaXNoUHJvdG9jb2wudHMiLCIuLi9jZXZhbC9zcmMvdmlldy50cyIsIi4uL2NldmFsL3NyYy93aW5uaW5nQ2hhbmNlcy50cyIsIi4uL2NoZXNzL3NyYy9tYWluLnRzIiwiLi4vY2hlc3Mvc3JjL3Bpb3RyLnRzIiwiLi4vY29tbW9uL3NyYy9jb21tb24udHMiLCIuLi9jb21tb24vc3JjL2dyaWRIYWNrcy50cyIsIi4uL2NvbW1vbi9zcmMvbWVudUhvdmVyLnRzIiwiLi4vY29tbW9uL3NyYy9yZXNpemUudHMiLCIuLi9jb21tb24vc3JjL3N0b3JhZ2UudHMiLCIuLi9jb21tb24vc3JjL3N5bmMudHMiLCIuLi9jb21tb24vc3JjL3Rocm90dGxlLnRzIiwic3JjL2F1dG9TaGFwZS50cyIsInNyYy9jb250cm9sLnRzIiwic3JjL2N0cmwudHMiLCJzcmMva2V5Ym9hcmQudHMiLCJzcmMvbWFpbi50cyIsInNyYy9tb3ZlVGVzdC50cyIsInNyYy9wcm9tb3Rpb24udHMiLCJzcmMvc29ja2V0LnRzIiwic3JjL3NvbHV0aW9uLnRzIiwic3JjL3NvdW5kLnRzIiwic3JjL3NwZWVjaC50cyIsInNyYy91dGlsLnRzIiwic3JjL3ZpZXcvYWZ0ZXIudHMiLCJzcmMvdmlldy9jaGVzc2dyb3VuZC50cyIsInNyYy92aWV3L2ZlZWRiYWNrLnRzIiwic3JjL3ZpZXcvZ3JpZEhhY2tzLnRzIiwic3JjL3ZpZXcvaGlzdG9yeS50cyIsInNyYy92aWV3L21haW4udHMiLCJzcmMvdmlldy9zaWRlLnRzIiwic3JjL3ZpZXcvdHJlZS50cyIsInNyYy94aHIudHMiLCIuLi90cmVlL3NyYy9tYWluLnRzIiwiLi4vdHJlZS9zcmMvb3BzLnRzIiwiLi4vdHJlZS9zcmMvcGF0aC50cyIsIi4uL3RyZWUvc3JjL3RyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7Ozs7QUNEQSwrQkFBOEI7QUE0QjlCLFNBQWdCLElBQUksQ0FBSSxRQUFxQixFQUFFLEtBQVk7SUFDekQsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxD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QUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFHLEVBQUUsQ0FBQyxDQUMxQixJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FDckMsSUFBSSxDQUNILFNBQVMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDOUQsQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FDOUIsQ0FDRixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLE1BQWlCLEVBQUUsS0FBZTtJQUNyRCxNQUFNLFFBQVEsR0FBRyxLQUFLLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUM5QyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3RDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDO0lBQ3hGLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxD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O0lBQ25CLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFO1FBQ25CLENBQUMsR0FBRyxlQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuQjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQzs7O0FDekVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUMsQ0FBQztZQUMzQixDQUFDO1lBQ0QsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFrQixFQUFFLFFBQVEsQ0FBQztTQUN4RTtLQUNGLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFTLENBQUM7UUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFBRSxPQUFPLFlBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxPQUFPLFlBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ3ZDLEVBQUU7WUFDRCxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFDLENBQUMsUUFBUSxFQUFFLGdCQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDckcsWUFBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsc0JBQWdCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFRLENBQUMsQ0FBQyxDQUFFLENBQUMs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R0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0lBQ1Qs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QVc7WUFDVCxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFTLENBQUM7Z0JBQzVCLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDZixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0Qsd0JBQXdCO1lBQ3RCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBUyxDQUFDO2dCQUMzQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVMsQ0FBQztvQkFDdkMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsVUFBVTtRQUNWLGNBQWM7S0FDZixDQUFDO0FBQ0osQ0FBQztBQXBQRCxzQkFvUEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJmdW5jdGlvbiByKHIsdCl7ci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0LnByb3RvdHlwZSksci5wcm90b3R5cGUuY29uc3RydWN0b3I9cixyLl9fcHJvdG9fXz10fXZhciB0LG49ZnVuY3Rpb24oKXtmdW5jdGlvbiByKCl7fXZhciB0PXIucHJvdG90eXBlO3JldHVybiB0LnVud3JhcD1mdW5jdGlvbihyLHQpe3ZhciBuPXRoaXMuX2NoYWluKChmdW5jdGlvbih0KXtyZXR1cm4gZXhwb3J0cy5SZXN1bHQub2socj9yKHQpOnQpfSksKGZ1bmN0aW9uKHIpe3JldHVybiB0P2V4cG9ydHMuUmVzdWx0Lm9rKHQocikpOmV4cG9ydHMuUmVzdWx0LmVycihyKX0pKTtpZihuLmlzRXJyKXRocm93IG4uZXJyb3I7cmV0dXJuIG4udmFsdWV9LHQubWFwPWZ1bmN0aW9uKHIsdCl7cmV0dXJuIHRoaXMuX2NoYWluKChmdW5jdGlvbih0KXtyZXR1cm4gZXhwb3J0cy5SZXN1bHQub2socih0KSl9KSwoZnVuY3Rpb24ocil7cmV0dXJuIGV4cG9ydHMuUmVzdWx0LmVycih0P3Qocik6cil9KSl9LHQuY2hhaW49ZnVuY3Rpb24ocix0KXtyZXR1cm4gdGhpcy5fY2hhaW4ocix0fHxmdW5jdGlvbihyKXtyZXR1cm4gZXhwb3J0cy5SZXN1bHQuZXJyKHIpfSl9LHJ9KCksZT1mdW5jdGlvbih0KXtmdW5jdGlvbiBuKHIpe3ZhciBuO3JldHVybihuPXQuY2FsbCh0aGlzKXx8dGhpcykudmFsdWU9cixuLmlzT2s9ITAsbi5pc0Vycj0hMSxufXJldHVybiByKG4sdCksbi5wcm90b3R5cGUuX2NoYWluPWZ1bmN0aW9uKHIsdCl7cmV0dXJuIHIodGhpcy52YWx1ZSl9LG59KG4pLHU9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gbihyKXt2YXIgbjtyZXR1cm4obj10LmNhbGwodGhpcyl8fHRoaXMpLmVycm9yPXIsbi5pc09rPSExLG4uaXNFcnI9ITAsbn1yZXR1cm4gcihuLHQpLG4ucHJvdG90eXBlLl9jaGFpbj1mdW5jdGlvbihyLHQpe3JldHVybiB0KHRoaXMuZXJyb3IpfSxufShuKTsodD1leHBvcnRzLlJlc3VsdHx8KGV4cG9ydHMuUmVzdWx0PXt9KSkub2s9ZnVuY3Rpb24ocil7cmV0dXJuIG5ldyBlKHIpfSx0LmVycj1mdW5jdGlvbihyKXtyZXR1cm4gbmV3IHUocil9LHQuYWxsPWZ1bmN0aW9uKHIpe2lmKEFycmF5LmlzQXJyYXkocikpe2Zvcih2YXIgbj1bXSxlPTA7ZTxyLmxlbmd0aDtlKyspe3ZhciB1PXJbZV07aWYodS5pc0VycilyZXR1cm4gdTtuLnB1c2godS52YWx1ZSl9cmV0dXJuIHQub2sobil9Zm9yKHZhciBvPXt9LGk9T2JqZWN0LmtleXMocikscz0wO3M8aS5sZW5ndGg7cysrKXt2YXIgYz1yW2lbc11dO2lmKGMuaXNFcnIpcmV0dXJuIGM7b1tpW3NdXT1jLnZhbHVlfXJldHVybiB0Lm9rKG8pfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcFxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIDAsMSBhbmltYXRpb24gZ29hbFxuLy8gMiwzIGFuaW1hdGlvbiBjdXJyZW50IHN0YXR1c1xuZXhwb3J0IHR5cGUgQW5pbVZlY3RvciA9IGNnLk51bWJlclF1YWRcblxuZXhwb3J0IGludGVyZmFjZSBBbmltVmVjdG9ycyB7XG4gIFtrZXk6IHN0cmluZ106IEFuaW1WZWN0b3Jcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltRmFkaW5ncyB7XG4gIFtrZXk6IHN0cmluZ106IGNnLlBpZWNlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbVBsYW4ge1xuICBhbmltczogQW5pbVZlY3RvcnM7XG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1DdXJyZW50IHtcbiAgc3RhcnQ6IERPTUhpZ2hSZXNUaW1lU3RhbXA7XG4gIGZyZXF1ZW5jeTogY2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXI8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBBbmltUGllY2Uge1xuICBrZXk6IGNnLktleTtcbiAgcG9zOiBjZy5Qb3M7XG4gIHBpZWNlOiBjZy5QaWVjZTtcbn1cbmludGVyZmFjZSBBbmltUGllY2VzIHtcbiAgW2tleTogc3RyaW5nXTogQW5pbVBpZWNlXG59XG5cbmZ1bmN0aW9uIG1ha2VQaWVjZShrZXk6IGNnLktleSwgcGllY2U6IGNnLlBpZWNlKTogQW5pbVBpZWNlIHtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBwb3M6IHV0aWwua2V5MnBvcyhrZXkpLFxuICAgIHBpZWNlOiBwaWVjZVxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogY2cuUGllY2VzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0ge30sXG4gIGFuaW1lZE9yaWdzOiBjZy5LZXlbXSA9IFtdLFxuICBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IHt9LFxuICBtaXNzaW5nczogQW5pbVBpZWNlW10gPSBbXSxcbiAgbmV3czogQW5pbVBpZWNlW10gPSBbXSxcbiAgcHJlUGllY2VzOiBBbmltUGllY2VzID0ge307XG4gIGxldCBjdXJQOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCwgcHJlUDogQW5pbVBpZWNlIHwgdW5kZWZpbmVkLCBpOiBhbnksIHZlY3RvcjogY2cuTnVtYmVyUGFpcjtcbiAgZm9yIChpIGluIHByZXZQaWVjZXMpIHtcbiAgICBwcmVQaWVjZXNbaV0gPSBtYWtlUGllY2UoaSBhcyBjZy5LZXksIHByZXZQaWVjZXNbaV0hKTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLmFsbEtleXMpIHtcbiAgICBjdXJQID0gY3VycmVudC5waWVjZXNba2V5XTtcbiAgICBwcmVQID0gcHJlUGllY2VzW2tleV07XG4gICAgaWYgKGN1clApIHtcbiAgICAgIGlmIChwcmVQKSB7XG4gICAgICAgIGlmICghdXRpbC5zYW1lUGllY2UoY3VyUCwgcHJlUC5waWVjZSkpIHtcbiAgICAgICAgICBtaXNzaW5ncy5wdXNoKHByZVApO1xuICAgICAgICAgIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgIH0gZWxzZSBpZiAocHJlUCkgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgfVxuICBuZXdzLmZvckVhY2gobmV3UCA9PiB7XG4gICAgcHJlUCA9IGNsb3NlcihuZXdQLCBtaXNzaW5ncy5maWx0ZXIocCA9PiB1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkpO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICB2ZWN0b3IgPSBbcHJlUC5wb3NbMF0gLSBuZXdQLnBvc1swXSwgcHJlUC5wb3NbMV0gLSBuZXdQLnBvc1sxXV07XG4gICAgICBhbmltc1tuZXdQLmtleV0gPSB2ZWN0b3IuY29uY2F0KHZlY3RvcikgYXMgQW5pbVZlY3RvcjtcbiAgICAgIGFuaW1lZE9yaWdzLnB1c2gocHJlUC5rZXkpO1xuICAgIH1cbiAgfSk7XG4gIG1pc3NpbmdzLmZvckVhY2gocCA9PiB7XG4gICAgaWYgKCF1dGlsLmNvbnRhaW5zWChhbmltZWRPcmlncywgcC5rZXkpKSBmYWRpbmdzW3Aua2V5XSA9IHAucGllY2U7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgYW5pbXM6IGFuaW1zLFxuICAgIGZhZGluZ3M6IGZhZGluZ3NcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RlcChzdGF0ZTogU3RhdGUsIG5vdzogRE9NSGlnaFJlc1RpbWVTdGFtcCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudDtcbiAgaWYgKGN1ciA9PT0gdW5kZWZpbmVkKSB7IC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGxldCBpIGluIGN1ci5wbGFuLmFuaW1zKSB7XG4gICAgICBjb25zdCBjZmcgPSBjdXIucGxhbi5hbmltc1tpXTtcbiAgICAgIGNmZ1syXSA9IGNmZ1swXSAqIGVhc2U7XG4gICAgICBjZmdbM10gPSBjZmdbMV0gKiBlYXNlO1xuICAgIH1cbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KHRydWUpOyAvLyBvcHRpbWlzYXRpb246IGRvbid0IHJlbmRlciBTVkcgY2hhbmdlcyBkdXJpbmcgYW5pbWF0aW9uc1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgobm93ID0gcGVyZm9ybWFuY2Uubm93KCkpID0+IHN0ZXAoc3RhdGUsIG5vdykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGU8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgLy8gY2xvbmUgc3RhdGUgYmVmb3JlIG11dGF0aW5nIGl0XG4gIGNvbnN0IHByZXZQaWVjZXM6IGNnLlBpZWNlcyA9IHsuLi5zdGF0ZS5waWVjZXN9O1xuXG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgY29uc3QgcGxhbiA9IGNvbXB1dGVQbGFuKHByZXZQaWVjZXMsIHN0YXRlKTtcbiAgaWYgKCFpc09iamVjdEVtcHR5KHBsYW4uYW5pbXMpIHx8ICFpc09iamVjdEVtcHR5KHBsYW4uZmFkaW5ncykpIHtcbiAgICBjb25zdCBhbHJlYWR5UnVubmluZyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ICYmIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50LnN0YXJ0O1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgZnJlcXVlbmN5OiAxIC8gc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uLFxuICAgICAgcGxhbjogcGxhblxuICAgIH07XG4gICAgaWYgKCFhbHJlYWR5UnVubmluZykgc3RlcChzdGF0ZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvbid0IGFuaW1hdGUsIGp1c3QgcmVuZGVyIHJpZ2h0IGF3YXlcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNPYmplY3RFbXB0eShvOiBhbnkpOiBib29sZWFuIHtcbiAgZm9yIChsZXQgXyBpbiBvKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbmZ1bmN0aW9uIGVhc2luZyh0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgd3JpdGUgYXMgZmVuV3JpdGUgfSBmcm9tICcuL2ZlbidcbmltcG9ydCB7IENvbmZpZywgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0nXG5pbXBvcnQgeyBjYW5jZWwgYXMgZHJhZ0NhbmNlbCwgZHJhZ05ld1BpZWNlIH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0IHsgRHJhd1NoYXBlIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0IGV4cGxvc2lvbiBmcm9tICcuL2V4cGxvc2lvbidcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBpIHtcblxuICAvLyByZWNvbmZpZ3VyZSB0aGUgaW5zdGFuY2UuIEFjY2VwdHMgYWxsIGNvbmZpZyBvcHRpb25zLCBleGNlcHQgZm9yIHZpZXdPbmx5ICYgZHJhd2FibGUudmlzaWJsZS5cbiAgLy8gYm9hcmQgd2lsbCBiZSBhbmltYXRlZCBhY2NvcmRpbmdseSwgaWYgYW5pbWF0aW9ucyBhcmUgZW5hYmxlZC5cbiAgc2V0KGNvbmZpZzogQ29uZmlnKTogdm9pZDtcblxuICAvLyByZWFkIGNoZXNzZ3JvdW5kIHN0YXRlOyB3cml0ZSBhdCB5b3VyIG93biByaXNrcy5cbiAgc3RhdGU6IFN0YXRlO1xuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gYXMgYSBGRU4gc3RyaW5nIChvbmx5IGNvbnRhaW5zIHBpZWNlcywgbm8gZmxhZ3MpXG4gIC8vIGUuZy4gcm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUlxuICBnZXRGZW4oKTogY2cuRkVOO1xuXG4gIC8vIGNoYW5nZSB0aGUgdmlldyBhbmdsZVxuICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBtb3ZlIHByb2dyYW1tYXRpY2FsbHlcbiAgbW92ZShvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IHZvaWQ7XG5cbiAgLy8gYWRkIGFuZC9vciByZW1vdmUgYXJiaXRyYXJ5IHBpZWNlcyBvbiB0aGUgYm9hcmRcbiAgc2V0UGllY2VzKHBpZWNlczogY2cuUGllY2VzRGlmZik6IHZvaWQ7XG5cbiAgLy8gY2xpY2sgYSBzcXVhcmUgcHJvZ3JhbW1hdGljYWxseVxuICBzZWxlY3RTcXVhcmUoa2V5OiBjZy5LZXkgfCBudWxsLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHB1dCBhIG5ldyBwaWVjZSBvbiB0aGUgYm9hcmRcbiAgbmV3UGllY2UocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZW1vdmUoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55XG4gIGNhbmNlbFByZW1vdmUoKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlZHJvcCh2YWxpZGF0ZTogKGRyb3A6IGNnLkRyb3ApID0+IGJvb2xlYW4pOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnlcbiAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBtb3ZlIGJlaW5nIG1hZGVcbiAgY2FuY2VsTW92ZSgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCBjdXJyZW50IG1vdmUgYW5kIHByZXZlbnQgZnVydGhlciBvbmVzXG4gIHN0b3AoKTogdm9pZDtcblxuICAvLyBtYWtlIHNxdWFyZXMgZXhwbG9kZSAoYXRvbWljIGNoZXNzKVxuICBleHBsb2RlKGtleXM6IGNnLktleVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgdXNlciBzaGFwZXNcbiAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyBhdXRvIHNoYXBlc1xuICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHNxdWFyZSBuYW1lIGF0IHRoaXMgRE9NIHBvc2l0aW9uIChsaWtlIFwiZTRcIilcbiAgZ2V0S2V5QXREb21Qb3MocG9zOiBjZy5OdW1iZXJQYWlyKTogY2cuS2V5IHwgdW5kZWZpbmVkO1xuXG4gIC8vIG9ubHkgdXNlZnVsIHdoZW4gQ1NTIGNoYW5nZXMgdGhlIGJvYXJkIHdpZHRoL2hlaWdodCByYXRpbyAoZm9yIDNEKVxuICByZWRyYXdBbGw6IGNnLlJlZHJhdztcblxuICAvLyBmb3IgY3Jhenlob3VzZSBhbmQgYm9hcmQgZWRpdG9yc1xuICBkcmFnTmV3UGllY2UocGllY2U6IGNnLlBpZWNlLCBldmVudDogY2cuTW91Y2hFdmVudCwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyB1bmJpbmRzIGFsbCBldmVudHNcbiAgLy8gKGltcG9ydGFudCBmb3IgZG9jdW1lbnQtd2lkZSBldmVudHMgbGlrZSBzY3JvbGwgYW5kIG1vdXNlbW92ZSlcbiAgZGVzdHJveTogY2cuVW5iaW5kXG59XG5cbi8vIHNlZSBBUEkgdHlwZXMgYW5kIGRvY3VtZW50YXRpb25zIGluIGR0cy9hcGkuZC50c1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgcmVkcmF3QWxsOiBjZy5SZWRyYXcpOiBBcGkge1xuXG4gIGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKCkge1xuICAgIGJvYXJkLnRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlKTtcbiAgICByZWRyYXdBbGwoKTtcbiAgfTtcblxuICByZXR1cm4ge1xuXG4gICAgc2V0KGNvbmZpZykge1xuICAgICAgaWYgKGNvbmZpZy5vcmllbnRhdGlvbiAmJiBjb25maWcub3JpZW50YXRpb24gIT09IHN0YXRlLm9yaWVudGF0aW9uKSB0b2dnbGVPcmllbnRhdGlvbigpO1xuICAgICAgKGNvbmZpZy5mZW4gPyBhbmltIDogcmVuZGVyKShzdGF0ZSA9PiBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RhdGUsXG5cbiAgICBnZXRGZW46ICgpID0+IGZlbldyaXRlKHN0YXRlLnBpZWNlcyksXG5cbiAgICB0b2dnbGVPcmllbnRhdGlvbixcblxuICAgIHNldFBpZWNlcyhwaWVjZXMpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNlbGVjdFNxdWFyZShrZXksIGZvcmNlKSB7XG4gICAgICBpZiAoa2V5KSBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwga2V5LCBmb3JjZSksIHN0YXRlKTtcbiAgICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3ZlKG9yaWcsIGRlc3QpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIG5ld1BpZWNlKHBpZWNlLCBrZXkpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwga2V5KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBwbGF5UHJlbW92ZSgpIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZW1vdmUsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVtb3ZlIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgcGxheVByZWRyb3AodmFsaWRhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBib2FyZC5wbGF5UHJlZHJvcChzdGF0ZSwgdmFsaWRhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZW1vdmUoKSB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVtb3ZlLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZWRyb3AoKSB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE1vdmUoKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4geyBib2FyZC5jYW5jZWxNb3ZlKHN0YXRlKTsgZHJhZ0NhbmNlbChzdGF0ZSk7IH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RvcCgpIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiB7IGJvYXJkLnN0b3Aoc3RhdGUpOyBkcmFnQ2FuY2VsKHN0YXRlKTsgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBleHBsb2RlKGtleXM6IGNnLktleVtdKSB7XG4gICAgICBleHBsb3Npb24oc3RhdGUsIGtleXMpO1xuICAgIH0sXG5cbiAgICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiBzdGF0ZS5kcmF3YWJsZS5hdXRvU2hhcGVzID0gc2hhcGVzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gc2hhcGVzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGdldEtleUF0RG9tUG9zKHBvcykge1xuICAgICAgcmV0dXJuIGJvYXJkLmdldEtleUF0RG9tUG9zKHBvcywgYm9hcmQud2hpdGVQb3Yoc3RhdGUpLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgIH0sXG5cbiAgICByZWRyYXdBbGwsXG5cbiAgICBkcmFnTmV3UGllY2UocGllY2UsIGV2ZW50LCBmb3JjZSkge1xuICAgICAgZHJhZ05ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZXZlbnQsIGZvcmNlKVxuICAgIH0sXG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICBzdGF0ZS5kb20udW5iaW5kICYmIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHBvczJrZXksIGtleTJwb3MsIG9wcG9zaXRlLCBjb250YWluc1ggfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgcHJlbW92ZSBmcm9tICcuL3ByZW1vdmUnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBDYWxsYmFjayA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb24oZjogQ2FsbGJhY2sgfCB1bmRlZmluZWQsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgc3RhdGUuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubGFzdE1vdmUgPSB1bmRlZmluZWQ7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpZWNlcyhzdGF0ZTogU3RhdGUsIHBpZWNlczogY2cuUGllY2VzRGlmZik6IHZvaWQge1xuICBmb3IgKGxldCBrZXkgaW4gcGllY2VzKSB7XG4gICAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgICBpZiAocGllY2UpIHN0YXRlLnBpZWNlc1trZXldID0gcGllY2U7XG4gICAgZWxzZSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrKHN0YXRlOiBTdGF0ZSwgY29sb3I6IGNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbG9yID09PSB0cnVlKSBjb2xvciA9IHN0YXRlLnR1cm5Db2xvcjtcbiAgaWYgKGNvbG9yKSBmb3IgKGxldCBrIGluIHN0YXRlLnBpZWNlcykge1xuICAgIGlmIChzdGF0ZS5waWVjZXNba10hLnJvbGUgPT09ICdraW5nJyAmJiBzdGF0ZS5waWVjZXNba10hLmNvbG9yID09PSBjb2xvcikge1xuICAgICAgc3RhdGUuY2hlY2sgPSBrIGFzIGNnLktleTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlbW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhOiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpOiB2b2lkIHtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gW29yaWcsIGRlc3RdO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgbWV0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlZHJvcChzdGF0ZTogU3RhdGUsIHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5KTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyByb2xlLCBrZXkgfTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVkcm9wcGFibGUuZXZlbnRzLnNldCwgcm9sZSwga2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlZHJvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgcGQgPSBzdGF0ZS5wcmVkcm9wcGFibGU7XG4gIGlmIChwZC5jdXJyZW50KSB7XG4gICAgcGQuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHBkLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJ5QXV0b0Nhc3RsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmICghc3RhdGUuYXV0b0Nhc3RsZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBraW5nID0gc3RhdGUucGllY2VzW29yaWddO1xuICBpZiAoIWtpbmcgfHwga2luZy5yb2xlICE9PSAna2luZycpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZ1BvcyA9IGtleTJwb3Mob3JpZyk7XG4gIGlmIChvcmlnUG9zWzBdICE9PSA1KSByZXR1cm4gZmFsc2U7XG4gIGlmIChvcmlnUG9zWzFdICE9PSAxICYmIG9yaWdQb3NbMV0gIT09IDgpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgZGVzdFBvcyA9IGtleTJwb3MoZGVzdCk7XG4gIGxldCBvbGRSb29rUG9zLCBuZXdSb29rUG9zLCBuZXdLaW5nUG9zO1xuICBpZiAoZGVzdFBvc1swXSA9PT0gNyB8fCBkZXN0UG9zWzBdID09PSA4KSB7XG4gICAgb2xkUm9va1BvcyA9IHBvczJrZXkoWzgsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdSb29rUG9zID0gcG9zMmtleShbNiwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld0tpbmdQb3MgPSBwb3Mya2V5KFs3LCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSBpZiAoZGVzdFBvc1swXSA9PT0gMyB8fCBkZXN0UG9zWzBdID09PSAxKSB7XG4gICAgb2xkUm9va1BvcyA9IHBvczJrZXkoWzEsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdSb29rUG9zID0gcG9zMmtleShbNCwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld0tpbmdQb3MgPSBwb3Mya2V5KFszLCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgcm9vayA9IHN0YXRlLnBpZWNlc1tvbGRSb29rUG9zXTtcbiAgaWYgKCFyb29rIHx8IHJvb2sucm9sZSAhPT0gJ3Jvb2snKSByZXR1cm4gZmFsc2U7XG5cbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvbGRSb29rUG9zXTtcblxuICBzdGF0ZS5waWVjZXNbbmV3S2luZ1Bvc10gPSBraW5nXG4gIHN0YXRlLnBpZWNlc1tuZXdSb29rUG9zXSA9IHJvb2s7XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZU1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IG9yaWdQaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXSwgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzW2Rlc3RdO1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkID0gKGRlc3RQaWVjZSAmJiBkZXN0UGllY2UuY29sb3IgIT09IG9yaWdQaWVjZS5jb2xvcikgPyBkZXN0UGllY2UgOiB1bmRlZmluZWQ7XG4gIGlmIChkZXN0ID09IHN0YXRlLnNlbGVjdGVkKSB1bnNlbGVjdChzdGF0ZSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLm1vdmUsIG9yaWcsIGRlc3QsIGNhcHR1cmVkKTtcbiAgaWYgKCF0cnlBdXRvQ2FzdGxlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHN0YXRlLnBpZWNlc1tkZXN0XSA9IG9yaWdQaWVjZTtcbiAgICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICB9XG4gIHN0YXRlLmxhc3RNb3ZlID0gW29yaWcsIGRlc3RdO1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgcmV0dXJuIGNhcHR1cmVkIHx8IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5LCBmb3JjZT86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgaWYgKHN0YXRlLnBpZWNlc1trZXldKSB7XG4gICAgaWYgKGZvcmNlKSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcE5ld1BpZWNlLCBwaWVjZSwga2V5KTtcbiAgc3RhdGUucGllY2VzW2tleV0gPSBwaWVjZTtcbiAgc3RhdGUubGFzdE1vdmUgPSBba2V5XTtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IGhvbGRUaW1lID0gc3RhdGUuaG9sZC5zdG9wKCk7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjb25zdCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhID0ge1xuICAgICAgICBwcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleSxcbiAgICAgICAgaG9sZFRpbWVcbiAgICAgIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIG1ldGFkYXRhKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHtcbiAgICAgIGN0cmxLZXk6IHN0YXRlLnN0YXRzLmN0cmxLZXlcbiAgICB9KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBmb3JjZSkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddITtcbiAgICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICAgIGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRlc3QsIGZvcmNlKTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyTmV3UGllY2UsIHBpZWNlLnJvbGUsIGRlc3QsIHtcbiAgICAgIHByZWRyb3A6IGZhbHNlXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBzdGF0ZS5waWVjZXNbb3JpZ10hLnJvbGUsIGRlc3QpO1xuICB9IGVsc2Uge1xuICAgIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gICAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgfVxuICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoc3RhdGU6IFN0YXRlLCBrZXk6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnNlbGVjdCwga2V5KTtcbiAgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkID09PSBrZXkgJiYgIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkKSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBzdGF0ZS5ob2xkLmNhbmNlbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiYgc3RhdGUuc2VsZWN0ZWQgIT09IGtleSkge1xuICAgICAgaWYgKHVzZXJNb3ZlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCwga2V5KSkge1xuICAgICAgICBzdGF0ZS5zdGF0cy5kcmFnZ2VkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGlzTW92YWJsZShzdGF0ZSwga2V5KSB8fCBpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgICBzdGF0ZS5ob2xkLnN0YXJ0KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHN0YXRlOiBTdGF0ZSwga2V5OiBjZy5LZXkpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPSBrZXk7XG4gIGlmIChpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gcHJlbW92ZShzdGF0ZS5waWVjZXMsIGtleSwgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpO1xuICB9XG4gIGVsc2Ugc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2VsZWN0KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5zZWxlY3RlZCA9IHVuZGVmaW5lZDtcbiAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuaG9sZC5jYW5jZWwoKTtcbn1cblxuZnVuY3Rpb24gaXNNb3ZhYmxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ2JvdGgnIHx8IChcbiAgICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3JcbiAgICApKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbk1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3JpZyAhPT0gZGVzdCAmJiBpc01vdmFibGUoc3RhdGUsIG9yaWcpICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmZyZWUgfHwgKCEhc3RhdGUubW92YWJsZS5kZXN0cyAmJiBjb250YWluc1goc3RhdGUubW92YWJsZS5kZXN0c1tvcmlnXSwgZGVzdCkpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNhbkRyb3Aoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgZGVzdCAmJiAob3JpZyA9PT0gZGVzdCB8fCAhc3RhdGUucGllY2VzW2Rlc3RdKSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ2JvdGgnIHx8IChcbiAgICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3JcbiAgICApKTtcbn1cblxuXG5mdW5jdGlvbiBpc1ByZW1vdmFibGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3JpZyAhPT0gZGVzdCAmJlxuICBpc1ByZW1vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gIGNvbnRhaW5zWChwcmVtb3ZlKHN0YXRlLnBpZWNlcywgb3JpZywgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gY2FuUHJlZHJvcChzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICBjb25zdCBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXNbZGVzdF07XG4gIHJldHVybiAhIXBpZWNlICYmIGRlc3QgJiZcbiAgKCFkZXN0UGllY2UgfHwgZGVzdFBpZWNlLmNvbG9yICE9PSBzdGF0ZS5tb3ZhYmxlLmNvbG9yKSAmJlxuICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAocGllY2Uucm9sZSAhPT0gJ3Bhd24nIHx8IChkZXN0WzFdICE9PSAnMScgJiYgZGVzdFsxXSAhPT0gJzgnKSkgJiZcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEcmFnZ2FibGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiYgKFxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZFxuICAgICAgKVxuICAgIClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtb3ZlID0gc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZyA9IG1vdmVbMF0sIGRlc3QgPSBtb3ZlWzFdO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1vdmU6IHRydWUgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZWRyb3Aoc3RhdGU6IFN0YXRlLCB2YWxpZGF0ZTogKGRyb3A6IGNnLkRyb3ApID0+IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgbGV0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCxcbiAgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoIWRyb3ApIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkYXRlKGRyb3ApKSB7XG4gICAgY29uc3QgcGllY2UgPSB7XG4gICAgICByb2xlOiBkcm9wLnJvbGUsXG4gICAgICBjb2xvcjogc3RhdGUubW92YWJsZS5jb2xvclxuICAgIH0gYXMgY2cuUGllY2U7XG4gICAgaWYgKGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRyb3Aua2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlck5ld1BpZWNlLCBkcm9wLnJvbGUsIGRyb3Aua2V5LCB7XG4gICAgICAgIHByZWRyb3A6IHRydWVcbiAgICAgIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZShzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9XG4gIHN0YXRlLm1vdmFibGUuZGVzdHMgPVxuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZShzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhwb3M6IGNnLk51bWJlclBhaXIsIGFzV2hpdGU6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IGNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5jZWlsKDggKiAoKHBvc1swXSAtIGJvdW5kcy5sZWZ0KSAvIGJvdW5kcy53aWR0aCkpO1xuICBpZiAoIWFzV2hpdGUpIGZpbGUgPSA5IC0gZmlsZTtcbiAgbGV0IHJhbmsgPSBNYXRoLmNlaWwoOCAtICg4ICogKChwb3NbMV0gLSBib3VuZHMudG9wKSAvIGJvdW5kcy5oZWlnaHQpKSk7XG4gIGlmICghYXNXaGl0ZSkgcmFuayA9IDkgLSByYW5rO1xuICByZXR1cm4gKGZpbGUgPiAwICYmIGZpbGUgPCA5ICYmIHJhbmsgPiAwICYmIHJhbmsgPCA5KSA/IHBvczJrZXkoW2ZpbGUsIHJhbmtdKSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoaXRlUG92KHM6IFN0YXRlKTogYm9vbGVhbiB7XG4gIHJldHVybiBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnO1xufVxuIiwiaW1wb3J0IHsgQXBpLCBzdGFydCB9IGZyb20gJy4vYXBpJ1xuaW1wb3J0IHsgQ29uZmlnLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IFN0YXRlLCBkZWZhdWx0cyB9IGZyb20gJy4vc3RhdGUnXG5cbmltcG9ydCByZW5kZXJXcmFwIGZyb20gJy4vd3JhcCc7XG5pbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnLi9ldmVudHMnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJztcbmltcG9ydCAqIGFzIHN2ZyBmcm9tICcuL3N2Zyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVzc2dyb3VuZChlbGVtZW50OiBIVE1MRWxlbWVudCwgY29uZmlnPzogQ29uZmlnKTogQXBpIHtcblxuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG5cbiAgY29uZmlndXJlKHN0YXRlLCBjb25maWcgfHwge30pO1xuXG4gIGZ1bmN0aW9uIHJlZHJhd0FsbCgpIHtcbiAgICBsZXQgcHJldlVuYmluZCA9IHN0YXRlLmRvbSAmJiBzdGF0ZS5kb20udW5iaW5kO1xuICAgIC8vIGNvbXB1dGUgYm91bmRzIGZyb20gZXhpc3RpbmcgYm9hcmQgZWxlbWVudCBpZiBwb3NzaWJsZVxuICAgIC8vIHRoaXMgYWxsb3dzIG5vbi1zcXVhcmUgYm9hcmRzIGZyb20gQ1NTIHRvIGJlIGhhbmRsZWQgKGZvciAzRClcbiAgICBjb25zdCByZWxhdGl2ZSA9IHN0YXRlLnZpZXdPbmx5ICYmICFzdGF0ZS5kcmF3YWJsZS52aXNpYmxlLFxuICAgIGVsZW1lbnRzID0gcmVuZGVyV3JhcChlbGVtZW50LCBzdGF0ZSwgcmVsYXRpdmUpLFxuICAgIGJvdW5kcyA9IHV0aWwubWVtbygoKSA9PiBlbGVtZW50cy5ib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSksXG4gICAgcmVkcmF3Tm93ID0gKHNraXBTdmc/OiBib29sZWFuKSA9PiB7XG4gICAgICByZW5kZXIoc3RhdGUpO1xuICAgICAgaWYgKCFza2lwU3ZnICYmIGVsZW1lbnRzLnN2Zykgc3ZnLnJlbmRlclN2ZyhzdGF0ZSwgZWxlbWVudHMuc3ZnKTtcbiAgICB9O1xuICAgIHN0YXRlLmRvbSA9IHtcbiAgICAgIGVsZW1lbnRzLFxuICAgICAgYm91bmRzLFxuICAgICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdOb3cpLFxuICAgICAgcmVkcmF3Tm93LFxuICAgICAgdW5iaW5kOiBwcmV2VW5iaW5kLFxuICAgICAgcmVsYXRpdmVcbiAgICB9O1xuICAgIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gJyc7XG4gICAgcmVkcmF3Tm93KGZhbHNlKTtcbiAgICBldmVudHMuYmluZEJvYXJkKHN0YXRlKTtcbiAgICBpZiAoIXByZXZVbmJpbmQpIHN0YXRlLmRvbS51bmJpbmQgPSBldmVudHMuYmluZERvY3VtZW50KHN0YXRlLCByZWRyYXdBbGwpO1xuICAgIHN0YXRlLmV2ZW50cy5pbnNlcnQgJiYgc3RhdGUuZXZlbnRzLmluc2VydChlbGVtZW50cyk7XG4gIH1cbiAgcmVkcmF3QWxsKCk7XG5cbiAgcmV0dXJuIHN0YXJ0KHN0YXRlLCByZWRyYXdBbGwpO1xufTtcblxuZnVuY3Rpb24gZGVib3VuY2VSZWRyYXcocmVkcmF3Tm93OiAoc2tpcFN2Zz86IGJvb2xlYW4pID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgbGV0IHJlZHJhd2luZyA9IGZhbHNlO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICByZWRyYXdOb3coKTtcbiAgICAgIHJlZHJhd2luZyA9IGZhbHNlO1xuICAgIH0pO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgc2V0Q2hlY2ssIHNldFNlbGVjdGVkIH0gZnJvbSAnLi9ib2FyZCdcbmltcG9ydCB7IHJlYWQgYXMgZmVuUmVhZCB9IGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgRHJhd1NoYXBlLCBEcmF3QnJ1c2ggfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gIGZlbj86IGNnLkZFTjsgLy8gY2hlc3MgcG9zaXRpb24gaW4gRm9yc3l0aCBub3RhdGlvblxuICBvcmllbnRhdGlvbj86IGNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gd2hpdGUgfCBibGFja1xuICB0dXJuQ29sb3I/OiBjZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiB3aGl0ZSB8IGJsYWNrXG4gIGNoZWNrPzogY2cuQ29sb3IgfCBib29sZWFuOyAvLyB0cnVlIGZvciBjdXJyZW50IGNvbG9yLCBmYWxzZSB0byB1bnNldFxuICBsYXN0TW92ZT86IGNnLktleVtdOyAvLyBzcXVhcmVzIHBhcnQgb2YgdGhlIGxhc3QgbW92ZSBbXCJjM1wiLCBcImM0XCJdXG4gIHNlbGVjdGVkPzogY2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiYTFcIlxuICBjb29yZGluYXRlcz86IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgYXV0b0Nhc3RsZT86IGJvb2xlYW47IC8vIGltbWVkaWF0ZWx5IGNvbXBsZXRlIHRoZSBjYXN0bGUgYnkgbW92aW5nIHRoZSByb29rIGFmdGVyIGtpbmcgbW92ZVxuICB2aWV3T25seT86IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIGRpc2FibGVDb250ZXh0TWVudT86IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgY2hlc3Nib2FyZFxuICByZXNpemFibGU/OiBib29sZWFuOyAvLyBsaXN0ZW5zIHRvIGNoZXNzZ3JvdW5kLnJlc2l6ZSBvbiBkb2N1bWVudC5ib2R5IHRvIGNsZWFyIGJvdW5kcyBjYWNoZVxuICBhZGRQaWVjZVpJbmRleD86IGJvb2xlYW47IC8vIGFkZHMgei1pbmRleCB2YWx1ZXMgdG8gcGllY2VzIChmb3IgM0QpXG4gIC8vIHBpZWNlS2V5OiBib29sZWFuOyAvLyBhZGQgYSBkYXRhLWtleSBhdHRyaWJ1dGUgdG8gcGllY2UgZWxlbWVudHNcbiAgaGlnaGxpZ2h0Pzoge1xuICAgIGxhc3RNb3ZlPzogYm9vbGVhbjsgLy8gYWRkIGxhc3QtbW92ZSBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2s/OiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb24/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47XG4gICAgZHVyYXRpb24/OiBudW1iZXI7XG4gIH07XG4gIG1vdmFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBjb2xvcj86IGNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlLiB3aGl0ZSB8IGJsYWNrIHwgYm90aCB8IHVuZGVmaW5lZFxuICAgIGRlc3RzPzoge1xuICAgICAgW2tleTogc3RyaW5nXTogY2cuS2V5W11cbiAgICB9OyAvLyB2YWxpZCBtb3Zlcy4ge1wiYTJcIiBbXCJhM1wiIFwiYTRcIl0gXCJiMVwiIFtcImEzXCIgXCJjM1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM/OiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgICAgYWZ0ZXJOZXdQaWVjZT86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIGEgbmV3IHBpZWNlIGlzIGRyb3BwZWQgb24gdGhlIGJvYXJkXG4gICAgfTtcbiAgICByb29rQ2FzdGxlPzogYm9vbGVhbiAvLyBjYXN0bGUgYnkgbW92aW5nIHRoZSBraW5nIHRvIHRoZSByb29rXG4gIH07XG4gIHByZW1vdmFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmVtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGNhc3RsZT86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWxsb3cga2luZyBjYXN0bGUgcHJlbW92ZXNcbiAgICBkZXN0cz86IGNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YT86IGNnLlNldFByZW1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBwcmVkcm9wcGFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIGV2ZW50cz86IHtcbiAgICAgIHNldD86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIGRyYWdnYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZT86IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZT86IGJvb2xlYW47IC8vIGxldHMgY2hlc3Nncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIGNlbnRlclBpZWNlPzogYm9vbGVhbjsgLy8gY2VudGVyIHRoZSBwaWVjZSBvbiBjdXJzb3IgYXQgZHJhZyBzdGFydFxuICAgIHNob3dHaG9zdD86IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIGRlbGV0ZU9uRHJvcE9mZj86IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkXG4gIH07XG4gIHNlbGVjdGFibGU/OiB7XG4gICAgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGVuYWJsZWQ/OiBib29sZWFuXG4gIH07XG4gIGV2ZW50cz86IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIC8vIGNhbGxlZCBhZnRlciBhIHBpZWNlIGhhcyBiZWVuIG1vdmVkLlxuICAgIC8vIGNhcHR1cmVkUGllY2UgaXMgdW5kZWZpbmVkIG9yIGxpa2Uge2NvbG9yOiAnd2hpdGUnOyAncm9sZSc6ICdxdWVlbid9XG4gICAgbW92ZT86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgY2FwdHVyZWRQaWVjZT86IGNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3BOZXdQaWVjZT86IChwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5KSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IGNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICBpbnNlcnQ/OiAoZWxlbWVudHM6IGNnLkVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICAgIHZpc2libGU/OiBib29sZWFuOyAvLyBjYW4gdmlld1xuICAgIGVyYXNlT25DbGljaz86IGJvb2xlYW47XG4gICAgc2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgYXV0b1NoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIGJydXNoZXM/OiBEcmF3QnJ1c2hbXTtcbiAgICBwaWVjZXM/OiB7XG4gICAgICBiYXNlVXJsPzogc3RyaW5nO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlKHN0YXRlOiBTdGF0ZSwgY29uZmlnOiBDb25maWcpIHtcblxuICAvLyBkb24ndCBtZXJnZSBkZXN0aW5hdGlvbnMuIEp1c3Qgb3ZlcnJpZGUuXG4gIGlmIChjb25maWcubW92YWJsZSAmJiBjb25maWcubW92YWJsZS5kZXN0cykgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcblxuICBtZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIGZlbiB3YXMgcHJvdmlkZWQsIHJlcGxhY2UgdGhlIHBpZWNlc1xuICBpZiAoY29uZmlnLmZlbikge1xuICAgIHN0YXRlLnBpZWNlcyA9IGZlblJlYWQoY29uZmlnLmZlbik7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gIH1cblxuICAvLyBhcHBseSBjb25maWcgdmFsdWVzIHRoYXQgY291bGQgYmUgdW5kZWZpbmVkIHlldCBtZWFuaW5nZnVsXG4gIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoJ2NoZWNrJykpIHNldENoZWNrKHN0YXRlLCBjb25maWcuY2hlY2sgfHwgZmFsc2UpO1xuICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KCdsYXN0TW92ZScpICYmICFjb25maWcubGFzdE1vdmUpIHN0YXRlLmxhc3RNb3ZlID0gdW5kZWZpbmVkO1xuICAvLyBpbiBjYXNlIG9mIFpIIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgLy8gaWYgdGhlIHByZXZpb3VzIGxhc3QgbW92ZSBoYWQgdHdvIHNxdWFyZXMsXG4gIC8vIHRoZSBtZXJnZSBhbGdvcml0aG0gd2lsbCBpbmNvcnJlY3RseSBrZWVwIHRoZSBzZWNvbmQgc3F1YXJlLlxuICBlbHNlIGlmIChjb25maWcubGFzdE1vdmUpIHN0YXRlLmxhc3RNb3ZlID0gY29uZmlnLmxhc3RNb3ZlO1xuXG4gIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgaWYgKHN0YXRlLnNlbGVjdGVkKSBzZXRTZWxlY3RlZChzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQpO1xuXG4gIC8vIG5vIG5lZWQgZm9yIHN1Y2ggc2hvcnQgYW5pbWF0aW9uc1xuICBpZiAoIXN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCBzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gPCAxMDApIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID0gZmFsc2U7XG5cbiAgaWYgKCFzdGF0ZS5tb3ZhYmxlLnJvb2tDYXN0bGUgJiYgc3RhdGUubW92YWJsZS5kZXN0cykge1xuICAgIGNvbnN0IHJhbmsgPSBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnd2hpdGUnID8gMSA6IDgsXG4gICAga2luZ1N0YXJ0UG9zID0gJ2UnICsgcmFuayxcbiAgICBkZXN0cyA9IHN0YXRlLm1vdmFibGUuZGVzdHNba2luZ1N0YXJ0UG9zXSxcbiAgICBraW5nID0gc3RhdGUucGllY2VzW2tpbmdTdGFydFBvc107XG4gICAgaWYgKCFkZXN0cyB8fCAha2luZyB8fCBraW5nLnJvbGUgIT09ICdraW5nJykgcmV0dXJuO1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHNba2luZ1N0YXJ0UG9zXSA9IGRlc3RzLmZpbHRlcihkID0+XG4gICAgICAhKChkID09PSAnYScgKyByYW5rKSAmJiBkZXN0cy5pbmRleE9mKCdjJyArIHJhbmsgYXMgY2cuS2V5KSAhPT0gLTEpICYmXG4gICAgICAgICEoKGQgPT09ICdoJyArIHJhbmspICYmIGRlc3RzLmluZGV4T2YoJ2cnICsgcmFuayBhcyBjZy5LZXkpICE9PSAtMSlcbiAgICApO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtZXJnZShiYXNlOiBhbnksIGV4dGVuZDogYW55KSB7XG4gIGZvciAobGV0IGtleSBpbiBleHRlbmQpIHtcbiAgICBpZiAoaXNPYmplY3QoYmFzZVtrZXldKSAmJiBpc09iamVjdChleHRlbmRba2V5XSkpIG1lcmdlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xuICAgIGVsc2UgYmFzZVtrZXldID0gZXh0ZW5kW2tleV07XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNPYmplY3QobzogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCc7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBjbGVhciBhcyBkcmF3Q2xlYXIgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbSdcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnQ3VycmVudCB7XG4gIG9yaWc6IGNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhZ2dpbmcgcGllY2VcbiAgb3JpZ1BvczogY2cuUG9zO1xuICBwaWVjZTogY2cuUGllY2U7XG4gIHJlbDogY2cuTnVtYmVyUGFpcjsgLy8geDsgeSBvZiB0aGUgcGllY2UgYXQgb3JpZ2luYWwgcG9zaXRpb25cbiAgZXBvczogY2cuTnVtYmVyUGFpcjsgLy8gaW5pdGlhbCBldmVudCBwb3NpdGlvblxuICBwb3M6IGNnLk51bWJlclBhaXI7IC8vIHJlbGF0aXZlIGN1cnJlbnQgcG9zaXRpb25cbiAgZGVjOiBjZy5OdW1iZXJQYWlyOyAvLyBwaWVjZSBjZW50ZXIgZGVjYXlcbiAgc3RhcnRlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgc3RhcnRlZDsgYXMgcGVyIHRoZSBkaXN0YW5jZSBzZXR0aW5nXG4gIGVsZW1lbnQ6IGNnLlBpZWNlTm9kZSB8ICgoKSA9PiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQpO1xuICBuZXdQaWVjZT86IGJvb2xlYW47IC8vIGl0IGl0IGEgbmV3IHBpZWNlIGZyb20gb3V0c2lkZSB0aGUgYm9hcmRcbiAgZm9yY2U/OiBib29sZWFuOyAvLyBjYW4gdGhlIG5ldyBwaWVjZSByZXBsYWNlIGFuIGV4aXN0aW5nIG9uZSAoZWRpdG9yKVxuICBwcmV2aW91c2x5U2VsZWN0ZWQ/OiBjZy5LZXk7XG4gIG9yaWdpblRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApIHJldHVybjsgLy8gb25seSB0b3VjaCBvciBsZWZ0IGNsaWNrXG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzKCksXG4gIHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXIsXG4gIG9yaWcgPSBib2FyZC5nZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgYm9hcmQud2hpdGVQb3YocyksIGJvdW5kcyk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBjb25zdCBwaWVjZSA9IHMucGllY2VzW29yaWddO1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWQgPSBzLnNlbGVjdGVkO1xuICBpZiAoIXByZXZpb3VzbHlTZWxlY3RlZCAmJiBzLmRyYXdhYmxlLmVuYWJsZWQgJiYgKFxuICAgIHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrIHx8ICghcGllY2UgfHwgcGllY2UuY29sb3IgIT09IHMudHVybkNvbG9yKVxuICApKSBkcmF3Q2xlYXIocyk7XG4gIC8vIFByZXZlbnQgdG91Y2ggc2Nyb2xsIGFuZCBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudCwgaWYgdGhlcmVcbiAgLy8gaXMgYW4gaW50ZW50IHRvIGludGVyYWN0IHdpdGggdGhlIGJvYXJkLiBJZiBubyBjb2xvciBpcyBtb3ZhYmxlXG4gIC8vIChhbmQgdGhlIGJvYXJkIGlzIG5vdCBmb3Igdmlld2luZyBvbmx5KSwgdG91Y2hlcyBhcmUgbGlrZWx5IGludGVuZGVkIHRvXG4gIC8vIHNlbGVjdCBzcXVhcmVzLlxuICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSAmJlxuICAgICAgKCFlLnRvdWNoZXMgfHwgIXMubW92YWJsZS5jb2xvciB8fCBwaWVjZSB8fCBwcmV2aW91c2x5U2VsZWN0ZWQgfHwgcGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uKSkpXG4gICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICBpZiAocy5zZWxlY3RlZCAmJiBib2FyZC5jYW5Nb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIG9yaWcpLCBzKTtcbiAgfSBlbHNlIHtcbiAgICBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gIH1cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWc7XG4gIGNvbnN0IGVsZW1lbnQgPSBwaWVjZUVsZW1lbnRCeUtleShzLCBvcmlnKTtcbiAgaWYgKHBpZWNlICYmIGVsZW1lbnQgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBvcmlnKSkge1xuICAgIGNvbnN0IHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMob3JpZywgYm9hcmQud2hpdGVQb3YocyksIGJvdW5kcyk7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIG9yaWcsXG4gICAgICBvcmlnUG9zOiB1dGlsLmtleTJwb3Mob3JpZyksXG4gICAgICBwaWVjZSxcbiAgICAgIHJlbDogcG9zaXRpb24sXG4gICAgICBlcG9zOiBwb3NpdGlvbixcbiAgICAgIHBvczogWzAsIDBdLFxuICAgICAgZGVjOiBzLmRyYWdnYWJsZS5jZW50ZXJQaWVjZSA/IFtcbiAgICAgICAgcG9zaXRpb25bMF0gLSAoc3F1YXJlQm91bmRzLmxlZnQgKyBzcXVhcmVCb3VuZHMud2lkdGggLyAyKSxcbiAgICAgICAgcG9zaXRpb25bMV0gLSAoc3F1YXJlQm91bmRzLnRvcCArIHNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyKVxuICAgICAgXSA6IFswLCAwXSxcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiBzLnN0YXRzLmRyYWdnZWQsXG4gICAgICBlbGVtZW50LFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldFxuICAgIH07XG4gICAgZWxlbWVudC5jZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG4gICAgLy8gcGxhY2UgZ2hvc3RcbiAgICBjb25zdCBnaG9zdCA9IHMuZG9tLmVsZW1lbnRzLmdob3N0O1xuICAgIGlmIChnaG9zdCkge1xuICAgICAgZ2hvc3QuY2xhc3NOYW1lID0gYGdob3N0ICR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xuICAgICAgdXRpbC50cmFuc2xhdGVBYnMoZ2hvc3QsIHV0aWwucG9zVG9UcmFuc2xhdGVBYnMoYm91bmRzKSh1dGlsLmtleTJwb3Mob3JpZyksIGJvYXJkLndoaXRlUG92KHMpKSk7XG4gICAgICB1dGlsLnNldFZpc2libGUoZ2hvc3QsIHRydWUpO1xuICAgIH1cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWVjZUNsb3NlVG8oczogU3RhdGUsIHBvczogY2cuTnVtYmVyUGFpcik6IGJvb2xlYW4ge1xuICBjb25zdCBhc1doaXRlID0gYm9hcmQud2hpdGVQb3YocyksXG4gIGJvdW5kcyA9IHMuZG9tLmJvdW5kcygpLFxuICByYWRpdXNTcSA9IE1hdGgucG93KGJvdW5kcy53aWR0aCAvIDgsIDIpO1xuICBmb3IgKGxldCBrZXkgaW4gcy5waWVjZXMpIHtcbiAgICBjb25zdCBzcXVhcmVCb3VuZHMgPSBjb21wdXRlU3F1YXJlQm91bmRzKGtleSBhcyBjZy5LZXksIGFzV2hpdGUsIGJvdW5kcyksXG4gICAgY2VudGVyOiBjZy5OdW1iZXJQYWlyID0gW1xuICAgICAgc3F1YXJlQm91bmRzLmxlZnQgKyBzcXVhcmVCb3VuZHMud2lkdGggLyAyLFxuICAgICAgc3F1YXJlQm91bmRzLnRvcCArIHNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyXG4gICAgXTtcbiAgICBpZiAodXRpbC5kaXN0YW5jZVNxKGNlbnRlciwgcG9zKSA8PSByYWRpdXNTcSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhZ05ld1BpZWNlKHM6IFN0YXRlLCBwaWVjZTogY2cuUGllY2UsIGU6IGNnLk1vdWNoRXZlbnQsIGZvcmNlPzogYm9vbGVhbik6IHZvaWQge1xuXG4gIGNvbnN0IGtleTogY2cuS2V5ID0gJ2EwJztcblxuICBzLnBpZWNlc1trZXldID0gcGllY2U7XG5cbiAgcy5kb20ucmVkcmF3KCk7XG5cbiAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcixcbiAgYXNXaGl0ZSA9IGJvYXJkLndoaXRlUG92KHMpLFxuICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgc3F1YXJlQm91bmRzID0gY29tcHV0ZVNxdWFyZUJvdW5kcyhrZXksIGFzV2hpdGUsIGJvdW5kcyk7XG5cbiAgY29uc3QgcmVsOiBjZy5OdW1iZXJQYWlyID0gW1xuICAgIChhc1doaXRlID8gMCA6IDcpICogc3F1YXJlQm91bmRzLndpZHRoICsgYm91bmRzLmxlZnQsXG4gICAgKGFzV2hpdGUgPyA4IDogLTEpICogc3F1YXJlQm91bmRzLmhlaWdodCArIGJvdW5kcy50b3BcbiAgXTtcblxuICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWc6IGtleSxcbiAgICBvcmlnUG9zOiB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICBwaWVjZSxcbiAgICByZWwsXG4gICAgZXBvczogcG9zaXRpb24sXG4gICAgcG9zOiBbcG9zaXRpb25bMF0gLSByZWxbMF0sIHBvc2l0aW9uWzFdIC0gcmVsWzFdXSxcbiAgICBkZWM6IFstc3F1YXJlQm91bmRzLndpZHRoIC8gMiwgLXNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyXSxcbiAgICBzdGFydGVkOiB0cnVlLFxuICAgIGVsZW1lbnQ6ICgpID0+IHBpZWNlRWxlbWVudEJ5S2V5KHMsIGtleSksXG4gICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICBuZXdQaWVjZTogdHJ1ZSxcbiAgICBmb3JjZTogISFmb3JjZVxuICB9O1xuICBwcm9jZXNzRHJhZyhzKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoczogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICAgIGlmICghY3VyKSByZXR1cm47XG4gICAgLy8gY2FuY2VsIGFuaW1hdGlvbnMgd2hpbGUgZHJhZ2dpbmdcbiAgICBpZiAocy5hbmltYXRpb24uY3VycmVudCAmJiBzLmFuaW1hdGlvbi5jdXJyZW50LnBsYW4uYW5pbXNbY3VyLm9yaWddKSBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBjb25zdCBvcmlnUGllY2UgPSBzLnBpZWNlc1tjdXIub3JpZ107XG4gICAgaWYgKCFvcmlnUGllY2UgfHwgIXV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKCFjdXIuc3RhcnRlZCAmJiB1dGlsLmRpc3RhbmNlU3EoY3VyLmVwb3MsIGN1ci5yZWwpID49IE1hdGgucG93KHMuZHJhZ2dhYmxlLmRpc3RhbmNlLCAyKSkgY3VyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKGN1ci5zdGFydGVkKSB7XG5cbiAgICAgICAgLy8gc3VwcG9ydCBsYXp5IGVsZW1lbnRzXG4gICAgICAgIGlmICh0eXBlb2YgY3VyLmVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBmb3VuZCA9IGN1ci5lbGVtZW50KCk7XG4gICAgICAgICAgaWYgKCFmb3VuZCkgcmV0dXJuO1xuICAgICAgICAgIGZvdW5kLmNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIGZvdW5kLmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG4gICAgICAgICAgY3VyLmVsZW1lbnQgPSBmb3VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1ci5wb3MgPSBbXG4gICAgICAgICAgY3VyLmVwb3NbMF0gLSBjdXIucmVsWzBdLFxuICAgICAgICAgIGN1ci5lcG9zWzFdIC0gY3VyLnJlbFsxXVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIG1vdmUgcGllY2VcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZG9tLmJvdW5kcygpKShjdXIub3JpZ1BvcywgYm9hcmQud2hpdGVQb3YocykpO1xuICAgICAgICB0cmFuc2xhdGlvblswXSArPSBjdXIucG9zWzBdICsgY3VyLmRlY1swXTtcbiAgICAgICAgdHJhbnNsYXRpb25bMV0gKz0gY3VyLnBvc1sxXSArIGN1ci5kZWNbMV07XG4gICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKGN1ci5lbGVtZW50LCB0cmFuc2xhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudC5lcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoIWN1cikgcmV0dXJuO1xuICAvLyBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudFxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UpIGUucHJldmVudERlZmF1bHQoKTtcbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGN1ciAmJiBjdXIub3JpZ2luVGFyZ2V0ICE9PSBlLnRhcmdldCAmJiAhY3VyLm5ld1BpZWNlKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm47XG4gIH1cbiAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIC8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbjsgc28gdXNlIHRoZSBsYXN0IHRvdWNobW92ZSBwb3NpdGlvbiBpbnN0ZWFkXG4gIGNvbnN0IGV2ZW50UG9zOiBjZy5OdW1iZXJQYWlyID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIHx8IGN1ci5lcG9zO1xuICBjb25zdCBkZXN0ID0gYm9hcmQuZ2V0S2V5QXREb21Qb3MoZXZlbnRQb3MsIGJvYXJkLndoaXRlUG92KHMpLCBzLmRvbS5ib3VuZHMoKSk7XG4gIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkICYmIGN1ci5vcmlnICE9PSBkZXN0KSB7XG4gICAgaWYgKGN1ci5uZXdQaWVjZSkgYm9hcmQuZHJvcE5ld1BpZWNlKHMsIGN1ci5vcmlnLCBkZXN0LCBjdXIuZm9yY2UpO1xuICAgIGVsc2Uge1xuICAgICAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICAgICAgaWYgKGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5vcmlnLCBkZXN0KSkgcy5zdGF0cy5kcmFnZ2VkID0gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY3VyLm5ld1BpZWNlKSB7XG4gICAgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgfSBlbHNlIGlmIChzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiYgIWRlc3QpIHtcbiAgICBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIGJvYXJkLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuICBpZiAoY3VyICYmIGN1ci5vcmlnID09PSBjdXIucHJldmlvdXNseVNlbGVjdGVkICYmIChjdXIub3JpZyA9PT0gZGVzdCB8fCAhZGVzdCkpXG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gIGVsc2UgaWYgKCFzLnNlbGVjdGFibGUuZW5hYmxlZCkgYm9hcmQudW5zZWxlY3Qocyk7XG5cbiAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBpZiAoY3VyLm5ld1BpZWNlKSBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gICAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZURyYWdFbGVtZW50cyhzOiBTdGF0ZSkge1xuICBjb25zdCBlID0gcy5kb20uZWxlbWVudHM7XG4gIGlmIChlLmdob3N0KSB1dGlsLnNldFZpc2libGUoZS5naG9zdCwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQm91bmRzKGtleTogY2cuS2V5LCBhc1doaXRlOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpIHtcbiAgY29uc3QgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIGlmICghYXNXaGl0ZSkge1xuICAgIHBvc1swXSA9IDkgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gOSAtIHBvc1sxXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGxlZnQ6IGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoICogKHBvc1swXSAtIDEpIC8gOCxcbiAgICB0b3A6IGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0ICogKDggLSBwb3NbMV0pIC8gOCxcbiAgICB3aWR0aDogYm91bmRzLndpZHRoIC8gOCxcbiAgICBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQgLyA4XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBpZWNlRWxlbWVudEJ5S2V5KHM6IFN0YXRlLCBrZXk6IGNnLktleSk6IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGxldCBlbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoZWwuY2dLZXkgPT09IGtleSAmJiBlbC50YWdOYW1lID09PSAnUElFQ0UnKSByZXR1cm4gZWw7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBjZy5QaWVjZU5vZGU7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlLCBnZXRLZXlBdERvbVBvcywgd2hpdGVQb3YgfSBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgZXZlbnRQb3NpdGlvbiwgaXNSaWdodEJ1dHRvbiB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlIHtcbiAgb3JpZzogY2cuS2V5O1xuICBkZXN0PzogY2cuS2V5O1xuICBicnVzaDogc3RyaW5nO1xuICBtb2RpZmllcnM/OiBEcmF3TW9kaWZpZXJzO1xuICBwaWVjZT86IERyYXdTaGFwZVBpZWNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZVBpZWNlIHtcbiAgcm9sZTogY2cuUm9sZTtcbiAgY29sb3I6IGNnLkNvbG9yO1xuICBzY2FsZT86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3QnJ1c2gge1xuICBrZXk6IHN0cmluZztcbiAgY29sb3I6IHN0cmluZztcbiAgb3BhY2l0eTogbnVtYmVyO1xuICBsaW5lV2lkdGg6IG51bWJlclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdCcnVzaGVzIHtcbiAgW25hbWU6IHN0cmluZ106IERyYXdCcnVzaDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3TW9kaWZpZXJzIHtcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdhYmxlIHtcbiAgZW5hYmxlZDogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgdmlzaWJsZTogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgZXJhc2VPbkNsaWNrOiBib29sZWFuO1xuICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkO1xuICBzaGFwZXM6IERyYXdTaGFwZVtdOyAvLyB1c2VyIHNoYXBlc1xuICBhdXRvU2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gY29tcHV0ZXIgc2hhcGVzXG4gIGN1cnJlbnQ/OiBEcmF3Q3VycmVudDtcbiAgYnJ1c2hlczogRHJhd0JydXNoZXM7XG4gIC8vIGRyYXdhYmxlIFNWRyBwaWVjZXM7IHVzZWQgZm9yIGNyYXp5aG91c2UgZHJvcFxuICBwaWVjZXM6IHtcbiAgICBiYXNlVXJsOiBzdHJpbmdcbiAgfSxcbiAgcHJldlN2Z0hhc2g6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdDdXJyZW50IHtcbiAgb3JpZzogY2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmF3aW5nXG4gIGRlc3Q/OiBjZy5LZXk7IC8vIHNoYXBlIGRlc3QsIG9yIHVuZGVmaW5lZCBmb3IgY2lyY2xlXG4gIG1vdXNlU3E/OiBjZy5LZXk7IC8vIHNxdWFyZSBiZWluZyBtb3VzZWQgb3ZlclxuICBwb3M6IGNnLk51bWJlclBhaXI7IC8vIHJlbGF0aXZlIGN1cnJlbnQgcG9zaXRpb25cbiAgYnJ1c2g6IHN0cmluZzsgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbn1cblxuY29uc3QgYnJ1c2hlcyA9IFsnZ3JlZW4nLCAncmVkJywgJ2JsdWUnLCAneWVsbG93J107XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuOyAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGUuY3RybEtleSA/IHVuc2VsZWN0KHN0YXRlKSA6IGNhbmNlbE1vdmUoc3RhdGUpO1xuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXIsXG4gIG9yaWcgPSBnZXRLZXlBdERvbVBvcyhwb3MsIHdoaXRlUG92KHN0YXRlKSwgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZyxcbiAgICBwb3MsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSlcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0RyYXcoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudDtcbiAgICBpZiAoY3VyKSB7XG4gICAgICBjb25zdCBtb3VzZVNxID0gZ2V0S2V5QXREb21Qb3MoY3VyLnBvcywgd2hpdGVQb3Yoc3RhdGUpLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgICAgaWYgKG1vdXNlU3EgIT09IGN1ci5tb3VzZVNxKSB7XG4gICAgICAgIGN1ci5tb3VzZVNxID0gbW91c2VTcTtcbiAgICAgICAgY3VyLmRlc3QgPSBtb3VzZVNxICE9PSBjdXIub3JpZyA/IG1vdXNlU3EgOiB1bmRlZmluZWQ7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQucG9zID0gZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICBpZiAoY3VyKSB7XG4gICAgaWYgKGN1ci5tb3VzZVNxKSBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICBjYW5jZWwoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuc2hhcGVzLmxlbmd0aCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBvbkNoYW5nZShzdGF0ZS5kcmF3YWJsZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRCcnVzaChlOiBjZy5Nb3VjaEV2ZW50KTogc3RyaW5nIHtcbiAgcmV0dXJuIGJydXNoZXNbKChlLnNoaWZ0S2V5IHx8IGUuY3RybEtleSkgJiYgaXNSaWdodEJ1dHRvbihlKSA/IDEgOiAwKSArIChlLmFsdEtleSA/IDIgOiAwKV07XG59XG5cbmZ1bmN0aW9uIGFkZFNoYXBlKGRyYXdhYmxlOiBEcmF3YWJsZSwgY3VyOiBEcmF3Q3VycmVudCk6IHZvaWQge1xuICBjb25zdCBzYW1lU2hhcGUgPSAoczogRHJhd1NoYXBlKSA9PiBzLm9yaWcgPT09IGN1ci5vcmlnICYmIHMuZGVzdCA9PT0gY3VyLmRlc3Q7XG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHNhbWVTaGFwZSlbMF07XG4gIGlmIChzaW1pbGFyKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHMgPT4gIXNhbWVTaGFwZShzKSk7XG4gIGlmICghc2ltaWxhciB8fCBzaW1pbGFyLmJydXNoICE9PSBjdXIuYnJ1c2gpIGRyYXdhYmxlLnNoYXBlcy5wdXNoKGN1cik7XG4gIG9uQ2hhbmdlKGRyYXdhYmxlKTtcbn1cblxuZnVuY3Rpb24gb25DaGFuZ2UoZHJhd2FibGU6IERyYXdhYmxlKTogdm9pZCB7XG4gIGlmIChkcmF3YWJsZS5vbkNoYW5nZSkgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBjYW5jZWwgYXMgY2FuY2VsRHJhZyB9IGZyb20gJy4vZHJhZydcblxuZXhwb3J0IGZ1bmN0aW9uIHNldERyb3BNb2RlKHM6IFN0YXRlLCBwaWVjZT86IGNnLlBpZWNlKTogdm9pZCB7XG4gIHMuZHJvcG1vZGUgPSB7XG4gICAgYWN0aXZlOiB0cnVlLFxuICAgIHBpZWNlXG4gIH07XG4gIGNhbmNlbERyYWcocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxEcm9wTW9kZShzOiBTdGF0ZSk6IHZvaWQge1xuICBzLmRyb3Btb2RlID0ge1xuICAgIGFjdGl2ZTogZmFsc2VcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyb3AoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKCFzLmRyb3Btb2RlLmFjdGl2ZSkgcmV0dXJuO1xuXG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuXG4gIGNvbnN0IHBpZWNlID0gcy5kcm9wbW9kZS5waWVjZTtcblxuICBpZiAocGllY2UpIHtcbiAgICBzLnBpZWNlcy5hMCA9IHBpZWNlO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgIGNvbnN0IGRlc3QgPSBwb3NpdGlvbiAmJiBib2FyZC5nZXRLZXlBdERvbVBvcyhcbiAgICAgIHBvc2l0aW9uLCBib2FyZC53aGl0ZVBvdihzKSwgcy5kb20uYm91bmRzKCkpO1xuICAgIGlmIChkZXN0KSBib2FyZC5kcm9wTmV3UGllY2UocywgJ2EwJywgZGVzdCk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBkcmFnIGZyb20gJy4vZHJhZydcbmltcG9ydCAqIGFzIGRyYXcgZnJvbSAnLi9kcmF3J1xuaW1wb3J0IHsgZHJvcCB9IGZyb20gJy4vZHJvcCdcbmltcG9ydCB7IGlzUmlnaHRCdXR0b24gfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIE1vdWNoQmluZCA9IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xudHlwZSBTdGF0ZU1vdWNoQmluZCA9IChkOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSk6IHZvaWQge1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgYm9hcmRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuXG4gIC8vIENhbm5vdCBiZSBwYXNzaXZlLCBiZWNhdXNlIHdlIHByZXZlbnQgdG91Y2ggc2Nyb2xsaW5nIGFuZCBkcmFnZ2luZyBvZlxuICAvLyBzZWxlY3RlZCBlbGVtZW50cy5cbiAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcblxuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKSB7XG4gICAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgfVxufVxuXG4vLyByZXR1cm5zIHRoZSB1bmJpbmQgZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBiaW5kRG9jdW1lbnQoczogU3RhdGUsIHJlZHJhd0FsbDogY2cuUmVkcmF3KTogY2cuVW5iaW5kIHtcblxuICBjb25zdCB1bmJpbmRzOiBjZy5VbmJpbmRbXSA9IFtdO1xuXG4gIGlmICghcy5kb20ucmVsYXRpdmUgJiYgcy5yZXNpemFibGUpIHtcbiAgICBjb25zdCBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgIHMuZG9tLmJvdW5kcy5jbGVhcigpO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlZHJhd0FsbCk7XG4gICAgfTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudC5ib2R5LCAnY2hlc3Nncm91bmQucmVzaXplJywgb25SZXNpemUpKTtcbiAgfVxuXG4gIGlmICghcy52aWV3T25seSkge1xuXG4gICAgY29uc3Qgb25tb3ZlOiBNb3VjaEJpbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcubW92ZSwgZHJhdy5tb3ZlKTtcbiAgICBjb25zdCBvbmVuZDogTW91Y2hCaW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLmVuZCwgZHJhdy5lbmQpO1xuXG4gICAgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10uZm9yRWFjaChldiA9PiB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSkpKTtcbiAgICBbJ3RvdWNoZW5kJywgJ21vdXNldXAnXS5mb3JFYWNoKGV2ID0+IHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25lbmQpKSk7XG5cbiAgICBjb25zdCBvblNjcm9sbCA9ICgpID0+IHMuZG9tLmJvdW5kcy5jbGVhcigpO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Njcm9sbCcsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Jlc2l6ZScsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICB9XG5cbiAgcmV0dXJuICgpID0+IHVuYmluZHMuZm9yRWFjaChmID0+IGYoKSk7XG59XG5cbmZ1bmN0aW9uIHVuYmluZGFibGUoZWw6IEV2ZW50VGFyZ2V0LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IE1vdWNoQmluZCwgb3B0aW9ucz86IGFueSk6IGNnLlVuYmluZCB7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayBhcyBFdmVudExpc3RlbmVyLCBvcHRpb25zKTtcbiAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayBhcyBFdmVudExpc3RlbmVyKTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIGUgPT4ge1xuICAgIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50KSBkcmFnLmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSkgeyBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0KHMsIGUpOyB9XG4gICAgZWxzZSBpZiAoIXMudmlld09ubHkpIHtcbiAgICAgIGlmIChzLmRyb3Btb2RlLmFjdGl2ZSkgZHJvcChzLCBlKTtcbiAgICAgIGVsc2UgZHJhZy5zdGFydChzLCBlKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRyYWdPckRyYXcoczogU3RhdGUsIHdpdGhEcmFnOiBTdGF0ZU1vdWNoQmluZCwgd2l0aERyYXc6IFN0YXRlTW91Y2hCaW5kKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIGUgPT4ge1xuICAgIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkpIHsgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgd2l0aERyYXcocywgZSk7IH1cbiAgICBlbHNlIGlmICghcy52aWV3T25seSkgd2l0aERyYWcocywgZSk7XG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBLZXkgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBleHBsb3Npb24oc3RhdGU6IFN0YXRlLCBrZXlzOiBLZXlbXSk6IHZvaWQge1xuICBzdGF0ZS5leHBsb2RpbmcgPSB7IHN0YWdlOiAxLCBrZXlzIH07XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgc2V0U3RhZ2Uoc3RhdGUsIDIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0U3RhZ2Uoc3RhdGUsIHVuZGVmaW5lZCksIDEyMCk7XG4gIH0sIDEyMCk7XG59XG5cbmZ1bmN0aW9uIHNldFN0YWdlKHN0YXRlOiBTdGF0ZSwgc3RhZ2U6IG51bWJlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBpZiAoc3RhdGUuZXhwbG9kaW5nKSB7XG4gICAgaWYgKHN0YWdlKSBzdGF0ZS5leHBsb2Rpbmcuc3RhZ2UgPSBzdGFnZTtcbiAgICBlbHNlIHN0YXRlLmV4cGxvZGluZyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IHBvczJrZXksIGludlJhbmtzIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGNvbnN0IGluaXRpYWw6IGNnLkZFTiA9ICdybmJxa2Juci9wcHBwcHBwcC84LzgvOC84L1BQUFBQUFBQL1JOQlFLQk5SJztcblxuY29uc3Qgcm9sZXM6IHsgW2xldHRlcjogc3RyaW5nXTogY2cuUm9sZSB9ID0geyBwOiAncGF3bicsIHI6ICdyb29rJywgbjogJ2tuaWdodCcsIGI6ICdiaXNob3AnLCBxOiAncXVlZW4nLCBrOiAna2luZycgfTtcblxuY29uc3QgbGV0dGVycyA9IHsgcGF3bjogJ3AnLCByb29rOiAncicsIGtuaWdodDogJ24nLCBiaXNob3A6ICdiJywgcXVlZW46ICdxJywga2luZzogJ2snIH07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkKGZlbjogY2cuRkVOKTogY2cuUGllY2VzIHtcbiAgaWYgKGZlbiA9PT0gJ3N0YXJ0JykgZmVuID0gaW5pdGlhbDtcbiAgY29uc3QgcGllY2VzOiBjZy5QaWVjZXMgPSB7fTtcbiAgbGV0IHJvdzogbnVtYmVyID0gOCwgY29sOiBudW1iZXIgPSAwO1xuICBmb3IgKGNvbnN0IGMgb2YgZmVuKSB7XG4gICAgc3dpdGNoIChjKSB7XG4gICAgICBjYXNlICcgJzogcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICAtLXJvdztcbiAgICAgICAgaWYgKHJvdyA9PT0gMCkgcmV0dXJuIHBpZWNlcztcbiAgICAgICAgY29sID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd+JzpcbiAgICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXNbcG9zMmtleShbY29sLCByb3ddKV07XG4gICAgICAgIGlmIChwaWVjZSkgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIgPCA1NykgY29sICs9IG5iIC0gNDg7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICsrY29sO1xuICAgICAgICAgIGNvbnN0IHJvbGUgPSBjLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcGllY2VzW3BvczJrZXkoW2NvbCwgcm93XSldID0ge1xuICAgICAgICAgICAgcm9sZTogcm9sZXNbcm9sZV0sXG4gICAgICAgICAgICBjb2xvcjogKGMgPT09IHJvbGUgPyAnYmxhY2snIDogJ3doaXRlJykgYXMgY2cuQ29sb3JcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwaWVjZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZShwaWVjZXM6IGNnLlBpZWNlcyk6IGNnLkZFTiB7XG4gIHJldHVybiBpbnZSYW5rcy5tYXAoeSA9PiBjZy5yYW5rcy5tYXAoeCA9PiB7XG4gICAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1twb3Mya2V5KFt4LCB5XSldO1xuICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgIGNvbnN0IGxldHRlciA9IGxldHRlcnNbcGllY2Uucm9sZV07XG4gICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3doaXRlJyA/IGxldHRlci50b1VwcGVyQ2FzZSgpIDogbGV0dGVyO1xuICAgICAgfSBlbHNlIHJldHVybiAnMSc7XG4gICAgfSkuam9pbignJylcbiAgKS5qb2luKCcvJykucmVwbGFjZSgvMXsyLH0vZywgcyA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cbiIsImltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxudHlwZSBNb2JpbGl0eSA9ICh4MTpudW1iZXIsIHkxOm51bWJlciwgeDI6bnVtYmVyLCB5MjpudW1iZXIpID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIGRpZmYoYTogbnVtYmVyLCBiOm51bWJlcik6bnVtYmVyIHtcbiAgcmV0dXJuIE1hdGguYWJzKGEgLSBiKTtcbn1cblxuZnVuY3Rpb24gcGF3bihjb2xvcjogY2cuQ29sb3IpOiBNb2JpbGl0eSB7XG4gIHJldHVybiAoeDEsIHkxLCB4MiwgeTIpID0+IGRpZmYoeDEsIHgyKSA8IDIgJiYgKFxuICAgIGNvbG9yID09PSAnd2hpdGUnID8gKFxuICAgICAgLy8gYWxsb3cgMiBzcXVhcmVzIGZyb20gMSBhbmQgOCwgZm9yIGhvcmRlXG4gICAgICB5MiA9PT0geTEgKyAxIHx8ICh5MSA8PSAyICYmIHkyID09PSAoeTEgKyAyKSAmJiB4MSA9PT0geDIpXG4gICAgKSA6IChcbiAgICAgIHkyID09PSB5MSAtIDEgfHwgKHkxID49IDcgJiYgeTIgPT09ICh5MSAtIDIpICYmIHgxID09PSB4MilcbiAgICApXG4gICk7XG59XG5cbmNvbnN0IGtuaWdodDogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgY29uc3QgeGQgPSBkaWZmKHgxLCB4Mik7XG4gIGNvbnN0IHlkID0gZGlmZih5MSwgeTIpO1xuICByZXR1cm4gKHhkID09PSAxICYmIHlkID09PSAyKSB8fCAoeGQgPT09IDIgJiYgeWQgPT09IDEpO1xufVxuXG5jb25zdCBiaXNob3A6IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIHJldHVybiBkaWZmKHgxLCB4MikgPT09IGRpZmYoeTEsIHkyKTtcbn1cblxuY29uc3Qgcm9vazogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgcmV0dXJuIHgxID09PSB4MiB8fCB5MSA9PT0geTI7XG59XG5cbmNvbnN0IHF1ZWVuOiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICByZXR1cm4gYmlzaG9wKHgxLCB5MSwgeDIsIHkyKSB8fCByb29rKHgxLCB5MSwgeDIsIHkyKTtcbn1cblxuZnVuY3Rpb24ga2luZyhjb2xvcjogY2cuQ29sb3IsIHJvb2tGaWxlczogbnVtYmVyW10sIGNhbkNhc3RsZTogYm9vbGVhbik6IE1vYmlsaXR5IHtcbiAgcmV0dXJuICh4MSwgeTEsIHgyLCB5MikgID0+IChcbiAgICBkaWZmKHgxLCB4MikgPCAyICYmIGRpZmYoeTEsIHkyKSA8IDJcbiAgKSB8fCAoXG4gICAgY2FuQ2FzdGxlICYmIHkxID09PSB5MiAmJiB5MSA9PT0gKGNvbG9yID09PSAnd2hpdGUnID8gMSA6IDgpICYmIChcbiAgICAgICh4MSA9PT0gNSAmJiAoKHV0aWwuY29udGFpbnNYKHJvb2tGaWxlcywgMSkgJiYgeDIgPT09IDMpIHx8ICh1dGlsLmNvbnRhaW5zWChyb29rRmlsZXMsIDgpICYmIHgyID09PSA3KSkpIHx8XG4gICAgICB1dGlsLmNvbnRhaW5zWChyb29rRmlsZXMsIHgyKVxuICAgIClcbiAgKTtcbn1cblxuZnVuY3Rpb24gcm9va0ZpbGVzT2YocGllY2VzOiBjZy5QaWVjZXMsIGNvbG9yOiBjZy5Db2xvcikge1xuICBjb25zdCBiYWNrcmFuayA9IGNvbG9yID09ICd3aGl0ZScgPyAnMScgOiAnOCc7XG4gIHJldHVybiBPYmplY3Qua2V5cyhwaWVjZXMpLmZpbHRlcihrZXkgPT4ge1xuICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW2tleV07XG4gICAgcmV0dXJuIGtleVsxXSA9PT0gYmFja3JhbmsgJiYgcGllY2UgJiYgcGllY2UuY29sb3IgPT09IGNvbG9yICYmIHBpZWNlLnJvbGUgPT09ICdyb29rJztcbiAgfSkubWFwKChrZXk6IHN0cmluZyApID0+IHV0aWwua2V5MnBvcyhrZXkgYXMgY2cuS2V5KVswXSk7XG59XG5cbmNvbnN0IGFsbFBvcyA9IHV0aWwuYWxsS2V5cy5tYXAodXRpbC5rZXkycG9zKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJlbW92ZShwaWVjZXM6IGNnLlBpZWNlcywga2V5OiBjZy5LZXksIGNhbkNhc3RsZTogYm9vbGVhbik6IGNnLktleVtdIHtcbiAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XSEsXG4gICAgcG9zID0gdXRpbC5rZXkycG9zKGtleSksXG4gICAgciA9IHBpZWNlLnJvbGUsXG4gICAgbW9iaWxpdHk6IE1vYmlsaXR5ID0gciA9PT0gJ3Bhd24nID8gcGF3bihwaWVjZS5jb2xvcikgOiAoXG4gICAgICByID09PSAna25pZ2h0JyA/IGtuaWdodCA6IChcbiAgICAgICAgciA9PT0gJ2Jpc2hvcCcgPyBiaXNob3AgOiAoXG4gICAgICAgICAgciA9PT0gJ3Jvb2snID8gcm9vayA6IChcbiAgICAgICAgICAgIHIgPT09ICdxdWVlbicgPyBxdWVlbiA6IGtpbmcocGllY2UuY29sb3IsIHJvb2tGaWxlc09mKHBpZWNlcywgcGllY2UuY29sb3IpLCBjYW5DYXN0bGUpXG4gICAgICAgICAgKSkpKTtcbiAgcmV0dXJuIGFsbFBvcy5maWx0ZXIocG9zMiA9PlxuICAgIChwb3NbMF0gIT09IHBvczJbMF0gfHwgcG9zWzFdICE9PSBwb3MyWzFdKSAmJiBtb2JpbGl0eShwb3NbMF0sIHBvc1sxXSwgcG9zMlswXSwgcG9zMlsxXSlcbiAgKS5tYXAodXRpbC5wb3Mya2V5KTtcbn07XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBrZXkycG9zLCBjcmVhdGVFbCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IHdoaXRlUG92IH0gZnJvbSAnLi9ib2FyZCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQsIEFuaW1WZWN0b3JzLCBBbmltVmVjdG9yLCBBbmltRmFkaW5ncyB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuLy8gYCRjb2xvciAkcm9sZWBcbnR5cGUgUGllY2VOYW1lID0gc3RyaW5nO1xuXG5pbnRlcmZhY2UgU2FtZVBpZWNlcyB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfVxuaW50ZXJmYWNlIFNhbWVTcXVhcmVzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9XG5pbnRlcmZhY2UgTW92ZWRQaWVjZXMgeyBbcGllY2VOYW1lOiBzdHJpbmddOiBjZy5QaWVjZU5vZGVbXSB9XG5pbnRlcmZhY2UgTW92ZWRTcXVhcmVzIHsgW2NsYXNzTmFtZTogc3RyaW5nXTogY2cuU3F1YXJlTm9kZVtdIH1cbmludGVyZmFjZSBTcXVhcmVDbGFzc2VzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH1cblxuLy8gcG9ydGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3ZlbG9jZS9saWNob2JpbGUvYmxvYi9tYXN0ZXIvc3JjL2pzL2NoZXNzZ3JvdW5kL3ZpZXcuanNcbi8vIGluIGNhc2Ugb2YgYnVncywgYmxhbWUgQHZlbG9jZVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGFzV2hpdGU6IGJvb2xlYW4gPSB3aGl0ZVBvdihzKSxcbiAgcG9zVG9UcmFuc2xhdGUgPSBzLmRvbS5yZWxhdGl2ZSA/IHV0aWwucG9zVG9UcmFuc2xhdGVSZWwgOiB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZG9tLmJvdW5kcygpKSxcbiAgdHJhbnNsYXRlID0gcy5kb20ucmVsYXRpdmUgPyB1dGlsLnRyYW5zbGF0ZVJlbCA6IHV0aWwudHJhbnNsYXRlQWJzLFxuICBib2FyZEVsOiBIVE1MRWxlbWVudCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBwaWVjZXM6IGNnLlBpZWNlcyA9IHMucGllY2VzLFxuICBjdXJBbmltOiBBbmltQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuYW5pbWF0aW9uLmN1cnJlbnQsXG4gIGFuaW1zOiBBbmltVmVjdG9ycyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uYW5pbXMgOiB7fSxcbiAgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiB7fSxcbiAgY3VyRHJhZzogRHJhZ0N1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmRyYWdnYWJsZS5jdXJyZW50LFxuICBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyksXG4gIHNhbWVQaWVjZXM6IFNhbWVQaWVjZXMgPSB7fSxcbiAgc2FtZVNxdWFyZXM6IFNhbWVTcXVhcmVzID0ge30sXG4gIG1vdmVkUGllY2VzOiBNb3ZlZFBpZWNlcyA9IHt9LFxuICBtb3ZlZFNxdWFyZXM6IE1vdmVkU3F1YXJlcyA9IHt9LFxuICBwaWVjZXNLZXlzOiBjZy5LZXlbXSA9IE9iamVjdC5rZXlzKHBpZWNlcykgYXMgY2cuS2V5W107XG4gIGxldCBrOiBjZy5LZXksXG4gIHA6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICBlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSxcbiAgcGllY2VBdEtleTogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIGVsUGllY2VOYW1lOiBQaWVjZU5hbWUsXG4gIGFuaW06IEFuaW1WZWN0b3IgfCB1bmRlZmluZWQsXG4gIGZhZGluZzogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIHBNdmRzZXQ6IGNnLlBpZWNlTm9kZVtdLFxuICBwTXZkOiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQsXG4gIHNNdmRzZXQ6IGNnLlNxdWFyZU5vZGVbXSxcbiAgc012ZDogY2cuU3F1YXJlTm9kZSB8IHVuZGVmaW5lZDtcblxuICAvLyB3YWxrIG92ZXIgYWxsIGJvYXJkIGRvbSBlbGVtZW50cywgYXBwbHkgYW5pbWF0aW9ucyBhbmQgZmxhZyBtb3ZlZCBwaWVjZXNcbiAgZWwgPSBib2FyZEVsLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZTtcbiAgd2hpbGUgKGVsKSB7XG4gICAgayA9IGVsLmNnS2V5O1xuICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXNba107XG4gICAgICBhbmltID0gYW5pbXNba107XG4gICAgICBmYWRpbmcgPSBmYWRpbmdzW2tdO1xuICAgICAgZWxQaWVjZU5hbWUgPSBlbC5jZ1BpZWNlO1xuICAgICAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgcmVtb3ZlIGRyYWdnaW5nIHN0eWxlXG4gICAgICBpZiAoZWwuY2dEcmFnZ2luZyAmJiAoIWN1ckRyYWcgfHwgY3VyRHJhZy5vcmlnICE9PSBrKSkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnZ2luZycpO1xuICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzV2hpdGUpKTtcbiAgICAgICAgZWwuY2dEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICBpZiAoIWZhZGluZyAmJiBlbC5jZ0ZhZGluZykge1xuICAgICAgICBlbC5jZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZXJlIGlzIG5vdyBhIHBpZWNlIGF0IHRoaXMgZG9tIGtleVxuICAgICAgaWYgKHBpZWNlQXRLZXkpIHtcbiAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlXG4gICAgICAgIC8vIChvdGhlcndpc2UgaXQgY291bGQgYW5pbWF0ZSBhIGNhcHR1cmVkIHBpZWNlKVxuICAgICAgICBpZiAoYW5pbSAmJiBlbC5jZ0FuaW1hdGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkpIHtcbiAgICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmNnQW5pbWF0aW5nKSB7XG4gICAgICAgICAgZWwuY2dBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1doaXRlKSk7XG4gICAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIGVsLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChrZXkycG9zKGspLCBhc1doaXRlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIHBpZWNlOiBmbGFnIGFzIHNhbWVcbiAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuY2dGYWRpbmcpKSB7XG4gICAgICAgICAgc2FtZVBpZWNlc1trXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlmZmVyZW50IHBpZWNlOiBmbGFnIGFzIG1vdmVkIHVubGVzcyBpdCBpcyBhIGZhZGluZyBwaWVjZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFkaW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihmYWRpbmcpKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmYWRpbmcnKTtcbiAgICAgICAgICAgIGVsLmNnRmFkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSkgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdLnB1c2goZWwpO1xuICAgICAgICAgICAgZWxzZSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0gPSBbZWxdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2U6IGZsYWcgYXMgbW92ZWRcbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAobW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdKSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0ucHVzaChlbCk7XG4gICAgICAgIGVsc2UgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdID0gW2VsXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTcXVhcmVOb2RlKGVsKSkge1xuICAgICAgY29uc3QgY24gPSBlbC5jbGFzc05hbWU7XG4gICAgICBpZiAoc3F1YXJlc1trXSA9PT0gY24pIHNhbWVTcXVhcmVzW2tdID0gdHJ1ZTtcbiAgICAgIGVsc2UgaWYgKG1vdmVkU3F1YXJlc1tjbl0pIG1vdmVkU3F1YXJlc1tjbl0ucHVzaChlbCk7XG4gICAgICBlbHNlIG1vdmVkU3F1YXJlc1tjbl0gPSBbZWxdO1xuICAgIH1cbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGU7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHNxdWFyZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHNxdWFyZXNcbiAgLy8gb3IgYXBwZW5kIG5ldyBzcXVhcmVzXG4gIGZvciAoY29uc3Qgc2sgaW4gc3F1YXJlcykge1xuICAgIGlmICghc2FtZVNxdWFyZXNbc2tdKSB7XG4gICAgICBzTXZkc2V0ID0gbW92ZWRTcXVhcmVzW3NxdWFyZXNbc2tdXTtcbiAgICAgIHNNdmQgPSBzTXZkc2V0ICYmIHNNdmRzZXQucG9wKCk7XG4gICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHBvc1RvVHJhbnNsYXRlKGtleTJwb3Moc2sgYXMgY2cuS2V5KSwgYXNXaGl0ZSk7XG4gICAgICBpZiAoc012ZCkge1xuICAgICAgICBzTXZkLmNnS2V5ID0gc2sgYXMgY2cuS2V5O1xuICAgICAgICB0cmFuc2xhdGUoc012ZCwgdHJhbnNsYXRpb24pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHNxdWFyZU5vZGUgPSBjcmVhdGVFbCgnc3F1YXJlJywgc3F1YXJlc1tza10pIGFzIGNnLlNxdWFyZU5vZGU7XG4gICAgICAgIHNxdWFyZU5vZGUuY2dLZXkgPSBzayBhcyBjZy5LZXk7XG4gICAgICAgIHRyYW5zbGF0ZShzcXVhcmVOb2RlLCB0cmFuc2xhdGlvbik7XG4gICAgICAgIGJvYXJkRWwuaW5zZXJ0QmVmb3JlKHNxdWFyZU5vZGUsIGJvYXJkRWwuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAvLyBvciBhcHBlbmQgbmV3IHBpZWNlc1xuICBmb3IgKGNvbnN0IGogaW4gcGllY2VzS2V5cykge1xuICAgIGsgPSBwaWVjZXNLZXlzW2pdO1xuICAgIHAgPSBwaWVjZXNba10hO1xuICAgIGFuaW0gPSBhbmltc1trXTtcbiAgICBpZiAoIXNhbWVQaWVjZXNba10pIHtcbiAgICAgIHBNdmRzZXQgPSBtb3ZlZFBpZWNlc1twaWVjZU5hbWVPZihwKV07XG4gICAgICBwTXZkID0gcE12ZHNldCAmJiBwTXZkc2V0LnBvcCgpO1xuICAgICAgLy8gYSBzYW1lIHBpZWNlIHdhcyBtb3ZlZFxuICAgICAgaWYgKHBNdmQpIHtcbiAgICAgICAgLy8gYXBwbHkgZG9tIGNoYW5nZXNcbiAgICAgICAgcE12ZC5jZ0tleSA9IGs7XG4gICAgICAgIGlmIChwTXZkLmNnRmFkaW5nKSB7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgICAgICBwTXZkLmNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIHBNdmQuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KHBvcywgYXNXaGl0ZSk7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcE12ZC5jZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlKHBNdmQsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2UgaW4gbW92ZWQgb2JqOiBpbnNlcnQgdGhlIG5ldyBwaWVjZVxuICAgICAgLy8gYXNzdW1lcyB0aGUgbmV3IHBpZWNlIGlzIG5vdCBiZWluZyBkcmFnZ2VkXG4gICAgICBlbHNlIHtcblxuICAgICAgICBjb25zdCBwaWVjZU5hbWUgPSBwaWVjZU5hbWVPZihwKSxcbiAgICAgICAgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lKSBhcyBjZy5QaWVjZU5vZGUsXG4gICAgICAgIHBvcyA9IGtleTJwb3Moayk7XG5cbiAgICAgICAgcGllY2VOb2RlLmNnUGllY2UgPSBwaWVjZU5hbWU7XG4gICAgICAgIHBpZWNlTm9kZS5jZ0tleSA9IGs7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcGllY2VOb2RlLmNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGUocGllY2VOb2RlLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcblxuICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgcGllY2VOb2RlLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChwb3MsIGFzV2hpdGUpO1xuXG4gICAgICAgIGJvYXJkRWwuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgYW55IGVsZW1lbnQgdGhhdCByZW1haW5zIGluIHRoZSBtb3ZlZCBzZXRzXG4gIGZvciAoY29uc3QgaSBpbiBtb3ZlZFBpZWNlcykgcmVtb3ZlTm9kZXMocywgbW92ZWRQaWVjZXNbaV0pO1xuICBmb3IgKGNvbnN0IGkgaW4gbW92ZWRTcXVhcmVzKSByZW1vdmVOb2RlcyhzLCBtb3ZlZFNxdWFyZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBpc1BpZWNlTm9kZShlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSk6IGVsIGlzIGNnLlBpZWNlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnUElFQ0UnO1xufVxuZnVuY3Rpb24gaXNTcXVhcmVOb2RlKGVsOiBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlKTogZWwgaXMgY2cuU3F1YXJlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU1FVQVJFJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZXMoczogU3RhdGUsIG5vZGVzOiBIVE1MRWxlbWVudFtdKTogdm9pZCB7XG4gIGZvciAoY29uc3QgaSBpbiBub2Rlcykgcy5kb20uZWxlbWVudHMuYm9hcmQucmVtb3ZlQ2hpbGQobm9kZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBwb3NaSW5kZXgocG9zOiBjZy5Qb3MsIGFzV2hpdGU6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBsZXQgeiA9IDIgKyAocG9zWzFdIC0gMSkgKiA4ICsgKDggLSBwb3NbMF0pO1xuICBpZiAoYXNXaGl0ZSkgeiA9IDY3IC0gejtcbiAgcmV0dXJuIHogKyAnJztcbn1cblxuZnVuY3Rpb24gcGllY2VOYW1lT2YocGllY2U6IGNnLlBpZWNlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNsYXNzZXMoczogU3RhdGUpOiBTcXVhcmVDbGFzc2VzIHtcbiAgY29uc3Qgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IHt9O1xuICBsZXQgaTogYW55LCBrOiBjZy5LZXk7XG4gIGlmIChzLmxhc3RNb3ZlICYmIHMuaGlnaGxpZ2h0Lmxhc3RNb3ZlKSBmb3IgKGkgaW4gcy5sYXN0TW92ZSkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLmxhc3RNb3ZlW2ldLCAnbGFzdC1tb3ZlJyk7XG4gIH1cbiAgaWYgKHMuY2hlY2sgJiYgcy5oaWdobGlnaHQuY2hlY2spIGFkZFNxdWFyZShzcXVhcmVzLCBzLmNoZWNrLCAnY2hlY2snKTtcbiAgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XG4gICAgaWYgKHMubW92YWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5tb3ZhYmxlLmRlc3RzICYmIHMubW92YWJsZS5kZXN0c1tzLnNlbGVjdGVkXTtcbiAgICAgIGlmIChkZXN0cykgZm9yIChpIGluIGRlc3RzKSB7XG4gICAgICAgIGsgPSBkZXN0c1tpXTtcbiAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdtb3ZlLWRlc3QnICsgKHMucGllY2VzW2tdID8gJyBvYycgOiAnJykpO1xuICAgICAgfVxuICAgICAgY29uc3QgcERlc3RzID0gcy5wcmVtb3ZhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cykgZm9yIChpIGluIHBEZXN0cykge1xuICAgICAgICBrID0gcERlc3RzW2ldO1xuICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ3ByZW1vdmUtZGVzdCcgKyAocy5waWVjZXNba10gPyAnIG9jJyA6ICcnKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHByZW1vdmUgPSBzLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKHByZW1vdmUpIGZvciAoaSBpbiBwcmVtb3ZlKSBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZVtpXSwgJ2N1cnJlbnQtcHJlbW92ZScpO1xuICBlbHNlIGlmIChzLnByZWRyb3BwYWJsZS5jdXJyZW50KSBhZGRTcXVhcmUoc3F1YXJlcywgcy5wcmVkcm9wcGFibGUuY3VycmVudC5rZXksICdjdXJyZW50LXByZW1vdmUnKTtcblxuICBjb25zdCBvID0gcy5leHBsb2Rpbmc7XG4gIGlmIChvKSBmb3IgKGkgaW4gby5rZXlzKSBhZGRTcXVhcmUoc3F1YXJlcywgby5rZXlzW2ldLCAnZXhwbG9kaW5nJyArIG8uc3RhZ2UpO1xuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBjZy5LZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKHNxdWFyZXNba2V5XSkgc3F1YXJlc1trZXldICs9ICcgJyArIGtsYXNzO1xuICBlbHNlIHNxdWFyZXNba2V5XSA9IGtsYXNzO1xufVxuIiwiaW1wb3J0ICogYXMgZmVuIGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQgfSBmcm9tICcuL2FuaW0nXG5pbXBvcnQgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZydcbmltcG9ydCB7IERyYXdhYmxlIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0IHsgdGltZXIgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSB7XG4gIHBpZWNlczogY2cuUGllY2VzO1xuICBvcmllbnRhdGlvbjogY2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiB3aGl0ZSB8IGJsYWNrXG4gIHR1cm5Db2xvcjogY2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gd2hpdGUgfCBibGFja1xuICBjaGVjaz86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBpbiBjaGVjayBcImEyXCJcbiAgbGFzdE1vdmU/OiBjZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgW1wiYzNcIjsgXCJjNFwiXVxuICBzZWxlY3RlZD86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcImExXCJcbiAgY29vcmRpbmF0ZXM6IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgYXV0b0Nhc3RsZTogYm9vbGVhbjsgLy8gaW1tZWRpYXRlbHkgY29tcGxldGUgdGhlIGNhc3RsZSBieSBtb3ZpbmcgdGhlIHJvb2sgYWZ0ZXIga2luZyBtb3ZlXG4gIHZpZXdPbmx5OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBkaXNhYmxlQ29udGV4dE1lbnU6IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgY2hlc3Nib2FyZFxuICByZXNpemFibGU6IGJvb2xlYW47IC8vIGxpc3RlbnMgdG8gY2hlc3Nncm91bmQucmVzaXplIG9uIGRvY3VtZW50LmJvZHkgdG8gY2xlYXIgYm91bmRzIGNhY2hlXG4gIGFkZFBpZWNlWkluZGV4OiBib29sZWFuOyAvLyBhZGRzIHotaW5kZXggdmFsdWVzIHRvIHBpZWNlcyAoZm9yIDNEKVxuICBwaWVjZUtleTogYm9vbGVhbjsgLy8gYWRkIGEgZGF0YS1rZXkgYXR0cmlidXRlIHRvIHBpZWNlIGVsZW1lbnRzXG4gIGhpZ2hsaWdodDoge1xuICAgIGxhc3RNb3ZlOiBib29sZWFuOyAvLyBhZGQgbGFzdC1tb3ZlIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjazogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICBkdXJhdGlvbjogbnVtYmVyO1xuICAgIGN1cnJlbnQ/OiBBbmltQ3VycmVudDtcbiAgfTtcbiAgbW92YWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBjb2xvcj86IGNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlLiB3aGl0ZSB8IGJsYWNrIHwgYm90aFxuICAgIGRlc3RzPzogY2cuRGVzdHM7IC8vIHZhbGlkIG1vdmVzLiB7XCJhMlwiIFtcImEzXCIgXCJhNFwiXSBcImIxXCIgW1wiYTNcIiBcImMzXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIG1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgICAgYWZ0ZXJOZXdQaWVjZT86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIGEgbmV3IHBpZWNlIGlzIGRyb3BwZWQgb24gdGhlIGJvYXJkXG4gICAgfTtcbiAgICByb29rQ2FzdGxlOiBib29sZWFuIC8vIGNhc3RsZSBieSBtb3ZpbmcgdGhlIGtpbmcgdG8gdGhlIHJvb2tcbiAgfTtcbiAgcHJlbW92YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZW1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgY2FzdGxlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFsbG93IGtpbmcgY2FzdGxlIHByZW1vdmVzXG4gICAgZGVzdHM/OiBjZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiBjZy5LZXlQYWlyOyAvLyBrZXlzIG9mIHRoZSBjdXJyZW50IHNhdmVkIHByZW1vdmUgW1wiZTJcIiBcImU0XCJdXG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhPzogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7ICAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIHByZWRyb3BwYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIGN1cnJlbnQ/OiB7IC8vIGN1cnJlbnQgc2F2ZWQgcHJlZHJvcCB7cm9sZTogJ2tuaWdodCc7IGtleTogJ2U0J31cbiAgICAgIHJvbGU6IGNnLlJvbGU7XG4gICAgICBrZXk6IGNnLktleVxuICAgIH07XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBkcmFnZ2FibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlOiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U6IGJvb2xlYW47IC8vIGxldHMgY2hlc3Nncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIGNlbnRlclBpZWNlOiBib29sZWFuOyAvLyBjZW50ZXIgdGhlIHBpZWNlIG9uIGN1cnNvciBhdCBkcmFnIHN0YXJ0XG4gICAgc2hvd0dob3N0OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBkZWxldGVPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkXG4gICAgY3VycmVudD86IERyYWdDdXJyZW50O1xuICB9O1xuICBkcm9wbW9kZToge1xuICAgIGFjdGl2ZTogYm9vbGVhbjtcbiAgICBwaWVjZT86IGNnLlBpZWNlO1xuICB9XG4gIHNlbGVjdGFibGU6IHtcbiAgICAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZW5hYmxlZDogYm9vbGVhblxuICB9O1xuICBzdGF0czoge1xuICAgIC8vIHdhcyBsYXN0IHBpZWNlIGRyYWdnZWQgb3IgY2xpY2tlZD9cbiAgICAvLyBuZWVkcyBkZWZhdWx0IHRvIGZhbHNlIGZvciB0b3VjaFxuICAgIGRyYWdnZWQ6IGJvb2xlYW4sXG4gICAgY3RybEtleT86IGJvb2xlYW5cbiAgfTtcbiAgZXZlbnRzOiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgYSBwaWVjZSBoYXMgYmVlbiBtb3ZlZC5cbiAgICAvLyBjYXB0dXJlZFBpZWNlIGlzIHVuZGVmaW5lZCBvciBsaWtlIHtjb2xvcjogJ3doaXRlJzsgJ3JvbGUnOiAncXVlZW4nfVxuICAgIG1vdmU/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIGNhcHR1cmVkUGllY2U/OiBjZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wTmV3UGllY2U/OiAocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSkgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBjZy5LZXkpID0+IHZvaWQgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICBpbnNlcnQ/OiAoZWxlbWVudHM6IGNnLkVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlOiBEcmF3YWJsZSxcbiAgZXhwbG9kaW5nPzogY2cuRXhwbG9kaW5nO1xuICBkb206IGNnLkRvbSxcbiAgaG9sZDogY2cuVGltZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKCk6IFBhcnRpYWw8U3RhdGU+IHtcbiAgcmV0dXJuIHtcbiAgICBwaWVjZXM6IGZlbi5yZWFkKGZlbi5pbml0aWFsKSxcbiAgICBvcmllbnRhdGlvbjogJ3doaXRlJyxcbiAgICB0dXJuQ29sb3I6ICd3aGl0ZScsXG4gICAgY29vcmRpbmF0ZXM6IHRydWUsXG4gICAgYXV0b0Nhc3RsZTogdHJ1ZSxcbiAgICB2aWV3T25seTogZmFsc2UsXG4gICAgZGlzYWJsZUNvbnRleHRNZW51OiBmYWxzZSxcbiAgICByZXNpemFibGU6IHRydWUsXG4gICAgYWRkUGllY2VaSW5kZXg6IGZhbHNlLFxuICAgIHBpZWNlS2V5OiBmYWxzZSxcbiAgICBoaWdobGlnaHQ6IHtcbiAgICAgIGxhc3RNb3ZlOiB0cnVlLFxuICAgICAgY2hlY2s6IHRydWVcbiAgICB9LFxuICAgIGFuaW1hdGlvbjoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGR1cmF0aW9uOiAyMDBcbiAgICB9LFxuICAgIG1vdmFibGU6IHtcbiAgICAgIGZyZWU6IHRydWUsXG4gICAgICBjb2xvcjogJ2JvdGgnLFxuICAgICAgc2hvd0Rlc3RzOiB0cnVlLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIHJvb2tDYXN0bGU6IHRydWVcbiAgICB9LFxuICAgIHByZW1vdmFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBjYXN0bGU6IHRydWUsXG4gICAgICBldmVudHM6IHt9XG4gICAgfSxcbiAgICBwcmVkcm9wcGFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgZXZlbnRzOiB7fVxuICAgIH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZGlzdGFuY2U6IDMsXG4gICAgICBhdXRvRGlzdGFuY2U6IHRydWUsXG4gICAgICBjZW50ZXJQaWVjZTogdHJ1ZSxcbiAgICAgIHNob3dHaG9zdDogdHJ1ZSxcbiAgICAgIGRlbGV0ZU9uRHJvcE9mZjogZmFsc2VcbiAgICB9LFxuICAgIGRyb3Btb2RlOiB7XG4gICAgICBhY3RpdmU6IGZhbHNlXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlXG4gICAgfSxcbiAgICBzdGF0czoge1xuICAgICAgLy8gb24gdG91Y2hzY3JlZW4sIGRlZmF1bHQgdG8gXCJ0YXAtdGFwXCIgbW92ZXNcbiAgICAgIC8vIGluc3RlYWQgb2YgZHJhZ1xuICAgICAgZHJhZ2dlZDogISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpXG4gICAgfSxcbiAgICBldmVudHM6IHt9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLCAvLyBjYW4gZHJhd1xuICAgICAgdmlzaWJsZTogdHJ1ZSwgLy8gY2FuIHZpZXdcbiAgICAgIGVyYXNlT25DbGljazogdHJ1ZSxcbiAgICAgIHNoYXBlczogW10sXG4gICAgICBhdXRvU2hhcGVzOiBbXSxcbiAgICAgIGJydXNoZXM6IHtcbiAgICAgICAgZ3JlZW46IHsga2V5OiAnZycsIGNvbG9yOiAnIzE1NzgxQicsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgcmVkOiB7IGtleTogJ3InLCBjb2xvcjogJyM4ODIwMjAnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIGJsdWU6IHsga2V5OiAnYicsIGNvbG9yOiAnIzAwMzA4OCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgeWVsbG93OiB7IGtleTogJ3knLCBjb2xvcjogJyNlNjhmMDAnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIHBhbGVCbHVlOiB7IGtleTogJ3BiJywgY29sb3I6ICcjMDAzMDg4Jywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVHcmVlbjogeyBrZXk6ICdwZycsIGNvbG9yOiAnIzE1NzgxQicsIG9wYWNpdHk6IDAuNCwgbGluZVdpZHRoOiAxNSB9LFxuICAgICAgICBwYWxlUmVkOiB7IGtleTogJ3ByJywgY29sb3I6ICcjODgyMDIwJywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVHcmV5OiB7IGtleTogJ3BncicsIGNvbG9yOiAnIzRhNGE0YScsIG9wYWNpdHk6IDAuMzUsIGxpbmVXaWR0aDogMTUgfVxuICAgICAgfSxcbiAgICAgIHBpZWNlczoge1xuICAgICAgICBiYXNlVXJsOiAnaHR0cHM6Ly9saWNoZXNzMS5vcmcvYXNzZXRzL3BpZWNlL2NidXJuZXR0LydcbiAgICAgIH0sXG4gICAgICBwcmV2U3ZnSGFzaDogJydcbiAgICB9LFxuICAgIGhvbGQ6IHRpbWVyKClcbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGtleTJwb3MgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBEcmF3YWJsZSwgRHJhd1NoYXBlLCBEcmF3U2hhcGVQaWVjZSwgRHJhd0JydXNoLCBEcmF3QnJ1c2hlcywgRHJhd01vZGlmaWVycyB9IGZyb20gJy4vZHJhdydcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IFNWR0VsZW1lbnQge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ05hbWUpO1xufVxuXG5pbnRlcmZhY2UgU2hhcGUge1xuICBzaGFwZTogRHJhd1NoYXBlO1xuICBjdXJyZW50OiBib29sZWFuO1xuICBoYXNoOiBIYXNoO1xufVxuXG5pbnRlcmZhY2UgQ3VzdG9tQnJ1c2hlcyB7XG4gIFtoYXNoOiBzdHJpbmddOiBEcmF3QnJ1c2hcbn1cblxuaW50ZXJmYWNlIEFycm93RGVzdHMge1xuICBba2V5OiBzdHJpbmddOiBudW1iZXI7IC8vIGhvdyBtYW55IGFycm93cyBsYW5kIG9uIGEgc3F1YXJlXG59XG5cbnR5cGUgSGFzaCA9IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN2ZyhzdGF0ZTogU3RhdGUsIHJvb3Q6IFNWR0VsZW1lbnQpOiB2b2lkIHtcblxuICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGUsXG4gIGN1ckQgPSBkLmN1cnJlbnQsXG4gIGN1ciA9IGN1ckQgJiYgY3VyRC5tb3VzZVNxID8gY3VyRCBhcyBEcmF3U2hhcGUgOiB1bmRlZmluZWQsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMgPSB7fTtcblxuICBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5jb25jYXQoY3VyID8gW2N1cl0gOiBbXSkuZm9yRWFjaChzID0+IHtcbiAgICBpZiAocy5kZXN0KSBhcnJvd0Rlc3RzW3MuZGVzdF0gPSAoYXJyb3dEZXN0c1tzLmRlc3RdIHx8IDApICsgMTtcbiAgfSk7XG5cbiAgY29uc3Qgc2hhcGVzOiBTaGFwZVtdID0gZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykubWFwKChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBjdXJyZW50OiBmYWxzZSxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSlcbiAgICB9O1xuICB9KTtcbiAgaWYgKGN1cikgc2hhcGVzLnB1c2goe1xuICAgIHNoYXBlOiBjdXIsXG4gICAgY3VycmVudDogdHJ1ZSxcbiAgICBoYXNoOiBzaGFwZUhhc2goY3VyLCBhcnJvd0Rlc3RzLCB0cnVlKVxuICB9KTtcblxuICBjb25zdCBmdWxsSGFzaCA9IHNoYXBlcy5tYXAoc2MgPT4gc2MuaGFzaCkuam9pbignJyk7XG4gIGlmIChmdWxsSGFzaCA9PT0gc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2gpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSBmdWxsSGFzaDtcblxuICBjb25zdCBkZWZzRWwgPSByb290LmZpcnN0Q2hpbGQgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhkLCBzaGFwZXMsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoc3RhdGUsIHNoYXBlcywgZC5icnVzaGVzLCBhcnJvd0Rlc3RzLCByb290LCBkZWZzRWwpO1xufVxuXG4vLyBhcHBlbmQgb25seS4gRG9uJ3QgdHJ5IHRvIHVwZGF0ZS9yZW1vdmUuXG5mdW5jdGlvbiBzeW5jRGVmcyhkOiBEcmF3YWJsZSwgc2hhcGVzOiBTaGFwZVtdLCBkZWZzRWw6IFNWR0VsZW1lbnQpIHtcbiAgY29uc3QgYnJ1c2hlczogQ3VzdG9tQnJ1c2hlcyA9IHt9O1xuICBsZXQgYnJ1c2g6IERyYXdCcnVzaDtcbiAgc2hhcGVzLmZvckVhY2gocyA9PiB7XG4gICAgaWYgKHMuc2hhcGUuZGVzdCkge1xuICAgICAgYnJ1c2ggPSBkLmJydXNoZXNbcy5zaGFwZS5icnVzaF07XG4gICAgICBpZiAocy5zaGFwZS5tb2RpZmllcnMpIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzLnNoYXBlLm1vZGlmaWVycyk7XG4gICAgICBicnVzaGVzW2JydXNoLmtleV0gPSBicnVzaDtcbiAgICB9XG4gIH0pO1xuICBjb25zdCBrZXlzSW5Eb206IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgPSBkZWZzRWwuZmlyc3RDaGlsZCBhcyBTVkdFbGVtZW50O1xuICB3aGlsZShlbCkge1xuICAgIGtleXNJbkRvbVtlbC5nZXRBdHRyaWJ1dGUoJ2NnS2V5JykgYXMgc3RyaW5nXSA9IHRydWU7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBTVkdFbGVtZW50O1xuICB9XG4gIGZvciAobGV0IGtleSBpbiBicnVzaGVzKSB7XG4gICAgaWYgKCFrZXlzSW5Eb21ba2V5XSkgZGVmc0VsLmFwcGVuZENoaWxkKHJlbmRlck1hcmtlcihicnVzaGVzW2tleV0pKTtcbiAgfVxufVxuXG4vLyBhcHBlbmQgYW5kIHJlbW92ZSBvbmx5LiBObyB1cGRhdGVzLlxuZnVuY3Rpb24gc3luY1NoYXBlcyhzdGF0ZTogU3RhdGUsIHNoYXBlczogU2hhcGVbXSwgYnJ1c2hlczogRHJhd0JydXNoZXMsIGFycm93RGVzdHM6IEFycm93RGVzdHMsIHJvb3Q6IFNWR0VsZW1lbnQsIGRlZnNFbDogU1ZHRWxlbWVudCk6IHZvaWQge1xuICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzKCksXG4gIGhhc2hlc0luRG9tOiB7W2hhc2g6IHN0cmluZ106IGJvb2xlYW59ID0ge30sXG4gIHRvUmVtb3ZlOiBTVkdFbGVtZW50W10gPSBbXTtcbiAgc2hhcGVzLmZvckVhY2goc2MgPT4geyBoYXNoZXNJbkRvbVtzYy5oYXNoXSA9IGZhbHNlOyB9KTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50ID0gZGVmc0VsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQsIGVsSGFzaDogSGFzaDtcbiAgd2hpbGUoZWwpIHtcbiAgICBlbEhhc2ggPSBlbC5nZXRBdHRyaWJ1dGUoJ2NnSGFzaCcpIGFzIEhhc2g7XG4gICAgLy8gZm91bmQgYSBzaGFwZSBlbGVtZW50IHRoYXQncyBoZXJlIHRvIHN0YXlcbiAgICBpZiAoaGFzaGVzSW5Eb20uaGFzT3duUHJvcGVydHkoZWxIYXNoKSkgaGFzaGVzSW5Eb21bZWxIYXNoXSA9IHRydWU7XG4gICAgLy8gb3IgcmVtb3ZlIGl0XG4gICAgZWxzZSB0b1JlbW92ZS5wdXNoKGVsKTtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgdG9SZW1vdmUuZm9yRWFjaChlbCA9PiByb290LnJlbW92ZUNoaWxkKGVsKSk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgc2hhcGVzLmZvckVhY2goc2MgPT4ge1xuICAgIGlmICghaGFzaGVzSW5Eb21bc2MuaGFzaF0pIHJvb3QuYXBwZW5kQ2hpbGQocmVuZGVyU2hhcGUoc3RhdGUsIHNjLCBicnVzaGVzLCBhcnJvd0Rlc3RzLCBib3VuZHMpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNoYXBlSGFzaCh7b3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBtb2RpZmllcnN9OiBEcmF3U2hhcGUsIGFycm93RGVzdHM6IEFycm93RGVzdHMsIGN1cnJlbnQ6IGJvb2xlYW4pOiBIYXNoIHtcbiAgcmV0dXJuIFtjdXJyZW50LCBvcmlnLCBkZXN0LCBicnVzaCwgZGVzdCAmJiBhcnJvd0Rlc3RzW2Rlc3RdID4gMSxcbiAgICBwaWVjZSAmJiBwaWVjZUhhc2gocGllY2UpLFxuICAgIG1vZGlmaWVycyAmJiBtb2RpZmllcnNIYXNoKG1vZGlmaWVycylcbiAgXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gcGllY2VIYXNoKHBpZWNlOiBEcmF3U2hhcGVQaWVjZSk6IEhhc2gge1xuICByZXR1cm4gW3BpZWNlLmNvbG9yLCBwaWVjZS5yb2xlLCBwaWVjZS5zY2FsZV0uZmlsdGVyKHggPT4geCkuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIG1vZGlmaWVyc0hhc2gobTogRHJhd01vZGlmaWVycyk6IEhhc2gge1xuICByZXR1cm4gJycgKyAobS5saW5lV2lkdGggfHwgJycpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTaGFwZShzdGF0ZTogU3RhdGUsIHtzaGFwZSwgY3VycmVudCwgaGFzaH06IFNoYXBlLCBicnVzaGVzOiBEcmF3QnJ1c2hlcywgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGxldCBlbDogU1ZHRWxlbWVudDtcbiAgaWYgKHNoYXBlLnBpZWNlKSBlbCA9IHJlbmRlclBpZWNlKFxuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlcy5iYXNlVXJsLFxuICAgIG9yaWVudChrZXkycG9zKHNoYXBlLm9yaWcpLCBzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgc2hhcGUucGllY2UsXG4gICAgYm91bmRzKTtcbiAgZWxzZSB7XG4gICAgY29uc3Qgb3JpZyA9IG9yaWVudChrZXkycG9zKHNoYXBlLm9yaWcpLCBzdGF0ZS5vcmllbnRhdGlvbik7XG4gICAgaWYgKHNoYXBlLm9yaWcgJiYgc2hhcGUuZGVzdCkge1xuICAgICAgbGV0IGJydXNoOiBEcmF3QnJ1c2ggPSBicnVzaGVzW3NoYXBlLmJydXNoXTtcbiAgICAgIGlmIChzaGFwZS5tb2RpZmllcnMpIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzaGFwZS5tb2RpZmllcnMpO1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIG9yaWVudChrZXkycG9zKHNoYXBlLmRlc3QpLCBzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIGN1cnJlbnQsXG4gICAgICAgIGFycm93RGVzdHNbc2hhcGUuZGVzdF0gPiAxLFxuICAgICAgICBib3VuZHMpO1xuICAgIH1cbiAgICBlbHNlIGVsID0gcmVuZGVyQ2lyY2xlKGJydXNoZXNbc2hhcGUuYnJ1c2hdLCBvcmlnLCBjdXJyZW50LCBib3VuZHMpO1xuICB9XG4gIGVsLnNldEF0dHJpYnV0ZSgnY2dIYXNoJywgaGFzaCk7XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2lyY2xlKGJydXNoOiBEcmF3QnJ1c2gsIHBvczogY2cuUG9zLCBjdXJyZW50OiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvczJweChwb3MsIGJvdW5kcyksXG4gIHdpZHRocyA9IGNpcmNsZVdpZHRoKGJvdW5kcyksXG4gIHJhZGl1cyA9IChib3VuZHMud2lkdGggKyBib3VuZHMuaGVpZ2h0KSAvIDMyO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdjaXJjbGUnKSwge1xuICAgIHN0cm9rZTogYnJ1c2guY29sb3IsXG4gICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBvcGFjaXR5OiBvcGFjaXR5KGJydXNoLCBjdXJyZW50KSxcbiAgICBjeDogb1swXSxcbiAgICBjeTogb1sxXSxcbiAgICByOiByYWRpdXMgLSB3aWR0aHNbMV0gLyAyXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBcnJvdyhicnVzaDogRHJhd0JydXNoLCBvcmlnOiBjZy5Qb3MsIGRlc3Q6IGNnLlBvcywgY3VycmVudDogYm9vbGVhbiwgc2hvcnRlbjogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG0gPSBhcnJvd01hcmdpbihib3VuZHMsIHNob3J0ZW4gJiYgIWN1cnJlbnQpLFxuICBhID0gcG9zMnB4KG9yaWcsIGJvdW5kcyksXG4gIGIgPSBwb3MycHgoZGVzdCwgYm91bmRzKSxcbiAgZHggPSBiWzBdIC0gYVswXSxcbiAgZHkgPSBiWzFdIC0gYVsxXSxcbiAgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCksXG4gIHhvID0gTWF0aC5jb3MoYW5nbGUpICogbSxcbiAgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdsaW5lJyksIHtcbiAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICdzdHJva2Utd2lkdGgnOiBsaW5lV2lkdGgoYnJ1c2gsIGN1cnJlbnQsIGJvdW5kcyksXG4gICAgJ3N0cm9rZS1saW5lY2FwJzogJ3JvdW5kJyxcbiAgICAnbWFya2VyLWVuZCc6ICd1cmwoI2Fycm93aGVhZC0nICsgYnJ1c2gua2V5ICsgJyknLFxuICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5b1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUGllY2UoYmFzZVVybDogc3RyaW5nLCBwb3M6IGNnLlBvcywgcGllY2U6IERyYXdTaGFwZVBpZWNlLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvczJweChwb3MsIGJvdW5kcyksXG4gIHNpemUgPSBib3VuZHMud2lkdGggLyA4ICogKHBpZWNlLnNjYWxlIHx8IDEpLFxuICBuYW1lID0gcGllY2UuY29sb3JbMF0gKyAocGllY2Uucm9sZSA9PT0gJ2tuaWdodCcgPyAnbicgOiBwaWVjZS5yb2xlWzBdKS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdpbWFnZScpLCB7XG4gICAgY2xhc3NOYW1lOiBgJHtwaWVjZS5yb2xlfSAke3BpZWNlLmNvbG9yfWAsXG4gICAgeDogb1swXSAtIHNpemUgLyAyLFxuICAgIHk6IG9bMV0gLSBzaXplIC8gMixcbiAgICB3aWR0aDogc2l6ZSxcbiAgICBoZWlnaHQ6IHNpemUsXG4gICAgaHJlZjogYmFzZVVybCArIG5hbWUgKyAnLnN2ZydcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlcihicnVzaDogRHJhd0JydXNoKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG1hcmtlciA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnbWFya2VyJyksIHtcbiAgICBpZDogJ2Fycm93aGVhZC0nICsgYnJ1c2gua2V5LFxuICAgIG9yaWVudDogJ2F1dG8nLFxuICAgIG1hcmtlcldpZHRoOiA0LFxuICAgIG1hcmtlckhlaWdodDogOCxcbiAgICByZWZYOiAyLjA1LFxuICAgIHJlZlk6IDIuMDFcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ3BhdGgnKSwge1xuICAgIGQ6ICdNMCwwIFY0IEwzLDIgWicsXG4gICAgZmlsbDogYnJ1c2guY29sb3JcbiAgfSkpO1xuICBtYXJrZXIuc2V0QXR0cmlidXRlKCdjZ0tleScsIGJydXNoLmtleSk7XG4gIHJldHVybiBtYXJrZXI7XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWw6IFNWR0VsZW1lbnQsIGF0dHJzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogU1ZHRWxlbWVudCB7XG4gIGZvciAobGV0IGtleSBpbiBhdHRycykgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gb3JpZW50KHBvczogY2cuUG9zLCBjb2xvcjogY2cuQ29sb3IpOiBjZy5Qb3Mge1xuICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyBwb3MgOiBbOSAtIHBvc1swXSwgOSAtIHBvc1sxXV07XG59XG5cbmZ1bmN0aW9uIG1ha2VDdXN0b21CcnVzaChiYXNlOiBEcmF3QnJ1c2gsIG1vZGlmaWVyczogRHJhd01vZGlmaWVycyk6IERyYXdCcnVzaCB7XG4gIGNvbnN0IGJydXNoOiBQYXJ0aWFsPERyYXdCcnVzaD4gPSB7XG4gICAgY29sb3I6IGJhc2UuY29sb3IsXG4gICAgb3BhY2l0eTogTWF0aC5yb3VuZChiYXNlLm9wYWNpdHkgKiAxMCkgLyAxMCxcbiAgICBsaW5lV2lkdGg6IE1hdGgucm91bmQobW9kaWZpZXJzLmxpbmVXaWR0aCB8fCBiYXNlLmxpbmVXaWR0aClcbiAgfTtcbiAgYnJ1c2gua2V5ID0gW2Jhc2Uua2V5LCBtb2RpZmllcnMubGluZVdpZHRoXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbiAgcmV0dXJuIGJydXNoIGFzIERyYXdCcnVzaDtcbn1cblxuZnVuY3Rpb24gY2lyY2xlV2lkdGgoYm91bmRzOiBDbGllbnRSZWN0KTogW251bWJlciwgbnVtYmVyXSB7XG4gIGNvbnN0IGJhc2UgPSBib3VuZHMud2lkdGggLyA1MTI7XG4gIHJldHVybiBbMyAqIGJhc2UsIDQgKiBiYXNlXTtcbn1cblxuZnVuY3Rpb24gbGluZVdpZHRoKGJydXNoOiBEcmF3QnJ1c2gsIGN1cnJlbnQ6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IG51bWJlciB7XG4gIHJldHVybiAoYnJ1c2gubGluZVdpZHRoIHx8IDEwKSAqIChjdXJyZW50ID8gMC44NSA6IDEpIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBvcGFjaXR5KGJydXNoOiBEcmF3QnJ1c2gsIGN1cnJlbnQ6IGJvb2xlYW4pOiBudW1iZXIge1xuICByZXR1cm4gKGJydXNoLm9wYWNpdHkgfHwgMSkgKiAoY3VycmVudCA/IDAuOSA6IDEpO1xufVxuXG5mdW5jdGlvbiBhcnJvd01hcmdpbihib3VuZHM6IENsaWVudFJlY3QsIHNob3J0ZW46IGJvb2xlYW4pOiBudW1iZXIge1xuICByZXR1cm4gKHNob3J0ZW4gPyAyMCA6IDEwKSAvIDUxMiAqIGJvdW5kcy53aWR0aDtcbn1cblxuZnVuY3Rpb24gcG9zMnB4KHBvczogY2cuUG9zLCBib3VuZHM6IENsaWVudFJlY3QpOiBjZy5OdW1iZXJQYWlyIHtcbiAgcmV0dXJuIFsocG9zWzBdIC0gMC41KSAqIGJvdW5kcy53aWR0aCAvIDgsICg4LjUgLSBwb3NbMV0pICogYm91bmRzLmhlaWdodCAvIDhdO1xufVxuIiwiZXhwb3J0IHR5cGUgQ29sb3IgPSAnd2hpdGUnIHwgJ2JsYWNrJztcbmV4cG9ydCB0eXBlIFJvbGUgPSAna2luZycgfCAncXVlZW4nIHwgJ3Jvb2snIHwgJ2Jpc2hvcCcgfCAna25pZ2h0JyB8ICdwYXduJztcbmV4cG9ydCB0eXBlIEtleSA9ICdhMCcgfCAnYTEnIHwgJ2IxJyB8ICdjMScgfCAnZDEnIHwgJ2UxJyB8ICdmMScgfCAnZzEnIHwgJ2gxJyB8ICdhMicgfCAnYjInIHwgJ2MyJyB8ICdkMicgfCAnZTInIHwgJ2YyJyB8ICdnMicgfCAnaDInIHwgJ2EzJyB8ICdiMycgfCAnYzMnIHwgJ2QzJyB8ICdlMycgfCAnZjMnIHwgJ2czJyB8ICdoMycgfCAnYTQnIHwgJ2I0JyB8ICdjNCcgfCAnZDQnIHwgJ2U0JyB8ICdmNCcgfCAnZzQnIHwgJ2g0JyB8ICdhNScgfCAnYjUnIHwgJ2M1JyB8ICdkNScgfCAnZTUnIHwgJ2Y1JyB8ICdnNScgfCAnaDUnIHwgJ2E2JyB8ICdiNicgfCAnYzYnIHwgJ2Q2JyB8ICdlNicgfCAnZjYnIHwgJ2c2JyB8ICdoNicgfCAnYTcnIHwgJ2I3JyB8ICdjNycgfCAnZDcnIHwgJ2U3JyB8ICdmNycgfCAnZzcnIHwgJ2g3JyB8ICdhOCcgfCAnYjgnIHwgJ2M4JyB8ICdkOCcgfCAnZTgnIHwgJ2Y4JyB8ICdnOCcgfCAnaDgnO1xuZXhwb3J0IHR5cGUgRmlsZSA9ICdhJyB8ICdiJyB8ICdjJyB8ICdkJyB8ICdlJyB8ICdmJyB8ICdnJyB8ICdoJztcbmV4cG9ydCB0eXBlIFJhbmsgPSAxIHwgMiB8IDMgfCA0IHwgNSB8IDYgfCA3IHwgODtcbmV4cG9ydCB0eXBlIEZFTiA9IHN0cmluZztcbmV4cG9ydCB0eXBlIFBvcyA9IFtudW1iZXIsIG51bWJlcl07XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlIHtcbiAgcm9sZTogUm9sZTtcbiAgY29sb3I6IENvbG9yO1xuICBwcm9tb3RlZD86IGJvb2xlYW47XG59XG5leHBvcnQgaW50ZXJmYWNlIERyb3Age1xuICByb2xlOiBSb2xlO1xuICBrZXk6IEtleTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VzIHtcbiAgW2tleTogc3RyaW5nXTogUGllY2UgfCB1bmRlZmluZWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlc0RpZmYge1xuICBba2V5OiBzdHJpbmddOiBQaWVjZSB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IHR5cGUgS2V5UGFpciA9IFtLZXksIEtleV07XG5cbmV4cG9ydCB0eXBlIE51bWJlclBhaXIgPSBbbnVtYmVyLCBudW1iZXJdO1xuXG5leHBvcnQgdHlwZSBOdW1iZXJRdWFkID0gW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVzdHMge1xuICBba2V5OiBzdHJpbmddOiBLZXlbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRzIHtcbiAgYm9hcmQ6IEhUTUxFbGVtZW50O1xuICBjb250YWluZXI6IEhUTUxFbGVtZW50O1xuICBnaG9zdD86IEhUTUxFbGVtZW50O1xuICBzdmc/OiBTVkdFbGVtZW50O1xufVxuZXhwb3J0IGludGVyZmFjZSBEb20ge1xuICBlbGVtZW50czogRWxlbWVudHMsXG4gIGJvdW5kczogTWVtbzxDbGllbnRSZWN0PjtcbiAgcmVkcmF3OiAoKSA9PiB2b2lkO1xuICByZWRyYXdOb3c6IChza2lwU3ZnPzogYm9vbGVhbikgPT4gdm9pZDtcbiAgdW5iaW5kPzogVW5iaW5kO1xuICBkZXN0cm95ZWQ/OiBib29sZWFuO1xuICByZWxhdGl2ZT86IGJvb2xlYW47IC8vIGRvbid0IGNvbXB1dGUgYm91bmRzLCB1c2UgcmVsYXRpdmUgJSB0byBwbGFjZSBwaWVjZXNcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRXhwbG9kaW5nIHtcbiAgc3RhZ2U6IG51bWJlcjtcbiAga2V5czogS2V5W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW92ZU1ldGFkYXRhIHtcbiAgcHJlbW92ZTogYm9vbGVhbjtcbiAgY3RybEtleT86IGJvb2xlYW47XG4gIGhvbGRUaW1lPzogbnVtYmVyO1xuICBjYXB0dXJlZD86IFBpZWNlO1xuICBwcmVkcm9wPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU2V0UHJlbW92ZU1ldGFkYXRhIHtcbiAgY3RybEtleT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIFdpbmRvd0V2ZW50ID0gJ29uc2Nyb2xsJyB8ICdvbnJlc2l6ZSc7XG5cbmV4cG9ydCB0eXBlIE1vdWNoRXZlbnQgPSBNb3VzZUV2ZW50ICYgVG91Y2hFdmVudDtcblxuZXhwb3J0IGludGVyZmFjZSBLZXllZE5vZGUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNnS2V5OiBLZXk7XG59XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlTm9kZSBleHRlbmRzIEtleWVkTm9kZSB7XG4gIGNnUGllY2U6IHN0cmluZztcbiAgY2dBbmltYXRpbmc/OiBib29sZWFuO1xuICBjZ0ZhZGluZz86IGJvb2xlYW47XG4gIGNnRHJhZ2dpbmc/OiBib29sZWFuO1xufVxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVOb2RlIGV4dGVuZHMgS2V5ZWROb2RlIHsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIE1lbW88QT4geyAoKTogQTsgY2xlYXI6ICgpID0+IHZvaWQ7IH1cblxuZXhwb3J0IGludGVyZmFjZSBUaW1lciB7XG4gIHN0YXJ0OiAoKSA9PiB2b2lkO1xuICBjYW5jZWw6ICgpID0+IHZvaWQ7XG4gIHN0b3A6ICgpID0+IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgUmVkcmF3ID0gKCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIFVuYmluZCA9ICgpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBNaWxsaXNlY29uZHMgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBLSHogPSBudW1iZXI7XG5cbmV4cG9ydCBjb25zdCBmaWxlczogRmlsZVtdID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnXTtcbmV4cG9ydCBjb25zdCByYW5rczogUmFua1tdID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdO1xuIiwiaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBjb25zdCBjb2xvcnM6IGNnLkNvbG9yW10gPSBbJ3doaXRlJywgJ2JsYWNrJ107XG5cbmV4cG9ydCBjb25zdCBpbnZSYW5rczogY2cuUmFua1tdID0gWzgsIDcsIDYsIDUsIDQsIDMsIDIsIDFdO1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogY2cuS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KC4uLmNnLmZpbGVzLm1hcChjID0+IGNnLnJhbmtzLm1hcChyID0+IGMrcikpKTtcblxuZXhwb3J0IGNvbnN0IHBvczJrZXkgPSAocG9zOiBjZy5Qb3MpID0+IGFsbEtleXNbOCAqIHBvc1swXSArIHBvc1sxXSAtIDldO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBjZy5LZXkpID0+IFtrLmNoYXJDb2RlQXQoMCkgLSA5Niwgay5jaGFyQ29kZUF0KDEpIC0gNDhdIGFzIGNnLlBvcztcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IGNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0OiBhbnkgPSAoKSA9PiB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkgdiA9IGYoKTtcbiAgICByZXR1cm4gdjtcbiAgfTtcbiAgcmV0LmNsZWFyID0gKCkgPT4geyB2ID0gdW5kZWZpbmVkIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBjb25zdCB0aW1lcjogKCkgPT4gY2cuVGltZXIgPSAoKSA9PiB7XG4gIGxldCBzdGFydEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIHJldHVybiB7XG4gICAgc3RhcnQoKSB7IHN0YXJ0QXQgPSBwZXJmb3JtYW5jZS5ub3coKSB9LFxuICAgIGNhbmNlbCgpIHsgc3RhcnRBdCA9IHVuZGVmaW5lZCB9LFxuICAgIHN0b3AoKSB7XG4gICAgICBpZiAoIXN0YXJ0QXQpIHJldHVybiAwO1xuICAgICAgY29uc3QgdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRBdDtcbiAgICAgIHN0YXJ0QXQgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGltZTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBvcHBvc2l0ZSA9IChjOiBjZy5Db2xvcikgPT4gYyA9PT0gJ3doaXRlJyA/ICdibGFjaycgOiAnd2hpdGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNYPFg+KHhzOiBYW10gfCB1bmRlZmluZWQsIHg6IFgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHhzICE9PSB1bmRlZmluZWQgJiYgeHMuaW5kZXhPZih4KSAhPT0gLTE7XG59XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxOiAocG9zMTogY2cuUG9zLCBwb3MyOiBjZy5Qb3MpID0+IG51bWJlciA9IChwb3MxLCBwb3MyKSA9PiB7XG4gIHJldHVybiBNYXRoLnBvdyhwb3MxWzBdIC0gcG9zMlswXSwgMikgKyBNYXRoLnBvdyhwb3MxWzFdIC0gcG9zMlsxXSwgMik7XG59XG5cbmV4cG9ydCBjb25zdCBzYW1lUGllY2U6IChwMTogY2cuUGllY2UsIHAyOiBjZy5QaWVjZSkgPT4gYm9vbGVhbiA9IChwMSwgcDIpID0+XG4gIHAxLnJvbGUgPT09IHAyLnJvbGUgJiYgcDEuY29sb3IgPT09IHAyLmNvbG9yO1xuXG5jb25zdCBwb3NUb1RyYW5zbGF0ZUJhc2U6IChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbiwgeEZhY3RvcjogbnVtYmVyLCB5RmFjdG9yOiBudW1iZXIpID0+IGNnLk51bWJlclBhaXIgPVxuKHBvcywgYXNXaGl0ZSwgeEZhY3RvciwgeUZhY3RvcikgPT4gW1xuICAoYXNXaGl0ZSA/IHBvc1swXSAtIDEgOiA4IC0gcG9zWzBdKSAqIHhGYWN0b3IsXG4gIChhc1doaXRlID8gOCAtIHBvc1sxXSA6IHBvc1sxXSAtIDEpICogeUZhY3RvclxuXTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlQWJzID0gKGJvdW5kczogQ2xpZW50UmVjdCkgPT4ge1xuICBjb25zdCB4RmFjdG9yID0gYm91bmRzLndpZHRoIC8gOCxcbiAgeUZhY3RvciA9IGJvdW5kcy5oZWlnaHQgLyA4O1xuICByZXR1cm4gKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBhc1doaXRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbDogKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBjZy5OdW1iZXJQYWlyID1cbiAgKHBvcywgYXNXaGl0ZSkgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgYXNXaGl0ZSwgMTAwLCAxMDApO1xuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlQWJzID0gKGVsOiBIVE1MRWxlbWVudCwgcG9zOiBjZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb3NbMF19cHgsJHtwb3NbMV19cHgpYDtcbn1cblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChlbDogSFRNTEVsZW1lbnQsIHBlcmNlbnRzOiBjZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwZXJjZW50c1swXX0lLCR7cGVyY2VudHNbMV19JSlgO1xufVxuXG5leHBvcnQgY29uc3Qgc2V0VmlzaWJsZSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pID0+IHtcbiAgZWwuc3R5bGUudmlzaWJpbGl0eSA9IHYgPyAndmlzaWJsZScgOiAnaGlkZGVuJztcbn1cblxuLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb246IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiBjZy5OdW1iZXJQYWlyIHwgdW5kZWZpbmVkID0gZSA9PiB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXNbMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogTW91c2VFdmVudCkgPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIHJldHVybiBlbDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGNvbG9ycywgc2V0VmlzaWJsZSwgY3JlYXRlRWwgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBmaWxlcywgcmFua3MgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgY3JlYXRlRWxlbWVudCBhcyBjcmVhdGVTVkcgfSBmcm9tICcuL3N2ZydcbmltcG9ydCB7IEVsZW1lbnRzIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd3JhcChlbGVtZW50OiBIVE1MRWxlbWVudCwgczogU3RhdGUsIHJlbGF0aXZlOiBib29sZWFuKTogRWxlbWVudHMge1xuXG4gIC8vIC5jZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBDaGVzc2dyb3VuZClcbiAgLy8gICBjZy1oZWxwZXIgKDEyLjUlKVxuICAvLyAgICAgY2ctY29udGFpbmVyICg4MDAlKVxuICAvLyAgICAgICBjZy1ib2FyZFxuICAvLyAgICAgICBzdmdcbiAgLy8gICAgICAgY29vcmRzLnJhbmtzXG4gIC8vICAgICAgIGNvb3Jkcy5maWxlc1xuICAvLyAgICAgICBwaWVjZS5naG9zdFxuXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG5cbiAgLy8gZW5zdXJlIHRoZSBjZy13cmFwIGNsYXNzIGlzIHNldFxuICAvLyBzbyBib3VuZHMgY2FsY3VsYXRpb24gY2FuIHVzZSB0aGUgQ1NTIHdpZHRoL2hlaWdodCB2YWx1ZXNcbiAgLy8gYWRkIHRoYXQgY2xhc3MgeW91cnNlbGYgdG8gdGhlIGVsZW1lbnQgYmVmb3JlIGNhbGxpbmcgY2hlc3Nncm91bmRcbiAgLy8gZm9yIGEgc2xpZ2h0IHBlcmZvcm1hbmNlIGltcHJvdmVtZW50ISAoYXZvaWRzIHJlY29tcHV0aW5nIHN0eWxlKVxuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NnLXdyYXAnKTtcblxuICBjb2xvcnMuZm9yRWFjaChjID0+IGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnb3JpZW50YXRpb24tJyArIGMsIHMub3JpZW50YXRpb24gPT09IGMpKTtcbiAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICBjb25zdCBoZWxwZXIgPSBjcmVhdGVFbCgnY2ctaGVscGVyJyk7XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaGVscGVyKTtcbiAgY29uc3QgY29udGFpbmVyID0gY3JlYXRlRWwoJ2NnLWNvbnRhaW5lcicpO1xuICBoZWxwZXIuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdjZy1ib2FyZCcpO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBzdmc6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUgJiYgIXJlbGF0aXZlKSB7XG4gICAgc3ZnID0gY3JlYXRlU1ZHKCdzdmcnKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHKCdkZWZzJykpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzdmcpO1xuICB9XG5cbiAgaWYgKHMuY29vcmRpbmF0ZXMpIHtcbiAgICBjb25zdCBvcmllbnRDbGFzcyA9IHMub3JpZW50YXRpb24gPT09ICdibGFjaycgPyAnIGJsYWNrJyA6ICcnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMocmFua3MsICdyYW5rcycgKyBvcmllbnRDbGFzcykpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcykpO1xuICB9XG5cbiAgbGV0IGdob3N0OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuZHJhZ2dhYmxlLnNob3dHaG9zdCAmJiAhcmVsYXRpdmUpIHtcbiAgICBnaG9zdCA9IGNyZWF0ZUVsKCdwaWVjZScsICdnaG9zdCcpO1xuICAgIHNldFZpc2libGUoZ2hvc3QsIGZhbHNlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2hvc3QpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZCxcbiAgICBjb250YWluZXIsXG4gICAgZ2hvc3QsXG4gICAgc3ZnXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNvb3JkcyhlbGVtczogYW55W10sIGNsYXNzTmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsKCdjb29yZHMnLCBjbGFzc05hbWUpO1xuICBsZXQgZjogSFRNTEVsZW1lbnQ7XG4gIGZvciAobGV0IGkgaW4gZWxlbXMpIHtcbiAgICBmID0gY3JlYXRlRWwoJ2Nvb3JkJyk7XG4gICAgZi50ZXh0Q29udGVudCA9IGVsZW1zW2ldO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdXRpbF8xID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbmNvbnN0IHNxdWFyZVNldF8xID0gcmVxdWlyZShcIi4vc3F1YXJlU2V0XCIpO1xuZnVuY3Rpb24gY29tcHV0ZVJhbmdlKHNxdWFyZSwgZGVsdGFzLCBzdGVwcGVyKSB7XG4gICAgbGV0IHJhbmdlID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgZm9yIChjb25zdCBkZWx0YSBvZiBkZWx0YXMpIHtcbiAgICAgICAgZm9yIChsZXQgc3EgPSBzcXVhcmUgKyBkZWx0YTsgMCA8PSBzcSAmJiBzcSA8IDY0ICYmIHV0aWxfMS5zcXVhcmVEaXN0KHNxLCBzcSAtIGRlbHRhKSA8PSAyOyBzcSArPSBkZWx0YSkge1xuICAgICAgICAgICAgcmFuZ2UgPSByYW5nZS53aXRoKHNxKTtcbiAgICAgICAgICAgIGlmIChzdGVwcGVyKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByYW5nZTtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVUYWJsZShkZWx0YXMsIHN0ZXBwZXIpIHtcbiAgICBjb25zdCB0YWJsZSA9IFtdO1xuICAgIGZvciAobGV0IHNxdWFyZSA9IDA7IHNxdWFyZSA8IDY0OyBzcXVhcmUrKykge1xuICAgICAgICB0YWJsZVtzcXVhcmVdID0gY29tcHV0ZVJhbmdlKHNxdWFyZSwgZGVsdGFzLCBzdGVwcGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xufVxuY29uc3QgS0lOR19BVFRBQ0tTID0gY29tcHV0ZVRhYmxlKFstOSwgLTgsIC03LCAtMSwgMSwgNywgOCwgOV0sIHRydWUpO1xuY29uc3QgS05JR0hUX0FUVEFDS1MgPSBjb21wdXRlVGFibGUoWy0xNywgLTE1LCAtMTAsIC02LCA2LCAxMCwgMTUsIDE3XSwgdHJ1ZSk7XG5jb25zdCBQQVdOX0FUVEFDS1MgPSB7XG4gICAgd2hpdGU6IGNvbXB1dGVUYWJsZShbNywgOV0sIHRydWUpLFxuICAgIGJsYWNrOiBjb21wdXRlVGFibGUoWy03LCAtOV0sIHRydWUpLFxufTtcbmZ1bmN0aW9uIGtpbmdBdHRhY2tzKHNxdWFyZSkge1xuICAgIHJldHVybiBLSU5HX0FUVEFDS1Nbc3F1YXJlXTtcbn1cbmV4cG9ydHMua2luZ0F0dGFja3MgPSBraW5nQXR0YWNrcztcbmZ1bmN0aW9uIGtuaWdodEF0dGFja3Moc3F1YXJlKSB7XG4gICAgcmV0dXJuIEtOSUdIVF9BVFRBQ0tTW3NxdWFyZV07XG59XG5leHBvcnRzLmtuaWdodEF0dGFja3MgPSBrbmlnaHRBdHRhY2tzO1xuZnVuY3Rpb24gcGF3bkF0dGFja3MoY29sb3IsIHNxdWFyZSkge1xuICAgIHJldHVybiBQQVdOX0FUVEFDS1NbY29sb3JdW3NxdWFyZV07XG59XG5leHBvcnRzLnBhd25BdHRhY2tzID0gcGF3bkF0dGFja3M7XG5jb25zdCBGSUxFX1JBTkdFID0gY29tcHV0ZVRhYmxlKFstOCwgOF0sIGZhbHNlKTtcbmNvbnN0IFJBTktfUkFOR0UgPSBjb21wdXRlVGFibGUoWy0xLCAxXSwgZmFsc2UpO1xuY29uc3QgRElBR19SQU5HRSA9IGNvbXB1dGVUYWJsZShbLTksIDldLCBmYWxzZSk7XG5jb25zdCBBTlRJX0RJQUdfUkFOR0UgPSBjb21wdXRlVGFibGUoWy03LCA3XSwgZmFsc2UpO1xuZnVuY3Rpb24gaHlwZXJib2xhKGJpdCwgcmFuZ2UsIG9jY3VwaWVkKSB7XG4gICAgbGV0IGZvcndhcmQgPSBvY2N1cGllZC5pbnRlcnNlY3QocmFuZ2UpO1xuICAgIGxldCByZXZlcnNlID0gZm9yd2FyZC5ic3dhcDY0KCk7IC8vIEFzc3VtZXMgbm8gbW9yZSB0aGFuIDEgYml0IHBlciByYW5rXG4gICAgZm9yd2FyZCA9IGZvcndhcmQubWludXM2NChiaXQpO1xuICAgIHJldmVyc2UgPSByZXZlcnNlLm1pbnVzNjQoYml0LmJzd2FwNjQoKSk7XG4gICAgZm9yd2FyZCA9IGZvcndhcmQueG9yKHJldmVyc2UuYnN3YXA2NCgpKTtcbiAgICByZXR1cm4gZm9yd2FyZC5pbnRlcnNlY3QocmFuZ2UpO1xufVxuZnVuY3Rpb24gZmlsZUF0dGFja3Moc3F1YXJlLCBvY2N1cGllZCkge1xuICAgIHJldHVybiBoeXBlcmJvbGEoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoc3F1YXJlKSwgRklMRV9SQU5HRVtzcXVhcmVdLCBvY2N1cGllZCk7XG59XG5mdW5jdGlvbiByYW5rQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKSB7XG4gICAgY29uc3QgcmFuZ2UgPSBSQU5LX1JBTkdFW3NxdWFyZV07XG4gICAgbGV0IGZvcndhcmQgPSBvY2N1cGllZC5pbnRlcnNlY3QocmFuZ2UpO1xuICAgIGxldCByZXZlcnNlID0gZm9yd2FyZC5yYml0NjQoKTtcbiAgICBmb3J3YXJkID0gZm9yd2FyZC5taW51czY0KHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKHNxdWFyZSkpO1xuICAgIHJldmVyc2UgPSByZXZlcnNlLm1pbnVzNjQoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoNjMgLSBzcXVhcmUpKTtcbiAgICBmb3J3YXJkID0gZm9yd2FyZC54b3IocmV2ZXJzZS5yYml0NjQoKSk7XG4gICAgcmV0dXJuIGZvcndhcmQuaW50ZXJzZWN0KHJhbmdlKTtcbn1cbmZ1bmN0aW9uIGRpYWdBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpIHtcbiAgICByZXR1cm4gaHlwZXJib2xhKHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKHNxdWFyZSksIERJQUdfUkFOR0Vbc3F1YXJlXSwgb2NjdXBpZWQpO1xufVxuZnVuY3Rpb24gYW50aURpYWdBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpIHtcbiAgICByZXR1cm4gaHlwZXJib2xhKHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKHNxdWFyZSksIEFOVElfRElBR19SQU5HRVtzcXVhcmVdLCBvY2N1cGllZCk7XG59XG5mdW5jdGlvbiBiaXNob3BBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpIHtcbiAgICBjb25zdCBiaXQgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShzcXVhcmUpO1xuICAgIHJldHVybiBoeXBlcmJvbGEoYml0LCBESUFHX1JBTkdFW3NxdWFyZV0sIG9jY3VwaWVkKS54b3IoaHlwZXJib2xhKGJpdCwgQU5USV9ESUFHX1JBTkdFW3NxdWFyZV0sIG9jY3VwaWVkKSk7XG59XG5leHBvcnRzLmJpc2hvcEF0dGFja3MgPSBiaXNob3BBdHRhY2tzO1xuZnVuY3Rpb24gcm9va0F0dGFja3Moc3F1YXJlLCBvY2N1cGllZCkge1xuICAgIHJldHVybiBmaWxlQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKS54b3IocmFua0F0dGFja3Moc3F1YXJlLCBvY2N1cGllZCkpO1xufVxuZXhwb3J0cy5yb29rQXR0YWNrcyA9IHJvb2tBdHRhY2tzO1xuZnVuY3Rpb24gcXVlZW5BdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpIHtcbiAgICByZXR1cm4gYmlzaG9wQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKS54b3Iocm9va0F0dGFja3Moc3F1YXJlLCBvY2N1cGllZCkpO1xufVxuZXhwb3J0cy5xdWVlbkF0dGFja3MgPSBxdWVlbkF0dGFja3M7XG5mdW5jdGlvbiBhdHRhY2tzKHBpZWNlLCBzcXVhcmUsIG9jY3VwaWVkKSB7XG4gICAgc3dpdGNoIChwaWVjZS5yb2xlKSB7XG4gICAgICAgIGNhc2UgJ3Bhd24nOiByZXR1cm4gcGF3bkF0dGFja3MocGllY2UuY29sb3IsIHNxdWFyZSk7XG4gICAgICAgIGNhc2UgJ2tuaWdodCc6IHJldHVybiBrbmlnaHRBdHRhY2tzKHNxdWFyZSk7XG4gICAgICAgIGNhc2UgJ2Jpc2hvcCc6IHJldHVybiBiaXNob3BBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpO1xuICAgICAgICBjYXNlICdyb29rJzogcmV0dXJuIHJvb2tBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpO1xuICAgICAgICBjYXNlICdxdWVlbic6IHJldHVybiBxdWVlbkF0dGFja3Moc3F1YXJlLCBvY2N1cGllZCk7XG4gICAgICAgIGNhc2UgJ2tpbmcnOiByZXR1cm4ga2luZ0F0dGFja3Moc3F1YXJlKTtcbiAgICB9XG59XG5leHBvcnRzLmF0dGFja3MgPSBhdHRhY2tzO1xuZnVuY3Rpb24gcmF5VGFibGVzKCkge1xuICAgIGNvbnN0IHJheSA9IFtdO1xuICAgIGNvbnN0IGJldHdlZW4gPSBbXTtcbiAgICBjb25zdCB6ZXJvID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgZm9yIChsZXQgYSA9IDA7IGEgPCA2NDsgYSsrKSB7XG4gICAgICAgIHJheVthXSA9IFtdO1xuICAgICAgICBiZXR3ZWVuW2FdID0gW107XG4gICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgNjQ7IGIrKykge1xuICAgICAgICAgICAgcmF5W2FdW2JdID0gemVybztcbiAgICAgICAgICAgIGJldHdlZW5bYV1bYl0gPSB6ZXJvO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgYiBvZiBESUFHX1JBTkdFW2FdKSB7XG4gICAgICAgICAgICByYXlbYV1bYl0gPSBESUFHX1JBTkdFW2FdLndpdGgoYSk7XG4gICAgICAgICAgICBiZXR3ZWVuW2FdW2JdID0gZGlhZ0F0dGFja3MoYSwgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoYikpLmludGVyc2VjdChkaWFnQXR0YWNrcyhiLCBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShhKSkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgYiBvZiBBTlRJX0RJQUdfUkFOR0VbYV0pIHtcbiAgICAgICAgICAgIHJheVthXVtiXSA9IEFOVElfRElBR19SQU5HRVthXS53aXRoKGEpO1xuICAgICAgICAgICAgYmV0d2VlblthXVtiXSA9IGFudGlEaWFnQXR0YWNrcyhhLCBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShiKSkuaW50ZXJzZWN0KGFudGlEaWFnQXR0YWNrcyhiLCBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShhKSkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgYiBvZiBGSUxFX1JBTkdFW2FdKSB7XG4gICAgICAgICAgICByYXlbYV1bYl0gPSBGSUxFX1JBTkdFW2FdLndpdGgoYSk7XG4gICAgICAgICAgICBiZXR3ZWVuW2FdW2JdID0gZmlsZUF0dGFja3MoYSwgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoYikpLmludGVyc2VjdChmaWxlQXR0YWNrcyhiLCBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShhKSkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgYiBvZiBSQU5LX1JBTkdFW2FdKSB7XG4gICAgICAgICAgICByYXlbYV1bYl0gPSBSQU5LX1JBTkdFW2FdLndpdGgoYSk7XG4gICAgICAgICAgICBiZXR3ZWVuW2FdW2JdID0gcmFua0F0dGFja3MoYSwgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoYikpLmludGVyc2VjdChyYW5rQXR0YWNrcyhiLCBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShhKSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbcmF5LCBiZXR3ZWVuXTtcbn1cbmNvbnN0IFtSQVksIEJFVFdFRU5dID0gcmF5VGFibGVzKCk7XG5mdW5jdGlvbiByYXkoYSwgYikge1xuICAgIHJldHVybiBSQVlbYV1bYl07XG59XG5leHBvcnRzLnJheSA9IHJheTtcbmZ1bmN0aW9uIGJldHdlZW4oYSwgYikge1xuICAgIHJldHVybiBCRVRXRUVOW2FdW2JdO1xufVxuZXhwb3J0cy5iZXR3ZWVuID0gYmV0d2VlbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL3R5cGVzXCIpO1xuY29uc3Qgc3F1YXJlU2V0XzEgPSByZXF1aXJlKFwiLi9zcXVhcmVTZXRcIik7XG5jbGFzcyBCb2FyZCB7XG4gICAgY29uc3RydWN0b3IoKSB7IH1cbiAgICBzdGF0aWMgZGVmYXVsdCgpIHtcbiAgICAgICAgY29uc3QgYm9hcmQgPSBuZXcgQm9hcmQoKTtcbiAgICAgICAgYm9hcmQucmVzZXQoKTtcbiAgICAgICAgcmV0dXJuIGJvYXJkO1xuICAgIH1cbiAgICBzdGF0aWMgcmFjaW5nS2luZ3MoKSB7XG4gICAgICAgIGNvbnN0IGJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIGJvYXJkLm9jY3VwaWVkID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweGZmZmYsIDApO1xuICAgICAgICBib2FyZC5wcm9tb3RlZCA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBib2FyZC53aGl0ZSA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHhmMGYwLCAwKTtcbiAgICAgICAgYm9hcmQuYmxhY2sgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4MGYwZiwgMCk7XG4gICAgICAgIGJvYXJkLnBhd24gPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgYm9hcmQua25pZ2h0ID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDE4MTgsIDApO1xuICAgICAgICBib2FyZC5iaXNob3AgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4MjQyNCwgMCk7XG4gICAgICAgIGJvYXJkLnJvb2sgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4NDI0MiwgMCk7XG4gICAgICAgIGJvYXJkLnF1ZWVuID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDAwODEsIDApO1xuICAgICAgICBib2FyZC5raW5nID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDgxMDAsIDApO1xuICAgICAgICByZXR1cm4gYm9hcmQ7XG4gICAgfVxuICAgIHN0YXRpYyBob3JkZSgpIHtcbiAgICAgICAgY29uc3QgYm9hcmQgPSBuZXcgQm9hcmQoKTtcbiAgICAgICAgYm9hcmQub2NjdXBpZWQgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDQyOTQ5NjcyOTUsIDQyOTQ5MDE4NjIpO1xuICAgICAgICBib2FyZC5wcm9tb3RlZCA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBib2FyZC53aGl0ZSA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoNDI5NDk2NzI5NSwgMTAyKTtcbiAgICAgICAgYm9hcmQuYmxhY2sgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDAsIDQyOTQ5MDE3NjApO1xuICAgICAgICBib2FyZC5wYXduID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCg0Mjk0OTY3Mjk1LCAxNjcxMTc4Mik7XG4gICAgICAgIGJvYXJkLmtuaWdodCA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMCwgMTEwNzI5NjI1Nik7XG4gICAgICAgIGJvYXJkLmJpc2hvcCA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMCwgNjAzOTc5Nzc2KTtcbiAgICAgICAgYm9hcmQucm9vayA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMCwgMjE2NDI2MDg2NCk7XG4gICAgICAgIGJvYXJkLnF1ZWVuID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgwLCAxMzQyMTc3MjgpO1xuICAgICAgICBib2FyZC5raW5nID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgwLCAyNjg0MzU0NTYpO1xuICAgICAgICByZXR1cm4gYm9hcmQ7XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLm9jY3VwaWVkID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweGZmZmYsIDQyOTQ5MDE3NjApO1xuICAgICAgICB0aGlzLnByb21vdGVkID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIHRoaXMud2hpdGUgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4ZmZmZiwgMCk7XG4gICAgICAgIHRoaXMuYmxhY2sgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDAsIDQyOTQ5MDE3NjApO1xuICAgICAgICB0aGlzLnBhd24gPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4ZmYwMCwgMTY3MTE2ODApO1xuICAgICAgICB0aGlzLmtuaWdodCA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHg0MiwgMTEwNzI5NjI1Nik7XG4gICAgICAgIHRoaXMuYmlzaG9wID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDI0LCA2MDM5Nzk3NzYpO1xuICAgICAgICB0aGlzLnJvb2sgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4ODEsIDIxNjQyNjA4NjQpO1xuICAgICAgICB0aGlzLnF1ZWVuID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDgsIDEzNDIxNzcyOCk7XG4gICAgICAgIHRoaXMua2luZyA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHgxMCwgMjY4NDM1NDU2KTtcbiAgICB9XG4gICAgc3RhdGljIGVtcHR5KCkge1xuICAgICAgICBjb25zdCBib2FyZCA9IG5ldyBCb2FyZCgpO1xuICAgICAgICBib2FyZC5jbGVhcigpO1xuICAgICAgICByZXR1cm4gYm9hcmQ7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLm9jY3VwaWVkID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIHRoaXMucHJvbW90ZWQgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiB0eXBlc18xLkNPTE9SUylcbiAgICAgICAgICAgIHRoaXNbY29sb3JdID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGZvciAoY29uc3Qgcm9sZSBvZiB0eXBlc18xLlJPTEVTKVxuICAgICAgICAgICAgdGhpc1tyb2xlXSA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgYm9hcmQgPSBuZXcgQm9hcmQoKTtcbiAgICAgICAgYm9hcmQub2NjdXBpZWQgPSB0aGlzLm9jY3VwaWVkO1xuICAgICAgICBib2FyZC5wcm9tb3RlZCA9IHRoaXMucHJvbW90ZWQ7XG4gICAgICAgIGZvciAoY29uc3QgY29sb3Igb2YgdHlwZXNfMS5DT0xPUlMpXG4gICAgICAgICAgICBib2FyZFtjb2xvcl0gPSB0aGlzW2NvbG9yXTtcbiAgICAgICAgZm9yIChjb25zdCByb2xlIG9mIHR5cGVzXzEuUk9MRVMpXG4gICAgICAgICAgICBib2FyZFtyb2xlXSA9IHRoaXNbcm9sZV07XG4gICAgICAgIHJldHVybiBib2FyZDtcbiAgICB9XG4gICAgZ2V0Q29sb3Ioc3F1YXJlKSB7XG4gICAgICAgIGlmICh0aGlzLndoaXRlLmhhcyhzcXVhcmUpKVxuICAgICAgICAgICAgcmV0dXJuICd3aGl0ZSc7XG4gICAgICAgIGlmICh0aGlzLmJsYWNrLmhhcyhzcXVhcmUpKVxuICAgICAgICAgICAgcmV0dXJuICdibGFjayc7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZ2V0Um9sZShzcXVhcmUpIHtcbiAgICAgICAgZm9yIChjb25zdCByb2xlIG9mIHR5cGVzXzEuUk9MRVMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzW3JvbGVdLmhhcyhzcXVhcmUpKVxuICAgICAgICAgICAgICAgIHJldHVybiByb2xlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZ2V0KHNxdWFyZSkge1xuICAgICAgICBjb25zdCBjb2xvciA9IHRoaXMuZ2V0Q29sb3Ioc3F1YXJlKTtcbiAgICAgICAgaWYgKCFjb2xvcilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgcHJvbW90ZWQgPSB0aGlzLnByb21vdGVkLmhhcyhzcXVhcmUpO1xuICAgICAgICBjb25zdCByb2xlID0gdGhpcy5nZXRSb2xlKHNxdWFyZSk7XG4gICAgICAgIHJldHVybiB7IGNvbG9yLCByb2xlLCBwcm9tb3RlZCB9O1xuICAgIH1cbiAgICB0YWtlKHNxdWFyZSkge1xuICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMuZ2V0KHNxdWFyZSk7XG4gICAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5vY2N1cGllZCA9IHRoaXMub2NjdXBpZWQud2l0aG91dChzcXVhcmUpO1xuICAgICAgICAgICAgdGhpc1twaWVjZS5jb2xvcl0gPSB0aGlzW3BpZWNlLmNvbG9yXS53aXRob3V0KHNxdWFyZSk7XG4gICAgICAgICAgICB0aGlzW3BpZWNlLnJvbGVdID0gdGhpc1twaWVjZS5yb2xlXS53aXRob3V0KHNxdWFyZSk7XG4gICAgICAgICAgICBpZiAocGllY2UucHJvbW90ZWQpXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9tb3RlZCA9IHRoaXMucHJvbW90ZWQud2l0aG91dChzcXVhcmUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwaWVjZTtcbiAgICB9XG4gICAgc2V0KHNxdWFyZSwgcGllY2UpIHtcbiAgICAgICAgY29uc3Qgb2xkID0gdGhpcy50YWtlKHNxdWFyZSk7XG4gICAgICAgIHRoaXMub2NjdXBpZWQgPSB0aGlzLm9jY3VwaWVkLndpdGgoc3F1YXJlKTtcbiAgICAgICAgdGhpc1twaWVjZS5jb2xvcl0gPSB0aGlzW3BpZWNlLmNvbG9yXS53aXRoKHNxdWFyZSk7XG4gICAgICAgIHRoaXNbcGllY2Uucm9sZV0gPSB0aGlzW3BpZWNlLnJvbGVdLndpdGgoc3F1YXJlKTtcbiAgICAgICAgaWYgKHBpZWNlLnByb21vdGVkKVxuICAgICAgICAgICAgdGhpcy5wcm9tb3RlZCA9IHRoaXMucHJvbW90ZWQud2l0aChzcXVhcmUpO1xuICAgICAgICByZXR1cm4gb2xkO1xuICAgIH1cbiAgICBoYXMoc3F1YXJlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9jY3VwaWVkLmhhcyhzcXVhcmUpO1xuICAgIH1cbiAgICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICAgICAgY29uc3Qga2V5cyA9IHRoaXMub2NjdXBpZWRbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgICAgICBjb25zdCBuZXh0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBrZXlzLm5leHQoKTtcbiAgICAgICAgICAgIGlmIChlbnRyeS5kb25lKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUgfTtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBbZW50cnkudmFsdWUsIHRoaXMuZ2V0KGVudHJ5LnZhbHVlKV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7IG5leHQgfTtcbiAgICB9XG4gICAgcGllY2VzKGNvbG9yLCByb2xlKSB7XG4gICAgICAgIHJldHVybiB0aGlzW2NvbG9yXS5pbnRlcnNlY3QodGhpc1tyb2xlXSk7XG4gICAgfVxuICAgIHJvb2tzQW5kUXVlZW5zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb29rLnVuaW9uKHRoaXMucXVlZW4pO1xuICAgIH1cbiAgICBiaXNob3BzQW5kUXVlZW5zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iaXNob3AudW5pb24odGhpcy5xdWVlbik7XG4gICAgfVxuICAgIGtpbmdPZihjb2xvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5raW5nLmludGVyc2VjdCh0aGlzW2NvbG9yXSkuZGlmZih0aGlzLnByb21vdGVkKS5zaW5nbGVTcXVhcmUoKTtcbiAgICB9XG59XG5leHBvcnRzLkJvYXJkID0gQm9hcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHJlc3VsdF8xID0gcmVxdWlyZShcIkBiYWRyYXAvcmVzdWx0XCIpO1xuY29uc3QgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL3R5cGVzXCIpO1xuY29uc3Qgc3F1YXJlU2V0XzEgPSByZXF1aXJlKFwiLi9zcXVhcmVTZXRcIik7XG5jb25zdCBib2FyZF8xID0gcmVxdWlyZShcIi4vYm9hcmRcIik7XG5jb25zdCBhdHRhY2tzXzEgPSByZXF1aXJlKFwiLi9hdHRhY2tzXCIpO1xuY29uc3QgdXRpbF8xID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBJbGxlZ2FsU2V0dXA7XG4oZnVuY3Rpb24gKElsbGVnYWxTZXR1cCkge1xuICAgIElsbGVnYWxTZXR1cFtcIkVtcHR5XCJdID0gXCJFUlJfRU1QVFlcIjtcbiAgICBJbGxlZ2FsU2V0dXBbXCJPcHBvc2l0ZUNoZWNrXCJdID0gXCJFUlJfT1BQT1NJVEVfQ0hFQ0tcIjtcbiAgICBJbGxlZ2FsU2V0dXBbXCJQYXduc09uQmFja3JhbmtcIl0gPSBcIkVSUl9QQVdOU19PTl9CQUNLUkFOS1wiO1xuICAgIElsbGVnYWxTZXR1cFtcIktpbmdzXCJdID0gXCJFUlJfS0lOR1NcIjtcbiAgICBJbGxlZ2FsU2V0dXBbXCJWYXJpYW50XCJdID0gXCJFUlJfVkFSSUFOVFwiO1xufSkoSWxsZWdhbFNldHVwID0gZXhwb3J0cy5JbGxlZ2FsU2V0dXAgfHwgKGV4cG9ydHMuSWxsZWdhbFNldHVwID0ge30pKTtcbmNsYXNzIFBvc2l0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG59XG5leHBvcnRzLlBvc2l0aW9uRXJyb3IgPSBQb3NpdGlvbkVycm9yO1xuZnVuY3Rpb24gYXR0YWNrc1RvKHNxdWFyZSwgYXR0YWNrZXIsIGJvYXJkLCBvY2N1cGllZCkge1xuICAgIHJldHVybiBib2FyZFthdHRhY2tlcl0uaW50ZXJzZWN0KGF0dGFja3NfMS5yb29rQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKS5pbnRlcnNlY3QoYm9hcmQucm9va3NBbmRRdWVlbnMoKSlcbiAgICAgICAgLnVuaW9uKGF0dGFja3NfMS5iaXNob3BBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpLmludGVyc2VjdChib2FyZC5iaXNob3BzQW5kUXVlZW5zKCkpKVxuICAgICAgICAudW5pb24oYXR0YWNrc18xLmtuaWdodEF0dGFja3Moc3F1YXJlKS5pbnRlcnNlY3QoYm9hcmQua25pZ2h0KSlcbiAgICAgICAgLnVuaW9uKGF0dGFja3NfMS5raW5nQXR0YWNrcyhzcXVhcmUpLmludGVyc2VjdChib2FyZC5raW5nKSlcbiAgICAgICAgLnVuaW9uKGF0dGFja3NfMS5wYXduQXR0YWNrcyh1dGlsXzEub3Bwb3NpdGUoYXR0YWNrZXIpLCBzcXVhcmUpLmludGVyc2VjdChib2FyZC5wYXduKSkpO1xufVxuZnVuY3Rpb24ga2luZ0Nhc3RsZXNUbyhjb2xvciwgc2lkZSkge1xuICAgIHJldHVybiBjb2xvciA9PT0gJ3doaXRlJyA/IChzaWRlID09PSAnYScgPyAyIDogNikgOiAoc2lkZSA9PT0gJ2EnID8gNTggOiA2Mik7XG59XG5mdW5jdGlvbiByb29rQ2FzdGxlc1RvKGNvbG9yLCBzaWRlKSB7XG4gICAgcmV0dXJuIGNvbG9yID09PSAnd2hpdGUnID8gKHNpZGUgPT09ICdhJyA/IDMgOiA1KSA6IChzaWRlID09PSAnYScgPyA1OSA6IDYxKTtcbn1cbmNsYXNzIENhc3RsZXMge1xuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIGNvbnN0IGNhc3RsZXMgPSBuZXcgQ2FzdGxlcygpO1xuICAgICAgICBjYXN0bGVzLnVubW92ZWRSb29rcyA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5jb3JuZXJzKCk7XG4gICAgICAgIGNhc3RsZXMucm9vayA9IHtcbiAgICAgICAgICAgIHdoaXRlOiB7IGE6IDAsIGg6IDcgfSxcbiAgICAgICAgICAgIGJsYWNrOiB7IGE6IDU2LCBoOiA2MyB9LFxuICAgICAgICB9O1xuICAgICAgICBjYXN0bGVzLnBhdGggPSB7XG4gICAgICAgICAgICB3aGl0ZTogeyBhOiBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4NjAsIDApLCBoOiBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDAsIDB4ZSkgfSxcbiAgICAgICAgICAgIGJsYWNrOiB7IGE6IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMCwgMHg2MDAwMDAwMCksIGg6IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMCwgMHgwZTAwMDAwMCkgfSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGNhc3RsZXM7XG4gICAgfVxuICAgIHN0YXRpYyBlbXB0eSgpIHtcbiAgICAgICAgY29uc3QgY2FzdGxlcyA9IG5ldyBDYXN0bGVzKCk7XG4gICAgICAgIGNhc3RsZXMudW5tb3ZlZFJvb2tzID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGNhc3RsZXMucm9vayA9IHtcbiAgICAgICAgICAgIHdoaXRlOiB7IGE6IHVuZGVmaW5lZCwgaDogdW5kZWZpbmVkIH0sXG4gICAgICAgICAgICBibGFjazogeyBhOiB1bmRlZmluZWQsIGg6IHVuZGVmaW5lZCB9LFxuICAgICAgICB9O1xuICAgICAgICBjYXN0bGVzLnBhdGggPSB7XG4gICAgICAgICAgICB3aGl0ZTogeyBhOiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKSwgaDogc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCkgfSxcbiAgICAgICAgICAgIGJsYWNrOiB7IGE6IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpLCBoOiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKSB9LFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gY2FzdGxlcztcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNhc3RsZXMgPSBuZXcgQ2FzdGxlcygpO1xuICAgICAgICBjYXN0bGVzLnVubW92ZWRSb29rcyA9IHRoaXMudW5tb3ZlZFJvb2tzO1xuICAgICAgICBjYXN0bGVzLnJvb2sgPSB7XG4gICAgICAgICAgICB3aGl0ZTogeyBhOiB0aGlzLnJvb2sud2hpdGUuYSwgaDogdGhpcy5yb29rLndoaXRlLmggfSxcbiAgICAgICAgICAgIGJsYWNrOiB7IGE6IHRoaXMucm9vay5ibGFjay5hLCBoOiB0aGlzLnJvb2suYmxhY2suaCB9LFxuICAgICAgICB9O1xuICAgICAgICBjYXN0bGVzLnBhdGggPSB7XG4gICAgICAgICAgICB3aGl0ZTogeyBhOiB0aGlzLnBhdGgud2hpdGUuYSwgaDogdGhpcy5wYXRoLndoaXRlLmggfSxcbiAgICAgICAgICAgIGJsYWNrOiB7IGE6IHRoaXMucGF0aC5ibGFjay5hLCBoOiB0aGlzLnBhdGguYmxhY2suaCB9LFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gY2FzdGxlcztcbiAgICB9XG4gICAgYWRkKGNvbG9yLCBzaWRlLCBraW5nLCByb29rKSB7XG4gICAgICAgIGNvbnN0IGtpbmdUbyA9IGtpbmdDYXN0bGVzVG8oY29sb3IsIHNpZGUpO1xuICAgICAgICBjb25zdCByb29rVG8gPSByb29rQ2FzdGxlc1RvKGNvbG9yLCBzaWRlKTtcbiAgICAgICAgdGhpcy51bm1vdmVkUm9va3MgPSB0aGlzLnVubW92ZWRSb29rcy53aXRoKHJvb2spO1xuICAgICAgICB0aGlzLnJvb2tbY29sb3JdW3NpZGVdID0gcm9vaztcbiAgICAgICAgdGhpcy5wYXRoW2NvbG9yXVtzaWRlXSA9IGF0dGFja3NfMS5iZXR3ZWVuKHJvb2ssIHJvb2tUbykud2l0aChyb29rVG8pXG4gICAgICAgICAgICAudW5pb24oYXR0YWNrc18xLmJldHdlZW4oa2luZywga2luZ1RvKS53aXRoKGtpbmdUbykpXG4gICAgICAgICAgICAud2l0aG91dChraW5nKS53aXRob3V0KHJvb2spO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIGNvbnN0IGNhc3RsZXMgPSBDYXN0bGVzLmVtcHR5KCk7XG4gICAgICAgIGNvbnN0IHJvb2tzID0gc2V0dXAudW5tb3ZlZFJvb2tzLmludGVyc2VjdChzZXR1cC5ib2FyZC5yb29rKTtcbiAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiB0eXBlc18xLkNPTE9SUykge1xuICAgICAgICAgICAgY29uc3QgYmFja3JhbmsgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuYmFja3JhbmsoY29sb3IpO1xuICAgICAgICAgICAgY29uc3Qga2luZyA9IHNldHVwLmJvYXJkLmtpbmdPZihjb2xvcik7XG4gICAgICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKGtpbmcpIHx8ICFiYWNrcmFuay5oYXMoa2luZykpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBzaWRlID0gcm9va3MuaW50ZXJzZWN0KHNldHVwLmJvYXJkW2NvbG9yXSkuaW50ZXJzZWN0KGJhY2tyYW5rKTtcbiAgICAgICAgICAgIGNvbnN0IGFTaWRlID0gc2lkZS5maXJzdCgpO1xuICAgICAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKGFTaWRlKSAmJiBhU2lkZSA8IGtpbmcpXG4gICAgICAgICAgICAgICAgY2FzdGxlcy5hZGQoY29sb3IsICdhJywga2luZywgYVNpZGUpO1xuICAgICAgICAgICAgY29uc3QgaFNpZGUgPSBzaWRlLmxhc3QoKTtcbiAgICAgICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChoU2lkZSkgJiYga2luZyA8IGhTaWRlKVxuICAgICAgICAgICAgICAgIGNhc3RsZXMuYWRkKGNvbG9yLCAnaCcsIGtpbmcsIGhTaWRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FzdGxlcztcbiAgICB9XG4gICAgZGlzY2FyZFJvb2soc3F1YXJlKSB7XG4gICAgICAgIGlmICh0aGlzLnVubW92ZWRSb29rcy5oYXMoc3F1YXJlKSkge1xuICAgICAgICAgICAgdGhpcy51bm1vdmVkUm9va3MgPSB0aGlzLnVubW92ZWRSb29rcy53aXRob3V0KHNxdWFyZSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIHR5cGVzXzEuQ09MT1JTKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzaWRlIG9mIHR5cGVzXzEuQ0FTVExJTkdfU0lERVMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucm9va1tjb2xvcl1bc2lkZV0gPT09IHNxdWFyZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9va1tjb2xvcl1bc2lkZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGRpc2NhcmRTaWRlKGNvbG9yKSB7XG4gICAgICAgIHRoaXMudW5tb3ZlZFJvb2tzID0gdGhpcy51bm1vdmVkUm9va3MuZGlmZihzcXVhcmVTZXRfMS5TcXVhcmVTZXQuYmFja3JhbmsoY29sb3IpKTtcbiAgICAgICAgdGhpcy5yb29rW2NvbG9yXS5hID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnJvb2tbY29sb3JdLmggPSB1bmRlZmluZWQ7XG4gICAgfVxufVxuZXhwb3J0cy5DYXN0bGVzID0gQ2FzdGxlcztcbmNsYXNzIFBvc2l0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihydWxlcykge1xuICAgICAgICB0aGlzLnJ1bGVzID0gcnVsZXM7XG4gICAgfVxuICAgIGtpbmdBdHRhY2tlcnMoc3F1YXJlLCBhdHRhY2tlciwgb2NjdXBpZWQpIHtcbiAgICAgICAgcmV0dXJuIGF0dGFja3NUbyhzcXVhcmUsIGF0dGFja2VyLCB0aGlzLmJvYXJkLCBvY2N1cGllZCk7XG4gICAgfVxuICAgIGRyb3BEZXN0cyhfY3R4KSB7XG4gICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICB9XG4gICAgcGxheUNhcHR1cmVBdChzcXVhcmUsIGNhcHR1cmVkKSB7XG4gICAgICAgIHRoaXMuaGFsZm1vdmVzID0gMDtcbiAgICAgICAgaWYgKGNhcHR1cmVkLnJvbGUgPT09ICdyb29rJylcbiAgICAgICAgICAgIHRoaXMuY2FzdGxlcy5kaXNjYXJkUm9vayhzcXVhcmUpO1xuICAgICAgICBpZiAodGhpcy5wb2NrZXRzKVxuICAgICAgICAgICAgdGhpcy5wb2NrZXRzW3V0aWxfMS5vcHBvc2l0ZShjYXB0dXJlZC5jb2xvcildW2NhcHR1cmVkLnJvbGVdKys7XG4gICAgfVxuICAgIGN0eCgpIHtcbiAgICAgICAgY29uc3QgdmFyaWFudEVuZCA9IHRoaXMuaXNWYXJpYW50RW5kKCk7XG4gICAgICAgIGNvbnN0IGtpbmcgPSB0aGlzLmJvYXJkLmtpbmdPZih0aGlzLnR1cm4pO1xuICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKGtpbmcpKVxuICAgICAgICAgICAgcmV0dXJuIHsga2luZywgYmxvY2tlcnM6IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpLCBjaGVja2Vyczogc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCksIHZhcmlhbnRFbmQsIG11c3RDYXB0dXJlOiBmYWxzZSB9O1xuICAgICAgICBjb25zdCBzbmlwZXJzID0gYXR0YWNrc18xLnJvb2tBdHRhY2tzKGtpbmcsIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpKS5pbnRlcnNlY3QodGhpcy5ib2FyZC5yb29rc0FuZFF1ZWVucygpKVxuICAgICAgICAgICAgLnVuaW9uKGF0dGFja3NfMS5iaXNob3BBdHRhY2tzKGtpbmcsIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpKS5pbnRlcnNlY3QodGhpcy5ib2FyZC5iaXNob3BzQW5kUXVlZW5zKCkpKVxuICAgICAgICAgICAgLmludGVyc2VjdCh0aGlzLmJvYXJkW3V0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pXSk7XG4gICAgICAgIGxldCBibG9ja2VycyA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBmb3IgKGNvbnN0IHNuaXBlciBvZiBzbmlwZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBiID0gYXR0YWNrc18xLmJldHdlZW4oa2luZywgc25pcGVyKS5pbnRlcnNlY3QodGhpcy5ib2FyZC5vY2N1cGllZCk7XG4gICAgICAgICAgICBpZiAoIWIubW9yZVRoYW5PbmUoKSlcbiAgICAgICAgICAgICAgICBibG9ja2VycyA9IGJsb2NrZXJzLnVuaW9uKGIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoZWNrZXJzID0gdGhpcy5raW5nQXR0YWNrZXJzKGtpbmcsIHV0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pLCB0aGlzLmJvYXJkLm9jY3VwaWVkKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGtpbmcsXG4gICAgICAgICAgICBibG9ja2VycyxcbiAgICAgICAgICAgIGNoZWNrZXJzLFxuICAgICAgICAgICAgdmFyaWFudEVuZCxcbiAgICAgICAgICAgIG11c3RDYXB0dXJlOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gVGhlIGZvbGxvd2luZyBzaG91bGQgYmUgaWRlbnRpY2FsIGluIGFsbCBzdWJjbGFzc2VzXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKCk7XG4gICAgICAgIHBvcy5ib2FyZCA9IHRoaXMuYm9hcmQuY2xvbmUoKTtcbiAgICAgICAgcG9zLnBvY2tldHMgPSB0aGlzLnBvY2tldHMgJiYgdGhpcy5wb2NrZXRzLmNsb25lKCk7XG4gICAgICAgIHBvcy50dXJuID0gdGhpcy50dXJuO1xuICAgICAgICBwb3MuY2FzdGxlcyA9IHRoaXMuY2FzdGxlcy5jbG9uZSgpO1xuICAgICAgICBwb3MuZXBTcXVhcmUgPSB0aGlzLmVwU3F1YXJlO1xuICAgICAgICBwb3MucmVtYWluaW5nQ2hlY2tzID0gdGhpcy5yZW1haW5pbmdDaGVja3MgJiYgdGhpcy5yZW1haW5pbmdDaGVja3MuY2xvbmUoKTtcbiAgICAgICAgcG9zLmhhbGZtb3ZlcyA9IHRoaXMuaGFsZm1vdmVzO1xuICAgICAgICBwb3MuZnVsbG1vdmVzID0gdGhpcy5mdWxsbW92ZXM7XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgfVxuICAgIHRvU2V0dXAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBib2FyZDogdGhpcy5ib2FyZC5jbG9uZSgpLFxuICAgICAgICAgICAgcG9ja2V0czogdGhpcy5wb2NrZXRzICYmIHRoaXMucG9ja2V0cy5jbG9uZSgpLFxuICAgICAgICAgICAgdHVybjogdGhpcy50dXJuLFxuICAgICAgICAgICAgdW5tb3ZlZFJvb2tzOiB0aGlzLmNhc3RsZXMudW5tb3ZlZFJvb2tzLFxuICAgICAgICAgICAgZXBTcXVhcmU6IHRoaXMuaGFzTGVnYWxFcCgpID8gdGhpcy5lcFNxdWFyZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoZWNrczogdGhpcy5yZW1haW5pbmdDaGVja3MgJiYgdGhpcy5yZW1haW5pbmdDaGVja3MuY2xvbmUoKSxcbiAgICAgICAgICAgIGhhbGZtb3ZlczogTWF0aC5taW4odGhpcy5oYWxmbW92ZXMsIDE1MCksXG4gICAgICAgICAgICBmdWxsbW92ZXM6IE1hdGgubWluKE1hdGgubWF4KHRoaXMuZnVsbG1vdmVzLCAxKSwgOTk5OSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlzSW5zdWZmaWNpZW50TWF0ZXJpYWwoKSB7XG4gICAgICAgIHJldHVybiB0eXBlc18xLkNPTE9SUy5ldmVyeShjb2xvciA9PiB0aGlzLmhhc0luc3VmZmljaWVudE1hdGVyaWFsKGNvbG9yKSk7XG4gICAgfVxuICAgIGhhc0Rlc3RzKGN0eCkge1xuICAgICAgICBmb3IgKGNvbnN0IHNxdWFyZSBvZiB0aGlzLmJvYXJkW3RoaXMudHVybl0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlc3RzKHNxdWFyZSwgY3R4KS5ub25FbXB0eSgpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRyb3BEZXN0cyhjdHgpLm5vbkVtcHR5KCk7XG4gICAgfVxuICAgIGlzTGVnYWwodWNpLCBjdHgpIHtcbiAgICAgICAgaWYgKHR5cGVzXzEuaXNEcm9wKHVjaSkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5wb2NrZXRzIHx8IHRoaXMucG9ja2V0c1t0aGlzLnR1cm5dW3VjaS5yb2xlXSA8PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmICh1Y2kucm9sZSA9PT0gJ3Bhd24nICYmIHNxdWFyZVNldF8xLlNxdWFyZVNldC5iYWNrcmFua3MoKS5oYXModWNpLnRvKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kcm9wRGVzdHMoY3R4KS5oYXModWNpLnRvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh1Y2kucHJvbW90aW9uID09PSAncGF3bicpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKHVjaS5wcm9tb3Rpb24gPT09ICdraW5nJyAmJiB0aGlzLnJ1bGVzICE9PSAnYW50aWNoZXNzJylcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIXVjaS5wcm9tb3Rpb24gJiYgdGhpcy5ib2FyZC5wYXduLmhhcyh1Y2kuZnJvbSkgJiYgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rcygpLmhhcyh1Y2kudG8pKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlc3RzKHVjaS5mcm9tLCBjdHgpLmhhcyh1Y2kudG8pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlzQ2hlY2soKSB7XG4gICAgICAgIGNvbnN0IGtpbmcgPSB0aGlzLmJvYXJkLmtpbmdPZih0aGlzLnR1cm4pO1xuICAgICAgICByZXR1cm4gdXRpbF8xLmRlZmluZWQoa2luZykgJiYgdGhpcy5raW5nQXR0YWNrZXJzKGtpbmcsIHV0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pLCB0aGlzLmJvYXJkLm9jY3VwaWVkKS5ub25FbXB0eSgpO1xuICAgIH1cbiAgICBpc0VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNWYXJpYW50RW5kKCkgfHwgdGhpcy5pc0luc3VmZmljaWVudE1hdGVyaWFsKCkgfHwgIXRoaXMuaGFzRGVzdHModGhpcy5jdHgoKSk7XG4gICAgfVxuICAgIGlzQ2hlY2ttYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5pc1ZhcmlhbnRFbmQoKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jdHgoKTtcbiAgICAgICAgcmV0dXJuIGN0eC5jaGVja2Vycy5ub25FbXB0eSgpICYmICF0aGlzLmhhc0Rlc3RzKGN0eCk7XG4gICAgfVxuICAgIGlzU3RhbGVtYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5pc1ZhcmlhbnRFbmQoKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jdHgoKTtcbiAgICAgICAgcmV0dXJuIGN0eC5jaGVja2Vycy5pc0VtcHR5KCkgJiYgIXRoaXMuaGFzRGVzdHMoY3R4KTtcbiAgICB9XG4gICAgb3V0Y29tZSgpIHtcbiAgICAgICAgY29uc3QgdmFyaWFudE91dGNvbWUgPSB0aGlzLnZhcmlhbnRPdXRjb21lKCk7XG4gICAgICAgIGlmICh2YXJpYW50T3V0Y29tZSlcbiAgICAgICAgICAgIHJldHVybiB2YXJpYW50T3V0Y29tZTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5pc0NoZWNrbWF0ZSgpKVxuICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiB1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSB9O1xuICAgICAgICBlbHNlIGlmICh0aGlzLmlzSW5zdWZmaWNpZW50TWF0ZXJpYWwoKSB8fCB0aGlzLmlzU3RhbGVtYXRlKCkpXG4gICAgICAgICAgICByZXR1cm4geyB3aW5uZXI6IHVuZGVmaW5lZCB9O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGFsbERlc3RzKCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmN0eCgpO1xuICAgICAgICBjb25zdCBkID0gbmV3IE1hcCgpO1xuICAgICAgICBpZiAoY3R4LnZhcmlhbnRFbmQpXG4gICAgICAgICAgICByZXR1cm4gZDtcbiAgICAgICAgZm9yIChjb25zdCBzcXVhcmUgb2YgdGhpcy5ib2FyZFt0aGlzLnR1cm5dKSB7XG4gICAgICAgICAgICBkLnNldChzcXVhcmUsIHRoaXMuZGVzdHMoc3F1YXJlLCBjdHgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZDtcbiAgICB9XG4gICAgcGxheSh1Y2kpIHtcbiAgICAgICAgY29uc3QgdHVybiA9IHRoaXMudHVybiwgZXBTcXVhcmUgPSB0aGlzLmVwU3F1YXJlO1xuICAgICAgICB0aGlzLmVwU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmhhbGZtb3ZlcyArPSAxO1xuICAgICAgICBpZiAodHVybiA9PT0gJ2JsYWNrJylcbiAgICAgICAgICAgIHRoaXMuZnVsbG1vdmVzICs9IDE7XG4gICAgICAgIHRoaXMudHVybiA9IHV0aWxfMS5vcHBvc2l0ZSh0dXJuKTtcbiAgICAgICAgaWYgKHR5cGVzXzEuaXNEcm9wKHVjaSkpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuc2V0KHVjaS50bywgeyByb2xlOiB1Y2kucm9sZSwgY29sb3I6IHR1cm4gfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wb2NrZXRzKVxuICAgICAgICAgICAgICAgIHRoaXMucG9ja2V0c1t0dXJuXVt1Y2kucm9sZV0tLTtcbiAgICAgICAgICAgIGlmICh1Y2kucm9sZSA9PT0gJ3Bhd24nKVxuICAgICAgICAgICAgICAgIHRoaXMuaGFsZm1vdmVzID0gMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBpZWNlID0gdGhpcy5ib2FyZC50YWtlKHVjaS5mcm9tKTtcbiAgICAgICAgICAgIGlmICghcGllY2UpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IGVwQ2FwdHVyZTtcbiAgICAgICAgICAgIGlmIChwaWVjZS5yb2xlID09PSAncGF3bicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbGZtb3ZlcyA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHVjaS50byA9PT0gZXBTcXVhcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXBDYXB0dXJlID0gdGhpcy5ib2FyZC50YWtlKHVjaS50byArICh0dXJuID09PSAnd2hpdGUnID8gLTggOiA4KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gdWNpLmZyb20gLSB1Y2kudG87XG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRlbHRhKSA9PT0gMTYgJiYgOCA8PSB1Y2kuZnJvbSAmJiB1Y2kuZnJvbSA8PSA1NSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVwU3F1YXJlID0gKHVjaS5mcm9tICsgdWNpLnRvKSA+PiAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodWNpLnByb21vdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBwaWVjZS5yb2xlID0gdWNpLnByb21vdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHBpZWNlLnJvbGUgPT09ICdyb29rJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FzdGxlcy5kaXNjYXJkUm9vayh1Y2kuZnJvbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwaWVjZS5yb2xlID09PSAna2luZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWx0YSA9IHVjaS50byAtIHVjaS5mcm9tO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzQ2FzdGxpbmcgPSBNYXRoLmFicyhkZWx0YSkgPT09IDIgfHwgdGhpcy5ib2FyZFt0dXJuXS5oYXModWNpLnRvKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNDYXN0bGluZykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaWRlID0gZGVsdGEgPiAwID8gJ2gnIDogJ2EnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb29rRnJvbSA9IHRoaXMuY2FzdGxlcy5yb29rW3R1cm5dW3NpZGVdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQocm9va0Zyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb29rID0gdGhpcy5ib2FyZC50YWtlKHJvb2tGcm9tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2V0KGtpbmdDYXN0bGVzVG8odHVybiwgc2lkZSksIHBpZWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb29rKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc2V0KHJvb2tDYXN0bGVzVG8odHVybiwgc2lkZSksIHJvb2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2FzdGxlcy5kaXNjYXJkU2lkZSh0dXJuKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNDYXN0bGluZylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY2FwdHVyZSA9IHRoaXMuYm9hcmQuc2V0KHVjaS50bywgcGllY2UpIHx8IGVwQ2FwdHVyZTtcbiAgICAgICAgICAgIGlmIChjYXB0dXJlKVxuICAgICAgICAgICAgICAgIHRoaXMucGxheUNhcHR1cmVBdCh1Y2kudG8sIGNhcHR1cmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGhhc0xlZ2FsRXAoKSB7XG4gICAgICAgIGlmICghdGhpcy5lcFNxdWFyZSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jdHgoKTtcbiAgICAgICAgY29uc3Qgb3VyUGF3bnMgPSB0aGlzLmJvYXJkLnBpZWNlcyh0aGlzLnR1cm4sICdwYXduJyk7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBvdXJQYXducy5pbnRlcnNlY3QoYXR0YWNrc18xLnBhd25BdHRhY2tzKHV0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pLCB0aGlzLmVwU3F1YXJlKSk7XG4gICAgICAgIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlc3RzKGNhbmRpZGF0ZSwgY3R4KS5oYXModGhpcy5lcFNxdWFyZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydHMuUG9zaXRpb24gPSBQb3NpdGlvbjtcbmNsYXNzIENoZXNzIGV4dGVuZHMgUG9zaXRpb24ge1xuICAgIGNvbnN0cnVjdG9yKHJ1bGVzKSB7XG4gICAgICAgIHN1cGVyKHJ1bGVzIHx8ICdjaGVzcycpO1xuICAgIH1cbiAgICBzdGF0aWMgZGVmYXVsdCgpIHtcbiAgICAgICAgY29uc3QgcG9zID0gbmV3IHRoaXMoKTtcbiAgICAgICAgcG9zLmJvYXJkID0gYm9hcmRfMS5Cb2FyZC5kZWZhdWx0KCk7XG4gICAgICAgIHBvcy5wb2NrZXRzID0gdW5kZWZpbmVkO1xuICAgICAgICBwb3MudHVybiA9ICd3aGl0ZSc7XG4gICAgICAgIHBvcy5jYXN0bGVzID0gQ2FzdGxlcy5kZWZhdWx0KCk7XG4gICAgICAgIHBvcy5lcFNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLnJlbWFpbmluZ0NoZWNrcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLmhhbGZtb3ZlcyA9IDA7XG4gICAgICAgIHBvcy5mdWxsbW92ZXMgPSAxO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IG5ldyB0aGlzKCk7XG4gICAgICAgIHBvcy5ib2FyZCA9IHNldHVwLmJvYXJkLmNsb25lKCk7XG4gICAgICAgIHBvcy5wb2NrZXRzID0gdW5kZWZpbmVkO1xuICAgICAgICBwb3MudHVybiA9IHNldHVwLnR1cm47XG4gICAgICAgIHBvcy5jYXN0bGVzID0gQ2FzdGxlcy5mcm9tU2V0dXAoc2V0dXApO1xuICAgICAgICBwb3MuZXBTcXVhcmUgPSBwb3MudmFsaWRFcFNxdWFyZShzZXR1cC5lcFNxdWFyZSk7XG4gICAgICAgIHBvcy5yZW1haW5pbmdDaGVja3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIHBvcy5oYWxmbW92ZXMgPSBzZXR1cC5oYWxmbW92ZXM7XG4gICAgICAgIHBvcy5mdWxsbW92ZXMgPSBzZXR1cC5mdWxsbW92ZXM7XG4gICAgICAgIHJldHVybiBwb3MudmFsaWRhdGUoKS5tYXAoXyA9PiBwb3MpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNsb25lKCk7XG4gICAgfVxuICAgIHZhbGlkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5vY2N1cGllZC5pc0VtcHR5KCkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgUG9zaXRpb25FcnJvcihJbGxlZ2FsU2V0dXAuRW1wdHkpKTtcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQua2luZy5zaXplKCkgIT09IDIpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgUG9zaXRpb25FcnJvcihJbGxlZ2FsU2V0dXAuS2luZ3MpKTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZCh0aGlzLmJvYXJkLmtpbmdPZih0aGlzLnR1cm4pKSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBQb3NpdGlvbkVycm9yKElsbGVnYWxTZXR1cC5LaW5ncykpO1xuICAgICAgICBjb25zdCBvdGhlcktpbmcgPSB0aGlzLmJvYXJkLmtpbmdPZih1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSk7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQob3RoZXJLaW5nKSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBQb3NpdGlvbkVycm9yKElsbGVnYWxTZXR1cC5LaW5ncykpO1xuICAgICAgICBpZiAodGhpcy5raW5nQXR0YWNrZXJzKG90aGVyS2luZywgdGhpcy50dXJuLCB0aGlzLmJvYXJkLm9jY3VwaWVkKS5ub25FbXB0eSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgUG9zaXRpb25FcnJvcihJbGxlZ2FsU2V0dXAuT3Bwb3NpdGVDaGVjaykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzcXVhcmVTZXRfMS5TcXVhcmVTZXQuYmFja3JhbmtzKCkuaW50ZXJzZWN0cyh0aGlzLmJvYXJkLnBhd24pKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgUG9zaXRpb25FcnJvcihJbGxlZ2FsU2V0dXAuUGF3bnNPbkJhY2tyYW5rKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayh1bmRlZmluZWQpO1xuICAgIH1cbiAgICB2YWxpZEVwU3F1YXJlKHNxdWFyZSkge1xuICAgICAgICBpZiAoIXNxdWFyZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgZXBSYW5rID0gdGhpcy50dXJuID09PSAnd2hpdGUnID8gNSA6IDI7XG4gICAgICAgIGNvbnN0IGZvcndhcmQgPSB0aGlzLnR1cm4gPT09ICd3aGl0ZScgPyA4IDogLTg7XG4gICAgICAgIGlmICgoc3F1YXJlID4+IDMpICE9PSBlcFJhbmspXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLmJvYXJkLm9jY3VwaWVkLmhhcyhzcXVhcmUgKyBmb3J3YXJkKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgcGF3biA9IHNxdWFyZSAtIGZvcndhcmQ7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZC5wYXduLmhhcyhwYXduKSB8fCAhdGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKV0uaGFzKHBhd24pKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByZXR1cm4gc3F1YXJlO1xuICAgIH1cbiAgICBjYXN0bGluZ0Rlc3Qoc2lkZSwgY3R4KSB7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQoY3R4LmtpbmcpIHx8IGN0eC5jaGVja2Vycy5ub25FbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBjb25zdCByb29rID0gdGhpcy5jYXN0bGVzLnJvb2tbdGhpcy50dXJuXVtzaWRlXTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChyb29rKSlcbiAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgaWYgKHRoaXMuY2FzdGxlcy5wYXRoW3RoaXMudHVybl1bc2lkZV0uaW50ZXJzZWN0cyh0aGlzLmJvYXJkLm9jY3VwaWVkKSlcbiAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgY29uc3Qga2luZ1RvID0ga2luZ0Nhc3RsZXNUbyh0aGlzLnR1cm4sIHNpZGUpO1xuICAgICAgICBjb25zdCBraW5nUGF0aCA9IGF0dGFja3NfMS5iZXR3ZWVuKGN0eC5raW5nLCBraW5nVG8pO1xuICAgICAgICBjb25zdCBvY2MgPSB0aGlzLmJvYXJkLm9jY3VwaWVkLndpdGhvdXQoY3R4LmtpbmcpO1xuICAgICAgICBmb3IgKGNvbnN0IHNxIG9mIGtpbmdQYXRoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5raW5nQXR0YWNrZXJzKHNxLCB1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSwgb2NjKS5ub25FbXB0eSgpKVxuICAgICAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb29rVG8gPSByb29rQ2FzdGxlc1RvKHRoaXMudHVybiwgc2lkZSk7XG4gICAgICAgIGNvbnN0IGFmdGVyID0gdGhpcy5ib2FyZC5vY2N1cGllZC50b2dnbGUoY3R4LmtpbmcpLnRvZ2dsZShyb29rKS50b2dnbGUocm9va1RvKTtcbiAgICAgICAgaWYgKHRoaXMua2luZ0F0dGFja2VycyhraW5nVG8sIHV0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pLCBhZnRlcikubm9uRW1wdHkoKSlcbiAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgcmV0dXJuIHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKHJvb2spO1xuICAgIH1cbiAgICBjYW5DYXB0dXJlRXAocGF3biwgY3R4KSB7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQodGhpcy5lcFNxdWFyZSkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghYXR0YWNrc18xLnBhd25BdHRhY2tzKHRoaXMudHVybiwgcGF3bikuaGFzKHRoaXMuZXBTcXVhcmUpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKGN0eC5raW5nKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjb25zdCBjYXB0dXJlZCA9IHRoaXMuZXBTcXVhcmUgKyAoKHRoaXMudHVybiA9PT0gJ3doaXRlJykgPyAtOCA6IDgpO1xuICAgICAgICBjb25zdCBvY2N1cGllZCA9IHRoaXMuYm9hcmQub2NjdXBpZWQudG9nZ2xlKHBhd24pLnRvZ2dsZSh0aGlzLmVwU3F1YXJlKS50b2dnbGUoY2FwdHVyZWQpO1xuICAgICAgICByZXR1cm4gIXRoaXMua2luZ0F0dGFja2VycyhjdHgua2luZywgdXRpbF8xLm9wcG9zaXRlKHRoaXMudHVybiksIG9jY3VwaWVkKS5pbnRlcnNlY3RzKG9jY3VwaWVkKTtcbiAgICB9XG4gICAgcHNldWRvRGVzdHMoc3F1YXJlLCBjdHgpIHtcbiAgICAgICAgaWYgKGN0eC52YXJpYW50RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMuYm9hcmQuZ2V0KHNxdWFyZSk7XG4gICAgICAgIGlmICghcGllY2UgfHwgcGllY2UuY29sb3IgIT09IHRoaXMudHVybilcbiAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgbGV0IHBzZXVkbyA9IGF0dGFja3NfMS5hdHRhY2tzKHBpZWNlLCBzcXVhcmUsIHRoaXMuYm9hcmQub2NjdXBpZWQpO1xuICAgICAgICBpZiAocGllY2Uucm9sZSA9PT0gJ3Bhd24nKSB7XG4gICAgICAgICAgICBsZXQgY2FwdHVyZVRhcmdldHMgPSB0aGlzLmJvYXJkW3V0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pXTtcbiAgICAgICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZCh0aGlzLmVwU3F1YXJlKSlcbiAgICAgICAgICAgICAgICBjYXB0dXJlVGFyZ2V0cyA9IGNhcHR1cmVUYXJnZXRzLndpdGgodGhpcy5lcFNxdWFyZSk7XG4gICAgICAgICAgICBwc2V1ZG8gPSBwc2V1ZG8uaW50ZXJzZWN0KGNhcHR1cmVUYXJnZXRzKTtcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy50dXJuID09PSAnd2hpdGUnID8gOCA6IC04O1xuICAgICAgICAgICAgY29uc3Qgc3RlcCA9IHNxdWFyZSArIGRlbHRhO1xuICAgICAgICAgICAgaWYgKDAgPD0gc3RlcCAmJiBzdGVwIDwgNjQgJiYgIXRoaXMuYm9hcmQub2NjdXBpZWQuaGFzKHN0ZXApKSB7XG4gICAgICAgICAgICAgICAgcHNldWRvID0gcHNldWRvLndpdGgoc3RlcCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuRG91YmxlU3RlcCA9IHRoaXMudHVybiA9PT0gJ3doaXRlJyA/IChzcXVhcmUgPCAxNikgOiAoc3F1YXJlID49IDY0IC0gMTYpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRvdWJsZVN0ZXAgPSBzdGVwICsgZGVsdGE7XG4gICAgICAgICAgICAgICAgaWYgKGNhbkRvdWJsZVN0ZXAgJiYgIXRoaXMuYm9hcmQub2NjdXBpZWQuaGFzKGRvdWJsZVN0ZXApKSB7XG4gICAgICAgICAgICAgICAgICAgIHBzZXVkbyA9IHBzZXVkby53aXRoKGRvdWJsZVN0ZXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwc2V1ZG87XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwc2V1ZG8gPSBwc2V1ZG8uZGlmZih0aGlzLmJvYXJkW3RoaXMudHVybl0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzcXVhcmUgPT09IGN0eC5raW5nKVxuICAgICAgICAgICAgcmV0dXJuIHBzZXVkby51bmlvbih0aGlzLmNhc3RsaW5nRGVzdCgnYScsIGN0eCkpLnVuaW9uKHRoaXMuY2FzdGxpbmdEZXN0KCdoJywgY3R4KSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBwc2V1ZG87XG4gICAgfVxuICAgIGRlc3RzKHNxdWFyZSwgY3R4KSB7XG4gICAgICAgIGlmIChjdHgudmFyaWFudEVuZClcbiAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgY29uc3QgcGllY2UgPSB0aGlzLmJvYXJkLmdldChzcXVhcmUpO1xuICAgICAgICBpZiAoIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSB0aGlzLnR1cm4pXG4gICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGxldCBwc2V1ZG8sIGxlZ2FsO1xuICAgICAgICBpZiAocGllY2Uucm9sZSA9PT0gJ3Bhd24nKSB7XG4gICAgICAgICAgICBwc2V1ZG8gPSBhdHRhY2tzXzEucGF3bkF0dGFja3ModGhpcy50dXJuLCBzcXVhcmUpLmludGVyc2VjdCh0aGlzLmJvYXJkW3V0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pXSk7XG4gICAgICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMudHVybiA9PT0gJ3doaXRlJyA/IDggOiAtODtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSBzcXVhcmUgKyBkZWx0YTtcbiAgICAgICAgICAgIGlmICgwIDw9IHN0ZXAgJiYgc3RlcCA8IDY0ICYmICF0aGlzLmJvYXJkLm9jY3VwaWVkLmhhcyhzdGVwKSkge1xuICAgICAgICAgICAgICAgIHBzZXVkbyA9IHBzZXVkby53aXRoKHN0ZXApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbkRvdWJsZVN0ZXAgPSB0aGlzLnR1cm4gPT09ICd3aGl0ZScgPyAoc3F1YXJlIDwgMTYpIDogKHNxdWFyZSA+PSA2NCAtIDE2KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkb3VibGVTdGVwID0gc3RlcCArIGRlbHRhO1xuICAgICAgICAgICAgICAgIGlmIChjYW5Eb3VibGVTdGVwICYmICF0aGlzLmJvYXJkLm9jY3VwaWVkLmhhcyhkb3VibGVTdGVwKSkge1xuICAgICAgICAgICAgICAgICAgICBwc2V1ZG8gPSBwc2V1ZG8ud2l0aChkb3VibGVTdGVwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQodGhpcy5lcFNxdWFyZSkgJiYgdGhpcy5jYW5DYXB0dXJlRXAoc3F1YXJlLCBjdHgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGF3biA9IHRoaXMuZXBTcXVhcmUgLSBkZWx0YTtcbiAgICAgICAgICAgICAgICBpZiAoY3R4LmNoZWNrZXJzLmlzRW1wdHkoKSB8fCBjdHguY2hlY2tlcnMuc2luZ2xlU3F1YXJlKCkgPT09IHBhd24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGVnYWwgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZSh0aGlzLmVwU3F1YXJlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGllY2Uucm9sZSA9PT0gJ2Jpc2hvcCcpXG4gICAgICAgICAgICBwc2V1ZG8gPSBhdHRhY2tzXzEuYmlzaG9wQXR0YWNrcyhzcXVhcmUsIHRoaXMuYm9hcmQub2NjdXBpZWQpO1xuICAgICAgICBlbHNlIGlmIChwaWVjZS5yb2xlID09PSAna25pZ2h0JylcbiAgICAgICAgICAgIHBzZXVkbyA9IGF0dGFja3NfMS5rbmlnaHRBdHRhY2tzKHNxdWFyZSk7XG4gICAgICAgIGVsc2UgaWYgKHBpZWNlLnJvbGUgPT09ICdyb29rJylcbiAgICAgICAgICAgIHBzZXVkbyA9IGF0dGFja3NfMS5yb29rQXR0YWNrcyhzcXVhcmUsIHRoaXMuYm9hcmQub2NjdXBpZWQpO1xuICAgICAgICBlbHNlIGlmIChwaWVjZS5yb2xlID09PSAncXVlZW4nKVxuICAgICAgICAgICAgcHNldWRvID0gYXR0YWNrc18xLnF1ZWVuQXR0YWNrcyhzcXVhcmUsIHRoaXMuYm9hcmQub2NjdXBpZWQpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwc2V1ZG8gPSBhdHRhY2tzXzEua2luZ0F0dGFja3Moc3F1YXJlKTtcbiAgICAgICAgcHNldWRvID0gcHNldWRvLmRpZmYodGhpcy5ib2FyZFt0aGlzLnR1cm5dKTtcbiAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKGN0eC5raW5nKSkge1xuICAgICAgICAgICAgaWYgKHBpZWNlLnJvbGUgPT09ICdraW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9jYyA9IHRoaXMuYm9hcmQub2NjdXBpZWQud2l0aG91dChzcXVhcmUpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdG8gb2YgcHNldWRvKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmtpbmdBdHRhY2tlcnModG8sIHV0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pLCBvY2MpLm5vbkVtcHR5KCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBwc2V1ZG8gPSBwc2V1ZG8ud2l0aG91dCh0byk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwc2V1ZG8udW5pb24odGhpcy5jYXN0bGluZ0Rlc3QoJ2EnLCBjdHgpKS51bmlvbih0aGlzLmNhc3RsaW5nRGVzdCgnaCcsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN0eC5jaGVja2Vycy5ub25FbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tlciA9IGN0eC5jaGVja2Vycy5zaW5nbGVTcXVhcmUoKTtcbiAgICAgICAgICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKGNoZWNrZXIpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgcHNldWRvID0gcHNldWRvLmludGVyc2VjdChhdHRhY2tzXzEuYmV0d2VlbihjaGVja2VyLCBjdHgua2luZykud2l0aChjaGVja2VyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3R4LmJsb2NrZXJzLmhhcyhzcXVhcmUpKVxuICAgICAgICAgICAgICAgIHBzZXVkbyA9IHBzZXVkby5pbnRlcnNlY3QoYXR0YWNrc18xLnJheShzcXVhcmUsIGN0eC5raW5nKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlZ2FsKVxuICAgICAgICAgICAgcHNldWRvID0gcHNldWRvLnVuaW9uKGxlZ2FsKTtcbiAgICAgICAgcmV0dXJuIHBzZXVkbztcbiAgICB9XG4gICAgaXNWYXJpYW50RW5kKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhcmlhbnRPdXRjb21lKCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGhhc0luc3VmZmljaWVudE1hdGVyaWFsKGNvbG9yKSB7XG4gICAgICAgIGlmICh0aGlzLmJvYXJkW2NvbG9yXS5pbnRlcnNlY3QodGhpcy5ib2FyZC5wYXduLnVuaW9uKHRoaXMuYm9hcmQucm9va3NBbmRRdWVlbnMoKSkpLm5vbkVtcHR5KCkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmJvYXJkW2NvbG9yXS5pbnRlcnNlY3RzKHRoaXMuYm9hcmQua25pZ2h0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmRbY29sb3JdLnNpemUoKSA8PSAyICYmXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUoY29sb3IpXS5kaWZmKHRoaXMuYm9hcmQua2luZykuZGlmZih0aGlzLmJvYXJkLnF1ZWVuKS5pc0VtcHR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYm9hcmRbY29sb3JdLmludGVyc2VjdHModGhpcy5ib2FyZC5iaXNob3ApKSB7XG4gICAgICAgICAgICBjb25zdCBzYW1lQ29sb3IgPSAhdGhpcy5ib2FyZC5iaXNob3AuaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZGFya1NxdWFyZXMoKSkgfHxcbiAgICAgICAgICAgICAgICAhdGhpcy5ib2FyZC5iaXNob3AuaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQubGlnaHRTcXVhcmVzKCkpO1xuICAgICAgICAgICAgcmV0dXJuIHNhbWVDb2xvciAmJiB0aGlzLmJvYXJkW3V0aWxfMS5vcHBvc2l0ZShjb2xvcildLmRpZmYodGhpcy5ib2FyZC5raW5nKS5kaWZmKHRoaXMuYm9hcmQucm9vaykuZGlmZih0aGlzLmJvYXJkLnF1ZWVuKS5pc0VtcHR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuZXhwb3J0cy5DaGVzcyA9IENoZXNzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZXN1bHRfMSA9IHJlcXVpcmUoXCJAYmFkcmFwL3Jlc3VsdFwiKTtcbmNvbnN0IHR5cGVzXzEgPSByZXF1aXJlKFwiLi90eXBlc1wiKTtcbmNvbnN0IHNxdWFyZVNldF8xID0gcmVxdWlyZShcIi4vc3F1YXJlU2V0XCIpO1xuY29uc3QgYm9hcmRfMSA9IHJlcXVpcmUoXCIuL2JvYXJkXCIpO1xuY29uc3Qgc2V0dXBfMSA9IHJlcXVpcmUoXCIuL3NldHVwXCIpO1xuY29uc3QgdXRpbF8xID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbmV4cG9ydHMuSU5JVElBTF9CT0FSRF9GRU4gPSAncm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUic7XG5leHBvcnRzLklOSVRJQUxfRVBEID0gZXhwb3J0cy5JTklUSUFMX0JPQVJEX0ZFTiArICcgdyBLUWtxIC0nO1xuZXhwb3J0cy5JTklUSUFMX0ZFTiA9IGV4cG9ydHMuSU5JVElBTF9FUEQgKyAnIDAgMSc7XG5leHBvcnRzLkVNUFRZX0JPQVJEX0ZFTiA9ICc4LzgvOC84LzgvOC84LzgnO1xuZXhwb3J0cy5FTVBUWV9FUEQgPSBleHBvcnRzLkVNUFRZX0JPQVJEX0ZFTiArICcgdyAtIC0nO1xuZXhwb3J0cy5FTVBUWV9GRU4gPSBleHBvcnRzLkVNUFRZX0VQRCArICcgMCAxJztcbnZhciBJbnZhbGlkRmVuO1xuKGZ1bmN0aW9uIChJbnZhbGlkRmVuKSB7XG4gICAgSW52YWxpZEZlbltcIkZlblwiXSA9IFwiRVJSX0ZFTlwiO1xuICAgIEludmFsaWRGZW5bXCJCb2FyZFwiXSA9IFwiRVJSX0JPQVJEXCI7XG4gICAgSW52YWxpZEZlbltcIlBvY2tldHNcIl0gPSBcIkVSUl9QT0NLRVRTXCI7XG4gICAgSW52YWxpZEZlbltcIlR1cm5cIl0gPSBcIkVSUl9UVVJOXCI7XG4gICAgSW52YWxpZEZlbltcIkNhc3RsaW5nXCJdID0gXCJFUlJfQ0FTVExJTkdcIjtcbiAgICBJbnZhbGlkRmVuW1wiRXBTcXVhcmVcIl0gPSBcIkVSUl9FUF9TUVVBUkVcIjtcbiAgICBJbnZhbGlkRmVuW1wiUmVtYWluaW5nQ2hlY2tzXCJdID0gXCJFUlJfUkVNQUlOSU5HX0NIRUNLU1wiO1xuICAgIEludmFsaWRGZW5bXCJIYWxmbW92ZXNcIl0gPSBcIkVSUl9IQUxGTU9WRVNcIjtcbiAgICBJbnZhbGlkRmVuW1wiRnVsbG1vdmVzXCJdID0gXCJFUlJfRlVMTE1PVkVTXCI7XG59KShJbnZhbGlkRmVuID0gZXhwb3J0cy5JbnZhbGlkRmVuIHx8IChleHBvcnRzLkludmFsaWRGZW4gPSB7fSkpO1xuY2xhc3MgRmVuRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG59XG5leHBvcnRzLkZlbkVycm9yID0gRmVuRXJyb3I7XG5mdW5jdGlvbiBudGhJbmRleE9mKGhheXN0YWNrLCBuZWVkbGUsIG4pIHtcbiAgICBsZXQgaW5kZXggPSBoYXlzdGFjay5pbmRleE9mKG5lZWRsZSk7XG4gICAgd2hpbGUgKG4tLSA+IDApIHtcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSlcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBpbmRleCA9IGhheXN0YWNrLmluZGV4T2YobmVlZGxlLCBpbmRleCArIG5lZWRsZS5sZW5ndGgpO1xuICAgIH1cbiAgICByZXR1cm4gaW5kZXg7XG59XG5mdW5jdGlvbiBwYXJzZVNtYWxsVWludChzdHIpIHtcbiAgICByZXR1cm4gL15cXGR7MSw0fSQvLnRlc3Qoc3RyKSA/IHBhcnNlSW50KHN0ciwgMTApIDogdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY2hhclRvUGllY2UoY2gpIHtcbiAgICBjb25zdCByb2xlID0gdXRpbF8xLmNoYXJUb1JvbGUoY2gpO1xuICAgIHJldHVybiByb2xlICYmIHsgcm9sZSwgY29sb3I6IGNoLnRvTG93ZXJDYXNlKCkgPT09IGNoID8gJ2JsYWNrJyA6ICd3aGl0ZScgfTtcbn1cbmZ1bmN0aW9uIHBhcnNlQm9hcmRGZW4oYm9hcmRQYXJ0KSB7XG4gICAgY29uc3QgYm9hcmQgPSBib2FyZF8xLkJvYXJkLmVtcHR5KCk7XG4gICAgbGV0IHJhbmsgPSA3O1xuICAgIGxldCBmaWxlID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJvYXJkUGFydC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjID0gYm9hcmRQYXJ0W2ldO1xuICAgICAgICBpZiAoYyA9PT0gJy8nICYmIGZpbGUgPT09IDgpIHtcbiAgICAgICAgICAgIGZpbGUgPSAwO1xuICAgICAgICAgICAgcmFuay0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RlcCA9IHBhcnNlSW50KGMsIDEwKTtcbiAgICAgICAgICAgIGlmIChzdGVwKVxuICAgICAgICAgICAgICAgIGZpbGUgKz0gc3RlcDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlID49IDggfHwgcmFuayA8IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLkJvYXJkKSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3F1YXJlID0gZmlsZSArIHJhbmsgKiA4O1xuICAgICAgICAgICAgICAgIGNvbnN0IHBpZWNlID0gY2hhclRvUGllY2UoYyk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uQm9hcmQpKTtcbiAgICAgICAgICAgICAgICBpZiAoYm9hcmRQYXJ0W2kgKyAxXSA9PT0gJ34nKSB7XG4gICAgICAgICAgICAgICAgICAgIHBpZWNlLnByb21vdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBib2FyZC5zZXQoc3F1YXJlLCBwaWVjZSk7XG4gICAgICAgICAgICAgICAgZmlsZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChyYW5rICE9PSAwIHx8IGZpbGUgIT09IDgpXG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLkJvYXJkKSk7XG4gICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayhib2FyZCk7XG59XG5leHBvcnRzLnBhcnNlQm9hcmRGZW4gPSBwYXJzZUJvYXJkRmVuO1xuZnVuY3Rpb24gcGFyc2VQb2NrZXRzKHBvY2tldFBhcnQpIHtcbiAgICBpZiAocG9ja2V0UGFydC5sZW5ndGggPiA2NClcbiAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uUG9ja2V0cykpO1xuICAgIGNvbnN0IHBvY2tldHMgPSBzZXR1cF8xLk1hdGVyaWFsLmVtcHR5KCk7XG4gICAgZm9yIChjb25zdCBjIG9mIHBvY2tldFBhcnQpIHtcbiAgICAgICAgY29uc3QgcGllY2UgPSBjaGFyVG9QaWVjZShjKTtcbiAgICAgICAgaWYgKCFwaWVjZSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLlBvY2tldHMpKTtcbiAgICAgICAgcG9ja2V0c1twaWVjZS5jb2xvcl1bcGllY2Uucm9sZV0rKztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayhwb2NrZXRzKTtcbn1cbmV4cG9ydHMucGFyc2VQb2NrZXRzID0gcGFyc2VQb2NrZXRzO1xuZnVuY3Rpb24gcGFyc2VDYXN0bGluZ0Zlbihib2FyZCwgY2FzdGxpbmdQYXJ0KSB7XG4gICAgbGV0IHVubW92ZWRSb29rcyA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgIGlmIChjYXN0bGluZ1BhcnQgPT09ICctJylcbiAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayh1bm1vdmVkUm9va3MpO1xuICAgIGlmICghL15bS1FBQkNERUZHSF17MCwyfVtrcWFiY2RlZmdoXXswLDJ9JC8udGVzdChjYXN0bGluZ1BhcnQpKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLkNhc3RsaW5nKSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgYyBvZiBjYXN0bGluZ1BhcnQpIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBjLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gYyA9PT0gbG93ZXIgPyAnYmxhY2snIDogJ3doaXRlJztcbiAgICAgICAgY29uc3QgYmFja3JhbmsgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuYmFja3JhbmsoY29sb3IpLmludGVyc2VjdChib2FyZFtjb2xvcl0pO1xuICAgICAgICBsZXQgY2FuZGlkYXRlcztcbiAgICAgICAgaWYgKGxvd2VyID09PSAncScpXG4gICAgICAgICAgICBjYW5kaWRhdGVzID0gYmFja3Jhbms7XG4gICAgICAgIGVsc2UgaWYgKGxvd2VyID09PSAnaycpXG4gICAgICAgICAgICBjYW5kaWRhdGVzID0gYmFja3JhbmsucmV2ZXJzZWQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2FuZGlkYXRlcyA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKGxvd2VyLmNoYXJDb2RlQXQoMCkgLSAnYScuY2hhckNvZGVBdCgwKSkuaW50ZXJzZWN0KGJhY2tyYW5rKTtcbiAgICAgICAgZm9yIChjb25zdCBzcXVhcmUgb2YgY2FuZGlkYXRlcykge1xuICAgICAgICAgICAgaWYgKGJvYXJkLmtpbmcuaGFzKHNxdWFyZSkgJiYgIWJvYXJkLnByb21vdGVkLmhhcyhzcXVhcmUpKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgaWYgKGJvYXJkLnJvb2suaGFzKHNxdWFyZSkpIHtcbiAgICAgICAgICAgICAgICB1bm1vdmVkUm9va3MgPSB1bm1vdmVkUm9va3Mud2l0aChzcXVhcmUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2sodW5tb3ZlZFJvb2tzKTtcbn1cbmV4cG9ydHMucGFyc2VDYXN0bGluZ0ZlbiA9IHBhcnNlQ2FzdGxpbmdGZW47XG5mdW5jdGlvbiBwYXJzZVJlbWFpbmluZ0NoZWNrcyhwYXJ0KSB7XG4gICAgY29uc3QgcGFydHMgPSBwYXJ0LnNwbGl0KCcrJyk7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMyAmJiBwYXJ0c1swXSA9PT0gJycpIHtcbiAgICAgICAgY29uc3Qgd2hpdGUgPSBwYXJzZVNtYWxsVWludChwYXJ0c1sxXSk7XG4gICAgICAgIGNvbnN0IGJsYWNrID0gcGFyc2VTbWFsbFVpbnQocGFydHNbMl0pO1xuICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKHdoaXRlKSB8fCB3aGl0ZSA+IDMgfHwgIXV0aWxfMS5kZWZpbmVkKGJsYWNrKSB8fCBibGFjayA+IDMpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5SZW1haW5pbmdDaGVja3MpKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayhuZXcgc2V0dXBfMS5SZW1haW5pbmdDaGVja3MoMyAtIHdoaXRlLCAzIC0gYmxhY2spKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGNvbnN0IHdoaXRlID0gcGFyc2VTbWFsbFVpbnQocGFydHNbMF0pO1xuICAgICAgICBjb25zdCBibGFjayA9IHBhcnNlU21hbGxVaW50KHBhcnRzWzFdKTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZCh3aGl0ZSkgfHwgd2hpdGUgPiAzIHx8ICF1dGlsXzEuZGVmaW5lZChibGFjaykgfHwgYmxhY2sgPiAzKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uUmVtYWluaW5nQ2hlY2tzKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2sobmV3IHNldHVwXzEuUmVtYWluaW5nQ2hlY2tzKHdoaXRlLCBibGFjaykpO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLlJlbWFpbmluZ0NoZWNrcykpO1xufVxuZXhwb3J0cy5wYXJzZVJlbWFpbmluZ0NoZWNrcyA9IHBhcnNlUmVtYWluaW5nQ2hlY2tzO1xuZnVuY3Rpb24gcGFyc2VGZW4oZmVuKSB7XG4gICAgY29uc3QgcGFydHMgPSBmZW4uc3BsaXQoJyAnKTtcbiAgICBjb25zdCBib2FyZFBhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIC8vIEJvYXJkIGFuZCBwb2NrZXRzXG4gICAgbGV0IGJvYXJkLCBwb2NrZXRzID0gcmVzdWx0XzEuUmVzdWx0Lm9rKHVuZGVmaW5lZCk7XG4gICAgaWYgKGJvYXJkUGFydC5lbmRzV2l0aCgnXScpKSB7XG4gICAgICAgIGNvbnN0IHBvY2tldFN0YXJ0ID0gYm9hcmRQYXJ0LmluZGV4T2YoJ1snKTtcbiAgICAgICAgaWYgKHBvY2tldFN0YXJ0ID09PSAtMSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLkZlbikpO1xuICAgICAgICBib2FyZCA9IHBhcnNlQm9hcmRGZW4oYm9hcmRQYXJ0LnN1YnN0cigwLCBwb2NrZXRTdGFydCkpO1xuICAgICAgICBwb2NrZXRzID0gcGFyc2VQb2NrZXRzKGJvYXJkUGFydC5zdWJzdHIocG9ja2V0U3RhcnQgKyAxLCBib2FyZFBhcnQubGVuZ3RoIC0gMSAtIHBvY2tldFN0YXJ0IC0gMSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcG9ja2V0U3RhcnQgPSBudGhJbmRleE9mKGJvYXJkUGFydCwgJy8nLCA3KTtcbiAgICAgICAgaWYgKHBvY2tldFN0YXJ0ID09PSAtMSlcbiAgICAgICAgICAgIGJvYXJkID0gcGFyc2VCb2FyZEZlbihib2FyZFBhcnQpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJvYXJkID0gcGFyc2VCb2FyZEZlbihib2FyZFBhcnQuc3Vic3RyKDAsIHBvY2tldFN0YXJ0KSk7XG4gICAgICAgICAgICBwb2NrZXRzID0gcGFyc2VQb2NrZXRzKGJvYXJkUGFydC5zdWJzdHIocG9ja2V0U3RhcnQgKyAxKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gVHVyblxuICAgIGxldCB0dXJuO1xuICAgIGNvbnN0IHR1cm5QYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKHR1cm5QYXJ0KSB8fCB0dXJuUGFydCA9PT0gJ3cnKVxuICAgICAgICB0dXJuID0gJ3doaXRlJztcbiAgICBlbHNlIGlmICh0dXJuUGFydCA9PT0gJ2InKVxuICAgICAgICB0dXJuID0gJ2JsYWNrJztcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLlR1cm4pKTtcbiAgICByZXR1cm4gYm9hcmQuY2hhaW4oYm9hcmQgPT4ge1xuICAgICAgICAvLyBDYXN0bGluZ1xuICAgICAgICBjb25zdCBjYXN0bGluZ1BhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICBjb25zdCB1bm1vdmVkUm9va3MgPSB1dGlsXzEuZGVmaW5lZChjYXN0bGluZ1BhcnQpID8gcGFyc2VDYXN0bGluZ0Zlbihib2FyZCwgY2FzdGxpbmdQYXJ0KSA6IHJlc3VsdF8xLlJlc3VsdC5vayhzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKSk7XG4gICAgICAgIC8vIEVuIHBhc3NhbnQgc3F1YXJlXG4gICAgICAgIGNvbnN0IGVwUGFydCA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgIGxldCBlcFNxdWFyZTtcbiAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKGVwUGFydCkgJiYgZXBQYXJ0ICE9PSAnLScpIHtcbiAgICAgICAgICAgIGVwU3F1YXJlID0gdXRpbF8xLnBhcnNlU3F1YXJlKGVwUGFydCk7XG4gICAgICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKGVwU3F1YXJlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5FcFNxdWFyZSkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEhhbGZtb3ZlcyBvciByZW1haW5pbmcgY2hlY2tzXG4gICAgICAgIGxldCBoYWxmbW92ZVBhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICBsZXQgZWFybHlSZW1haW5pbmdDaGVja3M7XG4gICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChoYWxmbW92ZVBhcnQpICYmIGhhbGZtb3ZlUGFydC5pbmNsdWRlcygnKycpKSB7XG4gICAgICAgICAgICBlYXJseVJlbWFpbmluZ0NoZWNrcyA9IHBhcnNlUmVtYWluaW5nQ2hlY2tzKGhhbGZtb3ZlUGFydCk7XG4gICAgICAgICAgICBoYWxmbW92ZVBhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhhbGZtb3ZlcyA9IHV0aWxfMS5kZWZpbmVkKGhhbGZtb3ZlUGFydCkgPyBwYXJzZVNtYWxsVWludChoYWxmbW92ZVBhcnQpIDogMDtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChoYWxmbW92ZXMpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uSGFsZm1vdmVzKSk7XG4gICAgICAgIGNvbnN0IGZ1bGxtb3Zlc1BhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICBjb25zdCBmdWxsbW92ZXMgPSB1dGlsXzEuZGVmaW5lZChmdWxsbW92ZXNQYXJ0KSA/IHBhcnNlU21hbGxVaW50KGZ1bGxtb3Zlc1BhcnQpIDogMTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChmdWxsbW92ZXMpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uRnVsbG1vdmVzKSk7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ0NoZWNrc1BhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICBsZXQgcmVtYWluaW5nQ2hlY2tzID0gcmVzdWx0XzEuUmVzdWx0Lm9rKHVuZGVmaW5lZCk7XG4gICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChyZW1haW5pbmdDaGVja3NQYXJ0KSkge1xuICAgICAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKGVhcmx5UmVtYWluaW5nQ2hlY2tzKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5SZW1haW5pbmdDaGVja3MpKTtcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoZWNrcyA9IHBhcnNlUmVtYWluaW5nQ2hlY2tzKHJlbWFpbmluZ0NoZWNrc1BhcnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHV0aWxfMS5kZWZpbmVkKGVhcmx5UmVtYWluaW5nQ2hlY2tzKSkge1xuICAgICAgICAgICAgcmVtYWluaW5nQ2hlY2tzID0gZWFybHlSZW1haW5pbmdDaGVja3M7XG4gICAgICAgIH1cbiAgICAgICAgO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uRmVuKSk7XG4gICAgICAgIHJldHVybiBwb2NrZXRzLmNoYWluKHBvY2tldHMgPT4gdW5tb3ZlZFJvb2tzLmNoYWluKHVubW92ZWRSb29rcyA9PiByZW1haW5pbmdDaGVja3MubWFwKHJlbWFpbmluZ0NoZWNrcyA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJvYXJkLFxuICAgICAgICAgICAgICAgIHBvY2tldHMsXG4gICAgICAgICAgICAgICAgdHVybixcbiAgICAgICAgICAgICAgICB1bm1vdmVkUm9va3MsXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nQ2hlY2tzLFxuICAgICAgICAgICAgICAgIGVwU3F1YXJlLFxuICAgICAgICAgICAgICAgIGhhbGZtb3ZlcyxcbiAgICAgICAgICAgICAgICBmdWxsbW92ZXM6IE1hdGgubWF4KDEsIGZ1bGxtb3ZlcylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKSk7XG4gICAgfSk7XG59XG5leHBvcnRzLnBhcnNlRmVuID0gcGFyc2VGZW47XG5mdW5jdGlvbiBwYXJzZVBpZWNlKHN0cikge1xuICAgIGlmICghc3RyKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgcGllY2UgPSBjaGFyVG9QaWVjZShzdHJbMF0pO1xuICAgIGlmICghcGllY2UpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAoc3RyLmxlbmd0aCA9PT0gMiAmJiBzdHJbMV0gPT09ICd+JylcbiAgICAgICAgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgIGVsc2UgaWYgKHN0ci5sZW5ndGggPiAxKVxuICAgICAgICByZXR1cm47XG4gICAgcmV0dXJuIHBpZWNlO1xufVxuZXhwb3J0cy5wYXJzZVBpZWNlID0gcGFyc2VQaWVjZTtcbmZ1bmN0aW9uIG1ha2VQaWVjZShwaWVjZSwgb3B0cykge1xuICAgIGxldCByID0gdXRpbF8xLnJvbGVUb0NoYXIocGllY2Uucm9sZSk7XG4gICAgaWYgKHBpZWNlLmNvbG9yID09PSAnd2hpdGUnKVxuICAgICAgICByID0gci50b1VwcGVyQ2FzZSgpO1xuICAgIGlmIChvcHRzICYmIG9wdHMucHJvbW90ZWQgJiYgcGllY2UucHJvbW90ZWQpXG4gICAgICAgIHIgKz0gJ34nO1xuICAgIHJldHVybiByO1xufVxuZXhwb3J0cy5tYWtlUGllY2UgPSBtYWtlUGllY2U7XG5mdW5jdGlvbiBtYWtlQm9hcmRGZW4oYm9hcmQsIG9wdHMpIHtcbiAgICBsZXQgZmVuID0gJyc7XG4gICAgbGV0IGVtcHR5ID0gMDtcbiAgICBmb3IgKGxldCByYW5rID0gNzsgcmFuayA+PSAwOyByYW5rLS0pIHtcbiAgICAgICAgZm9yIChsZXQgZmlsZSA9IDA7IGZpbGUgPCA4OyBmaWxlKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHNxdWFyZSA9IGZpbGUgKyByYW5rICogODtcbiAgICAgICAgICAgIGNvbnN0IHBpZWNlID0gYm9hcmQuZ2V0KHNxdWFyZSk7XG4gICAgICAgICAgICBpZiAoIXBpZWNlKVxuICAgICAgICAgICAgICAgIGVtcHR5Kys7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZW1wdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmVuICs9IGVtcHR5O1xuICAgICAgICAgICAgICAgICAgICBlbXB0eSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZlbiArPSBtYWtlUGllY2UocGllY2UsIG9wdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbGUgPT09IDcpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW1wdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmVuICs9IGVtcHR5O1xuICAgICAgICAgICAgICAgICAgICBlbXB0eSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyYW5rICE9PSAwKVxuICAgICAgICAgICAgICAgICAgICBmZW4gKz0gJy8nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmZW47XG59XG5leHBvcnRzLm1ha2VCb2FyZEZlbiA9IG1ha2VCb2FyZEZlbjtcbmZ1bmN0aW9uIG1ha2VQb2NrZXQobWF0ZXJpYWwpIHtcbiAgICByZXR1cm4gdHlwZXNfMS5ST0xFUy5tYXAocm9sZSA9PiB1dGlsXzEucm9sZVRvQ2hhcihyb2xlKS5yZXBlYXQobWF0ZXJpYWxbcm9sZV0pKS5qb2luKCcnKTtcbn1cbmZ1bmN0aW9uIG1ha2VQb2NrZXRzKHBvY2tldCkge1xuICAgIHJldHVybiBtYWtlUG9ja2V0KHBvY2tldC53aGl0ZSkudG9VcHBlckNhc2UoKSArIG1ha2VQb2NrZXQocG9ja2V0LmJsYWNrKTtcbn1cbmV4cG9ydHMubWFrZVBvY2tldHMgPSBtYWtlUG9ja2V0cztcbmZ1bmN0aW9uIG1ha2VDYXN0bGluZ0Zlbihib2FyZCwgdW5tb3ZlZFJvb2tzLCBvcHRzKSB7XG4gICAgY29uc3Qgc2hyZWRkZXIgPSBvcHRzICYmIG9wdHMuc2hyZWRkZXI7XG4gICAgbGV0IGZlbiA9ICcnO1xuICAgIGZvciAoY29uc3QgY29sb3Igb2YgdHlwZXNfMS5DT0xPUlMpIHtcbiAgICAgICAgY29uc3QgYmFja3JhbmsgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuYmFja3JhbmsoY29sb3IpO1xuICAgICAgICBjb25zdCBraW5nID0gYm9hcmQua2luZ09mKGNvbG9yKTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChraW5nKSB8fCAhYmFja3JhbmsuaGFzKGtpbmcpKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBib2FyZC5waWVjZXMoY29sb3IsICdyb29rJykuaW50ZXJzZWN0KGJhY2tyYW5rKTtcbiAgICAgICAgZm9yIChjb25zdCByb29rIG9mIHVubW92ZWRSb29rcy5pbnRlcnNlY3QoY2FuZGlkYXRlcykucmV2ZXJzZWQoKSkge1xuICAgICAgICAgICAgaWYgKCFzaHJlZGRlciAmJiByb29rID09PSBjYW5kaWRhdGVzLmZpcnN0KCkgJiYgcm9vayA8IGtpbmcpIHtcbiAgICAgICAgICAgICAgICBmZW4gKz0gY29sb3IgPT09ICd3aGl0ZScgPyAnUScgOiAncSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghc2hyZWRkZXIgJiYgcm9vayA9PT0gY2FuZGlkYXRlcy5sYXN0KCkgJiYga2luZyA8IHJvb2spIHtcbiAgICAgICAgICAgICAgICBmZW4gKz0gY29sb3IgPT09ICd3aGl0ZScgPyAnSycgOiAnayc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmZW4gKz0gKGNvbG9yID09PSAnd2hpdGUnID8gJ0FCQ0RFRkdIJyA6ICdhYmNkZWZnaCcpW3Jvb2sgJiAweDddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmZW4gfHwgJy0nO1xufVxuZXhwb3J0cy5tYWtlQ2FzdGxpbmdGZW4gPSBtYWtlQ2FzdGxpbmdGZW47XG5mdW5jdGlvbiBtYWtlUmVtYWluaW5nQ2hlY2tzKGNoZWNrcykge1xuICAgIHJldHVybiBgJHtjaGVja3Mud2hpdGV9KyR7Y2hlY2tzLmJsYWNrfWA7XG59XG5leHBvcnRzLm1ha2VSZW1haW5pbmdDaGVja3MgPSBtYWtlUmVtYWluaW5nQ2hlY2tzO1xuZnVuY3Rpb24gbWFrZUZlbihzZXR1cCwgb3B0cykge1xuICAgIHJldHVybiBbXG4gICAgICAgIG1ha2VCb2FyZEZlbihzZXR1cC5ib2FyZCwgb3B0cykgKyAoc2V0dXAucG9ja2V0cyA/IGBbJHttYWtlUG9ja2V0cyhzZXR1cC5wb2NrZXRzKX1dYCA6ICcnKSxcbiAgICAgICAgc2V0dXAudHVyblswXSxcbiAgICAgICAgbWFrZUNhc3RsaW5nRmVuKHNldHVwLmJvYXJkLCBzZXR1cC51bm1vdmVkUm9va3MsIG9wdHMpLFxuICAgICAgICB1dGlsXzEuZGVmaW5lZChzZXR1cC5lcFNxdWFyZSkgPyB1dGlsXzEubWFrZVNxdWFyZShzZXR1cC5lcFNxdWFyZSkgOiAnLScsXG4gICAgICAgIC4uLihzZXR1cC5yZW1haW5pbmdDaGVja3MgPyBbbWFrZVJlbWFpbmluZ0NoZWNrcyhzZXR1cC5yZW1haW5pbmdDaGVja3MpXSA6IFtdKSxcbiAgICAgICAgLi4uKG9wdHMgJiYgb3B0cy5lcGQgPyBbXSA6IFtzZXR1cC5oYWxmbW92ZXMsIHNldHVwLmZ1bGxtb3Zlc10pXG4gICAgXS5qb2luKCcgJyk7XG59XG5leHBvcnRzLm1ha2VGZW4gPSBtYWtlRmVuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0eXBlc18xID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XG5jb25zdCB1dGlsXzEgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuY29uc3Qgc3F1YXJlU2V0XzEgPSByZXF1aXJlKFwiLi9zcXVhcmVTZXRcIik7XG5jb25zdCBhdHRhY2tzXzEgPSByZXF1aXJlKFwiLi9hdHRhY2tzXCIpO1xuZnVuY3Rpb24gbWFrZVNhbldpdGhvdXRTdWZmaXgocG9zLCB1Y2kpIHtcbiAgICBsZXQgc2FuID0gJyc7XG4gICAgaWYgKHR5cGVzXzEuaXNEcm9wKHVjaSkpIHtcbiAgICAgICAgaWYgKHVjaS5yb2xlICE9PSAncGF3bicpXG4gICAgICAgICAgICBzYW4gPSB1dGlsXzEucm9sZVRvQ2hhcih1Y2kucm9sZSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgc2FuICs9ICdAJyArIHV0aWxfMS5tYWtlU3F1YXJlKHVjaS50byk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCByb2xlID0gcG9zLmJvYXJkLmdldFJvbGUodWNpLmZyb20pO1xuICAgICAgICBpZiAoIXJvbGUpXG4gICAgICAgICAgICByZXR1cm4gJy0tJztcbiAgICAgICAgaWYgKHJvbGUgPT09ICdraW5nJyAmJiAocG9zLmJvYXJkW3Bvcy50dXJuXS5oYXModWNpLnRvKSB8fCBNYXRoLmFicyh1Y2kudG8gLSB1Y2kuZnJvbSkgPT09IDIpKSB7XG4gICAgICAgICAgICBzYW4gPSB1Y2kudG8gPiB1Y2kuZnJvbSA/ICdPLU8nIDogJ08tTy1PJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGNhcHR1cmUgPSBwb3MuYm9hcmQub2NjdXBpZWQuaGFzKHVjaS50bykgfHwgKHJvbGUgPT09ICdwYXduJyAmJiAodWNpLmZyb20gJiAweDcpICE9PSAodWNpLnRvICYgMHg3KSk7XG4gICAgICAgICAgICBpZiAocm9sZSAhPT0gJ3Bhd24nKSB7XG4gICAgICAgICAgICAgICAgc2FuID0gdXRpbF8xLnJvbGVUb0NoYXIocm9sZSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAvLyBEaXNhbWJpZ3VhdGlvblxuICAgICAgICAgICAgICAgIGxldCBvdGhlcnM7XG4gICAgICAgICAgICAgICAgaWYgKHJvbGUgPT09ICdraW5nJylcbiAgICAgICAgICAgICAgICAgICAgb3RoZXJzID0gYXR0YWNrc18xLmtpbmdBdHRhY2tzKHVjaS50bykuaW50ZXJzZWN0KHBvcy5ib2FyZC5raW5nKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyb2xlID09PSAncXVlZW4nKVxuICAgICAgICAgICAgICAgICAgICBvdGhlcnMgPSBhdHRhY2tzXzEucXVlZW5BdHRhY2tzKHVjaS50bywgcG9zLmJvYXJkLm9jY3VwaWVkKS5pbnRlcnNlY3QocG9zLmJvYXJkLnF1ZWVuKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyb2xlID09PSAncm9vaycpXG4gICAgICAgICAgICAgICAgICAgIG90aGVycyA9IGF0dGFja3NfMS5yb29rQXR0YWNrcyh1Y2kudG8sIHBvcy5ib2FyZC5vY2N1cGllZCkuaW50ZXJzZWN0KHBvcy5ib2FyZC5yb29rKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyb2xlID09PSAnYmlzaG9wJylcbiAgICAgICAgICAgICAgICAgICAgb3RoZXJzID0gYXR0YWNrc18xLmJpc2hvcEF0dGFja3ModWNpLnRvLCBwb3MuYm9hcmQub2NjdXBpZWQpLmludGVyc2VjdChwb3MuYm9hcmQuYmlzaG9wKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG90aGVycyA9IGF0dGFja3NfMS5rbmlnaHRBdHRhY2tzKHVjaS50bykuaW50ZXJzZWN0KHBvcy5ib2FyZC5rbmlnaHQpO1xuICAgICAgICAgICAgICAgIG90aGVycyA9IG90aGVycy5pbnRlcnNlY3QocG9zLmJvYXJkW3Bvcy50dXJuXSkud2l0aG91dCh1Y2kuZnJvbSk7XG4gICAgICAgICAgICAgICAgaWYgKG90aGVycy5ub25FbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IHBvcy5jdHgoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmcm9tIG9mIG90aGVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwb3MuZGVzdHMoZnJvbSwgY3R4KS5oYXModWNpLnRvKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlcnMgPSBvdGhlcnMud2l0aG91dChmcm9tKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3RoZXJzLm5vbkVtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW4gPSBvdGhlcnMuaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVJhbmsodWNpLmZyb20gPj4gMykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVycy5pbnRlcnNlY3RzKHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tRmlsZSh1Y2kuZnJvbSAmIDB4NykpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2x1bW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FuICs9ICdhYmNkZWZnaCdbdWNpLmZyb20gJiAweDddO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYW4gKz0gJzEyMzQ1Njc4J1t1Y2kuZnJvbSA+PiAzXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNhcHR1cmUpXG4gICAgICAgICAgICAgICAgc2FuID0gJ2FiY2RlZmdoJ1t1Y2kuZnJvbSAmIDB4N107XG4gICAgICAgICAgICBpZiAoY2FwdHVyZSlcbiAgICAgICAgICAgICAgICBzYW4gKz0gJ3gnO1xuICAgICAgICAgICAgc2FuICs9IHV0aWxfMS5tYWtlU3F1YXJlKHVjaS50byk7XG4gICAgICAgICAgICBpZiAodWNpLnByb21vdGlvbilcbiAgICAgICAgICAgICAgICBzYW4gKz0gJz0nICsgdXRpbF8xLnJvbGVUb0NoYXIodWNpLnByb21vdGlvbikudG9VcHBlckNhc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2FuO1xufVxuZnVuY3Rpb24gbWFrZVNhbkFuZFBsYXkocG9zLCB1Y2kpIHtcbiAgICBjb25zdCBzYW4gPSBtYWtlU2FuV2l0aG91dFN1ZmZpeChwb3MsIHVjaSk7XG4gICAgcG9zLnBsYXkodWNpKTtcbiAgICBjb25zdCBvdXRjb21lID0gcG9zLm91dGNvbWUoKTtcbiAgICBpZiAob3V0Y29tZSAmJiBvdXRjb21lLndpbm5lcilcbiAgICAgICAgcmV0dXJuIHNhbiArICcjJztcbiAgICBlbHNlIGlmIChwb3MuaXNDaGVjaygpKVxuICAgICAgICByZXR1cm4gc2FuICsgJysnO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHNhbjtcbn1cbmV4cG9ydHMubWFrZVNhbkFuZFBsYXkgPSBtYWtlU2FuQW5kUGxheTtcbmZ1bmN0aW9uIG1ha2VTYW5WYXJpYXRpb24ocG9zLCB2YXJpYXRpb24pIHtcbiAgICBwb3MgPSBwb3MuY2xvbmUoKTtcbiAgICBsZXQgbGluZSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFyaWF0aW9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpICE9PSAwKVxuICAgICAgICAgICAgbGluZSArPSAnICc7XG4gICAgICAgIGlmIChwb3MudHVybiA9PT0gJ3doaXRlJylcbiAgICAgICAgICAgIGxpbmUgKz0gcG9zLmZ1bGxtb3ZlcyArICcuICc7XG4gICAgICAgIGVsc2UgaWYgKGkgPT09IDApXG4gICAgICAgICAgICBsaW5lID0gcG9zLmZ1bGxtb3ZlcyArICcuLi4gJztcbiAgICAgICAgY29uc3Qgc2FuID0gbWFrZVNhbldpdGhvdXRTdWZmaXgocG9zLCB2YXJpYXRpb25baV0pO1xuICAgICAgICBwb3MucGxheSh2YXJpYXRpb25baV0pO1xuICAgICAgICBsaW5lICs9IHNhbjtcbiAgICAgICAgaWYgKHNhbiA9PT0gJy0tJylcbiAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICBsZXQgb3ZlciA9IGZhbHNlO1xuICAgICAgICBpZiAoaSA9PT0gdmFyaWF0aW9uLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGNvbnN0IG91dGNvbWUgPSBwb3Mub3V0Y29tZSgpO1xuICAgICAgICAgICAgb3ZlciA9ICEhKG91dGNvbWUgJiYgb3V0Y29tZS53aW5uZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdmVyKVxuICAgICAgICAgICAgbGluZSArPSAnIyc7XG4gICAgICAgIGVsc2UgaWYgKHBvcy5pc0NoZWNrKCkpXG4gICAgICAgICAgICBsaW5lICs9ICcrJztcbiAgICB9XG4gICAgcmV0dXJuIGxpbmU7XG59XG5leHBvcnRzLm1ha2VTYW5WYXJpYXRpb24gPSBtYWtlU2FuVmFyaWF0aW9uO1xuZnVuY3Rpb24gbWFrZVNhbihwb3MsIHVjaSkge1xuICAgIHJldHVybiBtYWtlU2FuQW5kUGxheShwb3MuY2xvbmUoKSwgdWNpKTtcbn1cbmV4cG9ydHMubWFrZVNhbiA9IG1ha2VTYW47XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHR5cGVzXzEgPSByZXF1aXJlKFwiLi90eXBlc1wiKTtcbmNvbnN0IHNxdWFyZVNldF8xID0gcmVxdWlyZShcIi4vc3F1YXJlU2V0XCIpO1xuY29uc3QgYm9hcmRfMSA9IHJlcXVpcmUoXCIuL2JvYXJkXCIpO1xuY2xhc3MgTWF0ZXJpYWxTaWRlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxuICAgIHN0YXRpYyBlbXB0eSgpIHtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBNYXRlcmlhbFNpZGUoKTtcbiAgICAgICAgZm9yIChjb25zdCByb2xlIG9mIHR5cGVzXzEuUk9MRVMpXG4gICAgICAgICAgICBtW3JvbGVdID0gMDtcbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBtID0gbmV3IE1hdGVyaWFsU2lkZSgpO1xuICAgICAgICBmb3IgKGNvbnN0IHJvbGUgb2YgdHlwZXNfMS5ST0xFUylcbiAgICAgICAgICAgIG1bcm9sZV0gPSB0aGlzW3JvbGVdO1xuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG4gICAgbm9uRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0eXBlc18xLlJPTEVTLnNvbWUocm9sZSA9PiB0aGlzW3JvbGVdID4gMCk7XG4gICAgfVxuICAgIGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5ub25FbXB0eSgpO1xuICAgIH1cbiAgICBoYXNQYXducygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF3biA+IDA7XG4gICAgfVxuICAgIGhhc05vblBhd25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5rbmlnaHQgPiAwIHx8IHRoaXMuYmlzaG9wID4gMCB8fCB0aGlzLnJvb2sgPiAwIHx8IHRoaXMucXVlZW4gPiAwIHx8IHRoaXMua2luZyA+IDA7XG4gICAgfVxuICAgIGNvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXduICsgdGhpcy5rbmlnaHQgKyB0aGlzLmJpc2hvcCArIHRoaXMucm9vayArIHRoaXMucXVlZW4gKyB0aGlzLmtpbmc7XG4gICAgfVxufVxuZXhwb3J0cy5NYXRlcmlhbFNpZGUgPSBNYXRlcmlhbFNpZGU7XG5jbGFzcyBNYXRlcmlhbCB7XG4gICAgY29uc3RydWN0b3Iod2hpdGUsIGJsYWNrKSB7XG4gICAgICAgIHRoaXMud2hpdGUgPSB3aGl0ZTtcbiAgICAgICAgdGhpcy5ibGFjayA9IGJsYWNrO1xuICAgIH1cbiAgICBzdGF0aWMgZW1wdHkoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTWF0ZXJpYWwoTWF0ZXJpYWxTaWRlLmVtcHR5KCksIE1hdGVyaWFsU2lkZS5lbXB0eSgpKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTWF0ZXJpYWwodGhpcy53aGl0ZS5jbG9uZSgpLCB0aGlzLmJsYWNrLmNsb25lKCkpO1xuICAgIH1cbiAgICBjb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2hpdGUuY291bnQoKSArIHRoaXMuYmxhY2suY291bnQoKTtcbiAgICB9XG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2hpdGUuaXNFbXB0eSgpICYmIHRoaXMuYmxhY2suaXNFbXB0eSgpO1xuICAgIH1cbiAgICBub25FbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzRW1wdHkoKTtcbiAgICB9XG4gICAgaGFzUGF3bnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndoaXRlLmhhc1Bhd25zKCkgfHwgdGhpcy5ibGFjay5oYXNQYXducygpO1xuICAgIH1cbiAgICBoYXNOb25QYXducygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2hpdGUuaGFzTm9uUGF3bnMoKSB8fCB0aGlzLmJsYWNrLmhhc05vblBhd25zKCk7XG4gICAgfVxufVxuZXhwb3J0cy5NYXRlcmlhbCA9IE1hdGVyaWFsO1xuY2xhc3MgUmVtYWluaW5nQ2hlY2tzIHtcbiAgICBjb25zdHJ1Y3Rvcih3aGl0ZSwgYmxhY2spIHtcbiAgICAgICAgdGhpcy53aGl0ZSA9IHdoaXRlO1xuICAgICAgICB0aGlzLmJsYWNrID0gYmxhY2s7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFJlbWFpbmluZ0NoZWNrcygzLCAzKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVtYWluaW5nQ2hlY2tzKHRoaXMud2hpdGUsIHRoaXMuYmxhY2spO1xuICAgIH1cbn1cbmV4cG9ydHMuUmVtYWluaW5nQ2hlY2tzID0gUmVtYWluaW5nQ2hlY2tzO1xuZnVuY3Rpb24gZGVmYXVsdFNldHVwKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGJvYXJkOiBib2FyZF8xLkJvYXJkLmRlZmF1bHQoKSxcbiAgICAgICAgcG9ja2V0czogdW5kZWZpbmVkLFxuICAgICAgICB0dXJuOiAnd2hpdGUnLFxuICAgICAgICB1bm1vdmVkUm9va3M6IHNxdWFyZVNldF8xLlNxdWFyZVNldC5jb3JuZXJzKCksXG4gICAgICAgIGVwU3F1YXJlOiB1bmRlZmluZWQsXG4gICAgICAgIHJlbWFpbmluZ0NoZWNrczogdW5kZWZpbmVkLFxuICAgICAgICBoYWxmbW92ZXM6IDAsXG4gICAgICAgIGZ1bGxtb3ZlczogMSxcbiAgICB9O1xufVxuZXhwb3J0cy5kZWZhdWx0U2V0dXAgPSBkZWZhdWx0U2V0dXA7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHBvcGNudDMyKG4pIHtcbiAgICBuID0gbiAtICgobiA+Pj4gMSkgJiAxNDMxNjU1NzY1KTtcbiAgICBuID0gKG4gJiA4NTg5OTM0NTkpICsgKChuID4+PiAyKSAmIDg1ODk5MzQ1OSk7XG4gICAgcmV0dXJuICgobiArIChuID4+PiA0KSAmIDI1MjY0NTEzNSkgKiAxNjg0MzAwOSkgPj4gMjQ7XG59XG5mdW5jdGlvbiBic3dhcDMyKG4pIHtcbiAgICBuID0gKG4gPj4+IDgpICYgMTY3MTE5MzUgfCAoKG4gJiAxNjcxMTkzNSkgPDwgOCk7XG4gICAgcmV0dXJuIChuID4+PiAxNikgJiAweGZmZmYgfCAoKG4gJiAweGZmZmYpIDw8IDE2KTtcbn1cbmZ1bmN0aW9uIHJiaXQzMihuKSB7XG4gICAgbiA9ICgobiA+Pj4gMSkgJiAxNDMxNjU1NzY1KSB8ICgobiAmIDE0MzE2NTU3NjUpIDw8IDEpO1xuICAgIG4gPSAoKG4gPj4+IDIpICYgODU4OTkzNDU5KSB8ICgobiAmIDg1ODk5MzQ1OSkgPDwgMik7XG4gICAgbiA9ICgobiA+Pj4gNCkgJiAyNTI2NDUxMzUpIHwgKChuICYgMjUyNjQ1MTM1KSA8PCA0KTtcbiAgICBuID0gKChuID4+PiA4KSAmIDE2NzExOTM1KSB8ICgobiAmIDE2NzExOTM1KSA8PCA4KTtcbiAgICBuID0gKChuID4+PiAxNikgJiA2NTUzNSkgfCAoKG4gJiA2NTUzNSkgPDwgMTYpO1xuICAgIHJldHVybiBuO1xufVxuY2xhc3MgU3F1YXJlU2V0IHtcbiAgICBjb25zdHJ1Y3RvcihsbywgaGkpIHtcbiAgICAgICAgdGhpcy5sbyA9IGxvO1xuICAgICAgICB0aGlzLmhpID0gaGk7XG4gICAgICAgIHRoaXMubG8gPSBsbyB8IDA7XG4gICAgICAgIHRoaXMuaGkgPSBoaSB8IDA7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tU3F1YXJlKHNxdWFyZSkge1xuICAgICAgICByZXR1cm4gc3F1YXJlID49IDMyID9cbiAgICAgICAgICAgIG5ldyBTcXVhcmVTZXQoMCwgMSA8PCAoc3F1YXJlIC0gMzIpKSA6XG4gICAgICAgICAgICBuZXcgU3F1YXJlU2V0KDEgPDwgc3F1YXJlLCAwKTtcbiAgICB9XG4gICAgc3RhdGljIGZyb21SYW5rKHJhbmspIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQoMHhmZiwgMCkuc2hsNjQoOCAqIHJhbmspO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbUZpbGUoZmlsZSkge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCgxNjg0MzAwOSA8PCBmaWxlLCAxNjg0MzAwOSA8PCBmaWxlKTtcbiAgICB9XG4gICAgc3RhdGljIGVtcHR5KCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCgwLCAwKTtcbiAgICB9XG4gICAgc3RhdGljIGZ1bGwoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KDQyOTQ5NjcyOTUsIDQyOTQ5NjcyOTUpO1xuICAgIH1cbiAgICBzdGF0aWMgY29ybmVycygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQoMHg4MSwgMjE2NDI2MDg2NCk7XG4gICAgfVxuICAgIHN0YXRpYyBjZW50ZXIoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KDQwMjY1MzE4NCwgMHgxOCk7XG4gICAgfVxuICAgIHN0YXRpYyBiYWNrcmFua3MoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KDB4ZmYsIDQyNzgxOTAwODApO1xuICAgIH1cbiAgICBzdGF0aWMgYmFja3JhbmsoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIGNvbG9yID09PSAnd2hpdGUnID8gbmV3IFNxdWFyZVNldCgweGZmLCAwKSA6IG5ldyBTcXVhcmVTZXQoMCwgNDI3ODE5MDA4MCk7XG4gICAgfVxuICAgIHN0YXRpYyBsaWdodFNxdWFyZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KDE0MzcyMjY0MTAsIDE0MzcyMjY0MTApO1xuICAgIH1cbiAgICBzdGF0aWMgZGFya1NxdWFyZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KDI4NTc3NDA4ODUsIDI4NTc3NDA4ODUpO1xuICAgIH1cbiAgICBjb21wbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCh+dGhpcy5sbywgfnRoaXMuaGkpO1xuICAgIH1cbiAgICB4b3Iob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQodGhpcy5sbyBeIG90aGVyLmxvLCB0aGlzLmhpIF4gb3RoZXIuaGkpO1xuICAgIH1cbiAgICB1bmlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCh0aGlzLmxvIHwgb3RoZXIubG8sIHRoaXMuaGkgfCBvdGhlci5oaSk7XG4gICAgfVxuICAgIGludGVyc2VjdChvdGhlcikge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCh0aGlzLmxvICYgb3RoZXIubG8sIHRoaXMuaGkgJiBvdGhlci5oaSk7XG4gICAgfVxuICAgIGRpZmYob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQodGhpcy5sbyAmIH5vdGhlci5sbywgdGhpcy5oaSAmIH5vdGhlci5oaSk7XG4gICAgfVxuICAgIGludGVyc2VjdHMob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJzZWN0KG90aGVyKS5ub25FbXB0eSgpO1xuICAgIH1cbiAgICBpc0Rpc2pvaW50KG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyc2VjdChvdGhlcikuaXNFbXB0eSgpO1xuICAgIH1cbiAgICBzdXBlcnNldE9mKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBvdGhlci5kaWZmKHRoaXMpLmlzRW1wdHkoKTtcbiAgICB9XG4gICAgc3Vic2V0T2Yob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlmZihvdGhlcikuaXNFbXB0eSgpO1xuICAgIH1cbiAgICBzaHI2NChzaGlmdCkge1xuICAgICAgICBpZiAoc2hpZnQgPj0gNjQpXG4gICAgICAgICAgICByZXR1cm4gU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGlmIChzaGlmdCA+PSAzMilcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KHRoaXMuaGkgPj4+IChzaGlmdCAtIDMyKSwgMCk7XG4gICAgICAgIGlmIChzaGlmdCA+IDApXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCgodGhpcy5sbyA+Pj4gc2hpZnQpIF4gKHRoaXMuaGkgPDwgKDMyIC0gc2hpZnQpKSwgdGhpcy5oaSA+Pj4gc2hpZnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgc2hsNjQoc2hpZnQpIHtcbiAgICAgICAgaWYgKHNoaWZ0ID49IDY0KVxuICAgICAgICAgICAgcmV0dXJuIFNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBpZiAoc2hpZnQgPj0gMzIpXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCgwLCB0aGlzLmxvIDw8IChzaGlmdCAtIDMyKSk7XG4gICAgICAgIGlmIChzaGlmdCA+IDApXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCh0aGlzLmxvIDw8IHNoaWZ0LCAodGhpcy5oaSA8PCBzaGlmdCkgXiAodGhpcy5sbyA+Pj4gKDMyIC0gc2hpZnQpKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBic3dhcDY0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldChic3dhcDMyKHRoaXMuaGkpLCBic3dhcDMyKHRoaXMubG8pKTtcbiAgICB9XG4gICAgcmJpdDY0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldChyYml0MzIodGhpcy5oaSksIHJiaXQzMih0aGlzLmxvKSk7XG4gICAgfVxuICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5sbyA9PT0gb3RoZXIubG8gJiYgdGhpcy5oaSA9PT0gb3RoZXIuaGk7XG4gICAgfVxuICAgIHNpemUoKSB7XG4gICAgICAgIHJldHVybiBwb3BjbnQzMih0aGlzLmxvKSArIHBvcGNudDMyKHRoaXMuaGkpO1xuICAgIH1cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sbyA9PT0gMCAmJiB0aGlzLmhpID09PSAwO1xuICAgIH1cbiAgICBub25FbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG8gIT09IDAgfHwgdGhpcy5oaSAhPT0gMDtcbiAgICB9XG4gICAgaGFzKHNxdWFyZSkge1xuICAgICAgICByZXR1cm4gISEoc3F1YXJlID49IDMyID8gdGhpcy5oaSAmICgxIDw8IChzcXVhcmUgLSAzMikpIDogdGhpcy5sbyAmICgxIDw8IHNxdWFyZSkpO1xuICAgIH1cbiAgICBzZXQoc3F1YXJlLCBvbikge1xuICAgICAgICByZXR1cm4gb24gPyB0aGlzLndpdGgoc3F1YXJlKSA6IHRoaXMud2l0aG91dChzcXVhcmUpO1xuICAgIH1cbiAgICB3aXRoKHNxdWFyZSkge1xuICAgICAgICByZXR1cm4gc3F1YXJlID49IDMyID9cbiAgICAgICAgICAgIG5ldyBTcXVhcmVTZXQodGhpcy5sbywgdGhpcy5oaSB8ICgxIDw8IChzcXVhcmUgLSAzMikpKSA6XG4gICAgICAgICAgICBuZXcgU3F1YXJlU2V0KHRoaXMubG8gfCAoMSA8PCBzcXVhcmUpLCB0aGlzLmhpKTtcbiAgICB9XG4gICAgd2l0aG91dChzcXVhcmUpIHtcbiAgICAgICAgcmV0dXJuIHNxdWFyZSA+PSAzMiA/XG4gICAgICAgICAgICBuZXcgU3F1YXJlU2V0KHRoaXMubG8sIHRoaXMuaGkgJiB+KDEgPDwgKHNxdWFyZSAtIDMyKSkpIDpcbiAgICAgICAgICAgIG5ldyBTcXVhcmVTZXQodGhpcy5sbyAmIH4oMSA8PCBzcXVhcmUpLCB0aGlzLmhpKTtcbiAgICB9XG4gICAgdG9nZ2xlKHNxdWFyZSkge1xuICAgICAgICByZXR1cm4gc3F1YXJlID49IDMyID9cbiAgICAgICAgICAgIG5ldyBTcXVhcmVTZXQodGhpcy5sbywgdGhpcy5oaSBeICgxIDw8IChzcXVhcmUgLSAzMikpKSA6XG4gICAgICAgICAgICBuZXcgU3F1YXJlU2V0KHRoaXMubG8gXiAoMSA8PCBzcXVhcmUpLCB0aGlzLmhpKTtcbiAgICB9XG4gICAgbGFzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaGkgIT09IDApXG4gICAgICAgICAgICByZXR1cm4gNjMgLSBNYXRoLmNsejMyKHRoaXMuaGkpO1xuICAgICAgICBpZiAodGhpcy5sbyAhPT0gMClcbiAgICAgICAgICAgIHJldHVybiAzMSAtIE1hdGguY2x6MzIodGhpcy5sbyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZmlyc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLmxvICE9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIDMxIC0gTWF0aC5jbHozMih0aGlzLmxvICYgLXRoaXMubG8pO1xuICAgICAgICBpZiAodGhpcy5oaSAhPT0gMClcbiAgICAgICAgICAgIHJldHVybiA2MyAtIE1hdGguY2x6MzIodGhpcy5oaSAmIC10aGlzLmhpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBtb3JlVGhhbk9uZSgpIHtcbiAgICAgICAgcmV0dXJuICEhKCh0aGlzLmhpICYmIHRoaXMubG8pIHx8IHRoaXMubG8gJiAodGhpcy5sbyAtIDEpIHx8IHRoaXMuaGkgJiAodGhpcy5oaSAtIDEpKTtcbiAgICB9XG4gICAgc2luZ2xlU3F1YXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3JlVGhhbk9uZSgpID8gdW5kZWZpbmVkIDogdGhpcy5sYXN0KCk7XG4gICAgfVxuICAgIGlzU2luZ2xlU3F1YXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ub25FbXB0eSgpICYmICF0aGlzLm1vcmVUaGFuT25lKCk7XG4gICAgfVxuICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICBsZXQgbG8gPSB0aGlzLmxvO1xuICAgICAgICBsZXQgaGkgPSB0aGlzLmhpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpZiAobG8pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gMzEgLSBNYXRoLmNsejMyKGxvICYgLWxvKTtcbiAgICAgICAgICAgICAgICAgICAgbG8gXj0gMSA8PCBpZHg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBpZHgsIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChoaSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSAzMSAtIE1hdGguY2x6MzIoaGkgJiAtaGkpO1xuICAgICAgICAgICAgICAgICAgICBoaSBePSAxIDw8IGlkeDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IDMyICsgaWR4LCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldmVyc2VkKCkge1xuICAgICAgICBsZXQgbG8gPSB0aGlzLmxvO1xuICAgICAgICBsZXQgaGkgPSB0aGlzLmhpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IDMxIC0gTWF0aC5jbHozMihoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGkgXj0gMSA8PCBpZHg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IDMyICsgaWR4LCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gMzEgLSBNYXRoLmNsejMyKGxvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsbyBePSAxIDw8IGlkeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogaWR4LCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgbWludXM2NChvdGhlcikge1xuICAgICAgICBjb25zdCBsbyA9IHRoaXMubG8gLSBvdGhlci5sbztcbiAgICAgICAgY29uc3QgYyA9ICgobG8gJiBvdGhlci5sbyAmIDEpICsgKG90aGVyLmxvID4+PiAxKSArIChsbyA+Pj4gMSkpID4+PiAzMTtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQobG8sIHRoaXMuaGkgLSAob3RoZXIuaGkgKyBjKSk7XG4gICAgfVxufVxuZXhwb3J0cy5TcXVhcmVTZXQgPSBTcXVhcmVTZXQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ09MT1JTID0gWyd3aGl0ZScsICdibGFjayddO1xuZXhwb3J0cy5ST0xFUyA9IFsncGF3bicsICdrbmlnaHQnLCAnYmlzaG9wJywgJ3Jvb2snLCAncXVlZW4nLCAna2luZyddO1xuZXhwb3J0cy5DQVNUTElOR19TSURFUyA9IFsnYScsICdoJ107XG5mdW5jdGlvbiBpc0Ryb3Aodikge1xuICAgIHJldHVybiAncm9sZScgaW4gdjtcbn1cbmV4cG9ydHMuaXNEcm9wID0gaXNEcm9wO1xuZnVuY3Rpb24gaXNNb3ZlKHYpIHtcbiAgICByZXR1cm4gJ2Zyb20nIGluIHY7XG59XG5leHBvcnRzLmlzTW92ZSA9IGlzTW92ZTtcbmV4cG9ydHMuUlVMRVMgPSBbJ2NoZXNzJywgJ2FudGljaGVzcycsICdraW5nb2Z0aGVoaWxsJywgJzNjaGVjaycsICdhdG9taWMnLCAnaG9yZGUnLCAncmFjaW5na2luZ3MnLCAnY3Jhenlob3VzZSddO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0eXBlc18xID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XG5mdW5jdGlvbiBkZWZpbmVkKHYpIHtcbiAgICByZXR1cm4gdHlwZW9mIHYgIT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5kZWZpbmVkID0gZGVmaW5lZDtcbmZ1bmN0aW9uIG9wcG9zaXRlKGNvbG9yKSB7XG4gICAgcmV0dXJuIGNvbG9yID09PSAnd2hpdGUnID8gJ2JsYWNrJyA6ICd3aGl0ZSc7XG59XG5leHBvcnRzLm9wcG9zaXRlID0gb3Bwb3NpdGU7XG5mdW5jdGlvbiBzcXVhcmVEaXN0KGEsIGIpIHtcbiAgICBjb25zdCB4MSA9IGEgJiAweDcsIHgyID0gYiAmIDB4NztcbiAgICBjb25zdCB5MSA9IGEgPj4gMywgeTIgPSBiID4+IDM7XG4gICAgcmV0dXJuIE1hdGgubWF4KE1hdGguYWJzKHgxIC0geDIpLCBNYXRoLmFicyh5MSAtIHkyKSk7XG59XG5leHBvcnRzLnNxdWFyZURpc3QgPSBzcXVhcmVEaXN0O1xuZnVuY3Rpb24gc3F1YXJlUmFuayhzcXVhcmUpIHtcbiAgICByZXR1cm4gc3F1YXJlID4+IDM7XG59XG5leHBvcnRzLnNxdWFyZVJhbmsgPSBzcXVhcmVSYW5rO1xuZnVuY3Rpb24gc3F1YXJlRmlsZShzcXVhcmUpIHtcbiAgICByZXR1cm4gc3F1YXJlICYgMHg3O1xufVxuZXhwb3J0cy5zcXVhcmVGaWxlID0gc3F1YXJlRmlsZTtcbmZ1bmN0aW9uIHJvbGVUb0NoYXIocm9sZSkge1xuICAgIHN3aXRjaCAocm9sZSkge1xuICAgICAgICBjYXNlICdwYXduJzogcmV0dXJuICdwJztcbiAgICAgICAgY2FzZSAna25pZ2h0JzogcmV0dXJuICduJztcbiAgICAgICAgY2FzZSAnYmlzaG9wJzogcmV0dXJuICdiJztcbiAgICAgICAgY2FzZSAncm9vayc6IHJldHVybiAncic7XG4gICAgICAgIGNhc2UgJ3F1ZWVuJzogcmV0dXJuICdxJztcbiAgICAgICAgY2FzZSAna2luZyc6IHJldHVybiAnayc7XG4gICAgfVxufVxuZXhwb3J0cy5yb2xlVG9DaGFyID0gcm9sZVRvQ2hhcjtcbmZ1bmN0aW9uIGNoYXJUb1JvbGUoY2gpIHtcbiAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgJ1AnOlxuICAgICAgICBjYXNlICdwJzogcmV0dXJuICdwYXduJztcbiAgICAgICAgY2FzZSAnTic6XG4gICAgICAgIGNhc2UgJ24nOiByZXR1cm4gJ2tuaWdodCc7XG4gICAgICAgIGNhc2UgJ0InOlxuICAgICAgICBjYXNlICdiJzogcmV0dXJuICdiaXNob3AnO1xuICAgICAgICBjYXNlICdSJzpcbiAgICAgICAgY2FzZSAncic6IHJldHVybiAncm9vayc7XG4gICAgICAgIGNhc2UgJ1EnOlxuICAgICAgICBjYXNlICdxJzogcmV0dXJuICdxdWVlbic7XG4gICAgICAgIGNhc2UgJ0snOlxuICAgICAgICBjYXNlICdrJzogcmV0dXJuICdraW5nJztcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuO1xuICAgIH1cbn1cbmV4cG9ydHMuY2hhclRvUm9sZSA9IGNoYXJUb1JvbGU7XG5mdW5jdGlvbiBwYXJzZVNxdWFyZShzdHIpIHtcbiAgICBpZiAoIS9eW2EtaF1bMS04XSQvLnRlc3Qoc3RyKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHJldHVybiBzdHIuY2hhckNvZGVBdCgwKSAtICdhJy5jaGFyQ29kZUF0KDApICsgOCAqIChzdHIuY2hhckNvZGVBdCgxKSAtICcxJy5jaGFyQ29kZUF0KDApKTtcbn1cbmV4cG9ydHMucGFyc2VTcXVhcmUgPSBwYXJzZVNxdWFyZTtcbmZ1bmN0aW9uIG1ha2VTcXVhcmUoc3F1YXJlKSB7XG4gICAgcmV0dXJuICdhYmNkZWZnaCdbc3F1YXJlICYgMHg3XSArICcxMjM0NTY3OCdbc3F1YXJlID4+IDNdO1xufVxuZXhwb3J0cy5tYWtlU3F1YXJlID0gbWFrZVNxdWFyZTtcbmZ1bmN0aW9uIHBhcnNlVWNpKHN0cikge1xuICAgIGlmIChzdHJbMV0gPT09ICdAJyAmJiBzdHIubGVuZ3RoID09PSA0KSB7XG4gICAgICAgIGNvbnN0IHJvbGUgPSBjaGFyVG9Sb2xlKHN0clswXSk7XG4gICAgICAgIGNvbnN0IHRvID0gcGFyc2VTcXVhcmUoc3RyLnNsaWNlKDIpKTtcbiAgICAgICAgaWYgKHJvbGUgJiYgZGVmaW5lZCh0bykpXG4gICAgICAgICAgICByZXR1cm4geyByb2xlLCB0byB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChzdHIubGVuZ3RoID09PSA0IHx8IHN0ci5sZW5ndGggPT09IDUpIHtcbiAgICAgICAgY29uc3QgZnJvbSA9IHBhcnNlU3F1YXJlKHN0ci5zbGljZSgwLCAyKSk7XG4gICAgICAgIGNvbnN0IHRvID0gcGFyc2VTcXVhcmUoc3RyLnNsaWNlKDIsIDQpKTtcbiAgICAgICAgbGV0IHByb21vdGlvbjtcbiAgICAgICAgaWYgKHN0ci5sZW5ndGggPT09IDUpIHtcbiAgICAgICAgICAgIHByb21vdGlvbiA9IGNoYXJUb1JvbGUoc3RyWzRdKTtcbiAgICAgICAgICAgIGlmICghcHJvbW90aW9uKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmaW5lZChmcm9tKSAmJiBkZWZpbmVkKHRvKSlcbiAgICAgICAgICAgIHJldHVybiB7IGZyb20sIHRvLCBwcm9tb3Rpb24gfTtcbiAgICB9XG4gICAgcmV0dXJuO1xufVxuZXhwb3J0cy5wYXJzZVVjaSA9IHBhcnNlVWNpO1xuZnVuY3Rpb24gbWFrZVVjaSh1Y2kpIHtcbiAgICBpZiAodHlwZXNfMS5pc0Ryb3AodWNpKSlcbiAgICAgICAgcmV0dXJuIGAke3JvbGVUb0NoYXIodWNpLnJvbGUpLnRvVXBwZXJDYXNlKCl9QCR7bWFrZVNxdWFyZSh1Y2kudG8pfWA7XG4gICAgcmV0dXJuIG1ha2VTcXVhcmUodWNpLmZyb20pICsgbWFrZVNxdWFyZSh1Y2kudG8pICsgKHVjaS5wcm9tb3Rpb24gPyByb2xlVG9DaGFyKHVjaS5wcm9tb3Rpb24pIDogJycpO1xufVxuZXhwb3J0cy5tYWtlVWNpID0gbWFrZVVjaTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcmVzdWx0XzEgPSByZXF1aXJlKFwiQGJhZHJhcC9yZXN1bHRcIik7XG5jb25zdCB0eXBlc18xID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XG5jb25zdCB1dGlsXzEgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuY29uc3QgYXR0YWNrc18xID0gcmVxdWlyZShcIi4vYXR0YWNrc1wiKTtcbmNvbnN0IHNxdWFyZVNldF8xID0gcmVxdWlyZShcIi4vc3F1YXJlU2V0XCIpO1xuY29uc3QgYm9hcmRfMSA9IHJlcXVpcmUoXCIuL2JvYXJkXCIpO1xuY29uc3Qgc2V0dXBfMSA9IHJlcXVpcmUoXCIuL3NldHVwXCIpO1xuY29uc3QgY2hlc3NfMSA9IHJlcXVpcmUoXCIuL2NoZXNzXCIpO1xuZXhwb3J0cy5Qb3NpdGlvbkVycm9yID0gY2hlc3NfMS5Qb3NpdGlvbkVycm9yO1xuZXhwb3J0cy5Qb3NpdGlvbiA9IGNoZXNzXzEuUG9zaXRpb247XG5leHBvcnRzLklsbGVnYWxTZXR1cCA9IGNoZXNzXzEuSWxsZWdhbFNldHVwO1xuZXhwb3J0cy5DYXN0bGVzID0gY2hlc3NfMS5DYXN0bGVzO1xuZXhwb3J0cy5DaGVzcyA9IGNoZXNzXzEuQ2hlc3M7XG5jbGFzcyBDcmF6eWhvdXNlIGV4dGVuZHMgY2hlc3NfMS5DaGVzcyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCdjcmF6eWhvdXNlJyk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICBjb25zdCBwb3MgPSBzdXBlci5kZWZhdWx0KCk7XG4gICAgICAgIHBvcy5wb2NrZXRzID0gc2V0dXBfMS5NYXRlcmlhbC5lbXB0eSgpO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5mcm9tU2V0dXAoc2V0dXApLm1hcChwb3MgPT4ge1xuICAgICAgICAgICAgcG9zLnBvY2tldHMgPSBzZXR1cC5wb2NrZXRzID8gc2V0dXAucG9ja2V0cy5jbG9uZSgpIDogc2V0dXBfMS5NYXRlcmlhbC5lbXB0eSgpO1xuICAgICAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHZhbGlkYXRlKCkge1xuICAgICAgICByZXR1cm4gc3VwZXIudmFsaWRhdGUoKS5jaGFpbihfID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBvY2tldHMgJiYgKHRoaXMucG9ja2V0cy53aGl0ZS5raW5nID4gMCB8fCB0aGlzLnBvY2tldHMuYmxhY2sua2luZyA+IDApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5LaW5ncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh0aGlzLnBvY2tldHMgPyB0aGlzLnBvY2tldHMuY291bnQoKSA6IDApICsgdGhpcy5ib2FyZC5vY2N1cGllZC5zaXplKCkgPiA2NCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBjaGVzc18xLlBvc2l0aW9uRXJyb3IoY2hlc3NfMS5JbGxlZ2FsU2V0dXAuVmFyaWFudCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayh1bmRlZmluZWQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5jbG9uZSgpO1xuICAgIH1cbiAgICBoYXNJbnN1ZmZpY2llbnRNYXRlcmlhbChjb2xvcikge1xuICAgICAgICAvLyBObyBtYXRlcmlhbCBjYW4gbGVhdmUgdGhlIGdhbWUsIGJ1dCB3ZSBjYW4gZWFzaWx5IGNoZWNrIHRoaXMgZm9yXG4gICAgICAgIC8vIGN1c3RvbSBwb3NpdGlvbnMuXG4gICAgICAgIGlmICghdGhpcy5wb2NrZXRzKVxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmhhc0luc3VmZmljaWVudE1hdGVyaWFsKGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQub2NjdXBpZWQuc2l6ZSgpICsgdGhpcy5wb2NrZXRzLmNvdW50KCkgPD0gMyAmJlxuICAgICAgICAgICAgdGhpcy5ib2FyZC5wYXduLmlzRW1wdHkoKSAmJlxuICAgICAgICAgICAgdGhpcy5ib2FyZC5wcm9tb3RlZC5pc0VtcHR5KCkgJiZcbiAgICAgICAgICAgIHRoaXMuYm9hcmQucm9va3NBbmRRdWVlbnMoKS5pc0VtcHR5KCkgJiZcbiAgICAgICAgICAgIHRoaXMucG9ja2V0cy53aGl0ZS5wYXduIDw9IDAgJiZcbiAgICAgICAgICAgIHRoaXMucG9ja2V0cy5ibGFjay5wYXduIDw9IDAgJiZcbiAgICAgICAgICAgIHRoaXMucG9ja2V0cy53aGl0ZS5yb29rIDw9IDAgJiZcbiAgICAgICAgICAgIHRoaXMucG9ja2V0cy5ibGFjay5yb29rIDw9IDAgJiZcbiAgICAgICAgICAgIHRoaXMucG9ja2V0cy53aGl0ZS5xdWVlbiA8PSAwICYmXG4gICAgICAgICAgICB0aGlzLnBvY2tldHMuYmxhY2sucXVlZW4gPD0gMDtcbiAgICB9XG4gICAgZHJvcERlc3RzKGN0eCkge1xuICAgICAgICBjb25zdCBtYXNrID0gdGhpcy5ib2FyZC5vY2N1cGllZC5jb21wbGVtZW50KCkuaW50ZXJzZWN0KCh0aGlzLnBvY2tldHMgJiYgdGhpcy5wb2NrZXRzW3RoaXMudHVybl0uaGFzTm9uUGF3bnMoKSkgPyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnVsbCgpIDpcbiAgICAgICAgICAgICh0aGlzLnBvY2tldHMgJiYgdGhpcy5wb2NrZXRzW3RoaXMudHVybl0ucGF3bikgPyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuYmFja3JhbmtzKCkuY29tcGxlbWVudCgpIDpcbiAgICAgICAgICAgICAgICBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKSk7XG4gICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChjdHgua2luZykgJiYgY3R4LmNoZWNrZXJzLm5vbkVtcHR5KCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrZXIgPSBjdHguY2hlY2tlcnMuc2luZ2xlU3F1YXJlKCk7XG4gICAgICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKGNoZWNrZXIpKVxuICAgICAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgICAgIHJldHVybiBtYXNrLmludGVyc2VjdChhdHRhY2tzXzEuYmV0d2VlbihjaGVja2VyLCBjdHgua2luZykpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBtYXNrO1xuICAgIH1cbn1cbmV4cG9ydHMuQ3Jhenlob3VzZSA9IENyYXp5aG91c2U7XG5jbGFzcyBBdG9taWMgZXh0ZW5kcyBjaGVzc18xLkNoZXNzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ2F0b21pYycpO1xuICAgIH1cbiAgICBzdGF0aWMgZGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmRlZmF1bHQoKTtcbiAgICB9XG4gICAgc3RhdGljIGZyb21TZXR1cChzZXR1cCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuZnJvbVNldHVwKHNldHVwKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5jbG9uZSgpO1xuICAgIH1cbiAgICB2YWxpZGF0ZSgpIHtcbiAgICAgICAgLy8gTGlrZSBjaGVzcywgYnV0IGFsbG93IG91ciBraW5nIHRvIGJlIG1pc3NpbmcuXG4gICAgICAgIGlmICh0aGlzLmJvYXJkLm9jY3VwaWVkLmlzRW1wdHkoKSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBjaGVzc18xLlBvc2l0aW9uRXJyb3IoY2hlc3NfMS5JbGxlZ2FsU2V0dXAuRW1wdHkpKTtcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQua2luZy5zaXplKCkgPiAyKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5LaW5ncykpO1xuICAgICAgICBjb25zdCBvdGhlcktpbmcgPSB0aGlzLmJvYXJkLmtpbmdPZih1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSk7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQob3RoZXJLaW5nKSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBjaGVzc18xLlBvc2l0aW9uRXJyb3IoY2hlc3NfMS5JbGxlZ2FsU2V0dXAuS2luZ3MpKTtcbiAgICAgICAgaWYgKHRoaXMua2luZ0F0dGFja2VycyhvdGhlcktpbmcsIHRoaXMudHVybiwgdGhpcy5ib2FyZC5vY2N1cGllZCkubm9uRW1wdHkoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5PcHBvc2l0ZUNoZWNrKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNxdWFyZVNldF8xLlNxdWFyZVNldC5iYWNrcmFua3MoKS5pbnRlcnNlY3RzKHRoaXMuYm9hcmQucGF3bikpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBjaGVzc18xLlBvc2l0aW9uRXJyb3IoY2hlc3NfMS5JbGxlZ2FsU2V0dXAuUGF3bnNPbkJhY2tyYW5rKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayh1bmRlZmluZWQpO1xuICAgIH1cbiAgICBraW5nQXR0YWNrZXJzKHNxdWFyZSwgYXR0YWNrZXIsIG9jY3VwaWVkKSB7XG4gICAgICAgIGlmIChhdHRhY2tzXzEua2luZ0F0dGFja3Moc3F1YXJlKS5pbnRlcnNlY3RzKHRoaXMuYm9hcmQucGllY2VzKGF0dGFja2VyLCAna2luZycpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5raW5nQXR0YWNrZXJzKHNxdWFyZSwgYXR0YWNrZXIsIG9jY3VwaWVkKTtcbiAgICB9XG4gICAgcGxheUNhcHR1cmVBdChzcXVhcmUsIGNhcHR1cmVkKSB7XG4gICAgICAgIHN1cGVyLnBsYXlDYXB0dXJlQXQoc3F1YXJlLCBjYXB0dXJlZCk7XG4gICAgICAgIHRoaXMuYm9hcmQudGFrZShzcXVhcmUpO1xuICAgICAgICBmb3IgKGNvbnN0IGV4cGxvZGUgb2YgYXR0YWNrc18xLmtpbmdBdHRhY2tzKHNxdWFyZSkuaW50ZXJzZWN0KHRoaXMuYm9hcmQub2NjdXBpZWQpLmRpZmYodGhpcy5ib2FyZC5wYXduKSkge1xuICAgICAgICAgICAgY29uc3QgcGllY2UgPSB0aGlzLmJvYXJkLnRha2UoZXhwbG9kZSk7XG4gICAgICAgICAgICBpZiAocGllY2UgJiYgcGllY2Uucm9sZSA9PT0gJ3Jvb2snKVxuICAgICAgICAgICAgICAgIHRoaXMuY2FzdGxlcy5kaXNjYXJkUm9vayhleHBsb2RlKTtcbiAgICAgICAgICAgIGlmIChwaWVjZSAmJiBwaWVjZS5yb2xlID09PSAna2luZycpXG4gICAgICAgICAgICAgICAgdGhpcy5jYXN0bGVzLmRpc2NhcmRTaWRlKHBpZWNlLmNvbG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBoYXNJbnN1ZmZpY2llbnRNYXRlcmlhbChjb2xvcikge1xuICAgICAgICAvLyBSZW1haW5pbmcgbWF0ZXJpYWwgZG9lcyBub3QgbWF0dGVyIGlmIHRoZSBlbmVteSBraW5nIGlzIGFscmVhZHlcbiAgICAgICAgLy8gZXhwbG9kZWQuXG4gICAgICAgIGlmICh0aGlzLmJvYXJkLnBpZWNlcyh1dGlsXzEub3Bwb3NpdGUoY29sb3IpLCAna2luZycpLmlzRW1wdHkoKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gQmFyZSBraW5nIGNhbm5vdCBtYXRlLlxuICAgICAgICBpZiAodGhpcy5ib2FyZFtjb2xvcl0uZGlmZih0aGlzLmJvYXJkLmtpbmcpLmlzRW1wdHkoKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBBcyBsb25nIGFzIHRoZSBlbmVteSBraW5nIGlzIG5vdCBhbG9uZSwgdGhlcmUgaXMgYWx3YXlzIGEgY2hhbmNlIHRoZWlyXG4gICAgICAgIC8vIG93biBwaWVjZXMgZXhwbG9kZSBuZXh0IHRvIGl0LlxuICAgICAgICBpZiAodGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUoY29sb3IpXS5kaWZmKHRoaXMuYm9hcmQua2luZykubm9uRW1wdHkoKSkge1xuICAgICAgICAgICAgLy8gVW5sZXNzIHRoZXJlIGFyZSBvbmx5IGJpc2hvcHMgdGhhdCBjYW5ub3QgZXhwbG9kZSBlYWNoIG90aGVyLlxuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQub2NjdXBpZWQuZXF1YWxzKHRoaXMuYm9hcmQuYmlzaG9wLnVuaW9uKHRoaXMuYm9hcmQua2luZykpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmJvYXJkLmJpc2hvcC5pbnRlcnNlY3QodGhpcy5ib2FyZC53aGl0ZSkuaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZGFya1NxdWFyZXMoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICF0aGlzLmJvYXJkLmJpc2hvcC5pbnRlcnNlY3QodGhpcy5ib2FyZC5ibGFjaykuaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQubGlnaHRTcXVhcmVzKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuYm9hcmQuYmlzaG9wLmludGVyc2VjdCh0aGlzLmJvYXJkLndoaXRlKS5pbnRlcnNlY3RzKHNxdWFyZVNldF8xLlNxdWFyZVNldC5saWdodFNxdWFyZXMoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICF0aGlzLmJvYXJkLmJpc2hvcC5pbnRlcnNlY3QodGhpcy5ib2FyZC5ibGFjaykuaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZGFya1NxdWFyZXMoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFF1ZWVuIG9yIHBhd24gKGZ1dHVyZSBxdWVlbikgY2FuIGdpdmUgbWF0ZSBhZ2FpbnN0IGJhcmUga2luZy5cbiAgICAgICAgaWYgKHRoaXMuYm9hcmQucXVlZW4ubm9uRW1wdHkoKSB8fCB0aGlzLmJvYXJkLnBhd24ubm9uRW1wdHkoKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gU2luZ2xlIGtuaWdodCwgYmlzaG9wIG9yIHJvb2sgY2Fubm90IG1hdGUgYWdhaW5zdCBiYXJlIGtpbmcuXG4gICAgICAgIGlmICh0aGlzLmJvYXJkLmtuaWdodC51bmlvbih0aGlzLmJvYXJkLmJpc2hvcCkudW5pb24odGhpcy5ib2FyZC5yb29rKS5pc1NpbmdsZVNxdWFyZSgpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIElmIG9ubHkga25pZ2h0cywgbW9yZSB0aGFuIHR3byBhcmUgcmVxdWlyZWQgdG8gbWF0ZSBiYXJlIGtpbmcuXG4gICAgICAgIGlmICh0aGlzLmJvYXJkLm9jY3VwaWVkLmVxdWFscyh0aGlzLmJvYXJkLmtuaWdodC51bmlvbih0aGlzLmJvYXJkLmtpbmcpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQua25pZ2h0LnNpemUoKSA8PSAyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZGVzdHMoc3F1YXJlLCBjdHgpIHtcbiAgICAgICAgbGV0IGRlc3RzID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGZvciAoY29uc3QgdG8gb2YgdGhpcy5wc2V1ZG9EZXN0cyhzcXVhcmUsIGN0eCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFmdGVyID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICAgICAgYWZ0ZXIucGxheSh7IGZyb206IHNxdWFyZSwgdG8gfSk7XG4gICAgICAgICAgICBjb25zdCBvdXJLaW5nID0gYWZ0ZXIuYm9hcmQua2luZ09mKHRoaXMudHVybik7XG4gICAgICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQob3VyS2luZykgJiYgKCF1dGlsXzEuZGVmaW5lZChhZnRlci5ib2FyZC5raW5nT2YoYWZ0ZXIudHVybikpIHx8IGFmdGVyLmtpbmdBdHRhY2tlcnMob3VyS2luZywgYWZ0ZXIudHVybiwgYWZ0ZXIuYm9hcmQub2NjdXBpZWQpLmlzRW1wdHkoKSkpIHtcbiAgICAgICAgICAgICAgICBkZXN0cyA9IGRlc3RzLndpdGgodG8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0cztcbiAgICB9XG4gICAgaXNWYXJpYW50RW5kKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLnZhcmlhbnRPdXRjb21lKCk7XG4gICAgfVxuICAgIHZhcmlhbnRPdXRjb21lKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIHR5cGVzXzEuQ09MT1JTKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5waWVjZXMoY29sb3IsICdraW5nJykuaXNFbXB0eSgpKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHdpbm5lcjogdXRpbF8xLm9wcG9zaXRlKGNvbG9yKSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG5leHBvcnRzLkF0b21pYyA9IEF0b21pYztcbmNsYXNzIEFudGljaGVzcyBleHRlbmRzIGNoZXNzXzEuQ2hlc3Mge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcignYW50aWNoZXNzJyk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICBjb25zdCBwb3MgPSBuZXcgdGhpcygpO1xuICAgICAgICBwb3MuYm9hcmQgPSBib2FyZF8xLkJvYXJkLmRlZmF1bHQoKTtcbiAgICAgICAgcG9zLnR1cm4gPSAnd2hpdGUnO1xuICAgICAgICBwb3MuY2FzdGxlcyA9IGNoZXNzXzEuQ2FzdGxlcy5lbXB0eSgpO1xuICAgICAgICBwb3MuZXBTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHBvcy5yZW1haW5pbmdDaGVja3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIHBvcy5oYWxmbW92ZXMgPSAwO1xuICAgICAgICBwb3MuZnVsbG1vdmVzID0gMTtcbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICB9XG4gICAgc3RhdGljIGZyb21TZXR1cChzZXR1cCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuZnJvbVNldHVwKHNldHVwKS5tYXAocG9zID0+IHtcbiAgICAgICAgICAgIHBvcy5jYXN0bGVzID0gY2hlc3NfMS5DYXN0bGVzLmVtcHR5KCk7XG4gICAgICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5jbG9uZSgpO1xuICAgIH1cbiAgICB2YWxpZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQub2NjdXBpZWQuaXNFbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5FbXB0eSkpO1xuICAgICAgICBpZiAoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rcygpLmludGVyc2VjdHModGhpcy5ib2FyZC5wYXduKSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBjaGVzc18xLlBvc2l0aW9uRXJyb3IoY2hlc3NfMS5JbGxlZ2FsU2V0dXAuUGF3bnNPbkJhY2tyYW5rKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2sodW5kZWZpbmVkKTtcbiAgICB9XG4gICAga2luZ0F0dGFja2Vycyhfc3F1YXJlLCBfYXR0YWNrZXIsIF9vY2N1cGllZCkge1xuICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgfVxuICAgIGN0eCgpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gc3VwZXIuY3R4KCk7XG4gICAgICAgIGNvbnN0IGVuZW15ID0gdGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKV07XG4gICAgICAgIGZvciAoY29uc3QgZnJvbSBvZiB0aGlzLmJvYXJkW3RoaXMudHVybl0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBzZXVkb0Rlc3RzKGZyb20sIGN0eCkuaW50ZXJzZWN0cyhlbmVteSkpIHtcbiAgICAgICAgICAgICAgICBjdHgubXVzdENhcHR1cmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdHg7XG4gICAgfVxuICAgIGRlc3RzKHNxdWFyZSwgY3R4KSB7XG4gICAgICAgIGNvbnN0IGRlc3RzID0gdGhpcy5wc2V1ZG9EZXN0cyhzcXVhcmUsIGN0eCk7XG4gICAgICAgIGlmICghY3R4Lm11c3RDYXB0dXJlKVxuICAgICAgICAgICAgcmV0dXJuIGRlc3RzO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gZGVzdHMuaW50ZXJzZWN0KHRoaXMuYm9hcmRbdXRpbF8xLm9wcG9zaXRlKHRoaXMudHVybildKTtcbiAgICB9XG4gICAgaGFzSW5zdWZmaWNpZW50TWF0ZXJpYWwoY29sb3IpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQub2NjdXBpZWQuZXF1YWxzKHRoaXMuYm9hcmQuYmlzaG9wKSkge1xuICAgICAgICAgICAgY29uc3Qgd2VTb21lT25MaWdodCA9IHRoaXMuYm9hcmRbY29sb3JdLmludGVyc2VjdHMoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmxpZ2h0U3F1YXJlcygpKTtcbiAgICAgICAgICAgIGNvbnN0IHdlU29tZU9uRGFyayA9IHRoaXMuYm9hcmRbY29sb3JdLmludGVyc2VjdHMoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmRhcmtTcXVhcmVzKCkpO1xuICAgICAgICAgICAgY29uc3QgdGhleUFsbE9uRGFyayA9IHRoaXMuYm9hcmRbdXRpbF8xLm9wcG9zaXRlKGNvbG9yKV0uaXNEaXNqb2ludChzcXVhcmVTZXRfMS5TcXVhcmVTZXQubGlnaHRTcXVhcmVzKCkpO1xuICAgICAgICAgICAgY29uc3QgdGhleUFsbE9uTGlnaHQgPSB0aGlzLmJvYXJkW3V0aWxfMS5vcHBvc2l0ZShjb2xvcildLmlzRGlzam9pbnQoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmRhcmtTcXVhcmVzKCkpO1xuICAgICAgICAgICAgcmV0dXJuICh3ZVNvbWVPbkxpZ2h0ICYmIHRoZXlBbGxPbkRhcmspIHx8ICh3ZVNvbWVPbkRhcmsgJiYgdGhleUFsbE9uTGlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNWYXJpYW50RW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZFt0aGlzLnR1cm5dLmlzRW1wdHkoKTtcbiAgICB9XG4gICAgdmFyaWFudE91dGNvbWUoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmFyaWFudEVuZCgpIHx8IHRoaXMuaXNTdGFsZW1hdGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiB0aGlzLnR1cm4gfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxufVxuZXhwb3J0cy5BbnRpY2hlc3MgPSBBbnRpY2hlc3M7XG5jbGFzcyBLaW5nT2ZUaGVIaWxsIGV4dGVuZHMgY2hlc3NfMS5DaGVzcyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCdraW5nb2Z0aGVoaWxsJyk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuZGVmYXVsdCgpO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5mcm9tU2V0dXAoc2V0dXApO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNsb25lKCk7XG4gICAgfVxuICAgIGhhc0luc3VmZmljaWVudE1hdGVyaWFsKF9jb2xvcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlzVmFyaWFudEVuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQua2luZy5pbnRlcnNlY3RzKHNxdWFyZVNldF8xLlNxdWFyZVNldC5jZW50ZXIoKSk7XG4gICAgfVxuICAgIHZhcmlhbnRPdXRjb21lKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIHR5cGVzXzEuQ09MT1JTKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5waWVjZXMoY29sb3IsICdraW5nJykuaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQuY2VudGVyKCkpKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHdpbm5lcjogY29sb3IgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxufVxuZXhwb3J0cy5LaW5nT2ZUaGVIaWxsID0gS2luZ09mVGhlSGlsbDtcbmNsYXNzIFRocmVlQ2hlY2sgZXh0ZW5kcyBjaGVzc18xLkNoZXNzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJzNjaGVjaycpO1xuICAgIH1cbiAgICBzdGF0aWMgZGVmYXVsdCgpIHtcbiAgICAgICAgY29uc3QgcG9zID0gc3VwZXIuZGVmYXVsdCgpO1xuICAgICAgICBwb3MucmVtYWluaW5nQ2hlY2tzID0gc2V0dXBfMS5SZW1haW5pbmdDaGVja3MuZGVmYXVsdCgpO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5mcm9tU2V0dXAoc2V0dXApLm1hcChwb3MgPT4ge1xuICAgICAgICAgICAgcG9zLnJlbWFpbmluZ0NoZWNrcyA9IHNldHVwLnJlbWFpbmluZ0NoZWNrcyA/IHNldHVwLnJlbWFpbmluZ0NoZWNrcy5jbG9uZSgpIDogc2V0dXBfMS5SZW1haW5pbmdDaGVja3MuZGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuY2xvbmUoKTtcbiAgICB9XG4gICAgaGFzSW5zdWZmaWNpZW50TWF0ZXJpYWwoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQucGllY2VzKGNvbG9yLCAna2luZycpLmVxdWFscyh0aGlzLmJvYXJkW2NvbG9yXSk7XG4gICAgfVxuICAgIGlzVmFyaWFudEVuZCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5yZW1haW5pbmdDaGVja3MgJiYgKHRoaXMucmVtYWluaW5nQ2hlY2tzLndoaXRlIDw9IDAgfHwgdGhpcy5yZW1haW5pbmdDaGVja3MuYmxhY2sgPD0gMCk7XG4gICAgfVxuICAgIHZhcmlhbnRPdXRjb21lKCkge1xuICAgICAgICBpZiAodGhpcy5yZW1haW5pbmdDaGVja3MpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29sb3Igb2YgdHlwZXNfMS5DT0xPUlMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZW1haW5pbmdDaGVja3NbY29sb3JdIDw9IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHdpbm5lcjogY29sb3IgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxufVxuZXhwb3J0cy5UaHJlZUNoZWNrID0gVGhyZWVDaGVjaztcbmNsYXNzIFJhY2luZ0tpbmdzIGV4dGVuZHMgY2hlc3NfMS5DaGVzcyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCdyYWNpbmdraW5ncycpO1xuICAgIH1cbiAgICBzdGF0aWMgZGVmYXVsdCgpIHtcbiAgICAgICAgY29uc3QgcG9zID0gbmV3IHRoaXMoKTtcbiAgICAgICAgcG9zLmJvYXJkID0gYm9hcmRfMS5Cb2FyZC5yYWNpbmdLaW5ncygpO1xuICAgICAgICBwb3MudHVybiA9ICd3aGl0ZSc7XG4gICAgICAgIHBvcy5jYXN0bGVzID0gY2hlc3NfMS5DYXN0bGVzLmVtcHR5KCk7XG4gICAgICAgIHBvcy5lcFNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLnJlbWFpbmluZ0NoZWNrcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLmhhbGZtb3ZlcyA9IDA7XG4gICAgICAgIHBvcy5mdWxsbW92ZXMgPSAxO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5mcm9tU2V0dXAoc2V0dXApLm1hcChwb3MgPT4ge1xuICAgICAgICAgICAgcG9zLmNhc3RsZXMgPSBjaGVzc18xLkNhc3RsZXMuZW1wdHkoKTtcbiAgICAgICAgICAgIHJldHVybiBwb3M7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB2YWxpZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQucGF3bi5ub25FbXB0eSgpIHx8IHRoaXMuaXNDaGVjaygpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLlZhcmlhbnQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIudmFsaWRhdGUoKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5jbG9uZSgpO1xuICAgIH1cbiAgICBkZXN0cyhzcXVhcmUsIGN0eCkge1xuICAgICAgICAvLyBLaW5ncyBjYW5ub3QgZ2l2ZSBjaGVjay5cbiAgICAgICAgaWYgKHNxdWFyZSA9PT0gY3R4LmtpbmcpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZGVzdHMoc3F1YXJlLCBjdHgpO1xuICAgICAgICAvLyBUT0RPOiBUaGlzIGNvdWxkIGJlIG9wdGltaXplZCBjb25zaWRlcmFibHkuXG4gICAgICAgIGxldCBkZXN0cyA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBmb3IgKGNvbnN0IHRvIG9mIHN1cGVyLmRlc3RzKHNxdWFyZSwgY3R4KSkge1xuICAgICAgICAgICAgLy8gVmFsaWQsIGJlY2F1c2UgdGhlcmUgYXJlIG5vIHByb21vdGlvbnMgKG9yIGV2ZW4gcGF3bnMpLlxuICAgICAgICAgICAgY29uc3QgdWNpID0geyBmcm9tOiBzcXVhcmUsIHRvIH07XG4gICAgICAgICAgICBjb25zdCBhZnRlciA9IHRoaXMuY2xvbmUoKTtcbiAgICAgICAgICAgIGFmdGVyLnBsYXkodWNpKTtcbiAgICAgICAgICAgIGlmICghYWZ0ZXIuaXNDaGVjaygpKVxuICAgICAgICAgICAgICAgIGRlc3RzID0gZGVzdHMud2l0aCh0byk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3RzO1xuICAgIH1cbiAgICBoYXNJbnN1ZmZpY2llbnRNYXRlcmlhbChfY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpc1ZhcmlhbnRFbmQoKSB7XG4gICAgICAgIGNvbnN0IGdvYWwgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVJhbmsoNyk7XG4gICAgICAgIGNvbnN0IGluR29hbCA9IHRoaXMuYm9hcmQua2luZy5pbnRlcnNlY3QoZ29hbCk7XG4gICAgICAgIGlmIChpbkdvYWwuaXNFbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodGhpcy50dXJuID09PSAnd2hpdGUnIHx8IGluR29hbC5pbnRlcnNlY3RzKHRoaXMuYm9hcmQuYmxhY2spKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIFdoaXRlIGhhcyByZWFjaGVkIHRoZSBiYWNrcmFuay4gQ2hlY2sgaWYgYmxhY2sgY2FuIGNhdGNoIHVwLlxuICAgICAgICBjb25zdCBibGFja0tpbmcgPSB0aGlzLmJvYXJkLmtpbmdPZignYmxhY2snKTtcbiAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKGJsYWNrS2luZykpIHtcbiAgICAgICAgICAgIGNvbnN0IG9jYyA9IHRoaXMuYm9hcmQub2NjdXBpZWQud2l0aG91dChibGFja0tpbmcpO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0YXJnZXQgb2YgYXR0YWNrc18xLmtpbmdBdHRhY2tzKGJsYWNrS2luZykuaW50ZXJzZWN0KGdvYWwpLmRpZmYodGhpcy5ib2FyZC5ibGFjaykpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5raW5nQXR0YWNrZXJzKHRhcmdldCwgdXRpbF8xLm9wcG9zaXRlKHRoaXMudHVybiksIG9jYykuaXNFbXB0eSgpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhcmlhbnRPdXRjb21lKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNWYXJpYW50RW5kKCkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGdvYWwgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVJhbmsoNyk7XG4gICAgICAgIGNvbnN0IGJsYWNrSW5Hb2FsID0gdGhpcy5ib2FyZC5waWVjZXMoJ2JsYWNrJywgJ2tpbmcnKS5pbnRlcnNlY3RzKGdvYWwpO1xuICAgICAgICBjb25zdCB3aGl0ZUluR29hbCA9IHRoaXMuYm9hcmQucGllY2VzKCd3aGl0ZScsICdraW5nJykuaW50ZXJzZWN0cyhnb2FsKTtcbiAgICAgICAgaWYgKGJsYWNrSW5Hb2FsICYmICF3aGl0ZUluR29hbClcbiAgICAgICAgICAgIHJldHVybiB7IHdpbm5lcjogJ2JsYWNrJyB9O1xuICAgICAgICBpZiAod2hpdGVJbkdvYWwgJiYgIWJsYWNrSW5Hb2FsKVxuICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiAnd2hpdGUnIH07XG4gICAgICAgIHJldHVybiB7IHdpbm5lcjogdW5kZWZpbmVkIH07XG4gICAgfVxufVxuY2xhc3MgSG9yZGUgZXh0ZW5kcyBjaGVzc18xLkNoZXNzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ2hvcmRlJyk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICBjb25zdCBwb3MgPSBuZXcgdGhpcygpO1xuICAgICAgICBwb3MuYm9hcmQgPSBib2FyZF8xLkJvYXJkLmhvcmRlKCk7XG4gICAgICAgIHBvcy5wb2NrZXRzID0gdW5kZWZpbmVkO1xuICAgICAgICBwb3MudHVybiA9ICd3aGl0ZSc7XG4gICAgICAgIHBvcy5jYXN0bGVzID0gY2hlc3NfMS5DYXN0bGVzLmRlZmF1bHQoKTtcbiAgICAgICAgcG9zLmNhc3RsZXMuZGlzY2FyZFNpZGUoJ3doaXRlJyk7XG4gICAgICAgIHBvcy5lcFNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLnJlbWFpbmluZ0NoZWNrcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLmhhbGZtb3ZlcyA9IDA7XG4gICAgICAgIHBvcy5mdWxsbW92ZXMgPSAxO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5mcm9tU2V0dXAoc2V0dXApO1xuICAgIH1cbiAgICB2YWxpZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQub2NjdXBpZWQuaXNFbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5FbXB0eSkpO1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmQua2luZy5pc1NpbmdsZVNxdWFyZSgpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5LaW5ncykpO1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmQua2luZy5kaWZmKHRoaXMuYm9hcmQucHJvbW90ZWQpLmlzU2luZ2xlU3F1YXJlKCkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLktpbmdzKSk7XG4gICAgICAgIGNvbnN0IG90aGVyS2luZyA9IHRoaXMuYm9hcmQua2luZ09mKHV0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pKTtcbiAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKG90aGVyS2luZykgJiYgdGhpcy5raW5nQXR0YWNrZXJzKG90aGVyS2luZywgdGhpcy50dXJuLCB0aGlzLmJvYXJkLm9jY3VwaWVkKS5ub25FbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5PcHBvc2l0ZUNoZWNrKSk7XG4gICAgICAgIGZvciAoY29uc3QgY29sb3Igb2YgdHlwZXNfMS5DT0xPUlMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLnBpZWNlcyhjb2xvciwgJ3Bhd24nKS5pbnRlcnNlY3RzKHNxdWFyZVNldF8xLlNxdWFyZVNldC5iYWNrcmFuayh1dGlsXzEub3Bwb3NpdGUoY29sb3IpKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLlBhd25zT25CYWNrcmFuaykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2sodW5kZWZpbmVkKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5jbG9uZSgpO1xuICAgIH1cbiAgICBoYXNJbnN1ZmZpY2llbnRNYXRlcmlhbChfY29sb3IpIHtcbiAgICAgICAgLy8gVE9ETzogQ291bGQgZGV0ZWN0IGNhc2VzIHdoZXJlIHRoZSBob3JkZSBjYW5ub3QgbWF0ZS5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpc1ZhcmlhbnRFbmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJvYXJkLndoaXRlLmlzRW1wdHkoKSB8fCB0aGlzLmJvYXJkLmJsYWNrLmlzRW1wdHkoKTtcbiAgICB9XG4gICAgdmFyaWFudE91dGNvbWUoKSB7XG4gICAgICAgIGlmICh0aGlzLmJvYXJkLndoaXRlLmlzRW1wdHkoKSlcbiAgICAgICAgICAgIHJldHVybiB7IHdpbm5lcjogJ2JsYWNrJyB9O1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5ibGFjay5pc0VtcHR5KCkpXG4gICAgICAgICAgICByZXR1cm4geyB3aW5uZXI6ICd3aGl0ZScgfTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn1cbmV4cG9ydHMuSG9yZGUgPSBIb3JkZTtcbmZ1bmN0aW9uIGRlZmF1bHRQb3NpdGlvbihydWxlcykge1xuICAgIHN3aXRjaCAocnVsZXMpIHtcbiAgICAgICAgY2FzZSAnY2hlc3MnOiByZXR1cm4gY2hlc3NfMS5DaGVzcy5kZWZhdWx0KCk7XG4gICAgICAgIGNhc2UgJ2FudGljaGVzcyc6IHJldHVybiBBbnRpY2hlc3MuZGVmYXVsdCgpO1xuICAgICAgICBjYXNlICdhdG9taWMnOiByZXR1cm4gQXRvbWljLmRlZmF1bHQoKTtcbiAgICAgICAgY2FzZSAnaG9yZGUnOiByZXR1cm4gSG9yZGUuZGVmYXVsdCgpO1xuICAgICAgICBjYXNlICdyYWNpbmdraW5ncyc6IHJldHVybiBSYWNpbmdLaW5ncy5kZWZhdWx0KCk7XG4gICAgICAgIGNhc2UgJ2tpbmdvZnRoZWhpbGwnOiByZXR1cm4gS2luZ09mVGhlSGlsbC5kZWZhdWx0KCk7XG4gICAgICAgIGNhc2UgJzNjaGVjayc6IHJldHVybiBUaHJlZUNoZWNrLmRlZmF1bHQoKTtcbiAgICAgICAgY2FzZSAnY3Jhenlob3VzZSc6IHJldHVybiBDcmF6eWhvdXNlLmRlZmF1bHQoKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHRQb3NpdGlvbiA9IGRlZmF1bHRQb3NpdGlvbjtcbmZ1bmN0aW9uIHNldHVwUG9zaXRpb24ocnVsZXMsIHNldHVwKSB7XG4gICAgc3dpdGNoIChydWxlcykge1xuICAgICAgICBjYXNlICdjaGVzcyc6IHJldHVybiBjaGVzc18xLkNoZXNzLmZyb21TZXR1cChzZXR1cCk7XG4gICAgICAgIGNhc2UgJ2FudGljaGVzcyc6IHJldHVybiBBbnRpY2hlc3MuZnJvbVNldHVwKHNldHVwKTtcbiAgICAgICAgY2FzZSAnYXRvbWljJzogcmV0dXJuIEF0b21pYy5mcm9tU2V0dXAoc2V0dXApO1xuICAgICAgICBjYXNlICdob3JkZSc6IHJldHVybiBIb3JkZS5mcm9tU2V0dXAoc2V0dXApO1xuICAgICAgICBjYXNlICdyYWNpbmdraW5ncyc6IHJldHVybiBSYWNpbmdLaW5ncy5mcm9tU2V0dXAoc2V0dXApO1xuICAgICAgICBjYXNlICdraW5nb2Z0aGVoaWxsJzogcmV0dXJuIEtpbmdPZlRoZUhpbGwuZnJvbVNldHVwKHNldHVwKTtcbiAgICAgICAgY2FzZSAnM2NoZWNrJzogcmV0dXJuIFRocmVlQ2hlY2suZnJvbVNldHVwKHNldHVwKTtcbiAgICAgICAgY2FzZSAnY3Jhenlob3VzZSc6IHJldHVybiBDcmF6eWhvdXNlLmZyb21TZXR1cChzZXR1cCk7XG4gICAgfVxufVxuZXhwb3J0cy5zZXR1cFBvc2l0aW9uID0gc2V0dXBQb3NpdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuZnVuY3Rpb24gYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCkge1xuICAgIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICAgIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZERhdGEgPSBjaGlsZHJlbltpXS5kYXRhO1xuICAgICAgICAgICAgaWYgKGNoaWxkRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWRkTlMoY2hpbGREYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGgoc2VsLCBiLCBjKSB7XG4gICAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhID0gYjtcbiAgICAgICAgaWYgKGlzLmFycmF5KGMpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjICYmIGMuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtjXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzLmFycmF5KGIpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiICYmIGIuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtiXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSlcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IHZub2RlXzEudm5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxbMF0gPT09ICdzJyAmJiBzZWxbMV0gPT09ICd2JyAmJiBzZWxbMl0gPT09ICdnJyAmJlxuICAgICAgICAoc2VsLmxlbmd0aCA9PT0gMyB8fCBzZWxbM10gPT09ICcuJyB8fCBzZWxbM10gPT09ICcjJykpIHtcbiAgICAgICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZV8xLnZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59XG5leHBvcnRzLmggPSBoO1xuO1xuZXhwb3J0cy5kZWZhdWx0ID0gaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xufVxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpIHtcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCkge1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuZnVuY3Rpb24gcGFyZW50Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cbmZ1bmN0aW9uIHRhZ05hbWUoZWxtKSB7XG4gICAgcmV0dXJuIGVsbS50YWdOYW1lO1xufVxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCkge1xuICAgIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRleHRDb250ZW50O1xufVxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cbmZ1bmN0aW9uIGlzVGV4dChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5leHBvcnRzLmh0bWxEb21BcGkgPSB7XG4gICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgICBjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcbiAgICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBnZXRUZXh0Q29udGVudDogZ2V0VGV4dENvbnRlbnQsXG4gICAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gICAgaXNUZXh0OiBpc1RleHQsXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5odG1sRG9tQXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbGRvbWFwaS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYXJyYXkgPSBBcnJheS5pc0FycmF5O1xuZnVuY3Rpb24gcHJpbWl0aXZlKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMucHJpbWl0aXZlID0gcHJpbWl0aXZlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIga2V5LCBlbG0gPSB2bm9kZS5lbG0sIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzO1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgdmFyIGN1ciA9IGF0dHJzW2tleV07XG4gICAgICAgIHZhciBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgICAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgICAgICAgIGlmIChjdXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZShrZXksIGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdpZCcsIHNlbC5zbGljZShoYXNoICsgMSwgZG90KSk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdjbGFzcycsIHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAob2xkQXJnc1tpXSAhPT0gYXJnc1tpXSkge1xuICAgICAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5VG9UaHVuayhvbGRWbm9kZSwgdGh1bmspO1xufVxuZXhwb3J0cy50aHVuayA9IGZ1bmN0aW9uIHRodW5rKHNlbCwga2V5LCBmbiwgYXJncykge1xuICAgIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncyA9IGZuO1xuICAgICAgICBmbiA9IGtleTtcbiAgICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaF8xLmgoc2VsLCB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBob29rOiB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCB9LFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnRodW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGh1bmsuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB2bm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gICAgcmV0dXJuIHsgc2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5IH07XG59XG5leHBvcnRzLnZub2RlID0gdm5vZGU7XG5leHBvcnRzLmRlZmF1bHQgPSB2bm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZub2RlLmpzLm1hcCIsImltcG9ydCB7IENldmFsQ3RybCwgQ2V2YWxPcHRzLCBDZXZhbFRlY2hub2xvZ3ksIFdvcmssIFN0ZXAsIEhvdmVyaW5nLCBTdGFydGVkIH0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7IFBvb2wgfSBmcm9tICcuL3Bvb2wnO1xuaW1wb3J0IHsgcHJvcCB9IGZyb20gJ2NvbW1vbic7XG5pbXBvcnQgeyBzdG9yZWRQcm9wIH0gZnJvbSAnY29tbW9uL3N0b3JhZ2UnO1xuaW1wb3J0IHRocm90dGxlIGZyb20gJ2NvbW1vbi90aHJvdHRsZSc7XG5pbXBvcnQgeyBwb3ZDaGFuY2VzIH0gZnJvbSAnLi93aW5uaW5nQ2hhbmNlcyc7XG5cbmNvbnN0IGxpID0gd2luZG93LmxpY2hlc3M7XG5cbmZ1bmN0aW9uIHNhbklycmV2ZXJzaWJsZSh2YXJpYW50OiBWYXJpYW50S2V5LCBzYW46IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoc2FuLnN0YXJ0c1dpdGgoJ08tTycpKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHZhcmlhbnQgPT09ICdjcmF6eWhvdXNlJykgcmV0dXJuIGZhbHNlO1xuICBpZiAoc2FuLmluY2x1ZGVzKCd4JykpIHJldHVybiB0cnVlOyAvLyBjYXB0dXJlXG4gIGlmIChzYW4udG9Mb3dlckNhc2UoKSA9PT0gc2FuKSByZXR1cm4gdHJ1ZTsgLy8gcGF3biBtb3ZlXG4gIHJldHVybiB2YXJpYW50ID09PSAndGhyZWVDaGVjaycgJiYgc2FuLmluY2x1ZGVzKCcrJyk7XG59XG5cbmZ1bmN0aW9uIG9mZmljaWFsU3RvY2tmaXNoKHZhcmlhbnQ6IFZhcmlhbnRLZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhcmlhbnQgPT09ICdzdGFuZGFyZCcgfHwgdmFyaWFudCA9PT0gJ2NoZXNzOTYwJztcbn1cblxuZnVuY3Rpb24gaXM2NEJpdCgpOiBib29sZWFuIHtcbiAgY29uc3QgeDY0ID0gWyd4ODZfNjQnLCAneDg2LTY0JywgJ1dpbjY0JywneDY0JywgJ2FtZDY0JywgJ0FNRDY0J107XG4gIGZvciAoY29uc3Qgc3Vic3RyIG9mIHg2NCkgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoc3Vic3RyKSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBuYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdMaW51eCB4ODZfNjQnIHx8IG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gJ01hY0ludGVsJztcbn1cblxuZnVuY3Rpb24gc2hhcmVkV2FzbU1lbW9yeShpbml0aWFsOiBudW1iZXIsIG1heGltdW06IG51bWJlcik6IFdlYkFzc2VtYmx5Lk1lbW9yeSB8IHVuZGVmaW5lZCB7XG4gIC8vIEluIHRoZW9yeSAzMiBiaXQgc2hvdWxkIGJlIHN1cHBvcnRlZCBqdXN0IHRoZSBzYW1lLCBidXQgc29tZSAzMiBiaXRcbiAgLy8gYnJvd3NlciBidWlsZHMgc2VlbSB0byBoYXZlIHRyb3VibGUgd2l0aCBXQVNNWC4gU28gZm9yIG5vdyBkZXRlY3QgYW5kXG4gIC8vIHJlcXVpcmUgYSA2NCBiaXQgcGxhdGZvcm0uXG4gIGlmICghaXM2NEJpdCgpKSByZXR1cm47XG5cbiAgLy8gQXRvbWljc1xuICBpZiAodHlwZW9mIEF0b21pY3MgIT09ICdvYmplY3QnKSByZXR1cm47XG5cbiAgLy8gU2hhcmVkQXJyYXlCdWZmZXJcbiAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gIC8vIFNoYXJlZCBtZW1vcnlcbiAgY29uc3QgbWVtID0gbmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7c2hhcmVkOiB0cnVlLCBpbml0aWFsLCBtYXhpbXVtfSBhcyBXZWJBc3NlbWJseS5NZW1vcnlEZXNjcmlwdG9yKTtcbiAgaWYgKCEobWVtLmJ1ZmZlciBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyKSkgcmV0dXJuO1xuXG4gIC8vIFN0cnVjdHVyZWQgY2xvbmluZ1xuICB0cnkge1xuICAgIHdpbmRvdy5wb3N0TWVzc2FnZShtZW0sICcqJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gbWVtO1xufVxuXG5mdW5jdGlvbiBtZWRpYW4odmFsdWVzOiBudW1iZXJbXSk6IG51bWJlciB7XG4gIHZhbHVlcy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIGNvbnN0IGhhbGYgPSBNYXRoLmZsb29yKHZhbHVlcy5sZW5ndGggLyAyKTtcbiAgcmV0dXJuIHZhbHVlcy5sZW5ndGggJSAyID8gdmFsdWVzW2hhbGZdIDogKHZhbHVlc1toYWxmIC0gMV0gKyB2YWx1ZXNbaGFsZl0pIC8gMi4wO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRzOiBDZXZhbE9wdHMpOiBDZXZhbEN0cmwge1xuICBjb25zdCBzdG9yYWdlS2V5ID0gKGs6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiBvcHRzLnN0b3JhZ2VLZXlQcmVmaXggPyBgJHtvcHRzLnN0b3JhZ2VLZXlQcmVmaXh9LiR7a31gIDogaztcbiAgfTtcblxuICAvLyBzZWxlY3Qgd2FzbXggd2l0aCBncm93YWJsZSBzaGFyZWQgbWVtID4gd2FzbXggPiB3YXNtID4gYXNtanNcbiAgbGV0IHRlY2hub2xvZ3k6IENldmFsVGVjaG5vbG9neSA9ICdhc21qcyc7XG4gIGxldCBncm93YWJsZVNoYXJlZE1lbSA9IGZhbHNlO1xuICBpZiAodHlwZW9mIFdlYkFzc2VtYmx5ID09PSAnb2JqZWN0JyAmJiBXZWJBc3NlbWJseS52YWxpZGF0ZShVaW50OEFycmF5Lm9mKDB4MCwgMHg2MSwgMHg3MywgMHg2ZCwgMHgwMSwgMHgwMCwgMHgwMCwgMHgwMCkpKSB7XG4gICAgdGVjaG5vbG9neSA9ICd3YXNtJzsgLy8gV2ViQXNzZW1ibHkgMS4wXG4gICAgaWYgKG9mZmljaWFsU3RvY2tmaXNoKG9wdHMudmFyaWFudC5rZXkpKSB7XG4gICAgICBjb25zdCBzaGFyZWRNZW0gPSBzaGFyZWRXYXNtTWVtb3J5KDgsIDE2KTtcbiAgICAgIGlmIChzaGFyZWRNZW0pIHtcbiAgICAgICAgdGVjaG5vbG9neSA9ICd3YXNteCc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc2hhcmVkTWVtLmdyb3coOCk7XG4gICAgICAgICAgZ3Jvd2FibGVTaGFyZWRNZW0gPSB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7IH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBtYXhUaHJlYWRzID0gTWF0aC5taW4oTWF0aC5tYXgoKG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IHx8IDEpIC0gMSwgMSksIGdyb3dhYmxlU2hhcmVkTWVtID8gMTYgOiAyKTtcbiAgY29uc3QgdGhyZWFkcyA9IHN0b3JlZFByb3Aoc3RvcmFnZUtleSgnY2V2YWwudGhyZWFkcycpLCBNYXRoLm1pbihNYXRoLmNlaWwoKG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IHx8IDEpIC8gNCksIG1heFRocmVhZHMpKTtcblxuICBjb25zdCBtYXhIYXNoU2l6ZSA9IE1hdGgubWluKChuYXZpZ2F0b3IuZGV2aWNlTWVtb3J5IHx8IDAuMjUpICogMTAyNCAvIDgsIGdyb3dhYmxlU2hhcmVkTWVtID8gMTAyNCA6IDE2KTtcbiAgY29uc3QgaGFzaFNpemUgPSBzdG9yZWRQcm9wKHN0b3JhZ2VLZXkoJ2NldmFsLmhhc2gtc2l6ZScpLCAxNik7XG5cbiAgY29uc3QgbWluRGVwdGggPSA2O1xuICBjb25zdCBtYXhEZXB0aCA9IHN0b3JlZFByb3A8bnVtYmVyPihzdG9yYWdlS2V5KCdjZXZhbC5tYXgtZGVwdGgnKSwgMTgpO1xuICBjb25zdCBtdWx0aVB2ID0gc3RvcmVkUHJvcChzdG9yYWdlS2V5KCdjZXZhbC5tdWx0aXB2JyksIG9wdHMubXVsdGlQdkRlZmF1bHQgfHwgMSk7XG4gIGNvbnN0IGluZmluaXRlID0gc3RvcmVkUHJvcCgnY2V2YWwuaW5maW5pdGUnLCBmYWxzZSk7XG4gIGxldCBjdXJFdmFsOiBUcmVlLkNsaWVudEV2YWwgfCBudWxsID0gbnVsbDtcbiAgY29uc3QgZW5hYmxlU3RvcmFnZSA9IGxpLnN0b3JhZ2UubWFrZUJvb2xlYW4oc3RvcmFnZUtleSgnY2xpZW50LWV2YWwtZW5hYmxlZCcpKTtcbiAgY29uc3QgYWxsb3dlZCA9IHByb3AodHJ1ZSk7XG4gIGNvbnN0IGVuYWJsZWQgPSBwcm9wKG9wdHMucG9zc2libGUgJiYgYWxsb3dlZCgpICYmIGVuYWJsZVN0b3JhZ2UuZ2V0KCkgJiYgIWRvY3VtZW50LmhpZGRlbik7XG4gIGxldCBzdGFydGVkOiBTdGFydGVkIHwgZmFsc2UgPSBmYWxzZTtcbiAgbGV0IGxhc3RTdGFydGVkOiBTdGFydGVkIHwgZmFsc2UgPSBmYWxzZTsgLy8gbGFzdCBzdGFydGVkIG9iamVjdCAoZm9yIGdvaW5nIGRlZXBlciBldmVuIGlmIHN0b3BwZWQpXG4gIGNvbnN0IGhvdmVyaW5nID0gcHJvcDxIb3ZlcmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBpc0RlZXBlciA9IHByb3AoZmFsc2UpO1xuXG4gIGNvbnN0IHBvb2wgPSBuZXcgUG9vbCh7XG4gICAgdGVjaG5vbG9neSxcbiAgICBhc21qczogJ3ZlbmRvci9zdG9ja2Zpc2guanMvc3RvY2tmaXNoLmpzJyxcbiAgICB3YXNtOiAndmVuZG9yL3N0b2NrZmlzaC5qcy9zdG9ja2Zpc2gud2FzbS5qcycsXG4gICAgd2FzbXg6IG9mZmljaWFsU3RvY2tmaXNoKG9wdHMudmFyaWFudC5rZXkpID8gJ3ZlbmRvci9zdG9ja2Zpc2gud2FzbS9zdG9ja2Zpc2guanMnIDogJ3ZlbmRvci9zdG9ja2Zpc2gtbXYud2FzbS9zdG9ja2Zpc2guanMnLFxuICB9LCB7XG4gICAgbWluRGVwdGgsXG4gICAgdmFyaWFudDogb3B0cy52YXJpYW50LmtleSxcbiAgICB0aHJlYWRzOiB0ZWNobm9sb2d5ID09ICd3YXNteCcgJiYgKCgpID0+IE1hdGgubWluKHBhcnNlSW50KHRocmVhZHMoKSksIG1heFRocmVhZHMpKSxcbiAgICBoYXNoU2l6ZTogdGVjaG5vbG9neSA9PSAnd2FzbXgnICYmICgoKSA9PiBNYXRoLm1pbihwYXJzZUludChoYXNoU2l6ZSgpKSwgbWF4SGFzaFNpemUpKSxcbiAgfSk7XG5cbiAgLy8gYWRqdXN0cyBtYXhEZXB0aCBiYXNlZCBvbiBub2RlcyBwZXIgc2Vjb25kXG4gIGNvbnN0IG5wc1JlY29yZGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHZhbHVlczogbnVtYmVyW10gPSBbXTtcbiAgICBjb25zdCBhcHBsaWVzID0gZnVuY3Rpb24oZXY6IFRyZWUuQ2xpZW50RXZhbCkge1xuICAgICAgcmV0dXJuIGV2LmtucHMgJiYgZXYuZGVwdGggPj0gMTYgJiZcbiAgICAgICAgdHlwZW9mIGV2LmNwICE9PSAndW5kZWZpbmVkJyAmJiBNYXRoLmFicyhldi5jcCkgPCA1MDAgJiZcbiAgICAgICAgKGV2LmZlbi5zcGxpdCgvXFxzLylbMF0uc3BsaXQoL1tuYnJxa3BdL2kpLmxlbmd0aCAtIDEpID49IDEwO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oZXY6IFRyZWUuQ2xpZW50RXZhbCkge1xuICAgICAgaWYgKCFhcHBsaWVzKGV2KSkgcmV0dXJuO1xuICAgICAgdmFsdWVzLnB1c2goZXYua25wcyk7XG4gICAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDkpIHtcbiAgICAgICAgbGV0IGRlcHRoID0gMTgsXG4gICAgICAgICAga25wcyA9IG1lZGlhbih2YWx1ZXMpIHx8IDA7XG4gICAgICAgIGlmIChrbnBzID4gMTAwKSBkZXB0aCA9IDE5O1xuICAgICAgICBpZiAoa25wcyA+IDE1MCkgZGVwdGggPSAyMDtcbiAgICAgICAgaWYgKGtucHMgPiAyNTApIGRlcHRoID0gMjE7XG4gICAgICAgIGlmIChrbnBzID4gNTAwKSBkZXB0aCA9IDIyO1xuICAgICAgICBpZiAoa25wcyA+IDEwMDApIGRlcHRoID0gMjM7XG4gICAgICAgIGlmIChrbnBzID4gMjAwMCkgZGVwdGggPSAyNDtcbiAgICAgICAgaWYgKGtucHMgPiAzNTAwKSBkZXB0aCA9IDI1O1xuICAgICAgICBpZiAoa25wcyA+IDUwMDApIGRlcHRoID0gMjY7XG4gICAgICAgIGlmIChrbnBzID4gNzAwMCkgZGVwdGggPSAyNztcbiAgICAgICAgbWF4RGVwdGgoZGVwdGgpO1xuICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDQwKSB2YWx1ZXMuc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSgpO1xuXG4gIGxldCBsYXN0RW1pdEZlbjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3Qgb25FbWl0ID0gdGhyb3R0bGUoMjAwLCAoZXY6IFRyZWUuQ2xpZW50RXZhbCwgd29yazogV29yaykgPT4ge1xuICAgIHNvcnRQdnNJblBsYWNlKGV2LnB2cywgKHdvcmsucGx5ICUgMiA9PT0gKHdvcmsudGhyZWF0TW9kZSA/IDEgOiAwKSkgPyAnd2hpdGUnIDogJ2JsYWNrJyk7XG4gICAgbnBzUmVjb3JkZXIoZXYpO1xuICAgIGN1ckV2YWwgPSBldjtcbiAgICBvcHRzLmVtaXQoZXYsIHdvcmspO1xuICAgIGlmIChldi5mZW4gIT09IGxhc3RFbWl0RmVuKSB7XG4gICAgICBsYXN0RW1pdEZlbiA9IGV2LmZlbjtcbiAgICAgIGxpLnN0b3JhZ2UuZmlyZSgnY2V2YWwuZmVuJywgZXYuZmVuKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGVmZmVjdGl2ZU1heERlcHRoID0gKCkgPT4gKGlzRGVlcGVyKCkgfHwgaW5maW5pdGUoKSkgPyA5OSA6IHBhcnNlSW50KG1heERlcHRoKCkpO1xuXG4gIGNvbnN0IHNvcnRQdnNJblBsYWNlID0gKHB2czogVHJlZS5QdkRhdGFbXSwgY29sb3I6IENvbG9yKSA9PlxuICAgIHB2cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBwb3ZDaGFuY2VzKGNvbG9yLCBiKSAtIHBvdkNoYW5jZXMoY29sb3IsIGEpO1xuICAgIH0pO1xuXG4gIGNvbnN0IHN0YXJ0ID0gKHBhdGg6IFRyZWUuUGF0aCwgc3RlcHM6IFN0ZXBbXSwgdGhyZWF0TW9kZTogYm9vbGVhbiwgZGVlcGVyOiBib29sZWFuKSA9PiB7XG5cbiAgICBpZiAoIWVuYWJsZWQoKSB8fCAhb3B0cy5wb3NzaWJsZSkgcmV0dXJuO1xuXG4gICAgaXNEZWVwZXIoZGVlcGVyKTtcbiAgICBjb25zdCBtYXhEID0gZWZmZWN0aXZlTWF4RGVwdGgoKTtcblxuICAgIGNvbnN0IHN0ZXAgPSBzdGVwc1tzdGVwcy5sZW5ndGggLSAxXTtcblxuICAgIGNvbnN0IGV4aXN0aW5nID0gdGhyZWF0TW9kZSA/IHN0ZXAudGhyZWF0IDogc3RlcC5jZXZhbDtcbiAgICBpZiAoZXhpc3RpbmcgJiYgZXhpc3RpbmcuZGVwdGggPj0gbWF4RCkgcmV0dXJuO1xuXG4gICAgY29uc3Qgd29yazogV29yayA9IHtcbiAgICAgIGluaXRpYWxGZW46IHN0ZXBzWzBdLmZlbixcbiAgICAgIG1vdmVzOiBbXSxcbiAgICAgIGN1cnJlbnRGZW46IHN0ZXAuZmVuLFxuICAgICAgcGF0aCxcbiAgICAgIHBseTogc3RlcC5wbHksXG4gICAgICBtYXhEZXB0aDogbWF4RCxcbiAgICAgIG11bHRpUHY6IHBhcnNlSW50KG11bHRpUHYoKSksXG4gICAgICB0aHJlYXRNb2RlLFxuICAgICAgZW1pdChldjogVHJlZS5DbGllbnRFdmFsKSB7XG4gICAgICAgIGlmIChlbmFibGVkKCkpIG9uRW1pdChldiwgd29yayk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0aHJlYXRNb2RlKSB7XG4gICAgICBjb25zdCBjID0gc3RlcC5wbHkgJSAyID09PSAxID8gJ3cnIDogJ2InO1xuICAgICAgY29uc3QgZmVuID0gc3RlcC5mZW4ucmVwbGFjZSgvICh3fGIpIC8sICcgJyArIGMgKyAnICcpO1xuICAgICAgd29yay5jdXJyZW50RmVuID0gZmVuO1xuICAgICAgd29yay5pbml0aWFsRmVuID0gZmVuO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzZW5kIGZlbiBhZnRlciBsYXRlc3QgY2FzdGxpbmcgbW92ZSBhbmQgdGhlIGZvbGxvd2luZyBtb3Zlc1xuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzdGVwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcyA9IHN0ZXBzW2ldO1xuICAgICAgICBpZiAoc2FuSXJyZXZlcnNpYmxlKG9wdHMudmFyaWFudC5rZXksIHMuc2FuISkpIHtcbiAgICAgICAgICB3b3JrLm1vdmVzID0gW107XG4gICAgICAgICAgd29yay5pbml0aWFsRmVuID0gcy5mZW47XG4gICAgICAgIH0gZWxzZSB3b3JrLm1vdmVzLnB1c2gocy51Y2khKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwb29sLnN0YXJ0KHdvcmspO1xuXG4gICAgc3RhcnRlZCA9IHtcbiAgICAgIHBhdGgsXG4gICAgICBzdGVwcyxcbiAgICAgIHRocmVhdE1vZGVcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdvRGVlcGVyKCkge1xuICAgIGNvbnN0IHMgPSBzdGFydGVkIHx8IGxhc3RTdGFydGVkO1xuICAgIGlmIChzKSB7XG4gICAgICBzdG9wKCk7XG4gICAgICBzdGFydChzLnBhdGgsIHMuc3RlcHMsIHMudGhyZWF0TW9kZSwgdHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgaWYgKCFlbmFibGVkKCkgfHwgIXN0YXJ0ZWQpIHJldHVybjtcbiAgICBwb29sLnN0b3AoKTtcbiAgICBsYXN0U3RhcnRlZCA9IHN0YXJ0ZWQ7XG4gICAgc3RhcnRlZCA9IGZhbHNlO1xuICB9O1xuXG4gIC8vIGFzayBvdGhlciB0YWJzIGlmIGEgZ2FtZSBpcyBpbiBwcm9ncmVzc1xuICBpZiAoZW5hYmxlZCgpKSB7XG4gICAgbGkuc3RvcmFnZS5maXJlKCdjZXZhbC5mZW4nLCAnc3RhcnQnKTtcbiAgICBsaS5zdG9yYWdlLm1ha2UoJ3JvdW5kLm9uZ29pbmcnKS5saXN0ZW4oXyA9PiB7XG4gICAgICBlbmFibGVkKGZhbHNlKTtcbiAgICAgIG9wdHMucmVkcmF3KCk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHRlY2hub2xvZ3ksXG4gICAgc3RhcnQsXG4gICAgc3RvcCxcbiAgICBhbGxvd2VkLFxuICAgIHBvc3NpYmxlOiBvcHRzLnBvc3NpYmxlLFxuICAgIGVuYWJsZWQsXG4gICAgbXVsdGlQdixcbiAgICB0aHJlYWRzOiB0ZWNobm9sb2d5ID09ICd3YXNteCcgPyB0aHJlYWRzIDogdW5kZWZpbmVkLFxuICAgIGhhc2hTaXplOiB0ZWNobm9sb2d5ID09ICd3YXNteCcgPyBoYXNoU2l6ZSA6IHVuZGVmaW5lZCxcbiAgICBtYXhUaHJlYWRzLFxuICAgIG1heEhhc2hTaXplLFxuICAgIGluZmluaXRlLFxuICAgIGhvdmVyaW5nLFxuICAgIHNldEhvdmVyaW5nKGZlbjogRmVuLCB1Y2k/OiBVY2kpIHtcbiAgICAgIGhvdmVyaW5nKHVjaSA/IHtcbiAgICAgICAgZmVuLFxuICAgICAgICB1Y2lcbiAgICAgIH0gOiBudWxsKTtcbiAgICAgIG9wdHMuc2V0QXV0b1NoYXBlcygpO1xuICAgIH0sXG4gICAgdG9nZ2xlKCkge1xuICAgICAgaWYgKCFvcHRzLnBvc3NpYmxlIHx8ICFhbGxvd2VkKCkpIHJldHVybjtcbiAgICAgIHN0b3AoKTtcbiAgICAgIGVuYWJsZWQoIWVuYWJsZWQoKSk7XG4gICAgICBpZiAoZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlICE9PSAnaGlkZGVuJylcbiAgICAgICAgZW5hYmxlU3RvcmFnZS5zZXQoZW5hYmxlZCgpKTtcbiAgICB9LFxuICAgIGN1ckRlcHRoOiAoKSA9PiBjdXJFdmFsID8gY3VyRXZhbC5kZXB0aCA6IDAsXG4gICAgZWZmZWN0aXZlTWF4RGVwdGgsXG4gICAgdmFyaWFudDogb3B0cy52YXJpYW50LFxuICAgIGlzRGVlcGVyLFxuICAgIGdvRGVlcGVyLFxuICAgIGNhbkdvRGVlcGVyOiAoKSA9PiAhaXNEZWVwZXIoKSAmJiAhaW5maW5pdGUoKSAmJiAhcG9vbC5pc0NvbXB1dGluZygpLFxuICAgIGlzQ29tcHV0aW5nOiAoKSA9PiAhIXN0YXJ0ZWQgJiYgcG9vbC5pc0NvbXB1dGluZygpLFxuICAgIGVuZ2luZU5hbWU6IHBvb2wuZW5naW5lTmFtZSxcbiAgICBkZXN0cm95OiBwb29sLmRlc3Ryb3ksXG4gICAgcmVkcmF3OiBvcHRzLnJlZHJhd1xuICB9O1xufTtcbiIsImltcG9ydCBjdHJsIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgKiBhcyB2aWV3IGZyb20gJy4vdmlldyc7XG5pbXBvcnQgKiBhcyB3aW5uaW5nQ2hhbmNlcyBmcm9tICcuL3dpbm5pbmdDaGFuY2VzJztcblxuZXhwb3J0IHsgQ2V2YWxDdHJsLCBOb2RlRXZhbHMsIEV2YWwsIFdvcmssIENldmFsT3B0cyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgeyBjdHJsLCB2aWV3LCB3aW5uaW5nQ2hhbmNlcyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNFdmFsQmV0dGVyKGE6IFRyZWUuQ2xpZW50RXZhbCwgYj86IFRyZWUuQ2xpZW50RXZhbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWIgfHwgYS5kZXB0aCA+IGIuZGVwdGggfHwgKGEuZGVwdGggPT09IGIuZGVwdGggJiYgYS5ub2RlcyA+IGIubm9kZXMpO1xufVxuXG4vLyBzdG9wIHdoZW4gYW5vdGhlciB0YWIgc3RhcnRzLiBMaXN0ZW4gb25seSBvbmNlIGhlcmUsXG4vLyBhcyB0aGUgY3RybCBjYW4gYmUgaW5zdGFuY2lhdGVkIHNldmVyYWwgdGltZXMuXG4vLyBnb3R0YSBkbyB0aGUgY2xpY2sgb24gdGhlIHRvZ2dsZSB0byBoYXZlIGl0IHZpc3VhbGx5IGNoYW5nZS5cbndpbmRvdy5saWNoZXNzLnN0b3JhZ2UubWFrZSgnY2V2YWwucG9vbC5zdGFydCcpLmxpc3RlbihfID0+IHtcbiAgY29uc3QgdG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FuYWx5c2UtdG9nZ2xlLWNldmFsJyk7XG4gIGlmICh0b2dnbGUgJiYgKHRvZ2dsZSBhcyBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkKSB0b2dnbGUuY2xpY2soKTtcbn0pO1xuIiwiaW1wb3J0IHsgc3luYywgU3luYyB9IGZyb20gJ2NvbW1vbi9zeW5jJztcbmltcG9ydCB7IFBvb2xPcHRzLCBXb3JrZXJPcHRzLCBXb3JrIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgUHJvdG9jb2wgZnJvbSAnLi9zdG9ja2Zpc2hQcm90b2NvbCc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnN0cmFjdFdvcmtlciB7XG5cbiAgcHJvdGVjdGVkIHByb3RvY29sOiBTeW5jPFByb3RvY29sPjtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgdXJsOiBzdHJpbmcsIHByb3RlY3RlZCBwb29sT3B0czogUG9vbE9wdHMsIHByb3RlY3RlZCB3b3JrZXJPcHRzOiBXb3JrZXJPcHRzKSB7XG4gICAgdGhpcy5wcm90b2NvbCA9IHN5bmModGhpcy5ib290KCkpO1xuICB9XG5cbiAgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5wcm90b2NvbC5wcm9taXNlLnRoZW4ocHJvdG9jb2wgPT4gcHJvdG9jb2wuc3RvcCgpKTtcbiAgfVxuXG4gIHN0YXJ0KHdvcms6IFdvcmspOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5wcm90b2NvbC5wcm9taXNlLnRoZW4ocHJvdG9jb2wgPT4ge1xuICAgICAgcmV0dXJuIHByb3RvY29sLnN0b3AoKS50aGVuKCgpID0+IHByb3RvY29sLnN0YXJ0KHdvcmspKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlzQ29tcHV0aW5nOiAoKSA9PiBib29sZWFuID0gKCkgPT5cbiAgICAhIXRoaXMucHJvdG9jb2wuc3luYyAmJiB0aGlzLnByb3RvY29sLnN5bmMuaXNDb21wdXRpbmcoKTtcblxuICBlbmdpbmVOYW1lOiAoKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQgPSAoKSA9PlxuICAgIHRoaXMucHJvdG9jb2wuc3luYyAmJiB0aGlzLnByb3RvY29sLnN5bmMuZW5naW5lTmFtZTtcblxuICBhYnN0cmFjdCBib290KCk6IFByb21pc2U8UHJvdG9jb2w+O1xuICBhYnN0cmFjdCBzZW5kKGNtZDogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xufVxuXG5jbGFzcyBXZWJXb3JrZXIgZXh0ZW5kcyBBYnN0cmFjdFdvcmtlciB7XG4gIHdvcmtlcjogV29ya2VyO1xuXG4gIGJvb3QoKTogUHJvbWlzZTxQcm90b2NvbD4ge1xuICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcih3aW5kb3cubGljaGVzcy5hc3NldFVybCh0aGlzLnVybCwge3NhbWVEb21haW46IHRydWV9KSk7XG4gICAgY29uc3QgcHJvdG9jb2wgPSBuZXcgUHJvdG9jb2wodGhpcy5zZW5kLmJpbmQodGhpcyksIHRoaXMud29ya2VyT3B0cyk7XG4gICAgdGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGUgPT4ge1xuICAgICAgcHJvdG9jb2wucmVjZWl2ZWQoZS5kYXRhKTtcbiAgICB9LCB0cnVlKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHByb3RvY29sKTtcbiAgfVxuXG4gIHN0YXJ0KHdvcms6IFdvcmspOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyB3YWl0IGZvciBib290XG4gICAgcmV0dXJuIHRoaXMucHJvdG9jb2wucHJvbWlzZS50aGVuKHByb3RvY29sID0+IHtcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBuZXcgUHJvbWlzZSgoXywgcmVqZWN0KSA9PiBzZXRUaW1lb3V0KHJlamVjdCwgMTAwMCkpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmFjZShbcHJvdG9jb2wuc3RvcCgpLCB0aW1lb3V0XSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAvLyByZWJvb3QgaWYgbm90IHN0b3BwZWQgYWZ0ZXIgMXNcbiAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMucHJvdG9jb2wgPSBzeW5jKHRoaXMuYm9vdCgpKTtcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm90b2NvbC5wcm9taXNlLnRoZW4ocHJvdG9jb2wgPT4gcHJvdG9jb2wuc3RhcnQod29yaykpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICB9XG5cbiAgc2VuZChjbWQ6IHN0cmluZykge1xuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKGNtZCk7XG4gIH1cbn1cblxuY2xhc3MgVGhyZWFkZWRXYXNtV29ya2VyIGV4dGVuZHMgQWJzdHJhY3RXb3JrZXIge1xuICBzdGF0aWMgZ2xvYmFsOiBQcm9taXNlPHtpbnN0YW5jZTogdW5rbm93biwgcHJvdG9jb2w6IFByb3RvY29sfT47XG5cbiAgcHJpdmF0ZSBpbnN0YW5jZT86IGFueTtcblxuICBib290KCk6IFByb21pc2U8UHJvdG9jb2w+IHtcbiAgICBpZiAoIVRocmVhZGVkV2FzbVdvcmtlci5nbG9iYWwpIFRocmVhZGVkV2FzbVdvcmtlci5nbG9iYWwgPSB3aW5kb3cubGljaGVzcy5sb2FkU2NyaXB0KHRoaXMudXJsLCB7c2FtZURvbWFpbjogdHJ1ZX0pLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSB0aGlzLmluc3RhbmNlID0gd2luZG93WydTdG9ja2Zpc2gnXSgpLFxuICAgICAgICBwcm90b2NvbCA9IG5ldyBQcm90b2NvbCh0aGlzLnNlbmQuYmluZCh0aGlzKSwgdGhpcy53b3JrZXJPcHRzKSxcbiAgICAgICAgbGlzdGVuZXIgPSBwcm90b2NvbC5yZWNlaXZlZC5iaW5kKHByb3RvY29sKTtcbiAgICAgIGluc3RhbmNlLmFkZE1lc3NhZ2VMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpbnN0YW5jZSwgLy8gYWx3YXlzIHdyYXAsIGluIHByb21pc2UgY29udGV4dCAoaHR0cHM6Ly9naXRodWIuY29tL2Vtc2NyaXB0ZW4tY29yZS9lbXNjcmlwdGVuL2lzc3Vlcy81ODIwKVxuICAgICAgICBwcm90b2NvbFxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gVGhyZWFkZWRXYXNtV29ya2VyLmdsb2JhbC50aGVuKGdsb2JhbCA9PiB7XG4gICAgICB0aGlzLmluc3RhbmNlID0gZ2xvYmFsLmluc3RhbmNlO1xuICAgICAgcmV0dXJuIGdsb2JhbC5wcm90b2NvbDtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKFRocmVhZGVkV2FzbVdvcmtlci5nbG9iYWwpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdzdG9wcGluZyBzaW5nbGV0b24gd2FzbXggd29ya2VyIChpbnN0ZWFkIG9mIGRlc3Ryb3lpbmcpIC4uLicpO1xuICAgICAgdGhpcy5zdG9wKCkudGhlbigoKSA9PiBjb25zb2xlLmxvZygnLi4uIHN1Y2Nlc3NmdWxseSBzdG9wcGVkJykpO1xuICAgIH1cbiAgfVxuXG4gIHNlbmQoY21kOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5pbnN0YW5jZSkgdGhpcy5pbnN0YW5jZS5wb3N0TWVzc2FnZShjbWQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQb29sIHtcbiAgcHJpdmF0ZSB3b3JrZXJzOiBBYnN0cmFjdFdvcmtlcltdID0gW107XG4gIHByaXZhdGUgdG9rZW4gPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcG9vbE9wdHM6IFBvb2xPcHRzLCBwcml2YXRlIHByb3RvY29sT3B0czogV29ya2VyT3B0cykgeyB9XG5cbiAgZ2V0V29ya2VyKCk6IFByb21pc2U8QWJzdHJhY3RXb3JrZXI+IHtcbiAgICB0aGlzLndhcm11cCgpO1xuXG4gICAgLy8gYnJpZWZseSB3YWl0IGFuZCBnaXZlIGEgY2hhbmNlIHRvIHJldXNlIHRoZSBjdXJyZW50IHdvcmtlclxuICAgIGNvbnN0IHdvcmtlciA9IG5ldyBQcm9taXNlPEFic3RyYWN0V29ya2VyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50V29ya2VyID0gdGhpcy53b3JrZXJzW3RoaXMudG9rZW5dO1xuICAgICAgY3VycmVudFdvcmtlci5zdG9wKCkudGhlbigoKSA9PiByZXNvbHZlKGN1cnJlbnRXb3JrZXIpKTtcbiAgICAgIHNldFRpbWVvdXQocmVqZWN0LCA1MCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gd29ya2VyLmNhdGNoKCgpID0+IHtcbiAgICAgIHRoaXMudG9rZW4gPSAodGhpcy50b2tlbiArIDEpICUgdGhpcy53b3JrZXJzLmxlbmd0aDtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy53b3JrZXJzW3RoaXMudG9rZW5dKTtcbiAgICB9KTtcbiAgfVxuXG4gIHdhcm11cCA9ICgpID0+IHtcbiAgICBpZiAodGhpcy53b3JrZXJzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgaWYgKHRoaXMucG9vbE9wdHMudGVjaG5vbG9neSA9PSAnd2FzbXgnKVxuICAgICAgdGhpcy53b3JrZXJzLnB1c2gobmV3IFRocmVhZGVkV2FzbVdvcmtlcih0aGlzLnBvb2xPcHRzLndhc214LCB0aGlzLnBvb2xPcHRzLCB0aGlzLnByb3RvY29sT3B0cykpO1xuICAgIGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMjsgaSsrKVxuICAgICAgICB0aGlzLndvcmtlcnMucHVzaChuZXcgV2ViV29ya2VyKHRoaXMucG9vbE9wdHMudGVjaG5vbG9neSA9PSAnd2FzbScgPyB0aGlzLnBvb2xPcHRzLndhc20gOiB0aGlzLnBvb2xPcHRzLmFzbWpzLCB0aGlzLnBvb2xPcHRzLCB0aGlzLnByb3RvY29sT3B0cykpO1xuICAgIH1cbiAgfVxuXG4gIHN0b3AgPSAoKSA9PiB0aGlzLndvcmtlcnMuZm9yRWFjaCh3ID0+IHcuc3RvcCgpKTtcblxuICBkZXN0cm95ID0gKCkgPT4ge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMud29ya2Vycy5mb3JFYWNoKHcgPT4gdy5kZXN0cm95KCkpO1xuICB9O1xuXG4gIHN0YXJ0ID0gKHdvcms6IFdvcmspID0+IHtcbiAgICB3aW5kb3cubGljaGVzcy5zdG9yYWdlLmZpcmUoJ2NldmFsLnBvb2wuc3RhcnQnKTtcbiAgICB0aGlzLmdldFdvcmtlcigpLnRoZW4oZnVuY3Rpb24od29ya2VyKSB7XG4gICAgICB3b3JrZXIuc3RhcnQod29yayk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gd2luZG93LmxpY2hlc3MucmVsb2FkKCksIDEwMDAwKTtcbiAgICB9KTtcbiAgfTtcblxuICBpc0NvbXB1dGluZyA9ICgpID0+XG4gICAgISF0aGlzLndvcmtlcnMubGVuZ3RoICYmIHRoaXMud29ya2Vyc1t0aGlzLnRva2VuXS5pc0NvbXB1dGluZygpO1xuXG4gIGVuZ2luZU5hbWU6ICgpID0+IHN0cmluZyB8IHVuZGVmaW5lZCA9ICgpID0+XG4gICAgdGhpcy53b3JrZXJzW3RoaXMudG9rZW5dICYmIHRoaXMud29ya2Vyc1t0aGlzLnRva2VuXS5lbmdpbmVOYW1lKCk7XG59XG4iLCJpbXBvcnQgeyB2YXJpYW50VG9SdWxlcyB9IGZyb20gJ2NoZXNzJztcbmltcG9ydCB7IFdvcmtlck9wdHMsIFdvcmsgfSBmcm9tICcuL3R5cGVzJztcblxuY29uc3QgRVZBTF9SRUdFWCA9IG5ldyBSZWdFeHAoJydcbiAgKyAvXmluZm8gZGVwdGggKFxcZCspIHNlbGRlcHRoIFxcZCsgbXVsdGlwdiAoXFxkKykgLy5zb3VyY2VcbiAgKyAvc2NvcmUgKGNwfG1hdGUpIChbLVxcZF0rKSAvLnNvdXJjZVxuICArIC8oPzoodXBwZXJ8bG93ZXIpYm91bmQgKT9ub2RlcyAoXFxkKykgbnBzIFxcUysgLy5zb3VyY2VcbiAgKyAvKD86aGFzaGZ1bGwgXFxkKyApPyg/OnRiaGl0cyBcXGQrICk/dGltZSAoXFxTKykgLy5zb3VyY2VcbiAgKyAvcHYgKC4rKS8uc291cmNlKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvdG9jb2wge1xuICBwcml2YXRlIHdvcms6IFdvcmsgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjdXJFdmFsOiBUcmVlLkNsaWVudEV2YWwgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBleHBlY3RlZFB2cyA9IDE7XG4gIHByaXZhdGUgc3RvcHBlZDogRGVmZXJQcm9taXNlLkRlZmVycmVkPHZvaWQ+IHwgbnVsbDtcblxuICBwdWJsaWMgZW5naW5lTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc2VuZDogKGNtZDogc3RyaW5nKSA9PiB2b2lkLCBwcml2YXRlIG9wdHM6IFdvcmtlck9wdHMpIHtcblxuICAgIHRoaXMuc3RvcHBlZCA9IGRlZmVyPHZvaWQ+KCk7XG4gICAgdGhpcy5zdG9wcGVkLnJlc29sdmUoKTtcblxuICAgIC8vIGdldCBlbmdpbmUgbmFtZS92ZXJzaW9uXG4gICAgdGhpcy5zZW5kKCd1Y2knKTtcblxuICAgIC8vIGFuYWx5c2Ugd2l0aG91dCBjb250ZW1wdFxuICAgIHRoaXMuc2V0T3B0aW9uKCdVQ0lfQW5hbHlzZU1vZGUnLCAndHJ1ZScpO1xuICAgIHRoaXMuc2V0T3B0aW9uKCdBbmFseXNpcyBDb250ZW1wdCcsICdPZmYnKTtcblxuICAgIGlmIChvcHRzLnZhcmlhbnQgPT09ICdmcm9tUG9zaXRpb24nIHx8IG9wdHMudmFyaWFudCA9PT0gJ2NoZXNzOTYwJylcbiAgICAgIHRoaXMuc2V0T3B0aW9uKCdVQ0lfQ2hlc3M5NjAnLCAndHJ1ZScpO1xuICAgIGVsc2UgaWYgKG9wdHMudmFyaWFudCA9PT0gJ2FudGljaGVzcycpXG4gICAgICB0aGlzLnNldE9wdGlvbignVUNJX1ZhcmlhbnQnLCAnZ2l2ZWF3YXknKTtcbiAgICBlbHNlIGlmIChvcHRzLnZhcmlhbnQgIT09ICdzdGFuZGFyZCcpXG4gICAgICB0aGlzLnNldE9wdGlvbignVUNJX1ZhcmlhbnQnLCB2YXJpYW50VG9SdWxlcyhvcHRzLnZhcmlhbnQpKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0T3B0aW9uKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICAgIHRoaXMuc2VuZChgc2V0b3B0aW9uIG5hbWUgJHtuYW1lfSB2YWx1ZSAke3ZhbHVlfWApO1xuICB9XG5cbiAgcmVjZWl2ZWQodGV4dDogc3RyaW5nKSB7XG4gICAgaWYgKHRleHQuc3RhcnRzV2l0aCgnaWQgbmFtZSAnKSkgdGhpcy5lbmdpbmVOYW1lID0gdGV4dC5zdWJzdHJpbmcoJ2lkIG5hbWUgJy5sZW5ndGgpO1xuICAgIGVsc2UgaWYgKHRleHQuc3RhcnRzV2l0aCgnYmVzdG1vdmUgJykpIHtcbiAgICAgIGlmICghdGhpcy5zdG9wcGVkKSB0aGlzLnN0b3BwZWQgPSBkZWZlcjx2b2lkPigpO1xuICAgICAgdGhpcy5zdG9wcGVkLnJlc29sdmUoKTtcbiAgICAgIGlmICh0aGlzLndvcmsgJiYgdGhpcy5jdXJFdmFsKSB0aGlzLndvcmsuZW1pdCh0aGlzLmN1ckV2YWwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMud29yaykgcmV0dXJuO1xuXG4gICAgbGV0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKEVWQUxfUkVHRVgpO1xuICAgIGlmICghbWF0Y2hlcykgcmV0dXJuO1xuXG4gICAgbGV0IGRlcHRoID0gcGFyc2VJbnQobWF0Y2hlc1sxXSksXG4gICAgICBtdWx0aVB2ID0gcGFyc2VJbnQobWF0Y2hlc1syXSksXG4gICAgICBpc01hdGUgPSBtYXRjaGVzWzNdID09PSAnbWF0ZScsXG4gICAgICBldiA9IHBhcnNlSW50KG1hdGNoZXNbNF0pLFxuICAgICAgZXZhbFR5cGUgPSBtYXRjaGVzWzVdLFxuICAgICAgbm9kZXMgPSBwYXJzZUludChtYXRjaGVzWzZdKSxcbiAgICAgIGVsYXBzZWRNczogbnVtYmVyID0gcGFyc2VJbnQobWF0Y2hlc1s3XSksXG4gICAgICBtb3ZlcyA9IG1hdGNoZXNbOF0uc3BsaXQoJyAnKTtcblxuICAgIC8vIFNvbWV0aW1lcyB3ZSBnZXQgIzAuIExldCdzIGp1c3Qgc2tpcCBpdC5cbiAgICBpZiAoaXNNYXRlICYmICFldikgcmV0dXJuO1xuXG4gICAgLy8gVHJhY2sgbWF4IHB2IGluZGV4IHRvIGRldGVybWluZSB3aGVuIHB2IHByaW50cyBhcmUgZG9uZS5cbiAgICBpZiAodGhpcy5leHBlY3RlZFB2cyA8IG11bHRpUHYpIHRoaXMuZXhwZWN0ZWRQdnMgPSBtdWx0aVB2O1xuXG4gICAgaWYgKGRlcHRoIDwgdGhpcy5vcHRzLm1pbkRlcHRoKSByZXR1cm47XG5cbiAgICBsZXQgcGl2b3QgPSB0aGlzLndvcmsudGhyZWF0TW9kZSA/IDAgOiAxO1xuICAgIGlmICh0aGlzLndvcmsucGx5ICUgMiA9PT0gcGl2b3QpIGV2ID0gLWV2O1xuXG4gICAgLy8gRm9yIG5vdywgaWdub3JlIG1vc3QgdXBwZXJib3VuZC9sb3dlcmJvdW5kIG1lc3NhZ2VzLlxuICAgIC8vIFRoZSBleGNlcHRpb24gaXMgZm9yIG11bHRpUFYsIHNvbWV0aW1lcyBub24tcHJpbWFyeSBQVnNcbiAgICAvLyBvbmx5IGhhdmUgYW4gdXBwZXJib3VuZC5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZHVnb3ZpYy9TdG9ja2Zpc2gvaXNzdWVzLzIyOFxuICAgIGlmIChldmFsVHlwZSAmJiBtdWx0aVB2ID09PSAxKSByZXR1cm47XG5cbiAgICBsZXQgcHZEYXRhID0ge1xuICAgICAgbW92ZXMsXG4gICAgICBjcDogaXNNYXRlID8gdW5kZWZpbmVkIDogZXYsXG4gICAgICBtYXRlOiBpc01hdGUgPyBldiA6IHVuZGVmaW5lZCxcbiAgICAgIGRlcHRoLFxuICAgIH07XG5cbiAgICBpZiAobXVsdGlQdiA9PT0gMSkge1xuICAgICAgdGhpcy5jdXJFdmFsID0ge1xuICAgICAgICBmZW46IHRoaXMud29yay5jdXJyZW50RmVuLFxuICAgICAgICBtYXhEZXB0aDogdGhpcy53b3JrLm1heERlcHRoLFxuICAgICAgICBkZXB0aCxcbiAgICAgICAga25wczogbm9kZXMgLyBlbGFwc2VkTXMsXG4gICAgICAgIG5vZGVzLFxuICAgICAgICBjcDogaXNNYXRlID8gdW5kZWZpbmVkIDogZXYsXG4gICAgICAgIG1hdGU6IGlzTWF0ZSA/IGV2IDogdW5kZWZpbmVkLFxuICAgICAgICBwdnM6IFtwdkRhdGFdLFxuICAgICAgICBtaWxsaXM6IGVsYXBzZWRNc1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY3VyRXZhbCkge1xuICAgICAgdGhpcy5jdXJFdmFsLnB2cy5wdXNoKHB2RGF0YSk7XG4gICAgICB0aGlzLmN1ckV2YWwuZGVwdGggPSBNYXRoLm1pbih0aGlzLmN1ckV2YWwuZGVwdGgsIGRlcHRoKTtcbiAgICB9XG5cbiAgICBpZiAobXVsdGlQdiA9PT0gdGhpcy5leHBlY3RlZFB2cyAmJiB0aGlzLmN1ckV2YWwpIHtcbiAgICAgIHRoaXMud29yay5lbWl0KHRoaXMuY3VyRXZhbCk7XG4gICAgfVxuICB9XG5cbiAgc3RhcnQodzogV29yaykge1xuICAgIGlmICghdGhpcy5zdG9wcGVkKSB7XG4gICAgICAvLyBUT0RPOiBXb3JrIGlzIHN0YXJ0ZWQgYnkgYmFzaWNhbGx5IGRvaW5nIHN0b3AoKS50aGVuKCgpID0+IHN0YXJ0KHcpKS5cbiAgICAgIC8vIFRoZXJlIGlzIGEgcmFjZSBjb25kaXRpb24gd2hlcmUgbXVsdGlwbGUgY2FsbGVycyBhcmUgd2FpdGluZyBmb3JcbiAgICAgIC8vIGNvbXBsZXRpb24gb2YgdGhlIHNhbWUgc3RvcCBmdXR1cmUsIGFuZCBzbyB0aGV5IHdpbGwgc3RhcnQgd29yayBhdFxuICAgICAgLy8gdGhlIHNhbWUgdGltZS5cbiAgICAgIC8vIFRoaXMgY2FuIGxlYWQgdG8gYWxsIGtpbmRzIG9mIGlzc3VlcywgaW5jbHVkaW5nIGRlYWRsb2Nrcy4gSW5zdGVhZFxuICAgICAgLy8gd2UgaWdub3JlIGFsbCBidXQgdGhlIGZpcnN0IHJlcXVlc3QuIFRoZSBlbmdpbmUgd2lsbCBzaG93IGFzIGxvYWRpbmdcbiAgICAgIC8vIGluZGVmaW5pdGVseS4gVW50aWwgdGhpcyBpcyBmaXhlZCwgaXQgaXMgc3RpbGwgYmV0dGVyIHRoYW4gYVxuICAgICAgLy8gcG9zc2libGUgZGVhZGxvY2suXG4gICAgICBjb25zb2xlLmxvZygnY2V2YWw6IHRyaWVkIHRvIHN0YXJ0IGFuYWx5c2luZyBiZWZvcmUgcmVxdWVzdGluZyBzdG9wJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMud29yayA9IHc7XG4gICAgdGhpcy5jdXJFdmFsID0gbnVsbDtcbiAgICB0aGlzLnN0b3BwZWQgPSBudWxsO1xuICAgIHRoaXMuZXhwZWN0ZWRQdnMgPSAxO1xuICAgIGlmICh0aGlzLm9wdHMudGhyZWFkcykgdGhpcy5zZXRPcHRpb24oJ1RocmVhZHMnLCB0aGlzLm9wdHMudGhyZWFkcygpKTtcbiAgICBpZiAodGhpcy5vcHRzLmhhc2hTaXplKSB0aGlzLnNldE9wdGlvbignSGFzaCcsIHRoaXMub3B0cy5oYXNoU2l6ZSgpKTtcbiAgICB0aGlzLnNldE9wdGlvbignTXVsdGlQVicsIHRoaXMud29yay5tdWx0aVB2KTtcbiAgICB0aGlzLnNlbmQoWydwb3NpdGlvbicsICdmZW4nLCB0aGlzLndvcmsuaW5pdGlhbEZlbiwgJ21vdmVzJ10uY29uY2F0KHRoaXMud29yay5tb3Zlcykuam9pbignICcpKTtcbiAgICBpZiAodGhpcy53b3JrLm1heERlcHRoID49IDk5KSB0aGlzLnNlbmQoJ2dvIGRlcHRoIDk5Jyk7XG4gICAgZWxzZSB0aGlzLnNlbmQoJ2dvIG1vdmV0aW1lIDkwMDAwIGRlcHRoICcgKyB0aGlzLndvcmsubWF4RGVwdGgpO1xuICB9XG5cbiAgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuc3RvcHBlZCkge1xuICAgICAgdGhpcy53b3JrID0gbnVsbDtcbiAgICAgIHRoaXMuc3RvcHBlZCA9IGRlZmVyPHZvaWQ+KCk7XG4gICAgICB0aGlzLnNlbmQoJ3N0b3AnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RvcHBlZC5wcm9taXNlO1xuICB9XG5cbiAgaXNDb21wdXRpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLnN0b3BwZWQ7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGRlZmVyPEE+KCk6IERlZmVyUHJvbWlzZS5EZWZlcnJlZDxBPiB7XG4gIGNvbnN0IGRlZmVycmVkOiBQYXJ0aWFsPERlZmVyUHJvbWlzZS5EZWZlcnJlZDxBPj4gPSB7fVxuICBkZWZlcnJlZC5wcm9taXNlID0gbmV3IFByb21pc2U8QT4oZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGRlZmVycmVkLnJlc29sdmUgPSByZXNvbHZlXG4gICAgZGVmZXJyZWQucmVqZWN0ID0gcmVqZWN0XG4gIH0pXG4gIHJldHVybiBkZWZlcnJlZCBhcyBEZWZlclByb21pc2UuRGVmZXJyZWQ8QT47XG59XG4iLCJpbXBvcnQgeyBFdmFsLCBDZXZhbEN0cmwsIFBhcmVudEN0cmwsIE5vZGVFdmFscyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0ICogYXMgd2lubmluZ0NoYW5jZXMgZnJvbSAnLi93aW5uaW5nQ2hhbmNlcyc7XG5pbXBvcnQgeyBkZWZpbmVkIH0gZnJvbSAnY29tbW9uJztcbmltcG9ydCB7IHJlbmRlckV2YWwsIHZhcmlhbnRUb1J1bGVzIH0gZnJvbSAnY2hlc3MnO1xuaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IG9wcG9zaXRlLCBwYXJzZVVjaSB9IGZyb20gJ2NoZXNzb3BzL3V0aWwnO1xuaW1wb3J0IHsgcGFyc2VGZW4gfSBmcm9tICdjaGVzc29wcy9mZW4nO1xuaW1wb3J0IHsgbWFrZVNhblZhcmlhdGlvbiB9IGZyb20gJ2NoZXNzb3BzL3Nhbic7XG5pbXBvcnQgeyBzZXR1cFBvc2l0aW9uIH0gZnJvbSAnY2hlc3NvcHMvdmFyaWFudCc7XG5cbmxldCBnYXVnZUxhc3QgPSAwO1xuY29uc3QgZ2F1Z2VUaWNrczogVk5vZGVbXSA9IFsuLi5BcnJheSg4KS5rZXlzKCldLm1hcChpID0+XG4gIGgoaSA9PT0gMyA/ICd0aWNrLnplcm8nIDogJ3RpY2snLCB7IGF0dHJzOiB7IHN0eWxlOiBgaGVpZ2h0OiAkeyhpICsgMSkgKiAxMi41fSVgIH0gfSlcbik7XG5cbmZ1bmN0aW9uIGxvY2FsRXZhbEluZm8oY3RybDogUGFyZW50Q3RybCwgZXZzOiBOb2RlRXZhbHMpOiBBcnJheTxWTm9kZSB8IHN0cmluZz4ge1xuICBjb25zdCBjZXZhbCA9IGN0cmwuZ2V0Q2V2YWwoKSwgdHJhbnMgPSBjdHJsLnRyYW5zO1xuICBpZiAoIWV2cy5jbGllbnQpIHJldHVybiBbXG4gICAgZXZzLnNlcnZlciAmJiBjdHJsLm5leHROb2RlQmVzdCgpID8gdHJhbnMubm9hcmcoJ3VzaW5nU2VydmVyQW5hbHlzaXMnKSA6IHRyYW5zLm5vYXJnKCdsb2FkaW5nRW5naW5lJyksXG4gIF07XG5cbiAgY29uc3QgdDogQXJyYXk8Vk5vZGUgfCBzdHJpbmc+ID0gZXZzLmNsaWVudC5jbG91ZCA/IFtcbiAgICB0cmFucygnZGVwdGhYJywgZXZzLmNsaWVudC5kZXB0aCB8fCAwKSxcbiAgICBoKCdzcGFuLmNsb3VkJywgeyBhdHRyczogeyB0aXRsZTogdHJhbnMubm9hcmcoJ2Nsb3VkQW5hbHlzaXMnKSB9IH0sICdDbG91ZCcpXG4gIF0gOiBbXG4gICAgdHJhbnMoJ2RlcHRoWCcsIChldnMuY2xpZW50LmRlcHRoIHx8IDApICsgJy8nICsgZXZzLmNsaWVudC5tYXhEZXB0aClcbiAgXTtcbiAgaWYgKGNldmFsLmNhbkdvRGVlcGVyKCkpIHQucHVzaChoKCdhLmRlZXBlcicsIHtcbiAgICBhdHRyczoge1xuICAgICAgdGl0bGU6IHRyYW5zLm5vYXJnKCdnb0RlZXBlcicpLFxuICAgICAgJ2RhdGEtaWNvbic6ICdPJ1xuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0OiB2bm9kZSA9PiAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY2V2YWwuZ29EZWVwZXIoKTtcbiAgICAgICAgY2V2YWwucmVkcmF3KCk7XG4gICAgICB9KVxuICAgIH1cbiAgfSkpO1xuICBlbHNlIGlmICghZXZzLmNsaWVudC5jbG91ZCAmJiBldnMuY2xpZW50LmtucHMpIHQucHVzaCgnLCAnICsgTWF0aC5yb3VuZChldnMuY2xpZW50LmtucHMpICsgJyBrbm9kZXMvcycpO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gdGhyZWF0SW5mbyhjdHJsOiBQYXJlbnRDdHJsLCB0aHJlYXQ/OiBUcmVlLkNsaWVudEV2YWwgfCBmYWxzZSk6IHN0cmluZyB7XG4gIGlmICghdGhyZWF0KSByZXR1cm4gY3RybC50cmFucy5ub2FyZygnbG9hZGluZ0VuZ2luZScpO1xuICBsZXQgdCA9IGN0cmwudHJhbnMoJ2RlcHRoWCcsICh0aHJlYXQuZGVwdGggfHwgMCkgKyAnLycgKyB0aHJlYXQubWF4RGVwdGgpO1xuICBpZiAodGhyZWF0LmtucHMpIHQgKz0gJywgJyArIE1hdGgucm91bmQodGhyZWF0LmtucHMpICsgJyBrbm9kZXMvcyc7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiB0aHJlYXRCdXR0b24oY3RybDogUGFyZW50Q3RybCk6IFZOb2RlIHwgbnVsbCB7XG4gIGlmIChjdHJsLmRpc2FibGVUaHJlYXRNb2RlICYmIGN0cmwuZGlzYWJsZVRocmVhdE1vZGUoKSkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBoKCdhLnNob3ctdGhyZWF0Jywge1xuICAgIGNsYXNzOiB7XG4gICAgICBhY3RpdmU6IGN0cmwudGhyZWF0TW9kZSgpLFxuICAgICAgaGlkZGVuOiAhIWN0cmwuZ2V0Tm9kZSgpLmNoZWNrXG4gICAgfSxcbiAgICBhdHRyczoge1xuICAgICAgJ2RhdGEtaWNvbic6ICc3JyxcbiAgICAgIHRpdGxlOiBjdHJsLnRyYW5zLm5vYXJnKCdzaG93VGhyZWF0JykgKyAnICh4KSdcbiAgICB9LFxuICAgIGhvb2s6IHtcbiAgICAgIGluc2VydDogdm5vZGUgPT4gKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjdHJsLnRvZ2dsZVRocmVhdE1vZGUpXG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZW5naW5lTmFtZShjdHJsOiBDZXZhbEN0cmwpOiBWTm9kZVtdIHtcbiAgY29uc3QgdmVyc2lvbiA9IGN0cmwuZW5naW5lTmFtZSgpO1xuICByZXR1cm4gW1xuICAgIGgoJ3NwYW4nLCB2ZXJzaW9uID8geyBhdHRyczogeyB0aXRsZTogdmVyc2lvbiB9IH0gOiB7fSwgY3RybC50ZWNobm9sb2d5ID09ICd3YXNteCcgPyB3aW5kb3cubGljaGVzcy5lbmdpbmVOYW1lIDogJ1N0b2NrZmlzaCAxMCsnKSxcbiAgICBjdHJsLnRlY2hub2xvZ3kgPT0gJ3dhc214JyA/IGgoJ3NwYW4ubmF0aXZlJywgeyBhdHRyczogeyB0aXRsZTogJ011bHRpLXRocmVhZGVkIFdlYkFzc2VtYmx5IChleHBlcmltZW50YWwpJyB9IH0sICd3YXNteCcpIDpcbiAgICAgIChjdHJsLnRlY2hub2xvZ3kgPT0gJ3dhc20nID8gaCgnc3Bhbi5uYXRpdmUnLCB7IGF0dHJzOiB7IHRpdGxlOiAnV2ViQXNzZW1ibHknIH0gfSwgJ3dhc20nKSA6XG4gICAgICAgIGgoJ3NwYW4uYXNtanMnLCB7IGF0dHJzOiB7IHRpdGxlOiAnSmF2YVNjcmlwdCBmYWxsYmFjaycgfSB9LCAnYXNtanMnKSlcbiAgXTtcbn1cblxuY29uc3Qgc2VydmVyTm9kZXMgPSA0ZTY7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCZXN0RXZhbChldnM6IE5vZGVFdmFscyk6IEV2YWwgfCB1bmRlZmluZWQge1xuICBjb25zdCBzZXJ2ZXJFdiA9IGV2cy5zZXJ2ZXIsXG4gICAgbG9jYWxFdiA9IGV2cy5jbGllbnQ7XG5cbiAgaWYgKCFzZXJ2ZXJFdikgcmV0dXJuIGxvY2FsRXY7XG4gIGlmICghbG9jYWxFdikgcmV0dXJuIHNlcnZlckV2O1xuXG4gIC8vIFByZWZlciBsb2NhbEV2IGlmIGl0IGV4ZWVkcyBmaXNobmV0IG5vZGUgbGltaXQgb3IgZmluZHMgYSBiZXR0ZXIgbWF0ZS5cbiAgaWYgKGxvY2FsRXYubm9kZXMgPiBzZXJ2ZXJOb2RlcyB8fFxuICAgICh0eXBlb2YgbG9jYWxFdi5tYXRlICE9PSAndW5kZWZpbmVkJyAmJiAodHlwZW9mIHNlcnZlckV2Lm1hdGUgPT09ICd1bmRlZmluZWQnIHx8IE1hdGguYWJzKGxvY2FsRXYubWF0ZSkgPCBNYXRoLmFicyhzZXJ2ZXJFdi5tYXRlKSkpKVxuICAgIHJldHVybiBsb2NhbEV2O1xuXG4gIHJldHVybiBzZXJ2ZXJFdjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckdhdWdlKGN0cmw6IFBhcmVudEN0cmwpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGlmIChjdHJsLm9uZ29pbmcgfHwgIWN0cmwuc2hvd0V2YWxHYXVnZSgpKSByZXR1cm47XG4gIGxldCBldiwgYmVzdEV2ID0gZ2V0QmVzdEV2YWwoY3RybC5jdXJyZW50RXZhbHMoKSk7XG4gIGlmIChiZXN0RXYpIHtcbiAgICBldiA9IHdpbm5pbmdDaGFuY2VzLnBvdkNoYW5jZXMoJ3doaXRlJywgYmVzdEV2KTtcbiAgICBnYXVnZUxhc3QgPSBldjtcbiAgfSBlbHNlIGV2ID0gZ2F1Z2VMYXN0O1xuICByZXR1cm4gaCgnZGl2LmV2YWwtZ2F1Z2UnLCB7XG4gICAgY2xhc3M6IHtcbiAgICAgIGVtcHR5OiBldiA9PT0gbnVsbCxcbiAgICAgIHJldmVyc2U6IGN0cmwuZ2V0T3JpZW50YXRpb24oKSA9PT0gJ2JsYWNrJ1xuICAgIH1cbiAgfSwgW1xuICAgIGgoJ2Rpdi5ibGFjaycsIHsgYXR0cnM6IHsgc3R5bGU6IGBoZWlnaHQ6ICR7MTAwIC0gKGV2ICsgMSkgKiA1MH0lYCB9IH0pLFxuICAgIC4uLmdhdWdlVGlja3NcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJDZXZhbChjdHJsOiBQYXJlbnRDdHJsKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBjb25zdCBpbnN0YW5jZSA9IGN0cmwuZ2V0Q2V2YWwoKSwgdHJhbnMgPSBjdHJsLnRyYW5zO1xuICBpZiAoIWluc3RhbmNlLmFsbG93ZWQoKSB8fCAhaW5zdGFuY2UucG9zc2libGUgfHwgIWN0cmwuc2hvd0NvbXB1dGVyKCkpIHJldHVybjtcbiAgY29uc3QgZW5hYmxlZCA9IGluc3RhbmNlLmVuYWJsZWQoKSxcbiAgICBldnMgPSBjdHJsLmN1cnJlbnRFdmFscygpLFxuICAgIHRocmVhdE1vZGUgPSBjdHJsLnRocmVhdE1vZGUoKSxcbiAgICB0aHJlYXQgPSB0aHJlYXRNb2RlICYmIGN0cmwuZ2V0Tm9kZSgpLnRocmVhdCxcbiAgICBiZXN0RXYgPSB0aHJlYXQgfHwgZ2V0QmVzdEV2YWwoZXZzKTtcbiAgbGV0IHBlYXJsOiBWTm9kZSB8IHN0cmluZywgcGVyY2VudDogbnVtYmVyO1xuICBpZiAoYmVzdEV2ICYmIHR5cGVvZiBiZXN0RXYuY3AgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcGVhcmwgPSByZW5kZXJFdmFsKGJlc3RFdi5jcCk7XG4gICAgcGVyY2VudCA9IGV2cy5jbGllbnQgPyBNYXRoLm1pbigxMDAsIE1hdGgucm91bmQoMTAwICogZXZzLmNsaWVudC5kZXB0aCAvIChldnMuY2xpZW50Lm1heERlcHRoIHx8IGluc3RhbmNlLmVmZmVjdGl2ZU1heERlcHRoKCkpKSkgOiAwO1xuICB9IGVsc2UgaWYgKGJlc3RFdiAmJiBkZWZpbmVkKGJlc3RFdi5tYXRlKSkge1xuICAgIHBlYXJsID0gJyMnICsgYmVzdEV2Lm1hdGU7XG4gICAgcGVyY2VudCA9IDEwMDtcbiAgfSBlbHNlIGlmIChjdHJsLmdhbWVPdmVyKCkpIHtcbiAgICBwZWFybCA9ICctJztcbiAgICBwZXJjZW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICBwZWFybCA9IGVuYWJsZWQgPyBoKCdpLmRkbG9hZGVyJykgOiBoKCdpJyk7XG4gICAgcGVyY2VudCA9IDA7XG4gIH1cbiAgaWYgKHRocmVhdE1vZGUpIHtcbiAgICBpZiAodGhyZWF0KSBwZXJjZW50ID0gTWF0aC5taW4oMTAwLCBNYXRoLnJvdW5kKDEwMCAqIHRocmVhdC5kZXB0aCAvIHRocmVhdC5tYXhEZXB0aCkpO1xuICAgIGVsc2UgcGVyY2VudCA9IDA7XG4gIH1cblxuICBjb25zdCBwcm9ncmVzc0JhcjogVk5vZGUgfCBudWxsID0gZW5hYmxlZCA/IGgoJ2Rpdi5iYXInLCBoKCdzcGFuJywge1xuICAgIGNsYXNzOiB7IHRocmVhdDogdGhyZWF0TW9kZSB9LFxuICAgIGF0dHJzOiB7IHN0eWxlOiBgd2lkdGg6ICR7cGVyY2VudH0lYCB9LFxuICAgIGhvb2s6IHtcbiAgICAgIHBvc3RwYXRjaDogKG9sZCwgdm5vZGUpID0+IHtcbiAgICAgICAgaWYgKG9sZC5kYXRhIS5wZXJjZW50ID4gcGVyY2VudCB8fCAhIW9sZC5kYXRhIS50aHJlYXRNb2RlICE9IHRocmVhdE1vZGUpIHtcbiAgICAgICAgICBjb25zdCBlbCA9IHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICBjb25zdCBwID0gZWwucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICBwLnJlbW92ZUNoaWxkKGVsKTtcbiAgICAgICAgICBwLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgfVxuICAgICAgICB2bm9kZS5kYXRhIS5wZXJjZW50ID0gcGVyY2VudDtcbiAgICAgICAgdm5vZGUuZGF0YSEudGhyZWF0TW9kZSA9IHRocmVhdE1vZGU7XG4gICAgICB9XG4gICAgfVxuICB9KSkgOiBudWxsO1xuXG4gIGNvbnN0IGJvZHk6IEFycmF5PFZOb2RlIHwgbnVsbD4gPSBlbmFibGVkID8gW1xuICAgIGgoJ3BlYXJsJywgW3BlYXJsXSksXG4gICAgaCgnZGl2LmVuZ2luZScsIFtcbiAgICAgIC4uLih0aHJlYXRNb2RlID8gW3RyYW5zLm5vYXJnKCdzaG93VGhyZWF0JyldIDogZW5naW5lTmFtZShpbnN0YW5jZSkpLFxuICAgICAgaCgnc3Bhbi5pbmZvJyxcbiAgICAgICAgY3RybC5nYW1lT3ZlcigpID8gW3RyYW5zLm5vYXJnKCdnYW1lT3ZlcicpXSA6XG4gICAgICAgICh0aHJlYXRNb2RlID8gW3RocmVhdEluZm8oY3RybCwgdGhyZWF0KV0gOiBsb2NhbEV2YWxJbmZvKGN0cmwsIGV2cykpXG4gICAgICApXG4gICAgXSlcbiAgXSA6IFtcbiAgICBwZWFybCA/IGgoJ3BlYXJsJywgW3BlYXJsXSkgOiBudWxsLFxuICAgIGgoJ2hlbHAnLCBbXG4gICAgICAuLi5lbmdpbmVOYW1lKGluc3RhbmNlKSxcbiAgICAgIGgoJ2JyJyksXG4gICAgICB0cmFucy5ub2FyZygnaW5Mb2NhbEJyb3dzZXInKVxuICAgIF0pXG4gIF07XG5cbiAgY29uc3Qgc3dpdGNoQnV0dG9uOiBWTm9kZSB8IG51bGwgPSBjdHJsLm1hbmRhdG9yeUNldmFsICYmIGN0cmwubWFuZGF0b3J5Q2V2YWwoKSA/IG51bGwgOiBoKCdkaXYuc3dpdGNoJywge1xuICAgIGF0dHJzOiB7IHRpdGxlOiB0cmFucy5ub2FyZygndG9nZ2xlTG9jYWxFdmFsdWF0aW9uJykgKyAnIChsKScgfVxuICB9LCBbXG4gICAgaCgnaW5wdXQjYW5hbHlzZS10b2dnbGUtY2V2YWwuY21uLXRvZ2dsZS5jbW4tdG9nZ2xlLS1zdWJ0bGUnLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBjaGVja2VkOiBlbmFibGVkXG4gICAgICB9LFxuICAgICAgaG9vazoge1xuICAgICAgICBpbnNlcnQ6IHZub2RlID0+ICh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGN0cmwudG9nZ2xlQ2V2YWwpXG4gICAgICB9XG4gICAgfSksXG4gICAgaCgnbGFiZWwnLCB7IGF0dHJzOiB7ICdmb3InOiAnYW5hbHlzZS10b2dnbGUtY2V2YWwnIH0gfSlcbiAgXSlcblxuICByZXR1cm4gaCgnZGl2LmNldmFsJyArIChlbmFibGVkID8gJy5lbmFibGVkJyA6ICcnKSwge1xuICAgIGNsYXNzOiB7XG4gICAgICBjb21wdXRpbmc6IHBlcmNlbnQgPCAxMDAgJiYgaW5zdGFuY2UuaXNDb21wdXRpbmcoKVxuICAgIH1cbiAgfSwgW1xuICAgIHByb2dyZXNzQmFyLFxuICAgIC4uLmJvZHksXG4gICAgdGhyZWF0QnV0dG9uKGN0cmwpLFxuICAgIHN3aXRjaEJ1dHRvblxuICBdKTtcbn1cblxuZnVuY3Rpb24gZ2V0RWxGZW4oZWw6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1mZW4nKSE7XG59XG5cbmZ1bmN0aW9uIGdldEVsVWNpKGU6IE1vdXNlRXZlbnQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gJChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdCgnZGl2LnB2JykuYXR0cignZGF0YS11Y2knKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tIb3ZlcihlbDogSFRNTEVsZW1lbnQsIGluc3RhbmNlOiBDZXZhbEN0cmwpOiB2b2lkIHtcbiAgd2luZG93LmxpY2hlc3MucmVxdWVzdElkbGVDYWxsYmFjaygoKSA9PiB7XG4gICAgaW5zdGFuY2Uuc2V0SG92ZXJpbmcoZ2V0RWxGZW4oZWwpLCAkKGVsKS5maW5kKCdkaXYucHY6aG92ZXInKS5hdHRyKCdkYXRhLXVjaScpKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQdnMoY3RybDogUGFyZW50Q3RybCkge1xuICBjb25zdCBpbnN0YW5jZSA9IGN0cmwuZ2V0Q2V2YWwoKTtcbiAgaWYgKCFpbnN0YW5jZS5hbGxvd2VkKCkgfHwgIWluc3RhbmNlLnBvc3NpYmxlIHx8ICFpbnN0YW5jZS5lbmFibGVkKCkpIHJldHVybjtcbiAgY29uc3QgbXVsdGlQdiA9IHBhcnNlSW50KGluc3RhbmNlLm11bHRpUHYoKSksXG4gICAgbm9kZSA9IGN0cmwuZ2V0Tm9kZSgpLFxuICAgIHNldHVwID0gcGFyc2VGZW4obm9kZS5mZW4pLnVud3JhcCgpO1xuICBsZXQgcHZzIDogVHJlZS5QdkRhdGFbXSwgdGhyZWF0ID0gZmFsc2U7XG4gIGlmIChjdHJsLnRocmVhdE1vZGUoKSAmJiBub2RlLnRocmVhdCkge1xuICAgIHB2cyA9IG5vZGUudGhyZWF0LnB2cztcbiAgICB0aHJlYXQgPSB0cnVlO1xuICB9IGVsc2UgaWYgKG5vZGUuY2V2YWwpIHB2cyA9IG5vZGUuY2V2YWwucHZzO1xuICBlbHNlIHB2cyA9IFtdO1xuICBpZiAodGhyZWF0KSBzZXR1cC50dXJuID0gb3Bwb3NpdGUoc2V0dXAudHVybik7XG4gIGNvbnN0IHBvcyA9IHNldHVwUG9zaXRpb24odmFyaWFudFRvUnVsZXMoaW5zdGFuY2UudmFyaWFudC5rZXkpLCBzZXR1cCk7XG4gIHJldHVybiBoKCdkaXYucHZfYm94Jywge1xuICAgIGF0dHJzOiB7ICdkYXRhLWZlbic6IG5vZGUuZmVuIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0OiB2bm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGVsID0gdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIGluc3RhbmNlLnNldEhvdmVyaW5nKGdldEVsRmVuKGVsKSwgZ2V0RWxVY2koZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgICAgICAgaW5zdGFuY2Uuc2V0SG92ZXJpbmcoZ2V0RWxGZW4oZWwpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgdWNpID0gZ2V0RWxVY2koZSk7XG4gICAgICAgICAgaWYgKHVjaSkgY3RybC5wbGF5VWNpKHVjaSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjaGVja0hvdmVyKGVsLCBpbnN0YW5jZSk7XG4gICAgICB9LFxuICAgICAgcG9zdHBhdGNoOiAoXywgdm5vZGUpID0+IGNoZWNrSG92ZXIodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50LCBpbnN0YW5jZSlcbiAgICB9XG4gIH0sIFsuLi5BcnJheShtdWx0aVB2KS5rZXlzKCldLm1hcChmdW5jdGlvbihpKSB7XG4gICAgaWYgKCFwdnNbaV0pIHJldHVybiBoKCdkaXYucHYnKTtcbiAgICByZXR1cm4gaCgnZGl2LnB2JywgdGhyZWF0ID8ge30gOiB7XG4gICAgICBhdHRyczogeyAnZGF0YS11Y2knOiBwdnNbaV0ubW92ZXNbMF0gfVxuICAgIH0sIFtcbiAgICAgIG11bHRpUHYgPiAxID8gaCgnc3Ryb25nJywgZGVmaW5lZChwdnNbaV0ubWF0ZSkgPyAoJyMnICsgcHZzW2ldLm1hdGUpIDogcmVuZGVyRXZhbChwdnNbaV0uY3AhKSkgOiBudWxsLFxuICAgICAgaCgnc3BhbicsIHBvcy51bndyYXAocG9zID0+IG1ha2VTYW5WYXJpYXRpb24ocG9zLCBwdnNbaV0ubW92ZXMuc2xpY2UoMCwgMTIpLm1hcChtID0+IHBhcnNlVWNpKG0pISkpLCBfID0+ICctLScpKVxuICAgIF0pO1xuICB9KSk7XG59XG4iLCJpbXBvcnQgeyBFdmFsIH0gZnJvbSAnLi90eXBlcyc7XG5cbmZ1bmN0aW9uIHRvUG92KGNvbG9yOiBDb2xvciwgZGlmZjogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIGNvbG9yID09PSAnd2hpdGUnID8gZGlmZiA6IC1kaWZmO1xufVxuXG4vKipcbiAqIGh0dHBzOi8vZ3JhcGhza2V0Y2guY29tLz9lcW4xX2NvbG9yPTEmZXFuMV9lcW49MTAwKyorJTI4MislMkYrJTI4MSslMkIrZXhwJTI4LTAuMDA1KyoreCUyOSUyOSstKzElMjkmZXFuMl9jb2xvcj0yJmVxbjJfZXFuPTEwMCsqKyUyODIrJTJGKyUyODErJTJCK2V4cCUyOC0wLjAwNCsqK3glMjklMjkrLSsxJTI5JmVxbjNfY29sb3I9MyZlcW4zX2Vxbj0mZXFuNF9jb2xvcj00JmVxbjRfZXFuPSZlcW41X2NvbG9yPTUmZXFuNV9lcW49JmVxbjZfY29sb3I9NiZlcW42X2Vxbj0meF9taW49LTEwMDAmeF9tYXg9MTAwMCZ5X21pbj0tMTAwJnlfbWF4PTEwMCZ4X3RpY2s9MTAwJnlfdGljaz0xMCZ4X2xhYmVsX2ZyZXE9MiZ5X2xhYmVsX2ZyZXE9MiZkb19ncmlkPTAmZG9fZ3JpZD0xJmJvbGRfbGFiZWxlZF9saW5lcz0wJmJvbGRfbGFiZWxlZF9saW5lcz0xJmxpbmVfd2lkdGg9NCZpbWFnZV93PTg1MCZpbWFnZV9oPTUyNVxuICovXG5mdW5jdGlvbiByYXdXaW5uaW5nQ2hhbmNlcyhjcDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIDIgLyAoMSArIE1hdGguZXhwKC0wLjAwNCAqIGNwKSkgLSAxO1xufVxuXG5mdW5jdGlvbiBjcFdpbm5pbmdDaGFuY2VzKGNwOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gcmF3V2lubmluZ0NoYW5jZXMoTWF0aC5taW4oTWF0aC5tYXgoLTEwMDAsIGNwKSwgMTAwMCkpO1xufVxuXG5mdW5jdGlvbiBtYXRlV2lubmluZ0NoYW5jZXMobWF0ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgdmFyIGNwID0gKDIxIC0gTWF0aC5taW4oMTAsIE1hdGguYWJzKG1hdGUpKSkgKiAxMDA7XG4gIHZhciBzaWduZWQgPSBjcCAqIChtYXRlID4gMCA/IDEgOiAtMSk7XG4gIHJldHVybiByYXdXaW5uaW5nQ2hhbmNlcyhzaWduZWQpO1xufVxuXG5mdW5jdGlvbiBldmFsV2lubmluZ0NoYW5jZXMoZXY6IEV2YWwpOiBudW1iZXIge1xuICByZXR1cm4gdHlwZW9mIGV2Lm1hdGUgIT09ICd1bmRlZmluZWQnID8gbWF0ZVdpbm5pbmdDaGFuY2VzKGV2Lm1hdGUpIDogY3BXaW5uaW5nQ2hhbmNlcyhldi5jcCEpO1xufVxuXG4vLyB3aW5uaW5nIGNoYW5jZXMgZm9yIGEgY29sb3Jcbi8vIDEgIGluZmluaXRlbHkgd2lubmluZ1xuLy8gLTEgaW5maW5pdGVseSBsb3NpbmdcbmV4cG9ydCBmdW5jdGlvbiBwb3ZDaGFuY2VzKGNvbG9yOiBDb2xvciwgZXY6IEV2YWwpIHtcbiAgcmV0dXJuIHRvUG92KGNvbG9yLCBldmFsV2lubmluZ0NoYW5jZXMoZXYpKTtcbn1cblxuLy8gY29tcHV0ZXMgdGhlIGRpZmZlcmVuY2UsIGluIHdpbm5pbmcgY2hhbmNlcywgYmV0d2VlbiB0d28gZXZhbHVhdGlvbnNcbi8vIDEgID0gZTEgaXMgaW5maW5hdGVseSBiZXR0ZXIgdGhhbiBlMlxuLy8gLTEgPSBlMSBpcyBpbmZpbmF0ZWx5IHdvcnNlICB0aGFuIGUyXG5leHBvcnQgZnVuY3Rpb24gcG92RGlmZihjb2xvcjogQ29sb3IsIGUxOiBFdmFsLCBlMjogRXZhbCkge1xuICByZXR1cm4gKHBvdkNoYW5jZXMoY29sb3IsIGUxKSAtIHBvdkNoYW5jZXMoY29sb3IsIGUyKSkgLyAyO1xufVxuIiwiaW1wb3J0IHBpb3RyIGZyb20gJy4vcGlvdHInO1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbEZlbjogRmVuID0gJ3JuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAxJztcblxuZXhwb3J0IGZ1bmN0aW9uIGZpeENyYXp5U2FuKHNhbjogU2FuKTogU2FuIHtcbiAgcmV0dXJuIHNhblswXSA9PT0gJ1AnID8gc2FuLnNsaWNlKDEpIDogc2FuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb21wb3NlVWNpKHVjaTogVWNpKTogW0tleSwgS2V5LCBzdHJpbmddIHtcbiAgcmV0dXJuIFt1Y2kuc2xpY2UoMCwgMikgYXMgS2V5LCB1Y2kuc2xpY2UoMiwgNCkgYXMgS2V5LCB1Y2kuc2xpY2UoNCwgNSldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRXZhbChlOiBudW1iZXIpOiBzdHJpbmcge1xuICBlID0gTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZChlIC8gMTApIC8gMTAsIDk5KSwgLTk5KTtcbiAgcmV0dXJuIChlID4gMCA/ICcrJyA6ICcnKSArIGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVzdHMge1xuICBbc3F1YXJlOiBzdHJpbmddOiBLZXlbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWREZXN0cyhsaW5lcz86IHN0cmluZyk6IERlc3RzIHwgbnVsbCB7XG4gIGlmICh0eXBlb2YgbGluZXMgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZGVzdHM6IERlc3RzID0ge307XG4gIGlmIChsaW5lcykgbGluZXMuc3BsaXQoJyAnKS5mb3JFYWNoKGxpbmUgPT4ge1xuICAgIGRlc3RzW3Bpb3RyW2xpbmVbMF1dXSA9IGxpbmUuc2xpY2UoMSkuc3BsaXQoJycpLm1hcChjID0+IHBpb3RyW2NdIGFzIEtleSlcbiAgfSk7XG4gIHJldHVybiBkZXN0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWREcm9wcyhsaW5lPzogc3RyaW5nIHwgbnVsbCk6IHN0cmluZ1tdIHwgbnVsbCB7XG4gIGlmICh0eXBlb2YgbGluZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbGluZSA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBsaW5lLm1hdGNoKC8uezJ9L2cpIHx8IFtdO1xufVxuXG5leHBvcnQgY29uc3Qgcm9sZVRvU2FuID0ge1xuICBwYXduOiAnUCcsXG4gIGtuaWdodDogJ04nLFxuICBiaXNob3A6ICdCJyxcbiAgcm9vazogJ1InLFxuICBxdWVlbjogJ1EnLFxuICBraW5nOiAnSydcbn07XG5cbmV4cG9ydCBjb25zdCBzYW5Ub1JvbGUgPSB7XG4gIFA6ICdwYXduJyxcbiAgTjogJ2tuaWdodCcsXG4gIEI6ICdiaXNob3AnLFxuICBSOiAncm9vaycsXG4gIFE6ICdxdWVlbicsXG4gIEs6ICdraW5nJ1xufTtcblxuZXhwb3J0IHsgcGlvdHIgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHZhcmlhbnRUb1J1bGVzKHZhcmlhbnQ6IFZhcmlhbnRLZXkpOiAnY2hlc3MnIHwgJ2FudGljaGVzcycgfCAna2luZ29mdGhlaGlsbCcgfCAnM2NoZWNrJyB8ICdhdG9taWMnIHwgJ2hvcmRlJyB8ICdyYWNpbmdraW5ncycgfCAnY3Jhenlob3VzZScge1xuICBzd2l0Y2ggKHZhcmlhbnQpIHtcbiAgICBjYXNlICdzdGFuZGFyZCc6XG4gICAgY2FzZSAnY2hlc3M5NjAnOlxuICAgIGNhc2UgJ2Zyb21Qb3NpdGlvbic6XG4gICAgICByZXR1cm4gJ2NoZXNzJztcbiAgICBjYXNlICd0aHJlZUNoZWNrJzpcbiAgICAgIHJldHVybiAnM2NoZWNrJztcbiAgICBjYXNlICdraW5nT2ZUaGVIaWxsJzpcbiAgICAgIHJldHVybiAna2luZ29mdGhlaGlsbCc7XG4gICAgY2FzZSAncmFjaW5nS2luZ3MnOlxuICAgICAgcmV0dXJuICdyYWNpbmdraW5ncyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB2YXJpYW50O1xuICB9XG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIFBpb3RyIHtcbiAgW3A6IHN0cmluZ106IHN0cmluZztcbn1cblxuY29uc3QgcGlvdHI6IFBpb3RyID0ge1xuICAnYSc6ICdhMScsXG4gICdiJzogJ2IxJyxcbiAgJ2MnOiAnYzEnLFxuICAnZCc6ICdkMScsXG4gICdlJzogJ2UxJyxcbiAgJ2YnOiAnZjEnLFxuICAnZyc6ICdnMScsXG4gICdoJzogJ2gxJyxcbiAgJ2knOiAnYTInLFxuICAnaic6ICdiMicsXG4gICdrJzogJ2MyJyxcbiAgJ2wnOiAnZDInLFxuICAnbSc6ICdlMicsXG4gICduJzogJ2YyJyxcbiAgJ28nOiAnZzInLFxuICAncCc6ICdoMicsXG4gICdxJzogJ2EzJyxcbiAgJ3InOiAnYjMnLFxuICAncyc6ICdjMycsXG4gICd0JzogJ2QzJyxcbiAgJ3UnOiAnZTMnLFxuICAndic6ICdmMycsXG4gICd3JzogJ2czJyxcbiAgJ3gnOiAnaDMnLFxuICAneSc6ICdhNCcsXG4gICd6JzogJ2I0JyxcbiAgJ0EnOiAnYzQnLFxuICAnQic6ICdkNCcsXG4gICdDJzogJ2U0JyxcbiAgJ0QnOiAnZjQnLFxuICAnRSc6ICdnNCcsXG4gICdGJzogJ2g0JyxcbiAgJ0cnOiAnYTUnLFxuICAnSCc6ICdiNScsXG4gICdJJzogJ2M1JyxcbiAgJ0onOiAnZDUnLFxuICAnSyc6ICdlNScsXG4gICdMJzogJ2Y1JyxcbiAgJ00nOiAnZzUnLFxuICAnTic6ICdoNScsXG4gICdPJzogJ2E2JyxcbiAgJ1AnOiAnYjYnLFxuICAnUSc6ICdjNicsXG4gICdSJzogJ2Q2JyxcbiAgJ1MnOiAnZTYnLFxuICAnVCc6ICdmNicsXG4gICdVJzogJ2c2JyxcbiAgJ1YnOiAnaDYnLFxuICAnVyc6ICdhNycsXG4gICdYJzogJ2I3JyxcbiAgJ1knOiAnYzcnLFxuICAnWic6ICdkNycsXG4gICcwJzogJ2U3JyxcbiAgJzEnOiAnZjcnLFxuICAnMic6ICdnNycsXG4gICczJzogJ2g3JyxcbiAgJzQnOiAnYTgnLFxuICAnNSc6ICdiOCcsXG4gICc2JzogJ2M4JyxcbiAgJzcnOiAnZDgnLFxuICAnOCc6ICdlOCcsXG4gICc5JzogJ2Y4JyxcbiAgJyEnOiAnZzgnLFxuICAnPyc6ICdoOCdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHBpb3RyO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGRlZmluZWQ8QT4odjogQSB8IHVuZGVmaW5lZCk6IHYgaXMgQSB7XG4gIHJldHVybiB0eXBlb2YgdiAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbXB0eShhOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFhIHx8IGEubGVuZ3RoID09PSAwO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3A8VD4ge1xuICAoKTogVFxuICAodjogVCk6IFRcbn1cblxuLy8gbGlrZSBtaXRocmlsIHByb3AgYnV0IHdpdGggdHlwZSBzYWZldHlcbmV4cG9ydCBmdW5jdGlvbiBwcm9wPEE+KGluaXRpYWxWYWx1ZTogQSk6IFByb3A8QT4ge1xuICBsZXQgdmFsdWUgPSBpbml0aWFsVmFsdWU7XG4gIGNvbnN0IGZ1biA9IGZ1bmN0aW9uKHY6IEEgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoZGVmaW5lZCh2KSkgdmFsdWUgPSB2O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbiAgcmV0dXJuIGZ1biBhcyBQcm9wPEE+O1xufVxuIiwiaW1wb3J0IHRocm90dGxlIGZyb20gJy4vdGhyb3R0bGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcnVubmVyKGhhY2tzOiAoKSA9PiB2b2lkLCB0aHJvdHRsZU1zOiBudW1iZXIgPSAxMDApIHtcblxuICBsZXQgdGltZW91dDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHJ1bkhhY2tzID0gdGhyb3R0bGUodGhyb3R0bGVNcywgKCkgPT4ge1xuICAgIHdpbmRvdy5saWNoZXNzLnJhZigoKSA9PiB7XG4gICAgICBoYWNrcygpO1xuICAgICAgc2NoZWR1bGUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGUoKSB7XG4gICAgdGltZW91dCAmJiBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQocnVuSGFja3MsIDUwMCk7XG4gIH1cblxuICBydW5IYWNrcygpO1xufVxuXG5sZXQgbGFzdE1haW5Cb2FyZEhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4vLyBGaXJlZm94IDYwLSBuZWVkcyB0aGlzIHRvIHByb3Blcmx5IGNvbXB1dGUgdGhlIGdyaWQgbGF5b3V0LlxuZXhwb3J0IGZ1bmN0aW9uIGZpeE1haW5Cb2FyZEhlaWdodChjb250YWluZXI6IEhUTUxFbGVtZW50KSB7XG4gIGNvbnN0IG1haW5Cb2FyZCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcubWFpbi1ib2FyZCcpIGFzIEhUTUxFbGVtZW50LFxuICAgIHdpZHRoID0gbWFpbkJvYXJkLm9mZnNldFdpZHRoO1xuICBpZiAobGFzdE1haW5Cb2FyZEhlaWdodCAhPSB3aWR0aCkge1xuICAgIGxhc3RNYWluQm9hcmRIZWlnaHQgPSB3aWR0aDtcbiAgICBtYWluQm9hcmQuc3R5bGUuaGVpZ2h0ID0gd2lkdGggKyAncHgnO1xuICAgIChtYWluQm9hcmQucXVlcnlTZWxlY3RvcignLmNnLXdyYXAnKSBhcyBIVE1MRWxlbWVudCkuc3R5bGUuaGVpZ2h0ID0gd2lkdGggKyAncHgnO1xuICAgIHdpbmRvdy5saWNoZXNzLmRpc3BhdGNoRXZlbnQoZG9jdW1lbnQuYm9keSwgJ2NoZXNzZ3JvdW5kLnJlc2l6ZScpO1xuICB9XG59XG5cbmxldCBib3VuZENoZXNzZ3JvdW5kUmVzaXplID0gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2hlc3Nncm91bmRSZXNpemVPbmNlKGY6ICgpID0+IHZvaWQpIHtcbiAgaWYgKCFib3VuZENoZXNzZ3JvdW5kUmVzaXplKSB7XG4gICAgYm91bmRDaGVzc2dyb3VuZFJlc2l6ZSA9IHRydWU7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjaGVzc2dyb3VuZC5yZXNpemUnLCBmKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmVlZHNCb2FyZEhlaWdodEZpeCgpIHtcbiAgLy8gQ2hyb21lLCBDaHJvbWl1bSwgQnJhdmUsIE9wZXJhLCBTYWZhcmkgMTIrIGFyZSBPS1xuICBpZiAod2luZG93LmNocm9tZSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIEZpcmVmb3ggPj0gNjEgaXMgT0tcbiAgY29uc3QgZmZ2ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zcGxpdCgnRmlyZWZveC8nKTtcbiAgcmV0dXJuICFmZnZbMV0gfHwgcGFyc2VJbnQoZmZ2WzFdKSA8IDYxO1xufVxuIiwiLyogQmFzZWQgb246ICovXG4vKiFcbiAqIGhvdmVySW50ZW50IHYxLjEwLjAgLy8gMjAxOS4wMi4yNSAvLyBqUXVlcnkgdjEuNy4wK1xuICogaHR0cDovL2JyaWFuY2hlcm5lLmdpdGh1Yi5pby9qcXVlcnktaG92ZXJJbnRlbnQvXG4gKlxuICogWW91IG1heSB1c2UgaG92ZXJJbnRlbnQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgbGljZW5zZS4gQmFzaWNhbGx5IHRoYXRcbiAqIG1lYW5zIHlvdSBhcmUgZnJlZSB0byB1c2UgaG92ZXJJbnRlbnQgYXMgbG9uZyBhcyB0aGlzIGhlYWRlciBpcyBsZWZ0IGludGFjdC5cbiAqIENvcHlyaWdodCAyMDA3LTIwMTkgQnJpYW4gQ2hlcm5lXG4gKi9cblxudHlwZSBTdGF0ZSA9IGFueTtcblxuZXhwb3J0IGNvbnN0IG1lbnVIb3ZlciA9ICgpID0+IHdpbmRvdy5saWNoZXNzLnJhZihmdW5jdGlvbigpIHtcblxuICBpZiAod2luZG93LmxpY2hlc3MuaGFzVG91Y2hFdmVudHMpIHJldHVybjtcblxuICBsZXQgaW50ZXJ2YWw6IG51bWJlciA9IDEwMDtcbiAgbGV0IHNlbnNpdGl2aXR5OiBudW1iZXIgPSAxMDtcblxuICAvLyBjdXJyZW50IFggYW5kIFkgcG9zaXRpb24gb2YgbW91c2UsIHVwZGF0ZWQgZHVyaW5nIG1vdXNlbW92ZSB0cmFja2luZyAoc2hhcmVkIGFjcm9zcyBpbnN0YW5jZXMpXG4gIGxldCBjWDogbnVtYmVyLCBjWTogbnVtYmVyO1xuXG4gIC8vIHNhdmVzIHRoZSBjdXJyZW50IHBvaW50ZXIgcG9zaXRpb24gY29vcmRpbmF0ZXMgYmFzZWQgb24gdGhlIGdpdmVuIG1vdXNlbW92ZSBldmVudFxuICBsZXQgdHJhY2sgPSBmdW5jdGlvbihldjogSlF1ZXJ5RXZlbnRPYmplY3QpIHtcbiAgICBjWCA9IGV2LnBhZ2VYO1xuICAgIGNZID0gZXYucGFnZVk7XG4gIH07XG5cbiAgLy8gc3RhdGUgcHJvcGVydGllczpcbiAgLy8gdGltZW91dElkID0gdGltZW91dCBJRCwgcmV1c2VkIGZvciB0cmFja2luZyBtb3VzZSBwb3NpdGlvbiBhbmQgZGVsYXlpbmcgXCJvdXRcIiBoYW5kbGVyXG4gIC8vIGlzQWN0aXZlID0gcGx1Z2luIHN0YXRlLCB0cnVlIGFmdGVyIGBvdmVyYCBpcyBjYWxsZWQganVzdCB1bnRpbCBgb3V0YCBpcyBjYWxsZWRcbiAgLy8gcFgsIHBZID0gcHJldmlvdXNseS1tZWFzdXJlZCBwb2ludGVyIGNvb3JkaW5hdGVzLCB1cGRhdGVkIGF0IGVhY2ggcG9sbGluZyBpbnRlcnZhbFxuICAvLyBldmVudCA9IHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5hbWVzcGFjZWQgZXZlbnQgdXNlZCBmb3IgbW91c2UgdHJhY2tpbmdcbiAgbGV0IHN0YXRlOiBTdGF0ZSA9IHt9O1xuXG4gICQoJyN0b3BuYXYuaG92ZXInKS5lYWNoKGZ1bmN0aW9uKHRoaXM6IEhUTUxFbGVtZW50KSB7XG5cbiAgICBjb25zdCAkZWwgPSAkKHRoaXMpLnJlbW92ZUNsYXNzKCdob3ZlcicpLFxuICAgICAgaGFuZGxlciA9ICgpID0+ICRlbC50b2dnbGVDbGFzcygnaG92ZXInKTtcblxuXG4gICAgLy8gY29tcGFyZXMgY3VycmVudCBhbmQgcHJldmlvdXMgbW91c2UgcG9zaXRpb25zXG4gICAgY29uc3QgY29tcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gY29tcGFyZSBtb3VzZSBwb3NpdGlvbnMgdG8gc2VlIGlmIHBvaW50ZXIgaGFzIHNsb3dlZCBlbm91Z2ggdG8gdHJpZ2dlciBgb3ZlcmAgZnVuY3Rpb25cbiAgICAgIGlmICggTWF0aC5zcXJ0KCAoc3RhdGUucFgtY1gpKihzdGF0ZS5wWC1jWCkgKyAoc3RhdGUucFktY1kpKihzdGF0ZS5wWS1jWSkgKSA8IHNlbnNpdGl2aXR5ICkge1xuICAgICAgICAkZWwub2ZmKHN0YXRlLmV2ZW50LCB0cmFjayk7XG4gICAgICAgIGRlbGV0ZSBzdGF0ZS50aW1lb3V0SWQ7XG4gICAgICAgIC8vIHNldCBob3ZlckludGVudCBzdGF0ZSBhcyBhY3RpdmUgZm9yIHRoaXMgZWxlbWVudCAocGVybWl0cyBgb3V0YCBoYW5kbGVyIHRvIHRyaWdnZXIpXG4gICAgICAgIHN0YXRlLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc2V0IHByZXZpb3VzIGNvb3JkaW5hdGVzIGZvciBuZXh0IGNvbXBhcmlzb25cbiAgICAgICAgc3RhdGUucFggPSBjWDsgc3RhdGUucFkgPSBjWTtcbiAgICAgICAgLy8gdXNlIHNlbGYtY2FsbGluZyB0aW1lb3V0LCBndWFyYW50ZWVzIGludGVydmFscyBhcmUgc3BhY2VkIG91dCBwcm9wZXJseSAoYXZvaWRzIEphdmFTY3JpcHQgdGltZXIgYnVncylcbiAgICAgICAgc3RhdGUudGltZW91dElkID0gc2V0VGltZW91dChjb21wYXJlLCBpbnRlcnZhbCApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGhhbmRsaW5nIG1vdXNlICdob3ZlcmluZydcbiAgICB2YXIgaGFuZGxlSG92ZXIgPSBmdW5jdGlvbihldjogSlF1ZXJ5RXZlbnRPYmplY3QpIHtcblxuICAgICAgLy8gY2xlYXIgYW55IGV4aXN0aW5nIHRpbWVvdXRcbiAgICAgIGlmIChzdGF0ZS50aW1lb3V0SWQpIHsgc3RhdGUudGltZW91dElkID0gY2xlYXJUaW1lb3V0KHN0YXRlLnRpbWVvdXRJZCk7IH1cblxuICAgICAgLy8gbmFtZXNwYWNlZCBldmVudCB1c2VkIHRvIHJlZ2lzdGVyIGFuZCB1bnJlZ2lzdGVyIG1vdXNlbW92ZSB0cmFja2luZ1xuICAgICAgdmFyIG1vdXNlbW92ZSA9IHN0YXRlLmV2ZW50ID0gJ21vdXNlbW92ZSc7XG5cbiAgICAgIC8vIGhhbmRsZSB0aGUgZXZlbnQsIGJhc2VkIG9uIGl0cyB0eXBlXG4gICAgICBpZiAoZXYudHlwZSA9PSAnbW91c2VlbnRlcicpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZyBpZiBhbHJlYWR5IGFjdGl2ZSBvciBhIGJ1dHRvbiBpcyBwcmVzc2VkIChkcmFnZ2luZyBhIHBpZWNlKVxuICAgICAgICBpZiAoc3RhdGUuaXNBY3RpdmUgfHwgKGV2Lm9yaWdpbmFsRXZlbnQgYXMgTW91c2VFdmVudCkuYnV0dG9ucykgcmV0dXJuO1xuICAgICAgICAvLyBzZXQgXCJwcmV2aW91c1wiIFggYW5kIFkgcG9zaXRpb24gYmFzZWQgb24gaW5pdGlhbCBlbnRyeSBwb2ludFxuICAgICAgICBzdGF0ZS5wWCA9IGV2LnBhZ2VYOyBzdGF0ZS5wWSA9IGV2LnBhZ2VZO1xuICAgICAgICAvLyB1cGRhdGUgXCJjdXJyZW50XCIgWCBhbmQgWSBwb3NpdGlvbiBiYXNlZCBvbiBtb3VzZW1vdmVcbiAgICAgICAgJGVsLm9mZihtb3VzZW1vdmUsIHRyYWNrKS5vbihtb3VzZW1vdmUsIHRyYWNrKTtcbiAgICAgICAgLy8gc3RhcnQgcG9sbGluZyBpbnRlcnZhbCAoc2VsZi1jYWxsaW5nIHRpbWVvdXQpIHRvIGNvbXBhcmUgbW91c2UgY29vcmRpbmF0ZXMgb3ZlciB0aW1lXG4gICAgICAgIHN0YXRlLnRpbWVvdXRJZCA9IHNldFRpbWVvdXQoY29tcGFyZSwgaW50ZXJ2YWwgKTtcbiAgICAgIH0gZWxzZSB7IC8vIFwibW91c2VsZWF2ZVwiXG4gICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgbm90IGFscmVhZHkgYWN0aXZlXG4gICAgICAgIGlmICghc3RhdGUuaXNBY3RpdmUpIHJldHVybjtcbiAgICAgICAgLy8gdW5iaW5kIGV4cGVuc2l2ZSBtb3VzZW1vdmUgZXZlbnRcbiAgICAgICAgJGVsLm9mZihtb3VzZW1vdmUsdHJhY2spO1xuICAgICAgICAvLyBpZiBob3ZlckludGVudCBzdGF0ZSBpcyB0cnVlLCB0aGVuIGNhbGwgdGhlIG1vdXNlT3V0IGZ1bmN0aW9uIGFmdGVyIHRoZSBzcGVjaWZpZWQgZGVsYXlcbiAgICAgICAgc3RhdGUgPSB7fTtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkZWwub24oJ21vdXNlZW50ZXInLCBoYW5kbGVIb3Zlcikub24oJ21vdXNlbGVhdmUnLCBoYW5kbGVIb3Zlcik7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgKiBhcyBjZyBmcm9tICdjaGVzc2dyb3VuZC90eXBlcyc7XG5cbmV4cG9ydCB0eXBlIE1vdWNoRXZlbnQgPSBNb3VzZUV2ZW50ICYgVG91Y2hFdmVudDtcblxudHlwZSBWaXNpYmxlID0gKHBseTogUGx5KSA9PiBib29sZWFuO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXNpemVIYW5kbGUoZWxzOiBjZy5FbGVtZW50cywgcHJlZjogbnVtYmVyLCBwbHk6IG51bWJlciwgdmlzaWJsZT86IFZpc2libGUpIHtcblxuICBpZiAoIXByZWYpIHJldHVybjtcblxuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NnLXJlc2l6ZScpO1xuICBlbHMuY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKTtcblxuICBjb25zdCBzdGFydFJlc2l6ZSA9IChzdGFydDogTW91Y2hFdmVudCkgPT4ge1xuXG4gICAgc3RhcnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IG1vdXNlbW92ZUV2ZW50ID0gc3RhcnQudHlwZSA9PT0gJ3RvdWNoc3RhcnQnID8gJ3RvdWNobW92ZScgOiAnbW91c2Vtb3ZlJztcbiAgICBjb25zdCBtb3VzZXVwRXZlbnQgPSBzdGFydC50eXBlID09PSAndG91Y2hzdGFydCcgPyAndG91Y2hlbmQnIDogJ21vdXNldXAnO1xuXG4gICAgY29uc3Qgc3RhcnRQb3MgPSBldmVudFBvc2l0aW9uKHN0YXJ0KSE7XG4gICAgY29uc3QgaW5pdGlhbFpvb20gPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHkpLmdldFByb3BlcnR5VmFsdWUoJy0tem9vbScpKTtcbiAgICBsZXQgem9vbSA9IGluaXRpYWxab29tO1xuXG4gICAgY29uc3Qgc2F2ZVpvb20gPSB3aW5kb3cubGljaGVzcy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAkLmFqYXgoeyBtZXRob2Q6ICdwb3N0JywgdXJsOiAnL3ByZWYvem9vbT92PScgKyAoMTAwICsgem9vbSkgfSk7XG4gICAgfSwgNzAwKTtcblxuICAgIGNvbnN0IHJlc2l6ZSA9IChtb3ZlOiBNb3VjaEV2ZW50KSA9PiB7XG5cbiAgICAgIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24obW92ZSkhO1xuICAgICAgY29uc3QgZGVsdGEgPSBwb3NbMF0gLSBzdGFydFBvc1swXSArIHBvc1sxXSAtIHN0YXJ0UG9zWzFdO1xuXG4gICAgICB6b29tID0gTWF0aC5yb3VuZChNYXRoLm1pbigxMDAsIE1hdGgubWF4KDAsIGluaXRpYWxab29tICsgZGVsdGEgLyAxMCkpKTtcblxuICAgICAgZG9jdW1lbnQuYm9keS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJy0tem9vbTonICsgem9vbSk7XG4gICAgICB3aW5kb3cubGljaGVzcy5kaXNwYXRjaEV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpO1xuXG4gICAgICBzYXZlWm9vbSgpO1xuICAgIH07XG5cbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6aW5nJyk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG1vdXNlbW92ZUV2ZW50LCByZXNpemUpO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihtb3VzZXVwRXZlbnQsICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobW91c2Vtb3ZlRXZlbnQsIHJlc2l6ZSk7XG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3Jlc2l6aW5nJyk7XG4gICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICB9O1xuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBzdGFydFJlc2l6ZSk7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHN0YXJ0UmVzaXplKTtcblxuICBpZiAocHJlZiA9PSAxKSB7XG4gICAgY29uc3QgdG9nZ2xlID0gKHBseTogbnVtYmVyKSA9PiBlbC5jbGFzc0xpc3QudG9nZ2xlKCdub25lJywgdmlzaWJsZSA/ICF2aXNpYmxlKHBseSkgOiBwbHkgPj0gMik7XG4gICAgdG9nZ2xlKHBseSk7XG4gICAgd2luZG93LmxpY2hlc3MucHVic3ViLm9uKCdwbHknLCB0b2dnbGUpO1xuICB9XG5cbiAgYWRkTmFnKGVsKTtcbn1cblxuZnVuY3Rpb24gZXZlbnRQb3NpdGlvbihlOiBNb3VjaEV2ZW50KTogW251bWJlciwgbnVtYmVyXSB8IHVuZGVmaW5lZCB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXNbMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYWRkTmFnKGVsOiBIVE1MRWxlbWVudCkge1xuXG4gIGNvbnN0IHN0b3JhZ2UgPSB3aW5kb3cubGljaGVzcy5zdG9yYWdlLm1ha2VCb29sZWFuKCdyZXNpemUtbmFnJyk7XG4gIGlmIChzdG9yYWdlLmdldCgpKSByZXR1cm47XG5cbiAgd2luZG93LmxpY2hlc3MubG9hZENzc1BhdGgoJ25hZy1jaXJjbGUnKTtcbiAgZWwudGl0bGUgPSAnRHJhZyB0byByZXNpemUnO1xuICBlbC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cIm5hZy1jaXJjbGVcIj48L2Rpdj4nO1xuICBmb3IgKGNvbnN0IG1vdXNlZG93bkV2ZW50IG9mIFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSkge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIobW91c2Vkb3duRXZlbnQsICgpID0+IHtcbiAgICAgIHN0b3JhZ2Uuc2V0KHRydWUpO1xuICAgICAgZWwuaW5uZXJIVE1MID0gJyc7XG4gICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xuICB9XG5cbiAgc2V0VGltZW91dCgoKSA9PiBzdG9yYWdlLnNldCh0cnVlKSwgMTUwMDApO1xufVxuIiwiaW1wb3J0IHsgZGVmaW5lZCB9IGZyb20gJy4vY29tbW9uJztcblxuZXhwb3J0IGludGVyZmFjZSBTdG9yZWRQcm9wPFQ+IHtcbiAgKCk6IHN0cmluZztcbiAgKHY6IFQpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0b3JlZEJvb2xlYW5Qcm9wIHtcbiAgKCk6IGJvb2xlYW47XG4gICh2OiBib29sZWFuKTogdm9pZDtcbn1cblxuY29uc3Qgc3RvcmFnZSA9IHdpbmRvdy5saWNoZXNzLnN0b3JhZ2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9yZWRQcm9wKGs6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBib29sZWFuKTogU3RvcmVkQm9vbGVhblByb3A7XG5leHBvcnQgZnVuY3Rpb24gc3RvcmVkUHJvcDxUPihrOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogVCk6IFN0b3JlZFByb3A8VD47XG5leHBvcnQgZnVuY3Rpb24gc3RvcmVkUHJvcChrOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogYW55KSB7XG4gIGNvbnN0IHNrID0gJ2FuYWx5c2UuJyArIGs7XG4gIGNvbnN0IGlzQm9vbGVhbiA9IGRlZmF1bHRWYWx1ZSA9PT0gdHJ1ZSB8fCBkZWZhdWx0VmFsdWUgPT09IGZhbHNlO1xuICBsZXQgdmFsdWU6IGFueTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHY6IGFueSkge1xuICAgIGlmIChkZWZpbmVkKHYpICYmIHYgIT0gdmFsdWUpIHtcbiAgICAgIHZhbHVlID0gdiArICcnO1xuICAgICAgc3RvcmFnZS5zZXQoc2ssIHYpO1xuICAgIH0gZWxzZSBpZiAoIWRlZmluZWQodmFsdWUpKSB7XG4gICAgICB2YWx1ZSA9IHN0b3JhZ2UuZ2V0KHNrKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkgdmFsdWUgPSBkZWZhdWx0VmFsdWUgKyAnJztcbiAgICB9XG4gICAgcmV0dXJuIGlzQm9vbGVhbiA/IHZhbHVlID09PSAndHJ1ZScgOiB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdG9yZWRKc29uUHJvcDxUPiB7XG4gICgpOiBUO1xuICAodjogVCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9yZWRKc29uUHJvcDxUPihrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBUKTogU3RvcmVkSnNvblByb3A8VD4ge1xuICByZXR1cm4gZnVuY3Rpb24odj86IFQpIHtcbiAgICBpZiAoZGVmaW5lZCh2KSkge1xuICAgICAgc3RvcmFnZS5zZXQoa2V5LCBKU09OLnN0cmluZ2lmeSh2KSk7XG4gICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gSlNPTi5wYXJzZShzdG9yYWdlLmdldChrZXkpISk7XG4gICAgcmV0dXJuIChyZXQgIT09IG51bGwpID8gcmV0IDogZGVmYXVsdFZhbHVlO1xuICB9O1xufVxuIiwiZXhwb3J0IGludGVyZmFjZSBTeW5jPFQ+IHtcbiAgcHJvbWlzZTogUHJvbWlzZTxUPjtcbiAgc3luYzogVCB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN5bmM8VD4ocHJvbWlzZTogUHJvbWlzZTxUPik6IFN5bmM8VD4ge1xuICBjb25zdCBzeW5jOiBTeW5jPFQ+ID0ge1xuICAgIHN5bmM6IHVuZGVmaW5lZCxcbiAgICBwcm9taXNlOiBwcm9taXNlLnRoZW4odiA9PiB7XG4gICAgICBzeW5jLnN5bmMgPSB2O1xuICAgICAgcmV0dXJuIHY7XG4gICAgfSlcbiAgfTtcbiAgcmV0dXJuIHN5bmM7XG59XG4iLCIvLyBFbnN1cmVzIGNhbGxzIHRvIHRoZSB3cmFwcGVkIGZ1bmN0aW9uIGFyZSBzcGFjZWQgYnkgdGhlIGdpdmVuIGRlbGF5LlxuLy8gQW55IGV4dHJhIGNhbGxzIGFyZSBkcm9wcGVkLCBleGNlcHQgdGhlIGxhc3Qgb25lLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGhyb3R0bGUoZGVsYXk6IG51bWJlciwgY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB7XG4gIGxldCB0aW1lcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICBsZXQgbGFzdEV4ZWMgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbih0aGlzOiBhbnksIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZjogYW55ID0gdGhpcztcbiAgICBjb25zdCBlbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBsYXN0RXhlYztcblxuICAgIGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICB0aW1lciA9IHVuZGVmaW5lZDtcbiAgICAgIGxhc3RFeGVjID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9XG5cbiAgICBpZiAodGltZXIpIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgICBpZiAoZWxhcHNlZCA+IGRlbGF5KSBleGVjKCk7XG4gICAgZWxzZSB0aW1lciA9IHNldFRpbWVvdXQoZXhlYywgZGVsYXkgLSBlbGFwc2VkKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7IHdpbm5pbmdDaGFuY2VzIH0gZnJvbSAnY2V2YWwnO1xuaW1wb3J0IHsgZGVjb21wb3NlVWNpIH0gZnJvbSAnY2hlc3MnO1xuaW1wb3J0IHsgRHJhd1NoYXBlIH0gZnJvbSAnY2hlc3Nncm91bmQvZHJhdyc7XG5pbXBvcnQgeyBWbSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBcGkgYXMgQ2dBcGkgfSBmcm9tICdjaGVzc2dyb3VuZC9hcGknO1xuaW1wb3J0IHsgQ2V2YWxDdHJsIH0gZnJvbSAnY2V2YWwnO1xuaW1wb3J0IHsgb3Bwb3NpdGUgfSBmcm9tICdjaGVzc2dyb3VuZC91dGlsJztcblxuaW50ZXJmYWNlIE9wdHMge1xuICB2bTogVm07XG4gIGNldmFsOiBDZXZhbEN0cmw7XG4gIGdyb3VuZDogQ2dBcGk7XG4gIG5leHROb2RlQmVzdD86IFVjaTtcbiAgdGhyZWF0TW9kZTogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gbWFrZUF1dG9TaGFwZXNGcm9tVWNpKHVjaTogVWNpLCBicnVzaDogc3RyaW5nLCBtb2RpZmllcnM/OiBhbnkpOiBEcmF3U2hhcGVbXSB7XG4gIGNvbnN0IG1vdmUgPSBkZWNvbXBvc2VVY2kodWNpKTtcbiAgcmV0dXJuIFt7XG4gICAgb3JpZzogbW92ZVswXSxcbiAgICBkZXN0OiBtb3ZlWzFdLFxuICAgIGJydXNoOiBicnVzaCxcbiAgICBtb2RpZmllcnM6IG1vZGlmaWVyc1xuICB9XTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob3B0czogT3B0cyk6IERyYXdTaGFwZVtdIHtcbiAgY29uc3QgbiA9IG9wdHMudm0ubm9kZSxcbiAgaG92ZXJpbmcgPSBvcHRzLmNldmFsLmhvdmVyaW5nKCksXG4gIGNvbG9yID0gb3B0cy5ncm91bmQuc3RhdGUubW92YWJsZS5jb2xvcjtcbiAgbGV0IHNoYXBlczogRHJhd1NoYXBlW10gPSBbXTtcbiAgaWYgKGhvdmVyaW5nICYmIGhvdmVyaW5nLmZlbiA9PT0gbi5mZW4pIHNoYXBlcyA9IHNoYXBlcy5jb25jYXQobWFrZUF1dG9TaGFwZXNGcm9tVWNpKGhvdmVyaW5nLnVjaSwgJ3BhbGVCbHVlJykpO1xuICBpZiAob3B0cy52bS5zaG93QXV0b1NoYXBlcygpICYmIG9wdHMudm0uc2hvd0NvbXB1dGVyKCkpIHtcbiAgICBpZiAobi5ldmFsKSBzaGFwZXMgPSBzaGFwZXMuY29uY2F0KG1ha2VBdXRvU2hhcGVzRnJvbVVjaShuLmV2YWwuYmVzdCEsICdwYWxlR3JlZW4nKSk7XG4gICAgaWYgKCFob3ZlcmluZykge1xuICAgICAgbGV0IG5leHRCZXN0OiBVY2kgfCB1bmRlZmluZWQgPSBvcHRzLm5leHROb2RlQmVzdDtcbiAgICAgIGlmICghbmV4dEJlc3QgJiYgb3B0cy5jZXZhbC5lbmFibGVkKCkgJiYgbi5jZXZhbCkgbmV4dEJlc3QgPSBuLmNldmFsLnB2c1swXS5tb3Zlc1swXTtcbiAgICAgIGlmIChuZXh0QmVzdCkgc2hhcGVzID0gc2hhcGVzLmNvbmNhdChtYWtlQXV0b1NoYXBlc0Zyb21VY2kobmV4dEJlc3QsICdwYWxlQmx1ZScpKTtcbiAgICAgIGlmIChvcHRzLmNldmFsLmVuYWJsZWQoKSAmJiBuLmNldmFsICYmIG4uY2V2YWwucHZzICYmIG4uY2V2YWwucHZzWzFdICYmICEob3B0cy50aHJlYXRNb2RlICYmIG4udGhyZWF0ICYmIG4udGhyZWF0LnB2c1syXSkpIHtcbiAgICAgICAgbi5jZXZhbC5wdnMuZm9yRWFjaChmdW5jdGlvbihwdikge1xuICAgICAgICAgIGlmIChwdi5tb3Zlc1swXSA9PT0gbmV4dEJlc3QpIHJldHVybjtcbiAgICAgICAgICB2YXIgc2hpZnQgPSB3aW5uaW5nQ2hhbmNlcy5wb3ZEaWZmKGNvbG9yIGFzIENvbG9yLCBuLmNldmFsIS5wdnNbMF0sIHB2KTtcbiAgICAgICAgICBpZiAoc2hpZnQgPiAwLjIgfHwgaXNOYU4oc2hpZnQpIHx8IHNoaWZ0IDwgMCkgcmV0dXJuO1xuICAgICAgICAgIHNoYXBlcyA9IHNoYXBlcy5jb25jYXQobWFrZUF1dG9TaGFwZXNGcm9tVWNpKHB2Lm1vdmVzWzBdLCAncGFsZUdyZXknLCB7XG4gICAgICAgICAgICBsaW5lV2lkdGg6IE1hdGgucm91bmQoMTIgLSBzaGlmdCAqIDUwKSAvLyAxMiB0byAyXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKG9wdHMuY2V2YWwuZW5hYmxlZCgpICYmIG9wdHMudGhyZWF0TW9kZSAmJiBuLnRocmVhdCkge1xuICAgIGlmIChuLnRocmVhdC5wdnNbMV0pIHtcbiAgICAgIHNoYXBlcyA9IHNoYXBlcy5jb25jYXQobWFrZUF1dG9TaGFwZXNGcm9tVWNpKG4udGhyZWF0LnB2c1swXS5tb3Zlc1swXSwgJ3BhbGVSZWQnKSk7XG4gICAgICBuLnRocmVhdC5wdnMuc2xpY2UoMSkuZm9yRWFjaChmdW5jdGlvbihwdikge1xuICAgICAgICBjb25zdCBzaGlmdCA9IHdpbm5pbmdDaGFuY2VzLnBvdkRpZmYob3Bwb3NpdGUoY29sb3IgYXMgQ29sb3IpLCBwdiwgbi50aHJlYXQhLnB2c1swXSk7XG4gICAgICAgIGlmIChzaGlmdCA+IDAuMiB8fCBpc05hTihzaGlmdCkgfHwgc2hpZnQgPCAwKSByZXR1cm47XG4gICAgICAgIHNoYXBlcyA9IHNoYXBlcy5jb25jYXQobWFrZUF1dG9TaGFwZXNGcm9tVWNpKHB2Lm1vdmVzWzBdLCAncGFsZVJlZCcsIHtcbiAgICAgICAgICBsaW5lV2lkdGg6IE1hdGgucm91bmQoMTEgLSBzaGlmdCAqIDQ1KSAvLyAxMSB0byAyXG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZVxuICAgIHNoYXBlcyA9IHNoYXBlcy5jb25jYXQobWFrZUF1dG9TaGFwZXNGcm9tVWNpKG4udGhyZWF0LnB2c1swXS5tb3Zlc1swXSwgJ3JlZCcpKTtcbiAgfVxuICByZXR1cm4gc2hhcGVzO1xufVxuIiwiaW1wb3J0IHsgcGF0aCBhcyB0cmVlUGF0aCB9IGZyb20gJ3RyZWUnO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FuR29Gb3J3YXJkKGN0cmwpIHtcbiAgcmV0dXJuIGN0cmwudm0ubm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dChjdHJsKSB7XG4gIHZhciBjaGlsZCA9IGN0cmwudm0ubm9kZS5jaGlsZHJlblswXTtcbiAgaWYgKCFjaGlsZCkgcmV0dXJuO1xuICBjdHJsLnVzZXJKdW1wKGN0cmwudm0ucGF0aCArIGNoaWxkLmlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXYoY3RybCkge1xuICBjdHJsLnVzZXJKdW1wKHRyZWVQYXRoLmluaXQoY3RybC52bS5wYXRoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXN0KGN0cmwpIHtcbiAgdmFyIHRvSW5pdCA9ICF0cmVlUGF0aC5jb250YWlucyhjdHJsLnZtLnBhdGgsIGN0cmwudm0uaW5pdGlhbFBhdGgpO1xuICBjdHJsLnVzZXJKdW1wKFxuICAgIHRvSW5pdCA/IGN0cmwudm0uaW5pdGlhbFBhdGggOiB0cmVlUGF0aC5mcm9tTm9kZUxpc3QoY3RybC52bS5tYWlubGluZSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpcnN0KGN0cmwpIHtcbiAgdmFyIHRvSW5pdCA9IGN0cmwudm0ucGF0aCAhPT0gY3RybC52bS5pbml0aWFsUGF0aCAmJiB0cmVlUGF0aC5jb250YWlucyhjdHJsLnZtLnBhdGgsIGN0cmwudm0uaW5pdGlhbFBhdGgpO1xuICBjdHJsLnVzZXJKdW1wKFxuICAgIHRvSW5pdCA/IGN0cmwudm0uaW5pdGlhbFBhdGggOiB0cmVlUGF0aC5yb290XG4gICk7XG59XG4iLCJpbXBvcnQgeyBidWlsZCBhcyB0cmVlQnVpbGQsIG9wcyBhcyB0cmVlT3BzLCBwYXRoIGFzIHRyZWVQYXRoIH0gZnJvbSAndHJlZSc7XG5pbXBvcnQgeyBjdHJsIGFzIGNldmFsQ3RybCB9IGZyb20gJ2NldmFsJztcbmltcG9ydCB7IHJlYWREZXN0cywgZGVjb21wb3NlVWNpLCBzYW5Ub1JvbGUgfSBmcm9tICdjaGVzcyc7XG5pbXBvcnQgeyBvcHBvc2l0ZSB9IGZyb20gJ2NoZXNzZ3JvdW5kL3V0aWwnO1xuaW1wb3J0IGtleWJvYXJkIGZyb20gJy4va2V5Ym9hcmQnO1xuaW1wb3J0IHNvY2tldEJ1aWxkIGZyb20gJy4vc29ja2V0JztcbmltcG9ydCBtb3ZlVGVzdEJ1aWxkIGZyb20gJy4vbW92ZVRlc3QnO1xuaW1wb3J0IG1lcmdlU29sdXRpb24gZnJvbSAnLi9zb2x1dGlvbic7XG5pbXBvcnQgbWFrZVByb21vdGlvbiBmcm9tICcuL3Byb21vdGlvbic7XG5pbXBvcnQgY29tcHV0ZUF1dG9TaGFwZXMgZnJvbSAnLi9hdXRvU2hhcGUnO1xuaW1wb3J0IHsgcHJvcCB9IGZyb20gJ2NvbW1vbic7XG5pbXBvcnQgeyBzdG9yZWRQcm9wIH0gZnJvbSAnY29tbW9uL3N0b3JhZ2UnO1xuaW1wb3J0IHRocm90dGxlIGZyb20gJ2NvbW1vbi90aHJvdHRsZSc7XG5pbXBvcnQgKiBhcyB4aHIgZnJvbSAnLi94aHInO1xuaW1wb3J0ICogYXMgc3BlZWNoIGZyb20gJy4vc3BlZWNoJztcbmltcG9ydCB7IHNvdW5kIH0gZnJvbSAnLi9zb3VuZCc7XG5pbXBvcnQgeyBBcGkgYXMgQ2dBcGkgfSBmcm9tICdjaGVzc2dyb3VuZC9hcGknO1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnY2hlc3Nncm91bmQvdHlwZXMnO1xuaW1wb3J0IHsgVm0sIENvbnRyb2xsZXIgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRzLCByZWRyYXc6ICgpID0+IHZvaWQpOiBDb250cm9sbGVyIHtcblxuICBsZXQgdm06IFZtID0ge30gYXMgVm07XG4gIHZhciBkYXRhLCB0cmVlLCBjZXZhbCwgbW92ZVRlc3Q7XG4gIGNvbnN0IGdyb3VuZCA9IHByb3A8Q2dBcGkgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCk7XG4gIGNvbnN0IHRocmVhdE1vZGUgPSBwcm9wKGZhbHNlKTtcblxuICAvLyByZXF1aXJlZCBieSBjZXZhbFxuICB2bS5zaG93Q29tcHV0ZXIgPSAoKSA9PiB2bS5tb2RlID09PSAndmlldyc7XG4gIHZtLnNob3dBdXRvU2hhcGVzID0gKCkgPT4gdHJ1ZTtcblxuICBmdW5jdGlvbiBzZXRQYXRoKHBhdGgpIHtcbiAgICB2bS5wYXRoID0gcGF0aDtcbiAgICB2bS5ub2RlTGlzdCA9IHRyZWUuZ2V0Tm9kZUxpc3QocGF0aCk7XG4gICAgdm0ubm9kZSA9IHRyZWVPcHMubGFzdCh2bS5ub2RlTGlzdCkhO1xuICAgIHZtLm1haW5saW5lID0gdHJlZU9wcy5tYWlubGluZU5vZGVMaXN0KHRyZWUucm9vdCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gd2l0aEdyb3VuZDxBPihmOiAoY2c6IENnQXBpKSA9PiBBKTogQSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZyA9IGdyb3VuZCgpO1xuICAgIGlmIChnKSByZXR1cm4gZihnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYXRlKGZyb21EYXRhKSB7XG4gICAgZGF0YSA9IGZyb21EYXRhO1xuICAgIHRyZWUgPSB0cmVlQnVpbGQodHJlZU9wcy5yZWNvbnN0cnVjdChkYXRhLmdhbWUudHJlZVBhcnRzKSk7XG4gICAgdmFyIGluaXRpYWxQYXRoID0gdHJlZVBhdGguZnJvbU5vZGVMaXN0KHRyZWVPcHMubWFpbmxpbmVOb2RlTGlzdCh0cmVlLnJvb3QpKTtcbiAgICAvLyBwbGF5IHwgdHJ5IHwgdmlld1xuICAgIHZtLm1vZGUgPSAncGxheSc7XG4gICAgdm0ubG9hZGluZyA9IGZhbHNlO1xuICAgIHZtLnJvdW5kID0gdW5kZWZpbmVkO1xuICAgIHZtLnZvdGVkID0gdW5kZWZpbmVkO1xuICAgIHZtLmp1c3RQbGF5ZWQgPSB1bmRlZmluZWQ7XG4gICAgdm0ucmVzdWx0U2VudCA9IGZhbHNlO1xuICAgIHZtLmxhc3RGZWVkYmFjayA9ICdpbml0JztcbiAgICB2bS5pbml0aWFsUGF0aCA9IGluaXRpYWxQYXRoO1xuICAgIHZtLmluaXRpYWxOb2RlID0gdHJlZS5ub2RlQXRQYXRoKGluaXRpYWxQYXRoKTtcblxuICAgIHNldFBhdGgodHJlZVBhdGguaW5pdChpbml0aWFsUGF0aCkpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBqdW1wKGluaXRpYWxQYXRoKTtcbiAgICAgIHJlZHJhdygpO1xuICAgIH0sIDUwMCk7XG5cbiAgICAvLyBqdXN0IHRvIGRlbGF5IGJ1dHRvbiBkaXNwbGF5XG4gICAgdm0uY2FuVmlld1NvbHV0aW9uID0gZmFsc2U7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHZtLmNhblZpZXdTb2x1dGlvbiA9IHRydWU7XG4gICAgICByZWRyYXcoKTtcbiAgICB9LCA1MDAwKTtcblxuICAgIG1vdmVUZXN0ID0gbW92ZVRlc3RCdWlsZCh2bSwgZGF0YS5wdXp6bGUpO1xuXG4gICAgd2l0aEdyb3VuZChmdW5jdGlvbihnKSB7XG4gICAgICBnLnNldEF1dG9TaGFwZXMoW10pO1xuICAgICAgZy5zZXRTaGFwZXMoW10pO1xuICAgICAgc2hvd0dyb3VuZChnKTtcbiAgICB9KTtcblxuICAgIGluc3RhbmNpYXRlQ2V2YWwoKTtcblxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsICcnLCAnL3RyYWluaW5nLycgKyBkYXRhLnB1enpsZS5pZCk7XG4gIH07XG5cbiAgdmFyIG1ha2VDZ09wdHMgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBub2RlID0gdm0ubm9kZTtcbiAgICBjb25zdCBjb2xvcjogQ29sb3IgPSBub2RlLnBseSAlIDIgPT09IDAgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICBjb25zdCBkZXN0cyA9IHJlYWREZXN0cyhub2RlLmRlc3RzKTtcbiAgICBjb25zdCBtb3ZhYmxlID0gKHZtLm1vZGUgPT09ICd2aWV3JyB8fCBjb2xvciA9PT0gZGF0YS5wdXp6bGUuY29sb3IpID8ge1xuICAgICAgY29sb3I6IChkZXN0cyAmJiBPYmplY3Qua2V5cyhkZXN0cykubGVuZ3RoID4gMCkgPyBjb2xvciA6IHVuZGVmaW5lZCxcbiAgICAgIGRlc3RzOiBkZXN0cyB8fCB7fVxuICAgIH0gOiB7XG4gICAgICBjb2xvcjogdW5kZWZpbmVkLFxuICAgICAgZGVzdHM6IHt9XG4gICAgfTtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBmZW46IG5vZGUuZmVuLFxuICAgICAgb3JpZW50YXRpb246IGRhdGEucHV6emxlLmNvbG9yLFxuICAgICAgdHVybkNvbG9yOiBjb2xvcixcbiAgICAgIG1vdmFibGU6IG1vdmFibGUsXG4gICAgICBwcmVtb3ZhYmxlOiB7XG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlXG4gICAgICB9LFxuICAgICAgY2hlY2s6ICEhbm9kZS5jaGVjayxcbiAgICAgIGxhc3RNb3ZlOiB1Y2lUb0xhc3RNb3ZlKG5vZGUudWNpKVxuICAgIH07XG4gICAgaWYgKG5vZGUucGx5ID49IHZtLmluaXRpYWxOb2RlLnBseSkge1xuICAgICAgaWYgKCFkZXN0cyAmJiAhbm9kZS5jaGVjaykge1xuICAgICAgICAvLyBwcmVtb3ZlIHdoaWxlIGRlc3RzIGFyZSBsb2FkaW5nIGZyb20gc2VydmVyXG4gICAgICAgIC8vIGNhbid0IHVzZSB3aGVuIGluIGNoZWNrIGJlY2F1c2UgaXQgaGlnaGxpZ2h0cyB0aGUgd3Jvbmcga2luZ1xuICAgICAgICBjb25maWcudHVybkNvbG9yID0gb3Bwb3NpdGUoY29sb3IpO1xuICAgICAgICBjb25maWcubW92YWJsZS5jb2xvciA9IGNvbG9yO1xuICAgICAgICBjb25maWcucHJlbW92YWJsZS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodm0ubW9kZSAhPT0gJ3ZpZXcnICYmIGNvbG9yICE9PSBkYXRhLnB1enpsZS5jb2xvcikge1xuICAgICAgICBjb25maWcubW92YWJsZS5jb2xvciA9IGRhdGEucHV6emxlLmNvbG9yO1xuICAgICAgICBjb25maWcucHJlbW92YWJsZS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdm0uY2dDb25maWcgPSBjb25maWc7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfTtcblxuICBmdW5jdGlvbiBzaG93R3JvdW5kKGcpIHtcbiAgICBnLnNldChtYWtlQ2dPcHRzKCkpO1xuICAgIGlmICghdm0ubm9kZS5kZXN0cykgZ2V0RGVzdHMoKTtcbiAgfTtcblxuICBmdW5jdGlvbiB1c2VyTW92ZShvcmlnLCBkZXN0KSB7XG4gICAgdm0uanVzdFBsYXllZCA9IG9yaWc7XG4gICAgaWYgKCFwcm9tb3Rpb24uc3RhcnQob3JpZywgZGVzdCwgc2VuZE1vdmUpKSBzZW5kTW92ZShvcmlnLCBkZXN0KTtcbiAgfTtcblxuICBmdW5jdGlvbiBzZW5kTW92ZShvcmlnOiBLZXksIGRlc3Q6IEtleSwgcHJvbT86IGNnLlJvbGUpIHtcbiAgICBjb25zdCBtb3ZlOiBhbnkgPSB7XG4gICAgICBvcmlnOiBvcmlnLFxuICAgICAgZGVzdDogZGVzdCxcbiAgICAgIGZlbjogdm0ubm9kZS5mZW4sXG4gICAgICBwYXRoOiB2bS5wYXRoXG4gICAgfTtcbiAgICBpZiAocHJvbSkgbW92ZS5wcm9tb3Rpb24gPSBwcm9tO1xuICAgIHNvY2tldC5zZW5kQW5hTW92ZShtb3ZlKTtcbiAgfTtcblxuICB2YXIgZ2V0RGVzdHMgPSB0aHJvdHRsZSg4MDAsIGZ1bmN0aW9uKCkge1xuICAgIGlmICghdm0ubm9kZS5kZXN0cyAmJiB0cmVlUGF0aC5jb250YWlucyh2bS5wYXRoLCB2bS5pbml0aWFsUGF0aCkpXG4gICAgICBzb2NrZXQuc2VuZEFuYURlc3RzKHtcbiAgICAgICAgZmVuOiB2bS5ub2RlLmZlbixcbiAgICAgICAgcGF0aDogdm0ucGF0aFxuICAgICAgfSk7XG4gIH0pO1xuXG4gIHZhciB1Y2lUb0xhc3RNb3ZlID0gZnVuY3Rpb24odWNpKSB7XG4gICAgcmV0dXJuIHVjaSAmJiBbdWNpLnN1YnN0cigwLCAyKSwgdWNpLnN1YnN0cigyLCAyKV07IC8vIGFzc3VtaW5nIHN0YW5kYXJkIGNoZXNzXG4gIH07XG5cbiAgdmFyIGFkZE5vZGUgPSBmdW5jdGlvbihub2RlLCBwYXRoKSB7XG4gICAgdmFyIG5ld1BhdGggPSB0cmVlLmFkZE5vZGUobm9kZSwgcGF0aCk7XG4gICAganVtcChuZXdQYXRoKTtcbiAgICByZW9yZGVyQ2hpbGRyZW4ocGF0aCk7XG4gICAgcmVkcmF3KCk7XG4gICAgd2l0aEdyb3VuZChmdW5jdGlvbihnKSB7IGcucGxheVByZW1vdmUoKTsgfSk7XG5cbiAgICB2YXIgcHJvZ3Jlc3MgPSBtb3ZlVGVzdCgpO1xuICAgIGlmIChwcm9ncmVzcykgYXBwbHlQcm9ncmVzcyhwcm9ncmVzcyk7XG4gICAgcmVkcmF3KCk7XG4gICAgc3BlZWNoLm5vZGUobm9kZSwgZmFsc2UpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlb3JkZXJDaGlsZHJlbihwYXRoOiBUcmVlLlBhdGgsIHJlY3Vyc2l2ZT86IGJvb2xlYW4pIHtcbiAgICB2YXIgbm9kZSA9IHRyZWUubm9kZUF0UGF0aChwYXRoKTtcbiAgICBub2RlLmNoaWxkcmVuLnNvcnQoZnVuY3Rpb24oYzEsIF8pIHtcbiAgICAgIGlmIChjMS5wdXp6bGUgPT09ICdmYWlsJykgcmV0dXJuIDE7XG4gICAgICBpZiAoYzEucHV6emxlID09PSAncmV0cnknKSByZXR1cm4gMTtcbiAgICAgIGlmIChjMS5wdXp6bGUgPT09ICdnb29kJykgcmV0dXJuIC0xO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG4gICAgaWYgKHJlY3Vyc2l2ZSkgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICByZW9yZGVyQ2hpbGRyZW4ocGF0aCArIGNoaWxkLmlkLCB0cnVlKTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcmV2ZXJ0VXNlck1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgd2l0aEdyb3VuZChmdW5jdGlvbihnKSB7IGcuY2FuY2VsUHJlbW92ZSgpOyB9KTtcbiAgICAgIHVzZXJKdW1wKHRyZWVQYXRoLmluaXQodm0ucGF0aCkpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSwgNTAwKTtcbiAgfTtcblxuICB2YXIgYXBwbHlQcm9ncmVzcyA9IGZ1bmN0aW9uKHByb2dyZXNzKSB7XG4gICAgaWYgKHByb2dyZXNzID09PSAnZmFpbCcpIHtcbiAgICAgIHZtLmxhc3RGZWVkYmFjayA9ICdmYWlsJztcbiAgICAgIHJldmVydFVzZXJNb3ZlKCk7XG4gICAgICBpZiAodm0ubW9kZSA9PT0gJ3BsYXknKSB7XG4gICAgICAgIHZtLmNhblZpZXdTb2x1dGlvbiA9IHRydWU7XG4gICAgICAgIHZtLm1vZGUgPSAndHJ5JztcbiAgICAgICAgc2VuZFJlc3VsdChmYWxzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwcm9ncmVzcyA9PT0gJ3JldHJ5Jykge1xuICAgICAgdm0ubGFzdEZlZWRiYWNrID0gJ3JldHJ5JztcbiAgICAgIHJldmVydFVzZXJNb3ZlKCk7XG4gICAgfSBlbHNlIGlmIChwcm9ncmVzcyA9PT0gJ3dpbicpIHtcbiAgICAgIGlmICh2bS5tb2RlICE9PSAndmlldycpIHtcbiAgICAgICAgaWYgKHZtLm1vZGUgPT09ICdwbGF5Jykgc2VuZFJlc3VsdCh0cnVlKTtcbiAgICAgICAgdm0ubGFzdEZlZWRiYWNrID0gJ3dpbic7XG4gICAgICAgIHZtLm1vZGUgPSAndmlldyc7XG4gICAgICAgIHdpdGhHcm91bmQoc2hvd0dyb3VuZCk7IC8vIHRvIGRpc2FibGUgcHJlbW92ZXNcbiAgICAgICAgc3RhcnRDZXZhbCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3MgJiYgcHJvZ3Jlc3Mub3JpZykge1xuICAgICAgdm0ubGFzdEZlZWRiYWNrID0gJ2dvb2QnO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgc29ja2V0LnNlbmRBbmFNb3ZlKHByb2dyZXNzKTtcbiAgICAgIH0sIDUwMCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIHNlbmRSZXN1bHQod2luKSB7XG4gICAgaWYgKHZtLnJlc3VsdFNlbnQpIHJldHVybjtcbiAgICB2bS5yZXN1bHRTZW50ID0gdHJ1ZTtcbiAgICBuYlRvVm90ZUNhbGwoTWF0aC5tYXgoMCwgcGFyc2VJbnQobmJUb1ZvdGVDYWxsKCkpIC0gMSkpO1xuICAgIHhoci5yb3VuZChkYXRhLnB1enpsZS5pZCwgd2luKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgZGF0YS51c2VyID0gcmVzLnVzZXI7XG4gICAgICB2bS5yb3VuZCA9IHJlcy5yb3VuZDtcbiAgICAgIHZtLnZvdGVkID0gcmVzLnZvdGVkO1xuICAgICAgcmVkcmF3KCk7XG4gICAgICBpZiAod2luKSBzcGVlY2guc3VjY2VzcygpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG5leHRQdXp6bGUoKSB7XG4gICAgY2V2YWwuc3RvcCgpO1xuICAgIHZtLmxvYWRpbmcgPSB0cnVlO1xuICAgIHJlZHJhdygpO1xuICAgIHhoci5uZXh0UHV6emxlKCkuZG9uZShmdW5jdGlvbihkKSB7XG4gICAgICB2bS5yb3VuZCA9IG51bGw7XG4gICAgICB2bS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICBpbml0aWF0ZShkKTtcbiAgICAgIHJlZHJhdygpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGFkZERlc3RzKGRlc3RzLCBwYXRoLCBvcGVuaW5nKSB7XG4gICAgdHJlZS5hZGREZXN0cyhkZXN0cywgcGF0aCwgb3BlbmluZyk7XG4gICAgaWYgKHBhdGggPT09IHZtLnBhdGgpIHtcbiAgICAgIHdpdGhHcm91bmQoc2hvd0dyb3VuZCk7XG4gICAgICAvLyByZWRyYXcoKTtcbiAgICAgIGlmIChnYW1lT3ZlcigpKSBjZXZhbC5zdG9wKCk7XG4gICAgfVxuICAgIHdpdGhHcm91bmQoZnVuY3Rpb24oZykgeyBnLnBsYXlQcmVtb3ZlKCk7IH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluc3RhbmNpYXRlQ2V2YWwoKSB7XG4gICAgaWYgKGNldmFsKSBjZXZhbC5kZXN0cm95KCk7XG4gICAgY2V2YWwgPSBjZXZhbEN0cmwoe1xuICAgICAgcmVkcmF3LFxuICAgICAgc3RvcmFnZUtleVByZWZpeDogJ3B1enpsZScsXG4gICAgICBtdWx0aVB2RGVmYXVsdDogMyxcbiAgICAgIHZhcmlhbnQ6IHtcbiAgICAgICAgc2hvcnQ6ICdTdGQnLFxuICAgICAgICBuYW1lOiAnU3RhbmRhcmQnLFxuICAgICAgICBrZXk6ICdzdGFuZGFyZCdcbiAgICAgIH0sXG4gICAgICBwb3NzaWJsZTogdHJ1ZSxcbiAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2LCB3b3JrKSB7XG4gICAgICAgIHRyZWUudXBkYXRlQXQod29yay5wYXRoLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgaWYgKHdvcmsudGhyZWF0TW9kZSkge1xuICAgICAgICAgICAgaWYgKCFub2RlLnRocmVhdCB8fCBub2RlLnRocmVhdC5kZXB0aCA8PSBldi5kZXB0aCB8fCBub2RlLnRocmVhdC5tYXhEZXB0aCA8IGV2Lm1heERlcHRoKVxuICAgICAgICAgICAgICBub2RlLnRocmVhdCA9IGV2O1xuICAgICAgICAgIH0gZWxzZSBpZiAoIW5vZGUuY2V2YWwgfHwgbm9kZS5jZXZhbC5kZXB0aCA8PSBldi5kZXB0aCB8fCBub2RlLmNldmFsLm1heERlcHRoIDwgZXYubWF4RGVwdGgpXG4gICAgICAgICAgICBub2RlLmNldmFsID0gZXY7XG4gICAgICAgICAgaWYgKHdvcmsucGF0aCA9PT0gdm0ucGF0aCkge1xuICAgICAgICAgICAgc2V0QXV0b1NoYXBlcygpO1xuICAgICAgICAgICAgcmVkcmF3KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBzZXRBdXRvU2hhcGVzOiBzZXRBdXRvU2hhcGVzLFxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHNldEF1dG9TaGFwZXMoKSB7XG4gICAgd2l0aEdyb3VuZChmdW5jdGlvbihnKSB7XG4gICAgICBnLnNldEF1dG9TaGFwZXMoY29tcHV0ZUF1dG9TaGFwZXMoe1xuICAgICAgICB2bTogdm0sXG4gICAgICAgIGNldmFsOiBjZXZhbCxcbiAgICAgICAgZ3JvdW5kOiBnLFxuICAgICAgICB0aHJlYXRNb2RlOiB0aHJlYXRNb2RlKCksXG4gICAgICAgIG5leHROb2RlQmVzdDogbmV4dE5vZGVCZXN0KClcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBjYW5Vc2VDZXZhbCgpIHtcbiAgICByZXR1cm4gdm0ubW9kZSA9PT0gJ3ZpZXcnICYmICFnYW1lT3ZlcigpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHN0YXJ0Q2V2YWwoKSB7XG4gICAgaWYgKGNldmFsLmVuYWJsZWQoKSAmJiBjYW5Vc2VDZXZhbCgpKSBkb1N0YXJ0Q2V2YWwoKTtcbiAgfTtcblxuICBjb25zdCBkb1N0YXJ0Q2V2YWwgPSB0aHJvdHRsZSg4MDAsIGZ1bmN0aW9uKCkge1xuICAgIGNldmFsLnN0YXJ0KHZtLnBhdGgsIHZtLm5vZGVMaXN0LCB0aHJlYXRNb2RlKCkpO1xuICB9KTtcblxuICBmdW5jdGlvbiBuZXh0Tm9kZUJlc3QoKSB7XG4gICAgcmV0dXJuIHRyZWVPcHMud2l0aE1haW5saW5lQ2hpbGQodm0ubm9kZSwgZnVuY3Rpb24obikge1xuICAgICAgLy8gcmV0dXJuIG4uZXZhbCA/IG4uZXZhbC5wdnNbMF0ubW92ZXNbMF0gOiBudWxsO1xuICAgICAgcmV0dXJuIG4uZXZhbCA/IG4uZXZhbC5iZXN0IDogdW5kZWZpbmVkO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHBsYXlVY2kodWNpKSB7XG4gICAgdmFyIG1vdmUgPSBkZWNvbXBvc2VVY2kodWNpKTtcbiAgICBpZiAoIW1vdmVbMl0pIHNlbmRNb3ZlKG1vdmVbMF0sIG1vdmVbMV0pXG4gICAgZWxzZSBzZW5kTW92ZShtb3ZlWzBdLCBtb3ZlWzFdLCBzYW5Ub1JvbGVbbW92ZVsyXS50b1VwcGVyQ2FzZSgpXSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0Q2V2YWwoKSB7XG4gICAgcmV0dXJuIGNldmFsO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHRvZ2dsZUNldmFsKCkge1xuICAgIGNldmFsLnRvZ2dsZSgpO1xuICAgIHNldEF1dG9TaGFwZXMoKTtcbiAgICBzdGFydENldmFsKCk7XG4gICAgaWYgKCFjZXZhbC5lbmFibGVkKCkpIHRocmVhdE1vZGUoZmFsc2UpO1xuICAgIHZtLmF1dG9TY3JvbGxSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgIHJlZHJhdygpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHRvZ2dsZVRocmVhdE1vZGUoKSB7XG4gICAgaWYgKHZtLm5vZGUuY2hlY2spIHJldHVybjtcbiAgICBpZiAoIWNldmFsLmVuYWJsZWQoKSkgY2V2YWwudG9nZ2xlKCk7XG4gICAgaWYgKCFjZXZhbC5lbmFibGVkKCkpIHJldHVybjtcbiAgICB0aHJlYXRNb2RlKCF0aHJlYXRNb2RlKCkpO1xuICAgIHNldEF1dG9TaGFwZXMoKTtcbiAgICBzdGFydENldmFsKCk7XG4gICAgcmVkcmF3KCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2FtZU92ZXIoKSB7XG4gICAgaWYgKHZtLm5vZGUuZGVzdHMgIT09ICcnKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHZtLm5vZGUuY2hlY2sgPyAnY2hlY2ttYXRlJyA6ICdkcmF3JztcbiAgfTtcblxuICBmdW5jdGlvbiBqdW1wKHBhdGgpIHtcbiAgICBjb25zdCBwYXRoQ2hhbmdlZCA9IHBhdGggIT09IHZtLnBhdGgsXG4gICAgICBpc0ZvcndhcmRTdGVwID0gcGF0aENoYW5nZWQgJiYgcGF0aC5sZW5ndGggPT09IHZtLnBhdGgubGVuZ3RoICsgMjtcbiAgICBzZXRQYXRoKHBhdGgpO1xuICAgIHdpdGhHcm91bmQoc2hvd0dyb3VuZCk7XG4gICAgaWYgKHBhdGhDaGFuZ2VkKSB7XG4gICAgICBpZiAoaXNGb3J3YXJkU3RlcCkge1xuICAgICAgICBpZiAoIXZtLm5vZGUudWNpKSBzb3VuZC5tb3ZlKCk7IC8vIGluaXRpYWwgcG9zaXRpb25cbiAgICAgICAgZWxzZSBpZiAoIXZtLmp1c3RQbGF5ZWQgfHwgdm0ubm9kZS51Y2kuaW5jbHVkZXModm0uanVzdFBsYXllZCkpIHtcbiAgICAgICAgICBpZiAodm0ubm9kZS5zYW4hLmluY2x1ZGVzKCd4JykpIHNvdW5kLmNhcHR1cmUoKTtcbiAgICAgICAgICBlbHNlIHNvdW5kLm1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL1xcK3xcXCMvLnRlc3Qodm0ubm9kZS5zYW4hKSkgc291bmQuY2hlY2soKTtcbiAgICAgIH1cbiAgICAgIHRocmVhdE1vZGUoZmFsc2UpO1xuICAgICAgY2V2YWwuc3RvcCgpO1xuICAgICAgc3RhcnRDZXZhbCgpO1xuICAgIH1cbiAgICBwcm9tb3Rpb24uY2FuY2VsKCk7XG4gICAgdm0uanVzdFBsYXllZCA9IHVuZGVmaW5lZDtcbiAgICB2bS5hdXRvU2Nyb2xsUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgncGx5Jywgdm0ubm9kZS5wbHkpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHVzZXJKdW1wKHBhdGgpIHtcbiAgICB3aXRoR3JvdW5kKGZ1bmN0aW9uKGcpIHtcbiAgICAgIGcuc2VsZWN0U3F1YXJlKG51bGwpO1xuICAgIH0pO1xuICAgIGp1bXAocGF0aCk7XG4gICAgc3BlZWNoLm5vZGUodm0ubm9kZSwgdHJ1ZSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmlld1NvbHV0aW9uKCkge1xuICAgIGlmICghdm0uY2FuVmlld1NvbHV0aW9uKSByZXR1cm47XG4gICAgc2VuZFJlc3VsdChmYWxzZSk7XG4gICAgdm0ubW9kZSA9ICd2aWV3JztcbiAgICBtZXJnZVNvbHV0aW9uKHZtLmluaXRpYWxOb2RlLCBkYXRhLnB1enpsZS5icmFuY2gsIGRhdGEucHV6emxlLmNvbG9yKTtcbiAgICByZW9yZGVyQ2hpbGRyZW4odm0uaW5pdGlhbFBhdGgsIHRydWUpO1xuXG4gICAgLy8gdHJ5IGFuZCBwbGF5IHRoZSBzb2x1dGlvbiBuZXh0IG1vdmVcbiAgICB2YXIgbmV4dCA9IHZtLm5vZGUuY2hpbGRyZW5bMF07XG4gICAgaWYgKG5leHQgJiYgbmV4dC5wdXp6bGUgPT09ICdnb29kJykgdXNlckp1bXAodm0ucGF0aCArIG5leHQuaWQpO1xuICAgIGVsc2Uge1xuICAgICAgdmFyIGZpcnN0R29vZFBhdGggPSB0cmVlT3BzLnRha2VQYXRoV2hpbGUodm0ubWFpbmxpbmUsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUucHV6emxlICE9PSAnZ29vZCc7XG4gICAgICB9KTtcbiAgICAgIGlmIChmaXJzdEdvb2RQYXRoKSB1c2VySnVtcChmaXJzdEdvb2RQYXRoICsgdHJlZS5ub2RlQXRQYXRoKGZpcnN0R29vZFBhdGgpLmNoaWxkcmVuWzBdLmlkKTtcbiAgICB9XG5cbiAgICB2bS5hdXRvU2Nyb2xsUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICByZWRyYXcoKTtcbiAgICBzdGFydENldmFsKCk7XG4gIH07XG5cbiAgY29uc3Qgc29ja2V0ID0gc29ja2V0QnVpbGQoe1xuICAgIHNlbmQ6IG9wdHMuc29ja2V0U2VuZCxcbiAgICBhZGROb2RlOiBhZGROb2RlLFxuICAgIGFkZERlc3RzOiBhZGREZXN0cyxcbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB3aXRoR3JvdW5kKHNob3dHcm91bmQpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiByZWNlbnRIYXNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdwaCcgKyBkYXRhLnB1enpsZS5pZCArIChkYXRhLnVzZXIgPyBkYXRhLnVzZXIucmVjZW50LnJlZHVjZShmdW5jdGlvbihoLCByKSB7XG4gICAgICByZXR1cm4gaCArIHJbMF07XG4gICAgfSwgJycpIDogJycpO1xuICB9XG5cbiAgY29uc3QgbmJUb1ZvdGVDYWxsID0gc3RvcmVkUHJvcCgncHV6emxlLnZvdGUtY2FsbCcsIDMpO1xuICBsZXQgdGhhbmtzVW50aWw6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICBjb25zdCBjYWxsVG9Wb3RlID0gKCkgPT4gcGFyc2VJbnQobmJUb1ZvdGVDYWxsKCkpIDwgMTtcblxuICBjb25zdCB2b3RlID0gdGhyb3R0bGUoMTAwMCwgZnVuY3Rpb24odikge1xuICAgIGlmIChjYWxsVG9Wb3RlKCkpIHRoYW5rc1VudGlsID0gRGF0ZS5ub3coKSArIDIwMDA7XG4gICAgbmJUb1ZvdGVDYWxsKDUpO1xuICAgIHZtLnZvdGVkID0gdjtcbiAgICB4aHIudm90ZShkYXRhLnB1enpsZS5pZCwgdikudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGRhdGEucHV6emxlLnZvdGUgPSByZXNbMV07XG4gICAgICByZWRyYXcoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaW5pdGlhdGUob3B0cy5kYXRhKTtcblxuICBjb25zdCBwcm9tb3Rpb24gPSBtYWtlUHJvbW90aW9uKHZtLCBncm91bmQsIHJlZHJhdyk7XG5cbiAga2V5Ym9hcmQoe1xuICAgIHZtLFxuICAgIHVzZXJKdW1wLFxuICAgIGdldENldmFsLFxuICAgIHRvZ2dsZUNldmFsLFxuICAgIHRvZ2dsZVRocmVhdE1vZGUsXG4gICAgcmVkcmF3LFxuICAgIHBsYXlCZXN0TW92ZSgpIHtcbiAgICAgIHZhciB1Y2kgPSBuZXh0Tm9kZUJlc3QoKSB8fCAodm0ubm9kZS5jZXZhbCAmJiB2bS5ub2RlLmNldmFsLnB2c1swXS5tb3Zlc1swXSk7XG4gICAgICBpZiAodWNpKSBwbGF5VWNpKHVjaSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBJZiB0aGUgcGFnZSBsb2FkcyB3aGlsZSBiZWluZyBoaWRkZW4gKGxpa2Ugd2hlbiBjaGFuZ2luZyBzZXR0aW5ncyksXG4gIC8vIGNoZXNzZ3JvdW5kIGlzIG5vdCBkaXNwbGF5ZWQsIGFuZCB0aGUgZmlyc3QgbW92ZSBpcyBub3QgZnVsbHkgYXBwbGllZC5cbiAgLy8gTWFrZSBzdXJlIGNoZXNzZ3JvdW5kIGlzIGZ1bGx5IHNob3duIHdoZW4gdGhlIHBhZ2UgZ29lcyBiYWNrIHRvIGJlaW5nIHZpc2libGUuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cubGljaGVzcy5yZXF1ZXN0SWRsZUNhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgICAganVtcCh2bS5wYXRoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgc3BlZWNoLnNldHVwKCk7XG5cbiAgcmV0dXJuIHtcbiAgICB2bSxcbiAgICBnZXREYXRhKCkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSxcbiAgICBnZXRUcmVlKCkge1xuICAgICAgcmV0dXJuIHRyZWU7XG4gICAgfSxcbiAgICBncm91bmQsXG4gICAgbWFrZUNnT3B0cyxcbiAgICB1c2VySnVtcCxcbiAgICB2aWV3U29sdXRpb24sXG4gICAgbmV4dFB1enpsZSxcbiAgICByZWNlbnRIYXNoLFxuICAgIGNhbGxUb1ZvdGUsXG4gICAgdGhhbmtzKCkge1xuICAgICAgcmV0dXJuICEhdGhhbmtzVW50aWwgJiYgRGF0ZS5ub3coKSA8IHRoYW5rc1VudGlsO1xuICAgIH0sXG4gICAgdm90ZSxcbiAgICBnZXRDZXZhbCxcbiAgICBwcmVmOiBvcHRzLnByZWYsXG4gICAgdHJhbnM6IHdpbmRvdy5saWNoZXNzLnRyYW5zKG9wdHMuaTE4biksXG4gICAgc29ja2V0UmVjZWl2ZTogc29ja2V0LnJlY2VpdmUsXG4gICAgZ2FtZU92ZXIsXG4gICAgdG9nZ2xlQ2V2YWwsXG4gICAgdG9nZ2xlVGhyZWF0TW9kZSxcbiAgICB0aHJlYXRNb2RlLFxuICAgIGN1cnJlbnRFdmFscygpIHtcbiAgICAgIHJldHVybiB7IGNsaWVudDogdm0ubm9kZS5jZXZhbCB9O1xuICAgIH0sXG4gICAgbmV4dE5vZGVCZXN0LFxuICAgIHVzZXJNb3ZlLFxuICAgIHBsYXlVY2ksXG4gICAgc2hvd0V2YWxHYXVnZSgpIHtcbiAgICAgIHJldHVybiB2bS5zaG93Q29tcHV0ZXIoKSAmJiBjZXZhbC5lbmFibGVkKCk7XG4gICAgfSxcbiAgICBnZXRPcmllbnRhdGlvbigpIHtcbiAgICAgIHJldHVybiB3aXRoR3JvdW5kKGZ1bmN0aW9uKGcpIHsgcmV0dXJuIGcuc3RhdGUub3JpZW50YXRpb24gfSkhO1xuICAgIH0sXG4gICAgZ2V0Tm9kZSgpIHtcbiAgICAgIHJldHVybiB2bS5ub2RlO1xuICAgIH0sXG4gICAgc2hvd0NvbXB1dGVyOiB2bS5zaG93Q29tcHV0ZXIsXG4gICAgcHJvbW90aW9uLFxuICAgIHJlZHJhdyxcbiAgICBvbmdvaW5nOiBmYWxzZVxuICB9O1xufVxuIiwiaW1wb3J0ICogYXMgY29udHJvbCBmcm9tICcuL2NvbnRyb2wnO1xuXG5jb25zdCBwcmV2ZW50aW5nID0gKGY6ICgpID0+IHZvaWQpID0+IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgZigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsKSB7XG4gIGlmICghd2luZG93Lk1vdXNldHJhcCkgcmV0dXJuO1xuICBjb25zdCBrYmQgPSB3aW5kb3cuTW91c2V0cmFwO1xuICBrYmQuYmluZChbJ2xlZnQnLCAnayddLCBwcmV2ZW50aW5nKGZ1bmN0aW9uKCkge1xuICAgIGNvbnRyb2wucHJldihjdHJsKTtcbiAgICBjdHJsLnJlZHJhdygpO1xuICB9KSk7XG4gIGtiZC5iaW5kKFsncmlnaHQnLCAnaiddLCBwcmV2ZW50aW5nKGZ1bmN0aW9uKCkge1xuICAgIGNvbnRyb2wubmV4dChjdHJsKTtcbiAgICBjdHJsLnJlZHJhdygpO1xuICB9KSk7XG4gIGtiZC5iaW5kKFsndXAnLCAnMCddLCBwcmV2ZW50aW5nKGZ1bmN0aW9uKCkge1xuICAgIGNvbnRyb2wuZmlyc3QoY3RybCk7XG4gICAgY3RybC5yZWRyYXcoKTtcbiAgfSkpO1xuICBrYmQuYmluZChbJ2Rvd24nLCAnJCddLCBwcmV2ZW50aW5nKGZ1bmN0aW9uKCkge1xuICAgIGNvbnRyb2wubGFzdChjdHJsKTtcbiAgICBjdHJsLnJlZHJhdygpO1xuICB9KSk7XG4gIGtiZC5iaW5kKCdsJywgcHJldmVudGluZyhjdHJsLnRvZ2dsZUNldmFsKSk7XG4gIGtiZC5iaW5kKCd4JywgcHJldmVudGluZyhjdHJsLnRvZ2dsZVRocmVhdE1vZGUpKTtcbiAga2JkLmJpbmQoJ3NwYWNlJywgcHJldmVudGluZyhmdW5jdGlvbigpIHtcbiAgICBpZiAoY3RybC52bS5tb2RlICE9PSAndmlldycpIHJldHVybjtcbiAgICBpZiAoY3RybC5nZXRDZXZhbCgpLmVuYWJsZWQoKSkgY3RybC5wbGF5QmVzdE1vdmUoKTtcbiAgICBlbHNlIGN0cmwudG9nZ2xlQ2V2YWwoKTtcbiAgfSkpO1xufVxuIiwiaW1wb3J0IG1ha2VDdHJsIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgdmlldyBmcm9tICcuL3ZpZXcvbWFpbic7XG5cbmltcG9ydCB7IENoZXNzZ3JvdW5kIH0gZnJvbSAnY2hlc3Nncm91bmQnO1xuaW1wb3J0IHsgQ29udHJvbGxlciB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7IGluaXQgfSBmcm9tICdzbmFiYmRvbSc7XG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IGtsYXNzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnO1xuaW1wb3J0IGF0dHJpYnV0ZXMgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJztcbmltcG9ydCB7IG1lbnVIb3ZlciB9IGZyb20gJ2NvbW1vbi9tZW51SG92ZXInO1xuXG5tZW51SG92ZXIoKTtcblxuY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlc10pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRzKSB7XG5cbiAgbGV0IHZub2RlOiBWTm9kZSwgY3RybDogQ29udHJvbGxlcjtcblxuICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgdm5vZGUgPSBwYXRjaCh2bm9kZSwgdmlldyhjdHJsKSk7XG4gIH1cblxuICBjdHJsID0gbWFrZUN0cmwob3B0cywgcmVkcmF3KTtcblxuICBjb25zdCBibHVlcHJpbnQgPSB2aWV3KGN0cmwpO1xuICBvcHRzLmVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gIHZub2RlID0gcGF0Y2gob3B0cy5lbGVtZW50LCBibHVlcHJpbnQpO1xuXG4gIHJldHVybiB7XG4gICAgc29ja2V0UmVjZWl2ZTogY3RybC5zb2NrZXRSZWNlaXZlXG4gIH07XG59O1xuXG4vLyB0aGF0J3MgZm9yIHRoZSByZXN0IG9mIGxpY2hlc3MgdG8gYWNjZXNzIGNoZXNzZ3JvdW5kXG4vLyB3aXRob3V0IGhhdmluZyB0byBpbmNsdWRlIGl0IGEgc2Vjb25kIHRpbWVcbndpbmRvdy5DaGVzc2dyb3VuZCA9IENoZXNzZ3JvdW5kO1xuIiwiaW1wb3J0IHsgcGF0aCBhcyBwYXRoT3BzIH0gZnJvbSAndHJlZSc7XG5pbXBvcnQgeyBkZWNvbXBvc2VVY2ksIHNhblRvUm9sZSB9IGZyb20gJ2NoZXNzJztcblxuY29uc3QgYWx0Q2FzdGxlcyA9IHtcbiAgZTFhMTogJ2UxYzEnLFxuICBlMWgxOiAnZTFnMScsXG4gIGU4YTg6ICdlOGM4JyxcbiAgZThoODogJ2U4ZzgnXG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2bSwgcHV6emxlKSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKHZtLm1vZGUgPT09ICd2aWV3JykgcmV0dXJuO1xuICAgIGlmICghcGF0aE9wcy5jb250YWlucyh2bS5wYXRoLCB2bS5pbml0aWFsUGF0aCkpIHJldHVybjtcblxuICAgIHZhciBwbGF5ZWRCeUNvbG9yID0gdm0ubm9kZS5wbHkgJSAyID09PSAxID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgaWYgKHBsYXllZEJ5Q29sb3IgIT09IHB1enpsZS5jb2xvcikgcmV0dXJuO1xuXG4gICAgdmFyIG5vZGVzID0gdm0ubm9kZUxpc3Quc2xpY2UocGF0aE9wcy5zaXplKHZtLmluaXRpYWxQYXRoKSArIDEpLm1hcChmdW5jdGlvbihub2RlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1Y2k6IG5vZGUudWNpLFxuICAgICAgICBjYXN0bGU6IG5vZGUuc2FuLnN0YXJ0c1dpdGgoJ08tTycpXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgdmFyIHByb2dyZXNzID0gcHV6emxlLmxpbmVzO1xuICAgIGZvciAodmFyIGkgaW4gbm9kZXMpIHtcbiAgICAgIGlmIChwcm9ncmVzc1tub2Rlc1tpXS51Y2ldKSBwcm9ncmVzcyA9IHByb2dyZXNzW25vZGVzW2ldLnVjaV07XG4gICAgICBlbHNlIGlmIChub2Rlc1tpXS5jYXN0bGUpIHByb2dyZXNzID0gcHJvZ3Jlc3NbYWx0Q2FzdGxlc1tub2Rlc1tpXS51Y2ldXSB8fCAnZmFpbCc7XG4gICAgICBlbHNlIHByb2dyZXNzID0gJ2ZhaWwnO1xuICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyA9PT0gJ3N0cmluZycpIGJyZWFrO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb2dyZXNzID09PSAnc3RyaW5nJykge1xuICAgICAgdm0ubm9kZS5wdXp6bGUgPSBwcm9ncmVzcztcbiAgICAgIHJldHVybiBwcm9ncmVzcztcbiAgICB9XG5cbiAgICB2YXIgbmV4dEtleSA9IE9iamVjdC5rZXlzKHByb2dyZXNzKVswXVxuICAgICAgaWYgKHByb2dyZXNzW25leHRLZXldID09PSAnd2luJykge1xuICAgICAgICB2bS5ub2RlLnB1enpsZSA9ICd3aW4nO1xuICAgICAgICByZXR1cm4gJ3dpbic7XG4gICAgICB9XG5cbiAgICAgIC8vIGZyb20gaGVyZSB3ZSBoYXZlIGEgbmV4dCBtb3ZlXG5cbiAgICAgIHZtLm5vZGUucHV6emxlID0gJ2dvb2QnO1xuXG4gICAgdmFyIG9wcG9uZW50VWNpID0gZGVjb21wb3NlVWNpKG5leHRLZXkpO1xuICAgIHZhciBwcm9tb3Rpb24gPSBvcHBvbmVudFVjaVsyXSA/IHNhblRvUm9sZVtvcHBvbmVudFVjaVsyXS50b1VwcGVyQ2FzZSgpXSA6IG51bGw7XG5cbiAgICB2YXIgbW92ZTogYW55ID0ge1xuICAgICAgb3JpZzogb3Bwb25lbnRVY2lbMF0sXG4gICAgICBkZXN0OiBvcHBvbmVudFVjaVsxXSxcbiAgICAgIGZlbjogdm0ubm9kZS5mZW4sXG4gICAgICBwYXRoOiB2bS5wYXRoXG4gICAgfTtcbiAgICBpZiAocHJvbW90aW9uKSBtb3ZlLnByb21vdGlvbiA9IHByb21vdGlvbjtcblxuICAgIHJldHVybiBtb3ZlO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgYmluZCwgb25JbnNlcnQgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0ICogYXMgY2dVdGlsIGZyb20gJ2NoZXNzZ3JvdW5kL3V0aWwnO1xuaW1wb3J0IHsgVm0gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2bTogVm0sIGdldEdyb3VuZCwgcmVkcmF3OiAoKSA9PiB2b2lkKSB7XG5cbiAgbGV0IHByb21vdGluZzogYW55ID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gc3RhcnQob3JpZywgZGVzdCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBnID0gZ2V0R3JvdW5kKCksXG4gICAgcGllY2UgPSBnLnN0YXRlLnBpZWNlc1tkZXN0XTtcbiAgICBpZiAocGllY2UgJiYgcGllY2Uucm9sZSA9PSAncGF3bicgJiYgKFxuICAgICAgKGRlc3RbMV0gPT0gOCAmJiBnLnN0YXRlLnR1cm5Db2xvciA9PSAnYmxhY2snKSB8fFxuICAgICAgICAoZGVzdFsxXSA9PSAxICYmIGcuc3RhdGUudHVybkNvbG9yID09ICd3aGl0ZScpKSkge1xuICAgICAgcHJvbW90aW5nID0ge1xuICAgICAgICBvcmlnOiBvcmlnLFxuICAgICAgICBkZXN0OiBkZXN0LFxuICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgICAgIH07XG4gICAgICByZWRyYXcoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHByb21vdGUoZywga2V5LCByb2xlKSB7XG4gICAgdmFyIHBpZWNlcyA9IHt9O1xuICAgIHZhciBwaWVjZSA9IGcuc3RhdGUucGllY2VzW2tleV07XG4gICAgaWYgKHBpZWNlICYmIHBpZWNlLnJvbGUgPT0gJ3Bhd24nKSB7XG4gICAgICBwaWVjZXNba2V5XSA9IHtcbiAgICAgICAgY29sb3I6IHBpZWNlLmNvbG9yLFxuICAgICAgICByb2xlOiByb2xlLFxuICAgICAgICBwcm9tb3RlZDogdHJ1ZVxuICAgICAgfTtcbiAgICAgIGcuc2V0UGllY2VzKHBpZWNlcyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmluaXNoKHJvbGUpIHtcbiAgICBpZiAocHJvbW90aW5nKSBwcm9tb3RlKGdldEdyb3VuZCgpLCBwcm9tb3RpbmcuZGVzdCwgcm9sZSk7XG4gICAgaWYgKHByb21vdGluZy5jYWxsYmFjaykgcHJvbW90aW5nLmNhbGxiYWNrKHByb21vdGluZy5vcmlnLCBwcm9tb3RpbmcuZGVzdCwgcm9sZSk7XG4gICAgcHJvbW90aW5nID0gZmFsc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmIChwcm9tb3RpbmcpIHtcbiAgICAgIHByb21vdGluZyA9IGZhbHNlO1xuICAgICAgZ2V0R3JvdW5kKCkuc2V0KHZtLmNnQ29uZmlnKTtcbiAgICAgIHJlZHJhdygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlclByb21vdGlvbihkZXN0LCBwaWVjZXMsIGNvbG9yLCBvcmllbnRhdGlvbikge1xuICAgIGlmICghcHJvbW90aW5nKSByZXR1cm47XG5cbiAgICBsZXQgbGVmdCA9ICg4IC0gY2dVdGlsLmtleTJwb3MoZGVzdClbMF0pICogMTIuNTtcbiAgICBpZiAob3JpZW50YXRpb24gPT09ICd3aGl0ZScpIGxlZnQgPSA4Ny41IC0gbGVmdDtcblxuICAgIGNvbnN0IHZlcnRpY2FsID0gY29sb3IgPT09IG9yaWVudGF0aW9uID8gJ3RvcCcgOiAnYm90dG9tJztcblxuICAgIHJldHVybiBoKCdkaXYjcHJvbW90aW9uLWNob2ljZS4nICsgdmVydGljYWwsIHtcbiAgICAgIGhvb2s6IG9uSW5zZXJ0KGVsID0+IHtcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbmNlbCk7XG4gICAgICAgICAgZWwub25jb250ZXh0bWVudSA9ICgpID0+IGZhbHNlO1xuICAgICAgfSlcbiAgICB9LCBwaWVjZXMubWFwKGZ1bmN0aW9uKHNlcnZlclJvbGUsIGkpIHtcbiAgICAgIGNvbnN0IHRvcCA9IChjb2xvciA9PT0gb3JpZW50YXRpb24gPyBpIDogNyAtIGkpICogMTIuNTtcbiAgICAgIHJldHVybiBoKCdzcXVhcmUnLCB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgc3R5bGU6ICd0b3A6ICcgKyB0b3AgKyAnJTtsZWZ0OiAnICsgbGVmdCArICclJ1xuICAgICAgICB9LFxuICAgICAgICBob29rOiBiaW5kKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgZmluaXNoKHNlcnZlclJvbGUpO1xuICAgICAgICB9KVxuICAgICAgfSwgW2goJ3BpZWNlLicgKyBzZXJ2ZXJSb2xlICsgJy4nICsgY29sb3IpXSk7XG4gICAgfSkpO1xuICB9O1xuXG4gIHJldHVybiB7XG5cbiAgICBzdGFydCxcblxuICAgIGNhbmNlbCxcblxuICAgIHZpZXcoKSB7XG4gICAgICBpZiAoIXByb21vdGluZykgcmV0dXJuO1xuICAgICAgY29uc3QgcGllY2VzID0gWydxdWVlbicsICdrbmlnaHQnLCAncm9vaycsICdiaXNob3AnXTtcbiAgICAgIHJldHVybiByZW5kZXJQcm9tb3Rpb24ocHJvbW90aW5nLmRlc3QsIHBpZWNlcyxcbiAgICAgICAgY2dVdGlsLm9wcG9zaXRlKGdldEdyb3VuZCgpLnN0YXRlLnR1cm5Db2xvciksXG4gICAgICAgIGdldEdyb3VuZCgpLnN0YXRlLm9yaWVudGF0aW9uKTtcbiAgICB9XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRzKSB7XG5cbiAgdmFyIGFuYU1vdmVUaW1lb3V0O1xuICB2YXIgYW5hRGVzdHNUaW1lb3V0O1xuXG4gIHZhciBhbmFEZXN0c0NhY2hlID0ge307XG5cbiAgdmFyIGhhbmRsZXJzID0ge1xuICAgIG5vZGU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNsZWFyVGltZW91dChhbmFNb3ZlVGltZW91dCk7XG4gICAgICBvcHRzLmFkZE5vZGUoZGF0YS5ub2RlLCBkYXRhLnBhdGgpO1xuICAgIH0sXG4gICAgc3RlcEZhaWx1cmU6IGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGFuYU1vdmVUaW1lb3V0KTtcbiAgICAgIG9wdHMucmVzZXQoKTtcbiAgICB9LFxuICAgIGRlc3RzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBhbmFEZXN0c0NhY2hlW2RhdGEucGF0aF0gPSBkYXRhO1xuICAgICAgb3B0cy5hZGREZXN0cyhkYXRhLmRlc3RzLCBkYXRhLnBhdGgsIGRhdGEub3BlbmluZyk7XG4gICAgICBjbGVhclRpbWVvdXQoYW5hRGVzdHNUaW1lb3V0KTtcbiAgICB9LFxuICAgIGRlc3RzRmFpbHVyZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICBjbGVhclRpbWVvdXQoYW5hRGVzdHNUaW1lb3V0KTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHNlbmRBbmFNb3ZlID0gZnVuY3Rpb24ocmVxKSB7XG4gICAgY2xlYXJUaW1lb3V0KGFuYU1vdmVUaW1lb3V0KTtcbiAgICBvcHRzLnNlbmQoJ2FuYU1vdmUnLCByZXEpO1xuICAgIGFuYU1vdmVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHNlbmRBbmFNb3ZlKHJlcSk7XG4gICAgfSwgMzAwMCk7XG4gIH07XG5cbiAgdmFyIHNlbmRBbmFEZXN0cyA9IGZ1bmN0aW9uKHJlcSkge1xuICAgIGNsZWFyVGltZW91dChhbmFEZXN0c1RpbWVvdXQpO1xuICAgIGlmIChhbmFEZXN0c0NhY2hlW3JlcS5wYXRoXSkgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGhhbmRsZXJzLmRlc3RzKGFuYURlc3RzQ2FjaGVbcmVxLnBhdGhdKTtcbiAgICB9LCAxMCk7XG4gICAgZWxzZSB7XG4gICAgICBvcHRzLnNlbmQoJ2FuYURlc3RzJywgcmVxKTtcbiAgICAgIGFuYURlc3RzVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbmRBbmFEZXN0cyhyZXEpO1xuICAgICAgfSwgMzAwMCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgc2VuZDogb3B0cy5zZW5kLFxuICAgIHJlY2VpdmU6IGZ1bmN0aW9uKHR5cGUsIGRhdGEpIHtcbiAgICAgIGlmIChoYW5kbGVyc1t0eXBlXSkge1xuICAgICAgICBoYW5kbGVyc1t0eXBlXShkYXRhKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHNlbmRBbmFNb3ZlOiBzZW5kQW5hTW92ZSxcblxuICAgIHNlbmRBbmFEZXN0czogc2VuZEFuYURlc3RzXG4gIH07XG59XG4iLCJpbXBvcnQgeyBvcHMgYXMgdHJlZU9wcyB9IGZyb20gJ3RyZWUnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbml0aWFsTm9kZTogVHJlZS5Ob2RlLCBzb2x1dGlvbiwgY29sb3I6IENvbG9yKSB7XG5cbiAgdHJlZU9wcy51cGRhdGVBbGwoc29sdXRpb24sIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAoKGNvbG9yID09PSAnd2hpdGUnKSA9PT0gKG5vZGUucGx5ICUgMiA9PT0gMSkpIG5vZGUucHV6emxlID0gJ2dvb2QnO1xuICB9KTtcblxuICBjb25zdCBzb2x1dGlvbk5vZGUgPSB0cmVlT3BzLmNoaWxkQnlJZChpbml0aWFsTm9kZSwgc29sdXRpb24uaWQpO1xuXG4gIGlmIChzb2x1dGlvbk5vZGUpIHRyZWVPcHMubWVyZ2Uoc29sdXRpb25Ob2RlLCBzb2x1dGlvbik7XG4gIGVsc2UgaW5pdGlhbE5vZGUuY2hpbGRyZW4ucHVzaChzb2x1dGlvbik7XG59O1xuIiwiaW1wb3J0IHRocm90dGxlIGZyb20gJ2NvbW1vbi90aHJvdHRsZSc7XG5cbmNvbnN0IHNvdW5kcyA9IHdpbmRvdy5saWNoZXNzLnNvdW5kO1xuXG5leHBvcnQgY29uc3Qgc291bmQgPSB7XG4gIG1vdmU6IHRocm90dGxlKDUwLCBzb3VuZHMubW92ZSksXG4gIGNhcHR1cmU6IHRocm90dGxlKDUwLCBzb3VuZHMuY2FwdHVyZSksXG4gIGNoZWNrOiB0aHJvdHRsZSg1MCwgc291bmRzLmNoZWNrKVxufTtcbiIsImV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgd2luZG93LmxpY2hlc3MucHVic3ViLm9uKCdzcGVlY2guZW5hYmxlZCcsIG9uU3BlZWNoQ2hhbmdlKTtcbiAgb25TcGVlY2hDaGFuZ2Uod2luZG93LmxpY2hlc3Muc291bmQuc3BlZWNoKCkpO1xufVxuXG5mdW5jdGlvbiBvblNwZWVjaENoYW5nZShlbmFibGVkOiBib29sZWFuKSB7XG4gIGlmICghd2luZG93LkxpY2hlc3NTcGVlY2ggJiYgZW5hYmxlZClcbiAgICB3aW5kb3cubGljaGVzcy5sb2FkU2NyaXB0KHdpbmRvdy5saWNoZXNzLmNvbXBpbGVkU2NyaXB0KCdzcGVlY2gnKSk7XG4gIGVsc2UgaWYgKHdpbmRvdy5MaWNoZXNzU3BlZWNoICYmICFlbmFibGVkKSB3aW5kb3cuTGljaGVzc1NwZWVjaCA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vZGUobjogVHJlZS5Ob2RlLCBjdXQ6IGJvb2xlYW4pIHtcbiAgd2l0aFNwZWVjaChzID0+IHMuc3RlcChuLCBjdXQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MoKSB7XG4gIHdpdGhTcGVlY2gocyA9PiBzLnNheShcIlN1Y2Nlc3MhXCIsIGZhbHNlKSk7XG59XG5cbmZ1bmN0aW9uIHdpdGhTcGVlY2goZjogKHNwZWVjaDogTGljaGVzc1NwZWVjaCkgPT4gdm9pZCkge1xuICBpZiAod2luZG93LkxpY2hlc3NTcGVlY2gpIGYod2luZG93LkxpY2hlc3NTcGVlY2gpO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgSG9va3MgfSBmcm9tICdzbmFiYmRvbS9ob29rcydcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRNb2JpbGVNb3VzZWRvd24oZWw6IEhUTUxFbGVtZW50LCBmOiAoZTogRXZlbnQpID0+IGFueSwgcmVkcmF3PzogKCkgPT4gdm9pZCkge1xuICBmb3IgKGNvbnN0IG1vdXNlZG93bkV2ZW50IG9mIFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXSkge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIobW91c2Vkb3duRXZlbnQsIGUgPT4ge1xuICAgICAgZihlKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChyZWRyYXcpIHJlZHJhdygpO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kKGV2ZW50TmFtZTogc3RyaW5nLCBmOiAoZTogRXZlbnQpID0+IGFueSwgcmVkcmF3PzogKCkgPT4gdm9pZCk6IEhvb2tzIHtcbiAgcmV0dXJuIG9uSW5zZXJ0KGVsID0+XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGUgPT4ge1xuICAgICAgY29uc3QgcmVzID0gZihlKTtcbiAgICAgIGlmIChyZWRyYXcpIHJlZHJhdygpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9KVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb25JbnNlcnQ8QSBleHRlbmRzIEhUTUxFbGVtZW50PihmOiAoZWxlbWVudDogQSkgPT4gdm9pZCk6IEhvb2tzIHtcbiAgcmV0dXJuIHtcbiAgICBpbnNlcnQ6IHZub2RlID0+IGYodm5vZGUuZWxtIGFzIEEpXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRhSWNvbihpY29uOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHtcbiAgICAnZGF0YS1pY29uJzogaWNvblxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3Bpbm5lcigpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zcGlubmVyJywgW1xuICAgIGgoJ3N2ZycsIHsgYXR0cnM6IHsgdmlld0JveDogJzAgMCA0MCA0MCcgfSB9LCBbXG4gICAgICBoKCdjaXJjbGUnLCB7XG4gICAgICAgIGF0dHJzOiB7IGN4OiAyMCwgY3k6IDIwLCByOiAxOCwgZmlsbDogJ25vbmUnIH1cbiAgICAgIH0pXSldKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSc7XG5pbXBvcnQgeyBiaW5kLCBkYXRhSWNvbiB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgQ29udHJvbGxlciwgTWF5YmVWTm9kZSB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5mdW5jdGlvbiByZW5kZXJWb3RlKGN0cmw6IENvbnRyb2xsZXIpOiBNYXliZVZOb2RlIHtcbiAgdmFyIGRhdGEgPSBjdHJsLmdldERhdGEoKTtcbiAgaWYgKCFkYXRhLnB1enpsZS5lbmFibGVkKSByZXR1cm47XG4gIHJldHVybiBoKCdkaXYudm90ZScsIFtcbiAgICBoKCdhJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdTJyxcbiAgICAgICAgdGl0bGU6IGN0cmwudHJhbnMubm9hcmcoJ3RoaXNQdXp6bGVJc0NvcnJlY3QnKVxuICAgICAgfSxcbiAgICAgIGNsYXNzOiB7IGFjdGl2ZTogY3RybC52bS52b3RlZCA9PT0gdHJ1ZSB9LFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnZvdGUodHJ1ZSkpXG4gICAgfSksXG4gICAgaCgnc3Bhbi5jb3VudCcsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIHRpdGxlOiAnUG9wdWxhcml0eSdcbiAgICAgIH1cbiAgICB9LCAnJyArIE1hdGgubWF4KDAsIGRhdGEucHV6emxlLnZvdGUpKSxcbiAgICBoKCdhJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdSJyxcbiAgICAgICAgdGl0bGU6IGN0cmwudHJhbnMubm9hcmcoJ3RoaXNQdXp6bGVJc1dyb25nJylcbiAgICAgIH0sXG4gICAgICBjbGFzczogeyBhY3RpdmU6IGN0cmwudm0udm90ZWQgPT09IGZhbHNlIH0sXG4gICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwudm90ZShmYWxzZSkpXG4gICAgfSlcbiAgXSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IENvbnRyb2xsZXIpOiBNYXliZVZOb2RlIHtcbiAgY29uc3QgZGF0YSA9IGN0cmwuZ2V0RGF0YSgpO1xuICBjb25zdCB2b3RlQ2FsbCA9ICEhZGF0YS51c2VyICYmIGN0cmwuY2FsbFRvVm90ZSgpICYmIGRhdGEucHV6emxlLmVuYWJsZWQgJiYgZGF0YS52b3RlZCA9PT0gdW5kZWZpbmVkO1xuICByZXR1cm4gaCgnZGl2LnB1enpsZV9fZmVlZGJhY2suYWZ0ZXInICsgKHZvdGVDYWxsID8gJy5jYWxsJyA6ICcnKSwgW1xuICAgIHZvdGVDYWxsID8gaCgnZGl2LnZvdGVfY2FsbCcsIFtcbiAgICAgIGgoJ3N0cm9uZycsIGN0cmwudHJhbnMoJ3dhc1RoaXNQdXp6bGVBbnlHb29kJykpLFxuICAgICAgaCgnYnInKSxcbiAgICAgIGgoJ3NwYW4nLCBjdHJsLnRyYW5zKCdwbGVhc2VWb3RlUHV6emxlJykpXG4gICAgXSkgOiAoY3RybC50aGFua3MoKSA/IGgoJ2Rpdi52b3RlX2NhbGwnLFxuICAgICAgaCgnc3Ryb25nJywgY3RybC50cmFucygndGhhbmtZb3UnKSlcbiAgICApIDogbnVsbCksXG4gICAgaCgnZGl2LmhhbGYuaGFsZi10b3AnLCBbXG4gICAgICBjdHJsLnZtLmxhc3RGZWVkYmFjayA9PT0gJ3dpbicgPyBoKCdkaXYuY29tcGxldGUuZmVlZGJhY2sud2luJywgaCgnZGl2LnBsYXllcicsIFtcbiAgICAgICAgaCgnZGl2Lmljb24nLCAn4pyTJyksXG4gICAgICAgIGgoJ2Rpdi5pbnN0cnVjdGlvbicsIGN0cmwudHJhbnMubm9hcmcoJ3N1Y2Nlc3MnKSlcbiAgICAgIF0pKSA6IGgoJ2Rpdi5jb21wbGV0ZScsICdQdXp6bGUgY29tcGxldGUhJyksXG4gICAgICBkYXRhLnVzZXIgPyByZW5kZXJWb3RlKGN0cmwpIDogbnVsbFxuICAgIF0pLFxuICAgIGgoJ2EuaGFsZi5jb250aW51ZScsIHtcbiAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgY3RybC5uZXh0UHV6emxlKVxuICAgIH0sIFtcbiAgICAgIGgoJ2knLCB7IGF0dHJzOiBkYXRhSWNvbignRycpIH0pLFxuICAgICAgY3RybC50cmFucy5ub2FyZygnY29udGludWVUcmFpbmluZycpXG4gICAgXSlcbiAgXSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJztcbmltcG9ydCB7IENoZXNzZ3JvdW5kIH0gZnJvbSAnY2hlc3Nncm91bmQnO1xuaW1wb3J0IHsgQ29uZmlnIGFzIENnQ29uZmlnIH0gZnJvbSAnY2hlc3Nncm91bmQvY29uZmlnJztcbmltcG9ydCByZXNpemVIYW5kbGUgZnJvbSAnY29tbW9uL3Jlc2l6ZSc7XG5pbXBvcnQgeyBDb250cm9sbGVyIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYuY2ctd3JhcCcsIHtcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQ6IHZub2RlID0+IGN0cmwuZ3JvdW5kKENoZXNzZ3JvdW5kKCh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLCBtYWtlQ29uZmlnKGN0cmwpKSksXG4gICAgICBkZXN0cm95OiBfID0+IGN0cmwuZ3JvdW5kKCkuZGVzdHJveSgpXG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gbWFrZUNvbmZpZyhjdHJsOiBDb250cm9sbGVyKTogQ2dDb25maWcge1xuICBjb25zdCBvcHRzID0gY3RybC5tYWtlQ2dPcHRzKCk7XG4gIHJldHVybiB7XG4gICAgZmVuOiBvcHRzLmZlbixcbiAgICBvcmllbnRhdGlvbjogb3B0cy5vcmllbnRhdGlvbixcbiAgICB0dXJuQ29sb3I6IG9wdHMudHVybkNvbG9yLFxuICAgIGNoZWNrOiBvcHRzLmNoZWNrLFxuICAgIGxhc3RNb3ZlOiBvcHRzLmxhc3RNb3ZlLFxuICAgIGNvb3JkaW5hdGVzOiBjdHJsLnByZWYuY29vcmRzICE9PSAwLFxuICAgIGFkZFBpZWNlWkluZGV4OiBjdHJsLnByZWYuaXMzZCxcbiAgICBtb3ZhYmxlOiB7XG4gICAgICBmcmVlOiBmYWxzZSxcbiAgICAgIGNvbG9yOiBvcHRzLm1vdmFibGUuY29sb3IsXG4gICAgICBkZXN0czogb3B0cy5tb3ZhYmxlLmRlc3RzLFxuICAgICAgc2hvd0Rlc3RzOiBjdHJsLnByZWYuZGVzdGluYXRpb24sXG4gICAgICByb29rQ2FzdGxlOiBjdHJsLnByZWYucm9va0Nhc3RsZVxuICAgIH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiBjdHJsLnByZWYubW92ZUV2ZW50ID4gMCxcbiAgICAgIHNob3dHaG9zdDogY3RybC5wcmVmLmhpZ2hsaWdodFxuICAgIH0sXG4gICAgc2VsZWN0YWJsZToge1xuICAgICAgZW5hYmxlZDogY3RybC5wcmVmLm1vdmVFdmVudCAhPT0gMVxuICAgIH0sXG4gICAgZXZlbnRzOiB7XG4gICAgICBtb3ZlOiBjdHJsLnVzZXJNb3ZlLFxuICAgICAgaW5zZXJ0KGVsZW1lbnRzKSB7XG4gICAgICAgIHJlc2l6ZUhhbmRsZShcbiAgICAgICAgICBlbGVtZW50cyxcbiAgICAgICAgICBjdHJsLnByZWYucmVzaXplSGFuZGxlLFxuICAgICAgICAgIGN0cmwudm0ubm9kZS5wbHksXG4gICAgICAgICAgKF8pID0+IHRydWVcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJlbW92YWJsZToge1xuICAgICAgZW5hYmxlZDogb3B0cy5wcmVtb3ZhYmxlLmVuYWJsZWRcbiAgICB9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlXG4gICAgfSxcbiAgICBoaWdobGlnaHQ6IHtcbiAgICAgIGxhc3RNb3ZlOiBjdHJsLnByZWYuaGlnaGxpZ2h0LFxuICAgICAgY2hlY2s6IGN0cmwucHJlZi5oaWdobGlnaHRcbiAgICB9LFxuICAgIGFuaW1hdGlvbjoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGR1cmF0aW9uOiBjdHJsLnByZWYuYW5pbWF0aW9uLmR1cmF0aW9uXG4gICAgfSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IHRydWVcbiAgfTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnO1xuaW1wb3J0IGFmdGVyVmlldyBmcm9tICcuL2FmdGVyJztcbmltcG9ydCB7IGJpbmQsIHNwaW5uZXIgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IENvbnRyb2xsZXIsIE1heWJlVk5vZGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuZnVuY3Rpb24gdmlld1NvbHV0aW9uKGN0cmw6IENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYudmlld19zb2x1dGlvbicsIHtcbiAgICBjbGFzczogeyBzaG93OiBjdHJsLnZtLmNhblZpZXdTb2x1dGlvbiB9XG4gIH0sIFtcbiAgICBoKCdhLmJ1dHRvbi5idXR0b24tZW1wdHknLCB7XG4gICAgICBob29rOiBiaW5kKCdjbGljaycsIGN0cmwudmlld1NvbHV0aW9uKVxuICAgIH0sIGN0cmwudHJhbnMubm9hcmcoJ3ZpZXdUaGVTb2x1dGlvbicpKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gaW5pdGlhbChjdHJsOiBDb250cm9sbGVyKTogVk5vZGUge1xuICB2YXIgcHV6emxlQ29sb3IgPSBjdHJsLmdldERhdGEoKS5wdXp6bGUuY29sb3I7XG4gIHJldHVybiBoKCdkaXYucHV6emxlX19mZWVkYmFjay5wbGF5JywgW1xuICAgIGgoJ2Rpdi5wbGF5ZXInLCBbXG4gICAgICBoKCdkaXYubm8tc3F1YXJlJywgaCgncGllY2Uua2luZy4nICsgcHV6emxlQ29sb3IpKSxcbiAgICAgIGgoJ2Rpdi5pbnN0cnVjdGlvbicsIFtcbiAgICAgICAgaCgnc3Ryb25nJywgY3RybC50cmFucy5ub2FyZygneW91clR1cm4nKSksXG4gICAgICAgIGgoJ2VtJywgY3RybC50cmFucy5ub2FyZyhwdXp6bGVDb2xvciA9PT0gJ3doaXRlJyA/ICdmaW5kVGhlQmVzdE1vdmVGb3JXaGl0ZScgOiAnZmluZFRoZUJlc3RNb3ZlRm9yQmxhY2snKSlcbiAgICAgIF0pXG4gICAgXSksXG4gICAgdmlld1NvbHV0aW9uKGN0cmwpXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBnb29kKGN0cmw6IENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYucHV6emxlX19mZWVkYmFjay5nb29kJywgW1xuICAgIGgoJ2Rpdi5wbGF5ZXInLCBbXG4gICAgICBoKCdkaXYuaWNvbicsICfinJMnKSxcbiAgICAgIGgoJ2Rpdi5pbnN0cnVjdGlvbicsIFtcbiAgICAgICAgaCgnc3Ryb25nJywgY3RybC50cmFucy5ub2FyZygnYmVzdE1vdmUnKSksXG4gICAgICAgIGgoJ2VtJywgY3RybC50cmFucy5ub2FyZygna2VlcEdvaW5nJykpXG4gICAgICBdKVxuICAgIF0pLFxuICAgIHZpZXdTb2x1dGlvbihjdHJsKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gcmV0cnkoY3RybDogQ29udHJvbGxlcik6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5wdXp6bGVfX2ZlZWRiYWNrLnJldHJ5JywgW1xuICAgIGgoJ2Rpdi5wbGF5ZXInLCBbXG4gICAgICBoKCdkaXYuaWNvbicsICchJyksXG4gICAgICBoKCdkaXYuaW5zdHJ1Y3Rpb24nLCBbXG4gICAgICAgIGgoJ3N0cm9uZycsIGN0cmwudHJhbnMubm9hcmcoJ2dvb2RNb3ZlJykpLFxuICAgICAgICBoKCdlbScsIGN0cmwudHJhbnMubm9hcmcoJ2J1dFlvdUNhbkRvQmV0dGVyJykpXG4gICAgICBdKVxuICAgIF0pLFxuICAgIHZpZXdTb2x1dGlvbihjdHJsKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gZmFpbChjdHJsOiBDb250cm9sbGVyKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2LnB1enpsZV9fZmVlZGJhY2suZmFpbCcsIFtcbiAgICBoKCdkaXYucGxheWVyJywgW1xuICAgICAgaCgnZGl2Lmljb24nLCAn4pyXJyksXG4gICAgICBoKCdkaXYuaW5zdHJ1Y3Rpb24nLCBbXG4gICAgICAgIGgoJ3N0cm9uZycsIGN0cmwudHJhbnMubm9hcmcoJ3B1enpsZUZhaWxlZCcpKSxcbiAgICAgICAgaCgnZW0nLCBjdHJsLnRyYW5zLm5vYXJnKCdidXRZb3VDYW5LZWVwVHJ5aW5nJykpXG4gICAgICBdKVxuICAgIF0pLFxuICAgIHZpZXdTb2x1dGlvbihjdHJsKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gbG9hZGluZygpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYucHV6emxlX19mZWVkYmFjay5sb2FkaW5nJywgc3Bpbm5lcigpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY3RybDogQ29udHJvbGxlcik6IE1heWJlVk5vZGUge1xuICBpZiAoY3RybC52bS5sb2FkaW5nKSByZXR1cm4gbG9hZGluZygpO1xuICBpZiAoY3RybC52bS5tb2RlID09PSAndmlldycpIHJldHVybiBhZnRlclZpZXcoY3RybCk7XG4gIGlmIChjdHJsLnZtLmxhc3RGZWVkYmFjayA9PT0gJ2luaXQnKSByZXR1cm4gaW5pdGlhbChjdHJsKTtcbiAgaWYgKGN0cmwudm0ubGFzdEZlZWRiYWNrID09PSAnZ29vZCcpIHJldHVybiBnb29kKGN0cmwpO1xuICBpZiAoY3RybC52bS5sYXN0RmVlZGJhY2sgPT09ICdyZXRyeScpIHJldHVybiByZXRyeShjdHJsKTtcbiAgaWYgKGN0cmwudm0ubGFzdEZlZWRiYWNrID09PSAnZmFpbCcpIHJldHVybiBmYWlsKGN0cmwpO1xufVxuIiwiaW1wb3J0ICogYXMgZ3JpZEhhY2tzIGZyb20gJ2NvbW1vbi9ncmlkSGFja3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuXG4gIGlmICghZ3JpZEhhY2tzLm5lZWRzQm9hcmRIZWlnaHRGaXgoKSkgcmV0dXJuO1xuXG4gIGNvbnN0IHJ1bkhhY2tzID0gKCkgPT4gZ3JpZEhhY2tzLmZpeE1haW5Cb2FyZEhlaWdodChjb250YWluZXIpO1xuXG4gIGdyaWRIYWNrcy5ydW5uZXIocnVuSGFja3MpO1xuXG4gIGdyaWRIYWNrcy5iaW5kQ2hlc3Nncm91bmRSZXNpemVPbmNlKHJ1bkhhY2tzKTtcbn1cbiIsImltcG9ydCB7IGgsIHRodW5rIH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5cbmltcG9ydCB7IENvbnRyb2xsZXIsIE1heWJlVk5vZGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuY29uc3QgaGlzdG9yeVNpemUgPSAxNTtcblxuZnVuY3Rpb24gcmVuZGVyKGN0cmw6IENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIGNvbnN0IGRhdGEgPSBjdHJsLmdldERhdGEoKTtcbiAgY29uc3Qgc2xvdHM6IGFueVtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGlzdG9yeVNpemU7IGkrKykgc2xvdHNbaV0gPSBkYXRhLnVzZXIucmVjZW50W2ldIHx8IG51bGw7XG4gIHJldHVybiBoKCdkaXYucHV6emxlX19oaXN0b3J5Jywgc2xvdHMubWFwKGZ1bmN0aW9uKHMpIHtcbiAgICBpZiAocykgcmV0dXJuIGgoJ2EnLCB7XG4gICAgICBjbGFzczoge1xuICAgICAgICBjdXJyZW50OiBkYXRhLnB1enpsZS5pZCA9PT0gc1swXSxcbiAgICAgICAgd2luOiBzWzFdID49IDAsXG4gICAgICAgIGxvc3M6IHNbMV0gPCAwXG4gICAgICB9LFxuICAgICAgYXR0cnM6IHsgaHJlZjogJy90cmFpbmluZy8nICsgc1swXSB9XG4gICAgfSwgc1sxXSA+IDAgPyAnKycgKyBzWzFdIDogJ+KIkicgKyAoLXNbMV0pKTtcbiAgfSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBDb250cm9sbGVyKTogTWF5YmVWTm9kZSB7XG4gIGlmICghY3RybC5nZXREYXRhKCkudXNlcikgcmV0dXJuO1xuICByZXR1cm4gdGh1bmsoJ2Rpdi5wdXp6bGVfX2hpc3RvcnknLCByZW5kZXIsIFtjdHJsLCBjdHJsLnJlY2VudEhhc2goKV0pO1xufTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgY2hlc3Nncm91bmQgZnJvbSAnLi9jaGVzc2dyb3VuZCc7XG5pbXBvcnQgeyByZW5kZXIgYXMgdHJlZVZpZXcgfSBmcm9tICcuL3RyZWUnO1xuaW1wb3J0IHsgdmlldyBhcyBjZXZhbFZpZXcgfSBmcm9tICdjZXZhbCc7XG5pbXBvcnQgKiBhcyBjb250cm9sIGZyb20gJy4uL2NvbnRyb2wnO1xuaW1wb3J0IGZlZWRiYWNrVmlldyBmcm9tICcuL2ZlZWRiYWNrJztcbmltcG9ydCBoaXN0b3J5VmlldyBmcm9tICcuL2hpc3RvcnknO1xuaW1wb3J0ICogYXMgc2lkZSBmcm9tICcuL3NpZGUnO1xuaW1wb3J0ICogYXMgZ3JpZEhhY2tzIGZyb20gJy4vZ3JpZEhhY2tzJztcbmltcG9ydCB7IG9uSW5zZXJ0LCBiaW5kLCBiaW5kTW9iaWxlTW91c2Vkb3duIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBDb250cm9sbGVyLCBNYXliZVZOb2RlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbmZ1bmN0aW9uIHJlbmRlck9wZW5pbmdCb3goY3RybDogQ29udHJvbGxlcik6IE1heWJlVk5vZGUge1xuICB2YXIgb3BlbmluZyA9IGN0cmwuZ2V0VHJlZSgpLmdldE9wZW5pbmcoY3RybC52bS5ub2RlTGlzdCk7XG4gIGlmIChvcGVuaW5nKSByZXR1cm4gaCgnZGl2Lm9wZW5pbmdfYm94Jywge1xuICAgIGF0dHJzOiB7IHRpdGxlOiBvcGVuaW5nLmVjbyArICcgJyArIG9wZW5pbmcubmFtZSB9XG4gIH0sIFtcbiAgICBoKCdzdHJvbmcnLCBvcGVuaW5nLmVjbyksXG4gICAgJyAnICsgb3BlbmluZy5uYW1lXG4gIF0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBbmFseXNlKGN0cmw6IENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYucHV6emxlX19tb3Zlcy5hcmVwbGF5JywgW1xuICAgIHJlbmRlck9wZW5pbmdCb3goY3RybCksXG4gICAgdHJlZVZpZXcoY3RybClcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIHdoZWVsKGN0cmw6IENvbnRyb2xsZXIsIGU6IFdoZWVsRXZlbnQpIHtcbiAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG4gIGlmICh0YXJnZXQudGFnTmFtZSAhPT0gJ1BJRUNFJyAmJiB0YXJnZXQudGFnTmFtZSAhPT0gJ1NRVUFSRScgJiYgdGFyZ2V0LnRhZ05hbWUgIT09ICdDRy1CT0FSRCcpIHJldHVybjtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBpZiAoZS5kZWx0YVkgPiAwKSBjb250cm9sLm5leHQoY3RybCk7XG4gIGVsc2UgaWYgKGUuZGVsdGFZIDwgMCkgY29udHJvbC5wcmV2KGN0cmwpO1xuICBjdHJsLnJlZHJhdygpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGRhdGFBY3QoZSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYWN0JykgfHwgZS50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYWN0Jyk7XG59XG5cbmZ1bmN0aW9uIGp1bXBCdXR0b24oaWNvbjogc3RyaW5nLCBlZmZlY3Q6IHN0cmluZyk6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2J1dHRvbi5mYnQnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgICdkYXRhLWFjdCc6IGVmZmVjdCxcbiAgICAgICdkYXRhLWljb24nOiBpY29uXG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gY29udHJvbHMoY3RybDogQ29udHJvbGxlcik6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5wdXp6bGVfX2NvbnRyb2xzLmFuYWx5c2UtY29udHJvbHMnLCB7XG4gICAgaG9vazogb25JbnNlcnQoZWwgPT4ge1xuICAgICAgYmluZE1vYmlsZU1vdXNlZG93bihlbCwgZSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGRhdGFBY3QoZSk7XG4gICAgICAgIGlmIChhY3Rpb24gPT09ICdwcmV2JykgY29udHJvbC5wcmV2KGN0cmwpO1xuICAgICAgICBlbHNlIGlmIChhY3Rpb24gPT09ICduZXh0JykgY29udHJvbC5uZXh0KGN0cmwpO1xuICAgICAgICBlbHNlIGlmIChhY3Rpb24gPT09ICdmaXJzdCcpIGNvbnRyb2wuZmlyc3QoY3RybCk7XG4gICAgICAgIGVsc2UgaWYgKGFjdGlvbiA9PT0gJ2xhc3QnKSBjb250cm9sLmxhc3QoY3RybCk7XG4gICAgICB9LCBjdHJsLnJlZHJhdyk7XG4gICAgfSlcbiAgfSwgW1xuICAgIGgoJ2Rpdi5qdW1wcycsIFtcbiAgICAgIGp1bXBCdXR0b24oJ1cnLCAnZmlyc3QnKSxcbiAgICAgIGp1bXBCdXR0b24oJ1knLCAncHJldicpLFxuICAgICAganVtcEJ1dHRvbignWCcsICduZXh0JyksXG4gICAgICBqdW1wQnV0dG9uKCdWJywgJ2xhc3QnKVxuICAgIF0pXG4gIF0pO1xufVxuXG5sZXQgY2V2YWxTaG93biA9IGZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBDb250cm9sbGVyKTogVk5vZGUge1xuICBjb25zdCBzaG93Q2V2YWwgPSBjdHJsLnZtLnNob3dDb21wdXRlcigpLFxuICAgIGdhdWdlT24gPSBjdHJsLnNob3dFdmFsR2F1Z2UoKTtcbiAgaWYgKGNldmFsU2hvd24gIT09IHNob3dDZXZhbCkge1xuICAgIGlmICghY2V2YWxTaG93bikgY3RybC52bS5hdXRvU2Nyb2xsTm93ID0gdHJ1ZTtcbiAgICBjZXZhbFNob3duID0gc2hvd0NldmFsO1xuICB9XG4gIHJldHVybiBoKCdtYWluLnB1enpsZScsIHtcbiAgICBjbGFzczogeydnYXVnZS1vbic6IGdhdWdlT259LFxuICAgIGhvb2s6IHtcbiAgICAgIHBvc3RwYXRjaChvbGQsIHZub2RlKSB7XG4gICAgICAgIGdyaWRIYWNrcy5zdGFydCh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpXG4gICAgICAgIGlmIChvbGQuZGF0YSEuZ2F1Z2VPbiAhPT0gZ2F1Z2VPbikge1xuICAgICAgICAgIGlmIChjdHJsLnByZWYuY29vcmRzID09IDIpXG4gICAgICAgICAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ2Nvb3Jkcy1pbicsIGdhdWdlT24pLnRvZ2dsZUNsYXNzKCdjb29yZHMtb3V0JywgIWdhdWdlT24pO1xuICAgICAgICAgIHdpbmRvdy5saWNoZXNzLmRpc3BhdGNoRXZlbnQoZG9jdW1lbnQuYm9keSwgJ2NoZXNzZ3JvdW5kLnJlc2l6ZScpO1xuICAgICAgICB9XG4gICAgICAgIHZub2RlLmRhdGEhLmdhdWdlT24gPSBnYXVnZU9uO1xuICAgICAgfVxuICAgIH1cbiAgfSwgW1xuICAgIGgoJ2FzaWRlLnB1enpsZV9fc2lkZScsIFtcbiAgICAgIHNpZGUucHV6emxlQm94KGN0cmwpLFxuICAgICAgc2lkZS51c2VyQm94KGN0cmwpXG4gICAgXSksXG4gICAgaCgnZGl2LnB1enpsZV9fYm9hcmQubWFpbi1ib2FyZCcgKyAoY3RybC5wcmVmLmJsaW5kZm9sZCA/ICcuYmxpbmRmb2xkJyA6ICcnKSwge1xuICAgICAgaG9vazogd2luZG93LmxpY2hlc3MuaGFzVG91Y2hFdmVudHMgPyB1bmRlZmluZWQgOiBiaW5kKCd3aGVlbCcsIGUgPT4gd2hlZWwoY3RybCwgZSBhcyBXaGVlbEV2ZW50KSlcbiAgICB9LCBbXG4gICAgICBjaGVzc2dyb3VuZChjdHJsKSxcbiAgICAgIGN0cmwucHJvbW90aW9uLnZpZXcoKVxuICAgIF0pLFxuICAgIGNldmFsVmlldy5yZW5kZXJHYXVnZShjdHJsKSxcbiAgICBoKCdkaXYucHV6emxlX190b29scycsIFtcbiAgICAgIC8vIHdlIG5lZWQgdGhlIHdyYXBwaW5nIGRpdiBoZXJlXG4gICAgICAvLyBzbyB0aGUgc2libGluZ3MgYXJlIG9ubHkgdXBkYXRlZCB3aGVuIGNldmFsIGlzIGFkZGVkXG4gICAgICBoKCdkaXYuY2V2YWwtd3JhcCcsIHtcbiAgICAgICAgY2xhc3M6IHsgbm9uZTogIXNob3dDZXZhbCB9XG4gICAgICB9LCBzaG93Q2V2YWwgPyBbXG4gICAgICAgIGNldmFsVmlldy5yZW5kZXJDZXZhbChjdHJsKSxcbiAgICAgICAgY2V2YWxWaWV3LnJlbmRlclB2cyhjdHJsKVxuICAgICAgXSA6IFtdKSxcbiAgICAgIHJlbmRlckFuYWx5c2UoY3RybCksXG4gICAgICBmZWVkYmFja1ZpZXcoY3RybClcbiAgICBdKSxcbiAgICBjb250cm9scyhjdHJsKSxcbiAgICBoaXN0b3J5VmlldyhjdHJsKVxuICBdKTtcbn1cbiIsImltcG9ydCB7IGgsIHRodW5rIH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5pbXBvcnQgeyBkYXRhSWNvbiB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgQ29udHJvbGxlciwgTWF5YmVWTm9kZSB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcHV6emxlQm94KGN0cmw6IENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIHZhciBkYXRhID0gY3RybC5nZXREYXRhKCk7XG4gIHJldHVybiBoKCdkaXYucHV6emxlX19zaWRlX19tZXRhcycsIFtcbiAgICBwdXp6bGVJbmZvcyhjdHJsLCBkYXRhLnB1enpsZSksXG4gICAgZ2FtZUluZm9zKGN0cmwsIGRhdGEuZ2FtZSwgZGF0YS5wdXp6bGUpXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBwdXp6bGVJbmZvcyhjdHJsOiBDb250cm9sbGVyLCBwdXp6bGUpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYuaW5mb3MucHV6emxlJywge1xuICAgIGF0dHJzOiBkYXRhSWNvbignLScpXG4gIH0sIFtoKCdkaXYnLCBbXG4gICAgaCgnYS50aXRsZScsIHtcbiAgICAgIGF0dHJzOiB7IGhyZWY6ICcvdHJhaW5pbmcvJyArIHB1enpsZS5pZCB9XG4gICAgfSwgY3RybC50cmFucygncHV6emxlSWQnLCBwdXp6bGUuaWQpKSxcbiAgICBoKCdwJywgY3RybC50cmFucy52ZG9tKCdyYXRpbmdYJywgY3RybC52bS5tb2RlID09PSAncGxheScgPyBoKCdzcGFuLmhpZGRlbicsIGN0cmwudHJhbnMubm9hcmcoJ2hpZGRlbicpKSA6IGgoJ3N0cm9uZycsIHB1enpsZS5yYXRpbmcpKSksXG4gICAgaCgncCcsIGN0cmwudHJhbnMudmRvbSgncGxheWVkWFRpbWVzJywgaCgnc3Ryb25nJywgd2luZG93LmxpY2hlc3MubnVtYmVyRm9ybWF0KHB1enpsZS5hdHRlbXB0cykpKSlcbiAgXSldKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUluZm9zKGN0cmw6IENvbnRyb2xsZXIsIGdhbWUsIHB1enpsZSk6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5pbmZvcycsIHtcbiAgICBhdHRyczogZGF0YUljb24oZ2FtZS5wZXJmLmljb24pXG4gIH0sIFtoKCdkaXYnLCBbXG4gICAgaCgncCcsIGN0cmwudHJhbnMudmRvbSgnZnJvbUdhbWVMaW5rJywgaCgnYScsIHtcbiAgICAgIGF0dHJzOiB7IGhyZWY6IGAvJHtnYW1lLmlkfS8ke3B1enpsZS5jb2xvcn0jJHtwdXp6bGUuaW5pdGlhbFBseX1gIH1cbiAgICB9LCAnIycgKyBnYW1lLmlkKSkpLFxuICAgIGgoJ3AnLCBbXG4gICAgICBnYW1lLmNsb2NrLCAnIOKAoiAnLFxuICAgICAgZ2FtZS5wZXJmLm5hbWUsICcg4oCiICcsXG4gICAgICBjdHJsLnRyYW5zLm5vYXJnKGdhbWUucmF0ZWQgPyAncmF0ZWQnIDogJ2Nhc3VhbCcpXG4gICAgXSksXG4gICAgaCgnZGl2LnBsYXllcnMnLCBnYW1lLnBsYXllcnMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgIHJldHVybiBoKCdkaXYucGxheWVyLmNvbG9yLWljb24uaXMudGV4dC4nICsgcC5jb2xvcixcbiAgICAgICAgcC51c2VySWQgPyBoKCdhLnVzZXItbGluay51bHB0Jywge1xuICAgICAgICAgIGF0dHJzOiB7IGhyZWY6ICcvQC8nICsgcC51c2VySWQgfVxuICAgICAgICB9LCBwLm5hbWUpIDogcC5uYW1lXG4gICAgICApO1xuICAgIH0pKVxuICBdKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlckJveChjdHJsOiBDb250cm9sbGVyKTogTWF5YmVWTm9kZSB7XG4gIGNvbnN0IGRhdGEgPSBjdHJsLmdldERhdGEoKTtcbiAgaWYgKCFkYXRhLnVzZXIpIHJldHVybjtcbiAgY29uc3QgZGlmZiA9IGN0cmwudm0ucm91bmQgJiYgY3RybC52bS5yb3VuZC5yYXRpbmdEaWZmO1xuICBjb25zdCBoYXNoID0gY3RybC5yZWNlbnRIYXNoKCk7XG4gIHJldHVybiBoKCdkaXYucHV6emxlX19zaWRlX191c2VyJywgW1xuICAgIGgoJ2gyJywgY3RybC50cmFucy52ZG9tKCd5b3VyUHV6emxlUmF0aW5nWCcsIGgoJ3N0cm9uZycsIFtcbiAgICAgIGRhdGEudXNlci5yYXRpbmcsXG4gICAgICAuLi4oZGlmZiA+IDAgPyBbJyAnLCBoKCdnb29kLnJwJywgJysnICsgZGlmZildIDogW10pLFxuICAgICAgLi4uKGRpZmYgPCAwID8gWycgJywgaCgnYmFkLnJwJywgJ+KIkicgKyAoLWRpZmYpKV0gOiBbXSlcbiAgICBdKSkpLFxuICAgIGgoJ2RpdicsIHRodW5rKCdkaXYucmF0aW5nX2NoYXJ0LicgKyBoYXNoLCByYXRpbmdDaGFydCwgW2N0cmwsIGhhc2hdKSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIHJhdGluZ0NoYXJ0KGN0cmw6IENvbnRyb2xsZXIsIGhhc2g6IHN0cmluZyk6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5yYXRpbmdfY2hhcnQuJyArIGhhc2gsIHtcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQodm5vZGUpIHsgZHJhd1JhdGluZ0NoYXJ0KGN0cmwsIHZub2RlKSB9LFxuICAgICAgcG9zdHBhdGNoKF8sIHZub2RlKSB7IGRyYXdSYXRpbmdDaGFydChjdHJsLCB2bm9kZSkgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdSYXRpbmdDaGFydChjdHJsOiBDb250cm9sbGVyLCB2bm9kZTogVk5vZGUpOiB2b2lkIHtcbiAgY29uc3QgJGVsID0gJCh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpO1xuICBjb25zdCBkYXJrID0gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhcmsnKTtcbiAgY29uc3QgcG9pbnRzID0gY3RybC5nZXREYXRhKCkudXNlci5yZWNlbnQubWFwKGZ1bmN0aW9uKHIpIHtcbiAgICByZXR1cm4gclsyXSArIHJbMV07XG4gIH0pO1xuICBjb25zdCByZWRyYXcgPSAoKSA9PiAkZWxbJ3NwYXJrbGluZSddKHBvaW50cywge1xuICAgIHR5cGU6ICdsaW5lJyxcbiAgICB3aWR0aDogTWF0aC5yb3VuZCgkZWwub3V0ZXJXaWR0aCgpKSArICdweCcsXG4gICAgaGVpZ2h0OiAnODBweCcsXG4gICAgbGluZUNvbG9yOiBkYXJrID8gJyM0NDQ0ZmYnIDogJyMwMDAwZmYnLFxuICAgIGZpbGxDb2xvcjogZGFyayA/ICcjMjIyMjU1JyA6ICcjY2NjY2ZmJyxcbiAgICBudW1iZXJGb3JtYXR0ZXI6ICh4OiBudW1iZXIpID0+IHsgcmV0dXJuIHg7IH1cbiAgfSk7XG4gIHdpbmRvdy5saWNoZXNzLnJhZihyZWRyYXcpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVkcmF3KTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBkZWZpbmVkIH0gZnJvbSAnY29tbW9uJztcbmltcG9ydCB0aHJvdHRsZSBmcm9tICdjb21tb24vdGhyb3R0bGUnO1xuaW1wb3J0IHsgcmVuZGVyRXZhbCBhcyBub3JtYWxpemVFdmFsIH0gZnJvbSAnY2hlc3MnO1xuaW1wb3J0IHsgcGF0aCBhcyB0cmVlUGF0aCB9IGZyb20gJ3RyZWUnO1xuaW1wb3J0IHsgQ29udHJvbGxlciwgTWF5YmVWTm9kZSwgTWF5YmVWTm9kZXMgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuY29uc3QgYXV0b1Njcm9sbCA9IHRocm90dGxlKDE1MCwgKGN0cmwsIGVsKSA9PiB7XG4gIHZhciBjb250ID0gZWwucGFyZW50Tm9kZTtcbiAgdmFyIHRhcmdldCA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5hY3RpdmUnKTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICBjb250LnNjcm9sbFRvcCA9IGN0cmwudm0ucGF0aCA9PT0gdHJlZVBhdGgucm9vdCA/IDAgOiA5OTk5OTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udC5zY3JvbGxUb3AgPSB0YXJnZXQub2Zmc2V0VG9wIC0gY29udC5vZmZzZXRIZWlnaHQgLyAyICsgdGFyZ2V0Lm9mZnNldEhlaWdodDtcbn0pO1xuXG5mdW5jdGlvbiBwYXRoQ29udGFpbnMoY3R4LCBwYXRoOiBUcmVlLlBhdGgpIHtcbiAgcmV0dXJuIHRyZWVQYXRoLmNvbnRhaW5zKGN0eC5jdHJsLnZtLnBhdGgsIHBhdGgpO1xufVxuXG5mdW5jdGlvbiBwbHlUb1R1cm4ocGx5OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5mbG9vcigocGx5IC0gMSkgLyAyKSArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJJbmRleChwbHksIHdpdGhEb3RzKTogVk5vZGUge1xuICByZXR1cm4gaCgnaW5kZXgnLCBwbHlUb1R1cm4ocGx5KSArICh3aXRoRG90cyA/IChwbHkgJSAyID09PSAxID8gJy4nIDogJy4uLicpIDogJycpKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2hpbGRyZW5PZihjdHgsIG5vZGUsIG9wdHMpOiBNYXliZVZOb2RlcyB7XG4gIGNvbnN0IGNzID0gbm9kZS5jaGlsZHJlbiwgbWFpbiA9IGNzWzBdO1xuICBpZiAoIW1haW4pIHJldHVybiBbXTtcbiAgaWYgKG9wdHMuaXNNYWlubGluZSkge1xuICAgIGNvbnN0IGlzV2hpdGUgPSBtYWluLnBseSAlIDIgPT09IDE7XG4gICAgaWYgKCFjc1sxXSkgcmV0dXJuIFtcbiAgICAgIGlzV2hpdGUgPyByZW5kZXJJbmRleChtYWluLnBseSwgZmFsc2UpIDogbnVsbCxcbiAgICAgIC4uLnJlbmRlck1vdmVBbmRDaGlsZHJlbk9mKGN0eCwgbWFpbiwge1xuICAgICAgICBwYXJlbnRQYXRoOiBvcHRzLnBhcmVudFBhdGgsXG4gICAgICAgIGlzTWFpbmxpbmU6IHRydWVcbiAgICAgIH0pXG4gICAgXTtcbiAgICBjb25zdCBtYWluQ2hpbGRyZW4gPSByZW5kZXJDaGlsZHJlbk9mKGN0eCwgbWFpbiwge1xuICAgICAgcGFyZW50UGF0aDogb3B0cy5wYXJlbnRQYXRoICsgbWFpbi5pZCxcbiAgICAgIGlzTWFpbmxpbmU6IHRydWVcbiAgICB9KSxcbiAgICBwYXNzT3B0cyA9IHtcbiAgICAgIHBhcmVudFBhdGg6IG9wdHMucGFyZW50UGF0aCxcbiAgICAgIGlzTWFpbmxpbmU6IHRydWVcbiAgICB9O1xuICAgIHJldHVybiBbXG4gICAgICBpc1doaXRlID8gcmVuZGVySW5kZXgobWFpbi5wbHksIGZhbHNlKSA6IG51bGwsXG4gICAgICByZW5kZXJNb3ZlT2YoY3R4LCBtYWluLCBwYXNzT3B0cyksXG4gICAgICBpc1doaXRlID8gZW1wdHlNb3ZlKCkgOiBudWxsLFxuICAgICAgaCgnaW50ZXJydXB0JywgcmVuZGVyTGluZXMoY3R4LCBjcy5zbGljZSgxKSwge1xuICAgICAgICBwYXJlbnRQYXRoOiBvcHRzLnBhcmVudFBhdGgsXG4gICAgICAgIGlzTWFpbmxpbmU6IHRydWVcbiAgICAgIH0pKSxcbiAgICAgIC4uLihpc1doaXRlICYmIG1haW5DaGlsZHJlbiA/IFtcbiAgICAgICAgcmVuZGVySW5kZXgobWFpbi5wbHksIGZhbHNlKSxcbiAgICAgICAgZW1wdHlNb3ZlKClcbiAgICAgIF0gOiBbXSksXG4gICAgICAuLi5tYWluQ2hpbGRyZW5cbiAgICBdO1xuICB9XG4gIHJldHVybiBjc1sxXSA/IFtyZW5kZXJMaW5lcyhjdHgsIGNzLCBvcHRzKV0gOiByZW5kZXJNb3ZlQW5kQ2hpbGRyZW5PZihjdHgsIG1haW4sIG9wdHMpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJMaW5lcyhjdHgsIG5vZGVzLCBvcHRzKTogVk5vZGUge1xuICByZXR1cm4gaCgnbGluZXMnLCB7XG4gICAgY2xhc3M6IHsgc2luZ2xlOiAhIW5vZGVzWzFdIH1cbiAgfSwgbm9kZXMubWFwKGZ1bmN0aW9uKG4pIHtcbiAgICByZXR1cm4gaCgnbGluZScsIHJlbmRlck1vdmVBbmRDaGlsZHJlbk9mKGN0eCwgbiwge1xuICAgICAgcGFyZW50UGF0aDogb3B0cy5wYXJlbnRQYXRoLFxuICAgICAgaXNNYWlubGluZTogZmFsc2UsXG4gICAgICB3aXRoSW5kZXg6IHRydWVcbiAgICB9KSk7XG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTW92ZU9mKGN0eCwgbm9kZSwgb3B0cyk6IFZOb2RlIHtcbiAgcmV0dXJuIG9wdHMuaXNNYWlubGluZSA/IHJlbmRlck1haW5saW5lTW92ZU9mKGN0eCwgbm9kZSwgb3B0cykgOiByZW5kZXJWYXJpYXRpb25Nb3ZlT2YoY3R4LCBub2RlLCBvcHRzKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFpbmxpbmVNb3ZlT2YoY3R4LCBub2RlLCBvcHRzKTogVk5vZGUge1xuICBjb25zdCBwYXRoID0gb3B0cy5wYXJlbnRQYXRoICsgbm9kZS5pZDtcbiAgY29uc3QgY2xhc3NlczogYW55ID0ge1xuICAgIGFjdGl2ZTogcGF0aCA9PT0gY3R4LmN0cmwudm0ucGF0aCxcbiAgICBjdXJyZW50OiBwYXRoID09PSBjdHguY3RybC52bS5pbml0aWFsUGF0aCxcbiAgICBoaXN0OiBub2RlLnBseSA8IGN0eC5jdHJsLnZtLmluaXRpYWxOb2RlLnBseVxuICB9O1xuICBpZiAobm9kZS5wdXp6bGUpIGNsYXNzZXNbbm9kZS5wdXp6bGVdID0gdHJ1ZTtcbiAgcmV0dXJuIGgoJ21vdmUnLCB7XG4gICAgYXR0cnM6IHsgcDogcGF0aCB9LFxuICAgIGNsYXNzOiBjbGFzc2VzXG4gIH0sIHJlbmRlck1vdmUoY3R4LCBub2RlKSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckdseXBoKGdseXBoKTogVk5vZGUge1xuICByZXR1cm4gaCgnZ2x5cGgnLCB7XG4gICAgYXR0cnM6IHsgdGl0bGU6IGdseXBoLm5hbWUgfVxuICB9LCBnbHlwaC5zeW1ib2wpO1xufVxuXG5mdW5jdGlvbiBwdXp6bGVHbHlwaChjdHgsIG5vZGUpOiBNYXliZVZOb2RlIHtcbiAgc3dpdGNoIChub2RlLnB1enpsZSkge1xuICAgIGNhc2UgJ2dvb2QnOlxuICAgIGNhc2UgJ3dpbic6XG4gICAgICByZXR1cm4gcmVuZGVyR2x5cGgoe1xuICAgICAgICBuYW1lOiBjdHguY3RybC50cmFucy5ub2FyZygnYmVzdE1vdmUnKSxcbiAgICAgICAgc3ltYm9sOiAn4pyTJ1xuICAgICAgfSk7XG4gY2FzZSAnZmFpbCc6XG4gICByZXR1cm4gcmVuZGVyR2x5cGgoe1xuICAgICBuYW1lOiBjdHguY3RybC50cmFucy5ub2FyZygncHV6emxlRmFpbGVkJyksXG4gICAgIHN5bWJvbDogJ+KclydcbiAgIH0pO1xuIGNhc2UgJ3JldHJ5JzpcbiAgIHJldHVybiByZW5kZXJHbHlwaCh7XG4gICAgIG5hbWU6IGN0eC5jdHJsLnRyYW5zLm5vYXJnKCdnb29kTW92ZScpLFxuICAgICBzeW1ib2w6ICc/ISdcbiAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJNb3ZlKGN0eCwgbm9kZSk6IE1heWJlVk5vZGVzIHtcbiAgY29uc3QgZXYgPSBub2RlLmV2YWwgfHwgbm9kZS5jZXZhbCB8fCB7fTtcbiAgcmV0dXJuIFtcbiAgICBub2RlLnNhbixcbiAgICBkZWZpbmVkKGV2LmNwKSA/IHJlbmRlckV2YWwobm9ybWFsaXplRXZhbChldi5jcCkpIDogKFxuICAgICAgZGVmaW5lZChldi5tYXRlKSA/IHJlbmRlckV2YWwoJyMnICsgZXYubWF0ZSkgOiBudWxsXG4gICAgKSxcbiAgICBwdXp6bGVHbHlwaChjdHgsIG5vZGUpXG4gIF07XG59XG5cbmZ1bmN0aW9uIHJlbmRlclZhcmlhdGlvbk1vdmVPZihjdHgsIG5vZGUsIG9wdHMpOiBWTm9kZSB7XG4gIGNvbnN0IHdpdGhJbmRleCA9IG9wdHMud2l0aEluZGV4IHx8IG5vZGUucGx5ICUgMiA9PT0gMTtcbiAgY29uc3QgcGF0aCA9IG9wdHMucGFyZW50UGF0aCArIG5vZGUuaWQ7XG4gIGNvbnN0IGFjdGl2ZSA9IHBhdGggPT09IGN0eC5jdHJsLnZtLnBhdGg7XG4gIGNvbnN0IGNsYXNzZXM6IGFueSA9IHtcbiAgICBhY3RpdmUsXG4gICAgcGFyZW50OiAhYWN0aXZlICYmIHBhdGhDb250YWlucyhjdHgsIHBhdGgpXG4gIH07XG4gIGlmIChub2RlLnB1enpsZSkgY2xhc3Nlc1tub2RlLnB1enpsZV0gPSB0cnVlO1xuICByZXR1cm4gaCgnbW92ZScsIHtcbiAgICBhdHRyczogeyBwOiBwYXRofSxcbiAgICBjbGFzczogY2xhc3Nlc1xuICB9LCBbXG4gICAgd2l0aEluZGV4ID8gcmVuZGVySW5kZXgobm9kZS5wbHksIHRydWUpIDogbnVsbCxcbiAgICBub2RlLnNhbixcbiAgICBwdXp6bGVHbHlwaChjdHgsIG5vZGUpXG4gIF0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJNb3ZlQW5kQ2hpbGRyZW5PZihjdHgsIG5vZGUsIG9wdHMpOiBNYXliZVZOb2RlcyB7XG4gIHJldHVybiBbXG4gICAgcmVuZGVyTW92ZU9mKGN0eCwgbm9kZSwgb3B0cyksXG4gICAgLi4ucmVuZGVyQ2hpbGRyZW5PZihjdHgsIG5vZGUsIHtcbiAgICAgIHBhcmVudFBhdGg6IG9wdHMucGFyZW50UGF0aCArIG5vZGUuaWQsXG4gICAgICBpc01haW5saW5lOiBvcHRzLmlzTWFpbmxpbmVcbiAgICB9KVxuICBdO1xufVxuXG5mdW5jdGlvbiBlbXB0eU1vdmUoKTogVk5vZGUge1xuICByZXR1cm4gaCgnbW92ZS5lbXB0eScsICcuLi4nKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRXZhbChlKTogVk5vZGUge1xuICByZXR1cm4gaCgnZXZhbCcsIGUpO1xufVxuXG5mdW5jdGlvbiBldmVudFBhdGgoZSk6IHN0cmluZyB7XG4gIHJldHVybiBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3AnKSB8fCBlLnRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgncCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKGN0cmw6IENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIGNvbnN0IHJvb3QgPSBjdHJsLmdldFRyZWUoKS5yb290O1xuICBjb25zdCBjdHggPSB7XG4gICAgY3RybDogY3RybCxcbiAgICBzaG93Q29tcHV0ZXI6IGZhbHNlXG4gIH07XG4gIHJldHVybiBoKCdkaXYudHZpZXcyLnR2aWV3Mi1jb2x1bW4nLCB7XG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0OiB2bm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGVsID0gdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBpZiAoY3RybC5wYXRoICE9PSB0cmVlUGF0aC5yb290KSBhdXRvU2Nyb2xsKGN0cmwsIGVsKTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoZGVmaW5lZChlLmJ1dHRvbikgJiYgZS5idXR0b24gIT09IDApIHJldHVybjsgLy8gb25seSB0b3VjaCBvciBsZWZ0IGNsaWNrXG4gICAgICAgICAgY29uc3QgcGF0aCA9IGV2ZW50UGF0aChlKTtcbiAgICAgICAgICBpZiAocGF0aCkgY3RybC51c2VySnVtcChwYXRoKTtcbiAgICAgICAgICBjdHJsLnJlZHJhdygpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBwb3N0cGF0Y2g6IChfLCB2bm9kZSkgPT4ge1xuICAgICAgICBpZiAoY3RybC52bS5hdXRvU2Nyb2xsTm93KSB7XG4gICAgICAgICAgYXV0b1Njcm9sbChjdHJsLCB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgIGN0cmwudm0uYXV0b1Njcm9sbE5vdyA9IGZhbHNlO1xuICAgICAgICAgIGN0cmwuYXV0b1Njcm9sbFJlcXVlc3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN0cmwudm0uYXV0b1Njcm9sbFJlcXVlc3RlZCkge1xuICAgICAgICAgIGlmIChjdHJsLnZtLnBhdGggIT09IHRyZWVQYXRoLnJvb3QpIGF1dG9TY3JvbGwoY3RybCwgdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICBjdHJsLnZtLmF1dG9TY3JvbGxSZXF1ZXN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgW1xuICAgIC4uLihyb290LnBseSAlIDIgPT09IDEgPyBbXG4gICAgICByZW5kZXJJbmRleChyb290LnBseSwgZmFsc2UpLFxuICAgICAgZW1wdHlNb3ZlKClcbiAgICBdIDogW10pLFxuICAgIC4uLnJlbmRlckNoaWxkcmVuT2YoY3R4LCByb290LCB7XG4gICAgICBwYXJlbnRQYXRoOiAnJyxcbiAgICAgIGlzTWFpbmxpbmU6IHRydWVcbiAgICB9KVxuICBdKTtcbn1cbiIsIi8vIGRvIE5PVCBzZXQgbW9iaWxlIEFQSSBoZWFkZXJzIGhlcmVcbi8vIHRoZXkgdHJpZ2dlciBhIGNvbXBhdCBsYXllclxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKHB1enpsZUlkLCB3aW4pIHtcbiAgcmV0dXJuICQuYWpheCh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiAnL3RyYWluaW5nLycgKyBwdXp6bGVJZCArICcvcm91bmQyJyxcbiAgICBkYXRhOiB7XG4gICAgICB3aW46IHdpbiA/IDEgOiAwXG4gICAgfVxuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB2b3RlKHB1enpsZUlkLCB2KSB7XG4gIHJldHVybiAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogJy90cmFpbmluZy8nICsgcHV6emxlSWQgKyAnL3ZvdGUnLFxuICAgIGRhdGE6IHtcbiAgICAgIHZvdGU6IHYgPyAxIDogMFxuICAgIH1cbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gbmV4dFB1enpsZSgpIHtcbiAgcmV0dXJuICQuYWpheCh7XG4gICAgdXJsOiAnL3RyYWluaW5nL25ldydcbiAgfSk7XG59XG4iLCJpbXBvcnQgeyBidWlsZCwgVHJlZVdyYXBwZXIgfSBmcm9tICcuL3RyZWUnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICcuL3BhdGgnO1xuaW1wb3J0ICogYXMgb3BzIGZyb20gJy4vb3BzJztcblxuZXhwb3J0IHsgYnVpbGQsIFRyZWVXcmFwcGVyLCBwYXRoLCBvcHMgfTtcbiIsImV4cG9ydCBmdW5jdGlvbiB3aXRoTWFpbmxpbmVDaGlsZDxUPihub2RlOiBUcmVlLk5vZGUsIGY6IChub2RlOiBUcmVlLk5vZGUpID0+IFQpOiBUIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgbmV4dCA9IG5vZGUuY2hpbGRyZW5bMF07XG4gIHJldHVybiBuZXh0ID8gZihuZXh0KSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbk1haW5saW5lKGZyb21Ob2RlOiBUcmVlLk5vZGUsIHByZWRpY2F0ZTogKG5vZGU6IFRyZWUuTm9kZSkgPT4gYm9vbGVhbik6IFRyZWUuTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGZpbmRGcm9tID0gZnVuY3Rpb24obm9kZTogVHJlZS5Ob2RlKTogVHJlZS5Ob2RlIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAocHJlZGljYXRlKG5vZGUpKSByZXR1cm4gbm9kZTtcbiAgICByZXR1cm4gd2l0aE1haW5saW5lQ2hpbGQobm9kZSwgZmluZEZyb20pO1xuICB9O1xuICByZXR1cm4gZmluZEZyb20oZnJvbU5vZGUpO1xufVxuXG4vLyByZXR1cm5zIGEgbGlzdCBvZiBub2RlcyBjb2xsZWN0ZWQgZnJvbSB0aGUgb3JpZ2luYWwgb25lXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdChmcm9tOiBUcmVlLk5vZGUsIHBpY2tDaGlsZDogKG5vZGU6IFRyZWUuTm9kZSkgPT4gVHJlZS5Ob2RlIHwgdW5kZWZpbmVkKTogVHJlZS5Ob2RlW10ge1xuICBsZXQgbm9kZXMgPSBbZnJvbV0sIG4gPSBmcm9tLCBjO1xuICB3aGlsZShjID0gcGlja0NoaWxkKG4pKSB7XG4gICAgbm9kZXMucHVzaChjKTtcbiAgICBuID0gYztcbiAgfVxuICByZXR1cm4gbm9kZXM7XG59XG5cbmZ1bmN0aW9uIHBpY2tGaXJzdENoaWxkKG5vZGU6IFRyZWUuTm9kZSk6IFRyZWUuTm9kZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBub2RlLmNoaWxkcmVuWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRCeUlkKG5vZGU6IFRyZWUuTm9kZSwgaWQ6IHN0cmluZyk6IFRyZWUuTm9kZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBub2RlLmNoaWxkcmVuLmZpbmQoY2hpbGQgPT4gY2hpbGQuaWQgPT09IGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxhc3Qobm9kZUxpc3Q6IFRyZWUuTm9kZVtdKTogVHJlZS5Ob2RlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG5vZGVMaXN0W25vZGVMaXN0Lmxlbmd0aCAtIDFdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9kZUF0UGx5KG5vZGVMaXN0OiBUcmVlLk5vZGVbXSwgcGx5OiBudW1iZXIpOiBUcmVlLk5vZGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gbm9kZUxpc3QuZmluZChub2RlID0+IG5vZGUucGx5ID09PSBwbHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFrZVBhdGhXaGlsZShub2RlTGlzdDogVHJlZS5Ob2RlW10sIHByZWRpY2F0ZTogKG5vZGU6IFRyZWUuTm9kZSkgPT4gYm9vbGVhbik6IFRyZWUuUGF0aCB7XG4gIGxldCBwYXRoID0gJyc7XG4gIGZvciAobGV0IGkgaW4gbm9kZUxpc3QpIHtcbiAgICBpZiAocHJlZGljYXRlKG5vZGVMaXN0W2ldKSkgcGF0aCArPSBub2RlTGlzdFtpXS5pZDtcbiAgICBlbHNlIGJyZWFrO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQ2hpbGQocGFyZW50OiBUcmVlLk5vZGUsIGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgcGFyZW50LmNoaWxkcmVuID0gcGFyZW50LmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbihuKSB7XG4gICAgcmV0dXJuIG4uaWQgIT09IGlkO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvdW50Q2hpbGRyZW5BbmRDb21tZW50cyhub2RlOiBUcmVlLk5vZGUpIHtcbiAgY29uc3QgY291bnQgPSB7XG4gICAgbm9kZXM6IDEsXG4gICAgY29tbWVudHM6IChub2RlLmNvbW1lbnRzIHx8IFtdKS5sZW5ndGhcbiAgfTtcbiAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgY29uc3QgYyA9IGNvdW50Q2hpbGRyZW5BbmRDb21tZW50cyhjaGlsZCk7XG4gICAgY291bnQubm9kZXMgKz0gYy5ub2RlcztcbiAgICBjb3VudC5jb21tZW50cyArPSBjLmNvbW1lbnRzO1xuICB9KTtcbiAgcmV0dXJuIGNvdW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVjb25zdHJ1Y3QocGFydHM6IGFueSk6IFRyZWUuTm9kZSB7XG4gIGNvbnN0IHJvb3QgPSBwYXJ0c1swXSwgbmIgPSBwYXJ0cy5sZW5ndGg7XG4gIGxldCBub2RlID0gcm9vdCwgaTogbnVtYmVyO1xuICByb290LmlkID0gJyc7XG4gIGZvciAoaSA9IDE7IGkgPCBuYjsgaSsrKSB7XG4gICAgY29uc3QgbiA9IHBhcnRzW2ldO1xuICAgIGlmIChub2RlLmNoaWxkcmVuKSBub2RlLmNoaWxkcmVuLnVuc2hpZnQobik7XG4gICAgZWxzZSBub2RlLmNoaWxkcmVuID0gW25dO1xuICAgIG5vZGUgPSBuO1xuICB9XG4gIG5vZGUuY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuIHx8IFtdO1xuICByZXR1cm4gcm9vdDtcbn1cblxuLy8gYWRkcyBuMiBpbnRvIG4xXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2UobjE6IFRyZWUuTm9kZSwgbjI6IFRyZWUuTm9kZSk6IHZvaWQge1xuICBuMS5ldmFsID0gbjIuZXZhbDtcbiAgaWYgKG4yLmdseXBocykgbjEuZ2x5cGhzID0gbjIuZ2x5cGhzO1xuICBuMi5jb21tZW50cyAmJiBuMi5jb21tZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGMpIHtcbiAgICBpZiAoIW4xLmNvbW1lbnRzKSBuMS5jb21tZW50cyA9IFtjXTtcbiAgICBlbHNlIGlmICghbjEuY29tbWVudHMuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLnRleHQgPT09IGMudGV4dDtcbiAgICB9KS5sZW5ndGgpIG4xLmNvbW1lbnRzLnB1c2goYyk7XG4gIH0pO1xuICBuMi5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpIHtcbiAgICBjb25zdCBleGlzdGluZyA9IGNoaWxkQnlJZChuMSwgYy5pZCk7XG4gICAgaWYgKGV4aXN0aW5nKSBtZXJnZShleGlzdGluZywgYyk7XG4gICAgZWxzZSBuMS5jaGlsZHJlbi5wdXNoKGMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0JyYW5jaGluZyhub2RlOiBUcmVlLk5vZGUsIG1heERlcHRoOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1heERlcHRoIDw9IDAgfHwgISFub2RlLmNoaWxkcmVuWzFdIHx8IChcbiAgICBub2RlLmNoaWxkcmVuWzBdICYmIGhhc0JyYW5jaGluZyhub2RlLmNoaWxkcmVuWzBdLCBtYXhEZXB0aCAtIDEpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWlubGluZU5vZGVMaXN0KGZyb206IFRyZWUuTm9kZSk6IFRyZWUuTm9kZVtdIHtcbiAgcmV0dXJuIGNvbGxlY3QoZnJvbSwgcGlja0ZpcnN0Q2hpbGQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQWxsKHJvb3Q6IFRyZWUuTm9kZSwgZjogKG5vZGU6IFRyZWUuTm9kZSkgPT4gdm9pZCk6IHZvaWQge1xuICAvLyBhcHBsaWVzIGYgcmVjdXJzaXZlbHkgdG8gYWxsIG5vZGVzXG4gIGZ1bmN0aW9uIHVwZGF0ZShub2RlOiBUcmVlLk5vZGUpIHtcbiAgICBmKG5vZGUpO1xuICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCh1cGRhdGUpO1xuICB9O1xuICB1cGRhdGUocm9vdCk7XG59XG4iLCJleHBvcnQgY29uc3Qgcm9vdDogVHJlZS5QYXRoID0gJyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzaXplKHBhdGg6IFRyZWUuUGF0aCk6IG51bWJlciB7XG4gIHJldHVybiBwYXRoLmxlbmd0aCAvIDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZWFkKHBhdGg6IFRyZWUuUGF0aCk6IFRyZWUuUGF0aCB7XG4gIHJldHVybiBwYXRoLnNsaWNlKDAsIDIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFpbChwYXRoOiBUcmVlLlBhdGgpOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aC5zbGljZSgyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQocGF0aDogVHJlZS5QYXRoKTogVHJlZS5QYXRoIHtcbiAgcmV0dXJuIHBhdGguc2xpY2UoMCwgLTIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdChwYXRoOiBUcmVlLlBhdGgpOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aC5zbGljZSgtMik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWlucyhwMTogVHJlZS5QYXRoLCBwMjogVHJlZS5QYXRoKTogYm9vbGVhbiB7XG4gIHJldHVybiBwMS5zdGFydHNXaXRoKHAyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Ob2RlTGlzdChub2RlczogVHJlZS5Ob2RlW10pOiBUcmVlLlBhdGgge1xuICB2YXIgcGF0aCA9ICcnO1xuICBmb3IgKHZhciBpIGluIG5vZGVzKSBwYXRoICs9IG5vZGVzW2ldLmlkO1xuICByZXR1cm4gcGF0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ2hpbGRPZihjaGlsZDogVHJlZS5QYXRoLCBwYXJlbnQ6IFRyZWUuUGF0aCk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFjaGlsZCAmJiBjaGlsZC5zbGljZSgwLCAtMikgPT09IHBhcmVudDtcbn1cbiIsImltcG9ydCAqIGFzIHRyZWVQYXRoIGZyb20gJy4vcGF0aCc7XG5pbXBvcnQgKiBhcyBvcHMgZnJvbSAnLi9vcHMnO1xuaW1wb3J0IHsgZGVmaW5lZCB9IGZyb20gJ2NvbW1vbic7XG5cbmV4cG9ydCB0eXBlIE1heWJlTm9kZSA9IFRyZWUuTm9kZSB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGludGVyZmFjZSBUcmVlV3JhcHBlciB7XG4gIHJvb3Q6IFRyZWUuTm9kZTtcbiAgbGFzdFBseSgpOiBudW1iZXI7XG4gIG5vZGVBdFBhdGgocGF0aDogVHJlZS5QYXRoKTogVHJlZS5Ob2RlO1xuICBnZXROb2RlTGlzdChwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLk5vZGVbXTtcbiAgbG9uZ2VzdFZhbGlkUGF0aChwYXRoOiBzdHJpbmcpOiBUcmVlLlBhdGg7XG4gIGdldE9wZW5pbmcobm9kZUxpc3Q6IFRyZWUuTm9kZVtdKTogVHJlZS5PcGVuaW5nIHwgdW5kZWZpbmVkO1xuICB1cGRhdGVBdChwYXRoOiBUcmVlLlBhdGgsIHVwZGF0ZTogKG5vZGU6IFRyZWUuTm9kZSkgPT4gdm9pZCk6IE1heWJlTm9kZTtcbiAgYWRkTm9kZShub2RlOiBUcmVlLk5vZGUsIHBhdGg6IFRyZWUuUGF0aCk6IFRyZWUuUGF0aCB8IHVuZGVmaW5lZDtcbiAgYWRkTm9kZXMobm9kZXM6IFRyZWUuTm9kZVtdLCBwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLlBhdGggfCB1bmRlZmluZWQ7XG4gIGFkZERlc3RzKGRlc3RzOiBzdHJpbmcsIHBhdGg6IFRyZWUuUGF0aCwgb3BlbmluZz86IFRyZWUuT3BlbmluZyk6IE1heWJlTm9kZTtcbiAgc2V0U2hhcGVzKHNoYXBlczogVHJlZS5TaGFwZVtdLCBwYXRoOiBUcmVlLlBhdGgpOiBNYXliZU5vZGU7XG4gIHNldENvbW1lbnRBdChjb21tZW50OiBUcmVlLkNvbW1lbnQsIHBhdGg6IFRyZWUuUGF0aCk6IE1heWJlTm9kZTtcbiAgZGVsZXRlQ29tbWVudEF0KGlkOiBzdHJpbmcsIHBhdGg6IFRyZWUuUGF0aCk6IE1heWJlTm9kZTtcbiAgc2V0R2x5cGhzQXQoZ2x5cGhzOiBUcmVlLkdseXBoW10sIHBhdGg6IFRyZWUuUGF0aCk6IE1heWJlTm9kZTtcbiAgc2V0Q2xvY2tBdChjbG9jazogVHJlZS5DbG9jayB8IHVuZGVmaW5lZCwgcGF0aDogVHJlZS5QYXRoKTogTWF5YmVOb2RlO1xuICBwYXRoSXNNYWlubGluZShwYXRoOiBUcmVlLlBhdGgpOiBib29sZWFuO1xuICBwYXRoSXNGb3JjZWRWYXJpYXRpb24ocGF0aDogVHJlZS5QYXRoKTogYm9vbGVhbjtcbiAgbGFzdE1haW5saW5lTm9kZShwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLk5vZGU7XG4gIHBhdGhFeGlzdHMocGF0aDogVHJlZS5QYXRoKTogYm9vbGVhbjtcbiAgZGVsZXRlTm9kZUF0KHBhdGg6IFRyZWUuUGF0aCk6IHZvaWQ7XG4gIHByb21vdGVBdChwYXRoOiBUcmVlLlBhdGgsIHRvTWFpbmxpbmU6IGJvb2xlYW4pOiB2b2lkO1xuICBmb3JjZVZhcmlhdGlvbkF0KHBhdGg6IFRyZWUuUGF0aCwgZm9yY2U6IGJvb2xlYW4pOiBNYXliZU5vZGU7XG4gIGdldEN1cnJlbnROb2Rlc0FmdGVyUGx5KG5vZGVMaXN0OiBUcmVlLk5vZGVbXSwgbWFpbmxpbmU6IFRyZWUuTm9kZVtdLCBwbHk6IG51bWJlcik6IFRyZWUuTm9kZVtdO1xuICBtZXJnZSh0cmVlOiBUcmVlLk5vZGUpOiB2b2lkO1xuICByZW1vdmVDZXZhbCgpOiB2b2lkO1xuICByZW1vdmVDb21wdXRlclZhcmlhdGlvbnMoKTogdm9pZDtcbiAgcGFyZW50Tm9kZShwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLk5vZGU7XG4gIGdldFBhcmVudENsb2NrKG5vZGU6IFRyZWUuTm9kZSwgcGF0aDogVHJlZS5QYXRoKTogVHJlZS5DbG9jayB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkKHJvb3Q6IFRyZWUuTm9kZSk6IFRyZWVXcmFwcGVyIHtcblxuICBmdW5jdGlvbiBsYXN0Tm9kZSgpOiBUcmVlLk5vZGUge1xuICAgIHJldHVybiBvcHMuZmluZEluTWFpbmxpbmUocm9vdCwgZnVuY3Rpb24obm9kZTogVHJlZS5Ob2RlKSB7XG4gICAgICByZXR1cm4gIW5vZGUuY2hpbGRyZW4ubGVuZ3RoO1xuICAgIH0pITtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vZGVBdFBhdGgocGF0aDogVHJlZS5QYXRoKTogVHJlZS5Ob2RlIHtcbiAgICByZXR1cm4gbm9kZUF0UGF0aEZyb20ocm9vdCwgcGF0aCk7XG4gIH1cblxuICBmdW5jdGlvbiBub2RlQXRQYXRoRnJvbShub2RlOiBUcmVlLk5vZGUsIHBhdGg6IFRyZWUuUGF0aCk6IFRyZWUuTm9kZSB7XG4gICAgaWYgKHBhdGggPT09ICcnKSByZXR1cm4gbm9kZTtcbiAgICBjb25zdCBjaGlsZCA9IG9wcy5jaGlsZEJ5SWQobm9kZSwgdHJlZVBhdGguaGVhZChwYXRoKSk7XG4gICAgcmV0dXJuIGNoaWxkID8gbm9kZUF0UGF0aEZyb20oY2hpbGQsIHRyZWVQYXRoLnRhaWwocGF0aCkpIDogbm9kZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vZGVBdFBhdGhPck51bGwocGF0aDogVHJlZS5QYXRoKTogVHJlZS5Ob2RlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gbm9kZUF0UGF0aE9yTnVsbEZyb20ocm9vdCwgcGF0aCk7XG4gIH1cblxuICBmdW5jdGlvbiBub2RlQXRQYXRoT3JOdWxsRnJvbShub2RlOiBUcmVlLk5vZGUsIHBhdGg6IFRyZWUuUGF0aCk6IFRyZWUuTm9kZSB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHBhdGggPT09ICcnKSByZXR1cm4gbm9kZTtcbiAgICBjb25zdCBjaGlsZCA9IG9wcy5jaGlsZEJ5SWQobm9kZSwgdHJlZVBhdGguaGVhZChwYXRoKSk7XG4gICAgcmV0dXJuIGNoaWxkID8gbm9kZUF0UGF0aE9yTnVsbEZyb20oY2hpbGQsIHRyZWVQYXRoLnRhaWwocGF0aCkpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9uZ2VzdFZhbGlkUGF0aEZyb20obm9kZTogVHJlZS5Ob2RlLCBwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLlBhdGgge1xuICAgIHZhciBpZCA9IHRyZWVQYXRoLmhlYWQocGF0aCk7XG4gICAgY29uc3QgY2hpbGQgPSBvcHMuY2hpbGRCeUlkKG5vZGUsIGlkKTtcbiAgICByZXR1cm4gY2hpbGQgPyBpZCArIGxvbmdlc3RWYWxpZFBhdGhGcm9tKGNoaWxkLCB0cmVlUGF0aC50YWlsKHBhdGgpKSA6ICcnO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q3VycmVudE5vZGVzQWZ0ZXJQbHkobm9kZUxpc3Q6IFRyZWUuTm9kZVtdLCBtYWlubGluZTogVHJlZS5Ob2RlW10sIHBseTogbnVtYmVyKTogVHJlZS5Ob2RlW10ge1xuICAgIHZhciBub2RlLCBub2RlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgaW4gbm9kZUxpc3QpIHtcbiAgICAgIG5vZGUgPSBub2RlTGlzdFtpXTtcbiAgICAgIGlmIChub2RlLnBseSA8PSBwbHkgJiYgbWFpbmxpbmVbaV0uaWQgIT09IG5vZGUuaWQpIGJyZWFrO1xuICAgICAgaWYgKG5vZGUucGx5ID4gcGx5KSBub2Rlcy5wdXNoKG5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH07XG5cbiAgZnVuY3Rpb24gcGF0aElzTWFpbmxpbmUocGF0aDogVHJlZS5QYXRoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHBhdGhJc01haW5saW5lRnJvbShyb290LCBwYXRoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGhFeGlzdHMocGF0aDogVHJlZS5QYXRoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhbm9kZUF0UGF0aE9yTnVsbChwYXRoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGhJc01haW5saW5lRnJvbShub2RlOiBUcmVlLk5vZGUsIHBhdGg6IFRyZWUuUGF0aCk6IGJvb2xlYW4ge1xuICAgIGlmIChwYXRoID09PSAnJykgcmV0dXJuIHRydWU7XG4gICAgY29uc3QgcGF0aElkID0gdHJlZVBhdGguaGVhZChwYXRoKSxcbiAgICBjaGlsZCA9IG5vZGUuY2hpbGRyZW5bMF07XG4gICAgaWYgKCFjaGlsZCB8fCBjaGlsZC5pZCAhPT0gcGF0aElkKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHBhdGhJc01haW5saW5lRnJvbShjaGlsZCwgdHJlZVBhdGgudGFpbChwYXRoKSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXRoSXNGb3JjZWRWYXJpYXRpb24ocGF0aDogVHJlZS5QYXRoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhZ2V0Tm9kZUxpc3QocGF0aCkuZmluZChuID0+IG4uZm9yY2VWYXJpYXRpb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gbGFzdE1haW5saW5lTm9kZUZyb20obm9kZTogVHJlZS5Ob2RlLCBwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLk5vZGUge1xuICAgIGlmIChwYXRoID09PSAnJykgcmV0dXJuIG5vZGU7XG4gICAgY29uc3QgcGF0aElkID0gdHJlZVBhdGguaGVhZChwYXRoKTtcbiAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5bMF07XG4gICAgaWYgKCFjaGlsZCB8fCBjaGlsZC5pZCAhPT0gcGF0aElkKSByZXR1cm4gbm9kZTtcbiAgICByZXR1cm4gbGFzdE1haW5saW5lTm9kZUZyb20oY2hpbGQsIHRyZWVQYXRoLnRhaWwocGF0aCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Tm9kZUxpc3QocGF0aDogVHJlZS5QYXRoKTogVHJlZS5Ob2RlW10ge1xuICAgIHJldHVybiBvcHMuY29sbGVjdChyb290LCBmdW5jdGlvbihub2RlOiBUcmVlLk5vZGUpIHtcbiAgICAgIGNvbnN0IGlkID0gdHJlZVBhdGguaGVhZChwYXRoKTtcbiAgICAgIGlmIChpZCA9PT0gJycpIHJldHVybjtcbiAgICAgIHBhdGggPSB0cmVlUGF0aC50YWlsKHBhdGgpO1xuICAgICAgcmV0dXJuIG9wcy5jaGlsZEJ5SWQobm9kZSwgaWQpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0T3BlbmluZyhub2RlTGlzdDogVHJlZS5Ob2RlW10pOiBUcmVlLk9wZW5pbmcgfCB1bmRlZmluZWQge1xuICAgIHZhciBvcGVuaW5nOiBUcmVlLk9wZW5pbmcgfCB1bmRlZmluZWQ7XG4gICAgbm9kZUxpc3QuZm9yRWFjaChmdW5jdGlvbihub2RlOiBUcmVlLk5vZGUpIHtcbiAgICAgIG9wZW5pbmcgPSBub2RlLm9wZW5pbmcgfHwgb3BlbmluZztcbiAgICB9KTtcbiAgICByZXR1cm4gb3BlbmluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUF0KHBhdGg6IFRyZWUuUGF0aCwgdXBkYXRlOiAobm9kZTogVHJlZS5Ob2RlKSA9PiB2b2lkKTogVHJlZS5Ob2RlIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBub2RlID0gbm9kZUF0UGF0aE9yTnVsbChwYXRoKTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgdXBkYXRlKG5vZGUpO1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHJldHVybnMgbmV3IHBhdGhcbiAgZnVuY3Rpb24gYWRkTm9kZShub2RlOiBUcmVlLk5vZGUsIHBhdGg6IFRyZWUuUGF0aCk6IFRyZWUuUGF0aCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgbmV3UGF0aCA9IHBhdGggKyBub2RlLmlkLFxuICAgIGV4aXN0aW5nID0gbm9kZUF0UGF0aE9yTnVsbChuZXdQYXRoKTtcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIChbJ2Rlc3RzJywgJ2Ryb3BzJywgJ2Nsb2NrJ10gYXMgQXJyYXk8a2V5b2YgVHJlZS5Ob2RlPikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBpZiAoZGVmaW5lZChub2RlW2tleV0pICYmICFkZWZpbmVkKGV4aXN0aW5nW2tleV0pKSBleGlzdGluZ1trZXldID0gbm9kZVtrZXldIGFzIG5ldmVyO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3UGF0aDtcbiAgICB9XG4gICAgcmV0dXJuIHVwZGF0ZUF0KHBhdGgsIGZ1bmN0aW9uKHBhcmVudDogVHJlZS5Ob2RlKSB7XG4gICAgICBwYXJlbnQuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICB9KSA/IG5ld1BhdGggOiB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBhZGROb2Rlcyhub2RlczogVHJlZS5Ob2RlW10sIHBhdGg6IFRyZWUuUGF0aCk6IFRyZWUuUGF0aCB8IHVuZGVmaW5lZCB7XG4gICAgdmFyIG5vZGUgPSBub2Rlc1swXTtcbiAgICBpZiAoIW5vZGUpIHJldHVybiBwYXRoO1xuICAgIGNvbnN0IG5ld1BhdGggPSBhZGROb2RlKG5vZGUsIHBhdGgpO1xuICAgIHJldHVybiBuZXdQYXRoID8gYWRkTm9kZXMobm9kZXMuc2xpY2UoMSksIG5ld1BhdGgpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVsZXRlTm9kZUF0KHBhdGg6IFRyZWUuUGF0aCk6IHZvaWQge1xuICAgIG9wcy5yZW1vdmVDaGlsZChwYXJlbnROb2RlKHBhdGgpLCB0cmVlUGF0aC5sYXN0KHBhdGgpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21vdGVBdChwYXRoOiBUcmVlLlBhdGgsIHRvTWFpbmxpbmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgbm9kZXMgPSBnZXROb2RlTGlzdChwYXRoKTtcbiAgICBmb3IgKHZhciBpID0gbm9kZXMubGVuZ3RoIC0gMjsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBub2RlID0gbm9kZXNbaSArIDFdO1xuICAgICAgdmFyIHBhcmVudCA9IG5vZGVzW2ldO1xuICAgICAgaWYgKHBhcmVudC5jaGlsZHJlblswXS5pZCAhPT0gbm9kZS5pZCkge1xuICAgICAgICBvcHMucmVtb3ZlQ2hpbGQocGFyZW50LCBub2RlLmlkKTtcbiAgICAgICAgcGFyZW50LmNoaWxkcmVuLnVuc2hpZnQobm9kZSk7XG4gICAgICAgIGlmICghdG9NYWlubGluZSkgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKG5vZGUuZm9yY2VWYXJpYXRpb24pIHtcbiAgICAgICAgbm9kZS5mb3JjZVZhcmlhdGlvbiA9IGZhbHNlO1xuICAgICAgICBpZiAoIXRvTWFpbmxpbmUpIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldENvbW1lbnRBdChjb21tZW50OiBUcmVlLkNvbW1lbnQsIHBhdGg6IFRyZWUuUGF0aCkge1xuICAgIHJldHVybiAhY29tbWVudC50ZXh0ID8gZGVsZXRlQ29tbWVudEF0KGNvbW1lbnQuaWQsIHBhdGgpIDogdXBkYXRlQXQocGF0aCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgbm9kZS5jb21tZW50cyA9IG5vZGUuY29tbWVudHMgfHwgW107XG4gICAgICBjb25zdCBleGlzdGluZyA9IG5vZGUuY29tbWVudHMuZmluZChmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBjLmlkID09PSBjb21tZW50LmlkO1xuICAgICAgfSk7XG4gICAgICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnRleHQgPSBjb21tZW50LnRleHQ7XG4gICAgICBlbHNlIG5vZGUuY29tbWVudHMucHVzaChjb21tZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlbGV0ZUNvbW1lbnRBdChpZDogc3RyaW5nLCBwYXRoOiBUcmVlLlBhdGgpIHtcbiAgICByZXR1cm4gdXBkYXRlQXQocGF0aCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIGNvbW1lbnRzID0gKG5vZGUuY29tbWVudHMgfHwgW10pLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBjLmlkICE9PSBpZFxuICAgICAgfSk7XG4gICAgICBub2RlLmNvbW1lbnRzID0gY29tbWVudHMubGVuZ3RoID8gY29tbWVudHMgOiB1bmRlZmluZWQ7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRHbHlwaHNBdChnbHlwaHM6IFRyZWUuR2x5cGhbXSwgcGF0aDogVHJlZS5QYXRoKSB7XG4gICAgcmV0dXJuIHVwZGF0ZUF0KHBhdGgsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIG5vZGUuZ2x5cGhzID0gZ2x5cGhzO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyZW50Tm9kZShwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLk5vZGUge1xuICAgIHJldHVybiBub2RlQXRQYXRoKHRyZWVQYXRoLmluaXQocGF0aCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGFyZW50Q2xvY2sobm9kZTogVHJlZS5Ob2RlLCBwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLkNsb2NrIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoISgncGFyZW50Q2xvY2snIGluIG5vZGUpKSB7XG4gICAgICBjb25zdCBwYXIgPSBwYXRoICYmIHBhcmVudE5vZGUocGF0aCk7XG4gICAgICBpZiAoIXBhcikgbm9kZS5wYXJlbnRDbG9jayA9IG5vZGUuY2xvY2s7XG4gICAgICBlbHNlIGlmICghKCdjbG9jaycgaW4gcGFyKSkgbm9kZS5wYXJlbnRDbG9jayA9IHVuZGVmaW5lZDtcbiAgICAgIGVsc2Ugbm9kZS5wYXJlbnRDbG9jayA9IHBhci5jbG9jaztcbiAgICB9XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Q2xvY2s7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJvb3QsXG4gICAgbGFzdFBseSgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIGxhc3ROb2RlKCkucGx5O1xuICAgIH0sXG4gICAgbm9kZUF0UGF0aCxcbiAgICBnZXROb2RlTGlzdCxcbiAgICBsb25nZXN0VmFsaWRQYXRoOiAocGF0aDogc3RyaW5nKSA9PiBsb25nZXN0VmFsaWRQYXRoRnJvbShyb290LCBwYXRoKSxcbiAgICBnZXRPcGVuaW5nLFxuICAgIHVwZGF0ZUF0LFxuICAgIGFkZE5vZGUsXG4gICAgYWRkTm9kZXMsXG4gICAgYWRkRGVzdHMoZGVzdHM6IHN0cmluZywgcGF0aDogVHJlZS5QYXRoLCBvcGVuaW5nPzogVHJlZS5PcGVuaW5nKSB7XG4gICAgICByZXR1cm4gdXBkYXRlQXQocGF0aCwgZnVuY3Rpb24obm9kZTogVHJlZS5Ob2RlKSB7XG4gICAgICAgIG5vZGUuZGVzdHMgPSBkZXN0cztcbiAgICAgICAgaWYgKG9wZW5pbmcpIG5vZGUub3BlbmluZyA9IG9wZW5pbmc7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNldFNoYXBlcyhzaGFwZXM6IFRyZWUuU2hhcGVbXSwgcGF0aDogVHJlZS5QYXRoKSB7XG4gICAgICByZXR1cm4gdXBkYXRlQXQocGF0aCwgZnVuY3Rpb24obm9kZTogVHJlZS5Ob2RlKSB7XG4gICAgICAgIG5vZGUuc2hhcGVzID0gc2hhcGVzO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBzZXRDb21tZW50QXQsXG4gICAgZGVsZXRlQ29tbWVudEF0LFxuICAgIHNldEdseXBoc0F0LFxuICAgIHNldENsb2NrQXQoY2xvY2s6IFRyZWUuQ2xvY2sgfCB1bmRlZmluZWQsIHBhdGg6IFRyZWUuUGF0aCkge1xuICAgICAgcmV0dXJuIHVwZGF0ZUF0KHBhdGgsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgbm9kZS5jbG9jayA9IGNsb2NrO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBwYXRoSXNNYWlubGluZSxcbiAgICBwYXRoSXNGb3JjZWRWYXJpYXRpb24sXG4gICAgbGFzdE1haW5saW5lTm9kZShwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLk5vZGUge1xuICAgICAgcmV0dXJuIGxhc3RNYWlubGluZU5vZGVGcm9tKHJvb3QsIHBhdGgpO1xuICAgIH0sXG4gICAgcGF0aEV4aXN0cyxcbiAgICBkZWxldGVOb2RlQXQsXG4gICAgcHJvbW90ZUF0LFxuICAgIGZvcmNlVmFyaWF0aW9uQXQocGF0aDogVHJlZS5QYXRoLCBmb3JjZTogYm9vbGVhbikge1xuICAgICAgcmV0dXJuIHVwZGF0ZUF0KHBhdGgsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgbm9kZS5mb3JjZVZhcmlhdGlvbiA9IGZvcmNlO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50Tm9kZXNBZnRlclBseSxcbiAgICBtZXJnZSh0cmVlOiBUcmVlLk5vZGUpIHtcbiAgICAgIG9wcy5tZXJnZShyb290LCB0cmVlKTtcbiAgICB9LFxuICAgIHJlbW92ZUNldmFsKCkge1xuICAgICAgb3BzLnVwZGF0ZUFsbChyb290LCBmdW5jdGlvbihuKSB7XG4gICAgICAgIGRlbGV0ZSBuLmNldmFsO1xuICAgICAgICBkZWxldGUgbi50aHJlYXQ7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlbW92ZUNvbXB1dGVyVmFyaWF0aW9ucygpIHtcbiAgICAgIG9wcy5tYWlubGluZU5vZGVMaXN0KHJvb3QpLmZvckVhY2goZnVuY3Rpb24obikge1xuICAgICAgICBuLmNoaWxkcmVuID0gbi5jaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24oYykge1xuICAgICAgICAgIHJldHVybiAhYy5jb21wO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcGFyZW50Tm9kZSxcbiAgICBnZXRQYXJlbnRDbG9ja1xuICB9O1xufVxuIl19
