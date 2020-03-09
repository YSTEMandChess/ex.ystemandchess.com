(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessLobby = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./util":17}],2:[function(require,module,exports){
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

},{"./anim":1,"./board":3,"./config":5,"./drag":6,"./explosion":10,"./fen":11}],3:[function(require,module,exports){
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

},{"./premove":12,"./util":17}],4:[function(require,module,exports){
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

},{"./api":2,"./config":5,"./events":9,"./render":13,"./state":14,"./svg":15,"./util":17,"./wrap":18}],5:[function(require,module,exports){
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

},{"./board":3,"./fen":11}],6:[function(require,module,exports){
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

},{"./anim":1,"./board":3,"./draw":7,"./util":17}],7:[function(require,module,exports){
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

},{"./board":3,"./util":17}],8:[function(require,module,exports){
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

},{"./board":3,"./drag":6,"./util":17}],9:[function(require,module,exports){
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

},{"./drag":6,"./draw":7,"./drop":8,"./util":17}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./types":16,"./util":17}],12:[function(require,module,exports){
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

},{"./util":17}],13:[function(require,module,exports){
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

},{"./board":3,"./util":17}],14:[function(require,module,exports){
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

},{"./fen":11,"./util":17}],15:[function(require,module,exports){
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

},{"./util":17}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
exports.ranks = [1, 2, 3, 4, 5, 6, 7, 8];

},{}],17:[function(require,module,exports){
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

},{"./types":16}],18:[function(require,module,exports){
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

},{"./svg":15,"./types":16,"./util":17}],19:[function(require,module,exports){
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

},{"./is":21,"./vnode":26}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
exports.primitive = primitive;

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{"./h":19,"./htmldomapi":20,"./is":21,"./thunk":25,"./vnode":26}],25:[function(require,module,exports){
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

},{"./h":19}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
}
exports.vnode = vnode;
exports.default = vnode;

},{}],27:[function(require,module,exports){
"use strict";
module.exports = function (cfg, element) {
    var pools = [{ id: "1+0", lim: 1, inc: 0, perf: "Bullet" }, { id: "2+1", lim: 2, inc: 1, perf: "Bullet" }, { id: "3+0", lim: 3, inc: 0, perf: "Blitz" }, { "id": "3+2", "lim": 3, "inc": 2, "perf": "Blitz" }, { id: "5+0", lim: 5, inc: 0, perf: "Blitz" }, { "id": "5+3", "lim": 5, "inc": 3, "perf": "Blitz" }, { id: "10+0", lim: 10, inc: 0, perf: "Rapid" }, { id: "15+15", lim: 15, inc: 15, perf: "Classical" }];
    var lobby;
    var nbRoundSpread = spreadNumber(document.querySelector('#nb_games_in_play > strong'), 8, function () {
        return lichess.socket.pingInterval();
    });
    var nbUserSpread = spreadNumber(document.querySelector('#nb_connected_players > strong'), 10, function () {
        return lichess.socket.pingInterval();
    });
    var getParameterByName = function (name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    };
    var onFirstConnect = function () {
        var gameId = getParameterByName('hook_like');
        if (!gameId)
            return;
        $.post('/setup/hook/' + lichess.sri + '/like/' + gameId);
        lobby.setTab('real_time');
        history.replaceState(null, null, '/');
    };
    var filterStreams = function () {
        var langs = navigator.languages;
        if (!langs)
            return; // tss... https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/languages
        langs = langs.map(function (l) {
            return l.slice(0, 2).toLowerCase();
        });
        langs.push($('html').attr('lang'));
        $('.lobby__streams a, .event-spotlight').each(function () {
            var match = $(this).text().match(/\[(\w{2})\]/mi);
            if (match && !langs.includes(match[1].toLowerCase()))
                $(this).hide();
        });
    };
    filterStreams();
    lichess.socket = lichess.StrongSocket('/lobby/socket/v4', false, {
        receive: function (t, d) {
            lobby.socketReceive(t, d);
        },
        events: {
            n: function (nbUsers, msg) {
                nbUserSpread(msg.d);
                setTimeout(function () {
                    nbRoundSpread(msg.r);
                }, lichess.socket.pingInterval() / 2);
            },
            reload_timeline: function () {
                $.ajax({
                    url: '/timeline',
                    success: function (html) {
                        $('.timeline').html(html);
                        lichess.pubsub.emit('content_loaded');
                    }
                });
            },
            streams: function (html) {
                $('.lobby__streams').html(html);
                filterStreams();
            },
            featured: function (o) {
                $('.lobby__tv').html(o.html);
                lichess.pubsub.emit('content_loaded');
            },
            redirect: function (e) {
                lobby.leavePool();
                lobby.setRedirecting();
                window.lichess.redirect(e);
            },
            tournaments: function (data) {
                $("#enterable_tournaments").html(data);
                lichess.pubsub.emit('content_loaded');
            },
            simuls: function (data) {
                $("#enterable_simuls").html(data).parent().toggle($('#enterable_simuls tr').length > 0);
                lichess.pubsub.emit('content_loaded');
            },
            fen: function (e) {
                lichess.StrongSocket.defaults.events.fen(e);
                lobby.gameActivity(e.id);
            }
        },
        options: {
            name: 'lobby',
            onFirstConnect: onFirstConnect
        }
    });
    cfg.trans = lichess.trans(cfg.i18n);
    cfg.socketSend = lichess.socket.send;
    cfg.element = element;
    cfg.pools = pools;
    lobby = LichessLobby.start(cfg);
    var blindMode = $('body').hasClass('blind-mode');
    var $startButtons = $('.lobby__start');
    var sliderTimes = [
        0, 1 / 4, 1 / 2, 3 / 4, 1, 3 / 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 25, 30, 35, 40, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180
    ];
    function sliderTime(v) {
        return v < sliderTimes.length ? sliderTimes[v] : 180;
    }
    function showTime(v) {
        if (v === 1 / 4)
            return '¼';
        if (v === 1 / 2)
            return '½';
        if (v === 3 / 4)
            return '¾';
        return v;
    }
    function sliderIncrement(v) {
        if (v <= 20)
            return v;
        switch (v) {
            case 21:
                return 25;
            case 22:
                return 30;
            case 23:
                return 35;
            case 24:
                return 40;
            case 25:
                return 45;
            case 26:
                return 60;
            case 27:
                return 90;
            case 28:
                return 120;
            case 29:
                return 150;
            default:
                return 180;
        }
    }
    function sliderDays(v) {
        if (v <= 3)
            return v;
        switch (v) {
            case 4:
                return 5;
            case 5:
                return 7;
            case 6:
                return 10;
            default:
                return 14;
        }
    }
    function sliderInitVal(v, f, max) {
        for (var i = 0; i < max; i++) {
            if (f(i) === v)
                return i;
        }
    }
    function hookToPoolMember(color, data) {
        var hash = {};
        for (var i in data)
            hash[data[i].name] = data[i].value;
        var valid = color == 'random' && hash.variant == 1 && hash.mode == 1 && hash.timeMode == 1;
        var id = parseFloat(hash.time) + '+' + parseInt(hash.increment);
        var exists = pools.find(function (p) { return p.id === id; });
        if (valid && exists)
            return {
                id: id,
                range: hash.ratingRange
            };
    }
    function prepareForm($modal) {
        var $form = $modal.find('form');
        var $timeModeSelect = $form.find('#sf_timeMode');
        var $modeChoicesWrap = $form.find('.mode_choice');
        var $modeChoices = $modeChoicesWrap.find('input');
        var $casual = $modeChoices.eq(0), $rated = $modeChoices.eq(1);
        var $variantSelect = $form.find('#sf_variant');
        var $fenPosition = $form.find(".fen_position");
        var $timeInput = $form.find('.time_choice [name=time]');
        var $incrementInput = $form.find('.increment_choice [name=increment]');
        var $daysInput = $form.find('.days_choice [name=days]');
        var typ = $form.data('type');
        var $ratings = $modal.find('.ratings > div');
        var randomColorVariants = $form.data('random-color-variants').split(',');
        var $submits = $form.find('.color-submits__button');
        var toggleButtons = function () {
            var variantId = $variantSelect.val();
            var timeMode = $timeModeSelect.val();
            var rated = $rated.prop('checked');
            var limit = $timeInput.val();
            var inc = $incrementInput.val();
            // no rated variants with less than 30s on the clock
            var cantBeRated = (timeMode == '1' && variantId != '1' && limit < 0.5 && inc == 0) ||
                (variantId != '1' && timeMode != '1');
            if (cantBeRated && rated) {
                $casual.click();
                return toggleButtons();
            }
            $rated.attr('disabled', cantBeRated).siblings('label').toggleClass('disabled', cantBeRated);
            var timeOk = timeMode != '1' || limit > 0 || inc > 0;
            var ratedOk = typ != 'hook' || !rated || timeMode != '0';
            var aiOk = typ != 'ai' || variantId != '3' || limit >= 1;
            if (timeOk && ratedOk && aiOk) {
                $submits.toggleClass('nope', false);
                $submits.filter(':not(.random)').toggle(!rated || !randomColorVariants.includes(variantId));
            }
            else
                $submits.toggleClass('nope', true);
        };
        var showRating = function () {
            var timeMode = $timeModeSelect.val();
            var key;
            switch ($variantSelect.val()) {
                case '1':
                case '3':
                    if (timeMode == '1') {
                        var time = $timeInput.val() * 60 + $incrementInput.val() * 40;
                        if (time < 30)
                            key = 'ultraBullet';
                        else if (time < 180)
                            key = 'bullet';
                        else if (time < 480)
                            key = 'blitz';
                        else if (time < 1500)
                            key = 'rapid';
                        else
                            key = 'classical';
                    }
                    else
                        key = 'correspondence';
                    break;
                case '10':
                    key = 'crazyhouse';
                    break;
                case '2':
                    key = 'chess960';
                    break;
                case '4':
                    key = 'kingOfTheHill';
                    break;
                case '5':
                    key = 'threeCheck';
                    break;
                case '6':
                    key = 'antichess';
                    break;
                case '7':
                    key = 'atomic';
                    break;
                case '8':
                    key = "horde";
                    break;
                case '9':
                    key = "racingKings";
                    break;
            }
            $ratings.hide().filter('.' + key).show();
        };
        if (typ == 'hook') {
            if ($form.data('anon')) {
                $timeModeSelect.val(1)
                    .children('.timeMode_2, .timeMode_0')
                    .prop('disabled', true)
                    .attr('title', cfg.trans('youNeedAnAccountToDoThat'));
            }
            var ajaxSubmit = function (color) {
                var poolMember = hookToPoolMember(color, $form.serializeArray());
                $.modal.close();
                var call = {
                    url: $form.attr('action').replace(/sri-placeholder/, lichess.sri),
                    data: $form.serialize() + "&color=" + color,
                    type: 'post'
                };
                if (poolMember) {
                    lobby.enterPool(poolMember);
                    lobby.redraw();
                    call.url += '?pool=1';
                }
                else
                    lobby.setTab($timeModeSelect.val() === '1' ? 'real_time' : 'seeks');
                $.ajax(call);
                return false;
            };
            $submits.click(function () {
                return ajaxSubmit($(this).val());
            }).attr('disabled', false);
            $form.submit(function () {
                return ajaxSubmit('random');
            });
        }
        else
            $form.one('submit', function () {
                $submits.hide().end().append(lichess.spinnerHtml);
            });
        if (blindMode) {
            $variantSelect.focus();
            $timeInput.add($incrementInput).on('change', function () {
                toggleButtons();
                showRating();
            });
        }
        else
            lichess.slider().done(function () {
                $timeInput.add($incrementInput).each(function () {
                    var $input = $(this), $value = $input.siblings('span');
                    var isTimeSlider = $input.parent().hasClass('time_choice');
                    $input.after($('<div>').slider({
                        value: sliderInitVal(parseFloat($input.val()), isTimeSlider ? sliderTime : sliderIncrement, 100),
                        min: 0,
                        max: isTimeSlider ? 38 : 30,
                        range: 'min',
                        step: 1,
                        slide: function (event, ui) {
                            var time = (isTimeSlider ? sliderTime : sliderIncrement)(ui.value);
                            $value.text(isTimeSlider ? showTime(time) : time);
                            $input.attr('value', time);
                            showRating();
                            toggleButtons();
                        }
                    }));
                });
                $daysInput.each(function () {
                    var $input = $(this), $value = $input.siblings('span');
                    $input.after($('<div>').slider({
                        value: sliderInitVal(parseInt($input.val()), sliderDays, 20),
                        min: 1,
                        max: 7,
                        range: 'min',
                        step: 1,
                        slide: function (event, ui) {
                            var days = sliderDays(ui.value);
                            $value.text(days);
                            $input.attr('value', days);
                        }
                    }));
                });
                $form.find('.rating-range').each(function () {
                    var $this = $(this);
                    var $input = $this.find("input");
                    var $span = $this.siblings("span.range");
                    var min = $input.data("min");
                    var max = $input.data("max");
                    var values = $input.val() ? $input.val().split("-") : [min, max];
                    $span.text(values.join('–'));
                    $this.slider({
                        range: true,
                        min: min,
                        max: max,
                        values: values,
                        step: 50,
                        slide: function (event, ui) {
                            $input.val(ui.values[0] + "-" + ui.values[1]);
                            $span.text(ui.values[0] + "–" + ui.values[1]);
                        }
                    });
                });
            });
        $timeModeSelect.on('change', function () {
            var timeMode = $(this).val();
            $form.find('.time_choice, .increment_choice').toggle(timeMode == '1');
            $form.find('.days_choice').toggle(timeMode == '2');
            toggleButtons();
            showRating();
        }).trigger('change');
        var $fenInput = $fenPosition.find('input');
        var validateFen = lichess.debounce(function () {
            $fenInput.removeClass("success failure");
            var fen = $fenInput.val();
            if (fen) {
                $.ajax({
                    url: $fenInput.parent().data('validate-url'),
                    data: {
                        fen: fen
                    },
                    success: function (data) {
                        $fenInput.addClass("success");
                        $fenPosition.find('.preview').html(data);
                        $fenPosition.find('a.board_editor').each(function () {
                            $(this).attr('href', $(this).attr('href').replace(/editor\/.+$/, "editor/" + fen));
                        });
                        $submits.removeClass('nope');
                        lichess.pubsub.emit('content_loaded');
                    },
                    error: function () {
                        $fenInput.addClass("failure");
                        $fenPosition.find('.preview').html("");
                        $submits.addClass('nope');
                    }
                });
            }
        }, 200);
        $fenInput.on('keyup', validateFen);
        $variantSelect.on('change', function () {
            var fen = $(this).val() == '3';
            $fenPosition.toggle(fen);
            $modeChoicesWrap.toggle(!fen);
            if (fen) {
                $casual.click();
                lichess.raf(function () {
                    document.body.dispatchEvent(new Event('chessground.resize'));
                });
            }
            showRating();
            toggleButtons();
        }).trigger('change');
        $form.find('div.level').each(function () {
            var $infos = $(this).find('.ai_info > div');
            $(this).find('label').on('mouseenter', function () {
                $infos.hide().filter('.' + $(this).attr('for')).show();
            });
            $(this).find('#config_level').on('mouseleave', function () {
                var level = $(this).find('input:checked').val();
                $infos.hide().filter('.sf_level_' + level).show();
            }).trigger('mouseout');
        });
    }
    var clickEvent = blindMode ? 'click' : 'mousedown';
    $startButtons.find('a:not(.disabled)').on(clickEvent, function () {
        $(this).addClass('active').siblings().removeClass('active');
        lichess.loadCssPath('lobby.setup');
        lobby.leavePool();
        $.ajax({
            url: $(this).attr('href'),
            success: function (html) {
                prepareForm($.modal(html, 'game-setup', () => {
                    $startButtons.find('.active').removeClass('active');
                }));
                lichess.pubsub.emit('content_loaded');
            },
            error: function (res) {
                if (res.status == 400)
                    alert(res.responseText);
                lichess.reload();
            }
        });
        return false;
    }).on('click', function () {
        return false;
    });
    if (['#ai', '#friend', '#hook'].includes(location.hash)) {
        $startButtons
            .find('.config_' + location.hash.replace('#', ''))
            .each(function () {
            $(this).attr("href", $(this).attr("href") + location.search);
        }).trigger(clickEvent);
        if (location.hash === '#hook') {
            if (/time=realTime/.test(location.search))
                lobby.setTab('real_time');
            else if (/time=correspondence/.test(location.search))
                lobby.setTab('seeks');
        }
        history.replaceState(null, null, '/');
    }
};
function spreadNumber(el, nbSteps, getDuration) {
    var previous, displayed;
    var display = function (prev, cur, it) {
        var val = lichess.numberFormat(Math.round(((prev * (nbSteps - 1 - it)) + (cur * (it + 1))) / nbSteps));
        if (val !== displayed) {
            el.textContent = val;
            displayed = val;
        }
    };
    var timeouts = [];
    return function (nb, overrideNbSteps) {
        if (!el || (!nb && nb !== 0))
            return;
        if (overrideNbSteps)
            nbSteps = Math.abs(overrideNbSteps);
        timeouts.forEach(clearTimeout);
        timeouts = [];
        var prev = previous === 0 ? 0 : (previous || nb);
        previous = nb;
        var interv = Math.abs(getDuration() / nbSteps);
        for (var i = 0; i < nbSteps; i++)
            timeouts.push(setTimeout(display.bind(null, prev, nb, i), Math.round(i * interv)));
    };
}

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const variant_1 = require("./variant");
const hookRepo = require("./hookRepo");
const seekRepo = require("./seekRepo");
const store_1 = require("./store");
const xhr = require("./xhr");
const poolRangeStorage = require("./poolRangeStorage");
const socket_1 = require("./socket");
const li = window.lichess;
class LobbyController {
    constructor(opts, redraw) {
        this.filterOpen = false;
        this.stepHooks = [];
        this.stepping = false;
        this.redirecting = false;
        this.alreadyWatching = [];
        this.flushHooks = (now) => {
            if (this.flushHooksTimeout)
                clearTimeout(this.flushHooksTimeout);
            if (now)
                this.doFlushHooks();
            else {
                this.stepping = true;
                if (this.tab === 'real_time')
                    this.redraw();
                setTimeout(() => {
                    this.stepping = false;
                    this.doFlushHooks();
                }, 500);
            }
            this.flushHooksTimeout = this.flushHooksSchedule();
        };
        this.setTab = (tab) => {
            if (tab !== this.tab) {
                if (tab === 'seeks')
                    xhr.seeks().then(this.setSeeks);
                else if (tab === 'real_time')
                    this.socket.realTimeIn();
                else if (this.tab === 'real_time') {
                    this.socket.realTimeOut();
                    this.data.hooks = [];
                }
                this.tab = this.stores.tab.set(tab);
            }
            this.filterOpen = false;
        };
        this.setMode = (mode) => {
            this.mode = this.stores.mode.set(mode);
            this.filterOpen = false;
        };
        this.setSort = (sort) => {
            this.sort = this.stores.sort.set(sort);
        };
        this.toggleFilter = () => {
            this.filterOpen = !this.filterOpen;
        };
        this.setFilter = (filter) => {
            this.data.filter = filter;
            this.flushHooks(true);
            if (this.tab !== 'real_time')
                this.redraw();
        };
        this.clickHook = (id) => {
            const hook = hookRepo.find(this, id);
            if (!hook || hook.disabled || this.stepping || this.redirecting)
                return;
            if (hook.action === 'cancel' || variant_1.default(hook.variant))
                this.socket.send(hook.action, hook.id);
        };
        this.clickSeek = (id) => {
            const seek = seekRepo.find(this, id);
            if (!seek || this.redirecting)
                return;
            if (seek.action === 'cancelSeek' || variant_1.default(seek.variant))
                this.socket.send(seek.action, seek.id);
        };
        this.setSeeks = (seeks) => {
            this.data.seeks = seeks;
            seekRepo.initAll(this);
            this.redraw();
        };
        this.clickPool = (id) => {
            if (!this.data.me) {
                xhr.anonPoolSeek(this.pools.find(function (p) {
                    return p.id === id;
                }));
                this.setTab('real_time');
            }
            else if (this.poolMember && this.poolMember.id === id)
                this.leavePool();
            else {
                this.enterPool({ id });
                this.redraw();
            }
        };
        this.enterPool = (member) => {
            poolRangeStorage.set(member.id, member.range);
            this.setTab('pools');
            this.poolMember = member;
            this.poolIn();
        };
        this.leavePool = () => {
            if (!this.poolMember)
                return;
            this.socket.poolOut(this.poolMember);
            this.poolMember = undefined;
            this.redraw();
        };
        this.poolIn = () => {
            if (!this.poolMember)
                return;
            this.poolInStorage.fire();
            this.socket.poolIn(this.poolMember);
        };
        this.gameActivity = gameId => {
            if (this.data.nowPlaying.find(p => p.gameId === gameId))
                xhr.nowPlaying().then(povs => {
                    this.data.nowPlaying = povs;
                    this.startWatching();
                    this.redraw();
                });
        };
        this.setRedirecting = () => {
            this.redirecting = true;
            setTimeout(() => {
                this.redirecting = false;
                this.redraw();
            }, 4000);
            this.redraw();
        };
        this.awake = () => {
            switch (this.tab) {
                case 'real_time':
                    this.data.hooks = [];
                    this.socket.realTimeIn();
                    break;
                case 'seeks':
                    xhr.seeks().then(this.setSeeks);
                    break;
            }
        };
        this.opts = opts;
        this.data = opts.data;
        this.data.hooks = [];
        this.pools = opts.pools;
        this.playban = opts.playban;
        this.isBot = opts.data.me && opts.data.me.isBot;
        this.redraw = redraw;
        hookRepo.initAll(this);
        seekRepo.initAll(this);
        this.socket = new socket_1.default(opts.socketSend, this);
        this.stores = store_1.make(this.data.me ? this.data.me.username.toLowerCase() : null);
        this.tab = this.isBot ? 'now_playing' : this.stores.tab.get(),
            this.mode = this.stores.mode.get(),
            this.sort = this.stores.sort.get(),
            this.trans = opts.trans;
        this.poolInStorage = li.storage.make('lobby.pool-in');
        this.poolInStorage.listen(_ => {
            this.leavePool();
            redraw();
        });
        this.flushHooksSchedule();
        this.startWatching();
        if (this.playban) {
            if (this.playban.remainingSecond < 86400)
                setTimeout(li.reload, this.playban.remainingSeconds * 1000);
        }
        else {
            setInterval(() => {
                if (this.poolMember)
                    this.poolIn();
                else if (this.tab === 'real_time' && !this.data.hooks.length)
                    this.socket.realTimeIn();
            }, 10 * 1000);
            this.joinPoolFromLocationHash();
        }
        li.pubsub.on('socket.open', () => {
            if (this.tab === 'real_time') {
                this.data.hooks = [];
                this.socket.realTimeIn();
            }
            else if (this.tab === 'pools' && this.poolMember)
                this.poolIn();
        });
        window.addEventListener('beforeunload', () => {
            if (this.poolMember)
                this.socket.poolOut(this.poolMember);
        });
    }
    doFlushHooks() {
        this.stepHooks = this.data.hooks.slice(0);
        if (this.tab === 'real_time')
            this.redraw();
    }
    ;
    flushHooksSchedule() {
        return setTimeout(this.flushHooks, 8000);
    }
    startWatching() {
        const newIds = this.data.nowPlaying
            .map(p => p.gameId)
            .filter(id => !this.alreadyWatching.includes(id));
        if (newIds.length) {
            setTimeout(() => this.socket.send("startWatching", newIds.join(' ')), 2000);
            newIds.forEach(id => this.alreadyWatching.push(id));
        }
    }
    ;
    // after click on round "new opponent" button
    // also handles onboardink link for anon users
    joinPoolFromLocationHash() {
        if (location.hash.startsWith('#pool/')) {
            const regex = /^#pool\/(\d+\+\d+)(?:\/(.+))?$/, match = regex.exec(location.hash), member = { id: match[1], blocking: match[2] }, range = poolRangeStorage.get(member.id);
            if (range)
                member.range = range;
            if (match) {
                this.setTab('pools');
                if (this.data.me)
                    this.enterPool(member);
                else
                    setTimeout(() => this.clickPool(member.id), 1500);
                history.replaceState(null, '', '/');
            }
        }
    }
}
exports.default = LobbyController;

},{"./hookRepo":30,"./poolRangeStorage":32,"./seekRepo":33,"./socket":34,"./store":35,"./variant":36,"./xhr":47}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(ctrl, hooks) {
    const f = ctrl.data.filter, seen = [], visible = [];
    let variant, hidden = 0;
    hooks.forEach(function (hook) {
        variant = hook.variant;
        if (hook.action === 'cancel')
            visible.push(hook);
        else {
            if (!f.variant.includes(variant) ||
                !f.mode.includes(hook.ra || 0) ||
                !f.speed.includes(hook.s || 1 /* ultrabullet = bullet */) ||
                (f.rating && (!hook.rating || (hook.rating < f.rating[0] || hook.rating > f.rating[1])))) {
                hidden++;
            }
            else {
                const hash = hook.ra + variant + hook.t + hook.rating;
                if (!seen.includes(hash))
                    visible.push(hook);
                seen.push(hash);
            }
        }
    });
    return {
        visible: visible,
        hidden: hidden
    };
}
exports.default = default_1;

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ratingOrder(a, b) {
    return (a.rating || 0) > (b.rating || 0) ? -1 : 1;
}
function timeOrder(a, b) {
    return a.t < b.t ? -1 : 1;
}
function sort(ctrl, hooks) {
    hooks.sort(ctrl.sort === 'time' ? timeOrder : ratingOrder);
}
exports.sort = sort;
function init(hook) {
    hook.action = hook.sri === window.lichess.sri ? 'cancel' : 'join';
    hook.variant = hook.variant || 'standard';
}
exports.init = init;
function initAll(ctrl) {
    ctrl.data.hooks.forEach(init);
}
exports.initAll = initAll;
function add(ctrl, hook) {
    init(hook);
    ctrl.data.hooks.push(hook);
}
exports.add = add;
function setAll(ctrl, hooks) {
    ctrl.data.hooks = hooks;
    initAll(ctrl);
}
exports.setAll = setAll;
function remove(ctrl, id) {
    ctrl.data.hooks = ctrl.data.hooks.filter(function (h) {
        return h.id !== id;
    });
    ctrl.stepHooks.forEach(function (h) {
        if (h.id === id)
            h.disabled = true;
    });
}
exports.remove = remove;
function syncIds(ctrl, ids) {
    ctrl.data.hooks = ctrl.data.hooks.filter(function (h) {
        return ids.includes(h.id);
    });
}
exports.syncIds = syncIds;
function find(ctrl, id) {
    return ctrl.data.hooks.find(function (h) {
        return h.id === id;
    });
}
exports.find = find;

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const chessground_1 = require("chessground");
exports.patch = snabbdom_1.init([class_1.default, attributes_1.default]);
const ctrl_1 = require("./ctrl");
const main_1 = require("./view/main");
const boot = require("./boot");
function start(opts) {
    let vnode, ctrl;
    function redraw() {
        vnode = exports.patch(vnode, main_1.default(ctrl));
    }
    ctrl = new ctrl_1.default(opts, redraw);
    const blueprint = main_1.default(ctrl);
    opts.element.innerHTML = '';
    vnode = exports.patch(opts.element, blueprint);
    return {
        socketReceive: ctrl.socket.receive,
        setTab(tab) {
            ctrl.setTab(tab);
            ctrl.redraw();
        },
        gameActivity: ctrl.gameActivity,
        setRedirecting: ctrl.setRedirecting,
        enterPool: ctrl.enterPool,
        leavePool: ctrl.leavePool,
        redraw: ctrl.redraw
    };
}
exports.start = start;
// that's for the rest of lichess to access chessground
// without having to include it a second time
window.Chessground = chessground_1.Chessground;
window.onload = function () {
    boot(window['lichess_lobby'], document.querySelector('.lobby__app'));
};

},{"./boot":27,"./ctrl":28,"./view/main":38,"chessground":4,"snabbdom":24,"snabbdom/modules/attributes":22,"snabbdom/modules/class":23}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function makeKey(poolId) {
    return 'lobby-pool-range-' + poolId;
}
function set(poolId, range) {
    const key = makeKey(poolId);
    if (range)
        window.lichess.storage.set(key, range);
    else
        window.lichess.storage.remove(key);
}
exports.set = set;
function get(poolId) {
    return window.lichess.storage.get(makeKey(poolId));
}
exports.get = get;

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function order(a, b) {
    return a.rating > b.rating ? -1 : 1;
}
function sort(ctrl) {
    ctrl.data.seeks.sort(order);
}
exports.sort = sort;
function initAll(ctrl) {
    ctrl.data.seeks.forEach(function (seek) {
        seek.action = (ctrl.data.me && seek.username === ctrl.data.me.username) ? 'cancelSeek' : 'joinSeek';
    });
    sort(ctrl);
}
exports.initAll = initAll;
function find(ctrl, id) {
    return ctrl.data.seeks.find(s => s.id === id);
}
exports.find = find;

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xhr = require("./xhr");
const hookRepo = require("./hookRepo");
const li = window.lichess;
class LobbySocket {
    constructor(send, ctrl) {
        this.receive = (type, data) => {
            if (this.handlers[type]) {
                this.handlers[type](data);
                return true;
            }
            return false;
        };
        this.send = send;
        this.handlers = {
            had(hook) {
                hookRepo.add(ctrl, hook);
                if (hook.action === 'cancel')
                    ctrl.flushHooks(true);
                ctrl.redraw();
            },
            hrm(ids) {
                ids.match(/.{8}/g).forEach(function (id) {
                    hookRepo.remove(ctrl, id);
                });
                ctrl.redraw();
            },
            hooks(hooks) {
                hookRepo.setAll(ctrl, hooks);
                ctrl.flushHooks(true);
                ctrl.redraw();
            },
            hli(ids) {
                hookRepo.syncIds(ctrl, ids.match(/.{8}/g));
                ctrl.redraw();
            },
            reload_seeks() {
                if (ctrl.tab === 'seeks')
                    xhr.seeks().then(ctrl.setSeeks);
            }
        };
        li.idleTimer(3 * 60 * 1000, () => send('idle', true), () => {
            send('idle', false);
            ctrl.awake();
        });
    }
    realTimeIn() {
        this.send('hookIn');
    }
    ;
    realTimeOut() {
        this.send('hookOut');
    }
    ;
    poolIn(member) {
        // last arg=true: must not retry
        // because if poolIn is sent before socket opens,
        // then poolOut is sent,
        // then poolIn shouldn't be sent again after socket opens.
        // poolIn is sent anyway on socket open event.
        this.send('poolIn', member, {}, true);
    }
    ;
    poolOut(member) {
        this.send('poolOut', member.id);
    }
    ;
}
exports.default = LobbySocket;
;

},{"./hookRepo":30,"./xhr":47}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tab = {
    key: 'lobby.tab',
    fix(t) {
        if (t)
            return t;
        return 'pools';
    }
};
const mode = {
    key: 'lobby.mode',
    fix(m) {
        if (m)
            return m;
        return 'list';
    }
};
const sort = {
    key: 'lobby.sort',
    fix(s) {
        if (s)
            return s;
        return 'rating';
    }
};
function makeStore(conf, userId) {
    const fullKey = conf.key + ':' + (userId || '-');
    return {
        set(v) {
            const t = conf.fix(v);
            window.lichess.storage.set(fullKey, '' + t);
            return t;
        },
        get() {
            return conf.fix(window.lichess.storage.get(fullKey));
        }
    };
}
function make(userId) {
    return {
        tab: makeStore(tab, userId),
        mode: makeStore(mode, userId),
        sort: makeStore(sort, userId)
    };
}
exports.make = make;
;

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const variantConfirms = {
    'chess960': "This is a Chess960 game!\n\nThe starting position of the pieces on the players' home ranks is randomized.",
    'kingOfTheHill': "This is a King of the Hill game!\n\nThe game can be won by bringing the king to the center.",
    'threeCheck': "This is a Three-check game!\n\nThe game can be won by checking the opponent three times.",
    "antichess": "This is an Antichess game!\n\nIf you can take a piece, you must. The game can be won by losing all your pieces, or by being stalemated.",
    "atomic": "This is an Atomic chess game!\n\nCapturing a piece causes an explosion, taking out your piece and surrounding non-pawns. Win by mating or exploding your opponent's king.",
    "horde": "This is a Horde chess game!\n\Black must take all White pawns to win. White must checkmate the Black king.",
    "racingKings": "This is a Racing Kings game!\n\nPlayers must race their kings to the eighth rank. Checks are not allowed.",
    "crazyhouse": "This is a Crazyhouse game!\n\nEvery time a piece is captured, the capturing player gets a piece of the same type and of their color in their pocket."
};
function storageKey(key) {
    return 'lobby.variant.' + key;
}
function default_1(variant) {
    return Object.keys(variantConfirms).every(function (key) {
        const v = variantConfirms[key];
        if (variant === key && !window.lichess.storage.get(storageKey(key))) {
            const c = confirm(v);
            if (c)
                window.lichess.storage.set(storageKey(key), '1');
            return c;
        }
        else
            return true;
    });
}
exports.default = default_1;

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function renderSeek(ctrl, seek) {
    const klass = seek.action === 'joinSeek' ? 'join' : 'cancel', noarg = ctrl.trans.noarg;
    return snabbdom_1.h('tr.seek.' + klass, {
        key: seek.id,
        attrs: {
            title: (seek.action === 'joinSeek') ? noarg('joinTheGame') + ' - ' + seek.perf.name : noarg('cancel'),
            'data-id': seek.id
        }
    }, util_1.tds([
        snabbdom_1.h('span.is.is2.color-icon.' + (seek.color || 'random')),
        (seek.rating ? snabbdom_1.h('span.ulpt', {
            attrs: { 'data-href': '/@/' + seek.username }
        }, seek.username) : 'Anonymous'),
        seek.rating + (seek.provisional ? '?' : ''),
        seek.days ? ctrl.trans.plural('nbDays', seek.days) : '∞',
        snabbdom_1.h('span', [
            snabbdom_1.h('span.varicon', {
                attrs: { 'data-icon': seek.perf.icon }
            }),
            noarg(seek.mode === 1 ? 'rated' : 'casual')
        ])
    ]));
}
function createSeek(ctrl) {
    if (ctrl.data.me && ctrl.data.seeks.length < 8)
        return snabbdom_1.h('div.create', [
            snabbdom_1.h('a.button', {
                attrs: { href: '/?time=correspondence#hook' }
            }, ctrl.trans('createAGame'))
        ]);
    return;
}
function default_1(ctrl) {
    return [
        snabbdom_1.h('table.hooks__list', [
            snabbdom_1.h('thead', [
                snabbdom_1.h('tr', ['', 'player', 'rating', 'time', 'mode'].map(header => snabbdom_1.h('th', ctrl.trans(header))))
            ]),
            snabbdom_1.h('tbody', {
                hook: util_1.bind('click', e => {
                    let el = e.target;
                    do {
                        el = el.parentNode;
                        if (el.nodeName === 'TR') {
                            if (!ctrl.data.me) {
                                if (confirm(ctrl.trans('youNeedAnAccountToDoThat')))
                                    location.href = '/signup';
                                return;
                            }
                            return ctrl.clickSeek(el.getAttribute('data-id'));
                        }
                    } while (el.nodeName !== 'TABLE');
                })
            }, ctrl.data.seeks.map(s => renderSeek(ctrl, s)))
        ]),
        createSeek(ctrl)
    ];
}
exports.default = default_1;

},{"./util":46,"snabbdom":24}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const tabs_1 = require("./tabs");
const renderPools = require("./pools");
const main_1 = require("./realTime/main");
const correspondence_1 = require("./correspondence");
const playing_1 = require("./playing");
const util_1 = require("./util");
function default_1(ctrl) {
    let body, data = {};
    if (ctrl.redirecting)
        body = util_1.spinner();
    else
        switch (ctrl.tab) {
            case 'pools':
                body = renderPools.render(ctrl);
                data = { hook: renderPools.hooks(ctrl) };
                break;
            case 'real_time':
                body = main_1.default(ctrl);
                break;
            case 'seeks':
                body = correspondence_1.default(ctrl);
                break;
            case 'now_playing':
                body = playing_1.default(ctrl);
                break;
        }
    return snabbdom_1.h('div.lobby__app.lobby__app-' + ctrl.tab, [
        snabbdom_1.h('div.tabs-horiz', tabs_1.default(ctrl)),
        snabbdom_1.h('div.lobby__app__content.l' + (ctrl.redirecting ? 'redir' : ctrl.tab), data, body)
    ]);
}
exports.default = default_1;
;

},{"./correspondence":37,"./playing":39,"./pools":40,"./realTime/main":44,"./tabs":45,"./util":46,"snabbdom":24}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const chessground_1 = require("chessground");
function timer(pov) {
    const date = Date.now() + pov.secondsLeft * 1000;
    return snabbdom_1.h('time.timeago', {
        hook: {
            insert(vnode) {
                vnode.elm.setAttribute('datetime', '' + date);
            }
        }
    }, window.lichess.timeago.format(date));
}
function default_1(ctrl) {
    return snabbdom_1.h('div.now-playing', ctrl.data.nowPlaying.map(function (pov) {
        return snabbdom_1.h('a.' + pov.variant.key + (pov.isMyTurn ? '.my_turn' : ''), {
            key: pov.gameId,
            attrs: { href: '/' + pov.fullId }
        }, [
            snabbdom_1.h('div.mini-board.cg-wrap.is2d', {
                hook: {
                    insert(vnode) {
                        const lm = pov.lastMove;
                        chessground_1.Chessground(vnode.elm, {
                            coordinates: false,
                            drawable: { enabled: false, visible: false },
                            resizable: false,
                            viewOnly: true,
                            orientation: pov.variant.key === 'racingKings' ? 'white' : pov.color,
                            fen: pov.fen,
                            lastMove: lm && [lm[0] + lm[1], lm[2] + lm[3]]
                        });
                    }
                }
            }),
            snabbdom_1.h('span.meta', [
                pov.opponent.ai ? ctrl.trans('aiNameLevelAiLevel', 'Stockfish', pov.opponent.ai) : pov.opponent.username,
                snabbdom_1.h('span.indicator', pov.isMyTurn ?
                    (pov.secondsLeft ? timer(pov) : [ctrl.trans.noarg('yourTurn')]) :
                    snabbdom_1.h('span', '\xa0')) // &nbsp;
            ])
        ]);
    }));
}
exports.default = default_1;

},{"chessground":4,"snabbdom":24}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function renderRange(range) {
    return snabbdom_1.h('div.range', range.replace('-', '–'));
}
function hooks(ctrl) {
    return util_1.bind('click', e => {
        const id = e.target.getAttribute('data-id') ||
            e.target.parentNode.getAttribute('data-id');
        if (id === 'custom')
            $('.config_hook').trigger('mousedown');
        else if (id)
            ctrl.clickPool(id);
    }, ctrl.redraw);
}
exports.hooks = hooks;
function render(ctrl) {
    const member = ctrl.poolMember;
    return ctrl.pools.map(pool => {
        const active = !!member && member.id === pool.id, transp = !!member && !active;
        return snabbdom_1.h('div', {
            class: {
                active,
                transp: !active && transp
            },
            attrs: { 'data-id': pool.id }
        }, [
            snabbdom_1.h('div.clock', pool.lim + '+' + pool.inc),
            (active && member.range) ? renderRange(member.range) : snabbdom_1.h('div.perf', pool.perf),
            active ? util_1.spinner() : null
        ]);
    }).concat(snabbdom_1.h('div.custom', {
        class: { transp: !!member },
        attrs: { 'data-id': 'custom' }
    }, ctrl.trans.noarg('custom')));
}
exports.render = render;

},{"./util":46,"snabbdom":24}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("../util");
function percents(v) {
    return v + '%';
}
function ratingLog(a) {
    return Math.log(a / 150 + 1);
}
function ratingY(e) {
    const rating = Math.max(1000, Math.min(2200, e || 1500));
    let ratio;
    let mid = 2 / 5;
    if (rating == 1500) {
        ratio = mid;
    }
    else if (rating > 1500) {
        ratio = mid + (ratingLog(rating - 1500) / ratingLog(1300)) * 2 * mid;
    }
    else {
        ratio = mid - (ratingLog(1500 - rating) / ratingLog(500)) * mid;
    }
    return Math.round(ratio * 94);
}
const clockMax = 2000;
function clockX(dur) {
    function durLog(a) {
        return Math.log((a - 30) / 200 + 1);
    }
    return Math.round(durLog(Math.min(clockMax, dur || clockMax)) / durLog(clockMax) * 100);
}
function renderPlot(ctrl, hook) {
    const bottom = Math.max(0, ratingY(hook.rating) - 2), left = Math.max(0, clockX(hook.t) - 2), klass = [
        'plot.new',
        hook.ra ? 'rated' : 'casual',
        hook.action === 'cancel' ? 'cancel' : ''
    ].join('.');
    return snabbdom_1.h('span#' + hook.id + '.' + klass, {
        key: hook.id,
        attrs: {
            'data-icon': util_1.perfIcons[hook.perf],
            style: `bottom:${percents(bottom)};left:${percents(left)}`
        },
        hook: {
            insert(vnode) {
                $(vnode.elm).powerTip({
                    intentPollInterval: 100,
                    placement: hook.rating > 1800 ? 'se' : 'ne',
                    mouseOnToPopup: true,
                    closeDelay: 200,
                    popupId: 'hook'
                }).data('powertipjq', $(renderHook(ctrl, hook)));
                setTimeout(function () {
                    vnode.elm.classList.remove('new');
                }, 20);
            },
            destroy(vnode) {
                $(vnode.elm).data('powertipjq', null);
                $.powerTip.destroy(vnode.elm);
            }
        }
    });
}
function renderHook(ctrl, hook) {
    const color = hook.c || 'random';
    let html = '<div class="inner">';
    if (hook.rating) {
        html += '<a class="opponent ulpt is color-icon ' + color + '" href="/@/' + hook.u + '">';
        html += ' ' + hook.u + ' (' + hook.rating + (hook.prov ? '?' : '') + ')';
        html += '</a>';
    }
    else {
        html += '<span class="opponent anon ' + color + '">' + ctrl.trans('anonymous') + '</span>';
    }
    html += hook.clock;
    html += '<i data-icon="' + util_1.perfIcons[hook.perf] + '"> ' + ctrl.trans(hook.ra ? 'rated' : 'casual') + '</i>';
    html += '</div>';
    return html;
}
const xMarks = [1, 2, 3, 5, 7, 10, 15, 20, 30];
function renderXAxis() {
    const tags = [];
    xMarks.forEach(v => {
        const l = clockX(v * 60);
        tags.push(snabbdom_1.h('span.x.label', {
            attrs: { style: 'left:' + percents(l - 1.5) }
        }, '' + v));
        tags.push(snabbdom_1.h('div.grid.vert', {
            attrs: { style: 'width:' + percents(l) }
        }));
    });
    return tags;
}
const yMarks = [1000, 1200, 1400, 1500, 1600, 1800, 2000];
function renderYAxis() {
    const tags = [];
    yMarks.forEach(function (v) {
        const b = ratingY(v);
        tags.push(snabbdom_1.h('span.y.label', {
            attrs: { style: 'bottom:' + percents(b + 1) }
        }, '' + v));
        tags.push(snabbdom_1.h('div.grid.horiz', {
            attrs: { style: 'height:' + percents(b + 0.8) }
        }));
    });
    return tags;
}
function toggle(ctrl) {
    return snabbdom_1.h('i.toggle', {
        key: 'set-mode-list',
        attrs: { title: ctrl.trans.noarg('list'), 'data-icon': '?' },
        hook: util_1.bind('mousedown', _ => ctrl.setMode('list'), ctrl.redraw)
    });
}
exports.toggle = toggle;
function render(ctrl, hooks) {
    return snabbdom_1.h('div.hooks__chart', [
        snabbdom_1.h('div.canvas', {
            hook: util_1.bind('click', e => {
                if (e.target.classList.contains('plot'))
                    ctrl.clickHook(e.target.id);
            }, ctrl.redraw)
        }, hooks.map(hook => renderPlot(ctrl, hook))),
        ...renderYAxis(),
        ...renderXAxis()
    ]);
}
exports.render = render;

},{"../util":46,"snabbdom":24}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("../util");
function initialize(ctrl, el) {
    const $div = $(el), $ratingRange = $div.find('.rating-range');
    const save = window.lichess.debounce(function () {
        const $form = $div.find('form');
        $.ajax(Object.assign(Object.assign({}, window.lichess.formAjax($form)), { success: function (filter) {
                ctrl.setFilter(filter);
            } }));
    }, 200);
    function changeRatingRange(values) {
        $ratingRange.find('input').val(values[0] + "-" + values[1]);
        $ratingRange.siblings('.range').text(values[0] + "–" + values[1]);
        save();
    }
    $div.find('input').change(save);
    $div.find('button.reset').click(function () {
        $div.find('label input').prop('checked', true).trigger('change');
        $div.find('.rating-range').each(function () {
            const s = $(this), values = [s.slider('option', 'min'), s.slider('option', 'max')];
            s.slider('values', values);
            changeRatingRange(values);
        });
        return false;
    });
    $div.find('button.apply').click(function () {
        ctrl.toggleFilter();
        ctrl.redraw();
        return false;
    });
    $ratingRange.each(function () {
        var $this = $(this);
        window.lichess.slider().done(function () {
            var $input = $this.find("input");
            var $span = $this.siblings(".range");
            var min = $input.data("min");
            var max = $input.data("max");
            var values = $input.val() ? $input.val().split("-") : [min, max];
            $span.text(values.join('–'));
            $this.slider({
                range: true,
                min: min,
                max: max,
                values: values,
                step: 50,
                slide(_, ui) {
                    changeRatingRange(ui.values);
                }
            });
        });
    });
}
function toggle(ctrl, nbFiltered) {
    return snabbdom_1.h('i.toggle.toggle-filter', {
        class: { gamesFiltered: nbFiltered > 0, active: ctrl.filterOpen },
        hook: util_1.bind('mousedown', ctrl.toggleFilter, ctrl.redraw),
        attrs: {
            'data-icon': ctrl.filterOpen ? 'L' : '%',
            title: ctrl.trans.noarg('filterGames')
        }
    });
}
exports.toggle = toggle;
function render(ctrl) {
    return snabbdom_1.h('div.hook__filters', {
        hook: {
            insert(vnode) {
                const el = vnode.elm;
                if (el.filterLoaded)
                    return;
                $.ajax({
                    url: '/setup/filter',
                    success(html) {
                        el.innerHTML = html;
                        el.filterLoaded = true;
                        initialize(ctrl, el);
                    }
                });
            }
        }
    });
}
exports.render = render;

},{"../util":46,"snabbdom":24}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("../util");
const hookRepo = require("../../hookRepo");
function renderHook(ctrl, hook) {
    const noarg = ctrl.trans.noarg;
    return snabbdom_1.h('tr.hook.' + hook.action, {
        key: hook.id,
        class: { disabled: hook.disabled },
        attrs: {
            title: hook.disabled ? '' : ((hook.action === 'join') ? noarg('joinTheGame') + ' | ' + hook.perf : noarg('cancel')),
            'data-id': hook.id
        },
    }, util_1.tds([
        snabbdom_1.h('span.is.is2.color-icon.' + (hook.c || 'random')),
        (hook.rating ? snabbdom_1.h('span.ulink.ulpt', {
            attrs: { 'data-href': '/@/' + hook.u }
        }, hook.u) : 'Anonymous'),
        (hook.rating ? hook.rating : '') + (hook.prov ? '?' : ''),
        hook.clock,
        snabbdom_1.h('span', {
            attrs: { 'data-icon': util_1.perfIcons[hook.perf] }
        }, noarg(hook.ra ? 'rated' : 'casual'))
    ]));
}
function isStandard(value) {
    return function (hook) {
        return (hook.variant === 'standard') === value;
    };
}
function isMine(hook) {
    return hook.action === 'cancel';
}
function isNotMine(hook) {
    return !isMine(hook);
}
function toggle(ctrl) {
    return snabbdom_1.h('i.toggle', {
        key: 'set-mode-chart',
        attrs: { title: ctrl.trans.noarg('graph'), 'data-icon': '9' },
        hook: util_1.bind('mousedown', _ => ctrl.setMode('chart'), ctrl.redraw)
    });
}
exports.toggle = toggle;
function render(ctrl, allHooks) {
    const mine = allHooks.find(isMine), max = mine ? 13 : 14, hooks = allHooks.slice(0, max), render = (hook) => renderHook(ctrl, hook), standards = hooks.filter(isNotMine).filter(isStandard(true));
    hookRepo.sort(ctrl, standards);
    const variants = hooks.filter(isNotMine).filter(isStandard(false))
        .slice(0, Math.max(0, max - standards.length - 1));
    hookRepo.sort(ctrl, variants);
    const renderedHooks = [
        ...standards.map(render),
        variants.length ? snabbdom_1.h('tr.variants', {
            key: 'variants',
        }, [
            snabbdom_1.h('td', {
                attrs: { colspan: 5 }
            }, '— ' + ctrl.trans('variant') + ' —')
        ]) : null,
        ...variants.map(render)
    ];
    if (mine)
        renderedHooks.unshift(render(mine));
    return snabbdom_1.h('table.hooks__list', [
        snabbdom_1.h('thead', snabbdom_1.h('tr', [
            snabbdom_1.h('th'),
            snabbdom_1.h('th', ctrl.trans('player')),
            snabbdom_1.h('th', {
                class: {
                    sortable: true,
                    sort: ctrl.sort === 'rating'
                },
                hook: util_1.bind('click', _ => ctrl.setSort('rating'), ctrl.redraw)
            }, [snabbdom_1.h('i.is'), ctrl.trans('rating')]),
            snabbdom_1.h('th', {
                class: {
                    sortable: true,
                    sort: ctrl.sort === 'time'
                },
                hook: util_1.bind('click', _ => ctrl.setSort('time'), ctrl.redraw)
            }, [snabbdom_1.h('i.is'), ctrl.trans('time')]),
            snabbdom_1.h('th', ctrl.trans('mode'))
        ])),
        snabbdom_1.h('tbody', {
            class: { stepping: ctrl.stepping },
            hook: util_1.bind('click', e => {
                let el = e.target;
                do {
                    el = el.parentNode;
                    if (el.nodeName === 'TR')
                        return ctrl.clickHook(el.getAttribute('data-id'));
                } while (el.nodeName !== 'TABLE');
            }, ctrl.redraw)
        }, renderedHooks)
    ]);
}
exports.render = render;

},{"../../hookRepo":30,"../util":46,"snabbdom":24}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const list = require("./list");
const chart = require("./chart");
const filter_1 = require("../../filter");
const filterView = require("./filter");
function default_1(ctrl) {
    let filterBody, body, nbFiltered, modeToggle, res;
    if (ctrl.filterOpen)
        filterBody = filterView.render(ctrl);
    switch (ctrl.mode) {
        case 'chart':
            res = filter_1.default(ctrl, ctrl.data.hooks);
            nbFiltered = res.hidden;
            body = filterBody || chart.render(ctrl, res.visible);
            modeToggle = ctrl.filterOpen ? null : chart.toggle(ctrl);
            break;
        default:
            res = filter_1.default(ctrl, ctrl.stepHooks);
            nbFiltered = res.hidden;
            body = filterBody || list.render(ctrl, res.visible);
            modeToggle = ctrl.filterOpen ? null : list.toggle(ctrl);
    }
    const filterToggle = filterView.toggle(ctrl, nbFiltered);
    return [
        filterToggle,
        modeToggle,
        body
    ];
}
exports.default = default_1;

},{"../../filter":29,"./chart":41,"./filter":42,"./list":43}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function tab(ctrl, key, active, content) {
    return snabbdom_1.h('span', {
        class: {
            active: key === active,
            glowing: key !== active && key === 'pools' && !!ctrl.poolMember
        },
        hook: util_1.bind('mousedown', _ => ctrl.setTab(key), ctrl.redraw)
    }, content);
}
function default_1(ctrl) {
    const myTurnPovsNb = ctrl.data.nowPlaying.filter(function (p) {
        return p.isMyTurn;
    }).length;
    const active = ctrl.tab;
    return [
        ctrl.isBot ? undefined : tab(ctrl, 'pools', active, [ctrl.trans.noarg('quickPairing')]),
        ctrl.isBot ? undefined : tab(ctrl, 'real_time', active, [ctrl.trans.noarg('lobby')]),
        ctrl.isBot ? undefined : tab(ctrl, 'seeks', active, [ctrl.trans.noarg('correspondence')]),
        (active === 'now_playing' || ctrl.data.nbNowPlaying > 0 || ctrl.isBot) ? tab(ctrl, 'now_playing', active, [
            ctrl.trans.plural('nbGamesInPlay', ctrl.data.nbNowPlaying),
            myTurnPovsNb > 0 ? snabbdom_1.h('i.unread', myTurnPovsNb) : null
        ]) : null
    ];
}
exports.default = default_1;
;

},{"./util":46,"snabbdom":24}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
function bind(eventName, f, redraw) {
    return {
        insert(vnode) {
            vnode.elm.addEventListener(eventName, e => {
                const res = f(e);
                if (redraw)
                    redraw();
                return res;
            });
        }
    };
}
exports.bind = bind;
function tds(bits) {
    return bits.map(function (bit) {
        return snabbdom_1.h('td', [bit]);
    });
}
exports.tds = tds;
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
exports.perfIcons = {
    'Blitz': ')',
    'Racing Kings': '',
    'UltraBullet': '{',
    'Bullet': 'T',
    'Classical': '+',
    'Rapid': '#',
    'Three-check': '.',
    'Antichess': '@',
    'Horde': '_',
    'Atomic': '>',
    'Crazyhouse': '',
    'Chess960': '\'',
    'Correspondence': ';',
    'King of the Hill': '('
};

},{"snabbdom":24}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const headers = {
    'Accept': 'application/vnd.lichess.v3+json'
};
function seeks() {
    return $.ajax({
        url: '/lobby/seeks',
        headers: headers
    });
}
exports.seeks = seeks;
function nowPlaying() {
    return $.ajax({
        url: '/account/now-playing',
        headers: headers
    }).then(o => o.nowPlaying);
}
exports.nowPlaying = nowPlaying;
function anonPoolSeek(pool) {
    return $.ajax({
        method: 'POST',
        url: '/setup/hook/' + window.lichess.sri,
        data: {
            variant: 1,
            timeMode: 1,
            time: pool.lim,
            increment: pool.inc,
            days: 1,
            color: 'random'
        }
    });
}
exports.anonPoolSeek = anonPoolSeek;

},{}]},{},[31])(31)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2FuaW0udHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2FwaS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvYm9hcmQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2NoZXNzZ3JvdW5kLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9jb25maWcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2RyYWcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2RyYXcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2Ryb3AudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2V2ZW50cy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZXhwbG9zaW9uLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9mZW4udHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3ByZW1vdmUudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3JlbmRlci50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvc3RhdGUudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3N2Zy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvdHlwZXMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3V0aWwudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3dyYXAudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3RodW5rLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3Zub2RlLmpzIiwic3JjL2Jvb3QuanMiLCJzcmMvY3RybC50cyIsInNyYy9maWx0ZXIudHMiLCJzcmMvaG9va1JlcG8udHMiLCJzcmMvbWFpbi50cyIsInNyYy9wb29sUmFuZ2VTdG9yYWdlLnRzIiwic3JjL3NlZWtSZXBvLnRzIiwic3JjL3NvY2tldC50cyIsInNyYy9zdG9yZS50cyIsInNyYy92YXJpYW50LnRzIiwic3JjL3ZpZXcvY29ycmVzcG9uZGVuY2UudHMiLCJzcmMvdmlldy9tYWluLnRzIiwic3JjL3ZpZXcvcGxheWluZy50cyIsInNyYy92aWV3L3Bvb2xzLnRzIiwic3JjL3ZpZXcvcmVhbFRpbWUvY2hhcnQudHMiLCJzcmMvdmlldy9yZWFsVGltZS9maWx0ZXIudHMiLCJzcmMvdmlldy9yZWFsVGltZS9saXN0LnRzIiwic3JjL3ZpZXcvcmVhbFRpbWUvbWFpbi50cyIsInNyYy92aWV3L3RhYnMudHMiLCJzcmMvdmlldy91dGlsLnRzIiwic3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsK0JBQThCO0FBNEI5QixTQUFnQixJQUFJLENBQUksUUFBcUIsRUFBRSxLQUFZO0lBQ3pELE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNUQSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsR0FBRyxFQUFFLE9BQU87SUFDcEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxRQUFRLEVBQUMsRUFBQyxFQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxRQUFRLEVBQUMsRUFBQyxFQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxPQUFPLEVBQUMsRUFBQyxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsRUFBQyxFQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxPQUFPLEVBQUMsRUFBQyxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsRUFBQyxFQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUMsR0FBRyxFQUFDLEVB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QUUsaUNBQWlDO0NBQzVDLENBQUM7QUFFRixTQUFnQixLQUFLO0lBQ25CLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNaLEdBQUcsRUFBRSxjQUFjO1FBQ25CLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFMRCxzQkFLQztBQUVELFNBQWdCLFVBQVU7SUFDeEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ1osR0FBRyxFQUFFLHNCQUFzQjtRQUMzQixPQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFMRCxnQ0FLQztBQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFJO0lBQy9CLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNaLE1BQU0sRUFBRSxNQUFNO1FBQ2QsR0FBRyxFQUFFLGNBQWMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUc7UUFDeEMsSUFBSSxFQUFFO1lBQ0osT0FBTyxFQUFFLENBQUM7WUFDVixRQUFRLEVBQUUsQ0FBQztZQUNYLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRztZQUNkLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNuQixJQUFJLEVBQUUsQ0FBQztZQUNQLEtBQUssRUFBRSxRQUFRO1NBQ2hCO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQWJELG9DQWFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIDAsMSBhbmltYXRpb24gZ29hbFxuLy8gMiwzIGFuaW1hdGlvbiBjdXJyZW50IHN0YXR1c1xuZXhwb3J0IHR5cGUgQW5pbVZlY3RvciA9IGNnLk51bWJlclF1YWRcblxuZXhwb3J0IGludGVyZmFjZSBBbmltVmVjdG9ycyB7XG4gIFtrZXk6IHN0cmluZ106IEFuaW1WZWN0b3Jcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltRmFkaW5ncyB7XG4gIFtrZXk6IHN0cmluZ106IGNnLlBpZWNlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbVBsYW4ge1xuICBhbmltczogQW5pbVZlY3RvcnM7XG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1DdXJyZW50IHtcbiAgc3RhcnQ6IERPTUhpZ2hSZXNUaW1lU3RhbXA7XG4gIGZyZXF1ZW5jeTogY2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXI8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBBbmltUGllY2Uge1xuICBrZXk6IGNnLktleTtcbiAgcG9zOiBjZy5Qb3M7XG4gIHBpZWNlOiBjZy5QaWVjZTtcbn1cbmludGVyZmFjZSBBbmltUGllY2VzIHtcbiAgW2tleTogc3RyaW5nXTogQW5pbVBpZWNlXG59XG5cbmZ1bmN0aW9uIG1ha2VQaWVjZShrZXk6IGNnLktleSwgcGllY2U6IGNnLlBpZWNlKTogQW5pbVBpZWNlIHtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBwb3M6IHV0aWwua2V5MnBvcyhrZXkpLFxuICAgIHBpZWNlOiBwaWVjZVxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogY2cuUGllY2VzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0ge30sXG4gIGFuaW1lZE9yaWdzOiBjZy5LZXlbXSA9IFtdLFxuICBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IHt9LFxuICBtaXNzaW5nczogQW5pbVBpZWNlW10gPSBbXSxcbiAgbmV3czogQW5pbVBpZWNlW10gPSBbXSxcbiAgcHJlUGllY2VzOiBBbmltUGllY2VzID0ge307XG4gIGxldCBjdXJQOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCwgcHJlUDogQW5pbVBpZWNlIHwgdW5kZWZpbmVkLCBpOiBhbnksIHZlY3RvcjogY2cuTnVtYmVyUGFpcjtcbiAgZm9yIChpIGluIHByZXZQaWVjZXMpIHtcbiAgICBwcmVQaWVjZXNbaV0gPSBtYWtlUGllY2UoaSBhcyBjZy5LZXksIHByZXZQaWVjZXNbaV0hKTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLmFsbEtleXMpIHtcbiAgICBjdXJQID0gY3VycmVudC5waWVjZXNba2V5XTtcbiAgICBwcmVQID0gcHJlUGllY2VzW2tleV07XG4gICAgaWYgKGN1clApIHtcbiAgICAgIGlmIChwcmVQKSB7XG4gICAgICAgIGlmICghdXRpbC5zYW1lUGllY2UoY3VyUCwgcHJlUC5waWVjZSkpIHtcbiAgICAgICAgICBtaXNzaW5ncy5wdXNoKHByZVApO1xuICAgICAgICAgIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgIH0gZWxzZSBpZiAocHJlUCkgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgfVxuICBuZXdzLmZvckVhY2gobmV3UCA9PiB7XG4gICAgcHJlUCA9IGNsb3NlcihuZXdQLCBtaXNzaW5ncy5maWx0ZXIocCA9PiB1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkpO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICB2ZWN0b3IgPSBbcHJlUC5wb3NbMF0gLSBuZXdQLnBvc1swXSwgcHJlUC5wb3NbMV0gLSBuZXdQLnBvc1sxXV07XG4gICAgICBhbmltc1tuZXdQLmtleV0gPSB2ZWN0b3IuY29uY2F0KHZlY3RvcikgYXMgQW5pbVZlY3RvcjtcbiAgICAgIGFuaW1lZE9yaWdzLnB1c2gocHJlUC5rZXkpO1xuICAgIH1cbiAgfSk7XG4gIG1pc3NpbmdzLmZvckVhY2gocCA9PiB7XG4gICAgaWYgKCF1dGlsLmNvbnRhaW5zWChhbmltZWRPcmlncywgcC5rZXkpKSBmYWRpbmdzW3Aua2V5XSA9IHAucGllY2U7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgYW5pbXM6IGFuaW1zLFxuICAgIGZhZGluZ3M6IGZhZGluZ3NcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RlcChzdGF0ZTogU3RhdGUsIG5vdzogRE9NSGlnaFJlc1RpbWVTdGFtcCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudDtcbiAgaWYgKGN1ciA9PT0gdW5kZWZpbmVkKSB7IC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGxldCBpIGluIGN1ci5wbGFuLmFuaW1zKSB7XG4gICAgICBjb25zdCBjZmcgPSBjdXIucGxhbi5hbmltc1tpXTtcbiAgICAgIGNmZ1syXSA9IGNmZ1swXSAqIGVhc2U7XG4gICAgICBjZmdbM10gPSBjZmdbMV0gKiBlYXNlO1xuICAgIH1cbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KHRydWUpOyAvLyBvcHRpbWlzYXRpb246IGRvbid0IHJlbmRlciBTVkcgY2hhbmdlcyBkdXJpbmcgYW5pbWF0aW9uc1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgobm93ID0gcGVyZm9ybWFuY2Uubm93KCkpID0+IHN0ZXAoc3RhdGUsIG5vdykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGU8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgLy8gY2xvbmUgc3RhdGUgYmVmb3JlIG11dGF0aW5nIGl0XG4gIGNvbnN0IHByZXZQaWVjZXM6IGNnLlBpZWNlcyA9IHsuLi5zdGF0ZS5waWVjZXN9O1xuXG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgY29uc3QgcGxhbiA9IGNvbXB1dGVQbGFuKHByZXZQaWVjZXMsIHN0YXRlKTtcbiAgaWYgKCFpc09iamVjdEVtcHR5KHBsYW4uYW5pbXMpIHx8ICFpc09iamVjdEVtcHR5KHBsYW4uZmFkaW5ncykpIHtcbiAgICBjb25zdCBhbHJlYWR5UnVubmluZyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ICYmIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50LnN0YXJ0O1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgZnJlcXVlbmN5OiAxIC8gc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uLFxuICAgICAgcGxhbjogcGxhblxuICAgIH07XG4gICAgaWYgKCFhbHJlYWR5UnVubmluZykgc3RlcChzdGF0ZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvbid0IGFuaW1hdGUsIGp1c3QgcmVuZGVyIHJpZ2h0IGF3YXlcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNPYmplY3RFbXB0eShvOiBhbnkpOiBib29sZWFuIHtcbiAgZm9yIChsZXQgXyBpbiBvKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbmZ1bmN0aW9uIGVhc2luZyh0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgd3JpdGUgYXMgZmVuV3JpdGUgfSBmcm9tICcuL2ZlbidcbmltcG9ydCB7IENvbmZpZywgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0nXG5pbXBvcnQgeyBjYW5jZWwgYXMgZHJhZ0NhbmNlbCwgZHJhZ05ld1BpZWNlIH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0IHsgRHJhd1NoYXBlIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0IGV4cGxvc2lvbiBmcm9tICcuL2V4cGxvc2lvbidcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBpIHtcblxuICAvLyByZWNvbmZpZ3VyZSB0aGUgaW5zdGFuY2UuIEFjY2VwdHMgYWxsIGNvbmZpZyBvcHRpb25zLCBleGNlcHQgZm9yIHZpZXdPbmx5ICYgZHJhd2FibGUudmlzaWJsZS5cbiAgLy8gYm9hcmQgd2lsbCBiZSBhbmltYXRlZCBhY2NvcmRpbmdseSwgaWYgYW5pbWF0aW9ucyBhcmUgZW5hYmxlZC5cbiAgc2V0KGNvbmZpZzogQ29uZmlnKTogdm9pZDtcblxuICAvLyByZWFkIGNoZXNzZ3JvdW5kIHN0YXRlOyB3cml0ZSBhdCB5b3VyIG93biByaXNrcy5cbiAgc3RhdGU6IFN0YXRlO1xuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gYXMgYSBGRU4gc3RyaW5nIChvbmx5IGNvbnRhaW5zIHBpZWNlcywgbm8gZmxhZ3MpXG4gIC8vIGUuZy4gcm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUlxuICBnZXRGZW4oKTogY2cuRkVOO1xuXG4gIC8vIGNoYW5nZSB0aGUgdmlldyBhbmdsZVxuICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBtb3ZlIHByb2dyYW1tYXRpY2FsbHlcbiAgbW92ZShvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IHZvaWQ7XG5cbiAgLy8gYWRkIGFuZC9vciByZW1vdmUgYXJiaXRyYXJ5IHBpZWNlcyBvbiB0aGUgYm9hcmRcbiAgc2V0UGllY2VzKHBpZWNlczogY2cuUGllY2VzRGlmZik6IHZvaWQ7XG5cbiAgLy8gY2xpY2sgYSBzcXVhcmUgcHJvZ3JhbW1hdGljYWxseVxuICBzZWxlY3RTcXVhcmUoa2V5OiBjZy5LZXkgfCBudWxsLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHB1dCBhIG5ldyBwaWVjZSBvbiB0aGUgYm9hcmRcbiAgbmV3UGllY2UocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZW1vdmUoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55XG4gIGNhbmNlbFByZW1vdmUoKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlZHJvcCh2YWxpZGF0ZTogKGRyb3A6IGNnLkRyb3ApID0+IGJvb2xlYW4pOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnlcbiAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBtb3ZlIGJlaW5nIG1hZGVcbiAgY2FuY2VsTW92ZSgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCBjdXJyZW50IG1vdmUgYW5kIHByZXZlbnQgZnVydGhlciBvbmVzXG4gIHN0b3AoKTogdm9pZDtcblxuICAvLyBtYWtlIHNxdWFyZXMgZXhwbG9kZSAoYXRvbWljIGNoZXNzKVxuICBleHBsb2RlKGtleXM6IGNnLktleVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgdXNlciBzaGFwZXNcbiAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyBhdXRvIHNoYXBlc1xuICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHNxdWFyZSBuYW1lIGF0IHRoaXMgRE9NIHBvc2l0aW9uIChsaWtlIFwiZTRcIilcbiAgZ2V0S2V5QXREb21Qb3MocG9zOiBjZy5OdW1iZXJQYWlyKTogY2cuS2V5IHwgdW5kZWZpbmVkO1xuXG4gIC8vIG9ubHkgdXNlZnVsIHdoZW4gQ1NTIGNoYW5nZXMgdGhlIGJvYXJkIHdpZHRoL2hlaWdodCByYXRpbyAoZm9yIDNEKVxuICByZWRyYXdBbGw6IGNnLlJlZHJhdztcblxuICAvLyBmb3IgY3Jhenlob3VzZSBhbmQgYm9hcmQgZWRpdG9yc1xuICBkcmFnTmV3UGllY2UocGllY2U6IGNnLlBpZWNlLCBldmVudDogY2cuTW91Y2hFdmVudCwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyB1bmJpbmRzIGFsbCBldmVudHNcbiAgLy8gKGltcG9ydGFudCBmb3IgZG9jdW1lbnQtd2lkZSBldmVudHMgbGlrZSBzY3JvbGwgYW5kIG1vdXNlbW92ZSlcbiAgZGVzdHJveTogY2cuVW5iaW5kXG59XG5cbi8vIHNlZSBBUEkgdHlwZXMgYW5kIGRvY3VtZW50YXRpb25zIGluIGR0cy9hcGkuZC50c1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgcmVkcmF3QWxsOiBjZy5SZWRyYXcpOiBBcGkge1xuXG4gIGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKCkge1xuICAgIGJvYXJkLnRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlKTtcbiAgICByZWRyYXdBbGwoKTtcbiAgfTtcblxuICByZXR1cm4ge1xuXG4gICAgc2V0KGNvbmZpZykge1xuICAgICAgaWYgKGNvbmZpZy5vcmllbnRhdGlvbiAmJiBjb25maWcub3JpZW50YXRpb24gIT09IHN0YXRlLm9yaWVudGF0aW9uKSB0b2dnbGVPcmllbnRhdGlvbigpO1xuICAgICAgKGNvbmZpZy5mZW4gPyBhbmltIDogcmVuZGVyKShzdGF0ZSA9PiBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RhdGUsXG5cbiAgICBnZXRGZW46ICgpID0+IGZlbldyaXRlKHN0YXRlLnBpZWNlcyksXG5cbiAgICB0b2dnbGVPcmllbnRhdGlvbixcblxuICAgIHNldFBpZWNlcyhwaWVjZXMpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNlbGVjdFNxdWFyZShrZXksIGZvcmNlKSB7XG4gICAgICBpZiAoa2V5KSBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwga2V5LCBmb3JjZSksIHN0YXRlKTtcbiAgICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3ZlKG9yaWcsIGRlc3QpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIG5ld1BpZWNlKHBpZWNlLCBrZXkpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwga2V5KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBwbGF5UHJlbW92ZSgpIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZW1vdmUsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVtb3ZlIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgcGxheVByZWRyb3AodmFsaWRhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBib2FyZC5wbGF5UHJlZHJvcChzdGF0ZSwgdmFsaWRhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZW1vdmUoKSB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVtb3ZlLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZWRyb3AoKSB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE1vdmUoKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4geyBib2FyZC5jYW5jZWxNb3ZlKHN0YXRlKTsgZHJhZ0NhbmNlbChzdGF0ZSk7IH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RvcCgpIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiB7IGJvYXJkLnN0b3Aoc3RhdGUpOyBkcmFnQ2FuY2VsKHN0YXRlKTsgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBleHBsb2RlKGtleXM6IGNnLktleVtdKSB7XG4gICAgICBleHBsb3Npb24oc3RhdGUsIGtleXMpO1xuICAgIH0sXG5cbiAgICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiBzdGF0ZS5kcmF3YWJsZS5hdXRvU2hhcGVzID0gc2hhcGVzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gc2hhcGVzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGdldEtleUF0RG9tUG9zKHBvcykge1xuICAgICAgcmV0dXJuIGJvYXJkLmdldEtleUF0RG9tUG9zKHBvcywgYm9hcmQud2hpdGVQb3Yoc3RhdGUpLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgIH0sXG5cbiAgICByZWRyYXdBbGwsXG5cbiAgICBkcmFnTmV3UGllY2UocGllY2UsIGV2ZW50LCBmb3JjZSkge1xuICAgICAgZHJhZ05ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZXZlbnQsIGZvcmNlKVxuICAgIH0sXG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICBzdGF0ZS5kb20udW5iaW5kICYmIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHBvczJrZXksIGtleTJwb3MsIG9wcG9zaXRlLCBjb250YWluc1ggfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgcHJlbW92ZSBmcm9tICcuL3ByZW1vdmUnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBDYWxsYmFjayA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb24oZjogQ2FsbGJhY2sgfCB1bmRlZmluZWQsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgc3RhdGUuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubGFzdE1vdmUgPSB1bmRlZmluZWQ7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpZWNlcyhzdGF0ZTogU3RhdGUsIHBpZWNlczogY2cuUGllY2VzRGlmZik6IHZvaWQge1xuICBmb3IgKGxldCBrZXkgaW4gcGllY2VzKSB7XG4gICAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgICBpZiAocGllY2UpIHN0YXRlLnBpZWNlc1trZXldID0gcGllY2U7XG4gICAgZWxzZSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrKHN0YXRlOiBTdGF0ZSwgY29sb3I6IGNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbG9yID09PSB0cnVlKSBjb2xvciA9IHN0YXRlLnR1cm5Db2xvcjtcbiAgaWYgKGNvbG9yKSBmb3IgKGxldCBrIGluIHN0YXRlLnBpZWNlcykge1xuICAgIGlmIChzdGF0ZS5waWVjZXNba10hLnJvbGUgPT09ICdraW5nJyAmJiBzdGF0ZS5waWVjZXNba10hLmNvbG9yID09PSBjb2xvcikge1xuICAgICAgc3RhdGUuY2hlY2sgPSBrIGFzIGNnLktleTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlbW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhOiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpOiB2b2lkIHtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gW29yaWcsIGRlc3RdO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgbWV0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlZHJvcChzdGF0ZTogU3RhdGUsIHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5KTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyByb2xlLCBrZXkgfTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVkcm9wcGFibGUuZXZlbnRzLnNldCwgcm9sZSwga2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlZHJvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgcGQgPSBzdGF0ZS5wcmVkcm9wcGFibGU7XG4gIGlmIChwZC5jdXJyZW50KSB7XG4gICAgcGQuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHBkLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJ5QXV0b0Nhc3RsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmICghc3RhdGUuYXV0b0Nhc3RsZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBraW5nID0gc3RhdGUucGllY2VzW29yaWddO1xuICBpZiAoIWtpbmcgfHwga2luZy5yb2xlICE9PSAna2luZycpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZ1BvcyA9IGtleTJwb3Mob3JpZyk7XG4gIGlmIChvcmlnUG9zWzBdICE9PSA1KSByZXR1cm4gZmFsc2U7XG4gIGlmIChvcmlnUG9zWzFdICE9PSAxICYmIG9yaWdQb3NbMV0gIT09IDgpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgZGVzdFBvcyA9IGtleTJwb3MoZGVzdCk7XG4gIGxldCBvbGRSb29rUG9zLCBuZXdSb29rUG9zLCBuZXdLaW5nUG9zO1xuICBpZiAoZGVzdFBvc1swXSA9PT0gNyB8fCBkZXN0UG9zWzBdID09PSA4KSB7XG4gICAgb2xkUm9va1BvcyA9IHBvczJrZXkoWzgsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdSb29rUG9zID0gcG9zMmtleShbNiwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld0tpbmdQb3MgPSBwb3Mya2V5KFs3LCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSBpZiAoZGVzdFBvc1swXSA9PT0gMyB8fCBkZXN0UG9zWzBdID09PSAxKSB7XG4gICAgb2xkUm9va1BvcyA9IHBvczJrZXkoWzEsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdSb29rUG9zID0gcG9zMmtleShbNCwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld0tpbmdQb3MgPSBwb3Mya2V5KFszLCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgcm9vayA9IHN0YXRlLnBpZWNlc1tvbGRSb29rUG9zXTtcbiAgaWYgKCFyb29rIHx8IHJvb2sucm9sZSAhPT0gJ3Jvb2snKSByZXR1cm4gZmFsc2U7XG5cbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvbGRSb29rUG9zXTtcblxuICBzdGF0ZS5waWVjZXNbbmV3S2luZ1Bvc10gPSBraW5nXG4gIHN0YXRlLnBpZWNlc1tuZXdSb29rUG9zXSA9IHJvb2s7XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZU1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IG9yaWdQaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXSwgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzW2Rlc3RdO1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkID0gKGRlc3RQaWVjZSAmJiBkZXN0UGllY2UuY29sb3IgIT09IG9yaWdQaWVjZS5jb2xvcikgPyBkZXN0UGllY2UgOiB1bmRlZmluZWQ7XG4gIGlmIChkZXN0ID09IHN0YXRlLnNlbGVjdGVkKSB1bnNlbGVjdChzdGF0ZSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLm1vdmUsIG9yaWcsIGRlc3QsIGNhcHR1cmVkKTtcbiAgaWYgKCF0cnlBdXRvQ2FzdGxlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHN0YXRlLnBpZWNlc1tkZXN0XSA9IG9yaWdQaWVjZTtcbiAgICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICB9XG4gIHN0YXRlLmxhc3RNb3ZlID0gW29yaWcsIGRlc3RdO1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgcmV0dXJuIGNhcHR1cmVkIHx8IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5LCBmb3JjZT86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgaWYgKHN0YXRlLnBpZWNlc1trZXldKSB7XG4gICAgaWYgKGZvcmNlKSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcE5ld1BpZWNlLCBwaWVjZSwga2V5KTtcbiAgc3RhdGUucGllY2VzW2tleV0gPSBwaWVjZTtcbiAgc3RhdGUubGFzdE1vdmUgPSBba2V5XTtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IGhvbGRUaW1lID0gc3RhdGUuaG9sZC5zdG9wKCk7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjb25zdCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhID0ge1xuICAgICAgICBwcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleSxcbiAgICAgICAgaG9sZFRpbWVcbiAgICAgIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIG1ldGFkYXRhKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHtcbiAgICAgIGN0cmxLZXk6IHN0YXRlLnN0YXRzLmN0cmxLZXlcbiAgICB9KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBmb3JjZSkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddITtcbiAgICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICAgIGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRlc3QsIGZvcmNlKTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyTmV3UGllY2UsIHBpZWNlLnJvbGUsIGRlc3QsIHtcbiAgICAgIHByZWRyb3A6IGZhbHNlXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBzdGF0ZS5waWVjZXNbb3JpZ10hLnJvbGUsIGRlc3QpO1xuICB9IGVsc2Uge1xuICAgIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gICAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgfVxuICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoc3RhdGU6IFN0YXRlLCBrZXk6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnNlbGVjdCwga2V5KTtcbiAgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkID09PSBrZXkgJiYgIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkKSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBzdGF0ZS5ob2xkLmNhbmNlbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiYgc3RhdGUuc2VsZWN0ZWQgIT09IGtleSkge1xuICAgICAgaWYgKHVzZXJNb3ZlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCwga2V5KSkge1xuICAgICAgICBzdGF0ZS5zdGF0cy5kcmFnZ2VkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGlzTW92YWJsZShzdGF0ZSwga2V5KSB8fCBpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgICBzdGF0ZS5ob2xkLnN0YXJ0KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHN0YXRlOiBTdGF0ZSwga2V5OiBjZy5LZXkpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPSBrZXk7XG4gIGlmIChpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gcHJlbW92ZShzdGF0ZS5waWVjZXMsIGtleSwgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpO1xuICB9XG4gIGVsc2Ugc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2VsZWN0KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5zZWxlY3RlZCA9IHVuZGVmaW5lZDtcbiAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuaG9sZC5jYW5jZWwoKTtcbn1cblxuZnVuY3Rpb24gaXNNb3ZhYmxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ2JvdGgnIHx8IChcbiAgICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3JcbiAgICApKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbk1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3JpZyAhPT0gZGVzdCAmJiBpc01vdmFibGUoc3RhdGUsIG9yaWcpICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmZyZWUgfHwgKCEhc3RhdGUubW92YWJsZS5kZXN0cyAmJiBjb250YWluc1goc3RhdGUubW92YWJsZS5kZXN0c1tvcmlnXSwgZGVzdCkpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNhbkRyb3Aoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgZGVzdCAmJiAob3JpZyA9PT0gZGVzdCB8fCAhc3RhdGUucGllY2VzW2Rlc3RdKSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ2JvdGgnIHx8IChcbiAgICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3JcbiAgICApKTtcbn1cblxuXG5mdW5jdGlvbiBpc1ByZW1vdmFibGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3JpZyAhPT0gZGVzdCAmJlxuICBpc1ByZW1vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gIGNvbnRhaW5zWChwcmVtb3ZlKHN0YXRlLnBpZWNlcywgb3JpZywgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gY2FuUHJlZHJvcChzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICBjb25zdCBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXNbZGVzdF07XG4gIHJldHVybiAhIXBpZWNlICYmIGRlc3QgJiZcbiAgKCFkZXN0UGllY2UgfHwgZGVzdFBpZWNlLmNvbG9yICE9PSBzdGF0ZS5tb3ZhYmxlLmNvbG9yKSAmJlxuICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAocGllY2Uucm9sZSAhPT0gJ3Bhd24nIHx8IChkZXN0WzFdICE9PSAnMScgJiYgZGVzdFsxXSAhPT0gJzgnKSkgJiZcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEcmFnZ2FibGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiYgKFxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZFxuICAgICAgKVxuICAgIClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtb3ZlID0gc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZyA9IG1vdmVbMF0sIGRlc3QgPSBtb3ZlWzFdO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1vdmU6IHRydWUgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZWRyb3Aoc3RhdGU6IFN0YXRlLCB2YWxpZGF0ZTogKGRyb3A6IGNnLkRyb3ApID0+IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgbGV0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCxcbiAgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoIWRyb3ApIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkYXRlKGRyb3ApKSB7XG4gICAgY29uc3QgcGllY2UgPSB7XG4gICAgICByb2xlOiBkcm9wLnJvbGUsXG4gICAgICBjb2xvcjogc3RhdGUubW92YWJsZS5jb2xvclxuICAgIH0gYXMgY2cuUGllY2U7XG4gICAgaWYgKGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRyb3Aua2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlck5ld1BpZWNlLCBkcm9wLnJvbGUsIGRyb3Aua2V5LCB7XG4gICAgICAgIHByZWRyb3A6IHRydWVcbiAgICAgIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZShzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9XG4gIHN0YXRlLm1vdmFibGUuZGVzdHMgPVxuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZShzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhwb3M6IGNnLk51bWJlclBhaXIsIGFzV2hpdGU6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IGNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5jZWlsKDggKiAoKHBvc1swXSAtIGJvdW5kcy5sZWZ0KSAvIGJvdW5kcy53aWR0aCkpO1xuICBpZiAoIWFzV2hpdGUpIGZpbGUgPSA5IC0gZmlsZTtcbiAgbGV0IHJhbmsgPSBNYXRoLmNlaWwoOCAtICg4ICogKChwb3NbMV0gLSBib3VuZHMudG9wKSAvIGJvdW5kcy5oZWlnaHQpKSk7XG4gIGlmICghYXNXaGl0ZSkgcmFuayA9IDkgLSByYW5rO1xuICByZXR1cm4gKGZpbGUgPiAwICYmIGZpbGUgPCA5ICYmIHJhbmsgPiAwICYmIHJhbmsgPCA5KSA/IHBvczJrZXkoW2ZpbGUsIHJhbmtdKSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoaXRlUG92KHM6IFN0YXRlKTogYm9vbGVhbiB7XG4gIHJldHVybiBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnO1xufVxuIiwiaW1wb3J0IHsgQXBpLCBzdGFydCB9IGZyb20gJy4vYXBpJ1xuaW1wb3J0IHsgQ29uZmlnLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IFN0YXRlLCBkZWZhdWx0cyB9IGZyb20gJy4vc3RhdGUnXG5cbmltcG9ydCByZW5kZXJXcmFwIGZyb20gJy4vd3JhcCc7XG5pbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnLi9ldmVudHMnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJztcbmltcG9ydCAqIGFzIHN2ZyBmcm9tICcuL3N2Zyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVzc2dyb3VuZChlbGVtZW50OiBIVE1MRWxlbWVudCwgY29uZmlnPzogQ29uZmlnKTogQXBpIHtcblxuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG5cbiAgY29uZmlndXJlKHN0YXRlLCBjb25maWcgfHwge30pO1xuXG4gIGZ1bmN0aW9uIHJlZHJhd0FsbCgpIHtcbiAgICBsZXQgcHJldlVuYmluZCA9IHN0YXRlLmRvbSAmJiBzdGF0ZS5kb20udW5iaW5kO1xuICAgIC8vIGNvbXB1dGUgYm91bmRzIGZyb20gZXhpc3RpbmcgYm9hcmQgZWxlbWVudCBpZiBwb3NzaWJsZVxuICAgIC8vIHRoaXMgYWxsb3dzIG5vbi1zcXVhcmUgYm9hcmRzIGZyb20gQ1NTIHRvIGJlIGhhbmRsZWQgKGZvciAzRClcbiAgICBjb25zdCByZWxhdGl2ZSA9IHN0YXRlLnZpZXdPbmx5ICYmICFzdGF0ZS5kcmF3YWJsZS52aXNpYmxlLFxuICAgIGVsZW1lbnRzID0gcmVuZGVyV3JhcChlbGVtZW50LCBzdGF0ZSwgcmVsYXRpdmUpLFxuICAgIGJvdW5kcyA9IHV0aWwubWVtbygoKSA9PiBlbGVtZW50cy5ib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSksXG4gICAgcmVkcmF3Tm93ID0gKHNraXBTdmc/OiBib29sZWFuKSA9PiB7XG4gICAgICByZW5kZXIoc3RhdGUpO1xuICAgICAgaWYgKCFza2lwU3ZnICYmIGVsZW1lbnRzLnN2Zykgc3ZnLnJlbmRlclN2ZyhzdGF0ZSwgZWxlbWVudHMuc3ZnKTtcbiAgICB9O1xuICAgIHN0YXRlLmRvbSA9IHtcbiAgICAgIGVsZW1lbnRzLFxuICAgICAgYm91bmRzLFxuICAgICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdOb3cpLFxuICAgICAgcmVkcmF3Tm93LFxuICAgICAgdW5iaW5kOiBwcmV2VW5iaW5kLFxuICAgICAgcmVsYXRpdmVcbiAgICB9O1xuICAgIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gJyc7XG4gICAgcmVkcmF3Tm93KGZhbHNlKTtcbiAgICBldmVudHMuYmluZEJvYXJkKHN0YXRlKTtcbiAgICBpZiAoIXByZXZVbmJpbmQpIHN0YXRlLmRvbS51bmJpbmQgPSBldmVudHMuYmluZERvY3VtZW50KHN0YXRlLCByZWRyYXdBbGwpO1xuICAgIHN0YXRlLmV2ZW50cy5pbnNlcnQgJiYgc3RhdGUuZXZlbnRzLmluc2VydChlbGVtZW50cyk7XG4gIH1cbiAgcmVkcmF3QWxsKCk7XG5cbiAgcmV0dXJuIHN0YXJ0KHN0YXRlLCByZWRyYXdBbGwpO1xufTtcblxuZnVuY3Rpb24gZGVib3VuY2VSZWRyYXcocmVkcmF3Tm93OiAoc2tpcFN2Zz86IGJvb2xlYW4pID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgbGV0IHJlZHJhd2luZyA9IGZhbHNlO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICByZWRyYXdOb3coKTtcbiAgICAgIHJlZHJhd2luZyA9IGZhbHNlO1xuICAgIH0pO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgc2V0Q2hlY2ssIHNldFNlbGVjdGVkIH0gZnJvbSAnLi9ib2FyZCdcbmltcG9ydCB7IHJlYWQgYXMgZmVuUmVhZCB9IGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgRHJhd1NoYXBlLCBEcmF3QnJ1c2ggfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gIGZlbj86IGNnLkZFTjsgLy8gY2hlc3MgcG9zaXRpb24gaW4gRm9yc3l0aCBub3RhdGlvblxuICBvcmllbnRhdGlvbj86IGNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gd2hpdGUgfCBibGFja1xuICB0dXJuQ29sb3I/OiBjZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiB3aGl0ZSB8IGJsYWNrXG4gIGNoZWNrPzogY2cuQ29sb3IgfCBib29sZWFuOyAvLyB0cnVlIGZvciBjdXJyZW50IGNvbG9yLCBmYWxzZSB0byB1bnNldFxuICBsYXN0TW92ZT86IGNnLktleVtdOyAvLyBzcXVhcmVzIHBhcnQgb2YgdGhlIGxhc3QgbW92ZSBbXCJjM1wiLCBcImM0XCJdXG4gIHNlbGVjdGVkPzogY2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiYTFcIlxuICBjb29yZGluYXRlcz86IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgYXV0b0Nhc3RsZT86IGJvb2xlYW47IC8vIGltbWVkaWF0ZWx5IGNvbXBsZXRlIHRoZSBjYXN0bGUgYnkgbW92aW5nIHRoZSByb29rIGFmdGVyIGtpbmcgbW92ZVxuICB2aWV3T25seT86IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIGRpc2FibGVDb250ZXh0TWVudT86IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgY2hlc3Nib2FyZFxuICByZXNpemFibGU/OiBib29sZWFuOyAvLyBsaXN0ZW5zIHRvIGNoZXNzZ3JvdW5kLnJlc2l6ZSBvbiBkb2N1bWVudC5ib2R5IHRvIGNsZWFyIGJvdW5kcyBjYWNoZVxuICBhZGRQaWVjZVpJbmRleD86IGJvb2xlYW47IC8vIGFkZHMgei1pbmRleCB2YWx1ZXMgdG8gcGllY2VzIChmb3IgM0QpXG4gIC8vIHBpZWNlS2V5OiBib29sZWFuOyAvLyBhZGQgYSBkYXRhLWtleSBhdHRyaWJ1dGUgdG8gcGllY2UgZWxlbWVudHNcbiAgaGlnaGxpZ2h0Pzoge1xuICAgIGxhc3RNb3ZlPzogYm9vbGVhbjsgLy8gYWRkIGxhc3QtbW92ZSBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2s/OiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb24/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47XG4gICAgZHVyYXRpb24/OiBudW1iZXI7XG4gIH07XG4gIG1vdmFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBjb2xvcj86IGNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlLiB3aGl0ZSB8IGJsYWNrIHwgYm90aCB8IHVuZGVmaW5lZFxuICAgIGRlc3RzPzoge1xuICAgICAgW2tleTogc3RyaW5nXTogY2cuS2V5W11cbiAgICB9OyAvLyB2YWxpZCBtb3Zlcy4ge1wiYTJcIiBbXCJhM1wiIFwiYTRcIl0gXCJiMVwiIFtcImEzXCIgXCJjM1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM/OiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgICAgYWZ0ZXJOZXdQaWVjZT86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIGEgbmV3IHBpZWNlIGlzIGRyb3BwZWQgb24gdGhlIGJvYXJkXG4gICAgfTtcbiAgICByb29rQ2FzdGxlPzogYm9vbGVhbiAvLyBjYXN0bGUgYnkgbW92aW5nIHRoZSBraW5nIHRvIHRoZSByb29rXG4gIH07XG4gIHByZW1vdmFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmVtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGNhc3RsZT86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWxsb3cga2luZyBjYXN0bGUgcHJlbW92ZXNcbiAgICBkZXN0cz86IGNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YT86IGNnLlNldFByZW1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBwcmVkcm9wcGFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIGV2ZW50cz86IHtcbiAgICAgIHNldD86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIGRyYWdnYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZT86IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZT86IGJvb2xlYW47IC8vIGxldHMgY2hlc3Nncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIGNlbnRlclBpZWNlPzogYm9vbGVhbjsgLy8gY2VudGVyIHRoZSBwaWVjZSBvbiBjdXJzb3IgYXQgZHJhZyBzdGFydFxuICAgIHNob3dHaG9zdD86IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIGRlbGV0ZU9uRHJvcE9mZj86IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkXG4gIH07XG4gIHNlbGVjdGFibGU/OiB7XG4gICAgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGVuYWJsZWQ/OiBib29sZWFuXG4gIH07XG4gIGV2ZW50cz86IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIC8vIGNhbGxlZCBhZnRlciBhIHBpZWNlIGhhcyBiZWVuIG1vdmVkLlxuICAgIC8vIGNhcHR1cmVkUGllY2UgaXMgdW5kZWZpbmVkIG9yIGxpa2Uge2NvbG9yOiAnd2hpdGUnOyAncm9sZSc6ICdxdWVlbid9XG4gICAgbW92ZT86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgY2FwdHVyZWRQaWVjZT86IGNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3BOZXdQaWVjZT86IChwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5KSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IGNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICBpbnNlcnQ/OiAoZWxlbWVudHM6IGNnLkVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICAgIHZpc2libGU/OiBib29sZWFuOyAvLyBjYW4gdmlld1xuICAgIGVyYXNlT25DbGljaz86IGJvb2xlYW47XG4gICAgc2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgYXV0b1NoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIGJydXNoZXM/OiBEcmF3QnJ1c2hbXTtcbiAgICBwaWVjZXM/OiB7XG4gICAgICBiYXNlVXJsPzogc3RyaW5nO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlKHN0YXRlOiBTdGF0ZSwgY29uZmlnOiBDb25maWcpIHtcblxuICAvLyBkb24ndCBtZXJnZSBkZXN0aW5hdGlvbnMuIEp1c3Qgb3ZlcnJpZGUuXG4gIGlmIChjb25maWcubW92YWJsZSAmJiBjb25maWcubW92YWJsZS5kZXN0cykgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcblxuICBtZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIGZlbiB3YXMgcHJvdmlkZWQsIHJlcGxhY2UgdGhlIHBpZWNlc1xuICBpZiAoY29uZmlnLmZlbikge1xuICAgIHN0YXRlLnBpZWNlcyA9IGZlblJlYWQoY29uZmlnLmZlbik7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gIH1cblxuICAvLyBhcHBseSBjb25maWcgdmFsdWVzIHRoYXQgY291bGQgYmUgdW5kZWZpbmVkIHlldCBtZWFuaW5nZnVsXG4gIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoJ2NoZWNrJykpIHNldENoZWNrKHN0YXRlLCBjb25maWcuY2hlY2sgfHwgZmFsc2UpO1xuICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KCdsYXN0TW92ZScpICYmICFjb25maWcubGFzdE1vdmUpIHN0YXRlLmxhc3RNb3ZlID0gdW5kZWZpbmVkO1xuICAvLyBpbiBjYXNlIG9mIFpIIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgLy8gaWYgdGhlIHByZXZpb3VzIGxhc3QgbW92ZSBoYWQgdHdvIHNxdWFyZXMsXG4gIC8vIHRoZSBtZXJnZSBhbGdvcml0aG0gd2lsbCBpbmNvcnJlY3RseSBrZWVwIHRoZSBzZWNvbmQgc3F1YXJlLlxuICBlbHNlIGlmIChjb25maWcubGFzdE1vdmUpIHN0YXRlLmxhc3RNb3ZlID0gY29uZmlnLmxhc3RNb3ZlO1xuXG4gIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgaWYgKHN0YXRlLnNlbGVjdGVkKSBzZXRTZWxlY3RlZChzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQpO1xuXG4gIC8vIG5vIG5lZWQgZm9yIHN1Y2ggc2hvcnQgYW5pbWF0aW9uc1xuICBpZiAoIXN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCBzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gPCAxMDApIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID0gZmFsc2U7XG5cbiAgaWYgKCFzdGF0ZS5tb3ZhYmxlLnJvb2tDYXN0bGUgJiYgc3RhdGUubW92YWJsZS5kZXN0cykge1xuICAgIGNvbnN0IHJhbmsgPSBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnd2hpdGUnID8gMSA6IDgsXG4gICAga2luZ1N0YXJ0UG9zID0gJ2UnICsgcmFuayxcbiAgICBkZXN0cyA9IHN0YXRlLm1vdmFibGUuZGVzdHNba2luZ1N0YXJ0UG9zXSxcbiAgICBraW5nID0gc3RhdGUucGllY2VzW2tpbmdTdGFydFBvc107XG4gICAgaWYgKCFkZXN0cyB8fCAha2luZyB8fCBraW5nLnJvbGUgIT09ICdraW5nJykgcmV0dXJuO1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHNba2luZ1N0YXJ0UG9zXSA9IGRlc3RzLmZpbHRlcihkID0+XG4gICAgICAhKChkID09PSAnYScgKyByYW5rKSAmJiBkZXN0cy5pbmRleE9mKCdjJyArIHJhbmsgYXMgY2cuS2V5KSAhPT0gLTEpICYmXG4gICAgICAgICEoKGQgPT09ICdoJyArIHJhbmspICYmIGRlc3RzLmluZGV4T2YoJ2cnICsgcmFuayBhcyBjZy5LZXkpICE9PSAtMSlcbiAgICApO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtZXJnZShiYXNlOiBhbnksIGV4dGVuZDogYW55KSB7XG4gIGZvciAobGV0IGtleSBpbiBleHRlbmQpIHtcbiAgICBpZiAoaXNPYmplY3QoYmFzZVtrZXldKSAmJiBpc09iamVjdChleHRlbmRba2V5XSkpIG1lcmdlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xuICAgIGVsc2UgYmFzZVtrZXldID0gZXh0ZW5kW2tleV07XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNPYmplY3QobzogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCc7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBjbGVhciBhcyBkcmF3Q2xlYXIgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbSdcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnQ3VycmVudCB7XG4gIG9yaWc6IGNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhZ2dpbmcgcGllY2VcbiAgb3JpZ1BvczogY2cuUG9zO1xuICBwaWVjZTogY2cuUGllY2U7XG4gIHJlbDogY2cuTnVtYmVyUGFpcjsgLy8geDsgeSBvZiB0aGUgcGllY2UgYXQgb3JpZ2luYWwgcG9zaXRpb25cbiAgZXBvczogY2cuTnVtYmVyUGFpcjsgLy8gaW5pdGlhbCBldmVudCBwb3NpdGlvblxuICBwb3M6IGNnLk51bWJlclBhaXI7IC8vIHJlbGF0aXZlIGN1cnJlbnQgcG9zaXRpb25cbiAgZGVjOiBjZy5OdW1iZXJQYWlyOyAvLyBwaWVjZSBjZW50ZXIgZGVjYXlcbiAgc3RhcnRlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgc3RhcnRlZDsgYXMgcGVyIHRoZSBkaXN0YW5jZSBzZXR0aW5nXG4gIGVsZW1lbnQ6IGNnLlBpZWNlTm9kZSB8ICgoKSA9PiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQpO1xuICBuZXdQaWVjZT86IGJvb2xlYW47IC8vIGl0IGl0IGEgbmV3IHBpZWNlIGZyb20gb3V0c2lkZSB0aGUgYm9hcmRcbiAgZm9yY2U/OiBib29sZWFuOyAvLyBjYW4gdGhlIG5ldyBwaWVjZSByZXBsYWNlIGFuIGV4aXN0aW5nIG9uZSAoZWRpdG9yKVxuICBwcmV2aW91c2x5U2VsZWN0ZWQ/OiBjZy5LZXk7XG4gIG9yaWdpblRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApIHJldHVybjsgLy8gb25seSB0b3VjaCBvciBsZWZ0IGNsaWNrXG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzKCksXG4gIHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXIsXG4gIG9yaWcgPSBib2FyZC5nZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgYm9hcmQud2hpdGVQb3YocyksIGJvdW5kcyk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBjb25zdCBwaWVjZSA9IHMucGllY2VzW29yaWddO1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWQgPSBzLnNlbGVjdGVkO1xuICBpZiAoIXByZXZpb3VzbHlTZWxlY3RlZCAmJiBzLmRyYXdhYmxlLmVuYWJsZWQgJiYgKFxuICAgIHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrIHx8ICghcGllY2UgfHwgcGllY2UuY29sb3IgIT09IHMudHVybkNvbG9yKVxuICApKSBkcmF3Q2xlYXIocyk7XG4gIC8vIFByZXZlbnQgdG91Y2ggc2Nyb2xsIGFuZCBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudCwgaWYgdGhlcmVcbiAgLy8gaXMgYW4gaW50ZW50IHRvIGludGVyYWN0IHdpdGggdGhlIGJvYXJkLiBJZiBubyBjb2xvciBpcyBtb3ZhYmxlXG4gIC8vIChhbmQgdGhlIGJvYXJkIGlzIG5vdCBmb3Igdmlld2luZyBvbmx5KSwgdG91Y2hlcyBhcmUgbGlrZWx5IGludGVuZGVkIHRvXG4gIC8vIHNlbGVjdCBzcXVhcmVzLlxuICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSAmJlxuICAgICAgKCFlLnRvdWNoZXMgfHwgIXMubW92YWJsZS5jb2xvciB8fCBwaWVjZSB8fCBwcmV2aW91c2x5U2VsZWN0ZWQgfHwgcGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uKSkpXG4gICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICBpZiAocy5zZWxlY3RlZCAmJiBib2FyZC5jYW5Nb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIG9yaWcpLCBzKTtcbiAgfSBlbHNlIHtcbiAgICBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gIH1cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWc7XG4gIGNvbnN0IGVsZW1lbnQgPSBwaWVjZUVsZW1lbnRCeUtleShzLCBvcmlnKTtcbiAgaWYgKHBpZWNlICYmIGVsZW1lbnQgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBvcmlnKSkge1xuICAgIGNvbnN0IHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMob3JpZywgYm9hcmQud2hpdGVQb3YocyksIGJvdW5kcyk7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIG9yaWcsXG4gICAgICBvcmlnUG9zOiB1dGlsLmtleTJwb3Mob3JpZyksXG4gICAgICBwaWVjZSxcbiAgICAgIHJlbDogcG9zaXRpb24sXG4gICAgICBlcG9zOiBwb3NpdGlvbixcbiAgICAgIHBvczogWzAsIDBdLFxuICAgICAgZGVjOiBzLmRyYWdnYWJsZS5jZW50ZXJQaWVjZSA/IFtcbiAgICAgICAgcG9zaXRpb25bMF0gLSAoc3F1YXJlQm91bmRzLmxlZnQgKyBzcXVhcmVCb3VuZHMud2lkdGggLyAyKSxcbiAgICAgICAgcG9zaXRpb25bMV0gLSAoc3F1YXJlQm91bmRzLnRvcCArIHNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyKVxuICAgICAgXSA6IFswLCAwXSxcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiBzLnN0YXRzLmRyYWdnZWQsXG4gICAgICBlbGVtZW50LFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldFxuICAgIH07XG4gICAgZWxlbWVudC5jZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG4gICAgLy8gcGxhY2UgZ2hvc3RcbiAgICBjb25zdCBnaG9zdCA9IHMuZG9tLmVsZW1lbnRzLmdob3N0O1xuICAgIGlmIChnaG9zdCkge1xuICAgICAgZ2hvc3QuY2xhc3NOYW1lID0gYGdob3N0ICR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xuICAgICAgdXRpbC50cmFuc2xhdGVBYnMoZ2hvc3QsIHV0aWwucG9zVG9UcmFuc2xhdGVBYnMoYm91bmRzKSh1dGlsLmtleTJwb3Mob3JpZyksIGJvYXJkLndoaXRlUG92KHMpKSk7XG4gICAgICB1dGlsLnNldFZpc2libGUoZ2hvc3QsIHRydWUpO1xuICAgIH1cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWVjZUNsb3NlVG8oczogU3RhdGUsIHBvczogY2cuTnVtYmVyUGFpcik6IGJvb2xlYW4ge1xuICBjb25zdCBhc1doaXRlID0gYm9hcmQud2hpdGVQb3YocyksXG4gIGJvdW5kcyA9IHMuZG9tLmJvdW5kcygpLFxuICByYWRpdXNTcSA9IE1hdGgucG93KGJvdW5kcy53aWR0aCAvIDgsIDIpO1xuICBmb3IgKGxldCBrZXkgaW4gcy5waWVjZXMpIHtcbiAgICBjb25zdCBzcXVhcmVCb3VuZHMgPSBjb21wdXRlU3F1YXJlQm91bmRzKGtleSBhcyBjZy5LZXksIGFzV2hpdGUsIGJvdW5kcyksXG4gICAgY2VudGVyOiBjZy5OdW1iZXJQYWlyID0gW1xuICAgICAgc3F1YXJlQm91bmRzLmxlZnQgKyBzcXVhcmVCb3VuZHMud2lkdGggLyAyLFxuICAgICAgc3F1YXJlQm91bmRzLnRvcCArIHNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyXG4gICAgXTtcbiAgICBpZiAodXRpbC5kaXN0YW5jZVNxKGNlbnRlciwgcG9zKSA8PSByYWRpdXNTcSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhZ05ld1BpZWNlKHM6IFN0YXRlLCBwaWVjZTogY2cuUGllY2UsIGU6IGNnLk1vdWNoRXZlbnQsIGZvcmNlPzogYm9vbGVhbik6IHZvaWQge1xuXG4gIGNvbnN0IGtleTogY2cuS2V5ID0gJ2EwJztcblxuICBzLnBpZWNlc1trZXldID0gcGllY2U7XG5cbiAgcy5kb20ucmVkcmF3KCk7XG5cbiAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcixcbiAgYXNXaGl0ZSA9IGJvYXJkLndoaXRlUG92KHMpLFxuICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgc3F1YXJlQm91bmRzID0gY29tcHV0ZVNxdWFyZUJvdW5kcyhrZXksIGFzV2hpdGUsIGJvdW5kcyk7XG5cbiAgY29uc3QgcmVsOiBjZy5OdW1iZXJQYWlyID0gW1xuICAgIChhc1doaXRlID8gMCA6IDcpICogc3F1YXJlQm91bmRzLndpZHRoICsgYm91bmRzLmxlZnQsXG4gICAgKGFzV2hpdGUgPyA4IDogLTEpICogc3F1YXJlQm91bmRzLmhlaWdodCArIGJvdW5kcy50b3BcbiAgXTtcblxuICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWc6IGtleSxcbiAgICBvcmlnUG9zOiB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICBwaWVjZSxcbiAgICByZWwsXG4gICAgZXBvczogcG9zaXRpb24sXG4gICAgcG9zOiBbcG9zaXRpb25bMF0gLSByZWxbMF0sIHBvc2l0aW9uWzFdIC0gcmVsWzFdXSxcbiAgICBkZWM6IFstc3F1YXJlQm91bmRzLndpZHRoIC8gMiwgLXNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyXSxcbiAgICBzdGFydGVkOiB0cnVlLFxuICAgIGVsZW1lbnQ6ICgpID0+IHBpZWNlRWxlbWVudEJ5S2V5KHMsIGtleSksXG4gICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICBuZXdQaWVjZTogdHJ1ZSxcbiAgICBmb3JjZTogISFmb3JjZVxuICB9O1xuICBwcm9jZXNzRHJhZyhzKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoczogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICAgIGlmICghY3VyKSByZXR1cm47XG4gICAgLy8gY2FuY2VsIGFuaW1hdGlvbnMgd2hpbGUgZHJhZ2dpbmdcbiAgICBpZiAocy5hbmltYXRpb24uY3VycmVudCAmJiBzLmFuaW1hdGlvbi5jdXJyZW50LnBsYW4uYW5pbXNbY3VyLm9yaWddKSBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBjb25zdCBvcmlnUGllY2UgPSBzLnBpZWNlc1tjdXIub3JpZ107XG4gICAgaWYgKCFvcmlnUGllY2UgfHwgIXV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKCFjdXIuc3RhcnRlZCAmJiB1dGlsLmRpc3RhbmNlU3EoY3VyLmVwb3MsIGN1ci5yZWwpID49IE1hdGgucG93KHMuZHJhZ2dhYmxlLmRpc3RhbmNlLCAyKSkgY3VyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKGN1ci5zdGFydGVkKSB7XG5cbiAgICAgICAgLy8gc3VwcG9ydCBsYXp5IGVsZW1lbnRzXG4gICAgICAgIGlmICh0eXBlb2YgY3VyLmVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBmb3VuZCA9IGN1ci5lbGVtZW50KCk7XG4gICAgICAgICAgaWYgKCFmb3VuZCkgcmV0dXJuO1xuICAgICAgICAgIGZvdW5kLmNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIGZvdW5kLmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG4gICAgICAgICAgY3VyLmVsZW1lbnQgPSBmb3VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1ci5wb3MgPSBbXG4gICAgICAgICAgY3VyLmVwb3NbMF0gLSBjdXIucmVsWzBdLFxuICAgICAgICAgIGN1ci5lcG9zWzFdIC0gY3VyLnJlbFsxXVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIG1vdmUgcGllY2VcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZG9tLmJvdW5kcygpKShjdXIub3JpZ1BvcywgYm9hcmQud2hpdGVQb3YocykpO1xuICAgICAgICB0cmFuc2xhdGlvblswXSArPSBjdXIucG9zWzBdICsgY3VyLmRlY1swXTtcbiAgICAgICAgdHJhbnNsYXRpb25bMV0gKz0gY3VyLnBvc1sxXSArIGN1ci5kZWNbMV07XG4gICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKGN1ci5lbGVtZW50LCB0cmFuc2xhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudC5lcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoIWN1cikgcmV0dXJuO1xuICAvLyBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudFxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UpIGUucHJldmVudERlZmF1bHQoKTtcbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGN1ciAmJiBjdXIub3JpZ2luVGFyZ2V0ICE9PSBlLnRhcmdldCAmJiAhY3VyLm5ld1BpZWNlKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm47XG4gIH1cbiAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIC8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbjsgc28gdXNlIHRoZSBsYXN0IHRvdWNobW92ZSBwb3NpdGlvbiBpbnN0ZWFkXG4gIGNvbnN0IGV2ZW50UG9zOiBjZy5OdW1iZXJQYWlyID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIHx8IGN1ci5lcG9zO1xuICBjb25zdCBkZXN0ID0gYm9hcmQuZ2V0S2V5QXREb21Qb3MoZXZlbnRQb3MsIGJvYXJkLndoaXRlUG92KHMpLCBzLmRvbS5ib3VuZHMoKSk7XG4gIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkICYmIGN1ci5vcmlnICE9PSBkZXN0KSB7XG4gICAgaWYgKGN1ci5uZXdQaWVjZSkgYm9hcmQuZHJvcE5ld1BpZWNlKHMsIGN1ci5vcmlnLCBkZXN0LCBjdXIuZm9yY2UpO1xuICAgIGVsc2Uge1xuICAgICAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICAgICAgaWYgKGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5vcmlnLCBkZXN0KSkgcy5zdGF0cy5kcmFnZ2VkID0gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY3VyLm5ld1BpZWNlKSB7XG4gICAgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgfSBlbHNlIGlmIChzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiYgIWRlc3QpIHtcbiAgICBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIGJvYXJkLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuICBpZiAoY3VyICYmIGN1ci5vcmlnID09PSBjdXIucHJldmlvdXNseVNlbGVjdGVkICYmIChjdXIub3JpZyA9PT0gZGVzdCB8fCAhZGVzdCkpXG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gIGVsc2UgaWYgKCFzLnNlbGVjdGFibGUuZW5hYmxlZCkgYm9hcmQudW5zZWxlY3Qocyk7XG5cbiAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBpZiAoY3VyLm5ld1BpZWNlKSBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gICAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZURyYWdFbGVtZW50cyhzOiBTdGF0ZSkge1xuICBjb25zdCBlID0gcy5kb20uZWxlbWVudHM7XG4gIGlmIChlLmdob3N0KSB1dGlsLnNldFZpc2libGUoZS5naG9zdCwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQm91bmRzKGtleTogY2cuS2V5LCBhc1doaXRlOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpIHtcbiAgY29uc3QgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIGlmICghYXNXaGl0ZSkge1xuICAgIHBvc1swXSA9IDkgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gOSAtIHBvc1sxXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGxlZnQ6IGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoICogKHBvc1swXSAtIDEpIC8gOCxcbiAgICB0b3A6IGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0ICogKDggLSBwb3NbMV0pIC8gOCxcbiAgICB3aWR0aDogYm91bmRzLndpZHRoIC8gOCxcbiAgICBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQgLyA4XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBpZWNlRWxlbWVudEJ5S2V5KHM6IFN0YXRlLCBrZXk6IGNnLktleSk6IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGxldCBlbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoZWwuY2dLZXkgPT09IGtleSAmJiBlbC50YWdOYW1lID09PSAnUElFQ0UnKSByZXR1cm4gZWw7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBjZy5QaWVjZU5vZGU7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlLCBnZXRLZXlBdERvbVBvcywgd2hpdGVQb3YgfSBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgZXZlbnRQb3NpdGlvbiwgaXNSaWdodEJ1dHRvbiB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlIHtcbiAgb3JpZzogY2cuS2V5O1xuICBkZXN0PzogY2cuS2V5O1xuICBicnVzaDogc3RyaW5nO1xuICBtb2RpZmllcnM/OiBEcmF3TW9kaWZpZXJzO1xuICBwaWVjZT86IERyYXdTaGFwZVBpZWNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZVBpZWNlIHtcbiAgcm9sZTogY2cuUm9sZTtcbiAgY29sb3I6IGNnLkNvbG9yO1xuICBzY2FsZT86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3QnJ1c2gge1xuICBrZXk6IHN0cmluZztcbiAgY29sb3I6IHN0cmluZztcbiAgb3BhY2l0eTogbnVtYmVyO1xuICBsaW5lV2lkdGg6IG51bWJlclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdCcnVzaGVzIHtcbiAgW25hbWU6IHN0cmluZ106IERyYXdCcnVzaDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3TW9kaWZpZXJzIHtcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdhYmxlIHtcbiAgZW5hYmxlZDogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgdmlzaWJsZTogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgZXJhc2VPbkNsaWNrOiBib29sZWFuO1xuICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkO1xuICBzaGFwZXM6IERyYXdTaGFwZVtdOyAvLyB1c2VyIHNoYXBlc1xuICBhdXRvU2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gY29tcHV0ZXIgc2hhcGVzXG4gIGN1cnJlbnQ/OiBEcmF3Q3VycmVudDtcbiAgYnJ1c2hlczogRHJhd0JydXNoZXM7XG4gIC8vIGRyYXdhYmxlIFNWRyBwaWVjZXM7IHVzZWQgZm9yIGNyYXp5aG91c2UgZHJvcFxuICBwaWVjZXM6IHtcbiAgICBiYXNlVXJsOiBzdHJpbmdcbiAgfSxcbiAgcHJldlN2Z0hhc2g6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdDdXJyZW50IHtcbiAgb3JpZzogY2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmF3aW5nXG4gIGRlc3Q/OiBjZy5LZXk7IC8vIHNoYXBlIGRlc3QsIG9yIHVuZGVmaW5lZCBmb3IgY2lyY2xlXG4gIG1vdXNlU3E/OiBjZy5LZXk7IC8vIHNxdWFyZSBiZWluZyBtb3VzZWQgb3ZlclxuICBwb3M6IGNnLk51bWJlclBhaXI7IC8vIHJlbGF0aXZlIGN1cnJlbnQgcG9zaXRpb25cbiAgYnJ1c2g6IHN0cmluZzsgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbn1cblxuY29uc3QgYnJ1c2hlcyA9IFsnZ3JlZW4nLCAncmVkJywgJ2JsdWUnLCAneWVsbG93J107XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuOyAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGUuY3RybEtleSA/IHVuc2VsZWN0KHN0YXRlKSA6IGNhbmNlbE1vdmUoc3RhdGUpO1xuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXIsXG4gIG9yaWcgPSBnZXRLZXlBdERvbVBvcyhwb3MsIHdoaXRlUG92KHN0YXRlKSwgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZyxcbiAgICBwb3MsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSlcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0RyYXcoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudDtcbiAgICBpZiAoY3VyKSB7XG4gICAgICBjb25zdCBtb3VzZVNxID0gZ2V0S2V5QXREb21Qb3MoY3VyLnBvcywgd2hpdGVQb3Yoc3RhdGUpLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgICAgaWYgKG1vdXNlU3EgIT09IGN1ci5tb3VzZVNxKSB7XG4gICAgICAgIGN1ci5tb3VzZVNxID0gbW91c2VTcTtcbiAgICAgICAgY3VyLmRlc3QgPSBtb3VzZVNxICE9PSBjdXIub3JpZyA/IG1vdXNlU3EgOiB1bmRlZmluZWQ7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQucG9zID0gZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICBpZiAoY3VyKSB7XG4gICAgaWYgKGN1ci5tb3VzZVNxKSBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICBjYW5jZWwoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuc2hhcGVzLmxlbmd0aCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBvbkNoYW5nZShzdGF0ZS5kcmF3YWJsZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRCcnVzaChlOiBjZy5Nb3VjaEV2ZW50KTogc3RyaW5nIHtcbiAgcmV0dXJuIGJydXNoZXNbKChlLnNoaWZ0S2V5IHx8IGUuY3RybEtleSkgJiYgaXNSaWdodEJ1dHRvbihlKSA/IDEgOiAwKSArIChlLmFsdEtleSA/IDIgOiAwKV07XG59XG5cbmZ1bmN0aW9uIGFkZFNoYXBlKGRyYXdhYmxlOiBEcmF3YWJsZSwgY3VyOiBEcmF3Q3VycmVudCk6IHZvaWQge1xuICBjb25zdCBzYW1lU2hhcGUgPSAoczogRHJhd1NoYXBlKSA9PiBzLm9yaWcgPT09IGN1ci5vcmlnICYmIHMuZGVzdCA9PT0gY3VyLmRlc3Q7XG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHNhbWVTaGFwZSlbMF07XG4gIGlmIChzaW1pbGFyKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHMgPT4gIXNhbWVTaGFwZShzKSk7XG4gIGlmICghc2ltaWxhciB8fCBzaW1pbGFyLmJydXNoICE9PSBjdXIuYnJ1c2gpIGRyYXdhYmxlLnNoYXBlcy5wdXNoKGN1cik7XG4gIG9uQ2hhbmdlKGRyYXdhYmxlKTtcbn1cblxuZnVuY3Rpb24gb25DaGFuZ2UoZHJhd2FibGU6IERyYXdhYmxlKTogdm9pZCB7XG4gIGlmIChkcmF3YWJsZS5vbkNoYW5nZSkgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBjYW5jZWwgYXMgY2FuY2VsRHJhZyB9IGZyb20gJy4vZHJhZydcblxuZXhwb3J0IGZ1bmN0aW9uIHNldERyb3BNb2RlKHM6IFN0YXRlLCBwaWVjZT86IGNnLlBpZWNlKTogdm9pZCB7XG4gIHMuZHJvcG1vZGUgPSB7XG4gICAgYWN0aXZlOiB0cnVlLFxuICAgIHBpZWNlXG4gIH07XG4gIGNhbmNlbERyYWcocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxEcm9wTW9kZShzOiBTdGF0ZSk6IHZvaWQge1xuICBzLmRyb3Btb2RlID0ge1xuICAgIGFjdGl2ZTogZmFsc2VcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyb3AoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKCFzLmRyb3Btb2RlLmFjdGl2ZSkgcmV0dXJuO1xuXG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuXG4gIGNvbnN0IHBpZWNlID0gcy5kcm9wbW9kZS5waWVjZTtcblxuICBpZiAocGllY2UpIHtcbiAgICBzLnBpZWNlcy5hMCA9IHBpZWNlO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgIGNvbnN0IGRlc3QgPSBwb3NpdGlvbiAmJiBib2FyZC5nZXRLZXlBdERvbVBvcyhcbiAgICAgIHBvc2l0aW9uLCBib2FyZC53aGl0ZVBvdihzKSwgcy5kb20uYm91bmRzKCkpO1xuICAgIGlmIChkZXN0KSBib2FyZC5kcm9wTmV3UGllY2UocywgJ2EwJywgZGVzdCk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBkcmFnIGZyb20gJy4vZHJhZydcbmltcG9ydCAqIGFzIGRyYXcgZnJvbSAnLi9kcmF3J1xuaW1wb3J0IHsgZHJvcCB9IGZyb20gJy4vZHJvcCdcbmltcG9ydCB7IGlzUmlnaHRCdXR0b24gfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIE1vdWNoQmluZCA9IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xudHlwZSBTdGF0ZU1vdWNoQmluZCA9IChkOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSk6IHZvaWQge1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgYm9hcmRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuXG4gIC8vIENhbm5vdCBiZSBwYXNzaXZlLCBiZWNhdXNlIHdlIHByZXZlbnQgdG91Y2ggc2Nyb2xsaW5nIGFuZCBkcmFnZ2luZyBvZlxuICAvLyBzZWxlY3RlZCBlbGVtZW50cy5cbiAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcblxuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKSB7XG4gICAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgfVxufVxuXG4vLyByZXR1cm5zIHRoZSB1bmJpbmQgZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBiaW5kRG9jdW1lbnQoczogU3RhdGUsIHJlZHJhd0FsbDogY2cuUmVkcmF3KTogY2cuVW5iaW5kIHtcblxuICBjb25zdCB1bmJpbmRzOiBjZy5VbmJpbmRbXSA9IFtdO1xuXG4gIGlmICghcy5kb20ucmVsYXRpdmUgJiYgcy5yZXNpemFibGUpIHtcbiAgICBjb25zdCBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgIHMuZG9tLmJvdW5kcy5jbGVhcigpO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlZHJhd0FsbCk7XG4gICAgfTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudC5ib2R5LCAnY2hlc3Nncm91bmQucmVzaXplJywgb25SZXNpemUpKTtcbiAgfVxuXG4gIGlmICghcy52aWV3T25seSkge1xuXG4gICAgY29uc3Qgb25tb3ZlOiBNb3VjaEJpbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcubW92ZSwgZHJhdy5tb3ZlKTtcbiAgICBjb25zdCBvbmVuZDogTW91Y2hCaW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLmVuZCwgZHJhdy5lbmQpO1xuXG4gICAgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10uZm9yRWFjaChldiA9PiB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSkpKTtcbiAgICBbJ3RvdWNoZW5kJywgJ21vdXNldXAnXS5mb3JFYWNoKGV2ID0+IHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25lbmQpKSk7XG5cbiAgICBjb25zdCBvblNjcm9sbCA9ICgpID0+IHMuZG9tLmJvdW5kcy5jbGVhcigpO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Njcm9sbCcsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Jlc2l6ZScsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICB9XG5cbiAgcmV0dXJuICgpID0+IHVuYmluZHMuZm9yRWFjaChmID0+IGYoKSk7XG59XG5cbmZ1bmN0aW9uIHVuYmluZGFibGUoZWw6IEV2ZW50VGFyZ2V0LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IE1vdWNoQmluZCwgb3B0aW9ucz86IGFueSk6IGNnLlVuYmluZCB7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayBhcyBFdmVudExpc3RlbmVyLCBvcHRpb25zKTtcbiAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayBhcyBFdmVudExpc3RlbmVyKTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIGUgPT4ge1xuICAgIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50KSBkcmFnLmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSkgeyBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0KHMsIGUpOyB9XG4gICAgZWxzZSBpZiAoIXMudmlld09ubHkpIHtcbiAgICAgIGlmIChzLmRyb3Btb2RlLmFjdGl2ZSkgZHJvcChzLCBlKTtcbiAgICAgIGVsc2UgZHJhZy5zdGFydChzLCBlKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRyYWdPckRyYXcoczogU3RhdGUsIHdpdGhEcmFnOiBTdGF0ZU1vdWNoQmluZCwgd2l0aERyYXc6IFN0YXRlTW91Y2hCaW5kKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIGUgPT4ge1xuICAgIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkpIHsgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgd2l0aERyYXcocywgZSk7IH1cbiAgICBlbHNlIGlmICghcy52aWV3T25seSkgd2l0aERyYWcocywgZSk7XG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBLZXkgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBleHBsb3Npb24oc3RhdGU6IFN0YXRlLCBrZXlzOiBLZXlbXSk6IHZvaWQge1xuICBzdGF0ZS5leHBsb2RpbmcgPSB7IHN0YWdlOiAxLCBrZXlzIH07XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgc2V0U3RhZ2Uoc3RhdGUsIDIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0U3RhZ2Uoc3RhdGUsIHVuZGVmaW5lZCksIDEyMCk7XG4gIH0sIDEyMCk7XG59XG5cbmZ1bmN0aW9uIHNldFN0YWdlKHN0YXRlOiBTdGF0ZSwgc3RhZ2U6IG51bWJlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBpZiAoc3RhdGUuZXhwbG9kaW5nKSB7XG4gICAgaWYgKHN0YWdlKSBzdGF0ZS5leHBsb2Rpbmcuc3RhZ2UgPSBzdGFnZTtcbiAgICBlbHNlIHN0YXRlLmV4cGxvZGluZyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IHBvczJrZXksIGludlJhbmtzIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGNvbnN0IGluaXRpYWw6IGNnLkZFTiA9ICdybmJxa2Juci9wcHBwcHBwcC84LzgvOC84L1BQUFBQUFBQL1JOQlFLQk5SJztcblxuY29uc3Qgcm9sZXM6IHsgW2xldHRlcjogc3RyaW5nXTogY2cuUm9sZSB9ID0geyBwOiAncGF3bicsIHI6ICdyb29rJywgbjogJ2tuaWdodCcsIGI6ICdiaXNob3AnLCBxOiAncXVlZW4nLCBrOiAna2luZycgfTtcblxuY29uc3QgbGV0dGVycyA9IHsgcGF3bjogJ3AnLCByb29rOiAncicsIGtuaWdodDogJ24nLCBiaXNob3A6ICdiJywgcXVlZW46ICdxJywga2luZzogJ2snIH07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkKGZlbjogY2cuRkVOKTogY2cuUGllY2VzIHtcbiAgaWYgKGZlbiA9PT0gJ3N0YXJ0JykgZmVuID0gaW5pdGlhbDtcbiAgY29uc3QgcGllY2VzOiBjZy5QaWVjZXMgPSB7fTtcbiAgbGV0IHJvdzogbnVtYmVyID0gOCwgY29sOiBudW1iZXIgPSAwO1xuICBmb3IgKGNvbnN0IGMgb2YgZmVuKSB7XG4gICAgc3dpdGNoIChjKSB7XG4gICAgICBjYXNlICcgJzogcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICAtLXJvdztcbiAgICAgICAgaWYgKHJvdyA9PT0gMCkgcmV0dXJuIHBpZWNlcztcbiAgICAgICAgY29sID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd+JzpcbiAgICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXNbcG9zMmtleShbY29sLCByb3ddKV07XG4gICAgICAgIGlmIChwaWVjZSkgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIgPCA1NykgY29sICs9IG5iIC0gNDg7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICsrY29sO1xuICAgICAgICAgIGNvbnN0IHJvbGUgPSBjLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcGllY2VzW3BvczJrZXkoW2NvbCwgcm93XSldID0ge1xuICAgICAgICAgICAgcm9sZTogcm9sZXNbcm9sZV0sXG4gICAgICAgICAgICBjb2xvcjogKGMgPT09IHJvbGUgPyAnYmxhY2snIDogJ3doaXRlJykgYXMgY2cuQ29sb3JcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwaWVjZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZShwaWVjZXM6IGNnLlBpZWNlcyk6IGNnLkZFTiB7XG4gIHJldHVybiBpbnZSYW5rcy5tYXAoeSA9PiBjZy5yYW5rcy5tYXAoeCA9PiB7XG4gICAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1twb3Mya2V5KFt4LCB5XSldO1xuICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgIGNvbnN0IGxldHRlciA9IGxldHRlcnNbcGllY2Uucm9sZV07XG4gICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3doaXRlJyA/IGxldHRlci50b1VwcGVyQ2FzZSgpIDogbGV0dGVyO1xuICAgICAgfSBlbHNlIHJldHVybiAnMSc7XG4gICAgfSkuam9pbignJylcbiAgKS5qb2luKCcvJykucmVwbGFjZSgvMXsyLH0vZywgcyA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cbiIsImltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxudHlwZSBNb2JpbGl0eSA9ICh4MTpudW1iZXIsIHkxOm51bWJlciwgeDI6bnVtYmVyLCB5MjpudW1iZXIpID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIGRpZmYoYTogbnVtYmVyLCBiOm51bWJlcik6bnVtYmVyIHtcbiAgcmV0dXJuIE1hdGguYWJzKGEgLSBiKTtcbn1cblxuZnVuY3Rpb24gcGF3bihjb2xvcjogY2cuQ29sb3IpOiBNb2JpbGl0eSB7XG4gIHJldHVybiAoeDEsIHkxLCB4MiwgeTIpID0+IGRpZmYoeDEsIHgyKSA8IDIgJiYgKFxuICAgIGNvbG9yID09PSAnd2hpdGUnID8gKFxuICAgICAgLy8gYWxsb3cgMiBzcXVhcmVzIGZyb20gMSBhbmQgOCwgZm9yIGhvcmRlXG4gICAgICB5MiA9PT0geTEgKyAxIHx8ICh5MSA8PSAyICYmIHkyID09PSAoeTEgKyAyKSAmJiB4MSA9PT0geDIpXG4gICAgKSA6IChcbiAgICAgIHkyID09PSB5MSAtIDEgfHwgKHkxID49IDcgJiYgeTIgPT09ICh5MSAtIDIpICYmIHgxID09PSB4MilcbiAgICApXG4gICk7XG59XG5cbmNvbnN0IGtuaWdodDogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgY29uc3QgeGQgPSBkaWZmKHgxLCB4Mik7XG4gIGNvbnN0IHlkID0gZGlmZih5MSwgeTIpO1xuICByZXR1cm4gKHhkID09PSAxICYmIHlkID09PSAyKSB8fCAoeGQgPT09IDIgJiYgeWQgPT09IDEpO1xufVxuXG5jb25zdCBiaXNob3A6IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIHJldHVybiBkaWZmKHgxLCB4MikgPT09IGRpZmYoeTEsIHkyKTtcbn1cblxuY29uc3Qgcm9vazogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgcmV0dXJuIHgxID09PSB4MiB8fCB5MSA9PT0geTI7XG59XG5cbmNvbnN0IHF1ZWVuOiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICByZXR1cm4gYmlzaG9wKHgxLCB5MSwgeDIsIHkyKSB8fCByb29rKHgxLCB5MSwgeDIsIHkyKTtcbn1cblxuZnVuY3Rpb24ga2luZyhjb2xvcjogY2cuQ29sb3IsIHJvb2tGaWxlczogbnVtYmVyW10sIGNhbkNhc3RsZTogYm9vbGVhbik6IE1vYmlsaXR5IHtcbiAgcmV0dXJuICh4MSwgeTEsIHgyLCB5MikgID0+IChcbiAgICBkaWZmKHgxLCB4MikgPCAyICYmIGRpZmYoeTEsIHkyKSA8IDJcbiAgKSB8fCAoXG4gICAgY2FuQ2FzdGxlICYmIHkxID09PSB5MiAmJiB5MSA9PT0gKGNvbG9yID09PSAnd2hpdGUnID8gMSA6IDgpICYmIChcbiAgICAgICh4MSA9PT0gNSAmJiAoKHV0aWwuY29udGFpbnNYKHJvb2tGaWxlcywgMSkgJiYgeDIgPT09IDMpIHx8ICh1dGlsLmNvbnRhaW5zWChyb29rRmlsZXMsIDgpICYmIHgyID09PSA3KSkpIHx8XG4gICAgICB1dGlsLmNvbnRhaW5zWChyb29rRmlsZXMsIHgyKVxuICAgIClcbiAgKTtcbn1cblxuZnVuY3Rpb24gcm9va0ZpbGVzT2YocGllY2VzOiBjZy5QaWVjZXMsIGNvbG9yOiBjZy5Db2xvcikge1xuICBjb25zdCBiYWNrcmFuayA9IGNvbG9yID09ICd3aGl0ZScgPyAnMScgOiAnOCc7XG4gIHJldHVybiBPYmplY3Qua2V5cyhwaWVjZXMpLmZpbHRlcihrZXkgPT4ge1xuICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW2tleV07XG4gICAgcmV0dXJuIGtleVsxXSA9PT0gYmFja3JhbmsgJiYgcGllY2UgJiYgcGllY2UuY29sb3IgPT09IGNvbG9yICYmIHBpZWNlLnJvbGUgPT09ICdyb29rJztcbiAgfSkubWFwKChrZXk6IHN0cmluZyApID0+IHV0aWwua2V5MnBvcyhrZXkgYXMgY2cuS2V5KVswXSk7XG59XG5cbmNvbnN0IGFsbFBvcyA9IHV0aWwuYWxsS2V5cy5tYXAodXRpbC5rZXkycG9zKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJlbW92ZShwaWVjZXM6IGNnLlBpZWNlcywga2V5OiBjZy5LZXksIGNhbkNhc3RsZTogYm9vbGVhbik6IGNnLktleVtdIHtcbiAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XSEsXG4gICAgcG9zID0gdXRpbC5rZXkycG9zKGtleSksXG4gICAgciA9IHBpZWNlLnJvbGUsXG4gICAgbW9iaWxpdHk6IE1vYmlsaXR5ID0gciA9PT0gJ3Bhd24nID8gcGF3bihwaWVjZS5jb2xvcikgOiAoXG4gICAgICByID09PSAna25pZ2h0JyA/IGtuaWdodCA6IChcbiAgICAgICAgciA9PT0gJ2Jpc2hvcCcgPyBiaXNob3AgOiAoXG4gICAgICAgICAgciA9PT0gJ3Jvb2snID8gcm9vayA6IChcbiAgICAgICAgICAgIHIgPT09ICdxdWVlbicgPyBxdWVlbiA6IGtpbmcocGllY2UuY29sb3IsIHJvb2tGaWxlc09mKHBpZWNlcywgcGllY2UuY29sb3IpLCBjYW5DYXN0bGUpXG4gICAgICAgICAgKSkpKTtcbiAgcmV0dXJuIGFsbFBvcy5maWx0ZXIocG9zMiA9PlxuICAgIChwb3NbMF0gIT09IHBvczJbMF0gfHwgcG9zWzFdICE9PSBwb3MyWzFdKSAmJiBtb2JpbGl0eShwb3NbMF0sIHBvc1sxXSwgcG9zMlswXSwgcG9zMlsxXSlcbiAgKS5tYXAodXRpbC5wb3Mya2V5KTtcbn07XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBrZXkycG9zLCBjcmVhdGVFbCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IHdoaXRlUG92IH0gZnJvbSAnLi9ib2FyZCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQsIEFuaW1WZWN0b3JzLCBBbmltVmVjdG9yLCBBbmltRmFkaW5ncyB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuLy8gYCRjb2xvciAkcm9sZWBcbnR5cGUgUGllY2VOYW1lID0gc3RyaW5nO1xuXG5pbnRlcmZhY2UgU2FtZVBpZWNlcyB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfVxuaW50ZXJmYWNlIFNhbWVTcXVhcmVzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9XG5pbnRlcmZhY2UgTW92ZWRQaWVjZXMgeyBbcGllY2VOYW1lOiBzdHJpbmddOiBjZy5QaWVjZU5vZGVbXSB9XG5pbnRlcmZhY2UgTW92ZWRTcXVhcmVzIHsgW2NsYXNzTmFtZTogc3RyaW5nXTogY2cuU3F1YXJlTm9kZVtdIH1cbmludGVyZmFjZSBTcXVhcmVDbGFzc2VzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH1cblxuLy8gcG9ydGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3ZlbG9jZS9saWNob2JpbGUvYmxvYi9tYXN0ZXIvc3JjL2pzL2NoZXNzZ3JvdW5kL3ZpZXcuanNcbi8vIGluIGNhc2Ugb2YgYnVncywgYmxhbWUgQHZlbG9jZVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGFzV2hpdGU6IGJvb2xlYW4gPSB3aGl0ZVBvdihzKSxcbiAgcG9zVG9UcmFuc2xhdGUgPSBzLmRvbS5yZWxhdGl2ZSA/IHV0aWwucG9zVG9UcmFuc2xhdGVSZWwgOiB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZG9tLmJvdW5kcygpKSxcbiAgdHJhbnNsYXRlID0gcy5kb20ucmVsYXRpdmUgPyB1dGlsLnRyYW5zbGF0ZVJlbCA6IHV0aWwudHJhbnNsYXRlQWJzLFxuICBib2FyZEVsOiBIVE1MRWxlbWVudCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBwaWVjZXM6IGNnLlBpZWNlcyA9IHMucGllY2VzLFxuICBjdXJBbmltOiBBbmltQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuYW5pbWF0aW9uLmN1cnJlbnQsXG4gIGFuaW1zOiBBbmltVmVjdG9ycyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uYW5pbXMgOiB7fSxcbiAgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiB7fSxcbiAgY3VyRHJhZzogRHJhZ0N1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmRyYWdnYWJsZS5jdXJyZW50LFxuICBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyksXG4gIHNhbWVQaWVjZXM6IFNhbWVQaWVjZXMgPSB7fSxcbiAgc2FtZVNxdWFyZXM6IFNhbWVTcXVhcmVzID0ge30sXG4gIG1vdmVkUGllY2VzOiBNb3ZlZFBpZWNlcyA9IHt9LFxuICBtb3ZlZFNxdWFyZXM6IE1vdmVkU3F1YXJlcyA9IHt9LFxuICBwaWVjZXNLZXlzOiBjZy5LZXlbXSA9IE9iamVjdC5rZXlzKHBpZWNlcykgYXMgY2cuS2V5W107XG4gIGxldCBrOiBjZy5LZXksXG4gIHA6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICBlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSxcbiAgcGllY2VBdEtleTogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIGVsUGllY2VOYW1lOiBQaWVjZU5hbWUsXG4gIGFuaW06IEFuaW1WZWN0b3IgfCB1bmRlZmluZWQsXG4gIGZhZGluZzogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIHBNdmRzZXQ6IGNnLlBpZWNlTm9kZVtdLFxuICBwTXZkOiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQsXG4gIHNNdmRzZXQ6IGNnLlNxdWFyZU5vZGVbXSxcbiAgc012ZDogY2cuU3F1YXJlTm9kZSB8IHVuZGVmaW5lZDtcblxuICAvLyB3YWxrIG92ZXIgYWxsIGJvYXJkIGRvbSBlbGVtZW50cywgYXBwbHkgYW5pbWF0aW9ucyBhbmQgZmxhZyBtb3ZlZCBwaWVjZXNcbiAgZWwgPSBib2FyZEVsLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZTtcbiAgd2hpbGUgKGVsKSB7XG4gICAgayA9IGVsLmNnS2V5O1xuICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXNba107XG4gICAgICBhbmltID0gYW5pbXNba107XG4gICAgICBmYWRpbmcgPSBmYWRpbmdzW2tdO1xuICAgICAgZWxQaWVjZU5hbWUgPSBlbC5jZ1BpZWNlO1xuICAgICAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgcmVtb3ZlIGRyYWdnaW5nIHN0eWxlXG4gICAgICBpZiAoZWwuY2dEcmFnZ2luZyAmJiAoIWN1ckRyYWcgfHwgY3VyRHJhZy5vcmlnICE9PSBrKSkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnZ2luZycpO1xuICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzV2hpdGUpKTtcbiAgICAgICAgZWwuY2dEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICBpZiAoIWZhZGluZyAmJiBlbC5jZ0ZhZGluZykge1xuICAgICAgICBlbC5jZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZXJlIGlzIG5vdyBhIHBpZWNlIGF0IHRoaXMgZG9tIGtleVxuICAgICAgaWYgKHBpZWNlQXRLZXkpIHtcbiAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlXG4gICAgICAgIC8vIChvdGhlcndpc2UgaXQgY291bGQgYW5pbWF0ZSBhIGNhcHR1cmVkIHBpZWNlKVxuICAgICAgICBpZiAoYW5pbSAmJiBlbC5jZ0FuaW1hdGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkpIHtcbiAgICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmNnQW5pbWF0aW5nKSB7XG4gICAgICAgICAgZWwuY2dBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1doaXRlKSk7XG4gICAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIGVsLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChrZXkycG9zKGspLCBhc1doaXRlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIHBpZWNlOiBmbGFnIGFzIHNhbWVcbiAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuY2dGYWRpbmcpKSB7XG4gICAgICAgICAgc2FtZVBpZWNlc1trXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlmZmVyZW50IHBpZWNlOiBmbGFnIGFzIG1vdmVkIHVubGVzcyBpdCBpcyBhIGZhZGluZyBwaWVjZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFkaW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihmYWRpbmcpKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmYWRpbmcnKTtcbiAgICAgICAgICAgIGVsLmNnRmFkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSkgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdLnB1c2goZWwpO1xuICAgICAgICAgICAgZWxzZSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0gPSBbZWxdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2U6IGZsYWcgYXMgbW92ZWRcbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAobW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdKSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0ucHVzaChlbCk7XG4gICAgICAgIGVsc2UgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdID0gW2VsXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTcXVhcmVOb2RlKGVsKSkge1xuICAgICAgY29uc3QgY24gPSBlbC5jbGFzc05hbWU7XG4gICAgICBpZiAoc3F1YXJlc1trXSA9PT0gY24pIHNhbWVTcXVhcmVzW2tdID0gdHJ1ZTtcbiAgICAgIGVsc2UgaWYgKG1vdmVkU3F1YXJlc1tjbl0pIG1vdmVkU3F1YXJlc1tjbl0ucHVzaChlbCk7XG4gICAgICBlbHNlIG1vdmVkU3F1YXJlc1tjbl0gPSBbZWxdO1xuICAgIH1cbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGU7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHNxdWFyZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHNxdWFyZXNcbiAgLy8gb3IgYXBwZW5kIG5ldyBzcXVhcmVzXG4gIGZvciAoY29uc3Qgc2sgaW4gc3F1YXJlcykge1xuICAgIGlmICghc2FtZVNxdWFyZXNbc2tdKSB7XG4gICAgICBzTXZkc2V0ID0gbW92ZWRTcXVhcmVzW3NxdWFyZXNbc2tdXTtcbiAgICAgIHNNdmQgPSBzTXZkc2V0ICYmIHNNdmRzZXQucG9wKCk7XG4gICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHBvc1RvVHJhbnNsYXRlKGtleTJwb3Moc2sgYXMgY2cuS2V5KSwgYXNXaGl0ZSk7XG4gICAgICBpZiAoc012ZCkge1xuICAgICAgICBzTXZkLmNnS2V5ID0gc2sgYXMgY2cuS2V5O1xuICAgICAgICB0cmFuc2xhdGUoc012ZCwgdHJhbnNsYXRpb24pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHNxdWFyZU5vZGUgPSBjcmVhdGVFbCgnc3F1YXJlJywgc3F1YXJlc1tza10pIGFzIGNnLlNxdWFyZU5vZGU7XG4gICAgICAgIHNxdWFyZU5vZGUuY2dLZXkgPSBzayBhcyBjZy5LZXk7XG4gICAgICAgIHRyYW5zbGF0ZShzcXVhcmVOb2RlLCB0cmFuc2xhdGlvbik7XG4gICAgICAgIGJvYXJkRWwuaW5zZXJ0QmVmb3JlKHNxdWFyZU5vZGUsIGJvYXJkRWwuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAvLyBvciBhcHBlbmQgbmV3IHBpZWNlc1xuICBmb3IgKGNvbnN0IGogaW4gcGllY2VzS2V5cykge1xuICAgIGsgPSBwaWVjZXNLZXlzW2pdO1xuICAgIHAgPSBwaWVjZXNba10hO1xuICAgIGFuaW0gPSBhbmltc1trXTtcbiAgICBpZiAoIXNhbWVQaWVjZXNba10pIHtcbiAgICAgIHBNdmRzZXQgPSBtb3ZlZFBpZWNlc1twaWVjZU5hbWVPZihwKV07XG4gICAgICBwTXZkID0gcE12ZHNldCAmJiBwTXZkc2V0LnBvcCgpO1xuICAgICAgLy8gYSBzYW1lIHBpZWNlIHdhcyBtb3ZlZFxuICAgICAgaWYgKHBNdmQpIHtcbiAgICAgICAgLy8gYXBwbHkgZG9tIGNoYW5nZXNcbiAgICAgICAgcE12ZC5jZ0tleSA9IGs7XG4gICAgICAgIGlmIChwTXZkLmNnRmFkaW5nKSB7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgICAgICBwTXZkLmNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIHBNdmQuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KHBvcywgYXNXaGl0ZSk7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcE12ZC5jZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlKHBNdmQsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2UgaW4gbW92ZWQgb2JqOiBpbnNlcnQgdGhlIG5ldyBwaWVjZVxuICAgICAgLy8gYXNzdW1lcyB0aGUgbmV3IHBpZWNlIGlzIG5vdCBiZWluZyBkcmFnZ2VkXG4gICAgICBlbHNlIHtcblxuICAgICAgICBjb25zdCBwaWVjZU5hbWUgPSBwaWVjZU5hbWVPZihwKSxcbiAgICAgICAgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lKSBhcyBjZy5QaWVjZU5vZGUsXG4gICAgICAgIHBvcyA9IGtleTJwb3Moayk7XG5cbiAgICAgICAgcGllY2VOb2RlLmNnUGllY2UgPSBwaWVjZU5hbWU7XG4gICAgICAgIHBpZWNlTm9kZS5jZ0tleSA9IGs7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcGllY2VOb2RlLmNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGUocGllY2VOb2RlLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcblxuICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgcGllY2VOb2RlLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChwb3MsIGFzV2hpdGUpO1xuXG4gICAgICAgIGJvYXJkRWwuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgYW55IGVsZW1lbnQgdGhhdCByZW1haW5zIGluIHRoZSBtb3ZlZCBzZXRzXG4gIGZvciAoY29uc3QgaSBpbiBtb3ZlZFBpZWNlcykgcmVtb3ZlTm9kZXMocywgbW92ZWRQaWVjZXNbaV0pO1xuICBmb3IgKGNvbnN0IGkgaW4gbW92ZWRTcXVhcmVzKSByZW1vdmVOb2RlcyhzLCBtb3ZlZFNxdWFyZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBpc1BpZWNlTm9kZShlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSk6IGVsIGlzIGNnLlBpZWNlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnUElFQ0UnO1xufVxuZnVuY3Rpb24gaXNTcXVhcmVOb2RlKGVsOiBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlKTogZWwgaXMgY2cuU3F1YXJlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU1FVQVJFJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZXMoczogU3RhdGUsIG5vZGVzOiBIVE1MRWxlbWVudFtdKTogdm9pZCB7XG4gIGZvciAoY29uc3QgaSBpbiBub2Rlcykgcy5kb20uZWxlbWVudHMuYm9hcmQucmVtb3ZlQ2hpbGQobm9kZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBwb3NaSW5kZXgocG9zOiBjZy5Qb3MsIGFzV2hpdGU6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBsZXQgeiA9IDIgKyAocG9zWzFdIC0gMSkgKiA4ICsgKDggLSBwb3NbMF0pO1xuICBpZiAoYXNXaGl0ZSkgeiA9IDY3IC0gejtcbiAgcmV0dXJuIHogKyAnJztcbn1cblxuZnVuY3Rpb24gcGllY2VOYW1lT2YocGllY2U6IGNnLlBpZWNlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNsYXNzZXMoczogU3RhdGUpOiBTcXVhcmVDbGFzc2VzIHtcbiAgY29uc3Qgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IHt9O1xuICBsZXQgaTogYW55LCBrOiBjZy5LZXk7XG4gIGlmIChzLmxhc3RNb3ZlICYmIHMuaGlnaGxpZ2h0Lmxhc3RNb3ZlKSBmb3IgKGkgaW4gcy5sYXN0TW92ZSkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLmxhc3RNb3ZlW2ldLCAnbGFzdC1tb3ZlJyk7XG4gIH1cbiAgaWYgKHMuY2hlY2sgJiYgcy5oaWdobGlnaHQuY2hlY2spIGFkZFNxdWFyZShzcXVhcmVzLCBzLmNoZWNrLCAnY2hlY2snKTtcbiAgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XG4gICAgaWYgKHMubW92YWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5tb3ZhYmxlLmRlc3RzICYmIHMubW92YWJsZS5kZXN0c1tzLnNlbGVjdGVkXTtcbiAgICAgIGlmIChkZXN0cykgZm9yIChpIGluIGRlc3RzKSB7XG4gICAgICAgIGsgPSBkZXN0c1tpXTtcbiAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdtb3ZlLWRlc3QnICsgKHMucGllY2VzW2tdID8gJyBvYycgOiAnJykpO1xuICAgICAgfVxuICAgICAgY29uc3QgcERlc3RzID0gcy5wcmVtb3ZhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cykgZm9yIChpIGluIHBEZXN0cykge1xuICAgICAgICBrID0gcERlc3RzW2ldO1xuICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ3ByZW1vdmUtZGVzdCcgKyAocy5waWVjZXNba10gPyAnIG9jJyA6ICcnKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHByZW1vdmUgPSBzLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKHByZW1vdmUpIGZvciAoaSBpbiBwcmVtb3ZlKSBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZVtpXSwgJ2N1cnJlbnQtcHJlbW92ZScpO1xuICBlbHNlIGlmIChzLnByZWRyb3BwYWJsZS5jdXJyZW50KSBhZGRTcXVhcmUoc3F1YXJlcywgcy5wcmVkcm9wcGFibGUuY3VycmVudC5rZXksICdjdXJyZW50LXByZW1vdmUnKTtcblxuICBjb25zdCBvID0gcy5leHBsb2Rpbmc7XG4gIGlmIChvKSBmb3IgKGkgaW4gby5rZXlzKSBhZGRTcXVhcmUoc3F1YXJlcywgby5rZXlzW2ldLCAnZXhwbG9kaW5nJyArIG8uc3RhZ2UpO1xuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBjZy5LZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKHNxdWFyZXNba2V5XSkgc3F1YXJlc1trZXldICs9ICcgJyArIGtsYXNzO1xuICBlbHNlIHNxdWFyZXNba2V5XSA9IGtsYXNzO1xufVxuIiwiaW1wb3J0ICogYXMgZmVuIGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQgfSBmcm9tICcuL2FuaW0nXG5pbXBvcnQgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZydcbmltcG9ydCB7IERyYXdhYmxlIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0IHsgdGltZXIgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSB7XG4gIHBpZWNlczogY2cuUGllY2VzO1xuICBvcmllbnRhdGlvbjogY2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiB3aGl0ZSB8IGJsYWNrXG4gIHR1cm5Db2xvcjogY2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gd2hpdGUgfCBibGFja1xuICBjaGVjaz86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBpbiBjaGVjayBcImEyXCJcbiAgbGFzdE1vdmU/OiBjZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgW1wiYzNcIjsgXCJjNFwiXVxuICBzZWxlY3RlZD86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcImExXCJcbiAgY29vcmRpbmF0ZXM6IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgYXV0b0Nhc3RsZTogYm9vbGVhbjsgLy8gaW1tZWRpYXRlbHkgY29tcGxldGUgdGhlIGNhc3RsZSBieSBtb3ZpbmcgdGhlIHJvb2sgYWZ0ZXIga2luZyBtb3ZlXG4gIHZpZXdPbmx5OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBkaXNhYmxlQ29udGV4dE1lbnU6IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgY2hlc3Nib2FyZFxuICByZXNpemFibGU6IGJvb2xlYW47IC8vIGxpc3RlbnMgdG8gY2hlc3Nncm91bmQucmVzaXplIG9uIGRvY3VtZW50LmJvZHkgdG8gY2xlYXIgYm91bmRzIGNhY2hlXG4gIGFkZFBpZWNlWkluZGV4OiBib29sZWFuOyAvLyBhZGRzIHotaW5kZXggdmFsdWVzIHRvIHBpZWNlcyAoZm9yIDNEKVxuICBwaWVjZUtleTogYm9vbGVhbjsgLy8gYWRkIGEgZGF0YS1rZXkgYXR0cmlidXRlIHRvIHBpZWNlIGVsZW1lbnRzXG4gIGhpZ2hsaWdodDoge1xuICAgIGxhc3RNb3ZlOiBib29sZWFuOyAvLyBhZGQgbGFzdC1tb3ZlIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjazogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICBkdXJhdGlvbjogbnVtYmVyO1xuICAgIGN1cnJlbnQ/OiBBbmltQ3VycmVudDtcbiAgfTtcbiAgbW92YWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBjb2xvcj86IGNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlLiB3aGl0ZSB8IGJsYWNrIHwgYm90aFxuICAgIGRlc3RzPzogY2cuRGVzdHM7IC8vIHZhbGlkIG1vdmVzLiB7XCJhMlwiIFtcImEzXCIgXCJhNFwiXSBcImIxXCIgW1wiYTNcIiBcImMzXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIG1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgICAgYWZ0ZXJOZXdQaWVjZT86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIGEgbmV3IHBpZWNlIGlzIGRyb3BwZWQgb24gdGhlIGJvYXJkXG4gICAgfTtcbiAgICByb29rQ2FzdGxlOiBib29sZWFuIC8vIGNhc3RsZSBieSBtb3ZpbmcgdGhlIGtpbmcgdG8gdGhlIHJvb2tcbiAgfTtcbiAgcHJlbW92YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZW1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgY2FzdGxlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFsbG93IGtpbmcgY2FzdGxlIHByZW1vdmVzXG4gICAgZGVzdHM/OiBjZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiBjZy5LZXlQYWlyOyAvLyBrZXlzIG9mIHRoZSBjdXJyZW50IHNhdmVkIHByZW1vdmUgW1wiZTJcIiBcImU0XCJdXG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhPzogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7ICAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIHByZWRyb3BwYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIGN1cnJlbnQ/OiB7IC8vIGN1cnJlbnQgc2F2ZWQgcHJlZHJvcCB7cm9sZTogJ2tuaWdodCc7IGtleTogJ2U0J31cbiAgICAgIHJvbGU6IGNnLlJvbGU7XG4gICAgICBrZXk6IGNnLktleVxuICAgIH07XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBkcmFnZ2FibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlOiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U6IGJvb2xlYW47IC8vIGxldHMgY2hlc3Nncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIGNlbnRlclBpZWNlOiBib29sZWFuOyAvLyBjZW50ZXIgdGhlIHBpZWNlIG9uIGN1cnNvciBhdCBkcmFnIHN0YXJ0XG4gICAgc2hvd0dob3N0OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBkZWxldGVPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkXG4gICAgY3VycmVudD86IERyYWdDdXJyZW50O1xuICB9O1xuICBkcm9wbW9kZToge1xuICAgIGFjdGl2ZTogYm9vbGVhbjtcbiAgICBwaWVjZT86IGNnLlBpZWNlO1xuICB9XG4gIHNlbGVjdGFibGU6IHtcbiAgICAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZW5hYmxlZDogYm9vbGVhblxuICB9O1xuICBzdGF0czoge1xuICAgIC8vIHdhcyBsYXN0IHBpZWNlIGRyYWdnZWQgb3IgY2xpY2tlZD9cbiAgICAvLyBuZWVkcyBkZWZhdWx0IHRvIGZhbHNlIGZvciB0b3VjaFxuICAgIGRyYWdnZWQ6IGJvb2xlYW4sXG4gICAgY3RybEtleT86IGJvb2xlYW5cbiAgfTtcbiAgZXZlbnRzOiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgYSBwaWVjZSBoYXMgYmVlbiBtb3ZlZC5cbiAgICAvLyBjYXB0dXJlZFBpZWNlIGlzIHVuZGVmaW5lZCBvciBsaWtlIHtjb2xvcjogJ3doaXRlJzsgJ3JvbGUnOiAncXVlZW4nfVxuICAgIG1vdmU/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIGNhcHR1cmVkUGllY2U/OiBjZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wTmV3UGllY2U/OiAocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSkgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBjZy5LZXkpID0+IHZvaWQgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICBpbnNlcnQ/OiAoZWxlbWVudHM6IGNnLkVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlOiBEcmF3YWJsZSxcbiAgZXhwbG9kaW5nPzogY2cuRXhwbG9kaW5nO1xuICBkb206IGNnLkRvbSxcbiAgaG9sZDogY2cuVGltZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKCk6IFBhcnRpYWw8U3RhdGU+IHtcbiAgcmV0dXJuIHtcbiAgICBwaWVjZXM6IGZlbi5yZWFkKGZlbi5pbml0aWFsKSxcbiAgICBvcmllbnRhdGlvbjogJ3doaXRlJyxcbiAgICB0dXJuQ29sb3I6ICd3aGl0ZScsXG4gICAgY29vcmRpbmF0ZXM6IHRydWUsXG4gICAgYXV0b0Nhc3RsZTogdHJ1ZSxcbiAgICB2aWV3T25seTogZmFsc2UsXG4gICAgZGlzYWJsZUNvbnRleHRNZW51OiBmYWxzZSxcbiAgICByZXNpemFibGU6IHRydWUsXG4gICAgYWRkUGllY2VaSW5kZXg6IGZhbHNlLFxuICAgIHBpZWNlS2V5OiBmYWxzZSxcbiAgICBoaWdobGlnaHQ6IHtcbiAgICAgIGxhc3RNb3ZlOiB0cnVlLFxuICAgICAgY2hlY2s6IHRydWVcbiAgICB9LFxuICAgIGFuaW1hdGlvbjoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGR1cmF0aW9uOiAyMDBcbiAgICB9LFxuICAgIG1vdmFibGU6IHtcbiAgICAgIGZyZWU6IHRydWUsXG4gICAgICBjb2xvcjogJ2JvdGgnLFxuICAgICAgc2hvd0Rlc3RzOiB0cnVlLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIHJvb2tDYXN0bGU6IHRydWVcbiAgICB9LFxuICAgIHByZW1vdmFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBjYXN0bGU6IHRydWUsXG4gICAgICBldmVudHM6IHt9XG4gICAgfSxcbiAgICBwcmVkcm9wcGFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgZXZlbnRzOiB7fVxuICAgIH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZGlzdGFuY2U6IDMsXG4gICAgICBhdXRvRGlzdGFuY2U6IHRydWUsXG4gICAgICBjZW50ZXJQaWVjZTogdHJ1ZSxcbiAgICAgIHNob3dHaG9zdDogdHJ1ZSxcbiAgICAgIGRlbGV0ZU9uRHJvcE9mZjogZmFsc2VcbiAgICB9LFxuICAgIGRyb3Btb2RlOiB7XG4gICAgICBhY3RpdmU6IGZhbHNlXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlXG4gICAgfSxcbiAgICBzdGF0czoge1xuICAgICAgLy8gb24gdG91Y2hzY3JlZW4sIGRlZmF1bHQgdG8gXCJ0YXAtdGFwXCIgbW92ZXNcbiAgICAgIC8vIGluc3RlYWQgb2YgZHJhZ1xuICAgICAgZHJhZ2dlZDogISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpXG4gICAgfSxcbiAgICBldmVudHM6IHt9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLCAvLyBjYW4gZHJhd1xuICAgICAgdmlzaWJsZTogdHJ1ZSwgLy8gY2FuIHZpZXdcbiAgICAgIGVyYXNlT25DbGljazogdHJ1ZSxcbiAgICAgIHNoYXBlczogW10sXG4gICAgICBhdXRvU2hhcGVzOiBbXSxcbiAgICAgIGJydXNoZXM6IHtcbiAgICAgICAgZ3JlZW46IHsga2V5OiAnZycsIGNvbG9yOiAnIzE1NzgxQicsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgcmVkOiB7IGtleTogJ3InLCBjb2xvcjogJyM4ODIwMjAnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIGJsdWU6IHsga2V5OiAnYicsIGNvbG9yOiAnIzAwMzA4OCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgeWVsbG93OiB7IGtleTogJ3knLCBjb2xvcjogJyNlNjhmMDAnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIHBhbGVCbHVlOiB7IGtleTogJ3BiJywgY29sb3I6ICcjMDAzMDg4Jywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVHcmVlbjogeyBrZXk6ICdwZycsIGNvbG9yOiAnIzE1NzgxQicsIG9wYWNpdHk6IDAuNCwgbGluZVdpZHRoOiAxNSB9LFxuICAgICAgICBwYWxlUmVkOiB7IGtleTogJ3ByJywgY29sb3I6ICcjODgyMDIwJywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVHcmV5OiB7IGtleTogJ3BncicsIGNvbG9yOiAnIzRhNGE0YScsIG9wYWNpdHk6IDAuMzUsIGxpbmVXaWR0aDogMTUgfVxuICAgICAgfSxcbiAgICAgIHBpZWNlczoge1xuICAgICAgICBiYXNlVXJsOiAnaHR0cHM6Ly9saWNoZXNzMS5vcmcvYXNzZXRzL3BpZWNlL2NidXJuZXR0LydcbiAgICAgIH0sXG4gICAgICBwcmV2U3ZnSGFzaDogJydcbiAgICB9LFxuICAgIGhvbGQ6IHRpbWVyKClcbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGtleTJwb3MgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBEcmF3YWJsZSwgRHJhd1NoYXBlLCBEcmF3U2hhcGVQaWVjZSwgRHJhd0JydXNoLCBEcmF3QnJ1c2hlcywgRHJhd01vZGlmaWVycyB9IGZyb20gJy4vZHJhdydcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IFNWR0VsZW1lbnQge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ05hbWUpO1xufVxuXG5pbnRlcmZhY2UgU2hhcGUge1xuICBzaGFwZTogRHJhd1NoYXBlO1xuICBjdXJyZW50OiBib29sZWFuO1xuICBoYXNoOiBIYXNoO1xufVxuXG5pbnRlcmZhY2UgQ3VzdG9tQnJ1c2hlcyB7XG4gIFtoYXNoOiBzdHJpbmddOiBEcmF3QnJ1c2hcbn1cblxuaW50ZXJmYWNlIEFycm93RGVzdHMge1xuICBba2V5OiBzdHJpbmddOiBudW1iZXI7IC8vIGhvdyBtYW55IGFycm93cyBsYW5kIG9uIGEgc3F1YXJlXG59XG5cbnR5cGUgSGFzaCA9IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN2ZyhzdGF0ZTogU3RhdGUsIHJvb3Q6IFNWR0VsZW1lbnQpOiB2b2lkIHtcblxuICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGUsXG4gIGN1ckQgPSBkLmN1cnJlbnQsXG4gIGN1ciA9IGN1ckQgJiYgY3VyRC5tb3VzZVNxID8gY3VyRCBhcyBEcmF3U2hhcGUgOiB1bmRlZmluZWQsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMgPSB7fTtcblxuICBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5jb25jYXQoY3VyID8gW2N1cl0gOiBbXSkuZm9yRWFjaChzID0+IHtcbiAgICBpZiAocy5kZXN0KSBhcnJvd0Rlc3RzW3MuZGVzdF0gPSAoYXJyb3dEZXN0c1tzLmRlc3RdIHx8IDApICsgMTtcbiAgfSk7XG5cbiAgY29uc3Qgc2hhcGVzOiBTaGFwZVtdID0gZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykubWFwKChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBjdXJyZW50OiBmYWxzZSxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSlcbiAgICB9O1xuICB9KTtcbiAgaWYgKGN1cikgc2hhcGVzLnB1c2goe1xuICAgIHNoYXBlOiBjdXIsXG4gICAgY3VycmVudDogdHJ1ZSxcbiAgICBoYXNoOiBzaGFwZUhhc2goY3VyLCBhcnJvd0Rlc3RzLCB0cnVlKVxuICB9KTtcblxuICBjb25zdCBmdWxsSGFzaCA9IHNoYXBlcy5tYXAoc2MgPT4gc2MuaGFzaCkuam9pbignJyk7XG4gIGlmIChmdWxsSGFzaCA9PT0gc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2gpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSBmdWxsSGFzaDtcblxuICBjb25zdCBkZWZzRWwgPSByb290LmZpcnN0Q2hpbGQgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhkLCBzaGFwZXMsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoc3RhdGUsIHNoYXBlcywgZC5icnVzaGVzLCBhcnJvd0Rlc3RzLCByb290LCBkZWZzRWwpO1xufVxuXG4vLyBhcHBlbmQgb25seS4gRG9uJ3QgdHJ5IHRvIHVwZGF0ZS9yZW1vdmUuXG5mdW5jdGlvbiBzeW5jRGVmcyhkOiBEcmF3YWJsZSwgc2hhcGVzOiBTaGFwZVtdLCBkZWZzRWw6IFNWR0VsZW1lbnQpIHtcbiAgY29uc3QgYnJ1c2hlczogQ3VzdG9tQnJ1c2hlcyA9IHt9O1xuICBsZXQgYnJ1c2g6IERyYXdCcnVzaDtcbiAgc2hhcGVzLmZvckVhY2gocyA9PiB7XG4gICAgaWYgKHMuc2hhcGUuZGVzdCkge1xuICAgICAgYnJ1c2ggPSBkLmJydXNoZXNbcy5zaGFwZS5icnVzaF07XG4gICAgICBpZiAocy5zaGFwZS5tb2RpZmllcnMpIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzLnNoYXBlLm1vZGlmaWVycyk7XG4gICAgICBicnVzaGVzW2JydXNoLmtleV0gPSBicnVzaDtcbiAgICB9XG4gIH0pO1xuICBjb25zdCBrZXlzSW5Eb206IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgPSBkZWZzRWwuZmlyc3RDaGlsZCBhcyBTVkdFbGVtZW50O1xuICB3aGlsZShlbCkge1xuICAgIGtleXNJbkRvbVtlbC5nZXRBdHRyaWJ1dGUoJ2NnS2V5JykgYXMgc3RyaW5nXSA9IHRydWU7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBTVkdFbGVtZW50O1xuICB9XG4gIGZvciAobGV0IGtleSBpbiBicnVzaGVzKSB7XG4gICAgaWYgKCFrZXlzSW5Eb21ba2V5XSkgZGVmc0VsLmFwcGVuZENoaWxkKHJlbmRlck1hcmtlcihicnVzaGVzW2tleV0pKTtcbiAgfVxufVxuXG4vLyBhcHBlbmQgYW5kIHJlbW92ZSBvbmx5LiBObyB1cGRhdGVzLlxuZnVuY3Rpb24gc3luY1NoYXBlcyhzdGF0ZTogU3RhdGUsIHNoYXBlczogU2hhcGVbXSwgYnJ1c2hlczogRHJhd0JydXNoZXMsIGFycm93RGVzdHM6IEFycm93RGVzdHMsIHJvb3Q6IFNWR0VsZW1lbnQsIGRlZnNFbDogU1ZHRWxlbWVudCk6IHZvaWQge1xuICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzKCksXG4gIGhhc2hlc0luRG9tOiB7W2hhc2g6IHN0cmluZ106IGJvb2xlYW59ID0ge30sXG4gIHRvUmVtb3ZlOiBTVkdFbGVtZW50W10gPSBbXTtcbiAgc2hhcGVzLmZvckVhY2goc2MgPT4geyBoYXNoZXNJbkRvbVtzYy5oYXNoXSA9IGZhbHNlOyB9KTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50ID0gZGVmc0VsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQsIGVsSGFzaDogSGFzaDtcbiAgd2hpbGUoZWwpIHtcbiAgICBlbEhhc2ggPSBlbC5nZXRBdHRyaWJ1dGUoJ2NnSGFzaCcpIGFzIEhhc2g7XG4gICAgLy8gZm91bmQgYSBzaGFwZSBlbGVtZW50IHRoYXQncyBoZXJlIHRvIHN0YXlcbiAgICBpZiAoaGFzaGVzSW5Eb20uaGFzT3duUHJvcGVydHkoZWxIYXNoKSkgaGFzaGVzSW5Eb21bZWxIYXNoXSA9IHRydWU7XG4gICAgLy8gb3IgcmVtb3ZlIGl0XG4gICAgZWxzZSB0b1JlbW92ZS5wdXNoKGVsKTtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgdG9SZW1vdmUuZm9yRWFjaChlbCA9PiByb290LnJlbW92ZUNoaWxkKGVsKSk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgc2hhcGVzLmZvckVhY2goc2MgPT4ge1xuICAgIGlmICghaGFzaGVzSW5Eb21bc2MuaGFzaF0pIHJvb3QuYXBwZW5kQ2hpbGQocmVuZGVyU2hhcGUoc3RhdGUsIHNjLCBicnVzaGVzLCBhcnJvd0Rlc3RzLCBib3VuZHMpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNoYXBlSGFzaCh7b3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBtb2RpZmllcnN9OiBEcmF3U2hhcGUsIGFycm93RGVzdHM6IEFycm93RGVzdHMsIGN1cnJlbnQ6IGJvb2xlYW4pOiBIYXNoIHtcbiAgcmV0dXJuIFtjdXJyZW50LCBvcmlnLCBkZXN0LCBicnVzaCwgZGVzdCAmJiBhcnJvd0Rlc3RzW2Rlc3RdID4gMSxcbiAgICBwaWVjZSAmJiBwaWVjZUhhc2gocGllY2UpLFxuICAgIG1vZGlmaWVycyAmJiBtb2RpZmllcnNIYXNoKG1vZGlmaWVycylcbiAgXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gcGllY2VIYXNoKHBpZWNlOiBEcmF3U2hhcGVQaWVjZSk6IEhhc2gge1xuICByZXR1cm4gW3BpZWNlLmNvbG9yLCBwaWVjZS5yb2xlLCBwaWVjZS5zY2FsZV0uZmlsdGVyKHggPT4geCkuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIG1vZGlmaWVyc0hhc2gobTogRHJhd01vZGlmaWVycyk6IEhhc2gge1xuICByZXR1cm4gJycgKyAobS5saW5lV2lkdGggfHwgJycpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTaGFwZShzdGF0ZTogU3RhdGUsIHtzaGFwZSwgY3VycmVudCwgaGFzaH06IFNoYXBlLCBicnVzaGVzOiBEcmF3QnJ1c2hlcywgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGxldCBlbDogU1ZHRWxlbWVudDtcbiAgaWYgKHNoYXBlLnBpZWNlKSBlbCA9IHJlbmRlclBpZWNlKFxuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlcy5iYXNlVXJsLFxuICAgIG9yaWVudChrZXkycG9zKHNoYXBlLm9yaWcpLCBzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgc2hhcGUucGllY2UsXG4gICAgYm91bmRzKTtcbiAgZWxzZSB7XG4gICAgY29uc3Qgb3JpZyA9IG9yaWVudChrZXkycG9zKHNoYXBlLm9yaWcpLCBzdGF0ZS5vcmllbnRhdGlvbik7XG4gICAgaWYgKHNoYXBlLm9yaWcgJiYgc2hhcGUuZGVzdCkge1xuICAgICAgbGV0IGJydXNoOiBEcmF3QnJ1c2ggPSBicnVzaGVzW3NoYXBlLmJydXNoXTtcbiAgICAgIGlmIChzaGFwZS5tb2RpZmllcnMpIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzaGFwZS5tb2RpZmllcnMpO1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIG9yaWVudChrZXkycG9zKHNoYXBlLmRlc3QpLCBzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIGN1cnJlbnQsXG4gICAgICAgIGFycm93RGVzdHNbc2hhcGUuZGVzdF0gPiAxLFxuICAgICAgICBib3VuZHMpO1xuICAgIH1cbiAgICBlbHNlIGVsID0gcmVuZGVyQ2lyY2xlKGJydXNoZXNbc2hhcGUuYnJ1c2hdLCBvcmlnLCBjdXJyZW50LCBib3VuZHMpO1xuICB9XG4gIGVsLnNldEF0dHJpYnV0ZSgnY2dIYXNoJywgaGFzaCk7XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2lyY2xlKGJydXNoOiBEcmF3QnJ1c2gsIHBvczogY2cuUG9zLCBjdXJyZW50OiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvczJweChwb3MsIGJvdW5kcyksXG4gIHdpZHRocyA9IGNpcmNsZVdpZHRoKGJvdW5kcyksXG4gIHJhZGl1cyA9IChib3VuZHMud2lkdGggKyBib3VuZHMuaGVpZ2h0KSAvIDMyO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdjaXJjbGUnKSwge1xuICAgIHN0cm9rZTogYnJ1c2guY29sb3IsXG4gICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBvcGFjaXR5OiBvcGFjaXR5KGJydXNoLCBjdXJyZW50KSxcbiAgICBjeDogb1swXSxcbiAgICBjeTogb1sxXSxcbiAgICByOiByYWRpdXMgLSB3aWR0aHNbMV0gLyAyXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBcnJvdyhicnVzaDogRHJhd0JydXNoLCBvcmlnOiBjZy5Qb3MsIGRlc3Q6IGNnLlBvcywgY3VycmVudDogYm9vbGVhbiwgc2hvcnRlbjogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG0gPSBhcnJvd01hcmdpbihib3VuZHMsIHNob3J0ZW4gJiYgIWN1cnJlbnQpLFxuICBhID0gcG9zMnB4KG9yaWcsIGJvdW5kcyksXG4gIGIgPSBwb3MycHgoZGVzdCwgYm91bmRzKSxcbiAgZHggPSBiWzBdIC0gYVswXSxcbiAgZHkgPSBiWzFdIC0gYVsxXSxcbiAgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCksXG4gIHhvID0gTWF0aC5jb3MoYW5nbGUpICogbSxcbiAgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdsaW5lJyksIHtcbiAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICdzdHJva2Utd2lkdGgnOiBsaW5lV2lkdGgoYnJ1c2gsIGN1cnJlbnQsIGJvdW5kcyksXG4gICAgJ3N0cm9rZS1saW5lY2FwJzogJ3JvdW5kJyxcbiAgICAnbWFya2VyLWVuZCc6ICd1cmwoI2Fycm93aGVhZC0nICsgYnJ1c2gua2V5ICsgJyknLFxuICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5b1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUGllY2UoYmFzZVVybDogc3RyaW5nLCBwb3M6IGNnLlBvcywgcGllY2U6IERyYXdTaGFwZVBpZWNlLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvczJweChwb3MsIGJvdW5kcyksXG4gIHNpemUgPSBib3VuZHMud2lkdGggLyA4ICogKHBpZWNlLnNjYWxlIHx8IDEpLFxuICBuYW1lID0gcGllY2UuY29sb3JbMF0gKyAocGllY2Uucm9sZSA9PT0gJ2tuaWdodCcgPyAnbicgOiBwaWVjZS5yb2xlWzBdKS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdpbWFnZScpLCB7XG4gICAgY2xhc3NOYW1lOiBgJHtwaWVjZS5yb2xlfSAke3BpZWNlLmNvbG9yfWAsXG4gICAgeDogb1swXSAtIHNpemUgLyAyLFxuICAgIHk6IG9bMV0gLSBzaXplIC8gMixcbiAgICB3aWR0aDogc2l6ZSxcbiAgICBoZWlnaHQ6IHNpemUsXG4gICAgaHJlZjogYmFzZVVybCArIG5hbWUgKyAnLnN2ZydcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlcihicnVzaDogRHJhd0JydXNoKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG1hcmtlciA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnbWFya2VyJyksIHtcbiAgICBpZDogJ2Fycm93aGVhZC0nICsgYnJ1c2gua2V5LFxuICAgIG9yaWVudDogJ2F1dG8nLFxuICAgIG1hcmtlcldpZHRoOiA0LFxuICAgIG1hcmtlckhlaWdodDogOCxcbiAgICByZWZYOiAyLjA1LFxuICAgIHJlZlk6IDIuMDFcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ3BhdGgnKSwge1xuICAgIGQ6ICdNMCwwIFY0IEwzLDIgWicsXG4gICAgZmlsbDogYnJ1c2guY29sb3JcbiAgfSkpO1xuICBtYXJrZXIuc2V0QXR0cmlidXRlKCdjZ0tleScsIGJydXNoLmtleSk7XG4gIHJldHVybiBtYXJrZXI7XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWw6IFNWR0VsZW1lbnQsIGF0dHJzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogU1ZHRWxlbWVudCB7XG4gIGZvciAobGV0IGtleSBpbiBhdHRycykgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gb3JpZW50KHBvczogY2cuUG9zLCBjb2xvcjogY2cuQ29sb3IpOiBjZy5Qb3Mge1xuICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyBwb3MgOiBbOSAtIHBvc1swXSwgOSAtIHBvc1sxXV07XG59XG5cbmZ1bmN0aW9uIG1ha2VDdXN0b21CcnVzaChiYXNlOiBEcmF3QnJ1c2gsIG1vZGlmaWVyczogRHJhd01vZGlmaWVycyk6IERyYXdCcnVzaCB7XG4gIGNvbnN0IGJydXNoOiBQYXJ0aWFsPERyYXdCcnVzaD4gPSB7XG4gICAgY29sb3I6IGJhc2UuY29sb3IsXG4gICAgb3BhY2l0eTogTWF0aC5yb3VuZChiYXNlLm9wYWNpdHkgKiAxMCkgLyAxMCxcbiAgICBsaW5lV2lkdGg6IE1hdGgucm91bmQobW9kaWZpZXJzLmxpbmVXaWR0aCB8fCBiYXNlLmxpbmVXaWR0aClcbiAgfTtcbiAgYnJ1c2gua2V5ID0gW2Jhc2Uua2V5LCBtb2RpZmllcnMubGluZVdpZHRoXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbiAgcmV0dXJuIGJydXNoIGFzIERyYXdCcnVzaDtcbn1cblxuZnVuY3Rpb24gY2lyY2xlV2lkdGgoYm91bmRzOiBDbGllbnRSZWN0KTogW251bWJlciwgbnVtYmVyXSB7XG4gIGNvbnN0IGJhc2UgPSBib3VuZHMud2lkdGggLyA1MTI7XG4gIHJldHVybiBbMyAqIGJhc2UsIDQgKiBiYXNlXTtcbn1cblxuZnVuY3Rpb24gbGluZVdpZHRoKGJydXNoOiBEcmF3QnJ1c2gsIGN1cnJlbnQ6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IG51bWJlciB7XG4gIHJldHVybiAoYnJ1c2gubGluZVdpZHRoIHx8IDEwKSAqIChjdXJyZW50ID8gMC44NSA6IDEpIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBvcGFjaXR5KGJydXNoOiBEcmF3QnJ1c2gsIGN1cnJlbnQ6IGJvb2xlYW4pOiBudW1iZXIge1xuICByZXR1cm4gKGJydXNoLm9wYWNpdHkgfHwgMSkgKiAoY3VycmVudCA/IDAuOSA6IDEpO1xufVxuXG5mdW5jdGlvbiBhcnJvd01hcmdpbihib3VuZHM6IENsaWVudFJlY3QsIHNob3J0ZW46IGJvb2xlYW4pOiBudW1iZXIge1xuICByZXR1cm4gKHNob3J0ZW4gPyAyMCA6IDEwKSAvIDUxMiAqIGJvdW5kcy53aWR0aDtcbn1cblxuZnVuY3Rpb24gcG9zMnB4KHBvczogY2cuUG9zLCBib3VuZHM6IENsaWVudFJlY3QpOiBjZy5OdW1iZXJQYWlyIHtcbiAgcmV0dXJuIFsocG9zWzBdIC0gMC41KSAqIGJvdW5kcy53aWR0aCAvIDgsICg4LjUgLSBwb3NbMV0pICogYm91bmRzLmhlaWdodCAvIDhdO1xufVxuIiwiZXhwb3J0IHR5cGUgQ29sb3IgPSAnd2hpdGUnIHwgJ2JsYWNrJztcbmV4cG9ydCB0eXBlIFJvbGUgPSAna2luZycgfCAncXVlZW4nIHwgJ3Jvb2snIHwgJ2Jpc2hvcCcgfCAna25pZ2h0JyB8ICdwYXduJztcbmV4cG9ydCB0eXBlIEtleSA9ICdhMCcgfCAnYTEnIHwgJ2IxJyB8ICdjMScgfCAnZDEnIHwgJ2UxJyB8ICdmMScgfCAnZzEnIHwgJ2gxJyB8ICdhMicgfCAnYjInIHwgJ2MyJyB8ICdkMicgfCAnZTInIHwgJ2YyJyB8ICdnMicgfCAnaDInIHwgJ2EzJyB8ICdiMycgfCAnYzMnIHwgJ2QzJyB8ICdlMycgfCAnZjMnIHwgJ2czJyB8ICdoMycgfCAnYTQnIHwgJ2I0JyB8ICdjNCcgfCAnZDQnIHwgJ2U0JyB8ICdmNCcgfCAnZzQnIHwgJ2g0JyB8ICdhNScgfCAnYjUnIHwgJ2M1JyB8ICdkNScgfCAnZTUnIHwgJ2Y1JyB8ICdnNScgfCAnaDUnIHwgJ2E2JyB8ICdiNicgfCAnYzYnIHwgJ2Q2JyB8ICdlNicgfCAnZjYnIHwgJ2c2JyB8ICdoNicgfCAnYTcnIHwgJ2I3JyB8ICdjNycgfCAnZDcnIHwgJ2U3JyB8ICdmNycgfCAnZzcnIHwgJ2g3JyB8ICdhOCcgfCAnYjgnIHwgJ2M4JyB8ICdkOCcgfCAnZTgnIHwgJ2Y4JyB8ICdnOCcgfCAnaDgnO1xuZXhwb3J0IHR5cGUgRmlsZSA9ICdhJyB8ICdiJyB8ICdjJyB8ICdkJyB8ICdlJyB8ICdmJyB8ICdnJyB8ICdoJztcbmV4cG9ydCB0eXBlIFJhbmsgPSAxIHwgMiB8IDMgfCA0IHwgNSB8IDYgfCA3IHwgODtcbmV4cG9ydCB0eXBlIEZFTiA9IHN0cmluZztcbmV4cG9ydCB0eXBlIFBvcyA9IFtudW1iZXIsIG51bWJlcl07XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlIHtcbiAgcm9sZTogUm9sZTtcbiAgY29sb3I6IENvbG9yO1xuICBwcm9tb3RlZD86IGJvb2xlYW47XG59XG5leHBvcnQgaW50ZXJmYWNlIERyb3Age1xuICByb2xlOiBSb2xlO1xuICBrZXk6IEtleTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VzIHtcbiAgW2tleTogc3RyaW5nXTogUGllY2UgfCB1bmRlZmluZWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlc0RpZmYge1xuICBba2V5OiBzdHJpbmddOiBQaWVjZSB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IHR5cGUgS2V5UGFpciA9IFtLZXksIEtleV07XG5cbmV4cG9ydCB0eXBlIE51bWJlclBhaXIgPSBbbnVtYmVyLCBudW1iZXJdO1xuXG5leHBvcnQgdHlwZSBOdW1iZXJRdWFkID0gW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVzdHMge1xuICBba2V5OiBzdHJpbmddOiBLZXlbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRzIHtcbiAgYm9hcmQ6IEhUTUxFbGVtZW50O1xuICBjb250YWluZXI6IEhUTUxFbGVtZW50O1xuICBnaG9zdD86IEhUTUxFbGVtZW50O1xuICBzdmc/OiBTVkdFbGVtZW50O1xufVxuZXhwb3J0IGludGVyZmFjZSBEb20ge1xuICBlbGVtZW50czogRWxlbWVudHMsXG4gIGJvdW5kczogTWVtbzxDbGllbnRSZWN0PjtcbiAgcmVkcmF3OiAoKSA9PiB2b2lkO1xuICByZWRyYXdOb3c6IChza2lwU3ZnPzogYm9vbGVhbikgPT4gdm9pZDtcbiAgdW5iaW5kPzogVW5iaW5kO1xuICBkZXN0cm95ZWQ/OiBib29sZWFuO1xuICByZWxhdGl2ZT86IGJvb2xlYW47IC8vIGRvbid0IGNvbXB1dGUgYm91bmRzLCB1c2UgcmVsYXRpdmUgJSB0byBwbGFjZSBwaWVjZXNcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRXhwbG9kaW5nIHtcbiAgc3RhZ2U6IG51bWJlcjtcbiAga2V5czogS2V5W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW92ZU1ldGFkYXRhIHtcbiAgcHJlbW92ZTogYm9vbGVhbjtcbiAgY3RybEtleT86IGJvb2xlYW47XG4gIGhvbGRUaW1lPzogbnVtYmVyO1xuICBjYXB0dXJlZD86IFBpZWNlO1xuICBwcmVkcm9wPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU2V0UHJlbW92ZU1ldGFkYXRhIHtcbiAgY3RybEtleT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIFdpbmRvd0V2ZW50ID0gJ29uc2Nyb2xsJyB8ICdvbnJlc2l6ZSc7XG5cbmV4cG9ydCB0eXBlIE1vdWNoRXZlbnQgPSBNb3VzZUV2ZW50ICYgVG91Y2hFdmVudDtcblxuZXhwb3J0IGludGVyZmFjZSBLZXllZE5vZGUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNnS2V5OiBLZXk7XG59XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlTm9kZSBleHRlbmRzIEtleWVkTm9kZSB7XG4gIGNnUGllY2U6IHN0cmluZztcbiAgY2dBbmltYXRpbmc/OiBib29sZWFuO1xuICBjZ0ZhZGluZz86IGJvb2xlYW47XG4gIGNnRHJhZ2dpbmc/OiBib29sZWFuO1xufVxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVOb2RlIGV4dGVuZHMgS2V5ZWROb2RlIHsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIE1lbW88QT4geyAoKTogQTsgY2xlYXI6ICgpID0+IHZvaWQ7IH1cblxuZXhwb3J0IGludGVyZmFjZSBUaW1lciB7XG4gIHN0YXJ0OiAoKSA9PiB2b2lkO1xuICBjYW5jZWw6ICgpID0+IHZvaWQ7XG4gIHN0b3A6ICgpID0+IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgUmVkcmF3ID0gKCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIFVuYmluZCA9ICgpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBNaWxsaXNlY29uZHMgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBLSHogPSBudW1iZXI7XG5cbmV4cG9ydCBjb25zdCBmaWxlczogRmlsZVtdID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnXTtcbmV4cG9ydCBjb25zdCByYW5rczogUmFua1tdID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdO1xuIiwiaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBjb25zdCBjb2xvcnM6IGNnLkNvbG9yW10gPSBbJ3doaXRlJywgJ2JsYWNrJ107XG5cbmV4cG9ydCBjb25zdCBpbnZSYW5rczogY2cuUmFua1tdID0gWzgsIDcsIDYsIDUsIDQsIDMsIDIsIDFdO1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogY2cuS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KC4uLmNnLmZpbGVzLm1hcChjID0+IGNnLnJhbmtzLm1hcChyID0+IGMrcikpKTtcblxuZXhwb3J0IGNvbnN0IHBvczJrZXkgPSAocG9zOiBjZy5Qb3MpID0+IGFsbEtleXNbOCAqIHBvc1swXSArIHBvc1sxXSAtIDldO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBjZy5LZXkpID0+IFtrLmNoYXJDb2RlQXQoMCkgLSA5Niwgay5jaGFyQ29kZUF0KDEpIC0gNDhdIGFzIGNnLlBvcztcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IGNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0OiBhbnkgPSAoKSA9PiB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkgdiA9IGYoKTtcbiAgICByZXR1cm4gdjtcbiAgfTtcbiAgcmV0LmNsZWFyID0gKCkgPT4geyB2ID0gdW5kZWZpbmVkIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBjb25zdCB0aW1lcjogKCkgPT4gY2cuVGltZXIgPSAoKSA9PiB7XG4gIGxldCBzdGFydEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIHJldHVybiB7XG4gICAgc3RhcnQoKSB7IHN0YXJ0QXQgPSBwZXJmb3JtYW5jZS5ub3coKSB9LFxuICAgIGNhbmNlbCgpIHsgc3RhcnRBdCA9IHVuZGVmaW5lZCB9LFxuICAgIHN0b3AoKSB7XG4gICAgICBpZiAoIXN0YXJ0QXQpIHJldHVybiAwO1xuICAgICAgY29uc3QgdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRBdDtcbiAgICAgIHN0YXJ0QXQgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGltZTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBvcHBvc2l0ZSA9IChjOiBjZy5Db2xvcikgPT4gYyA9PT0gJ3doaXRlJyA/ICdibGFjaycgOiAnd2hpdGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNYPFg+KHhzOiBYW10gfCB1bmRlZmluZWQsIHg6IFgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHhzICE9PSB1bmRlZmluZWQgJiYgeHMuaW5kZXhPZih4KSAhPT0gLTE7XG59XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxOiAocG9zMTogY2cuUG9zLCBwb3MyOiBjZy5Qb3MpID0+IG51bWJlciA9IChwb3MxLCBwb3MyKSA9PiB7XG4gIHJldHVybiBNYXRoLnBvdyhwb3MxWzBdIC0gcG9zMlswXSwgMikgKyBNYXRoLnBvdyhwb3MxWzFdIC0gcG9zMlsxXSwgMik7XG59XG5cbmV4cG9ydCBjb25zdCBzYW1lUGllY2U6IChwMTogY2cuUGllY2UsIHAyOiBjZy5QaWVjZSkgPT4gYm9vbGVhbiA9IChwMSwgcDIpID0+XG4gIHAxLnJvbGUgPT09IHAyLnJvbGUgJiYgcDEuY29sb3IgPT09IHAyLmNvbG9yO1xuXG5jb25zdCBwb3NUb1RyYW5zbGF0ZUJhc2U6IChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbiwgeEZhY3RvcjogbnVtYmVyLCB5RmFjdG9yOiBudW1iZXIpID0+IGNnLk51bWJlclBhaXIgPVxuKHBvcywgYXNXaGl0ZSwgeEZhY3RvciwgeUZhY3RvcikgPT4gW1xuICAoYXNXaGl0ZSA/IHBvc1swXSAtIDEgOiA4IC0gcG9zWzBdKSAqIHhGYWN0b3IsXG4gIChhc1doaXRlID8gOCAtIHBvc1sxXSA6IHBvc1sxXSAtIDEpICogeUZhY3RvclxuXTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlQWJzID0gKGJvdW5kczogQ2xpZW50UmVjdCkgPT4ge1xuICBjb25zdCB4RmFjdG9yID0gYm91bmRzLndpZHRoIC8gOCxcbiAgeUZhY3RvciA9IGJvdW5kcy5oZWlnaHQgLyA4O1xuICByZXR1cm4gKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBhc1doaXRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbDogKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBjZy5OdW1iZXJQYWlyID1cbiAgKHBvcywgYXNXaGl0ZSkgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgYXNXaGl0ZSwgMTAwLCAxMDApO1xuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlQWJzID0gKGVsOiBIVE1MRWxlbWVudCwgcG9zOiBjZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb3NbMF19cHgsJHtwb3NbMV19cHgpYDtcbn1cblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChlbDogSFRNTEVsZW1lbnQsIHBlcmNlbnRzOiBjZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwZXJjZW50c1swXX0lLCR7cGVyY2VudHNbMV19JSlgO1xufVxuXG5leHBvcnQgY29uc3Qgc2V0VmlzaWJsZSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pID0+IHtcbiAgZWwuc3R5bGUudmlzaWJpbGl0eSA9IHYgPyAndmlzaWJsZScgOiAnaGlkZGVuJztcbn1cblxuLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb246IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiBjZy5OdW1iZXJQYWlyIHwgdW5kZWZpbmVkID0gZSA9PiB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXNbMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogTW91c2VFdmVudCkgPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIHJldHVybiBlbDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGNvbG9ycywgc2V0VmlzaWJsZSwgY3JlYXRlRWwgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBmaWxlcywgcmFua3MgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgY3JlYXRlRWxlbWVudCBhcyBjcmVhdGVTVkcgfSBmcm9tICcuL3N2ZydcbmltcG9ydCB7IEVsZW1lbnRzIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd3JhcChlbGVtZW50OiBIVE1MRWxlbWVudCwgczogU3RhdGUsIHJlbGF0aXZlOiBib29sZWFuKTogRWxlbWVudHMge1xuXG4gIC8vIC5jZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBDaGVzc2dyb3VuZClcbiAgLy8gICBjZy1oZWxwZXIgKDEyLjUlKVxuICAvLyAgICAgY2ctY29udGFpbmVyICg4MDAlKVxuICAvLyAgICAgICBjZy1ib2FyZFxuICAvLyAgICAgICBzdmdcbiAgLy8gICAgICAgY29vcmRzLnJhbmtzXG4gIC8vICAgICAgIGNvb3Jkcy5maWxlc1xuICAvLyAgICAgICBwaWVjZS5naG9zdFxuXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG5cbiAgLy8gZW5zdXJlIHRoZSBjZy13cmFwIGNsYXNzIGlzIHNldFxuICAvLyBzbyBib3VuZHMgY2FsY3VsYXRpb24gY2FuIHVzZSB0aGUgQ1NTIHdpZHRoL2hlaWdodCB2YWx1ZXNcbiAgLy8gYWRkIHRoYXQgY2xhc3MgeW91cnNlbGYgdG8gdGhlIGVsZW1lbnQgYmVmb3JlIGNhbGxpbmcgY2hlc3Nncm91bmRcbiAgLy8gZm9yIGEgc2xpZ2h0IHBlcmZvcm1hbmNlIGltcHJvdmVtZW50ISAoYXZvaWRzIHJlY29tcHV0aW5nIHN0eWxlKVxuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NnLXdyYXAnKTtcblxuICBjb2xvcnMuZm9yRWFjaChjID0+IGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnb3JpZW50YXRpb24tJyArIGMsIHMub3JpZW50YXRpb24gPT09IGMpKTtcbiAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICBjb25zdCBoZWxwZXIgPSBjcmVhdGVFbCgnY2ctaGVscGVyJyk7XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaGVscGVyKTtcbiAgY29uc3QgY29udGFpbmVyID0gY3JlYXRlRWwoJ2NnLWNvbnRhaW5lcicpO1xuICBoZWxwZXIuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdjZy1ib2FyZCcpO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBzdmc6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUgJiYgIXJlbGF0aXZlKSB7XG4gICAgc3ZnID0gY3JlYXRlU1ZHKCdzdmcnKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHKCdkZWZzJykpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzdmcpO1xuICB9XG5cbiAgaWYgKHMuY29vcmRpbmF0ZXMpIHtcbiAgICBjb25zdCBvcmllbnRDbGFzcyA9IHMub3JpZW50YXRpb24gPT09ICdibGFjaycgPyAnIGJsYWNrJyA6ICcnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMocmFua3MsICdyYW5rcycgKyBvcmllbnRDbGFzcykpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcykpO1xuICB9XG5cbiAgbGV0IGdob3N0OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuZHJhZ2dhYmxlLnNob3dHaG9zdCAmJiAhcmVsYXRpdmUpIHtcbiAgICBnaG9zdCA9IGNyZWF0ZUVsKCdwaWVjZScsICdnaG9zdCcpO1xuICAgIHNldFZpc2libGUoZ2hvc3QsIGZhbHNlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2hvc3QpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZCxcbiAgICBjb250YWluZXIsXG4gICAgZ2hvc3QsXG4gICAgc3ZnXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNvb3JkcyhlbGVtczogYW55W10sIGNsYXNzTmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsKCdjb29yZHMnLCBjbGFzc05hbWUpO1xuICBsZXQgZjogSFRNTEVsZW1lbnQ7XG4gIGZvciAobGV0IGkgaW4gZWxlbXMpIHtcbiAgICBmID0gY3JlYXRlRWwoJ2Nvb3JkJyk7XG4gICAgZi50ZXh0Q29udGVudCA9IGVsZW1zW2ldO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuZnVuY3Rpb24gYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCkge1xuICAgIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICAgIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZERhdGEgPSBjaGlsZHJlbltpXS5kYXRhO1xuICAgICAgICAgICAgaWYgKGNoaWxkRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWRkTlMoY2hpbGREYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGgoc2VsLCBiLCBjKSB7XG4gICAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhID0gYjtcbiAgICAgICAgaWYgKGlzLmFycmF5KGMpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjICYmIGMuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtjXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzLmFycmF5KGIpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiICYmIGIuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtiXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSlcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IHZub2RlXzEudm5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxbMF0gPT09ICdzJyAmJiBzZWxbMV0gPT09ICd2JyAmJiBzZWxbMl0gPT09ICdnJyAmJlxuICAgICAgICAoc2VsLmxlbmd0aCA9PT0gMyB8fCBzZWxbM10gPT09ICcuJyB8fCBzZWxbM10gPT09ICcjJykpIHtcbiAgICAgICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZV8xLnZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59XG5leHBvcnRzLmggPSBoO1xuO1xuZXhwb3J0cy5kZWZhdWx0ID0gaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xufVxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpIHtcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCkge1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuZnVuY3Rpb24gcGFyZW50Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cbmZ1bmN0aW9uIHRhZ05hbWUoZWxtKSB7XG4gICAgcmV0dXJuIGVsbS50YWdOYW1lO1xufVxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCkge1xuICAgIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRleHRDb250ZW50O1xufVxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cbmZ1bmN0aW9uIGlzVGV4dChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5leHBvcnRzLmh0bWxEb21BcGkgPSB7XG4gICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgICBjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcbiAgICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBnZXRUZXh0Q29udGVudDogZ2V0VGV4dENvbnRlbnQsXG4gICAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gICAgaXNUZXh0OiBpc1RleHQsXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5odG1sRG9tQXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbGRvbWFwaS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYXJyYXkgPSBBcnJheS5pc0FycmF5O1xuZnVuY3Rpb24gcHJpbWl0aXZlKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMucHJpbWl0aXZlID0gcHJpbWl0aXZlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIga2V5LCBlbG0gPSB2bm9kZS5lbG0sIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzO1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgdmFyIGN1ciA9IGF0dHJzW2tleV07XG4gICAgICAgIHZhciBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgICAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgICAgICAgIGlmIChjdXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZShrZXksIGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdpZCcsIHNlbC5zbGljZShoYXNoICsgMSwgZG90KSk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdjbGFzcycsIHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAob2xkQXJnc1tpXSAhPT0gYXJnc1tpXSkge1xuICAgICAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5VG9UaHVuayhvbGRWbm9kZSwgdGh1bmspO1xufVxuZXhwb3J0cy50aHVuayA9IGZ1bmN0aW9uIHRodW5rKHNlbCwga2V5LCBmbiwgYXJncykge1xuICAgIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncyA9IGZuO1xuICAgICAgICBmbiA9IGtleTtcbiAgICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaF8xLmgoc2VsLCB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBob29rOiB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCB9LFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnRodW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGh1bmsuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB2bm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gICAgcmV0dXJuIHsgc2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5IH07XG59XG5leHBvcnRzLnZub2RlID0gdm5vZGU7XG5leHBvcnRzLmRlZmF1bHQgPSB2bm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZub2RlLmpzLm1hcCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY2ZnLCBlbGVtZW50KSB7XG4gIHZhciBwb29scyA9IFt7aWQ6XCIxKzBcIixsaW06MSxpbmM6MCxwZXJmOlwiQnVsbGV0XCJ9LHtpZDpcIjIrMVwiLGxpbToyLGluYzoxLHBlcmY6XCJCdWxsZXRcIn0se2lkOlwiMyswXCIsbGltOjMsaW5jOjAscGVyZjpcIkJsaXR6XCJ9LHtcImlkXCI6XCIzKzJcIixcImxpbVwiOjMsXCJpbmNcIjoyLFwicGVyZlwiOlwiQmxpdHpcIn0se2lkOlwiNSswXCIsbGltOjUsaW5jOjAscGVyZjpcIkJsaXR6XCJ9LHtcImlkXCI6XCI1KzNcIixcImxpbVwiOjUsXCJpbmNcIjozLFwicGVyZlwiOlwiQmxpdHpcIn0se2lkOlwiMTArMFwiLGxpbToxMCxpbmM6MCxwZXJmOlwiUmFwaWRcIn0se2lkOlwiMTUrMTVcIixsaW06MTUsaW5jOjE1LHBlcmY6XCJDbGFzc2ljYWxcIn1dO1xuICB2YXIgbG9iYnk7XG4gIHZhciBuYlJvdW5kU3ByZWFkID0gc3ByZWFkTnVtYmVyKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuYl9nYW1lc19pbl9wbGF5ID4gc3Ryb25nJyksXG4gICAgOCxcbiAgICBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBsaWNoZXNzLnNvY2tldC5waW5nSW50ZXJ2YWwoKTtcbiAgICB9KTtcbiAgdmFyIG5iVXNlclNwcmVhZCA9IHNwcmVhZE51bWJlcihcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmJfY29ubmVjdGVkX3BsYXllcnMgPiBzdHJvbmcnKSxcbiAgICAxMCxcbiAgICBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBsaWNoZXNzLnNvY2tldC5waW5nSW50ZXJ2YWwoKTtcbiAgICB9KTtcbiAgdmFyIGdldFBhcmFtZXRlckJ5TmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWF0Y2ggPSBSZWdFeHAoJ1s/Jl0nICsgbmFtZSArICc9KFteJl0qKScpLmV4ZWMobG9jYXRpb24uc2VhcmNoKTtcbiAgICByZXR1cm4gbWF0Y2ggJiYgZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbiAgfTtcbiAgdmFyIG9uRmlyc3RDb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGdhbWVJZCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnaG9va19saWtlJyk7XG4gICAgaWYgKCFnYW1lSWQpIHJldHVybjtcbiAgICAkLnBvc3QoJy9zZXR1cC9ob29rLycgKyBsaWNoZXNzLnNyaSArICcvbGlrZS8nICsgZ2FtZUlkKTtcbiAgICBsb2JieS5zZXRUYWIoJ3JlYWxfdGltZScpO1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIG51bGwsICcvJyk7XG4gIH07XG4gIHZhciBmaWx0ZXJTdHJlYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxhbmdzID0gbmF2aWdhdG9yLmxhbmd1YWdlcztcbiAgICBpZiAoIWxhbmdzKSByZXR1cm47IC8vIHRzcy4uLiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTmF2aWdhdG9yTGFuZ3VhZ2UvbGFuZ3VhZ2VzXG4gICAgbGFuZ3MgPSBsYW5ncy5tYXAoZnVuY3Rpb24obCkge1xuICAgICAgcmV0dXJuIGwuc2xpY2UoMCwgMikudG9Mb3dlckNhc2UoKTtcbiAgICB9KTtcbiAgICBsYW5ncy5wdXNoKCQoJ2h0bWwnKS5hdHRyKCdsYW5nJykpO1xuICAgICQoJy5sb2JieV9fc3RyZWFtcyBhLCAuZXZlbnQtc3BvdGxpZ2h0JykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBtYXRjaCA9ICQodGhpcykudGV4dCgpLm1hdGNoKC9cXFsoXFx3ezJ9KVxcXS9taSk7XG4gICAgICBpZiAobWF0Y2ggJiYgIWxhbmdzLmluY2x1ZGVzKG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkpKSAkKHRoaXMpLmhpZGUoKTtcbiAgICB9KTtcbiAgfTtcbiAgZmlsdGVyU3RyZWFtcygpO1xuICBsaWNoZXNzLnNvY2tldCA9IGxpY2hlc3MuU3Ryb25nU29ja2V0KFxuICAgICcvbG9iYnkvc29ja2V0L3Y0JyxcbiAgICBmYWxzZSwge1xuICAgICAgcmVjZWl2ZTogZnVuY3Rpb24odCwgZCkge1xuICAgICAgICBsb2JieS5zb2NrZXRSZWNlaXZlKHQsIGQpO1xuICAgICAgfSxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICBuOiBmdW5jdGlvbihuYlVzZXJzLCBtc2cpIHtcbiAgICAgICAgICBuYlVzZXJTcHJlYWQobXNnLmQpO1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBuYlJvdW5kU3ByZWFkKG1zZy5yKTtcbiAgICAgICAgICB9LCBsaWNoZXNzLnNvY2tldC5waW5nSW50ZXJ2YWwoKSAvIDIpO1xuICAgICAgICB9LFxuICAgICAgICByZWxvYWRfdGltZWxpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6ICcvdGltZWxpbmUnLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgICAkKCcudGltZWxpbmUnKS5odG1sKGh0bWwpO1xuICAgICAgICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdjb250ZW50X2xvYWRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBzdHJlYW1zOiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgJCgnLmxvYmJ5X19zdHJlYW1zJykuaHRtbChodG1sKTtcbiAgICAgICAgICBmaWx0ZXJTdHJlYW1zKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGZlYXR1cmVkOiBmdW5jdGlvbihvKSB7XG4gICAgICAgICAgJCgnLmxvYmJ5X190dicpLmh0bWwoby5odG1sKTtcbiAgICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdjb250ZW50X2xvYWRlZCcpO1xuICAgICAgICB9LFxuICAgICAgICByZWRpcmVjdDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGxvYmJ5LmxlYXZlUG9vbCgpO1xuICAgICAgICAgIGxvYmJ5LnNldFJlZGlyZWN0aW5nKCk7XG4gICAgICAgICAgd2luZG93LmxpY2hlc3MucmVkaXJlY3QoZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRvdXJuYW1lbnRzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgJChcIiNlbnRlcmFibGVfdG91cm5hbWVudHNcIikuaHRtbChkYXRhKTtcbiAgICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdjb250ZW50X2xvYWRlZCcpO1xuICAgICAgICB9LFxuICAgICAgICBzaW11bHM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAkKFwiI2VudGVyYWJsZV9zaW11bHNcIikuaHRtbChkYXRhKS5wYXJlbnQoKS50b2dnbGUoJCgnI2VudGVyYWJsZV9zaW11bHMgdHInKS5sZW5ndGggPiAwKTtcbiAgICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdjb250ZW50X2xvYWRlZCcpO1xuICAgICAgICB9LFxuICAgICAgICBmZW46IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBsaWNoZXNzLlN0cm9uZ1NvY2tldC5kZWZhdWx0cy5ldmVudHMuZmVuKGUpO1xuICAgICAgICAgIGxvYmJ5LmdhbWVBY3Rpdml0eShlLmlkKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgbmFtZTogJ2xvYmJ5JyxcbiAgICAgICAgb25GaXJzdENvbm5lY3Q6IG9uRmlyc3RDb25uZWN0XG4gICAgICB9XG4gICAgfSk7XG5cbiAgY2ZnLnRyYW5zID0gbGljaGVzcy50cmFucyhjZmcuaTE4bik7XG4gIGNmZy5zb2NrZXRTZW5kID0gbGljaGVzcy5zb2NrZXQuc2VuZDtcbiAgY2ZnLmVsZW1lbnQgPSBlbGVtZW50O1xuICBjZmcucG9vbHMgPSBwb29scztcbiAgbG9iYnkgPSBMaWNoZXNzTG9iYnkuc3RhcnQoY2ZnKTtcblxuICB2YXIgYmxpbmRNb2RlID0gJCgnYm9keScpLmhhc0NsYXNzKCdibGluZC1tb2RlJyk7XG5cbiAgdmFyICRzdGFydEJ1dHRvbnMgPSAkKCcubG9iYnlfX3N0YXJ0Jyk7XG5cbiAgdmFyIHNsaWRlclRpbWVzID0gW1xuICAgIDAsIDEvNCwgMS8yLCAzLzQsIDEsIDMvMiwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIFxuICAgIDE3LCAxOCwgMTksIDIwLCAyNSwgMzAsIDM1LCA0MCwgNDUsIDYwLCA3NSwgOTAsIDEwNSwgMTIwLCAxMzUsIDE1MCwgMTY1LCAxODBcbiAgXTtcblxuICBmdW5jdGlvbiBzbGlkZXJUaW1lKHYpIHtcbiAgICByZXR1cm4gdiA8IHNsaWRlclRpbWVzLmxlbmd0aCA/IHNsaWRlclRpbWVzW3ZdIDogMTgwO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd1RpbWUodikge1xuICAgIGlmICh2ID09PSAxIC8gNCkgcmV0dXJuICfCvCc7XG4gICAgaWYgKHYgPT09IDEgLyAyKSByZXR1cm4gJ8K9JztcbiAgICBpZiAodiA9PT0gMyAvIDQpIHJldHVybiAnwr4nO1xuICAgIHJldHVybiB2O1xuICB9XG5cbiAgZnVuY3Rpb24gc2xpZGVySW5jcmVtZW50KHYpIHtcbiAgICBpZiAodiA8PSAyMCkgcmV0dXJuIHY7XG4gICAgc3dpdGNoICh2KSB7XG4gICAgICBjYXNlIDIxOlxuICAgICAgICByZXR1cm4gMjU7XG4gICAgICBjYXNlIDIyOlxuICAgICAgICByZXR1cm4gMzA7XG4gICAgICBjYXNlIDIzOlxuICAgICAgICByZXR1cm4gMzU7XG4gICAgICBjYXNlIDI0OlxuICAgICAgICByZXR1cm4gNDA7XG4gICAgICBjYXNlIDI1OlxuICAgICAgICByZXR1cm4gNDU7XG4gICAgICBjYXNlIDI2OlxuICAgICAgICByZXR1cm4gNjA7XG4gICAgICBjYXNlIDI3OlxuICAgICAgICByZXR1cm4gOTA7XG4gICAgICBjYXNlIDI4OlxuICAgICAgICByZXR1cm4gMTIwO1xuICAgICAgY2FzZSAyOTpcbiAgICAgICAgcmV0dXJuIDE1MDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAxODA7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2xpZGVyRGF5cyh2KSB7XG4gICAgaWYgKHYgPD0gMykgcmV0dXJuIHY7XG4gICAgc3dpdGNoICh2KSB7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHJldHVybiA1O1xuICAgICAgY2FzZSA1OlxuICAgICAgICByZXR1cm4gNztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgcmV0dXJuIDEwO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIDE0O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNsaWRlckluaXRWYWwodiwgZiwgbWF4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXg7IGkrKykge1xuICAgICAgaWYgKGYoaSkgPT09IHYpIHJldHVybiBpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhvb2tUb1Bvb2xNZW1iZXIoY29sb3IsIGRhdGEpIHtcbiAgICB2YXIgaGFzaCA9IHt9O1xuICAgIGZvciAodmFyIGkgaW4gZGF0YSkgaGFzaFtkYXRhW2ldLm5hbWVdID0gZGF0YVtpXS52YWx1ZTtcbiAgICB2YXIgdmFsaWQgPSBjb2xvciA9PSAncmFuZG9tJyAmJiBoYXNoLnZhcmlhbnQgPT0gMSAmJiBoYXNoLm1vZGUgPT0gMSAmJiBoYXNoLnRpbWVNb2RlID09IDE7XG4gICAgdmFyIGlkID0gcGFyc2VGbG9hdChoYXNoLnRpbWUpICsgJysnICsgcGFyc2VJbnQoaGFzaC5pbmNyZW1lbnQpO1xuICAgIHZhciBleGlzdHMgPSBwb29scy5maW5kKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuaWQgPT09IGlkOyB9KTtcbiAgICBpZiAodmFsaWQgJiYgZXhpc3RzKSByZXR1cm4ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgcmFuZ2U6IGhhc2gucmF0aW5nUmFuZ2VcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcHJlcGFyZUZvcm0oJG1vZGFsKSB7XG4gICAgdmFyICRmb3JtID0gJG1vZGFsLmZpbmQoJ2Zvcm0nKTtcbiAgICB2YXIgJHRpbWVNb2RlU2VsZWN0ID0gJGZvcm0uZmluZCgnI3NmX3RpbWVNb2RlJyk7XG4gICAgdmFyICRtb2RlQ2hvaWNlc1dyYXAgPSAkZm9ybS5maW5kKCcubW9kZV9jaG9pY2UnKTtcbiAgICB2YXIgJG1vZGVDaG9pY2VzID0gJG1vZGVDaG9pY2VzV3JhcC5maW5kKCdpbnB1dCcpO1xuICAgIHZhciAkY2FzdWFsID0gJG1vZGVDaG9pY2VzLmVxKDApLFxuICAgICAgJHJhdGVkID0gJG1vZGVDaG9pY2VzLmVxKDEpO1xuICAgIHZhciAkdmFyaWFudFNlbGVjdCA9ICRmb3JtLmZpbmQoJyNzZl92YXJpYW50Jyk7XG4gICAgdmFyICRmZW5Qb3NpdGlvbiA9ICRmb3JtLmZpbmQoXCIuZmVuX3Bvc2l0aW9uXCIpO1xuICAgIHZhciAkdGltZUlucHV0ID0gJGZvcm0uZmluZCgnLnRpbWVfY2hvaWNlIFtuYW1lPXRpbWVdJyk7XG4gICAgdmFyICRpbmNyZW1lbnRJbnB1dCA9ICRmb3JtLmZpbmQoJy5pbmNyZW1lbnRfY2hvaWNlIFtuYW1lPWluY3JlbWVudF0nKTtcbiAgICB2YXIgJGRheXNJbnB1dCA9ICRmb3JtLmZpbmQoJy5kYXlzX2Nob2ljZSBbbmFtZT1kYXlzXScpO1xuICAgIHZhciB0eXAgPSAkZm9ybS5kYXRhKCd0eXBlJyk7XG4gICAgdmFyICRyYXRpbmdzID0gJG1vZGFsLmZpbmQoJy5yYXRpbmdzID4gZGl2Jyk7XG4gICAgdmFyIHJhbmRvbUNvbG9yVmFyaWFudHMgPSAkZm9ybS5kYXRhKCdyYW5kb20tY29sb3ItdmFyaWFudHMnKS5zcGxpdCgnLCcpO1xuICAgIHZhciAkc3VibWl0cyA9ICRmb3JtLmZpbmQoJy5jb2xvci1zdWJtaXRzX19idXR0b24nKTtcbiAgICB2YXIgdG9nZ2xlQnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhcmlhbnRJZCA9ICR2YXJpYW50U2VsZWN0LnZhbCgpO1xuICAgICAgdmFyIHRpbWVNb2RlID0gJHRpbWVNb2RlU2VsZWN0LnZhbCgpO1xuICAgICAgdmFyIHJhdGVkID0gJHJhdGVkLnByb3AoJ2NoZWNrZWQnKTtcbiAgICAgIHZhciBsaW1pdCA9ICR0aW1lSW5wdXQudmFsKCk7XG4gICAgICB2YXIgaW5jID0gJGluY3JlbWVudElucHV0LnZhbCgpO1xuICAgICAgLy8gbm8gcmF0ZWQgdmFyaWFudHMgd2l0aCBsZXNzIHRoYW4gMzBzIG9uIHRoZSBjbG9ja1xuICAgICAgdmFyIGNhbnRCZVJhdGVkID0gKHRpbWVNb2RlID09ICcxJyAmJiB2YXJpYW50SWQgIT0gJzEnICYmIGxpbWl0IDwgMC41ICYmIGluYyA9PSAwKSB8fFxuICAgICAgICAodmFyaWFudElkICE9ICcxJyAmJiB0aW1lTW9kZSAhPSAnMScpO1xuICAgICAgaWYgKGNhbnRCZVJhdGVkICYmIHJhdGVkKSB7XG4gICAgICAgICRjYXN1YWwuY2xpY2soKTtcbiAgICAgICAgcmV0dXJuIHRvZ2dsZUJ1dHRvbnMoKTtcbiAgICAgIH1cbiAgICAgICRyYXRlZC5hdHRyKCdkaXNhYmxlZCcsIGNhbnRCZVJhdGVkKS5zaWJsaW5ncygnbGFiZWwnKS50b2dnbGVDbGFzcygnZGlzYWJsZWQnLCBjYW50QmVSYXRlZCk7XG4gICAgICB2YXIgdGltZU9rID0gdGltZU1vZGUgIT0gJzEnIHx8IGxpbWl0ID4gMCB8fCBpbmMgPiAwO1xuICAgICAgdmFyIHJhdGVkT2sgPSB0eXAgIT0gJ2hvb2snIHx8ICFyYXRlZCB8fCB0aW1lTW9kZSAhPSAnMCc7XG4gICAgICB2YXIgYWlPayA9IHR5cCAhPSAnYWknIHx8IHZhcmlhbnRJZCAhPSAnMycgfHwgbGltaXQgPj0gMTtcbiAgICAgIGlmICh0aW1lT2sgJiYgcmF0ZWRPayAmJiBhaU9rKSB7XG4gICAgICAgICRzdWJtaXRzLnRvZ2dsZUNsYXNzKCdub3BlJywgZmFsc2UpO1xuICAgICAgICAkc3VibWl0cy5maWx0ZXIoJzpub3QoLnJhbmRvbSknKS50b2dnbGUoIXJhdGVkIHx8ICFyYW5kb21Db2xvclZhcmlhbnRzLmluY2x1ZGVzKHZhcmlhbnRJZCkpO1xuICAgICAgfSBlbHNlICRzdWJtaXRzLnRvZ2dsZUNsYXNzKCdub3BlJywgdHJ1ZSk7XG4gICAgfTtcbiAgICB2YXIgc2hvd1JhdGluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVNb2RlID0gJHRpbWVNb2RlU2VsZWN0LnZhbCgpO1xuICAgICAgdmFyIGtleTtcbiAgICAgIHN3aXRjaCAoJHZhcmlhbnRTZWxlY3QudmFsKCkpIHtcbiAgICAgICAgY2FzZSAnMSc6XG4gICAgICAgIGNhc2UgJzMnOlxuICAgICAgICAgIGlmICh0aW1lTW9kZSA9PSAnMScpIHtcbiAgICAgICAgICAgIHZhciB0aW1lID0gJHRpbWVJbnB1dC52YWwoKSAqIDYwICsgJGluY3JlbWVudElucHV0LnZhbCgpICogNDA7XG4gICAgICAgICAgICBpZiAodGltZSA8IDMwKSBrZXkgPSAndWx0cmFCdWxsZXQnO1xuICAgICAgICAgICAgZWxzZSBpZiAodGltZSA8IDE4MCkga2V5ID0gJ2J1bGxldCc7XG4gICAgICAgICAgICBlbHNlIGlmICh0aW1lIDwgNDgwKSBrZXkgPSAnYmxpdHonO1xuICAgICAgICAgICAgZWxzZSBpZiAodGltZSA8IDE1MDApIGtleSA9ICdyYXBpZCc7XG4gICAgICAgICAgICBlbHNlIGtleSA9ICdjbGFzc2ljYWwnO1xuICAgICAgICAgIH0gZWxzZSBrZXkgPSAnY29ycmVzcG9uZGVuY2UnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcxMCc6XG4gICAgICAgICAga2V5ID0gJ2NyYXp5aG91c2UnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcyJzpcbiAgICAgICAgICBrZXkgPSAnY2hlc3M5NjAnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICc0JzpcbiAgICAgICAgICBrZXkgPSAna2luZ09mVGhlSGlsbCc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzUnOlxuICAgICAgICAgIGtleSA9ICd0aHJlZUNoZWNrJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnNic6XG4gICAgICAgICAga2V5ID0gJ2FudGljaGVzcydcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnNyc6XG4gICAgICAgICAga2V5ID0gJ2F0b21pYydcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnOCc6XG4gICAgICAgICAga2V5ID0gXCJob3JkZVwiXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJzknOlxuICAgICAgICAgIGtleSA9IFwicmFjaW5nS2luZ3NcIlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgJHJhdGluZ3MuaGlkZSgpLmZpbHRlcignLicgKyBrZXkpLnNob3coKTtcbiAgICB9O1xuICAgIGlmICh0eXAgPT0gJ2hvb2snKSB7XG4gICAgICBpZiAoJGZvcm0uZGF0YSgnYW5vbicpKSB7XG4gICAgICAgICR0aW1lTW9kZVNlbGVjdC52YWwoMSlcbiAgICAgICAgICAuY2hpbGRyZW4oJy50aW1lTW9kZV8yLCAudGltZU1vZGVfMCcpXG4gICAgICAgICAgLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSlcbiAgICAgICAgICAuYXR0cigndGl0bGUnLCBjZmcudHJhbnMoJ3lvdU5lZWRBbkFjY291bnRUb0RvVGhhdCcpKTtcbiAgICAgIH1cbiAgICAgIHZhciBhamF4U3VibWl0ID0gZnVuY3Rpb24oY29sb3IpIHtcbiAgICAgICAgdmFyIHBvb2xNZW1iZXIgPSBob29rVG9Qb29sTWVtYmVyKGNvbG9yLCAkZm9ybS5zZXJpYWxpemVBcnJheSgpKTtcbiAgICAgICAgJC5tb2RhbC5jbG9zZSgpO1xuICAgICAgICB2YXIgY2FsbCA9IHtcbiAgICAgICAgICB1cmw6ICRmb3JtLmF0dHIoJ2FjdGlvbicpLnJlcGxhY2UoL3NyaS1wbGFjZWhvbGRlci8sIGxpY2hlc3Muc3JpKSxcbiAgICAgICAgICBkYXRhOiAkZm9ybS5zZXJpYWxpemUoKSArIFwiJmNvbG9yPVwiICsgY29sb3IsXG4gICAgICAgICAgdHlwZTogJ3Bvc3QnXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwb29sTWVtYmVyKSB7XG4gICAgICAgICAgbG9iYnkuZW50ZXJQb29sKHBvb2xNZW1iZXIpO1xuICAgICAgICAgIGxvYmJ5LnJlZHJhdygpO1xuICAgICAgICAgIGNhbGwudXJsICs9ICc/cG9vbD0xJztcbiAgICAgICAgfSBlbHNlIGxvYmJ5LnNldFRhYigkdGltZU1vZGVTZWxlY3QudmFsKCkgPT09ICcxJyA/ICdyZWFsX3RpbWUnIDogJ3NlZWtzJyk7XG4gICAgICAgICQuYWpheChjYWxsKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcbiAgICAgICRzdWJtaXRzLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYWpheFN1Ym1pdCgkKHRoaXMpLnZhbCgpKTtcbiAgICAgIH0pLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgJGZvcm0uc3VibWl0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYWpheFN1Ym1pdCgncmFuZG9tJyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgJGZvcm0ub25lKCdzdWJtaXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICRzdWJtaXRzLmhpZGUoKS5lbmQoKS5hcHBlbmQobGljaGVzcy5zcGlubmVySHRtbCk7XG4gICAgfSk7XG4gICAgaWYgKGJsaW5kTW9kZSkge1xuICAgICAgJHZhcmlhbnRTZWxlY3QuZm9jdXMoKTtcbiAgICAgICR0aW1lSW5wdXQuYWRkKCRpbmNyZW1lbnRJbnB1dCkub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0b2dnbGVCdXR0b25zKCk7XG4gICAgICAgIHNob3dSYXRpbmcoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBsaWNoZXNzLnNsaWRlcigpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAkdGltZUlucHV0LmFkZCgkaW5jcmVtZW50SW5wdXQpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSAkKHRoaXMpLFxuICAgICAgICAgICR2YWx1ZSA9ICRpbnB1dC5zaWJsaW5ncygnc3BhbicpO1xuICAgICAgICB2YXIgaXNUaW1lU2xpZGVyID0gJGlucHV0LnBhcmVudCgpLmhhc0NsYXNzKCd0aW1lX2Nob2ljZScpO1xuICAgICAgICAkaW5wdXQuYWZ0ZXIoJCgnPGRpdj4nKS5zbGlkZXIoe1xuICAgICAgICAgIHZhbHVlOiBzbGlkZXJJbml0VmFsKHBhcnNlRmxvYXQoJGlucHV0LnZhbCgpKSwgaXNUaW1lU2xpZGVyID8gc2xpZGVyVGltZSA6IHNsaWRlckluY3JlbWVudCwgMTAwKSxcbiAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgbWF4OiBpc1RpbWVTbGlkZXIgPyAzOCA6IDMwLFxuICAgICAgICAgIHJhbmdlOiAnbWluJyxcbiAgICAgICAgICBzdGVwOiAxLFxuICAgICAgICAgIHNsaWRlOiBmdW5jdGlvbihldmVudCwgdWkpIHtcbiAgICAgICAgICAgIHZhciB0aW1lID0gKGlzVGltZVNsaWRlciA/IHNsaWRlclRpbWUgOiBzbGlkZXJJbmNyZW1lbnQpKHVpLnZhbHVlKTtcbiAgICAgICAgICAgICR2YWx1ZS50ZXh0KGlzVGltZVNsaWRlciA/IHNob3dUaW1lKHRpbWUpIDogdGltZSk7XG4gICAgICAgICAgICAkaW5wdXQuYXR0cigndmFsdWUnLCB0aW1lKTtcbiAgICAgICAgICAgIHNob3dSYXRpbmcoKTtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbnMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgICAgJGRheXNJbnB1dC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGlucHV0ID0gJCh0aGlzKSxcbiAgICAgICAgICAkdmFsdWUgPSAkaW5wdXQuc2libGluZ3MoJ3NwYW4nKTtcbiAgICAgICAgJGlucHV0LmFmdGVyKCQoJzxkaXY+Jykuc2xpZGVyKHtcbiAgICAgICAgICB2YWx1ZTogc2xpZGVySW5pdFZhbChwYXJzZUludCgkaW5wdXQudmFsKCkpLCBzbGlkZXJEYXlzLCAyMCksXG4gICAgICAgICAgbWluOiAxLFxuICAgICAgICAgIG1heDogNyxcbiAgICAgICAgICByYW5nZTogJ21pbicsXG4gICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICBzbGlkZTogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG4gICAgICAgICAgICB2YXIgZGF5cyA9IHNsaWRlckRheXModWkudmFsdWUpO1xuICAgICAgICAgICAgJHZhbHVlLnRleHQoZGF5cyk7XG4gICAgICAgICAgICAkaW5wdXQuYXR0cigndmFsdWUnLCBkYXlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgICAgJGZvcm0uZmluZCgnLnJhdGluZy1yYW5nZScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkaW5wdXQgPSAkdGhpcy5maW5kKFwiaW5wdXRcIik7XG4gICAgICAgIHZhciAkc3BhbiA9ICR0aGlzLnNpYmxpbmdzKFwic3Bhbi5yYW5nZVwiKTtcbiAgICAgICAgdmFyIG1pbiA9ICRpbnB1dC5kYXRhKFwibWluXCIpO1xuICAgICAgICB2YXIgbWF4ID0gJGlucHV0LmRhdGEoXCJtYXhcIik7XG4gICAgICAgIHZhciB2YWx1ZXMgPSAkaW5wdXQudmFsKCkgPyAkaW5wdXQudmFsKCkuc3BsaXQoXCItXCIpIDogW21pbiwgbWF4XTtcblxuICAgICAgICAkc3Bhbi50ZXh0KHZhbHVlcy5qb2luKCfigJMnKSk7XG4gICAgICAgICR0aGlzLnNsaWRlcih7XG4gICAgICAgICAgcmFuZ2U6IHRydWUsXG4gICAgICAgICAgbWluOiBtaW4sXG4gICAgICAgICAgbWF4OiBtYXgsXG4gICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgc3RlcDogNTAsXG4gICAgICAgICAgc2xpZGU6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgJGlucHV0LnZhbCh1aS52YWx1ZXNbMF0gKyBcIi1cIiArIHVpLnZhbHVlc1sxXSk7XG4gICAgICAgICAgICAkc3Bhbi50ZXh0KHVpLnZhbHVlc1swXSArIFwi4oCTXCIgKyB1aS52YWx1ZXNbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICAkdGltZU1vZGVTZWxlY3Qub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVNb2RlID0gJCh0aGlzKS52YWwoKTtcbiAgICAgICRmb3JtLmZpbmQoJy50aW1lX2Nob2ljZSwgLmluY3JlbWVudF9jaG9pY2UnKS50b2dnbGUodGltZU1vZGUgPT0gJzEnKTtcbiAgICAgICRmb3JtLmZpbmQoJy5kYXlzX2Nob2ljZScpLnRvZ2dsZSh0aW1lTW9kZSA9PSAnMicpO1xuICAgICAgdG9nZ2xlQnV0dG9ucygpO1xuICAgICAgc2hvd1JhdGluZygpO1xuICAgIH0pLnRyaWdnZXIoJ2NoYW5nZScpO1xuXG4gICAgdmFyICRmZW5JbnB1dCA9ICRmZW5Qb3NpdGlvbi5maW5kKCdpbnB1dCcpO1xuICAgIHZhciB2YWxpZGF0ZUZlbiA9IGxpY2hlc3MuZGVib3VuY2UoZnVuY3Rpb24oKSB7XG4gICAgICAkZmVuSW5wdXQucmVtb3ZlQ2xhc3MoXCJzdWNjZXNzIGZhaWx1cmVcIik7XG4gICAgICB2YXIgZmVuID0gJGZlbklucHV0LnZhbCgpO1xuICAgICAgaWYgKGZlbikge1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJGZlbklucHV0LnBhcmVudCgpLmRhdGEoJ3ZhbGlkYXRlLXVybCcpLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGZlbjogZmVuXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAkZmVuSW5wdXQuYWRkQ2xhc3MoXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgJGZlblBvc2l0aW9uLmZpbmQoJy5wcmV2aWV3JykuaHRtbChkYXRhKTtcbiAgICAgICAgICAgICRmZW5Qb3NpdGlvbi5maW5kKCdhLmJvYXJkX2VkaXRvcicpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICQodGhpcykuYXR0cignaHJlZicsICQodGhpcykuYXR0cignaHJlZicpLnJlcGxhY2UoL2VkaXRvclxcLy4rJC8sIFwiZWRpdG9yL1wiICsgZmVuKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRzdWJtaXRzLnJlbW92ZUNsYXNzKCdub3BlJyk7XG4gICAgICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdjb250ZW50X2xvYWRlZCcpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGZlbklucHV0LmFkZENsYXNzKFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgICRmZW5Qb3NpdGlvbi5maW5kKCcucHJldmlldycpLmh0bWwoXCJcIik7XG4gICAgICAgICAgICAkc3VibWl0cy5hZGRDbGFzcygnbm9wZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgMjAwKTtcbiAgICAkZmVuSW5wdXQub24oJ2tleXVwJywgdmFsaWRhdGVGZW4pO1xuXG4gICAgJHZhcmlhbnRTZWxlY3Qub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZlbiA9ICQodGhpcykudmFsKCkgPT0gJzMnO1xuICAgICAgJGZlblBvc2l0aW9uLnRvZ2dsZShmZW4pO1xuICAgICAgJG1vZGVDaG9pY2VzV3JhcC50b2dnbGUoIWZlbik7XG4gICAgICBpZiAoZmVuKSB7XG4gICAgICAgICRjYXN1YWwuY2xpY2soKTtcbiAgICAgICAgbGljaGVzcy5yYWYoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hlc3Nncm91bmQucmVzaXplJykpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHNob3dSYXRpbmcoKTtcbiAgICAgIHRvZ2dsZUJ1dHRvbnMoKTtcbiAgICB9KS50cmlnZ2VyKCdjaGFuZ2UnKTtcblxuICAgICRmb3JtLmZpbmQoJ2Rpdi5sZXZlbCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGluZm9zID0gJCh0aGlzKS5maW5kKCcuYWlfaW5mbyA+IGRpdicpO1xuICAgICAgJCh0aGlzKS5maW5kKCdsYWJlbCcpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICRpbmZvcy5oaWRlKCkuZmlsdGVyKCcuJyArICQodGhpcykuYXR0cignZm9yJykpLnNob3coKTtcbiAgICAgIH0pO1xuICAgICAgJCh0aGlzKS5maW5kKCcjY29uZmlnX2xldmVsJykub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxldmVsID0gJCh0aGlzKS5maW5kKCdpbnB1dDpjaGVja2VkJykudmFsKCk7XG4gICAgICAgICRpbmZvcy5oaWRlKCkuZmlsdGVyKCcuc2ZfbGV2ZWxfJyArIGxldmVsKS5zaG93KCk7XG4gICAgICB9KS50cmlnZ2VyKCdtb3VzZW91dCcpO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIGNsaWNrRXZlbnQgPSBibGluZE1vZGUgPyAnY2xpY2snIDogJ21vdXNlZG93bic7XG5cbiAgJHN0YXJ0QnV0dG9ucy5maW5kKCdhOm5vdCguZGlzYWJsZWQpJykub24oY2xpY2tFdmVudCwgZnVuY3Rpb24oKSB7XG4gICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgbGljaGVzcy5sb2FkQ3NzUGF0aCgnbG9iYnkuc2V0dXAnKTtcbiAgICBsb2JieS5sZWF2ZVBvb2woKTtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiAkKHRoaXMpLmF0dHIoJ2hyZWYnKSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgcHJlcGFyZUZvcm0oJC5tb2RhbChodG1sLCAnZ2FtZS1zZXR1cCcsICgpID0+IHtcbiAgICAgICAgICAkc3RhcnRCdXR0b25zLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgbGljaGVzcy5wdWJzdWIuZW1pdCgnY29udGVudF9sb2FkZWQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09IDQwMCkgYWxlcnQocmVzLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIGxpY2hlc3MucmVsb2FkKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIGlmIChbJyNhaScsICcjZnJpZW5kJywgJyNob29rJ10uaW5jbHVkZXMobG9jYXRpb24uaGFzaCkpIHtcbiAgICAkc3RhcnRCdXR0b25zXG4gICAgICAuZmluZCgnLmNvbmZpZ18nICsgbG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcykuYXR0cihcImhyZWZcIiwgJCh0aGlzKS5hdHRyKFwiaHJlZlwiKSArIGxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICB9KS50cmlnZ2VyKGNsaWNrRXZlbnQpO1xuXG4gICAgaWYgKGxvY2F0aW9uLmhhc2ggPT09ICcjaG9vaycpIHtcbiAgICAgIGlmICgvdGltZT1yZWFsVGltZS8udGVzdChsb2NhdGlvbi5zZWFyY2gpKVxuICAgICAgICBsb2JieS5zZXRUYWIoJ3JlYWxfdGltZScpO1xuICAgICAgZWxzZSBpZiAoL3RpbWU9Y29ycmVzcG9uZGVuY2UvLnRlc3QobG9jYXRpb24uc2VhcmNoKSlcbiAgICAgICAgbG9iYnkuc2V0VGFiKCdzZWVrcycpO1xuICAgIH1cblxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIG51bGwsICcvJyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNwcmVhZE51bWJlcihlbCwgbmJTdGVwcywgZ2V0RHVyYXRpb24pIHtcbiAgdmFyIHByZXZpb3VzLCBkaXNwbGF5ZWQ7XG4gIHZhciBkaXNwbGF5ID0gZnVuY3Rpb24ocHJldiwgY3VyLCBpdCkge1xuICAgIHZhciB2YWwgPSBsaWNoZXNzLm51bWJlckZvcm1hdChNYXRoLnJvdW5kKCgocHJldiAqIChuYlN0ZXBzIC0gMSAtIGl0KSkgKyAoY3VyICogKGl0ICsgMSkpKSAvIG5iU3RlcHMpKTtcbiAgICBpZiAodmFsICE9PSBkaXNwbGF5ZWQpIHtcbiAgICAgIGVsLnRleHRDb250ZW50ID0gdmFsO1xuICAgICAgZGlzcGxheWVkID0gdmFsO1xuICAgIH1cbiAgfTtcbiAgdmFyIHRpbWVvdXRzID0gW107XG4gIHJldHVybiBmdW5jdGlvbihuYiwgb3ZlcnJpZGVOYlN0ZXBzKSB7XG4gICAgaWYgKCFlbCB8fCAoIW5iICYmIG5iICE9PSAwKSkgcmV0dXJuO1xuICAgIGlmIChvdmVycmlkZU5iU3RlcHMpIG5iU3RlcHMgPSBNYXRoLmFicyhvdmVycmlkZU5iU3RlcHMpO1xuICAgIHRpbWVvdXRzLmZvckVhY2goY2xlYXJUaW1lb3V0KTtcbiAgICB0aW1lb3V0cyA9IFtdO1xuICAgIHZhciBwcmV2ID0gcHJldmlvdXMgPT09IDAgPyAwIDogKHByZXZpb3VzIHx8IG5iKTtcbiAgICBwcmV2aW91cyA9IG5iO1xuICAgIHZhciBpbnRlcnYgPSBNYXRoLmFicyhnZXREdXJhdGlvbigpIC8gbmJTdGVwcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYlN0ZXBzOyBpKyspXG4gICAgICB0aW1lb3V0cy5wdXNoKHNldFRpbWVvdXQoZGlzcGxheS5iaW5kKG51bGwsIHByZXYsIG5iLCBpKSwgTWF0aC5yb3VuZChpICogaW50ZXJ2KSkpO1xuICB9O1xufVxuIiwiaW1wb3J0IHZhcmlhbnRDb25maXJtIGZyb20gJy4vdmFyaWFudCc7XG5pbXBvcnQgKiBhcyBob29rUmVwbyBmcm9tICcuL2hvb2tSZXBvJztcbmltcG9ydCAqIGFzIHNlZWtSZXBvIGZyb20gJy4vc2Vla1JlcG8nO1xuaW1wb3J0IHsgbWFrZSBhcyBtYWtlU3RvcmVzLCBTdG9yZXMgfSBmcm9tICcuL3N0b3JlJztcbmltcG9ydCAqIGFzIHhociBmcm9tICcuL3hocic7XG5pbXBvcnQgKiBhcyBwb29sUmFuZ2VTdG9yYWdlIGZyb20gJy4vcG9vbFJhbmdlU3RvcmFnZSc7XG5pbXBvcnQgeyBMb2JieU9wdHMsIExvYmJ5RGF0YSwgVGFiLCBNb2RlLCBTb3J0LCBGaWx0ZXIsIEhvb2ssIFNlZWssIFBvb2wsIFBvb2xNZW1iZXIgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IExvYmJ5U29ja2V0IGZyb20gJy4vc29ja2V0JztcblxuY29uc3QgbGkgPSB3aW5kb3cubGljaGVzcztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9iYnlDb250cm9sbGVyIHtcblxuICBvcHRzOiBMb2JieU9wdHM7XG4gIGRhdGE6IExvYmJ5RGF0YTtcbiAgcGxheWJhbjogYW55O1xuICBpc0JvdDogYm9vbGVhbjtcbiAgc29ja2V0OiBMb2JieVNvY2tldDtcbiAgc3RvcmVzOiBTdG9yZXM7XG4gIHRhYjogVGFiO1xuICBtb2RlOiBNb2RlO1xuICBzb3J0OiBTb3J0O1xuICBmaWx0ZXJPcGVuOiBib29sZWFuID0gZmFsc2U7XG4gIHN0ZXBIb29rczogSG9va1tdID0gW107XG4gIHN0ZXBwaW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHJlZGlyZWN0aW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHBvb2xNZW1iZXI/OiBQb29sTWVtYmVyO1xuICB0cmFuczogVHJhbnM7XG4gIHJlZHJhdzogKCkgPT4gdm9pZDtcbiAgcG9vbHM6IFBvb2xbXTtcblxuICBwcml2YXRlIHBvb2xJblN0b3JhZ2U6IExpY2hlc3NTdG9yYWdlO1xuICBwcml2YXRlIGZsdXNoSG9va3NUaW1lb3V0PzogbnVtYmVyO1xuICBwcml2YXRlIGFscmVhZHlXYXRjaGluZzogc3RyaW5nW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihvcHRzOiBMb2JieU9wdHMsIHJlZHJhdzogKCkgPT4gdm9pZCkge1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy5kYXRhID0gb3B0cy5kYXRhO1xuICAgIHRoaXMuZGF0YS5ob29rcyA9IFtdO1xuICAgIHRoaXMucG9vbHMgPSBvcHRzLnBvb2xzO1xuICAgIHRoaXMucGxheWJhbiA9IG9wdHMucGxheWJhbjtcbiAgICB0aGlzLmlzQm90ID0gb3B0cy5kYXRhLm1lICYmIG9wdHMuZGF0YS5tZS5pc0JvdDtcbiAgICB0aGlzLnJlZHJhdyA9IHJlZHJhdztcblxuICAgIGhvb2tSZXBvLmluaXRBbGwodGhpcyk7XG4gICAgc2Vla1JlcG8uaW5pdEFsbCh0aGlzKTtcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBMb2JieVNvY2tldChvcHRzLnNvY2tldFNlbmQsIHRoaXMpO1xuXG4gICAgdGhpcy5zdG9yZXMgPSBtYWtlU3RvcmVzKHRoaXMuZGF0YS5tZSA/IHRoaXMuZGF0YS5tZS51c2VybmFtZS50b0xvd2VyQ2FzZSgpIDogbnVsbCk7XG4gICAgdGhpcy50YWIgPSB0aGlzLmlzQm90ID8gJ25vd19wbGF5aW5nJyA6IHRoaXMuc3RvcmVzLnRhYi5nZXQoKSxcbiAgICAgIHRoaXMubW9kZSA9IHRoaXMuc3RvcmVzLm1vZGUuZ2V0KCksXG4gICAgICB0aGlzLnNvcnQgPSB0aGlzLnN0b3Jlcy5zb3J0LmdldCgpLFxuICAgICAgdGhpcy50cmFucyA9IG9wdHMudHJhbnM7XG5cbiAgICB0aGlzLnBvb2xJblN0b3JhZ2UgPSBsaS5zdG9yYWdlLm1ha2UoJ2xvYmJ5LnBvb2wtaW4nKTtcbiAgICB0aGlzLnBvb2xJblN0b3JhZ2UubGlzdGVuKF8gPT4geyAvLyB3aGVuIGFub3RoZXIgdGFiIGpvaW5zIGEgcG9vbFxuICAgICAgdGhpcy5sZWF2ZVBvb2woKTtcbiAgICAgIHJlZHJhdygpO1xuICAgIH0pO1xuICAgIHRoaXMuZmx1c2hIb29rc1NjaGVkdWxlKCk7XG5cbiAgICB0aGlzLnN0YXJ0V2F0Y2hpbmcoKTtcblxuICAgIGlmICh0aGlzLnBsYXliYW4pIHtcbiAgICAgIGlmICh0aGlzLnBsYXliYW4ucmVtYWluaW5nU2Vjb25kIDwgODY0MDApIHNldFRpbWVvdXQobGkucmVsb2FkLCB0aGlzLnBsYXliYW4ucmVtYWluaW5nU2Vjb25kcyAqIDEwMDApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucG9vbE1lbWJlcikgdGhpcy5wb29sSW4oKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy50YWIgPT09ICdyZWFsX3RpbWUnICYmICF0aGlzLmRhdGEuaG9va3MubGVuZ3RoKSB0aGlzLnNvY2tldC5yZWFsVGltZUluKCk7XG4gICAgICB9LCAxMCAqIDEwMDApO1xuICAgICAgdGhpcy5qb2luUG9vbEZyb21Mb2NhdGlvbkhhc2goKTtcbiAgICB9XG5cbiAgICBsaS5wdWJzdWIub24oJ3NvY2tldC5vcGVuJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudGFiID09PSAncmVhbF90aW1lJykge1xuICAgICAgICB0aGlzLmRhdGEuaG9va3MgPSBbXTtcbiAgICAgICAgdGhpcy5zb2NrZXQucmVhbFRpbWVJbigpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnRhYiA9PT0gJ3Bvb2xzJyAmJiB0aGlzLnBvb2xNZW1iZXIpIHRoaXMucG9vbEluKCk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMucG9vbE1lbWJlcikgdGhpcy5zb2NrZXQucG9vbE91dCh0aGlzLnBvb2xNZW1iZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkb0ZsdXNoSG9va3MoKSB7XG4gICAgdGhpcy5zdGVwSG9va3MgPSB0aGlzLmRhdGEuaG9va3Muc2xpY2UoMCk7XG4gICAgaWYgKHRoaXMudGFiID09PSAncmVhbF90aW1lJykgdGhpcy5yZWRyYXcoKTtcbiAgfTtcblxuICBmbHVzaEhvb2tzID0gKG5vdzogYm9vbGVhbikgPT4ge1xuICAgIGlmICh0aGlzLmZsdXNoSG9va3NUaW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy5mbHVzaEhvb2tzVGltZW91dCk7XG4gICAgaWYgKG5vdykgdGhpcy5kb0ZsdXNoSG9va3MoKTtcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc3RlcHBpbmcgPSB0cnVlO1xuICAgICAgaWYgKHRoaXMudGFiID09PSAncmVhbF90aW1lJykgdGhpcy5yZWRyYXcoKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnN0ZXBwaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZG9GbHVzaEhvb2tzKCk7XG4gICAgICB9LCA1MDApO1xuICAgIH1cbiAgICB0aGlzLmZsdXNoSG9va3NUaW1lb3V0ID0gdGhpcy5mbHVzaEhvb2tzU2NoZWR1bGUoKTtcbiAgfTtcblxuICBwcml2YXRlIGZsdXNoSG9va3NTY2hlZHVsZSgpOiBudW1iZXIge1xuICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMuZmx1c2hIb29rcywgODAwMCk7XG4gIH1cblxuICBzZXRUYWIgPSAodGFiOiBUYWIpID0+IHtcbiAgICBpZiAodGFiICE9PSB0aGlzLnRhYikge1xuICAgICAgaWYgKHRhYiA9PT0gJ3NlZWtzJykgeGhyLnNlZWtzKCkudGhlbih0aGlzLnNldFNlZWtzKTtcbiAgICAgIGVsc2UgaWYgKHRhYiA9PT0gJ3JlYWxfdGltZScpIHRoaXMuc29ja2V0LnJlYWxUaW1lSW4oKTtcbiAgICAgIGVsc2UgaWYgKHRoaXMudGFiID09PSAncmVhbF90aW1lJykge1xuICAgICAgICB0aGlzLnNvY2tldC5yZWFsVGltZU91dCgpO1xuICAgICAgICB0aGlzLmRhdGEuaG9va3MgPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMudGFiID0gdGhpcy5zdG9yZXMudGFiLnNldCh0YWIpO1xuICAgIH1cbiAgICB0aGlzLmZpbHRlck9wZW4gPSBmYWxzZTtcbiAgfTtcblxuICBzZXRNb2RlID0gKG1vZGU6IE1vZGUpID0+IHtcbiAgICB0aGlzLm1vZGUgPSB0aGlzLnN0b3Jlcy5tb2RlLnNldChtb2RlKTtcbiAgICB0aGlzLmZpbHRlck9wZW4gPSBmYWxzZTtcbiAgfTtcblxuICBzZXRTb3J0ID0gKHNvcnQ6IFNvcnQpID0+IHtcbiAgICB0aGlzLnNvcnQgPSB0aGlzLnN0b3Jlcy5zb3J0LnNldChzb3J0KTtcbiAgfTtcblxuICB0b2dnbGVGaWx0ZXIgPSAoKSA9PiB7XG4gICAgdGhpcy5maWx0ZXJPcGVuID0gIXRoaXMuZmlsdGVyT3BlbjtcbiAgfTtcblxuICBzZXRGaWx0ZXIgPSAoZmlsdGVyOiBGaWx0ZXIpID0+IHtcbiAgICB0aGlzLmRhdGEuZmlsdGVyID0gZmlsdGVyO1xuICAgIHRoaXMuZmx1c2hIb29rcyh0cnVlKTtcbiAgICBpZiAodGhpcy50YWIgIT09ICdyZWFsX3RpbWUnKSB0aGlzLnJlZHJhdygpO1xuICB9O1xuXG4gIGNsaWNrSG9vayA9IChpZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgaG9vayA9IGhvb2tSZXBvLmZpbmQodGhpcywgaWQpO1xuICAgIGlmICghaG9vayB8fCBob29rLmRpc2FibGVkIHx8IHRoaXMuc3RlcHBpbmcgfHwgdGhpcy5yZWRpcmVjdGluZykgcmV0dXJuO1xuICAgIGlmIChob29rLmFjdGlvbiA9PT0gJ2NhbmNlbCcgfHwgdmFyaWFudENvbmZpcm0oaG9vay52YXJpYW50KSkgdGhpcy5zb2NrZXQuc2VuZChob29rLmFjdGlvbiwgaG9vay5pZCk7XG4gIH07XG5cbiAgY2xpY2tTZWVrID0gKGlkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBzZWVrID0gc2Vla1JlcG8uZmluZCh0aGlzLCBpZCk7XG4gICAgaWYgKCFzZWVrIHx8IHRoaXMucmVkaXJlY3RpbmcpIHJldHVybjtcbiAgICBpZiAoc2Vlay5hY3Rpb24gPT09ICdjYW5jZWxTZWVrJyB8fCB2YXJpYW50Q29uZmlybShzZWVrLnZhcmlhbnQpKSB0aGlzLnNvY2tldC5zZW5kKHNlZWsuYWN0aW9uLCBzZWVrLmlkKTtcbiAgfTtcblxuICBzZXRTZWVrcyA9IChzZWVrczogU2Vla1tdKSA9PiB7XG4gICAgdGhpcy5kYXRhLnNlZWtzID0gc2Vla3M7XG4gICAgc2Vla1JlcG8uaW5pdEFsbCh0aGlzKTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICB9O1xuXG4gIGNsaWNrUG9vbCA9IChpZDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKCF0aGlzLmRhdGEubWUpIHtcbiAgICAgIHhoci5hbm9uUG9vbFNlZWsodGhpcy5wb29scy5maW5kKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgcmV0dXJuIHAuaWQgPT09IGlkO1xuICAgICAgfSkpO1xuICAgICAgdGhpcy5zZXRUYWIoJ3JlYWxfdGltZScpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wb29sTWVtYmVyICYmIHRoaXMucG9vbE1lbWJlci5pZCA9PT0gaWQpIHRoaXMubGVhdmVQb29sKCk7XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmVudGVyUG9vbCh7IGlkIH0pO1xuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG4gIH07XG5cbiAgZW50ZXJQb29sID0gKG1lbWJlcjogUG9vbE1lbWJlcikgPT4ge1xuICAgIHBvb2xSYW5nZVN0b3JhZ2Uuc2V0KG1lbWJlci5pZCwgbWVtYmVyLnJhbmdlKTtcbiAgICB0aGlzLnNldFRhYigncG9vbHMnKTtcbiAgICB0aGlzLnBvb2xNZW1iZXIgPSBtZW1iZXI7XG4gICAgdGhpcy5wb29sSW4oKTtcbiAgfTtcblxuICBsZWF2ZVBvb2wgPSAoKSA9PiB7XG4gICAgaWYgKCF0aGlzLnBvb2xNZW1iZXIpIHJldHVybjtcbiAgICB0aGlzLnNvY2tldC5wb29sT3V0KHRoaXMucG9vbE1lbWJlcik7XG4gICAgdGhpcy5wb29sTWVtYmVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH07XG5cbiAgcG9vbEluID0gKCkgPT4ge1xuICAgIGlmICghdGhpcy5wb29sTWVtYmVyKSByZXR1cm47XG4gICAgdGhpcy5wb29sSW5TdG9yYWdlLmZpcmUoKTtcbiAgICB0aGlzLnNvY2tldC5wb29sSW4odGhpcy5wb29sTWVtYmVyKTtcbiAgfTtcblxuICBnYW1lQWN0aXZpdHkgPSBnYW1lSWQgPT4ge1xuICAgIGlmICh0aGlzLmRhdGEubm93UGxheWluZy5maW5kKHAgPT4gcC5nYW1lSWQgPT09IGdhbWVJZCkpXG4gICAgICB4aHIubm93UGxheWluZygpLnRoZW4ocG92cyA9PiB7XG4gICAgICAgIHRoaXMuZGF0YS5ub3dQbGF5aW5nID0gcG92cztcbiAgICAgICAgdGhpcy5zdGFydFdhdGNoaW5nKCk7XG4gICAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgICB9KTtcbiAgfTtcblxuICBwcml2YXRlIHN0YXJ0V2F0Y2hpbmcoKSB7XG4gICAgY29uc3QgbmV3SWRzID0gdGhpcy5kYXRhLm5vd1BsYXlpbmdcbiAgICAgIC5tYXAocCA9PiBwLmdhbWVJZClcbiAgICAgIC5maWx0ZXIoaWQgPT4gIXRoaXMuYWxyZWFkeVdhdGNoaW5nLmluY2x1ZGVzKGlkKSk7XG4gICAgaWYgKG5ld0lkcy5sZW5ndGgpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zb2NrZXQuc2VuZChcInN0YXJ0V2F0Y2hpbmdcIiwgbmV3SWRzLmpvaW4oJyAnKSksIDIwMDApO1xuICAgICAgbmV3SWRzLmZvckVhY2goaWQgPT4gdGhpcy5hbHJlYWR5V2F0Y2hpbmcucHVzaChpZCkpO1xuICAgIH1cbiAgfTtcblxuICBzZXRSZWRpcmVjdGluZyA9ICgpID0+IHtcbiAgICB0aGlzLnJlZGlyZWN0aW5nID0gdHJ1ZTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMucmVkaXJlY3RpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgfSwgNDAwMCk7XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfTtcblxuICBhd2FrZSA9ICgpID0+IHtcbiAgICBzd2l0Y2ggKHRoaXMudGFiKSB7XG4gICAgICBjYXNlICdyZWFsX3RpbWUnOlxuICAgICAgICB0aGlzLmRhdGEuaG9va3MgPSBbXTtcbiAgICAgICAgdGhpcy5zb2NrZXQucmVhbFRpbWVJbigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NlZWtzJzpcbiAgICAgICAgeGhyLnNlZWtzKCkudGhlbih0aGlzLnNldFNlZWtzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9O1xuXG4gIC8vIGFmdGVyIGNsaWNrIG9uIHJvdW5kIFwibmV3IG9wcG9uZW50XCIgYnV0dG9uXG4gIC8vIGFsc28gaGFuZGxlcyBvbmJvYXJkaW5rIGxpbmsgZm9yIGFub24gdXNlcnNcbiAgcHJpdmF0ZSBqb2luUG9vbEZyb21Mb2NhdGlvbkhhc2goKSB7XG4gICAgaWYgKGxvY2F0aW9uLmhhc2guc3RhcnRzV2l0aCgnI3Bvb2wvJykpIHtcbiAgICAgIGNvbnN0IHJlZ2V4ID0gL14jcG9vbFxcLyhcXGQrXFwrXFxkKykoPzpcXC8oLispKT8kLyxcbiAgICAgICAgbWF0Y2ggPSByZWdleC5leGVjKGxvY2F0aW9uLmhhc2gpLFxuICAgICAgICBtZW1iZXI6IGFueSA9IHsgaWQ6IG1hdGNoIVsxXSwgYmxvY2tpbmc6IG1hdGNoIVsyXSB9LFxuICAgICAgICByYW5nZSA9IHBvb2xSYW5nZVN0b3JhZ2UuZ2V0KG1lbWJlci5pZCk7XG4gICAgICBpZiAocmFuZ2UpIG1lbWJlci5yYW5nZSA9IHJhbmdlO1xuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHRoaXMuc2V0VGFiKCdwb29scycpO1xuICAgICAgICBpZiAodGhpcy5kYXRhLm1lKSB0aGlzLmVudGVyUG9vbChtZW1iZXIpO1xuICAgICAgICBlbHNlIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5jbGlja1Bvb2wobWVtYmVyLmlkKSwgMTUwMCk7XG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsICcnLCAnLycpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgSG9vayB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgTG9iYnlDb250cm9sbGVyIGZyb20gJy4vY3RybCc7XG5cbmludGVyZmFjZSBGaWx0ZXJlZCB7XG4gIHZpc2libGU6IEhvb2tbXTtcbiAgaGlkZGVuOiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IExvYmJ5Q29udHJvbGxlciwgaG9va3M6IEhvb2tbXSk6IEZpbHRlcmVkIHtcbiAgY29uc3QgZiA9IGN0cmwuZGF0YS5maWx0ZXIsXG4gICAgc2Vlbjogc3RyaW5nW10gPSBbXSxcbiAgICB2aXNpYmxlOiBIb29rW10gPSBbXTtcbiAgbGV0IHZhcmlhbnQ6IHN0cmluZywgaGlkZGVuID0gMDtcbiAgaG9va3MuZm9yRWFjaChmdW5jdGlvbihob29rKSB7XG4gICAgdmFyaWFudCA9IGhvb2sudmFyaWFudDtcbiAgICBpZiAoaG9vay5hY3Rpb24gPT09ICdjYW5jZWwnKSB2aXNpYmxlLnB1c2goaG9vayk7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoIWYudmFyaWFudC5pbmNsdWRlcyh2YXJpYW50KSB8fFxuICAgICAgICAhZi5tb2RlLmluY2x1ZGVzKGhvb2sucmEgfHwgMCkgfHxcbiAgICAgICAgIWYuc3BlZWQuaW5jbHVkZXMoaG9vay5zIHx8IDEgLyogdWx0cmFidWxsZXQgPSBidWxsZXQgKi8pIHx8XG4gICAgICAgIChmLnJhdGluZyAmJiAoIWhvb2sucmF0aW5nIHx8IChob29rLnJhdGluZyA8IGYucmF0aW5nWzBdIHx8IGhvb2sucmF0aW5nID4gZi5yYXRpbmdbMV0pKSkpIHtcbiAgICAgICAgaGlkZGVuKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBoYXNoID0gaG9vay5yYSArIHZhcmlhbnQgKyBob29rLnQgKyBob29rLnJhdGluZztcbiAgICAgICAgaWYgKCFzZWVuLmluY2x1ZGVzKGhhc2gpKSB2aXNpYmxlLnB1c2goaG9vayk7XG4gICAgICAgIHNlZW4ucHVzaChoYXNoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHZpc2libGU6IHZpc2libGUsXG4gICAgaGlkZGVuOiBoaWRkZW5cbiAgfTtcbn1cbiIsImltcG9ydCBMb2JieUNvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IEhvb2sgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5mdW5jdGlvbiByYXRpbmdPcmRlcihhLCBiKSB7XG4gIHJldHVybiAoYS5yYXRpbmcgfHwgMCkgPiAoYi5yYXRpbmcgfHwgMCkgPyAtMSA6IDE7XG59XG5cbmZ1bmN0aW9uIHRpbWVPcmRlcihhLCBiKSB7XG4gIHJldHVybiBhLnQgPCBiLnQgPyAtMSA6IDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0KGN0cmw6IExvYmJ5Q29udHJvbGxlciwgaG9va3M6IEhvb2tbXSkge1xuICBob29rcy5zb3J0KGN0cmwuc29ydCA9PT0gJ3RpbWUnID8gdGltZU9yZGVyIDogcmF0aW5nT3JkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChob29rOiBIb29rKSB7XG4gIGhvb2suYWN0aW9uID0gaG9vay5zcmkgPT09IHdpbmRvdy5saWNoZXNzLnNyaSA/ICdjYW5jZWwnIDogJ2pvaW4nO1xuICBob29rLnZhcmlhbnQgPSBob29rLnZhcmlhbnQgfHwgJ3N0YW5kYXJkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRBbGwoY3RybDogTG9iYnlDb250cm9sbGVyKSB7XG4gIGN0cmwuZGF0YS5ob29rcy5mb3JFYWNoKGluaXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkKGN0cmw6IExvYmJ5Q29udHJvbGxlciwgaG9vaykge1xuICBpbml0KGhvb2spO1xuICBjdHJsLmRhdGEuaG9va3MucHVzaChob29rKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRBbGwoY3RybDogTG9iYnlDb250cm9sbGVyLCBob29rczogSG9va1tdKSB7XG4gIGN0cmwuZGF0YS5ob29rcyA9IGhvb2tzO1xuICBpbml0QWxsKGN0cmwpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZShjdHJsOiBMb2JieUNvbnRyb2xsZXIsIGlkKSB7XG4gIGN0cmwuZGF0YS5ob29rcyA9IGN0cmwuZGF0YS5ob29rcy5maWx0ZXIoZnVuY3Rpb24oaCkge1xuICAgIHJldHVybiBoLmlkICE9PSBpZDtcbiAgfSk7XG4gIGN0cmwuc3RlcEhvb2tzLmZvckVhY2goZnVuY3Rpb24oaCkge1xuICAgIGlmIChoLmlkID09PSBpZCkgaC5kaXNhYmxlZCA9IHRydWU7XG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHN5bmNJZHMoY3RybDogTG9iYnlDb250cm9sbGVyLCBpZHMpIHtcbiAgY3RybC5kYXRhLmhvb2tzID0gY3RybC5kYXRhLmhvb2tzLmZpbHRlcihmdW5jdGlvbihoKSB7XG4gICAgcmV0dXJuIGlkcy5pbmNsdWRlcyhoLmlkKTtcbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZmluZChjdHJsOiBMb2JieUNvbnRyb2xsZXIsIGlkKSB7XG4gIHJldHVybiBjdHJsLmRhdGEuaG9va3MuZmluZChmdW5jdGlvbihoKSB7XG4gICAgcmV0dXJuIGguaWQgPT09IGlkO1xuICB9KTtcbn1cbiIsImltcG9ydCB7IGluaXQgfSBmcm9tICdzbmFiYmRvbSc7XG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IGtsYXNzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnO1xuaW1wb3J0IGF0dHJpYnV0ZXMgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJztcbmltcG9ydCB7IENoZXNzZ3JvdW5kIH0gZnJvbSAnY2hlc3Nncm91bmQnO1xuaW1wb3J0IHsgTG9iYnlPcHRzLCBUYWIgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IExvYmJ5Q29udHJvbGxlciBmcm9tICcuL2N0cmwnO1xuXG5leHBvcnQgY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlc10pO1xuXG5pbXBvcnQgbWFrZUN0cmwgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB2aWV3IGZyb20gJy4vdmlldy9tYWluJztcbmltcG9ydCBib290ID0gcmVxdWlyZSgnLi9ib290Jyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChvcHRzOiBMb2JieU9wdHMpIHtcblxuICBsZXQgdm5vZGU6IFZOb2RlLCBjdHJsOiBMb2JieUNvbnRyb2xsZXI7XG5cbiAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIHZub2RlID0gcGF0Y2godm5vZGUsIHZpZXcoY3RybCkpO1xuICB9XG5cbiAgY3RybCA9IG5ldyBtYWtlQ3RybChvcHRzLCByZWRyYXcpO1xuXG4gIGNvbnN0IGJsdWVwcmludCA9IHZpZXcoY3RybCk7XG4gIG9wdHMuZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgdm5vZGUgPSBwYXRjaChvcHRzLmVsZW1lbnQsIGJsdWVwcmludCk7XG5cbiAgcmV0dXJuIHtcbiAgICBzb2NrZXRSZWNlaXZlOiBjdHJsLnNvY2tldC5yZWNlaXZlLFxuICAgIHNldFRhYih0YWI6IFRhYikge1xuICAgICAgY3RybC5zZXRUYWIodGFiKTtcbiAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgfSxcbiAgICBnYW1lQWN0aXZpdHk6IGN0cmwuZ2FtZUFjdGl2aXR5LFxuICAgIHNldFJlZGlyZWN0aW5nOiBjdHJsLnNldFJlZGlyZWN0aW5nLFxuICAgIGVudGVyUG9vbDogY3RybC5lbnRlclBvb2wsXG4gICAgbGVhdmVQb29sOiBjdHJsLmxlYXZlUG9vbCxcbiAgICByZWRyYXc6IGN0cmwucmVkcmF3XG4gIH07XG59XG5cbi8vIHRoYXQncyBmb3IgdGhlIHJlc3Qgb2YgbGljaGVzcyB0byBhY2Nlc3MgY2hlc3Nncm91bmRcbi8vIHdpdGhvdXQgaGF2aW5nIHRvIGluY2x1ZGUgaXQgYSBzZWNvbmQgdGltZVxud2luZG93LkNoZXNzZ3JvdW5kID0gQ2hlc3Nncm91bmQ7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgYm9vdCh3aW5kb3dbJ2xpY2hlc3NfbG9iYnknXSwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYmJ5X19hcHAnKSk7XG59O1xuIiwiZnVuY3Rpb24gbWFrZUtleShwb29sSWQpIHtcbiAgcmV0dXJuICdsb2JieS1wb29sLXJhbmdlLScgKyBwb29sSWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQocG9vbElkLCByYW5nZSkge1xuICBjb25zdCBrZXkgPSBtYWtlS2V5KHBvb2xJZCk7XG4gIGlmIChyYW5nZSkgd2luZG93LmxpY2hlc3Muc3RvcmFnZS5zZXQoa2V5LCByYW5nZSk7XG4gIGVsc2Ugd2luZG93LmxpY2hlc3Muc3RvcmFnZS5yZW1vdmUoa2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldChwb29sSWQpIHtcbiAgcmV0dXJuIHdpbmRvdy5saWNoZXNzLnN0b3JhZ2UuZ2V0KG1ha2VLZXkocG9vbElkKSk7XG59XG4iLCJpbXBvcnQgTG9iYnlDb250cm9sbGVyIGZyb20gJy4vY3RybCc7XG5cbmZ1bmN0aW9uIG9yZGVyKGEsIGIpIHtcbiAgcmV0dXJuIGEucmF0aW5nID4gYi5yYXRpbmcgPyAtMSA6IDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0KGN0cmw6IExvYmJ5Q29udHJvbGxlcikge1xuICBjdHJsLmRhdGEuc2Vla3Muc29ydChvcmRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0QWxsKGN0cmw6IExvYmJ5Q29udHJvbGxlcikge1xuICBjdHJsLmRhdGEuc2Vla3MuZm9yRWFjaChmdW5jdGlvbihzZWVrKSB7XG4gICAgc2Vlay5hY3Rpb24gPSAoY3RybC5kYXRhLm1lICYmIHNlZWsudXNlcm5hbWUgPT09IGN0cmwuZGF0YS5tZS51c2VybmFtZSkgPyAnY2FuY2VsU2VlaycgOiAnam9pblNlZWsnO1xuICB9KTtcbiAgc29ydChjdHJsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmQoY3RybDogTG9iYnlDb250cm9sbGVyLCBpZDogc3RyaW5nKSB7XG4gIHJldHVybiBjdHJsLmRhdGEuc2Vla3MuZmluZChzID0+IHMuaWQgPT09IGlkKTtcbn1cbiIsImltcG9ydCAqIGFzIHhociBmcm9tICcuL3hocic7XG5pbXBvcnQgKiBhcyBob29rUmVwbyBmcm9tICcuL2hvb2tSZXBvJztcbmltcG9ydCBMb2JieUNvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IEhvb2ssIFBvb2xNZW1iZXIgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5pbnRlcmZhY2UgSGFuZGxlcnMge1xuICBba2V5OiBzdHJpbmddOiAoZGF0YTogYW55KSA9PiB2b2lkO1xufVxuXG5jb25zdCBsaSA9IHdpbmRvdy5saWNoZXNzO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2JieVNvY2tldCB7XG5cbiAgc2VuZDogU29ja2V0U2VuZDtcbiAgaGFuZGxlcnM6IEhhbmRsZXJzO1xuXG4gIGNvbnN0cnVjdG9yKHNlbmQ6IFNvY2tldFNlbmQsIGN0cmw6IExvYmJ5Q29udHJvbGxlcikge1xuXG4gICAgdGhpcy5zZW5kID0gc2VuZDtcblxuICAgIHRoaXMuaGFuZGxlcnMgPSB7XG4gICAgICBoYWQoaG9vazogSG9vaykge1xuICAgICAgICBob29rUmVwby5hZGQoY3RybCwgaG9vayk7XG4gICAgICAgIGlmIChob29rLmFjdGlvbiA9PT0gJ2NhbmNlbCcpIGN0cmwuZmx1c2hIb29rcyh0cnVlKTtcbiAgICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICAgIH0sXG4gICAgICBocm0oaWRzOiBzdHJpbmcpIHtcbiAgICAgICAgaWRzLm1hdGNoKC8uezh9L2cpIS5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgaG9va1JlcG8ucmVtb3ZlKGN0cmwsIGlkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgICB9LFxuICAgICAgaG9va3MoaG9va3M6IEhvb2tbXSkge1xuICAgICAgICBob29rUmVwby5zZXRBbGwoY3RybCwgaG9va3MpO1xuICAgICAgICBjdHJsLmZsdXNoSG9va3ModHJ1ZSk7XG4gICAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgICB9LFxuICAgICAgaGxpKGlkczogc3RyaW5nKSB7XG4gICAgICAgIGhvb2tSZXBvLnN5bmNJZHMoY3RybCwgaWRzLm1hdGNoKC8uezh9L2cpKTtcbiAgICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICAgIH0sXG4gICAgICByZWxvYWRfc2Vla3MoKSB7XG4gICAgICAgIGlmIChjdHJsLnRhYiA9PT0gJ3NlZWtzJykgeGhyLnNlZWtzKCkudGhlbihjdHJsLnNldFNlZWtzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGkuaWRsZVRpbWVyKFxuICAgICAgMyAqIDYwICogMTAwMCxcbiAgICAgICgpID0+IHNlbmQoJ2lkbGUnLCB0cnVlKSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgc2VuZCgnaWRsZScsIGZhbHNlKTtcbiAgICAgICAgY3RybC5hd2FrZSgpO1xuICAgICAgfSk7XG4gIH1cblxuICByZWFsVGltZUluKCkge1xuICAgIHRoaXMuc2VuZCgnaG9va0luJyk7XG4gIH07XG4gIHJlYWxUaW1lT3V0KCkge1xuICAgIHRoaXMuc2VuZCgnaG9va091dCcpO1xuICB9O1xuXG4gIHBvb2xJbihtZW1iZXI6IFBvb2xNZW1iZXIpIHtcbiAgICAvLyBsYXN0IGFyZz10cnVlOiBtdXN0IG5vdCByZXRyeVxuICAgIC8vIGJlY2F1c2UgaWYgcG9vbEluIGlzIHNlbnQgYmVmb3JlIHNvY2tldCBvcGVucyxcbiAgICAvLyB0aGVuIHBvb2xPdXQgaXMgc2VudCxcbiAgICAvLyB0aGVuIHBvb2xJbiBzaG91bGRuJ3QgYmUgc2VudCBhZ2FpbiBhZnRlciBzb2NrZXQgb3BlbnMuXG4gICAgLy8gcG9vbEluIGlzIHNlbnQgYW55d2F5IG9uIHNvY2tldCBvcGVuIGV2ZW50LlxuICAgIHRoaXMuc2VuZCgncG9vbEluJywgbWVtYmVyLCB7fSwgdHJ1ZSk7XG4gIH07XG5cbiAgcG9vbE91dChtZW1iZXI6IFBvb2xNZW1iZXIpIHtcbiAgICB0aGlzLnNlbmQoJ3Bvb2xPdXQnLCBtZW1iZXIuaWQpO1xuICB9O1xuXG4gIHJlY2VpdmUgPSAodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkpOiBib29sZWFuID0+IHtcbiAgICBpZiAodGhpcy5oYW5kbGVyc1t0eXBlXSkge1xuICAgICAgdGhpcy5oYW5kbGVyc1t0eXBlXShkYXRhKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBUYWIsIE1vZGUsIFNvcnQgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5pbnRlcmZhY2UgU3RvcmU8QT4ge1xuICBzZXQodjogc3RyaW5nKTogQTtcbiAgZ2V0KCk6IEE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvcmVzIHtcbiAgdGFiOiBTdG9yZTxUYWI+O1xuICBtb2RlOiBTdG9yZTxNb2RlPjtcbiAgc29ydDogU3RvcmU8U29ydD47XG59XG5cbmludGVyZmFjZSBDb25maWc8QT4ge1xuICBrZXk6IHN0cmluZztcbiAgZml4KHY6IHN0cmluZyB8IG51bGwpOiBBO1xufVxuXG5jb25zdCB0YWI6IENvbmZpZzxUYWI+ID0ge1xuICBrZXk6ICdsb2JieS50YWInLFxuICBmaXgodDogc3RyaW5nIHwgbnVsbCk6IFRhYiB7XG4gICAgaWYgKDxUYWI+dCkgcmV0dXJuIHQgYXMgVGFiO1xuICAgIHJldHVybiAncG9vbHMnO1xuICB9XG59O1xuY29uc3QgbW9kZTogQ29uZmlnPE1vZGU+ID0ge1xuICBrZXk6ICdsb2JieS5tb2RlJyxcbiAgZml4KG06IHN0cmluZyB8IG51bGwpOiBNb2RlIHtcbiAgICBpZiAoPE1vZGU+bSkgcmV0dXJuIG0gYXMgTW9kZTtcbiAgICByZXR1cm4gJ2xpc3QnO1xuICB9XG59O1xuY29uc3Qgc29ydDogQ29uZmlnPFNvcnQ+ID0ge1xuICBrZXk6ICdsb2JieS5zb3J0JyxcbiAgZml4KHM6IHN0cmluZyB8IG51bGwpOiBTb3J0IHtcbiAgICBpZiAoPFNvcnQ+cykgcmV0dXJuIHMgYXMgU29ydDtcbiAgICByZXR1cm4gJ3JhdGluZyc7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1ha2VTdG9yZTxBPihjb25mOiBDb25maWc8QT4sIHVzZXJJZDogc3RyaW5nKTogU3RvcmU8QT4ge1xuICBjb25zdCBmdWxsS2V5ID0gY29uZi5rZXkgKyAnOicgKyAodXNlcklkIHx8ICctJyk7XG4gIHJldHVybiB7XG4gICAgc2V0KHY6IHN0cmluZyk6IEEge1xuICAgICAgY29uc3QgdDogQSA9IGNvbmYuZml4KHYpO1xuICAgICAgd2luZG93LmxpY2hlc3Muc3RvcmFnZS5zZXQoZnVsbEtleSwgJycgKyB0IGFzIHN0cmluZyk7XG4gICAgICByZXR1cm4gdDtcbiAgICB9LFxuICAgIGdldCgpOiBBIHtcbiAgICAgIHJldHVybiBjb25mLmZpeCh3aW5kb3cubGljaGVzcy5zdG9yYWdlLmdldChmdWxsS2V5KSk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZSh1c2VySWQ6IHN0cmluZyk6IFN0b3JlcyB7XG4gIHJldHVybiB7XG4gICAgdGFiOiBtYWtlU3RvcmU8VGFiPih0YWIsIHVzZXJJZCksXG4gICAgbW9kZTogbWFrZVN0b3JlPE1vZGU+KG1vZGUsIHVzZXJJZCksXG4gICAgc29ydDogbWFrZVN0b3JlPFNvcnQ+KHNvcnQsIHVzZXJJZClcbiAgfVxufTtcbiIsImNvbnN0IHZhcmlhbnRDb25maXJtcyA9IHtcbiAgJ2NoZXNzOTYwJzogXCJUaGlzIGlzIGEgQ2hlc3M5NjAgZ2FtZSFcXG5cXG5UaGUgc3RhcnRpbmcgcG9zaXRpb24gb2YgdGhlIHBpZWNlcyBvbiB0aGUgcGxheWVycycgaG9tZSByYW5rcyBpcyByYW5kb21pemVkLlwiLFxuICAna2luZ09mVGhlSGlsbCc6IFwiVGhpcyBpcyBhIEtpbmcgb2YgdGhlIEhpbGwgZ2FtZSFcXG5cXG5UaGUgZ2FtZSBjYW4gYmUgd29uIGJ5IGJyaW5naW5nIHRoZSBraW5nIHRvIHRoZSBjZW50ZXIuXCIsXG4gICd0aHJlZUNoZWNrJzogXCJUaGlzIGlzIGEgVGhyZWUtY2hlY2sgZ2FtZSFcXG5cXG5UaGUgZ2FtZSBjYW4gYmUgd29uIGJ5IGNoZWNraW5nIHRoZSBvcHBvbmVudCB0aHJlZSB0aW1lcy5cIixcbiAgXCJhbnRpY2hlc3NcIjogXCJUaGlzIGlzIGFuIEFudGljaGVzcyBnYW1lIVxcblxcbklmIHlvdSBjYW4gdGFrZSBhIHBpZWNlLCB5b3UgbXVzdC4gVGhlIGdhbWUgY2FuIGJlIHdvbiBieSBsb3NpbmcgYWxsIHlvdXIgcGllY2VzLCBvciBieSBiZWluZyBzdGFsZW1hdGVkLlwiLFxuICBcImF0b21pY1wiOiBcIlRoaXMgaXMgYW4gQXRvbWljIGNoZXNzIGdhbWUhXFxuXFxuQ2FwdHVyaW5nIGEgcGllY2UgY2F1c2VzIGFuIGV4cGxvc2lvbiwgdGFraW5nIG91dCB5b3VyIHBpZWNlIGFuZCBzdXJyb3VuZGluZyBub24tcGF3bnMuIFdpbiBieSBtYXRpbmcgb3IgZXhwbG9kaW5nIHlvdXIgb3Bwb25lbnQncyBraW5nLlwiLFxuICBcImhvcmRlXCI6IFwiVGhpcyBpcyBhIEhvcmRlIGNoZXNzIGdhbWUhXFxuXFxCbGFjayBtdXN0IHRha2UgYWxsIFdoaXRlIHBhd25zIHRvIHdpbi4gV2hpdGUgbXVzdCBjaGVja21hdGUgdGhlIEJsYWNrIGtpbmcuXCIsXG4gIFwicmFjaW5nS2luZ3NcIjogXCJUaGlzIGlzIGEgUmFjaW5nIEtpbmdzIGdhbWUhXFxuXFxuUGxheWVycyBtdXN0IHJhY2UgdGhlaXIga2luZ3MgdG8gdGhlIGVpZ2h0aCByYW5rLiBDaGVja3MgYXJlIG5vdCBhbGxvd2VkLlwiLFxuICBcImNyYXp5aG91c2VcIjogXCJUaGlzIGlzIGEgQ3Jhenlob3VzZSBnYW1lIVxcblxcbkV2ZXJ5IHRpbWUgYSBwaWVjZSBpcyBjYXB0dXJlZCwgdGhlIGNhcHR1cmluZyBwbGF5ZXIgZ2V0cyBhIHBpZWNlIG9mIHRoZSBzYW1lIHR5cGUgYW5kIG9mIHRoZWlyIGNvbG9yIGluIHRoZWlyIHBvY2tldC5cIlxufTtcblxuZnVuY3Rpb24gc3RvcmFnZUtleShrZXkpIHtcbiAgcmV0dXJuICdsb2JieS52YXJpYW50LicgKyBrZXk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhcmlhbnQ6IHN0cmluZykge1xuICByZXR1cm4gT2JqZWN0LmtleXModmFyaWFudENvbmZpcm1zKS5ldmVyeShmdW5jdGlvbihrZXkpIHtcbiAgICBjb25zdCB2ID0gdmFyaWFudENvbmZpcm1zW2tleV1cbiAgICAgIGlmICh2YXJpYW50ID09PSBrZXkgJiYgIXdpbmRvdy5saWNoZXNzLnN0b3JhZ2UuZ2V0KHN0b3JhZ2VLZXkoa2V5KSkpIHtcbiAgICAgICAgY29uc3QgYyA9IGNvbmZpcm0odik7XG4gICAgICAgIGlmIChjKSB3aW5kb3cubGljaGVzcy5zdG9yYWdlLnNldChzdG9yYWdlS2V5KGtleSksICcxJyk7XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfSBlbHNlIHJldHVybiB0cnVlO1xuICB9KVxufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IHRkcywgYmluZCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgTG9iYnlDb250cm9sbGVyIGZyb20gJy4uL2N0cmwnO1xuaW1wb3J0IHsgU2VlaywgTWF5YmVWTm9kZXMgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuZnVuY3Rpb24gcmVuZGVyU2VlayhjdHJsOiBMb2JieUNvbnRyb2xsZXIsIHNlZWs6IFNlZWspOiBWTm9kZSB7XG4gIGNvbnN0IGtsYXNzID0gc2Vlay5hY3Rpb24gPT09ICdqb2luU2VlaycgPyAnam9pbicgOiAnY2FuY2VsJyxcbiAgbm9hcmcgPSBjdHJsLnRyYW5zLm5vYXJnO1xuICByZXR1cm4gaCgndHIuc2Vlay4nICsga2xhc3MsIHtcbiAgICBrZXk6IHNlZWsuaWQsXG4gICAgYXR0cnM6IHtcbiAgICAgIHRpdGxlOiAoc2Vlay5hY3Rpb24gPT09ICdqb2luU2VlaycpID8gbm9hcmcoJ2pvaW5UaGVHYW1lJykgKyAnIC0gJyArIHNlZWsucGVyZi5uYW1lIDogbm9hcmcoJ2NhbmNlbCcpLFxuICAgICAgJ2RhdGEtaWQnOiBzZWVrLmlkXG4gICAgfVxuICB9LCB0ZHMoW1xuICAgIGgoJ3NwYW4uaXMuaXMyLmNvbG9yLWljb24uJyArIChzZWVrLmNvbG9yIHx8ICdyYW5kb20nKSksXG4gICAgKHNlZWsucmF0aW5nID8gaCgnc3Bhbi51bHB0Jywge1xuICAgICAgYXR0cnM6IHsgJ2RhdGEtaHJlZic6ICcvQC8nICsgc2Vlay51c2VybmFtZSB9XG4gICAgfSwgc2Vlay51c2VybmFtZSkgOiAnQW5vbnltb3VzJyksXG4gICAgc2Vlay5yYXRpbmcgKyAoc2Vlay5wcm92aXNpb25hbCA/ICc/JyA6ICcnKSxcbiAgICBzZWVrLmRheXMgPyBjdHJsLnRyYW5zLnBsdXJhbCgnbmJEYXlzJywgc2Vlay5kYXlzKSA6ICfiiJ4nLFxuICAgIGgoJ3NwYW4nLCBbXG4gICAgICBoKCdzcGFuLnZhcmljb24nLCB7XG4gICAgICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiBzZWVrLnBlcmYuaWNvbiB9XG4gICAgICB9KSxcbiAgICAgIG5vYXJnKHNlZWsubW9kZSA9PT0gMSA/ICdyYXRlZCcgOiAnY2FzdWFsJylcbiAgICBdKVxuICBdKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNlZWsoY3RybDogTG9iYnlDb250cm9sbGVyKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoY3RybC5kYXRhLm1lICYmIGN0cmwuZGF0YS5zZWVrcy5sZW5ndGggPCA4KSByZXR1cm4gaCgnZGl2LmNyZWF0ZScsIFtcbiAgICBoKCdhLmJ1dHRvbicsIHtcbiAgICAgIGF0dHJzOiB7IGhyZWY6ICcvP3RpbWU9Y29ycmVzcG9uZGVuY2UjaG9vaycgfVxuICAgIH0sIGN0cmwudHJhbnMoJ2NyZWF0ZUFHYW1lJykpXG4gIF0pO1xuICByZXR1cm47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IExvYmJ5Q29udHJvbGxlcik6IE1heWJlVk5vZGVzIHtcbiAgcmV0dXJuIFtcbiAgICBoKCd0YWJsZS5ob29rc19fbGlzdCcsIFtcbiAgICAgIGgoJ3RoZWFkJywgW1xuICAgICAgICBoKCd0cicsIFsnJywgJ3BsYXllcicsICdyYXRpbmcnLCAndGltZScsICdtb2RlJ10ubWFwKGhlYWRlciA9PiBoKCd0aCcsIGN0cmwudHJhbnMoaGVhZGVyKSkpKVxuICAgICAgXSksXG4gICAgICBoKCd0Ym9keScsIHtcbiAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCBlID0+IHtcbiAgICAgICAgICBsZXQgZWwgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICBkbyB7XG4gICAgICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoZWwubm9kZU5hbWUgPT09ICdUUicpIHtcbiAgICAgICAgICAgICAgaWYgKCFjdHJsLmRhdGEubWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlybShjdHJsLnRyYW5zKCd5b3VOZWVkQW5BY2NvdW50VG9Eb1RoYXQnKSkpIGxvY2F0aW9uLmhyZWYgPSAnL3NpZ251cCc7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBjdHJsLmNsaWNrU2VlayhlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB3aGlsZSAoZWwubm9kZU5hbWUgIT09ICdUQUJMRScpO1xuICAgICAgICB9KVxuICAgICAgfSwgY3RybC5kYXRhLnNlZWtzLm1hcChzID0+IHJlbmRlclNlZWsoY3RybCwgcykpKVxuICAgIF0pLFxuICAgIGNyZWF0ZVNlZWsoY3RybClcbiAgXTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSc7XG5pbXBvcnQgeyBWTm9kZURhdGEgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5pbXBvcnQgcmVuZGVyVGFicyBmcm9tICcuL3RhYnMnO1xuaW1wb3J0ICogYXMgcmVuZGVyUG9vbHMgZnJvbSAnLi9wb29scyc7XG5pbXBvcnQgcmVuZGVyUmVhbFRpbWUgZnJvbSAnLi9yZWFsVGltZS9tYWluJztcbmltcG9ydCByZW5kZXJTZWVrcyBmcm9tICcuL2NvcnJlc3BvbmRlbmNlJztcbmltcG9ydCByZW5kZXJQbGF5aW5nIGZyb20gJy4vcGxheWluZyc7XG5pbXBvcnQgeyBzcGlubmVyIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBMb2JieUNvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IExvYmJ5Q29udHJvbGxlcikge1xuICBsZXQgYm9keSwgZGF0YTogVk5vZGVEYXRhID0ge307XG4gIGlmIChjdHJsLnJlZGlyZWN0aW5nKSBib2R5ID0gc3Bpbm5lcigpO1xuICBlbHNlIHN3aXRjaCAoY3RybC50YWIpIHtcbiAgICBjYXNlICdwb29scyc6XG4gICAgICBib2R5ID0gcmVuZGVyUG9vbHMucmVuZGVyKGN0cmwpO1xuICAgICAgZGF0YSA9IHsgaG9vazogcmVuZGVyUG9vbHMuaG9va3MoY3RybCkgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlYWxfdGltZSc6XG4gICAgICBib2R5ID0gcmVuZGVyUmVhbFRpbWUoY3RybCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWVrcyc6XG4gICAgICBib2R5ID0gcmVuZGVyU2Vla3MoY3RybCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdub3dfcGxheWluZyc6XG4gICAgICBib2R5ID0gcmVuZGVyUGxheWluZyhjdHJsKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBoKCdkaXYubG9iYnlfX2FwcC5sb2JieV9fYXBwLScgKyBjdHJsLnRhYiwgW1xuICAgIGgoJ2Rpdi50YWJzLWhvcml6JywgcmVuZGVyVGFicyhjdHJsKSksXG4gICAgaCgnZGl2LmxvYmJ5X19hcHBfX2NvbnRlbnQubCcgKyAoY3RybC5yZWRpcmVjdGluZyA/ICdyZWRpcicgOiBjdHJsLnRhYiksIGRhdGEsIGJvZHkpXG4gIF0pO1xufTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSc7XG5pbXBvcnQgeyBDaGVzc2dyb3VuZCB9IGZyb20gJ2NoZXNzZ3JvdW5kJztcbmltcG9ydCBMb2JieUNvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5cbmZ1bmN0aW9uIHRpbWVyKHBvdikge1xuICBjb25zdCBkYXRlID0gRGF0ZS5ub3coKSArIHBvdi5zZWNvbmRzTGVmdCAqIDEwMDA7XG4gIHJldHVybiBoKCd0aW1lLnRpbWVhZ28nLCB7XG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgICh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLnNldEF0dHJpYnV0ZSgnZGF0ZXRpbWUnLCAnJyArIGRhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSwgd2luZG93LmxpY2hlc3MudGltZWFnby5mb3JtYXQoZGF0ZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBMb2JieUNvbnRyb2xsZXIpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5ub3ctcGxheWluZycsXG4gICAgY3RybC5kYXRhLm5vd1BsYXlpbmcubWFwKGZ1bmN0aW9uKHBvdikge1xuICAgICAgcmV0dXJuIGgoJ2EuJyArIHBvdi52YXJpYW50LmtleSArIChwb3YuaXNNeVR1cm4gPyAnLm15X3R1cm4nIDogJycpLCB7XG4gICAgICAgIGtleTogcG92LmdhbWVJZCxcbiAgICAgICAgYXR0cnM6IHsgaHJlZjogJy8nICsgcG92LmZ1bGxJZCB9XG4gICAgICB9LCBbXG4gICAgICAgIGgoJ2Rpdi5taW5pLWJvYXJkLmNnLXdyYXAuaXMyZCcsIHtcbiAgICAgICAgICBob29rOiB7XG4gICAgICAgICAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgbG0gPSBwb3YubGFzdE1vdmU7XG4gICAgICAgICAgICAgIENoZXNzZ3JvdW5kKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCwge1xuICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkcmF3YWJsZTogeyBlbmFibGVkOiBmYWxzZSwgdmlzaWJsZTogZmFsc2UgfSxcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZpZXdPbmx5OiB0cnVlLFxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiBwb3YudmFyaWFudC5rZXkgPT09ICdyYWNpbmdLaW5ncycgPyAnd2hpdGUnIDogcG92LmNvbG9yLFxuICAgICAgICAgICAgICAgIGZlbjogcG92LmZlbixcbiAgICAgICAgICAgICAgICBsYXN0TW92ZTogbG0gJiYgW2xtWzBdICsgbG1bMV0sIGxtWzJdICsgbG1bM11dXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIGgoJ3NwYW4ubWV0YScsIFtcbiAgICAgICAgICBwb3Yub3Bwb25lbnQuYWkgPyBjdHJsLnRyYW5zKCdhaU5hbWVMZXZlbEFpTGV2ZWwnLCAnU3RvY2tmaXNoJywgcG92Lm9wcG9uZW50LmFpKSA6IHBvdi5vcHBvbmVudC51c2VybmFtZSxcbiAgICAgICAgICBoKCdzcGFuLmluZGljYXRvcicsXG4gICAgICAgICAgICBwb3YuaXNNeVR1cm4gP1xuICAgICAgICAgICAgKHBvdi5zZWNvbmRzTGVmdCA/IHRpbWVyKHBvdikgOiBbY3RybC50cmFucy5ub2FyZygneW91clR1cm4nKV0pIDpcbiAgICAgICAgICAgIGgoJ3NwYW4nLCAnXFx4YTAnKSkgLy8gJm5ic3A7XG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9KSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgSG9va3MgfSBmcm9tICdzbmFiYmRvbS9ob29rcydcbmltcG9ydCBMb2JieUNvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5pbXBvcnQgeyBiaW5kLCBzcGlubmVyIH0gZnJvbSAnLi91dGlsJztcblxuZnVuY3Rpb24gcmVuZGVyUmFuZ2UocmFuZ2U6IHN0cmluZykge1xuICByZXR1cm4gaCgnZGl2LnJhbmdlJywgcmFuZ2UucmVwbGFjZSgnLScsICfigJMnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob29rcyhjdHJsOiBMb2JieUNvbnRyb2xsZXIpOiBIb29rcyB7XG4gIHJldHVybiBiaW5kKCdjbGljaycsIGUgPT4ge1xuICAgIGNvbnN0IGlkID0gKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSB8fFxuICAgICAgKChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudCkuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJyk7XG4gICAgaWYgKGlkID09PSAnY3VzdG9tJykgJCgnLmNvbmZpZ19ob29rJykudHJpZ2dlcignbW91c2Vkb3duJyk7XG4gICAgZWxzZSBpZiAoaWQpIGN0cmwuY2xpY2tQb29sKGlkKTtcbiAgfSwgY3RybC5yZWRyYXcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKGN0cmw6IExvYmJ5Q29udHJvbGxlcikge1xuICBjb25zdCBtZW1iZXIgPSBjdHJsLnBvb2xNZW1iZXI7XG4gIHJldHVybiBjdHJsLnBvb2xzLm1hcChwb29sID0+IHtcbiAgICBjb25zdCBhY3RpdmUgPSAhIW1lbWJlciAmJiBtZW1iZXIuaWQgPT09IHBvb2wuaWQsXG4gICAgdHJhbnNwID0gISFtZW1iZXIgJiYgIWFjdGl2ZTtcbiAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgY2xhc3M6IHtcbiAgICAgICAgYWN0aXZlLFxuICAgICAgICB0cmFuc3A6ICFhY3RpdmUgJiYgdHJhbnNwXG4gICAgICB9LFxuICAgICAgYXR0cnM6IHsgJ2RhdGEtaWQnOiBwb29sLmlkIH1cbiAgICB9LCBbXG4gICAgICBoKCdkaXYuY2xvY2snLCBwb29sLmxpbSArICcrJyArIHBvb2wuaW5jKSxcbiAgICAgIChhY3RpdmUgJiYgbWVtYmVyIS5yYW5nZSkgPyByZW5kZXJSYW5nZShtZW1iZXIhLnJhbmdlISkgOiBoKCdkaXYucGVyZicsIHBvb2wucGVyZiksXG4gICAgICBhY3RpdmUgPyBzcGlubmVyKCkgOiBudWxsXG4gICAgXSk7XG4gIH0pLmNvbmNhdChcbiAgICBoKCdkaXYuY3VzdG9tJywge1xuICAgICAgY2xhc3M6IHsgdHJhbnNwOiAhIW1lbWJlciB9LFxuICAgICAgYXR0cnM6IHsgJ2RhdGEtaWQnOiAnY3VzdG9tJyB9XG4gICAgfSwgY3RybC50cmFucy5ub2FyZygnY3VzdG9tJykpXG4gICk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5pbXBvcnQgTG9iYnlDb250cm9sbGVyIGZyb20gJy4uLy4uL2N0cmwnO1xuaW1wb3J0IHsgSG9vayB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYmluZCwgcGVyZkljb25zIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmZ1bmN0aW9uIHBlcmNlbnRzKHYpIHtcbiAgcmV0dXJuIHYgKyAnJSc7XG59XG5cbmZ1bmN0aW9uIHJhdGluZ0xvZyhhKSB7XG4gIHJldHVybiBNYXRoLmxvZyhhIC8gMTUwICsgMSk7XG59XG5cbmZ1bmN0aW9uIHJhdGluZ1koZSkge1xuICBjb25zdCByYXRpbmcgPSBNYXRoLm1heCgxMDAwLCBNYXRoLm1pbigyMjAwLCBlIHx8IDE1MDApKTtcbiAgbGV0IHJhdGlvO1xuICBsZXQgbWlkID0gMi81O1xuICBpZiAocmF0aW5nID09IDE1MDApIHtcbiAgICByYXRpbyA9IG1pZDtcbiAgfSBlbHNlIGlmIChyYXRpbmcgPiAxNTAwKSB7XG4gICAgcmF0aW8gPSBtaWQgKyAocmF0aW5nTG9nKHJhdGluZyAtIDE1MDApIC8gcmF0aW5nTG9nKDEzMDApKSAqIDIgKiBtaWQ7XG4gIH0gZWxzZSB7XG4gICAgcmF0aW8gPSBtaWQgLSAocmF0aW5nTG9nKDE1MDAgLSByYXRpbmcpIC8gcmF0aW5nTG9nKDUwMCkpICogbWlkO1xuICB9XG4gIHJldHVybiBNYXRoLnJvdW5kKHJhdGlvICogOTQpO1xufVxuXG5jb25zdCBjbG9ja01heCA9IDIwMDA7XG5cbmZ1bmN0aW9uIGNsb2NrWChkdXIpIHtcbiAgZnVuY3Rpb24gZHVyTG9nKGEpIHtcbiAgICByZXR1cm4gTWF0aC5sb2coKGEgLSAzMCkgLyAyMDAgKyAxKTtcbiAgfVxuICByZXR1cm4gTWF0aC5yb3VuZChkdXJMb2coTWF0aC5taW4oY2xvY2tNYXgsIGR1ciB8fCBjbG9ja01heCkpIC8gZHVyTG9nKGNsb2NrTWF4KSAqIDEwMCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBsb3QoY3RybDogTG9iYnlDb250cm9sbGVyLCBob29rOiBIb29rKSB7XG4gIGNvbnN0IGJvdHRvbSA9IE1hdGgubWF4KDAsIHJhdGluZ1koaG9vay5yYXRpbmcpIC0gMiksXG4gICAgbGVmdCA9IE1hdGgubWF4KDAsIGNsb2NrWChob29rLnQpIC0gMiksXG4gICAga2xhc3MgPSBbXG4gICAgICAncGxvdC5uZXcnLFxuICAgICAgaG9vay5yYSA/ICdyYXRlZCcgOiAnY2FzdWFsJyxcbiAgICAgIGhvb2suYWN0aW9uID09PSAnY2FuY2VsJyA/ICdjYW5jZWwnIDogJydcbiAgICBdLmpvaW4oJy4nKTtcbiAgcmV0dXJuIGgoJ3NwYW4jJyArIGhvb2suaWQgKyAnLicgKyBrbGFzcywge1xuICAgIGtleTogaG9vay5pZCxcbiAgICBhdHRyczoge1xuICAgICAgJ2RhdGEtaWNvbic6IHBlcmZJY29uc1tob29rLnBlcmZdLFxuICAgICAgc3R5bGU6IGBib3R0b206JHtwZXJjZW50cyhib3R0b20pfTtsZWZ0OiR7cGVyY2VudHMobGVmdCl9YFxuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgICQodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5wb3dlclRpcCh7XG4gICAgICAgICAgaW50ZW50UG9sbEludGVydmFsOiAxMDAsXG4gICAgICAgICAgcGxhY2VtZW50OiBob29rLnJhdGluZyA+IDE4MDAgPyAnc2UnIDogJ25lJyxcbiAgICAgICAgICBtb3VzZU9uVG9Qb3B1cDogdHJ1ZSxcbiAgICAgICAgICBjbG9zZURlbGF5OiAyMDAsXG4gICAgICAgICAgcG9wdXBJZDogJ2hvb2snXG4gICAgICAgIH0pLmRhdGEoJ3Bvd2VydGlwanEnLCAkKHJlbmRlckhvb2soY3RybCwgaG9vaykpKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5jbGFzc0xpc3QucmVtb3ZlKCduZXcnKTtcbiAgICAgICAgfSwgMjApO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3kodm5vZGUpIHtcbiAgICAgICAgJCh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLmRhdGEoJ3Bvd2VydGlwanEnLCBudWxsKTtcbiAgICAgICAgJC5wb3dlclRpcC5kZXN0cm95KHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVySG9vayhjdHJsOiBMb2JieUNvbnRyb2xsZXIsIGhvb2s6IEhvb2spOiBzdHJpbmcge1xuICBjb25zdCBjb2xvciA9IGhvb2suYyB8fCAncmFuZG9tJztcbiAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImlubmVyXCI+JztcbiAgaWYgKGhvb2sucmF0aW5nKSB7XG4gICAgaHRtbCArPSAnPGEgY2xhc3M9XCJvcHBvbmVudCB1bHB0IGlzIGNvbG9yLWljb24gJyArIGNvbG9yICsgJ1wiIGhyZWY9XCIvQC8nICsgaG9vay51ICsgJ1wiPic7XG4gICAgaHRtbCArPSAnICcgKyBob29rLnUgKyAnICgnICsgaG9vay5yYXRpbmcgKyAoaG9vay5wcm92ID8gJz8nIDogJycpICsgJyknO1xuICAgIGh0bWwgKz0gJzwvYT4nO1xuICB9IGVsc2Uge1xuICAgIGh0bWwgKz0gJzxzcGFuIGNsYXNzPVwib3Bwb25lbnQgYW5vbiAnICsgY29sb3IgKyAnXCI+JyArIGN0cmwudHJhbnMoJ2Fub255bW91cycpICsgJzwvc3Bhbj4nO1xuICB9XG4gIGh0bWwgKz0gaG9vay5jbG9jaztcbiAgaHRtbCArPSAnPGkgZGF0YS1pY29uPVwiJyArIHBlcmZJY29uc1tob29rLnBlcmZdICsgJ1wiPiAnICsgY3RybC50cmFucyhob29rLnJhID8gJ3JhdGVkJyA6ICdjYXN1YWwnKSArICc8L2k+JztcbiAgaHRtbCArPSAnPC9kaXY+JztcbiAgcmV0dXJuIGh0bWw7XG59XG5cbmNvbnN0IHhNYXJrcyA9IFsxLCAyLCAzLCA1LCA3LCAxMCwgMTUsIDIwLCAzMF07XG5cbmZ1bmN0aW9uIHJlbmRlclhBeGlzKCkge1xuICBjb25zdCB0YWdzOiBWTm9kZVtdID0gW107XG4gIHhNYXJrcy5mb3JFYWNoKHYgPT4ge1xuICAgIGNvbnN0IGwgPSBjbG9ja1godiAqIDYwKTtcbiAgICB0YWdzLnB1c2goaCgnc3Bhbi54LmxhYmVsJywge1xuICAgICAgYXR0cnM6IHsgc3R5bGU6ICdsZWZ0OicgKyBwZXJjZW50cyhsIC0gMS41KSB9XG4gICAgfSwgJycgKyB2KSk7XG4gICAgdGFncy5wdXNoKGgoJ2Rpdi5ncmlkLnZlcnQnLCB7XG4gICAgICBhdHRyczogeyBzdHlsZTogJ3dpZHRoOicgKyBwZXJjZW50cyhsKSB9XG4gICAgfSkpO1xuICB9KTtcbiAgcmV0dXJuIHRhZ3M7XG59XG5cbmNvbnN0IHlNYXJrcyA9IFsxMDAwLCAxMjAwLCAxNDAwLCAxNTAwLCAxNjAwLCAxODAwLCAyMDAwXTtcblxuZnVuY3Rpb24gcmVuZGVyWUF4aXMoKSB7XG4gIGNvbnN0IHRhZ3M6IFZOb2RlW10gPSBbXTtcbiAgeU1hcmtzLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgIGNvbnN0IGIgPSByYXRpbmdZKHYpO1xuICAgIHRhZ3MucHVzaChoKCdzcGFuLnkubGFiZWwnLCB7XG4gICAgICBhdHRyczogeyBzdHlsZTogJ2JvdHRvbTonICsgcGVyY2VudHMoYiArIDEpIH1cbiAgICB9LCAnJyArIHYpKTtcbiAgICB0YWdzLnB1c2goaCgnZGl2LmdyaWQuaG9yaXonLCB7XG4gICAgICBhdHRyczogeyBzdHlsZTogJ2hlaWdodDonICsgcGVyY2VudHMoYiArIDAuOCkgfVxuICAgIH0pKTtcbiAgfSk7XG4gIHJldHVybiB0YWdzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlKGN0cmw6IExvYmJ5Q29udHJvbGxlcikge1xuICByZXR1cm4gaCgnaS50b2dnbGUnLCB7XG4gICAga2V5OiAnc2V0LW1vZGUtbGlzdCcsXG4gICAgYXR0cnM6IHsgdGl0bGU6IGN0cmwudHJhbnMubm9hcmcoJ2xpc3QnKSwgJ2RhdGEtaWNvbic6ICc/JyB9LFxuICAgIGhvb2s6IGJpbmQoJ21vdXNlZG93bicsIF8gPT4gY3RybC5zZXRNb2RlKCdsaXN0JyksIGN0cmwucmVkcmF3KVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihjdHJsOiBMb2JieUNvbnRyb2xsZXIsIGhvb2tzOiBIb29rW10pIHtcbiAgcmV0dXJuIGgoJ2Rpdi5ob29rc19fY2hhcnQnLCBbXG4gICAgaCgnZGl2LmNhbnZhcycsIHtcbiAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGlmICgoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsYXNzTGlzdC5jb250YWlucygncGxvdCcpKSBjdHJsLmNsaWNrSG9vaygoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmlkKTtcbiAgICAgIH0sIGN0cmwucmVkcmF3KVxuICAgIH0sIGhvb2tzLm1hcChob29rID0+IHJlbmRlclBsb3QoY3RybCwgaG9vaykpKSxcbiAgICAuLi5yZW5kZXJZQXhpcygpLFxuICAgIC4uLnJlbmRlclhBeGlzKClcbiAgXSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgYmluZCB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IExvYmJ5Q29udHJvbGxlciBmcm9tICcuLi8uLi9jdHJsJztcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZShjdHJsOiBMb2JieUNvbnRyb2xsZXIsIGVsKSB7XG4gIGNvbnN0ICRkaXYgPSAkKGVsKSxcbiAgICAkcmF0aW5nUmFuZ2UgPSAkZGl2LmZpbmQoJy5yYXRpbmctcmFuZ2UnKTtcblxuICBjb25zdCBzYXZlID0gd2luZG93LmxpY2hlc3MuZGVib3VuY2UoZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgJGZvcm0gPSAkZGl2LmZpbmQoJ2Zvcm0nKTtcbiAgICAkLmFqYXgoe1xuICAgICAgLi4ud2luZG93LmxpY2hlc3MuZm9ybUFqYXgoJGZvcm0pLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oZmlsdGVyKSB7XG4gICAgICAgIGN0cmwuc2V0RmlsdGVyKGZpbHRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sIDIwMCk7XG5cbiAgZnVuY3Rpb24gY2hhbmdlUmF0aW5nUmFuZ2UodmFsdWVzKSB7XG4gICAgJHJhdGluZ1JhbmdlLmZpbmQoJ2lucHV0JykudmFsKHZhbHVlc1swXSArIFwiLVwiICsgdmFsdWVzWzFdKTtcbiAgICAkcmF0aW5nUmFuZ2Uuc2libGluZ3MoJy5yYW5nZScpLnRleHQodmFsdWVzWzBdICsgXCLigJNcIiArIHZhbHVlc1sxXSk7XG4gICAgc2F2ZSgpO1xuICB9XG4gICRkaXYuZmluZCgnaW5wdXQnKS5jaGFuZ2Uoc2F2ZSk7XG4gICRkaXYuZmluZCgnYnV0dG9uLnJlc2V0JykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgJGRpdi5maW5kKCdsYWJlbCBpbnB1dCcpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAkZGl2LmZpbmQoJy5yYXRpbmctcmFuZ2UnKS5lYWNoKGZ1bmN0aW9uKHRoaXM6IEhUTUxFbGVtZW50KSB7XG4gICAgICBjb25zdCBzID0gJCh0aGlzKSxcbiAgICAgICAgdmFsdWVzID0gW3Muc2xpZGVyKCdvcHRpb24nLCAnbWluJyksIHMuc2xpZGVyKCdvcHRpb24nLCAnbWF4JyldO1xuICAgICAgcy5zbGlkZXIoJ3ZhbHVlcycsIHZhbHVlcyk7XG4gICAgICBjaGFuZ2VSYXRpbmdSYW5nZSh2YWx1ZXMpO1xuICAgIH0pO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG4gICRkaXYuZmluZCgnYnV0dG9uLmFwcGx5JykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgY3RybC50b2dnbGVGaWx0ZXIoKTtcbiAgICBjdHJsLnJlZHJhdygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG4gICRyYXRpbmdSYW5nZS5lYWNoKGZ1bmN0aW9uKHRoaXM6IEhUTUxFbGVtZW50KSB7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICB3aW5kb3cubGljaGVzcy5zbGlkZXIoKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRpbnB1dCA9ICR0aGlzLmZpbmQoXCJpbnB1dFwiKTtcbiAgICAgIHZhciAkc3BhbiA9ICR0aGlzLnNpYmxpbmdzKFwiLnJhbmdlXCIpO1xuICAgICAgdmFyIG1pbiA9ICRpbnB1dC5kYXRhKFwibWluXCIpO1xuICAgICAgdmFyIG1heCA9ICRpbnB1dC5kYXRhKFwibWF4XCIpO1xuICAgICAgdmFyIHZhbHVlcyA9ICRpbnB1dC52YWwoKSA/ICRpbnB1dC52YWwoKS5zcGxpdChcIi1cIikgOiBbbWluLCBtYXhdO1xuICAgICAgJHNwYW4udGV4dCh2YWx1ZXMuam9pbign4oCTJykpO1xuICAgICAgJHRoaXMuc2xpZGVyKHtcbiAgICAgICAgcmFuZ2U6IHRydWUsXG4gICAgICAgIG1pbjogbWluLFxuICAgICAgICBtYXg6IG1heCxcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHN0ZXA6IDUwLFxuICAgICAgICBzbGlkZShfLCB1aSkge1xuICAgICAgICAgIGNoYW5nZVJhdGluZ1JhbmdlKHVpLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZShjdHJsOiBMb2JieUNvbnRyb2xsZXIsIG5iRmlsdGVyZWQ6IG51bWJlcikge1xuICByZXR1cm4gaCgnaS50b2dnbGUudG9nZ2xlLWZpbHRlcicsIHtcbiAgICBjbGFzczogeyBnYW1lc0ZpbHRlcmVkOiBuYkZpbHRlcmVkID4gMCwgYWN0aXZlOiBjdHJsLmZpbHRlck9wZW4gfSxcbiAgICBob29rOiBiaW5kKCdtb3VzZWRvd24nLCBjdHJsLnRvZ2dsZUZpbHRlciwgY3RybC5yZWRyYXcpLFxuICAgIGF0dHJzOiB7XG4gICAgICAnZGF0YS1pY29uJzogY3RybC5maWx0ZXJPcGVuID8gJ0wnIDogJyUnLFxuICAgICAgdGl0bGU6IGN0cmwudHJhbnMubm9hcmcoJ2ZpbHRlckdhbWVzJylcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlck5vZGUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGZpbHRlckxvYWRlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoY3RybDogTG9iYnlDb250cm9sbGVyKSB7XG4gIHJldHVybiBoKCdkaXYuaG9va19fZmlsdGVycycsIHtcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgICAgY29uc3QgZWwgPSB2bm9kZS5lbG0gYXMgRmlsdGVyTm9kZTtcbiAgICAgICAgaWYgKGVsLmZpbHRlckxvYWRlZCkgcmV0dXJuO1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJy9zZXR1cC9maWx0ZXInLFxuICAgICAgICAgIHN1Y2Nlc3MoaHRtbCkge1xuICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIGVsLmZpbHRlckxvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICBpbml0aWFsaXplKGN0cmwsIGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgTG9iYnlDb250cm9sbGVyIGZyb20gJy4uLy4uL2N0cmwnO1xuaW1wb3J0IHsgYmluZCwgdGRzLCBwZXJmSWNvbnMgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCAqIGFzIGhvb2tSZXBvIGZyb20gJy4uLy4uL2hvb2tSZXBvJztcbmltcG9ydCB7IEhvb2sgfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzJztcblxuZnVuY3Rpb24gcmVuZGVySG9vayhjdHJsOiBMb2JieUNvbnRyb2xsZXIsIGhvb2s6IEhvb2spIHtcbiAgY29uc3Qgbm9hcmcgPSBjdHJsLnRyYW5zLm5vYXJnO1xuICByZXR1cm4gaCgndHIuaG9vay4nICsgaG9vay5hY3Rpb24sIHtcbiAgICBrZXk6IGhvb2suaWQsXG4gICAgY2xhc3M6IHsgZGlzYWJsZWQ6IGhvb2suZGlzYWJsZWQgfSxcbiAgICBhdHRyczoge1xuICAgICAgdGl0bGU6IGhvb2suZGlzYWJsZWQgPyAnJyA6IChcbiAgICAgICAgKGhvb2suYWN0aW9uID09PSAnam9pbicpID8gbm9hcmcoJ2pvaW5UaGVHYW1lJykgKyAnIHwgJyArIGhvb2sucGVyZiA6IG5vYXJnKCdjYW5jZWwnKVxuICAgICAgKSxcbiAgICAgICdkYXRhLWlkJzogaG9vay5pZFxuICAgIH0sXG4gIH0sIHRkcyhbXG4gICAgaCgnc3Bhbi5pcy5pczIuY29sb3ItaWNvbi4nICsgKGhvb2suYyB8fCAncmFuZG9tJykpLFxuICAgIChob29rLnJhdGluZyA/IGgoJ3NwYW4udWxpbmsudWxwdCcsIHtcbiAgICAgIGF0dHJzOiB7ICdkYXRhLWhyZWYnOiAnL0AvJyArIGhvb2sudSB9XG4gICAgfSwgaG9vay51KSA6ICdBbm9ueW1vdXMnKSxcbiAgICAoaG9vay5yYXRpbmcgPyBob29rLnJhdGluZyA6ICcnKSArIChob29rLnByb3YgPyAnPycgOiAnJyksXG4gICAgaG9vay5jbG9jayxcbiAgICBoKCdzcGFuJywge1xuICAgICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6IHBlcmZJY29uc1tob29rLnBlcmZdIH1cbiAgICB9LCBub2FyZyhob29rLnJhID8gJ3JhdGVkJyA6ICdjYXN1YWwnKSlcbiAgXSkpO1xufVxuXG5mdW5jdGlvbiBpc1N0YW5kYXJkKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbihob29rKSB7XG4gICAgcmV0dXJuIChob29rLnZhcmlhbnQgPT09ICdzdGFuZGFyZCcpID09PSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaXNNaW5lKGhvb2spIHtcbiAgcmV0dXJuIGhvb2suYWN0aW9uID09PSAnY2FuY2VsJztcbn1cblxuZnVuY3Rpb24gaXNOb3RNaW5lKGhvb2spIHtcbiAgcmV0dXJuICFpc01pbmUoaG9vayk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGUoY3RybDogTG9iYnlDb250cm9sbGVyKSB7XG4gIHJldHVybiBoKCdpLnRvZ2dsZScsIHtcbiAgICBrZXk6ICdzZXQtbW9kZS1jaGFydCcsXG4gICAgYXR0cnM6IHsgdGl0bGU6IGN0cmwudHJhbnMubm9hcmcoJ2dyYXBoJyksICdkYXRhLWljb24nOiAnOScgfSxcbiAgICBob29rOiBiaW5kKCdtb3VzZWRvd24nLCBfID0+IGN0cmwuc2V0TW9kZSgnY2hhcnQnKSwgY3RybC5yZWRyYXcpXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKGN0cmw6IExvYmJ5Q29udHJvbGxlciwgYWxsSG9va3M6IEhvb2tbXSkge1xuICBjb25zdCBtaW5lID0gYWxsSG9va3MuZmluZChpc01pbmUpLFxuICAgIG1heCA9IG1pbmUgPyAxMyA6IDE0LFxuICAgIGhvb2tzID0gYWxsSG9va3Muc2xpY2UoMCwgbWF4KSxcbiAgICByZW5kZXIgPSAoaG9vazogSG9vaykgPT4gcmVuZGVySG9vayhjdHJsLCBob29rKSxcbiAgICBzdGFuZGFyZHMgPSBob29rcy5maWx0ZXIoaXNOb3RNaW5lKS5maWx0ZXIoaXNTdGFuZGFyZCh0cnVlKSk7XG4gIGhvb2tSZXBvLnNvcnQoY3RybCwgc3RhbmRhcmRzKTtcbiAgY29uc3QgdmFyaWFudHMgPSBob29rcy5maWx0ZXIoaXNOb3RNaW5lKS5maWx0ZXIoaXNTdGFuZGFyZChmYWxzZSkpXG4gICAgLnNsaWNlKDAsIE1hdGgubWF4KDAsIG1heCAtIHN0YW5kYXJkcy5sZW5ndGggLSAxKSk7XG4gIGhvb2tSZXBvLnNvcnQoY3RybCwgdmFyaWFudHMpO1xuICBjb25zdCByZW5kZXJlZEhvb2tzID0gW1xuICAgIC4uLnN0YW5kYXJkcy5tYXAocmVuZGVyKSxcbiAgICB2YXJpYW50cy5sZW5ndGggPyBoKCd0ci52YXJpYW50cycsIHtcbiAgICAgIGtleTogJ3ZhcmlhbnRzJyxcbiAgICB9LCBbXG4gICAgICBoKCd0ZCcsIHtcbiAgICAgICAgYXR0cnM6IHsgY29sc3BhbjogNSB9XG4gICAgICB9LCAn4oCUICcgKyBjdHJsLnRyYW5zKCd2YXJpYW50JykgKyAnIOKAlCcpXG4gICAgXSkgOiBudWxsLFxuICAgIC4uLnZhcmlhbnRzLm1hcChyZW5kZXIpXG4gIF07XG4gIGlmIChtaW5lKSByZW5kZXJlZEhvb2tzLnVuc2hpZnQocmVuZGVyKG1pbmUpKTtcbiAgcmV0dXJuIGgoJ3RhYmxlLmhvb2tzX19saXN0JywgW1xuICAgIGgoJ3RoZWFkJyxcbiAgICAgIGgoJ3RyJywgW1xuICAgICAgICBoKCd0aCcpLFxuICAgICAgICBoKCd0aCcsIGN0cmwudHJhbnMoJ3BsYXllcicpKSxcbiAgICAgICAgaCgndGgnLCB7XG4gICAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc29ydDogY3RybC5zb3J0ID09PSAncmF0aW5nJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCBfID0+IGN0cmwuc2V0U29ydCgncmF0aW5nJyksIGN0cmwucmVkcmF3KVxuICAgICAgICB9LCBbaCgnaS5pcycpLCBjdHJsLnRyYW5zKCdyYXRpbmcnKV0pLFxuICAgICAgICBoKCd0aCcsIHtcbiAgICAgICAgICBjbGFzczoge1xuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBzb3J0OiBjdHJsLnNvcnQgPT09ICd0aW1lJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCBfID0+IGN0cmwuc2V0U29ydCgndGltZScpLCBjdHJsLnJlZHJhdylcbiAgICAgICAgfSwgW2goJ2kuaXMnKSwgY3RybC50cmFucygndGltZScpXSksXG4gICAgICAgIGgoJ3RoJywgY3RybC50cmFucygnbW9kZScpKVxuICAgICAgXSlcbiAgICApLFxuICAgIGgoJ3Rib2R5Jywge1xuICAgICAgY2xhc3M6IHsgc3RlcHBpbmc6IGN0cmwuc3RlcHBpbmcgfSxcbiAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGxldCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgaWYgKGVsLm5vZGVOYW1lID09PSAnVFInKSByZXR1cm4gY3RybC5jbGlja0hvb2soZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykhKTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoZWwubm9kZU5hbWUgIT09ICdUQUJMRScpO1xuICAgICAgfSwgY3RybC5yZWRyYXcpXG4gICAgfSwgcmVuZGVyZWRIb29rcylcbiAgXSk7XG59XG4iLCJpbXBvcnQgKiBhcyBsaXN0IGZyb20gJy4vbGlzdCc7XG5pbXBvcnQgKiBhcyBjaGFydCBmcm9tICcuL2NoYXJ0JztcbmltcG9ydCBmaWx0ZXIgZnJvbSAnLi4vLi4vZmlsdGVyJztcbmltcG9ydCAqIGFzIGZpbHRlclZpZXcgZnJvbSAnLi9maWx0ZXInO1xuaW1wb3J0IExvYmJ5Q29udHJvbGxlciBmcm9tICcuLi8uLi9jdHJsJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY3RybDogTG9iYnlDb250cm9sbGVyKSB7XG4gIGxldCBmaWx0ZXJCb2R5LCBib2R5LCBuYkZpbHRlcmVkLCBtb2RlVG9nZ2xlLCByZXM7XG4gIGlmIChjdHJsLmZpbHRlck9wZW4pIGZpbHRlckJvZHkgPSBmaWx0ZXJWaWV3LnJlbmRlcihjdHJsKTtcbiAgc3dpdGNoIChjdHJsLm1vZGUpIHtcbiAgICBjYXNlICdjaGFydCc6XG4gICAgICByZXMgPSBmaWx0ZXIoY3RybCwgY3RybC5kYXRhLmhvb2tzKTtcbiAgICAgIG5iRmlsdGVyZWQgPSByZXMuaGlkZGVuO1xuICAgICAgYm9keSA9IGZpbHRlckJvZHkgfHwgY2hhcnQucmVuZGVyKGN0cmwsIHJlcy52aXNpYmxlKTtcbiAgICAgIG1vZGVUb2dnbGUgPSBjdHJsLmZpbHRlck9wZW4gPyBudWxsIDogY2hhcnQudG9nZ2xlKGN0cmwpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJlcyA9IGZpbHRlcihjdHJsLCBjdHJsLnN0ZXBIb29rcyk7XG4gICAgICBuYkZpbHRlcmVkID0gcmVzLmhpZGRlbjtcbiAgICAgIGJvZHkgPSBmaWx0ZXJCb2R5IHx8IGxpc3QucmVuZGVyKGN0cmwsIHJlcy52aXNpYmxlKTtcbiAgICAgIG1vZGVUb2dnbGUgPSBjdHJsLmZpbHRlck9wZW4gPyBudWxsIDogbGlzdC50b2dnbGUoY3RybCk7XG4gIH1cbiAgY29uc3QgZmlsdGVyVG9nZ2xlID0gZmlsdGVyVmlldy50b2dnbGUoY3RybCwgbmJGaWx0ZXJlZCk7XG4gIHJldHVybiBbXG4gICAgZmlsdGVyVG9nZ2xlLFxuICAgIG1vZGVUb2dnbGUsXG4gICAgYm9keVxuICBdO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJztcbmltcG9ydCB7IGJpbmQgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IExvYmJ5Q29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IE1heWJlVk5vZGVzLCBUYWIgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuZnVuY3Rpb24gdGFiKGN0cmw6IExvYmJ5Q29udHJvbGxlciwga2V5OiBUYWIsIGFjdGl2ZTogVGFiLCBjb250ZW50OiBNYXliZVZOb2Rlcykge1xuICByZXR1cm4gaCgnc3BhbicsIHtcbiAgICBjbGFzczoge1xuICAgICAgYWN0aXZlOiBrZXkgPT09IGFjdGl2ZSxcbiAgICAgIGdsb3dpbmc6IGtleSAhPT0gYWN0aXZlICYmIGtleSA9PT0gJ3Bvb2xzJyAmJiAhIWN0cmwucG9vbE1lbWJlclxuICAgIH0sXG4gICAgaG9vazogYmluZCgnbW91c2Vkb3duJywgXyA9PiBjdHJsLnNldFRhYihrZXkpLCBjdHJsLnJlZHJhdylcbiAgfSwgY29udGVudCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IExvYmJ5Q29udHJvbGxlcikge1xuICBjb25zdCBteVR1cm5Qb3ZzTmIgPSBjdHJsLmRhdGEubm93UGxheWluZy5maWx0ZXIoZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBwLmlzTXlUdXJuO1xuICB9KS5sZW5ndGg7XG4gIGNvbnN0IGFjdGl2ZSA9IGN0cmwudGFiO1xuICByZXR1cm4gW1xuICAgIGN0cmwuaXNCb3QgPyB1bmRlZmluZWQgOiB0YWIoY3RybCwgJ3Bvb2xzJywgYWN0aXZlLCBbY3RybC50cmFucy5ub2FyZygncXVpY2tQYWlyaW5nJyldKSxcbiAgICBjdHJsLmlzQm90ID8gdW5kZWZpbmVkIDogdGFiKGN0cmwsICdyZWFsX3RpbWUnLCBhY3RpdmUsIFtjdHJsLnRyYW5zLm5vYXJnKCdsb2JieScpXSksXG4gICAgY3RybC5pc0JvdCA/IHVuZGVmaW5lZCA6IHRhYihjdHJsLCAnc2Vla3MnLCBhY3RpdmUsIFtjdHJsLnRyYW5zLm5vYXJnKCdjb3JyZXNwb25kZW5jZScpXSksXG4gICAgKGFjdGl2ZSA9PT0gJ25vd19wbGF5aW5nJyB8fCBjdHJsLmRhdGEubmJOb3dQbGF5aW5nID4gMCB8fCBjdHJsLmlzQm90KSA/IHRhYihjdHJsLCAnbm93X3BsYXlpbmcnLCBhY3RpdmUsIFtcbiAgICAgIGN0cmwudHJhbnMucGx1cmFsKCduYkdhbWVzSW5QbGF5JywgY3RybC5kYXRhLm5iTm93UGxheWluZyksXG4gICAgICBteVR1cm5Qb3ZzTmIgPiAwID8gaCgnaS51bnJlYWQnLCBteVR1cm5Qb3ZzTmIpIDogbnVsbFxuICAgIF0pIDogbnVsbFxuICBdO1xufTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IEhvb2tzIH0gZnJvbSAnc25hYmJkb20vaG9va3MnXG5pbXBvcnQgeyBNYXliZVZOb2RlcyB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZChldmVudE5hbWU6IHN0cmluZywgZjogKGU6IEV2ZW50KSA9PiBhbnksIHJlZHJhdz86ICgpID0+IHZvaWQpOiBIb29rcyB7XG4gIHJldHVybiB7XG4gICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGYoZSk7XG4gICAgICAgIGlmIChyZWRyYXcpIHJlZHJhdygpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGRzKGJpdHM6IE1heWJlVk5vZGVzKTogTWF5YmVWTm9kZXMge1xuICByZXR1cm4gYml0cy5tYXAoZnVuY3Rpb24oYml0KSB7XG4gICAgcmV0dXJuIGgoJ3RkJywgW2JpdF0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwaW5uZXIoKSB7XG4gIHJldHVybiBoKCdkaXYuc3Bpbm5lcicsIFtcbiAgICBoKCdzdmcnLCB7IGF0dHJzOiB7IHZpZXdCb3g6ICcwIDAgNDAgNDAnIH0gfSwgW1xuICAgICAgaCgnY2lyY2xlJywge1xuICAgICAgICBhdHRyczogeyBjeDogMjAsIGN5OiAyMCwgcjogMTgsIGZpbGw6ICdub25lJyB9XG4gICAgICB9KV0pXSk7XG59XG5cbmV4cG9ydCBjb25zdCBwZXJmSWNvbnMgPSB7XG4gICdCbGl0eic6JyknLFxuICAnUmFjaW5nIEtpbmdzJzon7oCKJyxcbiAgJ1VsdHJhQnVsbGV0JzoneycsXG4gICdCdWxsZXQnOidUJyxcbiAgJ0NsYXNzaWNhbCc6JysnLFxuICAnUmFwaWQnOicjJyxcbiAgJ1RocmVlLWNoZWNrJzonLicsXG4gICdBbnRpY2hlc3MnOidAJyxcbiAgJ0hvcmRlJzonXycsXG4gICdBdG9taWMnOic+JyxcbiAgJ0NyYXp5aG91c2UnOifugIsnLFxuICAnQ2hlc3M5NjAnOidcXCcnLFxuICAnQ29ycmVzcG9uZGVuY2UnOic7JyxcbiAgJ0tpbmcgb2YgdGhlIEhpbGwnOicoJ1xufTtcbiIsImNvbnN0IGhlYWRlcnMgPSB7XG4gICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmxpY2hlc3MudjMranNvbidcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWVrcygpIHtcbiAgcmV0dXJuICQuYWpheCh7XG4gICAgdXJsOiAnL2xvYmJ5L3NlZWtzJyxcbiAgICBoZWFkZXJzOiBoZWFkZXJzXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm93UGxheWluZygpIHtcbiAgcmV0dXJuICQuYWpheCh7XG4gICAgdXJsOiAnL2FjY291bnQvbm93LXBsYXlpbmcnLFxuICAgIGhlYWRlcnM6IGhlYWRlcnNcbiAgfSkudGhlbihvID0+IG8ubm93UGxheWluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbm9uUG9vbFNlZWsocG9vbCkge1xuICByZXR1cm4gJC5hamF4KHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6ICcvc2V0dXAvaG9vay8nICsgd2luZG93LmxpY2hlc3Muc3JpLFxuICAgIGRhdGE6IHtcbiAgICAgIHZhcmlhbnQ6IDEsXG4gICAgICB0aW1lTW9kZTogMSxcbiAgICAgIHRpbWU6IHBvb2wubGltLFxuICAgICAgaW5jcmVtZW50OiBwb29sLmluYyxcbiAgICAgIGRheXM6IDEsXG4gICAgICBjb2xvcjogJ3JhbmRvbSdcbiAgICB9XG4gIH0pO1xufVxuIl19
