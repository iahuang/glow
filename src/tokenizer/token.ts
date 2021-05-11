import { SourceFile } from "../source";

export interface Token {
    type: TokenType;
    content: string;
    source: SourceFile;
    line: number;
    col: number;
}

export enum TokenType {
    // A symbol such as a variable or function name.
    Name,

    // String character token; represents any character inside a string literal.
    StringChar,

    // Special tokens
    EOL, // represents "\n" or "\r\n"
    EOF, // represnets the end of the source file.

    // Basic syntax tokens
    DblQuote,
    CurlyBraceRight,
    CurlyBraceLeft,
    SquareBrackRight,
    SquareBrackLeft,
    ParenRight,
    ParenLeft,
    Assign,
    DoubleEq,
    Colon,
    Semicolon,
    Astrisk,
    Plus,
    Minus,
    Div,

    // Keywords
    KWVar,
    KWConst,
    KWFunc,
}

interface TokenPattern {
    regex?: RegExp;
    stringMatch?: string;
    tokenType: TokenType;
}

/*
    The TokenMatcher class contains definitions for many of the above syntax tokens.

    the method TokenMatcher.match() returns a list of all the token types + matched strings that fall at the start
    of the provided string.
*/

export class TokenMatcher {
    tokenPatterns = new Map<TokenType, TokenPattern>();

    constructor() {
        this.addRegexPattern(TokenType.Name, /[a-zA-Z_][a-zA-Z_0-9]{0,}/)
            .addRegexPattern(TokenType.StringChar, /./)
            .addRegexPattern(TokenType.EOF, /$/)
            .addRegexPattern(TokenType.EOL, /\n/)
            .addPattern(TokenType.DblQuote, '"')
            .addPattern(TokenType.CurlyBraceLeft, "{")
            .addPattern(TokenType.CurlyBraceRight, "}")
            .addPattern(TokenType.SquareBrackLeft, "[")
            .addPattern(TokenType.SquareBrackRight, "]")
            .addPattern(TokenType.ParenLeft, "(")
            .addPattern(TokenType.ParenRight, ")")
            .addPattern(TokenType.Assign, "=")
            .addPattern(TokenType.DoubleEq, "==")
            .addPattern(TokenType.Colon, ":")
            .addPattern(TokenType.Semicolon, ";")
            .addPattern(TokenType.Astrisk, "*")
            .addPattern(TokenType.Plus, "+")
            .addPattern(TokenType.Minus, "-")
            .addPattern(TokenType.Div, "/")
            .addPattern(TokenType.KWConst, "const")
            .addPattern(TokenType.KWVar, "var")
            .addPattern(TokenType.KWFunc, "func");
    }

    match(source: string, allowedTokenType: TokenType[]) {
        let matches = [];

        for (let tokenType of allowedTokenType) {
            let tokenPattern = this.tokenPatterns.get(tokenType);
            if (!tokenPattern) throw new Error(`Parsing method for token type ${TokenType[tokenType]} is not defined!`);
            let match = this._matchToken(source, tokenPattern);
            if (match) {
                matches.push({
                    tokenType: tokenType,
                    matchedString: match,
                });
            }
        }

        return matches;
    }

    _matchToken(source: string, pattern: TokenPattern): string | null {
        /*
            if the source string () matches the provided token pattern
            return the matching token contents.
            otherwise, return null.
        */

        if (pattern.regex) {
            let regexMatch = pattern.regex.exec(source);
            if (!regexMatch) return null;

            // the regex pattern should really only match the beginning of the string; just make sure
            if (!source.startsWith(regexMatch[0])) return null;

            return regexMatch[0];
        }
        if (pattern.stringMatch) {
            // otherwise, if searching for an exact string
            // just see if the source string starts with the token
            if (source.startsWith(pattern.stringMatch)) return pattern.stringMatch;
        }
        return null;
    }

    addPattern(forToken: TokenType, pattern: string) {
        this.tokenPatterns.set(forToken, { tokenType: forToken, stringMatch: pattern });
        return this;
    }

    addRegexPattern(forToken: TokenType, regex: RegExp) {
        this.tokenPatterns.set(forToken, { tokenType: forToken, regex: regex });
        return this;
    }
}
