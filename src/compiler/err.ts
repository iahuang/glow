import { SourceFile, SourcePos } from "./source";

export class CompilerError {
    source: SourceFile;
    pos: SourcePos;
    message: string;
    constructor(source: SourceFile, pos: SourcePos, message: string) {
        this.source = source;
        this.pos = pos;
        this.message = message;
    }
}