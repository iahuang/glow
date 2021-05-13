import { SourcePos } from "../source";

function indent(string: string, spaces = 4) {
    /* Indents all the lines in [string] by [spaces] spaces */

    return string
        .split("\n")
        .map((line) => " ".repeat(spaces) + line)
        .join("\n");
}

export class Node {
    location: SourcePos | null;

    constructor() {
        this.location = null;
    }

    dump() {
        return `<${this.constructor.name}>`;
    }

    protected _makeDumpString(...attrs: string[]) {
        /* 
            Create an override for Node.dump() that follows the format
            <[this.constructor.name] attr1=value, attr2=value, etc. >
        */

        return `<${this.constructor.name} ${attrs
            .map((attr) => {
                let value = (this as any)[attr];
                let displayedValue = value;
                if (value instanceof Node) {
                    displayedValue = value.dump();
                }
                if (typeof value === "string") {
                    displayedValue = `"${value}"`;
                }
                return `${attr}=${displayedValue}`;
            })
            .join(", ")}>`;
    }
}

export class CodeBody extends Node {
    body: Node[];
    constructor(body: Node[]) {
        super();
        this.body = body;
    }

    addNode(node: Node) {
        this.body.push(node);
    }

    get length() {
        return this.body.length;
    }

    dump() {
        let body = this.body.map((node) => node.dump()).join(",\n");
        if (this.length === 1) {
            return `{ ${this.body[0].dump()} }`;
        } else {
            return `{\n${indent(body)}\n}`;
        }
    }
}

export class Name extends Node {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    dump() {
        return this._makeDumpString("name");
    }
}

export enum Operation {
    Add,
    Sub,
    Mul,
    Div,
    Lt,
    Gt,
    Leq,
    Geq,
    Eq,
    Neq,
    Dot,
}

export class BinOp extends Node {
    op: Operation;
    a: Node;
    b: Node;

    constructor(a: Node, b: Node, op: Operation) {
        super();
        this.a = a;
        this.b = b;
        this.op = op;
    }

    dump() {
        return this._makeDumpString("a", "op", "b");
    }
}
