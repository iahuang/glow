import { TokenType } from "../../tokenizer/token";
import { gcRule, gcToken, Grammar } from "./core";

export class GlowGrammar extends Grammar {
    constructor() {
        super();

        this.defineGrammarRule("expr", [[gcRule("paren").setName("body")], [gcRule("mult").setName("body")]]);
        this.defineGrammarRule("paren", [
            [gcToken(TokenType.ParenLeft), gcRule("expr").setName("body"), gcToken(TokenType.ParenRight)],
        ]);
        this.defineGrammarRule("mult", [
            [gcRule("atomic").setName("a"), gcToken(TokenType.Astrisk), gcRule("atomic").setName("b")],
            [gcRule("expr").setName("a"), gcToken(TokenType.Astrisk), gcRule("expr").setName("b")],
            [gcRule("atomic").setName("a"), gcToken(TokenType.Astrisk), gcRule("expr").setName("b")],
            [gcRule("expr").setName("a"), gcToken(TokenType.Astrisk), gcRule("atomic").setName("b")],
        ]);
        this.defineGrammarRule("atomic", [[gcToken(TokenType.Name)], [gcToken(TokenType.IntegerLiteral)]]);

        if (!this.verify()) throw new Error("Glow grammar set is incomplete");
    }
}
