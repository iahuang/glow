/*
    This is Glow's grammar parser. It contains the code
    for parsing out syntax rules from text.

    A Rule or [GmrRule] is a syntax object. For instance, this rule:
    
    mult: [name] * [name]

    says that "a multiplication expression matches anything that looks like
               [name] followed by an asterisk followed by another [name]"]
    
    Rules can have multiple Patterns (GmrPattern) which determine the basis
    on which a piece of syntax is decided to follow that rule.

    Individual pieces of patterns are called Components (GmrComponent).
    A component can either be an instance of a token or it could be
    another rule.
*/

import { SourcePos } from "../../source";
import { Token, TokenType } from "../../tokenizer/token";
import { TokenState, TokenStream } from "../../tokenizer/token_stream";

export class GmrPattern {
    components: GmrComponent[];
    constructor(...components: GmrComponent[]) {
        this.components = components;
    }

    toString() {
        return `<Pattern ${this.components
            .map((component) => {
                if (component.tokenType) {
                    return "$" + TokenType[component.tokenType];
                }
                if (component.ruleName) {
                    return `[${component.ruleName}]`;
                }
                return "(UNDEFINED)";
            })
            .join(", ")} >`;
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

    setName(name: string) {
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

export interface RuleComponentMatch {
    token: Token | null;
    ruleMatch: RuleMatchResult | null;
}

export class RuleMatchResult {
    /*
        The RuleMatchResult object is returned by
        Grammar.attemptRuleMatch.

        It describes information such as:
         - which rule was matched
         - what pattern in that rule was matched
         - specific components can be labeled with names in the pattern definition,
           as to reference them later when building an AST;
           references to components by name that were matched
         - where the rule match ended
    */

    rule: GmrRule;
    matchingPattern: GmrPattern;
    matchedComponents: Map<string, RuleComponentMatch>;
    endPosition: TokenState | null;

    constructor(rule: GmrRule, pattern: GmrPattern) {
        this.rule = rule;
        this.matchingPattern = pattern;
        this.matchedComponents = new Map<string, RuleComponentMatch>();
        this.endPosition = null;
    }

    setMatchedComponent(name: string, match: RuleComponentMatch) {
        this.matchedComponents.set(name, match);
    }

    getMatchedComponent(withName: string) {
        let match = this.matchedComponents.get(withName);
        if (!match)
            throw new Error(`Rule with name "${this.rule.name}" has no matched pattern component "${withName}"!`);
        return match;
    }
}

/*
    Helper functions for creating pattern components.

    gcRule creates a component that matches another grammar rule
    gcToken creates a component that matches a token of the provided type.
*/

export function gcRule(ruleName: string) {
    return new GmrComponent(null, ruleName);
}

export function gcToken(token: TokenType) {
    return new GmrComponent(token, null);
}

interface GmrMatchAttemptEnding {
    rule: GmrRule;
    offendingToken: Token;
    expectedToken: TokenType;
    depth: number;
}

function maxByKey<T>(array: T[], predicate: (element: T) => number) {
    /*
        Helper function to find the maximum
        of an array based on some predicate
    */

    if (array.length === 0) throw new Error("Cannot find maximum of an empty array!");

    let bmi = 0; // best max index
    let bms = predicate(array[0]); // best max score

    for (let i = 1; i < array.length; i++) {
        let score = predicate(array[i]);
        if (score > bms) {
            bmi = i;
            bms = score;
        }
    }
    return array[bmi];
}

export class GmrMatchFailRecord {
    /*
        A helper class for keeping track of failed grammar rule match attempts
        in order to determine helpful syntax errors.
    */

    attempts: GmrMatchAttemptEnding[] = [];

    addAttempt(attempt: GmrMatchAttemptEnding) {
        this.attempts.push(attempt);

        // Remove attempts with a lower depth
        // these aren't relevant anymore
        this.attempts = this.attempts.filter((att) => att.depth >= attempt.depth);
    }
}

export class Grammar {
    _grammarRules = new Map<string, GmrRule>();

    constructor() {}

    defineGrammarRule(name: string, patterns: GmrComponent[][]) {
        /*
            Adds a grammar rule to the list of known grammar rules.
            Used as a simple way to define rules without lots of "new GmrPattern(new GmrComponent ..."
        */
        let rule = new GmrRule(
            name,
            patterns.map((parray) => new GmrPattern(...parray))
        );
        this._grammarRules.set(name, rule);
    }

    verify() {
        /*
            Verifies that each grammar pattern that references another grammar rule,
            that grammar rule actually exists.
        */
        for (let rule of this.getGrammarRules()) {
            for (let pattern of rule.patterns) {
                for (let component of pattern.components) {
                    if (component.ruleName) {
                        if (!this._grammarRules.has(component.ruleName)) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    getGrammarRules() {
        return this._grammarRules.values();
    }

    getRule(name: string) {
        let r = this._grammarRules.get(name);
        if (!r) throw new Error(`Grammar rule with name "${name}" does not exist!`);
        return r;
    }

    _attemptRuleMatch(ruleName: string, tokenStream: TokenStream, depth: number, record: GmrMatchFailRecord) {
        let rule = this.getRule(ruleName);

        // Loop through each pattern
        // attempting to match each one.
        // Return the first successful pattern match;
        // null if there was none.
        if (tokenStream.peekToken().type === TokenType.EOF) return null;
        console.log(`Attempting to match rule "${ruleName}" on string "${tokenStream.currString()}"`);
        for (let pattern of rule.patterns) {
            console.log(`   pattern: ${pattern.toString()}`);
            let match = this.attemptPatternMatch(rule, pattern, tokenStream, depth, record);
            if (match) return match;
        }
        return null;
    }

    // This function restores the tokenstream position after use
    // i.e. practically speaking, they do not modify the stream object

    attemptPatternMatch(
        rule: GmrRule,
        pattern: GmrPattern,
        stream: TokenStream,
        depth: number,
        record: GmrMatchFailRecord
    ) {
        let initialState = stream.state.clone();

        let match = new RuleMatchResult(rule, pattern);

        // Loop through each component in the pattern
        // trying to match each one. Return early
        // if one of the components fails to match.

        for (let component of pattern.components) {
            let name = component.name; // used later in the loop

            if (component.tokenType) {
                // In the case that a pattern component
                // tries to match a specific token type

                let token = stream.nextToken();

                if (token.type === component.tokenType) {
                    // make sure to keep track of the component
                    // if it was labeled
                    if (name) {
                        match.setMatchedComponent(name, { token: token, ruleMatch: null });
                    }
                    depth++;
                } else {
                    record.addAttempt({
                        rule: rule,
                        offendingToken: token,
                        expectedToken: component.tokenType,
                        depth: depth,
                    });
                    // restore stream state
                    stream.state.set(initialState);
                    return null;
                }
            } else if (component.ruleName) {
                // Otherwise, try to match a component
                // to another grammar rule

                let rmatch = this._attemptRuleMatch(component.ruleName, stream, depth, record);

                if (rmatch) {
                    if (name) {
                        // make sure to keep track of the component
                        // if it was labeled
                        match.setMatchedComponent(name, { token: null, ruleMatch: rmatch });
                    }

                    // if the match was successful, we should
                    // move the stream ahead to the end of the match
                    stream.state.set(rmatch.endPosition!);
                } else {
                    // restore stream state
                    stream.state.set(initialState);
                    return null;
                }
            }
        }
        match.endPosition = stream.state.clone();
        
        // restore stream state
        stream.state.set(initialState);
        console.log(`String "${stream.currString()}" matched pattern ${pattern.toString()}`)
        return match;
    }
}
