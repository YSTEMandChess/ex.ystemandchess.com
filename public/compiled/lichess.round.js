(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessRound = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./moderation":31,"./note":32,"./preset":33,"common":40}],28:[function(require,module,exports){
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

},{"./enhance":29,"./moderation":31,"./preset":33,"./spam":34,"./util":35,"./xhr":37,"snabbdom":24}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"./ctrl":27,"./view":36,"snabbdom":24,"snabbdom/modules/attributes":22,"snabbdom/modules/class":23}],31:[function(require,module,exports){
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

},{"./util":35,"./xhr":37,"snabbdom":24}],32:[function(require,module,exports){
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

},{"./util":35,"./xhr":37,"snabbdom":24}],33:[function(require,module,exports){
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

},{"./util":35,"snabbdom":24}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"snabbdom":24}],36:[function(require,module,exports){
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

},{"./discussion":28,"./moderation":31,"./note":32,"./util":35,"snabbdom":24}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{"./piotr":39}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{"./throttle":45}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
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

},{}],45:[function(require,module,exports){
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

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const status = require("./status");
function playable(data) {
    return data.game.status.id < status.ids.aborted && !imported(data);
}
exports.playable = playable;
function isPlayerPlaying(data) {
    return playable(data) && !data.player.spectator;
}
exports.isPlayerPlaying = isPlayerPlaying;
function isPlayerTurn(data) {
    return isPlayerPlaying(data) && data.game.player == data.player.color;
}
exports.isPlayerTurn = isPlayerTurn;
function isFriendGame(data) {
    return data.game.source === 'friend';
}
exports.isFriendGame = isFriendGame;
function isClassical(data) {
    return data.game.perf === 'classical';
}
exports.isClassical = isClassical;
function mandatory(data) {
    return !!data.tournament || !!data.simul;
}
exports.mandatory = mandatory;
function playedTurns(data) {
    return data.game.turns - (data.game.startedAtTurn || 0);
}
exports.playedTurns = playedTurns;
function bothPlayersHavePlayed(data) {
    return playedTurns(data) > 1;
}
exports.bothPlayersHavePlayed = bothPlayersHavePlayed;
function abortable(data) {
    return playable(data) && !bothPlayersHavePlayed(data) && !mandatory(data);
}
exports.abortable = abortable;
function takebackable(data) {
    return playable(data) &&
        data.takebackable &&
        bothPlayersHavePlayed(data) &&
        !data.player.proposingTakeback &&
        !data.opponent.proposingTakeback;
}
exports.takebackable = takebackable;
function drawable(data) {
    return playable(data) &&
        data.game.turns >= 2 &&
        !data.player.offeringDraw &&
        !hasAi(data);
}
exports.drawable = drawable;
function resignable(data) {
    return playable(data) && !abortable(data);
}
exports.resignable = resignable;
// can the current player go berserk?
function berserkableBy(data) {
    return !!data.tournament &&
        data.tournament.berserkable &&
        isPlayerPlaying(data) &&
        !bothPlayersHavePlayed(data);
}
exports.berserkableBy = berserkableBy;
function moretimeable(data) {
    return isPlayerPlaying(data) && data.moretimeable && (!!data.clock ||
        (!!data.correspondence &&
            data.correspondence[data.opponent.color] < (data.correspondence.increment - 3600)));
}
exports.moretimeable = moretimeable;
function imported(data) {
    return data.game.source === 'import';
}
exports.imported = imported;
function replayable(data) {
    return imported(data) || status.finished(data) ||
        (status.aborted(data) && bothPlayersHavePlayed(data));
}
exports.replayable = replayable;
function getPlayer(data, color) {
    if (data.player.color === color)
        return data.player;
    if (data.opponent.color === color)
        return data.opponent;
    return null;
}
exports.getPlayer = getPlayer;
function hasAi(data) {
    return !!(data.player.ai || data.opponent.ai);
}
exports.hasAi = hasAi;
function userAnalysable(data) {
    return status.finished(data) || playable(data) && (!data.clock || !isPlayerPlaying(data));
}
exports.userAnalysable = userAnalysable;
function isCorrespondence(data) {
    return data.game.speed === 'correspondence';
}
exports.isCorrespondence = isCorrespondence;
function setOnGame(data, color, onGame) {
    const player = getPlayer(data, color);
    onGame = onGame || !!player.ai;
    player.onGame = onGame;
    if (onGame)
        setGone(data, color, false);
}
exports.setOnGame = setOnGame;
function setGone(data, color, gone) {
    const player = getPlayer(data, color);
    player.gone = !player.ai && gone;
    if (player.gone === false && player.user)
        player.user.online = true;
}
exports.setGone = setGone;
function nbMoves(data, color) {
    return Math.floor((data.game.turns + (color == 'white' ? 1 : 0)) / 2);
}
exports.nbMoves = nbMoves;
function isSwitchable(data) {
    return !hasAi(data) && (!!data.simul || isCorrespondence(data));
}
exports.isSwitchable = isSwitchable;

},{"./status":48}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function game(data, color, embed) {
    const id = data.game ? data.game.id : data;
    return (embed ? '/embed/' : '/') + id + (color ? '/' + color : '');
}
exports.game = game;
function cont(data, mode) {
    return game(data) + '/continue/' + mode;
}
exports.cont = cont;

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://github.com/ornicar/scalachess/blob/master/src/main/scala/Status.scala
exports.ids = {
    created: 10,
    started: 20,
    aborted: 25,
    mate: 30,
    resign: 31,
    stalemate: 32,
    timeout: 33,
    draw: 34,
    outoftime: 35,
    cheat: 36,
    noStart: 37,
    variantEnd: 60
};
function started(data) {
    return data.game.status.id >= exports.ids.started;
}
exports.started = started;
function finished(data) {
    return data.game.status.id >= exports.ids.mate;
}
exports.finished = finished;
function aborted(data) {
    return data.game.status.id === exports.ids.aborted;
}
exports.aborted = aborted;
function playing(data) {
    return started(data) && !finished(data) && !aborted(data);
}
exports.playing = playing;

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function status(ctrl) {
    const noarg = ctrl.trans.noarg, d = ctrl.data;
    switch (d.game.status.name) {
        case 'started':
            return noarg('playingRightNow');
        case 'aborted':
            return noarg('gameAborted');
        case 'mate':
            return noarg('checkmate');
        case 'resign':
            return noarg(d.game.winner == 'white' ? 'blackResigned' : 'whiteResigned');
        case 'stalemate':
            return noarg('stalemate');
        case 'timeout':
            switch (d.game.winner) {
                case 'white':
                    return noarg('blackLeftTheGame');
                case 'black':
                    return noarg('whiteLeftTheGame');
            }
            return noarg('draw');
        case 'draw':
            return noarg('draw');
        case 'outoftime':
            return noarg('timeOut');
        case 'noStart':
            return (d.game.winner == 'white' ? 'Black' : 'White') + ' didn\'t move';
        case 'cheat':
            return 'Cheat detected';
        case 'variantEnd':
            switch (d.game.variant.key) {
                case 'kingOfTheHill':
                    return noarg('kingInTheCenter');
                case 'threeCheck':
                    return noarg('threeChecks');
            }
            return noarg('variantEnding');
        default:
            return d.game.status.name;
    }
}
exports.default = status;

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("chessground/util");
function capture(ctrl, key) {
    const exploding = [], diff = {}, orig = util.key2pos(key), minX = Math.max(1, orig[0] - 1), maxX = Math.min(8, orig[0] + 1), minY = Math.max(1, orig[1] - 1), maxY = Math.min(8, orig[1] + 1);
    const pieces = ctrl.chessground.state.pieces;
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            const k = util.pos2key([x, y]);
            exploding.push(k);
            const explodes = pieces[k] && (k === key || pieces[k].role !== 'pawn');
            if (explodes)
                diff[k] = undefined;
        }
    }
    ctrl.chessground.setPieces(diff);
    ctrl.chessground.explode(exploding);
}
exports.capture = capture;
// needs to explicitly destroy the capturing pawn
function enpassant(ctrl, key, color) {
    const pos = util.key2pos(key), pawnPos = [pos[0], pos[1] + (color === 'white' ? -1 : 1)];
    capture(ctrl, util.pos2key(pawnPos));
}
exports.enpassant = enpassant;

},{"chessground/util":17}],51:[function(require,module,exports){
"use strict";
// Register blur events to be sent as move metadata
Object.defineProperty(exports, "__esModule", { value: true });
let lastFocus = 0;
let focusCutoff = 0;
function init(withBlur) {
    if (!withBlur)
        focusCutoff = Date.now() + 10000;
    window.addEventListener('focus', () => lastFocus = Date.now());
}
exports.init = init;
function get() {
    return lastFocus >= focusCutoff;
}
exports.get = get;
;
function onMove() {
    focusCutoff = Date.now() + 1000;
}
exports.onMove = onMove;
;

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tourStanding_1 = require("./tourStanding");
function default_1(opts) {
    const li = window.lichess;
    const element = document.querySelector('.round__app'), data = opts.data;
    let round, chat;
    if (data.tournament)
        $('body').data('tournament-id', data.tournament.id);
    li.socket = li.StrongSocket(data.url.socket, data.player.version, {
        options: { name: 'round' },
        params: { userTv: data.userTv && data.userTv.id },
        receive(t, d) { round.socketReceive(t, d); },
        events: {
            tvSelect(o) {
                if (data.tv && data.tv.channel == o.channel)
                    li.reload();
                else
                    $('.tv-channels .' + o.channel + ' .champion').html(o.player ? [
                        o.player.title,
                        o.player.name,
                        o.player.rating
                    ].filter(x => x).join('&nbsp') : 'Anonymous');
            },
            end() {
                $.ajax({
                    url: [(data.tv ? '/tv' : ''), data.game.id, data.player.color, 'sides'].join('/'),
                    success: function (html) {
                        const $html = $(html), $meta = $html.find('.game__meta');
                        $meta.length && $('.game__meta').replaceWith($meta);
                        $('.crosstable').replaceWith($html.find('.crosstable'));
                        startTournamentClock();
                        li.pubsub.emit('content_loaded');
                    }
                });
            },
            tourStanding(s) {
                if (opts.chat && opts.chat.plugin && chat) {
                    opts.chat.plugin.set(s);
                    chat.redraw();
                }
            }
        }
    });
    function startTournamentClock() {
        if (opts.data.tournament)
            $('.game__tournament .clock').each(function () {
                $(this).clock({
                    time: parseFloat($(this).data('time'))
                });
            });
    }
    ;
    function getPresetGroup(d) {
        if (d.player.spectator)
            return;
        if (d.steps.length < 4)
            return 'start';
        else if (d.game.status.id >= 30)
            return 'end';
        return;
    }
    ;
    opts.element = element;
    opts.socketSend = li.socket.send;
    if (!opts.tour && !data.simul)
        opts.onChange = (d) => {
            if (chat)
                chat.preset.setGroup(getPresetGroup(d));
        };
    round = window['LichessRound'].app(opts);
    if (opts.chat) {
        if (opts.tour) {
            opts.chat.plugin = tourStanding_1.tourStandingCtrl(opts.tour, opts.i18n.standing);
            opts.chat.alwaysEnabled = true;
        }
        else if (!data.simul) {
            opts.chat.preset = getPresetGroup(opts.data);
            opts.chat.parseMoves = true;
        }
        li.makeChat(opts.chat, function (c) {
            chat = c;
        });
    }
    startTournamentClock();
    $('.round__now-playing .move-on input')
        .change(round.moveOn.toggle)
        .prop('checked', round.moveOn.get())
        .on('click', 'a', function () {
        li.hasToReload = true;
        return true;
    });
    if (location.pathname.lastIndexOf('/round-next/', 0) === 0)
        history.replaceState(null, '', '/' + data.game.id);
    $('#zentog').click(() => li.pubsub.emit('zen'));
    li.storage.make('reload-round-tabs').listen(li.reload);
}
exports.default = default_1;

},{"./tourStanding":72}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const round_1 = require("./round");
const li = window.lichess;
let found = false;
function truncateFen(fen) {
    return fen.split(' ')[0];
}
function subscribe(ctrl) {
    // allow everyone to cheat against the AI
    if (ctrl.data.opponent.ai)
        return;
    // allow registered players to use assistance in casual games
    if (!ctrl.data.game.rated && ctrl.opts.userId)
        return;
    // bots can cheat alright
    if (ctrl.data.player.user && ctrl.data.player.user.title === 'BOT')
        return;
    li.storage.make('ceval.fen').listen(e => {
        if (e.value === 'start')
            return li.storage.fire('round.ongoing');
        const d = ctrl.data, step = round_1.lastStep(ctrl.data);
        if (!found && step.ply > 14 && ctrl.isPlaying() &&
            e.value && truncateFen(step.fen) === truncateFen(e.value)) {
            $.post('/jslog/' + d.game.id + d.player.id + '?n=ceval');
            found = true;
        }
        return;
    });
}
exports.subscribe = subscribe;
function publish(d, move) {
    if (d.opponent.ai)
        li.storage.fire('ceval.fen', move.fen);
}
exports.publish = publish;

},{"./round":67}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clockView_1 = require("./clockView");
const game = require("game");
class ClockController {
    constructor(d, opts) {
        this.opts = opts;
        this.emergSound = {
            play: window.lichess.sound.lowtime,
            delay: 20000,
            playable: {
                white: true,
                black: true
            }
        };
        this.elements = {
            white: {},
            black: {}
        };
        this.timeRatio = (millis) => Math.min(1, millis * this.timeRatioDivisor);
        this.setClock = (d, white, black, delay = 0) => {
            const isClockRunning = game.playable(d) && (game.playedTurns(d) > 1 || d.clock.running), delayMs = delay * 10;
            this.times = {
                white: white * 1000,
                black: black * 1000,
                activeColor: isClockRunning ? d.game.player : undefined,
                lastUpdate: performance.now() + delayMs
            };
            if (isClockRunning)
                this.scheduleTick(this.times[d.game.player], delayMs);
        };
        this.addTime = (color, time) => {
            this.times[color] += time * 10;
        };
        this.stopClock = () => {
            const color = this.times.activeColor;
            if (color) {
                const curElapse = this.elapsed();
                this.times[color] = Math.max(0, this.times[color] - curElapse);
                this.times.activeColor = undefined;
                return curElapse;
            }
        };
        this.hardStopClock = () => this.times.activeColor = undefined;
        this.scheduleTick = (time, extraDelay) => {
            if (this.tickCallback !== undefined)
                clearTimeout(this.tickCallback);
            this.tickCallback = setTimeout(this.tick, 
            // changing the value of active node confuses the chromevox screen reader
            // so update the clock less often
            this.opts.nvui ? 1000 : time % (this.showTenths(time) ? 100 : 500) + 1 + extraDelay);
        };
        // Should only be invoked by scheduleTick.
        this.tick = () => {
            this.tickCallback = undefined;
            const color = this.times.activeColor;
            if (color === undefined)
                return;
            const now = performance.now();
            const millis = Math.max(0, this.times[color] - this.elapsed(now));
            this.scheduleTick(millis, 0);
            if (millis === 0)
                this.opts.onFlag();
            else
                clockView_1.updateElements(this, this.elements[color], millis);
            if (this.opts.soundColor === color) {
                if (this.emergSound.playable[color]) {
                    if (millis < this.emergMs && !(now < this.emergSound.next)) {
                        this.emergSound.play();
                        this.emergSound.next = now + this.emergSound.delay;
                        this.emergSound.playable[color] = false;
                    }
                }
                else if (millis > 1.5 * this.emergMs) {
                    this.emergSound.playable[color] = true;
                }
            }
        };
        this.elapsed = (now = performance.now()) => Math.max(0, now - this.times.lastUpdate);
        this.millisOf = (color) => (this.times.activeColor === color ?
            Math.max(0, this.times[color] - this.elapsed()) :
            this.times[color]);
        this.isRunning = () => this.times.activeColor !== undefined;
        const cdata = d.clock;
        if (cdata.showTenths === 0)
            this.showTenths = () => false;
        else {
            const cutoff = cdata.showTenths === 1 ? 10000 : 3600000;
            this.showTenths = (time) => time < cutoff;
        }
        this.showBar = cdata.showBar && !this.opts.nvui;
        this.barTime = 1000 * (Math.max(cdata.initial, 2) + 5 * cdata.increment);
        this.timeRatioDivisor = 1 / this.barTime;
        this.emergMs = 1000 * Math.min(60, Math.max(10, cdata.initial * .125));
        this.setClock(d, cdata.white, cdata.black);
    }
}
exports.ClockController = ClockController;

},{"./clockView":55,"game":46}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const button = require("../view/button");
const util_1 = require("../util");
const game = require("game");
function renderClock(ctrl, player, position) {
    const clock = ctrl.clock, millis = clock.millisOf(player.color), isPlayer = ctrl.data.player.color === player.color, isRunning = player.color === clock.times.activeColor;
    const update = (el) => {
        const els = clock.elements[player.color], millis = clock.millisOf(player.color), isRunning = player.color === clock.times.activeColor;
        els.time = el;
        els.clock = el.parentElement;
        el.innerHTML = formatClockTime(millis, clock.showTenths(millis), isRunning, clock.opts.nvui);
    };
    const timeHook = {
        insert: (vnode) => update(vnode.elm),
        postpatch: (_, vnode) => update(vnode.elm)
    };
    return snabbdom_1.h('div.rclock.rclock-' + position, {
        class: {
            outoftime: millis <= 0,
            running: isRunning,
            emerg: millis < clock.emergMs
        }
    }, clock.opts.nvui ? [
        snabbdom_1.h('div.time', {
            attrs: { role: 'timer' },
            hook: timeHook
        })
    ] : [
        clock.showBar && game.bothPlayersHavePlayed(ctrl.data) ? showBar(ctrl, player.color) : undefined,
        snabbdom_1.h('div.time', {
            attrs: { title: `${player.color} clock` },
            class: {
                hour: millis > 3600 * 1000
            },
            hook: timeHook
        }),
        renderBerserk(ctrl, player.color, position),
        isPlayer ? goBerserk(ctrl) : button.moretime(ctrl),
        tourRank(ctrl, player.color, position)
    ]);
}
exports.renderClock = renderClock;
function pad2(num) {
    return (num < 10 ? '0' : '') + num;
}
const sepHigh = '<sep>:</sep>';
const sepLow = '<sep class="low">:</sep>';
function formatClockTime(time, showTenths, isRunning, nvui) {
    const date = new Date(time);
    if (nvui)
        return (time >= 3600000 ? Math.floor(time / 3600000) + 'H:' : '') +
            date.getUTCMinutes() + 'M:' + date.getUTCSeconds() + 'S';
    const millis = date.getUTCMilliseconds(), sep = (isRunning && millis < 500) ? sepLow : sepHigh, baseStr = pad2(date.getUTCMinutes()) + sep + pad2(date.getUTCSeconds());
    if (time >= 3600000) {
        const hours = pad2(Math.floor(time / 3600000));
        return hours + sepHigh + baseStr;
    }
    else if (showTenths) {
        let tenthsStr = Math.floor(millis / 100).toString();
        if (!isRunning && time < 1000) {
            tenthsStr += '<huns>' + (Math.floor(millis / 10) % 10) + '</huns>';
        }
        return baseStr + '<tenths><sep>.</sep>' + tenthsStr + '</tenths>';
    }
    else {
        return baseStr;
    }
}
function showBar(ctrl, color) {
    const clock = ctrl.clock;
    const update = (el) => {
        if (el.animate !== undefined) {
            let anim = clock.elements[color].barAnim;
            if (anim === undefined || !anim.effect ||
                anim.effect.target !== el) {
                anim = el.animate([
                    { transform: 'scale(1)' },
                    { transform: 'scale(0, 1)' }
                ], {
                    duration: clock.barTime,
                    fill: "both"
                });
                clock.elements[color].barAnim = anim;
            }
            const remaining = clock.millisOf(color);
            anim.currentTime = clock.barTime - remaining;
            if (color === clock.times.activeColor) {
                // Calling play after animations finishes restarts anim
                if (remaining > 0)
                    anim.play();
            }
            else
                anim.pause();
        }
        else {
            clock.elements[color].bar = el;
            el.style.transform = "scale(" + clock.timeRatio(clock.millisOf(color)) + ",1)";
        }
    };
    return snabbdom_1.h('div.bar', {
        class: { berserk: !!ctrl.goneBerserk[color] },
        hook: {
            insert: vnode => update(vnode.elm),
            postpatch: (_, vnode) => update(vnode.elm)
        }
    });
}
function updateElements(clock, els, millis) {
    if (els.time)
        els.time.innerHTML = formatClockTime(millis, clock.showTenths(millis), true, clock.opts.nvui);
    if (els.bar)
        els.bar.style.transform = "scale(" + clock.timeRatio(millis) + ",1)";
    if (els.clock) {
        const cl = els.clock.classList;
        if (millis < clock.emergMs)
            cl.add('emerg');
        else if (cl.contains('emerg'))
            cl.remove('emerg');
    }
}
exports.updateElements = updateElements;
function showBerserk(ctrl, color) {
    return !!ctrl.goneBerserk[color] && ctrl.data.game.turns <= 1 && game.playable(ctrl.data);
}
function renderBerserk(ctrl, color, position) {
    return showBerserk(ctrl, color) ? snabbdom_1.h('div.berserked.' + position, util_1.justIcon('`')) : null;
}
function goBerserk(ctrl) {
    if (!game.berserkableBy(ctrl.data))
        return;
    if (ctrl.goneBerserk[ctrl.data.player.color])
        return;
    return snabbdom_1.h('button.fbt.go-berserk', {
        attrs: {
            title: 'GO BERSERK! Half the time, no increment, bonus point',
            'data-icon': '`'
        },
        hook: util_1.bind('click', ctrl.goBerserk)
    });
}
function tourRank(ctrl, color, position) {
    const d = ctrl.data;
    return (d.tournament && d.tournament.ranks && !showBerserk(ctrl, color)) ?
        snabbdom_1.h('div.tour-rank.' + position, {
            attrs: { title: 'Current tournament rank' }
        }, '#' + d.tournament.ranks[color]) : null;
}

},{"../util":74,"../view/button":75,"game":46,"snabbdom":24}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ctrl(root, data, onFlag) {
    const timePercentDivisor = 0.1 / data.increment;
    function timePercent(color) {
        return Math.max(0, Math.min(100, times[color] * timePercentDivisor));
    }
    let times;
    function update(white, black) {
        times = {
            white: white * 1000,
            black: black * 1000,
            lastUpdate: performance.now()
        };
    }
    ;
    update(data.white, data.black);
    function tick(color) {
        const now = performance.now();
        times[color] -= now - times.lastUpdate;
        times.lastUpdate = now;
        if (times[color] <= 0)
            onFlag();
    }
    function millisOf(color) {
        return Math.max(0, times[color]);
    }
    return {
        root,
        data,
        timePercent,
        millisOf,
        update,
        tick
    };
}
exports.ctrl = ctrl;

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const button_1 = require("../view/button");
function prefixInteger(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substr(2);
}
function bold(x) {
    return '<b>' + x + '</b>';
}
function formatClockTime(trans, time) {
    const date = new Date(time), minutes = prefixInteger(date.getUTCMinutes(), 2), seconds = prefixInteger(date.getSeconds(), 2);
    let hours, str = '';
    if (time >= 86400 * 1000) {
        // days : hours
        const days = date.getUTCDate() - 1;
        hours = date.getUTCHours();
        str += (days === 1 ? trans('oneDay') : trans.plural('nbDays', days)) + ' ';
        if (hours !== 0)
            str += trans.plural('nbHours', hours);
    }
    else if (time >= 3600 * 1000) {
        // hours : minutes
        hours = date.getUTCHours();
        str += bold(prefixInteger(hours, 2)) + ':' + bold(minutes);
    }
    else {
        // minutes : seconds
        str += bold(minutes) + ':' + bold(seconds);
    }
    return str;
}
function default_1(ctrl, trans, color, position, runningColor) {
    const millis = ctrl.millisOf(color), update = (el) => {
        el.innerHTML = formatClockTime(trans, millis);
    }, isPlayer = ctrl.root.data.player.color === color;
    return snabbdom_1.h('div.rclock.rclock-correspondence.rclock-' + position, {
        class: {
            outoftime: millis <= 0,
            running: runningColor === color
        }
    }, [
        ctrl.data.showBar ? snabbdom_1.h('div.bar', [
            snabbdom_1.h('span', {
                attrs: { style: `width: ${ctrl.timePercent(color)}%` }
            })
        ]) : null,
        snabbdom_1.h('div.time', {
            hook: {
                insert: vnode => update(vnode.elm),
                postpatch: (_, vnode) => update(vnode.elm)
            }
        }),
        isPlayer ? null : button_1.moretime(ctrl.root),
    ]);
}
exports.default = default_1;

},{"../view/button":75,"snabbdom":24}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("game/game");
const drag_1 = require("chessground/drag");
const drop_1 = require("chessground/drop");
const li = window.lichess;
exports.pieceRoles = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
function drag(ctrl, e) {
    if (e.button !== undefined && e.button !== 0)
        return; // only touch or left click
    if (ctrl.replaying() || !ctrl.isPlaying())
        return;
    const el = e.target, role = el.getAttribute('data-role'), color = el.getAttribute('data-color'), number = el.getAttribute('data-nb');
    if (!role || !color || number === '0')
        return;
    e.stopPropagation();
    e.preventDefault();
    drag_1.dragNewPiece(ctrl.chessground.state, { color, role }, e);
}
exports.drag = drag;
let dropWithKey = false;
let dropWithDrag = false;
let mouseIconsLoaded = false;
function valid(data, role, key) {
    if (exports.crazyKeys.length === 0)
        dropWithDrag = true;
    else {
        dropWithKey = true;
        if (!mouseIconsLoaded)
            preloadMouseIcons(data);
    }
    if (!game_1.isPlayerTurn(data))
        return false;
    if (role === 'pawn' && (key[1] === '1' || key[1] === '8'))
        return false;
    const dropStr = data.possibleDrops;
    if (typeof dropStr === 'undefined' || dropStr === null)
        return true;
    const drops = dropStr.match(/.{2}/g) || [];
    return drops.includes(key);
}
exports.valid = valid;
function onEnd() {
    const store = li.storage.make('crazyKeyHist');
    if (dropWithKey)
        store.set(10);
    else if (dropWithDrag) {
        const cur = parseInt(store.get());
        if (cur > 0 && cur <= 10)
            store.set(cur - 1);
        else if (cur !== 0)
            store.set(3);
    }
}
exports.onEnd = onEnd;
exports.crazyKeys = [];
function init(ctrl) {
    const k = window.Mousetrap;
    let activeCursor;
    const setDrop = () => {
        if (activeCursor)
            document.body.classList.remove(activeCursor);
        if (exports.crazyKeys.length > 0) {
            const role = exports.pieceRoles[exports.crazyKeys[exports.crazyKeys.length - 1] - 1], color = ctrl.data.player.color, crazyData = ctrl.data.crazyhouse;
            if (!crazyData)
                return;
            const nb = crazyData.pockets[color === 'white' ? 0 : 1][role];
            drop_1.setDropMode(ctrl.chessground.state, nb > 0 ? { color, role } : undefined);
            activeCursor = `cursor-${color}-${role}`;
            document.body.classList.add(activeCursor);
        }
        else {
            drop_1.cancelDropMode(ctrl.chessground.state);
            activeCursor = undefined;
        }
    };
    // This case is needed if the pocket piece becomes available while
    // the corresponding drop key is active.
    //
    // When the drop key is first pressed, the cursor will change, but
    // chessground.setDropMove(state, undefined) is called, which means
    // clicks on the board will not drop a piece.
    // If the piece becomes available, we call into chessground again.
    window.lichess.pubsub.on('ply', () => {
        if (exports.crazyKeys.length > 0)
            setDrop();
    });
    for (let i = 1; i <= 5; i++) {
        const iStr = i.toString();
        k.bind(iStr, (e) => {
            e.preventDefault();
            if (!exports.crazyKeys.includes(i)) {
                exports.crazyKeys.push(i);
                setDrop();
            }
        });
        k.bind(iStr, (e) => {
            e.preventDefault();
            const idx = exports.crazyKeys.indexOf(i);
            if (idx >= 0) {
                exports.crazyKeys.splice(idx, 1);
                if (idx === exports.crazyKeys.length) {
                    setDrop();
                }
            }
        }, 'keyup');
    }
    const resetKeys = () => {
        if (exports.crazyKeys.length > 0) {
            exports.crazyKeys.length = 0;
            setDrop();
        }
    };
    window.addEventListener('blur', resetKeys);
    // Handle focus on input bars – these will hide keyup events
    window.addEventListener('focus', (e) => {
        if (e.target && e.target.localName === 'input')
            resetKeys();
    }, { capture: true });
    if (li.storage.get('crazyKeyHist') !== '0')
        preloadMouseIcons(ctrl.data);
}
exports.init = init;
// zh keys has unacceptable jank when cursors need to dl,
// so preload when the feature might be used.
// Images are used in _zh.scss, which should be kept in sync.
function preloadMouseIcons(data) {
    const colorKey = data.player.color === 'white' ? 'w' : 'b';
    if (window.fetch !== undefined) {
        for (const pKey of 'PNBRQ') {
            fetch(li.assetUrl(`piece/cburnett/${colorKey}${pKey}.svg`));
        }
    }
    mouseIconsLoaded = true;
}

},{"chessground/drag":6,"chessground/drop":8,"game/game":46}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const round = require("../round");
const crazyCtrl_1 = require("./crazyCtrl");
const util_1 = require("../util");
const eventNames = ['mousedown', 'touchstart'];
function pocket(ctrl, color, position) {
    const step = round.plyStep(ctrl.data, ctrl.ply);
    if (!step.crazy)
        return;
    const droppedRole = ctrl.justDropped, preDropRole = ctrl.preDrop, pocket = step.crazy.pockets[color === 'white' ? 0 : 1], usablePos = position === (ctrl.flip ? 'top' : 'bottom'), usable = usablePos && !ctrl.replaying() && ctrl.isPlaying(), activeColor = color === ctrl.data.player.color;
    const capturedPiece = ctrl.justCaptured;
    const captured = capturedPiece && (capturedPiece['promoted'] ? 'pawn' : capturedPiece.role);
    return snabbdom_1.h('div.pocket.is2d.pocket-' + position, {
        class: { usable },
        hook: util_1.onInsert(el => eventNames.forEach(name => el.addEventListener(name, (e) => {
            if (position === (ctrl.flip ? 'top' : 'bottom') && crazyCtrl_1.crazyKeys.length == 0)
                crazyCtrl_1.drag(ctrl, e);
        })))
    }, crazyCtrl_1.pieceRoles.map(role => {
        let nb = pocket[role] || 0;
        if (activeColor) {
            if (droppedRole === role)
                nb--;
            if (captured === role)
                nb++;
        }
        return snabbdom_1.h('div.pocket-c1', snabbdom_1.h('div.pocket-c2', snabbdom_1.h('piece.' + role + '.' + color, {
            class: { premove: activeColor && preDropRole === role },
            attrs: {
                'data-role': role,
                'data-color': color,
                'data-nb': nb,
            }
        })));
    }));
}
exports.default = pocket;

},{"../round":67,"../util":74,"./crazyCtrl":58,"snabbdom":24}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const round = require("./round");
const game = require("game");
const status = require("game/status");
const ground = require("./ground");
const notification_1 = require("common/notification");
const socket_1 = require("./socket");
const title = require("./title");
const promotion = require("./promotion");
const blur = require("./blur");
const speech = require("./speech");
const clockCtrl_1 = require("./clock/clockCtrl");
const corresClockCtrl_1 = require("./corresClock/corresClockCtrl");
const moveOn_1 = require("./moveOn");
const transientMove_1 = require("./transientMove");
const atomic = require("./atomic");
const sound = require("./sound");
const util = require("./util");
const xhr = require("./xhr");
const crazyCtrl_1 = require("./crazy/crazyCtrl");
const keyboardMove_1 = require("./keyboardMove");
const renderUser = require("./view/user");
const cevalSub = require("./cevalSub");
const keyboard = require("./keyboard");
const li = window.lichess;
class RoundController {
    constructor(opts, redraw) {
        this.opts = opts;
        this.redraw = redraw;
        this.firstSeconds = true;
        this.flip = false;
        this.loading = false;
        this.redirecting = false;
        this.goneBerserk = {};
        this.resignConfirm = undefined;
        this.drawConfirm = undefined;
        // will be replaced by view layer
        this.autoScroll = $.noop;
        this.challengeRematched = false;
        this.shouldSendMoveTime = false;
        this.showExpiration = () => {
            if (!this.data.expiration)
                return;
            this.redraw();
            setTimeout(this.showExpiration, 250);
        };
        this.onUserMove = (orig, dest, meta) => {
            if (li.ab && (!this.keyboardMove || !this.keyboardMove.usedSan))
                li.ab.move(this, meta);
            if (!promotion.start(this, orig, dest, meta))
                this.sendMove(orig, dest, undefined, meta);
        };
        this.onUserNewPiece = (role, key, meta) => {
            if (!this.replaying() && crazyCtrl_1.valid(this.data, role, key)) {
                this.sendNewPiece(role, key, !!meta.predrop);
            }
            else
                this.jump(this.ply);
        };
        this.onMove = (_, dest, captured) => {
            if (captured) {
                if (this.data.game.variant.key === 'atomic') {
                    sound.explode();
                    atomic.capture(this, dest);
                }
                else
                    sound.capture();
            }
            else
                sound.move();
        };
        this.onPremove = (orig, dest, meta) => {
            promotion.start(this, orig, dest, meta);
        };
        this.onCancelPremove = () => {
            promotion.cancelPrePromotion(this);
        };
        this.onPredrop = (role, _) => {
            this.preDrop = role;
            this.redraw();
        };
        this.isSimulHost = () => {
            return this.data.simul && this.data.simul.hostId === this.opts.userId;
        };
        this.makeCgHooks = () => ({
            onUserMove: this.onUserMove,
            onUserNewPiece: this.onUserNewPiece,
            onMove: this.onMove,
            onNewPiece: sound.move,
            onPremove: this.onPremove,
            onCancelPremove: this.onCancelPremove,
            onPredrop: this.onPredrop
        });
        this.replaying = () => this.ply !== round.lastPly(this.data);
        this.userJump = (ply) => {
            this.cancelMove();
            this.chessground.selectSquare(null);
            if (ply != this.ply && this.jump(ply))
                speech.userJump(this, this.ply);
            else
                this.redraw();
        };
        this.isPlaying = () => game.isPlayerPlaying(this.data);
        this.jump = (ply) => {
            ply = Math.max(round.firstPly(this.data), Math.min(round.lastPly(this.data), ply));
            const isForwardStep = ply === this.ply + 1;
            this.ply = ply;
            this.justDropped = undefined;
            this.preDrop = undefined;
            const s = this.stepAt(ply), config = {
                fen: s.fen,
                lastMove: util.uci2move(s.uci),
                check: !!s.check,
                turnColor: this.ply % 2 === 0 ? 'white' : 'black'
            };
            if (this.replaying())
                this.chessground.stop();
            else
                config.movable = {
                    color: this.isPlaying() ? this.data.player.color : undefined,
                    dests: util.parsePossibleMoves(this.data.possibleMoves)
                };
            this.chessground.set(config);
            if (s.san && isForwardStep) {
                if (s.san.includes('x'))
                    sound.capture();
                else
                    sound.move();
                if (/[+#]/.test(s.san))
                    sound.check();
            }
            this.autoScroll();
            if (this.keyboardMove)
                this.keyboardMove.update(s);
            li.pubsub.emit('ply', ply);
            return true;
        };
        this.replayEnabledByPref = () => {
            const d = this.data;
            return d.pref.replay === 2 || (d.pref.replay === 1 && (d.game.speed === 'classical' || d.game.speed === 'unlimited' || d.game.speed === 'correspondence'));
        };
        this.isLate = () => this.replaying() && status.playing(this.data);
        this.playerAt = (position) => this.flip ^ (position === 'top') ? this.data.opponent : this.data.player;
        this.flipNow = () => {
            this.flip = !this.nvui && !this.flip;
            this.chessground.set({
                orientation: ground.boardOrientation(this.data, this.flip)
            });
            this.redraw();
        };
        this.setTitle = () => title.set(this);
        this.actualSendMove = (tpe, data, meta = {}) => {
            const socketOpts = {
                ackable: true
            };
            if (this.clock) {
                socketOpts.withLag = !this.shouldSendMoveTime || !this.clock.isRunning;
                if (meta.premove && this.shouldSendMoveTime) {
                    this.clock.hardStopClock();
                    socketOpts.millis = 0;
                }
                else {
                    const moveMillis = this.clock.stopClock();
                    if (moveMillis !== undefined && this.shouldSendMoveTime) {
                        socketOpts.millis = moveMillis;
                    }
                }
            }
            this.socket.send(tpe, data, socketOpts);
            this.justDropped = meta.justDropped;
            this.justCaptured = meta.justCaptured;
            this.preDrop = undefined;
            this.transientMove.register();
            this.redraw();
        };
        this.sendMove = (orig, dest, prom, meta) => {
            const move = {
                u: orig + dest
            };
            if (prom)
                move.u += (prom === 'knight' ? 'n' : prom[0]);
            if (blur.get())
                move.b = 1;
            this.resign(false);
            if (this.data.pref.submitMove && !meta.premove) {
                this.moveToSubmit = move;
                this.redraw();
            }
            else {
                this.actualSendMove('move', move, {
                    justCaptured: meta.captured,
                    premove: meta.premove
                });
            }
        };
        this.sendNewPiece = (role, key, isPredrop) => {
            const drop = {
                role: role,
                pos: key
            };
            if (blur.get())
                drop.b = 1;
            this.resign(false);
            if (this.data.pref.submitMove && !isPredrop) {
                this.dropToSubmit = drop;
                this.redraw();
            }
            else {
                this.actualSendMove('drop', drop, {
                    justDropped: role,
                    premove: isPredrop
                });
            }
        };
        this.showYourMoveNotification = () => {
            const d = this.data;
            if (game.isPlayerTurn(d))
                notification_1.default(() => {
                    let txt = this.trans('yourTurn'), opponent = renderUser.userTxt(this, d.opponent);
                    if (this.ply < 1)
                        txt = opponent + '\njoined the game.\n' + txt;
                    else {
                        let move = d.steps[d.steps.length - 1].san, turn = Math.floor((this.ply - 1) / 2) + 1;
                        move = turn + (this.ply % 2 === 1 ? '.' : '...') + ' ' + move;
                        txt = opponent + '\nplayed ' + move + '.\n' + txt;
                    }
                    return txt;
                });
            else if (this.isPlaying() && this.ply < 1)
                notification_1.default(() => {
                    return renderUser.userTxt(this, d.opponent) + '\njoined the game.';
                });
        };
        this.playerByColor = (c) => this.data[c === this.data.player.color ? 'player' : 'opponent'];
        this.apiMove = (o) => {
            const d = this.data, playing = this.isPlaying();
            d.game.turns = o.ply;
            d.game.player = o.ply % 2 === 0 ? 'white' : 'black';
            const playedColor = o.ply % 2 === 0 ? 'black' : 'white', activeColor = d.player.color === d.game.player;
            if (o.status)
                d.game.status = o.status;
            if (o.winner)
                d.game.winner = o.winner;
            this.playerByColor('white').offeringDraw = o.wDraw;
            this.playerByColor('black').offeringDraw = o.bDraw;
            d.possibleMoves = activeColor ? o.dests : undefined;
            d.possibleDrops = activeColor ? o.drops : undefined;
            d.crazyhouse = o.crazyhouse;
            this.setTitle();
            if (!this.replaying()) {
                this.ply++;
                if (o.role)
                    this.chessground.newPiece({
                        role: o.role,
                        color: playedColor
                    }, o.uci.substr(2, 2));
                else {
                    const keys = util.uci2move(o.uci);
                    this.chessground.move(keys[0], keys[1]);
                }
                if (o.enpassant) {
                    const p = o.enpassant, pieces = {};
                    pieces[p.key] = undefined;
                    this.chessground.setPieces(pieces);
                    if (d.game.variant.key === 'atomic') {
                        atomic.enpassant(this, p.key, p.color);
                        sound.explode();
                    }
                    else
                        sound.capture();
                }
                if (o.promotion)
                    ground.promote(this.chessground, o.promotion.key, o.promotion.pieceClass);
                if (o.castle && !this.chessground.state.autoCastle) {
                    const c = o.castle, pieces = {};
                    pieces[c.king[0]] = undefined;
                    pieces[c.rook[0]] = undefined;
                    pieces[c.king[1]] = {
                        role: 'king',
                        color: c.color
                    };
                    pieces[c.rook[1]] = {
                        role: 'rook',
                        color: c.color
                    };
                    this.chessground.setPieces(pieces);
                }
                this.chessground.set({
                    turnColor: d.game.player,
                    movable: {
                        dests: playing ? util.parsePossibleMoves(d.possibleMoves) : {}
                    },
                    check: !!o.check
                });
                if (o.check)
                    sound.check();
                blur.onMove();
                li.pubsub.emit('ply', this.ply);
            }
            d.game.threefold = !!o.threefold;
            const step = {
                ply: round.lastPly(this.data) + 1,
                fen: o.fen,
                san: o.san,
                uci: o.uci,
                check: o.check,
                crazy: o.crazyhouse
            };
            d.steps.push(step);
            this.justDropped = undefined;
            this.justCaptured = undefined;
            game.setOnGame(d, playedColor, true);
            this.data.forecastCount = undefined;
            if (o.clock) {
                this.shouldSendMoveTime = true;
                const oc = o.clock, delay = (playing && activeColor) ? 0 : (oc.lag || 1);
                if (this.clock)
                    this.clock.setClock(d, oc.white, oc.black, delay);
                else if (this.corresClock)
                    this.corresClock.update(oc.white, oc.black);
            }
            if (this.data.expiration) {
                if (this.data.steps.length > 2)
                    this.data.expiration = undefined;
                else
                    this.data.expiration.movedAt = Date.now();
            }
            this.redraw();
            if (playing && playedColor == d.player.color) {
                this.transientMove.clear();
                this.moveOn.next();
                cevalSub.publish(d, o);
            }
            if (!this.replaying() && playedColor != d.player.color) {
                // atrocious hack to prevent race condition
                // with explosions and premoves
                // https://github.com/ornicar/lila/issues/343
                const premoveDelay = d.game.variant.key === 'atomic' ? 100 : 1;
                setTimeout(() => {
                    if (!this.chessground.playPremove() && !this.playPredrop()) {
                        promotion.cancel(this);
                        this.showYourMoveNotification();
                    }
                }, premoveDelay);
            }
            this.autoScroll();
            this.onChange();
            if (this.keyboardMove)
                this.keyboardMove.update(step, playedColor != d.player.color);
            if (this.music)
                this.music.jump(o);
            speech.step(step);
        };
        this.playPredrop = () => {
            return this.chessground.playPredrop(drop => {
                return crazyCtrl_1.valid(this.data, drop.role, drop.key);
            });
        };
        this.reload = (d) => {
            if (d.steps.length !== this.data.steps.length)
                this.ply = d.steps[d.steps.length - 1].ply;
            round.massage(d);
            this.data = d;
            this.clearJust();
            this.shouldSendMoveTime = false;
            if (this.clock)
                this.clock.setClock(d, d.clock.white, d.clock.black);
            if (this.corresClock)
                this.corresClock.update(d.correspondence.white, d.correspondence.black);
            if (!this.replaying())
                ground.reload(this);
            this.setTitle();
            this.moveOn.next();
            this.setQuietMode();
            this.redraw();
            this.autoScroll();
            this.onChange();
            this.setLoading(false);
            if (this.keyboardMove)
                this.keyboardMove.update(d.steps[d.steps.length - 1]);
        };
        this.endWithData = (o) => {
            const d = this.data;
            d.game.winner = o.winner;
            d.game.status = o.status;
            d.game.boosted = o.boosted;
            this.userJump(round.lastPly(d));
            this.chessground.stop();
            if (o.ratingDiff) {
                d.player.ratingDiff = o.ratingDiff[d.player.color];
                d.opponent.ratingDiff = o.ratingDiff[d.opponent.color];
            }
            if (!d.player.spectator && d.game.turns > 1)
                li.sound[o.winner ? (d.player.color === o.winner ? 'victory' : 'defeat') : 'draw']();
            if (d.crazyhouse)
                crazyCtrl_1.onEnd();
            this.clearJust();
            this.setTitle();
            this.moveOn.next();
            this.setQuietMode();
            this.setLoading(false);
            if (this.clock && o.clock)
                this.clock.setClock(d, o.clock.wc * .01, o.clock.bc * .01);
            this.redraw();
            this.autoScroll();
            this.onChange();
            if (d.tv)
                setTimeout(li.reload, 10000);
            speech.status(this);
        };
        this.challengeRematch = () => {
            this.challengeRematched = true;
            xhr.challengeRematch(this.data.game.id).then(() => {
                li.challengeApp.open();
                if (li.once('rematch-challenge'))
                    setTimeout(() => {
                        li.hopscotch(function () {
                            window.hopscotch.configure({
                                i18n: { doneBtn: 'OK, got it' }
                            }).startTour({
                                id: "rematch-challenge",
                                showPrevButton: true,
                                steps: [{
                                        title: "Challenged to a rematch",
                                        content: 'Your opponent is offline, but they can accept this challenge later!',
                                        target: "#challenge-app",
                                        placement: "bottom"
                                    }]
                            });
                        });
                    }, 1000);
            }, _ => {
                this.challengeRematched = false;
            });
        };
        this.makeCorrespondenceClock = () => {
            if (this.data.correspondence && !this.corresClock)
                this.corresClock = corresClockCtrl_1.ctrl(this, this.data.correspondence, this.socket.outoftime);
        };
        this.corresClockTick = () => {
            if (this.corresClock && game.playable(this.data))
                this.corresClock.tick(this.data.game.player);
        };
        this.setQuietMode = () => {
            const was = li.quietMode;
            const is = this.isPlaying();
            if (was !== is) {
                li.quietMode = is;
                $('body')
                    .toggleClass('playing', is)
                    .toggleClass('no-select', is && this.clock && this.clock.millisOf(this.data.player.color) <= 3e5);
            }
        };
        this.takebackYes = () => {
            this.socket.sendLoading('takeback-yes');
            this.chessground.cancelPremove();
            promotion.cancel(this);
        };
        this.resign = (v) => {
            if (v) {
                if (this.resignConfirm || !this.data.pref.confirmResign) {
                    this.socket.sendLoading('resign');
                    clearTimeout(this.resignConfirm);
                }
                else {
                    this.resignConfirm = setTimeout(() => this.resign(false), 3000);
                }
                this.redraw();
            }
            else if (this.resignConfirm) {
                clearTimeout(this.resignConfirm);
                this.resignConfirm = undefined;
                this.redraw();
            }
        };
        this.goBerserk = () => {
            this.socket.berserk();
            li.sound.berserk();
        };
        this.setBerserk = (color) => {
            if (this.goneBerserk[color])
                return;
            this.goneBerserk[color] = true;
            if (color !== this.data.player.color)
                li.sound.berserk();
            this.redraw();
        };
        this.setLoading = (v, duration = 1500) => {
            clearTimeout(this.loadingTimeout);
            if (v) {
                this.loading = true;
                this.loadingTimeout = setTimeout(() => {
                    this.loading = false;
                    this.redraw();
                }, duration);
                this.redraw();
            }
            else if (this.loading) {
                this.loading = false;
                this.redraw();
            }
        };
        this.setRedirecting = () => {
            this.redirecting = true;
            setTimeout(() => {
                this.redirecting = false;
                this.redraw();
            }, 2500);
            this.redraw();
        };
        this.submitMove = (v) => {
            const toSubmit = this.moveToSubmit || this.dropToSubmit;
            if (v && toSubmit) {
                if (this.moveToSubmit)
                    this.actualSendMove('move', this.moveToSubmit);
                else
                    this.actualSendMove('drop', this.dropToSubmit);
                li.sound.confirmation();
            }
            else
                this.jump(this.ply);
            this.cancelMove();
            if (toSubmit)
                this.setLoading(true, 300);
        };
        this.cancelMove = () => {
            this.moveToSubmit = undefined;
            this.dropToSubmit = undefined;
        };
        this.onChange = () => {
            if (this.opts.onChange)
                setTimeout(() => this.opts.onChange(this.data), 150);
        };
        this.setGone = (gone) => {
            game.setGone(this.data, this.data.opponent.color, gone);
            clearTimeout(this.goneTick);
            if (Number(gone) > 1)
                this.goneTick = setTimeout(() => {
                    const g = Number(this.opponentGone());
                    if (g > 1)
                        this.setGone(g - 1);
                }, 1000);
            this.redraw();
        };
        this.opponentGone = () => {
            const d = this.data;
            return d.opponent.gone !== false &&
                !game.isPlayerTurn(d) &&
                game.resignable(d) &&
                d.opponent.gone;
        };
        this.canOfferDraw = () => game.drawable(this.data) && (this.lastDrawOfferAtPly || -99) < (this.ply - 20);
        this.offerDraw = (v) => {
            if (this.canOfferDraw()) {
                if (this.drawConfirm) {
                    if (v)
                        this.doOfferDraw();
                    clearTimeout(this.drawConfirm);
                    this.drawConfirm = undefined;
                }
                else if (v) {
                    if (this.data.pref.confirmResign)
                        this.drawConfirm = setTimeout(() => {
                            this.offerDraw(false);
                        }, 3000);
                    else
                        this.doOfferDraw();
                }
            }
            this.redraw();
        };
        this.doOfferDraw = () => {
            this.lastDrawOfferAtPly = this.ply;
            this.socket.sendLoading('draw-yes', null);
        };
        this.setChessground = (cg) => {
            this.chessground = cg;
            if (this.data.pref.keyboardMove) {
                this.keyboardMove = keyboardMove_1.ctrl(this, this.stepAt(this.ply), this.redraw);
                li.raf(this.redraw);
            }
        };
        this.stepAt = (ply) => round.plyStep(this.data, ply);
        this.delayedInit = () => {
            const d = this.data;
            if (this.isPlaying() && game.nbMoves(d, d.player.color) === 0 && !this.isSimulHost()) {
                li.sound.genericNotify();
            }
            li.requestIdleCallback(() => {
                if (this.isPlaying()) {
                    if (!d.simul)
                        blur.init(d.steps.length > 2);
                    title.init();
                    this.setTitle();
                    if (d.crazyhouse)
                        crazyCtrl_1.init(this);
                    window.addEventListener('beforeunload', e => {
                        if (li.hasToReload ||
                            this.nvui ||
                            !game.playable(d) ||
                            !d.clock ||
                            d.opponent.ai ||
                            this.isSimulHost())
                            return;
                        this.socket.send('bye2');
                        const msg = 'There is a game in progress!';
                        (e || window.event).returnValue = msg;
                        return msg;
                    });
                    if (!this.nvui && d.pref.submitMove) {
                        window.Mousetrap.bind('esc', () => {
                            this.submitMove(false);
                            this.chessground.cancelMove();
                        });
                        window.Mousetrap.bind('return', () => this.submitMove(true));
                    }
                    cevalSub.subscribe(this);
                }
                if (!this.nvui)
                    keyboard.init(this);
                speech.setup(this);
                this.onChange();
            });
        };
        round.massage(opts.data);
        const d = this.data = opts.data;
        this.ply = round.lastPly(d);
        this.goneBerserk[d.player.color] = d.player.berserk;
        this.goneBerserk[d.opponent.color] = d.opponent.berserk;
        setTimeout(() => { this.firstSeconds = false; this.redraw(); }, 3000);
        this.socket = socket_1.make(opts.socketSend, this);
        if (li.RoundNVUI)
            this.nvui = li.RoundNVUI(redraw);
        if (d.clock)
            this.clock = new clockCtrl_1.ClockController(d, {
                onFlag: this.socket.outoftime,
                soundColor: (d.simul || d.player.spectator || !d.pref.clockSound) ? undefined : d.player.color,
                nvui: !!this.nvui
            });
        else {
            this.makeCorrespondenceClock();
            setInterval(this.corresClockTick, 1000);
        }
        this.setQuietMode();
        this.moveOn = new moveOn_1.default(this, 'move-on');
        this.transientMove = new transientMove_1.default(this.socket);
        this.trans = li.trans(opts.i18n);
        this.noarg = this.trans.noarg;
        setTimeout(this.delayedInit, 200);
        setTimeout(this.showExpiration, 350);
        if (!document.referrer || document.referrer.indexOf('/service-worker.js') === -1)
            setTimeout(this.showYourMoveNotification, 500);
        // at the end:
        li.pubsub.on('jump', ply => { this.jump(parseInt(ply)); this.redraw(); });
        li.pubsub.on('sound_set', set => {
            if (!this.music && set === 'music')
                li.loadScript('javascripts/music/play.js').then(() => {
                    this.music = li.playMusic();
                });
            if (this.music && set !== 'music')
                this.music = undefined;
        });
        li.pubsub.on('zen', () => {
            if (this.isPlaying()) {
                const zen = !$('body').hasClass('zen');
                $('body').toggleClass('zen', zen);
                li.dispatchEvent(window, 'resize');
                $.post('/pref/zen', { zen: zen ? 1 : 0 });
            }
        });
        if (li.ab && this.isPlaying())
            li.ab.init(this);
    }
    clearJust() {
        this.justDropped = undefined;
        this.justCaptured = undefined;
        this.preDrop = undefined;
    }
}
exports.default = RoundController;

},{"./atomic":50,"./blur":51,"./cevalSub":53,"./clock/clockCtrl":54,"./corresClock/corresClockCtrl":56,"./crazy/crazyCtrl":58,"./ground":61,"./keyboard":62,"./keyboardMove":63,"./moveOn":65,"./promotion":66,"./round":67,"./socket":68,"./sound":69,"./speech":70,"./title":71,"./transientMove":73,"./util":74,"./view/user":81,"./xhr":82,"common/notification":43,"game":46,"game/status":48}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const chessground_1 = require("chessground");
const resize_1 = require("common/resize");
const util = require("./util");
const round_1 = require("./round");
function makeConfig(ctrl) {
    const data = ctrl.data, hooks = ctrl.makeCgHooks(), step = round_1.plyStep(data, ctrl.ply), playing = ctrl.isPlaying();
    return {
        fen: step.fen,
        orientation: boardOrientation(data, ctrl.flip),
        turnColor: step.ply % 2 === 0 ? 'white' : 'black',
        lastMove: util.uci2move(step.uci),
        check: !!step.check,
        coordinates: data.pref.coords !== 0,
        addPieceZIndex: ctrl.data.pref.is3d,
        autoCastle: data.game.variant.key === 'standard',
        highlight: {
            lastMove: data.pref.highlight,
            check: data.pref.highlight
        },
        events: {
            move: hooks.onMove,
            dropNewPiece: hooks.onNewPiece,
            insert(elements) {
                resize_1.default(elements, ctrl.data.pref.resizeHandle, ctrl.ply);
            }
        },
        movable: {
            free: false,
            color: playing ? data.player.color : undefined,
            dests: playing ? util.parsePossibleMoves(data.possibleMoves) : {},
            showDests: data.pref.destination,
            rookCastle: data.pref.rookCastle,
            events: {
                after: hooks.onUserMove,
                afterNewPiece: hooks.onUserNewPiece
            }
        },
        animation: {
            enabled: true,
            duration: data.pref.animationDuration
        },
        premovable: {
            enabled: data.pref.enablePremove,
            showDests: data.pref.destination,
            castle: data.game.variant.key !== 'antichess',
            events: {
                set: hooks.onPremove,
                unset: hooks.onCancelPremove
            }
        },
        predroppable: {
            enabled: data.pref.enablePremove && data.game.variant.key === 'crazyhouse',
            events: {
                set: hooks.onPredrop,
                unset() { hooks.onPredrop(undefined); }
            }
        },
        draggable: {
            enabled: data.pref.moveEvent > 0,
            showGhost: data.pref.highlight
        },
        selectable: {
            enabled: data.pref.moveEvent !== 1
        },
        drawable: {
            enabled: true
        },
        disableContextMenu: true
    };
}
exports.makeConfig = makeConfig;
function reload(ctrl) {
    ctrl.chessground.set(makeConfig(ctrl));
}
exports.reload = reload;
function promote(ground, key, role) {
    const piece = ground.state.pieces[key];
    if (piece && piece.role === 'pawn') {
        const pieces = {};
        pieces[key] = {
            color: piece.color,
            role,
            promoted: true
        };
        ground.setPieces(pieces);
    }
}
exports.promote = promote;
function boardOrientation(data, flip) {
    if (data.game.variant.key === 'racingKings')
        return flip ? 'black' : 'white';
    else
        return flip ? data.opponent.color : data.player.color;
}
exports.boardOrientation = boardOrientation;
function render(ctrl) {
    return snabbdom_1.h('div.cg-wrap', {
        hook: util.onInsert(el => ctrl.setChessground(chessground_1.Chessground(el, makeConfig(ctrl))))
    });
}
exports.render = render;
;

},{"./round":67,"./util":74,"chessground":4,"common/resize":44,"snabbdom":24}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const preventing = (f) => (e) => {
    e.preventDefault();
    f();
};
function prev(ctrl) {
    ctrl.userJump(ctrl.ply - 1);
}
exports.prev = prev;
function next(ctrl) {
    ctrl.userJump(ctrl.ply + 1);
}
exports.next = next;
function init(ctrl) {
    const k = window.Mousetrap;
    k.bind(['left', 'h'], preventing(function () {
        prev(ctrl);
        ctrl.redraw();
    }));
    k.bind(['right', 'l'], preventing(function () {
        next(ctrl);
        ctrl.redraw();
    }));
    k.bind(['up', 'k'], preventing(function () {
        ctrl.userJump(0);
        ctrl.redraw();
    }));
    k.bind(['down', 'j'], preventing(function () {
        ctrl.userJump(ctrl.data.steps.length - 1);
        ctrl.redraw();
    }));
    k.bind('f', preventing(ctrl.flipNow));
    k.bind('z', preventing(() => window.lichess.pubsub.emit('zen')));
}
exports.init = init;

},{}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const chess_1 = require("chess");
const crazyCtrl_1 = require("./crazy/crazyCtrl");
const promotion_1 = require("./promotion");
const util_1 = require("./util");
function ctrl(root, step, redraw) {
    let focus = false;
    let handler;
    let preHandlerBuffer = step.fen;
    let lastSelect = Date.now();
    const cgState = root.chessground.state;
    const sanMap = chess_1.sanToRole;
    const select = function (key) {
        if (cgState.selected === key)
            root.chessground.cancelMove();
        else {
            root.chessground.selectSquare(key, true);
            lastSelect = Date.now();
        }
    };
    let usedSan = false;
    return {
        drop(key, piece) {
            const role = sanMap[piece];
            const crazyData = root.data.crazyhouse;
            const color = root.data.player.color;
            // Square occupied
            if (!role || !crazyData || cgState.pieces[key])
                return;
            // Piece not in Pocket
            if (!crazyData.pockets[color === 'white' ? 0 : 1][role])
                return;
            if (!crazyCtrl_1.valid(root.data, role, key))
                return;
            root.chessground.cancelMove();
            root.chessground.newPiece({ role, color }, key);
            root.sendNewPiece(role, key, false);
        },
        promote(orig, dest, piece) {
            const role = sanMap[piece];
            if (!role || role == 'pawn')
                return;
            root.chessground.cancelMove();
            promotion_1.sendPromotion(root, orig, dest, role, { premove: false });
        },
        update(step, yourMove = false) {
            if (handler)
                handler(step.fen, cgState.movable.dests, yourMove);
            else
                preHandlerBuffer = step.fen;
        },
        registerHandler(h) {
            handler = h;
            if (preHandlerBuffer)
                handler(preHandlerBuffer, cgState.movable.dests);
        },
        hasFocus: () => focus,
        setFocus(v) {
            focus = v;
            redraw();
        },
        san(orig, dest) {
            usedSan = true;
            root.chessground.cancelMove();
            select(orig);
            select(dest);
        },
        select,
        hasSelected: () => cgState.selected,
        confirmMove() {
            root.submitMove(true);
        },
        usedSan,
        jump(delta) {
            root.userJump(root.ply + delta);
            redraw();
        },
        justSelected() {
            return Date.now() - lastSelect < 500;
        },
        clock: () => root.clock
    };
}
exports.ctrl = ctrl;
function render(ctrl) {
    return snabbdom_1.h('div.keyboard-move', [
        snabbdom_1.h('input', {
            attrs: {
                spellcheck: false,
                autocomplete: false
            },
            hook: util_1.onInsert(el => {
                window.lichess.loadScript('compiled/lichess.round.keyboardMove.min.js').then(() => {
                    ctrl.registerHandler(window.lichess.keyboardMove({
                        input: el,
                        ctrl
                    }));
                });
            })
        }),
        ctrl.hasFocus() ?
            snabbdom_1.h('em', 'Enter SAN (Nc3) or UCI (b1c3) moves, or type / to focus chat') :
            snabbdom_1.h('strong', 'Press <enter> to focus')
    ]);
}
exports.render = render;

},{"./crazy/crazyCtrl":58,"./promotion":66,"./util":74,"chess":38,"snabbdom":24}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chessground_1 = require("chessground");
const snabbdom_1 = require("snabbdom");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const ctrl_1 = require("./ctrl");
const main_1 = require("./view/main");
const chat = require("chat");
const boot_1 = require("./boot");
exports.boot = boot_1.default;
const menuHover_1 = require("common/menuHover");
function app(opts) {
    const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
    let vnode, ctrl;
    function redraw() {
        vnode = patch(vnode, main_1.main(ctrl));
    }
    ctrl = new ctrl_1.default(opts, redraw);
    const blueprint = main_1.main(ctrl);
    opts.element.innerHTML = '';
    vnode = patch(opts.element, blueprint);
    window.addEventListener('resize', redraw); // col1 / col2+ transition
    ctrl.isPlaying() && menuHover_1.menuHover();
    return {
        socketReceive: ctrl.socket.receive,
        moveOn: ctrl.moveOn
    };
}
exports.app = app;
;
window.LichessChat = chat;
// that's for the rest of lichess to access chessground
// without having to include it a second time
window.Chessground = chessground_1.Chessground;

},{"./boot":52,"./ctrl":60,"./view/main":78,"chat":30,"chessground":4,"common/menuHover":42,"snabbdom":24,"snabbdom/modules/attributes":22,"snabbdom/modules/class":23}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game = require("game");
const xhr = require("./xhr");
class MoveOn {
    constructor(ctrl, key) {
        this.ctrl = ctrl;
        this.key = key;
        this.storage = window.lichess.storage.makeBoolean(this.key);
        this.toggle = () => {
            this.storage.toggle();
            this.next(true);
        };
        this.get = this.storage.get;
        this.redirect = (href) => {
            this.ctrl.setRedirecting();
            window.lichess.hasToReload = true;
            window.location.href = href;
        };
        this.next = (force) => {
            const d = this.ctrl.data;
            if (d.player.spectator || !game.isSwitchable(d) || game.isPlayerTurn(d) || !this.get())
                return;
            if (force)
                this.redirect('/round-next/' + d.game.id);
            else if (d.simul) {
                if (d.simul.hostId === this.ctrl.opts.userId && d.simul.nbPlaying > 1)
                    this.redirect('/round-next/' + d.game.id);
            }
            else
                xhr.whatsNext(this.ctrl).then(data => {
                    if (data.next)
                        this.redirect('/' + data.next);
                });
        };
    }
}
exports.default = MoveOn;

},{"./xhr":82,"game":46}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const ground = require("./ground");
const xhr = require("./xhr");
const util_1 = require("chessground/util");
const util_2 = require("./util");
const util_3 = require("./util");
let promoting;
let prePromotionRole;
function sendPromotion(ctrl, orig, dest, role, meta) {
    ground.promote(ctrl.chessground, dest, role);
    ctrl.sendMove(orig, dest, role, meta);
    return true;
}
exports.sendPromotion = sendPromotion;
function start(ctrl, orig, dest, meta = {}) {
    const d = ctrl.data, piece = ctrl.chessground.state.pieces[dest], premovePiece = ctrl.chessground.state.pieces[orig];
    if (((piece && piece.role === 'pawn' && !premovePiece) || (premovePiece && premovePiece.role === 'pawn')) && ((dest[1] === '8' && d.player.color === 'white') ||
        (dest[1] === '1' && d.player.color === 'black'))) {
        if (prePromotionRole && meta && meta.premove)
            return sendPromotion(ctrl, orig, dest, prePromotionRole, meta);
        if (!meta.ctrlKey && !promoting && (d.pref.autoQueen === 3 ||
            (d.pref.autoQueen === 2 && premovePiece) ||
            (ctrl.keyboardMove && ctrl.keyboardMove.justSelected()))) {
            if (premovePiece)
                setPrePromotion(ctrl, dest, 'queen');
            else
                sendPromotion(ctrl, orig, dest, 'queen', meta);
            return true;
        }
        promoting = {
            move: [orig, dest],
            pre: !!premovePiece,
            meta
        };
        ctrl.redraw();
        return true;
    }
    return false;
}
exports.start = start;
function setPrePromotion(ctrl, dest, role) {
    prePromotionRole = role;
    ctrl.chessground.setAutoShapes([{
            orig: dest,
            piece: {
                color: ctrl.data.player.color,
                role,
                opacity: 0.8
            },
            brush: ''
        }]);
}
function cancelPrePromotion(ctrl) {
    if (prePromotionRole) {
        ctrl.chessground.setAutoShapes([]);
        prePromotionRole = undefined;
        ctrl.redraw();
    }
}
exports.cancelPrePromotion = cancelPrePromotion;
function finish(ctrl, role) {
    if (promoting) {
        const info = promoting;
        promoting = undefined;
        if (info.pre)
            setPrePromotion(ctrl, info.move[1], role);
        else
            sendPromotion(ctrl, info.move[0], info.move[1], role, info.meta);
    }
}
function cancel(ctrl) {
    cancelPrePromotion(ctrl);
    ctrl.chessground.cancelPremove();
    if (promoting)
        xhr.reload(ctrl).then(ctrl.reload);
    promoting = undefined;
}
exports.cancel = cancel;
function renderPromotion(ctrl, dest, roles, color, orientation) {
    var left = (8 - util_1.key2pos(dest)[0]) * 12.5;
    if (orientation === 'white')
        left = 87.5 - left;
    var vertical = color === orientation ? 'top' : 'bottom';
    return snabbdom_1.h('div#promotion-choice.' + vertical, {
        hook: util_3.onInsert(el => {
            el.addEventListener('click', () => cancel(ctrl));
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
                return false;
            });
        })
    }, roles.map((serverRole, i) => {
        var top = (color === orientation ? i : 7 - i) * 12.5;
        return snabbdom_1.h('square', {
            attrs: { style: 'top: ' + top + '%;left: ' + left + '%' },
            hook: util_2.bind('click', e => {
                e.stopPropagation();
                finish(ctrl, serverRole);
            })
        }, [
            snabbdom_1.h('piece.' + serverRole + '.' + color)
        ]);
    }));
}
;
const roles = ['queen', 'knight', 'rook', 'bishop'];
function view(ctrl) {
    if (!promoting)
        return;
    return renderPromotion(ctrl, promoting.move[1], ctrl.data.game.variant.key === 'antichess' ? roles.concat('king') : roles, ctrl.data.player.color, ctrl.chessground.state.orientation);
}
exports.view = view;
;

},{"./ground":61,"./util":74,"./xhr":82,"chessground/util":17,"snabbdom":24}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function firstPly(d) {
    return d.steps[0].ply;
}
exports.firstPly = firstPly;
function lastPly(d) {
    return lastStep(d).ply;
}
exports.lastPly = lastPly;
function lastStep(d) {
    return d.steps[d.steps.length - 1];
}
exports.lastStep = lastStep;
function plyStep(d, ply) {
    return d.steps[ply - firstPly(d)];
}
exports.plyStep = plyStep;
function massage(d) {
    if (d.clock) {
        d.clock.showTenths = d.pref.clockTenths;
        d.clock.showBar = d.pref.clockBar;
    }
    if (d.correspondence)
        d.correspondence.showBar = d.pref.clockBar;
    if (['horde', 'crazyhouse'].includes(d.game.variant.key))
        d.pref.showCaptured = false;
    if (d.expiration)
        d.expiration.movedAt = Date.now() - d.expiration.idleMillis;
}
exports.massage = massage;
;

},{}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game = require("game");
const throttle_1 = require("common/throttle");
const notification_1 = require("common/notification");
const game_1 = require("game");
const xhr = require("./xhr");
const sound = require("./sound");
const li = window.lichess;
function backoff(delay, factor, callback) {
    let timer;
    let lastExec = 0;
    return function (...args) {
        const self = this;
        const elapsed = performance.now() - lastExec;
        function exec() {
            timer = undefined;
            lastExec = performance.now();
            delay *= factor;
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
function make(send, ctrl) {
    function reload(o, isRetry) {
        // avoid reload if possible!
        if (o && o.t) {
            ctrl.setLoading(false);
            handlers[o.t](o.d);
        }
        else
            xhr.reload(ctrl).then(data => {
                if (li.socket.getVersion() > data.player.version) {
                    // race condition! try to reload again
                    if (isRetry)
                        li.reload(); // give up and reload the page
                    else
                        reload(o, true);
                }
                else
                    ctrl.reload(data);
            });
    }
    ;
    const d = ctrl.data;
    const handlers = {
        takebackOffers(o) {
            ctrl.setLoading(false);
            d.player.proposingTakeback = o[d.player.color];
            const fromOp = d.opponent.proposingTakeback = o[d.opponent.color];
            if (fromOp)
                notification_1.default(ctrl.noarg('yourOpponentProposesATakeback'));
            ctrl.redraw();
        },
        move: ctrl.apiMove,
        drop: ctrl.apiMove,
        reload,
        redirect: ctrl.setRedirecting,
        clockInc(o) {
            if (ctrl.clock) {
                ctrl.clock.addTime(o.color, o.time);
                ctrl.redraw();
            }
        },
        cclock(o) {
            if (ctrl.corresClock) {
                d.correspondence.white = o.white;
                d.correspondence.black = o.black;
                ctrl.corresClock.update(o.white, o.black);
                ctrl.redraw();
            }
        },
        crowd(o) {
            game.setOnGame(d, 'white', o['white']);
            game.setOnGame(d, 'black', o['black']);
            ctrl.redraw();
        },
        endData(o) {
            ctrl.endWithData(o);
        },
        rematchOffer(by) {
            d.player.offeringRematch = by === d.player.color;
            if (d.opponent.offeringRematch = by === d.opponent.color)
                notification_1.default(ctrl.noarg('yourOpponentWantsToPlayANewGameWithYou'));
            ctrl.redraw();
        },
        rematchTaken(nextId) {
            d.game.rematch = nextId;
            if (!d.player.spectator)
                ctrl.setLoading(true);
            else
                ctrl.redraw();
        },
        drawOffer(by) {
            d.player.offeringDraw = by === d.player.color;
            const fromOp = d.opponent.offeringDraw = by === d.opponent.color;
            if (fromOp)
                notification_1.default(ctrl.noarg('yourOpponentOffersADraw'));
            ctrl.redraw();
        },
        berserk(color) {
            ctrl.setBerserk(color);
        },
        gone: ctrl.setGone,
        goneIn: ctrl.setGone,
        checkCount(e) {
            d.player.checks = d.player.color == 'white' ? e.white : e.black;
            d.opponent.checks = d.opponent.color == 'white' ? e.white : e.black;
            ctrl.redraw();
        },
        simulPlayerMove(gameId) {
            if (ctrl.opts.userId &&
                d.simul &&
                ctrl.opts.userId == d.simul.hostId &&
                gameId !== d.game.id &&
                ctrl.moveOn.get() &&
                !game_1.isPlayerTurn(ctrl.data)) {
                ctrl.setRedirecting();
                sound.move();
                li.hasToReload = true;
                location.href = '/' + gameId;
            }
        },
        simulEnd(simul) {
            li.loadCssPath('modal');
            $.modal($('<p>Simul complete!</p><br /><br />' +
                '<a class="button" href="/simul/' + simul.id + '">Back to ' + simul.name + ' simul</a>'));
        }
    };
    li.pubsub.on('ab.rep', n => send('rep', { n: n }));
    return {
        send,
        handlers,
        moreTime: throttle_1.default(300, () => send('moretime')),
        outoftime: backoff(500, 1.1, () => send('flag', d.game.player)),
        berserk: throttle_1.default(200, () => send('berserk', null, { ackable: true })),
        sendLoading(typ, data) {
            ctrl.setLoading(true);
            send(typ, data);
        },
        receive(typ, data) {
            if (handlers[typ]) {
                handlers[typ](data);
                return true;
            }
            return false;
        },
        reload
    };
}
exports.make = make;

},{"./sound":69,"./xhr":82,"common/notification":43,"common/throttle":45,"game":46}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throttle_1 = require("common/throttle");
function throttled(sound) {
    return throttle_1.default(100, () => window.lichess.sound[sound]());
}
exports.move = throttled('move');
exports.capture = throttled('capture');
exports.check = throttled('check');
exports.explode = throttled('explode');

},{"common/throttle":45}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const status_1 = require("game/view/status");
function setup(ctrl) {
    window.lichess.pubsub.on('speech.enabled', onSpeechChange(ctrl));
    onSpeechChange(ctrl)(window.lichess.sound.speech());
}
exports.setup = setup;
function onSpeechChange(ctrl) {
    return function (enabled) {
        if (!window.LichessSpeech && enabled)
            window.lichess.loadScript(window.lichess.compiledScript('speech')).then(() => status(ctrl));
        else if (window.LichessSpeech && !enabled)
            window.LichessSpeech = undefined;
    };
}
function status(ctrl) {
    const s = status_1.default(ctrl);
    if (s == 'playingRightNow')
        window.LichessSpeech.step(ctrl.stepAt(ctrl.ply), false);
    else {
        withSpeech(speech => speech.say(s, false));
        const w = ctrl.data.game.winner;
        if (w)
            withSpeech(speech => speech.say(ctrl.noarg(w + 'IsVictorious'), false));
    }
}
exports.status = status;
function userJump(ctrl, ply) {
    withSpeech(s => s.step(ctrl.stepAt(ply), true));
}
exports.userJump = userJump;
function step(step) {
    withSpeech(s => s.step(step, false));
}
exports.step = step;
function withSpeech(f) {
    if (window.LichessSpeech)
        f(window.LichessSpeech);
}

},{"game/view/status":49}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("game");
const status_1 = require("game/status");
const initialTitle = document.title;
var curFaviconIdx = 0;
const F = [
    '/assets/logo/lichess-favicon-32.png',
    '/assets/logo/lichess-favicon-32-invert.png'
].map(function (path, i) {
    return function () {
        if (curFaviconIdx !== i) {
            document.getElementById('favicon').href = path;
            curFaviconIdx = i;
        }
    };
});
let tickerTimer;
function resetTicker() {
    if (tickerTimer)
        clearTimeout(tickerTimer);
    tickerTimer = undefined;
    F[0]();
}
function startTicker() {
    function tick() {
        if (!document.hasFocus()) {
            F[1 - curFaviconIdx]();
            tickerTimer = setTimeout(tick, 1000);
        }
    }
    if (!tickerTimer)
        tickerTimer = setTimeout(tick, 200);
}
function init() {
    window.addEventListener('focus', resetTicker);
}
exports.init = init;
function set(ctrl, text) {
    if (ctrl.data.player.spectator)
        return;
    if (!text) {
        if (status_1.aborted(ctrl.data) || status_1.finished(ctrl.data)) {
            text = ctrl.trans('gameOver');
        }
        else if (game_1.isPlayerTurn(ctrl.data)) {
            text = ctrl.trans('yourTurn');
            if (!document.hasFocus())
                startTicker();
        }
        else {
            text = ctrl.trans('waitingForOpponent');
            resetTicker();
        }
    }
    document.title = text + " - " + initialTitle;
}
exports.set = set;

},{"game":46,"game/status":48}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function tourStandingCtrl(data, name) {
    return {
        set(d) { data = d; },
        tab: {
            key: 'tourStanding',
            name: name
        },
        view() {
            return snabbdom_1.h('table.slist', {
                hook: util_1.onInsert(_ => {
                    window.lichess.loadCssPath('round.tour-standing');
                })
            }, [
                snabbdom_1.h('tbody', data.map((p, i) => {
                    return snabbdom_1.h('tr.' + p.n, [
                        snabbdom_1.h('td.name', [
                            snabbdom_1.h('span.rank', '' + (i + 1)),
                            snabbdom_1.h('a.user-link.ulpt', {
                                attrs: { href: `/@/${p.n}` }
                            }, (p.t ? p.t + ' ' : '') + p.n)
                        ]),
                        snabbdom_1.h('td.total', p.f ? {
                            class: { 'is-gold': true },
                            attrs: { 'data-icon': 'Q' }
                        } : {}, '' + p.s)
                    ]);
                }))
            ]);
        }
    };
}
exports.tourStandingCtrl = tourStandingCtrl;

},{"./util":74,"snabbdom":24}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Tracks moves that were played on the board,
 * sent to the server, possibly acked,
 * but without a move response from the server yet.
 * After a delay, it will trigger a reload.
 * This might fix bugs where the board is in a
 * transient, dirty state, where clocks don't tick,
 * eventually causing the player to flag.
 * It will also help with lila-ws restarts.
 */
class TransientMove {
    constructor(socket) {
        this.socket = socket;
        this.current = undefined;
        this.register = () => {
            this.current = setTimeout(this.expire, 10000);
        };
        this.clear = () => {
            if (this.current)
                clearTimeout(this.current);
        };
        this.expire = () => {
            $.ajax({ method: 'POST', url: '/statlog?e=roundTransientExpire' });
            this.socket.reload({});
        };
    }
}
exports.default = TransientMove;

},{}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("chessground/util");
const pieceScores = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0
};
function justIcon(icon) {
    return {
        attrs: { 'data-icon': icon }
    };
}
exports.justIcon = justIcon;
function uci2move(uci) {
    if (!uci)
        return undefined;
    if (uci[1] === '@')
        return [uci.slice(2, 4)];
    return [uci.slice(0, 2), uci.slice(2, 4)];
}
exports.uci2move = uci2move;
function onInsert(f) {
    return {
        insert(vnode) {
            f(vnode.elm);
        }
    };
}
exports.onInsert = onInsert;
function bind(eventName, f, redraw, passive = true) {
    return onInsert(el => {
        el.addEventListener(eventName, !redraw ? f : e => {
            const res = f(e);
            redraw();
            return res;
        }, { passive });
    });
}
exports.bind = bind;
function parsePossibleMoves(dests) {
    if (!dests)
        return {};
    const dec = {};
    if (typeof dests == 'string')
        dests.split(' ').forEach(ds => {
            dec[ds.slice(0, 2)] = ds.slice(2).match(/.{2}/g);
        });
    else
        for (let k in dests)
            dec[k] = dests[k].match(/.{2}/g);
    return dec;
}
exports.parsePossibleMoves = parsePossibleMoves;
// {white: {pawn: 3 queen: 1}, black: {bishop: 2}}
function getMaterialDiff(pieces) {
    const diff = {
        white: { king: 0, queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0 },
        black: { king: 0, queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0 },
    };
    for (let k in pieces) {
        const p = pieces[k], them = diff[util_1.opposite(p.color)];
        if (them[p.role] > 0)
            them[p.role]--;
        else
            diff[p.color][p.role]++;
    }
    return diff;
}
exports.getMaterialDiff = getMaterialDiff;
function getScore(pieces) {
    let score = 0, k;
    for (k in pieces) {
        score += pieceScores[pieces[k].role] * (pieces[k].color === 'white' ? 1 : -1);
    }
    return score;
}
exports.getScore = getScore;
exports.noChecks = {
    white: 0,
    black: 0
};
function countChecks(steps, ply) {
    const checks = Object.assign({}, exports.noChecks);
    for (let step of steps) {
        if (ply < step.ply)
            break;
        if (step.check) {
            if (step.ply % 2 === 1)
                checks.white++;
            else
                checks.black++;
        }
    }
    return checks;
}
exports.countChecks = countChecks;
function spinner() {
    return snabbdom_1.h('div.spinner', {
        'aria-label': 'loading'
    }, [
        snabbdom_1.h('svg', { attrs: { viewBox: '0 0 40 40' } }, [
            snabbdom_1.h('circle', {
                attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
            })
        ])
    ]);
}
exports.spinner = spinner;

},{"chessground/util":17,"snabbdom":24}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util = require("../util");
const game = require("game");
const status = require("game/status");
const router_1 = require("game/router");
function analysisBoardOrientation(data) {
    return data.game.variant.key === 'racingKings' ? 'white' : data.player.color;
}
function poolUrl(clock, blocking) {
    return '/#pool/' + (clock.initial / 60) + '+' + clock.increment + (blocking ? '/' + blocking.id : '');
}
function analysisButton(ctrl) {
    const d = ctrl.data, url = router_1.game(d, analysisBoardOrientation(d)) + '#' + ctrl.ply;
    return game.replayable(d) ? snabbdom_1.h('a.fbt', {
        attrs: { href: url },
        hook: util.bind('click', _ => {
            // force page load in case the URL is the same
            if (location.pathname === url.split('#')[0])
                location.reload();
        })
    }, ctrl.noarg('analysis')) : null;
}
function rematchButtons(ctrl) {
    const d = ctrl.data, me = !!d.player.offeringRematch, them = !!d.opponent.offeringRematch, noarg = ctrl.noarg;
    return [
        them ? snabbdom_1.h('button.rematch-decline', {
            attrs: {
                'data-icon': 'L',
                title: noarg('decline')
            },
            hook: util.bind('click', () => {
                ctrl.socket.send('rematch-no');
            })
        }, ctrl.nvui ? noarg('decline') : '') : null,
        snabbdom_1.h('button.fbt.rematch.white', {
            class: {
                me,
                glowing: them,
                disabled: !me && !(d.opponent.onGame || (!d.clock && d.player.user && d.opponent.user))
            },
            attrs: {
                title: them ? noarg('yourOpponentWantsToPlayANewGameWithYou') : (me ? noarg('rematchOfferSent') : '')
            },
            hook: util.bind('click', e => {
                const d = ctrl.data;
                if (d.game.rematch)
                    location.href = router_1.game(d.game.rematch, d.opponent.color);
                else if (d.player.offeringRematch) {
                    d.player.offeringRematch = false;
                    ctrl.socket.send('rematch-no');
                }
                else if (d.opponent.onGame) {
                    d.player.offeringRematch = true;
                    ctrl.socket.send('rematch-yes');
                }
                else if (!e.target.classList.contains('disabled'))
                    ctrl.challengeRematch();
            }, ctrl.redraw)
        }, [
            me ? util.spinner() : snabbdom_1.h('span', noarg('rematch'))
        ])
    ];
}
function standard(ctrl, condition, icon, hint, socketMsg, onclick) {
    // disabled if condition callback is provided and is falsy
    const enabled = function () {
        return !condition || condition(ctrl.data);
    };
    return snabbdom_1.h('button.fbt.' + socketMsg, {
        attrs: {
            disabled: !enabled(),
            title: ctrl.noarg(hint)
        },
        hook: util.bind('click', _ => {
            if (enabled())
                onclick ? onclick() : ctrl.socket.sendLoading(socketMsg);
        })
    }, [
        snabbdom_1.h('span', ctrl.nvui ? [ctrl.noarg(hint)] : util.justIcon(icon))
    ]);
}
exports.standard = standard;
function opponentGone(ctrl) {
    const gone = ctrl.opponentGone();
    return gone === true ? snabbdom_1.h('div.suggestion', [
        snabbdom_1.h('p', { hook: onSuggestionHook }, ctrl.noarg('opponentLeftChoices')),
        snabbdom_1.h('button.button', {
            hook: util.bind('click', () => ctrl.socket.sendLoading('resign-force'))
        }, ctrl.noarg('forceResignation')),
        snabbdom_1.h('button.button', {
            hook: util.bind('click', () => ctrl.socket.sendLoading('draw-force'))
        }, ctrl.noarg('forceDraw'))
    ]) : (gone ? snabbdom_1.h('div.suggestion', [
        snabbdom_1.h('p', ctrl.trans.vdomPlural('opponentLeftCounter', gone, snabbdom_1.h('strong', '' + gone)))
    ]) : null);
}
exports.opponentGone = opponentGone;
function actConfirm(ctrl, f, transKey, icon, klass) {
    return snabbdom_1.h('div.act-confirm.' + transKey, [
        snabbdom_1.h('button.fbt.yes.' + (klass || ''), {
            attrs: { title: ctrl.noarg(transKey), 'data-icon': icon },
            hook: util.bind('click', () => f(true))
        }),
        snabbdom_1.h('button.fbt.no', {
            attrs: { title: ctrl.noarg('cancel'), 'data-icon': 'L' },
            hook: util.bind('click', () => f(false))
        })
    ]);
}
function resignConfirm(ctrl) {
    return actConfirm(ctrl, ctrl.resign, 'resign', 'b');
}
exports.resignConfirm = resignConfirm;
function drawConfirm(ctrl) {
    return actConfirm(ctrl, ctrl.offerDraw, 'offerDraw', '2', 'draw-yes');
}
exports.drawConfirm = drawConfirm;
function threefoldClaimDraw(ctrl) {
    return ctrl.data.game.threefold ? snabbdom_1.h('div.suggestion', [
        snabbdom_1.h('p', {
            hook: onSuggestionHook
        }, ctrl.noarg('threefoldRepetition')),
        snabbdom_1.h('button.button', {
            hook: util.bind('click', () => ctrl.socket.sendLoading('draw-claim'))
        }, ctrl.noarg('claimADraw'))
    ]) : null;
}
exports.threefoldClaimDraw = threefoldClaimDraw;
function cancelDrawOffer(ctrl) {
    return ctrl.data.player.offeringDraw ? snabbdom_1.h('div.pending', [
        snabbdom_1.h('p', ctrl.noarg('drawOfferSent'))
    ]) : null;
}
exports.cancelDrawOffer = cancelDrawOffer;
function answerOpponentDrawOffer(ctrl) {
    return ctrl.data.opponent.offeringDraw ? snabbdom_1.h('div.negotiation.draw', [
        snabbdom_1.h('p', ctrl.noarg('yourOpponentOffersADraw')),
        acceptButton(ctrl, 'draw-yes', () => ctrl.socket.sendLoading('draw-yes')),
        declineButton(ctrl, () => ctrl.socket.sendLoading('draw-no'))
    ]) : null;
}
exports.answerOpponentDrawOffer = answerOpponentDrawOffer;
function cancelTakebackProposition(ctrl) {
    return ctrl.data.player.proposingTakeback ? snabbdom_1.h('div.pending', [
        snabbdom_1.h('p', ctrl.noarg('takebackPropositionSent')),
        snabbdom_1.h('button.button', {
            hook: util.bind('click', () => ctrl.socket.sendLoading('takeback-no'))
        }, ctrl.noarg('cancel'))
    ]) : null;
}
exports.cancelTakebackProposition = cancelTakebackProposition;
function acceptButton(ctrl, klass, action, i18nKey = 'accept') {
    const text = ctrl.noarg(i18nKey);
    return ctrl.nvui ? snabbdom_1.h('button.' + klass, {
        hook: util.bind('click', action)
    }, text) : snabbdom_1.h('a.accept', {
        attrs: {
            'data-icon': 'E',
            title: text
        },
        hook: util.bind('click', action)
    });
}
function declineButton(ctrl, action, i18nKey = 'decline') {
    const text = ctrl.noarg(i18nKey);
    return ctrl.nvui ? snabbdom_1.h('button', {
        hook: util.bind('click', action)
    }, text) : snabbdom_1.h('a.decline', {
        attrs: {
            'data-icon': 'L',
            title: text
        },
        hook: util.bind('click', action)
    });
}
function answerOpponentTakebackProposition(ctrl) {
    return ctrl.data.opponent.proposingTakeback ? snabbdom_1.h('div.negotiation.takeback', [
        snabbdom_1.h('p', ctrl.noarg('yourOpponentProposesATakeback')),
        acceptButton(ctrl, 'takeback-yes', ctrl.takebackYes),
        declineButton(ctrl, () => ctrl.socket.sendLoading('takeback-no'))
    ]) : null;
}
exports.answerOpponentTakebackProposition = answerOpponentTakebackProposition;
function submitMove(ctrl) {
    return (ctrl.moveToSubmit || ctrl.dropToSubmit) ? snabbdom_1.h('div.negotiation.move-confirm', [
        snabbdom_1.h('p', ctrl.noarg('confirmMove')),
        acceptButton(ctrl, 'confirm-yes', () => ctrl.submitMove(true)),
        declineButton(ctrl, () => ctrl.submitMove(false), 'cancel')
    ]) : undefined;
}
exports.submitMove = submitMove;
function backToTournament(ctrl) {
    const d = ctrl.data;
    return (d.tournament && d.tournament.running) ? snabbdom_1.h('div.follow-up', [
        snabbdom_1.h('a.text.fbt.strong.glowing', {
            attrs: {
                'data-icon': 'G',
                href: '/tournament/' + d.tournament.id
            },
            hook: util.bind('click', ctrl.setRedirecting)
        }, ctrl.noarg('backToTournament')),
        snabbdom_1.h('form', {
            attrs: {
                method: 'post',
                action: '/tournament/' + d.tournament.id + '/withdraw'
            }
        }, [
            snabbdom_1.h('button.text.fbt.weak', util.justIcon('Z'), 'Pause')
        ]),
        analysisButton(ctrl)
    ]) : undefined;
}
exports.backToTournament = backToTournament;
function moretime(ctrl) {
    return game.moretimeable(ctrl.data) ? snabbdom_1.h('a.moretime', {
        attrs: {
            title: ctrl.data.clock ? ctrl.trans('giveNbSeconds', ctrl.data.clock.moretime) :
                ctrl.noarg('giveMoreTime'),
            'data-icon': 'O'
        },
        hook: util.bind('click', ctrl.socket.moreTime)
    }) : null;
}
exports.moretime = moretime;
function followUp(ctrl) {
    const d = ctrl.data, rematchable = !d.game.rematch && (status.finished(d) || status.aborted(d)) && !d.tournament && !d.simul && !d.game.boosted, newable = (status.finished(d) || status.aborted(d)) && (d.game.source === 'lobby' ||
        d.game.source === 'pool'), rematchZone = ctrl.challengeRematched ? [
        snabbdom_1.h('div.suggestion.text', {
            hook: onSuggestionHook
        }, ctrl.noarg('rematchOfferSent'))
    ] : (rematchable || d.game.rematch ? rematchButtons(ctrl) : []);
    return snabbdom_1.h('div.follow-up', [
        ...rematchZone,
        d.tournament ? snabbdom_1.h('a.fbt', {
            attrs: { href: '/tournament/' + d.tournament.id }
        }, ctrl.noarg('viewTournament')) : null,
        newable ? snabbdom_1.h('a.fbt', {
            attrs: { href: d.game.source === 'pool' ? poolUrl(d.clock, d.opponent.user) : '/?hook_like=' + d.game.id },
        }, ctrl.noarg('newOpponent')) : null,
        analysisButton(ctrl)
    ]);
}
exports.followUp = followUp;
function watcherFollowUp(ctrl) {
    const d = ctrl.data, content = [
        d.game.rematch ? snabbdom_1.h('a.fbt.text', {
            attrs: {
                'data-icon': 'v',
                href: `/${d.game.rematch}/${d.opponent.color}`
            }
        }, ctrl.noarg('viewRematch')) : null,
        d.tournament ? snabbdom_1.h('a.fbt', {
            attrs: { href: '/tournament/' + d.tournament.id }
        }, ctrl.noarg('viewTournament')) : null,
        analysisButton(ctrl)
    ];
    return content.find(x => !!x) ? snabbdom_1.h('div.follow-up', content) : null;
}
exports.watcherFollowUp = watcherFollowUp;
const onSuggestionHook = util.onInsert(el => window.lichess.pubsub.emit('round.suggestion', el.textContent));

},{"../util":74,"game":46,"game/router":47,"game/status":48,"snabbdom":24}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const game_1 = require("game");
const game_2 = require("game");
let rang = false;
function default_1(ctrl) {
    const d = game_1.playable(ctrl.data) && ctrl.data.expiration;
    if (!d)
        return;
    const timeLeft = Math.max(0, d.movedAt - Date.now() + d.millisToMove), secondsLeft = Math.floor(timeLeft / 1000), myTurn = game_2.isPlayerTurn(ctrl.data), emerg = myTurn && timeLeft < 8000;
    if (!rang && emerg) {
        window.lichess.sound.lowtime();
        rang = true;
    }
    const side = myTurn != ctrl.flip ? 'bottom' : 'top';
    return snabbdom_1.h('div.expiration.expiration-' + side, {
        class: {
            emerg,
            'bar-glider': myTurn
        }
    }, ctrl.trans.vdomPlural('nbSecondsToPlayTheFirstMove', secondsLeft, snabbdom_1.h('strong', '' + secondsLeft)));
}
exports.default = default_1;

},{"game":46,"snabbdom":24}],77:[function(require,module,exports){
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

},{"common/gridHacks":41}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const round_1 = require("../round");
const table_1 = require("./table");
const promotion = require("../promotion");
const ground_1 = require("../ground");
const fen_1 = require("chessground/fen");
const util = require("../util");
const keyboard = require("../keyboard");
const gridHacks = require("./gridHacks");
const crazyView_1 = require("../crazy/crazyView");
const keyboardMove_1 = require("../keyboardMove");
function renderMaterial(material, score, position, checks) {
    const children = [];
    let role, i;
    for (role in material) {
        if (material[role] > 0) {
            const content = [];
            for (i = 0; i < material[role]; i++)
                content.push(snabbdom_1.h('mpiece.' + role));
            children.push(snabbdom_1.h('div', content));
        }
    }
    if (checks)
        for (i = 0; i < checks; i++)
            children.push(snabbdom_1.h('div', snabbdom_1.h('mpiece.king')));
    if (score > 0)
        children.push(snabbdom_1.h('score', '+' + score));
    return snabbdom_1.h('div.material.material-' + position, children);
}
function wheel(ctrl, e) {
    if (ctrl.isPlaying())
        return true;
    e.preventDefault();
    if (e.deltaY > 0)
        keyboard.next(ctrl);
    else if (e.deltaY < 0)
        keyboard.prev(ctrl);
    ctrl.redraw();
    return false;
}
const emptyMaterialDiff = {
    white: {},
    black: {}
};
function main(ctrl) {
    const d = ctrl.data, cgState = ctrl.chessground && ctrl.chessground.state, topColor = d[ctrl.flip ? 'player' : 'opponent'].color, bottomColor = d[ctrl.flip ? 'opponent' : 'player'].color;
    let material, score = 0;
    if (d.pref.showCaptured) {
        let pieces = cgState ? cgState.pieces : fen_1.read(round_1.plyStep(ctrl.data, ctrl.ply).fen);
        material = util.getMaterialDiff(pieces);
        score = util.getScore(pieces) * (bottomColor === 'white' ? 1 : -1);
    }
    else
        material = emptyMaterialDiff;
    const checks = (d.player.checks || d.opponent.checks) ?
        util.countChecks(ctrl.data.steps, ctrl.ply) :
        util.noChecks;
    return ctrl.nvui ? ctrl.nvui.render(ctrl) : snabbdom_1.h('div.round__app.variant-' + d.game.variant.key, {
        class: { 'move-confirm': !!(ctrl.moveToSubmit || ctrl.dropToSubmit) },
        hook: util.onInsert(gridHacks.start)
    }, [
        snabbdom_1.h('div.round__app__board.main-board' + (ctrl.data.pref.blindfold ? '.blindfold' : ''), {
            hook: window.lichess.hasTouchEvents ? undefined :
                util.bind('wheel', (e) => wheel(ctrl, e), undefined, false)
        }, [
            ground_1.render(ctrl),
            promotion.view(ctrl)
        ]),
        crazyView_1.default(ctrl, topColor, 'top') || renderMaterial(material[topColor], -score, 'top', checks[topColor]),
        ...table_1.renderTable(ctrl),
        crazyView_1.default(ctrl, bottomColor, 'bottom') || renderMaterial(material[bottomColor], score, 'bottom', checks[bottomColor]),
        ctrl.keyboardMove ? keyboardMove_1.render(ctrl.keyboardMove) : null
    ]);
}
exports.main = main;
;

},{"../crazy/crazyView":59,"../ground":61,"../keyboard":62,"../keyboardMove":63,"../promotion":66,"../round":67,"../util":74,"./gridHacks":77,"./table":80,"chessground/fen":11,"snabbdom":24}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const round = require("../round");
const throttle_1 = require("common/throttle");
const game = require("game");
const status = require("game/status");
const router_1 = require("game/router");
const status_1 = require("game/view/status");
const util = require("../util");
const scrollMax = 99999, moveTag = 'm2';
const autoScroll = throttle_1.default(100, (movesEl, ctrl) => window.requestAnimationFrame(() => {
    if (ctrl.data.steps.length < 7)
        return;
    let st = undefined;
    if (ctrl.ply < 3)
        st = 0;
    else if (ctrl.ply == round.lastPly(ctrl.data))
        st = scrollMax;
    else {
        const plyEl = movesEl.querySelector('.active');
        if (plyEl)
            st = window.lichess.isCol1() ?
                plyEl.offsetLeft - movesEl.offsetWidth / 2 + plyEl.offsetWidth / 2 :
                plyEl.offsetTop - movesEl.offsetHeight / 2 + plyEl.offsetHeight / 2;
    }
    if (typeof st == 'number') {
        if (st == scrollMax)
            movesEl.scrollLeft = movesEl.scrollTop = st;
        else if (window.lichess.isCol1())
            movesEl.scrollLeft = st;
        else
            movesEl.scrollTop = st;
    }
}));
function renderMove(step, curPly, orEmpty) {
    return step ? snabbdom_1.h(moveTag, {
        class: { active: step.ply === curPly }
    }, step.san[0] === 'P' ? step.san.slice(1) : step.san) : (orEmpty ? snabbdom_1.h(moveTag, '…') : undefined);
}
function renderResult(ctrl) {
    let result;
    if (status.finished(ctrl.data))
        switch (ctrl.data.game.winner) {
            case 'white':
                result = '1-0';
                break;
            case 'black':
                result = '0-1';
                break;
            default:
                result = '½-½';
        }
    if (result || status.aborted(ctrl.data)) {
        const winner = ctrl.data.game.winner;
        return snabbdom_1.h('div.result-wrap', [
            snabbdom_1.h('p.result', result || ''),
            snabbdom_1.h('p.status', {
                hook: util.onInsert(() => {
                    if (ctrl.autoScroll)
                        ctrl.autoScroll();
                    else
                        setTimeout(() => ctrl.autoScroll(), 200);
                })
            }, [
                status_1.default(ctrl),
                winner ? ' • ' + ctrl.trans.noarg(winner + 'IsVictorious') : ''
            ])
        ]);
    }
    return;
}
exports.renderResult = renderResult;
function renderMoves(ctrl) {
    const steps = ctrl.data.steps, firstPly = round.firstPly(ctrl.data), lastPly = round.lastPly(ctrl.data);
    if (typeof lastPly === 'undefined')
        return [];
    const pairs = [];
    let startAt = 1;
    if (firstPly % 2 === 1) {
        pairs.push([null, steps[1]]);
        startAt = 2;
    }
    for (let i = startAt; i < steps.length; i += 2)
        pairs.push([steps[i], steps[i + 1]]);
    const els = [], curPly = ctrl.ply;
    for (let i = 0; i < pairs.length; i++) {
        els.push(snabbdom_1.h('index', i + 1 + ''));
        els.push(renderMove(pairs[i][0], curPly, true));
        els.push(renderMove(pairs[i][1], curPly, false));
    }
    els.push(renderResult(ctrl));
    return els;
}
function analysisButton(ctrl) {
    const forecastCount = ctrl.data.forecastCount;
    return game.userAnalysable(ctrl.data) ? snabbdom_1.h('a.fbt.analysis', {
        class: {
            'text': !!forecastCount
        },
        attrs: {
            title: ctrl.trans.noarg('analysis'),
            href: router_1.game(ctrl.data, ctrl.data.player.color) + '/analysis#' + ctrl.ply,
            'data-icon': 'A'
        }
    }, forecastCount ? ['' + forecastCount] : []) : undefined;
}
exports.analysisButton = analysisButton;
function renderButtons(ctrl) {
    const d = ctrl.data, firstPly = round.firstPly(d), lastPly = round.lastPly(d);
    return snabbdom_1.h('div.buttons', {
        hook: util.bind('mousedown', e => {
            const target = e.target;
            const ply = parseInt(target.getAttribute('data-ply') || '');
            if (!isNaN(ply))
                ctrl.userJump(ply);
            else {
                const action = target.getAttribute('data-act') || target.parentNode.getAttribute('data-act');
                if (action === 'flip') {
                    if (d.tv)
                        location.href = '/tv/' + d.tv.channel + (d.tv.flip ? '' : '?flip=1');
                    else if (d.player.spectator)
                        location.href = router_1.game(d, d.opponent.color);
                    else
                        ctrl.flipNow();
                }
            }
        }, ctrl.redraw)
    }, [
        snabbdom_1.h('button.fbt.flip', {
            class: { active: ctrl.flip },
            attrs: {
                title: ctrl.trans.noarg('flipBoard'),
                'data-act': 'flip',
                'data-icon': 'B'
            }
        }),
        ...([
            ['W', firstPly],
            ['Y', ctrl.ply - 1],
            ['X', ctrl.ply + 1],
            ['V', lastPly]
        ].map((b, i) => {
            const enabled = ctrl.ply !== b[1] && b[1] >= firstPly && b[1] <= lastPly;
            return snabbdom_1.h('button.fbt', {
                class: { glowing: i === 3 && ctrl.isLate() },
                attrs: {
                    disabled: !enabled,
                    'data-icon': b[0],
                    'data-ply': enabled ? b[1] : '-'
                }
            });
        })),
        analysisButton(ctrl) || snabbdom_1.h('div.noop')
    ]);
}
function initMessage(d, trans) {
    return (game.playable(d) && d.game.turns === 0 && !d.player.spectator) ?
        snabbdom_1.h('div.message', util.justIcon(''), [
            snabbdom_1.h('div', [
                trans(d.player.color === 'white' ? 'youPlayTheWhitePieces' : 'youPlayTheBlackPieces'),
                ...(d.player.color === 'white' ? [snabbdom_1.h('br'), snabbdom_1.h('strong', trans('itsYourTurn'))] : [])
            ])
        ]) : null;
}
function col1Button(ctrl, dir, icon, disabled) {
    return disabled ? null : snabbdom_1.h('button.fbt', {
        attrs: {
            disabled: disabled,
            'data-icon': icon,
            'data-ply': ctrl.ply + dir
        },
        hook: util.bind('mousedown', e => {
            e.preventDefault();
            ctrl.userJump(ctrl.ply + dir);
            ctrl.redraw();
        })
    });
}
function render(ctrl) {
    const d = ctrl.data, col1 = window.lichess.isCol1(), moves = ctrl.replayEnabledByPref() && snabbdom_1.h('div.moves', {
        hook: util.onInsert(el => {
            el.addEventListener('mousedown', e => {
                let node = e.target, offset = -2;
                if (node.tagName !== moveTag.toUpperCase())
                    return;
                while (node = node.previousSibling) {
                    offset++;
                    if (node.tagName === 'INDEX') {
                        ctrl.userJump(2 * parseInt(node.textContent || '') + offset);
                        ctrl.redraw();
                        break;
                    }
                }
            });
            ctrl.autoScroll = () => autoScroll(el, ctrl);
            ctrl.autoScroll();
            window.addEventListener('load', ctrl.autoScroll);
        })
    }, renderMoves(ctrl));
    return ctrl.nvui ? undefined : snabbdom_1.h('div.rmoves', [
        renderButtons(ctrl),
        initMessage(d, ctrl.trans.noarg) || (moves ? (col1 ? snabbdom_1.h('div.col1-moves', [
            col1Button(ctrl, -1, 'Y', ctrl.ply == round.firstPly(d)),
            moves,
            col1Button(ctrl, 1, 'X', ctrl.ply == round.lastPly(d))
        ]) : moves) : renderResult(ctrl))
    ]);
}
exports.render = render;

},{"../round":67,"../util":74,"common/throttle":45,"game":46,"game/router":47,"game/status":48,"game/view/status":49,"snabbdom":24}],80:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const game = require("game");
const status = require("game/status");
const clockView_1 = require("../clock/clockView");
const corresClockView_1 = require("../corresClock/corresClockView");
const replay = require("./replay");
const expiration_1 = require("./expiration");
const renderUser = require("./user");
const button = require("./button");
function renderPlayer(ctrl, position) {
    const player = ctrl.playerAt(position);
    return ctrl.nvui ? undefined : (player.ai ? snabbdom_1.h('div.user-link.online.ruser.ruser-' + position, [
        snabbdom_1.h('i.line'),
        snabbdom_1.h('name', renderUser.aiName(ctrl, player.ai))
    ]) :
        renderUser.userHtml(ctrl, player, position));
}
function isLoading(ctrl) {
    return ctrl.loading || ctrl.redirecting;
}
function loader() { return snabbdom_1.h('i.ddloader'); }
function renderTableWith(ctrl, buttons) {
    return [
        replay.render(ctrl),
        buttons.find(x => !!x) ? snabbdom_1.h('div.rcontrols', buttons) : null
    ];
}
function renderTableEnd(ctrl) {
    return renderTableWith(ctrl, [
        isLoading(ctrl) ? loader() : (button.backToTournament(ctrl) || button.followUp(ctrl))
    ]);
}
exports.renderTableEnd = renderTableEnd;
function renderTableWatch(ctrl) {
    return renderTableWith(ctrl, [
        isLoading(ctrl) ? loader() : (game.playable(ctrl.data) ? undefined : button.watcherFollowUp(ctrl))
    ]);
}
exports.renderTableWatch = renderTableWatch;
function renderTablePlay(ctrl) {
    const d = ctrl.data, loading = isLoading(ctrl), submit = button.submitMove(ctrl), icons = (loading || submit) ? [] : [
        game.abortable(d) ? button.standard(ctrl, undefined, 'L', 'abortGame', 'abort') :
            button.standard(ctrl, game.takebackable, 'i', 'proposeATakeback', 'takeback-yes', ctrl.takebackYes),
        ctrl.drawConfirm ? button.drawConfirm(ctrl) : button.standard(ctrl, ctrl.canOfferDraw, '2', 'offerDraw', 'draw-yes', () => ctrl.offerDraw(true)),
        ctrl.resignConfirm ? button.resignConfirm(ctrl) : button.standard(ctrl, game.resignable, 'b', 'resign', 'resign-confirm', () => ctrl.resign(true)),
        replay.analysisButton(ctrl)
    ], buttons = loading ? [loader()] : (submit ? [submit] : [
        button.opponentGone(ctrl),
        button.threefoldClaimDraw(ctrl),
        button.cancelDrawOffer(ctrl),
        button.answerOpponentDrawOffer(ctrl),
        button.cancelTakebackProposition(ctrl),
        button.answerOpponentTakebackProposition(ctrl)
    ]);
    return [
        replay.render(ctrl),
        snabbdom_1.h('div.rcontrols', [
            snabbdom_1.h('div.ricons', {
                class: { 'confirm': !!(ctrl.drawConfirm || ctrl.resignConfirm) }
            }, icons),
            ...buttons
        ])
    ];
}
exports.renderTablePlay = renderTablePlay;
function whosTurn(ctrl, color, position) {
    const d = ctrl.data;
    if (status.finished(d) || status.aborted(d))
        return;
    return snabbdom_1.h('div.rclock.rclock-turn.rclock-' + position, [
        d.game.player === color ? snabbdom_1.h('div.rclock-turn__text', d.player.spectator ? ctrl.trans(d.game.player + 'Plays') : ctrl.trans(d.game.player === d.player.color ? 'yourTurn' : 'waitingForOpponent')) : null
    ]);
}
function anyClock(ctrl, position) {
    const player = ctrl.playerAt(position);
    if (ctrl.clock)
        return clockView_1.renderClock(ctrl, player, position);
    else if (ctrl.data.correspondence && ctrl.data.game.turns > 1)
        return corresClockView_1.default(ctrl.corresClock, ctrl.trans, player.color, position, ctrl.data.game.player);
    else
        return whosTurn(ctrl, player.color, position);
}
function renderTable(ctrl) {
    return [
        snabbdom_1.h('div.round__app__table'),
        expiration_1.default(ctrl),
        renderPlayer(ctrl, 'top'),
        ...(ctrl.data.player.spectator ? renderTableWatch(ctrl) : (game.playable(ctrl.data) ? renderTablePlay(ctrl) : renderTableEnd(ctrl))),
        renderPlayer(ctrl, 'bottom'),
        /* render clocks after players so they display on top of them in col1,
         * since they occupy the same grid cell. This is required to avoid
         * having two columns with min-content, which causes the horizontal moves
         * to overflow: it couldn't be contained in the parent anymore */
        anyClock(ctrl, 'top'),
        anyClock(ctrl, 'bottom'),
    ];
}
exports.renderTable = renderTable;
;

},{"../clock/clockView":55,"../corresClock/corresClockView":57,"./button":75,"./expiration":76,"./replay":79,"./user":81,"game":46,"game/status":48,"snabbdom":24}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
function aiName(ctrl, level) {
    return ctrl.trans('aiNameLevelAiLevel', 'Stockfish', level);
}
exports.aiName = aiName;
function userHtml(ctrl, player, position) {
    const d = ctrl.data, user = player.user, perf = user ? user.perfs[d.game.perf] : null, rating = player.rating ? player.rating : (perf && perf.rating), rd = player.ratingDiff, ratingDiff = rd === 0 ? snabbdom_1.h('span', '±0') : (rd && rd > 0 ? snabbdom_1.h('good', '+' + rd) : (rd && rd < 0 ? snabbdom_1.h('bad', '−' + (-rd)) : undefined));
    if (user) {
        const connecting = !player.onGame && ctrl.firstSeconds && user.online;
        return snabbdom_1.h(`div.ruser-${position}.ruser.user-link`, {
            class: {
                online: player.onGame,
                offline: !player.onGame,
                long: user.username.length > 16,
                connecting
            }
        }, [
            snabbdom_1.h('i.line' + (user.patron ? '.patron' : ''), {
                attrs: {
                    title: connecting ? 'Connecting to the game' : (player.onGame ? 'Joined the game' : 'Left the game')
                }
            }),
            snabbdom_1.h('a.text.ulpt', {
                attrs: {
                    'data-pt-pos': 's',
                    href: '/@/' + user.username,
                    target: ctrl.isPlaying() ? '_blank' : '_self'
                }
            }, user.title ? [
                snabbdom_1.h('span.title', user.title == 'BOT' ? { attrs: { 'data-bot': true } } : {}, user.title), ' ', user.username
            ] : [user.username]),
            rating ? snabbdom_1.h('rating', rating + (player.provisional ? '?' : '')) : null,
            ratingDiff,
            player.engine ? snabbdom_1.h('span', {
                attrs: {
                    'data-icon': 'j',
                    title: ctrl.trans.noarg('thisPlayerUsesChessComputerAssistance')
                }
            }) : null
        ]);
    }
    const connecting = !player.onGame && ctrl.firstSeconds;
    return snabbdom_1.h(`div.ruser-${position}.ruser.user-link`, {
        class: {
            online: player.onGame,
            offline: !player.onGame,
            connecting
        }
    }, [
        snabbdom_1.h('i.line', {
            attrs: {
                title: connecting ? 'Connecting to the game' : (player.onGame ? 'Joined the game' : 'Left the game')
            }
        }),
        snabbdom_1.h('name', player.name || 'Anonymous')
    ]);
}
exports.userHtml = userHtml;
function userTxt(ctrl, player) {
    if (player.user) {
        return (player.user.title ? player.user.title + ' ' : '') + player.user.username;
    }
    else if (player.ai)
        return aiName(ctrl, player.ai);
    else
        return 'Anonymous';
}
exports.userTxt = userTxt;

},{"snabbdom":24}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headers = {
    'Accept': 'application/vnd.lichess.v4+json'
};
function reload(ctrl) {
    return $.ajax({
        url: ctrl.data.url.round,
        headers: exports.headers
    }).fail(window.lichess.reload);
}
exports.reload = reload;
function whatsNext(ctrl) {
    return $.ajax({
        url: '/whats-next/' + ctrl.data.game.id + ctrl.data.player.id,
        headers: exports.headers
    });
}
exports.whatsNext = whatsNext;
function challengeRematch(gameId) {
    return $.ajax({
        method: 'POST',
        url: '/challenge/rematch-of/' + gameId,
        headers: exports.headers
    });
}
exports.challengeRematch = challengeRematch;

},{}]},{},[64])(64)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2FuaW0udHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2FwaS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvYm9hcmQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2NoZXNzZ3JvdW5kLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9jb25maWcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2RyYWcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2RyYXcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2Ryb3AudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2V2ZW50cy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZXhwbG9zaW9uLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9mZW4udHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3ByZW1vdmUudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3JlbmRlci50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvc3RhdGUudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3N2Zy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvdHlwZXMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3V0aWwudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3dyYXAudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3RodW5rLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3Zub2RlLmpzIiwiLi4vY2hhdC9zcmMvY3RybC50cyIsIi4uL2NoYXQvc3JjL2Rpc2N1c3Npb24udHMiLCIuLi9jaGF0L3NyYy9lbmhhbmNlLnRzIiwiLi4vY2hhdC9zcmMvbWFpbi50cyIsIi4uL2NoYXQvc3JjL21vZGVyYXRpb24udHMiLCIuLi9jaGF0L3NyYy9ub3RlLnRzIiwiLi4vY2hhdC9zcmMvcHJlc2V0LnRzIiwiLi4vY2hhdC9zcmMvc3BhbS50cyIsIi4uL2NoYXQvc3JjL3V0aWwudHMiLCIuLi9jaGF0L3NyYy92aWV3LnRzIiwiLi4vY2hhdC9zcmMveGhyLnRzIiwiLi4vY2hlc3Mvc3JjL21haW4udHMiLCIuLi9jaGVzcy9zcmMvcGlvdHIudHMiLCIuLi9jb21tb24vc3JjL2NvbW1vbi50cyIsIi4uL2NvbW1vbi9zcmMvZ3JpZEhhY2tzLnRzIiwiLi4vY29tbW9uL3NyYy9tZW51SG92ZXIudHMiLCIuLi9jb21tb24vc3JjL25vdGlmaWNhdGlvbi50cyIsIi4uL2NvbW1vbi9zcmMvcmVzaXplLnRzIiwiLi4vY29tbW9uL3NyYy90aHJvdHRsZS50cyIsIi4uL2dhbWUvc3JjL2dhbWUudHMiLCIuLi9nYW1lL3NyYy9yb3V0ZXIudHMiLCIuLi9nYW1lL3NyYy9zdGF0dXMudHMiLCIuLi9nYW1lL3NyYy92aWV3L3N0YXR1cy50cyIsInNyYy9hdG9taWMudHMiLCJzcmMvYmx1ci50cyIsInNyYy9ib290LnRzIiwic3JjL2NldmFsU3ViLnRzIiwic3JjL2Nsb2NrL2Nsb2NrQ3RybC50cyIsInNyYy9jbG9jay9jbG9ja1ZpZXcudHMiLCJzcmMvY29ycmVzQ2xvY2svY29ycmVzQ2xvY2tDdHJsLnRzIiwic3JjL2NvcnJlc0Nsb2NrL2NvcnJlc0Nsb2NrVmlldy50cyIsInNyYy9jcmF6eS9jcmF6eUN0cmwudHMiLCJzcmMvY3JhenkvY3JhenlWaWV3LnRzIiwic3JjL2N0cmwudHMiLCJzcmMvZ3JvdW5kLnRzIiwic3JjL2tleWJvYXJkLnRzIiwic3JjL2tleWJvYXJkTW92ZS50cyIsInNyYy9tYWluLnRzIiwic3JjL21vdmVPbi50cyIsInNyYy9wcm9tb3Rpb24udHMiLCJzcmMvcm91bmQudHMiLCJzcmMvc29ja2V0LnRzIiwic3JjL3NvdW5kLnRzIiwic3JjL3NwZWVjaC50cyIsInNyYy90aXRsZS50cyIsInNyYy90b3VyU3RhbmRpbmcudHMiLCJzcmMvdHJhbnNpZW50TW92ZS50cyIsInNyYy91dGlsLnRzIiwic3JjL3ZpZXcvYnV0dG9uLnRzIiwic3JjL3ZpZXcvZXhwaXJhdGlvbi50cyIsInNyYy92aWV3L2dyaWRIYWNrcy50cyIsInNyYy92aWV3L21haW4udHMiLCJzcmMvdmlldy9yZXBsYXkudHMiLCJzcmMvdmlldy90YWJsZS50cyIsInNyYy92aWV3L3VzZXIudHMiLCJzcmMveGhyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSwrQkFBOEI7QUE0QjlCLFNBQWdCLElBQUksQ0FBSSxRQUFxQixFQUFFLEtBQVk7SUFDekQsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN0RixDQUFDO0FBRkQsb0JBRUM7QUFF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R0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuQjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQzs7O0FDekVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QzFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNaLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLO1FBQ3hCLE9BQU8sRUFBUCxlQUFPO0tBQ1IsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFMRCx3QkFLQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxJQUFxQjtJQUM3QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDWixHQUFHLEVBQUUsY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQzdELE9BQU8sRUFBUCxlQUFPO0tBQ1IsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUxELDhCQUtDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsTUFBYztJQUM3QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDWixNQUFNLEVBQUUsTUFBTTtRQUNkLEdBQUcsRUFBRSx3QkFBd0IsR0FBRyxNQUFNO1FBQ3RDLE9BQU8sRUFBUCxlQUFPO0tBQ1IsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQU5ELDRDQU1DIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIDAsMSBhbmltYXRpb24gZ29hbFxuLy8gMiwzIGFuaW1hdGlvbiBjdXJyZW50IHN0YXR1c1xuZXhwb3J0IHR5cGUgQW5pbVZlY3RvciA9IGNnLk51bWJlclF1YWRcblxuZXhwb3J0IGludGVyZmFjZSBBbmltVmVjdG9ycyB7XG4gIFtrZXk6IHN0cmluZ106IEFuaW1WZWN0b3Jcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltRmFkaW5ncyB7XG4gIFtrZXk6IHN0cmluZ106IGNnLlBpZWNlXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbVBsYW4ge1xuICBhbmltczogQW5pbVZlY3RvcnM7XG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1DdXJyZW50IHtcbiAgc3RhcnQ6IERPTUhpZ2hSZXNUaW1lU3RhbXA7XG4gIGZyZXF1ZW5jeTogY2cuS0h6O1xuICBwbGFuOiBBbmltUGxhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuaW08QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXI8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBBbmltUGllY2Uge1xuICBrZXk6IGNnLktleTtcbiAgcG9zOiBjZy5Qb3M7XG4gIHBpZWNlOiBjZy5QaWVjZTtcbn1cbmludGVyZmFjZSBBbmltUGllY2VzIHtcbiAgW2tleTogc3RyaW5nXTogQW5pbVBpZWNlXG59XG5cbmZ1bmN0aW9uIG1ha2VQaWVjZShrZXk6IGNnLktleSwgcGllY2U6IGNnLlBpZWNlKTogQW5pbVBpZWNlIHtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBwb3M6IHV0aWwua2V5MnBvcyhrZXkpLFxuICAgIHBpZWNlOiBwaWVjZVxuICB9O1xufVxuXG5mdW5jdGlvbiBjbG9zZXIocGllY2U6IEFuaW1QaWVjZSwgcGllY2VzOiBBbmltUGllY2VbXSk6IEFuaW1QaWVjZSB7XG4gIHJldHVybiBwaWVjZXMuc29ydCgocDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlU3EocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldlBpZWNlczogY2cuUGllY2VzLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3QgYW5pbXM6IEFuaW1WZWN0b3JzID0ge30sXG4gIGFuaW1lZE9yaWdzOiBjZy5LZXlbXSA9IFtdLFxuICBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IHt9LFxuICBtaXNzaW5nczogQW5pbVBpZWNlW10gPSBbXSxcbiAgbmV3czogQW5pbVBpZWNlW10gPSBbXSxcbiAgcHJlUGllY2VzOiBBbmltUGllY2VzID0ge307XG4gIGxldCBjdXJQOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCwgcHJlUDogQW5pbVBpZWNlIHwgdW5kZWZpbmVkLCBpOiBhbnksIHZlY3RvcjogY2cuTnVtYmVyUGFpcjtcbiAgZm9yIChpIGluIHByZXZQaWVjZXMpIHtcbiAgICBwcmVQaWVjZXNbaV0gPSBtYWtlUGllY2UoaSBhcyBjZy5LZXksIHByZXZQaWVjZXNbaV0hKTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLmFsbEtleXMpIHtcbiAgICBjdXJQID0gY3VycmVudC5waWVjZXNba2V5XTtcbiAgICBwcmVQID0gcHJlUGllY2VzW2tleV07XG4gICAgaWYgKGN1clApIHtcbiAgICAgIGlmIChwcmVQKSB7XG4gICAgICAgIGlmICghdXRpbC5zYW1lUGllY2UoY3VyUCwgcHJlUC5waWVjZSkpIHtcbiAgICAgICAgICBtaXNzaW5ncy5wdXNoKHByZVApO1xuICAgICAgICAgIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgIH0gZWxzZSBpZiAocHJlUCkgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgfVxuICBuZXdzLmZvckVhY2gobmV3UCA9PiB7XG4gICAgcHJlUCA9IGNsb3NlcihuZXdQLCBtaXNzaW5ncy5maWx0ZXIocCA9PiB1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkpO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICB2ZWN0b3IgPSBbcHJlUC5wb3NbMF0gLSBuZXdQLnBvc1swXSwgcHJlUC5wb3NbMV0gLSBuZXdQLnBvc1sxXV07XG4gICAgICBhbmltc1tuZXdQLmtleV0gPSB2ZWN0b3IuY29uY2F0KHZlY3RvcikgYXMgQW5pbVZlY3RvcjtcbiAgICAgIGFuaW1lZE9yaWdzLnB1c2gocHJlUC5rZXkpO1xuICAgIH1cbiAgfSk7XG4gIG1pc3NpbmdzLmZvckVhY2gocCA9PiB7XG4gICAgaWYgKCF1dGlsLmNvbnRhaW5zWChhbmltZWRPcmlncywgcC5rZXkpKSBmYWRpbmdzW3Aua2V5XSA9IHAucGllY2U7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgYW5pbXM6IGFuaW1zLFxuICAgIGZhZGluZ3M6IGZhZGluZ3NcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RlcChzdGF0ZTogU3RhdGUsIG5vdzogRE9NSGlnaFJlc1RpbWVTdGFtcCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudDtcbiAgaWYgKGN1ciA9PT0gdW5kZWZpbmVkKSB7IC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAobm93IC0gY3VyLnN0YXJ0KSAqIGN1ci5mcmVxdWVuY3k7XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGxldCBpIGluIGN1ci5wbGFuLmFuaW1zKSB7XG4gICAgICBjb25zdCBjZmcgPSBjdXIucGxhbi5hbmltc1tpXTtcbiAgICAgIGNmZ1syXSA9IGNmZ1swXSAqIGVhc2U7XG4gICAgICBjZmdbM10gPSBjZmdbMV0gKiBlYXNlO1xuICAgIH1cbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KHRydWUpOyAvLyBvcHRpbWlzYXRpb246IGRvbid0IHJlbmRlciBTVkcgY2hhbmdlcyBkdXJpbmcgYW5pbWF0aW9uc1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgobm93ID0gcGVyZm9ybWFuY2Uubm93KCkpID0+IHN0ZXAoc3RhdGUsIG5vdykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGU8QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUpOiBBIHtcbiAgLy8gY2xvbmUgc3RhdGUgYmVmb3JlIG11dGF0aW5nIGl0XG4gIGNvbnN0IHByZXZQaWVjZXM6IGNnLlBpZWNlcyA9IHsuLi5zdGF0ZS5waWVjZXN9O1xuXG4gIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgY29uc3QgcGxhbiA9IGNvbXB1dGVQbGFuKHByZXZQaWVjZXMsIHN0YXRlKTtcbiAgaWYgKCFpc09iamVjdEVtcHR5KHBsYW4uYW5pbXMpIHx8ICFpc09iamVjdEVtcHR5KHBsYW4uZmFkaW5ncykpIHtcbiAgICBjb25zdCBhbHJlYWR5UnVubmluZyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ICYmIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50LnN0YXJ0O1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgZnJlcXVlbmN5OiAxIC8gc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uLFxuICAgICAgcGxhbjogcGxhblxuICAgIH07XG4gICAgaWYgKCFhbHJlYWR5UnVubmluZykgc3RlcChzdGF0ZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvbid0IGFuaW1hdGUsIGp1c3QgcmVuZGVyIHJpZ2h0IGF3YXlcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNPYmplY3RFbXB0eShvOiBhbnkpOiBib29sZWFuIHtcbiAgZm9yIChsZXQgXyBpbiBvKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbmZ1bmN0aW9uIGVhc2luZyh0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgd3JpdGUgYXMgZmVuV3JpdGUgfSBmcm9tICcuL2ZlbidcbmltcG9ydCB7IENvbmZpZywgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgeyBhbmltLCByZW5kZXIgfSBmcm9tICcuL2FuaW0nXG5pbXBvcnQgeyBjYW5jZWwgYXMgZHJhZ0NhbmNlbCwgZHJhZ05ld1BpZWNlIH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0IHsgRHJhd1NoYXBlIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0IGV4cGxvc2lvbiBmcm9tICcuL2V4cGxvc2lvbidcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBpIHtcblxuICAvLyByZWNvbmZpZ3VyZSB0aGUgaW5zdGFuY2UuIEFjY2VwdHMgYWxsIGNvbmZpZyBvcHRpb25zLCBleGNlcHQgZm9yIHZpZXdPbmx5ICYgZHJhd2FibGUudmlzaWJsZS5cbiAgLy8gYm9hcmQgd2lsbCBiZSBhbmltYXRlZCBhY2NvcmRpbmdseSwgaWYgYW5pbWF0aW9ucyBhcmUgZW5hYmxlZC5cbiAgc2V0KGNvbmZpZzogQ29uZmlnKTogdm9pZDtcblxuICAvLyByZWFkIGNoZXNzZ3JvdW5kIHN0YXRlOyB3cml0ZSBhdCB5b3VyIG93biByaXNrcy5cbiAgc3RhdGU6IFN0YXRlO1xuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gYXMgYSBGRU4gc3RyaW5nIChvbmx5IGNvbnRhaW5zIHBpZWNlcywgbm8gZmxhZ3MpXG4gIC8vIGUuZy4gcm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUlxuICBnZXRGZW4oKTogY2cuRkVOO1xuXG4gIC8vIGNoYW5nZSB0aGUgdmlldyBhbmdsZVxuICB0b2dnbGVPcmllbnRhdGlvbigpOiB2b2lkO1xuXG4gIC8vIHBlcmZvcm0gYSBtb3ZlIHByb2dyYW1tYXRpY2FsbHlcbiAgbW92ZShvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IHZvaWQ7XG5cbiAgLy8gYWRkIGFuZC9vciByZW1vdmUgYXJiaXRyYXJ5IHBpZWNlcyBvbiB0aGUgYm9hcmRcbiAgc2V0UGllY2VzKHBpZWNlczogY2cuUGllY2VzRGlmZik6IHZvaWQ7XG5cbiAgLy8gY2xpY2sgYSBzcXVhcmUgcHJvZ3JhbW1hdGljYWxseVxuICBzZWxlY3RTcXVhcmUoa2V5OiBjZy5LZXkgfCBudWxsLCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHB1dCBhIG5ldyBwaWVjZSBvbiB0aGUgYm9hcmRcbiAgbmV3UGllY2UocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZW1vdmUoKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55XG4gIGNhbmNlbFByZW1vdmUoKTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlZHJvcCh2YWxpZGF0ZTogKGRyb3A6IGNnLkRyb3ApID0+IGJvb2xlYW4pOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnlcbiAgY2FuY2VsUHJlZHJvcCgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBtb3ZlIGJlaW5nIG1hZGVcbiAgY2FuY2VsTW92ZSgpOiB2b2lkO1xuXG4gIC8vIGNhbmNlbCBjdXJyZW50IG1vdmUgYW5kIHByZXZlbnQgZnVydGhlciBvbmVzXG4gIHN0b3AoKTogdm9pZDtcblxuICAvLyBtYWtlIHNxdWFyZXMgZXhwbG9kZSAoYXRvbWljIGNoZXNzKVxuICBleHBsb2RlKGtleXM6IGNnLktleVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgdXNlciBzaGFwZXNcbiAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyBhdXRvIHNoYXBlc1xuICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pOiB2b2lkO1xuXG4gIC8vIHNxdWFyZSBuYW1lIGF0IHRoaXMgRE9NIHBvc2l0aW9uIChsaWtlIFwiZTRcIilcbiAgZ2V0S2V5QXREb21Qb3MocG9zOiBjZy5OdW1iZXJQYWlyKTogY2cuS2V5IHwgdW5kZWZpbmVkO1xuXG4gIC8vIG9ubHkgdXNlZnVsIHdoZW4gQ1NTIGNoYW5nZXMgdGhlIGJvYXJkIHdpZHRoL2hlaWdodCByYXRpbyAoZm9yIDNEKVxuICByZWRyYXdBbGw6IGNnLlJlZHJhdztcblxuICAvLyBmb3IgY3Jhenlob3VzZSBhbmQgYm9hcmQgZWRpdG9yc1xuICBkcmFnTmV3UGllY2UocGllY2U6IGNnLlBpZWNlLCBldmVudDogY2cuTW91Y2hFdmVudCwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyB1bmJpbmRzIGFsbCBldmVudHNcbiAgLy8gKGltcG9ydGFudCBmb3IgZG9jdW1lbnQtd2lkZSBldmVudHMgbGlrZSBzY3JvbGwgYW5kIG1vdXNlbW92ZSlcbiAgZGVzdHJveTogY2cuVW5iaW5kXG59XG5cbi8vIHNlZSBBUEkgdHlwZXMgYW5kIGRvY3VtZW50YXRpb25zIGluIGR0cy9hcGkuZC50c1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgcmVkcmF3QWxsOiBjZy5SZWRyYXcpOiBBcGkge1xuXG4gIGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKCkge1xuICAgIGJvYXJkLnRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlKTtcbiAgICByZWRyYXdBbGwoKTtcbiAgfTtcblxuICByZXR1cm4ge1xuXG4gICAgc2V0KGNvbmZpZykge1xuICAgICAgaWYgKGNvbmZpZy5vcmllbnRhdGlvbiAmJiBjb25maWcub3JpZW50YXRpb24gIT09IHN0YXRlLm9yaWVudGF0aW9uKSB0b2dnbGVPcmllbnRhdGlvbigpO1xuICAgICAgKGNvbmZpZy5mZW4gPyBhbmltIDogcmVuZGVyKShzdGF0ZSA9PiBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RhdGUsXG5cbiAgICBnZXRGZW46ICgpID0+IGZlbldyaXRlKHN0YXRlLnBpZWNlcyksXG5cbiAgICB0b2dnbGVPcmllbnRhdGlvbixcblxuICAgIHNldFBpZWNlcyhwaWVjZXMpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNlbGVjdFNxdWFyZShrZXksIGZvcmNlKSB7XG4gICAgICBpZiAoa2V5KSBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwga2V5LCBmb3JjZSksIHN0YXRlKTtcbiAgICAgIGVsc2UgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHN0YXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3ZlKG9yaWcsIGRlc3QpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIG5ld1BpZWNlKHBpZWNlLCBrZXkpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwga2V5KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBwbGF5UHJlbW92ZSgpIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGFuaW0oYm9hcmQucGxheVByZW1vdmUsIHN0YXRlKSkgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSBwcmVtb3ZlIGNvdWxkbid0IGJlIHBsYXllZCwgcmVkcmF3IHRvIGNsZWFyIGl0IHVwXG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgcGxheVByZWRyb3AodmFsaWRhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBib2FyZC5wbGF5UHJlZHJvcChzdGF0ZSwgdmFsaWRhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZW1vdmUoKSB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVtb3ZlLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbFByZWRyb3AoKSB7XG4gICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE1vdmUoKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4geyBib2FyZC5jYW5jZWxNb3ZlKHN0YXRlKTsgZHJhZ0NhbmNlbChzdGF0ZSk7IH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc3RvcCgpIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiB7IGJvYXJkLnN0b3Aoc3RhdGUpOyBkcmFnQ2FuY2VsKHN0YXRlKTsgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBleHBsb2RlKGtleXM6IGNnLktleVtdKSB7XG4gICAgICBleHBsb3Npb24oc3RhdGUsIGtleXMpO1xuICAgIH0sXG5cbiAgICBzZXRBdXRvU2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiBzdGF0ZS5kcmF3YWJsZS5hdXRvU2hhcGVzID0gc2hhcGVzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gc2hhcGVzLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGdldEtleUF0RG9tUG9zKHBvcykge1xuICAgICAgcmV0dXJuIGJvYXJkLmdldEtleUF0RG9tUG9zKHBvcywgYm9hcmQud2hpdGVQb3Yoc3RhdGUpLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgIH0sXG5cbiAgICByZWRyYXdBbGwsXG5cbiAgICBkcmFnTmV3UGllY2UocGllY2UsIGV2ZW50LCBmb3JjZSkge1xuICAgICAgZHJhZ05ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZXZlbnQsIGZvcmNlKVxuICAgIH0sXG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICBzdGF0ZS5kb20udW5iaW5kICYmIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHBvczJrZXksIGtleTJwb3MsIG9wcG9zaXRlLCBjb250YWluc1ggfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgcHJlbW92ZSBmcm9tICcuL3ByZW1vdmUnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBDYWxsYmFjayA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb24oZjogQ2FsbGJhY2sgfCB1bmRlZmluZWQsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgc3RhdGUuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubGFzdE1vdmUgPSB1bmRlZmluZWQ7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpZWNlcyhzdGF0ZTogU3RhdGUsIHBpZWNlczogY2cuUGllY2VzRGlmZik6IHZvaWQge1xuICBmb3IgKGxldCBrZXkgaW4gcGllY2VzKSB7XG4gICAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgICBpZiAocGllY2UpIHN0YXRlLnBpZWNlc1trZXldID0gcGllY2U7XG4gICAgZWxzZSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrKHN0YXRlOiBTdGF0ZSwgY29sb3I6IGNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbG9yID09PSB0cnVlKSBjb2xvciA9IHN0YXRlLnR1cm5Db2xvcjtcbiAgaWYgKGNvbG9yKSBmb3IgKGxldCBrIGluIHN0YXRlLnBpZWNlcykge1xuICAgIGlmIChzdGF0ZS5waWVjZXNba10hLnJvbGUgPT09ICdraW5nJyAmJiBzdGF0ZS5waWVjZXNba10hLmNvbG9yID09PSBjb2xvcikge1xuICAgICAgc3RhdGUuY2hlY2sgPSBrIGFzIGNnLktleTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlbW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhOiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpOiB2b2lkIHtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gW29yaWcsIGRlc3RdO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnNldCwgb3JpZywgZGVzdCwgbWV0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UHJlZHJvcChzdGF0ZTogU3RhdGUsIHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5KTogdm9pZCB7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50ID0geyByb2xlLCBrZXkgfTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVkcm9wcGFibGUuZXZlbnRzLnNldCwgcm9sZSwga2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlZHJvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgcGQgPSBzdGF0ZS5wcmVkcm9wcGFibGU7XG4gIGlmIChwZC5jdXJyZW50KSB7XG4gICAgcGQuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHBkLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJ5QXV0b0Nhc3RsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmICghc3RhdGUuYXV0b0Nhc3RsZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBraW5nID0gc3RhdGUucGllY2VzW29yaWddO1xuICBpZiAoIWtpbmcgfHwga2luZy5yb2xlICE9PSAna2luZycpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZ1BvcyA9IGtleTJwb3Mob3JpZyk7XG4gIGlmIChvcmlnUG9zWzBdICE9PSA1KSByZXR1cm4gZmFsc2U7XG4gIGlmIChvcmlnUG9zWzFdICE9PSAxICYmIG9yaWdQb3NbMV0gIT09IDgpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgZGVzdFBvcyA9IGtleTJwb3MoZGVzdCk7XG4gIGxldCBvbGRSb29rUG9zLCBuZXdSb29rUG9zLCBuZXdLaW5nUG9zO1xuICBpZiAoZGVzdFBvc1swXSA9PT0gNyB8fCBkZXN0UG9zWzBdID09PSA4KSB7XG4gICAgb2xkUm9va1BvcyA9IHBvczJrZXkoWzgsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdSb29rUG9zID0gcG9zMmtleShbNiwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld0tpbmdQb3MgPSBwb3Mya2V5KFs3LCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSBpZiAoZGVzdFBvc1swXSA9PT0gMyB8fCBkZXN0UG9zWzBdID09PSAxKSB7XG4gICAgb2xkUm9va1BvcyA9IHBvczJrZXkoWzEsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdSb29rUG9zID0gcG9zMmtleShbNCwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld0tpbmdQb3MgPSBwb3Mya2V5KFszLCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSByZXR1cm4gZmFsc2U7XG5cbiAgY29uc3Qgcm9vayA9IHN0YXRlLnBpZWNlc1tvbGRSb29rUG9zXTtcbiAgaWYgKCFyb29rIHx8IHJvb2sucm9sZSAhPT0gJ3Jvb2snKSByZXR1cm4gZmFsc2U7XG5cbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvbGRSb29rUG9zXTtcblxuICBzdGF0ZS5waWVjZXNbbmV3S2luZ1Bvc10gPSBraW5nXG4gIHN0YXRlLnBpZWNlc1tuZXdSb29rUG9zXSA9IHJvb2s7XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZU1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IG9yaWdQaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXSwgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzW2Rlc3RdO1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkID0gKGRlc3RQaWVjZSAmJiBkZXN0UGllY2UuY29sb3IgIT09IG9yaWdQaWVjZS5jb2xvcikgPyBkZXN0UGllY2UgOiB1bmRlZmluZWQ7XG4gIGlmIChkZXN0ID09IHN0YXRlLnNlbGVjdGVkKSB1bnNlbGVjdChzdGF0ZSk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLm1vdmUsIG9yaWcsIGRlc3QsIGNhcHR1cmVkKTtcbiAgaWYgKCF0cnlBdXRvQ2FzdGxlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHN0YXRlLnBpZWNlc1tkZXN0XSA9IG9yaWdQaWVjZTtcbiAgICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICB9XG4gIHN0YXRlLmxhc3RNb3ZlID0gW29yaWcsIGRlc3RdO1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgcmV0dXJuIGNhcHR1cmVkIHx8IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5LCBmb3JjZT86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgaWYgKHN0YXRlLnBpZWNlc1trZXldKSB7XG4gICAgaWYgKGZvcmNlKSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcE5ld1BpZWNlLCBwaWVjZSwga2V5KTtcbiAgc3RhdGUucGllY2VzW2tleV0gPSBwaWVjZTtcbiAgc3RhdGUubGFzdE1vdmUgPSBba2V5XTtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXNlVXNlck1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGNnLlBpZWNlIHwgYm9vbGVhbiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlck1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IGhvbGRUaW1lID0gc3RhdGUuaG9sZC5zdG9wKCk7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjb25zdCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhID0ge1xuICAgICAgICBwcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleSxcbiAgICAgICAgaG9sZFRpbWVcbiAgICAgIH07XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSBtZXRhZGF0YS5jYXB0dXJlZCA9IHJlc3VsdDtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIG1ldGFkYXRhKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QsIHtcbiAgICAgIGN0cmxLZXk6IHN0YXRlLnN0YXRzLmN0cmxLZXlcbiAgICB9KTtcbiAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBmb3JjZSkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddITtcbiAgICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICAgIGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRlc3QsIGZvcmNlKTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyTmV3UGllY2UsIHBpZWNlLnJvbGUsIGRlc3QsIHtcbiAgICAgIHByZWRyb3A6IGZhbHNlXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBzdGF0ZS5waWVjZXNbb3JpZ10hLnJvbGUsIGRlc3QpO1xuICB9IGVsc2Uge1xuICAgIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gICAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgfVxuICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoc3RhdGU6IFN0YXRlLCBrZXk6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnNlbGVjdCwga2V5KTtcbiAgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkID09PSBrZXkgJiYgIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkKSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBzdGF0ZS5ob2xkLmNhbmNlbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiYgc3RhdGUuc2VsZWN0ZWQgIT09IGtleSkge1xuICAgICAgaWYgKHVzZXJNb3ZlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCwga2V5KSkge1xuICAgICAgICBzdGF0ZS5zdGF0cy5kcmFnZ2VkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGlzTW92YWJsZShzdGF0ZSwga2V5KSB8fCBpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgICBzdGF0ZS5ob2xkLnN0YXJ0KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHN0YXRlOiBTdGF0ZSwga2V5OiBjZy5LZXkpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPSBrZXk7XG4gIGlmIChpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gcHJlbW92ZShzdGF0ZS5waWVjZXMsIGtleSwgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpO1xuICB9XG4gIGVsc2Ugc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2VsZWN0KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5zZWxlY3RlZCA9IHVuZGVmaW5lZDtcbiAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuaG9sZC5jYW5jZWwoKTtcbn1cblxuZnVuY3Rpb24gaXNNb3ZhYmxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ2JvdGgnIHx8IChcbiAgICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3JcbiAgICApKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbk1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3JpZyAhPT0gZGVzdCAmJiBpc01vdmFibGUoc3RhdGUsIG9yaWcpICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmZyZWUgfHwgKCEhc3RhdGUubW92YWJsZS5kZXN0cyAmJiBjb250YWluc1goc3RhdGUubW92YWJsZS5kZXN0c1tvcmlnXSwgZGVzdCkpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNhbkRyb3Aoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgZGVzdCAmJiAob3JpZyA9PT0gZGVzdCB8fCAhc3RhdGUucGllY2VzW2Rlc3RdKSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ2JvdGgnIHx8IChcbiAgICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3JcbiAgICApKTtcbn1cblxuXG5mdW5jdGlvbiBpc1ByZW1vdmFibGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3JpZyAhPT0gZGVzdCAmJlxuICBpc1ByZW1vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gIGNvbnRhaW5zWChwcmVtb3ZlKHN0YXRlLnBpZWNlcywgb3JpZywgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gY2FuUHJlZHJvcChzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICBjb25zdCBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXNbZGVzdF07XG4gIHJldHVybiAhIXBpZWNlICYmIGRlc3QgJiZcbiAgKCFkZXN0UGllY2UgfHwgZGVzdFBpZWNlLmNvbG9yICE9PSBzdGF0ZS5tb3ZhYmxlLmNvbG9yKSAmJlxuICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAocGllY2Uucm9sZSAhPT0gJ3Bhd24nIHx8IChkZXN0WzFdICE9PSAnMScgJiYgZGVzdFsxXSAhPT0gJzgnKSkgJiZcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICBzdGF0ZS50dXJuQ29sb3IgIT09IHBpZWNlLmNvbG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEcmFnZ2FibGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiYgKFxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZFxuICAgICAgKVxuICAgIClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtb3ZlID0gc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZyA9IG1vdmVbMF0sIGRlc3QgPSBtb3ZlWzFdO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1vdmU6IHRydWUgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZWRyb3Aoc3RhdGU6IFN0YXRlLCB2YWxpZGF0ZTogKGRyb3A6IGNnLkRyb3ApID0+IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgbGV0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCxcbiAgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoIWRyb3ApIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkYXRlKGRyb3ApKSB7XG4gICAgY29uc3QgcGllY2UgPSB7XG4gICAgICByb2xlOiBkcm9wLnJvbGUsXG4gICAgICBjb2xvcjogc3RhdGUubW92YWJsZS5jb2xvclxuICAgIH0gYXMgY2cuUGllY2U7XG4gICAgaWYgKGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRyb3Aua2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlck5ld1BpZWNlLCBkcm9wLnJvbGUsIGRyb3Aua2V5LCB7XG4gICAgICAgIHByZWRyb3A6IHRydWVcbiAgICAgIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZShzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9XG4gIHN0YXRlLm1vdmFibGUuZGVzdHMgPVxuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZShzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhwb3M6IGNnLk51bWJlclBhaXIsIGFzV2hpdGU6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IGNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5jZWlsKDggKiAoKHBvc1swXSAtIGJvdW5kcy5sZWZ0KSAvIGJvdW5kcy53aWR0aCkpO1xuICBpZiAoIWFzV2hpdGUpIGZpbGUgPSA5IC0gZmlsZTtcbiAgbGV0IHJhbmsgPSBNYXRoLmNlaWwoOCAtICg4ICogKChwb3NbMV0gLSBib3VuZHMudG9wKSAvIGJvdW5kcy5oZWlnaHQpKSk7XG4gIGlmICghYXNXaGl0ZSkgcmFuayA9IDkgLSByYW5rO1xuICByZXR1cm4gKGZpbGUgPiAwICYmIGZpbGUgPCA5ICYmIHJhbmsgPiAwICYmIHJhbmsgPCA5KSA/IHBvczJrZXkoW2ZpbGUsIHJhbmtdKSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdoaXRlUG92KHM6IFN0YXRlKTogYm9vbGVhbiB7XG4gIHJldHVybiBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnO1xufVxuIiwiaW1wb3J0IHsgQXBpLCBzdGFydCB9IGZyb20gJy4vYXBpJ1xuaW1wb3J0IHsgQ29uZmlnLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IFN0YXRlLCBkZWZhdWx0cyB9IGZyb20gJy4vc3RhdGUnXG5cbmltcG9ydCByZW5kZXJXcmFwIGZyb20gJy4vd3JhcCc7XG5pbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnLi9ldmVudHMnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJztcbmltcG9ydCAqIGFzIHN2ZyBmcm9tICcuL3N2Zyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVzc2dyb3VuZChlbGVtZW50OiBIVE1MRWxlbWVudCwgY29uZmlnPzogQ29uZmlnKTogQXBpIHtcblxuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG5cbiAgY29uZmlndXJlKHN0YXRlLCBjb25maWcgfHwge30pO1xuXG4gIGZ1bmN0aW9uIHJlZHJhd0FsbCgpIHtcbiAgICBsZXQgcHJldlVuYmluZCA9IHN0YXRlLmRvbSAmJiBzdGF0ZS5kb20udW5iaW5kO1xuICAgIC8vIGNvbXB1dGUgYm91bmRzIGZyb20gZXhpc3RpbmcgYm9hcmQgZWxlbWVudCBpZiBwb3NzaWJsZVxuICAgIC8vIHRoaXMgYWxsb3dzIG5vbi1zcXVhcmUgYm9hcmRzIGZyb20gQ1NTIHRvIGJlIGhhbmRsZWQgKGZvciAzRClcbiAgICBjb25zdCByZWxhdGl2ZSA9IHN0YXRlLnZpZXdPbmx5ICYmICFzdGF0ZS5kcmF3YWJsZS52aXNpYmxlLFxuICAgIGVsZW1lbnRzID0gcmVuZGVyV3JhcChlbGVtZW50LCBzdGF0ZSwgcmVsYXRpdmUpLFxuICAgIGJvdW5kcyA9IHV0aWwubWVtbygoKSA9PiBlbGVtZW50cy5ib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSksXG4gICAgcmVkcmF3Tm93ID0gKHNraXBTdmc/OiBib29sZWFuKSA9PiB7XG4gICAgICByZW5kZXIoc3RhdGUpO1xuICAgICAgaWYgKCFza2lwU3ZnICYmIGVsZW1lbnRzLnN2Zykgc3ZnLnJlbmRlclN2ZyhzdGF0ZSwgZWxlbWVudHMuc3ZnKTtcbiAgICB9O1xuICAgIHN0YXRlLmRvbSA9IHtcbiAgICAgIGVsZW1lbnRzLFxuICAgICAgYm91bmRzLFxuICAgICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdOb3cpLFxuICAgICAgcmVkcmF3Tm93LFxuICAgICAgdW5iaW5kOiBwcmV2VW5iaW5kLFxuICAgICAgcmVsYXRpdmVcbiAgICB9O1xuICAgIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gJyc7XG4gICAgcmVkcmF3Tm93KGZhbHNlKTtcbiAgICBldmVudHMuYmluZEJvYXJkKHN0YXRlKTtcbiAgICBpZiAoIXByZXZVbmJpbmQpIHN0YXRlLmRvbS51bmJpbmQgPSBldmVudHMuYmluZERvY3VtZW50KHN0YXRlLCByZWRyYXdBbGwpO1xuICAgIHN0YXRlLmV2ZW50cy5pbnNlcnQgJiYgc3RhdGUuZXZlbnRzLmluc2VydChlbGVtZW50cyk7XG4gIH1cbiAgcmVkcmF3QWxsKCk7XG5cbiAgcmV0dXJuIHN0YXJ0KHN0YXRlLCByZWRyYXdBbGwpO1xufTtcblxuZnVuY3Rpb24gZGVib3VuY2VSZWRyYXcocmVkcmF3Tm93OiAoc2tpcFN2Zz86IGJvb2xlYW4pID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgbGV0IHJlZHJhd2luZyA9IGZhbHNlO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmIChyZWRyYXdpbmcpIHJldHVybjtcbiAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICByZWRyYXdOb3coKTtcbiAgICAgIHJlZHJhd2luZyA9IGZhbHNlO1xuICAgIH0pO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgc2V0Q2hlY2ssIHNldFNlbGVjdGVkIH0gZnJvbSAnLi9ib2FyZCdcbmltcG9ydCB7IHJlYWQgYXMgZmVuUmVhZCB9IGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgRHJhd1NoYXBlLCBEcmF3QnJ1c2ggfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gIGZlbj86IGNnLkZFTjsgLy8gY2hlc3MgcG9zaXRpb24gaW4gRm9yc3l0aCBub3RhdGlvblxuICBvcmllbnRhdGlvbj86IGNnLkNvbG9yOyAvLyBib2FyZCBvcmllbnRhdGlvbi4gd2hpdGUgfCBibGFja1xuICB0dXJuQ29sb3I/OiBjZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiB3aGl0ZSB8IGJsYWNrXG4gIGNoZWNrPzogY2cuQ29sb3IgfCBib29sZWFuOyAvLyB0cnVlIGZvciBjdXJyZW50IGNvbG9yLCBmYWxzZSB0byB1bnNldFxuICBsYXN0TW92ZT86IGNnLktleVtdOyAvLyBzcXVhcmVzIHBhcnQgb2YgdGhlIGxhc3QgbW92ZSBbXCJjM1wiLCBcImM0XCJdXG4gIHNlbGVjdGVkPzogY2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiYTFcIlxuICBjb29yZGluYXRlcz86IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgYXV0b0Nhc3RsZT86IGJvb2xlYW47IC8vIGltbWVkaWF0ZWx5IGNvbXBsZXRlIHRoZSBjYXN0bGUgYnkgbW92aW5nIHRoZSByb29rIGFmdGVyIGtpbmcgbW92ZVxuICB2aWV3T25seT86IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIGRpc2FibGVDb250ZXh0TWVudT86IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgY2hlc3Nib2FyZFxuICByZXNpemFibGU/OiBib29sZWFuOyAvLyBsaXN0ZW5zIHRvIGNoZXNzZ3JvdW5kLnJlc2l6ZSBvbiBkb2N1bWVudC5ib2R5IHRvIGNsZWFyIGJvdW5kcyBjYWNoZVxuICBhZGRQaWVjZVpJbmRleD86IGJvb2xlYW47IC8vIGFkZHMgei1pbmRleCB2YWx1ZXMgdG8gcGllY2VzIChmb3IgM0QpXG4gIC8vIHBpZWNlS2V5OiBib29sZWFuOyAvLyBhZGQgYSBkYXRhLWtleSBhdHRyaWJ1dGUgdG8gcGllY2UgZWxlbWVudHNcbiAgaGlnaGxpZ2h0Pzoge1xuICAgIGxhc3RNb3ZlPzogYm9vbGVhbjsgLy8gYWRkIGxhc3QtbW92ZSBjbGFzcyB0byBzcXVhcmVzXG4gICAgY2hlY2s/OiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb24/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47XG4gICAgZHVyYXRpb24/OiBudW1iZXI7XG4gIH07XG4gIG1vdmFibGU/OiB7XG4gICAgZnJlZT86IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBjb2xvcj86IGNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlLiB3aGl0ZSB8IGJsYWNrIHwgYm90aCB8IHVuZGVmaW5lZFxuICAgIGRlc3RzPzoge1xuICAgICAgW2tleTogc3RyaW5nXTogY2cuS2V5W11cbiAgICB9OyAvLyB2YWxpZCBtb3Zlcy4ge1wiYTJcIiBbXCJhM1wiIFwiYTRcIl0gXCJiMVwiIFtcImEzXCIgXCJjM1wiXX1cbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM/OiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgICAgYWZ0ZXJOZXdQaWVjZT86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIGEgbmV3IHBpZWNlIGlzIGRyb3BwZWQgb24gdGhlIGJvYXJkXG4gICAgfTtcbiAgICByb29rQ2FzdGxlPzogYm9vbGVhbiAvLyBjYXN0bGUgYnkgbW92aW5nIHRoZSBraW5nIHRvIHRoZSByb29rXG4gIH07XG4gIHByZW1vdmFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBwcmVtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGNhc3RsZT86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWxsb3cga2luZyBjYXN0bGUgcHJlbW92ZXNcbiAgICBkZXN0cz86IGNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YT86IGNnLlNldFByZW1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVtb3ZlIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBwcmVkcm9wcGFibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIGV2ZW50cz86IHtcbiAgICAgIHNldD86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIGRyYWdnYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgbW92ZXMgJiBwcmVtb3ZlcyB0byB1c2UgZHJhZyduIGRyb3BcbiAgICBkaXN0YW5jZT86IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZT86IGJvb2xlYW47IC8vIGxldHMgY2hlc3Nncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIGNlbnRlclBpZWNlPzogYm9vbGVhbjsgLy8gY2VudGVyIHRoZSBwaWVjZSBvbiBjdXJzb3IgYXQgZHJhZyBzdGFydFxuICAgIHNob3dHaG9zdD86IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIGRlbGV0ZU9uRHJvcE9mZj86IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkXG4gIH07XG4gIHNlbGVjdGFibGU/OiB7XG4gICAgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGVuYWJsZWQ/OiBib29sZWFuXG4gIH07XG4gIGV2ZW50cz86IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIC8vIGNhbGxlZCBhZnRlciBhIHBpZWNlIGhhcyBiZWVuIG1vdmVkLlxuICAgIC8vIGNhcHR1cmVkUGllY2UgaXMgdW5kZWZpbmVkIG9yIGxpa2Uge2NvbG9yOiAnd2hpdGUnOyAncm9sZSc6ICdxdWVlbid9XG4gICAgbW92ZT86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgY2FwdHVyZWRQaWVjZT86IGNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3BOZXdQaWVjZT86IChwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5KSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IGNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICBpbnNlcnQ/OiAoZWxlbWVudHM6IGNnLkVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICAgIHZpc2libGU/OiBib29sZWFuOyAvLyBjYW4gdmlld1xuICAgIGVyYXNlT25DbGljaz86IGJvb2xlYW47XG4gICAgc2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgYXV0b1NoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIGJydXNoZXM/OiBEcmF3QnJ1c2hbXTtcbiAgICBwaWVjZXM/OiB7XG4gICAgICBiYXNlVXJsPzogc3RyaW5nO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlKHN0YXRlOiBTdGF0ZSwgY29uZmlnOiBDb25maWcpIHtcblxuICAvLyBkb24ndCBtZXJnZSBkZXN0aW5hdGlvbnMuIEp1c3Qgb3ZlcnJpZGUuXG4gIGlmIChjb25maWcubW92YWJsZSAmJiBjb25maWcubW92YWJsZS5kZXN0cykgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcblxuICBtZXJnZShzdGF0ZSwgY29uZmlnKTtcblxuICAvLyBpZiBhIGZlbiB3YXMgcHJvdmlkZWQsIHJlcGxhY2UgdGhlIHBpZWNlc1xuICBpZiAoY29uZmlnLmZlbikge1xuICAgIHN0YXRlLnBpZWNlcyA9IGZlblJlYWQoY29uZmlnLmZlbik7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gIH1cblxuICAvLyBhcHBseSBjb25maWcgdmFsdWVzIHRoYXQgY291bGQgYmUgdW5kZWZpbmVkIHlldCBtZWFuaW5nZnVsXG4gIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoJ2NoZWNrJykpIHNldENoZWNrKHN0YXRlLCBjb25maWcuY2hlY2sgfHwgZmFsc2UpO1xuICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KCdsYXN0TW92ZScpICYmICFjb25maWcubGFzdE1vdmUpIHN0YXRlLmxhc3RNb3ZlID0gdW5kZWZpbmVkO1xuICAvLyBpbiBjYXNlIG9mIFpIIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgLy8gaWYgdGhlIHByZXZpb3VzIGxhc3QgbW92ZSBoYWQgdHdvIHNxdWFyZXMsXG4gIC8vIHRoZSBtZXJnZSBhbGdvcml0aG0gd2lsbCBpbmNvcnJlY3RseSBrZWVwIHRoZSBzZWNvbmQgc3F1YXJlLlxuICBlbHNlIGlmIChjb25maWcubGFzdE1vdmUpIHN0YXRlLmxhc3RNb3ZlID0gY29uZmlnLmxhc3RNb3ZlO1xuXG4gIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgaWYgKHN0YXRlLnNlbGVjdGVkKSBzZXRTZWxlY3RlZChzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQpO1xuXG4gIC8vIG5vIG5lZWQgZm9yIHN1Y2ggc2hvcnQgYW5pbWF0aW9uc1xuICBpZiAoIXN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiB8fCBzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gPCAxMDApIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID0gZmFsc2U7XG5cbiAgaWYgKCFzdGF0ZS5tb3ZhYmxlLnJvb2tDYXN0bGUgJiYgc3RhdGUubW92YWJsZS5kZXN0cykge1xuICAgIGNvbnN0IHJhbmsgPSBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnd2hpdGUnID8gMSA6IDgsXG4gICAga2luZ1N0YXJ0UG9zID0gJ2UnICsgcmFuayxcbiAgICBkZXN0cyA9IHN0YXRlLm1vdmFibGUuZGVzdHNba2luZ1N0YXJ0UG9zXSxcbiAgICBraW5nID0gc3RhdGUucGllY2VzW2tpbmdTdGFydFBvc107XG4gICAgaWYgKCFkZXN0cyB8fCAha2luZyB8fCBraW5nLnJvbGUgIT09ICdraW5nJykgcmV0dXJuO1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHNba2luZ1N0YXJ0UG9zXSA9IGRlc3RzLmZpbHRlcihkID0+XG4gICAgICAhKChkID09PSAnYScgKyByYW5rKSAmJiBkZXN0cy5pbmRleE9mKCdjJyArIHJhbmsgYXMgY2cuS2V5KSAhPT0gLTEpICYmXG4gICAgICAgICEoKGQgPT09ICdoJyArIHJhbmspICYmIGRlc3RzLmluZGV4T2YoJ2cnICsgcmFuayBhcyBjZy5LZXkpICE9PSAtMSlcbiAgICApO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtZXJnZShiYXNlOiBhbnksIGV4dGVuZDogYW55KSB7XG4gIGZvciAobGV0IGtleSBpbiBleHRlbmQpIHtcbiAgICBpZiAoaXNPYmplY3QoYmFzZVtrZXldKSAmJiBpc09iamVjdChleHRlbmRba2V5XSkpIG1lcmdlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xuICAgIGVsc2UgYmFzZVtrZXldID0gZXh0ZW5kW2tleV07XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNPYmplY3QobzogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCc7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBjbGVhciBhcyBkcmF3Q2xlYXIgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbSdcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnQ3VycmVudCB7XG4gIG9yaWc6IGNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhZ2dpbmcgcGllY2VcbiAgb3JpZ1BvczogY2cuUG9zO1xuICBwaWVjZTogY2cuUGllY2U7XG4gIHJlbDogY2cuTnVtYmVyUGFpcjsgLy8geDsgeSBvZiB0aGUgcGllY2UgYXQgb3JpZ2luYWwgcG9zaXRpb25cbiAgZXBvczogY2cuTnVtYmVyUGFpcjsgLy8gaW5pdGlhbCBldmVudCBwb3NpdGlvblxuICBwb3M6IGNnLk51bWJlclBhaXI7IC8vIHJlbGF0aXZlIGN1cnJlbnQgcG9zaXRpb25cbiAgZGVjOiBjZy5OdW1iZXJQYWlyOyAvLyBwaWVjZSBjZW50ZXIgZGVjYXlcbiAgc3RhcnRlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgc3RhcnRlZDsgYXMgcGVyIHRoZSBkaXN0YW5jZSBzZXR0aW5nXG4gIGVsZW1lbnQ6IGNnLlBpZWNlTm9kZSB8ICgoKSA9PiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQpO1xuICBuZXdQaWVjZT86IGJvb2xlYW47IC8vIGl0IGl0IGEgbmV3IHBpZWNlIGZyb20gb3V0c2lkZSB0aGUgYm9hcmRcbiAgZm9yY2U/OiBib29sZWFuOyAvLyBjYW4gdGhlIG5ldyBwaWVjZSByZXBsYWNlIGFuIGV4aXN0aW5nIG9uZSAoZWRpdG9yKVxuICBwcmV2aW91c2x5U2VsZWN0ZWQ/OiBjZy5LZXk7XG4gIG9yaWdpblRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApIHJldHVybjsgLy8gb25seSB0b3VjaCBvciBsZWZ0IGNsaWNrXG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzKCksXG4gIHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXIsXG4gIG9yaWcgPSBib2FyZC5nZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgYm9hcmQud2hpdGVQb3YocyksIGJvdW5kcyk7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBjb25zdCBwaWVjZSA9IHMucGllY2VzW29yaWddO1xuICBjb25zdCBwcmV2aW91c2x5U2VsZWN0ZWQgPSBzLnNlbGVjdGVkO1xuICBpZiAoIXByZXZpb3VzbHlTZWxlY3RlZCAmJiBzLmRyYXdhYmxlLmVuYWJsZWQgJiYgKFxuICAgIHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrIHx8ICghcGllY2UgfHwgcGllY2UuY29sb3IgIT09IHMudHVybkNvbG9yKVxuICApKSBkcmF3Q2xlYXIocyk7XG4gIC8vIFByZXZlbnQgdG91Y2ggc2Nyb2xsIGFuZCBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudCwgaWYgdGhlcmVcbiAgLy8gaXMgYW4gaW50ZW50IHRvIGludGVyYWN0IHdpdGggdGhlIGJvYXJkLiBJZiBubyBjb2xvciBpcyBtb3ZhYmxlXG4gIC8vIChhbmQgdGhlIGJvYXJkIGlzIG5vdCBmb3Igdmlld2luZyBvbmx5KSwgdG91Y2hlcyBhcmUgbGlrZWx5IGludGVuZGVkIHRvXG4gIC8vIHNlbGVjdCBzcXVhcmVzLlxuICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSAmJlxuICAgICAgKCFlLnRvdWNoZXMgfHwgIXMubW92YWJsZS5jb2xvciB8fCBwaWVjZSB8fCBwcmV2aW91c2x5U2VsZWN0ZWQgfHwgcGllY2VDbG9zZVRvKHMsIHBvc2l0aW9uKSkpXG4gICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICBpZiAocy5zZWxlY3RlZCAmJiBib2FyZC5jYW5Nb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIG9yaWcpLCBzKTtcbiAgfSBlbHNlIHtcbiAgICBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gIH1cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWc7XG4gIGNvbnN0IGVsZW1lbnQgPSBwaWVjZUVsZW1lbnRCeUtleShzLCBvcmlnKTtcbiAgaWYgKHBpZWNlICYmIGVsZW1lbnQgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBvcmlnKSkge1xuICAgIGNvbnN0IHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMob3JpZywgYm9hcmQud2hpdGVQb3YocyksIGJvdW5kcyk7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIG9yaWcsXG4gICAgICBvcmlnUG9zOiB1dGlsLmtleTJwb3Mob3JpZyksXG4gICAgICBwaWVjZSxcbiAgICAgIHJlbDogcG9zaXRpb24sXG4gICAgICBlcG9zOiBwb3NpdGlvbixcbiAgICAgIHBvczogWzAsIDBdLFxuICAgICAgZGVjOiBzLmRyYWdnYWJsZS5jZW50ZXJQaWVjZSA/IFtcbiAgICAgICAgcG9zaXRpb25bMF0gLSAoc3F1YXJlQm91bmRzLmxlZnQgKyBzcXVhcmVCb3VuZHMud2lkdGggLyAyKSxcbiAgICAgICAgcG9zaXRpb25bMV0gLSAoc3F1YXJlQm91bmRzLnRvcCArIHNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyKVxuICAgICAgXSA6IFswLCAwXSxcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiBzLnN0YXRzLmRyYWdnZWQsXG4gICAgICBlbGVtZW50LFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldFxuICAgIH07XG4gICAgZWxlbWVudC5jZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG4gICAgLy8gcGxhY2UgZ2hvc3RcbiAgICBjb25zdCBnaG9zdCA9IHMuZG9tLmVsZW1lbnRzLmdob3N0O1xuICAgIGlmIChnaG9zdCkge1xuICAgICAgZ2hvc3QuY2xhc3NOYW1lID0gYGdob3N0ICR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xuICAgICAgdXRpbC50cmFuc2xhdGVBYnMoZ2hvc3QsIHV0aWwucG9zVG9UcmFuc2xhdGVBYnMoYm91bmRzKSh1dGlsLmtleTJwb3Mob3JpZyksIGJvYXJkLndoaXRlUG92KHMpKSk7XG4gICAgICB1dGlsLnNldFZpc2libGUoZ2hvc3QsIHRydWUpO1xuICAgIH1cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWVjZUNsb3NlVG8oczogU3RhdGUsIHBvczogY2cuTnVtYmVyUGFpcik6IGJvb2xlYW4ge1xuICBjb25zdCBhc1doaXRlID0gYm9hcmQud2hpdGVQb3YocyksXG4gIGJvdW5kcyA9IHMuZG9tLmJvdW5kcygpLFxuICByYWRpdXNTcSA9IE1hdGgucG93KGJvdW5kcy53aWR0aCAvIDgsIDIpO1xuICBmb3IgKGxldCBrZXkgaW4gcy5waWVjZXMpIHtcbiAgICBjb25zdCBzcXVhcmVCb3VuZHMgPSBjb21wdXRlU3F1YXJlQm91bmRzKGtleSBhcyBjZy5LZXksIGFzV2hpdGUsIGJvdW5kcyksXG4gICAgY2VudGVyOiBjZy5OdW1iZXJQYWlyID0gW1xuICAgICAgc3F1YXJlQm91bmRzLmxlZnQgKyBzcXVhcmVCb3VuZHMud2lkdGggLyAyLFxuICAgICAgc3F1YXJlQm91bmRzLnRvcCArIHNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyXG4gICAgXTtcbiAgICBpZiAodXRpbC5kaXN0YW5jZVNxKGNlbnRlciwgcG9zKSA8PSByYWRpdXNTcSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhZ05ld1BpZWNlKHM6IFN0YXRlLCBwaWVjZTogY2cuUGllY2UsIGU6IGNnLk1vdWNoRXZlbnQsIGZvcmNlPzogYm9vbGVhbik6IHZvaWQge1xuXG4gIGNvbnN0IGtleTogY2cuS2V5ID0gJ2EwJztcblxuICBzLnBpZWNlc1trZXldID0gcGllY2U7XG5cbiAgcy5kb20ucmVkcmF3KCk7XG5cbiAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcixcbiAgYXNXaGl0ZSA9IGJvYXJkLndoaXRlUG92KHMpLFxuICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgc3F1YXJlQm91bmRzID0gY29tcHV0ZVNxdWFyZUJvdW5kcyhrZXksIGFzV2hpdGUsIGJvdW5kcyk7XG5cbiAgY29uc3QgcmVsOiBjZy5OdW1iZXJQYWlyID0gW1xuICAgIChhc1doaXRlID8gMCA6IDcpICogc3F1YXJlQm91bmRzLndpZHRoICsgYm91bmRzLmxlZnQsXG4gICAgKGFzV2hpdGUgPyA4IDogLTEpICogc3F1YXJlQm91bmRzLmhlaWdodCArIGJvdW5kcy50b3BcbiAgXTtcblxuICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgIG9yaWc6IGtleSxcbiAgICBvcmlnUG9zOiB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICBwaWVjZSxcbiAgICByZWwsXG4gICAgZXBvczogcG9zaXRpb24sXG4gICAgcG9zOiBbcG9zaXRpb25bMF0gLSByZWxbMF0sIHBvc2l0aW9uWzFdIC0gcmVsWzFdXSxcbiAgICBkZWM6IFstc3F1YXJlQm91bmRzLndpZHRoIC8gMiwgLXNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyXSxcbiAgICBzdGFydGVkOiB0cnVlLFxuICAgIGVsZW1lbnQ6ICgpID0+IHBpZWNlRWxlbWVudEJ5S2V5KHMsIGtleSksXG4gICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldCxcbiAgICBuZXdQaWVjZTogdHJ1ZSxcbiAgICBmb3JjZTogISFmb3JjZVxuICB9O1xuICBwcm9jZXNzRHJhZyhzKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoczogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICAgIGlmICghY3VyKSByZXR1cm47XG4gICAgLy8gY2FuY2VsIGFuaW1hdGlvbnMgd2hpbGUgZHJhZ2dpbmdcbiAgICBpZiAocy5hbmltYXRpb24uY3VycmVudCAmJiBzLmFuaW1hdGlvbi5jdXJyZW50LnBsYW4uYW5pbXNbY3VyLm9yaWddKSBzLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICBjb25zdCBvcmlnUGllY2UgPSBzLnBpZWNlc1tjdXIub3JpZ107XG4gICAgaWYgKCFvcmlnUGllY2UgfHwgIXV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKSkgY2FuY2VsKHMpO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKCFjdXIuc3RhcnRlZCAmJiB1dGlsLmRpc3RhbmNlU3EoY3VyLmVwb3MsIGN1ci5yZWwpID49IE1hdGgucG93KHMuZHJhZ2dhYmxlLmRpc3RhbmNlLCAyKSkgY3VyLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgaWYgKGN1ci5zdGFydGVkKSB7XG5cbiAgICAgICAgLy8gc3VwcG9ydCBsYXp5IGVsZW1lbnRzXG4gICAgICAgIGlmICh0eXBlb2YgY3VyLmVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBmb3VuZCA9IGN1ci5lbGVtZW50KCk7XG4gICAgICAgICAgaWYgKCFmb3VuZCkgcmV0dXJuO1xuICAgICAgICAgIGZvdW5kLmNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIGZvdW5kLmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG4gICAgICAgICAgY3VyLmVsZW1lbnQgPSBmb3VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1ci5wb3MgPSBbXG4gICAgICAgICAgY3VyLmVwb3NbMF0gLSBjdXIucmVsWzBdLFxuICAgICAgICAgIGN1ci5lcG9zWzFdIC0gY3VyLnJlbFsxXVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIG1vdmUgcGllY2VcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZG9tLmJvdW5kcygpKShjdXIub3JpZ1BvcywgYm9hcmQud2hpdGVQb3YocykpO1xuICAgICAgICB0cmFuc2xhdGlvblswXSArPSBjdXIucG9zWzBdICsgY3VyLmRlY1swXTtcbiAgICAgICAgdHJhbnNsYXRpb25bMV0gKz0gY3VyLnBvc1sxXSArIGN1ci5kZWNbMV07XG4gICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKGN1ci5lbGVtZW50LCB0cmFuc2xhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudC5lcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoIWN1cikgcmV0dXJuO1xuICAvLyBjcmVhdGUgbm8gY29ycmVzcG9uZGluZyBtb3VzZSBldmVudFxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UpIGUucHJldmVudERlZmF1bHQoKTtcbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGN1ciAmJiBjdXIub3JpZ2luVGFyZ2V0ICE9PSBlLnRhcmdldCAmJiAhY3VyLm5ld1BpZWNlKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm47XG4gIH1cbiAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIC8vIHRvdWNoZW5kIGhhcyBubyBwb3NpdGlvbjsgc28gdXNlIHRoZSBsYXN0IHRvdWNobW92ZSBwb3NpdGlvbiBpbnN0ZWFkXG4gIGNvbnN0IGV2ZW50UG9zOiBjZy5OdW1iZXJQYWlyID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIHx8IGN1ci5lcG9zO1xuICBjb25zdCBkZXN0ID0gYm9hcmQuZ2V0S2V5QXREb21Qb3MoZXZlbnRQb3MsIGJvYXJkLndoaXRlUG92KHMpLCBzLmRvbS5ib3VuZHMoKSk7XG4gIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkICYmIGN1ci5vcmlnICE9PSBkZXN0KSB7XG4gICAgaWYgKGN1ci5uZXdQaWVjZSkgYm9hcmQuZHJvcE5ld1BpZWNlKHMsIGN1ci5vcmlnLCBkZXN0LCBjdXIuZm9yY2UpO1xuICAgIGVsc2Uge1xuICAgICAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICAgICAgaWYgKGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5vcmlnLCBkZXN0KSkgcy5zdGF0cy5kcmFnZ2VkID0gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY3VyLm5ld1BpZWNlKSB7XG4gICAgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgfSBlbHNlIGlmIChzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiYgIWRlc3QpIHtcbiAgICBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIGJvYXJkLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuICBpZiAoY3VyICYmIGN1ci5vcmlnID09PSBjdXIucHJldmlvdXNseVNlbGVjdGVkICYmIChjdXIub3JpZyA9PT0gZGVzdCB8fCAhZGVzdCkpXG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gIGVsc2UgaWYgKCFzLnNlbGVjdGFibGUuZW5hYmxlZCkgYm9hcmQudW5zZWxlY3Qocyk7XG5cbiAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBpZiAoY3VyLm5ld1BpZWNlKSBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gICAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZURyYWdFbGVtZW50cyhzOiBTdGF0ZSkge1xuICBjb25zdCBlID0gcy5kb20uZWxlbWVudHM7XG4gIGlmIChlLmdob3N0KSB1dGlsLnNldFZpc2libGUoZS5naG9zdCwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQm91bmRzKGtleTogY2cuS2V5LCBhc1doaXRlOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpIHtcbiAgY29uc3QgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIGlmICghYXNXaGl0ZSkge1xuICAgIHBvc1swXSA9IDkgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gOSAtIHBvc1sxXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGxlZnQ6IGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoICogKHBvc1swXSAtIDEpIC8gOCxcbiAgICB0b3A6IGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0ICogKDggLSBwb3NbMV0pIC8gOCxcbiAgICB3aWR0aDogYm91bmRzLndpZHRoIC8gOCxcbiAgICBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQgLyA4XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBpZWNlRWxlbWVudEJ5S2V5KHM6IFN0YXRlLCBrZXk6IGNnLktleSk6IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGxldCBlbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoZWwuY2dLZXkgPT09IGtleSAmJiBlbC50YWdOYW1lID09PSAnUElFQ0UnKSByZXR1cm4gZWw7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBjZy5QaWVjZU5vZGU7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlLCBnZXRLZXlBdERvbVBvcywgd2hpdGVQb3YgfSBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgZXZlbnRQb3NpdGlvbiwgaXNSaWdodEJ1dHRvbiB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlIHtcbiAgb3JpZzogY2cuS2V5O1xuICBkZXN0PzogY2cuS2V5O1xuICBicnVzaDogc3RyaW5nO1xuICBtb2RpZmllcnM/OiBEcmF3TW9kaWZpZXJzO1xuICBwaWVjZT86IERyYXdTaGFwZVBpZWNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZVBpZWNlIHtcbiAgcm9sZTogY2cuUm9sZTtcbiAgY29sb3I6IGNnLkNvbG9yO1xuICBzY2FsZT86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3QnJ1c2gge1xuICBrZXk6IHN0cmluZztcbiAgY29sb3I6IHN0cmluZztcbiAgb3BhY2l0eTogbnVtYmVyO1xuICBsaW5lV2lkdGg6IG51bWJlclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdCcnVzaGVzIHtcbiAgW25hbWU6IHN0cmluZ106IERyYXdCcnVzaDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3TW9kaWZpZXJzIHtcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdhYmxlIHtcbiAgZW5hYmxlZDogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgdmlzaWJsZTogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgZXJhc2VPbkNsaWNrOiBib29sZWFuO1xuICBvbkNoYW5nZT86IChzaGFwZXM6IERyYXdTaGFwZVtdKSA9PiB2b2lkO1xuICBzaGFwZXM6IERyYXdTaGFwZVtdOyAvLyB1c2VyIHNoYXBlc1xuICBhdXRvU2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gY29tcHV0ZXIgc2hhcGVzXG4gIGN1cnJlbnQ/OiBEcmF3Q3VycmVudDtcbiAgYnJ1c2hlczogRHJhd0JydXNoZXM7XG4gIC8vIGRyYXdhYmxlIFNWRyBwaWVjZXM7IHVzZWQgZm9yIGNyYXp5aG91c2UgZHJvcFxuICBwaWVjZXM6IHtcbiAgICBiYXNlVXJsOiBzdHJpbmdcbiAgfSxcbiAgcHJldlN2Z0hhc2g6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdDdXJyZW50IHtcbiAgb3JpZzogY2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmF3aW5nXG4gIGRlc3Q/OiBjZy5LZXk7IC8vIHNoYXBlIGRlc3QsIG9yIHVuZGVmaW5lZCBmb3IgY2lyY2xlXG4gIG1vdXNlU3E/OiBjZy5LZXk7IC8vIHNxdWFyZSBiZWluZyBtb3VzZWQgb3ZlclxuICBwb3M6IGNnLk51bWJlclBhaXI7IC8vIHJlbGF0aXZlIGN1cnJlbnQgcG9zaXRpb25cbiAgYnJ1c2g6IHN0cmluZzsgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbn1cblxuY29uc3QgYnJ1c2hlcyA9IFsnZ3JlZW4nLCAncmVkJywgJ2JsdWUnLCAneWVsbG93J107XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuOyAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGUuY3RybEtleSA/IHVuc2VsZWN0KHN0YXRlKSA6IGNhbmNlbE1vdmUoc3RhdGUpO1xuICBjb25zdCBwb3MgPSBldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXIsXG4gIG9yaWcgPSBnZXRLZXlBdERvbVBvcyhwb3MsIHdoaXRlUG92KHN0YXRlKSwgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZyxcbiAgICBwb3MsXG4gICAgYnJ1c2g6IGV2ZW50QnJ1c2goZSlcbiAgfTtcbiAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0RyYXcoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gc3RhdGUuZHJhd2FibGUuY3VycmVudDtcbiAgICBpZiAoY3VyKSB7XG4gICAgICBjb25zdCBtb3VzZVNxID0gZ2V0S2V5QXREb21Qb3MoY3VyLnBvcywgd2hpdGVQb3Yoc3RhdGUpLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgICAgaWYgKG1vdXNlU3EgIT09IGN1ci5tb3VzZVNxKSB7XG4gICAgICAgIGN1ci5tb3VzZVNxID0gbW91c2VTcTtcbiAgICAgICAgY3VyLmRlc3QgPSBtb3VzZVNxICE9PSBjdXIub3JpZyA/IG1vdXNlU3EgOiB1bmRlZmluZWQ7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQucG9zID0gZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICBpZiAoY3VyKSB7XG4gICAgaWYgKGN1ci5tb3VzZVNxKSBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICBjYW5jZWwoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuc2hhcGVzLmxlbmd0aCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBvbkNoYW5nZShzdGF0ZS5kcmF3YWJsZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRCcnVzaChlOiBjZy5Nb3VjaEV2ZW50KTogc3RyaW5nIHtcbiAgcmV0dXJuIGJydXNoZXNbKChlLnNoaWZ0S2V5IHx8IGUuY3RybEtleSkgJiYgaXNSaWdodEJ1dHRvbihlKSA/IDEgOiAwKSArIChlLmFsdEtleSA/IDIgOiAwKV07XG59XG5cbmZ1bmN0aW9uIGFkZFNoYXBlKGRyYXdhYmxlOiBEcmF3YWJsZSwgY3VyOiBEcmF3Q3VycmVudCk6IHZvaWQge1xuICBjb25zdCBzYW1lU2hhcGUgPSAoczogRHJhd1NoYXBlKSA9PiBzLm9yaWcgPT09IGN1ci5vcmlnICYmIHMuZGVzdCA9PT0gY3VyLmRlc3Q7XG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHNhbWVTaGFwZSlbMF07XG4gIGlmIChzaW1pbGFyKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHMgPT4gIXNhbWVTaGFwZShzKSk7XG4gIGlmICghc2ltaWxhciB8fCBzaW1pbGFyLmJydXNoICE9PSBjdXIuYnJ1c2gpIGRyYXdhYmxlLnNoYXBlcy5wdXNoKGN1cik7XG4gIG9uQ2hhbmdlKGRyYXdhYmxlKTtcbn1cblxuZnVuY3Rpb24gb25DaGFuZ2UoZHJhd2FibGU6IERyYXdhYmxlKTogdm9pZCB7XG4gIGlmIChkcmF3YWJsZS5vbkNoYW5nZSkgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBjYW5jZWwgYXMgY2FuY2VsRHJhZyB9IGZyb20gJy4vZHJhZydcblxuZXhwb3J0IGZ1bmN0aW9uIHNldERyb3BNb2RlKHM6IFN0YXRlLCBwaWVjZT86IGNnLlBpZWNlKTogdm9pZCB7XG4gIHMuZHJvcG1vZGUgPSB7XG4gICAgYWN0aXZlOiB0cnVlLFxuICAgIHBpZWNlXG4gIH07XG4gIGNhbmNlbERyYWcocyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxEcm9wTW9kZShzOiBTdGF0ZSk6IHZvaWQge1xuICBzLmRyb3Btb2RlID0ge1xuICAgIGFjdGl2ZTogZmFsc2VcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyb3AoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKCFzLmRyb3Btb2RlLmFjdGl2ZSkgcmV0dXJuO1xuXG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuXG4gIGNvbnN0IHBpZWNlID0gcy5kcm9wbW9kZS5waWVjZTtcblxuICBpZiAocGllY2UpIHtcbiAgICBzLnBpZWNlcy5hMCA9IHBpZWNlO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICAgIGNvbnN0IGRlc3QgPSBwb3NpdGlvbiAmJiBib2FyZC5nZXRLZXlBdERvbVBvcyhcbiAgICAgIHBvc2l0aW9uLCBib2FyZC53aGl0ZVBvdihzKSwgcy5kb20uYm91bmRzKCkpO1xuICAgIGlmIChkZXN0KSBib2FyZC5kcm9wTmV3UGllY2UocywgJ2EwJywgZGVzdCk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyBkcmFnIGZyb20gJy4vZHJhZydcbmltcG9ydCAqIGFzIGRyYXcgZnJvbSAnLi9kcmF3J1xuaW1wb3J0IHsgZHJvcCB9IGZyb20gJy4vZHJvcCdcbmltcG9ydCB7IGlzUmlnaHRCdXR0b24gfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIE1vdWNoQmluZCA9IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xudHlwZSBTdGF0ZU1vdWNoQmluZCA9IChkOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSk6IHZvaWQge1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgYm9hcmRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuXG4gIC8vIENhbm5vdCBiZSBwYXNzaXZlLCBiZWNhdXNlIHdlIHByZXZlbnQgdG91Y2ggc2Nyb2xsaW5nIGFuZCBkcmFnZ2luZyBvZlxuICAvLyBzZWxlY3RlZCBlbGVtZW50cy5cbiAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcblxuICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKSB7XG4gICAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgfVxufVxuXG4vLyByZXR1cm5zIHRoZSB1bmJpbmQgZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBiaW5kRG9jdW1lbnQoczogU3RhdGUsIHJlZHJhd0FsbDogY2cuUmVkcmF3KTogY2cuVW5iaW5kIHtcblxuICBjb25zdCB1bmJpbmRzOiBjZy5VbmJpbmRbXSA9IFtdO1xuXG4gIGlmICghcy5kb20ucmVsYXRpdmUgJiYgcy5yZXNpemFibGUpIHtcbiAgICBjb25zdCBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgIHMuZG9tLmJvdW5kcy5jbGVhcigpO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlZHJhd0FsbCk7XG4gICAgfTtcbiAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudC5ib2R5LCAnY2hlc3Nncm91bmQucmVzaXplJywgb25SZXNpemUpKTtcbiAgfVxuXG4gIGlmICghcy52aWV3T25seSkge1xuXG4gICAgY29uc3Qgb25tb3ZlOiBNb3VjaEJpbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcubW92ZSwgZHJhdy5tb3ZlKTtcbiAgICBjb25zdCBvbmVuZDogTW91Y2hCaW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLmVuZCwgZHJhdy5lbmQpO1xuXG4gICAgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10uZm9yRWFjaChldiA9PiB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSkpKTtcbiAgICBbJ3RvdWNoZW5kJywgJ21vdXNldXAnXS5mb3JFYWNoKGV2ID0+IHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25lbmQpKSk7XG5cbiAgICBjb25zdCBvblNjcm9sbCA9ICgpID0+IHMuZG9tLmJvdW5kcy5jbGVhcigpO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Njcm9sbCcsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Jlc2l6ZScsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICB9XG5cbiAgcmV0dXJuICgpID0+IHVuYmluZHMuZm9yRWFjaChmID0+IGYoKSk7XG59XG5cbmZ1bmN0aW9uIHVuYmluZGFibGUoZWw6IEV2ZW50VGFyZ2V0LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IE1vdWNoQmluZCwgb3B0aW9ucz86IGFueSk6IGNnLlVuYmluZCB7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayBhcyBFdmVudExpc3RlbmVyLCBvcHRpb25zKTtcbiAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayBhcyBFdmVudExpc3RlbmVyKTtcbn1cblxuZnVuY3Rpb24gc3RhcnREcmFnT3JEcmF3KHM6IFN0YXRlKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIGUgPT4ge1xuICAgIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50KSBkcmFnLmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIGRyYXcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSkgeyBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSBkcmF3LnN0YXJ0KHMsIGUpOyB9XG4gICAgZWxzZSBpZiAoIXMudmlld09ubHkpIHtcbiAgICAgIGlmIChzLmRyb3Btb2RlLmFjdGl2ZSkgZHJvcChzLCBlKTtcbiAgICAgIGVsc2UgZHJhZy5zdGFydChzLCBlKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRyYWdPckRyYXcoczogU3RhdGUsIHdpdGhEcmFnOiBTdGF0ZU1vdWNoQmluZCwgd2l0aERyYXc6IFN0YXRlTW91Y2hCaW5kKTogTW91Y2hCaW5kIHtcbiAgcmV0dXJuIGUgPT4ge1xuICAgIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkpIHsgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgd2l0aERyYXcocywgZSk7IH1cbiAgICBlbHNlIGlmICghcy52aWV3T25seSkgd2l0aERyYWcocywgZSk7XG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBLZXkgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBleHBsb3Npb24oc3RhdGU6IFN0YXRlLCBrZXlzOiBLZXlbXSk6IHZvaWQge1xuICBzdGF0ZS5leHBsb2RpbmcgPSB7IHN0YWdlOiAxLCBrZXlzIH07XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgc2V0U3RhZ2Uoc3RhdGUsIDIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0U3RhZ2Uoc3RhdGUsIHVuZGVmaW5lZCksIDEyMCk7XG4gIH0sIDEyMCk7XG59XG5cbmZ1bmN0aW9uIHNldFN0YWdlKHN0YXRlOiBTdGF0ZSwgc3RhZ2U6IG51bWJlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBpZiAoc3RhdGUuZXhwbG9kaW5nKSB7XG4gICAgaWYgKHN0YWdlKSBzdGF0ZS5leHBsb2Rpbmcuc3RhZ2UgPSBzdGFnZTtcbiAgICBlbHNlIHN0YXRlLmV4cGxvZGluZyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IHBvczJrZXksIGludlJhbmtzIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGNvbnN0IGluaXRpYWw6IGNnLkZFTiA9ICdybmJxa2Juci9wcHBwcHBwcC84LzgvOC84L1BQUFBQUFBQL1JOQlFLQk5SJztcblxuY29uc3Qgcm9sZXM6IHsgW2xldHRlcjogc3RyaW5nXTogY2cuUm9sZSB9ID0geyBwOiAncGF3bicsIHI6ICdyb29rJywgbjogJ2tuaWdodCcsIGI6ICdiaXNob3AnLCBxOiAncXVlZW4nLCBrOiAna2luZycgfTtcblxuY29uc3QgbGV0dGVycyA9IHsgcGF3bjogJ3AnLCByb29rOiAncicsIGtuaWdodDogJ24nLCBiaXNob3A6ICdiJywgcXVlZW46ICdxJywga2luZzogJ2snIH07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkKGZlbjogY2cuRkVOKTogY2cuUGllY2VzIHtcbiAgaWYgKGZlbiA9PT0gJ3N0YXJ0JykgZmVuID0gaW5pdGlhbDtcbiAgY29uc3QgcGllY2VzOiBjZy5QaWVjZXMgPSB7fTtcbiAgbGV0IHJvdzogbnVtYmVyID0gOCwgY29sOiBudW1iZXIgPSAwO1xuICBmb3IgKGNvbnN0IGMgb2YgZmVuKSB7XG4gICAgc3dpdGNoIChjKSB7XG4gICAgICBjYXNlICcgJzogcmV0dXJuIHBpZWNlcztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICAtLXJvdztcbiAgICAgICAgaWYgKHJvdyA9PT0gMCkgcmV0dXJuIHBpZWNlcztcbiAgICAgICAgY29sID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd+JzpcbiAgICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXNbcG9zMmtleShbY29sLCByb3ddKV07XG4gICAgICAgIGlmIChwaWVjZSkgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIgPCA1NykgY29sICs9IG5iIC0gNDg7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICsrY29sO1xuICAgICAgICAgIGNvbnN0IHJvbGUgPSBjLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcGllY2VzW3BvczJrZXkoW2NvbCwgcm93XSldID0ge1xuICAgICAgICAgICAgcm9sZTogcm9sZXNbcm9sZV0sXG4gICAgICAgICAgICBjb2xvcjogKGMgPT09IHJvbGUgPyAnYmxhY2snIDogJ3doaXRlJykgYXMgY2cuQ29sb3JcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwaWVjZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZShwaWVjZXM6IGNnLlBpZWNlcyk6IGNnLkZFTiB7XG4gIHJldHVybiBpbnZSYW5rcy5tYXAoeSA9PiBjZy5yYW5rcy5tYXAoeCA9PiB7XG4gICAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1twb3Mya2V5KFt4LCB5XSldO1xuICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgIGNvbnN0IGxldHRlciA9IGxldHRlcnNbcGllY2Uucm9sZV07XG4gICAgICAgIHJldHVybiBwaWVjZS5jb2xvciA9PT0gJ3doaXRlJyA/IGxldHRlci50b1VwcGVyQ2FzZSgpIDogbGV0dGVyO1xuICAgICAgfSBlbHNlIHJldHVybiAnMSc7XG4gICAgfSkuam9pbignJylcbiAgKS5qb2luKCcvJykucmVwbGFjZSgvMXsyLH0vZywgcyA9PiBzLmxlbmd0aC50b1N0cmluZygpKTtcbn1cbiIsImltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxudHlwZSBNb2JpbGl0eSA9ICh4MTpudW1iZXIsIHkxOm51bWJlciwgeDI6bnVtYmVyLCB5MjpudW1iZXIpID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIGRpZmYoYTogbnVtYmVyLCBiOm51bWJlcik6bnVtYmVyIHtcbiAgcmV0dXJuIE1hdGguYWJzKGEgLSBiKTtcbn1cblxuZnVuY3Rpb24gcGF3bihjb2xvcjogY2cuQ29sb3IpOiBNb2JpbGl0eSB7XG4gIHJldHVybiAoeDEsIHkxLCB4MiwgeTIpID0+IGRpZmYoeDEsIHgyKSA8IDIgJiYgKFxuICAgIGNvbG9yID09PSAnd2hpdGUnID8gKFxuICAgICAgLy8gYWxsb3cgMiBzcXVhcmVzIGZyb20gMSBhbmQgOCwgZm9yIGhvcmRlXG4gICAgICB5MiA9PT0geTEgKyAxIHx8ICh5MSA8PSAyICYmIHkyID09PSAoeTEgKyAyKSAmJiB4MSA9PT0geDIpXG4gICAgKSA6IChcbiAgICAgIHkyID09PSB5MSAtIDEgfHwgKHkxID49IDcgJiYgeTIgPT09ICh5MSAtIDIpICYmIHgxID09PSB4MilcbiAgICApXG4gICk7XG59XG5cbmNvbnN0IGtuaWdodDogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgY29uc3QgeGQgPSBkaWZmKHgxLCB4Mik7XG4gIGNvbnN0IHlkID0gZGlmZih5MSwgeTIpO1xuICByZXR1cm4gKHhkID09PSAxICYmIHlkID09PSAyKSB8fCAoeGQgPT09IDIgJiYgeWQgPT09IDEpO1xufVxuXG5jb25zdCBiaXNob3A6IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIHJldHVybiBkaWZmKHgxLCB4MikgPT09IGRpZmYoeTEsIHkyKTtcbn1cblxuY29uc3Qgcm9vazogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgcmV0dXJuIHgxID09PSB4MiB8fCB5MSA9PT0geTI7XG59XG5cbmNvbnN0IHF1ZWVuOiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICByZXR1cm4gYmlzaG9wKHgxLCB5MSwgeDIsIHkyKSB8fCByb29rKHgxLCB5MSwgeDIsIHkyKTtcbn1cblxuZnVuY3Rpb24ga2luZyhjb2xvcjogY2cuQ29sb3IsIHJvb2tGaWxlczogbnVtYmVyW10sIGNhbkNhc3RsZTogYm9vbGVhbik6IE1vYmlsaXR5IHtcbiAgcmV0dXJuICh4MSwgeTEsIHgyLCB5MikgID0+IChcbiAgICBkaWZmKHgxLCB4MikgPCAyICYmIGRpZmYoeTEsIHkyKSA8IDJcbiAgKSB8fCAoXG4gICAgY2FuQ2FzdGxlICYmIHkxID09PSB5MiAmJiB5MSA9PT0gKGNvbG9yID09PSAnd2hpdGUnID8gMSA6IDgpICYmIChcbiAgICAgICh4MSA9PT0gNSAmJiAoKHV0aWwuY29udGFpbnNYKHJvb2tGaWxlcywgMSkgJiYgeDIgPT09IDMpIHx8ICh1dGlsLmNvbnRhaW5zWChyb29rRmlsZXMsIDgpICYmIHgyID09PSA3KSkpIHx8XG4gICAgICB1dGlsLmNvbnRhaW5zWChyb29rRmlsZXMsIHgyKVxuICAgIClcbiAgKTtcbn1cblxuZnVuY3Rpb24gcm9va0ZpbGVzT2YocGllY2VzOiBjZy5QaWVjZXMsIGNvbG9yOiBjZy5Db2xvcikge1xuICBjb25zdCBiYWNrcmFuayA9IGNvbG9yID09ICd3aGl0ZScgPyAnMScgOiAnOCc7XG4gIHJldHVybiBPYmplY3Qua2V5cyhwaWVjZXMpLmZpbHRlcihrZXkgPT4ge1xuICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW2tleV07XG4gICAgcmV0dXJuIGtleVsxXSA9PT0gYmFja3JhbmsgJiYgcGllY2UgJiYgcGllY2UuY29sb3IgPT09IGNvbG9yICYmIHBpZWNlLnJvbGUgPT09ICdyb29rJztcbiAgfSkubWFwKChrZXk6IHN0cmluZyApID0+IHV0aWwua2V5MnBvcyhrZXkgYXMgY2cuS2V5KVswXSk7XG59XG5cbmNvbnN0IGFsbFBvcyA9IHV0aWwuYWxsS2V5cy5tYXAodXRpbC5rZXkycG9zKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJlbW92ZShwaWVjZXM6IGNnLlBpZWNlcywga2V5OiBjZy5LZXksIGNhbkNhc3RsZTogYm9vbGVhbik6IGNnLktleVtdIHtcbiAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XSEsXG4gICAgcG9zID0gdXRpbC5rZXkycG9zKGtleSksXG4gICAgciA9IHBpZWNlLnJvbGUsXG4gICAgbW9iaWxpdHk6IE1vYmlsaXR5ID0gciA9PT0gJ3Bhd24nID8gcGF3bihwaWVjZS5jb2xvcikgOiAoXG4gICAgICByID09PSAna25pZ2h0JyA/IGtuaWdodCA6IChcbiAgICAgICAgciA9PT0gJ2Jpc2hvcCcgPyBiaXNob3AgOiAoXG4gICAgICAgICAgciA9PT0gJ3Jvb2snID8gcm9vayA6IChcbiAgICAgICAgICAgIHIgPT09ICdxdWVlbicgPyBxdWVlbiA6IGtpbmcocGllY2UuY29sb3IsIHJvb2tGaWxlc09mKHBpZWNlcywgcGllY2UuY29sb3IpLCBjYW5DYXN0bGUpXG4gICAgICAgICAgKSkpKTtcbiAgcmV0dXJuIGFsbFBvcy5maWx0ZXIocG9zMiA9PlxuICAgIChwb3NbMF0gIT09IHBvczJbMF0gfHwgcG9zWzFdICE9PSBwb3MyWzFdKSAmJiBtb2JpbGl0eShwb3NbMF0sIHBvc1sxXSwgcG9zMlswXSwgcG9zMlsxXSlcbiAgKS5tYXAodXRpbC5wb3Mya2V5KTtcbn07XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBrZXkycG9zLCBjcmVhdGVFbCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IHdoaXRlUG92IH0gZnJvbSAnLi9ib2FyZCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQsIEFuaW1WZWN0b3JzLCBBbmltVmVjdG9yLCBBbmltRmFkaW5ncyB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuLy8gYCRjb2xvciAkcm9sZWBcbnR5cGUgUGllY2VOYW1lID0gc3RyaW5nO1xuXG5pbnRlcmZhY2UgU2FtZVBpZWNlcyB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfVxuaW50ZXJmYWNlIFNhbWVTcXVhcmVzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9XG5pbnRlcmZhY2UgTW92ZWRQaWVjZXMgeyBbcGllY2VOYW1lOiBzdHJpbmddOiBjZy5QaWVjZU5vZGVbXSB9XG5pbnRlcmZhY2UgTW92ZWRTcXVhcmVzIHsgW2NsYXNzTmFtZTogc3RyaW5nXTogY2cuU3F1YXJlTm9kZVtdIH1cbmludGVyZmFjZSBTcXVhcmVDbGFzc2VzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH1cblxuLy8gcG9ydGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3ZlbG9jZS9saWNob2JpbGUvYmxvYi9tYXN0ZXIvc3JjL2pzL2NoZXNzZ3JvdW5kL3ZpZXcuanNcbi8vIGluIGNhc2Ugb2YgYnVncywgYmxhbWUgQHZlbG9jZVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGFzV2hpdGU6IGJvb2xlYW4gPSB3aGl0ZVBvdihzKSxcbiAgcG9zVG9UcmFuc2xhdGUgPSBzLmRvbS5yZWxhdGl2ZSA/IHV0aWwucG9zVG9UcmFuc2xhdGVSZWwgOiB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKHMuZG9tLmJvdW5kcygpKSxcbiAgdHJhbnNsYXRlID0gcy5kb20ucmVsYXRpdmUgPyB1dGlsLnRyYW5zbGF0ZVJlbCA6IHV0aWwudHJhbnNsYXRlQWJzLFxuICBib2FyZEVsOiBIVE1MRWxlbWVudCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBwaWVjZXM6IGNnLlBpZWNlcyA9IHMucGllY2VzLFxuICBjdXJBbmltOiBBbmltQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuYW5pbWF0aW9uLmN1cnJlbnQsXG4gIGFuaW1zOiBBbmltVmVjdG9ycyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uYW5pbXMgOiB7fSxcbiAgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiB7fSxcbiAgY3VyRHJhZzogRHJhZ0N1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmRyYWdnYWJsZS5jdXJyZW50LFxuICBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyksXG4gIHNhbWVQaWVjZXM6IFNhbWVQaWVjZXMgPSB7fSxcbiAgc2FtZVNxdWFyZXM6IFNhbWVTcXVhcmVzID0ge30sXG4gIG1vdmVkUGllY2VzOiBNb3ZlZFBpZWNlcyA9IHt9LFxuICBtb3ZlZFNxdWFyZXM6IE1vdmVkU3F1YXJlcyA9IHt9LFxuICBwaWVjZXNLZXlzOiBjZy5LZXlbXSA9IE9iamVjdC5rZXlzKHBpZWNlcykgYXMgY2cuS2V5W107XG4gIGxldCBrOiBjZy5LZXksXG4gIHA6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICBlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSxcbiAgcGllY2VBdEtleTogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIGVsUGllY2VOYW1lOiBQaWVjZU5hbWUsXG4gIGFuaW06IEFuaW1WZWN0b3IgfCB1bmRlZmluZWQsXG4gIGZhZGluZzogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIHBNdmRzZXQ6IGNnLlBpZWNlTm9kZVtdLFxuICBwTXZkOiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQsXG4gIHNNdmRzZXQ6IGNnLlNxdWFyZU5vZGVbXSxcbiAgc012ZDogY2cuU3F1YXJlTm9kZSB8IHVuZGVmaW5lZDtcblxuICAvLyB3YWxrIG92ZXIgYWxsIGJvYXJkIGRvbSBlbGVtZW50cywgYXBwbHkgYW5pbWF0aW9ucyBhbmQgZmxhZyBtb3ZlZCBwaWVjZXNcbiAgZWwgPSBib2FyZEVsLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZTtcbiAgd2hpbGUgKGVsKSB7XG4gICAgayA9IGVsLmNnS2V5O1xuICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXNba107XG4gICAgICBhbmltID0gYW5pbXNba107XG4gICAgICBmYWRpbmcgPSBmYWRpbmdzW2tdO1xuICAgICAgZWxQaWVjZU5hbWUgPSBlbC5jZ1BpZWNlO1xuICAgICAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgcmVtb3ZlIGRyYWdnaW5nIHN0eWxlXG4gICAgICBpZiAoZWwuY2dEcmFnZ2luZyAmJiAoIWN1ckRyYWcgfHwgY3VyRHJhZy5vcmlnICE9PSBrKSkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnZ2luZycpO1xuICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzV2hpdGUpKTtcbiAgICAgICAgZWwuY2dEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICBpZiAoIWZhZGluZyAmJiBlbC5jZ0ZhZGluZykge1xuICAgICAgICBlbC5jZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZXJlIGlzIG5vdyBhIHBpZWNlIGF0IHRoaXMgZG9tIGtleVxuICAgICAgaWYgKHBpZWNlQXRLZXkpIHtcbiAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlXG4gICAgICAgIC8vIChvdGhlcndpc2UgaXQgY291bGQgYW5pbWF0ZSBhIGNhcHR1cmVkIHBpZWNlKVxuICAgICAgICBpZiAoYW5pbSAmJiBlbC5jZ0FuaW1hdGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkpIHtcbiAgICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmNnQW5pbWF0aW5nKSB7XG4gICAgICAgICAgZWwuY2dBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1doaXRlKSk7XG4gICAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIGVsLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChrZXkycG9zKGspLCBhc1doaXRlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIHBpZWNlOiBmbGFnIGFzIHNhbWVcbiAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuY2dGYWRpbmcpKSB7XG4gICAgICAgICAgc2FtZVBpZWNlc1trXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlmZmVyZW50IHBpZWNlOiBmbGFnIGFzIG1vdmVkIHVubGVzcyBpdCBpcyBhIGZhZGluZyBwaWVjZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFkaW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihmYWRpbmcpKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmYWRpbmcnKTtcbiAgICAgICAgICAgIGVsLmNnRmFkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSkgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdLnB1c2goZWwpO1xuICAgICAgICAgICAgZWxzZSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0gPSBbZWxdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2U6IGZsYWcgYXMgbW92ZWRcbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAobW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdKSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0ucHVzaChlbCk7XG4gICAgICAgIGVsc2UgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdID0gW2VsXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTcXVhcmVOb2RlKGVsKSkge1xuICAgICAgY29uc3QgY24gPSBlbC5jbGFzc05hbWU7XG4gICAgICBpZiAoc3F1YXJlc1trXSA9PT0gY24pIHNhbWVTcXVhcmVzW2tdID0gdHJ1ZTtcbiAgICAgIGVsc2UgaWYgKG1vdmVkU3F1YXJlc1tjbl0pIG1vdmVkU3F1YXJlc1tjbl0ucHVzaChlbCk7XG4gICAgICBlbHNlIG1vdmVkU3F1YXJlc1tjbl0gPSBbZWxdO1xuICAgIH1cbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGU7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHNxdWFyZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHNxdWFyZXNcbiAgLy8gb3IgYXBwZW5kIG5ldyBzcXVhcmVzXG4gIGZvciAoY29uc3Qgc2sgaW4gc3F1YXJlcykge1xuICAgIGlmICghc2FtZVNxdWFyZXNbc2tdKSB7XG4gICAgICBzTXZkc2V0ID0gbW92ZWRTcXVhcmVzW3NxdWFyZXNbc2tdXTtcbiAgICAgIHNNdmQgPSBzTXZkc2V0ICYmIHNNdmRzZXQucG9wKCk7XG4gICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHBvc1RvVHJhbnNsYXRlKGtleTJwb3Moc2sgYXMgY2cuS2V5KSwgYXNXaGl0ZSk7XG4gICAgICBpZiAoc012ZCkge1xuICAgICAgICBzTXZkLmNnS2V5ID0gc2sgYXMgY2cuS2V5O1xuICAgICAgICB0cmFuc2xhdGUoc012ZCwgdHJhbnNsYXRpb24pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHNxdWFyZU5vZGUgPSBjcmVhdGVFbCgnc3F1YXJlJywgc3F1YXJlc1tza10pIGFzIGNnLlNxdWFyZU5vZGU7XG4gICAgICAgIHNxdWFyZU5vZGUuY2dLZXkgPSBzayBhcyBjZy5LZXk7XG4gICAgICAgIHRyYW5zbGF0ZShzcXVhcmVOb2RlLCB0cmFuc2xhdGlvbik7XG4gICAgICAgIGJvYXJkRWwuaW5zZXJ0QmVmb3JlKHNxdWFyZU5vZGUsIGJvYXJkRWwuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAvLyBvciBhcHBlbmQgbmV3IHBpZWNlc1xuICBmb3IgKGNvbnN0IGogaW4gcGllY2VzS2V5cykge1xuICAgIGsgPSBwaWVjZXNLZXlzW2pdO1xuICAgIHAgPSBwaWVjZXNba10hO1xuICAgIGFuaW0gPSBhbmltc1trXTtcbiAgICBpZiAoIXNhbWVQaWVjZXNba10pIHtcbiAgICAgIHBNdmRzZXQgPSBtb3ZlZFBpZWNlc1twaWVjZU5hbWVPZihwKV07XG4gICAgICBwTXZkID0gcE12ZHNldCAmJiBwTXZkc2V0LnBvcCgpO1xuICAgICAgLy8gYSBzYW1lIHBpZWNlIHdhcyBtb3ZlZFxuICAgICAgaWYgKHBNdmQpIHtcbiAgICAgICAgLy8gYXBwbHkgZG9tIGNoYW5nZXNcbiAgICAgICAgcE12ZC5jZ0tleSA9IGs7XG4gICAgICAgIGlmIChwTXZkLmNnRmFkaW5nKSB7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgICAgICBwTXZkLmNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9zID0ga2V5MnBvcyhrKTtcbiAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIHBNdmQuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KHBvcywgYXNXaGl0ZSk7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcE12ZC5jZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcE12ZC5jbGFzc0xpc3QuYWRkKCdhbmltJyk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNsYXRlKHBNdmQsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2UgaW4gbW92ZWQgb2JqOiBpbnNlcnQgdGhlIG5ldyBwaWVjZVxuICAgICAgLy8gYXNzdW1lcyB0aGUgbmV3IHBpZWNlIGlzIG5vdCBiZWluZyBkcmFnZ2VkXG4gICAgICBlbHNlIHtcblxuICAgICAgICBjb25zdCBwaWVjZU5hbWUgPSBwaWVjZU5hbWVPZihwKSxcbiAgICAgICAgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lKSBhcyBjZy5QaWVjZU5vZGUsXG4gICAgICAgIHBvcyA9IGtleTJwb3Moayk7XG5cbiAgICAgICAgcGllY2VOb2RlLmNnUGllY2UgPSBwaWVjZU5hbWU7XG4gICAgICAgIHBpZWNlTm9kZS5jZ0tleSA9IGs7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcGllY2VOb2RlLmNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGUocGllY2VOb2RlLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcblxuICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgcGllY2VOb2RlLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChwb3MsIGFzV2hpdGUpO1xuXG4gICAgICAgIGJvYXJkRWwuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgYW55IGVsZW1lbnQgdGhhdCByZW1haW5zIGluIHRoZSBtb3ZlZCBzZXRzXG4gIGZvciAoY29uc3QgaSBpbiBtb3ZlZFBpZWNlcykgcmVtb3ZlTm9kZXMocywgbW92ZWRQaWVjZXNbaV0pO1xuICBmb3IgKGNvbnN0IGkgaW4gbW92ZWRTcXVhcmVzKSByZW1vdmVOb2RlcyhzLCBtb3ZlZFNxdWFyZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBpc1BpZWNlTm9kZShlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSk6IGVsIGlzIGNnLlBpZWNlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnUElFQ0UnO1xufVxuZnVuY3Rpb24gaXNTcXVhcmVOb2RlKGVsOiBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlKTogZWwgaXMgY2cuU3F1YXJlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU1FVQVJFJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZXMoczogU3RhdGUsIG5vZGVzOiBIVE1MRWxlbWVudFtdKTogdm9pZCB7XG4gIGZvciAoY29uc3QgaSBpbiBub2Rlcykgcy5kb20uZWxlbWVudHMuYm9hcmQucmVtb3ZlQ2hpbGQobm9kZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBwb3NaSW5kZXgocG9zOiBjZy5Qb3MsIGFzV2hpdGU6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBsZXQgeiA9IDIgKyAocG9zWzFdIC0gMSkgKiA4ICsgKDggLSBwb3NbMF0pO1xuICBpZiAoYXNXaGl0ZSkgeiA9IDY3IC0gejtcbiAgcmV0dXJuIHogKyAnJztcbn1cblxuZnVuY3Rpb24gcGllY2VOYW1lT2YocGllY2U6IGNnLlBpZWNlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNsYXNzZXMoczogU3RhdGUpOiBTcXVhcmVDbGFzc2VzIHtcbiAgY29uc3Qgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IHt9O1xuICBsZXQgaTogYW55LCBrOiBjZy5LZXk7XG4gIGlmIChzLmxhc3RNb3ZlICYmIHMuaGlnaGxpZ2h0Lmxhc3RNb3ZlKSBmb3IgKGkgaW4gcy5sYXN0TW92ZSkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLmxhc3RNb3ZlW2ldLCAnbGFzdC1tb3ZlJyk7XG4gIH1cbiAgaWYgKHMuY2hlY2sgJiYgcy5oaWdobGlnaHQuY2hlY2spIGFkZFNxdWFyZShzcXVhcmVzLCBzLmNoZWNrLCAnY2hlY2snKTtcbiAgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XG4gICAgaWYgKHMubW92YWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5tb3ZhYmxlLmRlc3RzICYmIHMubW92YWJsZS5kZXN0c1tzLnNlbGVjdGVkXTtcbiAgICAgIGlmIChkZXN0cykgZm9yIChpIGluIGRlc3RzKSB7XG4gICAgICAgIGsgPSBkZXN0c1tpXTtcbiAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdtb3ZlLWRlc3QnICsgKHMucGllY2VzW2tdID8gJyBvYycgOiAnJykpO1xuICAgICAgfVxuICAgICAgY29uc3QgcERlc3RzID0gcy5wcmVtb3ZhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cykgZm9yIChpIGluIHBEZXN0cykge1xuICAgICAgICBrID0gcERlc3RzW2ldO1xuICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ3ByZW1vdmUtZGVzdCcgKyAocy5waWVjZXNba10gPyAnIG9jJyA6ICcnKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHByZW1vdmUgPSBzLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKHByZW1vdmUpIGZvciAoaSBpbiBwcmVtb3ZlKSBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZVtpXSwgJ2N1cnJlbnQtcHJlbW92ZScpO1xuICBlbHNlIGlmIChzLnByZWRyb3BwYWJsZS5jdXJyZW50KSBhZGRTcXVhcmUoc3F1YXJlcywgcy5wcmVkcm9wcGFibGUuY3VycmVudC5rZXksICdjdXJyZW50LXByZW1vdmUnKTtcblxuICBjb25zdCBvID0gcy5leHBsb2Rpbmc7XG4gIGlmIChvKSBmb3IgKGkgaW4gby5rZXlzKSBhZGRTcXVhcmUoc3F1YXJlcywgby5rZXlzW2ldLCAnZXhwbG9kaW5nJyArIG8uc3RhZ2UpO1xuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBjZy5LZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKHNxdWFyZXNba2V5XSkgc3F1YXJlc1trZXldICs9ICcgJyArIGtsYXNzO1xuICBlbHNlIHNxdWFyZXNba2V5XSA9IGtsYXNzO1xufVxuIiwiaW1wb3J0ICogYXMgZmVuIGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQgfSBmcm9tICcuL2FuaW0nXG5pbXBvcnQgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZydcbmltcG9ydCB7IERyYXdhYmxlIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0IHsgdGltZXIgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSB7XG4gIHBpZWNlczogY2cuUGllY2VzO1xuICBvcmllbnRhdGlvbjogY2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiB3aGl0ZSB8IGJsYWNrXG4gIHR1cm5Db2xvcjogY2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gd2hpdGUgfCBibGFja1xuICBjaGVjaz86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBpbiBjaGVjayBcImEyXCJcbiAgbGFzdE1vdmU/OiBjZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgW1wiYzNcIjsgXCJjNFwiXVxuICBzZWxlY3RlZD86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcImExXCJcbiAgY29vcmRpbmF0ZXM6IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgYXV0b0Nhc3RsZTogYm9vbGVhbjsgLy8gaW1tZWRpYXRlbHkgY29tcGxldGUgdGhlIGNhc3RsZSBieSBtb3ZpbmcgdGhlIHJvb2sgYWZ0ZXIga2luZyBtb3ZlXG4gIHZpZXdPbmx5OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBkaXNhYmxlQ29udGV4dE1lbnU6IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgY2hlc3Nib2FyZFxuICByZXNpemFibGU6IGJvb2xlYW47IC8vIGxpc3RlbnMgdG8gY2hlc3Nncm91bmQucmVzaXplIG9uIGRvY3VtZW50LmJvZHkgdG8gY2xlYXIgYm91bmRzIGNhY2hlXG4gIGFkZFBpZWNlWkluZGV4OiBib29sZWFuOyAvLyBhZGRzIHotaW5kZXggdmFsdWVzIHRvIHBpZWNlcyAoZm9yIDNEKVxuICBwaWVjZUtleTogYm9vbGVhbjsgLy8gYWRkIGEgZGF0YS1rZXkgYXR0cmlidXRlIHRvIHBpZWNlIGVsZW1lbnRzXG4gIGhpZ2hsaWdodDoge1xuICAgIGxhc3RNb3ZlOiBib29sZWFuOyAvLyBhZGQgbGFzdC1tb3ZlIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjazogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICBkdXJhdGlvbjogbnVtYmVyO1xuICAgIGN1cnJlbnQ/OiBBbmltQ3VycmVudDtcbiAgfTtcbiAgbW92YWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBjb2xvcj86IGNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlLiB3aGl0ZSB8IGJsYWNrIHwgYm90aFxuICAgIGRlc3RzPzogY2cuRGVzdHM7IC8vIHZhbGlkIG1vdmVzLiB7XCJhMlwiIFtcImEzXCIgXCJhNFwiXSBcImIxXCIgW1wiYTNcIiBcImMzXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIG1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgICAgYWZ0ZXJOZXdQaWVjZT86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIGEgbmV3IHBpZWNlIGlzIGRyb3BwZWQgb24gdGhlIGJvYXJkXG4gICAgfTtcbiAgICByb29rQ2FzdGxlOiBib29sZWFuIC8vIGNhc3RsZSBieSBtb3ZpbmcgdGhlIGtpbmcgdG8gdGhlIHJvb2tcbiAgfTtcbiAgcHJlbW92YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZW1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgY2FzdGxlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFsbG93IGtpbmcgY2FzdGxlIHByZW1vdmVzXG4gICAgZGVzdHM/OiBjZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiBjZy5LZXlQYWlyOyAvLyBrZXlzIG9mIHRoZSBjdXJyZW50IHNhdmVkIHByZW1vdmUgW1wiZTJcIiBcImU0XCJdXG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhPzogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7ICAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIHByZWRyb3BwYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIGN1cnJlbnQ/OiB7IC8vIGN1cnJlbnQgc2F2ZWQgcHJlZHJvcCB7cm9sZTogJ2tuaWdodCc7IGtleTogJ2U0J31cbiAgICAgIHJvbGU6IGNnLlJvbGU7XG4gICAgICBrZXk6IGNnLktleVxuICAgIH07XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBkcmFnZ2FibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlOiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U6IGJvb2xlYW47IC8vIGxldHMgY2hlc3Nncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIGNlbnRlclBpZWNlOiBib29sZWFuOyAvLyBjZW50ZXIgdGhlIHBpZWNlIG9uIGN1cnNvciBhdCBkcmFnIHN0YXJ0XG4gICAgc2hvd0dob3N0OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBkZWxldGVPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkXG4gICAgY3VycmVudD86IERyYWdDdXJyZW50O1xuICB9O1xuICBkcm9wbW9kZToge1xuICAgIGFjdGl2ZTogYm9vbGVhbjtcbiAgICBwaWVjZT86IGNnLlBpZWNlO1xuICB9XG4gIHNlbGVjdGFibGU6IHtcbiAgICAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZW5hYmxlZDogYm9vbGVhblxuICB9O1xuICBzdGF0czoge1xuICAgIC8vIHdhcyBsYXN0IHBpZWNlIGRyYWdnZWQgb3IgY2xpY2tlZD9cbiAgICAvLyBuZWVkcyBkZWZhdWx0IHRvIGZhbHNlIGZvciB0b3VjaFxuICAgIGRyYWdnZWQ6IGJvb2xlYW4sXG4gICAgY3RybEtleT86IGJvb2xlYW5cbiAgfTtcbiAgZXZlbnRzOiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgYSBwaWVjZSBoYXMgYmVlbiBtb3ZlZC5cbiAgICAvLyBjYXB0dXJlZFBpZWNlIGlzIHVuZGVmaW5lZCBvciBsaWtlIHtjb2xvcjogJ3doaXRlJzsgJ3JvbGUnOiAncXVlZW4nfVxuICAgIG1vdmU/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIGNhcHR1cmVkUGllY2U/OiBjZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wTmV3UGllY2U/OiAocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSkgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBjZy5LZXkpID0+IHZvaWQgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgICBpbnNlcnQ/OiAoZWxlbWVudHM6IGNnLkVsZW1lbnRzKSA9PiB2b2lkOyAvLyB3aGVuIHRoZSBib2FyZCBET00gaGFzIGJlZW4gKHJlKWluc2VydGVkXG4gIH07XG4gIGRyYXdhYmxlOiBEcmF3YWJsZSxcbiAgZXhwbG9kaW5nPzogY2cuRXhwbG9kaW5nO1xuICBkb206IGNnLkRvbSxcbiAgaG9sZDogY2cuVGltZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKCk6IFBhcnRpYWw8U3RhdGU+IHtcbiAgcmV0dXJuIHtcbiAgICBwaWVjZXM6IGZlbi5yZWFkKGZlbi5pbml0aWFsKSxcbiAgICBvcmllbnRhdGlvbjogJ3doaXRlJyxcbiAgICB0dXJuQ29sb3I6ICd3aGl0ZScsXG4gICAgY29vcmRpbmF0ZXM6IHRydWUsXG4gICAgYXV0b0Nhc3RsZTogdHJ1ZSxcbiAgICB2aWV3T25seTogZmFsc2UsXG4gICAgZGlzYWJsZUNvbnRleHRNZW51OiBmYWxzZSxcbiAgICByZXNpemFibGU6IHRydWUsXG4gICAgYWRkUGllY2VaSW5kZXg6IGZhbHNlLFxuICAgIHBpZWNlS2V5OiBmYWxzZSxcbiAgICBoaWdobGlnaHQ6IHtcbiAgICAgIGxhc3RNb3ZlOiB0cnVlLFxuICAgICAgY2hlY2s6IHRydWVcbiAgICB9LFxuICAgIGFuaW1hdGlvbjoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGR1cmF0aW9uOiAyMDBcbiAgICB9LFxuICAgIG1vdmFibGU6IHtcbiAgICAgIGZyZWU6IHRydWUsXG4gICAgICBjb2xvcjogJ2JvdGgnLFxuICAgICAgc2hvd0Rlc3RzOiB0cnVlLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIHJvb2tDYXN0bGU6IHRydWVcbiAgICB9LFxuICAgIHByZW1vdmFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBjYXN0bGU6IHRydWUsXG4gICAgICBldmVudHM6IHt9XG4gICAgfSxcbiAgICBwcmVkcm9wcGFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgZXZlbnRzOiB7fVxuICAgIH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZGlzdGFuY2U6IDMsXG4gICAgICBhdXRvRGlzdGFuY2U6IHRydWUsXG4gICAgICBjZW50ZXJQaWVjZTogdHJ1ZSxcbiAgICAgIHNob3dHaG9zdDogdHJ1ZSxcbiAgICAgIGRlbGV0ZU9uRHJvcE9mZjogZmFsc2VcbiAgICB9LFxuICAgIGRyb3Btb2RlOiB7XG4gICAgICBhY3RpdmU6IGZhbHNlXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlXG4gICAgfSxcbiAgICBzdGF0czoge1xuICAgICAgLy8gb24gdG91Y2hzY3JlZW4sIGRlZmF1bHQgdG8gXCJ0YXAtdGFwXCIgbW92ZXNcbiAgICAgIC8vIGluc3RlYWQgb2YgZHJhZ1xuICAgICAgZHJhZ2dlZDogISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpXG4gICAgfSxcbiAgICBldmVudHM6IHt9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLCAvLyBjYW4gZHJhd1xuICAgICAgdmlzaWJsZTogdHJ1ZSwgLy8gY2FuIHZpZXdcbiAgICAgIGVyYXNlT25DbGljazogdHJ1ZSxcbiAgICAgIHNoYXBlczogW10sXG4gICAgICBhdXRvU2hhcGVzOiBbXSxcbiAgICAgIGJydXNoZXM6IHtcbiAgICAgICAgZ3JlZW46IHsga2V5OiAnZycsIGNvbG9yOiAnIzE1NzgxQicsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgcmVkOiB7IGtleTogJ3InLCBjb2xvcjogJyM4ODIwMjAnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIGJsdWU6IHsga2V5OiAnYicsIGNvbG9yOiAnIzAwMzA4OCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgeWVsbG93OiB7IGtleTogJ3knLCBjb2xvcjogJyNlNjhmMDAnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIHBhbGVCbHVlOiB7IGtleTogJ3BiJywgY29sb3I6ICcjMDAzMDg4Jywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVHcmVlbjogeyBrZXk6ICdwZycsIGNvbG9yOiAnIzE1NzgxQicsIG9wYWNpdHk6IDAuNCwgbGluZVdpZHRoOiAxNSB9LFxuICAgICAgICBwYWxlUmVkOiB7IGtleTogJ3ByJywgY29sb3I6ICcjODgyMDIwJywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVHcmV5OiB7IGtleTogJ3BncicsIGNvbG9yOiAnIzRhNGE0YScsIG9wYWNpdHk6IDAuMzUsIGxpbmVXaWR0aDogMTUgfVxuICAgICAgfSxcbiAgICAgIHBpZWNlczoge1xuICAgICAgICBiYXNlVXJsOiAnaHR0cHM6Ly9saWNoZXNzMS5vcmcvYXNzZXRzL3BpZWNlL2NidXJuZXR0LydcbiAgICAgIH0sXG4gICAgICBwcmV2U3ZnSGFzaDogJydcbiAgICB9LFxuICAgIGhvbGQ6IHRpbWVyKClcbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGtleTJwb3MgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBEcmF3YWJsZSwgRHJhd1NoYXBlLCBEcmF3U2hhcGVQaWVjZSwgRHJhd0JydXNoLCBEcmF3QnJ1c2hlcywgRHJhd01vZGlmaWVycyB9IGZyb20gJy4vZHJhdydcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IFNWR0VsZW1lbnQge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ05hbWUpO1xufVxuXG5pbnRlcmZhY2UgU2hhcGUge1xuICBzaGFwZTogRHJhd1NoYXBlO1xuICBjdXJyZW50OiBib29sZWFuO1xuICBoYXNoOiBIYXNoO1xufVxuXG5pbnRlcmZhY2UgQ3VzdG9tQnJ1c2hlcyB7XG4gIFtoYXNoOiBzdHJpbmddOiBEcmF3QnJ1c2hcbn1cblxuaW50ZXJmYWNlIEFycm93RGVzdHMge1xuICBba2V5OiBzdHJpbmddOiBudW1iZXI7IC8vIGhvdyBtYW55IGFycm93cyBsYW5kIG9uIGEgc3F1YXJlXG59XG5cbnR5cGUgSGFzaCA9IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN2ZyhzdGF0ZTogU3RhdGUsIHJvb3Q6IFNWR0VsZW1lbnQpOiB2b2lkIHtcblxuICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGUsXG4gIGN1ckQgPSBkLmN1cnJlbnQsXG4gIGN1ciA9IGN1ckQgJiYgY3VyRC5tb3VzZVNxID8gY3VyRCBhcyBEcmF3U2hhcGUgOiB1bmRlZmluZWQsXG4gIGFycm93RGVzdHM6IEFycm93RGVzdHMgPSB7fTtcblxuICBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5jb25jYXQoY3VyID8gW2N1cl0gOiBbXSkuZm9yRWFjaChzID0+IHtcbiAgICBpZiAocy5kZXN0KSBhcnJvd0Rlc3RzW3MuZGVzdF0gPSAoYXJyb3dEZXN0c1tzLmRlc3RdIHx8IDApICsgMTtcbiAgfSk7XG5cbiAgY29uc3Qgc2hhcGVzOiBTaGFwZVtdID0gZC5zaGFwZXMuY29uY2F0KGQuYXV0b1NoYXBlcykubWFwKChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hhcGU6IHMsXG4gICAgICBjdXJyZW50OiBmYWxzZSxcbiAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSlcbiAgICB9O1xuICB9KTtcbiAgaWYgKGN1cikgc2hhcGVzLnB1c2goe1xuICAgIHNoYXBlOiBjdXIsXG4gICAgY3VycmVudDogdHJ1ZSxcbiAgICBoYXNoOiBzaGFwZUhhc2goY3VyLCBhcnJvd0Rlc3RzLCB0cnVlKVxuICB9KTtcblxuICBjb25zdCBmdWxsSGFzaCA9IHNoYXBlcy5tYXAoc2MgPT4gc2MuaGFzaCkuam9pbignJyk7XG4gIGlmIChmdWxsSGFzaCA9PT0gc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2gpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSBmdWxsSGFzaDtcblxuICBjb25zdCBkZWZzRWwgPSByb290LmZpcnN0Q2hpbGQgYXMgU1ZHRWxlbWVudDtcblxuICBzeW5jRGVmcyhkLCBzaGFwZXMsIGRlZnNFbCk7XG4gIHN5bmNTaGFwZXMoc3RhdGUsIHNoYXBlcywgZC5icnVzaGVzLCBhcnJvd0Rlc3RzLCByb290LCBkZWZzRWwpO1xufVxuXG4vLyBhcHBlbmQgb25seS4gRG9uJ3QgdHJ5IHRvIHVwZGF0ZS9yZW1vdmUuXG5mdW5jdGlvbiBzeW5jRGVmcyhkOiBEcmF3YWJsZSwgc2hhcGVzOiBTaGFwZVtdLCBkZWZzRWw6IFNWR0VsZW1lbnQpIHtcbiAgY29uc3QgYnJ1c2hlczogQ3VzdG9tQnJ1c2hlcyA9IHt9O1xuICBsZXQgYnJ1c2g6IERyYXdCcnVzaDtcbiAgc2hhcGVzLmZvckVhY2gocyA9PiB7XG4gICAgaWYgKHMuc2hhcGUuZGVzdCkge1xuICAgICAgYnJ1c2ggPSBkLmJydXNoZXNbcy5zaGFwZS5icnVzaF07XG4gICAgICBpZiAocy5zaGFwZS5tb2RpZmllcnMpIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzLnNoYXBlLm1vZGlmaWVycyk7XG4gICAgICBicnVzaGVzW2JydXNoLmtleV0gPSBicnVzaDtcbiAgICB9XG4gIH0pO1xuICBjb25zdCBrZXlzSW5Eb206IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgPSBkZWZzRWwuZmlyc3RDaGlsZCBhcyBTVkdFbGVtZW50O1xuICB3aGlsZShlbCkge1xuICAgIGtleXNJbkRvbVtlbC5nZXRBdHRyaWJ1dGUoJ2NnS2V5JykgYXMgc3RyaW5nXSA9IHRydWU7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBTVkdFbGVtZW50O1xuICB9XG4gIGZvciAobGV0IGtleSBpbiBicnVzaGVzKSB7XG4gICAgaWYgKCFrZXlzSW5Eb21ba2V5XSkgZGVmc0VsLmFwcGVuZENoaWxkKHJlbmRlck1hcmtlcihicnVzaGVzW2tleV0pKTtcbiAgfVxufVxuXG4vLyBhcHBlbmQgYW5kIHJlbW92ZSBvbmx5LiBObyB1cGRhdGVzLlxuZnVuY3Rpb24gc3luY1NoYXBlcyhzdGF0ZTogU3RhdGUsIHNoYXBlczogU2hhcGVbXSwgYnJ1c2hlczogRHJhd0JydXNoZXMsIGFycm93RGVzdHM6IEFycm93RGVzdHMsIHJvb3Q6IFNWR0VsZW1lbnQsIGRlZnNFbDogU1ZHRWxlbWVudCk6IHZvaWQge1xuICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzKCksXG4gIGhhc2hlc0luRG9tOiB7W2hhc2g6IHN0cmluZ106IGJvb2xlYW59ID0ge30sXG4gIHRvUmVtb3ZlOiBTVkdFbGVtZW50W10gPSBbXTtcbiAgc2hhcGVzLmZvckVhY2goc2MgPT4geyBoYXNoZXNJbkRvbVtzYy5oYXNoXSA9IGZhbHNlOyB9KTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50ID0gZGVmc0VsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQsIGVsSGFzaDogSGFzaDtcbiAgd2hpbGUoZWwpIHtcbiAgICBlbEhhc2ggPSBlbC5nZXRBdHRyaWJ1dGUoJ2NnSGFzaCcpIGFzIEhhc2g7XG4gICAgLy8gZm91bmQgYSBzaGFwZSBlbGVtZW50IHRoYXQncyBoZXJlIHRvIHN0YXlcbiAgICBpZiAoaGFzaGVzSW5Eb20uaGFzT3duUHJvcGVydHkoZWxIYXNoKSkgaGFzaGVzSW5Eb21bZWxIYXNoXSA9IHRydWU7XG4gICAgLy8gb3IgcmVtb3ZlIGl0XG4gICAgZWxzZSB0b1JlbW92ZS5wdXNoKGVsKTtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgdG9SZW1vdmUuZm9yRWFjaChlbCA9PiByb290LnJlbW92ZUNoaWxkKGVsKSk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgc2hhcGVzLmZvckVhY2goc2MgPT4ge1xuICAgIGlmICghaGFzaGVzSW5Eb21bc2MuaGFzaF0pIHJvb3QuYXBwZW5kQ2hpbGQocmVuZGVyU2hhcGUoc3RhdGUsIHNjLCBicnVzaGVzLCBhcnJvd0Rlc3RzLCBib3VuZHMpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNoYXBlSGFzaCh7b3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBtb2RpZmllcnN9OiBEcmF3U2hhcGUsIGFycm93RGVzdHM6IEFycm93RGVzdHMsIGN1cnJlbnQ6IGJvb2xlYW4pOiBIYXNoIHtcbiAgcmV0dXJuIFtjdXJyZW50LCBvcmlnLCBkZXN0LCBicnVzaCwgZGVzdCAmJiBhcnJvd0Rlc3RzW2Rlc3RdID4gMSxcbiAgICBwaWVjZSAmJiBwaWVjZUhhc2gocGllY2UpLFxuICAgIG1vZGlmaWVycyAmJiBtb2RpZmllcnNIYXNoKG1vZGlmaWVycylcbiAgXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gcGllY2VIYXNoKHBpZWNlOiBEcmF3U2hhcGVQaWVjZSk6IEhhc2gge1xuICByZXR1cm4gW3BpZWNlLmNvbG9yLCBwaWVjZS5yb2xlLCBwaWVjZS5zY2FsZV0uZmlsdGVyKHggPT4geCkuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIG1vZGlmaWVyc0hhc2gobTogRHJhd01vZGlmaWVycyk6IEhhc2gge1xuICByZXR1cm4gJycgKyAobS5saW5lV2lkdGggfHwgJycpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTaGFwZShzdGF0ZTogU3RhdGUsIHtzaGFwZSwgY3VycmVudCwgaGFzaH06IFNoYXBlLCBicnVzaGVzOiBEcmF3QnJ1c2hlcywgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGxldCBlbDogU1ZHRWxlbWVudDtcbiAgaWYgKHNoYXBlLnBpZWNlKSBlbCA9IHJlbmRlclBpZWNlKFxuICAgIHN0YXRlLmRyYXdhYmxlLnBpZWNlcy5iYXNlVXJsLFxuICAgIG9yaWVudChrZXkycG9zKHNoYXBlLm9yaWcpLCBzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgc2hhcGUucGllY2UsXG4gICAgYm91bmRzKTtcbiAgZWxzZSB7XG4gICAgY29uc3Qgb3JpZyA9IG9yaWVudChrZXkycG9zKHNoYXBlLm9yaWcpLCBzdGF0ZS5vcmllbnRhdGlvbik7XG4gICAgaWYgKHNoYXBlLm9yaWcgJiYgc2hhcGUuZGVzdCkge1xuICAgICAgbGV0IGJydXNoOiBEcmF3QnJ1c2ggPSBicnVzaGVzW3NoYXBlLmJydXNoXTtcbiAgICAgIGlmIChzaGFwZS5tb2RpZmllcnMpIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzaGFwZS5tb2RpZmllcnMpO1xuICAgICAgZWwgPSByZW5kZXJBcnJvdyhcbiAgICAgICAgYnJ1c2gsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIG9yaWVudChrZXkycG9zKHNoYXBlLmRlc3QpLCBzdGF0ZS5vcmllbnRhdGlvbiksXG4gICAgICAgIGN1cnJlbnQsXG4gICAgICAgIGFycm93RGVzdHNbc2hhcGUuZGVzdF0gPiAxLFxuICAgICAgICBib3VuZHMpO1xuICAgIH1cbiAgICBlbHNlIGVsID0gcmVuZGVyQ2lyY2xlKGJydXNoZXNbc2hhcGUuYnJ1c2hdLCBvcmlnLCBjdXJyZW50LCBib3VuZHMpO1xuICB9XG4gIGVsLnNldEF0dHJpYnV0ZSgnY2dIYXNoJywgaGFzaCk7XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2lyY2xlKGJydXNoOiBEcmF3QnJ1c2gsIHBvczogY2cuUG9zLCBjdXJyZW50OiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvczJweChwb3MsIGJvdW5kcyksXG4gIHdpZHRocyA9IGNpcmNsZVdpZHRoKGJvdW5kcyksXG4gIHJhZGl1cyA9IChib3VuZHMud2lkdGggKyBib3VuZHMuaGVpZ2h0KSAvIDMyO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdjaXJjbGUnKSwge1xuICAgIHN0cm9rZTogYnJ1c2guY29sb3IsXG4gICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBvcGFjaXR5OiBvcGFjaXR5KGJydXNoLCBjdXJyZW50KSxcbiAgICBjeDogb1swXSxcbiAgICBjeTogb1sxXSxcbiAgICByOiByYWRpdXMgLSB3aWR0aHNbMV0gLyAyXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBcnJvdyhicnVzaDogRHJhd0JydXNoLCBvcmlnOiBjZy5Qb3MsIGRlc3Q6IGNnLlBvcywgY3VycmVudDogYm9vbGVhbiwgc2hvcnRlbjogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG0gPSBhcnJvd01hcmdpbihib3VuZHMsIHNob3J0ZW4gJiYgIWN1cnJlbnQpLFxuICBhID0gcG9zMnB4KG9yaWcsIGJvdW5kcyksXG4gIGIgPSBwb3MycHgoZGVzdCwgYm91bmRzKSxcbiAgZHggPSBiWzBdIC0gYVswXSxcbiAgZHkgPSBiWzFdIC0gYVsxXSxcbiAgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCksXG4gIHhvID0gTWF0aC5jb3MoYW5nbGUpICogbSxcbiAgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdsaW5lJyksIHtcbiAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICdzdHJva2Utd2lkdGgnOiBsaW5lV2lkdGgoYnJ1c2gsIGN1cnJlbnQsIGJvdW5kcyksXG4gICAgJ3N0cm9rZS1saW5lY2FwJzogJ3JvdW5kJyxcbiAgICAnbWFya2VyLWVuZCc6ICd1cmwoI2Fycm93aGVhZC0nICsgYnJ1c2gua2V5ICsgJyknLFxuICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5b1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUGllY2UoYmFzZVVybDogc3RyaW5nLCBwb3M6IGNnLlBvcywgcGllY2U6IERyYXdTaGFwZVBpZWNlLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvczJweChwb3MsIGJvdW5kcyksXG4gIHNpemUgPSBib3VuZHMud2lkdGggLyA4ICogKHBpZWNlLnNjYWxlIHx8IDEpLFxuICBuYW1lID0gcGllY2UuY29sb3JbMF0gKyAocGllY2Uucm9sZSA9PT0gJ2tuaWdodCcgPyAnbicgOiBwaWVjZS5yb2xlWzBdKS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdpbWFnZScpLCB7XG4gICAgY2xhc3NOYW1lOiBgJHtwaWVjZS5yb2xlfSAke3BpZWNlLmNvbG9yfWAsXG4gICAgeDogb1swXSAtIHNpemUgLyAyLFxuICAgIHk6IG9bMV0gLSBzaXplIC8gMixcbiAgICB3aWR0aDogc2l6ZSxcbiAgICBoZWlnaHQ6IHNpemUsXG4gICAgaHJlZjogYmFzZVVybCArIG5hbWUgKyAnLnN2ZydcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlcihicnVzaDogRHJhd0JydXNoKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG1hcmtlciA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnbWFya2VyJyksIHtcbiAgICBpZDogJ2Fycm93aGVhZC0nICsgYnJ1c2gua2V5LFxuICAgIG9yaWVudDogJ2F1dG8nLFxuICAgIG1hcmtlcldpZHRoOiA0LFxuICAgIG1hcmtlckhlaWdodDogOCxcbiAgICByZWZYOiAyLjA1LFxuICAgIHJlZlk6IDIuMDFcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ3BhdGgnKSwge1xuICAgIGQ6ICdNMCwwIFY0IEwzLDIgWicsXG4gICAgZmlsbDogYnJ1c2guY29sb3JcbiAgfSkpO1xuICBtYXJrZXIuc2V0QXR0cmlidXRlKCdjZ0tleScsIGJydXNoLmtleSk7XG4gIHJldHVybiBtYXJrZXI7XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWw6IFNWR0VsZW1lbnQsIGF0dHJzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogU1ZHRWxlbWVudCB7XG4gIGZvciAobGV0IGtleSBpbiBhdHRycykgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gb3JpZW50KHBvczogY2cuUG9zLCBjb2xvcjogY2cuQ29sb3IpOiBjZy5Qb3Mge1xuICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyBwb3MgOiBbOSAtIHBvc1swXSwgOSAtIHBvc1sxXV07XG59XG5cbmZ1bmN0aW9uIG1ha2VDdXN0b21CcnVzaChiYXNlOiBEcmF3QnJ1c2gsIG1vZGlmaWVyczogRHJhd01vZGlmaWVycyk6IERyYXdCcnVzaCB7XG4gIGNvbnN0IGJydXNoOiBQYXJ0aWFsPERyYXdCcnVzaD4gPSB7XG4gICAgY29sb3I6IGJhc2UuY29sb3IsXG4gICAgb3BhY2l0eTogTWF0aC5yb3VuZChiYXNlLm9wYWNpdHkgKiAxMCkgLyAxMCxcbiAgICBsaW5lV2lkdGg6IE1hdGgucm91bmQobW9kaWZpZXJzLmxpbmVXaWR0aCB8fCBiYXNlLmxpbmVXaWR0aClcbiAgfTtcbiAgYnJ1c2gua2V5ID0gW2Jhc2Uua2V5LCBtb2RpZmllcnMubGluZVdpZHRoXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbiAgcmV0dXJuIGJydXNoIGFzIERyYXdCcnVzaDtcbn1cblxuZnVuY3Rpb24gY2lyY2xlV2lkdGgoYm91bmRzOiBDbGllbnRSZWN0KTogW251bWJlciwgbnVtYmVyXSB7XG4gIGNvbnN0IGJhc2UgPSBib3VuZHMud2lkdGggLyA1MTI7XG4gIHJldHVybiBbMyAqIGJhc2UsIDQgKiBiYXNlXTtcbn1cblxuZnVuY3Rpb24gbGluZVdpZHRoKGJydXNoOiBEcmF3QnJ1c2gsIGN1cnJlbnQ6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IG51bWJlciB7XG4gIHJldHVybiAoYnJ1c2gubGluZVdpZHRoIHx8IDEwKSAqIChjdXJyZW50ID8gMC44NSA6IDEpIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBvcGFjaXR5KGJydXNoOiBEcmF3QnJ1c2gsIGN1cnJlbnQ6IGJvb2xlYW4pOiBudW1iZXIge1xuICByZXR1cm4gKGJydXNoLm9wYWNpdHkgfHwgMSkgKiAoY3VycmVudCA/IDAuOSA6IDEpO1xufVxuXG5mdW5jdGlvbiBhcnJvd01hcmdpbihib3VuZHM6IENsaWVudFJlY3QsIHNob3J0ZW46IGJvb2xlYW4pOiBudW1iZXIge1xuICByZXR1cm4gKHNob3J0ZW4gPyAyMCA6IDEwKSAvIDUxMiAqIGJvdW5kcy53aWR0aDtcbn1cblxuZnVuY3Rpb24gcG9zMnB4KHBvczogY2cuUG9zLCBib3VuZHM6IENsaWVudFJlY3QpOiBjZy5OdW1iZXJQYWlyIHtcbiAgcmV0dXJuIFsocG9zWzBdIC0gMC41KSAqIGJvdW5kcy53aWR0aCAvIDgsICg4LjUgLSBwb3NbMV0pICogYm91bmRzLmhlaWdodCAvIDhdO1xufVxuIiwiZXhwb3J0IHR5cGUgQ29sb3IgPSAnd2hpdGUnIHwgJ2JsYWNrJztcbmV4cG9ydCB0eXBlIFJvbGUgPSAna2luZycgfCAncXVlZW4nIHwgJ3Jvb2snIHwgJ2Jpc2hvcCcgfCAna25pZ2h0JyB8ICdwYXduJztcbmV4cG9ydCB0eXBlIEtleSA9ICdhMCcgfCAnYTEnIHwgJ2IxJyB8ICdjMScgfCAnZDEnIHwgJ2UxJyB8ICdmMScgfCAnZzEnIHwgJ2gxJyB8ICdhMicgfCAnYjInIHwgJ2MyJyB8ICdkMicgfCAnZTInIHwgJ2YyJyB8ICdnMicgfCAnaDInIHwgJ2EzJyB8ICdiMycgfCAnYzMnIHwgJ2QzJyB8ICdlMycgfCAnZjMnIHwgJ2czJyB8ICdoMycgfCAnYTQnIHwgJ2I0JyB8ICdjNCcgfCAnZDQnIHwgJ2U0JyB8ICdmNCcgfCAnZzQnIHwgJ2g0JyB8ICdhNScgfCAnYjUnIHwgJ2M1JyB8ICdkNScgfCAnZTUnIHwgJ2Y1JyB8ICdnNScgfCAnaDUnIHwgJ2E2JyB8ICdiNicgfCAnYzYnIHwgJ2Q2JyB8ICdlNicgfCAnZjYnIHwgJ2c2JyB8ICdoNicgfCAnYTcnIHwgJ2I3JyB8ICdjNycgfCAnZDcnIHwgJ2U3JyB8ICdmNycgfCAnZzcnIHwgJ2g3JyB8ICdhOCcgfCAnYjgnIHwgJ2M4JyB8ICdkOCcgfCAnZTgnIHwgJ2Y4JyB8ICdnOCcgfCAnaDgnO1xuZXhwb3J0IHR5cGUgRmlsZSA9ICdhJyB8ICdiJyB8ICdjJyB8ICdkJyB8ICdlJyB8ICdmJyB8ICdnJyB8ICdoJztcbmV4cG9ydCB0eXBlIFJhbmsgPSAxIHwgMiB8IDMgfCA0IHwgNSB8IDYgfCA3IHwgODtcbmV4cG9ydCB0eXBlIEZFTiA9IHN0cmluZztcbmV4cG9ydCB0eXBlIFBvcyA9IFtudW1iZXIsIG51bWJlcl07XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlIHtcbiAgcm9sZTogUm9sZTtcbiAgY29sb3I6IENvbG9yO1xuICBwcm9tb3RlZD86IGJvb2xlYW47XG59XG5leHBvcnQgaW50ZXJmYWNlIERyb3Age1xuICByb2xlOiBSb2xlO1xuICBrZXk6IEtleTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VzIHtcbiAgW2tleTogc3RyaW5nXTogUGllY2UgfCB1bmRlZmluZWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlc0RpZmYge1xuICBba2V5OiBzdHJpbmddOiBQaWVjZSB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IHR5cGUgS2V5UGFpciA9IFtLZXksIEtleV07XG5cbmV4cG9ydCB0eXBlIE51bWJlclBhaXIgPSBbbnVtYmVyLCBudW1iZXJdO1xuXG5leHBvcnQgdHlwZSBOdW1iZXJRdWFkID0gW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVzdHMge1xuICBba2V5OiBzdHJpbmddOiBLZXlbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRzIHtcbiAgYm9hcmQ6IEhUTUxFbGVtZW50O1xuICBjb250YWluZXI6IEhUTUxFbGVtZW50O1xuICBnaG9zdD86IEhUTUxFbGVtZW50O1xuICBzdmc/OiBTVkdFbGVtZW50O1xufVxuZXhwb3J0IGludGVyZmFjZSBEb20ge1xuICBlbGVtZW50czogRWxlbWVudHMsXG4gIGJvdW5kczogTWVtbzxDbGllbnRSZWN0PjtcbiAgcmVkcmF3OiAoKSA9PiB2b2lkO1xuICByZWRyYXdOb3c6IChza2lwU3ZnPzogYm9vbGVhbikgPT4gdm9pZDtcbiAgdW5iaW5kPzogVW5iaW5kO1xuICBkZXN0cm95ZWQ/OiBib29sZWFuO1xuICByZWxhdGl2ZT86IGJvb2xlYW47IC8vIGRvbid0IGNvbXB1dGUgYm91bmRzLCB1c2UgcmVsYXRpdmUgJSB0byBwbGFjZSBwaWVjZXNcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRXhwbG9kaW5nIHtcbiAgc3RhZ2U6IG51bWJlcjtcbiAga2V5czogS2V5W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW92ZU1ldGFkYXRhIHtcbiAgcHJlbW92ZTogYm9vbGVhbjtcbiAgY3RybEtleT86IGJvb2xlYW47XG4gIGhvbGRUaW1lPzogbnVtYmVyO1xuICBjYXB0dXJlZD86IFBpZWNlO1xuICBwcmVkcm9wPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU2V0UHJlbW92ZU1ldGFkYXRhIHtcbiAgY3RybEtleT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIFdpbmRvd0V2ZW50ID0gJ29uc2Nyb2xsJyB8ICdvbnJlc2l6ZSc7XG5cbmV4cG9ydCB0eXBlIE1vdWNoRXZlbnQgPSBNb3VzZUV2ZW50ICYgVG91Y2hFdmVudDtcblxuZXhwb3J0IGludGVyZmFjZSBLZXllZE5vZGUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNnS2V5OiBLZXk7XG59XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlTm9kZSBleHRlbmRzIEtleWVkTm9kZSB7XG4gIGNnUGllY2U6IHN0cmluZztcbiAgY2dBbmltYXRpbmc/OiBib29sZWFuO1xuICBjZ0ZhZGluZz86IGJvb2xlYW47XG4gIGNnRHJhZ2dpbmc/OiBib29sZWFuO1xufVxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVOb2RlIGV4dGVuZHMgS2V5ZWROb2RlIHsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIE1lbW88QT4geyAoKTogQTsgY2xlYXI6ICgpID0+IHZvaWQ7IH1cblxuZXhwb3J0IGludGVyZmFjZSBUaW1lciB7XG4gIHN0YXJ0OiAoKSA9PiB2b2lkO1xuICBjYW5jZWw6ICgpID0+IHZvaWQ7XG4gIHN0b3A6ICgpID0+IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgUmVkcmF3ID0gKCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIFVuYmluZCA9ICgpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBNaWxsaXNlY29uZHMgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBLSHogPSBudW1iZXI7XG5cbmV4cG9ydCBjb25zdCBmaWxlczogRmlsZVtdID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnXTtcbmV4cG9ydCBjb25zdCByYW5rczogUmFua1tdID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdO1xuIiwiaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBjb25zdCBjb2xvcnM6IGNnLkNvbG9yW10gPSBbJ3doaXRlJywgJ2JsYWNrJ107XG5cbmV4cG9ydCBjb25zdCBpbnZSYW5rczogY2cuUmFua1tdID0gWzgsIDcsIDYsIDUsIDQsIDMsIDIsIDFdO1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogY2cuS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KC4uLmNnLmZpbGVzLm1hcChjID0+IGNnLnJhbmtzLm1hcChyID0+IGMrcikpKTtcblxuZXhwb3J0IGNvbnN0IHBvczJrZXkgPSAocG9zOiBjZy5Qb3MpID0+IGFsbEtleXNbOCAqIHBvc1swXSArIHBvc1sxXSAtIDldO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBjZy5LZXkpID0+IFtrLmNoYXJDb2RlQXQoMCkgLSA5Niwgay5jaGFyQ29kZUF0KDEpIC0gNDhdIGFzIGNnLlBvcztcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IGNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0OiBhbnkgPSAoKSA9PiB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkgdiA9IGYoKTtcbiAgICByZXR1cm4gdjtcbiAgfTtcbiAgcmV0LmNsZWFyID0gKCkgPT4geyB2ID0gdW5kZWZpbmVkIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBjb25zdCB0aW1lcjogKCkgPT4gY2cuVGltZXIgPSAoKSA9PiB7XG4gIGxldCBzdGFydEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIHJldHVybiB7XG4gICAgc3RhcnQoKSB7IHN0YXJ0QXQgPSBwZXJmb3JtYW5jZS5ub3coKSB9LFxuICAgIGNhbmNlbCgpIHsgc3RhcnRBdCA9IHVuZGVmaW5lZCB9LFxuICAgIHN0b3AoKSB7XG4gICAgICBpZiAoIXN0YXJ0QXQpIHJldHVybiAwO1xuICAgICAgY29uc3QgdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRBdDtcbiAgICAgIHN0YXJ0QXQgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGltZTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBvcHBvc2l0ZSA9IChjOiBjZy5Db2xvcikgPT4gYyA9PT0gJ3doaXRlJyA/ICdibGFjaycgOiAnd2hpdGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNYPFg+KHhzOiBYW10gfCB1bmRlZmluZWQsIHg6IFgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHhzICE9PSB1bmRlZmluZWQgJiYgeHMuaW5kZXhPZih4KSAhPT0gLTE7XG59XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxOiAocG9zMTogY2cuUG9zLCBwb3MyOiBjZy5Qb3MpID0+IG51bWJlciA9IChwb3MxLCBwb3MyKSA9PiB7XG4gIHJldHVybiBNYXRoLnBvdyhwb3MxWzBdIC0gcG9zMlswXSwgMikgKyBNYXRoLnBvdyhwb3MxWzFdIC0gcG9zMlsxXSwgMik7XG59XG5cbmV4cG9ydCBjb25zdCBzYW1lUGllY2U6IChwMTogY2cuUGllY2UsIHAyOiBjZy5QaWVjZSkgPT4gYm9vbGVhbiA9IChwMSwgcDIpID0+XG4gIHAxLnJvbGUgPT09IHAyLnJvbGUgJiYgcDEuY29sb3IgPT09IHAyLmNvbG9yO1xuXG5jb25zdCBwb3NUb1RyYW5zbGF0ZUJhc2U6IChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbiwgeEZhY3RvcjogbnVtYmVyLCB5RmFjdG9yOiBudW1iZXIpID0+IGNnLk51bWJlclBhaXIgPVxuKHBvcywgYXNXaGl0ZSwgeEZhY3RvciwgeUZhY3RvcikgPT4gW1xuICAoYXNXaGl0ZSA/IHBvc1swXSAtIDEgOiA4IC0gcG9zWzBdKSAqIHhGYWN0b3IsXG4gIChhc1doaXRlID8gOCAtIHBvc1sxXSA6IHBvc1sxXSAtIDEpICogeUZhY3RvclxuXTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlQWJzID0gKGJvdW5kczogQ2xpZW50UmVjdCkgPT4ge1xuICBjb25zdCB4RmFjdG9yID0gYm91bmRzLndpZHRoIC8gOCxcbiAgeUZhY3RvciA9IGJvdW5kcy5oZWlnaHQgLyA4O1xuICByZXR1cm4gKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBhc1doaXRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbDogKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBjZy5OdW1iZXJQYWlyID1cbiAgKHBvcywgYXNXaGl0ZSkgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgYXNXaGl0ZSwgMTAwLCAxMDApO1xuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlQWJzID0gKGVsOiBIVE1MRWxlbWVudCwgcG9zOiBjZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb3NbMF19cHgsJHtwb3NbMV19cHgpYDtcbn1cblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZVJlbCA9IChlbDogSFRNTEVsZW1lbnQsIHBlcmNlbnRzOiBjZy5OdW1iZXJQYWlyKSA9PiB7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwZXJjZW50c1swXX0lLCR7cGVyY2VudHNbMV19JSlgO1xufVxuXG5leHBvcnQgY29uc3Qgc2V0VmlzaWJsZSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pID0+IHtcbiAgZWwuc3R5bGUudmlzaWJpbGl0eSA9IHYgPyAndmlzaWJsZScgOiAnaGlkZGVuJztcbn1cblxuLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb246IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiBjZy5OdW1iZXJQYWlyIHwgdW5kZWZpbmVkID0gZSA9PiB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXNbMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogTW91c2VFdmVudCkgPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIHJldHVybiBlbDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGNvbG9ycywgc2V0VmlzaWJsZSwgY3JlYXRlRWwgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBmaWxlcywgcmFua3MgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgY3JlYXRlRWxlbWVudCBhcyBjcmVhdGVTVkcgfSBmcm9tICcuL3N2ZydcbmltcG9ydCB7IEVsZW1lbnRzIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd3JhcChlbGVtZW50OiBIVE1MRWxlbWVudCwgczogU3RhdGUsIHJlbGF0aXZlOiBib29sZWFuKTogRWxlbWVudHMge1xuXG4gIC8vIC5jZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBDaGVzc2dyb3VuZClcbiAgLy8gICBjZy1oZWxwZXIgKDEyLjUlKVxuICAvLyAgICAgY2ctY29udGFpbmVyICg4MDAlKVxuICAvLyAgICAgICBjZy1ib2FyZFxuICAvLyAgICAgICBzdmdcbiAgLy8gICAgICAgY29vcmRzLnJhbmtzXG4gIC8vICAgICAgIGNvb3Jkcy5maWxlc1xuICAvLyAgICAgICBwaWVjZS5naG9zdFxuXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG5cbiAgLy8gZW5zdXJlIHRoZSBjZy13cmFwIGNsYXNzIGlzIHNldFxuICAvLyBzbyBib3VuZHMgY2FsY3VsYXRpb24gY2FuIHVzZSB0aGUgQ1NTIHdpZHRoL2hlaWdodCB2YWx1ZXNcbiAgLy8gYWRkIHRoYXQgY2xhc3MgeW91cnNlbGYgdG8gdGhlIGVsZW1lbnQgYmVmb3JlIGNhbGxpbmcgY2hlc3Nncm91bmRcbiAgLy8gZm9yIGEgc2xpZ2h0IHBlcmZvcm1hbmNlIGltcHJvdmVtZW50ISAoYXZvaWRzIHJlY29tcHV0aW5nIHN0eWxlKVxuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NnLXdyYXAnKTtcblxuICBjb2xvcnMuZm9yRWFjaChjID0+IGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnb3JpZW50YXRpb24tJyArIGMsIHMub3JpZW50YXRpb24gPT09IGMpKTtcbiAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICBjb25zdCBoZWxwZXIgPSBjcmVhdGVFbCgnY2ctaGVscGVyJyk7XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaGVscGVyKTtcbiAgY29uc3QgY29udGFpbmVyID0gY3JlYXRlRWwoJ2NnLWNvbnRhaW5lcicpO1xuICBoZWxwZXIuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdjZy1ib2FyZCcpO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBzdmc6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUgJiYgIXJlbGF0aXZlKSB7XG4gICAgc3ZnID0gY3JlYXRlU1ZHKCdzdmcnKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHKCdkZWZzJykpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzdmcpO1xuICB9XG5cbiAgaWYgKHMuY29vcmRpbmF0ZXMpIHtcbiAgICBjb25zdCBvcmllbnRDbGFzcyA9IHMub3JpZW50YXRpb24gPT09ICdibGFjaycgPyAnIGJsYWNrJyA6ICcnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMocmFua3MsICdyYW5rcycgKyBvcmllbnRDbGFzcykpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcykpO1xuICB9XG5cbiAgbGV0IGdob3N0OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuZHJhZ2dhYmxlLnNob3dHaG9zdCAmJiAhcmVsYXRpdmUpIHtcbiAgICBnaG9zdCA9IGNyZWF0ZUVsKCdwaWVjZScsICdnaG9zdCcpO1xuICAgIHNldFZpc2libGUoZ2hvc3QsIGZhbHNlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2hvc3QpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZCxcbiAgICBjb250YWluZXIsXG4gICAgZ2hvc3QsXG4gICAgc3ZnXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNvb3JkcyhlbGVtczogYW55W10sIGNsYXNzTmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsKCdjb29yZHMnLCBjbGFzc05hbWUpO1xuICBsZXQgZjogSFRNTEVsZW1lbnQ7XG4gIGZvciAobGV0IGkgaW4gZWxlbXMpIHtcbiAgICBmID0gY3JlYXRlRWwoJ2Nvb3JkJyk7XG4gICAgZi50ZXh0Q29udGVudCA9IGVsZW1zW2ldO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuZnVuY3Rpb24gYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCkge1xuICAgIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICAgIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZERhdGEgPSBjaGlsZHJlbltpXS5kYXRhO1xuICAgICAgICAgICAgaWYgKGNoaWxkRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWRkTlMoY2hpbGREYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGgoc2VsLCBiLCBjKSB7XG4gICAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhID0gYjtcbiAgICAgICAgaWYgKGlzLmFycmF5KGMpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjICYmIGMuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtjXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzLmFycmF5KGIpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiICYmIGIuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtiXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSlcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IHZub2RlXzEudm5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxbMF0gPT09ICdzJyAmJiBzZWxbMV0gPT09ICd2JyAmJiBzZWxbMl0gPT09ICdnJyAmJlxuICAgICAgICAoc2VsLmxlbmd0aCA9PT0gMyB8fCBzZWxbM10gPT09ICcuJyB8fCBzZWxbM10gPT09ICcjJykpIHtcbiAgICAgICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZV8xLnZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59XG5leHBvcnRzLmggPSBoO1xuO1xuZXhwb3J0cy5kZWZhdWx0ID0gaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xufVxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpIHtcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCkge1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuZnVuY3Rpb24gcGFyZW50Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cbmZ1bmN0aW9uIHRhZ05hbWUoZWxtKSB7XG4gICAgcmV0dXJuIGVsbS50YWdOYW1lO1xufVxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCkge1xuICAgIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRleHRDb250ZW50O1xufVxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cbmZ1bmN0aW9uIGlzVGV4dChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5leHBvcnRzLmh0bWxEb21BcGkgPSB7XG4gICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgICBjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcbiAgICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBnZXRUZXh0Q29udGVudDogZ2V0VGV4dENvbnRlbnQsXG4gICAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gICAgaXNUZXh0OiBpc1RleHQsXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5odG1sRG9tQXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbGRvbWFwaS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYXJyYXkgPSBBcnJheS5pc0FycmF5O1xuZnVuY3Rpb24gcHJpbWl0aXZlKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMucHJpbWl0aXZlID0gcHJpbWl0aXZlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIga2V5LCBlbG0gPSB2bm9kZS5lbG0sIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzO1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgdmFyIGN1ciA9IGF0dHJzW2tleV07XG4gICAgICAgIHZhciBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgICAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgICAgICAgIGlmIChjdXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZShrZXksIGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdpZCcsIHNlbC5zbGljZShoYXNoICsgMSwgZG90KSk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKCdjbGFzcycsIHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAob2xkQXJnc1tpXSAhPT0gYXJnc1tpXSkge1xuICAgICAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5VG9UaHVuayhvbGRWbm9kZSwgdGh1bmspO1xufVxuZXhwb3J0cy50aHVuayA9IGZ1bmN0aW9uIHRodW5rKHNlbCwga2V5LCBmbiwgYXJncykge1xuICAgIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXJncyA9IGZuO1xuICAgICAgICBmbiA9IGtleTtcbiAgICAgICAga2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaF8xLmgoc2VsLCB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBob29rOiB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCB9LFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnRodW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGh1bmsuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiB2bm9kZShzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgICB2YXIga2V5ID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YS5rZXk7XG4gICAgcmV0dXJuIHsgc2VsOiBzZWwsIGRhdGE6IGRhdGEsIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5IH07XG59XG5leHBvcnRzLnZub2RlID0gdm5vZGU7XG5leHBvcnRzLmRlZmF1bHQgPSB2bm9kZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZub2RlLmpzLm1hcCIsImltcG9ydCB7IEN0cmwsIENoYXRPcHRzLCBMaW5lLCBUYWIsIFZpZXdNb2RlbCwgUmVkcmF3LCBQZXJtaXNzaW9ucywgTW9kZXJhdGlvbkN0cmwgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgeyBwcmVzZXRDdHJsIH0gZnJvbSAnLi9wcmVzZXQnXG5pbXBvcnQgeyBub3RlQ3RybCB9IGZyb20gJy4vbm90ZSdcbmltcG9ydCB7IG1vZGVyYXRpb25DdHJsIH0gZnJvbSAnLi9tb2RlcmF0aW9uJ1xuaW1wb3J0IHsgcHJvcCB9IGZyb20gJ2NvbW1vbic7XG5cbmNvbnN0IGxpID0gd2luZG93LmxpY2hlc3M7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9wdHM6IENoYXRPcHRzLCByZWRyYXc6IFJlZHJhdyk6IEN0cmwge1xuXG4gIGNvbnN0IGRhdGEgPSBvcHRzLmRhdGE7XG4gIGRhdGEuZG9tVmVyc2lvbiA9IDE7IC8vIGluY3JlbWVudCB0byBmb3JjZSByZWRyYXdcbiAgY29uc3QgbWF4TGluZXMgPSAyMDA7XG4gIGNvbnN0IG1heExpbmVzRHJvcCA9IDUwOyAvLyBob3cgbWFueSBsaW5lcyB0byBkcm9wIGF0IG9uY2VcblxuICBjb25zdCBwYWxhbnRpciA9IHtcbiAgICBpbnN0YW5jZTogdW5kZWZpbmVkLFxuICAgIGxvYWRlZDogZmFsc2UsXG4gICAgZW5hYmxlZDogcHJvcCghIWRhdGEucGFsYW50aXIpXG4gIH07XG5cbiAgY29uc3QgYWxsVGFiczogVGFiW10gPSBbJ2Rpc2N1c3Npb24nXTtcbiAgaWYgKG9wdHMubm90ZUlkKSBhbGxUYWJzLnB1c2goJ25vdGUnKTtcbiAgaWYgKG9wdHMucGx1Z2luKSBhbGxUYWJzLnB1c2gob3B0cy5wbHVnaW4udGFiLmtleSk7XG5cbiAgY29uc3QgdGFiU3RvcmFnZSA9IGxpLnN0b3JhZ2UubWFrZSgnY2hhdC50YWInKSxcbiAgICBzdG9yZWRUYWIgPSB0YWJTdG9yYWdlLmdldCgpO1xuXG4gIGxldCBtb2RlcmF0aW9uOiBNb2RlcmF0aW9uQ3RybCB8IHVuZGVmaW5lZDtcblxuICBjb25zdCB2bTogVmlld01vZGVsID0ge1xuICAgIHRhYjogYWxsVGFicy5maW5kKHRhYiA9PiB0YWIgPT09IHN0b3JlZFRhYikgfHwgYWxsVGFic1swXSxcbiAgICBlbmFibGVkOiBvcHRzLmFsd2F5c0VuYWJsZWQgfHwgIWxpLnN0b3JhZ2UuZ2V0KCdub2NoYXQnKSxcbiAgICBwbGFjZWhvbGRlcktleTogJ3RhbGtJbkNoYXQnLFxuICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgIHRpbWVvdXQ6IG9wdHMudGltZW91dCxcbiAgICB3cml0ZWFibGU6IG9wdHMud3JpdGVhYmxlXG4gIH07XG5cbiAgLyogSWYgZGlzY3Vzc2lvbiBpcyBkaXNhYmxlZCwgYW5kIHdlIGhhdmUgYW5vdGhlciBjaGF0IHRhYixcbiAgICogdGhlbiBzZWxlY3QgdGhhdCB0YWIgb3ZlciBkaXNjdXNzaW9uICovXG4gIGlmIChhbGxUYWJzLmxlbmd0aCA+IDEgJiYgdm0udGFiID09PSAnZGlzY3Vzc2lvbicgJiYgbGkuc3RvcmFnZS5nZXQoJ25vY2hhdCcpKSB2bS50YWIgPSBhbGxUYWJzWzFdO1xuXG4gIGNvbnN0IHBvc3QgPSBmdW5jdGlvbih0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0ZXh0ID0gdGV4dC50cmltKCk7XG4gICAgaWYgKCF0ZXh0KSByZXR1cm47XG4gICAgaWYgKHRleHQubGVuZ3RoID4gMTQwKSB7XG4gICAgICBhbGVydCgnTWF4IGxlbmd0aDogMTQwIGNoYXJzLiAnICsgdGV4dC5sZW5ndGggKyAnIGNoYXJzIHVzZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxpLnB1YnN1Yi5lbWl0KCdzb2NrZXQuc2VuZCcsICd0YWxrJywgdGV4dCk7XG4gIH07XG5cbiAgY29uc3Qgb25UaW1lb3V0ID0gZnVuY3Rpb24odXNlcklkOiBzdHJpbmcpIHtcbiAgICBkYXRhLmxpbmVzLmZvckVhY2gobCA9PiB7XG4gICAgICBpZiAobC51ICYmIGwudS50b0xvd2VyQ2FzZSgpID09IHVzZXJJZCkgbC5kID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBpZiAodXNlcklkID09IGRhdGEudXNlcklkKSB2bS50aW1lb3V0ID0gdHJ1ZTtcbiAgICBkYXRhLmRvbVZlcnNpb24rKztcbiAgICByZWRyYXcoKTtcbiAgfTtcblxuICBjb25zdCBvblJlaW5zdGF0ZSA9IGZ1bmN0aW9uKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgaWYgKHVzZXJJZCA9PSBkYXRhLnVzZXJJZCkge1xuICAgICAgdm0udGltZW91dCA9IGZhbHNlO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG9uTWVzc2FnZSA9IGZ1bmN0aW9uKGxpbmU6IExpbmUpIHtcbiAgICBkYXRhLmxpbmVzLnB1c2gobGluZSk7XG4gICAgY29uc3QgbmIgPSBkYXRhLmxpbmVzLmxlbmd0aDtcbiAgICBpZiAobmIgPiBtYXhMaW5lcykge1xuICAgICAgZGF0YS5saW5lcy5zcGxpY2UoMCwgbmIgLSBtYXhMaW5lcyArIG1heExpbmVzRHJvcCk7XG4gICAgICBkYXRhLmRvbVZlcnNpb24rKztcbiAgICB9XG4gICAgcmVkcmF3KCk7XG4gIH07XG5cbiAgY29uc3Qgb25Xcml0ZWFibGUgPSBmdW5jdGlvbih2OiBib29sZWFuKSB7XG4gICAgdm0ud3JpdGVhYmxlID0gdjtcbiAgICByZWRyYXcoKTtcbiAgfVxuXG4gIGNvbnN0IG9uUGVybWlzc2lvbnMgPSBmdW5jdGlvbihvYmo6IFBlcm1pc3Npb25zKSB7XG4gICAgbGV0IHA6IGtleW9mIFBlcm1pc3Npb25zO1xuICAgIGZvciAocCBpbiBvYmopIG9wdHMucGVybWlzc2lvbnNbcF0gPSBvYmpbcF07XG4gICAgaW5zdGFuY2lhdGVNb2RlcmF0aW9uKCk7XG4gICAgcmVkcmF3KCk7XG4gIH1cblxuICBjb25zdCB0cmFucyA9IGxpLnRyYW5zKG9wdHMuaTE4bik7XG5cbiAgZnVuY3Rpb24gY2FuTW9kKCkge1xuICAgIHJldHVybiBvcHRzLnBlcm1pc3Npb25zLnRpbWVvdXQgfHwgb3B0cy5wZXJtaXNzaW9ucy5sb2NhbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc3RhbmNpYXRlTW9kZXJhdGlvbigpIHtcbiAgICBtb2RlcmF0aW9uID0gY2FuTW9kKCkgPyBtb2RlcmF0aW9uQ3RybCh7XG4gICAgICByZWFzb25zOiBvcHRzLnRpbWVvdXRSZWFzb25zIHx8IChbe2tleTogJ290aGVyJywgbmFtZTogJ0luYXBwcm9wcmlhdGUgYmVoYXZpb3InfV0pLFxuICAgICAgcGVybWlzc2lvbnM6IG9wdHMucGVybWlzc2lvbnMsXG4gICAgICByZWRyYXdcbiAgICB9KSA6IHVuZGVmaW5lZDtcbiAgICBpZiAoY2FuTW9kKCkpIG9wdHMubG9hZENzcygnY2hhdC5tb2QnKTtcbiAgfVxuICBpbnN0YW5jaWF0ZU1vZGVyYXRpb24oKTtcblxuICBjb25zdCBub3RlID0gb3B0cy5ub3RlSWQgPyBub3RlQ3RybCh7XG4gICAgaWQ6IG9wdHMubm90ZUlkLFxuICAgIHRyYW5zLFxuICAgIHJlZHJhd1xuICB9KSA6IHVuZGVmaW5lZDtcblxuICBjb25zdCBwcmVzZXQgPSBwcmVzZXRDdHJsKHtcbiAgICBpbml0aWFsR3JvdXA6IG9wdHMucHJlc2V0LFxuICAgIHBvc3QsXG4gICAgcmVkcmF3XG4gIH0pO1xuXG4gIGNvbnN0IHN1YnM6IFtzdHJpbmcsIFB1YnN1YkNhbGxiYWNrXVtdICA9IFtcbiAgICBbJ3NvY2tldC5pbi5tZXNzYWdlJywgb25NZXNzYWdlXSxcbiAgICBbJ3NvY2tldC5pbi5jaGF0X3RpbWVvdXQnLCBvblRpbWVvdXRdLFxuICAgIFsnc29ja2V0LmluLmNoYXRfcmVpbnN0YXRlJywgb25SZWluc3RhdGVdLFxuICAgIFsnY2hhdC53cml0ZWFibGUnLCBvbldyaXRlYWJsZV0sXG4gICAgWydjaGF0LnBlcm1pc3Npb25zJywgb25QZXJtaXNzaW9uc10sXG4gICAgWydwYWxhbnRpci50b2dnbGUnLCBwYWxhbnRpci5lbmFibGVkXVxuICBdO1xuICBzdWJzLmZvckVhY2goKFtldmVudE5hbWUsIGNhbGxiYWNrXSkgPT4gbGkucHVic3ViLm9uKGV2ZW50TmFtZSwgY2FsbGJhY2spKTtcblxuICBjb25zdCBkZXN0cm95ID0gKCkgPT4ge1xuICAgIHN1YnMuZm9yRWFjaCgoW2V2ZW50TmFtZSwgY2FsbGJhY2tdKSA9PiBsaS5wdWJzdWIub2ZmKGV2ZW50TmFtZSwgY2FsbGJhY2spKTtcbiAgfTtcblxuICBjb25zdCBlbWl0RW5hYmxlZCA9ICgpID0+IGxpLnB1YnN1Yi5lbWl0KCdjaGF0LmVuYWJsZWQnLCB2bS5lbmFibGVkKTtcbiAgZW1pdEVuYWJsZWQoKTtcblxuICByZXR1cm4ge1xuICAgIGRhdGEsXG4gICAgb3B0cyxcbiAgICB2bSxcbiAgICBhbGxUYWJzLFxuICAgIHNldFRhYih0OiBUYWIpIHtcbiAgICAgIHZtLnRhYiA9IHQ7XG4gICAgICB0YWJTdG9yYWdlLnNldCh0KTtcbiAgICAgIC8vIEl0J3MgYSBsYW1lIHdheSB0byBkbyBpdC4gR2l2ZSBtZSBhIGJyZWFrLlxuICAgICAgaWYgKHQgPT09ICdkaXNjdXNzaW9uJykgbGkucmVxdWVzdElkbGVDYWxsYmFjaygoKSA9PiAkKCcubWNoYXRfX3NheScpLmZvY3VzKCkpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSxcbiAgICBtb2RlcmF0aW9uOiAoKSA9PiBtb2RlcmF0aW9uLFxuICAgIG5vdGUsXG4gICAgcHJlc2V0LFxuICAgIHBvc3QsXG4gICAgdHJhbnMsXG4gICAgcGx1Z2luOiBvcHRzLnBsdWdpbixcbiAgICBzZXRFbmFibGVkKHY6IGJvb2xlYW4pIHtcbiAgICAgIHZtLmVuYWJsZWQgPSB2O1xuICAgICAgZW1pdEVuYWJsZWQoKTtcbiAgICAgIGlmICghdikgbGkuc3RvcmFnZS5zZXQoJ25vY2hhdCcsICcxJyk7XG4gICAgICBlbHNlIGxpLnN0b3JhZ2UucmVtb3ZlKCdub2NoYXQnKTtcbiAgICAgIHJlZHJhdygpO1xuICAgIH0sXG4gICAgcmVkcmF3LFxuICAgIHBhbGFudGlyLFxuICAgIGRlc3Ryb3lcbiAgfTtcbn07XG4iLCJpbXBvcnQgeyBoLCB0aHVuayB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUsIFZOb2RlRGF0YSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgQ3RybCwgTGluZSB9IGZyb20gJy4vaW50ZXJmYWNlcydcbmltcG9ydCAqIGFzIHNwYW0gZnJvbSAnLi9zcGFtJ1xuaW1wb3J0ICogYXMgZW5oYW5jZSBmcm9tICcuL2VuaGFuY2UnO1xuaW1wb3J0IHsgcHJlc2V0VmlldyB9IGZyb20gJy4vcHJlc2V0JztcbmltcG9ydCB7IGxpbmVBY3Rpb24gYXMgbW9kTGluZUFjdGlvbiB9IGZyb20gJy4vbW9kZXJhdGlvbic7XG5pbXBvcnQgeyB1c2VyTGluayB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBmbGFnIH0gZnJvbSAnLi94aHInXG5cbmNvbnN0IHdoaXNwZXJSZWdleCA9IC9eXFwvdyg/Omhpc3Blcik/XFxzLztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY3RybDogQ3RybCk6IEFycmF5PFZOb2RlIHwgdW5kZWZpbmVkPiB7XG4gIGlmICghY3RybC52bS5lbmFibGVkKSByZXR1cm4gW107XG4gIGNvbnN0IHNjcm9sbENiID0gKHZub2RlOiBWTm9kZSkgPT4ge1xuICAgIGNvbnN0IGVsID0gdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50XG4gICAgaWYgKGN0cmwuZGF0YS5saW5lcy5sZW5ndGggPiA1KSB7XG4gICAgICBjb25zdCBhdXRvU2Nyb2xsID0gKGVsLnNjcm9sbFRvcCA9PT0gMCB8fCAoZWwuc2Nyb2xsVG9wID4gKGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodCAtIDEwMCkpKTtcbiAgICAgIGlmIChhdXRvU2Nyb2xsKSB7XG4gICAgICAgIGVsLnNjcm9sbFRvcCA9IDk5OTk5OTtcbiAgICAgICAgc2V0VGltZW91dCgoXzogYW55KSA9PiBlbC5zY3JvbGxUb3AgPSA5OTk5OTksIDMwMClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG1vZCA9IGN0cmwubW9kZXJhdGlvbigpO1xuICBjb25zdCB2bm9kZXMgPSBbXG4gICAgaCgnb2wubWNoYXRfX21lc3NhZ2VzLmNoYXQtdi0nICsgY3RybC5kYXRhLmRvbVZlcnNpb24sIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIHJvbGU6ICdsb2cnLFxuICAgICAgICAnYXJpYS1saXZlJzogJ3BvbGl0ZScsXG4gICAgICAgICdhcmlhLWF0b21pYyc6IGZhbHNlXG4gICAgICB9LFxuICAgICAgaG9vazoge1xuICAgICAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgICAgICBjb25zdCAkZWwgPSAkKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkub24oJ2NsaWNrJywgJ2EuanVtcCcsIChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LmxpY2hlc3MucHVic3ViLmVtaXQoJ2p1bXAnLCAoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEF0dHJpYnV0ZSgnZGF0YS1wbHknKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKG1vZCkgJGVsLm9uKCdjbGljaycsICcubW9kJywgKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBtb2Qub3BlbigoKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlcm5hbWUnKSBhcyBzdHJpbmcpLnNwbGl0KCcgJylbMF0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsc2UgJGVsLm9uKCdjbGljaycsICcuZmxhZycsIChlOiBFdmVudCkgPT5cbiAgICAgICAgICAgIHJlcG9ydChjdHJsLCAoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLnBhcmVudE5vZGUgYXMgSFRNTEVsZW1lbnQpXG4gICAgICAgICAgKTtcbiAgICAgICAgICBzY3JvbGxDYih2bm9kZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHBvc3RwYXRjaDogKF8sIHZub2RlKSA9PiBzY3JvbGxDYih2bm9kZSlcbiAgICAgIH1cbiAgICB9LCBzZWxlY3RMaW5lcyhjdHJsKS5tYXAobGluZSA9PiByZW5kZXJMaW5lKGN0cmwsIGxpbmUpKSksXG4gICAgcmVuZGVySW5wdXQoY3RybClcbiAgXTtcbiAgY29uc3QgcHJlc2V0cyA9IHByZXNldFZpZXcoY3RybC5wcmVzZXQpO1xuICBpZiAocHJlc2V0cykgdm5vZGVzLnB1c2gocHJlc2V0cylcbiAgcmV0dXJuIHZub2Rlcztcbn1cblxuZnVuY3Rpb24gcmVuZGVySW5wdXQoY3RybDogQ3RybCk6IFZOb2RlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFjdHJsLnZtLndyaXRlYWJsZSkgcmV0dXJuO1xuICBpZiAoKGN0cmwuZGF0YS5sb2dpblJlcXVpcmVkICYmICFjdHJsLmRhdGEudXNlcklkKSB8fCBjdHJsLmRhdGEucmVzdHJpY3RlZClcbiAgICByZXR1cm4gaCgnaW5wdXQubWNoYXRfX3NheScsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIHBsYWNlaG9sZGVyOiBjdHJsLnRyYW5zKCdsb2dpblRvQ2hhdCcpLFxuICAgICAgICBkaXNhYmxlZDogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICBsZXQgcGxhY2Vob2xkZXI6IHN0cmluZztcbiAgaWYgKGN0cmwudm0udGltZW91dCkgcGxhY2Vob2xkZXIgPSBjdHJsLnRyYW5zKCd5b3VIYXZlQmVlblRpbWVkT3V0Jyk7XG4gIGVsc2UgaWYgKGN0cmwub3B0cy5ibGluZCkgcGxhY2Vob2xkZXIgPSAnQ2hhdCc7XG4gIGVsc2UgcGxhY2Vob2xkZXIgPSBjdHJsLnRyYW5zLm5vYXJnKGN0cmwudm0ucGxhY2Vob2xkZXJLZXkpO1xuICByZXR1cm4gaCgnaW5wdXQubWNoYXRfX3NheScsIHtcbiAgICBhdHRyczoge1xuICAgICAgcGxhY2Vob2xkZXIsXG4gICAgICBhdXRvY29tcGxldGU6ICdvZmYnLFxuICAgICAgbWF4bGVuZ3RoOiAxNDAsXG4gICAgICBkaXNhYmxlZDogY3RybC52bS50aW1lb3V0IHx8ICFjdHJsLnZtLndyaXRlYWJsZVxuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgIHNldHVwSG9va3MoY3RybCwgdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5sZXQgbW91Y2hMaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjtcblxuY29uc3Qgc2V0dXBIb29rcyA9IChjdHJsOiBDdHJsLCBjaGF0RWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gIGNoYXRFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsXG4gICAgKGU6IEtleWJvYXJkRXZlbnQpID0+IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgZWwgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50LFxuICAgICAgICB0eHQgPSBlbC52YWx1ZSxcbiAgICAgICAgcHViID0gY3RybC5vcHRzLnB1YmxpYztcbiAgICAgIGlmIChlLndoaWNoID09IDEwIHx8IGUud2hpY2ggPT0gMTMpIHtcbiAgICAgICAgaWYgKHR4dCA9PT0gJycpICQoJy5rZXlib2FyZC1tb3ZlIGlucHV0JykuZm9jdXMoKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc3BhbS5yZXBvcnQodHh0KTtcbiAgICAgICAgICBpZiAocHViICYmIHNwYW0uaGFzVGVhbVVybCh0eHQpKSBhbGVydChcIlBsZWFzZSBkb24ndCBhZHZlcnRpc2UgdGVhbXMgaW4gdGhlIGNoYXQuXCIpO1xuICAgICAgICAgIGVsc2UgY3RybC5wb3N0KHR4dCk7XG4gICAgICAgICAgZWwudmFsdWUgPSAnJztcbiAgICAgICAgICBpZiAoIXB1YikgZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2hpc3BlcicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdwbGFjZWhvbGRlcicpO1xuICAgICAgICBpZiAoIXB1YikgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnd2hpc3BlcicsICEhdHh0Lm1hdGNoKHdoaXNwZXJSZWdleCkpO1xuICAgICAgfVxuICAgIH0pXG4gICk7XG5cbiAgd2luZG93Lk1vdXNldHJhcC5iaW5kKCdjJywgKCkgPT4ge1xuICAgIGNoYXRFbC5mb2N1cygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgd2luZG93Lk1vdXNldHJhcChjaGF0RWwpLmJpbmQoJ2VzYycsICgpID0+IGNoYXRFbC5ibHVyKCkpO1xuXG5cbiAgLy8gRW5zdXJlIGNsaWNrcyByZW1vdmUgY2hhdCBmb2N1cy5cbiAgLy8gU2VlIG9ybmljYXIvY2hlc3Nncm91bmQjMTA5XG5cbiAgY29uc3QgbW91Y2hFdmVudHMgPSBbJ3RvdWNoc3RhcnQnLCAnbW91c2Vkb3duJ107XG5cbiAgaWYgKG1vdWNoTGlzdGVuZXIpIG1vdWNoRXZlbnRzLmZvckVhY2goZXZlbnQgPT5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG1vdWNoTGlzdGVuZXIsIHtjYXB0dXJlOiB0cnVlfSlcbiAgKTtcblxuICBtb3VjaExpc3RlbmVyID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICBpZiAoIWUuc2hpZnRLZXkgJiYgZS5idXR0b25zICE9PSAyICYmIGUuYnV0dG9uICE9PSAyKSBjaGF0RWwuYmx1cigpO1xuICB9O1xuXG4gIGNoYXRFbC5vbmZvY3VzID0gKCkgPT5cbiAgICBtb3VjaEV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+XG4gICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG1vdWNoTGlzdGVuZXIsXG4gICAgICAgIHtwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlfVxuICAgICAgKSk7XG5cbiAgY2hhdEVsLm9uYmx1ciA9ICgpID0+XG4gICAgbW91Y2hFdmVudHMuZm9yRWFjaChldmVudCA9PlxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBtb3VjaExpc3RlbmVyLCB7Y2FwdHVyZTogdHJ1ZX0pXG4gICAgKTtcbn07XG5cbmZ1bmN0aW9uIHNhbWVMaW5lcyhsMTogTGluZSwgbDI6IExpbmUpIHtcbiAgcmV0dXJuIGwxLmQgJiYgbDIuZCAmJiBsMS51ID09PSBsMi51O1xufVxuXG5mdW5jdGlvbiBzZWxlY3RMaW5lcyhjdHJsOiBDdHJsKTogQXJyYXk8TGluZT4ge1xuICBsZXQgcHJldjogTGluZSwgbHM6IEFycmF5PExpbmU+ID0gW107XG4gIGN0cmwuZGF0YS5saW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xuICAgIGlmICghbGluZS5kICYmXG4gICAgICAoIXByZXYgfHwgIXNhbWVMaW5lcyhwcmV2LCBsaW5lKSkgJiZcbiAgICAgICghbGluZS5yIHx8IChsaW5lLnUgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT0gY3RybC5kYXRhLnVzZXJJZCkgJiZcbiAgICAgICFzcGFtLnNraXAobGluZS50KVxuICAgICkgbHMucHVzaChsaW5lKTtcbiAgICBwcmV2ID0gbGluZTtcbiAgfSk7XG4gIHJldHVybiBscztcbn1cblxuZnVuY3Rpb24gdXBkYXRlVGV4dChwYXJzZU1vdmVzOiBib29sZWFuKSB7XG4gIHJldHVybiAob2xkVm5vZGU6IFZOb2RlLCB2bm9kZTogVk5vZGUpID0+IHtcbiAgICBpZiAoKHZub2RlLmRhdGEgYXMgVk5vZGVEYXRhKS5saWNoZXNzQ2hhdCAhPT0gKG9sZFZub2RlLmRhdGEgYXMgVk5vZGVEYXRhKS5saWNoZXNzQ2hhdCkge1xuICAgICAgKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkuaW5uZXJIVE1MID0gZW5oYW5jZS5lbmhhbmNlKCh2bm9kZS5kYXRhIGFzIFZOb2RlRGF0YSkubGljaGVzc0NoYXQsIHBhcnNlTW92ZXMpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVGV4dCh0OiBzdHJpbmcsIHBhcnNlTW92ZXM6IGJvb2xlYW4pIHtcbiAgaWYgKGVuaGFuY2UuaXNNb3JlVGhhblRleHQodCkpIHtcbiAgICBjb25zdCBob29rID0gdXBkYXRlVGV4dChwYXJzZU1vdmVzKTtcbiAgICByZXR1cm4gaCgndCcsIHtcbiAgICAgIGxpY2hlc3NDaGF0OiB0LFxuICAgICAgaG9vazoge1xuICAgICAgICBjcmVhdGU6IGhvb2ssXG4gICAgICAgIHVwZGF0ZTogaG9va1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBoKCd0JywgdCk7XG59XG5cbmZ1bmN0aW9uIHJlcG9ydChjdHJsOiBDdHJsLCBsaW5lOiBIVE1MRWxlbWVudCkge1xuICBjb25zdCB1c2VyQSA9IGxpbmUucXVlcnlTZWxlY3RvcignYS51c2VyLWxpbmsnKSBhcyBIVE1MTGlua0VsZW1lbnQ7XG4gIGNvbnN0IHRleHQgPSAobGluZS5xdWVyeVNlbGVjdG9yKCd0JykgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dDtcbiAgaWYgKHVzZXJBICYmIGNvbmZpcm0oYFJlcG9ydCBcIiR7dGV4dH1cIiB0byBtb2RlcmF0b3JzP2ApKSBmbGFnKFxuICAgIGN0cmwuZGF0YS5yZXNvdXJjZUlkLFxuICAgIHVzZXJBLmhyZWYuc3BsaXQoJy8nKVs0XSxcbiAgICB0ZXh0XG4gICk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxpbmUoY3RybDogQ3RybCwgbGluZTogTGluZSkge1xuXG4gIGNvbnN0IHRleHROb2RlID0gcmVuZGVyVGV4dChsaW5lLnQsIGN0cmwub3B0cy5wYXJzZU1vdmVzKTtcblxuICBpZiAobGluZS51ID09PSAnbGljaGVzcycpIHJldHVybiBoKCdsaS5zeXN0ZW0nLCB0ZXh0Tm9kZSk7XG5cbiAgaWYgKGxpbmUuYykgcmV0dXJuIGgoJ2xpJywgW1xuICAgIGgoJ3NwYW4uY29sb3InLCAnWycgKyBsaW5lLmMgKyAnXScpLFxuICAgIHRleHROb2RlXG4gIF0pO1xuXG4gIGNvbnN0IHVzZXJOb2RlID0gdGh1bmsoJ2EnLCBsaW5lLnUsIHVzZXJMaW5rLCBbbGluZS51LCBsaW5lLnRpdGxlXSk7XG5cbiAgcmV0dXJuIGgoJ2xpJywge1xuICB9LCBjdHJsLm1vZGVyYXRpb24oKSA/IFtcbiAgICBsaW5lLnUgPyBtb2RMaW5lQWN0aW9uKGxpbmUudSkgOiBudWxsLFxuICAgIHVzZXJOb2RlLFxuICAgIHRleHROb2RlXG4gIF0gOiBbXG4gICAgY3RybC5kYXRhLnVzZXJJZCAmJiBsaW5lLnUgJiYgY3RybC5kYXRhLnVzZXJJZCAhPSBsaW5lLnUgPyBoKCdpLmZsYWcnLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICAnZGF0YS1pY29uJzogJyEnLFxuICAgICAgICB0aXRsZTogJ1JlcG9ydCdcbiAgICAgIH1cbiAgICB9KSA6IG51bGwsXG4gICAgdXNlck5vZGUsXG4gICAgdGV4dE5vZGVcbiAgXSk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZW5oYW5jZSh0ZXh0OiBzdHJpbmcsIHBhcnNlTW92ZXM6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBjb25zdCBlc2NhcGVkID0gd2luZG93LmxpY2hlc3MuZXNjYXBlSHRtbCh0ZXh0KTtcbiAgY29uc3QgbGlua2VkID0gYXV0b0xpbmsoZXNjYXBlZCk7XG4gIGNvbnN0IHBsaWVkID0gcGFyc2VNb3ZlcyAmJiBsaW5rZWQgPT09IGVzY2FwZWQgPyBhZGRQbGllcyhsaW5rZWQpIDogbGlua2VkO1xuICByZXR1cm4gcGxpZWQ7XG59XG5cbmNvbnN0IG1vcmVUaGFuVGV4dFBhdHRlcm4gPSAvWyY8PlwiQF0vO1xuY29uc3QgcG9zc2libGVMaW5rUGF0dGVybiA9IC9cXC5cXHcvO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNNb3JlVGhhblRleHQoc3RyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG1vcmVUaGFuVGV4dFBhdHRlcm4udGVzdChzdHIpIHx8IHBvc3NpYmxlTGlua1BhdHRlcm4udGVzdChzdHIpO1xufVxuXG5jb25zdCBsaW5rUGF0dGVybiA9IC9cXGIoaHR0cHM/OlxcL1xcL3xsaWNoZXNzXFwub3JnXFwvKVst4oCT4oCUXFx3KyYnQCNcXC8lPz0oKX58ITosLjtdK1tcXHcrJkAjXFwvJT1+fF0vZ2k7XG5cbmZ1bmN0aW9uIGxpbmtSZXBsYWNlKHVybDogc3RyaW5nLCBzY2hlbWU6IHN0cmluZykge1xuICBpZiAodXJsLmluY2x1ZGVzKCcmcXVvdDsnKSkgcmV0dXJuIHVybDtcbiAgY29uc3QgZnVsbFVybCA9IHNjaGVtZSA9PT0gJ2xpY2hlc3Mub3JnLycgPyAnaHR0cHM6Ly8nICsgdXJsIDogdXJsO1xuICBjb25zdCBtaW5VcmwgPSB1cmwucmVwbGFjZSgvXmh0dHBzOlxcL1xcLy8sICcnKTtcbiAgcmV0dXJuICc8YSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub2ZvbGxvd1wiIGhyZWY9XCInICsgZnVsbFVybCArICdcIj4nICsgbWluVXJsICsgJzwvYT4nO1xufVxuXG5jb25zdCB1c2VyUGF0dGVybiA9IC8oXnxbXlxcd0AjL10pQChbXFx3LV17Mix9KS9nO1xuY29uc3QgcGF3bkRyb3BQYXR0ZXJuID0gL15bYS1oXVsyLTddJC87XG5cbmZ1bmN0aW9uIHVzZXJMaW5rUmVwbGFjZShvcmlnOiBzdHJpbmcsIHByZWZpeDogU3RyaW5nLCB1c2VyOiBzdHJpbmcpIHtcbiAgaWYgKHVzZXIubGVuZ3RoID4gMjAgfHwgdXNlci5tYXRjaChwYXduRHJvcFBhdHRlcm4pKSByZXR1cm4gb3JpZztcbiAgcmV0dXJuIHByZWZpeCArICc8YSBocmVmPVwiL0AvJyArIHVzZXIgKyAnXCI+QCcgKyB1c2VyICsgXCI8L2E+XCI7XG59XG5cbmZ1bmN0aW9uIGF1dG9MaW5rKGh0bWw6IHN0cmluZykge1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKHVzZXJQYXR0ZXJuLCB1c2VyTGlua1JlcGxhY2UpLnJlcGxhY2UobGlua1BhdHRlcm4sIGxpbmtSZXBsYWNlKTtcbn1cblxuY29uc3QgbW92ZVBhdHRlcm4gPSAvXFxiKFxcZCspXFxzKihcXC4rKVxccyooPzpbbzAtXStbbzBdfFtOQlJRS1BdP1thLWhdP1sxLThdP1t4QF0/W2Etel1bMS04XSg/Oj1bTkJSUUtdKT8pXFwrP1xcIz9bIVxcPz1dezAsNX0vZ2k7XG5mdW5jdGlvbiBtb3ZlUmVwbGFjZXIobWF0Y2g6IHN0cmluZywgdHVybjogbnVtYmVyLCBkb3RzOiBzdHJpbmcpIHtcbiAgaWYgKHR1cm4gPCAxIHx8IHR1cm4gPiAyMDApIHJldHVybiBtYXRjaDtcbiAgY29uc3QgcGx5ID0gdHVybiAqIDIgLSAoZG90cy5sZW5ndGggPiAxID8gMCA6IDEpO1xuICByZXR1cm4gJzxhIGNsYXNzPVwianVtcFwiIGRhdGEtcGx5PVwiJyArIHBseSArICdcIj4nICsgbWF0Y2ggKyAnPC9hPic7XG59XG5cbmZ1bmN0aW9uIGFkZFBsaWVzKGh0bWw6IHN0cmluZykge1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKG1vdmVQYXR0ZXJuLCBtb3ZlUmVwbGFjZXIpO1xufVxuIiwiaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3NuYWJiZG9tJztcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5cbmltcG9ydCBtYWtlQ3RybCBmcm9tICcuL2N0cmwnO1xuaW1wb3J0IHZpZXcgZnJvbSAnLi92aWV3JztcbmltcG9ydCB7IENoYXRPcHRzLCBDdHJsIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0IHsgUHJlc2V0Q3RybCB9IGZyb20gJy4vcHJlc2V0J1xuXG5pbXBvcnQga2xhc3MgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9jbGFzcyc7XG5pbXBvcnQgYXR0cmlidXRlcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnO1xuXG5leHBvcnQgeyBDdHJsIGFzIENoYXRDdHJsLCBDaGF0UGx1Z2luIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGljaGVzc0NoYXQoZWxlbWVudDogRWxlbWVudCwgb3B0czogQ2hhdE9wdHMpOiB7XG4gIHByZXNldDogUHJlc2V0Q3RybFxufSB7XG4gIGNvbnN0IHBhdGNoID0gaW5pdChba2xhc3MsIGF0dHJpYnV0ZXNdKTtcblxuICBsZXQgdm5vZGU6IFZOb2RlLCBjdHJsOiBDdHJsXG5cbiAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIHZub2RlID0gcGF0Y2godm5vZGUsIHZpZXcoY3RybCkpO1xuICB9XG5cbiAgY3RybCA9IG1ha2VDdHJsKG9wdHMsIHJlZHJhdyk7XG5cbiAgY29uc3QgYmx1ZXByaW50ID0gdmlldyhjdHJsKTtcbiAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgdm5vZGUgPSBwYXRjaChlbGVtZW50LCBibHVlcHJpbnQpO1xuXG4gIHJldHVybiBjdHJsO1xufTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBNb2RlcmF0aW9uQ3RybCwgTW9kZXJhdGlvbk9wdHMsIE1vZGVyYXRpb25EYXRhLCBNb2RlcmF0aW9uUmVhc29uIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0IHsgdXNlck1vZEluZm8gfSBmcm9tICcuL3hocidcbmltcG9ydCB7IHVzZXJMaW5rLCBzcGlubmVyLCBiaW5kIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1vZGVyYXRpb25DdHJsKG9wdHM6IE1vZGVyYXRpb25PcHRzKTogTW9kZXJhdGlvbkN0cmwge1xuXG4gIGxldCBkYXRhOiBNb2RlcmF0aW9uRGF0YSB8IHVuZGVmaW5lZDtcbiAgbGV0IGxvYWRpbmcgPSBmYWxzZTtcblxuICBjb25zdCBvcGVuID0gKHVzZXJuYW1lOiBzdHJpbmcpID0+IHtcbiAgICBpZiAob3B0cy5wZXJtaXNzaW9ucy50aW1lb3V0KSB7XG4gICAgICBsb2FkaW5nID0gdHJ1ZTtcbiAgICAgIHVzZXJNb2RJbmZvKHVzZXJuYW1lKS50aGVuKGQgPT4ge1xuICAgICAgICBkYXRhID0gZDtcbiAgICAgICAgbG9hZGluZyA9IGZhbHNlO1xuICAgICAgICBvcHRzLnJlZHJhdygpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEgPSB7XG4gICAgICAgIGlkOiB1c2VybmFtZSxcbiAgICAgICAgdXNlcm5hbWVcbiAgICAgIH07XG4gICAgfVxuICAgIG9wdHMucmVkcmF3KCk7XG4gIH07XG5cbiAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgZGF0YSA9IHVuZGVmaW5lZDtcbiAgICBsb2FkaW5nID0gZmFsc2U7XG4gICAgb3B0cy5yZWRyYXcoKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGxvYWRpbmc6ICgpID0+IGxvYWRpbmcsXG4gICAgZGF0YTogKCkgPT4gZGF0YSxcbiAgICByZWFzb25zOiBvcHRzLnJlYXNvbnMsXG4gICAgcGVybWlzc2lvbnM6ICgpID0+IG9wdHMucGVybWlzc2lvbnMsXG4gICAgb3BlbixcbiAgICBjbG9zZSxcbiAgICB0aW1lb3V0KHJlYXNvbjogTW9kZXJhdGlvblJlYXNvbikge1xuICAgICAgZGF0YSAmJiB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnc29ja2V0LnNlbmQnLCAndGltZW91dCcsIHtcbiAgICAgICAgdXNlcklkOiBkYXRhLmlkLFxuICAgICAgICByZWFzb246IHJlYXNvbi5rZXlcbiAgICAgIH0pO1xuICAgICAgY2xvc2UoKTtcbiAgICAgIG9wdHMucmVkcmF3KCk7XG4gICAgfSxcbiAgICBzaGFkb3diYW4oKSB7XG4gICAgICBsb2FkaW5nID0gdHJ1ZTtcbiAgICAgIGRhdGEgJiYgJC5wb3N0KCcvbW9kLycgKyBkYXRhLmlkICsgJy90cm9sbC90cnVlJykudGhlbigoKSA9PiBkYXRhICYmIG9wZW4oZGF0YS51c2VybmFtZSkpO1xuICAgICAgb3B0cy5yZWRyYXcoKTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW5lQWN0aW9uKHVzZXJuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGgoJ2kubW9kJywge1xuICAgIGF0dHJzOiB7XG4gICAgICAnZGF0YS1pY29uJzogJ+6AgicsXG4gICAgICAnZGF0YS11c2VybmFtZSc6IHVzZXJuYW1lLFxuICAgICAgdGl0bGU6ICdNb2RlcmF0aW9uJ1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb2RlcmF0aW9uVmlldyhjdHJsPzogTW9kZXJhdGlvbkN0cmwpOiBWTm9kZVtdIHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFjdHJsKSByZXR1cm47XG4gIGlmIChjdHJsLmxvYWRpbmcoKSkgcmV0dXJuIFtoKCdkaXYubG9hZGluZycsIHNwaW5uZXIoKSldO1xuICBjb25zdCBkYXRhID0gY3RybC5kYXRhKCk7XG4gIGlmICghZGF0YSkgcmV0dXJuO1xuICBjb25zdCBwZXJtcyA9IGN0cmwucGVybWlzc2lvbnMoKTtcblxuICBjb25zdCBpbmZvcyA9IGRhdGEuaGlzdG9yeSA/IGgoJ2Rpdi5pbmZvcy5ibG9jaycsIFtcbiAgICB3aW5kb3cubGljaGVzcy5udW1iZXJGb3JtYXQoZGF0YS5nYW1lcyB8fCAwKSArICcgZ2FtZXMnLFxuICAgIGRhdGEudHJvbGwgPyAnVFJPTEwnIDogdW5kZWZpbmVkLFxuICAgIGRhdGEuZW5naW5lID8gJ0VOR0lORScgOiB1bmRlZmluZWQsXG4gICAgZGF0YS5ib29zdGVyID8gJ0JPT1NURVInIDogdW5kZWZpbmVkXG4gIF0ubWFwKHQgPT4gdCAmJiBoKCdzcGFuJywgdCkpLmNvbmNhdChbXG4gICAgaCgnYScsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIGhyZWY6ICcvQC8nICsgZGF0YS51c2VybmFtZSArICc/bW9kJ1xuICAgICAgfVxuICAgIH0sICdwcm9maWxlJylcbiAgXSkuY29uY2F0KFxuICAgIHBlcm1zLnNoYWRvd2JhbiA/IFtcbiAgICAgIGgoJ2EnLCB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgaHJlZjogJy9tb2QvJyArIGRhdGEudXNlcm5hbWUgKyAnL2NvbW11bmljYXRpb24nXG4gICAgICAgIH1cbiAgICAgIH0sICdjb21zJylcbiAgICBdIDogW10pKSA6IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IHRpbWVvdXQgPSBwZXJtcy50aW1lb3V0ID8gaCgnZGl2LnRpbWVvdXQuYmxvY2snLCBbXG4gICAgICBoKCdzdHJvbmcnLCAnVGltZW91dCAxMCBtaW51dGVzIGZvcicpLFxuICAgICAgLi4uY3RybC5yZWFzb25zLm1hcChyID0+IHtcbiAgICAgICAgcmV0dXJuIGgoJ2EudGV4dCcsIHtcbiAgICAgICAgICBhdHRyczogeyAnZGF0YS1pY29uJzogJ3AnIH0sXG4gICAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnRpbWVvdXQocikpXG4gICAgICAgIH0sIHIubmFtZSk7XG4gICAgICB9KSxcbiAgICAgIC4uLihcbiAgICAgICAgKGRhdGEudHJvbGwgfHwgIXBlcm1zLnNoYWRvd2JhbikgPyBbXSA6IFtoKCdkaXYuc2hhZG93YmFuJywgW1xuICAgICAgICAgICdPciAnLFxuICAgICAgICAgIGgoJ2J1dHRvbi5idXR0b24uYnV0dG9uLXJlZC5idXR0b24tZW1wdHknLCB7XG4gICAgICAgICAgICBob29rOiBiaW5kKCdjbGljaycsIGN0cmwuc2hhZG93YmFuKVxuICAgICAgICAgIH0sICdzaGFkb3diYW4nKVxuICAgICAgICBdKV0pXG4gICAgXSkgOiBoKCdkaXYudGltZW91dC5ibG9jaycsIFtcbiAgICAgIGgoJ3N0cm9uZycsICdNb2RlcmF0aW9uJyksXG4gICAgICBoKCdhLnRleHQnLCB7XG4gICAgICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiAncCcgfSxcbiAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnRpbWVvdXQoY3RybC5yZWFzb25zWzBdKSlcbiAgICAgIH0sICdUaW1lb3V0IDEwIG1pbnV0ZXMnKVxuICAgIF0pO1xuXG4gICAgY29uc3QgaGlzdG9yeSA9IGRhdGEuaGlzdG9yeSA/IGgoJ2Rpdi5oaXN0b3J5LmJsb2NrJywgW1xuICAgICAgaCgnc3Ryb25nJywgJ1RpbWVvdXQgaGlzdG9yeScpLFxuICAgICAgaCgndGFibGUnLCBoKCd0Ym9keS5zbGlzdCcsIHtcbiAgICAgICAgaG9vazoge1xuICAgICAgICAgIGluc2VydDogKCkgPT4gd2luZG93LmxpY2hlc3MucHVic3ViLmVtaXQoJ2NvbnRlbnRfbG9hZGVkJylcbiAgICAgICAgfVxuICAgICAgfSwgZGF0YS5oaXN0b3J5Lm1hcChmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBoKCd0cicsIFtcbiAgICAgICAgICBoKCd0ZC5yZWFzb24nLCBlLnJlYXNvbiksXG4gICAgICAgICAgaCgndGQubW9kJywgZS5tb2QpLFxuICAgICAgICAgIGgoJ3RkJywgaCgndGltZS50aW1lYWdvJywge1xuICAgICAgICAgICAgYXR0cnM6IHsgZGF0ZXRpbWU6IGUuZGF0ZSB9XG4gICAgICAgICAgfSkpXG4gICAgICAgIF0pO1xuICAgICAgfSkpKVxuICAgIF0pIDogdW5kZWZpbmVkO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIGgoJ2Rpdi50b3AnLCB7IGtleTogJ21vZC0nICsgZGF0YS5pZCB9LCBbXG4gICAgICAgIGgoJ3NwYW4udGV4dCcsIHtcbiAgICAgICAgICBhdHRyczogeydkYXRhLWljb24nOiAn7oCCJyB9LFxuICAgICAgICB9LCBbdXNlckxpbmsoZGF0YS51c2VybmFtZSldKSxcbiAgICAgICAgaCgnYScsIHtcbiAgICAgICAgICBhdHRyczogeydkYXRhLWljb24nOiAnTCd9LFxuICAgICAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgY3RybC5jbG9zZSlcbiAgICAgICAgfSlcbiAgICAgIF0pLFxuICAgICAgaCgnZGl2Lm1jaGF0X19jb250ZW50Lm1vZGVyYXRpb24nLCBbXG4gICAgICAgIGluZm9zLFxuICAgICAgICB0aW1lb3V0LFxuICAgICAgICBoaXN0b3J5XG4gICAgICBdKVxuICAgIF07XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IE5vdGVDdHJsLCBOb3RlT3B0cyB9IGZyb20gJy4vaW50ZXJmYWNlcydcbmltcG9ydCAqIGFzIHhociBmcm9tICcuL3hocidcbmltcG9ydCB7IHNwaW5uZXIgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBub3RlQ3RybChvcHRzOiBOb3RlT3B0cyk6IE5vdGVDdHJsIHtcbiAgbGV0IHRleHQ6IHN0cmluZ1xuICBjb25zdCBkb1Bvc3QgPSB3aW5kb3cubGljaGVzcy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgeGhyLnNldE5vdGUob3B0cy5pZCwgdGV4dCk7XG4gIH0sIDEwMDApO1xuICByZXR1cm4ge1xuICAgIGlkOiBvcHRzLmlkLFxuICAgIHRyYW5zOiBvcHRzLnRyYW5zLFxuICAgIHRleHQ6ICgpID0+IHRleHQsXG4gICAgZmV0Y2goKSB7XG4gICAgICB4aHIuZ2V0Tm90ZShvcHRzLmlkKS50aGVuKHQgPT4ge1xuICAgICAgICB0ZXh0ID0gdCB8fCAnJztcbiAgICAgICAgb3B0cy5yZWRyYXcoKVxuICAgICAgfSlcbiAgICB9LFxuICAgIHBvc3QodCkge1xuICAgICAgdGV4dCA9IHQ7XG4gICAgICBkb1Bvc3QoKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm90ZVZpZXcoY3RybDogTm90ZUN0cmwpOiBWTm9kZSB7XG4gIGNvbnN0IHRleHQgPSBjdHJsLnRleHQoKTtcbiAgaWYgKHRleHQgPT0gdW5kZWZpbmVkKSByZXR1cm4gaCgnZGl2LmxvYWRpbmcnLCB7XG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0OiBjdHJsLmZldGNoXG4gICAgfSxcbiAgfSwgW3NwaW5uZXIoKV0pXG4gIHJldHVybiBoKCd0ZXh0YXJlYScsIHtcbiAgICBhdHRyczoge1xuICAgICAgcGxhY2Vob2xkZXI6IGN0cmwudHJhbnMoJ3R5cGVQcml2YXRlTm90ZXNIZXJlJylcbiAgICB9LFxuICAgIGhvb2s6IHtcbiAgICAgIGluc2VydCh2bm9kZSkge1xuICAgICAgICBjb25zdCAkZWwgPSAkKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICRlbC52YWwodGV4dCkub24oJ2NoYW5nZSBrZXl1cCBwYXN0ZScsICgpID0+IHtcbiAgICAgICAgICBjdHJsLnBvc3QoJGVsLnZhbCgpKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBiaW5kIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgUmVkcmF3IH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZXNldEN0cmwge1xuICBncm91cCgpOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgc2FpZCgpOiBzdHJpbmdbXVxuICBzZXRHcm91cChncm91cDogc3RyaW5nIHwgdW5kZWZpbmVkKTogdm9pZFxuICBwb3N0KHByZXNldDogUHJlc2V0KTogdm9pZFxufVxuXG5leHBvcnQgdHlwZSBQcmVzZXRLZXkgPSBzdHJpbmdcbmV4cG9ydCB0eXBlIFByZXNldFRleHQgPSBzdHJpbmdcblxuZXhwb3J0IGludGVyZmFjZSBQcmVzZXQge1xuICBrZXk6IFByZXNldEtleVxuICB0ZXh0OiBQcmVzZXRUZXh0XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlc2V0R3JvdXBzIHtcbiAgc3RhcnQ6IFByZXNldFtdXG4gIGVuZDogUHJlc2V0W11cbiAgW2tleTogc3RyaW5nXTogUHJlc2V0W11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVzZXRPcHRzIHtcbiAgaW5pdGlhbEdyb3VwPzogc3RyaW5nXG4gIHJlZHJhdzogUmVkcmF3XG4gIHBvc3QodGV4dDogc3RyaW5nKTogdm9pZFxufVxuXG5jb25zdCBncm91cHM6IFByZXNldEdyb3VwcyA9IHtcbiAgc3RhcnQ6IFtcbiAgICAnaGkvSGVsbG8nLCAnZ2wvR29vZCBsdWNrJywgJ2hmL0hhdmUgZnVuIScsICd1Mi9Zb3UgdG9vISdcbiAgXS5tYXAoc3BsaXRJdCksXG4gIGVuZDogW1xuICAgICdnZy9Hb29kIGdhbWUnLCAnd3AvV2VsbCBwbGF5ZWQnLCAndHkvVGhhbmsgeW91JywgJ2d0Zy9JXFwndmUgZ290IHRvIGdvJywgJ2J5ZS9CeWUhJ1xuICBdLm1hcChzcGxpdEl0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlc2V0Q3RybChvcHRzOiBQcmVzZXRPcHRzKTogUHJlc2V0Q3RybCB7XG5cbiAgbGV0IGdyb3VwOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBvcHRzLmluaXRpYWxHcm91cDtcblxuICBsZXQgc2FpZDogc3RyaW5nW10gPSBbXTtcblxuICByZXR1cm4ge1xuICAgIGdyb3VwOiAoKSA9PiBncm91cCxcbiAgICBzYWlkOiAoKSA9PiBzYWlkLFxuICAgIHNldEdyb3VwKHA6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHAgIT09IGdyb3VwKSB7XG4gICAgICAgIGdyb3VwID0gcDtcbiAgICAgICAgaWYgKCFwKSBzYWlkID0gW107XG4gICAgICAgIG9wdHMucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBwb3N0KHByZXNldCkge1xuICAgICAgaWYgKCFncm91cCkgcmV0dXJuO1xuICAgICAgY29uc3Qgc2V0cyA9IGdyb3Vwc1tncm91cF07XG4gICAgICBpZiAoIXNldHMpIHJldHVybjtcbiAgICAgIGlmIChzYWlkLmluY2x1ZGVzKHByZXNldC5rZXkpKSByZXR1cm47XG4gICAgICBvcHRzLnBvc3QocHJlc2V0LnRleHQpO1xuICAgICAgc2FpZC5wdXNoKHByZXNldC5rZXkpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlc2V0VmlldyhjdHJsOiBQcmVzZXRDdHJsKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBjb25zdCBncm91cCA9IGN0cmwuZ3JvdXAoKTtcbiAgaWYgKCFncm91cCkgcmV0dXJuO1xuICBjb25zdCBzZXRzID0gZ3JvdXBzW2dyb3VwXTtcbiAgY29uc3Qgc2FpZCA9IGN0cmwuc2FpZCgpO1xuICByZXR1cm4gKHNldHMgJiYgc2FpZC5sZW5ndGggPCAyKSA/IGgoJ2Rpdi5tY2hhdF9fcHJlc2V0cycsIHNldHMubWFwKChwOiBQcmVzZXQpID0+IHtcbiAgICBjb25zdCBkaXNhYmxlZCA9IHNhaWQuaW5jbHVkZXMocC5rZXkpO1xuICAgIHJldHVybiBoKCdzcGFuJywge1xuICAgICAgY2xhc3M6IHtcbiAgICAgICAgZGlzYWJsZWRcbiAgICAgIH0sXG4gICAgICBhdHRyczoge1xuICAgICAgICB0aXRsZTogcC50ZXh0LFxuICAgICAgICBkaXNhYmxlZFxuICAgICAgfSxcbiAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgKCkgPT4geyAhZGlzYWJsZWQgJiYgY3RybC5wb3N0KHApIH0pXG4gICAgfSwgcC5rZXkpO1xuICB9KSkgOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHNwbGl0SXQoczogc3RyaW5nKTogUHJlc2V0IHtcbiAgY29uc3QgcGFydHMgPSBzLnNwbGl0KCcvJyk7XG4gIHJldHVybiB7XG4gICAga2V5OiBwYXJ0c1swXSxcbiAgICB0ZXh0OiBwYXJ0c1sxXVxuICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gc2tpcCh0eHQ6IHN0cmluZykge1xuICByZXR1cm4gYW5hbHlzZSh0eHQpICYmIHdpbmRvdy5saWNoZXNzLnN0b3JhZ2UuZ2V0KCdjaGF0LXNwYW0nKSAhPSAnMSc7XG59XG5leHBvcnQgZnVuY3Rpb24gaGFzVGVhbVVybCh0eHQ6IHN0cmluZykge1xuICByZXR1cm4gISF0eHQubWF0Y2godGVhbVVybFJlZ2V4KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZXBvcnQodHh0OiBzdHJpbmcpIHtcbiAgaWYgKGFuYWx5c2UodHh0KSkge1xuICAgICQucG9zdCgnL2pzbG9nLycgKyB3aW5kb3cubG9jYXRpb24uaHJlZi5zdWJzdHIoLTEyKSArICc/bj1zcGFtJyk7XG4gICAgd2luZG93LmxpY2hlc3Muc3RvcmFnZS5zZXQoJ2NoYXQtc3BhbScsICcxJyk7XG4gIH1cbn1cblxuY29uc3Qgc3BhbVJlZ2V4ID0gbmV3IFJlZ0V4cChbXG4gICd4Y2Ftd2ViLmNvbScsXG4gICcoXnxbXmldKWNoZXNzLWJvdCcsXG4gICdjaGVzcy1jaGVhdCcsXG4gICdjb29sdGVlbmJpdGNoJyxcbiAgJ2xldGNhZmEud2ViY2FtJyxcbiAgJ3Rpbnl1cmwuY29tLycsXG4gICd3b29nYS5pbmZvLycsXG4gICdiaXQubHkvJyxcbiAgJ3didC5saW5rLycsXG4gICdlYi5ieS8nLFxuICAnMDAxLnJzLycsXG4gICdzaHIubmFtZS8nLFxuICAndS50by8nLFxuICAnLjMtYS5uZXQnLFxuICAnLnNzbDQ0My5vcmcnLFxuICAnLm5zMDIudXMnLFxuICAnLm15ZnRwLmluZm8nLFxuICAnLmZsaW5rdXAuY29tJyxcbiAgJy5zZXJ2ZXVzZXJzLmNvbScsXG4gICdiYWRvb2dpcmxzLmNvbScsXG4gICdoaWRlLnN1JyxcbiAgJ3d5b24uZGUnLFxuICAnc2V4ZGF0aW5nY3ouY2x1Yidcbl0ubWFwKHVybCA9PiB7XG4gIHJldHVybiB1cmwucmVwbGFjZSgvXFwuL2csICdcXFxcLicpLnJlcGxhY2UoL1xcLy9nLCAnXFxcXC8nKTtcbn0pLmpvaW4oJ3wnKSk7XG5cbmZ1bmN0aW9uIGFuYWx5c2UodHh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuICEhdHh0Lm1hdGNoKHNwYW1SZWdleCk7XG59XG5cbmNvbnN0IHRlYW1VcmxSZWdleCA9IC9saWNoZXNzXFwub3JnXFwvdGVhbVxcLy9cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VyTGluayh1OiBzdHJpbmcsIHRpdGxlPzogc3RyaW5nKSB7XG4gIGNvbnN0IHRydW5jID0gdS5zdWJzdHJpbmcoMCwgMTQpO1xuICByZXR1cm4gaCgnYScsIHtcbiAgICAvLyBjYW4ndCBiZSBpbmxpbmVkIGJlY2F1c2Ugb2YgdGh1bmtzXG4gICAgY2xhc3M6IHtcbiAgICAgICd1c2VyLWxpbmsnOiB0cnVlLFxuICAgICAgdWxwdDogdHJ1ZVxuICAgIH0sXG4gICAgYXR0cnM6IHtcbiAgICAgIGhyZWY6ICcvQC8nICsgdVxuICAgIH1cbiAgfSwgdGl0bGUgPyBbXG4gICAgaChcbiAgICAgICdzcGFuLnRpdGxlJyxcbiAgICAgIHRpdGxlID09ICdCT1QnID8geyBhdHRyczogeydkYXRhLWJvdCc6IHRydWUgfSB9IDoge30sXG4gICAgICB0aXRsZSksIHRydW5jXG4gIF0gOiBbdHJ1bmNdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwaW5uZXIoKSB7XG4gIHJldHVybiBoKCdkaXYuc3Bpbm5lcicsIFtcbiAgICBoKCdzdmcnLCB7IGF0dHJzOiB7IHZpZXdCb3g6ICcwIDAgNDAgNDAnIH0gfSwgW1xuICAgICAgaCgnY2lyY2xlJywge1xuICAgICAgICBhdHRyczogeyBjeDogMjAsIGN5OiAyMCwgcjogMTgsIGZpbGw6ICdub25lJyB9XG4gICAgICB9KV0pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kKGV2ZW50TmFtZTogc3RyaW5nLCBmOiAoZTogRXZlbnQpID0+IHZvaWQpIHtcbiAgcmV0dXJuIHtcbiAgICBpbnNlcnQ6ICh2bm9kZTogVk5vZGUpID0+IHtcbiAgICAgICh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmKTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgQ3RybCwgVGFiIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0IGRpc2N1c3Npb25WaWV3IGZyb20gJy4vZGlzY3Vzc2lvbidcbmltcG9ydCB7IG5vdGVWaWV3IH0gZnJvbSAnLi9ub3RlJ1xuaW1wb3J0IHsgbW9kZXJhdGlvblZpZXcgfSBmcm9tICcuL21vZGVyYXRpb24nXG5pbXBvcnQgeyBiaW5kIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBDdHJsKTogVk5vZGUge1xuXG4gIGNvbnN0IG1vZCA9IGN0cmwubW9kZXJhdGlvbigpO1xuXG4gIHJldHVybiBoKCdzZWN0aW9uLm1jaGF0JyArIChjdHJsLm9wdHMuYWx3YXlzRW5hYmxlZCA/ICcnIDogJy5tY2hhdC1vcHRpb25hbCcpLCB7XG4gICAgY2xhc3M6IHtcbiAgICAgICdtY2hhdC1tb2QnOiAhIW1vZFxuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgZGVzdHJveTogY3RybC5kZXN0cm95XG4gICAgfVxuICB9LCBtb2RlcmF0aW9uVmlldyhtb2QpIHx8IG5vcm1hbFZpZXcoY3RybCkpXG59XG5cbmZ1bmN0aW9uIHJlbmRlclBhbGFudGlyKGN0cmw6IEN0cmwpIHtcbiAgY29uc3QgcCA9IGN0cmwucGFsYW50aXI7XG4gIGlmICghcC5lbmFibGVkKCkpIHJldHVybjtcbiAgcmV0dXJuIHAuaW5zdGFuY2UgPyBwLmluc3RhbmNlLnJlbmRlcihoKSA6IGgoJ2Rpdi5tY2hhdF9fdGFiLnBhbGFudGlyLnBhbGFudGlyLXNsb3QnLHtcbiAgICBhdHRyczoge1xuICAgICAgJ2RhdGEtaWNvbic6ICfugKAnLFxuICAgICAgdGl0bGU6ICdWb2ljZSBjaGF0J1xuICAgIH0sXG4gICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiB7XG4gICAgICBpZiAoIXAubG9hZGVkKSB7XG4gICAgICAgIHAubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgbGkgPSB3aW5kb3cubGljaGVzcztcbiAgICAgICAgbGkubG9hZFNjcmlwdCgnamF2YXNjcmlwdHMvdmVuZG9yL3BlZXJqcy5taW4uanMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBsaS5sb2FkU2NyaXB0KGxpLmNvbXBpbGVkU2NyaXB0KCdwYWxhbnRpcicpKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHAuaW5zdGFuY2UgPSB3aW5kb3cuUGFsYW50aXIhLnBhbGFudGlyKHtcbiAgICAgICAgICAgICAgdWlkOiBjdHJsLmRhdGEudXNlcklkLFxuICAgICAgICAgICAgICByZWRyYXc6IGN0cmwucmVkcmF3XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBub3JtYWxWaWV3KGN0cmw6IEN0cmwpIHtcbiAgY29uc3QgYWN0aXZlID0gY3RybC52bS50YWI7XG4gIHJldHVybiBbXG4gICAgaCgnZGl2Lm1jaGF0X190YWJzLm5iXycgKyBjdHJsLmFsbFRhYnMubGVuZ3RoLCBbXG4gICAgICAuLi5jdHJsLmFsbFRhYnMubWFwKHQgPT4gcmVuZGVyVGFiKGN0cmwsIHQsIGFjdGl2ZSkpLFxuICAgICAgcmVuZGVyUGFsYW50aXIoY3RybClcbiAgICBdKSxcbiAgICBoKCdkaXYubWNoYXRfX2NvbnRlbnQuJyArIGFjdGl2ZSxcbiAgICAgIChhY3RpdmUgPT09ICdub3RlJyAmJiBjdHJsLm5vdGUpID8gW25vdGVWaWV3KGN0cmwubm90ZSldIDogKFxuICAgICAgICBjdHJsLnBsdWdpbiAmJiBhY3RpdmUgPT09IGN0cmwucGx1Z2luLnRhYi5rZXkgPyBbY3RybC5wbHVnaW4udmlldygpXSA6IGRpc2N1c3Npb25WaWV3KGN0cmwpXG4gICAgICApKVxuICBdXG59XG5cbmZ1bmN0aW9uIHJlbmRlclRhYihjdHJsOiBDdHJsLCB0YWI6IFRhYiwgYWN0aXZlOiBUYWIpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5tY2hhdF9fdGFiLicgKyB0YWIsIHtcbiAgICBjbGFzczogeyAnbWNoYXRfX3RhYi1hY3RpdmUnOiB0YWIgPT09IGFjdGl2ZSB9LFxuICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgKCkgPT4gY3RybC5zZXRUYWIodGFiKSlcbiAgfSwgdGFiTmFtZShjdHJsLCB0YWIpKTtcbn1cblxuZnVuY3Rpb24gdGFiTmFtZShjdHJsOiBDdHJsLCB0YWI6IFRhYikge1xuICBpZiAodGFiID09PSAnZGlzY3Vzc2lvbicpIHJldHVybiBbXG4gICAgaCgnc3BhbicsIGN0cmwuZGF0YS5uYW1lKSxcbiAgICBjdHJsLm9wdHMuYWx3YXlzRW5hYmxlZCA/IHVuZGVmaW5lZCA6IGgoJ2lucHV0Jywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgdGl0bGU6IGN0cmwudHJhbnMubm9hcmcoJ3RvZ2dsZVRoZUNoYXQnKSxcbiAgICAgICAgY2hlY2tlZDogY3RybC52bS5lbmFibGVkXG4gICAgICB9LFxuICAgICAgaG9vazogYmluZCgnY2hhbmdlJywgKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgIGN0cmwuc2V0RW5hYmxlZCgoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkuY2hlY2tlZCk7XG4gICAgICB9KVxuICAgIH0pXG4gIF07XG4gIGlmICh0YWIgPT09ICdub3RlJykgcmV0dXJuIFtoKCdzcGFuJywgY3RybC50cmFucy5ub2FyZygnbm90ZXMnKSldO1xuICBpZiAoY3RybC5wbHVnaW4gJiYgdGFiID09PSBjdHJsLnBsdWdpbi50YWIua2V5KSByZXR1cm4gW2goJ3NwYW4nLCBjdHJsLnBsdWdpbi50YWIubmFtZSldO1xuICByZXR1cm4gW107XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gdXNlck1vZEluZm8odXNlcm5hbWU6IHN0cmluZykge1xuICByZXR1cm4gJC5nZXQoJy9tb2QvY2hhdC11c2VyLycgKyB1c2VybmFtZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYWcocmVzb3VyY2U6IHN0cmluZywgdXNlcm5hbWU6IHN0cmluZywgdGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiAkLnBvc3QoJy9yZXBvcnQvZmxhZycsIHsgdXNlcm5hbWUsIHJlc291cmNlLCB0ZXh0IH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZShpZDogc3RyaW5nKSB7XG4gIHJldHVybiAkLmdldChub3RlVXJsKGlkKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXROb3RlKGlkOiBzdHJpbmcsIHRleHQ6IHN0cmluZykge1xuICByZXR1cm4gJC5wb3N0KG5vdGVVcmwoaWQpLCB7IHRleHQgfSlcbn1cblxuZnVuY3Rpb24gbm90ZVVybChpZDogc3RyaW5nKSB7XG4gIHJldHVybiBgLyR7aWR9L25vdGVgO1xufVxuIiwiaW1wb3J0IHBpb3RyIGZyb20gJy4vcGlvdHInO1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbEZlbjogRmVuID0gJ3JuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAxJztcblxuZXhwb3J0IGZ1bmN0aW9uIGZpeENyYXp5U2FuKHNhbjogU2FuKTogU2FuIHtcbiAgcmV0dXJuIHNhblswXSA9PT0gJ1AnID8gc2FuLnNsaWNlKDEpIDogc2FuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb21wb3NlVWNpKHVjaTogVWNpKTogW0tleSwgS2V5LCBzdHJpbmddIHtcbiAgcmV0dXJuIFt1Y2kuc2xpY2UoMCwgMikgYXMgS2V5LCB1Y2kuc2xpY2UoMiwgNCkgYXMgS2V5LCB1Y2kuc2xpY2UoNCwgNSldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRXZhbChlOiBudW1iZXIpOiBzdHJpbmcge1xuICBlID0gTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZChlIC8gMTApIC8gMTAsIDk5KSwgLTk5KTtcbiAgcmV0dXJuIChlID4gMCA/ICcrJyA6ICcnKSArIGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVzdHMge1xuICBbc3F1YXJlOiBzdHJpbmddOiBLZXlbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWREZXN0cyhsaW5lcz86IHN0cmluZyk6IERlc3RzIHwgbnVsbCB7XG4gIGlmICh0eXBlb2YgbGluZXMgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZGVzdHM6IERlc3RzID0ge307XG4gIGlmIChsaW5lcykgbGluZXMuc3BsaXQoJyAnKS5mb3JFYWNoKGxpbmUgPT4ge1xuICAgIGRlc3RzW3Bpb3RyW2xpbmVbMF1dXSA9IGxpbmUuc2xpY2UoMSkuc3BsaXQoJycpLm1hcChjID0+IHBpb3RyW2NdIGFzIEtleSlcbiAgfSk7XG4gIHJldHVybiBkZXN0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWREcm9wcyhsaW5lPzogc3RyaW5nIHwgbnVsbCk6IHN0cmluZ1tdIHwgbnVsbCB7XG4gIGlmICh0eXBlb2YgbGluZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbGluZSA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBsaW5lLm1hdGNoKC8uezJ9L2cpIHx8IFtdO1xufVxuXG5leHBvcnQgY29uc3Qgcm9sZVRvU2FuID0ge1xuICBwYXduOiAnUCcsXG4gIGtuaWdodDogJ04nLFxuICBiaXNob3A6ICdCJyxcbiAgcm9vazogJ1InLFxuICBxdWVlbjogJ1EnLFxuICBraW5nOiAnSydcbn07XG5cbmV4cG9ydCBjb25zdCBzYW5Ub1JvbGUgPSB7XG4gIFA6ICdwYXduJyxcbiAgTjogJ2tuaWdodCcsXG4gIEI6ICdiaXNob3AnLFxuICBSOiAncm9vaycsXG4gIFE6ICdxdWVlbicsXG4gIEs6ICdraW5nJ1xufTtcblxuZXhwb3J0IHsgcGlvdHIgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHZhcmlhbnRUb1J1bGVzKHZhcmlhbnQ6IFZhcmlhbnRLZXkpOiAnY2hlc3MnIHwgJ2FudGljaGVzcycgfCAna2luZ29mdGhlaGlsbCcgfCAnM2NoZWNrJyB8ICdhdG9taWMnIHwgJ2hvcmRlJyB8ICdyYWNpbmdraW5ncycgfCAnY3Jhenlob3VzZScge1xuICBzd2l0Y2ggKHZhcmlhbnQpIHtcbiAgICBjYXNlICdzdGFuZGFyZCc6XG4gICAgY2FzZSAnY2hlc3M5NjAnOlxuICAgIGNhc2UgJ2Zyb21Qb3NpdGlvbic6XG4gICAgICByZXR1cm4gJ2NoZXNzJztcbiAgICBjYXNlICd0aHJlZUNoZWNrJzpcbiAgICAgIHJldHVybiAnM2NoZWNrJztcbiAgICBjYXNlICdraW5nT2ZUaGVIaWxsJzpcbiAgICAgIHJldHVybiAna2luZ29mdGhlaGlsbCc7XG4gICAgY2FzZSAncmFjaW5nS2luZ3MnOlxuICAgICAgcmV0dXJuICdyYWNpbmdraW5ncyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB2YXJpYW50O1xuICB9XG59XG4iLCJleHBvcnQgaW50ZXJmYWNlIFBpb3RyIHtcbiAgW3A6IHN0cmluZ106IHN0cmluZztcbn1cblxuY29uc3QgcGlvdHI6IFBpb3RyID0ge1xuICAnYSc6ICdhMScsXG4gICdiJzogJ2IxJyxcbiAgJ2MnOiAnYzEnLFxuICAnZCc6ICdkMScsXG4gICdlJzogJ2UxJyxcbiAgJ2YnOiAnZjEnLFxuICAnZyc6ICdnMScsXG4gICdoJzogJ2gxJyxcbiAgJ2knOiAnYTInLFxuICAnaic6ICdiMicsXG4gICdrJzogJ2MyJyxcbiAgJ2wnOiAnZDInLFxuICAnbSc6ICdlMicsXG4gICduJzogJ2YyJyxcbiAgJ28nOiAnZzInLFxuICAncCc6ICdoMicsXG4gICdxJzogJ2EzJyxcbiAgJ3InOiAnYjMnLFxuICAncyc6ICdjMycsXG4gICd0JzogJ2QzJyxcbiAgJ3UnOiAnZTMnLFxuICAndic6ICdmMycsXG4gICd3JzogJ2czJyxcbiAgJ3gnOiAnaDMnLFxuICAneSc6ICdhNCcsXG4gICd6JzogJ2I0JyxcbiAgJ0EnOiAnYzQnLFxuICAnQic6ICdkNCcsXG4gICdDJzogJ2U0JyxcbiAgJ0QnOiAnZjQnLFxuICAnRSc6ICdnNCcsXG4gICdGJzogJ2g0JyxcbiAgJ0cnOiAnYTUnLFxuICAnSCc6ICdiNScsXG4gICdJJzogJ2M1JyxcbiAgJ0onOiAnZDUnLFxuICAnSyc6ICdlNScsXG4gICdMJzogJ2Y1JyxcbiAgJ00nOiAnZzUnLFxuICAnTic6ICdoNScsXG4gICdPJzogJ2E2JyxcbiAgJ1AnOiAnYjYnLFxuICAnUSc6ICdjNicsXG4gICdSJzogJ2Q2JyxcbiAgJ1MnOiAnZTYnLFxuICAnVCc6ICdmNicsXG4gICdVJzogJ2c2JyxcbiAgJ1YnOiAnaDYnLFxuICAnVyc6ICdhNycsXG4gICdYJzogJ2I3JyxcbiAgJ1knOiAnYzcnLFxuICAnWic6ICdkNycsXG4gICcwJzogJ2U3JyxcbiAgJzEnOiAnZjcnLFxuICAnMic6ICdnNycsXG4gICczJzogJ2g3JyxcbiAgJzQnOiAnYTgnLFxuICAnNSc6ICdiOCcsXG4gICc2JzogJ2M4JyxcbiAgJzcnOiAnZDgnLFxuICAnOCc6ICdlOCcsXG4gICc5JzogJ2Y4JyxcbiAgJyEnOiAnZzgnLFxuICAnPyc6ICdoOCdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHBpb3RyO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGRlZmluZWQ8QT4odjogQSB8IHVuZGVmaW5lZCk6IHYgaXMgQSB7XG4gIHJldHVybiB0eXBlb2YgdiAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbXB0eShhOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFhIHx8IGEubGVuZ3RoID09PSAwO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3A8VD4ge1xuICAoKTogVFxuICAodjogVCk6IFRcbn1cblxuLy8gbGlrZSBtaXRocmlsIHByb3AgYnV0IHdpdGggdHlwZSBzYWZldHlcbmV4cG9ydCBmdW5jdGlvbiBwcm9wPEE+KGluaXRpYWxWYWx1ZTogQSk6IFByb3A8QT4ge1xuICBsZXQgdmFsdWUgPSBpbml0aWFsVmFsdWU7XG4gIGNvbnN0IGZ1biA9IGZ1bmN0aW9uKHY6IEEgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoZGVmaW5lZCh2KSkgdmFsdWUgPSB2O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbiAgcmV0dXJuIGZ1biBhcyBQcm9wPEE+O1xufVxuIiwiaW1wb3J0IHRocm90dGxlIGZyb20gJy4vdGhyb3R0bGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcnVubmVyKGhhY2tzOiAoKSA9PiB2b2lkLCB0aHJvdHRsZU1zOiBudW1iZXIgPSAxMDApIHtcblxuICBsZXQgdGltZW91dDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHJ1bkhhY2tzID0gdGhyb3R0bGUodGhyb3R0bGVNcywgKCkgPT4ge1xuICAgIHdpbmRvdy5saWNoZXNzLnJhZigoKSA9PiB7XG4gICAgICBoYWNrcygpO1xuICAgICAgc2NoZWR1bGUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGUoKSB7XG4gICAgdGltZW91dCAmJiBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQocnVuSGFja3MsIDUwMCk7XG4gIH1cblxuICBydW5IYWNrcygpO1xufVxuXG5sZXQgbGFzdE1haW5Cb2FyZEhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4vLyBGaXJlZm94IDYwLSBuZWVkcyB0aGlzIHRvIHByb3Blcmx5IGNvbXB1dGUgdGhlIGdyaWQgbGF5b3V0LlxuZXhwb3J0IGZ1bmN0aW9uIGZpeE1haW5Cb2FyZEhlaWdodChjb250YWluZXI6IEhUTUxFbGVtZW50KSB7XG4gIGNvbnN0IG1haW5Cb2FyZCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcubWFpbi1ib2FyZCcpIGFzIEhUTUxFbGVtZW50LFxuICAgIHdpZHRoID0gbWFpbkJvYXJkLm9mZnNldFdpZHRoO1xuICBpZiAobGFzdE1haW5Cb2FyZEhlaWdodCAhPSB3aWR0aCkge1xuICAgIGxhc3RNYWluQm9hcmRIZWlnaHQgPSB3aWR0aDtcbiAgICBtYWluQm9hcmQuc3R5bGUuaGVpZ2h0ID0gd2lkdGggKyAncHgnO1xuICAgIChtYWluQm9hcmQucXVlcnlTZWxlY3RvcignLmNnLXdyYXAnKSBhcyBIVE1MRWxlbWVudCkuc3R5bGUuaGVpZ2h0ID0gd2lkdGggKyAncHgnO1xuICAgIHdpbmRvdy5saWNoZXNzLmRpc3BhdGNoRXZlbnQoZG9jdW1lbnQuYm9keSwgJ2NoZXNzZ3JvdW5kLnJlc2l6ZScpO1xuICB9XG59XG5cbmxldCBib3VuZENoZXNzZ3JvdW5kUmVzaXplID0gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2hlc3Nncm91bmRSZXNpemVPbmNlKGY6ICgpID0+IHZvaWQpIHtcbiAgaWYgKCFib3VuZENoZXNzZ3JvdW5kUmVzaXplKSB7XG4gICAgYm91bmRDaGVzc2dyb3VuZFJlc2l6ZSA9IHRydWU7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjaGVzc2dyb3VuZC5yZXNpemUnLCBmKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmVlZHNCb2FyZEhlaWdodEZpeCgpIHtcbiAgLy8gQ2hyb21lLCBDaHJvbWl1bSwgQnJhdmUsIE9wZXJhLCBTYWZhcmkgMTIrIGFyZSBPS1xuICBpZiAod2luZG93LmNocm9tZSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIEZpcmVmb3ggPj0gNjEgaXMgT0tcbiAgY29uc3QgZmZ2ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zcGxpdCgnRmlyZWZveC8nKTtcbiAgcmV0dXJuICFmZnZbMV0gfHwgcGFyc2VJbnQoZmZ2WzFdKSA8IDYxO1xufVxuIiwiLyogQmFzZWQgb246ICovXG4vKiFcbiAqIGhvdmVySW50ZW50IHYxLjEwLjAgLy8gMjAxOS4wMi4yNSAvLyBqUXVlcnkgdjEuNy4wK1xuICogaHR0cDovL2JyaWFuY2hlcm5lLmdpdGh1Yi5pby9qcXVlcnktaG92ZXJJbnRlbnQvXG4gKlxuICogWW91IG1heSB1c2UgaG92ZXJJbnRlbnQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgbGljZW5zZS4gQmFzaWNhbGx5IHRoYXRcbiAqIG1lYW5zIHlvdSBhcmUgZnJlZSB0byB1c2UgaG92ZXJJbnRlbnQgYXMgbG9uZyBhcyB0aGlzIGhlYWRlciBpcyBsZWZ0IGludGFjdC5cbiAqIENvcHlyaWdodCAyMDA3LTIwMTkgQnJpYW4gQ2hlcm5lXG4gKi9cblxudHlwZSBTdGF0ZSA9IGFueTtcblxuZXhwb3J0IGNvbnN0IG1lbnVIb3ZlciA9ICgpID0+IHdpbmRvdy5saWNoZXNzLnJhZihmdW5jdGlvbigpIHtcblxuICBpZiAod2luZG93LmxpY2hlc3MuaGFzVG91Y2hFdmVudHMpIHJldHVybjtcblxuICBsZXQgaW50ZXJ2YWw6IG51bWJlciA9IDEwMDtcbiAgbGV0IHNlbnNpdGl2aXR5OiBudW1iZXIgPSAxMDtcblxuICAvLyBjdXJyZW50IFggYW5kIFkgcG9zaXRpb24gb2YgbW91c2UsIHVwZGF0ZWQgZHVyaW5nIG1vdXNlbW92ZSB0cmFja2luZyAoc2hhcmVkIGFjcm9zcyBpbnN0YW5jZXMpXG4gIGxldCBjWDogbnVtYmVyLCBjWTogbnVtYmVyO1xuXG4gIC8vIHNhdmVzIHRoZSBjdXJyZW50IHBvaW50ZXIgcG9zaXRpb24gY29vcmRpbmF0ZXMgYmFzZWQgb24gdGhlIGdpdmVuIG1vdXNlbW92ZSBldmVudFxuICBsZXQgdHJhY2sgPSBmdW5jdGlvbihldjogSlF1ZXJ5RXZlbnRPYmplY3QpIHtcbiAgICBjWCA9IGV2LnBhZ2VYO1xuICAgIGNZID0gZXYucGFnZVk7XG4gIH07XG5cbiAgLy8gc3RhdGUgcHJvcGVydGllczpcbiAgLy8gdGltZW91dElkID0gdGltZW91dCBJRCwgcmV1c2VkIGZvciB0cmFja2luZyBtb3VzZSBwb3NpdGlvbiBhbmQgZGVsYXlpbmcgXCJvdXRcIiBoYW5kbGVyXG4gIC8vIGlzQWN0aXZlID0gcGx1Z2luIHN0YXRlLCB0cnVlIGFmdGVyIGBvdmVyYCBpcyBjYWxsZWQganVzdCB1bnRpbCBgb3V0YCBpcyBjYWxsZWRcbiAgLy8gcFgsIHBZID0gcHJldmlvdXNseS1tZWFzdXJlZCBwb2ludGVyIGNvb3JkaW5hdGVzLCB1cGRhdGVkIGF0IGVhY2ggcG9sbGluZyBpbnRlcnZhbFxuICAvLyBldmVudCA9IHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5hbWVzcGFjZWQgZXZlbnQgdXNlZCBmb3IgbW91c2UgdHJhY2tpbmdcbiAgbGV0IHN0YXRlOiBTdGF0ZSA9IHt9O1xuXG4gICQoJyN0b3BuYXYuaG92ZXInKS5lYWNoKGZ1bmN0aW9uKHRoaXM6IEhUTUxFbGVtZW50KSB7XG5cbiAgICBjb25zdCAkZWwgPSAkKHRoaXMpLnJlbW92ZUNsYXNzKCdob3ZlcicpLFxuICAgICAgaGFuZGxlciA9ICgpID0+ICRlbC50b2dnbGVDbGFzcygnaG92ZXInKTtcblxuXG4gICAgLy8gY29tcGFyZXMgY3VycmVudCBhbmQgcHJldmlvdXMgbW91c2UgcG9zaXRpb25zXG4gICAgY29uc3QgY29tcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gY29tcGFyZSBtb3VzZSBwb3NpdGlvbnMgdG8gc2VlIGlmIHBvaW50ZXIgaGFzIHNsb3dlZCBlbm91Z2ggdG8gdHJpZ2dlciBgb3ZlcmAgZnVuY3Rpb25cbiAgICAgIGlmICggTWF0aC5zcXJ0KCAoc3RhdGUucFgtY1gpKihzdGF0ZS5wWC1jWCkgKyAoc3RhdGUucFktY1kpKihzdGF0ZS5wWS1jWSkgKSA8IHNlbnNpdGl2aXR5ICkge1xuICAgICAgICAkZWwub2ZmKHN0YXRlLmV2ZW50LCB0cmFjayk7XG4gICAgICAgIGRlbGV0ZSBzdGF0ZS50aW1lb3V0SWQ7XG4gICAgICAgIC8vIHNldCBob3ZlckludGVudCBzdGF0ZSBhcyBhY3RpdmUgZm9yIHRoaXMgZWxlbWVudCAocGVybWl0cyBgb3V0YCBoYW5kbGVyIHRvIHRyaWdnZXIpXG4gICAgICAgIHN0YXRlLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc2V0IHByZXZpb3VzIGNvb3JkaW5hdGVzIGZvciBuZXh0IGNvbXBhcmlzb25cbiAgICAgICAgc3RhdGUucFggPSBjWDsgc3RhdGUucFkgPSBjWTtcbiAgICAgICAgLy8gdXNlIHNlbGYtY2FsbGluZyB0aW1lb3V0LCBndWFyYW50ZWVzIGludGVydmFscyBhcmUgc3BhY2VkIG91dCBwcm9wZXJseSAoYXZvaWRzIEphdmFTY3JpcHQgdGltZXIgYnVncylcbiAgICAgICAgc3RhdGUudGltZW91dElkID0gc2V0VGltZW91dChjb21wYXJlLCBpbnRlcnZhbCApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBIHByaXZhdGUgZnVuY3Rpb24gZm9yIGhhbmRsaW5nIG1vdXNlICdob3ZlcmluZydcbiAgICB2YXIgaGFuZGxlSG92ZXIgPSBmdW5jdGlvbihldjogSlF1ZXJ5RXZlbnRPYmplY3QpIHtcblxuICAgICAgLy8gY2xlYXIgYW55IGV4aXN0aW5nIHRpbWVvdXRcbiAgICAgIGlmIChzdGF0ZS50aW1lb3V0SWQpIHsgc3RhdGUudGltZW91dElkID0gY2xlYXJUaW1lb3V0KHN0YXRlLnRpbWVvdXRJZCk7IH1cblxuICAgICAgLy8gbmFtZXNwYWNlZCBldmVudCB1c2VkIHRvIHJlZ2lzdGVyIGFuZCB1bnJlZ2lzdGVyIG1vdXNlbW92ZSB0cmFja2luZ1xuICAgICAgdmFyIG1vdXNlbW92ZSA9IHN0YXRlLmV2ZW50ID0gJ21vdXNlbW92ZSc7XG5cbiAgICAgIC8vIGhhbmRsZSB0aGUgZXZlbnQsIGJhc2VkIG9uIGl0cyB0eXBlXG4gICAgICBpZiAoZXYudHlwZSA9PSAnbW91c2VlbnRlcicpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZyBpZiBhbHJlYWR5IGFjdGl2ZSBvciBhIGJ1dHRvbiBpcyBwcmVzc2VkIChkcmFnZ2luZyBhIHBpZWNlKVxuICAgICAgICBpZiAoc3RhdGUuaXNBY3RpdmUgfHwgKGV2Lm9yaWdpbmFsRXZlbnQgYXMgTW91c2VFdmVudCkuYnV0dG9ucykgcmV0dXJuO1xuICAgICAgICAvLyBzZXQgXCJwcmV2aW91c1wiIFggYW5kIFkgcG9zaXRpb24gYmFzZWQgb24gaW5pdGlhbCBlbnRyeSBwb2ludFxuICAgICAgICBzdGF0ZS5wWCA9IGV2LnBhZ2VYOyBzdGF0ZS5wWSA9IGV2LnBhZ2VZO1xuICAgICAgICAvLyB1cGRhdGUgXCJjdXJyZW50XCIgWCBhbmQgWSBwb3NpdGlvbiBiYXNlZCBvbiBtb3VzZW1vdmVcbiAgICAgICAgJGVsLm9mZihtb3VzZW1vdmUsIHRyYWNrKS5vbihtb3VzZW1vdmUsIHRyYWNrKTtcbiAgICAgICAgLy8gc3RhcnQgcG9sbGluZyBpbnRlcnZhbCAoc2VsZi1jYWxsaW5nIHRpbWVvdXQpIHRvIGNvbXBhcmUgbW91c2UgY29vcmRpbmF0ZXMgb3ZlciB0aW1lXG4gICAgICAgIHN0YXRlLnRpbWVvdXRJZCA9IHNldFRpbWVvdXQoY29tcGFyZSwgaW50ZXJ2YWwgKTtcbiAgICAgIH0gZWxzZSB7IC8vIFwibW91c2VsZWF2ZVwiXG4gICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgbm90IGFscmVhZHkgYWN0aXZlXG4gICAgICAgIGlmICghc3RhdGUuaXNBY3RpdmUpIHJldHVybjtcbiAgICAgICAgLy8gdW5iaW5kIGV4cGVuc2l2ZSBtb3VzZW1vdmUgZXZlbnRcbiAgICAgICAgJGVsLm9mZihtb3VzZW1vdmUsdHJhY2spO1xuICAgICAgICAvLyBpZiBob3ZlckludGVudCBzdGF0ZSBpcyB0cnVlLCB0aGVuIGNhbGwgdGhlIG1vdXNlT3V0IGZ1bmN0aW9uIGFmdGVyIHRoZSBzcGVjaWZpZWQgZGVsYXlcbiAgICAgICAgc3RhdGUgPSB7fTtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkZWwub24oJ21vdXNlZW50ZXInLCBoYW5kbGVIb3Zlcikub24oJ21vdXNlbGVhdmUnLCBoYW5kbGVIb3Zlcik7XG4gIH0pO1xufSk7XG4iLCJsZXQgbm90aWZpY2F0aW9uczogQXJyYXk8Tm90aWZpY2F0aW9uPiA9IFtdO1xubGV0IGxpc3RlbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBsaXN0ZW5Ub0ZvY3VzKCkge1xuICBpZiAoIWxpc3RlbmluZykge1xuICAgIGxpc3RlbmluZyA9IHRydWU7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgbm90aWZpY2F0aW9ucy5mb3JFYWNoKG4gPT4gbi5jbG9zZSgpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMgPSBbXTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub3RpZnkobXNnOiBzdHJpbmcgfCAoKCkgPT4gc3RyaW5nKSkge1xuICBjb25zdCBzdG9yYWdlID0gd2luZG93LmxpY2hlc3Muc3RvcmFnZS5tYWtlKCdqdXN0LW5vdGlmaWVkJyk7XG4gIGlmIChkb2N1bWVudC5oYXNGb2N1cygpIHx8IERhdGUubm93KCkgLSBwYXJzZUludChzdG9yYWdlLmdldCgpISwgMTApIDwgMTAwMCkgcmV0dXJuO1xuICBzdG9yYWdlLnNldCgnJyArIERhdGUubm93KCkpO1xuICBpZiAoJC5pc0Z1bmN0aW9uKG1zZykpIG1zZyA9IG1zZygpO1xuICBjb25zdCBub3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKCdsaWNoZXNzLm9yZycsIHtcbiAgICBpY29uOiB3aW5kb3cubGljaGVzcy5hc3NldFVybCgnbG9nby9saWNoZXNzLWZhdmljb24tMjU2LnBuZycsIHtub1ZlcnNpb246IHRydWV9KSxcbiAgICBib2R5OiBtc2dcbiAgfSk7XG4gIG5vdGlmaWNhdGlvbi5vbmNsaWNrID0gKCkgPT4gd2luZG93LmZvY3VzKCk7XG4gIG5vdGlmaWNhdGlvbnMucHVzaChub3RpZmljYXRpb24pO1xuICBsaXN0ZW5Ub0ZvY3VzKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1zZzogc3RyaW5nIHwgKCgpID0+IHN0cmluZykpIHtcbiAgaWYgKGRvY3VtZW50Lmhhc0ZvY3VzKCkgfHwgISgnTm90aWZpY2F0aW9uJyBpbiB3aW5kb3cpKSByZXR1cm47XG4gIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2dyYW50ZWQnKSB7XG4gICAgLy8gaW5jcmVhc2UgY2hhbmNlcyB0aGF0IHRoZSBmaXJzdCB0YWIgY2FuIHB1dCBhIGxvY2FsIHN0b3JhZ2UgbG9ja1xuICAgIHNldFRpbWVvdXQobm90aWZ5LCAxMCArIE1hdGgucmFuZG9tKCkgKiA1MDAsIG1zZyk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIGNnIGZyb20gJ2NoZXNzZ3JvdW5kL3R5cGVzJztcblxuZXhwb3J0IHR5cGUgTW91Y2hFdmVudCA9IE1vdXNlRXZlbnQgJiBUb3VjaEV2ZW50O1xuXG50eXBlIFZpc2libGUgPSAocGx5OiBQbHkpID0+IGJvb2xlYW47XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlc2l6ZUhhbmRsZShlbHM6IGNnLkVsZW1lbnRzLCBwcmVmOiBudW1iZXIsIHBseTogbnVtYmVyLCB2aXNpYmxlPzogVmlzaWJsZSkge1xuXG4gIGlmICghcHJlZikgcmV0dXJuO1xuXG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2ctcmVzaXplJyk7XG4gIGVscy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZWwpO1xuXG4gIGNvbnN0IHN0YXJ0UmVzaXplID0gKHN0YXJ0OiBNb3VjaEV2ZW50KSA9PiB7XG5cbiAgICBzdGFydC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgbW91c2Vtb3ZlRXZlbnQgPSBzdGFydC50eXBlID09PSAndG91Y2hzdGFydCcgPyAndG91Y2htb3ZlJyA6ICdtb3VzZW1vdmUnO1xuICAgIGNvbnN0IG1vdXNldXBFdmVudCA9IHN0YXJ0LnR5cGUgPT09ICd0b3VjaHN0YXJ0JyA/ICd0b3VjaGVuZCcgOiAnbW91c2V1cCc7XG5cbiAgICBjb25zdCBzdGFydFBvcyA9IGV2ZW50UG9zaXRpb24oc3RhcnQpITtcbiAgICBjb25zdCBpbml0aWFsWm9vbSA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkuZ2V0UHJvcGVydHlWYWx1ZSgnLS16b29tJykpO1xuICAgIGxldCB6b29tID0gaW5pdGlhbFpvb207XG5cbiAgICBjb25zdCBzYXZlWm9vbSA9IHdpbmRvdy5saWNoZXNzLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICQuYWpheCh7IG1ldGhvZDogJ3Bvc3QnLCB1cmw6ICcvcHJlZi96b29tP3Y9JyArICgxMDAgKyB6b29tKSB9KTtcbiAgICB9LCA3MDApO1xuXG4gICAgY29uc3QgcmVzaXplID0gKG1vdmU6IE1vdWNoRXZlbnQpID0+IHtcblxuICAgICAgY29uc3QgcG9zID0gZXZlbnRQb3NpdGlvbihtb3ZlKSE7XG4gICAgICBjb25zdCBkZWx0YSA9IHBvc1swXSAtIHN0YXJ0UG9zWzBdICsgcG9zWzFdIC0gc3RhcnRQb3NbMV07XG5cbiAgICAgIHpvb20gPSBNYXRoLnJvdW5kKE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgaW5pdGlhbFpvb20gKyBkZWx0YSAvIDEwKSkpO1xuXG4gICAgICBkb2N1bWVudC5ib2R5LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnLS16b29tOicgKyB6b29tKTtcbiAgICAgIHdpbmRvdy5saWNoZXNzLmRpc3BhdGNoRXZlbnQod2luZG93LCAncmVzaXplJyk7XG5cbiAgICAgIHNhdmVab29tKCk7XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXppbmcnKTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobW91c2Vtb3ZlRXZlbnQsIHJlc2l6ZSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG1vdXNldXBFdmVudCwgKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihtb3VzZW1vdmVFdmVudCwgcmVzaXplKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXppbmcnKTtcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gIH07XG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHN0YXJ0UmVzaXplKTtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc3RhcnRSZXNpemUpO1xuXG4gIGlmIChwcmVmID09IDEpIHtcbiAgICBjb25zdCB0b2dnbGUgPSAocGx5OiBudW1iZXIpID0+IGVsLmNsYXNzTGlzdC50b2dnbGUoJ25vbmUnLCB2aXNpYmxlID8gIXZpc2libGUocGx5KSA6IHBseSA+PSAyKTtcbiAgICB0b2dnbGUocGx5KTtcbiAgICB3aW5kb3cubGljaGVzcy5wdWJzdWIub24oJ3BseScsIHRvZ2dsZSk7XG4gIH1cblxuICBhZGROYWcoZWwpO1xufVxuXG5mdW5jdGlvbiBldmVudFBvc2l0aW9uKGU6IE1vdWNoRXZlbnQpOiBbbnVtYmVyLCBudW1iZXJdIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFggPT09IDApIHJldHVybiBbZS5jbGllbnRYLCBlLmNsaWVudFldO1xuICBpZiAoZS50b3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlc1swXSkgcmV0dXJuIFtlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WCwgZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFldO1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBhZGROYWcoZWw6IEhUTUxFbGVtZW50KSB7XG5cbiAgY29uc3Qgc3RvcmFnZSA9IHdpbmRvdy5saWNoZXNzLnN0b3JhZ2UubWFrZUJvb2xlYW4oJ3Jlc2l6ZS1uYWcnKTtcbiAgaWYgKHN0b3JhZ2UuZ2V0KCkpIHJldHVybjtcblxuICB3aW5kb3cubGljaGVzcy5sb2FkQ3NzUGF0aCgnbmFnLWNpcmNsZScpO1xuICBlbC50aXRsZSA9ICdEcmFnIHRvIHJlc2l6ZSc7XG4gIGVsLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwibmFnLWNpcmNsZVwiPjwvZGl2Pic7XG4gIGZvciAoY29uc3QgbW91c2Vkb3duRXZlbnQgb2YgWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddKSB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihtb3VzZWRvd25FdmVudCwgKCkgPT4ge1xuICAgICAgc3RvcmFnZS5zZXQodHJ1ZSk7XG4gICAgICBlbC5pbm5lckhUTUwgPSAnJztcbiAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gIH1cblxuICBzZXRUaW1lb3V0KCgpID0+IHN0b3JhZ2Uuc2V0KHRydWUpLCAxNTAwMCk7XG59XG4iLCIvLyBFbnN1cmVzIGNhbGxzIHRvIHRoZSB3cmFwcGVkIGZ1bmN0aW9uIGFyZSBzcGFjZWQgYnkgdGhlIGdpdmVuIGRlbGF5LlxuLy8gQW55IGV4dHJhIGNhbGxzIGFyZSBkcm9wcGVkLCBleGNlcHQgdGhlIGxhc3Qgb25lLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGhyb3R0bGUoZGVsYXk6IG51bWJlciwgY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB7XG4gIGxldCB0aW1lcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICBsZXQgbGFzdEV4ZWMgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbih0aGlzOiBhbnksIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZjogYW55ID0gdGhpcztcbiAgICBjb25zdCBlbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBsYXN0RXhlYztcblxuICAgIGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICB0aW1lciA9IHVuZGVmaW5lZDtcbiAgICAgIGxhc3RFeGVjID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9XG5cbiAgICBpZiAodGltZXIpIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgICBpZiAoZWxhcHNlZCA+IGRlbGF5KSBleGVjKCk7XG4gICAgZWxzZSB0aW1lciA9IHNldFRpbWVvdXQoZXhlYywgZGVsYXkgLSBlbGFwc2VkKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7IEdhbWVEYXRhLCBQbGF5ZXIgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0ICogYXMgc3RhdHVzIGZyb20gJy4vc3RhdHVzJztcblxuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlhYmxlKGRhdGE6IEdhbWVEYXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiBkYXRhLmdhbWUuc3RhdHVzLmlkIDwgc3RhdHVzLmlkcy5hYm9ydGVkICYmICFpbXBvcnRlZChkYXRhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGxheWVyUGxheWluZyhkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGxheWFibGUoZGF0YSkgJiYgIWRhdGEucGxheWVyLnNwZWN0YXRvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGxheWVyVHVybihkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNQbGF5ZXJQbGF5aW5nKGRhdGEpICYmIGRhdGEuZ2FtZS5wbGF5ZXIgPT0gZGF0YS5wbGF5ZXIuY29sb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0ZyaWVuZEdhbWUoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRhdGEuZ2FtZS5zb3VyY2UgPT09ICdmcmllbmQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDbGFzc2ljYWwoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRhdGEuZ2FtZS5wZXJmID09PSAnY2xhc3NpY2FsJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbmRhdG9yeShkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFkYXRhLnRvdXJuYW1lbnQgfHwgISFkYXRhLnNpbXVsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheWVkVHVybnMoZGF0YTogR2FtZURhdGEpOiBudW1iZXIge1xuICByZXR1cm4gZGF0YS5nYW1lLnR1cm5zIC0gKGRhdGEuZ2FtZS5zdGFydGVkQXRUdXJuIHx8IDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm90aFBsYXllcnNIYXZlUGxheWVkKGRhdGE6IEdhbWVEYXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiBwbGF5ZWRUdXJucyhkYXRhKSA+IDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhYm9ydGFibGUoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIHBsYXlhYmxlKGRhdGEpICYmICFib3RoUGxheWVyc0hhdmVQbGF5ZWQoZGF0YSkgJiYgIW1hbmRhdG9yeShkYXRhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRha2ViYWNrYWJsZShkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGxheWFibGUoZGF0YSkgJiZcbiAgICBkYXRhLnRha2ViYWNrYWJsZSAmJlxuICAgIGJvdGhQbGF5ZXJzSGF2ZVBsYXllZChkYXRhKSAmJlxuICAgICFkYXRhLnBsYXllci5wcm9wb3NpbmdUYWtlYmFjayAmJlxuICAgICFkYXRhLm9wcG9uZW50LnByb3Bvc2luZ1Rha2ViYWNrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd2FibGUoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIHBsYXlhYmxlKGRhdGEpICYmXG4gICAgZGF0YS5nYW1lLnR1cm5zID49IDIgJiZcbiAgICAhZGF0YS5wbGF5ZXIub2ZmZXJpbmdEcmF3ICYmXG4gICAgIWhhc0FpKGRhdGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzaWduYWJsZShkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGxheWFibGUoZGF0YSkgJiYgIWFib3J0YWJsZShkYXRhKTtcbn1cblxuLy8gY2FuIHRoZSBjdXJyZW50IHBsYXllciBnbyBiZXJzZXJrP1xuZXhwb3J0IGZ1bmN0aW9uIGJlcnNlcmthYmxlQnkoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhZGF0YS50b3VybmFtZW50ICYmXG4gICAgZGF0YS50b3VybmFtZW50LmJlcnNlcmthYmxlICYmXG4gICAgaXNQbGF5ZXJQbGF5aW5nKGRhdGEpICYmXG4gICAgIWJvdGhQbGF5ZXJzSGF2ZVBsYXllZChkYXRhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vcmV0aW1lYWJsZShkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNQbGF5ZXJQbGF5aW5nKGRhdGEpICYmIGRhdGEubW9yZXRpbWVhYmxlICYmIChcbiAgICAhIWRhdGEuY2xvY2sgfHxcbiAgICAoISFkYXRhLmNvcnJlc3BvbmRlbmNlICYmXG4gICAgICBkYXRhLmNvcnJlc3BvbmRlbmNlW2RhdGEub3Bwb25lbnQuY29sb3JdIDwgKGRhdGEuY29ycmVzcG9uZGVuY2UuaW5jcmVtZW50IC0gMzYwMClcbiAgICApXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbXBvcnRlZChkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gZGF0YS5nYW1lLnNvdXJjZSA9PT0gJ2ltcG9ydCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBsYXlhYmxlKGRhdGE6IEdhbWVEYXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiBpbXBvcnRlZChkYXRhKSB8fCBzdGF0dXMuZmluaXNoZWQoZGF0YSkgfHxcbiAgICAoc3RhdHVzLmFib3J0ZWQoZGF0YSkgJiYgYm90aFBsYXllcnNIYXZlUGxheWVkKGRhdGEpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXllcihkYXRhOiBHYW1lRGF0YSwgY29sb3I6IENvbG9yIHwgdW5kZWZpbmVkKTogUGxheWVyO1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXllcihkYXRhOiBHYW1lRGF0YSwgY29sb3I/OiBDb2xvcik6IFBsYXllciB8IG51bGwge1xuICBpZiAoZGF0YS5wbGF5ZXIuY29sb3IgPT09IGNvbG9yKSByZXR1cm4gZGF0YS5wbGF5ZXI7XG4gIGlmIChkYXRhLm9wcG9uZW50LmNvbG9yID09PSBjb2xvcikgcmV0dXJuIGRhdGEub3Bwb25lbnQ7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQWkoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhKGRhdGEucGxheWVyLmFpIHx8IGRhdGEub3Bwb25lbnQuYWkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlckFuYWx5c2FibGUoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIHN0YXR1cy5maW5pc2hlZChkYXRhKSB8fCBwbGF5YWJsZShkYXRhKSAmJiAoIWRhdGEuY2xvY2sgfHwgIWlzUGxheWVyUGxheWluZyhkYXRhKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvcnJlc3BvbmRlbmNlKGRhdGE6IEdhbWVEYXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiBkYXRhLmdhbWUuc3BlZWQgPT09ICdjb3JyZXNwb25kZW5jZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRPbkdhbWUoZGF0YTogR2FtZURhdGEsIGNvbG9yOiBDb2xvciwgb25HYW1lOiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IHBsYXllciA9IGdldFBsYXllcihkYXRhLCBjb2xvcik7XG4gIG9uR2FtZSA9IG9uR2FtZSB8fCAhIXBsYXllci5haTtcbiAgcGxheWVyLm9uR2FtZSA9IG9uR2FtZTtcbiAgaWYgKG9uR2FtZSkgc2V0R29uZShkYXRhLCBjb2xvciwgZmFsc2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0R29uZShkYXRhOiBHYW1lRGF0YSwgY29sb3I6IENvbG9yLCBnb25lOiBudW1iZXIgfCBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IHBsYXllciA9IGdldFBsYXllcihkYXRhLCBjb2xvcik7XG4gIHBsYXllci5nb25lID0gIXBsYXllci5haSAmJiBnb25lO1xuICBpZiAocGxheWVyLmdvbmUgPT09IGZhbHNlICYmIHBsYXllci51c2VyKSBwbGF5ZXIudXNlci5vbmxpbmUgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmJNb3ZlcyhkYXRhOiBHYW1lRGF0YSwgY29sb3I6IENvbG9yKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoKGRhdGEuZ2FtZS50dXJucyArIChjb2xvciA9PSAnd2hpdGUnID8gMSA6IDApKSAvIDIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTd2l0Y2hhYmxlKGRhdGE6IEdhbWVEYXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiAhaGFzQWkoZGF0YSkgJiYgKCEhZGF0YS5zaW11bCB8fCBpc0NvcnJlc3BvbmRlbmNlKGRhdGEpKTtcbn1cbiIsImltcG9ydCB7IEdhbWVEYXRhLCBDb250aW51ZU1vZGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2FtZShkYXRhOiBHYW1lRGF0YSwgY29sb3I/OiBDb2xvciwgZW1iZWQ/OiBib29sZWFuKTogc3RyaW5nO1xuZXhwb3J0IGZ1bmN0aW9uIGdhbWUoZGF0YTogc3RyaW5nLCBjb2xvcj86IENvbG9yLCBlbWJlZD86IGJvb2xlYW4pOiBzdHJpbmc7XG5leHBvcnQgZnVuY3Rpb24gZ2FtZShkYXRhOiBhbnksIGNvbG9yPzogQ29sb3IsIGVtYmVkPzogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IGlkID0gZGF0YS5nYW1lID8gZGF0YS5nYW1lLmlkIDogZGF0YTtcbiAgcmV0dXJuIChlbWJlZCA/ICcvZW1iZWQvJyA6ICcvJykgKyBpZCArIChjb2xvciA/ICcvJyArIGNvbG9yIDogJycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udChkYXRhOiBHYW1lRGF0YSwgbW9kZTogQ29udGludWVNb2RlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGdhbWUoZGF0YSkgKyAnL2NvbnRpbnVlLycgKyBtb2RlO1xufVxuIiwiaW1wb3J0IHsgR2FtZURhdGEgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vb3JuaWNhci9zY2FsYWNoZXNzL2Jsb2IvbWFzdGVyL3NyYy9tYWluL3NjYWxhL1N0YXR1cy5zY2FsYVxuXG5leHBvcnQgY29uc3QgaWRzID0ge1xuICBjcmVhdGVkOiAxMCxcbiAgc3RhcnRlZDogMjAsXG4gIGFib3J0ZWQ6IDI1LFxuICBtYXRlOiAzMCxcbiAgcmVzaWduOiAzMSxcbiAgc3RhbGVtYXRlOiAzMixcbiAgdGltZW91dDogMzMsXG4gIGRyYXc6IDM0LFxuICBvdXRvZnRpbWU6IDM1LFxuICBjaGVhdDogMzYsXG4gIG5vU3RhcnQ6IDM3LFxuICB2YXJpYW50RW5kOiA2MFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0ZWQoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRhdGEuZ2FtZS5zdGF0dXMuaWQgPj0gaWRzLnN0YXJ0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5pc2hlZChkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gZGF0YS5nYW1lLnN0YXR1cy5pZCA+PSBpZHMubWF0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFib3J0ZWQoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRhdGEuZ2FtZS5zdGF0dXMuaWQgPT09IGlkcy5hYm9ydGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheWluZyhkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhcnRlZChkYXRhKSAmJiAhZmluaXNoZWQoZGF0YSkgJiYgIWFib3J0ZWQoZGF0YSk7XG59XG4iLCJpbXBvcnQgeyBDdHJsIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0YXR1cyhjdHJsOiBDdHJsKTogc3RyaW5nIHtcbiAgY29uc3Qgbm9hcmcgPSBjdHJsLnRyYW5zLm5vYXJnLCBkID0gY3RybC5kYXRhO1xuICBzd2l0Y2ggKGQuZ2FtZS5zdGF0dXMubmFtZSkge1xuICAgIGNhc2UgJ3N0YXJ0ZWQnOlxuICAgICAgcmV0dXJuIG5vYXJnKCdwbGF5aW5nUmlnaHROb3cnKTtcbiAgICBjYXNlICdhYm9ydGVkJzpcbiAgICAgIHJldHVybiBub2FyZygnZ2FtZUFib3J0ZWQnKTtcbiAgICBjYXNlICdtYXRlJzpcbiAgICAgIHJldHVybiBub2FyZygnY2hlY2ttYXRlJyk7XG4gICAgY2FzZSAncmVzaWduJzpcbiAgICAgIHJldHVybiBub2FyZyhkLmdhbWUud2lubmVyID09ICd3aGl0ZScgPyAnYmxhY2tSZXNpZ25lZCcgOiAnd2hpdGVSZXNpZ25lZCcpO1xuICAgIGNhc2UgJ3N0YWxlbWF0ZSc6XG4gICAgICByZXR1cm4gbm9hcmcoJ3N0YWxlbWF0ZScpO1xuICAgIGNhc2UgJ3RpbWVvdXQnOlxuICAgICAgc3dpdGNoIChkLmdhbWUud2lubmVyKSB7XG4gICAgICAgIGNhc2UgJ3doaXRlJzpcbiAgICAgICAgICByZXR1cm4gbm9hcmcoJ2JsYWNrTGVmdFRoZUdhbWUnKTtcbiAgICAgICAgY2FzZSAnYmxhY2snOlxuICAgICAgICAgIHJldHVybiBub2FyZygnd2hpdGVMZWZ0VGhlR2FtZScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vYXJnKCdkcmF3Jyk7XG4gICAgY2FzZSAnZHJhdyc6XG4gICAgICByZXR1cm4gbm9hcmcoJ2RyYXcnKTtcbiAgICBjYXNlICdvdXRvZnRpbWUnOlxuICAgICAgcmV0dXJuIG5vYXJnKCd0aW1lT3V0Jyk7XG4gICAgY2FzZSAnbm9TdGFydCc6XG4gICAgICByZXR1cm4gKGQuZ2FtZS53aW5uZXIgPT0gJ3doaXRlJyA/ICdCbGFjaycgOiAnV2hpdGUnKSArICcgZGlkblxcJ3QgbW92ZSc7XG4gICAgY2FzZSAnY2hlYXQnOlxuICAgICAgcmV0dXJuICdDaGVhdCBkZXRlY3RlZCc7XG4gICAgY2FzZSAndmFyaWFudEVuZCc6XG4gICAgICBzd2l0Y2ggKGQuZ2FtZS52YXJpYW50LmtleSkge1xuICAgICAgICBjYXNlICdraW5nT2ZUaGVIaWxsJzpcbiAgICAgICAgICByZXR1cm4gbm9hcmcoJ2tpbmdJblRoZUNlbnRlcicpO1xuICAgICAgICBjYXNlICd0aHJlZUNoZWNrJzpcbiAgICAgICAgICByZXR1cm4gbm9hcmcoJ3RocmVlQ2hlY2tzJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9hcmcoJ3ZhcmlhbnRFbmRpbmcnKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGQuZ2FtZS5zdGF0dXMubmFtZTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgdXRpbCBmcm9tICdjaGVzc2dyb3VuZC91dGlsJztcbmltcG9ydCAqIGFzIGNnIGZyb20gJ2NoZXNzZ3JvdW5kL3R5cGVzJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmUoY3RybDogUm91bmRDb250cm9sbGVyLCBrZXk6IGNnLktleSkge1xuICBjb25zdCBleHBsb2Rpbmc6IGNnLktleVtdID0gW10sXG4gIGRpZmY6IGNnLlBpZWNlc0RpZmYgPSB7fSxcbiAgb3JpZyA9IHV0aWwua2V5MnBvcyhrZXkpLFxuICBtaW5YID0gTWF0aC5tYXgoMSwgb3JpZ1swXSAtIDEpLFxuICAgIG1heFggPSBNYXRoLm1pbig4LCBvcmlnWzBdICsgMSksXG4gICAgbWluWSA9IE1hdGgubWF4KDEsIG9yaWdbMV0gLSAxKSxcbiAgICBtYXhZID0gTWF0aC5taW4oOCwgb3JpZ1sxXSArIDEpO1xuICBjb25zdCBwaWVjZXMgPSBjdHJsLmNoZXNzZ3JvdW5kLnN0YXRlLnBpZWNlcztcblxuICBmb3IgKGxldCB4ID0gbWluWDsgeCA8PSBtYXhYOyB4KyspIHtcbiAgICBmb3IgKGxldCB5ID0gbWluWTsgeSA8PSBtYXhZOyB5KyspIHtcbiAgICAgIGNvbnN0IGsgPSB1dGlsLnBvczJrZXkoW3gsIHldKTtcbiAgICAgIGV4cGxvZGluZy5wdXNoKGspO1xuICAgICAgY29uc3QgZXhwbG9kZXMgPSBwaWVjZXNba10gJiYgKFxuICAgICAgICBrID09PSBrZXkgfHwgcGllY2VzW2tdIS5yb2xlICE9PSAncGF3bicpXG4gICAgICBpZiAoZXhwbG9kZXMpIGRpZmZba10gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIGN0cmwuY2hlc3Nncm91bmQuc2V0UGllY2VzKGRpZmYpO1xuICBjdHJsLmNoZXNzZ3JvdW5kLmV4cGxvZGUoZXhwbG9kaW5nKTtcbn1cblxuLy8gbmVlZHMgdG8gZXhwbGljaXRseSBkZXN0cm95IHRoZSBjYXB0dXJpbmcgcGF3blxuZXhwb3J0IGZ1bmN0aW9uIGVucGFzc2FudChjdHJsOiBSb3VuZENvbnRyb2xsZXIsIGtleTogY2cuS2V5LCBjb2xvcjogY2cuQ29sb3IpIHtcbiAgY29uc3QgcG9zID0gdXRpbC5rZXkycG9zKGtleSksXG4gIHBhd25Qb3M6IGNnLlBvcyA9IFtwb3NbMF0sIHBvc1sxXSArIChjb2xvciA9PT0gJ3doaXRlJyA/IC0xIDogMSldO1xuICBjYXB0dXJlKGN0cmwsIHV0aWwucG9zMmtleShwYXduUG9zKSk7XG59XG4iLCIvLyBSZWdpc3RlciBibHVyIGV2ZW50cyB0byBiZSBzZW50IGFzIG1vdmUgbWV0YWRhdGFcblxubGV0IGxhc3RGb2N1cyA9IDA7XG5sZXQgZm9jdXNDdXRvZmYgPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdCh3aXRoQmx1cjogYm9vbGVhbikge1xuICBpZiAoIXdpdGhCbHVyKSBmb2N1c0N1dG9mZiA9IERhdGUubm93KCkgKyAxMDAwMDtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4gbGFzdEZvY3VzID0gRGF0ZS5ub3coKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQoKSB7XG4gIHJldHVybiBsYXN0Rm9jdXMgPj0gZm9jdXNDdXRvZmY7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gb25Nb3ZlKCkge1xuICBmb2N1c0N1dG9mZiA9IERhdGUubm93KCkgKyAxMDAwO1xufTtcbiIsImltcG9ydCB7IFJvdW5kT3B0cywgUm91bmREYXRhIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFJvdW5kQXBpLCBSb3VuZE1haW4gfSBmcm9tICcuL21haW4nO1xuaW1wb3J0IHsgQ2hhdEN0cmwgfSBmcm9tICdjaGF0JztcbmltcG9ydCB7IHRvdXJTdGFuZGluZ0N0cmwsIFRvdXJTdGFuZGluZ0N0cmwsIFRvdXJQbGF5ZXIgfSBmcm9tICcuL3RvdXJTdGFuZGluZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9wdHM6IFJvdW5kT3B0cyk6IHZvaWQge1xuICBjb25zdCBsaSA9IHdpbmRvdy5saWNoZXNzO1xuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJvdW5kX19hcHAnKSBhcyBIVE1MRWxlbWVudCxcbiAgZGF0YTogUm91bmREYXRhID0gb3B0cy5kYXRhO1xuICBsZXQgcm91bmQ6IFJvdW5kQXBpLCBjaGF0OiBDaGF0Q3RybCB8IHVuZGVmaW5lZDtcbiAgaWYgKGRhdGEudG91cm5hbWVudCkgJCgnYm9keScpLmRhdGEoJ3RvdXJuYW1lbnQtaWQnLCBkYXRhLnRvdXJuYW1lbnQuaWQpO1xuICBsaS5zb2NrZXQgPSBsaS5TdHJvbmdTb2NrZXQoXG4gICAgZGF0YS51cmwuc29ja2V0LFxuICAgIGRhdGEucGxheWVyLnZlcnNpb24sIHtcbiAgICAgIG9wdGlvbnM6IHsgbmFtZTogJ3JvdW5kJyB9LFxuICAgICAgcGFyYW1zOiB7IHVzZXJUdjogZGF0YS51c2VyVHYgJiYgZGF0YS51c2VyVHYuaWQgfSxcbiAgICAgIHJlY2VpdmUodDogc3RyaW5nLCBkOiBhbnkpIHsgcm91bmQuc29ja2V0UmVjZWl2ZSh0LCBkKTsgfSxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICB0dlNlbGVjdChvOiBhbnkpIHtcbiAgICAgICAgICBpZiAoZGF0YS50diAmJiBkYXRhLnR2LmNoYW5uZWwgPT0gby5jaGFubmVsKSBsaS5yZWxvYWQoKTtcbiAgICAgICAgICBlbHNlICQoJy50di1jaGFubmVscyAuJyArIG8uY2hhbm5lbCArICcgLmNoYW1waW9uJykuaHRtbChcbiAgICAgICAgICAgIG8ucGxheWVyID8gW1xuICAgICAgICAgICAgICBvLnBsYXllci50aXRsZSxcbiAgICAgICAgICAgICAgby5wbGF5ZXIubmFtZSxcbiAgICAgICAgICAgICAgby5wbGF5ZXIucmF0aW5nXG4gICAgICAgICAgICBdLmZpbHRlcih4ID0+IHgpLmpvaW4oJyZuYnNwJykgOiAnQW5vbnltb3VzJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGVuZCgpIHtcbiAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiBbKGRhdGEudHYgPyAnL3R2JyA6ICcnKSwgZGF0YS5nYW1lLmlkLCBkYXRhLnBsYXllci5jb2xvciwgJ3NpZGVzJ10uam9pbignLycpLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICAgICBjb25zdCAkaHRtbCA9ICQoaHRtbCksICRtZXRhID0gJGh0bWwuZmluZCgnLmdhbWVfX21ldGEnKTtcbiAgICAgICAgICAgICAgJG1ldGEubGVuZ3RoICYmICQoJy5nYW1lX19tZXRhJykucmVwbGFjZVdpdGgoJG1ldGEpO1xuICAgICAgICAgICAgICAkKCcuY3Jvc3N0YWJsZScpLnJlcGxhY2VXaXRoKCRodG1sLmZpbmQoJy5jcm9zc3RhYmxlJykpO1xuICAgICAgICAgICAgICBzdGFydFRvdXJuYW1lbnRDbG9jaygpO1xuICAgICAgICAgICAgICBsaS5wdWJzdWIuZW1pdCgnY29udGVudF9sb2FkZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgdG91clN0YW5kaW5nKHM6IFRvdXJQbGF5ZXJbXSkge1xuICAgICAgICAgIGlmIChvcHRzLmNoYXQgJiYgb3B0cy5jaGF0LnBsdWdpbiAmJiBjaGF0KSB7XG4gICAgICAgICAgICAob3B0cy5jaGF0LnBsdWdpbiBhcyBUb3VyU3RhbmRpbmdDdHJsKS5zZXQocyk7XG4gICAgICAgICAgICBjaGF0LnJlZHJhdygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gIGZ1bmN0aW9uIHN0YXJ0VG91cm5hbWVudENsb2NrKCkge1xuICAgIGlmIChvcHRzLmRhdGEudG91cm5hbWVudCkgJCgnLmdhbWVfX3RvdXJuYW1lbnQgLmNsb2NrJykuZWFjaChmdW5jdGlvbih0aGlzOiBIVE1MRWxlbWVudCkge1xuICAgICAgJCh0aGlzKS5jbG9jayh7XG4gICAgICAgIHRpbWU6IHBhcnNlRmxvYXQoJCh0aGlzKS5kYXRhKCd0aW1lJykpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbiAgZnVuY3Rpb24gZ2V0UHJlc2V0R3JvdXAoZDogUm91bmREYXRhKSB7XG4gICAgaWYgKGQucGxheWVyLnNwZWN0YXRvcikgcmV0dXJuO1xuICAgIGlmIChkLnN0ZXBzLmxlbmd0aCA8IDQpIHJldHVybiAnc3RhcnQnO1xuICAgIGVsc2UgaWYgKGQuZ2FtZS5zdGF0dXMuaWQgPj0gMzApIHJldHVybiAnZW5kJztcbiAgICByZXR1cm47XG4gIH07XG4gIG9wdHMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIG9wdHMuc29ja2V0U2VuZCA9IGxpLnNvY2tldC5zZW5kO1xuICBpZiAoIW9wdHMudG91ciAmJiAhZGF0YS5zaW11bCkgb3B0cy5vbkNoYW5nZSA9IChkOiBSb3VuZERhdGEpID0+IHtcbiAgICBpZiAoY2hhdCkgY2hhdC5wcmVzZXQuc2V0R3JvdXAoZ2V0UHJlc2V0R3JvdXAoZCkpO1xuICB9O1xuXG4gIHJvdW5kID0gKHdpbmRvd1snTGljaGVzc1JvdW5kJ10gYXMgUm91bmRNYWluKS5hcHAob3B0cyk7XG4gIGlmIChvcHRzLmNoYXQpIHtcbiAgICBpZiAob3B0cy50b3VyKSB7XG4gICAgICBvcHRzLmNoYXQucGx1Z2luID0gdG91clN0YW5kaW5nQ3RybChvcHRzLnRvdXIsIG9wdHMuaTE4bi5zdGFuZGluZyk7XG4gICAgICBvcHRzLmNoYXQuYWx3YXlzRW5hYmxlZCA9IHRydWU7XG4gICAgfSBlbHNlIGlmICghZGF0YS5zaW11bCkge1xuICAgICAgb3B0cy5jaGF0LnByZXNldCA9IGdldFByZXNldEdyb3VwKG9wdHMuZGF0YSk7XG4gICAgICBvcHRzLmNoYXQucGFyc2VNb3ZlcyA9IHRydWU7XG4gICAgfVxuICAgIGxpLm1ha2VDaGF0KG9wdHMuY2hhdCwgZnVuY3Rpb24oYykge1xuICAgICAgY2hhdCA9IGM7XG4gICAgfSk7XG4gIH1cbiAgc3RhcnRUb3VybmFtZW50Q2xvY2soKTtcbiAgJCgnLnJvdW5kX19ub3ctcGxheWluZyAubW92ZS1vbiBpbnB1dCcpXG4gIC5jaGFuZ2Uocm91bmQubW92ZU9uLnRvZ2dsZSlcbiAgLnByb3AoJ2NoZWNrZWQnLCByb3VuZC5tb3ZlT24uZ2V0KCkpXG4gIC5vbignY2xpY2snLCAnYScsIGZ1bmN0aW9uKCkge1xuICAgIGxpLmhhc1RvUmVsb2FkID0gdHJ1ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG4gIGlmIChsb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignL3JvdW5kLW5leHQvJywgMCkgPT09IDApXG4gIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsICcnLCAnLycgKyBkYXRhLmdhbWUuaWQpO1xuICAkKCcjemVudG9nJykuY2xpY2soKCkgPT4gbGkucHVic3ViLmVtaXQoJ3plbicpKTtcbiAgbGkuc3RvcmFnZS5tYWtlKCdyZWxvYWQtcm91bmQtdGFicycpLmxpc3RlbihsaS5yZWxvYWQpO1xufVxuIiwiaW1wb3J0IHsgbGFzdFN0ZXAgfSBmcm9tICcuL3JvdW5kJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IEFwaU1vdmUsIFJvdW5kRGF0YSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmNvbnN0IGxpID0gd2luZG93LmxpY2hlc3M7XG5sZXQgZm91bmQgPSBmYWxzZTtcblxuZnVuY3Rpb24gdHJ1bmNhdGVGZW4oZmVuOiBGZW4pOiBzdHJpbmcge1xuICByZXR1cm4gZmVuLnNwbGl0KCcgJylbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJzY3JpYmUoY3RybDogUm91bmRDb250cm9sbGVyKTogdm9pZCB7XG4gIC8vIGFsbG93IGV2ZXJ5b25lIHRvIGNoZWF0IGFnYWluc3QgdGhlIEFJXG4gIGlmIChjdHJsLmRhdGEub3Bwb25lbnQuYWkpIHJldHVybjtcbiAgLy8gYWxsb3cgcmVnaXN0ZXJlZCBwbGF5ZXJzIHRvIHVzZSBhc3Npc3RhbmNlIGluIGNhc3VhbCBnYW1lc1xuICBpZiAoIWN0cmwuZGF0YS5nYW1lLnJhdGVkICYmIGN0cmwub3B0cy51c2VySWQpIHJldHVybjtcbiAgLy8gYm90cyBjYW4gY2hlYXQgYWxyaWdodFxuICBpZiAoY3RybC5kYXRhLnBsYXllci51c2VyICYmIGN0cmwuZGF0YS5wbGF5ZXIudXNlci50aXRsZSA9PT0gJ0JPVCcpIHJldHVybjtcbiAgbGkuc3RvcmFnZS5tYWtlKCdjZXZhbC5mZW4nKS5saXN0ZW4oZSA9PiB7XG4gICAgaWYgKGUudmFsdWUgPT09ICdzdGFydCcpIHJldHVybiBsaS5zdG9yYWdlLmZpcmUoJ3JvdW5kLm9uZ29pbmcnKTtcbiAgICBjb25zdCBkID0gY3RybC5kYXRhLCBzdGVwID0gbGFzdFN0ZXAoY3RybC5kYXRhKTtcbiAgICBpZiAoIWZvdW5kICYmIHN0ZXAucGx5ID4gMTQgJiYgY3RybC5pc1BsYXlpbmcoKSAmJlxuICAgICAgZS52YWx1ZSAmJiB0cnVuY2F0ZUZlbihzdGVwLmZlbikgPT09IHRydW5jYXRlRmVuKGUudmFsdWUpKSB7XG4gICAgICAkLnBvc3QoJy9qc2xvZy8nICsgZC5nYW1lLmlkICsgZC5wbGF5ZXIuaWQgKyAnP249Y2V2YWwnKTtcbiAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2goZDogUm91bmREYXRhLCBtb3ZlOiBBcGlNb3ZlKSB7XG4gIGlmIChkLm9wcG9uZW50LmFpKSBsaS5zdG9yYWdlLmZpcmUoJ2NldmFsLmZlbicsIG1vdmUuZmVuKTtcbn1cbiIsImltcG9ydCB7IHVwZGF0ZUVsZW1lbnRzIH0gZnJvbSAnLi9jbG9ja1ZpZXcnO1xuaW1wb3J0IHsgUm91bmREYXRhIH0gZnJvbSAnLi4vaW50ZXJmYWNlcydcbmltcG9ydCAqIGFzIGdhbWUgZnJvbSAnZ2FtZSc7XG5cbmV4cG9ydCB0eXBlIFNlY29uZHMgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBDZW50aXMgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBNaWxsaXMgPSBudW1iZXI7XG5cbmludGVyZmFjZSBDbG9ja09wdHMge1xuICBvbkZsYWcoKTogdm9pZFxuICBzb3VuZENvbG9yPzogQ29sb3JcbiAgbnZ1aTogYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSBUZW50aHNQcmVmID0gMCB8IDEgfCAyO1xuXG5leHBvcnQgaW50ZXJmYWNlIENsb2NrRGF0YSB7XG4gIHJ1bm5pbmc6IGJvb2xlYW47XG4gIGluaXRpYWw6IFNlY29uZHM7XG4gIGluY3JlbWVudDogU2Vjb25kcztcbiAgd2hpdGU6IFNlY29uZHM7XG4gIGJsYWNrOiBTZWNvbmRzO1xuICBlbWVyZzogU2Vjb25kcztcbiAgc2hvd1RlbnRoczogVGVudGhzUHJlZjtcbiAgc2hvd0JhcjogYm9vbGVhbjtcbiAgbW9yZXRpbWU6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFRpbWVzIHtcbiAgd2hpdGU6IE1pbGxpcztcbiAgYmxhY2s6IE1pbGxpcztcbiAgYWN0aXZlQ29sb3I/OiBDb2xvcjtcbiAgbGFzdFVwZGF0ZTogTWlsbGlzO1xufVxuXG50eXBlIENvbG9yTWFwPFQ+ID0geyBbQyBpbiBDb2xvcl06IFQgfTtcblxuZXhwb3J0IGludGVyZmFjZSBDbG9ja0VsZW1lbnRzIHtcbiAgdGltZT86IEhUTUxFbGVtZW50O1xuICBjbG9jaz86IEhUTUxFbGVtZW50O1xuICBiYXI/OiBIVE1MRWxlbWVudDtcbiAgYmFyQW5pbT86IEFuaW1hdGlvbjtcbn1cblxuaW50ZXJmYWNlIEVtZXJnU291bmQge1xuICBwbGF5KCk6IHZvaWQ7XG4gIG5leHQ/OiBudW1iZXI7XG4gIGRlbGF5OiBNaWxsaXMsXG4gIHBsYXlhYmxlOiB7XG4gICAgd2hpdGU6IGJvb2xlYW47XG4gICAgYmxhY2s6IGJvb2xlYW47XG4gIH07XG59XG5cbmV4cG9ydCBjbGFzcyBDbG9ja0NvbnRyb2xsZXIge1xuXG4gIGVtZXJnU291bmQ6IEVtZXJnU291bmQgPSB7XG4gICAgcGxheTogd2luZG93LmxpY2hlc3Muc291bmQubG93dGltZSxcbiAgICBkZWxheTogMjAwMDAsXG4gICAgcGxheWFibGU6IHtcbiAgICAgIHdoaXRlOiB0cnVlLFxuICAgICAgYmxhY2s6IHRydWVcbiAgICB9XG4gIH07XG5cbiAgc2hvd1RlbnRoczogKG1pbGxpczogTWlsbGlzKSA9PiBib29sZWFuO1xuICBzaG93QmFyOiBib29sZWFuO1xuICB0aW1lczogVGltZXM7XG5cbiAgYmFyVGltZTogbnVtYmVyXG4gIHRpbWVSYXRpb0Rpdmlzb3I6IG51bWJlclxuICBlbWVyZ01zOiBNaWxsaXM7XG5cbiAgZWxlbWVudHMgPSB7XG4gICAgd2hpdGU6IHt9LFxuICAgIGJsYWNrOiB7fVxuICB9IGFzIENvbG9yTWFwPENsb2NrRWxlbWVudHM+O1xuXG4gIHByaXZhdGUgdGlja0NhbGxiYWNrPzogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGQ6IFJvdW5kRGF0YSwgcmVhZG9ubHkgb3B0czogQ2xvY2tPcHRzKSB7XG4gICAgY29uc3QgY2RhdGEgPSBkLmNsb2NrITtcblxuICAgIGlmIChjZGF0YS5zaG93VGVudGhzID09PSAwKSB0aGlzLnNob3dUZW50aHMgPSAoKSA9PiBmYWxzZTtcbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGN1dG9mZiA9IGNkYXRhLnNob3dUZW50aHMgPT09IDEgPyAxMDAwMCA6IDM2MDAwMDA7XG4gICAgICB0aGlzLnNob3dUZW50aHMgPSAodGltZSkgPT4gdGltZSA8IGN1dG9mZjtcbiAgICB9XG5cbiAgICB0aGlzLnNob3dCYXIgPSBjZGF0YS5zaG93QmFyICYmICF0aGlzLm9wdHMubnZ1aTtcbiAgICB0aGlzLmJhclRpbWUgPSAxMDAwICogKE1hdGgubWF4KGNkYXRhLmluaXRpYWwsIDIpICsgNSAqIGNkYXRhLmluY3JlbWVudCk7XG4gICAgdGhpcy50aW1lUmF0aW9EaXZpc29yID0gMSAvIHRoaXMuYmFyVGltZTtcblxuICAgIHRoaXMuZW1lcmdNcyA9IDEwMDAgKiBNYXRoLm1pbig2MCwgTWF0aC5tYXgoMTAsIGNkYXRhLmluaXRpYWwgKiAuMTI1KSk7XG5cbiAgICB0aGlzLnNldENsb2NrKGQsIGNkYXRhLndoaXRlLCBjZGF0YS5ibGFjayk7XG4gIH1cblxuICB0aW1lUmF0aW8gPSAobWlsbGlzOiBudW1iZXIpOiBudW1iZXIgPT5cbiAgICBNYXRoLm1pbigxLCBtaWxsaXMgKiB0aGlzLnRpbWVSYXRpb0Rpdmlzb3IpO1xuXG4gIHNldENsb2NrID0gKGQ6IFJvdW5kRGF0YSwgd2hpdGU6IFNlY29uZHMsIGJsYWNrOiBTZWNvbmRzLCBkZWxheTogQ2VudGlzID0gMCkgPT4ge1xuICAgIGNvbnN0IGlzQ2xvY2tSdW5uaW5nID0gZ2FtZS5wbGF5YWJsZShkKSAmJiAoZ2FtZS5wbGF5ZWRUdXJucyhkKSA+IDEgfHwgZC5jbG9jayEucnVubmluZyksXG4gICAgZGVsYXlNcyA9IGRlbGF5ICogMTA7XG5cbiAgICB0aGlzLnRpbWVzID0ge1xuICAgICAgd2hpdGU6IHdoaXRlICogMTAwMCxcbiAgICAgIGJsYWNrOiBibGFjayAqIDEwMDAsXG4gICAgICBhY3RpdmVDb2xvcjogaXNDbG9ja1J1bm5pbmcgPyBkLmdhbWUucGxheWVyIDogdW5kZWZpbmVkLFxuICAgICAgbGFzdFVwZGF0ZTogcGVyZm9ybWFuY2Uubm93KCkgKyBkZWxheU1zXG4gICAgfTtcblxuICAgIGlmIChpc0Nsb2NrUnVubmluZykgdGhpcy5zY2hlZHVsZVRpY2sodGhpcy50aW1lc1tkLmdhbWUucGxheWVyXSwgZGVsYXlNcyk7XG4gIH07XG5cbiAgYWRkVGltZSA9IChjb2xvcjogQ29sb3IsIHRpbWU6IENlbnRpcyk6IHZvaWQgPT4ge1xuICAgIHRoaXMudGltZXNbY29sb3JdICs9IHRpbWUgKiAxMFxuICB9XG5cbiAgc3RvcENsb2NrID0gKCk6IE1pbGxpc3x2b2lkID0+IHtcbiAgICBjb25zdCBjb2xvciA9IHRoaXMudGltZXMuYWN0aXZlQ29sb3I7XG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICBjb25zdCBjdXJFbGFwc2UgPSB0aGlzLmVsYXBzZWQoKTtcbiAgICAgIHRoaXMudGltZXNbY29sb3JdID0gTWF0aC5tYXgoMCwgdGhpcy50aW1lc1tjb2xvcl0gLSBjdXJFbGFwc2UpO1xuICAgICAgdGhpcy50aW1lcy5hY3RpdmVDb2xvciA9IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiBjdXJFbGFwc2U7XG4gICAgfVxuICB9XG5cbiAgaGFyZFN0b3BDbG9jayA9ICgpOiB2b2lkID0+IHRoaXMudGltZXMuYWN0aXZlQ29sb3IgPSB1bmRlZmluZWQ7XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZVRpY2sgPSAodGltZTogTWlsbGlzLCBleHRyYURlbGF5OiBNaWxsaXMpID0+IHtcbiAgICBpZiAodGhpcy50aWNrQ2FsbGJhY2sgIT09IHVuZGVmaW5lZCkgY2xlYXJUaW1lb3V0KHRoaXMudGlja0NhbGxiYWNrKTtcbiAgICB0aGlzLnRpY2tDYWxsYmFjayA9IHNldFRpbWVvdXQoXG4gICAgICB0aGlzLnRpY2ssXG4gICAgICAvLyBjaGFuZ2luZyB0aGUgdmFsdWUgb2YgYWN0aXZlIG5vZGUgY29uZnVzZXMgdGhlIGNocm9tZXZveCBzY3JlZW4gcmVhZGVyXG4gICAgICAvLyBzbyB1cGRhdGUgdGhlIGNsb2NrIGxlc3Mgb2Z0ZW5cbiAgICAgIHRoaXMub3B0cy5udnVpID8gMTAwMCA6IHRpbWUgJSAodGhpcy5zaG93VGVudGhzKHRpbWUpID8gMTAwIDogNTAwKSArIDEgKyBleHRyYURlbGF5KTtcbiAgfVxuXG4gIC8vIFNob3VsZCBvbmx5IGJlIGludm9rZWQgYnkgc2NoZWR1bGVUaWNrLlxuICBwcml2YXRlIHRpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgdGhpcy50aWNrQ2FsbGJhY2sgPSB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCBjb2xvciA9IHRoaXMudGltZXMuYWN0aXZlQ29sb3I7XG4gICAgaWYgKGNvbG9yID09PSB1bmRlZmluZWQpIHJldHVybjtcblxuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IG1pbGxpcyA9IE1hdGgubWF4KDAsIHRoaXMudGltZXNbY29sb3JdIC0gdGhpcy5lbGFwc2VkKG5vdykpO1xuXG4gICAgdGhpcy5zY2hlZHVsZVRpY2sobWlsbGlzLCAwKTtcbiAgICBpZiAobWlsbGlzID09PSAwKSB0aGlzLm9wdHMub25GbGFnKCk7XG4gICAgZWxzZSB1cGRhdGVFbGVtZW50cyh0aGlzLCB0aGlzLmVsZW1lbnRzW2NvbG9yXSwgbWlsbGlzKTtcblxuICAgIGlmICh0aGlzLm9wdHMuc291bmRDb2xvciA9PT0gY29sb3IpIHtcbiAgICAgIGlmICh0aGlzLmVtZXJnU291bmQucGxheWFibGVbY29sb3JdKSB7XG4gICAgICAgIGlmIChtaWxsaXMgPCB0aGlzLmVtZXJnTXMgJiYgIShub3cgPCB0aGlzLmVtZXJnU291bmQubmV4dCEpKSB7XG4gICAgICAgICAgdGhpcy5lbWVyZ1NvdW5kLnBsYXkoKTtcbiAgICAgICAgICB0aGlzLmVtZXJnU291bmQubmV4dCA9IG5vdyArIHRoaXMuZW1lcmdTb3VuZC5kZWxheTtcbiAgICAgICAgICB0aGlzLmVtZXJnU291bmQucGxheWFibGVbY29sb3JdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobWlsbGlzID4gMS41ICogdGhpcy5lbWVyZ01zKSB7XG4gICAgICAgIHRoaXMuZW1lcmdTb3VuZC5wbGF5YWJsZVtjb2xvcl0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBlbGFwc2VkID0gKG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpKSA9PiBNYXRoLm1heCgwLCBub3cgLSB0aGlzLnRpbWVzLmxhc3RVcGRhdGUpO1xuXG4gIG1pbGxpc09mID0gKGNvbG9yOiBDb2xvcik6IE1pbGxpcyA9PiAodGhpcy50aW1lcy5hY3RpdmVDb2xvciA9PT0gY29sb3IgP1xuICAgICBNYXRoLm1heCgwLCB0aGlzLnRpbWVzW2NvbG9yXSAtIHRoaXMuZWxhcHNlZCgpKSA6XG4gICAgIHRoaXMudGltZXNbY29sb3JdXG4gICk7XG5cbiAgaXNSdW5uaW5nID0gKCkgPT4gdGhpcy50aW1lcy5hY3RpdmVDb2xvciAhPT0gdW5kZWZpbmVkO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgSG9va3MgfSBmcm9tICdzbmFiYmRvbS9ob29rcydcbmltcG9ydCAqIGFzIGJ1dHRvbiBmcm9tICcuLi92aWV3L2J1dHRvbic7XG5pbXBvcnQgeyBiaW5kLCBqdXN0SWNvbiB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0ICogYXMgZ2FtZSBmcm9tICdnYW1lJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5pbXBvcnQgeyBDbG9ja0VsZW1lbnRzLCBDbG9ja0NvbnRyb2xsZXIsIE1pbGxpcyB9IGZyb20gJy4vY2xvY2tDdHJsJztcbmltcG9ydCB7IFBsYXllciB9IGZyb20gJ2dhbWUnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNsb2NrKGN0cmw6IFJvdW5kQ29udHJvbGxlciwgcGxheWVyOiBQbGF5ZXIsIHBvc2l0aW9uOiBQb3NpdGlvbikge1xuICBjb25zdCBjbG9jayA9IGN0cmwuY2xvY2shLFxuICAgIG1pbGxpcyA9IGNsb2NrLm1pbGxpc09mKHBsYXllci5jb2xvciksXG4gICAgaXNQbGF5ZXIgPSBjdHJsLmRhdGEucGxheWVyLmNvbG9yID09PSBwbGF5ZXIuY29sb3IsXG4gICAgaXNSdW5uaW5nID0gcGxheWVyLmNvbG9yID09PSBjbG9jay50aW1lcy5hY3RpdmVDb2xvcjtcbiAgY29uc3QgdXBkYXRlID0gKGVsOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IGVscyA9IGNsb2NrLmVsZW1lbnRzW3BsYXllci5jb2xvcl0sXG4gICAgICAgbWlsbGlzID0gY2xvY2subWlsbGlzT2YocGxheWVyLmNvbG9yKSxcbiAgICAgICBpc1J1bm5pbmcgPSBwbGF5ZXIuY29sb3IgPT09IGNsb2NrLnRpbWVzLmFjdGl2ZUNvbG9yO1xuICAgIGVscy50aW1lID0gZWw7XG4gICAgZWxzLmNsb2NrID0gZWwucGFyZW50RWxlbWVudCE7XG4gICAgZWwuaW5uZXJIVE1MID0gZm9ybWF0Q2xvY2tUaW1lKG1pbGxpcywgY2xvY2suc2hvd1RlbnRocyhtaWxsaXMpLCBpc1J1bm5pbmcsIGNsb2NrLm9wdHMubnZ1aSk7XG4gIH1cbiAgY29uc3QgdGltZUhvb2s6IEhvb2tzID0ge1xuICAgIGluc2VydDogKHZub2RlKSA9PiB1cGRhdGUodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KSxcbiAgICBwb3N0cGF0Y2g6IChfLCB2bm9kZSkgPT4gdXBkYXRlKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudClcbiAgfTtcbiAgcmV0dXJuIGgoJ2Rpdi5yY2xvY2sucmNsb2NrLScgKyBwb3NpdGlvbiwge1xuICAgIGNsYXNzOiB7XG4gICAgICBvdXRvZnRpbWU6IG1pbGxpcyA8PSAwLFxuICAgICAgcnVubmluZzogaXNSdW5uaW5nLFxuICAgICAgZW1lcmc6IG1pbGxpcyA8IGNsb2NrLmVtZXJnTXNcbiAgICB9XG4gIH0sIGNsb2NrLm9wdHMubnZ1aSA/IFtcbiAgICBoKCdkaXYudGltZScsIHtcbiAgICAgIGF0dHJzOiB7IHJvbGU6ICd0aW1lcicgfSxcbiAgICAgIGhvb2s6IHRpbWVIb29rXG4gICAgfSlcbiAgXSA6IFtcbiAgICBjbG9jay5zaG93QmFyICYmIGdhbWUuYm90aFBsYXllcnNIYXZlUGxheWVkKGN0cmwuZGF0YSkgPyBzaG93QmFyKGN0cmwsIHBsYXllci5jb2xvcikgOiB1bmRlZmluZWQsXG4gICAgaCgnZGl2LnRpbWUnLCB7XG4gICAgICBhdHRyczogeyB0aXRsZTogYCR7cGxheWVyLmNvbG9yfSBjbG9ja2AgfSxcbiAgICAgIGNsYXNzOiB7XG4gICAgICAgIGhvdXI6IG1pbGxpcyA+IDM2MDAgKiAxMDAwXG4gICAgICB9LFxuICAgICAgaG9vazogdGltZUhvb2tcbiAgICB9KSxcbiAgICByZW5kZXJCZXJzZXJrKGN0cmwsIHBsYXllci5jb2xvciwgcG9zaXRpb24pLFxuICAgIGlzUGxheWVyID8gZ29CZXJzZXJrKGN0cmwpIDogYnV0dG9uLm1vcmV0aW1lKGN0cmwpLFxuICAgIHRvdXJSYW5rKGN0cmwsIHBsYXllci5jb2xvciwgcG9zaXRpb24pXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBwYWQyKG51bTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIChudW0gPCAxMCA/ICcwJyA6ICcnKSArIG51bTtcbn1cblxuY29uc3Qgc2VwSGlnaCA9ICc8c2VwPjo8L3NlcD4nO1xuY29uc3Qgc2VwTG93ID0gJzxzZXAgY2xhc3M9XCJsb3dcIj46PC9zZXA+JztcblxuZnVuY3Rpb24gZm9ybWF0Q2xvY2tUaW1lKHRpbWU6IE1pbGxpcywgc2hvd1RlbnRoczogYm9vbGVhbiwgaXNSdW5uaW5nOiBib29sZWFuLCBudnVpOiBib29sZWFuKSB7XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lKTtcbiAgaWYgKG52dWkpIHJldHVybiAodGltZSA+PSAzNjAwMDAwID8gTWF0aC5mbG9vcih0aW1lIC8gMzYwMDAwMCkgKyAnSDonIDogJycpICtcbiAgICBkYXRlLmdldFVUQ01pbnV0ZXMoKSArICdNOicgKyBkYXRlLmdldFVUQ1NlY29uZHMoKSArICdTJztcbiAgY29uc3QgbWlsbGlzID0gZGF0ZS5nZXRVVENNaWxsaXNlY29uZHMoKSxcbiAgICBzZXAgPSAoaXNSdW5uaW5nICYmIG1pbGxpcyA8IDUwMCkgPyBzZXBMb3cgOiBzZXBIaWdoLFxuICAgIGJhc2VTdHIgPSBwYWQyKGRhdGUuZ2V0VVRDTWludXRlcygpKSArIHNlcCArIHBhZDIoZGF0ZS5nZXRVVENTZWNvbmRzKCkpO1xuICBpZiAodGltZSA+PSAzNjAwMDAwKSB7XG4gICAgY29uc3QgaG91cnMgPSBwYWQyKE1hdGguZmxvb3IodGltZSAvIDM2MDAwMDApKTtcbiAgICByZXR1cm4gaG91cnMgKyBzZXBIaWdoICsgYmFzZVN0cjtcbiAgfSBlbHNlIGlmIChzaG93VGVudGhzKSB7XG4gICAgbGV0IHRlbnRoc1N0ciA9IE1hdGguZmxvb3IobWlsbGlzIC8gMTAwKS50b1N0cmluZygpO1xuICAgIGlmICghaXNSdW5uaW5nICYmIHRpbWUgPCAxMDAwKSB7XG4gICAgICB0ZW50aHNTdHIgKz0gJzxodW5zPicgKyAoTWF0aC5mbG9vcihtaWxsaXMgLyAxMCkgJSAxMCkgKyAnPC9odW5zPic7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhc2VTdHIgKyAnPHRlbnRocz48c2VwPi48L3NlcD4nICsgdGVudGhzU3RyICsgJzwvdGVudGhzPic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2VTdHI7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd0JhcihjdHJsOiBSb3VuZENvbnRyb2xsZXIsIGNvbG9yOiBDb2xvcikge1xuICBjb25zdCBjbG9jayA9IGN0cmwuY2xvY2shO1xuICBjb25zdCB1cGRhdGUgPSAoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgaWYgKGVsLmFuaW1hdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGV0IGFuaW0gPSBjbG9jay5lbGVtZW50c1tjb2xvcl0uYmFyQW5pbTtcbiAgICAgIGlmIChhbmltID09PSB1bmRlZmluZWQgfHwgIWFuaW0uZWZmZWN0IHx8XG4gICAgICAgICAgKGFuaW0uZWZmZWN0IGFzIEtleWZyYW1lRWZmZWN0KS50YXJnZXQgIT09IGVsKSB7XG4gICAgICAgIGFuaW0gPSBlbC5hbmltYXRlKFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIHsgdHJhbnNmb3JtOiAnc2NhbGUoMSknIH0sXG4gICAgICAgICAgICB7IHRyYW5zZm9ybTogJ3NjYWxlKDAsIDEpJyB9XG4gICAgICAgICAgXSwge1xuICAgICAgICAgICAgZHVyYXRpb246IGNsb2NrLmJhclRpbWUsXG4gICAgICAgICAgICBmaWxsOiBcImJvdGhcIlxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgY2xvY2suZWxlbWVudHNbY29sb3JdLmJhckFuaW0gPSBhbmltO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVtYWluaW5nID0gY2xvY2subWlsbGlzT2YoY29sb3IpXG4gICAgICBhbmltLmN1cnJlbnRUaW1lID0gY2xvY2suYmFyVGltZSAtIHJlbWFpbmluZztcbiAgICAgIGlmIChjb2xvciA9PT0gY2xvY2sudGltZXMuYWN0aXZlQ29sb3IpIHtcbiAgICAgICAgLy8gQ2FsbGluZyBwbGF5IGFmdGVyIGFuaW1hdGlvbnMgZmluaXNoZXMgcmVzdGFydHMgYW5pbVxuICAgICAgICBpZiAocmVtYWluaW5nID4gMCkgYW5pbS5wbGF5KCk7XG4gICAgICB9IGVsc2UgYW5pbS5wYXVzZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbG9jay5lbGVtZW50c1tjb2xvcl0uYmFyID0gZWw7XG4gICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlKFwiICsgY2xvY2sudGltZVJhdGlvKGNsb2NrLm1pbGxpc09mKGNvbG9yKSkgKyBcIiwxKVwiO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGgoJ2Rpdi5iYXInLCB7XG4gICAgY2xhc3M6IHsgYmVyc2VyazogISFjdHJsLmdvbmVCZXJzZXJrW2NvbG9yXSB9LFxuICAgIGhvb2s6IHtcbiAgICAgIGluc2VydDogdm5vZGUgPT4gdXBkYXRlKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCksXG4gICAgICBwb3N0cGF0Y2g6IChfLCB2bm9kZSkgPT4gdXBkYXRlKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudClcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRWxlbWVudHMoY2xvY2s6IENsb2NrQ29udHJvbGxlciwgZWxzOiBDbG9ja0VsZW1lbnRzLCBtaWxsaXM6IE1pbGxpcykge1xuICBpZiAoZWxzLnRpbWUpIGVscy50aW1lLmlubmVySFRNTCA9IGZvcm1hdENsb2NrVGltZShtaWxsaXMsIGNsb2NrLnNob3dUZW50aHMobWlsbGlzKSwgdHJ1ZSwgY2xvY2sub3B0cy5udnVpKTtcbiAgaWYgKGVscy5iYXIpIGVscy5iYXIuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZShcIiArIGNsb2NrLnRpbWVSYXRpbyhtaWxsaXMpICsgXCIsMSlcIjtcbiAgaWYgKGVscy5jbG9jaykge1xuICAgIGNvbnN0IGNsID0gZWxzLmNsb2NrLmNsYXNzTGlzdDtcbiAgICBpZiAobWlsbGlzIDwgY2xvY2suZW1lcmdNcykgY2wuYWRkKCdlbWVyZycpO1xuICAgIGVsc2UgaWYgKGNsLmNvbnRhaW5zKCdlbWVyZycpKSBjbC5yZW1vdmUoJ2VtZXJnJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd0JlcnNlcmsoY3RybDogUm91bmRDb250cm9sbGVyLCBjb2xvcjogQ29sb3IpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhY3RybC5nb25lQmVyc2Vya1tjb2xvcl0gJiYgY3RybC5kYXRhLmdhbWUudHVybnMgPD0gMSAmJiBnYW1lLnBsYXlhYmxlKGN0cmwuZGF0YSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckJlcnNlcmsoY3RybDogUm91bmRDb250cm9sbGVyLCBjb2xvcjogQ29sb3IsIHBvc2l0aW9uOiBQb3NpdGlvbikge1xuICByZXR1cm4gc2hvd0JlcnNlcmsoY3RybCwgY29sb3IpID8gaCgnZGl2LmJlcnNlcmtlZC4nICsgcG9zaXRpb24sIGp1c3RJY29uKCdgJykpIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gZ29CZXJzZXJrKGN0cmw6IFJvdW5kQ29udHJvbGxlcikge1xuICBpZiAoIWdhbWUuYmVyc2Vya2FibGVCeShjdHJsLmRhdGEpKSByZXR1cm47XG4gIGlmIChjdHJsLmdvbmVCZXJzZXJrW2N0cmwuZGF0YS5wbGF5ZXIuY29sb3JdKSByZXR1cm47XG4gIHJldHVybiBoKCdidXR0b24uZmJ0LmdvLWJlcnNlcmsnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgIHRpdGxlOiAnR08gQkVSU0VSSyEgSGFsZiB0aGUgdGltZSwgbm8gaW5jcmVtZW50LCBib251cyBwb2ludCcsXG4gICAgICAnZGF0YS1pY29uJzogJ2AnXG4gICAgfSxcbiAgICBob29rOiBiaW5kKCdjbGljaycsIGN0cmwuZ29CZXJzZXJrKVxuICB9KTtcbn1cblxuZnVuY3Rpb24gdG91clJhbmsoY3RybDogUm91bmRDb250cm9sbGVyLCBjb2xvcjogQ29sb3IsIHBvc2l0aW9uOiBQb3NpdGlvbikge1xuICBjb25zdCBkID0gY3RybC5kYXRhO1xuICByZXR1cm4gKGQudG91cm5hbWVudCAmJiBkLnRvdXJuYW1lbnQucmFua3MgJiYgIXNob3dCZXJzZXJrKGN0cmwsIGNvbG9yKSkgP1xuICAgIGgoJ2Rpdi50b3VyLXJhbmsuJyArIHBvc2l0aW9uLCB7XG4gICAgICBhdHRyczoge3RpdGxlOiAnQ3VycmVudCB0b3VybmFtZW50IHJhbmsnfVxuICAgIH0sICcjJyArIGQudG91cm5hbWVudC5yYW5rc1tjb2xvcl0pIDogbnVsbDtcbn1cbiIsImltcG9ydCB7IFNlY29uZHMsIE1pbGxpcyB9IGZyb20gJy4uL2Nsb2NrL2Nsb2NrQ3RybCc7XG5pbXBvcnQgUm91bmRDb250cm9sbGVyIGZyb20gJy4uL2N0cmwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvcnJlc0Nsb2NrRGF0YSB7XG4gIGRheXNQZXJUdXJuOiBudW1iZXI7XG4gIGluY3JlbWVudDogU2Vjb25kcztcbiAgd2hpdGU6IFNlY29uZHM7XG4gIGJsYWNrOiBTZWNvbmRzO1xuICBzaG93QmFyOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvcnJlc0Nsb2NrQ29udHJvbGxlciB7XG4gIHJvb3Q6IFJvdW5kQ29udHJvbGxlcjtcbiAgZGF0YTogQ29ycmVzQ2xvY2tEYXRhO1xuICB0aW1lUGVyY2VudChjb2xvcjogQ29sb3IpOiBudW1iZXI7XG4gIHVwZGF0ZSh3aGl0ZTogU2Vjb25kcywgYmxhY2s6IFNlY29uZHMpOiB2b2lkXG4gIHRpY2soY29sb3I6IENvbG9yKTogdm9pZFxuICBtaWxsaXNPZihjb2xvcjogQ29sb3IpOiBNaWxsaXM7XG59XG5cbmludGVyZmFjZSBUaW1lcyB7XG4gIHdoaXRlOiBNaWxsaXM7XG4gIGJsYWNrOiBNaWxsaXM7XG4gIGxhc3RVcGRhdGU6IE1pbGxpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN0cmwocm9vdDogUm91bmRDb250cm9sbGVyLCBkYXRhOiBDb3JyZXNDbG9ja0RhdGEsIG9uRmxhZzogKCkgPT4gdm9pZCk6IENvcnJlc0Nsb2NrQ29udHJvbGxlciB7XG5cbiAgY29uc3QgdGltZVBlcmNlbnREaXZpc29yID0gMC4xIC8gZGF0YS5pbmNyZW1lbnQ7XG5cbiAgZnVuY3Rpb24gdGltZVBlcmNlbnQoY29sb3I6IENvbG9yKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCB0aW1lc1tjb2xvcl0gKiB0aW1lUGVyY2VudERpdmlzb3IpKTtcbiAgfVxuXG4gIGxldCB0aW1lczogVGltZXM7XG5cbiAgZnVuY3Rpb24gdXBkYXRlKHdoaXRlOiBTZWNvbmRzLCBibGFjazogU2Vjb25kcyk6IHZvaWQge1xuICAgIHRpbWVzID0ge1xuICAgICAgd2hpdGU6IHdoaXRlICogMTAwMCxcbiAgICAgIGJsYWNrOiBibGFjayAqIDEwMDAsXG4gICAgICBsYXN0VXBkYXRlOiBwZXJmb3JtYW5jZS5ub3coKVxuICAgIH07XG4gIH07XG4gIHVwZGF0ZShkYXRhLndoaXRlLCBkYXRhLmJsYWNrKTtcblxuICBmdW5jdGlvbiB0aWNrKGNvbG9yOiBDb2xvcik6IHZvaWQge1xuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRpbWVzW2NvbG9yXSAtPSBub3cgLSB0aW1lcy5sYXN0VXBkYXRlO1xuICAgIHRpbWVzLmxhc3RVcGRhdGUgPSBub3c7XG4gICAgaWYgKHRpbWVzW2NvbG9yXSA8PSAwKSBvbkZsYWcoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1pbGxpc09mKGNvbG9yOiBDb2xvcik6IE1pbGxpcyB7XG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIHRpbWVzW2NvbG9yXSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJvb3QsXG4gICAgZGF0YSxcbiAgICB0aW1lUGVyY2VudCxcbiAgICBtaWxsaXNPZixcbiAgICB1cGRhdGUsXG4gICAgdGlja1xuICB9O1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgTWlsbGlzIH0gZnJvbSAnLi4vY2xvY2svY2xvY2tDdHJsJztcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBDb3JyZXNDbG9ja0NvbnRyb2xsZXIgfSBmcm9tICcuL2NvcnJlc0Nsb2NrQ3RybCc7XG5pbXBvcnQgeyBtb3JldGltZSB9IGZyb20gJy4uL3ZpZXcvYnV0dG9uJztcblxuZnVuY3Rpb24gcHJlZml4SW50ZWdlcihudW06IG51bWJlciwgbGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gKG51bSAvIE1hdGgucG93KDEwLCBsZW5ndGgpKS50b0ZpeGVkKGxlbmd0aCkuc3Vic3RyKDIpO1xufVxuXG5mdW5jdGlvbiBib2xkKHg6IHN0cmluZykge1xuICByZXR1cm4gJzxiPicgKyB4ICsgJzwvYj4nO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRDbG9ja1RpbWUodHJhbnM6IFRyYW5zLCB0aW1lOiBNaWxsaXMpIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWUpLFxuICBtaW51dGVzID0gcHJlZml4SW50ZWdlcihkYXRlLmdldFVUQ01pbnV0ZXMoKSwgMiksXG4gIHNlY29uZHMgPSBwcmVmaXhJbnRlZ2VyKGRhdGUuZ2V0U2Vjb25kcygpLCAyKTtcbiAgbGV0IGhvdXJzOiBudW1iZXIsIHN0ciA9ICcnO1xuICBpZiAodGltZSA+PSA4NjQwMCAqIDEwMDApIHtcbiAgICAvLyBkYXlzIDogaG91cnNcbiAgICBjb25zdCBkYXlzID0gZGF0ZS5nZXRVVENEYXRlKCkgLSAxO1xuICAgIGhvdXJzID0gZGF0ZS5nZXRVVENIb3VycygpO1xuICAgIHN0ciArPSAoZGF5cyA9PT0gMSA/IHRyYW5zKCdvbmVEYXknKSA6IHRyYW5zLnBsdXJhbCgnbmJEYXlzJywgZGF5cykpICsgJyAnO1xuICAgIGlmIChob3VycyAhPT0gMCkgc3RyICs9IHRyYW5zLnBsdXJhbCgnbmJIb3VycycsIGhvdXJzKTtcbiAgfSBlbHNlIGlmICh0aW1lID49IDM2MDAgKiAxMDAwKSB7XG4gICAgLy8gaG91cnMgOiBtaW51dGVzXG4gICAgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCk7XG4gICAgc3RyICs9IGJvbGQocHJlZml4SW50ZWdlcihob3VycywgMikpICsgJzonICsgYm9sZChtaW51dGVzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBtaW51dGVzIDogc2Vjb25kc1xuICAgIHN0ciArPSBib2xkKG1pbnV0ZXMpICsgJzonICsgYm9sZChzZWNvbmRzKTtcbiAgfVxuICByZXR1cm4gc3RyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBDb3JyZXNDbG9ja0NvbnRyb2xsZXIsIHRyYW5zOiBUcmFucywgY29sb3I6IENvbG9yLCBwb3NpdGlvbjogUG9zaXRpb24sIHJ1bm5pbmdDb2xvcjogQ29sb3IpIHtcbiAgY29uc3QgbWlsbGlzID0gY3RybC5taWxsaXNPZihjb2xvciksXG4gIHVwZGF0ZSA9IChlbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICBlbC5pbm5lckhUTUwgPSBmb3JtYXRDbG9ja1RpbWUodHJhbnMsIG1pbGxpcyk7XG4gIH0sXG4gIGlzUGxheWVyID0gY3RybC5yb290LmRhdGEucGxheWVyLmNvbG9yID09PSBjb2xvcjtcbiAgcmV0dXJuIGgoJ2Rpdi5yY2xvY2sucmNsb2NrLWNvcnJlc3BvbmRlbmNlLnJjbG9jay0nICsgcG9zaXRpb24sIHtcbiAgICBjbGFzczoge1xuICAgICAgb3V0b2Z0aW1lOiBtaWxsaXMgPD0gMCxcbiAgICAgIHJ1bm5pbmc6IHJ1bm5pbmdDb2xvciA9PT0gY29sb3JcbiAgICB9XG4gIH0sIFtcbiAgICBjdHJsLmRhdGEuc2hvd0JhciA/IGgoJ2Rpdi5iYXInLCBbXG4gICAgICBoKCdzcGFuJywge1xuICAgICAgICBhdHRyczogeyBzdHlsZTogYHdpZHRoOiAke2N0cmwudGltZVBlcmNlbnQoY29sb3IpfSVgIH1cbiAgICAgIH0pXG4gICAgXSkgOiBudWxsLFxuICAgIGgoJ2Rpdi50aW1lJywge1xuICAgICAgaG9vazoge1xuICAgICAgICBpbnNlcnQ6IHZub2RlID0+IHVwZGF0ZSh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLFxuICAgICAgICBwb3N0cGF0Y2g6IChfLCB2bm9kZSkgPT4gdXBkYXRlKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudClcbiAgICAgIH1cbiAgICB9KSxcbiAgICBpc1BsYXllciA/IG51bGwgOiBtb3JldGltZShjdHJsLnJvb3QpLFxuICBdKTtcbn1cbiIsImltcG9ydCB7IGlzUGxheWVyVHVybiB9IGZyb20gJ2dhbWUvZ2FtZSc7XG5pbXBvcnQgeyBkcmFnTmV3UGllY2UgfSBmcm9tICdjaGVzc2dyb3VuZC9kcmFnJztcbmltcG9ydCB7IHNldERyb3BNb2RlLCBjYW5jZWxEcm9wTW9kZSB9IGZyb20gJ2NoZXNzZ3JvdW5kL2Ryb3AnO1xuaW1wb3J0IFJvdW5kQ29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCAqIGFzIGNnIGZyb20gJ2NoZXNzZ3JvdW5kL3R5cGVzJztcbmltcG9ydCB7IFJvdW5kRGF0YSB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5jb25zdCBsaSA9IHdpbmRvdy5saWNoZXNzO1xuXG5leHBvcnQgY29uc3QgcGllY2VSb2xlczogY2cuUm9sZVtdID0gWydwYXduJywgJ2tuaWdodCcsICdiaXNob3AnLCAncm9vaycsICdxdWVlbiddO1xuXG5leHBvcnQgZnVuY3Rpb24gZHJhZyhjdHJsOiBSb3VuZENvbnRyb2xsZXIsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApIHJldHVybjsgLy8gb25seSB0b3VjaCBvciBsZWZ0IGNsaWNrXG4gIGlmIChjdHJsLnJlcGxheWluZygpIHx8ICFjdHJsLmlzUGxheWluZygpKSByZXR1cm47XG4gIGNvbnN0IGVsID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQsXG4gIHJvbGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcm9sZScpIGFzIGNnLlJvbGUsXG4gIGNvbG9yID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbG9yJykgYXMgY2cuQ29sb3IsXG4gIG51bWJlciA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1uYicpO1xuICBpZiAoIXJvbGUgfHwgIWNvbG9yIHx8IG51bWJlciA9PT0gJzAnKSByZXR1cm47XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgZHJhZ05ld1BpZWNlKGN0cmwuY2hlc3Nncm91bmQuc3RhdGUsIHsgY29sb3IsIHJvbGUgfSwgZSk7XG59XG5cbmxldCBkcm9wV2l0aEtleSA9IGZhbHNlO1xubGV0IGRyb3BXaXRoRHJhZyA9IGZhbHNlO1xubGV0IG1vdXNlSWNvbnNMb2FkZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkKGRhdGE6IFJvdW5kRGF0YSwgcm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKGNyYXp5S2V5cy5sZW5ndGggPT09IDApIGRyb3BXaXRoRHJhZyA9IHRydWU7XG4gIGVsc2Uge1xuICAgIGRyb3BXaXRoS2V5ID0gdHJ1ZTtcbiAgICBpZiAoIW1vdXNlSWNvbnNMb2FkZWQpIHByZWxvYWRNb3VzZUljb25zKGRhdGEpO1xuICB9XG5cbiAgaWYgKCFpc1BsYXllclR1cm4oZGF0YSkpIHJldHVybiBmYWxzZTtcblxuICBpZiAocm9sZSA9PT0gJ3Bhd24nICYmIChrZXlbMV0gPT09ICcxJyB8fCBrZXlbMV0gPT09ICc4JykpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBkcm9wU3RyID0gZGF0YS5wb3NzaWJsZURyb3BzO1xuXG4gIGlmICh0eXBlb2YgZHJvcFN0ciA9PT0gJ3VuZGVmaW5lZCcgfHwgZHJvcFN0ciA9PT0gbnVsbCkgcmV0dXJuIHRydWU7XG5cbiAgY29uc3QgZHJvcHMgPSBkcm9wU3RyLm1hdGNoKC8uezJ9L2cpIHx8IFtdO1xuXG4gIHJldHVybiBkcm9wcy5pbmNsdWRlcyhrZXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb25FbmQoKSB7XG4gIGNvbnN0IHN0b3JlID0gbGkuc3RvcmFnZS5tYWtlKCdjcmF6eUtleUhpc3QnKTtcbiAgaWYgKGRyb3BXaXRoS2V5KSBzdG9yZS5zZXQoMTApO1xuICBlbHNlIGlmIChkcm9wV2l0aERyYWcpIHtcbiAgICBjb25zdCBjdXIgPSBwYXJzZUludChzdG9yZS5nZXQoKSEpO1xuICAgIGlmIChjdXIgPiAwICYmIGN1ciA8PSAxMCkgc3RvcmUuc2V0KGN1ciAtIDEpO1xuICAgIGVsc2UgaWYgKGN1ciAhPT0gMCkgc3RvcmUuc2V0KDMpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjcmF6eUtleXM6IEFycmF5PG51bWJlcj4gPSBbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIGNvbnN0IGsgPSB3aW5kb3cuTW91c2V0cmFwO1xuXG4gIGxldCBhY3RpdmVDdXJzb3I6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICBjb25zdCBzZXREcm9wID0gKCkgPT4ge1xuICAgIGlmIChhY3RpdmVDdXJzb3IpIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShhY3RpdmVDdXJzb3IpO1xuICAgIGlmIChjcmF6eUtleXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgcm9sZSA9IHBpZWNlUm9sZXNbY3JhenlLZXlzW2NyYXp5S2V5cy5sZW5ndGggLSAxXSAtIDFdLFxuICAgICAgICBjb2xvciA9IGN0cmwuZGF0YS5wbGF5ZXIuY29sb3IsXG4gICAgICAgIGNyYXp5RGF0YSA9IGN0cmwuZGF0YS5jcmF6eWhvdXNlO1xuICAgICAgaWYgKCFjcmF6eURhdGEpIHJldHVybjtcblxuICAgICAgY29uc3QgbmIgPSBjcmF6eURhdGEucG9ja2V0c1tjb2xvciA9PT0gJ3doaXRlJyA/IDAgOiAxXVtyb2xlXTtcbiAgICAgIHNldERyb3BNb2RlKGN0cmwuY2hlc3Nncm91bmQuc3RhdGUsIG5iID4gMCA/IHsgY29sb3IsIHJvbGUgfSA6IHVuZGVmaW5lZCk7XG4gICAgICBhY3RpdmVDdXJzb3IgPSBgY3Vyc29yLSR7Y29sb3J9LSR7cm9sZX1gO1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKGFjdGl2ZUN1cnNvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbmNlbERyb3BNb2RlKGN0cmwuY2hlc3Nncm91bmQuc3RhdGUpO1xuICAgICAgYWN0aXZlQ3Vyc29yID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfTtcblxuICAvLyBUaGlzIGNhc2UgaXMgbmVlZGVkIGlmIHRoZSBwb2NrZXQgcGllY2UgYmVjb21lcyBhdmFpbGFibGUgd2hpbGVcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgZHJvcCBrZXkgaXMgYWN0aXZlLlxuICAvL1xuICAvLyBXaGVuIHRoZSBkcm9wIGtleSBpcyBmaXJzdCBwcmVzc2VkLCB0aGUgY3Vyc29yIHdpbGwgY2hhbmdlLCBidXRcbiAgLy8gY2hlc3Nncm91bmQuc2V0RHJvcE1vdmUoc3RhdGUsIHVuZGVmaW5lZCkgaXMgY2FsbGVkLCB3aGljaCBtZWFuc1xuICAvLyBjbGlja3Mgb24gdGhlIGJvYXJkIHdpbGwgbm90IGRyb3AgYSBwaWVjZS5cbiAgLy8gSWYgdGhlIHBpZWNlIGJlY29tZXMgYXZhaWxhYmxlLCB3ZSBjYWxsIGludG8gY2hlc3Nncm91bmQgYWdhaW4uXG4gIHdpbmRvdy5saWNoZXNzLnB1YnN1Yi5vbigncGx5JywgKCkgPT4ge1xuICAgIGlmIChjcmF6eUtleXMubGVuZ3RoID4gMCkgc2V0RHJvcCgpO1xuICB9KVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IDU7IGkrKykge1xuICAgIGNvbnN0IGlTdHIgPSBpLnRvU3RyaW5nKCk7XG4gICAgay5iaW5kKGlTdHIsIChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAoIWNyYXp5S2V5cy5pbmNsdWRlcyhpKSkge1xuICAgICAgICBjcmF6eUtleXMucHVzaChpKTtcbiAgICAgICAgc2V0RHJvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGsuYmluZChpU3RyLCAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgaWR4ID0gY3JhenlLZXlzLmluZGV4T2YoaSk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgY3JhenlLZXlzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICBpZiAoaWR4ID09PSBjcmF6eUtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgc2V0RHJvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgJ2tleXVwJyk7XG4gIH1cblxuICBjb25zdCByZXNldEtleXMgPSAoKSA9PiB7XG4gICAgaWYgKGNyYXp5S2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICBjcmF6eUtleXMubGVuZ3RoID0gMDtcbiAgICAgIHNldERyb3AoKTtcbiAgICB9XG4gIH07XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCByZXNldEtleXMpO1xuXG4gIC8vIEhhbmRsZSBmb2N1cyBvbiBpbnB1dCBiYXJzIOKAkyB0aGVzZSB3aWxsIGhpZGUga2V5dXAgZXZlbnRzXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChlKSA9PiB7XG4gICAgaWYgKGUudGFyZ2V0ICYmIChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkubG9jYWxOYW1lID09PSAnaW5wdXQnKVxuICAgICAgcmVzZXRLZXlzKCk7XG4gIH0sIHsgY2FwdHVyZTogdHJ1ZSB9KTtcblxuICBpZiAobGkuc3RvcmFnZS5nZXQoJ2NyYXp5S2V5SGlzdCcpICE9PSAnMCcpXG4gICAgcHJlbG9hZE1vdXNlSWNvbnMoY3RybC5kYXRhKTtcbn1cblxuLy8gemgga2V5cyBoYXMgdW5hY2NlcHRhYmxlIGphbmsgd2hlbiBjdXJzb3JzIG5lZWQgdG8gZGwsXG4vLyBzbyBwcmVsb2FkIHdoZW4gdGhlIGZlYXR1cmUgbWlnaHQgYmUgdXNlZC5cbi8vIEltYWdlcyBhcmUgdXNlZCBpbiBfemguc2Nzcywgd2hpY2ggc2hvdWxkIGJlIGtlcHQgaW4gc3luYy5cbmZ1bmN0aW9uIHByZWxvYWRNb3VzZUljb25zKGRhdGE6IFJvdW5kRGF0YSkge1xuICBjb25zdCBjb2xvcktleSA9IGRhdGEucGxheWVyLmNvbG9yID09PSAnd2hpdGUnID8gJ3cnIDogJ2InO1xuICBpZiAod2luZG93LmZldGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGNvbnN0IHBLZXkgb2YgJ1BOQlJRJykge1xuICAgICAgZmV0Y2gobGkuYXNzZXRVcmwoYHBpZWNlL2NidXJuZXR0LyR7Y29sb3JLZXl9JHtwS2V5fS5zdmdgKSk7XG4gICAgfVxuICB9XG4gIG1vdXNlSWNvbnNMb2FkZWQgPSB0cnVlO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0ICogYXMgcm91bmQgZnJvbSAnLi4vcm91bmQnO1xuaW1wb3J0IHsgZHJhZywgY3JhenlLZXlzLCBwaWVjZVJvbGVzIH0gZnJvbSAnLi9jcmF6eUN0cmwnO1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnY2hlc3Nncm91bmQvdHlwZXMnO1xuaW1wb3J0IFJvdW5kQ29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IG9uSW5zZXJ0IH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBQb3NpdGlvbiB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5jb25zdCBldmVudE5hbWVzID0gWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwb2NrZXQoY3RybDogUm91bmRDb250cm9sbGVyLCBjb2xvcjogQ29sb3IsIHBvc2l0aW9uOiBQb3NpdGlvbikge1xuICBjb25zdCBzdGVwID0gcm91bmQucGx5U3RlcChjdHJsLmRhdGEsIGN0cmwucGx5KTtcbiAgaWYgKCFzdGVwLmNyYXp5KSByZXR1cm47XG4gIGNvbnN0IGRyb3BwZWRSb2xlID0gY3RybC5qdXN0RHJvcHBlZCxcbiAgICBwcmVEcm9wUm9sZSA9IGN0cmwucHJlRHJvcCxcbiAgICBwb2NrZXQgPSBzdGVwLmNyYXp5LnBvY2tldHNbY29sb3IgPT09ICd3aGl0ZScgPyAwIDogMV0sXG4gICAgdXNhYmxlUG9zID0gcG9zaXRpb24gPT09IChjdHJsLmZsaXAgPyAndG9wJyA6ICdib3R0b20nKSxcbiAgICB1c2FibGUgPSB1c2FibGVQb3MgJiYgIWN0cmwucmVwbGF5aW5nKCkgJiYgY3RybC5pc1BsYXlpbmcoKSxcbiAgICBhY3RpdmVDb2xvciA9IGNvbG9yID09PSBjdHJsLmRhdGEucGxheWVyLmNvbG9yO1xuICBjb25zdCBjYXB0dXJlZFBpZWNlID0gY3RybC5qdXN0Q2FwdHVyZWQ7XG4gIGNvbnN0IGNhcHR1cmVkID0gY2FwdHVyZWRQaWVjZSAmJiAoY2FwdHVyZWRQaWVjZVsncHJvbW90ZWQnXSA/ICdwYXduJyA6IGNhcHR1cmVkUGllY2Uucm9sZSk7XG4gIHJldHVybiBoKCdkaXYucG9ja2V0LmlzMmQucG9ja2V0LScgKyBwb3NpdGlvbiwge1xuICAgIGNsYXNzOiB7IHVzYWJsZSB9LFxuICAgIGhvb2s6IG9uSW5zZXJ0KGVsID0+IGV2ZW50TmFtZXMuZm9yRWFjaChcbiAgICAgIG5hbWUgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCAoZTogY2cuTW91Y2hFdmVudCkgPT4ge1xuICAgICAgICBpZiAocG9zaXRpb24gPT09IChjdHJsLmZsaXAgPyAndG9wJyA6ICdib3R0b20nKSAmJiBjcmF6eUtleXMubGVuZ3RoID09IDApXG4gICAgICAgICAgZHJhZyhjdHJsLCBlKTtcbiAgICAgIH0pXG4gICAgKSlcbiAgfSwgcGllY2VSb2xlcy5tYXAocm9sZSA9PiB7XG4gICAgbGV0IG5iID0gcG9ja2V0W3JvbGVdIHx8IDA7XG4gICAgaWYgKGFjdGl2ZUNvbG9yKSB7XG4gICAgICBpZiAoZHJvcHBlZFJvbGUgPT09IHJvbGUpIG5iLS07XG4gICAgICBpZiAoY2FwdHVyZWQgPT09IHJvbGUpIG5iKys7XG4gICAgfVxuICAgIHJldHVybiBoKCdkaXYucG9ja2V0LWMxJywgaCgnZGl2LnBvY2tldC1jMicsIGgoJ3BpZWNlLicgKyByb2xlICsgJy4nICsgY29sb3IsIHtcbiAgICAgIGNsYXNzOiB7IHByZW1vdmU6IGFjdGl2ZUNvbG9yICYmIHByZURyb3BSb2xlID09PSByb2xlIH0sXG4gICAgICBhdHRyczoge1xuICAgICAgICAnZGF0YS1yb2xlJzogcm9sZSxcbiAgICAgICAgJ2RhdGEtY29sb3InOiBjb2xvcixcbiAgICAgICAgJ2RhdGEtbmInOiBuYixcbiAgICAgIH1cbiAgICB9KSkpO1xuICB9KSk7XG59XG4iLCJpbXBvcnQgKiBhcyByb3VuZCBmcm9tICcuL3JvdW5kJztcbmltcG9ydCAqIGFzIGdhbWUgZnJvbSAnZ2FtZSc7XG5pbXBvcnQgKiBhcyBzdGF0dXMgZnJvbSAnZ2FtZS9zdGF0dXMnO1xuaW1wb3J0ICogYXMgZ3JvdW5kIGZyb20gJy4vZ3JvdW5kJztcbmltcG9ydCBub3RpZnkgZnJvbSAnY29tbW9uL25vdGlmaWNhdGlvbic7XG5pbXBvcnQgeyBtYWtlIGFzIG1ha2VTb2NrZXQsIFJvdW5kU29ja2V0IH0gZnJvbSAnLi9zb2NrZXQnO1xuaW1wb3J0ICogYXMgdGl0bGUgZnJvbSAnLi90aXRsZSc7XG5pbXBvcnQgKiBhcyBwcm9tb3Rpb24gZnJvbSAnLi9wcm9tb3Rpb24nO1xuaW1wb3J0ICogYXMgYmx1ciBmcm9tICcuL2JsdXInO1xuaW1wb3J0ICogYXMgc3BlZWNoIGZyb20gJy4vc3BlZWNoJztcbmltcG9ydCAqIGFzIGNnIGZyb20gJ2NoZXNzZ3JvdW5kL3R5cGVzJztcbmltcG9ydCB7IENvbmZpZyBhcyBDZ0NvbmZpZyB9IGZyb20gJ2NoZXNzZ3JvdW5kL2NvbmZpZyc7XG5pbXBvcnQgeyBBcGkgYXMgQ2dBcGkgfSBmcm9tICdjaGVzc2dyb3VuZC9hcGknO1xuaW1wb3J0IHsgQ2xvY2tDb250cm9sbGVyIH0gZnJvbSAnLi9jbG9jay9jbG9ja0N0cmwnO1xuaW1wb3J0IHsgQ29ycmVzQ2xvY2tDb250cm9sbGVyLCBjdHJsIGFzIG1ha2VDb3JyZXNDbG9jayB9IGZyb20gJy4vY29ycmVzQ2xvY2svY29ycmVzQ2xvY2tDdHJsJztcbmltcG9ydCBNb3ZlT24gZnJvbSAnLi9tb3ZlT24nO1xuaW1wb3J0IFRyYW5zaWVudE1vdmUgZnJvbSAnLi90cmFuc2llbnRNb3ZlJztcbmltcG9ydCBhdG9taWMgPSByZXF1aXJlKCcuL2F0b21pYycpO1xuaW1wb3J0IHNvdW5kID0gcmVxdWlyZSgnLi9zb3VuZCcpO1xuaW1wb3J0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbmltcG9ydCB4aHIgPSByZXF1aXJlKCcuL3hocicpO1xuaW1wb3J0IHsgdmFsaWQgYXMgY3JhenlWYWxpZCwgaW5pdCBhcyBjcmF6eUluaXQsIG9uRW5kIGFzIGNyYXp5RW5kSG9vayB9IGZyb20gJy4vY3JhenkvY3JhenlDdHJsJztcbmltcG9ydCB7IGN0cmwgYXMgbWFrZUtleWJvYXJkTW92ZSwgS2V5Ym9hcmRNb3ZlIH0gZnJvbSAnLi9rZXlib2FyZE1vdmUnO1xuaW1wb3J0IHJlbmRlclVzZXIgPSByZXF1aXJlKCcuL3ZpZXcvdXNlcicpO1xuaW1wb3J0IGNldmFsU3ViID0gcmVxdWlyZSgnLi9jZXZhbFN1YicpO1xuaW1wb3J0ICogYXMga2V5Ym9hcmQgZnJvbSAnLi9rZXlib2FyZCc7XG5cbmltcG9ydCB7IFJvdW5kT3B0cywgUm91bmREYXRhLCBBcGlNb3ZlLCBBcGlFbmQsIFJlZHJhdywgU29ja2V0TW92ZSwgU29ja2V0RHJvcCwgU29ja2V0T3B0cywgTW92ZU1ldGFkYXRhLCBQb3NpdGlvbiwgTnZ1aVBsdWdpbiB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmludGVyZmFjZSBHb25lQmVyc2VyayB7XG4gIHdoaXRlPzogYm9vbGVhbjtcbiAgYmxhY2s/OiBib29sZWFuO1xufVxuXG50eXBlIFRpbWVvdXQgPSBudW1iZXI7XG5cbmNvbnN0IGxpID0gd2luZG93LmxpY2hlc3M7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvdW5kQ29udHJvbGxlciB7XG5cbiAgZGF0YTogUm91bmREYXRhO1xuICBzb2NrZXQ6IFJvdW5kU29ja2V0O1xuICBjaGVzc2dyb3VuZDogQ2dBcGk7XG4gIGNsb2NrPzogQ2xvY2tDb250cm9sbGVyO1xuICBjb3JyZXNDbG9jaz86IENvcnJlc0Nsb2NrQ29udHJvbGxlcjtcbiAgdHJhbnM6IFRyYW5zO1xuICBub2FyZzogVHJhbnNOb0FyZztcbiAga2V5Ym9hcmRNb3ZlPzogS2V5Ym9hcmRNb3ZlO1xuICBtb3ZlT246IE1vdmVPbjtcblxuICBwbHk6IG51bWJlcjtcbiAgZmlyc3RTZWNvbmRzOiBib29sZWFuID0gdHJ1ZTtcbiAgZmxpcDogYm9vbGVhbiA9IGZhbHNlO1xuICBsb2FkaW5nOiBib29sZWFuID0gZmFsc2U7XG4gIGxvYWRpbmdUaW1lb3V0OiBudW1iZXI7XG4gIHJlZGlyZWN0aW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHRyYW5zaWVudE1vdmU6IFRyYW5zaWVudE1vdmU7XG4gIG1vdmVUb1N1Ym1pdD86IFNvY2tldE1vdmU7XG4gIGRyb3BUb1N1Ym1pdD86IFNvY2tldERyb3A7XG4gIGdvbmVCZXJzZXJrOiBHb25lQmVyc2VyayA9IHt9O1xuICByZXNpZ25Db25maXJtPzogVGltZW91dCA9IHVuZGVmaW5lZDtcbiAgZHJhd0NvbmZpcm0/OiBUaW1lb3V0ID0gdW5kZWZpbmVkO1xuICAvLyB3aWxsIGJlIHJlcGxhY2VkIGJ5IHZpZXcgbGF5ZXJcbiAgYXV0b1Njcm9sbDogKCkgPT4gdm9pZCA9ICQubm9vcDtcbiAgY2hhbGxlbmdlUmVtYXRjaGVkOiBib29sZWFuID0gZmFsc2U7XG4gIGp1c3REcm9wcGVkPzogY2cuUm9sZTtcbiAganVzdENhcHR1cmVkPzogY2cuUGllY2U7XG4gIHNob3VsZFNlbmRNb3ZlVGltZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwcmVEcm9wPzogY2cuUm9sZTtcbiAgbGFzdERyYXdPZmZlckF0UGx5PzogUGx5O1xuICBudnVpPzogTnZ1aVBsdWdpbjtcblxuICBwcml2YXRlIG11c2ljPzogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IG9wdHM6IFJvdW5kT3B0cywgcmVhZG9ubHkgcmVkcmF3OiBSZWRyYXcpIHtcblxuICAgIHJvdW5kLm1hc3NhZ2Uob3B0cy5kYXRhKTtcblxuICAgIGNvbnN0IGQgPSB0aGlzLmRhdGEgPSBvcHRzLmRhdGE7XG5cbiAgICB0aGlzLnBseSA9IHJvdW5kLmxhc3RQbHkoZCk7XG4gICAgdGhpcy5nb25lQmVyc2Vya1tkLnBsYXllci5jb2xvcl0gPSBkLnBsYXllci5iZXJzZXJrO1xuICAgIHRoaXMuZ29uZUJlcnNlcmtbZC5vcHBvbmVudC5jb2xvcl0gPSBkLm9wcG9uZW50LmJlcnNlcms7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5maXJzdFNlY29uZHMgPSBmYWxzZTsgdGhpcy5yZWRyYXcoKTsgfSwgMzAwMCk7XG5cbiAgICB0aGlzLnNvY2tldCA9IG1ha2VTb2NrZXQob3B0cy5zb2NrZXRTZW5kLCB0aGlzKTtcblxuICAgIGlmIChsaS5Sb3VuZE5WVUkpIHRoaXMubnZ1aSA9IGxpLlJvdW5kTlZVSShyZWRyYXcpIGFzIE52dWlQbHVnaW47XG5cbiAgICBpZiAoZC5jbG9jaykgdGhpcy5jbG9jayA9IG5ldyBDbG9ja0NvbnRyb2xsZXIoZCwge1xuICAgICAgb25GbGFnOiB0aGlzLnNvY2tldC5vdXRvZnRpbWUsXG4gICAgICBzb3VuZENvbG9yOiAoZC5zaW11bCB8fCBkLnBsYXllci5zcGVjdGF0b3IgfHwgIWQucHJlZi5jbG9ja1NvdW5kKSA/IHVuZGVmaW5lZCA6IGQucGxheWVyLmNvbG9yLFxuICAgICAgbnZ1aTogISF0aGlzLm52dWlcbiAgICB9KTtcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMubWFrZUNvcnJlc3BvbmRlbmNlQ2xvY2soKTtcbiAgICAgIHNldEludGVydmFsKHRoaXMuY29ycmVzQ2xvY2tUaWNrLCAxMDAwKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFF1aWV0TW9kZSgpO1xuXG4gICAgdGhpcy5tb3ZlT24gPSBuZXcgTW92ZU9uKHRoaXMsICdtb3ZlLW9uJyk7XG4gICAgdGhpcy50cmFuc2llbnRNb3ZlID0gbmV3IFRyYW5zaWVudE1vdmUodGhpcy5zb2NrZXQpO1xuXG4gICAgdGhpcy50cmFucyA9IGxpLnRyYW5zKG9wdHMuaTE4bik7XG4gICAgdGhpcy5ub2FyZyA9IHRoaXMudHJhbnMubm9hcmc7XG5cbiAgICBzZXRUaW1lb3V0KHRoaXMuZGVsYXllZEluaXQsIDIwMCk7XG5cbiAgICBzZXRUaW1lb3V0KHRoaXMuc2hvd0V4cGlyYXRpb24sIDM1MCk7XG5cbiAgICBpZiAoIWRvY3VtZW50LnJlZmVycmVyIHx8IGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2YoJy9zZXJ2aWNlLXdvcmtlci5qcycpID09PSAtMSlcbiAgICAgIHNldFRpbWVvdXQodGhpcy5zaG93WW91ck1vdmVOb3RpZmljYXRpb24sIDUwMCk7XG5cbiAgICAvLyBhdCB0aGUgZW5kOlxuICAgIGxpLnB1YnN1Yi5vbignanVtcCcsIHBseSA9PiB7IHRoaXMuanVtcChwYXJzZUludChwbHkpKTsgdGhpcy5yZWRyYXcoKTsgfSk7XG5cbiAgICBsaS5wdWJzdWIub24oJ3NvdW5kX3NldCcsIHNldCA9PiB7XG4gICAgICBpZiAoIXRoaXMubXVzaWMgJiYgc2V0ID09PSAnbXVzaWMnKVxuICAgICAgICBsaS5sb2FkU2NyaXB0KCdqYXZhc2NyaXB0cy9tdXNpYy9wbGF5LmpzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5tdXNpYyA9IGxpLnBsYXlNdXNpYygpO1xuICAgICAgICB9KTtcbiAgICAgIGlmICh0aGlzLm11c2ljICYmIHNldCAhPT0gJ211c2ljJykgdGhpcy5tdXNpYyA9IHVuZGVmaW5lZDtcbiAgICB9KTtcblxuICAgIGxpLnB1YnN1Yi5vbignemVuJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNQbGF5aW5nKCkpIHtcbiAgICAgICAgY29uc3QgemVuID0gISQoJ2JvZHknKS5oYXNDbGFzcygnemVuJyk7XG4gICAgICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnemVuJywgemVuKTtcbiAgICAgICAgbGkuZGlzcGF0Y2hFdmVudCh3aW5kb3csICdyZXNpemUnKTtcbiAgICAgICAgJC5wb3N0KCcvcHJlZi96ZW4nLCB7IHplbjogemVuID8gMSA6IDAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAobGkuYWIgJiYgdGhpcy5pc1BsYXlpbmcoKSkgbGkuYWIuaW5pdCh0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvd0V4cGlyYXRpb24gPSAoKSA9PiB7XG4gICAgaWYgKCF0aGlzLmRhdGEuZXhwaXJhdGlvbikgcmV0dXJuO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gICAgc2V0VGltZW91dCh0aGlzLnNob3dFeHBpcmF0aW9uLCAyNTApO1xuICB9XG5cbiAgcHJpdmF0ZSBvblVzZXJNb3ZlID0gKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHtcbiAgICBpZiAobGkuYWIgJiYgKCF0aGlzLmtleWJvYXJkTW92ZSB8fCAhdGhpcy5rZXlib2FyZE1vdmUudXNlZFNhbikpIGxpLmFiLm1vdmUodGhpcywgbWV0YSk7XG4gICAgaWYgKCFwcm9tb3Rpb24uc3RhcnQodGhpcywgb3JpZywgZGVzdCwgbWV0YSkpIHRoaXMuc2VuZE1vdmUob3JpZywgZGVzdCwgdW5kZWZpbmVkLCBtZXRhKTtcbiAgfTtcblxuICBwcml2YXRlIG9uVXNlck5ld1BpZWNlID0gKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5LCBtZXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHtcbiAgICBpZiAoIXRoaXMucmVwbGF5aW5nKCkgJiYgY3JhenlWYWxpZCh0aGlzLmRhdGEsIHJvbGUsIGtleSkpIHtcbiAgICAgIHRoaXMuc2VuZE5ld1BpZWNlKHJvbGUsIGtleSwgISFtZXRhLnByZWRyb3ApO1xuICAgIH0gZWxzZSB0aGlzLmp1bXAodGhpcy5wbHkpO1xuICB9O1xuXG4gIHByaXZhdGUgb25Nb3ZlID0gKF86IGNnLktleSwgZGVzdDogY2cuS2V5LCBjYXB0dXJlZD86IGNnLlBpZWNlKSA9PiB7XG4gICAgaWYgKGNhcHR1cmVkKSB7XG4gICAgICBpZiAodGhpcy5kYXRhLmdhbWUudmFyaWFudC5rZXkgPT09ICdhdG9taWMnKSB7XG4gICAgICAgIHNvdW5kLmV4cGxvZGUoKTtcbiAgICAgICAgYXRvbWljLmNhcHR1cmUodGhpcywgZGVzdCk7XG4gICAgICB9IGVsc2Ugc291bmQuY2FwdHVyZSgpO1xuICAgIH0gZWxzZSBzb3VuZC5tb3ZlKCk7XG4gIH07XG5cbiAgcHJpdmF0ZSBvblByZW1vdmUgPSAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4ge1xuICAgIHByb21vdGlvbi5zdGFydCh0aGlzLCBvcmlnLCBkZXN0LCBtZXRhKTtcbiAgfTtcblxuICBwcml2YXRlIG9uQ2FuY2VsUHJlbW92ZSA9ICgpID0+IHtcbiAgICBwcm9tb3Rpb24uY2FuY2VsUHJlUHJvbW90aW9uKHRoaXMpO1xuICB9O1xuXG4gIHByaXZhdGUgb25QcmVkcm9wID0gKHJvbGU6IGNnLlJvbGUgfCB1bmRlZmluZWQsIF8/OiBLZXkpID0+IHtcbiAgICB0aGlzLnByZURyb3AgPSByb2xlO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH07XG5cbiAgcHJpdmF0ZSBpc1NpbXVsSG9zdCA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnNpbXVsICYmIHRoaXMuZGF0YS5zaW11bC5ob3N0SWQgPT09IHRoaXMub3B0cy51c2VySWQ7XG4gIH07XG5cbiAgbWFrZUNnSG9va3MgPSAoKSA9PiAoe1xuICAgIG9uVXNlck1vdmU6IHRoaXMub25Vc2VyTW92ZSxcbiAgICBvblVzZXJOZXdQaWVjZTogdGhpcy5vblVzZXJOZXdQaWVjZSxcbiAgICBvbk1vdmU6IHRoaXMub25Nb3ZlLFxuICAgIG9uTmV3UGllY2U6IHNvdW5kLm1vdmUsXG4gICAgb25QcmVtb3ZlOiB0aGlzLm9uUHJlbW92ZSxcbiAgICBvbkNhbmNlbFByZW1vdmU6IHRoaXMub25DYW5jZWxQcmVtb3ZlLFxuICAgIG9uUHJlZHJvcDogdGhpcy5vblByZWRyb3BcbiAgfSk7XG5cbiAgcmVwbGF5aW5nID0gKCk6IGJvb2xlYW4gPT4gdGhpcy5wbHkgIT09IHJvdW5kLmxhc3RQbHkodGhpcy5kYXRhKTtcblxuICB1c2VySnVtcCA9IChwbHk6IFBseSk6IHZvaWQgPT4ge1xuICAgIHRoaXMuY2FuY2VsTW92ZSgpO1xuICAgIHRoaXMuY2hlc3Nncm91bmQuc2VsZWN0U3F1YXJlKG51bGwpO1xuICAgIGlmIChwbHkgIT0gdGhpcy5wbHkgJiYgdGhpcy5qdW1wKHBseSkpIHNwZWVjaC51c2VySnVtcCh0aGlzLCB0aGlzLnBseSk7XG4gICAgZWxzZSB0aGlzLnJlZHJhdygpO1xuICB9O1xuXG4gIGlzUGxheWluZyA9ICgpID0+IGdhbWUuaXNQbGF5ZXJQbGF5aW5nKHRoaXMuZGF0YSk7XG5cbiAganVtcCA9IChwbHk6IFBseSk6IGJvb2xlYW4gPT4ge1xuICAgIHBseSA9IE1hdGgubWF4KHJvdW5kLmZpcnN0UGx5KHRoaXMuZGF0YSksIE1hdGgubWluKHJvdW5kLmxhc3RQbHkodGhpcy5kYXRhKSwgcGx5KSk7XG4gICAgY29uc3QgaXNGb3J3YXJkU3RlcCA9IHBseSA9PT0gdGhpcy5wbHkgKyAxO1xuICAgIHRoaXMucGx5ID0gcGx5O1xuICAgIHRoaXMuanVzdERyb3BwZWQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5wcmVEcm9wID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IHMgPSB0aGlzLnN0ZXBBdChwbHkpLFxuICAgICAgY29uZmlnOiBDZ0NvbmZpZyA9IHtcbiAgICAgICAgZmVuOiBzLmZlbixcbiAgICAgICAgbGFzdE1vdmU6IHV0aWwudWNpMm1vdmUocy51Y2kpLFxuICAgICAgICBjaGVjazogISFzLmNoZWNrLFxuICAgICAgICB0dXJuQ29sb3I6IHRoaXMucGx5ICUgMiA9PT0gMCA/ICd3aGl0ZScgOiAnYmxhY2snXG4gICAgICB9O1xuICAgIGlmICh0aGlzLnJlcGxheWluZygpKSB0aGlzLmNoZXNzZ3JvdW5kLnN0b3AoKTtcbiAgICBlbHNlIGNvbmZpZy5tb3ZhYmxlID0ge1xuICAgICAgY29sb3I6IHRoaXMuaXNQbGF5aW5nKCkgPyB0aGlzLmRhdGEucGxheWVyLmNvbG9yIDogdW5kZWZpbmVkLFxuICAgICAgZGVzdHM6IHV0aWwucGFyc2VQb3NzaWJsZU1vdmVzKHRoaXMuZGF0YS5wb3NzaWJsZU1vdmVzKVxuICAgIH1cbiAgICB0aGlzLmNoZXNzZ3JvdW5kLnNldChjb25maWcpO1xuICAgIGlmIChzLnNhbiAmJiBpc0ZvcndhcmRTdGVwKSB7XG4gICAgICBpZiAocy5zYW4uaW5jbHVkZXMoJ3gnKSkgc291bmQuY2FwdHVyZSgpO1xuICAgICAgZWxzZSBzb3VuZC5tb3ZlKCk7XG4gICAgICBpZiAoL1srI10vLnRlc3Qocy5zYW4pKSBzb3VuZC5jaGVjaygpO1xuICAgIH1cbiAgICB0aGlzLmF1dG9TY3JvbGwoKTtcbiAgICBpZiAodGhpcy5rZXlib2FyZE1vdmUpIHRoaXMua2V5Ym9hcmRNb3ZlLnVwZGF0ZShzKTtcbiAgICBsaS5wdWJzdWIuZW1pdCgncGx5JywgcGx5KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICByZXBsYXlFbmFibGVkQnlQcmVmID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgIGNvbnN0IGQgPSB0aGlzLmRhdGE7XG4gICAgcmV0dXJuIGQucHJlZi5yZXBsYXkgPT09IDIgfHwgKFxuICAgICAgZC5wcmVmLnJlcGxheSA9PT0gMSAmJiAoZC5nYW1lLnNwZWVkID09PSAnY2xhc3NpY2FsJyB8fCBkLmdhbWUuc3BlZWQgPT09ICd1bmxpbWl0ZWQnIHx8IGQuZ2FtZS5zcGVlZCA9PT0gJ2NvcnJlc3BvbmRlbmNlJylcbiAgICApO1xuICB9O1xuXG4gIGlzTGF0ZSA9ICgpID0+IHRoaXMucmVwbGF5aW5nKCkgJiYgc3RhdHVzLnBsYXlpbmcodGhpcy5kYXRhKTtcblxuICBwbGF5ZXJBdCA9IChwb3NpdGlvbjogUG9zaXRpb24pID0+XG4gICAgKHRoaXMuZmxpcCBhcyBhbnkpIF4gKChwb3NpdGlvbiA9PT0gJ3RvcCcpIGFzIGFueSkgPyB0aGlzLmRhdGEub3Bwb25lbnQgOiB0aGlzLmRhdGEucGxheWVyO1xuXG4gIGZsaXBOb3cgPSAoKSA9PiB7XG4gICAgdGhpcy5mbGlwID0gIXRoaXMubnZ1aSAmJiAhdGhpcy5mbGlwO1xuICAgIHRoaXMuY2hlc3Nncm91bmQuc2V0KHtcbiAgICAgIG9yaWVudGF0aW9uOiBncm91bmQuYm9hcmRPcmllbnRhdGlvbih0aGlzLmRhdGEsIHRoaXMuZmxpcClcbiAgICB9KTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICB9O1xuXG4gIHNldFRpdGxlID0gKCkgPT4gdGl0bGUuc2V0KHRoaXMpO1xuXG4gIGFjdHVhbFNlbmRNb3ZlID0gKHRwZTogc3RyaW5nLCBkYXRhOiBhbnksIG1ldGE6IE1vdmVNZXRhZGF0YSA9IHt9KSA9PiB7XG4gICAgY29uc3Qgc29ja2V0T3B0czogU29ja2V0T3B0cyA9IHtcbiAgICAgIGFja2FibGU6IHRydWVcbiAgICB9O1xuICAgIGlmICh0aGlzLmNsb2NrKSB7XG4gICAgICBzb2NrZXRPcHRzLndpdGhMYWcgPSAhdGhpcy5zaG91bGRTZW5kTW92ZVRpbWUgfHwgIXRoaXMuY2xvY2suaXNSdW5uaW5nO1xuICAgICAgaWYgKG1ldGEucHJlbW92ZSAmJiB0aGlzLnNob3VsZFNlbmRNb3ZlVGltZSkge1xuICAgICAgICB0aGlzLmNsb2NrLmhhcmRTdG9wQ2xvY2soKTtcbiAgICAgICAgc29ja2V0T3B0cy5taWxsaXMgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbW92ZU1pbGxpcyA9IHRoaXMuY2xvY2suc3RvcENsb2NrKCk7XG4gICAgICAgIGlmIChtb3ZlTWlsbGlzICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zaG91bGRTZW5kTW92ZVRpbWUpIHtcbiAgICAgICAgICBzb2NrZXRPcHRzLm1pbGxpcyA9IG1vdmVNaWxsaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zb2NrZXQuc2VuZCh0cGUsIGRhdGEsIHNvY2tldE9wdHMpO1xuXG4gICAgdGhpcy5qdXN0RHJvcHBlZCA9IG1ldGEuanVzdERyb3BwZWQ7XG4gICAgdGhpcy5qdXN0Q2FwdHVyZWQgPSBtZXRhLmp1c3RDYXB0dXJlZDtcbiAgICB0aGlzLnByZURyb3AgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50cmFuc2llbnRNb3ZlLnJlZ2lzdGVyKCk7XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfVxuXG4gIHNlbmRNb3ZlID0gKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBwcm9tOiBjZy5Sb2xlIHwgdW5kZWZpbmVkLCBtZXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHtcbiAgICBjb25zdCBtb3ZlOiBTb2NrZXRNb3ZlID0ge1xuICAgICAgdTogb3JpZyArIGRlc3RcbiAgICB9O1xuICAgIGlmIChwcm9tKSBtb3ZlLnUgKz0gKHByb20gPT09ICdrbmlnaHQnID8gJ24nIDogcHJvbVswXSk7XG4gICAgaWYgKGJsdXIuZ2V0KCkpIG1vdmUuYiA9IDE7XG4gICAgdGhpcy5yZXNpZ24oZmFsc2UpO1xuICAgIGlmICh0aGlzLmRhdGEucHJlZi5zdWJtaXRNb3ZlICYmICFtZXRhLnByZW1vdmUpIHtcbiAgICAgIHRoaXMubW92ZVRvU3VibWl0ID0gbW92ZTtcbiAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWN0dWFsU2VuZE1vdmUoJ21vdmUnLCBtb3ZlLCB7XG4gICAgICAgIGp1c3RDYXB0dXJlZDogbWV0YS5jYXB0dXJlZCxcbiAgICAgICAgcHJlbW92ZTogbWV0YS5wcmVtb3ZlXG4gICAgICB9KVxuICAgIH1cbiAgfTtcblxuICBzZW5kTmV3UGllY2UgPSAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXksIGlzUHJlZHJvcDogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGRyb3A6IFNvY2tldERyb3AgPSB7XG4gICAgICByb2xlOiByb2xlLFxuICAgICAgcG9zOiBrZXlcbiAgICB9O1xuICAgIGlmIChibHVyLmdldCgpKSBkcm9wLmIgPSAxO1xuICAgIHRoaXMucmVzaWduKGZhbHNlKTtcbiAgICBpZiAodGhpcy5kYXRhLnByZWYuc3VibWl0TW92ZSAmJiAhaXNQcmVkcm9wKSB7XG4gICAgICB0aGlzLmRyb3BUb1N1Ym1pdCA9IGRyb3A7XG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdHVhbFNlbmRNb3ZlKCdkcm9wJywgZHJvcCwge1xuICAgICAgICBqdXN0RHJvcHBlZDogcm9sZSxcbiAgICAgICAgcHJlbW92ZTogaXNQcmVkcm9wXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgc2hvd1lvdXJNb3ZlTm90aWZpY2F0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0IGQgPSB0aGlzLmRhdGE7XG4gICAgaWYgKGdhbWUuaXNQbGF5ZXJUdXJuKGQpKSBub3RpZnkoKCkgPT4ge1xuICAgICAgbGV0IHR4dCA9IHRoaXMudHJhbnMoJ3lvdXJUdXJuJyksXG4gICAgICAgIG9wcG9uZW50ID0gcmVuZGVyVXNlci51c2VyVHh0KHRoaXMsIGQub3Bwb25lbnQpO1xuICAgICAgaWYgKHRoaXMucGx5IDwgMSkgdHh0ID0gb3Bwb25lbnQgKyAnXFxuam9pbmVkIHRoZSBnYW1lLlxcbicgKyB0eHQ7XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IG1vdmUgPSBkLnN0ZXBzW2Quc3RlcHMubGVuZ3RoIC0gMV0uc2FuLFxuICAgICAgICAgIHR1cm4gPSBNYXRoLmZsb29yKCh0aGlzLnBseSAtIDEpIC8gMikgKyAxO1xuICAgICAgICBtb3ZlID0gdHVybiArICh0aGlzLnBseSAlIDIgPT09IDEgPyAnLicgOiAnLi4uJykgKyAnICcgKyBtb3ZlO1xuICAgICAgICB0eHQgPSBvcHBvbmVudCArICdcXG5wbGF5ZWQgJyArIG1vdmUgKyAnLlxcbicgKyB0eHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHh0O1xuICAgIH0pO1xuICAgIGVsc2UgaWYgKHRoaXMuaXNQbGF5aW5nKCkgJiYgdGhpcy5wbHkgPCAxKSBub3RpZnkoKCkgPT4ge1xuICAgICAgcmV0dXJuIHJlbmRlclVzZXIudXNlclR4dCh0aGlzLCBkLm9wcG9uZW50KSArICdcXG5qb2luZWQgdGhlIGdhbWUuJztcbiAgICB9KTtcbiAgfTtcblxuICBwbGF5ZXJCeUNvbG9yID0gKGM6IENvbG9yKSA9PlxuICAgIHRoaXMuZGF0YVtjID09PSB0aGlzLmRhdGEucGxheWVyLmNvbG9yID8gJ3BsYXllcicgOiAnb3Bwb25lbnQnXTtcblxuICBhcGlNb3ZlID0gKG86IEFwaU1vdmUpOiB2b2lkID0+IHtcbiAgICBjb25zdCBkID0gdGhpcy5kYXRhLFxuICAgICAgcGxheWluZyA9IHRoaXMuaXNQbGF5aW5nKCk7XG5cbiAgICBkLmdhbWUudHVybnMgPSBvLnBseTtcbiAgICBkLmdhbWUucGxheWVyID0gby5wbHkgJSAyID09PSAwID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgY29uc3QgcGxheWVkQ29sb3IgPSBvLnBseSAlIDIgPT09IDAgPyAnYmxhY2snIDogJ3doaXRlJyxcbiAgICAgIGFjdGl2ZUNvbG9yID0gZC5wbGF5ZXIuY29sb3IgPT09IGQuZ2FtZS5wbGF5ZXI7XG4gICAgaWYgKG8uc3RhdHVzKSBkLmdhbWUuc3RhdHVzID0gby5zdGF0dXM7XG4gICAgaWYgKG8ud2lubmVyKSBkLmdhbWUud2lubmVyID0gby53aW5uZXI7XG4gICAgdGhpcy5wbGF5ZXJCeUNvbG9yKCd3aGl0ZScpLm9mZmVyaW5nRHJhdyA9IG8ud0RyYXc7XG4gICAgdGhpcy5wbGF5ZXJCeUNvbG9yKCdibGFjaycpLm9mZmVyaW5nRHJhdyA9IG8uYkRyYXc7XG4gICAgZC5wb3NzaWJsZU1vdmVzID0gYWN0aXZlQ29sb3IgPyBvLmRlc3RzIDogdW5kZWZpbmVkO1xuICAgIGQucG9zc2libGVEcm9wcyA9IGFjdGl2ZUNvbG9yID8gby5kcm9wcyA6IHVuZGVmaW5lZDtcbiAgICBkLmNyYXp5aG91c2UgPSBvLmNyYXp5aG91c2U7XG4gICAgdGhpcy5zZXRUaXRsZSgpO1xuICAgIGlmICghdGhpcy5yZXBsYXlpbmcoKSkge1xuICAgICAgdGhpcy5wbHkrKztcbiAgICAgIGlmIChvLnJvbGUpIHRoaXMuY2hlc3Nncm91bmQubmV3UGllY2Uoe1xuICAgICAgICByb2xlOiBvLnJvbGUsXG4gICAgICAgIGNvbG9yOiBwbGF5ZWRDb2xvclxuICAgICAgfSwgby51Y2kuc3Vic3RyKDIsIDIpIGFzIGNnLktleSk7XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3Qga2V5cyA9IHV0aWwudWNpMm1vdmUoby51Y2kpO1xuICAgICAgICB0aGlzLmNoZXNzZ3JvdW5kLm1vdmUoa2V5cyFbMF0sIGtleXMhWzFdKTtcbiAgICAgIH1cbiAgICAgIGlmIChvLmVucGFzc2FudCkge1xuICAgICAgICBjb25zdCBwID0gby5lbnBhc3NhbnQsIHBpZWNlczogY2cuUGllY2VzRGlmZiA9IHt9O1xuICAgICAgICBwaWVjZXNbcC5rZXldID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNoZXNzZ3JvdW5kLnNldFBpZWNlcyhwaWVjZXMpO1xuICAgICAgICBpZiAoZC5nYW1lLnZhcmlhbnQua2V5ID09PSAnYXRvbWljJykge1xuICAgICAgICAgIGF0b21pYy5lbnBhc3NhbnQodGhpcywgcC5rZXksIHAuY29sb3IpO1xuICAgICAgICAgIHNvdW5kLmV4cGxvZGUoKTtcbiAgICAgICAgfSBlbHNlIHNvdW5kLmNhcHR1cmUoKTtcbiAgICAgIH1cbiAgICAgIGlmIChvLnByb21vdGlvbikgZ3JvdW5kLnByb21vdGUodGhpcy5jaGVzc2dyb3VuZCwgby5wcm9tb3Rpb24ua2V5LCBvLnByb21vdGlvbi5waWVjZUNsYXNzKTtcbiAgICAgIGlmIChvLmNhc3RsZSAmJiAhdGhpcy5jaGVzc2dyb3VuZC5zdGF0ZS5hdXRvQ2FzdGxlKSB7XG4gICAgICAgIGNvbnN0IGMgPSBvLmNhc3RsZSwgcGllY2VzOiBjZy5QaWVjZXNEaWZmID0ge307XG4gICAgICAgIHBpZWNlc1tjLmtpbmdbMF1dID0gdW5kZWZpbmVkO1xuICAgICAgICBwaWVjZXNbYy5yb29rWzBdXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcGllY2VzW2Mua2luZ1sxXV0gPSB7XG4gICAgICAgICAgcm9sZTogJ2tpbmcnLFxuICAgICAgICAgIGNvbG9yOiBjLmNvbG9yXG4gICAgICAgIH07XG4gICAgICAgIHBpZWNlc1tjLnJvb2tbMV1dID0ge1xuICAgICAgICAgIHJvbGU6ICdyb29rJyxcbiAgICAgICAgICBjb2xvcjogYy5jb2xvclxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNoZXNzZ3JvdW5kLnNldFBpZWNlcyhwaWVjZXMpO1xuICAgICAgfVxuICAgICAgdGhpcy5jaGVzc2dyb3VuZC5zZXQoe1xuICAgICAgICB0dXJuQ29sb3I6IGQuZ2FtZS5wbGF5ZXIsXG4gICAgICAgIG1vdmFibGU6IHtcbiAgICAgICAgICBkZXN0czogcGxheWluZyA/IHV0aWwucGFyc2VQb3NzaWJsZU1vdmVzKGQucG9zc2libGVNb3ZlcykgOiB7fVxuICAgICAgICB9LFxuICAgICAgICBjaGVjazogISFvLmNoZWNrXG4gICAgICB9KTtcbiAgICAgIGlmIChvLmNoZWNrKSBzb3VuZC5jaGVjaygpO1xuICAgICAgYmx1ci5vbk1vdmUoKTtcbiAgICAgIGxpLnB1YnN1Yi5lbWl0KCdwbHknLCB0aGlzLnBseSk7XG4gICAgfVxuICAgIGQuZ2FtZS50aHJlZWZvbGQgPSAhIW8udGhyZWVmb2xkO1xuICAgIGNvbnN0IHN0ZXAgPSB7XG4gICAgICBwbHk6IHJvdW5kLmxhc3RQbHkodGhpcy5kYXRhKSArIDEsXG4gICAgICBmZW46IG8uZmVuLFxuICAgICAgc2FuOiBvLnNhbixcbiAgICAgIHVjaTogby51Y2ksXG4gICAgICBjaGVjazogby5jaGVjayxcbiAgICAgIGNyYXp5OiBvLmNyYXp5aG91c2VcbiAgICB9O1xuICAgIGQuc3RlcHMucHVzaChzdGVwKTtcbiAgICB0aGlzLmp1c3REcm9wcGVkID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuanVzdENhcHR1cmVkID0gdW5kZWZpbmVkO1xuICAgIGdhbWUuc2V0T25HYW1lKGQsIHBsYXllZENvbG9yLCB0cnVlKTtcbiAgICB0aGlzLmRhdGEuZm9yZWNhc3RDb3VudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoby5jbG9jaykge1xuICAgICAgdGhpcy5zaG91bGRTZW5kTW92ZVRpbWUgPSB0cnVlO1xuICAgICAgY29uc3Qgb2MgPSBvLmNsb2NrLFxuICAgICAgICBkZWxheSA9IChwbGF5aW5nICYmIGFjdGl2ZUNvbG9yKSA/IDAgOiAob2MubGFnIHx8IDEpO1xuICAgICAgaWYgKHRoaXMuY2xvY2spIHRoaXMuY2xvY2suc2V0Q2xvY2soZCwgb2Mud2hpdGUsIG9jLmJsYWNrLCBkZWxheSk7XG4gICAgICBlbHNlIGlmICh0aGlzLmNvcnJlc0Nsb2NrKSB0aGlzLmNvcnJlc0Nsb2NrLnVwZGF0ZShcbiAgICAgICAgb2Mud2hpdGUsXG4gICAgICAgIG9jLmJsYWNrKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZGF0YS5leHBpcmF0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kYXRhLnN0ZXBzLmxlbmd0aCA+IDIpIHRoaXMuZGF0YS5leHBpcmF0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgZWxzZSB0aGlzLmRhdGEuZXhwaXJhdGlvbi5tb3ZlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB9XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgICBpZiAocGxheWluZyAmJiBwbGF5ZWRDb2xvciA9PSBkLnBsYXllci5jb2xvcikge1xuICAgICAgdGhpcy50cmFuc2llbnRNb3ZlLmNsZWFyKCk7XG4gICAgICB0aGlzLm1vdmVPbi5uZXh0KCk7XG4gICAgICBjZXZhbFN1Yi5wdWJsaXNoKGQsIG8pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMucmVwbGF5aW5nKCkgJiYgcGxheWVkQ29sb3IgIT0gZC5wbGF5ZXIuY29sb3IpIHtcbiAgICAgIC8vIGF0cm9jaW91cyBoYWNrIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25cbiAgICAgIC8vIHdpdGggZXhwbG9zaW9ucyBhbmQgcHJlbW92ZXNcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9vcm5pY2FyL2xpbGEvaXNzdWVzLzM0M1xuICAgICAgY29uc3QgcHJlbW92ZURlbGF5ID0gZC5nYW1lLnZhcmlhbnQua2V5ID09PSAnYXRvbWljJyA/IDEwMCA6IDE7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNoZXNzZ3JvdW5kLnBsYXlQcmVtb3ZlKCkgJiYgIXRoaXMucGxheVByZWRyb3AoKSkge1xuICAgICAgICAgIHByb21vdGlvbi5jYW5jZWwodGhpcyk7XG4gICAgICAgICAgdGhpcy5zaG93WW91ck1vdmVOb3RpZmljYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJlbW92ZURlbGF5KTtcbiAgICB9XG4gICAgdGhpcy5hdXRvU2Nyb2xsKCk7XG4gICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIGlmICh0aGlzLmtleWJvYXJkTW92ZSkgdGhpcy5rZXlib2FyZE1vdmUudXBkYXRlKHN0ZXAsIHBsYXllZENvbG9yICE9IGQucGxheWVyLmNvbG9yKTtcbiAgICBpZiAodGhpcy5tdXNpYykgdGhpcy5tdXNpYy5qdW1wKG8pO1xuICAgIHNwZWVjaC5zdGVwKHN0ZXApO1xuICB9O1xuXG4gIHByaXZhdGUgcGxheVByZWRyb3AgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3Nncm91bmQucGxheVByZWRyb3AoZHJvcCA9PiB7XG4gICAgICByZXR1cm4gY3JhenlWYWxpZCh0aGlzLmRhdGEsIGRyb3Aucm9sZSwgZHJvcC5rZXkpO1xuICAgIH0pO1xuICB9O1xuXG4gIHByaXZhdGUgY2xlYXJKdXN0KCkge1xuICAgIHRoaXMuanVzdERyb3BwZWQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5qdXN0Q2FwdHVyZWQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5wcmVEcm9wID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmVsb2FkID0gKGQ6IFJvdW5kRGF0YSk6IHZvaWQgPT4ge1xuICAgIGlmIChkLnN0ZXBzLmxlbmd0aCAhPT0gdGhpcy5kYXRhLnN0ZXBzLmxlbmd0aCkgdGhpcy5wbHkgPSBkLnN0ZXBzW2Quc3RlcHMubGVuZ3RoIC0gMV0ucGx5O1xuICAgIHJvdW5kLm1hc3NhZ2UoZCk7XG4gICAgdGhpcy5kYXRhID0gZDtcbiAgICB0aGlzLmNsZWFySnVzdCgpO1xuICAgIHRoaXMuc2hvdWxkU2VuZE1vdmVUaW1lID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuY2xvY2spIHRoaXMuY2xvY2suc2V0Q2xvY2soZCwgZC5jbG9jayEud2hpdGUsIGQuY2xvY2shLmJsYWNrKTtcbiAgICBpZiAodGhpcy5jb3JyZXNDbG9jaykgdGhpcy5jb3JyZXNDbG9jay51cGRhdGUoZC5jb3JyZXNwb25kZW5jZS53aGl0ZSwgZC5jb3JyZXNwb25kZW5jZS5ibGFjayk7XG4gICAgaWYgKCF0aGlzLnJlcGxheWluZygpKSBncm91bmQucmVsb2FkKHRoaXMpO1xuICAgIHRoaXMuc2V0VGl0bGUoKTtcbiAgICB0aGlzLm1vdmVPbi5uZXh0KCk7XG4gICAgdGhpcy5zZXRRdWlldE1vZGUoKTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICAgIHRoaXMuYXV0b1Njcm9sbCgpO1xuICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB0aGlzLnNldExvYWRpbmcoZmFsc2UpO1xuICAgIGlmICh0aGlzLmtleWJvYXJkTW92ZSkgdGhpcy5rZXlib2FyZE1vdmUudXBkYXRlKGQuc3RlcHNbZC5zdGVwcy5sZW5ndGggLSAxXSk7XG4gIH07XG5cbiAgZW5kV2l0aERhdGEgPSAobzogQXBpRW5kKTogdm9pZCA9PiB7XG4gICAgY29uc3QgZCA9IHRoaXMuZGF0YTtcbiAgICBkLmdhbWUud2lubmVyID0gby53aW5uZXI7XG4gICAgZC5nYW1lLnN0YXR1cyA9IG8uc3RhdHVzO1xuICAgIGQuZ2FtZS5ib29zdGVkID0gby5ib29zdGVkO1xuICAgIHRoaXMudXNlckp1bXAocm91bmQubGFzdFBseShkKSk7XG4gICAgdGhpcy5jaGVzc2dyb3VuZC5zdG9wKCk7XG4gICAgaWYgKG8ucmF0aW5nRGlmZikge1xuICAgICAgZC5wbGF5ZXIucmF0aW5nRGlmZiA9IG8ucmF0aW5nRGlmZltkLnBsYXllci5jb2xvcl07XG4gICAgICBkLm9wcG9uZW50LnJhdGluZ0RpZmYgPSBvLnJhdGluZ0RpZmZbZC5vcHBvbmVudC5jb2xvcl07XG4gICAgfVxuICAgIGlmICghZC5wbGF5ZXIuc3BlY3RhdG9yICYmIGQuZ2FtZS50dXJucyA+IDEpXG4gICAgICBsaS5zb3VuZFtvLndpbm5lciA/IChkLnBsYXllci5jb2xvciA9PT0gby53aW5uZXIgPyAndmljdG9yeScgOiAnZGVmZWF0JykgOiAnZHJhdyddKCk7XG4gICAgaWYgKGQuY3Jhenlob3VzZSkgY3JhenlFbmRIb29rKCk7XG4gICAgdGhpcy5jbGVhckp1c3QoKTtcbiAgICB0aGlzLnNldFRpdGxlKCk7XG4gICAgdGhpcy5tb3ZlT24ubmV4dCgpO1xuICAgIHRoaXMuc2V0UXVpZXRNb2RlKCk7XG4gICAgdGhpcy5zZXRMb2FkaW5nKGZhbHNlKTtcbiAgICBpZiAodGhpcy5jbG9jayAmJiBvLmNsb2NrKSB0aGlzLmNsb2NrLnNldENsb2NrKGQsIG8uY2xvY2sud2MgKiAuMDEsIG8uY2xvY2suYmMgKiAuMDEpO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gICAgdGhpcy5hdXRvU2Nyb2xsKCk7XG4gICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIGlmIChkLnR2KSBzZXRUaW1lb3V0KGxpLnJlbG9hZCwgMTAwMDApO1xuICAgIHNwZWVjaC5zdGF0dXModGhpcyk7XG4gIH07XG5cbiAgY2hhbGxlbmdlUmVtYXRjaCA9ICgpOiB2b2lkID0+IHtcbiAgICB0aGlzLmNoYWxsZW5nZVJlbWF0Y2hlZCA9IHRydWU7XG4gICAgeGhyLmNoYWxsZW5nZVJlbWF0Y2godGhpcy5kYXRhLmdhbWUuaWQpLnRoZW4oKCkgPT4ge1xuICAgICAgbGkuY2hhbGxlbmdlQXBwLm9wZW4oKTtcbiAgICAgIGlmIChsaS5vbmNlKCdyZW1hdGNoLWNoYWxsZW5nZScpKSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbGkuaG9wc2NvdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpbmRvdy5ob3BzY290Y2guY29uZmlndXJlKHtcbiAgICAgICAgICAgIGkxOG46IHsgZG9uZUJ0bjogJ09LLCBnb3QgaXQnIH1cbiAgICAgICAgICB9KS5zdGFydFRvdXIoe1xuICAgICAgICAgICAgaWQ6IFwicmVtYXRjaC1jaGFsbGVuZ2VcIixcbiAgICAgICAgICAgIHNob3dQcmV2QnV0dG9uOiB0cnVlLFxuICAgICAgICAgICAgc3RlcHM6IFt7XG4gICAgICAgICAgICAgIHRpdGxlOiBcIkNoYWxsZW5nZWQgdG8gYSByZW1hdGNoXCIsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6ICdZb3VyIG9wcG9uZW50IGlzIG9mZmxpbmUsIGJ1dCB0aGV5IGNhbiBhY2NlcHQgdGhpcyBjaGFsbGVuZ2UgbGF0ZXIhJyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiBcIiNjaGFsbGVuZ2UtYXBwXCIsXG4gICAgICAgICAgICAgIHBsYWNlbWVudDogXCJib3R0b21cIlxuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9LCBfID0+IHtcbiAgICAgIHRoaXMuY2hhbGxlbmdlUmVtYXRjaGVkID0gZmFsc2U7XG4gICAgfSk7XG4gIH07XG5cbiAgcHJpdmF0ZSBtYWtlQ29ycmVzcG9uZGVuY2VDbG9jayA9ICgpOiB2b2lkID0+IHtcbiAgICBpZiAodGhpcy5kYXRhLmNvcnJlc3BvbmRlbmNlICYmICF0aGlzLmNvcnJlc0Nsb2NrKVxuICAgICAgdGhpcy5jb3JyZXNDbG9jayA9IG1ha2VDb3JyZXNDbG9jayhcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5kYXRhLmNvcnJlc3BvbmRlbmNlLFxuICAgICAgICB0aGlzLnNvY2tldC5vdXRvZnRpbWVcbiAgICAgICk7XG4gIH07XG5cbiAgcHJpdmF0ZSBjb3JyZXNDbG9ja1RpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuY29ycmVzQ2xvY2sgJiYgZ2FtZS5wbGF5YWJsZSh0aGlzLmRhdGEpKVxuICAgICAgdGhpcy5jb3JyZXNDbG9jay50aWNrKHRoaXMuZGF0YS5nYW1lLnBsYXllcik7XG4gIH07XG5cbiAgcHJpdmF0ZSBzZXRRdWlldE1vZGUgPSAoKSA9PiB7XG4gICAgY29uc3Qgd2FzID0gbGkucXVpZXRNb2RlO1xuICAgIGNvbnN0IGlzID0gdGhpcy5pc1BsYXlpbmcoKTtcbiAgICBpZiAod2FzICE9PSBpcykge1xuICAgICAgbGkucXVpZXRNb2RlID0gaXM7XG4gICAgICAkKCdib2R5JylcbiAgICAgICAgLnRvZ2dsZUNsYXNzKCdwbGF5aW5nJywgaXMpXG4gICAgICAgIC50b2dnbGVDbGFzcygnbm8tc2VsZWN0JyxcbiAgICAgICAgICBpcyAmJiB0aGlzLmNsb2NrICYmIHRoaXMuY2xvY2subWlsbGlzT2YodGhpcy5kYXRhLnBsYXllci5jb2xvcikgPD0gM2U1KTtcbiAgICB9XG4gIH07XG5cbiAgdGFrZWJhY2tZZXMgPSAoKSA9PiB7XG4gICAgdGhpcy5zb2NrZXQuc2VuZExvYWRpbmcoJ3Rha2ViYWNrLXllcycpO1xuICAgIHRoaXMuY2hlc3Nncm91bmQuY2FuY2VsUHJlbW92ZSgpO1xuICAgIHByb21vdGlvbi5jYW5jZWwodGhpcyk7XG4gIH07XG5cbiAgcmVzaWduID0gKHY6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICBpZiAodikge1xuICAgICAgaWYgKHRoaXMucmVzaWduQ29uZmlybSB8fCAhdGhpcy5kYXRhLnByZWYuY29uZmlybVJlc2lnbikge1xuICAgICAgICB0aGlzLnNvY2tldC5zZW5kTG9hZGluZygncmVzaWduJyk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2lnbkNvbmZpcm0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXNpZ25Db25maXJtID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlc2lnbihmYWxzZSksIDMwMDApO1xuICAgICAgfVxuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucmVzaWduQ29uZmlybSkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVzaWduQ29uZmlybSk7XG4gICAgICB0aGlzLnJlc2lnbkNvbmZpcm0gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cbiAgfVxuXG4gIGdvQmVyc2VyayA9ICgpID0+IHtcbiAgICB0aGlzLnNvY2tldC5iZXJzZXJrKCk7XG4gICAgbGkuc291bmQuYmVyc2VyaygpO1xuICB9O1xuXG4gIHNldEJlcnNlcmsgPSAoY29sb3I6IENvbG9yKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuZ29uZUJlcnNlcmtbY29sb3JdKSByZXR1cm47XG4gICAgdGhpcy5nb25lQmVyc2Vya1tjb2xvcl0gPSB0cnVlO1xuICAgIGlmIChjb2xvciAhPT0gdGhpcy5kYXRhLnBsYXllci5jb2xvcikgbGkuc291bmQuYmVyc2VyaygpO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH07XG5cbiAgc2V0TG9hZGluZyA9ICh2OiBib29sZWFuLCBkdXJhdGlvbjogbnVtYmVyID0gMTUwMCkgPT4ge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmxvYWRpbmdUaW1lb3V0KTtcbiAgICBpZiAodikge1xuICAgICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMubG9hZGluZ1RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgICB9LCBkdXJhdGlvbik7XG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5sb2FkaW5nKSB7XG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgfVxuICB9O1xuXG4gIHNldFJlZGlyZWN0aW5nID0gKCkgPT4ge1xuICAgIHRoaXMucmVkaXJlY3RpbmcgPSB0cnVlO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5yZWRpcmVjdGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9LCAyNTAwKTtcbiAgICB0aGlzLnJlZHJhdygpO1xuICB9O1xuXG4gIHN1Ym1pdE1vdmUgPSAodjogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHRvU3VibWl0ID0gdGhpcy5tb3ZlVG9TdWJtaXQgfHwgdGhpcy5kcm9wVG9TdWJtaXQ7XG4gICAgaWYgKHYgJiYgdG9TdWJtaXQpIHtcbiAgICAgIGlmICh0aGlzLm1vdmVUb1N1Ym1pdCkgdGhpcy5hY3R1YWxTZW5kTW92ZSgnbW92ZScsIHRoaXMubW92ZVRvU3VibWl0KTtcbiAgICAgIGVsc2UgdGhpcy5hY3R1YWxTZW5kTW92ZSgnZHJvcCcsIHRoaXMuZHJvcFRvU3VibWl0KTtcbiAgICAgIGxpLnNvdW5kLmNvbmZpcm1hdGlvbigpO1xuICAgIH0gZWxzZSB0aGlzLmp1bXAodGhpcy5wbHkpO1xuICAgIHRoaXMuY2FuY2VsTW92ZSgpO1xuICAgIGlmICh0b1N1Ym1pdCkgdGhpcy5zZXRMb2FkaW5nKHRydWUsIDMwMCk7XG4gIH07XG5cbiAgY2FuY2VsTW92ZSA9ICgpOiB2b2lkID0+IHtcbiAgICB0aGlzLm1vdmVUb1N1Ym1pdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRyb3BUb1N1Ym1pdCA9IHVuZGVmaW5lZDtcbiAgfTtcblxuICBwcml2YXRlIG9uQ2hhbmdlID0gKCkgPT4ge1xuICAgIGlmICh0aGlzLm9wdHMub25DaGFuZ2UpIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5vcHRzLm9uQ2hhbmdlKHRoaXMuZGF0YSksIDE1MCk7XG4gIH07XG5cbiAgcHJpdmF0ZSBnb25lVGljaztcbiAgc2V0R29uZSA9IChnb25lOiBudW1iZXIgfCBib29sZWFuKSA9PiB7XG4gICAgZ2FtZS5zZXRHb25lKHRoaXMuZGF0YSwgdGhpcy5kYXRhLm9wcG9uZW50LmNvbG9yLCBnb25lKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5nb25lVGljayk7XG4gICAgaWYgKE51bWJlcihnb25lKSA+IDEpXG4gICAgICB0aGlzLmdvbmVUaWNrID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGcgPSBOdW1iZXIodGhpcy5vcHBvbmVudEdvbmUoKSk7XG4gICAgICAgIGlmIChnID4gMSkgdGhpcy5zZXRHb25lKGcgLSAxKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIHRoaXMucmVkcmF3KCk7XG4gIH1cblxuICBvcHBvbmVudEdvbmUgPSAoKTogbnVtYmVyIHwgYm9vbGVhbiA9PiB7XG4gICAgY29uc3QgZCA9IHRoaXMuZGF0YTtcbiAgICByZXR1cm4gZC5vcHBvbmVudC5nb25lICE9PSBmYWxzZSAmJlxuICAgICAgIWdhbWUuaXNQbGF5ZXJUdXJuKGQpICYmXG4gICAgICBnYW1lLnJlc2lnbmFibGUoZCkgJiZcbiAgICAgIGQub3Bwb25lbnQuZ29uZTtcbiAgfVxuXG4gIGNhbk9mZmVyRHJhdyA9ICgpOiBib29sZWFuID0+XG4gICAgZ2FtZS5kcmF3YWJsZSh0aGlzLmRhdGEpICYmICh0aGlzLmxhc3REcmF3T2ZmZXJBdFBseSB8fCAtOTkpIDwgKHRoaXMucGx5IC0gMjApO1xuXG4gIG9mZmVyRHJhdyA9ICh2OiBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuY2FuT2ZmZXJEcmF3KCkpIHtcbiAgICAgIGlmICh0aGlzLmRyYXdDb25maXJtKSB7XG4gICAgICAgIGlmICh2KSB0aGlzLmRvT2ZmZXJEcmF3KCk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmRyYXdDb25maXJtKTtcbiAgICAgICAgdGhpcy5kcmF3Q29uZmlybSA9IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAodikge1xuICAgICAgICBpZiAodGhpcy5kYXRhLnByZWYuY29uZmlybVJlc2lnbikgdGhpcy5kcmF3Q29uZmlybSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMub2ZmZXJEcmF3KGZhbHNlKTtcbiAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgIGVsc2UgdGhpcy5kb09mZmVyRHJhdygpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlZHJhdygpO1xuICB9O1xuXG4gIHByaXZhdGUgZG9PZmZlckRyYXcgPSAoKSA9PiB7XG4gICAgdGhpcy5sYXN0RHJhd09mZmVyQXRQbHkgPSB0aGlzLnBseTtcbiAgICB0aGlzLnNvY2tldC5zZW5kTG9hZGluZygnZHJhdy15ZXMnLCBudWxsKVxuICB9O1xuXG4gIHNldENoZXNzZ3JvdW5kID0gKGNnOiBDZ0FwaSkgPT4ge1xuICAgIHRoaXMuY2hlc3Nncm91bmQgPSBjZztcbiAgICBpZiAodGhpcy5kYXRhLnByZWYua2V5Ym9hcmRNb3ZlKSB7XG4gICAgICB0aGlzLmtleWJvYXJkTW92ZSA9IG1ha2VLZXlib2FyZE1vdmUodGhpcywgdGhpcy5zdGVwQXQodGhpcy5wbHkpLCB0aGlzLnJlZHJhdyk7XG4gICAgICBsaS5yYWYodGhpcy5yZWRyYXcpO1xuICAgIH1cbiAgfTtcblxuICBzdGVwQXQgPSAocGx5OiBQbHkpID0+IHJvdW5kLnBseVN0ZXAodGhpcy5kYXRhLCBwbHkpO1xuXG4gIHByaXZhdGUgZGVsYXllZEluaXQgPSAoKSA9PiB7XG4gICAgY29uc3QgZCA9IHRoaXMuZGF0YTtcbiAgICBpZiAodGhpcy5pc1BsYXlpbmcoKSAmJiBnYW1lLm5iTW92ZXMoZCwgZC5wbGF5ZXIuY29sb3IpID09PSAwICYmICF0aGlzLmlzU2ltdWxIb3N0KCkpIHtcbiAgICAgIGxpLnNvdW5kLmdlbmVyaWNOb3RpZnkoKTtcbiAgICB9XG4gICAgbGkucmVxdWVzdElkbGVDYWxsYmFjaygoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1BsYXlpbmcoKSkge1xuICAgICAgICBpZiAoIWQuc2ltdWwpIGJsdXIuaW5pdChkLnN0ZXBzLmxlbmd0aCA+IDIpO1xuXG4gICAgICAgIHRpdGxlLmluaXQoKTtcbiAgICAgICAgdGhpcy5zZXRUaXRsZSgpO1xuXG4gICAgICAgIGlmIChkLmNyYXp5aG91c2UpIGNyYXp5SW5pdCh0aGlzKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgZSA9PiB7XG4gICAgICAgICAgaWYgKGxpLmhhc1RvUmVsb2FkIHx8XG4gICAgICAgICAgICB0aGlzLm52dWkgfHxcbiAgICAgICAgICAgICFnYW1lLnBsYXlhYmxlKGQpIHx8XG4gICAgICAgICAgICAhZC5jbG9jayB8fFxuICAgICAgICAgICAgZC5vcHBvbmVudC5haSB8fFxuICAgICAgICAgICAgdGhpcy5pc1NpbXVsSG9zdCgpKSByZXR1cm47XG4gICAgICAgICAgdGhpcy5zb2NrZXQuc2VuZCgnYnllMicpO1xuICAgICAgICAgIGNvbnN0IG1zZyA9ICdUaGVyZSBpcyBhIGdhbWUgaW4gcHJvZ3Jlc3MhJztcbiAgICAgICAgICAoZSB8fCB3aW5kb3cuZXZlbnQpLnJldHVyblZhbHVlID0gbXNnO1xuICAgICAgICAgIHJldHVybiBtc2c7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghdGhpcy5udnVpICYmIGQucHJlZi5zdWJtaXRNb3ZlKSB7XG4gICAgICAgICAgd2luZG93Lk1vdXNldHJhcC5iaW5kKCdlc2MnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN1Ym1pdE1vdmUoZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5jaGVzc2dyb3VuZC5jYW5jZWxNb3ZlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgd2luZG93Lk1vdXNldHJhcC5iaW5kKCdyZXR1cm4nLCAoKSA9PiB0aGlzLnN1Ym1pdE1vdmUodHJ1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGNldmFsU3ViLnN1YnNjcmliZSh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLm52dWkpIGtleWJvYXJkLmluaXQodGhpcyk7XG5cbiAgICAgIHNwZWVjaC5zZXR1cCh0aGlzKTtcblxuICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH0pO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgQ2hlc3Nncm91bmQgfSBmcm9tICdjaGVzc2dyb3VuZCc7XG5pbXBvcnQgKiBhcyBjZyBmcm9tICdjaGVzc2dyb3VuZC90eXBlcyc7XG5pbXBvcnQgeyBBcGkgYXMgQ2dBcGkgfSBmcm9tICdjaGVzc2dyb3VuZC9hcGknO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnY2hlc3Nncm91bmQvY29uZmlnJ1xuaW1wb3J0IHJlc2l6ZUhhbmRsZSBmcm9tICdjb21tb24vcmVzaXplJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IHBseVN0ZXAgfSBmcm9tICcuL3JvdW5kJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IFJvdW5kRGF0YSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ29uZmlnKGN0cmw6IFJvdW5kQ29udHJvbGxlcik6IENvbmZpZyB7XG4gIGNvbnN0IGRhdGEgPSBjdHJsLmRhdGEsIGhvb2tzID0gY3RybC5tYWtlQ2dIb29rcygpLFxuICAgIHN0ZXAgPSBwbHlTdGVwKGRhdGEsIGN0cmwucGx5KSxcbiAgICBwbGF5aW5nID0gY3RybC5pc1BsYXlpbmcoKTtcbiAgcmV0dXJuIHtcbiAgICBmZW46IHN0ZXAuZmVuLFxuICAgIG9yaWVudGF0aW9uOiBib2FyZE9yaWVudGF0aW9uKGRhdGEsIGN0cmwuZmxpcCksXG4gICAgdHVybkNvbG9yOiBzdGVwLnBseSAlIDIgPT09IDAgPyAnd2hpdGUnIDogJ2JsYWNrJyxcbiAgICBsYXN0TW92ZTogdXRpbC51Y2kybW92ZShzdGVwLnVjaSksXG4gICAgY2hlY2s6ICEhc3RlcC5jaGVjayxcbiAgICBjb29yZGluYXRlczogZGF0YS5wcmVmLmNvb3JkcyAhPT0gMCxcbiAgICBhZGRQaWVjZVpJbmRleDogY3RybC5kYXRhLnByZWYuaXMzZCxcbiAgICBhdXRvQ2FzdGxlOiBkYXRhLmdhbWUudmFyaWFudC5rZXkgPT09ICdzdGFuZGFyZCcsXG4gICAgaGlnaGxpZ2h0OiB7XG4gICAgICBsYXN0TW92ZTogZGF0YS5wcmVmLmhpZ2hsaWdodCxcbiAgICAgIGNoZWNrOiBkYXRhLnByZWYuaGlnaGxpZ2h0XG4gICAgfSxcbiAgICBldmVudHM6IHtcbiAgICAgIG1vdmU6IGhvb2tzLm9uTW92ZSxcbiAgICAgIGRyb3BOZXdQaWVjZTogaG9va3Mub25OZXdQaWVjZSxcbiAgICAgIGluc2VydChlbGVtZW50cykge1xuICAgICAgICByZXNpemVIYW5kbGUoZWxlbWVudHMsIGN0cmwuZGF0YS5wcmVmLnJlc2l6ZUhhbmRsZSwgY3RybC5wbHkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbW92YWJsZToge1xuICAgICAgZnJlZTogZmFsc2UsXG4gICAgICBjb2xvcjogcGxheWluZyA/IGRhdGEucGxheWVyLmNvbG9yIDogdW5kZWZpbmVkLFxuICAgICAgZGVzdHM6IHBsYXlpbmcgPyB1dGlsLnBhcnNlUG9zc2libGVNb3ZlcyhkYXRhLnBvc3NpYmxlTW92ZXMpIDoge30sXG4gICAgICBzaG93RGVzdHM6IGRhdGEucHJlZi5kZXN0aW5hdGlvbixcbiAgICAgIHJvb2tDYXN0bGU6IGRhdGEucHJlZi5yb29rQ2FzdGxlLFxuICAgICAgZXZlbnRzOiB7XG4gICAgICAgIGFmdGVyOiBob29rcy5vblVzZXJNb3ZlLFxuICAgICAgICBhZnRlck5ld1BpZWNlOiBob29rcy5vblVzZXJOZXdQaWVjZVxuICAgICAgfVxuICAgIH0sXG4gICAgYW5pbWF0aW9uOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZHVyYXRpb246IGRhdGEucHJlZi5hbmltYXRpb25EdXJhdGlvblxuICAgIH0sXG4gICAgcHJlbW92YWJsZToge1xuICAgICAgZW5hYmxlZDogZGF0YS5wcmVmLmVuYWJsZVByZW1vdmUsXG4gICAgICBzaG93RGVzdHM6IGRhdGEucHJlZi5kZXN0aW5hdGlvbixcbiAgICAgIGNhc3RsZTogZGF0YS5nYW1lLnZhcmlhbnQua2V5ICE9PSAnYW50aWNoZXNzJyxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICBzZXQ6IGhvb2tzLm9uUHJlbW92ZSxcbiAgICAgICAgdW5zZXQ6IGhvb2tzLm9uQ2FuY2VsUHJlbW92ZVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJlZHJvcHBhYmxlOiB7XG4gICAgICBlbmFibGVkOiBkYXRhLnByZWYuZW5hYmxlUHJlbW92ZSAmJiBkYXRhLmdhbWUudmFyaWFudC5rZXkgPT09ICdjcmF6eWhvdXNlJyxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICBzZXQ6IGhvb2tzLm9uUHJlZHJvcCxcbiAgICAgICAgdW5zZXQoKSB7IGhvb2tzLm9uUHJlZHJvcCh1bmRlZmluZWQpIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGRyYWdnYWJsZToge1xuICAgICAgZW5hYmxlZDogZGF0YS5wcmVmLm1vdmVFdmVudCA+IDAsXG4gICAgICBzaG93R2hvc3Q6IGRhdGEucHJlZi5oaWdobGlnaHRcbiAgICB9LFxuICAgIHNlbGVjdGFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IGRhdGEucHJlZi5tb3ZlRXZlbnQgIT09IDFcbiAgICB9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlXG4gICAgfSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IHRydWVcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbG9hZChjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgY3RybC5jaGVzc2dyb3VuZC5zZXQobWFrZUNvbmZpZyhjdHJsKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tb3RlKGdyb3VuZDogQ2dBcGksIGtleTogY2cuS2V5LCByb2xlOiBjZy5Sb2xlKSB7XG4gIGNvbnN0IHBpZWNlID0gZ3JvdW5kLnN0YXRlLnBpZWNlc1trZXldO1xuICBpZiAocGllY2UgJiYgcGllY2Uucm9sZSA9PT0gJ3Bhd24nKSB7XG4gICAgY29uc3QgcGllY2VzOiBjZy5QaWVjZXMgPSB7fTtcbiAgICBwaWVjZXNba2V5XSA9IHtcbiAgICAgIGNvbG9yOiBwaWVjZS5jb2xvcixcbiAgICAgIHJvbGUsXG4gICAgICBwcm9tb3RlZDogdHJ1ZVxuICAgIH07XG4gICAgZ3JvdW5kLnNldFBpZWNlcyhwaWVjZXMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBib2FyZE9yaWVudGF0aW9uKGRhdGE6IFJvdW5kRGF0YSwgZmxpcDogYm9vbGVhbik6IENvbG9yIHtcbiAgaWYgKGRhdGEuZ2FtZS52YXJpYW50LmtleSA9PT0gJ3JhY2luZ0tpbmdzJykgcmV0dXJuIGZsaXAgPyAnYmxhY2snOiAnd2hpdGUnO1xuICBlbHNlIHJldHVybiBmbGlwID8gZGF0YS5vcHBvbmVudC5jb2xvciA6IGRhdGEucGxheWVyLmNvbG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKGN0cmw6IFJvdW5kQ29udHJvbGxlcikge1xuICByZXR1cm4gaCgnZGl2LmNnLXdyYXAnLCB7XG4gICAgaG9vazogdXRpbC5vbkluc2VydChlbCA9PiBjdHJsLnNldENoZXNzZ3JvdW5kKENoZXNzZ3JvdW5kKGVsLCBtYWtlQ29uZmlnKGN0cmwpKSkpXG4gIH0pO1xufTtcbiIsImltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcblxuY29uc3QgcHJldmVudGluZyA9IChmOiAoKSA9PiB2b2lkKSA9PiAoZTogTW91c2VFdmVudCkgPT4ge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGYoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXYoY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIGN0cmwudXNlckp1bXAoY3RybC5wbHkgLSAxKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHQoY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIGN0cmwudXNlckp1bXAoY3RybC5wbHkgKyAxKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIGNvbnN0IGsgPSB3aW5kb3cuTW91c2V0cmFwO1xuICBrLmJpbmQoWydsZWZ0JywgJ2gnXSwgcHJldmVudGluZyhmdW5jdGlvbigpIHtcbiAgICBwcmV2KGN0cmwpO1xuICAgIGN0cmwucmVkcmF3KCk7XG4gIH0pKTtcbiAgay5iaW5kKFsncmlnaHQnLCAnbCddLCBwcmV2ZW50aW5nKGZ1bmN0aW9uKCkge1xuICAgIG5leHQoY3RybCk7XG4gICAgY3RybC5yZWRyYXcoKTtcbiAgfSkpO1xuICBrLmJpbmQoWyd1cCcsICdrJ10sIHByZXZlbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgY3RybC51c2VySnVtcCgwKTtcbiAgICBjdHJsLnJlZHJhdygpO1xuICB9KSk7XG4gIGsuYmluZChbJ2Rvd24nLCAnaiddLCBwcmV2ZW50aW5nKGZ1bmN0aW9uKCkge1xuICAgIGN0cmwudXNlckp1bXAoY3RybC5kYXRhLnN0ZXBzLmxlbmd0aCAtIDEpO1xuICAgIGN0cmwucmVkcmF3KCk7XG4gIH0pKTtcbiAgay5iaW5kKCdmJywgcHJldmVudGluZyhjdHJsLmZsaXBOb3cpKTtcbiAgay5iaW5kKCd6JywgcHJldmVudGluZygoKSA9PiB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnemVuJykpKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IHNhblRvUm9sZSB9IGZyb20gJ2NoZXNzJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnY2hlc3Nncm91bmQvdHlwZXMnO1xuaW1wb3J0IHsgU3RlcCwgUmVkcmF3IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IENsb2NrQ29udHJvbGxlciB9IGZyb20gJy4vY2xvY2svY2xvY2tDdHJsJztcbmltcG9ydCB7IHZhbGlkIGFzIGNyYXp5VmFsaWQgfSBmcm9tICcuL2NyYXp5L2NyYXp5Q3RybCc7XG5pbXBvcnQgeyBzZW5kUHJvbW90aW9uIH0gZnJvbSAnLi9wcm9tb3Rpb24nXG5pbXBvcnQgeyBvbkluc2VydCB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IHR5cGUgS2V5Ym9hcmRNb3ZlSGFuZGxlciA9IChmZW46IEZlbiwgZGVzdHM/OiBjZy5EZXN0cywgeW91ck1vdmU/OiBib29sZWFuKSA9PiB2b2lkO1xuXG5pbnRlcmZhY2UgU2FuTWFwIHtcbiAgW2tleTogc3RyaW5nXTogY2cuUm9sZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBLZXlib2FyZE1vdmUge1xuICBkcm9wKGtleTogY2cuS2V5LCBwaWVjZTogc3RyaW5nKTogdm9pZDtcbiAgcHJvbW90ZShvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgcGllY2U6IHN0cmluZyk6IHZvaWQ7XG4gIHVwZGF0ZShzdGVwOiBTdGVwLCB5b3VyTW92ZT86IGJvb2xlYW4pOiB2b2lkO1xuICByZWdpc3RlckhhbmRsZXIoaDogS2V5Ym9hcmRNb3ZlSGFuZGxlcik6IHZvaWQ7XG4gIGhhc0ZvY3VzKCk6IGJvb2xlYW47XG4gIHNldEZvY3VzKHY6IGJvb2xlYW4pOiB2b2lkO1xuICBzYW4ob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiB2b2lkO1xuICBzZWxlY3Qoa2V5OiBjZy5LZXkpOiB2b2lkO1xuICBoYXNTZWxlY3RlZCgpOiBjZy5LZXkgfCB1bmRlZmluZWQ7XG4gIGNvbmZpcm1Nb3ZlKCk6IHZvaWQ7XG4gIHVzZWRTYW46IGJvb2xlYW47XG4gIGp1bXAoZGVsdGE6IG51bWJlcik6IHZvaWQ7XG4gIGp1c3RTZWxlY3RlZCgpOiBib29sZWFuO1xuICBjbG9jaygpOiBDbG9ja0NvbnRyb2xsZXIgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdHJsKHJvb3Q6IFJvdW5kQ29udHJvbGxlciwgc3RlcDogU3RlcCwgcmVkcmF3OiBSZWRyYXcpOiBLZXlib2FyZE1vdmUge1xuICBsZXQgZm9jdXMgPSBmYWxzZTtcbiAgbGV0IGhhbmRsZXI6IEtleWJvYXJkTW92ZUhhbmRsZXIgfCB1bmRlZmluZWQ7XG4gIGxldCBwcmVIYW5kbGVyQnVmZmVyID0gc3RlcC5mZW47XG4gIGxldCBsYXN0U2VsZWN0ID0gRGF0ZS5ub3coKTtcbiAgY29uc3QgY2dTdGF0ZSA9IHJvb3QuY2hlc3Nncm91bmQuc3RhdGU7XG4gIGNvbnN0IHNhbk1hcCA9IHNhblRvUm9sZSBhcyBTYW5NYXA7XG4gIGNvbnN0IHNlbGVjdCA9IGZ1bmN0aW9uKGtleTogY2cuS2V5KTogdm9pZCB7XG4gICAgaWYgKGNnU3RhdGUuc2VsZWN0ZWQgPT09IGtleSkgcm9vdC5jaGVzc2dyb3VuZC5jYW5jZWxNb3ZlKCk7XG4gICAgZWxzZSB7XG4gICAgICByb290LmNoZXNzZ3JvdW5kLnNlbGVjdFNxdWFyZShrZXksIHRydWUpO1xuICAgICAgbGFzdFNlbGVjdCA9IERhdGUubm93KCk7XG4gICAgfVxuICB9O1xuICBsZXQgdXNlZFNhbiA9IGZhbHNlO1xuICByZXR1cm4ge1xuICAgIGRyb3Aoa2V5LCBwaWVjZSkge1xuICAgICAgY29uc3Qgcm9sZSA9IHNhbk1hcFtwaWVjZV07XG4gICAgICBjb25zdCBjcmF6eURhdGEgPSByb290LmRhdGEuY3Jhenlob3VzZTtcbiAgICAgIGNvbnN0IGNvbG9yID0gcm9vdC5kYXRhLnBsYXllci5jb2xvcjtcbiAgICAgIC8vIFNxdWFyZSBvY2N1cGllZFxuICAgICAgaWYgKCFyb2xlIHx8ICFjcmF6eURhdGEgfHwgY2dTdGF0ZS5waWVjZXNba2V5XSkgcmV0dXJuO1xuICAgICAgLy8gUGllY2Ugbm90IGluIFBvY2tldFxuICAgICAgaWYgKCFjcmF6eURhdGEucG9ja2V0c1tjb2xvciA9PT0gJ3doaXRlJyA/IDAgOiAxXVtyb2xlXSkgcmV0dXJuO1xuICAgICAgaWYgKCFjcmF6eVZhbGlkKHJvb3QuZGF0YSwgcm9sZSwga2V5KSkgcmV0dXJuO1xuICAgICAgcm9vdC5jaGVzc2dyb3VuZC5jYW5jZWxNb3ZlKCk7XG4gICAgICByb290LmNoZXNzZ3JvdW5kLm5ld1BpZWNlKHsgcm9sZSwgY29sb3IgfSwga2V5KTtcbiAgICAgIHJvb3Quc2VuZE5ld1BpZWNlKHJvbGUsIGtleSwgZmFsc2UpO1xuICAgIH0sXG4gICAgcHJvbW90ZShvcmlnLCBkZXN0LCBwaWVjZSkge1xuICAgICAgY29uc3Qgcm9sZSA9IHNhbk1hcFtwaWVjZV07XG4gICAgICBpZiAoIXJvbGUgfHwgcm9sZSA9PSAncGF3bicpIHJldHVybjtcbiAgICAgIHJvb3QuY2hlc3Nncm91bmQuY2FuY2VsTW92ZSgpO1xuICAgICAgc2VuZFByb21vdGlvbihyb290LCBvcmlnLCBkZXN0LCByb2xlLCB7cHJlbW92ZTogZmFsc2V9KTtcbiAgICB9LFxuICAgIHVwZGF0ZShzdGVwLCB5b3VyTW92ZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICBpZiAoaGFuZGxlcikgaGFuZGxlcihzdGVwLmZlbiwgY2dTdGF0ZS5tb3ZhYmxlLmRlc3RzLCB5b3VyTW92ZSk7XG4gICAgICBlbHNlIHByZUhhbmRsZXJCdWZmZXIgPSBzdGVwLmZlbjtcbiAgICB9LFxuICAgIHJlZ2lzdGVySGFuZGxlcihoOiBLZXlib2FyZE1vdmVIYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyID0gaDtcbiAgICAgIGlmIChwcmVIYW5kbGVyQnVmZmVyKSBoYW5kbGVyKHByZUhhbmRsZXJCdWZmZXIsIGNnU3RhdGUubW92YWJsZS5kZXN0cyk7XG4gICAgfSxcbiAgICBoYXNGb2N1czogKCkgPT4gZm9jdXMsXG4gICAgc2V0Rm9jdXModikge1xuICAgICAgZm9jdXMgPSB2O1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSxcbiAgICBzYW4ob3JpZywgZGVzdCkge1xuICAgICAgdXNlZFNhbiA9IHRydWU7XG4gICAgICByb290LmNoZXNzZ3JvdW5kLmNhbmNlbE1vdmUoKTtcbiAgICAgIHNlbGVjdChvcmlnKTtcbiAgICAgIHNlbGVjdChkZXN0KTtcbiAgICB9LFxuICAgIHNlbGVjdCxcbiAgICBoYXNTZWxlY3RlZDogKCkgPT4gY2dTdGF0ZS5zZWxlY3RlZCxcbiAgICBjb25maXJtTW92ZSgpIHtcbiAgICAgIHJvb3Quc3VibWl0TW92ZSh0cnVlKTtcbiAgICB9LFxuICAgIHVzZWRTYW4sXG4gICAganVtcChkZWx0YTogbnVtYmVyKSB7XG4gICAgICByb290LnVzZXJKdW1wKHJvb3QucGx5ICsgZGVsdGEpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSxcbiAgICBqdXN0U2VsZWN0ZWQoKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxhc3RTZWxlY3QgPCA1MDA7XG4gICAgfSxcbiAgICBjbG9jazogKCkgPT4gcm9vdC5jbG9ja1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKGN0cmw6IEtleWJvYXJkTW92ZSkge1xuICByZXR1cm4gaCgnZGl2LmtleWJvYXJkLW1vdmUnLCBbXG4gICAgaCgnaW5wdXQnLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICBzcGVsbGNoZWNrOiBmYWxzZSxcbiAgICAgICAgYXV0b2NvbXBsZXRlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGhvb2s6IG9uSW5zZXJ0KGVsID0+IHtcbiAgICAgICAgd2luZG93LmxpY2hlc3MubG9hZFNjcmlwdCgnY29tcGlsZWQvbGljaGVzcy5yb3VuZC5rZXlib2FyZE1vdmUubWluLmpzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgY3RybC5yZWdpc3RlckhhbmRsZXIod2luZG93LmxpY2hlc3Mua2V5Ym9hcmRNb3ZlKHtcbiAgICAgICAgICAgIGlucHV0OiBlbCxcbiAgICAgICAgICAgIGN0cmxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9KSxcbiAgICBjdHJsLmhhc0ZvY3VzKCkgP1xuICAgIGgoJ2VtJywgJ0VudGVyIFNBTiAoTmMzKSBvciBVQ0kgKGIxYzMpIG1vdmVzLCBvciB0eXBlIC8gdG8gZm9jdXMgY2hhdCcpIDpcbiAgICBoKCdzdHJvbmcnLCAnUHJlc3MgPGVudGVyPiB0byBmb2N1cycpXG4gIF0pO1xufVxuIiwiaW1wb3J0IHsgQ2hlc3Nncm91bmQgfSBmcm9tICdjaGVzc2dyb3VuZCc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCBrbGFzcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJztcbmltcG9ydCBhdHRyaWJ1dGVzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcyc7XG5cbmltcG9ydCB7IFJvdW5kT3B0cyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgUm91bmRDb250cm9sbGVyIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgTW92ZU9uIGZyb20gJy4vbW92ZU9uJztcbmltcG9ydCB7IG1haW4gYXMgdmlldyB9IGZyb20gJy4vdmlldy9tYWluJztcbmltcG9ydCAqIGFzIGNoYXQgZnJvbSAnY2hhdCc7XG5pbXBvcnQgYm9vdCBmcm9tICcuL2Jvb3QnO1xuaW1wb3J0IHsgbWVudUhvdmVyIH0gZnJvbSAnY29tbW9uL21lbnVIb3Zlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm91bmRBcGkge1xuICBzb2NrZXRSZWNlaXZlKHR5cDogc3RyaW5nLCBkYXRhOiBhbnkpOiBib29sZWFuO1xuICBtb3ZlT246IE1vdmVPbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSb3VuZE1haW4ge1xuICBhcHA6IChvcHRzOiBSb3VuZE9wdHMpID0+IFJvdW5kQXBpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwKG9wdHM6IFJvdW5kT3B0cyk6IFJvdW5kQXBpIHtcblxuICBjb25zdCBwYXRjaCA9IGluaXQoW2tsYXNzLCBhdHRyaWJ1dGVzXSk7XG5cbiAgbGV0IHZub2RlOiBWTm9kZSwgY3RybDogUm91bmRDb250cm9sbGVyO1xuXG4gIGZ1bmN0aW9uIHJlZHJhdygpIHtcbiAgICB2bm9kZSA9IHBhdGNoKHZub2RlLCB2aWV3KGN0cmwpKTtcbiAgfVxuXG4gIGN0cmwgPSBuZXcgUm91bmRDb250cm9sbGVyKG9wdHMsIHJlZHJhdyk7XG5cbiAgY29uc3QgYmx1ZXByaW50ID0gdmlldyhjdHJsKTtcbiAgb3B0cy5lbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICB2bm9kZSA9IHBhdGNoKG9wdHMuZWxlbWVudCwgYmx1ZXByaW50KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVkcmF3KTsgLy8gY29sMSAvIGNvbDIrIHRyYW5zaXRpb25cblxuICBjdHJsLmlzUGxheWluZygpICYmIG1lbnVIb3ZlcigpO1xuXG4gIHJldHVybiB7XG4gICAgc29ja2V0UmVjZWl2ZTogY3RybC5zb2NrZXQucmVjZWl2ZSxcbiAgICBtb3ZlT246IGN0cmwubW92ZU9uXG4gIH07XG59O1xuXG5leHBvcnQgeyBib290IH07XG5cbndpbmRvdy5MaWNoZXNzQ2hhdCA9IGNoYXQ7XG4vLyB0aGF0J3MgZm9yIHRoZSByZXN0IG9mIGxpY2hlc3MgdG8gYWNjZXNzIGNoZXNzZ3JvdW5kXG4vLyB3aXRob3V0IGhhdmluZyB0byBpbmNsdWRlIGl0IGEgc2Vjb25kIHRpbWVcbndpbmRvdy5DaGVzc2dyb3VuZCA9IENoZXNzZ3JvdW5kO1xuIiwiaW1wb3J0ICogYXMgZ2FtZSBmcm9tICdnYW1lJztcbmltcG9ydCAqIGFzIHhociBmcm9tICcuL3hocic7XG5pbXBvcnQgUm91bmRDb250cm9sbGVyIGZyb20gJy4vY3RybCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmVPbiB7XG5cbiAgcHJpdmF0ZSBzdG9yYWdlID0gd2luZG93LmxpY2hlc3Muc3RvcmFnZS5tYWtlQm9vbGVhbih0aGlzLmtleSk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjdHJsOiBSb3VuZENvbnRyb2xsZXIsIHByaXZhdGUga2V5OiBzdHJpbmcpIHsgfVxuXG4gIHRvZ2dsZSA9ICgpID0+IHtcbiAgICB0aGlzLnN0b3JhZ2UudG9nZ2xlKCk7XG4gICAgdGhpcy5uZXh0KHRydWUpO1xuICB9O1xuXG4gIGdldCA9IHRoaXMuc3RvcmFnZS5nZXQ7XG5cbiAgcHJpdmF0ZSByZWRpcmVjdCA9IChocmVmOiBzdHJpbmcpID0+IHtcbiAgICB0aGlzLmN0cmwuc2V0UmVkaXJlY3RpbmcoKTtcbiAgICB3aW5kb3cubGljaGVzcy5oYXNUb1JlbG9hZCA9IHRydWU7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICB9O1xuXG4gIG5leHQgPSAoZm9yY2U/OiBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgY29uc3QgZCA9IHRoaXMuY3RybC5kYXRhO1xuICAgIGlmIChkLnBsYXllci5zcGVjdGF0b3IgfHwgIWdhbWUuaXNTd2l0Y2hhYmxlKGQpIHx8IGdhbWUuaXNQbGF5ZXJUdXJuKGQpIHx8ICF0aGlzLmdldCgpKSByZXR1cm47XG4gICAgaWYgKGZvcmNlKSB0aGlzLnJlZGlyZWN0KCcvcm91bmQtbmV4dC8nICsgZC5nYW1lLmlkKTtcbiAgICBlbHNlIGlmIChkLnNpbXVsKSB7XG4gICAgICBpZiAoZC5zaW11bC5ob3N0SWQgPT09IHRoaXMuY3RybC5vcHRzLnVzZXJJZCAmJiBkLnNpbXVsLm5iUGxheWluZyA+IDEpXG4gICAgICAgIHRoaXMucmVkaXJlY3QoJy9yb3VuZC1uZXh0LycgKyBkLmdhbWUuaWQpO1xuICAgIH0gZWxzZSB4aHIud2hhdHNOZXh0KHRoaXMuY3RybCkudGhlbihkYXRhID0+IHtcbiAgICAgIGlmIChkYXRhLm5leHQpIHRoaXMucmVkaXJlY3QoJy8nICsgZGF0YS5uZXh0KTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCAqIGFzIGdyb3VuZCBmcm9tICcuL2dyb3VuZCc7XG5pbXBvcnQgKiBhcyBjZyBmcm9tICdjaGVzc2dyb3VuZC90eXBlcyc7XG5pbXBvcnQgeyBEcmF3U2hhcGUgfSBmcm9tICdjaGVzc2dyb3VuZC9kcmF3JztcbmltcG9ydCAqIGFzIHhociBmcm9tICcuL3hocic7XG5pbXBvcnQgeyBrZXkycG9zIH0gZnJvbSAnY2hlc3Nncm91bmQvdXRpbCc7XG5pbXBvcnQgeyBiaW5kIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IG9uSW5zZXJ0IH0gZnJvbSAnLi91dGlsJztcblxuaW50ZXJmYWNlIFByb21vdGluZyB7XG4gIG1vdmU6IFtjZy5LZXksIGNnLktleV07XG4gIHByZTogYm9vbGVhbjtcbiAgbWV0YTogY2cuTW92ZU1ldGFkYXRhXG59XG5cbmxldCBwcm9tb3Rpbmc6IFByb21vdGluZyB8IHVuZGVmaW5lZDtcbmxldCBwcmVQcm9tb3Rpb25Sb2xlOiBjZy5Sb2xlIHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VuZFByb21vdGlvbihjdHJsOiBSb3VuZENvbnRyb2xsZXIsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCByb2xlOiBjZy5Sb2xlLCBtZXRhOiBjZy5Nb3ZlTWV0YWRhdGEpOiBib29sZWFuIHtcbiAgZ3JvdW5kLnByb21vdGUoY3RybC5jaGVzc2dyb3VuZCwgZGVzdCwgcm9sZSk7XG4gIGN0cmwuc2VuZE1vdmUob3JpZywgZGVzdCwgcm9sZSwgbWV0YSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoY3RybDogUm91bmRDb250cm9sbGVyLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YTogY2cuTW92ZU1ldGFkYXRhID0ge30gYXMgY2cuTW92ZU1ldGFkYXRhKTogYm9vbGVhbiB7XG4gIGNvbnN0IGQgPSBjdHJsLmRhdGEsXG4gICAgcGllY2UgPSBjdHJsLmNoZXNzZ3JvdW5kLnN0YXRlLnBpZWNlc1tkZXN0XSxcbiAgICBwcmVtb3ZlUGllY2UgPSBjdHJsLmNoZXNzZ3JvdW5kLnN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgaWYgKCgocGllY2UgJiYgcGllY2Uucm9sZSA9PT0gJ3Bhd24nICYmICFwcmVtb3ZlUGllY2UpIHx8IChwcmVtb3ZlUGllY2UgJiYgcHJlbW92ZVBpZWNlLnJvbGUgPT09ICdwYXduJykpICYmIChcbiAgICAoZGVzdFsxXSA9PT0gJzgnICYmIGQucGxheWVyLmNvbG9yID09PSAnd2hpdGUnKSB8fFxuICAgIChkZXN0WzFdID09PSAnMScgJiYgZC5wbGF5ZXIuY29sb3IgPT09ICdibGFjaycpKSkge1xuICAgIGlmIChwcmVQcm9tb3Rpb25Sb2xlICYmIG1ldGEgJiYgbWV0YS5wcmVtb3ZlKSByZXR1cm4gc2VuZFByb21vdGlvbihjdHJsLCBvcmlnLCBkZXN0LCBwcmVQcm9tb3Rpb25Sb2xlLCBtZXRhKTtcbiAgICBpZiAoIW1ldGEuY3RybEtleSAmJiAhcHJvbW90aW5nICYmIChcbiAgICAgIGQucHJlZi5hdXRvUXVlZW4gPT09IDMgfHxcbiAgICAgIChkLnByZWYuYXV0b1F1ZWVuID09PSAyICYmIHByZW1vdmVQaWVjZSkgfHxcbiAgICAgIChjdHJsLmtleWJvYXJkTW92ZSAmJiBjdHJsLmtleWJvYXJkTW92ZS5qdXN0U2VsZWN0ZWQoKSkpKSB7XG4gICAgICBpZiAocHJlbW92ZVBpZWNlKSBzZXRQcmVQcm9tb3Rpb24oY3RybCwgZGVzdCwgJ3F1ZWVuJyk7XG4gICAgICBlbHNlIHNlbmRQcm9tb3Rpb24oY3RybCwgb3JpZywgZGVzdCwgJ3F1ZWVuJywgbWV0YSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcHJvbW90aW5nID0ge1xuICAgICAgbW92ZTogW29yaWcsIGRlc3RdLFxuICAgICAgcHJlOiAhIXByZW1vdmVQaWVjZSxcbiAgICAgIG1ldGFcbiAgICB9O1xuICAgIGN0cmwucmVkcmF3KCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzZXRQcmVQcm9tb3Rpb24oY3RybDogUm91bmRDb250cm9sbGVyLCBkZXN0OiBjZy5LZXksIHJvbGU6IGNnLlJvbGUpOiB2b2lkIHtcbiAgcHJlUHJvbW90aW9uUm9sZSA9IHJvbGU7XG4gIGN0cmwuY2hlc3Nncm91bmQuc2V0QXV0b1NoYXBlcyhbe1xuICAgIG9yaWc6IGRlc3QsXG4gICAgcGllY2U6IHtcbiAgICAgIGNvbG9yOiBjdHJsLmRhdGEucGxheWVyLmNvbG9yLFxuICAgICAgcm9sZSxcbiAgICAgIG9wYWNpdHk6IDAuOFxuICAgIH0sXG4gICAgYnJ1c2g6ICcnXG4gIH0gYXMgRHJhd1NoYXBlXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxQcmVQcm9tb3Rpb24oY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIGlmIChwcmVQcm9tb3Rpb25Sb2xlKSB7XG4gICAgY3RybC5jaGVzc2dyb3VuZC5zZXRBdXRvU2hhcGVzKFtdKTtcbiAgICBwcmVQcm9tb3Rpb25Sb2xlID0gdW5kZWZpbmVkO1xuICAgIGN0cmwucmVkcmF3KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluaXNoKGN0cmw6IFJvdW5kQ29udHJvbGxlciwgcm9sZTogY2cuUm9sZSkge1xuICBpZiAocHJvbW90aW5nKSB7XG4gICAgY29uc3QgaW5mbyA9IHByb21vdGluZztcbiAgICBwcm9tb3RpbmcgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGluZm8ucHJlKSBzZXRQcmVQcm9tb3Rpb24oY3RybCwgaW5mby5tb3ZlWzFdLCByb2xlKTtcbiAgICBlbHNlIHNlbmRQcm9tb3Rpb24oY3RybCwgaW5mby5tb3ZlWzBdLCBpbmZvLm1vdmVbMV0sIHJvbGUsIGluZm8ubWV0YSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgY2FuY2VsUHJlUHJvbW90aW9uKGN0cmwpO1xuICBjdHJsLmNoZXNzZ3JvdW5kLmNhbmNlbFByZW1vdmUoKTtcbiAgaWYgKHByb21vdGluZykgeGhyLnJlbG9hZChjdHJsKS50aGVuKGN0cmwucmVsb2FkKTtcbiAgcHJvbW90aW5nID0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9tb3Rpb24oY3RybDogUm91bmRDb250cm9sbGVyLCBkZXN0OiBjZy5LZXksIHJvbGVzOiBjZy5Sb2xlW10sIGNvbG9yOiBDb2xvciwgb3JpZW50YXRpb246IENvbG9yKSB7XG4gIHZhciBsZWZ0ID0gKDggLSBrZXkycG9zKGRlc3QpWzBdKSAqIDEyLjU7XG4gIGlmIChvcmllbnRhdGlvbiA9PT0gJ3doaXRlJykgbGVmdCA9IDg3LjUgLSBsZWZ0O1xuICB2YXIgdmVydGljYWwgPSBjb2xvciA9PT0gb3JpZW50YXRpb24gPyAndG9wJyA6ICdib3R0b20nO1xuXG4gIHJldHVybiBoKCdkaXYjcHJvbW90aW9uLWNob2ljZS4nICsgdmVydGljYWwsIHtcbiAgICBob29rOiBvbkluc2VydChlbCA9PiB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGNhbmNlbChjdHJsKSk7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH0pXG4gIH0sIHJvbGVzLm1hcCgoc2VydmVyUm9sZSwgaSkgPT4ge1xuICAgIHZhciB0b3AgPSAoY29sb3IgPT09IG9yaWVudGF0aW9uID8gaSA6IDcgLSBpKSAqIDEyLjU7XG4gICAgcmV0dXJuIGgoJ3NxdWFyZScsIHtcbiAgICAgIGF0dHJzOiB7c3R5bGU6ICd0b3A6ICcgKyB0b3AgKyAnJTtsZWZ0OiAnICsgbGVmdCArICclJ30sXG4gICAgICBob29rOiBiaW5kKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBmaW5pc2goY3RybCwgc2VydmVyUm9sZSk7XG4gICAgICB9KVxuICAgIH0sIFtcbiAgICAgIGgoJ3BpZWNlLicgKyBzZXJ2ZXJSb2xlICsgJy4nICsgY29sb3IpXG4gICAgXSk7XG4gIH0pKTtcbn07XG5cbmNvbnN0IHJvbGVzOiBjZy5Sb2xlW10gPSBbJ3F1ZWVuJywgJ2tuaWdodCcsICdyb29rJywgJ2Jpc2hvcCddO1xuXG5leHBvcnQgZnVuY3Rpb24gdmlldyhjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgaWYgKCFwcm9tb3RpbmcpIHJldHVybjtcblxuICByZXR1cm4gcmVuZGVyUHJvbW90aW9uKGN0cmwsIHByb21vdGluZy5tb3ZlWzFdLFxuICAgIGN0cmwuZGF0YS5nYW1lLnZhcmlhbnQua2V5ID09PSAnYW50aWNoZXNzJyA/IHJvbGVzLmNvbmNhdCgna2luZycpIDogcm9sZXMsXG4gICAgY3RybC5kYXRhLnBsYXllci5jb2xvcixcbiAgICBjdHJsLmNoZXNzZ3JvdW5kLnN0YXRlLm9yaWVudGF0aW9uKTtcbn07XG4iLCJpbXBvcnQgeyBSb3VuZERhdGEsIFN0ZXAgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZmlyc3RQbHkoZDogUm91bmREYXRhKTogbnVtYmVyIHtcbiAgcmV0dXJuIGQuc3RlcHNbMF0ucGx5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdFBseShkOiBSb3VuZERhdGEpOiBudW1iZXIge1xuICByZXR1cm4gbGFzdFN0ZXAoZCkucGx5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdFN0ZXAoZDogUm91bmREYXRhKTogU3RlcCB7XG4gIHJldHVybiBkLnN0ZXBzW2Quc3RlcHMubGVuZ3RoIC0gMV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbHlTdGVwKGQ6IFJvdW5kRGF0YSwgcGx5OiBudW1iZXIpOiBTdGVwIHtcbiAgcmV0dXJuIGQuc3RlcHNbcGx5IC0gZmlyc3RQbHkoZCldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFzc2FnZShkOiBSb3VuZERhdGEpOiB2b2lkIHtcblxuICBpZiAoZC5jbG9jaykge1xuICAgIGQuY2xvY2suc2hvd1RlbnRocyA9IGQucHJlZi5jbG9ja1RlbnRocztcbiAgICBkLmNsb2NrLnNob3dCYXIgPSBkLnByZWYuY2xvY2tCYXI7XG4gIH1cblxuICBpZiAoZC5jb3JyZXNwb25kZW5jZSkgZC5jb3JyZXNwb25kZW5jZS5zaG93QmFyID0gZC5wcmVmLmNsb2NrQmFyO1xuXG4gIGlmIChbJ2hvcmRlJywgJ2NyYXp5aG91c2UnXS5pbmNsdWRlcyhkLmdhbWUudmFyaWFudC5rZXkpKSBkLnByZWYuc2hvd0NhcHR1cmVkID0gZmFsc2U7XG5cbiAgaWYgKGQuZXhwaXJhdGlvbikgZC5leHBpcmF0aW9uLm1vdmVkQXQgPSBEYXRlLm5vdygpIC0gZC5leHBpcmF0aW9uLmlkbGVNaWxsaXM7XG59O1xuIiwiaW1wb3J0ICogYXMgZ2FtZSBmcm9tICdnYW1lJztcbmltcG9ydCB0aHJvdHRsZSBmcm9tICdjb21tb24vdGhyb3R0bGUnO1xuaW1wb3J0IG5vdGlmeSBmcm9tICdjb21tb24vbm90aWZpY2F0aW9uJztcbmltcG9ydCB7IGlzUGxheWVyVHVybiB9IGZyb20gJ2dhbWUnO1xuaW1wb3J0ICogYXMgeGhyIGZyb20gJy4veGhyJztcbmltcG9ydCAqIGFzIHNvdW5kIGZyb20gJy4vc291bmQnO1xuaW1wb3J0IFJvdW5kQ29udHJvbGxlciBmcm9tICcuL2N0cmwnO1xuaW1wb3J0IHsgVW50eXBlZCwgQXBpRW5kIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuY29uc3QgbGkgPSB3aW5kb3cubGljaGVzcztcblxuZXhwb3J0IGludGVyZmFjZSBSb3VuZFNvY2tldCBleHRlbmRzIFVudHlwZWQge1xuICBzZW5kOiBTb2NrZXRTZW5kO1xuICBoYW5kbGVyczogVW50eXBlZDtcbiAgbW9yZVRpbWUoKTogdm9pZDtcbiAgb3V0b2Z0aW1lKCk6IHZvaWQ7XG4gIGJlcnNlcmsoKTogdm9pZDtcbiAgc2VuZExvYWRpbmcodHlwOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkXG4gICAgcmVjZWl2ZSh0eXA6IHN0cmluZywgZGF0YTogYW55KTogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEluY29taW5nIHtcbiAgdDogc3RyaW5nO1xuICBkOiBhbnk7XG59XG5cbmludGVyZmFjZSBIYW5kbGVycyB7XG4gIFtrZXk6IHN0cmluZ106IChkYXRhOiBhbnkpID0+IHZvaWQ7XG59XG5cbmZ1bmN0aW9uIGJhY2tvZmYoZGVsYXk6IG51bWJlciwgZmFjdG9yOiBudW1iZXIsIGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiAoLi4uYXJnczphbnlbXSkgPT4gdm9pZCB7XG4gIGxldCB0aW1lcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICBsZXQgbGFzdEV4ZWMgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbih0aGlzOiBhbnksIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZjogYW55ID0gdGhpcztcbiAgICBjb25zdCBlbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBsYXN0RXhlYztcblxuICAgIGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICB0aW1lciA9IHVuZGVmaW5lZDtcbiAgICAgIGxhc3RFeGVjID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBkZWxheSAqPSBmYWN0b3I7XG4gICAgICBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9XG5cbiAgICBpZiAodGltZXIpIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgICBpZiAoZWxhcHNlZCA+IGRlbGF5KSBleGVjKCk7XG4gICAgZWxzZSB0aW1lciA9IHNldFRpbWVvdXQoZXhlYywgZGVsYXkgLSBlbGFwc2VkKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZShzZW5kOiBTb2NrZXRTZW5kLCBjdHJsOiBSb3VuZENvbnRyb2xsZXIpOiBSb3VuZFNvY2tldCB7XG5cbiAgZnVuY3Rpb24gcmVsb2FkKG86IEluY29taW5nLCBpc1JldHJ5PzogYm9vbGVhbikge1xuICAgIC8vIGF2b2lkIHJlbG9hZCBpZiBwb3NzaWJsZSFcbiAgICBpZiAobyAmJiBvLnQpIHtcbiAgICAgIGN0cmwuc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICBoYW5kbGVyc1tvLnRdKG8uZCk7XG4gICAgfVxuICAgIGVsc2UgeGhyLnJlbG9hZChjdHJsKS50aGVuKGRhdGEgPT4ge1xuICAgICAgaWYgKGxpLnNvY2tldC5nZXRWZXJzaW9uKCkgPiBkYXRhLnBsYXllci52ZXJzaW9uKSB7XG4gICAgICAgIC8vIHJhY2UgY29uZGl0aW9uISB0cnkgdG8gcmVsb2FkIGFnYWluXG4gICAgICAgIGlmIChpc1JldHJ5KSBsaS5yZWxvYWQoKTsgLy8gZ2l2ZSB1cCBhbmQgcmVsb2FkIHRoZSBwYWdlXG4gICAgICAgIGVsc2UgcmVsb2FkKG8sIHRydWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBjdHJsLnJlbG9hZChkYXRhKTtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBkID0gY3RybC5kYXRhO1xuXG4gIGNvbnN0IGhhbmRsZXJzOiBIYW5kbGVycyA9IHtcbiAgICB0YWtlYmFja09mZmVycyhvKSB7XG4gICAgICBjdHJsLnNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgZC5wbGF5ZXIucHJvcG9zaW5nVGFrZWJhY2sgPSBvW2QucGxheWVyLmNvbG9yXTtcbiAgICAgIGNvbnN0IGZyb21PcCA9IGQub3Bwb25lbnQucHJvcG9zaW5nVGFrZWJhY2sgPSBvW2Qub3Bwb25lbnQuY29sb3JdO1xuICAgICAgaWYgKGZyb21PcCkgbm90aWZ5KGN0cmwubm9hcmcoJ3lvdXJPcHBvbmVudFByb3Bvc2VzQVRha2ViYWNrJykpO1xuICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICB9LFxuICAgIG1vdmU6IGN0cmwuYXBpTW92ZSxcbiAgICBkcm9wOiBjdHJsLmFwaU1vdmUsXG4gICAgcmVsb2FkLFxuICAgIHJlZGlyZWN0OiBjdHJsLnNldFJlZGlyZWN0aW5nLFxuICAgIGNsb2NrSW5jKG8pIHtcbiAgICAgIGlmIChjdHJsLmNsb2NrKSB7XG4gICAgICAgIGN0cmwuY2xvY2suYWRkVGltZShvLmNvbG9yLCBvLnRpbWUpO1xuICAgICAgICBjdHJsLnJlZHJhdygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2Nsb2NrKG8pIHtcbiAgICAgIGlmIChjdHJsLmNvcnJlc0Nsb2NrKSB7XG4gICAgICAgIGQuY29ycmVzcG9uZGVuY2Uud2hpdGUgPSBvLndoaXRlO1xuICAgICAgICBkLmNvcnJlc3BvbmRlbmNlLmJsYWNrID0gby5ibGFjaztcbiAgICAgICAgY3RybC5jb3JyZXNDbG9jay51cGRhdGUoby53aGl0ZSwgby5ibGFjayk7XG4gICAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjcm93ZChvKSB7XG4gICAgICBnYW1lLnNldE9uR2FtZShkLCAnd2hpdGUnLCBvWyd3aGl0ZSddKTtcbiAgICAgIGdhbWUuc2V0T25HYW1lKGQsICdibGFjaycsIG9bJ2JsYWNrJ10pO1xuICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICB9LFxuICAgIGVuZERhdGEobzogQXBpRW5kKSB7XG4gICAgICBjdHJsLmVuZFdpdGhEYXRhKG8pO1xuICAgIH0sXG4gICAgcmVtYXRjaE9mZmVyKGJ5OiBDb2xvcikge1xuICAgICAgZC5wbGF5ZXIub2ZmZXJpbmdSZW1hdGNoID0gYnkgPT09IGQucGxheWVyLmNvbG9yO1xuICAgICAgaWYgKGQub3Bwb25lbnQub2ZmZXJpbmdSZW1hdGNoID0gYnkgPT09IGQub3Bwb25lbnQuY29sb3IpXG4gICAgICAgIG5vdGlmeShjdHJsLm5vYXJnKCd5b3VyT3Bwb25lbnRXYW50c1RvUGxheUFOZXdHYW1lV2l0aFlvdScpKTtcbiAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgfSxcbiAgICByZW1hdGNoVGFrZW4obmV4dElkOiBzdHJpbmcpIHtcbiAgICAgIGQuZ2FtZS5yZW1hdGNoID0gbmV4dElkO1xuICAgICAgaWYgKCFkLnBsYXllci5zcGVjdGF0b3IpIGN0cmwuc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgIGVsc2UgY3RybC5yZWRyYXcoKTtcbiAgICB9LFxuICAgIGRyYXdPZmZlcihieSkge1xuICAgICAgZC5wbGF5ZXIub2ZmZXJpbmdEcmF3ID0gYnkgPT09IGQucGxheWVyLmNvbG9yO1xuICAgICAgY29uc3QgZnJvbU9wID0gZC5vcHBvbmVudC5vZmZlcmluZ0RyYXcgPSBieSA9PT0gZC5vcHBvbmVudC5jb2xvcjtcbiAgICAgIGlmIChmcm9tT3ApIG5vdGlmeShjdHJsLm5vYXJnKCd5b3VyT3Bwb25lbnRPZmZlcnNBRHJhdycpKTtcbiAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgfSxcbiAgICBiZXJzZXJrKGNvbG9yOiBDb2xvcikge1xuICAgICAgY3RybC5zZXRCZXJzZXJrKGNvbG9yKTtcbiAgICB9LFxuICAgIGdvbmU6IGN0cmwuc2V0R29uZSxcbiAgICBnb25lSW46IGN0cmwuc2V0R29uZSxcbiAgICBjaGVja0NvdW50KGUpIHtcbiAgICAgIGQucGxheWVyLmNoZWNrcyA9IGQucGxheWVyLmNvbG9yID09ICd3aGl0ZScgPyBlLndoaXRlIDogZS5ibGFjaztcbiAgICAgIGQub3Bwb25lbnQuY2hlY2tzID0gZC5vcHBvbmVudC5jb2xvciA9PSAnd2hpdGUnID8gZS53aGl0ZSA6IGUuYmxhY2s7XG4gICAgICBjdHJsLnJlZHJhdygpO1xuICAgIH0sXG4gICAgc2ltdWxQbGF5ZXJNb3ZlKGdhbWVJZDogc3RyaW5nKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGN0cmwub3B0cy51c2VySWQgJiZcbiAgICAgICAgZC5zaW11bCAmJlxuICAgICAgICBjdHJsLm9wdHMudXNlcklkID09IGQuc2ltdWwuaG9zdElkICYmXG4gICAgICAgIGdhbWVJZCAhPT0gZC5nYW1lLmlkICYmXG4gICAgICAgIGN0cmwubW92ZU9uLmdldCgpICYmXG4gICAgICAgICFpc1BsYXllclR1cm4oY3RybC5kYXRhKSkge1xuICAgICAgICBjdHJsLnNldFJlZGlyZWN0aW5nKCk7XG4gICAgICAgIHNvdW5kLm1vdmUoKTtcbiAgICAgICAgbGkuaGFzVG9SZWxvYWQgPSB0cnVlO1xuICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy8nICsgZ2FtZUlkO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2ltdWxFbmQoc2ltdWw6IGdhbWUuU2ltdWwpIHtcbiAgICAgIGxpLmxvYWRDc3NQYXRoKCdtb2RhbCcpO1xuICAgICAgJC5tb2RhbCgkKFxuICAgICAgICAnPHA+U2ltdWwgY29tcGxldGUhPC9wPjxiciAvPjxiciAvPicgK1xuICAgICAgICAnPGEgY2xhc3M9XCJidXR0b25cIiBocmVmPVwiL3NpbXVsLycgKyBzaW11bC5pZCArICdcIj5CYWNrIHRvICcgKyBzaW11bC5uYW1lICsgJyBzaW11bDwvYT4nXG4gICAgICApKTtcbiAgICB9XG4gIH07XG5cbiAgbGkucHVic3ViLm9uKCdhYi5yZXAnLCBuID0+IHNlbmQoJ3JlcCcsIHsgbjogbiB9KSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzZW5kLFxuICAgIGhhbmRsZXJzLFxuICAgIG1vcmVUaW1lOiB0aHJvdHRsZSgzMDAsICgpID0+IHNlbmQoJ21vcmV0aW1lJykpLFxuICAgIG91dG9mdGltZTogYmFja29mZig1MDAsIDEuMSwgKCkgPT4gc2VuZCgnZmxhZycsIGQuZ2FtZS5wbGF5ZXIpKSxcbiAgICBiZXJzZXJrOiB0aHJvdHRsZSgyMDAsICgpID0+IHNlbmQoJ2JlcnNlcmsnLCBudWxsLCB7IGFja2FibGU6IHRydWUgfSkpLFxuICAgIHNlbmRMb2FkaW5nKHR5cDogc3RyaW5nLCBkYXRhPzogYW55KSB7XG4gICAgICBjdHJsLnNldExvYWRpbmcodHJ1ZSk7XG4gICAgICBzZW5kKHR5cCwgZGF0YSk7XG4gICAgfSxcbiAgICByZWNlaXZlKHR5cDogc3RyaW5nLCBkYXRhOiBhbnkpOiBib29sZWFuIHtcbiAgICAgIGlmIChoYW5kbGVyc1t0eXBdKSB7XG4gICAgICAgIGhhbmRsZXJzW3R5cF0oZGF0YSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgcmVsb2FkXG4gIH07XG59XG4iLCJpbXBvcnQgdGhyb3R0bGUgZnJvbSAnY29tbW9uL3Rocm90dGxlJztcblxuZnVuY3Rpb24gdGhyb3R0bGVkKHNvdW5kOiBzdHJpbmcpOiAoKSA9PiB2b2lkIHtcbiAgcmV0dXJuIHRocm90dGxlKDEwMCwgKCkgPT4gd2luZG93LmxpY2hlc3Muc291bmRbc291bmRdKCkpXG59XG5cbmV4cG9ydCBjb25zdCBtb3ZlID0gdGhyb3R0bGVkKCdtb3ZlJyk7XG5leHBvcnQgY29uc3QgY2FwdHVyZSA9IHRocm90dGxlZCgnY2FwdHVyZScpO1xuZXhwb3J0IGNvbnN0IGNoZWNrID0gdGhyb3R0bGVkKCdjaGVjaycpO1xuZXhwb3J0IGNvbnN0IGV4cGxvZGUgPSB0aHJvdHRsZWQoJ2V4cGxvZGUnKTtcbiIsImltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IFN0ZXAgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHZpZXdTdGF0dXMgZnJvbSAnZ2FtZS92aWV3L3N0YXR1cyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cChjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgd2luZG93LmxpY2hlc3MucHVic3ViLm9uKCdzcGVlY2guZW5hYmxlZCcsIG9uU3BlZWNoQ2hhbmdlKGN0cmwpKTtcbiAgb25TcGVlY2hDaGFuZ2UoY3RybCkod2luZG93LmxpY2hlc3Muc291bmQuc3BlZWNoKCkpO1xufVxuXG5mdW5jdGlvbiBvblNwZWVjaENoYW5nZShjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGVuYWJsZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAoIXdpbmRvdy5MaWNoZXNzU3BlZWNoICYmIGVuYWJsZWQpXG4gICAgICB3aW5kb3cubGljaGVzcy5sb2FkU2NyaXB0KFxuICAgICAgICB3aW5kb3cubGljaGVzcy5jb21waWxlZFNjcmlwdCgnc3BlZWNoJylcbiAgICAgICkudGhlbigoKSA9PiBzdGF0dXMoY3RybCkpO1xuICAgIGVsc2UgaWYgKHdpbmRvdy5MaWNoZXNzU3BlZWNoICYmICFlbmFibGVkKSB3aW5kb3cuTGljaGVzc1NwZWVjaCA9IHVuZGVmaW5lZDtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1cyhjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgY29uc3QgcyA9IHZpZXdTdGF0dXMoY3RybCk7XG4gIGlmIChzID09ICdwbGF5aW5nUmlnaHROb3cnKSB3aW5kb3cuTGljaGVzc1NwZWVjaCEuc3RlcChjdHJsLnN0ZXBBdChjdHJsLnBseSksIGZhbHNlKTtcbiAgZWxzZSB7XG4gICAgd2l0aFNwZWVjaChzcGVlY2ggPT4gc3BlZWNoLnNheShzLCBmYWxzZSkpO1xuICAgIGNvbnN0IHcgPSBjdHJsLmRhdGEuZ2FtZS53aW5uZXI7XG4gICAgaWYgKHcpIHdpdGhTcGVlY2goc3BlZWNoID0+IHNwZWVjaC5zYXkoY3RybC5ub2FyZyh3ICsgJ0lzVmljdG9yaW91cycpLCBmYWxzZSkpO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJKdW1wKGN0cmw6IFJvdW5kQ29udHJvbGxlciwgcGx5OiBQbHkpIHtcbiAgd2l0aFNwZWVjaChzID0+IHMuc3RlcChjdHJsLnN0ZXBBdChwbHkpLCB0cnVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGVwKHN0ZXA6IFN0ZXApIHtcbiAgd2l0aFNwZWVjaChzID0+IHMuc3RlcChzdGVwLCBmYWxzZSkpO1xufVxuXG5mdW5jdGlvbiB3aXRoU3BlZWNoKGY6IChzcGVlY2g6IExpY2hlc3NTcGVlY2gpID0+IHZvaWQpIHtcbiAgaWYgKHdpbmRvdy5MaWNoZXNzU3BlZWNoKSBmKHdpbmRvdy5MaWNoZXNzU3BlZWNoKTtcbn1cbiIsImltcG9ydCB7IGlzUGxheWVyVHVybiB9IGZyb20gJ2dhbWUnO1xuaW1wb3J0IHsgYWJvcnRlZCwgZmluaXNoZWQgfSBmcm9tICdnYW1lL3N0YXR1cyc7XG5pbXBvcnQgUm91bmRDb250cm9sbGVyIGZyb20gJy4vY3RybCc7XG5cbmNvbnN0IGluaXRpYWxUaXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuXG52YXIgY3VyRmF2aWNvbklkeCA9IDA7XG5jb25zdCBGID0gW1xuICAnL2Fzc2V0cy9sb2dvL2xpY2hlc3MtZmF2aWNvbi0zMi5wbmcnLFxuICAnL2Fzc2V0cy9sb2dvL2xpY2hlc3MtZmF2aWNvbi0zMi1pbnZlcnQucG5nJ1xuXS5tYXAoZnVuY3Rpb24ocGF0aCwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGN1ckZhdmljb25JZHggIT09IGkpIHtcbiAgICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmF2aWNvbicpIGFzIEhUTUxBbmNob3JFbGVtZW50KS5ocmVmID0gcGF0aDtcbiAgICAgIGN1ckZhdmljb25JZHggPSBpO1xuICAgIH1cbiAgfTtcbn0pO1xuXG5sZXQgdGlja2VyVGltZXI6IG51bWJlciB8IHVuZGVmaW5lZDtcbmZ1bmN0aW9uIHJlc2V0VGlja2VyKCkge1xuICBpZiAodGlja2VyVGltZXIpIGNsZWFyVGltZW91dCh0aWNrZXJUaW1lcik7XG4gIHRpY2tlclRpbWVyID0gdW5kZWZpbmVkO1xuICBGWzBdKCk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0VGlja2VyKCkge1xuICBmdW5jdGlvbiB0aWNrKCkge1xuICAgIGlmICghZG9jdW1lbnQuaGFzRm9jdXMoKSkge1xuICAgICAgRlsxIC0gY3VyRmF2aWNvbklkeF0oKTtcbiAgICAgIHRpY2tlclRpbWVyID0gc2V0VGltZW91dCh0aWNrLCAxMDAwKTtcbiAgICB9XG4gIH1cbiAgaWYgKCF0aWNrZXJUaW1lcikgdGlja2VyVGltZXIgPSBzZXRUaW1lb3V0KHRpY2ssIDIwMCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCByZXNldFRpY2tlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQoY3RybDogUm91bmRDb250cm9sbGVyLCB0ZXh0Pzogc3RyaW5nKSB7XG4gIGlmIChjdHJsLmRhdGEucGxheWVyLnNwZWN0YXRvcikgcmV0dXJuO1xuICBpZiAoIXRleHQpIHtcbiAgICBpZiAoYWJvcnRlZChjdHJsLmRhdGEpIHx8IGZpbmlzaGVkKGN0cmwuZGF0YSkpIHtcbiAgICAgIHRleHQgPSBjdHJsLnRyYW5zKCdnYW1lT3ZlcicpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGF5ZXJUdXJuKGN0cmwuZGF0YSkpIHtcbiAgICAgIHRleHQgPSBjdHJsLnRyYW5zKCd5b3VyVHVybicpO1xuICAgICAgaWYgKCFkb2N1bWVudC5oYXNGb2N1cygpKSBzdGFydFRpY2tlcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXh0ID0gY3RybC50cmFucygnd2FpdGluZ0Zvck9wcG9uZW50Jyk7XG4gICAgICByZXNldFRpY2tlcigpO1xuICAgIH1cbiAgfVxuICBkb2N1bWVudC50aXRsZSA9IHRleHQgKyBcIiAtIFwiICsgaW5pdGlhbFRpdGxlO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IG9uSW5zZXJ0IH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgQ2hhdFBsdWdpbiB9IGZyb20gJ2NoYXQnXG5cbmV4cG9ydCBpbnRlcmZhY2UgVG91clN0YW5kaW5nQ3RybCBleHRlbmRzIENoYXRQbHVnaW4ge1xuICBzZXQoZGF0YTogVG91clBsYXllcltdKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUb3VyUGxheWVyIHtcbiAgbjogc3RyaW5nOyAvLyBuYW1lXG4gIHM6IG51bWJlcjsgLy8gc2NvcmVcbiAgdD86IHN0cmluZzsgLy8gdGl0bGVcbiAgZjogYm9vbGVhbjsgLy8gZmlyZVxuICB3OiBib29sZWFuOyAvLyB3aXRoZHJhd1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG91clN0YW5kaW5nQ3RybChkYXRhOiBUb3VyUGxheWVyW10sIG5hbWU6IHN0cmluZyk6IFRvdXJTdGFuZGluZ0N0cmwge1xuICByZXR1cm4ge1xuICAgIHNldChkOiBUb3VyUGxheWVyW10pIHsgZGF0YSA9IGQgfSxcbiAgICB0YWI6IHtcbiAgICAgIGtleTogJ3RvdXJTdGFuZGluZycsXG4gICAgICBuYW1lOiBuYW1lXG4gICAgfSxcbiAgICB2aWV3KCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiBoKCd0YWJsZS5zbGlzdCcsIHtcbiAgICAgICAgaG9vazogb25JbnNlcnQoXyA9PiB7XG4gICAgICAgICAgd2luZG93LmxpY2hlc3MubG9hZENzc1BhdGgoJ3JvdW5kLnRvdXItc3RhbmRpbmcnKTtcbiAgICAgICAgfSlcbiAgICAgIH0sIFtcbiAgICAgICAgaCgndGJvZHknLCBkYXRhLm1hcCgocDogVG91clBsYXllciwgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGgoJ3RyLicgKyBwLm4sIFtcbiAgICAgICAgICAgIGgoJ3RkLm5hbWUnLCBbXG4gICAgICAgICAgICAgIGgoJ3NwYW4ucmFuaycsICcnICsgKGkgKyAxKSksXG4gICAgICAgICAgICAgIGgoJ2EudXNlci1saW5rLnVscHQnLCB7XG4gICAgICAgICAgICAgICAgYXR0cnM6IHsgaHJlZjogYC9ALyR7cC5ufWAgfVxuICAgICAgICAgICAgICB9LCAocC50ID8gcC50ICsgJyAnIDogJycpICsgcC5uKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBoKCd0ZC50b3RhbCcsIHAuZiA/IHtcbiAgICAgICAgICAgICAgY2xhc3M6IHsgJ2lzLWdvbGQnOiB0cnVlIH0sXG4gICAgICAgICAgICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiAnUScgfVxuICAgICAgICAgICAgfSA6IHt9LCAnJyArIHAucylcbiAgICAgICAgICBdKVxuICAgICAgICB9KSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn1cbiIsIi8vIGltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB7IFJvdW5kU29ja2V0IH0gZnJvbSAnLi9zb2NrZXQnO1xuXG4vKiBUcmFja3MgbW92ZXMgdGhhdCB3ZXJlIHBsYXllZCBvbiB0aGUgYm9hcmQsXG4gKiBzZW50IHRvIHRoZSBzZXJ2ZXIsIHBvc3NpYmx5IGFja2VkLFxuICogYnV0IHdpdGhvdXQgYSBtb3ZlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciB5ZXQuXG4gKiBBZnRlciBhIGRlbGF5LCBpdCB3aWxsIHRyaWdnZXIgYSByZWxvYWQuXG4gKiBUaGlzIG1pZ2h0IGZpeCBidWdzIHdoZXJlIHRoZSBib2FyZCBpcyBpbiBhXG4gKiB0cmFuc2llbnQsIGRpcnR5IHN0YXRlLCB3aGVyZSBjbG9ja3MgZG9uJ3QgdGljayxcbiAqIGV2ZW50dWFsbHkgY2F1c2luZyB0aGUgcGxheWVyIHRvIGZsYWcuXG4gKiBJdCB3aWxsIGFsc28gaGVscCB3aXRoIGxpbGEtd3MgcmVzdGFydHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYW5zaWVudE1vdmUge1xuXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IHNvY2tldDogUm91bmRTb2NrZXQpIHsgfVxuXG4gIGN1cnJlbnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICByZWdpc3RlciA9ICgpID0+IHtcbiAgICB0aGlzLmN1cnJlbnQgPSBzZXRUaW1lb3V0KHRoaXMuZXhwaXJlLCAxMDAwMCk7XG4gIH1cblxuICBjbGVhciA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5jdXJyZW50KSBjbGVhclRpbWVvdXQodGhpcy5jdXJyZW50KTtcbiAgfVxuXG4gIGV4cGlyZSA9ICgpID0+IHtcbiAgICAkLmFqYXgoeyBtZXRob2Q6ICdQT1NUJywgdXJsOiAnL3N0YXRsb2c/ZT1yb3VuZFRyYW5zaWVudEV4cGlyZScgfSk7XG4gICAgdGhpcy5zb2NrZXQucmVsb2FkKHt9KTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGVEYXRhIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBIb29rcyB9IGZyb20gJ3NuYWJiZG9tL2hvb2tzJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnY2hlc3Nncm91bmQvdHlwZXMnXG5pbXBvcnQgeyBvcHBvc2l0ZSB9IGZyb20gJ2NoZXNzZ3JvdW5kL3V0aWwnO1xuaW1wb3J0IHsgUmVkcmF3LCBFbmNvZGVkRGVzdHMsIERlY29kZWREZXN0cywgTWF0ZXJpYWxEaWZmLCBTdGVwLCBDaGVja0NvdW50IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuY29uc3QgcGllY2VTY29yZXMgPSB7XG4gIHBhd246IDEsXG4gIGtuaWdodDogMyxcbiAgYmlzaG9wOiAzLFxuICByb29rOiA1LFxuICBxdWVlbjogOSxcbiAga2luZzogMFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGp1c3RJY29uKGljb246IHN0cmluZyk6IFZOb2RlRGF0YSB7XG4gIHJldHVybiB7XG4gICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6IGljb24gfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdWNpMm1vdmUodWNpOiBzdHJpbmcpOiBjZy5LZXlbXSB8IHVuZGVmaW5lZCB7XG4gIGlmICghdWNpKSByZXR1cm4gdW5kZWZpbmVkO1xuICBpZiAodWNpWzFdID09PSAnQCcpIHJldHVybiBbdWNpLnNsaWNlKDIsIDQpIGFzIGNnLktleV07XG4gIHJldHVybiBbdWNpLnNsaWNlKDAsIDIpLCB1Y2kuc2xpY2UoMiwgNCldIGFzIGNnLktleVtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb25JbnNlcnQoZjogKGVsOiBIVE1MRWxlbWVudCkgPT4gdm9pZCk6IEhvb2tzIHtcbiAgcmV0dXJuIHtcbiAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgIGYodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kKGV2ZW50TmFtZTogc3RyaW5nLCBmOiAoZTogRXZlbnQpID0+IHZvaWQsIHJlZHJhdz86IFJlZHJhdywgcGFzc2l2ZTogYm9vbGVhbiA9IHRydWUpOiBIb29rcyB7XG4gIHJldHVybiBvbkluc2VydChlbCA9PiB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsICFyZWRyYXcgPyBmIDogZSA9PiB7XG4gICAgICBjb25zdCByZXMgPSBmKGUpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sIHsgcGFzc2l2ZSB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBvc3NpYmxlTW92ZXMoZGVzdHM/OiBFbmNvZGVkRGVzdHMpOiBEZWNvZGVkRGVzdHMge1xuICBpZiAoIWRlc3RzKSByZXR1cm4ge307XG4gIGNvbnN0IGRlYzogRGVjb2RlZERlc3RzID0ge307XG4gIGlmICh0eXBlb2YgZGVzdHMgPT0gJ3N0cmluZycpXG4gICAgZGVzdHMuc3BsaXQoJyAnKS5mb3JFYWNoKGRzID0+IHtcbiAgICAgIGRlY1tkcy5zbGljZSgwLDIpXSA9IGRzLnNsaWNlKDIpLm1hdGNoKC8uezJ9L2cpIGFzIGNnLktleVtdO1xuICAgIH0pO1xuICBlbHNlIGZvciAobGV0IGsgaW4gZGVzdHMpIGRlY1trXSA9IGRlc3RzW2tdLm1hdGNoKC8uezJ9L2cpIGFzIGNnLktleVtdO1xuICByZXR1cm4gZGVjO1xufVxuXG4vLyB7d2hpdGU6IHtwYXduOiAzIHF1ZWVuOiAxfSwgYmxhY2s6IHtiaXNob3A6IDJ9fVxuZXhwb3J0IGZ1bmN0aW9uIGdldE1hdGVyaWFsRGlmZihwaWVjZXM6IGNnLlBpZWNlcyk6IE1hdGVyaWFsRGlmZiB7XG4gIGNvbnN0IGRpZmY6IE1hdGVyaWFsRGlmZiA9IHtcbiAgICB3aGl0ZTogeyBraW5nOiAwLCBxdWVlbjogMCwgcm9vazogMCwgYmlzaG9wOiAwLCBrbmlnaHQ6IDAsIHBhd246IDAgfSxcbiAgICBibGFjazogeyBraW5nOiAwLCBxdWVlbjogMCwgcm9vazogMCwgYmlzaG9wOiAwLCBrbmlnaHQ6IDAsIHBhd246IDAgfSxcbiAgfTtcbiAgZm9yIChsZXQgayBpbiBwaWVjZXMpIHtcbiAgICBjb25zdCBwID0gcGllY2VzW2tdISwgdGhlbSA9IGRpZmZbb3Bwb3NpdGUocC5jb2xvcildO1xuICAgIGlmICh0aGVtW3Aucm9sZV0gPiAwKSB0aGVtW3Aucm9sZV0tLTtcbiAgICBlbHNlIGRpZmZbcC5jb2xvcl1bcC5yb2xlXSsrO1xuICB9XG4gIHJldHVybiBkaWZmO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NvcmUocGllY2VzOiBjZy5QaWVjZXMpOiBudW1iZXIge1xuICBsZXQgc2NvcmUgPSAwLCBrO1xuICBmb3IgKGsgaW4gcGllY2VzKSB7XG4gICAgc2NvcmUgKz0gcGllY2VTY29yZXNbcGllY2VzW2tdIS5yb2xlXSAqIChwaWVjZXNba10hLmNvbG9yID09PSAnd2hpdGUnID8gMSA6IC0xKTtcbiAgfVxuICByZXR1cm4gc2NvcmU7XG59XG5cbmV4cG9ydCBjb25zdCBub0NoZWNrczogQ2hlY2tDb3VudCA9IHtcbiAgd2hpdGU6IDAsXG4gIGJsYWNrOiAwXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3VudENoZWNrcyhzdGVwczogU3RlcFtdLCBwbHk6IFBseSk6IENoZWNrQ291bnQge1xuICBjb25zdCBjaGVja3M6IENoZWNrQ291bnQgPSB7Li4ubm9DaGVja3N9O1xuICBmb3IgKGxldCBzdGVwIG9mIHN0ZXBzKSB7XG4gICAgaWYgKHBseSA8IHN0ZXAucGx5KSBicmVhaztcbiAgICBpZiAoc3RlcC5jaGVjaykge1xuICAgICAgaWYgKHN0ZXAucGx5ICUgMiA9PT0gMSkgY2hlY2tzLndoaXRlKys7XG4gICAgICBlbHNlIGNoZWNrcy5ibGFjaysrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3Bpbm5lcigpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zcGlubmVyJywge1xuICAgICdhcmlhLWxhYmVsJzogJ2xvYWRpbmcnXG4gIH0sIFtcbiAgICBoKCdzdmcnLCB7IGF0dHJzOiB7IHZpZXdCb3g6ICcwIDAgNDAgNDAnIH0gfSwgW1xuICAgICAgaCgnY2lyY2xlJywge1xuICAgICAgICBhdHRyczogeyBjeDogMjAsIGN5OiAyMCwgcjogMTgsIGZpbGw6ICdub25lJyB9XG4gICAgICB9KV0pXSk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgSG9va3MgfSBmcm9tICdzbmFiYmRvbS9ob29rcydcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gJ2dhbWUnO1xuaW1wb3J0ICogYXMgc3RhdHVzIGZyb20gJ2dhbWUvc3RhdHVzJztcbmltcG9ydCB7IGdhbWUgYXMgZ2FtZVJvdXRlIH0gZnJvbSAnZ2FtZS9yb3V0ZXInO1xuaW1wb3J0IHsgUGxheWVyVXNlciB9IGZyb20gJ2dhbWUnO1xuaW1wb3J0IHsgUm91bmREYXRhLCBNYXliZVZOb2RlcyB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQ2xvY2tEYXRhIH0gZnJvbSAnLi4vY2xvY2svY2xvY2tDdHJsJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5cbmZ1bmN0aW9uIGFuYWx5c2lzQm9hcmRPcmllbnRhdGlvbihkYXRhOiBSb3VuZERhdGEpIHtcbiAgcmV0dXJuIGRhdGEuZ2FtZS52YXJpYW50LmtleSA9PT0gJ3JhY2luZ0tpbmdzJyA/ICd3aGl0ZScgOiBkYXRhLnBsYXllci5jb2xvcjtcbn1cblxuZnVuY3Rpb24gcG9vbFVybChjbG9jazogQ2xvY2tEYXRhLCBibG9ja2luZz86IFBsYXllclVzZXIpIHtcbiAgcmV0dXJuICcvI3Bvb2wvJyArIChjbG9jay5pbml0aWFsIC8gNjApICsgJysnICsgY2xvY2suaW5jcmVtZW50ICsgKGJsb2NraW5nID8gJy8nICsgYmxvY2tpbmcuaWQgOiAnJyk7XG59XG5cbmZ1bmN0aW9uIGFuYWx5c2lzQnV0dG9uKGN0cmw6IFJvdW5kQ29udHJvbGxlcik6IFZOb2RlIHwgbnVsbCB7XG4gIGNvbnN0IGQgPSBjdHJsLmRhdGEsXG4gICAgdXJsID0gZ2FtZVJvdXRlKGQsIGFuYWx5c2lzQm9hcmRPcmllbnRhdGlvbihkKSkgKyAnIycgKyBjdHJsLnBseTtcbiAgcmV0dXJuIGdhbWUucmVwbGF5YWJsZShkKSA/IGgoJ2EuZmJ0Jywge1xuICAgIGF0dHJzOiB7IGhyZWY6IHVybCB9LFxuICAgIGhvb2s6IHV0aWwuYmluZCgnY2xpY2snLCBfID0+IHtcbiAgICAgIC8vIGZvcmNlIHBhZ2UgbG9hZCBpbiBjYXNlIHRoZSBVUkwgaXMgdGhlIHNhbWVcbiAgICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSA9PT0gdXJsLnNwbGl0KCcjJylbMF0pIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0pXG4gIH0sIGN0cmwubm9hcmcoJ2FuYWx5c2lzJykpIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gcmVtYXRjaEJ1dHRvbnMoY3RybDogUm91bmRDb250cm9sbGVyKTogTWF5YmVWTm9kZXMge1xuICBjb25zdCBkID0gY3RybC5kYXRhLFxuICAgIG1lID0gISFkLnBsYXllci5vZmZlcmluZ1JlbWF0Y2gsIHRoZW0gPSAhIWQub3Bwb25lbnQub2ZmZXJpbmdSZW1hdGNoLFxuICAgIG5vYXJnID0gY3RybC5ub2FyZztcbiAgcmV0dXJuIFtcbiAgICB0aGVtID8gaCgnYnV0dG9uLnJlbWF0Y2gtZGVjbGluZScsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAnTCcsXG4gICAgICAgIHRpdGxlOiBub2FyZygnZGVjbGluZScpXG4gICAgICB9LFxuICAgICAgaG9vazogdXRpbC5iaW5kKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY3RybC5zb2NrZXQuc2VuZCgncmVtYXRjaC1ubycpO1xuICAgICAgfSlcbiAgICB9LCBjdHJsLm52dWkgPyBub2FyZygnZGVjbGluZScpIDogJycpIDogbnVsbCxcbiAgICBoKCdidXR0b24uZmJ0LnJlbWF0Y2gud2hpdGUnLCB7XG4gICAgICBjbGFzczoge1xuICAgICAgICBtZSxcbiAgICAgICAgZ2xvd2luZzogdGhlbSxcbiAgICAgICAgZGlzYWJsZWQ6ICFtZSAmJiAhKGQub3Bwb25lbnQub25HYW1lIHx8ICghZC5jbG9jayAmJiBkLnBsYXllci51c2VyICYmIGQub3Bwb25lbnQudXNlcikpXG4gICAgICB9LFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgdGl0bGU6IHRoZW0gPyBub2FyZygneW91ck9wcG9uZW50V2FudHNUb1BsYXlBTmV3R2FtZVdpdGhZb3UnKSA6IChcbiAgICAgICAgICBtZSA/IG5vYXJnKCdyZW1hdGNoT2ZmZXJTZW50JykgOiAnJylcbiAgICAgIH0sXG4gICAgICBob29rOiB1dGlsLmJpbmQoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGNvbnN0IGQgPSBjdHJsLmRhdGE7XG4gICAgICAgIGlmIChkLmdhbWUucmVtYXRjaCkgbG9jYXRpb24uaHJlZiA9IGdhbWVSb3V0ZShkLmdhbWUucmVtYXRjaCwgZC5vcHBvbmVudC5jb2xvcik7XG4gICAgICAgIGVsc2UgaWYgKGQucGxheWVyLm9mZmVyaW5nUmVtYXRjaCkge1xuICAgICAgICAgIGQucGxheWVyLm9mZmVyaW5nUmVtYXRjaCA9IGZhbHNlO1xuICAgICAgICAgIGN0cmwuc29ja2V0LnNlbmQoJ3JlbWF0Y2gtbm8nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkLm9wcG9uZW50Lm9uR2FtZSkge1xuICAgICAgICAgIGQucGxheWVyLm9mZmVyaW5nUmVtYXRjaCA9IHRydWU7XG4gICAgICAgICAgY3RybC5zb2NrZXQuc2VuZCgncmVtYXRjaC15ZXMnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbGFzc0xpc3QuY29udGFpbnMoJ2Rpc2FibGVkJykpIGN0cmwuY2hhbGxlbmdlUmVtYXRjaCgpO1xuICAgICAgfSwgY3RybC5yZWRyYXcpXG4gICAgfSwgW1xuICAgICAgbWUgPyB1dGlsLnNwaW5uZXIoKSA6IGgoJ3NwYW4nLCBub2FyZygncmVtYXRjaCcpKVxuICAgIF0pXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFuZGFyZChcbiAgY3RybDogUm91bmRDb250cm9sbGVyLFxuICBjb25kaXRpb246ICgoZDogUm91bmREYXRhKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCxcbiAgaWNvbjogc3RyaW5nLFxuICBoaW50OiBzdHJpbmcsXG4gIHNvY2tldE1zZzogc3RyaW5nLFxuICBvbmNsaWNrPzogKCkgPT4gdm9pZFxuKTogVk5vZGUge1xuICAvLyBkaXNhYmxlZCBpZiBjb25kaXRpb24gY2FsbGJhY2sgaXMgcHJvdmlkZWQgYW5kIGlzIGZhbHN5XG4gIGNvbnN0IGVuYWJsZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gIWNvbmRpdGlvbiB8fCBjb25kaXRpb24oY3RybC5kYXRhKTtcbiAgfTtcbiAgcmV0dXJuIGgoJ2J1dHRvbi5mYnQuJyArIHNvY2tldE1zZywge1xuICAgIGF0dHJzOiB7XG4gICAgICBkaXNhYmxlZDogIWVuYWJsZWQoKSxcbiAgICAgIHRpdGxlOiBjdHJsLm5vYXJnKGhpbnQpXG4gICAgfSxcbiAgICBob29rOiB1dGlsLmJpbmQoJ2NsaWNrJywgXyA9PiB7XG4gICAgICBpZiAoZW5hYmxlZCgpKSBvbmNsaWNrID8gb25jbGljaygpIDogY3RybC5zb2NrZXQuc2VuZExvYWRpbmcoc29ja2V0TXNnKTtcbiAgICB9KVxuICB9LCBbXG4gICAgaCgnc3BhbicsIGN0cmwubnZ1aSA/IFtjdHJsLm5vYXJnKGhpbnQpXSA6IHV0aWwuanVzdEljb24oaWNvbikpXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3Bwb25lbnRHb25lKGN0cmw6IFJvdW5kQ29udHJvbGxlcikge1xuICBjb25zdCBnb25lID0gY3RybC5vcHBvbmVudEdvbmUoKTtcbiAgcmV0dXJuIGdvbmUgPT09IHRydWUgPyBoKCdkaXYuc3VnZ2VzdGlvbicsIFtcbiAgICBoKCdwJywgeyBob29rOiBvblN1Z2dlc3Rpb25Ib29rIH0sIGN0cmwubm9hcmcoJ29wcG9uZW50TGVmdENob2ljZXMnKSksXG4gICAgaCgnYnV0dG9uLmJ1dHRvbicsIHtcbiAgICAgIGhvb2s6IHV0aWwuYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnNvY2tldC5zZW5kTG9hZGluZygncmVzaWduLWZvcmNlJykpXG4gICAgfSwgY3RybC5ub2FyZygnZm9yY2VSZXNpZ25hdGlvbicpKSxcbiAgICBoKCdidXR0b24uYnV0dG9uJywge1xuICAgICAgaG9vazogdXRpbC5iaW5kKCdjbGljaycsICgpID0+IGN0cmwuc29ja2V0LnNlbmRMb2FkaW5nKCdkcmF3LWZvcmNlJykpXG4gICAgfSwgY3RybC5ub2FyZygnZm9yY2VEcmF3JykpXG4gIF0pIDogKFxuICAgIGdvbmUgPyBoKCdkaXYuc3VnZ2VzdGlvbicsIFtcbiAgICAgIGgoJ3AnLCBjdHJsLnRyYW5zLnZkb21QbHVyYWwoJ29wcG9uZW50TGVmdENvdW50ZXInLCBnb25lLCBoKCdzdHJvbmcnLCAnJyArIGdvbmUpKSlcbiAgICBdKSA6IG51bGxcbiAgKTtcbn1cblxuZnVuY3Rpb24gYWN0Q29uZmlybShjdHJsOiBSb3VuZENvbnRyb2xsZXIsIGY6ICh2OiBib29sZWFuKSA9PiB2b2lkLCB0cmFuc0tleTogc3RyaW5nLCBpY29uOiBzdHJpbmcsIGtsYXNzPzogc3RyaW5nKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2LmFjdC1jb25maXJtLicgKyB0cmFuc0tleSwgW1xuICAgIGgoJ2J1dHRvbi5mYnQueWVzLicgKyAoa2xhc3MgfHwgJycpLCB7XG4gICAgICBhdHRyczogeyB0aXRsZTogY3RybC5ub2FyZyh0cmFuc0tleSksICdkYXRhLWljb24nOiBpY29uIH0sXG4gICAgICBob29rOiB1dGlsLmJpbmQoJ2NsaWNrJywgKCkgPT4gZih0cnVlKSlcbiAgICB9KSxcbiAgICBoKCdidXR0b24uZmJ0Lm5vJywge1xuICAgICAgYXR0cnM6IHsgdGl0bGU6IGN0cmwubm9hcmcoJ2NhbmNlbCcpLCAnZGF0YS1pY29uJzogJ0wnIH0sXG4gICAgICBob29rOiB1dGlsLmJpbmQoJ2NsaWNrJywgKCkgPT4gZihmYWxzZSkpXG4gICAgfSlcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNpZ25Db25maXJtKGN0cmw6IFJvdW5kQ29udHJvbGxlcik6IFZOb2RlIHtcbiAgcmV0dXJuIGFjdENvbmZpcm0oY3RybCwgY3RybC5yZXNpZ24sICdyZXNpZ24nLCAnYicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd0NvbmZpcm0oY3RybDogUm91bmRDb250cm9sbGVyKTogVk5vZGUge1xuICByZXR1cm4gYWN0Q29uZmlybShjdHJsLCBjdHJsLm9mZmVyRHJhdywgJ29mZmVyRHJhdycsICcyJywgJ2RyYXcteWVzJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJlZWZvbGRDbGFpbURyYXcoY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIHJldHVybiBjdHJsLmRhdGEuZ2FtZS50aHJlZWZvbGQgPyBoKCdkaXYuc3VnZ2VzdGlvbicsIFtcbiAgICBoKCdwJywge1xuICAgICAgaG9vazogb25TdWdnZXN0aW9uSG9va1xuICAgIH0sIGN0cmwubm9hcmcoJ3RocmVlZm9sZFJlcGV0aXRpb24nKSksXG4gICAgaCgnYnV0dG9uLmJ1dHRvbicsIHtcbiAgICAgIGhvb2s6IHV0aWwuYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnNvY2tldC5zZW5kTG9hZGluZygnZHJhdy1jbGFpbScpKVxuICAgIH0sIGN0cmwubm9hcmcoJ2NsYWltQURyYXcnKSlcbiAgXSkgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsRHJhd09mZmVyKGN0cmw6IFJvdW5kQ29udHJvbGxlcikge1xuICByZXR1cm4gY3RybC5kYXRhLnBsYXllci5vZmZlcmluZ0RyYXcgPyBoKCdkaXYucGVuZGluZycsIFtcbiAgICBoKCdwJywgY3RybC5ub2FyZygnZHJhd09mZmVyU2VudCcpKVxuICBdKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbnN3ZXJPcHBvbmVudERyYXdPZmZlcihjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgcmV0dXJuIGN0cmwuZGF0YS5vcHBvbmVudC5vZmZlcmluZ0RyYXcgPyBoKCdkaXYubmVnb3RpYXRpb24uZHJhdycsIFtcbiAgICBoKCdwJywgY3RybC5ub2FyZygneW91ck9wcG9uZW50T2ZmZXJzQURyYXcnKSksXG4gICAgYWNjZXB0QnV0dG9uKGN0cmwsICdkcmF3LXllcycsICgpID0+IGN0cmwuc29ja2V0LnNlbmRMb2FkaW5nKCdkcmF3LXllcycpKSxcbiAgICBkZWNsaW5lQnV0dG9uKGN0cmwsICgpID0+IGN0cmwuc29ja2V0LnNlbmRMb2FkaW5nKCdkcmF3LW5vJykpXG4gIF0pIDogbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbFRha2ViYWNrUHJvcG9zaXRpb24oY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIHJldHVybiBjdHJsLmRhdGEucGxheWVyLnByb3Bvc2luZ1Rha2ViYWNrID8gaCgnZGl2LnBlbmRpbmcnLCBbXG4gICAgaCgncCcsIGN0cmwubm9hcmcoJ3Rha2ViYWNrUHJvcG9zaXRpb25TZW50JykpLFxuICAgIGgoJ2J1dHRvbi5idXR0b24nLCB7XG4gICAgICBob29rOiB1dGlsLmJpbmQoJ2NsaWNrJywgKCkgPT4gY3RybC5zb2NrZXQuc2VuZExvYWRpbmcoJ3Rha2ViYWNrLW5vJykpXG4gICAgfSwgY3RybC5ub2FyZygnY2FuY2VsJykpXG4gIF0pIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gYWNjZXB0QnV0dG9uKGN0cmw6IFJvdW5kQ29udHJvbGxlciwga2xhc3M6IHN0cmluZywgYWN0aW9uOiAoKSA9PiB2b2lkLCBpMThuS2V5OiBzdHJpbmcgPSAnYWNjZXB0Jykge1xuICBjb25zdCB0ZXh0ID0gY3RybC5ub2FyZyhpMThuS2V5KTtcbiAgcmV0dXJuIGN0cmwubnZ1aSA/IGgoJ2J1dHRvbi4nICsga2xhc3MsIHtcbiAgICBob29rOiB1dGlsLmJpbmQoJ2NsaWNrJywgYWN0aW9uKVxuICB9LCB0ZXh0KSA6IGgoJ2EuYWNjZXB0Jywge1xuICAgIGF0dHJzOiB7XG4gICAgICAnZGF0YS1pY29uJzogJ0UnLFxuICAgICAgdGl0bGU6IHRleHRcbiAgICB9LFxuICAgIGhvb2s6IHV0aWwuYmluZCgnY2xpY2snLCBhY3Rpb24pXG4gIH0pO1xufVxuZnVuY3Rpb24gZGVjbGluZUJ1dHRvbihjdHJsOiBSb3VuZENvbnRyb2xsZXIsIGFjdGlvbjogKCkgPT4gdm9pZCwgaTE4bktleTogc3RyaW5nID0gJ2RlY2xpbmUnKSB7XG4gIGNvbnN0IHRleHQgPSBjdHJsLm5vYXJnKGkxOG5LZXkpO1xuICByZXR1cm4gY3RybC5udnVpID8gaCgnYnV0dG9uJywge1xuICAgIGhvb2s6IHV0aWwuYmluZCgnY2xpY2snLCBhY3Rpb24pXG4gIH0sIHRleHQpIDogaCgnYS5kZWNsaW5lJywge1xuICAgIGF0dHJzOiB7XG4gICAgICAnZGF0YS1pY29uJzogJ0wnLFxuICAgICAgdGl0bGU6IHRleHRcbiAgICB9LFxuICAgIGhvb2s6IHV0aWwuYmluZCgnY2xpY2snLCBhY3Rpb24pXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5zd2VyT3Bwb25lbnRUYWtlYmFja1Byb3Bvc2l0aW9uKGN0cmw6IFJvdW5kQ29udHJvbGxlcikge1xuICByZXR1cm4gY3RybC5kYXRhLm9wcG9uZW50LnByb3Bvc2luZ1Rha2ViYWNrID8gaCgnZGl2Lm5lZ290aWF0aW9uLnRha2ViYWNrJywgW1xuICAgIGgoJ3AnLCBjdHJsLm5vYXJnKCd5b3VyT3Bwb25lbnRQcm9wb3Nlc0FUYWtlYmFjaycpKSxcbiAgICBhY2NlcHRCdXR0b24oY3RybCwgJ3Rha2ViYWNrLXllcycsIGN0cmwudGFrZWJhY2tZZXMpLFxuICAgIGRlY2xpbmVCdXR0b24oY3RybCwgKCkgPT4gY3RybC5zb2NrZXQuc2VuZExvYWRpbmcoJ3Rha2ViYWNrLW5vJykpXG4gIF0pIDogbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Ym1pdE1vdmUoY3RybDogUm91bmRDb250cm9sbGVyKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gKGN0cmwubW92ZVRvU3VibWl0IHx8IGN0cmwuZHJvcFRvU3VibWl0KSA/IGgoJ2Rpdi5uZWdvdGlhdGlvbi5tb3ZlLWNvbmZpcm0nLCBbXG4gICAgaCgncCcsIGN0cmwubm9hcmcoJ2NvbmZpcm1Nb3ZlJykpLFxuICAgIGFjY2VwdEJ1dHRvbihjdHJsLCAnY29uZmlybS15ZXMnLCAoKSA9PiBjdHJsLnN1Ym1pdE1vdmUodHJ1ZSkpLFxuICAgIGRlY2xpbmVCdXR0b24oY3RybCwgKCkgPT4gY3RybC5zdWJtaXRNb3ZlKGZhbHNlKSwgJ2NhbmNlbCcpXG4gIF0pIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFja1RvVG91cm5hbWVudChjdHJsOiBSb3VuZENvbnRyb2xsZXIpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGQgPSBjdHJsLmRhdGE7XG4gIHJldHVybiAoZC50b3VybmFtZW50ICYmIGQudG91cm5hbWVudC5ydW5uaW5nKSA/IGgoJ2Rpdi5mb2xsb3ctdXAnLCBbXG4gICAgaCgnYS50ZXh0LmZidC5zdHJvbmcuZ2xvd2luZycsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAnRycsXG4gICAgICAgIGhyZWY6ICcvdG91cm5hbWVudC8nICsgZC50b3VybmFtZW50LmlkXG4gICAgICB9LFxuICAgICAgaG9vazogdXRpbC5iaW5kKCdjbGljaycsIGN0cmwuc2V0UmVkaXJlY3RpbmcpXG4gICAgfSwgY3RybC5ub2FyZygnYmFja1RvVG91cm5hbWVudCcpKSxcbiAgICBoKCdmb3JtJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgIGFjdGlvbjogJy90b3VybmFtZW50LycgKyBkLnRvdXJuYW1lbnQuaWQgKyAnL3dpdGhkcmF3J1xuICAgICAgfVxuICAgIH0sIFtcbiAgICAgIGgoJ2J1dHRvbi50ZXh0LmZidC53ZWFrJywgdXRpbC5qdXN0SWNvbignWicpLCAnUGF1c2UnKVxuICAgIF0pLFxuICAgIGFuYWx5c2lzQnV0dG9uKGN0cmwpXG4gIF0pIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW9yZXRpbWUoY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIHJldHVybiBnYW1lLm1vcmV0aW1lYWJsZShjdHJsLmRhdGEpID8gaCgnYS5tb3JldGltZScsIHtcbiAgICBhdHRyczoge1xuICAgICAgdGl0bGU6IGN0cmwuZGF0YS5jbG9jayA/IGN0cmwudHJhbnMoJ2dpdmVOYlNlY29uZHMnLCBjdHJsLmRhdGEuY2xvY2subW9yZXRpbWUpIDpcbiAgICAgIGN0cmwubm9hcmcoJ2dpdmVNb3JlVGltZScpLFxuICAgICAgJ2RhdGEtaWNvbic6ICdPJ1xuICAgIH0sXG4gICAgaG9vazogdXRpbC5iaW5kKCdjbGljaycsIGN0cmwuc29ja2V0Lm1vcmVUaW1lKVxuICB9KSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb2xsb3dVcChjdHJsOiBSb3VuZENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIGNvbnN0IGQgPSBjdHJsLmRhdGEsXG4gICAgcmVtYXRjaGFibGUgPSAhZC5nYW1lLnJlbWF0Y2ggJiYgKHN0YXR1cy5maW5pc2hlZChkKSB8fCBzdGF0dXMuYWJvcnRlZChkKSkgJiYgIWQudG91cm5hbWVudCAmJiAhZC5zaW11bCAmJiAhZC5nYW1lLmJvb3N0ZWQsXG4gICAgbmV3YWJsZSA9IChzdGF0dXMuZmluaXNoZWQoZCkgfHwgc3RhdHVzLmFib3J0ZWQoZCkpICYmIChcbiAgICAgIGQuZ2FtZS5zb3VyY2UgPT09ICdsb2JieScgfHxcbiAgICAgIGQuZ2FtZS5zb3VyY2UgPT09ICdwb29sJyksXG4gICAgcmVtYXRjaFpvbmUgPSBjdHJsLmNoYWxsZW5nZVJlbWF0Y2hlZCA/IFtcbiAgICAgIGgoJ2Rpdi5zdWdnZXN0aW9uLnRleHQnLCB7XG4gICAgICAgIGhvb2s6IG9uU3VnZ2VzdGlvbkhvb2tcbiAgICAgIH0sIGN0cmwubm9hcmcoJ3JlbWF0Y2hPZmZlclNlbnQnKSlcbiAgICBdIDogKHJlbWF0Y2hhYmxlIHx8IGQuZ2FtZS5yZW1hdGNoID8gcmVtYXRjaEJ1dHRvbnMoY3RybCkgOiBbXSk7XG4gIHJldHVybiBoKCdkaXYuZm9sbG93LXVwJywgW1xuICAgIC4uLnJlbWF0Y2hab25lLFxuICAgIGQudG91cm5hbWVudCA/IGgoJ2EuZmJ0Jywge1xuICAgICAgYXR0cnM6IHtocmVmOiAnL3RvdXJuYW1lbnQvJyArIGQudG91cm5hbWVudC5pZH1cbiAgICB9LCBjdHJsLm5vYXJnKCd2aWV3VG91cm5hbWVudCcpKSA6IG51bGwsXG4gICAgbmV3YWJsZSA/IGgoJ2EuZmJ0Jywge1xuICAgICAgYXR0cnM6IHsgaHJlZjogZC5nYW1lLnNvdXJjZSA9PT0gJ3Bvb2wnID8gcG9vbFVybChkLmNsb2NrISwgZC5vcHBvbmVudC51c2VyKSA6ICcvP2hvb2tfbGlrZT0nICsgZC5nYW1lLmlkIH0sXG4gICAgfSwgY3RybC5ub2FyZygnbmV3T3Bwb25lbnQnKSkgOiBudWxsLFxuICAgIGFuYWx5c2lzQnV0dG9uKGN0cmwpXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2F0Y2hlckZvbGxvd1VwKGN0cmw6IFJvdW5kQ29udHJvbGxlcik6IFZOb2RlIHwgbnVsbCB7XG4gIGNvbnN0IGQgPSBjdHJsLmRhdGEsXG4gIGNvbnRlbnQgPSBbXG4gICAgZC5nYW1lLnJlbWF0Y2ggPyBoKCdhLmZidC50ZXh0Jywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICd2JyxcbiAgICAgICAgaHJlZjogYC8ke2QuZ2FtZS5yZW1hdGNofS8ke2Qub3Bwb25lbnQuY29sb3J9YFxuICAgICAgfVxuICAgIH0sIGN0cmwubm9hcmcoJ3ZpZXdSZW1hdGNoJykpIDogbnVsbCxcbiAgICBkLnRvdXJuYW1lbnQgPyBoKCdhLmZidCcsIHtcbiAgICAgIGF0dHJzOiB7aHJlZjogJy90b3VybmFtZW50LycgKyBkLnRvdXJuYW1lbnQuaWR9XG4gICAgfSwgY3RybC5ub2FyZygndmlld1RvdXJuYW1lbnQnKSkgOiBudWxsLFxuICAgIGFuYWx5c2lzQnV0dG9uKGN0cmwpXG4gIF07XG4gIHJldHVybiBjb250ZW50LmZpbmQoeCA9PiAhIXgpID8gaCgnZGl2LmZvbGxvdy11cCcsIGNvbnRlbnQpIDogbnVsbDtcbn1cblxuY29uc3Qgb25TdWdnZXN0aW9uSG9vazogSG9va3MgPSB1dGlsLm9uSW5zZXJ0KFxuICBlbCA9PiB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgncm91bmQuc3VnZ2VzdGlvbicsIGVsLnRleHRDb250ZW50KVxuKTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IE1heWJlVk5vZGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5pbXBvcnQgeyBwbGF5YWJsZSB9IGZyb20gJ2dhbWUnO1xuaW1wb3J0IHsgaXNQbGF5ZXJUdXJuIH0gZnJvbSAnZ2FtZSc7XG5cbmxldCByYW5nID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IFJvdW5kQ29udHJvbGxlcik6IE1heWJlVk5vZGUge1xuICBjb25zdCBkID0gcGxheWFibGUoY3RybC5kYXRhKSAmJiBjdHJsLmRhdGEuZXhwaXJhdGlvbjtcbiAgaWYgKCFkKSByZXR1cm47XG4gIGNvbnN0IHRpbWVMZWZ0ID0gTWF0aC5tYXgoMCwgZC5tb3ZlZEF0IC0gRGF0ZS5ub3coKSArIGQubWlsbGlzVG9Nb3ZlKSxcbiAgICBzZWNvbmRzTGVmdCA9IE1hdGguZmxvb3IodGltZUxlZnQgLyAxMDAwKSxcbiAgICBteVR1cm4gPSBpc1BsYXllclR1cm4oY3RybC5kYXRhKSxcbiAgICBlbWVyZyA9IG15VHVybiAmJiB0aW1lTGVmdCA8IDgwMDA7XG4gIGlmICghcmFuZyAmJiBlbWVyZykge1xuICAgIHdpbmRvdy5saWNoZXNzLnNvdW5kLmxvd3RpbWUoKTtcbiAgICByYW5nID0gdHJ1ZTtcbiAgfVxuICBjb25zdCBzaWRlID0gbXlUdXJuICE9IGN0cmwuZmxpcCA/ICdib3R0b20nIDogJ3RvcCc7XG4gIHJldHVybiBoKCdkaXYuZXhwaXJhdGlvbi5leHBpcmF0aW9uLScgKyBzaWRlLCB7XG4gICAgY2xhc3M6IHtcbiAgICAgIGVtZXJnLFxuICAgICAgJ2Jhci1nbGlkZXInOiBteVR1cm5cbiAgICB9XG4gIH0sIGN0cmwudHJhbnMudmRvbVBsdXJhbCgnbmJTZWNvbmRzVG9QbGF5VGhlRmlyc3RNb3ZlJywgc2Vjb25kc0xlZnQsIGgoJ3N0cm9uZycsICcnICsgc2Vjb25kc0xlZnQpKSk7XG59XG4iLCJpbXBvcnQgKiBhcyBncmlkSGFja3MgZnJvbSAnY29tbW9uL2dyaWRIYWNrcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChjb250YWluZXI6IEhUTUxFbGVtZW50KSB7XG5cbiAgaWYgKCFncmlkSGFja3MubmVlZHNCb2FyZEhlaWdodEZpeCgpKSByZXR1cm47XG5cbiAgY29uc3QgcnVuSGFja3MgPSAoKSA9PiBncmlkSGFja3MuZml4TWFpbkJvYXJkSGVpZ2h0KGNvbnRhaW5lcik7XG5cbiAgZ3JpZEhhY2tzLnJ1bm5lcihydW5IYWNrcyk7XG5cbiAgZ3JpZEhhY2tzLmJpbmRDaGVzc2dyb3VuZFJlc2l6ZU9uY2UocnVuSGFja3MpO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IHBseVN0ZXAgfSBmcm9tICcuLi9yb3VuZCc7XG5pbXBvcnQgeyByZW5kZXJUYWJsZSB9IGZyb20gJy4vdGFibGUnO1xuaW1wb3J0ICogYXMgcHJvbW90aW9uIGZyb20gJy4uL3Byb21vdGlvbic7XG5pbXBvcnQgeyByZW5kZXIgYXMgcmVuZGVyR3JvdW5kIH0gZnJvbSAnLi4vZ3JvdW5kJztcbmltcG9ydCB7IHJlYWQgYXMgZmVuUmVhZCB9IGZyb20gJ2NoZXNzZ3JvdW5kL2Zlbic7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0ICogYXMga2V5Ym9hcmQgZnJvbSAnLi4va2V5Ym9hcmQnO1xuaW1wb3J0ICogYXMgZ3JpZEhhY2tzIGZyb20gJy4vZ3JpZEhhY2tzJztcbmltcG9ydCBjcmF6eVZpZXcgZnJvbSAnLi4vY3JhenkvY3JhenlWaWV3JztcbmltcG9ydCB7IHJlbmRlciBhcyBrZXlib2FyZE1vdmUgfSBmcm9tICcuLi9rZXlib2FyZE1vdmUnO1xuaW1wb3J0IFJvdW5kQ29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IFBvc2l0aW9uLCBNYXRlcmlhbERpZmYsIE1hdGVyaWFsRGlmZlNpZGUsIENoZWNrQ291bnQgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuZnVuY3Rpb24gcmVuZGVyTWF0ZXJpYWwobWF0ZXJpYWw6IE1hdGVyaWFsRGlmZlNpZGUsIHNjb3JlOiBudW1iZXIsIHBvc2l0aW9uOiBQb3NpdGlvbiwgY2hlY2tzPzogbnVtYmVyKSB7XG4gIGNvbnN0IGNoaWxkcmVuOiBWTm9kZVtdID0gW107XG4gIGxldCByb2xlOiBzdHJpbmcsIGk6IG51bWJlcjtcbiAgZm9yIChyb2xlIGluIG1hdGVyaWFsKSB7XG4gICAgaWYgKG1hdGVyaWFsW3JvbGVdID4gMCkge1xuICAgICAgY29uc3QgY29udGVudDogVk5vZGVbXSA9IFtdO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG1hdGVyaWFsW3JvbGVdOyBpKyspIGNvbnRlbnQucHVzaChoKCdtcGllY2UuJyArIHJvbGUpKTtcbiAgICAgIGNoaWxkcmVuLnB1c2goaCgnZGl2JywgY29udGVudCkpO1xuICAgIH1cbiAgfVxuICBpZiAoY2hlY2tzKSBmb3IgKGkgPSAwOyBpIDwgY2hlY2tzOyBpKyspIGNoaWxkcmVuLnB1c2goaCgnZGl2JywgaCgnbXBpZWNlLmtpbmcnKSkpO1xuICBpZiAoc2NvcmUgPiAwKSBjaGlsZHJlbi5wdXNoKGgoJ3Njb3JlJywgJysnICsgc2NvcmUpKTtcbiAgcmV0dXJuIGgoJ2Rpdi5tYXRlcmlhbC5tYXRlcmlhbC0nICsgcG9zaXRpb24sIGNoaWxkcmVuKTtcbn1cblxuZnVuY3Rpb24gd2hlZWwoY3RybDogUm91bmRDb250cm9sbGVyLCBlOiBXaGVlbEV2ZW50KTogYm9vbGVhbiB7XG4gIGlmIChjdHJsLmlzUGxheWluZygpKSByZXR1cm4gdHJ1ZTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBpZiAoZS5kZWx0YVkgPiAwKSBrZXlib2FyZC5uZXh0KGN0cmwpO1xuICBlbHNlIGlmIChlLmRlbHRhWSA8IDApIGtleWJvYXJkLnByZXYoY3RybCk7XG4gIGN0cmwucmVkcmF3KCk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuY29uc3QgZW1wdHlNYXRlcmlhbERpZmY6IE1hdGVyaWFsRGlmZiA9IHtcbiAgd2hpdGU6IHt9LFxuICBibGFjazoge31cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKGN0cmw6IFJvdW5kQ29udHJvbGxlcik6IFZOb2RlIHtcbiAgY29uc3QgZCA9IGN0cmwuZGF0YSxcbiAgICBjZ1N0YXRlID0gY3RybC5jaGVzc2dyb3VuZCAmJiBjdHJsLmNoZXNzZ3JvdW5kLnN0YXRlLFxuICAgIHRvcENvbG9yID0gZFtjdHJsLmZsaXAgPyAncGxheWVyJyA6ICdvcHBvbmVudCddLmNvbG9yLFxuICAgIGJvdHRvbUNvbG9yID0gZFtjdHJsLmZsaXAgPyAnb3Bwb25lbnQnIDogJ3BsYXllciddLmNvbG9yO1xuICBsZXQgbWF0ZXJpYWw6IE1hdGVyaWFsRGlmZiwgc2NvcmU6IG51bWJlciA9IDA7XG4gIGlmIChkLnByZWYuc2hvd0NhcHR1cmVkKSB7XG4gICAgbGV0IHBpZWNlcyA9IGNnU3RhdGUgPyBjZ1N0YXRlLnBpZWNlcyA6IGZlblJlYWQocGx5U3RlcChjdHJsLmRhdGEsIGN0cmwucGx5KS5mZW4pO1xuICAgIG1hdGVyaWFsID0gdXRpbC5nZXRNYXRlcmlhbERpZmYocGllY2VzKTtcbiAgICBzY29yZSA9IHV0aWwuZ2V0U2NvcmUocGllY2VzKSAqIChib3R0b21Db2xvciA9PT0gJ3doaXRlJyA/IDEgOiAtMSk7XG4gIH0gZWxzZSBtYXRlcmlhbCA9IGVtcHR5TWF0ZXJpYWxEaWZmO1xuXG4gIGNvbnN0IGNoZWNrczogQ2hlY2tDb3VudCA9IChkLnBsYXllci5jaGVja3MgfHwgZC5vcHBvbmVudC5jaGVja3MpID9cbiAgICB1dGlsLmNvdW50Q2hlY2tzKGN0cmwuZGF0YS5zdGVwcywgY3RybC5wbHkpIDpcbiAgICB1dGlsLm5vQ2hlY2tzO1xuXG4gIHJldHVybiBjdHJsLm52dWkgPyBjdHJsLm52dWkucmVuZGVyKGN0cmwpIDogaCgnZGl2LnJvdW5kX19hcHAudmFyaWFudC0nICsgZC5nYW1lLnZhcmlhbnQua2V5LCB7XG4gICAgY2xhc3M6IHsgJ21vdmUtY29uZmlybSc6ICEhKGN0cmwubW92ZVRvU3VibWl0IHx8IGN0cmwuZHJvcFRvU3VibWl0KSB9LFxuICAgIGhvb2s6IHV0aWwub25JbnNlcnQoZ3JpZEhhY2tzLnN0YXJ0KVxuICB9LCBbXG4gICAgaCgnZGl2LnJvdW5kX19hcHBfX2JvYXJkLm1haW4tYm9hcmQnICsgKGN0cmwuZGF0YS5wcmVmLmJsaW5kZm9sZCA/ICcuYmxpbmRmb2xkJyA6ICcnKSwge1xuICAgICAgaG9vazogd2luZG93LmxpY2hlc3MuaGFzVG91Y2hFdmVudHMgPyB1bmRlZmluZWQgOlxuICAgICAgICB1dGlsLmJpbmQoJ3doZWVsJywgKGU6IFdoZWVsRXZlbnQpID0+IHdoZWVsKGN0cmwsIGUpLCB1bmRlZmluZWQsIGZhbHNlKVxuICAgIH0sIFtcbiAgICAgIHJlbmRlckdyb3VuZChjdHJsKSxcbiAgICAgIHByb21vdGlvbi52aWV3KGN0cmwpXG4gICAgXSksXG4gICAgY3JhenlWaWV3KGN0cmwsIHRvcENvbG9yLCAndG9wJykgfHwgcmVuZGVyTWF0ZXJpYWwobWF0ZXJpYWxbdG9wQ29sb3JdLCAtc2NvcmUsICd0b3AnLCBjaGVja3NbdG9wQ29sb3JdKSxcbiAgICAuLi5yZW5kZXJUYWJsZShjdHJsKSxcbiAgICBjcmF6eVZpZXcoY3RybCwgYm90dG9tQ29sb3IsICdib3R0b20nKSB8fCByZW5kZXJNYXRlcmlhbChtYXRlcmlhbFtib3R0b21Db2xvcl0sIHNjb3JlLCAnYm90dG9tJywgY2hlY2tzW2JvdHRvbUNvbG9yXSksXG4gICAgY3RybC5rZXlib2FyZE1vdmUgPyBrZXlib2FyZE1vdmUoY3RybC5rZXlib2FyZE1vdmUpIDogbnVsbFxuICBdKVxufTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgKiBhcyByb3VuZCBmcm9tICcuLi9yb3VuZCc7XG5pbXBvcnQgdGhyb3R0bGUgZnJvbSAnY29tbW9uL3Rocm90dGxlJztcbmltcG9ydCAqIGFzIGdhbWUgZnJvbSAnZ2FtZSc7XG5pbXBvcnQgKiBhcyBzdGF0dXMgZnJvbSAnZ2FtZS9zdGF0dXMnO1xuaW1wb3J0IHsgZ2FtZSBhcyBnYW1lUm91dGUgfSBmcm9tICdnYW1lL3JvdXRlcic7XG5pbXBvcnQgdmlld1N0YXR1cyBmcm9tICdnYW1lL3ZpZXcvc3RhdHVzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgUm91bmRDb250cm9sbGVyIGZyb20gJy4uL2N0cmwnO1xuaW1wb3J0IHsgU3RlcCwgTWF5YmVWTm9kZXMsIFJvdW5kRGF0YSB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5jb25zdCBzY3JvbGxNYXggPSA5OTk5OSwgbW92ZVRhZyA9ICdtMic7XG5cbmNvbnN0IGF1dG9TY3JvbGwgPSB0aHJvdHRsZSgxMDAsIChtb3Zlc0VsOiBIVE1MRWxlbWVudCwgY3RybDogUm91bmRDb250cm9sbGVyKSA9PlxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBpZiAoY3RybC5kYXRhLnN0ZXBzLmxlbmd0aCA8IDcpIHJldHVybjtcbiAgICBsZXQgc3Q6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoY3RybC5wbHkgPCAzKSBzdCA9IDA7XG4gICAgZWxzZSBpZiAoY3RybC5wbHkgPT0gcm91bmQubGFzdFBseShjdHJsLmRhdGEpKSBzdCA9IHNjcm9sbE1heDtcbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IHBseUVsID0gbW92ZXNFbC5xdWVyeVNlbGVjdG9yKCcuYWN0aXZlJykgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAocGx5RWwpIHN0ID0gd2luZG93LmxpY2hlc3MuaXNDb2wxKCkgP1xuICAgICAgICBwbHlFbC5vZmZzZXRMZWZ0IC0gbW92ZXNFbC5vZmZzZXRXaWR0aCAvIDIgKyBwbHlFbC5vZmZzZXRXaWR0aCAvIDIgOlxuICAgICAgICBwbHlFbC5vZmZzZXRUb3AgLSBtb3Zlc0VsLm9mZnNldEhlaWdodCAvIDIgKyBwbHlFbC5vZmZzZXRIZWlnaHQgLyAyO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHN0ID09ICdudW1iZXInKSB7XG4gICAgICBpZiAoc3QgPT0gc2Nyb2xsTWF4KSBtb3Zlc0VsLnNjcm9sbExlZnQgPSBtb3Zlc0VsLnNjcm9sbFRvcCA9IHN0O1xuICAgICAgZWxzZSBpZiAod2luZG93LmxpY2hlc3MuaXNDb2wxKCkpIG1vdmVzRWwuc2Nyb2xsTGVmdCA9IHN0O1xuICAgICAgZWxzZSBtb3Zlc0VsLnNjcm9sbFRvcCA9IHN0O1xuICAgIH1cbiAgfSlcbik7XG5cbmZ1bmN0aW9uIHJlbmRlck1vdmUoc3RlcDogU3RlcCwgY3VyUGx5OiBudW1iZXIsIG9yRW1wdHk6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIHN0ZXAgPyBoKG1vdmVUYWcsIHtcbiAgICBjbGFzczogeyBhY3RpdmU6IHN0ZXAucGx5ID09PSBjdXJQbHkgfVxuICB9LCBzdGVwLnNhblswXSA9PT0gJ1AnID8gc3RlcC5zYW4uc2xpY2UoMSkgOiBzdGVwLnNhbikgOiAob3JFbXB0eSA/IGgobW92ZVRhZywgJ+KApicpIDogdW5kZWZpbmVkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclJlc3VsdChjdHJsOiBSb3VuZENvbnRyb2xsZXIpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGxldCByZXN1bHQ7XG4gIGlmIChzdGF0dXMuZmluaXNoZWQoY3RybC5kYXRhKSkgc3dpdGNoIChjdHJsLmRhdGEuZ2FtZS53aW5uZXIpIHtcbiAgICBjYXNlICd3aGl0ZSc6XG4gICAgICByZXN1bHQgPSAnMS0wJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JsYWNrJzpcbiAgICAgIHJlc3VsdCA9ICcwLTEnO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJlc3VsdCA9ICfCvS3CvSc7XG4gIH1cbiAgaWYgKHJlc3VsdCB8fCBzdGF0dXMuYWJvcnRlZChjdHJsLmRhdGEpKSB7XG4gICAgY29uc3Qgd2lubmVyID0gY3RybC5kYXRhLmdhbWUud2lubmVyO1xuICAgIHJldHVybiBoKCdkaXYucmVzdWx0LXdyYXAnLCBbXG4gICAgICBoKCdwLnJlc3VsdCcsIHJlc3VsdCB8fCAnJyksXG4gICAgICBoKCdwLnN0YXR1cycsIHtcbiAgICAgICAgaG9vazogdXRpbC5vbkluc2VydCgoKSA9PiB7XG4gICAgICAgICAgaWYgKGN0cmwuYXV0b1Njcm9sbCkgY3RybC5hdXRvU2Nyb2xsKCk7XG4gICAgICAgICAgZWxzZSBzZXRUaW1lb3V0KCgpID0+IGN0cmwuYXV0b1Njcm9sbCgpLCAyMDApO1xuICAgICAgICB9KVxuICAgICAgfSwgW1xuICAgICAgICB2aWV3U3RhdHVzKGN0cmwpLFxuICAgICAgICB3aW5uZXIgPyAnIOKAoiAnICsgY3RybC50cmFucy5ub2FyZyh3aW5uZXIgKyAnSXNWaWN0b3Jpb3VzJykgOiAnJ1xuICAgICAgXSlcbiAgICBdKTtcbiAgfVxuICByZXR1cm47XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1vdmVzKGN0cmw6IFJvdW5kQ29udHJvbGxlcik6IE1heWJlVk5vZGVzIHtcbiAgY29uc3Qgc3RlcHMgPSBjdHJsLmRhdGEuc3RlcHMsXG4gICAgZmlyc3RQbHkgPSByb3VuZC5maXJzdFBseShjdHJsLmRhdGEpLFxuICAgIGxhc3RQbHkgPSByb3VuZC5sYXN0UGx5KGN0cmwuZGF0YSk7XG4gIGlmICh0eXBlb2YgbGFzdFBseSA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBbXTtcblxuICBjb25zdCBwYWlyczogQXJyYXk8QXJyYXk8YW55Pj4gPSBbXTtcbiAgbGV0IHN0YXJ0QXQgPSAxO1xuICBpZiAoZmlyc3RQbHkgJSAyID09PSAxKSB7XG4gICAgcGFpcnMucHVzaChbbnVsbCwgc3RlcHNbMV1dKTtcbiAgICBzdGFydEF0ID0gMjtcbiAgfVxuICBmb3IgKGxldCBpID0gc3RhcnRBdDsgaSA8IHN0ZXBzLmxlbmd0aDsgaSArPSAyKSBwYWlycy5wdXNoKFtzdGVwc1tpXSwgc3RlcHNbaSArIDFdXSk7XG5cbiAgY29uc3QgZWxzOiBNYXliZVZOb2RlcyA9IFtdLCBjdXJQbHkgPSBjdHJsLnBseTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xuICAgIGVscy5wdXNoKGgoJ2luZGV4JywgaSArIDEgKyAnJykpO1xuICAgIGVscy5wdXNoKHJlbmRlck1vdmUocGFpcnNbaV1bMF0sIGN1clBseSwgdHJ1ZSkpO1xuICAgIGVscy5wdXNoKHJlbmRlck1vdmUocGFpcnNbaV1bMV0sIGN1clBseSwgZmFsc2UpKTtcbiAgfVxuICBlbHMucHVzaChyZW5kZXJSZXN1bHQoY3RybCkpO1xuXG4gIHJldHVybiBlbHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXNpc0J1dHRvbihjdHJsOiBSb3VuZENvbnRyb2xsZXIpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGZvcmVjYXN0Q291bnQgPSBjdHJsLmRhdGEuZm9yZWNhc3RDb3VudDtcbiAgcmV0dXJuIGdhbWUudXNlckFuYWx5c2FibGUoY3RybC5kYXRhKSA/IGgoJ2EuZmJ0LmFuYWx5c2lzJywge1xuICAgIGNsYXNzOiB7XG4gICAgICAndGV4dCc6ICEhZm9yZWNhc3RDb3VudFxuICAgIH0sXG4gICAgYXR0cnM6IHtcbiAgICAgIHRpdGxlOiBjdHJsLnRyYW5zLm5vYXJnKCdhbmFseXNpcycpLFxuICAgICAgaHJlZjogZ2FtZVJvdXRlKGN0cmwuZGF0YSwgY3RybC5kYXRhLnBsYXllci5jb2xvcikgKyAnL2FuYWx5c2lzIycgKyBjdHJsLnBseSxcbiAgICAgICdkYXRhLWljb24nOiAnQSdcbiAgICB9XG4gIH0sIGZvcmVjYXN0Q291bnQgPyBbJycgKyBmb3JlY2FzdENvdW50XSA6IFtdXG4gICkgOiB1bmRlZmluZWRcbn1cblxuZnVuY3Rpb24gcmVuZGVyQnV0dG9ucyhjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgY29uc3QgZCA9IGN0cmwuZGF0YSxcbiAgICBmaXJzdFBseSA9IHJvdW5kLmZpcnN0UGx5KGQpLFxuICAgIGxhc3RQbHkgPSByb3VuZC5sYXN0UGx5KGQpO1xuICByZXR1cm4gaCgnZGl2LmJ1dHRvbnMnLCB7XG4gICAgaG9vazogdXRpbC5iaW5kKCdtb3VzZWRvd24nLCBlID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuICAgICAgY29uc3QgcGx5ID0gcGFyc2VJbnQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1wbHknKSB8fCAnJyk7XG4gICAgICBpZiAoIWlzTmFOKHBseSkpIGN0cmwudXNlckp1bXAocGx5KTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBhY3Rpb24gPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWFjdCcpIHx8ICh0YXJnZXQucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudCkuZ2V0QXR0cmlidXRlKCdkYXRhLWFjdCcpO1xuICAgICAgICBpZiAoYWN0aW9uID09PSAnZmxpcCcpIHtcbiAgICAgICAgICBpZiAoZC50dikgbG9jYXRpb24uaHJlZiA9ICcvdHYvJyArIGQudHYuY2hhbm5lbCArIChkLnR2LmZsaXAgPyAnJyA6ICc/ZmxpcD0xJyk7XG4gICAgICAgICAgZWxzZSBpZiAoZC5wbGF5ZXIuc3BlY3RhdG9yKSBsb2NhdGlvbi5ocmVmID0gZ2FtZVJvdXRlKGQsIGQub3Bwb25lbnQuY29sb3IpO1xuICAgICAgICAgIGVsc2UgY3RybC5mbGlwTm93KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBjdHJsLnJlZHJhdylcbiAgfSwgW1xuICAgIGgoJ2J1dHRvbi5mYnQuZmxpcCcsIHtcbiAgICAgIGNsYXNzOiB7IGFjdGl2ZTogY3RybC5mbGlwIH0sXG4gICAgICBhdHRyczoge1xuICAgICAgICB0aXRsZTogY3RybC50cmFucy5ub2FyZygnZmxpcEJvYXJkJyksXG4gICAgICAgICdkYXRhLWFjdCc6ICdmbGlwJyxcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdCJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIC4uLihbXG4gICAgICBbJ1cnLCBmaXJzdFBseV0sXG4gICAgICBbJ1knLCBjdHJsLnBseSAtIDFdLFxuICAgICAgWydYJywgY3RybC5wbHkgKyAxXSxcbiAgICAgIFsnVicsIGxhc3RQbHldXG4gICAgXS5tYXAoKGIsIGkpID0+IHtcbiAgICAgIGNvbnN0IGVuYWJsZWQgPSBjdHJsLnBseSAhPT0gYlsxXSAmJiBiWzFdID49IGZpcnN0UGx5ICYmIGJbMV0gPD0gbGFzdFBseTtcbiAgICAgIHJldHVybiBoKCdidXR0b24uZmJ0Jywge1xuICAgICAgICBjbGFzczogeyBnbG93aW5nOiBpID09PSAzICYmIGN0cmwuaXNMYXRlKCkgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBkaXNhYmxlZDogIWVuYWJsZWQsXG4gICAgICAgICAgJ2RhdGEtaWNvbic6IGJbMF0sXG4gICAgICAgICAgJ2RhdGEtcGx5JzogZW5hYmxlZCA/IGJbMV0gOiAnLSdcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSkpLFxuICAgIGFuYWx5c2lzQnV0dG9uKGN0cmwpIHx8IGgoJ2Rpdi5ub29wJylcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIGluaXRNZXNzYWdlKGQ6IFJvdW5kRGF0YSwgdHJhbnM6IFRyYW5zTm9BcmcgKSB7XG4gIHJldHVybiAoZ2FtZS5wbGF5YWJsZShkKSAmJiBkLmdhbWUudHVybnMgPT09IDAgJiYgIWQucGxheWVyLnNwZWN0YXRvcikgP1xuICAgIGgoJ2Rpdi5tZXNzYWdlJywgdXRpbC5qdXN0SWNvbign7oCFJyksIFtcbiAgICAgIGgoJ2RpdicsIFtcbiAgICAgICAgdHJhbnMoZC5wbGF5ZXIuY29sb3IgPT09ICd3aGl0ZScgPyAneW91UGxheVRoZVdoaXRlUGllY2VzJyA6ICd5b3VQbGF5VGhlQmxhY2tQaWVjZXMnKSxcbiAgICAgICAgLi4uKGQucGxheWVyLmNvbG9yID09PSAnd2hpdGUnID8gW2goJ2JyJyksIGgoJ3N0cm9uZycsIHRyYW5zKCdpdHNZb3VyVHVybicpKV0gOiBbXSlcbiAgICAgIF0pXG4gICAgXSkgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBjb2wxQnV0dG9uKGN0cmw6IFJvdW5kQ29udHJvbGxlciwgZGlyOiBudW1iZXIsIGljb246IHN0cmluZywgZGlzYWJsZWQ6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIGRpc2FibGVkID8gbnVsbCA6IGgoJ2J1dHRvbi5mYnQnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCxcbiAgICAgICdkYXRhLWljb24nOiBpY29uLFxuICAgICAgJ2RhdGEtcGx5JzogY3RybC5wbHkgKyBkaXJcbiAgICB9LFxuICAgIGhvb2s6IHV0aWwuYmluZCgnbW91c2Vkb3duJywgZSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjdHJsLnVzZXJKdW1wKGN0cmwucGx5ICsgZGlyKTtcbiAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgfSlcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoY3RybDogUm91bmRDb250cm9sbGVyKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBjb25zdCBkID0gY3RybC5kYXRhLFxuICAgIGNvbDEgPSB3aW5kb3cubGljaGVzcy5pc0NvbDEoKSxcbiAgICBtb3ZlcyA9IGN0cmwucmVwbGF5RW5hYmxlZEJ5UHJlZigpICYmIGgoJ2Rpdi5tb3ZlcycsIHtcbiAgICAgIGhvb2s6IHV0aWwub25JbnNlcnQoZWwgPT4ge1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlID0+IHtcbiAgICAgICAgICBsZXQgbm9kZSA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50LCBvZmZzZXQgPSAtMjtcbiAgICAgICAgICBpZiAobm9kZS50YWdOYW1lICE9PSBtb3ZlVGFnLnRvVXBwZXJDYXNlKCkpIHJldHVybjtcbiAgICAgICAgICB3aGlsZShub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmcgYXMgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgIG9mZnNldCsrO1xuICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ0lOREVYJykge1xuICAgICAgICAgICAgICBjdHJsLnVzZXJKdW1wKDIgKiBwYXJzZUludChub2RlLnRleHRDb250ZW50IHx8ICcnKSArIG9mZnNldCk7XG4gICAgICAgICAgICAgIGN0cmwucmVkcmF3KCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGN0cmwuYXV0b1Njcm9sbCA9ICgpID0+IGF1dG9TY3JvbGwoZWwsIGN0cmwpO1xuICAgICAgICBjdHJsLmF1dG9TY3JvbGwoKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBjdHJsLmF1dG9TY3JvbGwpO1xuICAgICAgfSlcbiAgICB9LCByZW5kZXJNb3ZlcyhjdHJsKSk7XG4gIHJldHVybiBjdHJsLm52dWkgPyB1bmRlZmluZWQgOiBoKCdkaXYucm1vdmVzJywgW1xuICAgIHJlbmRlckJ1dHRvbnMoY3RybCksXG4gICAgaW5pdE1lc3NhZ2UoZCwgY3RybC50cmFucy5ub2FyZykgfHwgKG1vdmVzID8gKFxuICAgICAgY29sMSA/IGgoJ2Rpdi5jb2wxLW1vdmVzJywgW1xuICAgICAgICBjb2wxQnV0dG9uKGN0cmwsIC0xLCAnWScsIGN0cmwucGx5ID09IHJvdW5kLmZpcnN0UGx5KGQpKSxcbiAgICAgICAgbW92ZXMsXG4gICAgICAgIGNvbDFCdXR0b24oY3RybCwgMSwgJ1gnLCBjdHJsLnBseSA9PSByb3VuZC5sYXN0UGx5KGQpKVxuICAgICAgXSkgOiBtb3Zlc1xuICAgICkgOiByZW5kZXJSZXN1bHQoY3RybCkpXG4gIF0pO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgUG9zaXRpb24sIE1heWJlVk5vZGVzIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gJ2dhbWUnO1xuaW1wb3J0ICogYXMgc3RhdHVzIGZyb20gJ2dhbWUvc3RhdHVzJztcbmltcG9ydCB7IHJlbmRlckNsb2NrIH0gZnJvbSAnLi4vY2xvY2svY2xvY2tWaWV3JztcbmltcG9ydCByZW5kZXJDb3JyZXNDbG9jayBmcm9tICcuLi9jb3JyZXNDbG9jay9jb3JyZXNDbG9ja1ZpZXcnO1xuaW1wb3J0ICogYXMgcmVwbGF5IGZyb20gJy4vcmVwbGF5JztcbmltcG9ydCByZW5kZXJFeHBpcmF0aW9uIGZyb20gJy4vZXhwaXJhdGlvbic7XG5pbXBvcnQgKiBhcyByZW5kZXJVc2VyIGZyb20gJy4vdXNlcic7XG5pbXBvcnQgKiBhcyBidXR0b24gZnJvbSAnLi9idXR0b24nO1xuaW1wb3J0IFJvdW5kQ29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcblxuZnVuY3Rpb24gcmVuZGVyUGxheWVyKGN0cmw6IFJvdW5kQ29udHJvbGxlciwgcG9zaXRpb246IFBvc2l0aW9uKSB7XG4gIGNvbnN0IHBsYXllciA9IGN0cmwucGxheWVyQXQocG9zaXRpb24pO1xuICByZXR1cm4gY3RybC5udnVpID8gdW5kZWZpbmVkIDogKFxuICAgIHBsYXllci5haSA/IGgoJ2Rpdi51c2VyLWxpbmsub25saW5lLnJ1c2VyLnJ1c2VyLScgKyBwb3NpdGlvbiwgW1xuICAgICAgaCgnaS5saW5lJyksXG4gICAgICBoKCduYW1lJywgcmVuZGVyVXNlci5haU5hbWUoY3RybCwgcGxheWVyLmFpKSlcbiAgICBdKSA6XG4gICAgcmVuZGVyVXNlci51c2VySHRtbChjdHJsLCBwbGF5ZXIsIHBvc2l0aW9uKVxuICApO1xufVxuXG5mdW5jdGlvbiBpc0xvYWRpbmcoY3RybDogUm91bmRDb250cm9sbGVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdHJsLmxvYWRpbmcgfHwgY3RybC5yZWRpcmVjdGluZztcbn1cblxuZnVuY3Rpb24gbG9hZGVyKCkgeyByZXR1cm4gaCgnaS5kZGxvYWRlcicpOyB9XG5cbmZ1bmN0aW9uIHJlbmRlclRhYmxlV2l0aChjdHJsOiBSb3VuZENvbnRyb2xsZXIsIGJ1dHRvbnM6IE1heWJlVk5vZGVzKSB7XG4gIHJldHVybiBbXG4gICAgcmVwbGF5LnJlbmRlcihjdHJsKSxcbiAgICBidXR0b25zLmZpbmQoeCA9PiAhIXgpID8gaCgnZGl2LnJjb250cm9scycsIGJ1dHRvbnMpIDogbnVsbFxuICBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyVGFibGVFbmQoY3RybDogUm91bmRDb250cm9sbGVyKSB7XG4gIHJldHVybiByZW5kZXJUYWJsZVdpdGgoY3RybCwgW1xuICAgIGlzTG9hZGluZyhjdHJsKSA/IGxvYWRlcigpIDogKGJ1dHRvbi5iYWNrVG9Ub3VybmFtZW50KGN0cmwpIHx8IGJ1dHRvbi5mb2xsb3dVcChjdHJsKSlcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJUYWJsZVdhdGNoKGN0cmw6IFJvdW5kQ29udHJvbGxlcikge1xuICByZXR1cm4gcmVuZGVyVGFibGVXaXRoKGN0cmwsIFtcbiAgICBpc0xvYWRpbmcoY3RybCkgPyBsb2FkZXIoKSA6IChnYW1lLnBsYXlhYmxlKGN0cmwuZGF0YSkgPyB1bmRlZmluZWQgOiBidXR0b24ud2F0Y2hlckZvbGxvd1VwKGN0cmwpKVxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclRhYmxlUGxheShjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgY29uc3QgZCA9IGN0cmwuZGF0YSxcbiAgICBsb2FkaW5nID0gaXNMb2FkaW5nKGN0cmwpLFxuICAgIHN1Ym1pdCA9IGJ1dHRvbi5zdWJtaXRNb3ZlKGN0cmwpLFxuICAgIGljb25zID0gKGxvYWRpbmcgfHwgc3VibWl0KSA/IFtdIDogW1xuICAgICAgZ2FtZS5hYm9ydGFibGUoZCkgPyBidXR0b24uc3RhbmRhcmQoY3RybCwgdW5kZWZpbmVkLCAnTCcsICdhYm9ydEdhbWUnLCAnYWJvcnQnKSA6XG4gICAgICBidXR0b24uc3RhbmRhcmQoY3RybCwgZ2FtZS50YWtlYmFja2FibGUsICdpJywgJ3Byb3Bvc2VBVGFrZWJhY2snLCAndGFrZWJhY2steWVzJywgY3RybC50YWtlYmFja1llcyksXG4gICAgICBjdHJsLmRyYXdDb25maXJtID8gYnV0dG9uLmRyYXdDb25maXJtKGN0cmwpIDogYnV0dG9uLnN0YW5kYXJkKGN0cmwsIGN0cmwuY2FuT2ZmZXJEcmF3LCAnMicsICdvZmZlckRyYXcnLCAnZHJhdy15ZXMnLCAoKSA9PiBjdHJsLm9mZmVyRHJhdyh0cnVlKSksXG4gICAgICBjdHJsLnJlc2lnbkNvbmZpcm0gPyBidXR0b24ucmVzaWduQ29uZmlybShjdHJsKSA6IGJ1dHRvbi5zdGFuZGFyZChjdHJsLCBnYW1lLnJlc2lnbmFibGUsICdiJywgJ3Jlc2lnbicsICdyZXNpZ24tY29uZmlybScsICgpID0+IGN0cmwucmVzaWduKHRydWUpKSxcbiAgICAgIHJlcGxheS5hbmFseXNpc0J1dHRvbihjdHJsKVxuICAgIF0sXG4gICAgYnV0dG9uczogTWF5YmVWTm9kZXMgPSBsb2FkaW5nID8gW2xvYWRlcigpXSA6IChzdWJtaXQgPyBbc3VibWl0XSA6IFtcbiAgICAgIGJ1dHRvbi5vcHBvbmVudEdvbmUoY3RybCksXG4gICAgICBidXR0b24udGhyZWVmb2xkQ2xhaW1EcmF3KGN0cmwpLFxuICAgICAgYnV0dG9uLmNhbmNlbERyYXdPZmZlcihjdHJsKSxcbiAgICAgIGJ1dHRvbi5hbnN3ZXJPcHBvbmVudERyYXdPZmZlcihjdHJsKSxcbiAgICAgIGJ1dHRvbi5jYW5jZWxUYWtlYmFja1Byb3Bvc2l0aW9uKGN0cmwpLFxuICAgICAgYnV0dG9uLmFuc3dlck9wcG9uZW50VGFrZWJhY2tQcm9wb3NpdGlvbihjdHJsKVxuICAgIF0pO1xuICByZXR1cm4gW1xuICAgIHJlcGxheS5yZW5kZXIoY3RybCksXG4gICAgaCgnZGl2LnJjb250cm9scycsIFtcbiAgICAgIGgoJ2Rpdi5yaWNvbnMnLCB7XG4gICAgICAgIGNsYXNzOiB7ICdjb25maXJtJzogISEoY3RybC5kcmF3Q29uZmlybSB8fCBjdHJsLnJlc2lnbkNvbmZpcm0pIH1cbiAgICAgIH0sIGljb25zKSxcbiAgICAgIC4uLmJ1dHRvbnNcbiAgICBdKVxuICBdO1xufVxuXG5mdW5jdGlvbiB3aG9zVHVybihjdHJsOiBSb3VuZENvbnRyb2xsZXIsIGNvbG9yOiBDb2xvciwgcG9zaXRpb246IFBvc2l0aW9uKSB7XG4gIGNvbnN0IGQgPSBjdHJsLmRhdGE7XG4gIGlmIChzdGF0dXMuZmluaXNoZWQoZCkgfHwgc3RhdHVzLmFib3J0ZWQoZCkpIHJldHVybjtcbiAgcmV0dXJuIGgoJ2Rpdi5yY2xvY2sucmNsb2NrLXR1cm4ucmNsb2NrLScgKyBwb3NpdGlvbiwgW1xuICAgIGQuZ2FtZS5wbGF5ZXIgPT09IGNvbG9yID8gaCgnZGl2LnJjbG9jay10dXJuX190ZXh0JyxcbiAgICAgIGQucGxheWVyLnNwZWN0YXRvciA/IGN0cmwudHJhbnMoZC5nYW1lLnBsYXllciArICdQbGF5cycpIDogY3RybC50cmFucyhcbiAgICAgICAgZC5nYW1lLnBsYXllciA9PT0gZC5wbGF5ZXIuY29sb3IgPyAneW91clR1cm4nIDogJ3dhaXRpbmdGb3JPcHBvbmVudCdcbiAgICAgIClcbiAgICApIDogbnVsbFxuICBdKTtcbn1cblxuZnVuY3Rpb24gYW55Q2xvY2soY3RybDogUm91bmRDb250cm9sbGVyLCBwb3NpdGlvbjogUG9zaXRpb24pIHtcbiAgY29uc3QgcGxheWVyID0gY3RybC5wbGF5ZXJBdChwb3NpdGlvbik7XG4gIGlmIChjdHJsLmNsb2NrKSByZXR1cm4gcmVuZGVyQ2xvY2soY3RybCwgcGxheWVyLCBwb3NpdGlvbik7XG4gIGVsc2UgaWYgKGN0cmwuZGF0YS5jb3JyZXNwb25kZW5jZSAmJiBjdHJsLmRhdGEuZ2FtZS50dXJucyA+IDEpXG4gICAgcmV0dXJuIHJlbmRlckNvcnJlc0Nsb2NrKFxuICAgICAgY3RybC5jb3JyZXNDbG9jayEsIGN0cmwudHJhbnMsIHBsYXllci5jb2xvciwgcG9zaXRpb24sIGN0cmwuZGF0YS5nYW1lLnBsYXllclxuICAgICk7XG4gIGVsc2UgcmV0dXJuIHdob3NUdXJuKGN0cmwsIHBsYXllci5jb2xvciwgcG9zaXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyVGFibGUoY3RybDogUm91bmRDb250cm9sbGVyKTogTWF5YmVWTm9kZXMge1xuICByZXR1cm4gW1xuICAgIGgoJ2Rpdi5yb3VuZF9fYXBwX190YWJsZScpLFxuICAgIHJlbmRlckV4cGlyYXRpb24oY3RybCksXG4gICAgcmVuZGVyUGxheWVyKGN0cmwsICd0b3AnKSxcbiAgICAuLi4oY3RybC5kYXRhLnBsYXllci5zcGVjdGF0b3IgPyByZW5kZXJUYWJsZVdhdGNoKGN0cmwpIDogKFxuICAgICAgZ2FtZS5wbGF5YWJsZShjdHJsLmRhdGEpID8gcmVuZGVyVGFibGVQbGF5KGN0cmwpIDogcmVuZGVyVGFibGVFbmQoY3RybClcbiAgICApKSxcbiAgICByZW5kZXJQbGF5ZXIoY3RybCwgJ2JvdHRvbScpLFxuICAgIC8qIHJlbmRlciBjbG9ja3MgYWZ0ZXIgcGxheWVycyBzbyB0aGV5IGRpc3BsYXkgb24gdG9wIG9mIHRoZW0gaW4gY29sMSxcbiAgICAgKiBzaW5jZSB0aGV5IG9jY3VweSB0aGUgc2FtZSBncmlkIGNlbGwuIFRoaXMgaXMgcmVxdWlyZWQgdG8gYXZvaWRcbiAgICAgKiBoYXZpbmcgdHdvIGNvbHVtbnMgd2l0aCBtaW4tY29udGVudCwgd2hpY2ggY2F1c2VzIHRoZSBob3Jpem9udGFsIG1vdmVzXG4gICAgICogdG8gb3ZlcmZsb3c6IGl0IGNvdWxkbid0IGJlIGNvbnRhaW5lZCBpbiB0aGUgcGFyZW50IGFueW1vcmUgKi9cbiAgICBhbnlDbG9jayhjdHJsLCAndG9wJyksXG4gICAgYW55Q2xvY2soY3RybCwgJ2JvdHRvbScpLFxuICBdO1xufTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFBsYXllciB9IGZyb20gJ2dhbWUnO1xuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCBSb3VuZENvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhaU5hbWUoY3RybDogUm91bmRDb250cm9sbGVyLCBsZXZlbDogbnVtYmVyKSB7XG4gIHJldHVybiBjdHJsLnRyYW5zKCdhaU5hbWVMZXZlbEFpTGV2ZWwnLCAnU3RvY2tmaXNoJywgbGV2ZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlckh0bWwoY3RybDogUm91bmRDb250cm9sbGVyLCBwbGF5ZXI6IFBsYXllciwgcG9zaXRpb246IFBvc2l0aW9uKSB7XG4gIGNvbnN0IGQgPSBjdHJsLmRhdGEsXG4gICAgdXNlciA9IHBsYXllci51c2VyLFxuICAgIHBlcmYgPSB1c2VyID8gdXNlci5wZXJmc1tkLmdhbWUucGVyZl0gOiBudWxsLFxuICAgIHJhdGluZyA9IHBsYXllci5yYXRpbmcgPyBwbGF5ZXIucmF0aW5nIDogKHBlcmYgJiYgcGVyZi5yYXRpbmcpLFxuICAgIHJkID0gcGxheWVyLnJhdGluZ0RpZmYsXG4gICAgcmF0aW5nRGlmZiA9IHJkID09PSAwID8gaCgnc3BhbicsICfCsTAnKSA6IChcbiAgICAgIHJkICYmIHJkID4gMCA/IGgoJ2dvb2QnLCAnKycgKyByZCkgOiAoXG4gICAgICAgIHJkICYmIHJkIDwgMCA/IGgoJ2JhZCcsICfiiJInICsgKC1yZCkpIDogdW5kZWZpbmVkXG4gICAgICApKTtcblxuICBpZiAodXNlcikge1xuICAgIGNvbnN0IGNvbm5lY3RpbmcgPSAhcGxheWVyLm9uR2FtZSAmJiBjdHJsLmZpcnN0U2Vjb25kcyAmJiB1c2VyLm9ubGluZTtcbiAgICByZXR1cm4gaChgZGl2LnJ1c2VyLSR7cG9zaXRpb259LnJ1c2VyLnVzZXItbGlua2AsIHtcbiAgICAgIGNsYXNzOiB7XG4gICAgICAgIG9ubGluZTogcGxheWVyLm9uR2FtZSxcbiAgICAgICAgb2ZmbGluZTogIXBsYXllci5vbkdhbWUsXG4gICAgICAgIGxvbmc6IHVzZXIudXNlcm5hbWUubGVuZ3RoID4gMTYsXG4gICAgICAgIGNvbm5lY3RpbmdcbiAgICAgIH1cbiAgICB9LCBbXG4gICAgICBoKCdpLmxpbmUnICsgKHVzZXIucGF0cm9uID8gJy5wYXRyb24nIDogJycpLCB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgdGl0bGU6IGNvbm5lY3RpbmcgPyAnQ29ubmVjdGluZyB0byB0aGUgZ2FtZScgOiAocGxheWVyLm9uR2FtZSA/ICdKb2luZWQgdGhlIGdhbWUnIDogJ0xlZnQgdGhlIGdhbWUnKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGgoJ2EudGV4dC51bHB0Jywge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgICdkYXRhLXB0LXBvcyc6ICdzJyxcbiAgICAgICAgICBocmVmOiAnL0AvJyArIHVzZXIudXNlcm5hbWUsXG4gICAgICAgICAgdGFyZ2V0OiBjdHJsLmlzUGxheWluZygpID8gJ19ibGFuaycgOiAnX3NlbGYnXG4gICAgICAgIH1cbiAgICAgIH0sIHVzZXIudGl0bGUgPyBbXG4gICAgICAgIGgoXG4gICAgICAgICAgJ3NwYW4udGl0bGUnLFxuICAgICAgICAgIHVzZXIudGl0bGUgPT0gJ0JPVCcgPyB7IGF0dHJzOiB7J2RhdGEtYm90JzogdHJ1ZSB9IH0gOiB7fSxcbiAgICAgICAgICB1c2VyLnRpdGxlXG4gICAgICAgICksICcgJywgdXNlci51c2VybmFtZVxuICAgICAgXSA6IFt1c2VyLnVzZXJuYW1lXSksXG4gICAgICByYXRpbmcgPyBoKCdyYXRpbmcnLCByYXRpbmcgKyAocGxheWVyLnByb3Zpc2lvbmFsID8gJz8nIDogJycpKSA6IG51bGwsXG4gICAgICByYXRpbmdEaWZmLFxuICAgICAgcGxheWVyLmVuZ2luZSA/IGgoJ3NwYW4nLCB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgJ2RhdGEtaWNvbic6ICdqJyxcbiAgICAgICAgICB0aXRsZTogY3RybC50cmFucy5ub2FyZygndGhpc1BsYXllclVzZXNDaGVzc0NvbXB1dGVyQXNzaXN0YW5jZScpXG4gICAgICAgIH1cbiAgICAgIH0pIDogbnVsbFxuICAgIF0pO1xuICB9XG4gIGNvbnN0IGNvbm5lY3RpbmcgPSAhcGxheWVyLm9uR2FtZSAmJiBjdHJsLmZpcnN0U2Vjb25kcztcbiAgcmV0dXJuIGgoYGRpdi5ydXNlci0ke3Bvc2l0aW9ufS5ydXNlci51c2VyLWxpbmtgLCB7XG4gICAgY2xhc3M6IHtcbiAgICAgIG9ubGluZTogcGxheWVyLm9uR2FtZSxcbiAgICAgIG9mZmxpbmU6ICFwbGF5ZXIub25HYW1lLFxuICAgICAgY29ubmVjdGluZ1xuICAgIH1cbiAgfSwgW1xuICAgIGgoJ2kubGluZScsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIHRpdGxlOiBjb25uZWN0aW5nID8gJ0Nvbm5lY3RpbmcgdG8gdGhlIGdhbWUnIDogKHBsYXllci5vbkdhbWUgPyAnSm9pbmVkIHRoZSBnYW1lJyA6ICdMZWZ0IHRoZSBnYW1lJylcbiAgICAgIH1cbiAgICB9KSxcbiAgICBoKCduYW1lJywgcGxheWVyLm5hbWUgfHwgJ0Fub255bW91cycpXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlclR4dChjdHJsOiBSb3VuZENvbnRyb2xsZXIsIHBsYXllcjogUGxheWVyKSB7XG4gIGlmIChwbGF5ZXIudXNlcikge1xuICAgIHJldHVybiAocGxheWVyLnVzZXIudGl0bGUgPyBwbGF5ZXIudXNlci50aXRsZSArICcgJyA6ICcnKSArIHBsYXllci51c2VyLnVzZXJuYW1lO1xuICB9IGVsc2UgaWYgKHBsYXllci5haSkgcmV0dXJuIGFpTmFtZShjdHJsLCBwbGF5ZXIuYWkpXG4gIGVsc2UgcmV0dXJuICdBbm9ueW1vdXMnO1xufVxuIiwiaW1wb3J0IFJvdW5kQ29udHJvbGxlciBmcm9tICcuL2N0cmwnO1xuXG5leHBvcnQgY29uc3QgaGVhZGVycyA9IHtcbiAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQubGljaGVzcy52NCtqc29uJ1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbG9hZChjdHJsOiBSb3VuZENvbnRyb2xsZXIpIHtcbiAgcmV0dXJuICQuYWpheCh7XG4gICAgdXJsOiBjdHJsLmRhdGEudXJsLnJvdW5kLFxuICAgIGhlYWRlcnNcbiAgfSkuZmFpbCh3aW5kb3cubGljaGVzcy5yZWxvYWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2hhdHNOZXh0KGN0cmw6IFJvdW5kQ29udHJvbGxlcikge1xuICByZXR1cm4gJC5hamF4KHtcbiAgICB1cmw6ICcvd2hhdHMtbmV4dC8nICsgY3RybC5kYXRhLmdhbWUuaWQgKyBjdHJsLmRhdGEucGxheWVyLmlkLFxuICAgIGhlYWRlcnNcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGFsbGVuZ2VSZW1hdGNoKGdhbWVJZDogc3RyaW5nKSB7XG4gIHJldHVybiAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogJy9jaGFsbGVuZ2UvcmVtYXRjaC1vZi8nICsgZ2FtZUlkLFxuICAgIGhlYWRlcnNcbiAgfSk7XG59XG4iXX0=
