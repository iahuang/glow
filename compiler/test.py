from util import Str
import ast.controlflow

t = '''if lmao 
{
    test
}'''
print(ast.controlflow.IfStatement.match(t))

