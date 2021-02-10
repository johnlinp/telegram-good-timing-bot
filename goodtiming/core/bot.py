import goodtiming.core.i18n

from goodtiming.core.parser import CompositeParser
from goodtiming.core.processor import CompositeProcessor
from goodtiming.core.renderer import CompositeRenderer

import goodtiming.modules.addtodo
import goodtiming.modules.huh


class Bot:
    def __init__(self, language):
        self.parser = CompositeParser([
            goodtiming.modules.addtodo.AddTodoParser(),
            goodtiming.modules.huh.HuhParser(),
        ])

        self.processor = CompositeProcessor([
            goodtiming.modules.addtodo.AddTodoProcessor(),
            goodtiming.modules.huh.HuhProcessor(),
        ])

        self.renderer = CompositeRenderer([
            goodtiming.modules.addtodo.AddTodoRenderer(),
            goodtiming.modules.huh.HuhRenderer(),
        ])

    def start(self):
        return _('Start!')

    def help(self):
        return _('Help!')

    def chat(self, message):
        request = self.parser.parse(message)
        response = self.processor.process(request)
        return self.renderer.render(response)
