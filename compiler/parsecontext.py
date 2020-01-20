import ast
import ast.literal
import ast.arithmetic
import ast.controlflow

class Context:
    def __init__(self, *types):
        self.typeset = types
    
    def __add__(self, context):
        return CompoundContext(self, context)

class CompoundContext(Context):
    def __init__(self, *contexts):
        super().__init__()
        for c in contexts:
            self.typeset+=c.typeset

class RootContext(Context):
    def __init__(self):
        super().__init__(
            ast.controlflow.Function
        )

class ExpressionContext(Context):
    def __init__(self):
        super().__init__(
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
        )

class CallArgsContext(CompoundContext):
    def __init__(self):
        super().__init__(ExpressionContext, Context(ast._CommaOp))

def get_contexts_for_node_type():
    pass