import ast.err as err

class SourceMeta:
    def __init__(self):
        self.strings = []
    
    def _str_placeholder_from_index(self, i):
        return '$_STR'+str(i)

    def add_str(self, s):
        if not s in self.strings:
            self.strings.append(s)

    def get_str_placeholder(self, s):
        self.add_str(s)
        
    def get_str_table(self):
        table = {}
        for index, s in enumerate(self.strings):
            table[self._str_placeholder_from_index(index)] = s
        return table
    
    def get_raw_replacement_table(self):
        table = {}
        for index, s in enumerate(self.strings):
            table['"'+self._str_placeholder_from_index(index)+'"'] = '"'+s+'"'
        return table

def preparse(text):
    # prepares code for parsing (removes strings and comments)
    # return a SourceMeta object for postparsing
    meta = SourceMeta()

    string = ""
    i = 1
    in_string = False
    while i < len(text):
        c = text[i]

        if in_string:
            if c == '\\': # escape character (backslash)
                assert i+1 < len(text) # make sure there is a character afterwards
                next_char = text[i+1]
                if next_char == '"': # escaped quote?
                    c+=1 # skip the backslash
            if c == '"': # closing quote
                meta.add_str(string)
                in_string = False
                string = ""
            elif c == '\n':
                raise err.UnclosedQuote()
            else:
                string+=c
        else:
            if c == '"': # opening quote
                in_string = True
        i+=1
    if in_string: raise err.UnexpectedEOF()

    table = meta.get_raw_replacement_table()
    for replacement, string in table.items():
        text = text.replace(string, replacement)
    return text,meta