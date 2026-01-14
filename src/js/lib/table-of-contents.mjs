/**
 * Allow the open/closed state of table-of-contents disclosures to persist.
 * Adapted from tableOfContents.js by Chris Ferdinandi.
 * @see: http://github.com/cferdinandi/table-of-contents
 */
(function() {
    const toc = document.querySelector("[data-toc]");
    const tocDisclosure = toc !== null && toc.parentNode;
    const enableTOCPersistence =
        "localStorage" in window &&
        toc !== null &&
        tocDisclosure.nodeName === "DETAILS";

    if (!enableTOCPersistence) {
        return;
    }

    const idleCallbackAvailable = "requestIdleCallback" in window;
    const tocKey = location.pathname;
    const tocState = [];
    const localStorageKey = "TOCState";

    /**
     * Writes the TOC state to localStorage
     */
    const writeTOCState = function() {
        const writeToStorage = function() {
            localStorage.setItem(localStorageKey, JSON.stringify(tocState));
        };

        // localStorage is a synchronous API that can block the main thread. If
        // requestIdleCallback is available, use that to defer writes to a period of
        // time in which the main thread is idle.
        if (idleCallbackAvailable) {
            return requestIdleCallback(writeToStorage);
        } else {
            return writeToStorage();
        }
    };
    /**
     * Gets the initial state of the TOC
     */
    const initTOCPersistence = function() {
        // Get the TOC state from local storage
        initialTOCState = localStorage.getItem(localStorageKey);

        // Bind the toggle event on the TOC <details> element
        bindTOCToggle();

        // Check if there was a previous entry
        // if (initialTOCState !== null) {
        //     tocState = JSON.parse(initialTOCState);
        // }

        if (tocState.indexOf(tocKey) !== -1) {
            tocDisclosure.removeAttribute("open");
        }
    };

    /**
     * Adds an event listener to the TOC if localStorage is available
     */
    const bindTOCToggle = function() {
        tocDisclosure.addEventListener("toggle", function(event) {
            openState = event.target.getAttribute("open") === "";

            // We only check for the presence of the current page (tocKey) in the
            // tocState array to determine if the ToC needs to be closed, because the
            // default state for a ToC is to be open. The presence of the tocKey in
            // the array means the ToC has been shut.
            if (!openState) {
                if (tocState.indexOf(tocKey) === -1) {
                    tocState.push(tocKey);
                }
            } else {
                const index = tocState.indexOf(tocKey);

                if (index > -1) {
                    tocState.splice(index, 1);
                }
            }

            writeTOCState(tocState);
        });
    };

    // Intialize ToC persistence
    initTOCPersistence();
})();
