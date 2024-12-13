import { Model, View, LabeledFieldView, createLabeledInputText, createLabeledInputNumber, ButtonView, submitHandler, createDropdown, addListToDropdown, SwitchButtonView } from "ckeditor5/src/ui";
import { Collection } from "ckeditor5/src/utils";
import { icons } from 'ckeditor5/src/core';

export default class IframeEmbedFormView extends View {
  constructor( locale, editor ) {
    super( locale );

    let childViews = [];
    this.src = this._createInput("URL");
    childViews.push(this.src);

    if (this._attrIsEnabled(editor, 'name')) {
      this.name = this._createInput("Name");
      childViews.push(this.name);
    }
    if (this._attrIsEnabled(editor, 'width')) {
      this.width = this._createInput("Width", true);
      childViews.push(this.width);
    }
    if (this._attrIsEnabled(editor, 'height')) {
      this.height = this._createInput("Height", true);
      childViews.push(this.height);
    }
    if (this._attrIsEnabled(editor, 'title')) {
      this.title = this._createInput("Advisory Title");
      childViews.push(this.title);
    }
    if (this._attrIsEnabled(editor, 'longdesc')) {
      this.longdesc = this._createInput("Long Description");
      childViews.push(this.longdesc);
    }
    if (this._attrIsEnabled(editor, 'align')) {
      this.alignDropdown = this._createDropdown("Add align", ["None", "Left", "Right", "Top", "Middle", "Bottom"]);
      this.align = null;
      this.listenTo( this.alignDropdown, 'execute', evt => {
        const choice = evt.source.element.textContent;
        this.alignDropdown.buttonView.label = `Align ${ choice }`;
        this.align = (choice === 'None') ? null : choice.toLowerCase();
      } );
      childViews.push(this.alignDropdown);
    }
    if (this._attrIsEnabled(editor, 'scrolling')) {
      this.scrolling = this._createSwitch("Enable scrollbars");
      childViews.push(this.scrolling);
    }
    if (this._attrIsEnabled(editor, 'frameborder')) {
      this.frameborder = this._createSwitch("Show frame border");
      childViews.push(this.frameborder);
    }
    if (this._attrIsEnabled(editor, 'tabindex')) {
      this.tabindex = this._createSwitch("Remove from tabindex");
      childViews.push(this.tabindex);
    }

    this.saveButtonView = this._createButton(
      'Save', icons.check, 'ck-button-save'
    );
    // Set the type to 'submit', which will trigger
    // the submit event on entire form when clicked.
    this.saveButtonView.type = 'submit';
    childViews.push(this.saveButtonView);

    this.cancelButtonView = this._createButton(
      'Cancel', icons.cancel, 'ck-button-cancel'
    );
    childViews.push(this.cancelButtonView);

    // Delegate ButtonView#execute to FormView#cancel.
    this.cancelButtonView.delegate( 'execute' ).to( this, 'cancel' );

    this.children = this.createCollection(childViews);

    this.setTemplate( {
      tag: 'form',
      attributes: {
        class: [ 'ck', 'ck-iframe-embed-form' ],
        tabindex: '-1'
      },
      children: this.children
    } );
  }

  render() {
    super.render();

    // Submit the form when the user clicked the save button
    // or pressed enter in the input.
    submitHandler( {
      view: this
    } );
  }

  focus() {
    this.children.first.focus();
  }

  // Create input
  _createInput(label, isNumber = false) {
    const labeledInput = new LabeledFieldView(
      this.locale,
      isNumber ? createLabeledInputNumber : createLabeledInputText
    );
    labeledInput.label = label;

    return labeledInput;
  }

  // Create button
  _createButton( label, icon = false, className = false ) {
    const button = new ButtonView();

    button.set( {
      label,
      icon,
      tooltip: true,
      class: className
    } );

    return button;
  }

  // Create dropdown
  _createDropdown(label, options) {
    const dropdown = createDropdown(this.locale);
    const labelButton = {
      label,
      withText: true
    };

    dropdown.buttonView.set( labelButton );

    const items = new Collection();

    options.forEach( option => {
      const buttonObject = {
        type: 'button',
        text: option,
        model: new Model( {
          label: option,
          withText: true
        } )
      };

      items.add( buttonObject );
    } );

    addListToDropdown( dropdown, items );

    dropdown.render();

    return dropdown;
  }

  _createSwitch(label) {
    const switchButton = new SwitchButtonView();

    switchButton.set( {
      label: label,
      withText: true,
      isOn: false
    } );

    switchButton.on( 'execute', () => { switchButton.isOn = !switchButton.isOn } );

    return switchButton;
  }

  _attrIsEnabled(editor, attr) {
    return editor.config.get('iframe').enabled_optional_attributes.includes(attr);
  }
}
