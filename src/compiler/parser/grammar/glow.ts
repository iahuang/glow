import { TokenType } from "../../tokenizer/token";
import { gcRule, gcToken, Grammar } from "./core";

export class GlowGrammar extends Grammar {
    constructor() {
        super();

        this.defineGrammarRule("expr", [[gcRule("paren").label("body")], [gcRule("mult").label("body")]]);
        this.defineGrammarRule("paren", [
            [gcToken(TokenType.ParenLeft), gcRule("expr").label("body"), gcToken(TokenType.ParenRight)],
        ]);
        this.defineGrammarRule("mult", [
            [gcRule("atomic").label("a"), gcToken(TokenType.Astrisk), gcRule("atomic").label("b")],
            [gcRule("expr").label("a"), gcToken(TokenType.Astrisk), gcRule("expr").label("b")],
            [gcRule("atomic").label("a"), gcToken(TokenType.Astrisk), gcRule("expr").label("b")],
            [gcRule("expr").label("a"), gcToken(TokenType.Astrisk), gcRule("atomic").label("b")],
        ]);
    }
}
