import fs from "fs";
import path from "path";

export class SourceFile {
    path: string | null;
    name: string;
    contents: string;

    // a cache of the source contents split by line
    _lines: string[];

    constructor(filePath: string) {
        this.path = filePath;
        this.name = path.basename(filePath);
        let contents = fs.readFileSync(filePath, "utf-8");

        // internally, the glow compiler uses unix line endings.
        contents = contents.replace(/\r\n/g, "\n");
        this.contents = contents;

        this._lines = this.contents.split("\n");
    }

    getLineByNumber(lineNo: number) {
        return this._lines[lineNo + 1];
    }

    getPosByCharIndex(index: number) {
        // Returns a line:col pair from a string character index of the whole
        // source file

        let cumulativeCharIndex = 0;
        for (let lineIndex = 0; lineIndex < this._lines.length; lineIndex++) {
            // add +1 to account for the \n character
            let lineLength = this._lines[lineIndex].length + 1;
            cumulativeCharIndex += lineLength;

            // check if we're on the correct line
            // i.e. if the next line would go past the provided index
            if (cumulativeCharIndex > index) {
                let lineContent = this._lines[lineIndex];

                // to find the column of the index, take the index of the start of this line
                let indexAtStart = cumulativeCharIndex - lineLength;
                // ...and subtract it from the target index, adding one (column no. starts at one, not zero)
                let col = index - indexAtStart + 1;
                return {
                    line: lineIndex + 1,
                    col: col,
                };
            }
        }
        throw new Error(`Cannot get source position ${index} out of range ${this.contents.length}`);
    }
}

export interface SourcePos {
    col: number;
    line: number;
}
