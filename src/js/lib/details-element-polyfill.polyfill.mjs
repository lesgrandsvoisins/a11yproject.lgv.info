/*
Details Element Polyfill 2.4.0
Copyright © 2019 Javan Makhmali
 */
(function() {
    "use strict";
    const element = document.createElement("details");
    const elementIsNative = typeof HTMLDetailsElement != "undefined" && element instanceof HTMLDetailsElement;
    const support = {
        open: "open" in element || elementIsNative,
        toggle: "ontoggle" in element
    };
    const styles = '\ndetails, summary {\n  display: block;\n}\ndetails:not([open]) > *:not(summary) {\n  display: none;\n}\nsummary::before {\n  content: "►";\n  padding-right: 0.3rem;\n  font-size: 0.6rem;\n  cursor: default;\n}\n[open] > summary::before {\n  content: "▼";\n}\n';
    const _ref = [],
        forEach = _ref.forEach,
        slice = _ref.slice;
    if (!support.open) {
        polyfillStyles();
        polyfillProperties();
        polyfillToggle();
        polyfillAccessibility();
    }
    if (support.open && !support.toggle) {
        polyfillToggleEvent();
    }

    function polyfillStyles() {
        document.head.insertAdjacentHTML("afterbegin", "<style>" + styles + "</style>");
    }

    function polyfillProperties() {
        const prototype = document.createElement("details").constructor.prototype;
        const setAttribute = prototype.setAttribute,
            removeAttribute = prototype.removeAttribute;
        const open = Object.getOwnPropertyDescriptor(prototype, "open");
        Object.defineProperties(prototype, {
            open: {
                get: function get() {
                    if (this.tagName == "DETAILS") {
                        return this.hasAttribute("open");
                    } else {
                        if (open && open.get) {
                            return open.get.call(this);
                        }
                    }
                },
                set: function set(value) {
                    if (this.tagName == "DETAILS") {
                        return value ? this.setAttribute("open", "") : this.removeAttribute("open");
                    } else {
                        if (open && open.set) {
                            return open.set.call(this, value);
                        }
                    }
                }
            },
            setAttribute: {
                value: function value(name, _value) {
                    const _this = this;
                    const call = function call() {
                        return setAttribute.call(_this, name, _value);
                    };
                    if (name == "open" && this.tagName == "DETAILS") {
                        const wasOpen = this.hasAttribute("open");
                        const result = call();
                        if (!wasOpen) {
                            const summary = this.querySelector("summary");
                            if (summary) summary.setAttribute("aria-expanded", true);
                            triggerToggle(this);
                        }
                        return result;
                    }
                    return call();
                }
            },
            removeAttribute: {
                value: function value(name) {
                    const _this2 = this;
                    const call = function call() {
                        return removeAttribute.call(_this2, name);
                    };
                    if (name == "open" && this.tagName == "DETAILS") {
                        const wasOpen = this.hasAttribute("open");
                        const result = call();
                        if (wasOpen) {
                            const summary = this.querySelector("summary");
                            if (summary) summary.setAttribute("aria-expanded", false);
                            triggerToggle(this);
                        }
                        return result;
                    }
                    return call();
                }
            }
        });
    }

    function polyfillToggle() {
        onTogglingTrigger(function(element) {
            element.hasAttribute("open") ? element.removeAttribute("open") : element.setAttribute("open", "");
        });
    }

    function polyfillToggleEvent() {
        if (globalThis.MutationObserver) {
            new MutationObserver(function(mutations) {
                forEach.call(mutations, function(mutation) {
                    const target = mutation.target,
                        attributeName = mutation.attributeName;
                    if (target.tagName == "DETAILS" && attributeName == "open") {
                        triggerToggle(target);
                    }
                });
            }).observe(document.documentElement, {
                attributes: true,
                subtree: true
            });
        } else {
            onTogglingTrigger(function(element) {
                const wasOpen = element.getAttribute("open");
                setTimeout(function() {
                    const isOpen = element.getAttribute("open");
                    if (wasOpen != isOpen) {
                        triggerToggle(element);
                    }
                }, 1);
            });
        }
    }

    function polyfillAccessibility() {
        setAccessibilityAttributes(document);
        if (globalThis.MutationObserver) {
            new MutationObserver(function(mutations) {
                forEach.call(mutations, function(mutation) {
                    forEach.call(mutation.addedNodes, setAccessibilityAttributes);
                });
            }).observe(document.documentElement, {
                subtree: true,
                childList: true
            });
        } else {
            document.addEventListener("DOMNodeInserted", function(event) {
                setAccessibilityAttributes(event.target);
            });
        }
    }

    function setAccessibilityAttributes(root) {
        findElementsWithTagName(root, "SUMMARY").forEach(function(summary) {
            const details = findClosestElementWithTagName(summary, "DETAILS");
            summary.setAttribute("aria-expanded", details.hasAttribute("open"));
            if (!summary.hasAttribute("tabindex")) summary.setAttribute("tabindex", "0");
            if (!summary.hasAttribute("role")) summary.setAttribute("role", "button");
        });
    }

    function eventIsSignificant(event) {
        return !(event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.target.isContentEditable);
    }

    function onTogglingTrigger(callback) {
        addEventListener("click", function(event) {
            if (eventIsSignificant(event)) {
                if (event.which <= 1) {
                    const element = findClosestElementWithTagName(event.target, "SUMMARY");
                    if (element && element.parentNode && element.parentNode.tagName == "DETAILS") {
                        callback(element.parentNode);
                    }
                }
            }
        }, false);
        addEventListener("keydown", function(event) {
            if (eventIsSignificant(event)) {
                if (event.keyCode == 13 || event.keyCode == 32) {
                    const element = findClosestElementWithTagName(event.target, "SUMMARY");
                    if (element && element.parentNode && element.parentNode.tagName == "DETAILS") {
                        callback(element.parentNode);
                        event.preventDefault();
                    }
                }
            }
        }, false);
    }

    function triggerToggle(element) {
        const event = document.createEvent("Event");
        event.initEvent("toggle", false, false);
        element.dispatchEvent(event);
    }

    function findElementsWithTagName(root, tagName) {
        return (root.tagName == tagName ? [root] : []).concat(typeof root.getElementsByTagName == "function" ? slice.call(root.getElementsByTagName(tagName)) : []);
    }

    function findClosestElementWithTagName(element, tagName) {
        if (typeof element.closest == "function") {
            return element.closest(tagName);
        } else {
            while (element) {
                if (element.tagName == tagName) {
                    return element;
                } else {
                    element = element.parentNode;
                }
            }
        }
    }
})();