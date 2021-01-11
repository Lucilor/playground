import {inputRules, wrappingInputRule, textblockTypeInputRule, smartQuotes, emDash, ellipsis, InputRule} from "prosemirror-inputrules";
import {NodeType, Schema} from "prosemirror-model";
import {Plugin} from "prosemirror-state";

// Source: https://github.com/ProseMirror/prosemirror-example-setup/

// : (NodeType) → InputRule
// Given a blockquote node type, returns an input rule that turns `"> "`
// at the start of a textblock into a blockquote.
export const blockQuoteRule = (nodeType: NodeType): InputRule => wrappingInputRule(/^\s*>\s$/, nodeType);
// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
export const orderedListRule = (nodeType: NodeType): InputRule =>
    wrappingInputRule(
        /^(\d+)\.\s$/,
        nodeType,
        (match: any) => ({order: +match[1]}),
        (match: any, node: any) => node.childCount + node.attrs.order === +match[1]
    );
// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
export const bulletListRule = (nodeType: NodeType): InputRule => wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
// : (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
export const codeBlockRule = (nodeType: NodeType): InputRule => textblockTypeInputRule(/^```$/, nodeType);

// : (NodeType, number) → InputRule
// Given a node type and a maximum level, creates an input rule that
// turns up to that number of `#` characters followed by a space at
// the start of a textblock into a heading whose level corresponds to
// the number of `#` signs.
export const headingRule = (nodeType: NodeType, maxLevel: number): InputRule =>
    textblockTypeInputRule(new RegExp("^(#{1," + maxLevel + "})\\s$"), nodeType, (match) => ({level: match[1].length}));
// : (Schema) → Plugin
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
export const buildInputRules = (schema: Schema): Plugin => {
    const rules = smartQuotes.concat(ellipsis, emDash);

    rules.push(blockQuoteRule(schema.nodes.blockquote));
    rules.push(orderedListRule(schema.nodes.ordered_list));
    rules.push(bulletListRule(schema.nodes.bullet_list));
    rules.push(codeBlockRule(schema.nodes.code_block));
    rules.push(headingRule(schema.nodes.heading, 6));

    return inputRules({rules});
};