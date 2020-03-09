(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./squareSet":25,"./util":27}],21:[function(require,module,exports){
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

},{"./squareSet":25,"./types":26}],22:[function(require,module,exports){
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

},{"./attacks":20,"./board":21,"./squareSet":25,"./types":26,"./util":27,"@badrap/result":1}],23:[function(require,module,exports){
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

},{"./board":21,"./setup":24,"./squareSet":25,"./types":26,"./util":27,"@badrap/result":1}],24:[function(require,module,exports){
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

},{"./board":21,"./squareSet":25,"./types":26}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{"./types":26}],28:[function(require,module,exports){
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

},{"./attacks":20,"./board":21,"./chess":22,"./setup":24,"./squareSet":25,"./types":26,"./util":27,"@badrap/result":1}],29:[function(require,module,exports){
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

},{"./is":31,"./vnode":38}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
exports.primitive = primitive;

},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function invokeHandler(handler, vnode, event) {
    if (typeof handler === "function") {
        // call function handler
        handler.call(vnode, event, vnode);
    }
    else if (typeof handler === "object") {
        // call handler with arguments
        if (typeof handler[0] === "function") {
            // special case for single argument for performance
            if (handler.length === 2) {
                handler[0].call(vnode, handler[1], event, vnode);
            }
            else {
                var args = handler.slice(1);
                args.push(event);
                args.push(vnode);
                handler[0].apply(vnode, args);
            }
        }
        else {
            // call multiple handlers
            for (var i = 0; i < handler.length; i++) {
                invokeHandler(handler[i]);
            }
        }
    }
}
function handleEvent(event, vnode) {
    var name = event.type, on = vnode.data.on;
    // call event handler(s) if exists
    if (on && on[name]) {
        invokeHandler(on[name], vnode, event);
    }
}
function createListener() {
    return function handler(event) {
        handleEvent(event, handler.vnode);
    };
}
function updateEventListeners(oldVnode, vnode) {
    var oldOn = oldVnode.data.on, oldListener = oldVnode.listener, oldElm = oldVnode.elm, on = vnode && vnode.data.on, elm = (vnode && vnode.elm), name;
    // optimization for reused immutable handlers
    if (oldOn === on) {
        return;
    }
    // remove existing listeners which no longer used
    if (oldOn && oldListener) {
        // if element changed or deleted we remove all existing listeners unconditionally
        if (!on) {
            for (name in oldOn) {
                // remove listener if element was changed or existing listeners removed
                oldElm.removeEventListener(name, oldListener, false);
            }
        }
        else {
            for (name in oldOn) {
                // remove listener if existing listener removed
                if (!on[name]) {
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
        }
    }
    // add new listeners which has not already attached
    if (on) {
        // reuse existing listener or create new
        var listener = vnode.listener = oldVnode.listener || createListener();
        // update vnode for listener
        listener.vnode = vnode;
        // if element changed or added we add all needed listeners unconditionally
        if (!oldOn) {
            for (name in on) {
                // add listener if element was changed or new listeners added
                elm.addEventListener(name, listener, false);
            }
        }
        else {
            for (name in on) {
                // add listener if new listener added
                if (!oldOn[name]) {
                    elm.addEventListener(name, listener, false);
                }
            }
        }
    }
}
exports.eventListenersModule = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners
};
exports.default = exports.eventListenersModule;

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateProps(oldVnode, vnode) {
    var key, cur, old, elm = vnode.elm, oldProps = oldVnode.data.props, props = vnode.data.props;
    if (!oldProps && !props)
        return;
    if (oldProps === props)
        return;
    oldProps = oldProps || {};
    props = props || {};
    for (key in oldProps) {
        if (!props[key]) {
            delete elm[key];
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];
        if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
            elm[key] = cur;
        }
    }
}
exports.propsModule = { create: updateProps, update: updateProps };
exports.default = exports.propsModule;

},{}],36:[function(require,module,exports){
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

},{"./h":29,"./htmldomapi":30,"./is":31,"./thunk":37,"./vnode":38}],37:[function(require,module,exports){
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

},{"./h":29}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
}
exports.vnode = vnode;
exports.default = vnode;

},{}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const chessground_1 = require("chessground");
const util = require("chessground/util");
function default_1(ctrl) {
    return snabbdom_1.h('div.cg-wrap', {
        hook: {
            insert: vnode => {
                const el = vnode.elm;
                ctrl.chessground = chessground_1.Chessground(el, makeConfig(ctrl));
                bindEvents(el, ctrl);
            },
            destroy: _ => ctrl.chessground.destroy()
        }
    });
}
exports.default = default_1;
function bindEvents(el, ctrl) {
    const handler = onMouseEvent(ctrl);
    ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'contextmenu'].forEach(function (ev) {
        el.addEventListener(ev, handler);
    });
}
function isLeftButton(e) {
    return e.buttons === 1 || e.button === 1;
}
function isLeftClick(e) {
    return isLeftButton(e) && !e.ctrlKey;
}
function isRightClick(e) {
    return util.isRightButton(e) || (e.ctrlKey && isLeftButton(e));
}
let downKey;
let lastKey;
let placeDelete;
function onMouseEvent(ctrl) {
    return function (e) {
        const sel = ctrl.selected();
        // do not generate corresponding mouse event
        // (https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Supporting_both_TouchEvent_and_MouseEvent)
        if (sel !== 'pointer' && e.cancelable !== false && (e.type === 'touchstart' || e.type === 'touchmove'))
            e.preventDefault();
        if (isLeftClick(e) || e.type === 'touchstart' || e.type === 'touchmove') {
            if (sel === 'pointer' || (ctrl.chessground && ctrl.chessground.state.draggable.current && ctrl.chessground.state.draggable.current.newPiece))
                return;
            const pos = util.eventPosition(e);
            if (!pos)
                return;
            const key = ctrl.chessground.getKeyAtDomPos(pos);
            if (!key)
                return;
            if (e.type === 'mousedown' || e.type === 'touchstart')
                downKey = key;
            if (sel === 'trash')
                deleteOrHidePiece(ctrl, key, e);
            else {
                const existingPiece = ctrl.chessground.state.pieces[key];
                const piece = {
                    color: sel[0],
                    role: sel[1]
                };
                const samePiece = existingPiece && piece.color == existingPiece.color && piece.role == existingPiece.role;
                if ((e.type === 'mousedown' || e.type === 'touchstart') && samePiece) {
                    deleteOrHidePiece(ctrl, key, e);
                    placeDelete = true;
                    const endEvents = { mousedown: 'mouseup', touchstart: 'touchend' };
                    document.addEventListener(endEvents[e.type], () => placeDelete = false, { once: true });
                }
                else if (!placeDelete && (e.type === 'mousedown' || e.type === 'touchstart' || key !== lastKey)) {
                    ctrl.chessground.setPieces({
                        [key]: piece
                    });
                    ctrl.onChange();
                    ctrl.chessground.cancelMove();
                }
            }
            lastKey = key;
        }
        else if (isRightClick(e)) {
            if (sel !== 'pointer') {
                ctrl.chessground.state.drawable.current = undefined;
                ctrl.chessground.state.drawable.shapes = [];
                if (e.type === 'contextmenu' && sel != 'trash') {
                    ctrl.chessground.cancelMove();
                    sel[0] = util.opposite(sel[0]);
                    ctrl.redraw();
                }
            }
        }
    };
}
function deleteOrHidePiece(ctrl, key, e) {
    if (e.type === 'touchstart') {
        if (ctrl.chessground.state.pieces[key]) {
            ctrl.chessground.state.draggable.current.element.style.display = 'none';
            ctrl.chessground.cancelMove();
        }
        document.addEventListener('touchend', () => deletePiece(ctrl, key), { once: true });
    }
    else if (e.type === 'mousedown' || key !== downKey) {
        deletePiece(ctrl, key);
    }
}
function deletePiece(ctrl, key) {
    ctrl.chessground.setPieces({
        [key]: undefined
    });
    ctrl.onChange();
}
function makeConfig(ctrl) {
    return {
        fen: ctrl.cfg.fen,
        orientation: ctrl.options.orientation || 'white',
        coordinates: !ctrl.cfg.embed,
        autoCastle: false,
        addPieceZIndex: ctrl.cfg.is3d,
        movable: {
            free: true,
            color: 'both'
        },
        animation: {
            duration: ctrl.cfg.animation.duration
        },
        premovable: {
            enabled: false
        },
        drawable: {
            enabled: true
        },
        draggable: {
            showGhost: true,
            deleteOnDropOff: true
        },
        selectable: {
            enabled: false
        },
        highlight: {
            lastMove: false
        },
        events: {
            change: ctrl.onChange.bind(ctrl)
        }
    };
}

},{"chessground":5,"chessground/util":18,"snabbdom":36}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const board_1 = require("chessops/board");
const setup_1 = require("chessops/setup");
const variant_1 = require("chessops/variant");
const fen_1 = require("chessops/fen");
const common_1 = require("common");
class EditorCtrl {
    constructor(cfg, redraw) {
        this.cfg = cfg;
        this.options = cfg.options || {};
        this.trans = window.lichess.trans(this.cfg.i18n);
        this.selected = common_1.prop('pointer');
        this.extraPositions = [{
                fen: fen_1.INITIAL_FEN,
                epd: fen_1.INITIAL_EPD,
                name: this.trans('startPosition')
            }, {
                fen: 'prompt',
                name: this.trans('loadPosition')
            }];
        if (cfg.positions) {
            cfg.positions.forEach(p => p.epd = p.fen.split(' ').splice(0, 4).join(' '));
        }
        window.Mousetrap.bind('f', (e) => {
            e.preventDefault();
            if (this.chessground)
                this.chessground.toggleOrientation();
            redraw();
        });
        this.castlingToggles = { K: false, Q: false, k: false, q: false };
        this.rules = 'chess';
        this.redraw = () => { };
        this.setFen(cfg.fen);
        this.redraw = redraw;
    }
    onChange() {
        const fen = this.getFen();
        if (!this.cfg.embed) {
            if (fen == fen_1.INITIAL_FEN)
                window.history.replaceState(null, '', '/editor');
            else
                window.history.replaceState(null, '', this.makeUrl('/editor/', fen));
        }
        this.options.onChange && this.options.onChange(fen);
        this.redraw();
    }
    castlingToggleFen() {
        let fen = '';
        for (const toggle of interfaces_1.CASTLING_TOGGLES) {
            if (this.castlingToggles[toggle])
                fen += toggle;
        }
        return fen;
    }
    getSetup() {
        const boardFen = this.chessground ? this.chessground.getFen() : this.cfg.fen;
        const board = fen_1.parseFen(boardFen).unwrap(setup => setup.board, _ => board_1.Board.empty());
        return {
            board,
            pockets: this.pockets,
            turn: this.turn,
            unmovedRooks: this.unmovedRooks || fen_1.parseCastlingFen(board, this.castlingToggleFen()).unwrap(),
            epSquare: this.epSquare,
            remainingChecks: this.remainingChecks,
            halfmoves: this.halfmoves,
            fullmoves: this.fullmoves,
        };
    }
    getFen() {
        return fen_1.makeFen(this.getSetup(), { promoted: this.rules == 'crazyhouse' });
    }
    getLegalFen() {
        return variant_1.setupPosition(this.rules, this.getSetup()).unwrap(pos => {
            return fen_1.makeFen(pos.toSetup(), { promoted: pos.rules == 'crazyhouse' });
        }, _ => undefined);
    }
    isPlayable() {
        return variant_1.setupPosition(this.rules, this.getSetup()).unwrap(pos => !pos.isEnd(), _ => false);
    }
    getState() {
        return {
            fen: this.getFen(),
            legalFen: this.getLegalFen(),
            playable: this.rules == 'chess' && this.isPlayable(),
        };
    }
    makeAnalysisUrl(legalFen) {
        switch (this.rules) {
            case 'chess': return this.makeUrl('/analysis/', legalFen);
            case '3check': return this.makeUrl('/analysis/threeCheck/', legalFen);
            case 'kingofthehill': return this.makeUrl('/analysis/kingOfTheHill/', legalFen);
            case 'racingkings': return this.makeUrl('/analysis/racingKings/', legalFen);
            case 'antichess':
            case 'atomic':
            case 'horde':
            case 'crazyhouse':
                return this.makeUrl(`/analysis/${this.rules}/`, legalFen);
        }
    }
    makeUrl(baseUrl, fen) {
        return baseUrl + encodeURIComponent(fen).replace(/%20/g, '_').replace(/%2F/g, '/');
    }
    bottomColor() {
        return this.chessground ?
            this.chessground.state.orientation :
            this.options.orientation || 'white';
    }
    setCastlingToggle(id, value) {
        if (this.castlingToggles[id] != value)
            this.unmovedRooks = undefined;
        this.castlingToggles[id] = value;
        this.onChange();
    }
    setTurn(turn) {
        this.turn = turn;
        this.onChange();
    }
    startPosition() {
        this.setFen(fen_1.INITIAL_FEN);
    }
    clearBoard() {
        this.setFen(fen_1.EMPTY_FEN);
    }
    loadNewFen(fen) {
        if (fen === 'prompt') {
            fen = (prompt('Paste FEN position') || '').trim();
            if (!fen)
                return;
        }
        this.setFen(fen);
    }
    setFen(fen) {
        return fen_1.parseFen(fen).unwrap(setup => {
            if (this.chessground)
                this.chessground.set({ fen });
            this.pockets = setup.pockets;
            this.turn = setup.turn;
            this.unmovedRooks = setup.unmovedRooks;
            this.epSquare = setup.epSquare;
            this.remainingChecks = setup.remainingChecks;
            this.halfmoves = setup.halfmoves;
            this.fullmoves = setup.fullmoves;
            const castles = variant_1.Castles.fromSetup(setup);
            this.castlingToggles['K'] = common_1.defined(castles.rook.white.h);
            this.castlingToggles['Q'] = common_1.defined(castles.rook.white.a);
            this.castlingToggles['k'] = common_1.defined(castles.rook.black.h);
            this.castlingToggles['q'] = common_1.defined(castles.rook.black.a);
            this.onChange();
            return true;
        }, _ => false);
    }
    setRules(rules) {
        this.rules = rules;
        if (rules != 'crazyhouse')
            this.pockets = undefined;
        else if (!this.pockets)
            this.pockets = setup_1.Material.empty();
        if (rules != '3check')
            this.remainingChecks = undefined;
        else if (!this.remainingChecks)
            this.remainingChecks = setup_1.RemainingChecks.default();
        this.onChange();
    }
    setOrientation(o) {
        this.options.orientation = o;
        if (this.chessground.state.orientation !== o)
            this.chessground.toggleOrientation();
        this.redraw();
    }
}
exports.default = EditorCtrl;

},{"./interfaces":43,"chessops/board":21,"chessops/fen":23,"chessops/setup":24,"chessops/variant":28,"common":39}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CASTLING_TOGGLES = ['K', 'Q', 'k', 'q'];

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ctrl_1 = require("./ctrl");
const view_1 = require("./view");
const snabbdom_1 = require("snabbdom");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const props_1 = require("snabbdom/modules/props");
const eventlisteners_1 = require("snabbdom/modules/eventlisteners");
const menuHover_1 = require("common/menuHover");
const chessground_1 = require("chessground");
menuHover_1.menuHover();
const patch = snabbdom_1.init([class_1.default, attributes_1.default, props_1.default, eventlisteners_1.default]);
window.LichessEditor = (element, config) => {
    let vnode, ctrl;
    const redraw = () => {
        vnode = patch(vnode, view_1.default(ctrl));
    };
    ctrl = new ctrl_1.default(config, redraw);
    element.innerHTML = '';
    const inner = document.createElement('div');
    element.appendChild(inner);
    vnode = patch(inner, view_1.default(ctrl));
    return {
        getFen: ctrl.getFen.bind(ctrl),
        setOrientation: ctrl.setOrientation.bind(ctrl)
    };
};
// that's for the rest of lichess to access chessground
// without having to include it a second time
window.Chessground = chessground_1.Chessground;

},{"./ctrl":42,"./view":45,"chessground":5,"common/menuHover":40,"snabbdom":36,"snabbdom/modules/attributes":32,"snabbdom/modules/class":33,"snabbdom/modules/eventlisteners":34,"snabbdom/modules/props":35}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const drag_1 = require("chessground/drag");
const util_1 = require("chessground/util");
const fen_1 = require("chessops/fen");
const chessground_1 = require("./chessground");
function castleCheckBox(ctrl, id, label, reversed) {
    const input = snabbdom_1.h('input', {
        attrs: {
            type: 'checkbox',
            checked: ctrl.castlingToggles[id],
        },
        on: {
            change(e) {
                ctrl.setCastlingToggle(id, e.target.checked);
            }
        }
    });
    return snabbdom_1.h('label', reversed ? [input, label] : [label, input]);
}
function optgroup(name, opts) {
    return snabbdom_1.h('optgroup', { attrs: { label: name } }, opts);
}
function studyButton(ctrl, state) {
    return snabbdom_1.h('form', {
        attrs: {
            method: 'post',
            action: '/study/as'
        }
    }, [
        snabbdom_1.h('input', { attrs: { type: 'hidden', name: 'orientation', value: ctrl.bottomColor() } }),
        snabbdom_1.h('input', { attrs: { type: 'hidden', name: 'variant', value: ctrl.rules } }),
        snabbdom_1.h('input', { attrs: { type: 'hidden', name: 'fen', value: state.legalFen || '' } }),
        snabbdom_1.h('button', {
            attrs: {
                type: 'submit',
                'data-icon': '4',
                disabled: !state.legalFen,
            },
            class: {
                button: true,
                'button-empty': true,
                text: true,
                disabled: !state.legalFen,
            }
        }, ctrl.trans.noarg('toStudy'))
    ]);
}
function variant2option(key, name, ctrl) {
    return snabbdom_1.h('option', {
        attrs: {
            value: key,
            selected: key == ctrl.rules
        },
    }, `${ctrl.trans.noarg('variant')} | ${name}`);
}
const allVariants = [
    ['chess', 'Standard'],
    ['antichess', 'Antichess'],
    ['atomic', 'Atomic'],
    ['crazyhouse', 'Crazyhouse'],
    ['horde', 'Horde'],
    ['kingofthehill', 'King of the Hill'],
    ['racingkings', 'Racing Kings'],
    ['3check', 'Three-check'],
];
function controls(ctrl, state) {
    const position2option = function (pos) {
        return snabbdom_1.h('option', {
            attrs: {
                value: pos.epd || pos.fen,
                'data-fen': pos.fen,
            }
        }, pos.eco ? `${pos.eco} ${pos.name}` : pos.name);
    };
    return snabbdom_1.h('div.board-editor__tools', [
        ...(ctrl.cfg.embed || !ctrl.cfg.positions ? [] : [snabbdom_1.h('div', [
                snabbdom_1.h('select.positions', {
                    props: {
                        value: state.fen.split(' ').slice(0, 4).join(' ')
                    },
                    on: {
                        change(e) {
                            const el = e.target;
                            let value = el.selectedOptions[0].getAttribute('data-fen');
                            if (value == 'prompt')
                                value = (prompt('Paste FEN') || '').trim();
                            if (!value || !ctrl.setFen(value))
                                el.value = '';
                        }
                    }
                }, [
                    optgroup(ctrl.trans.noarg('setTheBoard'), [
                        snabbdom_1.h('option', {
                            attrs: {
                                selected: true
                            }
                        }, `- ${ctrl.trans.noarg('boardEditor')}  -`),
                        ...ctrl.extraPositions.map(position2option)
                    ]),
                    optgroup(ctrl.trans.noarg('popularOpenings'), ctrl.cfg.positions.map(position2option))
                ])
            ])]),
        snabbdom_1.h('div.metadata', [
            snabbdom_1.h('div.color', snabbdom_1.h('select', {
                on: {
                    change(e) {
                        ctrl.setTurn(e.target.value);
                    }
                }
            }, ['whitePlays', 'blackPlays'].map(function (key) {
                return snabbdom_1.h('option', {
                    attrs: {
                        value: key[0] == 'w' ? 'white' : 'black',
                        selected: ctrl.turn[0] === key[0]
                    }
                }, ctrl.trans(key));
            }))),
            snabbdom_1.h('div.castling', [
                snabbdom_1.h('strong', ctrl.trans.noarg('castling')),
                snabbdom_1.h('div', [
                    castleCheckBox(ctrl, 'K', ctrl.trans.noarg('whiteCastlingKingside'), !!ctrl.options.inlineCastling),
                    castleCheckBox(ctrl, 'Q', 'O-O-O', true)
                ]),
                snabbdom_1.h('div', [
                    castleCheckBox(ctrl, 'k', ctrl.trans.noarg('blackCastlingKingside'), !!ctrl.options.inlineCastling),
                    castleCheckBox(ctrl, 'q', 'O-O-O', true)
                ])
            ])
        ]),
        ...(ctrl.cfg.embed ? [snabbdom_1.h('div.actions', [
                snabbdom_1.h('a.button.button-empty', {
                    on: {
                        click() {
                            ctrl.startPosition();
                        }
                    }
                }, ctrl.trans.noarg('startPosition')),
                snabbdom_1.h('a.button.button-empty', {
                    on: {
                        click() {
                            ctrl.clearBoard();
                        }
                    }
                }, ctrl.trans.noarg('clearBoard'))
            ])] : [
            snabbdom_1.h('div', [
                snabbdom_1.h('select', {
                    attrs: { id: 'variants' },
                    on: {
                        change(e) {
                            ctrl.setRules(e.target.value);
                        }
                    }
                }, allVariants.map(x => variant2option(x[0], x[1], ctrl)))
            ]),
            snabbdom_1.h('div.actions', [
                snabbdom_1.h('a.button.button-empty.text', {
                    attrs: { 'data-icon': 'q' },
                    on: {
                        click() {
                            ctrl.setFen(fen_1.EMPTY_FEN);
                        }
                    }
                }, ctrl.trans.noarg('clearBoard')),
                snabbdom_1.h('a.button.button-empty.text', {
                    attrs: { 'data-icon': 'B' },
                    on: {
                        click() {
                            ctrl.chessground.toggleOrientation();
                        }
                    }
                }, ctrl.trans.noarg('flipBoard')),
                snabbdom_1.h('a', {
                    attrs: Object.assign({ 'data-icon': 'A', rel: 'nofollow' }, (state.legalFen ? { href: ctrl.makeAnalysisUrl(state.legalFen) } : {})),
                    class: {
                        button: true,
                        'button-empty': true,
                        text: true,
                        disabled: !state.legalFen
                    }
                }, ctrl.trans.noarg('analysis')),
                snabbdom_1.h('a', {
                    class: {
                        button: true,
                        'button-empty': true,
                        disabled: !state.playable,
                    },
                    on: {
                        click: () => {
                            if (state.playable)
                                $.modal($('.continue-with'));
                        }
                    }
                }, [snabbdom_1.h('span.text', { attrs: { 'data-icon': 'U' } }, ctrl.trans.noarg('continueFromHere'))]),
                studyButton(ctrl, state)
            ]),
            snabbdom_1.h('div.continue-with.none', [
                snabbdom_1.h('a.button', {
                    attrs: {
                        href: '/?fen=' + state.legalFen + '#ai',
                        rel: 'nofollow'
                    }
                }, ctrl.trans.noarg('playWithTheMachine')),
                snabbdom_1.h('a.button', {
                    attrs: {
                        href: '/?fen=' + state.legalFen + '#friend',
                        rel: 'nofollow'
                    }
                }, ctrl.trans.noarg('playWithAFriend'))
            ])
        ])
    ]);
}
function inputs(ctrl, fen) {
    if (ctrl.cfg.embed)
        return;
    return snabbdom_1.h('div.copyables', [
        snabbdom_1.h('p', [
            snabbdom_1.h('strong', 'FEN'),
            snabbdom_1.h('input.copyable', {
                attrs: {
                    spellcheck: false,
                },
                props: {
                    value: fen,
                },
                on: {
                    change(e) {
                        const el = e.target;
                        ctrl.setFen(el.value.trim());
                        el.reportValidity();
                    },
                    input(e) {
                        const el = e.target;
                        const valid = fen_1.parseFen(el.value.trim()).isOk;
                        el.setCustomValidity(valid ? '' : 'Invalid FEN');
                    },
                    blur(e) {
                        const el = e.target;
                        el.value = ctrl.getFen();
                        el.setCustomValidity('');
                    },
                }
            })
        ]),
        snabbdom_1.h('p', [
            snabbdom_1.h('strong.name', 'URL'),
            snabbdom_1.h('input.copyable.autoselect', {
                attrs: {
                    readonly: true,
                    spellcheck: false,
                    value: ctrl.makeUrl(ctrl.cfg.baseUrl, fen)
                }
            })
        ])
    ]);
}
// can be 'pointer', 'trash', or [color, role]
function selectedToClass(s) {
    return (s === 'pointer' || s === 'trash') ? s : s.join(' ');
}
let lastTouchMovePos;
function sparePieces(ctrl, color, _orientation, position) {
    const selectedClass = selectedToClass(ctrl.selected());
    const pieces = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].map(function (role) {
        return [color, role];
    });
    return snabbdom_1.h('div', {
        attrs: {
            class: ['spare', 'spare-' + position, 'spare-' + color].join(' ')
        }
    }, ['pointer', ...pieces, 'trash'].map((s) => {
        const className = selectedToClass(s);
        const attrs = Object.assign({ class: className }, ((s !== 'pointer' && s !== 'trash') ? {
            'data-color': s[0],
            'data-role': s[1]
        } : {}));
        const selectedSquare = selectedClass === className && (!ctrl.chessground ||
            !ctrl.chessground.state.draggable.current ||
            !ctrl.chessground.state.draggable.current.newPiece);
        return snabbdom_1.h('div', {
            class: {
                'no-square': true,
                pointer: s === 'pointer',
                trash: s === 'trash',
                'selected-square': selectedSquare
            },
            on: {
                mousedown: onSelectSparePiece(ctrl, s, 'mouseup'),
                touchstart: onSelectSparePiece(ctrl, s, 'touchend'),
                touchmove: (e) => {
                    lastTouchMovePos = util_1.eventPosition(e);
                }
            }
        }, [snabbdom_1.h('div', [snabbdom_1.h('piece', { attrs })])]);
    }));
}
function onSelectSparePiece(ctrl, s, upEvent) {
    return function (e) {
        e.preventDefault();
        if (s === 'pointer' || s === 'trash') {
            ctrl.selected(s);
            ctrl.redraw();
        }
        else {
            ctrl.selected('pointer');
            drag_1.dragNewPiece(ctrl.chessground.state, {
                color: s[0],
                role: s[1]
            }, e, true);
            document.addEventListener(upEvent, (e) => {
                const eventPos = util_1.eventPosition(e) || lastTouchMovePos;
                if (eventPos && ctrl.chessground.getKeyAtDomPos(eventPos))
                    ctrl.selected('pointer');
                else
                    ctrl.selected(s);
                ctrl.redraw();
            }, { once: true });
        }
    };
}
function makeCursor(selected) {
    if (selected === 'pointer')
        return 'pointer';
    const name = selected === 'trash' ? 'trash' : selected.join('-');
    const url = window.lichess.assetUrl('cursors/' + name + '.cur');
    return `url('${url}'), default !important`;
}
function default_1(ctrl) {
    const state = ctrl.getState();
    const color = ctrl.bottomColor();
    return snabbdom_1.h('div.board-editor', {
        attrs: {
            style: `cursor: ${makeCursor(ctrl.selected())}`
        }
    }, [
        sparePieces(ctrl, util_1.opposite(color), color, 'top'),
        snabbdom_1.h('div.main-board', [chessground_1.default(ctrl)]),
        sparePieces(ctrl, color, color, 'bottom'),
        controls(ctrl, state),
        inputs(ctrl, state.fen)
    ]);
}
exports.default = default_1;

},{"./chessground":41,"chessground/drag":7,"chessground/util":18,"chessops/fen":23,"snabbdom":36}]},{},[44])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQGJhZHJhcC9yZXN1bHQvZGlzdC9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvYW5pbS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvYXBpLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9ib2FyZC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvY2hlc3Nncm91bmQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2NvbmZpZy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZHJhZy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZHJhdy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZHJvcC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZXZlbnRzLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9leHBsb3Npb24udHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2Zlbi50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvcHJlbW92ZS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvcmVuZGVyLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9zdGF0ZS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvc3ZnLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy90eXBlcy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvdXRpbC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvd3JhcC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc29wcy9hdHRhY2tzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzb3BzL2JvYXJkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzb3BzL2NoZXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzb3BzL2Zlbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc29wcy9zZXR1cC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc29wcy9zcXVhcmVTZXQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3NvcHMvdHlwZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3NvcHMvdXRpbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc29wcy92YXJpYW50LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaHRtbGRvbWFwaS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9pcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9jbGFzcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2V2ZW50bGlzdGVuZXJzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvcHJvcHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vdGh1bmsuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCIuLi9jb21tb24vc3JjL2NvbW1vbi50cyIsIi4uL2NvbW1vbi9zcmMvbWVudUhvdmVyLnRzIiwic3JjL2NoZXNzZ3JvdW5kLnRzIiwic3JjL2N0cmwudHMiLCJzcmMvaW50ZXJmYWNlcy50cyIsInNyYy9tYWluLnRzIiwic3JjL3ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7Ozs7QUNEQSwrQkFBOEI7QUE0QjlCLFNBQWdCLElBQUksQ0FBSSxRQUFxQixFQUFFLEtBQVk7SUFDekQsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN0RixDQUFDO0FBRkQsb0JBRUM7QUFFRCxTQUFnQixNQUFNLENBQUksUUFBcUIsRUFBRSxLQUFZO0lBQzNELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQixLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ25CLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFKRCx3QkFJQztBQVdELFNBQVMsU0FBUyxDQUFDLEdBQVcsRUFBRSxLQUFlO0lBQzdDLE9BQU87UUFDTCxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN0QixLQUFLLEVBQUUsS0FBSztLQUNiLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxNQUFNLENBQUMsS0FBZ0IsRUFBRSxNQUFtQjtJQUNuRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDNUIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakYsQ0FB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SUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FDM0QsQ0FBQyxDQUFDLENBQUMsQ0FDRixFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FDM0QsQ0FDRixDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sTUFBTSxHQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7SUFDMUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hCLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzFELENBQUMsQ0FBQTtBQUVELE1BQU0sTUFBTSxHQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7SUFDMUMsT0FBTyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFBO0FBRUQsTUFBTSxJQUFJLEdBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUN4QyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNoQyxDQUFDLENBQUE7QUFFRCxNQUFNLEtBQUssR0FBYSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUs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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNUQSxTQUFnQixPQUFPLENBQUksQ0FBZ0I7SUFDekMsT0FBTyxPQUFPLENBQUMsS0FBSyxXQUFXLENBQUM7QUFDbEMsQ0FBQztBQUZELDBCQUVDO0FBRUQsU0FBZ0IsS0FBSyxDQUFDLENBQU07SUFDMUIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRkQsc0JBRUM7QUFPRCx5Q0FBeUM7QUFDekMsU0FBZ0IsSUFBSSxDQUFJLFlBQWU7SUFDckMsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDO0lBQ3pCLE1BQU0sR0FBRyxHQUFHLFVBQVMsQ0FBZ0I7UUFDbkMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUMxQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQztJQUNGLE9BQU8sR0FBYyxDQUFDO0FBQ3hCLENBQUM7QUFQRCxvQkFPQzs7OztBQ3JCRCxlQUFlO0FBQ2Y7Ozs7Ozs7R0FPRzs7QUFJVSxRQUFBLFNBQVMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUVoRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYztRQUFFLE9BQU87SUFFMUMsSUFBSSxRQUFRLEdBQVcsR0FBRyxDQUFDO0lBQzNCLElBQUksV0FBVyxHQUFXLEVBQUUsQ0FBQztJQUU3QixpR0FBaUc7SUFDakcsSUFBSSxFQUFVLEVBQUUsRUFBVSxDQUFDO0lBRTNCLG9GQUFvRjtJQUNwRixJQUFJLEtBQUssR0FBRyxVQUFTLEVBQXFCO1FBQ3hDLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2QsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDaEIsQ0FBQyxDQUFDO0lBRUYsb0JBQW9CO0lBQ3BCLHdGQUF3RjtJQUN4RixrRkFBa0Y7SUFDbEYscUZBQXFGO0lBQ3JGLDJFQUEyRTtJQUMzRSxJQUFJLEtBQUssR0FBVSxFQUFFLENBQUM7SUFFdEIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV0QixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUN0QyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUczQyxnREFBZ0Q7UUFDaEQsTUFBTSxPQUFPLEdBQUc7WUFDZCx5RkFBeUY7WUFDekYsSUFBSyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBQyxFQUFFLENBQUMsQ0FBRSxHQUFHLFdBQVcsRUFBRztnQkFDMUYsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1QixPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ3ZCLHNGQUFzRjtnQkFDdEYsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLE9BQU8sRUFBRSxDQUFDO2FBQ1g7aUJBQU07Z0JBQ0wsK0NBQStDO2dCQUMvQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztnQkFBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztnQkFDN0Isd0dBQXdHO2dCQUN4RyxLQUFLLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFFLENBQUM7YUFDbEQ7UUFDSCxDQUFDLENBQUM7UUFFRixtREFBbUQ7UUFDbkQsSUFBSSxXQUFXLEdBQUcsVUFBUyxFQUFxQjtZQUU5Qyw2QkFBNkI7WUFDN0IsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO2dCQUFFLEtBQUssQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUFFO1lBRXpFLHNFQUFzRTtZQUN0RSxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQztZQUUxQyxzQ0FBc0M7WUFDdEMsSUFBSSxFQUFFLENBQUMsSUFBSSxJQUFJLFlBQVksRUFBRTtnQkFDM0IseUVBQXlFO2dCQUN6RSxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUssRUFBRSxDQUFDLGFBQTRCLENBQUMsT0FBTztvQkFBRSxPQUFPO2dCQUN2RSwrREFBK0Q7Z0JBQy9ELEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztnQkFBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7Z0JBQ3pDLHVEQUF1RDtnQkFDdkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0MsdUZBQXVGO2dCQUN2RixLQUFLLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFFLENBQUM7YUFDbEQ7aUJBQU0sRUFBRSxlQUFlO2dCQUN0QixtQ0FBbUM7Z0JBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtvQkFBRSxPQUFPO2dCQUM1QixtQ0FBbUM7Z0JBQ25DLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QiwwRkFBMEY7Z0JBQzFGLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxFQUFFLENBQUM7YUFDWDtRQUNILENBQUMsQ0FBQztRQUVGLEdBQUcsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbEUsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQzs7Ozs7QUMxRkgsdUNBQTZCO0FBRTdCLDZDQUEwQztBQUcxQyx5Q0FBeUM7QUFHekMsbUJBQXdCLElBQWdCO0lBQ3RDLE9BQU8sWUFBQyxDQUFDLGFBQWEsRUFBRTtRQUN0QixJQUFJLEVBQUU7WUFDSixNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ2QsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQWtCLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxXQUFXLEdBQUcseUJBQVcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELFVBQVUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUNELE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFZLENBQUMsT0FBTyxFQUFFO1NBQzFDO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVhELDRCQVdDO0FBRUQsU0FBUyxVQUFVLENBQUMsRUFBZSxFQUFFLElBQWdCO0lBQ25ELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBUyxFQUFFO1FBQ3RGLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDbEMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsQ0FBYTtJQUNqQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxDQUFhO0lBQ2hDLE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUN2QyxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsQ0FBYTtJQUNqQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFFRCxJQUFJLE9BQXdCLENBQUM7QUFDN0IsSUFBSSxPQUF3QixDQUFDO0FBQzdCLElBQUksV0FBZ0MsQ0FBQztBQUVyQyxTQUFTLFlBQVksQ0FBQyxJQUFnQjtJQUNwQyxPQUFPLFVBQVMsQ0FBYTtRQUMzQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFNUIsNENBQTRDO1FBQzVDLDRHQUE0RztRQUM1RyxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLFVBQVUsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQztZQUFFLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUzSCxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUN2RSxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7Z0JBQUUsT0FBTztZQUNySixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxHQUFHO2dCQUFFLE9BQU87WUFDakIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLEdBQUc7Z0JBQUUsT0FBTztZQUNqQixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWTtnQkFBRSxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ3JFLElBQUksR0FBRyxLQUFLLE9BQU87Z0JBQUUsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDaEQ7Z0JBQ0gsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLEtBQUssR0FBRztvQkFDWixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDYixDQUFDO2dCQUNGLE1BQU0sU0FBUyxHQUFHLGFBQWEsSUFBSSxLQUFLLENBQUMsS0FBSyxJQUFJLGFBQWEsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDO2dCQUUxRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsSUFBSSxTQUFTLEVBQUU7b0JBQ3BFLGlCQUFpQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBQ25CLE1BQU0sU0FBUyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLENBQUM7b0JBQ25FLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLFdBQVcsR0FBRyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDekY7cUJBQU0sSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxJQUFJLEdBQUcsS0FBSyxPQUFPLENBQUMsRUFBRTtvQkFDakcsSUFBSSxDQUFDLFdBQVksQ0FBQyxTQUFTLENBQUM7d0JBQzFCLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSztxQkFDYixDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsV0FBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO2lCQUNoQzthQUNGO1lBQ0QsT0FBTyxHQUFHLEdBQUcsQ0FBQztTQUNmO2FBQU0sSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDMUIsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO2dCQUNyQixJQUFJLENBQUMsV0FBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLFdBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBRTdDLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFhLElBQUksR0FBRyxJQUFJLE9BQU8sRUFBRTtvQkFDOUMsSUFBSSxDQUFDLFdBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDL0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDZjthQUNGO1NBQ0Y7SUFDSCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxJQUFnQixFQUFFLEdBQVEsRUFBRSxDQUFRO0lBQzdELElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLEVBQUU7UUFDM0IsSUFBSSxJQUFJLENBQUMsV0FBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDdEMsSUFBSSxDQUFDLFdBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQVEsQ0FBQyxPQUF1QixDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQzNGLElBQUksQ0FBQyxXQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDaEM7UUFDRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUNyRjtTQUFNLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtRQUNwRCxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3hCO0FBQ0gsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLElBQWdCLEVBQUUsR0FBUTtJQUM3QyxJQUFJLENBQUMsV0FBWSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVM7S0FDakIsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFnQjtJQUNsQyxPQUFPO1FBQ0wsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRztRQUNqQixXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksT0FBTztRQUNoRCxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUs7UUFDNUIsVUFBVSxFQUFFLEtBQUs7UUFDakIsY0FBYyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSTtRQUM3QixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsSUFBSTtZQUNWLEtBQUssRUFBRSxNQUFNO1NBQ2Q7UUFDRCxTQUFTLEVBQUU7WUFDVCxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUTtTQUN0QztRQUNELFVBQVUsRUFBRTtZQUNWLE9BQU8sRUFBRSxLQUFLO1NBQ2Y7UUFDRCxRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsU0FBUyxFQUFFLElBQUk7WUFDZixlQUFlLEVBQUUsSUFBSTtTQUN0QjtRQUNELFVBQVUsRUFBRTtZQUNWLE9BQU8sRUFBRSxLQUFLO1NBQ2Y7UUFDRCxTQUFTLEVBQUU7WUFDVCxRQUFRLEVBQUUsS0FBSztTQUNoQjtRQUNELE1BQU0sRUFBRTtZQUNOLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDakM7S0FDRixDQUFDO0FBQ0osQ0FBQzs7Ozs7QUN0SkQsNkNBQThKO0FBSTlKLDBDQUF1QztBQUN2QywwQ0FBa0U7QUFDbEUsOENBQTBEO0FBQzFELHNDQUF3RztBQUN4RyxtQ0FBNkM7QUFFN0MsTUFBcUIsVUFBVTtJQW9CN0IsWUFBWSxHQUFpQixFQUFFLE1BQWM7UUFDM0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqRCxJQUFJLENBQUMsUUFBUSxHQUFHLGFBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVoQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUM7Z0JBQ3JCLEdBQUcsRUFBRSxpQkFBVztnQkFDaEIsR0FBRyxFQUFFLGlCQUFXO2dCQUNoQixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7YUFDbEMsRUFBRTtnQkFDRCxHQUFHLEVBQUUsUUFBUTtnQkFDYixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7YUFDakMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFO1lBQ2pCLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzdFO1FBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBUSxFQUFFLEVBQUU7WUFDdEMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25CLElBQUksSUFBSSxDQUFDLFdBQVc7Z0JBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzNELE1BQU0sRUFBRSxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO1FBQ2xFLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO1FBRXJCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxRQUFRO1FBQ04sTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRTtZQUNuQixJQUFJLEdBQUcsSUFBSSxpQkFBVztnQkFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDOztnQkFDcEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzNFO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxpQkFBaUI7UUFDdkIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsS0FBSyxNQUFNLE1BQU0sSUFBSSw2QkFBZ0IsRUFBRTtZQUNyQyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO2dCQUFFLEdBQUcsSUFBSSxNQUFNLENBQUM7U0FDakQ7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFTyxRQUFRO1FBQ2QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDN0UsTUFBTSxLQUFLLEdBQUcsY0FBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNsRixPQUFPO1lBQ0wsS0FBSztZQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksSUFBSSxzQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDN0YsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZTtZQUNyQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQzFCLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTTtRQUNKLE9BQU8sYUFBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVPLFdBQVc7UUFDakIsT0FBTyx1QkFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzdELE9BQU8sYUFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxDQUFDLENBQUM7UUFDdkUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVPLFVBQVU7UUFDaEIsT0FBTyx1QkFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQsUUFBUTtRQUNOLE9BQU87WUFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNsQixRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUM1QixRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtTQUNyRCxDQUFDO0lBQ0osQ0FBQztJQUVELGVBQWUsQ0FBQyxRQUFnQjtRQUM5QixRQUFRLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDbEIsS0FBSyxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzFELEtBQUssUUFBUSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3RFLEtBQUssZUFBZSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2hGLEtBQUssYUFBYSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzVFLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxPQUFPLENBQUM7WUFDYixLQUFLLFlBQVk7Z0JBQ2YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQzdEO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxPQUFlLEVBQUUsR0FBVztRQUNsQyxPQUFPLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUM7SUFDdEMsQ0FBQztJQUVELGlCQUFpQixDQUFDLEVBQWtCLEVBQUUsS0FBYztRQUNsRCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSztZQUFFLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQVc7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBVyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELFVBQVU7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQVMsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxVQUFVLENBQUMsR0FBc0I7UUFDL0IsSUFBSSxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ3BCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxHQUFHO2dCQUFFLE9BQU87U0FDbEI7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBVztRQUNoQixPQUFPLGNBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxJQUFJLENBQUMsV0FBVztnQkFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEdBQUcsRUFBQyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQzdCLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztZQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBRWpDLE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsZ0JBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxnQkFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsZ0JBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEIsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRUQsUUFBUSxDQUFDLEtBQVk7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxLQUFLLElBQUksWUFBWTtZQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO2FBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsZ0JBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4RCxJQUFJLEtBQUssSUFBSSxRQUFRO1lBQUUsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7YUFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlO1lBQUUsSUFBSSxDQUFDLGVBQWUsR0FBRyx1QkFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pGLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsY0FBYyxDQUFDLENBQVE7UUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQUksSUFBSSxDQUFDLFdBQVksQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLENBQUM7WUFBRSxJQUFJLENBQUMsV0FBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDckYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hCLENBQUM7Q0FDRjtBQXJNRCw2QkFxTUM7Ozs7O0FDM01ZLFFBQUEsZ0JBQWdCLEdBQXFCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7O0FDSHZFLGlDQUFnQztBQUNoQyxpQ0FBMEI7QUFFMUIsdUNBQWdDO0FBRWhDLGtEQUEyQztBQUMzQyw0REFBcUQ7QUFDckQsa0RBQTJDO0FBQzNDLG9FQUE2RDtBQUU3RCxnREFBNkM7QUFDN0MsNkNBQTBDO0FBRTFDLHFCQUFTLEVBQUUsQ0FBQztBQUVaLE1BQU0sS0FBSyxHQUFHLGVBQUksQ0FBQyxDQUFDLGVBQUssRUFBRSxvQkFBVSxFQUFFLGVBQUssRUFBRSx3QkFBYyxDQUFDLENBQUMsQ0FBQztBQUUvRCxNQUFNLENBQUMsYUFBYSxHQUFHLENBQUMsT0FBb0IsRUFBRSxNQUFvQixFQUFFLEVBQUU7SUFDcEUsSUFBSSxLQUFZLEVBQUUsSUFBZ0IsQ0FBQztJQUVuQyxNQUFNLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDbEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDO0lBRUYsSUFBSSxHQUFHLElBQUksY0FBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN0QyxPQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUN2QixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0IsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFakMsT0FBTztRQUNMLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDOUIsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUMvQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUYsdURBQXVEO0FBQ3ZELDZDQUE2QztBQUM3QyxNQUFNLENBQUMsV0FBVyxHQUFHLHlCQUFXLENBQUM7Ozs7O0FDdkNqQyx1Q0FBNkI7QUFHN0IsMkNBQWdEO0FBQ2hELDJDQUEyRDtBQUUzRCxzQ0FBbUQ7QUFFbkQsK0NBQXdDO0FBR3hDLFNBQVMsY0FBYyxDQUFDLElBQWdCLEVBQUUsRUFBa0IsRUFBRSxLQUFhLEVBQUUsUUFBaUI7SUFDNUYsTUFBTSxLQUFLLEdBQUcsWUFBQyxDQUFDLE9BQU8sRUFBRTtRQUN2QixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7U0FDbEM7UUFDRCxFQUFFLEVBQUU7WUFDRixNQUFNLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFHLENBQUMsQ0FBQyxNQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JFLENBQUM7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILE9BQU8sWUFBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFFRCxTQUFTLFFBQVEsQ0FBQyxJQUFZLEVBQUUsSUFBYTtJQUMzQyxPQUFPLFlBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsSUFBZ0IsRUFBRSxLQUFrQjtJQUN2RCxPQUFPLFlBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDZixLQUFLLEVBQUU7WUFDTCxNQUFNLEVBQUUsTUFBTTtZQUNkLE1BQU0sRUFBRSxXQUFXO1NBQ3BCO0tBQ0YsRUFBRTtRQUNELFlBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDekYsWUFBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7UUFDN0UsWUFBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ25GLFlBQUMsQ0FBQyxRQUFRLEVBQUU7WUFDVixLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLEdBQUc7Z0JBQ2hCLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRO2FBQzFCO1lBQ0QsS0FBSyxFQUFFO2dCQUNMLE1BQU0sRUFBRSxJQUFJO2dCQUNaLGNBQWMsRUFBRSxJQUFJO2dCQUNwQixJQUFJLEVBQUUsSUFBSTtnQkFDVixRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUTthQUMxQjtTQUNGLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDaEMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLEdBQVUsRUFBRSxJQUFZLEVBQUUsSUFBZ0I7SUFDaEUsT0FBTyxZQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2pCLEtBQUssRUFBRTtZQUNMLEtBQUssRUFBRSxHQUFHO1lBQ1YsUUFBUSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSztTQUM1QjtLQUNGLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFFRCxNQUFNLFdBQVcsR0FBMkI7SUFDMUMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDO0lBQ3JCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztJQUMxQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7SUFDcEIsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDO0lBQzVCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztJQUNsQixDQUFDLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQztJQUNyQyxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUM7SUFDL0IsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDO0NBQzFCLENBQUM7QUFFRixTQUFTLFFBQVEsQ0FBQyxJQUFnQixFQUFFLEtBQWtCO0lBQ3BELE1BQU0sZUFBZSxHQUFHLFVBQVMsR0FBb0I7UUFDbkQsT0FBTyxZQUFDLENBQUMsUUFBUSxFQUFFO1lBQ2pCLEtBQUssRUFBRTtnQkFDTCxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRztnQkFDekIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxHQUFHO2FBQ3BCO1NBQ0YsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxZQUFDLENBQUMseUJBQXlCLEVBQUU7UUFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFDLENBQUMsS0FBSyxFQUFFO2dCQUN6RCxZQUFDLENBQUMsa0JBQWtCLEVBQUU7b0JBQ3BCLEtBQUssRUFBRTt3QkFDTCxLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO3FCQUNsRDtvQkFDRCxFQUFFLEVBQUU7d0JBQ0YsTUFBTSxDQUFDLENBQUM7NEJBQ04sTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQTJCLENBQUM7NEJBQ3pDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUMzRCxJQUFJLEtBQUssSUFBSSxRQUFRO2dDQUFFLEtBQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs0QkFDbEUsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dDQUFFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO3dCQUNuRCxDQUFDO3FCQUNGO2lCQUNGLEVBQUU7b0JBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFO3dCQUN4QyxZQUFDLENBQUMsUUFBUSxFQUFFOzRCQUNWLEtBQUssRUFBRTtnQ0FDTCxRQUFRLEVBQUUsSUFBSTs2QkFDZjt5QkFDRixFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQzt3QkFDN0MsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUM7cUJBQzVDLENBQUM7b0JBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUN2RixDQUFDO2FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSixZQUFDLENBQUMsY0FBYyxFQUFFO1lBQ2hCLFlBQUMsQ0FBQyxXQUFXLEVBQ1gsWUFBQyxDQUFDLFFBQVEsRUFBRTtnQkFDVixFQUFFLEVBQUU7b0JBQ0YsTUFBTSxDQUFDLENBQUM7d0JBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsTUFBNEIsQ0FBQyxLQUFjLENBQUMsQ0FBQztvQkFDL0QsQ0FBQztpQkFDRjthQUNGLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVMsR0FBRztnQkFDOUMsT0FBTyxZQUFDLENBQUMsUUFBUSxFQUFFO29CQUNqQixLQUFLLEVBQUU7d0JBQ0wsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTzt3QkFDeEMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDbEM7aUJBQ0YsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FDSjtZQUNELFlBQUMsQ0FBQyxjQUFjLEVBQUU7Z0JBQ2hCLFlBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pDLFlBQUMsQ0FBQyxLQUFLLEVBQUU7b0JBQ1AsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7b0JBQ25HLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7aUJBQ3pDLENBQUM7Z0JBQ0YsWUFBQyxDQUFDLEtBQUssRUFBRTtvQkFDUCxjQUFjLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztvQkFDbkcsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztpQkFDekMsQ0FBQzthQUNILENBQUM7U0FDSCxDQUFDO1FBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQUMsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3JDLFlBQUMsQ0FBQyx1QkFBdUIsRUFBRTtvQkFDekIsRUFBRSxFQUFFO3dCQUNGLEtBQUs7NEJBQ0gsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO3dCQUN2QixDQUFDO3FCQUNGO2lCQUNGLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3JDLFlBQUMsQ0FBQyx1QkFBdUIsRUFBRTtvQkFDekIsRUFBRSxFQUFFO3dCQUNGLEtBQUs7NEJBQ0gsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNwQixDQUFDO3FCQUNGO2lCQUNGLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osWUFBQyxDQUFDLEtBQUssRUFBRTtnQkFDUCxZQUFDLENBQUMsUUFBUSxFQUFFO29CQUNWLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUU7b0JBQ3pCLEVBQUUsRUFBRTt3QkFDRixNQUFNLENBQUMsQ0FBQzs0QkFDTixJQUFJLENBQUMsUUFBUSxDQUFFLENBQUMsQ0FBQyxNQUE0QixDQUFDLEtBQWMsQ0FBQyxDQUFDO3dCQUNoRSxDQUFDO3FCQUNGO2lCQUNGLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDM0QsQ0FBQztZQUNGLFlBQUMsQ0FBQyxhQUFhLEVBQUU7Z0JBQ2YsWUFBQyxDQUFDLDRCQUE0QixFQUFFO29CQUM5QixLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFO29CQUMzQixFQUFFLEVBQUU7d0JBQ0YsS0FBSzs0QkFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQVMsQ0FBQyxDQUFDO3dCQUN6QixDQUFDO3FCQUNGO2lCQUNGLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2xDLFlBQUMsQ0FBQyw0QkFBNEIsRUFBRTtvQkFDOUIsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRTtvQkFDM0IsRUFBRSxFQUFFO3dCQUNGLEtBQUs7NEJBQ0gsSUFBSSxDQUFDLFdBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO3dCQUN4QyxDQUFDO3FCQUNGO2lCQUNGLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2pDLFlBQUMsQ0FBQyxHQUFHLEVBQUU7b0JBQ0wsS0FBSyxrQkFDSCxXQUFXLEVBQUUsR0FBRyxFQUNoQixHQUFHLEVBQUUsVUFBVSxJQUNaLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQzFFO29CQUNELEtBQUssRUFBRTt3QkFDTCxNQUFNLEVBQUUsSUFBSTt3QkFDWixjQUFjLEVBQUUsSUFBSTt3QkFDcEIsSUFBSSxFQUFFLElBQUk7d0JBQ1YsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVE7cUJBQzFCO2lCQUNGLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hDLFlBQUMsQ0FBQyxHQUFHLEVBQUU7b0JBQ0wsS0FBSyxFQUFFO3dCQUNMLE1BQU0sRUFBRSxJQUFJO3dCQUNaLGNBQWMsRUFBRSxJQUFJO3dCQUNwQixRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUTtxQkFDMUI7b0JBQ0QsRUFBRSxFQUFFO3dCQUNGLEtBQUssRUFBRSxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxLQUFLLENBQUMsUUFBUTtnQ0FBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7d0JBQ25ELENBQUM7cUJBQ0Y7aUJBQ0YsRUFBRSxDQUFDLFlBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUYsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7YUFDekIsQ0FBQztZQUNGLFlBQUMsQ0FBQyx3QkFBd0IsRUFBRTtnQkFDMUIsWUFBQyxDQUFDLFVBQVUsRUFBRTtvQkFDWixLQUFLLEVBQUU7d0JBQ0wsSUFBSSxFQUFFLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUs7d0JBQ3ZDLEdBQUcsRUFBRSxVQUFVO3FCQUNoQjtpQkFDRixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQzFDLFlBQUMsQ0FBQyxVQUFVLEVBQUU7b0JBQ1osS0FBSyxFQUFFO3dCQUNMLElBQUksRUFBRSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyxTQUFTO3dCQUMzQyxHQUFHLEVBQUUsVUFBVTtxQkFDaEI7aUJBQ0YsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3hDLENBQUM7U0FDSCxDQUFDO0tBQ0gsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFDLElBQWdCLEVBQUUsR0FBVztJQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSztRQUFFLE9BQU87SUFDM0IsT0FBTyxZQUFDLENBQUMsZUFBZSxFQUFFO1FBQ3hCLFlBQUMsQ0FBQyxHQUFHLEVBQUU7WUFDTCxZQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztZQUNsQixZQUFDLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2xCLEtBQUssRUFBRTtvQkFDTCxVQUFVLEVBQUUsS0FBSztpQkFDbEI7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLEtBQUssRUFBRSxHQUFHO2lCQUNYO2dCQUNELEVBQUUsRUFBRTtvQkFDRixNQUFNLENBQUMsQ0FBQzt3QkFDTixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBMEIsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7d0JBQzdCLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdEIsQ0FBQztvQkFDRCxLQUFLLENBQUMsQ0FBQzt3QkFDTCxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBMEIsQ0FBQzt3QkFDeEMsTUFBTSxLQUFLLEdBQUcsY0FBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQzdDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ25ELENBQUM7b0JBQ0QsSUFBSSxDQUFDLENBQUM7d0JBQ0osTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQTBCLENBQUM7d0JBQ3hDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUN6QixFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzNCLENBQUM7aUJBQ0Y7YUFDRixDQUFDO1NBQ0gsQ0FBQztRQUNGLFlBQUMsQ0FBQyxHQUFHLEVBQUU7WUFDTCxZQUFDLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQztZQUN2QixZQUFDLENBQUMsMkJBQTJCLEVBQUU7Z0JBQzdCLEtBQUssRUFBRTtvQkFDTCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxVQUFVLEVBQUUsS0FBSztvQkFDakIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO2lCQUMzQzthQUNGLENBQUM7U0FDSCxDQUFDO0tBQ0gsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELDhDQUE4QztBQUM5QyxTQUFTLGVBQWUsQ0FBQyxDQUFXO0lBQ2xDLE9BQU8sQ0FBQyxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlELENBQUM7QUFFRCxJQUFJLGdCQUF3QyxDQUFDO0FBRTdDLFNBQVMsV0FBVyxDQUFDLElBQWdCLEVBQUUsS0FBWSxFQUFFLFlBQW1CLEVBQUUsUUFBMEI7SUFDbEcsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRXZELE1BQU0sTUFBTSxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBUyxJQUFJO1FBQ3BGLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLFlBQUMsQ0FBQyxLQUFLLEVBQUU7UUFDZCxLQUFLLEVBQUU7WUFDTCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxHQUFHLFFBQVEsRUFBRSxRQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNsRTtLQUNGLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBVyxFQUFFLEVBQUU7UUFDckQsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxtQkFDVCxLQUFLLEVBQUUsU0FBUyxJQUNiLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ1IsQ0FBQztRQUNGLE1BQU0sY0FBYyxHQUFHLGFBQWEsS0FBSyxTQUFTLElBQUksQ0FDcEQsQ0FBQyxJQUFJLENBQUMsV0FBVztZQUNqQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPO1lBQ3pDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RCxPQUFPLFlBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZCxLQUFLLEVBQUU7Z0JBQ0wsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLE9BQU8sRUFBRSxDQUFDLEtBQUssU0FBUztnQkFDeEIsS0FBSyxFQUFFLENBQUMsS0FBSyxPQUFPO2dCQUNwQixpQkFBaUIsRUFBRSxjQUFjO2FBQ2xDO1lBQ0QsRUFBRSxFQUFFO2dCQUNGLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQztnQkFDakQsVUFBVSxFQUFFLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDO2dCQUNuRCxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtvQkFDZixnQkFBZ0IsR0FBRyxvQkFBYSxDQUFDLENBQVEsQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO2FBQ0Y7U0FDRixFQUFFLENBQUMsWUFBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFlBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLElBQWdCLEVBQUUsQ0FBVyxFQUFFLE9BQWU7SUFDeEUsT0FBTyxVQUFTLENBQWE7UUFDM0IsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLEtBQUssT0FBTyxFQUFFO1lBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2Y7YUFBTTtZQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFekIsbUJBQVksQ0FBQyxJQUFJLENBQUMsV0FBWSxDQUFDLEtBQUssRUFBRTtnQkFDcEMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDWCxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVaLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRTtnQkFDbkQsTUFBTSxRQUFRLEdBQUcsb0JBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQztnQkFDdEQsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO29CQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O29CQUNoRixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7U0FDcEI7SUFDSCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsUUFBa0I7SUFDcEMsSUFBSSxRQUFRLEtBQUssU0FBUztRQUFFLE9BQU8sU0FBUyxDQUFDO0lBRTdDLE1BQU0sSUFBSSxHQUFHLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqRSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBRWhFLE9BQU8sUUFBUSxHQUFHLHdCQUF3QixDQUFDO0FBQzdDLENBQUM7QUFFRCxtQkFBd0IsSUFBZ0I7SUFDdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUVqQyxPQUFPLFlBQUMsQ0FBQyxrQkFBa0IsRUFBRTtRQUMzQixLQUFLLEVBQUU7WUFDTCxLQUFLLEVBQUUsV0FBVyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7U0FDaEQ7S0FDRixFQUFFO1FBQ0QsV0FBVyxDQUFDLElBQUksRUFBRSxlQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNoRCxZQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxxQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDeEMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQztRQUN6QyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztRQUNyQixNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUM7S0FDeEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQWZELDRCQWVDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZnVuY3Rpb24gcihyLHQpe3IucHJvdG90eXBlPU9iamVjdC5jcmVhdGUodC5wcm90b3R5cGUpLHIucHJvdG90eXBlLmNvbnN0cnVjdG9yPXIsci5fX3Byb3RvX189dH12YXIgdCxuPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gcigpe312YXIgdD1yLnByb3RvdHlwZTtyZXR1cm4gdC51bndyYXA9ZnVuY3Rpb24ocix0KXt2YXIgbj10aGlzLl9jaGFpbigoZnVuY3Rpb24odCl7cmV0dXJuIGV4cG9ydHMuUmVzdWx0Lm9rKHI/cih0KTp0KX0pLChmdW5jdGlvbihyKXtyZXR1cm4gdD9leHBvcnRzLlJlc3VsdC5vayh0KHIpKTpleHBvcnRzLlJlc3VsdC5lcnIocil9KSk7aWYobi5pc0Vycil0aHJvdyBuLmVycm9yO3JldHVybiBuLnZhbHVlfSx0Lm1hcD1mdW5jdGlvbihyLHQpe3JldHVybiB0aGlzLl9jaGFpbigoZnVuY3Rpb24odCl7cmV0dXJuIGV4cG9ydHMuUmVzdWx0Lm9rKHIodCkpfSksKGZ1bmN0aW9uKHIpe3JldHVybiBleHBvcnRzLlJlc3VsdC5lcnIodD90KHIpOnIpfSkpfSx0LmNoYWluPWZ1bmN0aW9uKHIsdCl7cmV0dXJuIHRoaXMuX2NoYWluKHIsdHx8ZnVuY3Rpb24ocil7cmV0dXJuIGV4cG9ydHMuUmVzdWx0LmVycihyKX0pfSxyfSgpLGU9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gbihyKXt2YXIgbjtyZXR1cm4obj10LmNhbGwodGhpcyl8fHRoaXMpLnZhbHVlPXIsbi5pc09rPSEwLG4uaXNFcnI9ITEsbn1yZXR1cm4gcihuLHQpLG4ucHJvdG90eXBlLl9jaGFpbj1mdW5jdGlvbihyLHQpe3JldHVybiByKHRoaXMudmFsdWUpfSxufShuKSx1PWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIG4ocil7dmFyIG47cmV0dXJuKG49dC5jYWxsKHRoaXMpfHx0aGlzKS5lcnJvcj1yLG4uaXNPaz0hMSxuLmlzRXJyPSEwLG59cmV0dXJuIHIobix0KSxuLnByb3RvdHlwZS5fY2hhaW49ZnVuY3Rpb24ocix0KXtyZXR1cm4gdCh0aGlzLmVycm9yKX0sbn0obik7KHQ9ZXhwb3J0cy5SZXN1bHR8fChleHBvcnRzLlJlc3VsdD17fSkpLm9rPWZ1bmN0aW9uKHIpe3JldHVybiBuZXcgZShyKX0sdC5lcnI9ZnVuY3Rpb24ocil7cmV0dXJuIG5ldyB1KHIpfSx0LmFsbD1mdW5jdGlvbihyKXtpZihBcnJheS5pc0FycmF5KHIpKXtmb3IodmFyIG49W10sZT0wO2U8ci5sZW5ndGg7ZSsrKXt2YXIgdT1yW2VdO2lmKHUuaXNFcnIpcmV0dXJuIHU7bi5wdXNoKHUudmFsdWUpfXJldHVybiB0Lm9rKG4pfWZvcih2YXIgbz17fSxpPU9iamVjdC5rZXlzKHIpLHM9MDtzPGkubGVuZ3RoO3MrKyl7dmFyIGM9cltpW3NdXTtpZihjLmlzRXJyKXJldHVybiBjO29baVtzXV09Yy52YWx1ZX1yZXR1cm4gdC5vayhvKX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXBcbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IHR5cGUgTXV0YXRpb248QT4gPSAoc3RhdGU6IFN0YXRlKSA9PiBBO1xuXG4vLyAwLDEgYW5pbWF0aW9uIGdvYWxcbi8vIDIsMyBhbmltYXRpb24gY3VycmVudCBzdGF0dXNcbmV4cG9ydCB0eXBlIEFuaW1WZWN0b3IgPSBjZy5OdW1iZXJRdWFkXG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbVZlY3RvcnMge1xuICBba2V5OiBzdHJpbmddOiBBbmltVmVjdG9yXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUZhZGluZ3Mge1xuICBba2V5OiBzdHJpbmddOiBjZy5QaWVjZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1QbGFuIHtcbiAgYW5pbXM6IEFuaW1WZWN0b3JzO1xuICBmYWRpbmdzOiBBbmltRmFkaW5ncztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltQ3VycmVudCB7XG4gIHN0YXJ0OiBET01IaWdoUmVzVGltZVN0YW1wO1xuICBmcmVxdWVuY3k6IGNnLktIejtcbiAgcGxhbjogQW5pbVBsYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmltPEE+KG11dGF0aW9uOiBNdXRhdGlvbjxBPiwgc3RhdGU6IFN0YXRlKTogQSB7XG4gIHJldHVybiBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA/IGFuaW1hdGUobXV0YXRpb24sIHN0YXRlKSA6IHJlbmRlcihtdXRhdGlvbiwgc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyPEE+KG11dGF0aW9uOiBNdXRhdGlvbjxBPiwgc3RhdGU6IFN0YXRlKTogQSB7XG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5pbnRlcmZhY2UgQW5pbVBpZWNlIHtcbiAga2V5OiBjZy5LZXk7XG4gIHBvczogY2cuUG9zO1xuICBwaWVjZTogY2cuUGllY2U7XG59XG5pbnRlcmZhY2UgQW5pbVBpZWNlcyB7XG4gIFtrZXk6IHN0cmluZ106IEFuaW1QaWVjZVxufVxuXG5mdW5jdGlvbiBtYWtlUGllY2Uoa2V5OiBjZy5LZXksIHBpZWNlOiBjZy5QaWVjZSk6IEFuaW1QaWVjZSB7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXksXG4gICAgcG9zOiB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICBwaWVjZTogcGllY2VcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xvc2VyKHBpZWNlOiBBbmltUGllY2UsIHBpZWNlczogQW5pbVBpZWNlW10pOiBBbmltUGllY2Uge1xuICByZXR1cm4gcGllY2VzLnNvcnQoKHAxLCBwMikgPT4ge1xuICAgIHJldHVybiB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMS5wb3MpIC0gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDIucG9zKTtcbiAgfSlbMF07XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVQbGFuKHByZXZQaWVjZXM6IGNnLlBpZWNlcywgY3VycmVudDogU3RhdGUpOiBBbmltUGxhbiB7XG4gIGNvbnN0IGFuaW1zOiBBbmltVmVjdG9ycyA9IHt9LFxuICBhbmltZWRPcmlnczogY2cuS2V5W10gPSBbXSxcbiAgZmFkaW5nczogQW5pbUZhZGluZ3MgPSB7fSxcbiAgbWlzc2luZ3M6IEFuaW1QaWVjZVtdID0gW10sXG4gIG5ld3M6IEFuaW1QaWVjZVtdID0gW10sXG4gIHByZVBpZWNlczogQW5pbVBpZWNlcyA9IHt9O1xuICBsZXQgY3VyUDogY2cuUGllY2UgfCB1bmRlZmluZWQsIHByZVA6IEFuaW1QaWVjZSB8IHVuZGVmaW5lZCwgaTogYW55LCB2ZWN0b3I6IGNnLk51bWJlclBhaXI7XG4gIGZvciAoaSBpbiBwcmV2UGllY2VzKSB7XG4gICAgcHJlUGllY2VzW2ldID0gbWFrZVBpZWNlKGkgYXMgY2cuS2V5LCBwcmV2UGllY2VzW2ldISk7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5hbGxLZXlzKSB7XG4gICAgY3VyUCA9IGN1cnJlbnQucGllY2VzW2tleV07XG4gICAgcHJlUCA9IHByZVBpZWNlc1trZXldO1xuICAgIGlmIChjdXJQKSB7XG4gICAgICBpZiAocHJlUCkge1xuICAgICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKGN1clAsIHByZVAucGllY2UpKSB7XG4gICAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICB9IGVsc2UgaWYgKHByZVApIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gIH1cbiAgbmV3cy5mb3JFYWNoKG5ld1AgPT4ge1xuICAgIHByZVAgPSBjbG9zZXIobmV3UCwgbWlzc2luZ3MuZmlsdGVyKHAgPT4gdXRpbC5zYW1lUGllY2UobmV3UC5waWVjZSwgcC5waWVjZSkpKTtcbiAgICBpZiAocHJlUCkge1xuICAgICAgdmVjdG9yID0gW3ByZVAucG9zWzBdIC0gbmV3UC5wb3NbMF0sIHByZVAucG9zWzFdIC0gbmV3UC5wb3NbMV1dO1xuICAgICAgYW5pbXNbbmV3UC5rZXldID0gdmVjdG9yLmNvbmNhdCh2ZWN0b3IpIGFzIEFuaW1WZWN0b3I7XG4gICAgICBhbmltZWRPcmlncy5wdXNoKHByZVAua2V5KTtcbiAgICB9XG4gIH0pO1xuICBtaXNzaW5ncy5mb3JFYWNoKHAgPT4ge1xuICAgIGlmICghdXRpbC5jb250YWluc1goYW5pbWVkT3JpZ3MsIHAua2V5KSkgZmFkaW5nc1twLmtleV0gPSBwLnBpZWNlO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGFuaW1zOiBhbmltcyxcbiAgICBmYWRpbmdzOiBmYWRpbmdzXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0ZXAoc3RhdGU6IFN0YXRlLCBub3c6IERPTUhpZ2hSZXNUaW1lU3RhbXApOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGlmIChjdXIgPT09IHVuZGVmaW5lZCkgeyAvLyBhbmltYXRpb24gd2FzIGNhbmNlbGVkIDooXG4gICAgaWYgKCFzdGF0ZS5kb20uZGVzdHJveWVkKSBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHJlc3QgPSAxIC0gKG5vdyAtIGN1ci5zdGFydCkgKiBjdXIuZnJlcXVlbmN5O1xuICBpZiAocmVzdCA8PSAwKSB7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGVhc2UgPSBlYXNpbmcocmVzdCk7XG4gICAgZm9yIChsZXQgaSBpbiBjdXIucGxhbi5hbmltcykge1xuICAgICAgY29uc3QgY2ZnID0gY3VyLnBsYW4uYW5pbXNbaV07XG4gICAgICBjZmdbMl0gPSBjZmdbMF0gKiBlYXNlO1xuICAgICAgY2ZnWzNdID0gY2ZnWzFdICogZWFzZTtcbiAgICB9XG4gICAgc3RhdGUuZG9tLnJlZHJhd05vdyh0cnVlKTsgLy8gb3B0aW1pc2F0aW9uOiBkb24ndCByZW5kZXIgU1ZHIGNoYW5nZXMgZHVyaW5nIGFuaW1hdGlvbnNcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpKSA9PiBzdGVwKHN0YXRlLCBub3cpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhbmltYXRlPEE+KG11dGF0aW9uOiBNdXRhdGlvbjxBPiwgc3RhdGU6IFN0YXRlKTogQSB7XG4gIC8vIGNsb25lIHN0YXRlIGJlZm9yZSBtdXRhdGluZyBpdFxuICBjb25zdCBwcmV2UGllY2VzOiBjZy5QaWVjZXMgPSB7Li4uc3RhdGUucGllY2VzfTtcblxuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIGNvbnN0IHBsYW4gPSBjb21wdXRlUGxhbihwcmV2UGllY2VzLCBzdGF0ZSk7XG4gIGlmICghaXNPYmplY3RFbXB0eShwbGFuLmFuaW1zKSB8fCAhaXNPYmplY3RFbXB0eShwbGFuLmZhZGluZ3MpKSB7XG4gICAgY29uc3QgYWxyZWFkeVJ1bm5pbmcgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudCAmJiBzdGF0ZS5hbmltYXRpb24uY3VycmVudC5zdGFydDtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHtcbiAgICAgIHN0YXJ0OiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgIGZyZXF1ZW5jeTogMSAvIHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbixcbiAgICAgIHBsYW46IHBsYW5cbiAgICB9O1xuICAgIGlmICghYWxyZWFkeVJ1bm5pbmcpIHN0ZXAoc3RhdGUsIHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBkb24ndCBhbmltYXRlLCBqdXN0IHJlbmRlciByaWdodCBhd2F5XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0RW1wdHkobzogYW55KTogYm9vbGVhbiB7XG4gIGZvciAobGV0IF8gaW4gbykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2dyZS8xNjUwMjk0XG5mdW5jdGlvbiBlYXNpbmcodDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIHQgPCAwLjUgPyA0ICogdCAqIHQgKiB0IDogKHQgLSAxKSAqICgyICogdCAtIDIpICogKDIgKiB0IC0gMikgKyAxO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZCdcbmltcG9ydCB7IHdyaXRlIGFzIGZlbldyaXRlIH0gZnJvbSAnLi9mZW4nXG5pbXBvcnQgeyBDb25maWcsIGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHsgYW5pbSwgcmVuZGVyIH0gZnJvbSAnLi9hbmltJ1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZydcbmltcG9ydCB7IERyYXdTaGFwZSB9IGZyb20gJy4vZHJhdydcbmltcG9ydCBleHBsb3Npb24gZnJvbSAnLi9leHBsb3Npb24nXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaSB7XG5cbiAgLy8gcmVjb25maWd1cmUgdGhlIGluc3RhbmNlLiBBY2NlcHRzIGFsbCBjb25maWcgb3B0aW9ucywgZXhjZXB0IGZvciB2aWV3T25seSAmIGRyYXdhYmxlLnZpc2libGUuXG4gIC8vIGJvYXJkIHdpbGwgYmUgYW5pbWF0ZWQgYWNjb3JkaW5nbHksIGlmIGFuaW1hdGlvbnMgYXJlIGVuYWJsZWQuXG4gIHNldChjb25maWc6IENvbmZpZyk6IHZvaWQ7XG5cbiAgLy8gcmVhZCBjaGVzc2dyb3VuZCBzdGF0ZTsgd3JpdGUgYXQgeW91ciBvd24gcmlza3MuXG4gIHN0YXRlOiBTdGF0ZTtcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIGFzIGEgRkVOIHN0cmluZyAob25seSBjb250YWlucyBwaWVjZXMsIG5vIGZsYWdzKVxuICAvLyBlLmcuIHJuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlJcbiAgZ2V0RmVuKCk6IGNnLkZFTjtcblxuICAvLyBjaGFuZ2UgdGhlIHZpZXcgYW5nbGVcbiAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgbW92ZSBwcm9ncmFtbWF0aWNhbGx5XG4gIG1vdmUob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiB2b2lkO1xuXG4gIC8vIGFkZCBhbmQvb3IgcmVtb3ZlIGFyYml0cmFyeSBwaWVjZXMgb24gdGhlIGJvYXJkXG4gIHNldFBpZWNlcyhwaWVjZXM6IGNnLlBpZWNlc0RpZmYpOiB2b2lkO1xuXG4gIC8vIGNsaWNrIGEgc3F1YXJlIHByb2dyYW1tYXRpY2FsbHlcbiAgc2VsZWN0U3F1YXJlKGtleTogY2cuS2V5IHwgbnVsbCwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwdXQgYSBuZXcgcGllY2Ugb24gdGhlIGJvYXJkXG4gIG5ld1BpZWNlKHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXkpOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVtb3ZlKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueVxuICBjYW5jZWxQcmVtb3ZlKCk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZWRyb3AodmFsaWRhdGU6IChkcm9wOiBjZy5Ecm9wKSA9PiBib29sZWFuKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55XG4gIGNhbmNlbFByZWRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgbW92ZSBiZWluZyBtYWRlXG4gIGNhbmNlbE1vdmUoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgY3VycmVudCBtb3ZlIGFuZCBwcmV2ZW50IGZ1cnRoZXIgb25lc1xuICBzdG9wKCk6IHZvaWQ7XG5cbiAgLy8gbWFrZSBzcXVhcmVzIGV4cGxvZGUgKGF0b21pYyBjaGVzcylcbiAgZXhwbG9kZShrZXlzOiBjZy5LZXlbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IHVzZXIgc2hhcGVzXG4gIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgYXV0byBzaGFwZXNcbiAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBzcXVhcmUgbmFtZSBhdCB0aGlzIERPTSBwb3NpdGlvbiAobGlrZSBcImU0XCIpXG4gIGdldEtleUF0RG9tUG9zKHBvczogY2cuTnVtYmVyUGFpcik6IGNnLktleSB8IHVuZGVmaW5lZDtcblxuICAvLyBvbmx5IHVzZWZ1bCB3aGVuIENTUyBjaGFuZ2VzIHRoZSBib2FyZCB3aWR0aC9oZWlnaHQgcmF0aW8gKGZvciAzRClcbiAgcmVkcmF3QWxsOiBjZy5SZWRyYXc7XG5cbiAgLy8gZm9yIGNyYXp5aG91c2UgYW5kIGJvYXJkIGVkaXRvcnNcbiAgZHJhZ05ld1BpZWNlKHBpZWNlOiBjZy5QaWVjZSwgZXZlbnQ6IGNnLk1vdWNoRXZlbnQsIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gdW5iaW5kcyBhbGwgZXZlbnRzXG4gIC8vIChpbXBvcnRhbnQgZm9yIGRvY3VtZW50LXdpZGUgZXZlbnRzIGxpa2Ugc2Nyb2xsIGFuZCBtb3VzZW1vdmUpXG4gIGRlc3Ryb3k6IGNnLlVuYmluZFxufVxuXG4vLyBzZWUgQVBJIHR5cGVzIGFuZCBkb2N1bWVudGF0aW9ucyBpbiBkdHMvYXBpLmQudHNcbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUsIHJlZHJhd0FsbDogY2cuUmVkcmF3KTogQXBpIHtcblxuICBmdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbigpIHtcbiAgICBib2FyZC50b2dnbGVPcmllbnRhdGlvbihzdGF0ZSk7XG4gICAgcmVkcmF3QWxsKCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcblxuICAgIHNldChjb25maWcpIHtcbiAgICAgIGlmIChjb25maWcub3JpZW50YXRpb24gJiYgY29uZmlnLm9yaWVudGF0aW9uICE9PSBzdGF0ZS5vcmllbnRhdGlvbikgdG9nZ2xlT3JpZW50YXRpb24oKTtcbiAgICAgIChjb25maWcuZmVuID8gYW5pbSA6IHJlbmRlcikoc3RhdGUgPT4gY29uZmlndXJlKHN0YXRlLCBjb25maWcpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0YXRlLFxuXG4gICAgZ2V0RmVuOiAoKSA9PiBmZW5Xcml0ZShzdGF0ZS5waWVjZXMpLFxuXG4gICAgdG9nZ2xlT3JpZW50YXRpb24sXG5cbiAgICBzZXRQaWVjZXMocGllY2VzKSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNldFBpZWNlcyhzdGF0ZSwgcGllY2VzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZWxlY3RTcXVhcmUoa2V5LCBmb3JjZSkge1xuICAgICAgaWYgKGtleSkgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIGtleSwgZm9yY2UpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW92ZShvcmlnLCBkZXN0KSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLmJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBuZXdQaWVjZShwaWVjZSwga2V5KSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLmJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGtleSksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgcGxheVByZW1vdmUoKSB7XG4gICAgICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVtb3ZlLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlbW92ZSBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHBsYXlQcmVkcm9wKHZhbGlkYXRlKSB7XG4gICAgICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYm9hcmQucGxheVByZWRyb3Aoc3RhdGUsIHZhbGlkYXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVtb3ZlKCkge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlbW92ZSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVkcm9wKCkge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlZHJvcCwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxNb3ZlKCkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHsgYm9hcmQuY2FuY2VsTW92ZShzdGF0ZSk7IGRyYWdDYW5jZWwoc3RhdGUpOyB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0b3AoKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4geyBib2FyZC5zdG9wKHN0YXRlKTsgZHJhZ0NhbmNlbChzdGF0ZSk7IH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZXhwbG9kZShrZXlzOiBjZy5LZXlbXSkge1xuICAgICAgZXhwbG9zaW9uKHN0YXRlLCBrZXlzKTtcbiAgICB9LFxuXG4gICAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IHNoYXBlcywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IHNoYXBlcywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBnZXRLZXlBdERvbVBvcyhwb3MpIHtcbiAgICAgIHJldHVybiBib2FyZC5nZXRLZXlBdERvbVBvcyhwb3MsIGJvYXJkLndoaXRlUG92KHN0YXRlKSwgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgICB9LFxuXG4gICAgcmVkcmF3QWxsLFxuXG4gICAgZHJhZ05ld1BpZWNlKHBpZWNlLCBldmVudCwgZm9yY2UpIHtcbiAgICAgIGRyYWdOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGV2ZW50LCBmb3JjZSlcbiAgICB9LFxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIGJvYXJkLnN0b3Aoc3RhdGUpO1xuICAgICAgc3RhdGUuZG9tLnVuYmluZCAmJiBzdGF0ZS5kb20udW5iaW5kKCk7XG4gICAgICBzdGF0ZS5kb20uZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBwb3Mya2V5LCBrZXkycG9zLCBvcHBvc2l0ZSwgY29udGFpbnNYIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHByZW1vdmUgZnJvbSAnLi9wcmVtb3ZlJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IHR5cGUgQ2FsbGJhY2sgPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxsVXNlckZ1bmN0aW9uKGY6IENhbGxiYWNrIHwgdW5kZWZpbmVkLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICBpZiAoZikgc2V0VGltZW91dCgoKSA9PiBmKC4uLmFyZ3MpLCAxKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5vcmllbnRhdGlvbiA9IG9wcG9zaXRlKHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9XG4gIHN0YXRlLnNlbGVjdGVkID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXQoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLmxhc3RNb3ZlID0gdW5kZWZpbmVkO1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQaWVjZXMoc3RhdGU6IFN0YXRlLCBwaWVjZXM6IGNnLlBpZWNlc0RpZmYpOiB2b2lkIHtcbiAgZm9yIChsZXQga2V5IGluIHBpZWNlcykge1xuICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW2tleV07XG4gICAgaWYgKHBpZWNlKSBzdGF0ZS5waWVjZXNba2V5XSA9IHBpZWNlO1xuICAgIGVsc2UgZGVsZXRlIHN0YXRlLnBpZWNlc1trZXldO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDaGVjayhzdGF0ZTogU3RhdGUsIGNvbG9yOiBjZy5Db2xvciB8IGJvb2xlYW4pOiB2b2lkIHtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGlmIChjb2xvciA9PT0gdHJ1ZSkgY29sb3IgPSBzdGF0ZS50dXJuQ29sb3I7XG4gIGlmIChjb2xvcikgZm9yIChsZXQgayBpbiBzdGF0ZS5waWVjZXMpIHtcbiAgICBpZiAoc3RhdGUucGllY2VzW2tdIS5yb2xlID09PSAna2luZycgJiYgc3RhdGUucGllY2VzW2tdIS5jb2xvciA9PT0gY29sb3IpIHtcbiAgICAgIHN0YXRlLmNoZWNrID0gayBhcyBjZy5LZXk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YTogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IFtvcmlnLCBkZXN0XTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy5zZXQsIG9yaWcsIGRlc3QsIG1ldGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlbW92YWJsZS5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZWRyb3Aoc3RhdGU6IFN0YXRlLCByb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHsgcm9sZSwga2V5IH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHJvbGUsIGtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZWRyb3Aoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IHBkID0gc3RhdGUucHJlZHJvcHBhYmxlO1xuICBpZiAocGQuY3VycmVudCkge1xuICAgIHBkLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihwZC5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeUF1dG9DYXN0bGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoIXN0YXRlLmF1dG9DYXN0bGUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qga2luZyA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgaWYgKCFraW5nIHx8IGtpbmcucm9sZSAhPT0gJ2tpbmcnKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWdQb3MgPSBrZXkycG9zKG9yaWcpO1xuICBpZiAob3JpZ1Bvc1swXSAhPT0gNSkgcmV0dXJuIGZhbHNlO1xuICBpZiAob3JpZ1Bvc1sxXSAhPT0gMSAmJiBvcmlnUG9zWzFdICE9PSA4KSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGRlc3RQb3MgPSBrZXkycG9zKGRlc3QpO1xuICBsZXQgb2xkUm9va1BvcywgbmV3Um9va1BvcywgbmV3S2luZ1BvcztcbiAgaWYgKGRlc3RQb3NbMF0gPT09IDcgfHwgZGVzdFBvc1swXSA9PT0gOCkge1xuICAgIG9sZFJvb2tQb3MgPSBwb3Mya2V5KFs4LCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3Um9va1BvcyA9IHBvczJrZXkoWzYsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gcG9zMmtleShbNywgb3JpZ1Bvc1sxXV0pO1xuICB9IGVsc2UgaWYgKGRlc3RQb3NbMF0gPT09IDMgfHwgZGVzdFBvc1swXSA9PT0gMSkge1xuICAgIG9sZFJvb2tQb3MgPSBwb3Mya2V5KFsxLCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3Um9va1BvcyA9IHBvczJrZXkoWzQsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gcG9zMmtleShbMywgb3JpZ1Bvc1sxXV0pO1xuICB9IGVsc2UgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IHJvb2sgPSBzdGF0ZS5waWVjZXNbb2xkUm9va1Bvc107XG4gIGlmICghcm9vayB8fCByb29rLnJvbGUgIT09ICdyb29rJykgcmV0dXJuIGZhbHNlO1xuXG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb2xkUm9va1Bvc107XG5cbiAgc3RhdGUucGllY2VzW25ld0tpbmdQb3NdID0ga2luZ1xuICBzdGF0ZS5waWVjZXNbbmV3Um9va1Bvc10gPSByb29rO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBjZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCBvcmlnUGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ10sIGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlc1tkZXN0XTtcbiAgaWYgKG9yaWcgPT09IGRlc3QgfHwgIW9yaWdQaWVjZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjYXB0dXJlZCA9IChkZXN0UGllY2UgJiYgZGVzdFBpZWNlLmNvbG9yICE9PSBvcmlnUGllY2UuY29sb3IpID8gZGVzdFBpZWNlIDogdW5kZWZpbmVkO1xuICBpZiAoZGVzdCA9PSBzdGF0ZS5zZWxlY3RlZCkgdW5zZWxlY3Qoc3RhdGUpO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBjYXB0dXJlZCk7XG4gIGlmICghdHJ5QXV0b0Nhc3RsZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzdGF0ZS5waWVjZXNbZGVzdF0gPSBvcmlnUGllY2U7XG4gICAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgfVxuICBzdGF0ZS5sYXN0TW92ZSA9IFtvcmlnLCBkZXN0XTtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZU5ld1BpZWNlKHN0YXRlOiBTdGF0ZSwgcGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGlmIChzdGF0ZS5waWVjZXNba2V5XSkge1xuICAgIGlmIChmb3JjZSkgZGVsZXRlIHN0YXRlLnBpZWNlc1trZXldO1xuICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmRyb3BOZXdQaWVjZSwgcGllY2UsIGtleSk7XG4gIHN0YXRlLnBpZWNlc1trZXldID0gcGllY2U7XG4gIHN0YXRlLmxhc3RNb3ZlID0gW2tleV07XG4gIHN0YXRlLmNoZWNrID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBzdGF0ZS50dXJuQ29sb3IgPSBvcHBvc2l0ZShzdGF0ZS50dXJuQ29sb3IpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBjZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCByZXN1bHQgPSBiYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCk7XG4gIGlmIChyZXN1bHQpIHtcbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBob2xkVGltZSA9IHN0YXRlLmhvbGQuc3RvcCgpO1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY29uc3QgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSA9IHtcbiAgICAgICAgcHJlbW92ZTogZmFsc2UsXG4gICAgICAgIGN0cmxLZXk6IHN0YXRlLnN0YXRzLmN0cmxLZXksXG4gICAgICAgIGhvbGRUaW1lXG4gICAgICB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBtZXRhZGF0YSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY2FuUHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCB7XG4gICAgICBjdHJsS2V5OiBzdGF0ZS5zdGF0cy5jdHJsS2V5XG4gICAgfSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJvcE5ld1BpZWNlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIGZvcmNlPzogYm9vbGVhbik6IHZvaWQge1xuICBpZiAoY2FuRHJvcChzdGF0ZSwgb3JpZywgZGVzdCkgfHwgZm9yY2UpIHtcbiAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXSE7XG4gICAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgICBiYXNlTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBkZXN0LCBmb3JjZSk7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlck5ld1BpZWNlLCBwaWVjZS5yb2xlLCBkZXN0LCB7XG4gICAgICBwcmVkcm9wOiBmYWxzZVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKGNhblByZWRyb3Aoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc2V0UHJlZHJvcChzdGF0ZSwgc3RhdGUucGllY2VzW29yaWddIS5yb2xlLCBkZXN0KTtcbiAgfSBlbHNlIHtcbiAgICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICAgIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIH1cbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0U3F1YXJlKHN0YXRlOiBTdGF0ZSwga2V5OiBjZy5LZXksIGZvcmNlPzogYm9vbGVhbik6IHZvaWQge1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG4gIGlmIChzdGF0ZS5zZWxlY3RlZCkge1xuICAgIGlmIChzdGF0ZS5zZWxlY3RlZCA9PT0ga2V5ICYmICFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgc3RhdGUuaG9sZC5jYW5jZWwoKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKChzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgZm9yY2UpICYmIHN0YXRlLnNlbGVjdGVkICE9PSBrZXkpIHtcbiAgICAgIGlmICh1c2VyTW92ZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQsIGtleSkpIHtcbiAgICAgICAgc3RhdGUuc3RhdHMuZHJhZ2dlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChpc01vdmFibGUoc3RhdGUsIGtleSkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKSB7XG4gICAgc2V0U2VsZWN0ZWQoc3RhdGUsIGtleSk7XG4gICAgc3RhdGUuaG9sZC5zdGFydCgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZChzdGF0ZTogU3RhdGUsIGtleTogY2cuS2V5KTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID0ga2V5O1xuICBpZiAoaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKSB7XG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHByZW1vdmUoc3RhdGUucGllY2VzLCBrZXksIHN0YXRlLnByZW1vdmFibGUuY2FzdGxlKTtcbiAgfVxuICBlbHNlIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNlbGVjdChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLmhvbGQuY2FuY2VsKCk7XG59XG5cbmZ1bmN0aW9uIGlzTW92YWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoXG4gICAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yXG4gICAgKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Nb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9yaWcgIT09IGRlc3QgJiYgaXNNb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5mcmVlIHx8ICghIXN0YXRlLm1vdmFibGUuZGVzdHMgJiYgY29udGFpbnNYKHN0YXRlLm1vdmFibGUuZGVzdHNbb3JpZ10sIGRlc3QpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjYW5Ecm9wKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIGRlc3QgJiYgKG9yaWcgPT09IGRlc3QgfHwgIXN0YXRlLnBpZWNlc1tkZXN0XSkgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoXG4gICAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yXG4gICAgKSk7XG59XG5cblxuZnVuY3Rpb24gaXNQcmVtb3ZhYmxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQgJiZcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yO1xufVxuXG5mdW5jdGlvbiBjYW5QcmVtb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9yaWcgIT09IGRlc3QgJiZcbiAgaXNQcmVtb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJlxuICBjb250YWluc1gocHJlbW92ZShzdGF0ZS5waWVjZXMsIG9yaWcsIHN0YXRlLnByZW1vdmFibGUuY2FzdGxlKSwgZGVzdCk7XG59XG5cbmZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgY29uc3QgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzW2Rlc3RdO1xuICByZXR1cm4gISFwaWVjZSAmJiBkZXN0ICYmXG4gICghZGVzdFBpZWNlIHx8IGRlc3RQaWVjZS5jb2xvciAhPT0gc3RhdGUubW92YWJsZS5jb2xvcikgJiZcbiAgc3RhdGUucHJlZHJvcHBhYmxlLmVuYWJsZWQgJiZcbiAgKHBpZWNlLnJvbGUgIT09ICdwYXduJyB8fCAoZGVzdFsxXSAhPT0gJzEnICYmIGRlc3RbMV0gIT09ICc4JykpICYmXG4gIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZ2dhYmxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiBzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ2JvdGgnIHx8IChcbiAgICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmIChcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvciB8fCBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWRcbiAgICAgIClcbiAgICApXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlbW92ZShzdGF0ZTogU3RhdGUpOiBib29sZWFuIHtcbiAgY29uc3QgbW92ZSA9IHN0YXRlLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKCFtb3ZlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWcgPSBtb3ZlWzBdLCBkZXN0ID0gbW92ZVsxXTtcbiAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhID0geyBwcmVtb3ZlOiB0cnVlIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIG1ldGFkYXRhKTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVkcm9wKHN0YXRlOiBTdGF0ZSwgdmFsaWRhdGU6IChkcm9wOiBjZy5Ecm9wKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGxldCBkcm9wID0gc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQsXG4gIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKCFkcm9wKSByZXR1cm4gZmFsc2U7XG4gIGlmICh2YWxpZGF0ZShkcm9wKSkge1xuICAgIGNvbnN0IHBpZWNlID0ge1xuICAgICAgcm9sZTogZHJvcC5yb2xlLFxuICAgICAgY29sb3I6IHN0YXRlLm1vdmFibGUuY29sb3JcbiAgICB9IGFzIGNnLlBpZWNlO1xuICAgIGlmIChiYXNlTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBkcm9wLmtleSkpIHtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXJOZXdQaWVjZSwgZHJvcC5yb2xlLCBkcm9wLmtleSwge1xuICAgICAgICBwcmVkcm9wOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICByZXR1cm4gc3VjY2Vzcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbE1vdmUoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3Aoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm1vdmFibGUuY29sb3IgPVxuICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID1cbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIGNhbmNlbE1vdmUoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0S2V5QXREb21Qb3MocG9zOiBjZy5OdW1iZXJQYWlyLCBhc1doaXRlOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBjZy5LZXkgfCB1bmRlZmluZWQge1xuICBsZXQgZmlsZSA9IE1hdGguY2VpbCg4ICogKChwb3NbMF0gLSBib3VuZHMubGVmdCkgLyBib3VuZHMud2lkdGgpKTtcbiAgaWYgKCFhc1doaXRlKSBmaWxlID0gOSAtIGZpbGU7XG4gIGxldCByYW5rID0gTWF0aC5jZWlsKDggLSAoOCAqICgocG9zWzFdIC0gYm91bmRzLnRvcCkgLyBib3VuZHMuaGVpZ2h0KSkpO1xuICBpZiAoIWFzV2hpdGUpIHJhbmsgPSA5IC0gcmFuaztcbiAgcmV0dXJuIChmaWxlID4gMCAmJiBmaWxlIDwgOSAmJiByYW5rID4gMCAmJiByYW5rIDwgOSkgPyBwb3Mya2V5KFtmaWxlLCByYW5rXSkgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGl0ZVBvdihzOiBTdGF0ZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJztcbn1cbiIsImltcG9ydCB7IEFwaSwgc3RhcnQgfSBmcm9tICcuL2FwaSdcbmltcG9ydCB7IENvbmZpZywgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgeyBTdGF0ZSwgZGVmYXVsdHMgfSBmcm9tICcuL3N0YXRlJ1xuXG5pbXBvcnQgcmVuZGVyV3JhcCBmcm9tICcuL3dyYXAnO1xuaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gJy4vZXZlbnRzJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcic7XG5pbXBvcnQgKiBhcyBzdmcgZnJvbSAnLi9zdmcnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gQ2hlc3Nncm91bmQoZWxlbWVudDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IENvbmZpZyk6IEFwaSB7XG5cbiAgY29uc3Qgc3RhdGUgPSBkZWZhdWx0cygpIGFzIFN0YXRlO1xuXG4gIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnIHx8IHt9KTtcblxuICBmdW5jdGlvbiByZWRyYXdBbGwoKSB7XG4gICAgbGV0IHByZXZVbmJpbmQgPSBzdGF0ZS5kb20gJiYgc3RhdGUuZG9tLnVuYmluZDtcbiAgICAvLyBjb21wdXRlIGJvdW5kcyBmcm9tIGV4aXN0aW5nIGJvYXJkIGVsZW1lbnQgaWYgcG9zc2libGVcbiAgICAvLyB0aGlzIGFsbG93cyBub24tc3F1YXJlIGJvYXJkcyBmcm9tIENTUyB0byBiZSBoYW5kbGVkIChmb3IgM0QpXG4gICAgY29uc3QgcmVsYXRpdmUgPSBzdGF0ZS52aWV3T25seSAmJiAhc3RhdGUuZHJhd2FibGUudmlzaWJsZSxcbiAgICBlbGVtZW50cyA9IHJlbmRlcldyYXAoZWxlbWVudCwgc3RhdGUsIHJlbGF0aXZlKSxcbiAgICBib3VuZHMgPSB1dGlsLm1lbW8oKCkgPT4gZWxlbWVudHMuYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpLFxuICAgIHJlZHJhd05vdyA9IChza2lwU3ZnPzogYm9vbGVhbikgPT4ge1xuICAgICAgcmVuZGVyKHN0YXRlKTtcbiAgICAgIGlmICghc2tpcFN2ZyAmJiBlbGVtZW50cy5zdmcpIHN2Zy5yZW5kZXJTdmcoc3RhdGUsIGVsZW1lbnRzLnN2Zyk7XG4gICAgfTtcbiAgICBzdGF0ZS5kb20gPSB7XG4gICAgICBlbGVtZW50cyxcbiAgICAgIGJvdW5kcyxcbiAgICAgIHJlZHJhdzogZGVib3VuY2VSZWRyYXcocmVkcmF3Tm93KSxcbiAgICAgIHJlZHJhd05vdyxcbiAgICAgIHVuYmluZDogcHJldlVuYmluZCxcbiAgICAgIHJlbGF0aXZlXG4gICAgfTtcbiAgICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9ICcnO1xuICAgIHJlZHJhd05vdyhmYWxzZSk7XG4gICAgZXZlbnRzLmJpbmRCb2FyZChzdGF0ZSk7XG4gICAgaWYgKCFwcmV2VW5iaW5kKSBzdGF0ZS5kb20udW5iaW5kID0gZXZlbnRzLmJpbmREb2N1bWVudChzdGF0ZSwgcmVkcmF3QWxsKTtcbiAgICBzdGF0ZS5ldmVudHMuaW5zZXJ0ICYmIHN0YXRlLmV2ZW50cy5pbnNlcnQoZWxlbWVudHMpO1xuICB9XG4gIHJlZHJhd0FsbCgpO1xuXG4gIHJldHVybiBzdGFydChzdGF0ZSwgcmVkcmF3QWxsKTtcbn07XG5cbmZ1bmN0aW9uIGRlYm91bmNlUmVkcmF3KHJlZHJhd05vdzogKHNraXBTdmc/OiBib29sZWFuKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gIGxldCByZWRyYXdpbmcgPSBmYWxzZTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBpZiAocmVkcmF3aW5nKSByZXR1cm47XG4gICAgcmVkcmF3aW5nID0gdHJ1ZTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgcmVkcmF3Tm93KCk7XG4gICAgICByZWRyYXdpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHNldENoZWNrLCBzZXRTZWxlY3RlZCB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyByZWFkIGFzIGZlblJlYWQgfSBmcm9tICcuL2ZlbidcbmltcG9ydCB7IERyYXdTaGFwZSwgRHJhd0JydXNoIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICBmZW4/OiBjZy5GRU47IC8vIGNoZXNzIHBvc2l0aW9uIGluIEZvcnN5dGggbm90YXRpb25cbiAgb3JpZW50YXRpb24/OiBjZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHdoaXRlIHwgYmxhY2tcbiAgdHVybkNvbG9yPzogY2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gd2hpdGUgfCBibGFja1xuICBjaGVjaz86IGNnLkNvbG9yIHwgYm9vbGVhbjsgLy8gdHJ1ZSBmb3IgY3VycmVudCBjb2xvciwgZmFsc2UgdG8gdW5zZXRcbiAgbGFzdE1vdmU/OiBjZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgW1wiYzNcIiwgXCJjNFwiXVxuICBzZWxlY3RlZD86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcImExXCJcbiAgY29vcmRpbmF0ZXM/OiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gIGF1dG9DYXN0bGU/OiBib29sZWFuOyAvLyBpbW1lZGlhdGVseSBjb21wbGV0ZSB0aGUgY2FzdGxlIGJ5IG1vdmluZyB0aGUgcm9vayBhZnRlciBraW5nIG1vdmVcbiAgdmlld09ubHk/OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBkaXNhYmxlQ29udGV4dE1lbnU/OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGNoZXNzYm9hcmRcbiAgcmVzaXphYmxlPzogYm9vbGVhbjsgLy8gbGlzdGVucyB0byBjaGVzc2dyb3VuZC5yZXNpemUgb24gZG9jdW1lbnQuYm9keSB0byBjbGVhciBib3VuZHMgY2FjaGVcbiAgYWRkUGllY2VaSW5kZXg/OiBib29sZWFuOyAvLyBhZGRzIHotaW5kZXggdmFsdWVzIHRvIHBpZWNlcyAoZm9yIDNEKVxuICAvLyBwaWVjZUtleTogYm9vbGVhbjsgLy8gYWRkIGEgZGF0YS1rZXkgYXR0cmlidXRlIHRvIHBpZWNlIGVsZW1lbnRzXG4gIGhpZ2hsaWdodD86IHtcbiAgICBsYXN0TW92ZT86IGJvb2xlYW47IC8vIGFkZCBsYXN0LW1vdmUgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrPzogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuO1xuICAgIGR1cmF0aW9uPzogbnVtYmVyO1xuICB9O1xuICBtb3ZhYmxlPzoge1xuICAgIGZyZWU/OiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgY29sb3I/OiBjZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZS4gd2hpdGUgfCBibGFjayB8IGJvdGggfCB1bmRlZmluZWRcbiAgICBkZXN0cz86IHtcbiAgICAgIFtrZXk6IHN0cmluZ106IGNnLktleVtdXG4gICAgfTsgLy8gdmFsaWQgbW92ZXMuIHtcImEyXCIgW1wiYTNcIiBcImE0XCJdIFwiYjFcIiBbXCJhM1wiIFwiYzNcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIG1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICAgIGFmdGVyTmV3UGllY2U/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciBhIG5ldyBwaWVjZSBpcyBkcm9wcGVkIG9uIHRoZSBib2FyZFxuICAgIH07XG4gICAgcm9va0Nhc3RsZT86IGJvb2xlYW4gLy8gY2FzdGxlIGJ5IG1vdmluZyB0aGUga2luZyB0byB0aGUgcm9va1xuICB9O1xuICBwcmVtb3ZhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBjYXN0bGU/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFsbG93IGtpbmcgY2FzdGxlIHByZW1vdmVzXG4gICAgZGVzdHM/OiBjZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGV2ZW50cz86IHtcbiAgICAgIHNldD86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE/OiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgIC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgcHJlZHJvcHBhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBkcmFnZ2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U/OiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U/OiBib29sZWFuOyAvLyBsZXRzIGNoZXNzZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBjZW50ZXJQaWVjZT86IGJvb2xlYW47IC8vIGNlbnRlciB0aGUgcGllY2Ugb24gY3Vyc29yIGF0IGRyYWcgc3RhcnRcbiAgICBzaG93R2hvc3Q/OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBkZWxldGVPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZFxuICB9O1xuICBzZWxlY3RhYmxlPzoge1xuICAgIC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBlbmFibGVkPzogYm9vbGVhblxuICB9O1xuICBldmVudHM/OiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgYSBwaWVjZSBoYXMgYmVlbiBtb3ZlZC5cbiAgICAvLyBjYXB0dXJlZFBpZWNlIGlzIHVuZGVmaW5lZCBvciBsaWtlIHtjb2xvcjogJ3doaXRlJzsgJ3JvbGUnOiAncXVlZW4nfVxuICAgIG1vdmU/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIGNhcHR1cmVkUGllY2U/OiBjZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wTmV3UGllY2U/OiAocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSkgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgaW5zZXJ0PzogKGVsZW1lbnRzOiBjZy5FbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgICB2aXNpYmxlPzogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgICBlcmFzZU9uQ2xpY2s/OiBib29sZWFuO1xuICAgIHNoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIGF1dG9TaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBicnVzaGVzPzogRHJhd0JydXNoW107XG4gICAgcGllY2VzPzoge1xuICAgICAgYmFzZVVybD86IHN0cmluZztcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZShzdGF0ZTogU3RhdGUsIGNvbmZpZzogQ29uZmlnKSB7XG5cbiAgLy8gZG9uJ3QgbWVyZ2UgZGVzdGluYXRpb25zLiBKdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGUgJiYgY29uZmlnLm1vdmFibGUuZGVzdHMpIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG5cbiAgbWVyZ2Uoc3RhdGUsIGNvbmZpZyk7XG5cbiAgLy8gaWYgYSBmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXNcbiAgaWYgKGNvbmZpZy5mZW4pIHtcbiAgICBzdGF0ZS5waWVjZXMgPSBmZW5SZWFkKGNvbmZpZy5mZW4pO1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICB9XG5cbiAgLy8gYXBwbHkgY29uZmlnIHZhbHVlcyB0aGF0IGNvdWxkIGJlIHVuZGVmaW5lZCB5ZXQgbWVhbmluZ2Z1bFxuICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KCdjaGVjaycpKSBzZXRDaGVjayhzdGF0ZSwgY29uZmlnLmNoZWNrIHx8IGZhbHNlKTtcbiAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgnbGFzdE1vdmUnKSAmJiAhY29uZmlnLmxhc3RNb3ZlKSBzdGF0ZS5sYXN0TW92ZSA9IHVuZGVmaW5lZDtcbiAgLy8gaW4gY2FzZSBvZiBaSCBkcm9wIGxhc3QgbW92ZSwgdGhlcmUncyBhIHNpbmdsZSBzcXVhcmUuXG4gIC8vIGlmIHRoZSBwcmV2aW91cyBsYXN0IG1vdmUgaGFkIHR3byBzcXVhcmVzLFxuICAvLyB0aGUgbWVyZ2UgYWxnb3JpdGhtIHdpbGwgaW5jb3JyZWN0bHkga2VlcCB0aGUgc2Vjb25kIHNxdWFyZS5cbiAgZWxzZSBpZiAoY29uZmlnLmxhc3RNb3ZlKSBzdGF0ZS5sYXN0TW92ZSA9IGNvbmZpZy5sYXN0TW92ZTtcblxuICAvLyBmaXggbW92ZS9wcmVtb3ZlIGRlc3RzXG4gIGlmIChzdGF0ZS5zZWxlY3RlZCkgc2V0U2VsZWN0ZWQoc3RhdGUsIHN0YXRlLnNlbGVjdGVkKTtcblxuICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgaWYgKCFzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gfHwgc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uIDwgMTAwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuXG4gIGlmICghc3RhdGUubW92YWJsZS5yb29rQ2FzdGxlICYmIHN0YXRlLm1vdmFibGUuZGVzdHMpIHtcbiAgICBjb25zdCByYW5rID0gc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ3doaXRlJyA/IDEgOiA4LFxuICAgIGtpbmdTdGFydFBvcyA9ICdlJyArIHJhbmssXG4gICAgZGVzdHMgPSBzdGF0ZS5tb3ZhYmxlLmRlc3RzW2tpbmdTdGFydFBvc10sXG4gICAga2luZyA9IHN0YXRlLnBpZWNlc1traW5nU3RhcnRQb3NdO1xuICAgIGlmICghZGVzdHMgfHwgIWtpbmcgfHwga2luZy5yb2xlICE9PSAna2luZycpIHJldHVybjtcbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzW2tpbmdTdGFydFBvc10gPSBkZXN0cy5maWx0ZXIoZCA9PlxuICAgICAgISgoZCA9PT0gJ2EnICsgcmFuaykgJiYgZGVzdHMuaW5kZXhPZignYycgKyByYW5rIGFzIGNnLktleSkgIT09IC0xKSAmJlxuICAgICAgICAhKChkID09PSAnaCcgKyByYW5rKSAmJiBkZXN0cy5pbmRleE9mKCdnJyArIHJhbmsgYXMgY2cuS2V5KSAhPT0gLTEpXG4gICAgKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gbWVyZ2UoYmFzZTogYW55LCBleHRlbmQ6IGFueSkge1xuICBmb3IgKGxldCBrZXkgaW4gZXh0ZW5kKSB7XG4gICAgaWYgKGlzT2JqZWN0KGJhc2Vba2V5XSkgJiYgaXNPYmplY3QoZXh0ZW5kW2tleV0pKSBtZXJnZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcbiAgICBlbHNlIGJhc2Vba2V5XSA9IGV4dGVuZFtrZXldO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG86IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgY2xlYXIgYXMgZHJhd0NsZWFyIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0nXG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ0N1cnJlbnQge1xuICBvcmlnOiBjZy5LZXk7IC8vIG9yaWcga2V5IG9mIGRyYWdnaW5nIHBpZWNlXG4gIG9yaWdQb3M6IGNnLlBvcztcbiAgcGllY2U6IGNnLlBpZWNlO1xuICByZWw6IGNnLk51bWJlclBhaXI7IC8vIHg7IHkgb2YgdGhlIHBpZWNlIGF0IG9yaWdpbmFsIHBvc2l0aW9uXG4gIGVwb3M6IGNnLk51bWJlclBhaXI7IC8vIGluaXRpYWwgZXZlbnQgcG9zaXRpb25cbiAgcG9zOiBjZy5OdW1iZXJQYWlyOyAvLyByZWxhdGl2ZSBjdXJyZW50IHBvc2l0aW9uXG4gIGRlYzogY2cuTnVtYmVyUGFpcjsgLy8gcGllY2UgY2VudGVyIGRlY2F5XG4gIHN0YXJ0ZWQ6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhlIGRyYWcgaGFzIHN0YXJ0ZWQ7IGFzIHBlciB0aGUgZGlzdGFuY2Ugc2V0dGluZ1xuICBlbGVtZW50OiBjZy5QaWVjZU5vZGUgfCAoKCkgPT4gY2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkKTtcbiAgbmV3UGllY2U/OiBib29sZWFuOyAvLyBpdCBpdCBhIG5ldyBwaWVjZSBmcm9tIG91dHNpZGUgdGhlIGJvYXJkXG4gIGZvcmNlPzogYm9vbGVhbjsgLy8gY2FuIHRoZSBuZXcgcGllY2UgcmVwbGFjZSBhbiBleGlzdGluZyBvbmUgKGVkaXRvcilcbiAgcHJldmlvdXNseVNlbGVjdGVkPzogY2cuS2V5O1xuICBvcmlnaW5UYXJnZXQ6IEV2ZW50VGFyZ2V0IHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHM6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChlLmJ1dHRvbiAhPT0gdW5kZWZpbmVkICYmIGUuYnV0dG9uICE9PSAwKSByZXR1cm47IC8vIG9ubHkgdG91Y2ggb3IgbGVmdCBjbGlja1xuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47IC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmJvdW5kcygpLFxuICBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyLFxuICBvcmlnID0gYm9hcmQuZ2V0S2V5QXREb21Qb3MocG9zaXRpb24sIGJvYXJkLndoaXRlUG92KHMpLCBib3VuZHMpO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgY29uc3QgcGllY2UgPSBzLnBpZWNlc1tvcmlnXTtcbiAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkID0gcy5zZWxlY3RlZDtcbiAgaWYgKCFwcmV2aW91c2x5U2VsZWN0ZWQgJiYgcy5kcmF3YWJsZS5lbmFibGVkICYmIChcbiAgICBzLmRyYXdhYmxlLmVyYXNlT25DbGljayB8fCAoIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSBzLnR1cm5Db2xvcilcbiAgKSkgZHJhd0NsZWFyKHMpO1xuICAvLyBQcmV2ZW50IHRvdWNoIHNjcm9sbCBhbmQgY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnQsIGlmIHRoZXJlXG4gIC8vIGlzIGFuIGludGVudCB0byBpbnRlcmFjdCB3aXRoIHRoZSBib2FyZC4gSWYgbm8gY29sb3IgaXMgbW92YWJsZVxuICAvLyAoYW5kIHRoZSBib2FyZCBpcyBub3QgZm9yIHZpZXdpbmcgb25seSksIHRvdWNoZXMgYXJlIGxpa2VseSBpbnRlbmRlZCB0b1xuICAvLyBzZWxlY3Qgc3F1YXJlcy5cbiAgaWYgKGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UgJiZcbiAgICAgICghZS50b3VjaGVzIHx8ICFzLm1vdmFibGUuY29sb3IgfHwgcGllY2UgfHwgcHJldmlvdXNseVNlbGVjdGVkIHx8IHBpZWNlQ2xvc2VUbyhzLCBwb3NpdGlvbikpKVxuICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIHMuc3RhdHMuY3RybEtleSA9IGUuY3RybEtleTtcbiAgaWYgKHMuc2VsZWN0ZWQgJiYgYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkge1xuICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBvcmlnKSwgcyk7XG4gIH0gZWxzZSB7XG4gICAgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICB9XG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkID09PSBvcmlnO1xuICBjb25zdCBlbGVtZW50ID0gcGllY2VFbGVtZW50QnlLZXkocywgb3JpZyk7XG4gIGlmIChwaWVjZSAmJiBlbGVtZW50ICYmIHN0aWxsU2VsZWN0ZWQgJiYgYm9hcmQuaXNEcmFnZ2FibGUocywgb3JpZykpIHtcbiAgICBjb25zdCBzcXVhcmVCb3VuZHMgPSBjb21wdXRlU3F1YXJlQm91bmRzKG9yaWcsIGJvYXJkLndoaXRlUG92KHMpLCBib3VuZHMpO1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgICBvcmlnLFxuICAgICAgb3JpZ1BvczogdXRpbC5rZXkycG9zKG9yaWcpLFxuICAgICAgcGllY2UsXG4gICAgICByZWw6IHBvc2l0aW9uLFxuICAgICAgZXBvczogcG9zaXRpb24sXG4gICAgICBwb3M6IFswLCAwXSxcbiAgICAgIGRlYzogcy5kcmFnZ2FibGUuY2VudGVyUGllY2UgPyBbXG4gICAgICAgIHBvc2l0aW9uWzBdIC0gKHNxdWFyZUJvdW5kcy5sZWZ0ICsgc3F1YXJlQm91bmRzLndpZHRoIC8gMiksXG4gICAgICAgIHBvc2l0aW9uWzFdIC0gKHNxdWFyZUJvdW5kcy50b3AgKyBzcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMilcbiAgICAgIF0gOiBbMCwgMF0sXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgcy5zdGF0cy5kcmFnZ2VkLFxuICAgICAgZWxlbWVudCxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZCxcbiAgICAgIG9yaWdpblRhcmdldDogZS50YXJnZXRcbiAgICB9O1xuICAgIGVsZW1lbnQuY2dEcmFnZ2luZyA9IHRydWU7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdkcmFnZ2luZycpO1xuICAgIC8vIHBsYWNlIGdob3N0XG4gICAgY29uc3QgZ2hvc3QgPSBzLmRvbS5lbGVtZW50cy5naG9zdDtcbiAgICBpZiAoZ2hvc3QpIHtcbiAgICAgIGdob3N0LmNsYXNzTmFtZSA9IGBnaG9zdCAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbiAgICAgIHV0aWwudHJhbnNsYXRlQWJzKGdob3N0LCB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKGJvdW5kcykodXRpbC5rZXkycG9zKG9yaWcpLCBib2FyZC53aGl0ZVBvdihzKSkpO1xuICAgICAgdXRpbC5zZXRWaXNpYmxlKGdob3N0LCB0cnVlKTtcbiAgICB9XG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBpZiAoaGFkUHJlZHJvcCkgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGllY2VDbG9zZVRvKHM6IFN0YXRlLCBwb3M6IGNnLk51bWJlclBhaXIpOiBib29sZWFuIHtcbiAgY29uc3QgYXNXaGl0ZSA9IGJvYXJkLndoaXRlUG92KHMpLFxuICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgcmFkaXVzU3EgPSBNYXRoLnBvdyhib3VuZHMud2lkdGggLyA4LCAyKTtcbiAgZm9yIChsZXQga2V5IGluIHMucGllY2VzKSB7XG4gICAgY29uc3Qgc3F1YXJlQm91bmRzID0gY29tcHV0ZVNxdWFyZUJvdW5kcyhrZXkgYXMgY2cuS2V5LCBhc1doaXRlLCBib3VuZHMpLFxuICAgIGNlbnRlcjogY2cuTnVtYmVyUGFpciA9IFtcbiAgICAgIHNxdWFyZUJvdW5kcy5sZWZ0ICsgc3F1YXJlQm91bmRzLndpZHRoIC8gMixcbiAgICAgIHNxdWFyZUJvdW5kcy50b3AgKyBzcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMlxuICAgIF07XG4gICAgaWYgKHV0aWwuZGlzdGFuY2VTcShjZW50ZXIsIHBvcykgPD0gcmFkaXVzU3EpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYWdOZXdQaWVjZShzOiBTdGF0ZSwgcGllY2U6IGNnLlBpZWNlLCBlOiBjZy5Nb3VjaEV2ZW50LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkIHtcblxuICBjb25zdCBrZXk6IGNnLktleSA9ICdhMCc7XG5cbiAgcy5waWVjZXNba2V5XSA9IHBpZWNlO1xuXG4gIHMuZG9tLnJlZHJhdygpO1xuXG4gIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXIsXG4gIGFzV2hpdGUgPSBib2FyZC53aGl0ZVBvdihzKSxcbiAgYm91bmRzID0gcy5kb20uYm91bmRzKCksXG4gIHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMoa2V5LCBhc1doaXRlLCBib3VuZHMpO1xuXG4gIGNvbnN0IHJlbDogY2cuTnVtYmVyUGFpciA9IFtcbiAgICAoYXNXaGl0ZSA/IDAgOiA3KSAqIHNxdWFyZUJvdW5kcy53aWR0aCArIGJvdW5kcy5sZWZ0LFxuICAgIChhc1doaXRlID8gOCA6IC0xKSAqIHNxdWFyZUJvdW5kcy5oZWlnaHQgKyBib3VuZHMudG9wXG4gIF07XG5cbiAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnOiBrZXksXG4gICAgb3JpZ1BvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2UsXG4gICAgcmVsLFxuICAgIGVwb3M6IHBvc2l0aW9uLFxuICAgIHBvczogW3Bvc2l0aW9uWzBdIC0gcmVsWzBdLCBwb3NpdGlvblsxXSAtIHJlbFsxXV0sXG4gICAgZGVjOiBbLXNxdWFyZUJvdW5kcy53aWR0aCAvIDIsIC1zcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMl0sXG4gICAgc3RhcnRlZDogdHJ1ZSxcbiAgICBlbGVtZW50OiAoKSA9PiBwaWVjZUVsZW1lbnRCeUtleShzLCBrZXkpLFxuICAgIG9yaWdpblRhcmdldDogZS50YXJnZXQsXG4gICAgbmV3UGllY2U6IHRydWUsXG4gICAgZm9yY2U6ICEhZm9yY2VcbiAgfTtcbiAgcHJvY2Vzc0RyYWcocyk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEcmFnKHM6IFN0YXRlKTogdm9pZCB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgICBpZiAoIWN1cikgcmV0dXJuO1xuICAgIC8vIGNhbmNlbCBhbmltYXRpb25zIHdoaWxlIGRyYWdnaW5nXG4gICAgaWYgKHMuYW5pbWF0aW9uLmN1cnJlbnQgJiYgcy5hbmltYXRpb24uY3VycmVudC5wbGFuLmFuaW1zW2N1ci5vcmlnXSkgcy5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAvLyBpZiBtb3ZpbmcgcGllY2UgaXMgZ29uZSwgY2FuY2VsXG4gICAgY29uc3Qgb3JpZ1BpZWNlID0gcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIGlmICghb3JpZ1BpZWNlIHx8ICF1dGlsLnNhbWVQaWVjZShvcmlnUGllY2UsIGN1ci5waWVjZSkpIGNhbmNlbChzKTtcbiAgICBlbHNlIHtcbiAgICAgIGlmICghY3VyLnN0YXJ0ZWQgJiYgdXRpbC5kaXN0YW5jZVNxKGN1ci5lcG9zLCBjdXIucmVsKSA+PSBNYXRoLnBvdyhzLmRyYWdnYWJsZS5kaXN0YW5jZSwgMikpIGN1ci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgIGlmIChjdXIuc3RhcnRlZCkge1xuXG4gICAgICAgIC8vIHN1cHBvcnQgbGF6eSBlbGVtZW50c1xuICAgICAgICBpZiAodHlwZW9mIGN1ci5lbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc3QgZm91bmQgPSBjdXIuZWxlbWVudCgpO1xuICAgICAgICAgIGlmICghZm91bmQpIHJldHVybjtcbiAgICAgICAgICBmb3VuZC5jZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICBmb3VuZC5jbGFzc0xpc3QuYWRkKCdkcmFnZ2luZycpO1xuICAgICAgICAgIGN1ci5lbGVtZW50ID0gZm91bmQ7XG4gICAgICAgIH1cblxuICAgICAgICBjdXIucG9zID0gW1xuICAgICAgICAgIGN1ci5lcG9zWzBdIC0gY3VyLnJlbFswXSxcbiAgICAgICAgICBjdXIuZXBvc1sxXSAtIGN1ci5yZWxbMV1cbiAgICAgICAgXTtcblxuICAgICAgICAvLyBtb3ZlIHBpZWNlXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhzLmRvbS5ib3VuZHMoKSkoY3VyLm9yaWdQb3MsIGJvYXJkLndoaXRlUG92KHMpKTtcbiAgICAgICAgdHJhbnNsYXRpb25bMF0gKz0gY3VyLnBvc1swXSArIGN1ci5kZWNbMF07XG4gICAgICAgIHRyYW5zbGF0aW9uWzFdICs9IGN1ci5wb3NbMV0gKyBjdXIuZGVjWzFdO1xuICAgICAgICB1dGlsLnRyYW5zbGF0ZUFicyhjdXIuZWxlbWVudCwgdHJhbnNsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlKHM6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50ICYmICghZS50b3VjaGVzIHx8IGUudG91Y2hlcy5sZW5ndGggPCAyKSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQuZXBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgaWYgKCFjdXIpIHJldHVybjtcbiAgLy8gY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnRcbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gIC8vIGNvbXBhcmluZyB3aXRoIHRoZSBvcmlnaW4gdGFyZ2V0IGlzIGFuIGVhc3kgd2F5IHRvIHRlc3QgdGhhdCB0aGUgZW5kIGV2ZW50XG4gIC8vIGhhcyB0aGUgc2FtZSB0b3VjaCBvcmlnaW5cbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBjdXIgJiYgY3VyLm9yaWdpblRhcmdldCAhPT0gZS50YXJnZXQgJiYgIWN1ci5uZXdQaWVjZSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICBjb25zdCBldmVudFBvczogY2cuTnVtYmVyUGFpciA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSB8fCBjdXIuZXBvcztcbiAgY29uc3QgZGVzdCA9IGJvYXJkLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCBib2FyZC53aGl0ZVBvdihzKSwgcy5kb20uYm91bmRzKCkpO1xuICBpZiAoZGVzdCAmJiBjdXIuc3RhcnRlZCAmJiBjdXIub3JpZyAhPT0gZGVzdCkge1xuICAgIGlmIChjdXIubmV3UGllY2UpIGJvYXJkLmRyb3BOZXdQaWVjZShzLCBjdXIub3JpZywgZGVzdCwgY3VyLmZvcmNlKTtcbiAgICBlbHNlIHtcbiAgICAgIHMuc3RhdHMuY3RybEtleSA9IGUuY3RybEtleTtcbiAgICAgIGlmIChib2FyZC51c2VyTW92ZShzLCBjdXIub3JpZywgZGVzdCkpIHMuc3RhdHMuZHJhZ2dlZCA9IHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGN1ci5uZXdQaWVjZSkge1xuICAgIGRlbGV0ZSBzLnBpZWNlc1tjdXIub3JpZ107XG4gIH0gZWxzZSBpZiAocy5kcmFnZ2FibGUuZGVsZXRlT25Ecm9wT2ZmICYmICFkZXN0KSB7XG4gICAgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgICBib2FyZC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLmNoYW5nZSk7XG4gIH1cbiAgaWYgKGN1ciAmJiBjdXIub3JpZyA9PT0gY3VyLnByZXZpb3VzbHlTZWxlY3RlZCAmJiAoY3VyLm9yaWcgPT09IGRlc3QgfHwgIWRlc3QpKVxuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICBlbHNlIGlmICghcy5zZWxlY3RhYmxlLmVuYWJsZWQpIGJvYXJkLnVuc2VsZWN0KHMpO1xuXG4gIHJlbW92ZURyYWdFbGVtZW50cyhzKTtcblxuICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChzOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoY3VyKSB7XG4gICAgaWYgKGN1ci5uZXdQaWVjZSkgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHJlbW92ZURyYWdFbGVtZW50cyhzKTtcbiAgICBzLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVEcmFnRWxlbWVudHMoczogU3RhdGUpIHtcbiAgY29uc3QgZSA9IHMuZG9tLmVsZW1lbnRzO1xuICBpZiAoZS5naG9zdCkgdXRpbC5zZXRWaXNpYmxlKGUuZ2hvc3QsIGZhbHNlKTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUJvdW5kcyhrZXk6IGNnLktleSwgYXNXaGl0ZTogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KSB7XG4gIGNvbnN0IHBvcyA9IHV0aWwua2V5MnBvcyhrZXkpO1xuICBpZiAoIWFzV2hpdGUpIHtcbiAgICBwb3NbMF0gPSA5IC0gcG9zWzBdO1xuICAgIHBvc1sxXSA9IDkgLSBwb3NbMV07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBsZWZ0OiBib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCAqIChwb3NbMF0gLSAxKSAvIDgsXG4gICAgdG9wOiBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCAqICg4IC0gcG9zWzFdKSAvIDgsXG4gICAgd2lkdGg6IGJvdW5kcy53aWR0aCAvIDgsXG4gICAgaGVpZ2h0OiBib3VuZHMuaGVpZ2h0IC8gOFxuICB9O1xufVxuXG5mdW5jdGlvbiBwaWVjZUVsZW1lbnRCeUtleShzOiBTdGF0ZSwga2V5OiBjZy5LZXkpOiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQge1xuICBsZXQgZWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZC5maXJzdENoaWxkIGFzIGNnLlBpZWNlTm9kZTtcbiAgd2hpbGUgKGVsKSB7XG4gICAgaWYgKGVsLmNnS2V5ID09PSBrZXkgJiYgZWwudGFnTmFtZSA9PT0gJ1BJRUNFJykgcmV0dXJuIGVsO1xuICAgIGVsID0gZWwubmV4dFNpYmxpbmcgYXMgY2cuUGllY2VOb2RlO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyB1bnNlbGVjdCwgY2FuY2VsTW92ZSwgZ2V0S2V5QXREb21Qb3MsIHdoaXRlUG92IH0gZnJvbSAnLi9ib2FyZCdcbmltcG9ydCB7IGV2ZW50UG9zaXRpb24sIGlzUmlnaHRCdXR0b24gfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZSB7XG4gIG9yaWc6IGNnLktleTtcbiAgZGVzdD86IGNnLktleTtcbiAgYnJ1c2g6IHN0cmluZztcbiAgbW9kaWZpZXJzPzogRHJhd01vZGlmaWVycztcbiAgcGllY2U/OiBEcmF3U2hhcGVQaWVjZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGVQaWVjZSB7XG4gIHJvbGU6IGNnLlJvbGU7XG4gIGNvbG9yOiBjZy5Db2xvcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0JydXNoIHtcbiAga2V5OiBzdHJpbmc7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIG9wYWNpdHk6IG51bWJlcjtcbiAgbGluZVdpZHRoOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3QnJ1c2hlcyB7XG4gIFtuYW1lOiBzdHJpbmddOiBEcmF3QnJ1c2g7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd01vZGlmaWVycyB7XG4gIGxpbmVXaWR0aD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3YWJsZSB7XG4gIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gIHZpc2libGU6IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gIGVyYXNlT25DbGljazogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiAoc2hhcGVzOiBEcmF3U2hhcGVbXSkgPT4gdm9pZDtcbiAgc2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gdXNlciBzaGFwZXNcbiAgYXV0b1NoYXBlczogRHJhd1NoYXBlW107IC8vIGNvbXB1dGVyIHNoYXBlc1xuICBjdXJyZW50PzogRHJhd0N1cnJlbnQ7XG4gIGJydXNoZXM6IERyYXdCcnVzaGVzO1xuICAvLyBkcmF3YWJsZSBTVkcgcGllY2VzOyB1c2VkIGZvciBjcmF6eWhvdXNlIGRyb3BcbiAgcGllY2VzOiB7XG4gICAgYmFzZVVybDogc3RyaW5nXG4gIH0sXG4gIHByZXZTdmdIYXNoOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3Q3VycmVudCB7XG4gIG9yaWc6IGNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhd2luZ1xuICBkZXN0PzogY2cuS2V5OyAvLyBzaGFwZSBkZXN0LCBvciB1bmRlZmluZWQgZm9yIGNpcmNsZVxuICBtb3VzZVNxPzogY2cuS2V5OyAvLyBzcXVhcmUgYmVpbmcgbW91c2VkIG92ZXJcbiAgcG9zOiBjZy5OdW1iZXJQYWlyOyAvLyByZWxhdGl2ZSBjdXJyZW50IHBvc2l0aW9uXG4gIGJydXNoOiBzdHJpbmc7IC8vIGJydXNoIG5hbWUgZm9yIHNoYXBlXG59XG5cbmNvbnN0IGJydXNoZXMgPSBbJ2dyZWVuJywgJ3JlZCcsICdibHVlJywgJ3llbGxvdyddO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBlLmN0cmxLZXkgPyB1bnNlbGVjdChzdGF0ZSkgOiBjYW5jZWxNb3ZlKHN0YXRlKTtcbiAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyLFxuICBvcmlnID0gZ2V0S2V5QXREb21Qb3MocG9zLCB3aGl0ZVBvdihzdGF0ZSksIHN0YXRlLmRvbS5ib3VuZHMoKSk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWcsXG4gICAgcG9zLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUpXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NEcmF3KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKGN1cikge1xuICAgICAgY29uc3QgbW91c2VTcSA9IGdldEtleUF0RG9tUG9zKGN1ci5wb3MsIHdoaXRlUG92KHN0YXRlKSwgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgICAgIGlmIChtb3VzZVNxICE9PSBjdXIubW91c2VTcSkge1xuICAgICAgICBjdXIubW91c2VTcSA9IG1vdXNlU3E7XG4gICAgICAgIGN1ci5kZXN0ID0gbW91c2VTcSAhPT0gY3VyLm9yaWcgPyBtb3VzZVNxIDogdW5kZWZpbmVkO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgICB9XG4gICAgICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoc3RhdGU6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50LnBvcyA9IGV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudDtcbiAgaWYgKGN1cikge1xuICAgIGlmIChjdXIubW91c2VTcSkgYWRkU2hhcGUoc3RhdGUuZHJhd2FibGUsIGN1cik7XG4gICAgY2FuY2VsKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhcihzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLnNoYXBlcy5sZW5ndGgpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgb25DaGFuZ2Uoc3RhdGUuZHJhd2FibGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50QnJ1c2goZTogY2cuTW91Y2hFdmVudCk6IHN0cmluZyB7XG4gIHJldHVybiBicnVzaGVzWygoZS5zaGlmdEtleSB8fCBlLmN0cmxLZXkpICYmIGlzUmlnaHRCdXR0b24oZSkgPyAxIDogMCkgKyAoZS5hbHRLZXkgPyAyIDogMCldO1xufVxuXG5mdW5jdGlvbiBhZGRTaGFwZShkcmF3YWJsZTogRHJhd2FibGUsIGN1cjogRHJhd0N1cnJlbnQpOiB2b2lkIHtcbiAgY29uc3Qgc2FtZVNoYXBlID0gKHM6IERyYXdTaGFwZSkgPT4gcy5vcmlnID09PSBjdXIub3JpZyAmJiBzLmRlc3QgPT09IGN1ci5kZXN0O1xuICBjb25zdCBzaW1pbGFyID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihzYW1lU2hhcGUpWzBdO1xuICBpZiAoc2ltaWxhcikgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihzID0+ICFzYW1lU2hhcGUocykpO1xuICBpZiAoIXNpbWlsYXIgfHwgc2ltaWxhci5icnVzaCAhPT0gY3VyLmJydXNoKSBkcmF3YWJsZS5zaGFwZXMucHVzaChjdXIpO1xuICBvbkNoYW5nZShkcmF3YWJsZSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hhbmdlKGRyYXdhYmxlOiBEcmF3YWJsZSk6IHZvaWQge1xuICBpZiAoZHJhd2FibGUub25DaGFuZ2UpIGRyYXdhYmxlLm9uQ2hhbmdlKGRyYXdhYmxlLnNoYXBlcyk7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgY2FuY2VsIGFzIGNhbmNlbERyYWcgfSBmcm9tICcuL2RyYWcnXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXREcm9wTW9kZShzOiBTdGF0ZSwgcGllY2U/OiBjZy5QaWVjZSk6IHZvaWQge1xuICBzLmRyb3Btb2RlID0ge1xuICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICBwaWVjZVxuICB9O1xuICBjYW5jZWxEcmFnKHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsRHJvcE1vZGUoczogU3RhdGUpOiB2b2lkIHtcbiAgcy5kcm9wbW9kZSA9IHtcbiAgICBhY3RpdmU6IGZhbHNlXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wKHM6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmICghcy5kcm9wbW9kZS5hY3RpdmUpIHJldHVybjtcblxuICBib2FyZC51bnNldFByZW1vdmUocyk7XG4gIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcblxuICBjb25zdCBwaWVjZSA9IHMuZHJvcG1vZGUucGllY2U7XG5cbiAgaWYgKHBpZWNlKSB7XG4gICAgcy5waWVjZXMuYTAgPSBwaWVjZTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbiAgICBjb25zdCBkZXN0ID0gcG9zaXRpb24gJiYgYm9hcmQuZ2V0S2V5QXREb21Qb3MoXG4gICAgICBwb3NpdGlvbiwgYm9hcmQud2hpdGVQb3YocyksIHMuZG9tLmJvdW5kcygpKTtcbiAgICBpZiAoZGVzdCkgYm9hcmQuZHJvcE5ld1BpZWNlKHMsICdhMCcsIGRlc3QpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgZHJhZyBmcm9tICcuL2RyYWcnXG5pbXBvcnQgKiBhcyBkcmF3IGZyb20gJy4vZHJhdydcbmltcG9ydCB7IGRyb3AgfSBmcm9tICcuL2Ryb3AnXG5pbXBvcnQgeyBpc1JpZ2h0QnV0dG9uIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxudHlwZSBNb3VjaEJpbmQgPSAoZTogY2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcbnR5cGUgU3RhdGVNb3VjaEJpbmQgPSAoZDogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kQm9hcmQoczogU3RhdGUpOiB2b2lkIHtcblxuICBpZiAocy52aWV3T25seSkgcmV0dXJuO1xuXG4gIGNvbnN0IGJvYXJkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZCxcbiAgb25TdGFydCA9IHN0YXJ0RHJhZ09yRHJhdyhzKTtcblxuICAvLyBDYW5ub3QgYmUgcGFzc2l2ZSwgYmVjYXVzZSB3ZSBwcmV2ZW50IHRvdWNoIHNjcm9sbGluZyBhbmQgZHJhZ2dpbmcgb2ZcbiAgLy8gc2VsZWN0ZWQgZWxlbWVudHMuXG4gIGJvYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG5cbiAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51IHx8IHMuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgIGJvYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gIH1cbn1cblxuLy8gcmV0dXJucyB0aGUgdW5iaW5kIGZ1bmN0aW9uXG5leHBvcnQgZnVuY3Rpb24gYmluZERvY3VtZW50KHM6IFN0YXRlLCByZWRyYXdBbGw6IGNnLlJlZHJhdyk6IGNnLlVuYmluZCB7XG5cbiAgY29uc3QgdW5iaW5kczogY2cuVW5iaW5kW10gPSBbXTtcblxuICBpZiAoIXMuZG9tLnJlbGF0aXZlICYmIHMucmVzaXphYmxlKSB7XG4gICAgY29uc3Qgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICBzLmRvbS5ib3VuZHMuY2xlYXIoKTtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZWRyYXdBbGwpO1xuICAgIH07XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQuYm9keSwgJ2NoZXNzZ3JvdW5kLnJlc2l6ZScsIG9uUmVzaXplKSk7XG4gIH1cblxuICBpZiAoIXMudmlld09ubHkpIHtcblxuICAgIGNvbnN0IG9ubW92ZTogTW91Y2hCaW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLm1vdmUsIGRyYXcubW92ZSk7XG4gICAgY29uc3Qgb25lbmQ6IE1vdWNoQmluZCA9IGRyYWdPckRyYXcocywgZHJhZy5lbmQsIGRyYXcuZW5kKTtcblxuICAgIFsndG91Y2htb3ZlJywgJ21vdXNlbW92ZSddLmZvckVhY2goZXYgPT4gdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbm1vdmUpKSk7XG4gICAgWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10uZm9yRWFjaChldiA9PiB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9uZW5kKSkpO1xuXG4gICAgY29uc3Qgb25TY3JvbGwgPSAoKSA9PiBzLmRvbS5ib3VuZHMuY2xlYXIoKTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdzY3JvbGwnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdyZXNpemUnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PiB1bmJpbmRzLmZvckVhY2goZiA9PiBmKCkpO1xufVxuXG5mdW5jdGlvbiB1bmJpbmRhYmxlKGVsOiBFdmVudFRhcmdldCwgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBNb3VjaEJpbmQsIG9wdGlvbnM/OiBhbnkpOiBjZy5VbmJpbmQge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2sgYXMgRXZlbnRMaXN0ZW5lciwgb3B0aW9ucyk7XG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2sgYXMgRXZlbnRMaXN0ZW5lcik7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RHJhZ09yRHJhdyhzOiBTdGF0ZSk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkpIHsgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydChzLCBlKTsgfVxuICAgIGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB7XG4gICAgICBpZiAocy5kcm9wbW9kZS5hY3RpdmUpIGRyb3AocywgZSk7XG4gICAgICBlbHNlIGRyYWcuc3RhcnQocywgZSk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBkcmFnT3JEcmF3KHM6IFN0YXRlLCB3aXRoRHJhZzogU3RhdGVNb3VjaEJpbmQsIHdpdGhEcmF3OiBTdGF0ZU1vdWNoQmluZCk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpKSB7IGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHdpdGhEcmF3KHMsIGUpOyB9XG4gICAgZWxzZSBpZiAoIXMudmlld09ubHkpIHdpdGhEcmFnKHMsIGUpO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgS2V5IH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXhwbG9zaW9uKHN0YXRlOiBTdGF0ZSwga2V5czogS2V5W10pOiB2b2lkIHtcbiAgc3RhdGUuZXhwbG9kaW5nID0geyBzdGFnZTogMSwga2V5cyB9O1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHNldFN0YWdlKHN0YXRlLCAyKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHNldFN0YWdlKHN0YXRlLCB1bmRlZmluZWQpLCAxMjApO1xuICB9LCAxMjApO1xufVxuXG5mdW5jdGlvbiBzZXRTdGFnZShzdGF0ZTogU3RhdGUsIHN0YWdlOiBudW1iZXIgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmV4cGxvZGluZykge1xuICAgIGlmIChzdGFnZSkgc3RhdGUuZXhwbG9kaW5nLnN0YWdlID0gc3RhZ2U7XG4gICAgZWxzZSBzdGF0ZS5leHBsb2RpbmcgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBwb3Mya2V5LCBpbnZSYW5rcyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBjb25zdCBpbml0aWFsOiBjZy5GRU4gPSAncm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUic7XG5cbmNvbnN0IHJvbGVzOiB7IFtsZXR0ZXI6IHN0cmluZ106IGNnLlJvbGUgfSA9IHsgcDogJ3Bhd24nLCByOiAncm9vaycsIG46ICdrbmlnaHQnLCBiOiAnYmlzaG9wJywgcTogJ3F1ZWVuJywgazogJ2tpbmcnIH07XG5cbmNvbnN0IGxldHRlcnMgPSB7IHBhd246ICdwJywgcm9vazogJ3InLCBrbmlnaHQ6ICduJywgYmlzaG9wOiAnYicsIHF1ZWVuOiAncScsIGtpbmc6ICdrJyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVhZChmZW46IGNnLkZFTik6IGNnLlBpZWNlcyB7XG4gIGlmIChmZW4gPT09ICdzdGFydCcpIGZlbiA9IGluaXRpYWw7XG4gIGNvbnN0IHBpZWNlczogY2cuUGllY2VzID0ge307XG4gIGxldCByb3c6IG51bWJlciA9IDgsIGNvbDogbnVtYmVyID0gMDtcbiAgZm9yIChjb25zdCBjIG9mIGZlbikge1xuICAgIHN3aXRjaCAoYykge1xuICAgICAgY2FzZSAnICc6IHJldHVybiBwaWVjZXM7XG4gICAgICBjYXNlICcvJzpcbiAgICAgICAgLS1yb3c7XG4gICAgICAgIGlmIChyb3cgPT09IDApIHJldHVybiBwaWVjZXM7XG4gICAgICAgIGNvbCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnfic6XG4gICAgICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW3BvczJrZXkoW2NvbCwgcm93XSldO1xuICAgICAgICBpZiAocGllY2UpIHBpZWNlLnByb21vdGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zdCBuYiA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKG5iIDwgNTcpIGNvbCArPSBuYiAtIDQ4O1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICArK2NvbDtcbiAgICAgICAgICBjb25zdCByb2xlID0gYy50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIHBpZWNlc1twb3Mya2V5KFtjb2wsIHJvd10pXSA9IHtcbiAgICAgICAgICAgIHJvbGU6IHJvbGVzW3JvbGVdLFxuICAgICAgICAgICAgY29sb3I6IChjID09PSByb2xlID8gJ2JsYWNrJyA6ICd3aGl0ZScpIGFzIGNnLkNvbG9yXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGllY2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGUocGllY2VzOiBjZy5QaWVjZXMpOiBjZy5GRU4ge1xuICByZXR1cm4gaW52UmFua3MubWFwKHkgPT4gY2cucmFua3MubWFwKHggPT4ge1xuICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXNbcG9zMmtleShbeCwgeV0pXTtcbiAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICBjb25zdCBsZXR0ZXIgPSBsZXR0ZXJzW3BpZWNlLnJvbGVdO1xuICAgICAgICByZXR1cm4gcGllY2UuY29sb3IgPT09ICd3aGl0ZScgPyBsZXR0ZXIudG9VcHBlckNhc2UoKSA6IGxldHRlcjtcbiAgICAgIH0gZWxzZSByZXR1cm4gJzEnO1xuICAgIH0pLmpvaW4oJycpXG4gICkuam9pbignLycpLnJlcGxhY2UoLzF7Mix9L2csIHMgPT4gcy5sZW5ndGgudG9TdHJpbmcoKSk7XG59XG4iLCJpbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbnR5cGUgTW9iaWxpdHkgPSAoeDE6bnVtYmVyLCB5MTpudW1iZXIsIHgyOm51bWJlciwgeTI6bnVtYmVyKSA9PiBib29sZWFuO1xuXG5mdW5jdGlvbiBkaWZmKGE6IG51bWJlciwgYjpudW1iZXIpOm51bWJlciB7XG4gIHJldHVybiBNYXRoLmFicyhhIC0gYik7XG59XG5cbmZ1bmN0aW9uIHBhd24oY29sb3I6IGNnLkNvbG9yKTogTW9iaWxpdHkge1xuICByZXR1cm4gKHgxLCB5MSwgeDIsIHkyKSA9PiBkaWZmKHgxLCB4MikgPCAyICYmIChcbiAgICBjb2xvciA9PT0gJ3doaXRlJyA/IChcbiAgICAgIC8vIGFsbG93IDIgc3F1YXJlcyBmcm9tIDEgYW5kIDgsIGZvciBob3JkZVxuICAgICAgeTIgPT09IHkxICsgMSB8fCAoeTEgPD0gMiAmJiB5MiA9PT0gKHkxICsgMikgJiYgeDEgPT09IHgyKVxuICAgICkgOiAoXG4gICAgICB5MiA9PT0geTEgLSAxIHx8ICh5MSA+PSA3ICYmIHkyID09PSAoeTEgLSAyKSAmJiB4MSA9PT0geDIpXG4gICAgKVxuICApO1xufVxuXG5jb25zdCBrbmlnaHQ6IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIGNvbnN0IHhkID0gZGlmZih4MSwgeDIpO1xuICBjb25zdCB5ZCA9IGRpZmYoeTEsIHkyKTtcbiAgcmV0dXJuICh4ZCA9PT0gMSAmJiB5ZCA9PT0gMikgfHwgKHhkID09PSAyICYmIHlkID09PSAxKTtcbn1cblxuY29uc3QgYmlzaG9wOiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICByZXR1cm4gZGlmZih4MSwgeDIpID09PSBkaWZmKHkxLCB5Mik7XG59XG5cbmNvbnN0IHJvb2s6IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIHJldHVybiB4MSA9PT0geDIgfHwgeTEgPT09IHkyO1xufVxuXG5jb25zdCBxdWVlbjogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgcmV0dXJuIGJpc2hvcCh4MSwgeTEsIHgyLCB5MikgfHwgcm9vayh4MSwgeTEsIHgyLCB5Mik7XG59XG5cbmZ1bmN0aW9uIGtpbmcoY29sb3I6IGNnLkNvbG9yLCByb29rRmlsZXM6IG51bWJlcltdLCBjYW5DYXN0bGU6IGJvb2xlYW4pOiBNb2JpbGl0eSB7XG4gIHJldHVybiAoeDEsIHkxLCB4MiwgeTIpICA9PiAoXG4gICAgZGlmZih4MSwgeDIpIDwgMiAmJiBkaWZmKHkxLCB5MikgPCAyXG4gICkgfHwgKFxuICAgIGNhbkNhc3RsZSAmJiB5MSA9PT0geTIgJiYgeTEgPT09IChjb2xvciA9PT0gJ3doaXRlJyA/IDEgOiA4KSAmJiAoXG4gICAgICAoeDEgPT09IDUgJiYgKCh1dGlsLmNvbnRhaW5zWChyb29rRmlsZXMsIDEpICYmIHgyID09PSAzKSB8fCAodXRpbC5jb250YWluc1gocm9va0ZpbGVzLCA4KSAmJiB4MiA9PT0gNykpKSB8fFxuICAgICAgdXRpbC5jb250YWluc1gocm9va0ZpbGVzLCB4MilcbiAgICApXG4gICk7XG59XG5cbmZ1bmN0aW9uIHJvb2tGaWxlc09mKHBpZWNlczogY2cuUGllY2VzLCBjb2xvcjogY2cuQ29sb3IpIHtcbiAgY29uc3QgYmFja3JhbmsgPSBjb2xvciA9PSAnd2hpdGUnID8gJzEnIDogJzgnO1xuICByZXR1cm4gT2JqZWN0LmtleXMocGllY2VzKS5maWx0ZXIoa2V5ID0+IHtcbiAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1trZXldO1xuICAgIHJldHVybiBrZXlbMV0gPT09IGJhY2tyYW5rICYmIHBpZWNlICYmIHBpZWNlLmNvbG9yID09PSBjb2xvciAmJiBwaWVjZS5yb2xlID09PSAncm9vayc7XG4gIH0pLm1hcCgoa2V5OiBzdHJpbmcgKSA9PiB1dGlsLmtleTJwb3Moa2V5IGFzIGNnLktleSlbMF0pO1xufVxuXG5jb25zdCBhbGxQb3MgPSB1dGlsLmFsbEtleXMubWFwKHV0aWwua2V5MnBvcyk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHByZW1vdmUocGllY2VzOiBjZy5QaWVjZXMsIGtleTogY2cuS2V5LCBjYW5DYXN0bGU6IGJvb2xlYW4pOiBjZy5LZXlbXSB7XG4gIGNvbnN0IHBpZWNlID0gcGllY2VzW2tleV0hLFxuICAgIHBvcyA9IHV0aWwua2V5MnBvcyhrZXkpLFxuICAgIHIgPSBwaWVjZS5yb2xlLFxuICAgIG1vYmlsaXR5OiBNb2JpbGl0eSA9IHIgPT09ICdwYXduJyA/IHBhd24ocGllY2UuY29sb3IpIDogKFxuICAgICAgciA9PT0gJ2tuaWdodCcgPyBrbmlnaHQgOiAoXG4gICAgICAgIHIgPT09ICdiaXNob3AnID8gYmlzaG9wIDogKFxuICAgICAgICAgIHIgPT09ICdyb29rJyA/IHJvb2sgOiAoXG4gICAgICAgICAgICByID09PSAncXVlZW4nID8gcXVlZW4gOiBraW5nKHBpZWNlLmNvbG9yLCByb29rRmlsZXNPZihwaWVjZXMsIHBpZWNlLmNvbG9yKSwgY2FuQ2FzdGxlKVxuICAgICAgICAgICkpKSk7XG4gIHJldHVybiBhbGxQb3MuZmlsdGVyKHBvczIgPT5cbiAgICAocG9zWzBdICE9PSBwb3MyWzBdIHx8IHBvc1sxXSAhPT0gcG9zMlsxXSkgJiYgbW9iaWxpdHkocG9zWzBdLCBwb3NbMV0sIHBvczJbMF0sIHBvczJbMV0pXG4gICkubWFwKHV0aWwucG9zMmtleSk7XG59O1xuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsga2V5MnBvcywgY3JlYXRlRWwgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyB3aGl0ZVBvdiB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IEFuaW1DdXJyZW50LCBBbmltVmVjdG9ycywgQW5pbVZlY3RvciwgQW5pbUZhZGluZ3MgfSBmcm9tICcuL2FuaW0nXG5pbXBvcnQgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZydcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbi8vIGAkY29sb3IgJHJvbGVgXG50eXBlIFBpZWNlTmFtZSA9IHN0cmluZztcblxuaW50ZXJmYWNlIFNhbWVQaWVjZXMgeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH1cbmludGVyZmFjZSBTYW1lU3F1YXJlcyB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfVxuaW50ZXJmYWNlIE1vdmVkUGllY2VzIHsgW3BpZWNlTmFtZTogc3RyaW5nXTogY2cuUGllY2VOb2RlW10gfVxuaW50ZXJmYWNlIE1vdmVkU3F1YXJlcyB7IFtjbGFzc05hbWU6IHN0cmluZ106IGNnLlNxdWFyZU5vZGVbXSB9XG5pbnRlcmZhY2UgU3F1YXJlQ2xhc3NlcyB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9XG5cbi8vIHBvcnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWxvY2UvbGljaG9iaWxlL2Jsb2IvbWFzdGVyL3NyYy9qcy9jaGVzc2dyb3VuZC92aWV3LmpzXG4vLyBpbiBjYXNlIG9mIGJ1Z3MsIGJsYW1lIEB2ZWxvY2VcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlcihzOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBhc1doaXRlOiBib29sZWFuID0gd2hpdGVQb3YocyksXG4gIHBvc1RvVHJhbnNsYXRlID0gcy5kb20ucmVsYXRpdmUgPyB1dGlsLnBvc1RvVHJhbnNsYXRlUmVsIDogdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhzLmRvbS5ib3VuZHMoKSksXG4gIHRyYW5zbGF0ZSA9IHMuZG9tLnJlbGF0aXZlID8gdXRpbC50cmFuc2xhdGVSZWwgOiB1dGlsLnRyYW5zbGF0ZUFicyxcbiAgYm9hcmRFbDogSFRNTEVsZW1lbnQgPSBzLmRvbS5lbGVtZW50cy5ib2FyZCxcbiAgcGllY2VzOiBjZy5QaWVjZXMgPSBzLnBpZWNlcyxcbiAgY3VyQW5pbTogQW5pbUN1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmFuaW1hdGlvbi5jdXJyZW50LFxuICBhbmltczogQW5pbVZlY3RvcnMgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmFuaW1zIDoge30sXG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5mYWRpbmdzIDoge30sXG4gIGN1ckRyYWc6IERyYWdDdXJyZW50IHwgdW5kZWZpbmVkID0gcy5kcmFnZ2FibGUuY3VycmVudCxcbiAgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IGNvbXB1dGVTcXVhcmVDbGFzc2VzKHMpLFxuICBzYW1lUGllY2VzOiBTYW1lUGllY2VzID0ge30sXG4gIHNhbWVTcXVhcmVzOiBTYW1lU3F1YXJlcyA9IHt9LFxuICBtb3ZlZFBpZWNlczogTW92ZWRQaWVjZXMgPSB7fSxcbiAgbW92ZWRTcXVhcmVzOiBNb3ZlZFNxdWFyZXMgPSB7fSxcbiAgcGllY2VzS2V5czogY2cuS2V5W10gPSBPYmplY3Qua2V5cyhwaWVjZXMpIGFzIGNnLktleVtdO1xuICBsZXQgazogY2cuS2V5LFxuICBwOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgZWw6IGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGUsXG4gIHBpZWNlQXRLZXk6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICBlbFBpZWNlTmFtZTogUGllY2VOYW1lLFxuICBhbmltOiBBbmltVmVjdG9yIHwgdW5kZWZpbmVkLFxuICBmYWRpbmc6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICBwTXZkc2V0OiBjZy5QaWVjZU5vZGVbXSxcbiAgcE12ZDogY2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkLFxuICBzTXZkc2V0OiBjZy5TcXVhcmVOb2RlW10sXG4gIHNNdmQ6IGNnLlNxdWFyZU5vZGUgfCB1bmRlZmluZWQ7XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBib2FyZCBkb20gZWxlbWVudHMsIGFwcGx5IGFuaW1hdGlvbnMgYW5kIGZsYWcgbW92ZWQgcGllY2VzXG4gIGVsID0gYm9hcmRFbC5maXJzdENoaWxkIGFzIGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGU7XG4gIHdoaWxlIChlbCkge1xuICAgIGsgPSBlbC5jZ0tleTtcbiAgICBpZiAoaXNQaWVjZU5vZGUoZWwpKSB7XG4gICAgICBwaWVjZUF0S2V5ID0gcGllY2VzW2tdO1xuICAgICAgYW5pbSA9IGFuaW1zW2tdO1xuICAgICAgZmFkaW5nID0gZmFkaW5nc1trXTtcbiAgICAgIGVsUGllY2VOYW1lID0gZWwuY2dQaWVjZTtcbiAgICAgIC8vIGlmIHBpZWNlIG5vdCBiZWluZyBkcmFnZ2VkIGFueW1vcmUsIHJlbW92ZSBkcmFnZ2luZyBzdHlsZVxuICAgICAgaWYgKGVsLmNnRHJhZ2dpbmcgJiYgKCFjdXJEcmFnIHx8IGN1ckRyYWcub3JpZyAhPT0gaykpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ2dpbmcnKTtcbiAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1doaXRlKSk7XG4gICAgICAgIGVsLmNnRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIHJlbW92ZSBmYWRpbmcgY2xhc3MgaWYgaXQgc3RpbGwgcmVtYWluc1xuICAgICAgaWYgKCFmYWRpbmcgJiYgZWwuY2dGYWRpbmcpIHtcbiAgICAgICAgZWwuY2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICB9XG4gICAgICAvLyB0aGVyZSBpcyBub3cgYSBwaWVjZSBhdCB0aGlzIGRvbSBrZXlcbiAgICAgIGlmIChwaWVjZUF0S2V5KSB7XG4gICAgICAgIC8vIGNvbnRpbnVlIGFuaW1hdGlvbiBpZiBhbHJlYWR5IGFuaW1hdGluZyBhbmQgc2FtZSBwaWVjZVxuICAgICAgICAvLyAob3RoZXJ3aXNlIGl0IGNvdWxkIGFuaW1hdGUgYSBjYXB0dXJlZCBwaWVjZSlcbiAgICAgICAgaWYgKGFuaW0gJiYgZWwuY2dBbmltYXRpbmcgJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpKSB7XG4gICAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5jZ0FuaW1hdGluZykge1xuICAgICAgICAgIGVsLmNnQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbScpO1xuICAgICAgICAgIHRyYW5zbGF0ZShlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhrKSwgYXNXaGl0ZSkpO1xuICAgICAgICAgIGlmIChzLmFkZFBpZWNlWkluZGV4KSBlbC5zdHlsZS56SW5kZXggPSBwb3NaSW5kZXgoa2V5MnBvcyhrKSwgYXNXaGl0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2FtZSBwaWVjZTogZmxhZyBhcyBzYW1lXG4gICAgICAgIGlmIChlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkgJiYgKCFmYWRpbmcgfHwgIWVsLmNnRmFkaW5nKSkge1xuICAgICAgICAgIHNhbWVQaWVjZXNba10gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRpZmZlcmVudCBwaWVjZTogZmxhZyBhcyBtb3ZlZCB1bmxlc3MgaXQgaXMgYSBmYWRpbmcgcGllY2VcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGZhZGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YoZmFkaW5nKSkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZmFkaW5nJyk7XG4gICAgICAgICAgICBlbC5jZ0ZhZGluZyA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0pIG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXS5wdXNoKGVsKTtcbiAgICAgICAgICAgIGVsc2UgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdID0gW2VsXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIG5vIHBpZWNlOiBmbGFnIGFzIG1vdmVkXG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSkgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdLnB1c2goZWwpO1xuICAgICAgICBlbHNlIG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSA9IFtlbF07XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzU3F1YXJlTm9kZShlbCkpIHtcbiAgICAgIGNvbnN0IGNuID0gZWwuY2xhc3NOYW1lO1xuICAgICAgaWYgKHNxdWFyZXNba10gPT09IGNuKSBzYW1lU3F1YXJlc1trXSA9IHRydWU7XG4gICAgICBlbHNlIGlmIChtb3ZlZFNxdWFyZXNbY25dKSBtb3ZlZFNxdWFyZXNbY25dLnB1c2goZWwpO1xuICAgICAgZWxzZSBtb3ZlZFNxdWFyZXNbY25dID0gW2VsXTtcbiAgICB9XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlO1xuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBzcXVhcmVzIGluIGN1cnJlbnQgc2V0LCBhcHBseSBkb20gY2hhbmdlcyB0byBtb3ZlZCBzcXVhcmVzXG4gIC8vIG9yIGFwcGVuZCBuZXcgc3F1YXJlc1xuICBmb3IgKGNvbnN0IHNrIGluIHNxdWFyZXMpIHtcbiAgICBpZiAoIXNhbWVTcXVhcmVzW3NrXSkge1xuICAgICAgc012ZHNldCA9IG1vdmVkU3F1YXJlc1tzcXVhcmVzW3NrXV07XG4gICAgICBzTXZkID0gc012ZHNldCAmJiBzTXZkc2V0LnBvcCgpO1xuICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKHNrIGFzIGNnLktleSksIGFzV2hpdGUpO1xuICAgICAgaWYgKHNNdmQpIHtcbiAgICAgICAgc012ZC5jZ0tleSA9IHNrIGFzIGNnLktleTtcbiAgICAgICAgdHJhbnNsYXRlKHNNdmQsIHRyYW5zbGF0aW9uKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBzcXVhcmVOb2RlID0gY3JlYXRlRWwoJ3NxdWFyZScsIHNxdWFyZXNbc2tdKSBhcyBjZy5TcXVhcmVOb2RlO1xuICAgICAgICBzcXVhcmVOb2RlLmNnS2V5ID0gc2sgYXMgY2cuS2V5O1xuICAgICAgICB0cmFuc2xhdGUoc3F1YXJlTm9kZSwgdHJhbnNsYXRpb24pO1xuICAgICAgICBib2FyZEVsLmluc2VydEJlZm9yZShzcXVhcmVOb2RlLCBib2FyZEVsLmZpcnN0Q2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgcGllY2VzIGluIGN1cnJlbnQgc2V0LCBhcHBseSBkb20gY2hhbmdlcyB0byBtb3ZlZCBwaWVjZXNcbiAgLy8gb3IgYXBwZW5kIG5ldyBwaWVjZXNcbiAgZm9yIChjb25zdCBqIGluIHBpZWNlc0tleXMpIHtcbiAgICBrID0gcGllY2VzS2V5c1tqXTtcbiAgICBwID0gcGllY2VzW2tdITtcbiAgICBhbmltID0gYW5pbXNba107XG4gICAgaWYgKCFzYW1lUGllY2VzW2tdKSB7XG4gICAgICBwTXZkc2V0ID0gbW92ZWRQaWVjZXNbcGllY2VOYW1lT2YocCldO1xuICAgICAgcE12ZCA9IHBNdmRzZXQgJiYgcE12ZHNldC5wb3AoKTtcbiAgICAgIC8vIGEgc2FtZSBwaWVjZSB3YXMgbW92ZWRcbiAgICAgIGlmIChwTXZkKSB7XG4gICAgICAgIC8vIGFwcGx5IGRvbSBjaGFuZ2VzXG4gICAgICAgIHBNdmQuY2dLZXkgPSBrO1xuICAgICAgICBpZiAocE12ZC5jZ0ZhZGluZykge1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICAgICAgcE12ZC5jZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgIGlmIChzLmFkZFBpZWNlWkluZGV4KSBwTXZkLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChwb3MsIGFzV2hpdGUpO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBNdmQuY2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZShwTXZkLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcbiAgICAgIH1cbiAgICAgIC8vIG5vIHBpZWNlIGluIG1vdmVkIG9iajogaW5zZXJ0IHRoZSBuZXcgcGllY2VcbiAgICAgIC8vIGFzc3VtZXMgdGhlIG5ldyBwaWVjZSBpcyBub3QgYmVpbmcgZHJhZ2dlZFxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgY29uc3QgcGllY2VOYW1lID0gcGllY2VOYW1lT2YocCksXG4gICAgICAgIHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZSkgYXMgY2cuUGllY2VOb2RlLFxuICAgICAgICBwb3MgPSBrZXkycG9zKGspO1xuXG4gICAgICAgIHBpZWNlTm9kZS5jZ1BpZWNlID0gcGllY2VOYW1lO1xuICAgICAgICBwaWVjZU5vZGUuY2dLZXkgPSBrO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgIHBpZWNlTm9kZS5jZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlKHBpZWNlTm9kZSwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1doaXRlKSk7XG5cbiAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIHBpZWNlTm9kZS5zdHlsZS56SW5kZXggPSBwb3NaSW5kZXgocG9zLCBhc1doaXRlKTtcblxuICAgICAgICBib2FyZEVsLmFwcGVuZENoaWxkKHBpZWNlTm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVtb3ZlIGFueSBlbGVtZW50IHRoYXQgcmVtYWlucyBpbiB0aGUgbW92ZWQgc2V0c1xuICBmb3IgKGNvbnN0IGkgaW4gbW92ZWRQaWVjZXMpIHJlbW92ZU5vZGVzKHMsIG1vdmVkUGllY2VzW2ldKTtcbiAgZm9yIChjb25zdCBpIGluIG1vdmVkU3F1YXJlcykgcmVtb3ZlTm9kZXMocywgbW92ZWRTcXVhcmVzW2ldKTtcbn1cblxuZnVuY3Rpb24gaXNQaWVjZU5vZGUoZWw6IGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGUpOiBlbCBpcyBjZy5QaWVjZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1BJRUNFJztcbn1cbmZ1bmN0aW9uIGlzU3F1YXJlTm9kZShlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSk6IGVsIGlzIGNnLlNxdWFyZU5vZGUge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1NRVUFSRSc7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGVzKHM6IFN0YXRlLCBub2RlczogSFRNTEVsZW1lbnRbXSk6IHZvaWQge1xuICBmb3IgKGNvbnN0IGkgaW4gbm9kZXMpIHMuZG9tLmVsZW1lbnRzLmJvYXJkLnJlbW92ZUNoaWxkKG5vZGVzW2ldKTtcbn1cblxuZnVuY3Rpb24gcG9zWkluZGV4KHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKTogc3RyaW5nIHtcbiAgbGV0IHogPSAyICsgKHBvc1sxXSAtIDEpICogOCArICg4IC0gcG9zWzBdKTtcbiAgaWYgKGFzV2hpdGUpIHogPSA2NyAtIHo7XG4gIHJldHVybiB6ICsgJyc7XG59XG5cbmZ1bmN0aW9uIHBpZWNlTmFtZU9mKHBpZWNlOiBjZy5QaWVjZSk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVDbGFzc2VzKHM6IFN0YXRlKTogU3F1YXJlQ2xhc3NlcyB7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSB7fTtcbiAgbGV0IGk6IGFueSwgazogY2cuS2V5O1xuICBpZiAocy5sYXN0TW92ZSAmJiBzLmhpZ2hsaWdodC5sYXN0TW92ZSkgZm9yIChpIGluIHMubGFzdE1vdmUpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5sYXN0TW92ZVtpXSwgJ2xhc3QtbW92ZScpO1xuICB9XG4gIGlmIChzLmNoZWNrICYmIHMuaGlnaGxpZ2h0LmNoZWNrKSBhZGRTcXVhcmUoc3F1YXJlcywgcy5jaGVjaywgJ2NoZWNrJyk7XG4gIGlmIChzLnNlbGVjdGVkKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMuc2VsZWN0ZWQsICdzZWxlY3RlZCcpO1xuICAgIGlmIChzLm1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICBjb25zdCBkZXN0cyA9IHMubW92YWJsZS5kZXN0cyAmJiBzLm1vdmFibGUuZGVzdHNbcy5zZWxlY3RlZF07XG4gICAgICBpZiAoZGVzdHMpIGZvciAoaSBpbiBkZXN0cykge1xuICAgICAgICBrID0gZGVzdHNbaV07XG4gICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnbW92ZS1kZXN0JyArIChzLnBpZWNlc1trXSA/ICcgb2MnIDogJycpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBEZXN0cyA9IHMucHJlbW92YWJsZS5kZXN0cztcbiAgICAgIGlmIChwRGVzdHMpIGZvciAoaSBpbiBwRGVzdHMpIHtcbiAgICAgICAgayA9IHBEZXN0c1tpXTtcbiAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdwcmVtb3ZlLWRlc3QnICsgKHMucGllY2VzW2tdID8gJyBvYycgOiAnJykpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBjb25zdCBwcmVtb3ZlID0gcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmIChwcmVtb3ZlKSBmb3IgKGkgaW4gcHJlbW92ZSkgYWRkU3F1YXJlKHNxdWFyZXMsIHByZW1vdmVbaV0sICdjdXJyZW50LXByZW1vdmUnKTtcbiAgZWxzZSBpZiAocy5wcmVkcm9wcGFibGUuY3VycmVudCkgYWRkU3F1YXJlKHNxdWFyZXMsIHMucHJlZHJvcHBhYmxlLmN1cnJlbnQua2V5LCAnY3VycmVudC1wcmVtb3ZlJyk7XG5cbiAgY29uc3QgbyA9IHMuZXhwbG9kaW5nO1xuICBpZiAobykgZm9yIChpIGluIG8ua2V5cykgYWRkU3F1YXJlKHNxdWFyZXMsIG8ua2V5c1tpXSwgJ2V4cGxvZGluZycgKyBvLnN0YWdlKTtcblxuICByZXR1cm4gc3F1YXJlcztcbn1cblxuZnVuY3Rpb24gYWRkU3F1YXJlKHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMsIGtleTogY2cuS2V5LCBrbGFzczogc3RyaW5nKTogdm9pZCB7XG4gIGlmIChzcXVhcmVzW2tleV0pIHNxdWFyZXNba2V5XSArPSAnICcgKyBrbGFzcztcbiAgZWxzZSBzcXVhcmVzW2tleV0gPSBrbGFzcztcbn1cbiIsImltcG9ydCAqIGFzIGZlbiBmcm9tICcuL2ZlbidcbmltcG9ydCB7IEFuaW1DdXJyZW50IH0gZnJvbSAnLi9hbmltJ1xuaW1wb3J0IHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcnXG5pbXBvcnQgeyBEcmF3YWJsZSB9IGZyb20gJy4vZHJhdydcbmltcG9ydCB7IHRpbWVyIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGUge1xuICBwaWVjZXM6IGNnLlBpZWNlcztcbiAgb3JpZW50YXRpb246IGNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gd2hpdGUgfCBibGFja1xuICB0dXJuQ29sb3I6IGNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHdoaXRlIHwgYmxhY2tcbiAgY2hlY2s/OiBjZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgaW4gY2hlY2sgXCJhMlwiXG4gIGxhc3RNb3ZlPzogY2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIFtcImMzXCI7IFwiYzRcIl1cbiAgc2VsZWN0ZWQ/OiBjZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCJhMVwiXG4gIGNvb3JkaW5hdGVzOiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gIGF1dG9DYXN0bGU6IGJvb2xlYW47IC8vIGltbWVkaWF0ZWx5IGNvbXBsZXRlIHRoZSBjYXN0bGUgYnkgbW92aW5nIHRoZSByb29rIGFmdGVyIGtpbmcgbW92ZVxuICB2aWV3T25seTogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgZGlzYWJsZUNvbnRleHRNZW51OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGNoZXNzYm9hcmRcbiAgcmVzaXphYmxlOiBib29sZWFuOyAvLyBsaXN0ZW5zIHRvIGNoZXNzZ3JvdW5kLnJlc2l6ZSBvbiBkb2N1bWVudC5ib2R5IHRvIGNsZWFyIGJvdW5kcyBjYWNoZVxuICBhZGRQaWVjZVpJbmRleDogYm9vbGVhbjsgLy8gYWRkcyB6LWluZGV4IHZhbHVlcyB0byBwaWVjZXMgKGZvciAzRClcbiAgcGllY2VLZXk6IGJvb2xlYW47IC8vIGFkZCBhIGRhdGEta2V5IGF0dHJpYnV0ZSB0byBwaWVjZSBlbGVtZW50c1xuICBoaWdobGlnaHQ6IHtcbiAgICBsYXN0TW92ZTogYm9vbGVhbjsgLy8gYWRkIGxhc3QtbW92ZSBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2s6IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbjoge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgZHVyYXRpb246IG51bWJlcjtcbiAgICBjdXJyZW50PzogQW5pbUN1cnJlbnQ7XG4gIH07XG4gIG1vdmFibGU6IHtcbiAgICBmcmVlOiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgY29sb3I/OiBjZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZS4gd2hpdGUgfCBibGFjayB8IGJvdGhcbiAgICBkZXN0cz86IGNnLkRlc3RzOyAvLyB2YWxpZCBtb3Zlcy4ge1wiYTJcIiBbXCJhM1wiIFwiYTRcIl0gXCJiMVwiIFtcImEzXCIgXCJjM1wiXX1cbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50czoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICAgIGFmdGVyTmV3UGllY2U/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciBhIG5ldyBwaWVjZSBpcyBkcm9wcGVkIG9uIHRoZSBib2FyZFxuICAgIH07XG4gICAgcm9va0Nhc3RsZTogYm9vbGVhbiAvLyBjYXN0bGUgYnkgbW92aW5nIHRoZSBraW5nIHRvIHRoZSByb29rXG4gIH07XG4gIHByZW1vdmFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmVtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGNhc3RsZTogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhbGxvdyBraW5nIGNhc3RsZSBwcmVtb3Zlc1xuICAgIGRlc3RzPzogY2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBjdXJyZW50PzogY2cuS2V5UGFpcjsgLy8ga2V5cyBvZiB0aGUgY3VycmVudCBzYXZlZCBwcmVtb3ZlIFtcImUyXCIgXCJlNFwiXVxuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YT86IGNnLlNldFByZW1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBwcmVkcm9wcGFibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBjdXJyZW50PzogeyAvLyBjdXJyZW50IHNhdmVkIHByZWRyb3Age3JvbGU6ICdrbmlnaHQnOyBrZXk6ICdlNCd9XG4gICAgICByb2xlOiBjZy5Sb2xlO1xuICAgICAga2V5OiBjZy5LZXlcbiAgICB9O1xuICAgIGV2ZW50czoge1xuICAgICAgc2V0PzogKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgZHJhZ2dhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZTogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlOiBib29sZWFuOyAvLyBsZXRzIGNoZXNzZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBjZW50ZXJQaWVjZTogYm9vbGVhbjsgLy8gY2VudGVyIHRoZSBwaWVjZSBvbiBjdXJzb3IgYXQgZHJhZyBzdGFydFxuICAgIHNob3dHaG9zdDogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgZGVsZXRlT25Ecm9wT2ZmOiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZFxuICAgIGN1cnJlbnQ/OiBEcmFnQ3VycmVudDtcbiAgfTtcbiAgZHJvcG1vZGU6IHtcbiAgICBhY3RpdmU6IGJvb2xlYW47XG4gICAgcGllY2U/OiBjZy5QaWVjZTtcbiAgfVxuICBzZWxlY3RhYmxlOiB7XG4gICAgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGVuYWJsZWQ6IGJvb2xlYW5cbiAgfTtcbiAgc3RhdHM6IHtcbiAgICAvLyB3YXMgbGFzdCBwaWVjZSBkcmFnZ2VkIG9yIGNsaWNrZWQ/XG4gICAgLy8gbmVlZHMgZGVmYXVsdCB0byBmYWxzZSBmb3IgdG91Y2hcbiAgICBkcmFnZ2VkOiBib29sZWFuLFxuICAgIGN0cmxLZXk/OiBib29sZWFuXG4gIH07XG4gIGV2ZW50czoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgLy8gY2FsbGVkIGFmdGVyIGEgcGllY2UgaGFzIGJlZW4gbW92ZWQuXG4gICAgLy8gY2FwdHVyZWRQaWVjZSBpcyB1bmRlZmluZWQgb3IgbGlrZSB7Y29sb3I6ICd3aGl0ZSc7ICdyb2xlJzogJ3F1ZWVuJ31cbiAgICBtb3ZlPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBjYXB0dXJlZFBpZWNlPzogY2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcE5ld1BpZWNlPzogKHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogY2cuS2V5KSA9PiB2b2lkIC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgaW5zZXJ0PzogKGVsZW1lbnRzOiBjZy5FbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZTogRHJhd2FibGUsXG4gIGV4cGxvZGluZz86IGNnLkV4cGxvZGluZztcbiAgZG9tOiBjZy5Eb20sXG4gIGhvbGQ6IGNnLlRpbWVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0cygpOiBQYXJ0aWFsPFN0YXRlPiB7XG4gIHJldHVybiB7XG4gICAgcGllY2VzOiBmZW4ucmVhZChmZW4uaW5pdGlhbCksXG4gICAgb3JpZW50YXRpb246ICd3aGl0ZScsXG4gICAgdHVybkNvbG9yOiAnd2hpdGUnLFxuICAgIGNvb3JkaW5hdGVzOiB0cnVlLFxuICAgIGF1dG9DYXN0bGU6IHRydWUsXG4gICAgdmlld09ubHk6IGZhbHNlLFxuICAgIGRpc2FibGVDb250ZXh0TWVudTogZmFsc2UsXG4gICAgcmVzaXphYmxlOiB0cnVlLFxuICAgIGFkZFBpZWNlWkluZGV4OiBmYWxzZSxcbiAgICBwaWVjZUtleTogZmFsc2UsXG4gICAgaGlnaGxpZ2h0OiB7XG4gICAgICBsYXN0TW92ZTogdHJ1ZSxcbiAgICAgIGNoZWNrOiB0cnVlXG4gICAgfSxcbiAgICBhbmltYXRpb246IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBkdXJhdGlvbjogMjAwXG4gICAgfSxcbiAgICBtb3ZhYmxlOiB7XG4gICAgICBmcmVlOiB0cnVlLFxuICAgICAgY29sb3I6ICdib3RoJyxcbiAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgIGV2ZW50czoge30sXG4gICAgICByb29rQ2FzdGxlOiB0cnVlXG4gICAgfSxcbiAgICBwcmVtb3ZhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgc2hvd0Rlc3RzOiB0cnVlLFxuICAgICAgY2FzdGxlOiB0cnVlLFxuICAgICAgZXZlbnRzOiB7fVxuICAgIH0sXG4gICAgcHJlZHJvcHBhYmxlOiB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIGV2ZW50czoge31cbiAgICB9LFxuICAgIGRyYWdnYWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGRpc3RhbmNlOiAzLFxuICAgICAgYXV0b0Rpc3RhbmNlOiB0cnVlLFxuICAgICAgY2VudGVyUGllY2U6IHRydWUsXG4gICAgICBzaG93R2hvc3Q6IHRydWUsXG4gICAgICBkZWxldGVPbkRyb3BPZmY6IGZhbHNlXG4gICAgfSxcbiAgICBkcm9wbW9kZToge1xuICAgICAgYWN0aXZlOiBmYWxzZVxuICAgIH0sXG4gICAgc2VsZWN0YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZVxuICAgIH0sXG4gICAgc3RhdHM6IHtcbiAgICAgIC8vIG9uIHRvdWNoc2NyZWVuLCBkZWZhdWx0IHRvIFwidGFwLXRhcFwiIG1vdmVzXG4gICAgICAvLyBpbnN0ZWFkIG9mIGRyYWdcbiAgICAgIGRyYWdnZWQ6ICEoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KVxuICAgIH0sXG4gICAgZXZlbnRzOiB7fSxcbiAgICBkcmF3YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSwgLy8gY2FuIGRyYXdcbiAgICAgIHZpc2libGU6IHRydWUsIC8vIGNhbiB2aWV3XG4gICAgICBlcmFzZU9uQ2xpY2s6IHRydWUsXG4gICAgICBzaGFwZXM6IFtdLFxuICAgICAgYXV0b1NoYXBlczogW10sXG4gICAgICBicnVzaGVzOiB7XG4gICAgICAgIGdyZWVuOiB7IGtleTogJ2cnLCBjb2xvcjogJyMxNTc4MUInLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIHJlZDogeyBrZXk6ICdyJywgY29sb3I6ICcjODgyMDIwJywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICBibHVlOiB7IGtleTogJ2InLCBjb2xvcjogJyMwMDMwODgnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIHllbGxvdzogeyBrZXk6ICd5JywgY29sb3I6ICcjZTY4ZjAwJywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICBwYWxlQmx1ZTogeyBrZXk6ICdwYicsIGNvbG9yOiAnIzAwMzA4OCcsIG9wYWNpdHk6IDAuNCwgbGluZVdpZHRoOiAxNSB9LFxuICAgICAgICBwYWxlR3JlZW46IHsga2V5OiAncGcnLCBjb2xvcjogJyMxNTc4MUInLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZVJlZDogeyBrZXk6ICdwcicsIGNvbG9yOiAnIzg4MjAyMCcsIG9wYWNpdHk6IDAuNCwgbGluZVdpZHRoOiAxNSB9LFxuICAgICAgICBwYWxlR3JleTogeyBrZXk6ICdwZ3InLCBjb2xvcjogJyM0YTRhNGEnLCBvcGFjaXR5OiAwLjM1LCBsaW5lV2lkdGg6IDE1IH1cbiAgICAgIH0sXG4gICAgICBwaWVjZXM6IHtcbiAgICAgICAgYmFzZVVybDogJ2h0dHBzOi8vbGljaGVzczEub3JnL2Fzc2V0cy9waWVjZS9jYnVybmV0dC8nXG4gICAgICB9LFxuICAgICAgcHJldlN2Z0hhc2g6ICcnXG4gICAgfSxcbiAgICBob2xkOiB0aW1lcigpXG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBrZXkycG9zIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgRHJhd2FibGUsIERyYXdTaGFwZSwgRHJhd1NoYXBlUGllY2UsIERyYXdCcnVzaCwgRHJhd0JydXNoZXMsIERyYXdNb2RpZmllcnMgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWdOYW1lKTtcbn1cblxuaW50ZXJmYWNlIFNoYXBlIHtcbiAgc2hhcGU6IERyYXdTaGFwZTtcbiAgY3VycmVudDogYm9vbGVhbjtcbiAgaGFzaDogSGFzaDtcbn1cblxuaW50ZXJmYWNlIEN1c3RvbUJydXNoZXMge1xuICBbaGFzaDogc3RyaW5nXTogRHJhd0JydXNoXG59XG5cbmludGVyZmFjZSBBcnJvd0Rlc3RzIHtcbiAgW2tleTogc3RyaW5nXTogbnVtYmVyOyAvLyBob3cgbWFueSBhcnJvd3MgbGFuZCBvbiBhIHNxdWFyZVxufVxuXG50eXBlIEhhc2ggPSBzdHJpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTdmcoc3RhdGU6IFN0YXRlLCByb290OiBTVkdFbGVtZW50KTogdm9pZCB7XG5cbiAgY29uc3QgZCA9IHN0YXRlLmRyYXdhYmxlLFxuICBjdXJEID0gZC5jdXJyZW50LFxuICBjdXIgPSBjdXJEICYmIGN1ckQubW91c2VTcSA/IGN1ckQgYXMgRHJhd1NoYXBlIDogdW5kZWZpbmVkLFxuICBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzID0ge307XG5cbiAgZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pLmZvckVhY2gocyA9PiB7XG4gICAgaWYgKHMuZGVzdCkgYXJyb3dEZXN0c1tzLmRlc3RdID0gKGFycm93RGVzdHNbcy5kZXN0XSB8fCAwKSArIDE7XG4gIH0pO1xuXG4gIGNvbnN0IHNoYXBlczogU2hhcGVbXSA9IGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLm1hcCgoczogRHJhd1NoYXBlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNoYXBlOiBzLFxuICAgICAgY3VycmVudDogZmFsc2UsXG4gICAgICBoYXNoOiBzaGFwZUhhc2gocywgYXJyb3dEZXN0cywgZmFsc2UpXG4gICAgfTtcbiAgfSk7XG4gIGlmIChjdXIpIHNoYXBlcy5wdXNoKHtcbiAgICBzaGFwZTogY3VyLFxuICAgIGN1cnJlbnQ6IHRydWUsXG4gICAgaGFzaDogc2hhcGVIYXNoKGN1ciwgYXJyb3dEZXN0cywgdHJ1ZSlcbiAgfSk7XG5cbiAgY29uc3QgZnVsbEhhc2ggPSBzaGFwZXMubWFwKHNjID0+IHNjLmhhc2gpLmpvaW4oJycpO1xuICBpZiAoZnVsbEhhc2ggPT09IHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gZnVsbEhhc2g7XG5cbiAgY29uc3QgZGVmc0VsID0gcm9vdC5maXJzdENoaWxkIGFzIFNWR0VsZW1lbnQ7XG5cbiAgc3luY0RlZnMoZCwgc2hhcGVzLCBkZWZzRWwpO1xuICBzeW5jU2hhcGVzKHN0YXRlLCBzaGFwZXMsIGQuYnJ1c2hlcywgYXJyb3dEZXN0cywgcm9vdCwgZGVmc0VsKTtcbn1cblxuLy8gYXBwZW5kIG9ubHkuIERvbid0IHRyeSB0byB1cGRhdGUvcmVtb3ZlLlxuZnVuY3Rpb24gc3luY0RlZnMoZDogRHJhd2FibGUsIHNoYXBlczogU2hhcGVbXSwgZGVmc0VsOiBTVkdFbGVtZW50KSB7XG4gIGNvbnN0IGJydXNoZXM6IEN1c3RvbUJydXNoZXMgPSB7fTtcbiAgbGV0IGJydXNoOiBEcmF3QnJ1c2g7XG4gIHNoYXBlcy5mb3JFYWNoKHMgPT4ge1xuICAgIGlmIChzLnNoYXBlLmRlc3QpIHtcbiAgICAgIGJydXNoID0gZC5icnVzaGVzW3Muc2hhcGUuYnJ1c2hdO1xuICAgICAgaWYgKHMuc2hhcGUubW9kaWZpZXJzKSBicnVzaCA9IG1ha2VDdXN0b21CcnVzaChicnVzaCwgcy5zaGFwZS5tb2RpZmllcnMpO1xuICAgICAgYnJ1c2hlc1ticnVzaC5rZXldID0gYnJ1c2g7XG4gICAgfVxuICB9KTtcbiAgY29uc3Qga2V5c0luRG9tOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSB7fTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50ID0gZGVmc0VsLmZpcnN0Q2hpbGQgYXMgU1ZHRWxlbWVudDtcbiAgd2hpbGUoZWwpIHtcbiAgICBrZXlzSW5Eb21bZWwuZ2V0QXR0cmlidXRlKCdjZ0tleScpIGFzIHN0cmluZ10gPSB0cnVlO1xuICAgIGVsID0gZWwubmV4dFNpYmxpbmcgYXMgU1ZHRWxlbWVudDtcbiAgfVxuICBmb3IgKGxldCBrZXkgaW4gYnJ1c2hlcykge1xuICAgIGlmICgha2V5c0luRG9tW2tleV0pIGRlZnNFbC5hcHBlbmRDaGlsZChyZW5kZXJNYXJrZXIoYnJ1c2hlc1trZXldKSk7XG4gIH1cbn1cblxuLy8gYXBwZW5kIGFuZCByZW1vdmUgb25seS4gTm8gdXBkYXRlcy5cbmZ1bmN0aW9uIHN5bmNTaGFwZXMoc3RhdGU6IFN0YXRlLCBzaGFwZXM6IFNoYXBlW10sIGJydXNoZXM6IERyYXdCcnVzaGVzLCBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLCByb290OiBTVkdFbGVtZW50LCBkZWZzRWw6IFNWR0VsZW1lbnQpOiB2b2lkIHtcbiAgY29uc3QgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcygpLFxuICBoYXNoZXNJbkRvbToge1toYXNoOiBzdHJpbmddOiBib29sZWFufSA9IHt9LFxuICB0b1JlbW92ZTogU1ZHRWxlbWVudFtdID0gW107XG4gIHNoYXBlcy5mb3JFYWNoKHNjID0+IHsgaGFzaGVzSW5Eb21bc2MuaGFzaF0gPSBmYWxzZTsgfSk7XG4gIGxldCBlbDogU1ZHRWxlbWVudCA9IGRlZnNFbC5uZXh0U2libGluZyBhcyBTVkdFbGVtZW50LCBlbEhhc2g6IEhhc2g7XG4gIHdoaWxlKGVsKSB7XG4gICAgZWxIYXNoID0gZWwuZ2V0QXR0cmlidXRlKCdjZ0hhc2gnKSBhcyBIYXNoO1xuICAgIC8vIGZvdW5kIGEgc2hhcGUgZWxlbWVudCB0aGF0J3MgaGVyZSB0byBzdGF5XG4gICAgaWYgKGhhc2hlc0luRG9tLmhhc093blByb3BlcnR5KGVsSGFzaCkpIGhhc2hlc0luRG9tW2VsSGFzaF0gPSB0cnVlO1xuICAgIC8vIG9yIHJlbW92ZSBpdFxuICAgIGVsc2UgdG9SZW1vdmUucHVzaChlbCk7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBTVkdFbGVtZW50O1xuICB9XG4gIC8vIHJlbW92ZSBvbGQgc2hhcGVzXG4gIHRvUmVtb3ZlLmZvckVhY2goZWwgPT4gcm9vdC5yZW1vdmVDaGlsZChlbCkpO1xuICAvLyBpbnNlcnQgc2hhcGVzIHRoYXQgYXJlIG5vdCB5ZXQgaW4gZG9tXG4gIHNoYXBlcy5mb3JFYWNoKHNjID0+IHtcbiAgICBpZiAoIWhhc2hlc0luRG9tW3NjLmhhc2hdKSByb290LmFwcGVuZENoaWxkKHJlbmRlclNoYXBlKHN0YXRlLCBzYywgYnJ1c2hlcywgYXJyb3dEZXN0cywgYm91bmRzKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzaGFwZUhhc2goe29yaWcsIGRlc3QsIGJydXNoLCBwaWVjZSwgbW9kaWZpZXJzfTogRHJhd1NoYXBlLCBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLCBjdXJyZW50OiBib29sZWFuKTogSGFzaCB7XG4gIHJldHVybiBbY3VycmVudCwgb3JpZywgZGVzdCwgYnJ1c2gsIGRlc3QgJiYgYXJyb3dEZXN0c1tkZXN0XSA+IDEsXG4gICAgcGllY2UgJiYgcGllY2VIYXNoKHBpZWNlKSxcbiAgICBtb2RpZmllcnMgJiYgbW9kaWZpZXJzSGFzaChtb2RpZmllcnMpXG4gIF0uZmlsdGVyKHggPT4geCkuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlSGFzaChwaWVjZTogRHJhd1NoYXBlUGllY2UpOiBIYXNoIHtcbiAgcmV0dXJuIFtwaWVjZS5jb2xvciwgcGllY2Uucm9sZSwgcGllY2Uuc2NhbGVdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiBtb2RpZmllcnNIYXNoKG06IERyYXdNb2RpZmllcnMpOiBIYXNoIHtcbiAgcmV0dXJuICcnICsgKG0ubGluZVdpZHRoIHx8ICcnKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU2hhcGUoc3RhdGU6IFN0YXRlLCB7c2hhcGUsIGN1cnJlbnQsIGhhc2h9OiBTaGFwZSwgYnJ1c2hlczogRHJhd0JydXNoZXMsIGFycm93RGVzdHM6IEFycm93RGVzdHMsIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBsZXQgZWw6IFNWR0VsZW1lbnQ7XG4gIGlmIChzaGFwZS5waWVjZSkgZWwgPSByZW5kZXJQaWVjZShcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZXMuYmFzZVVybCxcbiAgICBvcmllbnQoa2V5MnBvcyhzaGFwZS5vcmlnKSwgc3RhdGUub3JpZW50YXRpb24pLFxuICAgIHNoYXBlLnBpZWNlLFxuICAgIGJvdW5kcyk7XG4gIGVsc2Uge1xuICAgIGNvbnN0IG9yaWcgPSBvcmllbnQoa2V5MnBvcyhzaGFwZS5vcmlnKSwgc3RhdGUub3JpZW50YXRpb24pO1xuICAgIGlmIChzaGFwZS5vcmlnICYmIHNoYXBlLmRlc3QpIHtcbiAgICAgIGxldCBicnVzaDogRHJhd0JydXNoID0gYnJ1c2hlc1tzaGFwZS5icnVzaF07XG4gICAgICBpZiAoc2hhcGUubW9kaWZpZXJzKSBicnVzaCA9IG1ha2VDdXN0b21CcnVzaChicnVzaCwgc2hhcGUubW9kaWZpZXJzKTtcbiAgICAgIGVsID0gcmVuZGVyQXJyb3coXG4gICAgICAgIGJydXNoLFxuICAgICAgICBvcmlnLFxuICAgICAgICBvcmllbnQoa2V5MnBvcyhzaGFwZS5kZXN0KSwgc3RhdGUub3JpZW50YXRpb24pLFxuICAgICAgICBjdXJyZW50LFxuICAgICAgICBhcnJvd0Rlc3RzW3NoYXBlLmRlc3RdID4gMSxcbiAgICAgICAgYm91bmRzKTtcbiAgICB9XG4gICAgZWxzZSBlbCA9IHJlbmRlckNpcmNsZShicnVzaGVzW3NoYXBlLmJydXNoXSwgb3JpZywgY3VycmVudCwgYm91bmRzKTtcbiAgfVxuICBlbC5zZXRBdHRyaWJ1dGUoJ2NnSGFzaCcsIGhhc2gpO1xuICByZXR1cm4gZWw7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNpcmNsZShicnVzaDogRHJhd0JydXNoLCBwb3M6IGNnLlBvcywgY3VycmVudDogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG8gPSBwb3MycHgocG9zLCBib3VuZHMpLFxuICB3aWR0aHMgPSBjaXJjbGVXaWR0aChib3VuZHMpLFxuICByYWRpdXMgPSAoYm91bmRzLndpZHRoICsgYm91bmRzLmhlaWdodCkgLyAzMjtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnY2lyY2xlJyksIHtcbiAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICdzdHJva2Utd2lkdGgnOiB3aWR0aHNbY3VycmVudCA/IDAgOiAxXSxcbiAgICBmaWxsOiAnbm9uZScsXG4gICAgb3BhY2l0eTogb3BhY2l0eShicnVzaCwgY3VycmVudCksXG4gICAgY3g6IG9bMF0sXG4gICAgY3k6IG9bMV0sXG4gICAgcjogcmFkaXVzIC0gd2lkdGhzWzFdIC8gMlxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQXJyb3coYnJ1c2g6IERyYXdCcnVzaCwgb3JpZzogY2cuUG9zLCBkZXN0OiBjZy5Qb3MsIGN1cnJlbnQ6IGJvb2xlYW4sIHNob3J0ZW46IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBtID0gYXJyb3dNYXJnaW4oYm91bmRzLCBzaG9ydGVuICYmICFjdXJyZW50KSxcbiAgYSA9IHBvczJweChvcmlnLCBib3VuZHMpLFxuICBiID0gcG9zMnB4KGRlc3QsIGJvdW5kcyksXG4gIGR4ID0gYlswXSAtIGFbMF0sXG4gIGR5ID0gYlsxXSAtIGFbMV0sXG4gIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpLFxuICB4byA9IE1hdGguY29zKGFuZ2xlKSAqIG0sXG4gIHlvID0gTWF0aC5zaW4oYW5nbGUpICogbTtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnbGluZScpLCB7XG4gICAgc3Ryb2tlOiBicnVzaC5jb2xvcixcbiAgICAnc3Ryb2tlLXdpZHRoJzogbGluZVdpZHRoKGJydXNoLCBjdXJyZW50LCBib3VuZHMpLFxuICAgICdzdHJva2UtbGluZWNhcCc6ICdyb3VuZCcsXG4gICAgJ21hcmtlci1lbmQnOiAndXJsKCNhcnJvd2hlYWQtJyArIGJydXNoLmtleSArICcpJyxcbiAgICBvcGFjaXR5OiBvcGFjaXR5KGJydXNoLCBjdXJyZW50KSxcbiAgICB4MTogYVswXSxcbiAgICB5MTogYVsxXSxcbiAgICB4MjogYlswXSAtIHhvLFxuICAgIHkyOiBiWzFdIC0geW9cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBpZWNlKGJhc2VVcmw6IHN0cmluZywgcG9zOiBjZy5Qb3MsIHBpZWNlOiBEcmF3U2hhcGVQaWVjZSwgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG8gPSBwb3MycHgocG9zLCBib3VuZHMpLFxuICBzaXplID0gYm91bmRzLndpZHRoIC8gOCAqIChwaWVjZS5zY2FsZSB8fCAxKSxcbiAgbmFtZSA9IHBpZWNlLmNvbG9yWzBdICsgKHBpZWNlLnJvbGUgPT09ICdrbmlnaHQnID8gJ24nIDogcGllY2Uucm9sZVswXSkudG9VcHBlckNhc2UoKTtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnaW1hZ2UnKSwge1xuICAgIGNsYXNzTmFtZTogYCR7cGllY2Uucm9sZX0gJHtwaWVjZS5jb2xvcn1gLFxuICAgIHg6IG9bMF0gLSBzaXplIC8gMixcbiAgICB5OiBvWzFdIC0gc2l6ZSAvIDIsXG4gICAgd2lkdGg6IHNpemUsXG4gICAgaGVpZ2h0OiBzaXplLFxuICAgIGhyZWY6IGJhc2VVcmwgKyBuYW1lICsgJy5zdmcnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJNYXJrZXIoYnJ1c2g6IERyYXdCcnVzaCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBtYXJrZXIgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ21hcmtlcicpLCB7XG4gICAgaWQ6ICdhcnJvd2hlYWQtJyArIGJydXNoLmtleSxcbiAgICBvcmllbnQ6ICdhdXRvJyxcbiAgICBtYXJrZXJXaWR0aDogNCxcbiAgICBtYXJrZXJIZWlnaHQ6IDgsXG4gICAgcmVmWDogMi4wNSxcbiAgICByZWZZOiAyLjAxXG4gIH0pO1xuICBtYXJrZXIuYXBwZW5kQ2hpbGQoc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdwYXRoJyksIHtcbiAgICBkOiAnTTAsMCBWNCBMMywyIFonLFxuICAgIGZpbGw6IGJydXNoLmNvbG9yXG4gIH0pKTtcbiAgbWFya2VyLnNldEF0dHJpYnV0ZSgnY2dLZXknLCBicnVzaC5rZXkpO1xuICByZXR1cm4gbWFya2VyO1xufVxuXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKGVsOiBTVkdFbGVtZW50LCBhdHRyczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSk6IFNWR0VsZW1lbnQge1xuICBmb3IgKGxldCBrZXkgaW4gYXR0cnMpIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xuICByZXR1cm4gZWw7XG59XG5cbmZ1bmN0aW9uIG9yaWVudChwb3M6IGNnLlBvcywgY29sb3I6IGNnLkNvbG9yKTogY2cuUG9zIHtcbiAgcmV0dXJuIGNvbG9yID09PSAnd2hpdGUnID8gcG9zIDogWzkgLSBwb3NbMF0sIDkgLSBwb3NbMV1dO1xufVxuXG5mdW5jdGlvbiBtYWtlQ3VzdG9tQnJ1c2goYmFzZTogRHJhd0JydXNoLCBtb2RpZmllcnM6IERyYXdNb2RpZmllcnMpOiBEcmF3QnJ1c2gge1xuICBjb25zdCBicnVzaDogUGFydGlhbDxEcmF3QnJ1c2g+ID0ge1xuICAgIGNvbG9yOiBiYXNlLmNvbG9yLFxuICAgIG9wYWNpdHk6IE1hdGgucm91bmQoYmFzZS5vcGFjaXR5ICogMTApIC8gMTAsXG4gICAgbGluZVdpZHRoOiBNYXRoLnJvdW5kKG1vZGlmaWVycy5saW5lV2lkdGggfHwgYmFzZS5saW5lV2lkdGgpXG4gIH07XG4gIGJydXNoLmtleSA9IFtiYXNlLmtleSwgbW9kaWZpZXJzLmxpbmVXaWR0aF0uZmlsdGVyKHggPT4geCkuam9pbignJyk7XG4gIHJldHVybiBicnVzaCBhcyBEcmF3QnJ1c2g7XG59XG5cbmZ1bmN0aW9uIGNpcmNsZVdpZHRoKGJvdW5kczogQ2xpZW50UmVjdCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICBjb25zdCBiYXNlID0gYm91bmRzLndpZHRoIC8gNTEyO1xuICByZXR1cm4gWzMgKiBiYXNlLCA0ICogYmFzZV07XG59XG5cbmZ1bmN0aW9uIGxpbmVXaWR0aChicnVzaDogRHJhd0JydXNoLCBjdXJyZW50OiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBudW1iZXIge1xuICByZXR1cm4gKGJydXNoLmxpbmVXaWR0aCB8fCAxMCkgKiAoY3VycmVudCA/IDAuODUgOiAxKSAvIDUxMiAqIGJvdW5kcy53aWR0aDtcbn1cblxuZnVuY3Rpb24gb3BhY2l0eShicnVzaDogRHJhd0JydXNoLCBjdXJyZW50OiBib29sZWFuKTogbnVtYmVyIHtcbiAgcmV0dXJuIChicnVzaC5vcGFjaXR5IHx8IDEpICogKGN1cnJlbnQgPyAwLjkgOiAxKTtcbn1cblxuZnVuY3Rpb24gYXJyb3dNYXJnaW4oYm91bmRzOiBDbGllbnRSZWN0LCBzaG9ydGVuOiBib29sZWFuKTogbnVtYmVyIHtcbiAgcmV0dXJuIChzaG9ydGVuID8gMjAgOiAxMCkgLyA1MTIgKiBib3VuZHMud2lkdGg7XG59XG5cbmZ1bmN0aW9uIHBvczJweChwb3M6IGNnLlBvcywgYm91bmRzOiBDbGllbnRSZWN0KTogY2cuTnVtYmVyUGFpciB7XG4gIHJldHVybiBbKHBvc1swXSAtIDAuNSkgKiBib3VuZHMud2lkdGggLyA4LCAoOC41IC0gcG9zWzFdKSAqIGJvdW5kcy5oZWlnaHQgLyA4XTtcbn1cbiIsImV4cG9ydCB0eXBlIENvbG9yID0gJ3doaXRlJyB8ICdibGFjayc7XG5leHBvcnQgdHlwZSBSb2xlID0gJ2tpbmcnIHwgJ3F1ZWVuJyB8ICdyb29rJyB8ICdiaXNob3AnIHwgJ2tuaWdodCcgfCAncGF3bic7XG5leHBvcnQgdHlwZSBLZXkgPSAnYTAnIHwgJ2ExJyB8ICdiMScgfCAnYzEnIHwgJ2QxJyB8ICdlMScgfCAnZjEnIHwgJ2cxJyB8ICdoMScgfCAnYTInIHwgJ2IyJyB8ICdjMicgfCAnZDInIHwgJ2UyJyB8ICdmMicgfCAnZzInIHwgJ2gyJyB8ICdhMycgfCAnYjMnIHwgJ2MzJyB8ICdkMycgfCAnZTMnIHwgJ2YzJyB8ICdnMycgfCAnaDMnIHwgJ2E0JyB8ICdiNCcgfCAnYzQnIHwgJ2Q0JyB8ICdlNCcgfCAnZjQnIHwgJ2c0JyB8ICdoNCcgfCAnYTUnIHwgJ2I1JyB8ICdjNScgfCAnZDUnIHwgJ2U1JyB8ICdmNScgfCAnZzUnIHwgJ2g1JyB8ICdhNicgfCAnYjYnIHwgJ2M2JyB8ICdkNicgfCAnZTYnIHwgJ2Y2JyB8ICdnNicgfCAnaDYnIHwgJ2E3JyB8ICdiNycgfCAnYzcnIHwgJ2Q3JyB8ICdlNycgfCAnZjcnIHwgJ2c3JyB8ICdoNycgfCAnYTgnIHwgJ2I4JyB8ICdjOCcgfCAnZDgnIHwgJ2U4JyB8ICdmOCcgfCAnZzgnIHwgJ2g4JztcbmV4cG9ydCB0eXBlIEZpbGUgPSAnYScgfCAnYicgfCAnYycgfCAnZCcgfCAnZScgfCAnZicgfCAnZycgfCAnaCc7XG5leHBvcnQgdHlwZSBSYW5rID0gMSB8IDIgfCAzIHwgNCB8IDUgfCA2IHwgNyB8IDg7XG5leHBvcnQgdHlwZSBGRU4gPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBQb3MgPSBbbnVtYmVyLCBudW1iZXJdO1xuZXhwb3J0IGludGVyZmFjZSBQaWVjZSB7XG4gIHJvbGU6IFJvbGU7XG4gIGNvbG9yOiBDb2xvcjtcbiAgcHJvbW90ZWQ/OiBib29sZWFuO1xufVxuZXhwb3J0IGludGVyZmFjZSBEcm9wIHtcbiAgcm9sZTogUm9sZTtcbiAga2V5OiBLZXk7XG59XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlcyB7XG4gIFtrZXk6IHN0cmluZ106IFBpZWNlIHwgdW5kZWZpbmVkO1xufVxuZXhwb3J0IGludGVyZmFjZSBQaWVjZXNEaWZmIHtcbiAgW2tleTogc3RyaW5nXTogUGllY2UgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCB0eXBlIEtleVBhaXIgPSBbS2V5LCBLZXldO1xuXG5leHBvcnQgdHlwZSBOdW1iZXJQYWlyID0gW251bWJlciwgbnVtYmVyXTtcblxuZXhwb3J0IHR5cGUgTnVtYmVyUXVhZCA9IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuXG5leHBvcnQgaW50ZXJmYWNlIERlc3RzIHtcbiAgW2tleTogc3RyaW5nXTogS2V5W11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50cyB7XG4gIGJvYXJkOiBIVE1MRWxlbWVudDtcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudDtcbiAgZ2hvc3Q/OiBIVE1MRWxlbWVudDtcbiAgc3ZnPzogU1ZHRWxlbWVudDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRG9tIHtcbiAgZWxlbWVudHM6IEVsZW1lbnRzLFxuICBib3VuZHM6IE1lbW88Q2xpZW50UmVjdD47XG4gIHJlZHJhdzogKCkgPT4gdm9pZDtcbiAgcmVkcmF3Tm93OiAoc2tpcFN2Zz86IGJvb2xlYW4pID0+IHZvaWQ7XG4gIHVuYmluZD86IFVuYmluZDtcbiAgZGVzdHJveWVkPzogYm9vbGVhbjtcbiAgcmVsYXRpdmU/OiBib29sZWFuOyAvLyBkb24ndCBjb21wdXRlIGJvdW5kcywgdXNlIHJlbGF0aXZlICUgdG8gcGxhY2UgcGllY2VzXG59XG5leHBvcnQgaW50ZXJmYWNlIEV4cGxvZGluZyB7XG4gIHN0YWdlOiBudW1iZXI7XG4gIGtleXM6IEtleVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1vdmVNZXRhZGF0YSB7XG4gIHByZW1vdmU6IGJvb2xlYW47XG4gIGN0cmxLZXk/OiBib29sZWFuO1xuICBob2xkVGltZT86IG51bWJlcjtcbiAgY2FwdHVyZWQ/OiBQaWVjZTtcbiAgcHJlZHJvcD86IGJvb2xlYW47XG59XG5leHBvcnQgaW50ZXJmYWNlIFNldFByZW1vdmVNZXRhZGF0YSB7XG4gIGN0cmxLZXk/OiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBXaW5kb3dFdmVudCA9ICdvbnNjcm9sbCcgfCAnb25yZXNpemUnO1xuXG5leHBvcnQgdHlwZSBNb3VjaEV2ZW50ID0gTW91c2VFdmVudCAmIFRvdWNoRXZlbnQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5ZWROb2RlIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBjZ0tleTogS2V5O1xufVxuZXhwb3J0IGludGVyZmFjZSBQaWVjZU5vZGUgZXh0ZW5kcyBLZXllZE5vZGUge1xuICBjZ1BpZWNlOiBzdHJpbmc7XG4gIGNnQW5pbWF0aW5nPzogYm9vbGVhbjtcbiAgY2dGYWRpbmc/OiBib29sZWFuO1xuICBjZ0RyYWdnaW5nPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU3F1YXJlTm9kZSBleHRlbmRzIEtleWVkTm9kZSB7IH1cblxuZXhwb3J0IGludGVyZmFjZSBNZW1vPEE+IHsgKCk6IEE7IGNsZWFyOiAoKSA9PiB2b2lkOyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGltZXIge1xuICBzdGFydDogKCkgPT4gdm9pZDtcbiAgY2FuY2VsOiAoKSA9PiB2b2lkO1xuICBzdG9wOiAoKSA9PiBudW1iZXI7XG59XG5cbmV4cG9ydCB0eXBlIFJlZHJhdyA9ICgpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBVbmJpbmQgPSAoKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgTWlsbGlzZWNvbmRzID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgS0h6ID0gbnVtYmVyO1xuXG5leHBvcnQgY29uc3QgZmlsZXM6IEZpbGVbXSA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJ107XG5leHBvcnQgY29uc3QgcmFua3M6IFJhbmtbXSA9IFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XTtcbiIsImltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgY29uc3QgY29sb3JzOiBjZy5Db2xvcltdID0gWyd3aGl0ZScsICdibGFjayddO1xuXG5leHBvcnQgY29uc3QgaW52UmFua3M6IGNnLlJhbmtbXSA9IFs4LCA3LCA2LCA1LCA0LCAzLCAyLCAxXTtcblxuZXhwb3J0IGNvbnN0IGFsbEtleXM6IGNnLktleVtdID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdCguLi5jZy5maWxlcy5tYXAoYyA9PiBjZy5yYW5rcy5tYXAociA9PiBjK3IpKSk7XG5cbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvczogY2cuUG9zKSA9PiBhbGxLZXlzWzggKiBwb3NbMF0gKyBwb3NbMV0gLSA5XTtcblxuZXhwb3J0IGNvbnN0IGtleTJwb3MgPSAoazogY2cuS2V5KSA9PiBbay5jaGFyQ29kZUF0KDApIC0gOTYsIGsuY2hhckNvZGVBdCgxKSAtIDQ4XSBhcyBjZy5Qb3M7XG5cbmV4cG9ydCBmdW5jdGlvbiBtZW1vPEE+KGY6ICgpID0+IEEpOiBjZy5NZW1vPEE+IHtcbiAgbGV0IHY6IEEgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IHJldDogYW55ID0gKCkgPT4ge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHYgPSBmKCk7XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIHJldC5jbGVhciA9ICgpID0+IHsgdiA9IHVuZGVmaW5lZCB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgY29uc3QgdGltZXI6ICgpID0+IGNnLlRpbWVyID0gKCkgPT4ge1xuICBsZXQgc3RhcnRBdDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICByZXR1cm4ge1xuICAgIHN0YXJ0KCkgeyBzdGFydEF0ID0gcGVyZm9ybWFuY2Uubm93KCkgfSxcbiAgICBjYW5jZWwoKSB7IHN0YXJ0QXQgPSB1bmRlZmluZWQgfSxcbiAgICBzdG9wKCkge1xuICAgICAgaWYgKCFzdGFydEF0KSByZXR1cm4gMDtcbiAgICAgIGNvbnN0IHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0QXQ7XG4gICAgICBzdGFydEF0ID0gdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHRpbWU7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogY2cuQ29sb3IpID0+IGMgPT09ICd3aGl0ZScgPyAnYmxhY2snIDogJ3doaXRlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zWDxYPih4czogWFtdIHwgdW5kZWZpbmVkLCB4OiBYKTogYm9vbGVhbiB7XG4gIHJldHVybiB4cyAhPT0gdW5kZWZpbmVkICYmIHhzLmluZGV4T2YoeCkgIT09IC0xO1xufVxuXG5leHBvcnQgY29uc3QgZGlzdGFuY2VTcTogKHBvczE6IGNnLlBvcywgcG9zMjogY2cuUG9zKSA9PiBudW1iZXIgPSAocG9zMSwgcG9zMikgPT4ge1xuICByZXR1cm4gTWF0aC5wb3cocG9zMVswXSAtIHBvczJbMF0sIDIpICsgTWF0aC5wb3cocG9zMVsxXSAtIHBvczJbMV0sIDIpO1xufVxuXG5leHBvcnQgY29uc3Qgc2FtZVBpZWNlOiAocDE6IGNnLlBpZWNlLCBwMjogY2cuUGllY2UpID0+IGJvb2xlYW4gPSAocDEsIHAyKSA9PlxuICBwMS5yb2xlID09PSBwMi5yb2xlICYmIHAxLmNvbG9yID09PSBwMi5jb2xvcjtcblxuY29uc3QgcG9zVG9UcmFuc2xhdGVCYXNlOiAocG9zOiBjZy5Qb3MsIGFzV2hpdGU6IGJvb2xlYW4sIHhGYWN0b3I6IG51bWJlciwgeUZhY3RvcjogbnVtYmVyKSA9PiBjZy5OdW1iZXJQYWlyID1cbihwb3MsIGFzV2hpdGUsIHhGYWN0b3IsIHlGYWN0b3IpID0+IFtcbiAgKGFzV2hpdGUgPyBwb3NbMF0gLSAxIDogOCAtIHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNXaGl0ZSA/IDggLSBwb3NbMV0gOiBwb3NbMV0gLSAxKSAqIHlGYWN0b3Jcbl07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZUFicyA9IChib3VuZHM6IENsaWVudFJlY3QpID0+IHtcbiAgY29uc3QgeEZhY3RvciA9IGJvdW5kcy53aWR0aCAvIDgsXG4gIHlGYWN0b3IgPSBib3VuZHMuaGVpZ2h0IC8gODtcbiAgcmV0dXJuIChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbikgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgYXNXaGl0ZSwgeEZhY3RvciwgeUZhY3Rvcik7XG59O1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVSZWw6IChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbikgPT4gY2cuTnVtYmVyUGFpciA9XG4gIChwb3MsIGFzV2hpdGUpID0+IHBvc1RvVHJhbnNsYXRlQmFzZShwb3MsIGFzV2hpdGUsIDEwMCwgMTAwKTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZUFicyA9IChlbDogSFRNTEVsZW1lbnQsIHBvczogY2cuTnVtYmVyUGFpcikgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cG9zWzBdfXB4LCR7cG9zWzFdfXB4KWA7XG59XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVSZWwgPSAoZWw6IEhUTUxFbGVtZW50LCBwZXJjZW50czogY2cuTnVtYmVyUGFpcikgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cGVyY2VudHNbMF19JSwke3BlcmNlbnRzWzFdfSUpYDtcbn1cblxuZXhwb3J0IGNvbnN0IHNldFZpc2libGUgPSAoZWw6IEhUTUxFbGVtZW50LCB2OiBib29sZWFuKSA9PiB7XG4gIGVsLnN0eWxlLnZpc2liaWxpdHkgPSB2ID8gJ3Zpc2libGUnIDogJ2hpZGRlbic7XG59XG5cbi8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbiFcbmV4cG9ydCBjb25zdCBldmVudFBvc2l0aW9uOiAoZTogY2cuTW91Y2hFdmVudCkgPT4gY2cuTnVtYmVyUGFpciB8IHVuZGVmaW5lZCA9IGUgPT4ge1xuICBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WCA9PT0gMCkgcmV0dXJuIFtlLmNsaWVudFgsIGUuY2xpZW50WV07XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzWzBdKSByZXR1cm4gW2UudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLCBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WV07XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBjb25zdCBpc1JpZ2h0QnV0dG9uID0gKGU6IE1vdXNlRXZlbnQpID0+IGUuYnV0dG9ucyA9PT0gMiB8fCBlLmJ1dHRvbiA9PT0gMjtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUVsID0gKHRhZ05hbWU6IHN0cmluZywgY2xhc3NOYW1lPzogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgaWYgKGNsYXNzTmFtZSkgZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICByZXR1cm4gZWw7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBjb2xvcnMsIHNldFZpc2libGUsIGNyZWF0ZUVsIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgZmlsZXMsIHJhbmtzIH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgYXMgY3JlYXRlU1ZHIH0gZnJvbSAnLi9zdmcnXG5pbXBvcnQgeyBFbGVtZW50cyB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdyYXAoZWxlbWVudDogSFRNTEVsZW1lbnQsIHM6IFN0YXRlLCByZWxhdGl2ZTogYm9vbGVhbik6IEVsZW1lbnRzIHtcblxuICAvLyAuY2ctd3JhcCAoZWxlbWVudCBwYXNzZWQgdG8gQ2hlc3Nncm91bmQpXG4gIC8vICAgY2ctaGVscGVyICgxMi41JSlcbiAgLy8gICAgIGNnLWNvbnRhaW5lciAoODAwJSlcbiAgLy8gICAgICAgY2ctYm9hcmRcbiAgLy8gICAgICAgc3ZnXG4gIC8vICAgICAgIGNvb3Jkcy5yYW5rc1xuICAvLyAgICAgICBjb29yZHMuZmlsZXNcbiAgLy8gICAgICAgcGllY2UuZ2hvc3RcblxuICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuXG4gIC8vIGVuc3VyZSB0aGUgY2ctd3JhcCBjbGFzcyBpcyBzZXRcbiAgLy8gc28gYm91bmRzIGNhbGN1bGF0aW9uIGNhbiB1c2UgdGhlIENTUyB3aWR0aC9oZWlnaHQgdmFsdWVzXG4gIC8vIGFkZCB0aGF0IGNsYXNzIHlvdXJzZWxmIHRvIHRoZSBlbGVtZW50IGJlZm9yZSBjYWxsaW5nIGNoZXNzZ3JvdW5kXG4gIC8vIGZvciBhIHNsaWdodCBwZXJmb3JtYW5jZSBpbXByb3ZlbWVudCEgKGF2b2lkcyByZWNvbXB1dGluZyBzdHlsZSlcbiAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjZy13cmFwJyk7XG5cbiAgY29sb3JzLmZvckVhY2goYyA9PiBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ29yaWVudGF0aW9uLScgKyBjLCBzLm9yaWVudGF0aW9uID09PSBjKSk7XG4gIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnbWFuaXB1bGFibGUnLCAhcy52aWV3T25seSk7XG5cbiAgY29uc3QgaGVscGVyID0gY3JlYXRlRWwoJ2NnLWhlbHBlcicpO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKGhlbHBlcik7XG4gIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZUVsKCdjZy1jb250YWluZXInKTtcbiAgaGVscGVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgY29uc3QgYm9hcmQgPSBjcmVhdGVFbCgnY2ctYm9hcmQnKTtcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJvYXJkKTtcblxuICBsZXQgc3ZnOiBTVkdFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBpZiAocy5kcmF3YWJsZS52aXNpYmxlICYmICFyZWxhdGl2ZSkge1xuICAgIHN2ZyA9IGNyZWF0ZVNWRygnc3ZnJyk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWRygnZGVmcycpKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgfVxuXG4gIGlmIChzLmNvb3JkaW5hdGVzKSB7XG4gICAgY29uc3Qgb3JpZW50Q2xhc3MgPSBzLm9yaWVudGF0aW9uID09PSAnYmxhY2snID8gJyBibGFjaycgOiAnJztcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKHJhbmtzLCAncmFua3MnICsgb3JpZW50Q2xhc3MpKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKGZpbGVzLCAnZmlsZXMnICsgb3JpZW50Q2xhc3MpKTtcbiAgfVxuXG4gIGxldCBnaG9zdDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmRyYWdnYWJsZS5zaG93R2hvc3QgJiYgIXJlbGF0aXZlKSB7XG4gICAgZ2hvc3QgPSBjcmVhdGVFbCgncGllY2UnLCAnZ2hvc3QnKTtcbiAgICBzZXRWaXNpYmxlKGdob3N0LCBmYWxzZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdob3N0KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYm9hcmQsXG4gICAgY29udGFpbmVyLFxuICAgIGdob3N0LFxuICAgIHN2Z1xuICB9O1xufVxuXG5mdW5jdGlvbiByZW5kZXJDb29yZHMoZWxlbXM6IGFueVtdLCBjbGFzc05hbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgZWwgPSBjcmVhdGVFbCgnY29vcmRzJywgY2xhc3NOYW1lKTtcbiAgbGV0IGY6IEhUTUxFbGVtZW50O1xuICBmb3IgKGxldCBpIGluIGVsZW1zKSB7XG4gICAgZiA9IGNyZWF0ZUVsKCdjb29yZCcpO1xuICAgIGYudGV4dENvbnRlbnQgPSBlbGVtc1tpXTtcbiAgICBlbC5hcHBlbmRDaGlsZChmKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHV0aWxfMSA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG5jb25zdCBzcXVhcmVTZXRfMSA9IHJlcXVpcmUoXCIuL3NxdWFyZVNldFwiKTtcbmZ1bmN0aW9uIGNvbXB1dGVSYW5nZShzcXVhcmUsIGRlbHRhcywgc3RlcHBlcikge1xuICAgIGxldCByYW5nZSA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgIGZvciAoY29uc3QgZGVsdGEgb2YgZGVsdGFzKSB7XG4gICAgICAgIGZvciAobGV0IHNxID0gc3F1YXJlICsgZGVsdGE7IDAgPD0gc3EgJiYgc3EgPCA2NCAmJiB1dGlsXzEuc3F1YXJlRGlzdChzcSwgc3EgLSBkZWx0YSkgPD0gMjsgc3EgKz0gZGVsdGEpIHtcbiAgICAgICAgICAgIHJhbmdlID0gcmFuZ2Uud2l0aChzcSk7XG4gICAgICAgICAgICBpZiAoc3RlcHBlcilcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmFuZ2U7XG59XG5mdW5jdGlvbiBjb21wdXRlVGFibGUoZGVsdGFzLCBzdGVwcGVyKSB7XG4gICAgY29uc3QgdGFibGUgPSBbXTtcbiAgICBmb3IgKGxldCBzcXVhcmUgPSAwOyBzcXVhcmUgPCA2NDsgc3F1YXJlKyspIHtcbiAgICAgICAgdGFibGVbc3F1YXJlXSA9IGNvbXB1dGVSYW5nZShzcXVhcmUsIGRlbHRhcywgc3RlcHBlcik7XG4gICAgfVxuICAgIHJldHVybiB0YWJsZTtcbn1cbmNvbnN0IEtJTkdfQVRUQUNLUyA9IGNvbXB1dGVUYWJsZShbLTksIC04LCAtNywgLTEsIDEsIDcsIDgsIDldLCB0cnVlKTtcbmNvbnN0IEtOSUdIVF9BVFRBQ0tTID0gY29tcHV0ZVRhYmxlKFstMTcsIC0xNSwgLTEwLCAtNiwgNiwgMTAsIDE1LCAxN10sIHRydWUpO1xuY29uc3QgUEFXTl9BVFRBQ0tTID0ge1xuICAgIHdoaXRlOiBjb21wdXRlVGFibGUoWzcsIDldLCB0cnVlKSxcbiAgICBibGFjazogY29tcHV0ZVRhYmxlKFstNywgLTldLCB0cnVlKSxcbn07XG5mdW5jdGlvbiBraW5nQXR0YWNrcyhzcXVhcmUpIHtcbiAgICByZXR1cm4gS0lOR19BVFRBQ0tTW3NxdWFyZV07XG59XG5leHBvcnRzLmtpbmdBdHRhY2tzID0ga2luZ0F0dGFja3M7XG5mdW5jdGlvbiBrbmlnaHRBdHRhY2tzKHNxdWFyZSkge1xuICAgIHJldHVybiBLTklHSFRfQVRUQUNLU1tzcXVhcmVdO1xufVxuZXhwb3J0cy5rbmlnaHRBdHRhY2tzID0ga25pZ2h0QXR0YWNrcztcbmZ1bmN0aW9uIHBhd25BdHRhY2tzKGNvbG9yLCBzcXVhcmUpIHtcbiAgICByZXR1cm4gUEFXTl9BVFRBQ0tTW2NvbG9yXVtzcXVhcmVdO1xufVxuZXhwb3J0cy5wYXduQXR0YWNrcyA9IHBhd25BdHRhY2tzO1xuY29uc3QgRklMRV9SQU5HRSA9IGNvbXB1dGVUYWJsZShbLTgsIDhdLCBmYWxzZSk7XG5jb25zdCBSQU5LX1JBTkdFID0gY29tcHV0ZVRhYmxlKFstMSwgMV0sIGZhbHNlKTtcbmNvbnN0IERJQUdfUkFOR0UgPSBjb21wdXRlVGFibGUoWy05LCA5XSwgZmFsc2UpO1xuY29uc3QgQU5USV9ESUFHX1JBTkdFID0gY29tcHV0ZVRhYmxlKFstNywgN10sIGZhbHNlKTtcbmZ1bmN0aW9uIGh5cGVyYm9sYShiaXQsIHJhbmdlLCBvY2N1cGllZCkge1xuICAgIGxldCBmb3J3YXJkID0gb2NjdXBpZWQuaW50ZXJzZWN0KHJhbmdlKTtcbiAgICBsZXQgcmV2ZXJzZSA9IGZvcndhcmQuYnN3YXA2NCgpOyAvLyBBc3N1bWVzIG5vIG1vcmUgdGhhbiAxIGJpdCBwZXIgcmFua1xuICAgIGZvcndhcmQgPSBmb3J3YXJkLm1pbnVzNjQoYml0KTtcbiAgICByZXZlcnNlID0gcmV2ZXJzZS5taW51czY0KGJpdC5ic3dhcDY0KCkpO1xuICAgIGZvcndhcmQgPSBmb3J3YXJkLnhvcihyZXZlcnNlLmJzd2FwNjQoKSk7XG4gICAgcmV0dXJuIGZvcndhcmQuaW50ZXJzZWN0KHJhbmdlKTtcbn1cbmZ1bmN0aW9uIGZpbGVBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpIHtcbiAgICByZXR1cm4gaHlwZXJib2xhKHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKHNxdWFyZSksIEZJTEVfUkFOR0Vbc3F1YXJlXSwgb2NjdXBpZWQpO1xufVxuZnVuY3Rpb24gcmFua0F0dGFja3Moc3F1YXJlLCBvY2N1cGllZCkge1xuICAgIGNvbnN0IHJhbmdlID0gUkFOS19SQU5HRVtzcXVhcmVdO1xuICAgIGxldCBmb3J3YXJkID0gb2NjdXBpZWQuaW50ZXJzZWN0KHJhbmdlKTtcbiAgICBsZXQgcmV2ZXJzZSA9IGZvcndhcmQucmJpdDY0KCk7XG4gICAgZm9yd2FyZCA9IGZvcndhcmQubWludXM2NChzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShzcXVhcmUpKTtcbiAgICByZXZlcnNlID0gcmV2ZXJzZS5taW51czY0KHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKDYzIC0gc3F1YXJlKSk7XG4gICAgZm9yd2FyZCA9IGZvcndhcmQueG9yKHJldmVyc2UucmJpdDY0KCkpO1xuICAgIHJldHVybiBmb3J3YXJkLmludGVyc2VjdChyYW5nZSk7XG59XG5mdW5jdGlvbiBkaWFnQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKSB7XG4gICAgcmV0dXJuIGh5cGVyYm9sYShzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShzcXVhcmUpLCBESUFHX1JBTkdFW3NxdWFyZV0sIG9jY3VwaWVkKTtcbn1cbmZ1bmN0aW9uIGFudGlEaWFnQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKSB7XG4gICAgcmV0dXJuIGh5cGVyYm9sYShzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShzcXVhcmUpLCBBTlRJX0RJQUdfUkFOR0Vbc3F1YXJlXSwgb2NjdXBpZWQpO1xufVxuZnVuY3Rpb24gYmlzaG9wQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKSB7XG4gICAgY29uc3QgYml0ID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoc3F1YXJlKTtcbiAgICByZXR1cm4gaHlwZXJib2xhKGJpdCwgRElBR19SQU5HRVtzcXVhcmVdLCBvY2N1cGllZCkueG9yKGh5cGVyYm9sYShiaXQsIEFOVElfRElBR19SQU5HRVtzcXVhcmVdLCBvY2N1cGllZCkpO1xufVxuZXhwb3J0cy5iaXNob3BBdHRhY2tzID0gYmlzaG9wQXR0YWNrcztcbmZ1bmN0aW9uIHJvb2tBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpIHtcbiAgICByZXR1cm4gZmlsZUF0dGFja3Moc3F1YXJlLCBvY2N1cGllZCkueG9yKHJhbmtBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpKTtcbn1cbmV4cG9ydHMucm9va0F0dGFja3MgPSByb29rQXR0YWNrcztcbmZ1bmN0aW9uIHF1ZWVuQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKSB7XG4gICAgcmV0dXJuIGJpc2hvcEF0dGFja3Moc3F1YXJlLCBvY2N1cGllZCkueG9yKHJvb2tBdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpKTtcbn1cbmV4cG9ydHMucXVlZW5BdHRhY2tzID0gcXVlZW5BdHRhY2tzO1xuZnVuY3Rpb24gYXR0YWNrcyhwaWVjZSwgc3F1YXJlLCBvY2N1cGllZCkge1xuICAgIHN3aXRjaCAocGllY2Uucm9sZSkge1xuICAgICAgICBjYXNlICdwYXduJzogcmV0dXJuIHBhd25BdHRhY2tzKHBpZWNlLmNvbG9yLCBzcXVhcmUpO1xuICAgICAgICBjYXNlICdrbmlnaHQnOiByZXR1cm4ga25pZ2h0QXR0YWNrcyhzcXVhcmUpO1xuICAgICAgICBjYXNlICdiaXNob3AnOiByZXR1cm4gYmlzaG9wQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKTtcbiAgICAgICAgY2FzZSAncm9vayc6IHJldHVybiByb29rQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKTtcbiAgICAgICAgY2FzZSAncXVlZW4nOiByZXR1cm4gcXVlZW5BdHRhY2tzKHNxdWFyZSwgb2NjdXBpZWQpO1xuICAgICAgICBjYXNlICdraW5nJzogcmV0dXJuIGtpbmdBdHRhY2tzKHNxdWFyZSk7XG4gICAgfVxufVxuZXhwb3J0cy5hdHRhY2tzID0gYXR0YWNrcztcbmZ1bmN0aW9uIHJheVRhYmxlcygpIHtcbiAgICBjb25zdCByYXkgPSBbXTtcbiAgICBjb25zdCBiZXR3ZWVuID0gW107XG4gICAgY29uc3QgemVybyA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgIGZvciAobGV0IGEgPSAwOyBhIDwgNjQ7IGErKykge1xuICAgICAgICByYXlbYV0gPSBbXTtcbiAgICAgICAgYmV0d2VlblthXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IDY0OyBiKyspIHtcbiAgICAgICAgICAgIHJheVthXVtiXSA9IHplcm87XG4gICAgICAgICAgICBiZXR3ZWVuW2FdW2JdID0gemVybztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGIgb2YgRElBR19SQU5HRVthXSkge1xuICAgICAgICAgICAgcmF5W2FdW2JdID0gRElBR19SQU5HRVthXS53aXRoKGEpO1xuICAgICAgICAgICAgYmV0d2VlblthXVtiXSA9IGRpYWdBdHRhY2tzKGEsIHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKGIpKS5pbnRlcnNlY3QoZGlhZ0F0dGFja3MoYiwgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoYSkpKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGIgb2YgQU5USV9ESUFHX1JBTkdFW2FdKSB7XG4gICAgICAgICAgICByYXlbYV1bYl0gPSBBTlRJX0RJQUdfUkFOR0VbYV0ud2l0aChhKTtcbiAgICAgICAgICAgIGJldHdlZW5bYV1bYl0gPSBhbnRpRGlhZ0F0dGFja3MoYSwgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoYikpLmludGVyc2VjdChhbnRpRGlhZ0F0dGFja3MoYiwgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoYSkpKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGIgb2YgRklMRV9SQU5HRVthXSkge1xuICAgICAgICAgICAgcmF5W2FdW2JdID0gRklMRV9SQU5HRVthXS53aXRoKGEpO1xuICAgICAgICAgICAgYmV0d2VlblthXVtiXSA9IGZpbGVBdHRhY2tzKGEsIHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKGIpKS5pbnRlcnNlY3QoZmlsZUF0dGFja3MoYiwgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoYSkpKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGIgb2YgUkFOS19SQU5HRVthXSkge1xuICAgICAgICAgICAgcmF5W2FdW2JdID0gUkFOS19SQU5HRVthXS53aXRoKGEpO1xuICAgICAgICAgICAgYmV0d2VlblthXVtiXSA9IHJhbmtBdHRhY2tzKGEsIHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tU3F1YXJlKGIpKS5pbnRlcnNlY3QocmFua0F0dGFja3MoYiwgc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUoYSkpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW3JheSwgYmV0d2Vlbl07XG59XG5jb25zdCBbUkFZLCBCRVRXRUVOXSA9IHJheVRhYmxlcygpO1xuZnVuY3Rpb24gcmF5KGEsIGIpIHtcbiAgICByZXR1cm4gUkFZW2FdW2JdO1xufVxuZXhwb3J0cy5yYXkgPSByYXk7XG5mdW5jdGlvbiBiZXR3ZWVuKGEsIGIpIHtcbiAgICByZXR1cm4gQkVUV0VFTlthXVtiXTtcbn1cbmV4cG9ydHMuYmV0d2VlbiA9IGJldHdlZW47XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHR5cGVzXzEgPSByZXF1aXJlKFwiLi90eXBlc1wiKTtcbmNvbnN0IHNxdWFyZVNldF8xID0gcmVxdWlyZShcIi4vc3F1YXJlU2V0XCIpO1xuY2xhc3MgQm9hcmQge1xuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIGNvbnN0IGJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIGJvYXJkLnJlc2V0KCk7XG4gICAgICAgIHJldHVybiBib2FyZDtcbiAgICB9XG4gICAgc3RhdGljIHJhY2luZ0tpbmdzKCkge1xuICAgICAgICBjb25zdCBib2FyZCA9IG5ldyBCb2FyZCgpO1xuICAgICAgICBib2FyZC5vY2N1cGllZCA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHhmZmZmLCAwKTtcbiAgICAgICAgYm9hcmQucHJvbW90ZWQgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgYm9hcmQud2hpdGUgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4ZjBmMCwgMCk7XG4gICAgICAgIGJvYXJkLmJsYWNrID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDBmMGYsIDApO1xuICAgICAgICBib2FyZC5wYXduID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGJvYXJkLmtuaWdodCA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHgxODE4LCAwKTtcbiAgICAgICAgYm9hcmQuYmlzaG9wID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDI0MjQsIDApO1xuICAgICAgICBib2FyZC5yb29rID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDQyNDIsIDApO1xuICAgICAgICBib2FyZC5xdWVlbiA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHgwMDgxLCAwKTtcbiAgICAgICAgYm9hcmQua2luZyA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHg4MTAwLCAwKTtcbiAgICAgICAgcmV0dXJuIGJvYXJkO1xuICAgIH1cbiAgICBzdGF0aWMgaG9yZGUoKSB7XG4gICAgICAgIGNvbnN0IGJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIGJvYXJkLm9jY3VwaWVkID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCg0Mjk0OTY3Mjk1LCA0Mjk0OTAxODYyKTtcbiAgICAgICAgYm9hcmQucHJvbW90ZWQgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgYm9hcmQud2hpdGUgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDQyOTQ5NjcyOTUsIDEwMik7XG4gICAgICAgIGJvYXJkLmJsYWNrID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgwLCA0Mjk0OTAxNzYwKTtcbiAgICAgICAgYm9hcmQucGF3biA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoNDI5NDk2NzI5NSwgMTY3MTE3ODIpO1xuICAgICAgICBib2FyZC5rbmlnaHQgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDAsIDExMDcyOTYyNTYpO1xuICAgICAgICBib2FyZC5iaXNob3AgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDAsIDYwMzk3OTc3Nik7XG4gICAgICAgIGJvYXJkLnJvb2sgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDAsIDIxNjQyNjA4NjQpO1xuICAgICAgICBib2FyZC5xdWVlbiA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMCwgMTM0MjE3NzI4KTtcbiAgICAgICAgYm9hcmQua2luZyA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMCwgMjY4NDM1NDU2KTtcbiAgICAgICAgcmV0dXJuIGJvYXJkO1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5vY2N1cGllZCA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHhmZmZmLCA0Mjk0OTAxNzYwKTtcbiAgICAgICAgdGhpcy5wcm9tb3RlZCA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICB0aGlzLndoaXRlID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweGZmZmYsIDApO1xuICAgICAgICB0aGlzLmJsYWNrID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgwLCA0Mjk0OTAxNzYwKTtcbiAgICAgICAgdGhpcy5wYXduID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweGZmMDAsIDE2NzExNjgwKTtcbiAgICAgICAgdGhpcy5rbmlnaHQgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4NDIsIDExMDcyOTYyNTYpO1xuICAgICAgICB0aGlzLmJpc2hvcCA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHgyNCwgNjAzOTc5Nzc2KTtcbiAgICAgICAgdGhpcy5yb29rID0gbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDgxLCAyMTY0MjYwODY0KTtcbiAgICAgICAgdGhpcy5xdWVlbiA9IG5ldyBzcXVhcmVTZXRfMS5TcXVhcmVTZXQoMHg4LCAxMzQyMTc3MjgpO1xuICAgICAgICB0aGlzLmtpbmcgPSBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDB4MTAsIDI2ODQzNTQ1Nik7XG4gICAgfVxuICAgIHN0YXRpYyBlbXB0eSgpIHtcbiAgICAgICAgY29uc3QgYm9hcmQgPSBuZXcgQm9hcmQoKTtcbiAgICAgICAgYm9hcmQuY2xlYXIoKTtcbiAgICAgICAgcmV0dXJuIGJvYXJkO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5vY2N1cGllZCA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICB0aGlzLnByb21vdGVkID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGZvciAoY29uc3QgY29sb3Igb2YgdHlwZXNfMS5DT0xPUlMpXG4gICAgICAgICAgICB0aGlzW2NvbG9yXSA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBmb3IgKGNvbnN0IHJvbGUgb2YgdHlwZXNfMS5ST0xFUylcbiAgICAgICAgICAgIHRoaXNbcm9sZV0gPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIGJvYXJkLm9jY3VwaWVkID0gdGhpcy5vY2N1cGllZDtcbiAgICAgICAgYm9hcmQucHJvbW90ZWQgPSB0aGlzLnByb21vdGVkO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIHR5cGVzXzEuQ09MT1JTKVxuICAgICAgICAgICAgYm9hcmRbY29sb3JdID0gdGhpc1tjb2xvcl07XG4gICAgICAgIGZvciAoY29uc3Qgcm9sZSBvZiB0eXBlc18xLlJPTEVTKVxuICAgICAgICAgICAgYm9hcmRbcm9sZV0gPSB0aGlzW3JvbGVdO1xuICAgICAgICByZXR1cm4gYm9hcmQ7XG4gICAgfVxuICAgIGdldENvbG9yKHNxdWFyZSkge1xuICAgICAgICBpZiAodGhpcy53aGl0ZS5oYXMoc3F1YXJlKSlcbiAgICAgICAgICAgIHJldHVybiAnd2hpdGUnO1xuICAgICAgICBpZiAodGhpcy5ibGFjay5oYXMoc3F1YXJlKSlcbiAgICAgICAgICAgIHJldHVybiAnYmxhY2snO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdldFJvbGUoc3F1YXJlKSB7XG4gICAgICAgIGZvciAoY29uc3Qgcm9sZSBvZiB0eXBlc18xLlJPTEVTKSB7XG4gICAgICAgICAgICBpZiAodGhpc1tyb2xlXS5oYXMoc3F1YXJlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9sZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGdldChzcXVhcmUpIHtcbiAgICAgICAgY29uc3QgY29sb3IgPSB0aGlzLmdldENvbG9yKHNxdWFyZSk7XG4gICAgICAgIGlmICghY29sb3IpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHByb21vdGVkID0gdGhpcy5wcm9tb3RlZC5oYXMoc3F1YXJlKTtcbiAgICAgICAgY29uc3Qgcm9sZSA9IHRoaXMuZ2V0Um9sZShzcXVhcmUpO1xuICAgICAgICByZXR1cm4geyBjb2xvciwgcm9sZSwgcHJvbW90ZWQgfTtcbiAgICB9XG4gICAgdGFrZShzcXVhcmUpIHtcbiAgICAgICAgY29uc3QgcGllY2UgPSB0aGlzLmdldChzcXVhcmUpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMub2NjdXBpZWQgPSB0aGlzLm9jY3VwaWVkLndpdGhvdXQoc3F1YXJlKTtcbiAgICAgICAgICAgIHRoaXNbcGllY2UuY29sb3JdID0gdGhpc1twaWVjZS5jb2xvcl0ud2l0aG91dChzcXVhcmUpO1xuICAgICAgICAgICAgdGhpc1twaWVjZS5yb2xlXSA9IHRoaXNbcGllY2Uucm9sZV0ud2l0aG91dChzcXVhcmUpO1xuICAgICAgICAgICAgaWYgKHBpZWNlLnByb21vdGVkKVxuICAgICAgICAgICAgICAgIHRoaXMucHJvbW90ZWQgPSB0aGlzLnByb21vdGVkLndpdGhvdXQoc3F1YXJlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGllY2U7XG4gICAgfVxuICAgIHNldChzcXVhcmUsIHBpZWNlKSB7XG4gICAgICAgIGNvbnN0IG9sZCA9IHRoaXMudGFrZShzcXVhcmUpO1xuICAgICAgICB0aGlzLm9jY3VwaWVkID0gdGhpcy5vY2N1cGllZC53aXRoKHNxdWFyZSk7XG4gICAgICAgIHRoaXNbcGllY2UuY29sb3JdID0gdGhpc1twaWVjZS5jb2xvcl0ud2l0aChzcXVhcmUpO1xuICAgICAgICB0aGlzW3BpZWNlLnJvbGVdID0gdGhpc1twaWVjZS5yb2xlXS53aXRoKHNxdWFyZSk7XG4gICAgICAgIGlmIChwaWVjZS5wcm9tb3RlZClcbiAgICAgICAgICAgIHRoaXMucHJvbW90ZWQgPSB0aGlzLnByb21vdGVkLndpdGgoc3F1YXJlKTtcbiAgICAgICAgcmV0dXJuIG9sZDtcbiAgICB9XG4gICAgaGFzKHNxdWFyZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vY2N1cGllZC5oYXMoc3F1YXJlKTtcbiAgICB9XG4gICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSB0aGlzLm9jY3VwaWVkW1N5bWJvbC5pdGVyYXRvcl0oKTtcbiAgICAgICAgY29uc3QgbmV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0ga2V5cy5uZXh0KCk7XG4gICAgICAgICAgICBpZiAoZW50cnkuZG9uZSlcbiAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogW2VudHJ5LnZhbHVlLCB0aGlzLmdldChlbnRyeS52YWx1ZSldLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4geyBuZXh0IH07XG4gICAgfVxuICAgIHBpZWNlcyhjb2xvciwgcm9sZSkge1xuICAgICAgICByZXR1cm4gdGhpc1tjb2xvcl0uaW50ZXJzZWN0KHRoaXNbcm9sZV0pO1xuICAgIH1cbiAgICByb29rc0FuZFF1ZWVucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vay51bmlvbih0aGlzLnF1ZWVuKTtcbiAgICB9XG4gICAgYmlzaG9wc0FuZFF1ZWVucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmlzaG9wLnVuaW9uKHRoaXMucXVlZW4pO1xuICAgIH1cbiAgICBraW5nT2YoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua2luZy5pbnRlcnNlY3QodGhpc1tjb2xvcl0pLmRpZmYodGhpcy5wcm9tb3RlZCkuc2luZ2xlU3F1YXJlKCk7XG4gICAgfVxufVxuZXhwb3J0cy5Cb2FyZCA9IEJvYXJkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZXN1bHRfMSA9IHJlcXVpcmUoXCJAYmFkcmFwL3Jlc3VsdFwiKTtcbmNvbnN0IHR5cGVzXzEgPSByZXF1aXJlKFwiLi90eXBlc1wiKTtcbmNvbnN0IHNxdWFyZVNldF8xID0gcmVxdWlyZShcIi4vc3F1YXJlU2V0XCIpO1xuY29uc3QgYm9hcmRfMSA9IHJlcXVpcmUoXCIuL2JvYXJkXCIpO1xuY29uc3QgYXR0YWNrc18xID0gcmVxdWlyZShcIi4vYXR0YWNrc1wiKTtcbmNvbnN0IHV0aWxfMSA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG52YXIgSWxsZWdhbFNldHVwO1xuKGZ1bmN0aW9uIChJbGxlZ2FsU2V0dXApIHtcbiAgICBJbGxlZ2FsU2V0dXBbXCJFbXB0eVwiXSA9IFwiRVJSX0VNUFRZXCI7XG4gICAgSWxsZWdhbFNldHVwW1wiT3Bwb3NpdGVDaGVja1wiXSA9IFwiRVJSX09QUE9TSVRFX0NIRUNLXCI7XG4gICAgSWxsZWdhbFNldHVwW1wiUGF3bnNPbkJhY2tyYW5rXCJdID0gXCJFUlJfUEFXTlNfT05fQkFDS1JBTktcIjtcbiAgICBJbGxlZ2FsU2V0dXBbXCJLaW5nc1wiXSA9IFwiRVJSX0tJTkdTXCI7XG4gICAgSWxsZWdhbFNldHVwW1wiVmFyaWFudFwiXSA9IFwiRVJSX1ZBUklBTlRcIjtcbn0pKElsbGVnYWxTZXR1cCA9IGV4cG9ydHMuSWxsZWdhbFNldHVwIHx8IChleHBvcnRzLklsbGVnYWxTZXR1cCA9IHt9KSk7XG5jbGFzcyBQb3NpdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xufVxuZXhwb3J0cy5Qb3NpdGlvbkVycm9yID0gUG9zaXRpb25FcnJvcjtcbmZ1bmN0aW9uIGF0dGFja3NUbyhzcXVhcmUsIGF0dGFja2VyLCBib2FyZCwgb2NjdXBpZWQpIHtcbiAgICByZXR1cm4gYm9hcmRbYXR0YWNrZXJdLmludGVyc2VjdChhdHRhY2tzXzEucm9va0F0dGFja3Moc3F1YXJlLCBvY2N1cGllZCkuaW50ZXJzZWN0KGJvYXJkLnJvb2tzQW5kUXVlZW5zKCkpXG4gICAgICAgIC51bmlvbihhdHRhY2tzXzEuYmlzaG9wQXR0YWNrcyhzcXVhcmUsIG9jY3VwaWVkKS5pbnRlcnNlY3QoYm9hcmQuYmlzaG9wc0FuZFF1ZWVucygpKSlcbiAgICAgICAgLnVuaW9uKGF0dGFja3NfMS5rbmlnaHRBdHRhY2tzKHNxdWFyZSkuaW50ZXJzZWN0KGJvYXJkLmtuaWdodCkpXG4gICAgICAgIC51bmlvbihhdHRhY2tzXzEua2luZ0F0dGFja3Moc3F1YXJlKS5pbnRlcnNlY3QoYm9hcmQua2luZykpXG4gICAgICAgIC51bmlvbihhdHRhY2tzXzEucGF3bkF0dGFja3ModXRpbF8xLm9wcG9zaXRlKGF0dGFja2VyKSwgc3F1YXJlKS5pbnRlcnNlY3QoYm9hcmQucGF3bikpKTtcbn1cbmZ1bmN0aW9uIGtpbmdDYXN0bGVzVG8oY29sb3IsIHNpZGUpIHtcbiAgICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyAoc2lkZSA9PT0gJ2EnID8gMiA6IDYpIDogKHNpZGUgPT09ICdhJyA/IDU4IDogNjIpO1xufVxuZnVuY3Rpb24gcm9va0Nhc3RsZXNUbyhjb2xvciwgc2lkZSkge1xuICAgIHJldHVybiBjb2xvciA9PT0gJ3doaXRlJyA/IChzaWRlID09PSAnYScgPyAzIDogNSkgOiAoc2lkZSA9PT0gJ2EnID8gNTkgOiA2MSk7XG59XG5jbGFzcyBDYXN0bGVzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICBjb25zdCBjYXN0bGVzID0gbmV3IENhc3RsZXMoKTtcbiAgICAgICAgY2FzdGxlcy51bm1vdmVkUm9va3MgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuY29ybmVycygpO1xuICAgICAgICBjYXN0bGVzLnJvb2sgPSB7XG4gICAgICAgICAgICB3aGl0ZTogeyBhOiAwLCBoOiA3IH0sXG4gICAgICAgICAgICBibGFjazogeyBhOiA1NiwgaDogNjMgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY2FzdGxlcy5wYXRoID0ge1xuICAgICAgICAgICAgd2hpdGU6IHsgYTogbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgweDYwLCAwKSwgaDogbmV3IHNxdWFyZVNldF8xLlNxdWFyZVNldCgwLCAweGUpIH0sXG4gICAgICAgICAgICBibGFjazogeyBhOiBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDAsIDB4NjAwMDAwMDApLCBoOiBuZXcgc3F1YXJlU2V0XzEuU3F1YXJlU2V0KDAsIDB4MGUwMDAwMDApIH0sXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBjYXN0bGVzO1xuICAgIH1cbiAgICBzdGF0aWMgZW1wdHkoKSB7XG4gICAgICAgIGNvbnN0IGNhc3RsZXMgPSBuZXcgQ2FzdGxlcygpO1xuICAgICAgICBjYXN0bGVzLnVubW92ZWRSb29rcyA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBjYXN0bGVzLnJvb2sgPSB7XG4gICAgICAgICAgICB3aGl0ZTogeyBhOiB1bmRlZmluZWQsIGg6IHVuZGVmaW5lZCB9LFxuICAgICAgICAgICAgYmxhY2s6IHsgYTogdW5kZWZpbmVkLCBoOiB1bmRlZmluZWQgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY2FzdGxlcy5wYXRoID0ge1xuICAgICAgICAgICAgd2hpdGU6IHsgYTogc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCksIGg6IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpIH0sXG4gICAgICAgICAgICBibGFjazogeyBhOiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKSwgaDogc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCkgfSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGNhc3RsZXM7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjYXN0bGVzID0gbmV3IENhc3RsZXMoKTtcbiAgICAgICAgY2FzdGxlcy51bm1vdmVkUm9va3MgPSB0aGlzLnVubW92ZWRSb29rcztcbiAgICAgICAgY2FzdGxlcy5yb29rID0ge1xuICAgICAgICAgICAgd2hpdGU6IHsgYTogdGhpcy5yb29rLndoaXRlLmEsIGg6IHRoaXMucm9vay53aGl0ZS5oIH0sXG4gICAgICAgICAgICBibGFjazogeyBhOiB0aGlzLnJvb2suYmxhY2suYSwgaDogdGhpcy5yb29rLmJsYWNrLmggfSxcbiAgICAgICAgfTtcbiAgICAgICAgY2FzdGxlcy5wYXRoID0ge1xuICAgICAgICAgICAgd2hpdGU6IHsgYTogdGhpcy5wYXRoLndoaXRlLmEsIGg6IHRoaXMucGF0aC53aGl0ZS5oIH0sXG4gICAgICAgICAgICBibGFjazogeyBhOiB0aGlzLnBhdGguYmxhY2suYSwgaDogdGhpcy5wYXRoLmJsYWNrLmggfSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGNhc3RsZXM7XG4gICAgfVxuICAgIGFkZChjb2xvciwgc2lkZSwga2luZywgcm9vaykge1xuICAgICAgICBjb25zdCBraW5nVG8gPSBraW5nQ2FzdGxlc1RvKGNvbG9yLCBzaWRlKTtcbiAgICAgICAgY29uc3Qgcm9va1RvID0gcm9va0Nhc3RsZXNUbyhjb2xvciwgc2lkZSk7XG4gICAgICAgIHRoaXMudW5tb3ZlZFJvb2tzID0gdGhpcy51bm1vdmVkUm9va3Mud2l0aChyb29rKTtcbiAgICAgICAgdGhpcy5yb29rW2NvbG9yXVtzaWRlXSA9IHJvb2s7XG4gICAgICAgIHRoaXMucGF0aFtjb2xvcl1bc2lkZV0gPSBhdHRhY2tzXzEuYmV0d2Vlbihyb29rLCByb29rVG8pLndpdGgocm9va1RvKVxuICAgICAgICAgICAgLnVuaW9uKGF0dGFja3NfMS5iZXR3ZWVuKGtpbmcsIGtpbmdUbykud2l0aChraW5nVG8pKVxuICAgICAgICAgICAgLndpdGhvdXQoa2luZykud2l0aG91dChyb29rKTtcbiAgICB9XG4gICAgc3RhdGljIGZyb21TZXR1cChzZXR1cCkge1xuICAgICAgICBjb25zdCBjYXN0bGVzID0gQ2FzdGxlcy5lbXB0eSgpO1xuICAgICAgICBjb25zdCByb29rcyA9IHNldHVwLnVubW92ZWRSb29rcy5pbnRlcnNlY3Qoc2V0dXAuYm9hcmQucm9vayk7XG4gICAgICAgIGZvciAoY29uc3QgY29sb3Igb2YgdHlwZXNfMS5DT0xPUlMpIHtcbiAgICAgICAgICAgIGNvbnN0IGJhY2tyYW5rID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rKGNvbG9yKTtcbiAgICAgICAgICAgIGNvbnN0IGtpbmcgPSBzZXR1cC5ib2FyZC5raW5nT2YoY29sb3IpO1xuICAgICAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChraW5nKSB8fCAhYmFja3JhbmsuaGFzKGtpbmcpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3Qgc2lkZSA9IHJvb2tzLmludGVyc2VjdChzZXR1cC5ib2FyZFtjb2xvcl0pLmludGVyc2VjdChiYWNrcmFuayk7XG4gICAgICAgICAgICBjb25zdCBhU2lkZSA9IHNpZGUuZmlyc3QoKTtcbiAgICAgICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChhU2lkZSkgJiYgYVNpZGUgPCBraW5nKVxuICAgICAgICAgICAgICAgIGNhc3RsZXMuYWRkKGNvbG9yLCAnYScsIGtpbmcsIGFTaWRlKTtcbiAgICAgICAgICAgIGNvbnN0IGhTaWRlID0gc2lkZS5sYXN0KCk7XG4gICAgICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQoaFNpZGUpICYmIGtpbmcgPCBoU2lkZSlcbiAgICAgICAgICAgICAgICBjYXN0bGVzLmFkZChjb2xvciwgJ2gnLCBraW5nLCBoU2lkZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhc3RsZXM7XG4gICAgfVxuICAgIGRpc2NhcmRSb29rKHNxdWFyZSkge1xuICAgICAgICBpZiAodGhpcy51bm1vdmVkUm9va3MuaGFzKHNxdWFyZSkpIHtcbiAgICAgICAgICAgIHRoaXMudW5tb3ZlZFJvb2tzID0gdGhpcy51bm1vdmVkUm9va3Mud2l0aG91dChzcXVhcmUpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiB0eXBlc18xLkNPTE9SUykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc2lkZSBvZiB0eXBlc18xLkNBU1RMSU5HX1NJREVTKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJvb2tbY29sb3JdW3NpZGVdID09PSBzcXVhcmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb2tbY29sb3JdW3NpZGVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBkaXNjYXJkU2lkZShjb2xvcikge1xuICAgICAgICB0aGlzLnVubW92ZWRSb29rcyA9IHRoaXMudW5tb3ZlZFJvb2tzLmRpZmYoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rKGNvbG9yKSk7XG4gICAgICAgIHRoaXMucm9va1tjb2xvcl0uYSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5yb29rW2NvbG9yXS5oID0gdW5kZWZpbmVkO1xuICAgIH1cbn1cbmV4cG9ydHMuQ2FzdGxlcyA9IENhc3RsZXM7XG5jbGFzcyBQb3NpdGlvbiB7XG4gICAgY29uc3RydWN0b3IocnVsZXMpIHtcbiAgICAgICAgdGhpcy5ydWxlcyA9IHJ1bGVzO1xuICAgIH1cbiAgICBraW5nQXR0YWNrZXJzKHNxdWFyZSwgYXR0YWNrZXIsIG9jY3VwaWVkKSB7XG4gICAgICAgIHJldHVybiBhdHRhY2tzVG8oc3F1YXJlLCBhdHRhY2tlciwgdGhpcy5ib2FyZCwgb2NjdXBpZWQpO1xuICAgIH1cbiAgICBkcm9wRGVzdHMoX2N0eCkge1xuICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgfVxuICAgIHBsYXlDYXB0dXJlQXQoc3F1YXJlLCBjYXB0dXJlZCkge1xuICAgICAgICB0aGlzLmhhbGZtb3ZlcyA9IDA7XG4gICAgICAgIGlmIChjYXB0dXJlZC5yb2xlID09PSAncm9vaycpXG4gICAgICAgICAgICB0aGlzLmNhc3RsZXMuZGlzY2FyZFJvb2soc3F1YXJlKTtcbiAgICAgICAgaWYgKHRoaXMucG9ja2V0cylcbiAgICAgICAgICAgIHRoaXMucG9ja2V0c1t1dGlsXzEub3Bwb3NpdGUoY2FwdHVyZWQuY29sb3IpXVtjYXB0dXJlZC5yb2xlXSsrO1xuICAgIH1cbiAgICBjdHgoKSB7XG4gICAgICAgIGNvbnN0IHZhcmlhbnRFbmQgPSB0aGlzLmlzVmFyaWFudEVuZCgpO1xuICAgICAgICBjb25zdCBraW5nID0gdGhpcy5ib2FyZC5raW5nT2YodGhpcy50dXJuKTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChraW5nKSlcbiAgICAgICAgICAgIHJldHVybiB7IGtpbmcsIGJsb2NrZXJzOiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKSwgY2hlY2tlcnM6IHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpLCB2YXJpYW50RW5kLCBtdXN0Q2FwdHVyZTogZmFsc2UgfTtcbiAgICAgICAgY29uc3Qgc25pcGVycyA9IGF0dGFja3NfMS5yb29rQXR0YWNrcyhraW5nLCBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKSkuaW50ZXJzZWN0KHRoaXMuYm9hcmQucm9va3NBbmRRdWVlbnMoKSlcbiAgICAgICAgICAgIC51bmlvbihhdHRhY2tzXzEuYmlzaG9wQXR0YWNrcyhraW5nLCBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKSkuaW50ZXJzZWN0KHRoaXMuYm9hcmQuYmlzaG9wc0FuZFF1ZWVucygpKSlcbiAgICAgICAgICAgIC5pbnRlcnNlY3QodGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKV0pO1xuICAgICAgICBsZXQgYmxvY2tlcnMgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgZm9yIChjb25zdCBzbmlwZXIgb2Ygc25pcGVycykge1xuICAgICAgICAgICAgY29uc3QgYiA9IGF0dGFja3NfMS5iZXR3ZWVuKGtpbmcsIHNuaXBlcikuaW50ZXJzZWN0KHRoaXMuYm9hcmQub2NjdXBpZWQpO1xuICAgICAgICAgICAgaWYgKCFiLm1vcmVUaGFuT25lKCkpXG4gICAgICAgICAgICAgICAgYmxvY2tlcnMgPSBibG9ja2Vycy51bmlvbihiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjaGVja2VycyA9IHRoaXMua2luZ0F0dGFja2VycyhraW5nLCB1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSwgdGhpcy5ib2FyZC5vY2N1cGllZCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBraW5nLFxuICAgICAgICAgICAgYmxvY2tlcnMsXG4gICAgICAgICAgICBjaGVja2VycyxcbiAgICAgICAgICAgIHZhcmlhbnRFbmQsXG4gICAgICAgICAgICBtdXN0Q2FwdHVyZTogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIFRoZSBmb2xsb3dpbmcgc2hvdWxkIGJlIGlkZW50aWNhbCBpbiBhbGwgc3ViY2xhc3Nlc1xuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBwb3MgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcigpO1xuICAgICAgICBwb3MuYm9hcmQgPSB0aGlzLmJvYXJkLmNsb25lKCk7XG4gICAgICAgIHBvcy5wb2NrZXRzID0gdGhpcy5wb2NrZXRzICYmIHRoaXMucG9ja2V0cy5jbG9uZSgpO1xuICAgICAgICBwb3MudHVybiA9IHRoaXMudHVybjtcbiAgICAgICAgcG9zLmNhc3RsZXMgPSB0aGlzLmNhc3RsZXMuY2xvbmUoKTtcbiAgICAgICAgcG9zLmVwU3F1YXJlID0gdGhpcy5lcFNxdWFyZTtcbiAgICAgICAgcG9zLnJlbWFpbmluZ0NoZWNrcyA9IHRoaXMucmVtYWluaW5nQ2hlY2tzICYmIHRoaXMucmVtYWluaW5nQ2hlY2tzLmNsb25lKCk7XG4gICAgICAgIHBvcy5oYWxmbW92ZXMgPSB0aGlzLmhhbGZtb3ZlcztcbiAgICAgICAgcG9zLmZ1bGxtb3ZlcyA9IHRoaXMuZnVsbG1vdmVzO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH1cbiAgICB0b1NldHVwKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYm9hcmQ6IHRoaXMuYm9hcmQuY2xvbmUoKSxcbiAgICAgICAgICAgIHBvY2tldHM6IHRoaXMucG9ja2V0cyAmJiB0aGlzLnBvY2tldHMuY2xvbmUoKSxcbiAgICAgICAgICAgIHR1cm46IHRoaXMudHVybixcbiAgICAgICAgICAgIHVubW92ZWRSb29rczogdGhpcy5jYXN0bGVzLnVubW92ZWRSb29rcyxcbiAgICAgICAgICAgIGVwU3F1YXJlOiB0aGlzLmhhc0xlZ2FsRXAoKSA/IHRoaXMuZXBTcXVhcmUgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICByZW1haW5pbmdDaGVja3M6IHRoaXMucmVtYWluaW5nQ2hlY2tzICYmIHRoaXMucmVtYWluaW5nQ2hlY2tzLmNsb25lKCksXG4gICAgICAgICAgICBoYWxmbW92ZXM6IE1hdGgubWluKHRoaXMuaGFsZm1vdmVzLCAxNTApLFxuICAgICAgICAgICAgZnVsbG1vdmVzOiBNYXRoLm1pbihNYXRoLm1heCh0aGlzLmZ1bGxtb3ZlcywgMSksIDk5OTkpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBpc0luc3VmZmljaWVudE1hdGVyaWFsKCkge1xuICAgICAgICByZXR1cm4gdHlwZXNfMS5DT0xPUlMuZXZlcnkoY29sb3IgPT4gdGhpcy5oYXNJbnN1ZmZpY2llbnRNYXRlcmlhbChjb2xvcikpO1xuICAgIH1cbiAgICBoYXNEZXN0cyhjdHgpIHtcbiAgICAgICAgZm9yIChjb25zdCBzcXVhcmUgb2YgdGhpcy5ib2FyZFt0aGlzLnR1cm5dKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kZXN0cyhzcXVhcmUsIGN0eCkubm9uRW1wdHkoKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5kcm9wRGVzdHMoY3R4KS5ub25FbXB0eSgpO1xuICAgIH1cbiAgICBpc0xlZ2FsKHVjaSwgY3R4KSB7XG4gICAgICAgIGlmICh0eXBlc18xLmlzRHJvcCh1Y2kpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucG9ja2V0cyB8fCB0aGlzLnBvY2tldHNbdGhpcy50dXJuXVt1Y2kucm9sZV0gPD0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAodWNpLnJvbGUgPT09ICdwYXduJyAmJiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuYmFja3JhbmtzKCkuaGFzKHVjaS50bykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZHJvcERlc3RzKGN0eCkuaGFzKHVjaS50byk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAodWNpLnByb21vdGlvbiA9PT0gJ3Bhd24nKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmICh1Y2kucHJvbW90aW9uID09PSAna2luZycgJiYgdGhpcy5ydWxlcyAhPT0gJ2FudGljaGVzcycpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKCF1Y2kucHJvbW90aW9uICYmIHRoaXMuYm9hcmQucGF3bi5oYXModWNpLmZyb20pICYmIHNxdWFyZVNldF8xLlNxdWFyZVNldC5iYWNrcmFua3MoKS5oYXModWNpLnRvKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZXN0cyh1Y2kuZnJvbSwgY3R4KS5oYXModWNpLnRvKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc0NoZWNrKCkge1xuICAgICAgICBjb25zdCBraW5nID0gdGhpcy5ib2FyZC5raW5nT2YodGhpcy50dXJuKTtcbiAgICAgICAgcmV0dXJuIHV0aWxfMS5kZWZpbmVkKGtpbmcpICYmIHRoaXMua2luZ0F0dGFja2VycyhraW5nLCB1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSwgdGhpcy5ib2FyZC5vY2N1cGllZCkubm9uRW1wdHkoKTtcbiAgICB9XG4gICAgaXNFbmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzVmFyaWFudEVuZCgpIHx8IHRoaXMuaXNJbnN1ZmZpY2llbnRNYXRlcmlhbCgpIHx8ICF0aGlzLmhhc0Rlc3RzKHRoaXMuY3R4KCkpO1xuICAgIH1cbiAgICBpc0NoZWNrbWF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNWYXJpYW50RW5kKCkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4KCk7XG4gICAgICAgIHJldHVybiBjdHguY2hlY2tlcnMubm9uRW1wdHkoKSAmJiAhdGhpcy5oYXNEZXN0cyhjdHgpO1xuICAgIH1cbiAgICBpc1N0YWxlbWF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNWYXJpYW50RW5kKCkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4KCk7XG4gICAgICAgIHJldHVybiBjdHguY2hlY2tlcnMuaXNFbXB0eSgpICYmICF0aGlzLmhhc0Rlc3RzKGN0eCk7XG4gICAgfVxuICAgIG91dGNvbWUoKSB7XG4gICAgICAgIGNvbnN0IHZhcmlhbnRPdXRjb21lID0gdGhpcy52YXJpYW50T3V0Y29tZSgpO1xuICAgICAgICBpZiAodmFyaWFudE91dGNvbWUpXG4gICAgICAgICAgICByZXR1cm4gdmFyaWFudE91dGNvbWU7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuaXNDaGVja21hdGUoKSlcbiAgICAgICAgICAgIHJldHVybiB7IHdpbm5lcjogdXRpbF8xLm9wcG9zaXRlKHRoaXMudHVybikgfTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5pc0luc3VmZmljaWVudE1hdGVyaWFsKCkgfHwgdGhpcy5pc1N0YWxlbWF0ZSgpKVxuICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiB1bmRlZmluZWQgfTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhbGxEZXN0cygpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jdHgoKTtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBNYXAoKTtcbiAgICAgICAgaWYgKGN0eC52YXJpYW50RW5kKVxuICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgIGZvciAoY29uc3Qgc3F1YXJlIG9mIHRoaXMuYm9hcmRbdGhpcy50dXJuXSkge1xuICAgICAgICAgICAgZC5zZXQoc3F1YXJlLCB0aGlzLmRlc3RzKHNxdWFyZSwgY3R4KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfVxuICAgIHBsYXkodWNpKSB7XG4gICAgICAgIGNvbnN0IHR1cm4gPSB0aGlzLnR1cm4sIGVwU3F1YXJlID0gdGhpcy5lcFNxdWFyZTtcbiAgICAgICAgdGhpcy5lcFNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5oYWxmbW92ZXMgKz0gMTtcbiAgICAgICAgaWYgKHR1cm4gPT09ICdibGFjaycpXG4gICAgICAgICAgICB0aGlzLmZ1bGxtb3ZlcyArPSAxO1xuICAgICAgICB0aGlzLnR1cm4gPSB1dGlsXzEub3Bwb3NpdGUodHVybik7XG4gICAgICAgIGlmICh0eXBlc18xLmlzRHJvcCh1Y2kpKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLnNldCh1Y2kudG8sIHsgcm9sZTogdWNpLnJvbGUsIGNvbG9yOiB0dXJuIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucG9ja2V0cylcbiAgICAgICAgICAgICAgICB0aGlzLnBvY2tldHNbdHVybl1bdWNpLnJvbGVdLS07XG4gICAgICAgICAgICBpZiAodWNpLnJvbGUgPT09ICdwYXduJylcbiAgICAgICAgICAgICAgICB0aGlzLmhhbGZtb3ZlcyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMuYm9hcmQudGFrZSh1Y2kuZnJvbSk7XG4gICAgICAgICAgICBpZiAoIXBpZWNlKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGxldCBlcENhcHR1cmU7XG4gICAgICAgICAgICBpZiAocGllY2Uucm9sZSA9PT0gJ3Bhd24nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYWxmbW92ZXMgPSAwO1xuICAgICAgICAgICAgICAgIGlmICh1Y2kudG8gPT09IGVwU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVwQ2FwdHVyZSA9IHRoaXMuYm9hcmQudGFrZSh1Y2kudG8gKyAodHVybiA9PT0gJ3doaXRlJyA/IC04IDogOCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBkZWx0YSA9IHVjaS5mcm9tIC0gdWNpLnRvO1xuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhkZWx0YSkgPT09IDE2ICYmIDggPD0gdWNpLmZyb20gJiYgdWNpLmZyb20gPD0gNTUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcFNxdWFyZSA9ICh1Y2kuZnJvbSArIHVjaS50bykgPj4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVjaS5wcm9tb3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcGllY2Uucm9sZSA9IHVjaS5wcm9tb3Rpb247XG4gICAgICAgICAgICAgICAgICAgIHBpZWNlLnByb21vdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwaWVjZS5yb2xlID09PSAncm9vaycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhc3RsZXMuZGlzY2FyZFJvb2sodWNpLmZyb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocGllY2Uucm9sZSA9PT0gJ2tpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVsdGEgPSB1Y2kudG8gLSB1Y2kuZnJvbTtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0Nhc3RsaW5nID0gTWF0aC5hYnMoZGVsdGEpID09PSAyIHx8IHRoaXMuYm9hcmRbdHVybl0uaGFzKHVjaS50byk7XG4gICAgICAgICAgICAgICAgaWYgKGlzQ2FzdGxpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2lkZSA9IGRlbHRhID4gMCA/ICdoJyA6ICdhJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9va0Zyb20gPSB0aGlzLmNhc3RsZXMucm9va1t0dXJuXVtzaWRlXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKHJvb2tGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vayA9IHRoaXMuYm9hcmQudGFrZShyb29rRnJvbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnNldChraW5nQ2FzdGxlc1RvKHR1cm4sIHNpZGUpLCBwaWVjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vaylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnNldChyb29rQ2FzdGxlc1RvKHR1cm4sIHNpZGUpLCByb29rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNhc3RsZXMuZGlzY2FyZFNpZGUodHVybik7XG4gICAgICAgICAgICAgICAgaWYgKGlzQ2FzdGxpbmcpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNhcHR1cmUgPSB0aGlzLmJvYXJkLnNldCh1Y2kudG8sIHBpZWNlKSB8fCBlcENhcHR1cmU7XG4gICAgICAgICAgICBpZiAoY2FwdHVyZSlcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlDYXB0dXJlQXQodWNpLnRvLCBjYXB0dXJlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBoYXNMZWdhbEVwKCkge1xuICAgICAgICBpZiAoIXRoaXMuZXBTcXVhcmUpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4KCk7XG4gICAgICAgIGNvbnN0IG91clBhd25zID0gdGhpcy5ib2FyZC5waWVjZXModGhpcy50dXJuLCAncGF3bicpO1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gb3VyUGF3bnMuaW50ZXJzZWN0KGF0dGFja3NfMS5wYXduQXR0YWNrcyh1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSwgdGhpcy5lcFNxdWFyZSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kZXN0cyhjYW5kaWRhdGUsIGN0eCkuaGFzKHRoaXMuZXBTcXVhcmUpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5leHBvcnRzLlBvc2l0aW9uID0gUG9zaXRpb247XG5jbGFzcyBDaGVzcyBleHRlbmRzIFBvc2l0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihydWxlcykge1xuICAgICAgICBzdXBlcihydWxlcyB8fCAnY2hlc3MnKTtcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IG5ldyB0aGlzKCk7XG4gICAgICAgIHBvcy5ib2FyZCA9IGJvYXJkXzEuQm9hcmQuZGVmYXVsdCgpO1xuICAgICAgICBwb3MucG9ja2V0cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLnR1cm4gPSAnd2hpdGUnO1xuICAgICAgICBwb3MuY2FzdGxlcyA9IENhc3RsZXMuZGVmYXVsdCgpO1xuICAgICAgICBwb3MuZXBTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHBvcy5yZW1haW5pbmdDaGVja3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIHBvcy5oYWxmbW92ZXMgPSAwO1xuICAgICAgICBwb3MuZnVsbG1vdmVzID0gMTtcbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICB9XG4gICAgc3RhdGljIGZyb21TZXR1cChzZXR1cCkge1xuICAgICAgICBjb25zdCBwb3MgPSBuZXcgdGhpcygpO1xuICAgICAgICBwb3MuYm9hcmQgPSBzZXR1cC5ib2FyZC5jbG9uZSgpO1xuICAgICAgICBwb3MucG9ja2V0cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLnR1cm4gPSBzZXR1cC50dXJuO1xuICAgICAgICBwb3MuY2FzdGxlcyA9IENhc3RsZXMuZnJvbVNldHVwKHNldHVwKTtcbiAgICAgICAgcG9zLmVwU3F1YXJlID0gcG9zLnZhbGlkRXBTcXVhcmUoc2V0dXAuZXBTcXVhcmUpO1xuICAgICAgICBwb3MucmVtYWluaW5nQ2hlY2tzID0gdW5kZWZpbmVkO1xuICAgICAgICBwb3MuaGFsZm1vdmVzID0gc2V0dXAuaGFsZm1vdmVzO1xuICAgICAgICBwb3MuZnVsbG1vdmVzID0gc2V0dXAuZnVsbG1vdmVzO1xuICAgICAgICByZXR1cm4gcG9zLnZhbGlkYXRlKCkubWFwKF8gPT4gcG9zKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5jbG9uZSgpO1xuICAgIH1cbiAgICB2YWxpZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQub2NjdXBpZWQuaXNFbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IFBvc2l0aW9uRXJyb3IoSWxsZWdhbFNldHVwLkVtcHR5KSk7XG4gICAgICAgIGlmICh0aGlzLmJvYXJkLmtpbmcuc2l6ZSgpICE9PSAyKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IFBvc2l0aW9uRXJyb3IoSWxsZWdhbFNldHVwLktpbmdzKSk7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQodGhpcy5ib2FyZC5raW5nT2YodGhpcy50dXJuKSkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgUG9zaXRpb25FcnJvcihJbGxlZ2FsU2V0dXAuS2luZ3MpKTtcbiAgICAgICAgY29uc3Qgb3RoZXJLaW5nID0gdGhpcy5ib2FyZC5raW5nT2YodXRpbF8xLm9wcG9zaXRlKHRoaXMudHVybikpO1xuICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKG90aGVyS2luZykpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgUG9zaXRpb25FcnJvcihJbGxlZ2FsU2V0dXAuS2luZ3MpKTtcbiAgICAgICAgaWYgKHRoaXMua2luZ0F0dGFja2VycyhvdGhlcktpbmcsIHRoaXMudHVybiwgdGhpcy5ib2FyZC5vY2N1cGllZCkubm9uRW1wdHkoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IFBvc2l0aW9uRXJyb3IoSWxsZWdhbFNldHVwLk9wcG9zaXRlQ2hlY2spKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rcygpLmludGVyc2VjdHModGhpcy5ib2FyZC5wYXduKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IFBvc2l0aW9uRXJyb3IoSWxsZWdhbFNldHVwLlBhd25zT25CYWNrcmFuaykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2sodW5kZWZpbmVkKTtcbiAgICB9XG4gICAgdmFsaWRFcFNxdWFyZShzcXVhcmUpIHtcbiAgICAgICAgaWYgKCFzcXVhcmUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGVwUmFuayA9IHRoaXMudHVybiA9PT0gJ3doaXRlJyA/IDUgOiAyO1xuICAgICAgICBjb25zdCBmb3J3YXJkID0gdGhpcy50dXJuID09PSAnd2hpdGUnID8gOCA6IC04O1xuICAgICAgICBpZiAoKHNxdWFyZSA+PiAzKSAhPT0gZXBSYW5rKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5vY2N1cGllZC5oYXMoc3F1YXJlICsgZm9yd2FyZCkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHBhd24gPSBzcXVhcmUgLSBmb3J3YXJkO1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmQucGF3bi5oYXMocGF3bikgfHwgIXRoaXMuYm9hcmRbdXRpbF8xLm9wcG9zaXRlKHRoaXMudHVybildLmhhcyhwYXduKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHNxdWFyZTtcbiAgICB9XG4gICAgY2FzdGxpbmdEZXN0KHNpZGUsIGN0eCkge1xuICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKGN0eC5raW5nKSB8fCBjdHguY2hlY2tlcnMubm9uRW1wdHkoKSlcbiAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgY29uc3Qgcm9vayA9IHRoaXMuY2FzdGxlcy5yb29rW3RoaXMudHVybl1bc2lkZV07XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQocm9vaykpXG4gICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGlmICh0aGlzLmNhc3RsZXMucGF0aFt0aGlzLnR1cm5dW3NpZGVdLmludGVyc2VjdHModGhpcy5ib2FyZC5vY2N1cGllZCkpXG4gICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGNvbnN0IGtpbmdUbyA9IGtpbmdDYXN0bGVzVG8odGhpcy50dXJuLCBzaWRlKTtcbiAgICAgICAgY29uc3Qga2luZ1BhdGggPSBhdHRhY2tzXzEuYmV0d2VlbihjdHgua2luZywga2luZ1RvKTtcbiAgICAgICAgY29uc3Qgb2NjID0gdGhpcy5ib2FyZC5vY2N1cGllZC53aXRob3V0KGN0eC5raW5nKTtcbiAgICAgICAgZm9yIChjb25zdCBzcSBvZiBraW5nUGF0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMua2luZ0F0dGFja2VycyhzcSwgdXRpbF8xLm9wcG9zaXRlKHRoaXMudHVybiksIG9jYykubm9uRW1wdHkoKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgcm9va1RvID0gcm9va0Nhc3RsZXNUbyh0aGlzLnR1cm4sIHNpZGUpO1xuICAgICAgICBjb25zdCBhZnRlciA9IHRoaXMuYm9hcmQub2NjdXBpZWQudG9nZ2xlKGN0eC5raW5nKS50b2dnbGUocm9vaykudG9nZ2xlKHJvb2tUbyk7XG4gICAgICAgIGlmICh0aGlzLmtpbmdBdHRhY2tlcnMoa2luZ1RvLCB1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSwgYWZ0ZXIpLm5vbkVtcHR5KCkpXG4gICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShyb29rKTtcbiAgICB9XG4gICAgY2FuQ2FwdHVyZUVwKHBhd24sIGN0eCkge1xuICAgICAgICBpZiAoIXV0aWxfMS5kZWZpbmVkKHRoaXMuZXBTcXVhcmUpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIWF0dGFja3NfMS5wYXduQXR0YWNrcyh0aGlzLnR1cm4sIHBhd24pLmhhcyh0aGlzLmVwU3F1YXJlKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChjdHgua2luZykpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgY29uc3QgY2FwdHVyZWQgPSB0aGlzLmVwU3F1YXJlICsgKCh0aGlzLnR1cm4gPT09ICd3aGl0ZScpID8gLTggOiA4KTtcbiAgICAgICAgY29uc3Qgb2NjdXBpZWQgPSB0aGlzLmJvYXJkLm9jY3VwaWVkLnRvZ2dsZShwYXduKS50b2dnbGUodGhpcy5lcFNxdWFyZSkudG9nZ2xlKGNhcHR1cmVkKTtcbiAgICAgICAgcmV0dXJuICF0aGlzLmtpbmdBdHRhY2tlcnMoY3R4LmtpbmcsIHV0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pLCBvY2N1cGllZCkuaW50ZXJzZWN0cyhvY2N1cGllZCk7XG4gICAgfVxuICAgIHBzZXVkb0Rlc3RzKHNxdWFyZSwgY3R4KSB7XG4gICAgICAgIGlmIChjdHgudmFyaWFudEVuZClcbiAgICAgICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgY29uc3QgcGllY2UgPSB0aGlzLmJvYXJkLmdldChzcXVhcmUpO1xuICAgICAgICBpZiAoIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSB0aGlzLnR1cm4pXG4gICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGxldCBwc2V1ZG8gPSBhdHRhY2tzXzEuYXR0YWNrcyhwaWVjZSwgc3F1YXJlLCB0aGlzLmJvYXJkLm9jY3VwaWVkKTtcbiAgICAgICAgaWYgKHBpZWNlLnJvbGUgPT09ICdwYXduJykge1xuICAgICAgICAgICAgbGV0IGNhcHR1cmVUYXJnZXRzID0gdGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKV07XG4gICAgICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQodGhpcy5lcFNxdWFyZSkpXG4gICAgICAgICAgICAgICAgY2FwdHVyZVRhcmdldHMgPSBjYXB0dXJlVGFyZ2V0cy53aXRoKHRoaXMuZXBTcXVhcmUpO1xuICAgICAgICAgICAgcHNldWRvID0gcHNldWRvLmludGVyc2VjdChjYXB0dXJlVGFyZ2V0cyk7XG4gICAgICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMudHVybiA9PT0gJ3doaXRlJyA/IDggOiAtODtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSBzcXVhcmUgKyBkZWx0YTtcbiAgICAgICAgICAgIGlmICgwIDw9IHN0ZXAgJiYgc3RlcCA8IDY0ICYmICF0aGlzLmJvYXJkLm9jY3VwaWVkLmhhcyhzdGVwKSkge1xuICAgICAgICAgICAgICAgIHBzZXVkbyA9IHBzZXVkby53aXRoKHN0ZXApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbkRvdWJsZVN0ZXAgPSB0aGlzLnR1cm4gPT09ICd3aGl0ZScgPyAoc3F1YXJlIDwgMTYpIDogKHNxdWFyZSA+PSA2NCAtIDE2KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkb3VibGVTdGVwID0gc3RlcCArIGRlbHRhO1xuICAgICAgICAgICAgICAgIGlmIChjYW5Eb3VibGVTdGVwICYmICF0aGlzLmJvYXJkLm9jY3VwaWVkLmhhcyhkb3VibGVTdGVwKSkge1xuICAgICAgICAgICAgICAgICAgICBwc2V1ZG8gPSBwc2V1ZG8ud2l0aChkb3VibGVTdGVwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHNldWRvO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcHNldWRvID0gcHNldWRvLmRpZmYodGhpcy5ib2FyZFt0aGlzLnR1cm5dKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3F1YXJlID09PSBjdHgua2luZylcbiAgICAgICAgICAgIHJldHVybiBwc2V1ZG8udW5pb24odGhpcy5jYXN0bGluZ0Rlc3QoJ2EnLCBjdHgpKS51bmlvbih0aGlzLmNhc3RsaW5nRGVzdCgnaCcsIGN0eCkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gcHNldWRvO1xuICAgIH1cbiAgICBkZXN0cyhzcXVhcmUsIGN0eCkge1xuICAgICAgICBpZiAoY3R4LnZhcmlhbnRFbmQpXG4gICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGNvbnN0IHBpZWNlID0gdGhpcy5ib2FyZC5nZXQoc3F1YXJlKTtcbiAgICAgICAgaWYgKCFwaWVjZSB8fCBwaWVjZS5jb2xvciAhPT0gdGhpcy50dXJuKVxuICAgICAgICAgICAgcmV0dXJuIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICBsZXQgcHNldWRvLCBsZWdhbDtcbiAgICAgICAgaWYgKHBpZWNlLnJvbGUgPT09ICdwYXduJykge1xuICAgICAgICAgICAgcHNldWRvID0gYXR0YWNrc18xLnBhd25BdHRhY2tzKHRoaXMudHVybiwgc3F1YXJlKS5pbnRlcnNlY3QodGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKV0pO1xuICAgICAgICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLnR1cm4gPT09ICd3aGl0ZScgPyA4IDogLTg7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gc3F1YXJlICsgZGVsdGE7XG4gICAgICAgICAgICBpZiAoMCA8PSBzdGVwICYmIHN0ZXAgPCA2NCAmJiAhdGhpcy5ib2FyZC5vY2N1cGllZC5oYXMoc3RlcCkpIHtcbiAgICAgICAgICAgICAgICBwc2V1ZG8gPSBwc2V1ZG8ud2l0aChzdGVwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5Eb3VibGVTdGVwID0gdGhpcy50dXJuID09PSAnd2hpdGUnID8gKHNxdWFyZSA8IDE2KSA6IChzcXVhcmUgPj0gNjQgLSAxNik7XG4gICAgICAgICAgICAgICAgY29uc3QgZG91YmxlU3RlcCA9IHN0ZXAgKyBkZWx0YTtcbiAgICAgICAgICAgICAgICBpZiAoY2FuRG91YmxlU3RlcCAmJiAhdGhpcy5ib2FyZC5vY2N1cGllZC5oYXMoZG91YmxlU3RlcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHNldWRvID0gcHNldWRvLndpdGgoZG91YmxlU3RlcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKHRoaXMuZXBTcXVhcmUpICYmIHRoaXMuY2FuQ2FwdHVyZUVwKHNxdWFyZSwgY3R4KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhd24gPSB0aGlzLmVwU3F1YXJlIC0gZGVsdGE7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5jaGVja2Vycy5pc0VtcHR5KCkgfHwgY3R4LmNoZWNrZXJzLnNpbmdsZVNxdWFyZSgpID09PSBwYXduKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZ2FsID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmZyb21TcXVhcmUodGhpcy5lcFNxdWFyZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBpZWNlLnJvbGUgPT09ICdiaXNob3AnKVxuICAgICAgICAgICAgcHNldWRvID0gYXR0YWNrc18xLmJpc2hvcEF0dGFja3Moc3F1YXJlLCB0aGlzLmJvYXJkLm9jY3VwaWVkKTtcbiAgICAgICAgZWxzZSBpZiAocGllY2Uucm9sZSA9PT0gJ2tuaWdodCcpXG4gICAgICAgICAgICBwc2V1ZG8gPSBhdHRhY2tzXzEua25pZ2h0QXR0YWNrcyhzcXVhcmUpO1xuICAgICAgICBlbHNlIGlmIChwaWVjZS5yb2xlID09PSAncm9vaycpXG4gICAgICAgICAgICBwc2V1ZG8gPSBhdHRhY2tzXzEucm9va0F0dGFja3Moc3F1YXJlLCB0aGlzLmJvYXJkLm9jY3VwaWVkKTtcbiAgICAgICAgZWxzZSBpZiAocGllY2Uucm9sZSA9PT0gJ3F1ZWVuJylcbiAgICAgICAgICAgIHBzZXVkbyA9IGF0dGFja3NfMS5xdWVlbkF0dGFja3Moc3F1YXJlLCB0aGlzLmJvYXJkLm9jY3VwaWVkKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHNldWRvID0gYXR0YWNrc18xLmtpbmdBdHRhY2tzKHNxdWFyZSk7XG4gICAgICAgIHBzZXVkbyA9IHBzZXVkby5kaWZmKHRoaXMuYm9hcmRbdGhpcy50dXJuXSk7XG4gICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChjdHgua2luZykpIHtcbiAgICAgICAgICAgIGlmIChwaWVjZS5yb2xlID09PSAna2luZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvY2MgPSB0aGlzLmJvYXJkLm9jY3VwaWVkLndpdGhvdXQoc3F1YXJlKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRvIG9mIHBzZXVkbykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5raW5nQXR0YWNrZXJzKHRvLCB1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSwgb2NjKS5ub25FbXB0eSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcHNldWRvID0gcHNldWRvLndpdGhvdXQodG8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcHNldWRvLnVuaW9uKHRoaXMuY2FzdGxpbmdEZXN0KCdhJywgY3R4KSkudW5pb24odGhpcy5jYXN0bGluZ0Rlc3QoJ2gnLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdHguY2hlY2tlcnMubm9uRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrZXIgPSBjdHguY2hlY2tlcnMuc2luZ2xlU3F1YXJlKCk7XG4gICAgICAgICAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChjaGVja2VyKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICAgICAgICAgIHBzZXVkbyA9IHBzZXVkby5pbnRlcnNlY3QoYXR0YWNrc18xLmJldHdlZW4oY2hlY2tlciwgY3R4LmtpbmcpLndpdGgoY2hlY2tlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN0eC5ibG9ja2Vycy5oYXMoc3F1YXJlKSlcbiAgICAgICAgICAgICAgICBwc2V1ZG8gPSBwc2V1ZG8uaW50ZXJzZWN0KGF0dGFja3NfMS5yYXkoc3F1YXJlLCBjdHgua2luZykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZWdhbClcbiAgICAgICAgICAgIHBzZXVkbyA9IHBzZXVkby51bmlvbihsZWdhbCk7XG4gICAgICAgIHJldHVybiBwc2V1ZG87XG4gICAgfVxuICAgIGlzVmFyaWFudEVuZCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXJpYW50T3V0Y29tZSgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBoYXNJbnN1ZmZpY2llbnRNYXRlcmlhbChjb2xvcikge1xuICAgICAgICBpZiAodGhpcy5ib2FyZFtjb2xvcl0uaW50ZXJzZWN0KHRoaXMuYm9hcmQucGF3bi51bmlvbih0aGlzLmJvYXJkLnJvb2tzQW5kUXVlZW5zKCkpKS5ub25FbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5ib2FyZFtjb2xvcl0uaW50ZXJzZWN0cyh0aGlzLmJvYXJkLmtuaWdodCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJvYXJkW2NvbG9yXS5zaXplKCkgPD0gMiAmJlxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmRbdXRpbF8xLm9wcG9zaXRlKGNvbG9yKV0uZGlmZih0aGlzLmJvYXJkLmtpbmcpLmRpZmYodGhpcy5ib2FyZC5xdWVlbikuaXNFbXB0eSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmJvYXJkW2NvbG9yXS5pbnRlcnNlY3RzKHRoaXMuYm9hcmQuYmlzaG9wKSkge1xuICAgICAgICAgICAgY29uc3Qgc2FtZUNvbG9yID0gIXRoaXMuYm9hcmQuYmlzaG9wLmludGVyc2VjdHMoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmRhcmtTcXVhcmVzKCkpIHx8XG4gICAgICAgICAgICAgICAgIXRoaXMuYm9hcmQuYmlzaG9wLmludGVyc2VjdHMoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmxpZ2h0U3F1YXJlcygpKTtcbiAgICAgICAgICAgIHJldHVybiBzYW1lQ29sb3IgJiYgdGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUoY29sb3IpXS5kaWZmKHRoaXMuYm9hcmQua2luZykuZGlmZih0aGlzLmJvYXJkLnJvb2spLmRpZmYodGhpcy5ib2FyZC5xdWVlbikuaXNFbXB0eSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbmV4cG9ydHMuQ2hlc3MgPSBDaGVzcztcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcmVzdWx0XzEgPSByZXF1aXJlKFwiQGJhZHJhcC9yZXN1bHRcIik7XG5jb25zdCB0eXBlc18xID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XG5jb25zdCBzcXVhcmVTZXRfMSA9IHJlcXVpcmUoXCIuL3NxdWFyZVNldFwiKTtcbmNvbnN0IGJvYXJkXzEgPSByZXF1aXJlKFwiLi9ib2FyZFwiKTtcbmNvbnN0IHNldHVwXzEgPSByZXF1aXJlKFwiLi9zZXR1cFwiKTtcbmNvbnN0IHV0aWxfMSA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG5leHBvcnRzLklOSVRJQUxfQk9BUkRfRkVOID0gJ3JuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlInO1xuZXhwb3J0cy5JTklUSUFMX0VQRCA9IGV4cG9ydHMuSU5JVElBTF9CT0FSRF9GRU4gKyAnIHcgS1FrcSAtJztcbmV4cG9ydHMuSU5JVElBTF9GRU4gPSBleHBvcnRzLklOSVRJQUxfRVBEICsgJyAwIDEnO1xuZXhwb3J0cy5FTVBUWV9CT0FSRF9GRU4gPSAnOC84LzgvOC84LzgvOC84JztcbmV4cG9ydHMuRU1QVFlfRVBEID0gZXhwb3J0cy5FTVBUWV9CT0FSRF9GRU4gKyAnIHcgLSAtJztcbmV4cG9ydHMuRU1QVFlfRkVOID0gZXhwb3J0cy5FTVBUWV9FUEQgKyAnIDAgMSc7XG52YXIgSW52YWxpZEZlbjtcbihmdW5jdGlvbiAoSW52YWxpZEZlbikge1xuICAgIEludmFsaWRGZW5bXCJGZW5cIl0gPSBcIkVSUl9GRU5cIjtcbiAgICBJbnZhbGlkRmVuW1wiQm9hcmRcIl0gPSBcIkVSUl9CT0FSRFwiO1xuICAgIEludmFsaWRGZW5bXCJQb2NrZXRzXCJdID0gXCJFUlJfUE9DS0VUU1wiO1xuICAgIEludmFsaWRGZW5bXCJUdXJuXCJdID0gXCJFUlJfVFVSTlwiO1xuICAgIEludmFsaWRGZW5bXCJDYXN0bGluZ1wiXSA9IFwiRVJSX0NBU1RMSU5HXCI7XG4gICAgSW52YWxpZEZlbltcIkVwU3F1YXJlXCJdID0gXCJFUlJfRVBfU1FVQVJFXCI7XG4gICAgSW52YWxpZEZlbltcIlJlbWFpbmluZ0NoZWNrc1wiXSA9IFwiRVJSX1JFTUFJTklOR19DSEVDS1NcIjtcbiAgICBJbnZhbGlkRmVuW1wiSGFsZm1vdmVzXCJdID0gXCJFUlJfSEFMRk1PVkVTXCI7XG4gICAgSW52YWxpZEZlbltcIkZ1bGxtb3Zlc1wiXSA9IFwiRVJSX0ZVTExNT1ZFU1wiO1xufSkoSW52YWxpZEZlbiA9IGV4cG9ydHMuSW52YWxpZEZlbiB8fCAoZXhwb3J0cy5JbnZhbGlkRmVuID0ge30pKTtcbmNsYXNzIEZlbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xufVxuZXhwb3J0cy5GZW5FcnJvciA9IEZlbkVycm9yO1xuZnVuY3Rpb24gbnRoSW5kZXhPZihoYXlzdGFjaywgbmVlZGxlLCBuKSB7XG4gICAgbGV0IGluZGV4ID0gaGF5c3RhY2suaW5kZXhPZihuZWVkbGUpO1xuICAgIHdoaWxlIChuLS0gPiAwKSB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgaW5kZXggPSBoYXlzdGFjay5pbmRleE9mKG5lZWRsZSwgaW5kZXggKyBuZWVkbGUubGVuZ3RoKTtcbiAgICB9XG4gICAgcmV0dXJuIGluZGV4O1xufVxuZnVuY3Rpb24gcGFyc2VTbWFsbFVpbnQoc3RyKSB7XG4gICAgcmV0dXJuIC9eXFxkezEsNH0kLy50ZXN0KHN0cikgPyBwYXJzZUludChzdHIsIDEwKSA6IHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIGNoYXJUb1BpZWNlKGNoKSB7XG4gICAgY29uc3Qgcm9sZSA9IHV0aWxfMS5jaGFyVG9Sb2xlKGNoKTtcbiAgICByZXR1cm4gcm9sZSAmJiB7IHJvbGUsIGNvbG9yOiBjaC50b0xvd2VyQ2FzZSgpID09PSBjaCA/ICdibGFjaycgOiAnd2hpdGUnIH07XG59XG5mdW5jdGlvbiBwYXJzZUJvYXJkRmVuKGJvYXJkUGFydCkge1xuICAgIGNvbnN0IGJvYXJkID0gYm9hcmRfMS5Cb2FyZC5lbXB0eSgpO1xuICAgIGxldCByYW5rID0gNztcbiAgICBsZXQgZmlsZSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2FyZFBhcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYyA9IGJvYXJkUGFydFtpXTtcbiAgICAgICAgaWYgKGMgPT09ICcvJyAmJiBmaWxlID09PSA4KSB7XG4gICAgICAgICAgICBmaWxlID0gMDtcbiAgICAgICAgICAgIHJhbmstLTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSBwYXJzZUludChjLCAxMCk7XG4gICAgICAgICAgICBpZiAoc3RlcClcbiAgICAgICAgICAgICAgICBmaWxlICs9IHN0ZXA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsZSA+PSA4IHx8IHJhbmsgPCAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5Cb2FyZCkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNxdWFyZSA9IGZpbGUgKyByYW5rICogODtcbiAgICAgICAgICAgICAgICBjb25zdCBwaWVjZSA9IGNoYXJUb1BpZWNlKGMpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2UpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLkJvYXJkKSk7XG4gICAgICAgICAgICAgICAgaWYgKGJvYXJkUGFydFtpICsgMV0gPT09ICd+Jykge1xuICAgICAgICAgICAgICAgICAgICBwaWVjZS5wcm9tb3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYm9hcmQuc2V0KHNxdWFyZSwgcGllY2UpO1xuICAgICAgICAgICAgICAgIGZpbGUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocmFuayAhPT0gMCB8fCBmaWxlICE9PSA4KVxuICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5Cb2FyZCkpO1xuICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2soYm9hcmQpO1xufVxuZXhwb3J0cy5wYXJzZUJvYXJkRmVuID0gcGFyc2VCb2FyZEZlbjtcbmZ1bmN0aW9uIHBhcnNlUG9ja2V0cyhwb2NrZXRQYXJ0KSB7XG4gICAgaWYgKHBvY2tldFBhcnQubGVuZ3RoID4gNjQpXG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLlBvY2tldHMpKTtcbiAgICBjb25zdCBwb2NrZXRzID0gc2V0dXBfMS5NYXRlcmlhbC5lbXB0eSgpO1xuICAgIGZvciAoY29uc3QgYyBvZiBwb2NrZXRQYXJ0KSB7XG4gICAgICAgIGNvbnN0IHBpZWNlID0gY2hhclRvUGllY2UoYyk7XG4gICAgICAgIGlmICghcGllY2UpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5Qb2NrZXRzKSk7XG4gICAgICAgIHBvY2tldHNbcGllY2UuY29sb3JdW3BpZWNlLnJvbGVdKys7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2socG9ja2V0cyk7XG59XG5leHBvcnRzLnBhcnNlUG9ja2V0cyA9IHBhcnNlUG9ja2V0cztcbmZ1bmN0aW9uIHBhcnNlQ2FzdGxpbmdGZW4oYm9hcmQsIGNhc3RsaW5nUGFydCkge1xuICAgIGxldCB1bm1vdmVkUm9va3MgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICBpZiAoY2FzdGxpbmdQYXJ0ID09PSAnLScpXG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2sodW5tb3ZlZFJvb2tzKTtcbiAgICBpZiAoIS9eW0tRQUJDREVGR0hdezAsMn1ba3FhYmNkZWZnaF17MCwyfSQvLnRlc3QoY2FzdGxpbmdQYXJ0KSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5DYXN0bGluZykpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGMgb2YgY2FzdGxpbmdQYXJ0KSB7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gYy50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBjb2xvciA9IGMgPT09IGxvd2VyID8gJ2JsYWNrJyA6ICd3aGl0ZSc7XG4gICAgICAgIGNvbnN0IGJhY2tyYW5rID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rKGNvbG9yKS5pbnRlcnNlY3QoYm9hcmRbY29sb3JdKTtcbiAgICAgICAgbGV0IGNhbmRpZGF0ZXM7XG4gICAgICAgIGlmIChsb3dlciA9PT0gJ3EnKVxuICAgICAgICAgICAgY2FuZGlkYXRlcyA9IGJhY2tyYW5rO1xuICAgICAgICBlbHNlIGlmIChsb3dlciA9PT0gJ2snKVxuICAgICAgICAgICAgY2FuZGlkYXRlcyA9IGJhY2tyYW5rLnJldmVyc2VkKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNhbmRpZGF0ZXMgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZnJvbVNxdWFyZShsb3dlci5jaGFyQ29kZUF0KDApIC0gJ2EnLmNoYXJDb2RlQXQoMCkpLmludGVyc2VjdChiYWNrcmFuayk7XG4gICAgICAgIGZvciAoY29uc3Qgc3F1YXJlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgICAgIGlmIChib2FyZC5raW5nLmhhcyhzcXVhcmUpICYmICFib2FyZC5wcm9tb3RlZC5oYXMoc3F1YXJlKSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGlmIChib2FyZC5yb29rLmhhcyhzcXVhcmUpKSB7XG4gICAgICAgICAgICAgICAgdW5tb3ZlZFJvb2tzID0gdW5tb3ZlZFJvb2tzLndpdGgoc3F1YXJlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0Lm9rKHVubW92ZWRSb29rcyk7XG59XG5leHBvcnRzLnBhcnNlQ2FzdGxpbmdGZW4gPSBwYXJzZUNhc3RsaW5nRmVuO1xuZnVuY3Rpb24gcGFyc2VSZW1haW5pbmdDaGVja3MocGFydCkge1xuICAgIGNvbnN0IHBhcnRzID0gcGFydC5zcGxpdCgnKycpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDMgJiYgcGFydHNbMF0gPT09ICcnKSB7XG4gICAgICAgIGNvbnN0IHdoaXRlID0gcGFyc2VTbWFsbFVpbnQocGFydHNbMV0pO1xuICAgICAgICBjb25zdCBibGFjayA9IHBhcnNlU21hbGxVaW50KHBhcnRzWzJdKTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZCh3aGl0ZSkgfHwgd2hpdGUgPiAzIHx8ICF1dGlsXzEuZGVmaW5lZChibGFjaykgfHwgYmxhY2sgPiAzKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uUmVtYWluaW5nQ2hlY2tzKSk7XG4gICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQub2sobmV3IHNldHVwXzEuUmVtYWluaW5nQ2hlY2tzKDMgLSB3aGl0ZSwgMyAtIGJsYWNrKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBjb25zdCB3aGl0ZSA9IHBhcnNlU21hbGxVaW50KHBhcnRzWzBdKTtcbiAgICAgICAgY29uc3QgYmxhY2sgPSBwYXJzZVNtYWxsVWludChwYXJ0c1sxXSk7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQod2hpdGUpIHx8IHdoaXRlID4gMyB8fCAhdXRpbF8xLmRlZmluZWQoYmxhY2spIHx8IGJsYWNrID4gMylcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLlJlbWFpbmluZ0NoZWNrcykpO1xuICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0Lm9rKG5ldyBzZXR1cF8xLlJlbWFpbmluZ0NoZWNrcyh3aGl0ZSwgYmxhY2spKTtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5SZW1haW5pbmdDaGVja3MpKTtcbn1cbmV4cG9ydHMucGFyc2VSZW1haW5pbmdDaGVja3MgPSBwYXJzZVJlbWFpbmluZ0NoZWNrcztcbmZ1bmN0aW9uIHBhcnNlRmVuKGZlbikge1xuICAgIGNvbnN0IHBhcnRzID0gZmVuLnNwbGl0KCcgJyk7XG4gICAgY29uc3QgYm9hcmRQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAvLyBCb2FyZCBhbmQgcG9ja2V0c1xuICAgIGxldCBib2FyZCwgcG9ja2V0cyA9IHJlc3VsdF8xLlJlc3VsdC5vayh1bmRlZmluZWQpO1xuICAgIGlmIChib2FyZFBhcnQuZW5kc1dpdGgoJ10nKSkge1xuICAgICAgICBjb25zdCBwb2NrZXRTdGFydCA9IGJvYXJkUGFydC5pbmRleE9mKCdbJyk7XG4gICAgICAgIGlmIChwb2NrZXRTdGFydCA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5GZW4pKTtcbiAgICAgICAgYm9hcmQgPSBwYXJzZUJvYXJkRmVuKGJvYXJkUGFydC5zdWJzdHIoMCwgcG9ja2V0U3RhcnQpKTtcbiAgICAgICAgcG9ja2V0cyA9IHBhcnNlUG9ja2V0cyhib2FyZFBhcnQuc3Vic3RyKHBvY2tldFN0YXJ0ICsgMSwgYm9hcmRQYXJ0Lmxlbmd0aCAtIDEgLSBwb2NrZXRTdGFydCAtIDEpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHBvY2tldFN0YXJ0ID0gbnRoSW5kZXhPZihib2FyZFBhcnQsICcvJywgNyk7XG4gICAgICAgIGlmIChwb2NrZXRTdGFydCA9PT0gLTEpXG4gICAgICAgICAgICBib2FyZCA9IHBhcnNlQm9hcmRGZW4oYm9hcmRQYXJ0KTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBib2FyZCA9IHBhcnNlQm9hcmRGZW4oYm9hcmRQYXJ0LnN1YnN0cigwLCBwb2NrZXRTdGFydCkpO1xuICAgICAgICAgICAgcG9ja2V0cyA9IHBhcnNlUG9ja2V0cyhib2FyZFBhcnQuc3Vic3RyKHBvY2tldFN0YXJ0ICsgMSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFR1cm5cbiAgICBsZXQgdHVybjtcbiAgICBjb25zdCB0dXJuUGFydCA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgaWYgKCF1dGlsXzEuZGVmaW5lZCh0dXJuUGFydCkgfHwgdHVyblBhcnQgPT09ICd3JylcbiAgICAgICAgdHVybiA9ICd3aGl0ZSc7XG4gICAgZWxzZSBpZiAodHVyblBhcnQgPT09ICdiJylcbiAgICAgICAgdHVybiA9ICdibGFjayc7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgRmVuRXJyb3IoSW52YWxpZEZlbi5UdXJuKSk7XG4gICAgcmV0dXJuIGJvYXJkLmNoYWluKGJvYXJkID0+IHtcbiAgICAgICAgLy8gQ2FzdGxpbmdcbiAgICAgICAgY29uc3QgY2FzdGxpbmdQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgY29uc3QgdW5tb3ZlZFJvb2tzID0gdXRpbF8xLmRlZmluZWQoY2FzdGxpbmdQYXJ0KSA/IHBhcnNlQ2FzdGxpbmdGZW4oYm9hcmQsIGNhc3RsaW5nUGFydCkgOiByZXN1bHRfMS5SZXN1bHQub2soc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCkpO1xuICAgICAgICAvLyBFbiBwYXNzYW50IHNxdWFyZVxuICAgICAgICBjb25zdCBlcFBhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICBsZXQgZXBTcXVhcmU7XG4gICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChlcFBhcnQpICYmIGVwUGFydCAhPT0gJy0nKSB7XG4gICAgICAgICAgICBlcFNxdWFyZSA9IHV0aWxfMS5wYXJzZVNxdWFyZShlcFBhcnQpO1xuICAgICAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChlcFNxdWFyZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uRXBTcXVhcmUpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIYWxmbW92ZXMgb3IgcmVtYWluaW5nIGNoZWNrc1xuICAgICAgICBsZXQgaGFsZm1vdmVQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgbGV0IGVhcmx5UmVtYWluaW5nQ2hlY2tzO1xuICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQoaGFsZm1vdmVQYXJ0KSAmJiBoYWxmbW92ZVBhcnQuaW5jbHVkZXMoJysnKSkge1xuICAgICAgICAgICAgZWFybHlSZW1haW5pbmdDaGVja3MgPSBwYXJzZVJlbWFpbmluZ0NoZWNrcyhoYWxmbW92ZVBhcnQpO1xuICAgICAgICAgICAgaGFsZm1vdmVQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYWxmbW92ZXMgPSB1dGlsXzEuZGVmaW5lZChoYWxmbW92ZVBhcnQpID8gcGFyc2VTbWFsbFVpbnQoaGFsZm1vdmVQYXJ0KSA6IDA7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQoaGFsZm1vdmVzKSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLkhhbGZtb3ZlcykpO1xuICAgICAgICBjb25zdCBmdWxsbW92ZXNQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgY29uc3QgZnVsbG1vdmVzID0gdXRpbF8xLmRlZmluZWQoZnVsbG1vdmVzUGFydCkgPyBwYXJzZVNtYWxsVWludChmdWxsbW92ZXNQYXJ0KSA6IDE7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQoZnVsbG1vdmVzKSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLkZ1bGxtb3ZlcykpO1xuICAgICAgICBjb25zdCByZW1haW5pbmdDaGVja3NQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgbGV0IHJlbWFpbmluZ0NoZWNrcyA9IHJlc3VsdF8xLlJlc3VsdC5vayh1bmRlZmluZWQpO1xuICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQocmVtYWluaW5nQ2hlY2tzUGFydCkpIHtcbiAgICAgICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChlYXJseVJlbWFpbmluZ0NoZWNrcykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IEZlbkVycm9yKEludmFsaWRGZW4uUmVtYWluaW5nQ2hlY2tzKSk7XG4gICAgICAgICAgICByZW1haW5pbmdDaGVja3MgPSBwYXJzZVJlbWFpbmluZ0NoZWNrcyhyZW1haW5pbmdDaGVja3NQYXJ0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1dGlsXzEuZGVmaW5lZChlYXJseVJlbWFpbmluZ0NoZWNrcykpIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoZWNrcyA9IGVhcmx5UmVtYWluaW5nQ2hlY2tzO1xuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBGZW5FcnJvcihJbnZhbGlkRmVuLkZlbikpO1xuICAgICAgICByZXR1cm4gcG9ja2V0cy5jaGFpbihwb2NrZXRzID0+IHVubW92ZWRSb29rcy5jaGFpbih1bm1vdmVkUm9va3MgPT4gcmVtYWluaW5nQ2hlY2tzLm1hcChyZW1haW5pbmdDaGVja3MgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBib2FyZCxcbiAgICAgICAgICAgICAgICBwb2NrZXRzLFxuICAgICAgICAgICAgICAgIHR1cm4sXG4gICAgICAgICAgICAgICAgdW5tb3ZlZFJvb2tzLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ0NoZWNrcyxcbiAgICAgICAgICAgICAgICBlcFNxdWFyZSxcbiAgICAgICAgICAgICAgICBoYWxmbW92ZXMsXG4gICAgICAgICAgICAgICAgZnVsbG1vdmVzOiBNYXRoLm1heCgxLCBmdWxsbW92ZXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSkpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5wYXJzZUZlbiA9IHBhcnNlRmVuO1xuZnVuY3Rpb24gcGFyc2VQaWVjZShzdHIpIHtcbiAgICBpZiAoIXN0cilcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IHBpZWNlID0gY2hhclRvUGllY2Uoc3RyWzBdKTtcbiAgICBpZiAoIXBpZWNlKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKHN0ci5sZW5ndGggPT09IDIgJiYgc3RyWzFdID09PSAnficpXG4gICAgICAgIHBpZWNlLnByb21vdGVkID0gdHJ1ZTtcbiAgICBlbHNlIGlmIChzdHIubGVuZ3RoID4gMSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHJldHVybiBwaWVjZTtcbn1cbmV4cG9ydHMucGFyc2VQaWVjZSA9IHBhcnNlUGllY2U7XG5mdW5jdGlvbiBtYWtlUGllY2UocGllY2UsIG9wdHMpIHtcbiAgICBsZXQgciA9IHV0aWxfMS5yb2xlVG9DaGFyKHBpZWNlLnJvbGUpO1xuICAgIGlmIChwaWVjZS5jb2xvciA9PT0gJ3doaXRlJylcbiAgICAgICAgciA9IHIudG9VcHBlckNhc2UoKTtcbiAgICBpZiAob3B0cyAmJiBvcHRzLnByb21vdGVkICYmIHBpZWNlLnByb21vdGVkKVxuICAgICAgICByICs9ICd+JztcbiAgICByZXR1cm4gcjtcbn1cbmV4cG9ydHMubWFrZVBpZWNlID0gbWFrZVBpZWNlO1xuZnVuY3Rpb24gbWFrZUJvYXJkRmVuKGJvYXJkLCBvcHRzKSB7XG4gICAgbGV0IGZlbiA9ICcnO1xuICAgIGxldCBlbXB0eSA9IDA7XG4gICAgZm9yIChsZXQgcmFuayA9IDc7IHJhbmsgPj0gMDsgcmFuay0tKSB7XG4gICAgICAgIGZvciAobGV0IGZpbGUgPSAwOyBmaWxlIDwgODsgZmlsZSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzcXVhcmUgPSBmaWxlICsgcmFuayAqIDg7XG4gICAgICAgICAgICBjb25zdCBwaWVjZSA9IGJvYXJkLmdldChzcXVhcmUpO1xuICAgICAgICAgICAgaWYgKCFwaWVjZSlcbiAgICAgICAgICAgICAgICBlbXB0eSsrO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGVtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGZlbiArPSBlbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgZW1wdHkgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmZW4gKz0gbWFrZVBpZWNlKHBpZWNlLCBvcHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWxlID09PSA3KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGZlbiArPSBlbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgZW1wdHkgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmFuayAhPT0gMClcbiAgICAgICAgICAgICAgICAgICAgZmVuICs9ICcvJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmVuO1xufVxuZXhwb3J0cy5tYWtlQm9hcmRGZW4gPSBtYWtlQm9hcmRGZW47XG5mdW5jdGlvbiBtYWtlUG9ja2V0KG1hdGVyaWFsKSB7XG4gICAgcmV0dXJuIHR5cGVzXzEuUk9MRVMubWFwKHJvbGUgPT4gdXRpbF8xLnJvbGVUb0NoYXIocm9sZSkucmVwZWF0KG1hdGVyaWFsW3JvbGVdKSkuam9pbignJyk7XG59XG5mdW5jdGlvbiBtYWtlUG9ja2V0cyhwb2NrZXQpIHtcbiAgICByZXR1cm4gbWFrZVBvY2tldChwb2NrZXQud2hpdGUpLnRvVXBwZXJDYXNlKCkgKyBtYWtlUG9ja2V0KHBvY2tldC5ibGFjayk7XG59XG5leHBvcnRzLm1ha2VQb2NrZXRzID0gbWFrZVBvY2tldHM7XG5mdW5jdGlvbiBtYWtlQ2FzdGxpbmdGZW4oYm9hcmQsIHVubW92ZWRSb29rcywgb3B0cykge1xuICAgIGNvbnN0IHNocmVkZGVyID0gb3B0cyAmJiBvcHRzLnNocmVkZGVyO1xuICAgIGxldCBmZW4gPSAnJztcbiAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIHR5cGVzXzEuQ09MT1JTKSB7XG4gICAgICAgIGNvbnN0IGJhY2tyYW5rID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rKGNvbG9yKTtcbiAgICAgICAgY29uc3Qga2luZyA9IGJvYXJkLmtpbmdPZihjb2xvcik7XG4gICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQoa2luZykgfHwgIWJhY2tyYW5rLmhhcyhraW5nKSlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gYm9hcmQucGllY2VzKGNvbG9yLCAncm9vaycpLmludGVyc2VjdChiYWNrcmFuayk7XG4gICAgICAgIGZvciAoY29uc3Qgcm9vayBvZiB1bm1vdmVkUm9va3MuaW50ZXJzZWN0KGNhbmRpZGF0ZXMpLnJldmVyc2VkKCkpIHtcbiAgICAgICAgICAgIGlmICghc2hyZWRkZXIgJiYgcm9vayA9PT0gY2FuZGlkYXRlcy5maXJzdCgpICYmIHJvb2sgPCBraW5nKSB7XG4gICAgICAgICAgICAgICAgZmVuICs9IGNvbG9yID09PSAnd2hpdGUnID8gJ1EnIDogJ3EnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIXNocmVkZGVyICYmIHJvb2sgPT09IGNhbmRpZGF0ZXMubGFzdCgpICYmIGtpbmcgPCByb29rKSB7XG4gICAgICAgICAgICAgICAgZmVuICs9IGNvbG9yID09PSAnd2hpdGUnID8gJ0snIDogJ2snO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZmVuICs9IChjb2xvciA9PT0gJ3doaXRlJyA/ICdBQkNERUZHSCcgOiAnYWJjZGVmZ2gnKVtyb29rICYgMHg3XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmVuIHx8ICctJztcbn1cbmV4cG9ydHMubWFrZUNhc3RsaW5nRmVuID0gbWFrZUNhc3RsaW5nRmVuO1xuZnVuY3Rpb24gbWFrZVJlbWFpbmluZ0NoZWNrcyhjaGVja3MpIHtcbiAgICByZXR1cm4gYCR7Y2hlY2tzLndoaXRlfSske2NoZWNrcy5ibGFja31gO1xufVxuZXhwb3J0cy5tYWtlUmVtYWluaW5nQ2hlY2tzID0gbWFrZVJlbWFpbmluZ0NoZWNrcztcbmZ1bmN0aW9uIG1ha2VGZW4oc2V0dXAsIG9wdHMpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBtYWtlQm9hcmRGZW4oc2V0dXAuYm9hcmQsIG9wdHMpICsgKHNldHVwLnBvY2tldHMgPyBgWyR7bWFrZVBvY2tldHMoc2V0dXAucG9ja2V0cyl9XWAgOiAnJyksXG4gICAgICAgIHNldHVwLnR1cm5bMF0sXG4gICAgICAgIG1ha2VDYXN0bGluZ0ZlbihzZXR1cC5ib2FyZCwgc2V0dXAudW5tb3ZlZFJvb2tzLCBvcHRzKSxcbiAgICAgICAgdXRpbF8xLmRlZmluZWQoc2V0dXAuZXBTcXVhcmUpID8gdXRpbF8xLm1ha2VTcXVhcmUoc2V0dXAuZXBTcXVhcmUpIDogJy0nLFxuICAgICAgICAuLi4oc2V0dXAucmVtYWluaW5nQ2hlY2tzID8gW21ha2VSZW1haW5pbmdDaGVja3Moc2V0dXAucmVtYWluaW5nQ2hlY2tzKV0gOiBbXSksXG4gICAgICAgIC4uLihvcHRzICYmIG9wdHMuZXBkID8gW10gOiBbc2V0dXAuaGFsZm1vdmVzLCBzZXR1cC5mdWxsbW92ZXNdKVxuICAgIF0uam9pbignICcpO1xufVxuZXhwb3J0cy5tYWtlRmVuID0gbWFrZUZlbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL3R5cGVzXCIpO1xuY29uc3Qgc3F1YXJlU2V0XzEgPSByZXF1aXJlKFwiLi9zcXVhcmVTZXRcIik7XG5jb25zdCBib2FyZF8xID0gcmVxdWlyZShcIi4vYm9hcmRcIik7XG5jbGFzcyBNYXRlcmlhbFNpZGUge1xuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG4gICAgc3RhdGljIGVtcHR5KCkge1xuICAgICAgICBjb25zdCBtID0gbmV3IE1hdGVyaWFsU2lkZSgpO1xuICAgICAgICBmb3IgKGNvbnN0IHJvbGUgb2YgdHlwZXNfMS5ST0xFUylcbiAgICAgICAgICAgIG1bcm9sZV0gPSAwO1xuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IG0gPSBuZXcgTWF0ZXJpYWxTaWRlKCk7XG4gICAgICAgIGZvciAoY29uc3Qgcm9sZSBvZiB0eXBlc18xLlJPTEVTKVxuICAgICAgICAgICAgbVtyb2xlXSA9IHRoaXNbcm9sZV07XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbiAgICBub25FbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVzXzEuUk9MRVMuc29tZShyb2xlID0+IHRoaXNbcm9sZV0gPiAwKTtcbiAgICB9XG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLm5vbkVtcHR5KCk7XG4gICAgfVxuICAgIGhhc1Bhd25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXduID4gMDtcbiAgICB9XG4gICAgaGFzTm9uUGF3bnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmtuaWdodCA+IDAgfHwgdGhpcy5iaXNob3AgPiAwIHx8IHRoaXMucm9vayA+IDAgfHwgdGhpcy5xdWVlbiA+IDAgfHwgdGhpcy5raW5nID4gMDtcbiAgICB9XG4gICAgY291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhd24gKyB0aGlzLmtuaWdodCArIHRoaXMuYmlzaG9wICsgdGhpcy5yb29rICsgdGhpcy5xdWVlbiArIHRoaXMua2luZztcbiAgICB9XG59XG5leHBvcnRzLk1hdGVyaWFsU2lkZSA9IE1hdGVyaWFsU2lkZTtcbmNsYXNzIE1hdGVyaWFsIHtcbiAgICBjb25zdHJ1Y3Rvcih3aGl0ZSwgYmxhY2spIHtcbiAgICAgICAgdGhpcy53aGl0ZSA9IHdoaXRlO1xuICAgICAgICB0aGlzLmJsYWNrID0gYmxhY2s7XG4gICAgfVxuICAgIHN0YXRpYyBlbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRlcmlhbChNYXRlcmlhbFNpZGUuZW1wdHkoKSwgTWF0ZXJpYWxTaWRlLmVtcHR5KCkpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRlcmlhbCh0aGlzLndoaXRlLmNsb25lKCksIHRoaXMuYmxhY2suY2xvbmUoKSk7XG4gICAgfVxuICAgIGNvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aGl0ZS5jb3VudCgpICsgdGhpcy5ibGFjay5jb3VudCgpO1xuICAgIH1cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aGl0ZS5pc0VtcHR5KCkgJiYgdGhpcy5ibGFjay5pc0VtcHR5KCk7XG4gICAgfVxuICAgIG5vbkVtcHR5KCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuaXNFbXB0eSgpO1xuICAgIH1cbiAgICBoYXNQYXducygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2hpdGUuaGFzUGF3bnMoKSB8fCB0aGlzLmJsYWNrLmhhc1Bhd25zKCk7XG4gICAgfVxuICAgIGhhc05vblBhd25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aGl0ZS5oYXNOb25QYXducygpIHx8IHRoaXMuYmxhY2suaGFzTm9uUGF3bnMoKTtcbiAgICB9XG59XG5leHBvcnRzLk1hdGVyaWFsID0gTWF0ZXJpYWw7XG5jbGFzcyBSZW1haW5pbmdDaGVja3Mge1xuICAgIGNvbnN0cnVjdG9yKHdoaXRlLCBibGFjaykge1xuICAgICAgICB0aGlzLndoaXRlID0gd2hpdGU7XG4gICAgICAgIHRoaXMuYmxhY2sgPSBibGFjaztcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVtYWluaW5nQ2hlY2tzKDMsIDMpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZW1haW5pbmdDaGVja3ModGhpcy53aGl0ZSwgdGhpcy5ibGFjayk7XG4gICAgfVxufVxuZXhwb3J0cy5SZW1haW5pbmdDaGVja3MgPSBSZW1haW5pbmdDaGVja3M7XG5mdW5jdGlvbiBkZWZhdWx0U2V0dXAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYm9hcmQ6IGJvYXJkXzEuQm9hcmQuZGVmYXVsdCgpLFxuICAgICAgICBwb2NrZXRzOiB1bmRlZmluZWQsXG4gICAgICAgIHR1cm46ICd3aGl0ZScsXG4gICAgICAgIHVubW92ZWRSb29rczogc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmNvcm5lcnMoKSxcbiAgICAgICAgZXBTcXVhcmU6IHVuZGVmaW5lZCxcbiAgICAgICAgcmVtYWluaW5nQ2hlY2tzOiB1bmRlZmluZWQsXG4gICAgICAgIGhhbGZtb3ZlczogMCxcbiAgICAgICAgZnVsbG1vdmVzOiAxLFxuICAgIH07XG59XG5leHBvcnRzLmRlZmF1bHRTZXR1cCA9IGRlZmF1bHRTZXR1cDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gcG9wY250MzIobikge1xuICAgIG4gPSBuIC0gKChuID4+PiAxKSAmIDE0MzE2NTU3NjUpO1xuICAgIG4gPSAobiAmIDg1ODk5MzQ1OSkgKyAoKG4gPj4+IDIpICYgODU4OTkzNDU5KTtcbiAgICByZXR1cm4gKChuICsgKG4gPj4+IDQpICYgMjUyNjQ1MTM1KSAqIDE2ODQzMDA5KSA+PiAyNDtcbn1cbmZ1bmN0aW9uIGJzd2FwMzIobikge1xuICAgIG4gPSAobiA+Pj4gOCkgJiAxNjcxMTkzNSB8ICgobiAmIDE2NzExOTM1KSA8PCA4KTtcbiAgICByZXR1cm4gKG4gPj4+IDE2KSAmIDB4ZmZmZiB8ICgobiAmIDB4ZmZmZikgPDwgMTYpO1xufVxuZnVuY3Rpb24gcmJpdDMyKG4pIHtcbiAgICBuID0gKChuID4+PiAxKSAmIDE0MzE2NTU3NjUpIHwgKChuICYgMTQzMTY1NTc2NSkgPDwgMSk7XG4gICAgbiA9ICgobiA+Pj4gMikgJiA4NTg5OTM0NTkpIHwgKChuICYgODU4OTkzNDU5KSA8PCAyKTtcbiAgICBuID0gKChuID4+PiA0KSAmIDI1MjY0NTEzNSkgfCAoKG4gJiAyNTI2NDUxMzUpIDw8IDQpO1xuICAgIG4gPSAoKG4gPj4+IDgpICYgMTY3MTE5MzUpIHwgKChuICYgMTY3MTE5MzUpIDw8IDgpO1xuICAgIG4gPSAoKG4gPj4+IDE2KSAmIDY1NTM1KSB8ICgobiAmIDY1NTM1KSA8PCAxNik7XG4gICAgcmV0dXJuIG47XG59XG5jbGFzcyBTcXVhcmVTZXQge1xuICAgIGNvbnN0cnVjdG9yKGxvLCBoaSkge1xuICAgICAgICB0aGlzLmxvID0gbG87XG4gICAgICAgIHRoaXMuaGkgPSBoaTtcbiAgICAgICAgdGhpcy5sbyA9IGxvIHwgMDtcbiAgICAgICAgdGhpcy5oaSA9IGhpIHwgMDtcbiAgICB9XG4gICAgc3RhdGljIGZyb21TcXVhcmUoc3F1YXJlKSB7XG4gICAgICAgIHJldHVybiBzcXVhcmUgPj0gMzIgP1xuICAgICAgICAgICAgbmV3IFNxdWFyZVNldCgwLCAxIDw8IChzcXVhcmUgLSAzMikpIDpcbiAgICAgICAgICAgIG5ldyBTcXVhcmVTZXQoMSA8PCBzcXVhcmUsIDApO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVJhbmsocmFuaykge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCgweGZmLCAwKS5zaGw2NCg4ICogcmFuayk7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tRmlsZShmaWxlKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KDE2ODQzMDA5IDw8IGZpbGUsIDE2ODQzMDA5IDw8IGZpbGUpO1xuICAgIH1cbiAgICBzdGF0aWMgZW1wdHkoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KDAsIDApO1xuICAgIH1cbiAgICBzdGF0aWMgZnVsbCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQoNDI5NDk2NzI5NSwgNDI5NDk2NzI5NSk7XG4gICAgfVxuICAgIHN0YXRpYyBjb3JuZXJzKCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCgweDgxLCAyMTY0MjYwODY0KTtcbiAgICB9XG4gICAgc3RhdGljIGNlbnRlcigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQoNDAyNjUzMTg0LCAweDE4KTtcbiAgICB9XG4gICAgc3RhdGljIGJhY2tyYW5rcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQoMHhmZiwgNDI3ODE5MDA4MCk7XG4gICAgfVxuICAgIHN0YXRpYyBiYWNrcmFuayhjb2xvcikge1xuICAgICAgICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyBuZXcgU3F1YXJlU2V0KDB4ZmYsIDApIDogbmV3IFNxdWFyZVNldCgwLCA0Mjc4MTkwMDgwKTtcbiAgICB9XG4gICAgc3RhdGljIGxpZ2h0U3F1YXJlcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQoMTQzNzIyNjQxMCwgMTQzNzIyNjQxMCk7XG4gICAgfVxuICAgIHN0YXRpYyBkYXJrU3F1YXJlcygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQoMjg1Nzc0MDg4NSwgMjg1Nzc0MDg4NSk7XG4gICAgfVxuICAgIGNvbXBsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KH50aGlzLmxvLCB+dGhpcy5oaSk7XG4gICAgfVxuICAgIHhvcihvdGhlcikge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCh0aGlzLmxvIF4gb3RoZXIubG8sIHRoaXMuaGkgXiBvdGhlci5oaSk7XG4gICAgfVxuICAgIHVuaW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KHRoaXMubG8gfCBvdGhlci5sbywgdGhpcy5oaSB8IG90aGVyLmhpKTtcbiAgICB9XG4gICAgaW50ZXJzZWN0KG90aGVyKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KHRoaXMubG8gJiBvdGhlci5sbywgdGhpcy5oaSAmIG90aGVyLmhpKTtcbiAgICB9XG4gICAgZGlmZihvdGhlcikge1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldCh0aGlzLmxvICYgfm90aGVyLmxvLCB0aGlzLmhpICYgfm90aGVyLmhpKTtcbiAgICB9XG4gICAgaW50ZXJzZWN0cyhvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnNlY3Qob3RoZXIpLm5vbkVtcHR5KCk7XG4gICAgfVxuICAgIGlzRGlzam9pbnQob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJzZWN0KG90aGVyKS5pc0VtcHR5KCk7XG4gICAgfVxuICAgIHN1cGVyc2V0T2Yob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIG90aGVyLmRpZmYodGhpcykuaXNFbXB0eSgpO1xuICAgIH1cbiAgICBzdWJzZXRPZihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWZmKG90aGVyKS5pc0VtcHR5KCk7XG4gICAgfVxuICAgIHNocjY0KHNoaWZ0KSB7XG4gICAgICAgIGlmIChzaGlmdCA+PSA2NClcbiAgICAgICAgICAgIHJldHVybiBTcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgaWYgKHNoaWZ0ID49IDMyKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTcXVhcmVTZXQodGhpcy5oaSA+Pj4gKHNoaWZ0IC0gMzIpLCAwKTtcbiAgICAgICAgaWYgKHNoaWZ0ID4gMClcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KCh0aGlzLmxvID4+PiBzaGlmdCkgXiAodGhpcy5oaSA8PCAoMzIgLSBzaGlmdCkpLCB0aGlzLmhpID4+PiBzaGlmdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBzaGw2NChzaGlmdCkge1xuICAgICAgICBpZiAoc2hpZnQgPj0gNjQpXG4gICAgICAgICAgICByZXR1cm4gU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGlmIChzaGlmdCA+PSAzMilcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KDAsIHRoaXMubG8gPDwgKHNoaWZ0IC0gMzIpKTtcbiAgICAgICAgaWYgKHNoaWZ0ID4gMClcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KHRoaXMubG8gPDwgc2hpZnQsICh0aGlzLmhpIDw8IHNoaWZ0KSBeICh0aGlzLmxvID4+PiAoMzIgLSBzaGlmdCkpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGJzd2FwNjQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KGJzd2FwMzIodGhpcy5oaSksIGJzd2FwMzIodGhpcy5sbykpO1xuICAgIH1cbiAgICByYml0NjQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3F1YXJlU2V0KHJiaXQzMih0aGlzLmhpKSwgcmJpdDMyKHRoaXMubG8pKTtcbiAgICB9XG4gICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvID09PSBvdGhlci5sbyAmJiB0aGlzLmhpID09PSBvdGhlci5oaTtcbiAgICB9XG4gICAgc2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHBvcGNudDMyKHRoaXMubG8pICsgcG9wY250MzIodGhpcy5oaSk7XG4gICAgfVxuICAgIGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvID09PSAwICYmIHRoaXMuaGkgPT09IDA7XG4gICAgfVxuICAgIG5vbkVtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sbyAhPT0gMCB8fCB0aGlzLmhpICE9PSAwO1xuICAgIH1cbiAgICBoYXMoc3F1YXJlKSB7XG4gICAgICAgIHJldHVybiAhIShzcXVhcmUgPj0gMzIgPyB0aGlzLmhpICYgKDEgPDwgKHNxdWFyZSAtIDMyKSkgOiB0aGlzLmxvICYgKDEgPDwgc3F1YXJlKSk7XG4gICAgfVxuICAgIHNldChzcXVhcmUsIG9uKSB7XG4gICAgICAgIHJldHVybiBvbiA/IHRoaXMud2l0aChzcXVhcmUpIDogdGhpcy53aXRob3V0KHNxdWFyZSk7XG4gICAgfVxuICAgIHdpdGgoc3F1YXJlKSB7XG4gICAgICAgIHJldHVybiBzcXVhcmUgPj0gMzIgP1xuICAgICAgICAgICAgbmV3IFNxdWFyZVNldCh0aGlzLmxvLCB0aGlzLmhpIHwgKDEgPDwgKHNxdWFyZSAtIDMyKSkpIDpcbiAgICAgICAgICAgIG5ldyBTcXVhcmVTZXQodGhpcy5sbyB8ICgxIDw8IHNxdWFyZSksIHRoaXMuaGkpO1xuICAgIH1cbiAgICB3aXRob3V0KHNxdWFyZSkge1xuICAgICAgICByZXR1cm4gc3F1YXJlID49IDMyID9cbiAgICAgICAgICAgIG5ldyBTcXVhcmVTZXQodGhpcy5sbywgdGhpcy5oaSAmIH4oMSA8PCAoc3F1YXJlIC0gMzIpKSkgOlxuICAgICAgICAgICAgbmV3IFNxdWFyZVNldCh0aGlzLmxvICYgfigxIDw8IHNxdWFyZSksIHRoaXMuaGkpO1xuICAgIH1cbiAgICB0b2dnbGUoc3F1YXJlKSB7XG4gICAgICAgIHJldHVybiBzcXVhcmUgPj0gMzIgP1xuICAgICAgICAgICAgbmV3IFNxdWFyZVNldCh0aGlzLmxvLCB0aGlzLmhpIF4gKDEgPDwgKHNxdWFyZSAtIDMyKSkpIDpcbiAgICAgICAgICAgIG5ldyBTcXVhcmVTZXQodGhpcy5sbyBeICgxIDw8IHNxdWFyZSksIHRoaXMuaGkpO1xuICAgIH1cbiAgICBsYXN0KCkge1xuICAgICAgICBpZiAodGhpcy5oaSAhPT0gMClcbiAgICAgICAgICAgIHJldHVybiA2MyAtIE1hdGguY2x6MzIodGhpcy5oaSk7XG4gICAgICAgIGlmICh0aGlzLmxvICE9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIDMxIC0gTWF0aC5jbHozMih0aGlzLmxvKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmaXJzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMubG8gIT09IDApXG4gICAgICAgICAgICByZXR1cm4gMzEgLSBNYXRoLmNsejMyKHRoaXMubG8gJiAtdGhpcy5sbyk7XG4gICAgICAgIGlmICh0aGlzLmhpICE9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIDYzIC0gTWF0aC5jbHozMih0aGlzLmhpICYgLXRoaXMuaGkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIG1vcmVUaGFuT25lKCkge1xuICAgICAgICByZXR1cm4gISEoKHRoaXMuaGkgJiYgdGhpcy5sbykgfHwgdGhpcy5sbyAmICh0aGlzLmxvIC0gMSkgfHwgdGhpcy5oaSAmICh0aGlzLmhpIC0gMSkpO1xuICAgIH1cbiAgICBzaW5nbGVTcXVhcmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vcmVUaGFuT25lKCkgPyB1bmRlZmluZWQgOiB0aGlzLmxhc3QoKTtcbiAgICB9XG4gICAgaXNTaW5nbGVTcXVhcmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vbkVtcHR5KCkgJiYgIXRoaXMubW9yZVRoYW5PbmUoKTtcbiAgICB9XG4gICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgICAgIGxldCBsbyA9IHRoaXMubG87XG4gICAgICAgIGxldCBoaSA9IHRoaXMuaGk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGlmIChsbykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSAzMSAtIE1hdGguY2x6MzIobG8gJiAtbG8pO1xuICAgICAgICAgICAgICAgICAgICBsbyBePSAxIDw8IGlkeDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGlkeCwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGhpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IDMxIC0gTWF0aC5jbHozMihoaSAmIC1oaSk7XG4gICAgICAgICAgICAgICAgICAgIGhpIF49IDEgPDwgaWR4O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogMzIgKyBpZHgsIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGRvbmU6IHRydWUgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV2ZXJzZWQoKSB7XG4gICAgICAgIGxldCBsbyA9IHRoaXMubG87XG4gICAgICAgIGxldCBoaSA9IHRoaXMuaGk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gMzEgLSBNYXRoLmNsejMyKGhpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaSBePSAxIDw8IGlkeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogMzIgKyBpZHgsIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSAzMSAtIE1hdGguY2x6MzIobG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvIF49IDEgPDwgaWR4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBpZHgsIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICBtaW51czY0KG90aGVyKSB7XG4gICAgICAgIGNvbnN0IGxvID0gdGhpcy5sbyAtIG90aGVyLmxvO1xuICAgICAgICBjb25zdCBjID0gKChsbyAmIG90aGVyLmxvICYgMSkgKyAob3RoZXIubG8gPj4+IDEpICsgKGxvID4+PiAxKSkgPj4+IDMxO1xuICAgICAgICByZXR1cm4gbmV3IFNxdWFyZVNldChsbywgdGhpcy5oaSAtIChvdGhlci5oaSArIGMpKTtcbiAgICB9XG59XG5leHBvcnRzLlNxdWFyZVNldCA9IFNxdWFyZVNldDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DT0xPUlMgPSBbJ3doaXRlJywgJ2JsYWNrJ107XG5leHBvcnRzLlJPTEVTID0gWydwYXduJywgJ2tuaWdodCcsICdiaXNob3AnLCAncm9vaycsICdxdWVlbicsICdraW5nJ107XG5leHBvcnRzLkNBU1RMSU5HX1NJREVTID0gWydhJywgJ2gnXTtcbmZ1bmN0aW9uIGlzRHJvcCh2KSB7XG4gICAgcmV0dXJuICdyb2xlJyBpbiB2O1xufVxuZXhwb3J0cy5pc0Ryb3AgPSBpc0Ryb3A7XG5mdW5jdGlvbiBpc01vdmUodikge1xuICAgIHJldHVybiAnZnJvbScgaW4gdjtcbn1cbmV4cG9ydHMuaXNNb3ZlID0gaXNNb3ZlO1xuZXhwb3J0cy5SVUxFUyA9IFsnY2hlc3MnLCAnYW50aWNoZXNzJywgJ2tpbmdvZnRoZWhpbGwnLCAnM2NoZWNrJywgJ2F0b21pYycsICdob3JkZScsICdyYWNpbmdraW5ncycsICdjcmF6eWhvdXNlJ107XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHR5cGVzXzEgPSByZXF1aXJlKFwiLi90eXBlc1wiKTtcbmZ1bmN0aW9uIGRlZmluZWQodikge1xuICAgIHJldHVybiB0eXBlb2YgdiAhPT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmRlZmluZWQgPSBkZWZpbmVkO1xuZnVuY3Rpb24gb3Bwb3NpdGUoY29sb3IpIHtcbiAgICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyAnYmxhY2snIDogJ3doaXRlJztcbn1cbmV4cG9ydHMub3Bwb3NpdGUgPSBvcHBvc2l0ZTtcbmZ1bmN0aW9uIHNxdWFyZURpc3QoYSwgYikge1xuICAgIGNvbnN0IHgxID0gYSAmIDB4NywgeDIgPSBiICYgMHg3O1xuICAgIGNvbnN0IHkxID0gYSA+PiAzLCB5MiA9IGIgPj4gMztcbiAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5hYnMoeDEgLSB4MiksIE1hdGguYWJzKHkxIC0geTIpKTtcbn1cbmV4cG9ydHMuc3F1YXJlRGlzdCA9IHNxdWFyZURpc3Q7XG5mdW5jdGlvbiBzcXVhcmVSYW5rKHNxdWFyZSkge1xuICAgIHJldHVybiBzcXVhcmUgPj4gMztcbn1cbmV4cG9ydHMuc3F1YXJlUmFuayA9IHNxdWFyZVJhbms7XG5mdW5jdGlvbiBzcXVhcmVGaWxlKHNxdWFyZSkge1xuICAgIHJldHVybiBzcXVhcmUgJiAweDc7XG59XG5leHBvcnRzLnNxdWFyZUZpbGUgPSBzcXVhcmVGaWxlO1xuZnVuY3Rpb24gcm9sZVRvQ2hhcihyb2xlKSB7XG4gICAgc3dpdGNoIChyb2xlKSB7XG4gICAgICAgIGNhc2UgJ3Bhd24nOiByZXR1cm4gJ3AnO1xuICAgICAgICBjYXNlICdrbmlnaHQnOiByZXR1cm4gJ24nO1xuICAgICAgICBjYXNlICdiaXNob3AnOiByZXR1cm4gJ2InO1xuICAgICAgICBjYXNlICdyb29rJzogcmV0dXJuICdyJztcbiAgICAgICAgY2FzZSAncXVlZW4nOiByZXR1cm4gJ3EnO1xuICAgICAgICBjYXNlICdraW5nJzogcmV0dXJuICdrJztcbiAgICB9XG59XG5leHBvcnRzLnJvbGVUb0NoYXIgPSByb2xlVG9DaGFyO1xuZnVuY3Rpb24gY2hhclRvUm9sZShjaCkge1xuICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgY2FzZSAnUCc6XG4gICAgICAgIGNhc2UgJ3AnOiByZXR1cm4gJ3Bhd24nO1xuICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgY2FzZSAnbic6IHJldHVybiAna25pZ2h0JztcbiAgICAgICAgY2FzZSAnQic6XG4gICAgICAgIGNhc2UgJ2InOiByZXR1cm4gJ2Jpc2hvcCc7XG4gICAgICAgIGNhc2UgJ1InOlxuICAgICAgICBjYXNlICdyJzogcmV0dXJuICdyb29rJztcbiAgICAgICAgY2FzZSAnUSc6XG4gICAgICAgIGNhc2UgJ3EnOiByZXR1cm4gJ3F1ZWVuJztcbiAgICAgICAgY2FzZSAnSyc6XG4gICAgICAgIGNhc2UgJ2snOiByZXR1cm4gJ2tpbmcnO1xuICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgfVxufVxuZXhwb3J0cy5jaGFyVG9Sb2xlID0gY2hhclRvUm9sZTtcbmZ1bmN0aW9uIHBhcnNlU3F1YXJlKHN0cikge1xuICAgIGlmICghL15bYS1oXVsxLThdJC8udGVzdChzdHIpKVxuICAgICAgICByZXR1cm47XG4gICAgcmV0dXJuIHN0ci5jaGFyQ29kZUF0KDApIC0gJ2EnLmNoYXJDb2RlQXQoMCkgKyA4ICogKHN0ci5jaGFyQ29kZUF0KDEpIC0gJzEnLmNoYXJDb2RlQXQoMCkpO1xufVxuZXhwb3J0cy5wYXJzZVNxdWFyZSA9IHBhcnNlU3F1YXJlO1xuZnVuY3Rpb24gbWFrZVNxdWFyZShzcXVhcmUpIHtcbiAgICByZXR1cm4gJ2FiY2RlZmdoJ1tzcXVhcmUgJiAweDddICsgJzEyMzQ1Njc4J1tzcXVhcmUgPj4gM107XG59XG5leHBvcnRzLm1ha2VTcXVhcmUgPSBtYWtlU3F1YXJlO1xuZnVuY3Rpb24gcGFyc2VVY2koc3RyKSB7XG4gICAgaWYgKHN0clsxXSA9PT0gJ0AnICYmIHN0ci5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgY29uc3Qgcm9sZSA9IGNoYXJUb1JvbGUoc3RyWzBdKTtcbiAgICAgICAgY29uc3QgdG8gPSBwYXJzZVNxdWFyZShzdHIuc2xpY2UoMikpO1xuICAgICAgICBpZiAocm9sZSAmJiBkZWZpbmVkKHRvKSlcbiAgICAgICAgICAgIHJldHVybiB7IHJvbGUsIHRvIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKHN0ci5sZW5ndGggPT09IDQgfHwgc3RyLmxlbmd0aCA9PT0gNSkge1xuICAgICAgICBjb25zdCBmcm9tID0gcGFyc2VTcXVhcmUoc3RyLnNsaWNlKDAsIDIpKTtcbiAgICAgICAgY29uc3QgdG8gPSBwYXJzZVNxdWFyZShzdHIuc2xpY2UoMiwgNCkpO1xuICAgICAgICBsZXQgcHJvbW90aW9uO1xuICAgICAgICBpZiAoc3RyLmxlbmd0aCA9PT0gNSkge1xuICAgICAgICAgICAgcHJvbW90aW9uID0gY2hhclRvUm9sZShzdHJbNF0pO1xuICAgICAgICAgICAgaWYgKCFwcm9tb3Rpb24pXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWZpbmVkKGZyb20pICYmIGRlZmluZWQodG8pKVxuICAgICAgICAgICAgcmV0dXJuIHsgZnJvbSwgdG8sIHByb21vdGlvbiB9O1xuICAgIH1cbiAgICByZXR1cm47XG59XG5leHBvcnRzLnBhcnNlVWNpID0gcGFyc2VVY2k7XG5mdW5jdGlvbiBtYWtlVWNpKHVjaSkge1xuICAgIGlmICh0eXBlc18xLmlzRHJvcCh1Y2kpKVxuICAgICAgICByZXR1cm4gYCR7cm9sZVRvQ2hhcih1Y2kucm9sZSkudG9VcHBlckNhc2UoKX1AJHttYWtlU3F1YXJlKHVjaS50byl9YDtcbiAgICByZXR1cm4gbWFrZVNxdWFyZSh1Y2kuZnJvbSkgKyBtYWtlU3F1YXJlKHVjaS50bykgKyAodWNpLnByb21vdGlvbiA/IHJvbGVUb0NoYXIodWNpLnByb21vdGlvbikgOiAnJyk7XG59XG5leHBvcnRzLm1ha2VVY2kgPSBtYWtlVWNpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCByZXN1bHRfMSA9IHJlcXVpcmUoXCJAYmFkcmFwL3Jlc3VsdFwiKTtcbmNvbnN0IHR5cGVzXzEgPSByZXF1aXJlKFwiLi90eXBlc1wiKTtcbmNvbnN0IHV0aWxfMSA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG5jb25zdCBhdHRhY2tzXzEgPSByZXF1aXJlKFwiLi9hdHRhY2tzXCIpO1xuY29uc3Qgc3F1YXJlU2V0XzEgPSByZXF1aXJlKFwiLi9zcXVhcmVTZXRcIik7XG5jb25zdCBib2FyZF8xID0gcmVxdWlyZShcIi4vYm9hcmRcIik7XG5jb25zdCBzZXR1cF8xID0gcmVxdWlyZShcIi4vc2V0dXBcIik7XG5jb25zdCBjaGVzc18xID0gcmVxdWlyZShcIi4vY2hlc3NcIik7XG5leHBvcnRzLlBvc2l0aW9uRXJyb3IgPSBjaGVzc18xLlBvc2l0aW9uRXJyb3I7XG5leHBvcnRzLlBvc2l0aW9uID0gY2hlc3NfMS5Qb3NpdGlvbjtcbmV4cG9ydHMuSWxsZWdhbFNldHVwID0gY2hlc3NfMS5JbGxlZ2FsU2V0dXA7XG5leHBvcnRzLkNhc3RsZXMgPSBjaGVzc18xLkNhc3RsZXM7XG5leHBvcnRzLkNoZXNzID0gY2hlc3NfMS5DaGVzcztcbmNsYXNzIENyYXp5aG91c2UgZXh0ZW5kcyBjaGVzc18xLkNoZXNzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ2NyYXp5aG91c2UnKTtcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHN1cGVyLmRlZmF1bHQoKTtcbiAgICAgICAgcG9zLnBvY2tldHMgPSBzZXR1cF8xLk1hdGVyaWFsLmVtcHR5KCk7XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tU2V0dXAoc2V0dXApIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmZyb21TZXR1cChzZXR1cCkubWFwKHBvcyA9PiB7XG4gICAgICAgICAgICBwb3MucG9ja2V0cyA9IHNldHVwLnBvY2tldHMgPyBzZXR1cC5wb2NrZXRzLmNsb25lKCkgOiBzZXR1cF8xLk1hdGVyaWFsLmVtcHR5KCk7XG4gICAgICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdmFsaWRhdGUoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci52YWxpZGF0ZSgpLmNoYWluKF8gPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucG9ja2V0cyAmJiAodGhpcy5wb2NrZXRzLndoaXRlLmtpbmcgPiAwIHx8IHRoaXMucG9ja2V0cy5ibGFjay5raW5nID4gMCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLktpbmdzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHRoaXMucG9ja2V0cyA/IHRoaXMucG9ja2V0cy5jb3VudCgpIDogMCkgKyB0aGlzLmJvYXJkLm9jY3VwaWVkLnNpemUoKSA+IDY0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5WYXJpYW50KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0Lm9rKHVuZGVmaW5lZCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNsb25lKCk7XG4gICAgfVxuICAgIGhhc0luc3VmZmljaWVudE1hdGVyaWFsKGNvbG9yKSB7XG4gICAgICAgIC8vIE5vIG1hdGVyaWFsIGNhbiBsZWF2ZSB0aGUgZ2FtZSwgYnV0IHdlIGNhbiBlYXNpbHkgY2hlY2sgdGhpcyBmb3JcbiAgICAgICAgLy8gY3VzdG9tIHBvc2l0aW9ucy5cbiAgICAgICAgaWYgKCF0aGlzLnBvY2tldHMpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuaGFzSW5zdWZmaWNpZW50TWF0ZXJpYWwoY29sb3IpO1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZC5vY2N1cGllZC5zaXplKCkgKyB0aGlzLnBvY2tldHMuY291bnQoKSA8PSAzICYmXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnBhd24uaXNFbXB0eSgpICYmXG4gICAgICAgICAgICB0aGlzLmJvYXJkLnByb21vdGVkLmlzRW1wdHkoKSAmJlxuICAgICAgICAgICAgdGhpcy5ib2FyZC5yb29rc0FuZFF1ZWVucygpLmlzRW1wdHkoKSAmJlxuICAgICAgICAgICAgdGhpcy5wb2NrZXRzLndoaXRlLnBhd24gPD0gMCAmJlxuICAgICAgICAgICAgdGhpcy5wb2NrZXRzLmJsYWNrLnBhd24gPD0gMCAmJlxuICAgICAgICAgICAgdGhpcy5wb2NrZXRzLndoaXRlLnJvb2sgPD0gMCAmJlxuICAgICAgICAgICAgdGhpcy5wb2NrZXRzLmJsYWNrLnJvb2sgPD0gMCAmJlxuICAgICAgICAgICAgdGhpcy5wb2NrZXRzLndoaXRlLnF1ZWVuIDw9IDAgJiZcbiAgICAgICAgICAgIHRoaXMucG9ja2V0cy5ibGFjay5xdWVlbiA8PSAwO1xuICAgIH1cbiAgICBkcm9wRGVzdHMoY3R4KSB7XG4gICAgICAgIGNvbnN0IG1hc2sgPSB0aGlzLmJvYXJkLm9jY3VwaWVkLmNvbXBsZW1lbnQoKS5pbnRlcnNlY3QoKHRoaXMucG9ja2V0cyAmJiB0aGlzLnBvY2tldHNbdGhpcy50dXJuXS5oYXNOb25QYXducygpKSA/IHNxdWFyZVNldF8xLlNxdWFyZVNldC5mdWxsKCkgOlxuICAgICAgICAgICAgKHRoaXMucG9ja2V0cyAmJiB0aGlzLnBvY2tldHNbdGhpcy50dXJuXS5wYXduKSA/IHNxdWFyZVNldF8xLlNxdWFyZVNldC5iYWNrcmFua3MoKS5jb21wbGVtZW50KCkgOlxuICAgICAgICAgICAgICAgIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpKTtcbiAgICAgICAgaWYgKHV0aWxfMS5kZWZpbmVkKGN0eC5raW5nKSAmJiBjdHguY2hlY2tlcnMubm9uRW1wdHkoKSkge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tlciA9IGN0eC5jaGVja2Vycy5zaW5nbGVTcXVhcmUoKTtcbiAgICAgICAgICAgIGlmICghdXRpbF8xLmRlZmluZWQoY2hlY2tlcikpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNxdWFyZVNldF8xLlNxdWFyZVNldC5lbXB0eSgpO1xuICAgICAgICAgICAgcmV0dXJuIG1hc2suaW50ZXJzZWN0KGF0dGFja3NfMS5iZXR3ZWVuKGNoZWNrZXIsIGN0eC5raW5nKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIG1hc2s7XG4gICAgfVxufVxuZXhwb3J0cy5DcmF6eWhvdXNlID0gQ3Jhenlob3VzZTtcbmNsYXNzIEF0b21pYyBleHRlbmRzIGNoZXNzXzEuQ2hlc3Mge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcignYXRvbWljJyk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuZGVmYXVsdCgpO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5mcm9tU2V0dXAoc2V0dXApO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNsb25lKCk7XG4gICAgfVxuICAgIHZhbGlkYXRlKCkge1xuICAgICAgICAvLyBMaWtlIGNoZXNzLCBidXQgYWxsb3cgb3VyIGtpbmcgdG8gYmUgbWlzc2luZy5cbiAgICAgICAgaWYgKHRoaXMuYm9hcmQub2NjdXBpZWQuaXNFbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5FbXB0eSkpO1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5raW5nLnNpemUoKSA+IDIpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLktpbmdzKSk7XG4gICAgICAgIGNvbnN0IG90aGVyS2luZyA9IHRoaXMuYm9hcmQua2luZ09mKHV0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pKTtcbiAgICAgICAgaWYgKCF1dGlsXzEuZGVmaW5lZChvdGhlcktpbmcpKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5LaW5ncykpO1xuICAgICAgICBpZiAodGhpcy5raW5nQXR0YWNrZXJzKG90aGVyS2luZywgdGhpcy50dXJuLCB0aGlzLmJvYXJkLm9jY3VwaWVkKS5ub25FbXB0eSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLk9wcG9zaXRlQ2hlY2spKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rcygpLmludGVyc2VjdHModGhpcy5ib2FyZC5wYXduKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5QYXduc09uQmFja3JhbmspKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0Lm9rKHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIGtpbmdBdHRhY2tlcnMoc3F1YXJlLCBhdHRhY2tlciwgb2NjdXBpZWQpIHtcbiAgICAgICAgaWYgKGF0dGFja3NfMS5raW5nQXR0YWNrcyhzcXVhcmUpLmludGVyc2VjdHModGhpcy5ib2FyZC5waWVjZXMoYXR0YWNrZXIsICdraW5nJykpKSB7XG4gICAgICAgICAgICByZXR1cm4gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLmtpbmdBdHRhY2tlcnMoc3F1YXJlLCBhdHRhY2tlciwgb2NjdXBpZWQpO1xuICAgIH1cbiAgICBwbGF5Q2FwdHVyZUF0KHNxdWFyZSwgY2FwdHVyZWQpIHtcbiAgICAgICAgc3VwZXIucGxheUNhcHR1cmVBdChzcXVhcmUsIGNhcHR1cmVkKTtcbiAgICAgICAgdGhpcy5ib2FyZC50YWtlKHNxdWFyZSk7XG4gICAgICAgIGZvciAoY29uc3QgZXhwbG9kZSBvZiBhdHRhY2tzXzEua2luZ0F0dGFja3Moc3F1YXJlKS5pbnRlcnNlY3QodGhpcy5ib2FyZC5vY2N1cGllZCkuZGlmZih0aGlzLmJvYXJkLnBhd24pKSB7XG4gICAgICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMuYm9hcmQudGFrZShleHBsb2RlKTtcbiAgICAgICAgICAgIGlmIChwaWVjZSAmJiBwaWVjZS5yb2xlID09PSAncm9vaycpXG4gICAgICAgICAgICAgICAgdGhpcy5jYXN0bGVzLmRpc2NhcmRSb29rKGV4cGxvZGUpO1xuICAgICAgICAgICAgaWYgKHBpZWNlICYmIHBpZWNlLnJvbGUgPT09ICdraW5nJylcbiAgICAgICAgICAgICAgICB0aGlzLmNhc3RsZXMuZGlzY2FyZFNpZGUocGllY2UuY29sb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGhhc0luc3VmZmljaWVudE1hdGVyaWFsKGNvbG9yKSB7XG4gICAgICAgIC8vIFJlbWFpbmluZyBtYXRlcmlhbCBkb2VzIG5vdCBtYXR0ZXIgaWYgdGhlIGVuZW15IGtpbmcgaXMgYWxyZWFkeVxuICAgICAgICAvLyBleHBsb2RlZC5cbiAgICAgICAgaWYgKHRoaXMuYm9hcmQucGllY2VzKHV0aWxfMS5vcHBvc2l0ZShjb2xvciksICdraW5nJykuaXNFbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBCYXJlIGtpbmcgY2Fubm90IG1hdGUuXG4gICAgICAgIGlmICh0aGlzLmJvYXJkW2NvbG9yXS5kaWZmKHRoaXMuYm9hcmQua2luZykuaXNFbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIEFzIGxvbmcgYXMgdGhlIGVuZW15IGtpbmcgaXMgbm90IGFsb25lLCB0aGVyZSBpcyBhbHdheXMgYSBjaGFuY2UgdGhlaXJcbiAgICAgICAgLy8gb3duIHBpZWNlcyBleHBsb2RlIG5leHQgdG8gaXQuXG4gICAgICAgIGlmICh0aGlzLmJvYXJkW3V0aWxfMS5vcHBvc2l0ZShjb2xvcildLmRpZmYodGhpcy5ib2FyZC5raW5nKS5ub25FbXB0eSgpKSB7XG4gICAgICAgICAgICAvLyBVbmxlc3MgdGhlcmUgYXJlIG9ubHkgYmlzaG9wcyB0aGF0IGNhbm5vdCBleHBsb2RlIGVhY2ggb3RoZXIuXG4gICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5vY2N1cGllZC5lcXVhbHModGhpcy5ib2FyZC5iaXNob3AudW5pb24odGhpcy5ib2FyZC5raW5nKSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuYm9hcmQuYmlzaG9wLmludGVyc2VjdCh0aGlzLmJvYXJkLndoaXRlKS5pbnRlcnNlY3RzKHNxdWFyZVNldF8xLlNxdWFyZVNldC5kYXJrU3F1YXJlcygpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMuYm9hcmQuYmlzaG9wLmludGVyc2VjdCh0aGlzLmJvYXJkLmJsYWNrKS5pbnRlcnNlY3RzKHNxdWFyZVNldF8xLlNxdWFyZVNldC5saWdodFNxdWFyZXMoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5ib2FyZC5iaXNob3AuaW50ZXJzZWN0KHRoaXMuYm9hcmQud2hpdGUpLmludGVyc2VjdHMoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmxpZ2h0U3F1YXJlcygpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMuYm9hcmQuYmlzaG9wLmludGVyc2VjdCh0aGlzLmJvYXJkLmJsYWNrKS5pbnRlcnNlY3RzKHNxdWFyZVNldF8xLlNxdWFyZVNldC5kYXJrU3F1YXJlcygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUXVlZW4gb3IgcGF3biAoZnV0dXJlIHF1ZWVuKSBjYW4gZ2l2ZSBtYXRlIGFnYWluc3QgYmFyZSBraW5nLlxuICAgICAgICBpZiAodGhpcy5ib2FyZC5xdWVlbi5ub25FbXB0eSgpIHx8IHRoaXMuYm9hcmQucGF3bi5ub25FbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBTaW5nbGUga25pZ2h0LCBiaXNob3Agb3Igcm9vayBjYW5ub3QgbWF0ZSBhZ2FpbnN0IGJhcmUga2luZy5cbiAgICAgICAgaWYgKHRoaXMuYm9hcmQua25pZ2h0LnVuaW9uKHRoaXMuYm9hcmQuYmlzaG9wKS51bmlvbih0aGlzLmJvYXJkLnJvb2spLmlzU2luZ2xlU3F1YXJlKCkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gSWYgb25seSBrbmlnaHRzLCBtb3JlIHRoYW4gdHdvIGFyZSByZXF1aXJlZCB0byBtYXRlIGJhcmUga2luZy5cbiAgICAgICAgaWYgKHRoaXMuYm9hcmQub2NjdXBpZWQuZXF1YWxzKHRoaXMuYm9hcmQua25pZ2h0LnVuaW9uKHRoaXMuYm9hcmQua2luZykpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib2FyZC5rbmlnaHQuc2l6ZSgpIDw9IDI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBkZXN0cyhzcXVhcmUsIGN0eCkge1xuICAgICAgICBsZXQgZGVzdHMgPSBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICAgICAgZm9yIChjb25zdCB0byBvZiB0aGlzLnBzZXVkb0Rlc3RzKHNxdWFyZSwgY3R4KSkge1xuICAgICAgICAgICAgY29uc3QgYWZ0ZXIgPSB0aGlzLmNsb25lKCk7XG4gICAgICAgICAgICBhZnRlci5wbGF5KHsgZnJvbTogc3F1YXJlLCB0byB9KTtcbiAgICAgICAgICAgIGNvbnN0IG91cktpbmcgPSBhZnRlci5ib2FyZC5raW5nT2YodGhpcy50dXJuKTtcbiAgICAgICAgICAgIGlmICh1dGlsXzEuZGVmaW5lZChvdXJLaW5nKSAmJiAoIXV0aWxfMS5kZWZpbmVkKGFmdGVyLmJvYXJkLmtpbmdPZihhZnRlci50dXJuKSkgfHwgYWZ0ZXIua2luZ0F0dGFja2VycyhvdXJLaW5nLCBhZnRlci50dXJuLCBhZnRlci5ib2FyZC5vY2N1cGllZCkuaXNFbXB0eSgpKSkge1xuICAgICAgICAgICAgICAgIGRlc3RzID0gZGVzdHMud2l0aCh0byk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3RzO1xuICAgIH1cbiAgICBpc1ZhcmlhbnRFbmQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMudmFyaWFudE91dGNvbWUoKTtcbiAgICB9XG4gICAgdmFyaWFudE91dGNvbWUoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29sb3Igb2YgdHlwZXNfMS5DT0xPUlMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLnBpZWNlcyhjb2xvciwgJ2tpbmcnKS5pc0VtcHR5KCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiB1dGlsXzEub3Bwb3NpdGUoY29sb3IpIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn1cbmV4cG9ydHMuQXRvbWljID0gQXRvbWljO1xuY2xhc3MgQW50aWNoZXNzIGV4dGVuZHMgY2hlc3NfMS5DaGVzcyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCdhbnRpY2hlc3MnKTtcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IG5ldyB0aGlzKCk7XG4gICAgICAgIHBvcy5ib2FyZCA9IGJvYXJkXzEuQm9hcmQuZGVmYXVsdCgpO1xuICAgICAgICBwb3MudHVybiA9ICd3aGl0ZSc7XG4gICAgICAgIHBvcy5jYXN0bGVzID0gY2hlc3NfMS5DYXN0bGVzLmVtcHR5KCk7XG4gICAgICAgIHBvcy5lcFNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLnJlbWFpbmluZ0NoZWNrcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcG9zLmhhbGZtb3ZlcyA9IDA7XG4gICAgICAgIHBvcy5mdWxsbW92ZXMgPSAxO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbVNldHVwKHNldHVwKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5mcm9tU2V0dXAoc2V0dXApLm1hcChwb3MgPT4ge1xuICAgICAgICAgICAgcG9zLmNhc3RsZXMgPSBjaGVzc18xLkNhc3RsZXMuZW1wdHkoKTtcbiAgICAgICAgICAgIHJldHVybiBwb3M7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNsb25lKCk7XG4gICAgfVxuICAgIHZhbGlkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5vY2N1cGllZC5pc0VtcHR5KCkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLkVtcHR5KSk7XG4gICAgICAgIGlmIChzcXVhcmVTZXRfMS5TcXVhcmVTZXQuYmFja3JhbmtzKCkuaW50ZXJzZWN0cyh0aGlzLmJvYXJkLnBhd24pKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5lcnIobmV3IGNoZXNzXzEuUG9zaXRpb25FcnJvcihjaGVzc18xLklsbGVnYWxTZXR1cC5QYXduc09uQmFja3JhbmspKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayh1bmRlZmluZWQpO1xuICAgIH1cbiAgICBraW5nQXR0YWNrZXJzKF9zcXVhcmUsIF9hdHRhY2tlciwgX29jY3VwaWVkKSB7XG4gICAgICAgIHJldHVybiBzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZW1wdHkoKTtcbiAgICB9XG4gICAgY3R4KCkge1xuICAgICAgICBjb25zdCBjdHggPSBzdXBlci5jdHgoKTtcbiAgICAgICAgY29uc3QgZW5lbXkgPSB0aGlzLmJvYXJkW3V0aWxfMS5vcHBvc2l0ZSh0aGlzLnR1cm4pXTtcbiAgICAgICAgZm9yIChjb25zdCBmcm9tIG9mIHRoaXMuYm9hcmRbdGhpcy50dXJuXSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHNldWRvRGVzdHMoZnJvbSwgY3R4KS5pbnRlcnNlY3RzKGVuZW15KSkge1xuICAgICAgICAgICAgICAgIGN0eC5tdXN0Q2FwdHVyZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0eDtcbiAgICB9XG4gICAgZGVzdHMoc3F1YXJlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgZGVzdHMgPSB0aGlzLnBzZXVkb0Rlc3RzKHNxdWFyZSwgY3R4KTtcbiAgICAgICAgaWYgKCFjdHgubXVzdENhcHR1cmUpXG4gICAgICAgICAgICByZXR1cm4gZGVzdHM7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBkZXN0cy5pbnRlcnNlY3QodGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKV0pO1xuICAgIH1cbiAgICBoYXNJbnN1ZmZpY2llbnRNYXRlcmlhbChjb2xvcikge1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5vY2N1cGllZC5lcXVhbHModGhpcy5ib2FyZC5iaXNob3ApKSB7XG4gICAgICAgICAgICBjb25zdCB3ZVNvbWVPbkxpZ2h0ID0gdGhpcy5ib2FyZFtjb2xvcl0uaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQubGlnaHRTcXVhcmVzKCkpO1xuICAgICAgICAgICAgY29uc3Qgd2VTb21lT25EYXJrID0gdGhpcy5ib2FyZFtjb2xvcl0uaW50ZXJzZWN0cyhzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZGFya1NxdWFyZXMoKSk7XG4gICAgICAgICAgICBjb25zdCB0aGV5QWxsT25EYXJrID0gdGhpcy5ib2FyZFt1dGlsXzEub3Bwb3NpdGUoY29sb3IpXS5pc0Rpc2pvaW50KHNxdWFyZVNldF8xLlNxdWFyZVNldC5saWdodFNxdWFyZXMoKSk7XG4gICAgICAgICAgICBjb25zdCB0aGV5QWxsT25MaWdodCA9IHRoaXMuYm9hcmRbdXRpbF8xLm9wcG9zaXRlKGNvbG9yKV0uaXNEaXNqb2ludChzcXVhcmVTZXRfMS5TcXVhcmVTZXQuZGFya1NxdWFyZXMoKSk7XG4gICAgICAgICAgICByZXR1cm4gKHdlU29tZU9uTGlnaHQgJiYgdGhleUFsbE9uRGFyaykgfHwgKHdlU29tZU9uRGFyayAmJiB0aGV5QWxsT25MaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpc1ZhcmlhbnRFbmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJvYXJkW3RoaXMudHVybl0uaXNFbXB0eSgpO1xuICAgIH1cbiAgICB2YXJpYW50T3V0Y29tZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNWYXJpYW50RW5kKCkgfHwgdGhpcy5pc1N0YWxlbWF0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyB3aW5uZXI6IHRoaXMudHVybiB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG5leHBvcnRzLkFudGljaGVzcyA9IEFudGljaGVzcztcbmNsYXNzIEtpbmdPZlRoZUhpbGwgZXh0ZW5kcyBjaGVzc18xLkNoZXNzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ2tpbmdvZnRoZWhpbGwnKTtcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5kZWZhdWx0KCk7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tU2V0dXAoc2V0dXApIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmZyb21TZXR1cChzZXR1cCk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuY2xvbmUoKTtcbiAgICB9XG4gICAgaGFzSW5zdWZmaWNpZW50TWF0ZXJpYWwoX2NvbG9yKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNWYXJpYW50RW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZC5raW5nLmludGVyc2VjdHMoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmNlbnRlcigpKTtcbiAgICB9XG4gICAgdmFyaWFudE91dGNvbWUoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29sb3Igb2YgdHlwZXNfMS5DT0xPUlMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJvYXJkLnBpZWNlcyhjb2xvciwgJ2tpbmcnKS5pbnRlcnNlY3RzKHNxdWFyZVNldF8xLlNxdWFyZVNldC5jZW50ZXIoKSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiBjb2xvciB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG5leHBvcnRzLktpbmdPZlRoZUhpbGwgPSBLaW5nT2ZUaGVIaWxsO1xuY2xhc3MgVGhyZWVDaGVjayBleHRlbmRzIGNoZXNzXzEuQ2hlc3Mge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcignM2NoZWNrJyk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICBjb25zdCBwb3MgPSBzdXBlci5kZWZhdWx0KCk7XG4gICAgICAgIHBvcy5yZW1haW5pbmdDaGVja3MgPSBzZXR1cF8xLlJlbWFpbmluZ0NoZWNrcy5kZWZhdWx0KCk7XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tU2V0dXAoc2V0dXApIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmZyb21TZXR1cChzZXR1cCkubWFwKHBvcyA9PiB7XG4gICAgICAgICAgICBwb3MucmVtYWluaW5nQ2hlY2tzID0gc2V0dXAucmVtYWluaW5nQ2hlY2tzID8gc2V0dXAucmVtYWluaW5nQ2hlY2tzLmNsb25lKCkgOiBzZXR1cF8xLlJlbWFpbmluZ0NoZWNrcy5kZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5jbG9uZSgpO1xuICAgIH1cbiAgICBoYXNJbnN1ZmZpY2llbnRNYXRlcmlhbChjb2xvcikge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZC5waWVjZXMoY29sb3IsICdraW5nJykuZXF1YWxzKHRoaXMuYm9hcmRbY29sb3JdKTtcbiAgICB9XG4gICAgaXNWYXJpYW50RW5kKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLnJlbWFpbmluZ0NoZWNrcyAmJiAodGhpcy5yZW1haW5pbmdDaGVja3Mud2hpdGUgPD0gMCB8fCB0aGlzLnJlbWFpbmluZ0NoZWNrcy5ibGFjayA8PSAwKTtcbiAgICB9XG4gICAgdmFyaWFudE91dGNvbWUoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbWFpbmluZ0NoZWNrcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiB0eXBlc18xLkNPTE9SUykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlbWFpbmluZ0NoZWNrc1tjb2xvcl0gPD0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiBjb2xvciB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG5leHBvcnRzLlRocmVlQ2hlY2sgPSBUaHJlZUNoZWNrO1xuY2xhc3MgUmFjaW5nS2luZ3MgZXh0ZW5kcyBjaGVzc18xLkNoZXNzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ3JhY2luZ2tpbmdzJyk7XG4gICAgfVxuICAgIHN0YXRpYyBkZWZhdWx0KCkge1xuICAgICAgICBjb25zdCBwb3MgPSBuZXcgdGhpcygpO1xuICAgICAgICBwb3MuYm9hcmQgPSBib2FyZF8xLkJvYXJkLnJhY2luZ0tpbmdzKCk7XG4gICAgICAgIHBvcy50dXJuID0gJ3doaXRlJztcbiAgICAgICAgcG9zLmNhc3RsZXMgPSBjaGVzc18xLkNhc3RsZXMuZW1wdHkoKTtcbiAgICAgICAgcG9zLmVwU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICBwb3MucmVtYWluaW5nQ2hlY2tzID0gdW5kZWZpbmVkO1xuICAgICAgICBwb3MuaGFsZm1vdmVzID0gMDtcbiAgICAgICAgcG9zLmZ1bGxtb3ZlcyA9IDE7XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tU2V0dXAoc2V0dXApIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmZyb21TZXR1cChzZXR1cCkubWFwKHBvcyA9PiB7XG4gICAgICAgICAgICBwb3MuY2FzdGxlcyA9IGNoZXNzXzEuQ2FzdGxlcy5lbXB0eSgpO1xuICAgICAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHZhbGlkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5wYXduLm5vbkVtcHR5KCkgfHwgdGhpcy5pc0NoZWNrKCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBjaGVzc18xLlBvc2l0aW9uRXJyb3IoY2hlc3NfMS5JbGxlZ2FsU2V0dXAuVmFyaWFudCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNsb25lKCk7XG4gICAgfVxuICAgIGRlc3RzKHNxdWFyZSwgY3R4KSB7XG4gICAgICAgIC8vIEtpbmdzIGNhbm5vdCBnaXZlIGNoZWNrLlxuICAgICAgICBpZiAoc3F1YXJlID09PSBjdHgua2luZylcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5kZXN0cyhzcXVhcmUsIGN0eCk7XG4gICAgICAgIC8vIFRPRE86IFRoaXMgY291bGQgYmUgb3B0aW1pemVkIGNvbnNpZGVyYWJseS5cbiAgICAgICAgbGV0IGRlc3RzID0gc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmVtcHR5KCk7XG4gICAgICAgIGZvciAoY29uc3QgdG8gb2Ygc3VwZXIuZGVzdHMoc3F1YXJlLCBjdHgpKSB7XG4gICAgICAgICAgICAvLyBWYWxpZCwgYmVjYXVzZSB0aGVyZSBhcmUgbm8gcHJvbW90aW9ucyAob3IgZXZlbiBwYXducykuXG4gICAgICAgICAgICBjb25zdCB1Y2kgPSB7IGZyb206IHNxdWFyZSwgdG8gfTtcbiAgICAgICAgICAgIGNvbnN0IGFmdGVyID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICAgICAgYWZ0ZXIucGxheSh1Y2kpO1xuICAgICAgICAgICAgaWYgKCFhZnRlci5pc0NoZWNrKCkpXG4gICAgICAgICAgICAgICAgZGVzdHMgPSBkZXN0cy53aXRoKHRvKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdHM7XG4gICAgfVxuICAgIGhhc0luc3VmZmljaWVudE1hdGVyaWFsKF9jb2xvcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlzVmFyaWFudEVuZCgpIHtcbiAgICAgICAgY29uc3QgZ29hbCA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tUmFuayg3KTtcbiAgICAgICAgY29uc3QgaW5Hb2FsID0gdGhpcy5ib2FyZC5raW5nLmludGVyc2VjdChnb2FsKTtcbiAgICAgICAgaWYgKGluR29hbC5pc0VtcHR5KCkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLnR1cm4gPT09ICd3aGl0ZScgfHwgaW5Hb2FsLmludGVyc2VjdHModGhpcy5ib2FyZC5ibGFjaykpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gV2hpdGUgaGFzIHJlYWNoZWQgdGhlIGJhY2tyYW5rLiBDaGVjayBpZiBibGFjayBjYW4gY2F0Y2ggdXAuXG4gICAgICAgIGNvbnN0IGJsYWNrS2luZyA9IHRoaXMuYm9hcmQua2luZ09mKCdibGFjaycpO1xuICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQoYmxhY2tLaW5nKSkge1xuICAgICAgICAgICAgY29uc3Qgb2NjID0gdGhpcy5ib2FyZC5vY2N1cGllZC53aXRob3V0KGJsYWNrS2luZyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhcmdldCBvZiBhdHRhY2tzXzEua2luZ0F0dGFja3MoYmxhY2tLaW5nKS5pbnRlcnNlY3QoZ29hbCkuZGlmZih0aGlzLmJvYXJkLmJsYWNrKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtpbmdBdHRhY2tlcnModGFyZ2V0LCB1dGlsXzEub3Bwb3NpdGUodGhpcy50dXJuKSwgb2NjKS5pc0VtcHR5KCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyaWFudE91dGNvbWUoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1ZhcmlhbnRFbmQoKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgZ29hbCA9IHNxdWFyZVNldF8xLlNxdWFyZVNldC5mcm9tUmFuayg3KTtcbiAgICAgICAgY29uc3QgYmxhY2tJbkdvYWwgPSB0aGlzLmJvYXJkLnBpZWNlcygnYmxhY2snLCAna2luZycpLmludGVyc2VjdHMoZ29hbCk7XG4gICAgICAgIGNvbnN0IHdoaXRlSW5Hb2FsID0gdGhpcy5ib2FyZC5waWVjZXMoJ3doaXRlJywgJ2tpbmcnKS5pbnRlcnNlY3RzKGdvYWwpO1xuICAgICAgICBpZiAoYmxhY2tJbkdvYWwgJiYgIXdoaXRlSW5Hb2FsKVxuICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiAnYmxhY2snIH07XG4gICAgICAgIGlmICh3aGl0ZUluR29hbCAmJiAhYmxhY2tJbkdvYWwpXG4gICAgICAgICAgICByZXR1cm4geyB3aW5uZXI6ICd3aGl0ZScgfTtcbiAgICAgICAgcmV0dXJuIHsgd2lubmVyOiB1bmRlZmluZWQgfTtcbiAgICB9XG59XG5jbGFzcyBIb3JkZSBleHRlbmRzIGNoZXNzXzEuQ2hlc3Mge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcignaG9yZGUnKTtcbiAgICB9XG4gICAgc3RhdGljIGRlZmF1bHQoKSB7XG4gICAgICAgIGNvbnN0IHBvcyA9IG5ldyB0aGlzKCk7XG4gICAgICAgIHBvcy5ib2FyZCA9IGJvYXJkXzEuQm9hcmQuaG9yZGUoKTtcbiAgICAgICAgcG9zLnBvY2tldHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHBvcy50dXJuID0gJ3doaXRlJztcbiAgICAgICAgcG9zLmNhc3RsZXMgPSBjaGVzc18xLkNhc3RsZXMuZGVmYXVsdCgpO1xuICAgICAgICBwb3MuY2FzdGxlcy5kaXNjYXJkU2lkZSgnd2hpdGUnKTtcbiAgICAgICAgcG9zLmVwU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICBwb3MucmVtYWluaW5nQ2hlY2tzID0gdW5kZWZpbmVkO1xuICAgICAgICBwb3MuaGFsZm1vdmVzID0gMDtcbiAgICAgICAgcG9zLmZ1bGxtb3ZlcyA9IDE7XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tU2V0dXAoc2V0dXApIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmZyb21TZXR1cChzZXR1cCk7XG4gICAgfVxuICAgIHZhbGlkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5ib2FyZC5vY2N1cGllZC5pc0VtcHR5KCkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLkVtcHR5KSk7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZC5raW5nLmlzU2luZ2xlU3F1YXJlKCkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLktpbmdzKSk7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZC5raW5nLmRpZmYodGhpcy5ib2FyZC5wcm9tb3RlZCkuaXNTaW5nbGVTcXVhcmUoKSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBjaGVzc18xLlBvc2l0aW9uRXJyb3IoY2hlc3NfMS5JbGxlZ2FsU2V0dXAuS2luZ3MpKTtcbiAgICAgICAgY29uc3Qgb3RoZXJLaW5nID0gdGhpcy5ib2FyZC5raW5nT2YodXRpbF8xLm9wcG9zaXRlKHRoaXMudHVybikpO1xuICAgICAgICBpZiAodXRpbF8xLmRlZmluZWQob3RoZXJLaW5nKSAmJiB0aGlzLmtpbmdBdHRhY2tlcnMob3RoZXJLaW5nLCB0aGlzLnR1cm4sIHRoaXMuYm9hcmQub2NjdXBpZWQpLm5vbkVtcHR5KCkpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzEuUmVzdWx0LmVycihuZXcgY2hlc3NfMS5Qb3NpdGlvbkVycm9yKGNoZXNzXzEuSWxsZWdhbFNldHVwLk9wcG9zaXRlQ2hlY2spKTtcbiAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiB0eXBlc18xLkNPTE9SUykge1xuICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQucGllY2VzKGNvbG9yLCAncGF3bicpLmludGVyc2VjdHMoc3F1YXJlU2V0XzEuU3F1YXJlU2V0LmJhY2tyYW5rKHV0aWxfMS5vcHBvc2l0ZShjb2xvcikpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRfMS5SZXN1bHQuZXJyKG5ldyBjaGVzc18xLlBvc2l0aW9uRXJyb3IoY2hlc3NfMS5JbGxlZ2FsU2V0dXAuUGF3bnNPbkJhY2tyYW5rKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdF8xLlJlc3VsdC5vayh1bmRlZmluZWQpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNsb25lKCk7XG4gICAgfVxuICAgIGhhc0luc3VmZmljaWVudE1hdGVyaWFsKF9jb2xvcikge1xuICAgICAgICAvLyBUT0RPOiBDb3VsZCBkZXRlY3QgY2FzZXMgd2hlcmUgdGhlIGhvcmRlIGNhbm5vdCBtYXRlLlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlzVmFyaWFudEVuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQud2hpdGUuaXNFbXB0eSgpIHx8IHRoaXMuYm9hcmQuYmxhY2suaXNFbXB0eSgpO1xuICAgIH1cbiAgICB2YXJpYW50T3V0Y29tZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9hcmQud2hpdGUuaXNFbXB0eSgpKVxuICAgICAgICAgICAgcmV0dXJuIHsgd2lubmVyOiAnYmxhY2snIH07XG4gICAgICAgIGlmICh0aGlzLmJvYXJkLmJsYWNrLmlzRW1wdHkoKSlcbiAgICAgICAgICAgIHJldHVybiB7IHdpbm5lcjogJ3doaXRlJyB9O1xuICAgICAgICByZXR1cm47XG4gICAgfVxufVxuZXhwb3J0cy5Ib3JkZSA9IEhvcmRlO1xuZnVuY3Rpb24gZGVmYXVsdFBvc2l0aW9uKHJ1bGVzKSB7XG4gICAgc3dpdGNoIChydWxlcykge1xuICAgICAgICBjYXNlICdjaGVzcyc6IHJldHVybiBjaGVzc18xLkNoZXNzLmRlZmF1bHQoKTtcbiAgICAgICAgY2FzZSAnYW50aWNoZXNzJzogcmV0dXJuIEFudGljaGVzcy5kZWZhdWx0KCk7XG4gICAgICAgIGNhc2UgJ2F0b21pYyc6IHJldHVybiBBdG9taWMuZGVmYXVsdCgpO1xuICAgICAgICBjYXNlICdob3JkZSc6IHJldHVybiBIb3JkZS5kZWZhdWx0KCk7XG4gICAgICAgIGNhc2UgJ3JhY2luZ2tpbmdzJzogcmV0dXJuIFJhY2luZ0tpbmdzLmRlZmF1bHQoKTtcbiAgICAgICAgY2FzZSAna2luZ29mdGhlaGlsbCc6IHJldHVybiBLaW5nT2ZUaGVIaWxsLmRlZmF1bHQoKTtcbiAgICAgICAgY2FzZSAnM2NoZWNrJzogcmV0dXJuIFRocmVlQ2hlY2suZGVmYXVsdCgpO1xuICAgICAgICBjYXNlICdjcmF6eWhvdXNlJzogcmV0dXJuIENyYXp5aG91c2UuZGVmYXVsdCgpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdFBvc2l0aW9uID0gZGVmYXVsdFBvc2l0aW9uO1xuZnVuY3Rpb24gc2V0dXBQb3NpdGlvbihydWxlcywgc2V0dXApIHtcbiAgICBzd2l0Y2ggKHJ1bGVzKSB7XG4gICAgICAgIGNhc2UgJ2NoZXNzJzogcmV0dXJuIGNoZXNzXzEuQ2hlc3MuZnJvbVNldHVwKHNldHVwKTtcbiAgICAgICAgY2FzZSAnYW50aWNoZXNzJzogcmV0dXJuIEFudGljaGVzcy5mcm9tU2V0dXAoc2V0dXApO1xuICAgICAgICBjYXNlICdhdG9taWMnOiByZXR1cm4gQXRvbWljLmZyb21TZXR1cChzZXR1cCk7XG4gICAgICAgIGNhc2UgJ2hvcmRlJzogcmV0dXJuIEhvcmRlLmZyb21TZXR1cChzZXR1cCk7XG4gICAgICAgIGNhc2UgJ3JhY2luZ2tpbmdzJzogcmV0dXJuIFJhY2luZ0tpbmdzLmZyb21TZXR1cChzZXR1cCk7XG4gICAgICAgIGNhc2UgJ2tpbmdvZnRoZWhpbGwnOiByZXR1cm4gS2luZ09mVGhlSGlsbC5mcm9tU2V0dXAoc2V0dXApO1xuICAgICAgICBjYXNlICczY2hlY2snOiByZXR1cm4gVGhyZWVDaGVjay5mcm9tU2V0dXAoc2V0dXApO1xuICAgICAgICBjYXNlICdjcmF6eWhvdXNlJzogcmV0dXJuIENyYXp5aG91c2UuZnJvbVNldHVwKHNldHVwKTtcbiAgICB9XG59XG5leHBvcnRzLnNldHVwUG9zaXRpb24gPSBzZXR1cFBvc2l0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gICAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4gICAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkRGF0YSA9IGNoaWxkcmVuW2ldLmRhdGE7XG4gICAgICAgICAgICBpZiAoY2hpbGREYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhZGROUyhjaGlsZERhdGEsIGNoaWxkcmVuW2ldLmNoaWxkcmVuLCBjaGlsZHJlbltpXS5zZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgICBpZiAoYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGEgPSBiO1xuICAgICAgICBpZiAoaXMuYXJyYXkoYykpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHtcbiAgICAgICAgICAgIHRleHQgPSBjO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMgJiYgYy5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2NdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXMuYXJyYXkoYikpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYikpIHtcbiAgICAgICAgICAgIHRleHQgPSBiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIgJiYgYi5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2JdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YSA9IGI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKVxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldID0gdm5vZGVfMS52bm9kZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnICYmXG4gICAgICAgIChzZWwubGVuZ3RoID09PSAzIHx8IHNlbFszXSA9PT0gJy4nIHx8IHNlbFszXSA9PT0gJyMnKSkge1xuICAgICAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlXzEudm5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn1cbmV4cG9ydHMuaCA9IGg7XG47XG5leHBvcnRzLmRlZmF1bHQgPSBoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xufVxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkge1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ2hpbGQobm9kZSwgY2hpbGQpIHtcbiAgICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlO1xufVxuZnVuY3Rpb24gbmV4dFNpYmxpbmcobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xufVxuZnVuY3Rpb24gdGFnTmFtZShlbG0pIHtcbiAgICByZXR1cm4gZWxtLnRhZ05hbWU7XG59XG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChub2RlLCB0ZXh0KSB7XG4gICAgbm9kZS50ZXh0Q29udGVudCA9IHRleHQ7XG59XG5mdW5jdGlvbiBnZXRUZXh0Q29udGVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dENvbnRlbnQ7XG59XG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxO1xufVxuZnVuY3Rpb24gaXNUZXh0KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMztcbn1cbmV4cG9ydHMuaHRtbERvbUFwaSA9IHtcbiAgICBjcmVhdGVFbGVtZW50OiBjcmVhdGVFbGVtZW50LFxuICAgIGNyZWF0ZUVsZW1lbnROUzogY3JlYXRlRWxlbWVudE5TLFxuICAgIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gICAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICAgIHBhcmVudE5vZGU6IHBhcmVudE5vZGUsXG4gICAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgc2V0VGV4dENvbnRlbnQ6IHNldFRleHRDb250ZW50LFxuICAgIGdldFRleHRDb250ZW50OiBnZXRUZXh0Q29udGVudCxcbiAgICBpc0VsZW1lbnQ6IGlzRWxlbWVudCxcbiAgICBpc1RleHQ6IGlzVGV4dCxcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmh0bWxEb21BcGk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1odG1sZG9tYXBpLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5hcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBwcmltaXRpdmUocykge1xuICAgIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5wcmltaXRpdmUgPSBwcmltaXRpdmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBrZXksIGVsbSA9IHZub2RlLmVsbSwgb2xkQXR0cnMgPSBvbGRWbm9kZS5kYXRhLmF0dHJzLCBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnM7XG4gICAgaWYgKCFvbGRBdHRycyAmJiAhYXR0cnMpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQXR0cnMgPT09IGF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQXR0cnMgPSBvbGRBdHRycyB8fCB7fTtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuICAgIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgICBmb3IgKGtleSBpbiBhdHRycykge1xuICAgICAgICB2YXIgY3VyID0gYXR0cnNba2V5XTtcbiAgICAgICAgdmFyIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgICAgICAgaWYgKGN1ciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGN1ciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgY3VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyByZW1vdmUgcmVtb3ZlZCBhdHRyaWJ1dGVzXG4gICAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAgIC8vIHRoZSBvdGhlciBvcHRpb24gaXMgdG8gcmVtb3ZlIGFsbCBhdHRyaWJ1dGVzIHdpdGggdmFsdWUgPT0gdW5kZWZpbmVkXG4gICAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICAgICAgaWYgKCEoa2V5IGluIGF0dHJzKSkge1xuICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUF0dHJzLCB1cGRhdGU6IHVwZGF0ZUF0dHJzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmF0dHJpYnV0ZXNNb2R1bGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdHRyaWJ1dGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gdXBkYXRlQ2xhc3Mob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBvbGRDbGFzcyA9IG9sZFZub2RlLmRhdGEuY2xhc3MsIGtsYXNzID0gdm5vZGUuZGF0YS5jbGFzcztcbiAgICBpZiAoIW9sZENsYXNzICYmICFrbGFzcylcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChvbGRDbGFzcyA9PT0ga2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBvbGRDbGFzcyA9IG9sZENsYXNzIHx8IHt9O1xuICAgIGtsYXNzID0ga2xhc3MgfHwge307XG4gICAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgICAgIGlmICgha2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgICAgICBjdXIgPSBrbGFzc1tuYW1lXTtcbiAgICAgICAgaWYgKGN1ciAhPT0gb2xkQ2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3RbY3VyID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmNsYXNzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmNsYXNzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2xhc3MuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBpbnZva2VIYW5kbGVyKGhhbmRsZXIsIHZub2RlLCBldmVudCkge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIC8vIGNhbGwgZnVuY3Rpb24gaGFuZGxlclxuICAgICAgICBoYW5kbGVyLmNhbGwodm5vZGUsIGV2ZW50LCB2bm9kZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIC8vIGNhbGwgaGFuZGxlciB3aXRoIGFyZ3VtZW50c1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXJbMF0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgLy8gc3BlY2lhbCBjYXNlIGZvciBzaW5nbGUgYXJndW1lbnQgZm9yIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICBpZiAoaGFuZGxlci5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyWzBdLmNhbGwodm5vZGUsIGhhbmRsZXJbMV0sIGV2ZW50LCB2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGhhbmRsZXIuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2godm5vZGUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZXJbMF0uYXBwbHkodm5vZGUsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gY2FsbCBtdWx0aXBsZSBoYW5kbGVyc1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYW5kbGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaW52b2tlSGFuZGxlcihoYW5kbGVyW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGhhbmRsZUV2ZW50KGV2ZW50LCB2bm9kZSkge1xuICAgIHZhciBuYW1lID0gZXZlbnQudHlwZSwgb24gPSB2bm9kZS5kYXRhLm9uO1xuICAgIC8vIGNhbGwgZXZlbnQgaGFuZGxlcihzKSBpZiBleGlzdHNcbiAgICBpZiAob24gJiYgb25bbmFtZV0pIHtcbiAgICAgICAgaW52b2tlSGFuZGxlcihvbltuYW1lXSwgdm5vZGUsIGV2ZW50KTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVMaXN0ZW5lcigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gaGFuZGxlcihldmVudCkge1xuICAgICAgICBoYW5kbGVFdmVudChldmVudCwgaGFuZGxlci52bm9kZSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50TGlzdGVuZXJzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBvbGRPbiA9IG9sZFZub2RlLmRhdGEub24sIG9sZExpc3RlbmVyID0gb2xkVm5vZGUubGlzdGVuZXIsIG9sZEVsbSA9IG9sZFZub2RlLmVsbSwgb24gPSB2bm9kZSAmJiB2bm9kZS5kYXRhLm9uLCBlbG0gPSAodm5vZGUgJiYgdm5vZGUuZWxtKSwgbmFtZTtcbiAgICAvLyBvcHRpbWl6YXRpb24gZm9yIHJldXNlZCBpbW11dGFibGUgaGFuZGxlcnNcbiAgICBpZiAob2xkT24gPT09IG9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gcmVtb3ZlIGV4aXN0aW5nIGxpc3RlbmVycyB3aGljaCBubyBsb25nZXIgdXNlZFxuICAgIGlmIChvbGRPbiAmJiBvbGRMaXN0ZW5lcikge1xuICAgICAgICAvLyBpZiBlbGVtZW50IGNoYW5nZWQgb3IgZGVsZXRlZCB3ZSByZW1vdmUgYWxsIGV4aXN0aW5nIGxpc3RlbmVycyB1bmNvbmRpdGlvbmFsbHlcbiAgICAgICAgaWYgKCFvbikge1xuICAgICAgICAgICAgZm9yIChuYW1lIGluIG9sZE9uKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyIGlmIGVsZW1lbnQgd2FzIGNoYW5nZWQgb3IgZXhpc3RpbmcgbGlzdGVuZXJzIHJlbW92ZWRcbiAgICAgICAgICAgICAgICBvbGRFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBvbGRMaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChuYW1lIGluIG9sZE9uKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyIGlmIGV4aXN0aW5nIGxpc3RlbmVyIHJlbW92ZWRcbiAgICAgICAgICAgICAgICBpZiAoIW9uW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIG9sZExpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGFkZCBuZXcgbGlzdGVuZXJzIHdoaWNoIGhhcyBub3QgYWxyZWFkeSBhdHRhY2hlZFxuICAgIGlmIChvbikge1xuICAgICAgICAvLyByZXVzZSBleGlzdGluZyBsaXN0ZW5lciBvciBjcmVhdGUgbmV3XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHZub2RlLmxpc3RlbmVyID0gb2xkVm5vZGUubGlzdGVuZXIgfHwgY3JlYXRlTGlzdGVuZXIoKTtcbiAgICAgICAgLy8gdXBkYXRlIHZub2RlIGZvciBsaXN0ZW5lclxuICAgICAgICBsaXN0ZW5lci52bm9kZSA9IHZub2RlO1xuICAgICAgICAvLyBpZiBlbGVtZW50IGNoYW5nZWQgb3IgYWRkZWQgd2UgYWRkIGFsbCBuZWVkZWQgbGlzdGVuZXJzIHVuY29uZGl0aW9uYWxseVxuICAgICAgICBpZiAoIW9sZE9uKSB7XG4gICAgICAgICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgICAgICAgICAvLyBhZGQgbGlzdGVuZXIgaWYgZWxlbWVudCB3YXMgY2hhbmdlZCBvciBuZXcgbGlzdGVuZXJzIGFkZGVkXG4gICAgICAgICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobmFtZSBpbiBvbikge1xuICAgICAgICAgICAgICAgIC8vIGFkZCBsaXN0ZW5lciBpZiBuZXcgbGlzdGVuZXIgYWRkZWRcbiAgICAgICAgICAgICAgICBpZiAoIW9sZE9uW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5ldmVudExpc3RlbmVyc01vZHVsZSA9IHtcbiAgICBjcmVhdGU6IHVwZGF0ZUV2ZW50TGlzdGVuZXJzLFxuICAgIHVwZGF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnMsXG4gICAgZGVzdHJveTogdXBkYXRlRXZlbnRMaXN0ZW5lcnNcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmV2ZW50TGlzdGVuZXJzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZlbnRsaXN0ZW5lcnMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIga2V5LCBjdXIsIG9sZCwgZWxtID0gdm5vZGUuZWxtLCBvbGRQcm9wcyA9IG9sZFZub2RlLmRhdGEucHJvcHMsIHByb3BzID0gdm5vZGUuZGF0YS5wcm9wcztcbiAgICBpZiAoIW9sZFByb3BzICYmICFwcm9wcylcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChvbGRQcm9wcyA9PT0gcHJvcHMpXG4gICAgICAgIHJldHVybjtcbiAgICBvbGRQcm9wcyA9IG9sZFByb3BzIHx8IHt9O1xuICAgIHByb3BzID0gcHJvcHMgfHwge307XG4gICAgZm9yIChrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICAgICAgaWYgKCFwcm9wc1trZXldKSB7XG4gICAgICAgICAgICBkZWxldGUgZWxtW2tleV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChrZXkgaW4gcHJvcHMpIHtcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcbiAgICAgICAgb2xkID0gb2xkUHJvcHNba2V5XTtcbiAgICAgICAgaWYgKG9sZCAhPT0gY3VyICYmIChrZXkgIT09ICd2YWx1ZScgfHwgZWxtW2tleV0gIT09IGN1cikpIHtcbiAgICAgICAgICAgIGVsbVtrZXldID0gY3VyO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5wcm9wc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wcyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5wcm9wc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByb3BzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdpZCcsIHNlbC5zbGljZShoYXNoICsgMSwgZG90KSk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdjbGFzcycsIHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAob2xkQXJnc1tpXSAhPT0gYXJnc1tpXSkge1xuICAgICAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5VG9UaHVuayhvbGRWbm9kZSwgdGh1bmspO1xufVxuZXhwb3J0cy50aHVuayA9IGZ1bmN0aW9uIHRodW5rKHNlbCwga2V5LCBmbiwgYXJncykge1xuICAgIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncyA9IGZuO1xuICAgICAgICBmbiA9IGtleTtcbiAgICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaF8xLmgoc2VsLCB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBob29rOiB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCB9LFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnRodW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGh1bmsuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB2bm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gICAgcmV0dXJuIHsgc2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5IH07XG59XG5leHBvcnRzLnZub2RlID0gdm5vZGU7XG5leHBvcnRzLmRlZmF1bHQgPSB2bm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZub2RlLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVkPEE+KHY6IEEgfCB1bmRlZmluZWQpOiB2IGlzIEEge1xuICByZXR1cm4gdHlwZW9mIHYgIT09ICd1bmRlZmluZWQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW1wdHkoYTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAhYSB8fCBhLmxlbmd0aCA9PT0gMDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9wPFQ+IHtcbiAgKCk6IFRcbiAgKHY6IFQpOiBUXG59XG5cbi8vIGxpa2UgbWl0aHJpbCBwcm9wIGJ1dCB3aXRoIHR5cGUgc2FmZXR5XG5leHBvcnQgZnVuY3Rpb24gcHJvcDxBPihpbml0aWFsVmFsdWU6IEEpOiBQcm9wPEE+IHtcbiAgbGV0IHZhbHVlID0gaW5pdGlhbFZhbHVlO1xuICBjb25zdCBmdW4gPSBmdW5jdGlvbih2OiBBIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKGRlZmluZWQodikpIHZhbHVlID0gdjtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG4gIHJldHVybiBmdW4gYXMgUHJvcDxBPjtcbn1cbiIsIi8qIEJhc2VkIG9uOiAqL1xuLyohXG4gKiBob3ZlckludGVudCB2MS4xMC4wIC8vIDIwMTkuMDIuMjUgLy8galF1ZXJ5IHYxLjcuMCtcbiAqIGh0dHA6Ly9icmlhbmNoZXJuZS5naXRodWIuaW8vanF1ZXJ5LWhvdmVySW50ZW50L1xuICpcbiAqIFlvdSBtYXkgdXNlIGhvdmVySW50ZW50IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIGxpY2Vuc2UuIEJhc2ljYWxseSB0aGF0XG4gKiBtZWFucyB5b3UgYXJlIGZyZWUgdG8gdXNlIGhvdmVySW50ZW50IGFzIGxvbmcgYXMgdGhpcyBoZWFkZXIgaXMgbGVmdCBpbnRhY3QuXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE5IEJyaWFuIENoZXJuZVxuICovXG5cbnR5cGUgU3RhdGUgPSBhbnk7XG5cbmV4cG9ydCBjb25zdCBtZW51SG92ZXIgPSAoKSA9PiB3aW5kb3cubGljaGVzcy5yYWYoZnVuY3Rpb24oKSB7XG5cbiAgaWYgKHdpbmRvdy5saWNoZXNzLmhhc1RvdWNoRXZlbnRzKSByZXR1cm47XG5cbiAgbGV0IGludGVydmFsOiBudW1iZXIgPSAxMDA7XG4gIGxldCBzZW5zaXRpdml0eTogbnVtYmVyID0gMTA7XG5cbiAgLy8gY3VycmVudCBYIGFuZCBZIHBvc2l0aW9uIG9mIG1vdXNlLCB1cGRhdGVkIGR1cmluZyBtb3VzZW1vdmUgdHJhY2tpbmcgKHNoYXJlZCBhY3Jvc3MgaW5zdGFuY2VzKVxuICBsZXQgY1g6IG51bWJlciwgY1k6IG51bWJlcjtcblxuICAvLyBzYXZlcyB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGNvb3JkaW5hdGVzIGJhc2VkIG9uIHRoZSBnaXZlbiBtb3VzZW1vdmUgZXZlbnRcbiAgbGV0IHRyYWNrID0gZnVuY3Rpb24oZXY6IEpRdWVyeUV2ZW50T2JqZWN0KSB7XG4gICAgY1ggPSBldi5wYWdlWDtcbiAgICBjWSA9IGV2LnBhZ2VZO1xuICB9O1xuXG4gIC8vIHN0YXRlIHByb3BlcnRpZXM6XG4gIC8vIHRpbWVvdXRJZCA9IHRpbWVvdXQgSUQsIHJldXNlZCBmb3IgdHJhY2tpbmcgbW91c2UgcG9zaXRpb24gYW5kIGRlbGF5aW5nIFwib3V0XCIgaGFuZGxlclxuICAvLyBpc0FjdGl2ZSA9IHBsdWdpbiBzdGF0ZSwgdHJ1ZSBhZnRlciBgb3ZlcmAgaXMgY2FsbGVkIGp1c3QgdW50aWwgYG91dGAgaXMgY2FsbGVkXG4gIC8vIHBYLCBwWSA9IHByZXZpb3VzbHktbWVhc3VyZWQgcG9pbnRlciBjb29yZGluYXRlcywgdXBkYXRlZCBhdCBlYWNoIHBvbGxpbmcgaW50ZXJ2YWxcbiAgLy8gZXZlbnQgPSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBuYW1lc3BhY2VkIGV2ZW50IHVzZWQgZm9yIG1vdXNlIHRyYWNraW5nXG4gIGxldCBzdGF0ZTogU3RhdGUgPSB7fTtcblxuICAkKCcjdG9wbmF2LmhvdmVyJykuZWFjaChmdW5jdGlvbih0aGlzOiBIVE1MRWxlbWVudCkge1xuXG4gICAgY29uc3QgJGVsID0gJCh0aGlzKS5yZW1vdmVDbGFzcygnaG92ZXInKSxcbiAgICAgIGhhbmRsZXIgPSAoKSA9PiAkZWwudG9nZ2xlQ2xhc3MoJ2hvdmVyJyk7XG5cblxuICAgIC8vIGNvbXBhcmVzIGN1cnJlbnQgYW5kIHByZXZpb3VzIG1vdXNlIHBvc2l0aW9uc1xuICAgIGNvbnN0IGNvbXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGNvbXBhcmUgbW91c2UgcG9zaXRpb25zIHRvIHNlZSBpZiBwb2ludGVyIGhhcyBzbG93ZWQgZW5vdWdoIHRvIHRyaWdnZXIgYG92ZXJgIGZ1bmN0aW9uXG4gICAgICBpZiAoIE1hdGguc3FydCggKHN0YXRlLnBYLWNYKSooc3RhdGUucFgtY1gpICsgKHN0YXRlLnBZLWNZKSooc3RhdGUucFktY1kpICkgPCBzZW5zaXRpdml0eSApIHtcbiAgICAgICAgJGVsLm9mZihzdGF0ZS5ldmVudCwgdHJhY2spO1xuICAgICAgICBkZWxldGUgc3RhdGUudGltZW91dElkO1xuICAgICAgICAvLyBzZXQgaG92ZXJJbnRlbnQgc3RhdGUgYXMgYWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgKHBlcm1pdHMgYG91dGAgaGFuZGxlciB0byB0cmlnZ2VyKVxuICAgICAgICBzdGF0ZS5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHNldCBwcmV2aW91cyBjb29yZGluYXRlcyBmb3IgbmV4dCBjb21wYXJpc29uXG4gICAgICAgIHN0YXRlLnBYID0gY1g7IHN0YXRlLnBZID0gY1k7XG4gICAgICAgIC8vIHVzZSBzZWxmLWNhbGxpbmcgdGltZW91dCwgZ3VhcmFudGVlcyBpbnRlcnZhbHMgYXJlIHNwYWNlZCBvdXQgcHJvcGVybHkgKGF2b2lkcyBKYXZhU2NyaXB0IHRpbWVyIGJ1Z3MpXG4gICAgICAgIHN0YXRlLnRpbWVvdXRJZCA9IHNldFRpbWVvdXQoY29tcGFyZSwgaW50ZXJ2YWwgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQSBwcml2YXRlIGZ1bmN0aW9uIGZvciBoYW5kbGluZyBtb3VzZSAnaG92ZXJpbmcnXG4gICAgdmFyIGhhbmRsZUhvdmVyID0gZnVuY3Rpb24oZXY6IEpRdWVyeUV2ZW50T2JqZWN0KSB7XG5cbiAgICAgIC8vIGNsZWFyIGFueSBleGlzdGluZyB0aW1lb3V0XG4gICAgICBpZiAoc3RhdGUudGltZW91dElkKSB7IHN0YXRlLnRpbWVvdXRJZCA9IGNsZWFyVGltZW91dChzdGF0ZS50aW1lb3V0SWQpOyB9XG5cbiAgICAgIC8vIG5hbWVzcGFjZWQgZXZlbnQgdXNlZCB0byByZWdpc3RlciBhbmQgdW5yZWdpc3RlciBtb3VzZW1vdmUgdHJhY2tpbmdcbiAgICAgIHZhciBtb3VzZW1vdmUgPSBzdGF0ZS5ldmVudCA9ICdtb3VzZW1vdmUnO1xuXG4gICAgICAvLyBoYW5kbGUgdGhlIGV2ZW50LCBiYXNlZCBvbiBpdHMgdHlwZVxuICAgICAgaWYgKGV2LnR5cGUgPT0gJ21vdXNlZW50ZXInKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgYWxyZWFkeSBhY3RpdmUgb3IgYSBidXR0b24gaXMgcHJlc3NlZCAoZHJhZ2dpbmcgYSBwaWVjZSlcbiAgICAgICAgaWYgKHN0YXRlLmlzQWN0aXZlIHx8IChldi5vcmlnaW5hbEV2ZW50IGFzIE1vdXNlRXZlbnQpLmJ1dHRvbnMpIHJldHVybjtcbiAgICAgICAgLy8gc2V0IFwicHJldmlvdXNcIiBYIGFuZCBZIHBvc2l0aW9uIGJhc2VkIG9uIGluaXRpYWwgZW50cnkgcG9pbnRcbiAgICAgICAgc3RhdGUucFggPSBldi5wYWdlWDsgc3RhdGUucFkgPSBldi5wYWdlWTtcbiAgICAgICAgLy8gdXBkYXRlIFwiY3VycmVudFwiIFggYW5kIFkgcG9zaXRpb24gYmFzZWQgb24gbW91c2Vtb3ZlXG4gICAgICAgICRlbC5vZmYobW91c2Vtb3ZlLCB0cmFjaykub24obW91c2Vtb3ZlLCB0cmFjayk7XG4gICAgICAgIC8vIHN0YXJ0IHBvbGxpbmcgaW50ZXJ2YWwgKHNlbGYtY2FsbGluZyB0aW1lb3V0KSB0byBjb21wYXJlIG1vdXNlIGNvb3JkaW5hdGVzIG92ZXIgdGltZVxuICAgICAgICBzdGF0ZS50aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGNvbXBhcmUsIGludGVydmFsICk7XG4gICAgICB9IGVsc2UgeyAvLyBcIm1vdXNlbGVhdmVcIlxuICAgICAgICAvLyBkbyBub3RoaW5nIGlmIG5vdCBhbHJlYWR5IGFjdGl2ZVxuICAgICAgICBpZiAoIXN0YXRlLmlzQWN0aXZlKSByZXR1cm47XG4gICAgICAgIC8vIHVuYmluZCBleHBlbnNpdmUgbW91c2Vtb3ZlIGV2ZW50XG4gICAgICAgICRlbC5vZmYobW91c2Vtb3ZlLHRyYWNrKTtcbiAgICAgICAgLy8gaWYgaG92ZXJJbnRlbnQgc3RhdGUgaXMgdHJ1ZSwgdGhlbiBjYWxsIHRoZSBtb3VzZU91dCBmdW5jdGlvbiBhZnRlciB0aGUgc3BlY2lmaWVkIGRlbGF5XG4gICAgICAgIHN0YXRlID0ge307XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJGVsLm9uKCdtb3VzZWVudGVyJywgaGFuZGxlSG92ZXIpLm9uKCdtb3VzZWxlYXZlJywgaGFuZGxlSG92ZXIpO1xuICB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJztcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnO1xuaW1wb3J0IHsgQ2hlc3Nncm91bmQgfSBmcm9tICdjaGVzc2dyb3VuZCc7XG5pbXBvcnQgeyBDb25maWcgYXMgQ2dDb25maWcgfSBmcm9tICdjaGVzc2dyb3VuZC9jb25maWcnO1xuaW1wb3J0IHsgTW91Y2hFdmVudCB9IGZyb20gJ2NoZXNzZ3JvdW5kL3R5cGVzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnY2hlc3Nncm91bmQvdXRpbCc7XG5pbXBvcnQgRWRpdG9yQ3RybCBmcm9tICcuL2N0cmwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBFZGl0b3JDdHJsKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2LmNnLXdyYXAnLCB7XG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0OiB2bm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGVsID0gdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBjdHJsLmNoZXNzZ3JvdW5kID0gQ2hlc3Nncm91bmQoZWwsIG1ha2VDb25maWcoY3RybCkpO1xuICAgICAgICBiaW5kRXZlbnRzKGVsLCBjdHJsKTtcbiAgICAgIH0sXG4gICAgICBkZXN0cm95OiBfID0+IGN0cmwuY2hlc3Nncm91bmQhLmRlc3Ryb3koKVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoZWw6IEhUTUxFbGVtZW50LCBjdHJsOiBFZGl0b3JDdHJsKTogdm9pZCB7XG4gIGNvbnN0IGhhbmRsZXIgPSBvbk1vdXNlRXZlbnQoY3RybCk7XG4gIFsndG91Y2hzdGFydCcsICd0b3VjaG1vdmUnLCAnbW91c2Vkb3duJywgJ21vdXNlbW92ZScsICdjb250ZXh0bWVudSddLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2LCBoYW5kbGVyKVxuICB9KTtcbn1cblxuZnVuY3Rpb24gaXNMZWZ0QnV0dG9uKGU6IE1vdWNoRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGUuYnV0dG9ucyA9PT0gMSB8fCBlLmJ1dHRvbiA9PT0gMTtcbn1cblxuZnVuY3Rpb24gaXNMZWZ0Q2xpY2soZTogTW91Y2hFdmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNMZWZ0QnV0dG9uKGUpICYmICFlLmN0cmxLZXk7XG59XG5cbmZ1bmN0aW9uIGlzUmlnaHRDbGljayhlOiBNb3VjaEV2ZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiB1dGlsLmlzUmlnaHRCdXR0b24oZSkgfHwgKGUuY3RybEtleSAmJiBpc0xlZnRCdXR0b24oZSkpO1xufVxuXG5sZXQgZG93bktleTogS2V5IHwgdW5kZWZpbmVkO1xubGV0IGxhc3RLZXk6IEtleSB8IHVuZGVmaW5lZDtcbmxldCBwbGFjZURlbGV0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gb25Nb3VzZUV2ZW50KGN0cmw6IEVkaXRvckN0cmwpOiAoZTogTW91Y2hFdmVudCkgPT4gdm9pZCB7XG4gIHJldHVybiBmdW5jdGlvbihlOiBNb3VjaEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qgc2VsID0gY3RybC5zZWxlY3RlZCgpO1xuXG4gICAgLy8gZG8gbm90IGdlbmVyYXRlIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnRcbiAgICAvLyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1RvdWNoX2V2ZW50cy9TdXBwb3J0aW5nX2JvdGhfVG91Y2hFdmVudF9hbmRfTW91c2VFdmVudClcbiAgICBpZiAoc2VsICE9PSAncG9pbnRlcicgJiYgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSAmJiAoZS50eXBlID09PSAndG91Y2hzdGFydCcgfHwgZS50eXBlID09PSAndG91Y2htb3ZlJykpIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmIChpc0xlZnRDbGljayhlKSB8fCBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyB8fCBlLnR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICBpZiAoc2VsID09PSAncG9pbnRlcicgfHwgKGN0cmwuY2hlc3Nncm91bmQgJiYgY3RybC5jaGVzc2dyb3VuZC5zdGF0ZS5kcmFnZ2FibGUuY3VycmVudCAmJiBjdHJsLmNoZXNzZ3JvdW5kLnN0YXRlLmRyYWdnYWJsZS5jdXJyZW50Lm5ld1BpZWNlKSkgcmV0dXJuO1xuICAgICAgY29uc3QgcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgICAgaWYgKCFwb3MpIHJldHVybjtcbiAgICAgIGNvbnN0IGtleSA9IGN0cmwuY2hlc3Nncm91bmQhLmdldEtleUF0RG9tUG9zKHBvcyk7XG4gICAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgICAgaWYgKGUudHlwZSA9PT0gJ21vdXNlZG93bicgfHwgZS50eXBlID09PSAndG91Y2hzdGFydCcpIGRvd25LZXkgPSBrZXk7XG4gICAgICBpZiAoc2VsID09PSAndHJhc2gnKSBkZWxldGVPckhpZGVQaWVjZShjdHJsLCBrZXksIGUpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nUGllY2UgPSBjdHJsLmNoZXNzZ3JvdW5kIS5zdGF0ZS5waWVjZXNba2V5XTtcbiAgICAgICAgY29uc3QgcGllY2UgPSB7XG4gICAgICAgICAgY29sb3I6IHNlbFswXSxcbiAgICAgICAgICByb2xlOiBzZWxbMV1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc2FtZVBpZWNlID0gZXhpc3RpbmdQaWVjZSAmJiBwaWVjZS5jb2xvciA9PSBleGlzdGluZ1BpZWNlLmNvbG9yICYmIHBpZWNlLnJvbGUgPT0gZXhpc3RpbmdQaWVjZS5yb2xlO1xuXG4gICAgICAgIGlmICgoZS50eXBlID09PSAnbW91c2Vkb3duJyB8fCBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JykgJiYgc2FtZVBpZWNlKSB7XG4gICAgICAgICAgZGVsZXRlT3JIaWRlUGllY2UoY3RybCwga2V5LCBlKTtcbiAgICAgICAgICBwbGFjZURlbGV0ZSA9IHRydWU7XG4gICAgICAgICAgY29uc3QgZW5kRXZlbnRzID0geyBtb3VzZWRvd246ICdtb3VzZXVwJywgdG91Y2hzdGFydDogJ3RvdWNoZW5kJyB9O1xuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZW5kRXZlbnRzW2UudHlwZV0sICgpID0+IHBsYWNlRGVsZXRlID0gZmFsc2UsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICghcGxhY2VEZWxldGUgJiYgKGUudHlwZSA9PT0gJ21vdXNlZG93bicgfHwgZS50eXBlID09PSAndG91Y2hzdGFydCcgfHwga2V5ICE9PSBsYXN0S2V5KSkge1xuICAgICAgICAgIGN0cmwuY2hlc3Nncm91bmQhLnNldFBpZWNlcyh7XG4gICAgICAgICAgICBba2V5XTogcGllY2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjdHJsLm9uQ2hhbmdlKCk7XG4gICAgICAgICAgY3RybC5jaGVzc2dyb3VuZCEuY2FuY2VsTW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsYXN0S2V5ID0ga2V5O1xuICAgIH0gZWxzZSBpZiAoaXNSaWdodENsaWNrKGUpKSB7XG4gICAgICBpZiAoc2VsICE9PSAncG9pbnRlcicpIHtcbiAgICAgICAgY3RybC5jaGVzc2dyb3VuZCEuc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY3RybC5jaGVzc2dyb3VuZCEuc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG5cbiAgICAgICAgaWYgKGUudHlwZSA9PT0gJ2NvbnRleHRtZW51JyAmJiBzZWwgIT0gJ3RyYXNoJykge1xuICAgICAgICAgIGN0cmwuY2hlc3Nncm91bmQhLmNhbmNlbE1vdmUoKTtcbiAgICAgICAgICBzZWxbMF0gPSB1dGlsLm9wcG9zaXRlKHNlbFswXSk7XG4gICAgICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVsZXRlT3JIaWRlUGllY2UoY3RybDogRWRpdG9yQ3RybCwga2V5OiBLZXksIGU6IEV2ZW50KTogdm9pZCB7XG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuICAgIGlmIChjdHJsLmNoZXNzZ3JvdW5kIS5zdGF0ZS5waWVjZXNba2V5XSkge1xuICAgICAgKGN0cmwuY2hlc3Nncm91bmQhLnN0YXRlLmRyYWdnYWJsZS5jdXJyZW50IS5lbGVtZW50IGFzIEhUTUxFbGVtZW50KS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgY3RybC5jaGVzc2dyb3VuZCEuY2FuY2VsTW92ZSgpO1xuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsICgpID0+IGRlbGV0ZVBpZWNlKGN0cmwsIGtleSksIHsgb25jZTogdHJ1ZSB9KTtcbiAgfSBlbHNlIGlmIChlLnR5cGUgPT09ICdtb3VzZWRvd24nIHx8IGtleSAhPT0gZG93bktleSkge1xuICAgIGRlbGV0ZVBpZWNlKGN0cmwsIGtleSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVsZXRlUGllY2UoY3RybDogRWRpdG9yQ3RybCwga2V5OiBLZXkpOiB2b2lkIHtcbiAgY3RybC5jaGVzc2dyb3VuZCEuc2V0UGllY2VzKHtcbiAgICBba2V5XTogdW5kZWZpbmVkXG4gIH0pO1xuICBjdHJsLm9uQ2hhbmdlKCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VDb25maWcoY3RybDogRWRpdG9yQ3RybCk6IENnQ29uZmlnIHtcbiAgcmV0dXJuIHtcbiAgICBmZW46IGN0cmwuY2ZnLmZlbixcbiAgICBvcmllbnRhdGlvbjogY3RybC5vcHRpb25zLm9yaWVudGF0aW9uIHx8ICd3aGl0ZScsXG4gICAgY29vcmRpbmF0ZXM6ICFjdHJsLmNmZy5lbWJlZCxcbiAgICBhdXRvQ2FzdGxlOiBmYWxzZSxcbiAgICBhZGRQaWVjZVpJbmRleDogY3RybC5jZmcuaXMzZCxcbiAgICBtb3ZhYmxlOiB7XG4gICAgICBmcmVlOiB0cnVlLFxuICAgICAgY29sb3I6ICdib3RoJ1xuICAgIH0sXG4gICAgYW5pbWF0aW9uOiB7XG4gICAgICBkdXJhdGlvbjogY3RybC5jZmcuYW5pbWF0aW9uLmR1cmF0aW9uXG4gICAgfSxcbiAgICBwcmVtb3ZhYmxlOiB7XG4gICAgICBlbmFibGVkOiBmYWxzZVxuICAgIH0sXG4gICAgZHJhd2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICB9LFxuICAgIGRyYWdnYWJsZToge1xuICAgICAgc2hvd0dob3N0OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiB0cnVlXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7XG4gICAgICBlbmFibGVkOiBmYWxzZVxuICAgIH0sXG4gICAgaGlnaGxpZ2h0OiB7XG4gICAgICBsYXN0TW92ZTogZmFsc2VcbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2hhbmdlOiBjdHJsLm9uQ2hhbmdlLmJpbmQoY3RybClcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBFZGl0b3JDb25maWcsIEVkaXRvck9wdGlvbnMsIEVkaXRvclN0YXRlLCBTZWxlY3RlZCwgUmVkcmF3LCBPcGVuaW5nUG9zaXRpb24sIENhc3RsaW5nVG9nZ2xlLCBDYXN0bGluZ1RvZ2dsZXMsIENBU1RMSU5HX1RPR0dMRVMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQXBpIGFzIENnQXBpIH0gZnJvbSAnY2hlc3Nncm91bmQvYXBpJztcbmltcG9ydCB7IFJ1bGVzLCBTcXVhcmUgfSBmcm9tICdjaGVzc29wcy90eXBlcyc7XG5pbXBvcnQgeyBTcXVhcmVTZXQgfSBmcm9tICdjaGVzc29wcy9zcXVhcmVTZXQnO1xuaW1wb3J0IHsgQm9hcmQgfSBmcm9tICdjaGVzc29wcy9ib2FyZCc7XG5pbXBvcnQgeyBTZXR1cCwgTWF0ZXJpYWwsIFJlbWFpbmluZ0NoZWNrcyB9IGZyb20gJ2NoZXNzb3BzL3NldHVwJztcbmltcG9ydCB7IENhc3RsZXMsIHNldHVwUG9zaXRpb24gfSBmcm9tICdjaGVzc29wcy92YXJpYW50JztcbmltcG9ydCB7IG1ha2VGZW4sIHBhcnNlRmVuLCBwYXJzZUNhc3RsaW5nRmVuLCBJTklUSUFMX0ZFTiwgRU1QVFlfRkVOLCBJTklUSUFMX0VQRCB9IGZyb20gJ2NoZXNzb3BzL2Zlbic7XG5pbXBvcnQgeyBkZWZpbmVkLCBwcm9wLCBQcm9wIH0gZnJvbSAnY29tbW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdG9yQ3RybCB7XG4gIGNmZzogRWRpdG9yQ29uZmlnO1xuICBvcHRpb25zOiBFZGl0b3JPcHRpb25zO1xuICB0cmFuczogVHJhbnM7XG4gIGV4dHJhUG9zaXRpb25zOiBPcGVuaW5nUG9zaXRpb25bXTtcbiAgY2hlc3Nncm91bmQ6IENnQXBpIHwgdW5kZWZpbmVkO1xuICByZWRyYXc6IFJlZHJhdztcblxuICBzZWxlY3RlZDogUHJvcDxTZWxlY3RlZD47XG5cbiAgcG9ja2V0czogTWF0ZXJpYWwgfCB1bmRlZmluZWQ7XG4gIHR1cm46IENvbG9yO1xuICB1bm1vdmVkUm9va3M6IFNxdWFyZVNldCB8IHVuZGVmaW5lZDtcbiAgY2FzdGxpbmdUb2dnbGVzOiBDYXN0bGluZ1RvZ2dsZXM8Ym9vbGVhbj47XG4gIGVwU3F1YXJlOiBTcXVhcmUgfCB1bmRlZmluZWQ7XG4gIHJlbWFpbmluZ0NoZWNrczogUmVtYWluaW5nQ2hlY2tzIHwgdW5kZWZpbmVkO1xuICBydWxlczogUnVsZXM7XG4gIGhhbGZtb3ZlczogbnVtYmVyO1xuICBmdWxsbW92ZXM6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihjZmc6IEVkaXRvckNvbmZpZywgcmVkcmF3OiBSZWRyYXcpIHtcbiAgICB0aGlzLmNmZyA9IGNmZztcbiAgICB0aGlzLm9wdGlvbnMgPSBjZmcub3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMudHJhbnMgPSB3aW5kb3cubGljaGVzcy50cmFucyh0aGlzLmNmZy5pMThuKTtcblxuICAgIHRoaXMuc2VsZWN0ZWQgPSBwcm9wKCdwb2ludGVyJyk7XG5cbiAgICB0aGlzLmV4dHJhUG9zaXRpb25zID0gW3tcbiAgICAgIGZlbjogSU5JVElBTF9GRU4sXG4gICAgICBlcGQ6IElOSVRJQUxfRVBELFxuICAgICAgbmFtZTogdGhpcy50cmFucygnc3RhcnRQb3NpdGlvbicpXG4gICAgfSwge1xuICAgICAgZmVuOiAncHJvbXB0JyxcbiAgICAgIG5hbWU6IHRoaXMudHJhbnMoJ2xvYWRQb3NpdGlvbicpXG4gICAgfV07XG5cbiAgICBpZiAoY2ZnLnBvc2l0aW9ucykge1xuICAgICAgY2ZnLnBvc2l0aW9ucy5mb3JFYWNoKHAgPT4gcC5lcGQgPSBwLmZlbi5zcGxpdCgnICcpLnNwbGljZSgwLCA0KS5qb2luKCcgJykpO1xuICAgIH1cblxuICAgIHdpbmRvdy5Nb3VzZXRyYXAuYmluZCgnZicsIChlOiBFdmVudCkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKHRoaXMuY2hlc3Nncm91bmQpIHRoaXMuY2hlc3Nncm91bmQudG9nZ2xlT3JpZW50YXRpb24oKTtcbiAgICAgIHJlZHJhdygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jYXN0bGluZ1RvZ2dsZXMgPSB7IEs6IGZhbHNlLCBROiBmYWxzZSwgazogZmFsc2UsIHE6IGZhbHNlIH07XG4gICAgdGhpcy5ydWxlcyA9ICdjaGVzcyc7XG5cbiAgICB0aGlzLnJlZHJhdyA9ICgpID0+IHt9O1xuICAgIHRoaXMuc2V0RmVuKGNmZy5mZW4pO1xuICAgIHRoaXMucmVkcmF3ID0gcmVkcmF3O1xuICB9XG5cbiAgb25DaGFuZ2UoKTogdm9pZCB7XG4gICAgY29uc3QgZmVuID0gdGhpcy5nZXRGZW4oKTtcbiAgICBpZiAoIXRoaXMuY2ZnLmVtYmVkKSB7XG4gICAgICBpZiAoZmVuID09IElOSVRJQUxfRkVOKSB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgJycsICcvZWRpdG9yJyk7XG4gICAgICBlbHNlIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCAnJywgdGhpcy5tYWtlVXJsKCcvZWRpdG9yLycsIGZlbikpO1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnMub25DaGFuZ2UgJiYgdGhpcy5vcHRpb25zLm9uQ2hhbmdlKGZlbik7XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FzdGxpbmdUb2dnbGVGZW4oKTogc3RyaW5nIHtcbiAgICBsZXQgZmVuID0gJyc7XG4gICAgZm9yIChjb25zdCB0b2dnbGUgb2YgQ0FTVExJTkdfVE9HR0xFUykge1xuICAgICAgaWYgKHRoaXMuY2FzdGxpbmdUb2dnbGVzW3RvZ2dsZV0pIGZlbiArPSB0b2dnbGU7XG4gICAgfVxuICAgIHJldHVybiBmZW47XG4gIH1cblxuICBwcml2YXRlIGdldFNldHVwKCk6IFNldHVwIHtcbiAgICBjb25zdCBib2FyZEZlbiA9IHRoaXMuY2hlc3Nncm91bmQgPyB0aGlzLmNoZXNzZ3JvdW5kLmdldEZlbigpIDogdGhpcy5jZmcuZmVuO1xuICAgIGNvbnN0IGJvYXJkID0gcGFyc2VGZW4oYm9hcmRGZW4pLnVud3JhcChzZXR1cCA9PiBzZXR1cC5ib2FyZCwgXyA9PiBCb2FyZC5lbXB0eSgpKTtcbiAgICByZXR1cm4ge1xuICAgICAgYm9hcmQsXG4gICAgICBwb2NrZXRzOiB0aGlzLnBvY2tldHMsXG4gICAgICB0dXJuOiB0aGlzLnR1cm4sXG4gICAgICB1bm1vdmVkUm9va3M6IHRoaXMudW5tb3ZlZFJvb2tzIHx8IHBhcnNlQ2FzdGxpbmdGZW4oYm9hcmQsIHRoaXMuY2FzdGxpbmdUb2dnbGVGZW4oKSkudW53cmFwKCksXG4gICAgICBlcFNxdWFyZTogdGhpcy5lcFNxdWFyZSxcbiAgICAgIHJlbWFpbmluZ0NoZWNrczogdGhpcy5yZW1haW5pbmdDaGVja3MsXG4gICAgICBoYWxmbW92ZXM6IHRoaXMuaGFsZm1vdmVzLFxuICAgICAgZnVsbG1vdmVzOiB0aGlzLmZ1bGxtb3ZlcyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0RmVuKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG1ha2VGZW4odGhpcy5nZXRTZXR1cCgpLCB7cHJvbW90ZWQ6IHRoaXMucnVsZXMgPT0gJ2NyYXp5aG91c2UnfSk7XG4gIH1cblxuICBwcml2YXRlIGdldExlZ2FsRmVuKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHNldHVwUG9zaXRpb24odGhpcy5ydWxlcywgdGhpcy5nZXRTZXR1cCgpKS51bndyYXAocG9zID0+IHtcbiAgICAgIHJldHVybiBtYWtlRmVuKHBvcy50b1NldHVwKCksIHtwcm9tb3RlZDogcG9zLnJ1bGVzID09ICdjcmF6eWhvdXNlJ30pO1xuICAgIH0sIF8gPT4gdW5kZWZpbmVkKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNQbGF5YWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc2V0dXBQb3NpdGlvbih0aGlzLnJ1bGVzLCB0aGlzLmdldFNldHVwKCkpLnVud3JhcChwb3MgPT4gIXBvcy5pc0VuZCgpLCBfID0+IGZhbHNlKTtcbiAgfVxuXG4gIGdldFN0YXRlKCk6IEVkaXRvclN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmVuOiB0aGlzLmdldEZlbigpLFxuICAgICAgbGVnYWxGZW46IHRoaXMuZ2V0TGVnYWxGZW4oKSxcbiAgICAgIHBsYXlhYmxlOiB0aGlzLnJ1bGVzID09ICdjaGVzcycgJiYgdGhpcy5pc1BsYXlhYmxlKCksXG4gICAgfTtcbiAgfVxuXG4gIG1ha2VBbmFseXNpc1VybChsZWdhbEZlbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHRoaXMucnVsZXMpIHtcbiAgICAgIGNhc2UgJ2NoZXNzJzogcmV0dXJuIHRoaXMubWFrZVVybCgnL2FuYWx5c2lzLycsIGxlZ2FsRmVuKTtcbiAgICAgIGNhc2UgJzNjaGVjayc6IHJldHVybiB0aGlzLm1ha2VVcmwoJy9hbmFseXNpcy90aHJlZUNoZWNrLycsIGxlZ2FsRmVuKTtcbiAgICAgIGNhc2UgJ2tpbmdvZnRoZWhpbGwnOiByZXR1cm4gdGhpcy5tYWtlVXJsKCcvYW5hbHlzaXMva2luZ09mVGhlSGlsbC8nLCBsZWdhbEZlbik7XG4gICAgICBjYXNlICdyYWNpbmdraW5ncyc6IHJldHVybiB0aGlzLm1ha2VVcmwoJy9hbmFseXNpcy9yYWNpbmdLaW5ncy8nLCBsZWdhbEZlbik7XG4gICAgICBjYXNlICdhbnRpY2hlc3MnOlxuICAgICAgY2FzZSAnYXRvbWljJzpcbiAgICAgIGNhc2UgJ2hvcmRlJzpcbiAgICAgIGNhc2UgJ2NyYXp5aG91c2UnOlxuICAgICAgICByZXR1cm4gdGhpcy5tYWtlVXJsKGAvYW5hbHlzaXMvJHt0aGlzLnJ1bGVzfS9gLCBsZWdhbEZlbik7XG4gICAgfVxuICB9XG5cbiAgbWFrZVVybChiYXNlVXJsOiBzdHJpbmcsIGZlbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmFzZVVybCArIGVuY29kZVVSSUNvbXBvbmVudChmZW4pLnJlcGxhY2UoLyUyMC9nLCAnXycpLnJlcGxhY2UoLyUyRi9nLCAnLycpO1xuICB9XG5cbiAgYm90dG9tQ29sb3IoKTogQ29sb3Ige1xuICAgIHJldHVybiB0aGlzLmNoZXNzZ3JvdW5kID9cbiAgICB0aGlzLmNoZXNzZ3JvdW5kLnN0YXRlLm9yaWVudGF0aW9uIDpcbiAgICB0aGlzLm9wdGlvbnMub3JpZW50YXRpb24gfHwgJ3doaXRlJztcbiAgfVxuXG4gIHNldENhc3RsaW5nVG9nZ2xlKGlkOiBDYXN0bGluZ1RvZ2dsZSwgdmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jYXN0bGluZ1RvZ2dsZXNbaWRdICE9IHZhbHVlKSB0aGlzLnVubW92ZWRSb29rcyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmNhc3RsaW5nVG9nZ2xlc1tpZF0gPSB2YWx1ZTtcbiAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gIH1cblxuICBzZXRUdXJuKHR1cm46IENvbG9yKTogdm9pZCB7XG4gICAgdGhpcy50dXJuID0gdHVybjtcbiAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gIH1cblxuICBzdGFydFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0RmVuKElOSVRJQUxfRkVOKTtcbiAgfVxuXG4gIGNsZWFyQm9hcmQoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRGZW4oRU1QVFlfRkVOKTtcbiAgfVxuXG4gIGxvYWROZXdGZW4oZmVuOiBzdHJpbmcgfCAncHJvbXB0Jyk6IHZvaWQge1xuICAgIGlmIChmZW4gPT09ICdwcm9tcHQnKSB7XG4gICAgICBmZW4gPSAocHJvbXB0KCdQYXN0ZSBGRU4gcG9zaXRpb24nKSB8fCAnJykudHJpbSgpO1xuICAgICAgaWYgKCFmZW4pIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRGZW4oZmVuKTtcbiAgfVxuXG4gIHNldEZlbihmZW46IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBwYXJzZUZlbihmZW4pLnVud3JhcChzZXR1cCA9PiB7XG4gICAgICBpZiAodGhpcy5jaGVzc2dyb3VuZCkgdGhpcy5jaGVzc2dyb3VuZC5zZXQoe2Zlbn0pO1xuICAgICAgdGhpcy5wb2NrZXRzID0gc2V0dXAucG9ja2V0cztcbiAgICAgIHRoaXMudHVybiA9IHNldHVwLnR1cm47XG4gICAgICB0aGlzLnVubW92ZWRSb29rcyA9IHNldHVwLnVubW92ZWRSb29rcztcbiAgICAgIHRoaXMuZXBTcXVhcmUgPSBzZXR1cC5lcFNxdWFyZTtcbiAgICAgIHRoaXMucmVtYWluaW5nQ2hlY2tzID0gc2V0dXAucmVtYWluaW5nQ2hlY2tzO1xuICAgICAgdGhpcy5oYWxmbW92ZXMgPSBzZXR1cC5oYWxmbW92ZXM7XG4gICAgICB0aGlzLmZ1bGxtb3ZlcyA9IHNldHVwLmZ1bGxtb3ZlcztcblxuICAgICAgY29uc3QgY2FzdGxlcyA9IENhc3RsZXMuZnJvbVNldHVwKHNldHVwKTtcbiAgICAgIHRoaXMuY2FzdGxpbmdUb2dnbGVzWydLJ10gPSBkZWZpbmVkKGNhc3RsZXMucm9vay53aGl0ZS5oKTtcbiAgICAgIHRoaXMuY2FzdGxpbmdUb2dnbGVzWydRJ10gPSBkZWZpbmVkKGNhc3RsZXMucm9vay53aGl0ZS5hKTtcbiAgICAgIHRoaXMuY2FzdGxpbmdUb2dnbGVzWydrJ10gPSBkZWZpbmVkKGNhc3RsZXMucm9vay5ibGFjay5oKTtcbiAgICAgIHRoaXMuY2FzdGxpbmdUb2dnbGVzWydxJ10gPSBkZWZpbmVkKGNhc3RsZXMucm9vay5ibGFjay5hKTtcblxuICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXyA9PiBmYWxzZSk7XG4gIH1cblxuICBzZXRSdWxlcyhydWxlczogUnVsZXMpOiB2b2lkIHtcbiAgICB0aGlzLnJ1bGVzID0gcnVsZXM7XG4gICAgaWYgKHJ1bGVzICE9ICdjcmF6eWhvdXNlJykgdGhpcy5wb2NrZXRzID0gdW5kZWZpbmVkO1xuICAgIGVsc2UgaWYgKCF0aGlzLnBvY2tldHMpIHRoaXMucG9ja2V0cyA9IE1hdGVyaWFsLmVtcHR5KCk7XG4gICAgaWYgKHJ1bGVzICE9ICczY2hlY2snKSB0aGlzLnJlbWFpbmluZ0NoZWNrcyA9IHVuZGVmaW5lZDtcbiAgICBlbHNlIGlmICghdGhpcy5yZW1haW5pbmdDaGVja3MpIHRoaXMucmVtYWluaW5nQ2hlY2tzID0gUmVtYWluaW5nQ2hlY2tzLmRlZmF1bHQoKTtcbiAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gIH1cblxuICBzZXRPcmllbnRhdGlvbihvOiBDb2xvcik6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucy5vcmllbnRhdGlvbiA9IG87XG4gICAgaWYgKHRoaXMuY2hlc3Nncm91bmQhLnN0YXRlLm9yaWVudGF0aW9uICE9PSBvKSB0aGlzLmNoZXNzZ3JvdW5kIS50b2dnbGVPcmllbnRhdGlvbigpO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFJvbGUgfSBmcm9tICdjaGVzc2dyb3VuZC90eXBlcyc7XG5cbmV4cG9ydCB0eXBlIENhc3RsaW5nVG9nZ2xlID0gJ0snIHwgJ1EnIHwgJ2snIHwgJ3EnO1xuXG5leHBvcnQgY29uc3QgQ0FTVExJTkdfVE9HR0xFUzogQ2FzdGxpbmdUb2dnbGVbXSA9IFsnSycsICdRJywgJ2snLCAncSddO1xuXG5leHBvcnQgdHlwZSBDYXN0bGluZ1RvZ2dsZXM8VD4gPSB7XG4gIFtzaWRlIGluIENhc3RsaW5nVG9nZ2xlXTogVDtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BlbmluZ1Bvc2l0aW9uIHtcbiAgZWNvPzogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGZlbjogc3RyaW5nO1xuICBlcGQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWRpdG9yQ29uZmlnIHtcbiAgYmFzZVVybDogc3RyaW5nO1xuICBmZW46IHN0cmluZztcbiAgb3B0aW9ucz86IEVkaXRvck9wdGlvbnM7XG4gIGlzM2Q6IGJvb2xlYW47XG4gIGFuaW1hdGlvbjoge1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gIH07XG4gIGVtYmVkOiBib29sZWFuO1xuICBwb3NpdGlvbnM/OiBPcGVuaW5nUG9zaXRpb25bXTtcbiAgaTE4bjogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVkaXRvck9wdGlvbnMge1xuICBvcmllbnRhdGlvbj86IENvbG9yO1xuICBvbkNoYW5nZT86IChmZW46IHN0cmluZykgPT4gdm9pZDtcbiAgaW5saW5lQ2FzdGxpbmc/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVkaXRvclN0YXRlIHtcbiAgZmVuOiBzdHJpbmc7XG4gIGxlZ2FsRmVuOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIHBsYXlhYmxlOiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBSZWRyYXcgPSAoKSA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSBTZWxlY3RlZCA9ICdwb2ludGVyJyB8ICd0cmFzaCcgfCBbQ29sb3IsIFJvbGVdO1xuIiwiaW1wb3J0IHsgRWRpdG9yQ29uZmlnIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCBFZGl0b3JDdHJsIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgdmlldyBmcm9tICcuL3ZpZXcnO1xuXG5pbXBvcnQgeyBpbml0IH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5pbXBvcnQga2xhc3MgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9jbGFzcyc7XG5pbXBvcnQgYXR0cmlidXRlcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnO1xuaW1wb3J0IHByb3BzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvcHJvcHMnO1xuaW1wb3J0IGV2ZW50bGlzdGVuZXJzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMnO1xuXG5pbXBvcnQgeyBtZW51SG92ZXIgfSBmcm9tICdjb21tb24vbWVudUhvdmVyJztcbmltcG9ydCB7IENoZXNzZ3JvdW5kIH0gZnJvbSAnY2hlc3Nncm91bmQnO1xuXG5tZW51SG92ZXIoKTtcblxuY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlcywgcHJvcHMsIGV2ZW50bGlzdGVuZXJzXSk7XG5cbndpbmRvdy5MaWNoZXNzRWRpdG9yID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBjb25maWc6IEVkaXRvckNvbmZpZykgPT4ge1xuICBsZXQgdm5vZGU6IFZOb2RlLCBjdHJsOiBFZGl0b3JDdHJsO1xuXG4gIGNvbnN0IHJlZHJhdyA9ICgpID0+IHtcbiAgICB2bm9kZSA9IHBhdGNoKHZub2RlLCB2aWV3KGN0cmwpKTtcbiAgfTtcblxuICBjdHJsID0gbmV3IEVkaXRvckN0cmwoY29uZmlnLCByZWRyYXcpO1xuICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICBjb25zdCBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKGlubmVyKTtcbiAgdm5vZGUgPSBwYXRjaChpbm5lciwgdmlldyhjdHJsKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRGZW46IGN0cmwuZ2V0RmVuLmJpbmQoY3RybCksXG4gICAgc2V0T3JpZW50YXRpb246IGN0cmwuc2V0T3JpZW50YXRpb24uYmluZChjdHJsKVxuICB9O1xufTtcblxuLy8gdGhhdCdzIGZvciB0aGUgcmVzdCBvZiBsaWNoZXNzIHRvIGFjY2VzcyBjaGVzc2dyb3VuZFxuLy8gd2l0aG91dCBoYXZpbmcgdG8gaW5jbHVkZSBpdCBhIHNlY29uZCB0aW1lXG53aW5kb3cuQ2hlc3Nncm91bmQgPSBDaGVzc2dyb3VuZDtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSc7XG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJztcbmltcG9ydCB7IE1vdWNoRXZlbnQsIE51bWJlclBhaXIgfSBmcm9tICdjaGVzc2dyb3VuZC90eXBlcyc7XG5pbXBvcnQgeyBkcmFnTmV3UGllY2UgfSBmcm9tICdjaGVzc2dyb3VuZC9kcmFnJztcbmltcG9ydCB7IGV2ZW50UG9zaXRpb24sIG9wcG9zaXRlIH0gZnJvbSAnY2hlc3Nncm91bmQvdXRpbCc7XG5pbXBvcnQgeyBSdWxlcyB9IGZyb20gJ2NoZXNzb3BzL3R5cGVzJztcbmltcG9ydCB7IHBhcnNlRmVuLCBFTVBUWV9GRU4gfSBmcm9tICdjaGVzc29wcy9mZW4nO1xuaW1wb3J0IEVkaXRvckN0cmwgZnJvbSAnLi9jdHJsJztcbmltcG9ydCBjaGVzc2dyb3VuZCBmcm9tICcuL2NoZXNzZ3JvdW5kJztcbmltcG9ydCB7IE9wZW5pbmdQb3NpdGlvbiwgU2VsZWN0ZWQsIENhc3RsaW5nVG9nZ2xlLCBFZGl0b3JTdGF0ZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmZ1bmN0aW9uIGNhc3RsZUNoZWNrQm94KGN0cmw6IEVkaXRvckN0cmwsIGlkOiBDYXN0bGluZ1RvZ2dsZSwgbGFiZWw6IHN0cmluZywgcmV2ZXJzZWQ6IGJvb2xlYW4pOiBWTm9kZSB7XG4gIGNvbnN0IGlucHV0ID0gaCgnaW5wdXQnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICBjaGVja2VkOiBjdHJsLmNhc3RsaW5nVG9nZ2xlc1tpZF0sXG4gICAgfSxcbiAgICBvbjoge1xuICAgICAgY2hhbmdlKGUpIHtcbiAgICAgICAgY3RybC5zZXRDYXN0bGluZ1RvZ2dsZShpZCwgKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLmNoZWNrZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBoKCdsYWJlbCcsIHJldmVyc2VkID8gW2lucHV0LCBsYWJlbF0gOiBbbGFiZWwsIGlucHV0XSk7XG59XG5cbmZ1bmN0aW9uIG9wdGdyb3VwKG5hbWU6IHN0cmluZywgb3B0czogVk5vZGVbXSk6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ29wdGdyb3VwJywgeyBhdHRyczogeyBsYWJlbDogbmFtZSB9IH0sIG9wdHMpO1xufVxuXG5mdW5jdGlvbiBzdHVkeUJ1dHRvbihjdHJsOiBFZGl0b3JDdHJsLCBzdGF0ZTogRWRpdG9yU3RhdGUpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdmb3JtJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgIGFjdGlvbjogJy9zdHVkeS9hcydcbiAgICB9XG4gIH0sIFtcbiAgICBoKCdpbnB1dCcsIHsgYXR0cnM6IHsgdHlwZTogJ2hpZGRlbicsIG5hbWU6ICdvcmllbnRhdGlvbicsIHZhbHVlOiBjdHJsLmJvdHRvbUNvbG9yKCkgfSB9KSxcbiAgICBoKCdpbnB1dCcsIHsgYXR0cnM6IHsgdHlwZTogJ2hpZGRlbicsIG5hbWU6ICd2YXJpYW50JywgdmFsdWU6IGN0cmwucnVsZXMgfSB9KSxcbiAgICBoKCdpbnB1dCcsIHsgYXR0cnM6IHsgdHlwZTogJ2hpZGRlbicsIG5hbWU6ICdmZW4nLCB2YWx1ZTogc3RhdGUubGVnYWxGZW4gfHwgJycgfSB9KSxcbiAgICBoKCdidXR0b24nLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICB0eXBlOiAnc3VibWl0JyxcbiAgICAgICAgJ2RhdGEtaWNvbic6ICc0JyxcbiAgICAgICAgZGlzYWJsZWQ6ICFzdGF0ZS5sZWdhbEZlbixcbiAgICAgIH0sXG4gICAgICBjbGFzczoge1xuICAgICAgICBidXR0b246IHRydWUsXG4gICAgICAgICdidXR0b24tZW1wdHknOiB0cnVlLFxuICAgICAgICB0ZXh0OiB0cnVlLFxuICAgICAgICBkaXNhYmxlZDogIXN0YXRlLmxlZ2FsRmVuLFxuICAgICAgfVxuICAgIH0sIGN0cmwudHJhbnMubm9hcmcoJ3RvU3R1ZHknKSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIHZhcmlhbnQyb3B0aW9uKGtleTogUnVsZXMsIG5hbWU6IHN0cmluZywgY3RybDogRWRpdG9yQ3RybCk6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ29wdGlvbicsIHtcbiAgICBhdHRyczoge1xuICAgICAgdmFsdWU6IGtleSxcbiAgICAgIHNlbGVjdGVkOiBrZXkgPT0gY3RybC5ydWxlc1xuICAgIH0sXG4gIH0sIGAke2N0cmwudHJhbnMubm9hcmcoJ3ZhcmlhbnQnKX0gfCAke25hbWV9YCk7XG59XG5cbmNvbnN0IGFsbFZhcmlhbnRzOiBBcnJheTxbUnVsZXMsIHN0cmluZ10+ID0gW1xuICBbJ2NoZXNzJywgJ1N0YW5kYXJkJ10sXG4gIFsnYW50aWNoZXNzJywgJ0FudGljaGVzcyddLFxuICBbJ2F0b21pYycsICdBdG9taWMnXSxcbiAgWydjcmF6eWhvdXNlJywgJ0NyYXp5aG91c2UnXSxcbiAgWydob3JkZScsICdIb3JkZSddLFxuICBbJ2tpbmdvZnRoZWhpbGwnLCAnS2luZyBvZiB0aGUgSGlsbCddLFxuICBbJ3JhY2luZ2tpbmdzJywgJ1JhY2luZyBLaW5ncyddLFxuICBbJzNjaGVjaycsICdUaHJlZS1jaGVjayddLFxuXTtcblxuZnVuY3Rpb24gY29udHJvbHMoY3RybDogRWRpdG9yQ3RybCwgc3RhdGU6IEVkaXRvclN0YXRlKTogVk5vZGUge1xuICBjb25zdCBwb3NpdGlvbjJvcHRpb24gPSBmdW5jdGlvbihwb3M6IE9wZW5pbmdQb3NpdGlvbik6IFZOb2RlIHtcbiAgICByZXR1cm4gaCgnb3B0aW9uJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgdmFsdWU6IHBvcy5lcGQgfHwgcG9zLmZlbixcbiAgICAgICAgJ2RhdGEtZmVuJzogcG9zLmZlbixcbiAgICAgIH1cbiAgICB9LCBwb3MuZWNvID8gYCR7cG9zLmVjb30gJHtwb3MubmFtZX1gIDogcG9zLm5hbWUpO1xuICB9O1xuICByZXR1cm4gaCgnZGl2LmJvYXJkLWVkaXRvcl9fdG9vbHMnLCBbXG4gICAgLi4uKGN0cmwuY2ZnLmVtYmVkIHx8ICFjdHJsLmNmZy5wb3NpdGlvbnMgPyBbXSA6IFtoKCdkaXYnLCBbXG4gICAgICBoKCdzZWxlY3QucG9zaXRpb25zJywge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIHZhbHVlOiBzdGF0ZS5mZW4uc3BsaXQoJyAnKS5zbGljZSgwLCA0KS5qb2luKCcgJylcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjaGFuZ2UoZSkge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBlLnRhcmdldCBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IGVsLnNlbGVjdGVkT3B0aW9uc1swXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmVuJyk7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT0gJ3Byb21wdCcpIHZhbHVlID0gKHByb21wdCgnUGFzdGUgRkVOJykgfHwgJycpLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgIWN0cmwuc2V0RmVuKHZhbHVlKSkgZWwudmFsdWUgPSAnJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIFtcbiAgICAgICAgb3B0Z3JvdXAoY3RybC50cmFucy5ub2FyZygnc2V0VGhlQm9hcmQnKSwgW1xuICAgICAgICAgIGgoJ29wdGlvbicsIHtcbiAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgIHNlbGVjdGVkOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgYC0gJHtjdHJsLnRyYW5zLm5vYXJnKCdib2FyZEVkaXRvcicpfSAgLWApLFxuICAgICAgICAgIC4uLmN0cmwuZXh0cmFQb3NpdGlvbnMubWFwKHBvc2l0aW9uMm9wdGlvbilcbiAgICAgICAgXSksXG4gICAgICAgIG9wdGdyb3VwKGN0cmwudHJhbnMubm9hcmcoJ3BvcHVsYXJPcGVuaW5ncycpLCBjdHJsLmNmZy5wb3NpdGlvbnMubWFwKHBvc2l0aW9uMm9wdGlvbikpXG4gICAgICBdKVxuICAgIF0pXSksXG4gICAgaCgnZGl2Lm1ldGFkYXRhJywgW1xuICAgICAgaCgnZGl2LmNvbG9yJyxcbiAgICAgICAgaCgnc2VsZWN0Jywge1xuICAgICAgICAgIG9uOiB7XG4gICAgICAgICAgICBjaGFuZ2UoZSkge1xuICAgICAgICAgICAgICBjdHJsLnNldFR1cm4oKGUudGFyZ2V0IGFzIEhUTUxTZWxlY3RFbGVtZW50KS52YWx1ZSBhcyBDb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LCBbJ3doaXRlUGxheXMnLCAnYmxhY2tQbGF5cyddLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICByZXR1cm4gaCgnb3B0aW9uJywge1xuICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgdmFsdWU6IGtleVswXSA9PSAndycgPyAnd2hpdGUnIDogJ2JsYWNrJyxcbiAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGN0cmwudHVyblswXSA9PT0ga2V5WzBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgY3RybC50cmFucyhrZXkpKTtcbiAgICAgICAgfSkpXG4gICAgICApLFxuICAgICAgaCgnZGl2LmNhc3RsaW5nJywgW1xuICAgICAgICBoKCdzdHJvbmcnLCBjdHJsLnRyYW5zLm5vYXJnKCdjYXN0bGluZycpKSxcbiAgICAgICAgaCgnZGl2JywgW1xuICAgICAgICAgIGNhc3RsZUNoZWNrQm94KGN0cmwsICdLJywgY3RybC50cmFucy5ub2FyZygnd2hpdGVDYXN0bGluZ0tpbmdzaWRlJyksICEhY3RybC5vcHRpb25zLmlubGluZUNhc3RsaW5nKSxcbiAgICAgICAgICBjYXN0bGVDaGVja0JveChjdHJsLCAnUScsICdPLU8tTycsIHRydWUpXG4gICAgICAgIF0pLFxuICAgICAgICBoKCdkaXYnLCBbXG4gICAgICAgICAgY2FzdGxlQ2hlY2tCb3goY3RybCwgJ2snLCBjdHJsLnRyYW5zLm5vYXJnKCdibGFja0Nhc3RsaW5nS2luZ3NpZGUnKSwgISFjdHJsLm9wdGlvbnMuaW5saW5lQ2FzdGxpbmcpLFxuICAgICAgICAgIGNhc3RsZUNoZWNrQm94KGN0cmwsICdxJywgJ08tTy1PJywgdHJ1ZSlcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgXSksXG4gICAgLi4uKGN0cmwuY2ZnLmVtYmVkID8gW2goJ2Rpdi5hY3Rpb25zJywgW1xuICAgICAgaCgnYS5idXR0b24uYnV0dG9uLWVtcHR5Jywge1xuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrKCkge1xuICAgICAgICAgICAgY3RybC5zdGFydFBvc2l0aW9uKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBjdHJsLnRyYW5zLm5vYXJnKCdzdGFydFBvc2l0aW9uJykpLFxuICAgICAgaCgnYS5idXR0b24uYnV0dG9uLWVtcHR5Jywge1xuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrKCkge1xuICAgICAgICAgICAgY3RybC5jbGVhckJvYXJkKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBjdHJsLnRyYW5zLm5vYXJnKCdjbGVhckJvYXJkJykpXG4gICAgXSldIDogW1xuICAgICAgaCgnZGl2JywgW1xuICAgICAgICBoKCdzZWxlY3QnLCB7XG4gICAgICAgICAgYXR0cnM6IHsgaWQ6ICd2YXJpYW50cycgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgY2hhbmdlKGUpIHtcbiAgICAgICAgICAgICAgY3RybC5zZXRSdWxlcygoZS50YXJnZXQgYXMgSFRNTFNlbGVjdEVsZW1lbnQpLnZhbHVlIGFzIFJ1bGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sIGFsbFZhcmlhbnRzLm1hcCh4ID0+IHZhcmlhbnQyb3B0aW9uKHhbMF0sIHhbMV0sIGN0cmwpKSlcbiAgICAgIF0pLFxuICAgICAgaCgnZGl2LmFjdGlvbnMnLCBbXG4gICAgICAgIGgoJ2EuYnV0dG9uLmJ1dHRvbi1lbXB0eS50ZXh0Jywge1xuICAgICAgICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiAncScgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgY2xpY2soKSB7XG4gICAgICAgICAgICAgIGN0cmwuc2V0RmVuKEVNUFRZX0ZFTik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LCBjdHJsLnRyYW5zLm5vYXJnKCdjbGVhckJvYXJkJykpLFxuICAgICAgICBoKCdhLmJ1dHRvbi5idXR0b24tZW1wdHkudGV4dCcsIHtcbiAgICAgICAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ0InIH0sXG4gICAgICAgICAgb246IHtcbiAgICAgICAgICAgIGNsaWNrKCkge1xuICAgICAgICAgICAgICBjdHJsLmNoZXNzZ3JvdW5kIS50b2dnbGVPcmllbnRhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgY3RybC50cmFucy5ub2FyZygnZmxpcEJvYXJkJykpLFxuICAgICAgICBoKCdhJywge1xuICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAnZGF0YS1pY29uJzogJ0EnLFxuICAgICAgICAgICAgcmVsOiAnbm9mb2xsb3cnLFxuICAgICAgICAgICAgLi4uKHN0YXRlLmxlZ2FsRmVuID8geyBocmVmOiBjdHJsLm1ha2VBbmFseXNpc1VybChzdGF0ZS5sZWdhbEZlbikgfSA6IHt9KVxuICAgICAgICAgIH0sXG4gICAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAgIGJ1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgICdidXR0b24tZW1wdHknOiB0cnVlLFxuICAgICAgICAgICAgdGV4dDogdHJ1ZSxcbiAgICAgICAgICAgIGRpc2FibGVkOiAhc3RhdGUubGVnYWxGZW5cbiAgICAgICAgICB9XG4gICAgICAgIH0sIGN0cmwudHJhbnMubm9hcmcoJ2FuYWx5c2lzJykpLFxuICAgICAgICBoKCdhJywge1xuICAgICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgICBidXR0b246IHRydWUsXG4gICAgICAgICAgICAnYnV0dG9uLWVtcHR5JzogdHJ1ZSxcbiAgICAgICAgICAgIGRpc2FibGVkOiAhc3RhdGUucGxheWFibGUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHN0YXRlLnBsYXlhYmxlKSAkLm1vZGFsKCQoJy5jb250aW51ZS13aXRoJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgW2goJ3NwYW4udGV4dCcsIHsgYXR0cnM6IHsgJ2RhdGEtaWNvbicgOiAnVScgfSB9LCBjdHJsLnRyYW5zLm5vYXJnKCdjb250aW51ZUZyb21IZXJlJykpXSksXG4gICAgICAgIHN0dWR5QnV0dG9uKGN0cmwsIHN0YXRlKVxuICAgICAgXSksXG4gICAgICBoKCdkaXYuY29udGludWUtd2l0aC5ub25lJywgW1xuICAgICAgICBoKCdhLmJ1dHRvbicsIHtcbiAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgaHJlZjogJy8/ZmVuPScgKyBzdGF0ZS5sZWdhbEZlbiArICcjYWknLFxuICAgICAgICAgICAgcmVsOiAnbm9mb2xsb3cnXG4gICAgICAgICAgfVxuICAgICAgICB9LCBjdHJsLnRyYW5zLm5vYXJnKCdwbGF5V2l0aFRoZU1hY2hpbmUnKSksXG4gICAgICAgIGgoJ2EuYnV0dG9uJywge1xuICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICBocmVmOiAnLz9mZW49JyArIHN0YXRlLmxlZ2FsRmVuICsgJyNmcmllbmQnLFxuICAgICAgICAgICAgcmVsOiAnbm9mb2xsb3cnXG4gICAgICAgICAgfVxuICAgICAgICB9LCBjdHJsLnRyYW5zLm5vYXJnKCdwbGF5V2l0aEFGcmllbmQnKSlcbiAgICAgIF0pXG4gICAgXSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIGlucHV0cyhjdHJsOiBFZGl0b3JDdHJsLCBmZW46IHN0cmluZyk6IFZOb2RlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGN0cmwuY2ZnLmVtYmVkKSByZXR1cm47XG4gIHJldHVybiBoKCdkaXYuY29weWFibGVzJywgW1xuICAgIGgoJ3AnLCBbXG4gICAgICBoKCdzdHJvbmcnLCAnRkVOJyksXG4gICAgICBoKCdpbnB1dC5jb3B5YWJsZScsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBzcGVsbGNoZWNrOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICB2YWx1ZTogZmVuLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNoYW5nZShlKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgICAgICBjdHJsLnNldEZlbihlbC52YWx1ZS50cmltKCkpO1xuICAgICAgICAgICAgZWwucmVwb3J0VmFsaWRpdHkoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGlucHV0KGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkID0gcGFyc2VGZW4oZWwudmFsdWUudHJpbSgpKS5pc09rO1xuICAgICAgICAgICAgZWwuc2V0Q3VzdG9tVmFsaWRpdHkodmFsaWQgPyAnJyA6ICdJbnZhbGlkIEZFTicpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYmx1cihlKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgICAgICBlbC52YWx1ZSA9IGN0cmwuZ2V0RmVuKCk7XG4gICAgICAgICAgICBlbC5zZXRDdXN0b21WYWxpZGl0eSgnJyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICBdKSxcbiAgICBoKCdwJywgW1xuICAgICAgaCgnc3Ryb25nLm5hbWUnLCAnVVJMJyksXG4gICAgICBoKCdpbnB1dC5jb3B5YWJsZS5hdXRvc2VsZWN0Jywge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIHJlYWRvbmx5OiB0cnVlLFxuICAgICAgICAgIHNwZWxsY2hlY2s6IGZhbHNlLFxuICAgICAgICAgIHZhbHVlOiBjdHJsLm1ha2VVcmwoY3RybC5jZmcuYmFzZVVybCwgZmVuKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIF0pXG4gIF0pO1xufVxuXG4vLyBjYW4gYmUgJ3BvaW50ZXInLCAndHJhc2gnLCBvciBbY29sb3IsIHJvbGVdXG5mdW5jdGlvbiBzZWxlY3RlZFRvQ2xhc3MoczogU2VsZWN0ZWQpOiBzdHJpbmcge1xuICByZXR1cm4gKHMgPT09ICdwb2ludGVyJyB8fCBzID09PSAndHJhc2gnKSA/IHMgOiBzLmpvaW4oJyAnKTtcbn1cblxubGV0IGxhc3RUb3VjaE1vdmVQb3M6IE51bWJlclBhaXIgfCB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHNwYXJlUGllY2VzKGN0cmw6IEVkaXRvckN0cmwsIGNvbG9yOiBDb2xvciwgX29yaWVudGF0aW9uOiBDb2xvciwgcG9zaXRpb246ICd0b3AnIHwgJ2JvdHRvbScpOiBWTm9kZSB7XG4gIGNvbnN0IHNlbGVjdGVkQ2xhc3MgPSBzZWxlY3RlZFRvQ2xhc3MoY3RybC5zZWxlY3RlZCgpKTtcblxuICBjb25zdCBwaWVjZXMgPSBbJ2tpbmcnLCAncXVlZW4nLCAncm9vaycsICdiaXNob3AnLCAna25pZ2h0JywgJ3Bhd24nXS5tYXAoZnVuY3Rpb24ocm9sZSkge1xuICAgIHJldHVybiBbY29sb3IsIHJvbGVdO1xuICB9KTtcblxuICByZXR1cm4gaCgnZGl2Jywge1xuICAgIGF0dHJzOiB7XG4gICAgICBjbGFzczogWydzcGFyZScsICdzcGFyZS0nICsgcG9zaXRpb24sICdzcGFyZS0nICsgY29sb3JdLmpvaW4oJyAnKVxuICAgIH1cbiAgfSwgWydwb2ludGVyJywgLi4ucGllY2VzLCAndHJhc2gnXS5tYXAoKHM6IFNlbGVjdGVkKSA9PiB7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gc2VsZWN0ZWRUb0NsYXNzKHMpO1xuICAgIGNvbnN0IGF0dHJzID0ge1xuICAgICAgY2xhc3M6IGNsYXNzTmFtZSxcbiAgICAgIC4uLigocyAhPT0gJ3BvaW50ZXInICYmIHMgIT09ICd0cmFzaCcpID8ge1xuICAgICAgICAnZGF0YS1jb2xvcic6IHNbMF0sXG4gICAgICAgICdkYXRhLXJvbGUnOiBzWzFdXG4gICAgICB9IDoge30pXG4gICAgfTtcbiAgICBjb25zdCBzZWxlY3RlZFNxdWFyZSA9IHNlbGVjdGVkQ2xhc3MgPT09IGNsYXNzTmFtZSAmJiAoXG4gICAgICAhY3RybC5jaGVzc2dyb3VuZCB8fFxuICAgICAgIWN0cmwuY2hlc3Nncm91bmQuc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgfHxcbiAgICAgICFjdHJsLmNoZXNzZ3JvdW5kLnN0YXRlLmRyYWdnYWJsZS5jdXJyZW50Lm5ld1BpZWNlKTtcbiAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgY2xhc3M6IHtcbiAgICAgICAgJ25vLXNxdWFyZSc6IHRydWUsXG4gICAgICAgIHBvaW50ZXI6IHMgPT09ICdwb2ludGVyJyxcbiAgICAgICAgdHJhc2g6IHMgPT09ICd0cmFzaCcsXG4gICAgICAgICdzZWxlY3RlZC1zcXVhcmUnOiBzZWxlY3RlZFNxdWFyZVxuICAgICAgfSxcbiAgICAgIG9uOiB7XG4gICAgICAgIG1vdXNlZG93bjogb25TZWxlY3RTcGFyZVBpZWNlKGN0cmwsIHMsICdtb3VzZXVwJyksXG4gICAgICAgIHRvdWNoc3RhcnQ6IG9uU2VsZWN0U3BhcmVQaWVjZShjdHJsLCBzLCAndG91Y2hlbmQnKSxcbiAgICAgICAgdG91Y2htb3ZlOiAoZSkgPT4ge1xuICAgICAgICAgIGxhc3RUb3VjaE1vdmVQb3MgPSBldmVudFBvc2l0aW9uKGUgYXMgYW55KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIFtoKCdkaXYnLCBbaCgncGllY2UnLCB7IGF0dHJzIH0pXSldKTtcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBvblNlbGVjdFNwYXJlUGllY2UoY3RybDogRWRpdG9yQ3RybCwgczogU2VsZWN0ZWQsIHVwRXZlbnQ6IHN0cmluZyk6IChlOiBNb3VjaEV2ZW50KSA9PiB2b2lkIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGU6IE1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHMgPT09ICdwb2ludGVyJyB8fCBzID09PSAndHJhc2gnKSB7XG4gICAgICBjdHJsLnNlbGVjdGVkKHMpO1xuICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3RybC5zZWxlY3RlZCgncG9pbnRlcicpO1xuXG4gICAgICBkcmFnTmV3UGllY2UoY3RybC5jaGVzc2dyb3VuZCEuc3RhdGUsIHtcbiAgICAgICAgY29sb3I6IHNbMF0sXG4gICAgICAgIHJvbGU6IHNbMV1cbiAgICAgIH0sIGUsIHRydWUpO1xuXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKHVwRXZlbnQsIChlOiBNb3VjaEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGV2ZW50UG9zID0gZXZlbnRQb3NpdGlvbihlKSB8fCBsYXN0VG91Y2hNb3ZlUG9zO1xuICAgICAgICBpZiAoZXZlbnRQb3MgJiYgY3RybC5jaGVzc2dyb3VuZCEuZ2V0S2V5QXREb21Qb3MoZXZlbnRQb3MpKSBjdHJsLnNlbGVjdGVkKCdwb2ludGVyJyk7XG4gICAgICAgIGVsc2UgY3RybC5zZWxlY3RlZChzKTtcbiAgICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIG1ha2VDdXJzb3Ioc2VsZWN0ZWQ6IFNlbGVjdGVkKTogc3RyaW5nIHtcbiAgaWYgKHNlbGVjdGVkID09PSAncG9pbnRlcicpIHJldHVybiAncG9pbnRlcic7XG5cbiAgY29uc3QgbmFtZSA9IHNlbGVjdGVkID09PSAndHJhc2gnID8gJ3RyYXNoJyA6IHNlbGVjdGVkLmpvaW4oJy0nKTtcbiAgY29uc3QgdXJsID0gd2luZG93LmxpY2hlc3MuYXNzZXRVcmwoJ2N1cnNvcnMvJyArIG5hbWUgKyAnLmN1cicpO1xuXG4gIHJldHVybiBgdXJsKCcke3VybH0nKSwgZGVmYXVsdCAhaW1wb3J0YW50YDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY3RybDogRWRpdG9yQ3RybCk6IFZOb2RlIHtcbiAgY29uc3Qgc3RhdGUgPSBjdHJsLmdldFN0YXRlKCk7XG4gIGNvbnN0IGNvbG9yID0gY3RybC5ib3R0b21Db2xvcigpO1xuXG4gIHJldHVybiBoKCdkaXYuYm9hcmQtZWRpdG9yJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBzdHlsZTogYGN1cnNvcjogJHttYWtlQ3Vyc29yKGN0cmwuc2VsZWN0ZWQoKSl9YFxuICAgIH1cbiAgfSwgW1xuICAgIHNwYXJlUGllY2VzKGN0cmwsIG9wcG9zaXRlKGNvbG9yKSwgY29sb3IsICd0b3AnKSxcbiAgICBoKCdkaXYubWFpbi1ib2FyZCcsIFtjaGVzc2dyb3VuZChjdHJsKV0pLFxuICAgIHNwYXJlUGllY2VzKGN0cmwsIGNvbG9yLCBjb2xvciwgJ2JvdHRvbScpLFxuICAgIGNvbnRyb2xzKGN0cmwsIHN0YXRlKSxcbiAgICBpbnB1dHMoY3RybCwgc3RhdGUuZmVuKVxuICBdKTtcbn1cbiJdfQ==
