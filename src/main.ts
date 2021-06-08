
import { GmrMatchFailRecord } from "./compiler/parser/grammar/core";
import { GlowGrammar } from "./compiler/parser/grammar/glow";
import { SourceFile } from "./compiler/source";
import { TokenType } from "./compiler/tokenizer/token";
import { TokenStream } from "./compiler/tokenizer/token_stream";

let source = new SourceFile("examples/test.glo");

let stream = new TokenStream(source);

while (true) {
    let token = stream.nextToken();
    console.log(token);

    if (token.type === TokenType.EOF) break;
}