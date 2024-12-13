import { Plugin } from 'ckeditor5/src/core';
import { toWidget } from "ckeditor5/src/widget";

export default class IframeEmbedEditing extends Plugin {
  init() {
    this._defineSchema();
    this._defineConverters();
  }

  _defineSchema() {
    const { schema } = this.editor.model;
    schema.register("iframeEmbed", {
      allowWhere: "$inlineObject",
      isObject: true,
      isInline: true,
      allowAttributes: ["align", "frameborder", "height", "width", "longdesc", "name", "scrolling", "src", "tabindex", "title"],
    });
  }

  _defineConverters() {
    const { conversion, model } = this.editor;

    model.schema.getDefinition("iframeEmbed").allowAttributes.forEach((attribute) => {
      conversion.attributeToAttribute({
        model: {
          name: "iframeEmbed",
          key: attribute
        },
        view: attribute
      })
    })

    conversion.for("upcast").elementToElement({
      model: "iframeEmbed",
      view: {
        name: "iframe",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "iframeEmbed",
      view: {
        name: "iframe",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "iframeEmbed",
      view: (modelElement, { writer }) => {
        const container = writer.createContainerElement("iframe");
        writer.setCustomProperty("iframe-emb", true, container);
        return toWidget(container, writer, { label: "Iframe Embed" });
      },
    });

  }
}
