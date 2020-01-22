from ast import Node, NodeMatch
import re
from ast.util import Str
from dataclasses import dataclass
from ast.matcher import compound_match

@dataclass
class IfStatement(Node):
    condition: Node
    block: Node
    @staticmethod 
    def match(text):
        matchers = [
            'if',                                               # if
            '.+ \n?(?={)',                                         # condition
            lambda text: Str(text).match_brackets('{', '}')     # code body
        ]
        matches = compound_match(text, matchers)
        if matches: return matches[1:] # we don't need the "if" thing lol

@dataclass
class Function(Node):
    args: Node
    block: Node
    @staticmethod
    def match(text):
        m = Node.regex_match(r'func \w+ ?\(\){.+}', text, newline_insensitive=True) # preliminary check
        if m:
            condition = re.match('(?<=if).+ (?={)', m).group()
            code_block = Str(text).cut_left('if'+condition).match_brackets('{', '}')
            if code_block:
                return NodeMatch([condition, code_block], 'if'+condition+'{'+code_block+'}')