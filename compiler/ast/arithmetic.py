from ast import Node, BinaryOp, NodeMatch
import re
from util import Str

class ArithmeticOp(BinaryOp): # binary operator that follows the format a # b where b is something like +, -, etc.
    @staticmethod
    def match(op, text):
        m = Node.regex_match(r'.+' + re.escape(op) + '.+', text)
        if m:
            args = Str(m).split_first(op)
            return NodeMatch(args, m)

class AdditionOp(ArithmeticOp):
    @staticmethod
    def match(text):
        return ArithmeticOp.match('+', text)

class SubtractionOp(ArithmeticOp):
    @staticmethod
    def match(text):
        return ArithmeticOp.match('-', text)

class MultiplicationOp(ArithmeticOp):
    @staticmethod
    def match(text):
        return ArithmeticOp.match('*', text)

class DivisionOp(ArithmeticOp):
    @staticmethod
    def match(text):
        return ArithmeticOp.match('/', text)