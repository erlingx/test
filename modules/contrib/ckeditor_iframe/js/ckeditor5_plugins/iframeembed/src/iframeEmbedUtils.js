import {isWidget} from "ckeditor5/src/widget";

/**
 * Checks if the provided model element is `iframeEmbed`.
 *
 * @param {module:engine/model/element~Element} modelElement
 *   The model element to be checked.
 * @return {boolean}
 *   A boolean indicating if the element is a iframeEmbed element.
 *
 * @private
 */
export function isIframeEmbed(modelElement) {
  return !!modelElement && modelElement.is('element', 'iframeEmbed');
}

/**
 * Checks if view element is <iframeEmbed> element.
 *
 * @param {module:engine/view/element~Element} viewElement
 *   The view element.
 * @return {boolean}
 *   A boolean indicating if the element is a <iframeEmbed> element.
 *
 * @private
 */
export function isIframeEmbedWidget(viewElement) {
  return isWidget(viewElement) && !!viewElement.getCustomProperty('iframe-emb');
}

/**
 * Gets `iframeEmbed` element from selection.
 *
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 *   The current selection.
 * @return {module:engine/model/element~Element|null}
 *   The `iframeEmbed` element which could be either the current selected an
 *   ancestor of the selection. Returns null if the selection has no Iframe
 *   Embed element.
 *
 * @private
 */
export function getClosestSelectedIframeEmbedElement(selection) {
  const selectedElement = selection.getSelectedElement();

  return isIframeEmbed(selectedElement)
    ? selectedElement
    : selection.getFirstPosition().findAncestor('iframeEmbed');
}

/**
 * Gets selected IframeEmbed widget if only iframeEmbed is currently selected.
 *
 * @param {module:engine/model/selection~Selection} selection
 *   The current selection.
 * @return {module:engine/view/element~Element|null}
 *   The currently selected Grid widget or null.
 *
 * @private
 */
export function getClosestSelectedIframeEmbedWidget(selection) {
    const viewElement = selection.getSelectedElement();

    if (viewElement && isIframeEmbedWidget(viewElement)) {
      return viewElement;
    }

    let { parent } = selection.getFirstPosition();

    while (parent) {
    if (parent.is("element") && isIframeEmbedWidget(parent)) {
      return parent;
    }
    parent = parent.parent;
  }

  return null;
}
