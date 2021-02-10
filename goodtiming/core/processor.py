import goodtiming.modules.addtodo

class CompositeProcessor:
    def __init__(self, sub_processors):
        self.sub_processors = sub_processors

    def process(self, request):
        for sub_processor in self.sub_processors:
            response = sub_processor.process(request)
            if response is not None:
                return response
        return None
