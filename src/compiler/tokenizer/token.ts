import { SourceFile, SourcePos } from "../source";

export interface Token {
    type: TokenType;
    content: string;
    source: SourceFile;
    pos: SourcePos;
    name: string;
}

export enum TokenType {
    // A symbol such as a variable or function name.
    Name,

    // String tokens
    StringChar, // String character token; represents any character inside a string literal.
    EscapedDblQuote, // \"

    // Comment tokens
    DoubleSlash, // "//"
    CommentChar, // Any character inside of a comment

    // Special tokens
    EOL, // represents "\n" or "\r\n"
    EOF, // represents the end of the source file.
    Whitespace, // represents a whitespace character.

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

    // Numerics
    IntegerLiteral,

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
*/

export class TokenMatcher {
    tokenPatterns = new Map<TokenType, TokenPattern>();

    constructor() {
        this.addRegexPattern(TokenType.Name, /[a-zA-Z_][a-zA-Z_0-9]{0,}/)
            .addRegexPattern(TokenType.StringChar, /./)
            .addRegexPattern(TokenType.EOF, /$/)
            .addRegexPattern(TokenType.EOL, /\n/)
            .addRegexPattern(TokenType.Whitespace, /[ \t]/)
            .addRegexPattern(TokenType.IntegerLiteral, /\d+/)
            .addPattern(TokenType.DblQuote, '"')
            .addPattern(TokenType.EscapedDblQuote, '\\"')
            .addPattern(TokenType.DoubleSlash, "//")
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

    match(source: string, allowedTokenTypes: TokenType[]) {
        /*
            Given a list of allowed tokens, return a matching token type. This function
            will exit when the first matching token is found; therefore order is important
            when passing the array. For instance, "==" should be checked before "=" and the generic
            "Name" token should be checked AFTER checking keyword tokens.
        */

        for (let tokenType of allowedTokenTypes) {
            let tokenPattern = this.tokenPatterns.get(tokenType);
            if (!tokenPattern) throw new Error(`Parsing method for token type ${TokenType[tokenType]} is not defined!`);
            let match = this._matchToken(source, tokenPattern);
            if (match !== null) {
                return {
                    tokenType: tokenType,
                    matchedString: match,
                };
            }
        }

        return null;
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
            if (regexMatch.index !== 0) return null;

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
