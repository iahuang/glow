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
            'if', # if
            '.+ \n?(?={)', # condition
            lambda text: Str(text).match_brackets('{', '}', True) # code body
        ]
        matches = compound_match(text, matchers)
        if matches: return matches[1:] # we don't need the "if" thing lol

@dataclass
class Function(Node):
    args: Node
    block: Node
    @staticmethod
    def match(text):
        matchers = [
            'func ',
            '\w+( +)?',
            lambda text: Str(text).match_brackets('(', ')', True),
            ':.+?\n?(?={)',
            lambda text: Str(text).match_brackets('{', '}', True)
        ]
        matches = compound_match(text, matchers)
        if matches:
            _func, function_name, args, return_type, code_block = matches
            return [
                function_name,
                args[1:-1], # remove parentheses
                return_type.lstrip(':'),
                code_block[1:-1] # remove brackets
            ]
