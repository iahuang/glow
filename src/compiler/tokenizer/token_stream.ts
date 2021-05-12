import { CompilerError } from "../err";
import { SourceFile, SourcePos } from "../source";
import { Token, TokenMatcher, TokenType } from "./token";

enum TokenizerMode {
    Syntax,
    String,
    Comment,
}

const GenericSyntaxTokens = [
    TokenType.DoubleSlash,

    // special
    TokenType.EOL,
    TokenType.EOF,
    TokenType.Whitespace,

    // generic
    TokenType.DblQuote,
    TokenType.CurlyBraceRight,
    TokenType.CurlyBraceLeft,
    TokenType.SquareBrackRight,
    TokenType.SquareBrackLeft,
    TokenType.ParenRight,
    TokenType.ParenLeft,
    TokenType.Assign,
    TokenType.DoubleEq,
    TokenType.Colon,
    TokenType.Semicolon,
    TokenType.Astrisk,
    TokenType.Plus,
    TokenType.Minus,
    TokenType.Div,
    TokenType.KWVar,
    TokenType.KWConst,
    TokenType.KWFunc,
    TokenType.Name,
    TokenType.IntegerLiteral,
];

const StringTokens = [TokenType.StringChar, TokenType.EOL, TokenType.EOF, TokenType.EscapedDblQuote];

const CommentTokens = [TokenType.EOL, TokenType.EOF, TokenType.CommentChar];

export class TokenStream {
    matcher: TokenMatcher;
    source: SourceFile;

    mode: TokenizerMode;

    // current position in the source file.
    _index: number;
    _lineNumber: number;
    _col: number;

    constructor() {
        this.matcher = new TokenMatcher();
        this.mode = TokenizerMode.Syntax;
        this.source = null as any;

        // set state variables
        this._index = 0;
        this._lineNumber = 1;
        this._col = 1;
    }

    _getContextualTokenSet() {
        /*  
            Returns a set of valid tokens for the current
            parsing mode.
        */
        return {
            [TokenizerMode.Syntax]: GenericSyntaxTokens,
            [TokenizerMode.String]: StringTokens,
            [TokenizerMode.Comment]: CommentTokens,
        }[this.mode];
    }

    _getCurrPos(): SourcePos {
        /*
            Gets the current position in the file as a ln:col object.
        */
        return {
            line: this._lineNumber,
            col: this._col,
        };
    }

    _nextToken(): Token {
        /*
            This function matches the current unprocessed subset of the source string
            to all valid tokens for the current context.

            It then increments "consumes" this token, incrementing internal counters
            past the newly matched token.
        */

        // the source code minus the part we've already parsed
        let sourcePortion = this.source.contents.substring(this._index);

        // the subset of tokens that we can use depends on the tokenizing mode.
        let match = this.matcher.match(sourcePortion, this._getContextualTokenSet());

        // if a token could not be matched, assume invalid character
        // and return an appropriate compiler error. in theory
        // we could skip to the next line and keep trying to parse,
        // but it's probably not worth it.
        if (match === null) {
            throw new CompilerError(this.source, this._getCurrPos(), `Unexpected character [${sourcePortion[0]}]`);
        }

        if (match.tokenType === TokenType.DblQuote) {
            if (this.mode === TokenizerMode.Syntax) {
                this.mode = TokenizerMode.String;
            } else if (this.mode === TokenizerMode.String) {
                this.mode = TokenizerMode.Syntax;
            }
        }

        this._index += match.matchedString.length;
        this._col += match.matchedString.length;

        // reset col counter, increment line counter on newline
        if (match.tokenType === TokenType.EOL) {
            this._lineNumber++;
            this._col = 1;
        }

        return {
            type: match.tokenType,
            content: match.matchedString,
            source: this.source,
            pos: this._getCurrPos(),
            name: TokenType[match.tokenType],
        };
    }

    nextToken() {
        /*
            whitespace is irrelevant for syntax parsing.
            all this function does is call _nextToken()
            but skip all whitespace tokens.

            parsing inside strings and comments should return appropriate
            "character" tokens and therefore will not be skipped.
        */

        let t = this._nextToken();

        while (t.type === TokenType.Whitespace || t.type === TokenType.EOL) {
            t = this._nextToken();
        }
        return t;
    }

    loadSource(source: SourceFile) {
        this.source = source;

        // reset state variables
        this._index = 0;
        this._lineNumber = 1;
        this._col = 1;
    }
}