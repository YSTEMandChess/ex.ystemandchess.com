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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29wcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFNBQWdCLGlCQUFpQixDQUFJLElBQWUsRUFBRSxDQUF5QjtJQUM3RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNwQyxDQUFDO0FBSEQsOENBR0M7QUFFRCxTQUFnQixjQUFjLENBQUMsUUFBbUIsRUFBRSxTQUF1QztJQUN6RixNQUFNLFFBQVEsR0FBRyxVQUFTLElBQWU7UUFDdkMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDakMsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQU5ELHdDQU1DO0FBRUQsMERBQTBEO0FBQzFELFNBQWdCLE9BQU8sQ0FBQyxJQUFlLEVBQUUsU0FBcUQ7SUFDNUYsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNoQyxPQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDUDtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQVBELDBCQU9DO0FBRUQsU0FBUyxjQUFjLENBQUMsSUFBZTtJQUNyQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELFNB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LENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQ2pFLENBQUM7QUFDSixDQUFDO0FBSkQsb0NBSUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFlO0lBQzlDLE9BQU8sT0FBTyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRkQsNENBRUM7QUFFRCxTQUFnQixTQUFTLENBQUMsSUFBZSxFQUFFLENBQTRCO0lBQ3JFLHFDQUFxQztJQUNyQyxTQUFTLE1BQU0sQ0FBQyxJQUFlO1FBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFBQSxDQUFDO0lBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2YsQ0FBQztBQVBELDhCQU9DIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHdpdGhNYWlubGluZUNoaWxkPFQ+KG5vZGU6IFRyZWUuTm9kZSwgZjogKG5vZGU6IFRyZWUuTm9kZSkgPT4gVCk6IFQgfCB1bmRlZmluZWQge1xuICBjb25zdCBuZXh0ID0gbm9kZS5jaGlsZHJlblswXTtcbiAgcmV0dXJuIG5leHQgPyBmKG5leHQpIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEluTWFpbmxpbmUoZnJvbU5vZGU6IFRyZWUuTm9kZSwgcHJlZGljYXRlOiAobm9kZTogVHJlZS5Ob2RlKSA9PiBib29sZWFuKTogVHJlZS5Ob2RlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZmluZEZyb20gPSBmdW5jdGlvbihub2RlOiBUcmVlLk5vZGUpOiBUcmVlLk5vZGUgfCB1bmRlZmluZWQge1xuICAgIGlmIChwcmVkaWNhdGUobm9kZSkpIHJldHVybiBub2RlO1xuICAgIHJldHVybiB3aXRoTWFpbmxpbmVDaGlsZChub2RlLCBmaW5kRnJvbSk7XG4gIH07XG4gIHJldHVybiBmaW5kRnJvbShmcm9tTm9kZSk7XG59XG5cbi8vIHJldHVybnMgYSBsaXN0IG9mIG5vZGVzIGNvbGxlY3RlZCBmcm9tIHRoZSBvcmlnaW5hbCBvbmVcbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0KGZyb206IFRyZWUuTm9kZSwgcGlja0NoaWxkOiAobm9kZTogVHJlZS5Ob2RlKSA9PiBUcmVlLk5vZGUgfCB1bmRlZmluZWQpOiBUcmVlLk5vZGVbXSB7XG4gIGxldCBub2RlcyA9IFtmcm9tXSwgbiA9IGZyb20sIGM7XG4gIHdoaWxlKGMgPSBwaWNrQ2hpbGQobikpIHtcbiAgICBub2Rlcy5wdXNoKGMpO1xuICAgIG4gPSBjO1xuICB9XG4gIHJldHVybiBub2Rlcztcbn1cblxuZnVuY3Rpb24gcGlja0ZpcnN0Q2hpbGQobm9kZTogVHJlZS5Ob2RlKTogVHJlZS5Ob2RlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG5vZGUuY2hpbGRyZW5bMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGlsZEJ5SWQobm9kZTogVHJlZS5Ob2RlLCBpZDogc3RyaW5nKTogVHJlZS5Ob2RlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG5vZGUuY2hpbGRyZW4uZmluZChjaGlsZCA9PiBjaGlsZC5pZCA9PT0gaWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFzdChub2RlTGlzdDogVHJlZS5Ob2RlW10pOiBUcmVlLk5vZGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gbm9kZUxpc3Rbbm9kZUxpc3QubGVuZ3RoIC0gMV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub2RlQXRQbHkobm9kZUxpc3Q6IFRyZWUuTm9kZVtdLCBwbHk6IG51bWJlcik6IFRyZWUuTm9kZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBub2RlTGlzdC5maW5kKG5vZGUgPT4gbm9kZS5wbHkgPT09IHBseSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWtlUGF0aFdoaWxlKG5vZGVMaXN0OiBUcmVlLk5vZGVbXSwgcHJlZGljYXRlOiAobm9kZTogVHJlZS5Ob2RlKSA9PiBib29sZWFuKTogVHJlZS5QYXRoIHtcbiAgbGV0IHBhdGggPSAnJztcbiAgZm9yIChsZXQgaSBpbiBub2RlTGlzdCkge1xuICAgIGlmIChwcmVkaWNhdGUobm9kZUxpc3RbaV0pKSBwYXRoICs9IG5vZGVMaXN0W2ldLmlkO1xuICAgIGVsc2UgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVDaGlsZChwYXJlbnQ6IFRyZWUuTm9kZSwgaWQ6IHN0cmluZyk6IHZvaWQge1xuICBwYXJlbnQuY2hpbGRyZW4gPSBwYXJlbnQuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uKG4pIHtcbiAgICByZXR1cm4gbi5pZCAhPT0gaWQ7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY291bnRDaGlsZHJlbkFuZENvbW1lbnRzKG5vZGU6IFRyZWUuTm9kZSkge1xuICBjb25zdCBjb3VudCA9IHtcbiAgICBub2RlczogMSxcbiAgICBjb21tZW50czogKG5vZGUuY29tbWVudHMgfHwgW10pLmxlbmd0aFxuICB9O1xuICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQpIHtcbiAgICBjb25zdCBjID0gY291bnRDaGlsZHJlbkFuZENvbW1lbnRzKGNoaWxkKTtcbiAgICBjb3VudC5ub2RlcyArPSBjLm5vZGVzO1xuICAgIGNvdW50LmNvbW1lbnRzICs9IGMuY29tbWVudHM7XG4gIH0pO1xuICByZXR1cm4gY291bnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNvbnN0cnVjdChwYXJ0czogYW55KTogVHJlZS5Ob2RlIHtcbiAgY29uc3Qgcm9vdCA9IHBhcnRzWzBdLCBuYiA9IHBhcnRzLmxlbmd0aDtcbiAgbGV0IG5vZGUgPSByb290LCBpOiBudW1iZXI7XG4gIHJvb3QuaWQgPSAnJztcbiAgZm9yIChpID0gMTsgaSA8IG5iOyBpKyspIHtcbiAgICBjb25zdCBuID0gcGFydHNbaV07XG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIG5vZGUuY2hpbGRyZW4udW5zaGlmdChuKTtcbiAgICBlbHNlIG5vZGUuY2hpbGRyZW4gPSBbbl07XG4gICAgbm9kZSA9IG47XG4gIH1cbiAgbm9kZS5jaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4gfHwgW107XG4gIHJldHVybiByb290O1xufVxuXG4vLyBhZGRzIG4yIGludG8gbjFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZShuMTogVHJlZS5Ob2RlLCBuMjogVHJlZS5Ob2RlKTogdm9pZCB7XG4gIG4xLmV2YWwgPSBuMi5ldmFsO1xuICBpZiAobjIuZ2x5cGhzKSBuMS5nbHlwaHMgPSBuMi5nbHlwaHM7XG4gIG4yLmNvbW1lbnRzICYmIG4yLmNvbW1lbnRzLmZvckVhY2goZnVuY3Rpb24oYykge1xuICAgIGlmICghbjEuY29tbWVudHMpIG4xLmNvbW1lbnRzID0gW2NdO1xuICAgIGVsc2UgaWYgKCFuMS5jb21tZW50cy5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQudGV4dCA9PT0gYy50ZXh0O1xuICAgIH0pLmxlbmd0aCkgbjEuY29tbWVudHMucHVzaChjKTtcbiAgfSk7XG4gIG4yLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYykge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gY2hpbGRCeUlkKG4xLCBjLmlkKTtcbiAgICBpZiAoZXhpc3RpbmcpIG1lcmdlKGV4aXN0aW5nLCBjKTtcbiAgICBlbHNlIG4xLmNoaWxkcmVuLnB1c2goYyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQnJhbmNoaW5nKG5vZGU6IFRyZWUuTm9kZSwgbWF4RGVwdGg6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gbWF4RGVwdGggPD0gMCB8fCAhIW5vZGUuY2hpbGRyZW5bMV0gfHwgKFxuICAgIG5vZGUuY2hpbGRyZW5bMF0gJiYgaGFzQnJhbmNoaW5nKG5vZGUuY2hpbGRyZW5bMF0sIG1heERlcHRoIC0gMSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW5saW5lTm9kZUxpc3QoZnJvbTogVHJlZS5Ob2RlKTogVHJlZS5Ob2RlW10ge1xuICByZXR1cm4gY29sbGVjdChmcm9tLCBwaWNrRmlyc3RDaGlsZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVBbGwocm9vdDogVHJlZS5Ob2RlLCBmOiAobm9kZTogVHJlZS5Ob2RlKSA9PiB2b2lkKTogdm9pZCB7XG4gIC8vIGFwcGxpZXMgZiByZWN1cnNpdmVseSB0byBhbGwgbm9kZXNcbiAgZnVuY3Rpb24gdXBkYXRlKG5vZGU6IFRyZWUuTm9kZSkge1xuICAgIGYobm9kZSk7XG4gICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKHVwZGF0ZSk7XG4gIH07XG4gIHVwZGF0ZShyb290KTtcbn1cbiJdfQ==