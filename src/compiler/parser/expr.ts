import { Node } from "../ast/nodes";
import { TokenType } from "../tokenizer/token";
import { ParseHandler, ParsingContext } from "./core";

export class ParseHandler_Expression extends ParseHandler<Node> {
    atExit() {
        if (!this.currentNode) this.throwParseError("?");
        return this.currentNode;
    }

    currentNode: Node | null;

    constructor(context: ParsingContext) {
        super(context);
        this.currentNode = null;

        this.onToken(TokenType.Name, (token) => {
            
        });
    }
}

function registerExpressionHandlers() {
    
}
