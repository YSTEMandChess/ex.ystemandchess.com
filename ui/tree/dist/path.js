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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQWEsUUFBQSxJQUFJLEdBQWMsRUFBRSxDQUFDO0FBRWxDLFNBQWdCLElBQUksQ0FBQyxJQUFlO0lBQ2xDLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUZELG9CQUVDO0FBRUQsU0FBZ0IsSUFBSSxDQUFDLElBQWU7SUFDbEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRkQsb0JBRUM7QUFFRCxTQUFnQixJQUFJLENBQUMsSUFBZTtJQUNsQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUZELG9CQUVDO0FBRUQsU0FBZ0IsSUFBSSxDQUFDLElBQWU7SUFDbEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFGRCxvQkFFQztBQUVELFNBQWdCLElBQUksQ0FBQyxJQUFlO0lBQ2xDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLENBQUM7QUFGRCxvQkFFQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxFQUFhLEVBQUUsRUFBYTtJQUNuRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEtBQWtCO0lBQzdDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSztRQUFFLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3pDLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUpELG9DQUlDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEtBQWdCLEVBQUUsTUFBaUI7SUFDM0QsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDO0FBQ2xELENBQUM7QUFGRCw4QkFFQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCByb290OiBUcmVlLlBhdGggPSAnJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNpemUocGF0aDogVHJlZS5QYXRoKTogbnVtYmVyIHtcbiAgcmV0dXJuIHBhdGgubGVuZ3RoIC8gMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhlYWQocGF0aDogVHJlZS5QYXRoKTogVHJlZS5QYXRoIHtcbiAgcmV0dXJuIHBhdGguc2xpY2UoMCwgMik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0YWlsKHBhdGg6IFRyZWUuUGF0aCk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnNsaWNlKDIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChwYXRoOiBUcmVlLlBhdGgpOiBUcmVlLlBhdGgge1xuICByZXR1cm4gcGF0aC5zbGljZSgwLCAtMik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXN0KHBhdGg6IFRyZWUuUGF0aCk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnNsaWNlKC0yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zKHAxOiBUcmVlLlBhdGgsIHAyOiBUcmVlLlBhdGgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHAxLnN0YXJ0c1dpdGgocDIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZnJvbU5vZGVMaXN0KG5vZGVzOiBUcmVlLk5vZGVbXSk6IFRyZWUuUGF0aCB7XG4gIHZhciBwYXRoID0gJyc7XG4gIGZvciAodmFyIGkgaW4gbm9kZXMpIHBhdGggKz0gbm9kZXNbaV0uaWQ7XG4gIHJldHVybiBwYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDaGlsZE9mKGNoaWxkOiBUcmVlLlBhdGgsIHBhcmVudDogVHJlZS5QYXRoKTogYm9vbGVhbiB7XG4gIHJldHVybiAhIWNoaWxkICYmIGNoaWxkLnNsaWNlKDAsIC0yKSA9PT0gcGFyZW50O1xufVxuIl19