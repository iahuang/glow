from dataclasses import dataclass
import re
from typing import Any
import err
from util import Str

class NodeMatch:
    def __init__(self, args, matched_text=None):
        self.args = args
        self.matched_text = matched_text

        if self.matched_text == None: # default to args[0]
            assert len(self.args) == 1
            self.matched_text = self.args[0]
        
        self.match_length = len(self.matched_text)
    
    def __repr__(self):
        return '<NodeMatch: args='+str(self.args)+' matched='+repr(self.matched_text)+'>'

class Node:
    def __init__(self):
        pass
    
    @staticmethod
    def match(text): # Return a ParseMatch object if the start of the string "resembles" this token
        return None

    @staticmethod
    def regex_match(pattern, text, newline_insensitive=False):
        match = re.match(pattern, text, 0 if newline_insensitive else re.S)
        if match:
            return match.group()
        return None

    @staticmethod
    def regex_search(pattern, text, newline_insensitive=False):
        match = re.search(pattern, text, 0 if newline_insensitive else re.S)
        if match:
            return match.group()
        return None
    
    @staticmethod
    def simple_match(pattern, text, newline_insensitive=False):
        m = Node.regex_match(pattern, text, newline_insensitive)
        if m:
            return NodeMatch([m])
        return None

class Operator(Node): # multiply, add, call, not, etc.
    pass

class UnaryOp(Operator): # operator with only one argument (boolean not, minus, etc.)
    pass

@dataclass
class BinaryOp(Operator): # operator with two arguments
    a: Node
    b: Node

class DotOp(BinaryOp): # example: a.b, person.name, array.length etc.
    @staticmethod
    def match(text): # similar to ArithmeticOp.match
        m = Node.regex_match(r'.+?\..+', text)
        if m:
            args = Str(m).split_first('.')
            return NodeMatch(args, m)

class BracketedOp(BinaryOp): # operator that follows the format a(...) or a[...] etc.
    @staticmethod
    def match(opening, closing, text):
        # example: lmao(a+b)
        subject = Node.regex_match('.+?(?={})'.format(re.escape(opening)), text)  # "lmao"

        if not subject:
            return None

        bracketed = Str(text).cut_left(subject).match_brackets(opening, closing)
        if bracketed:
            return NodeMatch([subject, bracketed], subject+opening+bracketed+closing)

class CallOp(BracketedOp):
    @staticmethod
    def match(text):
        return BracketedOp.match('(', ')', text)

class TernaryOp(Operator): # operator with three arguments
    pass

@dataclass
class Name(Node): # variable name, function name, etc.
    name: str
    @staticmethod
    def match(text):
        m = Node.simple_match(r'\w+', text)
        if m:
            if re.match(r'\d', m.matched_text): # a name cannot start with a numeral
                return None
        return m

class NodeGroup(Node): # stores an arbitrary number of nodes; example: arguments in a function call
    def __init__(self, *args):
        self.nodes = args
    
    def __repr__(self):
        return '<NodeGroup: ['+', '.join([repr(node) for node in self.nodes])+']>'

class _CommaOp(BinaryOp): # intermediate operation for resolving comma'd arguments in a function call
    @staticmethod
    def match(text):
        m = Node.regex_match(r'.+?,.+', text)
        if m:
            args = Str(m).split_first(',')
            return NodeMatch(args, m)