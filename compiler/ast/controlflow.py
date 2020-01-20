from ast import Node, NodeMatch
import re
from ast.util import Str
from dataclasses import dataclass

@dataclass
class IfStatement(Node):
    condition: Node
    block: Node
    @staticmethod 
    def match(text):
        m = Node.regex_match('if .+ {.+}', text, newline_insensitive=True) # preliminary check
        if m:
            condition = re.match('(?<=if).+ (?={)', m).group()
            code_block = Str(text).cut_left('if'+condition).match_brackets('{', '}')
            if code_block:
                return NodeMatch([condition, code_block], 'if'+condition+'{'+code_block+'}')
            