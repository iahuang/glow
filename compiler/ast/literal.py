from dataclasses import dataclass
from typing import Any
from ast import Node, NodeMatch
from ast import err

@dataclass
class Literal(Node): # node that represents a single value
    value: Any

class Numeric(Literal): # numeric literal like "3" or "4.245"
    pass

class Integer(Numeric):
    @staticmethod
    def match(text):
        return Node.simple_match(r'\d+', text)

class Float(Numeric):
    @staticmethod
    def match(text):
        return Node.simple_match(r'\d+.\d+', text)

class String(Numeric):
    @staticmethod
    def match(text):
        if text[0] != '"': # doesn't start with a quote; not a string lmao
            return None
        string = ""
        i = 1
        while i < len(text):
            c = text[i]
            if c == '\\': # escape character (backslash)
                assert i+1 < len(text) # make sure there is a character afterwards
                next_char = text[i+1]
                if next_char == '"': # escaped quote?
                    c+=1 # skip the backslash
            if c == '"': # closing quote
                return NodeMatch([string], '"'+string+'"')
            if c == '\n':
                raise err.UnclosedQuote()
            string+=c
            i+=1
        raise err.UnexpectedEOF()

class Boolean(Literal): # "true" or "false"
    pass