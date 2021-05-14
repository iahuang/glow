import { GlowGrammar } from "./compiler/parser/grammar/glow";
import { SourceFile } from "./compiler/source";
import { TokenType } from "./compiler/tokenizer/token";
import { TokenStream } from "./compiler/tokenizer/token_stream";

let source = new SourceFile("examples/test.glo");

let stream = new TokenStream();
let grammar = new GlowGrammar();
stream.loadSource(source);
let m = grammar.attemptRuleMatch("expr", stream);
console.log(m);