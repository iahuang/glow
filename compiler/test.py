from ast.util import Str
import ast.controlflow



t = '''func plus(a: int, b: int): int {
	bruh
}'''
print(ast.controlflow.Function.match(t))

