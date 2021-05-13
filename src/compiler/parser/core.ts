/*
    This is the basis of how this parser works:

    ParseHandlers are responsible for parsing syntax into their
    corresponding AST nodes. For instance, say we saw a "func" keyword, we would invoke
    the "func node" Parse Handler to process the following tokens into a complete Node
    that represents an entire function definition.

    A ParsingContext is passed to each NodeParseHandler. A parsing context describes four important details:
    - tokenStream:  The global, shared stream that brings new tokens.
    - endToken:     Where to stop parsing. If parsing an argument in an argument list, this would be either "," or ")"
    - currentNode:  The node for which parsing is "in-progress". For instance,
                    take this expression: 2 + 3 * (1 - a).
                    The "+" handler requires information about the node before it ("2") in order
                    to make anything useful.
    - entryToken:   The token that initially invoked the parse handler

    ParseHandlers, by nature, also contain contextual information about what nodes can and cannot be parsed.
    Each NodeParseHandler object has its own definitions for calling other ParseHandlers upon
    encountering different tokens. For instance, "a + ( ..." does not imply that "a + " should be called,
    rather that "( ..." should be added to "a".
*/

import { Node } from "../ast/nodes";
import { CompilerError } from "../err";
import { Token, TokenType } from "../tokenizer/token";
import { TokenStream } from "../tokenizer/token_stream";

export class Parser {
    tokenStream: TokenStream;

    constructor(tokenStream: TokenStream) {
        this.tokenStream = tokenStream;
    }
}

export class ParsingContext {
    tokenStream: TokenStream;
    endTokens: TokenType[];
    currentNode: Node;
    entryToken: Token;

    constructor(stream: TokenStream, endToken: TokenType[] | TokenType, currentNode: Node, entry: Token) {
        this.tokenStream = stream;
        this.endTokens = endToken instanceof Array ? endToken : [endToken];
        this.currentNode = currentNode;
        this.entryToken = entry;
    }
}

export abstract class ParseHandler<T extends Node> {
    _onTokenHandlers = new Map<TokenType, (token: Token) => void>();
    context: ParsingContext;

    currentToken?: Token;

    //
    currentNode: Node | null = null;

    constructor(context: ParsingContext) {
        this.context = context;
    }

    parse() {
        let t = this.context.tokenStream.nextToken();

        while (true) {
            this.currentToken = t;

            for (let endToken of this.context.endTokens) {
                if (endToken === t.type) {
                    this.atExit();
                    if (!this.currentNode) throw new Error("Parse handler didn't return a Node!");
                    return this.currentNode;
                }
            }

            let handler = this._onTokenHandlers.get(t.type);
            if (!handler) this.throwParseError(`Unexpected token "${t.content}"`);
            handler(t);

            t = this.context.tokenStream.nextToken();
        }
    }

    throwParseError(message: string): never {
        throw new CompilerError(this.context.tokenStream.source, this.context.tokenStream.getSourcePos(), message);
    }

    /*
        The atExit() method is called when the endToken is reached.
        At this point, whatever is being stored in this.currentNode
        will be returned to the ParseHandler caller.

        This method should be used to verify that this.currentNode
        is O.K. and throw any compiler errors as needed.
    */
    atExit() {}

    onToken(type: TokenType, callback: (token: Token) => void) {
        this._onTokenHandlers.set(type, callback);
    }

    _requireCurrentNode(token: Token) {
        /*
            A utility method that guarantees that this.currentNode is defined
            otherwise it throws a compiler error.
            Used in the method registerPostMutatingParseHandler()
        */

        if (!this.currentNode)
            this.throwParseError(`Token "${token.content}" requires something before it! (Missing an expression?)`);
        return this.currentNode;
    }

    registerPostMutatingParseHandler(
        type: TokenType,
        handlerType: new (context: ParsingContext) => ParseHandler<Node>
    ) {
        /*
            This method registers a parse handler to handle instances where the
            result of the parse handler should replace this.currentNode

            For instance: a + 1
                - The "+" handler would create a node that represents "a + 1"
                - this new node should be pushed back into this.currentNode
                - so that this.parse() returns "a + 1" rather than just "a"
        */

        this.onToken(type, (token) => {
            let currToken = this._requireCurrentNode(token);
            let context = new ParsingContext(
                this.context.tokenStream,
                this.context.endTokens,
                currToken,
                token
            );
            let handler = new handlerType(context);
            this.currentNode = handler.parse();
        });
    }
}
