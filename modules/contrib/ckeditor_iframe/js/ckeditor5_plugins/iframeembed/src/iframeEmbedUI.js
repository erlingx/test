import { Plugin } from "ckeditor5/src/core";
import {ButtonView, ContextualBalloon, clickOutsideHandler} from "ckeditor5/src/ui";
import IframeEmbedFormView from "./iframeEmbedFormView"
import icon from "../../../../icons/iframe.svg";

export default class IframeEmbedUI extends Plugin {
  static get requires() {
    return [ ContextualBalloon ];
  }
  init() {
    const editor = this.editor;

    // Create the balloon and the form view.
    this._balloon = this.editor.plugins.get( ContextualBalloon );
    this.formView = this._createFormView();

    editor.ui.componentFactory.add('iframeEmbed', (locale) => {
      const button = new ButtonView(locale);
      button.set({
        label: editor.t("Iframe Embed"),
        icon,
        tooltip: true,
      });

      // Execute a callback function when the button is clicked.
      button.on('execute', () => {
        this._showUI();
      });

      if (editor.plugins.has('SourceEditing')) {
        const plugin = editor.plugins.get('SourceEditing');
        button.bind('isEnabled').to(plugin, 'isSourceEditingMode', isSourceEditingMode => !isSourceEditingMode);
      }

      return button;
    })
  }

  _createFormView() {
    const { model,  locale} = this.editor;
    const formView = new IframeEmbedFormView( locale, this.editor );

    // Create an iframe element when the form is submitted.
    this.listenTo( formView, 'submit', () => {
      model.change((writer) => {
        let attrs = {};
        attrs['src'] = formView.src.fieldView.element.value ?? null;
        ['width', 'height', 'name', 'title', 'longdesc'].forEach((attr) => {
          if (formView[attr] && formView[attr].fieldView.element.value) {
            attrs[attr] = formView[attr].fieldView.element.value;
          }
        });
        if (formView['scrolling'] && formView['scrolling'].isOn) {
          attrs['scrolling'] = 'yes';
        }
        if (formView['frameborder'] && formView['frameborder'].isOn) {
          attrs['frameborder'] = 1;
        }
        if (formView['tabindex'] && formView['tabindex'].isOn) {
          attrs['tabindex'] = -1;
        }
        if (formView['align']) {
          attrs['align'] = formView['align'];
        }

        const iframe = writer.createElement('iframeEmbed', attrs);
        model.insertContent(iframe);
      });
      this._hideUI();
    } );

    // Hide the form view after clicking the "Cancel" button.
    this.listenTo( formView, 'cancel', () => {
      this._hideUI();
    } );

    // Hide the form view when clicking outside the balloon.
    clickOutsideHandler( {
      emitter: formView,
      activator: () => this._balloon.visibleView === formView,
      contextElements: [ this._balloon.view.element ],
      callback: () => this._hideUI()
    } );

    return formView;
  }

  _hideUI() {
    ['src', 'width', 'height', 'name', 'title', 'longdesc'].forEach((attr) => {
      if (this.formView[attr]) {
        this.formView[attr].fieldView.element.value = null;
      }
    });
    ['scrolling', 'frameborder', 'tabindex'].forEach((attr) => {
      if (this.formView[attr]) {
        this.formView[attr].isOn = false;
      }
    });

    this.formView.element.reset();
    this._balloon.remove( this.formView );

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

  _showUI() {
    this._balloon.add( {
      view: this.formView,
      position: this._getBalloonPositionData()
    } );

    this.formView.focus();
  }
}
