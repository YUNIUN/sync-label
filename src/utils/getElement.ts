import { isString, isElement } from "lodash-es";

export function getElement(selector: string | Element): Element | null {
    if (isString(selector)) {
        if (!selector.trim()) {
            return null;
        }
        try {
            return document.querySelector(selector);
        } catch (error) {
            return null;
        }
    }
    if (isElement(selector)) {
        return selector;
    }
    return null;
}