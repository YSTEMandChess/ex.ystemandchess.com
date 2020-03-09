(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessSimul = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var m = (function app(window, undefined) {
	"use strict";
  	var VERSION = "v0.2.1-lila";
	function isFunction(object) {
		return typeof object === "function";
	}
	function isObject(object) {
		return type.call(object) === "[object Object]";
	}
	function isString(object) {
		return type.call(object) === "[object String]";
	}
	var isArray = Array.isArray || function (object) {
		return type.call(object) === "[object Array]";
	};
	var type = {}.toString;
	var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;
	var voidElements = /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/;
	var noop = function () {};

	// caching commonly used variables
	var $document, $location, $requestAnimationFrame, $cancelAnimationFrame;

	// self invoking function needed because of the way mocks work
	function initialize(window) {
		$document = window.document;
		$location = window.location;
		$cancelAnimationFrame = window.cancelAnimationFrame || window.clearTimeout;
		$requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;
	}

	initialize(window);

	m.version = function() {
		return VERSION;
	};

	/**
	 * @typedef {String} Tag
	 * A string that looks like -> div.classname#id[param=one][param2=two]
	 * Which describes a DOM node
	 */

	/**
	 *
	 * @param {Tag} The DOM node tag
	 * @param {Object=[]} optional key-value pairs to be mapped to DOM attrs
	 * @param {...mNode=[]} Zero or more Mithril child nodes. Can be an array, or splat (optional)
	 *
	 */
	function m(tag, pairs) {
		for (var args = [], i = 1; i < arguments.length; i++) {
			args[i - 1] = arguments[i];
		}
		if (isObject(tag)) return parameterize(tag, args);
		var hasAttrs = pairs != null && isObject(pairs) && !("tag" in pairs || "view" in pairs || "subtree" in pairs);
		var attrs = hasAttrs ? pairs : {};
		var classAttrName = "class" in attrs ? "class" : "className";
		var cell = {tag: "div", attrs: {}};
		var match, classes = [];
		if (!isString(tag)) throw new Error("selector in m(selector, attrs, children) should be a string");
		while ((match = parser.exec(tag)) != null) {
			if (match[1] === "" && match[2]) cell.tag = match[2];
			else if (match[1] === "#") cell.attrs.id = match[2];
			else if (match[1] === ".") classes.push(match[2]);
			else if (match[3][0] === "[") {
				var pair = attrParser.exec(match[3]);
				cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true);
			}
		}

		var children = hasAttrs ? args.slice(1) : args;
		if (children.length === 1 && isArray(children[0])) {
			cell.children = children[0];
		}
		else {
			cell.children = children;
		}

		for (var attrName in attrs) {
			if (attrs.hasOwnProperty(attrName)) {
				if (attrName === classAttrName && attrs[attrName] != null && attrs[attrName] !== "") {
					classes.push(attrs[attrName]);
					cell.attrs[attrName] = ""; //create key in correct iteration order
				}
				else cell.attrs[attrName] = attrs[attrName];
			}
		}
		if (classes.length) cell.attrs[classAttrName] = classes.join(" ");

		return cell;
	}
	function forEach(list, f) {
		for (var i = 0; i < list.length && !f(list[i], i++);) {}
	}
	function forKeys(list, f) {
		forEach(list, function (attrs, i) {
			return (attrs = attrs && attrs.attrs) && attrs.key != null && f(attrs, i);
		});
	}
	// This function was causing deopts in Chrome.
	// Well no longer
	function dataToString(data) {
    if (data == null) return '';
    if (typeof data === 'object') return data;
    if (data.toString() == null) return ""; // prevent recursion error on FF
    return data;
	}
	// This function was causing deopts in Chrome.
	function injectTextNode(parentElement, first, index, data) {
		try {
			insertNode(parentElement, first, index);
			first.nodeValue = data;
		} catch (e) {} //IE erroneously throws error when appending an empty text node after a null
	}

	function flatten(list) {
		//recursively flatten array
		for (var i = 0; i < list.length; i++) {
			if (isArray(list[i])) {
				list = list.concat.apply([], list);
				//check current index again and flatten until there are no more nested arrays at that index
				i--;
			}
		}
		return list;
	}

	function insertNode(parentElement, node, index) {
		parentElement.insertBefore(node, parentElement.childNodes[index] || null);
	}

	var DELETION = 1, INSERTION = 2, MOVE = 3;

	function handleKeysDiffer(data, existing, cached, parentElement) {
		forKeys(data, function (key, i) {
			existing[key = key.key] = existing[key] ? {
				action: MOVE,
				index: i,
				from: existing[key].index,
				element: cached.nodes[existing[key].index] || $document.createElement("div")
			} : {action: INSERTION, index: i};
		});
		var actions = [];
		for (var prop in existing) actions.push(existing[prop]);
		var changes = actions.sort(sortChanges), newCached = new Array(cached.length);
		newCached.nodes = cached.nodes.slice();

		forEach(changes, function (change) {
			var index = change.index;
			if (change.action === DELETION) {
				clear(cached[index].nodes, cached[index]);
				newCached.splice(index, 1);
			}
			if (change.action === INSERTION) {
				var dummy = $document.createElement("div");
				dummy.key = data[index].attrs.key;
				insertNode(parentElement, dummy, index);
				newCached.splice(index, 0, {
					attrs: {key: data[index].attrs.key},
					nodes: [dummy]
				});
				newCached.nodes[index] = dummy;
			}

			if (change.action === MOVE) {
				var changeElement = change.element;
				var maybeChanged = parentElement.childNodes[index];
				if (maybeChanged !== changeElement && changeElement !== null) {
					parentElement.insertBefore(changeElement, maybeChanged || null);
				}
				newCached[index] = cached[change.from];
				newCached.nodes[index] = changeElement;
			}
		});

		return newCached;
	}

	function diffKeys(data, cached, existing, parentElement) {
		var keysDiffer = data.length !== cached.length;
		if (!keysDiffer) {
			forKeys(data, function (attrs, i) {
				var cachedCell = cached[i];
				return keysDiffer = cachedCell && cachedCell.attrs && cachedCell.attrs.key !== attrs.key;
			});
		}

		return keysDiffer ? handleKeysDiffer(data, existing, cached, parentElement) : cached;
	}

	function diffArray(data, cached, nodes) {
		//diff the array itself

		//update the list of DOM nodes by collecting the nodes from each item
		forEach(data, function (_, i) {
			if (cached[i] != null) nodes.push.apply(nodes, cached[i].nodes);
		})
		//remove items from the end of the array if the new array is shorter than the old one. if errors ever happen here, the issue is most likely
		//a bug in the construction of the `cached` data structure somewhere earlier in the program
		forEach(cached.nodes, function (node, i) {
			if (node.parentNode != null && nodes.indexOf(node) < 0) clear([node], [cached[i]]);
		})
		if (data.length < cached.length) cached.length = data.length;
		cached.nodes = nodes;
	}

	function buildArrayKeys(data) {
		var guid = 0;
		forKeys(data, function () {
			forEach(data, function (attrs) {
				if ((attrs = attrs && attrs.attrs) && attrs.key == null) attrs.key = "__mithril__" + guid++;
			})
			return 1;
		});
	}

	function maybeRecreateObject(data, cached, dataAttrKeys) {
		//if an element is different enough from the one in cache, recreate it
		if (data.tag !== cached.tag ||
				dataAttrKeys.sort().join() !== Object.keys(cached.attrs).sort().join() ||
				data.attrs.id !== cached.attrs.id ||
				data.attrs.key !== cached.attrs.key ||
				(m.redraw.strategy() === "all" && (!cached.configContext || cached.configContext.retain !== true)) ||
				(m.redraw.strategy() === "diff" && cached.configContext && cached.configContext.retain === false)) {
			if (cached.nodes.length) clear(cached.nodes);
			if (cached.configContext && isFunction(cached.configContext.onunload)) cached.configContext.onunload();
			if (cached.controllers) {
				forEach(cached.controllers, function (controller) {
					if (controller.unload) controller.onunload({preventDefault: noop});
				});
			}
		}
	}

	function getObjectNamespace(data, namespace) {
		return data.attrs.xmlns ? data.attrs.xmlns :
			data.tag === "svg" ? "http://www.w3.org/2000/svg" :
			data.tag === "math" ? "http://www.w3.org/1998/Math/MathML" :
			namespace;
	}

	function unloadCachedControllers(cached, views, controllers) {
		if (controllers.length) {
			cached.views = views;
			cached.controllers = controllers;
			forEach(controllers, function (controller) {
				if (controller.onunload && controller.onunload.$old) controller.onunload = controller.onunload.$old;
				if (pendingRequests && controller.onunload) {
					var onunload = controller.onunload;
					controller.onunload = noop;
					controller.onunload.$old = onunload;
				}
			});
		}
	}

	function scheduleConfigsToBeCalled(configs, data, node, isNew, cached) {
		//schedule configs to be called. They are called after `build`
		//finishes running
		if (isFunction(data.attrs.config)) {
			var context = cached.configContext = cached.configContext || {};

			//bind
			configs.push(function() {
				return data.attrs.config.call(data, node, !isNew, context, cached);
			});
		}
	}

	function buildUpdatedNode(cached, data, editable, hasKeys, namespace, views, configs, controllers) {
		var node = cached.nodes[0];
		if (hasKeys) setAttributes(node, data.tag, data.attrs, cached.attrs, namespace);
		cached.children = build(node, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? node : editable, namespace, configs);
		cached.nodes.intact = true;

		if (controllers.length) {
			cached.views = views;
			cached.controllers = controllers;
		}

		return node;
	}

	function handleNonexistentNodes(data, parentElement, index) {
		var nodes;
		if (data.$trusted) {
			nodes = injectHTML(parentElement, index, data);
		}
		else {
			nodes = [$document.createTextNode(data)];
			if (!parentElement.nodeName.match(voidElements)) insertNode(parentElement, nodes[0], index);
		}

		var cached = typeof data === "string" || typeof data === "number" || typeof data === "boolean" ? new data.constructor(data) : data;
		cached.nodes = nodes;
		return cached;
	}

	function reattachNodes(data, cached, parentElement, editable, index, parentTag) {
		var nodes = cached.nodes;
		if (!editable || editable !== $document.activeElement) {
			if (data.$trusted) {
				clear(nodes, cached);
				nodes = injectHTML(parentElement, index, data);
			}
			//corner case: replacing the nodeValue of a text node that is a child of a textarea/contenteditable doesn't work
			//we need to update the value property of the parent textarea or the innerHTML of the contenteditable element instead
			else if (parentTag === "textarea") {
				parentElement.value = data;
			}
			else if (editable) {
				editable.innerHTML = data;
			}
			else {
				//was a trusted string
				if (nodes[0].nodeType === 1 || nodes.length > 1) {
					clear(cached.nodes, cached);
					nodes = [$document.createTextNode(data)];
				}
				injectTextNode(parentElement, nodes[0], index, data);
			}
		}
		cached = new data.constructor(data);
		cached.nodes = nodes;
		return cached;
	}

	function handleText(cached, data, index, parentElement, shouldReattach, editable, parentTag) {
		//handle text nodes
		return cached.nodes.length === 0 ? handleNonexistentNodes(data, parentElement, index) :
			cached.valueOf() !== data.valueOf() || shouldReattach === true ?
				reattachNodes(data, cached, parentElement, editable, index, parentTag) :
			(cached.nodes.intact = true, cached);
	}

	function getSubArrayCount(item) {
		if (item.$trusted) {
			//fix offset of next element if item was a trusted string w/ more than one html element
			//the first clause in the regexp matches elements
			//the second clause (after the pipe) matches text nodes
			var match = item.match(/<[^\/]|\>\s*[^<]/g);
			if (match != null) return match.length;
		}
		else if (isArray(item)) {
			return item.length;
		}
		return 1;
	}

	function buildArray(data, cached, parentElement, index, parentTag, shouldReattach, editable, namespace, configs) {
		data = flatten(data);
		var nodes = [], intact = cached.length === data.length, subArrayCount = 0;

		//keys algorithm: sort elements without recreating them if keys are present
		//1) create a map of all existing keys, and mark all for deletion
		//2) add new keys to map and mark them for addition
		//3) if key exists in new list, change action from deletion to a move
		//4) for each key, handle its corresponding action as marked in previous steps
		var existing = {}, shouldMaintainIdentities = false;
		forKeys(cached, function (attrs, i) {
			shouldMaintainIdentities = true;
			existing[cached[i].attrs.key] = {action: DELETION, index: i};
		});

		buildArrayKeys(data);
		if (shouldMaintainIdentities) cached = diffKeys(data, cached, existing, parentElement);
		//end key algorithm

		var cacheCount = 0;
		//faster explicitly written
		for (var i = 0, len = data.length; i < len; i++) {
			//diff each item in the array
			var item = build(parentElement, parentTag, cached, index, data[i], cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs);

			if (item !== undefined) {
				intact = intact && item.nodes.intact;
				subArrayCount += getSubArrayCount(item);
				cached[cacheCount++] = item;
			}
		}

		if (!intact) diffArray(data, cached, nodes);
		return cached
	}

	function makeCache(data, cached, index, parentIndex, parentCache) {
		if (cached != null) {
			if (type.call(cached) === type.call(data)) return cached;

			if (parentCache && parentCache.nodes) {
				var offset = index - parentIndex, end = offset + (isArray(data) ? data : cached.nodes).length;
				clear(parentCache.nodes.slice(offset, end), parentCache.slice(offset, end));
			} else if (cached.nodes) {
				clear(cached.nodes, cached);
			}
		}

		cached = new data.constructor();
		//if constructor creates a virtual dom element, use a blank object
		//as the base cached node instead of copying the virtual el (#277)
		if (cached.tag) cached = {};
		cached.nodes = [];
		return cached;
	}

	function constructNode(data, namespace) {
		return namespace === undefined ?
			data.attrs.is ? $document.createElement(data.tag, data.attrs.is) : $document.createElement(data.tag) :
			data.attrs.is ? $document.createElementNS(namespace, data.tag, data.attrs.is) : $document.createElementNS(namespace, data.tag);
	}

	function constructAttrs(data, node, namespace, hasKeys) {
		return hasKeys ? setAttributes(node, data.tag, data.attrs, {}, namespace) : data.attrs;
	}

	function constructChildren(data, node, cached, editable, namespace, configs) {
		return data.children != null && data.children.length > 0 ?
			build(node, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? node : editable, namespace, configs) :
			data.children;
	}

	function reconstructCached(data, attrs, children, node, namespace, views, controllers) {
		var cached = {tag: data.tag, attrs: attrs, children: children, nodes: [node]};
		unloadCachedControllers(cached, views, controllers);
		if (cached.children && !cached.children.nodes) cached.children.nodes = [];
		//edge case: setting value on <select> doesn't work before children exist, so set it again after children have been created
		if (data.tag === "select" && "value" in data.attrs) setAttributes(node, data.tag, {value: data.attrs.value}, {}, namespace);
		return cached
	}

	function getController(views, view, cachedControllers, controller) {
		var controllerIndex = m.redraw.strategy() === "diff" && views ? views.indexOf(view) : -1;
		return controllerIndex > -1 ? cachedControllers[controllerIndex] :
			typeof controller === "function" ? new controller() : {};
	}

	function updateLists(views, controllers, view, controller) {
		if (controller.onunload != null) unloaders.push({controller: controller, handler: controller.onunload});
		views.push(view);
		controllers.push(controller);
	}

	function checkView(data, view, cached, cachedControllers, controllers, views) {
		var controller = getController(cached.views, view, cachedControllers, data.controller);
		//Faster to coerce to number and check for NaN
		var key = +(data && data.attrs && data.attrs.key);
		data = pendingRequests === 0 || forcing || cachedControllers && cachedControllers.indexOf(controller) > -1 ? data.view(controller) : {tag: "placeholder"};
		if (data.subtree === "retain") return cached;
		if (key === key) (data.attrs = data.attrs || {}).key = key;
		updateLists(views, controllers, view, controller);
		return data;
	}

	function markViews(data, cached, views, controllers) {
		var cachedControllers = cached && cached.controllers;
		while (data.view != null) data = checkView(data, data.view.$original || data.view, cached, cachedControllers, controllers, views);
		return data;
	}

	function buildObject(data, cached, editable, parentElement, index, shouldReattach, namespace, configs) {
		var views = [], controllers = [];
		data = markViews(data, cached, views, controllers);
		if (!data.tag && controllers.length) throw new Error("Component template must return a virtual element, not an array, string, etc.");
		data.attrs = data.attrs || {};
		cached.attrs = cached.attrs || {};
		var dataAttrKeys = Object.keys(data.attrs);
		var hasKeys = dataAttrKeys.length > ("key" in data.attrs ? 1 : 0);
		maybeRecreateObject(data, cached, dataAttrKeys);
		if (!isString(data.tag)) return;
		var isNew = cached.nodes.length === 0;
		namespace = getObjectNamespace(data, namespace);
		var node;
		if (isNew) {
			node = constructNode(data, namespace);
			//set attributes first, then create children
			var attrs = constructAttrs(data, node, namespace, hasKeys)
			var children = constructChildren(data, node, cached, editable, namespace, configs);
			cached = reconstructCached(data, attrs, children, node, namespace, views, controllers);
		}
		else {
			node = buildUpdatedNode(cached, data, editable, hasKeys, namespace, views, configs, controllers);
		}
		if (isNew || shouldReattach === true && node != null) insertNode(parentElement, node, index);
		//schedule configs to be called. They are called after `build`
		//finishes running
		scheduleConfigsToBeCalled(configs, data, node, isNew, cached);
		return cached
	}

	function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
		//`build` is a recursive function that manages creation/diffing/removal
		//of DOM elements based on comparison between `data` and `cached`
		//the diff algorithm can be summarized as this:
		//1 - compare `data` and `cached`
		//2 - if they are different, copy `data` to `cached` and update the DOM
		//    based on what the difference is
		//3 - recursively apply this algorithm for every array and for the
		//    children of every virtual element

		//the `cached` data structure is essentially the same as the previous
		//redraw's `data` data structure, with a few additions:
		//- `cached` always has a property called `nodes`, which is a list of
		//   DOM elements that correspond to the data represented by the
		//   respective virtual element
		//- in order to support attaching `nodes` as a property of `cached`,
		//   `cached` is *always* a non-primitive object, i.e. if the data was
		//   a string, then cached is a String instance. If data was `null` or
		//   `undefined`, cached is `new String("")`
		//- `cached also has a `configContext` property, which is the state
		//   storage object exposed by config(element, isInitialized, context)
		//- when `cached` is an Object, it represents a virtual element; when
		//   it's an Array, it represents a list of elements; when it's a
		//   String, Number or Boolean, it represents a text node

		//`parentElement` is a DOM element used for W3C DOM API calls
		//`parentTag` is only used for handling a corner case for textarea
		//values
		//`parentCache` is used to remove nodes in some multi-node cases
		//`parentIndex` and `index` are used to figure out the offset of nodes.
		//They're artifacts from before arrays started being flattened and are
		//likely refactorable
		//`data` and `cached` are, respectively, the new and old nodes being
		//diffed
		//`shouldReattach` is a flag indicating whether a parent node was
		//recreated (if so, and if this node is reused, then this node must
		//reattach itself to the new parent)
		//`editable` is a flag that indicates whether an ancestor is
		//contenteditable
		//`namespace` indicates the closest HTML namespace as it cascades down
		//from an ancestor
		//`configs` is a list of config functions to run after the topmost
		//`build` call finishes running

		//there's logic that relies on the assumption that null and undefined
		//data are equivalent to empty strings
		//- this prevents lifecycle surprises from procedural helpers that mix
		//  implicit and explicit return statements (e.g.
		//  function foo() {if (cond) return m("div")}
		//- it simplifies diffing code
		data = dataToString(data);
		if (data.subtree === "retain") return cached;
		cached = makeCache(data, cached, index, parentIndex, parentCache);
		return isArray(data) ? buildArray(data, cached, parentElement, index, parentTag, shouldReattach, editable, namespace, configs) :
			data != null && isObject(data) ? buildObject(data, cached, editable, parentElement, index, shouldReattach, namespace, configs) :
			!isFunction(data) ? handleText(cached, data, index, parentElement, shouldReattach, editable, parentTag) :
			cached;
	}
	function sortChanges(a, b) { return a.action - b.action || a.index - b.index; }
	function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
		for (var attrName in dataAttrs) {
			var dataAttr = dataAttrs[attrName];
			var cachedAttr = cachedAttrs[attrName];
			if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr)) {
				cachedAttrs[attrName] = dataAttr;
				//`config` isn't a real attributes, so ignore it
				if (attrName === "config" || attrName === "key") continue;
				//hook event handlers to the auto-redrawing system
				else if (isFunction(dataAttr) && attrName.slice(0, 2) === "on") {
				node[attrName] = autoredraw(dataAttr, node);
				}
				//handle `style: {...}`
				else if (attrName === "style" && dataAttr != null && isObject(dataAttr)) {
				for (var rule in dataAttr) {
						if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) node.style[rule] = dataAttr[rule];
				}
				for (var rule in cachedAttr) {
						if (!(rule in dataAttr)) node.style[rule] = "";
				}
				}
				//handle SVG
				else if (namespace != null) {
				if (attrName === "href") node.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataAttr);
				else node.setAttribute(attrName === "className" ? "class" : attrName, dataAttr);
				}
				//handle cases that are properties (but ignore cases where we should use setAttribute instead)
				//- list and form are typically used as strings, but are DOM element references in js
				//- when using CSS selectors (e.g. `m("[style='']")`), style is used as a string, but it's an object in js
				else if (attrName in node && attrName !== "list" && attrName !== "style" && attrName !== "form" && attrName !== "type" && attrName !== "width" && attrName !== "height") {
				//#348 don't set the value if not needed otherwise cursor placement breaks in Chrome
				if (tag !== "input" || node[attrName] !== dataAttr) node[attrName] = dataAttr;
				}
				else node.setAttribute(attrName, dataAttr);
			}
			//#348 dataAttr may not be a string, so use loose comparison (double equal) instead of strict (triple equal)
			else if (attrName === "value" && tag === "input" && node.value != dataAttr) {
				node.value = dataAttr;
			}
		}
		return cachedAttrs;
	}
	function clear(nodes, cached) {
		for (var i = nodes.length - 1; i > -1; i--) {
			if (nodes[i] && nodes[i].parentNode) {
				try { nodes[i].parentNode.removeChild(nodes[i]); }
				catch (e) {} //ignore if this fails due to order of events (see http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node)
				cached = [].concat(cached);
				if (cached[i]) unload(cached[i]);
			}
		}
		//release memory if nodes is an array. This check should fail if nodes is a NodeList (see loop above)
		if (nodes.length) nodes.length = 0;
	}
	function unload(cached) {
		if (cached.configContext && isFunction(cached.configContext.onunload)) {
			cached.configContext.onunload();
			cached.configContext.onunload = null;
		}
		if (cached.controllers) {
			forEach(cached.controllers, function (controller) {
				if (isFunction(controller.onunload)) controller.onunload({preventDefault: noop});
			});
		}
		if (cached.children) {
			if (isArray(cached.children)) forEach(cached.children, unload);
			else if (cached.children.tag) unload(cached.children);
		}
	}

	var insertAdjacentBeforeEnd = (function () {
		var rangeStrategy = function (parentElement, data) {
			parentElement.appendChild($document.createRange().createContextualFragment(data));
		};
		var insertAdjacentStrategy = function (parentElement, data) {
			parentElement.insertAdjacentHTML("beforeend", data);
		};

		try {
			$document.createRange().createContextualFragment('x');
			return rangeStrategy;
		} catch (e) {
			return insertAdjacentStrategy;
		}
	})();

	function injectHTML(parentElement, index, data) {
		var nextSibling = parentElement.childNodes[index];
		if (nextSibling) {
			var isElement = nextSibling.nodeType !== 1;
			var placeholder = $document.createElement("span");
			if (isElement) {
				parentElement.insertBefore(placeholder, nextSibling || null);
				placeholder.insertAdjacentHTML("beforebegin", data);
				parentElement.removeChild(placeholder);
			}
			else nextSibling.insertAdjacentHTML("beforebegin", data);
		}
		else insertAdjacentBeforeEnd(parentElement, data);

		var nodes = [];
		while (parentElement.childNodes[index] !== nextSibling) {
			nodes.push(parentElement.childNodes[index]);
			index++;
		}
		return nodes;
	}
	function autoredraw(callback, object) {
		return function(e) {
			e = e || event;
			m.redraw.strategy("diff");
			m.startComputation();
			try { return callback.call(object, e); }
			finally {
				endFirstComputation();
			}
		};
	}

	var html;
	var documentNode = {
		appendChild: function(node) {
			if (html === undefined) html = $document.createElement("html");
			if ($document.documentElement && $document.documentElement !== node) {
				$document.replaceChild(node, $document.documentElement);
			}
			else $document.appendChild(node);
			this.childNodes = $document.childNodes;
		},
		insertBefore: function(node) {
			this.appendChild(node);
		},
		childNodes: []
	};
	var nodeCache = [], cellCache = {};
	m.render = function(root, cell, forceRecreation) {
		var configs = [];
		if (!root) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.");
		var id = getCellCacheKey(root);
		var isDocumentRoot = root === $document;
		var node = isDocumentRoot || root === $document.documentElement ? documentNode : root;
		if (isDocumentRoot && cell.tag !== "html") cell = {tag: "html", attrs: {}, children: cell};
		if (cellCache[id] === undefined) clear(node.childNodes);
		if (forceRecreation === true) reset(root);
		cellCache[id] = build(node, null, undefined, undefined, cell, cellCache[id], false, 0, null, undefined, configs);
		forEach(configs, function (config) { config(); });
	};
	function getCellCacheKey(element) {
		var index = nodeCache.indexOf(element);
		return index < 0 ? nodeCache.push(element) - 1 : index;
	}

	m.trust = function(value) {
		value = new String(value);
		value.$trusted = true;
		return value;
	};

	function gettersetter(store) {
		var prop = function() {
			if (arguments.length) store = arguments[0];
			return store;
		};

		prop.toJSON = function() {
			return store;
		};

		return prop;
	}

	m.prop = function (store) {
		//note: using non-strict equality check here because we're checking if store is null OR undefined
		if ((store != null && isObject(store) || isFunction(store)) && isFunction(store.then)) {
			return propify(store);
		}

		return gettersetter(store);
	};

	var roots = [], components = [], controllers = [], lastRedrawId = null, lastRedrawCallTime = 0, computePreRedrawHook = null, computePostRedrawHook = null, topComponent, unloaders = [];
	var FRAME_BUDGET = 16; //60 frames per second = 1 call per 16 ms
	function parameterize(component, args) {
		var controller = function() {
			return (component.controller || noop).apply(this, args) || this;
		};
		if (component.controller) controller.prototype = component.controller.prototype;
		var view = function(ctrl) {
			var currentArgs = arguments.length > 1 ? args.concat([].slice.call(arguments, 1)) : args;
			return component.view.apply(component, currentArgs ? [ctrl].concat(currentArgs) : [ctrl]);
		};
		view.$original = component.view;
		var output = {controller: controller, view: view};
		if (args[0] && args[0].key != null) output.attrs = {key: args[0].key};
		return output;
	}
	m.component = function(component) {
		for (var args = [], i = 1; i < arguments.length; i++) args.push(arguments[i]);
		return parameterize(component, args);
	};
	m.mount = m.module = function(root, component) {
		if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.");
		var index = roots.indexOf(root);
		if (index < 0) index = roots.length;

		var isPrevented = false;
		var event = {preventDefault: function() {
			isPrevented = true;
			computePreRedrawHook = computePostRedrawHook = null;
		}};

		forEach(unloaders, function (unloader) {
			unloader.handler.call(unloader.controller, event);
			unloader.controller.onunload = null;
		});

		if (isPrevented) {
			forEach(unloaders, function (unloader) {
				unloader.controller.onunload = unloader.handler;
			});
		}
		else unloaders = [];

		if (controllers[index] && isFunction(controllers[index].onunload)) {
			controllers[index].onunload(event);
		}

		var isNullComponent = component === null;

		if (!isPrevented) {
			m.redraw.strategy("all");
			m.startComputation();
			roots[index] = root;
			var currentComponent = component ? (topComponent = component) : (topComponent = component = {controller: noop});
			var controller = new (component.controller || noop)();
			//controllers may call m.mount recursively (via m.route redirects, for example)
			//this conditional ensures only the last recursive m.mount call is applied
			if (currentComponent === topComponent) {
				controllers[index] = controller;
				components[index] = component;
			}
			endFirstComputation();
			if (isNullComponent) {
				removeRootElement(root, index);
			}
			return controllers[index];
		}
		if (isNullComponent) {
			removeRootElement(root, index);
		}
	};

	function removeRootElement(root, index) {
		roots.splice(index, 1);
		controllers.splice(index, 1);
		components.splice(index, 1);
		reset(root);
		nodeCache.splice(getCellCacheKey(root), 1);
	}

	var redrawing = false, forcing = false;
	m.redraw = function(force) {
		if (redrawing) return;
		redrawing = true;
		if (force) forcing = true;
		try {
			//lastRedrawId is a positive number if a second redraw is requested before the next animation frame
			//lastRedrawID is null if it's the first redraw and not an event handler
			if (lastRedrawId && !force) {
				//when setTimeout: only reschedule redraw if time between now and previous redraw is bigger than a frame, otherwise keep currently scheduled timeout
				//when rAF: always reschedule redraw
				if ($requestAnimationFrame === window.requestAnimationFrame || new Date - lastRedrawCallTime > FRAME_BUDGET) {
					if (lastRedrawId > 0) $cancelAnimationFrame(lastRedrawId);
					lastRedrawId = $requestAnimationFrame(redraw, FRAME_BUDGET);
				}
			}
			else {
				redraw();
				lastRedrawId = $requestAnimationFrame(function() { lastRedrawId = null; }, FRAME_BUDGET);
			}
		}
		finally {
			redrawing = forcing = false;
		}
	};
	m.redraw.strategy = m.prop();
	function redraw() {
		if (computePreRedrawHook) {
			computePreRedrawHook();
			computePreRedrawHook = null;
		}
		forEach(roots, function (root, i) {
			var component = components[i];
			if (controllers[i]) {
				var args = [controllers[i]];
				m.render(root, component.view ? component.view(controllers[i], args) : "");
			}
		});
		//after rendering within a routed context, we need to scroll back to the top, and fetch the document title for history.pushState
		if (computePostRedrawHook) {
			computePostRedrawHook();
			computePostRedrawHook = null;
		}
		lastRedrawId = null;
		lastRedrawCallTime = new Date;
		m.redraw.strategy("diff");
	}

	var pendingRequests = 0;
	m.startComputation = function() { pendingRequests++; };
	m.endComputation = function() {
		if (pendingRequests > 1) pendingRequests--;
		else {
			pendingRequests = 0;
			m.redraw();
		}
	}

	function endFirstComputation() {
		if (m.redraw.strategy() === "none") {
			pendingRequests--;
			m.redraw.strategy("diff");
		}
		else m.endComputation();
	}

	m.withAttr = function(prop, withAttrCallback, callbackThis) {
		return function(e) {
			e = e || event;
			var currentTarget = e.currentTarget || this;
			var _this = callbackThis || this;
			withAttrCallback.call(_this, prop in currentTarget ? currentTarget[prop] : currentTarget.getAttribute(prop));
		};
	};

	//routing
	var modes = {pathname: "", hash: "#", search: "?"};
	var redirect = noop, routeParams, currentRoute, isDefaultRoute = false;
	m.route = function(root, arg1, arg2, vdom) {
		//m.route()
		if (arguments.length === 0) return currentRoute;
		//m.route(el, defaultRoute, routes)
		else if (arguments.length === 3 && isString(arg1)) {
			redirect = function(source) {
				var path = currentRoute = normalizeRoute(source);
				if (!routeByValue(root, arg2, path)) {
					if (isDefaultRoute) throw new Error("Ensure the default route matches one of the routes defined in m.route");
					isDefaultRoute = true;
					m.route(arg1, true);
					isDefaultRoute = false;
				}
			};
			var listener = m.route.mode === "hash" ? "onhashchange" : "onpopstate";
			window[listener] = function() {
				var path = $location[m.route.mode];
				if (m.route.mode === "pathname") path += $location.search;
				if (currentRoute !== normalizeRoute(path)) redirect(path);
			};

			computePreRedrawHook = setScroll;
			window[listener]();
		}
		//config: m.route
		else if (root.addEventListener || root.attachEvent) {
			root.href = (m.route.mode !== 'pathname' ? $location.pathname : '') + modes[m.route.mode] + vdom.attrs.href;
			if (root.addEventListener) {
				root.removeEventListener("click", routeUnobtrusive);
				root.addEventListener("click", routeUnobtrusive);
			}
			else {
				root.detachEvent("onclick", routeUnobtrusive);
				root.attachEvent("onclick", routeUnobtrusive);
			}
		}
		//m.route(route, params, shouldReplaceHistoryEntry)
		else if (isString(root)) {
			var oldRoute = currentRoute;
			currentRoute = root;
			var args = arg1 || {};
			var queryIndex = currentRoute.indexOf("?");
			var params = queryIndex > -1 ? parseQueryString(currentRoute.slice(queryIndex + 1)) : {};
			for (var i in args) params[i] = args[i];
			var querystring = buildQueryString(params);
			var currentPath = queryIndex > -1 ? currentRoute.slice(0, queryIndex) : currentRoute;
			if (querystring) currentRoute = currentPath + (currentPath.indexOf("?") === -1 ? "?" : "&") + querystring;

			var shouldReplaceHistoryEntry = (arguments.length === 3 ? arg2 : arg1) === true || oldRoute === root;

			if (window.history.pushState) {
				computePreRedrawHook = setScroll;
				computePostRedrawHook = function() {
					window.history[shouldReplaceHistoryEntry ? "replaceState" : "pushState"](null, $document.title, modes[m.route.mode] + currentRoute);
				};
				redirect(modes[m.route.mode] + currentRoute);
			}
			else {
				$location[m.route.mode] = currentRoute;
				redirect(modes[m.route.mode] + currentRoute);
			}
		}
	};
	m.route.param = function(key) {
		if (!routeParams) throw new Error("You must call m.route(element, defaultRoute, routes) before calling m.route.param()");
		if( !key ){
			return routeParams;
		}
		return routeParams[key];
	};
	m.route.mode = "search";
	function normalizeRoute(route) {
		return route.slice(modes[m.route.mode].length);
	}
	function routeByValue(root, router, path) {
		routeParams = {};

		var queryStart = path.indexOf("?");
		if (queryStart !== -1) {
			routeParams = parseQueryString(path.substr(queryStart + 1, path.length));
			path = path.substr(0, queryStart);
		}

		// Get all routes and check if there's
		// an exact match for the current path
		var keys = Object.keys(router);
		var index = keys.indexOf(path);
		if(index !== -1){
			m.mount(root, router[keys [index]]);
			return true;
		}

		for (var route in router) {
			if (route === path) {
				m.mount(root, router[route]);
				return true;
			}

			var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");

			if (matcher.test(path)) {
				path.replace(matcher, function() {
					var keys = route.match(/:[^\/]+/g) || [];
					var values = [].slice.call(arguments, 1, -2);
					forEach(keys, function (key, i) {
						routeParams[key.replace(/:|\./g, "")] = decodeURIComponent(values[i]);
					})
					m.mount(root, router[route]);
				});
				return true;
			}
		}
	}
	function routeUnobtrusive(e) {
		e = e || event;

		if (e.ctrlKey || e.metaKey || e.which === 2) return;

		if (e.preventDefault) e.preventDefault();
		else e.returnValue = false;

		var currentTarget = e.currentTarget || e.srcElement;
		var args = m.route.mode === "pathname" && currentTarget.search ? parseQueryString(currentTarget.search.slice(1)) : {};
		while (currentTarget && currentTarget.nodeName.toUpperCase() !== "A") currentTarget = currentTarget.parentNode;
		m.route(currentTarget[m.route.mode].slice(modes[m.route.mode].length), args);
	}
	function setScroll() {
		if (m.route.mode !== "hash" && $location.hash) $location.hash = $location.hash;
		else window.scrollTo(0, 0);
	}
	function buildQueryString(object, prefix) {
		var duplicates = {};
		var str = [];
		for (var prop in object) {
			var key = prefix ? prefix + "[" + prop + "]" : prop;
			var value = object[prop];

			if (value === null) {
				str.push(encodeURIComponent(key));
			} else if (isObject(value)) {
				str.push(buildQueryString(value, key));
			} else if (isArray(value)) {
				var keys = [];
				duplicates[key] = duplicates[key] || {};
				forEach(value, function (item) {
					if (!duplicates[key][item]) {
						duplicates[key][item] = true;
						keys.push(encodeURIComponent(key) + "=" + encodeURIComponent(item));
					}
				});
				str.push(keys.join("&"));
			} else if (value !== undefined) {
				str.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
			}
		}
		return str.join("&");
	}
	function parseQueryString(str) {
		if (str === "" || str == null) return {};
		if (str.charAt(0) === "?") str = str.slice(1);

		var pairs = str.split("&"), params = {};
		forEach(pairs, function (string) {
			var pair = string.split("=");
			var key = decodeURIComponent(pair[0]);
			var value = pair.length === 2 ? decodeURIComponent(pair[1]) : null;
			if (params[key] != null) {
				if (!isArray(params[key])) params[key] = [params[key]];
				params[key].push(value);
			}
			else params[key] = value;
		});

		return params;
	}
	m.route.buildQueryString = buildQueryString;
	m.route.parseQueryString = parseQueryString;

	function reset(root) {
		var cacheKey = getCellCacheKey(root);
		clear(root.childNodes, cellCache[cacheKey]);
		cellCache[cacheKey] = undefined;
	}

	m.deferred = function () {
		var deferred = new Deferred();
		deferred.promise = propify(deferred.promise);
		return deferred;
	};
	function propify(promise, initialValue) {
		var prop = m.prop(initialValue);
		promise.then(prop);
		prop.then = function(resolve, reject) {
			return propify(promise.then(resolve, reject), initialValue);
		};
		prop["catch"] = prop.then.bind(null, null);
		prop["finally"] = function(callback) {
			var _callback = function() {return m.deferred().resolve(callback()).promise;};
			return prop.then(function(value) {
				return propify(_callback().then(function() {return value;}), initialValue);
			}, function(reason) {
				return propify(_callback().then(function() {throw new Error(reason);}), initialValue);
			});
		};
		return prop;
	}
	//Promiz.mithril.js | Zolmeister | MIT
	//a modified version of Promiz.js, which does not conform to Promises/A+ for two reasons:
	//1) `then` callbacks are called synchronously (because setTimeout is too slow, and the setImmediate polyfill is too big
	//2) throwing subclasses of Error cause the error to be bubbled up instead of triggering rejection (because the spec does not account for the important use case of default browser error handling, i.e. message w/ line number)
	function Deferred(successCallback, failureCallback) {
		var RESOLVING = 1, REJECTING = 2, RESOLVED = 3, REJECTED = 4;
		var self = this, state = 0, promiseValue = 0, next = [];

		self.promise = {};

		self.resolve = function(value) {
			if (!state) {
				promiseValue = value;
				state = RESOLVING;

				fire();
			}
			return this;
		};

		self.reject = function(value) {
			if (!state) {
				promiseValue = value;
				state = REJECTING;

				fire();
			}
			return this;
		};

		self.promise.then = function(successCallback, failureCallback) {
			var deferred = new Deferred(successCallback, failureCallback)
			if (state === RESOLVED) {
				deferred.resolve(promiseValue);
			}
			else if (state === REJECTED) {
				deferred.reject(promiseValue);
			}
			else {
				next.push(deferred);
			}
			return deferred.promise
		};

		function finish(type) {
			state = type || REJECTED;
			next.map(function(deferred) {
				state === RESOLVED ? deferred.resolve(promiseValue) : deferred.reject(promiseValue);
			});
		}

		function thennable(then, successCallback, failureCallback, notThennableCallback) {
			if (((promiseValue != null && isObject(promiseValue)) || isFunction(promiseValue)) && isFunction(then)) {
				try {
					// count protects against abuse calls from spec checker
					var count = 0;
					then.call(promiseValue, function(value) {
						if (count++) return;
						promiseValue = value;
						successCallback();
					}, function (value) {
						if (count++) return;
						promiseValue = value;
						failureCallback();
					});
				}
				catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					failureCallback();
				}
			} else {
				notThennableCallback();
			}
		}

		function fire() {
			// check if it's a thenable
			var then;
			try {
				then = promiseValue && promiseValue.then;
			}
			catch (e) {
				m.deferred.onerror(e);
				promiseValue = e;
				state = REJECTING;
				return fire();
			}

			thennable(then, function() {
				state = RESOLVING;
				fire();
			}, function() {
				state = REJECTING;
				fire();
			}, function() {
				try {
					if (state === RESOLVING && isFunction(successCallback)) {
						promiseValue = successCallback(promiseValue);
					}
					else if (state === REJECTING && isFunction(failureCallback)) {
						promiseValue = failureCallback(promiseValue);
						state = RESOLVING;
					}
				}
				catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					return finish();
				}

				if (promiseValue === self) {
					promiseValue = TypeError();
					finish();
				} else {
					thennable(then, function () {
						finish(RESOLVED);
					}, finish, function () {
						finish(state === RESOLVING && RESOLVED);
					});
				}
			});
		}
	}
	m.deferred.onerror = function(e) {
		if (type.call(e) === "[object Error]" && !e.constructor.toString().match(/ Error/)) {
			pendingRequests = 0;
			throw e;
		}
	};

	m.sync = function(args) {
		var method = "resolve";

		function synchronizer(pos, resolved) {
			return function(value) {
				results[pos] = value;
				if (!resolved) method = "reject";
				if (--outstanding === 0) {
					deferred.promise(results);
					deferred[method](results);
				}
				return value;
			};
		}

		var deferred = m.deferred();
		var outstanding = args.length;
		var results = new Array(outstanding);
		if (args.length > 0) {
			forEach(args, function (arg, i) {
				arg.then(synchronizer(i, true), synchronizer(i, false));
			});
		}
		else deferred.resolve([]);

		return deferred.promise;
	};
	function identity(value) { return value; }

	function ajax(options) {
		if (options.dataType && options.dataType.toLowerCase() === "jsonp") {
			var callbackKey = "mithril_callback_" + new Date().getTime() + "_" + (Math.round(Math.random() * 1e16)).toString(36)
			var script = $document.createElement("script");

			window[callbackKey] = function(resp) {
				script.parentNode.removeChild(script);
				options.onload({
					type: "load",
					target: {
						responseText: resp
					}
				});
				window[callbackKey] = undefined;
			};

			script.onerror = function() {
				script.parentNode.removeChild(script);

				options.onerror({
					type: "error",
					target: {
						status: 500,
						responseText: JSON.stringify({
							error: "Error making jsonp request"
						})
					}
				});
				window[callbackKey] = undefined;

				return false;
			}

			script.onload = function() {
				return false;
			};

			script.src = options.url
				+ (options.url.indexOf("?") > 0 ? "&" : "?")
				+ (options.callbackKey ? options.callbackKey : "callback")
				+ "=" + callbackKey
				+ "&" + buildQueryString(options.data || {});
			$document.body.appendChild(script);
		}
		else {
			var xhr = new window.XMLHttpRequest();
			xhr.open(options.method, options.url, true, options.user, options.password);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status < 300) options.onload({type: "load", target: xhr});
					else options.onerror({type: "error", target: xhr});
				}
			};
			if (options.serialize === JSON.stringify && options.data && options.method !== "GET") {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			}
			if (options.deserialize === JSON.parse) {
				xhr.setRequestHeader("Accept", "application/json, text/*");
			}
			if (isFunction(options.config)) {
				var maybeXhr = options.config(xhr, options);
				if (maybeXhr != null) xhr = maybeXhr;
			}

			var data = options.method === "GET" || !options.data ? "" : options.data;
			if (data && (!isString(data) && data.constructor !== window.FormData)) {
				throw new Error("Request data should be either be a string or FormData. Check the `serialize` option in `m.request`");
			}
			xhr.send(data);
			return xhr;
		}
	}

	function bindData(xhrOptions, data, serialize) {
		if (xhrOptions.method === "GET" && xhrOptions.dataType !== "jsonp") {
			var prefix = xhrOptions.url.indexOf("?") < 0 ? "?" : "&";
			var querystring = buildQueryString(data);
			xhrOptions.url = xhrOptions.url + (querystring ? prefix + querystring : "");
		}
		else xhrOptions.data = serialize(data);
		return xhrOptions;
	}

	function parameterizeUrl(url, data) {
		var tokens = url.match(/:[a-z]\w+/gi);
		if (tokens && data) {
			forEach(tokens, function (token) {
				var key = token.slice(1);
				url = url.replace(token, data[key]);
				delete data[key];
			});
		}
		return url;
	}

	m.request = function(xhrOptions) {
		if (xhrOptions.background !== true) m.startComputation();
		var deferred = new Deferred();
		var isJSONP = xhrOptions.dataType && xhrOptions.dataType.toLowerCase() === "jsonp"
		var serialize = xhrOptions.serialize = isJSONP ? identity : xhrOptions.serialize || JSON.stringify;
		var deserialize = xhrOptions.deserialize = isJSONP ? identity : xhrOptions.deserialize || JSON.parse;
		var extract = isJSONP ? function(jsonp) { return jsonp.responseText } : xhrOptions.extract || function(xhr) {
			if (xhr.responseText.length === 0 && deserialize === JSON.parse) {
				return null
			} else {
				return xhr.responseText
			}
		};
		xhrOptions.method = (xhrOptions.method || "GET").toUpperCase();
		xhrOptions.url = parameterizeUrl(xhrOptions.url, xhrOptions.data);
		xhrOptions = bindData(xhrOptions, xhrOptions.data, serialize);
		xhrOptions.onload = xhrOptions.onerror = function(e) {
			try {
				e = e || event;
				var unwrap = (e.type === "load" ? xhrOptions.unwrapSuccess : xhrOptions.unwrapError) || identity;
				var response = unwrap(deserialize(extract(e.target, xhrOptions)), e.target);
				if (e.type === "load") {
					if (isArray(response) && xhrOptions.type) {
						forEach(response, function (res, i) {
							response[i] = new xhrOptions.type(res);
						});
					} else if (xhrOptions.type) {
						response = new xhrOptions.type(response);
					}
				}

				deferred[e.type === "load" ? "resolve" : "reject"](response);
			} catch (e) {
				m.deferred.onerror(e);
				deferred.reject(e);
			}

			if (xhrOptions.background !== true) m.endComputation()
		}

		ajax(xhrOptions);
		deferred.promise = propify(deferred.promise, xhrOptions.initialValue);
		return deferred.promise;
	};

	//testing API
	m.deps = function(mock) {
		initialize(window = mock || window);
		return window;
	};
	//for internal testing only, do not use `m.deps.factory`
	m.deps.factory = app;

	return m;
})(typeof window !== "undefined" ? window : {});

if (typeof module === "object" && module != null && module.exports) module.exports = m;
else if (typeof define === "function" && define.amd) define(function() { return m });

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

},{"./moderation":14,"./note":15,"./preset":16,"common":21}],11:[function(require,module,exports){
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

},{"./enhance":12,"./moderation":14,"./preset":16,"./spam":17,"./util":18,"./xhr":20,"snabbdom":7}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./ctrl":10,"./view":19,"snabbdom":7,"snabbdom/modules/attributes":5,"snabbdom/modules/class":6}],14:[function(require,module,exports){
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

},{"./util":18,"./xhr":20,"snabbdom":7}],15:[function(require,module,exports){
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

},{"./util":18,"./xhr":20,"snabbdom":7}],16:[function(require,module,exports){
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

},{"./util":18,"snabbdom":7}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"snabbdom":7}],19:[function(require,module,exports){
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

},{"./discussion":11,"./moderation":14,"./note":15,"./util":18,"snabbdom":7}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
var socket = require('./socket');
var simul = require('./simul');
var text = require('./text');
var xhr = require('./xhr');

module.exports = function(env) {

  this.env = env;

  this.data = env.data;

  this.userId = env.userId;

  this.socket = new socket(env.socketSend, this);
  this.text = text.ctrl();

  this.reload = function(data) {
    data.team = this.data.simul; // reload data does not contain the simul anymore
    this.data = data;
    startWatching();
  }.bind(this);

  var alreadyWatching = [];
  var startWatching = function() {
    var newIds = this.data.pairings.map(function(p) {
      return p.game.id;
    }).filter(function(id) {
      return !alreadyWatching.includes(id);
    });
    if (newIds.length) {
      setTimeout(function() {
        this.socket.send("startWatching", newIds.join(' '));
      }.bind(this), 1000);
      newIds.forEach(alreadyWatching.push.bind(alreadyWatching));
    }
  }.bind(this);
  startWatching();

  if (simul.createdByMe(this) && this.data.isCreated)
    lichess.storage.set('lichess.move_on', '1'); // hideous hack :D

  this.trans = lichess.trans(env.i18n);

  this.teamBlock = this.data.team && !this.data.team.isIn;

  this.hostPing = () => {
    if (simul.createdByMe(this) && this.data.isCreated) {
      xhr.ping(this);
      setTimeout(this.hostPing, 20000);
    }
  };
  this.hostPing();
};

},{"./simul":25,"./socket":26,"./text":27,"./xhr":35}],24:[function(require,module,exports){
var m = require('mithril');

var ctrl = require('./ctrl');
var view = require('./view/main');

module.exports = function(opts) {

  var controller = new ctrl(opts);

  m.module(opts.element, {
    controller: function() {
      return controller;
    },
    view: view
  });

  return {
    socketReceive: controller.socket.receive
  };
};

window.LichessChat = require('chat');

},{"./ctrl":23,"./view/main":30,"chat":13,"mithril":1}],25:[function(require,module,exports){
var status = require('game/status');

function applicantsContainMe(ctrl) {
  return ctrl.data.applicants.filter(function(a) {
    return a.player.id === ctrl.userId;
  }).length > 0
}

function pairingsContainMe(ctrl) {
  return ctrl.data.pairings.filter(function(a) {
    return a.player.id === ctrl.userId;
  }).length > 0
}

module.exports = {
  createdByMe: function(ctrl) {
    return ctrl.userId && ctrl.userId === ctrl.data.host.id;
  },
  containsMe: function(ctrl) {
    return ctrl.userId && (applicantsContainMe(ctrl) || pairingsContainMe(ctrl));
  },
  candidates: function(ctrl) {
    return ctrl.data.applicants.filter(function(a) {
      return !a.accepted;
    });
  },
  accepted: function(ctrl) {
    return ctrl.data.applicants.filter(function(a) {
      return a.accepted;
    });
  },
  acceptedContainsMe: function(ctrl) {
    return ctrl.data.applicants.filter(function(a) {
      return a.accepted && a.player.id === ctrl.userId;
    }).length > 0
  },
  myCurrentPairing: function(ctrl) {
    if (!ctrl.userId) return null;
    return ctrl.data.pairings.find(function(p) {
      return p.game.status < status.ids.mate && p.player.id === ctrl.userId;
    });
  }
};

},{"game/status":22}],26:[function(require,module,exports){
var m = require('mithril');

module.exports = function(send, ctrl) {

  this.send = send;

  var handlers = {
    reload: function(data) {
      ctrl.reload(data);
      m.redraw();
    },
    aborted: function() {
      lichess.reload();
    },
    hostGame: function(gameId) {
      ctrl.data.host.gameId = gameId;
      m.redraw();
    }
  };

  this.receive = function(type, data) {
    if (handlers[type]) {
      handlers[type](data);
      return true;
    }
    return false;
  }.bind(this);
};

},{"mithril":1}],27:[function(require,module,exports){
var m = require('mithril');
var simul = require('./simul');
var xhr = require('./xhr');

function enrichText(text) {
  return m.trust(autolink(lichess.escapeHtml(text), toLink).replace(newLineRegex, '<br>'));
}
function autolink(str, callback) {
  return str.replace(linkRegex, function(_, space, url) { return space + callback(url) });
}
function toLink(url) {
  return '<a target="_blank" rel="nofollow" href="' + url + '">' + url.replace(/https?:\/\//, '') + '</a>';
}
// from ui/analyse
var linkRegex = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[-A-Z0-9+\u0026\u2019@#/%?=()~_|!:,.;]*[-A-Z0-9+\u0026@#/%=~()_|])/gi;
var newLineRegex = /\n/g;

function editor(ctrl) {
  return m('div.editor', [
    m('button.button.button-empty.open', {
      onclick: ctrl.text.toggle
    }, 'Edit'),
    ctrl.text.editing () ? m('form', {
      onsubmit: function(e) {
        xhr.setText(ctrl, e.target.querySelector('textarea').value);
        ctrl.text.toggle();
        return false;
      }
    }, [
      m('textarea', ctrl.data.text),
      m('button.button.save', {
        type: 'submit'
      }, 'Save')
    ]) : null
  ]);
}

module.exports = {
  ctrl: function() {
    var editing = false;
    return {
      toggle: function() {
        editing = !editing;
      },
      editing: function() {
        return editing;
      }
    };
  },
  view: function(ctrl) {
    return ctrl.data.text || simul.createdByMe(ctrl) ?
      m('div.simul-text' + (ctrl.text.editing() ? '.editing' : ''), [
        m('p', enrichText(ctrl.data.text)),
        simul.createdByMe(ctrl) ? editor(ctrl) : null
      ]) : null;
  }
}

},{"./simul":25,"./xhr":35,"mithril":1}],28:[function(require,module,exports){
var m = require('mithril');
var simul = require('../simul');
var util = require('./util');
var text = require('../text');
var xhr = require('../xhr');

function byName(a, b) {
  return a.player.name > b.player.name
}

function randomButton(ctrl, candidates) {
  return candidates.length ? m('a.button.text', {
    'data-icon': 'E',
    onclick: function() {
      var randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      xhr.accept(randomCandidate.player.id)(ctrl);
    }
  }, 'Accept random candidate') : null;
}

function startOrCancel(ctrl, accepted) {
  return accepted.length > 1 ?
    m('a.button.button-green.text', {
      'data-icon': 'G',
      onclick: function() { xhr.start(ctrl) }
    }, 'Start') : m('a.button.button-red.text', {
      'data-icon': 'L',
      onclick: function() {
        if (confirm('Delete this simul?')) xhr.abort(ctrl);
      }
    }, ctrl.trans('cancel'));
}

module.exports = function(ctrl) {
  var candidates = simul.candidates(ctrl).sort(byName);
  var accepted = simul.accepted(ctrl).sort(byName);
  var isHost = simul.createdByMe(ctrl);
  return [
    m('div.box__top', [
      util.title(ctrl),
      m('div.box__top__actions', [
        ctrl.userId ? (
          simul.createdByMe(ctrl) ? [
            startOrCancel(ctrl, accepted),
            randomButton(ctrl, candidates)
          ] : (
            simul.containsMe(ctrl) ? m('a.button', {
              onclick: function() { xhr.withdraw(ctrl) }
            }, ctrl.trans('withdraw')) : m('a.button.text' + (ctrl.teamBlock ? '.disabled' : ''), {
              disabled: ctrl.teamBlock,
              'data-icon': 'G',
              onclick: ctrl.teamBlock ? undefined : () => {
                if (ctrl.data.variants.length === 1)
                  xhr.join(ctrl, ctrl.data.variants[0].key);
                else {
                  $.modal($('.simul .continue-with'));
                  $('#modal-wrap .continue-with a').click(function() {
                    $.modal.close();
                    xhr.join(ctrl, $(this).data('variant'));
                  });
                }
              }
            },
              ctrl.teamBlock ? ctrl.trans('mustBeInTeam', ctrl.data.team.name) : ctrl.trans('join'))
          )) : m('a.button.text', {
            'data-icon': 'G',
            href: '/login?referrer=' + window.location.pathname
          }, ctrl.trans('signIn'))
      ])
    ]),
    text.view(ctrl),
    simul.acceptedContainsMe(ctrl) ? m('p.instructions',
      'You have been selected! Hold still, the simul is about to begin.'
    ) : (
      (simul.createdByMe(ctrl) && ctrl.data.applicants.length < 6) ? m('p.instructions',
        'Share this page URL to let people enter the simul!'
      ) : null
    ),
    m('div.halves',
      m('div.half.candidates',
        m('table.slist.slist-pad',
          m('thead', m('tr', m('th', {
            colspan: 3
          }, [
            m('strong', candidates.length),
            ' candidate players'
          ]))),
          m('tbody', candidates.map(function(applicant) {
            var variant = util.playerVariant(ctrl, applicant.player);
            return m('tr', {
              key: applicant.player.id,
              class: ctrl.userId === applicant.player.id ? 'me' : ''
            }, [
              m('td', util.player(applicant.player)),
              m('td.variant', {
                'data-icon': variant.icon
              }),
              m('td.action', isHost ? m('a.button', {
                'data-icon': 'E',
                title: 'Accept',
                onclick: function() {
                  xhr.accept(applicant.player.id)(ctrl);
                }
              }) : null)
            ])
          })))
      ),
      m('div.half.accepted', [
        m('table.slist.user_list',
          m('thead', [
            m('tr', m('th', {
              colspan: 3
            }, [
              m('strong', accepted.length),
              ' accepted players'
            ])), (simul.createdByMe(ctrl) && candidates.length && !accepted.length) ? m('tr.help',
              m('th',
                'Now you get to accept some players, then start the simul')) : null
          ]),
          m('tbody', accepted.map(function(applicant) {
            var variant = util.playerVariant(ctrl, applicant.player);
            return m('tr', {
              key: applicant.player.id,
              class: ctrl.userId === applicant.player.id ? 'me' : ''
            }, [
              m('td', util.player(applicant.player)),
              m('td.variant', {
                'data-icon': variant.icon
              }),
              m('td.action', isHost ? m('a.button.button-red', {
                'data-icon': 'L',
                onclick: function() {
                  xhr.reject(applicant.player.id)(ctrl);
                }
              }) : null)
            ])
          })))
      ])
    ),
    m('blockquote.pull-quote', [
      m('p', ctrl.data.quote.text),
      m('footer', ctrl.data.quote.author)
    ]),
    m('div.continue-with.none', ctrl.data.variants.map(function(variant) {
      return m('a.button', {
        'data-variant': variant.key
      }, variant.name);
    }))
  ];
};

},{"../simul":25,"../text":27,"../xhr":35,"./util":34,"mithril":1}],29:[function(require,module,exports){
var m = require('mithril');
var util = require('./util');
var text = require('../text');
var pairings = require('./pairings');
var results = require('./results');

module.exports = function(ctrl) {
  return [
    m('div.box__top', [
      util.title(ctrl),
      m('div.box__top__actions', m('div.finished', ctrl.trans('finished')))
    ]),
    text.view(ctrl),
    results(ctrl),
    pairings(ctrl)
  ];
};

},{"../text":27,"./pairings":31,"./results":32,"./util":34,"mithril":1}],30:[function(require,module,exports){
var m = require('mithril');

var created = require('./created');
var started = require('./started');
var finished = require('./finished');

module.exports = function(ctrl) {
  var handler;
  if (ctrl.data.isRunning) handler = started;
  else if (ctrl.data.isFinished) handler = finished;
  else handler = created;

  return [
    m('aside.simul__side', {
      config: function(el, done) {
        if (!done) {
          $(el).replaceWith(ctrl.env.$side);
          ctrl.env.chat && window.lichess.makeChat(ctrl.env.chat);
        }
      }
    }),
    m('div.simul__main.box', handler(ctrl)),
    m('div.chat__members.none', {
      config(el, done) {
        if (!done) $(el).watchers();
      }
    }, m('span.list'))
  ];
};

},{"./created":28,"./finished":29,"./started":33,"mithril":1}],31:[function(require,module,exports){
var m = require('mithril');
var util = require('./util');
var status = require('game/status');

function miniPairing(ctrl) {
  return function(pairing) {
    var game = pairing.game;
    var player = pairing.player;
    var result = pairing.game.status >= status.ids.mate ? (
      pairing.winnerColor === 'white' ? '1-0' : (pairing.winnerColor === 'black' ? '0-1' : '½/½')
    ) : '*';
    return m('a', {
      href: '/' + game.id + '/' + game.orient,
      class: ctrl.data.host.gameId === game.id ? 'host' : ''
    }, [
      m('span', {
        class: 'mini-board mini-board-' + game.id + ' parse-fen is2d',
        'data-color': game.orient,
        'data-fen': game.fen,
        'data-lastmove': game.lastMove,
        config: function(el, isUpdate) {
          if (!isUpdate) lichess.parseFen($(el));
        }
      }, m('div.cg-wrap')),
      m('span.vstext', [
        m('span.vstext__pl', [
          util.playerVariant(ctrl, player).name,
          m('br'),
          result
        ]),
        m('div.vstext__op', [
          player.name,
          m('br'),
          player.title ? player.title + ' ' : '',
          player.rating
        ])
      ])
    ]);
  };
}

module.exports = function(ctrl) {
  return m('div.game-list.now-playing.box__pad', ctrl.data.pairings.map(miniPairing(ctrl)));
};

},{"./util":34,"game/status":22,"mithril":1}],32:[function(require,module,exports){
var m = require('mithril');
var status = require('game/status');

var NumberFirstRegex = /^(\d+)\s(.+)$/;
var NumberLastRegex = /^(.+)\s(\d+)$/;

function splitNumber(s) {
  var found;
  if ((found = s.match(NumberFirstRegex))) return [
    m('div.number', found[1]),
    m('div.text', found[2])
  ];
  if ((found = s.match(NumberLastRegex))) return [
    m('div.number', found[2]),
    m('div.text', found[1])
  ];
  return m('div.text', s);
}

function trans(ctrl, key, cond) {
  return splitNumber(ctrl.trans.plural(key, ctrl.data.pairings.filter(cond).length));
}

module.exports = function(ctrl) {
  return m('div.results', [
    m('div', trans(ctrl, 'nbPlaying', function(p) { return p.game.status < status.ids.mate })),
    m('div', trans(ctrl, 'nbWins', function(p) { return p.wins === false })),
    m('div', trans(ctrl, 'nbDraws', function(p) { return p.game.status >= status.ids.mate && p.wins === null })),
    m('div', trans(ctrl, 'nbLosses', function(p) { return p.wins === true }))
  ]);
};

},{"game/status":22,"mithril":1}],33:[function(require,module,exports){
var util = require('./util');
var text = require('../text');
var pairings = require('./pairings');
var results = require('./results');

module.exports = function(ctrl) {
  return [
    util.title(ctrl),
    text.view(ctrl),
    results(ctrl),
    pairings(ctrl)
  ];
};

},{"../text":27,"./pairings":31,"./results":32,"./util":34}],34:[function(require,module,exports){
var m = require('mithril');

function playerHtml(p) {
  var html = '<a class="text ulpt user-link online" href="/@/' + p.name + '">';
  html += p.patron ? '<i class="line patron"></i>' : '<i class="line"></i>';
  html += (p.title ? p.title + ' ' : '') + p.name;
  if (p.rating) html += '<em>' + p.rating + (p.provisional ? '?' : '') + '</em>';
  html += '</a>';
  return html;
}

module.exports = {
  title: function(ctrl) {
    return m('h1', [
      ctrl.data.fullName,
      m('span.author', m.trust(ctrl.trans('by', playerHtml(ctrl.data.host))))
    ]);
  },
  player: function(p) {
    return m.trust(playerHtml(p));
  },
  playerVariant: function(ctrl, p) {
    return ctrl.data.variants.find(function(v) {
      return v.key === p.variant;
    });
  }
};

},{"mithril":1}],35:[function(require,module,exports){
var m = require('mithril');

var xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
}

function partial() {
  return arguments[0].bind.apply(arguments[0], [null].concat(Array.prototype.slice.call(arguments, 1)));
}

function simulAction(action, ctrl) {
  return m.request({
    method: 'POST',
    url: '/simul/' + ctrl.data.id + '/' + action,
    config: xhrConfig
  }).then(null, function() {
    // when the simul no longer exists
    lichess.reload();
  });
}

module.exports = {
  ping: partial(simulAction, 'host-ping'),
  start: partial(simulAction, 'start'),
  abort: partial(simulAction, 'abort'),
  join: lichess.debounce(
    (ctrl, variantKey) => simulAction('join/' + variantKey, ctrl),
    4000,
    true
  ),
  withdraw: partial(simulAction, 'withdraw'),
  accept: function(user) {
    return partial(simulAction, 'accept/' + user)
  },
  reject: function(user) {
    return partial(simulAction, 'reject/' + user)
  },
  setText: function(ctrl, text) {
    return m.request({
      method: 'POST',
      url: '/simul/' + ctrl.data.id + '/set-text',
      config: xhrConfig,
      data: {
        text: text
      }
    });
  }
};

},{"mithril":1}]},{},[24])(24)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbWl0aHJpbC9taXRocmlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3NuYWJiZG9tL2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vaHRtbGRvbWFwaS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9pcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9jbGFzcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS9zbmFiYmRvbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS90aHVuay5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zbmFiYmRvbS92bm9kZS5qcyIsIi4uL2NoYXQvc3JjL2N0cmwudHMiLCIuLi9jaGF0L3NyYy9kaXNjdXNzaW9uLnRzIiwiLi4vY2hhdC9zcmMvZW5oYW5jZS50cyIsIi4uL2NoYXQvc3JjL21haW4udHMiLCIuLi9jaGF0L3NyYy9tb2RlcmF0aW9uLnRzIiwiLi4vY2hhdC9zcmMvbm90ZS50cyIsIi4uL2NoYXQvc3JjL3ByZXNldC50cyIsIi4uL2NoYXQvc3JjL3NwYW0udHMiLCIuLi9jaGF0L3NyYy91dGlsLnRzIiwiLi4vY2hhdC9zcmMvdmlldy50cyIsIi4uL2NoYXQvc3JjL3hoci50cyIsIi4uL2NvbW1vbi9zcmMvY29tbW9uLnRzIiwiLi4vZ2FtZS9zcmMvc3RhdHVzLnRzIiwic3JjL2N0cmwuanMiLCJzcmMvbWFpbi5qcyIsInNyYy9zaW11bC5qcyIsInNyYy9zb2NrZXQuanMiLCJzcmMvdGV4dC5qcyIsInNyYy92aWV3L2NyZWF0ZWQuanMiLCJzcmMvdmlldy9maW5pc2hlZC5qcyIsInNyYy92aWV3L21haW4uanMiLCJzcmMvdmlldy9wYWlyaW5ncy5qcyIsInNyYy92aWV3L3Jlc3VsdHMuanMiLCJzcmMvdmlldy9zdGFydGVkLmpzIiwic3JjL3ZpZXcvdXRpbC5qcyIsInNyYy94aHIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOTNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7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QyxFQUFFLEtBQUssV0FBRyxDQUFDLE9BQU8sQ0FBQztBQUM3QyxDQUFDO0FBRkQsMEJBRUM7QUFFRCxTQUFnQixPQUFPLENBQUMsSUFBYztJQUNwQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRkQsMEJBRUM7OztBQ2pDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBtID0gKGZ1bmN0aW9uIGFwcCh3aW5kb3csIHVuZGVmaW5lZCkge1xyXG5cdFwidXNlIHN0cmljdFwiO1xyXG4gIFx0dmFyIFZFUlNJT04gPSBcInYwLjIuMS1saWxhXCI7XHJcblx0ZnVuY3Rpb24gaXNGdW5jdGlvbihvYmplY3QpIHtcclxuXHRcdHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSBcImZ1bmN0aW9uXCI7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGlzT2JqZWN0KG9iamVjdCkge1xyXG5cdFx0cmV0dXJuIHR5cGUuY2FsbChvYmplY3QpID09PSBcIltvYmplY3QgT2JqZWN0XVwiO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBpc1N0cmluZyhvYmplY3QpIHtcclxuXHRcdHJldHVybiB0eXBlLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIjtcclxuXHR9XHJcblx0dmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmplY3QpIHtcclxuXHRcdHJldHVybiB0eXBlLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xyXG5cdH07XHJcblx0dmFyIHR5cGUgPSB7fS50b1N0cmluZztcclxuXHR2YXIgcGFyc2VyID0gLyg/OihefCN8XFwuKShbXiNcXC5cXFtcXF1dKykpfChcXFsuKz9cXF0pL2csIGF0dHJQYXJzZXIgPSAvXFxbKC4rPykoPzo9KFwifCd8KSguKj8pXFwyKT9cXF0vO1xyXG5cdHZhciB2b2lkRWxlbWVudHMgPSAvXihBUkVBfEJBU0V8QlJ8Q09MfENPTU1BTkR8RU1CRUR8SFJ8SU1HfElOUFVUfEtFWUdFTnxMSU5LfE1FVEF8UEFSQU18U09VUkNFfFRSQUNLfFdCUikkLztcclxuXHR2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xyXG5cclxuXHQvLyBjYWNoaW5nIGNvbW1vbmx5IHVzZWQgdmFyaWFibGVzXHJcblx0dmFyICRkb2N1bWVudCwgJGxvY2F0aW9uLCAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCAkY2FuY2VsQW5pbWF0aW9uRnJhbWU7XHJcblxyXG5cdC8vIHNlbGYgaW52b2tpbmcgZnVuY3Rpb24gbmVlZGVkIGJlY2F1c2Ugb2YgdGhlIHdheSBtb2NrcyB3b3JrXHJcblx0ZnVuY3Rpb24gaW5pdGlhbGl6ZSh3aW5kb3cpIHtcclxuXHRcdCRkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudDtcclxuXHRcdCRsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcclxuXHRcdCRjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cuY2xlYXJUaW1lb3V0O1xyXG5cdFx0JHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LnNldFRpbWVvdXQ7XHJcblx0fVxyXG5cclxuXHRpbml0aWFsaXplKHdpbmRvdyk7XHJcblxyXG5cdG0udmVyc2lvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIFZFUlNJT047XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogQHR5cGVkZWYge1N0cmluZ30gVGFnXHJcblx0ICogQSBzdHJpbmcgdGhhdCBsb29rcyBsaWtlIC0+IGRpdi5jbGFzc25hbWUjaWRbcGFyYW09b25lXVtwYXJhbTI9dHdvXVxyXG5cdCAqIFdoaWNoIGRlc2NyaWJlcyBhIERPTSBub2RlXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtUYWd9IFRoZSBET00gbm9kZSB0YWdcclxuXHQgKiBAcGFyYW0ge09iamVjdD1bXX0gb3B0aW9uYWwga2V5LXZhbHVlIHBhaXJzIHRvIGJlIG1hcHBlZCB0byBET00gYXR0cnNcclxuXHQgKiBAcGFyYW0gey4uLm1Ob2RlPVtdfSBaZXJvIG9yIG1vcmUgTWl0aHJpbCBjaGlsZCBub2Rlcy4gQ2FuIGJlIGFuIGFycmF5LCBvciBzcGxhdCAob3B0aW9uYWwpXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtKHRhZywgcGFpcnMpIHtcclxuXHRcdGZvciAodmFyIGFyZ3MgPSBbXSwgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0YXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XHJcblx0XHR9XHJcblx0XHRpZiAoaXNPYmplY3QodGFnKSkgcmV0dXJuIHBhcmFtZXRlcml6ZSh0YWcsIGFyZ3MpO1xyXG5cdFx0dmFyIGhhc0F0dHJzID0gcGFpcnMgIT0gbnVsbCAmJiBpc09iamVjdChwYWlycykgJiYgIShcInRhZ1wiIGluIHBhaXJzIHx8IFwidmlld1wiIGluIHBhaXJzIHx8IFwic3VidHJlZVwiIGluIHBhaXJzKTtcclxuXHRcdHZhciBhdHRycyA9IGhhc0F0dHJzID8gcGFpcnMgOiB7fTtcclxuXHRcdHZhciBjbGFzc0F0dHJOYW1lID0gXCJjbGFzc1wiIGluIGF0dHJzID8gXCJjbGFzc1wiIDogXCJjbGFzc05hbWVcIjtcclxuXHRcdHZhciBjZWxsID0ge3RhZzogXCJkaXZcIiwgYXR0cnM6IHt9fTtcclxuXHRcdHZhciBtYXRjaCwgY2xhc3NlcyA9IFtdO1xyXG5cdFx0aWYgKCFpc1N0cmluZyh0YWcpKSB0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RvciBpbiBtKHNlbGVjdG9yLCBhdHRycywgY2hpbGRyZW4pIHNob3VsZCBiZSBhIHN0cmluZ1wiKTtcclxuXHRcdHdoaWxlICgobWF0Y2ggPSBwYXJzZXIuZXhlYyh0YWcpKSAhPSBudWxsKSB7XHJcblx0XHRcdGlmIChtYXRjaFsxXSA9PT0gXCJcIiAmJiBtYXRjaFsyXSkgY2VsbC50YWcgPSBtYXRjaFsyXTtcclxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbMV0gPT09IFwiI1wiKSBjZWxsLmF0dHJzLmlkID0gbWF0Y2hbMl07XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzFdID09PSBcIi5cIikgY2xhc3Nlcy5wdXNoKG1hdGNoWzJdKTtcclxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbM11bMF0gPT09IFwiW1wiKSB7XHJcblx0XHRcdFx0dmFyIHBhaXIgPSBhdHRyUGFyc2VyLmV4ZWMobWF0Y2hbM10pO1xyXG5cdFx0XHRcdGNlbGwuYXR0cnNbcGFpclsxXV0gPSBwYWlyWzNdIHx8IChwYWlyWzJdID8gXCJcIiA6dHJ1ZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgY2hpbGRyZW4gPSBoYXNBdHRycyA/IGFyZ3Muc2xpY2UoMSkgOiBhcmdzO1xyXG5cdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBpc0FycmF5KGNoaWxkcmVuWzBdKSkge1xyXG5cdFx0XHRjZWxsLmNoaWxkcmVuID0gY2hpbGRyZW5bMF07XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y2VsbC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIGF0dHJOYW1lIGluIGF0dHJzKSB7XHJcblx0XHRcdGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShhdHRyTmFtZSkpIHtcclxuXHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IGNsYXNzQXR0ck5hbWUgJiYgYXR0cnNbYXR0ck5hbWVdICE9IG51bGwgJiYgYXR0cnNbYXR0ck5hbWVdICE9PSBcIlwiKSB7XHJcblx0XHRcdFx0XHRjbGFzc2VzLnB1c2goYXR0cnNbYXR0ck5hbWVdKTtcclxuXHRcdFx0XHRcdGNlbGwuYXR0cnNbYXR0ck5hbWVdID0gXCJcIjsgLy9jcmVhdGUga2V5IGluIGNvcnJlY3QgaXRlcmF0aW9uIG9yZGVyXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgY2VsbC5hdHRyc1thdHRyTmFtZV0gPSBhdHRyc1thdHRyTmFtZV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChjbGFzc2VzLmxlbmd0aCkgY2VsbC5hdHRyc1tjbGFzc0F0dHJOYW1lXSA9IGNsYXNzZXMuam9pbihcIiBcIik7XHJcblxyXG5cdFx0cmV0dXJuIGNlbGw7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGZvckVhY2gobGlzdCwgZikge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aCAmJiAhZihsaXN0W2ldLCBpKyspOykge31cclxuXHR9XHJcblx0ZnVuY3Rpb24gZm9yS2V5cyhsaXN0LCBmKSB7XHJcblx0XHRmb3JFYWNoKGxpc3QsIGZ1bmN0aW9uIChhdHRycywgaSkge1xyXG5cdFx0XHRyZXR1cm4gKGF0dHJzID0gYXR0cnMgJiYgYXR0cnMuYXR0cnMpICYmIGF0dHJzLmtleSAhPSBudWxsICYmIGYoYXR0cnMsIGkpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8vIFRoaXMgZnVuY3Rpb24gd2FzIGNhdXNpbmcgZGVvcHRzIGluIENocm9tZS5cclxuXHQvLyBXZWxsIG5vIGxvbmdlclxyXG5cdGZ1bmN0aW9uIGRhdGFUb1N0cmluZyhkYXRhKSB7XHJcbiAgICBpZiAoZGF0YSA9PSBudWxsKSByZXR1cm4gJyc7XHJcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSByZXR1cm4gZGF0YTtcclxuICAgIGlmIChkYXRhLnRvU3RyaW5nKCkgPT0gbnVsbCkgcmV0dXJuIFwiXCI7IC8vIHByZXZlbnQgcmVjdXJzaW9uIGVycm9yIG9uIEZGXHJcbiAgICByZXR1cm4gZGF0YTtcclxuXHR9XHJcblx0Ly8gVGhpcyBmdW5jdGlvbiB3YXMgY2F1c2luZyBkZW9wdHMgaW4gQ2hyb21lLlxyXG5cdGZ1bmN0aW9uIGluamVjdFRleHROb2RlKHBhcmVudEVsZW1lbnQsIGZpcnN0LCBpbmRleCwgZGF0YSkge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0aW5zZXJ0Tm9kZShwYXJlbnRFbGVtZW50LCBmaXJzdCwgaW5kZXgpO1xyXG5cdFx0XHRmaXJzdC5ub2RlVmFsdWUgPSBkYXRhO1xyXG5cdFx0fSBjYXRjaCAoZSkge30gLy9JRSBlcnJvbmVvdXNseSB0aHJvd3MgZXJyb3Igd2hlbiBhcHBlbmRpbmcgYW4gZW1wdHkgdGV4dCBub2RlIGFmdGVyIGEgbnVsbFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZmxhdHRlbihsaXN0KSB7XHJcblx0XHQvL3JlY3Vyc2l2ZWx5IGZsYXR0ZW4gYXJyYXlcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoaXNBcnJheShsaXN0W2ldKSkge1xyXG5cdFx0XHRcdGxpc3QgPSBsaXN0LmNvbmNhdC5hcHBseShbXSwgbGlzdCk7XHJcblx0XHRcdFx0Ly9jaGVjayBjdXJyZW50IGluZGV4IGFnYWluIGFuZCBmbGF0dGVuIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5lc3RlZCBhcnJheXMgYXQgdGhhdCBpbmRleFxyXG5cdFx0XHRcdGktLTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGxpc3Q7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBpbnNlcnROb2RlKHBhcmVudEVsZW1lbnQsIG5vZGUsIGluZGV4KSB7XHJcblx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2RlLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpO1xyXG5cdH1cclxuXHJcblx0dmFyIERFTEVUSU9OID0gMSwgSU5TRVJUSU9OID0gMiwgTU9WRSA9IDM7XHJcblxyXG5cdGZ1bmN0aW9uIGhhbmRsZUtleXNEaWZmZXIoZGF0YSwgZXhpc3RpbmcsIGNhY2hlZCwgcGFyZW50RWxlbWVudCkge1xyXG5cdFx0Zm9yS2V5cyhkYXRhLCBmdW5jdGlvbiAoa2V5LCBpKSB7XHJcblx0XHRcdGV4aXN0aW5nW2tleSA9IGtleS5rZXldID0gZXhpc3Rpbmdba2V5XSA/IHtcclxuXHRcdFx0XHRhY3Rpb246IE1PVkUsXHJcblx0XHRcdFx0aW5kZXg6IGksXHJcblx0XHRcdFx0ZnJvbTogZXhpc3Rpbmdba2V5XS5pbmRleCxcclxuXHRcdFx0XHRlbGVtZW50OiBjYWNoZWQubm9kZXNbZXhpc3Rpbmdba2V5XS5pbmRleF0gfHwgJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcclxuXHRcdFx0fSA6IHthY3Rpb246IElOU0VSVElPTiwgaW5kZXg6IGl9O1xyXG5cdFx0fSk7XHJcblx0XHR2YXIgYWN0aW9ucyA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgcHJvcCBpbiBleGlzdGluZykgYWN0aW9ucy5wdXNoKGV4aXN0aW5nW3Byb3BdKTtcclxuXHRcdHZhciBjaGFuZ2VzID0gYWN0aW9ucy5zb3J0KHNvcnRDaGFuZ2VzKSwgbmV3Q2FjaGVkID0gbmV3IEFycmF5KGNhY2hlZC5sZW5ndGgpO1xyXG5cdFx0bmV3Q2FjaGVkLm5vZGVzID0gY2FjaGVkLm5vZGVzLnNsaWNlKCk7XHJcblxyXG5cdFx0Zm9yRWFjaChjaGFuZ2VzLCBmdW5jdGlvbiAoY2hhbmdlKSB7XHJcblx0XHRcdHZhciBpbmRleCA9IGNoYW5nZS5pbmRleDtcclxuXHRcdFx0aWYgKGNoYW5nZS5hY3Rpb24gPT09IERFTEVUSU9OKSB7XHJcblx0XHRcdFx0Y2xlYXIoY2FjaGVkW2luZGV4XS5ub2RlcywgY2FjaGVkW2luZGV4XSk7XHJcblx0XHRcdFx0bmV3Q2FjaGVkLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGNoYW5nZS5hY3Rpb24gPT09IElOU0VSVElPTikge1xyXG5cdFx0XHRcdHZhciBkdW1teSA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdFx0XHRcdGR1bW15LmtleSA9IGRhdGFbaW5kZXhdLmF0dHJzLmtleTtcclxuXHRcdFx0XHRpbnNlcnROb2RlKHBhcmVudEVsZW1lbnQsIGR1bW15LCBpbmRleCk7XHJcblx0XHRcdFx0bmV3Q2FjaGVkLnNwbGljZShpbmRleCwgMCwge1xyXG5cdFx0XHRcdFx0YXR0cnM6IHtrZXk6IGRhdGFbaW5kZXhdLmF0dHJzLmtleX0sXHJcblx0XHRcdFx0XHRub2RlczogW2R1bW15XVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdG5ld0NhY2hlZC5ub2Rlc1tpbmRleF0gPSBkdW1teTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGNoYW5nZS5hY3Rpb24gPT09IE1PVkUpIHtcclxuXHRcdFx0XHR2YXIgY2hhbmdlRWxlbWVudCA9IGNoYW5nZS5lbGVtZW50O1xyXG5cdFx0XHRcdHZhciBtYXliZUNoYW5nZWQgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdO1xyXG5cdFx0XHRcdGlmIChtYXliZUNoYW5nZWQgIT09IGNoYW5nZUVsZW1lbnQgJiYgY2hhbmdlRWxlbWVudCAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2hhbmdlRWxlbWVudCwgbWF5YmVDaGFuZ2VkIHx8IG51bGwpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRuZXdDYWNoZWRbaW5kZXhdID0gY2FjaGVkW2NoYW5nZS5mcm9tXTtcclxuXHRcdFx0XHRuZXdDYWNoZWQubm9kZXNbaW5kZXhdID0gY2hhbmdlRWxlbWVudDtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIG5ld0NhY2hlZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRpZmZLZXlzKGRhdGEsIGNhY2hlZCwgZXhpc3RpbmcsIHBhcmVudEVsZW1lbnQpIHtcclxuXHRcdHZhciBrZXlzRGlmZmVyID0gZGF0YS5sZW5ndGggIT09IGNhY2hlZC5sZW5ndGg7XHJcblx0XHRpZiAoIWtleXNEaWZmZXIpIHtcclxuXHRcdFx0Zm9yS2V5cyhkYXRhLCBmdW5jdGlvbiAoYXR0cnMsIGkpIHtcclxuXHRcdFx0XHR2YXIgY2FjaGVkQ2VsbCA9IGNhY2hlZFtpXTtcclxuXHRcdFx0XHRyZXR1cm4ga2V5c0RpZmZlciA9IGNhY2hlZENlbGwgJiYgY2FjaGVkQ2VsbC5hdHRycyAmJiBjYWNoZWRDZWxsLmF0dHJzLmtleSAhPT0gYXR0cnMua2V5O1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ga2V5c0RpZmZlciA/IGhhbmRsZUtleXNEaWZmZXIoZGF0YSwgZXhpc3RpbmcsIGNhY2hlZCwgcGFyZW50RWxlbWVudCkgOiBjYWNoZWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaWZmQXJyYXkoZGF0YSwgY2FjaGVkLCBub2Rlcykge1xyXG5cdFx0Ly9kaWZmIHRoZSBhcnJheSBpdHNlbGZcclxuXHJcblx0XHQvL3VwZGF0ZSB0aGUgbGlzdCBvZiBET00gbm9kZXMgYnkgY29sbGVjdGluZyB0aGUgbm9kZXMgZnJvbSBlYWNoIGl0ZW1cclxuXHRcdGZvckVhY2goZGF0YSwgZnVuY3Rpb24gKF8sIGkpIHtcclxuXHRcdFx0aWYgKGNhY2hlZFtpXSAhPSBudWxsKSBub2Rlcy5wdXNoLmFwcGx5KG5vZGVzLCBjYWNoZWRbaV0ubm9kZXMpO1xyXG5cdFx0fSlcclxuXHRcdC8vcmVtb3ZlIGl0ZW1zIGZyb20gdGhlIGVuZCBvZiB0aGUgYXJyYXkgaWYgdGhlIG5ldyBhcnJheSBpcyBzaG9ydGVyIHRoYW4gdGhlIG9sZCBvbmUuIGlmIGVycm9ycyBldmVyIGhhcHBlbiBoZXJlLCB0aGUgaXNzdWUgaXMgbW9zdCBsaWtlbHlcclxuXHRcdC8vYSBidWcgaW4gdGhlIGNvbnN0cnVjdGlvbiBvZiB0aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgc29tZXdoZXJlIGVhcmxpZXIgaW4gdGhlIHByb2dyYW1cclxuXHRcdGZvckVhY2goY2FjaGVkLm5vZGVzLCBmdW5jdGlvbiAobm9kZSwgaSkge1xyXG5cdFx0XHRpZiAobm9kZS5wYXJlbnROb2RlICE9IG51bGwgJiYgbm9kZXMuaW5kZXhPZihub2RlKSA8IDApIGNsZWFyKFtub2RlXSwgW2NhY2hlZFtpXV0pO1xyXG5cdFx0fSlcclxuXHRcdGlmIChkYXRhLmxlbmd0aCA8IGNhY2hlZC5sZW5ndGgpIGNhY2hlZC5sZW5ndGggPSBkYXRhLmxlbmd0aDtcclxuXHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYnVpbGRBcnJheUtleXMoZGF0YSkge1xyXG5cdFx0dmFyIGd1aWQgPSAwO1xyXG5cdFx0Zm9yS2V5cyhkYXRhLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGZvckVhY2goZGF0YSwgZnVuY3Rpb24gKGF0dHJzKSB7XHJcblx0XHRcdFx0aWYgKChhdHRycyA9IGF0dHJzICYmIGF0dHJzLmF0dHJzKSAmJiBhdHRycy5rZXkgPT0gbnVsbCkgYXR0cnMua2V5ID0gXCJfX21pdGhyaWxfX1wiICsgZ3VpZCsrO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHRyZXR1cm4gMTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbWF5YmVSZWNyZWF0ZU9iamVjdChkYXRhLCBjYWNoZWQsIGRhdGFBdHRyS2V5cykge1xyXG5cdFx0Ly9pZiBhbiBlbGVtZW50IGlzIGRpZmZlcmVudCBlbm91Z2ggZnJvbSB0aGUgb25lIGluIGNhY2hlLCByZWNyZWF0ZSBpdFxyXG5cdFx0aWYgKGRhdGEudGFnICE9PSBjYWNoZWQudGFnIHx8XHJcblx0XHRcdFx0ZGF0YUF0dHJLZXlzLnNvcnQoKS5qb2luKCkgIT09IE9iamVjdC5rZXlzKGNhY2hlZC5hdHRycykuc29ydCgpLmpvaW4oKSB8fFxyXG5cdFx0XHRcdGRhdGEuYXR0cnMuaWQgIT09IGNhY2hlZC5hdHRycy5pZCB8fFxyXG5cdFx0XHRcdGRhdGEuYXR0cnMua2V5ICE9PSBjYWNoZWQuYXR0cnMua2V5IHx8XHJcblx0XHRcdFx0KG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT09IFwiYWxsXCIgJiYgKCFjYWNoZWQuY29uZmlnQ29udGV4dCB8fCBjYWNoZWQuY29uZmlnQ29udGV4dC5yZXRhaW4gIT09IHRydWUpKSB8fFxyXG5cdFx0XHRcdChtLnJlZHJhdy5zdHJhdGVneSgpID09PSBcImRpZmZcIiAmJiBjYWNoZWQuY29uZmlnQ29udGV4dCAmJiBjYWNoZWQuY29uZmlnQ29udGV4dC5yZXRhaW4gPT09IGZhbHNlKSkge1xyXG5cdFx0XHRpZiAoY2FjaGVkLm5vZGVzLmxlbmd0aCkgY2xlYXIoY2FjaGVkLm5vZGVzKTtcclxuXHRcdFx0aWYgKGNhY2hlZC5jb25maWdDb250ZXh0ICYmIGlzRnVuY3Rpb24oY2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQpKSBjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCgpO1xyXG5cdFx0XHRpZiAoY2FjaGVkLmNvbnRyb2xsZXJzKSB7XHJcblx0XHRcdFx0Zm9yRWFjaChjYWNoZWQuY29udHJvbGxlcnMsIGZ1bmN0aW9uIChjb250cm9sbGVyKSB7XHJcblx0XHRcdFx0XHRpZiAoY29udHJvbGxlci51bmxvYWQpIGNvbnRyb2xsZXIub251bmxvYWQoe3ByZXZlbnREZWZhdWx0OiBub29wfSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldE9iamVjdE5hbWVzcGFjZShkYXRhLCBuYW1lc3BhY2UpIHtcclxuXHRcdHJldHVybiBkYXRhLmF0dHJzLnhtbG5zID8gZGF0YS5hdHRycy54bWxucyA6XHJcblx0XHRcdGRhdGEudGFnID09PSBcInN2Z1wiID8gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIDpcclxuXHRcdFx0ZGF0YS50YWcgPT09IFwibWF0aFwiID8gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCIgOlxyXG5cdFx0XHRuYW1lc3BhY2U7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1bmxvYWRDYWNoZWRDb250cm9sbGVycyhjYWNoZWQsIHZpZXdzLCBjb250cm9sbGVycykge1xyXG5cdFx0aWYgKGNvbnRyb2xsZXJzLmxlbmd0aCkge1xyXG5cdFx0XHRjYWNoZWQudmlld3MgPSB2aWV3cztcclxuXHRcdFx0Y2FjaGVkLmNvbnRyb2xsZXJzID0gY29udHJvbGxlcnM7XHJcblx0XHRcdGZvckVhY2goY29udHJvbGxlcnMsIGZ1bmN0aW9uIChjb250cm9sbGVyKSB7XHJcblx0XHRcdFx0aWYgKGNvbnRyb2xsZXIub251bmxvYWQgJiYgY29udHJvbGxlci5vbnVubG9hZC4kb2xkKSBjb250cm9sbGVyLm9udW5sb2FkID0gY29udHJvbGxlci5vbnVubG9hZC4kb2xkO1xyXG5cdFx0XHRcdGlmIChwZW5kaW5nUmVxdWVzdHMgJiYgY29udHJvbGxlci5vbnVubG9hZCkge1xyXG5cdFx0XHRcdFx0dmFyIG9udW5sb2FkID0gY29udHJvbGxlci5vbnVubG9hZDtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXIub251bmxvYWQgPSBub29wO1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlci5vbnVubG9hZC4kb2xkID0gb251bmxvYWQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNjaGVkdWxlQ29uZmlnc1RvQmVDYWxsZWQoY29uZmlncywgZGF0YSwgbm9kZSwgaXNOZXcsIGNhY2hlZCkge1xyXG5cdFx0Ly9zY2hlZHVsZSBjb25maWdzIHRvIGJlIGNhbGxlZC4gVGhleSBhcmUgY2FsbGVkIGFmdGVyIGBidWlsZGBcclxuXHRcdC8vZmluaXNoZXMgcnVubmluZ1xyXG5cdFx0aWYgKGlzRnVuY3Rpb24oZGF0YS5hdHRycy5jb25maWcpKSB7XHJcblx0XHRcdHZhciBjb250ZXh0ID0gY2FjaGVkLmNvbmZpZ0NvbnRleHQgPSBjYWNoZWQuY29uZmlnQ29udGV4dCB8fCB7fTtcclxuXHJcblx0XHRcdC8vYmluZFxyXG5cdFx0XHRjb25maWdzLnB1c2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmV0dXJuIGRhdGEuYXR0cnMuY29uZmlnLmNhbGwoZGF0YSwgbm9kZSwgIWlzTmV3LCBjb250ZXh0LCBjYWNoZWQpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJ1aWxkVXBkYXRlZE5vZGUoY2FjaGVkLCBkYXRhLCBlZGl0YWJsZSwgaGFzS2V5cywgbmFtZXNwYWNlLCB2aWV3cywgY29uZmlncywgY29udHJvbGxlcnMpIHtcclxuXHRcdHZhciBub2RlID0gY2FjaGVkLm5vZGVzWzBdO1xyXG5cdFx0aWYgKGhhc0tleXMpIHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMsIGNhY2hlZC5hdHRycywgbmFtZXNwYWNlKTtcclxuXHRcdGNhY2hlZC5jaGlsZHJlbiA9IGJ1aWxkKG5vZGUsIGRhdGEudGFnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZGF0YS5jaGlsZHJlbiwgY2FjaGVkLmNoaWxkcmVuLCBmYWxzZSwgMCwgZGF0YS5hdHRycy5jb250ZW50ZWRpdGFibGUgPyBub2RlIDogZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XHJcblx0XHRjYWNoZWQubm9kZXMuaW50YWN0ID0gdHJ1ZTtcclxuXHJcblx0XHRpZiAoY29udHJvbGxlcnMubGVuZ3RoKSB7XHJcblx0XHRcdGNhY2hlZC52aWV3cyA9IHZpZXdzO1xyXG5cdFx0XHRjYWNoZWQuY29udHJvbGxlcnMgPSBjb250cm9sbGVycztcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbm9kZTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGhhbmRsZU5vbmV4aXN0ZW50Tm9kZXMoZGF0YSwgcGFyZW50RWxlbWVudCwgaW5kZXgpIHtcclxuXHRcdHZhciBub2RlcztcclxuXHRcdGlmIChkYXRhLiR0cnVzdGVkKSB7XHJcblx0XHRcdG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0bm9kZXMgPSBbJGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXTtcclxuXHRcdFx0aWYgKCFwYXJlbnRFbGVtZW50Lm5vZGVOYW1lLm1hdGNoKHZvaWRFbGVtZW50cykpIGluc2VydE5vZGUocGFyZW50RWxlbWVudCwgbm9kZXNbMF0sIGluZGV4KTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgY2FjaGVkID0gdHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIGRhdGEgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIGRhdGEgPT09IFwiYm9vbGVhblwiID8gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSkgOiBkYXRhO1xyXG5cdFx0Y2FjaGVkLm5vZGVzID0gbm9kZXM7XHJcblx0XHRyZXR1cm4gY2FjaGVkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVhdHRhY2hOb2RlcyhkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIGVkaXRhYmxlLCBpbmRleCwgcGFyZW50VGFnKSB7XHJcblx0XHR2YXIgbm9kZXMgPSBjYWNoZWQubm9kZXM7XHJcblx0XHRpZiAoIWVkaXRhYmxlIHx8IGVkaXRhYmxlICE9PSAkZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xyXG5cdFx0XHRpZiAoZGF0YS4kdHJ1c3RlZCkge1xyXG5cdFx0XHRcdGNsZWFyKG5vZGVzLCBjYWNoZWQpO1xyXG5cdFx0XHRcdG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly9jb3JuZXIgY2FzZTogcmVwbGFjaW5nIHRoZSBub2RlVmFsdWUgb2YgYSB0ZXh0IG5vZGUgdGhhdCBpcyBhIGNoaWxkIG9mIGEgdGV4dGFyZWEvY29udGVudGVkaXRhYmxlIGRvZXNuJ3Qgd29ya1xyXG5cdFx0XHQvL3dlIG5lZWQgdG8gdXBkYXRlIHRoZSB2YWx1ZSBwcm9wZXJ0eSBvZiB0aGUgcGFyZW50IHRleHRhcmVhIG9yIHRoZSBpbm5lckhUTUwgb2YgdGhlIGNvbnRlbnRlZGl0YWJsZSBlbGVtZW50IGluc3RlYWRcclxuXHRcdFx0ZWxzZSBpZiAocGFyZW50VGFnID09PSBcInRleHRhcmVhXCIpIHtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50LnZhbHVlID0gZGF0YTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChlZGl0YWJsZSkge1xyXG5cdFx0XHRcdGVkaXRhYmxlLmlubmVySFRNTCA9IGRhdGE7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0Ly93YXMgYSB0cnVzdGVkIHN0cmluZ1xyXG5cdFx0XHRcdGlmIChub2Rlc1swXS5ub2RlVHlwZSA9PT0gMSB8fCBub2Rlcy5sZW5ndGggPiAxKSB7XHJcblx0XHRcdFx0XHRjbGVhcihjYWNoZWQubm9kZXMsIGNhY2hlZCk7XHJcblx0XHRcdFx0XHRub2RlcyA9IFskZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpbmplY3RUZXh0Tm9kZShwYXJlbnRFbGVtZW50LCBub2Rlc1swXSwgaW5kZXgsIGRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRjYWNoZWQgPSBuZXcgZGF0YS5jb25zdHJ1Y3RvcihkYXRhKTtcclxuXHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzO1xyXG5cdFx0cmV0dXJuIGNhY2hlZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGhhbmRsZVRleHQoY2FjaGVkLCBkYXRhLCBpbmRleCwgcGFyZW50RWxlbWVudCwgc2hvdWxkUmVhdHRhY2gsIGVkaXRhYmxlLCBwYXJlbnRUYWcpIHtcclxuXHRcdC8vaGFuZGxlIHRleHQgbm9kZXNcclxuXHRcdHJldHVybiBjYWNoZWQubm9kZXMubGVuZ3RoID09PSAwID8gaGFuZGxlTm9uZXhpc3RlbnROb2RlcyhkYXRhLCBwYXJlbnRFbGVtZW50LCBpbmRleCkgOlxyXG5cdFx0XHRjYWNoZWQudmFsdWVPZigpICE9PSBkYXRhLnZhbHVlT2YoKSB8fCBzaG91bGRSZWF0dGFjaCA9PT0gdHJ1ZSA/XHJcblx0XHRcdFx0cmVhdHRhY2hOb2RlcyhkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIGVkaXRhYmxlLCBpbmRleCwgcGFyZW50VGFnKSA6XHJcblx0XHRcdChjYWNoZWQubm9kZXMuaW50YWN0ID0gdHJ1ZSwgY2FjaGVkKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFN1YkFycmF5Q291bnQoaXRlbSkge1xyXG5cdFx0aWYgKGl0ZW0uJHRydXN0ZWQpIHtcclxuXHRcdFx0Ly9maXggb2Zmc2V0IG9mIG5leHQgZWxlbWVudCBpZiBpdGVtIHdhcyBhIHRydXN0ZWQgc3RyaW5nIHcvIG1vcmUgdGhhbiBvbmUgaHRtbCBlbGVtZW50XHJcblx0XHRcdC8vdGhlIGZpcnN0IGNsYXVzZSBpbiB0aGUgcmVnZXhwIG1hdGNoZXMgZWxlbWVudHNcclxuXHRcdFx0Ly90aGUgc2Vjb25kIGNsYXVzZSAoYWZ0ZXIgdGhlIHBpcGUpIG1hdGNoZXMgdGV4dCBub2Rlc1xyXG5cdFx0XHR2YXIgbWF0Y2ggPSBpdGVtLm1hdGNoKC88W15cXC9dfFxcPlxccypbXjxdL2cpO1xyXG5cdFx0XHRpZiAobWF0Y2ggIT0gbnVsbCkgcmV0dXJuIG1hdGNoLmxlbmd0aDtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKGlzQXJyYXkoaXRlbSkpIHtcclxuXHRcdFx0cmV0dXJuIGl0ZW0ubGVuZ3RoO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIDE7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBidWlsZEFycmF5KGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgaW5kZXgsIHBhcmVudFRhZywgc2hvdWxkUmVhdHRhY2gsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIHtcclxuXHRcdGRhdGEgPSBmbGF0dGVuKGRhdGEpO1xyXG5cdFx0dmFyIG5vZGVzID0gW10sIGludGFjdCA9IGNhY2hlZC5sZW5ndGggPT09IGRhdGEubGVuZ3RoLCBzdWJBcnJheUNvdW50ID0gMDtcclxuXHJcblx0XHQvL2tleXMgYWxnb3JpdGhtOiBzb3J0IGVsZW1lbnRzIHdpdGhvdXQgcmVjcmVhdGluZyB0aGVtIGlmIGtleXMgYXJlIHByZXNlbnRcclxuXHRcdC8vMSkgY3JlYXRlIGEgbWFwIG9mIGFsbCBleGlzdGluZyBrZXlzLCBhbmQgbWFyayBhbGwgZm9yIGRlbGV0aW9uXHJcblx0XHQvLzIpIGFkZCBuZXcga2V5cyB0byBtYXAgYW5kIG1hcmsgdGhlbSBmb3IgYWRkaXRpb25cclxuXHRcdC8vMykgaWYga2V5IGV4aXN0cyBpbiBuZXcgbGlzdCwgY2hhbmdlIGFjdGlvbiBmcm9tIGRlbGV0aW9uIHRvIGEgbW92ZVxyXG5cdFx0Ly80KSBmb3IgZWFjaCBrZXksIGhhbmRsZSBpdHMgY29ycmVzcG9uZGluZyBhY3Rpb24gYXMgbWFya2VkIGluIHByZXZpb3VzIHN0ZXBzXHJcblx0XHR2YXIgZXhpc3RpbmcgPSB7fSwgc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzID0gZmFsc2U7XHJcblx0XHRmb3JLZXlzKGNhY2hlZCwgZnVuY3Rpb24gKGF0dHJzLCBpKSB7XHJcblx0XHRcdHNob3VsZE1haW50YWluSWRlbnRpdGllcyA9IHRydWU7XHJcblx0XHRcdGV4aXN0aW5nW2NhY2hlZFtpXS5hdHRycy5rZXldID0ge2FjdGlvbjogREVMRVRJT04sIGluZGV4OiBpfTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGJ1aWxkQXJyYXlLZXlzKGRhdGEpO1xyXG5cdFx0aWYgKHNob3VsZE1haW50YWluSWRlbnRpdGllcykgY2FjaGVkID0gZGlmZktleXMoZGF0YSwgY2FjaGVkLCBleGlzdGluZywgcGFyZW50RWxlbWVudCk7XHJcblx0XHQvL2VuZCBrZXkgYWxnb3JpdGhtXHJcblxyXG5cdFx0dmFyIGNhY2hlQ291bnQgPSAwO1xyXG5cdFx0Ly9mYXN0ZXIgZXhwbGljaXRseSB3cml0dGVuXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHQvL2RpZmYgZWFjaCBpdGVtIGluIHRoZSBhcnJheVxyXG5cdFx0XHR2YXIgaXRlbSA9IGJ1aWxkKHBhcmVudEVsZW1lbnQsIHBhcmVudFRhZywgY2FjaGVkLCBpbmRleCwgZGF0YVtpXSwgY2FjaGVkW2NhY2hlQ291bnRdLCBzaG91bGRSZWF0dGFjaCwgaW5kZXggKyBzdWJBcnJheUNvdW50IHx8IHN1YkFycmF5Q291bnQsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpO1xyXG5cclxuXHRcdFx0aWYgKGl0ZW0gIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdGludGFjdCA9IGludGFjdCAmJiBpdGVtLm5vZGVzLmludGFjdDtcclxuXHRcdFx0XHRzdWJBcnJheUNvdW50ICs9IGdldFN1YkFycmF5Q291bnQoaXRlbSk7XHJcblx0XHRcdFx0Y2FjaGVkW2NhY2hlQ291bnQrK10gPSBpdGVtO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCFpbnRhY3QpIGRpZmZBcnJheShkYXRhLCBjYWNoZWQsIG5vZGVzKTtcclxuXHRcdHJldHVybiBjYWNoZWRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG1ha2VDYWNoZShkYXRhLCBjYWNoZWQsIGluZGV4LCBwYXJlbnRJbmRleCwgcGFyZW50Q2FjaGUpIHtcclxuXHRcdGlmIChjYWNoZWQgIT0gbnVsbCkge1xyXG5cdFx0XHRpZiAodHlwZS5jYWxsKGNhY2hlZCkgPT09IHR5cGUuY2FsbChkYXRhKSkgcmV0dXJuIGNhY2hlZDtcclxuXHJcblx0XHRcdGlmIChwYXJlbnRDYWNoZSAmJiBwYXJlbnRDYWNoZS5ub2Rlcykge1xyXG5cdFx0XHRcdHZhciBvZmZzZXQgPSBpbmRleCAtIHBhcmVudEluZGV4LCBlbmQgPSBvZmZzZXQgKyAoaXNBcnJheShkYXRhKSA/IGRhdGEgOiBjYWNoZWQubm9kZXMpLmxlbmd0aDtcclxuXHRcdFx0XHRjbGVhcihwYXJlbnRDYWNoZS5ub2Rlcy5zbGljZShvZmZzZXQsIGVuZCksIHBhcmVudENhY2hlLnNsaWNlKG9mZnNldCwgZW5kKSk7XHJcblx0XHRcdH0gZWxzZSBpZiAoY2FjaGVkLm5vZGVzKSB7XHJcblx0XHRcdFx0Y2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Y2FjaGVkID0gbmV3IGRhdGEuY29uc3RydWN0b3IoKTtcclxuXHRcdC8vaWYgY29uc3RydWN0b3IgY3JlYXRlcyBhIHZpcnR1YWwgZG9tIGVsZW1lbnQsIHVzZSBhIGJsYW5rIG9iamVjdFxyXG5cdFx0Ly9hcyB0aGUgYmFzZSBjYWNoZWQgbm9kZSBpbnN0ZWFkIG9mIGNvcHlpbmcgdGhlIHZpcnR1YWwgZWwgKCMyNzcpXHJcblx0XHRpZiAoY2FjaGVkLnRhZykgY2FjaGVkID0ge307XHJcblx0XHRjYWNoZWQubm9kZXMgPSBbXTtcclxuXHRcdHJldHVybiBjYWNoZWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb25zdHJ1Y3ROb2RlKGRhdGEsIG5hbWVzcGFjZSkge1xyXG5cdFx0cmV0dXJuIG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkID9cclxuXHRcdFx0ZGF0YS5hdHRycy5pcyA/ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KGRhdGEudGFnLCBkYXRhLmF0dHJzLmlzKSA6ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KGRhdGEudGFnKSA6XHJcblx0XHRcdGRhdGEuYXR0cnMuaXMgPyAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMuaXMpIDogJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdEF0dHJzKGRhdGEsIG5vZGUsIG5hbWVzcGFjZSwgaGFzS2V5cykge1xyXG5cdFx0cmV0dXJuIGhhc0tleXMgPyBzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCBkYXRhLmF0dHJzLCB7fSwgbmFtZXNwYWNlKSA6IGRhdGEuYXR0cnM7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb25zdHJ1Y3RDaGlsZHJlbihkYXRhLCBub2RlLCBjYWNoZWQsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIHtcclxuXHRcdHJldHVybiBkYXRhLmNoaWxkcmVuICE9IG51bGwgJiYgZGF0YS5jaGlsZHJlbi5sZW5ndGggPiAwID9cclxuXHRcdFx0YnVpbGQobm9kZSwgZGF0YS50YWcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBkYXRhLmNoaWxkcmVuLCBjYWNoZWQuY2hpbGRyZW4sIHRydWUsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gbm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIDpcclxuXHRcdFx0ZGF0YS5jaGlsZHJlbjtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlY29uc3RydWN0Q2FjaGVkKGRhdGEsIGF0dHJzLCBjaGlsZHJlbiwgbm9kZSwgbmFtZXNwYWNlLCB2aWV3cywgY29udHJvbGxlcnMpIHtcclxuXHRcdHZhciBjYWNoZWQgPSB7dGFnOiBkYXRhLnRhZywgYXR0cnM6IGF0dHJzLCBjaGlsZHJlbjogY2hpbGRyZW4sIG5vZGVzOiBbbm9kZV19O1xyXG5cdFx0dW5sb2FkQ2FjaGVkQ29udHJvbGxlcnMoY2FjaGVkLCB2aWV3cywgY29udHJvbGxlcnMpO1xyXG5cdFx0aWYgKGNhY2hlZC5jaGlsZHJlbiAmJiAhY2FjaGVkLmNoaWxkcmVuLm5vZGVzKSBjYWNoZWQuY2hpbGRyZW4ubm9kZXMgPSBbXTtcclxuXHRcdC8vZWRnZSBjYXNlOiBzZXR0aW5nIHZhbHVlIG9uIDxzZWxlY3Q+IGRvZXNuJ3Qgd29yayBiZWZvcmUgY2hpbGRyZW4gZXhpc3QsIHNvIHNldCBpdCBhZ2FpbiBhZnRlciBjaGlsZHJlbiBoYXZlIGJlZW4gY3JlYXRlZFxyXG5cdFx0aWYgKGRhdGEudGFnID09PSBcInNlbGVjdFwiICYmIFwidmFsdWVcIiBpbiBkYXRhLmF0dHJzKSBzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCB7dmFsdWU6IGRhdGEuYXR0cnMudmFsdWV9LCB7fSwgbmFtZXNwYWNlKTtcclxuXHRcdHJldHVybiBjYWNoZWRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldENvbnRyb2xsZXIodmlld3MsIHZpZXcsIGNhY2hlZENvbnRyb2xsZXJzLCBjb250cm9sbGVyKSB7XHJcblx0XHR2YXIgY29udHJvbGxlckluZGV4ID0gbS5yZWRyYXcuc3RyYXRlZ3koKSA9PT0gXCJkaWZmXCIgJiYgdmlld3MgPyB2aWV3cy5pbmRleE9mKHZpZXcpIDogLTE7XHJcblx0XHRyZXR1cm4gY29udHJvbGxlckluZGV4ID4gLTEgPyBjYWNoZWRDb250cm9sbGVyc1tjb250cm9sbGVySW5kZXhdIDpcclxuXHRcdFx0dHlwZW9mIGNvbnRyb2xsZXIgPT09IFwiZnVuY3Rpb25cIiA/IG5ldyBjb250cm9sbGVyKCkgOiB7fTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHVwZGF0ZUxpc3RzKHZpZXdzLCBjb250cm9sbGVycywgdmlldywgY29udHJvbGxlcikge1xyXG5cdFx0aWYgKGNvbnRyb2xsZXIub251bmxvYWQgIT0gbnVsbCkgdW5sb2FkZXJzLnB1c2goe2NvbnRyb2xsZXI6IGNvbnRyb2xsZXIsIGhhbmRsZXI6IGNvbnRyb2xsZXIub251bmxvYWR9KTtcclxuXHRcdHZpZXdzLnB1c2godmlldyk7XHJcblx0XHRjb250cm9sbGVycy5wdXNoKGNvbnRyb2xsZXIpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY2hlY2tWaWV3KGRhdGEsIHZpZXcsIGNhY2hlZCwgY2FjaGVkQ29udHJvbGxlcnMsIGNvbnRyb2xsZXJzLCB2aWV3cykge1xyXG5cdFx0dmFyIGNvbnRyb2xsZXIgPSBnZXRDb250cm9sbGVyKGNhY2hlZC52aWV3cywgdmlldywgY2FjaGVkQ29udHJvbGxlcnMsIGRhdGEuY29udHJvbGxlcik7XHJcblx0XHQvL0Zhc3RlciB0byBjb2VyY2UgdG8gbnVtYmVyIGFuZCBjaGVjayBmb3IgTmFOXHJcblx0XHR2YXIga2V5ID0gKyhkYXRhICYmIGRhdGEuYXR0cnMgJiYgZGF0YS5hdHRycy5rZXkpO1xyXG5cdFx0ZGF0YSA9IHBlbmRpbmdSZXF1ZXN0cyA9PT0gMCB8fCBmb3JjaW5nIHx8IGNhY2hlZENvbnRyb2xsZXJzICYmIGNhY2hlZENvbnRyb2xsZXJzLmluZGV4T2YoY29udHJvbGxlcikgPiAtMSA/IGRhdGEudmlldyhjb250cm9sbGVyKSA6IHt0YWc6IFwicGxhY2Vob2xkZXJcIn07XHJcblx0XHRpZiAoZGF0YS5zdWJ0cmVlID09PSBcInJldGFpblwiKSByZXR1cm4gY2FjaGVkO1xyXG5cdFx0aWYgKGtleSA9PT0ga2V5KSAoZGF0YS5hdHRycyA9IGRhdGEuYXR0cnMgfHwge30pLmtleSA9IGtleTtcclxuXHRcdHVwZGF0ZUxpc3RzKHZpZXdzLCBjb250cm9sbGVycywgdmlldywgY29udHJvbGxlcik7XHJcblx0XHRyZXR1cm4gZGF0YTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG1hcmtWaWV3cyhkYXRhLCBjYWNoZWQsIHZpZXdzLCBjb250cm9sbGVycykge1xyXG5cdFx0dmFyIGNhY2hlZENvbnRyb2xsZXJzID0gY2FjaGVkICYmIGNhY2hlZC5jb250cm9sbGVycztcclxuXHRcdHdoaWxlIChkYXRhLnZpZXcgIT0gbnVsbCkgZGF0YSA9IGNoZWNrVmlldyhkYXRhLCBkYXRhLnZpZXcuJG9yaWdpbmFsIHx8IGRhdGEudmlldywgY2FjaGVkLCBjYWNoZWRDb250cm9sbGVycywgY29udHJvbGxlcnMsIHZpZXdzKTtcclxuXHRcdHJldHVybiBkYXRhO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYnVpbGRPYmplY3QoZGF0YSwgY2FjaGVkLCBlZGl0YWJsZSwgcGFyZW50RWxlbWVudCwgaW5kZXgsIHNob3VsZFJlYXR0YWNoLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIHtcclxuXHRcdHZhciB2aWV3cyA9IFtdLCBjb250cm9sbGVycyA9IFtdO1xyXG5cdFx0ZGF0YSA9IG1hcmtWaWV3cyhkYXRhLCBjYWNoZWQsIHZpZXdzLCBjb250cm9sbGVycyk7XHJcblx0XHRpZiAoIWRhdGEudGFnICYmIGNvbnRyb2xsZXJzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50IHRlbXBsYXRlIG11c3QgcmV0dXJuIGEgdmlydHVhbCBlbGVtZW50LCBub3QgYW4gYXJyYXksIHN0cmluZywgZXRjLlwiKTtcclxuXHRcdGRhdGEuYXR0cnMgPSBkYXRhLmF0dHJzIHx8IHt9O1xyXG5cdFx0Y2FjaGVkLmF0dHJzID0gY2FjaGVkLmF0dHJzIHx8IHt9O1xyXG5cdFx0dmFyIGRhdGFBdHRyS2V5cyA9IE9iamVjdC5rZXlzKGRhdGEuYXR0cnMpO1xyXG5cdFx0dmFyIGhhc0tleXMgPSBkYXRhQXR0cktleXMubGVuZ3RoID4gKFwia2V5XCIgaW4gZGF0YS5hdHRycyA/IDEgOiAwKTtcclxuXHRcdG1heWJlUmVjcmVhdGVPYmplY3QoZGF0YSwgY2FjaGVkLCBkYXRhQXR0cktleXMpO1xyXG5cdFx0aWYgKCFpc1N0cmluZyhkYXRhLnRhZykpIHJldHVybjtcclxuXHRcdHZhciBpc05ldyA9IGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDA7XHJcblx0XHRuYW1lc3BhY2UgPSBnZXRPYmplY3ROYW1lc3BhY2UoZGF0YSwgbmFtZXNwYWNlKTtcclxuXHRcdHZhciBub2RlO1xyXG5cdFx0aWYgKGlzTmV3KSB7XHJcblx0XHRcdG5vZGUgPSBjb25zdHJ1Y3ROb2RlKGRhdGEsIG5hbWVzcGFjZSk7XHJcblx0XHRcdC8vc2V0IGF0dHJpYnV0ZXMgZmlyc3QsIHRoZW4gY3JlYXRlIGNoaWxkcmVuXHJcblx0XHRcdHZhciBhdHRycyA9IGNvbnN0cnVjdEF0dHJzKGRhdGEsIG5vZGUsIG5hbWVzcGFjZSwgaGFzS2V5cylcclxuXHRcdFx0dmFyIGNoaWxkcmVuID0gY29uc3RydWN0Q2hpbGRyZW4oZGF0YSwgbm9kZSwgY2FjaGVkLCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcclxuXHRcdFx0Y2FjaGVkID0gcmVjb25zdHJ1Y3RDYWNoZWQoZGF0YSwgYXR0cnMsIGNoaWxkcmVuLCBub2RlLCBuYW1lc3BhY2UsIHZpZXdzLCBjb250cm9sbGVycyk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0bm9kZSA9IGJ1aWxkVXBkYXRlZE5vZGUoY2FjaGVkLCBkYXRhLCBlZGl0YWJsZSwgaGFzS2V5cywgbmFtZXNwYWNlLCB2aWV3cywgY29uZmlncywgY29udHJvbGxlcnMpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGlzTmV3IHx8IHNob3VsZFJlYXR0YWNoID09PSB0cnVlICYmIG5vZGUgIT0gbnVsbCkgaW5zZXJ0Tm9kZShwYXJlbnRFbGVtZW50LCBub2RlLCBpbmRleCk7XHJcblx0XHQvL3NjaGVkdWxlIGNvbmZpZ3MgdG8gYmUgY2FsbGVkLiBUaGV5IGFyZSBjYWxsZWQgYWZ0ZXIgYGJ1aWxkYFxyXG5cdFx0Ly9maW5pc2hlcyBydW5uaW5nXHJcblx0XHRzY2hlZHVsZUNvbmZpZ3NUb0JlQ2FsbGVkKGNvbmZpZ3MsIGRhdGEsIG5vZGUsIGlzTmV3LCBjYWNoZWQpO1xyXG5cdFx0cmV0dXJuIGNhY2hlZFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBwYXJlbnRDYWNoZSwgcGFyZW50SW5kZXgsIGRhdGEsIGNhY2hlZCwgc2hvdWxkUmVhdHRhY2gsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSB7XHJcblx0XHQvL2BidWlsZGAgaXMgYSByZWN1cnNpdmUgZnVuY3Rpb24gdGhhdCBtYW5hZ2VzIGNyZWF0aW9uL2RpZmZpbmcvcmVtb3ZhbFxyXG5cdFx0Ly9vZiBET00gZWxlbWVudHMgYmFzZWQgb24gY29tcGFyaXNvbiBiZXR3ZWVuIGBkYXRhYCBhbmQgYGNhY2hlZGBcclxuXHRcdC8vdGhlIGRpZmYgYWxnb3JpdGhtIGNhbiBiZSBzdW1tYXJpemVkIGFzIHRoaXM6XHJcblx0XHQvLzEgLSBjb21wYXJlIGBkYXRhYCBhbmQgYGNhY2hlZGBcclxuXHRcdC8vMiAtIGlmIHRoZXkgYXJlIGRpZmZlcmVudCwgY29weSBgZGF0YWAgdG8gYGNhY2hlZGAgYW5kIHVwZGF0ZSB0aGUgRE9NXHJcblx0XHQvLyAgICBiYXNlZCBvbiB3aGF0IHRoZSBkaWZmZXJlbmNlIGlzXHJcblx0XHQvLzMgLSByZWN1cnNpdmVseSBhcHBseSB0aGlzIGFsZ29yaXRobSBmb3IgZXZlcnkgYXJyYXkgYW5kIGZvciB0aGVcclxuXHRcdC8vICAgIGNoaWxkcmVuIG9mIGV2ZXJ5IHZpcnR1YWwgZWxlbWVudFxyXG5cclxuXHRcdC8vdGhlIGBjYWNoZWRgIGRhdGEgc3RydWN0dXJlIGlzIGVzc2VudGlhbGx5IHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91c1xyXG5cdFx0Ly9yZWRyYXcncyBgZGF0YWAgZGF0YSBzdHJ1Y3R1cmUsIHdpdGggYSBmZXcgYWRkaXRpb25zOlxyXG5cdFx0Ly8tIGBjYWNoZWRgIGFsd2F5cyBoYXMgYSBwcm9wZXJ0eSBjYWxsZWQgYG5vZGVzYCwgd2hpY2ggaXMgYSBsaXN0IG9mXHJcblx0XHQvLyAgIERPTSBlbGVtZW50cyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGRhdGEgcmVwcmVzZW50ZWQgYnkgdGhlXHJcblx0XHQvLyAgIHJlc3BlY3RpdmUgdmlydHVhbCBlbGVtZW50XHJcblx0XHQvLy0gaW4gb3JkZXIgdG8gc3VwcG9ydCBhdHRhY2hpbmcgYG5vZGVzYCBhcyBhIHByb3BlcnR5IG9mIGBjYWNoZWRgLFxyXG5cdFx0Ly8gICBgY2FjaGVkYCBpcyAqYWx3YXlzKiBhIG5vbi1wcmltaXRpdmUgb2JqZWN0LCBpLmUuIGlmIHRoZSBkYXRhIHdhc1xyXG5cdFx0Ly8gICBhIHN0cmluZywgdGhlbiBjYWNoZWQgaXMgYSBTdHJpbmcgaW5zdGFuY2UuIElmIGRhdGEgd2FzIGBudWxsYCBvclxyXG5cdFx0Ly8gICBgdW5kZWZpbmVkYCwgY2FjaGVkIGlzIGBuZXcgU3RyaW5nKFwiXCIpYFxyXG5cdFx0Ly8tIGBjYWNoZWQgYWxzbyBoYXMgYSBgY29uZmlnQ29udGV4dGAgcHJvcGVydHksIHdoaWNoIGlzIHRoZSBzdGF0ZVxyXG5cdFx0Ly8gICBzdG9yYWdlIG9iamVjdCBleHBvc2VkIGJ5IGNvbmZpZyhlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KVxyXG5cdFx0Ly8tIHdoZW4gYGNhY2hlZGAgaXMgYW4gT2JqZWN0LCBpdCByZXByZXNlbnRzIGEgdmlydHVhbCBlbGVtZW50OyB3aGVuXHJcblx0XHQvLyAgIGl0J3MgYW4gQXJyYXksIGl0IHJlcHJlc2VudHMgYSBsaXN0IG9mIGVsZW1lbnRzOyB3aGVuIGl0J3MgYVxyXG5cdFx0Ly8gICBTdHJpbmcsIE51bWJlciBvciBCb29sZWFuLCBpdCByZXByZXNlbnRzIGEgdGV4dCBub2RlXHJcblxyXG5cdFx0Ly9gcGFyZW50RWxlbWVudGAgaXMgYSBET00gZWxlbWVudCB1c2VkIGZvciBXM0MgRE9NIEFQSSBjYWxsc1xyXG5cdFx0Ly9gcGFyZW50VGFnYCBpcyBvbmx5IHVzZWQgZm9yIGhhbmRsaW5nIGEgY29ybmVyIGNhc2UgZm9yIHRleHRhcmVhXHJcblx0XHQvL3ZhbHVlc1xyXG5cdFx0Ly9gcGFyZW50Q2FjaGVgIGlzIHVzZWQgdG8gcmVtb3ZlIG5vZGVzIGluIHNvbWUgbXVsdGktbm9kZSBjYXNlc1xyXG5cdFx0Ly9gcGFyZW50SW5kZXhgIGFuZCBgaW5kZXhgIGFyZSB1c2VkIHRvIGZpZ3VyZSBvdXQgdGhlIG9mZnNldCBvZiBub2Rlcy5cclxuXHRcdC8vVGhleSdyZSBhcnRpZmFjdHMgZnJvbSBiZWZvcmUgYXJyYXlzIHN0YXJ0ZWQgYmVpbmcgZmxhdHRlbmVkIGFuZCBhcmVcclxuXHRcdC8vbGlrZWx5IHJlZmFjdG9yYWJsZVxyXG5cdFx0Ly9gZGF0YWAgYW5kIGBjYWNoZWRgIGFyZSwgcmVzcGVjdGl2ZWx5LCB0aGUgbmV3IGFuZCBvbGQgbm9kZXMgYmVpbmdcclxuXHRcdC8vZGlmZmVkXHJcblx0XHQvL2BzaG91bGRSZWF0dGFjaGAgaXMgYSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBhIHBhcmVudCBub2RlIHdhc1xyXG5cdFx0Ly9yZWNyZWF0ZWQgKGlmIHNvLCBhbmQgaWYgdGhpcyBub2RlIGlzIHJldXNlZCwgdGhlbiB0aGlzIG5vZGUgbXVzdFxyXG5cdFx0Ly9yZWF0dGFjaCBpdHNlbGYgdG8gdGhlIG5ldyBwYXJlbnQpXHJcblx0XHQvL2BlZGl0YWJsZWAgaXMgYSBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgYW4gYW5jZXN0b3IgaXNcclxuXHRcdC8vY29udGVudGVkaXRhYmxlXHJcblx0XHQvL2BuYW1lc3BhY2VgIGluZGljYXRlcyB0aGUgY2xvc2VzdCBIVE1MIG5hbWVzcGFjZSBhcyBpdCBjYXNjYWRlcyBkb3duXHJcblx0XHQvL2Zyb20gYW4gYW5jZXN0b3JcclxuXHRcdC8vYGNvbmZpZ3NgIGlzIGEgbGlzdCBvZiBjb25maWcgZnVuY3Rpb25zIHRvIHJ1biBhZnRlciB0aGUgdG9wbW9zdFxyXG5cdFx0Ly9gYnVpbGRgIGNhbGwgZmluaXNoZXMgcnVubmluZ1xyXG5cclxuXHRcdC8vdGhlcmUncyBsb2dpYyB0aGF0IHJlbGllcyBvbiB0aGUgYXNzdW1wdGlvbiB0aGF0IG51bGwgYW5kIHVuZGVmaW5lZFxyXG5cdFx0Ly9kYXRhIGFyZSBlcXVpdmFsZW50IHRvIGVtcHR5IHN0cmluZ3NcclxuXHRcdC8vLSB0aGlzIHByZXZlbnRzIGxpZmVjeWNsZSBzdXJwcmlzZXMgZnJvbSBwcm9jZWR1cmFsIGhlbHBlcnMgdGhhdCBtaXhcclxuXHRcdC8vICBpbXBsaWNpdCBhbmQgZXhwbGljaXQgcmV0dXJuIHN0YXRlbWVudHMgKGUuZy5cclxuXHRcdC8vICBmdW5jdGlvbiBmb28oKSB7aWYgKGNvbmQpIHJldHVybiBtKFwiZGl2XCIpfVxyXG5cdFx0Ly8tIGl0IHNpbXBsaWZpZXMgZGlmZmluZyBjb2RlXHJcblx0XHRkYXRhID0gZGF0YVRvU3RyaW5nKGRhdGEpO1xyXG5cdFx0aWYgKGRhdGEuc3VidHJlZSA9PT0gXCJyZXRhaW5cIikgcmV0dXJuIGNhY2hlZDtcclxuXHRcdGNhY2hlZCA9IG1ha2VDYWNoZShkYXRhLCBjYWNoZWQsIGluZGV4LCBwYXJlbnRJbmRleCwgcGFyZW50Q2FjaGUpO1xyXG5cdFx0cmV0dXJuIGlzQXJyYXkoZGF0YSkgPyBidWlsZEFycmF5KGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgaW5kZXgsIHBhcmVudFRhZywgc2hvdWxkUmVhdHRhY2gsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIDpcclxuXHRcdFx0ZGF0YSAhPSBudWxsICYmIGlzT2JqZWN0KGRhdGEpID8gYnVpbGRPYmplY3QoZGF0YSwgY2FjaGVkLCBlZGl0YWJsZSwgcGFyZW50RWxlbWVudCwgaW5kZXgsIHNob3VsZFJlYXR0YWNoLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIDpcclxuXHRcdFx0IWlzRnVuY3Rpb24oZGF0YSkgPyBoYW5kbGVUZXh0KGNhY2hlZCwgZGF0YSwgaW5kZXgsIHBhcmVudEVsZW1lbnQsIHNob3VsZFJlYXR0YWNoLCBlZGl0YWJsZSwgcGFyZW50VGFnKSA6XHJcblx0XHRcdGNhY2hlZDtcclxuXHR9XHJcblx0ZnVuY3Rpb24gc29ydENoYW5nZXMoYSwgYikgeyByZXR1cm4gYS5hY3Rpb24gLSBiLmFjdGlvbiB8fCBhLmluZGV4IC0gYi5pbmRleDsgfVxyXG5cdGZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMobm9kZSwgdGFnLCBkYXRhQXR0cnMsIGNhY2hlZEF0dHJzLCBuYW1lc3BhY2UpIHtcclxuXHRcdGZvciAodmFyIGF0dHJOYW1lIGluIGRhdGFBdHRycykge1xyXG5cdFx0XHR2YXIgZGF0YUF0dHIgPSBkYXRhQXR0cnNbYXR0ck5hbWVdO1xyXG5cdFx0XHR2YXIgY2FjaGVkQXR0ciA9IGNhY2hlZEF0dHJzW2F0dHJOYW1lXTtcclxuXHRcdFx0aWYgKCEoYXR0ck5hbWUgaW4gY2FjaGVkQXR0cnMpIHx8IChjYWNoZWRBdHRyICE9PSBkYXRhQXR0cikpIHtcclxuXHRcdFx0XHRjYWNoZWRBdHRyc1thdHRyTmFtZV0gPSBkYXRhQXR0cjtcclxuXHRcdFx0XHQvL2Bjb25maWdgIGlzbid0IGEgcmVhbCBhdHRyaWJ1dGVzLCBzbyBpZ25vcmUgaXRcclxuXHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IFwiY29uZmlnXCIgfHwgYXR0ck5hbWUgPT09IFwia2V5XCIpIGNvbnRpbnVlO1xyXG5cdFx0XHRcdC8vaG9vayBldmVudCBoYW5kbGVycyB0byB0aGUgYXV0by1yZWRyYXdpbmcgc3lzdGVtXHJcblx0XHRcdFx0ZWxzZSBpZiAoaXNGdW5jdGlvbihkYXRhQXR0cikgJiYgYXR0ck5hbWUuc2xpY2UoMCwgMikgPT09IFwib25cIikge1xyXG5cdFx0XHRcdG5vZGVbYXR0ck5hbWVdID0gYXV0b3JlZHJhdyhkYXRhQXR0ciwgbm9kZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vaGFuZGxlIGBzdHlsZTogey4uLn1gXHJcblx0XHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgPT09IFwic3R5bGVcIiAmJiBkYXRhQXR0ciAhPSBudWxsICYmIGlzT2JqZWN0KGRhdGFBdHRyKSkge1xyXG5cdFx0XHRcdGZvciAodmFyIHJ1bGUgaW4gZGF0YUF0dHIpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNhY2hlZEF0dHIgPT0gbnVsbCB8fCBjYWNoZWRBdHRyW3J1bGVdICE9PSBkYXRhQXR0cltydWxlXSkgbm9kZS5zdHlsZVtydWxlXSA9IGRhdGFBdHRyW3J1bGVdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmb3IgKHZhciBydWxlIGluIGNhY2hlZEF0dHIpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCEocnVsZSBpbiBkYXRhQXR0cikpIG5vZGUuc3R5bGVbcnVsZV0gPSBcIlwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly9oYW5kbGUgU1ZHXHJcblx0XHRcdFx0ZWxzZSBpZiAobmFtZXNwYWNlICE9IG51bGwpIHtcclxuXHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IFwiaHJlZlwiKSBub2RlLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLCBcImhyZWZcIiwgZGF0YUF0dHIpO1xyXG5cdFx0XHRcdGVsc2Ugbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUgPT09IFwiY2xhc3NOYW1lXCIgPyBcImNsYXNzXCIgOiBhdHRyTmFtZSwgZGF0YUF0dHIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvL2hhbmRsZSBjYXNlcyB0aGF0IGFyZSBwcm9wZXJ0aWVzIChidXQgaWdub3JlIGNhc2VzIHdoZXJlIHdlIHNob3VsZCB1c2Ugc2V0QXR0cmlidXRlIGluc3RlYWQpXHJcblx0XHRcdFx0Ly8tIGxpc3QgYW5kIGZvcm0gYXJlIHR5cGljYWxseSB1c2VkIGFzIHN0cmluZ3MsIGJ1dCBhcmUgRE9NIGVsZW1lbnQgcmVmZXJlbmNlcyBpbiBqc1xyXG5cdFx0XHRcdC8vLSB3aGVuIHVzaW5nIENTUyBzZWxlY3RvcnMgKGUuZy4gYG0oXCJbc3R5bGU9JyddXCIpYCksIHN0eWxlIGlzIHVzZWQgYXMgYSBzdHJpbmcsIGJ1dCBpdCdzIGFuIG9iamVjdCBpbiBqc1xyXG5cdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lIGluIG5vZGUgJiYgYXR0ck5hbWUgIT09IFwibGlzdFwiICYmIGF0dHJOYW1lICE9PSBcInN0eWxlXCIgJiYgYXR0ck5hbWUgIT09IFwiZm9ybVwiICYmIGF0dHJOYW1lICE9PSBcInR5cGVcIiAmJiBhdHRyTmFtZSAhPT0gXCJ3aWR0aFwiICYmIGF0dHJOYW1lICE9PSBcImhlaWdodFwiKSB7XHJcblx0XHRcdFx0Ly8jMzQ4IGRvbid0IHNldCB0aGUgdmFsdWUgaWYgbm90IG5lZWRlZCBvdGhlcndpc2UgY3Vyc29yIHBsYWNlbWVudCBicmVha3MgaW4gQ2hyb21lXHJcblx0XHRcdFx0aWYgKHRhZyAhPT0gXCJpbnB1dFwiIHx8IG5vZGVbYXR0ck5hbWVdICE9PSBkYXRhQXR0cikgbm9kZVthdHRyTmFtZV0gPSBkYXRhQXR0cjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgZGF0YUF0dHIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vIzM0OCBkYXRhQXR0ciBtYXkgbm90IGJlIGEgc3RyaW5nLCBzbyB1c2UgbG9vc2UgY29tcGFyaXNvbiAoZG91YmxlIGVxdWFsKSBpbnN0ZWFkIG9mIHN0cmljdCAodHJpcGxlIGVxdWFsKVxyXG5cdFx0XHRlbHNlIGlmIChhdHRyTmFtZSA9PT0gXCJ2YWx1ZVwiICYmIHRhZyA9PT0gXCJpbnB1dFwiICYmIG5vZGUudmFsdWUgIT0gZGF0YUF0dHIpIHtcclxuXHRcdFx0XHRub2RlLnZhbHVlID0gZGF0YUF0dHI7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBjYWNoZWRBdHRycztcclxuXHR9XHJcblx0ZnVuY3Rpb24gY2xlYXIobm9kZXMsIGNhY2hlZCkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcblx0XHRcdGlmIChub2Rlc1tpXSAmJiBub2Rlc1tpXS5wYXJlbnROb2RlKSB7XHJcblx0XHRcdFx0dHJ5IHsgbm9kZXNbaV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2Rlc1tpXSk7IH1cclxuXHRcdFx0XHRjYXRjaCAoZSkge30gLy9pZ25vcmUgaWYgdGhpcyBmYWlscyBkdWUgdG8gb3JkZXIgb2YgZXZlbnRzIChzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMTkyNjA4My9mYWlsZWQtdG8tZXhlY3V0ZS1yZW1vdmVjaGlsZC1vbi1ub2RlKVxyXG5cdFx0XHRcdGNhY2hlZCA9IFtdLmNvbmNhdChjYWNoZWQpO1xyXG5cdFx0XHRcdGlmIChjYWNoZWRbaV0pIHVubG9hZChjYWNoZWRbaV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL3JlbGVhc2UgbWVtb3J5IGlmIG5vZGVzIGlzIGFuIGFycmF5LiBUaGlzIGNoZWNrIHNob3VsZCBmYWlsIGlmIG5vZGVzIGlzIGEgTm9kZUxpc3QgKHNlZSBsb29wIGFib3ZlKVxyXG5cdFx0aWYgKG5vZGVzLmxlbmd0aCkgbm9kZXMubGVuZ3RoID0gMDtcclxuXHR9XHJcblx0ZnVuY3Rpb24gdW5sb2FkKGNhY2hlZCkge1xyXG5cdFx0aWYgKGNhY2hlZC5jb25maWdDb250ZXh0ICYmIGlzRnVuY3Rpb24oY2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQpKSB7XHJcblx0XHRcdGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKCk7XHJcblx0XHRcdGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkID0gbnVsbDtcclxuXHRcdH1cclxuXHRcdGlmIChjYWNoZWQuY29udHJvbGxlcnMpIHtcclxuXHRcdFx0Zm9yRWFjaChjYWNoZWQuY29udHJvbGxlcnMsIGZ1bmN0aW9uIChjb250cm9sbGVyKSB7XHJcblx0XHRcdFx0aWYgKGlzRnVuY3Rpb24oY29udHJvbGxlci5vbnVubG9hZCkpIGNvbnRyb2xsZXIub251bmxvYWQoe3ByZXZlbnREZWZhdWx0OiBub29wfSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGNhY2hlZC5jaGlsZHJlbikge1xyXG5cdFx0XHRpZiAoaXNBcnJheShjYWNoZWQuY2hpbGRyZW4pKSBmb3JFYWNoKGNhY2hlZC5jaGlsZHJlbiwgdW5sb2FkKTtcclxuXHRcdFx0ZWxzZSBpZiAoY2FjaGVkLmNoaWxkcmVuLnRhZykgdW5sb2FkKGNhY2hlZC5jaGlsZHJlbik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR2YXIgaW5zZXJ0QWRqYWNlbnRCZWZvcmVFbmQgPSAoZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHJhbmdlU3RyYXRlZ3kgPSBmdW5jdGlvbiAocGFyZW50RWxlbWVudCwgZGF0YSkge1xyXG5cdFx0XHRwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKCRkb2N1bWVudC5jcmVhdGVSYW5nZSgpLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudChkYXRhKSk7XHJcblx0XHR9O1xyXG5cdFx0dmFyIGluc2VydEFkamFjZW50U3RyYXRlZ3kgPSBmdW5jdGlvbiAocGFyZW50RWxlbWVudCwgZGF0YSkge1xyXG5cdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBkYXRhKTtcclxuXHRcdH07XHJcblxyXG5cdFx0dHJ5IHtcclxuXHRcdFx0JGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KCd4Jyk7XHJcblx0XHRcdHJldHVybiByYW5nZVN0cmF0ZWd5O1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRyZXR1cm4gaW5zZXJ0QWRqYWNlbnRTdHJhdGVneTtcclxuXHRcdH1cclxuXHR9KSgpO1xyXG5cclxuXHRmdW5jdGlvbiBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKSB7XHJcblx0XHR2YXIgbmV4dFNpYmxpbmcgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdO1xyXG5cdFx0aWYgKG5leHRTaWJsaW5nKSB7XHJcblx0XHRcdHZhciBpc0VsZW1lbnQgPSBuZXh0U2libGluZy5ub2RlVHlwZSAhPT0gMTtcclxuXHRcdFx0dmFyIHBsYWNlaG9sZGVyID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG5cdFx0XHRpZiAoaXNFbGVtZW50KSB7XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIG5leHRTaWJsaW5nIHx8IG51bGwpO1xyXG5cdFx0XHRcdHBsYWNlaG9sZGVyLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGRhdGEpO1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQocGxhY2Vob2xkZXIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgbmV4dFNpYmxpbmcuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZGF0YSk7XHJcblx0XHR9XHJcblx0XHRlbHNlIGluc2VydEFkamFjZW50QmVmb3JlRW5kKHBhcmVudEVsZW1lbnQsIGRhdGEpO1xyXG5cclxuXHRcdHZhciBub2RlcyA9IFtdO1xyXG5cdFx0d2hpbGUgKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gIT09IG5leHRTaWJsaW5nKSB7XHJcblx0XHRcdG5vZGVzLnB1c2gocGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSk7XHJcblx0XHRcdGluZGV4Kys7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbm9kZXM7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGF1dG9yZWRyYXcoY2FsbGJhY2ssIG9iamVjdCkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKTtcclxuXHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdHRyeSB7IHJldHVybiBjYWxsYmFjay5jYWxsKG9iamVjdCwgZSk7IH1cclxuXHRcdFx0ZmluYWxseSB7XHJcblx0XHRcdFx0ZW5kRmlyc3RDb21wdXRhdGlvbigpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0dmFyIGh0bWw7XHJcblx0dmFyIGRvY3VtZW50Tm9kZSA9IHtcclxuXHRcdGFwcGVuZENoaWxkOiBmdW5jdGlvbihub2RlKSB7XHJcblx0XHRcdGlmIChodG1sID09PSB1bmRlZmluZWQpIGh0bWwgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImh0bWxcIik7XHJcblx0XHRcdGlmICgkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgIT09IG5vZGUpIHtcclxuXHRcdFx0XHQkZG9jdW1lbnQucmVwbGFjZUNoaWxkKG5vZGUsICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgJGRvY3VtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xyXG5cdFx0XHR0aGlzLmNoaWxkTm9kZXMgPSAkZG9jdW1lbnQuY2hpbGROb2RlcztcclxuXHRcdH0sXHJcblx0XHRpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKG5vZGUpIHtcclxuXHRcdFx0dGhpcy5hcHBlbmRDaGlsZChub2RlKTtcclxuXHRcdH0sXHJcblx0XHRjaGlsZE5vZGVzOiBbXVxyXG5cdH07XHJcblx0dmFyIG5vZGVDYWNoZSA9IFtdLCBjZWxsQ2FjaGUgPSB7fTtcclxuXHRtLnJlbmRlciA9IGZ1bmN0aW9uKHJvb3QsIGNlbGwsIGZvcmNlUmVjcmVhdGlvbikge1xyXG5cdFx0dmFyIGNvbmZpZ3MgPSBbXTtcclxuXHRcdGlmICghcm9vdCkgdGhyb3cgbmV3IEVycm9yKFwiRW5zdXJlIHRoZSBET00gZWxlbWVudCBiZWluZyBwYXNzZWQgdG8gbS5yb3V0ZS9tLm1vdW50L20ucmVuZGVyIGlzIG5vdCB1bmRlZmluZWQuXCIpO1xyXG5cdFx0dmFyIGlkID0gZ2V0Q2VsbENhY2hlS2V5KHJvb3QpO1xyXG5cdFx0dmFyIGlzRG9jdW1lbnRSb290ID0gcm9vdCA9PT0gJGRvY3VtZW50O1xyXG5cdFx0dmFyIG5vZGUgPSBpc0RvY3VtZW50Um9vdCB8fCByb290ID09PSAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ID8gZG9jdW1lbnROb2RlIDogcm9vdDtcclxuXHRcdGlmIChpc0RvY3VtZW50Um9vdCAmJiBjZWxsLnRhZyAhPT0gXCJodG1sXCIpIGNlbGwgPSB7dGFnOiBcImh0bWxcIiwgYXR0cnM6IHt9LCBjaGlsZHJlbjogY2VsbH07XHJcblx0XHRpZiAoY2VsbENhY2hlW2lkXSA9PT0gdW5kZWZpbmVkKSBjbGVhcihub2RlLmNoaWxkTm9kZXMpO1xyXG5cdFx0aWYgKGZvcmNlUmVjcmVhdGlvbiA9PT0gdHJ1ZSkgcmVzZXQocm9vdCk7XHJcblx0XHRjZWxsQ2FjaGVbaWRdID0gYnVpbGQobm9kZSwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNlbGwsIGNlbGxDYWNoZVtpZF0sIGZhbHNlLCAwLCBudWxsLCB1bmRlZmluZWQsIGNvbmZpZ3MpO1xyXG5cdFx0Zm9yRWFjaChjb25maWdzLCBmdW5jdGlvbiAoY29uZmlnKSB7IGNvbmZpZygpOyB9KTtcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGdldENlbGxDYWNoZUtleShlbGVtZW50KSB7XHJcblx0XHR2YXIgaW5kZXggPSBub2RlQ2FjaGUuaW5kZXhPZihlbGVtZW50KTtcclxuXHRcdHJldHVybiBpbmRleCA8IDAgPyBub2RlQ2FjaGUucHVzaChlbGVtZW50KSAtIDEgOiBpbmRleDtcclxuXHR9XHJcblxyXG5cdG0udHJ1c3QgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0dmFsdWUgPSBuZXcgU3RyaW5nKHZhbHVlKTtcclxuXHRcdHZhbHVlLiR0cnVzdGVkID0gdHJ1ZTtcclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBnZXR0ZXJzZXR0ZXIoc3RvcmUpIHtcclxuXHRcdHZhciBwcm9wID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSBzdG9yZSA9IGFyZ3VtZW50c1swXTtcclxuXHRcdFx0cmV0dXJuIHN0b3JlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRwcm9wLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gc3RvcmU7XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBwcm9wO1xyXG5cdH1cclxuXHJcblx0bS5wcm9wID0gZnVuY3Rpb24gKHN0b3JlKSB7XHJcblx0XHQvL25vdGU6IHVzaW5nIG5vbi1zdHJpY3QgZXF1YWxpdHkgY2hlY2sgaGVyZSBiZWNhdXNlIHdlJ3JlIGNoZWNraW5nIGlmIHN0b3JlIGlzIG51bGwgT1IgdW5kZWZpbmVkXHJcblx0XHRpZiAoKHN0b3JlICE9IG51bGwgJiYgaXNPYmplY3Qoc3RvcmUpIHx8IGlzRnVuY3Rpb24oc3RvcmUpKSAmJiBpc0Z1bmN0aW9uKHN0b3JlLnRoZW4pKSB7XHJcblx0XHRcdHJldHVybiBwcm9waWZ5KHN0b3JlKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZ2V0dGVyc2V0dGVyKHN0b3JlKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgcm9vdHMgPSBbXSwgY29tcG9uZW50cyA9IFtdLCBjb250cm9sbGVycyA9IFtdLCBsYXN0UmVkcmF3SWQgPSBudWxsLCBsYXN0UmVkcmF3Q2FsbFRpbWUgPSAwLCBjb21wdXRlUHJlUmVkcmF3SG9vayA9IG51bGwsIGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGwsIHRvcENvbXBvbmVudCwgdW5sb2FkZXJzID0gW107XHJcblx0dmFyIEZSQU1FX0JVREdFVCA9IDE2OyAvLzYwIGZyYW1lcyBwZXIgc2Vjb25kID0gMSBjYWxsIHBlciAxNiBtc1xyXG5cdGZ1bmN0aW9uIHBhcmFtZXRlcml6ZShjb21wb25lbnQsIGFyZ3MpIHtcclxuXHRcdHZhciBjb250cm9sbGVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAoY29tcG9uZW50LmNvbnRyb2xsZXIgfHwgbm9vcCkuYXBwbHkodGhpcywgYXJncykgfHwgdGhpcztcclxuXHRcdH07XHJcblx0XHRpZiAoY29tcG9uZW50LmNvbnRyb2xsZXIpIGNvbnRyb2xsZXIucHJvdG90eXBlID0gY29tcG9uZW50LmNvbnRyb2xsZXIucHJvdG90eXBlO1xyXG5cdFx0dmFyIHZpZXcgPSBmdW5jdGlvbihjdHJsKSB7XHJcblx0XHRcdHZhciBjdXJyZW50QXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJncy5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSA6IGFyZ3M7XHJcblx0XHRcdHJldHVybiBjb21wb25lbnQudmlldy5hcHBseShjb21wb25lbnQsIGN1cnJlbnRBcmdzID8gW2N0cmxdLmNvbmNhdChjdXJyZW50QXJncykgOiBbY3RybF0pO1xyXG5cdFx0fTtcclxuXHRcdHZpZXcuJG9yaWdpbmFsID0gY29tcG9uZW50LnZpZXc7XHJcblx0XHR2YXIgb3V0cHV0ID0ge2NvbnRyb2xsZXI6IGNvbnRyb2xsZXIsIHZpZXc6IHZpZXd9O1xyXG5cdFx0aWYgKGFyZ3NbMF0gJiYgYXJnc1swXS5rZXkgIT0gbnVsbCkgb3V0cHV0LmF0dHJzID0ge2tleTogYXJnc1swXS5rZXl9O1xyXG5cdFx0cmV0dXJuIG91dHB1dDtcclxuXHR9XHJcblx0bS5jb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcclxuXHRcdGZvciAodmFyIGFyZ3MgPSBbXSwgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xyXG5cdFx0cmV0dXJuIHBhcmFtZXRlcml6ZShjb21wb25lbnQsIGFyZ3MpO1xyXG5cdH07XHJcblx0bS5tb3VudCA9IG0ubW9kdWxlID0gZnVuY3Rpb24ocm9vdCwgY29tcG9uZW50KSB7XHJcblx0XHRpZiAoIXJvb3QpIHRocm93IG5ldyBFcnJvcihcIlBsZWFzZSBlbnN1cmUgdGhlIERPTSBlbGVtZW50IGV4aXN0cyBiZWZvcmUgcmVuZGVyaW5nIGEgdGVtcGxhdGUgaW50byBpdC5cIik7XHJcblx0XHR2YXIgaW5kZXggPSByb290cy5pbmRleE9mKHJvb3QpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgaW5kZXggPSByb290cy5sZW5ndGg7XHJcblxyXG5cdFx0dmFyIGlzUHJldmVudGVkID0gZmFsc2U7XHJcblx0XHR2YXIgZXZlbnQgPSB7cHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpc1ByZXZlbnRlZCA9IHRydWU7XHJcblx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rID0gY29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbDtcclxuXHRcdH19O1xyXG5cclxuXHRcdGZvckVhY2godW5sb2FkZXJzLCBmdW5jdGlvbiAodW5sb2FkZXIpIHtcclxuXHRcdFx0dW5sb2FkZXIuaGFuZGxlci5jYWxsKHVubG9hZGVyLmNvbnRyb2xsZXIsIGV2ZW50KTtcclxuXHRcdFx0dW5sb2FkZXIuY29udHJvbGxlci5vbnVubG9hZCA9IG51bGw7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAoaXNQcmV2ZW50ZWQpIHtcclxuXHRcdFx0Zm9yRWFjaCh1bmxvYWRlcnMsIGZ1bmN0aW9uICh1bmxvYWRlcikge1xyXG5cdFx0XHRcdHVubG9hZGVyLmNvbnRyb2xsZXIub251bmxvYWQgPSB1bmxvYWRlci5oYW5kbGVyO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGVsc2UgdW5sb2FkZXJzID0gW107XHJcblxyXG5cdFx0aWYgKGNvbnRyb2xsZXJzW2luZGV4XSAmJiBpc0Z1bmN0aW9uKGNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZCkpIHtcclxuXHRcdFx0Y29udHJvbGxlcnNbaW5kZXhdLm9udW5sb2FkKGV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgaXNOdWxsQ29tcG9uZW50ID0gY29tcG9uZW50ID09PSBudWxsO1xyXG5cclxuXHRcdGlmICghaXNQcmV2ZW50ZWQpIHtcclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJhbGxcIik7XHJcblx0XHRcdG0uc3RhcnRDb21wdXRhdGlvbigpO1xyXG5cdFx0XHRyb290c1tpbmRleF0gPSByb290O1xyXG5cdFx0XHR2YXIgY3VycmVudENvbXBvbmVudCA9IGNvbXBvbmVudCA/ICh0b3BDb21wb25lbnQgPSBjb21wb25lbnQpIDogKHRvcENvbXBvbmVudCA9IGNvbXBvbmVudCA9IHtjb250cm9sbGVyOiBub29wfSk7XHJcblx0XHRcdHZhciBjb250cm9sbGVyID0gbmV3IChjb21wb25lbnQuY29udHJvbGxlciB8fCBub29wKSgpO1xyXG5cdFx0XHQvL2NvbnRyb2xsZXJzIG1heSBjYWxsIG0ubW91bnQgcmVjdXJzaXZlbHkgKHZpYSBtLnJvdXRlIHJlZGlyZWN0cywgZm9yIGV4YW1wbGUpXHJcblx0XHRcdC8vdGhpcyBjb25kaXRpb25hbCBlbnN1cmVzIG9ubHkgdGhlIGxhc3QgcmVjdXJzaXZlIG0ubW91bnQgY2FsbCBpcyBhcHBsaWVkXHJcblx0XHRcdGlmIChjdXJyZW50Q29tcG9uZW50ID09PSB0b3BDb21wb25lbnQpIHtcclxuXHRcdFx0XHRjb250cm9sbGVyc1tpbmRleF0gPSBjb250cm9sbGVyO1xyXG5cdFx0XHRcdGNvbXBvbmVudHNbaW5kZXhdID0gY29tcG9uZW50O1xyXG5cdFx0XHR9XHJcblx0XHRcdGVuZEZpcnN0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0aWYgKGlzTnVsbENvbXBvbmVudCkge1xyXG5cdFx0XHRcdHJlbW92ZVJvb3RFbGVtZW50KHJvb3QsIGluZGV4KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gY29udHJvbGxlcnNbaW5kZXhdO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGlzTnVsbENvbXBvbmVudCkge1xyXG5cdFx0XHRyZW1vdmVSb290RWxlbWVudChyb290LCBpbmRleCk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gcmVtb3ZlUm9vdEVsZW1lbnQocm9vdCwgaW5kZXgpIHtcclxuXHRcdHJvb3RzLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHRjb250cm9sbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0Y29tcG9uZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0cmVzZXQocm9vdCk7XHJcblx0XHRub2RlQ2FjaGUuc3BsaWNlKGdldENlbGxDYWNoZUtleShyb290KSwgMSk7XHJcblx0fVxyXG5cclxuXHR2YXIgcmVkcmF3aW5nID0gZmFsc2UsIGZvcmNpbmcgPSBmYWxzZTtcclxuXHRtLnJlZHJhdyA9IGZ1bmN0aW9uKGZvcmNlKSB7XHJcblx0XHRpZiAocmVkcmF3aW5nKSByZXR1cm47XHJcblx0XHRyZWRyYXdpbmcgPSB0cnVlO1xyXG5cdFx0aWYgKGZvcmNlKSBmb3JjaW5nID0gdHJ1ZTtcclxuXHRcdHRyeSB7XHJcblx0XHRcdC8vbGFzdFJlZHJhd0lkIGlzIGEgcG9zaXRpdmUgbnVtYmVyIGlmIGEgc2Vjb25kIHJlZHJhdyBpcyByZXF1ZXN0ZWQgYmVmb3JlIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZVxyXG5cdFx0XHQvL2xhc3RSZWRyYXdJRCBpcyBudWxsIGlmIGl0J3MgdGhlIGZpcnN0IHJlZHJhdyBhbmQgbm90IGFuIGV2ZW50IGhhbmRsZXJcclxuXHRcdFx0aWYgKGxhc3RSZWRyYXdJZCAmJiAhZm9yY2UpIHtcclxuXHRcdFx0XHQvL3doZW4gc2V0VGltZW91dDogb25seSByZXNjaGVkdWxlIHJlZHJhdyBpZiB0aW1lIGJldHdlZW4gbm93IGFuZCBwcmV2aW91cyByZWRyYXcgaXMgYmlnZ2VyIHRoYW4gYSBmcmFtZSwgb3RoZXJ3aXNlIGtlZXAgY3VycmVudGx5IHNjaGVkdWxlZCB0aW1lb3V0XHJcblx0XHRcdFx0Ly93aGVuIHJBRjogYWx3YXlzIHJlc2NoZWR1bGUgcmVkcmF3XHJcblx0XHRcdFx0aWYgKCRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgbmV3IERhdGUgLSBsYXN0UmVkcmF3Q2FsbFRpbWUgPiBGUkFNRV9CVURHRVQpIHtcclxuXHRcdFx0XHRcdGlmIChsYXN0UmVkcmF3SWQgPiAwKSAkY2FuY2VsQW5pbWF0aW9uRnJhbWUobGFzdFJlZHJhd0lkKTtcclxuXHRcdFx0XHRcdGxhc3RSZWRyYXdJZCA9ICRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVkcmF3LCBGUkFNRV9CVURHRVQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRyZWRyYXcoKTtcclxuXHRcdFx0XHRsYXN0UmVkcmF3SWQgPSAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkgeyBsYXN0UmVkcmF3SWQgPSBudWxsOyB9LCBGUkFNRV9CVURHRVQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRmaW5hbGx5IHtcclxuXHRcdFx0cmVkcmF3aW5nID0gZm9yY2luZyA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0bS5yZWRyYXcuc3RyYXRlZ3kgPSBtLnByb3AoKTtcclxuXHRmdW5jdGlvbiByZWRyYXcoKSB7XHJcblx0XHRpZiAoY29tcHV0ZVByZVJlZHJhd0hvb2spIHtcclxuXHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2soKTtcclxuXHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2sgPSBudWxsO1xyXG5cdFx0fVxyXG5cdFx0Zm9yRWFjaChyb290cywgZnVuY3Rpb24gKHJvb3QsIGkpIHtcclxuXHRcdFx0dmFyIGNvbXBvbmVudCA9IGNvbXBvbmVudHNbaV07XHJcblx0XHRcdGlmIChjb250cm9sbGVyc1tpXSkge1xyXG5cdFx0XHRcdHZhciBhcmdzID0gW2NvbnRyb2xsZXJzW2ldXTtcclxuXHRcdFx0XHRtLnJlbmRlcihyb290LCBjb21wb25lbnQudmlldyA/IGNvbXBvbmVudC52aWV3KGNvbnRyb2xsZXJzW2ldLCBhcmdzKSA6IFwiXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdC8vYWZ0ZXIgcmVuZGVyaW5nIHdpdGhpbiBhIHJvdXRlZCBjb250ZXh0LCB3ZSBuZWVkIHRvIHNjcm9sbCBiYWNrIHRvIHRoZSB0b3AsIGFuZCBmZXRjaCB0aGUgZG9jdW1lbnQgdGl0bGUgZm9yIGhpc3RvcnkucHVzaFN0YXRlXHJcblx0XHRpZiAoY29tcHV0ZVBvc3RSZWRyYXdIb29rKSB7XHJcblx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vaygpO1xyXG5cdFx0XHRjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBudWxsO1xyXG5cdFx0fVxyXG5cdFx0bGFzdFJlZHJhd0lkID0gbnVsbDtcclxuXHRcdGxhc3RSZWRyYXdDYWxsVGltZSA9IG5ldyBEYXRlO1xyXG5cdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpO1xyXG5cdH1cclxuXHJcblx0dmFyIHBlbmRpbmdSZXF1ZXN0cyA9IDA7XHJcblx0bS5zdGFydENvbXB1dGF0aW9uID0gZnVuY3Rpb24oKSB7IHBlbmRpbmdSZXF1ZXN0cysrOyB9O1xyXG5cdG0uZW5kQ29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmIChwZW5kaW5nUmVxdWVzdHMgPiAxKSBwZW5kaW5nUmVxdWVzdHMtLTtcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRwZW5kaW5nUmVxdWVzdHMgPSAwO1xyXG5cdFx0XHRtLnJlZHJhdygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZW5kRmlyc3RDb21wdXRhdGlvbigpIHtcclxuXHRcdGlmIChtLnJlZHJhdy5zdHJhdGVneSgpID09PSBcIm5vbmVcIikge1xyXG5cdFx0XHRwZW5kaW5nUmVxdWVzdHMtLTtcclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBtLmVuZENvbXB1dGF0aW9uKCk7XHJcblx0fVxyXG5cclxuXHRtLndpdGhBdHRyID0gZnVuY3Rpb24ocHJvcCwgd2l0aEF0dHJDYWxsYmFjaywgY2FsbGJhY2tUaGlzKSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdFx0dmFyIGN1cnJlbnRUYXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQgfHwgdGhpcztcclxuXHRcdFx0dmFyIF90aGlzID0gY2FsbGJhY2tUaGlzIHx8IHRoaXM7XHJcblx0XHRcdHdpdGhBdHRyQ2FsbGJhY2suY2FsbChfdGhpcywgcHJvcCBpbiBjdXJyZW50VGFyZ2V0ID8gY3VycmVudFRhcmdldFtwcm9wXSA6IGN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApKTtcclxuXHRcdH07XHJcblx0fTtcclxuXHJcblx0Ly9yb3V0aW5nXHJcblx0dmFyIG1vZGVzID0ge3BhdGhuYW1lOiBcIlwiLCBoYXNoOiBcIiNcIiwgc2VhcmNoOiBcIj9cIn07XHJcblx0dmFyIHJlZGlyZWN0ID0gbm9vcCwgcm91dGVQYXJhbXMsIGN1cnJlbnRSb3V0ZSwgaXNEZWZhdWx0Um91dGUgPSBmYWxzZTtcclxuXHRtLnJvdXRlID0gZnVuY3Rpb24ocm9vdCwgYXJnMSwgYXJnMiwgdmRvbSkge1xyXG5cdFx0Ly9tLnJvdXRlKClcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gY3VycmVudFJvdXRlO1xyXG5cdFx0Ly9tLnJvdXRlKGVsLCBkZWZhdWx0Um91dGUsIHJvdXRlcylcclxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiYgaXNTdHJpbmcoYXJnMSkpIHtcclxuXHRcdFx0cmVkaXJlY3QgPSBmdW5jdGlvbihzb3VyY2UpIHtcclxuXHRcdFx0XHR2YXIgcGF0aCA9IGN1cnJlbnRSb3V0ZSA9IG5vcm1hbGl6ZVJvdXRlKHNvdXJjZSk7XHJcblx0XHRcdFx0aWYgKCFyb3V0ZUJ5VmFsdWUocm9vdCwgYXJnMiwgcGF0aCkpIHtcclxuXHRcdFx0XHRcdGlmIChpc0RlZmF1bHRSb3V0ZSkgdGhyb3cgbmV3IEVycm9yKFwiRW5zdXJlIHRoZSBkZWZhdWx0IHJvdXRlIG1hdGNoZXMgb25lIG9mIHRoZSByb3V0ZXMgZGVmaW5lZCBpbiBtLnJvdXRlXCIpO1xyXG5cdFx0XHRcdFx0aXNEZWZhdWx0Um91dGUgPSB0cnVlO1xyXG5cdFx0XHRcdFx0bS5yb3V0ZShhcmcxLCB0cnVlKTtcclxuXHRcdFx0XHRcdGlzRGVmYXVsdFJvdXRlID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHR2YXIgbGlzdGVuZXIgPSBtLnJvdXRlLm1vZGUgPT09IFwiaGFzaFwiID8gXCJvbmhhc2hjaGFuZ2VcIiA6IFwib25wb3BzdGF0ZVwiO1xyXG5cdFx0XHR3aW5kb3dbbGlzdGVuZXJdID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSAkbG9jYXRpb25bbS5yb3V0ZS5tb2RlXTtcclxuXHRcdFx0XHRpZiAobS5yb3V0ZS5tb2RlID09PSBcInBhdGhuYW1lXCIpIHBhdGggKz0gJGxvY2F0aW9uLnNlYXJjaDtcclxuXHRcdFx0XHRpZiAoY3VycmVudFJvdXRlICE9PSBub3JtYWxpemVSb3V0ZShwYXRoKSkgcmVkaXJlY3QocGF0aCk7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vayA9IHNldFNjcm9sbDtcclxuXHRcdFx0d2luZG93W2xpc3RlbmVyXSgpO1xyXG5cdFx0fVxyXG5cdFx0Ly9jb25maWc6IG0ucm91dGVcclxuXHRcdGVsc2UgaWYgKHJvb3QuYWRkRXZlbnRMaXN0ZW5lciB8fCByb290LmF0dGFjaEV2ZW50KSB7XHJcblx0XHRcdHJvb3QuaHJlZiA9IChtLnJvdXRlLm1vZGUgIT09ICdwYXRobmFtZScgPyAkbG9jYXRpb24ucGF0aG5hbWUgOiAnJykgKyBtb2Rlc1ttLnJvdXRlLm1vZGVdICsgdmRvbS5hdHRycy5ocmVmO1xyXG5cdFx0XHRpZiAocm9vdC5hZGRFdmVudExpc3RlbmVyKSB7XHJcblx0XHRcdFx0cm9vdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSk7XHJcblx0XHRcdFx0cm9vdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0cm9vdC5kZXRhY2hFdmVudChcIm9uY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSk7XHJcblx0XHRcdFx0cm9vdC5hdHRhY2hFdmVudChcIm9uY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vbS5yb3V0ZShyb3V0ZSwgcGFyYW1zLCBzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5KVxyXG5cdFx0ZWxzZSBpZiAoaXNTdHJpbmcocm9vdCkpIHtcclxuXHRcdFx0dmFyIG9sZFJvdXRlID0gY3VycmVudFJvdXRlO1xyXG5cdFx0XHRjdXJyZW50Um91dGUgPSByb290O1xyXG5cdFx0XHR2YXIgYXJncyA9IGFyZzEgfHwge307XHJcblx0XHRcdHZhciBxdWVyeUluZGV4ID0gY3VycmVudFJvdXRlLmluZGV4T2YoXCI/XCIpO1xyXG5cdFx0XHR2YXIgcGFyYW1zID0gcXVlcnlJbmRleCA+IC0xID8gcGFyc2VRdWVyeVN0cmluZyhjdXJyZW50Um91dGUuc2xpY2UocXVlcnlJbmRleCArIDEpKSA6IHt9O1xyXG5cdFx0XHRmb3IgKHZhciBpIGluIGFyZ3MpIHBhcmFtc1tpXSA9IGFyZ3NbaV07XHJcblx0XHRcdHZhciBxdWVyeXN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmcocGFyYW1zKTtcclxuXHRcdFx0dmFyIGN1cnJlbnRQYXRoID0gcXVlcnlJbmRleCA+IC0xID8gY3VycmVudFJvdXRlLnNsaWNlKDAsIHF1ZXJ5SW5kZXgpIDogY3VycmVudFJvdXRlO1xyXG5cdFx0XHRpZiAocXVlcnlzdHJpbmcpIGN1cnJlbnRSb3V0ZSA9IGN1cnJlbnRQYXRoICsgKGN1cnJlbnRQYXRoLmluZGV4T2YoXCI/XCIpID09PSAtMSA/IFwiP1wiIDogXCImXCIpICsgcXVlcnlzdHJpbmc7XHJcblxyXG5cdFx0XHR2YXIgc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSA9IChhcmd1bWVudHMubGVuZ3RoID09PSAzID8gYXJnMiA6IGFyZzEpID09PSB0cnVlIHx8IG9sZFJvdXRlID09PSByb290O1xyXG5cclxuXHRcdFx0aWYgKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSkge1xyXG5cdFx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rID0gc2V0U2Nyb2xsO1xyXG5cdFx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0d2luZG93Lmhpc3Rvcnlbc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSA/IFwicmVwbGFjZVN0YXRlXCIgOiBcInB1c2hTdGF0ZVwiXShudWxsLCAkZG9jdW1lbnQudGl0bGUsIG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpO1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0cmVkaXJlY3QobW9kZXNbbS5yb3V0ZS5tb2RlXSArIGN1cnJlbnRSb3V0ZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0JGxvY2F0aW9uW20ucm91dGUubW9kZV0gPSBjdXJyZW50Um91dGU7XHJcblx0XHRcdFx0cmVkaXJlY3QobW9kZXNbbS5yb3V0ZS5tb2RlXSArIGN1cnJlbnRSb3V0ZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cdG0ucm91dGUucGFyYW0gPSBmdW5jdGlvbihrZXkpIHtcclxuXHRcdGlmICghcm91dGVQYXJhbXMpIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGNhbGwgbS5yb3V0ZShlbGVtZW50LCBkZWZhdWx0Um91dGUsIHJvdXRlcykgYmVmb3JlIGNhbGxpbmcgbS5yb3V0ZS5wYXJhbSgpXCIpO1xyXG5cdFx0aWYoICFrZXkgKXtcclxuXHRcdFx0cmV0dXJuIHJvdXRlUGFyYW1zO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJvdXRlUGFyYW1zW2tleV07XHJcblx0fTtcclxuXHRtLnJvdXRlLm1vZGUgPSBcInNlYXJjaFwiO1xyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZVJvdXRlKHJvdXRlKSB7XHJcblx0XHRyZXR1cm4gcm91dGUuc2xpY2UobW9kZXNbbS5yb3V0ZS5tb2RlXS5sZW5ndGgpO1xyXG5cdH1cclxuXHRmdW5jdGlvbiByb3V0ZUJ5VmFsdWUocm9vdCwgcm91dGVyLCBwYXRoKSB7XHJcblx0XHRyb3V0ZVBhcmFtcyA9IHt9O1xyXG5cclxuXHRcdHZhciBxdWVyeVN0YXJ0ID0gcGF0aC5pbmRleE9mKFwiP1wiKTtcclxuXHRcdGlmIChxdWVyeVN0YXJ0ICE9PSAtMSkge1xyXG5cdFx0XHRyb3V0ZVBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcocGF0aC5zdWJzdHIocXVlcnlTdGFydCArIDEsIHBhdGgubGVuZ3RoKSk7XHJcblx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cigwLCBxdWVyeVN0YXJ0KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBHZXQgYWxsIHJvdXRlcyBhbmQgY2hlY2sgaWYgdGhlcmUnc1xyXG5cdFx0Ly8gYW4gZXhhY3QgbWF0Y2ggZm9yIHRoZSBjdXJyZW50IHBhdGhcclxuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMocm91dGVyKTtcclxuXHRcdHZhciBpbmRleCA9IGtleXMuaW5kZXhPZihwYXRoKTtcclxuXHRcdGlmKGluZGV4ICE9PSAtMSl7XHJcblx0XHRcdG0ubW91bnQocm9vdCwgcm91dGVyW2tleXMgW2luZGV4XV0pO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKHZhciByb3V0ZSBpbiByb3V0ZXIpIHtcclxuXHRcdFx0aWYgKHJvdXRlID09PSBwYXRoKSB7XHJcblx0XHRcdFx0bS5tb3VudChyb290LCByb3V0ZXJbcm91dGVdKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFwiXlwiICsgcm91dGUucmVwbGFjZSgvOlteXFwvXSs/XFwuezN9L2csIFwiKC4qPylcIikucmVwbGFjZSgvOlteXFwvXSsvZywgXCIoW15cXFxcL10rKVwiKSArIFwiXFwvPyRcIik7XHJcblxyXG5cdFx0XHRpZiAobWF0Y2hlci50ZXN0KHBhdGgpKSB7XHJcblx0XHRcdFx0cGF0aC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0dmFyIGtleXMgPSByb3V0ZS5tYXRjaCgvOlteXFwvXSsvZykgfHwgW107XHJcblx0XHRcdFx0XHR2YXIgdmFsdWVzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEsIC0yKTtcclxuXHRcdFx0XHRcdGZvckVhY2goa2V5cywgZnVuY3Rpb24gKGtleSwgaSkge1xyXG5cdFx0XHRcdFx0XHRyb3V0ZVBhcmFtc1trZXkucmVwbGFjZSgvOnxcXC4vZywgXCJcIildID0gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tpXSk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0bS5tb3VudChyb290LCByb3V0ZXJbcm91dGVdKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiByb3V0ZVVub2J0cnVzaXZlKGUpIHtcclxuXHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cclxuXHRcdGlmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5IHx8IGUud2hpY2ggPT09IDIpIHJldHVybjtcclxuXHJcblx0XHRpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZWxzZSBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcblxyXG5cdFx0dmFyIGN1cnJlbnRUYXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG5cdFx0dmFyIGFyZ3MgPSBtLnJvdXRlLm1vZGUgPT09IFwicGF0aG5hbWVcIiAmJiBjdXJyZW50VGFyZ2V0LnNlYXJjaCA/IHBhcnNlUXVlcnlTdHJpbmcoY3VycmVudFRhcmdldC5zZWFyY2guc2xpY2UoMSkpIDoge307XHJcblx0XHR3aGlsZSAoY3VycmVudFRhcmdldCAmJiBjdXJyZW50VGFyZ2V0Lm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09IFwiQVwiKSBjdXJyZW50VGFyZ2V0ID0gY3VycmVudFRhcmdldC5wYXJlbnROb2RlO1xyXG5cdFx0bS5yb3V0ZShjdXJyZW50VGFyZ2V0W20ucm91dGUubW9kZV0uc2xpY2UobW9kZXNbbS5yb3V0ZS5tb2RlXS5sZW5ndGgpLCBhcmdzKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gc2V0U2Nyb2xsKCkge1xyXG5cdFx0aWYgKG0ucm91dGUubW9kZSAhPT0gXCJoYXNoXCIgJiYgJGxvY2F0aW9uLmhhc2gpICRsb2NhdGlvbi5oYXNoID0gJGxvY2F0aW9uLmhhc2g7XHJcblx0XHRlbHNlIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gYnVpbGRRdWVyeVN0cmluZyhvYmplY3QsIHByZWZpeCkge1xyXG5cdFx0dmFyIGR1cGxpY2F0ZXMgPSB7fTtcclxuXHRcdHZhciBzdHIgPSBbXTtcclxuXHRcdGZvciAodmFyIHByb3AgaW4gb2JqZWN0KSB7XHJcblx0XHRcdHZhciBrZXkgPSBwcmVmaXggPyBwcmVmaXggKyBcIltcIiArIHByb3AgKyBcIl1cIiA6IHByb3A7XHJcblx0XHRcdHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wXTtcclxuXHJcblx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHN0ci5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpKTtcclxuXHRcdFx0fSBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcclxuXHRcdFx0XHRzdHIucHVzaChidWlsZFF1ZXJ5U3RyaW5nKHZhbHVlLCBrZXkpKTtcclxuXHRcdFx0fSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xyXG5cdFx0XHRcdHZhciBrZXlzID0gW107XHJcblx0XHRcdFx0ZHVwbGljYXRlc1trZXldID0gZHVwbGljYXRlc1trZXldIHx8IHt9O1xyXG5cdFx0XHRcdGZvckVhY2godmFsdWUsIGZ1bmN0aW9uIChpdGVtKSB7XHJcblx0XHRcdFx0XHRpZiAoIWR1cGxpY2F0ZXNba2V5XVtpdGVtXSkge1xyXG5cdFx0XHRcdFx0XHRkdXBsaWNhdGVzW2tleV1baXRlbV0gPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtKSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0c3RyLnB1c2goa2V5cy5qb2luKFwiJlwiKSk7XHJcblx0XHRcdH0gZWxzZSBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHN0ci5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHN0ci5qb2luKFwiJlwiKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhzdHIpIHtcclxuXHRcdGlmIChzdHIgPT09IFwiXCIgfHwgc3RyID09IG51bGwpIHJldHVybiB7fTtcclxuXHRcdGlmIChzdHIuY2hhckF0KDApID09PSBcIj9cIikgc3RyID0gc3RyLnNsaWNlKDEpO1xyXG5cclxuXHRcdHZhciBwYWlycyA9IHN0ci5zcGxpdChcIiZcIiksIHBhcmFtcyA9IHt9O1xyXG5cdFx0Zm9yRWFjaChwYWlycywgZnVuY3Rpb24gKHN0cmluZykge1xyXG5cdFx0XHR2YXIgcGFpciA9IHN0cmluZy5zcGxpdChcIj1cIik7XHJcblx0XHRcdHZhciBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQocGFpclswXSk7XHJcblx0XHRcdHZhciB2YWx1ZSA9IHBhaXIubGVuZ3RoID09PSAyID8gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0pIDogbnVsbDtcclxuXHRcdFx0aWYgKHBhcmFtc1trZXldICE9IG51bGwpIHtcclxuXHRcdFx0XHRpZiAoIWlzQXJyYXkocGFyYW1zW2tleV0pKSBwYXJhbXNba2V5XSA9IFtwYXJhbXNba2V5XV07XHJcblx0XHRcdFx0cGFyYW1zW2tleV0ucHVzaCh2YWx1ZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBwYXJhbXNba2V5XSA9IHZhbHVlO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIHBhcmFtcztcclxuXHR9XHJcblx0bS5yb3V0ZS5idWlsZFF1ZXJ5U3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZztcclxuXHRtLnJvdXRlLnBhcnNlUXVlcnlTdHJpbmcgPSBwYXJzZVF1ZXJ5U3RyaW5nO1xyXG5cclxuXHRmdW5jdGlvbiByZXNldChyb290KSB7XHJcblx0XHR2YXIgY2FjaGVLZXkgPSBnZXRDZWxsQ2FjaGVLZXkocm9vdCk7XHJcblx0XHRjbGVhcihyb290LmNoaWxkTm9kZXMsIGNlbGxDYWNoZVtjYWNoZUtleV0pO1xyXG5cdFx0Y2VsbENhY2hlW2NhY2hlS2V5XSA9IHVuZGVmaW5lZDtcclxuXHR9XHJcblxyXG5cdG0uZGVmZXJyZWQgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcclxuXHRcdGRlZmVycmVkLnByb21pc2UgPSBwcm9waWZ5KGRlZmVycmVkLnByb21pc2UpO1xyXG5cdFx0cmV0dXJuIGRlZmVycmVkO1xyXG5cdH07XHJcblx0ZnVuY3Rpb24gcHJvcGlmeShwcm9taXNlLCBpbml0aWFsVmFsdWUpIHtcclxuXHRcdHZhciBwcm9wID0gbS5wcm9wKGluaXRpYWxWYWx1ZSk7XHJcblx0XHRwcm9taXNlLnRoZW4ocHJvcCk7XHJcblx0XHRwcm9wLnRoZW4gPSBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0cmV0dXJuIHByb3BpZnkocHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCksIGluaXRpYWxWYWx1ZSk7XHJcblx0XHR9O1xyXG5cdFx0cHJvcFtcImNhdGNoXCJdID0gcHJvcC50aGVuLmJpbmQobnVsbCwgbnVsbCk7XHJcblx0XHRwcm9wW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblx0XHRcdHZhciBfY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtyZXR1cm4gbS5kZWZlcnJlZCgpLnJlc29sdmUoY2FsbGJhY2soKSkucHJvbWlzZTt9O1xyXG5cdFx0XHRyZXR1cm4gcHJvcC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdFx0cmV0dXJuIHByb3BpZnkoX2NhbGxiYWNrKCkudGhlbihmdW5jdGlvbigpIHtyZXR1cm4gdmFsdWU7fSksIGluaXRpYWxWYWx1ZSk7XHJcblx0XHRcdH0sIGZ1bmN0aW9uKHJlYXNvbikge1xyXG5cdFx0XHRcdHJldHVybiBwcm9waWZ5KF9jYWxsYmFjaygpLnRoZW4oZnVuY3Rpb24oKSB7dGhyb3cgbmV3IEVycm9yKHJlYXNvbik7fSksIGluaXRpYWxWYWx1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHRcdHJldHVybiBwcm9wO1xyXG5cdH1cclxuXHQvL1Byb21pei5taXRocmlsLmpzIHwgWm9sbWVpc3RlciB8IE1JVFxyXG5cdC8vYSBtb2RpZmllZCB2ZXJzaW9uIG9mIFByb21pei5qcywgd2hpY2ggZG9lcyBub3QgY29uZm9ybSB0byBQcm9taXNlcy9BKyBmb3IgdHdvIHJlYXNvbnM6XHJcblx0Ly8xKSBgdGhlbmAgY2FsbGJhY2tzIGFyZSBjYWxsZWQgc3luY2hyb25vdXNseSAoYmVjYXVzZSBzZXRUaW1lb3V0IGlzIHRvbyBzbG93LCBhbmQgdGhlIHNldEltbWVkaWF0ZSBwb2x5ZmlsbCBpcyB0b28gYmlnXHJcblx0Ly8yKSB0aHJvd2luZyBzdWJjbGFzc2VzIG9mIEVycm9yIGNhdXNlIHRoZSBlcnJvciB0byBiZSBidWJibGVkIHVwIGluc3RlYWQgb2YgdHJpZ2dlcmluZyByZWplY3Rpb24gKGJlY2F1c2UgdGhlIHNwZWMgZG9lcyBub3QgYWNjb3VudCBmb3IgdGhlIGltcG9ydGFudCB1c2UgY2FzZSBvZiBkZWZhdWx0IGJyb3dzZXIgZXJyb3IgaGFuZGxpbmcsIGkuZS4gbWVzc2FnZSB3LyBsaW5lIG51bWJlcilcclxuXHRmdW5jdGlvbiBEZWZlcnJlZChzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG5cdFx0dmFyIFJFU09MVklORyA9IDEsIFJFSkVDVElORyA9IDIsIFJFU09MVkVEID0gMywgUkVKRUNURUQgPSA0O1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzLCBzdGF0ZSA9IDAsIHByb21pc2VWYWx1ZSA9IDAsIG5leHQgPSBbXTtcclxuXHJcblx0XHRzZWxmLnByb21pc2UgPSB7fTtcclxuXHJcblx0XHRzZWxmLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIXN0YXRlKSB7XHJcblx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRVNPTFZJTkc7XHJcblxyXG5cdFx0XHRcdGZpcmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0c2VsZi5yZWplY3QgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIXN0YXRlKSB7XHJcblx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblxyXG5cdFx0XHRcdGZpcmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH07XHJcblxyXG5cdFx0c2VsZi5wcm9taXNlLnRoZW4gPSBmdW5jdGlvbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spXHJcblx0XHRcdGlmIChzdGF0ZSA9PT0gUkVTT0xWRUQpIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VWYWx1ZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoc3RhdGUgPT09IFJFSkVDVEVEKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KHByb21pc2VWYWx1ZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0bmV4dC5wdXNoKGRlZmVycmVkKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZVxyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBmaW5pc2godHlwZSkge1xyXG5cdFx0XHRzdGF0ZSA9IHR5cGUgfHwgUkVKRUNURUQ7XHJcblx0XHRcdG5leHQubWFwKGZ1bmN0aW9uKGRlZmVycmVkKSB7XHJcblx0XHRcdFx0c3RhdGUgPT09IFJFU09MVkVEID8gZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlVmFsdWUpIDogZGVmZXJyZWQucmVqZWN0KHByb21pc2VWYWx1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRoZW5uYWJsZSh0aGVuLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaywgbm90VGhlbm5hYmxlQ2FsbGJhY2spIHtcclxuXHRcdFx0aWYgKCgocHJvbWlzZVZhbHVlICE9IG51bGwgJiYgaXNPYmplY3QocHJvbWlzZVZhbHVlKSkgfHwgaXNGdW5jdGlvbihwcm9taXNlVmFsdWUpKSAmJiBpc0Z1bmN0aW9uKHRoZW4pKSB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdC8vIGNvdW50IHByb3RlY3RzIGFnYWluc3QgYWJ1c2UgY2FsbHMgZnJvbSBzcGVjIGNoZWNrZXJcclxuXHRcdFx0XHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHRcdFx0XHR0aGVuLmNhbGwocHJvbWlzZVZhbHVlLCBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoY291bnQrKykgcmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0c3VjY2Vzc0NhbGxiYWNrKCk7XHJcblx0XHRcdFx0XHR9LCBmdW5jdGlvbiAodmFsdWUpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNvdW50KyspIHJldHVybjtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdGZhaWx1cmVDYWxsYmFjaygpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdFx0ZmFpbHVyZUNhbGxiYWNrKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG5vdFRoZW5uYWJsZUNhbGxiYWNrKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXJlKCkge1xyXG5cdFx0XHQvLyBjaGVjayBpZiBpdCdzIGEgdGhlbmFibGVcclxuXHRcdFx0dmFyIHRoZW47XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0dGhlbiA9IHByb21pc2VWYWx1ZSAmJiBwcm9taXNlVmFsdWUudGhlbjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cdFx0XHRcdHJldHVybiBmaXJlKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoZW5uYWJsZSh0aGVuLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFU09MVklORztcclxuXHRcdFx0XHRmaXJlKCk7XHJcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cdFx0XHRcdGZpcmUoKTtcclxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdGlmIChzdGF0ZSA9PT0gUkVTT0xWSU5HICYmIGlzRnVuY3Rpb24oc3VjY2Vzc0NhbGxiYWNrKSkge1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBzdWNjZXNzQ2FsbGJhY2socHJvbWlzZVZhbHVlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2UgaWYgKHN0YXRlID09PSBSRUpFQ1RJTkcgJiYgaXNGdW5jdGlvbihmYWlsdXJlQ2FsbGJhY2spKSB7XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IGZhaWx1cmVDYWxsYmFjayhwcm9taXNlVmFsdWUpO1xyXG5cdFx0XHRcdFx0XHRzdGF0ZSA9IFJFU09MVklORztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IGU7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmluaXNoKCk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAocHJvbWlzZVZhbHVlID09PSBzZWxmKSB7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBUeXBlRXJyb3IoKTtcclxuXHRcdFx0XHRcdGZpbmlzaCgpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0aGVubmFibGUodGhlbiwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRmaW5pc2goUkVTT0xWRUQpO1xyXG5cdFx0XHRcdFx0fSwgZmluaXNoLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGZpbmlzaChzdGF0ZSA9PT0gUkVTT0xWSU5HICYmIFJFU09MVkVEKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdG0uZGVmZXJyZWQub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdGlmICh0eXBlLmNhbGwoZSkgPT09IFwiW29iamVjdCBFcnJvcl1cIiAmJiAhZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC8gRXJyb3IvKSkge1xyXG5cdFx0XHRwZW5kaW5nUmVxdWVzdHMgPSAwO1xyXG5cdFx0XHR0aHJvdyBlO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdG0uc3luYyA9IGZ1bmN0aW9uKGFyZ3MpIHtcclxuXHRcdHZhciBtZXRob2QgPSBcInJlc29sdmVcIjtcclxuXHJcblx0XHRmdW5jdGlvbiBzeW5jaHJvbml6ZXIocG9zLCByZXNvbHZlZCkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0XHRyZXN1bHRzW3Bvc10gPSB2YWx1ZTtcclxuXHRcdFx0XHRpZiAoIXJlc29sdmVkKSBtZXRob2QgPSBcInJlamVjdFwiO1xyXG5cdFx0XHRcdGlmICgtLW91dHN0YW5kaW5nID09PSAwKSB7XHJcblx0XHRcdFx0XHRkZWZlcnJlZC5wcm9taXNlKHJlc3VsdHMpO1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWRbbWV0aG9kXShyZXN1bHRzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcclxuXHRcdHZhciBvdXRzdGFuZGluZyA9IGFyZ3MubGVuZ3RoO1xyXG5cdFx0dmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkob3V0c3RhbmRpbmcpO1xyXG5cdFx0aWYgKGFyZ3MubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRmb3JFYWNoKGFyZ3MsIGZ1bmN0aW9uIChhcmcsIGkpIHtcclxuXHRcdFx0XHRhcmcudGhlbihzeW5jaHJvbml6ZXIoaSwgdHJ1ZSksIHN5bmNocm9uaXplcihpLCBmYWxzZSkpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGVsc2UgZGVmZXJyZWQucmVzb2x2ZShbXSk7XHJcblxyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0fTtcclxuXHRmdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH1cclxuXHJcblx0ZnVuY3Rpb24gYWpheChvcHRpb25zKSB7XHJcblx0XHRpZiAob3B0aW9ucy5kYXRhVHlwZSAmJiBvcHRpb25zLmRhdGFUeXBlLnRvTG93ZXJDYXNlKCkgPT09IFwianNvbnBcIikge1xyXG5cdFx0XHR2YXIgY2FsbGJhY2tLZXkgPSBcIm1pdGhyaWxfY2FsbGJhY2tfXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIFwiX1wiICsgKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDFlMTYpKS50b1N0cmluZygzNilcclxuXHRcdFx0dmFyIHNjcmlwdCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xyXG5cclxuXHRcdFx0d2luZG93W2NhbGxiYWNrS2V5XSA9IGZ1bmN0aW9uKHJlc3ApIHtcclxuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xyXG5cdFx0XHRcdG9wdGlvbnMub25sb2FkKHtcclxuXHRcdFx0XHRcdHR5cGU6IFwibG9hZFwiLFxyXG5cdFx0XHRcdFx0dGFyZ2V0OiB7XHJcblx0XHRcdFx0XHRcdHJlc3BvbnNlVGV4dDogcmVzcFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSB1bmRlZmluZWQ7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcblxyXG5cdFx0XHRcdG9wdGlvbnMub25lcnJvcih7XHJcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXHJcblx0XHRcdFx0XHR0YXJnZXQ6IHtcclxuXHRcdFx0XHRcdFx0c3RhdHVzOiA1MDAsXHJcblx0XHRcdFx0XHRcdHJlc3BvbnNlVGV4dDogSlNPTi5zdHJpbmdpZnkoe1xyXG5cdFx0XHRcdFx0XHRcdGVycm9yOiBcIkVycm9yIG1ha2luZyBqc29ucCByZXF1ZXN0XCJcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR3aW5kb3dbY2FsbGJhY2tLZXldID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRzY3JpcHQuc3JjID0gb3B0aW9ucy51cmxcclxuXHRcdFx0XHQrIChvcHRpb25zLnVybC5pbmRleE9mKFwiP1wiKSA+IDAgPyBcIiZcIiA6IFwiP1wiKVxyXG5cdFx0XHRcdCsgKG9wdGlvbnMuY2FsbGJhY2tLZXkgPyBvcHRpb25zLmNhbGxiYWNrS2V5IDogXCJjYWxsYmFja1wiKVxyXG5cdFx0XHRcdCsgXCI9XCIgKyBjYWxsYmFja0tleVxyXG5cdFx0XHRcdCsgXCImXCIgKyBidWlsZFF1ZXJ5U3RyaW5nKG9wdGlvbnMuZGF0YSB8fCB7fSk7XHJcblx0XHRcdCRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0dmFyIHhociA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcclxuXHRcdFx0eGhyLm9wZW4ob3B0aW9ucy5tZXRob2QsIG9wdGlvbnMudXJsLCB0cnVlLCBvcHRpb25zLnVzZXIsIG9wdGlvbnMucGFzc3dvcmQpO1xyXG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XHJcblx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgb3B0aW9ucy5vbmxvYWQoe3R5cGU6IFwibG9hZFwiLCB0YXJnZXQ6IHhocn0pO1xyXG5cdFx0XHRcdFx0ZWxzZSBvcHRpb25zLm9uZXJyb3Ioe3R5cGU6IFwiZXJyb3JcIiwgdGFyZ2V0OiB4aHJ9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGlmIChvcHRpb25zLnNlcmlhbGl6ZSA9PT0gSlNPTi5zdHJpbmdpZnkgJiYgb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMubWV0aG9kICE9PSBcIkdFVFwiKSB7XHJcblx0XHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChvcHRpb25zLmRlc2VyaWFsaXplID09PSBKU09OLnBhcnNlKSB7XHJcblx0XHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoXCJBY2NlcHRcIiwgXCJhcHBsaWNhdGlvbi9qc29uLCB0ZXh0LypcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGlzRnVuY3Rpb24ob3B0aW9ucy5jb25maWcpKSB7XHJcblx0XHRcdFx0dmFyIG1heWJlWGhyID0gb3B0aW9ucy5jb25maWcoeGhyLCBvcHRpb25zKTtcclxuXHRcdFx0XHRpZiAobWF5YmVYaHIgIT0gbnVsbCkgeGhyID0gbWF5YmVYaHI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBkYXRhID0gb3B0aW9ucy5tZXRob2QgPT09IFwiR0VUXCIgfHwgIW9wdGlvbnMuZGF0YSA/IFwiXCIgOiBvcHRpb25zLmRhdGE7XHJcblx0XHRcdGlmIChkYXRhICYmICghaXNTdHJpbmcoZGF0YSkgJiYgZGF0YS5jb25zdHJ1Y3RvciAhPT0gd2luZG93LkZvcm1EYXRhKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJlcXVlc3QgZGF0YSBzaG91bGQgYmUgZWl0aGVyIGJlIGEgc3RyaW5nIG9yIEZvcm1EYXRhLiBDaGVjayB0aGUgYHNlcmlhbGl6ZWAgb3B0aW9uIGluIGBtLnJlcXVlc3RgXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHhoci5zZW5kKGRhdGEpO1xyXG5cdFx0XHRyZXR1cm4geGhyO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYmluZERhdGEoeGhyT3B0aW9ucywgZGF0YSwgc2VyaWFsaXplKSB7XHJcblx0XHRpZiAoeGhyT3B0aW9ucy5tZXRob2QgPT09IFwiR0VUXCIgJiYgeGhyT3B0aW9ucy5kYXRhVHlwZSAhPT0gXCJqc29ucFwiKSB7XHJcblx0XHRcdHZhciBwcmVmaXggPSB4aHJPcHRpb25zLnVybC5pbmRleE9mKFwiP1wiKSA8IDAgPyBcIj9cIiA6IFwiJlwiO1xyXG5cdFx0XHR2YXIgcXVlcnlzdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nKGRhdGEpO1xyXG5cdFx0XHR4aHJPcHRpb25zLnVybCA9IHhock9wdGlvbnMudXJsICsgKHF1ZXJ5c3RyaW5nID8gcHJlZml4ICsgcXVlcnlzdHJpbmcgOiBcIlwiKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgeGhyT3B0aW9ucy5kYXRhID0gc2VyaWFsaXplKGRhdGEpO1xyXG5cdFx0cmV0dXJuIHhock9wdGlvbnM7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwYXJhbWV0ZXJpemVVcmwodXJsLCBkYXRhKSB7XHJcblx0XHR2YXIgdG9rZW5zID0gdXJsLm1hdGNoKC86W2Etel1cXHcrL2dpKTtcclxuXHRcdGlmICh0b2tlbnMgJiYgZGF0YSkge1xyXG5cdFx0XHRmb3JFYWNoKHRva2VucywgZnVuY3Rpb24gKHRva2VuKSB7XHJcblx0XHRcdFx0dmFyIGtleSA9IHRva2VuLnNsaWNlKDEpO1xyXG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHRva2VuLCBkYXRhW2tleV0pO1xyXG5cdFx0XHRcdGRlbGV0ZSBkYXRhW2tleV07XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHVybDtcclxuXHR9XHJcblxyXG5cdG0ucmVxdWVzdCA9IGZ1bmN0aW9uKHhock9wdGlvbnMpIHtcclxuXHRcdGlmICh4aHJPcHRpb25zLmJhY2tncm91bmQgIT09IHRydWUpIG0uc3RhcnRDb21wdXRhdGlvbigpO1xyXG5cdFx0dmFyIGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XHJcblx0XHR2YXIgaXNKU09OUCA9IHhock9wdGlvbnMuZGF0YVR5cGUgJiYgeGhyT3B0aW9ucy5kYXRhVHlwZS50b0xvd2VyQ2FzZSgpID09PSBcImpzb25wXCJcclxuXHRcdHZhciBzZXJpYWxpemUgPSB4aHJPcHRpb25zLnNlcmlhbGl6ZSA9IGlzSlNPTlAgPyBpZGVudGl0eSA6IHhock9wdGlvbnMuc2VyaWFsaXplIHx8IEpTT04uc3RyaW5naWZ5O1xyXG5cdFx0dmFyIGRlc2VyaWFsaXplID0geGhyT3B0aW9ucy5kZXNlcmlhbGl6ZSA9IGlzSlNPTlAgPyBpZGVudGl0eSA6IHhock9wdGlvbnMuZGVzZXJpYWxpemUgfHwgSlNPTi5wYXJzZTtcclxuXHRcdHZhciBleHRyYWN0ID0gaXNKU09OUCA/IGZ1bmN0aW9uKGpzb25wKSB7IHJldHVybiBqc29ucC5yZXNwb25zZVRleHQgfSA6IHhock9wdGlvbnMuZXh0cmFjdCB8fCBmdW5jdGlvbih4aHIpIHtcclxuXHRcdFx0aWYgKHhoci5yZXNwb25zZVRleHQubGVuZ3RoID09PSAwICYmIGRlc2VyaWFsaXplID09PSBKU09OLnBhcnNlKSB7XHJcblx0XHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4geGhyLnJlc3BvbnNlVGV4dFxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0eGhyT3B0aW9ucy5tZXRob2QgPSAoeGhyT3B0aW9ucy5tZXRob2QgfHwgXCJHRVRcIikudG9VcHBlckNhc2UoKTtcclxuXHRcdHhock9wdGlvbnMudXJsID0gcGFyYW1ldGVyaXplVXJsKHhock9wdGlvbnMudXJsLCB4aHJPcHRpb25zLmRhdGEpO1xyXG5cdFx0eGhyT3B0aW9ucyA9IGJpbmREYXRhKHhock9wdGlvbnMsIHhock9wdGlvbnMuZGF0YSwgc2VyaWFsaXplKTtcclxuXHRcdHhock9wdGlvbnMub25sb2FkID0geGhyT3B0aW9ucy5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0XHRcdHZhciB1bndyYXAgPSAoZS50eXBlID09PSBcImxvYWRcIiA/IHhock9wdGlvbnMudW53cmFwU3VjY2VzcyA6IHhock9wdGlvbnMudW53cmFwRXJyb3IpIHx8IGlkZW50aXR5O1xyXG5cdFx0XHRcdHZhciByZXNwb25zZSA9IHVud3JhcChkZXNlcmlhbGl6ZShleHRyYWN0KGUudGFyZ2V0LCB4aHJPcHRpb25zKSksIGUudGFyZ2V0KTtcclxuXHRcdFx0XHRpZiAoZS50eXBlID09PSBcImxvYWRcIikge1xyXG5cdFx0XHRcdFx0aWYgKGlzQXJyYXkocmVzcG9uc2UpICYmIHhock9wdGlvbnMudHlwZSkge1xyXG5cdFx0XHRcdFx0XHRmb3JFYWNoKHJlc3BvbnNlLCBmdW5jdGlvbiAocmVzLCBpKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVzcG9uc2VbaV0gPSBuZXcgeGhyT3B0aW9ucy50eXBlKHJlcyk7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh4aHJPcHRpb25zLnR5cGUpIHtcclxuXHRcdFx0XHRcdFx0cmVzcG9uc2UgPSBuZXcgeGhyT3B0aW9ucy50eXBlKHJlc3BvbnNlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGRlZmVycmVkW2UudHlwZSA9PT0gXCJsb2FkXCIgPyBcInJlc29sdmVcIiA6IFwicmVqZWN0XCJdKHJlc3BvbnNlKTtcclxuXHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh4aHJPcHRpb25zLmJhY2tncm91bmQgIT09IHRydWUpIG0uZW5kQ29tcHV0YXRpb24oKVxyXG5cdFx0fVxyXG5cclxuXHRcdGFqYXgoeGhyT3B0aW9ucyk7XHJcblx0XHRkZWZlcnJlZC5wcm9taXNlID0gcHJvcGlmeShkZWZlcnJlZC5wcm9taXNlLCB4aHJPcHRpb25zLmluaXRpYWxWYWx1ZSk7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHR9O1xyXG5cclxuXHQvL3Rlc3RpbmcgQVBJXHJcblx0bS5kZXBzID0gZnVuY3Rpb24obW9jaykge1xyXG5cdFx0aW5pdGlhbGl6ZSh3aW5kb3cgPSBtb2NrIHx8IHdpbmRvdyk7XHJcblx0XHRyZXR1cm4gd2luZG93O1xyXG5cdH07XHJcblx0Ly9mb3IgaW50ZXJuYWwgdGVzdGluZyBvbmx5LCBkbyBub3QgdXNlIGBtLmRlcHMuZmFjdG9yeWBcclxuXHRtLmRlcHMuZmFjdG9yeSA9IGFwcDtcclxuXHJcblx0cmV0dXJuIG07XHJcbn0pKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSk7XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUgIT0gbnVsbCAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBtO1xyXG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbSB9KTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gICAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4gICAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkRGF0YSA9IGNoaWxkcmVuW2ldLmRhdGE7XG4gICAgICAgICAgICBpZiAoY2hpbGREYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhZGROUyhjaGlsZERhdGEsIGNoaWxkcmVuW2ldLmNoaWxkcmVuLCBjaGlsZHJlbltpXS5zZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgICBpZiAoYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGEgPSBiO1xuICAgICAgICBpZiAoaXMuYXJyYXkoYykpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHtcbiAgICAgICAgICAgIHRleHQgPSBjO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMgJiYgYy5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2NdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXMuYXJyYXkoYikpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYikpIHtcbiAgICAgICAgICAgIHRleHQgPSBiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIgJiYgYi5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2JdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YSA9IGI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKVxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldID0gdm5vZGVfMS52bm9kZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnICYmXG4gICAgICAgIChzZWwubGVuZ3RoID09PSAzIHx8IHNlbFszXSA9PT0gJy4nIHx8IHNlbFszXSA9PT0gJyMnKSkge1xuICAgICAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlXzEudm5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn1cbmV4cG9ydHMuaCA9IGg7XG47XG5leHBvcnRzLmRlZmF1bHQgPSBoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xufVxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkge1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ2hpbGQobm9kZSwgY2hpbGQpIHtcbiAgICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlO1xufVxuZnVuY3Rpb24gbmV4dFNpYmxpbmcobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xufVxuZnVuY3Rpb24gdGFnTmFtZShlbG0pIHtcbiAgICByZXR1cm4gZWxtLnRhZ05hbWU7XG59XG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChub2RlLCB0ZXh0KSB7XG4gICAgbm9kZS50ZXh0Q29udGVudCA9IHRleHQ7XG59XG5mdW5jdGlvbiBnZXRUZXh0Q29udGVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dENvbnRlbnQ7XG59XG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxO1xufVxuZnVuY3Rpb24gaXNUZXh0KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMztcbn1cbmV4cG9ydHMuaHRtbERvbUFwaSA9IHtcbiAgICBjcmVhdGVFbGVtZW50OiBjcmVhdGVFbGVtZW50LFxuICAgIGNyZWF0ZUVsZW1lbnROUzogY3JlYXRlRWxlbWVudE5TLFxuICAgIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gICAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICAgIHBhcmVudE5vZGU6IHBhcmVudE5vZGUsXG4gICAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgc2V0VGV4dENvbnRlbnQ6IHNldFRleHRDb250ZW50LFxuICAgIGdldFRleHRDb250ZW50OiBnZXRUZXh0Q29udGVudCxcbiAgICBpc0VsZW1lbnQ6IGlzRWxlbWVudCxcbiAgICBpc1RleHQ6IGlzVGV4dCxcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmh0bWxEb21BcGk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1odG1sZG9tYXBpLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5hcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBwcmltaXRpdmUocykge1xuICAgIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5wcmltaXRpdmUgPSBwcmltaXRpdmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBrZXksIGVsbSA9IHZub2RlLmVsbSwgb2xkQXR0cnMgPSBvbGRWbm9kZS5kYXRhLmF0dHJzLCBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnM7XG4gICAgaWYgKCFvbGRBdHRycyAmJiAhYXR0cnMpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQXR0cnMgPT09IGF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQXR0cnMgPSBvbGRBdHRycyB8fCB7fTtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuICAgIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgICBmb3IgKGtleSBpbiBhdHRycykge1xuICAgICAgICB2YXIgY3VyID0gYXR0cnNba2V5XTtcbiAgICAgICAgdmFyIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgICAgICAgaWYgKGN1ciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGN1ciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgY3VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyByZW1vdmUgcmVtb3ZlZCBhdHRyaWJ1dGVzXG4gICAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAgIC8vIHRoZSBvdGhlciBvcHRpb24gaXMgdG8gcmVtb3ZlIGFsbCBhdHRyaWJ1dGVzIHdpdGggdmFsdWUgPT0gdW5kZWZpbmVkXG4gICAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICAgICAgaWYgKCEoa2V5IGluIGF0dHJzKSkge1xuICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUF0dHJzLCB1cGRhdGU6IHVwZGF0ZUF0dHJzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmF0dHJpYnV0ZXNNb2R1bGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdHRyaWJ1dGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gdXBkYXRlQ2xhc3Mob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBvbGRDbGFzcyA9IG9sZFZub2RlLmRhdGEuY2xhc3MsIGtsYXNzID0gdm5vZGUuZGF0YS5jbGFzcztcbiAgICBpZiAoIW9sZENsYXNzICYmICFrbGFzcylcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChvbGRDbGFzcyA9PT0ga2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBvbGRDbGFzcyA9IG9sZENsYXNzIHx8IHt9O1xuICAgIGtsYXNzID0ga2xhc3MgfHwge307XG4gICAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgICAgIGlmICgha2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgICAgICBjdXIgPSBrbGFzc1tuYW1lXTtcbiAgICAgICAgaWYgKGN1ciAhPT0gb2xkQ2xhc3NbbmFtZV0pIHtcbiAgICAgICAgICAgIGVsbS5jbGFzc0xpc3RbY3VyID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLmNsYXNzTW9kdWxlID0geyBjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzIH07XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmNsYXNzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2xhc3MuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG52YXIgaHRtbGRvbWFwaV8xID0gcmVxdWlyZShcIi4vaHRtbGRvbWFwaVwiKTtcbmZ1bmN0aW9uIGlzVW5kZWYocykgeyByZXR1cm4gcyA9PT0gdW5kZWZpbmVkOyB9XG5mdW5jdGlvbiBpc0RlZihzKSB7IHJldHVybiBzICE9PSB1bmRlZmluZWQ7IH1cbnZhciBlbXB0eU5vZGUgPSB2bm9kZV8xLmRlZmF1bHQoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuZnVuY3Rpb24gc2FtZVZub2RlKHZub2RlMSwgdm5vZGUyKSB7XG4gICAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cbmZ1bmN0aW9uIGlzVm5vZGUodm5vZGUpIHtcbiAgICByZXR1cm4gdm5vZGUuc2VsICE9PSB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICAgIHZhciBpLCBtYXAgPSB7fSwga2V5LCBjaDtcbiAgICBmb3IgKGkgPSBiZWdpbklkeDsgaSA8PSBlbmRJZHg7ICsraSkge1xuICAgICAgICBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAga2V5ID0gY2gua2V5O1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcFtrZXldID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxudmFyIGhvb2tzID0gWydjcmVhdGUnLCAndXBkYXRlJywgJ3JlbW92ZScsICdkZXN0cm95JywgJ3ByZScsICdwb3N0J107XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmV4cG9ydHMuaCA9IGhfMS5oO1xudmFyIHRodW5rXzEgPSByZXF1aXJlKFwiLi90aHVua1wiKTtcbmV4cG9ydHMudGh1bmsgPSB0aHVua18xLnRodW5rO1xuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBkb21BcGkpIHtcbiAgICB2YXIgaSwgaiwgY2JzID0ge307XG4gICAgdmFyIGFwaSA9IGRvbUFwaSAhPT0gdW5kZWZpbmVkID8gZG9tQXBpIDogaHRtbGRvbWFwaV8xLmRlZmF1bHQ7XG4gICAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNic1tob29rc1tpXV0gPSBbXTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIHZhciBob29rID0gbW9kdWxlc1tqXVtob29rc1tpXV07XG4gICAgICAgICAgICBpZiAoaG9vayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2JzW2hvb2tzW2ldXS5wdXNoKGhvb2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgICAgICB2YXIgaWQgPSBlbG0uaWQgPyAnIycgKyBlbG0uaWQgOiAnJztcbiAgICAgICAgdmFyIGMgPSBlbG0uY2xhc3NOYW1lID8gJy4nICsgZWxtLmNsYXNzTmFtZS5zcGxpdCgnICcpLmpvaW4oJy4nKSA6ICcnO1xuICAgICAgICByZXR1cm4gdm5vZGVfMS5kZWZhdWx0KGFwaS50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSArIGlkICsgYywge30sIFtdLCB1bmRlZmluZWQsIGVsbSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcm1DYigpIHtcbiAgICAgICAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRfMSA9IGFwaS5wYXJlbnROb2RlKGNoaWxkRWxtKTtcbiAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50XzEsIGNoaWxkRWxtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuaW5pdCkpIHtcbiAgICAgICAgICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgICAgICBpZiAoc2VsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIFBhcnNlIHNlbGVjdG9yXG4gICAgICAgICAgICB2YXIgaGFzaElkeCA9IHNlbC5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgICB2YXIgZG90SWR4ID0gc2VsLmluZGV4T2YoJy4nLCBoYXNoSWR4KTtcbiAgICAgICAgICAgIHZhciBoYXNoID0gaGFzaElkeCA+IDAgPyBoYXNoSWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkb3QgPSBkb3RJZHggPiAwID8gZG90SWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciB0YWcgPSBoYXNoSWR4ICE9PSAtMSB8fCBkb3RJZHggIT09IC0xID8gc2VsLnNsaWNlKDAsIE1hdGgubWluKGhhc2gsIGRvdCkpIDogc2VsO1xuICAgICAgICAgICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgICAgICAgIGlmIChoYXNoIDwgZG90KVxuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ2lkJywgc2VsLnNsaWNlKGhhc2ggKyAxLCBkb3QpKTtcbiAgICAgICAgICAgIGlmIChkb3RJZHggPiAwKVxuICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgc2VsLnNsaWNlKGRvdCArIDEpLnJlcGxhY2UoL1xcLi9nLCAnICcpKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5jcmVhdGVbaV0oZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzLnByaW1pdGl2ZSh2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gdm5vZGUuZGF0YS5ob29rOyAvLyBSZXVzZSB2YXJpYWJsZVxuICAgICAgICAgICAgaWYgKGlzRGVmKGkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkuY3JlYXRlKVxuICAgICAgICAgICAgICAgICAgICBpLmNyZWF0ZShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoaS5pbnNlcnQpXG4gICAgICAgICAgICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZub2RlLmVsbSA9IGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdm5vZGUuZWxtO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0oY2gsIGluc2VydGVkVm5vZGVRdWV1ZSksIGJlZm9yZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gaW52b2tlRGVzdHJveUhvb2sodm5vZGUpIHtcbiAgICAgICAgdmFyIGksIGosIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuZGVzdHJveSkpXG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLmRlc3Ryb3lbaV0odm5vZGUpO1xuICAgICAgICAgICAgaWYgKHZub2RlLmNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICAgICAgaSA9IHZub2RlLmNoaWxkcmVuW2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPSBudWxsICYmIHR5cGVvZiBpICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVWbm9kZXMocGFyZW50RWxtLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgpIHtcbiAgICAgICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgICAgICAgdmFyIGlfMSA9IHZvaWQgMCwgbGlzdGVuZXJzID0gdm9pZCAwLCBybSA9IHZvaWQgMCwgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYoY2guc2VsKSkge1xuICAgICAgICAgICAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayhjaCk7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgICAgICAgICAgICAgcm0gPSBjcmVhdGVSbUNiKGNoLmVsbSwgbGlzdGVuZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpXzEgPSAwOyBpXzEgPCBjYnMucmVtb3ZlLmxlbmd0aDsgKytpXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICBjYnMucmVtb3ZlW2lfMV0oY2gsIHJtKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmKGlfMSA9IGNoLmRhdGEpICYmIGlzRGVmKGlfMSA9IGlfMS5ob29rKSAmJiBpc0RlZihpXzEgPSBpXzEucmVtb3ZlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaV8xKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBybSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB1cGRhdGVDaGlsZHJlbihwYXJlbnRFbG0sIG9sZENoLCBuZXdDaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBvbGRTdGFydElkeCA9IDAsIG5ld1N0YXJ0SWR4ID0gMDtcbiAgICAgICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciBvbGRTdGFydFZub2RlID0gb2xkQ2hbMF07XG4gICAgICAgIHZhciBvbGRFbmRWbm9kZSA9IG9sZENoW29sZEVuZElkeF07XG4gICAgICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWzBdO1xuICAgICAgICB2YXIgbmV3RW5kVm5vZGUgPSBuZXdDaFtuZXdFbmRJZHhdO1xuICAgICAgICB2YXIgb2xkS2V5VG9JZHg7XG4gICAgICAgIHZhciBpZHhJbk9sZDtcbiAgICAgICAgdmFyIGVsbVRvTW92ZTtcbiAgICAgICAgdmFyIGJlZm9yZTtcbiAgICAgICAgd2hpbGUgKG9sZFN0YXJ0SWR4IDw9IG9sZEVuZElkeCAmJiBuZXdTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgICAgICAgIGlmIChvbGRTdGFydFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07IC8vIFZub2RlIG1pZ2h0IGhhdmUgYmVlbiBtb3ZlZCBsZWZ0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvbGRFbmRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdTdGFydFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdFbmRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkU3RhcnRWbm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhvbGRFbmRWbm9kZS5lbG0pKTtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgICAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZEtleVRvSWR4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkS2V5VG9JZHggPSBjcmVhdGVLZXlUb09sZElkeChvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlkeEluT2xkID0gb2xkS2V5VG9JZHhbbmV3U3RhcnRWbm9kZS5rZXldO1xuICAgICAgICAgICAgICAgIGlmIChpc1VuZGVmKGlkeEluT2xkKSkge1xuICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxtVG9Nb3ZlID0gb2xkQ2hbaWR4SW5PbGRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxtVG9Nb3ZlLnNlbCAhPT0gbmV3U3RhcnRWbm9kZS5zZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgZWxtVG9Nb3ZlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICAgICAgICBiZWZvcmUgPSBuZXdDaFtuZXdFbmRJZHggKyAxXSA9PSBudWxsID8gbnVsbCA6IG5ld0NoW25ld0VuZElkeCArIDFdLmVsbTtcbiAgICAgICAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBob29rO1xuICAgICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEpICYmIGlzRGVmKGhvb2sgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBob29rLnByZXBhdGNoKSkge1xuICAgICAgICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgIHZhciBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuO1xuICAgICAgICB2YXIgY2ggPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKG9sZFZub2RlID09PSB2bm9kZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHZub2RlLmRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy51cGRhdGUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLnVwZGF0ZVtpXShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vaztcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKVxuICAgICAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkQ2ggIT09IGNoKVxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSlcbiAgICAgICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgICAgIGFkZFZub2RlcyhlbG0sIG51bGwsIGNoLCAwLCBjaC5sZW5ndGggLSAxLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlVm5vZGVzKGVsbSwgb2xkQ2gsIDAsIG9sZENoLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2xkVm5vZGUudGV4dCAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRGVmKGhvb2spICYmIGlzRGVmKGkgPSBob29rLnBvc3RwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gcGF0Y2gob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBlbG0sIHBhcmVudDtcbiAgICAgICAgdmFyIGluc2VydGVkVm5vZGVRdWV1ZSA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnByZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wcmVbaV0oKTtcbiAgICAgICAgaWYgKCFpc1Zub2RlKG9sZFZub2RlKSkge1xuICAgICAgICAgICAgb2xkVm5vZGUgPSBlbXB0eU5vZGVBdChvbGRWbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICAgICAgICBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgICAgICAgIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGVsbSk7XG4gICAgICAgICAgICBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnQsIHZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKGVsbSkpO1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnQsIFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpbnNlcnRlZFZub2RlUXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KGluc2VydGVkVm5vZGVRdWV1ZVtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wb3N0Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgY2JzLnBvc3RbaV0oKTtcbiAgICAgICAgcmV0dXJuIHZub2RlO1xuICAgIH07XG59XG5leHBvcnRzLmluaXQgPSBpbml0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c25hYmJkb20uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmZ1bmN0aW9uIGNvcHlUb1RodW5rKHZub2RlLCB0aHVuaykge1xuICAgIHRodW5rLmVsbSA9IHZub2RlLmVsbTtcbiAgICB2bm9kZS5kYXRhLmZuID0gdGh1bmsuZGF0YS5mbjtcbiAgICB2bm9kZS5kYXRhLmFyZ3MgPSB0aHVuay5kYXRhLmFyZ3M7XG4gICAgdGh1bmsuZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdGh1bmsuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICB0aHVuay50ZXh0ID0gdm5vZGUudGV4dDtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG59XG5mdW5jdGlvbiBpbml0KHRodW5rKSB7XG4gICAgdmFyIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIHZub2RlID0gY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgY3VyLmFyZ3MpO1xuICAgIGNvcHlUb1RodW5rKHZub2RlLCB0aHVuayk7XG59XG5mdW5jdGlvbiBwcmVwYXRjaChvbGRWbm9kZSwgdGh1bmspIHtcbiAgICB2YXIgaSwgb2xkID0gb2xkVm5vZGUuZGF0YSwgY3VyID0gdGh1bmsuZGF0YTtcbiAgICB2YXIgb2xkQXJncyA9IG9sZC5hcmdzLCBhcmdzID0gY3VyLmFyZ3M7XG4gICAgaWYgKG9sZC5mbiAhPT0gY3VyLmZuIHx8IG9sZEFyZ3MubGVuZ3RoICE9PSBhcmdzLmxlbmd0aCkge1xuICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChvbGRBcmdzW2ldICE9PSBhcmdzW2ldKSB7XG4gICAgICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvcHlUb1RodW5rKG9sZFZub2RlLCB0aHVuayk7XG59XG5leHBvcnRzLnRodW5rID0gZnVuY3Rpb24gdGh1bmsoc2VsLCBrZXksIGZuLCBhcmdzKSB7XG4gICAgaWYgKGFyZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhcmdzID0gZm47XG4gICAgICAgIGZuID0ga2V5O1xuICAgICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBoXzEuaChzZWwsIHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGhvb2s6IHsgaW5pdDogaW5pdCwgcHJlcGF0Y2g6IHByZXBhdGNoIH0sXG4gICAgICAgIGZuOiBmbixcbiAgICAgICAgYXJnczogYXJnc1xuICAgIH0pO1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMudGh1bms7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aHVuay5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIHZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIGVsbSkge1xuICAgIHZhciBrZXkgPSBkYXRhID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBkYXRhLmtleTtcbiAgICByZXR1cm4geyBzZWw6IHNlbCwgZGF0YTogZGF0YSwgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICB0ZXh0OiB0ZXh0LCBlbG06IGVsbSwga2V5OiBrZXkgfTtcbn1cbmV4cG9ydHMudm5vZGUgPSB2bm9kZTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZub2RlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dm5vZGUuanMubWFwIiwiaW1wb3J0IHsgQ3RybCwgQ2hhdE9wdHMsIExpbmUsIFRhYiwgVmlld01vZGVsLCBSZWRyYXcsIFBlcm1pc3Npb25zLCBNb2RlcmF0aW9uQ3RybCB9IGZyb20gJy4vaW50ZXJmYWNlcydcbmltcG9ydCB7IHByZXNldEN0cmwgfSBmcm9tICcuL3ByZXNldCdcbmltcG9ydCB7IG5vdGVDdHJsIH0gZnJvbSAnLi9ub3RlJ1xuaW1wb3J0IHsgbW9kZXJhdGlvbkN0cmwgfSBmcm9tICcuL21vZGVyYXRpb24nXG5pbXBvcnQgeyBwcm9wIH0gZnJvbSAnY29tbW9uJztcblxuY29uc3QgbGkgPSB3aW5kb3cubGljaGVzcztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob3B0czogQ2hhdE9wdHMsIHJlZHJhdzogUmVkcmF3KTogQ3RybCB7XG5cbiAgY29uc3QgZGF0YSA9IG9wdHMuZGF0YTtcbiAgZGF0YS5kb21WZXJzaW9uID0gMTsgLy8gaW5jcmVtZW50IHRvIGZvcmNlIHJlZHJhd1xuICBjb25zdCBtYXhMaW5lcyA9IDIwMDtcbiAgY29uc3QgbWF4TGluZXNEcm9wID0gNTA7IC8vIGhvdyBtYW55IGxpbmVzIHRvIGRyb3AgYXQgb25jZVxuXG4gIGNvbnN0IHBhbGFudGlyID0ge1xuICAgIGluc3RhbmNlOiB1bmRlZmluZWQsXG4gICAgbG9hZGVkOiBmYWxzZSxcbiAgICBlbmFibGVkOiBwcm9wKCEhZGF0YS5wYWxhbnRpcilcbiAgfTtcblxuICBjb25zdCBhbGxUYWJzOiBUYWJbXSA9IFsnZGlzY3Vzc2lvbiddO1xuICBpZiAob3B0cy5ub3RlSWQpIGFsbFRhYnMucHVzaCgnbm90ZScpO1xuICBpZiAob3B0cy5wbHVnaW4pIGFsbFRhYnMucHVzaChvcHRzLnBsdWdpbi50YWIua2V5KTtcblxuICBjb25zdCB0YWJTdG9yYWdlID0gbGkuc3RvcmFnZS5tYWtlKCdjaGF0LnRhYicpLFxuICAgIHN0b3JlZFRhYiA9IHRhYlN0b3JhZ2UuZ2V0KCk7XG5cbiAgbGV0IG1vZGVyYXRpb246IE1vZGVyYXRpb25DdHJsIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHZtOiBWaWV3TW9kZWwgPSB7XG4gICAgdGFiOiBhbGxUYWJzLmZpbmQodGFiID0+IHRhYiA9PT0gc3RvcmVkVGFiKSB8fCBhbGxUYWJzWzBdLFxuICAgIGVuYWJsZWQ6IG9wdHMuYWx3YXlzRW5hYmxlZCB8fCAhbGkuc3RvcmFnZS5nZXQoJ25vY2hhdCcpLFxuICAgIHBsYWNlaG9sZGVyS2V5OiAndGFsa0luQ2hhdCcsXG4gICAgbG9hZGluZzogZmFsc2UsXG4gICAgdGltZW91dDogb3B0cy50aW1lb3V0LFxuICAgIHdyaXRlYWJsZTogb3B0cy53cml0ZWFibGVcbiAgfTtcblxuICAvKiBJZiBkaXNjdXNzaW9uIGlzIGRpc2FibGVkLCBhbmQgd2UgaGF2ZSBhbm90aGVyIGNoYXQgdGFiLFxuICAgKiB0aGVuIHNlbGVjdCB0aGF0IHRhYiBvdmVyIGRpc2N1c3Npb24gKi9cbiAgaWYgKGFsbFRhYnMubGVuZ3RoID4gMSAmJiB2bS50YWIgPT09ICdkaXNjdXNzaW9uJyAmJiBsaS5zdG9yYWdlLmdldCgnbm9jaGF0JykpIHZtLnRhYiA9IGFsbFRhYnNbMV07XG5cbiAgY29uc3QgcG9zdCA9IGZ1bmN0aW9uKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRleHQgPSB0ZXh0LnRyaW0oKTtcbiAgICBpZiAoIXRleHQpIHJldHVybjtcbiAgICBpZiAodGV4dC5sZW5ndGggPiAxNDApIHtcbiAgICAgIGFsZXJ0KCdNYXggbGVuZ3RoOiAxNDAgY2hhcnMuICcgKyB0ZXh0Lmxlbmd0aCArICcgY2hhcnMgdXNlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGkucHVic3ViLmVtaXQoJ3NvY2tldC5zZW5kJywgJ3RhbGsnLCB0ZXh0KTtcbiAgfTtcblxuICBjb25zdCBvblRpbWVvdXQgPSBmdW5jdGlvbih1c2VySWQ6IHN0cmluZykge1xuICAgIGRhdGEubGluZXMuZm9yRWFjaChsID0+IHtcbiAgICAgIGlmIChsLnUgJiYgbC51LnRvTG93ZXJDYXNlKCkgPT0gdXNlcklkKSBsLmQgPSB0cnVlO1xuICAgIH0pO1xuICAgIGlmICh1c2VySWQgPT0gZGF0YS51c2VySWQpIHZtLnRpbWVvdXQgPSB0cnVlO1xuICAgIGRhdGEuZG9tVmVyc2lvbisrO1xuICAgIHJlZHJhdygpO1xuICB9O1xuXG4gIGNvbnN0IG9uUmVpbnN0YXRlID0gZnVuY3Rpb24odXNlcklkOiBzdHJpbmcpIHtcbiAgICBpZiAodXNlcklkID09IGRhdGEudXNlcklkKSB7XG4gICAgICB2bS50aW1lb3V0ID0gZmFsc2U7XG4gICAgICByZWRyYXcoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgb25NZXNzYWdlID0gZnVuY3Rpb24obGluZTogTGluZSkge1xuICAgIGRhdGEubGluZXMucHVzaChsaW5lKTtcbiAgICBjb25zdCBuYiA9IGRhdGEubGluZXMubGVuZ3RoO1xuICAgIGlmIChuYiA+IG1heExpbmVzKSB7XG4gICAgICBkYXRhLmxpbmVzLnNwbGljZSgwLCBuYiAtIG1heExpbmVzICsgbWF4TGluZXNEcm9wKTtcbiAgICAgIGRhdGEuZG9tVmVyc2lvbisrO1xuICAgIH1cbiAgICByZWRyYXcoKTtcbiAgfTtcblxuICBjb25zdCBvbldyaXRlYWJsZSA9IGZ1bmN0aW9uKHY6IGJvb2xlYW4pIHtcbiAgICB2bS53cml0ZWFibGUgPSB2O1xuICAgIHJlZHJhdygpO1xuICB9XG5cbiAgY29uc3Qgb25QZXJtaXNzaW9ucyA9IGZ1bmN0aW9uKG9iajogUGVybWlzc2lvbnMpIHtcbiAgICBsZXQgcDoga2V5b2YgUGVybWlzc2lvbnM7XG4gICAgZm9yIChwIGluIG9iaikgb3B0cy5wZXJtaXNzaW9uc1twXSA9IG9ialtwXTtcbiAgICBpbnN0YW5jaWF0ZU1vZGVyYXRpb24oKTtcbiAgICByZWRyYXcoKTtcbiAgfVxuXG4gIGNvbnN0IHRyYW5zID0gbGkudHJhbnMob3B0cy5pMThuKTtcblxuICBmdW5jdGlvbiBjYW5Nb2QoKSB7XG4gICAgcmV0dXJuIG9wdHMucGVybWlzc2lvbnMudGltZW91dCB8fCBvcHRzLnBlcm1pc3Npb25zLmxvY2FsO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5zdGFuY2lhdGVNb2RlcmF0aW9uKCkge1xuICAgIG1vZGVyYXRpb24gPSBjYW5Nb2QoKSA/IG1vZGVyYXRpb25DdHJsKHtcbiAgICAgIHJlYXNvbnM6IG9wdHMudGltZW91dFJlYXNvbnMgfHwgKFt7a2V5OiAnb3RoZXInLCBuYW1lOiAnSW5hcHByb3ByaWF0ZSBiZWhhdmlvcid9XSksXG4gICAgICBwZXJtaXNzaW9uczogb3B0cy5wZXJtaXNzaW9ucyxcbiAgICAgIHJlZHJhd1xuICAgIH0pIDogdW5kZWZpbmVkO1xuICAgIGlmIChjYW5Nb2QoKSkgb3B0cy5sb2FkQ3NzKCdjaGF0Lm1vZCcpO1xuICB9XG4gIGluc3RhbmNpYXRlTW9kZXJhdGlvbigpO1xuXG4gIGNvbnN0IG5vdGUgPSBvcHRzLm5vdGVJZCA/IG5vdGVDdHJsKHtcbiAgICBpZDogb3B0cy5ub3RlSWQsXG4gICAgdHJhbnMsXG4gICAgcmVkcmF3XG4gIH0pIDogdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHByZXNldCA9IHByZXNldEN0cmwoe1xuICAgIGluaXRpYWxHcm91cDogb3B0cy5wcmVzZXQsXG4gICAgcG9zdCxcbiAgICByZWRyYXdcbiAgfSk7XG5cbiAgY29uc3Qgc3ViczogW3N0cmluZywgUHVic3ViQ2FsbGJhY2tdW10gID0gW1xuICAgIFsnc29ja2V0LmluLm1lc3NhZ2UnLCBvbk1lc3NhZ2VdLFxuICAgIFsnc29ja2V0LmluLmNoYXRfdGltZW91dCcsIG9uVGltZW91dF0sXG4gICAgWydzb2NrZXQuaW4uY2hhdF9yZWluc3RhdGUnLCBvblJlaW5zdGF0ZV0sXG4gICAgWydjaGF0LndyaXRlYWJsZScsIG9uV3JpdGVhYmxlXSxcbiAgICBbJ2NoYXQucGVybWlzc2lvbnMnLCBvblBlcm1pc3Npb25zXSxcbiAgICBbJ3BhbGFudGlyLnRvZ2dsZScsIHBhbGFudGlyLmVuYWJsZWRdXG4gIF07XG4gIHN1YnMuZm9yRWFjaCgoW2V2ZW50TmFtZSwgY2FsbGJhY2tdKSA9PiBsaS5wdWJzdWIub24oZXZlbnROYW1lLCBjYWxsYmFjaykpO1xuXG4gIGNvbnN0IGRlc3Ryb3kgPSAoKSA9PiB7XG4gICAgc3Vicy5mb3JFYWNoKChbZXZlbnROYW1lLCBjYWxsYmFja10pID0+IGxpLnB1YnN1Yi5vZmYoZXZlbnROYW1lLCBjYWxsYmFjaykpO1xuICB9O1xuXG4gIGNvbnN0IGVtaXRFbmFibGVkID0gKCkgPT4gbGkucHVic3ViLmVtaXQoJ2NoYXQuZW5hYmxlZCcsIHZtLmVuYWJsZWQpO1xuICBlbWl0RW5hYmxlZCgpO1xuXG4gIHJldHVybiB7XG4gICAgZGF0YSxcbiAgICBvcHRzLFxuICAgIHZtLFxuICAgIGFsbFRhYnMsXG4gICAgc2V0VGFiKHQ6IFRhYikge1xuICAgICAgdm0udGFiID0gdDtcbiAgICAgIHRhYlN0b3JhZ2Uuc2V0KHQpO1xuICAgICAgLy8gSXQncyBhIGxhbWUgd2F5IHRvIGRvIGl0LiBHaXZlIG1lIGEgYnJlYWsuXG4gICAgICBpZiAodCA9PT0gJ2Rpc2N1c3Npb24nKSBsaS5yZXF1ZXN0SWRsZUNhbGxiYWNrKCgpID0+ICQoJy5tY2hhdF9fc2F5JykuZm9jdXMoKSk7XG4gICAgICByZWRyYXcoKTtcbiAgICB9LFxuICAgIG1vZGVyYXRpb246ICgpID0+IG1vZGVyYXRpb24sXG4gICAgbm90ZSxcbiAgICBwcmVzZXQsXG4gICAgcG9zdCxcbiAgICB0cmFucyxcbiAgICBwbHVnaW46IG9wdHMucGx1Z2luLFxuICAgIHNldEVuYWJsZWQodjogYm9vbGVhbikge1xuICAgICAgdm0uZW5hYmxlZCA9IHY7XG4gICAgICBlbWl0RW5hYmxlZCgpO1xuICAgICAgaWYgKCF2KSBsaS5zdG9yYWdlLnNldCgnbm9jaGF0JywgJzEnKTtcbiAgICAgIGVsc2UgbGkuc3RvcmFnZS5yZW1vdmUoJ25vY2hhdCcpO1xuICAgICAgcmVkcmF3KCk7XG4gICAgfSxcbiAgICByZWRyYXcsXG4gICAgcGFsYW50aXIsXG4gICAgZGVzdHJveVxuICB9O1xufTtcbiIsImltcG9ydCB7IGgsIHRodW5rIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVEYXRhIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBDdHJsLCBMaW5lIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0ICogYXMgc3BhbSBmcm9tICcuL3NwYW0nXG5pbXBvcnQgKiBhcyBlbmhhbmNlIGZyb20gJy4vZW5oYW5jZSc7XG5pbXBvcnQgeyBwcmVzZXRWaWV3IH0gZnJvbSAnLi9wcmVzZXQnO1xuaW1wb3J0IHsgbGluZUFjdGlvbiBhcyBtb2RMaW5lQWN0aW9uIH0gZnJvbSAnLi9tb2RlcmF0aW9uJztcbmltcG9ydCB7IHVzZXJMaW5rIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IGZsYWcgfSBmcm9tICcuL3hocidcblxuY29uc3Qgd2hpc3BlclJlZ2V4ID0gL15cXC93KD86aGlzcGVyKT9cXHMvO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjdHJsOiBDdHJsKTogQXJyYXk8Vk5vZGUgfCB1bmRlZmluZWQ+IHtcbiAgaWYgKCFjdHJsLnZtLmVuYWJsZWQpIHJldHVybiBbXTtcbiAgY29uc3Qgc2Nyb2xsQ2IgPSAodm5vZGU6IFZOb2RlKSA9PiB7XG4gICAgY29uc3QgZWwgPSB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnRcbiAgICBpZiAoY3RybC5kYXRhLmxpbmVzLmxlbmd0aCA+IDUpIHtcbiAgICAgIGNvbnN0IGF1dG9TY3JvbGwgPSAoZWwuc2Nyb2xsVG9wID09PSAwIHx8IChlbC5zY3JvbGxUb3AgPiAoZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0IC0gMTAwKSkpO1xuICAgICAgaWYgKGF1dG9TY3JvbGwpIHtcbiAgICAgICAgZWwuc2Nyb2xsVG9wID0gOTk5OTk5O1xuICAgICAgICBzZXRUaW1lb3V0KChfOiBhbnkpID0+IGVsLnNjcm9sbFRvcCA9IDk5OTk5OSwgMzAwKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgbW9kID0gY3RybC5tb2RlcmF0aW9uKCk7XG4gIGNvbnN0IHZub2RlcyA9IFtcbiAgICBoKCdvbC5tY2hhdF9fbWVzc2FnZXMuY2hhdC12LScgKyBjdHJsLmRhdGEuZG9tVmVyc2lvbiwge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcm9sZTogJ2xvZycsXG4gICAgICAgICdhcmlhLWxpdmUnOiAncG9saXRlJyxcbiAgICAgICAgJ2FyaWEtYXRvbWljJzogZmFsc2VcbiAgICAgIH0sXG4gICAgICBob29rOiB7XG4gICAgICAgIGluc2VydCh2bm9kZSkge1xuICAgICAgICAgIGNvbnN0ICRlbCA9ICQodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5vbignY2xpY2snLCAnYS5qdW1wJywgKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnanVtcCcsIChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0QXR0cmlidXRlKCdkYXRhLXBseScpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAobW9kKSAkZWwub24oJ2NsaWNrJywgJy5tb2QnLCAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIG1vZC5vcGVuKCgoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmdldEF0dHJpYnV0ZSgnZGF0YS11c2VybmFtZScpIGFzIHN0cmluZykuc3BsaXQoJyAnKVswXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWxzZSAkZWwub24oJ2NsaWNrJywgJy5mbGFnJywgKGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgcmVwb3J0KGN0cmwsIChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICApO1xuICAgICAgICAgIHNjcm9sbENiKHZub2RlKTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdHBhdGNoOiAoXywgdm5vZGUpID0+IHNjcm9sbENiKHZub2RlKVxuICAgICAgfVxuICAgIH0sIHNlbGVjdExpbmVzKGN0cmwpLm1hcChsaW5lID0+IHJlbmRlckxpbmUoY3RybCwgbGluZSkpKSxcbiAgICByZW5kZXJJbnB1dChjdHJsKVxuICBdO1xuICBjb25zdCBwcmVzZXRzID0gcHJlc2V0VmlldyhjdHJsLnByZXNldCk7XG4gIGlmIChwcmVzZXRzKSB2bm9kZXMucHVzaChwcmVzZXRzKVxuICByZXR1cm4gdm5vZGVzO1xufVxuXG5mdW5jdGlvbiByZW5kZXJJbnB1dChjdHJsOiBDdHJsKTogVk5vZGUgfCB1bmRlZmluZWQge1xuICBpZiAoIWN0cmwudm0ud3JpdGVhYmxlKSByZXR1cm47XG4gIGlmICgoY3RybC5kYXRhLmxvZ2luUmVxdWlyZWQgJiYgIWN0cmwuZGF0YS51c2VySWQpIHx8IGN0cmwuZGF0YS5yZXN0cmljdGVkKVxuICAgIHJldHVybiBoKCdpbnB1dC5tY2hhdF9fc2F5Jywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcGxhY2Vob2xkZXI6IGN0cmwudHJhbnMoJ2xvZ2luVG9DaGF0JyksXG4gICAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIGxldCBwbGFjZWhvbGRlcjogc3RyaW5nO1xuICBpZiAoY3RybC52bS50aW1lb3V0KSBwbGFjZWhvbGRlciA9IGN0cmwudHJhbnMoJ3lvdUhhdmVCZWVuVGltZWRPdXQnKTtcbiAgZWxzZSBpZiAoY3RybC5vcHRzLmJsaW5kKSBwbGFjZWhvbGRlciA9ICdDaGF0JztcbiAgZWxzZSBwbGFjZWhvbGRlciA9IGN0cmwudHJhbnMubm9hcmcoY3RybC52bS5wbGFjZWhvbGRlcktleSk7XG4gIHJldHVybiBoKCdpbnB1dC5tY2hhdF9fc2F5Jywge1xuICAgIGF0dHJzOiB7XG4gICAgICBwbGFjZWhvbGRlcixcbiAgICAgIGF1dG9jb21wbGV0ZTogJ29mZicsXG4gICAgICBtYXhsZW5ndGg6IDE0MCxcbiAgICAgIGRpc2FibGVkOiBjdHJsLnZtLnRpbWVvdXQgfHwgIWN0cmwudm0ud3JpdGVhYmxlXG4gICAgfSxcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQodm5vZGUpIHtcbiAgICAgICAgc2V0dXBIb29rcyhjdHJsLCB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmxldCBtb3VjaExpc3RlbmVyOiBFdmVudExpc3RlbmVyO1xuXG5jb25zdCBzZXR1cEhvb2tzID0gKGN0cmw6IEN0cmwsIGNoYXRFbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgY2hhdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJyxcbiAgICAoZTogS2V5Ym9hcmRFdmVudCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQsXG4gICAgICAgIHR4dCA9IGVsLnZhbHVlLFxuICAgICAgICBwdWIgPSBjdHJsLm9wdHMucHVibGljO1xuICAgICAgaWYgKGUud2hpY2ggPT0gMTAgfHwgZS53aGljaCA9PSAxMykge1xuICAgICAgICBpZiAodHh0ID09PSAnJykgJCgnLmtleWJvYXJkLW1vdmUgaW5wdXQnKS5mb2N1cygpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzcGFtLnJlcG9ydCh0eHQpO1xuICAgICAgICAgIGlmIChwdWIgJiYgc3BhbS5oYXNUZWFtVXJsKHR4dCkpIGFsZXJ0KFwiUGxlYXNlIGRvbid0IGFkdmVydGlzZSB0ZWFtcyBpbiB0aGUgY2hhdC5cIik7XG4gICAgICAgICAgZWxzZSBjdHJsLnBvc3QodHh0KTtcbiAgICAgICAgICBlbC52YWx1ZSA9ICcnO1xuICAgICAgICAgIGlmICghcHViKSBlbC5jbGFzc0xpc3QucmVtb3ZlKCd3aGlzcGVyJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyk7XG4gICAgICAgIGlmICghcHViKSBlbC5jbGFzc0xpc3QudG9nZ2xlKCd3aGlzcGVyJywgISF0eHQubWF0Y2god2hpc3BlclJlZ2V4KSk7XG4gICAgICB9XG4gICAgfSlcbiAgKTtcblxuICB3aW5kb3cuTW91c2V0cmFwLmJpbmQoJ2MnLCAoKSA9PiB7XG4gICAgY2hhdEVsLmZvY3VzKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICB3aW5kb3cuTW91c2V0cmFwKGNoYXRFbCkuYmluZCgnZXNjJywgKCkgPT4gY2hhdEVsLmJsdXIoKSk7XG5cblxuICAvLyBFbnN1cmUgY2xpY2tzIHJlbW92ZSBjaGF0IGZvY3VzLlxuICAvLyBTZWUgb3JuaWNhci9jaGVzc2dyb3VuZCMxMDlcblxuICBjb25zdCBtb3VjaEV2ZW50cyA9IFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXTtcblxuICBpZiAobW91Y2hMaXN0ZW5lcikgbW91Y2hFdmVudHMuZm9yRWFjaChldmVudCA9PlxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbW91Y2hMaXN0ZW5lciwge2NhcHR1cmU6IHRydWV9KVxuICApO1xuXG4gIG1vdWNoTGlzdGVuZXIgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgIGlmICghZS5zaGlmdEtleSAmJiBlLmJ1dHRvbnMgIT09IDIgJiYgZS5idXR0b24gIT09IDIpIGNoYXRFbC5ibHVyKCk7XG4gIH07XG5cbiAgY2hhdEVsLm9uZm9jdXMgPSAoKSA9PlxuICAgIG1vdWNoRXZlbnRzLmZvckVhY2goZXZlbnQgPT5cbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbW91Y2hMaXN0ZW5lcixcbiAgICAgICAge3Bhc3NpdmU6IHRydWUsIGNhcHR1cmU6IHRydWV9XG4gICAgICApKTtcblxuICBjaGF0RWwub25ibHVyID0gKCkgPT5cbiAgICBtb3VjaEV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG1vdWNoTGlzdGVuZXIsIHtjYXB0dXJlOiB0cnVlfSlcbiAgICApO1xufTtcblxuZnVuY3Rpb24gc2FtZUxpbmVzKGwxOiBMaW5lLCBsMjogTGluZSkge1xuICByZXR1cm4gbDEuZCAmJiBsMi5kICYmIGwxLnUgPT09IGwyLnU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdExpbmVzKGN0cmw6IEN0cmwpOiBBcnJheTxMaW5lPiB7XG4gIGxldCBwcmV2OiBMaW5lLCBsczogQXJyYXk8TGluZT4gPSBbXTtcbiAgY3RybC5kYXRhLmxpbmVzLmZvckVhY2gobGluZSA9PiB7XG4gICAgaWYgKCFsaW5lLmQgJiZcbiAgICAgICghcHJldiB8fCAhc2FtZUxpbmVzKHByZXYsIGxpbmUpKSAmJlxuICAgICAgKCFsaW5lLnIgfHwgKGxpbmUudSB8fCAnJykudG9Mb3dlckNhc2UoKSA9PSBjdHJsLmRhdGEudXNlcklkKSAmJlxuICAgICAgIXNwYW0uc2tpcChsaW5lLnQpXG4gICAgKSBscy5wdXNoKGxpbmUpO1xuICAgIHByZXYgPSBsaW5lO1xuICB9KTtcbiAgcmV0dXJuIGxzO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUZXh0KHBhcnNlTW92ZXM6IGJvb2xlYW4pIHtcbiAgcmV0dXJuIChvbGRWbm9kZTogVk5vZGUsIHZub2RlOiBWTm9kZSkgPT4ge1xuICAgIGlmICgodm5vZGUuZGF0YSBhcyBWTm9kZURhdGEpLmxpY2hlc3NDaGF0ICE9PSAob2xkVm5vZGUuZGF0YSBhcyBWTm9kZURhdGEpLmxpY2hlc3NDaGF0KSB7XG4gICAgICAodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KS5pbm5lckhUTUwgPSBlbmhhbmNlLmVuaGFuY2UoKHZub2RlLmRhdGEgYXMgVk5vZGVEYXRhKS5saWNoZXNzQ2hhdCwgcGFyc2VNb3Zlcyk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiByZW5kZXJUZXh0KHQ6IHN0cmluZywgcGFyc2VNb3ZlczogYm9vbGVhbikge1xuICBpZiAoZW5oYW5jZS5pc01vcmVUaGFuVGV4dCh0KSkge1xuICAgIGNvbnN0IGhvb2sgPSB1cGRhdGVUZXh0KHBhcnNlTW92ZXMpO1xuICAgIHJldHVybiBoKCd0Jywge1xuICAgICAgbGljaGVzc0NoYXQ6IHQsXG4gICAgICBob29rOiB7XG4gICAgICAgIGNyZWF0ZTogaG9vayxcbiAgICAgICAgdXBkYXRlOiBob29rXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGgoJ3QnLCB0KTtcbn1cblxuZnVuY3Rpb24gcmVwb3J0KGN0cmw6IEN0cmwsIGxpbmU6IEhUTUxFbGVtZW50KSB7XG4gIGNvbnN0IHVzZXJBID0gbGluZS5xdWVyeVNlbGVjdG9yKCdhLnVzZXItbGluaycpIGFzIEhUTUxMaW5rRWxlbWVudDtcbiAgY29uc3QgdGV4dCA9IChsaW5lLnF1ZXJ5U2VsZWN0b3IoJ3QnKSBhcyBIVE1MRWxlbWVudCkuaW5uZXJUZXh0O1xuICBpZiAodXNlckEgJiYgY29uZmlybShgUmVwb3J0IFwiJHt0ZXh0fVwiIHRvIG1vZGVyYXRvcnM/YCkpIGZsYWcoXG4gICAgY3RybC5kYXRhLnJlc291cmNlSWQsXG4gICAgdXNlckEuaHJlZi5zcGxpdCgnLycpWzRdLFxuICAgIHRleHRcbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTGluZShjdHJsOiBDdHJsLCBsaW5lOiBMaW5lKSB7XG5cbiAgY29uc3QgdGV4dE5vZGUgPSByZW5kZXJUZXh0KGxpbmUudCwgY3RybC5vcHRzLnBhcnNlTW92ZXMpO1xuXG4gIGlmIChsaW5lLnUgPT09ICdsaWNoZXNzJykgcmV0dXJuIGgoJ2xpLnN5c3RlbScsIHRleHROb2RlKTtcblxuICBpZiAobGluZS5jKSByZXR1cm4gaCgnbGknLCBbXG4gICAgaCgnc3Bhbi5jb2xvcicsICdbJyArIGxpbmUuYyArICddJyksXG4gICAgdGV4dE5vZGVcbiAgXSk7XG5cbiAgY29uc3QgdXNlck5vZGUgPSB0aHVuaygnYScsIGxpbmUudSwgdXNlckxpbmssIFtsaW5lLnUsIGxpbmUudGl0bGVdKTtcblxuICByZXR1cm4gaCgnbGknLCB7XG4gIH0sIGN0cmwubW9kZXJhdGlvbigpID8gW1xuICAgIGxpbmUudSA/IG1vZExpbmVBY3Rpb24obGluZS51KSA6IG51bGwsXG4gICAgdXNlck5vZGUsXG4gICAgdGV4dE5vZGVcbiAgXSA6IFtcbiAgICBjdHJsLmRhdGEudXNlcklkICYmIGxpbmUudSAmJiBjdHJsLmRhdGEudXNlcklkICE9IGxpbmUudSA/IGgoJ2kuZmxhZycsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdkYXRhLWljb24nOiAnIScsXG4gICAgICAgIHRpdGxlOiAnUmVwb3J0J1xuICAgICAgfVxuICAgIH0pIDogbnVsbCxcbiAgICB1c2VyTm9kZSxcbiAgICB0ZXh0Tm9kZVxuICBdKTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBlbmhhbmNlKHRleHQ6IHN0cmluZywgcGFyc2VNb3ZlczogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IGVzY2FwZWQgPSB3aW5kb3cubGljaGVzcy5lc2NhcGVIdG1sKHRleHQpO1xuICBjb25zdCBsaW5rZWQgPSBhdXRvTGluayhlc2NhcGVkKTtcbiAgY29uc3QgcGxpZWQgPSBwYXJzZU1vdmVzICYmIGxpbmtlZCA9PT0gZXNjYXBlZCA/IGFkZFBsaWVzKGxpbmtlZCkgOiBsaW5rZWQ7XG4gIHJldHVybiBwbGllZDtcbn1cblxuY29uc3QgbW9yZVRoYW5UZXh0UGF0dGVybiA9IC9bJjw+XCJAXS87XG5jb25zdCBwb3NzaWJsZUxpbmtQYXR0ZXJuID0gL1xcLlxcdy87XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01vcmVUaGFuVGV4dChzdHI6IHN0cmluZykge1xuICByZXR1cm4gbW9yZVRoYW5UZXh0UGF0dGVybi50ZXN0KHN0cikgfHwgcG9zc2libGVMaW5rUGF0dGVybi50ZXN0KHN0cik7XG59XG5cbmNvbnN0IGxpbmtQYXR0ZXJuID0gL1xcYihodHRwcz86XFwvXFwvfGxpY2hlc3NcXC5vcmdcXC8pWy3igJPigJRcXHcrJidAI1xcLyU/PSgpfnwhOiwuO10rW1xcdysmQCNcXC8lPX58XS9naTtcblxuZnVuY3Rpb24gbGlua1JlcGxhY2UodXJsOiBzdHJpbmcsIHNjaGVtZTogc3RyaW5nKSB7XG4gIGlmICh1cmwuaW5jbHVkZXMoJyZxdW90OycpKSByZXR1cm4gdXJsO1xuICBjb25zdCBmdWxsVXJsID0gc2NoZW1lID09PSAnbGljaGVzcy5vcmcvJyA/ICdodHRwczovLycgKyB1cmwgOiB1cmw7XG4gIGNvbnN0IG1pblVybCA9IHVybC5yZXBsYWNlKC9eaHR0cHM6XFwvXFwvLywgJycpO1xuICByZXR1cm4gJzxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vZm9sbG93XCIgaHJlZj1cIicgKyBmdWxsVXJsICsgJ1wiPicgKyBtaW5VcmwgKyAnPC9hPic7XG59XG5cbmNvbnN0IHVzZXJQYXR0ZXJuID0gLyhefFteXFx3QCMvXSlAKFtcXHctXXsyLH0pL2c7XG5jb25zdCBwYXduRHJvcFBhdHRlcm4gPSAvXlthLWhdWzItN10kLztcblxuZnVuY3Rpb24gdXNlckxpbmtSZXBsYWNlKG9yaWc6IHN0cmluZywgcHJlZml4OiBTdHJpbmcsIHVzZXI6IHN0cmluZykge1xuICBpZiAodXNlci5sZW5ndGggPiAyMCB8fCB1c2VyLm1hdGNoKHBhd25Ecm9wUGF0dGVybikpIHJldHVybiBvcmlnO1xuICByZXR1cm4gcHJlZml4ICsgJzxhIGhyZWY9XCIvQC8nICsgdXNlciArICdcIj5AJyArIHVzZXIgKyBcIjwvYT5cIjtcbn1cblxuZnVuY3Rpb24gYXV0b0xpbmsoaHRtbDogc3RyaW5nKSB7XG4gIHJldHVybiBodG1sLnJlcGxhY2UodXNlclBhdHRlcm4sIHVzZXJMaW5rUmVwbGFjZSkucmVwbGFjZShsaW5rUGF0dGVybiwgbGlua1JlcGxhY2UpO1xufVxuXG5jb25zdCBtb3ZlUGF0dGVybiA9IC9cXGIoXFxkKylcXHMqKFxcLispXFxzKig/OltvMC1dK1tvMF18W05CUlFLUF0/W2EtaF0/WzEtOF0/W3hAXT9bYS16XVsxLThdKD86PVtOQlJRS10pPylcXCs/XFwjP1shXFw/PV17MCw1fS9naTtcbmZ1bmN0aW9uIG1vdmVSZXBsYWNlcihtYXRjaDogc3RyaW5nLCB0dXJuOiBudW1iZXIsIGRvdHM6IHN0cmluZykge1xuICBpZiAodHVybiA8IDEgfHwgdHVybiA+IDIwMCkgcmV0dXJuIG1hdGNoO1xuICBjb25zdCBwbHkgPSB0dXJuICogMiAtIChkb3RzLmxlbmd0aCA+IDEgPyAwIDogMSk7XG4gIHJldHVybiAnPGEgY2xhc3M9XCJqdW1wXCIgZGF0YS1wbHk9XCInICsgcGx5ICsgJ1wiPicgKyBtYXRjaCArICc8L2E+Jztcbn1cblxuZnVuY3Rpb24gYWRkUGxpZXMoaHRtbDogc3RyaW5nKSB7XG4gIHJldHVybiBodG1sLnJlcGxhY2UobW92ZVBhdHRlcm4sIG1vdmVSZXBsYWNlcik7XG59XG4iLCJpbXBvcnQgeyBpbml0IH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuaW1wb3J0IG1ha2VDdHJsIGZyb20gJy4vY3RybCc7XG5pbXBvcnQgdmlldyBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHsgQ2hhdE9wdHMsIEN0cmwgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgeyBQcmVzZXRDdHJsIH0gZnJvbSAnLi9wcmVzZXQnXG5cbmltcG9ydCBrbGFzcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJztcbmltcG9ydCBhdHRyaWJ1dGVzIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcyc7XG5cbmV4cG9ydCB7IEN0cmwgYXMgQ2hhdEN0cmwsIENoYXRQbHVnaW4gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMaWNoZXNzQ2hhdChlbGVtZW50OiBFbGVtZW50LCBvcHRzOiBDaGF0T3B0cyk6IHtcbiAgcHJlc2V0OiBQcmVzZXRDdHJsXG59IHtcbiAgY29uc3QgcGF0Y2ggPSBpbml0KFtrbGFzcywgYXR0cmlidXRlc10pO1xuXG4gIGxldCB2bm9kZTogVk5vZGUsIGN0cmw6IEN0cmxcblxuICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgdm5vZGUgPSBwYXRjaCh2bm9kZSwgdmlldyhjdHJsKSk7XG4gIH1cblxuICBjdHJsID0gbWFrZUN0cmwob3B0cywgcmVkcmF3KTtcblxuICBjb25zdCBibHVlcHJpbnQgPSB2aWV3KGN0cmwpO1xuICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICB2bm9kZSA9IHBhdGNoKGVsZW1lbnQsIGJsdWVwcmludCk7XG5cbiAgcmV0dXJuIGN0cmw7XG59O1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IE1vZGVyYXRpb25DdHJsLCBNb2RlcmF0aW9uT3B0cywgTW9kZXJhdGlvbkRhdGEsIE1vZGVyYXRpb25SZWFzb24gfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgeyB1c2VyTW9kSW5mbyB9IGZyb20gJy4veGhyJ1xuaW1wb3J0IHsgdXNlckxpbmssIHNwaW5uZXIsIGJpbmQgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gbW9kZXJhdGlvbkN0cmwob3B0czogTW9kZXJhdGlvbk9wdHMpOiBNb2RlcmF0aW9uQ3RybCB7XG5cbiAgbGV0IGRhdGE6IE1vZGVyYXRpb25EYXRhIHwgdW5kZWZpbmVkO1xuICBsZXQgbG9hZGluZyA9IGZhbHNlO1xuXG4gIGNvbnN0IG9wZW4gPSAodXNlcm5hbWU6IHN0cmluZykgPT4ge1xuICAgIGlmIChvcHRzLnBlcm1pc3Npb25zLnRpbWVvdXQpIHtcbiAgICAgIGxvYWRpbmcgPSB0cnVlO1xuICAgICAgdXNlck1vZEluZm8odXNlcm5hbWUpLnRoZW4oZCA9PiB7XG4gICAgICAgIGRhdGEgPSBkO1xuICAgICAgICBsb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIG9wdHMucmVkcmF3KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgaWQ6IHVzZXJuYW1lLFxuICAgICAgICB1c2VybmFtZVxuICAgICAgfTtcbiAgICB9XG4gICAgb3B0cy5yZWRyYXcoKTtcbiAgfTtcblxuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBkYXRhID0gdW5kZWZpbmVkO1xuICAgIGxvYWRpbmcgPSBmYWxzZTtcbiAgICBvcHRzLnJlZHJhdygpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbG9hZGluZzogKCkgPT4gbG9hZGluZyxcbiAgICBkYXRhOiAoKSA9PiBkYXRhLFxuICAgIHJlYXNvbnM6IG9wdHMucmVhc29ucyxcbiAgICBwZXJtaXNzaW9uczogKCkgPT4gb3B0cy5wZXJtaXNzaW9ucyxcbiAgICBvcGVuLFxuICAgIGNsb3NlLFxuICAgIHRpbWVvdXQocmVhc29uOiBNb2RlcmF0aW9uUmVhc29uKSB7XG4gICAgICBkYXRhICYmIHdpbmRvdy5saWNoZXNzLnB1YnN1Yi5lbWl0KCdzb2NrZXQuc2VuZCcsICd0aW1lb3V0Jywge1xuICAgICAgICB1c2VySWQ6IGRhdGEuaWQsXG4gICAgICAgIHJlYXNvbjogcmVhc29uLmtleVxuICAgICAgfSk7XG4gICAgICBjbG9zZSgpO1xuICAgICAgb3B0cy5yZWRyYXcoKTtcbiAgICB9LFxuICAgIHNoYWRvd2JhbigpIHtcbiAgICAgIGxvYWRpbmcgPSB0cnVlO1xuICAgICAgZGF0YSAmJiAkLnBvc3QoJy9tb2QvJyArIGRhdGEuaWQgKyAnL3Ryb2xsL3RydWUnKS50aGVuKCgpID0+IGRhdGEgJiYgb3BlbihkYXRhLnVzZXJuYW1lKSk7XG4gICAgICBvcHRzLnJlZHJhdygpO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVBY3Rpb24odXNlcm5hbWU6IHN0cmluZykge1xuICByZXR1cm4gaCgnaS5tb2QnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgICdkYXRhLWljb24nOiAn7oCCJyxcbiAgICAgICdkYXRhLXVzZXJuYW1lJzogdXNlcm5hbWUsXG4gICAgICB0aXRsZTogJ01vZGVyYXRpb24nXG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZGVyYXRpb25WaWV3KGN0cmw/OiBNb2RlcmF0aW9uQ3RybCk6IFZOb2RlW10gfCB1bmRlZmluZWQge1xuICBpZiAoIWN0cmwpIHJldHVybjtcbiAgaWYgKGN0cmwubG9hZGluZygpKSByZXR1cm4gW2goJ2Rpdi5sb2FkaW5nJywgc3Bpbm5lcigpKV07XG4gIGNvbnN0IGRhdGEgPSBjdHJsLmRhdGEoKTtcbiAgaWYgKCFkYXRhKSByZXR1cm47XG4gIGNvbnN0IHBlcm1zID0gY3RybC5wZXJtaXNzaW9ucygpO1xuXG4gIGNvbnN0IGluZm9zID0gZGF0YS5oaXN0b3J5ID8gaCgnZGl2LmluZm9zLmJsb2NrJywgW1xuICAgIHdpbmRvdy5saWNoZXNzLm51bWJlckZvcm1hdChkYXRhLmdhbWVzIHx8IDApICsgJyBnYW1lcycsXG4gICAgZGF0YS50cm9sbCA/ICdUUk9MTCcgOiB1bmRlZmluZWQsXG4gICAgZGF0YS5lbmdpbmUgPyAnRU5HSU5FJyA6IHVuZGVmaW5lZCxcbiAgICBkYXRhLmJvb3N0ZXIgPyAnQk9PU1RFUicgOiB1bmRlZmluZWRcbiAgXS5tYXAodCA9PiB0ICYmIGgoJ3NwYW4nLCB0KSkuY29uY2F0KFtcbiAgICBoKCdhJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgaHJlZjogJy9ALycgKyBkYXRhLnVzZXJuYW1lICsgJz9tb2QnXG4gICAgICB9XG4gICAgfSwgJ3Byb2ZpbGUnKVxuICBdKS5jb25jYXQoXG4gICAgcGVybXMuc2hhZG93YmFuID8gW1xuICAgICAgaCgnYScsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBocmVmOiAnL21vZC8nICsgZGF0YS51c2VybmFtZSArICcvY29tbXVuaWNhdGlvbidcbiAgICAgICAgfVxuICAgICAgfSwgJ2NvbXMnKVxuICAgIF0gOiBbXSkpIDogdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgdGltZW91dCA9IHBlcm1zLnRpbWVvdXQgPyBoKCdkaXYudGltZW91dC5ibG9jaycsIFtcbiAgICAgIGgoJ3N0cm9uZycsICdUaW1lb3V0IDEwIG1pbnV0ZXMgZm9yJyksXG4gICAgICAuLi5jdHJsLnJlYXNvbnMubWFwKHIgPT4ge1xuICAgICAgICByZXR1cm4gaCgnYS50ZXh0Jywge1xuICAgICAgICAgIGF0dHJzOiB7ICdkYXRhLWljb24nOiAncCcgfSxcbiAgICAgICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwudGltZW91dChyKSlcbiAgICAgICAgfSwgci5uYW1lKTtcbiAgICAgIH0pLFxuICAgICAgLi4uKFxuICAgICAgICAoZGF0YS50cm9sbCB8fCAhcGVybXMuc2hhZG93YmFuKSA/IFtdIDogW2goJ2Rpdi5zaGFkb3diYW4nLCBbXG4gICAgICAgICAgJ09yICcsXG4gICAgICAgICAgaCgnYnV0dG9uLmJ1dHRvbi5idXR0b24tcmVkLmJ1dHRvbi1lbXB0eScsIHtcbiAgICAgICAgICAgIGhvb2s6IGJpbmQoJ2NsaWNrJywgY3RybC5zaGFkb3diYW4pXG4gICAgICAgICAgfSwgJ3NoYWRvd2JhbicpXG4gICAgICAgIF0pXSlcbiAgICBdKSA6IGgoJ2Rpdi50aW1lb3V0LmJsb2NrJywgW1xuICAgICAgaCgnc3Ryb25nJywgJ01vZGVyYXRpb24nKSxcbiAgICAgIGgoJ2EudGV4dCcsIHtcbiAgICAgICAgYXR0cnM6IHsgJ2RhdGEtaWNvbic6ICdwJyB9LFxuICAgICAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IGN0cmwudGltZW91dChjdHJsLnJlYXNvbnNbMF0pKVxuICAgICAgfSwgJ1RpbWVvdXQgMTAgbWludXRlcycpXG4gICAgXSk7XG5cbiAgICBjb25zdCBoaXN0b3J5ID0gZGF0YS5oaXN0b3J5ID8gaCgnZGl2Lmhpc3RvcnkuYmxvY2snLCBbXG4gICAgICBoKCdzdHJvbmcnLCAnVGltZW91dCBoaXN0b3J5JyksXG4gICAgICBoKCd0YWJsZScsIGgoJ3Rib2R5LnNsaXN0Jywge1xuICAgICAgICBob29rOiB7XG4gICAgICAgICAgaW5zZXJ0OiAoKSA9PiB3aW5kb3cubGljaGVzcy5wdWJzdWIuZW1pdCgnY29udGVudF9sb2FkZWQnKVxuICAgICAgICB9XG4gICAgICB9LCBkYXRhLmhpc3RvcnkubWFwKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIGgoJ3RyJywgW1xuICAgICAgICAgIGgoJ3RkLnJlYXNvbicsIGUucmVhc29uKSxcbiAgICAgICAgICBoKCd0ZC5tb2QnLCBlLm1vZCksXG4gICAgICAgICAgaCgndGQnLCBoKCd0aW1lLnRpbWVhZ28nLCB7XG4gICAgICAgICAgICBhdHRyczogeyBkYXRldGltZTogZS5kYXRlIH1cbiAgICAgICAgICB9KSlcbiAgICAgICAgXSk7XG4gICAgICB9KSkpXG4gICAgXSkgOiB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gW1xuICAgICAgaCgnZGl2LnRvcCcsIHsga2V5OiAnbW9kLScgKyBkYXRhLmlkIH0sIFtcbiAgICAgICAgaCgnc3Bhbi50ZXh0Jywge1xuICAgICAgICAgIGF0dHJzOiB7J2RhdGEtaWNvbic6ICfugIInIH0sXG4gICAgICAgIH0sIFt1c2VyTGluayhkYXRhLnVzZXJuYW1lKV0pLFxuICAgICAgICBoKCdhJywge1xuICAgICAgICAgIGF0dHJzOiB7J2RhdGEtaWNvbic6ICdMJ30sXG4gICAgICAgICAgaG9vazogYmluZCgnY2xpY2snLCBjdHJsLmNsb3NlKVxuICAgICAgICB9KVxuICAgICAgXSksXG4gICAgICBoKCdkaXYubWNoYXRfX2NvbnRlbnQubW9kZXJhdGlvbicsIFtcbiAgICAgICAgaW5mb3MsXG4gICAgICAgIHRpbWVvdXQsXG4gICAgICAgIGhpc3RvcnlcbiAgICAgIF0pXG4gICAgXTtcbn07XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnc25hYmJkb20nXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3NuYWJiZG9tL3Zub2RlJ1xuaW1wb3J0IHsgTm90ZUN0cmwsIE5vdGVPcHRzIH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0ICogYXMgeGhyIGZyb20gJy4veGhyJ1xuaW1wb3J0IHsgc3Bpbm5lciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIG5vdGVDdHJsKG9wdHM6IE5vdGVPcHRzKTogTm90ZUN0cmwge1xuICBsZXQgdGV4dDogc3RyaW5nXG4gIGNvbnN0IGRvUG9zdCA9IHdpbmRvdy5saWNoZXNzLmRlYm91bmNlKCgpID0+IHtcbiAgICB4aHIuc2V0Tm90ZShvcHRzLmlkLCB0ZXh0KTtcbiAgfSwgMTAwMCk7XG4gIHJldHVybiB7XG4gICAgaWQ6IG9wdHMuaWQsXG4gICAgdHJhbnM6IG9wdHMudHJhbnMsXG4gICAgdGV4dDogKCkgPT4gdGV4dCxcbiAgICBmZXRjaCgpIHtcbiAgICAgIHhoci5nZXROb3RlKG9wdHMuaWQpLnRoZW4odCA9PiB7XG4gICAgICAgIHRleHQgPSB0IHx8ICcnO1xuICAgICAgICBvcHRzLnJlZHJhdygpXG4gICAgICB9KVxuICAgIH0sXG4gICAgcG9zdCh0KSB7XG4gICAgICB0ZXh0ID0gdDtcbiAgICAgIGRvUG9zdCgpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RlVmlldyhjdHJsOiBOb3RlQ3RybCk6IFZOb2RlIHtcbiAgY29uc3QgdGV4dCA9IGN0cmwudGV4dCgpO1xuICBpZiAodGV4dCA9PSB1bmRlZmluZWQpIHJldHVybiBoKCdkaXYubG9hZGluZycsIHtcbiAgICBob29rOiB7XG4gICAgICBpbnNlcnQ6IGN0cmwuZmV0Y2hcbiAgICB9LFxuICB9LCBbc3Bpbm5lcigpXSlcbiAgcmV0dXJuIGgoJ3RleHRhcmVhJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBwbGFjZWhvbGRlcjogY3RybC50cmFucygndHlwZVByaXZhdGVOb3Rlc0hlcmUnKVxuICAgIH0sXG4gICAgaG9vazoge1xuICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgIGNvbnN0ICRlbCA9ICQodm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgJGVsLnZhbCh0ZXh0KS5vbignY2hhbmdlIGtleXVwIHBhc3RlJywgKCkgPT4ge1xuICAgICAgICAgIGN0cmwucG9zdCgkZWwudmFsKCkpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IGJpbmQgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBSZWRyYXcgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlc2V0Q3RybCB7XG4gIGdyb3VwKCk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICBzYWlkKCk6IHN0cmluZ1tdXG4gIHNldEdyb3VwKGdyb3VwOiBzdHJpbmcgfCB1bmRlZmluZWQpOiB2b2lkXG4gIHBvc3QocHJlc2V0OiBQcmVzZXQpOiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIFByZXNldEtleSA9IHN0cmluZ1xuZXhwb3J0IHR5cGUgUHJlc2V0VGV4dCA9IHN0cmluZ1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZXNldCB7XG4gIGtleTogUHJlc2V0S2V5XG4gIHRleHQ6IFByZXNldFRleHRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVzZXRHcm91cHMge1xuICBzdGFydDogUHJlc2V0W11cbiAgZW5kOiBQcmVzZXRbXVxuICBba2V5OiBzdHJpbmddOiBQcmVzZXRbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByZXNldE9wdHMge1xuICBpbml0aWFsR3JvdXA/OiBzdHJpbmdcbiAgcmVkcmF3OiBSZWRyYXdcbiAgcG9zdCh0ZXh0OiBzdHJpbmcpOiB2b2lkXG59XG5cbmNvbnN0IGdyb3VwczogUHJlc2V0R3JvdXBzID0ge1xuICBzdGFydDogW1xuICAgICdoaS9IZWxsbycsICdnbC9Hb29kIGx1Y2snLCAnaGYvSGF2ZSBmdW4hJywgJ3UyL1lvdSB0b28hJ1xuICBdLm1hcChzcGxpdEl0KSxcbiAgZW5kOiBbXG4gICAgJ2dnL0dvb2QgZ2FtZScsICd3cC9XZWxsIHBsYXllZCcsICd0eS9UaGFuayB5b3UnLCAnZ3RnL0lcXCd2ZSBnb3QgdG8gZ28nLCAnYnllL0J5ZSEnXG4gIF0ubWFwKHNwbGl0SXQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVzZXRDdHJsKG9wdHM6IFByZXNldE9wdHMpOiBQcmVzZXRDdHJsIHtcblxuICBsZXQgZ3JvdXA6IHN0cmluZyB8IHVuZGVmaW5lZCA9IG9wdHMuaW5pdGlhbEdyb3VwO1xuXG4gIGxldCBzYWlkOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHJldHVybiB7XG4gICAgZ3JvdXA6ICgpID0+IGdyb3VwLFxuICAgIHNhaWQ6ICgpID0+IHNhaWQsXG4gICAgc2V0R3JvdXAocDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgICBpZiAocCAhPT0gZ3JvdXApIHtcbiAgICAgICAgZ3JvdXAgPSBwO1xuICAgICAgICBpZiAoIXApIHNhaWQgPSBbXTtcbiAgICAgICAgb3B0cy5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHBvc3QocHJlc2V0KSB7XG4gICAgICBpZiAoIWdyb3VwKSByZXR1cm47XG4gICAgICBjb25zdCBzZXRzID0gZ3JvdXBzW2dyb3VwXTtcbiAgICAgIGlmICghc2V0cykgcmV0dXJuO1xuICAgICAgaWYgKHNhaWQuaW5jbHVkZXMocHJlc2V0LmtleSkpIHJldHVybjtcbiAgICAgIG9wdHMucG9zdChwcmVzZXQudGV4dCk7XG4gICAgICBzYWlkLnB1c2gocHJlc2V0LmtleSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVzZXRWaWV3KGN0cmw6IFByZXNldEN0cmwpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGdyb3VwID0gY3RybC5ncm91cCgpO1xuICBpZiAoIWdyb3VwKSByZXR1cm47XG4gIGNvbnN0IHNldHMgPSBncm91cHNbZ3JvdXBdO1xuICBjb25zdCBzYWlkID0gY3RybC5zYWlkKCk7XG4gIHJldHVybiAoc2V0cyAmJiBzYWlkLmxlbmd0aCA8IDIpID8gaCgnZGl2Lm1jaGF0X19wcmVzZXRzJywgc2V0cy5tYXAoKHA6IFByZXNldCkgPT4ge1xuICAgIGNvbnN0IGRpc2FibGVkID0gc2FpZC5pbmNsdWRlcyhwLmtleSk7XG4gICAgcmV0dXJuIGgoJ3NwYW4nLCB7XG4gICAgICBjbGFzczoge1xuICAgICAgICBkaXNhYmxlZFxuICAgICAgfSxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIHRpdGxlOiBwLnRleHQsXG4gICAgICAgIGRpc2FibGVkXG4gICAgICB9LFxuICAgICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiB7ICFkaXNhYmxlZCAmJiBjdHJsLnBvc3QocCkgfSlcbiAgICB9LCBwLmtleSk7XG4gIH0pKSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gc3BsaXRJdChzOiBzdHJpbmcpOiBQcmVzZXQge1xuICBjb25zdCBwYXJ0cyA9IHMuc3BsaXQoJy8nKTtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IHBhcnRzWzBdLFxuICAgIHRleHQ6IHBhcnRzWzFdXG4gIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBza2lwKHR4dDogc3RyaW5nKSB7XG4gIHJldHVybiBhbmFseXNlKHR4dCkgJiYgd2luZG93LmxpY2hlc3Muc3RvcmFnZS5nZXQoJ2NoYXQtc3BhbScpICE9ICcxJztcbn1cbmV4cG9ydCBmdW5jdGlvbiBoYXNUZWFtVXJsKHR4dDogc3RyaW5nKSB7XG4gIHJldHVybiAhIXR4dC5tYXRjaCh0ZWFtVXJsUmVnZXgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydCh0eHQ6IHN0cmluZykge1xuICBpZiAoYW5hbHlzZSh0eHQpKSB7XG4gICAgJC5wb3N0KCcvanNsb2cvJyArIHdpbmRvdy5sb2NhdGlvbi5ocmVmLnN1YnN0cigtMTIpICsgJz9uPXNwYW0nKTtcbiAgICB3aW5kb3cubGljaGVzcy5zdG9yYWdlLnNldCgnY2hhdC1zcGFtJywgJzEnKTtcbiAgfVxufVxuXG5jb25zdCBzcGFtUmVnZXggPSBuZXcgUmVnRXhwKFtcbiAgJ3hjYW13ZWIuY29tJyxcbiAgJyhefFteaV0pY2hlc3MtYm90JyxcbiAgJ2NoZXNzLWNoZWF0JyxcbiAgJ2Nvb2x0ZWVuYml0Y2gnLFxuICAnbGV0Y2FmYS53ZWJjYW0nLFxuICAndGlueXVybC5jb20vJyxcbiAgJ3dvb2dhLmluZm8vJyxcbiAgJ2JpdC5seS8nLFxuICAnd2J0LmxpbmsvJyxcbiAgJ2ViLmJ5LycsXG4gICcwMDEucnMvJyxcbiAgJ3Noci5uYW1lLycsXG4gICd1LnRvLycsXG4gICcuMy1hLm5ldCcsXG4gICcuc3NsNDQzLm9yZycsXG4gICcubnMwMi51cycsXG4gICcubXlmdHAuaW5mbycsXG4gICcuZmxpbmt1cC5jb20nLFxuICAnLnNlcnZldXNlcnMuY29tJyxcbiAgJ2JhZG9vZ2lybHMuY29tJyxcbiAgJ2hpZGUuc3UnLFxuICAnd3lvbi5kZScsXG4gICdzZXhkYXRpbmdjei5jbHViJ1xuXS5tYXAodXJsID0+IHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC4vZywgJ1xcXFwuJykucmVwbGFjZSgvXFwvL2csICdcXFxcLycpO1xufSkuam9pbignfCcpKTtcblxuZnVuY3Rpb24gYW5hbHlzZSh0eHQ6IHN0cmluZykge1xuICByZXR1cm4gISF0eHQubWF0Y2goc3BhbVJlZ2V4KTtcbn1cblxuY29uc3QgdGVhbVVybFJlZ2V4ID0gL2xpY2hlc3NcXC5vcmdcXC90ZWFtXFwvL1xuIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJMaW5rKHU6IHN0cmluZywgdGl0bGU/OiBzdHJpbmcpIHtcbiAgY29uc3QgdHJ1bmMgPSB1LnN1YnN0cmluZygwLCAxNCk7XG4gIHJldHVybiBoKCdhJywge1xuICAgIC8vIGNhbid0IGJlIGlubGluZWQgYmVjYXVzZSBvZiB0aHVua3NcbiAgICBjbGFzczoge1xuICAgICAgJ3VzZXItbGluayc6IHRydWUsXG4gICAgICB1bHB0OiB0cnVlXG4gICAgfSxcbiAgICBhdHRyczoge1xuICAgICAgaHJlZjogJy9ALycgKyB1XG4gICAgfVxuICB9LCB0aXRsZSA/IFtcbiAgICBoKFxuICAgICAgJ3NwYW4udGl0bGUnLFxuICAgICAgdGl0bGUgPT0gJ0JPVCcgPyB7IGF0dHJzOiB7J2RhdGEtYm90JzogdHJ1ZSB9IH0gOiB7fSxcbiAgICAgIHRpdGxlKSwgdHJ1bmNcbiAgXSA6IFt0cnVuY10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3Bpbm5lcigpIHtcbiAgcmV0dXJuIGgoJ2Rpdi5zcGlubmVyJywgW1xuICAgIGgoJ3N2ZycsIHsgYXR0cnM6IHsgdmlld0JveDogJzAgMCA0MCA0MCcgfSB9LCBbXG4gICAgICBoKCdjaXJjbGUnLCB7XG4gICAgICAgIGF0dHJzOiB7IGN4OiAyMCwgY3k6IDIwLCByOiAxOCwgZmlsbDogJ25vbmUnIH1cbiAgICAgIH0pXSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmQoZXZlbnROYW1lOiBzdHJpbmcsIGY6IChlOiBFdmVudCkgPT4gdm9pZCkge1xuICByZXR1cm4ge1xuICAgIGluc2VydDogKHZub2RlOiBWTm9kZSkgPT4ge1xuICAgICAgKHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCkuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGYpO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBDdHJsLCBUYWIgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgZGlzY3Vzc2lvblZpZXcgZnJvbSAnLi9kaXNjdXNzaW9uJ1xuaW1wb3J0IHsgbm90ZVZpZXcgfSBmcm9tICcuL25vdGUnXG5pbXBvcnQgeyBtb2RlcmF0aW9uVmlldyB9IGZyb20gJy4vbW9kZXJhdGlvbidcbmltcG9ydCB7IGJpbmQgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IEN0cmwpOiBWTm9kZSB7XG5cbiAgY29uc3QgbW9kID0gY3RybC5tb2RlcmF0aW9uKCk7XG5cbiAgcmV0dXJuIGgoJ3NlY3Rpb24ubWNoYXQnICsgKGN0cmwub3B0cy5hbHdheXNFbmFibGVkID8gJycgOiAnLm1jaGF0LW9wdGlvbmFsJyksIHtcbiAgICBjbGFzczoge1xuICAgICAgJ21jaGF0LW1vZCc6ICEhbW9kXG4gICAgfSxcbiAgICBob29rOiB7XG4gICAgICBkZXN0cm95OiBjdHJsLmRlc3Ryb3lcbiAgICB9XG4gIH0sIG1vZGVyYXRpb25WaWV3KG1vZCkgfHwgbm9ybWFsVmlldyhjdHJsKSlcbn1cblxuZnVuY3Rpb24gcmVuZGVyUGFsYW50aXIoY3RybDogQ3RybCkge1xuICBjb25zdCBwID0gY3RybC5wYWxhbnRpcjtcbiAgaWYgKCFwLmVuYWJsZWQoKSkgcmV0dXJuO1xuICByZXR1cm4gcC5pbnN0YW5jZSA/IHAuaW5zdGFuY2UucmVuZGVyKGgpIDogaCgnZGl2Lm1jaGF0X190YWIucGFsYW50aXIucGFsYW50aXItc2xvdCcse1xuICAgIGF0dHJzOiB7XG4gICAgICAnZGF0YS1pY29uJzogJ+6AoCcsXG4gICAgICB0aXRsZTogJ1ZvaWNlIGNoYXQnXG4gICAgfSxcbiAgICBob29rOiBiaW5kKCdjbGljaycsICgpID0+IHtcbiAgICAgIGlmICghcC5sb2FkZWQpIHtcbiAgICAgICAgcC5sb2FkZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBsaSA9IHdpbmRvdy5saWNoZXNzO1xuICAgICAgICBsaS5sb2FkU2NyaXB0KCdqYXZhc2NyaXB0cy92ZW5kb3IvcGVlcmpzLm1pbi5qcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGxpLmxvYWRTY3JpcHQobGkuY29tcGlsZWRTY3JpcHQoJ3BhbGFudGlyJykpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcC5pbnN0YW5jZSA9IHdpbmRvdy5QYWxhbnRpciEucGFsYW50aXIoe1xuICAgICAgICAgICAgICB1aWQ6IGN0cmwuZGF0YS51c2VySWQsXG4gICAgICAgICAgICAgIHJlZHJhdzogY3RybC5yZWRyYXdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY3RybC5yZWRyYXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSlcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbFZpZXcoY3RybDogQ3RybCkge1xuICBjb25zdCBhY3RpdmUgPSBjdHJsLnZtLnRhYjtcbiAgcmV0dXJuIFtcbiAgICBoKCdkaXYubWNoYXRfX3RhYnMubmJfJyArIGN0cmwuYWxsVGFicy5sZW5ndGgsIFtcbiAgICAgIC4uLmN0cmwuYWxsVGFicy5tYXAodCA9PiByZW5kZXJUYWIoY3RybCwgdCwgYWN0aXZlKSksXG4gICAgICByZW5kZXJQYWxhbnRpcihjdHJsKVxuICAgIF0pLFxuICAgIGgoJ2Rpdi5tY2hhdF9fY29udGVudC4nICsgYWN0aXZlLFxuICAgICAgKGFjdGl2ZSA9PT0gJ25vdGUnICYmIGN0cmwubm90ZSkgPyBbbm90ZVZpZXcoY3RybC5ub3RlKV0gOiAoXG4gICAgICAgIGN0cmwucGx1Z2luICYmIGFjdGl2ZSA9PT0gY3RybC5wbHVnaW4udGFiLmtleSA/IFtjdHJsLnBsdWdpbi52aWV3KCldIDogZGlzY3Vzc2lvblZpZXcoY3RybClcbiAgICAgICkpXG4gIF1cbn1cblxuZnVuY3Rpb24gcmVuZGVyVGFiKGN0cmw6IEN0cmwsIHRhYjogVGFiLCBhY3RpdmU6IFRhYikge1xuICByZXR1cm4gaCgnZGl2Lm1jaGF0X190YWIuJyArIHRhYiwge1xuICAgIGNsYXNzOiB7ICdtY2hhdF9fdGFiLWFjdGl2ZSc6IHRhYiA9PT0gYWN0aXZlIH0sXG4gICAgaG9vazogYmluZCgnY2xpY2snLCAoKSA9PiBjdHJsLnNldFRhYih0YWIpKVxuICB9LCB0YWJOYW1lKGN0cmwsIHRhYikpO1xufVxuXG5mdW5jdGlvbiB0YWJOYW1lKGN0cmw6IEN0cmwsIHRhYjogVGFiKSB7XG4gIGlmICh0YWIgPT09ICdkaXNjdXNzaW9uJykgcmV0dXJuIFtcbiAgICBoKCdzcGFuJywgY3RybC5kYXRhLm5hbWUpLFxuICAgIGN0cmwub3B0cy5hbHdheXNFbmFibGVkID8gdW5kZWZpbmVkIDogaCgnaW5wdXQnLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICB0aXRsZTogY3RybC50cmFucy5ub2FyZygndG9nZ2xlVGhlQ2hhdCcpLFxuICAgICAgICBjaGVja2VkOiBjdHJsLnZtLmVuYWJsZWRcbiAgICAgIH0sXG4gICAgICBob29rOiBiaW5kKCdjaGFuZ2UnLCAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgY3RybC5zZXRFbmFibGVkKChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkKTtcbiAgICAgIH0pXG4gICAgfSlcbiAgXTtcbiAgaWYgKHRhYiA9PT0gJ25vdGUnKSByZXR1cm4gW2goJ3NwYW4nLCBjdHJsLnRyYW5zLm5vYXJnKCdub3RlcycpKV07XG4gIGlmIChjdHJsLnBsdWdpbiAmJiB0YWIgPT09IGN0cmwucGx1Z2luLnRhYi5rZXkpIHJldHVybiBbaCgnc3BhbicsIGN0cmwucGx1Z2luLnRhYi5uYW1lKV07XG4gIHJldHVybiBbXTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiB1c2VyTW9kSW5mbyh1c2VybmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiAkLmdldCgnL21vZC9jaGF0LXVzZXIvJyArIHVzZXJuYW1lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhZyhyZXNvdXJjZTogc3RyaW5nLCB1c2VybmFtZTogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpIHtcbiAgcmV0dXJuICQucG9zdCgnL3JlcG9ydC9mbGFnJywgeyB1c2VybmFtZSwgcmVzb3VyY2UsIHRleHQgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlKGlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuICQuZ2V0KG5vdGVVcmwoaWQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE5vdGUoaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nKSB7XG4gIHJldHVybiAkLnBvc3Qobm90ZVVybChpZCksIHsgdGV4dCB9KVxufVxuXG5mdW5jdGlvbiBub3RlVXJsKGlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGAvJHtpZH0vbm90ZWA7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZGVmaW5lZDxBPih2OiBBIHwgdW5kZWZpbmVkKTogdiBpcyBBIHtcbiAgcmV0dXJuIHR5cGVvZiB2ICE9PSAndW5kZWZpbmVkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtcHR5KGE6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWEgfHwgYS5sZW5ndGggPT09IDA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcDxUPiB7XG4gICgpOiBUXG4gICh2OiBUKTogVFxufVxuXG4vLyBsaWtlIG1pdGhyaWwgcHJvcCBidXQgd2l0aCB0eXBlIHNhZmV0eVxuZXhwb3J0IGZ1bmN0aW9uIHByb3A8QT4oaW5pdGlhbFZhbHVlOiBBKTogUHJvcDxBPiB7XG4gIGxldCB2YWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgY29uc3QgZnVuID0gZnVuY3Rpb24odjogQSB8IHVuZGVmaW5lZCkge1xuICAgIGlmIChkZWZpbmVkKHYpKSB2YWx1ZSA9IHY7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuICByZXR1cm4gZnVuIGFzIFByb3A8QT47XG59XG4iLCJpbXBvcnQgeyBHYW1lRGF0YSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9vcm5pY2FyL3NjYWxhY2hlc3MvYmxvYi9tYXN0ZXIvc3JjL21haW4vc2NhbGEvU3RhdHVzLnNjYWxhXG5cbmV4cG9ydCBjb25zdCBpZHMgPSB7XG4gIGNyZWF0ZWQ6IDEwLFxuICBzdGFydGVkOiAyMCxcbiAgYWJvcnRlZDogMjUsXG4gIG1hdGU6IDMwLFxuICByZXNpZ246IDMxLFxuICBzdGFsZW1hdGU6IDMyLFxuICB0aW1lb3V0OiAzMyxcbiAgZHJhdzogMzQsXG4gIG91dG9mdGltZTogMzUsXG4gIGNoZWF0OiAzNixcbiAgbm9TdGFydDogMzcsXG4gIHZhcmlhbnRFbmQ6IDYwXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRlZChkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gZGF0YS5nYW1lLnN0YXR1cy5pZCA+PSBpZHMuc3RhcnRlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmlzaGVkKGRhdGE6IEdhbWVEYXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiBkYXRhLmdhbWUuc3RhdHVzLmlkID49IGlkcy5tYXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWJvcnRlZChkYXRhOiBHYW1lRGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gZGF0YS5nYW1lLnN0YXR1cy5pZCA9PT0gaWRzLmFib3J0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5aW5nKGRhdGE6IEdhbWVEYXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiBzdGFydGVkKGRhdGEpICYmICFmaW5pc2hlZChkYXRhKSAmJiAhYWJvcnRlZChkYXRhKTtcbn1cbiIsInZhciBzb2NrZXQgPSByZXF1aXJlKCcuL3NvY2tldCcpO1xudmFyIHNpbXVsID0gcmVxdWlyZSgnLi9zaW11bCcpO1xudmFyIHRleHQgPSByZXF1aXJlKCcuL3RleHQnKTtcbnZhciB4aHIgPSByZXF1aXJlKCcuL3hocicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVudikge1xuXG4gIHRoaXMuZW52ID0gZW52O1xuXG4gIHRoaXMuZGF0YSA9IGVudi5kYXRhO1xuXG4gIHRoaXMudXNlcklkID0gZW52LnVzZXJJZDtcblxuICB0aGlzLnNvY2tldCA9IG5ldyBzb2NrZXQoZW52LnNvY2tldFNlbmQsIHRoaXMpO1xuICB0aGlzLnRleHQgPSB0ZXh0LmN0cmwoKTtcblxuICB0aGlzLnJlbG9hZCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBkYXRhLnRlYW0gPSB0aGlzLmRhdGEuc2ltdWw7IC8vIHJlbG9hZCBkYXRhIGRvZXMgbm90IGNvbnRhaW4gdGhlIHNpbXVsIGFueW1vcmVcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHN0YXJ0V2F0Y2hpbmcoKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHZhciBhbHJlYWR5V2F0Y2hpbmcgPSBbXTtcbiAgdmFyIHN0YXJ0V2F0Y2hpbmcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV3SWRzID0gdGhpcy5kYXRhLnBhaXJpbmdzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgICByZXR1cm4gcC5nYW1lLmlkO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuICFhbHJlYWR5V2F0Y2hpbmcuaW5jbHVkZXMoaWQpO1xuICAgIH0pO1xuICAgIGlmIChuZXdJZHMubGVuZ3RoKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKFwic3RhcnRXYXRjaGluZ1wiLCBuZXdJZHMuam9pbignICcpKTtcbiAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XG4gICAgICBuZXdJZHMuZm9yRWFjaChhbHJlYWR5V2F0Y2hpbmcucHVzaC5iaW5kKGFscmVhZHlXYXRjaGluZykpO1xuICAgIH1cbiAgfS5iaW5kKHRoaXMpO1xuICBzdGFydFdhdGNoaW5nKCk7XG5cbiAgaWYgKHNpbXVsLmNyZWF0ZWRCeU1lKHRoaXMpICYmIHRoaXMuZGF0YS5pc0NyZWF0ZWQpXG4gICAgbGljaGVzcy5zdG9yYWdlLnNldCgnbGljaGVzcy5tb3ZlX29uJywgJzEnKTsgLy8gaGlkZW91cyBoYWNrIDpEXG5cbiAgdGhpcy50cmFucyA9IGxpY2hlc3MudHJhbnMoZW52LmkxOG4pO1xuXG4gIHRoaXMudGVhbUJsb2NrID0gdGhpcy5kYXRhLnRlYW0gJiYgIXRoaXMuZGF0YS50ZWFtLmlzSW47XG5cbiAgdGhpcy5ob3N0UGluZyA9ICgpID0+IHtcbiAgICBpZiAoc2ltdWwuY3JlYXRlZEJ5TWUodGhpcykgJiYgdGhpcy5kYXRhLmlzQ3JlYXRlZCkge1xuICAgICAgeGhyLnBpbmcodGhpcyk7XG4gICAgICBzZXRUaW1lb3V0KHRoaXMuaG9zdFBpbmcsIDIwMDAwKTtcbiAgICB9XG4gIH07XG4gIHRoaXMuaG9zdFBpbmcoKTtcbn07XG4iLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxudmFyIGN0cmwgPSByZXF1aXJlKCcuL2N0cmwnKTtcbnZhciB2aWV3ID0gcmVxdWlyZSgnLi92aWV3L21haW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRzKSB7XG5cbiAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgY3RybChvcHRzKTtcblxuICBtLm1vZHVsZShvcHRzLmVsZW1lbnQsIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjb250cm9sbGVyO1xuICAgIH0sXG4gICAgdmlldzogdmlld1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHNvY2tldFJlY2VpdmU6IGNvbnRyb2xsZXIuc29ja2V0LnJlY2VpdmVcbiAgfTtcbn07XG5cbndpbmRvdy5MaWNoZXNzQ2hhdCA9IHJlcXVpcmUoJ2NoYXQnKTtcbiIsInZhciBzdGF0dXMgPSByZXF1aXJlKCdnYW1lL3N0YXR1cycpO1xuXG5mdW5jdGlvbiBhcHBsaWNhbnRzQ29udGFpbk1lKGN0cmwpIHtcbiAgcmV0dXJuIGN0cmwuZGF0YS5hcHBsaWNhbnRzLmZpbHRlcihmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIGEucGxheWVyLmlkID09PSBjdHJsLnVzZXJJZDtcbiAgfSkubGVuZ3RoID4gMFxufVxuXG5mdW5jdGlvbiBwYWlyaW5nc0NvbnRhaW5NZShjdHJsKSB7XG4gIHJldHVybiBjdHJsLmRhdGEucGFpcmluZ3MuZmlsdGVyKGZ1bmN0aW9uKGEpIHtcbiAgICByZXR1cm4gYS5wbGF5ZXIuaWQgPT09IGN0cmwudXNlcklkO1xuICB9KS5sZW5ndGggPiAwXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGVkQnlNZTogZnVuY3Rpb24oY3RybCkge1xuICAgIHJldHVybiBjdHJsLnVzZXJJZCAmJiBjdHJsLnVzZXJJZCA9PT0gY3RybC5kYXRhLmhvc3QuaWQ7XG4gIH0sXG4gIGNvbnRhaW5zTWU6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICByZXR1cm4gY3RybC51c2VySWQgJiYgKGFwcGxpY2FudHNDb250YWluTWUoY3RybCkgfHwgcGFpcmluZ3NDb250YWluTWUoY3RybCkpO1xuICB9LFxuICBjYW5kaWRhdGVzOiBmdW5jdGlvbihjdHJsKSB7XG4gICAgcmV0dXJuIGN0cmwuZGF0YS5hcHBsaWNhbnRzLmZpbHRlcihmdW5jdGlvbihhKSB7XG4gICAgICByZXR1cm4gIWEuYWNjZXB0ZWQ7XG4gICAgfSk7XG4gIH0sXG4gIGFjY2VwdGVkOiBmdW5jdGlvbihjdHJsKSB7XG4gICAgcmV0dXJuIGN0cmwuZGF0YS5hcHBsaWNhbnRzLmZpbHRlcihmdW5jdGlvbihhKSB7XG4gICAgICByZXR1cm4gYS5hY2NlcHRlZDtcbiAgICB9KTtcbiAgfSxcbiAgYWNjZXB0ZWRDb250YWluc01lOiBmdW5jdGlvbihjdHJsKSB7XG4gICAgcmV0dXJuIGN0cmwuZGF0YS5hcHBsaWNhbnRzLmZpbHRlcihmdW5jdGlvbihhKSB7XG4gICAgICByZXR1cm4gYS5hY2NlcHRlZCAmJiBhLnBsYXllci5pZCA9PT0gY3RybC51c2VySWQ7XG4gICAgfSkubGVuZ3RoID4gMFxuICB9LFxuICBteUN1cnJlbnRQYWlyaW5nOiBmdW5jdGlvbihjdHJsKSB7XG4gICAgaWYgKCFjdHJsLnVzZXJJZCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIGN0cmwuZGF0YS5wYWlyaW5ncy5maW5kKGZ1bmN0aW9uKHApIHtcbiAgICAgIHJldHVybiBwLmdhbWUuc3RhdHVzIDwgc3RhdHVzLmlkcy5tYXRlICYmIHAucGxheWVyLmlkID09PSBjdHJsLnVzZXJJZDtcbiAgICB9KTtcbiAgfVxufTtcbiIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNlbmQsIGN0cmwpIHtcblxuICB0aGlzLnNlbmQgPSBzZW5kO1xuXG4gIHZhciBoYW5kbGVycyA9IHtcbiAgICByZWxvYWQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGN0cmwucmVsb2FkKGRhdGEpO1xuICAgICAgbS5yZWRyYXcoKTtcbiAgICB9LFxuICAgIGFib3J0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgbGljaGVzcy5yZWxvYWQoKTtcbiAgICB9LFxuICAgIGhvc3RHYW1lOiBmdW5jdGlvbihnYW1lSWQpIHtcbiAgICAgIGN0cmwuZGF0YS5ob3N0LmdhbWVJZCA9IGdhbWVJZDtcbiAgICAgIG0ucmVkcmF3KCk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMucmVjZWl2ZSA9IGZ1bmN0aW9uKHR5cGUsIGRhdGEpIHtcbiAgICBpZiAoaGFuZGxlcnNbdHlwZV0pIHtcbiAgICAgIGhhbmRsZXJzW3R5cGVdKGRhdGEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfS5iaW5kKHRoaXMpO1xufTtcbiIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xudmFyIHNpbXVsID0gcmVxdWlyZSgnLi9zaW11bCcpO1xudmFyIHhociA9IHJlcXVpcmUoJy4veGhyJyk7XG5cbmZ1bmN0aW9uIGVucmljaFRleHQodGV4dCkge1xuICByZXR1cm4gbS50cnVzdChhdXRvbGluayhsaWNoZXNzLmVzY2FwZUh0bWwodGV4dCksIHRvTGluaykucmVwbGFjZShuZXdMaW5lUmVnZXgsICc8YnI+JykpO1xufVxuZnVuY3Rpb24gYXV0b2xpbmsoc3RyLCBjYWxsYmFjaykge1xuICByZXR1cm4gc3RyLnJlcGxhY2UobGlua1JlZ2V4LCBmdW5jdGlvbihfLCBzcGFjZSwgdXJsKSB7IHJldHVybiBzcGFjZSArIGNhbGxiYWNrKHVybCkgfSk7XG59XG5mdW5jdGlvbiB0b0xpbmsodXJsKSB7XG4gIHJldHVybiAnPGEgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9mb2xsb3dcIiBocmVmPVwiJyArIHVybCArICdcIj4nICsgdXJsLnJlcGxhY2UoL2h0dHBzPzpcXC9cXC8vLCAnJykgKyAnPC9hPic7XG59XG4vLyBmcm9tIHVpL2FuYWx5c2VcbnZhciBsaW5rUmVnZXggPSAvKF58W1xcc1xcbl18PFtBLVphLXpdKlxcLz8+KSgoPzpodHRwcz98ZnRwKTpcXC9cXC9bLUEtWjAtOStcXHUwMDI2XFx1MjAxOUAjLyU/PSgpfl98ITosLjtdKlstQS1aMC05K1xcdTAwMjZAIy8lPX4oKV98XSkvZ2k7XG52YXIgbmV3TGluZVJlZ2V4ID0gL1xcbi9nO1xuXG5mdW5jdGlvbiBlZGl0b3IoY3RybCkge1xuICByZXR1cm4gbSgnZGl2LmVkaXRvcicsIFtcbiAgICBtKCdidXR0b24uYnV0dG9uLmJ1dHRvbi1lbXB0eS5vcGVuJywge1xuICAgICAgb25jbGljazogY3RybC50ZXh0LnRvZ2dsZVxuICAgIH0sICdFZGl0JyksXG4gICAgY3RybC50ZXh0LmVkaXRpbmcgKCkgPyBtKCdmb3JtJywge1xuICAgICAgb25zdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgeGhyLnNldFRleHQoY3RybCwgZS50YXJnZXQucXVlcnlTZWxlY3RvcigndGV4dGFyZWEnKS52YWx1ZSk7XG4gICAgICAgIGN0cmwudGV4dC50b2dnbGUoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sIFtcbiAgICAgIG0oJ3RleHRhcmVhJywgY3RybC5kYXRhLnRleHQpLFxuICAgICAgbSgnYnV0dG9uLmJ1dHRvbi5zYXZlJywge1xuICAgICAgICB0eXBlOiAnc3VibWl0J1xuICAgICAgfSwgJ1NhdmUnKVxuICAgIF0pIDogbnVsbFxuICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGN0cmw6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlZGl0aW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGVkaXRpbmcgPSAhZWRpdGluZztcbiAgICAgIH0sXG4gICAgICBlZGl0aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGVkaXRpbmc7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgIHJldHVybiBjdHJsLmRhdGEudGV4dCB8fCBzaW11bC5jcmVhdGVkQnlNZShjdHJsKSA/XG4gICAgICBtKCdkaXYuc2ltdWwtdGV4dCcgKyAoY3RybC50ZXh0LmVkaXRpbmcoKSA/ICcuZWRpdGluZycgOiAnJyksIFtcbiAgICAgICAgbSgncCcsIGVucmljaFRleHQoY3RybC5kYXRhLnRleHQpKSxcbiAgICAgICAgc2ltdWwuY3JlYXRlZEJ5TWUoY3RybCkgPyBlZGl0b3IoY3RybCkgOiBudWxsXG4gICAgICBdKSA6IG51bGw7XG4gIH1cbn1cbiIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xudmFyIHNpbXVsID0gcmVxdWlyZSgnLi4vc2ltdWwnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgdGV4dCA9IHJlcXVpcmUoJy4uL3RleHQnKTtcbnZhciB4aHIgPSByZXF1aXJlKCcuLi94aHInKTtcblxuZnVuY3Rpb24gYnlOYW1lKGEsIGIpIHtcbiAgcmV0dXJuIGEucGxheWVyLm5hbWUgPiBiLnBsYXllci5uYW1lXG59XG5cbmZ1bmN0aW9uIHJhbmRvbUJ1dHRvbihjdHJsLCBjYW5kaWRhdGVzKSB7XG4gIHJldHVybiBjYW5kaWRhdGVzLmxlbmd0aCA/IG0oJ2EuYnV0dG9uLnRleHQnLCB7XG4gICAgJ2RhdGEtaWNvbic6ICdFJyxcbiAgICBvbmNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByYW5kb21DYW5kaWRhdGUgPSBjYW5kaWRhdGVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhbmRpZGF0ZXMubGVuZ3RoKV07XG4gICAgICB4aHIuYWNjZXB0KHJhbmRvbUNhbmRpZGF0ZS5wbGF5ZXIuaWQpKGN0cmwpO1xuICAgIH1cbiAgfSwgJ0FjY2VwdCByYW5kb20gY2FuZGlkYXRlJykgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBzdGFydE9yQ2FuY2VsKGN0cmwsIGFjY2VwdGVkKSB7XG4gIHJldHVybiBhY2NlcHRlZC5sZW5ndGggPiAxID9cbiAgICBtKCdhLmJ1dHRvbi5idXR0b24tZ3JlZW4udGV4dCcsIHtcbiAgICAgICdkYXRhLWljb24nOiAnRycsXG4gICAgICBvbmNsaWNrOiBmdW5jdGlvbigpIHsgeGhyLnN0YXJ0KGN0cmwpIH1cbiAgICB9LCAnU3RhcnQnKSA6IG0oJ2EuYnV0dG9uLmJ1dHRvbi1yZWQudGV4dCcsIHtcbiAgICAgICdkYXRhLWljb24nOiAnTCcsXG4gICAgICBvbmNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNvbmZpcm0oJ0RlbGV0ZSB0aGlzIHNpbXVsPycpKSB4aHIuYWJvcnQoY3RybCk7XG4gICAgICB9XG4gICAgfSwgY3RybC50cmFucygnY2FuY2VsJykpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0cmwpIHtcbiAgdmFyIGNhbmRpZGF0ZXMgPSBzaW11bC5jYW5kaWRhdGVzKGN0cmwpLnNvcnQoYnlOYW1lKTtcbiAgdmFyIGFjY2VwdGVkID0gc2ltdWwuYWNjZXB0ZWQoY3RybCkuc29ydChieU5hbWUpO1xuICB2YXIgaXNIb3N0ID0gc2ltdWwuY3JlYXRlZEJ5TWUoY3RybCk7XG4gIHJldHVybiBbXG4gICAgbSgnZGl2LmJveF9fdG9wJywgW1xuICAgICAgdXRpbC50aXRsZShjdHJsKSxcbiAgICAgIG0oJ2Rpdi5ib3hfX3RvcF9fYWN0aW9ucycsIFtcbiAgICAgICAgY3RybC51c2VySWQgPyAoXG4gICAgICAgICAgc2ltdWwuY3JlYXRlZEJ5TWUoY3RybCkgPyBbXG4gICAgICAgICAgICBzdGFydE9yQ2FuY2VsKGN0cmwsIGFjY2VwdGVkKSxcbiAgICAgICAgICAgIHJhbmRvbUJ1dHRvbihjdHJsLCBjYW5kaWRhdGVzKVxuICAgICAgICAgIF0gOiAoXG4gICAgICAgICAgICBzaW11bC5jb250YWluc01lKGN0cmwpID8gbSgnYS5idXR0b24nLCB7XG4gICAgICAgICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKCkgeyB4aHIud2l0aGRyYXcoY3RybCkgfVxuICAgICAgICAgICAgfSwgY3RybC50cmFucygnd2l0aGRyYXcnKSkgOiBtKCdhLmJ1dHRvbi50ZXh0JyArIChjdHJsLnRlYW1CbG9jayA/ICcuZGlzYWJsZWQnIDogJycpLCB7XG4gICAgICAgICAgICAgIGRpc2FibGVkOiBjdHJsLnRlYW1CbG9jayxcbiAgICAgICAgICAgICAgJ2RhdGEtaWNvbic6ICdHJyxcbiAgICAgICAgICAgICAgb25jbGljazogY3RybC50ZWFtQmxvY2sgPyB1bmRlZmluZWQgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGN0cmwuZGF0YS52YXJpYW50cy5sZW5ndGggPT09IDEpXG4gICAgICAgICAgICAgICAgICB4aHIuam9pbihjdHJsLCBjdHJsLmRhdGEudmFyaWFudHNbMF0ua2V5KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICQubW9kYWwoJCgnLnNpbXVsIC5jb250aW51ZS13aXRoJykpO1xuICAgICAgICAgICAgICAgICAgJCgnI21vZGFsLXdyYXAgLmNvbnRpbnVlLXdpdGggYScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkLm1vZGFsLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHhoci5qb2luKGN0cmwsICQodGhpcykuZGF0YSgndmFyaWFudCcpKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY3RybC50ZWFtQmxvY2sgPyBjdHJsLnRyYW5zKCdtdXN0QmVJblRlYW0nLCBjdHJsLmRhdGEudGVhbS5uYW1lKSA6IGN0cmwudHJhbnMoJ2pvaW4nKSlcbiAgICAgICAgICApKSA6IG0oJ2EuYnV0dG9uLnRleHQnLCB7XG4gICAgICAgICAgICAnZGF0YS1pY29uJzogJ0cnLFxuICAgICAgICAgICAgaHJlZjogJy9sb2dpbj9yZWZlcnJlcj0nICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lXG4gICAgICAgICAgfSwgY3RybC50cmFucygnc2lnbkluJykpXG4gICAgICBdKVxuICAgIF0pLFxuICAgIHRleHQudmlldyhjdHJsKSxcbiAgICBzaW11bC5hY2NlcHRlZENvbnRhaW5zTWUoY3RybCkgPyBtKCdwLmluc3RydWN0aW9ucycsXG4gICAgICAnWW91IGhhdmUgYmVlbiBzZWxlY3RlZCEgSG9sZCBzdGlsbCwgdGhlIHNpbXVsIGlzIGFib3V0IHRvIGJlZ2luLidcbiAgICApIDogKFxuICAgICAgKHNpbXVsLmNyZWF0ZWRCeU1lKGN0cmwpICYmIGN0cmwuZGF0YS5hcHBsaWNhbnRzLmxlbmd0aCA8IDYpID8gbSgncC5pbnN0cnVjdGlvbnMnLFxuICAgICAgICAnU2hhcmUgdGhpcyBwYWdlIFVSTCB0byBsZXQgcGVvcGxlIGVudGVyIHRoZSBzaW11bCEnXG4gICAgICApIDogbnVsbFxuICAgICksXG4gICAgbSgnZGl2LmhhbHZlcycsXG4gICAgICBtKCdkaXYuaGFsZi5jYW5kaWRhdGVzJyxcbiAgICAgICAgbSgndGFibGUuc2xpc3Quc2xpc3QtcGFkJyxcbiAgICAgICAgICBtKCd0aGVhZCcsIG0oJ3RyJywgbSgndGgnLCB7XG4gICAgICAgICAgICBjb2xzcGFuOiAzXG4gICAgICAgICAgfSwgW1xuICAgICAgICAgICAgbSgnc3Ryb25nJywgY2FuZGlkYXRlcy5sZW5ndGgpLFxuICAgICAgICAgICAgJyBjYW5kaWRhdGUgcGxheWVycydcbiAgICAgICAgICBdKSkpLFxuICAgICAgICAgIG0oJ3Rib2R5JywgY2FuZGlkYXRlcy5tYXAoZnVuY3Rpb24oYXBwbGljYW50KSB7XG4gICAgICAgICAgICB2YXIgdmFyaWFudCA9IHV0aWwucGxheWVyVmFyaWFudChjdHJsLCBhcHBsaWNhbnQucGxheWVyKTtcbiAgICAgICAgICAgIHJldHVybiBtKCd0cicsIHtcbiAgICAgICAgICAgICAga2V5OiBhcHBsaWNhbnQucGxheWVyLmlkLFxuICAgICAgICAgICAgICBjbGFzczogY3RybC51c2VySWQgPT09IGFwcGxpY2FudC5wbGF5ZXIuaWQgPyAnbWUnIDogJydcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgbSgndGQnLCB1dGlsLnBsYXllcihhcHBsaWNhbnQucGxheWVyKSksXG4gICAgICAgICAgICAgIG0oJ3RkLnZhcmlhbnQnLCB7XG4gICAgICAgICAgICAgICAgJ2RhdGEtaWNvbic6IHZhcmlhbnQuaWNvblxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgbSgndGQuYWN0aW9uJywgaXNIb3N0ID8gbSgnYS5idXR0b24nLCB7XG4gICAgICAgICAgICAgICAgJ2RhdGEtaWNvbic6ICdFJyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0FjY2VwdCcsXG4gICAgICAgICAgICAgICAgb25jbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICB4aHIuYWNjZXB0KGFwcGxpY2FudC5wbGF5ZXIuaWQpKGN0cmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSkgOiBudWxsKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICB9KSkpXG4gICAgICApLFxuICAgICAgbSgnZGl2LmhhbGYuYWNjZXB0ZWQnLCBbXG4gICAgICAgIG0oJ3RhYmxlLnNsaXN0LnVzZXJfbGlzdCcsXG4gICAgICAgICAgbSgndGhlYWQnLCBbXG4gICAgICAgICAgICBtKCd0cicsIG0oJ3RoJywge1xuICAgICAgICAgICAgICBjb2xzcGFuOiAzXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgIG0oJ3N0cm9uZycsIGFjY2VwdGVkLmxlbmd0aCksXG4gICAgICAgICAgICAgICcgYWNjZXB0ZWQgcGxheWVycydcbiAgICAgICAgICAgIF0pKSwgKHNpbXVsLmNyZWF0ZWRCeU1lKGN0cmwpICYmIGNhbmRpZGF0ZXMubGVuZ3RoICYmICFhY2NlcHRlZC5sZW5ndGgpID8gbSgndHIuaGVscCcsXG4gICAgICAgICAgICAgIG0oJ3RoJyxcbiAgICAgICAgICAgICAgICAnTm93IHlvdSBnZXQgdG8gYWNjZXB0IHNvbWUgcGxheWVycywgdGhlbiBzdGFydCB0aGUgc2ltdWwnKSkgOiBudWxsXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgndGJvZHknLCBhY2NlcHRlZC5tYXAoZnVuY3Rpb24oYXBwbGljYW50KSB7XG4gICAgICAgICAgICB2YXIgdmFyaWFudCA9IHV0aWwucGxheWVyVmFyaWFudChjdHJsLCBhcHBsaWNhbnQucGxheWVyKTtcbiAgICAgICAgICAgIHJldHVybiBtKCd0cicsIHtcbiAgICAgICAgICAgICAga2V5OiBhcHBsaWNhbnQucGxheWVyLmlkLFxuICAgICAgICAgICAgICBjbGFzczogY3RybC51c2VySWQgPT09IGFwcGxpY2FudC5wbGF5ZXIuaWQgPyAnbWUnIDogJydcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgbSgndGQnLCB1dGlsLnBsYXllcihhcHBsaWNhbnQucGxheWVyKSksXG4gICAgICAgICAgICAgIG0oJ3RkLnZhcmlhbnQnLCB7XG4gICAgICAgICAgICAgICAgJ2RhdGEtaWNvbic6IHZhcmlhbnQuaWNvblxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgbSgndGQuYWN0aW9uJywgaXNIb3N0ID8gbSgnYS5idXR0b24uYnV0dG9uLXJlZCcsIHtcbiAgICAgICAgICAgICAgICAnZGF0YS1pY29uJzogJ0wnLFxuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgeGhyLnJlamVjdChhcHBsaWNhbnQucGxheWVyLmlkKShjdHJsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pIDogbnVsbClcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgfSkpKVxuICAgICAgXSlcbiAgICApLFxuICAgIG0oJ2Jsb2NrcXVvdGUucHVsbC1xdW90ZScsIFtcbiAgICAgIG0oJ3AnLCBjdHJsLmRhdGEucXVvdGUudGV4dCksXG4gICAgICBtKCdmb290ZXInLCBjdHJsLmRhdGEucXVvdGUuYXV0aG9yKVxuICAgIF0pLFxuICAgIG0oJ2Rpdi5jb250aW51ZS13aXRoLm5vbmUnLCBjdHJsLmRhdGEudmFyaWFudHMubWFwKGZ1bmN0aW9uKHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiBtKCdhLmJ1dHRvbicsIHtcbiAgICAgICAgJ2RhdGEtdmFyaWFudCc6IHZhcmlhbnQua2V5XG4gICAgICB9LCB2YXJpYW50Lm5hbWUpO1xuICAgIH0pKVxuICBdO1xufTtcbiIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciB0ZXh0ID0gcmVxdWlyZSgnLi4vdGV4dCcpO1xudmFyIHBhaXJpbmdzID0gcmVxdWlyZSgnLi9wYWlyaW5ncycpO1xudmFyIHJlc3VsdHMgPSByZXF1aXJlKCcuL3Jlc3VsdHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHJsKSB7XG4gIHJldHVybiBbXG4gICAgbSgnZGl2LmJveF9fdG9wJywgW1xuICAgICAgdXRpbC50aXRsZShjdHJsKSxcbiAgICAgIG0oJ2Rpdi5ib3hfX3RvcF9fYWN0aW9ucycsIG0oJ2Rpdi5maW5pc2hlZCcsIGN0cmwudHJhbnMoJ2ZpbmlzaGVkJykpKVxuICAgIF0pLFxuICAgIHRleHQudmlldyhjdHJsKSxcbiAgICByZXN1bHRzKGN0cmwpLFxuICAgIHBhaXJpbmdzKGN0cmwpXG4gIF07XG59O1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbnZhciBjcmVhdGVkID0gcmVxdWlyZSgnLi9jcmVhdGVkJyk7XG52YXIgc3RhcnRlZCA9IHJlcXVpcmUoJy4vc3RhcnRlZCcpO1xudmFyIGZpbmlzaGVkID0gcmVxdWlyZSgnLi9maW5pc2hlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0cmwpIHtcbiAgdmFyIGhhbmRsZXI7XG4gIGlmIChjdHJsLmRhdGEuaXNSdW5uaW5nKSBoYW5kbGVyID0gc3RhcnRlZDtcbiAgZWxzZSBpZiAoY3RybC5kYXRhLmlzRmluaXNoZWQpIGhhbmRsZXIgPSBmaW5pc2hlZDtcbiAgZWxzZSBoYW5kbGVyID0gY3JlYXRlZDtcblxuICByZXR1cm4gW1xuICAgIG0oJ2FzaWRlLnNpbXVsX19zaWRlJywge1xuICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgZG9uZSkge1xuICAgICAgICBpZiAoIWRvbmUpIHtcbiAgICAgICAgICAkKGVsKS5yZXBsYWNlV2l0aChjdHJsLmVudi4kc2lkZSk7XG4gICAgICAgICAgY3RybC5lbnYuY2hhdCAmJiB3aW5kb3cubGljaGVzcy5tYWtlQ2hhdChjdHJsLmVudi5jaGF0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLFxuICAgIG0oJ2Rpdi5zaW11bF9fbWFpbi5ib3gnLCBoYW5kbGVyKGN0cmwpKSxcbiAgICBtKCdkaXYuY2hhdF9fbWVtYmVycy5ub25lJywge1xuICAgICAgY29uZmlnKGVsLCBkb25lKSB7XG4gICAgICAgIGlmICghZG9uZSkgJChlbCkud2F0Y2hlcnMoKTtcbiAgICAgIH1cbiAgICB9LCBtKCdzcGFuLmxpc3QnKSlcbiAgXTtcbn07XG4iLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgc3RhdHVzID0gcmVxdWlyZSgnZ2FtZS9zdGF0dXMnKTtcblxuZnVuY3Rpb24gbWluaVBhaXJpbmcoY3RybCkge1xuICByZXR1cm4gZnVuY3Rpb24ocGFpcmluZykge1xuICAgIHZhciBnYW1lID0gcGFpcmluZy5nYW1lO1xuICAgIHZhciBwbGF5ZXIgPSBwYWlyaW5nLnBsYXllcjtcbiAgICB2YXIgcmVzdWx0ID0gcGFpcmluZy5nYW1lLnN0YXR1cyA+PSBzdGF0dXMuaWRzLm1hdGUgPyAoXG4gICAgICBwYWlyaW5nLndpbm5lckNvbG9yID09PSAnd2hpdGUnID8gJzEtMCcgOiAocGFpcmluZy53aW5uZXJDb2xvciA9PT0gJ2JsYWNrJyA/ICcwLTEnIDogJ8K9L8K9JylcbiAgICApIDogJyonO1xuICAgIHJldHVybiBtKCdhJywge1xuICAgICAgaHJlZjogJy8nICsgZ2FtZS5pZCArICcvJyArIGdhbWUub3JpZW50LFxuICAgICAgY2xhc3M6IGN0cmwuZGF0YS5ob3N0LmdhbWVJZCA9PT0gZ2FtZS5pZCA/ICdob3N0JyA6ICcnXG4gICAgfSwgW1xuICAgICAgbSgnc3BhbicsIHtcbiAgICAgICAgY2xhc3M6ICdtaW5pLWJvYXJkIG1pbmktYm9hcmQtJyArIGdhbWUuaWQgKyAnIHBhcnNlLWZlbiBpczJkJyxcbiAgICAgICAgJ2RhdGEtY29sb3InOiBnYW1lLm9yaWVudCxcbiAgICAgICAgJ2RhdGEtZmVuJzogZ2FtZS5mZW4sXG4gICAgICAgICdkYXRhLWxhc3Rtb3ZlJzogZ2FtZS5sYXN0TW92ZSxcbiAgICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCwgaXNVcGRhdGUpIHtcbiAgICAgICAgICBpZiAoIWlzVXBkYXRlKSBsaWNoZXNzLnBhcnNlRmVuKCQoZWwpKTtcbiAgICAgICAgfVxuICAgICAgfSwgbSgnZGl2LmNnLXdyYXAnKSksXG4gICAgICBtKCdzcGFuLnZzdGV4dCcsIFtcbiAgICAgICAgbSgnc3Bhbi52c3RleHRfX3BsJywgW1xuICAgICAgICAgIHV0aWwucGxheWVyVmFyaWFudChjdHJsLCBwbGF5ZXIpLm5hbWUsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICByZXN1bHRcbiAgICAgICAgXSksXG4gICAgICAgIG0oJ2Rpdi52c3RleHRfX29wJywgW1xuICAgICAgICAgIHBsYXllci5uYW1lLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgcGxheWVyLnRpdGxlID8gcGxheWVyLnRpdGxlICsgJyAnIDogJycsXG4gICAgICAgICAgcGxheWVyLnJhdGluZ1xuICAgICAgICBdKVxuICAgICAgXSlcbiAgICBdKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHJsKSB7XG4gIHJldHVybiBtKCdkaXYuZ2FtZS1saXN0Lm5vdy1wbGF5aW5nLmJveF9fcGFkJywgY3RybC5kYXRhLnBhaXJpbmdzLm1hcChtaW5pUGFpcmluZyhjdHJsKSkpO1xufTtcbiIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xudmFyIHN0YXR1cyA9IHJlcXVpcmUoJ2dhbWUvc3RhdHVzJyk7XG5cbnZhciBOdW1iZXJGaXJzdFJlZ2V4ID0gL14oXFxkKylcXHMoLispJC87XG52YXIgTnVtYmVyTGFzdFJlZ2V4ID0gL14oLispXFxzKFxcZCspJC87XG5cbmZ1bmN0aW9uIHNwbGl0TnVtYmVyKHMpIHtcbiAgdmFyIGZvdW5kO1xuICBpZiAoKGZvdW5kID0gcy5tYXRjaChOdW1iZXJGaXJzdFJlZ2V4KSkpIHJldHVybiBbXG4gICAgbSgnZGl2Lm51bWJlcicsIGZvdW5kWzFdKSxcbiAgICBtKCdkaXYudGV4dCcsIGZvdW5kWzJdKVxuICBdO1xuICBpZiAoKGZvdW5kID0gcy5tYXRjaChOdW1iZXJMYXN0UmVnZXgpKSkgcmV0dXJuIFtcbiAgICBtKCdkaXYubnVtYmVyJywgZm91bmRbMl0pLFxuICAgIG0oJ2Rpdi50ZXh0JywgZm91bmRbMV0pXG4gIF07XG4gIHJldHVybiBtKCdkaXYudGV4dCcsIHMpO1xufVxuXG5mdW5jdGlvbiB0cmFucyhjdHJsLCBrZXksIGNvbmQpIHtcbiAgcmV0dXJuIHNwbGl0TnVtYmVyKGN0cmwudHJhbnMucGx1cmFsKGtleSwgY3RybC5kYXRhLnBhaXJpbmdzLmZpbHRlcihjb25kKS5sZW5ndGgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHJsKSB7XG4gIHJldHVybiBtKCdkaXYucmVzdWx0cycsIFtcbiAgICBtKCdkaXYnLCB0cmFucyhjdHJsLCAnbmJQbGF5aW5nJywgZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5nYW1lLnN0YXR1cyA8IHN0YXR1cy5pZHMubWF0ZSB9KSksXG4gICAgbSgnZGl2JywgdHJhbnMoY3RybCwgJ25iV2lucycsIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAud2lucyA9PT0gZmFsc2UgfSkpLFxuICAgIG0oJ2RpdicsIHRyYW5zKGN0cmwsICduYkRyYXdzJywgZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5nYW1lLnN0YXR1cyA+PSBzdGF0dXMuaWRzLm1hdGUgJiYgcC53aW5zID09PSBudWxsIH0pKSxcbiAgICBtKCdkaXYnLCB0cmFucyhjdHJsLCAnbmJMb3NzZXMnLCBmdW5jdGlvbihwKSB7IHJldHVybiBwLndpbnMgPT09IHRydWUgfSkpXG4gIF0pO1xufTtcbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgdGV4dCA9IHJlcXVpcmUoJy4uL3RleHQnKTtcbnZhciBwYWlyaW5ncyA9IHJlcXVpcmUoJy4vcGFpcmluZ3MnKTtcbnZhciByZXN1bHRzID0gcmVxdWlyZSgnLi9yZXN1bHRzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3RybCkge1xuICByZXR1cm4gW1xuICAgIHV0aWwudGl0bGUoY3RybCksXG4gICAgdGV4dC52aWV3KGN0cmwpLFxuICAgIHJlc3VsdHMoY3RybCksXG4gICAgcGFpcmluZ3MoY3RybClcbiAgXTtcbn07XG4iLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuZnVuY3Rpb24gcGxheWVySHRtbChwKSB7XG4gIHZhciBodG1sID0gJzxhIGNsYXNzPVwidGV4dCB1bHB0IHVzZXItbGluayBvbmxpbmVcIiBocmVmPVwiL0AvJyArIHAubmFtZSArICdcIj4nO1xuICBodG1sICs9IHAucGF0cm9uID8gJzxpIGNsYXNzPVwibGluZSBwYXRyb25cIj48L2k+JyA6ICc8aSBjbGFzcz1cImxpbmVcIj48L2k+JztcbiAgaHRtbCArPSAocC50aXRsZSA/IHAudGl0bGUgKyAnICcgOiAnJykgKyBwLm5hbWU7XG4gIGlmIChwLnJhdGluZykgaHRtbCArPSAnPGVtPicgKyBwLnJhdGluZyArIChwLnByb3Zpc2lvbmFsID8gJz8nIDogJycpICsgJzwvZW0+JztcbiAgaHRtbCArPSAnPC9hPic7XG4gIHJldHVybiBodG1sO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdGl0bGU6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICByZXR1cm4gbSgnaDEnLCBbXG4gICAgICBjdHJsLmRhdGEuZnVsbE5hbWUsXG4gICAgICBtKCdzcGFuLmF1dGhvcicsIG0udHJ1c3QoY3RybC50cmFucygnYnknLCBwbGF5ZXJIdG1sKGN0cmwuZGF0YS5ob3N0KSkpKVxuICAgIF0pO1xuICB9LFxuICBwbGF5ZXI6IGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gbS50cnVzdChwbGF5ZXJIdG1sKHApKTtcbiAgfSxcbiAgcGxheWVyVmFyaWFudDogZnVuY3Rpb24oY3RybCwgcCkge1xuICAgIHJldHVybiBjdHJsLmRhdGEudmFyaWFudHMuZmluZChmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gdi5rZXkgPT09IHAudmFyaWFudDtcbiAgICB9KTtcbiAgfVxufTtcbiIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG52YXIgeGhyQ29uZmlnID0gZnVuY3Rpb24oeGhyKSB7XG4gIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVJlcXVlc3RlZC1XaXRoJywgJ1hNTEh0dHBSZXF1ZXN0Jyk7XG4gIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vdm5kLmxpY2hlc3MudjEranNvbicpO1xufVxuXG5mdW5jdGlvbiBwYXJ0aWFsKCkge1xuICByZXR1cm4gYXJndW1lbnRzWzBdLmJpbmQuYXBwbHkoYXJndW1lbnRzWzBdLCBbbnVsbF0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbn1cblxuZnVuY3Rpb24gc2ltdWxBY3Rpb24oYWN0aW9uLCBjdHJsKSB7XG4gIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogJy9zaW11bC8nICsgY3RybC5kYXRhLmlkICsgJy8nICsgYWN0aW9uLFxuICAgIGNvbmZpZzogeGhyQ29uZmlnXG4gIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oKSB7XG4gICAgLy8gd2hlbiB0aGUgc2ltdWwgbm8gbG9uZ2VyIGV4aXN0c1xuICAgIGxpY2hlc3MucmVsb2FkKCk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcGluZzogcGFydGlhbChzaW11bEFjdGlvbiwgJ2hvc3QtcGluZycpLFxuICBzdGFydDogcGFydGlhbChzaW11bEFjdGlvbiwgJ3N0YXJ0JyksXG4gIGFib3J0OiBwYXJ0aWFsKHNpbXVsQWN0aW9uLCAnYWJvcnQnKSxcbiAgam9pbjogbGljaGVzcy5kZWJvdW5jZShcbiAgICAoY3RybCwgdmFyaWFudEtleSkgPT4gc2ltdWxBY3Rpb24oJ2pvaW4vJyArIHZhcmlhbnRLZXksIGN0cmwpLFxuICAgIDQwMDAsXG4gICAgdHJ1ZVxuICApLFxuICB3aXRoZHJhdzogcGFydGlhbChzaW11bEFjdGlvbiwgJ3dpdGhkcmF3JyksXG4gIGFjY2VwdDogZnVuY3Rpb24odXNlcikge1xuICAgIHJldHVybiBwYXJ0aWFsKHNpbXVsQWN0aW9uLCAnYWNjZXB0LycgKyB1c2VyKVxuICB9LFxuICByZWplY3Q6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICByZXR1cm4gcGFydGlhbChzaW11bEFjdGlvbiwgJ3JlamVjdC8nICsgdXNlcilcbiAgfSxcbiAgc2V0VGV4dDogZnVuY3Rpb24oY3RybCwgdGV4dCkge1xuICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6ICcvc2ltdWwvJyArIGN0cmwuZGF0YS5pZCArICcvc2V0LXRleHQnLFxuICAgICAgY29uZmlnOiB4aHJDb25maWcsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHRleHQ6IHRleHRcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcbiJdfQ==
