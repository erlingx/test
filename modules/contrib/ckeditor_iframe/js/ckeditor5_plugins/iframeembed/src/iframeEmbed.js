import { Plugin } from "ckeditor5/src/core";
import IframeEmbedUI from "./iframeEmbedUI";
import IframeEmbedEditing from "./iframeEmbedEditing";
import IframeEmbedToolbar from "./iframeEmbedToolbar";
import './theme/iframe.css';

export default class IframeEmbed extends Plugin {
  static get requires() {
    return [ IframeEmbedEditing, IframeEmbedUI, IframeEmbedToolbar ];
  }
}
