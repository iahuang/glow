
import { GmrMatchFailRecord } from "./compiler/parser/grammar/core";
import { GlowGrammar } from "./compiler/parser/grammar/glow";
import { SourceFile } from "./compiler/source";
import { TokenType } from "./compiler/tokenizer/token";
import { TokenStream } from "./compiler/tokenizer/token_stream";

let source = new SourceFile("examples/test.glo");

let stream = new TokenStream();
let grammar = new GlowGrammar();
stream.loadSource(source);
let record = new GmrMatchFailRecord();
console.log(grammar.getRule("atomic").patterns[0]);
let m = grammar._attemptRuleMatch("expr", stream, 0, record);

console.log(m);
console.log(record);