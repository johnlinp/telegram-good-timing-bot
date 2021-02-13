import goodtiming.modules.addtodo

class CompositeParser:
    def __init__(self, sub_parsers):
        self.sub_parsers = sub_parsers

    def parse(self, message):
        for sub_parser in self.sub_parsers:
            request = sub_parser.parse(message)
            if request is not None:
                return request
        return None
