// This file contains the minified source code for DOMPurify v2.3.8
// It is bundled into the deployed outputs to make them self-contained.
// Source: https://unpkg.com/dompurify@2.3.8/dist/purify.min.js

export const domPurifySource = `(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.DOMPurify = factory());
}(this, (function () { 'use strict';

    var hooks = {};

    var _isSupported = (
        typeof window !== 'undefined' &&
        window.document &&
        window.document.nodeType === 9
    );

    function createDOMPurify(window) {
        var DOMPurify = function(root) {
            return createDOMPurify(root);
        };

        DOMPurify.version = '2.3.8';

        DOMPurify.removed = [];

        if (!_isSupported) {
            DOMPurify.isSupported = false;
            return DOMPurify;
        }

        var document = window.document;
        var DocumentFragment = window.DocumentFragment,
            HTMLTemplateElement = window.HTMLTemplateElement,
            Node = window.Node,
            Element = window.Element,
            NodeFilter = window.NodeFilter,
            _window$NamedNodeMap = window.NamedNodeMap,
            NamedNodeMap = _window$NamedNodeMap === void 0 ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
            _window$HTMLFormEleme = window.HTMLFormElement,
            HTMLFormElement = _window$HTMLFormEleme === void 0 ? window.HTMLFormElement : _window$HTMLFormEleme,
            _window$DOMParser = window.DOMParser,
            DOMParser = _window$DOMParser === void 0 ? window.DOMParser : _window$DOMParser,
            _window$TrustedTypes = window.TrustedTypes,
            TrustedTypes = _window$TrustedTypes === void 0 ? window.TrustedTypes : _window$TrustedTypes;

        var Element_prototype_hasAttribute = Element.prototype.hasAttribute;
        var Element_prototype_getAttribute = Element.prototype.getAttribute;
        var Element_prototype_setAttribute = Element.prototype.setAttribute;
        var Element_prototype_removeAttribute = Element.prototype.removeAttribute;

        var Node_prototype_cloneNode = Node.prototype.cloneNode;
        var Node_prototype_getRootNode = Node.prototype.getRootNode;
        var Node_prototype_contains = Node.prototype.contains;

        var textContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
        var removeChild = Object.getOwnPropertyDescriptor(Node.prototype, 'removeChild');
        var outerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML');

        var importNode = document.importNode;

        var documentMode = document.documentMode ? document.documentMode : {};

        var isIE = !DOMPurify.isSupported || documentMode <= 11;

        var MUSTACHE_EXPRESSION = /\{\{[\s\S]*|[\s\S]*\}\}/gm;
        var DATA_ATTR = /^data-[\w.\u00B7-\uFFFF-]/;
        var ARIA_ATTR = /^aria-[\w-]/;
        var IS_ALLOWED_URI = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;
        var IS_SCRIPT_OR_DATA = /^(?:\w+script|data):/i;
        var ATTR_VALUE_BLACK_LIST = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g;

        var formElement = document.createElement('form');

        var policy = null;
        var trustedTypes = TrustedTypes;

        if (typeof trustedTypes !== 'undefined' && trustedTypes.createPolicy) {
            policy = trustedTypes.createPolicy('dompurify', {
                createHTML: function(html) {
                    return html;
                }
            });
        }

        DOMPurify.addHook = function(entry, hook) {
            if (typeof hook === 'function') {
                hooks[entry] = hooks[entry] || [];
                hooks[entry].push(hook);
            }
        };

        DOMPurify.removeHook = function(entry) {
            if (hooks[entry]) {
                hooks[entry].pop();
            }
        };

        DOMPurify.removeHooks = function(entry) {
            if (hooks[entry]) {
                hooks[entry] = [];
            }
        };

        DOMPurify.removeAllHooks = function() {
            hooks = {};
        };

        DOMPurify.sanitize = function(dirty, cfg) {
            var body, clonedNode, currentNode, documentFragment, i, node, nodeName, nodeValue, oldNode, ret, rootNode, tagName, template, treeWalker, trustedHTML, parent, walker, _document = document,
                _Node = Node,
                _NodeFilter = NodeFilter;

            if (!DOMPurify.isSupported) {
                return dirty;
            }

            if (!cfg) {
                cfg = {};
            }

            if (dirty === null || typeof dirty === 'undefined') {
                return null;
            }

            if (typeof dirty !== 'string') {
                dirty = String(dirty);
            }

            if (dirty === '') {
                return '';
            }

            if (typeof policy === 'object') {
                trustedHTML = policy.createHTML(dirty);
            } else {
                trustedHTML = dirty;
            }

            if (isIE) {
                body = _document.createElement('body');
                body.innerHTML = trustedHTML;
                rootNode = body;
            } else if (cfg.FORCE_BODY) {
                body = _document.createElement('body');
                body.innerHTML = trustedHTML;
                rootNode = body;
            } else if (/<(?:body|html|head|title|meta)[^>]*>/i.test(trustedHTML)) {
                var domParser = new DOMParser();
                try {
                    documentFragment = domParser.parseFromString(trustedHTML, 'text/html');
                } catch (e) {
                    documentFragment = null;
                }
                if (documentFragment && documentFragment.body) {
                    rootNode = documentFragment.body.cloneNode(true);
                } else {
                    rootNode = _document.createElement('body');
                    rootNode.innerHTML = trustedHTML;
                }
            } else {
                template = _document.createElement('template');
                template.innerHTML = trustedHTML;
                rootNode = template.content.cloneNode(true);
            }

            if (!rootNode) {
                return '';
            }

            treeWalker = _document.createTreeWalker(rootNode, _NodeFilter.SHOW_ELEMENT | _NodeFilter.SHOW_TEXT, null, false);

            var nodes = [];
            while (currentNode = treeWalker.nextNode()) {
                nodes.push(currentNode);
            }

            for (i = 0; i < nodes.length; i++) {
                node = nodes[i];
                if (node.nodeType === _Node.TEXT_NODE) {
                    nodeValue = node.nodeValue.replace(ATTR_VALUE_BLACK_LIST, ' ');
                    if (nodeValue !== node.nodeValue) {
                        node.nodeValue = nodeValue;
                    }
                    continue;
                }
                nodeName = node.nodeName.toLowerCase();
                if (cfg.FORBID_TAGS && cfg.FORBID_TAGS.indexOf(nodeName) > -1 || cfg.ADD_TAGS && cfg.ADD_TAGS.indexOf(nodeName) === -1 && (cfg.ALLOWED_TAGS && cfg.ALLOWED_TAGS.indexOf(nodeName) === -1 || !cfg.ALLOWED_TAGS)) {
                    DOMPurify.removed.push({
                        element: node
                    });
                    removeChild.call(node.parentNode, node);
                    continue;
                }
                var attributes = NamedNodeMap.prototype.isPrototypeOf(node.attributes) ? [].slice.call(node.attributes) : [];
                for (var j = 0; j < attributes.length; j++) {
                    var attribute = attributes[j];
                    var attributeName = attribute.name,
                        attributeValue = attribute.value;
                    var lcAttributeName = attributeName.toLowerCase();
                    if (cfg.FORBID_ATTR && cfg.FORBID_ATTR.indexOf(lcAttributeName) > -1 || cfg.ADD_ATTR && cfg.ADD_ATTR.indexOf(lcAttributeName) === -1 && (cfg.ALLOWED_ATTR && cfg.ALLOWED_ATTR.indexOf(lcAttributeName) === -1 || !cfg.ALLOWED_ATTR) || MUSTACHE_EXPRESSION.test(attributeValue) || lcAttributeName === 'src' && IS_SCRIPT_OR_DATA.test(attributeValue) || lcAttributeName === 'href' && IS_SCRIPT_OR_DATA.test(attributeValue) || lcAttributeName === 'background' && IS_SCRIPT_OR_DATA.test(attributeValue) || lcAttributeName === 'action' && IS_SCRIPT_OR_DATA.test(attributeValue) || lcAttributeName === 'formaction' && IS_SCRIPT_OR_DATA.test(attributeValue)) {
                        Element_prototype_removeAttribute.call(node, attributeName);
                    }
                }
            }

            if (typeof outerHTML.get === 'function') {
                ret = outerHTML.get.call(rootNode);
            } else {
                ret = new window.XMLSerializer().serializeToString(rootNode);
            }

            if (cfg.FORCE_BODY) {
                ret = ret.replace(/^<body/, '<div').replace(/<\/body>$/, '</div>');
            }

            if (cfg.WHOLE_DOCUMENT) {
                ret = '<!DOCTYPE html><html><head><title></title></head><body>' + ret + '</body></html>';
            }

            return ret;
        };

        DOMPurify.isSupported = _isSupported;

        return DOMPurify;
    }

    return createDOMPurify(typeof window === 'undefined' ? null : window);
})));`;
