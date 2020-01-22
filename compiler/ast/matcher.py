import re

def compound_match(text, matchers):
    # sequentially match each matcher passed to this function
    # if the first one matches, the second one is tested where the first left off
    # if any match in the chain fails, the function returns None
    # otherwise return a list containing the result of each match
    matches = []
    
    for matcher in matchers:
        match_result = None
        if type(matcher) == str: # treat it as regex
            m = re.match(matcher, text)
            if m: match_result = m.group()
        elif callable(matcher): # treat it like a function; hopefully it only takes one argument
            m = matcher(text)
            if m: match_result = m
        
        if not match_result:
            return None

        matches.append(match_result)
        text = text[len(match_result):] # remove the matched text
    
    return matches