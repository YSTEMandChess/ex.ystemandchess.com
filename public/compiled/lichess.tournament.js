(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessTournament = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./moderation":31,"./note":32,"./preset":33,"common":38}],28:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("./socket");
const xhr_1 = require("./xhr");
const pagination_1 = require("./pagination");
const sound = require("./sound");
const tour = require("./tournament");
class TournamentController {
    constructor(opts, redraw) {
        this.pages = {};
        this.joinSpinner = false;
        this.playerInfo = {};
        this.teamInfo = {};
        this.disableClicks = true;
        this.searching = false;
        this.joinWithTeamSelector = false;
        this.lastStorage = window.lichess.storage.make('last-redirect');
        this.askReload = () => {
            if (this.joinSpinner)
                xhr_1.default.reloadNow(this);
            else
                xhr_1.default.reloadSoon(this);
        };
        this.reload = (data) => {
            // we joined a private tournament! Reload the page to load the chat
            if (!this.data.me && data.me && this.data['private'])
                window.lichess.reload();
            this.data = Object.assign(Object.assign({}, this.data), data);
            this.data.me = data.me; // to account for removal on withdraw
            if (data.playerInfo && data.playerInfo.player.id === this.playerInfo.id)
                this.playerInfo.data = data.playerInfo;
            this.loadPage(data.standing);
            if (this.focusOnMe)
                this.scrollToMe();
            if (data.featured)
                this.startWatching(data.featured.id);
            sound.end(data);
            sound.countDown(data);
            this.joinSpinner = false;
            this.redirectToMyGame();
        };
        this.myGameId = () => this.data.me && this.data.me.gameId;
        this.redirectFirst = (gameId, rightNow) => {
            const delay = (rightNow || document.hasFocus()) ? 10 : (1000 + Math.random() * 500);
            setTimeout(() => {
                if (this.lastStorage.get() !== gameId) {
                    this.lastStorage.set(gameId);
                    window.lichess.redirect('/' + gameId);
                }
            }, delay);
        };
        this.loadPage = (data) => {
            if (!data.failed || !this.pages[data.page])
                this.pages[data.page] = data.players;
        };
        this.setPage = (page) => {
            this.page = page;
            xhr_1.default.loadPage(this, page);
        };
        this.jumpToPageOf = (name) => {
            const userId = name.toLowerCase();
            xhr_1.default.loadPageOf(this, userId).then(data => {
                this.loadPage(data);
                this.page = data.page;
                this.searching = false;
                this.focusOnMe = false;
                this.pages[this.page].filter(p => p.name.toLowerCase() == userId).forEach(this.showPlayerInfo);
                this.redraw();
            });
        };
        this.userSetPage = (page) => {
            this.focusOnMe = false;
            this.setPage(page);
        };
        this.userNextPage = () => this.userSetPage(this.page + 1);
        this.userPrevPage = () => this.userSetPage(this.page - 1);
        this.userLastPage = () => this.userSetPage(pagination_1.players(this).nbPages);
        this.withdraw = () => {
            xhr_1.default.withdraw(this);
            this.joinSpinner = true;
            this.focusOnMe = false;
        };
        this.join = (password, team) => {
            this.joinWithTeamSelector = false;
            if (!this.data.verdicts.accepted)
                return this.data.verdicts.list.forEach(v => {
                    if (v.verdict !== 'ok')
                        alert(v.verdict);
                });
            if (this.data.teamBattle && !team && !this.data.me) {
                this.joinWithTeamSelector = true;
            }
            else {
                xhr_1.default.join(this, password, team);
                this.joinSpinner = true;
                this.focusOnMe = true;
            }
        };
        this.scrollToMe = () => {
            const page = pagination_1.myPage(this);
            if (page && page !== this.page)
                this.setPage(page);
        };
        this.toggleFocusOnMe = () => {
            if (!this.data.me)
                return;
            this.focusOnMe = !this.focusOnMe;
            if (this.focusOnMe)
                this.scrollToMe();
        };
        this.showPlayerInfo = (player) => {
            const userId = player.name.toLowerCase();
            this.teamInfo.requested = undefined;
            this.playerInfo = {
                id: this.playerInfo.id === userId ? null : userId,
                player: player,
                data: null
            };
            if (this.playerInfo.id)
                xhr_1.default.playerInfo(this, this.playerInfo.id);
        };
        this.setPlayerInfoData = (data) => {
            if (data.player.id === this.playerInfo.id)
                this.playerInfo.data = data;
        };
        this.showTeamInfo = (teamId) => {
            this.playerInfo.id = undefined;
            this.teamInfo = {
                requested: this.teamInfo.requested === teamId ? undefined : teamId,
                loaded: undefined
            };
            if (this.teamInfo.requested)
                xhr_1.default.teamInfo(this, this.teamInfo.requested);
        };
        this.setTeamInfo = (teamInfo) => {
            if (teamInfo.id === this.teamInfo.requested)
                this.teamInfo.loaded = teamInfo;
        };
        this.toggleSearch = () => this.searching = !this.searching;
        this.opts = opts;
        this.data = opts.data;
        this.redraw = redraw;
        this.trans = window.lichess.trans(opts.i18n);
        this.socket = socket_1.default(opts.socketSend, this);
        this.page = this.data.standing.page;
        this.focusOnMe = tour.isIn(this);
        setTimeout(() => this.disableClicks = false, 1500);
        this.loadPage(this.data.standing);
        this.scrollToMe();
        sound.end(this.data);
        sound.countDown(this.data);
        this.redirectToMyGame();
        if (this.data.featured)
            this.startWatching(this.data.featured.id);
    }
    redirectToMyGame() {
        const gameId = this.myGameId();
        if (gameId)
            this.redirectFirst(gameId);
    }
    startWatching(id) {
        if (id !== this.watchingGameId) {
            this.watchingGameId = id;
            setTimeout(() => this.socket.send("startWatching", id), 1000);
        }
    }
    ;
}
exports.default = TournamentController;

},{"./pagination":44,"./socket":46,"./sound":47,"./tournament":48,"./xhr":61}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const class_1 = require("snabbdom/modules/class");
const attributes_1 = require("snabbdom/modules/attributes");
const chessground_1 = require("chessground");
const chat = require("chat");
const patch = snabbdom_1.init([class_1.default, attributes_1.default]);
const ctrl_1 = require("./ctrl");
const main_1 = require("./view/main");
function start(opts) {
    opts.classes = opts.element.getAttribute('class');
    let vnode, ctrl;
    function redraw() {
        vnode = patch(vnode, main_1.default(ctrl));
    }
    ctrl = new ctrl_1.default(opts, redraw);
    const blueprint = main_1.default(ctrl);
    opts.element.innerHTML = '';
    vnode = patch(opts.element, blueprint);
    return {
        socketReceive: ctrl.socket.receive
    };
}
exports.start = start;
;
// that's for the rest of lichess to access chessground
// without having to include it a second time
window.Chessground = chessground_1.Chessground;
window.LichessChat = chat;

},{"./ctrl":42,"./view/main":55,"chat":30,"chessground":4,"snabbdom":24,"snabbdom/modules/attributes":22,"snabbdom/modules/class":23}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./view/util");
const search = require("./search");
const maxPerPage = 10;
function button(text, icon, click, enable, ctrl) {
    return snabbdom_1.h('button.fbt.is', {
        attrs: {
            'data-icon': icon,
            disabled: !enable,
            title: text
        },
        hook: util_1.bind('mousedown', click, ctrl.redraw)
    });
}
function scrollToMeButton(ctrl) {
    if (ctrl.data.me)
        return snabbdom_1.h('button.fbt' + (ctrl.focusOnMe ? '.active' : ''), {
            attrs: {
                'data-icon': '7',
                title: 'Scroll to your player'
            },
            hook: util_1.bind('mousedown', ctrl.toggleFocusOnMe, ctrl.redraw)
        });
}
function renderPager(ctrl, pag) {
    const enabled = !!pag.currentPageResults, page = ctrl.page;
    return pag.nbPages > -1 ? [
        search.button(ctrl),
        ...(ctrl.searching ? [search.input(ctrl)] : [
            button('First', 'W', () => ctrl.userSetPage(1), enabled && page > 1, ctrl),
            button('Prev', 'Y', ctrl.userPrevPage, enabled && page > 1, ctrl),
            snabbdom_1.h('span.page', (pag.nbResults ? (pag.from + 1) : 0) + '-' + pag.to + ' / ' + pag.nbResults),
            button('Next', 'X', ctrl.userNextPage, enabled && page < pag.nbPages, ctrl),
            button('Last', 'V', ctrl.userLastPage, enabled && page < pag.nbPages, ctrl),
            scrollToMeButton(ctrl)
        ])
    ] : [];
}
exports.renderPager = renderPager;
function players(ctrl) {
    const page = ctrl.page, nbResults = ctrl.data.nbPlayers, from = (page - 1) * maxPerPage, to = Math.min(nbResults, page * maxPerPage);
    return {
        currentPage: page,
        maxPerPage,
        from,
        to,
        currentPageResults: ctrl.pages[page],
        nbResults,
        nbPages: Math.ceil(nbResults / maxPerPage)
    };
}
exports.players = players;
function myPage(ctrl) {
    if (ctrl.data.me)
        return Math.floor((ctrl.data.me.rank - 1) / 10) + 1;
}
exports.myPage = myPage;

},{"./search":45,"./view/util":60,"snabbdom":24}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./view/util");
function button(ctrl) {
    return snabbdom_1.h('button.fbt', {
        class: { active: ctrl.searching },
        attrs: {
            'data-icon': ctrl.searching ? 'L' : 'y',
            title: 'Search tournament players'
        },
        hook: util_1.bind('mousedown', ctrl.toggleSearch, ctrl.redraw)
    });
}
exports.button = button;
function input(ctrl) {
    return snabbdom_1.h('div.search', snabbdom_1.h('input', {
        hook: {
            insert(vnode) {
                window.lichess.raf(() => {
                    const el = vnode.elm;
                    window.lichess.userAutocomplete($(el), {
                        tag: 'span',
                        tour: ctrl.data.id,
                        focus: true,
                        minLength: 3,
                        onSelect(v) {
                            ctrl.jumpToPageOf(v.id || v);
                            $(el).typeahead('close');
                            el.value = '';
                            ctrl.redraw();
                        }
                    });
                });
            }
        }
    }));
}
exports.input = input;

},{"./view/util":60,"snabbdom":24}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(send, ctrl) {
    const handlers = {
        reload() {
            setTimeout(ctrl.askReload, Math.floor(Math.random() * 4000));
        },
        redirect(fullId) {
            ctrl.redirectFirst(fullId.slice(0, 8), true);
            return true;
        }
    };
    return {
        send,
        receive(type, data) {
            if (handlers[type])
                return handlers[type](data);
            return false;
        }
    };
}
exports.default = default_1;
;

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_1 = require("common/notification");
let countDownTimeout;
const li = window.lichess;
function doCountDown(targetTime) {
    let started = false;
    return function curCounter() {
        let secondsToStart = (targetTime - performance.now()) / 1000;
        // always play the 0 sound before completing.
        let bestTick = Math.max(0, Math.round(secondsToStart));
        if (bestTick <= 10)
            li.sound['countDown' + bestTick]();
        if (bestTick > 0) {
            let nextTick = Math.min(10, bestTick - 1);
            countDownTimeout = setTimeout(curCounter, 1000 *
                Math.min(1.1, Math.max(0.8, (secondsToStart - nextTick))));
        }
        if (!started && bestTick <= 10) {
            started = true;
            notification_1.default('The tournament is starting!');
        }
    };
}
function end(data) {
    if (!data.me)
        return;
    if (!data.isRecentlyFinished)
        return;
    if (!li.once('tournament.end.sound.' + data.id))
        return;
    let soundKey = 'Other';
    if (data.me.rank < 4)
        soundKey = '1st';
    else if (data.me.rank < 11)
        soundKey = '2nd';
    else if (data.me.rank < 21)
        soundKey = '3rd';
    li.sound['tournament' + soundKey]();
}
exports.end = end;
function countDown(data) {
    if (!data.me || !data.secondsToStart) {
        if (countDownTimeout)
            clearTimeout(countDownTimeout);
        countDownTimeout = undefined;
        return;
    }
    if (countDownTimeout)
        return;
    if (data.secondsToStart > 60 * 60 * 24)
        return;
    countDownTimeout = setTimeout(doCountDown(performance.now() + 1000 * data.secondsToStart - 100), 900); // wait 900ms before starting countdown.
    setTimeout(li.sound.warmup, (data.secondsToStart - 15) * 1000);
    // Preload countdown sounds.
    for (let i = 10; i >= 0; i--)
        li.sound.load('countDown' + i);
}
exports.countDown = countDown;

},{"common/notification":39}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isIn(ctrl) {
    return ctrl.data.me && !ctrl.data.me.withdraw;
}
exports.isIn = isIn;
function willBePaired(ctrl) {
    return isIn(ctrl) && !ctrl.data.pairingsClosed;
}
exports.willBePaired = willBePaired;

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
const battle_1 = require("./battle");
const button = require("./button");
const pagination = require("../pagination");
const scoreTagNames = ['score', 'streak', 'double'];
function scoreTag(s) {
    return snabbdom_1.h(scoreTagNames[(s[1] || 1) - 1], [Array.isArray(s) ? s[0] : s]);
}
function playerTr(ctrl, player) {
    const userId = player.name.toLowerCase(), nbScores = player.sheet.scores.length;
    const battle = ctrl.data.teamBattle;
    return snabbdom_1.h('tr', {
        key: userId,
        class: {
            me: ctrl.opts.userId === userId,
            long: nbScores > 35,
            xlong: nbScores > 80,
            active: ctrl.playerInfo.id === userId
        },
        hook: util_1.bind('click', _ => ctrl.showPlayerInfo(player), ctrl.redraw)
    }, [
        snabbdom_1.h('td.rank', player.withdraw ? snabbdom_1.h('i', {
            attrs: {
                'data-icon': 'Z',
                'title': ctrl.trans.noarg('pause')
            }
        }) : player.rank),
        snabbdom_1.h('td.player', [
            util_1.player(player, false, true, userId === ctrl.data.defender),
            ...(battle && player.team ? [' ', battle_1.teamName(battle, player.team)] : [])
        ]),
        snabbdom_1.h('td.sheet', player.sheet.scores.map(scoreTag)),
        snabbdom_1.h('td.total', [
            player.sheet.fire && !ctrl.data.isFinished ?
                snabbdom_1.h('strong.is-gold', { attrs: util_1.dataIcon('Q') }, player.sheet.total) :
                snabbdom_1.h('strong', player.sheet.total)
        ])
    ]);
}
function podiumUsername(p) {
    return snabbdom_1.h('a.text.ulpt.user-link', {
        attrs: { href: '/@/' + p.name }
    }, util_1.playerName(p));
}
function podiumStats(p, trans) {
    const noarg = trans.noarg, nb = p.nb;
    return snabbdom_1.h('table.stats', [
        p.performance ? snabbdom_1.h('tr', [snabbdom_1.h('th', noarg('performance')), snabbdom_1.h('td', p.performance)]) : null,
        snabbdom_1.h('tr', [snabbdom_1.h('th', noarg('gamesPlayed')), snabbdom_1.h('td', nb.game)]),
        ...(nb.game ? [
            snabbdom_1.h('tr', [snabbdom_1.h('th', noarg('winRate')), snabbdom_1.h('td', util_1.ratio2percent(nb.win / nb.game))]),
            snabbdom_1.h('tr', [snabbdom_1.h('th', noarg('berserkRate')), snabbdom_1.h('td', util_1.ratio2percent(nb.berserk / nb.game))])
        ] : [])
    ]);
}
function podiumPosition(p, pos, trans) {
    if (p)
        return snabbdom_1.h('div.' + pos, [
            snabbdom_1.h('div.trophy'),
            podiumUsername(p),
            podiumStats(p, trans)
        ]);
}
let lastBody;
function podium(ctrl) {
    const p = ctrl.data.podium || [];
    return snabbdom_1.h('div.tour__podium', [
        podiumPosition(p[1], 'second', ctrl.trans),
        podiumPosition(p[0], 'first', ctrl.trans),
        podiumPosition(p[2], 'third', ctrl.trans)
    ]);
}
exports.podium = podium;
function preloadUserTips(el) {
    window.lichess.powertip.manualUserIn(el);
}
function controls(ctrl, pag) {
    return snabbdom_1.h('div.tour__controls', [
        snabbdom_1.h('div.pager', pagination.renderPager(ctrl, pag)),
        button.joinWithdraw(ctrl)
    ]);
}
exports.controls = controls;
function standing(ctrl, pag, klass) {
    const tableBody = pag.currentPageResults ?
        pag.currentPageResults.map(res => playerTr(ctrl, res)) : lastBody;
    if (pag.currentPageResults)
        lastBody = tableBody;
    return snabbdom_1.h('table.slist.tour__standing' + (klass ? '.' + klass : ''), {
        class: { loading: !pag.currentPageResults },
    }, [
        snabbdom_1.h('tbody', {
            hook: {
                insert: vnode => preloadUserTips(vnode.elm),
                update(_, vnode) { preloadUserTips(vnode.elm); }
            }
        }, tableBody)
    ]);
}
exports.standing = standing;

},{"../pagination":44,"./battle":50,"./button":51,"./util":60,"snabbdom":24}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function joinWithTeamSelector(ctrl) {
    const onClose = () => {
        ctrl.joinWithTeamSelector = false;
        ctrl.redraw();
    };
    const tb = ctrl.data.teamBattle;
    return snabbdom_1.h('div#modal-overlay', {
        hook: util_1.bind('click', onClose)
    }, [
        snabbdom_1.h('div#modal-wrap.team-battle__choice', {
            hook: util_1.onInsert(el => {
                el.addEventListener('click', e => e.stopPropagation());
            })
        }, [
            snabbdom_1.h('span.close', {
                attrs: { 'data-icon': 'L' },
                hook: util_1.bind('click', onClose)
            }),
            snabbdom_1.h('div.team-picker', [
                snabbdom_1.h('h2', "Pick your team"),
                snabbdom_1.h('br'),
                ...(tb.joinWith.length ? [
                    snabbdom_1.h('p', "Which team will you represent in this battle?"),
                    ...tb.joinWith.map(id => snabbdom_1.h('a.button', {
                        hook: util_1.bind('click', () => ctrl.join(undefined, id), ctrl.redraw)
                    }, tb.teams[id]))
                ] : [
                    snabbdom_1.h('p', "You must join one of these teams to participate!"),
                    snabbdom_1.h('ul', shuffleArray(Object.keys(tb.teams)).map(t => snabbdom_1.h('li', snabbdom_1.h('a', {
                        attrs: { href: '/team/' + t }
                    }, tb.teams[t]))))
                ])
            ])
        ])
    ]);
}
exports.joinWithTeamSelector = joinWithTeamSelector;
function teamStanding(ctrl, klass) {
    const battle = ctrl.data.teamBattle, standing = ctrl.data.teamStanding;
    return battle && standing ? snabbdom_1.h('table.slist.tour__team-standing' + (klass ? '.' + klass : ''), [
        snabbdom_1.h('tbody', standing.map(rt => teamTr(ctrl, battle, rt)))
    ]) : null;
}
exports.teamStanding = teamStanding;
function teamName(battle, teamId) {
    return snabbdom_1.h('team.ttc-' + Object.keys(battle.teams).indexOf(teamId), battle.teams[teamId]);
}
exports.teamName = teamName;
function teamTr(ctrl, battle, team) {
    const players = [];
    team.players.forEach((p, i) => {
        if (i > 0)
            players.push('+');
        players.push(snabbdom_1.h('score.ulpt.user-link', {
            key: p.user.name,
            class: { top: i === 0 },
            attrs: {
                'data-href': '/@/' + p.user.name,
                'data-name': p.user.name
            },
            hook: Object.assign({ destroy: vnode => $.powerTip.destroy(vnode.elm) }, util_1.bind('click', _ => ctrl.jumpToPageOf(p.user.name), ctrl.redraw))
        }, [
            ...(i === 0 ? [snabbdom_1.h('username', util_1.playerName(p.user)), ' '] : []),
            '' + p.score
        ]));
    });
    return snabbdom_1.h('tr', {
        key: team.id,
        class: {
            active: ctrl.teamInfo.requested == team.id
        },
        hook: util_1.bind('click', _ => ctrl.showTeamInfo(team.id), ctrl.redraw)
    }, [
        snabbdom_1.h('td.rank', '' + team.rank),
        snabbdom_1.h('td.team', [
            teamName(battle, team.id)
        ]),
        snabbdom_1.h('td.players', players),
        snabbdom_1.h('td.total', [
            snabbdom_1.h('strong', '' + team.score)
        ])
    ]);
}
/* Randomize array element order in-place. Using Durstenfeld shuffle algorithm. */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

},{"./util":60,"snabbdom":24}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const tournament_1 = require("../tournament");
const util_1 = require("./util");
function orJoinSpinner(ctrl, f) {
    return ctrl.joinSpinner ? util_1.spinner() : f();
}
function withdraw(ctrl) {
    return orJoinSpinner(ctrl, () => {
        const pause = ctrl.data.isStarted;
        return snabbdom_1.h('button.fbt.text', {
            attrs: util_1.dataIcon(pause ? 'Z' : 'b'),
            hook: util_1.bind('click', ctrl.withdraw, ctrl.redraw)
        }, ctrl.trans.noarg(pause ? 'pause' : 'withdraw'));
    });
}
exports.withdraw = withdraw;
function join(ctrl) {
    return orJoinSpinner(ctrl, () => {
        const delay = ctrl.data.me && ctrl.data.me.pauseDelay;
        const joinable = ctrl.data.verdicts.accepted && !delay;
        const button = snabbdom_1.h('button.fbt.text' + (joinable ? '.highlight' : ''), {
            attrs: {
                disabled: !joinable,
                'data-icon': 'G'
            },
            hook: util_1.bind('click', _ => {
                if (ctrl.data.private) {
                    const p = prompt(ctrl.trans.noarg('password'));
                    if (p !== null)
                        ctrl.join(p);
                }
                else
                    ctrl.join();
            }, ctrl.redraw)
        }, ctrl.trans('join'));
        return delay ? snabbdom_1.h('div.delay-wrap', {
            attrs: { title: "Waiting to be able to re-join the tournament" }
        }, [
            snabbdom_1.h('div.delay', {
                hook: {
                    insert(vnode) {
                        const el = vnode.elm;
                        el.style.animation = `tour-delay ${delay}s linear`;
                        setTimeout(() => {
                            if (delay === ctrl.data.me.pauseDelay) {
                                ctrl.data.me.pauseDelay = 0;
                                ctrl.redraw();
                            }
                        }, delay * 1000);
                    }
                }
            }, [button])
        ]) : button;
    });
}
exports.join = join;
function joinWithdraw(ctrl) {
    if (!ctrl.opts.userId)
        return snabbdom_1.h('a.fbt.text.highlight', {
            attrs: {
                href: '/login?referrer=' + window.location.pathname,
                'data-icon': 'G'
            }
        }, ctrl.trans('signIn'));
    if (!ctrl.data.isFinished)
        return tournament_1.isIn(ctrl) ? withdraw(ctrl) : join(ctrl);
}
exports.joinWithdraw = joinWithdraw;

},{"../tournament":48,"./util":60,"snabbdom":24}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const pagination = require("../pagination");
const arena_1 = require("./arena");
const battle_1 = require("./battle");
const teamInfo_1 = require("./teamInfo");
const util_1 = require("./util");
const header_1 = require("./header");
exports.name = 'created';
function main(ctrl) {
    const pag = pagination.players(ctrl);
    return [
        header_1.default(ctrl),
        battle_1.teamStanding(ctrl, 'created'),
        arena_1.controls(ctrl, pag),
        arena_1.standing(ctrl, pag, 'created'),
        snabbdom_1.h('blockquote.pull-quote', [
            snabbdom_1.h('p', ctrl.data.quote.text),
            snabbdom_1.h('footer', ctrl.data.quote.author)
        ]),
        ctrl.opts.$faq ? snabbdom_1.h('div', {
            hook: util_1.onInsert(el => $(el).replaceWith(ctrl.opts.$faq))
        }) : null
    ];
}
exports.main = main;
function table(ctrl) {
    return ctrl.teamInfo.requested ? teamInfo_1.default(ctrl) : undefined;
}
exports.table = table;

},{"../pagination":44,"./arena":49,"./battle":50,"./header":54,"./teamInfo":59,"./util":60,"snabbdom":24}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const pagination = require("../pagination");
const arena_1 = require("./arena");
const battle_1 = require("./battle");
const header_1 = require("./header");
const playerInfo_1 = require("./playerInfo");
const teamInfo_1 = require("./teamInfo");
const util_1 = require("./util");
function confetti(data) {
    if (data.me && data.isRecentlyFinished && window.lichess.once('tournament.end.canvas.' + data.id))
        return snabbdom_1.h('canvas#confetti', {
            hook: {
                insert: _ => window.lichess.loadScript('javascripts/confetti.js')
            }
        });
}
function stats(data, noarg) {
    const tableData = [
        util_1.numberRow(noarg('averageElo'), data.stats.averageRating, 'raw'),
        util_1.numberRow(noarg('gamesPlayed'), data.stats.games),
        util_1.numberRow(noarg('movesPlayed'), data.stats.moves),
        util_1.numberRow(noarg('whiteWins'), [data.stats.whiteWins, data.stats.games], 'percent'),
        util_1.numberRow(noarg('blackWins'), [data.stats.blackWins, data.stats.games], 'percent'),
        util_1.numberRow(noarg('draws'), [data.stats.draws, data.stats.games], 'percent'),
    ];
    if (data.berserkable) {
        const berserkRate = [data.stats.berserks / 2, data.stats.games];
        tableData.push(util_1.numberRow(noarg('berserkRate'), berserkRate, 'percent'));
    }
    return snabbdom_1.h('div.tour__stats', [
        snabbdom_1.h('h2', noarg('tournamentComplete')),
        snabbdom_1.h('table', tableData)
    ]);
}
exports.name = 'finished';
function main(ctrl) {
    const pag = pagination.players(ctrl);
    const teamS = battle_1.teamStanding(ctrl, 'finished');
    return [
        ...(teamS ? [header_1.default(ctrl), teamS] : [
            snabbdom_1.h('div.big_top', [
                confetti(ctrl.data),
                header_1.default(ctrl),
                arena_1.podium(ctrl)
            ])
        ]),
        arena_1.controls(ctrl, pag),
        arena_1.standing(ctrl, pag)
    ];
}
exports.main = main;
function table(ctrl) {
    return ctrl.playerInfo.id ? playerInfo_1.default(ctrl) : (ctrl.teamInfo.requested ? teamInfo_1.default(ctrl) : (stats ? stats(ctrl.data, ctrl.trans.noarg) : undefined));
}
exports.table = table;

},{"../pagination":44,"./arena":49,"./battle":50,"./header":54,"./playerInfo":56,"./teamInfo":59,"./util":60,"snabbdom":24}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
function startClock(time) {
    return {
        insert: vnode => $(vnode.elm).clock({ time: time })
    };
}
const oneDayInSeconds = 60 * 60 * 24;
function hasFreq(freq, d) {
    return d.schedule && d.schedule.freq === freq;
}
function clock(d) {
    if (d.isFinished)
        return;
    if (d.secondsToFinish)
        return snabbdom_1.h('div.clock', {
            hook: startClock(d.secondsToFinish)
        }, [
            snabbdom_1.h('div.time')
        ]);
    if (d.secondsToStart) {
        if (d.secondsToStart > oneDayInSeconds)
            return snabbdom_1.h('div.clock', [
                snabbdom_1.h('time.timeago.shy', {
                    attrs: {
                        title: new Date(d.startsAt).toLocaleString(),
                        datetime: Date.now() + d.secondsToStart * 1000
                    },
                    hook: {
                        insert(vnode) {
                            vnode.elm.setAttribute('datetime', '' + (Date.now() + d.secondsToStart * 1000));
                        }
                    }
                })
            ]);
        return snabbdom_1.h('div.clock.clock-created', {
            hook: startClock(d.secondsToStart)
        }, [
            snabbdom_1.h('span.shy', 'Starting in'),
            snabbdom_1.h('span.time.text')
        ]);
    }
}
function image(d) {
    if (d.isFinished)
        return;
    if (hasFreq('shield', d) || hasFreq('marathon', d))
        return;
    const s = d.spotlight;
    if (s && s.iconImg)
        return snabbdom_1.h('img.img', {
            attrs: { src: window.lichess.assetUrl('images/' + s.iconImg) }
        });
    return snabbdom_1.h('i.img', {
        attrs: util_1.dataIcon((s && s.iconFont) || 'g')
    });
}
function title(ctrl) {
    const d = ctrl.data;
    if (hasFreq('marathon', d))
        return snabbdom_1.h('h1', [
            snabbdom_1.h('i.fire-trophy', '\\'),
            d.fullName
        ]);
    if (hasFreq('shield', d))
        return snabbdom_1.h('h1', [
            snabbdom_1.h('a.shield-trophy', {
                attrs: { href: '/tournament/shields' }
            }, d.perf.icon),
            d.fullName
        ]);
    return snabbdom_1.h('h1', (d.greatPlayer ? [
        snabbdom_1.h('a', {
            attrs: {
                href: d.greatPlayer.url,
                target: '_blank'
            }
        }, d.greatPlayer.name),
        ' Arena'
    ] : [d.fullName]).concat(d.private ? [
        ' ',
        snabbdom_1.h('span', { attrs: util_1.dataIcon('a') })
    ] : []));
}
function default_1(ctrl) {
    return snabbdom_1.h('div.tour__main__header', [
        image(ctrl.data),
        title(ctrl),
        clock(ctrl.data)
    ]);
}
exports.default = default_1;

},{"./util":60,"snabbdom":24}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const created = require("./created");
const started = require("./started");
const finished = require("./finished");
const util_1 = require("./util");
const battle_1 = require("./battle");
function default_1(ctrl) {
    let handler;
    if (ctrl.data.isFinished)
        handler = finished;
    else if (ctrl.data.isStarted)
        handler = started;
    else
        handler = created;
    return snabbdom_1.h('main.' + ctrl.opts.classes, [
        snabbdom_1.h('aside.tour__side', {
            hook: util_1.onInsert(el => {
                $(el).replaceWith(ctrl.opts.$side);
                ctrl.opts.chat && window.lichess.makeChat(ctrl.opts.chat);
            })
        }),
        snabbdom_1.h('div.tour__underchat', {
            hook: util_1.onInsert(el => {
                $(el).replaceWith($('.tour__underchat.none').removeClass('none'));
            })
        }),
        handler.table(ctrl),
        snabbdom_1.h('div.tour__main', snabbdom_1.h('div.box.' + handler.name, {
            class: { 'tour__main-finished': ctrl.data.isFinished }
        }, handler.main(ctrl))),
        ctrl.opts.chat ? snabbdom_1.h('div.chat__members.none', [
            snabbdom_1.h('span.number', '\xa0'), ' ', ctrl.trans.noarg('spectators'), ' ', snabbdom_1.h('span.list')
        ]) : null,
        ctrl.joinWithTeamSelector ? battle_1.joinWithTeamSelector(ctrl) : null
    ]);
}
exports.default = default_1;

},{"./battle":50,"./created":52,"./finished":53,"./started":57,"./util":60,"snabbdom":24}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
const battle_1 = require("./battle");
const status = require("game/status");
function result(win, stat) {
    switch (win) {
        case true:
            return '1';
        case false:
            return '0';
        default:
            return stat >= status.ids.mate ? '½' : '*';
    }
}
function playerTitle(player) {
    return snabbdom_1.h('h2', [
        snabbdom_1.h('span.rank', player.rank + '. '),
        util_1.player(player, true, false, false)
    ]);
}
function setup(vnode) {
    const el = vnode.elm, p = window.lichess.powertip;
    p.manualUserIn(el);
    p.manualGameIn(el);
}
function default_1(ctrl) {
    const data = ctrl.playerInfo.data;
    const noarg = ctrl.trans.noarg;
    const tag = 'div.tour__player-info.tour__actor-info';
    if (!data || data.player.id !== ctrl.playerInfo.id)
        return snabbdom_1.h(tag, [
            snabbdom_1.h('div.stats', [
                playerTitle(ctrl.playerInfo.player),
                util_1.spinner()
            ])
        ]);
    const nb = data.player.nb, pairingsLen = data.pairings.length, avgOp = pairingsLen ? Math.round(data.pairings.reduce(function (a, b) {
        return a + b.op.rating;
    }, 0) / pairingsLen) : undefined;
    return snabbdom_1.h(tag, {
        hook: {
            insert: setup,
            postpatch(_, vnode) { setup(vnode); }
        }
    }, [
        snabbdom_1.h('a.close', {
            attrs: util_1.dataIcon('L'),
            hook: util_1.bind('click', () => ctrl.showPlayerInfo(data.player), ctrl.redraw)
        }),
        snabbdom_1.h('div.stats', [
            playerTitle(data.player),
            data.player.team ? snabbdom_1.h('team', {
                hook: util_1.bind('click', () => ctrl.showTeamInfo(data.player.team), ctrl.redraw)
            }, [battle_1.teamName(ctrl.data.teamBattle, data.player.team)]) : null,
            snabbdom_1.h('table', [
                data.player.performance ? util_1.numberRow(noarg('performance'), data.player.performance + (nb.game < 3 ? '?' : ''), 'raw') : null,
                util_1.numberRow(noarg('gamesPlayed'), nb.game),
                ...(nb.game ? [
                    util_1.numberRow(noarg('winRate'), [nb.win, nb.game], 'percent'),
                    util_1.numberRow(noarg('berserkRate'), [nb.berserk, nb.game], 'percent'),
                    util_1.numberRow(noarg('averageOpponent'), avgOp, 'raw')
                ] : [])
            ])
        ]),
        snabbdom_1.h('div', [
            snabbdom_1.h('table.pairings.sublist', {
                hook: util_1.bind('click', e => {
                    const href = e.target.parentNode.getAttribute('data-href');
                    if (href)
                        window.open(href, '_blank');
                })
            }, data.pairings.map(function (p, i) {
                const res = result(p.win, p.status);
                return snabbdom_1.h('tr.glpt.' + (res === '1' ? ' win' : (res === '0' ? ' loss' : '')), {
                    key: p.id,
                    attrs: { 'data-href': '/' + p.id + '/' + p.color },
                    hook: {
                        destroy: vnode => $.powerTip.destroy(vnode.elm)
                    }
                }, [
                    snabbdom_1.h('th', '' + (Math.max(nb.game, pairingsLen) - i)),
                    snabbdom_1.h('td', util_1.playerName(p.op)),
                    snabbdom_1.h('td', p.op.rating),
                    snabbdom_1.h('td.is.color-icon.' + p.color),
                    snabbdom_1.h('td', res)
                ]);
            }))
        ])
    ]);
}
exports.default = default_1;
;

},{"./battle":50,"./util":60,"game/status":41,"snabbdom":24}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const arena_1 = require("./arena");
const battle_1 = require("./battle");
const header_1 = require("./header");
const table_1 = require("./table");
const playerInfo_1 = require("./playerInfo");
const teamInfo_1 = require("./teamInfo");
const pagination = require("../pagination");
const tour = require("../tournament");
function joinTheGame(ctrl, gameId) {
    return snabbdom_1.h('a.tour__ur-playing.button.is.is-after.glowing', {
        attrs: { href: '/' + gameId }
    }, [
        ctrl.trans('youArePlaying'), snabbdom_1.h('br'),
        ctrl.trans('joinTheGame')
    ]);
}
function notice(ctrl) {
    return tour.willBePaired(ctrl) ? snabbdom_1.h('div.tour__notice.bar-glider', ctrl.trans('standByX', ctrl.data.me.username)) : snabbdom_1.h('div.tour__notice.closed', ctrl.trans('tournamentPairingsAreNowClosed'));
}
exports.name = 'started';
function main(ctrl) {
    const gameId = ctrl.myGameId(), pag = pagination.players(ctrl);
    return [
        header_1.default(ctrl),
        gameId ? joinTheGame(ctrl, gameId) : (tour.isIn(ctrl) ? notice(ctrl) : null),
        battle_1.teamStanding(ctrl, 'started'),
        arena_1.controls(ctrl, pag),
        arena_1.standing(ctrl, pag, 'started'),
    ];
}
exports.main = main;
function table(ctrl) {
    return ctrl.playerInfo.id ? playerInfo_1.default(ctrl) :
        ctrl.teamInfo.requested ? teamInfo_1.default(ctrl) : table_1.default(ctrl);
}
exports.table = table;

},{"../pagination":44,"../tournament":48,"./arena":49,"./battle":50,"./header":54,"./playerInfo":56,"./table":58,"./teamInfo":59,"snabbdom":24}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("chessground/util");
const util_2 = require("./util");
const battle_1 = require("./battle");
function featuredPlayer(player) {
    return snabbdom_1.h('div.tour__featured__player', [
        snabbdom_1.h('strong', '#' + player.rank),
        util_2.player(player, true, true, false),
        player.berserk ? snabbdom_1.h('i', {
            attrs: {
                'data-icon': '`',
                title: 'Berserk'
            }
        }) : null
    ]);
}
function featured(f) {
    return snabbdom_1.h('div.tour__featured', [
        featuredPlayer(f[util_1.opposite(f.color)]),
        util_2.miniBoard(f),
        featuredPlayer(f[f.color])
    ]);
}
function duelPlayerMeta(p) {
    return [
        snabbdom_1.h('em.rank', '#' + p.k),
        p.t ? snabbdom_1.h('em.title', p.t) : null,
        snabbdom_1.h('em.rating', '' + p.r)
    ];
}
function renderDuel(battle, duelTeams) {
    return (d) => snabbdom_1.h('a.glpt', {
        key: d.id,
        attrs: { href: '/' + d.id }
    }, [
        battle && duelTeams ? snabbdom_1.h('line.t', [0, 1].map(i => battle_1.teamName(battle, duelTeams[d.p[i].n.toLowerCase()]))) : undefined,
        snabbdom_1.h('line.a', [
            snabbdom_1.h('strong', d.p[0].n),
            snabbdom_1.h('span', duelPlayerMeta(d.p[1]).reverse())
        ]),
        snabbdom_1.h('line.b', [
            snabbdom_1.h('span', duelPlayerMeta(d.p[0])),
            snabbdom_1.h('strong', d.p[1].n)
        ])
    ]);
}
function default_1(ctrl) {
    return snabbdom_1.h('div.tour__table', [
        ctrl.data.featured ? featured(ctrl.data.featured) : null,
        ctrl.data.duels.length ? snabbdom_1.h('section.tour__duels', {
            hook: util_2.bind('click', _ => !ctrl.disableClicks)
        }, [
            snabbdom_1.h('h2', 'Top games')
        ].concat(ctrl.data.duels.map(renderDuel(ctrl.data.teamBattle, ctrl.data.duelTeams)))) : null
    ]);
}
exports.default = default_1;
;

},{"./battle":50,"./util":60,"chessground/util":17,"snabbdom":24}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const util_1 = require("./util");
const battle_1 = require("./battle");
function default_1(ctrl) {
    var _a, _b;
    const battle = ctrl.data.teamBattle, data = ctrl.teamInfo.loaded, noarg = ctrl.trans.noarg;
    if (!battle)
        return undefined;
    const teamTag = ctrl.teamInfo.requested ? battle_1.teamName(battle, ctrl.teamInfo.requested) : null;
    const tag = 'div.tour__team-info.tour__actor-info';
    if (!data || data.id !== ctrl.teamInfo.requested)
        return snabbdom_1.h(tag, [
            snabbdom_1.h('div.stats', [
                snabbdom_1.h('h2', [teamTag]),
                util_1.spinner()
            ])
        ]);
    const nbLeaders = ((_b = (_a = ctrl.data.teamStanding) === null || _a === void 0 ? void 0 : _a.find(s => s.id == data.id)) === null || _b === void 0 ? void 0 : _b.players.length) || 0;
    const setup = (vnode) => {
        window.lichess.powertip.manualUserIn(vnode.elm);
    };
    return snabbdom_1.h(tag, {
        hook: {
            insert: setup,
            postpatch(_, vnode) { setup(vnode); }
        }
    }, [
        snabbdom_1.h('a.close', {
            attrs: util_1.dataIcon('L'),
            hook: util_1.bind('click', () => ctrl.showTeamInfo(data.id), ctrl.redraw)
        }),
        snabbdom_1.h('div.stats', [
            snabbdom_1.h('h2', [teamTag]),
            snabbdom_1.h('table', [
                util_1.numberRow("Players", data.nbPlayers),
                ...(data.rating ? [
                    util_1.numberRow(noarg('averageElo'), data.rating, 'raw'),
                    ...(data.perf ? [
                        util_1.numberRow("Average performance", data.perf, 'raw'),
                        util_1.numberRow("Average score", data.score, 'raw')
                    ] : [])
                ] : []),
                snabbdom_1.h('tr', snabbdom_1.h('th', snabbdom_1.h('a', {
                    attrs: { href: '/team/' + data.id }
                }, 'Team page')))
            ])
        ]),
        snabbdom_1.h('div', [
            snabbdom_1.h('table.players.sublist', {
                hook: util_1.bind('click', e => {
                    const username = e.target.parentNode.getAttribute('data-name');
                    if (username)
                        ctrl.jumpToPageOf(username);
                })
            }, data.topPlayers.map((p, i) => snabbdom_1.h('tr', {
                key: p.name
            }, [
                snabbdom_1.h('th', '' + (i + 1)),
                snabbdom_1.h('td', util_1.player(p, false, true, false, i < nbLeaders)),
                snabbdom_1.h('td.total', [
                    p.fire && !ctrl.data.isFinished ?
                        snabbdom_1.h('strong.is-gold', { attrs: util_1.dataIcon('Q') }, '' + p.score) :
                        snabbdom_1.h('strong', '' + p.score)
                ])
            ])))
        ])
    ]);
}
exports.default = default_1;

},{"./battle":50,"./util":60,"snabbdom":24}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
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
        insert(vnode) {
            f(vnode.elm);
        }
    };
}
exports.onInsert = onInsert;
function dataIcon(icon) {
    return {
        'data-icon': icon
    };
}
exports.dataIcon = dataIcon;
function miniBoard(game) {
    return snabbdom_1.h('a.mini-board.parse-fen.is2d.mini-board-' + game.id, {
        key: game.id,
        attrs: {
            href: '/' + game.id + (game.color === 'white' ? '' : '/black'),
            'data-color': game.color,
            'data-fen': game.fen,
            'data-lastmove': game.lastMove
        },
        hook: {
            insert(vnode) {
                window.lichess.parseFen($(vnode.elm));
            }
        }
    }, [
        snabbdom_1.h('div.cg-wrap')
    ]);
}
exports.miniBoard = miniBoard;
function ratio2percent(r) {
    return Math.round(100 * r) + '%';
}
exports.ratio2percent = ratio2percent;
function playerName(p) {
    return p.title ? [snabbdom_1.h('span.title', p.title), ' ' + p.name] : p.name;
}
exports.playerName = playerName;
function player(p, asLink, withRating, defender = false, leader = false) {
    const fullName = playerName(p);
    return snabbdom_1.h('a.ulpt.user-link' + (fullName.length > 15 ? '.long' : ''), {
        attrs: asLink ? { href: '/@/' + p.name } : { 'data-href': '/@/' + p.name },
        hook: {
            destroy: vnode => $.powerTip.destroy(vnode.elm)
        }
    }, [
        snabbdom_1.h('span.name' + (defender ? '.defender' : (leader ? '.leader' : '')), defender ? { attrs: dataIcon('5') } : (leader ? { attrs: dataIcon('8') } : {}), fullName),
        withRating ? snabbdom_1.h('span.rating', ' ' + p.rating + (p.provisional ? '?' : '')) : null
    ]);
}
exports.player = player;
function numberRow(name, value, typ) {
    return snabbdom_1.h('tr', [snabbdom_1.h('th', name), snabbdom_1.h('td', typ === 'raw' ? value : (typ === 'percent' ? (value[1] > 0 ? ratio2percent(value[0] / value[1]) : 0) : window.lichess.numberFormat(value)))]);
}
exports.numberRow = numberRow;
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

},{"snabbdom":24}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throttle_1 = require("common/throttle");
const headers = {
    'Accept': 'application/vnd.lichess.v3+json'
};
// when the tournament no longer exists
function onFail(_1, _2, errorMessage) {
    if (errorMessage === 'Forbidden')
        location.href = '/';
    else
        window.lichess.reload();
}
function join(ctrl, password, team) {
    return $.ajax({
        method: 'POST',
        url: '/tournament/' + ctrl.data.id + '/join',
        data: JSON.stringify({
            p: password || null,
            team: team || null
        }),
        contentType: 'application/json; charset=utf-8',
        headers
    }).fail(onFail);
}
function withdraw(ctrl) {
    return $.ajax({
        method: 'POST',
        url: '/tournament/' + ctrl.data.id + '/withdraw',
        headers
    }).fail(onFail);
}
function loadPage(ctrl, p) {
    $.ajax({
        url: '/tournament/' + ctrl.data.id + '/standing/' + p,
        headers
    }).then(data => {
        ctrl.loadPage(data);
        ctrl.redraw();
    }, onFail);
}
function loadPageOf(ctrl, userId) {
    return $.ajax({
        url: '/tournament/' + ctrl.data.id + '/page-of/' + userId,
        headers
    });
}
function reload(ctrl) {
    return $.ajax({
        url: '/tournament/' + ctrl.data.id,
        data: {
            page: ctrl.focusOnMe ? null : ctrl.page,
            playerInfo: ctrl.playerInfo.id,
            partial: true
        },
        headers
    }).then(data => {
        ctrl.reload(data);
        ctrl.redraw();
    }, onFail);
}
function playerInfo(ctrl, userId) {
    return $.ajax({
        url: ['/tournament', ctrl.data.id, 'player', userId].join('/'),
        headers
    }).then(data => {
        ctrl.setPlayerInfoData(data);
        ctrl.redraw();
    }, onFail);
}
function teamInfo(ctrl, teamId) {
    return $.ajax({
        url: ['/tournament', ctrl.data.id, 'team', teamId].join('/'),
        headers
    }).then(data => {
        ctrl.setTeamInfo(data);
        ctrl.redraw();
    }, onFail);
}
exports.default = {
    join: throttle_1.default(1000, join),
    withdraw: throttle_1.default(1000, withdraw),
    loadPage: throttle_1.default(1000, loadPage),
    loadPageOf,
    reloadSoon: throttle_1.default(4000, reload),
    reloadNow: reload,
    playerInfo,
    teamInfo
};

},{"common/throttle":40}]},{},[43])(43)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2FuaW0udHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2FwaS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvYm9hcmQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2NoZXNzZ3JvdW5kLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9jb25maWcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2RyYWcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2RyYXcudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2Ryb3AudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL2V2ZW50cy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvZXhwbG9zaW9uLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3NyYy9mZW4udHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3ByZW1vdmUudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3JlbmRlci50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvc3RhdGUudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3N2Zy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9zcmMvdHlwZXMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3V0aWwudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3JjL3dyYXAudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3NuYWJiZG9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3RodW5rLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL3Zub2RlLmpzIiwiLi4vY2hhdC9zcmMvY3RybC50cyIsIi4uL2NoYXQvc3JjL2Rpc2N1c3Npb24udHMiLCIuLi9jaGF0L3NyYy9lbmhhbmNlLnRzIiwiLi4vY2hhdC9zcmMvbWFpbi50cyIsIi4uL2NoYXQvc3JjL21vZGVyYXRpb24udHMiLCIuLi9jaGF0L3NyYy9ub3RlLnRzIiwiLi4vY2hhdC9zcmMvcHJlc2V0LnRzIiwiLi4vY2hhdC9zcmMvc3BhbS50cyIsIi4uL2NoYXQvc3JjL3V0aWwudHMiLCIuLi9jaGF0L3NyYy92aWV3LnRzIiwiLi4vY2hhdC9zcmMveGhyLnRzIiwiLi4vY29tbW9uL3NyYy9jb21tb24udHMiLCIuLi9jb21tb24vc3JjL25vdGlmaWNhdGlvbi50cyIsIi4uL2NvbW1vbi9zcmMvdGhyb3R0bGUudHMiLCIuLi9nYW1lL3NyYy9zdGF0dXMudHMiLCJzcmMvY3RybC50cyIsInNyYy9tYWluLnRzIiwic3JjL3BhZ2luYXRpb24udHMiLCJzcmMvc2VhcmNoLnRzIiwic3JjL3NvY2tldC50cyIsInNyYy9zb3VuZC50cyIsInNyYy90b3VybmFtZW50LnRzIiwic3JjL3ZpZXcvYXJlbmEudHMiLCJzcmMvdmlldy9iYXR0bGUudHMiLCJzcmMvdmlldy9idXR0b24udHMiLCJzcmMvdmlldy9jcmVhdGVkLnRzIiwic3JjL3ZpZXcvZmluaXNoZWQudHMiLCJzcmMvdmlldy9oZWFkZXIudHMiLCJzcmMvdmlldy9tYWluLnRzIiwic3JjL3ZpZXcvcGxheWVySW5mby50cyIsInNyYy92aWV3L3N0YXJ0ZWQudHMiLCJzcmMvdmlldy90YWJsZS50cyIsInNyYy92aWV3L3RlYW1JbmZvLnRzIiwic3JjL3ZpZXcvdXRpbC50cyIsInNyYy94aHIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBLCtCQUE4QjtBQTRCOUIsU0FBZ0IsSUFBSSxDQUFJLFFBQXFCLEVBQUUsS0FBWTtJQUN6RCxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3RGLENBQUM7QUFGRCxvQkFFQztBQUVELFNBQWdCLE1BQU0sQ0FBSSxRQUFxQixFQUFFLEtBQVk7SUFDM0QsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9CLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbkIsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUpELHdCQUlDO0FBV0QsU0FBUyxTQUFTLENBQUMsR0FBVyxFQUFFLEtBQWU7SUFDN0MsT0FBTztRQUNMLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3RCLEtBQUssRUFBRSxLQUFLO0tBQ2IsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxLQUFnQixFQUFFLE1BQW1CO0lBQ25ELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUM1QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMs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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDNUQsT0FBTztLQUNSLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDYixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDYixDQUFDO0FBRUQsa0JBQWU7SUFDYixJQUFJLEVBQUUsa0JBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQzFCLFFBQVEsRUFBRSxrQkFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7SUFDbEMsUUFBUSxFQUFFLGtCQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztJQUNsQyxVQUFVO0lBQ1YsVUFBVSxFQUFFLGtCQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztJQUNsQyxTQUFTLEVBQUUsTUFBTTtJQUNqQixVQUFVO0lBQ1YsUUFBUTtDQUNULENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCB0eXBlIE11dGF0aW9uPEE+ID0gKHN0YXRlOiBTdGF0ZSkgPT4gQTtcblxuLy8gMCwxIGFuaW1hdGlvbiBnb2FsXG4vLyAyLDMgYW5pbWF0aW9uIGN1cnJlbnQgc3RhdHVzXG5leHBvcnQgdHlwZSBBbmltVmVjdG9yID0gY2cuTnVtYmVyUXVhZFxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1WZWN0b3JzIHtcbiAgW2tleTogc3RyaW5nXTogQW5pbVZlY3RvclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1GYWRpbmdzIHtcbiAgW2tleTogc3RyaW5nXTogY2cuUGllY2Vcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltUGxhbiB7XG4gIGFuaW1zOiBBbmltVmVjdG9ycztcbiAgZmFkaW5nczogQW5pbUZhZGluZ3M7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUN1cnJlbnQge1xuICBzdGFydDogRE9NSGlnaFJlc1RpbWVTdGFtcDtcbiAgZnJlcXVlbmN5OiBjZy5LSHo7XG4gIHBsYW46IEFuaW1QbGFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5pbTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICByZXR1cm4gc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPyBhbmltYXRlKG11dGF0aW9uLCBzdGF0ZSkgOiByZW5kZXIobXV0YXRpb24sIHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcjxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEFuaW1QaWVjZSB7XG4gIGtleTogY2cuS2V5O1xuICBwb3M6IGNnLlBvcztcbiAgcGllY2U6IGNnLlBpZWNlO1xufVxuaW50ZXJmYWNlIEFuaW1QaWVjZXMge1xuICBba2V5OiBzdHJpbmddOiBBbmltUGllY2Vcbn1cblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogY2cuS2V5LCBwaWVjZTogY2cuUGllY2UpOiBBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsb3NlcihwaWVjZTogQW5pbVBpZWNlLCBwaWVjZXM6IEFuaW1QaWVjZVtdKTogQW5pbVBpZWNlIHtcbiAgcmV0dXJuIHBpZWNlcy5zb3J0KChwMSwgcDIpID0+IHtcbiAgICByZXR1cm4gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDEucG9zKSAtIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAyLnBvcyk7XG4gIH0pWzBdO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlUGxhbihwcmV2UGllY2VzOiBjZy5QaWVjZXMsIGN1cnJlbnQ6IFN0YXRlKTogQW5pbVBsYW4ge1xuICBjb25zdCBhbmltczogQW5pbVZlY3RvcnMgPSB7fSxcbiAgYW5pbWVkT3JpZ3M6IGNnLktleVtdID0gW10sXG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0ge30sXG4gIG1pc3NpbmdzOiBBbmltUGllY2VbXSA9IFtdLFxuICBuZXdzOiBBbmltUGllY2VbXSA9IFtdLFxuICBwcmVQaWVjZXM6IEFuaW1QaWVjZXMgPSB7fTtcbiAgbGV0IGN1clA6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLCBwcmVQOiBBbmltUGllY2UgfCB1bmRlZmluZWQsIGk6IGFueSwgdmVjdG9yOiBjZy5OdW1iZXJQYWlyO1xuICBmb3IgKGkgaW4gcHJldlBpZWNlcykge1xuICAgIHByZVBpZWNlc1tpXSA9IG1ha2VQaWVjZShpIGFzIGNnLktleSwgcHJldlBpZWNlc1tpXSEpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIHV0aWwuYWxsS2V5cykge1xuICAgIGN1clAgPSBjdXJyZW50LnBpZWNlc1trZXldO1xuICAgIHByZVAgPSBwcmVQaWVjZXNba2V5XTtcbiAgICBpZiAoY3VyUCkge1xuICAgICAgaWYgKHByZVApIHtcbiAgICAgICAgaWYgKCF1dGlsLnNhbWVQaWVjZShjdXJQLCBwcmVQLnBpZWNlKSkge1xuICAgICAgICAgIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgfSBlbHNlIGlmIChwcmVQKSBtaXNzaW5ncy5wdXNoKHByZVApO1xuICB9XG4gIG5ld3MuZm9yRWFjaChuZXdQID0+IHtcbiAgICBwcmVQID0gY2xvc2VyKG5ld1AsIG1pc3NpbmdzLmZpbHRlcihwID0+IHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHAucGllY2UpKSk7XG4gICAgaWYgKHByZVApIHtcbiAgICAgIHZlY3RvciA9IFtwcmVQLnBvc1swXSAtIG5ld1AucG9zWzBdLCBwcmVQLnBvc1sxXSAtIG5ld1AucG9zWzFdXTtcbiAgICAgIGFuaW1zW25ld1Aua2V5XSA9IHZlY3Rvci5jb25jYXQodmVjdG9yKSBhcyBBbmltVmVjdG9yO1xuICAgICAgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgfVxuICB9KTtcbiAgbWlzc2luZ3MuZm9yRWFjaChwID0+IHtcbiAgICBpZiAoIXV0aWwuY29udGFpbnNYKGFuaW1lZE9yaWdzLCBwLmtleSkpIGZhZGluZ3NbcC5rZXldID0gcC5waWVjZTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBhbmltczogYW5pbXMsXG4gICAgZmFkaW5nczogZmFkaW5nc1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdGVwKHN0YXRlOiBTdGF0ZSwgbm93OiBET01IaWdoUmVzVGltZVN0YW1wKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50O1xuICBpZiAoY3VyID09PSB1bmRlZmluZWQpIHsgLy8gYW5pbWF0aW9uIHdhcyBjYW5jZWxlZCA6KFxuICAgIGlmICghc3RhdGUuZG9tLmRlc3Ryb3llZCkgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCByZXN0ID0gMSAtIChub3cgLSBjdXIuc3RhcnQpICogY3VyLmZyZXF1ZW5jeTtcbiAgaWYgKHJlc3QgPD0gMCkge1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBlYXNlID0gZWFzaW5nKHJlc3QpO1xuICAgIGZvciAobGV0IGkgaW4gY3VyLnBsYW4uYW5pbXMpIHtcbiAgICAgIGNvbnN0IGNmZyA9IGN1ci5wbGFuLmFuaW1zW2ldO1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogY2cuUGllY2VzID0gey4uLnN0YXRlLnBpZWNlc307XG5cbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBjb25zdCBwbGFuID0gY29tcHV0ZVBsYW4ocHJldlBpZWNlcywgc3RhdGUpO1xuICBpZiAoIWlzT2JqZWN0RW1wdHkocGxhbi5hbmltcykgfHwgIWlzT2JqZWN0RW1wdHkocGxhbi5mYWRpbmdzKSkge1xuICAgIGNvbnN0IGFscmVhZHlSdW5uaW5nID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgJiYgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQuc3RhcnQ7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB7XG4gICAgICBzdGFydDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICBmcmVxdWVuY3k6IDEgLyBzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24sXG4gICAgICBwbGFuOiBwbGFuXG4gICAgfTtcbiAgICBpZiAoIWFscmVhZHlSdW5uaW5nKSBzdGVwKHN0YXRlLCBwZXJmb3JtYW5jZS5ub3coKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gZG9uJ3QgYW5pbWF0ZSwganVzdCByZW5kZXIgcmlnaHQgYXdheVxuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc09iamVjdEVtcHR5KG86IGFueSk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBfIGluIG8pIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuZnVuY3Rpb24gZWFzaW5nKHQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyB3cml0ZSBhcyBmZW5Xcml0ZSB9IGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgQ29uZmlnLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IGFuaW0sIHJlbmRlciB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IGNhbmNlbCBhcyBkcmFnQ2FuY2VsLCBkcmFnTmV3UGllY2UgfSBmcm9tICcuL2RyYWcnXG5pbXBvcnQgeyBEcmF3U2hhcGUgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgZXhwbG9zaW9uIGZyb20gJy4vZXhwbG9zaW9uJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGludGVyZmFjZSBBcGkge1xuXG4gIC8vIHJlY29uZmlndXJlIHRoZSBpbnN0YW5jZS4gQWNjZXB0cyBhbGwgY29uZmlnIG9wdGlvbnMsIGV4Y2VwdCBmb3Igdmlld09ubHkgJiBkcmF3YWJsZS52aXNpYmxlLlxuICAvLyBib2FyZCB3aWxsIGJlIGFuaW1hdGVkIGFjY29yZGluZ2x5LCBpZiBhbmltYXRpb25zIGFyZSBlbmFibGVkLlxuICBzZXQoY29uZmlnOiBDb25maWcpOiB2b2lkO1xuXG4gIC8vIHJlYWQgY2hlc3Nncm91bmQgc3RhdGU7IHdyaXRlIGF0IHlvdXIgb3duIHJpc2tzLlxuICBzdGF0ZTogU3RhdGU7XG5cbiAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBhcyBhIEZFTiBzdHJpbmcgKG9ubHkgY29udGFpbnMgcGllY2VzLCBubyBmbGFncylcbiAgLy8gZS5nLiBybmJxa2Juci9wcHBwcHBwcC84LzgvOC84L1BQUFBQUFBQL1JOQlFLQk5SXG4gIGdldEZlbigpOiBjZy5GRU47XG5cbiAgLy8gY2hhbmdlIHRoZSB2aWV3IGFuZ2xlXG4gIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIG1vdmUgcHJvZ3JhbW1hdGljYWxseVxuICBtb3ZlKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogdm9pZDtcblxuICAvLyBhZGQgYW5kL29yIHJlbW92ZSBhcmJpdHJhcnkgcGllY2VzIG9uIHRoZSBib2FyZFxuICBzZXRQaWVjZXMocGllY2VzOiBjZy5QaWVjZXNEaWZmKTogdm9pZDtcblxuICAvLyBjbGljayBhIHNxdWFyZSBwcm9ncmFtbWF0aWNhbGx5XG4gIHNlbGVjdFNxdWFyZShrZXk6IGNnLktleSB8IG51bGwsIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcHV0IGEgbmV3IHBpZWNlIG9uIHRoZSBib2FyZFxuICBuZXdQaWVjZShwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5KTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlbW92ZSgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnlcbiAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVkcm9wKHZhbGlkYXRlOiAoZHJvcDogY2cuRHJvcCkgPT4gYm9vbGVhbik6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueVxuICBjYW5jZWxQcmVkcm9wKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IG1vdmUgYmVpbmcgbWFkZVxuICBjYW5jZWxNb3ZlKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIGN1cnJlbnQgbW92ZSBhbmQgcHJldmVudCBmdXJ0aGVyIG9uZXNcbiAgc3RvcCgpOiB2b2lkO1xuXG4gIC8vIG1ha2Ugc3F1YXJlcyBleHBsb2RlIChhdG9taWMgY2hlc3MpXG4gIGV4cGxvZGUoa2V5czogY2cuS2V5W10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyB1c2VyIHNoYXBlc1xuICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IGF1dG8gc2hhcGVzXG4gIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gc3F1YXJlIG5hbWUgYXQgdGhpcyBET00gcG9zaXRpb24gKGxpa2UgXCJlNFwiKVxuICBnZXRLZXlBdERvbVBvcyhwb3M6IGNnLk51bWJlclBhaXIpOiBjZy5LZXkgfCB1bmRlZmluZWQ7XG5cbiAgLy8gb25seSB1c2VmdWwgd2hlbiBDU1MgY2hhbmdlcyB0aGUgYm9hcmQgd2lkdGgvaGVpZ2h0IHJhdGlvIChmb3IgM0QpXG4gIHJlZHJhd0FsbDogY2cuUmVkcmF3O1xuXG4gIC8vIGZvciBjcmF6eWhvdXNlIGFuZCBib2FyZCBlZGl0b3JzXG4gIGRyYWdOZXdQaWVjZShwaWVjZTogY2cuUGllY2UsIGV2ZW50OiBjZy5Nb3VjaEV2ZW50LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHVuYmluZHMgYWxsIGV2ZW50c1xuICAvLyAoaW1wb3J0YW50IGZvciBkb2N1bWVudC13aWRlIGV2ZW50cyBsaWtlIHNjcm9sbCBhbmQgbW91c2Vtb3ZlKVxuICBkZXN0cm95OiBjZy5VbmJpbmRcbn1cblxuLy8gc2VlIEFQSSB0eXBlcyBhbmQgZG9jdW1lbnRhdGlvbnMgaW4gZHRzL2FwaS5kLnRzXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCByZWRyYXdBbGw6IGNnLlJlZHJhdyk6IEFwaSB7XG5cbiAgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oKSB7XG4gICAgYm9hcmQudG9nZ2xlT3JpZW50YXRpb24oc3RhdGUpO1xuICAgIHJlZHJhd0FsbCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG5cbiAgICBzZXQoY29uZmlnKSB7XG4gICAgICBpZiAoY29uZmlnLm9yaWVudGF0aW9uICYmIGNvbmZpZy5vcmllbnRhdGlvbiAhPT0gc3RhdGUub3JpZW50YXRpb24pIHRvZ2dsZU9yaWVudGF0aW9uKCk7XG4gICAgICAoY29uZmlnLmZlbiA/IGFuaW0gOiByZW5kZXIpKHN0YXRlID0+IGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzdGF0ZSxcblxuICAgIGdldEZlbjogKCkgPT4gZmVuV3JpdGUoc3RhdGUucGllY2VzKSxcblxuICAgIHRvZ2dsZU9yaWVudGF0aW9uLFxuXG4gICAgc2V0UGllY2VzKHBpZWNlcykge1xuICAgICAgYW5pbShzdGF0ZSA9PiBib2FyZC5zZXRQaWVjZXMoc3RhdGUsIHBpZWNlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2VsZWN0U3F1YXJlKGtleSwgZm9yY2UpIHtcbiAgICAgIGlmIChrZXkpIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBrZXksIGZvcmNlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1vdmUob3JpZywgZGVzdCkge1xuICAgICAgYW5pbShzdGF0ZSA9PiBib2FyZC5iYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgbmV3UGllY2UocGllY2UsIGtleSkge1xuICAgICAgYW5pbShzdGF0ZSA9PiBib2FyZC5iYXNlTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBrZXkpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHBsYXlQcmVtb3ZlKCkge1xuICAgICAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgICAgICBpZiAoYW5pbShib2FyZC5wbGF5UHJlbW92ZSwgc3RhdGUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gaWYgdGhlIHByZW1vdmUgY291bGRuJ3QgYmUgcGxheWVkLCByZWRyYXcgdG8gY2xlYXIgaXQgdXBcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBwbGF5UHJlZHJvcCh2YWxpZGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGJvYXJkLnBsYXlQcmVkcm9wKHN0YXRlLCB2YWxpZGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlbW92ZSgpIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZW1vdmUsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlZHJvcCgpIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZWRyb3AsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsTW92ZSgpIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiB7IGJvYXJkLmNhbmNlbE1vdmUoc3RhdGUpOyBkcmFnQ2FuY2VsKHN0YXRlKTsgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzdG9wKCkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHsgYm9hcmQuc3RvcChzdGF0ZSk7IGRyYWdDYW5jZWwoc3RhdGUpOyB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGV4cGxvZGUoa2V5czogY2cuS2V5W10pIHtcbiAgICAgIGV4cGxvc2lvbihzdGF0ZSwga2V5cyk7XG4gICAgfSxcblxuICAgIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBzaGFwZXMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZ2V0S2V5QXREb21Qb3MocG9zKSB7XG4gICAgICByZXR1cm4gYm9hcmQuZ2V0S2V5QXREb21Qb3MocG9zLCBib2FyZC53aGl0ZVBvdihzdGF0ZSksIHN0YXRlLmRvbS5ib3VuZHMoKSk7XG4gICAgfSxcblxuICAgIHJlZHJhd0FsbCxcblxuICAgIGRyYWdOZXdQaWVjZShwaWVjZSwgZXZlbnQsIGZvcmNlKSB7XG4gICAgICBkcmFnTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBldmVudCwgZm9yY2UpXG4gICAgfSxcblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgIHN0YXRlLmRvbS51bmJpbmQgJiYgc3RhdGUuZG9tLnVuYmluZCgpO1xuICAgICAgc3RhdGUuZG9tLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgcG9zMmtleSwga2V5MnBvcywgb3Bwb3NpdGUsIGNvbnRhaW5zWCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCBwcmVtb3ZlIGZyb20gJy4vcHJlbW92ZSdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCB0eXBlIENhbGxiYWNrID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbihmOiBDYWxsYmFjayB8IHVuZGVmaW5lZCwgLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgaWYgKGYpIHNldFRpbWVvdXQoKCkgPT4gZiguLi5hcmdzKSwgMSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbihzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUub3JpZW50YXRpb24gPSBvcHBvc2l0ZShzdGF0ZS5vcmllbnRhdGlvbik7XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID1cbiAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPVxuICBzdGF0ZS5zZWxlY3RlZCA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5sYXN0TW92ZSA9IHVuZGVmaW5lZDtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGllY2VzKHN0YXRlOiBTdGF0ZSwgcGllY2VzOiBjZy5QaWVjZXNEaWZmKTogdm9pZCB7XG4gIGZvciAobGV0IGtleSBpbiBwaWVjZXMpIHtcbiAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1trZXldO1xuICAgIGlmIChwaWVjZSkgc3RhdGUucGllY2VzW2tleV0gPSBwaWVjZTtcbiAgICBlbHNlIGRlbGV0ZSBzdGF0ZS5waWVjZXNba2V5XTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2hlY2soc3RhdGU6IFN0YXRlLCBjb2xvcjogY2cuQ29sb3IgfCBib29sZWFuKTogdm9pZCB7XG4gIHN0YXRlLmNoZWNrID0gdW5kZWZpbmVkO1xuICBpZiAoY29sb3IgPT09IHRydWUpIGNvbG9yID0gc3RhdGUudHVybkNvbG9yO1xuICBpZiAoY29sb3IpIGZvciAobGV0IGsgaW4gc3RhdGUucGllY2VzKSB7XG4gICAgaWYgKHN0YXRlLnBpZWNlc1trXSEucm9sZSA9PT0gJ2tpbmcnICYmIHN0YXRlLnBpZWNlc1trXSEuY29sb3IgPT09IGNvbG9yKSB7XG4gICAgICBzdGF0ZS5jaGVjayA9IGsgYXMgY2cuS2V5O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVtb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGE6IGNnLlNldFByZW1vdmVNZXRhZGF0YSk6IHZvaWQge1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSBbb3JpZywgZGVzdF07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlbW92YWJsZS5ldmVudHMuc2V0LCBvcmlnLCBkZXN0LCBtZXRhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0UHJlbW92ZShzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZW1vdmFibGUuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRQcmVkcm9wKHN0YXRlOiBTdGF0ZSwgcm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQgPSB7IHJvbGUsIGtleSB9O1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLnByZWRyb3BwYWJsZS5ldmVudHMuc2V0LCByb2xlLCBrZXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVkcm9wKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBwZCA9IHN0YXRlLnByZWRyb3BwYWJsZTtcbiAgaWYgKHBkLmN1cnJlbnQpIHtcbiAgICBwZC5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24ocGQuZXZlbnRzLnVuc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnlBdXRvQ2FzdGxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKCFzdGF0ZS5hdXRvQ2FzdGxlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGtpbmcgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIGlmICgha2luZyB8fCBraW5nLnJvbGUgIT09ICdraW5nJykgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBvcmlnUG9zID0ga2V5MnBvcyhvcmlnKTtcbiAgaWYgKG9yaWdQb3NbMF0gIT09IDUpIHJldHVybiBmYWxzZTtcbiAgaWYgKG9yaWdQb3NbMV0gIT09IDEgJiYgb3JpZ1Bvc1sxXSAhPT0gOCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBkZXN0UG9zID0ga2V5MnBvcyhkZXN0KTtcbiAgbGV0IG9sZFJvb2tQb3MsIG5ld1Jvb2tQb3MsIG5ld0tpbmdQb3M7XG4gIGlmIChkZXN0UG9zWzBdID09PSA3IHx8IGRlc3RQb3NbMF0gPT09IDgpIHtcbiAgICBvbGRSb29rUG9zID0gcG9zMmtleShbOCwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld1Jvb2tQb3MgPSBwb3Mya2V5KFs2LCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3S2luZ1BvcyA9IHBvczJrZXkoWzcsIG9yaWdQb3NbMV1dKTtcbiAgfSBlbHNlIGlmIChkZXN0UG9zWzBdID09PSAzIHx8IGRlc3RQb3NbMF0gPT09IDEpIHtcbiAgICBvbGRSb29rUG9zID0gcG9zMmtleShbMSwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld1Jvb2tQb3MgPSBwb3Mya2V5KFs0LCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3S2luZ1BvcyA9IHBvczJrZXkoWzMsIG9yaWdQb3NbMV1dKTtcbiAgfSBlbHNlIHJldHVybiBmYWxzZTtcblxuICBjb25zdCByb29rID0gc3RhdGUucGllY2VzW29sZFJvb2tQb3NdO1xuICBpZiAoIXJvb2sgfHwgcm9vay5yb2xlICE9PSAncm9vaycpIHJldHVybiBmYWxzZTtcblxuICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICBkZWxldGUgc3RhdGUucGllY2VzW29sZFJvb2tQb3NdO1xuXG4gIHN0YXRlLnBpZWNlc1tuZXdLaW5nUG9zXSA9IGtpbmdcbiAgc3RhdGUucGllY2VzW25ld1Jvb2tQb3NdID0gcm9vaztcbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogY2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3Qgb3JpZ1BpZWNlID0gc3RhdGUucGllY2VzW29yaWddLCBkZXN0UGllY2UgPSBzdGF0ZS5waWVjZXNbZGVzdF07XG4gIGlmIChvcmlnID09PSBkZXN0IHx8ICFvcmlnUGllY2UpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgY2FwdHVyZWQgPSAoZGVzdFBpZWNlICYmIGRlc3RQaWVjZS5jb2xvciAhPT0gb3JpZ1BpZWNlLmNvbG9yKSA/IGRlc3RQaWVjZSA6IHVuZGVmaW5lZDtcbiAgaWYgKGRlc3QgPT0gc3RhdGUuc2VsZWN0ZWQpIHVuc2VsZWN0KHN0YXRlKTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMubW92ZSwgb3JpZywgZGVzdCwgY2FwdHVyZWQpO1xuICBpZiAoIXRyeUF1dG9DYXN0bGUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc3RhdGUucGllY2VzW2Rlc3RdID0gb3JpZ1BpZWNlO1xuICAgIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIH1cbiAgc3RhdGUubGFzdE1vdmUgPSBbb3JpZywgZGVzdF07XG4gIHN0YXRlLmNoZWNrID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICByZXR1cm4gY2FwdHVyZWQgfHwgdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VOZXdQaWVjZShzdGF0ZTogU3RhdGUsIHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXksIGZvcmNlPzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICBpZiAoc3RhdGUucGllY2VzW2tleV0pIHtcbiAgICBpZiAoZm9yY2UpIGRlbGV0ZSBzdGF0ZS5waWVjZXNba2V5XTtcbiAgICBlbHNlIHJldHVybiBmYWxzZTtcbiAgfVxuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5kcm9wTmV3UGllY2UsIHBpZWNlLCBrZXkpO1xuICBzdGF0ZS5waWVjZXNba2V5XSA9IHBpZWNlO1xuICBzdGF0ZS5sYXN0TW92ZSA9IFtrZXldO1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGJhc2VVc2VyTW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogY2cuUGllY2UgfCBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS50dXJuQ29sb3IgPSBvcHBvc2l0ZShzdGF0ZS50dXJuQ29sb3IpO1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VyTW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc3QgaG9sZFRpbWUgPSBzdGF0ZS5ob2xkLnN0b3AoKTtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEgPSB7XG4gICAgICAgIHByZW1vdmU6IGZhbHNlLFxuICAgICAgICBjdHJsS2V5OiBzdGF0ZS5zdGF0cy5jdHJsS2V5LFxuICAgICAgICBob2xkVGltZVxuICAgICAgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc2V0UHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCwge1xuICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleVxuICAgIH0pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyb3BOZXdQaWVjZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKGNhbkRyb3Aoc3RhdGUsIG9yaWcsIGRlc3QpIHx8IGZvcmNlKSB7XG4gICAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ10hO1xuICAgIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gICAgYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZGVzdCwgZm9yY2UpO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXJOZXdQaWVjZSwgcGllY2Uucm9sZSwgZGVzdCwge1xuICAgICAgcHJlZHJvcDogZmFsc2VcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChjYW5QcmVkcm9wKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZWRyb3Aoc3RhdGUsIHN0YXRlLnBpZWNlc1tvcmlnXSEucm9sZSwgZGVzdCk7XG4gIH0gZWxzZSB7XG4gICAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB9XG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFNxdWFyZShzdGF0ZTogU3RhdGUsIGtleTogY2cuS2V5LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuc2VsZWN0LCBrZXkpO1xuICBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICBpZiAoc3RhdGUuc2VsZWN0ZWQgPT09IGtleSAmJiAhc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIHN0YXRlLmhvbGQuY2FuY2VsKCk7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICgoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJiBzdGF0ZS5zZWxlY3RlZCAhPT0ga2V5KSB7XG4gICAgICBpZiAodXNlck1vdmUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkLCBrZXkpKSB7XG4gICAgICAgIHN0YXRlLnN0YXRzLmRyYWdnZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoaXNNb3ZhYmxlKHN0YXRlLCBrZXkpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSkge1xuICAgIHNldFNlbGVjdGVkKHN0YXRlLCBrZXkpO1xuICAgIHN0YXRlLmhvbGQuc3RhcnQoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWQoc3RhdGU6IFN0YXRlLCBrZXk6IGNnLktleSk6IHZvaWQge1xuICBzdGF0ZS5zZWxlY3RlZCA9IGtleTtcbiAgaWYgKGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBwcmVtb3ZlKHN0YXRlLnBpZWNlcywga2V5LCBzdGF0ZS5wcmVtb3ZhYmxlLmNhc3RsZSk7XG4gIH1cbiAgZWxzZSBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZWxlY3Qoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5ob2xkLmNhbmNlbCgpO1xufVxuXG5mdW5jdGlvbiBpc01vdmFibGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvclxuICAgICkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuTW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiBvcmlnICE9PSBkZXN0ICYmIGlzTW92YWJsZShzdGF0ZSwgb3JpZykgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuZnJlZSB8fCAoISFzdGF0ZS5tb3ZhYmxlLmRlc3RzICYmIGNvbnRhaW5zWChzdGF0ZS5tb3ZhYmxlLmRlc3RzW29yaWddLCBkZXN0KSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2FuRHJvcChzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiBkZXN0ICYmIChvcmlnID09PSBkZXN0IHx8ICFzdGF0ZS5waWVjZXNbZGVzdF0pICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvclxuICAgICkpO1xufVxuXG5cbmZ1bmN0aW9uIGlzUHJlbW92YWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkICYmXG4gIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvcjtcbn1cblxuZnVuY3Rpb24gY2FuUHJlbW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiBvcmlnICE9PSBkZXN0ICYmXG4gIGlzUHJlbW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgY29udGFpbnNYKHByZW1vdmUoc3RhdGUucGllY2VzLCBvcmlnLCBzdGF0ZS5wcmVtb3ZhYmxlLmNhc3RsZSksIGRlc3QpO1xufVxuXG5mdW5jdGlvbiBjYW5QcmVkcm9wKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlc1tkZXN0XTtcbiAgcmV0dXJuICEhcGllY2UgJiYgZGVzdCAmJlxuICAoIWRlc3RQaWVjZSB8fCBkZXN0UGllY2UuY29sb3IgIT09IHN0YXRlLm1vdmFibGUuY29sb3IpICYmXG4gIHN0YXRlLnByZWRyb3BwYWJsZS5lbmFibGVkICYmXG4gIChwaWVjZS5yb2xlICE9PSAncGF3bicgfHwgKGRlc3RbMV0gIT09ICcxJyAmJiBkZXN0WzFdICE9PSAnOCcpKSAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RyYWdnYWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoXG4gICAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJiAoXG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IgfHwgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkXG4gICAgICApXG4gICAgKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZW1vdmUoc3RhdGU6IFN0YXRlKTogYm9vbGVhbiB7XG4gIGNvbnN0IG1vdmUgPSBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmICghbW92ZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBvcmlnID0gbW92ZVswXSwgZGVzdCA9IG1vdmVbMV07XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSA9IHsgcHJlbW92ZTogdHJ1ZSB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBtZXRhZGF0YSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlZHJvcChzdGF0ZTogU3RhdGUsIHZhbGlkYXRlOiAoZHJvcDogY2cuRHJvcCkgPT4gYm9vbGVhbik6IGJvb2xlYW4ge1xuICBsZXQgZHJvcCA9IHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50LFxuICBzdWNjZXNzID0gZmFsc2U7XG4gIGlmICghZHJvcCkgcmV0dXJuIGZhbHNlO1xuICBpZiAodmFsaWRhdGUoZHJvcCkpIHtcbiAgICBjb25zdCBwaWVjZSA9IHtcbiAgICAgIHJvbGU6IGRyb3Aucm9sZSxcbiAgICAgIGNvbG9yOiBzdGF0ZS5tb3ZhYmxlLmNvbG9yXG4gICAgfSBhcyBjZy5QaWVjZTtcbiAgICBpZiAoYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZHJvcC5rZXkpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyTmV3UGllY2UsIGRyb3Aucm9sZSwgZHJvcC5rZXksIHtcbiAgICAgICAgcHJlZHJvcDogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxNb3ZlKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID1cbiAgc3RhdGUubW92YWJsZS5kZXN0cyA9XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICBjYW5jZWxNb3ZlKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleUF0RG9tUG9zKHBvczogY2cuTnVtYmVyUGFpciwgYXNXaGl0ZTogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogY2cuS2V5IHwgdW5kZWZpbmVkIHtcbiAgbGV0IGZpbGUgPSBNYXRoLmNlaWwoOCAqICgocG9zWzBdIC0gYm91bmRzLmxlZnQpIC8gYm91bmRzLndpZHRoKSk7XG4gIGlmICghYXNXaGl0ZSkgZmlsZSA9IDkgLSBmaWxlO1xuICBsZXQgcmFuayA9IE1hdGguY2VpbCg4IC0gKDggKiAoKHBvc1sxXSAtIGJvdW5kcy50b3ApIC8gYm91bmRzLmhlaWdodCkpKTtcbiAgaWYgKCFhc1doaXRlKSByYW5rID0gOSAtIHJhbms7XG4gIHJldHVybiAoZmlsZSA+IDAgJiYgZmlsZSA8IDkgJiYgcmFuayA+IDAgJiYgcmFuayA8IDkpID8gcG9zMmtleShbZmlsZSwgcmFua10pIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2hpdGVQb3YoczogU3RhdGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIHMub3JpZW50YXRpb24gPT09ICd3aGl0ZSc7XG59XG4iLCJpbXBvcnQgeyBBcGksIHN0YXJ0IH0gZnJvbSAnLi9hcGknXG5pbXBvcnQgeyBDb25maWcsIGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHsgU3RhdGUsIGRlZmF1bHRzIH0gZnJvbSAnLi9zdGF0ZSdcblxuaW1wb3J0IHJlbmRlcldyYXAgZnJvbSAnLi93cmFwJztcbmltcG9ydCAqIGFzIGV2ZW50cyBmcm9tICcuL2V2ZW50cydcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xuaW1wb3J0ICogYXMgc3ZnIGZyb20gJy4vc3ZnJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIENoZXNzZ3JvdW5kKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBjb25maWc/OiBDb25maWcpOiBBcGkge1xuXG4gIGNvbnN0IHN0YXRlID0gZGVmYXVsdHMoKSBhcyBTdGF0ZTtcblxuICBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyB8fCB7fSk7XG5cbiAgZnVuY3Rpb24gcmVkcmF3QWxsKCkge1xuICAgIGxldCBwcmV2VW5iaW5kID0gc3RhdGUuZG9tICYmIHN0YXRlLmRvbS51bmJpbmQ7XG4gICAgLy8gY29tcHV0ZSBib3VuZHMgZnJvbSBleGlzdGluZyBib2FyZCBlbGVtZW50IGlmIHBvc3NpYmxlXG4gICAgLy8gdGhpcyBhbGxvd3Mgbm9uLXNxdWFyZSBib2FyZHMgZnJvbSBDU1MgdG8gYmUgaGFuZGxlZCAoZm9yIDNEKVxuICAgIGNvbnN0IHJlbGF0aXZlID0gc3RhdGUudmlld09ubHkgJiYgIXN0YXRlLmRyYXdhYmxlLnZpc2libGUsXG4gICAgZWxlbWVudHMgPSByZW5kZXJXcmFwKGVsZW1lbnQsIHN0YXRlLCByZWxhdGl2ZSksXG4gICAgYm91bmRzID0gdXRpbC5tZW1vKCgpID0+IGVsZW1lbnRzLmJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKSxcbiAgICByZWRyYXdOb3cgPSAoc2tpcFN2Zz86IGJvb2xlYW4pID0+IHtcbiAgICAgIHJlbmRlcihzdGF0ZSk7XG4gICAgICBpZiAoIXNraXBTdmcgJiYgZWxlbWVudHMuc3ZnKSBzdmcucmVuZGVyU3ZnKHN0YXRlLCBlbGVtZW50cy5zdmcpO1xuICAgIH07XG4gICAgc3RhdGUuZG9tID0ge1xuICAgICAgZWxlbWVudHMsXG4gICAgICBib3VuZHMsXG4gICAgICByZWRyYXc6IGRlYm91bmNlUmVkcmF3KHJlZHJhd05vdyksXG4gICAgICByZWRyYXdOb3csXG4gICAgICB1bmJpbmQ6IHByZXZVbmJpbmQsXG4gICAgICByZWxhdGl2ZVxuICAgIH07XG4gICAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSAnJztcbiAgICByZWRyYXdOb3coZmFsc2UpO1xuICAgIGV2ZW50cy5iaW5kQm9hcmQoc3RhdGUpO1xuICAgIGlmICghcHJldlVuYmluZCkgc3RhdGUuZG9tLnVuYmluZCA9IGV2ZW50cy5iaW5kRG9jdW1lbnQoc3RhdGUsIHJlZHJhd0FsbCk7XG4gICAgc3RhdGUuZXZlbnRzLmluc2VydCAmJiBzdGF0ZS5ldmVudHMuaW5zZXJ0KGVsZW1lbnRzKTtcbiAgfVxuICByZWRyYXdBbGwoKTtcblxuICByZXR1cm4gc3RhcnQoc3RhdGUsIHJlZHJhd0FsbCk7XG59O1xuXG5mdW5jdGlvbiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdOb3c6IChza2lwU3ZnPzogYm9vbGVhbikgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuICBsZXQgcmVkcmF3aW5nID0gZmFsc2U7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgaWYgKHJlZHJhd2luZykgcmV0dXJuO1xuICAgIHJlZHJhd2luZyA9IHRydWU7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIHJlZHJhd05vdygpO1xuICAgICAgcmVkcmF3aW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBzZXRDaGVjaywgc2V0U2VsZWN0ZWQgfSBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgcmVhZCBhcyBmZW5SZWFkIH0gZnJvbSAnLi9mZW4nXG5pbXBvcnQgeyBEcmF3U2hhcGUsIERyYXdCcnVzaCB9IGZyb20gJy4vZHJhdydcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcbiAgZmVuPzogY2cuRkVOOyAvLyBjaGVzcyBwb3NpdGlvbiBpbiBGb3JzeXRoIG5vdGF0aW9uXG4gIG9yaWVudGF0aW9uPzogY2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiB3aGl0ZSB8IGJsYWNrXG4gIHR1cm5Db2xvcj86IGNnLkNvbG9yOyAvLyB0dXJuIHRvIHBsYXkuIHdoaXRlIHwgYmxhY2tcbiAgY2hlY2s/OiBjZy5Db2xvciB8IGJvb2xlYW47IC8vIHRydWUgZm9yIGN1cnJlbnQgY29sb3IsIGZhbHNlIHRvIHVuc2V0XG4gIGxhc3RNb3ZlPzogY2cuS2V5W107IC8vIHNxdWFyZXMgcGFydCBvZiB0aGUgbGFzdCBtb3ZlIFtcImMzXCIsIFwiYzRcIl1cbiAgc2VsZWN0ZWQ/OiBjZy5LZXk7IC8vIHNxdWFyZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCJhMVwiXG4gIGNvb3JkaW5hdGVzPzogYm9vbGVhbjsgLy8gaW5jbHVkZSBjb29yZHMgYXR0cmlidXRlc1xuICBhdXRvQ2FzdGxlPzogYm9vbGVhbjsgLy8gaW1tZWRpYXRlbHkgY29tcGxldGUgdGhlIGNhc3RsZSBieSBtb3ZpbmcgdGhlIHJvb2sgYWZ0ZXIga2luZyBtb3ZlXG4gIHZpZXdPbmx5PzogYm9vbGVhbjsgLy8gZG9uJ3QgYmluZCBldmVudHM6IHRoZSB1c2VyIHdpbGwgbmV2ZXIgYmUgYWJsZSB0byBtb3ZlIHBpZWNlcyBhcm91bmRcbiAgZGlzYWJsZUNvbnRleHRNZW51PzogYm9vbGVhbjsgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBjaGVzc2JvYXJkXG4gIHJlc2l6YWJsZT86IGJvb2xlYW47IC8vIGxpc3RlbnMgdG8gY2hlc3Nncm91bmQucmVzaXplIG9uIGRvY3VtZW50LmJvZHkgdG8gY2xlYXIgYm91bmRzIGNhY2hlXG4gIGFkZFBpZWNlWkluZGV4PzogYm9vbGVhbjsgLy8gYWRkcyB6LWluZGV4IHZhbHVlcyB0byBwaWVjZXMgKGZvciAzRClcbiAgLy8gcGllY2VLZXk6IGJvb2xlYW47IC8vIGFkZCBhIGRhdGEta2V5IGF0dHJpYnV0ZSB0byBwaWVjZSBlbGVtZW50c1xuICBoaWdobGlnaHQ/OiB7XG4gICAgbGFzdE1vdmU/OiBib29sZWFuOyAvLyBhZGQgbGFzdC1tb3ZlIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjaz86IGJvb2xlYW47IC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gIH07XG4gIGFuaW1hdGlvbj86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjtcbiAgICBkdXJhdGlvbj86IG51bWJlcjtcbiAgfTtcbiAgbW92YWJsZT86IHtcbiAgICBmcmVlPzogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGNvbG9yPzogY2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUuIHdoaXRlIHwgYmxhY2sgfCBib3RoIHwgdW5kZWZpbmVkXG4gICAgZGVzdHM/OiB7XG4gICAgICBba2V5OiBzdHJpbmddOiBjZy5LZXlbXVxuICAgIH07IC8vIHZhbGlkIG1vdmVzLiB7XCJhMlwiIFtcImEzXCIgXCJhNFwiXSBcImIxXCIgW1wiYTNcIiBcImMzXCJdfVxuICAgIHNob3dEZXN0cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWRkIHRoZSBtb3ZlLWRlc3QgY2xhc3Mgb24gc3F1YXJlc1xuICAgIGV2ZW50cz86IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgICBhZnRlck5ld1BpZWNlPzogKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5LCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgYSBuZXcgcGllY2UgaXMgZHJvcHBlZCBvbiB0aGUgYm9hcmRcbiAgICB9O1xuICAgIHJvb2tDYXN0bGU/OiBib29sZWFuIC8vIGNhc3RsZSBieSBtb3ZpbmcgdGhlIGtpbmcgdG8gdGhlIHJvb2tcbiAgfTtcbiAgcHJlbW92YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgcHJlbW92ZXMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZW1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgY2FzdGxlPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhbGxvdyBraW5nIGNhc3RsZSBwcmVtb3Zlc1xuICAgIGRlc3RzPzogY2cuS2V5W107IC8vIHByZW1vdmUgZGVzdGluYXRpb25zIGZvciB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhPzogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7ICAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIHByZWRyb3BwYWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgZXZlbnRzPzoge1xuICAgICAgc2V0PzogKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgZHJhZ2dhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlPzogbnVtYmVyOyAvLyBtaW5pbXVtIGRpc3RhbmNlIHRvIGluaXRpYXRlIGEgZHJhZzsgaW4gcGl4ZWxzXG4gICAgYXV0b0Rpc3RhbmNlPzogYm9vbGVhbjsgLy8gbGV0cyBjaGVzc2dyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgY2VudGVyUGllY2U/OiBib29sZWFuOyAvLyBjZW50ZXIgdGhlIHBpZWNlIG9uIGN1cnNvciBhdCBkcmFnIHN0YXJ0XG4gICAgc2hvd0dob3N0PzogYm9vbGVhbjsgLy8gc2hvdyBnaG9zdCBvZiBwaWVjZSBiZWluZyBkcmFnZ2VkXG4gICAgZGVsZXRlT25Ecm9wT2ZmPzogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmRcbiAgfTtcbiAgc2VsZWN0YWJsZT86IHtcbiAgICAvLyBkaXNhYmxlIHRvIGVuZm9yY2UgZHJhZ2dpbmcgb3ZlciBjbGljay1jbGljayBtb3ZlXG4gICAgZW5hYmxlZD86IGJvb2xlYW5cbiAgfTtcbiAgZXZlbnRzPzoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgLy8gY2FsbGVkIGFmdGVyIGEgcGllY2UgaGFzIGJlZW4gbW92ZWQuXG4gICAgLy8gY2FwdHVyZWRQaWVjZSBpcyB1bmRlZmluZWQgb3IgbGlrZSB7Y29sb3I6ICd3aGl0ZSc7ICdyb2xlJzogJ3F1ZWVuJ31cbiAgICBtb3ZlPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBjYXB0dXJlZFBpZWNlPzogY2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcE5ld1BpZWNlPzogKHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogY2cuS2V5KSA9PiB2b2lkOyAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIGluc2VydD86IChlbGVtZW50czogY2cuRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gICAgdmlzaWJsZT86IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gICAgZXJhc2VPbkNsaWNrPzogYm9vbGVhbjtcbiAgICBzaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBhdXRvU2hhcGVzPzogRHJhd1NoYXBlW107XG4gICAgYnJ1c2hlcz86IERyYXdCcnVzaFtdO1xuICAgIHBpZWNlcz86IHtcbiAgICAgIGJhc2VVcmw/OiBzdHJpbmc7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGU6IFN0YXRlLCBjb25maWc6IENvbmZpZykge1xuXG4gIC8vIGRvbid0IG1lcmdlIGRlc3RpbmF0aW9ucy4gSnVzdCBvdmVycmlkZS5cbiAgaWYgKGNvbmZpZy5tb3ZhYmxlICYmIGNvbmZpZy5tb3ZhYmxlLmRlc3RzKSBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuXG4gIG1lcmdlKHN0YXRlLCBjb25maWcpO1xuXG4gIC8vIGlmIGEgZmVuIHdhcyBwcm92aWRlZCwgcmVwbGFjZSB0aGUgcGllY2VzXG4gIGlmIChjb25maWcuZmVuKSB7XG4gICAgc3RhdGUucGllY2VzID0gZmVuUmVhZChjb25maWcuZmVuKTtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgfVxuXG4gIC8vIGFwcGx5IGNvbmZpZyB2YWx1ZXMgdGhhdCBjb3VsZCBiZSB1bmRlZmluZWQgeWV0IG1lYW5pbmdmdWxcbiAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgnY2hlY2snKSkgc2V0Q2hlY2soc3RhdGUsIGNvbmZpZy5jaGVjayB8fCBmYWxzZSk7XG4gIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkoJ2xhc3RNb3ZlJykgJiYgIWNvbmZpZy5sYXN0TW92ZSkgc3RhdGUubGFzdE1vdmUgPSB1bmRlZmluZWQ7XG4gIC8vIGluIGNhc2Ugb2YgWkggZHJvcCBsYXN0IG1vdmUsIHRoZXJlJ3MgYSBzaW5nbGUgc3F1YXJlLlxuICAvLyBpZiB0aGUgcHJldmlvdXMgbGFzdCBtb3ZlIGhhZCB0d28gc3F1YXJlcyxcbiAgLy8gdGhlIG1lcmdlIGFsZ29yaXRobSB3aWxsIGluY29ycmVjdGx5IGtlZXAgdGhlIHNlY29uZCBzcXVhcmUuXG4gIGVsc2UgaWYgKGNvbmZpZy5sYXN0TW92ZSkgc3RhdGUubGFzdE1vdmUgPSBjb25maWcubGFzdE1vdmU7XG5cbiAgLy8gZml4IG1vdmUvcHJlbW92ZSBkZXN0c1xuICBpZiAoc3RhdGUuc2VsZWN0ZWQpIHNldFNlbGVjdGVkKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCk7XG5cbiAgLy8gbm8gbmVlZCBmb3Igc3VjaCBzaG9ydCBhbmltYXRpb25zXG4gIGlmICghc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uIHx8IHN0YXRlLmFuaW1hdGlvbi5kdXJhdGlvbiA8IDEwMCkgc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPSBmYWxzZTtcblxuICBpZiAoIXN0YXRlLm1vdmFibGUucm9va0Nhc3RsZSAmJiBzdGF0ZS5tb3ZhYmxlLmRlc3RzKSB7XG4gICAgY29uc3QgcmFuayA9IHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICd3aGl0ZScgPyAxIDogOCxcbiAgICBraW5nU3RhcnRQb3MgPSAnZScgKyByYW5rLFxuICAgIGRlc3RzID0gc3RhdGUubW92YWJsZS5kZXN0c1traW5nU3RhcnRQb3NdLFxuICAgIGtpbmcgPSBzdGF0ZS5waWVjZXNba2luZ1N0YXJ0UG9zXTtcbiAgICBpZiAoIWRlc3RzIHx8ICFraW5nIHx8IGtpbmcucm9sZSAhPT0gJ2tpbmcnKSByZXR1cm47XG4gICAgc3RhdGUubW92YWJsZS5kZXN0c1traW5nU3RhcnRQb3NdID0gZGVzdHMuZmlsdGVyKGQgPT5cbiAgICAgICEoKGQgPT09ICdhJyArIHJhbmspICYmIGRlc3RzLmluZGV4T2YoJ2MnICsgcmFuayBhcyBjZy5LZXkpICE9PSAtMSkgJiZcbiAgICAgICAgISgoZCA9PT0gJ2gnICsgcmFuaykgJiYgZGVzdHMuaW5kZXhPZignZycgKyByYW5rIGFzIGNnLktleSkgIT09IC0xKVxuICAgICk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1lcmdlKGJhc2U6IGFueSwgZXh0ZW5kOiBhbnkpIHtcbiAgZm9yIChsZXQga2V5IGluIGV4dGVuZCkge1xuICAgIGlmIChpc09iamVjdChiYXNlW2tleV0pICYmIGlzT2JqZWN0KGV4dGVuZFtrZXldKSkgbWVyZ2UoYmFzZVtrZXldLCBleHRlbmRba2V5XSk7XG4gICAgZWxzZSBiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc09iamVjdChvOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0Jztcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGNsZWFyIGFzIGRyYXdDbGVhciB9IGZyb20gJy4vZHJhdydcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyBhbmltIH0gZnJvbSAnLi9hbmltJ1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdDdXJyZW50IHtcbiAgb3JpZzogY2cuS2V5OyAvLyBvcmlnIGtleSBvZiBkcmFnZ2luZyBwaWVjZVxuICBvcmlnUG9zOiBjZy5Qb3M7XG4gIHBpZWNlOiBjZy5QaWVjZTtcbiAgcmVsOiBjZy5OdW1iZXJQYWlyOyAvLyB4OyB5IG9mIHRoZSBwaWVjZSBhdCBvcmlnaW5hbCBwb3NpdGlvblxuICBlcG9zOiBjZy5OdW1iZXJQYWlyOyAvLyBpbml0aWFsIGV2ZW50IHBvc2l0aW9uXG4gIHBvczogY2cuTnVtYmVyUGFpcjsgLy8gcmVsYXRpdmUgY3VycmVudCBwb3NpdGlvblxuICBkZWM6IGNnLk51bWJlclBhaXI7IC8vIHBpZWNlIGNlbnRlciBkZWNheVxuICBzdGFydGVkOiBib29sZWFuOyAvLyB3aGV0aGVyIHRoZSBkcmFnIGhhcyBzdGFydGVkOyBhcyBwZXIgdGhlIGRpc3RhbmNlIHNldHRpbmdcbiAgZWxlbWVudDogY2cuUGllY2VOb2RlIHwgKCgpID0+IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCk7XG4gIG5ld1BpZWNlPzogYm9vbGVhbjsgLy8gaXQgaXQgYSBuZXcgcGllY2UgZnJvbSBvdXRzaWRlIHRoZSBib2FyZFxuICBmb3JjZT86IGJvb2xlYW47IC8vIGNhbiB0aGUgbmV3IHBpZWNlIHJlcGxhY2UgYW4gZXhpc3Rpbmcgb25lIChlZGl0b3IpXG4gIHByZXZpb3VzbHlTZWxlY3RlZD86IGNnLktleTtcbiAgb3JpZ2luVGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuOyAvLyBvbmx5IHRvdWNoIG9yIGxlZnQgY2xpY2tcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuOyAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcixcbiAgb3JpZyA9IGJvYXJkLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCBib2FyZC53aGl0ZVBvdihzKSwgYm91bmRzKTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIGNvbnN0IHBpZWNlID0gcy5waWVjZXNbb3JpZ107XG4gIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZCA9IHMuc2VsZWN0ZWQ7XG4gIGlmICghcHJldmlvdXNseVNlbGVjdGVkICYmIHMuZHJhd2FibGUuZW5hYmxlZCAmJiAoXG4gICAgcy5kcmF3YWJsZS5lcmFzZU9uQ2xpY2sgfHwgKCFwaWVjZSB8fCBwaWVjZS5jb2xvciAhPT0gcy50dXJuQ29sb3IpXG4gICkpIGRyYXdDbGVhcihzKTtcbiAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAvLyBpcyBhbiBpbnRlbnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgYm9hcmQuIElmIG5vIGNvbG9yIGlzIG1vdmFibGVcbiAgLy8gKGFuZCB0aGUgYm9hcmQgaXMgbm90IGZvciB2aWV3aW5nIG9ubHkpLCB0b3VjaGVzIGFyZSBsaWtlbHkgaW50ZW5kZWQgdG9cbiAgLy8gc2VsZWN0IHNxdWFyZXMuXG4gIGlmIChlLmNhbmNlbGFibGUgIT09IGZhbHNlICYmXG4gICAgICAoIWUudG91Y2hlcyB8fCAhcy5tb3ZhYmxlLmNvbG9yIHx8IHBpZWNlIHx8IHByZXZpb3VzbHlTZWxlY3RlZCB8fCBwaWVjZUNsb3NlVG8ocywgcG9zaXRpb24pKSlcbiAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IGhhZFByZW1vdmUgPSAhIXMucHJlbW92YWJsZS5jdXJyZW50O1xuICBjb25zdCBoYWRQcmVkcm9wID0gISFzLnByZWRyb3BwYWJsZS5jdXJyZW50O1xuICBzLnN0YXRzLmN0cmxLZXkgPSBlLmN0cmxLZXk7XG4gIGlmIChzLnNlbGVjdGVkICYmIGJvYXJkLmNhbk1vdmUocywgcy5zZWxlY3RlZCwgb3JpZykpIHtcbiAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICB9IGVsc2Uge1xuICAgIGJvYXJkLnNlbGVjdFNxdWFyZShzLCBvcmlnKTtcbiAgfVxuICBjb25zdCBzdGlsbFNlbGVjdGVkID0gcy5zZWxlY3RlZCA9PT0gb3JpZztcbiAgY29uc3QgZWxlbWVudCA9IHBpZWNlRWxlbWVudEJ5S2V5KHMsIG9yaWcpO1xuICBpZiAocGllY2UgJiYgZWxlbWVudCAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKHMsIG9yaWcpKSB7XG4gICAgY29uc3Qgc3F1YXJlQm91bmRzID0gY29tcHV0ZVNxdWFyZUJvdW5kcyhvcmlnLCBib2FyZC53aGl0ZVBvdihzKSwgYm91bmRzKTtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgb3JpZyxcbiAgICAgIG9yaWdQb3M6IHV0aWwua2V5MnBvcyhvcmlnKSxcbiAgICAgIHBpZWNlLFxuICAgICAgcmVsOiBwb3NpdGlvbixcbiAgICAgIGVwb3M6IHBvc2l0aW9uLFxuICAgICAgcG9zOiBbMCwgMF0sXG4gICAgICBkZWM6IHMuZHJhZ2dhYmxlLmNlbnRlclBpZWNlID8gW1xuICAgICAgICBwb3NpdGlvblswXSAtIChzcXVhcmVCb3VuZHMubGVmdCArIHNxdWFyZUJvdW5kcy53aWR0aCAvIDIpLFxuICAgICAgICBwb3NpdGlvblsxXSAtIChzcXVhcmVCb3VuZHMudG9wICsgc3F1YXJlQm91bmRzLmhlaWdodCAvIDIpXG4gICAgICBdIDogWzAsIDBdLFxuICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmIHMuc3RhdHMuZHJhZ2dlZCxcbiAgICAgIGVsZW1lbnQsXG4gICAgICBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0XG4gICAgfTtcbiAgICBlbGVtZW50LmNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcbiAgICAvLyBwbGFjZSBnaG9zdFxuICAgIGNvbnN0IGdob3N0ID0gcy5kb20uZWxlbWVudHMuZ2hvc3Q7XG4gICAgaWYgKGdob3N0KSB7XG4gICAgICBnaG9zdC5jbGFzc05hbWUgPSBgZ2hvc3QgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG4gICAgICB1dGlsLnRyYW5zbGF0ZUFicyhnaG9zdCwgdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhib3VuZHMpKHV0aWwua2V5MnBvcyhvcmlnKSwgYm9hcmQud2hpdGVQb3YocykpKTtcbiAgICAgIHV0aWwuc2V0VmlzaWJsZShnaG9zdCwgdHJ1ZSk7XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBjZy5OdW1iZXJQYWlyKTogYm9vbGVhbiB7XG4gIGNvbnN0IGFzV2hpdGUgPSBib2FyZC53aGl0ZVBvdihzKSxcbiAgYm91bmRzID0gcy5kb20uYm91bmRzKCksXG4gIHJhZGl1c1NxID0gTWF0aC5wb3coYm91bmRzLndpZHRoIC8gOCwgMik7XG4gIGZvciAobGV0IGtleSBpbiBzLnBpZWNlcykge1xuICAgIGNvbnN0IHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMoa2V5IGFzIGNnLktleSwgYXNXaGl0ZSwgYm91bmRzKSxcbiAgICBjZW50ZXI6IGNnLk51bWJlclBhaXIgPSBbXG4gICAgICBzcXVhcmVCb3VuZHMubGVmdCArIHNxdWFyZUJvdW5kcy53aWR0aCAvIDIsXG4gICAgICBzcXVhcmVCb3VuZHMudG9wICsgc3F1YXJlQm91bmRzLmhlaWdodCAvIDJcbiAgICBdO1xuICAgIGlmICh1dGlsLmRpc3RhbmNlU3EoY2VudGVyLCBwb3MpIDw9IHJhZGl1c1NxKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmFnTmV3UGllY2UoczogU3RhdGUsIHBpZWNlOiBjZy5QaWVjZSwgZTogY2cuTW91Y2hFdmVudCwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG5cbiAgY29uc3Qga2V5OiBjZy5LZXkgPSAnYTAnO1xuXG4gIHMucGllY2VzW2tleV0gPSBwaWVjZTtcblxuICBzLmRvbS5yZWRyYXcoKTtcblxuICBjb25zdCBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyLFxuICBhc1doaXRlID0gYm9hcmQud2hpdGVQb3YocyksXG4gIGJvdW5kcyA9IHMuZG9tLmJvdW5kcygpLFxuICBzcXVhcmVCb3VuZHMgPSBjb21wdXRlU3F1YXJlQm91bmRzKGtleSwgYXNXaGl0ZSwgYm91bmRzKTtcblxuICBjb25zdCByZWw6IGNnLk51bWJlclBhaXIgPSBbXG4gICAgKGFzV2hpdGUgPyAwIDogNykgKiBzcXVhcmVCb3VuZHMud2lkdGggKyBib3VuZHMubGVmdCxcbiAgICAoYXNXaGl0ZSA/IDggOiAtMSkgKiBzcXVhcmVCb3VuZHMuaGVpZ2h0ICsgYm91bmRzLnRvcFxuICBdO1xuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZzoga2V5LFxuICAgIG9yaWdQb3M6IHV0aWwua2V5MnBvcyhrZXkpLFxuICAgIHBpZWNlLFxuICAgIHJlbCxcbiAgICBlcG9zOiBwb3NpdGlvbixcbiAgICBwb3M6IFtwb3NpdGlvblswXSAtIHJlbFswXSwgcG9zaXRpb25bMV0gLSByZWxbMV1dLFxuICAgIGRlYzogWy1zcXVhcmVCb3VuZHMud2lkdGggLyAyLCAtc3F1YXJlQm91bmRzLmhlaWdodCAvIDJdLFxuICAgIHN0YXJ0ZWQ6IHRydWUsXG4gICAgZWxlbWVudDogKCkgPT4gcGllY2VFbGVtZW50QnlLZXkocywga2V5KSxcbiAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0LFxuICAgIG5ld1BpZWNlOiB0cnVlLFxuICAgIGZvcmNlOiAhIWZvcmNlXG4gIH07XG4gIHByb2Nlc3NEcmFnKHMpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhZyhzOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKCFjdXIpIHJldHVybjtcbiAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgIGlmIChzLmFuaW1hdGlvbi5jdXJyZW50ICYmIHMuYW5pbWF0aW9uLmN1cnJlbnQucGxhbi5hbmltc1tjdXIub3JpZ10pIHMuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgLy8gaWYgbW92aW5nIHBpZWNlIGlzIGdvbmUsIGNhbmNlbFxuICAgIGNvbnN0IG9yaWdQaWVjZSA9IHMucGllY2VzW2N1ci5vcmlnXTtcbiAgICBpZiAoIW9yaWdQaWVjZSB8fCAhdXRpbC5zYW1lUGllY2Uob3JpZ1BpZWNlLCBjdXIucGllY2UpKSBjYW5jZWwocyk7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoIWN1ci5zdGFydGVkICYmIHV0aWwuZGlzdGFuY2VTcShjdXIuZXBvcywgY3VyLnJlbCkgPj0gTWF0aC5wb3cocy5kcmFnZ2FibGUuZGlzdGFuY2UsIDIpKSBjdXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICBpZiAoY3VyLnN0YXJ0ZWQpIHtcblxuICAgICAgICAvLyBzdXBwb3J0IGxhenkgZWxlbWVudHNcbiAgICAgICAgaWYgKHR5cGVvZiBjdXIuZWxlbWVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnN0IGZvdW5kID0gY3VyLmVsZW1lbnQoKTtcbiAgICAgICAgICBpZiAoIWZvdW5kKSByZXR1cm47XG4gICAgICAgICAgZm91bmQuY2dEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgICAgZm91bmQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcbiAgICAgICAgICBjdXIuZWxlbWVudCA9IGZvdW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VyLnBvcyA9IFtcbiAgICAgICAgICBjdXIuZXBvc1swXSAtIGN1ci5yZWxbMF0sXG4gICAgICAgICAgY3VyLmVwb3NbMV0gLSBjdXIucmVsWzFdXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gbW92ZSBwaWVjZVxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHV0aWwucG9zVG9UcmFuc2xhdGVBYnMocy5kb20uYm91bmRzKCkpKGN1ci5vcmlnUG9zLCBib2FyZC53aGl0ZVBvdihzKSk7XG4gICAgICAgIHRyYW5zbGF0aW9uWzBdICs9IGN1ci5wb3NbMF0gKyBjdXIuZGVjWzBdO1xuICAgICAgICB0cmFuc2xhdGlvblsxXSArPSBjdXIucG9zWzFdICsgY3VyLmRlY1sxXTtcbiAgICAgICAgdXRpbC50cmFuc2xhdGVBYnMoY3VyLmVsZW1lbnQsIHRyYW5zbGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcHJvY2Vzc0RyYWcocyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCAmJiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMikpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50LmVwb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHM6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIC8vIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgZS5jYW5jZWxhYmxlICE9PSBmYWxzZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyBjb21wYXJpbmcgd2l0aCB0aGUgb3JpZ2luIHRhcmdldCBpcyBhbiBlYXN5IHdheSB0byB0ZXN0IHRoYXQgdGhlIGVuZCBldmVudFxuICAvLyBoYXMgdGhlIHNhbWUgdG91Y2ggb3JpZ2luXG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgY3VyICYmIGN1ci5vcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0ICYmICFjdXIubmV3UGllY2UpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybjtcbiAgfVxuICBib2FyZC51bnNldFByZW1vdmUocyk7XG4gIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uOyBzbyB1c2UgdGhlIGxhc3QgdG91Y2htb3ZlIHBvc2l0aW9uIGluc3RlYWRcbiAgY29uc3QgZXZlbnRQb3M6IGNnLk51bWJlclBhaXIgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgfHwgY3VyLmVwb3M7XG4gIGNvbnN0IGRlc3QgPSBib2FyZC5nZXRLZXlBdERvbVBvcyhldmVudFBvcywgYm9hcmQud2hpdGVQb3YocyksIHMuZG9tLmJvdW5kcygpKTtcbiAgaWYgKGRlc3QgJiYgY3VyLnN0YXJ0ZWQgJiYgY3VyLm9yaWcgIT09IGRlc3QpIHtcbiAgICBpZiAoY3VyLm5ld1BpZWNlKSBib2FyZC5kcm9wTmV3UGllY2UocywgY3VyLm9yaWcsIGRlc3QsIGN1ci5mb3JjZSk7XG4gICAgZWxzZSB7XG4gICAgICBzLnN0YXRzLmN0cmxLZXkgPSBlLmN0cmxLZXk7XG4gICAgICBpZiAoYm9hcmQudXNlck1vdmUocywgY3VyLm9yaWcsIGRlc3QpKSBzLnN0YXRzLmRyYWdnZWQgPSB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjdXIubmV3UGllY2UpIHtcbiAgICBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICB9IGVsc2UgaWYgKHMuZHJhZ2dhYmxlLmRlbGV0ZU9uRHJvcE9mZiAmJiAhZGVzdCkge1xuICAgIGRlbGV0ZSBzLnBpZWNlc1tjdXIub3JpZ107XG4gICAgYm9hcmQuY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy5jaGFuZ2UpO1xuICB9XG4gIGlmIChjdXIgJiYgY3VyLm9yaWcgPT09IGN1ci5wcmV2aW91c2x5U2VsZWN0ZWQgJiYgKGN1ci5vcmlnID09PSBkZXN0IHx8ICFkZXN0KSlcbiAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgZWxzZSBpZiAoIXMuc2VsZWN0YWJsZS5lbmFibGVkKSBib2FyZC51bnNlbGVjdChzKTtcblxuICByZW1vdmVEcmFnRWxlbWVudHMocyk7XG5cbiAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoczogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgaWYgKGN1cikge1xuICAgIGlmIChjdXIubmV3UGllY2UpIGRlbGV0ZSBzLnBpZWNlc1tjdXIub3JpZ107XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICByZW1vdmVEcmFnRWxlbWVudHMocyk7XG4gICAgcy5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlRHJhZ0VsZW1lbnRzKHM6IFN0YXRlKSB7XG4gIGNvbnN0IGUgPSBzLmRvbS5lbGVtZW50cztcbiAgaWYgKGUuZ2hvc3QpIHV0aWwuc2V0VmlzaWJsZShlLmdob3N0LCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVCb3VuZHMoa2V5OiBjZy5LZXksIGFzV2hpdGU6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCkge1xuICBjb25zdCBwb3MgPSB1dGlsLmtleTJwb3Moa2V5KTtcbiAgaWYgKCFhc1doaXRlKSB7XG4gICAgcG9zWzBdID0gOSAtIHBvc1swXTtcbiAgICBwb3NbMV0gPSA5IC0gcG9zWzFdO1xuICB9XG4gIHJldHVybiB7XG4gICAgbGVmdDogYm91bmRzLmxlZnQgKyBib3VuZHMud2lkdGggKiAocG9zWzBdIC0gMSkgLyA4LFxuICAgIHRvcDogYm91bmRzLnRvcCArIGJvdW5kcy5oZWlnaHQgKiAoOCAtIHBvc1sxXSkgLyA4LFxuICAgIHdpZHRoOiBib3VuZHMud2lkdGggLyA4LFxuICAgIGhlaWdodDogYm91bmRzLmhlaWdodCAvIDhcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGllY2VFbGVtZW50QnlLZXkoczogU3RhdGUsIGtleTogY2cuS2V5KTogY2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkIHtcbiAgbGV0IGVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQuZmlyc3RDaGlsZCBhcyBjZy5QaWVjZU5vZGU7XG4gIHdoaWxlIChlbCkge1xuICAgIGlmIChlbC5jZ0tleSA9PT0ga2V5ICYmIGVsLnRhZ05hbWUgPT09ICdQSUVDRScpIHJldHVybiBlbDtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIGNnLlBpZWNlTm9kZTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgdW5zZWxlY3QsIGNhbmNlbE1vdmUsIGdldEtleUF0RG9tUG9zLCB3aGl0ZVBvdiB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyBldmVudFBvc2l0aW9uLCBpc1JpZ2h0QnV0dG9uIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGUge1xuICBvcmlnOiBjZy5LZXk7XG4gIGRlc3Q/OiBjZy5LZXk7XG4gIGJydXNoOiBzdHJpbmc7XG4gIG1vZGlmaWVycz86IERyYXdNb2RpZmllcnM7XG4gIHBpZWNlPzogRHJhd1NoYXBlUGllY2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlUGllY2Uge1xuICByb2xlOiBjZy5Sb2xlO1xuICBjb2xvcjogY2cuQ29sb3I7XG4gIHNjYWxlPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdCcnVzaCB7XG4gIGtleTogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICBvcGFjaXR5OiBudW1iZXI7XG4gIGxpbmVXaWR0aDogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0JydXNoZXMge1xuICBbbmFtZTogc3RyaW5nXTogRHJhd0JydXNoO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdNb2RpZmllcnMge1xuICBsaW5lV2lkdGg/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd2FibGUge1xuICBlbmFibGVkOiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICB2aXNpYmxlOiBib29sZWFuOyAvLyBjYW4gdmlld1xuICBlcmFzZU9uQ2xpY2s6IGJvb2xlYW47XG4gIG9uQ2hhbmdlPzogKHNoYXBlczogRHJhd1NoYXBlW10pID0+IHZvaWQ7XG4gIHNoYXBlczogRHJhd1NoYXBlW107IC8vIHVzZXIgc2hhcGVzXG4gIGF1dG9TaGFwZXM6IERyYXdTaGFwZVtdOyAvLyBjb21wdXRlciBzaGFwZXNcbiAgY3VycmVudD86IERyYXdDdXJyZW50O1xuICBicnVzaGVzOiBEcmF3QnJ1c2hlcztcbiAgLy8gZHJhd2FibGUgU1ZHIHBpZWNlczsgdXNlZCBmb3IgY3Jhenlob3VzZSBkcm9wXG4gIHBpZWNlczoge1xuICAgIGJhc2VVcmw6IHN0cmluZ1xuICB9LFxuICBwcmV2U3ZnSGFzaDogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0N1cnJlbnQge1xuICBvcmlnOiBjZy5LZXk7IC8vIG9yaWcga2V5IG9mIGRyYXdpbmdcbiAgZGVzdD86IGNnLktleTsgLy8gc2hhcGUgZGVzdCwgb3IgdW5kZWZpbmVkIGZvciBjaXJjbGVcbiAgbW91c2VTcT86IGNnLktleTsgLy8gc3F1YXJlIGJlaW5nIG1vdXNlZCBvdmVyXG4gIHBvczogY2cuTnVtYmVyUGFpcjsgLy8gcmVsYXRpdmUgY3VycmVudCBwb3NpdGlvblxuICBicnVzaDogc3RyaW5nOyAvLyBicnVzaCBuYW1lIGZvciBzaGFwZVxufVxuXG5jb25zdCBicnVzaGVzID0gWydncmVlbicsICdyZWQnLCAnYmx1ZScsICd5ZWxsb3cnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47IC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgZS5jdHJsS2V5ID8gdW5zZWxlY3Qoc3RhdGUpIDogY2FuY2VsTW92ZShzdGF0ZSk7XG4gIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcixcbiAgb3JpZyA9IGdldEtleUF0RG9tUG9zKHBvcywgd2hpdGVQb3Yoc3RhdGUpLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnLFxuICAgIHBvcyxcbiAgICBicnVzaDogZXZlbnRCcnVzaChlKVxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzRHJhdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICAgIGlmIChjdXIpIHtcbiAgICAgIGNvbnN0IG1vdXNlU3EgPSBnZXRLZXlBdERvbVBvcyhjdXIucG9zLCB3aGl0ZVBvdihzdGF0ZSksIHN0YXRlLmRvbS5ib3VuZHMoKSk7XG4gICAgICBpZiAobW91c2VTcSAhPT0gY3VyLm1vdXNlU3EpIHtcbiAgICAgICAgY3VyLm1vdXNlU3EgPSBtb3VzZVNxO1xuICAgICAgICBjdXIuZGVzdCA9IG1vdXNlU3EgIT09IGN1ci5vcmlnID8gbW91c2VTcSA6IHVuZGVmaW5lZDtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICAgICAgfVxuICAgICAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlKHN0YXRlOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkgc3RhdGUuZHJhd2FibGUuY3VycmVudC5wb3MgPSBldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBpZiAoY3VyLm1vdXNlU3EpIGFkZFNoYXBlKHN0YXRlLmRyYXdhYmxlLCBjdXIpO1xuICAgIGNhbmNlbChzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5zaGFwZXMubGVuZ3RoKSB7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudEJydXNoKGU6IGNnLk1vdWNoRXZlbnQpOiBzdHJpbmcge1xuICByZXR1cm4gYnJ1c2hlc1soKGUuc2hpZnRLZXkgfHwgZS5jdHJsS2V5KSAmJiBpc1JpZ2h0QnV0dG9uKGUpID8gMSA6IDApICsgKGUuYWx0S2V5ID8gMiA6IDApXTtcbn1cblxuZnVuY3Rpb24gYWRkU2hhcGUoZHJhd2FibGU6IERyYXdhYmxlLCBjdXI6IERyYXdDdXJyZW50KTogdm9pZCB7XG4gIGNvbnN0IHNhbWVTaGFwZSA9IChzOiBEcmF3U2hhcGUpID0+IHMub3JpZyA9PT0gY3VyLm9yaWcgJiYgcy5kZXN0ID09PSBjdXIuZGVzdDtcbiAgY29uc3Qgc2ltaWxhciA9IGRyYXdhYmxlLnNoYXBlcy5maWx0ZXIoc2FtZVNoYXBlKVswXTtcbiAgaWYgKHNpbWlsYXIpIGRyYXdhYmxlLnNoYXBlcyA9IGRyYXdhYmxlLnNoYXBlcy5maWx0ZXIocyA9PiAhc2FtZVNoYXBlKHMpKTtcbiAgaWYgKCFzaW1pbGFyIHx8IHNpbWlsYXIuYnJ1c2ggIT09IGN1ci5icnVzaCkgZHJhd2FibGUuc2hhcGVzLnB1c2goY3VyKTtcbiAgb25DaGFuZ2UoZHJhd2FibGUpO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZShkcmF3YWJsZTogRHJhd2FibGUpOiB2b2lkIHtcbiAgaWYgKGRyYXdhYmxlLm9uQ2hhbmdlKSBkcmF3YWJsZS5vbkNoYW5nZShkcmF3YWJsZS5zaGFwZXMpO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGNhbmNlbCBhcyBjYW5jZWxEcmFnIH0gZnJvbSAnLi9kcmFnJ1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJvcE1vZGUoczogU3RhdGUsIHBpZWNlPzogY2cuUGllY2UpOiB2b2lkIHtcbiAgcy5kcm9wbW9kZSA9IHtcbiAgICBhY3RpdmU6IHRydWUsXG4gICAgcGllY2VcbiAgfTtcbiAgY2FuY2VsRHJhZyhzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbERyb3BNb2RlKHM6IFN0YXRlKTogdm9pZCB7XG4gIHMuZHJvcG1vZGUgPSB7XG4gICAgYWN0aXZlOiBmYWxzZVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJvcChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoIXMuZHJvcG1vZGUuYWN0aXZlKSByZXR1cm47XG5cbiAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICBib2FyZC51bnNldFByZWRyb3Aocyk7XG5cbiAgY29uc3QgcGllY2UgPSBzLmRyb3Btb2RlLnBpZWNlO1xuXG4gIGlmIChwaWVjZSkge1xuICAgIHMucGllY2VzLmEwID0gcGllY2U7XG4gICAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gICAgY29uc3QgZGVzdCA9IHBvc2l0aW9uICYmIGJvYXJkLmdldEtleUF0RG9tUG9zKFxuICAgICAgcG9zaXRpb24sIGJvYXJkLndoaXRlUG92KHMpLCBzLmRvbS5ib3VuZHMoKSk7XG4gICAgaWYgKGRlc3QpIGJvYXJkLmRyb3BOZXdQaWVjZShzLCAnYTAnLCBkZXN0KTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGRyYWcgZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgZHJhdyBmcm9tICcuL2RyYXcnXG5pbXBvcnQgeyBkcm9wIH0gZnJvbSAnLi9kcm9wJ1xuaW1wb3J0IHsgaXNSaWdodEJ1dHRvbiB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbnR5cGUgTW91Y2hCaW5kID0gKGU6IGNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG50eXBlIFN0YXRlTW91Y2hCaW5kID0gKGQ6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZEJvYXJkKHM6IFN0YXRlKTogdm9pZCB7XG5cbiAgaWYgKHMudmlld09ubHkpIHJldHVybjtcblxuICBjb25zdCBib2FyZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQsXG4gIG9uU3RhcnQgPSBzdGFydERyYWdPckRyYXcocyk7XG5cbiAgLy8gQ2Fubm90IGJlIHBhc3NpdmUsIGJlY2F1c2Ugd2UgcHJldmVudCB0b3VjaCBzY3JvbGxpbmcgYW5kIGRyYWdnaW5nIG9mXG4gIC8vIHNlbGVjdGVkIGVsZW1lbnRzLlxuICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblN0YXJ0IGFzIEV2ZW50TGlzdGVuZXIsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gIGJvYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpIHtcbiAgICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICB9XG59XG5cbi8vIHJldHVybnMgdGhlIHVuYmluZCBmdW5jdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmREb2N1bWVudChzOiBTdGF0ZSwgcmVkcmF3QWxsOiBjZy5SZWRyYXcpOiBjZy5VbmJpbmQge1xuXG4gIGNvbnN0IHVuYmluZHM6IGNnLlVuYmluZFtdID0gW107XG5cbiAgaWYgKCFzLmRvbS5yZWxhdGl2ZSAmJiBzLnJlc2l6YWJsZSkge1xuICAgIGNvbnN0IG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgcy5kb20uYm91bmRzLmNsZWFyKCk7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVkcmF3QWxsKTtcbiAgICB9O1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LmJvZHksICdjaGVzc2dyb3VuZC5yZXNpemUnLCBvblJlc2l6ZSkpO1xuICB9XG5cbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG5cbiAgICBjb25zdCBvbm1vdmU6IE1vdWNoQmluZCA9IGRyYWdPckRyYXcocywgZHJhZy5tb3ZlLCBkcmF3Lm1vdmUpO1xuICAgIGNvbnN0IG9uZW5kOiBNb3VjaEJpbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcuZW5kLCBkcmF3LmVuZCk7XG5cbiAgICBbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXS5mb3JFYWNoKGV2ID0+IHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25tb3ZlKSkpO1xuICAgIFsndG91Y2hlbmQnLCAnbW91c2V1cCddLmZvckVhY2goZXYgPT4gdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbmVuZCkpKTtcblxuICAgIGNvbnN0IG9uU2Nyb2xsID0gKCkgPT4gcy5kb20uYm91bmRzLmNsZWFyKCk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUod2luZG93LCAnc2Nyb2xsJywgb25TY3JvbGwsIHsgcGFzc2l2ZTogdHJ1ZSB9KSk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUod2luZG93LCAncmVzaXplJywgb25TY3JvbGwsIHsgcGFzc2l2ZTogdHJ1ZSB9KSk7XG4gIH1cblxuICByZXR1cm4gKCkgPT4gdW5iaW5kcy5mb3JFYWNoKGYgPT4gZigpKTtcbn1cblxuZnVuY3Rpb24gdW5iaW5kYWJsZShlbDogRXZlbnRUYXJnZXQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogTW91Y2hCaW5kLCBvcHRpb25zPzogYW55KTogY2cuVW5iaW5kIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrIGFzIEV2ZW50TGlzdGVuZXIsIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrIGFzIEV2ZW50TGlzdGVuZXIpO1xufVxuXG5mdW5jdGlvbiBzdGFydERyYWdPckRyYXcoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gZSA9PiB7XG4gICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKHMuZHJhd2FibGUuY3VycmVudCkgZHJhdy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpKSB7IGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIGRyYXcuc3RhcnQocywgZSk7IH1cbiAgICBlbHNlIGlmICghcy52aWV3T25seSkge1xuICAgICAgaWYgKHMuZHJvcG1vZGUuYWN0aXZlKSBkcm9wKHMsIGUpO1xuICAgICAgZWxzZSBkcmFnLnN0YXJ0KHMsIGUpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZHJhZ09yRHJhdyhzOiBTdGF0ZSwgd2l0aERyYWc6IFN0YXRlTW91Y2hCaW5kLCB3aXRoRHJhdzogU3RhdGVNb3VjaEJpbmQpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gZSA9PiB7XG4gICAgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSkgeyBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhzLCBlKTsgfVxuICAgIGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB3aXRoRHJhZyhzLCBlKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IEtleSB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV4cGxvc2lvbihzdGF0ZTogU3RhdGUsIGtleXM6IEtleVtdKTogdm9pZCB7XG4gIHN0YXRlLmV4cGxvZGluZyA9IHsgc3RhZ2U6IDEsIGtleXMgfTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBzZXRTdGFnZShzdGF0ZSwgMik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRTdGFnZShzdGF0ZSwgdW5kZWZpbmVkKSwgMTIwKTtcbiAgfSwgMTIwKTtcbn1cblxuZnVuY3Rpb24gc2V0U3RhZ2Uoc3RhdGU6IFN0YXRlLCBzdGFnZTogbnVtYmVyIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5leHBsb2RpbmcpIHtcbiAgICBpZiAoc3RhZ2UpIHN0YXRlLmV4cGxvZGluZy5zdGFnZSA9IHN0YWdlO1xuICAgIGVsc2Ugc3RhdGUuZXhwbG9kaW5nID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgcG9zMmtleSwgaW52UmFua3MgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbDogY2cuRkVOID0gJ3JuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlInO1xuXG5jb25zdCByb2xlczogeyBbbGV0dGVyOiBzdHJpbmddOiBjZy5Sb2xlIH0gPSB7IHA6ICdwYXduJywgcjogJ3Jvb2snLCBuOiAna25pZ2h0JywgYjogJ2Jpc2hvcCcsIHE6ICdxdWVlbicsIGs6ICdraW5nJyB9O1xuXG5jb25zdCBsZXR0ZXJzID0geyBwYXduOiAncCcsIHJvb2s6ICdyJywga25pZ2h0OiAnbicsIGJpc2hvcDogJ2InLCBxdWVlbjogJ3EnLCBraW5nOiAnaycgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWQoZmVuOiBjZy5GRU4pOiBjZy5QaWVjZXMge1xuICBpZiAoZmVuID09PSAnc3RhcnQnKSBmZW4gPSBpbml0aWFsO1xuICBjb25zdCBwaWVjZXM6IGNnLlBpZWNlcyA9IHt9O1xuICBsZXQgcm93OiBudW1iZXIgPSA4LCBjb2w6IG51bWJlciA9IDA7XG4gIGZvciAoY29uc3QgYyBvZiBmZW4pIHtcbiAgICBzd2l0Y2ggKGMpIHtcbiAgICAgIGNhc2UgJyAnOiByZXR1cm4gcGllY2VzO1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgIC0tcm93O1xuICAgICAgICBpZiAocm93ID09PSAwKSByZXR1cm4gcGllY2VzO1xuICAgICAgICBjb2wgPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ34nOlxuICAgICAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1twb3Mya2V5KFtjb2wsIHJvd10pXTtcbiAgICAgICAgaWYgKHBpZWNlKSBwaWVjZS5wcm9tb3RlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc3QgbmIgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGlmIChuYiA8IDU3KSBjb2wgKz0gbmIgLSA0ODtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgKytjb2w7XG4gICAgICAgICAgY29uc3Qgcm9sZSA9IGMudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBwaWVjZXNbcG9zMmtleShbY29sLCByb3ddKV0gPSB7XG4gICAgICAgICAgICByb2xlOiByb2xlc1tyb2xlXSxcbiAgICAgICAgICAgIGNvbG9yOiAoYyA9PT0gcm9sZSA/ICdibGFjaycgOiAnd2hpdGUnKSBhcyBjZy5Db2xvclxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBpZWNlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlKHBpZWNlczogY2cuUGllY2VzKTogY2cuRkVOIHtcbiAgcmV0dXJuIGludlJhbmtzLm1hcCh5ID0+IGNnLnJhbmtzLm1hcCh4ID0+IHtcbiAgICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW3BvczJrZXkoW3gsIHldKV07XG4gICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgY29uc3QgbGV0dGVyID0gbGV0dGVyc1twaWVjZS5yb2xlXTtcbiAgICAgICAgcmV0dXJuIHBpZWNlLmNvbG9yID09PSAnd2hpdGUnID8gbGV0dGVyLnRvVXBwZXJDYXNlKCkgOiBsZXR0ZXI7XG4gICAgICB9IGVsc2UgcmV0dXJuICcxJztcbiAgICB9KS5qb2luKCcnKVxuICApLmpvaW4oJy8nKS5yZXBsYWNlKC8xezIsfS9nLCBzID0+IHMubGVuZ3RoLnRvU3RyaW5nKCkpO1xufVxuIiwiaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIE1vYmlsaXR5ID0gKHgxOm51bWJlciwgeTE6bnVtYmVyLCB4MjpudW1iZXIsIHkyOm51bWJlcikgPT4gYm9vbGVhbjtcblxuZnVuY3Rpb24gZGlmZihhOiBudW1iZXIsIGI6bnVtYmVyKTpudW1iZXIge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpO1xufVxuXG5mdW5jdGlvbiBwYXduKGNvbG9yOiBjZy5Db2xvcik6IE1vYmlsaXR5IHtcbiAgcmV0dXJuICh4MSwgeTEsIHgyLCB5MikgPT4gZGlmZih4MSwgeDIpIDwgMiAmJiAoXG4gICAgY29sb3IgPT09ICd3aGl0ZScgPyAoXG4gICAgICAvLyBhbGxvdyAyIHNxdWFyZXMgZnJvbSAxIGFuZCA4LCBmb3IgaG9yZGVcbiAgICAgIHkyID09PSB5MSArIDEgfHwgKHkxIDw9IDIgJiYgeTIgPT09ICh5MSArIDIpICYmIHgxID09PSB4MilcbiAgICApIDogKFxuICAgICAgeTIgPT09IHkxIC0gMSB8fCAoeTEgPj0gNyAmJiB5MiA9PT0gKHkxIC0gMikgJiYgeDEgPT09IHgyKVxuICAgIClcbiAgKTtcbn1cblxuY29uc3Qga25pZ2h0OiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICBjb25zdCB4ZCA9IGRpZmYoeDEsIHgyKTtcbiAgY29uc3QgeWQgPSBkaWZmKHkxLCB5Mik7XG4gIHJldHVybiAoeGQgPT09IDEgJiYgeWQgPT09IDIpIHx8ICh4ZCA9PT0gMiAmJiB5ZCA9PT0gMSk7XG59XG5cbmNvbnN0IGJpc2hvcDogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgcmV0dXJuIGRpZmYoeDEsIHgyKSA9PT0gZGlmZih5MSwgeTIpO1xufVxuXG5jb25zdCByb29rOiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICByZXR1cm4geDEgPT09IHgyIHx8IHkxID09PSB5Mjtcbn1cblxuY29uc3QgcXVlZW46IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIHJldHVybiBiaXNob3AoeDEsIHkxLCB4MiwgeTIpIHx8IHJvb2soeDEsIHkxLCB4MiwgeTIpO1xufVxuXG5mdW5jdGlvbiBraW5nKGNvbG9yOiBjZy5Db2xvciwgcm9va0ZpbGVzOiBudW1iZXJbXSwgY2FuQ2FzdGxlOiBib29sZWFuKTogTW9iaWxpdHkge1xuICByZXR1cm4gKHgxLCB5MSwgeDIsIHkyKSAgPT4gKFxuICAgIGRpZmYoeDEsIHgyKSA8IDIgJiYgZGlmZih5MSwgeTIpIDwgMlxuICApIHx8IChcbiAgICBjYW5DYXN0bGUgJiYgeTEgPT09IHkyICYmIHkxID09PSAoY29sb3IgPT09ICd3aGl0ZScgPyAxIDogOCkgJiYgKFxuICAgICAgKHgxID09PSA1ICYmICgodXRpbC5jb250YWluc1gocm9va0ZpbGVzLCAxKSAmJiB4MiA9PT0gMykgfHwgKHV0aWwuY29udGFpbnNYKHJvb2tGaWxlcywgOCkgJiYgeDIgPT09IDcpKSkgfHxcbiAgICAgIHV0aWwuY29udGFpbnNYKHJvb2tGaWxlcywgeDIpXG4gICAgKVxuICApO1xufVxuXG5mdW5jdGlvbiByb29rRmlsZXNPZihwaWVjZXM6IGNnLlBpZWNlcywgY29sb3I6IGNnLkNvbG9yKSB7XG4gIGNvbnN0IGJhY2tyYW5rID0gY29sb3IgPT0gJ3doaXRlJyA/ICcxJyA6ICc4JztcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHBpZWNlcykuZmlsdGVyKGtleSA9PiB7XG4gICAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgICByZXR1cm4ga2V5WzFdID09PSBiYWNrcmFuayAmJiBwaWVjZSAmJiBwaWVjZS5jb2xvciA9PT0gY29sb3IgJiYgcGllY2Uucm9sZSA9PT0gJ3Jvb2snO1xuICB9KS5tYXAoKGtleTogc3RyaW5nICkgPT4gdXRpbC5rZXkycG9zKGtleSBhcyBjZy5LZXkpWzBdKTtcbn1cblxuY29uc3QgYWxsUG9zID0gdXRpbC5hbGxLZXlzLm1hcCh1dGlsLmtleTJwb3MpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcmVtb3ZlKHBpZWNlczogY2cuUGllY2VzLCBrZXk6IGNnLktleSwgY2FuQ2FzdGxlOiBib29sZWFuKTogY2cuS2V5W10ge1xuICBjb25zdCBwaWVjZSA9IHBpZWNlc1trZXldISxcbiAgICBwb3MgPSB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICByID0gcGllY2Uucm9sZSxcbiAgICBtb2JpbGl0eTogTW9iaWxpdHkgPSByID09PSAncGF3bicgPyBwYXduKHBpZWNlLmNvbG9yKSA6IChcbiAgICAgIHIgPT09ICdrbmlnaHQnID8ga25pZ2h0IDogKFxuICAgICAgICByID09PSAnYmlzaG9wJyA/IGJpc2hvcCA6IChcbiAgICAgICAgICByID09PSAncm9vaycgPyByb29rIDogKFxuICAgICAgICAgICAgciA9PT0gJ3F1ZWVuJyA/IHF1ZWVuIDoga2luZyhwaWVjZS5jb2xvciwgcm9va0ZpbGVzT2YocGllY2VzLCBwaWVjZS5jb2xvciksIGNhbkNhc3RsZSlcbiAgICAgICAgICApKSkpO1xuICByZXR1cm4gYWxsUG9zLmZpbHRlcihwb3MyID0+XG4gICAgKHBvc1swXSAhPT0gcG9zMlswXSB8fCBwb3NbMV0gIT09IHBvczJbMV0pICYmIG1vYmlsaXR5KHBvc1swXSwgcG9zWzFdLCBwb3MyWzBdLCBwb3MyWzFdKVxuICApLm1hcCh1dGlsLnBvczJrZXkpO1xufTtcbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGtleTJwb3MsIGNyZWF0ZUVsIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgd2hpdGVQb3YgfSBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBBbmltQ3VycmVudCwgQW5pbVZlY3RvcnMsIEFuaW1WZWN0b3IsIEFuaW1GYWRpbmdzIH0gZnJvbSAnLi9hbmltJ1xuaW1wb3J0IHsgRHJhZ0N1cnJlbnQgfSBmcm9tICcuL2RyYWcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG4vLyBgJGNvbG9yICRyb2xlYFxudHlwZSBQaWVjZU5hbWUgPSBzdHJpbmc7XG5cbmludGVyZmFjZSBTYW1lUGllY2VzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9XG5pbnRlcmZhY2UgU2FtZVNxdWFyZXMgeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH1cbmludGVyZmFjZSBNb3ZlZFBpZWNlcyB7IFtwaWVjZU5hbWU6IHN0cmluZ106IGNnLlBpZWNlTm9kZVtdIH1cbmludGVyZmFjZSBNb3ZlZFNxdWFyZXMgeyBbY2xhc3NOYW1lOiBzdHJpbmddOiBjZy5TcXVhcmVOb2RlW10gfVxuaW50ZXJmYWNlIFNxdWFyZUNsYXNzZXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfVxuXG4vLyBwb3J0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vdmVsb2NlL2xpY2hvYmlsZS9ibG9iL21hc3Rlci9zcmMvanMvY2hlc3Nncm91bmQvdmlldy5qc1xuLy8gaW4gY2FzZSBvZiBidWdzLCBibGFtZSBAdmVsb2NlXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIoczogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgYXNXaGl0ZTogYm9vbGVhbiA9IHdoaXRlUG92KHMpLFxuICBwb3NUb1RyYW5zbGF0ZSA9IHMuZG9tLnJlbGF0aXZlID8gdXRpbC5wb3NUb1RyYW5zbGF0ZVJlbCA6IHV0aWwucG9zVG9UcmFuc2xhdGVBYnMocy5kb20uYm91bmRzKCkpLFxuICB0cmFuc2xhdGUgPSBzLmRvbS5yZWxhdGl2ZSA/IHV0aWwudHJhbnNsYXRlUmVsIDogdXRpbC50cmFuc2xhdGVBYnMsXG4gIGJvYXJkRWw6IEhUTUxFbGVtZW50ID0gcy5kb20uZWxlbWVudHMuYm9hcmQsXG4gIHBpZWNlczogY2cuUGllY2VzID0gcy5waWVjZXMsXG4gIGN1ckFuaW06IEFuaW1DdXJyZW50IHwgdW5kZWZpbmVkID0gcy5hbmltYXRpb24uY3VycmVudCxcbiAgYW5pbXM6IEFuaW1WZWN0b3JzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5hbmltcyA6IHt9LFxuICBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uZmFkaW5ncyA6IHt9LFxuICBjdXJEcmFnOiBEcmFnQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQsXG4gIHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzKSxcbiAgc2FtZVBpZWNlczogU2FtZVBpZWNlcyA9IHt9LFxuICBzYW1lU3F1YXJlczogU2FtZVNxdWFyZXMgPSB7fSxcbiAgbW92ZWRQaWVjZXM6IE1vdmVkUGllY2VzID0ge30sXG4gIG1vdmVkU3F1YXJlczogTW92ZWRTcXVhcmVzID0ge30sXG4gIHBpZWNlc0tleXM6IGNnLktleVtdID0gT2JqZWN0LmtleXMocGllY2VzKSBhcyBjZy5LZXlbXTtcbiAgbGV0IGs6IGNnLktleSxcbiAgcDogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIGVsOiBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlLFxuICBwaWVjZUF0S2V5OiBjZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgZWxQaWVjZU5hbWU6IFBpZWNlTmFtZSxcbiAgYW5pbTogQW5pbVZlY3RvciB8IHVuZGVmaW5lZCxcbiAgZmFkaW5nOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgcE12ZHNldDogY2cuUGllY2VOb2RlW10sXG4gIHBNdmQ6IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCxcbiAgc012ZHNldDogY2cuU3F1YXJlTm9kZVtdLFxuICBzTXZkOiBjZy5TcXVhcmVOb2RlIHwgdW5kZWZpbmVkO1xuXG4gIC8vIHdhbGsgb3ZlciBhbGwgYm9hcmQgZG9tIGVsZW1lbnRzLCBhcHBseSBhbmltYXRpb25zIGFuZCBmbGFnIG1vdmVkIHBpZWNlc1xuICBlbCA9IGJvYXJkRWwuZmlyc3RDaGlsZCBhcyBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlO1xuICB3aGlsZSAoZWwpIHtcbiAgICBrID0gZWwuY2dLZXk7XG4gICAgaWYgKGlzUGllY2VOb2RlKGVsKSkge1xuICAgICAgcGllY2VBdEtleSA9IHBpZWNlc1trXTtcbiAgICAgIGFuaW0gPSBhbmltc1trXTtcbiAgICAgIGZhZGluZyA9IGZhZGluZ3Nba107XG4gICAgICBlbFBpZWNlTmFtZSA9IGVsLmNnUGllY2U7XG4gICAgICAvLyBpZiBwaWVjZSBub3QgYmVpbmcgZHJhZ2dlZCBhbnltb3JlLCByZW1vdmUgZHJhZ2dpbmcgc3R5bGVcbiAgICAgIGlmIChlbC5jZ0RyYWdnaW5nICYmICghY3VyRHJhZyB8fCBjdXJEcmFnLm9yaWcgIT09IGspKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdnaW5nJyk7XG4gICAgICAgIHRyYW5zbGF0ZShlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhrKSwgYXNXaGl0ZSkpO1xuICAgICAgICBlbC5jZ0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyByZW1vdmUgZmFkaW5nIGNsYXNzIGlmIGl0IHN0aWxsIHJlbWFpbnNcbiAgICAgIGlmICghZmFkaW5nICYmIGVsLmNnRmFkaW5nKSB7XG4gICAgICAgIGVsLmNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgfVxuICAgICAgLy8gdGhlcmUgaXMgbm93IGEgcGllY2UgYXQgdGhpcyBkb20ga2V5XG4gICAgICBpZiAocGllY2VBdEtleSkge1xuICAgICAgICAvLyBjb250aW51ZSBhbmltYXRpb24gaWYgYWxyZWFkeSBhbmltYXRpbmcgYW5kIHNhbWUgcGllY2VcbiAgICAgICAgLy8gKG90aGVyd2lzZSBpdCBjb3VsZCBhbmltYXRlIGEgY2FwdHVyZWQgcGllY2UpXG4gICAgICAgIGlmIChhbmltICYmIGVsLmNnQW5pbWF0aW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSkge1xuICAgICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgIHRyYW5zbGF0ZShlbCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1doaXRlKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuY2dBbmltYXRpbmcpIHtcbiAgICAgICAgICBlbC5jZ0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzV2hpdGUpKTtcbiAgICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgZWwuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KGtleTJwb3MoayksIGFzV2hpdGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNhbWUgcGllY2U6IGZsYWcgYXMgc2FtZVxuICAgICAgICBpZiAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpICYmICghZmFkaW5nIHx8ICFlbC5jZ0ZhZGluZykpIHtcbiAgICAgICAgICBzYW1lUGllY2VzW2tdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkaWZmZXJlbnQgcGllY2U6IGZsYWcgYXMgbW92ZWQgdW5sZXNzIGl0IGlzIGEgZmFkaW5nIHBpZWNlXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChmYWRpbmcgJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKGZhZGluZykpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2ZhZGluZycpO1xuICAgICAgICAgICAgZWwuY2dGYWRpbmcgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdKSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0ucHVzaChlbCk7XG4gICAgICAgICAgICBlbHNlIG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSA9IFtlbF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZTogZmxhZyBhcyBtb3ZlZFxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0pIG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXS5wdXNoKGVsKTtcbiAgICAgICAgZWxzZSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0gPSBbZWxdO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpc1NxdWFyZU5vZGUoZWwpKSB7XG4gICAgICBjb25zdCBjbiA9IGVsLmNsYXNzTmFtZTtcbiAgICAgIGlmIChzcXVhcmVzW2tdID09PSBjbikgc2FtZVNxdWFyZXNba10gPSB0cnVlO1xuICAgICAgZWxzZSBpZiAobW92ZWRTcXVhcmVzW2NuXSkgbW92ZWRTcXVhcmVzW2NuXS5wdXNoKGVsKTtcbiAgICAgIGVsc2UgbW92ZWRTcXVhcmVzW2NuXSA9IFtlbF07XG4gICAgfVxuICAgIGVsID0gZWwubmV4dFNpYmxpbmcgYXMgY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZTtcbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgc3F1YXJlcyBpbiBjdXJyZW50IHNldCwgYXBwbHkgZG9tIGNoYW5nZXMgdG8gbW92ZWQgc3F1YXJlc1xuICAvLyBvciBhcHBlbmQgbmV3IHNxdWFyZXNcbiAgZm9yIChjb25zdCBzayBpbiBzcXVhcmVzKSB7XG4gICAgaWYgKCFzYW1lU3F1YXJlc1tza10pIHtcbiAgICAgIHNNdmRzZXQgPSBtb3ZlZFNxdWFyZXNbc3F1YXJlc1tza11dO1xuICAgICAgc012ZCA9IHNNdmRzZXQgJiYgc012ZHNldC5wb3AoKTtcbiAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhzayBhcyBjZy5LZXkpLCBhc1doaXRlKTtcbiAgICAgIGlmIChzTXZkKSB7XG4gICAgICAgIHNNdmQuY2dLZXkgPSBzayBhcyBjZy5LZXk7XG4gICAgICAgIHRyYW5zbGF0ZShzTXZkLCB0cmFuc2xhdGlvbik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3F1YXJlTm9kZSA9IGNyZWF0ZUVsKCdzcXVhcmUnLCBzcXVhcmVzW3NrXSkgYXMgY2cuU3F1YXJlTm9kZTtcbiAgICAgICAgc3F1YXJlTm9kZS5jZ0tleSA9IHNrIGFzIGNnLktleTtcbiAgICAgICAgdHJhbnNsYXRlKHNxdWFyZU5vZGUsIHRyYW5zbGF0aW9uKTtcbiAgICAgICAgYm9hcmRFbC5pbnNlcnRCZWZvcmUoc3F1YXJlTm9kZSwgYm9hcmRFbC5maXJzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHBpZWNlcyBpbiBjdXJyZW50IHNldCwgYXBwbHkgZG9tIGNoYW5nZXMgdG8gbW92ZWQgcGllY2VzXG4gIC8vIG9yIGFwcGVuZCBuZXcgcGllY2VzXG4gIGZvciAoY29uc3QgaiBpbiBwaWVjZXNLZXlzKSB7XG4gICAgayA9IHBpZWNlc0tleXNbal07XG4gICAgcCA9IHBpZWNlc1trXSE7XG4gICAgYW5pbSA9IGFuaW1zW2tdO1xuICAgIGlmICghc2FtZVBpZWNlc1trXSkge1xuICAgICAgcE12ZHNldCA9IG1vdmVkUGllY2VzW3BpZWNlTmFtZU9mKHApXTtcbiAgICAgIHBNdmQgPSBwTXZkc2V0ICYmIHBNdmRzZXQucG9wKCk7XG4gICAgICAvLyBhIHNhbWUgcGllY2Ugd2FzIG1vdmVkXG4gICAgICBpZiAocE12ZCkge1xuICAgICAgICAvLyBhcHBseSBkb20gY2hhbmdlc1xuICAgICAgICBwTXZkLmNnS2V5ID0gaztcbiAgICAgICAgaWYgKHBNdmQuY2dGYWRpbmcpIHtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgICAgIHBNdmQuY2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgcE12ZC5zdHlsZS56SW5kZXggPSBwb3NaSW5kZXgocG9zLCBhc1doaXRlKTtcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwTXZkLmNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGUocE12ZCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1doaXRlKSk7XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZSBpbiBtb3ZlZCBvYmo6IGluc2VydCB0aGUgbmV3IHBpZWNlXG4gICAgICAvLyBhc3N1bWVzIHRoZSBuZXcgcGllY2UgaXMgbm90IGJlaW5nIGRyYWdnZWRcbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIGNvbnN0IHBpZWNlTmFtZSA9IHBpZWNlTmFtZU9mKHApLFxuICAgICAgICBwaWVjZU5vZGUgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWUpIGFzIGNnLlBpZWNlTm9kZSxcbiAgICAgICAgcG9zID0ga2V5MnBvcyhrKTtcblxuICAgICAgICBwaWVjZU5vZGUuY2dQaWVjZSA9IHBpZWNlTmFtZTtcbiAgICAgICAgcGllY2VOb2RlLmNnS2V5ID0gaztcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwaWVjZU5vZGUuY2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZShwaWVjZU5vZGUsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuXG4gICAgICAgIGlmIChzLmFkZFBpZWNlWkluZGV4KSBwaWVjZU5vZGUuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KHBvcywgYXNXaGl0ZSk7XG5cbiAgICAgICAgYm9hcmRFbC5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlbW92ZSBhbnkgZWxlbWVudCB0aGF0IHJlbWFpbnMgaW4gdGhlIG1vdmVkIHNldHNcbiAgZm9yIChjb25zdCBpIGluIG1vdmVkUGllY2VzKSByZW1vdmVOb2RlcyhzLCBtb3ZlZFBpZWNlc1tpXSk7XG4gIGZvciAoY29uc3QgaSBpbiBtb3ZlZFNxdWFyZXMpIHJlbW92ZU5vZGVzKHMsIG1vdmVkU3F1YXJlc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGlzUGllY2VOb2RlKGVsOiBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlKTogZWwgaXMgY2cuUGllY2VOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdQSUVDRSc7XG59XG5mdW5jdGlvbiBpc1NxdWFyZU5vZGUoZWw6IGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGUpOiBlbCBpcyBjZy5TcXVhcmVOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdTUVVBUkUnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVOb2RlcyhzOiBTdGF0ZSwgbm9kZXM6IEhUTUxFbGVtZW50W10pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBpIGluIG5vZGVzKSBzLmRvbS5lbGVtZW50cy5ib2FyZC5yZW1vdmVDaGlsZChub2Rlc1tpXSk7XG59XG5cbmZ1bmN0aW9uIHBvc1pJbmRleChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbik6IHN0cmluZyB7XG4gIGxldCB6ID0gMiArIChwb3NbMV0gLSAxKSAqIDggKyAoOCAtIHBvc1swXSk7XG4gIGlmIChhc1doaXRlKSB6ID0gNjcgLSB6O1xuICByZXR1cm4geiArICcnO1xufVxuXG5mdW5jdGlvbiBwaWVjZU5hbWVPZihwaWVjZTogY2cuUGllY2UpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzOiBTdGF0ZSk6IFNxdWFyZUNsYXNzZXMge1xuICBjb25zdCBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0ge307XG4gIGxldCBpOiBhbnksIGs6IGNnLktleTtcbiAgaWYgKHMubGFzdE1vdmUgJiYgcy5oaWdobGlnaHQubGFzdE1vdmUpIGZvciAoaSBpbiBzLmxhc3RNb3ZlKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMubGFzdE1vdmVbaV0sICdsYXN0LW1vdmUnKTtcbiAgfVxuICBpZiAocy5jaGVjayAmJiBzLmhpZ2hsaWdodC5jaGVjaykgYWRkU3F1YXJlKHNxdWFyZXMsIHMuY2hlY2ssICdjaGVjaycpO1xuICBpZiAocy5zZWxlY3RlZCkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcbiAgICBpZiAocy5tb3ZhYmxlLnNob3dEZXN0cykge1xuICAgICAgY29uc3QgZGVzdHMgPSBzLm1vdmFibGUuZGVzdHMgJiYgcy5tb3ZhYmxlLmRlc3RzW3Muc2VsZWN0ZWRdO1xuICAgICAgaWYgKGRlc3RzKSBmb3IgKGkgaW4gZGVzdHMpIHtcbiAgICAgICAgayA9IGRlc3RzW2ldO1xuICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ21vdmUtZGVzdCcgKyAocy5waWVjZXNba10gPyAnIG9jJyA6ICcnKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZW1vdmFibGUuZGVzdHM7XG4gICAgICBpZiAocERlc3RzKSBmb3IgKGkgaW4gcERlc3RzKSB7XG4gICAgICAgIGsgPSBwRGVzdHNbaV07XG4gICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAncHJlbW92ZS1kZXN0JyArIChzLnBpZWNlc1trXSA/ICcgb2MnIDogJycpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3QgcHJlbW92ZSA9IHMucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAocHJlbW92ZSkgZm9yIChpIGluIHByZW1vdmUpIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlW2ldLCAnY3VycmVudC1wcmVtb3ZlJyk7XG4gIGVsc2UgaWYgKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQpIGFkZFNxdWFyZShzcXVhcmVzLCBzLnByZWRyb3BwYWJsZS5jdXJyZW50LmtleSwgJ2N1cnJlbnQtcHJlbW92ZScpO1xuXG4gIGNvbnN0IG8gPSBzLmV4cGxvZGluZztcbiAgaWYgKG8pIGZvciAoaSBpbiBvLmtleXMpIGFkZFNxdWFyZShzcXVhcmVzLCBvLmtleXNbaV0sICdleHBsb2RpbmcnICsgby5zdGFnZSk7XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59XG5cbmZ1bmN0aW9uIGFkZFNxdWFyZShzcXVhcmVzOiBTcXVhcmVDbGFzc2VzLCBrZXk6IGNnLktleSwga2xhc3M6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoc3F1YXJlc1trZXldKSBzcXVhcmVzW2tleV0gKz0gJyAnICsga2xhc3M7XG4gIGVsc2Ugc3F1YXJlc1trZXldID0ga2xhc3M7XG59XG4iLCJpbXBvcnQgKiBhcyBmZW4gZnJvbSAnLi9mZW4nXG5pbXBvcnQgeyBBbmltQ3VycmVudCB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0IHsgRHJhd2FibGUgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgeyB0aW1lciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlIHtcbiAgcGllY2VzOiBjZy5QaWVjZXM7XG4gIG9yaWVudGF0aW9uOiBjZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHdoaXRlIHwgYmxhY2tcbiAgdHVybkNvbG9yOiBjZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiB3aGl0ZSB8IGJsYWNrXG4gIGNoZWNrPzogY2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IGluIGNoZWNrIFwiYTJcIlxuICBsYXN0TW92ZT86IGNnLktleVtdOyAvLyBzcXVhcmVzIHBhcnQgb2YgdGhlIGxhc3QgbW92ZSBbXCJjM1wiOyBcImM0XCJdXG4gIHNlbGVjdGVkPzogY2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiYTFcIlxuICBjb29yZGluYXRlczogYm9vbGVhbjsgLy8gaW5jbHVkZSBjb29yZHMgYXR0cmlidXRlc1xuICBhdXRvQ2FzdGxlOiBib29sZWFuOyAvLyBpbW1lZGlhdGVseSBjb21wbGV0ZSB0aGUgY2FzdGxlIGJ5IG1vdmluZyB0aGUgcm9vayBhZnRlciBraW5nIG1vdmVcbiAgdmlld09ubHk6IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIGRpc2FibGVDb250ZXh0TWVudTogYm9vbGVhbjsgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBjaGVzc2JvYXJkXG4gIHJlc2l6YWJsZTogYm9vbGVhbjsgLy8gbGlzdGVucyB0byBjaGVzc2dyb3VuZC5yZXNpemUgb24gZG9jdW1lbnQuYm9keSB0byBjbGVhciBib3VuZHMgY2FjaGVcbiAgYWRkUGllY2VaSW5kZXg6IGJvb2xlYW47IC8vIGFkZHMgei1pbmRleCB2YWx1ZXMgdG8gcGllY2VzIChmb3IgM0QpXG4gIHBpZWNlS2V5OiBib29sZWFuOyAvLyBhZGQgYSBkYXRhLWtleSBhdHRyaWJ1dGUgdG8gcGllY2UgZWxlbWVudHNcbiAgaGlnaGxpZ2h0OiB7XG4gICAgbGFzdE1vdmU6IGJvb2xlYW47IC8vIGFkZCBsYXN0LW1vdmUgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrOiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb246IHtcbiAgICBlbmFibGVkOiBib29sZWFuO1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gICAgY3VycmVudD86IEFuaW1DdXJyZW50O1xuICB9O1xuICBtb3ZhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGNvbG9yPzogY2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUuIHdoaXRlIHwgYmxhY2sgfCBib3RoXG4gICAgZGVzdHM/OiBjZy5EZXN0czsgLy8gdmFsaWQgbW92ZXMuIHtcImEyXCIgW1wiYTNcIiBcImE0XCJdIFwiYjFcIiBbXCJhM1wiIFwiYzNcIl19XG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgICBhZnRlck5ld1BpZWNlPzogKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5LCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgYSBuZXcgcGllY2UgaXMgZHJvcHBlZCBvbiB0aGUgYm9hcmRcbiAgICB9O1xuICAgIHJvb2tDYXN0bGU6IGJvb2xlYW4gLy8gY2FzdGxlIGJ5IG1vdmluZyB0aGUga2luZyB0byB0aGUgcm9va1xuICB9O1xuICBwcmVtb3ZhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlbW92ZXMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBjYXN0bGU6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWxsb3cga2luZyBjYXN0bGUgcHJlbW92ZXNcbiAgICBkZXN0cz86IGNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgY3VycmVudD86IGNnLktleVBhaXI7IC8vIGtleXMgb2YgdGhlIGN1cnJlbnQgc2F2ZWQgcHJlbW92ZSBbXCJlMlwiIFwiZTRcIl1cbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE/OiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgIC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgcHJlZHJvcHBhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgY3VycmVudD86IHsgLy8gY3VycmVudCBzYXZlZCBwcmVkcm9wIHtyb2xlOiAna25pZ2h0Jzsga2V5OiAnZTQnfVxuICAgICAgcm9sZTogY2cuUm9sZTtcbiAgICAgIGtleTogY2cuS2V5XG4gICAgfTtcbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIGRyYWdnYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U6IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZTogYm9vbGVhbjsgLy8gbGV0cyBjaGVzc2dyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgY2VudGVyUGllY2U6IGJvb2xlYW47IC8vIGNlbnRlciB0aGUgcGllY2Ugb24gY3Vyc29yIGF0IGRyYWcgc3RhcnRcbiAgICBzaG93R2hvc3Q6IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIGRlbGV0ZU9uRHJvcE9mZjogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmRcbiAgICBjdXJyZW50PzogRHJhZ0N1cnJlbnQ7XG4gIH07XG4gIGRyb3Btb2RlOiB7XG4gICAgYWN0aXZlOiBib29sZWFuO1xuICAgIHBpZWNlPzogY2cuUGllY2U7XG4gIH1cbiAgc2VsZWN0YWJsZToge1xuICAgIC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBlbmFibGVkOiBib29sZWFuXG4gIH07XG4gIHN0YXRzOiB7XG4gICAgLy8gd2FzIGxhc3QgcGllY2UgZHJhZ2dlZCBvciBjbGlja2VkP1xuICAgIC8vIG5lZWRzIGRlZmF1bHQgdG8gZmFsc2UgZm9yIHRvdWNoXG4gICAgZHJhZ2dlZDogYm9vbGVhbixcbiAgICBjdHJsS2V5PzogYm9vbGVhblxuICB9O1xuICBldmVudHM6IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIC8vIGNhbGxlZCBhZnRlciBhIHBpZWNlIGhhcyBiZWVuIG1vdmVkLlxuICAgIC8vIGNhcHR1cmVkUGllY2UgaXMgdW5kZWZpbmVkIG9yIGxpa2Uge2NvbG9yOiAnd2hpdGUnOyAncm9sZSc6ICdxdWVlbid9XG4gICAgbW92ZT86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgY2FwdHVyZWRQaWVjZT86IGNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3BOZXdQaWVjZT86IChwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5KSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IGNnLktleSkgPT4gdm9pZCAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIGluc2VydD86IChlbGVtZW50czogY2cuRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU6IERyYXdhYmxlLFxuICBleHBsb2Rpbmc/OiBjZy5FeHBsb2Rpbmc7XG4gIGRvbTogY2cuRG9tLFxuICBob2xkOiBjZy5UaW1lclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMoKTogUGFydGlhbDxTdGF0ZT4ge1xuICByZXR1cm4ge1xuICAgIHBpZWNlczogZmVuLnJlYWQoZmVuLmluaXRpYWwpLFxuICAgIG9yaWVudGF0aW9uOiAnd2hpdGUnLFxuICAgIHR1cm5Db2xvcjogJ3doaXRlJyxcbiAgICBjb29yZGluYXRlczogdHJ1ZSxcbiAgICBhdXRvQ2FzdGxlOiB0cnVlLFxuICAgIHZpZXdPbmx5OiBmYWxzZSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IGZhbHNlLFxuICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICBhZGRQaWVjZVpJbmRleDogZmFsc2UsXG4gICAgcGllY2VLZXk6IGZhbHNlLFxuICAgIGhpZ2hsaWdodDoge1xuICAgICAgbGFzdE1vdmU6IHRydWUsXG4gICAgICBjaGVjazogdHJ1ZVxuICAgIH0sXG4gICAgYW5pbWF0aW9uOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZHVyYXRpb246IDIwMFxuICAgIH0sXG4gICAgbW92YWJsZToge1xuICAgICAgZnJlZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiAnYm90aCcsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBldmVudHM6IHt9LFxuICAgICAgcm9va0Nhc3RsZTogdHJ1ZVxuICAgIH0sXG4gICAgcHJlbW92YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgIGNhc3RsZTogdHJ1ZSxcbiAgICAgIGV2ZW50czoge31cbiAgICB9LFxuICAgIHByZWRyb3BwYWJsZToge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICBldmVudHM6IHt9XG4gICAgfSxcbiAgICBkcmFnZ2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBkaXN0YW5jZTogMyxcbiAgICAgIGF1dG9EaXN0YW5jZTogdHJ1ZSxcbiAgICAgIGNlbnRlclBpZWNlOiB0cnVlLFxuICAgICAgc2hvd0dob3N0OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZVxuICAgIH0sXG4gICAgZHJvcG1vZGU6IHtcbiAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICB9LFxuICAgIHNlbGVjdGFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICB9LFxuICAgIHN0YXRzOiB7XG4gICAgICAvLyBvbiB0b3VjaHNjcmVlbiwgZGVmYXVsdCB0byBcInRhcC10YXBcIiBtb3Zlc1xuICAgICAgLy8gaW5zdGVhZCBvZiBkcmFnXG4gICAgICBkcmFnZ2VkOiAhKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdylcbiAgICB9LFxuICAgIGV2ZW50czoge30sXG4gICAgZHJhd2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIGNhbiBkcmF3XG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyBjYW4gdmlld1xuICAgICAgZXJhc2VPbkNsaWNrOiB0cnVlLFxuICAgICAgc2hhcGVzOiBbXSxcbiAgICAgIGF1dG9TaGFwZXM6IFtdLFxuICAgICAgYnJ1c2hlczoge1xuICAgICAgICBncmVlbjogeyBrZXk6ICdnJywgY29sb3I6ICcjMTU3ODFCJywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICByZWQ6IHsga2V5OiAncicsIGNvbG9yOiAnIzg4MjAyMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgYmx1ZTogeyBrZXk6ICdiJywgY29sb3I6ICcjMDAzMDg4Jywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICB5ZWxsb3c6IHsga2V5OiAneScsIGNvbG9yOiAnI2U2OGYwMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgcGFsZUJsdWU6IHsga2V5OiAncGInLCBjb2xvcjogJyMwMDMwODgnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZUdyZWVuOiB7IGtleTogJ3BnJywgY29sb3I6ICcjMTU3ODFCJywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVSZWQ6IHsga2V5OiAncHInLCBjb2xvcjogJyM4ODIwMjAnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZUdyZXk6IHsga2V5OiAncGdyJywgY29sb3I6ICcjNGE0YTRhJywgb3BhY2l0eTogMC4zNSwgbGluZVdpZHRoOiAxNSB9XG4gICAgICB9LFxuICAgICAgcGllY2VzOiB7XG4gICAgICAgIGJhc2VVcmw6ICdodHRwczovL2xpY2hlc3MxLm9yZy9hc3NldHMvcGllY2UvY2J1cm5ldHQvJ1xuICAgICAgfSxcbiAgICAgIHByZXZTdmdIYXNoOiAnJ1xuICAgIH0sXG4gICAgaG9sZDogdGltZXIoKVxuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsga2V5MnBvcyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IERyYXdhYmxlLCBEcmF3U2hhcGUsIERyYXdTaGFwZVBpZWNlLCBEcmF3QnJ1c2gsIERyYXdCcnVzaGVzLCBEcmF3TW9kaWZpZXJzIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnTmFtZSk7XG59XG5cbmludGVyZmFjZSBTaGFwZSB7XG4gIHNoYXBlOiBEcmF3U2hhcGU7XG4gIGN1cnJlbnQ6IGJvb2xlYW47XG4gIGhhc2g6IEhhc2g7XG59XG5cbmludGVyZmFjZSBDdXN0b21CcnVzaGVzIHtcbiAgW2hhc2g6IHN0cmluZ106IERyYXdCcnVzaFxufVxuXG5pbnRlcmZhY2UgQXJyb3dEZXN0cyB7XG4gIFtrZXk6IHN0cmluZ106IG51bWJlcjsgLy8gaG93IG1hbnkgYXJyb3dzIGxhbmQgb24gYSBzcXVhcmVcbn1cblxudHlwZSBIYXNoID0gc3RyaW5nO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU3ZnKHN0YXRlOiBTdGF0ZSwgcm9vdDogU1ZHRWxlbWVudCk6IHZvaWQge1xuXG4gIGNvbnN0IGQgPSBzdGF0ZS5kcmF3YWJsZSxcbiAgY3VyRCA9IGQuY3VycmVudCxcbiAgY3VyID0gY3VyRCAmJiBjdXJELm1vdXNlU3EgPyBjdXJEIGFzIERyYXdTaGFwZSA6IHVuZGVmaW5lZCxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyA9IHt9O1xuXG4gIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKS5mb3JFYWNoKHMgPT4ge1xuICAgIGlmIChzLmRlc3QpIGFycm93RGVzdHNbcy5kZXN0XSA9IChhcnJvd0Rlc3RzW3MuZGVzdF0gfHwgMCkgKyAxO1xuICB9KTtcblxuICBjb25zdCBzaGFwZXM6IFNoYXBlW10gPSBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5tYXAoKHM6IERyYXdTaGFwZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGN1cnJlbnQ6IGZhbHNlLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlKVxuICAgIH07XG4gIH0pO1xuICBpZiAoY3VyKSBzaGFwZXMucHVzaCh7XG4gICAgc2hhcGU6IGN1cixcbiAgICBjdXJyZW50OiB0cnVlLFxuICAgIGhhc2g6IHNoYXBlSGFzaChjdXIsIGFycm93RGVzdHMsIHRydWUpXG4gIH0pO1xuXG4gIGNvbnN0IGZ1bGxIYXNoID0gc2hhcGVzLm1hcChzYyA9PiBzYy5oYXNoKS5qb2luKCcnKTtcbiAgaWYgKGZ1bGxIYXNoID09PSBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCkgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9IGZ1bGxIYXNoO1xuXG4gIGNvbnN0IGRlZnNFbCA9IHJvb3QuZmlyc3RDaGlsZCBhcyBTVkdFbGVtZW50O1xuXG4gIHN5bmNEZWZzKGQsIHNoYXBlcywgZGVmc0VsKTtcbiAgc3luY1NoYXBlcyhzdGF0ZSwgc2hhcGVzLCBkLmJydXNoZXMsIGFycm93RGVzdHMsIHJvb3QsIGRlZnNFbCk7XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKGQ6IERyYXdhYmxlLCBzaGFwZXM6IFNoYXBlW10sIGRlZnNFbDogU1ZHRWxlbWVudCkge1xuICBjb25zdCBicnVzaGVzOiBDdXN0b21CcnVzaGVzID0ge307XG4gIGxldCBicnVzaDogRHJhd0JydXNoO1xuICBzaGFwZXMuZm9yRWFjaChzID0+IHtcbiAgICBpZiAocy5zaGFwZS5kZXN0KSB7XG4gICAgICBicnVzaCA9IGQuYnJ1c2hlc1tzLnNoYXBlLmJydXNoXTtcbiAgICAgIGlmIChzLnNoYXBlLm1vZGlmaWVycykgYnJ1c2ggPSBtYWtlQ3VzdG9tQnJ1c2goYnJ1c2gsIHMuc2hhcGUubW9kaWZpZXJzKTtcbiAgICAgIGJydXNoZXNbYnJ1c2gua2V5XSA9IGJydXNoO1xuICAgIH1cbiAgfSk7XG4gIGNvbnN0IGtleXNJbkRvbToge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gIGxldCBlbDogU1ZHRWxlbWVudCA9IGRlZnNFbC5maXJzdENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIHdoaWxlKGVsKSB7XG4gICAga2V5c0luRG9tW2VsLmdldEF0dHJpYnV0ZSgnY2dLZXknKSBhcyBzdHJpbmddID0gdHJ1ZTtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQ7XG4gIH1cbiAgZm9yIChsZXQga2V5IGluIGJydXNoZXMpIHtcbiAgICBpZiAoIWtleXNJbkRvbVtrZXldKSBkZWZzRWwuYXBwZW5kQ2hpbGQocmVuZGVyTWFya2VyKGJydXNoZXNba2V5XSkpO1xuICB9XG59XG5cbi8vIGFwcGVuZCBhbmQgcmVtb3ZlIG9ubHkuIE5vIHVwZGF0ZXMuXG5mdW5jdGlvbiBzeW5jU2hhcGVzKHN0YXRlOiBTdGF0ZSwgc2hhcGVzOiBTaGFwZVtdLCBicnVzaGVzOiBEcmF3QnJ1c2hlcywgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgcm9vdDogU1ZHRWxlbWVudCwgZGVmc0VsOiBTVkdFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMoKSxcbiAgaGFzaGVzSW5Eb206IHtbaGFzaDogc3RyaW5nXTogYm9vbGVhbn0gPSB7fSxcbiAgdG9SZW1vdmU6IFNWR0VsZW1lbnRbXSA9IFtdO1xuICBzaGFwZXMuZm9yRWFjaChzYyA9PiB7IGhhc2hlc0luRG9tW3NjLmhhc2hdID0gZmFsc2U7IH0pO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgPSBkZWZzRWwubmV4dFNpYmxpbmcgYXMgU1ZHRWxlbWVudCwgZWxIYXNoOiBIYXNoO1xuICB3aGlsZShlbCkge1xuICAgIGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnY2dIYXNoJykgYXMgSGFzaDtcbiAgICAvLyBmb3VuZCBhIHNoYXBlIGVsZW1lbnQgdGhhdCdzIGhlcmUgdG8gc3RheVxuICAgIGlmIChoYXNoZXNJbkRvbS5oYXNPd25Qcm9wZXJ0eShlbEhhc2gpKSBoYXNoZXNJbkRvbVtlbEhhc2hdID0gdHJ1ZTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dFNpYmxpbmcgYXMgU1ZHRWxlbWVudDtcbiAgfVxuICAvLyByZW1vdmUgb2xkIHNoYXBlc1xuICB0b1JlbW92ZS5mb3JFYWNoKGVsID0+IHJvb3QucmVtb3ZlQ2hpbGQoZWwpKTtcbiAgLy8gaW5zZXJ0IHNoYXBlcyB0aGF0IGFyZSBub3QgeWV0IGluIGRvbVxuICBzaGFwZXMuZm9yRWFjaChzYyA9PiB7XG4gICAgaWYgKCFoYXNoZXNJbkRvbVtzYy5oYXNoXSkgcm9vdC5hcHBlbmRDaGlsZChyZW5kZXJTaGFwZShzdGF0ZSwgc2MsIGJydXNoZXMsIGFycm93RGVzdHMsIGJvdW5kcykpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2hhcGVIYXNoKHtvcmlnLCBkZXN0LCBicnVzaCwgcGllY2UsIG1vZGlmaWVyc306IERyYXdTaGFwZSwgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgY3VycmVudDogYm9vbGVhbik6IEhhc2gge1xuICByZXR1cm4gW2N1cnJlbnQsIG9yaWcsIGRlc3QsIGJydXNoLCBkZXN0ICYmIGFycm93RGVzdHNbZGVzdF0gPiAxLFxuICAgIHBpZWNlICYmIHBpZWNlSGFzaChwaWVjZSksXG4gICAgbW9kaWZpZXJzICYmIG1vZGlmaWVyc0hhc2gobW9kaWZpZXJzKVxuICBdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gbW9kaWZpZXJzSGFzaChtOiBEcmF3TW9kaWZpZXJzKTogSGFzaCB7XG4gIHJldHVybiAnJyArIChtLmxpbmVXaWR0aCB8fCAnJyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNoYXBlKHN0YXRlOiBTdGF0ZSwge3NoYXBlLCBjdXJyZW50LCBoYXNofTogU2hhcGUsIGJydXNoZXM6IERyYXdCcnVzaGVzLCBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgbGV0IGVsOiBTVkdFbGVtZW50O1xuICBpZiAoc2hhcGUucGllY2UpIGVsID0gcmVuZGVyUGllY2UoXG4gICAgc3RhdGUuZHJhd2FibGUucGllY2VzLmJhc2VVcmwsXG4gICAgb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICBzaGFwZS5waWVjZSxcbiAgICBib3VuZHMpO1xuICBlbHNlIHtcbiAgICBjb25zdCBvcmlnID0gb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgICBpZiAoc2hhcGUub3JpZyAmJiBzaGFwZS5kZXN0KSB7XG4gICAgICBsZXQgYnJ1c2g6IERyYXdCcnVzaCA9IGJydXNoZXNbc2hhcGUuYnJ1c2hdO1xuICAgICAgaWYgKHNoYXBlLm1vZGlmaWVycykgYnJ1c2ggPSBtYWtlQ3VzdG9tQnJ1c2goYnJ1c2gsIHNoYXBlLm1vZGlmaWVycyk7XG4gICAgICBlbCA9IHJlbmRlckFycm93KFxuICAgICAgICBicnVzaCxcbiAgICAgICAgb3JpZyxcbiAgICAgICAgb3JpZW50KGtleTJwb3Moc2hhcGUuZGVzdCksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgICAgY3VycmVudCxcbiAgICAgICAgYXJyb3dEZXN0c1tzaGFwZS5kZXN0XSA+IDEsXG4gICAgICAgIGJvdW5kcyk7XG4gICAgfVxuICAgIGVsc2UgZWwgPSByZW5kZXJDaXJjbGUoYnJ1c2hlc1tzaGFwZS5icnVzaF0sIG9yaWcsIGN1cnJlbnQsIGJvdW5kcyk7XG4gIH1cbiAgZWwuc2V0QXR0cmlidXRlKCdjZ0hhc2gnLCBoYXNoKTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDaXJjbGUoYnJ1c2g6IERyYXdCcnVzaCwgcG9zOiBjZy5Qb3MsIGN1cnJlbnQ6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBvID0gcG9zMnB4KHBvcywgYm91bmRzKSxcbiAgd2lkdGhzID0gY2lyY2xlV2lkdGgoYm91bmRzKSxcbiAgcmFkaXVzID0gKGJvdW5kcy53aWR0aCArIGJvdW5kcy5oZWlnaHQpIC8gMzI7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2NpcmNsZScpLCB7XG4gICAgc3Ryb2tlOiBicnVzaC5jb2xvcixcbiAgICAnc3Ryb2tlLXdpZHRoJzogd2lkdGhzW2N1cnJlbnQgPyAwIDogMV0sXG4gICAgZmlsbDogJ25vbmUnLFxuICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgIGN4OiBvWzBdLFxuICAgIGN5OiBvWzFdLFxuICAgIHI6IHJhZGl1cyAtIHdpZHRoc1sxXSAvIDJcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFycm93KGJydXNoOiBEcmF3QnJ1c2gsIG9yaWc6IGNnLlBvcywgZGVzdDogY2cuUG9zLCBjdXJyZW50OiBib29sZWFuLCBzaG9ydGVuOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbSA9IGFycm93TWFyZ2luKGJvdW5kcywgc2hvcnRlbiAmJiAhY3VycmVudCksXG4gIGEgPSBwb3MycHgob3JpZywgYm91bmRzKSxcbiAgYiA9IHBvczJweChkZXN0LCBib3VuZHMpLFxuICBkeCA9IGJbMF0gLSBhWzBdLFxuICBkeSA9IGJbMV0gLSBhWzFdLFxuICBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSxcbiAgeG8gPSBNYXRoLmNvcyhhbmdsZSkgKiBtLFxuICB5byA9IE1hdGguc2luKGFuZ2xlKSAqIG07XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2xpbmUnKSwge1xuICAgIHN0cm9rZTogYnJ1c2guY29sb3IsXG4gICAgJ3N0cm9rZS13aWR0aCc6IGxpbmVXaWR0aChicnVzaCwgY3VycmVudCwgYm91bmRzKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogJ3VybCgjYXJyb3doZWFkLScgKyBicnVzaC5rZXkgKyAnKScsXG4gICAgb3BhY2l0eTogb3BhY2l0eShicnVzaCwgY3VycmVudCksXG4gICAgeDE6IGFbMF0sXG4gICAgeTE6IGFbMV0sXG4gICAgeDI6IGJbMF0gLSB4byxcbiAgICB5MjogYlsxXSAtIHlvXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQaWVjZShiYXNlVXJsOiBzdHJpbmcsIHBvczogY2cuUG9zLCBwaWVjZTogRHJhd1NoYXBlUGllY2UsIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBvID0gcG9zMnB4KHBvcywgYm91bmRzKSxcbiAgc2l6ZSA9IGJvdW5kcy53aWR0aCAvIDggKiAocGllY2Uuc2NhbGUgfHwgMSksXG4gIG5hbWUgPSBwaWVjZS5jb2xvclswXSArIChwaWVjZS5yb2xlID09PSAna25pZ2h0JyA/ICduJyA6IHBpZWNlLnJvbGVbMF0pLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2ltYWdlJyksIHtcbiAgICBjbGFzc05hbWU6IGAke3BpZWNlLnJvbGV9ICR7cGllY2UuY29sb3J9YCxcbiAgICB4OiBvWzBdIC0gc2l6ZSAvIDIsXG4gICAgeTogb1sxXSAtIHNpemUgLyAyLFxuICAgIHdpZHRoOiBzaXplLFxuICAgIGhlaWdodDogc2l6ZSxcbiAgICBocmVmOiBiYXNlVXJsICsgbmFtZSArICcuc3ZnJ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFya2VyKGJydXNoOiBEcmF3QnJ1c2gpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbWFya2VyID0gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdtYXJrZXInKSwge1xuICAgIGlkOiAnYXJyb3doZWFkLScgKyBicnVzaC5rZXksXG4gICAgb3JpZW50OiAnYXV0bycsXG4gICAgbWFya2VyV2lkdGg6IDQsXG4gICAgbWFya2VySGVpZ2h0OiA4LFxuICAgIHJlZlg6IDIuMDUsXG4gICAgcmVmWTogMi4wMVxuICB9KTtcbiAgbWFya2VyLmFwcGVuZENoaWxkKHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgncGF0aCcpLCB7XG4gICAgZDogJ00wLDAgVjQgTDMsMiBaJyxcbiAgICBmaWxsOiBicnVzaC5jb2xvclxuICB9KSk7XG4gIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ2NnS2V5JywgYnJ1c2gua2V5KTtcbiAgcmV0dXJuIG1hcmtlcjtcbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbDogU1ZHRWxlbWVudCwgYXR0cnM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiBTVkdFbGVtZW50IHtcbiAgZm9yIChsZXQga2V5IGluIGF0dHJzKSBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiBvcmllbnQocG9zOiBjZy5Qb3MsIGNvbG9yOiBjZy5Db2xvcik6IGNnLlBvcyB7XG4gIHJldHVybiBjb2xvciA9PT0gJ3doaXRlJyA/IHBvcyA6IFs5IC0gcG9zWzBdLCA5IC0gcG9zWzFdXTtcbn1cblxuZnVuY3Rpb24gbWFrZUN1c3RvbUJydXNoKGJhc2U6IERyYXdCcnVzaCwgbW9kaWZpZXJzOiBEcmF3TW9kaWZpZXJzKTogRHJhd0JydXNoIHtcbiAgY29uc3QgYnJ1c2g6IFBhcnRpYWw8RHJhd0JydXNoPiA9IHtcbiAgICBjb2xvcjogYmFzZS5jb2xvcixcbiAgICBvcGFjaXR5OiBNYXRoLnJvdW5kKGJhc2Uub3BhY2l0eSAqIDEwKSAvIDEwLFxuICAgIGxpbmVXaWR0aDogTWF0aC5yb3VuZChtb2RpZmllcnMubGluZVdpZHRoIHx8IGJhc2UubGluZVdpZHRoKVxuICB9O1xuICBicnVzaC5rZXkgPSBbYmFzZS5rZXksIG1vZGlmaWVycy5saW5lV2lkdGhdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpO1xuICByZXR1cm4gYnJ1c2ggYXMgRHJhd0JydXNoO1xufVxuXG5mdW5jdGlvbiBjaXJjbGVXaWR0aChib3VuZHM6IENsaWVudFJlY3QpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgY29uc3QgYmFzZSA9IGJvdW5kcy53aWR0aCAvIDUxMjtcbiAgcmV0dXJuIFszICogYmFzZSwgNCAqIGJhc2VdO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoYnJ1c2g6IERyYXdCcnVzaCwgY3VycmVudDogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogbnVtYmVyIHtcbiAgcmV0dXJuIChicnVzaC5saW5lV2lkdGggfHwgMTApICogKGN1cnJlbnQgPyAwLjg1IDogMSkgLyA1MTIgKiBib3VuZHMud2lkdGg7XG59XG5cbmZ1bmN0aW9uIG9wYWNpdHkoYnJ1c2g6IERyYXdCcnVzaCwgY3VycmVudDogYm9vbGVhbik6IG51bWJlciB7XG4gIHJldHVybiAoYnJ1c2gub3BhY2l0eSB8fCAxKSAqIChjdXJyZW50ID8gMC45IDogMSk7XG59XG5cbmZ1bmN0aW9uIGFycm93TWFyZ2luKGJvdW5kczogQ2xpZW50UmVjdCwgc2hvcnRlbjogYm9vbGVhbik6IG51bWJlciB7XG4gIHJldHVybiAoc2hvcnRlbiA/IDIwIDogMTApIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBwb3MycHgocG9zOiBjZy5Qb3MsIGJvdW5kczogQ2xpZW50UmVjdCk6IGNnLk51bWJlclBhaXIge1xuICByZXR1cm4gWyhwb3NbMF0gLSAwLjUpICogYm91bmRzLndpZHRoIC8gOCwgKDguNSAtIHBvc1sxXSkgKiBib3VuZHMuaGVpZ2h0IC8gOF07XG59XG4iLCJleHBvcnQgdHlwZSBDb2xvciA9ICd3aGl0ZScgfCAnYmxhY2snO1xuZXhwb3J0IHR5cGUgUm9sZSA9ICdraW5nJyB8ICdxdWVlbicgfCAncm9vaycgfCAnYmlzaG9wJyB8ICdrbmlnaHQnIHwgJ3Bhd24nO1xuZXhwb3J0IHR5cGUgS2V5ID0gJ2EwJyB8ICdhMScgfCAnYjEnIHwgJ2MxJyB8ICdkMScgfCAnZTEnIHwgJ2YxJyB8ICdnMScgfCAnaDEnIHwgJ2EyJyB8ICdiMicgfCAnYzInIHwgJ2QyJyB8ICdlMicgfCAnZjInIHwgJ2cyJyB8ICdoMicgfCAnYTMnIHwgJ2IzJyB8ICdjMycgfCAnZDMnIHwgJ2UzJyB8ICdmMycgfCAnZzMnIHwgJ2gzJyB8ICdhNCcgfCAnYjQnIHwgJ2M0JyB8ICdkNCcgfCAnZTQnIHwgJ2Y0JyB8ICdnNCcgfCAnaDQnIHwgJ2E1JyB8ICdiNScgfCAnYzUnIHwgJ2Q1JyB8ICdlNScgfCAnZjUnIHwgJ2c1JyB8ICdoNScgfCAnYTYnIHwgJ2I2JyB8ICdjNicgfCAnZDYnIHwgJ2U2JyB8ICdmNicgfCAnZzYnIHwgJ2g2JyB8ICdhNycgfCAnYjcnIHwgJ2M3JyB8ICdkNycgfCAnZTcnIHwgJ2Y3JyB8ICdnNycgfCAnaDcnIHwgJ2E4JyB8ICdiOCcgfCAnYzgnIHwgJ2Q4JyB8ICdlOCcgfCAnZjgnIHwgJ2c4JyB8ICdoOCc7XG5leHBvcnQgdHlwZSBGaWxlID0gJ2EnIHwgJ2InIHwgJ2MnIHwgJ2QnIHwgJ2UnIHwgJ2YnIHwgJ2cnIHwgJ2gnO1xuZXhwb3J0IHR5cGUgUmFuayA9IDEgfCAyIHwgMyB8IDQgfCA1IHwgNiB8IDcgfCA4O1xuZXhwb3J0IHR5cGUgRkVOID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgUG9zID0gW251bWJlciwgbnVtYmVyXTtcbmV4cG9ydCBpbnRlcmZhY2UgUGllY2Uge1xuICByb2xlOiBSb2xlO1xuICBjb2xvcjogQ29sb3I7XG4gIHByb21vdGVkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRHJvcCB7XG4gIHJvbGU6IFJvbGU7XG4gIGtleTogS2V5O1xufVxuZXhwb3J0IGludGVyZmFjZSBQaWVjZXMge1xuICBba2V5OiBzdHJpbmddOiBQaWVjZSB8IHVuZGVmaW5lZDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VzRGlmZiB7XG4gIFtrZXk6IHN0cmluZ106IFBpZWNlIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgdHlwZSBLZXlQYWlyID0gW0tleSwgS2V5XTtcblxuZXhwb3J0IHR5cGUgTnVtYmVyUGFpciA9IFtudW1iZXIsIG51bWJlcl07XG5cbmV4cG9ydCB0eXBlIE51bWJlclF1YWQgPSBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcblxuZXhwb3J0IGludGVyZmFjZSBEZXN0cyB7XG4gIFtrZXk6IHN0cmluZ106IEtleVtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudHMge1xuICBib2FyZDogSFRNTEVsZW1lbnQ7XG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG4gIGdob3N0PzogSFRNTEVsZW1lbnQ7XG4gIHN2Zz86IFNWR0VsZW1lbnQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIERvbSB7XG4gIGVsZW1lbnRzOiBFbGVtZW50cyxcbiAgYm91bmRzOiBNZW1vPENsaWVudFJlY3Q+O1xuICByZWRyYXc6ICgpID0+IHZvaWQ7XG4gIHJlZHJhd05vdzogKHNraXBTdmc/OiBib29sZWFuKSA9PiB2b2lkO1xuICB1bmJpbmQ/OiBVbmJpbmQ7XG4gIGRlc3Ryb3llZD86IGJvb2xlYW47XG4gIHJlbGF0aXZlPzogYm9vbGVhbjsgLy8gZG9uJ3QgY29tcHV0ZSBib3VuZHMsIHVzZSByZWxhdGl2ZSAlIHRvIHBsYWNlIHBpZWNlc1xufVxuZXhwb3J0IGludGVyZmFjZSBFeHBsb2Rpbmcge1xuICBzdGFnZTogbnVtYmVyO1xuICBrZXlzOiBLZXlbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNb3ZlTWV0YWRhdGEge1xuICBwcmVtb3ZlOiBib29sZWFuO1xuICBjdHJsS2V5PzogYm9vbGVhbjtcbiAgaG9sZFRpbWU/OiBudW1iZXI7XG4gIGNhcHR1cmVkPzogUGllY2U7XG4gIHByZWRyb3A/OiBib29sZWFuO1xufVxuZXhwb3J0IGludGVyZmFjZSBTZXRQcmVtb3ZlTWV0YWRhdGEge1xuICBjdHJsS2V5PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgV2luZG93RXZlbnQgPSAnb25zY3JvbGwnIHwgJ29ucmVzaXplJztcblxuZXhwb3J0IHR5cGUgTW91Y2hFdmVudCA9IE1vdXNlRXZlbnQgJiBUb3VjaEV2ZW50O1xuXG5leHBvcnQgaW50ZXJmYWNlIEtleWVkTm9kZSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgY2dLZXk6IEtleTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VOb2RlIGV4dGVuZHMgS2V5ZWROb2RlIHtcbiAgY2dQaWVjZTogc3RyaW5nO1xuICBjZ0FuaW1hdGluZz86IGJvb2xlYW47XG4gIGNnRmFkaW5nPzogYm9vbGVhbjtcbiAgY2dEcmFnZ2luZz86IGJvb2xlYW47XG59XG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZU5vZGUgZXh0ZW5kcyBLZXllZE5vZGUgeyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVtbzxBPiB7ICgpOiBBOyBjbGVhcjogKCkgPT4gdm9pZDsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVyIHtcbiAgc3RhcnQ6ICgpID0+IHZvaWQ7XG4gIGNhbmNlbDogKCkgPT4gdm9pZDtcbiAgc3RvcDogKCkgPT4gbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBSZWRyYXcgPSAoKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgVW5iaW5kID0gKCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIE1pbGxpc2Vjb25kcyA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIEtIeiA9IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IGZpbGVzOiBGaWxlW10gPSBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCddO1xuZXhwb3J0IGNvbnN0IHJhbmtzOiBSYW5rW10gPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOF07XG4iLCJpbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9yczogY2cuQ29sb3JbXSA9IFsnd2hpdGUnLCAnYmxhY2snXTtcblxuZXhwb3J0IGNvbnN0IGludlJhbmtzOiBjZy5SYW5rW10gPSBbOCwgNywgNiwgNSwgNCwgMywgMiwgMV07XG5cbmV4cG9ydCBjb25zdCBhbGxLZXlzOiBjZy5LZXlbXSA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQoLi4uY2cuZmlsZXMubWFwKGMgPT4gY2cucmFua3MubWFwKHIgPT4gYytyKSkpO1xuXG5leHBvcnQgY29uc3QgcG9zMmtleSA9IChwb3M6IGNnLlBvcykgPT4gYWxsS2V5c1s4ICogcG9zWzBdICsgcG9zWzFdIC0gOV07XG5cbmV4cG9ydCBjb25zdCBrZXkycG9zID0gKGs6IGNnLktleSkgPT4gW2suY2hhckNvZGVBdCgwKSAtIDk2LCBrLmNoYXJDb2RlQXQoMSkgLSA0OF0gYXMgY2cuUG9zO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVtbzxBPihmOiAoKSA9PiBBKTogY2cuTWVtbzxBPiB7XG4gIGxldCB2OiBBIHwgdW5kZWZpbmVkO1xuICBjb25zdCByZXQ6IGFueSA9ICgpID0+IHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB2ID0gZigpO1xuICAgIHJldHVybiB2O1xuICB9O1xuICByZXQuY2xlYXIgPSAoKSA9PiB7IHYgPSB1bmRlZmluZWQgfTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGNvbnN0IHRpbWVyOiAoKSA9PiBjZy5UaW1lciA9ICgpID0+IHtcbiAgbGV0IHN0YXJ0QXQ6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHtcbiAgICBzdGFydCgpIHsgc3RhcnRBdCA9IHBlcmZvcm1hbmNlLm5vdygpIH0sXG4gICAgY2FuY2VsKCkgeyBzdGFydEF0ID0gdW5kZWZpbmVkIH0sXG4gICAgc3RvcCgpIHtcbiAgICAgIGlmICghc3RhcnRBdCkgcmV0dXJuIDA7XG4gICAgICBjb25zdCB0aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydEF0O1xuICAgICAgc3RhcnRBdCA9IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB0aW1lO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IG9wcG9zaXRlID0gKGM6IGNnLkNvbG9yKSA9PiBjID09PSAnd2hpdGUnID8gJ2JsYWNrJyA6ICd3aGl0ZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc1g8WD4oeHM6IFhbXSB8IHVuZGVmaW5lZCwgeDogWCk6IGJvb2xlYW4ge1xuICByZXR1cm4geHMgIT09IHVuZGVmaW5lZCAmJiB4cy5pbmRleE9mKHgpICE9PSAtMTtcbn1cblxuZXhwb3J0IGNvbnN0IGRpc3RhbmNlU3E6IChwb3MxOiBjZy5Qb3MsIHBvczI6IGNnLlBvcykgPT4gbnVtYmVyID0gKHBvczEsIHBvczIpID0+IHtcbiAgcmV0dXJuIE1hdGgucG93KHBvczFbMF0gLSBwb3MyWzBdLCAyKSArIE1hdGgucG93KHBvczFbMV0gLSBwb3MyWzFdLCAyKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNhbWVQaWVjZTogKHAxOiBjZy5QaWVjZSwgcDI6IGNnLlBpZWNlKSA9PiBib29sZWFuID0gKHAxLCBwMikgPT5cbiAgcDEucm9sZSA9PT0gcDIucm9sZSAmJiBwMS5jb2xvciA9PT0gcDIuY29sb3I7XG5cbmNvbnN0IHBvc1RvVHJhbnNsYXRlQmFzZTogKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuLCB4RmFjdG9yOiBudW1iZXIsIHlGYWN0b3I6IG51bWJlcikgPT4gY2cuTnVtYmVyUGFpciA9XG4ocG9zLCBhc1doaXRlLCB4RmFjdG9yLCB5RmFjdG9yKSA9PiBbXG4gIChhc1doaXRlID8gcG9zWzBdIC0gMSA6IDggLSBwb3NbMF0pICogeEZhY3RvcixcbiAgKGFzV2hpdGUgPyA4IC0gcG9zWzFdIDogcG9zWzFdIC0gMSkgKiB5RmFjdG9yXG5dO1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVBYnMgPSAoYm91bmRzOiBDbGllbnRSZWN0KSA9PiB7XG4gIGNvbnN0IHhGYWN0b3IgPSBib3VuZHMud2lkdGggLyA4LFxuICB5RmFjdG9yID0gYm91bmRzLmhlaWdodCAvIDg7XG4gIHJldHVybiAocG9zOiBjZy5Qb3MsIGFzV2hpdGU6IGJvb2xlYW4pID0+IHBvc1RvVHJhbnNsYXRlQmFzZShwb3MsIGFzV2hpdGUsIHhGYWN0b3IsIHlGYWN0b3IpO1xufTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlUmVsOiAocG9zOiBjZy5Qb3MsIGFzV2hpdGU6IGJvb2xlYW4pID0+IGNnLk51bWJlclBhaXIgPVxuICAocG9zLCBhc1doaXRlKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBhc1doaXRlLCAxMDAsIDEwMCk7XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVBYnMgPSAoZWw6IEhUTUxFbGVtZW50LCBwb3M6IGNnLk51bWJlclBhaXIpID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3Bvc1swXX1weCwke3Bvc1sxXX1weClgO1xufVxuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlUmVsID0gKGVsOiBIVE1MRWxlbWVudCwgcGVyY2VudHM6IGNnLk51bWJlclBhaXIpID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3BlcmNlbnRzWzBdfSUsJHtwZXJjZW50c1sxXX0lKWA7XG59XG5cbmV4cG9ydCBjb25zdCBzZXRWaXNpYmxlID0gKGVsOiBIVE1MRWxlbWVudCwgdjogYm9vbGVhbikgPT4ge1xuICBlbC5zdHlsZS52aXNpYmlsaXR5ID0gdiA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nO1xufVxuXG4vLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb24hXG5leHBvcnQgY29uc3QgZXZlbnRQb3NpdGlvbjogKGU6IGNnLk1vdWNoRXZlbnQpID0+IGNnLk51bWJlclBhaXIgfCB1bmRlZmluZWQgPSBlID0+IHtcbiAgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFggPT09IDApIHJldHVybiBbZS5jbGllbnRYLCBlLmNsaWVudFldO1xuICBpZiAoZS50b3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlc1swXSkgcmV0dXJuIFtlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WCwgZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFldO1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgY29uc3QgaXNSaWdodEJ1dHRvbiA9IChlOiBNb3VzZUV2ZW50KSA9PiBlLmJ1dHRvbnMgPT09IDIgfHwgZS5idXR0b24gPT09IDI7XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVFbCA9ICh0YWdOYW1lOiBzdHJpbmcsIGNsYXNzTmFtZT86IHN0cmluZykgPT4ge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIGlmIChjbGFzc05hbWUpIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgcmV0dXJuIGVsO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgY29sb3JzLCBzZXRWaXNpYmxlLCBjcmVhdGVFbCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGZpbGVzLCByYW5rcyB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyBjcmVhdGVFbGVtZW50IGFzIGNyZWF0ZVNWRyB9IGZyb20gJy4vc3ZnJ1xuaW1wb3J0IHsgRWxlbWVudHMgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3cmFwKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzOiBTdGF0ZSwgcmVsYXRpdmU6IGJvb2xlYW4pOiBFbGVtZW50cyB7XG5cbiAgLy8gLmNnLXdyYXAgKGVsZW1lbnQgcGFzc2VkIHRvIENoZXNzZ3JvdW5kKVxuICAvLyAgIGNnLWhlbHBlciAoMTIuNSUpXG4gIC8vICAgICBjZy1jb250YWluZXIgKDgwMCUpXG4gIC8vICAgICAgIGNnLWJvYXJkXG4gIC8vICAgICAgIHN2Z1xuICAvLyAgICAgICBjb29yZHMucmFua3NcbiAgLy8gICAgICAgY29vcmRzLmZpbGVzXG4gIC8vICAgICAgIHBpZWNlLmdob3N0XG5cbiAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcblxuICAvLyBlbnN1cmUgdGhlIGNnLXdyYXAgY2xhc3MgaXMgc2V0XG4gIC8vIHNvIGJvdW5kcyBjYWxjdWxhdGlvbiBjYW4gdXNlIHRoZSBDU1Mgd2lkdGgvaGVpZ2h0IHZhbHVlc1xuICAvLyBhZGQgdGhhdCBjbGFzcyB5b3Vyc2VsZiB0byB0aGUgZWxlbWVudCBiZWZvcmUgY2FsbGluZyBjaGVzc2dyb3VuZFxuICAvLyBmb3IgYSBzbGlnaHQgcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQhIChhdm9pZHMgcmVjb21wdXRpbmcgc3R5bGUpXG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2ctd3JhcCcpO1xuXG4gIGNvbG9ycy5mb3JFYWNoKGMgPT4gZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdvcmllbnRhdGlvbi0nICsgYywgcy5vcmllbnRhdGlvbiA9PT0gYykpO1xuICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuXG4gIGNvbnN0IGhlbHBlciA9IGNyZWF0ZUVsKCdjZy1oZWxwZXInKTtcbiAgZWxlbWVudC5hcHBlbmRDaGlsZChoZWxwZXIpO1xuICBjb25zdCBjb250YWluZXIgPSBjcmVhdGVFbCgnY2ctY29udGFpbmVyJyk7XG4gIGhlbHBlci5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXG4gIGNvbnN0IGJvYXJkID0gY3JlYXRlRWwoJ2NnLWJvYXJkJyk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChib2FyZCk7XG5cbiAgbGV0IHN2ZzogU1ZHRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuZHJhd2FibGUudmlzaWJsZSAmJiAhcmVsYXRpdmUpIHtcbiAgICBzdmcgPSBjcmVhdGVTVkcoJ3N2ZycpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjcmVhdGVTVkcoJ2RlZnMnKSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHN2Zyk7XG4gIH1cblxuICBpZiAocy5jb29yZGluYXRlcykge1xuICAgIGNvbnN0IG9yaWVudENsYXNzID0gcy5vcmllbnRhdGlvbiA9PT0gJ2JsYWNrJyA/ICcgYmxhY2snIDogJyc7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhyYW5rcywgJ3JhbmtzJyArIG9yaWVudENsYXNzKSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhmaWxlcywgJ2ZpbGVzJyArIG9yaWVudENsYXNzKSk7XG4gIH1cblxuICBsZXQgZ2hvc3Q6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBpZiAocy5kcmFnZ2FibGUuc2hvd0dob3N0ICYmICFyZWxhdGl2ZSkge1xuICAgIGdob3N0ID0gY3JlYXRlRWwoJ3BpZWNlJywgJ2dob3N0Jyk7XG4gICAgc2V0VmlzaWJsZShnaG9zdCwgZmFsc2UpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnaG9zdCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJvYXJkLFxuICAgIGNvbnRhaW5lcixcbiAgICBnaG9zdCxcbiAgICBzdmdcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zOiBhbnlbXSwgY2xhc3NOYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWwoJ2Nvb3JkcycsIGNsYXNzTmFtZSk7XG4gIGxldCBmOiBIVE1MRWxlbWVudDtcbiAgZm9yIChsZXQgaSBpbiBlbGVtcykge1xuICAgIGYgPSBjcmVhdGVFbCgnY29vcmQnKTtcbiAgICBmLnRleHRDb250ZW50ID0gZWxlbXNbaV07XG4gICAgZWwuYXBwZW5kQ2hpbGQoZik7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gICAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4gICAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkRGF0YSA9IGNoaWxkcmVuW2ldLmRhdGE7XG4gICAgICAgICAgICBpZiAoY2hpbGREYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhZGROUyhjaGlsZERhdGEsIGNoaWxkcmVuW2ldLmNoaWxkcmVuLCBjaGlsZHJlbltpXS5zZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgICBpZiAoYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGEgPSBiO1xuICAgICAgICBpZiAoaXMuYXJyYXkoYykpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHtcbiAgICAgICAgICAgIHRleHQgPSBjO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMgJiYgYy5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2NdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXMuYXJyYXkoYikpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYikpIHtcbiAgICAgICAgICAgIHRleHQgPSBiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIgJiYgYi5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2JdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YSA9IGI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKVxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldID0gdm5vZGVfMS52bm9kZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnICYmXG4gICAgICAgIChzZWwubGVuZ3RoID09PSAzIHx8IHNlbFszXSA9PT0gJy4nIHx8IHNlbFszXSA9PT0gJyMnKSkge1xuICAgICAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlXzEudm5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn1cbmV4cG9ydHMuaCA9IGg7XG47XG5leHBvcnRzLmRlZmF1bHQgPSBoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xufVxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkge1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ2hpbGQobm9kZSwgY2hpbGQpIHtcbiAgICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlO1xufVxuZnVuY3Rpb24gbmV4dFNpYmxpbmcobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xufVxuZnVuY3Rpb24gdGFnTmFtZShlbG0pIHtcbiAgICByZXR1cm4gZWxtLnRhZ05hbWU7XG59XG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChub2RlLCB0ZXh0KSB7XG4gICAgbm9kZS50ZXh0Q29udGVudCA9IHRleHQ7XG59XG5mdW5jdGlvbiBnZXRUZXh0Q29udGVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dENvbnRlbnQ7XG59XG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxO1xufVxuZnVuY3Rpb24gaXNUZXh0KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMztcbn1cbmV4cG9ydHMuaHRtbERvbUFwaSA9IHtcbiAgICBjcmVhdGVFbGVtZW50OiBjcmVhdGVFbGVtZW50LFxuICAgIGNyZWF0ZUVsZW1lbnROUzogY3JlYXRlRWxlbWVudE5TLFxuICAgIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gICAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICAgIHBhcmVudE5vZGU6IHBhcmVudE5vZGUsXG4gICAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgc2V0VGV4dENvbnRlbnQ6IHNldFRleHRDb250ZW50LFxuICAgIGdldFRleHRDb250ZW50OiBnZXRUZXh0Q29udGVudCxcbiAgICBpc0VsZW1lbnQ6IGlzRWxlbWVudCxcbiAgICBpc1RleHQ6IGlzVGV4dCxcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmh0bWxEb21BcGk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1odG1sZG9tYXBpLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5hcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBwcmltaXRpdmUocykge1xuICAgIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5wcmltaXRpdmUgPSBwcmltaXRpdmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBrZXksIGVsbSA9IHZub2RlLmVsbSwgb2xkQXR0cnMgPSBvbGRWbm9kZS5kYXRhLmF0dHJzLCBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnM7XG4gICAgaWYgKCFvbGRBdHRycyAmJiAhYXR0cnMpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQXR0cnMgPT09IGF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQXR0cnMgPSBvbGRBdHRycyB8fCB7fTtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuICAgIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgICBmb3IgKGtleSBpbiBhdHRycykge1xuICAgICAgICB2YXIgY3VyID0gYXR0cnNba2V5XTtcbiAgICAgICAgdmFyIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgICAgICAgaWYgKGN1ciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGN1ciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgY3VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyByZW1vdmUgcmVtb3ZlZCBhdHRyaWJ1dGVzXG4gICAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAgIC8vIHRoZSBvdGhlciBvcHRpb24gaXMgdG8gcmVtb3ZlIGFsbCBhdHRyaWJ1dGVzIHdpdGggdmFsdWUgPT0gdW5kZWZpbmVkXG4gICAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICAgICAgaWYgKCEoa2V5IGluIGF0dHJzKSkge1xuICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUF0dHJzLCB1cGRhdGU6IHVwZGF0ZUF0dHJzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmF0dHJpYnV0ZXNNb2R1bGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdHRyaWJ1dGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gdXBkYXRlQ2xhc3Mob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBvbGRDbGFzcyA9IG9sZFZub2RlLmRhdGEuY2xhc3MsIGtsYXNzID0gdm5vZGUuZGF0YS5jbGFzcztcbiAgICBpZiAoIW9sZENsYXNzICYmICFrbGFzcylcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChvbGRDbGFzcyA9PT0ga2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBvbGRDbGFzcyA9IG9sZENsYXNzIHx8IHt9O1xuICAgIGtsYXNzID0ga2xhc3MgfHwge307XG4gICAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgICAgIGlmICgha2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgICAgICBjdXIgPSBrbGFzc1tuYW1lXTtcbiAgICAgICAgaWYgKGN1ciAhPT0gb2xkQ2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3RbY3VyID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmNsYXNzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmNsYXNzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2xhc3MuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG52YXIgaHRtbGRvbWFwaV8xID0gcmVxdWlyZShcIi4vaHRtbGRvbWFwaVwiKTtcbmZ1bmN0aW9uIGlzVW5kZWYocykgeyByZXR1cm4gcyA9PT0gdW5kZWZpbmVkOyB9XG5mdW5jdGlvbiBpc0RlZihzKSB7IHJldHVybiBzICE9PSB1bmRlZmluZWQ7IH1cbnZhciBlbXB0eU5vZGUgPSB2bm9kZV8xLmRlZmF1bHQoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuZnVuY3Rpb24gc2FtZVZub2RlKHZub2RlMSwgdm5vZGUyKSB7XG4gICAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cbmZ1bmN0aW9uIGlzVm5vZGUodm5vZGUpIHtcbiAgICByZXR1cm4gdm5vZGUuc2VsICE9PSB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICAgIHZhciBpLCBtYXAgPSB7fSwga2V5LCBjaDtcbiAgICBmb3IgKGkgPSBiZWdpbklkeDsgaSA8PSBlbmRJZHg7ICsraSkge1xuICAgICAgICBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAga2V5ID0gY2gua2V5O1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcFtrZXldID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxudmFyIGhvb2tzID0gWydjcmVhdGUnLCAndXBkYXRlJywgJ3JlbW92ZScsICdkZXN0cm95JywgJ3ByZScsICdwb3N0J107XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmV4cG9ydHMuaCA9IGhfMS5oO1xudmFyIHRodW5rXzEgPSByZXF1aXJlKFwiLi90aHVua1wiKTtcbmV4cG9ydHMudGh1bmsgPSB0aHVua18xLnRodW5rO1xuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBkb21BcGkpIHtcbiAgICB2YXIgaSwgaiwgY2JzID0ge307XG4gICAgdmFyIGFwaSA9IGRvbUFwaSAhPT0gdW5kZWZpbmVkID8gZG9tQXBpIDogaHRtbGRvbWFwaV8xLmRlZmF1bHQ7XG4gICAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNic1tob29rc1tpXV0gPSBbXTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIHZhciBob29rID0gbW9kdWxlc1tqXVtob29rc1tpXV07XG4gICAgICAgICAgICBpZiAoaG9vayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2JzW2hvb2tzW2ldXS5wdXNoKGhvb2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgICAgICB2YXIgaWQgPSBlbG0uaWQgPyAnIycgKyBlbG0uaWQgOiAnJztcbiAgICAgICAgdmFyIGMgPSBlbG0uY2xhc3NOYW1lID8gJy4nICsgZWxtLmNsYXNzTmFtZS5zcGxpdCgnICcpLmpvaW4oJy4nKSA6ICcnO1xuICAgICAgICByZXR1cm4gdm5vZGVfMS5kZWZhdWx0KGFwaS50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSArIGlkICsgYywge30sIFtdLCB1bmRlZmluZWQsIGVsbSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcm1DYigpIHtcbiAgICAgICAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRfMSA9IGFwaS5wYXJlbnROb2RlKGNoaWxkRWxtKTtcbiAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50XzEsIGNoaWxkRWxtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuaW5pdCkpIHtcbiAgICAgICAgICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgICAgICBpZiAoc2VsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIFBhcnNlIHNlbGVjdG9yXG4gICAgICAgICAgICB2YXIgaGFzaElkeCA9IHNlbC5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgICB2YXIgZG90SWR4ID0gc2VsLmluZGV4T2YoJy4nLCBoYXNoSWR4KTtcbiAgICAgICAgICAgIHZhciBoYXNoID0gaGFzaElkeCA+IDAgPyBoYXNoSWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkb3QgPSBkb3RJZHggPiAwID8gZG90SWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciB0YWcgPSBoYXNoSWR4ICE9PSAtMSB8fCBkb3RJZHggIT09IC0xID8gc2VsLnNsaWNlKDAsIE1hdGgubWluKGhhc2gsIGRvdCkpIDogc2VsO1xuICAgICAgICAgICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgICAgICAgIGlmIChoYXNoIDwgZG90KVxuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ2lkJywgc2VsLnNsaWNlKGhhc2ggKyAxLCBkb3QpKTtcbiAgICAgICAgICAgIGlmIChkb3RJZHggPiAwKVxuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgc2VsLnNsaWNlKGRvdCArIDEpLnJlcGxhY2UoL1xcLi9nLCAnICcpKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5jcmVhdGVbaV0oZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzLnByaW1pdGl2ZSh2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gdm5vZGUuZGF0YS5ob29rOyAvLyBSZXVzZSB2YXJpYWJsZVxuICAgICAgICAgICAgaWYgKGlzRGVmKGkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkuY3JlYXRlKVxuICAgICAgICAgICAgICAgICAgICBpLmNyZWF0ZShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoaS5pbnNlcnQpXG4gICAgICAgICAgICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZub2RlLmVsbSA9IGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm5vZGUuZWxtO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0oY2gsIGluc2VydGVkVm5vZGVRdWV1ZSksIGJlZm9yZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gaW52b2tlRGVzdHJveUhvb2sodm5vZGUpIHtcbiAgICAgICAgdmFyIGksIGosIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuZGVzdHJveSkpXG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLmRlc3Ryb3lbaV0odm5vZGUpO1xuICAgICAgICAgICAgaWYgKHZub2RlLmNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgaSA9IHZub2RlLmNoaWxkcmVuW2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPSBudWxsICYmIHR5cGVvZiBpICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVWbm9kZXMocGFyZW50RWxtLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgpIHtcbiAgICAgICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgICAgICAgdmFyIGlfMSA9IHZvaWQgMCwgbGlzdGVuZXJzID0gdm9pZCAwLCBybSA9IHZvaWQgMCwgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYoY2guc2VsKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhjaCk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgICAgICAgICAgICAgcm0gPSBjcmVhdGVSbUNiKGNoLmVsbSwgbGlzdGVuZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpXzEgPSAwOyBpXzEgPCBjYnMucmVtb3ZlLmxlbmd0aDsgKytpXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICBjYnMucmVtb3ZlW2lfMV0oY2gsIHJtKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmKGlfMSA9IGNoLmRhdGEpICYmIGlzRGVmKGlfMSA9IGlfMS5ob29rKSAmJiBpc0RlZihpXzEgPSBpXzEucmVtb3ZlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaV8xKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBybSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1cGRhdGVDaGlsZHJlbihwYXJlbnRFbG0sIG9sZENoLCBuZXdDaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBvbGRTdGFydElkeCA9IDAsIG5ld1N0YXJ0SWR4ID0gMDtcbiAgICAgICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciBvbGRTdGFydFZub2RlID0gb2xkQ2hbMF07XG4gICAgICAgIHZhciBvbGRFbmRWbm9kZSA9IG9sZENoW29sZEVuZElkeF07XG4gICAgICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWzBdO1xuICAgICAgICB2YXIgbmV3RW5kVm5vZGUgPSBuZXdDaFtuZXdFbmRJZHhdO1xuICAgICAgICB2YXIgb2xkS2V5VG9JZHg7XG4gICAgICAgIHZhciBpZHhJbk9sZDtcbiAgICAgICAgdmFyIGVsbVRvTW92ZTtcbiAgICAgICAgdmFyIGJlZm9yZTtcbiAgICAgICAgd2hpbGUgKG9sZFN0YXJ0SWR4IDw9IG9sZEVuZElkeCAmJiBuZXdTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgICAgICAgIGlmIChvbGRTdGFydFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07IC8vIFZub2RlIG1pZ2h0IGhhdmUgYmVlbiBtb3ZlZCBsZWZ0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvbGRFbmRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdTdGFydFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdFbmRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkU3RhcnRWbm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhvbGRFbmRWbm9kZS5lbG0pKTtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZEtleVRvSWR4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkS2V5VG9JZHggPSBjcmVhdGVLZXlUb09sZElkeChvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkeEluT2xkID0gb2xkS2V5VG9JZHhbbmV3U3RhcnRWbm9kZS5rZXldO1xuICAgICAgICAgICAgICAgIGlmIChpc1VuZGVmKGlkeEluT2xkKSkge1xuICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxtVG9Nb3ZlID0gb2xkQ2hbaWR4SW5PbGRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxtVG9Nb3ZlLnNlbCAhPT0gbmV3U3RhcnRWbm9kZS5zZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgZWxtVG9Nb3ZlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICAgICAgICBiZWZvcmUgPSBuZXdDaFtuZXdFbmRJZHggKyAxXSA9PSBudWxsID8gbnVsbCA6IG5ld0NoW25ld0VuZElkeCArIDFdLmVsbTtcbiAgICAgICAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBob29rO1xuICAgICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEpICYmIGlzRGVmKGhvb2sgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBob29rLnByZXBhdGNoKSkge1xuICAgICAgICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgIHZhciBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuO1xuICAgICAgICB2YXIgY2ggPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKG9sZFZub2RlID09PSB2bm9kZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHZub2RlLmRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy51cGRhdGUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLnVwZGF0ZVtpXShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vaztcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKVxuICAgICAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkQ2ggIT09IGNoKVxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSlcbiAgICAgICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgICAgIGFkZFZub2RlcyhlbG0sIG51bGwsIGNoLCAwLCBjaC5sZW5ndGggLSAxLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlVm5vZGVzKGVsbSwgb2xkQ2gsIDAsIG9sZENoLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2xkVm5vZGUudGV4dCAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRGVmKGhvb2spICYmIGlzRGVmKGkgPSBob29rLnBvc3RwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gcGF0Y2gob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBlbG0sIHBhcmVudDtcbiAgICAgICAgdmFyIGluc2VydGVkVm5vZGVRdWV1ZSA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnByZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wcmVbaV0oKTtcbiAgICAgICAgaWYgKCFpc1Zub2RlKG9sZFZub2RlKSkge1xuICAgICAgICAgICAgb2xkVm5vZGUgPSBlbXB0eU5vZGVBdChvbGRWbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICAgICAgICBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgICAgICAgIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGVsbSk7XG4gICAgICAgICAgICBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnQsIHZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKGVsbSkpO1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnQsIFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbnNlcnRlZFZub2RlUXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KGluc2VydGVkVm5vZGVRdWV1ZVtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wb3N0Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgY2JzLnBvc3RbaV0oKTtcbiAgICAgICAgcmV0dXJuIHZub2RlO1xuICAgIH07XG59XG5leHBvcnRzLmluaXQgPSBpbml0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c25hYmJkb20uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmZ1bmN0aW9uIGNvcHlUb1RodW5rKHZub2RlLCB0aHVuaykge1xuICAgIHRodW5rLmVsbSA9IHZub2RlLmVsbTtcbiAgICB2bm9kZS5kYXRhLmZuID0gdGh1bmsuZGF0YS5mbjtcbiAgICB2bm9kZS5kYXRhLmFyZ3MgPSB0aHVuay5kYXRhLmFyZ3M7XG4gICAgdGh1bmsuZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdGh1bmsuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICB0aHVuay50ZXh0ID0gdm5vZGUudGV4dDtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG59XG5mdW5jdGlvbiBpbml0KHRodW5rKSB7XG4gICAgdmFyIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIHZub2RlID0gY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgY3VyLmFyZ3MpO1xuICAgIGNvcHlUb1RodW5rKHZub2RlLCB0aHVuayk7XG59XG5mdW5jdGlvbiBwcmVwYXRjaChvbGRWbm9kZSwgdGh1bmspIHtcbiAgICB2YXIgaSwgb2xkID0gb2xkVm5vZGUuZGF0YSwgY3VyID0gdGh1bmsuZGF0YTtcbiAgICB2YXIgb2xkQXJncyA9IG9sZC5hcmdzLCBhcmdzID0gY3VyLmFyZ3M7XG4gICAgaWYgKG9sZC5mbiAhPT0gY3VyLmZuIHx8IG9sZEFyZ3MubGVuZ3RoICE9PSBhcmdzLmxlbmd0aCkge1xuICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChvbGRBcmdzW2ldICE9PSBhcmdzW2ldKSB7XG4gICAgICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvcHlUb1RodW5rKG9sZFZub2RlLCB0aHVuayk7XG59XG5leHBvcnRzLnRodW5rID0gZnVuY3Rpb24gdGh1bmsoc2VsLCBrZXksIGZuLCBhcmdzKSB7XG4gICAgaWYgKGFyZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhcmdzID0gZm47XG4gICAgICAgIGZuID0ga2V5O1xuICAgICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBoXzEuaChzZWwsIHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGhvb2s6IHsgaW5pdDogaW5pdCwgcHJlcGF0Y2g6IHByZXBhdGNoIH0sXG4gICAgICAgIGZuOiBmbixcbiAgICAgICAgYXJnczogYXJnc1xuICAgIH0pO1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMudGh1bms7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aHVuay5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIGVsbSkge1xuICAgIHZhciBrZXkgPSBkYXRhID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBkYXRhLmtleTtcbiAgICByZXR1cm4geyBzZWw6IHNlbCwgZGF0YTogZGF0YSwgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICB0ZXh0OiB0ZXh0LCBlbG06IGVsbSwga2V5OiBrZXkgfTtcbn1cbmV4cG9ydHMudm5vZGUgPSB2bm9kZTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZub2RlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dm5vZGUuanMubWFwIiwiaW1wb3J0IHsgQ3RybCwgQ2hhdE9wdHMsIExpbmUsIFRhYiwgVmlld01vZGVsLCBSZWRyYXcsIFBlcm1pc3Npb25zLCBNb2RlcmF0aW9uQ3RybCB9IGZyb20gJy4vaW50ZXJmYWNlcydcbmltcG9ydCB7IHByZXNldEN0cmwgfSBmcm9tICcuL3ByZXNldCdcbmltcG9ydCB7IG5vdGVDdHJsIH0gZnJvbSAnLi9ub3RlJ1xuaW1wb3J0IHsgbW9kZXJhdGlvbkN0cmwgfSBmcm9tICcuL21vZGVyYXRpb24nXG5pbXBvcnQgeyBwcm9wIH0gZnJvbSAnY29tbW9uJztcblxuY29uc3QgbGkgPSB3aW5kb3cubGljaGVzcztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob3B0czogQ2hhdE9wdHMsIHJlZHJhdzogUmVkcmF3KTogQ3RybCB7XG5cbiAgY29uc3QgZGF0YSA9IG9wdHMuZGF0YTtcbiAgZGF0YS5kb21WZXJzaW9uID0gMTsgLy8gaW5jcmVtZW50IHRvIGZvcmNlIHJlZHJhd1xuICBjb25zdCBtYXhMaW5lcyA9IDIwMDtcbiAgY29uc3QgbWF4TGluZXNEcm9wID0gNTA7IC8vIGhvdyBtYW55IGxpbmVzIHRvIGRyb3AgYXQgb25jZVxuXG4gIGNvbnN0IHBhbGFudGlyID0ge1xuICAgIGluc3RhbmNlOiB1bmRlZmluZWQsXG4gICAgbG9hZGVkOiBmYWxzZSxcbiAgICBlbmFibGVkOiBwcm9wKCEhZGF0YS5wYWxhbnRpcilcbiAgfTtcblxuICBjb25zdCBhbGxUYWJzOiBUYWJbXSA9IFsnZGlzY3Vzc2lvbiddO1xuICBpZiAob3B0cy5ub3RlSWQpIGFsbFRhYnMucHVzaCgnbm90ZScpO1xuICBpZiAob3B0cy5wbHVnaW4pIGFsbFRhYnMucHVzaChvcHRzLnBsdWdpbi50YWIua2V5KTtcblxuICBjb25zdCB0YWJTdG9yYWdlID0gbGkuc3RvcmFnZS5tYWtlKCdjaGF0LnRhYicpLFxuICAgIHN0b3JlZFRhYiA9IHRhYlN0b3JhZ2UuZ2V0KCk7XG5cbiAgbGV0IG1vZGVyYXRpb246IE1vZGVyYXRpb25DdHJsIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHZtOiBWaWV3TW9kZWwgPSB7XG4gICAgdGFiOiBhbGxUYWJzLmZpbmQodGFiID0+IHRhYiA9PT0gc3RvcmVkVGFiKSB8fCBhbGxUYWJzWzBdLFxuICAgIGVuYWJsZWQ6IG9wdHMuYWx3YXlzRW5hYmxlZCB8fCAhbGkuc3RvcmFnZS5nZXQoJ25vY2hhdCcpLFxuICAgIHBsYWNlaG9sZGVyS2V5OiAndGFsa0luQ2hhdCcsXG4gICAgbG9hZGluZzogZmFsc2UsXG4gICAgdGltZW91dDogb3B0cy50aW1lb3V0LFxuICAgIHdyaXRlYWJsZTogb3B0cy53cml0ZWFibGVcbiAgfTtcblxuICAvKiBJZiBkaXNjdXNzaW9uIGlzIGRpc2FibGVkLCBhbmQgd2UgaGF2ZSBhbm90aGVyIGNoYXQgdGFiLFxuICAgKiB0aGVuIHNlbGVjdCB0aGF0IHRhYiBvdmVyIGRpc2N1c3Npb24gKi9cbiAgaWYgKGFsbFRhYnMubGVuZ3RoID4gMSAmJiB2bS50YWIgPT09ICdkaXNjdXNzaW9uJyAmJiBsaS5zdG9yYWdlLmdldCgnbm9jaGF0JykpIHZtLnRhYiA9IGFsbFRhYnNbMV07XG5cbiAgY29uc3QgcG9zdCA9IGZ1bmN0aW9uKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRleHQgPSB0ZXh0LnRyaW0oKTtcbiAgICBpZiAoIXRleHQpIHJldHVybjtcbiAgICBpZiAodGV4dC5sZW5ndGggPiAxNDApIHtcbiAgICAgIGFsZXJ0KCdNYXggbGVuZ3RoOiAxNDAgY2hhcnMuICcgKyB0ZXh0Lmxlbmd0aCArICcgY2hhcnMgdXNlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGkucHVic3ViLmVtaXQoJ3NvY2tldC5zZW5kJywgJ3RhbGsnLCB0ZXh0KTtcbiAgfTtcblxuICBjb25zdCBvblRpbWVvdXQgPSBmdW5jdGlvbih1c2VySWQ6IHN0cmluZykge1xuICAgIGRhdGEubGluZXMuZm9yRWFjaChsID0+IHtcbiAgICAgIGlmIChsLnUgJiYgbC51LnRvTG93ZXJDYXNlKCkgPT0gdXNlcklkKSBsLmQgPSB0cnVlO1xuICAgIH0pO1xuICAgIGlmICh1c2VySWQgPT0gZGF0YS51c2VySWQpIHZtLnRpbWVvdXQgPSB0cnVlO1xuICAgIGRhdGEuZG9tVmVyc2lvbisrO1xuICAgIHJlZHJhdygpO1xuICB9O1xuXG4gIGNvbnN0IG9uUmVpbnN0YXRlID0gZnVuY3Rpb24odXNlcklkOiBzdHJpbmcpIHtcbiAgICBpZiAodXNlcklkID09IGRhdGEudXNlcklkKSB7XG4gICAgICB2bS50aW1lb3V0ID0gZmFsc2U7XG4gICAgICByZWRyYXcoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgb25NZXNzYWdlID0gZnVuY3Rpb24obGluZTogTGluZSkge1xuICAgIGRhdGEubGluZXMucHVzaChsaW5lKTtcbiAgICBjb25zdCBuYiA9IGRhdGEubGluZXMubGVuZ3RoO1xuICAgIGlmIChuYiA+IG1heExpbmVzKSB7XG4gICAgICBkYXRhLmxpbmVzLnNwbGljZSgwLCBuYiAtIG1heExpbmVzICsgbWF4TGluZXNEcm9wKTtcbiAgICAgIGRhdGEuZG9tVmVyc2lvbisrO1xuICAgIH1cbiAgICByZWRyYXcoKTtcbiAgfTtcblxuICBjb25zdCBvbldyaXRlYWJsZSA9IGZ1bmN0aW9uKHY6IGJvb2xlYW4pIHtcbiAgICB2bS53cml0ZWFibGUgPSB2O1xuICAgIHJlZHJhdygpO1xuICB9XG5cbiAgY29uc3Qgb25QZXJtaXNzaW9ucyA9IGZ1bmN0aW9uKG9iajogUGVybWlzc2lvbnMpIHtcbiAgICBsZXQgcDoga2V5b2YgUGVybWlzc2lvbnM7XG4gICAgZm9yIChwIGluIG9iaikgb3B0cy5wZXJtaXNzaW9uc1twXSA9IG9ialtwXTtcbiAgICBpbnN0YW5jaWF0ZU1vZGVyYXRpb24oKTtcbiAgICByZWRyYXcoKTtcbiAgfVxuXG4gIGNvbnN0IHRyYW5zID0gbGkudHJhbnMob3B0cy5pMThuKTtcblxuICBmdW5jdGlvbiBjYW5Nb2QoKSB7XG4gICAgcmV0dXJuIG9wdHMucGVybWlzc2lvbnMudGltZW91dCB8fCBvcHRzLnBlcm1pc3Npb25zLmxvY2FsO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5zdGFuY2lhdGVNb2RlcmF0aW9uKCkge1xuICAgIG1vZGVyYXRpb24gPSBjYW5Nb2QoKSA/IG1vZGVyYXRpb25DdHJsKHtcbiAgICAgIHJlYXNvbnM6IG9wdHMudGltZW91dFJlYXNvbnMgfHwgKFt7a2V5OiAnb3RoZXInLCBuYW1lOiAnSW5hcHByb3ByaWF0ZSBiZWhhdmlvcid9XSksXG4gICAgICBwZXJtaXNzaW9uczogb3B0cy5wZXJtaXNzaW9ucyxcbiAgICAgIHJlZHJhd1xuICAgIH0pIDogdW5kZWZpbmVkO1xuICAgIGlmIChjYW5Nb2QoKSkgb3B0cy5sb2FkQ3NzKCdjaGF0Lm1vZCcpO1xuICB9XG4gIGluc3RhbmNpYXRlTW9kZXJhdGlvbigpO1xuXG4gIGNvbnN0IG5vdGUgPSBvcHRzLm5vdGVJZCA/IG5vdGVDdHJsKHtcbiAgICBpZDogb3B0cy5ub3RlSWQsXG4gICAgdHJhbnMsXG4gICAgcmVkcmF3XG4gIH0pIDogdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHByZXNldCA9IHByZXNldEN0cmwoe1xuICAgIGluaXRpYWxHcm91cDogb3B0cy5wcmVzZXQsXG4gICAgcG9zdCxcbiAgICByZWRyYXdcbiAgfSk7XG5cbiAgY29uc3Qgc3ViczogW3N0cmluZywgUHVic3ViQ2FsbGJhY2tdW10gID0gW1xuICAgIFsnc29ja2V0LmluLm1lc3NhZ2UnLCBvbk1lc3NhZ2VdLFxuICAgIFsnc29ja2V0LmluLmNoYXRfdGltZW91dCcsIG9uVGltZW91dF0sXG4gICAgWydzb2NrZXQuaW4uY2hhdF9yZWluc3RhdGUnLCBvblJlaW5zdGF0ZV0sXG4gICAgWydjaGF0LndyaXRlYWJsZScsIG9uV3JpdGVhYmxlXSxcbiAgICBbJ2NoYXQucGVybWlzc2lvbnMnLCBvblBlcm1pc3Npb25zXSxcbiAgICBbJ3BhbGFudGlyLnRvZ2dsZScsIHBhbGFudGlyLmVuYWJsZWRdXG4gIF07XG4gIHN1YnMuZm9yRWFjaCgoW2V2ZW50TmFtZSwgY2FsbGJhY2tdKSA9PiBsaS5wdWJzdWIub24oZXZlbnROYW1lLCBjYWxsYmFjaykpO1xuXG4gIGNvbnN0IGRlc3Ryb3kgPSAoKSA9PiB7XG4gICAgc3Vicy5mb3JFYWNoKChbZXZlbnROYW1lLCBjYWxsYmFja10pID0+IGxpLnB1YnN1Yi5vZmYoZXZlbnROYW1lLCBjYWxsYmFjaykpO1xuICB9O1xuXG4gIGNvbnN0IGVtaXRFbmFibGVkID0gKCkgPT4gbGkucHVic3ViLmVtaXQoJ2NoYXQuZW5hYmxlZCcsIHZtLmVuYWJsZWQpO1xuICBlbWl0RW5hYmxlZCgpO1xuXG4gIHJldHVybiB7XG4gICAgZGF0YSxcbiAgICBvcHRzLFxuICAgIHZtLFxuICAgIGFsbFRhYnMsXG4gICAgc2V0VGFiKHQ6IFRhYikge1xuICAgICAgdm0udGFiID0gdDtcbiAgICAgIHRhYlN0b3JhZ2Uuc2V0KHQpO1xuICAgICAgLy8gSXQncyBhIGxhbWUgd2F5IHRvIGRvIGl0LiBHaXZlIG1lIGEgYnJlYWsuXG4gICAgICBpZiAodCA9PT0gJ2Rpc2N1c3Npb24nKSBsaS5yZXF1ZXN0SWRsZUNhbGxiYWNrKCgpID0+ICQoJy5tY2hhdF9fc2F5JykuZm9jdXMoKSk7XG4gICAgICByZWRyYXcoKTtcbiAgICB9LFxuICAgIG1vZGVyYXRpb246ICgpID0+IG1vZGVyYXRpb24sXG4gICAgbm90ZSxcbiAgICBwcmVzZXQsXG4gICAgcG9zdCxcbiAgICB0cmFucyxcbiAgICBwbHVnaW46IG9wdHMucGx1Z2luLFxuICAgIHNldEVuYWJsZWQodjogYm9vbGVhbikge1xuICAgICAgdm0uZW5hYmxlZCA9IHY7XG4gICAgICBlbWl0RW5hYmxlZCgpO1xuICAgICAgaWYgKCF2KSBsaS5zdG9yYWdlLnNldCgnbm9jaGF0JywgJzEnKTtcbiAgICAgIGVsc2UgbGkuc3RvcmFnZS5yZW1vdmUoJ25vY2hhdCcpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSxcbiAgICByZWRyYXcsXG4gICAgcGFsYW50aXIsXG4gICAgZGVzdHJveVxuICB9O1xufTtcbiIsImltcG9ydCB7IGgsIHRodW5rIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVEYXRhIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBDdHJsLCBMaW5lIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0ICogYXMgc3BhbSBmcm9tICcuL3NwYW0nXG5pbXBvcnQgKiBhcyBlbmhhbmNlIGZyb20gJy4vZW5oYW5jZSc7XG5pbXBvcnQgeyBwcmVzZXRWaWV3IH0gZnJvbSAnLi9wcmVzZXQnO1xuaW1wb3J0IHsgbGluZUFjdGlvbiBhcyBtb2RMaW5lQWN0aW9uIH0gZnJvbSAnLi9tb2RlcmF0aW9uJztcbmltcG9ydCB7IHVzZXJMaW5rIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IGZsYWcgfSBmcm9tICcuL3hocidcblxuY29uc3Qgd2hpc3BlclJlZ2V4ID0gL15cXC93KD86aGlzcGVyKT9cXHMvO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBDdHJsKTogQXJyYXk8Vk5vZGUgfCB1bmRlZmluZWQ+IHtcbiAgaWYgKCFjdHJsLnZtLmVuYWJsZWQpIHJldHVybiBbXTtcbiAgY29uc3Qgc2Nyb2xsQ2IgPSAodm5vZGU6IFZOb2RlKSA9PiB7XG4gICAgY29uc3QgZWwgPSB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnRcbiAgICBpZiAoY3RybC5kYXRhLmxpbmVzLmxlbmd0aCA+IDUpIHtcbiAgICAgIGNvbnN0IGF1dG9TY3JvbGwgPSAoZWwuc2Nyb2xsVG9wID09PSAwIHx8IChlbC5zY3JvbGxUb3AgPiAoZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0IC0gMTAwKSkpO1xuICAgICAgaWYgKGF1dG9TY3JvbGwpIHtcbiAgICAgICAgZWwuc2Nyb2xsVG9wID0gOTk5OTk5O1xuICAgICAgICBzZXRUaW1lb3V0KChfOiBhbnkpID0+IGVsLnNjcm9sbFRvcCA9IDk5OTk5OSwgMzAwKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgbW9kID0gY3RybC5tb2RlcmF0aW9uKCk7XG4gIGNvbnN0IHZub2RlcyA9IFtcbiAgICBoKCdvbC5tY2hhdF9fbWVzc2FnZXMuY2hhdC12LScgKyBjdHJsLmRhdGEuZG9tVmVyc2lvbiwge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcm9sZTogJ2xvZycsXG4gICAgICAgICdhcmlhLWxpdmUnOiAncG9saXRlJyxcbiAgICAgICAgJ2FyaWEtYXRvbWljJzogZmFsc2VcbiAgICAgIH0sXG4gICAgICBob29rOiB7XG4gICAgICAgIGluc2VydCh2bm9kZSkge1xuICAgICAgICAgIGNvbnN0ICRlbCA9ICQodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5vbignY2xpY2snLCAnYS5qdW1wJywgKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnanVtcCcsIChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0QXR0cmlidXRlKCdkYXRhLXBseScpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAobW9kKSAkZWwub24oJ2NsaWNrJywgJy5tb2QnLCAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIG1vZC5vcGVuKCgoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEF0dHJpYnV0ZSgnZGF0YS11c2VybmFtZScpIGFzIHN0cmluZykuc3BsaXQoJyAnKVswXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWxzZSAkZWwub24oJ2NsaWNrJywgJy5mbGFnJywgKGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgcmVwb3J0KGN0cmwsIChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICApO1xuICAgICAgICAgIHNjcm9sbENiKHZub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdHBhdGNoOiAoXywgdm5vZGUpID0+IHNjcm9sbENiKHZub2RlKVxuICAgICAgfVxuICAgIH0sIHNlbGVjdExpbmVzKGN0cmwpLm1hcChsaW5lID0+IHJlbmRlckxpbmUoY3RybCwgbGluZSkpKSxcbiAgICByZW5kZXJJbnB1dChjdHJsKVxuICBdO1xuICBjb25zdCBwcmVzZXRzID0gcHJlc2V0VmlldyhjdHJsLnByZXNldCk7XG4gIGlmIChwcmVzZXRzKSB2bm9kZXMucHVzaChwcmVzZXRzKVxuICByZXR1cm4gdm5vZGVzO1xufVxuXG5mdW5jdGlvbiByZW5kZXJJbnB1dChjdHJsOiBDdHJsKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIWN0cmwudm0ud3JpdGVhYmxlKSByZXR1cm47XG4gIGlmICgoY3RybC5kYXRhLmxvZ2luUmVxdWlyZWQgJiYgIWN0cmwuZGF0YS51c2VySWQpIHx8IGN0cmwuZGF0YS5yZXN0cmljdGVkKVxuICAgIHJldHVybiBoKCdpbnB1dC5tY2hhdF9fc2F5Jywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcGxhY2Vob2xkZXI6IGN0cmwudHJhbnMoJ2xvZ2luVG9DaGF0JyksXG4gICAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIGxldCBwbGFjZWhvbGRlcjogc3RyaW5nO1xuICBpZiAoY3RybC52bS50aW1lb3V0KSBwbGFjZWhvbGRlciA9IGN0cmwudHJhbnMoJ3lvdUhhdmVCZWVuVGltZWRPdXQnKTtcbiAgZWxzZSBpZiAoY3RybC5vcHRzLmJsaW5kKSBwbGFjZWhvbGRlciA9ICdDaGF0JztcbiAgZWxzZSBwbGFjZWhvbGRlciA9IGN0cmwudHJhbnMubm9hcmcoY3RybC52bS5wbGFjZWhvbGRlcktleSk7XG4gIHJldHVybiBoKCdpbnB1dC5tY2hhdF9fc2F5Jywge1xuICAgIGF0dHJzOiB7XG4gICAgICBwbGFjZWhvbGRlcixcbiAgICAgIGF1dG9jb21wbGV0ZTogJ29mZicsXG4gICAgICBtYXhsZW5ndGg6IDE0MCxcbiAgICAgIGRpc2FibGVkOiBjdHJsLnZtLnRpbWVvdXQgfHwgIWN0cmwudm0ud3JpdGVhYmxlXG4gICAgfSxcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgICAgc2V0dXBIb29rcyhjdHJsLCB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmxldCBtb3VjaExpc3RlbmVyOiBFdmVudExpc3RlbmVyO1xuXG5jb25zdCBzZXR1cEhvb2tzID0gKGN0cmw6IEN0cmwsIGNoYXRFbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgY2hhdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJyxcbiAgICAoZTogS2V5Ym9hcmRFdmVudCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgICAgIHR4dCA9IGVsLnZhbHVlLFxuICAgICAgICBwdWIgPSBjdHJsLm9wdHMucHVibGljO1xuICAgICAgaWYgKGUud2hpY2ggPT0gMTAgfHwgZS53aGljaCA9PSAxMykge1xuICAgICAgICBpZiAodHh0ID09PSAnJykgJCgnLmtleWJvYXJkLW1vdmUgaW5wdXQnKS5mb2N1cygpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzcGFtLnJlcG9ydCh0eHQpO1xuICAgICAgICAgIGlmIChwdWIgJiYgc3BhbS5oYXNUZWFtVXJsKHR4dCkpIGFsZXJ0KFwiUGxlYXNlIGRvbid0IGFkdmVydGlzZSB0ZWFtcyBpbiB0aGUgY2hhdC5cIik7XG4gICAgICAgICAgZWxzZSBjdHJsLnBvc3QodHh0KTtcbiAgICAgICAgICBlbC52YWx1ZSA9ICcnO1xuICAgICAgICAgIGlmICghcHViKSBlbC5jbGFzc0xpc3QucmVtb3ZlKCd3aGlzcGVyJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyk7XG4gICAgICAgIGlmICghcHViKSBlbC5jbGFzc0xpc3QudG9nZ2xlKCd3aGlzcGVyJywgISF0eHQubWF0Y2god2hpc3BlclJlZ2V4KSk7XG4gICAgICB9XG4gICAgfSlcbiAgKTtcblxuICB3aW5kb3cuTW91c2V0cmFwLmJpbmQoJ2MnLCAoKSA9PiB7XG4gICAgY2hhdEVsLmZvY3VzKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICB3aW5kb3cuTW91c2V0cmFwKGNoYXRFbCkuYmluZCgnZXNjJywgKCkgPT4gY2hhdEVsLmJsdXIoKSk7XG5cblxuICAvLyBFbnN1cmUgY2xpY2tzIHJlbW92ZSBjaGF0IGZvY3VzLlxuICAvLyBTZWUgb3JuaWNhci9jaGVzc2dyb3VuZCMxMDlcblxuICBjb25zdCBtb3VjaEV2ZW50cyA9IFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXTtcblxuICBpZiAobW91Y2hMaXN0ZW5lcikgbW91Y2hFdmVudHMuZm9yRWFjaChldmVudCA9PlxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbW91Y2hMaXN0ZW5lciwge2NhcHR1cmU6IHRydWV9KVxuICApO1xuXG4gIG1vdWNoTGlzdGVuZXIgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgIGlmICghZS5zaGlmdEtleSAmJiBlLmJ1dHRvbnMgIT09IDIgJiYgZS5idXR0b24gIT09IDIpIGNoYXRFbC5ibHVyKCk7XG4gIH07XG5cbiAgY2hhdEVsLm9uZm9jdXMgPSAoKSA9PlxuICAgIG1vdWNoRXZlbnRzLmZvckVhY2goZXZlbnQgPT5cbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbW91Y2hMaXN0ZW5lcixcbiAgICAgICAge3Bhc3NpdmU6IHRydWUsIGNhcHR1cmU6IHRydWV9XG4gICAgICApKTtcblxuICBjaGF0RWwub25ibHVyID0gKCkgPT5cbiAgICBtb3VjaEV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG1vdWNoTGlzdGVuZXIsIHtjYXB0dXJlOiB0cnVlfSlcbiAgICApO1xufTtcblxuZnVuY3Rpb24gc2FtZUxpbmVzKGwxOiBMaW5lLCBsMjogTGluZSkge1xuICByZXR1cm4gbDEuZCAmJiBsMi5kICYmIGwxLnUgPT09IGwyLnU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdExpbmVzKGN0cmw6IEN0cmwpOiBBcnJheTxMaW5lPiB7XG4gIGxldCBwcmV2OiBMaW5lLCBsczogQXJyYXk8TGluZT4gPSBbXTtcbiAgY3RybC5kYXRhLmxpbmVzLmZvckVhY2gobGluZSA9PiB7XG4gICAgaWYgKCFsaW5lLmQgJiZcbiAgICAgICghcHJldiB8fCAhc2FtZUxpbmVzKHByZXYsIGxpbmUpKSAmJlxuICAgICAgKCFsaW5lLnIgfHwgKGxpbmUudSB8fCAnJykudG9Mb3dlckNhc2UoKSA9PSBjdHJsLmRhdGEudXNlcklkKSAmJlxuICAgICAgIXNwYW0uc2tpcChsaW5lLnQpXG4gICAgKSBscy5wdXNoKGxpbmUpO1xuICAgIHByZXYgPSBsaW5lO1xuICB9KTtcbiAgcmV0dXJuIGxzO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUZXh0KHBhcnNlTW92ZXM6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIChvbGRWbm9kZTogVk5vZGUsIHZub2RlOiBWTm9kZSkgPT4ge1xuICAgIGlmICgodm5vZGUuZGF0YSBhcyBWTm9kZURhdGEpLmxpY2hlc3NDaGF0ICE9PSAob2xkVm5vZGUuZGF0YSBhcyBWTm9kZURhdGEpLmxpY2hlc3NDaGF0KSB7XG4gICAgICAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5pbm5lckhUTUwgPSBlbmhhbmNlLmVuaGFuY2UoKHZub2RlLmRhdGEgYXMgVk5vZGVEYXRhKS5saWNoZXNzQ2hhdCwgcGFyc2VNb3Zlcyk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiByZW5kZXJUZXh0KHQ6IHN0cmluZywgcGFyc2VNb3ZlczogYm9vbGVhbikge1xuICBpZiAoZW5oYW5jZS5pc01vcmVUaGFuVGV4dCh0KSkge1xuICAgIGNvbnN0IGhvb2sgPSB1cGRhdGVUZXh0KHBhcnNlTW92ZXMpO1xuICAgIHJldHVybiBoKCd0Jywge1xuICAgICAgbGljaGVzc0NoYXQ6IHQsXG4gICAgICBob29rOiB7XG4gICAgICAgIGNyZWF0ZTogaG9vayxcbiAgICAgICAgdXBkYXRlOiBob29rXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGgoJ3QnLCB0KTtcbn1cblxuZnVuY3Rpb24gcmVwb3J0KGN0cmw6IEN0cmwsIGxpbmU6IEhUTUxFbGVtZW50KSB7XG4gIGNvbnN0IHVzZXJBID0gbGluZS5xdWVyeVNlbGVjdG9yKCdhLnVzZXItbGluaycpIGFzIEhUTUxMaW5rRWxlbWVudDtcbiAgY29uc3QgdGV4dCA9IChsaW5lLnF1ZXJ5U2VsZWN0b3IoJ3QnKSBhcyBIVE1MRWxlbWVudCkuaW5uZXJUZXh0O1xuICBpZiAodXNlckEgJiYgY29uZmlybShgUmVwb3J0IFwiJHt0ZXh0fVwiIHRvIG1vZGVyYXRvcnM/YCkpIGZsYWcoXG4gICAgY3RybC5kYXRhLnJlc291cmNlSWQsXG4gICAgdXNlckEuaHJlZi5zcGxpdCgnLycpWzRdLFxuICAgIHRleHRcbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTGluZShjdHJsOiBDdHJsLCBsaW5lOiBMaW5lKSB7XG5cbiAgY29uc3QgdGV4dE5vZGUgPSByZW5kZXJUZXh0KGxpbmUudCwgY3RybC5vcHRzLnBhcnNlTW92ZXMpO1xuXG4gIGlmIChsaW5lLnUgPT09ICdsaWNoZXNzJykgcmV0dXJuIGgoJ2xpLnN5c3RlbScsIHRleHROb2RlKTtcblxuICBpZiAobGluZS5jKSByZXR1cm4gaCgnbGknLCBbXG4gICAgaCgnc3Bhbi5jb2xvcicsICdbJyArIGxpbmUuYyArICddJyksXG4gICAgdGV4dE5vZGVcbiAgXSk7XG5cbiAgY29uc3QgdXNlck5vZGUgPSB0aHVuaygnYScsIGxpbmUudSwgdXNlckxpbmssIFtsaW5lLnUsIGxpbmUudGl0bGVdKTtcblxuICByZXR1cm4gaCgnbGknLCB7XG4gIH0sIGN0cmwubW9kZXJhdGlvbigpID8gW1xuICAgIGxpbmUudSA/IG1vZExpbmVBY3Rpb24obGluZS51KSA6IG51bGwsXG4gICAgdXNlck5vZGUsXG4gICAgdGV4dE5vZGVcbiAgXSA6IFtcbiAgICBjdHJsLmRhdGEudXNlcklkICYmIGxpbmUudSAmJiBjdHJsLmRhdGEudXNlcklkICE9IGxpbmUudSA/IGgoJ2kuZmxhZycsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAnIScsXG4gICAgICAgIHRpdGxlOiAnUmVwb3J0J1xuICAgICAgfVxuICAgIH0pIDogbnVsbCxcbiAgICB1c2VyTm9kZSxcbiAgICB0ZXh0Tm9kZVxuICBdKTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBlbmhhbmNlKHRleHQ6IHN0cmluZywgcGFyc2VNb3ZlczogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IGVzY2FwZWQgPSB3aW5kb3cubGljaGVzcy5lc2NhcGVIdG1sKHRleHQpO1xuICBjb25zdCBsaW5rZWQgPSBhdXRvTGluayhlc2NhcGVkKTtcbiAgY29uc3QgcGxpZWQgPSBwYXJzZU1vdmVzICYmIGxpbmtlZCA9PT0gZXNjYXBlZCA/IGFkZFBsaWVzKGxpbmtlZCkgOiBsaW5rZWQ7XG4gIHJldHVybiBwbGllZDtcbn1cblxuY29uc3QgbW9yZVRoYW5UZXh0UGF0dGVybiA9IC9bJjw+XCJAXS87XG5jb25zdCBwb3NzaWJsZUxpbmtQYXR0ZXJuID0gL1xcLlxcdy87XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01vcmVUaGFuVGV4dChzdHI6IHN0cmluZykge1xuICByZXR1cm4gbW9yZVRoYW5UZXh0UGF0dGVybi50ZXN0KHN0cikgfHwgcG9zc2libGVMaW5rUGF0dGVybi50ZXN0KHN0cik7XG59XG5cbmNvbnN0IGxpbmtQYXR0ZXJuID0gL1xcYihodHRwcz86XFwvXFwvfGxpY2hlc3NcXC5vcmdcXC8pWy3igJPigJRcXHcrJidAI1xcLyU/PSgpfnwhOiwuO10rW1xcdysmQCNcXC8lPX58XS9naTtcblxuZnVuY3Rpb24gbGlua1JlcGxhY2UodXJsOiBzdHJpbmcsIHNjaGVtZTogc3RyaW5nKSB7XG4gIGlmICh1cmwuaW5jbHVkZXMoJyZxdW90OycpKSByZXR1cm4gdXJsO1xuICBjb25zdCBmdWxsVXJsID0gc2NoZW1lID09PSAnbGljaGVzcy5vcmcvJyA/ICdodHRwczovLycgKyB1cmwgOiB1cmw7XG4gIGNvbnN0IG1pblVybCA9IHVybC5yZXBsYWNlKC9eaHR0cHM6XFwvXFwvLywgJycpO1xuICByZXR1cm4gJzxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vZm9sbG93XCIgaHJlZj1cIicgKyBmdWxsVXJsICsgJ1wiPicgKyBtaW5VcmwgKyAnPC9hPic7XG59XG5cbmNvbnN0IHVzZXJQYXR0ZXJuID0gLyhefFteXFx3QCMvXSlAKFtcXHctXXsyLH0pL2c7XG5jb25zdCBwYXduRHJvcFBhdHRlcm4gPSAvXlthLWhdWzItN10kLztcblxuZnVuY3Rpb24gdXNlckxpbmtSZXBsYWNlKG9yaWc6IHN0cmluZywgcHJlZml4OiBTdHJpbmcsIHVzZXI6IHN0cmluZykge1xuICBpZiAodXNlci5sZW5ndGggPiAyMCB8fCB1c2VyLm1hdGNoKHBhd25Ecm9wUGF0dGVybikpIHJldHVybiBvcmlnO1xuICByZXR1cm4gcHJlZml4ICsgJzxhIGhyZWY9XCIvQC8nICsgdXNlciArICdcIj5AJyArIHVzZXIgKyBcIjwvYT5cIjtcbn1cblxuZnVuY3Rpb24gYXV0b0xpbmsoaHRtbDogc3RyaW5nKSB7XG4gIHJldHVybiBodG1sLnJlcGxhY2UodXNlclBhdHRlcm4sIHVzZXJMaW5rUmVwbGFjZSkucmVwbGFjZShsaW5rUGF0dGVybiwgbGlua1JlcGxhY2UpO1xufVxuXG5jb25zdCBtb3ZlUGF0dGVybiA9IC9cXGIoXFxkKylcXHMqKFxcLispXFxzKig/OltvMC1dK1tvMF18W05CUlFLUF0/W2EtaF0/WzEtOF0/W3hAXT9bYS16XVsxLThdKD86PVtOQlJRS10pPylcXCs/XFwjP1shXFw/PV17MCw1fS9naTtcbmZ1bmN0aW9uIG1vdmVSZXBsYWNlcihtYXRjaDogc3RyaW5nLCB0dXJuOiBudW1iZXIsIGRvdHM6IHN0cmluZykge1xuICBpZiAodHVybiA8IDEgfHwgdHVybiA+IDIwMCkgcmV0dXJuIG1hdGNoO1xuICBjb25zdCBwbHkgPSB0dXJuICogMiAtIChkb3RzLmxlbmd0aCA+IDEgPyAwIDogMSk7XG4gIHJldHVybiAnPGEgY2xhc3M9XCJqdW1wXCIgZGF0YS1wbHk9XCInICsgcGx5ICsgJ1wiPicgKyBtYXRjaCArICc8L2E+Jztcbn1cblxuZnVuY3Rpb24gYWRkUGxpZXMoaHRtbDogc3RyaW5nKSB7XG4gIHJldHVybiBodG1sLnJlcGxhY2UobW92ZVBhdHRlcm4sIG1vdmVSZXBsYWNlcik7XG59XG4iLCJpbXBvcnQgeyBpbml0IH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuaW1wb3J0IG1ha2VDdHJsIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgdmlldyBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHsgQ2hhdE9wdHMsIEN0cmwgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgeyBQcmVzZXRDdHJsIH0gZnJvbSAnLi9wcmVzZXQnXG5cbmltcG9ydCBrbGFzcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJztcbmltcG9ydCBhdHRyaWJ1dGVzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcyc7XG5cbmV4cG9ydCB7IEN0cmwgYXMgQ2hhdEN0cmwsIENoYXRQbHVnaW4gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMaWNoZXNzQ2hhdChlbGVtZW50OiBFbGVtZW50LCBvcHRzOiBDaGF0T3B0cyk6IHtcbiAgcHJlc2V0OiBQcmVzZXRDdHJsXG59IHtcbiAgY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlc10pO1xuXG4gIGxldCB2bm9kZTogVk5vZGUsIGN0cmw6IEN0cmxcblxuICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgdm5vZGUgPSBwYXRjaCh2bm9kZSwgdmlldyhjdHJsKSk7XG4gIH1cblxuICBjdHJsID0gbWFrZUN0cmwob3B0cywgcmVkcmF3KTtcblxuICBjb25zdCBibHVlcHJpbnQgPSB2aWV3KGN0cmwpO1xuICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICB2bm9kZSA9IHBhdGNoKGVsZW1lbnQsIGJsdWVwcmludCk7XG5cbiAgcmV0dXJuIGN0cmw7XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IE1vZGVyYXRpb25DdHJsLCBNb2RlcmF0aW9uT3B0cywgTW9kZXJhdGlvbkRhdGEsIE1vZGVyYXRpb25SZWFzb24gfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgeyB1c2VyTW9kSW5mbyB9IGZyb20gJy4veGhyJ1xuaW1wb3J0IHsgdXNlckxpbmssIHNwaW5uZXIsIGJpbmQgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gbW9kZXJhdGlvbkN0cmwob3B0czogTW9kZXJhdGlvbk9wdHMpOiBNb2RlcmF0aW9uQ3RybCB7XG5cbiAgbGV0IGRhdGE6IE1vZGVyYXRpb25EYXRhIHwgdW5kZWZpbmVkO1xuICBsZXQgbG9hZGluZyA9IGZhbHNlO1xuXG4gIGNvbnN0IG9wZW4gPSAodXNlcm5hbWU6IHN0cmluZykgPT4ge1xuICAgIGlmIChvcHRzLnBlcm1pc3Npb25zLnRpbWVvdXQpIHtcbiAgICAgIGxvYWRpbmcgPSB0cnVlO1xuICAgICAgdXNlck1vZEluZm8odXNlcm5hbWUpLnRoZW4oZCA9PiB7XG4gICAgICAgIGRhdGEgPSBkO1xuICAgICAgICBsb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIG9wdHMucmVkcmF3KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgaWQ6IHVzZXJuYW1lLFxuICAgICAgICB1c2VybmFtZVxuICAgICAgfTtcbiAgICB9XG4gICAgb3B0cy5yZWRyYXcoKTtcbiAgfTtcblxuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBkYXRhID0gdW5kZWZpbmVkO1xuICAgIGxvYWRpbmcgPSBmYWxzZTtcbiAgICBvcHRzLnJlZHJhdygpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbG9hZGluZzogKCkgPT4gbG9hZGluZyxcbiAgICBkYXRhOiAoKSA9PiBkYXRhLFxuICAgIHJlYXNvbnM6IG9wdHMucmVhc29ucyxcbiAgICBwZXJtaXNzaW9uczogKCkgPT4gb3B0cy5wZXJtaXNzaW9ucyxcbiAgICBvcGVuLFxuICAgIGNsb3NlLFxuICAgIHRpbWVvdXQocmVhc29uOiBNb2RlcmF0aW9uUmVhc29uKSB7XG4gICAgICBkYXRhICYmIHdpbmRvdy5saWNoZXNzLnB1YnN1Yi5lbWl0KCdzb2NrZXQuc2VuZCcsICd0aW1lb3V0Jywge1xuICAgICAgICB1c2VySWQ6IGRhdGEuaWQsXG4gICAgICAgIHJlYXNvbjogcmVhc29uLmtleVxuICAgICAgfSk7XG4gICAgICBjbG9zZSgpO1xuICAgICAgb3B0cy5yZWRyYXcoKTtcbiAgICB9LFxuICAgIHNoYWRvd2JhbigpIHtcbiAgICAgIGxvYWRpbmcgPSB0cnVlO1xuICAgICAgZGF0YSAmJiAkLnBvc3QoJy9tb2QvJyArIGRhdGEuaWQgKyAnL3Ryb2xsL3RydWUnKS50aGVuKCgpID0+IGRhdGEgJiYgb3BlbihkYXRhLnVzZXJuYW1lKSk7XG4gICAgICBvcHRzLnJlZHJhdygpO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVBY3Rpb24odXNlcm5hbWU6IHN0cmluZykge1xuICByZXR1cm4gaCgnaS5tb2QnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgICdkYXRhLWljb24nOiAn7oCCJyxcbiAgICAgICdkYXRhLXVzZXJuYW1lJzogdXNlcm5hbWUsXG4gICAgICB0aXRsZTogJ01vZGVyYXRpb24nXG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZGVyYXRpb25WaWV3KGN0cmw/OiBNb2RlcmF0aW9uQ3RybCk6IFZOb2RlW10gfCB1bmRlZmluZWQge1xuICBpZiAoIWN0cmwpIHJldHVybjtcbiAgaWYgKGN0cmwubG9hZGluZygpKSByZXR1cm4gW2goJ2Rpdi5sb2FkaW5nJywgc3Bpbm5lcigpKV07XG4gIGNvbnN0IGRhdGEgPSBjdHJsLmRhdGEoKTtcbiAgaWYgKCFkYXRhKSByZXR1cm47XG4gIGNvbnN0IHBlcm1zID0gY3RybC5wZXJtaXNzaW9ucygpO1xuXG4gIGNvbnN0IGluZm9zID0gZGF0YS5oaXN0b3J5ID8gaCgnZGl2LmluZm9zLmJsb2NrJywgW1xuICAgIHdpbmRvdy5saWNoZXNzLm51bWJlckZvcm1hdChkYXRhLmdhbWVzIHx8IDApICsgJyBnYW1lcycsXG4gICAgZGF0YS50cm9sbCA/ICdUUk9MTCcgOiB1bmRlZmluZWQsXG4gICAgZGF0YS5lbmdpbmUgPyAnRU5HSU5FJyA6IHVuZGVmaW5lZCxcbiAgICBkYXRhLmJvb3N0ZXIgPyAnQk9PU1RFUicgOiB1bmRlZmluZWRcbiAgXS5tYXAodCA9PiB0ICYmIGgoJ3NwYW4nLCB0KSkuY29uY2F0KFtcbiAgICBoKCdhJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgaHJlZjogJy9ALycgKyBkYXRhLnVzZXJuYW1lICsgJz9tb2QnXG4gICAgICB9XG4gICAgfSwgJ3Byb2ZpbGUnKVxuICBdKS5jb25jYXQoXG4gICAgcGVybXMuc2hhZG93YmFuID8gW1xuICAgICAgaCgnYScsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBocmVmOiAnL21vZC8nICsgZGF0YS51c2VybmFtZSArICcvY29tbXVuaWNhdGlvbidcbiAgICAgICAgfVxuICAgICAgfSwgJ2NvbXMnKVxuICAgIF0gOiBbXSkpIDogdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgdGltZW91dCA9IHBlcm1zLnRpbWVvdXQgPyBoKCdkaXYudGltZW91dC5ibG9jaycsIFtcbiAgICAgIGgoJ3N0cm9uZycsICdUaW1lb3V0IDEwIG1pbnV0ZXMgZm9yJyksXG4gICAgICAuLi5jdHJsLnJlYXNvbnMubWFwKHIgPT4ge1xuICAgICAgICByZXR1cm4gaCgnYS50ZXh0Jywge1xuICAgICAgICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiAncCcgfSxcbiAgICAgICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwudGltZW91dChyKSlcbiAgICAgICAgfSwgci5uYW1lKTtcbiAgICAgIH0pLFxuICAgICAgLi4uKFxuICAgICAgICAoZGF0YS50cm9sbCB8fCAhcGVybXMuc2hhZG93YmFuKSA/IFtdIDogW2goJ2Rpdi5zaGFkb3diYW4nLCBbXG4gICAgICAgICAgJ09yICcsXG4gICAgICAgICAgaCgnYnV0dG9uLmJ1dHRvbi5idXR0b24tcmVkLmJ1dHRvbi1lbXB0eScsIHtcbiAgICAgICAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgY3RybC5zaGFkb3diYW4pXG4gICAgICAgICAgfSwgJ3NoYWRvd2JhbicpXG4gICAgICAgIF0pXSlcbiAgICBdKSA6IGgoJ2Rpdi50aW1lb3V0LmJsb2NrJywgW1xuICAgICAgaCgnc3Ryb25nJywgJ01vZGVyYXRpb24nKSxcbiAgICAgIGgoJ2EudGV4dCcsIHtcbiAgICAgICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6ICdwJyB9LFxuICAgICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwudGltZW91dChjdHJsLnJlYXNvbnNbMF0pKVxuICAgICAgfSwgJ1RpbWVvdXQgMTAgbWludXRlcycpXG4gICAgXSk7XG5cbiAgICBjb25zdCBoaXN0b3J5ID0gZGF0YS5oaXN0b3J5ID8gaCgnZGl2Lmhpc3RvcnkuYmxvY2snLCBbXG4gICAgICBoKCdzdHJvbmcnLCAnVGltZW91dCBoaXN0b3J5JyksXG4gICAgICBoKCd0YWJsZScsIGgoJ3Rib2R5LnNsaXN0Jywge1xuICAgICAgICBob29rOiB7XG4gICAgICAgICAgaW5zZXJ0OiAoKSA9PiB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnY29udGVudF9sb2FkZWQnKVxuICAgICAgICB9XG4gICAgICB9LCBkYXRhLmhpc3RvcnkubWFwKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIGgoJ3RyJywgW1xuICAgICAgICAgIGgoJ3RkLnJlYXNvbicsIGUucmVhc29uKSxcbiAgICAgICAgICBoKCd0ZC5tb2QnLCBlLm1vZCksXG4gICAgICAgICAgaCgndGQnLCBoKCd0aW1lLnRpbWVhZ28nLCB7XG4gICAgICAgICAgICBhdHRyczogeyBkYXRldGltZTogZS5kYXRlIH1cbiAgICAgICAgICB9KSlcbiAgICAgICAgXSk7XG4gICAgICB9KSkpXG4gICAgXSkgOiB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gW1xuICAgICAgaCgnZGl2LnRvcCcsIHsga2V5OiAnbW9kLScgKyBkYXRhLmlkIH0sIFtcbiAgICAgICAgaCgnc3Bhbi50ZXh0Jywge1xuICAgICAgICAgIGF0dHJzOiB7J2RhdGEtaWNvbic6ICfugIInIH0sXG4gICAgICAgIH0sIFt1c2VyTGluayhkYXRhLnVzZXJuYW1lKV0pLFxuICAgICAgICBoKCdhJywge1xuICAgICAgICAgIGF0dHJzOiB7J2RhdGEtaWNvbic6ICdMJ30sXG4gICAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCBjdHJsLmNsb3NlKVxuICAgICAgICB9KVxuICAgICAgXSksXG4gICAgICBoKCdkaXYubWNoYXRfX2NvbnRlbnQubW9kZXJhdGlvbicsIFtcbiAgICAgICAgaW5mb3MsXG4gICAgICAgIHRpbWVvdXQsXG4gICAgICAgIGhpc3RvcnlcbiAgICAgIF0pXG4gICAgXTtcbn07XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgTm90ZUN0cmwsIE5vdGVPcHRzIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0ICogYXMgeGhyIGZyb20gJy4veGhyJ1xuaW1wb3J0IHsgc3Bpbm5lciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIG5vdGVDdHJsKG9wdHM6IE5vdGVPcHRzKTogTm90ZUN0cmwge1xuICBsZXQgdGV4dDogc3RyaW5nXG4gIGNvbnN0IGRvUG9zdCA9IHdpbmRvdy5saWNoZXNzLmRlYm91bmNlKCgpID0+IHtcbiAgICB4aHIuc2V0Tm90ZShvcHRzLmlkLCB0ZXh0KTtcbiAgfSwgMTAwMCk7XG4gIHJldHVybiB7XG4gICAgaWQ6IG9wdHMuaWQsXG4gICAgdHJhbnM6IG9wdHMudHJhbnMsXG4gICAgdGV4dDogKCkgPT4gdGV4dCxcbiAgICBmZXRjaCgpIHtcbiAgICAgIHhoci5nZXROb3RlKG9wdHMuaWQpLnRoZW4odCA9PiB7XG4gICAgICAgIHRleHQgPSB0IHx8ICcnO1xuICAgICAgICBvcHRzLnJlZHJhdygpXG4gICAgICB9KVxuICAgIH0sXG4gICAgcG9zdCh0KSB7XG4gICAgICB0ZXh0ID0gdDtcbiAgICAgIGRvUG9zdCgpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RlVmlldyhjdHJsOiBOb3RlQ3RybCk6IFZOb2RlIHtcbiAgY29uc3QgdGV4dCA9IGN0cmwudGV4dCgpO1xuICBpZiAodGV4dCA9PSB1bmRlZmluZWQpIHJldHVybiBoKCdkaXYubG9hZGluZycsIHtcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQ6IGN0cmwuZmV0Y2hcbiAgICB9LFxuICB9LCBbc3Bpbm5lcigpXSlcbiAgcmV0dXJuIGgoJ3RleHRhcmVhJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBwbGFjZWhvbGRlcjogY3RybC50cmFucygndHlwZVByaXZhdGVOb3Rlc0hlcmUnKVxuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgIGNvbnN0ICRlbCA9ICQodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgJGVsLnZhbCh0ZXh0KS5vbignY2hhbmdlIGtleXVwIHBhc3RlJywgKCkgPT4ge1xuICAgICAgICAgIGN0cmwucG9zdCgkZWwudmFsKCkpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IGJpbmQgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBSZWRyYXcgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlc2V0Q3RybCB7XG4gIGdyb3VwKCk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBzYWlkKCk6IHN0cmluZ1tdXG4gIHNldEdyb3VwKGdyb3VwOiBzdHJpbmcgfCB1bmRlZmluZWQpOiB2b2lkXG4gIHBvc3QocHJlc2V0OiBQcmVzZXQpOiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIFByZXNldEtleSA9IHN0cmluZ1xuZXhwb3J0IHR5cGUgUHJlc2V0VGV4dCA9IHN0cmluZ1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZXNldCB7XG4gIGtleTogUHJlc2V0S2V5XG4gIHRleHQ6IFByZXNldFRleHRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVzZXRHcm91cHMge1xuICBzdGFydDogUHJlc2V0W11cbiAgZW5kOiBQcmVzZXRbXVxuICBba2V5OiBzdHJpbmddOiBQcmVzZXRbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByZXNldE9wdHMge1xuICBpbml0aWFsR3JvdXA/OiBzdHJpbmdcbiAgcmVkcmF3OiBSZWRyYXdcbiAgcG9zdCh0ZXh0OiBzdHJpbmcpOiB2b2lkXG59XG5cbmNvbnN0IGdyb3VwczogUHJlc2V0R3JvdXBzID0ge1xuICBzdGFydDogW1xuICAgICdoaS9IZWxsbycsICdnbC9Hb29kIGx1Y2snLCAnaGYvSGF2ZSBmdW4hJywgJ3UyL1lvdSB0b28hJ1xuICBdLm1hcChzcGxpdEl0KSxcbiAgZW5kOiBbXG4gICAgJ2dnL0dvb2QgZ2FtZScsICd3cC9XZWxsIHBsYXllZCcsICd0eS9UaGFuayB5b3UnLCAnZ3RnL0lcXCd2ZSBnb3QgdG8gZ28nLCAnYnllL0J5ZSEnXG4gIF0ubWFwKHNwbGl0SXQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVzZXRDdHJsKG9wdHM6IFByZXNldE9wdHMpOiBQcmVzZXRDdHJsIHtcblxuICBsZXQgZ3JvdXA6IHN0cmluZyB8IHVuZGVmaW5lZCA9IG9wdHMuaW5pdGlhbEdyb3VwO1xuXG4gIGxldCBzYWlkOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHJldHVybiB7XG4gICAgZ3JvdXA6ICgpID0+IGdyb3VwLFxuICAgIHNhaWQ6ICgpID0+IHNhaWQsXG4gICAgc2V0R3JvdXAocDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgICBpZiAocCAhPT0gZ3JvdXApIHtcbiAgICAgICAgZ3JvdXAgPSBwO1xuICAgICAgICBpZiAoIXApIHNhaWQgPSBbXTtcbiAgICAgICAgb3B0cy5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHBvc3QocHJlc2V0KSB7XG4gICAgICBpZiAoIWdyb3VwKSByZXR1cm47XG4gICAgICBjb25zdCBzZXRzID0gZ3JvdXBzW2dyb3VwXTtcbiAgICAgIGlmICghc2V0cykgcmV0dXJuO1xuICAgICAgaWYgKHNhaWQuaW5jbHVkZXMocHJlc2V0LmtleSkpIHJldHVybjtcbiAgICAgIG9wdHMucG9zdChwcmVzZXQudGV4dCk7XG4gICAgICBzYWlkLnB1c2gocHJlc2V0LmtleSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVzZXRWaWV3KGN0cmw6IFByZXNldEN0cmwpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGdyb3VwID0gY3RybC5ncm91cCgpO1xuICBpZiAoIWdyb3VwKSByZXR1cm47XG4gIGNvbnN0IHNldHMgPSBncm91cHNbZ3JvdXBdO1xuICBjb25zdCBzYWlkID0gY3RybC5zYWlkKCk7XG4gIHJldHVybiAoc2V0cyAmJiBzYWlkLmxlbmd0aCA8IDIpID8gaCgnZGl2Lm1jaGF0X19wcmVzZXRzJywgc2V0cy5tYXAoKHA6IFByZXNldCkgPT4ge1xuICAgIGNvbnN0IGRpc2FibGVkID0gc2FpZC5pbmNsdWRlcyhwLmtleSk7XG4gICAgcmV0dXJuIGgoJ3NwYW4nLCB7XG4gICAgICBjbGFzczoge1xuICAgICAgICBkaXNhYmxlZFxuICAgICAgfSxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIHRpdGxlOiBwLnRleHQsXG4gICAgICAgIGRpc2FibGVkXG4gICAgICB9LFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiB7ICFkaXNhYmxlZCAmJiBjdHJsLnBvc3QocCkgfSlcbiAgICB9LCBwLmtleSk7XG4gIH0pKSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gc3BsaXRJdChzOiBzdHJpbmcpOiBQcmVzZXQge1xuICBjb25zdCBwYXJ0cyA9IHMuc3BsaXQoJy8nKTtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IHBhcnRzWzBdLFxuICAgIHRleHQ6IHBhcnRzWzFdXG4gIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBza2lwKHR4dDogc3RyaW5nKSB7XG4gIHJldHVybiBhbmFseXNlKHR4dCkgJiYgd2luZG93LmxpY2hlc3Muc3RvcmFnZS5nZXQoJ2NoYXQtc3BhbScpICE9ICcxJztcbn1cbmV4cG9ydCBmdW5jdGlvbiBoYXNUZWFtVXJsKHR4dDogc3RyaW5nKSB7XG4gIHJldHVybiAhIXR4dC5tYXRjaCh0ZWFtVXJsUmVnZXgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydCh0eHQ6IHN0cmluZykge1xuICBpZiAoYW5hbHlzZSh0eHQpKSB7XG4gICAgJC5wb3N0KCcvanNsb2cvJyArIHdpbmRvdy5sb2NhdGlvbi5ocmVmLnN1YnN0cigtMTIpICsgJz9uPXNwYW0nKTtcbiAgICB3aW5kb3cubGljaGVzcy5zdG9yYWdlLnNldCgnY2hhdC1zcGFtJywgJzEnKTtcbiAgfVxufVxuXG5jb25zdCBzcGFtUmVnZXggPSBuZXcgUmVnRXhwKFtcbiAgJ3hjYW13ZWIuY29tJyxcbiAgJyhefFteaV0pY2hlc3MtYm90JyxcbiAgJ2NoZXNzLWNoZWF0JyxcbiAgJ2Nvb2x0ZWVuYml0Y2gnLFxuICAnbGV0Y2FmYS53ZWJjYW0nLFxuICAndGlueXVybC5jb20vJyxcbiAgJ3dvb2dhLmluZm8vJyxcbiAgJ2JpdC5seS8nLFxuICAnd2J0LmxpbmsvJyxcbiAgJ2ViLmJ5LycsXG4gICcwMDEucnMvJyxcbiAgJ3Noci5uYW1lLycsXG4gICd1LnRvLycsXG4gICcuMy1hLm5ldCcsXG4gICcuc3NsNDQzLm9yZycsXG4gICcubnMwMi51cycsXG4gICcubXlmdHAuaW5mbycsXG4gICcuZmxpbmt1cC5jb20nLFxuICAnLnNlcnZldXNlcnMuY29tJyxcbiAgJ2JhZG9vZ2lybHMuY29tJyxcbiAgJ2hpZGUuc3UnLFxuICAnd3lvbi5kZScsXG4gICdzZXhkYXRpbmdjei5jbHViJ1xuXS5tYXAodXJsID0+IHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC4vZywgJ1xcXFwuJykucmVwbGFjZSgvXFwvL2csICdcXFxcLycpO1xufSkuam9pbignfCcpKTtcblxuZnVuY3Rpb24gYW5hbHlzZSh0eHQ6IHN0cmluZykge1xuICByZXR1cm4gISF0eHQubWF0Y2goc3BhbVJlZ2V4KTtcbn1cblxuY29uc3QgdGVhbVVybFJlZ2V4ID0gL2xpY2hlc3NcXC5vcmdcXC90ZWFtXFwvL1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJMaW5rKHU6IHN0cmluZywgdGl0bGU/OiBzdHJpbmcpIHtcbiAgY29uc3QgdHJ1bmMgPSB1LnN1YnN0cmluZygwLCAxNCk7XG4gIHJldHVybiBoKCdhJywge1xuICAgIC8vIGNhbid0IGJlIGlubGluZWQgYmVjYXVzZSBvZiB0aHVua3NcbiAgICBjbGFzczoge1xuICAgICAgJ3VzZXItbGluayc6IHRydWUsXG4gICAgICB1bHB0OiB0cnVlXG4gICAgfSxcbiAgICBhdHRyczoge1xuICAgICAgaHJlZjogJy9ALycgKyB1XG4gICAgfVxuICB9LCB0aXRsZSA/IFtcbiAgICBoKFxuICAgICAgJ3NwYW4udGl0bGUnLFxuICAgICAgdGl0bGUgPT0gJ0JPVCcgPyB7IGF0dHJzOiB7J2RhdGEtYm90JzogdHJ1ZSB9IH0gOiB7fSxcbiAgICAgIHRpdGxlKSwgdHJ1bmNcbiAgXSA6IFt0cnVuY10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3Bpbm5lcigpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zcGlubmVyJywgW1xuICAgIGgoJ3N2ZycsIHsgYXR0cnM6IHsgdmlld0JveDogJzAgMCA0MCA0MCcgfSB9LCBbXG4gICAgICBoKCdjaXJjbGUnLCB7XG4gICAgICAgIGF0dHJzOiB7IGN4OiAyMCwgY3k6IDIwLCByOiAxOCwgZmlsbDogJ25vbmUnIH1cbiAgICAgIH0pXSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmQoZXZlbnROYW1lOiBzdHJpbmcsIGY6IChlOiBFdmVudCkgPT4gdm9pZCkge1xuICByZXR1cm4ge1xuICAgIGluc2VydDogKHZub2RlOiBWTm9kZSkgPT4ge1xuICAgICAgKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGYpO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBDdHJsLCBUYWIgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgZGlzY3Vzc2lvblZpZXcgZnJvbSAnLi9kaXNjdXNzaW9uJ1xuaW1wb3J0IHsgbm90ZVZpZXcgfSBmcm9tICcuL25vdGUnXG5pbXBvcnQgeyBtb2RlcmF0aW9uVmlldyB9IGZyb20gJy4vbW9kZXJhdGlvbidcbmltcG9ydCB7IGJpbmQgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IEN0cmwpOiBWTm9kZSB7XG5cbiAgY29uc3QgbW9kID0gY3RybC5tb2RlcmF0aW9uKCk7XG5cbiAgcmV0dXJuIGgoJ3NlY3Rpb24ubWNoYXQnICsgKGN0cmwub3B0cy5hbHdheXNFbmFibGVkID8gJycgOiAnLm1jaGF0LW9wdGlvbmFsJyksIHtcbiAgICBjbGFzczoge1xuICAgICAgJ21jaGF0LW1vZCc6ICEhbW9kXG4gICAgfSxcbiAgICBob29rOiB7XG4gICAgICBkZXN0cm95OiBjdHJsLmRlc3Ryb3lcbiAgICB9XG4gIH0sIG1vZGVyYXRpb25WaWV3KG1vZCkgfHwgbm9ybWFsVmlldyhjdHJsKSlcbn1cblxuZnVuY3Rpb24gcmVuZGVyUGFsYW50aXIoY3RybDogQ3RybCkge1xuICBjb25zdCBwID0gY3RybC5wYWxhbnRpcjtcbiAgaWYgKCFwLmVuYWJsZWQoKSkgcmV0dXJuO1xuICByZXR1cm4gcC5pbnN0YW5jZSA/IHAuaW5zdGFuY2UucmVuZGVyKGgpIDogaCgnZGl2Lm1jaGF0X190YWIucGFsYW50aXIucGFsYW50aXItc2xvdCcse1xuICAgIGF0dHJzOiB7XG4gICAgICAnZGF0YS1pY29uJzogJ+6AoCcsXG4gICAgICB0aXRsZTogJ1ZvaWNlIGNoYXQnXG4gICAgfSxcbiAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IHtcbiAgICAgIGlmICghcC5sb2FkZWQpIHtcbiAgICAgICAgcC5sb2FkZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBsaSA9IHdpbmRvdy5saWNoZXNzO1xuICAgICAgICBsaS5sb2FkU2NyaXB0KCdqYXZhc2NyaXB0cy92ZW5kb3IvcGVlcmpzLm1pbi5qcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGxpLmxvYWRTY3JpcHQobGkuY29tcGlsZWRTY3JpcHQoJ3BhbGFudGlyJykpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcC5pbnN0YW5jZSA9IHdpbmRvdy5QYWxhbnRpciEucGFsYW50aXIoe1xuICAgICAgICAgICAgICB1aWQ6IGN0cmwuZGF0YS51c2VySWQsXG4gICAgICAgICAgICAgIHJlZHJhdzogY3RybC5yZWRyYXdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSlcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbFZpZXcoY3RybDogQ3RybCkge1xuICBjb25zdCBhY3RpdmUgPSBjdHJsLnZtLnRhYjtcbiAgcmV0dXJuIFtcbiAgICBoKCdkaXYubWNoYXRfX3RhYnMubmJfJyArIGN0cmwuYWxsVGFicy5sZW5ndGgsIFtcbiAgICAgIC4uLmN0cmwuYWxsVGFicy5tYXAodCA9PiByZW5kZXJUYWIoY3RybCwgdCwgYWN0aXZlKSksXG4gICAgICByZW5kZXJQYWxhbnRpcihjdHJsKVxuICAgIF0pLFxuICAgIGgoJ2Rpdi5tY2hhdF9fY29udGVudC4nICsgYWN0aXZlLFxuICAgICAgKGFjdGl2ZSA9PT0gJ25vdGUnICYmIGN0cmwubm90ZSkgPyBbbm90ZVZpZXcoY3RybC5ub3RlKV0gOiAoXG4gICAgICAgIGN0cmwucGx1Z2luICYmIGFjdGl2ZSA9PT0gY3RybC5wbHVnaW4udGFiLmtleSA/IFtjdHJsLnBsdWdpbi52aWV3KCldIDogZGlzY3Vzc2lvblZpZXcoY3RybClcbiAgICAgICkpXG4gIF1cbn1cblxuZnVuY3Rpb24gcmVuZGVyVGFiKGN0cmw6IEN0cmwsIHRhYjogVGFiLCBhY3RpdmU6IFRhYikge1xuICByZXR1cm4gaCgnZGl2Lm1jaGF0X190YWIuJyArIHRhYiwge1xuICAgIGNsYXNzOiB7ICdtY2hhdF9fdGFiLWFjdGl2ZSc6IHRhYiA9PT0gYWN0aXZlIH0sXG4gICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnNldFRhYih0YWIpKVxuICB9LCB0YWJOYW1lKGN0cmwsIHRhYikpO1xufVxuXG5mdW5jdGlvbiB0YWJOYW1lKGN0cmw6IEN0cmwsIHRhYjogVGFiKSB7XG4gIGlmICh0YWIgPT09ICdkaXNjdXNzaW9uJykgcmV0dXJuIFtcbiAgICBoKCdzcGFuJywgY3RybC5kYXRhLm5hbWUpLFxuICAgIGN0cmwub3B0cy5hbHdheXNFbmFibGVkID8gdW5kZWZpbmVkIDogaCgnaW5wdXQnLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogY3RybC50cmFucy5ub2FyZygndG9nZ2xlVGhlQ2hhdCcpLFxuICAgICAgICBjaGVja2VkOiBjdHJsLnZtLmVuYWJsZWRcbiAgICAgIH0sXG4gICAgICBob29rOiBiaW5kKCdjaGFuZ2UnLCAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgY3RybC5zZXRFbmFibGVkKChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkKTtcbiAgICAgIH0pXG4gICAgfSlcbiAgXTtcbiAgaWYgKHRhYiA9PT0gJ25vdGUnKSByZXR1cm4gW2goJ3NwYW4nLCBjdHJsLnRyYW5zLm5vYXJnKCdub3RlcycpKV07XG4gIGlmIChjdHJsLnBsdWdpbiAmJiB0YWIgPT09IGN0cmwucGx1Z2luLnRhYi5rZXkpIHJldHVybiBbaCgnc3BhbicsIGN0cmwucGx1Z2luLnRhYi5uYW1lKV07XG4gIHJldHVybiBbXTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiB1c2VyTW9kSW5mbyh1c2VybmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiAkLmdldCgnL21vZC9jaGF0LXVzZXIvJyArIHVzZXJuYW1lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhZyhyZXNvdXJjZTogc3RyaW5nLCB1c2VybmFtZTogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuICQucG9zdCgnL3JlcG9ydC9mbGFnJywgeyB1c2VybmFtZSwgcmVzb3VyY2UsIHRleHQgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlKGlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuICQuZ2V0KG5vdGVVcmwoaWQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE5vdGUoaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiAkLnBvc3Qobm90ZVVybChpZCksIHsgdGV4dCB9KVxufVxuXG5mdW5jdGlvbiBub3RlVXJsKGlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGAvJHtpZH0vbm90ZWA7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZGVmaW5lZDxBPih2OiBBIHwgdW5kZWZpbmVkKTogdiBpcyBBIHtcbiAgcmV0dXJuIHR5cGVvZiB2ICE9PSAndW5kZWZpbmVkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtcHR5KGE6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWEgfHwgYS5sZW5ndGggPT09IDA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcDxUPiB7XG4gICgpOiBUXG4gICh2OiBUKTogVFxufVxuXG4vLyBsaWtlIG1pdGhyaWwgcHJvcCBidXQgd2l0aCB0eXBlIHNhZmV0eVxuZXhwb3J0IGZ1bmN0aW9uIHByb3A8QT4oaW5pdGlhbFZhbHVlOiBBKTogUHJvcDxBPiB7XG4gIGxldCB2YWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgY29uc3QgZnVuID0gZnVuY3Rpb24odjogQSB8IHVuZGVmaW5lZCkge1xuICAgIGlmIChkZWZpbmVkKHYpKSB2YWx1ZSA9IHY7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuICByZXR1cm4gZnVuIGFzIFByb3A8QT47XG59XG4iLCJsZXQgbm90aWZpY2F0aW9uczogQXJyYXk8Tm90aWZpY2F0aW9uPiA9IFtdO1xubGV0IGxpc3RlbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBsaXN0ZW5Ub0ZvY3VzKCkge1xuICBpZiAoIWxpc3RlbmluZykge1xuICAgIGxpc3RlbmluZyA9IHRydWU7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgbm90aWZpY2F0aW9ucy5mb3JFYWNoKG4gPT4gbi5jbG9zZSgpKTtcbiAgICAgIG5vdGlmaWNhdGlvbnMgPSBbXTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub3RpZnkobXNnOiBzdHJpbmcgfCAoKCkgPT4gc3RyaW5nKSkge1xuICBjb25zdCBzdG9yYWdlID0gd2luZG93LmxpY2hlc3Muc3RvcmFnZS5tYWtlKCdqdXN0LW5vdGlmaWVkJyk7XG4gIGlmIChkb2N1bWVudC5oYXNGb2N1cygpIHx8IERhdGUubm93KCkgLSBwYXJzZUludChzdG9yYWdlLmdldCgpISwgMTApIDwgMTAwMCkgcmV0dXJuO1xuICBzdG9yYWdlLnNldCgnJyArIERhdGUubm93KCkpO1xuICBpZiAoJC5pc0Z1bmN0aW9uKG1zZykpIG1zZyA9IG1zZygpO1xuICBjb25zdCBub3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKCdsaWNoZXNzLm9yZycsIHtcbiAgICBpY29uOiB3aW5kb3cubGljaGVzcy5hc3NldFVybCgnbG9nby9saWNoZXNzLWZhdmljb24tMjU2LnBuZycsIHtub1ZlcnNpb246IHRydWV9KSxcbiAgICBib2R5OiBtc2dcbiAgfSk7XG4gIG5vdGlmaWNhdGlvbi5vbmNsaWNrID0gKCkgPT4gd2luZG93LmZvY3VzKCk7XG4gIG5vdGlmaWNhdGlvbnMucHVzaChub3RpZmljYXRpb24pO1xuICBsaXN0ZW5Ub0ZvY3VzKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1zZzogc3RyaW5nIHwgKCgpID0+IHN0cmluZykpIHtcbiAgaWYgKGRvY3VtZW50Lmhhc0ZvY3VzKCkgfHwgISgnTm90aWZpY2F0aW9uJyBpbiB3aW5kb3cpKSByZXR1cm47XG4gIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2dyYW50ZWQnKSB7XG4gICAgLy8gaW5jcmVhc2UgY2hhbmNlcyB0aGF0IHRoZSBmaXJzdCB0YWIgY2FuIHB1dCBhIGxvY2FsIHN0b3JhZ2UgbG9ja1xuICAgIHNldFRpbWVvdXQobm90aWZ5LCAxMCArIE1hdGgucmFuZG9tKCkgKiA1MDAsIG1zZyk7XG4gIH1cbn1cbiIsIi8vIEVuc3VyZXMgY2FsbHMgdG8gdGhlIHdyYXBwZWQgZnVuY3Rpb24gYXJlIHNwYWNlZCBieSB0aGUgZ2l2ZW4gZGVsYXkuXG4vLyBBbnkgZXh0cmEgY2FsbHMgYXJlIGRyb3BwZWQsIGV4Y2VwdCB0aGUgbGFzdCBvbmUuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aHJvdHRsZShkZWxheTogbnVtYmVyLCBjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkIHtcbiAgbGV0IHRpbWVyOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIGxldCBsYXN0RXhlYyA9IDA7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHRoaXM6IGFueSwgLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBjb25zdCBzZWxmOiBhbnkgPSB0aGlzO1xuICAgIGNvbnN0IGVsYXBzZWQgPSBwZXJmb3JtYW5jZS5ub3coKSAtIGxhc3RFeGVjO1xuXG4gICAgZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgIHRpbWVyID0gdW5kZWZpbmVkO1xuICAgICAgbGFzdEV4ZWMgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIH1cblxuICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgIGlmIChlbGFwc2VkID4gZGVsYXkpIGV4ZWMoKTtcbiAgICBlbHNlIHRpbWVyID0gc2V0VGltZW91dChleGVjLCBkZWxheSAtIGVsYXBzZWQpO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgR2FtZURhdGEgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vb3JuaWNhci9zY2FsYWNoZXNzL2Jsb2IvbWFzdGVyL3NyYy9tYWluL3NjYWxhL1N0YXR1cy5zY2FsYVxuXG5leHBvcnQgY29uc3QgaWRzID0ge1xuICBjcmVhdGVkOiAxMCxcbiAgc3RhcnRlZDogMjAsXG4gIGFib3J0ZWQ6IDI1LFxuICBtYXRlOiAzMCxcbiAgcmVzaWduOiAzMSxcbiAgc3RhbGVtYXRlOiAzMixcbiAgdGltZW91dDogMzMsXG4gIGRyYXc6IDM0LFxuICBvdXRvZnRpbWU6IDM1LFxuICBjaGVhdDogMzYsXG4gIG5vU3RhcnQ6IDM3LFxuICB2YXJpYW50RW5kOiA2MFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0ZWQoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRhdGEuZ2FtZS5zdGF0dXMuaWQgPj0gaWRzLnN0YXJ0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5pc2hlZChkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gZGF0YS5nYW1lLnN0YXR1cy5pZCA+PSBpZHMubWF0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFib3J0ZWQoZGF0YTogR2FtZURhdGEpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRhdGEuZ2FtZS5zdGF0dXMuaWQgPT09IGlkcy5hYm9ydGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheWluZyhkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhcnRlZChkYXRhKSAmJiAhZmluaXNoZWQoZGF0YSkgJiYgIWFib3J0ZWQoZGF0YSk7XG59XG4iLCJpbXBvcnQgbWFrZVNvY2tldCBmcm9tICcuL3NvY2tldCc7XG5pbXBvcnQgeGhyIGZyb20gJy4veGhyJztcbmltcG9ydCB7IG15UGFnZSwgcGxheWVycyB9IGZyb20gJy4vcGFnaW5hdGlvbic7XG5pbXBvcnQgKiBhcyBzb3VuZCBmcm9tICcuL3NvdW5kJztcbmltcG9ydCAqIGFzIHRvdXIgZnJvbSAnLi90b3VybmFtZW50JztcbmltcG9ydCB7IFRvdXJuYW1lbnREYXRhLCBUb3VybmFtZW50T3B0cywgUGFnZXMsIFBsYXllckluZm8sIFRlYW1JbmZvLCBTdGFuZGluZyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBUb3VybmFtZW50U29ja2V0IH0gZnJvbSAnLi9zb2NrZXQnO1xuXG5pbnRlcmZhY2UgQ3RybFRlYW1JbmZvIHtcbiAgcmVxdWVzdGVkPzogc3RyaW5nO1xuICBsb2FkZWQ/OiBUZWFtSW5mbztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG91cm5hbWVudENvbnRyb2xsZXIge1xuXG4gIG9wdHM6IFRvdXJuYW1lbnRPcHRzO1xuICBkYXRhOiBUb3VybmFtZW50RGF0YTtcbiAgdHJhbnM6IFRyYW5zO1xuICBzb2NrZXQ6IFRvdXJuYW1lbnRTb2NrZXQ7XG4gIHBhZ2U6IG51bWJlcjtcbiAgcGFnZXM6IFBhZ2VzID0ge307XG4gIGxhc3RQYWdlRGlzcGxheWVkOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIGZvY3VzT25NZTogYm9vbGVhbjtcbiAgam9pblNwaW5uZXI6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcGxheWVySW5mbzogUGxheWVySW5mbyA9IHt9O1xuICB0ZWFtSW5mbzogQ3RybFRlYW1JbmZvID0ge307XG4gIGRpc2FibGVDbGlja3M6IGJvb2xlYW4gPSB0cnVlO1xuICBzZWFyY2hpbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgam9pbldpdGhUZWFtU2VsZWN0b3I6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcmVkcmF3OiAoKSA9PiB2b2lkO1xuXG4gIHByaXZhdGUgd2F0Y2hpbmdHYW1lSWQ6IHN0cmluZztcbiAgcHJpdmF0ZSBsYXN0U3RvcmFnZSA9IHdpbmRvdy5saWNoZXNzLnN0b3JhZ2UubWFrZSgnbGFzdC1yZWRpcmVjdCcpO1xuXG4gIGNvbnN0cnVjdG9yKG9wdHM6IFRvdXJuYW1lbnRPcHRzLCByZWRyYXc6ICgpID0+IHZvaWQpIHtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMuZGF0YSA9IG9wdHMuZGF0YTtcbiAgICB0aGlzLnJlZHJhdyA9IHJlZHJhdztcbiAgICB0aGlzLnRyYW5zID0gd2luZG93LmxpY2hlc3MudHJhbnMob3B0cy5pMThuKTtcbiAgICB0aGlzLnNvY2tldCA9IG1ha2VTb2NrZXQob3B0cy5zb2NrZXRTZW5kLCB0aGlzKTtcbiAgICB0aGlzLnBhZ2UgPSB0aGlzLmRhdGEuc3RhbmRpbmcucGFnZTtcbiAgICB0aGlzLmZvY3VzT25NZSA9IHRvdXIuaXNJbih0aGlzKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZGlzYWJsZUNsaWNrcyA9IGZhbHNlLCAxNTAwKTtcbiAgICB0aGlzLmxvYWRQYWdlKHRoaXMuZGF0YS5zdGFuZGluZyk7XG4gICAgdGhpcy5zY3JvbGxUb01lKCk7XG4gICAgc291bmQuZW5kKHRoaXMuZGF0YSk7XG4gICAgc291bmQuY291bnREb3duKHRoaXMuZGF0YSk7XG4gICAgdGhpcy5yZWRpcmVjdFRvTXlHYW1lKCk7XG4gICAgaWYgKHRoaXMuZGF0YS5mZWF0dXJlZCkgdGhpcy5zdGFydFdhdGNoaW5nKHRoaXMuZGF0YS5mZWF0dXJlZC5pZCk7XG4gIH1cblxuICBhc2tSZWxvYWQgPSAoKTogdm9pZCA9PiB7XG4gICAgaWYgKHRoaXMuam9pblNwaW5uZXIpIHhoci5yZWxvYWROb3codGhpcyk7XG4gICAgZWxzZSB4aHIucmVsb2FkU29vbih0aGlzKTtcbiAgfTtcblxuICByZWxvYWQgPSAoZGF0YTogVG91cm5hbWVudERhdGEpOiB2b2lkID0+IHtcbiAgICAvLyB3ZSBqb2luZWQgYSBwcml2YXRlIHRvdXJuYW1lbnQhIFJlbG9hZCB0aGUgcGFnZSB0byBsb2FkIHRoZSBjaGF0XG4gICAgaWYgKCF0aGlzLmRhdGEubWUgJiYgZGF0YS5tZSAmJiB0aGlzLmRhdGFbJ3ByaXZhdGUnXSkgd2luZG93LmxpY2hlc3MucmVsb2FkKCk7XG4gICAgdGhpcy5kYXRhID0gey4uLnRoaXMuZGF0YSwgLi4uZGF0YX07XG4gICAgdGhpcy5kYXRhLm1lID0gZGF0YS5tZTsgLy8gdG8gYWNjb3VudCBmb3IgcmVtb3ZhbCBvbiB3aXRoZHJhd1xuICAgIGlmIChkYXRhLnBsYXllckluZm8gJiYgZGF0YS5wbGF5ZXJJbmZvLnBsYXllci5pZCA9PT0gdGhpcy5wbGF5ZXJJbmZvLmlkKVxuICAgICAgdGhpcy5wbGF5ZXJJbmZvLmRhdGEgPSBkYXRhLnBsYXllckluZm87XG4gICAgdGhpcy5sb2FkUGFnZShkYXRhLnN0YW5kaW5nKTtcbiAgICBpZiAodGhpcy5mb2N1c09uTWUpIHRoaXMuc2Nyb2xsVG9NZSgpO1xuICAgIGlmIChkYXRhLmZlYXR1cmVkKSB0aGlzLnN0YXJ0V2F0Y2hpbmcoZGF0YS5mZWF0dXJlZC5pZCk7XG4gICAgc291bmQuZW5kKGRhdGEpO1xuICAgIHNvdW5kLmNvdW50RG93bihkYXRhKTtcbiAgICB0aGlzLmpvaW5TcGlubmVyID0gZmFsc2U7XG4gICAgdGhpcy5yZWRpcmVjdFRvTXlHYW1lKCk7XG4gIH07XG5cbiAgbXlHYW1lSWQgPSAoKSA9PiB0aGlzLmRhdGEubWUgJiYgdGhpcy5kYXRhLm1lLmdhbWVJZDtcblxuICBwcml2YXRlIHJlZGlyZWN0VG9NeUdhbWUoKSB7XG4gICAgY29uc3QgZ2FtZUlkID0gdGhpcy5teUdhbWVJZCgpO1xuICAgIGlmIChnYW1lSWQpIHRoaXMucmVkaXJlY3RGaXJzdChnYW1lSWQpO1xuICB9XG5cbiAgcmVkaXJlY3RGaXJzdCA9IChnYW1lSWQ6IHN0cmluZywgcmlnaHROb3c/OiBib29sZWFuKSA9PiB7XG4gICAgY29uc3QgZGVsYXkgPSAocmlnaHROb3cgfHwgZG9jdW1lbnQuaGFzRm9jdXMoKSkgPyAxMCA6ICgxMDAwICsgTWF0aC5yYW5kb20oKSAqIDUwMCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5sYXN0U3RvcmFnZS5nZXQoKSAhPT0gZ2FtZUlkKSB7XG4gICAgICAgIHRoaXMubGFzdFN0b3JhZ2Uuc2V0KGdhbWVJZCk7XG4gICAgICAgIHdpbmRvdy5saWNoZXNzLnJlZGlyZWN0KCcvJyArIGdhbWVJZCk7XG4gICAgICB9XG4gICAgfSwgZGVsYXkpO1xuICB9O1xuXG4gIGxvYWRQYWdlID0gKGRhdGE6IFN0YW5kaW5nKSA9PiB7XG4gICAgaWYgKCFkYXRhLmZhaWxlZCB8fCAhdGhpcy5wYWdlc1tkYXRhLnBhZ2VdKSB0aGlzLnBhZ2VzW2RhdGEucGFnZV0gPSBkYXRhLnBsYXllcnM7XG4gIH1cblxuICBzZXRQYWdlID0gKHBhZ2U6IG51bWJlcikgPT4ge1xuICAgIHRoaXMucGFnZSA9IHBhZ2U7XG4gICAgeGhyLmxvYWRQYWdlKHRoaXMsIHBhZ2UpO1xuICB9O1xuXG4gIGp1bXBUb1BhZ2VPZiA9IChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB1c2VySWQgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgeGhyLmxvYWRQYWdlT2YodGhpcywgdXNlcklkKS50aGVuKGRhdGEgPT4ge1xuICAgICAgdGhpcy5sb2FkUGFnZShkYXRhKTtcbiAgICAgIHRoaXMucGFnZSA9IGRhdGEucGFnZTtcbiAgICAgIHRoaXMuc2VhcmNoaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmZvY3VzT25NZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYWdlc1t0aGlzLnBhZ2VdLmZpbHRlcihwID0+IHAubmFtZS50b0xvd2VyQ2FzZSgpID09IHVzZXJJZCkuZm9yRWFjaCh0aGlzLnNob3dQbGF5ZXJJbmZvKTtcbiAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgfSk7XG4gIH1cblxuICB1c2VyU2V0UGFnZSA9IChwYWdlOiBudW1iZXIpID0+IHtcbiAgICB0aGlzLmZvY3VzT25NZSA9IGZhbHNlO1xuICAgIHRoaXMuc2V0UGFnZShwYWdlKTtcbiAgfTtcblxuICB1c2VyTmV4dFBhZ2UgPSAoKSA9PiB0aGlzLnVzZXJTZXRQYWdlKHRoaXMucGFnZSArIDEpO1xuICB1c2VyUHJldlBhZ2UgPSAoKSA9PiB0aGlzLnVzZXJTZXRQYWdlKHRoaXMucGFnZSAtIDEpO1xuICB1c2VyTGFzdFBhZ2UgPSAoKSA9PiB0aGlzLnVzZXJTZXRQYWdlKHBsYXllcnModGhpcykubmJQYWdlcyk7XG5cbiAgd2l0aGRyYXcgPSAoKSA9PiB7XG4gICAgeGhyLndpdGhkcmF3KHRoaXMpO1xuICAgIHRoaXMuam9pblNwaW5uZXIgPSB0cnVlO1xuICAgIHRoaXMuZm9jdXNPbk1lID0gZmFsc2U7XG4gIH07XG5cbiAgam9pbiA9IChwYXNzd29yZD86IHN0cmluZywgdGVhbT86IHN0cmluZykgPT4ge1xuICAgIHRoaXMuam9pbldpdGhUZWFtU2VsZWN0b3IgPSBmYWxzZTtcbiAgICBpZiAoIXRoaXMuZGF0YS52ZXJkaWN0cy5hY2NlcHRlZCkgcmV0dXJuIHRoaXMuZGF0YS52ZXJkaWN0cy5saXN0LmZvckVhY2godiA9PiB7XG4gICAgICBpZiAodi52ZXJkaWN0ICE9PSAnb2snKSBhbGVydCh2LnZlcmRpY3QpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLmRhdGEudGVhbUJhdHRsZSAmJiAhdGVhbSAmJiAhdGhpcy5kYXRhLm1lKSB7XG4gICAgICB0aGlzLmpvaW5XaXRoVGVhbVNlbGVjdG9yID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgeGhyLmpvaW4odGhpcywgcGFzc3dvcmQsIHRlYW0pO1xuICAgICAgdGhpcy5qb2luU3Bpbm5lciA9IHRydWU7XG4gICAgICB0aGlzLmZvY3VzT25NZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdGFydFdhdGNoaW5nKGlkOiBzdHJpbmcpIHtcbiAgICBpZiAoaWQgIT09IHRoaXMud2F0Y2hpbmdHYW1lSWQpIHtcbiAgICAgIHRoaXMud2F0Y2hpbmdHYW1lSWQgPSBpZDtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zb2NrZXQuc2VuZChcInN0YXJ0V2F0Y2hpbmdcIiwgaWQpLCAxMDAwKTtcbiAgICB9XG4gIH07XG5cbiAgc2Nyb2xsVG9NZSA9ICgpID0+IHtcbiAgICBjb25zdCBwYWdlID0gbXlQYWdlKHRoaXMpO1xuICAgIGlmIChwYWdlICYmIHBhZ2UgIT09IHRoaXMucGFnZSkgdGhpcy5zZXRQYWdlKHBhZ2UpO1xuICB9O1xuXG4gIHRvZ2dsZUZvY3VzT25NZSA9ICgpID0+IHtcbiAgICBpZiAoIXRoaXMuZGF0YS5tZSkgcmV0dXJuO1xuICAgIHRoaXMuZm9jdXNPbk1lID0gIXRoaXMuZm9jdXNPbk1lO1xuICAgIGlmICh0aGlzLmZvY3VzT25NZSkgdGhpcy5zY3JvbGxUb01lKCk7XG4gIH07XG5cbiAgc2hvd1BsYXllckluZm8gPSAocGxheWVyKSA9PiB7XG4gICAgY29uc3QgdXNlcklkID0gcGxheWVyLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnRlYW1JbmZvLnJlcXVlc3RlZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnBsYXllckluZm8gPSB7XG4gICAgICBpZDogdGhpcy5wbGF5ZXJJbmZvLmlkID09PSB1c2VySWQgPyBudWxsIDogdXNlcklkLFxuICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICBkYXRhOiBudWxsXG4gICAgfTtcbiAgICBpZiAodGhpcy5wbGF5ZXJJbmZvLmlkKSB4aHIucGxheWVySW5mbyh0aGlzLCB0aGlzLnBsYXllckluZm8uaWQpO1xuICB9O1xuXG4gIHNldFBsYXllckluZm9EYXRhID0gKGRhdGEpID0+IHtcbiAgICBpZiAoZGF0YS5wbGF5ZXIuaWQgPT09IHRoaXMucGxheWVySW5mby5pZClcbiAgICAgIHRoaXMucGxheWVySW5mby5kYXRhID0gZGF0YTtcbiAgfTtcblxuICBzaG93VGVhbUluZm8gPSAodGVhbUlkOiBzdHJpbmcpID0+IHtcbiAgICB0aGlzLnBsYXllckluZm8uaWQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50ZWFtSW5mbyA9IHtcbiAgICAgIHJlcXVlc3RlZDogdGhpcy50ZWFtSW5mby5yZXF1ZXN0ZWQgPT09IHRlYW1JZCA/IHVuZGVmaW5lZCA6IHRlYW1JZCxcbiAgICAgIGxvYWRlZDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBpZiAodGhpcy50ZWFtSW5mby5yZXF1ZXN0ZWQpIHhoci50ZWFtSW5mbyh0aGlzLCB0aGlzLnRlYW1JbmZvLnJlcXVlc3RlZCk7XG4gIH07XG5cbiAgc2V0VGVhbUluZm8gPSAodGVhbUluZm86IFRlYW1JbmZvKSA9PiB7XG4gICAgaWYgKHRlYW1JbmZvLmlkID09PSB0aGlzLnRlYW1JbmZvLnJlcXVlc3RlZClcbiAgICAgIHRoaXMudGVhbUluZm8ubG9hZGVkID0gdGVhbUluZm87XG4gIH07XG5cbiAgdG9nZ2xlU2VhcmNoID0gKCkgPT4gdGhpcy5zZWFyY2hpbmcgPSAhdGhpcy5zZWFyY2hpbmc7XG59XG4iLCJpbXBvcnQgeyBpbml0IH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCBrbGFzcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJztcbmltcG9ydCBhdHRyaWJ1dGVzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcyc7XG5pbXBvcnQgeyBDaGVzc2dyb3VuZCB9IGZyb20gJ2NoZXNzZ3JvdW5kJztcbmltcG9ydCB7IFRvdXJuYW1lbnRPcHRzIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuL2N0cmwnO1xuaW1wb3J0ICogYXMgY2hhdCBmcm9tICdjaGF0JztcblxuY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlc10pO1xuXG5pbXBvcnQgbWFrZUN0cmwgZnJvbSAnLi9jdHJsJztcbmltcG9ydCB2aWV3IGZyb20gJy4vdmlldy9tYWluJztcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KG9wdHM6IFRvdXJuYW1lbnRPcHRzKSB7XG5cbiAgb3B0cy5jbGFzc2VzID0gb3B0cy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKTtcblxuICBsZXQgdm5vZGU6IFZOb2RlLCBjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcjtcblxuICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgdm5vZGUgPSBwYXRjaCh2bm9kZSwgdmlldyhjdHJsKSk7XG4gIH1cblxuICBjdHJsID0gbmV3IG1ha2VDdHJsKG9wdHMsIHJlZHJhdyk7XG5cbiAgY29uc3QgYmx1ZXByaW50ID0gdmlldyhjdHJsKTtcbiAgb3B0cy5lbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICB2bm9kZSA9IHBhdGNoKG9wdHMuZWxlbWVudCwgYmx1ZXByaW50KTtcblxuICByZXR1cm4ge1xuICAgIHNvY2tldFJlY2VpdmU6IGN0cmwuc29ja2V0LnJlY2VpdmVcbiAgfTtcbn07XG5cbi8vIHRoYXQncyBmb3IgdGhlIHJlc3Qgb2YgbGljaGVzcyB0byBhY2Nlc3MgY2hlc3Nncm91bmRcbi8vIHdpdGhvdXQgaGF2aW5nIHRvIGluY2x1ZGUgaXQgYSBzZWNvbmQgdGltZVxud2luZG93LkNoZXNzZ3JvdW5kID0gQ2hlc3Nncm91bmQ7XG53aW5kb3cuTGljaGVzc0NoYXQgPSBjaGF0O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuL2N0cmwnO1xuaW1wb3J0IHsgTWF5YmVWTm9kZXMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYmluZCB9IGZyb20gJy4vdmlldy91dGlsJztcbmltcG9ydCAqIGFzIHNlYXJjaCBmcm9tICcuL3NlYXJjaCc7XG5cbmNvbnN0IG1heFBlclBhZ2UgPSAxMDtcblxuZnVuY3Rpb24gYnV0dG9uKHRleHQ6IHN0cmluZywgaWNvbjogc3RyaW5nLCBjbGljazogKCkgPT4gdm9pZCwgZW5hYmxlOiBib29sZWFuLCBjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcik6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2J1dHRvbi5mYnQuaXMnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgICdkYXRhLWljb24nOiBpY29uLFxuICAgICAgZGlzYWJsZWQ6ICFlbmFibGUsXG4gICAgICB0aXRsZTogdGV4dFxuICAgIH0sXG4gICAgaG9vazogYmluZCgnbW91c2Vkb3duJywgY2xpY2ssIGN0cmwucmVkcmF3KVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2Nyb2xsVG9NZUJ1dHRvbihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcik6IFZOb2RlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGN0cmwuZGF0YS5tZSkgcmV0dXJuIGgoJ2J1dHRvbi5mYnQnICsgKGN0cmwuZm9jdXNPbk1lID8gJy5hY3RpdmUnIDogJycpLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgICdkYXRhLWljb24nOiAnNycsXG4gICAgICB0aXRsZTogJ1Njcm9sbCB0byB5b3VyIHBsYXllcidcbiAgICB9LFxuICAgIGhvb2s6IGJpbmQoJ21vdXNlZG93bicsIGN0cmwudG9nZ2xlRm9jdXNPbk1lLCBjdHJsLnJlZHJhdylcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJQYWdlcihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlciwgcGFnKTogTWF5YmVWTm9kZXMge1xuICBjb25zdCBlbmFibGVkID0gISFwYWcuY3VycmVudFBhZ2VSZXN1bHRzLFxuICBwYWdlID0gY3RybC5wYWdlO1xuICByZXR1cm4gcGFnLm5iUGFnZXMgPiAtMSA/IFtcbiAgICBzZWFyY2guYnV0dG9uKGN0cmwpLFxuICAgIC4uLihjdHJsLnNlYXJjaGluZyA/IFtzZWFyY2guaW5wdXQoY3RybCldIDogW1xuICAgICAgYnV0dG9uKCdGaXJzdCcsICdXJywgKCkgPT4gY3RybC51c2VyU2V0UGFnZSgxKSwgZW5hYmxlZCAmJiBwYWdlID4gMSwgY3RybCksXG4gICAgICBidXR0b24oJ1ByZXYnLCAnWScsIGN0cmwudXNlclByZXZQYWdlLCBlbmFibGVkICYmIHBhZ2UgPiAxLCBjdHJsKSxcbiAgICAgIGgoJ3NwYW4ucGFnZScsIChwYWcubmJSZXN1bHRzID8gKHBhZy5mcm9tICsgMSkgOiAwKSArICctJyArIHBhZy50byArICcgLyAnICsgcGFnLm5iUmVzdWx0cyksXG4gICAgICBidXR0b24oJ05leHQnLCAnWCcsIGN0cmwudXNlck5leHRQYWdlLCBlbmFibGVkICYmIHBhZ2UgPCBwYWcubmJQYWdlcywgY3RybCksXG4gICAgICBidXR0b24oJ0xhc3QnLCAnVicsIGN0cmwudXNlckxhc3RQYWdlLCBlbmFibGVkICYmIHBhZ2UgPCBwYWcubmJQYWdlcywgY3RybCksXG4gICAgICBzY3JvbGxUb01lQnV0dG9uKGN0cmwpXG4gICAgXSlcbiAgXSA6IFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheWVycyhjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcikge1xuICBjb25zdCBwYWdlID0gY3RybC5wYWdlLFxuICBuYlJlc3VsdHMgPSBjdHJsLmRhdGEubmJQbGF5ZXJzLFxuICBmcm9tID0gKHBhZ2UgLSAxKSAqIG1heFBlclBhZ2UsXG4gIHRvID0gTWF0aC5taW4obmJSZXN1bHRzLCBwYWdlICogbWF4UGVyUGFnZSk7XG4gIHJldHVybiB7XG4gICAgY3VycmVudFBhZ2U6IHBhZ2UsXG4gICAgbWF4UGVyUGFnZSxcbiAgICBmcm9tLFxuICAgIHRvLFxuICAgIGN1cnJlbnRQYWdlUmVzdWx0czogY3RybC5wYWdlc1twYWdlXSxcbiAgICBuYlJlc3VsdHMsXG4gICAgbmJQYWdlczogTWF0aC5jZWlsKG5iUmVzdWx0cyAvIG1heFBlclBhZ2UpXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBteVBhZ2UoY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICBpZiAoY3RybC5kYXRhLm1lKSByZXR1cm4gTWF0aC5mbG9vcigoY3RybC5kYXRhLm1lLnJhbmsgLSAxKSAvIDEwKSArIDE7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IFRvdXJuYW1lbnRDb250cm9sbGVyIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgeyBiaW5kIH0gZnJvbSAnLi92aWV3L3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gYnV0dG9uKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKTogVk5vZGUge1xuICByZXR1cm4gaCgnYnV0dG9uLmZidCcsIHtcbiAgICBjbGFzczogeyBhY3RpdmU6IGN0cmwuc2VhcmNoaW5nIH0sXG4gICAgYXR0cnM6IHtcbiAgICAgICdkYXRhLWljb24nOiBjdHJsLnNlYXJjaGluZyA/ICdMJyA6ICd5JyxcbiAgICAgIHRpdGxlOiAnU2VhcmNoIHRvdXJuYW1lbnQgcGxheWVycydcbiAgICB9LFxuICAgIGhvb2s6IGJpbmQoJ21vdXNlZG93bicsIGN0cmwudG9nZ2xlU2VhcmNoLCBjdHJsLnJlZHJhdylcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnB1dChjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcik6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zZWFyY2gnLFxuICAgIGgoJ2lucHV0Jywge1xuICAgICAgaG9vazoge1xuICAgICAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgICAgICB3aW5kb3cubGljaGVzcy5yYWYoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWwgPSB2bm9kZS5lbG0gYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgIHdpbmRvdy5saWNoZXNzLnVzZXJBdXRvY29tcGxldGUoJChlbCksIHtcbiAgICAgICAgICAgICAgdGFnOiAnc3BhbicsXG4gICAgICAgICAgICAgIHRvdXI6IGN0cmwuZGF0YS5pZCxcbiAgICAgICAgICAgICAgZm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogMyxcbiAgICAgICAgICAgICAgb25TZWxlY3Qodikge1xuICAgICAgICAgICAgICAgIGN0cmwuanVtcFRvUGFnZU9mKHYuaWQgfHwgdik7XG4gICAgICAgICAgICAgICAgJChlbCkudHlwZWFoZWFkKCdjbG9zZScpO1xuICAgICAgICAgICAgICAgIGVsLnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICApO1xufVxuIiwiaW1wb3J0IFRvdXJuYW1lbnRDb250cm9sbGVyIGZyb20gJy4vY3RybCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG91cm5hbWVudFNvY2tldCB7XG4gIHNlbmQ6IFNvY2tldFNlbmQ7XG4gIHJlY2VpdmUodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZW5kOiBTb2NrZXRTZW5kLCBjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcikge1xuXG4gIGNvbnN0IGhhbmRsZXJzID0ge1xuICAgIHJlbG9hZCgpIHsgXG4gICAgICBzZXRUaW1lb3V0KGN0cmwuYXNrUmVsb2FkLCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0MDAwKSlcbiAgICB9LFxuICAgIHJlZGlyZWN0KGZ1bGxJZCkge1xuICAgICAgY3RybC5yZWRpcmVjdEZpcnN0KGZ1bGxJZC5zbGljZSgwLCA4KSwgdHJ1ZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBzZW5kLFxuICAgIHJlY2VpdmUodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICAgIGlmIChoYW5kbGVyc1t0eXBlXSkgcmV0dXJuIGhhbmRsZXJzW3R5cGVdKGRhdGEpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcbn07XG4iLCJpbXBvcnQgeyBUb3VybmFtZW50RGF0YSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgbm90aWZ5IGZyb20gJ2NvbW1vbi9ub3RpZmljYXRpb24nO1xuXG5sZXQgY291bnREb3duVGltZW91dDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuY29uc3QgbGkgPSB3aW5kb3cubGljaGVzcztcblxuZnVuY3Rpb24gZG9Db3VudERvd24odGFyZ2V0VGltZTogbnVtYmVyKSB7XG5cbiAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcblxuICByZXR1cm4gZnVuY3Rpb24gY3VyQ291bnRlcigpIHtcbiAgICBsZXQgc2Vjb25kc1RvU3RhcnQgPSAodGFyZ2V0VGltZSAtIHBlcmZvcm1hbmNlLm5vdygpKSAvIDEwMDA7XG5cbiAgICAvLyBhbHdheXMgcGxheSB0aGUgMCBzb3VuZCBiZWZvcmUgY29tcGxldGluZy5cbiAgICBsZXQgYmVzdFRpY2sgPSBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKHNlY29uZHNUb1N0YXJ0KSk7XG4gICAgaWYgKGJlc3RUaWNrIDw9IDEwKSBsaS5zb3VuZFsnY291bnREb3duJyArIGJlc3RUaWNrXSgpO1xuXG4gICAgaWYgKGJlc3RUaWNrID4gMCkge1xuICAgICAgbGV0IG5leHRUaWNrID0gTWF0aC5taW4oMTAsIGJlc3RUaWNrIC0gMSk7XG4gICAgICBjb3VudERvd25UaW1lb3V0ID0gc2V0VGltZW91dChjdXJDb3VudGVyLCAxMDAwICpcbiAgICAgICAgTWF0aC5taW4oMS4xLCBNYXRoLm1heCgwLjgsIChzZWNvbmRzVG9TdGFydCAtIG5leHRUaWNrKSkpKTtcbiAgICB9XG5cbiAgICBpZiAoIXN0YXJ0ZWQgJiYgYmVzdFRpY2sgPD0gMTApIHtcbiAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgbm90aWZ5KCdUaGUgdG91cm5hbWVudCBpcyBzdGFydGluZyEnKTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoZGF0YTogVG91cm5hbWVudERhdGEpIHtcbiAgaWYgKCFkYXRhLm1lKSByZXR1cm47XG4gIGlmICghZGF0YS5pc1JlY2VudGx5RmluaXNoZWQpIHJldHVybjtcbiAgaWYgKCFsaS5vbmNlKCd0b3VybmFtZW50LmVuZC5zb3VuZC4nICsgZGF0YS5pZCkpIHJldHVybjtcblxuICBsZXQgc291bmRLZXkgPSAnT3RoZXInO1xuICBpZiAoZGF0YS5tZS5yYW5rIDwgNCkgc291bmRLZXkgPSAnMXN0JztcbiAgZWxzZSBpZiAoZGF0YS5tZS5yYW5rIDwgMTEpIHNvdW5kS2V5ID0gJzJuZCc7XG4gIGVsc2UgaWYgKGRhdGEubWUucmFuayA8IDIxKSBzb3VuZEtleSA9ICczcmQnO1xuXG4gIGxpLnNvdW5kWyd0b3VybmFtZW50JyArIHNvdW5kS2V5XSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY291bnREb3duKGRhdGE6IFRvdXJuYW1lbnREYXRhKSB7XG4gIGlmICghZGF0YS5tZSB8fCAhZGF0YS5zZWNvbmRzVG9TdGFydCkge1xuICAgIGlmIChjb3VudERvd25UaW1lb3V0KSBjbGVhclRpbWVvdXQoY291bnREb3duVGltZW91dCk7XG4gICAgY291bnREb3duVGltZW91dCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvdW50RG93blRpbWVvdXQpIHJldHVybjtcbiAgaWYgKGRhdGEuc2Vjb25kc1RvU3RhcnQgPiA2MCAqIDYwICogMjQpIHJldHVybjtcblxuICBjb3VudERvd25UaW1lb3V0ID0gc2V0VGltZW91dChcbiAgICBkb0NvdW50RG93bihwZXJmb3JtYW5jZS5ub3coKSArIDEwMDAgKiBkYXRhLnNlY29uZHNUb1N0YXJ0IC0gMTAwKSxcbiAgICA5MDApOyAgLy8gd2FpdCA5MDBtcyBiZWZvcmUgc3RhcnRpbmcgY291bnRkb3duLlxuXG4gIHNldFRpbWVvdXQobGkuc291bmQud2FybXVwLCAoZGF0YS5zZWNvbmRzVG9TdGFydCAtIDE1KSAqIDEwMDApO1xuXG4gIC8vIFByZWxvYWQgY291bnRkb3duIHNvdW5kcy5cbiAgZm9yIChsZXQgaSA9IDEwOyBpPj0wOyBpLS0pIGxpLnNvdW5kLmxvYWQoJ2NvdW50RG93bicgKyBpKTtcbn1cbiIsImltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuL2N0cmwnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNJbihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcikge1xuICByZXR1cm4gY3RybC5kYXRhLm1lICYmICFjdHJsLmRhdGEubWUud2l0aGRyYXc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aWxsQmVQYWlyZWQoY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIpIHtcbiAgcmV0dXJuIGlzSW4oY3RybCkgJiYgIWN0cmwuZGF0YS5wYWlyaW5nc0Nsb3NlZDtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnO1xuaW1wb3J0IFRvdXJuYW1lbnRDb250cm9sbGVyIGZyb20gJy4uL2N0cmwnO1xuaW1wb3J0IHsgcGxheWVyIGFzIHJlbmRlclBsYXllciwgcmF0aW8ycGVyY2VudCwgYmluZCwgZGF0YUljb24sIHBsYXllck5hbWUgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgdGVhbU5hbWUgfSBmcm9tICcuL2JhdHRsZSc7XG5pbXBvcnQgeyBNYXliZVZOb2RlcyB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0ICogYXMgYnV0dG9uIGZyb20gJy4vYnV0dG9uJztcbmltcG9ydCAqIGFzIHBhZ2luYXRpb24gZnJvbSAnLi4vcGFnaW5hdGlvbic7XG5cbmNvbnN0IHNjb3JlVGFnTmFtZXMgPSBbJ3Njb3JlJywgJ3N0cmVhaycsICdkb3VibGUnXTtcblxuZnVuY3Rpb24gc2NvcmVUYWcocykge1xuICByZXR1cm4gaChzY29yZVRhZ05hbWVzWyhzWzFdIHx8IDEpIC0gMV0sIFtBcnJheS5pc0FycmF5KHMpID8gc1swXSA6IHNdKTtcbn1cblxuZnVuY3Rpb24gcGxheWVyVHIoY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIsIHBsYXllcikge1xuICBjb25zdCB1c2VySWQgPSBwbGF5ZXIubmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgIG5iU2NvcmVzID0gcGxheWVyLnNoZWV0LnNjb3Jlcy5sZW5ndGg7XG4gIGNvbnN0IGJhdHRsZSA9IGN0cmwuZGF0YS50ZWFtQmF0dGxlO1xuICByZXR1cm4gaCgndHInLCB7XG4gICAga2V5OiB1c2VySWQsXG4gICAgY2xhc3M6IHtcbiAgICAgIG1lOiBjdHJsLm9wdHMudXNlcklkID09PSB1c2VySWQsXG4gICAgICBsb25nOiBuYlNjb3JlcyA+IDM1LFxuICAgICAgeGxvbmc6IG5iU2NvcmVzID4gODAsXG4gICAgICBhY3RpdmU6IGN0cmwucGxheWVySW5mby5pZCA9PT0gdXNlcklkXG4gICAgfSxcbiAgICBob29rOiBiaW5kKCdjbGljaycsIF8gPT4gY3RybC5zaG93UGxheWVySW5mbyhwbGF5ZXIpLCBjdHJsLnJlZHJhdylcbiAgfSwgW1xuICAgIGgoJ3RkLnJhbmsnLCBwbGF5ZXIud2l0aGRyYXcgPyBoKCdpJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdaJyxcbiAgICAgICAgJ3RpdGxlJzogY3RybC50cmFucy5ub2FyZygncGF1c2UnKVxuICAgICAgfVxuICAgIH0pIDogcGxheWVyLnJhbmspLFxuICAgIGgoJ3RkLnBsYXllcicsIFtcbiAgICAgIHJlbmRlclBsYXllcihwbGF5ZXIsIGZhbHNlLCB0cnVlLCB1c2VySWQgPT09IGN0cmwuZGF0YS5kZWZlbmRlciksXG4gICAgICAuLi4oYmF0dGxlICYmIHBsYXllci50ZWFtID8gWycgJywgdGVhbU5hbWUoYmF0dGxlLCBwbGF5ZXIudGVhbSldIDogW10pXG4gICAgXSksXG4gICAgaCgndGQuc2hlZXQnLCBwbGF5ZXIuc2hlZXQuc2NvcmVzLm1hcChzY29yZVRhZykpLFxuICAgIGgoJ3RkLnRvdGFsJywgW1xuICAgICAgcGxheWVyLnNoZWV0LmZpcmUgJiYgIWN0cmwuZGF0YS5pc0ZpbmlzaGVkID9cbiAgICAgIGgoJ3N0cm9uZy5pcy1nb2xkJywgeyBhdHRyczogZGF0YUljb24oJ1EnKSB9LCBwbGF5ZXIuc2hlZXQudG90YWwpIDpcbiAgICAgIGgoJ3N0cm9uZycsIHBsYXllci5zaGVldC50b3RhbClcbiAgICBdKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gcG9kaXVtVXNlcm5hbWUocCkge1xuICByZXR1cm4gaCgnYS50ZXh0LnVscHQudXNlci1saW5rJywge1xuICAgIGF0dHJzOiB7IGhyZWY6ICcvQC8nICsgcC5uYW1lIH1cbiAgfSwgcGxheWVyTmFtZShwKSk7XG59XG5cbmZ1bmN0aW9uIHBvZGl1bVN0YXRzKHAsIHRyYW5zOiBUcmFucyk6IFZOb2RlIHtcbiAgY29uc3Qgbm9hcmcgPSB0cmFucy5ub2FyZywgbmIgPSBwLm5iO1xuICByZXR1cm4gaCgndGFibGUuc3RhdHMnLCBbXG4gICAgcC5wZXJmb3JtYW5jZSA/IGgoJ3RyJywgW2goJ3RoJywgbm9hcmcoJ3BlcmZvcm1hbmNlJykpLCBoKCd0ZCcsIHAucGVyZm9ybWFuY2UpXSkgOiBudWxsLFxuICAgIGgoJ3RyJywgW2goJ3RoJywgbm9hcmcoJ2dhbWVzUGxheWVkJykpLCBoKCd0ZCcsIG5iLmdhbWUpXSksXG4gICAgLi4uKG5iLmdhbWUgPyBbXG4gICAgICBoKCd0cicsIFtoKCd0aCcsIG5vYXJnKCd3aW5SYXRlJykpLCBoKCd0ZCcsIHJhdGlvMnBlcmNlbnQobmIud2luIC8gbmIuZ2FtZSkpXSksXG4gICAgICBoKCd0cicsIFtoKCd0aCcsIG5vYXJnKCdiZXJzZXJrUmF0ZScpKSwgaCgndGQnLCByYXRpbzJwZXJjZW50KG5iLmJlcnNlcmsgLyBuYi5nYW1lKSldKVxuICAgIF0gOiBbXSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIHBvZGl1bVBvc2l0aW9uKHAsIHBvcywgdHJhbnM6IFRyYW5zKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAocCkgcmV0dXJuIGgoJ2Rpdi4nICsgcG9zLCBbXG4gICAgaCgnZGl2LnRyb3BoeScpLFxuICAgIHBvZGl1bVVzZXJuYW1lKHApLFxuICAgIHBvZGl1bVN0YXRzKHAsIHRyYW5zKVxuICBdKTtcbn1cblxubGV0IGxhc3RCb2R5OiBNYXliZVZOb2RlcyB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGZ1bmN0aW9uIHBvZGl1bShjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcikge1xuICBjb25zdCBwID0gY3RybC5kYXRhLnBvZGl1bSB8fCBbXTtcbiAgcmV0dXJuIGgoJ2Rpdi50b3VyX19wb2RpdW0nLCBbXG4gICAgcG9kaXVtUG9zaXRpb24ocFsxXSwgJ3NlY29uZCcsIGN0cmwudHJhbnMpLFxuICAgIHBvZGl1bVBvc2l0aW9uKHBbMF0sICdmaXJzdCcsIGN0cmwudHJhbnMpLFxuICAgIHBvZGl1bVBvc2l0aW9uKHBbMl0sICd0aGlyZCcsIGN0cmwudHJhbnMpXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBwcmVsb2FkVXNlclRpcHMoZWw6IEhUTUxFbGVtZW50KSB7XG4gIHdpbmRvdy5saWNoZXNzLnBvd2VydGlwLm1hbnVhbFVzZXJJbihlbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250cm9scyhjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlciwgcGFnKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2LnRvdXJfX2NvbnRyb2xzJywgW1xuICAgIGgoJ2Rpdi5wYWdlcicsIHBhZ2luYXRpb24ucmVuZGVyUGFnZXIoY3RybCwgcGFnKSksXG4gICAgYnV0dG9uLmpvaW5XaXRoZHJhdyhjdHJsKVxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YW5kaW5nKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyLCBwYWcsIGtsYXNzPzogc3RyaW5nKTogVk5vZGUge1xuICBjb25zdCB0YWJsZUJvZHkgPSBwYWcuY3VycmVudFBhZ2VSZXN1bHRzID9cbiAgICBwYWcuY3VycmVudFBhZ2VSZXN1bHRzLm1hcChyZXMgPT4gcGxheWVyVHIoY3RybCwgcmVzKSkgOiBsYXN0Qm9keTtcbiAgaWYgKHBhZy5jdXJyZW50UGFnZVJlc3VsdHMpIGxhc3RCb2R5ID0gdGFibGVCb2R5O1xuICByZXR1cm4gaCgndGFibGUuc2xpc3QudG91cl9fc3RhbmRpbmcnICsgKGtsYXNzID8gJy4nICsga2xhc3MgOiAnJyksIHtcbiAgICBjbGFzczogeyBsb2FkaW5nOiAhcGFnLmN1cnJlbnRQYWdlUmVzdWx0cyB9LFxuICB9LCBbXG4gICAgaCgndGJvZHknLCB7XG4gICAgICBob29rOiB7XG4gICAgICAgIGluc2VydDogdm5vZGUgPT4gcHJlbG9hZFVzZXJUaXBzKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCksXG4gICAgICAgIHVwZGF0ZShfLCB2bm9kZSkgeyBwcmVsb2FkVXNlclRpcHModm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KSB9XG4gICAgICB9XG4gICAgfSwgdGFibGVCb2R5KVxuICBdKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnO1xuXG5pbXBvcnQgeyBiaW5kLCBvbkluc2VydCwgcGxheWVyTmFtZSB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBUZWFtQmF0dGxlLCBSYW5rZWRUZWFtIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgVG91cm5hbWVudENvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBqb2luV2l0aFRlYW1TZWxlY3RvcihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcikge1xuICBjb25zdCBvbkNsb3NlID0gKCkgPT4ge1xuICAgIGN0cmwuam9pbldpdGhUZWFtU2VsZWN0b3IgPSBmYWxzZTtcbiAgICBjdHJsLnJlZHJhdygpO1xuICB9O1xuICBjb25zdCB0YiA9IGN0cmwuZGF0YS50ZWFtQmF0dGxlITtcbiAgcmV0dXJuIGgoJ2RpdiNtb2RhbC1vdmVybGF5Jywge1xuICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgb25DbG9zZSlcbiAgfSwgW1xuICAgIGgoJ2RpdiNtb2RhbC13cmFwLnRlYW0tYmF0dGxlX19jaG9pY2UnLCB7XG4gICAgICBob29rOiBvbkluc2VydChlbCA9PiB7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgIH0pXG4gICAgfSwgW1xuICAgICAgaCgnc3Bhbi5jbG9zZScsIHtcbiAgICAgICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6ICdMJyB9LFxuICAgICAgICBob29rOiBiaW5kKCdjbGljaycsIG9uQ2xvc2UpXG4gICAgICB9KSxcbiAgICAgIGgoJ2Rpdi50ZWFtLXBpY2tlcicsIFtcbiAgICAgICAgaCgnaDInLCBcIlBpY2sgeW91ciB0ZWFtXCIpLFxuICAgICAgICBoKCdicicpLFxuICAgICAgICAuLi4odGIuam9pbldpdGgubGVuZ3RoID8gW1xuICAgICAgICAgIGgoJ3AnLCBcIldoaWNoIHRlYW0gd2lsbCB5b3UgcmVwcmVzZW50IGluIHRoaXMgYmF0dGxlP1wiKSxcbiAgICAgICAgICAuLi50Yi5qb2luV2l0aC5tYXAoaWQgPT4gaCgnYS5idXR0b24nLCB7XG4gICAgICAgICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwuam9pbih1bmRlZmluZWQsIGlkKSwgY3RybC5yZWRyYXcpXG4gICAgICAgICAgfSwgdGIudGVhbXNbaWRdKSlcbiAgICAgICAgXSA6IFtcbiAgICAgICAgICBoKCdwJywgXCJZb3UgbXVzdCBqb2luIG9uZSBvZiB0aGVzZSB0ZWFtcyB0byBwYXJ0aWNpcGF0ZSFcIiksXG4gICAgICAgICAgaCgndWwnLCBzaHVmZmxlQXJyYXkoT2JqZWN0LmtleXModGIudGVhbXMpKS5tYXAodCA9PlxuICAgICAgICAgICAgaCgnbGknLCBoKCdhJywge1xuICAgICAgICAgICAgICBhdHRyczogeyBocmVmOiAnL3RlYW0vJyArIHQgfVxuICAgICAgICAgICAgfSwgdGIudGVhbXNbdF0pKVxuICAgICAgICAgICkpXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIF0pXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVhbVN0YW5kaW5nKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyLCBrbGFzcz86IHN0cmluZyk6IFZOb2RlIHwgbnVsbCB7XG4gIGNvbnN0IGJhdHRsZSA9IGN0cmwuZGF0YS50ZWFtQmF0dGxlLFxuICAgIHN0YW5kaW5nID0gY3RybC5kYXRhLnRlYW1TdGFuZGluZztcbiAgcmV0dXJuIGJhdHRsZSAmJiBzdGFuZGluZyA/IGgoJ3RhYmxlLnNsaXN0LnRvdXJfX3RlYW0tc3RhbmRpbmcnICsgKGtsYXNzID8gJy4nICsga2xhc3MgOiAnJyksIFtcbiAgICBoKCd0Ym9keScsIHN0YW5kaW5nLm1hcChydCA9PiB0ZWFtVHIoY3RybCwgYmF0dGxlLCBydCkpKVxuICBdKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZWFtTmFtZShiYXR0bGU6IFRlYW1CYXR0bGUsIHRlYW1JZDogc3RyaW5nKTogVk5vZGUge1xuICByZXR1cm4gaCgndGVhbS50dGMtJyArIE9iamVjdC5rZXlzKGJhdHRsZS50ZWFtcykuaW5kZXhPZih0ZWFtSWQpLCBiYXR0bGUudGVhbXNbdGVhbUlkXSk7XG59XG5cbmZ1bmN0aW9uIHRlYW1UcihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlciwgYmF0dGxlOiBUZWFtQmF0dGxlLCB0ZWFtOiBSYW5rZWRUZWFtKSB7XG4gIGNvbnN0IHBsYXllcnMgPSBbXSBhcyAoc3RyaW5nIHwgVk5vZGUpW107XG4gIHRlYW0ucGxheWVycy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgaWYgKGkgPiAwKSBwbGF5ZXJzLnB1c2goJysnKTtcbiAgICBwbGF5ZXJzLnB1c2goaCgnc2NvcmUudWxwdC51c2VyLWxpbmsnLCB7XG4gICAgICBrZXk6IHAudXNlci5uYW1lLFxuICAgICAgY2xhc3M6IHsgdG9wOiBpID09PSAwIH0sXG4gICAgICBhdHRyczoge1xuICAgICAgICAnZGF0YS1ocmVmJzogJy9ALycgKyBwLnVzZXIubmFtZSxcbiAgICAgICAgJ2RhdGEtbmFtZSc6IHAudXNlci5uYW1lXG4gICAgICB9LFxuICAgICAgaG9vazoge1xuICAgICAgICBkZXN0cm95OiB2bm9kZSA9PiAkLnBvd2VyVGlwLmRlc3Ryb3kodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KSxcbiAgICAgICAgLi4uYmluZCgnY2xpY2snLCBfID0+IGN0cmwuanVtcFRvUGFnZU9mKHAudXNlci5uYW1lKSwgY3RybC5yZWRyYXcpXG4gICAgICB9XG4gICAgfSwgW1xuICAgICAgLi4uKGkgPT09IDAgPyBbaCgndXNlcm5hbWUnLCBwbGF5ZXJOYW1lKHAudXNlcikpLCAnICddIDogW10pLFxuICAgICAgJycgKyBwLnNjb3JlXG4gICAgXSkpO1xuICB9KTtcbiAgcmV0dXJuIGgoJ3RyJywge1xuICAgIGtleTogdGVhbS5pZCxcbiAgICBjbGFzczoge1xuICAgICAgYWN0aXZlOiBjdHJsLnRlYW1JbmZvLnJlcXVlc3RlZCA9PSB0ZWFtLmlkXG4gICAgfSxcbiAgICBob29rOiBiaW5kKCdjbGljaycsIF8gPT4gY3RybC5zaG93VGVhbUluZm8odGVhbS5pZCksIGN0cmwucmVkcmF3KVxuICB9LCBbXG4gICAgaCgndGQucmFuaycsICcnICsgdGVhbS5yYW5rKSxcbiAgICBoKCd0ZC50ZWFtJywgW1xuICAgICAgdGVhbU5hbWUoYmF0dGxlLCB0ZWFtLmlkKVxuICAgIF0pLFxuICAgIGgoJ3RkLnBsYXllcnMnLCBwbGF5ZXJzKSxcbiAgICBoKCd0ZC50b3RhbCcsIFtcbiAgICAgIGgoJ3N0cm9uZycsICcnICsgdGVhbS5zY29yZSlcbiAgICBdKVxuICBdKTtcbn1cblxuLyogUmFuZG9taXplIGFycmF5IGVsZW1lbnQgb3JkZXIgaW4tcGxhY2UuIFVzaW5nIER1cnN0ZW5mZWxkIHNodWZmbGUgYWxnb3JpdGhtLiAqL1xuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gIGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgIFthcnJheVtpXSwgYXJyYXlbal1dID0gW2FycmF5W2pdLCBhcnJheVtpXV07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5pbXBvcnQgeyBpc0luIH0gZnJvbSAnLi4vdG91cm5hbWVudCc7XG5pbXBvcnQgeyBzcGlubmVyLCBiaW5kLCBkYXRhSWNvbiB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgVG91cm5hbWVudENvbnRyb2xsZXIgZnJvbSAnLi4vY3RybCc7XG5cbmZ1bmN0aW9uIG9ySm9pblNwaW5uZXIoY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIsIGY6ICgpID0+IFZOb2RlKTogVk5vZGUge1xuICByZXR1cm4gY3RybC5qb2luU3Bpbm5lciA/IHNwaW5uZXIoKSA6IGYoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhkcmF3KGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKTogVk5vZGUge1xuICByZXR1cm4gb3JKb2luU3Bpbm5lcihjdHJsLCAoKSA9PiB7XG4gICAgY29uc3QgcGF1c2UgPSBjdHJsLmRhdGEuaXNTdGFydGVkO1xuICAgIHJldHVybiBoKCdidXR0b24uZmJ0LnRleHQnLCB7XG4gICAgICBhdHRyczogZGF0YUljb24ocGF1c2UgPyAnWicgOiAnYicpLFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCBjdHJsLndpdGhkcmF3LCBjdHJsLnJlZHJhdylcbiAgICB9LCBjdHJsLnRyYW5zLm5vYXJnKHBhdXNlID8gJ3BhdXNlJyA6ICd3aXRoZHJhdycpKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqb2luKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKTogVk5vZGUge1xuICByZXR1cm4gb3JKb2luU3Bpbm5lcihjdHJsLCAoKSA9PiB7XG4gICAgY29uc3QgZGVsYXkgPSBjdHJsLmRhdGEubWUgJiYgY3RybC5kYXRhLm1lLnBhdXNlRGVsYXk7XG4gICAgY29uc3Qgam9pbmFibGUgPSBjdHJsLmRhdGEudmVyZGljdHMuYWNjZXB0ZWQgJiYgIWRlbGF5O1xuICAgIGNvbnN0IGJ1dHRvbiA9IGgoJ2J1dHRvbi5mYnQudGV4dCcgKyAoam9pbmFibGUgPyAnLmhpZ2hsaWdodCcgOiAnJyksIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIGRpc2FibGVkOiAham9pbmFibGUsXG4gICAgICAgICdkYXRhLWljb24nOiAnRydcbiAgICAgIH0sXG4gICAgICBob29rOiBiaW5kKCdjbGljaycsIF8gPT4ge1xuICAgICAgICBpZiAoY3RybC5kYXRhLnByaXZhdGUpIHtcbiAgICAgICAgICBjb25zdCBwID0gcHJvbXB0KGN0cmwudHJhbnMubm9hcmcoJ3Bhc3N3b3JkJykpO1xuICAgICAgICAgIGlmIChwICE9PSBudWxsKSBjdHJsLmpvaW4ocCk7XG4gICAgICAgIH0gZWxzZSBjdHJsLmpvaW4oKTtcbiAgICAgIH0sIGN0cmwucmVkcmF3KVxuICAgIH0sIGN0cmwudHJhbnMoJ2pvaW4nKSk7XG4gICAgcmV0dXJuIGRlbGF5ID8gaCgnZGl2LmRlbGF5LXdyYXAnLCB7XG4gICAgICBhdHRyczogeyB0aXRsZTogXCJXYWl0aW5nIHRvIGJlIGFibGUgdG8gcmUtam9pbiB0aGUgdG91cm5hbWVudFwiIH1cbiAgICB9LCBbXG4gICAgICBoKCdkaXYuZGVsYXknLCB7XG4gICAgICAgIGhvb2s6IHtcbiAgICAgICAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgZWwuc3R5bGUuYW5pbWF0aW9uID0gYHRvdXItZGVsYXkgJHtkZWxheX1zIGxpbmVhcmA7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGRlbGF5ID09PSBjdHJsLmRhdGEubWUucGF1c2VEZWxheSkge1xuICAgICAgICAgICAgICAgIGN0cmwuZGF0YS5tZS5wYXVzZURlbGF5ID0gMDtcbiAgICAgICAgICAgICAgICBjdHJsLnJlZHJhdygpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBkZWxheSAqIDEwMDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgW2J1dHRvbl0pXG4gICAgXSkgOiBidXR0b247XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gam9pbldpdGhkcmF3KGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIWN0cmwub3B0cy51c2VySWQpIHJldHVybiBoKCdhLmZidC50ZXh0LmhpZ2hsaWdodCcsIHtcbiAgICBhdHRyczoge1xuICAgICAgaHJlZjogJy9sb2dpbj9yZWZlcnJlcj0nICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLFxuICAgICAgJ2RhdGEtaWNvbic6ICdHJ1xuICAgIH1cbiAgfSwgY3RybC50cmFucygnc2lnbkluJykpO1xuICBpZiAoIWN0cmwuZGF0YS5pc0ZpbmlzaGVkKSByZXR1cm4gaXNJbihjdHJsKSA/IHdpdGhkcmF3KGN0cmwpIDogam9pbihjdHJsKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnO1xuaW1wb3J0IFRvdXJuYW1lbnRDb250cm9sbGVyIGZyb20gJy4uL2N0cmwnO1xuaW1wb3J0IHsgTWF5YmVWTm9kZXMgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCAqIGFzIHBhZ2luYXRpb24gZnJvbSAnLi4vcGFnaW5hdGlvbic7XG5pbXBvcnQgeyBjb250cm9scywgc3RhbmRpbmcgfSBmcm9tICcuL2FyZW5hJztcbmltcG9ydCB7IHRlYW1TdGFuZGluZyB9IGZyb20gJy4vYmF0dGxlJztcbmltcG9ydCB0ZWFtSW5mbyBmcm9tICcuL3RlYW1JbmZvJztcbmltcG9ydCB7IG9uSW5zZXJ0IH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBoZWFkZXIgZnJvbSAnLi9oZWFkZXInO1xuXG5leHBvcnQgY29uc3QgbmFtZSA9ICdjcmVhdGVkJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIpOiBNYXliZVZOb2RlcyB7XG4gIGNvbnN0IHBhZyA9IHBhZ2luYXRpb24ucGxheWVycyhjdHJsKTtcbiAgcmV0dXJuIFtcbiAgICBoZWFkZXIoY3RybCksXG4gICAgdGVhbVN0YW5kaW5nKGN0cmwsICdjcmVhdGVkJyksXG4gICAgY29udHJvbHMoY3RybCwgcGFnKSxcbiAgICBzdGFuZGluZyhjdHJsLCBwYWcsICdjcmVhdGVkJyksXG4gICAgaCgnYmxvY2txdW90ZS5wdWxsLXF1b3RlJywgW1xuICAgICAgaCgncCcsIGN0cmwuZGF0YS5xdW90ZS50ZXh0KSxcbiAgICAgIGgoJ2Zvb3RlcicsIGN0cmwuZGF0YS5xdW90ZS5hdXRob3IpXG4gICAgXSksXG4gICAgY3RybC5vcHRzLiRmYXEgPyBoKCdkaXYnLCB7XG4gICAgICBob29rOiBvbkluc2VydChlbCA9PiAkKGVsKS5yZXBsYWNlV2l0aChjdHJsLm9wdHMuJGZhcSkpXG4gICAgfSkgOiBudWxsXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWJsZShjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcik6IFZOb2RlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGN0cmwudGVhbUluZm8ucmVxdWVzdGVkID8gdGVhbUluZm8oY3RybCkgOiB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJztcbmltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IFRvdXJuYW1lbnREYXRhLCBNYXliZVZOb2RlcyB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0ICogYXMgcGFnaW5hdGlvbiBmcm9tICcuLi9wYWdpbmF0aW9uJztcbmltcG9ydCB7IGNvbnRyb2xzLCBzdGFuZGluZywgcG9kaXVtIH0gZnJvbSAnLi9hcmVuYSc7XG5pbXBvcnQgeyB0ZWFtU3RhbmRpbmcgfSBmcm9tICcuL2JhdHRsZSc7XG5pbXBvcnQgaGVhZGVyIGZyb20gJy4vaGVhZGVyJztcbmltcG9ydCBwbGF5ZXJJbmZvIGZyb20gJy4vcGxheWVySW5mbyc7XG5pbXBvcnQgdGVhbUluZm8gZnJvbSAnLi90ZWFtSW5mbyc7XG5pbXBvcnQgeyBudW1iZXJSb3cgfSBmcm9tICcuL3V0aWwnO1xuXG5mdW5jdGlvbiBjb25mZXR0aShkYXRhOiBUb3VybmFtZW50RGF0YSk6IFZOb2RlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGRhdGEubWUgJiYgZGF0YS5pc1JlY2VudGx5RmluaXNoZWQgJiYgd2luZG93LmxpY2hlc3Mub25jZSgndG91cm5hbWVudC5lbmQuY2FudmFzLicgKyBkYXRhLmlkKSlcbiAgICByZXR1cm4gaCgnY2FudmFzI2NvbmZldHRpJywge1xuICAgICAgaG9vazoge1xuICAgICAgICBpbnNlcnQ6IF8gPT4gd2luZG93LmxpY2hlc3MubG9hZFNjcmlwdCgnamF2YXNjcmlwdHMvY29uZmV0dGkuanMnKVxuICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzdGF0cyhkYXRhOiBUb3VybmFtZW50RGF0YSwgbm9hcmc6IGFueSk6IFZOb2RlIHtcbiAgY29uc3QgdGFibGVEYXRhID0gW1xuICAgIG51bWJlclJvdyhub2FyZygnYXZlcmFnZUVsbycpLCBkYXRhLnN0YXRzLmF2ZXJhZ2VSYXRpbmcsICdyYXcnKSxcbiAgICBudW1iZXJSb3cobm9hcmcoJ2dhbWVzUGxheWVkJyksIGRhdGEuc3RhdHMuZ2FtZXMpLFxuICAgIG51bWJlclJvdyhub2FyZygnbW92ZXNQbGF5ZWQnKSwgZGF0YS5zdGF0cy5tb3ZlcyksXG4gICAgbnVtYmVyUm93KG5vYXJnKCd3aGl0ZVdpbnMnKSwgW2RhdGEuc3RhdHMud2hpdGVXaW5zLCBkYXRhLnN0YXRzLmdhbWVzXSwgJ3BlcmNlbnQnKSxcbiAgICBudW1iZXJSb3cobm9hcmcoJ2JsYWNrV2lucycpLCBbZGF0YS5zdGF0cy5ibGFja1dpbnMsIGRhdGEuc3RhdHMuZ2FtZXNdLCAncGVyY2VudCcpLFxuICAgIG51bWJlclJvdyhub2FyZygnZHJhd3MnKSwgW2RhdGEuc3RhdHMuZHJhd3MsIGRhdGEuc3RhdHMuZ2FtZXNdLCAncGVyY2VudCcpLFxuICBdO1xuXG4gIGlmIChkYXRhLmJlcnNlcmthYmxlKSB7XG4gICAgY29uc3QgYmVyc2Vya1JhdGUgPSBbZGF0YS5zdGF0cy5iZXJzZXJrcyAvIDIsIGRhdGEuc3RhdHMuZ2FtZXNdO1xuICAgIHRhYmxlRGF0YS5wdXNoKG51bWJlclJvdyhub2FyZygnYmVyc2Vya1JhdGUnKSwgYmVyc2Vya1JhdGUsICdwZXJjZW50JykpXG4gIH1cblxuICByZXR1cm4gaCgnZGl2LnRvdXJfX3N0YXRzJywgW1xuICAgIGgoJ2gyJywgbm9hcmcoJ3RvdXJuYW1lbnRDb21wbGV0ZScpKSxcbiAgICBoKCd0YWJsZScsIHRhYmxlRGF0YSlcbiAgXSk7XG59XG5cbmV4cG9ydCBjb25zdCBuYW1lID0gJ2ZpbmlzaGVkJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIpOiBNYXliZVZOb2RlcyB7XG4gIGNvbnN0IHBhZyA9IHBhZ2luYXRpb24ucGxheWVycyhjdHJsKTtcbiAgY29uc3QgdGVhbVMgPSB0ZWFtU3RhbmRpbmcoY3RybCwgJ2ZpbmlzaGVkJyk7XG4gIHJldHVybiBbXG4gICAgLi4uKHRlYW1TID8gW2hlYWRlcihjdHJsKSwgdGVhbVNdIDogW1xuICAgICAgaCgnZGl2LmJpZ190b3AnLCBbXG4gICAgICAgIGNvbmZldHRpKGN0cmwuZGF0YSksXG4gICAgICAgIGhlYWRlcihjdHJsKSxcbiAgICAgICAgcG9kaXVtKGN0cmwpXG4gICAgICBdKVxuICAgIF0pLFxuICAgIGNvbnRyb2xzKGN0cmwsIHBhZyksXG4gICAgc3RhbmRpbmcoY3RybCwgcGFnKVxuICBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFibGUoY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBjdHJsLnBsYXllckluZm8uaWQgPyBwbGF5ZXJJbmZvKGN0cmwpIDogKFxuICAgIGN0cmwudGVhbUluZm8ucmVxdWVzdGVkID8gdGVhbUluZm8oY3RybCkgOiAoXG4gICAgICBzdGF0cyA/IHN0YXRzKGN0cmwuZGF0YSwgY3RybC50cmFucy5ub2FyZykgOiB1bmRlZmluZWRcbiAgICApXG4gICk7XG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJztcbmltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IGRhdGFJY29uIH0gZnJvbSAnLi91dGlsJztcblxuZnVuY3Rpb24gc3RhcnRDbG9jayh0aW1lKSB7XG4gIHJldHVybiB7XG4gICAgaW5zZXJ0OiB2bm9kZSA9PiAkKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkuY2xvY2soeyB0aW1lOiB0aW1lIH0pXG4gIH07XG59XG5cbmNvbnN0IG9uZURheUluU2Vjb25kcyA9IDYwICogNjAgKiAyNDtcblxuZnVuY3Rpb24gaGFzRnJlcShmcmVxLCBkKSB7XG4gIHJldHVybiBkLnNjaGVkdWxlICYmIGQuc2NoZWR1bGUuZnJlcSA9PT0gZnJlcTtcbn1cblxuZnVuY3Rpb24gY2xvY2soZCk6IFZOb2RlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGQuaXNGaW5pc2hlZCkgcmV0dXJuO1xuICBpZiAoZC5zZWNvbmRzVG9GaW5pc2gpIHJldHVybiBoKCdkaXYuY2xvY2snLCB7XG4gICAgaG9vazogc3RhcnRDbG9jayhkLnNlY29uZHNUb0ZpbmlzaClcbiAgfSwgW1xuICAgIGgoJ2Rpdi50aW1lJylcbiAgXSk7XG4gIGlmIChkLnNlY29uZHNUb1N0YXJ0KSB7XG4gICAgaWYgKGQuc2Vjb25kc1RvU3RhcnQgPiBvbmVEYXlJblNlY29uZHMpIHJldHVybiBoKCdkaXYuY2xvY2snLCBbXG4gICAgICBoKCd0aW1lLnRpbWVhZ28uc2h5Jywge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIHRpdGxlOiBuZXcgRGF0ZShkLnN0YXJ0c0F0KS50b0xvY2FsZVN0cmluZygpLFxuICAgICAgICAgIGRhdGV0aW1lOiBEYXRlLm5vdygpICsgZC5zZWNvbmRzVG9TdGFydCAqIDEwMDBcbiAgICAgICAgfSxcbiAgICAgICAgaG9vazoge1xuICAgICAgICAgIGluc2VydCh2bm9kZSkge1xuICAgICAgICAgICAgKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkuc2V0QXR0cmlidXRlKCdkYXRldGltZScsICcnICsgKERhdGUubm93KCkgKyBkLnNlY29uZHNUb1N0YXJ0ICogMTAwMCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICBdKTtcbiAgICByZXR1cm4gaCgnZGl2LmNsb2NrLmNsb2NrLWNyZWF0ZWQnLCB7XG4gICAgICBob29rOiBzdGFydENsb2NrKGQuc2Vjb25kc1RvU3RhcnQpXG4gICAgfSwgW1xuICAgICAgaCgnc3Bhbi5zaHknLCAnU3RhcnRpbmcgaW4nKSxcbiAgICAgIGgoJ3NwYW4udGltZS50ZXh0JylcbiAgICBdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbWFnZShkKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoZC5pc0ZpbmlzaGVkKSByZXR1cm47XG4gIGlmIChoYXNGcmVxKCdzaGllbGQnLCBkKSB8fCBoYXNGcmVxKCdtYXJhdGhvbicsIGQpKSByZXR1cm47XG4gIGNvbnN0IHMgPSBkLnNwb3RsaWdodDtcbiAgaWYgKHMgJiYgcy5pY29uSW1nKSByZXR1cm4gaCgnaW1nLmltZycsIHtcbiAgICBhdHRyczogeyBzcmM6IHdpbmRvdy5saWNoZXNzLmFzc2V0VXJsKCdpbWFnZXMvJyArIHMuaWNvbkltZykgfVxuICB9KTtcbiAgcmV0dXJuIGgoJ2kuaW1nJywge1xuICAgIGF0dHJzOiBkYXRhSWNvbigocyAmJiBzLmljb25Gb250KSB8fCAnZycpXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB0aXRsZShjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcikge1xuICBjb25zdCBkID0gY3RybC5kYXRhO1xuICBpZiAoaGFzRnJlcSgnbWFyYXRob24nLCBkKSkgcmV0dXJuIGgoJ2gxJywgW1xuICAgIGgoJ2kuZmlyZS10cm9waHknLCAnXFxcXCcpLFxuICAgIGQuZnVsbE5hbWVcbiAgXSk7XG4gIGlmIChoYXNGcmVxKCdzaGllbGQnLCBkKSkgcmV0dXJuIGgoJ2gxJywgW1xuICAgIGgoJ2Euc2hpZWxkLXRyb3BoeScsIHtcbiAgICAgIGF0dHJzOiB7IGhyZWY6ICcvdG91cm5hbWVudC9zaGllbGRzJyB9XG4gICAgfSwgZC5wZXJmLmljb24pLFxuICAgIGQuZnVsbE5hbWVcbiAgXSk7XG4gIHJldHVybiBoKCdoMScsXG4gICAgKGQuZ3JlYXRQbGF5ZXIgPyBbXG4gICAgICBoKCdhJywge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIGhyZWY6IGQuZ3JlYXRQbGF5ZXIudXJsLFxuICAgICAgICAgIHRhcmdldDogJ19ibGFuaydcbiAgICAgICAgfVxuICAgICAgfSwgZC5ncmVhdFBsYXllci5uYW1lKSxcbiAgICAgICcgQXJlbmEnXG4gICAgXSA6IFtkLmZ1bGxOYW1lXSkuY29uY2F0KFxuICAgICAgZC5wcml2YXRlID8gW1xuICAgICAgICAnICcsXG4gICAgICAgIGgoJ3NwYW4nLCB7IGF0dHJzOiBkYXRhSWNvbignYScpfSlcbiAgICAgIF0gOiBbXSlcbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIpOiBWTm9kZSB7XG4gIHJldHVybiBoKCdkaXYudG91cl9fbWFpbl9faGVhZGVyJywgW1xuICAgIGltYWdlKGN0cmwuZGF0YSksXG4gICAgdGl0bGUoY3RybCksXG4gICAgY2xvY2soY3RybC5kYXRhKVxuICBdKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnO1xuaW1wb3J0ICogYXMgY3JlYXRlZCBmcm9tICcuL2NyZWF0ZWQnO1xuaW1wb3J0ICogYXMgc3RhcnRlZCBmcm9tICcuL3N0YXJ0ZWQnO1xuaW1wb3J0ICogYXMgZmluaXNoZWQgZnJvbSAnLi9maW5pc2hlZCc7XG5pbXBvcnQgeyBvbkluc2VydCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBqb2luV2l0aFRlYW1TZWxlY3RvciB9IGZyb20gJy4vYmF0dGxlJztcbmltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IE1heWJlVk5vZGVzIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKSB7XG4gIGxldCBoYW5kbGVyOiB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIG1haW4oY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIpOiBNYXliZVZOb2RlcztcbiAgICB0YWJsZShjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcik6IFZOb2RlIHwgdW5kZWZpbmVkO1xuICB9O1xuICBpZiAoY3RybC5kYXRhLmlzRmluaXNoZWQpIGhhbmRsZXIgPSBmaW5pc2hlZDtcbiAgZWxzZSBpZiAoY3RybC5kYXRhLmlzU3RhcnRlZCkgaGFuZGxlciA9IHN0YXJ0ZWQ7XG4gIGVsc2UgaGFuZGxlciA9IGNyZWF0ZWQ7XG5cbiAgcmV0dXJuIGgoJ21haW4uJyArIGN0cmwub3B0cy5jbGFzc2VzLCBbXG4gICAgaCgnYXNpZGUudG91cl9fc2lkZScsIHtcbiAgICAgIGhvb2s6IG9uSW5zZXJ0KGVsID0+IHtcbiAgICAgICAgJChlbCkucmVwbGFjZVdpdGgoY3RybC5vcHRzLiRzaWRlKTtcbiAgICAgICAgY3RybC5vcHRzLmNoYXQgJiYgd2luZG93LmxpY2hlc3MubWFrZUNoYXQoY3RybC5vcHRzLmNoYXQpO1xuICAgICAgfSlcbiAgICB9KSxcbiAgICBoKCdkaXYudG91cl9fdW5kZXJjaGF0Jywge1xuICAgICAgaG9vazogb25JbnNlcnQoZWwgPT4ge1xuICAgICAgICAkKGVsKS5yZXBsYWNlV2l0aCgkKCcudG91cl9fdW5kZXJjaGF0Lm5vbmUnKS5yZW1vdmVDbGFzcygnbm9uZScpKTtcbiAgICAgIH0pXG4gICAgfSksXG4gICAgaGFuZGxlci50YWJsZShjdHJsKSxcbiAgICBoKCdkaXYudG91cl9fbWFpbicsXG4gICAgICBoKCdkaXYuYm94LicgKyBoYW5kbGVyLm5hbWUsIHtcbiAgICAgICAgY2xhc3M6IHsgJ3RvdXJfX21haW4tZmluaXNoZWQnOiBjdHJsLmRhdGEuaXNGaW5pc2hlZCB9XG4gICAgICB9LCBoYW5kbGVyLm1haW4oY3RybCkpXG4gICAgKSxcbiAgICBjdHJsLm9wdHMuY2hhdCA/IGgoJ2Rpdi5jaGF0X19tZW1iZXJzLm5vbmUnLCBbXG4gICAgICBoKCdzcGFuLm51bWJlcicsICdcXHhhMCcpLCAnICcsIGN0cmwudHJhbnMubm9hcmcoJ3NwZWN0YXRvcnMnKSwgJyAnLCBoKCdzcGFuLmxpc3QnKVxuICAgIF0pIDogbnVsbCxcbiAgICBjdHJsLmpvaW5XaXRoVGVhbVNlbGVjdG9yID8gam9pbldpdGhUZWFtU2VsZWN0b3IoY3RybCkgOiBudWxsXG4gIF0pO1xufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5pbXBvcnQgeyBzcGlubmVyLCBiaW5kLCBudW1iZXJSb3csIHBsYXllck5hbWUsIGRhdGFJY29uLCBwbGF5ZXIgYXMgcmVuZGVyUGxheWVyIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IHRlYW1OYW1lIH0gZnJvbSAnLi9iYXR0bGUnO1xuaW1wb3J0ICogYXMgc3RhdHVzIGZyb20gJ2dhbWUvc3RhdHVzJztcbmltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcblxuZnVuY3Rpb24gcmVzdWx0KHdpbiwgc3RhdCk6IHN0cmluZyB7XG4gIHN3aXRjaCAod2luKSB7XG4gICAgY2FzZSB0cnVlOlxuICAgICAgcmV0dXJuICcxJztcbiAgICBjYXNlIGZhbHNlOlxuICAgICAgcmV0dXJuICcwJztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXQgPj0gc3RhdHVzLmlkcy5tYXRlID8gJ8K9JyA6ICcqJztcbiAgfVxufVxuXG5mdW5jdGlvbiBwbGF5ZXJUaXRsZShwbGF5ZXIpIHtcbiAgcmV0dXJuIGgoJ2gyJywgW1xuICAgIGgoJ3NwYW4ucmFuaycsIHBsYXllci5yYW5rICsgJy4gJyksXG4gICAgcmVuZGVyUGxheWVyKHBsYXllciwgdHJ1ZSwgZmFsc2UsIGZhbHNlKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gc2V0dXAodm5vZGU6IFZOb2RlKSB7XG4gIGNvbnN0IGVsID0gdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50LCBwID0gd2luZG93LmxpY2hlc3MucG93ZXJ0aXA7XG4gIHAubWFudWFsVXNlckluKGVsKTtcbiAgcC5tYW51YWxHYW1lSW4oZWwpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcik6IFZOb2RlIHtcbiAgY29uc3QgZGF0YSA9IGN0cmwucGxheWVySW5mby5kYXRhO1xuICBjb25zdCBub2FyZyA9IGN0cmwudHJhbnMubm9hcmc7XG4gIGNvbnN0IHRhZyA9ICdkaXYudG91cl9fcGxheWVyLWluZm8udG91cl9fYWN0b3ItaW5mbyc7XG4gIGlmICghZGF0YSB8fCBkYXRhLnBsYXllci5pZCAhPT0gY3RybC5wbGF5ZXJJbmZvLmlkKSByZXR1cm4gaCh0YWcsIFtcbiAgICBoKCdkaXYuc3RhdHMnLCBbXG4gICAgICBwbGF5ZXJUaXRsZShjdHJsLnBsYXllckluZm8ucGxheWVyKSxcbiAgICAgIHNwaW5uZXIoKVxuICAgIF0pXG4gIF0pO1xuICBjb25zdCBuYiA9IGRhdGEucGxheWVyLm5iLFxuICBwYWlyaW5nc0xlbiA9IGRhdGEucGFpcmluZ3MubGVuZ3RoLFxuICBhdmdPcCA9IHBhaXJpbmdzTGVuID8gTWF0aC5yb3VuZChkYXRhLnBhaXJpbmdzLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGEgKyBiLm9wLnJhdGluZztcbiAgfSwgMCkgLyBwYWlyaW5nc0xlbikgOiB1bmRlZmluZWQ7XG4gIHJldHVybiBoKHRhZywge1xuICAgIGhvb2s6IHtcbiAgICAgIGluc2VydDogc2V0dXAsXG4gICAgICBwb3N0cGF0Y2goXywgdm5vZGUpIHsgc2V0dXAodm5vZGUpIH1cbiAgICB9XG4gIH0sIFtcbiAgICBoKCdhLmNsb3NlJywge1xuICAgICAgYXR0cnM6IGRhdGFJY29uKCdMJyksXG4gICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwuc2hvd1BsYXllckluZm8oZGF0YS5wbGF5ZXIpLCBjdHJsLnJlZHJhdylcbiAgICB9KSxcbiAgICBoKCdkaXYuc3RhdHMnLCBbXG4gICAgICBwbGF5ZXJUaXRsZShkYXRhLnBsYXllciksXG4gICAgICBkYXRhLnBsYXllci50ZWFtID8gaCgndGVhbScsIHtcbiAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnNob3dUZWFtSW5mbyhkYXRhLnBsYXllci50ZWFtKSwgY3RybC5yZWRyYXcpXG4gICAgICB9LCBbdGVhbU5hbWUoY3RybC5kYXRhLnRlYW1CYXR0bGUhLCBkYXRhLnBsYXllci50ZWFtKV0pIDogbnVsbCxcbiAgICAgIGgoJ3RhYmxlJywgW1xuICAgICAgICBkYXRhLnBsYXllci5wZXJmb3JtYW5jZSA/IG51bWJlclJvdyhcbiAgICAgICAgICBub2FyZygncGVyZm9ybWFuY2UnKSxcbiAgICAgICAgICBkYXRhLnBsYXllci5wZXJmb3JtYW5jZSArIChuYi5nYW1lIDwgMyA/ICc/JyA6ICcnKSxcbiAgICAgICAgICAncmF3JykgOiBudWxsLFxuICAgICAgICAgIG51bWJlclJvdyhub2FyZygnZ2FtZXNQbGF5ZWQnKSwgbmIuZ2FtZSksXG4gICAgICAgICAgLi4uKG5iLmdhbWUgPyBbXG4gICAgICAgICAgICBudW1iZXJSb3cobm9hcmcoJ3dpblJhdGUnKSwgW25iLndpbiwgbmIuZ2FtZV0sICdwZXJjZW50JyksXG4gICAgICAgICAgICBudW1iZXJSb3cobm9hcmcoJ2JlcnNlcmtSYXRlJyksIFtuYi5iZXJzZXJrLCBuYi5nYW1lXSwgJ3BlcmNlbnQnKSxcbiAgICAgICAgICAgIG51bWJlclJvdyhub2FyZygnYXZlcmFnZU9wcG9uZW50JyksIGF2Z09wLCAncmF3JylcbiAgICAgICAgICBdIDogW10pXG4gICAgICBdKVxuICAgIF0pLFxuICAgIGgoJ2RpdicsIFtcbiAgICAgIGgoJ3RhYmxlLnBhaXJpbmdzLnN1Ymxpc3QnLCB7XG4gICAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgY29uc3QgaHJlZiA9ICgoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLnBhcmVudE5vZGUgYXMgSFRNTEVsZW1lbnQpLmdldEF0dHJpYnV0ZSgnZGF0YS1ocmVmJyk7XG4gICAgICAgICAgaWYgKGhyZWYpIHdpbmRvdy5vcGVuKGhyZWYsICdfYmxhbmsnKTtcbiAgICAgICAgfSlcbiAgICAgIH0sIGRhdGEucGFpcmluZ3MubWFwKGZ1bmN0aW9uKHAsIGkpIHtcbiAgICAgICAgY29uc3QgcmVzID0gcmVzdWx0KHAud2luLCBwLnN0YXR1cyk7XG4gICAgICAgIHJldHVybiBoKCd0ci5nbHB0LicgKyAocmVzID09PSAnMScgPyAnIHdpbicgOiAocmVzID09PSAnMCcgPyAnIGxvc3MnIDogJycpKSwge1xuICAgICAgICAgIGtleTogcC5pZCxcbiAgICAgICAgICBhdHRyczogeyAnZGF0YS1ocmVmJzogJy8nICsgcC5pZCArICcvJyArIHAuY29sb3IgfSxcbiAgICAgICAgICBob29rOiB7XG4gICAgICAgICAgICBkZXN0cm95OiB2bm9kZSA9PiAkLnBvd2VyVGlwLmRlc3Ryb3kodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgW1xuICAgICAgICAgIGgoJ3RoJywgJycgKyAoTWF0aC5tYXgobmIuZ2FtZSwgcGFpcmluZ3NMZW4pIC0gaSkpLFxuICAgICAgICAgIGgoJ3RkJywgcGxheWVyTmFtZShwLm9wKSksXG4gICAgICAgICAgaCgndGQnLCBwLm9wLnJhdGluZyksXG4gICAgICAgICAgaCgndGQuaXMuY29sb3ItaWNvbi4nICsgcC5jb2xvciksXG4gICAgICAgICAgaCgndGQnLCByZXMpXG4gICAgICAgIF0pO1xuICAgICAgfSkpXG4gICAgXSlcbiAgXSk7XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5pbXBvcnQgeyBjb250cm9scywgc3RhbmRpbmcgfSBmcm9tICcuL2FyZW5hJztcbmltcG9ydCB7IHRlYW1TdGFuZGluZyB9IGZyb20gJy4vYmF0dGxlJztcbmltcG9ydCBoZWFkZXIgZnJvbSAnLi9oZWFkZXInO1xuaW1wb3J0IHRvdXJUYWJsZSBmcm9tICcuL3RhYmxlJztcbmltcG9ydCBwbGF5ZXJJbmZvIGZyb20gJy4vcGxheWVySW5mbyc7XG5pbXBvcnQgdGVhbUluZm8gZnJvbSAnLi90ZWFtSW5mbyc7XG5pbXBvcnQgKiBhcyBwYWdpbmF0aW9uIGZyb20gJy4uL3BhZ2luYXRpb24nO1xuaW1wb3J0ICogYXMgdG91ciBmcm9tICcuLi90b3VybmFtZW50JztcbmltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IE1heWJlVk5vZGVzIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbmZ1bmN0aW9uIGpvaW5UaGVHYW1lKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyLCBnYW1lSWQ6IHN0cmluZykge1xuICByZXR1cm4gaCgnYS50b3VyX191ci1wbGF5aW5nLmJ1dHRvbi5pcy5pcy1hZnRlci5nbG93aW5nJywge1xuICAgIGF0dHJzOiB7IGhyZWY6ICcvJyArIGdhbWVJZCB9XG4gIH0sIFtcbiAgICBjdHJsLnRyYW5zKCd5b3VBcmVQbGF5aW5nJyksIGgoJ2JyJyksXG4gICAgY3RybC50cmFucygnam9pblRoZUdhbWUnKVxuICBdKTtcbn1cblxuZnVuY3Rpb24gbm90aWNlKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKTogVk5vZGUge1xuICByZXR1cm4gdG91ci53aWxsQmVQYWlyZWQoY3RybCkgPyBoKCdkaXYudG91cl9fbm90aWNlLmJhci1nbGlkZXInLFxuICAgIGN0cmwudHJhbnMoJ3N0YW5kQnlYJywgY3RybC5kYXRhLm1lLnVzZXJuYW1lKVxuICApIDogaCgnZGl2LnRvdXJfX25vdGljZS5jbG9zZWQnLCBjdHJsLnRyYW5zKCd0b3VybmFtZW50UGFpcmluZ3NBcmVOb3dDbG9zZWQnKSk7XG59XG5cbmV4cG9ydCBjb25zdCBuYW1lID0gJ3N0YXJ0ZWQnO1xuXG5leHBvcnQgZnVuY3Rpb24gbWFpbihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcik6IE1heWJlVk5vZGVzIHtcbiAgY29uc3QgZ2FtZUlkID0gY3RybC5teUdhbWVJZCgpLFxuICAgIHBhZyA9IHBhZ2luYXRpb24ucGxheWVycyhjdHJsKTtcbiAgcmV0dXJuIFtcbiAgICBoZWFkZXIoY3RybCksXG4gICAgZ2FtZUlkID8gam9pblRoZUdhbWUoY3RybCwgZ2FtZUlkKSA6ICh0b3VyLmlzSW4oY3RybCkgPyBub3RpY2UoY3RybCkgOiBudWxsKSxcbiAgICB0ZWFtU3RhbmRpbmcoY3RybCwgJ3N0YXJ0ZWQnKSxcbiAgICBjb250cm9scyhjdHJsLCBwYWcpLFxuICAgIHN0YW5kaW5nKGN0cmwsIHBhZywgJ3N0YXJ0ZWQnKSxcbiAgXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhYmxlKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gY3RybC5wbGF5ZXJJbmZvLmlkID8gcGxheWVySW5mbyhjdHJsKSA6XG4gICAgY3RybC50ZWFtSW5mby5yZXF1ZXN0ZWQgPyB0ZWFtSW5mbyhjdHJsKSA6IHRvdXJUYWJsZShjdHJsKTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnO1xuaW1wb3J0IHsgb3Bwb3NpdGUgfSBmcm9tICdjaGVzc2dyb3VuZC91dGlsJztcbmltcG9ydCB7IHBsYXllciBhcyByZW5kZXJQbGF5ZXIsIG1pbmlCb2FyZCwgYmluZCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBEdWVsLCBEdWVsUGxheWVyLCBEdWVsVGVhbXMsIFRlYW1CYXR0bGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IHRlYW1OYW1lIH0gZnJvbSAnLi9iYXR0bGUnO1xuaW1wb3J0IFRvdXJuYW1lbnRDb250cm9sbGVyIGZyb20gJy4uL2N0cmwnO1xuXG5mdW5jdGlvbiBmZWF0dXJlZFBsYXllcihwbGF5ZXIpIHtcbiAgcmV0dXJuIGgoJ2Rpdi50b3VyX19mZWF0dXJlZF9fcGxheWVyJywgW1xuICAgIGgoJ3N0cm9uZycsICcjJyArIHBsYXllci5yYW5rKSxcbiAgICByZW5kZXJQbGF5ZXIocGxheWVyLCB0cnVlLCB0cnVlLCBmYWxzZSksXG4gICAgcGxheWVyLmJlcnNlcmsgPyBoKCdpJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICdgJyxcbiAgICAgICAgdGl0bGU6ICdCZXJzZXJrJ1xuICAgICAgfVxuICAgIH0pIDogbnVsbFxuICBdKTtcbn1cblxuZnVuY3Rpb24gZmVhdHVyZWQoZik6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi50b3VyX19mZWF0dXJlZCcsIFtcbiAgICBmZWF0dXJlZFBsYXllcihmW29wcG9zaXRlKGYuY29sb3IpXSksXG4gICAgbWluaUJvYXJkKGYpLFxuICAgIGZlYXR1cmVkUGxheWVyKGZbZi5jb2xvcl0pXG4gIF0pO1xufVxuXG5mdW5jdGlvbiBkdWVsUGxheWVyTWV0YShwOiBEdWVsUGxheWVyKSB7XG4gIHJldHVybiBbXG4gICAgaCgnZW0ucmFuaycsICcjJyArIHAuayksXG4gICAgcC50ID8gaCgnZW0udGl0bGUnLCBwLnQpIDogbnVsbCxcbiAgICBoKCdlbS5yYXRpbmcnLCAnJyArIHAucilcbiAgXTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyRHVlbChiYXR0bGU/OiBUZWFtQmF0dGxlLCBkdWVsVGVhbXM/OiBEdWVsVGVhbXMpIHtcbiAgcmV0dXJuIChkOiBEdWVsKSA9PiBoKCdhLmdscHQnLCB7XG4gICAga2V5OiBkLmlkLFxuICAgIGF0dHJzOiB7IGhyZWY6ICcvJyArIGQuaWQgfVxuICB9LCBbXG4gICAgYmF0dGxlICYmIGR1ZWxUZWFtcyA/IGgoJ2xpbmUudCcsIFswLCAxXS5tYXAoaSA9PlxuICAgICAgdGVhbU5hbWUoYmF0dGxlLCBkdWVsVGVhbXNbZC5wW2ldLm4udG9Mb3dlckNhc2UoKV0pXG4gICAgKSkgOiB1bmRlZmluZWQsXG4gICAgaCgnbGluZS5hJywgW1xuICAgICAgaCgnc3Ryb25nJywgZC5wWzBdLm4pLFxuICAgICAgaCgnc3BhbicsIGR1ZWxQbGF5ZXJNZXRhKGQucFsxXSkucmV2ZXJzZSgpKVxuICAgIF0pLFxuICAgIGgoJ2xpbmUuYicsIFtcbiAgICAgIGgoJ3NwYW4nLCBkdWVsUGxheWVyTWV0YShkLnBbMF0pKSxcbiAgICAgIGgoJ3N0cm9uZycsIGQucFsxXS5uKVxuICAgIF0pXG4gIF0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlcik6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi50b3VyX190YWJsZScsIFtcbiAgICBjdHJsLmRhdGEuZmVhdHVyZWQgPyBmZWF0dXJlZChjdHJsLmRhdGEuZmVhdHVyZWQpIDogbnVsbCxcbiAgICBjdHJsLmRhdGEuZHVlbHMubGVuZ3RoID8gaCgnc2VjdGlvbi50b3VyX19kdWVscycsIHtcbiAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgXyA9PiAhY3RybC5kaXNhYmxlQ2xpY2tzKVxuICAgIH0sIFtcbiAgICAgIGgoJ2gyJywgJ1RvcCBnYW1lcycpXG4gICAgXS5jb25jYXQoY3RybC5kYXRhLmR1ZWxzLm1hcChyZW5kZXJEdWVsKGN0cmwuZGF0YS50ZWFtQmF0dGxlLCBjdHJsLmRhdGEuZHVlbFRlYW1zKSkpKSA6IG51bGxcbiAgXSk7XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSc7XG5cbmltcG9ydCBUb3VybmFtZW50Q29udHJvbGxlciBmcm9tICcuLi9jdHJsJztcbmltcG9ydCB7IGJpbmQsIG51bWJlclJvdywgc3Bpbm5lciwgZGF0YUljb24sIHBsYXllciBhcyByZW5kZXJQbGF5ZXIgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgdGVhbU5hbWUgfSBmcm9tICcuL2JhdHRsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBjb25zdCBiYXR0bGUgPSBjdHJsLmRhdGEudGVhbUJhdHRsZSxcbiAgICBkYXRhID0gY3RybC50ZWFtSW5mby5sb2FkZWQsXG4gICAgbm9hcmcgPSBjdHJsLnRyYW5zLm5vYXJnO1xuICBpZiAoIWJhdHRsZSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgdGVhbVRhZyA9IGN0cmwudGVhbUluZm8ucmVxdWVzdGVkID8gdGVhbU5hbWUoYmF0dGxlLCBjdHJsLnRlYW1JbmZvLnJlcXVlc3RlZCkgOiBudWxsO1xuICBjb25zdCB0YWcgPSAnZGl2LnRvdXJfX3RlYW0taW5mby50b3VyX19hY3Rvci1pbmZvJztcbiAgaWYgKCFkYXRhIHx8IGRhdGEuaWQgIT09IGN0cmwudGVhbUluZm8ucmVxdWVzdGVkKSByZXR1cm4gaCh0YWcsIFtcbiAgICBoKCdkaXYuc3RhdHMnLCBbXG4gICAgICBoKCdoMicsIFsgdGVhbVRhZyBdKSxcbiAgICAgIHNwaW5uZXIoKVxuICAgIF0pXG4gIF0pO1xuICBjb25zdCBuYkxlYWRlcnMgPSBjdHJsLmRhdGEudGVhbVN0YW5kaW5nPy5maW5kKHMgPT4gcy5pZCA9PSBkYXRhLmlkKT8ucGxheWVycy5sZW5ndGggfHwgMDtcblxuICBjb25zdCBzZXR1cCA9ICh2bm9kZTogVk5vZGUpID0+IHtcbiAgICB3aW5kb3cubGljaGVzcy5wb3dlcnRpcC5tYW51YWxVc2VySW4odm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgfVxuICByZXR1cm4gaCh0YWcsIHtcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQ6IHNldHVwLFxuICAgICAgcG9zdHBhdGNoKF8sIHZub2RlKSB7IHNldHVwKHZub2RlKSB9XG4gICAgfVxuICB9LCBbXG4gICAgaCgnYS5jbG9zZScsIHtcbiAgICAgIGF0dHJzOiBkYXRhSWNvbignTCcpLFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnNob3dUZWFtSW5mbyhkYXRhLmlkKSwgY3RybC5yZWRyYXcpXG4gICAgfSksXG4gICAgaCgnZGl2LnN0YXRzJywgW1xuICAgICAgaCgnaDInLCBbIHRlYW1UYWcgXSksXG4gICAgICBoKCd0YWJsZScsIFtcbiAgICAgICAgbnVtYmVyUm93KFwiUGxheWVyc1wiLCBkYXRhLm5iUGxheWVycyksXG4gICAgICAgIC4uLihkYXRhLnJhdGluZyA/IFtcbiAgICAgICAgICBudW1iZXJSb3cobm9hcmcoJ2F2ZXJhZ2VFbG8nKSwgZGF0YS5yYXRpbmcsICdyYXcnKSxcbiAgICAgICAgICAuLi4oZGF0YS5wZXJmID8gW1xuICAgICAgICAgICAgbnVtYmVyUm93KFwiQXZlcmFnZSBwZXJmb3JtYW5jZVwiLCBkYXRhLnBlcmYsICdyYXcnKSxcbiAgICAgICAgICAgIG51bWJlclJvdyhcIkF2ZXJhZ2Ugc2NvcmVcIiwgZGF0YS5zY29yZSwgJ3JhdycpXG4gICAgICAgICAgXSA6IFtdKVxuICAgICAgICBdIDogW10pLFxuICAgICAgICBoKCd0cicsIGgoJ3RoJywgaCgnYScsIHtcbiAgICAgICAgICBhdHRyczogeyBocmVmOiAnL3RlYW0vJyArIGRhdGEuaWQgfVxuICAgICAgICB9LCAnVGVhbSBwYWdlJykpKVxuICAgICAgXSlcbiAgICBdKSxcbiAgICBoKCdkaXYnLCBbXG4gICAgICBoKCd0YWJsZS5wbGF5ZXJzLnN1Ymxpc3QnLCB7XG4gICAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgY29uc3QgdXNlcm5hbWUgPSAoKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5wYXJlbnROb2RlIGFzIEhUTUxFbGVtZW50KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpO1xuICAgICAgICAgIGlmICh1c2VybmFtZSkgY3RybC5qdW1wVG9QYWdlT2YodXNlcm5hbWUpO1xuICAgICAgICB9KVxuICAgICAgfSwgZGF0YS50b3BQbGF5ZXJzLm1hcCgocCwgaSkgPT4gaCgndHInLCB7XG4gICAgICAgIGtleTogcC5uYW1lXG4gICAgICB9LCBbXG4gICAgICAgIGgoJ3RoJywgJycgKyAoaSArIDEpKSxcbiAgICAgICAgaCgndGQnLCByZW5kZXJQbGF5ZXIocCwgZmFsc2UsIHRydWUsIGZhbHNlLCBpIDwgbmJMZWFkZXJzKSksXG4gICAgICAgIGgoJ3RkLnRvdGFsJywgW1xuICAgICAgICAgIHAuZmlyZSAmJiAhY3RybC5kYXRhLmlzRmluaXNoZWQgP1xuICAgICAgICAgIGgoJ3N0cm9uZy5pcy1nb2xkJywgeyBhdHRyczogZGF0YUljb24oJ1EnKSB9LCAnJyArIHAuc2NvcmUpIDpcbiAgICAgICAgICBoKCdzdHJvbmcnLCAnJyArIHAuc2NvcmUpXG4gICAgICAgIF0pXG4gICAgICBdKSkpXG4gICAgXSlcbiAgXSk7XG59XG4iLCJpbXBvcnQgeyBBdHRycyB9IGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcydcbmltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IEhvb2tzIH0gZnJvbSAnc25hYmJkb20vaG9va3MnXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmQoZXZlbnROYW1lOiBzdHJpbmcsIGY6IChlOiBFdmVudCkgPT4gYW55LCByZWRyYXc/OiAoKSA9PiB2b2lkKTogSG9va3Mge1xuICByZXR1cm4gb25JbnNlcnQoZWwgPT5cbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZSA9PiB7XG4gICAgICBjb25zdCByZXMgPSBmKGUpO1xuICAgICAgaWYgKHJlZHJhdykgcmVkcmF3KCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvbkluc2VydChmOiAoZWxlbWVudDogSFRNTEVsZW1lbnQpID0+IHZvaWQpOiBIb29rcyB7XG4gIHJldHVybiB7XG4gICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICBmKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudClcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRhSWNvbihpY29uOiBzdHJpbmcpOiBBdHRycyB7XG4gIHJldHVybiB7XG4gICAgJ2RhdGEtaWNvbic6IGljb25cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbmlCb2FyZChnYW1lKSB7XG4gIHJldHVybiBoKCdhLm1pbmktYm9hcmQucGFyc2UtZmVuLmlzMmQubWluaS1ib2FyZC0nICsgZ2FtZS5pZCwge1xuICAgIGtleTogZ2FtZS5pZCxcbiAgICBhdHRyczoge1xuICAgICAgaHJlZjogJy8nICsgZ2FtZS5pZCArIChnYW1lLmNvbG9yID09PSAnd2hpdGUnID8gJycgOiAnL2JsYWNrJyksXG4gICAgICAnZGF0YS1jb2xvcic6IGdhbWUuY29sb3IsXG4gICAgICAnZGF0YS1mZW4nOiBnYW1lLmZlbixcbiAgICAgICdkYXRhLWxhc3Rtb3ZlJzogZ2FtZS5sYXN0TW92ZVxuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgIHdpbmRvdy5saWNoZXNzLnBhcnNlRmVuKCQodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KSk7XG4gICAgICB9XG4gICAgfVxuICB9LCBbXG4gICAgaCgnZGl2LmNnLXdyYXAnKVxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJhdGlvMnBlcmNlbnQocjogbnVtYmVyKSB7XG4gIHJldHVybiBNYXRoLnJvdW5kKDEwMCAqIHIpICsgJyUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheWVyTmFtZShwKSB7XG4gIHJldHVybiBwLnRpdGxlID8gW2goJ3NwYW4udGl0bGUnLCBwLnRpdGxlKSwgJyAnICsgcC5uYW1lXSA6IHAubmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXllcihwLCBhc0xpbms6IGJvb2xlYW4sIHdpdGhSYXRpbmc6IGJvb2xlYW4sIGRlZmVuZGVyOiBib29sZWFuID0gZmFsc2UsIGxlYWRlcjogYm9vbGVhbiA9IGZhbHNlKSB7XG5cbiAgY29uc3QgZnVsbE5hbWUgPSBwbGF5ZXJOYW1lKHApO1xuXG4gIHJldHVybiBoKCdhLnVscHQudXNlci1saW5rJyArIChmdWxsTmFtZS5sZW5ndGggPiAxNSA/ICcubG9uZycgOiAnJyksIHtcbiAgICBhdHRyczogYXNMaW5rID8geyBocmVmOiAnL0AvJyArIHAubmFtZSB9IDogeyAnZGF0YS1ocmVmJzogJy9ALycgKyBwLm5hbWUgfSxcbiAgICBob29rOiB7XG4gICAgICBkZXN0cm95OiB2bm9kZSA9PiAkLnBvd2VyVGlwLmRlc3Ryb3kodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KVxuICAgIH1cbiAgfSwgW1xuICAgIGgoXG4gICAgICAnc3Bhbi5uYW1lJyArIChkZWZlbmRlciA/ICcuZGVmZW5kZXInIDogKGxlYWRlciA/ICcubGVhZGVyJyA6ICcnKSksXG4gICAgICBkZWZlbmRlciA/IHsgYXR0cnM6IGRhdGFJY29uKCc1JykgfSA6IChcbiAgICAgICAgbGVhZGVyID8geyBhdHRyczogZGF0YUljb24oJzgnKSB9IDoge31cbiAgICAgICksIGZ1bGxOYW1lKSxcbiAgICB3aXRoUmF0aW5nID8gaCgnc3Bhbi5yYXRpbmcnLCAnICcgKyBwLnJhdGluZyArIChwLnByb3Zpc2lvbmFsID8gJz8nIDogJycpKSA6IG51bGxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJSb3cobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55LCB0eXA/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGgoJ3RyJywgW2goJ3RoJywgbmFtZSksIGgoJ3RkJyxcbiAgICB0eXAgPT09ICdyYXcnID8gdmFsdWUgOiAodHlwID09PSAncGVyY2VudCcgPyAoXG4gICAgICB2YWx1ZVsxXSA+IDAgPyByYXRpbzJwZXJjZW50KHZhbHVlWzBdIC8gdmFsdWVbMV0pIDogMFxuICAgICkgOiB3aW5kb3cubGljaGVzcy5udW1iZXJGb3JtYXQodmFsdWUpKVxuICApXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGlubmVyKCk6IFZOb2RlIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zcGlubmVyJywgW1xuICAgIGgoJ3N2ZycsIHsgYXR0cnM6IHsgdmlld0JveDogJzAgMCA0MCA0MCcgfSB9LCBbXG4gICAgICBoKCdjaXJjbGUnLCB7XG4gICAgICAgIGF0dHJzOiB7IGN4OiAyMCwgY3k6IDIwLCByOiAxOCwgZmlsbDogJ25vbmUnIH1cbiAgICAgIH0pXSldKTtcbn1cbiIsImltcG9ydCB0aHJvdHRsZSBmcm9tICdjb21tb24vdGhyb3R0bGUnO1xuaW1wb3J0IFRvdXJuYW1lbnRDb250cm9sbGVyIGZyb20gJy4vY3RybCc7XG5cbmNvbnN0IGhlYWRlcnMgPSB7XG4gICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmxpY2hlc3MudjMranNvbidcbn07XG5cbi8vIHdoZW4gdGhlIHRvdXJuYW1lbnQgbm8gbG9uZ2VyIGV4aXN0c1xuZnVuY3Rpb24gb25GYWlsKF8xLCBfMiwgZXJyb3JNZXNzYWdlKSB7XG4gIGlmIChlcnJvck1lc3NhZ2UgPT09ICdGb3JiaWRkZW4nKSBsb2NhdGlvbi5ocmVmID0gJy8nO1xuICBlbHNlIHdpbmRvdy5saWNoZXNzLnJlbG9hZCgpO1xufVxuXG5mdW5jdGlvbiBqb2luKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyLCBwYXNzd29yZD86IHN0cmluZywgdGVhbT86IHN0cmluZykge1xuICByZXR1cm4gJC5hamF4KHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6ICcvdG91cm5hbWVudC8nICsgY3RybC5kYXRhLmlkICsgJy9qb2luJyxcbiAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBwOiBwYXNzd29yZCB8fCBudWxsLFxuICAgICAgdGVhbTogdGVhbSB8fCBudWxsXG4gICAgfSksXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgICBoZWFkZXJzXG4gIH0pLmZhaWwob25GYWlsKTtcbn1cblxuZnVuY3Rpb24gd2l0aGRyYXcoY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIpIHtcbiAgcmV0dXJuICQuYWpheCh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiAnL3RvdXJuYW1lbnQvJyArIGN0cmwuZGF0YS5pZCArICcvd2l0aGRyYXcnLFxuICAgIGhlYWRlcnNcbiAgfSkuZmFpbChvbkZhaWwpO1xufVxuXG5mdW5jdGlvbiBsb2FkUGFnZShjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlciwgcDogbnVtYmVyKSB7XG4gICQuYWpheCh7XG4gICAgdXJsOiAnL3RvdXJuYW1lbnQvJyArIGN0cmwuZGF0YS5pZCArICcvc3RhbmRpbmcvJyArIHAsXG4gICAgaGVhZGVyc1xuICB9KS50aGVuKGRhdGEgPT4ge1xuICAgIGN0cmwubG9hZFBhZ2UoZGF0YSk7XG4gICAgY3RybC5yZWRyYXcoKTtcbiAgfSwgb25GYWlsKTtcbn1cblxuZnVuY3Rpb24gbG9hZFBhZ2VPZihjdHJsOiBUb3VybmFtZW50Q29udHJvbGxlciwgdXNlcklkOiBzdHJpbmcpOiBKUXVlcnlYSFIge1xuICByZXR1cm4gJC5hamF4KHtcbiAgICB1cmw6ICcvdG91cm5hbWVudC8nICsgY3RybC5kYXRhLmlkICsgJy9wYWdlLW9mLycgKyB1c2VySWQsXG4gICAgaGVhZGVyc1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVsb2FkKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyKSB7XG4gIHJldHVybiAkLmFqYXgoe1xuICAgIHVybDogJy90b3VybmFtZW50LycgKyBjdHJsLmRhdGEuaWQsXG4gICAgZGF0YToge1xuICAgICAgcGFnZTogY3RybC5mb2N1c09uTWUgPyBudWxsIDogY3RybC5wYWdlLFxuICAgICAgcGxheWVySW5mbzogY3RybC5wbGF5ZXJJbmZvLmlkLFxuICAgICAgcGFydGlhbDogdHJ1ZVxuICAgIH0sXG4gICAgaGVhZGVyc1xuICB9KS50aGVuKGRhdGEgPT4ge1xuICAgIGN0cmwucmVsb2FkKGRhdGEpO1xuICAgIGN0cmwucmVkcmF3KCk7XG4gIH0sIG9uRmFpbCk7XG59XG5cbmZ1bmN0aW9uIHBsYXllckluZm8oY3RybDogVG91cm5hbWVudENvbnRyb2xsZXIsIHVzZXJJZDogc3RyaW5nKSB7XG4gIHJldHVybiAkLmFqYXgoe1xuICAgIHVybDogWycvdG91cm5hbWVudCcsIGN0cmwuZGF0YS5pZCwgJ3BsYXllcicsIHVzZXJJZF0uam9pbignLycpLFxuICAgIGhlYWRlcnNcbiAgfSkudGhlbihkYXRhID0+IHtcbiAgICBjdHJsLnNldFBsYXllckluZm9EYXRhKGRhdGEpO1xuICAgIGN0cmwucmVkcmF3KCk7XG4gIH0sIG9uRmFpbCk7XG59XG5cbmZ1bmN0aW9uIHRlYW1JbmZvKGN0cmw6IFRvdXJuYW1lbnRDb250cm9sbGVyLCB0ZWFtSWQ6IHN0cmluZykge1xuICByZXR1cm4gJC5hamF4KHtcbiAgICB1cmw6IFsnL3RvdXJuYW1lbnQnLCBjdHJsLmRhdGEuaWQsICd0ZWFtJywgdGVhbUlkXS5qb2luKCcvJyksXG4gICAgaGVhZGVyc1xuICB9KS50aGVuKGRhdGEgPT4ge1xuICAgIGN0cmwuc2V0VGVhbUluZm8oZGF0YSk7XG4gICAgY3RybC5yZWRyYXcoKTtcbiAgfSwgb25GYWlsKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBqb2luOiB0aHJvdHRsZSgxMDAwLCBqb2luKSxcbiAgd2l0aGRyYXc6IHRocm90dGxlKDEwMDAsIHdpdGhkcmF3KSxcbiAgbG9hZFBhZ2U6IHRocm90dGxlKDEwMDAsIGxvYWRQYWdlKSxcbiAgbG9hZFBhZ2VPZixcbiAgcmVsb2FkU29vbjogdGhyb3R0bGUoNDAwMCwgcmVsb2FkKSxcbiAgcmVsb2FkTm93OiByZWxvYWQsXG4gIHBsYXllckluZm8sXG4gIHRlYW1JbmZvXG59O1xuIl19
