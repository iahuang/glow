import err

class Str(str): # string with extra utility functions
    def split_first(self, delimiter):
        spl = self.split(delimiter)
        extra = delimiter.join(spl[1:])
        if extra:
            return [spl[0], extra]
        return spl

    def search_brackets(self, opening, closing):
        nest = 0
        has_entered = False
        bracketed = ""
        for c in self:
            if c == opening:
                has_entered = True
                nest += 1
            if c == closing:
                nest -= 1
            
            if nest < 0:
                raise err.UnbalancedBracketError()
            
            if has_entered:
                bracketed+=c

            if nest == 0 and has_entered:
                return bracketed[1:-1]
    
    def cut_left(self, s): # like .strip but like different
        if self.startswith(s):
            return Str(self[len(s):])
        return self

    def match_brackets(self, opening, closing):
        if self.startswith(opening):
            return self.search_brackets(opening, closing)
            