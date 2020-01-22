from ast import Node
from ast.literal import String
from ast import NodeGroup

def postparse(node, meta):
    table = meta.get_str_table()
    ### REIMPLEMENT THIS LATER IT SUCKS
    if isinstance(node, String):
        node.value = table.get(node.value)

    for attr, val in node.__dict__.items():
        if isinstance(val, Node):
            postparse(val, meta)
    
    if isinstance(node, NodeGroup):
        for val in node.nodes:
            if isinstance(val, Node):
                postparse(val, meta)