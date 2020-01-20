import ast
import ast.arithmetic
import ast.literal
import err

def match_reaches_expr_end(match, expr):
    # return True of expression reaches a logical breaking point in the expression
    remainder = expr[match.match_length:]
    return remainder.split('\n')[0].strip() == ''

# Functions to handle specific cases

def parse_args(node_type, args, tb=0):
    additional = []
    if node_type in [ast._CommaOp, ast.CallOp]:
        additional = [ast._CommaOp]

    return list([parse_exp(arg, tb+1,additional) for arg in args])

def recursive_comma_flatten(node, group):
    if type(node) == ast._CommaOp:
        recursive_comma_flatten(node.a, group)
        recursive_comma_flatten(node.b, group)
    else:
        group.append(node)

def resolve_commas(args_node): # turn nested _comma operations into one NodeGroup operation
    group = []
    recursive_comma_flatten(args_node, group)
    return ast.NodeGroup(*group)

# General parsing function

def parse_exp(expr, tb=0, context=[]): # optionally pass extra node types based on the parsing context
    expr = expr.strip()
    node_types = [
        ast.Name,
        ast.literal.Integer,
        ast.literal.Float,
        ast.literal.String,
        ast.arithmetic.MultiplicationOp,
        ast.arithmetic.DivisionOp,
        ast.arithmetic.AdditionOp,
        ast.arithmetic.SubtractionOp,
        ast.CallOp,
        ast.DotOp
    ]+additional
    
    def debug_log(*args):
        pass
        print('\t'*tb+' '.join([str(arg) for arg in args]))

    for node_type in node_types:
        match = node_type.match(expr)
        debug_log('testing',node_type,'on',repr(expr))
        if not match:
            continue

        if not match_reaches_expr_end(match, expr): # make sure that the node type fully matches the expression
            continue
        
        debug_log('nodetype',node_type,'args',match.args)
        if len(match.args) == 1: # expression is atomic and should not be attempted to be further broken down
            return node_type(match.args[0])

        try:
            parsed_args = parse_args(node_type, match.args, tb)
        except err.NoOperationMatchError: # could not resolve arguments for this node type
            continue
        
        if node_type == ast.CallOp:
            return ast.CallOp(parsed_args[0], resolve_commas(parsed_args[1]))
        return node_type(*parsed_args)

    raise err.NoOperationMatchError() # no node type was able to match the given expression

import timeit
print(parse_exp('func(a, b, c, "lmao", 1.2) + bees(e).e'))