(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessInsight = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
/*! @preserve
 * numeral.js
 * version : 1.5.6
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */

(function() {

    /************************************
        Variables
    ************************************/

    var numeral,
        VERSION = '1.5.6',
        // internal storage for language config files
        languages = {},
        defaults = {
            currentLanguage: 'en',
            zeroFormat: null,
            nullFormat: null,
            defaultFormat: '0,0'
        },
        options = {
            currentLanguage: defaults.currentLanguage,
            zeroFormat: defaults.zeroFormat,
            nullFormat: defaults.nullFormat,
            defaultFormat: defaults.defaultFormat
        },
        byteSuffixes = {
            bytes: ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            iec: ['B','KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
        };


    /************************************
        Constructors
    ************************************/


    // Numeral prototype object
    function Numeral(number) {
        this._value = number;
    }

    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
     * problems for accounting- and finance-related software.
     */
    function toFixed (value, maxDecimals, roundingFunction, optionals) {
        var splitValue = value.toString().split('.'),
            minDecimals = maxDecimals - (optionals || 0),
            boundedPrecision,
            optionalsRegExp,
            power,
            output;

        // Use the smallest precision value possible to avoid errors from floating point representation
        if (splitValue.length === 2) {
          boundedPrecision = Math.min(Math.max(splitValue[1].length, minDecimals), maxDecimals);
        } else {
          boundedPrecision = minDecimals;
        }

        power = Math.pow(10, boundedPrecision);

        //roundingFunction = (roundingFunction !== undefined ? roundingFunction : Math.round);
        // Multiply up by precision, round accurately, then divide and use native toFixed():
        output = (roundingFunction(value * power) / power).toFixed(boundedPrecision);

        if (optionals > maxDecimals - boundedPrecision) {
            optionalsRegExp = new RegExp('\\.?0{1,' + (optionals - (maxDecimals - boundedPrecision)) + '}$');
            output = output.replace(optionalsRegExp, '');
        }

        return output;
    }

    /************************************
        Formatting
    ************************************/

    // determine what type of formatting we need to do
    function formatNumeral(n, format, roundingFunction) {
        var output;

        if (n._value === 0 && options.zeroFormat !== null) {
            output = options.zeroFormat;
        } else if (n._value === null && options.nullFormat !== null) {
            output = options.nullFormat;
        } else {
            // figure out what kind of format we are dealing with
            if (format.indexOf('$') > -1) {
                output = formatCurrency(n, format, roundingFunction);
            } else if (format.indexOf('%') > -1) {
                output = formatPercentage(n, format, roundingFunction);
            } else if (format.indexOf(':') > -1) {
                output = formatTime(n, format);
            } else if (format.indexOf('b') > -1 || format.indexOf('ib') > -1) {
                output = formatBytes(n, format, roundingFunction);
            } else if (format.indexOf('o') > -1) {
                output = formatOrdinal(n, format, roundingFunction);
            } else {
                output = formatNumber(n._value, format, roundingFunction);
            }
        }

        return output;
    }

    function formatCurrency(n, format, roundingFunction) {
        var symbolIndex = format.indexOf('$'),
            openParenIndex = format.indexOf('('),
            minusSignIndex = format.indexOf('-'),
            space = '',
            spliceIndex,
            output;

        // check for space before or after currency
        if (format.indexOf(' $') > -1) {
            space = ' ';
            format = format.replace(' $', '');
        } else if (format.indexOf('$ ') > -1) {
            space = ' ';
            format = format.replace('$ ', '');
        } else {
            format = format.replace('$', '');
        }

        // format the number
        output = formatNumber(n._value, format, roundingFunction, false);

        // position the symbol
        if (symbolIndex <= 1) {
            if (output.indexOf('(') > -1 || output.indexOf('-') > -1) {
                output = output.split('');
                spliceIndex = 1;
                if (symbolIndex < openParenIndex || symbolIndex < minusSignIndex) {
                    // the symbol appears before the "(" or "-"
                    spliceIndex = 0;
                }
                output.splice(spliceIndex, 0, languages[options.currentLanguage].currency.symbol + space);
                output = output.join('');
            } else {
                output = languages[options.currentLanguage].currency.symbol + space + output;
            }
        } else {
            if (output.indexOf(')') > -1) {
                output = output.split('');
                output.splice(-1, 0, space + languages[options.currentLanguage].currency.symbol);
                output = output.join('');
            } else {
                output = output + space + languages[options.currentLanguage].currency.symbol;
            }
        }

        return output;
    }

    function formatPercentage(n, format, roundingFunction) {
        var space = '',
            output,
            value = n._value * 100;

        // check for space before %
        if (format.indexOf(' %') > -1) {
            space = ' ';
            format = format.replace(' %', '');
        } else {
            format = format.replace('%', '');
        }

        output = formatNumber(value, format, roundingFunction);

        if (output.indexOf(')') > -1) {
            output = output.split('');
            output.splice(-1, 0, space + '%');
            output = output.join('');
        } else {
            output = output + space + '%';
        }

        return output;
    }

    function formatBytes(n, format, roundingFunction) {
        var output,
            suffixes = format.indexOf('ib') > -1 ? byteSuffixes.iec : byteSuffixes.bytes,
            value = n._value,
            suffix = '',
            power,
            min,
            max;

        // check for space before
        if (format.indexOf(' b') > -1 || format.indexOf(' ib') > -1) {
            suffix = ' ';
            format = format.replace(' ib', '').replace(' b', '');
        } else {
            format = format.replace('ib', '').replace('b', '');
        }

        for (power = 0; power <= suffixes.length; power++) {
            min = Math.pow(1024, power);
            max = Math.pow(1024, power + 1);

            if (value === null || value === 0 || value >= min && value < max) {
                suffix += suffixes[power];

                if (min > 0) {
                    value = value / min;
                }

                break;
            }
        }

        output = formatNumber(value, format, roundingFunction);

        return output + suffix;
    }

    function formatOrdinal(n, format, roundingFunction) {
        var output,
            ordinal = '';

        // check for space before
        if (format.indexOf(' o') > -1) {
            ordinal = ' ';
            format = format.replace(' o', '');
        } else {
            format = format.replace('o', '');
        }

        ordinal += languages[options.currentLanguage].ordinal(n._value);

        output = formatNumber(n._value, format, roundingFunction);

        return output + ordinal;
    }

    function formatTime(n) {
        var hours = Math.floor(n._value / 60 / 60),
            minutes = Math.floor((n._value - (hours * 60 * 60)) / 60),
            seconds = Math.round(n._value - (hours * 60 * 60) - (minutes * 60));

        return hours + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
    }

    function formatNumber(value, format, roundingFunction) {
        var negP = false,
            signed = false,
            optDec = false,
            abbr = '',
            abbrK = false, // force abbreviation to thousands
            abbrM = false, // force abbreviation to millions
            abbrB = false, // force abbreviation to billions
            abbrT = false, // force abbreviation to trillions
            abbrForce = false, // force abbreviation
            abs,
            min,
            max,
            power,
            w,
            precision,
            thousands,
            d = '',
            neg = false;

        if (value === null) {
            value = 0;
        }

        abs = Math.abs(value);

        // see if we should use parentheses for negative number or if we should prefix with a sign
        // if both are present we default to parentheses
        if (format.indexOf('(') > -1) {
            negP = true;
            format = format.slice(1, -1);
        } else if (format.indexOf('+') > -1) {
            signed = true;
            format = format.replace(/\+/g, '');
        }

        // see if abbreviation is wanted
        if (format.indexOf('a') > -1) {
            // check if abbreviation is specified
            abbrK = format.indexOf('aK') >= 0;
            abbrM = format.indexOf('aM') >= 0;
            abbrB = format.indexOf('aB') >= 0;
            abbrT = format.indexOf('aT') >= 0;
            abbrForce = abbrK || abbrM || abbrB || abbrT;

            // check for space before abbreviation
            if (format.indexOf(' a') > -1) {
                abbr = ' ';
            }

            format = format.replace(new RegExp(abbr + 'a[KMBT]?'), '');

            if (abs >= Math.pow(10, 12) && !abbrForce || abbrT) {
                // trillion
                abbr = abbr + languages[options.currentLanguage].abbreviations.trillion;
                value = value / Math.pow(10, 12);
            } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !abbrForce || abbrB) {
                // billion
                abbr = abbr + languages[options.currentLanguage].abbreviations.billion;
                value = value / Math.pow(10, 9);
            } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !abbrForce || abbrM) {
                // million
                abbr = abbr + languages[options.currentLanguage].abbreviations.million;
                value = value / Math.pow(10, 6);
            } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !abbrForce || abbrK) {
                // thousand
                abbr = abbr + languages[options.currentLanguage].abbreviations.thousand;
                value = value / Math.pow(10, 3);
            }
        }


        if (format.indexOf('[.]') > -1) {
            optDec = true;
            format = format.replace('[.]', '.');
        }

        w = value.toString().split('.')[0];
        precision = format.split('.')[1];
        thousands = format.indexOf(',');

        if (precision) {
            if (precision.indexOf('[') > -1) {
                precision = precision.replace(']', '');
                precision = precision.split('[');
                d = toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
            } else {
                d = toFixed(value, precision.length, roundingFunction);
            }

            w = d.split('.')[0];

            if (d.indexOf('.') > -1) {
                d = languages[options.currentLanguage].delimiters.decimal + d.split('.')[1];
            } else {
                d = '';
            }

            if (optDec && Number(d.slice(1)) === 0) {
                d = '';
            }
        } else {
            w = toFixed(value, null, roundingFunction);
        }

        // format number
        if (w.indexOf('-') > -1) {
            w = w.slice(1);
            neg = true;
        }

        if (thousands > -1) {
            w = w.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + languages[options.currentLanguage].delimiters.thousands);
        }

        if (format.indexOf('.') === 0) {
            w = '';
        }

        return ((negP && neg) ? '(' : '') + ((!negP && neg) ? '-' : '') + ((!neg && signed) ? '+' : '') + w + d + ((abbr) ? abbr : '') + ((negP && neg) ? ')' : '');
    }


    /************************************
        Unformatting
    ************************************/

    // revert to number
    function unformatNumeral(n, string) {
        var stringOriginal = string,
            thousandRegExp,
            millionRegExp,
            billionRegExp,
            trillionRegExp,
            bytesMultiplier = false,
            power,
            value;

        if (string.indexOf(':') > -1) {
            value = unformatTime(string);
        } else {
            if (string === options.zeroFormat || string === options.nullFormat) {
                value = 0;
            } else {
                if (languages[options.currentLanguage].delimiters.decimal !== '.') {
                    string = string.replace(/\./g, '').replace(languages[options.currentLanguage].delimiters.decimal, '.');
                }

                // see if abbreviations are there so that we can multiply to the correct number
                thousandRegExp = new RegExp('[^a-zA-Z]' + languages[options.currentLanguage].abbreviations.thousand + '(?:\\)|(\\' + languages[options.currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                millionRegExp = new RegExp('[^a-zA-Z]' + languages[options.currentLanguage].abbreviations.million + '(?:\\)|(\\' + languages[options.currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                billionRegExp = new RegExp('[^a-zA-Z]' + languages[options.currentLanguage].abbreviations.billion + '(?:\\)|(\\' + languages[options.currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                trillionRegExp = new RegExp('[^a-zA-Z]' + languages[options.currentLanguage].abbreviations.trillion + '(?:\\)|(\\' + languages[options.currentLanguage].currency.symbol + ')?(?:\\))?)?$');

                // see if bytes are there so that we can multiply to the correct number
                for (power = 1; power <= byteSuffixes.bytes.length; power++) {
                    bytesMultiplier = ((string.indexOf(byteSuffixes.bytes[power]) > -1) || (string.indexOf(byteSuffixes.iec[power]) > -1))? Math.pow(1024, power) : false;

                    if (bytesMultiplier) {
                        break;
                    }
                }

                // do some math to create our number
                value = bytesMultiplier ? bytesMultiplier : 1;
                value *= stringOriginal.match(thousandRegExp) ? Math.pow(10, 3) : 1;
                value *= stringOriginal.match(millionRegExp) ? Math.pow(10, 6) : 1;
                value *= stringOriginal.match(billionRegExp) ? Math.pow(10, 9) : 1;
                value *= stringOriginal.match(trillionRegExp) ? Math.pow(10, 12) : 1;
                // check for percentage
                value *= string.indexOf('%') > -1 ? 0.01 : 1;
                // check for negative number
                value *= (string.split('-').length + Math.min(string.split('(').length - 1, string.split(')').length - 1)) % 2 ? 1 : -1;
                // remove non numbers
                value *= Number(string.replace(/[^0-9\.]+/g, ''));
                // round if we are talking about bytes
                value = bytesMultiplier ? Math.ceil(value) : value;
            }
        }

        n._value = value;

        return n._value;
    }
    function unformatTime(string) {
        var timeArray = string.split(':'),
            seconds = 0;
        // turn hours and minutes into seconds and add them all up
        if (timeArray.length === 3) {
            // hours
            seconds = seconds + (Number(timeArray[0]) * 60 * 60);
            // minutes
            seconds = seconds + (Number(timeArray[1]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[2]);
        } else if (timeArray.length === 2) {
            // minutes
            seconds = seconds + (Number(timeArray[0]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[1]);
        }
        return Number(seconds);
    }


    /************************************
        Top Level Functions
    ************************************/

    numeral = function(input) {
        if (numeral.isNumeral(input)) {
            input = input.value();
        } else if (input === 0 || typeof input === 'undefined') {
            input = 0;
        } else if (input === null) {
            input = null;
        } else if (!Number(input)) {
            input = numeral.fn.unformat(input);
        } else {
            input = Number(input);
        }

        return new Numeral(input);
    };

    // version number
    numeral.version = VERSION;

    // compare numeral object
    numeral.isNumeral = function(obj) {
        return obj instanceof Numeral;
    };


    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    numeral.language = function(key, values) {
        if (!key) {
            return options.currentLanguage;
        }

        key = key.toLowerCase();

        if (key && !values) {
            if (!languages[key]) {
                throw new Error('Unknown language : ' + key);
            }

            options.currentLanguage = key;
        }

        if (values || !languages[key]) {
            loadLanguage(key, values);
        }

        return numeral;
    };

    numeral.reset = function() {
        for (var property in defaults) {
            options[property] = defaults[property];
        }
    };

    // This function provides access to the loaded language data.  If
    // no arguments are passed in, it will simply return the current
    // global language object.
    numeral.languageData = function(key) {
        if (!key) {
            return languages[options.currentLanguage];
        }

        if (!languages[key]) {
            throw new Error('Unknown language : ' + key);
        }

        return languages[key];
    };

    numeral.language('en', {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function(number) {
            var b = number % 10;
            return (~~(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '$'
        }
    });

    numeral.zeroFormat = function(format) {
        options.zeroFormat = typeof(format) === 'string' ? format : null;
    };

    numeral.nullFormat = function (format) {
        options.nullFormat = typeof(format) === 'string' ? format : null;
    };

    numeral.defaultFormat = function(format) {
        options.defaultFormat = typeof(format) === 'string' ? format : '0.0';
    };

    numeral.validate = function(val, culture) {
        var _decimalSep,
            _thousandSep,
            _currSymbol,
            _valArray,
            _abbrObj,
            _thousandRegEx,
            languageData,
            temp;

        //coerce val to string
        if (typeof val !== 'string') {
            val += '';
            if (console.warn) {
                console.warn('Numeral.js: Value is not string. It has been co-erced to: ', val);
            }
        }

        //trim whitespaces from either sides
        val = val.trim();

        //if val is just digits return true
        if ( !! val.match(/^\d+$/)) {
            return true;
        }

        //if val is empty return false
        if (val === '') {
            return false;
        }

        //get the decimal and thousands separator from numeral.languageData
        try {
            //check if the culture is understood by numeral. if not, default it to current language
            languageData = numeral.languageData(culture);
        } catch (e) {
            languageData = numeral.languageData(numeral.language());
        }

        //setup the delimiters and currency symbol based on culture/language
        _currSymbol = languageData.currency.symbol;
        _abbrObj = languageData.abbreviations;
        _decimalSep = languageData.delimiters.decimal;
        if (languageData.delimiters.thousands === '.') {
            _thousandSep = '\\.';
        } else {
            _thousandSep = languageData.delimiters.thousands;
        }

        // validating currency symbol
        temp = val.match(/^[^\d]+/);
        if (temp !== null) {
            val = val.substr(1);
            if (temp[0] !== _currSymbol) {
                return false;
            }
        }

        //validating abbreviation symbol
        temp = val.match(/[^\d]+$/);
        if (temp !== null) {
            val = val.slice(0, -1);
            if (temp[0] !== _abbrObj.thousand && temp[0] !== _abbrObj.million && temp[0] !== _abbrObj.billion && temp[0] !== _abbrObj.trillion) {
                return false;
            }
        }

        _thousandRegEx = new RegExp(_thousandSep + '{2}');

        if (!val.match(/[^\d.,]/g)) {
            _valArray = val.split(_decimalSep);
            if (_valArray.length > 2) {
                return false;
            } else {
                if (_valArray.length < 2) {
                    return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx));
                } else {
                    if (_valArray[0].length === 1) {
                        return ( !! _valArray[0].match(/^\d+$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                    } else {
                        return ( !! _valArray[0].match(/^\d+.*\d$/) && !_valArray[0].match(_thousandRegEx) && !! _valArray[1].match(/^\d+$/));
                    }
                }
            }
        }

        return false;
    };

    /************************************
        Helpers
    ************************************/

    function loadLanguage(key, values) {
        languages[key] = values;
    }

    /************************************
        Floating-point helpers
    ************************************/

    // The floating-point helper functions and implementation
    // borrows heavily from sinful.js: http://guipn.github.io/sinful.js/

    // Production steps of ECMA-262, Edition 5, 15.4.4.21
    // Reference: http://es5.github.io/#x15.4.4.21
    if (!Array.prototype.reduce) {
        Array.prototype.reduce = function(callback /*, initialValue*/) {
            'use strict';
            if (this === null) {
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }

            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            var t = Object(this), len = t.length >>> 0, k = 0, value;

            if (arguments.length === 2) {
                value = arguments[1];
            } else {
                while (k < len && !(k in t)) {
                    k++;
                }

                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }

                value = t[k++];
            }
            for (; k < len; k++) {
                if (k in t) {
                    value = callback(value, t[k], k, t);
                }
            }
            return value;
        };
    }

    /**
     * Computes the multiplier necessary to make x >= 1,
     * effectively eliminating miscalculations caused by
     * finite precision.
     */
    function multiplier(x) {
        var parts = x.toString().split('.');
        if (parts.length < 2) {
            return 1;
        }
        return Math.pow(10, parts[1].length);
    }

    /**
     * Given a variable number of arguments, returns the maximum
     * multiplier that must be used to normalize an operation involving
     * all of them.
     */
    function correctionFactor() {
        var args = Array.prototype.slice.call(arguments);
        return args.reduce(function(prev, next) {
            var mp = multiplier(prev),
                mn = multiplier(next);
            return mp > mn ? mp : mn;
        }, -Infinity);
    }


    /************************************
        Numeral Prototype
    ************************************/


    numeral.fn = Numeral.prototype = {

        clone: function() {
            return numeral(this);
        },

        format: function (inputString, roundingFunction) {
            return formatNumeral(this,
                inputString ? inputString : options.defaultFormat,
                roundingFunction !== undefined ? roundingFunction : Math.round
            );
        },

        unformat: function (inputString) {
            if (Object.prototype.toString.call(inputString) === '[object Number]') {
                return inputString;
            }

            return unformatNumeral(this, inputString ? inputString : options.defaultFormat);
        },

        value: function() {
            return this._value;
        },

        valueOf: function() {
            return this._value;
        },

        set: function(value) {
            this._value = Number(value);
            return this;
        },

        add: function(value) {
            var corrFactor = correctionFactor.call(null, this._value, value);

            function cback(accum, curr, currI, O) {
                return accum + corrFactor * curr;
            }
            this._value = [this._value, value].reduce(cback, 0) / corrFactor;
            return this;
        },

        subtract: function(value) {
            var corrFactor = correctionFactor.call(null, this._value, value);

            function cback(accum, curr, currI, O) {
                return accum - corrFactor * curr;
            }
            this._value = [value].reduce(cback, this._value * corrFactor) / corrFactor;
            return this;
        },

        multiply: function(value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) * (curr * corrFactor) /
                    (corrFactor * corrFactor);
            }
            this._value = [this._value, value].reduce(cback, 1);
            return this;
        },

        divide: function(value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) / (curr * corrFactor);
            }
            this._value = [this._value, value].reduce(cback);
            return this;
        },

        difference: function(value) {
            return Math.abs(numeral(this._value).subtract(value).value());
        }

    };

    /************************************
        Exposing Numeral
    ************************************/

    // CommonJS module is defined
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = numeral;
    }

    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `numeral` as a global object via a string identifier,
        // for Closure Compiler 'advanced' mode
        this['numeral'] = numeral;
    }

    /*global define:false */
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return numeral;
        });
    }
}).call(this);

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var m = require('mithril');

module.exports = function(ctrl) {
  return m('div.axis-form', [
    m('select.ms.metric', {
      multiple: true,
      config: function(e, isUpdate) {
        $(e).multipleSelect({
          width: '200px',
          maxHeight: '400px',
          single: true,
          onClick: function(v) {
            ctrl.setMetric(v.value);
          }
        });
      }
    }, ctrl.ui.metricCategs.map(function(categ) {
      return m('optgroup', {
        label: categ.name
      }, categ.items.map(function(y) {
        return m('option', {
          title: y.description.replace(/<a[^>]*>[^>]+<\/a[^>]*>/, ''),
          value: y.key,
          // disabled: !ctrl.validCombination(ctrl.vm.dimension, y),
          selected: ctrl.vm.metric.key === y.key
        }, y.name);
      }))
    })),
    m('span.by', 'by'),
    m('select.ms.dimension', {
        multiple: true,
        config: function(e, isUpdate) {
          $(e).multipleSelect({
            width: '200px',
            maxHeight: '400px',
            single: true,
            onClick: function(v) {
              ctrl.setDimension(v.value);
            }
          });
        }
      },
      ctrl.ui.dimensionCategs.map(function(categ) {
        return m('optgroup', {
          label: categ.name
        }, categ.items.map(function(x) {
          if (x.key === 'period') return;
          return m('option', {
            title: x.description.replace(/<a[^>]*>[^>]+<\/a[^>]*>/, ''),
            value: x.key,
            // disabled: !ctrl.validCombination(x, ctrl.vm.metric),
            selected: ctrl.vm.dimension.key === x.key
          }, x.name);
        }));
      }))
  ]);
};

},{"mithril":1}],5:[function(require,module,exports){
var m = require('mithril');

function miniGame(game) {
  return m('a', {
    key: game.id,
    href: '/' + game.id + (game.color === 'white' ? '' : '/black')
  }, [
    m('span', {
      class: 'mini-board cg-wrap mini-board-' + game.id + ' parse-fen is2d',
      'data-color': game.color,
      'data-fen': game.fen,
      'data-lastmove': game.lastMove,
      config: function(el, isUpdate) {
        if (!isUpdate) lichess.parseFen($(el));
      }
    }),
    m('span.vstext', [
      m('span.vstext__pl', [
        game.user1.name,
        m('br'),
        game.user1.title ? game.user1.title + ' ' : '',
        game.user1.rating
      ]),
      m('span.vstext__op', [
        game.user2.name,
        m('br'),
        game.user2.rating,
        game.user2.title ? ' ' + game.user2.title : ''
      ])
    ])
  ]);
}

module.exports = function(ctrl) {

  if (!ctrl.vm.answer) return;

  return m('div.game-sample.box', [
    m('div.top', 'Some of the games used to generate this insight'),
    m('div.boards', ctrl.vm.answer.games.map(miniGame))
  ]);
}

},{"mithril":1}],6:[function(require,module,exports){
var m = require('mithril');

function metricDataTypeFormat(dt) {
  if (dt === 'seconds') return '{point.y:.1f}';
  if (dt === 'average') return '{point.y:,.1f}';
  if (dt === 'percent') return '{point.y:.1f}%';
  return '{point.y:,.0f}';
}

function dimensionDataTypeFormat(dt) {
  if (dt === 'date') return '{value:%Y-%m-%d}';
  return '{value}';
}

function yAxisTypeFormat(dt) {
  if (dt === 'seconds') return '{value:.1f}';
  if (dt === 'average') return '{value:,.1f}';
  if (dt === 'percent') return '{value:.0f}%';
  return '{value:,.0f}';
}

var colors = {
  green: '#759900',
  red: '#dc322f',
  orange: '#d59120',
  blue: '#007599'
};
var resultColors = {
  Victory: colors.green,
  Draw: colors.blue,
  Defeat: colors.red
};

var theme = (function() {
  var light = $('body').hasClass('light');
  var t = {
    light: light,
    text: {
      weak: light ? '#808080' : '#9a9a9a',
      strong: light ? '#505050' : '#c0c0c0'
    },
    line: {
      weak: light ? '#ccc' : '#404040',
      strong: light ? '#a0a0a0' : '#606060',
      fat: '#d85000' // light ? '#a0a0a0' : '#707070'
    }
  };
  if (!light) t.colors = [
    "#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
    "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"
  ];
  return t;
})();

function makeChart(el, data) {
  var sizeSerie = {
    name: data.sizeSerie.name,
    data: data.sizeSerie.data,
    yAxis: 1,
    type: 'column',
    stack: 'size',
    animation: {
      duration: 300
    },
    color: 'rgba(120,120,120,0.2)'
  };
  var valueSeries = data.series.map(function(s) {
    var c = {
      name: s.name,
      data: s.data,
      yAxis: 0,
      type: 'column',
      stack: s.stack,
      // animation: {
      //   duration: 300
      // },
      dataLabels: {
        enabled: true,
        format: s.stack ? '{point.percentage:.0f}%' : metricDataTypeFormat(s.dataType)
      },
      tooltip: {
        // headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: (function() {
          return '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>' + metricDataTypeFormat(s.dataType) + '</b><br/>';
        })(),
        shared: true,
      }
    };
    if (data.valueYaxis.name === 'Game result') c.color = resultColors[s.name];
    return c;
  });
  var chartConf = {
    chart: {
      type: 'column',
      alignTicks: data.valueYaxis.dataType !== 'percent',
      spacing: [20, 7, 20, 5],
      backgroundColor: null,
      borderWidth: 0,
      borderRadius: 0,
      plotBackgroundColor: null,
      plotShadow: false,
      plotBorderWidth: 0,
      style: {
        font: "12px 'Noto Sans', 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif"
      }
    },
    title: {
      text: null
    },
    xAxis: {
      type: data.xAxis.dataType === 'date' ? 'datetime' : 'linear',
      categories: data.xAxis.categories.map(function(v) {
        return data.xAxis.dataType === 'date' ? v * 1000 : v;
      }),
      crosshair: true,
      labels: {
        format: dimensionDataTypeFormat(data.xAxis.dataType),
        style: {
          color: theme.text.weak,
          fontSize: 9
        }
      },
      title: {
        style: {
          color: theme.text.weak,
          fontSize: 9
        }
      },
      gridLineColor: theme.line.weak,
      lineColor: theme.line.strong,
      tickColor: theme.line.strong,
    },
    yAxis: [data.valueYaxis, data.sizeYaxis].map(function(a, i) {
      var isPercent = data.valueYaxis.dataType === 'percent';
      var isSize = i % 2 === 1;
      var c = {
        opposite: isSize,
        min: !isSize && isPercent ? 0 : undefined,
        max: !isSize && isPercent ? 100 : undefined,
        labels: {
          format: yAxisTypeFormat(a.dataType),
          style: {
            color: theme.text.weak,
            fontSize: 9
          }
        },
        title: {
          text: i === 1 ? a.name : false,
          style: {
            color: theme.text.weak,
            fontSize: 9
          }
        },
        gridLineColor: theme.line.weak,
      };
      if (isSize && isPercent) {
        c.minorGridLineWidth = 0;
        c.gridLineWidth = 0;
        c.alternateGridColor = null;
      }
      return c;
    }),
    plotOptions: {
      column: {
        animation: {
          duration: 300
        },
        stacking: 'normal',
        dataLabels: {
          color: theme.text.strong
        },
        marker: {
          lineColor: theme.text.weak
        },
        borderColor: theme.line.strong
      }
    },
    series: valueSeries.concat(sizeSerie),
    credits: {
      enabled: false
    },
    labels: {
      style: {
        color: theme.text.strong
      }
    },
    tooltip: {
      backgroundColor: {
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1
        },
        stops: theme.light ? [
          [0, 'rgba(200, 200, 200, .8)'],
          [1, 'rgba(250, 250, 250, .8)']
        ] : [
          [0, 'rgba(56, 56, 56, .8)'],
          [1, 'rgba(16, 16, 16, .8)']
        ]
      },
      style: {
        fontWeight: 'bold',
        color: theme.text.strong
      }
    },
    legend: {
      enabled: true,
      itemStyle: {
        color: theme.text.weak
      },
      itemHiddenStyle: {
        color: theme.text.weak
      }
    }
  };
  if (theme.colors) chartConf.colors = theme.colors;
  $(el).highcharts(chartConf);
}

function empty(txt) {
  return m('div.chart.empty', [
    m('i[data-icon=7]'),
    txt
  ]);
}

module.exports = function(ctrl) {
  if (!ctrl.validCombinationCurrent()) return empty('Invalid dimension/metric combination');
  if (!ctrl.vm.answer.series.length) return empty('No data. Try widening or clearing the filters.');
  return [
    m('div.chart', {
      config: function(el) {
        if (ctrl.vm.loading) return;
        makeChart(el, ctrl.vm.answer);
      }
    }),
    ctrl.vm.loading ? m.trust(lichess.spinnerHtml) : null
  ];
};

},{"mithril":1}],7:[function(require,module,exports){
var m = require('mithril');
var throttle = require('common/throttle').default;

module.exports = function(env, domElement) {

  this.ui = env.ui;
  this.user = env.user;
  this.own = env.myUserId === this.user.id;
  this.dimensions = [].concat.apply([], this.ui.dimensionCategs.map(function(c) {
    return c.items;
  }));
  this.metrics = [].concat.apply([], this.ui.metricCategs.map(function(c) {
    return c.items;
  }));

  var findMetric = function(key) {
    return this.metrics.find(function(x) {
      return x.key === key;
    });
  }.bind(this);

  var findDimension = function(key) {
    return this.dimensions.find(function(x) {
      return x.key === key;
    });
  }.bind(this);

  this.vm = {
    metric: findMetric(env.initialQuestion.metric),
    dimension: findDimension(env.initialQuestion.dimension),
    filters: env.initialQuestion.filters,
    loading: true,
    broken: false,
    answer: null,
    panel: Object.keys(env.initialQuestion.filters).length ? 'filter' : 'preset'
  };

  this.setPanel = function(p) {
    this.vm.panel = p;
    m.redraw();
  }.bind(this);


  var reset = function() {
    this.vm.metric = this.metrics[0];
    this.vm.dimension = this.dimensions[0];
    this.vm.filters = {};
  }.bind(this);

  var askQuestion = throttle(1000, function() {
    if (!this.validCombinationCurrent()) reset();
    this.pushState();
    this.vm.loading = true;
    this.vm.broken = false;
    m.redraw();
    setTimeout(function() {
      m.request({
        method: 'post',
        url: env.postUrl,
        data: {
          metric: this.vm.metric.key,
          dimension: this.vm.dimension.key,
          filters: this.vm.filters
        },
        deserialize: function(d) {
          try {return JSON.parse(d)} catch (e) {throw new Error(d)}
        }
      }).then(function(answer) {
        this.vm.answer = answer;
        this.vm.loading = false;
      }.bind(this)).catch(function() {
        this.vm.loading = false;
        this.vm.broken = true;
        m.redraw();
      }.bind(this));
    }.bind(this), 1);
  }.bind(this));

  this.makeUrl = function(dKey, mKey, filters) {
    var url = [env.pageUrl, mKey, dKey].join('/');
    var filters = Object.keys(filters).map(function(filterKey) {
      return filterKey + ':' + filters[filterKey].join(',');
    }).join('/');
    if (filters.length) url += '/' + filters;
    return url;
  };

  this.makeCurrentUrl = function() {
    return this.makeUrl(this.vm.dimension.key, this.vm.metric.key, this.vm.filters)
  }.bind(this);

  this.pushState = function() {
    history.replaceState({}, null, this.makeCurrentUrl());
  }.bind(this);

  this.validCombination = function(dimension, metric) {
    return dimension && metric && (
      dimension.position === 'game' || metric.position === 'move'
    );
  };
  this.validCombinationCurrent = function() {
    return this.validCombination(this.vm.dimension, this.vm.metric);
  }.bind(this);

  this.setMetric = function(key) {
    this.vm.metric = findMetric(key);
    if (!this.validCombinationCurrent()) this.vm.dimension = this.dimensions.find(function(d) {
      return this.validCombination(d, this.vm.metric);
    }.bind(this));
    this.vm.panel = 'filter';
    askQuestion();
  }.bind(this);

  this.setDimension = function(key) {
    this.vm.dimension = findDimension(key);
    if (!this.validCombinationCurrent()) this.vm.metric = this.metrics.find(function(m) {
      return this.validCombination(this.vm.dimension, m);
    }.bind(this));
    this.vm.panel = 'filter';
    askQuestion();
  }.bind(this);

  this.setFilter = function(dimensionKey, valueKeys) {
    if (!valueKeys.length) delete this.vm.filters[dimensionKey];
    else this.vm.filters[dimensionKey] = valueKeys;
    askQuestion();
  }.bind(this);

  this.setQuestion = function(q) {
    this.vm.dimension = findDimension(q.dimension);
    this.vm.metric = findMetric(q.metric);
    this.vm.filters = q.filters;
    askQuestion();
    $(domElement).find('select.ms').multipleSelect('open');
    setTimeout(function() {
      $(domElement).find('select.ms').multipleSelect('close');
    }, 1000);
  }.bind(this);

  this.clearFilters = function() {
    if (Object.keys(this.vm.filters).length) {
      this.vm.filters = {};
      askQuestion();
    }
  }.bind(this);

  // this.trans = lichess.trans(env.i18n);

  askQuestion();
};

},{"common/throttle":3,"mithril":1}],8:[function(require,module,exports){
var m = require('mithril');

function select(ctrl) {
  return function(dimension) {
    if (dimension.key === 'date') return;
    var single = dimension.key === 'period';
    return m('select', {
      multiple: true,
      config: function(e, isUpdate) {
        if (isUpdate && ctrl.vm.filters[dimension.key]) return;
        $(e).multipleSelect({
          placeholder: dimension.name,
          width: '100%',
          selectAll: false,
          filter: dimension.key === 'opening',
          single: single,
          minimumCountSelected: 10,
          onClick: function(view) {
            var values = single ? [view.value] : $(e).multipleSelect("getSelects");
            ctrl.setFilter(dimension.key, values);
          }
        });
      }
    }, dimension.values.map(function(value) {
      var selected = ctrl.vm.filters[dimension.key];
      return m('option', {
        value: value.key,
        selected: selected && selected.includes(value.key)
      }, value.name);
    }));
  };
}

module.exports = function(ctrl) {
  return m('div.filters', [
    m('div.items',
      ctrl.ui.dimensionCategs.map(function(categ) {
        return m('div.categ.box', [
          m('div.top', categ.name),
          categ.items.map(select(ctrl))
        ]);
      })
    )
  ]);
};

},{"mithril":1}],9:[function(require,module,exports){
var m = require('mithril');

module.exports = function(ctrl) {
  return m('div.help.box', [
    m('div.top', 'Definitions'),
    m('div.content', ['metric', 'dimension'].map(function(type) {
      var data = ctrl.vm[type];
      return m('section.' + type, [
        m('h3', data.name),
        m('p', m.trust(data.description))
      ]);
    }))
  ]);
};

},{"mithril":1}],10:[function(require,module,exports){
var m = require('mithril');

var shareStates = ["nobody", "friends only", "everybody"];

module.exports = function(ctrl) {
  var shareText = 'Shared with ' + shareStates[ctrl.user.shareId] + '.';
  return m('div.info.box', [
    m('div.top', [
      m('a.help', {
        title: 'How does this work?',
        onclick: lichess.startInsightTour
      }, '?'),
      m('a.username.user-link.insight-ulpt', {
        href: '/@/' + ctrl.user.name
      }, ctrl.user.name)
    ]),
    m('div.content', [
      m('p', [
        'Insights over ',
        m('strong', ctrl.user.nbGames),
        ' rated games.'
      ]),
      m('p.share', ctrl.own ? m('a', {
        href: '/account/preferences/privacy',
        target: '_blank'
      }, shareText) : shareText)
    ]),
    m('div.refresh', {
      config: function(e, isUpdate) {
        if (isUpdate) return;
        var $ref = $('.insight-stale');
        if ($ref.length) {
          $(e).html($ref.show());
          lichess.refreshInsightForm();
        }
      }
    })
  ]);
};

},{"mithril":1}],11:[function(require,module,exports){
var m = require('mithril');

var ctrl = require('./ctrl');
var view = require('./view');

module.exports = function(element, opts) {

  var controller = new ctrl(opts, element);

  m.module(element, {
    controller: function() {
      return controller;
    },
    view: view
  });

  return controller;
};

// for multiple-select
jQuery.fn.extend( {
  hover: function( fnOver, fnOut ) {
    return this.on('mouseenter', fnOver ).on('mouseleave', fnOut || fnOver );
  }
} );

},{"./ctrl":7,"./view":14,"mithril":1}],12:[function(require,module,exports){
var m = require('mithril');

module.exports = function(ctrl) {
  return m('div.box.presets',
    ctrl.ui.presets.map(function(p) {
      var active =
        ctrl.makeUrl(p.dimension, p.metric, p.filters) ===
        ctrl.makeCurrentUrl();
      return m('a', {
        class: 'preset text' + (active ? ' active' : ''),
        'data-icon': '7',
        onclick: function() {
          ctrl.setQuestion(p);
        }
      }, p.name);
    })
  );
};

},{"mithril":1}],13:[function(require,module,exports){
var m = require('mithril');
var numeral = require('numeral');

function formatNumber(dt, n) {
  if (dt === 'percent') n = n / 100;
  var f;
  if (dt === 'seconds') f = '0.0';
  else if (dt === 'average') f = '0.0';
  else if (dt === 'percent') f = '0.0%';
  else f = '0,0';
  return numeral(n).format(f);
}

function formatSerieName(dt, n) {
  if (dt === 'date') return new Date(n * 1000).toLocaleDateString();
  return n;
}

module.exports = {
  vert: function(ctrl) {
    var answer = ctrl.vm.answer;
    if (!answer) return null;
    return m('table.slist', [
      m('thead',
        m('tr', [
          m('th', answer.xAxis.name),
          answer.series.map(function(serie) {
            return m('th', serie.name);
          }),
          m('th', answer.sizeYaxis.name)
        ])
      ),
      m('tbody', answer.xAxis.categories.map(function(c, i) {
        return m('tr', [
          m('th', formatSerieName(answer.xAxis.dataType, c)),
          answer.series.map(function(serie) {
            return m('td.data', formatNumber(serie.dataType, serie.data[i]))
          }),
          m('td.size', formatNumber(answer.sizeSerie.dataType, answer.sizeSerie.data[i]))
        ]);
      }))
    ]);
  }
};

},{"mithril":1,"numeral":2}],14:[function(require,module,exports){
var m = require('mithril');
var axis = require('./axis');
var filters = require('./filters');
var presets = require('./presets');
var chart = require('./chart');
var table = require('./table');
var help = require('./help');
var info = require('./info');
var boards = require('./boards');

function cache(view, dataToKey) {
  var prev = null;
  return function(data) {
    var key = dataToKey(data);
    if (prev === key) return {
      subtree: "retain"
    };
    prev = key;
    return view(data);
  };
}

var renderMeat = cache(function(ctrl) {
  if (ctrl.vm.broken) return m('div.broken', [
    m('i[data-icon=j]'),
    'Insights are unavailable.',
    m('br'),
    'Please try again later.'
  ]);
  if (!ctrl.vm.answer) return;
  return m('div', [
    chart(ctrl),
    table.vert(ctrl),
    boards(ctrl)
  ]);
}, function(ctrl) {
  var q = ctrl.vm.answer ? ctrl.vm.answer.question : null;
  return q ? ctrl.makeUrl(q.dimension, q.metric, q.filters) : ctrl.vm.broken;
});

module.exports = function(ctrl) {
  return m('div', {
    class: ctrl.vm.loading ? 'loading' : 'ready'
  }, [
    m('div.left-side', [
      info(ctrl),
      m('div.panel-tabs', [
        m('a[data-panel="preset"]', {
          class: 'tab preset' + (ctrl.vm.panel === 'preset' ? ' active' : ''),
          onclick: function() {
            ctrl.setPanel('preset');
          }
        }, 'Presets'),
        m('a[data-panel="filter"]', {
          class: 'tab filter' + (ctrl.vm.panel === 'filter' ? ' active' : ''),
          onclick: function() {
            ctrl.setPanel('filter');
          }
        }, 'Filters'), Object.keys(ctrl.vm.filters).length ? m('a.clear', {
          title: 'Clear all filters',
          'data-icon': 'L',
          onclick: ctrl.clearFilters
        }, 'CLEAR') : null,
      ]),
      ctrl.vm.panel === 'filter' ? filters(ctrl) : null,
      ctrl.vm.panel === 'preset' ? presets(ctrl) : null,
      help(ctrl)
    ]),
    m('header', [
      axis(ctrl),
      m('h2', {
        class: 'text',
        'data-icon': '7'
      }, 'Chess Insights')
    ]),
    m('div.meat.box', renderMeat(ctrl))
  ]);
};

},{"./axis":4,"./boards":5,"./chart":6,"./filters":8,"./help":9,"./info":10,"./presets":12,"./table":13,"mithril":1}]},{},[11])(11)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvbWl0aHJpbC9taXRocmlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL251bWVyYWwvbnVtZXJhbC5qcyIsIi4uL2NvbW1vbi9zcmMvdGhyb3R0bGUudHMiLCJzcmMvYXhpcy5qcyIsInNyYy9ib2FyZHMuanMiLCJzcmMvY2hhcnQuanMiLCJzcmMvY3RybC5qcyIsInNyYy9maWx0ZXJzLmpzIiwic3JjL2hlbHAuanMiLCJzcmMvaW5mby5qcyIsInNyYy9tYWluLmpzIiwic3JjL3ByZXNldHMuanMiLCJzcmMvdGFibGUuanMiLCJzcmMvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5M0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1MEJBLHVFQUF1RTtBQUN2RSxvREFBb0Q7QUFDcEQsU0FBd0IsUUFBUSxDQUFDLEtBQWEsRUFBRSxRQUFrQztJQUNoRixJQUFJLEtBQXlCLENBQUM7SUFDOUIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBRWpCLE9BQU8sVUFBb0IsR0FBRyxJQUFXO1FBQ3ZDLE1BQU0sSUFBSSxHQUFRLElBQUksQ0FBQztRQUN2QixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDO1FBRTdDLFNBQVMsSUFBSTtZQUNYLEtBQUssR0FBRyxTQUFTLENBQUM7WUFDbEIsUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM3QixRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRUQsSUFBSSxLQUFLO1lBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRS9CLElBQUksT0FBTyxHQUFHLEtBQUs7WUFBRSxJQUFJLEVBQUUsQ0FBQzs7WUFDdkIsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQztBQUNKLENBQUM7QUFuQkQsMkJBbUJDOzs7QUNyQkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgbSA9IChmdW5jdGlvbiBhcHAod2luZG93LCB1bmRlZmluZWQpIHtcclxuXHRcInVzZSBzdHJpY3RcIjtcclxuICBcdHZhciBWRVJTSU9OID0gXCJ2MC4yLjEtbGlsYVwiO1xyXG5cdGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqZWN0KSB7XHJcblx0XHRyZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gXCJmdW5jdGlvblwiO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBpc09iamVjdChvYmplY3QpIHtcclxuXHRcdHJldHVybiB0eXBlLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIjtcclxuXHR9XHJcblx0ZnVuY3Rpb24gaXNTdHJpbmcob2JqZWN0KSB7XHJcblx0XHRyZXR1cm4gdHlwZS5jYWxsKG9iamVjdCkgPT09IFwiW29iamVjdCBTdHJpbmddXCI7XHJcblx0fVxyXG5cdHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqZWN0KSB7XHJcblx0XHRyZXR1cm4gdHlwZS5jYWxsKG9iamVjdCkgPT09IFwiW29iamVjdCBBcnJheV1cIjtcclxuXHR9O1xyXG5cdHZhciB0eXBlID0ge30udG9TdHJpbmc7XHJcblx0dmFyIHBhcnNlciA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbLis/XFxdKS9nLCBhdHRyUGFyc2VyID0gL1xcWyguKz8pKD86PShcInwnfCkoLio/KVxcMik/XFxdLztcclxuXHR2YXIgdm9pZEVsZW1lbnRzID0gL14oQVJFQXxCQVNFfEJSfENPTHxDT01NQU5EfEVNQkVEfEhSfElNR3xJTlBVVHxLRVlHRU58TElOS3xNRVRBfFBBUkFNfFNPVVJDRXxUUkFDS3xXQlIpJC87XHJcblx0dmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fTtcclxuXHJcblx0Ly8gY2FjaGluZyBjb21tb25seSB1c2VkIHZhcmlhYmxlc1xyXG5cdHZhciAkZG9jdW1lbnQsICRsb2NhdGlvbiwgJHJlcXVlc3RBbmltYXRpb25GcmFtZSwgJGNhbmNlbEFuaW1hdGlvbkZyYW1lO1xyXG5cclxuXHQvLyBzZWxmIGludm9raW5nIGZ1bmN0aW9uIG5lZWRlZCBiZWNhdXNlIG9mIHRoZSB3YXkgbW9ja3Mgd29ya1xyXG5cdGZ1bmN0aW9uIGluaXRpYWxpemUod2luZG93KSB7XHJcblx0XHQkZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XHJcblx0XHQkbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb247XHJcblx0XHQkY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LmNsZWFyVGltZW91dDtcclxuXHRcdCRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5zZXRUaW1lb3V0O1xyXG5cdH1cclxuXHJcblx0aW5pdGlhbGl6ZSh3aW5kb3cpO1xyXG5cclxuXHRtLnZlcnNpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBWRVJTSU9OO1xyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIEB0eXBlZGVmIHtTdHJpbmd9IFRhZ1xyXG5cdCAqIEEgc3RyaW5nIHRoYXQgbG9va3MgbGlrZSAtPiBkaXYuY2xhc3NuYW1lI2lkW3BhcmFtPW9uZV1bcGFyYW0yPXR3b11cclxuXHQgKiBXaGljaCBkZXNjcmliZXMgYSBET00gbm9kZVxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7VGFnfSBUaGUgRE9NIG5vZGUgdGFnXHJcblx0ICogQHBhcmFtIHtPYmplY3Q9W119IG9wdGlvbmFsIGtleS12YWx1ZSBwYWlycyB0byBiZSBtYXBwZWQgdG8gRE9NIGF0dHJzXHJcblx0ICogQHBhcmFtIHsuLi5tTm9kZT1bXX0gWmVybyBvciBtb3JlIE1pdGhyaWwgY2hpbGQgbm9kZXMuIENhbiBiZSBhbiBhcnJheSwgb3Igc3BsYXQgKG9wdGlvbmFsKVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbSh0YWcsIHBhaXJzKSB7XHJcblx0XHRmb3IgKHZhciBhcmdzID0gW10sIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGlzT2JqZWN0KHRhZykpIHJldHVybiBwYXJhbWV0ZXJpemUodGFnLCBhcmdzKTtcclxuXHRcdHZhciBoYXNBdHRycyA9IHBhaXJzICE9IG51bGwgJiYgaXNPYmplY3QocGFpcnMpICYmICEoXCJ0YWdcIiBpbiBwYWlycyB8fCBcInZpZXdcIiBpbiBwYWlycyB8fCBcInN1YnRyZWVcIiBpbiBwYWlycyk7XHJcblx0XHR2YXIgYXR0cnMgPSBoYXNBdHRycyA/IHBhaXJzIDoge307XHJcblx0XHR2YXIgY2xhc3NBdHRyTmFtZSA9IFwiY2xhc3NcIiBpbiBhdHRycyA/IFwiY2xhc3NcIiA6IFwiY2xhc3NOYW1lXCI7XHJcblx0XHR2YXIgY2VsbCA9IHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7fX07XHJcblx0XHR2YXIgbWF0Y2gsIGNsYXNzZXMgPSBbXTtcclxuXHRcdGlmICghaXNTdHJpbmcodGFnKSkgdGhyb3cgbmV3IEVycm9yKFwic2VsZWN0b3IgaW4gbShzZWxlY3RvciwgYXR0cnMsIGNoaWxkcmVuKSBzaG91bGQgYmUgYSBzdHJpbmdcIik7XHJcblx0XHR3aGlsZSAoKG1hdGNoID0gcGFyc2VyLmV4ZWModGFnKSkgIT0gbnVsbCkge1xyXG5cdFx0XHRpZiAobWF0Y2hbMV0gPT09IFwiXCIgJiYgbWF0Y2hbMl0pIGNlbGwudGFnID0gbWF0Y2hbMl07XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzFdID09PSBcIiNcIikgY2VsbC5hdHRycy5pZCA9IG1hdGNoWzJdO1xyXG5cdFx0XHRlbHNlIGlmIChtYXRjaFsxXSA9PT0gXCIuXCIpIGNsYXNzZXMucHVzaChtYXRjaFsyXSk7XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzNdWzBdID09PSBcIltcIikge1xyXG5cdFx0XHRcdHZhciBwYWlyID0gYXR0clBhcnNlci5leGVjKG1hdGNoWzNdKTtcclxuXHRcdFx0XHRjZWxsLmF0dHJzW3BhaXJbMV1dID0gcGFpclszXSB8fCAocGFpclsyXSA/IFwiXCIgOnRydWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGNoaWxkcmVuID0gaGFzQXR0cnMgPyBhcmdzLnNsaWNlKDEpIDogYXJncztcclxuXHRcdGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgaXNBcnJheShjaGlsZHJlblswXSkpIHtcclxuXHRcdFx0Y2VsbC5jaGlsZHJlbiA9IGNoaWxkcmVuWzBdO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGNlbGwuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKHZhciBhdHRyTmFtZSBpbiBhdHRycykge1xyXG5cdFx0XHRpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYXR0ck5hbWUpKSB7XHJcblx0XHRcdFx0aWYgKGF0dHJOYW1lID09PSBjbGFzc0F0dHJOYW1lICYmIGF0dHJzW2F0dHJOYW1lXSAhPSBudWxsICYmIGF0dHJzW2F0dHJOYW1lXSAhPT0gXCJcIikge1xyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGF0dHJzW2F0dHJOYW1lXSk7XHJcblx0XHRcdFx0XHRjZWxsLmF0dHJzW2F0dHJOYW1lXSA9IFwiXCI7IC8vY3JlYXRlIGtleSBpbiBjb3JyZWN0IGl0ZXJhdGlvbiBvcmRlclxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGNlbGwuYXR0cnNbYXR0ck5hbWVdID0gYXR0cnNbYXR0ck5hbWVdO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAoY2xhc3Nlcy5sZW5ndGgpIGNlbGwuYXR0cnNbY2xhc3NBdHRyTmFtZV0gPSBjbGFzc2VzLmpvaW4oXCIgXCIpO1xyXG5cclxuXHRcdHJldHVybiBjZWxsO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBmb3JFYWNoKGxpc3QsIGYpIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGggJiYgIWYobGlzdFtpXSwgaSsrKTspIHt9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGZvcktleXMobGlzdCwgZikge1xyXG5cdFx0Zm9yRWFjaChsaXN0LCBmdW5jdGlvbiAoYXR0cnMsIGkpIHtcclxuXHRcdFx0cmV0dXJuIChhdHRycyA9IGF0dHJzICYmIGF0dHJzLmF0dHJzKSAmJiBhdHRycy5rZXkgIT0gbnVsbCAmJiBmKGF0dHJzLCBpKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHQvLyBUaGlzIGZ1bmN0aW9uIHdhcyBjYXVzaW5nIGRlb3B0cyBpbiBDaHJvbWUuXHJcblx0Ly8gV2VsbCBubyBsb25nZXJcclxuXHRmdW5jdGlvbiBkYXRhVG9TdHJpbmcoZGF0YSkge1xyXG4gICAgaWYgKGRhdGEgPT0gbnVsbCkgcmV0dXJuICcnO1xyXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0JykgcmV0dXJuIGRhdGE7XHJcbiAgICBpZiAoZGF0YS50b1N0cmluZygpID09IG51bGwpIHJldHVybiBcIlwiOyAvLyBwcmV2ZW50IHJlY3Vyc2lvbiBlcnJvciBvbiBGRlxyXG4gICAgcmV0dXJuIGRhdGE7XHJcblx0fVxyXG5cdC8vIFRoaXMgZnVuY3Rpb24gd2FzIGNhdXNpbmcgZGVvcHRzIGluIENocm9tZS5cclxuXHRmdW5jdGlvbiBpbmplY3RUZXh0Tm9kZShwYXJlbnRFbGVtZW50LCBmaXJzdCwgaW5kZXgsIGRhdGEpIHtcclxuXHRcdHRyeSB7XHJcblx0XHRcdGluc2VydE5vZGUocGFyZW50RWxlbWVudCwgZmlyc3QsIGluZGV4KTtcclxuXHRcdFx0Zmlyc3Qubm9kZVZhbHVlID0gZGF0YTtcclxuXHRcdH0gY2F0Y2ggKGUpIHt9IC8vSUUgZXJyb25lb3VzbHkgdGhyb3dzIGVycm9yIHdoZW4gYXBwZW5kaW5nIGFuIGVtcHR5IHRleHQgbm9kZSBhZnRlciBhIG51bGxcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGZsYXR0ZW4obGlzdCkge1xyXG5cdFx0Ly9yZWN1cnNpdmVseSBmbGF0dGVuIGFycmF5XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKGlzQXJyYXkobGlzdFtpXSkpIHtcclxuXHRcdFx0XHRsaXN0ID0gbGlzdC5jb25jYXQuYXBwbHkoW10sIGxpc3QpO1xyXG5cdFx0XHRcdC8vY2hlY2sgY3VycmVudCBpbmRleCBhZ2FpbiBhbmQgZmxhdHRlbiB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBuZXN0ZWQgYXJyYXlzIGF0IHRoYXQgaW5kZXhcclxuXHRcdFx0XHRpLS07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBsaXN0O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaW5zZXJ0Tm9kZShwYXJlbnRFbGVtZW50LCBub2RlLCBpbmRleCkge1xyXG5cdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKTtcclxuXHR9XHJcblxyXG5cdHZhciBERUxFVElPTiA9IDEsIElOU0VSVElPTiA9IDIsIE1PVkUgPSAzO1xyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVLZXlzRGlmZmVyKGRhdGEsIGV4aXN0aW5nLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQpIHtcclxuXHRcdGZvcktleXMoZGF0YSwgZnVuY3Rpb24gKGtleSwgaSkge1xyXG5cdFx0XHRleGlzdGluZ1trZXkgPSBrZXkua2V5XSA9IGV4aXN0aW5nW2tleV0gPyB7XHJcblx0XHRcdFx0YWN0aW9uOiBNT1ZFLFxyXG5cdFx0XHRcdGluZGV4OiBpLFxyXG5cdFx0XHRcdGZyb206IGV4aXN0aW5nW2tleV0uaW5kZXgsXHJcblx0XHRcdFx0ZWxlbWVudDogY2FjaGVkLm5vZGVzW2V4aXN0aW5nW2tleV0uaW5kZXhdIHx8ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXHJcblx0XHRcdH0gOiB7YWN0aW9uOiBJTlNFUlRJT04sIGluZGV4OiBpfTtcclxuXHRcdH0pO1xyXG5cdFx0dmFyIGFjdGlvbnMgPSBbXTtcclxuXHRcdGZvciAodmFyIHByb3AgaW4gZXhpc3RpbmcpIGFjdGlvbnMucHVzaChleGlzdGluZ1twcm9wXSk7XHJcblx0XHR2YXIgY2hhbmdlcyA9IGFjdGlvbnMuc29ydChzb3J0Q2hhbmdlcyksIG5ld0NhY2hlZCA9IG5ldyBBcnJheShjYWNoZWQubGVuZ3RoKTtcclxuXHRcdG5ld0NhY2hlZC5ub2RlcyA9IGNhY2hlZC5ub2Rlcy5zbGljZSgpO1xyXG5cclxuXHRcdGZvckVhY2goY2hhbmdlcywgZnVuY3Rpb24gKGNoYW5nZSkge1xyXG5cdFx0XHR2YXIgaW5kZXggPSBjaGFuZ2UuaW5kZXg7XHJcblx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBERUxFVElPTikge1xyXG5cdFx0XHRcdGNsZWFyKGNhY2hlZFtpbmRleF0ubm9kZXMsIGNhY2hlZFtpbmRleF0pO1xyXG5cdFx0XHRcdG5ld0NhY2hlZC5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBJTlNFUlRJT04pIHtcclxuXHRcdFx0XHR2YXIgZHVtbXkgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdFx0XHRkdW1teS5rZXkgPSBkYXRhW2luZGV4XS5hdHRycy5rZXk7XHJcblx0XHRcdFx0aW5zZXJ0Tm9kZShwYXJlbnRFbGVtZW50LCBkdW1teSwgaW5kZXgpO1xyXG5cdFx0XHRcdG5ld0NhY2hlZC5zcGxpY2UoaW5kZXgsIDAsIHtcclxuXHRcdFx0XHRcdGF0dHJzOiB7a2V5OiBkYXRhW2luZGV4XS5hdHRycy5rZXl9LFxyXG5cdFx0XHRcdFx0bm9kZXM6IFtkdW1teV1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRuZXdDYWNoZWQubm9kZXNbaW5kZXhdID0gZHVtbXk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBNT1ZFKSB7XHJcblx0XHRcdFx0dmFyIGNoYW5nZUVsZW1lbnQgPSBjaGFuZ2UuZWxlbWVudDtcclxuXHRcdFx0XHR2YXIgbWF5YmVDaGFuZ2VkID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XTtcclxuXHRcdFx0XHRpZiAobWF5YmVDaGFuZ2VkICE9PSBjaGFuZ2VFbGVtZW50ICYmIGNoYW5nZUVsZW1lbnQgIT09IG51bGwpIHtcclxuXHRcdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNoYW5nZUVsZW1lbnQsIG1heWJlQ2hhbmdlZCB8fCBudWxsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bmV3Q2FjaGVkW2luZGV4XSA9IGNhY2hlZFtjaGFuZ2UuZnJvbV07XHJcblx0XHRcdFx0bmV3Q2FjaGVkLm5vZGVzW2luZGV4XSA9IGNoYW5nZUVsZW1lbnQ7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBuZXdDYWNoZWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkaWZmS2V5cyhkYXRhLCBjYWNoZWQsIGV4aXN0aW5nLCBwYXJlbnRFbGVtZW50KSB7XHJcblx0XHR2YXIga2V5c0RpZmZlciA9IGRhdGEubGVuZ3RoICE9PSBjYWNoZWQubGVuZ3RoO1xyXG5cdFx0aWYgKCFrZXlzRGlmZmVyKSB7XHJcblx0XHRcdGZvcktleXMoZGF0YSwgZnVuY3Rpb24gKGF0dHJzLCBpKSB7XHJcblx0XHRcdFx0dmFyIGNhY2hlZENlbGwgPSBjYWNoZWRbaV07XHJcblx0XHRcdFx0cmV0dXJuIGtleXNEaWZmZXIgPSBjYWNoZWRDZWxsICYmIGNhY2hlZENlbGwuYXR0cnMgJiYgY2FjaGVkQ2VsbC5hdHRycy5rZXkgIT09IGF0dHJzLmtleTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGtleXNEaWZmZXIgPyBoYW5kbGVLZXlzRGlmZmVyKGRhdGEsIGV4aXN0aW5nLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQpIDogY2FjaGVkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGlmZkFycmF5KGRhdGEsIGNhY2hlZCwgbm9kZXMpIHtcclxuXHRcdC8vZGlmZiB0aGUgYXJyYXkgaXRzZWxmXHJcblxyXG5cdFx0Ly91cGRhdGUgdGhlIGxpc3Qgb2YgRE9NIG5vZGVzIGJ5IGNvbGxlY3RpbmcgdGhlIG5vZGVzIGZyb20gZWFjaCBpdGVtXHJcblx0XHRmb3JFYWNoKGRhdGEsIGZ1bmN0aW9uIChfLCBpKSB7XHJcblx0XHRcdGlmIChjYWNoZWRbaV0gIT0gbnVsbCkgbm9kZXMucHVzaC5hcHBseShub2RlcywgY2FjaGVkW2ldLm5vZGVzKTtcclxuXHRcdH0pXHJcblx0XHQvL3JlbW92ZSBpdGVtcyBmcm9tIHRoZSBlbmQgb2YgdGhlIGFycmF5IGlmIHRoZSBuZXcgYXJyYXkgaXMgc2hvcnRlciB0aGFuIHRoZSBvbGQgb25lLiBpZiBlcnJvcnMgZXZlciBoYXBwZW4gaGVyZSwgdGhlIGlzc3VlIGlzIG1vc3QgbGlrZWx5XHJcblx0XHQvL2EgYnVnIGluIHRoZSBjb25zdHJ1Y3Rpb24gb2YgdGhlIGBjYWNoZWRgIGRhdGEgc3RydWN0dXJlIHNvbWV3aGVyZSBlYXJsaWVyIGluIHRoZSBwcm9ncmFtXHJcblx0XHRmb3JFYWNoKGNhY2hlZC5ub2RlcywgZnVuY3Rpb24gKG5vZGUsIGkpIHtcclxuXHRcdFx0aWYgKG5vZGUucGFyZW50Tm9kZSAhPSBudWxsICYmIG5vZGVzLmluZGV4T2Yobm9kZSkgPCAwKSBjbGVhcihbbm9kZV0sIFtjYWNoZWRbaV1dKTtcclxuXHRcdH0pXHJcblx0XHRpZiAoZGF0YS5sZW5ndGggPCBjYWNoZWQubGVuZ3RoKSBjYWNoZWQubGVuZ3RoID0gZGF0YS5sZW5ndGg7XHJcblx0XHRjYWNoZWQubm9kZXMgPSBub2RlcztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJ1aWxkQXJyYXlLZXlzKGRhdGEpIHtcclxuXHRcdHZhciBndWlkID0gMDtcclxuXHRcdGZvcktleXMoZGF0YSwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRmb3JFYWNoKGRhdGEsIGZ1bmN0aW9uIChhdHRycykge1xyXG5cdFx0XHRcdGlmICgoYXR0cnMgPSBhdHRycyAmJiBhdHRycy5hdHRycykgJiYgYXR0cnMua2V5ID09IG51bGwpIGF0dHJzLmtleSA9IFwiX19taXRocmlsX19cIiArIGd1aWQrKztcclxuXHRcdFx0fSlcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIG1heWJlUmVjcmVhdGVPYmplY3QoZGF0YSwgY2FjaGVkLCBkYXRhQXR0cktleXMpIHtcclxuXHRcdC8vaWYgYW4gZWxlbWVudCBpcyBkaWZmZXJlbnQgZW5vdWdoIGZyb20gdGhlIG9uZSBpbiBjYWNoZSwgcmVjcmVhdGUgaXRcclxuXHRcdGlmIChkYXRhLnRhZyAhPT0gY2FjaGVkLnRhZyB8fFxyXG5cdFx0XHRcdGRhdGFBdHRyS2V5cy5zb3J0KCkuam9pbigpICE9PSBPYmplY3Qua2V5cyhjYWNoZWQuYXR0cnMpLnNvcnQoKS5qb2luKCkgfHxcclxuXHRcdFx0XHRkYXRhLmF0dHJzLmlkICE9PSBjYWNoZWQuYXR0cnMuaWQgfHxcclxuXHRcdFx0XHRkYXRhLmF0dHJzLmtleSAhPT0gY2FjaGVkLmF0dHJzLmtleSB8fFxyXG5cdFx0XHRcdChtLnJlZHJhdy5zdHJhdGVneSgpID09PSBcImFsbFwiICYmICghY2FjaGVkLmNvbmZpZ0NvbnRleHQgfHwgY2FjaGVkLmNvbmZpZ0NvbnRleHQucmV0YWluICE9PSB0cnVlKSkgfHxcclxuXHRcdFx0XHQobS5yZWRyYXcuc3RyYXRlZ3koKSA9PT0gXCJkaWZmXCIgJiYgY2FjaGVkLmNvbmZpZ0NvbnRleHQgJiYgY2FjaGVkLmNvbmZpZ0NvbnRleHQucmV0YWluID09PSBmYWxzZSkpIHtcclxuXHRcdFx0aWYgKGNhY2hlZC5ub2Rlcy5sZW5ndGgpIGNsZWFyKGNhY2hlZC5ub2Rlcyk7XHJcblx0XHRcdGlmIChjYWNoZWQuY29uZmlnQ29udGV4dCAmJiBpc0Z1bmN0aW9uKGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKSkgY2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQoKTtcclxuXHRcdFx0aWYgKGNhY2hlZC5jb250cm9sbGVycykge1xyXG5cdFx0XHRcdGZvckVhY2goY2FjaGVkLmNvbnRyb2xsZXJzLCBmdW5jdGlvbiAoY29udHJvbGxlcikge1xyXG5cdFx0XHRcdFx0aWYgKGNvbnRyb2xsZXIudW5sb2FkKSBjb250cm9sbGVyLm9udW5sb2FkKHtwcmV2ZW50RGVmYXVsdDogbm9vcH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRPYmplY3ROYW1lc3BhY2UoZGF0YSwgbmFtZXNwYWNlKSB7XHJcblx0XHRyZXR1cm4gZGF0YS5hdHRycy54bWxucyA/IGRhdGEuYXR0cnMueG1sbnMgOlxyXG5cdFx0XHRkYXRhLnRhZyA9PT0gXCJzdmdcIiA/IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiA6XHJcblx0XHRcdGRhdGEudGFnID09PSBcIm1hdGhcIiA/IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTFwiIDpcclxuXHRcdFx0bmFtZXNwYWNlO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdW5sb2FkQ2FjaGVkQ29udHJvbGxlcnMoY2FjaGVkLCB2aWV3cywgY29udHJvbGxlcnMpIHtcclxuXHRcdGlmIChjb250cm9sbGVycy5sZW5ndGgpIHtcclxuXHRcdFx0Y2FjaGVkLnZpZXdzID0gdmlld3M7XHJcblx0XHRcdGNhY2hlZC5jb250cm9sbGVycyA9IGNvbnRyb2xsZXJzO1xyXG5cdFx0XHRmb3JFYWNoKGNvbnRyb2xsZXJzLCBmdW5jdGlvbiAoY29udHJvbGxlcikge1xyXG5cdFx0XHRcdGlmIChjb250cm9sbGVyLm9udW5sb2FkICYmIGNvbnRyb2xsZXIub251bmxvYWQuJG9sZCkgY29udHJvbGxlci5vbnVubG9hZCA9IGNvbnRyb2xsZXIub251bmxvYWQuJG9sZDtcclxuXHRcdFx0XHRpZiAocGVuZGluZ1JlcXVlc3RzICYmIGNvbnRyb2xsZXIub251bmxvYWQpIHtcclxuXHRcdFx0XHRcdHZhciBvbnVubG9hZCA9IGNvbnRyb2xsZXIub251bmxvYWQ7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyLm9udW5sb2FkID0gbm9vcDtcclxuXHRcdFx0XHRcdGNvbnRyb2xsZXIub251bmxvYWQuJG9sZCA9IG9udW5sb2FkO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzY2hlZHVsZUNvbmZpZ3NUb0JlQ2FsbGVkKGNvbmZpZ3MsIGRhdGEsIG5vZGUsIGlzTmV3LCBjYWNoZWQpIHtcclxuXHRcdC8vc2NoZWR1bGUgY29uZmlncyB0byBiZSBjYWxsZWQuIFRoZXkgYXJlIGNhbGxlZCBhZnRlciBgYnVpbGRgXHJcblx0XHQvL2ZpbmlzaGVzIHJ1bm5pbmdcclxuXHRcdGlmIChpc0Z1bmN0aW9uKGRhdGEuYXR0cnMuY29uZmlnKSkge1xyXG5cdFx0XHR2YXIgY29udGV4dCA9IGNhY2hlZC5jb25maWdDb250ZXh0ID0gY2FjaGVkLmNvbmZpZ0NvbnRleHQgfHwge307XHJcblxyXG5cdFx0XHQvL2JpbmRcclxuXHRcdFx0Y29uZmlncy5wdXNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJldHVybiBkYXRhLmF0dHJzLmNvbmZpZy5jYWxsKGRhdGEsIG5vZGUsICFpc05ldywgY29udGV4dCwgY2FjaGVkKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBidWlsZFVwZGF0ZWROb2RlKGNhY2hlZCwgZGF0YSwgZWRpdGFibGUsIGhhc0tleXMsIG5hbWVzcGFjZSwgdmlld3MsIGNvbmZpZ3MsIGNvbnRyb2xsZXJzKSB7XHJcblx0XHR2YXIgbm9kZSA9IGNhY2hlZC5ub2Rlc1swXTtcclxuXHRcdGlmIChoYXNLZXlzKSBzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCBkYXRhLmF0dHJzLCBjYWNoZWQuYXR0cnMsIG5hbWVzcGFjZSk7XHJcblx0XHRjYWNoZWQuY2hpbGRyZW4gPSBidWlsZChub2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgZmFsc2UsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gbm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpO1xyXG5cdFx0Y2FjaGVkLm5vZGVzLmludGFjdCA9IHRydWU7XHJcblxyXG5cdFx0aWYgKGNvbnRyb2xsZXJzLmxlbmd0aCkge1xyXG5cdFx0XHRjYWNoZWQudmlld3MgPSB2aWV3cztcclxuXHRcdFx0Y2FjaGVkLmNvbnRyb2xsZXJzID0gY29udHJvbGxlcnM7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5vZGU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVOb25leGlzdGVudE5vZGVzKGRhdGEsIHBhcmVudEVsZW1lbnQsIGluZGV4KSB7XHJcblx0XHR2YXIgbm9kZXM7XHJcblx0XHRpZiAoZGF0YS4kdHJ1c3RlZCkge1xyXG5cdFx0XHRub2RlcyA9IGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV07XHJcblx0XHRcdGlmICghcGFyZW50RWxlbWVudC5ub2RlTmFtZS5tYXRjaCh2b2lkRWxlbWVudHMpKSBpbnNlcnROb2RlKHBhcmVudEVsZW1lbnQsIG5vZGVzWzBdLCBpbmRleCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGNhY2hlZCA9IHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBkYXRhID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiBkYXRhID09PSBcImJvb2xlYW5cIiA/IG5ldyBkYXRhLmNvbnN0cnVjdG9yKGRhdGEpIDogZGF0YTtcclxuXHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzO1xyXG5cdFx0cmV0dXJuIGNhY2hlZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlYXR0YWNoTm9kZXMoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBlZGl0YWJsZSwgaW5kZXgsIHBhcmVudFRhZykge1xyXG5cdFx0dmFyIG5vZGVzID0gY2FjaGVkLm5vZGVzO1xyXG5cdFx0aWYgKCFlZGl0YWJsZSB8fCBlZGl0YWJsZSAhPT0gJGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHtcclxuXHRcdFx0aWYgKGRhdGEuJHRydXN0ZWQpIHtcclxuXHRcdFx0XHRjbGVhcihub2RlcywgY2FjaGVkKTtcclxuXHRcdFx0XHRub2RlcyA9IGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vY29ybmVyIGNhc2U6IHJlcGxhY2luZyB0aGUgbm9kZVZhbHVlIG9mIGEgdGV4dCBub2RlIHRoYXQgaXMgYSBjaGlsZCBvZiBhIHRleHRhcmVhL2NvbnRlbnRlZGl0YWJsZSBkb2Vzbid0IHdvcmtcclxuXHRcdFx0Ly93ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgdmFsdWUgcHJvcGVydHkgb2YgdGhlIHBhcmVudCB0ZXh0YXJlYSBvciB0aGUgaW5uZXJIVE1MIG9mIHRoZSBjb250ZW50ZWRpdGFibGUgZWxlbWVudCBpbnN0ZWFkXHJcblx0XHRcdGVsc2UgaWYgKHBhcmVudFRhZyA9PT0gXCJ0ZXh0YXJlYVwiKSB7XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC52YWx1ZSA9IGRhdGE7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoZWRpdGFibGUpIHtcclxuXHRcdFx0XHRlZGl0YWJsZS5pbm5lckhUTUwgPSBkYXRhO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdC8vd2FzIGEgdHJ1c3RlZCBzdHJpbmdcclxuXHRcdFx0XHRpZiAobm9kZXNbMF0ubm9kZVR5cGUgPT09IDEgfHwgbm9kZXMubGVuZ3RoID4gMSkge1xyXG5cdFx0XHRcdFx0Y2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpO1xyXG5cdFx0XHRcdFx0bm9kZXMgPSBbJGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aW5qZWN0VGV4dE5vZGUocGFyZW50RWxlbWVudCwgbm9kZXNbMF0sIGluZGV4LCBkYXRhKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Y2FjaGVkID0gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSk7XHJcblx0XHRjYWNoZWQubm9kZXMgPSBub2RlcztcclxuXHRcdHJldHVybiBjYWNoZWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVUZXh0KGNhY2hlZCwgZGF0YSwgaW5kZXgsIHBhcmVudEVsZW1lbnQsIHNob3VsZFJlYXR0YWNoLCBlZGl0YWJsZSwgcGFyZW50VGFnKSB7XHJcblx0XHQvL2hhbmRsZSB0ZXh0IG5vZGVzXHJcblx0XHRyZXR1cm4gY2FjaGVkLm5vZGVzLmxlbmd0aCA9PT0gMCA/IGhhbmRsZU5vbmV4aXN0ZW50Tm9kZXMoZGF0YSwgcGFyZW50RWxlbWVudCwgaW5kZXgpIDpcclxuXHRcdFx0Y2FjaGVkLnZhbHVlT2YoKSAhPT0gZGF0YS52YWx1ZU9mKCkgfHwgc2hvdWxkUmVhdHRhY2ggPT09IHRydWUgP1xyXG5cdFx0XHRcdHJlYXR0YWNoTm9kZXMoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBlZGl0YWJsZSwgaW5kZXgsIHBhcmVudFRhZykgOlxyXG5cdFx0XHQoY2FjaGVkLm5vZGVzLmludGFjdCA9IHRydWUsIGNhY2hlZCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRTdWJBcnJheUNvdW50KGl0ZW0pIHtcclxuXHRcdGlmIChpdGVtLiR0cnVzdGVkKSB7XHJcblx0XHRcdC8vZml4IG9mZnNldCBvZiBuZXh0IGVsZW1lbnQgaWYgaXRlbSB3YXMgYSB0cnVzdGVkIHN0cmluZyB3LyBtb3JlIHRoYW4gb25lIGh0bWwgZWxlbWVudFxyXG5cdFx0XHQvL3RoZSBmaXJzdCBjbGF1c2UgaW4gdGhlIHJlZ2V4cCBtYXRjaGVzIGVsZW1lbnRzXHJcblx0XHRcdC8vdGhlIHNlY29uZCBjbGF1c2UgKGFmdGVyIHRoZSBwaXBlKSBtYXRjaGVzIHRleHQgbm9kZXNcclxuXHRcdFx0dmFyIG1hdGNoID0gaXRlbS5tYXRjaCgvPFteXFwvXXxcXD5cXHMqW148XS9nKTtcclxuXHRcdFx0aWYgKG1hdGNoICE9IG51bGwpIHJldHVybiBtYXRjaC5sZW5ndGg7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmIChpc0FycmF5KGl0ZW0pKSB7XHJcblx0XHRcdHJldHVybiBpdGVtLmxlbmd0aDtcclxuXHRcdH1cclxuXHRcdHJldHVybiAxO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYnVpbGRBcnJheShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIGluZGV4LCBwYXJlbnRUYWcsIHNob3VsZFJlYXR0YWNoLCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSB7XHJcblx0XHRkYXRhID0gZmxhdHRlbihkYXRhKTtcclxuXHRcdHZhciBub2RlcyA9IFtdLCBpbnRhY3QgPSBjYWNoZWQubGVuZ3RoID09PSBkYXRhLmxlbmd0aCwgc3ViQXJyYXlDb3VudCA9IDA7XHJcblxyXG5cdFx0Ly9rZXlzIGFsZ29yaXRobTogc29ydCBlbGVtZW50cyB3aXRob3V0IHJlY3JlYXRpbmcgdGhlbSBpZiBrZXlzIGFyZSBwcmVzZW50XHJcblx0XHQvLzEpIGNyZWF0ZSBhIG1hcCBvZiBhbGwgZXhpc3Rpbmcga2V5cywgYW5kIG1hcmsgYWxsIGZvciBkZWxldGlvblxyXG5cdFx0Ly8yKSBhZGQgbmV3IGtleXMgdG8gbWFwIGFuZCBtYXJrIHRoZW0gZm9yIGFkZGl0aW9uXHJcblx0XHQvLzMpIGlmIGtleSBleGlzdHMgaW4gbmV3IGxpc3QsIGNoYW5nZSBhY3Rpb24gZnJvbSBkZWxldGlvbiB0byBhIG1vdmVcclxuXHRcdC8vNCkgZm9yIGVhY2gga2V5LCBoYW5kbGUgaXRzIGNvcnJlc3BvbmRpbmcgYWN0aW9uIGFzIG1hcmtlZCBpbiBwcmV2aW91cyBzdGVwc1xyXG5cdFx0dmFyIGV4aXN0aW5nID0ge30sIHNob3VsZE1haW50YWluSWRlbnRpdGllcyA9IGZhbHNlO1xyXG5cdFx0Zm9yS2V5cyhjYWNoZWQsIGZ1bmN0aW9uIChhdHRycywgaSkge1xyXG5cdFx0XHRzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSB0cnVlO1xyXG5cdFx0XHRleGlzdGluZ1tjYWNoZWRbaV0uYXR0cnMua2V5XSA9IHthY3Rpb246IERFTEVUSU9OLCBpbmRleDogaX07XHJcblx0XHR9KTtcclxuXHJcblx0XHRidWlsZEFycmF5S2V5cyhkYXRhKTtcclxuXHRcdGlmIChzaG91bGRNYWludGFpbklkZW50aXRpZXMpIGNhY2hlZCA9IGRpZmZLZXlzKGRhdGEsIGNhY2hlZCwgZXhpc3RpbmcsIHBhcmVudEVsZW1lbnQpO1xyXG5cdFx0Ly9lbmQga2V5IGFsZ29yaXRobVxyXG5cclxuXHRcdHZhciBjYWNoZUNvdW50ID0gMDtcclxuXHRcdC8vZmFzdGVyIGV4cGxpY2l0bHkgd3JpdHRlblxyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0Ly9kaWZmIGVhY2ggaXRlbSBpbiB0aGUgYXJyYXlcclxuXHRcdFx0dmFyIGl0ZW0gPSBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGNhY2hlZCwgaW5kZXgsIGRhdGFbaV0sIGNhY2hlZFtjYWNoZUNvdW50XSwgc2hvdWxkUmVhdHRhY2gsIGluZGV4ICsgc3ViQXJyYXlDb3VudCB8fCBzdWJBcnJheUNvdW50LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcclxuXHJcblx0XHRcdGlmIChpdGVtICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRpbnRhY3QgPSBpbnRhY3QgJiYgaXRlbS5ub2Rlcy5pbnRhY3Q7XHJcblx0XHRcdFx0c3ViQXJyYXlDb3VudCArPSBnZXRTdWJBcnJheUNvdW50KGl0ZW0pO1xyXG5cdFx0XHRcdGNhY2hlZFtjYWNoZUNvdW50KytdID0gaXRlbTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghaW50YWN0KSBkaWZmQXJyYXkoZGF0YSwgY2FjaGVkLCBub2Rlcyk7XHJcblx0XHRyZXR1cm4gY2FjaGVkXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBtYWtlQ2FjaGUoZGF0YSwgY2FjaGVkLCBpbmRleCwgcGFyZW50SW5kZXgsIHBhcmVudENhY2hlKSB7XHJcblx0XHRpZiAoY2FjaGVkICE9IG51bGwpIHtcclxuXHRcdFx0aWYgKHR5cGUuY2FsbChjYWNoZWQpID09PSB0eXBlLmNhbGwoZGF0YSkpIHJldHVybiBjYWNoZWQ7XHJcblxyXG5cdFx0XHRpZiAocGFyZW50Q2FjaGUgJiYgcGFyZW50Q2FjaGUubm9kZXMpIHtcclxuXHRcdFx0XHR2YXIgb2Zmc2V0ID0gaW5kZXggLSBwYXJlbnRJbmRleCwgZW5kID0gb2Zmc2V0ICsgKGlzQXJyYXkoZGF0YSkgPyBkYXRhIDogY2FjaGVkLm5vZGVzKS5sZW5ndGg7XHJcblx0XHRcdFx0Y2xlYXIocGFyZW50Q2FjaGUubm9kZXMuc2xpY2Uob2Zmc2V0LCBlbmQpLCBwYXJlbnRDYWNoZS5zbGljZShvZmZzZXQsIGVuZCkpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGNhY2hlZC5ub2Rlcykge1xyXG5cdFx0XHRcdGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGNhY2hlZCA9IG5ldyBkYXRhLmNvbnN0cnVjdG9yKCk7XHJcblx0XHQvL2lmIGNvbnN0cnVjdG9yIGNyZWF0ZXMgYSB2aXJ0dWFsIGRvbSBlbGVtZW50LCB1c2UgYSBibGFuayBvYmplY3RcclxuXHRcdC8vYXMgdGhlIGJhc2UgY2FjaGVkIG5vZGUgaW5zdGVhZCBvZiBjb3B5aW5nIHRoZSB2aXJ0dWFsIGVsICgjMjc3KVxyXG5cdFx0aWYgKGNhY2hlZC50YWcpIGNhY2hlZCA9IHt9O1xyXG5cdFx0Y2FjaGVkLm5vZGVzID0gW107XHJcblx0XHRyZXR1cm4gY2FjaGVkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29uc3RydWN0Tm9kZShkYXRhLCBuYW1lc3BhY2UpIHtcclxuXHRcdHJldHVybiBuYW1lc3BhY2UgPT09IHVuZGVmaW5lZCA/XHJcblx0XHRcdGRhdGEuYXR0cnMuaXMgPyAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkYXRhLnRhZywgZGF0YS5hdHRycy5pcykgOiAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkYXRhLnRhZykgOlxyXG5cdFx0XHRkYXRhLmF0dHJzLmlzID8gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnLCBkYXRhLmF0dHJzLmlzKSA6ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCBkYXRhLnRhZyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb25zdHJ1Y3RBdHRycyhkYXRhLCBub2RlLCBuYW1lc3BhY2UsIGhhc0tleXMpIHtcclxuXHRcdHJldHVybiBoYXNLZXlzID8gc2V0QXR0cmlidXRlcyhub2RlLCBkYXRhLnRhZywgZGF0YS5hdHRycywge30sIG5hbWVzcGFjZSkgOiBkYXRhLmF0dHJzO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29uc3RydWN0Q2hpbGRyZW4oZGF0YSwgbm9kZSwgY2FjaGVkLCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSB7XHJcblx0XHRyZXR1cm4gZGF0YS5jaGlsZHJlbiAhPSBudWxsICYmIGRhdGEuY2hpbGRyZW4ubGVuZ3RoID4gMCA/XHJcblx0XHRcdGJ1aWxkKG5vZGUsIGRhdGEudGFnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZGF0YS5jaGlsZHJlbiwgY2FjaGVkLmNoaWxkcmVuLCB0cnVlLCAwLCBkYXRhLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSA/IG5vZGUgOiBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSA6XHJcblx0XHRcdGRhdGEuY2hpbGRyZW47XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZWNvbnN0cnVjdENhY2hlZChkYXRhLCBhdHRycywgY2hpbGRyZW4sIG5vZGUsIG5hbWVzcGFjZSwgdmlld3MsIGNvbnRyb2xsZXJzKSB7XHJcblx0XHR2YXIgY2FjaGVkID0ge3RhZzogZGF0YS50YWcsIGF0dHJzOiBhdHRycywgY2hpbGRyZW46IGNoaWxkcmVuLCBub2RlczogW25vZGVdfTtcclxuXHRcdHVubG9hZENhY2hlZENvbnRyb2xsZXJzKGNhY2hlZCwgdmlld3MsIGNvbnRyb2xsZXJzKTtcclxuXHRcdGlmIChjYWNoZWQuY2hpbGRyZW4gJiYgIWNhY2hlZC5jaGlsZHJlbi5ub2RlcykgY2FjaGVkLmNoaWxkcmVuLm5vZGVzID0gW107XHJcblx0XHQvL2VkZ2UgY2FzZTogc2V0dGluZyB2YWx1ZSBvbiA8c2VsZWN0PiBkb2Vzbid0IHdvcmsgYmVmb3JlIGNoaWxkcmVuIGV4aXN0LCBzbyBzZXQgaXQgYWdhaW4gYWZ0ZXIgY2hpbGRyZW4gaGF2ZSBiZWVuIGNyZWF0ZWRcclxuXHRcdGlmIChkYXRhLnRhZyA9PT0gXCJzZWxlY3RcIiAmJiBcInZhbHVlXCIgaW4gZGF0YS5hdHRycykgc2V0QXR0cmlidXRlcyhub2RlLCBkYXRhLnRhZywge3ZhbHVlOiBkYXRhLmF0dHJzLnZhbHVlfSwge30sIG5hbWVzcGFjZSk7XHJcblx0XHRyZXR1cm4gY2FjaGVkXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRDb250cm9sbGVyKHZpZXdzLCB2aWV3LCBjYWNoZWRDb250cm9sbGVycywgY29udHJvbGxlcikge1xyXG5cdFx0dmFyIGNvbnRyb2xsZXJJbmRleCA9IG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT09IFwiZGlmZlwiICYmIHZpZXdzID8gdmlld3MuaW5kZXhPZih2aWV3KSA6IC0xO1xyXG5cdFx0cmV0dXJuIGNvbnRyb2xsZXJJbmRleCA+IC0xID8gY2FjaGVkQ29udHJvbGxlcnNbY29udHJvbGxlckluZGV4XSA6XHJcblx0XHRcdHR5cGVvZiBjb250cm9sbGVyID09PSBcImZ1bmN0aW9uXCIgPyBuZXcgY29udHJvbGxlcigpIDoge307XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB1cGRhdGVMaXN0cyh2aWV3cywgY29udHJvbGxlcnMsIHZpZXcsIGNvbnRyb2xsZXIpIHtcclxuXHRcdGlmIChjb250cm9sbGVyLm9udW5sb2FkICE9IG51bGwpIHVubG9hZGVycy5wdXNoKHtjb250cm9sbGVyOiBjb250cm9sbGVyLCBoYW5kbGVyOiBjb250cm9sbGVyLm9udW5sb2FkfSk7XHJcblx0XHR2aWV3cy5wdXNoKHZpZXcpO1xyXG5cdFx0Y29udHJvbGxlcnMucHVzaChjb250cm9sbGVyKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNoZWNrVmlldyhkYXRhLCB2aWV3LCBjYWNoZWQsIGNhY2hlZENvbnRyb2xsZXJzLCBjb250cm9sbGVycywgdmlld3MpIHtcclxuXHRcdHZhciBjb250cm9sbGVyID0gZ2V0Q29udHJvbGxlcihjYWNoZWQudmlld3MsIHZpZXcsIGNhY2hlZENvbnRyb2xsZXJzLCBkYXRhLmNvbnRyb2xsZXIpO1xyXG5cdFx0Ly9GYXN0ZXIgdG8gY29lcmNlIHRvIG51bWJlciBhbmQgY2hlY2sgZm9yIE5hTlxyXG5cdFx0dmFyIGtleSA9ICsoZGF0YSAmJiBkYXRhLmF0dHJzICYmIGRhdGEuYXR0cnMua2V5KTtcclxuXHRcdGRhdGEgPSBwZW5kaW5nUmVxdWVzdHMgPT09IDAgfHwgZm9yY2luZyB8fCBjYWNoZWRDb250cm9sbGVycyAmJiBjYWNoZWRDb250cm9sbGVycy5pbmRleE9mKGNvbnRyb2xsZXIpID4gLTEgPyBkYXRhLnZpZXcoY29udHJvbGxlcikgOiB7dGFnOiBcInBsYWNlaG9sZGVyXCJ9O1xyXG5cdFx0aWYgKGRhdGEuc3VidHJlZSA9PT0gXCJyZXRhaW5cIikgcmV0dXJuIGNhY2hlZDtcclxuXHRcdGlmIChrZXkgPT09IGtleSkgKGRhdGEuYXR0cnMgPSBkYXRhLmF0dHJzIHx8IHt9KS5rZXkgPSBrZXk7XHJcblx0XHR1cGRhdGVMaXN0cyh2aWV3cywgY29udHJvbGxlcnMsIHZpZXcsIGNvbnRyb2xsZXIpO1xyXG5cdFx0cmV0dXJuIGRhdGE7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBtYXJrVmlld3MoZGF0YSwgY2FjaGVkLCB2aWV3cywgY29udHJvbGxlcnMpIHtcclxuXHRcdHZhciBjYWNoZWRDb250cm9sbGVycyA9IGNhY2hlZCAmJiBjYWNoZWQuY29udHJvbGxlcnM7XHJcblx0XHR3aGlsZSAoZGF0YS52aWV3ICE9IG51bGwpIGRhdGEgPSBjaGVja1ZpZXcoZGF0YSwgZGF0YS52aWV3LiRvcmlnaW5hbCB8fCBkYXRhLnZpZXcsIGNhY2hlZCwgY2FjaGVkQ29udHJvbGxlcnMsIGNvbnRyb2xsZXJzLCB2aWV3cyk7XHJcblx0XHRyZXR1cm4gZGF0YTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJ1aWxkT2JqZWN0KGRhdGEsIGNhY2hlZCwgZWRpdGFibGUsIHBhcmVudEVsZW1lbnQsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgbmFtZXNwYWNlLCBjb25maWdzKSB7XHJcblx0XHR2YXIgdmlld3MgPSBbXSwgY29udHJvbGxlcnMgPSBbXTtcclxuXHRcdGRhdGEgPSBtYXJrVmlld3MoZGF0YSwgY2FjaGVkLCB2aWV3cywgY29udHJvbGxlcnMpO1xyXG5cdFx0aWYgKCFkYXRhLnRhZyAmJiBjb250cm9sbGVycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudCB0ZW1wbGF0ZSBtdXN0IHJldHVybiBhIHZpcnR1YWwgZWxlbWVudCwgbm90IGFuIGFycmF5LCBzdHJpbmcsIGV0Yy5cIik7XHJcblx0XHRkYXRhLmF0dHJzID0gZGF0YS5hdHRycyB8fCB7fTtcclxuXHRcdGNhY2hlZC5hdHRycyA9IGNhY2hlZC5hdHRycyB8fCB7fTtcclxuXHRcdHZhciBkYXRhQXR0cktleXMgPSBPYmplY3Qua2V5cyhkYXRhLmF0dHJzKTtcclxuXHRcdHZhciBoYXNLZXlzID0gZGF0YUF0dHJLZXlzLmxlbmd0aCA+IChcImtleVwiIGluIGRhdGEuYXR0cnMgPyAxIDogMCk7XHJcblx0XHRtYXliZVJlY3JlYXRlT2JqZWN0KGRhdGEsIGNhY2hlZCwgZGF0YUF0dHJLZXlzKTtcclxuXHRcdGlmICghaXNTdHJpbmcoZGF0YS50YWcpKSByZXR1cm47XHJcblx0XHR2YXIgaXNOZXcgPSBjYWNoZWQubm9kZXMubGVuZ3RoID09PSAwO1xyXG5cdFx0bmFtZXNwYWNlID0gZ2V0T2JqZWN0TmFtZXNwYWNlKGRhdGEsIG5hbWVzcGFjZSk7XHJcblx0XHR2YXIgbm9kZTtcclxuXHRcdGlmIChpc05ldykge1xyXG5cdFx0XHRub2RlID0gY29uc3RydWN0Tm9kZShkYXRhLCBuYW1lc3BhY2UpO1xyXG5cdFx0XHQvL3NldCBhdHRyaWJ1dGVzIGZpcnN0LCB0aGVuIGNyZWF0ZSBjaGlsZHJlblxyXG5cdFx0XHR2YXIgYXR0cnMgPSBjb25zdHJ1Y3RBdHRycyhkYXRhLCBub2RlLCBuYW1lc3BhY2UsIGhhc0tleXMpXHJcblx0XHRcdHZhciBjaGlsZHJlbiA9IGNvbnN0cnVjdENoaWxkcmVuKGRhdGEsIG5vZGUsIGNhY2hlZCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XHJcblx0XHRcdGNhY2hlZCA9IHJlY29uc3RydWN0Q2FjaGVkKGRhdGEsIGF0dHJzLCBjaGlsZHJlbiwgbm9kZSwgbmFtZXNwYWNlLCB2aWV3cywgY29udHJvbGxlcnMpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdG5vZGUgPSBidWlsZFVwZGF0ZWROb2RlKGNhY2hlZCwgZGF0YSwgZWRpdGFibGUsIGhhc0tleXMsIG5hbWVzcGFjZSwgdmlld3MsIGNvbmZpZ3MsIGNvbnRyb2xsZXJzKTtcclxuXHRcdH1cclxuXHRcdGlmIChpc05ldyB8fCBzaG91bGRSZWF0dGFjaCA9PT0gdHJ1ZSAmJiBub2RlICE9IG51bGwpIGluc2VydE5vZGUocGFyZW50RWxlbWVudCwgbm9kZSwgaW5kZXgpO1xyXG5cdFx0Ly9zY2hlZHVsZSBjb25maWdzIHRvIGJlIGNhbGxlZC4gVGhleSBhcmUgY2FsbGVkIGFmdGVyIGBidWlsZGBcclxuXHRcdC8vZmluaXNoZXMgcnVubmluZ1xyXG5cdFx0c2NoZWR1bGVDb25maWdzVG9CZUNhbGxlZChjb25maWdzLCBkYXRhLCBub2RlLCBpc05ldywgY2FjaGVkKTtcclxuXHRcdHJldHVybiBjYWNoZWRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJ1aWxkKHBhcmVudEVsZW1lbnQsIHBhcmVudFRhZywgcGFyZW50Q2FjaGUsIHBhcmVudEluZGV4LCBkYXRhLCBjYWNoZWQsIHNob3VsZFJlYXR0YWNoLCBpbmRleCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xyXG5cdFx0Ly9gYnVpbGRgIGlzIGEgcmVjdXJzaXZlIGZ1bmN0aW9uIHRoYXQgbWFuYWdlcyBjcmVhdGlvbi9kaWZmaW5nL3JlbW92YWxcclxuXHRcdC8vb2YgRE9NIGVsZW1lbnRzIGJhc2VkIG9uIGNvbXBhcmlzb24gYmV0d2VlbiBgZGF0YWAgYW5kIGBjYWNoZWRgXHJcblx0XHQvL3RoZSBkaWZmIGFsZ29yaXRobSBjYW4gYmUgc3VtbWFyaXplZCBhcyB0aGlzOlxyXG5cdFx0Ly8xIC0gY29tcGFyZSBgZGF0YWAgYW5kIGBjYWNoZWRgXHJcblx0XHQvLzIgLSBpZiB0aGV5IGFyZSBkaWZmZXJlbnQsIGNvcHkgYGRhdGFgIHRvIGBjYWNoZWRgIGFuZCB1cGRhdGUgdGhlIERPTVxyXG5cdFx0Ly8gICAgYmFzZWQgb24gd2hhdCB0aGUgZGlmZmVyZW5jZSBpc1xyXG5cdFx0Ly8zIC0gcmVjdXJzaXZlbHkgYXBwbHkgdGhpcyBhbGdvcml0aG0gZm9yIGV2ZXJ5IGFycmF5IGFuZCBmb3IgdGhlXHJcblx0XHQvLyAgICBjaGlsZHJlbiBvZiBldmVyeSB2aXJ0dWFsIGVsZW1lbnRcclxuXHJcblx0XHQvL3RoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBpcyBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyB0aGUgcHJldmlvdXNcclxuXHRcdC8vcmVkcmF3J3MgYGRhdGFgIGRhdGEgc3RydWN0dXJlLCB3aXRoIGEgZmV3IGFkZGl0aW9uczpcclxuXHRcdC8vLSBgY2FjaGVkYCBhbHdheXMgaGFzIGEgcHJvcGVydHkgY2FsbGVkIGBub2Rlc2AsIHdoaWNoIGlzIGEgbGlzdCBvZlxyXG5cdFx0Ly8gICBET00gZWxlbWVudHMgdGhhdCBjb3JyZXNwb25kIHRvIHRoZSBkYXRhIHJlcHJlc2VudGVkIGJ5IHRoZVxyXG5cdFx0Ly8gICByZXNwZWN0aXZlIHZpcnR1YWwgZWxlbWVudFxyXG5cdFx0Ly8tIGluIG9yZGVyIHRvIHN1cHBvcnQgYXR0YWNoaW5nIGBub2Rlc2AgYXMgYSBwcm9wZXJ0eSBvZiBgY2FjaGVkYCxcclxuXHRcdC8vICAgYGNhY2hlZGAgaXMgKmFsd2F5cyogYSBub24tcHJpbWl0aXZlIG9iamVjdCwgaS5lLiBpZiB0aGUgZGF0YSB3YXNcclxuXHRcdC8vICAgYSBzdHJpbmcsIHRoZW4gY2FjaGVkIGlzIGEgU3RyaW5nIGluc3RhbmNlLiBJZiBkYXRhIHdhcyBgbnVsbGAgb3JcclxuXHRcdC8vICAgYHVuZGVmaW5lZGAsIGNhY2hlZCBpcyBgbmV3IFN0cmluZyhcIlwiKWBcclxuXHRcdC8vLSBgY2FjaGVkIGFsc28gaGFzIGEgYGNvbmZpZ0NvbnRleHRgIHByb3BlcnR5LCB3aGljaCBpcyB0aGUgc3RhdGVcclxuXHRcdC8vICAgc3RvcmFnZSBvYmplY3QgZXhwb3NlZCBieSBjb25maWcoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dClcclxuXHRcdC8vLSB3aGVuIGBjYWNoZWRgIGlzIGFuIE9iamVjdCwgaXQgcmVwcmVzZW50cyBhIHZpcnR1YWwgZWxlbWVudDsgd2hlblxyXG5cdFx0Ly8gICBpdCdzIGFuIEFycmF5LCBpdCByZXByZXNlbnRzIGEgbGlzdCBvZiBlbGVtZW50czsgd2hlbiBpdCdzIGFcclxuXHRcdC8vICAgU3RyaW5nLCBOdW1iZXIgb3IgQm9vbGVhbiwgaXQgcmVwcmVzZW50cyBhIHRleHQgbm9kZVxyXG5cclxuXHRcdC8vYHBhcmVudEVsZW1lbnRgIGlzIGEgRE9NIGVsZW1lbnQgdXNlZCBmb3IgVzNDIERPTSBBUEkgY2FsbHNcclxuXHRcdC8vYHBhcmVudFRhZ2AgaXMgb25seSB1c2VkIGZvciBoYW5kbGluZyBhIGNvcm5lciBjYXNlIGZvciB0ZXh0YXJlYVxyXG5cdFx0Ly92YWx1ZXNcclxuXHRcdC8vYHBhcmVudENhY2hlYCBpcyB1c2VkIHRvIHJlbW92ZSBub2RlcyBpbiBzb21lIG11bHRpLW5vZGUgY2FzZXNcclxuXHRcdC8vYHBhcmVudEluZGV4YCBhbmQgYGluZGV4YCBhcmUgdXNlZCB0byBmaWd1cmUgb3V0IHRoZSBvZmZzZXQgb2Ygbm9kZXMuXHJcblx0XHQvL1RoZXkncmUgYXJ0aWZhY3RzIGZyb20gYmVmb3JlIGFycmF5cyBzdGFydGVkIGJlaW5nIGZsYXR0ZW5lZCBhbmQgYXJlXHJcblx0XHQvL2xpa2VseSByZWZhY3RvcmFibGVcclxuXHRcdC8vYGRhdGFgIGFuZCBgY2FjaGVkYCBhcmUsIHJlc3BlY3RpdmVseSwgdGhlIG5ldyBhbmQgb2xkIG5vZGVzIGJlaW5nXHJcblx0XHQvL2RpZmZlZFxyXG5cdFx0Ly9gc2hvdWxkUmVhdHRhY2hgIGlzIGEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYSBwYXJlbnQgbm9kZSB3YXNcclxuXHRcdC8vcmVjcmVhdGVkIChpZiBzbywgYW5kIGlmIHRoaXMgbm9kZSBpcyByZXVzZWQsIHRoZW4gdGhpcyBub2RlIG11c3RcclxuXHRcdC8vcmVhdHRhY2ggaXRzZWxmIHRvIHRoZSBuZXcgcGFyZW50KVxyXG5cdFx0Ly9gZWRpdGFibGVgIGlzIGEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGFuIGFuY2VzdG9yIGlzXHJcblx0XHQvL2NvbnRlbnRlZGl0YWJsZVxyXG5cdFx0Ly9gbmFtZXNwYWNlYCBpbmRpY2F0ZXMgdGhlIGNsb3Nlc3QgSFRNTCBuYW1lc3BhY2UgYXMgaXQgY2FzY2FkZXMgZG93blxyXG5cdFx0Ly9mcm9tIGFuIGFuY2VzdG9yXHJcblx0XHQvL2Bjb25maWdzYCBpcyBhIGxpc3Qgb2YgY29uZmlnIGZ1bmN0aW9ucyB0byBydW4gYWZ0ZXIgdGhlIHRvcG1vc3RcclxuXHRcdC8vYGJ1aWxkYCBjYWxsIGZpbmlzaGVzIHJ1bm5pbmdcclxuXHJcblx0XHQvL3RoZXJlJ3MgbG9naWMgdGhhdCByZWxpZXMgb24gdGhlIGFzc3VtcHRpb24gdGhhdCBudWxsIGFuZCB1bmRlZmluZWRcclxuXHRcdC8vZGF0YSBhcmUgZXF1aXZhbGVudCB0byBlbXB0eSBzdHJpbmdzXHJcblx0XHQvLy0gdGhpcyBwcmV2ZW50cyBsaWZlY3ljbGUgc3VycHJpc2VzIGZyb20gcHJvY2VkdXJhbCBoZWxwZXJzIHRoYXQgbWl4XHJcblx0XHQvLyAgaW1wbGljaXQgYW5kIGV4cGxpY2l0IHJldHVybiBzdGF0ZW1lbnRzIChlLmcuXHJcblx0XHQvLyAgZnVuY3Rpb24gZm9vKCkge2lmIChjb25kKSByZXR1cm4gbShcImRpdlwiKX1cclxuXHRcdC8vLSBpdCBzaW1wbGlmaWVzIGRpZmZpbmcgY29kZVxyXG5cdFx0ZGF0YSA9IGRhdGFUb1N0cmluZyhkYXRhKTtcclxuXHRcdGlmIChkYXRhLnN1YnRyZWUgPT09IFwicmV0YWluXCIpIHJldHVybiBjYWNoZWQ7XHJcblx0XHRjYWNoZWQgPSBtYWtlQ2FjaGUoZGF0YSwgY2FjaGVkLCBpbmRleCwgcGFyZW50SW5kZXgsIHBhcmVudENhY2hlKTtcclxuXHRcdHJldHVybiBpc0FycmF5KGRhdGEpID8gYnVpbGRBcnJheShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIGluZGV4LCBwYXJlbnRUYWcsIHNob3VsZFJlYXR0YWNoLCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSA6XHJcblx0XHRcdGRhdGEgIT0gbnVsbCAmJiBpc09iamVjdChkYXRhKSA/IGJ1aWxkT2JqZWN0KGRhdGEsIGNhY2hlZCwgZWRpdGFibGUsIHBhcmVudEVsZW1lbnQsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgbmFtZXNwYWNlLCBjb25maWdzKSA6XHJcblx0XHRcdCFpc0Z1bmN0aW9uKGRhdGEpID8gaGFuZGxlVGV4dChjYWNoZWQsIGRhdGEsIGluZGV4LCBwYXJlbnRFbGVtZW50LCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUsIHBhcmVudFRhZykgOlxyXG5cdFx0XHRjYWNoZWQ7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNvcnRDaGFuZ2VzKGEsIGIpIHsgcmV0dXJuIGEuYWN0aW9uIC0gYi5hY3Rpb24gfHwgYS5pbmRleCAtIGIuaW5kZXg7IH1cclxuXHRmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKG5vZGUsIHRhZywgZGF0YUF0dHJzLCBjYWNoZWRBdHRycywgbmFtZXNwYWNlKSB7XHJcblx0XHRmb3IgKHZhciBhdHRyTmFtZSBpbiBkYXRhQXR0cnMpIHtcclxuXHRcdFx0dmFyIGRhdGFBdHRyID0gZGF0YUF0dHJzW2F0dHJOYW1lXTtcclxuXHRcdFx0dmFyIGNhY2hlZEF0dHIgPSBjYWNoZWRBdHRyc1thdHRyTmFtZV07XHJcblx0XHRcdGlmICghKGF0dHJOYW1lIGluIGNhY2hlZEF0dHJzKSB8fCAoY2FjaGVkQXR0ciAhPT0gZGF0YUF0dHIpKSB7XHJcblx0XHRcdFx0Y2FjaGVkQXR0cnNbYXR0ck5hbWVdID0gZGF0YUF0dHI7XHJcblx0XHRcdFx0Ly9gY29uZmlnYCBpc24ndCBhIHJlYWwgYXR0cmlidXRlcywgc28gaWdub3JlIGl0XHJcblx0XHRcdFx0aWYgKGF0dHJOYW1lID09PSBcImNvbmZpZ1wiIHx8IGF0dHJOYW1lID09PSBcImtleVwiKSBjb250aW51ZTtcclxuXHRcdFx0XHQvL2hvb2sgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGF1dG8tcmVkcmF3aW5nIHN5c3RlbVxyXG5cdFx0XHRcdGVsc2UgaWYgKGlzRnVuY3Rpb24oZGF0YUF0dHIpICYmIGF0dHJOYW1lLnNsaWNlKDAsIDIpID09PSBcIm9uXCIpIHtcclxuXHRcdFx0XHRub2RlW2F0dHJOYW1lXSA9IGF1dG9yZWRyYXcoZGF0YUF0dHIsIG5vZGUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvL2hhbmRsZSBgc3R5bGU6IHsuLi59YFxyXG5cdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcInN0eWxlXCIgJiYgZGF0YUF0dHIgIT0gbnVsbCAmJiBpc09iamVjdChkYXRhQXR0cikpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBydWxlIGluIGRhdGFBdHRyKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjYWNoZWRBdHRyID09IG51bGwgfHwgY2FjaGVkQXR0cltydWxlXSAhPT0gZGF0YUF0dHJbcnVsZV0pIG5vZGUuc3R5bGVbcnVsZV0gPSBkYXRhQXR0cltydWxlXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yICh2YXIgcnVsZSBpbiBjYWNoZWRBdHRyKSB7XHJcblx0XHRcdFx0XHRcdGlmICghKHJ1bGUgaW4gZGF0YUF0dHIpKSBub2RlLnN0eWxlW3J1bGVdID0gXCJcIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vaGFuZGxlIFNWR1xyXG5cdFx0XHRcdGVsc2UgaWYgKG5hbWVzcGFjZSAhPSBudWxsKSB7XHJcblx0XHRcdFx0aWYgKGF0dHJOYW1lID09PSBcImhyZWZcIikgbm9kZS5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiwgXCJocmVmXCIsIGRhdGFBdHRyKTtcclxuXHRcdFx0XHRlbHNlIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lID09PSBcImNsYXNzTmFtZVwiID8gXCJjbGFzc1wiIDogYXR0ck5hbWUsIGRhdGFBdHRyKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly9oYW5kbGUgY2FzZXMgdGhhdCBhcmUgcHJvcGVydGllcyAoYnV0IGlnbm9yZSBjYXNlcyB3aGVyZSB3ZSBzaG91bGQgdXNlIHNldEF0dHJpYnV0ZSBpbnN0ZWFkKVxyXG5cdFx0XHRcdC8vLSBsaXN0IGFuZCBmb3JtIGFyZSB0eXBpY2FsbHkgdXNlZCBhcyBzdHJpbmdzLCBidXQgYXJlIERPTSBlbGVtZW50IHJlZmVyZW5jZXMgaW4ganNcclxuXHRcdFx0XHQvLy0gd2hlbiB1c2luZyBDU1Mgc2VsZWN0b3JzIChlLmcuIGBtKFwiW3N0eWxlPScnXVwiKWApLCBzdHlsZSBpcyB1c2VkIGFzIGEgc3RyaW5nLCBidXQgaXQncyBhbiBvYmplY3QgaW4ganNcclxuXHRcdFx0XHRlbHNlIGlmIChhdHRyTmFtZSBpbiBub2RlICYmIGF0dHJOYW1lICE9PSBcImxpc3RcIiAmJiBhdHRyTmFtZSAhPT0gXCJzdHlsZVwiICYmIGF0dHJOYW1lICE9PSBcImZvcm1cIiAmJiBhdHRyTmFtZSAhPT0gXCJ0eXBlXCIgJiYgYXR0ck5hbWUgIT09IFwid2lkdGhcIiAmJiBhdHRyTmFtZSAhPT0gXCJoZWlnaHRcIikge1xyXG5cdFx0XHRcdC8vIzM0OCBkb24ndCBzZXQgdGhlIHZhbHVlIGlmIG5vdCBuZWVkZWQgb3RoZXJ3aXNlIGN1cnNvciBwbGFjZW1lbnQgYnJlYWtzIGluIENocm9tZVxyXG5cdFx0XHRcdGlmICh0YWcgIT09IFwiaW5wdXRcIiB8fCBub2RlW2F0dHJOYW1lXSAhPT0gZGF0YUF0dHIpIG5vZGVbYXR0ck5hbWVdID0gZGF0YUF0dHI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Ugbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGRhdGFBdHRyKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyMzNDggZGF0YUF0dHIgbWF5IG5vdCBiZSBhIHN0cmluZywgc28gdXNlIGxvb3NlIGNvbXBhcmlzb24gKGRvdWJsZSBlcXVhbCkgaW5zdGVhZCBvZiBzdHJpY3QgKHRyaXBsZSBlcXVhbClcclxuXHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgPT09IFwidmFsdWVcIiAmJiB0YWcgPT09IFwiaW5wdXRcIiAmJiBub2RlLnZhbHVlICE9IGRhdGFBdHRyKSB7XHJcblx0XHRcdFx0bm9kZS52YWx1ZSA9IGRhdGFBdHRyO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY2FjaGVkQXR0cnM7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGNsZWFyKG5vZGVzLCBjYWNoZWQpIHtcclxuXHRcdGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xyXG5cdFx0XHRpZiAobm9kZXNbaV0gJiYgbm9kZXNbaV0ucGFyZW50Tm9kZSkge1xyXG5cdFx0XHRcdHRyeSB7IG5vZGVzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZXNbaV0pOyB9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHt9IC8vaWdub3JlIGlmIHRoaXMgZmFpbHMgZHVlIHRvIG9yZGVyIG9mIGV2ZW50cyAoc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjE5MjYwODMvZmFpbGVkLXRvLWV4ZWN1dGUtcmVtb3ZlY2hpbGQtb24tbm9kZSlcclxuXHRcdFx0XHRjYWNoZWQgPSBbXS5jb25jYXQoY2FjaGVkKTtcclxuXHRcdFx0XHRpZiAoY2FjaGVkW2ldKSB1bmxvYWQoY2FjaGVkW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9yZWxlYXNlIG1lbW9yeSBpZiBub2RlcyBpcyBhbiBhcnJheS4gVGhpcyBjaGVjayBzaG91bGQgZmFpbCBpZiBub2RlcyBpcyBhIE5vZGVMaXN0IChzZWUgbG9vcCBhYm92ZSlcclxuXHRcdGlmIChub2Rlcy5sZW5ndGgpIG5vZGVzLmxlbmd0aCA9IDA7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHVubG9hZChjYWNoZWQpIHtcclxuXHRcdGlmIChjYWNoZWQuY29uZmlnQ29udGV4dCAmJiBpc0Z1bmN0aW9uKGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKSkge1xyXG5cdFx0XHRjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCgpO1xyXG5cdFx0XHRjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCA9IG51bGw7XHJcblx0XHR9XHJcblx0XHRpZiAoY2FjaGVkLmNvbnRyb2xsZXJzKSB7XHJcblx0XHRcdGZvckVhY2goY2FjaGVkLmNvbnRyb2xsZXJzLCBmdW5jdGlvbiAoY29udHJvbGxlcikge1xyXG5cdFx0XHRcdGlmIChpc0Z1bmN0aW9uKGNvbnRyb2xsZXIub251bmxvYWQpKSBjb250cm9sbGVyLm9udW5sb2FkKHtwcmV2ZW50RGVmYXVsdDogbm9vcH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGlmIChjYWNoZWQuY2hpbGRyZW4pIHtcclxuXHRcdFx0aWYgKGlzQXJyYXkoY2FjaGVkLmNoaWxkcmVuKSkgZm9yRWFjaChjYWNoZWQuY2hpbGRyZW4sIHVubG9hZCk7XHJcblx0XHRcdGVsc2UgaWYgKGNhY2hlZC5jaGlsZHJlbi50YWcpIHVubG9hZChjYWNoZWQuY2hpbGRyZW4pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIGluc2VydEFkamFjZW50QmVmb3JlRW5kID0gKGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciByYW5nZVN0cmF0ZWd5ID0gZnVuY3Rpb24gKHBhcmVudEVsZW1lbnQsIGRhdGEpIHtcclxuXHRcdFx0cGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCgkZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoZGF0YSkpO1xyXG5cdFx0fTtcclxuXHRcdHZhciBpbnNlcnRBZGphY2VudFN0cmF0ZWd5ID0gZnVuY3Rpb24gKHBhcmVudEVsZW1lbnQsIGRhdGEpIHtcclxuXHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgZGF0YSk7XHJcblx0XHR9O1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdCRkb2N1bWVudC5jcmVhdGVSYW5nZSgpLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudCgneCcpO1xyXG5cdFx0XHRyZXR1cm4gcmFuZ2VTdHJhdGVneTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0cmV0dXJuIGluc2VydEFkamFjZW50U3RyYXRlZ3k7XHJcblx0XHR9XHJcblx0fSkoKTtcclxuXHJcblx0ZnVuY3Rpb24gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSkge1xyXG5cdFx0dmFyIG5leHRTaWJsaW5nID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XTtcclxuXHRcdGlmIChuZXh0U2libGluZykge1xyXG5cdFx0XHR2YXIgaXNFbGVtZW50ID0gbmV4dFNpYmxpbmcubm9kZVR5cGUgIT09IDE7XHJcblx0XHRcdHZhciBwbGFjZWhvbGRlciA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuXHRcdFx0aWYgKGlzRWxlbWVudCkge1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCBuZXh0U2libGluZyB8fCBudWxsKTtcclxuXHRcdFx0XHRwbGFjZWhvbGRlci5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBkYXRhKTtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHBsYWNlaG9sZGVyKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIG5leHRTaWJsaW5nLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGRhdGEpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpbnNlcnRBZGphY2VudEJlZm9yZUVuZChwYXJlbnRFbGVtZW50LCBkYXRhKTtcclxuXHJcblx0XHR2YXIgbm9kZXMgPSBbXTtcclxuXHRcdHdoaWxlIChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdICE9PSBuZXh0U2libGluZykge1xyXG5cdFx0XHRub2Rlcy5wdXNoKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0pO1xyXG5cdFx0XHRpbmRleCsrO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG5vZGVzO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBhdXRvcmVkcmF3KGNhbGxiYWNrLCBvYmplY3QpIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0XHRtLnJlZHJhdy5zdHJhdGVneShcImRpZmZcIik7XHJcblx0XHRcdG0uc3RhcnRDb21wdXRhdGlvbigpO1xyXG5cdFx0XHR0cnkgeyByZXR1cm4gY2FsbGJhY2suY2FsbChvYmplY3QsIGUpOyB9XHJcblx0XHRcdGZpbmFsbHkge1xyXG5cdFx0XHRcdGVuZEZpcnN0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHZhciBodG1sO1xyXG5cdHZhciBkb2N1bWVudE5vZGUgPSB7XHJcblx0XHRhcHBlbmRDaGlsZDogZnVuY3Rpb24obm9kZSkge1xyXG5cdFx0XHRpZiAoaHRtbCA9PT0gdW5kZWZpbmVkKSBodG1sID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJodG1sXCIpO1xyXG5cdFx0XHRpZiAoJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICE9PSBub2RlKSB7XHJcblx0XHRcdFx0JGRvY3VtZW50LnJlcGxhY2VDaGlsZChub2RlLCAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlICRkb2N1bWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuXHRcdFx0dGhpcy5jaGlsZE5vZGVzID0gJGRvY3VtZW50LmNoaWxkTm9kZXM7XHJcblx0XHR9LFxyXG5cdFx0aW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihub2RlKSB7XHJcblx0XHRcdHRoaXMuYXBwZW5kQ2hpbGQobm9kZSk7XHJcblx0XHR9LFxyXG5cdFx0Y2hpbGROb2RlczogW11cclxuXHR9O1xyXG5cdHZhciBub2RlQ2FjaGUgPSBbXSwgY2VsbENhY2hlID0ge307XHJcblx0bS5yZW5kZXIgPSBmdW5jdGlvbihyb290LCBjZWxsLCBmb3JjZVJlY3JlYXRpb24pIHtcclxuXHRcdHZhciBjb25maWdzID0gW107XHJcblx0XHRpZiAoIXJvb3QpIHRocm93IG5ldyBFcnJvcihcIkVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgYmVpbmcgcGFzc2VkIHRvIG0ucm91dGUvbS5tb3VudC9tLnJlbmRlciBpcyBub3QgdW5kZWZpbmVkLlwiKTtcclxuXHRcdHZhciBpZCA9IGdldENlbGxDYWNoZUtleShyb290KTtcclxuXHRcdHZhciBpc0RvY3VtZW50Um9vdCA9IHJvb3QgPT09ICRkb2N1bWVudDtcclxuXHRcdHZhciBub2RlID0gaXNEb2N1bWVudFJvb3QgfHwgcm9vdCA9PT0gJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/IGRvY3VtZW50Tm9kZSA6IHJvb3Q7XHJcblx0XHRpZiAoaXNEb2N1bWVudFJvb3QgJiYgY2VsbC50YWcgIT09IFwiaHRtbFwiKSBjZWxsID0ge3RhZzogXCJodG1sXCIsIGF0dHJzOiB7fSwgY2hpbGRyZW46IGNlbGx9O1xyXG5cdFx0aWYgKGNlbGxDYWNoZVtpZF0gPT09IHVuZGVmaW5lZCkgY2xlYXIobm9kZS5jaGlsZE5vZGVzKTtcclxuXHRcdGlmIChmb3JjZVJlY3JlYXRpb24gPT09IHRydWUpIHJlc2V0KHJvb3QpO1xyXG5cdFx0Y2VsbENhY2hlW2lkXSA9IGJ1aWxkKG5vZGUsIG51bGwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjZWxsLCBjZWxsQ2FjaGVbaWRdLCBmYWxzZSwgMCwgbnVsbCwgdW5kZWZpbmVkLCBjb25maWdzKTtcclxuXHRcdGZvckVhY2goY29uZmlncywgZnVuY3Rpb24gKGNvbmZpZykgeyBjb25maWcoKTsgfSk7XHJcblx0fTtcclxuXHRmdW5jdGlvbiBnZXRDZWxsQ2FjaGVLZXkoZWxlbWVudCkge1xyXG5cdFx0dmFyIGluZGV4ID0gbm9kZUNhY2hlLmluZGV4T2YoZWxlbWVudCk7XHJcblx0XHRyZXR1cm4gaW5kZXggPCAwID8gbm9kZUNhY2hlLnB1c2goZWxlbWVudCkgLSAxIDogaW5kZXg7XHJcblx0fVxyXG5cclxuXHRtLnRydXN0ID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdHZhbHVlID0gbmV3IFN0cmluZyh2YWx1ZSk7XHJcblx0XHR2YWx1ZS4kdHJ1c3RlZCA9IHRydWU7XHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gZ2V0dGVyc2V0dGVyKHN0b3JlKSB7XHJcblx0XHR2YXIgcHJvcCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCkgc3RvcmUgPSBhcmd1bWVudHNbMF07XHJcblx0XHRcdHJldHVybiBzdG9yZTtcclxuXHRcdH07XHJcblxyXG5cdFx0cHJvcC50b0pTT04gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHN0b3JlO1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gcHJvcDtcclxuXHR9XHJcblxyXG5cdG0ucHJvcCA9IGZ1bmN0aW9uIChzdG9yZSkge1xyXG5cdFx0Ly9ub3RlOiB1c2luZyBub24tc3RyaWN0IGVxdWFsaXR5IGNoZWNrIGhlcmUgYmVjYXVzZSB3ZSdyZSBjaGVja2luZyBpZiBzdG9yZSBpcyBudWxsIE9SIHVuZGVmaW5lZFxyXG5cdFx0aWYgKChzdG9yZSAhPSBudWxsICYmIGlzT2JqZWN0KHN0b3JlKSB8fCBpc0Z1bmN0aW9uKHN0b3JlKSkgJiYgaXNGdW5jdGlvbihzdG9yZS50aGVuKSkge1xyXG5cdFx0XHRyZXR1cm4gcHJvcGlmeShzdG9yZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGdldHRlcnNldHRlcihzdG9yZSk7XHJcblx0fTtcclxuXHJcblx0dmFyIHJvb3RzID0gW10sIGNvbXBvbmVudHMgPSBbXSwgY29udHJvbGxlcnMgPSBbXSwgbGFzdFJlZHJhd0lkID0gbnVsbCwgbGFzdFJlZHJhd0NhbGxUaW1lID0gMCwgY29tcHV0ZVByZVJlZHJhd0hvb2sgPSBudWxsLCBjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBudWxsLCB0b3BDb21wb25lbnQsIHVubG9hZGVycyA9IFtdO1xyXG5cdHZhciBGUkFNRV9CVURHRVQgPSAxNjsgLy82MCBmcmFtZXMgcGVyIHNlY29uZCA9IDEgY2FsbCBwZXIgMTYgbXNcclxuXHRmdW5jdGlvbiBwYXJhbWV0ZXJpemUoY29tcG9uZW50LCBhcmdzKSB7XHJcblx0XHR2YXIgY29udHJvbGxlciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gKGNvbXBvbmVudC5jb250cm9sbGVyIHx8IG5vb3ApLmFwcGx5KHRoaXMsIGFyZ3MpIHx8IHRoaXM7XHJcblx0XHR9O1xyXG5cdFx0aWYgKGNvbXBvbmVudC5jb250cm9sbGVyKSBjb250cm9sbGVyLnByb3RvdHlwZSA9IGNvbXBvbmVudC5jb250cm9sbGVyLnByb3RvdHlwZTtcclxuXHRcdHZhciB2aWV3ID0gZnVuY3Rpb24oY3RybCkge1xyXG5cdFx0XHR2YXIgY3VycmVudEFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3MuY29uY2F0KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkgOiBhcmdzO1xyXG5cdFx0XHRyZXR1cm4gY29tcG9uZW50LnZpZXcuYXBwbHkoY29tcG9uZW50LCBjdXJyZW50QXJncyA/IFtjdHJsXS5jb25jYXQoY3VycmVudEFyZ3MpIDogW2N0cmxdKTtcclxuXHRcdH07XHJcblx0XHR2aWV3LiRvcmlnaW5hbCA9IGNvbXBvbmVudC52aWV3O1xyXG5cdFx0dmFyIG91dHB1dCA9IHtjb250cm9sbGVyOiBjb250cm9sbGVyLCB2aWV3OiB2aWV3fTtcclxuXHRcdGlmIChhcmdzWzBdICYmIGFyZ3NbMF0ua2V5ICE9IG51bGwpIG91dHB1dC5hdHRycyA9IHtrZXk6IGFyZ3NbMF0ua2V5fTtcclxuXHRcdHJldHVybiBvdXRwdXQ7XHJcblx0fVxyXG5cdG0uY29tcG9uZW50ID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XHJcblx0XHRmb3IgKHZhciBhcmdzID0gW10sIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcclxuXHRcdHJldHVybiBwYXJhbWV0ZXJpemUoY29tcG9uZW50LCBhcmdzKTtcclxuXHR9O1xyXG5cdG0ubW91bnQgPSBtLm1vZHVsZSA9IGZ1bmN0aW9uKHJvb3QsIGNvbXBvbmVudCkge1xyXG5cdFx0aWYgKCFyb290KSB0aHJvdyBuZXcgRXJyb3IoXCJQbGVhc2UgZW5zdXJlIHRoZSBET00gZWxlbWVudCBleGlzdHMgYmVmb3JlIHJlbmRlcmluZyBhIHRlbXBsYXRlIGludG8gaXQuXCIpO1xyXG5cdFx0dmFyIGluZGV4ID0gcm9vdHMuaW5kZXhPZihyb290KTtcclxuXHRcdGlmIChpbmRleCA8IDApIGluZGV4ID0gcm9vdHMubGVuZ3RoO1xyXG5cclxuXHRcdHZhciBpc1ByZXZlbnRlZCA9IGZhbHNlO1xyXG5cdFx0dmFyIGV2ZW50ID0ge3ByZXZlbnREZWZhdWx0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0aXNQcmV2ZW50ZWQgPSB0cnVlO1xyXG5cdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vayA9IGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGw7XHJcblx0XHR9fTtcclxuXHJcblx0XHRmb3JFYWNoKHVubG9hZGVycywgZnVuY3Rpb24gKHVubG9hZGVyKSB7XHJcblx0XHRcdHVubG9hZGVyLmhhbmRsZXIuY2FsbCh1bmxvYWRlci5jb250cm9sbGVyLCBldmVudCk7XHJcblx0XHRcdHVubG9hZGVyLmNvbnRyb2xsZXIub251bmxvYWQgPSBudWxsO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aWYgKGlzUHJldmVudGVkKSB7XHJcblx0XHRcdGZvckVhY2godW5sb2FkZXJzLCBmdW5jdGlvbiAodW5sb2FkZXIpIHtcclxuXHRcdFx0XHR1bmxvYWRlci5jb250cm9sbGVyLm9udW5sb2FkID0gdW5sb2FkZXIuaGFuZGxlcjtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHVubG9hZGVycyA9IFtdO1xyXG5cclxuXHRcdGlmIChjb250cm9sbGVyc1tpbmRleF0gJiYgaXNGdW5jdGlvbihjb250cm9sbGVyc1tpbmRleF0ub251bmxvYWQpKSB7XHJcblx0XHRcdGNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZChldmVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGlzTnVsbENvbXBvbmVudCA9IGNvbXBvbmVudCA9PT0gbnVsbDtcclxuXHJcblx0XHRpZiAoIWlzUHJldmVudGVkKSB7XHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiYWxsXCIpO1xyXG5cdFx0XHRtLnN0YXJ0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0cm9vdHNbaW5kZXhdID0gcm9vdDtcclxuXHRcdFx0dmFyIGN1cnJlbnRDb21wb25lbnQgPSBjb21wb25lbnQgPyAodG9wQ29tcG9uZW50ID0gY29tcG9uZW50KSA6ICh0b3BDb21wb25lbnQgPSBjb21wb25lbnQgPSB7Y29udHJvbGxlcjogbm9vcH0pO1xyXG5cdFx0XHR2YXIgY29udHJvbGxlciA9IG5ldyAoY29tcG9uZW50LmNvbnRyb2xsZXIgfHwgbm9vcCkoKTtcclxuXHRcdFx0Ly9jb250cm9sbGVycyBtYXkgY2FsbCBtLm1vdW50IHJlY3Vyc2l2ZWx5ICh2aWEgbS5yb3V0ZSByZWRpcmVjdHMsIGZvciBleGFtcGxlKVxyXG5cdFx0XHQvL3RoaXMgY29uZGl0aW9uYWwgZW5zdXJlcyBvbmx5IHRoZSBsYXN0IHJlY3Vyc2l2ZSBtLm1vdW50IGNhbGwgaXMgYXBwbGllZFxyXG5cdFx0XHRpZiAoY3VycmVudENvbXBvbmVudCA9PT0gdG9wQ29tcG9uZW50KSB7XHJcblx0XHRcdFx0Y29udHJvbGxlcnNbaW5kZXhdID0gY29udHJvbGxlcjtcclxuXHRcdFx0XHRjb21wb25lbnRzW2luZGV4XSA9IGNvbXBvbmVudDtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbmRGaXJzdENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdGlmIChpc051bGxDb21wb25lbnQpIHtcclxuXHRcdFx0XHRyZW1vdmVSb290RWxlbWVudChyb290LCBpbmRleCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGNvbnRyb2xsZXJzW2luZGV4XTtcclxuXHRcdH1cclxuXHRcdGlmIChpc051bGxDb21wb25lbnQpIHtcclxuXHRcdFx0cmVtb3ZlUm9vdEVsZW1lbnQocm9vdCwgaW5kZXgpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIHJlbW92ZVJvb3RFbGVtZW50KHJvb3QsIGluZGV4KSB7XHJcblx0XHRyb290cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0Y29udHJvbGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdGNvbXBvbmVudHMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdHJlc2V0KHJvb3QpO1xyXG5cdFx0bm9kZUNhY2hlLnNwbGljZShnZXRDZWxsQ2FjaGVLZXkocm9vdCksIDEpO1xyXG5cdH1cclxuXHJcblx0dmFyIHJlZHJhd2luZyA9IGZhbHNlLCBmb3JjaW5nID0gZmFsc2U7XHJcblx0bS5yZWRyYXcgPSBmdW5jdGlvbihmb3JjZSkge1xyXG5cdFx0aWYgKHJlZHJhd2luZykgcmV0dXJuO1xyXG5cdFx0cmVkcmF3aW5nID0gdHJ1ZTtcclxuXHRcdGlmIChmb3JjZSkgZm9yY2luZyA9IHRydWU7XHJcblx0XHR0cnkge1xyXG5cdFx0XHQvL2xhc3RSZWRyYXdJZCBpcyBhIHBvc2l0aXZlIG51bWJlciBpZiBhIHNlY29uZCByZWRyYXcgaXMgcmVxdWVzdGVkIGJlZm9yZSB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWVcclxuXHRcdFx0Ly9sYXN0UmVkcmF3SUQgaXMgbnVsbCBpZiBpdCdzIHRoZSBmaXJzdCByZWRyYXcgYW5kIG5vdCBhbiBldmVudCBoYW5kbGVyXHJcblx0XHRcdGlmIChsYXN0UmVkcmF3SWQgJiYgIWZvcmNlKSB7XHJcblx0XHRcdFx0Ly93aGVuIHNldFRpbWVvdXQ6IG9ubHkgcmVzY2hlZHVsZSByZWRyYXcgaWYgdGltZSBiZXR3ZWVuIG5vdyBhbmQgcHJldmlvdXMgcmVkcmF3IGlzIGJpZ2dlciB0aGFuIGEgZnJhbWUsIG90aGVyd2lzZSBrZWVwIGN1cnJlbnRseSBzY2hlZHVsZWQgdGltZW91dFxyXG5cdFx0XHRcdC8vd2hlbiByQUY6IGFsd2F5cyByZXNjaGVkdWxlIHJlZHJhd1xyXG5cdFx0XHRcdGlmICgkcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IG5ldyBEYXRlIC0gbGFzdFJlZHJhd0NhbGxUaW1lID4gRlJBTUVfQlVER0VUKSB7XHJcblx0XHRcdFx0XHRpZiAobGFzdFJlZHJhd0lkID4gMCkgJGNhbmNlbEFuaW1hdGlvbkZyYW1lKGxhc3RSZWRyYXdJZCk7XHJcblx0XHRcdFx0XHRsYXN0UmVkcmF3SWQgPSAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlZHJhdywgRlJBTUVfQlVER0VUKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0cmVkcmF3KCk7XHJcblx0XHRcdFx0bGFzdFJlZHJhd0lkID0gJHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHsgbGFzdFJlZHJhd0lkID0gbnVsbDsgfSwgRlJBTUVfQlVER0VUKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZmluYWxseSB7XHJcblx0XHRcdHJlZHJhd2luZyA9IGZvcmNpbmcgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdG0ucmVkcmF3LnN0cmF0ZWd5ID0gbS5wcm9wKCk7XHJcblx0ZnVuY3Rpb24gcmVkcmF3KCkge1xyXG5cdFx0aWYgKGNvbXB1dGVQcmVSZWRyYXdIb29rKSB7XHJcblx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rKCk7XHJcblx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rID0gbnVsbDtcclxuXHRcdH1cclxuXHRcdGZvckVhY2gocm9vdHMsIGZ1bmN0aW9uIChyb290LCBpKSB7XHJcblx0XHRcdHZhciBjb21wb25lbnQgPSBjb21wb25lbnRzW2ldO1xyXG5cdFx0XHRpZiAoY29udHJvbGxlcnNbaV0pIHtcclxuXHRcdFx0XHR2YXIgYXJncyA9IFtjb250cm9sbGVyc1tpXV07XHJcblx0XHRcdFx0bS5yZW5kZXIocm9vdCwgY29tcG9uZW50LnZpZXcgPyBjb21wb25lbnQudmlldyhjb250cm9sbGVyc1tpXSwgYXJncykgOiBcIlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHQvL2FmdGVyIHJlbmRlcmluZyB3aXRoaW4gYSByb3V0ZWQgY29udGV4dCwgd2UgbmVlZCB0byBzY3JvbGwgYmFjayB0byB0aGUgdG9wLCBhbmQgZmV0Y2ggdGhlIGRvY3VtZW50IHRpdGxlIGZvciBoaXN0b3J5LnB1c2hTdGF0ZVxyXG5cdFx0aWYgKGNvbXB1dGVQb3N0UmVkcmF3SG9vaykge1xyXG5cdFx0XHRjb21wdXRlUG9zdFJlZHJhd0hvb2soKTtcclxuXHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbDtcclxuXHRcdH1cclxuXHRcdGxhc3RSZWRyYXdJZCA9IG51bGw7XHJcblx0XHRsYXN0UmVkcmF3Q2FsbFRpbWUgPSBuZXcgRGF0ZTtcclxuXHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKTtcclxuXHR9XHJcblxyXG5cdHZhciBwZW5kaW5nUmVxdWVzdHMgPSAwO1xyXG5cdG0uc3RhcnRDb21wdXRhdGlvbiA9IGZ1bmN0aW9uKCkgeyBwZW5kaW5nUmVxdWVzdHMrKzsgfTtcclxuXHRtLmVuZENvbXB1dGF0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAocGVuZGluZ1JlcXVlc3RzID4gMSkgcGVuZGluZ1JlcXVlc3RzLS07XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0cGVuZGluZ1JlcXVlc3RzID0gMDtcclxuXHRcdFx0bS5yZWRyYXcoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGVuZEZpcnN0Q29tcHV0YXRpb24oKSB7XHJcblx0XHRpZiAobS5yZWRyYXcuc3RyYXRlZ3koKSA9PT0gXCJub25lXCIpIHtcclxuXHRcdFx0cGVuZGluZ1JlcXVlc3RzLS07XHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgbS5lbmRDb21wdXRhdGlvbigpO1xyXG5cdH1cclxuXHJcblx0bS53aXRoQXR0ciA9IGZ1bmN0aW9uKHByb3AsIHdpdGhBdHRyQ2FsbGJhY2ssIGNhbGxiYWNrVGhpcykge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdHZhciBjdXJyZW50VGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0IHx8IHRoaXM7XHJcblx0XHRcdHZhciBfdGhpcyA9IGNhbGxiYWNrVGhpcyB8fCB0aGlzO1xyXG5cdFx0XHR3aXRoQXR0ckNhbGxiYWNrLmNhbGwoX3RoaXMsIHByb3AgaW4gY3VycmVudFRhcmdldCA/IGN1cnJlbnRUYXJnZXRbcHJvcF0gOiBjdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZShwcm9wKSk7XHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdC8vcm91dGluZ1xyXG5cdHZhciBtb2RlcyA9IHtwYXRobmFtZTogXCJcIiwgaGFzaDogXCIjXCIsIHNlYXJjaDogXCI/XCJ9O1xyXG5cdHZhciByZWRpcmVjdCA9IG5vb3AsIHJvdXRlUGFyYW1zLCBjdXJyZW50Um91dGUsIGlzRGVmYXVsdFJvdXRlID0gZmFsc2U7XHJcblx0bS5yb3V0ZSA9IGZ1bmN0aW9uKHJvb3QsIGFyZzEsIGFyZzIsIHZkb20pIHtcclxuXHRcdC8vbS5yb3V0ZSgpXHJcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGN1cnJlbnRSb3V0ZTtcclxuXHRcdC8vbS5yb3V0ZShlbCwgZGVmYXVsdFJvdXRlLCByb3V0ZXMpXHJcblx0XHRlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmIGlzU3RyaW5nKGFyZzEpKSB7XHJcblx0XHRcdHJlZGlyZWN0ID0gZnVuY3Rpb24oc291cmNlKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSBjdXJyZW50Um91dGUgPSBub3JtYWxpemVSb3V0ZShzb3VyY2UpO1xyXG5cdFx0XHRcdGlmICghcm91dGVCeVZhbHVlKHJvb3QsIGFyZzIsIHBhdGgpKSB7XHJcblx0XHRcdFx0XHRpZiAoaXNEZWZhdWx0Um91dGUpIHRocm93IG5ldyBFcnJvcihcIkVuc3VyZSB0aGUgZGVmYXVsdCByb3V0ZSBtYXRjaGVzIG9uZSBvZiB0aGUgcm91dGVzIGRlZmluZWQgaW4gbS5yb3V0ZVwiKTtcclxuXHRcdFx0XHRcdGlzRGVmYXVsdFJvdXRlID0gdHJ1ZTtcclxuXHRcdFx0XHRcdG0ucm91dGUoYXJnMSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHRpc0RlZmF1bHRSb3V0ZSA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0dmFyIGxpc3RlbmVyID0gbS5yb3V0ZS5tb2RlID09PSBcImhhc2hcIiA/IFwib25oYXNoY2hhbmdlXCIgOiBcIm9ucG9wc3RhdGVcIjtcclxuXHRcdFx0d2luZG93W2xpc3RlbmVyXSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBwYXRoID0gJGxvY2F0aW9uW20ucm91dGUubW9kZV07XHJcblx0XHRcdFx0aWYgKG0ucm91dGUubW9kZSA9PT0gXCJwYXRobmFtZVwiKSBwYXRoICs9ICRsb2NhdGlvbi5zZWFyY2g7XHJcblx0XHRcdFx0aWYgKGN1cnJlbnRSb3V0ZSAhPT0gbm9ybWFsaXplUm91dGUocGF0aCkpIHJlZGlyZWN0KHBhdGgpO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2sgPSBzZXRTY3JvbGw7XHJcblx0XHRcdHdpbmRvd1tsaXN0ZW5lcl0oKTtcclxuXHRcdH1cclxuXHRcdC8vY29uZmlnOiBtLnJvdXRlXHJcblx0XHRlbHNlIGlmIChyb290LmFkZEV2ZW50TGlzdGVuZXIgfHwgcm9vdC5hdHRhY2hFdmVudCkge1xyXG5cdFx0XHRyb290LmhyZWYgPSAobS5yb3V0ZS5tb2RlICE9PSAncGF0aG5hbWUnID8gJGxvY2F0aW9uLnBhdGhuYW1lIDogJycpICsgbW9kZXNbbS5yb3V0ZS5tb2RlXSArIHZkb20uYXR0cnMuaHJlZjtcclxuXHRcdFx0aWYgKHJvb3QuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG5cdFx0XHRcdHJvb3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpO1xyXG5cdFx0XHRcdHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHJvb3QuZGV0YWNoRXZlbnQoXCJvbmNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpO1xyXG5cdFx0XHRcdHJvb3QuYXR0YWNoRXZlbnQoXCJvbmNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL20ucm91dGUocm91dGUsIHBhcmFtcywgc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSlcclxuXHRcdGVsc2UgaWYgKGlzU3RyaW5nKHJvb3QpKSB7XHJcblx0XHRcdHZhciBvbGRSb3V0ZSA9IGN1cnJlbnRSb3V0ZTtcclxuXHRcdFx0Y3VycmVudFJvdXRlID0gcm9vdDtcclxuXHRcdFx0dmFyIGFyZ3MgPSBhcmcxIHx8IHt9O1xyXG5cdFx0XHR2YXIgcXVlcnlJbmRleCA9IGN1cnJlbnRSb3V0ZS5pbmRleE9mKFwiP1wiKTtcclxuXHRcdFx0dmFyIHBhcmFtcyA9IHF1ZXJ5SW5kZXggPiAtMSA/IHBhcnNlUXVlcnlTdHJpbmcoY3VycmVudFJvdXRlLnNsaWNlKHF1ZXJ5SW5kZXggKyAxKSkgOiB7fTtcclxuXHRcdFx0Zm9yICh2YXIgaSBpbiBhcmdzKSBwYXJhbXNbaV0gPSBhcmdzW2ldO1xyXG5cdFx0XHR2YXIgcXVlcnlzdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nKHBhcmFtcyk7XHJcblx0XHRcdHZhciBjdXJyZW50UGF0aCA9IHF1ZXJ5SW5kZXggPiAtMSA/IGN1cnJlbnRSb3V0ZS5zbGljZSgwLCBxdWVyeUluZGV4KSA6IGN1cnJlbnRSb3V0ZTtcclxuXHRcdFx0aWYgKHF1ZXJ5c3RyaW5nKSBjdXJyZW50Um91dGUgPSBjdXJyZW50UGF0aCArIChjdXJyZW50UGF0aC5pbmRleE9mKFwiP1wiKSA9PT0gLTEgPyBcIj9cIiA6IFwiJlwiKSArIHF1ZXJ5c3RyaW5nO1xyXG5cclxuXHRcdFx0dmFyIHNob3VsZFJlcGxhY2VIaXN0b3J5RW50cnkgPSAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyA/IGFyZzIgOiBhcmcxKSA9PT0gdHJ1ZSB8fCBvbGRSb3V0ZSA9PT0gcm9vdDtcclxuXHJcblx0XHRcdGlmICh3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpIHtcclxuXHRcdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vayA9IHNldFNjcm9sbDtcclxuXHRcdFx0XHRjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHdpbmRvdy5oaXN0b3J5W3Nob3VsZFJlcGxhY2VIaXN0b3J5RW50cnkgPyBcInJlcGxhY2VTdGF0ZVwiIDogXCJwdXNoU3RhdGVcIl0obnVsbCwgJGRvY3VtZW50LnRpdGxlLCBtb2Rlc1ttLnJvdXRlLm1vZGVdICsgY3VycmVudFJvdXRlKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHJlZGlyZWN0KG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdCRsb2NhdGlvblttLnJvdXRlLm1vZGVdID0gY3VycmVudFJvdXRlO1xyXG5cdFx0XHRcdHJlZGlyZWN0KG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxuXHRtLnJvdXRlLnBhcmFtID0gZnVuY3Rpb24oa2V5KSB7XHJcblx0XHRpZiAoIXJvdXRlUGFyYW1zKSB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBjYWxsIG0ucm91dGUoZWxlbWVudCwgZGVmYXVsdFJvdXRlLCByb3V0ZXMpIGJlZm9yZSBjYWxsaW5nIG0ucm91dGUucGFyYW0oKVwiKTtcclxuXHRcdGlmKCAha2V5ICl7XHJcblx0XHRcdHJldHVybiByb3V0ZVBhcmFtcztcclxuXHRcdH1cclxuXHRcdHJldHVybiByb3V0ZVBhcmFtc1trZXldO1xyXG5cdH07XHJcblx0bS5yb3V0ZS5tb2RlID0gXCJzZWFyY2hcIjtcclxuXHRmdW5jdGlvbiBub3JtYWxpemVSb3V0ZShyb3V0ZSkge1xyXG5cdFx0cmV0dXJuIHJvdXRlLnNsaWNlKG1vZGVzW20ucm91dGUubW9kZV0ubGVuZ3RoKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gcm91dGVCeVZhbHVlKHJvb3QsIHJvdXRlciwgcGF0aCkge1xyXG5cdFx0cm91dGVQYXJhbXMgPSB7fTtcclxuXHJcblx0XHR2YXIgcXVlcnlTdGFydCA9IHBhdGguaW5kZXhPZihcIj9cIik7XHJcblx0XHRpZiAocXVlcnlTdGFydCAhPT0gLTEpIHtcclxuXHRcdFx0cm91dGVQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHBhdGguc3Vic3RyKHF1ZXJ5U3RhcnQgKyAxLCBwYXRoLmxlbmd0aCkpO1xyXG5cdFx0XHRwYXRoID0gcGF0aC5zdWJzdHIoMCwgcXVlcnlTdGFydCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IGFsbCByb3V0ZXMgYW5kIGNoZWNrIGlmIHRoZXJlJ3NcclxuXHRcdC8vIGFuIGV4YWN0IG1hdGNoIGZvciB0aGUgY3VycmVudCBwYXRoXHJcblx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJvdXRlcik7XHJcblx0XHR2YXIgaW5kZXggPSBrZXlzLmluZGV4T2YocGF0aCk7XHJcblx0XHRpZihpbmRleCAhPT0gLTEpe1xyXG5cdFx0XHRtLm1vdW50KHJvb3QsIHJvdXRlcltrZXlzIFtpbmRleF1dKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yICh2YXIgcm91dGUgaW4gcm91dGVyKSB7XHJcblx0XHRcdGlmIChyb3V0ZSA9PT0gcGF0aCkge1xyXG5cdFx0XHRcdG0ubW91bnQocm9vdCwgcm91dGVyW3JvdXRlXSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChcIl5cIiArIHJvdXRlLnJlcGxhY2UoLzpbXlxcL10rP1xcLnszfS9nLCBcIiguKj8pXCIpLnJlcGxhY2UoLzpbXlxcL10rL2csIFwiKFteXFxcXC9dKylcIikgKyBcIlxcLz8kXCIpO1xyXG5cclxuXHRcdFx0aWYgKG1hdGNoZXIudGVzdChwYXRoKSkge1xyXG5cdFx0XHRcdHBhdGgucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHZhciBrZXlzID0gcm91dGUubWF0Y2goLzpbXlxcL10rL2cpIHx8IFtdO1xyXG5cdFx0XHRcdFx0dmFyIHZhbHVlcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCAtMik7XHJcblx0XHRcdFx0XHRmb3JFYWNoKGtleXMsIGZ1bmN0aW9uIChrZXksIGkpIHtcclxuXHRcdFx0XHRcdFx0cm91dGVQYXJhbXNba2V5LnJlcGxhY2UoLzp8XFwuL2csIFwiXCIpXSA9IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbaV0pO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdG0ubW91bnQocm9vdCwgcm91dGVyW3JvdXRlXSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gcm91dGVVbm9idHJ1c2l2ZShlKSB7XHJcblx0XHRlID0gZSB8fCBldmVudDtcclxuXHJcblx0XHRpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCBlLndoaWNoID09PSAyKSByZXR1cm47XHJcblxyXG5cdFx0aWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdGVsc2UgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cclxuXHRcdHZhciBjdXJyZW50VGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuXHRcdHZhciBhcmdzID0gbS5yb3V0ZS5tb2RlID09PSBcInBhdGhuYW1lXCIgJiYgY3VycmVudFRhcmdldC5zZWFyY2ggPyBwYXJzZVF1ZXJ5U3RyaW5nKGN1cnJlbnRUYXJnZXQuc2VhcmNoLnNsaWNlKDEpKSA6IHt9O1xyXG5cdFx0d2hpbGUgKGN1cnJlbnRUYXJnZXQgJiYgY3VycmVudFRhcmdldC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpICE9PSBcIkFcIikgY3VycmVudFRhcmdldCA9IGN1cnJlbnRUYXJnZXQucGFyZW50Tm9kZTtcclxuXHRcdG0ucm91dGUoY3VycmVudFRhcmdldFttLnJvdXRlLm1vZGVdLnNsaWNlKG1vZGVzW20ucm91dGUubW9kZV0ubGVuZ3RoKSwgYXJncyk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNldFNjcm9sbCgpIHtcclxuXHRcdGlmIChtLnJvdXRlLm1vZGUgIT09IFwiaGFzaFwiICYmICRsb2NhdGlvbi5oYXNoKSAkbG9jYXRpb24uaGFzaCA9ICRsb2NhdGlvbi5oYXNoO1xyXG5cdFx0ZWxzZSB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGJ1aWxkUXVlcnlTdHJpbmcob2JqZWN0LCBwcmVmaXgpIHtcclxuXHRcdHZhciBkdXBsaWNhdGVzID0ge307XHJcblx0XHR2YXIgc3RyID0gW107XHJcblx0XHRmb3IgKHZhciBwcm9wIGluIG9iamVjdCkge1xyXG5cdFx0XHR2YXIga2V5ID0gcHJlZml4ID8gcHJlZml4ICsgXCJbXCIgKyBwcm9wICsgXCJdXCIgOiBwcm9wO1xyXG5cdFx0XHR2YXIgdmFsdWUgPSBvYmplY3RbcHJvcF07XHJcblxyXG5cdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcclxuXHRcdFx0XHRzdHIucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSk7XHJcblx0XHRcdH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpKSB7XHJcblx0XHRcdFx0c3RyLnB1c2goYnVpbGRRdWVyeVN0cmluZyh2YWx1ZSwga2V5KSk7XHJcblx0XHRcdH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcclxuXHRcdFx0XHR2YXIga2V5cyA9IFtdO1xyXG5cdFx0XHRcdGR1cGxpY2F0ZXNba2V5XSA9IGR1cGxpY2F0ZXNba2V5XSB8fCB7fTtcclxuXHRcdFx0XHRmb3JFYWNoKHZhbHVlLCBmdW5jdGlvbiAoaXRlbSkge1xyXG5cdFx0XHRcdFx0aWYgKCFkdXBsaWNhdGVzW2tleV1baXRlbV0pIHtcclxuXHRcdFx0XHRcdFx0ZHVwbGljYXRlc1trZXldW2l0ZW1dID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0a2V5cy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoaXRlbSkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHN0ci5wdXNoKGtleXMuam9pbihcIiZcIikpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRzdHIucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBzdHIuam9pbihcIiZcIik7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHBhcnNlUXVlcnlTdHJpbmcoc3RyKSB7XHJcblx0XHRpZiAoc3RyID09PSBcIlwiIHx8IHN0ciA9PSBudWxsKSByZXR1cm4ge307XHJcblx0XHRpZiAoc3RyLmNoYXJBdCgwKSA9PT0gXCI/XCIpIHN0ciA9IHN0ci5zbGljZSgxKTtcclxuXHJcblx0XHR2YXIgcGFpcnMgPSBzdHIuc3BsaXQoXCImXCIpLCBwYXJhbXMgPSB7fTtcclxuXHRcdGZvckVhY2gocGFpcnMsIGZ1bmN0aW9uIChzdHJpbmcpIHtcclxuXHRcdFx0dmFyIHBhaXIgPSBzdHJpbmcuc3BsaXQoXCI9XCIpO1xyXG5cdFx0XHR2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMF0pO1xyXG5cdFx0XHR2YXIgdmFsdWUgPSBwYWlyLmxlbmd0aCA9PT0gMiA/IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKSA6IG51bGw7XHJcblx0XHRcdGlmIChwYXJhbXNba2V5XSAhPSBudWxsKSB7XHJcblx0XHRcdFx0aWYgKCFpc0FycmF5KHBhcmFtc1trZXldKSkgcGFyYW1zW2tleV0gPSBbcGFyYW1zW2tleV1dO1xyXG5cdFx0XHRcdHBhcmFtc1trZXldLnB1c2godmFsdWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgcGFyYW1zW2tleV0gPSB2YWx1ZTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBwYXJhbXM7XHJcblx0fVxyXG5cdG0ucm91dGUuYnVpbGRRdWVyeVN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmc7XHJcblx0bS5yb3V0ZS5wYXJzZVF1ZXJ5U3RyaW5nID0gcGFyc2VRdWVyeVN0cmluZztcclxuXHJcblx0ZnVuY3Rpb24gcmVzZXQocm9vdCkge1xyXG5cdFx0dmFyIGNhY2hlS2V5ID0gZ2V0Q2VsbENhY2hlS2V5KHJvb3QpO1xyXG5cdFx0Y2xlYXIocm9vdC5jaGlsZE5vZGVzLCBjZWxsQ2FjaGVbY2FjaGVLZXldKTtcclxuXHRcdGNlbGxDYWNoZVtjYWNoZUtleV0gPSB1bmRlZmluZWQ7XHJcblx0fVxyXG5cclxuXHRtLmRlZmVycmVkID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XHJcblx0XHRkZWZlcnJlZC5wcm9taXNlID0gcHJvcGlmeShkZWZlcnJlZC5wcm9taXNlKTtcclxuXHRcdHJldHVybiBkZWZlcnJlZDtcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIHByb3BpZnkocHJvbWlzZSwgaW5pdGlhbFZhbHVlKSB7XHJcblx0XHR2YXIgcHJvcCA9IG0ucHJvcChpbml0aWFsVmFsdWUpO1xyXG5cdFx0cHJvbWlzZS50aGVuKHByb3ApO1xyXG5cdFx0cHJvcC50aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHJldHVybiBwcm9waWZ5KHByb21pc2UudGhlbihyZXNvbHZlLCByZWplY3QpLCBpbml0aWFsVmFsdWUpO1xyXG5cdFx0fTtcclxuXHRcdHByb3BbXCJjYXRjaFwiXSA9IHByb3AudGhlbi5iaW5kKG51bGwsIG51bGwpO1xyXG5cdFx0cHJvcFtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG5cdFx0XHR2YXIgX2NhbGxiYWNrID0gZnVuY3Rpb24oKSB7cmV0dXJuIG0uZGVmZXJyZWQoKS5yZXNvbHZlKGNhbGxiYWNrKCkpLnByb21pc2U7fTtcclxuXHRcdFx0cmV0dXJuIHByb3AudGhlbihmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRcdHJldHVybiBwcm9waWZ5KF9jYWxsYmFjaygpLnRoZW4oZnVuY3Rpb24oKSB7cmV0dXJuIHZhbHVlO30pLCBpbml0aWFsVmFsdWUpO1xyXG5cdFx0XHR9LCBmdW5jdGlvbihyZWFzb24pIHtcclxuXHRcdFx0XHRyZXR1cm4gcHJvcGlmeShfY2FsbGJhY2soKS50aGVuKGZ1bmN0aW9uKCkge3Rocm93IG5ldyBFcnJvcihyZWFzb24pO30pLCBpbml0aWFsVmFsdWUpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH07XHJcblx0XHRyZXR1cm4gcHJvcDtcclxuXHR9XHJcblx0Ly9Qcm9taXoubWl0aHJpbC5qcyB8IFpvbG1laXN0ZXIgfCBNSVRcclxuXHQvL2EgbW9kaWZpZWQgdmVyc2lvbiBvZiBQcm9taXouanMsIHdoaWNoIGRvZXMgbm90IGNvbmZvcm0gdG8gUHJvbWlzZXMvQSsgZm9yIHR3byByZWFzb25zOlxyXG5cdC8vMSkgYHRoZW5gIGNhbGxiYWNrcyBhcmUgY2FsbGVkIHN5bmNocm9ub3VzbHkgKGJlY2F1c2Ugc2V0VGltZW91dCBpcyB0b28gc2xvdywgYW5kIHRoZSBzZXRJbW1lZGlhdGUgcG9seWZpbGwgaXMgdG9vIGJpZ1xyXG5cdC8vMikgdGhyb3dpbmcgc3ViY2xhc3NlcyBvZiBFcnJvciBjYXVzZSB0aGUgZXJyb3IgdG8gYmUgYnViYmxlZCB1cCBpbnN0ZWFkIG9mIHRyaWdnZXJpbmcgcmVqZWN0aW9uIChiZWNhdXNlIHRoZSBzcGVjIGRvZXMgbm90IGFjY291bnQgZm9yIHRoZSBpbXBvcnRhbnQgdXNlIGNhc2Ugb2YgZGVmYXVsdCBicm93c2VyIGVycm9yIGhhbmRsaW5nLCBpLmUuIG1lc3NhZ2Ugdy8gbGluZSBudW1iZXIpXHJcblx0ZnVuY3Rpb24gRGVmZXJyZWQoc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcclxuXHRcdHZhciBSRVNPTFZJTkcgPSAxLCBSRUpFQ1RJTkcgPSAyLCBSRVNPTFZFRCA9IDMsIFJFSkVDVEVEID0gNDtcclxuXHRcdHZhciBzZWxmID0gdGhpcywgc3RhdGUgPSAwLCBwcm9taXNlVmFsdWUgPSAwLCBuZXh0ID0gW107XHJcblxyXG5cdFx0c2VsZi5wcm9taXNlID0ge307XHJcblxyXG5cdFx0c2VsZi5yZXNvbHZlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0aWYgKCFzdGF0ZSkge1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVTT0xWSU5HO1xyXG5cclxuXHRcdFx0XHRmaXJlKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdHNlbGYucmVqZWN0ID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0aWYgKCFzdGF0ZSkge1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cclxuXHRcdFx0XHRmaXJlKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9O1xyXG5cclxuXHRcdHNlbGYucHJvbWlzZS50aGVuID0gZnVuY3Rpb24oc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gbmV3IERlZmVycmVkKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKVxyXG5cdFx0XHRpZiAoc3RhdGUgPT09IFJFU09MVkVEKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlVmFsdWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKHN0YXRlID09PSBSRUpFQ1RFRCkge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChwcm9taXNlVmFsdWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdG5leHQucHVzaChkZWZlcnJlZCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2VcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmluaXNoKHR5cGUpIHtcclxuXHRcdFx0c3RhdGUgPSB0eXBlIHx8IFJFSkVDVEVEO1xyXG5cdFx0XHRuZXh0Lm1hcChmdW5jdGlvbihkZWZlcnJlZCkge1xyXG5cdFx0XHRcdHN0YXRlID09PSBSRVNPTFZFRCA/IGRlZmVycmVkLnJlc29sdmUocHJvbWlzZVZhbHVlKSA6IGRlZmVycmVkLnJlamVjdChwcm9taXNlVmFsdWUpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0aGVubmFibGUodGhlbiwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2ssIG5vdFRoZW5uYWJsZUNhbGxiYWNrKSB7XHJcblx0XHRcdGlmICgoKHByb21pc2VWYWx1ZSAhPSBudWxsICYmIGlzT2JqZWN0KHByb21pc2VWYWx1ZSkpIHx8IGlzRnVuY3Rpb24ocHJvbWlzZVZhbHVlKSkgJiYgaXNGdW5jdGlvbih0aGVuKSkge1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHQvLyBjb3VudCBwcm90ZWN0cyBhZ2FpbnN0IGFidXNlIGNhbGxzIGZyb20gc3BlYyBjaGVja2VyXHJcblx0XHRcdFx0XHR2YXIgY291bnQgPSAwO1xyXG5cdFx0XHRcdFx0dGhlbi5jYWxsKHByb21pc2VWYWx1ZSwgZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNvdW50KyspIHJldHVybjtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjaygpO1xyXG5cdFx0XHRcdFx0fSwgZnVuY3Rpb24gKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjb3VudCsrKSByZXR1cm47XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRmYWlsdXJlQ2FsbGJhY2soKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZTtcclxuXHRcdFx0XHRcdGZhaWx1cmVDYWxsYmFjaygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRub3RUaGVubmFibGVDYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmlyZSgpIHtcclxuXHRcdFx0Ly8gY2hlY2sgaWYgaXQncyBhIHRoZW5hYmxlXHJcblx0XHRcdHZhciB0aGVuO1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdHRoZW4gPSBwcm9taXNlVmFsdWUgJiYgcHJvbWlzZVZhbHVlLnRoZW47XHJcblx0XHRcdH1cclxuXHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZTtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFSkVDVElORztcclxuXHRcdFx0XHRyZXR1cm4gZmlyZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGVubmFibGUodGhlbiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c3RhdGUgPSBSRVNPTFZJTkc7XHJcblx0XHRcdFx0ZmlyZSgpO1xyXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFSkVDVElORztcclxuXHRcdFx0XHRmaXJlKCk7XHJcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRpZiAoc3RhdGUgPT09IFJFU09MVklORyAmJiBpc0Z1bmN0aW9uKHN1Y2Nlc3NDYWxsYmFjaykpIHtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gc3VjY2Vzc0NhbGxiYWNrKHByb21pc2VWYWx1ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIGlmIChzdGF0ZSA9PT0gUkVKRUNUSU5HICYmIGlzRnVuY3Rpb24oZmFpbHVyZUNhbGxiYWNrKSkge1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBmYWlsdXJlQ2FsbGJhY2socHJvbWlzZVZhbHVlKTtcclxuXHRcdFx0XHRcdFx0c3RhdGUgPSBSRVNPTFZJTkc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZpbmlzaCgpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKHByb21pc2VWYWx1ZSA9PT0gc2VsZikge1xyXG5cdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gVHlwZUVycm9yKCk7XHJcblx0XHRcdFx0XHRmaW5pc2goKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGhlbm5hYmxlKHRoZW4sIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0ZmluaXNoKFJFU09MVkVEKTtcclxuXHRcdFx0XHRcdH0sIGZpbmlzaCwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRmaW5pc2goc3RhdGUgPT09IFJFU09MVklORyAmJiBSRVNPTFZFRCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRtLmRlZmVycmVkLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRpZiAodHlwZS5jYWxsKGUpID09PSBcIltvYmplY3QgRXJyb3JdXCIgJiYgIWUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvIEVycm9yLykpIHtcclxuXHRcdFx0cGVuZGluZ1JlcXVlc3RzID0gMDtcclxuXHRcdFx0dGhyb3cgZTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRtLnN5bmMgPSBmdW5jdGlvbihhcmdzKSB7XHJcblx0XHR2YXIgbWV0aG9kID0gXCJyZXNvbHZlXCI7XHJcblxyXG5cdFx0ZnVuY3Rpb24gc3luY2hyb25pemVyKHBvcywgcmVzb2x2ZWQpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdFx0cmVzdWx0c1twb3NdID0gdmFsdWU7XHJcblx0XHRcdFx0aWYgKCFyZXNvbHZlZCkgbWV0aG9kID0gXCJyZWplY3RcIjtcclxuXHRcdFx0XHRpZiAoLS1vdXRzdGFuZGluZyA9PT0gMCkge1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucHJvbWlzZShyZXN1bHRzKTtcclxuXHRcdFx0XHRcdGRlZmVycmVkW21ldGhvZF0ocmVzdWx0cyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XHJcblx0XHR2YXIgb3V0c3RhbmRpbmcgPSBhcmdzLmxlbmd0aDtcclxuXHRcdHZhciByZXN1bHRzID0gbmV3IEFycmF5KG91dHN0YW5kaW5nKTtcclxuXHRcdGlmIChhcmdzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yRWFjaChhcmdzLCBmdW5jdGlvbiAoYXJnLCBpKSB7XHJcblx0XHRcdFx0YXJnLnRoZW4oc3luY2hyb25pemVyKGksIHRydWUpLCBzeW5jaHJvbml6ZXIoaSwgZmFsc2UpKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNlIGRlZmVycmVkLnJlc29sdmUoW10pO1xyXG5cclxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdH07XHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XHJcblxyXG5cdGZ1bmN0aW9uIGFqYXgob3B0aW9ucykge1xyXG5cdFx0aWYgKG9wdGlvbnMuZGF0YVR5cGUgJiYgb3B0aW9ucy5kYXRhVHlwZS50b0xvd2VyQ2FzZSgpID09PSBcImpzb25wXCIpIHtcclxuXHRcdFx0dmFyIGNhbGxiYWNrS2V5ID0gXCJtaXRocmlsX2NhbGxiYWNrX1wiICsgbmV3IERhdGUoKS5nZXRUaW1lKCkgKyBcIl9cIiArIChNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxZTE2KSkudG9TdHJpbmcoMzYpXHJcblx0XHRcdHZhciBzY3JpcHQgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcclxuXHJcblx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSBmdW5jdGlvbihyZXNwKSB7XHJcblx0XHRcdFx0c2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcclxuXHRcdFx0XHRvcHRpb25zLm9ubG9hZCh7XHJcblx0XHRcdFx0XHR0eXBlOiBcImxvYWRcIixcclxuXHRcdFx0XHRcdHRhcmdldDoge1xyXG5cdFx0XHRcdFx0XHRyZXNwb25zZVRleHQ6IHJlc3BcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR3aW5kb3dbY2FsbGJhY2tLZXldID0gdW5kZWZpbmVkO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0c2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xyXG5cclxuXHRcdFx0XHRvcHRpb25zLm9uZXJyb3Ioe1xyXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxyXG5cdFx0XHRcdFx0dGFyZ2V0OiB7XHJcblx0XHRcdFx0XHRcdHN0YXR1czogNTAwLFxyXG5cdFx0XHRcdFx0XHRyZXNwb25zZVRleHQ6IEpTT04uc3RyaW5naWZ5KHtcclxuXHRcdFx0XHRcdFx0XHRlcnJvcjogXCJFcnJvciBtYWtpbmcganNvbnAgcmVxdWVzdFwiXHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0d2luZG93W2NhbGxiYWNrS2V5XSA9IHVuZGVmaW5lZDtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0c2NyaXB0LnNyYyA9IG9wdGlvbnMudXJsXHJcblx0XHRcdFx0KyAob3B0aW9ucy51cmwuaW5kZXhPZihcIj9cIikgPiAwID8gXCImXCIgOiBcIj9cIilcclxuXHRcdFx0XHQrIChvcHRpb25zLmNhbGxiYWNrS2V5ID8gb3B0aW9ucy5jYWxsYmFja0tleSA6IFwiY2FsbGJhY2tcIilcclxuXHRcdFx0XHQrIFwiPVwiICsgY2FsbGJhY2tLZXlcclxuXHRcdFx0XHQrIFwiJlwiICsgYnVpbGRRdWVyeVN0cmluZyhvcHRpb25zLmRhdGEgfHwge30pO1xyXG5cdFx0XHQkZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHZhciB4aHIgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0XHRcdHhoci5vcGVuKG9wdGlvbnMubWV0aG9kLCBvcHRpb25zLnVybCwgdHJ1ZSwgb3B0aW9ucy51c2VyLCBvcHRpb25zLnBhc3N3b3JkKTtcclxuXHRcdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xyXG5cdFx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIG9wdGlvbnMub25sb2FkKHt0eXBlOiBcImxvYWRcIiwgdGFyZ2V0OiB4aHJ9KTtcclxuXHRcdFx0XHRcdGVsc2Ugb3B0aW9ucy5vbmVycm9yKHt0eXBlOiBcImVycm9yXCIsIHRhcmdldDogeGhyfSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRpZiAob3B0aW9ucy5zZXJpYWxpemUgPT09IEpTT04uc3RyaW5naWZ5ICYmIG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLm1ldGhvZCAhPT0gXCJHRVRcIikge1xyXG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAob3B0aW9ucy5kZXNlcmlhbGl6ZSA9PT0gSlNPTi5wYXJzZSkge1xyXG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC8qXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChpc0Z1bmN0aW9uKG9wdGlvbnMuY29uZmlnKSkge1xyXG5cdFx0XHRcdHZhciBtYXliZVhociA9IG9wdGlvbnMuY29uZmlnKHhociwgb3B0aW9ucyk7XHJcblx0XHRcdFx0aWYgKG1heWJlWGhyICE9IG51bGwpIHhociA9IG1heWJlWGhyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgZGF0YSA9IG9wdGlvbnMubWV0aG9kID09PSBcIkdFVFwiIHx8ICFvcHRpb25zLmRhdGEgPyBcIlwiIDogb3B0aW9ucy5kYXRhO1xyXG5cdFx0XHRpZiAoZGF0YSAmJiAoIWlzU3RyaW5nKGRhdGEpICYmIGRhdGEuY29uc3RydWN0b3IgIT09IHdpbmRvdy5Gb3JtRGF0YSkpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSZXF1ZXN0IGRhdGEgc2hvdWxkIGJlIGVpdGhlciBiZSBhIHN0cmluZyBvciBGb3JtRGF0YS4gQ2hlY2sgdGhlIGBzZXJpYWxpemVgIG9wdGlvbiBpbiBgbS5yZXF1ZXN0YFwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR4aHIuc2VuZChkYXRhKTtcclxuXHRcdFx0cmV0dXJuIHhocjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJpbmREYXRhKHhock9wdGlvbnMsIGRhdGEsIHNlcmlhbGl6ZSkge1xyXG5cdFx0aWYgKHhock9wdGlvbnMubWV0aG9kID09PSBcIkdFVFwiICYmIHhock9wdGlvbnMuZGF0YVR5cGUgIT09IFwianNvbnBcIikge1xyXG5cdFx0XHR2YXIgcHJlZml4ID0geGhyT3B0aW9ucy51cmwuaW5kZXhPZihcIj9cIikgPCAwID8gXCI/XCIgOiBcIiZcIjtcclxuXHRcdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhkYXRhKTtcclxuXHRcdFx0eGhyT3B0aW9ucy51cmwgPSB4aHJPcHRpb25zLnVybCArIChxdWVyeXN0cmluZyA/IHByZWZpeCArIHF1ZXJ5c3RyaW5nIDogXCJcIik7XHJcblx0XHR9XHJcblx0XHRlbHNlIHhock9wdGlvbnMuZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcclxuXHRcdHJldHVybiB4aHJPcHRpb25zO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGFyYW1ldGVyaXplVXJsKHVybCwgZGF0YSkge1xyXG5cdFx0dmFyIHRva2VucyA9IHVybC5tYXRjaCgvOlthLXpdXFx3Ky9naSk7XHJcblx0XHRpZiAodG9rZW5zICYmIGRhdGEpIHtcclxuXHRcdFx0Zm9yRWFjaCh0b2tlbnMsIGZ1bmN0aW9uICh0b2tlbikge1xyXG5cdFx0XHRcdHZhciBrZXkgPSB0b2tlbi5zbGljZSgxKTtcclxuXHRcdFx0XHR1cmwgPSB1cmwucmVwbGFjZSh0b2tlbiwgZGF0YVtrZXldKTtcclxuXHRcdFx0XHRkZWxldGUgZGF0YVtrZXldO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB1cmw7XHJcblx0fVxyXG5cclxuXHRtLnJlcXVlc3QgPSBmdW5jdGlvbih4aHJPcHRpb25zKSB7XHJcblx0XHRpZiAoeGhyT3B0aW9ucy5iYWNrZ3JvdW5kICE9PSB0cnVlKSBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcclxuXHRcdHZhciBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xyXG5cdFx0dmFyIGlzSlNPTlAgPSB4aHJPcHRpb25zLmRhdGFUeXBlICYmIHhock9wdGlvbnMuZGF0YVR5cGUudG9Mb3dlckNhc2UoKSA9PT0gXCJqc29ucFwiXHJcblx0XHR2YXIgc2VyaWFsaXplID0geGhyT3B0aW9ucy5zZXJpYWxpemUgPSBpc0pTT05QID8gaWRlbnRpdHkgOiB4aHJPcHRpb25zLnNlcmlhbGl6ZSB8fCBKU09OLnN0cmluZ2lmeTtcclxuXHRcdHZhciBkZXNlcmlhbGl6ZSA9IHhock9wdGlvbnMuZGVzZXJpYWxpemUgPSBpc0pTT05QID8gaWRlbnRpdHkgOiB4aHJPcHRpb25zLmRlc2VyaWFsaXplIHx8IEpTT04ucGFyc2U7XHJcblx0XHR2YXIgZXh0cmFjdCA9IGlzSlNPTlAgPyBmdW5jdGlvbihqc29ucCkgeyByZXR1cm4ganNvbnAucmVzcG9uc2VUZXh0IH0gOiB4aHJPcHRpb25zLmV4dHJhY3QgfHwgZnVuY3Rpb24oeGhyKSB7XHJcblx0XHRcdGlmICh4aHIucmVzcG9uc2VUZXh0Lmxlbmd0aCA9PT0gMCAmJiBkZXNlcmlhbGl6ZSA9PT0gSlNPTi5wYXJzZSkge1xyXG5cdFx0XHRcdHJldHVybiBudWxsXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHhoci5yZXNwb25zZVRleHRcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHhock9wdGlvbnMubWV0aG9kID0gKHhock9wdGlvbnMubWV0aG9kIHx8IFwiR0VUXCIpLnRvVXBwZXJDYXNlKCk7XHJcblx0XHR4aHJPcHRpb25zLnVybCA9IHBhcmFtZXRlcml6ZVVybCh4aHJPcHRpb25zLnVybCwgeGhyT3B0aW9ucy5kYXRhKTtcclxuXHRcdHhock9wdGlvbnMgPSBiaW5kRGF0YSh4aHJPcHRpb25zLCB4aHJPcHRpb25zLmRhdGEsIHNlcmlhbGl6ZSk7XHJcblx0XHR4aHJPcHRpb25zLm9ubG9hZCA9IHhock9wdGlvbnMub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdFx0XHR2YXIgdW53cmFwID0gKGUudHlwZSA9PT0gXCJsb2FkXCIgPyB4aHJPcHRpb25zLnVud3JhcFN1Y2Nlc3MgOiB4aHJPcHRpb25zLnVud3JhcEVycm9yKSB8fCBpZGVudGl0eTtcclxuXHRcdFx0XHR2YXIgcmVzcG9uc2UgPSB1bndyYXAoZGVzZXJpYWxpemUoZXh0cmFjdChlLnRhcmdldCwgeGhyT3B0aW9ucykpLCBlLnRhcmdldCk7XHJcblx0XHRcdFx0aWYgKGUudHlwZSA9PT0gXCJsb2FkXCIpIHtcclxuXHRcdFx0XHRcdGlmIChpc0FycmF5KHJlc3BvbnNlKSAmJiB4aHJPcHRpb25zLnR5cGUpIHtcclxuXHRcdFx0XHRcdFx0Zm9yRWFjaChyZXNwb25zZSwgZnVuY3Rpb24gKHJlcywgaSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3BvbnNlW2ldID0gbmV3IHhock9wdGlvbnMudHlwZShyZXMpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoeGhyT3B0aW9ucy50eXBlKSB7XHJcblx0XHRcdFx0XHRcdHJlc3BvbnNlID0gbmV3IHhock9wdGlvbnMudHlwZShyZXNwb25zZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRkZWZlcnJlZFtlLnR5cGUgPT09IFwibG9hZFwiID8gXCJyZXNvbHZlXCIgOiBcInJlamVjdFwiXShyZXNwb25zZSk7XHJcblx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoeGhyT3B0aW9ucy5iYWNrZ3JvdW5kICE9PSB0cnVlKSBtLmVuZENvbXB1dGF0aW9uKClcclxuXHRcdH1cclxuXHJcblx0XHRhamF4KHhock9wdGlvbnMpO1xyXG5cdFx0ZGVmZXJyZWQucHJvbWlzZSA9IHByb3BpZnkoZGVmZXJyZWQucHJvbWlzZSwgeGhyT3B0aW9ucy5pbml0aWFsVmFsdWUpO1xyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblx0fTtcclxuXHJcblx0Ly90ZXN0aW5nIEFQSVxyXG5cdG0uZGVwcyA9IGZ1bmN0aW9uKG1vY2spIHtcclxuXHRcdGluaXRpYWxpemUod2luZG93ID0gbW9jayB8fCB3aW5kb3cpO1xyXG5cdFx0cmV0dXJuIHdpbmRvdztcclxuXHR9O1xyXG5cdC8vZm9yIGludGVybmFsIHRlc3Rpbmcgb25seSwgZG8gbm90IHVzZSBgbS5kZXBzLmZhY3RvcnlgXHJcblx0bS5kZXBzLmZhY3RvcnkgPSBhcHA7XHJcblxyXG5cdHJldHVybiBtO1xyXG59KSh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pO1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlICE9IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gbTtcclxuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIG0gfSk7XHJcbiIsIi8qISBAcHJlc2VydmVcbiAqIG51bWVyYWwuanNcbiAqIHZlcnNpb24gOiAxLjUuNlxuICogYXV0aG9yIDogQWRhbSBEcmFwZXJcbiAqIGxpY2Vuc2UgOiBNSVRcbiAqIGh0dHA6Ly9hZGFtd2RyYXBlci5naXRodWIuY29tL051bWVyYWwtanMvXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBWYXJpYWJsZXNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICB2YXIgbnVtZXJhbCxcbiAgICAgICAgVkVSU0lPTiA9ICcxLjUuNicsXG4gICAgICAgIC8vIGludGVybmFsIHN0b3JhZ2UgZm9yIGxhbmd1YWdlIGNvbmZpZyBmaWxlc1xuICAgICAgICBsYW5ndWFnZXMgPSB7fSxcbiAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBjdXJyZW50TGFuZ3VhZ2U6ICdlbicsXG4gICAgICAgICAgICB6ZXJvRm9ybWF0OiBudWxsLFxuICAgICAgICAgICAgbnVsbEZvcm1hdDogbnVsbCxcbiAgICAgICAgICAgIGRlZmF1bHRGb3JtYXQ6ICcwLDAnXG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBjdXJyZW50TGFuZ3VhZ2U6IGRlZmF1bHRzLmN1cnJlbnRMYW5ndWFnZSxcbiAgICAgICAgICAgIHplcm9Gb3JtYXQ6IGRlZmF1bHRzLnplcm9Gb3JtYXQsXG4gICAgICAgICAgICBudWxsRm9ybWF0OiBkZWZhdWx0cy5udWxsRm9ybWF0LFxuICAgICAgICAgICAgZGVmYXVsdEZvcm1hdDogZGVmYXVsdHMuZGVmYXVsdEZvcm1hdFxuICAgICAgICB9LFxuICAgICAgICBieXRlU3VmZml4ZXMgPSB7XG4gICAgICAgICAgICBieXRlczogWydCJywnS0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXSxcbiAgICAgICAgICAgIGllYzogWydCJywnS2lCJywgJ01pQicsICdHaUInLCAnVGlCJywgJ1BpQicsICdFaUInLCAnWmlCJywgJ1lpQiddXG4gICAgICAgIH07XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgQ29uc3RydWN0b3JzXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvLyBOdW1lcmFsIHByb3RvdHlwZSBvYmplY3RcbiAgICBmdW5jdGlvbiBOdW1lcmFsKG51bWJlcikge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IG51bWJlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB0b0ZpeGVkKCkgdGhhdCB0cmVhdHMgZmxvYXRzIG1vcmUgbGlrZSBkZWNpbWFsc1xuICAgICAqXG4gICAgICogRml4ZXMgYmluYXJ5IHJvdW5kaW5nIGlzc3VlcyAoZWcuICgwLjYxNSkudG9GaXhlZCgyKSA9PT0gJzAuNjEnKSB0aGF0IHByZXNlbnRcbiAgICAgKiBwcm9ibGVtcyBmb3IgYWNjb3VudGluZy0gYW5kIGZpbmFuY2UtcmVsYXRlZCBzb2Z0d2FyZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0b0ZpeGVkICh2YWx1ZSwgbWF4RGVjaW1hbHMsIHJvdW5kaW5nRnVuY3Rpb24sIG9wdGlvbmFscykge1xuICAgICAgICB2YXIgc3BsaXRWYWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCkuc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIG1pbkRlY2ltYWxzID0gbWF4RGVjaW1hbHMgLSAob3B0aW9uYWxzIHx8IDApLFxuICAgICAgICAgICAgYm91bmRlZFByZWNpc2lvbixcbiAgICAgICAgICAgIG9wdGlvbmFsc1JlZ0V4cCxcbiAgICAgICAgICAgIHBvd2VyLFxuICAgICAgICAgICAgb3V0cHV0O1xuXG4gICAgICAgIC8vIFVzZSB0aGUgc21hbGxlc3QgcHJlY2lzaW9uIHZhbHVlIHBvc3NpYmxlIHRvIGF2b2lkIGVycm9ycyBmcm9tIGZsb2F0aW5nIHBvaW50IHJlcHJlc2VudGF0aW9uXG4gICAgICAgIGlmIChzcGxpdFZhbHVlLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIGJvdW5kZWRQcmVjaXNpb24gPSBNYXRoLm1pbihNYXRoLm1heChzcGxpdFZhbHVlWzFdLmxlbmd0aCwgbWluRGVjaW1hbHMpLCBtYXhEZWNpbWFscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYm91bmRlZFByZWNpc2lvbiA9IG1pbkRlY2ltYWxzO1xuICAgICAgICB9XG5cbiAgICAgICAgcG93ZXIgPSBNYXRoLnBvdygxMCwgYm91bmRlZFByZWNpc2lvbik7XG5cbiAgICAgICAgLy9yb3VuZGluZ0Z1bmN0aW9uID0gKHJvdW5kaW5nRnVuY3Rpb24gIT09IHVuZGVmaW5lZCA/IHJvdW5kaW5nRnVuY3Rpb24gOiBNYXRoLnJvdW5kKTtcbiAgICAgICAgLy8gTXVsdGlwbHkgdXAgYnkgcHJlY2lzaW9uLCByb3VuZCBhY2N1cmF0ZWx5LCB0aGVuIGRpdmlkZSBhbmQgdXNlIG5hdGl2ZSB0b0ZpeGVkKCk6XG4gICAgICAgIG91dHB1dCA9IChyb3VuZGluZ0Z1bmN0aW9uKHZhbHVlICogcG93ZXIpIC8gcG93ZXIpLnRvRml4ZWQoYm91bmRlZFByZWNpc2lvbik7XG5cbiAgICAgICAgaWYgKG9wdGlvbmFscyA+IG1heERlY2ltYWxzIC0gYm91bmRlZFByZWNpc2lvbikge1xuICAgICAgICAgICAgb3B0aW9uYWxzUmVnRXhwID0gbmV3IFJlZ0V4cCgnXFxcXC4/MHsxLCcgKyAob3B0aW9uYWxzIC0gKG1heERlY2ltYWxzIC0gYm91bmRlZFByZWNpc2lvbikpICsgJ30kJyk7XG4gICAgICAgICAgICBvdXRwdXQgPSBvdXRwdXQucmVwbGFjZShvcHRpb25hbHNSZWdFeHAsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBGb3JtYXR0aW5nXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgLy8gZGV0ZXJtaW5lIHdoYXQgdHlwZSBvZiBmb3JtYXR0aW5nIHdlIG5lZWQgdG8gZG9cbiAgICBmdW5jdGlvbiBmb3JtYXROdW1lcmFsKG4sIGZvcm1hdCwgcm91bmRpbmdGdW5jdGlvbikge1xuICAgICAgICB2YXIgb3V0cHV0O1xuXG4gICAgICAgIGlmIChuLl92YWx1ZSA9PT0gMCAmJiBvcHRpb25zLnplcm9Gb3JtYXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IG9wdGlvbnMuemVyb0Zvcm1hdDtcbiAgICAgICAgfSBlbHNlIGlmIChuLl92YWx1ZSA9PT0gbnVsbCAmJiBvcHRpb25zLm51bGxGb3JtYXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IG9wdGlvbnMubnVsbEZvcm1hdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGZpZ3VyZSBvdXQgd2hhdCBraW5kIG9mIGZvcm1hdCB3ZSBhcmUgZGVhbGluZyB3aXRoXG4gICAgICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoJyQnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gZm9ybWF0Q3VycmVuY3kobiwgZm9ybWF0LCByb3VuZGluZ0Z1bmN0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0LmluZGV4T2YoJyUnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gZm9ybWF0UGVyY2VudGFnZShuLCBmb3JtYXQsIHJvdW5kaW5nRnVuY3Rpb24pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQuaW5kZXhPZignOicpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBmb3JtYXRUaW1lKG4sIGZvcm1hdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdC5pbmRleE9mKCdiJykgPiAtMSB8fCBmb3JtYXQuaW5kZXhPZignaWInKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gZm9ybWF0Qnl0ZXMobiwgZm9ybWF0LCByb3VuZGluZ0Z1bmN0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0LmluZGV4T2YoJ28nKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gZm9ybWF0T3JkaW5hbChuLCBmb3JtYXQsIHJvdW5kaW5nRnVuY3Rpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBmb3JtYXROdW1iZXIobi5fdmFsdWUsIGZvcm1hdCwgcm91bmRpbmdGdW5jdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdEN1cnJlbmN5KG4sIGZvcm1hdCwgcm91bmRpbmdGdW5jdGlvbikge1xuICAgICAgICB2YXIgc3ltYm9sSW5kZXggPSBmb3JtYXQuaW5kZXhPZignJCcpLFxuICAgICAgICAgICAgb3BlblBhcmVuSW5kZXggPSBmb3JtYXQuaW5kZXhPZignKCcpLFxuICAgICAgICAgICAgbWludXNTaWduSW5kZXggPSBmb3JtYXQuaW5kZXhPZignLScpLFxuICAgICAgICAgICAgc3BhY2UgPSAnJyxcbiAgICAgICAgICAgIHNwbGljZUluZGV4LFxuICAgICAgICAgICAgb3V0cHV0O1xuXG4gICAgICAgIC8vIGNoZWNrIGZvciBzcGFjZSBiZWZvcmUgb3IgYWZ0ZXIgY3VycmVuY3lcbiAgICAgICAgaWYgKGZvcm1hdC5pbmRleE9mKCcgJCcpID4gLTEpIHtcbiAgICAgICAgICAgIHNwYWNlID0gJyAnO1xuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoJyAkJywgJycpO1xuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdC5pbmRleE9mKCckICcpID4gLTEpIHtcbiAgICAgICAgICAgIHNwYWNlID0gJyAnO1xuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoJyQgJywgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoJyQnLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3JtYXQgdGhlIG51bWJlclxuICAgICAgICBvdXRwdXQgPSBmb3JtYXROdW1iZXIobi5fdmFsdWUsIGZvcm1hdCwgcm91bmRpbmdGdW5jdGlvbiwgZmFsc2UpO1xuXG4gICAgICAgIC8vIHBvc2l0aW9uIHRoZSBzeW1ib2xcbiAgICAgICAgaWYgKHN5bWJvbEluZGV4IDw9IDEpIHtcbiAgICAgICAgICAgIGlmIChvdXRwdXQuaW5kZXhPZignKCcpID4gLTEgfHwgb3V0cHV0LmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0LnNwbGl0KCcnKTtcbiAgICAgICAgICAgICAgICBzcGxpY2VJbmRleCA9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbEluZGV4IDwgb3BlblBhcmVuSW5kZXggfHwgc3ltYm9sSW5kZXggPCBtaW51c1NpZ25JbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3ltYm9sIGFwcGVhcnMgYmVmb3JlIHRoZSBcIihcIiBvciBcIi1cIlxuICAgICAgICAgICAgICAgICAgICBzcGxpY2VJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG91dHB1dC5zcGxpY2Uoc3BsaWNlSW5kZXgsIDAsIGxhbmd1YWdlc1tvcHRpb25zLmN1cnJlbnRMYW5ndWFnZV0uY3VycmVuY3kuc3ltYm9sICsgc3BhY2UpO1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dC5qb2luKCcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gbGFuZ3VhZ2VzW29wdGlvbnMuY3VycmVudExhbmd1YWdlXS5jdXJyZW5jeS5zeW1ib2wgKyBzcGFjZSArIG91dHB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvdXRwdXQuaW5kZXhPZignKScpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBvdXRwdXQuc3BsaXQoJycpO1xuICAgICAgICAgICAgICAgIG91dHB1dC5zcGxpY2UoLTEsIDAsIHNwYWNlICsgbGFuZ3VhZ2VzW29wdGlvbnMuY3VycmVudExhbmd1YWdlXS5jdXJyZW5jeS5zeW1ib2wpO1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dC5qb2luKCcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICsgc3BhY2UgKyBsYW5ndWFnZXNbb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2VdLmN1cnJlbmN5LnN5bWJvbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0UGVyY2VudGFnZShuLCBmb3JtYXQsIHJvdW5kaW5nRnVuY3Rpb24pIHtcbiAgICAgICAgdmFyIHNwYWNlID0gJycsXG4gICAgICAgICAgICBvdXRwdXQsXG4gICAgICAgICAgICB2YWx1ZSA9IG4uX3ZhbHVlICogMTAwO1xuXG4gICAgICAgIC8vIGNoZWNrIGZvciBzcGFjZSBiZWZvcmUgJVxuICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoJyAlJykgPiAtMSkge1xuICAgICAgICAgICAgc3BhY2UgPSAnICc7XG4gICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZSgnICUnLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZSgnJScsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dCA9IGZvcm1hdE51bWJlcih2YWx1ZSwgZm9ybWF0LCByb3VuZGluZ0Z1bmN0aW9uKTtcblxuICAgICAgICBpZiAob3V0cHV0LmluZGV4T2YoJyknKSA+IC0xKSB7XG4gICAgICAgICAgICBvdXRwdXQgPSBvdXRwdXQuc3BsaXQoJycpO1xuICAgICAgICAgICAgb3V0cHV0LnNwbGljZSgtMSwgMCwgc3BhY2UgKyAnJScpO1xuICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0LmpvaW4oJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICsgc3BhY2UgKyAnJSc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdEJ5dGVzKG4sIGZvcm1hdCwgcm91bmRpbmdGdW5jdGlvbikge1xuICAgICAgICB2YXIgb3V0cHV0LFxuICAgICAgICAgICAgc3VmZml4ZXMgPSBmb3JtYXQuaW5kZXhPZignaWInKSA+IC0xID8gYnl0ZVN1ZmZpeGVzLmllYyA6IGJ5dGVTdWZmaXhlcy5ieXRlcyxcbiAgICAgICAgICAgIHZhbHVlID0gbi5fdmFsdWUsXG4gICAgICAgICAgICBzdWZmaXggPSAnJyxcbiAgICAgICAgICAgIHBvd2VyLFxuICAgICAgICAgICAgbWluLFxuICAgICAgICAgICAgbWF4O1xuXG4gICAgICAgIC8vIGNoZWNrIGZvciBzcGFjZSBiZWZvcmVcbiAgICAgICAgaWYgKGZvcm1hdC5pbmRleE9mKCcgYicpID4gLTEgfHwgZm9ybWF0LmluZGV4T2YoJyBpYicpID4gLTEpIHtcbiAgICAgICAgICAgIHN1ZmZpeCA9ICcgJztcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKCcgaWInLCAnJykucmVwbGFjZSgnIGInLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZSgnaWInLCAnJykucmVwbGFjZSgnYicsICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAocG93ZXIgPSAwOyBwb3dlciA8PSBzdWZmaXhlcy5sZW5ndGg7IHBvd2VyKyspIHtcbiAgICAgICAgICAgIG1pbiA9IE1hdGgucG93KDEwMjQsIHBvd2VyKTtcbiAgICAgICAgICAgIG1heCA9IE1hdGgucG93KDEwMjQsIHBvd2VyICsgMSk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA+PSBtaW4gJiYgdmFsdWUgPCBtYXgpIHtcbiAgICAgICAgICAgICAgICBzdWZmaXggKz0gc3VmZml4ZXNbcG93ZXJdO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1pbiA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSAvIG1pbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dCA9IGZvcm1hdE51bWJlcih2YWx1ZSwgZm9ybWF0LCByb3VuZGluZ0Z1bmN0aW9uKTtcblxuICAgICAgICByZXR1cm4gb3V0cHV0ICsgc3VmZml4O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdE9yZGluYWwobiwgZm9ybWF0LCByb3VuZGluZ0Z1bmN0aW9uKSB7XG4gICAgICAgIHZhciBvdXRwdXQsXG4gICAgICAgICAgICBvcmRpbmFsID0gJyc7XG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIHNwYWNlIGJlZm9yZVxuICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoJyBvJykgPiAtMSkge1xuICAgICAgICAgICAgb3JkaW5hbCA9ICcgJztcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKCcgbycsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKCdvJywgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3JkaW5hbCArPSBsYW5ndWFnZXNbb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2VdLm9yZGluYWwobi5fdmFsdWUpO1xuXG4gICAgICAgIG91dHB1dCA9IGZvcm1hdE51bWJlcihuLl92YWx1ZSwgZm9ybWF0LCByb3VuZGluZ0Z1bmN0aW9uKTtcblxuICAgICAgICByZXR1cm4gb3V0cHV0ICsgb3JkaW5hbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRUaW1lKG4pIHtcbiAgICAgICAgdmFyIGhvdXJzID0gTWF0aC5mbG9vcihuLl92YWx1ZSAvIDYwIC8gNjApLFxuICAgICAgICAgICAgbWludXRlcyA9IE1hdGguZmxvb3IoKG4uX3ZhbHVlIC0gKGhvdXJzICogNjAgKiA2MCkpIC8gNjApLFxuICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGgucm91bmQobi5fdmFsdWUgLSAoaG91cnMgKiA2MCAqIDYwKSAtIChtaW51dGVzICogNjApKTtcblxuICAgICAgICByZXR1cm4gaG91cnMgKyAnOicgKyAoKG1pbnV0ZXMgPCAxMCkgPyAnMCcgKyBtaW51dGVzIDogbWludXRlcykgKyAnOicgKyAoKHNlY29uZHMgPCAxMCkgPyAnMCcgKyBzZWNvbmRzIDogc2Vjb25kcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0TnVtYmVyKHZhbHVlLCBmb3JtYXQsIHJvdW5kaW5nRnVuY3Rpb24pIHtcbiAgICAgICAgdmFyIG5lZ1AgPSBmYWxzZSxcbiAgICAgICAgICAgIHNpZ25lZCA9IGZhbHNlLFxuICAgICAgICAgICAgb3B0RGVjID0gZmFsc2UsXG4gICAgICAgICAgICBhYmJyID0gJycsXG4gICAgICAgICAgICBhYmJySyA9IGZhbHNlLCAvLyBmb3JjZSBhYmJyZXZpYXRpb24gdG8gdGhvdXNhbmRzXG4gICAgICAgICAgICBhYmJyTSA9IGZhbHNlLCAvLyBmb3JjZSBhYmJyZXZpYXRpb24gdG8gbWlsbGlvbnNcbiAgICAgICAgICAgIGFiYnJCID0gZmFsc2UsIC8vIGZvcmNlIGFiYnJldmlhdGlvbiB0byBiaWxsaW9uc1xuICAgICAgICAgICAgYWJiclQgPSBmYWxzZSwgLy8gZm9yY2UgYWJicmV2aWF0aW9uIHRvIHRyaWxsaW9uc1xuICAgICAgICAgICAgYWJickZvcmNlID0gZmFsc2UsIC8vIGZvcmNlIGFiYnJldmlhdGlvblxuICAgICAgICAgICAgYWJzLFxuICAgICAgICAgICAgbWluLFxuICAgICAgICAgICAgbWF4LFxuICAgICAgICAgICAgcG93ZXIsXG4gICAgICAgICAgICB3LFxuICAgICAgICAgICAgcHJlY2lzaW9uLFxuICAgICAgICAgICAgdGhvdXNhbmRzLFxuICAgICAgICAgICAgZCA9ICcnLFxuICAgICAgICAgICAgbmVnID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBhYnMgPSBNYXRoLmFicyh2YWx1ZSk7XG5cbiAgICAgICAgLy8gc2VlIGlmIHdlIHNob3VsZCB1c2UgcGFyZW50aGVzZXMgZm9yIG5lZ2F0aXZlIG51bWJlciBvciBpZiB3ZSBzaG91bGQgcHJlZml4IHdpdGggYSBzaWduXG4gICAgICAgIC8vIGlmIGJvdGggYXJlIHByZXNlbnQgd2UgZGVmYXVsdCB0byBwYXJlbnRoZXNlc1xuICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoJygnKSA+IC0xKSB7XG4gICAgICAgICAgICBuZWdQID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5zbGljZSgxLCAtMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0LmluZGV4T2YoJysnKSA+IC0xKSB7XG4gICAgICAgICAgICBzaWduZWQgPSB0cnVlO1xuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoL1xcKy9nLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZWUgaWYgYWJicmV2aWF0aW9uIGlzIHdhbnRlZFxuICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoJ2EnKSA+IC0xKSB7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiBhYmJyZXZpYXRpb24gaXMgc3BlY2lmaWVkXG4gICAgICAgICAgICBhYmJySyA9IGZvcm1hdC5pbmRleE9mKCdhSycpID49IDA7XG4gICAgICAgICAgICBhYmJyTSA9IGZvcm1hdC5pbmRleE9mKCdhTScpID49IDA7XG4gICAgICAgICAgICBhYmJyQiA9IGZvcm1hdC5pbmRleE9mKCdhQicpID49IDA7XG4gICAgICAgICAgICBhYmJyVCA9IGZvcm1hdC5pbmRleE9mKCdhVCcpID49IDA7XG4gICAgICAgICAgICBhYmJyRm9yY2UgPSBhYmJySyB8fCBhYmJyTSB8fCBhYmJyQiB8fCBhYmJyVDtcblxuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIHNwYWNlIGJlZm9yZSBhYmJyZXZpYXRpb25cbiAgICAgICAgICAgIGlmIChmb3JtYXQuaW5kZXhPZignIGEnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgYWJiciA9ICcgJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UobmV3IFJlZ0V4cChhYmJyICsgJ2FbS01CVF0/JyksICcnKTtcblxuICAgICAgICAgICAgaWYgKGFicyA+PSBNYXRoLnBvdygxMCwgMTIpICYmICFhYmJyRm9yY2UgfHwgYWJiclQpIHtcbiAgICAgICAgICAgICAgICAvLyB0cmlsbGlvblxuICAgICAgICAgICAgICAgIGFiYnIgPSBhYmJyICsgbGFuZ3VhZ2VzW29wdGlvbnMuY3VycmVudExhbmd1YWdlXS5hYmJyZXZpYXRpb25zLnRyaWxsaW9uO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgLyBNYXRoLnBvdygxMCwgMTIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhYnMgPCBNYXRoLnBvdygxMCwgMTIpICYmIGFicyA+PSBNYXRoLnBvdygxMCwgOSkgJiYgIWFiYnJGb3JjZSB8fCBhYmJyQikge1xuICAgICAgICAgICAgICAgIC8vIGJpbGxpb25cbiAgICAgICAgICAgICAgICBhYmJyID0gYWJiciArIGxhbmd1YWdlc1tvcHRpb25zLmN1cnJlbnRMYW5ndWFnZV0uYWJicmV2aWF0aW9ucy5iaWxsaW9uO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgLyBNYXRoLnBvdygxMCwgOSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFicyA8IE1hdGgucG93KDEwLCA5KSAmJiBhYnMgPj0gTWF0aC5wb3coMTAsIDYpICYmICFhYmJyRm9yY2UgfHwgYWJick0pIHtcbiAgICAgICAgICAgICAgICAvLyBtaWxsaW9uXG4gICAgICAgICAgICAgICAgYWJiciA9IGFiYnIgKyBsYW5ndWFnZXNbb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2VdLmFiYnJldmlhdGlvbnMubWlsbGlvbjtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlIC8gTWF0aC5wb3coMTAsIDYpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhYnMgPCBNYXRoLnBvdygxMCwgNikgJiYgYWJzID49IE1hdGgucG93KDEwLCAzKSAmJiAhYWJickZvcmNlIHx8IGFiYnJLKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhvdXNhbmRcbiAgICAgICAgICAgICAgICBhYmJyID0gYWJiciArIGxhbmd1YWdlc1tvcHRpb25zLmN1cnJlbnRMYW5ndWFnZV0uYWJicmV2aWF0aW9ucy50aG91c2FuZDtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlIC8gTWF0aC5wb3coMTAsIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoJ1suXScpID4gLTEpIHtcbiAgICAgICAgICAgIG9wdERlYyA9IHRydWU7XG4gICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZSgnWy5dJywgJy4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHcgPSB2YWx1ZS50b1N0cmluZygpLnNwbGl0KCcuJylbMF07XG4gICAgICAgIHByZWNpc2lvbiA9IGZvcm1hdC5zcGxpdCgnLicpWzFdO1xuICAgICAgICB0aG91c2FuZHMgPSBmb3JtYXQuaW5kZXhPZignLCcpO1xuXG4gICAgICAgIGlmIChwcmVjaXNpb24pIHtcbiAgICAgICAgICAgIGlmIChwcmVjaXNpb24uaW5kZXhPZignWycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBwcmVjaXNpb24gPSBwcmVjaXNpb24ucmVwbGFjZSgnXScsICcnKTtcbiAgICAgICAgICAgICAgICBwcmVjaXNpb24gPSBwcmVjaXNpb24uc3BsaXQoJ1snKTtcbiAgICAgICAgICAgICAgICBkID0gdG9GaXhlZCh2YWx1ZSwgKHByZWNpc2lvblswXS5sZW5ndGggKyBwcmVjaXNpb25bMV0ubGVuZ3RoKSwgcm91bmRpbmdGdW5jdGlvbiwgcHJlY2lzaW9uWzFdLmxlbmd0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGQgPSB0b0ZpeGVkKHZhbHVlLCBwcmVjaXNpb24ubGVuZ3RoLCByb3VuZGluZ0Z1bmN0aW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdyA9IGQuc3BsaXQoJy4nKVswXTtcblxuICAgICAgICAgICAgaWYgKGQuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBkID0gbGFuZ3VhZ2VzW29wdGlvbnMuY3VycmVudExhbmd1YWdlXS5kZWxpbWl0ZXJzLmRlY2ltYWwgKyBkLnNwbGl0KCcuJylbMV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGQgPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wdERlYyAmJiBOdW1iZXIoZC5zbGljZSgxKSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBkID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3ID0gdG9GaXhlZCh2YWx1ZSwgbnVsbCwgcm91bmRpbmdGdW5jdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3JtYXQgbnVtYmVyXG4gICAgICAgIGlmICh3LmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICAgICAgICB3ID0gdy5zbGljZSgxKTtcbiAgICAgICAgICAgIG5lZyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhvdXNhbmRzID4gLTEpIHtcbiAgICAgICAgICAgIHcgPSB3LnRvU3RyaW5nKCkucmVwbGFjZSgvKFxcZCkoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnJDEnICsgbGFuZ3VhZ2VzW29wdGlvbnMuY3VycmVudExhbmd1YWdlXS5kZWxpbWl0ZXJzLnRob3VzYW5kcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZm9ybWF0LmluZGV4T2YoJy4nKSA9PT0gMCkge1xuICAgICAgICAgICAgdyA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgobmVnUCAmJiBuZWcpID8gJygnIDogJycpICsgKCghbmVnUCAmJiBuZWcpID8gJy0nIDogJycpICsgKCghbmVnICYmIHNpZ25lZCkgPyAnKycgOiAnJykgKyB3ICsgZCArICgoYWJicikgPyBhYmJyIDogJycpICsgKChuZWdQICYmIG5lZykgPyAnKScgOiAnJyk7XG4gICAgfVxuXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIFVuZm9ybWF0dGluZ1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIC8vIHJldmVydCB0byBudW1iZXJcbiAgICBmdW5jdGlvbiB1bmZvcm1hdE51bWVyYWwobiwgc3RyaW5nKSB7XG4gICAgICAgIHZhciBzdHJpbmdPcmlnaW5hbCA9IHN0cmluZyxcbiAgICAgICAgICAgIHRob3VzYW5kUmVnRXhwLFxuICAgICAgICAgICAgbWlsbGlvblJlZ0V4cCxcbiAgICAgICAgICAgIGJpbGxpb25SZWdFeHAsXG4gICAgICAgICAgICB0cmlsbGlvblJlZ0V4cCxcbiAgICAgICAgICAgIGJ5dGVzTXVsdGlwbGllciA9IGZhbHNlLFxuICAgICAgICAgICAgcG93ZXIsXG4gICAgICAgICAgICB2YWx1ZTtcblxuICAgICAgICBpZiAoc3RyaW5nLmluZGV4T2YoJzonKSA+IC0xKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVuZm9ybWF0VGltZShzdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHN0cmluZyA9PT0gb3B0aW9ucy56ZXJvRm9ybWF0IHx8IHN0cmluZyA9PT0gb3B0aW9ucy5udWxsRm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobGFuZ3VhZ2VzW29wdGlvbnMuY3VycmVudExhbmd1YWdlXS5kZWxpbWl0ZXJzLmRlY2ltYWwgIT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFwuL2csICcnKS5yZXBsYWNlKGxhbmd1YWdlc1tvcHRpb25zLmN1cnJlbnRMYW5ndWFnZV0uZGVsaW1pdGVycy5kZWNpbWFsLCAnLicpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHNlZSBpZiBhYmJyZXZpYXRpb25zIGFyZSB0aGVyZSBzbyB0aGF0IHdlIGNhbiBtdWx0aXBseSB0byB0aGUgY29ycmVjdCBudW1iZXJcbiAgICAgICAgICAgICAgICB0aG91c2FuZFJlZ0V4cCA9IG5ldyBSZWdFeHAoJ1teYS16QS1aXScgKyBsYW5ndWFnZXNbb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2VdLmFiYnJldmlhdGlvbnMudGhvdXNhbmQgKyAnKD86XFxcXCl8KFxcXFwnICsgbGFuZ3VhZ2VzW29wdGlvbnMuY3VycmVudExhbmd1YWdlXS5jdXJyZW5jeS5zeW1ib2wgKyAnKT8oPzpcXFxcKSk/KT8kJyk7XG4gICAgICAgICAgICAgICAgbWlsbGlvblJlZ0V4cCA9IG5ldyBSZWdFeHAoJ1teYS16QS1aXScgKyBsYW5ndWFnZXNbb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2VdLmFiYnJldmlhdGlvbnMubWlsbGlvbiArICcoPzpcXFxcKXwoXFxcXCcgKyBsYW5ndWFnZXNbb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2VdLmN1cnJlbmN5LnN5bWJvbCArICcpPyg/OlxcXFwpKT8pPyQnKTtcbiAgICAgICAgICAgICAgICBiaWxsaW9uUmVnRXhwID0gbmV3IFJlZ0V4cCgnW15hLXpBLVpdJyArIGxhbmd1YWdlc1tvcHRpb25zLmN1cnJlbnRMYW5ndWFnZV0uYWJicmV2aWF0aW9ucy5iaWxsaW9uICsgJyg/OlxcXFwpfChcXFxcJyArIGxhbmd1YWdlc1tvcHRpb25zLmN1cnJlbnRMYW5ndWFnZV0uY3VycmVuY3kuc3ltYm9sICsgJyk/KD86XFxcXCkpPyk/JCcpO1xuICAgICAgICAgICAgICAgIHRyaWxsaW9uUmVnRXhwID0gbmV3IFJlZ0V4cCgnW15hLXpBLVpdJyArIGxhbmd1YWdlc1tvcHRpb25zLmN1cnJlbnRMYW5ndWFnZV0uYWJicmV2aWF0aW9ucy50cmlsbGlvbiArICcoPzpcXFxcKXwoXFxcXCcgKyBsYW5ndWFnZXNbb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2VdLmN1cnJlbmN5LnN5bWJvbCArICcpPyg/OlxcXFwpKT8pPyQnKTtcblxuICAgICAgICAgICAgICAgIC8vIHNlZSBpZiBieXRlcyBhcmUgdGhlcmUgc28gdGhhdCB3ZSBjYW4gbXVsdGlwbHkgdG8gdGhlIGNvcnJlY3QgbnVtYmVyXG4gICAgICAgICAgICAgICAgZm9yIChwb3dlciA9IDE7IHBvd2VyIDw9IGJ5dGVTdWZmaXhlcy5ieXRlcy5sZW5ndGg7IHBvd2VyKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXNNdWx0aXBsaWVyID0gKChzdHJpbmcuaW5kZXhPZihieXRlU3VmZml4ZXMuYnl0ZXNbcG93ZXJdKSA+IC0xKSB8fCAoc3RyaW5nLmluZGV4T2YoYnl0ZVN1ZmZpeGVzLmllY1twb3dlcl0pID4gLTEpKT8gTWF0aC5wb3coMTAyNCwgcG93ZXIpIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ5dGVzTXVsdGlwbGllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBkbyBzb21lIG1hdGggdG8gY3JlYXRlIG91ciBudW1iZXJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJ5dGVzTXVsdGlwbGllciA/IGJ5dGVzTXVsdGlwbGllciA6IDE7XG4gICAgICAgICAgICAgICAgdmFsdWUgKj0gc3RyaW5nT3JpZ2luYWwubWF0Y2godGhvdXNhbmRSZWdFeHApID8gTWF0aC5wb3coMTAsIDMpIDogMTtcbiAgICAgICAgICAgICAgICB2YWx1ZSAqPSBzdHJpbmdPcmlnaW5hbC5tYXRjaChtaWxsaW9uUmVnRXhwKSA/IE1hdGgucG93KDEwLCA2KSA6IDE7XG4gICAgICAgICAgICAgICAgdmFsdWUgKj0gc3RyaW5nT3JpZ2luYWwubWF0Y2goYmlsbGlvblJlZ0V4cCkgPyBNYXRoLnBvdygxMCwgOSkgOiAxO1xuICAgICAgICAgICAgICAgIHZhbHVlICo9IHN0cmluZ09yaWdpbmFsLm1hdGNoKHRyaWxsaW9uUmVnRXhwKSA/IE1hdGgucG93KDEwLCAxMikgOiAxO1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciBwZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgdmFsdWUgKj0gc3RyaW5nLmluZGV4T2YoJyUnKSA+IC0xID8gMC4wMSA6IDE7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIG5lZ2F0aXZlIG51bWJlclxuICAgICAgICAgICAgICAgIHZhbHVlICo9IChzdHJpbmcuc3BsaXQoJy0nKS5sZW5ndGggKyBNYXRoLm1pbihzdHJpbmcuc3BsaXQoJygnKS5sZW5ndGggLSAxLCBzdHJpbmcuc3BsaXQoJyknKS5sZW5ndGggLSAxKSkgJSAyID8gMSA6IC0xO1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBub24gbnVtYmVyc1xuICAgICAgICAgICAgICAgIHZhbHVlICo9IE51bWJlcihzdHJpbmcucmVwbGFjZSgvW14wLTlcXC5dKy9nLCAnJykpO1xuICAgICAgICAgICAgICAgIC8vIHJvdW5kIGlmIHdlIGFyZSB0YWxraW5nIGFib3V0IGJ5dGVzXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBieXRlc011bHRpcGxpZXIgPyBNYXRoLmNlaWwodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBuLl92YWx1ZSA9IHZhbHVlO1xuXG4gICAgICAgIHJldHVybiBuLl92YWx1ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdW5mb3JtYXRUaW1lKHN0cmluZykge1xuICAgICAgICB2YXIgdGltZUFycmF5ID0gc3RyaW5nLnNwbGl0KCc6JyksXG4gICAgICAgICAgICBzZWNvbmRzID0gMDtcbiAgICAgICAgLy8gdHVybiBob3VycyBhbmQgbWludXRlcyBpbnRvIHNlY29uZHMgYW5kIGFkZCB0aGVtIGFsbCB1cFxuICAgICAgICBpZiAodGltZUFycmF5Lmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgLy8gaG91cnNcbiAgICAgICAgICAgIHNlY29uZHMgPSBzZWNvbmRzICsgKE51bWJlcih0aW1lQXJyYXlbMF0pICogNjAgKiA2MCk7XG4gICAgICAgICAgICAvLyBtaW51dGVzXG4gICAgICAgICAgICBzZWNvbmRzID0gc2Vjb25kcyArIChOdW1iZXIodGltZUFycmF5WzFdKSAqIDYwKTtcbiAgICAgICAgICAgIC8vIHNlY29uZHNcbiAgICAgICAgICAgIHNlY29uZHMgPSBzZWNvbmRzICsgTnVtYmVyKHRpbWVBcnJheVsyXSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGltZUFycmF5Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgLy8gbWludXRlc1xuICAgICAgICAgICAgc2Vjb25kcyA9IHNlY29uZHMgKyAoTnVtYmVyKHRpbWVBcnJheVswXSkgKiA2MCk7XG4gICAgICAgICAgICAvLyBzZWNvbmRzXG4gICAgICAgICAgICBzZWNvbmRzID0gc2Vjb25kcyArIE51bWJlcih0aW1lQXJyYXlbMV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBOdW1iZXIoc2Vjb25kcyk7XG4gICAgfVxuXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIFRvcCBMZXZlbCBGdW5jdGlvbnNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICBudW1lcmFsID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaWYgKG51bWVyYWwuaXNOdW1lcmFsKGlucHV0KSkge1xuICAgICAgICAgICAgaW5wdXQgPSBpbnB1dC52YWx1ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGlucHV0ID09PSAwIHx8IHR5cGVvZiBpbnB1dCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGlucHV0ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgaW5wdXQgPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKCFOdW1iZXIoaW5wdXQpKSB7XG4gICAgICAgICAgICBpbnB1dCA9IG51bWVyYWwuZm4udW5mb3JtYXQoaW5wdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5wdXQgPSBOdW1iZXIoaW5wdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmFsKGlucHV0KTtcbiAgICB9O1xuXG4gICAgLy8gdmVyc2lvbiBudW1iZXJcbiAgICBudW1lcmFsLnZlcnNpb24gPSBWRVJTSU9OO1xuXG4gICAgLy8gY29tcGFyZSBudW1lcmFsIG9iamVjdFxuICAgIG51bWVyYWwuaXNOdW1lcmFsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBOdW1lcmFsO1xuICAgIH07XG5cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBsb2FkIGxhbmd1YWdlcyBhbmQgdGhlbiBzZXQgdGhlIGdsb2JhbCBsYW5ndWFnZS4gIElmXG4gICAgLy8gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWQgaW4sIGl0IHdpbGwgc2ltcGx5IHJldHVybiB0aGUgY3VycmVudCBnbG9iYWxcbiAgICAvLyBsYW5ndWFnZSBrZXkuXG4gICAgbnVtZXJhbC5sYW5ndWFnZSA9IGZ1bmN0aW9uKGtleSwgdmFsdWVzKSB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2U7XG4gICAgICAgIH1cblxuICAgICAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBpZiAoa2V5ICYmICF2YWx1ZXMpIHtcbiAgICAgICAgICAgIGlmICghbGFuZ3VhZ2VzW2tleV0pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbGFuZ3VhZ2UgOiAnICsga2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0aW9ucy5jdXJyZW50TGFuZ3VhZ2UgPSBrZXk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWVzIHx8ICFsYW5ndWFnZXNba2V5XSkge1xuICAgICAgICAgICAgbG9hZExhbmd1YWdlKGtleSwgdmFsdWVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudW1lcmFsO1xuICAgIH07XG5cbiAgICBudW1lcmFsLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIGRlZmF1bHRzKSB7XG4gICAgICAgICAgICBvcHRpb25zW3Byb3BlcnR5XSA9IGRlZmF1bHRzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHByb3ZpZGVzIGFjY2VzcyB0byB0aGUgbG9hZGVkIGxhbmd1YWdlIGRhdGEuICBJZlxuICAgIC8vIG5vIGFyZ3VtZW50cyBhcmUgcGFzc2VkIGluLCBpdCB3aWxsIHNpbXBseSByZXR1cm4gdGhlIGN1cnJlbnRcbiAgICAvLyBnbG9iYWwgbGFuZ3VhZ2Ugb2JqZWN0LlxuICAgIG51bWVyYWwubGFuZ3VhZ2VEYXRhID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGFuZ3VhZ2VzW29wdGlvbnMuY3VycmVudExhbmd1YWdlXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbGFuZ3VhZ2VzW2tleV0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBsYW5ndWFnZSA6ICcgKyBrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhbmd1YWdlc1trZXldO1xuICAgIH07XG5cbiAgICBudW1lcmFsLmxhbmd1YWdlKCdlbicsIHtcbiAgICAgICAgZGVsaW1pdGVyczoge1xuICAgICAgICAgICAgdGhvdXNhbmRzOiAnLCcsXG4gICAgICAgICAgICBkZWNpbWFsOiAnLidcbiAgICAgICAgfSxcbiAgICAgICAgYWJicmV2aWF0aW9uczoge1xuICAgICAgICAgICAgdGhvdXNhbmQ6ICdrJyxcbiAgICAgICAgICAgIG1pbGxpb246ICdtJyxcbiAgICAgICAgICAgIGJpbGxpb246ICdiJyxcbiAgICAgICAgICAgIHRyaWxsaW9uOiAndCdcbiAgICAgICAgfSxcbiAgICAgICAgb3JkaW5hbDogZnVuY3Rpb24obnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgYiA9IG51bWJlciAlIDEwO1xuICAgICAgICAgICAgcmV0dXJuICh+fihudW1iZXIgJSAxMDAgLyAxMCkgPT09IDEpID8gJ3RoJyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDEpID8gJ3N0JyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDIpID8gJ25kJyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDMpID8gJ3JkJyA6ICd0aCc7XG4gICAgICAgIH0sXG4gICAgICAgIGN1cnJlbmN5OiB7XG4gICAgICAgICAgICBzeW1ib2w6ICckJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBudW1lcmFsLnplcm9Gb3JtYXQgPSBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgb3B0aW9ucy56ZXJvRm9ybWF0ID0gdHlwZW9mKGZvcm1hdCkgPT09ICdzdHJpbmcnID8gZm9ybWF0IDogbnVsbDtcbiAgICB9O1xuXG4gICAgbnVtZXJhbC5udWxsRm9ybWF0ID0gZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICBvcHRpb25zLm51bGxGb3JtYXQgPSB0eXBlb2YoZm9ybWF0KSA9PT0gJ3N0cmluZycgPyBmb3JtYXQgOiBudWxsO1xuICAgIH07XG5cbiAgICBudW1lcmFsLmRlZmF1bHRGb3JtYXQgPSBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgb3B0aW9ucy5kZWZhdWx0Rm9ybWF0ID0gdHlwZW9mKGZvcm1hdCkgPT09ICdzdHJpbmcnID8gZm9ybWF0IDogJzAuMCc7XG4gICAgfTtcblxuICAgIG51bWVyYWwudmFsaWRhdGUgPSBmdW5jdGlvbih2YWwsIGN1bHR1cmUpIHtcbiAgICAgICAgdmFyIF9kZWNpbWFsU2VwLFxuICAgICAgICAgICAgX3Rob3VzYW5kU2VwLFxuICAgICAgICAgICAgX2N1cnJTeW1ib2wsXG4gICAgICAgICAgICBfdmFsQXJyYXksXG4gICAgICAgICAgICBfYWJick9iaixcbiAgICAgICAgICAgIF90aG91c2FuZFJlZ0V4LFxuICAgICAgICAgICAgbGFuZ3VhZ2VEYXRhLFxuICAgICAgICAgICAgdGVtcDtcblxuICAgICAgICAvL2NvZXJjZSB2YWwgdG8gc3RyaW5nXG4gICAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFsICs9ICcnO1xuICAgICAgICAgICAgaWYgKGNvbnNvbGUud2Fybikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTnVtZXJhbC5qczogVmFsdWUgaXMgbm90IHN0cmluZy4gSXQgaGFzIGJlZW4gY28tZXJjZWQgdG86ICcsIHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL3RyaW0gd2hpdGVzcGFjZXMgZnJvbSBlaXRoZXIgc2lkZXNcbiAgICAgICAgdmFsID0gdmFsLnRyaW0oKTtcblxuICAgICAgICAvL2lmIHZhbCBpcyBqdXN0IGRpZ2l0cyByZXR1cm4gdHJ1ZVxuICAgICAgICBpZiAoICEhIHZhbC5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZiB2YWwgaXMgZW1wdHkgcmV0dXJuIGZhbHNlXG4gICAgICAgIGlmICh2YWwgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvL2dldCB0aGUgZGVjaW1hbCBhbmQgdGhvdXNhbmRzIHNlcGFyYXRvciBmcm9tIG51bWVyYWwubGFuZ3VhZ2VEYXRhXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvL2NoZWNrIGlmIHRoZSBjdWx0dXJlIGlzIHVuZGVyc3Rvb2QgYnkgbnVtZXJhbC4gaWYgbm90LCBkZWZhdWx0IGl0IHRvIGN1cnJlbnQgbGFuZ3VhZ2VcbiAgICAgICAgICAgIGxhbmd1YWdlRGF0YSA9IG51bWVyYWwubGFuZ3VhZ2VEYXRhKGN1bHR1cmUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsYW5ndWFnZURhdGEgPSBudW1lcmFsLmxhbmd1YWdlRGF0YShudW1lcmFsLmxhbmd1YWdlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9zZXR1cCB0aGUgZGVsaW1pdGVycyBhbmQgY3VycmVuY3kgc3ltYm9sIGJhc2VkIG9uIGN1bHR1cmUvbGFuZ3VhZ2VcbiAgICAgICAgX2N1cnJTeW1ib2wgPSBsYW5ndWFnZURhdGEuY3VycmVuY3kuc3ltYm9sO1xuICAgICAgICBfYWJick9iaiA9IGxhbmd1YWdlRGF0YS5hYmJyZXZpYXRpb25zO1xuICAgICAgICBfZGVjaW1hbFNlcCA9IGxhbmd1YWdlRGF0YS5kZWxpbWl0ZXJzLmRlY2ltYWw7XG4gICAgICAgIGlmIChsYW5ndWFnZURhdGEuZGVsaW1pdGVycy50aG91c2FuZHMgPT09ICcuJykge1xuICAgICAgICAgICAgX3Rob3VzYW5kU2VwID0gJ1xcXFwuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aG91c2FuZFNlcCA9IGxhbmd1YWdlRGF0YS5kZWxpbWl0ZXJzLnRob3VzYW5kcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkYXRpbmcgY3VycmVuY3kgc3ltYm9sXG4gICAgICAgIHRlbXAgPSB2YWwubWF0Y2goL15bXlxcZF0rLyk7XG4gICAgICAgIGlmICh0ZW1wICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2YWwgPSB2YWwuc3Vic3RyKDEpO1xuICAgICAgICAgICAgaWYgKHRlbXBbMF0gIT09IF9jdXJyU3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy92YWxpZGF0aW5nIGFiYnJldmlhdGlvbiBzeW1ib2xcbiAgICAgICAgdGVtcCA9IHZhbC5tYXRjaCgvW15cXGRdKyQvKTtcbiAgICAgICAgaWYgKHRlbXAgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHZhbCA9IHZhbC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICBpZiAodGVtcFswXSAhPT0gX2FiYnJPYmoudGhvdXNhbmQgJiYgdGVtcFswXSAhPT0gX2FiYnJPYmoubWlsbGlvbiAmJiB0ZW1wWzBdICE9PSBfYWJick9iai5iaWxsaW9uICYmIHRlbXBbMF0gIT09IF9hYmJyT2JqLnRyaWxsaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgX3Rob3VzYW5kUmVnRXggPSBuZXcgUmVnRXhwKF90aG91c2FuZFNlcCArICd7Mn0nKTtcblxuICAgICAgICBpZiAoIXZhbC5tYXRjaCgvW15cXGQuLF0vZykpIHtcbiAgICAgICAgICAgIF92YWxBcnJheSA9IHZhbC5zcGxpdChfZGVjaW1hbFNlcCk7XG4gICAgICAgICAgICBpZiAoX3ZhbEFycmF5Lmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChfdmFsQXJyYXkubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCAhISBfdmFsQXJyYXlbMF0ubWF0Y2goL15cXGQrLipcXGQkLykgJiYgIV92YWxBcnJheVswXS5tYXRjaChfdGhvdXNhbmRSZWdFeCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfdmFsQXJyYXlbMF0ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCAhISBfdmFsQXJyYXlbMF0ubWF0Y2goL15cXGQrJC8pICYmICFfdmFsQXJyYXlbMF0ubWF0Y2goX3Rob3VzYW5kUmVnRXgpICYmICEhIF92YWxBcnJheVsxXS5tYXRjaCgvXlxcZCskLykpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICggISEgX3ZhbEFycmF5WzBdLm1hdGNoKC9eXFxkKy4qXFxkJC8pICYmICFfdmFsQXJyYXlbMF0ubWF0Y2goX3Rob3VzYW5kUmVnRXgpICYmICEhIF92YWxBcnJheVsxXS5tYXRjaCgvXlxcZCskLykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIEhlbHBlcnNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICBmdW5jdGlvbiBsb2FkTGFuZ3VhZ2Uoa2V5LCB2YWx1ZXMpIHtcbiAgICAgICAgbGFuZ3VhZ2VzW2tleV0gPSB2YWx1ZXM7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBGbG9hdGluZy1wb2ludCBoZWxwZXJzXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgLy8gVGhlIGZsb2F0aW5nLXBvaW50IGhlbHBlciBmdW5jdGlvbnMgYW5kIGltcGxlbWVudGF0aW9uXG4gICAgLy8gYm9ycm93cyBoZWF2aWx5IGZyb20gc2luZnVsLmpzOiBodHRwOi8vZ3VpcG4uZ2l0aHViLmlvL3NpbmZ1bC5qcy9cblxuICAgIC8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNSwgMTUuNC40LjIxXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjQuNC4yMVxuICAgIGlmICghQXJyYXkucHJvdG90eXBlLnJlZHVjZSkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24oY2FsbGJhY2sgLyosIGluaXRpYWxWYWx1ZSovKSB7XG4gICAgICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgICAgICBpZiAodGhpcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5LnByb3RvdHlwZS5yZWR1Y2UgY2FsbGVkIG9uIG51bGwgb3IgdW5kZWZpbmVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGNhbGxiYWNrICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdCA9IE9iamVjdCh0aGlzKSwgbGVuID0gdC5sZW5ndGggPj4+IDAsIGsgPSAwLCB2YWx1ZTtcblxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGsgPCBsZW4gJiYgIShrIGluIHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGsrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoayA+PSBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhbHVlID0gdFtrKytdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgICAgICAgIGlmIChrIGluIHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjYWxsYmFjayh2YWx1ZSwgdFtrXSwgaywgdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXB1dGVzIHRoZSBtdWx0aXBsaWVyIG5lY2Vzc2FyeSB0byBtYWtlIHggPj0gMSxcbiAgICAgKiBlZmZlY3RpdmVseSBlbGltaW5hdGluZyBtaXNjYWxjdWxhdGlvbnMgY2F1c2VkIGJ5XG4gICAgICogZmluaXRlIHByZWNpc2lvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtdWx0aXBsaWVyKHgpIHtcbiAgICAgICAgdmFyIHBhcnRzID0geC50b1N0cmluZygpLnNwbGl0KCcuJyk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5wb3coMTAsIHBhcnRzWzFdLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSB2YXJpYWJsZSBudW1iZXIgb2YgYXJndW1lbnRzLCByZXR1cm5zIHRoZSBtYXhpbXVtXG4gICAgICogbXVsdGlwbGllciB0aGF0IG11c3QgYmUgdXNlZCB0byBub3JtYWxpemUgYW4gb3BlcmF0aW9uIGludm9sdmluZ1xuICAgICAqIGFsbCBvZiB0aGVtLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvcnJlY3Rpb25GYWN0b3IoKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIGFyZ3MucmVkdWNlKGZ1bmN0aW9uKHByZXYsIG5leHQpIHtcbiAgICAgICAgICAgIHZhciBtcCA9IG11bHRpcGxpZXIocHJldiksXG4gICAgICAgICAgICAgICAgbW4gPSBtdWx0aXBsaWVyKG5leHQpO1xuICAgICAgICAgICAgcmV0dXJuIG1wID4gbW4gPyBtcCA6IG1uO1xuICAgICAgICB9LCAtSW5maW5pdHkpO1xuICAgIH1cblxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBOdW1lcmFsIFByb3RvdHlwZVxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgbnVtZXJhbC5mbiA9IE51bWVyYWwucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGNsb25lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBudW1lcmFsKHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvcm1hdDogZnVuY3Rpb24gKGlucHV0U3RyaW5nLCByb3VuZGluZ0Z1bmN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0TnVtZXJhbCh0aGlzLFxuICAgICAgICAgICAgICAgIGlucHV0U3RyaW5nID8gaW5wdXRTdHJpbmcgOiBvcHRpb25zLmRlZmF1bHRGb3JtYXQsXG4gICAgICAgICAgICAgICAgcm91bmRpbmdGdW5jdGlvbiAhPT0gdW5kZWZpbmVkID8gcm91bmRpbmdGdW5jdGlvbiA6IE1hdGgucm91bmRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5mb3JtYXQ6IGZ1bmN0aW9uIChpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpbnB1dFN0cmluZykgPT09ICdbb2JqZWN0IE51bWJlcl0nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlucHV0U3RyaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdW5mb3JtYXROdW1lcmFsKHRoaXMsIGlucHV0U3RyaW5nID8gaW5wdXRTdHJpbmcgOiBvcHRpb25zLmRlZmF1bHRGb3JtYXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICB2YWx1ZU9mOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgY29yckZhY3RvciA9IGNvcnJlY3Rpb25GYWN0b3IuY2FsbChudWxsLCB0aGlzLl92YWx1ZSwgdmFsdWUpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjYmFjayhhY2N1bSwgY3VyciwgY3VyckksIE8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjdW0gKyBjb3JyRmFjdG9yICogY3VycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gW3RoaXMuX3ZhbHVlLCB2YWx1ZV0ucmVkdWNlKGNiYWNrLCAwKSAvIGNvcnJGYWN0b3I7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBzdWJ0cmFjdDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBjb3JyRmFjdG9yID0gY29ycmVjdGlvbkZhY3Rvci5jYWxsKG51bGwsIHRoaXMuX3ZhbHVlLCB2YWx1ZSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNiYWNrKGFjY3VtLCBjdXJyLCBjdXJySSwgTykge1xuICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bSAtIGNvcnJGYWN0b3IgKiBjdXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSBbdmFsdWVdLnJlZHVjZShjYmFjaywgdGhpcy5fdmFsdWUgKiBjb3JyRmFjdG9yKSAvIGNvcnJGYWN0b3I7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBtdWx0aXBseTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNiYWNrKGFjY3VtLCBjdXJyLCBjdXJySSwgTykge1xuICAgICAgICAgICAgICAgIHZhciBjb3JyRmFjdG9yID0gY29ycmVjdGlvbkZhY3RvcihhY2N1bSwgY3Vycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChhY2N1bSAqIGNvcnJGYWN0b3IpICogKGN1cnIgKiBjb3JyRmFjdG9yKSAvXG4gICAgICAgICAgICAgICAgICAgIChjb3JyRmFjdG9yICogY29yckZhY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IFt0aGlzLl92YWx1ZSwgdmFsdWVdLnJlZHVjZShjYmFjaywgMSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBkaXZpZGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBjYmFjayhhY2N1bSwgY3VyciwgY3VyckksIE8pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29yckZhY3RvciA9IGNvcnJlY3Rpb25GYWN0b3IoYWNjdW0sIGN1cnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAoYWNjdW0gKiBjb3JyRmFjdG9yKSAvIChjdXJyICogY29yckZhY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IFt0aGlzLl92YWx1ZSwgdmFsdWVdLnJlZHVjZShjYmFjayk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBkaWZmZXJlbmNlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKG51bWVyYWwodGhpcy5fdmFsdWUpLnN1YnRyYWN0KHZhbHVlKS52YWx1ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgRXhwb3NpbmcgTnVtZXJhbFxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIC8vIENvbW1vbkpTIG1vZHVsZSBpcyBkZWZpbmVkXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gbnVtZXJhbDtcbiAgICB9XG5cbiAgICAvKmdsb2JhbCBlbmRlcjpmYWxzZSAqL1xuICAgIGlmICh0eXBlb2YgZW5kZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIGhlcmUsIGB0aGlzYCBtZWFucyBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGdsb2JhbGAgb24gdGhlIHNlcnZlclxuICAgICAgICAvLyBhZGQgYG51bWVyYWxgIGFzIGEgZ2xvYmFsIG9iamVjdCB2aWEgYSBzdHJpbmcgaWRlbnRpZmllcixcbiAgICAgICAgLy8gZm9yIENsb3N1cmUgQ29tcGlsZXIgJ2FkdmFuY2VkJyBtb2RlXG4gICAgICAgIHRoaXNbJ251bWVyYWwnXSA9IG51bWVyYWw7XG4gICAgfVxuXG4gICAgLypnbG9iYWwgZGVmaW5lOmZhbHNlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bWVyYWw7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pLmNhbGwodGhpcyk7XG4iLCIvLyBFbnN1cmVzIGNhbGxzIHRvIHRoZSB3cmFwcGVkIGZ1bmN0aW9uIGFyZSBzcGFjZWQgYnkgdGhlIGdpdmVuIGRlbGF5LlxuLy8gQW55IGV4dHJhIGNhbGxzIGFyZSBkcm9wcGVkLCBleGNlcHQgdGhlIGxhc3Qgb25lLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGhyb3R0bGUoZGVsYXk6IG51bWJlciwgY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCB7XG4gIGxldCB0aW1lcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICBsZXQgbGFzdEV4ZWMgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbih0aGlzOiBhbnksIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZjogYW55ID0gdGhpcztcbiAgICBjb25zdCBlbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBsYXN0RXhlYztcblxuICAgIGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICB0aW1lciA9IHVuZGVmaW5lZDtcbiAgICAgIGxhc3RFeGVjID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9XG5cbiAgICBpZiAodGltZXIpIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgICBpZiAoZWxhcHNlZCA+IGRlbGF5KSBleGVjKCk7XG4gICAgZWxzZSB0aW1lciA9IHNldFRpbWVvdXQoZXhlYywgZGVsYXkgLSBlbGFwc2VkKTtcbiAgfTtcbn1cbiIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0cmwpIHtcbiAgcmV0dXJuIG0oJ2Rpdi5heGlzLWZvcm0nLCBbXG4gICAgbSgnc2VsZWN0Lm1zLm1ldHJpYycsIHtcbiAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgY29uZmlnOiBmdW5jdGlvbihlLCBpc1VwZGF0ZSkge1xuICAgICAgICAkKGUpLm11bHRpcGxlU2VsZWN0KHtcbiAgICAgICAgICB3aWR0aDogJzIwMHB4JyxcbiAgICAgICAgICBtYXhIZWlnaHQ6ICc0MDBweCcsXG4gICAgICAgICAgc2luZ2xlOiB0cnVlLFxuICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgIGN0cmwuc2V0TWV0cmljKHYudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgY3RybC51aS5tZXRyaWNDYXRlZ3MubWFwKGZ1bmN0aW9uKGNhdGVnKSB7XG4gICAgICByZXR1cm4gbSgnb3B0Z3JvdXAnLCB7XG4gICAgICAgIGxhYmVsOiBjYXRlZy5uYW1lXG4gICAgICB9LCBjYXRlZy5pdGVtcy5tYXAoZnVuY3Rpb24oeSkge1xuICAgICAgICByZXR1cm4gbSgnb3B0aW9uJywge1xuICAgICAgICAgIHRpdGxlOiB5LmRlc2NyaXB0aW9uLnJlcGxhY2UoLzxhW14+XSo+W14+XSs8XFwvYVtePl0qPi8sICcnKSxcbiAgICAgICAgICB2YWx1ZTogeS5rZXksXG4gICAgICAgICAgLy8gZGlzYWJsZWQ6ICFjdHJsLnZhbGlkQ29tYmluYXRpb24oY3RybC52bS5kaW1lbnNpb24sIHkpLFxuICAgICAgICAgIHNlbGVjdGVkOiBjdHJsLnZtLm1ldHJpYy5rZXkgPT09IHkua2V5XG4gICAgICAgIH0sIHkubmFtZSk7XG4gICAgICB9KSlcbiAgICB9KSksXG4gICAgbSgnc3Bhbi5ieScsICdieScpLFxuICAgIG0oJ3NlbGVjdC5tcy5kaW1lbnNpb24nLCB7XG4gICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICBjb25maWc6IGZ1bmN0aW9uKGUsIGlzVXBkYXRlKSB7XG4gICAgICAgICAgJChlKS5tdWx0aXBsZVNlbGVjdCh7XG4gICAgICAgICAgICB3aWR0aDogJzIwMHB4JyxcbiAgICAgICAgICAgIG1heEhlaWdodDogJzQwMHB4JyxcbiAgICAgICAgICAgIHNpbmdsZTogdHJ1ZSxcbiAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgY3RybC5zZXREaW1lbnNpb24odi52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjdHJsLnVpLmRpbWVuc2lvbkNhdGVncy5tYXAoZnVuY3Rpb24oY2F0ZWcpIHtcbiAgICAgICAgcmV0dXJuIG0oJ29wdGdyb3VwJywge1xuICAgICAgICAgIGxhYmVsOiBjYXRlZy5uYW1lXG4gICAgICAgIH0sIGNhdGVnLml0ZW1zLm1hcChmdW5jdGlvbih4KSB7XG4gICAgICAgICAgaWYgKHgua2V5ID09PSAncGVyaW9kJykgcmV0dXJuO1xuICAgICAgICAgIHJldHVybiBtKCdvcHRpb24nLCB7XG4gICAgICAgICAgICB0aXRsZTogeC5kZXNjcmlwdGlvbi5yZXBsYWNlKC88YVtePl0qPltePl0rPFxcL2FbXj5dKj4vLCAnJyksXG4gICAgICAgICAgICB2YWx1ZTogeC5rZXksXG4gICAgICAgICAgICAvLyBkaXNhYmxlZDogIWN0cmwudmFsaWRDb21iaW5hdGlvbih4LCBjdHJsLnZtLm1ldHJpYyksXG4gICAgICAgICAgICBzZWxlY3RlZDogY3RybC52bS5kaW1lbnNpb24ua2V5ID09PSB4LmtleVxuICAgICAgICAgIH0sIHgubmFtZSk7XG4gICAgICAgIH0pKTtcbiAgICAgIH0pKVxuICBdKTtcbn07XG4iLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuZnVuY3Rpb24gbWluaUdhbWUoZ2FtZSkge1xuICByZXR1cm4gbSgnYScsIHtcbiAgICBrZXk6IGdhbWUuaWQsXG4gICAgaHJlZjogJy8nICsgZ2FtZS5pZCArIChnYW1lLmNvbG9yID09PSAnd2hpdGUnID8gJycgOiAnL2JsYWNrJylcbiAgfSwgW1xuICAgIG0oJ3NwYW4nLCB7XG4gICAgICBjbGFzczogJ21pbmktYm9hcmQgY2ctd3JhcCBtaW5pLWJvYXJkLScgKyBnYW1lLmlkICsgJyBwYXJzZS1mZW4gaXMyZCcsXG4gICAgICAnZGF0YS1jb2xvcic6IGdhbWUuY29sb3IsXG4gICAgICAnZGF0YS1mZW4nOiBnYW1lLmZlbixcbiAgICAgICdkYXRhLWxhc3Rtb3ZlJzogZ2FtZS5sYXN0TW92ZSxcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGlzVXBkYXRlKSB7XG4gICAgICAgIGlmICghaXNVcGRhdGUpIGxpY2hlc3MucGFyc2VGZW4oJChlbCkpO1xuICAgICAgfVxuICAgIH0pLFxuICAgIG0oJ3NwYW4udnN0ZXh0JywgW1xuICAgICAgbSgnc3Bhbi52c3RleHRfX3BsJywgW1xuICAgICAgICBnYW1lLnVzZXIxLm5hbWUsXG4gICAgICAgIG0oJ2JyJyksXG4gICAgICAgIGdhbWUudXNlcjEudGl0bGUgPyBnYW1lLnVzZXIxLnRpdGxlICsgJyAnIDogJycsXG4gICAgICAgIGdhbWUudXNlcjEucmF0aW5nXG4gICAgICBdKSxcbiAgICAgIG0oJ3NwYW4udnN0ZXh0X19vcCcsIFtcbiAgICAgICAgZ2FtZS51c2VyMi5uYW1lLFxuICAgICAgICBtKCdicicpLFxuICAgICAgICBnYW1lLnVzZXIyLnJhdGluZyxcbiAgICAgICAgZ2FtZS51c2VyMi50aXRsZSA/ICcgJyArIGdhbWUudXNlcjIudGl0bGUgOiAnJ1xuICAgICAgXSlcbiAgICBdKVxuICBdKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHJsKSB7XG5cbiAgaWYgKCFjdHJsLnZtLmFuc3dlcikgcmV0dXJuO1xuXG4gIHJldHVybiBtKCdkaXYuZ2FtZS1zYW1wbGUuYm94JywgW1xuICAgIG0oJ2Rpdi50b3AnLCAnU29tZSBvZiB0aGUgZ2FtZXMgdXNlZCB0byBnZW5lcmF0ZSB0aGlzIGluc2lnaHQnKSxcbiAgICBtKCdkaXYuYm9hcmRzJywgY3RybC52bS5hbnN3ZXIuZ2FtZXMubWFwKG1pbmlHYW1lKSlcbiAgXSk7XG59XG4iLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuZnVuY3Rpb24gbWV0cmljRGF0YVR5cGVGb3JtYXQoZHQpIHtcbiAgaWYgKGR0ID09PSAnc2Vjb25kcycpIHJldHVybiAne3BvaW50Lnk6LjFmfSc7XG4gIGlmIChkdCA9PT0gJ2F2ZXJhZ2UnKSByZXR1cm4gJ3twb2ludC55OiwuMWZ9JztcbiAgaWYgKGR0ID09PSAncGVyY2VudCcpIHJldHVybiAne3BvaW50Lnk6LjFmfSUnO1xuICByZXR1cm4gJ3twb2ludC55OiwuMGZ9Jztcbn1cblxuZnVuY3Rpb24gZGltZW5zaW9uRGF0YVR5cGVGb3JtYXQoZHQpIHtcbiAgaWYgKGR0ID09PSAnZGF0ZScpIHJldHVybiAne3ZhbHVlOiVZLSVtLSVkfSc7XG4gIHJldHVybiAne3ZhbHVlfSc7XG59XG5cbmZ1bmN0aW9uIHlBeGlzVHlwZUZvcm1hdChkdCkge1xuICBpZiAoZHQgPT09ICdzZWNvbmRzJykgcmV0dXJuICd7dmFsdWU6LjFmfSc7XG4gIGlmIChkdCA9PT0gJ2F2ZXJhZ2UnKSByZXR1cm4gJ3t2YWx1ZTosLjFmfSc7XG4gIGlmIChkdCA9PT0gJ3BlcmNlbnQnKSByZXR1cm4gJ3t2YWx1ZTouMGZ9JSc7XG4gIHJldHVybiAne3ZhbHVlOiwuMGZ9Jztcbn1cblxudmFyIGNvbG9ycyA9IHtcbiAgZ3JlZW46ICcjNzU5OTAwJyxcbiAgcmVkOiAnI2RjMzIyZicsXG4gIG9yYW5nZTogJyNkNTkxMjAnLFxuICBibHVlOiAnIzAwNzU5OSdcbn07XG52YXIgcmVzdWx0Q29sb3JzID0ge1xuICBWaWN0b3J5OiBjb2xvcnMuZ3JlZW4sXG4gIERyYXc6IGNvbG9ycy5ibHVlLFxuICBEZWZlYXQ6IGNvbG9ycy5yZWRcbn07XG5cbnZhciB0aGVtZSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIGxpZ2h0ID0gJCgnYm9keScpLmhhc0NsYXNzKCdsaWdodCcpO1xuICB2YXIgdCA9IHtcbiAgICBsaWdodDogbGlnaHQsXG4gICAgdGV4dDoge1xuICAgICAgd2VhazogbGlnaHQgPyAnIzgwODA4MCcgOiAnIzlhOWE5YScsXG4gICAgICBzdHJvbmc6IGxpZ2h0ID8gJyM1MDUwNTAnIDogJyNjMGMwYzAnXG4gICAgfSxcbiAgICBsaW5lOiB7XG4gICAgICB3ZWFrOiBsaWdodCA/ICcjY2NjJyA6ICcjNDA0MDQwJyxcbiAgICAgIHN0cm9uZzogbGlnaHQgPyAnI2EwYTBhMCcgOiAnIzYwNjA2MCcsXG4gICAgICBmYXQ6ICcjZDg1MDAwJyAvLyBsaWdodCA/ICcjYTBhMGEwJyA6ICcjNzA3MDcwJ1xuICAgIH1cbiAgfTtcbiAgaWYgKCFsaWdodCkgdC5jb2xvcnMgPSBbXG4gICAgXCIjMmI5MDhmXCIsIFwiIzkwZWU3ZVwiLCBcIiNmNDViNWJcIiwgXCIjNzc5OEJGXCIsIFwiI2FhZWVlZVwiLCBcIiNmZjAwNjZcIiwgXCIjZWVhYWVlXCIsXG4gICAgXCIjNTVCRjNCXCIsIFwiI0RGNTM1M1wiLCBcIiM3Nzk4QkZcIiwgXCIjYWFlZWVlXCJcbiAgXTtcbiAgcmV0dXJuIHQ7XG59KSgpO1xuXG5mdW5jdGlvbiBtYWtlQ2hhcnQoZWwsIGRhdGEpIHtcbiAgdmFyIHNpemVTZXJpZSA9IHtcbiAgICBuYW1lOiBkYXRhLnNpemVTZXJpZS5uYW1lLFxuICAgIGRhdGE6IGRhdGEuc2l6ZVNlcmllLmRhdGEsXG4gICAgeUF4aXM6IDEsXG4gICAgdHlwZTogJ2NvbHVtbicsXG4gICAgc3RhY2s6ICdzaXplJyxcbiAgICBhbmltYXRpb246IHtcbiAgICAgIGR1cmF0aW9uOiAzMDBcbiAgICB9LFxuICAgIGNvbG9yOiAncmdiYSgxMjAsMTIwLDEyMCwwLjIpJ1xuICB9O1xuICB2YXIgdmFsdWVTZXJpZXMgPSBkYXRhLnNlcmllcy5tYXAoZnVuY3Rpb24ocykge1xuICAgIHZhciBjID0ge1xuICAgICAgbmFtZTogcy5uYW1lLFxuICAgICAgZGF0YTogcy5kYXRhLFxuICAgICAgeUF4aXM6IDAsXG4gICAgICB0eXBlOiAnY29sdW1uJyxcbiAgICAgIHN0YWNrOiBzLnN0YWNrLFxuICAgICAgLy8gYW5pbWF0aW9uOiB7XG4gICAgICAvLyAgIGR1cmF0aW9uOiAzMDBcbiAgICAgIC8vIH0sXG4gICAgICBkYXRhTGFiZWxzOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIGZvcm1hdDogcy5zdGFjayA/ICd7cG9pbnQucGVyY2VudGFnZTouMGZ9JScgOiBtZXRyaWNEYXRhVHlwZUZvcm1hdChzLmRhdGFUeXBlKVxuICAgICAgfSxcbiAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgLy8gaGVhZGVyRm9ybWF0OiAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTFweFwiPntzZXJpZXMubmFtZX08L3NwYW4+PGJyPicsXG4gICAgICAgIHBvaW50Rm9ybWF0OiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICc8c3BhbiBzdHlsZT1cImNvbG9yOntwb2ludC5jb2xvcn1cIj5cXHUyNUNGPC9zcGFuPiB7c2VyaWVzLm5hbWV9OiA8Yj4nICsgbWV0cmljRGF0YVR5cGVGb3JtYXQocy5kYXRhVHlwZSkgKyAnPC9iPjxici8+JztcbiAgICAgICAgfSkoKSxcbiAgICAgICAgc2hhcmVkOiB0cnVlLFxuICAgICAgfVxuICAgIH07XG4gICAgaWYgKGRhdGEudmFsdWVZYXhpcy5uYW1lID09PSAnR2FtZSByZXN1bHQnKSBjLmNvbG9yID0gcmVzdWx0Q29sb3JzW3MubmFtZV07XG4gICAgcmV0dXJuIGM7XG4gIH0pO1xuICB2YXIgY2hhcnRDb25mID0ge1xuICAgIGNoYXJ0OiB7XG4gICAgICB0eXBlOiAnY29sdW1uJyxcbiAgICAgIGFsaWduVGlja3M6IGRhdGEudmFsdWVZYXhpcy5kYXRhVHlwZSAhPT0gJ3BlcmNlbnQnLFxuICAgICAgc3BhY2luZzogWzIwLCA3LCAyMCwgNV0sXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IG51bGwsXG4gICAgICBib3JkZXJXaWR0aDogMCxcbiAgICAgIGJvcmRlclJhZGl1czogMCxcbiAgICAgIHBsb3RCYWNrZ3JvdW5kQ29sb3I6IG51bGwsXG4gICAgICBwbG90U2hhZG93OiBmYWxzZSxcbiAgICAgIHBsb3RCb3JkZXJXaWR0aDogMCxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIGZvbnQ6IFwiMTJweCAnTm90byBTYW5zJywgJ0x1Y2lkYSBHcmFuZGUnLCAnTHVjaWRhIFNhbnMgVW5pY29kZScsIFZlcmRhbmEsIEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWZcIlxuICAgICAgfVxuICAgIH0sXG4gICAgdGl0bGU6IHtcbiAgICAgIHRleHQ6IG51bGxcbiAgICB9LFxuICAgIHhBeGlzOiB7XG4gICAgICB0eXBlOiBkYXRhLnhBeGlzLmRhdGFUeXBlID09PSAnZGF0ZScgPyAnZGF0ZXRpbWUnIDogJ2xpbmVhcicsXG4gICAgICBjYXRlZ29yaWVzOiBkYXRhLnhBeGlzLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEueEF4aXMuZGF0YVR5cGUgPT09ICdkYXRlJyA/IHYgKiAxMDAwIDogdjtcbiAgICAgIH0pLFxuICAgICAgY3Jvc3NoYWlyOiB0cnVlLFxuICAgICAgbGFiZWxzOiB7XG4gICAgICAgIGZvcm1hdDogZGltZW5zaW9uRGF0YVR5cGVGb3JtYXQoZGF0YS54QXhpcy5kYXRhVHlwZSksXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgY29sb3I6IHRoZW1lLnRleHQud2VhayxcbiAgICAgICAgICBmb250U2l6ZTogOVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdGl0bGU6IHtcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBjb2xvcjogdGhlbWUudGV4dC53ZWFrLFxuICAgICAgICAgIGZvbnRTaXplOiA5XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBncmlkTGluZUNvbG9yOiB0aGVtZS5saW5lLndlYWssXG4gICAgICBsaW5lQ29sb3I6IHRoZW1lLmxpbmUuc3Ryb25nLFxuICAgICAgdGlja0NvbG9yOiB0aGVtZS5saW5lLnN0cm9uZyxcbiAgICB9LFxuICAgIHlBeGlzOiBbZGF0YS52YWx1ZVlheGlzLCBkYXRhLnNpemVZYXhpc10ubWFwKGZ1bmN0aW9uKGEsIGkpIHtcbiAgICAgIHZhciBpc1BlcmNlbnQgPSBkYXRhLnZhbHVlWWF4aXMuZGF0YVR5cGUgPT09ICdwZXJjZW50JztcbiAgICAgIHZhciBpc1NpemUgPSBpICUgMiA9PT0gMTtcbiAgICAgIHZhciBjID0ge1xuICAgICAgICBvcHBvc2l0ZTogaXNTaXplLFxuICAgICAgICBtaW46ICFpc1NpemUgJiYgaXNQZXJjZW50ID8gMCA6IHVuZGVmaW5lZCxcbiAgICAgICAgbWF4OiAhaXNTaXplICYmIGlzUGVyY2VudCA/IDEwMCA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgZm9ybWF0OiB5QXhpc1R5cGVGb3JtYXQoYS5kYXRhVHlwZSksXG4gICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgIGNvbG9yOiB0aGVtZS50ZXh0LndlYWssXG4gICAgICAgICAgICBmb250U2l6ZTogOVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICB0ZXh0OiBpID09PSAxID8gYS5uYW1lIDogZmFsc2UsXG4gICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgIGNvbG9yOiB0aGVtZS50ZXh0LndlYWssXG4gICAgICAgICAgICBmb250U2l6ZTogOVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ3JpZExpbmVDb2xvcjogdGhlbWUubGluZS53ZWFrLFxuICAgICAgfTtcbiAgICAgIGlmIChpc1NpemUgJiYgaXNQZXJjZW50KSB7XG4gICAgICAgIGMubWlub3JHcmlkTGluZVdpZHRoID0gMDtcbiAgICAgICAgYy5ncmlkTGluZVdpZHRoID0gMDtcbiAgICAgICAgYy5hbHRlcm5hdGVHcmlkQ29sb3IgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGM7XG4gICAgfSksXG4gICAgcGxvdE9wdGlvbnM6IHtcbiAgICAgIGNvbHVtbjoge1xuICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICBkdXJhdGlvbjogMzAwXG4gICAgICAgIH0sXG4gICAgICAgIHN0YWNraW5nOiAnbm9ybWFsJyxcbiAgICAgICAgZGF0YUxhYmVsczoge1xuICAgICAgICAgIGNvbG9yOiB0aGVtZS50ZXh0LnN0cm9uZ1xuICAgICAgICB9LFxuICAgICAgICBtYXJrZXI6IHtcbiAgICAgICAgICBsaW5lQ29sb3I6IHRoZW1lLnRleHQud2Vha1xuICAgICAgICB9LFxuICAgICAgICBib3JkZXJDb2xvcjogdGhlbWUubGluZS5zdHJvbmdcbiAgICAgIH1cbiAgICB9LFxuICAgIHNlcmllczogdmFsdWVTZXJpZXMuY29uY2F0KHNpemVTZXJpZSksXG4gICAgY3JlZGl0czoge1xuICAgICAgZW5hYmxlZDogZmFsc2VcbiAgICB9LFxuICAgIGxhYmVsczoge1xuICAgICAgc3R5bGU6IHtcbiAgICAgICAgY29sb3I6IHRoZW1lLnRleHQuc3Ryb25nXG4gICAgICB9XG4gICAgfSxcbiAgICB0b29sdGlwOiB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHtcbiAgICAgICAgbGluZWFyR3JhZGllbnQ6IHtcbiAgICAgICAgICB4MTogMCxcbiAgICAgICAgICB5MTogMCxcbiAgICAgICAgICB4MjogMCxcbiAgICAgICAgICB5MjogMVxuICAgICAgICB9LFxuICAgICAgICBzdG9wczogdGhlbWUubGlnaHQgPyBbXG4gICAgICAgICAgWzAsICdyZ2JhKDIwMCwgMjAwLCAyMDAsIC44KSddLFxuICAgICAgICAgIFsxLCAncmdiYSgyNTAsIDI1MCwgMjUwLCAuOCknXVxuICAgICAgICBdIDogW1xuICAgICAgICAgIFswLCAncmdiYSg1NiwgNTYsIDU2LCAuOCknXSxcbiAgICAgICAgICBbMSwgJ3JnYmEoMTYsIDE2LCAxNiwgLjgpJ11cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIGZvbnRXZWlnaHQ6ICdib2xkJyxcbiAgICAgICAgY29sb3I6IHRoZW1lLnRleHQuc3Ryb25nXG4gICAgICB9XG4gICAgfSxcbiAgICBsZWdlbmQ6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBpdGVtU3R5bGU6IHtcbiAgICAgICAgY29sb3I6IHRoZW1lLnRleHQud2Vha1xuICAgICAgfSxcbiAgICAgIGl0ZW1IaWRkZW5TdHlsZToge1xuICAgICAgICBjb2xvcjogdGhlbWUudGV4dC53ZWFrXG4gICAgICB9XG4gICAgfVxuICB9O1xuICBpZiAodGhlbWUuY29sb3JzKSBjaGFydENvbmYuY29sb3JzID0gdGhlbWUuY29sb3JzO1xuICAkKGVsKS5oaWdoY2hhcnRzKGNoYXJ0Q29uZik7XG59XG5cbmZ1bmN0aW9uIGVtcHR5KHR4dCkge1xuICByZXR1cm4gbSgnZGl2LmNoYXJ0LmVtcHR5JywgW1xuICAgIG0oJ2lbZGF0YS1pY29uPTddJyksXG4gICAgdHh0XG4gIF0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0cmwpIHtcbiAgaWYgKCFjdHJsLnZhbGlkQ29tYmluYXRpb25DdXJyZW50KCkpIHJldHVybiBlbXB0eSgnSW52YWxpZCBkaW1lbnNpb24vbWV0cmljIGNvbWJpbmF0aW9uJyk7XG4gIGlmICghY3RybC52bS5hbnN3ZXIuc2VyaWVzLmxlbmd0aCkgcmV0dXJuIGVtcHR5KCdObyBkYXRhLiBUcnkgd2lkZW5pbmcgb3IgY2xlYXJpbmcgdGhlIGZpbHRlcnMuJyk7XG4gIHJldHVybiBbXG4gICAgbSgnZGl2LmNoYXJ0Jywge1xuICAgICAgY29uZmlnOiBmdW5jdGlvbihlbCkge1xuICAgICAgICBpZiAoY3RybC52bS5sb2FkaW5nKSByZXR1cm47XG4gICAgICAgIG1ha2VDaGFydChlbCwgY3RybC52bS5hbnN3ZXIpO1xuICAgICAgfVxuICAgIH0pLFxuICAgIGN0cmwudm0ubG9hZGluZyA/IG0udHJ1c3QobGljaGVzcy5zcGlubmVySHRtbCkgOiBudWxsXG4gIF07XG59O1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG52YXIgdGhyb3R0bGUgPSByZXF1aXJlKCdjb21tb24vdGhyb3R0bGUnKS5kZWZhdWx0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVudiwgZG9tRWxlbWVudCkge1xuXG4gIHRoaXMudWkgPSBlbnYudWk7XG4gIHRoaXMudXNlciA9IGVudi51c2VyO1xuICB0aGlzLm93biA9IGVudi5teVVzZXJJZCA9PT0gdGhpcy51c2VyLmlkO1xuICB0aGlzLmRpbWVuc2lvbnMgPSBbXS5jb25jYXQuYXBwbHkoW10sIHRoaXMudWkuZGltZW5zaW9uQ2F0ZWdzLm1hcChmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGMuaXRlbXM7XG4gIH0pKTtcbiAgdGhpcy5tZXRyaWNzID0gW10uY29uY2F0LmFwcGx5KFtdLCB0aGlzLnVpLm1ldHJpY0NhdGVncy5tYXAoZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBjLml0ZW1zO1xuICB9KSk7XG5cbiAgdmFyIGZpbmRNZXRyaWMgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzLmZpbmQoZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHgua2V5ID09PSBrZXk7XG4gICAgfSk7XG4gIH0uYmluZCh0aGlzKTtcblxuICB2YXIgZmluZERpbWVuc2lvbiA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpbWVuc2lvbnMuZmluZChmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4geC5rZXkgPT09IGtleTtcbiAgICB9KTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHRoaXMudm0gPSB7XG4gICAgbWV0cmljOiBmaW5kTWV0cmljKGVudi5pbml0aWFsUXVlc3Rpb24ubWV0cmljKSxcbiAgICBkaW1lbnNpb246IGZpbmREaW1lbnNpb24oZW52LmluaXRpYWxRdWVzdGlvbi5kaW1lbnNpb24pLFxuICAgIGZpbHRlcnM6IGVudi5pbml0aWFsUXVlc3Rpb24uZmlsdGVycyxcbiAgICBsb2FkaW5nOiB0cnVlLFxuICAgIGJyb2tlbjogZmFsc2UsXG4gICAgYW5zd2VyOiBudWxsLFxuICAgIHBhbmVsOiBPYmplY3Qua2V5cyhlbnYuaW5pdGlhbFF1ZXN0aW9uLmZpbHRlcnMpLmxlbmd0aCA/ICdmaWx0ZXInIDogJ3ByZXNldCdcbiAgfTtcblxuICB0aGlzLnNldFBhbmVsID0gZnVuY3Rpb24ocCkge1xuICAgIHRoaXMudm0ucGFuZWwgPSBwO1xuICAgIG0ucmVkcmF3KCk7XG4gIH0uYmluZCh0aGlzKTtcblxuXG4gIHZhciByZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudm0ubWV0cmljID0gdGhpcy5tZXRyaWNzWzBdO1xuICAgIHRoaXMudm0uZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb25zWzBdO1xuICAgIHRoaXMudm0uZmlsdGVycyA9IHt9O1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdmFyIGFza1F1ZXN0aW9uID0gdGhyb3R0bGUoMTAwMCwgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnZhbGlkQ29tYmluYXRpb25DdXJyZW50KCkpIHJlc2V0KCk7XG4gICAgdGhpcy5wdXNoU3RhdGUoKTtcbiAgICB0aGlzLnZtLmxvYWRpbmcgPSB0cnVlO1xuICAgIHRoaXMudm0uYnJva2VuID0gZmFsc2U7XG4gICAgbS5yZWRyYXcoKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgbS5yZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgIHVybDogZW52LnBvc3RVcmwsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBtZXRyaWM6IHRoaXMudm0ubWV0cmljLmtleSxcbiAgICAgICAgICBkaW1lbnNpb246IHRoaXMudm0uZGltZW5zaW9uLmtleSxcbiAgICAgICAgICBmaWx0ZXJzOiB0aGlzLnZtLmZpbHRlcnNcbiAgICAgICAgfSxcbiAgICAgICAgZGVzZXJpYWxpemU6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICB0cnkge3JldHVybiBKU09OLnBhcnNlKGQpfSBjYXRjaCAoZSkge3Rocm93IG5ldyBFcnJvcihkKX1cbiAgICAgICAgfVxuICAgICAgfSkudGhlbihmdW5jdGlvbihhbnN3ZXIpIHtcbiAgICAgICAgdGhpcy52bS5hbnN3ZXIgPSBhbnN3ZXI7XG4gICAgICAgIHRoaXMudm0ubG9hZGluZyA9IGZhbHNlO1xuICAgICAgfS5iaW5kKHRoaXMpKS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy52bS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMudm0uYnJva2VuID0gdHJ1ZTtcbiAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpLCAxKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICB0aGlzLm1ha2VVcmwgPSBmdW5jdGlvbihkS2V5LCBtS2V5LCBmaWx0ZXJzKSB7XG4gICAgdmFyIHVybCA9IFtlbnYucGFnZVVybCwgbUtleSwgZEtleV0uam9pbignLycpO1xuICAgIHZhciBmaWx0ZXJzID0gT2JqZWN0LmtleXMoZmlsdGVycykubWFwKGZ1bmN0aW9uKGZpbHRlcktleSkge1xuICAgICAgcmV0dXJuIGZpbHRlcktleSArICc6JyArIGZpbHRlcnNbZmlsdGVyS2V5XS5qb2luKCcsJyk7XG4gICAgfSkuam9pbignLycpO1xuICAgIGlmIChmaWx0ZXJzLmxlbmd0aCkgdXJsICs9ICcvJyArIGZpbHRlcnM7XG4gICAgcmV0dXJuIHVybDtcbiAgfTtcblxuICB0aGlzLm1ha2VDdXJyZW50VXJsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWFrZVVybCh0aGlzLnZtLmRpbWVuc2lvbi5rZXksIHRoaXMudm0ubWV0cmljLmtleSwgdGhpcy52bS5maWx0ZXJzKVxuICB9LmJpbmQodGhpcyk7XG5cbiAgdGhpcy5wdXNoU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgbnVsbCwgdGhpcy5tYWtlQ3VycmVudFVybCgpKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHRoaXMudmFsaWRDb21iaW5hdGlvbiA9IGZ1bmN0aW9uKGRpbWVuc2lvbiwgbWV0cmljKSB7XG4gICAgcmV0dXJuIGRpbWVuc2lvbiAmJiBtZXRyaWMgJiYgKFxuICAgICAgZGltZW5zaW9uLnBvc2l0aW9uID09PSAnZ2FtZScgfHwgbWV0cmljLnBvc2l0aW9uID09PSAnbW92ZSdcbiAgICApO1xuICB9O1xuICB0aGlzLnZhbGlkQ29tYmluYXRpb25DdXJyZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsaWRDb21iaW5hdGlvbih0aGlzLnZtLmRpbWVuc2lvbiwgdGhpcy52bS5tZXRyaWMpO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdGhpcy5zZXRNZXRyaWMgPSBmdW5jdGlvbihrZXkpIHtcbiAgICB0aGlzLnZtLm1ldHJpYyA9IGZpbmRNZXRyaWMoa2V5KTtcbiAgICBpZiAoIXRoaXMudmFsaWRDb21iaW5hdGlvbkN1cnJlbnQoKSkgdGhpcy52bS5kaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbnMuZmluZChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWxpZENvbWJpbmF0aW9uKGQsIHRoaXMudm0ubWV0cmljKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMudm0ucGFuZWwgPSAnZmlsdGVyJztcbiAgICBhc2tRdWVzdGlvbigpO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdGhpcy5zZXREaW1lbnNpb24gPSBmdW5jdGlvbihrZXkpIHtcbiAgICB0aGlzLnZtLmRpbWVuc2lvbiA9IGZpbmREaW1lbnNpb24oa2V5KTtcbiAgICBpZiAoIXRoaXMudmFsaWRDb21iaW5hdGlvbkN1cnJlbnQoKSkgdGhpcy52bS5tZXRyaWMgPSB0aGlzLm1ldHJpY3MuZmluZChmdW5jdGlvbihtKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWxpZENvbWJpbmF0aW9uKHRoaXMudm0uZGltZW5zaW9uLCBtKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMudm0ucGFuZWwgPSAnZmlsdGVyJztcbiAgICBhc2tRdWVzdGlvbigpO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdGhpcy5zZXRGaWx0ZXIgPSBmdW5jdGlvbihkaW1lbnNpb25LZXksIHZhbHVlS2V5cykge1xuICAgIGlmICghdmFsdWVLZXlzLmxlbmd0aCkgZGVsZXRlIHRoaXMudm0uZmlsdGVyc1tkaW1lbnNpb25LZXldO1xuICAgIGVsc2UgdGhpcy52bS5maWx0ZXJzW2RpbWVuc2lvbktleV0gPSB2YWx1ZUtleXM7XG4gICAgYXNrUXVlc3Rpb24oKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHRoaXMuc2V0UXVlc3Rpb24gPSBmdW5jdGlvbihxKSB7XG4gICAgdGhpcy52bS5kaW1lbnNpb24gPSBmaW5kRGltZW5zaW9uKHEuZGltZW5zaW9uKTtcbiAgICB0aGlzLnZtLm1ldHJpYyA9IGZpbmRNZXRyaWMocS5tZXRyaWMpO1xuICAgIHRoaXMudm0uZmlsdGVycyA9IHEuZmlsdGVycztcbiAgICBhc2tRdWVzdGlvbigpO1xuICAgICQoZG9tRWxlbWVudCkuZmluZCgnc2VsZWN0Lm1zJykubXVsdGlwbGVTZWxlY3QoJ29wZW4nKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJChkb21FbGVtZW50KS5maW5kKCdzZWxlY3QubXMnKS5tdWx0aXBsZVNlbGVjdCgnY2xvc2UnKTtcbiAgICB9LCAxMDAwKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHRoaXMuY2xlYXJGaWx0ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMudm0uZmlsdGVycykubGVuZ3RoKSB7XG4gICAgICB0aGlzLnZtLmZpbHRlcnMgPSB7fTtcbiAgICAgIGFza1F1ZXN0aW9uKCk7XG4gICAgfVxuICB9LmJpbmQodGhpcyk7XG5cbiAgLy8gdGhpcy50cmFucyA9IGxpY2hlc3MudHJhbnMoZW52LmkxOG4pO1xuXG4gIGFza1F1ZXN0aW9uKCk7XG59O1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbmZ1bmN0aW9uIHNlbGVjdChjdHJsKSB7XG4gIHJldHVybiBmdW5jdGlvbihkaW1lbnNpb24pIHtcbiAgICBpZiAoZGltZW5zaW9uLmtleSA9PT0gJ2RhdGUnKSByZXR1cm47XG4gICAgdmFyIHNpbmdsZSA9IGRpbWVuc2lvbi5rZXkgPT09ICdwZXJpb2QnO1xuICAgIHJldHVybiBtKCdzZWxlY3QnLCB7XG4gICAgICBtdWx0aXBsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24oZSwgaXNVcGRhdGUpIHtcbiAgICAgICAgaWYgKGlzVXBkYXRlICYmIGN0cmwudm0uZmlsdGVyc1tkaW1lbnNpb24ua2V5XSkgcmV0dXJuO1xuICAgICAgICAkKGUpLm11bHRpcGxlU2VsZWN0KHtcbiAgICAgICAgICBwbGFjZWhvbGRlcjogZGltZW5zaW9uLm5hbWUsXG4gICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICBzZWxlY3RBbGw6IGZhbHNlLFxuICAgICAgICAgIGZpbHRlcjogZGltZW5zaW9uLmtleSA9PT0gJ29wZW5pbmcnLFxuICAgICAgICAgIHNpbmdsZTogc2luZ2xlLFxuICAgICAgICAgIG1pbmltdW1Db3VudFNlbGVjdGVkOiAxMCxcbiAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbih2aWV3KSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gc2luZ2xlID8gW3ZpZXcudmFsdWVdIDogJChlKS5tdWx0aXBsZVNlbGVjdChcImdldFNlbGVjdHNcIik7XG4gICAgICAgICAgICBjdHJsLnNldEZpbHRlcihkaW1lbnNpb24ua2V5LCB2YWx1ZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgZGltZW5zaW9uLnZhbHVlcy5tYXAoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBzZWxlY3RlZCA9IGN0cmwudm0uZmlsdGVyc1tkaW1lbnNpb24ua2V5XTtcbiAgICAgIHJldHVybiBtKCdvcHRpb24nLCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZS5rZXksXG4gICAgICAgIHNlbGVjdGVkOiBzZWxlY3RlZCAmJiBzZWxlY3RlZC5pbmNsdWRlcyh2YWx1ZS5rZXkpXG4gICAgICB9LCB2YWx1ZS5uYW1lKTtcbiAgICB9KSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3RybCkge1xuICByZXR1cm4gbSgnZGl2LmZpbHRlcnMnLCBbXG4gICAgbSgnZGl2Lml0ZW1zJyxcbiAgICAgIGN0cmwudWkuZGltZW5zaW9uQ2F0ZWdzLm1hcChmdW5jdGlvbihjYXRlZykge1xuICAgICAgICByZXR1cm4gbSgnZGl2LmNhdGVnLmJveCcsIFtcbiAgICAgICAgICBtKCdkaXYudG9wJywgY2F0ZWcubmFtZSksXG4gICAgICAgICAgY2F0ZWcuaXRlbXMubWFwKHNlbGVjdChjdHJsKSlcbiAgICAgICAgXSk7XG4gICAgICB9KVxuICAgIClcbiAgXSk7XG59O1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3RybCkge1xuICByZXR1cm4gbSgnZGl2LmhlbHAuYm94JywgW1xuICAgIG0oJ2Rpdi50b3AnLCAnRGVmaW5pdGlvbnMnKSxcbiAgICBtKCdkaXYuY29udGVudCcsIFsnbWV0cmljJywgJ2RpbWVuc2lvbiddLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICB2YXIgZGF0YSA9IGN0cmwudm1bdHlwZV07XG4gICAgICByZXR1cm4gbSgnc2VjdGlvbi4nICsgdHlwZSwgW1xuICAgICAgICBtKCdoMycsIGRhdGEubmFtZSksXG4gICAgICAgIG0oJ3AnLCBtLnRydXN0KGRhdGEuZGVzY3JpcHRpb24pKVxuICAgICAgXSk7XG4gICAgfSkpXG4gIF0pO1xufTtcbiIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG52YXIgc2hhcmVTdGF0ZXMgPSBbXCJub2JvZHlcIiwgXCJmcmllbmRzIG9ubHlcIiwgXCJldmVyeWJvZHlcIl07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3RybCkge1xuICB2YXIgc2hhcmVUZXh0ID0gJ1NoYXJlZCB3aXRoICcgKyBzaGFyZVN0YXRlc1tjdHJsLnVzZXIuc2hhcmVJZF0gKyAnLic7XG4gIHJldHVybiBtKCdkaXYuaW5mby5ib3gnLCBbXG4gICAgbSgnZGl2LnRvcCcsIFtcbiAgICAgIG0oJ2EuaGVscCcsIHtcbiAgICAgICAgdGl0bGU6ICdIb3cgZG9lcyB0aGlzIHdvcms/JyxcbiAgICAgICAgb25jbGljazogbGljaGVzcy5zdGFydEluc2lnaHRUb3VyXG4gICAgICB9LCAnPycpLFxuICAgICAgbSgnYS51c2VybmFtZS51c2VyLWxpbmsuaW5zaWdodC11bHB0Jywge1xuICAgICAgICBocmVmOiAnL0AvJyArIGN0cmwudXNlci5uYW1lXG4gICAgICB9LCBjdHJsLnVzZXIubmFtZSlcbiAgICBdKSxcbiAgICBtKCdkaXYuY29udGVudCcsIFtcbiAgICAgIG0oJ3AnLCBbXG4gICAgICAgICdJbnNpZ2h0cyBvdmVyICcsXG4gICAgICAgIG0oJ3N0cm9uZycsIGN0cmwudXNlci5uYkdhbWVzKSxcbiAgICAgICAgJyByYXRlZCBnYW1lcy4nXG4gICAgICBdKSxcbiAgICAgIG0oJ3Auc2hhcmUnLCBjdHJsLm93biA/IG0oJ2EnLCB7XG4gICAgICAgIGhyZWY6ICcvYWNjb3VudC9wcmVmZXJlbmNlcy9wcml2YWN5JyxcbiAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJ1xuICAgICAgfSwgc2hhcmVUZXh0KSA6IHNoYXJlVGV4dClcbiAgICBdKSxcbiAgICBtKCdkaXYucmVmcmVzaCcsIHtcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24oZSwgaXNVcGRhdGUpIHtcbiAgICAgICAgaWYgKGlzVXBkYXRlKSByZXR1cm47XG4gICAgICAgIHZhciAkcmVmID0gJCgnLmluc2lnaHQtc3RhbGUnKTtcbiAgICAgICAgaWYgKCRyZWYubGVuZ3RoKSB7XG4gICAgICAgICAgJChlKS5odG1sKCRyZWYuc2hvdygpKTtcbiAgICAgICAgICBsaWNoZXNzLnJlZnJlc2hJbnNpZ2h0Rm9ybSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgXSk7XG59O1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbnZhciBjdHJsID0gcmVxdWlyZSgnLi9jdHJsJyk7XG52YXIgdmlldyA9IHJlcXVpcmUoJy4vdmlldycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdHMpIHtcblxuICB2YXIgY29udHJvbGxlciA9IG5ldyBjdHJsKG9wdHMsIGVsZW1lbnQpO1xuXG4gIG0ubW9kdWxlKGVsZW1lbnQsIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjb250cm9sbGVyO1xuICAgIH0sXG4gICAgdmlldzogdmlld1xuICB9KTtcblxuICByZXR1cm4gY29udHJvbGxlcjtcbn07XG5cbi8vIGZvciBtdWx0aXBsZS1zZWxlY3RcbmpRdWVyeS5mbi5leHRlbmQoIHtcbiAgaG92ZXI6IGZ1bmN0aW9uKCBmbk92ZXIsIGZuT3V0ICkge1xuICAgIHJldHVybiB0aGlzLm9uKCdtb3VzZWVudGVyJywgZm5PdmVyICkub24oJ21vdXNlbGVhdmUnLCBmbk91dCB8fCBmbk92ZXIgKTtcbiAgfVxufSApO1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3RybCkge1xuICByZXR1cm4gbSgnZGl2LmJveC5wcmVzZXRzJyxcbiAgICBjdHJsLnVpLnByZXNldHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgIHZhciBhY3RpdmUgPVxuICAgICAgICBjdHJsLm1ha2VVcmwocC5kaW1lbnNpb24sIHAubWV0cmljLCBwLmZpbHRlcnMpID09PVxuICAgICAgICBjdHJsLm1ha2VDdXJyZW50VXJsKCk7XG4gICAgICByZXR1cm4gbSgnYScsIHtcbiAgICAgICAgY2xhc3M6ICdwcmVzZXQgdGV4dCcgKyAoYWN0aXZlID8gJyBhY3RpdmUnIDogJycpLFxuICAgICAgICAnZGF0YS1pY29uJzogJzcnLFxuICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjdHJsLnNldFF1ZXN0aW9uKHApO1xuICAgICAgICB9XG4gICAgICB9LCBwLm5hbWUpO1xuICAgIH0pXG4gICk7XG59O1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG52YXIgbnVtZXJhbCA9IHJlcXVpcmUoJ251bWVyYWwnKTtcblxuZnVuY3Rpb24gZm9ybWF0TnVtYmVyKGR0LCBuKSB7XG4gIGlmIChkdCA9PT0gJ3BlcmNlbnQnKSBuID0gbiAvIDEwMDtcbiAgdmFyIGY7XG4gIGlmIChkdCA9PT0gJ3NlY29uZHMnKSBmID0gJzAuMCc7XG4gIGVsc2UgaWYgKGR0ID09PSAnYXZlcmFnZScpIGYgPSAnMC4wJztcbiAgZWxzZSBpZiAoZHQgPT09ICdwZXJjZW50JykgZiA9ICcwLjAlJztcbiAgZWxzZSBmID0gJzAsMCc7XG4gIHJldHVybiBudW1lcmFsKG4pLmZvcm1hdChmKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0U2VyaWVOYW1lKGR0LCBuKSB7XG4gIGlmIChkdCA9PT0gJ2RhdGUnKSByZXR1cm4gbmV3IERhdGUobiAqIDEwMDApLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICByZXR1cm4gbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHZlcnQ6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICB2YXIgYW5zd2VyID0gY3RybC52bS5hbnN3ZXI7XG4gICAgaWYgKCFhbnN3ZXIpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBtKCd0YWJsZS5zbGlzdCcsIFtcbiAgICAgIG0oJ3RoZWFkJyxcbiAgICAgICAgbSgndHInLCBbXG4gICAgICAgICAgbSgndGgnLCBhbnN3ZXIueEF4aXMubmFtZSksXG4gICAgICAgICAgYW5zd2VyLnNlcmllcy5tYXAoZnVuY3Rpb24oc2VyaWUpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCd0aCcsIHNlcmllLm5hbWUpO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIG0oJ3RoJywgYW5zd2VyLnNpemVZYXhpcy5uYW1lKVxuICAgICAgICBdKVxuICAgICAgKSxcbiAgICAgIG0oJ3Rib2R5JywgYW5zd2VyLnhBeGlzLmNhdGVnb3JpZXMubWFwKGZ1bmN0aW9uKGMsIGkpIHtcbiAgICAgICAgcmV0dXJuIG0oJ3RyJywgW1xuICAgICAgICAgIG0oJ3RoJywgZm9ybWF0U2VyaWVOYW1lKGFuc3dlci54QXhpcy5kYXRhVHlwZSwgYykpLFxuICAgICAgICAgIGFuc3dlci5zZXJpZXMubWFwKGZ1bmN0aW9uKHNlcmllKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgndGQuZGF0YScsIGZvcm1hdE51bWJlcihzZXJpZS5kYXRhVHlwZSwgc2VyaWUuZGF0YVtpXSkpXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbSgndGQuc2l6ZScsIGZvcm1hdE51bWJlcihhbnN3ZXIuc2l6ZVNlcmllLmRhdGFUeXBlLCBhbnN3ZXIuc2l6ZVNlcmllLmRhdGFbaV0pKVxuICAgICAgICBdKTtcbiAgICAgIH0pKVxuICAgIF0pO1xuICB9XG59O1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG52YXIgYXhpcyA9IHJlcXVpcmUoJy4vYXhpcycpO1xudmFyIGZpbHRlcnMgPSByZXF1aXJlKCcuL2ZpbHRlcnMnKTtcbnZhciBwcmVzZXRzID0gcmVxdWlyZSgnLi9wcmVzZXRzJyk7XG52YXIgY2hhcnQgPSByZXF1aXJlKCcuL2NoYXJ0Jyk7XG52YXIgdGFibGUgPSByZXF1aXJlKCcuL3RhYmxlJyk7XG52YXIgaGVscCA9IHJlcXVpcmUoJy4vaGVscCcpO1xudmFyIGluZm8gPSByZXF1aXJlKCcuL2luZm8nKTtcbnZhciBib2FyZHMgPSByZXF1aXJlKCcuL2JvYXJkcycpO1xuXG5mdW5jdGlvbiBjYWNoZSh2aWV3LCBkYXRhVG9LZXkpIHtcbiAgdmFyIHByZXYgPSBudWxsO1xuICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBrZXkgPSBkYXRhVG9LZXkoZGF0YSk7XG4gICAgaWYgKHByZXYgPT09IGtleSkgcmV0dXJuIHtcbiAgICAgIHN1YnRyZWU6IFwicmV0YWluXCJcbiAgICB9O1xuICAgIHByZXYgPSBrZXk7XG4gICAgcmV0dXJuIHZpZXcoZGF0YSk7XG4gIH07XG59XG5cbnZhciByZW5kZXJNZWF0ID0gY2FjaGUoZnVuY3Rpb24oY3RybCkge1xuICBpZiAoY3RybC52bS5icm9rZW4pIHJldHVybiBtKCdkaXYuYnJva2VuJywgW1xuICAgIG0oJ2lbZGF0YS1pY29uPWpdJyksXG4gICAgJ0luc2lnaHRzIGFyZSB1bmF2YWlsYWJsZS4nLFxuICAgIG0oJ2JyJyksXG4gICAgJ1BsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuJ1xuICBdKTtcbiAgaWYgKCFjdHJsLnZtLmFuc3dlcikgcmV0dXJuO1xuICByZXR1cm4gbSgnZGl2JywgW1xuICAgIGNoYXJ0KGN0cmwpLFxuICAgIHRhYmxlLnZlcnQoY3RybCksXG4gICAgYm9hcmRzKGN0cmwpXG4gIF0pO1xufSwgZnVuY3Rpb24oY3RybCkge1xuICB2YXIgcSA9IGN0cmwudm0uYW5zd2VyID8gY3RybC52bS5hbnN3ZXIucXVlc3Rpb24gOiBudWxsO1xuICByZXR1cm4gcSA/IGN0cmwubWFrZVVybChxLmRpbWVuc2lvbiwgcS5tZXRyaWMsIHEuZmlsdGVycykgOiBjdHJsLnZtLmJyb2tlbjtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0cmwpIHtcbiAgcmV0dXJuIG0oJ2RpdicsIHtcbiAgICBjbGFzczogY3RybC52bS5sb2FkaW5nID8gJ2xvYWRpbmcnIDogJ3JlYWR5J1xuICB9LCBbXG4gICAgbSgnZGl2LmxlZnQtc2lkZScsIFtcbiAgICAgIGluZm8oY3RybCksXG4gICAgICBtKCdkaXYucGFuZWwtdGFicycsIFtcbiAgICAgICAgbSgnYVtkYXRhLXBhbmVsPVwicHJlc2V0XCJdJywge1xuICAgICAgICAgIGNsYXNzOiAndGFiIHByZXNldCcgKyAoY3RybC52bS5wYW5lbCA9PT0gJ3ByZXNldCcgPyAnIGFjdGl2ZScgOiAnJyksXG4gICAgICAgICAgb25jbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjdHJsLnNldFBhbmVsKCdwcmVzZXQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sICdQcmVzZXRzJyksXG4gICAgICAgIG0oJ2FbZGF0YS1wYW5lbD1cImZpbHRlclwiXScsIHtcbiAgICAgICAgICBjbGFzczogJ3RhYiBmaWx0ZXInICsgKGN0cmwudm0ucGFuZWwgPT09ICdmaWx0ZXInID8gJyBhY3RpdmUnIDogJycpLFxuICAgICAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY3RybC5zZXRQYW5lbCgnZmlsdGVyJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAnRmlsdGVycycpLCBPYmplY3Qua2V5cyhjdHJsLnZtLmZpbHRlcnMpLmxlbmd0aCA/IG0oJ2EuY2xlYXInLCB7XG4gICAgICAgICAgdGl0bGU6ICdDbGVhciBhbGwgZmlsdGVycycsXG4gICAgICAgICAgJ2RhdGEtaWNvbic6ICdMJyxcbiAgICAgICAgICBvbmNsaWNrOiBjdHJsLmNsZWFyRmlsdGVyc1xuICAgICAgICB9LCAnQ0xFQVInKSA6IG51bGwsXG4gICAgICBdKSxcbiAgICAgIGN0cmwudm0ucGFuZWwgPT09ICdmaWx0ZXInID8gZmlsdGVycyhjdHJsKSA6IG51bGwsXG4gICAgICBjdHJsLnZtLnBhbmVsID09PSAncHJlc2V0JyA/IHByZXNldHMoY3RybCkgOiBudWxsLFxuICAgICAgaGVscChjdHJsKVxuICAgIF0pLFxuICAgIG0oJ2hlYWRlcicsIFtcbiAgICAgIGF4aXMoY3RybCksXG4gICAgICBtKCdoMicsIHtcbiAgICAgICAgY2xhc3M6ICd0ZXh0JyxcbiAgICAgICAgJ2RhdGEtaWNvbic6ICc3J1xuICAgICAgfSwgJ0NoZXNzIEluc2lnaHRzJylcbiAgICBdKSxcbiAgICBtKCdkaXYubWVhdC5ib3gnLCByZW5kZXJNZWF0KGN0cmwpKVxuICBdKTtcbn07XG4iXX0=
