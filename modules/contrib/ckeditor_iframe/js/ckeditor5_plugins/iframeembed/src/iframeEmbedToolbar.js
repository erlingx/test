import { icons, Plugin } from "ckeditor5/src/core";
import { WidgetToolbarRepository } from "ckeditor5/src/widget";
import {
  ButtonView,
  clickOutsideHandler,
  ContextualBalloon
} from "ckeditor5/src/ui";
import IframeEmbedFormView from "./iframeEmbedFormView";
import {
  getClosestSelectedIframeEmbedElement,
  getClosestSelectedIframeEmbedWidget,
} from "./iframeEmbedUtils";

/**
 * @private
 */
export default class IframeEmbedToolbar extends Plugin {
  /**
   * @inheritdoc
   */
  static get requires() {
    return [WidgetToolbarRepository, ContextualBalloon];
  }

  /**
   * @inheritdoc
   */
  static get pluginName() {
    return "IframeEmbedToolbar";
  }

  /**
   * @inheritdoc
   */
  init() {
    const { editor } = this;

    // Create the balloon and the form view.
    this._balloon = this.editor.plugins.get(ContextualBalloon);

    editor.ui.componentFactory.add("iframeEmbEdit", (locale) => {
      const buttonView = new ButtonView(locale);
      buttonView.set({
        label: editor.t("Edit Iframe"),
        icon: icons.pencil,
        tooltip: true,
        withText: true,
      });

      this.listenTo(buttonView, "execute", () => {
        const { selection } = editor.model.document;
        const selectedIframe = getClosestSelectedIframeEmbedElement(selection);

        if (selectedIframe) {
          this._showUI(this._createFormView(selectedIframe));
        }
      });

      return buttonView;
    });
  }

  /**
   * @inheritdoc
   */
  afterInit() {
    const { editor } = this;
    const widgetToolbarRepository = editor.plugins.get(
      "WidgetToolbarRepository"
    );

    widgetToolbarRepository.register("iframeEmbed", {
      items: ["iframeEmbEdit"],
      // Get the selected iframe.
      getRelatedElement: (selection) => {
        return getClosestSelectedIframeEmbedWidget(selection);
      }
    });
  }

  /**
   * @param {module:engine/model/element~Element} modelElement
   */
  _createFormView(modelElement) {
    const { model, locale } = this.editor;
    const formView = new IframeEmbedFormView(locale, this.editor);

    // Set values on the form from the model.
    formView['src'].fieldView.value = modelElement.getAttribute('src');
    ['width', 'height', 'name', 'title', 'longdesc'].forEach((attr) => {
      if (formView[attr]) {
        formView[attr].fieldView.value = modelElement.getAttribute(attr);
      }
    });
    if (formView['scrolling']) {
      formView['scrolling'].isOn = modelElement.getAttribute('scrolling') === 'yes';
    }
    if (formView['frameborder']) {
      formView['frameborder'].isOn = modelElement.getAttribute('frameborder') === 1;
    }
    if (formView['tabindex']) {
      formView['tabindex'].isOn = modelElement.getAttribute('tabindex') === -1;
    }
    if (formView['align']) {
      formView['align'] = modelElement.getAttribute('align');
    }

    // Update the model when the form is submitted.
    this.listenTo(formView, 'submit', () => {
      model.change((writer) => {
        writer.setAttribute('src', formView.src.fieldView.element.value ?? null, modelElement);
        ['width', 'height', 'name', 'title', 'longdesc'].forEach((attr) => {
          if (formView[attr]) {
            if (formView[attr].fieldView.element.value) {
              writer.setAttribute(attr, formView[attr].fieldView.element.value, modelElement);
            }
            else {
              writer.removeAttribute(attr, modelElement);
            }
          }
        });
        if (formView['scrolling']) {
          if (formView['scrolling'].isOn) {
            writer.setAttribute('scrolling', 'yes', modelElement);
          }
          else {
            writer.removeAttribute('scrolling', modelElement);
          }
        }
        if (formView['frameborder']) {
          if (formView['frameborder'].isOn) {
            writer.setAttribute('frameborder', 1, modelElement);
          }
          else {
            writer.removeAttribute('frameborder', modelElement);
          }
        }
        if (formView['tabindex']) {
          if (formView['tabindex'].isOn) {
            writer.setAttribute('tabindex', -1, modelElement);
          }
          else {
            writer.removeAttribute('tabindex', modelElement);
          }
        }
        if (formView['align']) {
          writer.setAttribute('align', formView['align'], modelElement);
        }
        else {
          writer.removeAttribute('align', modelElement);
        }
      });
      this._hideUI(formView);
    });

    // Hide the form view after clicking the "Cancel" button.
    this.listenTo(formView, 'cancel', () => {
      this._hideUI(formView);
    });

    // Hide the form view when clicking outside the balloon.
    clickOutsideHandler({
      emitter: formView,
      activator: () => this._balloon.visibleView === formView,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI(formView)
    });

    return formView;
  }

  /**
   * @param {IframeEmbedFormView} formView
   */
  _hideUI(formView) {
    this._balloon.remove(formView);
    formView.destroy();

    // Focus the editing view after closing the form view.
    this.editor.editing.view.focus();
  }

  _getBalloonPositionData() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;
    let target = null;

    // Set a target position by converting view selection range to DOM.
    target = () => view.domConverter.viewRangeToDom(
      viewDocument.selection.getFirstRange()
    );

    return {
      target
    };
  }

  /**
   * @param {IframeEmbedFormView} formView
   */
  _showUI(formView) {
    this._balloon.add({
      view: formView,
      position: this._getBalloonPositionData()
    });

    formView.focus();
  }

}
