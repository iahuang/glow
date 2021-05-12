import { SourceFile } from "./compiler/source";
import { TokenType } from "./compiler/tokenizer/token";
import { TokenStream } from "./compiler/tokenizer/token_stream";

let source = new SourceFile("examples/test.glo");

let stream = new TokenStream();
stream.loadSource(source);

let t = stream._nextToken();
while (t.type !== TokenType.EOF) {
    console.log(t);
    t = stream._nextToken();
}
