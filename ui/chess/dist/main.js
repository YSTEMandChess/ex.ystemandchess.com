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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQTRCO0FBcURuQixnQkFyREYsZUFBSyxDQXFERTtBQW5ERCxRQUFBLFVBQVUsR0FBUSwwREFBMEQsQ0FBQztBQUUxRixTQUFnQixXQUFXLENBQUMsR0FBUTtJQUNsQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUM3QyxDQUFDO0FBRkQsa0NBRUM7QUFFRCxTQUFnQixZQUFZLENBQUMsR0FBUTtJQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFRLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFRLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRkQsb0NBRUM7QUFFRCxTQUFnQixVQUFVLENBQUMsQ0FBUztJQUNsQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBSEQsZ0NBR0M7QUFNRCxTQUFnQixTQUFTLENBQUMsS0FBYztJQUN0QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7UUFBRSxPQUFPLElBQUksQ0FBQztJQUM5QyxNQUFNLEtBQUssR0FBVSxFQUFFLENBQUM7SUFDeEIsSUFBSSxLQUFLO1FBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekMsS0FBSyxDQUFDLGVBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQUssQ0FBQyxDQUFDLENBQVEsQ0FBQyxDQUFBO1FBQzNFLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBUEQsOEJBT0M7QUFFRCxTQUFnQixTQUFTLENBQUMsSUFBb0I7SUFDNUMsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxLQUFLLElBQUk7UUFBRSxPQUFPLElBQUksQ0FBQztJQUM5RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25DLENBQUM7QUFIRCw4QkFHQztBQUVZLFFBQUEsU0FBUyxHQUFHO0lBQ3ZCLElBQUksRUFBRSxHQUFHO0lBQ1QsTUFBTSxFQUFFLEdBQUc7SUFDWCxNQUFNLEVBQUUsR0FBRztJQUNYLElBQUksRUFBRSxHQUFHO0lBQ1QsS0FBSyxFQUFFLEdBQUc7SUFDVixJQUFJLEVBQUUsR0FBRztDQUNWLENBQUM7QUFFVyxRQUFBLFNBQVMsR0FBRztJQUN2QixDQUFDLEVBQUUsTUFBTTtJQUNULENBQUMsRUFBRSxRQUFRO0lBQ1gsQ0FBQyxFQUFFLFFBQVE7SUFDWCxDQUFDLEVBQUUsTUFBTTtJQUNULENBQUMsRUFBRSxPQUFPO0lBQ1YsQ0FBQyxFQUFFLE1BQU07Q0FDVixDQUFDO0FBSUYsU0FBZ0IsY0FBYyxDQUFDLE9BQW1CO0lBQ2hELFFBQVEsT0FBTyxFQUFFO1FBQ2YsS0FBSyxVQUFVLENBQUM7UUFDaEIsS0FBSyxVQUFVLENBQUM7UUFDaEIsS0FBSyxjQUFjO1lBQ2pCLE9BQU8sT0FBTyxDQUFDO1FBQ2pCLEtBQUssWUFBWTtZQUNmLE9BQU8sUUFBUSxDQUFDO1FBQ2xCLEtBQUssZUFBZTtZQUNsQixPQUFPLGVBQWUsQ0FBQztRQUN6QixLQUFLLGFBQWE7WUFDaEIsT0FBTyxhQUFhLENBQUM7UUFDdkI7WUFDRSxPQUFPLE9BQU8sQ0FBQztLQUNsQjtBQUNILENBQUM7QUFmRCx3Q0FlQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwaW90ciBmcm9tICcuL3Bpb3RyJztcblxuZXhwb3J0IGNvbnN0IGluaXRpYWxGZW46IEZlbiA9ICdybmJxa2Juci9wcHBwcHBwcC84LzgvOC84L1BQUFBQUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgMSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXhDcmF6eVNhbihzYW46IFNhbik6IFNhbiB7XG4gIHJldHVybiBzYW5bMF0gPT09ICdQJyA/IHNhbi5zbGljZSgxKSA6IHNhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29tcG9zZVVjaSh1Y2k6IFVjaSk6IFtLZXksIEtleSwgc3RyaW5nXSB7XG4gIHJldHVybiBbdWNpLnNsaWNlKDAsIDIpIGFzIEtleSwgdWNpLnNsaWNlKDIsIDQpIGFzIEtleSwgdWNpLnNsaWNlKDQsIDUpXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckV2YWwoZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgZSA9IE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQoZSAvIDEwKSAvIDEwLCA5OSksIC05OSk7XG4gIHJldHVybiAoZSA+IDAgPyAnKycgOiAnJykgKyBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlc3RzIHtcbiAgW3NxdWFyZTogc3RyaW5nXTogS2V5W107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkRGVzdHMobGluZXM/OiBzdHJpbmcpOiBEZXN0cyB8IG51bGwge1xuICBpZiAodHlwZW9mIGxpbmVzID09PSAndW5kZWZpbmVkJykgcmV0dXJuIG51bGw7XG4gIGNvbnN0IGRlc3RzOiBEZXN0cyA9IHt9O1xuICBpZiAobGluZXMpIGxpbmVzLnNwbGl0KCcgJykuZm9yRWFjaChsaW5lID0+IHtcbiAgICBkZXN0c1twaW90cltsaW5lWzBdXV0gPSBsaW5lLnNsaWNlKDEpLnNwbGl0KCcnKS5tYXAoYyA9PiBwaW90cltjXSBhcyBLZXkpXG4gIH0pO1xuICByZXR1cm4gZGVzdHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkRHJvcHMobGluZT86IHN0cmluZyB8IG51bGwpOiBzdHJpbmdbXSB8IG51bGwge1xuICBpZiAodHlwZW9mIGxpbmUgPT09ICd1bmRlZmluZWQnIHx8IGxpbmUgPT09IG51bGwpIHJldHVybiBudWxsO1xuICByZXR1cm4gbGluZS5tYXRjaCgvLnsyfS9nKSB8fCBbXTtcbn1cblxuZXhwb3J0IGNvbnN0IHJvbGVUb1NhbiA9IHtcbiAgcGF3bjogJ1AnLFxuICBrbmlnaHQ6ICdOJyxcbiAgYmlzaG9wOiAnQicsXG4gIHJvb2s6ICdSJyxcbiAgcXVlZW46ICdRJyxcbiAga2luZzogJ0snXG59O1xuXG5leHBvcnQgY29uc3Qgc2FuVG9Sb2xlID0ge1xuICBQOiAncGF3bicsXG4gIE46ICdrbmlnaHQnLFxuICBCOiAnYmlzaG9wJyxcbiAgUjogJ3Jvb2snLFxuICBROiAncXVlZW4nLFxuICBLOiAna2luZydcbn07XG5cbmV4cG9ydCB7IHBpb3RyIH07XG5cbmV4cG9ydCBmdW5jdGlvbiB2YXJpYW50VG9SdWxlcyh2YXJpYW50OiBWYXJpYW50S2V5KTogJ2NoZXNzJyB8ICdhbnRpY2hlc3MnIHwgJ2tpbmdvZnRoZWhpbGwnIHwgJzNjaGVjaycgfCAnYXRvbWljJyB8ICdob3JkZScgfCAncmFjaW5na2luZ3MnIHwgJ2NyYXp5aG91c2UnIHtcbiAgc3dpdGNoICh2YXJpYW50KSB7XG4gICAgY2FzZSAnc3RhbmRhcmQnOlxuICAgIGNhc2UgJ2NoZXNzOTYwJzpcbiAgICBjYXNlICdmcm9tUG9zaXRpb24nOlxuICAgICAgcmV0dXJuICdjaGVzcyc7XG4gICAgY2FzZSAndGhyZWVDaGVjayc6XG4gICAgICByZXR1cm4gJzNjaGVjayc7XG4gICAgY2FzZSAna2luZ09mVGhlSGlsbCc6XG4gICAgICByZXR1cm4gJ2tpbmdvZnRoZWhpbGwnO1xuICAgIGNhc2UgJ3JhY2luZ0tpbmdzJzpcbiAgICAgIHJldHVybiAncmFjaW5na2luZ3MnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdmFyaWFudDtcbiAgfVxufVxuIl19