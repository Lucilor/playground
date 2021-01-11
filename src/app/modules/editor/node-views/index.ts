import CodeBlockView from "./code-mirror";
import {Node as ProsemirrorNode} from "prosemirror-model";
import {EditorView} from "prosemirror-view";

export const nodeViews = {
    code_block: (node: ProsemirrorNode, view: EditorView, getPos: () => number) => new CodeBlockView(node, view, getPos)
};
