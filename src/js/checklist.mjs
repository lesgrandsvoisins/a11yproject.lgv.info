/* jshint esversion: 5 */

/** Used to check whether a given Element could match
 * by a DOM selector.
 * @see processChecklistClick
 */
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector;
}

/**
 * If someone opens the checklist page using a checklist item's "Share link" (ex: a11yproject.com/checklist/#validate-your-html) the item with the corresponding id will scroll into view. Then, if JS is enabled, this function will open its associated <details> element
 */
function openLinkedCheckListItem() {
    const hash = globalThis.location.hash.substr(1);
    const checklistItem =
        hash.length > 0 &&
        document.querySelector('[data-checklist-item-id="' + hash + '"]');

    if (checklistItem) {
        checklistItem.setAttribute("open", true);
    }
}
// Store checklist status ---------------------------------------------------
function storeChecklistItem(checkboxId) {
    localStorage.setItem(checkboxId, 'checked');
}

function removeChecklistItem(checkboxId) {
    localStorage.removeItem(checkboxId);
}

function processChecklistClick(checkboxSelector) {
    document.addEventListener("change", function(event) {
        const target = event.target;

        if (!target.matches(checkboxSelector)) {
            return;
        }

        if (target.checked) {
            storeChecklistItem(target.id);
        } else {
            removeChecklistItem(target.id);
        }
    });
}

function populateChecklistFromLocalStorage(checkboxSelector) {
    const items = document.querySelectorAll(checkboxSelector);
    const length = items.length;
    for (var i = 0; i < length; ++i) {
        const checkboxElement = items[i];
        checkboxElement.checked =
            localStorage.getItem(checkboxElement.id) === "checked";
    }
}

function processChecklist() {
    const checkboxSelector = '.c-checklist__checkbox input[type="checkbox"]';

    populateChecklistFromLocalStorage(checkboxSelector);
    processChecklistClick(checkboxSelector);
}

openLinkedCheckListItem();
processChecklist();