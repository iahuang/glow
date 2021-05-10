export interface Token {
    type: TokenType;
    content: string;
    source: string;
    line: number;
    col: number;
}

export enum TokenType {
    Name,
    StringChar,
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
    EOF,
    EOL,
    Astrisk,
    Plus,
    Minus,
    Div,
    KWVar,
    KWConst,
    KWFunc
}
