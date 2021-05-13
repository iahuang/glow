import { Token, TokenType } from "../../tokenizer/token";
import { TokenStream } from "../../tokenizer/token_stream";

export class GmrPattern {
    components: GmrComponent[];
    constructor(...components: GmrComponent[]) {
        this.components = components;
    }
}

export class GmrComponent {
    tokenType: TokenType | null;
    ruleName: string | null;
    name: string | null;

    constructor(token: TokenType | null, ruleName: string | null) {
        this.tokenType = token;
        this.ruleName = ruleName;
        this.name = null;
    }

    label(name: string) {
        this.name = name;
        return this;
    }
}

export class GmrRule {
    name: string;
    patterns: GmrPattern[];
    constructor(name: string, patterns: GmrPattern[]) {
        this.name = name;
        this.patterns = patterns;
    }
}

export function gcRule(ruleName: string) {
    return new GmrComponent(null, ruleName);
}

export function gcToken(token: TokenType) {
    return new GmrComponent(token, null);
}

export interface RuleComponentMatch {
    token: Token | null;
    rule: RuleMatchResult | null;
}

export class RuleMatchResult {
    rule: GmrRule;
    matchingPattern: GmrPattern;
    labels: Map<string, RuleComponentMatch>;

    constructor(rule: GmrRule, pattern: GmrPattern) {
        this.rule = rule;
        this.matchingPattern = pattern;
        this.labels = new Map<string, RuleComponentMatch>();
    }

    setMatchedComponent(label: string, match: RuleComponentMatch) {
        this.labels.set(label, match);
    }

    getComponent(withLabel: string) {
        let match = this.labels.get(withLabel);
        if (!match) throw new Error(`Rule with name "${this.rule.name}" has no matched pattern component "${withLabel}"!`);
    }
}

export class Grammar {
    _grammarRules = new Map<string, GmrRule>();

    constructor() {}

    defineGrammarRule(name: string, patterns: GmrComponent[][]) {
        let rule = new GmrRule(
            name,
            patterns.map((parray) => new GmrPattern(...parray))
        );
        this._grammarRules.set(name, rule);
    }

    getGrammarRules() {
        return this._grammarRules.values();
    }

    getRule(name: string) {
        let r = this._grammarRules.get(name);
        if (!r) throw new Error(`Grammar rule with name "${name}" does not exist!`);
        return r;
    }

    // This function restores the tokenstream position after use
    // i.e. practically speaking, they do not modify the stream object

    attemptRuleMatch(ruleName: string, tokenStream: TokenStream) {
        let rule = this.getRule(ruleName);

        for (let pattern of rule.patterns) {
        }
    }

    attemptPatternMatch(pattern: GmrPattern, stream: TokenStream) {
        let initialState = stream.state.clone();

        for (let component of pattern.components) {
            if (component.tokenType) {
                let token = stream.nextToken();
                if (token.type === component.tokenType) {

                }
            }
        }

        // restore stream state
        stream.state.set(initialState);
    }
}
