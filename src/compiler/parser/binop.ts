import { BinOp as BinOpNode, Node } from "../ast/nodes";
import { ParseHandler, ParsingContext } from "./core";

export class ParseHandler_BinOp extends ParseHandler<BinOpNode> {
    precedingNode: Node;

    constructor(context: ParsingContext) {
        super(context);
        this.precedingNode = context.currentNode;
    }

    atExit() {
        
    }
}