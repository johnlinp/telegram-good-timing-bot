import goodtiming.modules.addtodo

class CompositeRenderer:
    def __init__(self, sub_renderers):
        self.sub_renderers = sub_renderers

    def render(self, response):
        for sub_renderer in self.sub_renderers:
            reply = sub_renderer.render(response)
            if reply is not None:
                return reply
        return None
