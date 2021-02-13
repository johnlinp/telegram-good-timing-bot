import goodtiming.core.i18n

from goodtiming.core.parser import CompositeParser
from goodtiming.core.processor import CompositeProcessor
from goodtiming.core.renderer import CompositeRenderer

import goodtiming.core.database

import goodtiming.modules.addtodo
import goodtiming.modules.reporttiming
import goodtiming.modules.done
import goodtiming.modules.huh


class Bot:
    def __init__(self, language):
        self.database = goodtiming.core.database.Database()

        self.parser = CompositeParser([
            goodtiming.modules.addtodo.AddTodoParser(),
            goodtiming.modules.reporttiming.ReportTimingParser(),
            goodtiming.modules.done.DoneParser(),
            goodtiming.modules.huh.HuhParser(),
        ])

        self.processor = CompositeProcessor([
            goodtiming.modules.addtodo.AddTodoProcessor(),
            goodtiming.modules.reporttiming.ReportTimingProcessor(),
            goodtiming.modules.done.DoneProcessor(),
            goodtiming.modules.huh.HuhProcessor(),
        ])

        self.renderer = CompositeRenderer([
            goodtiming.modules.addtodo.AddTodoRenderer(),
            goodtiming.modules.reporttiming.ReportTimingRenderer(),
            goodtiming.modules.done.DoneRenderer(),
            goodtiming.modules.huh.HuhRenderer(),
        ])

    def start(self, doer_id):
        try:
            self.database.execute('INSERT INTO doer (doer_id) VALUES (%s)', (doer_id,))
        except goodtiming.core.database.DatabaseUniqueViolation:
            pass
        return _('Welcome!\nType \"buy some socks when I am at grocery store\" or type /help to see the usage.')

    def help(self):
        return _('I can understand the following patterns:\n\n1. <do something> when I am <some timing>\n2. I am <some timing>\n3. The one about <something> is done')

    def chat(self, message, doer_id):
        request = self.parser.parse(message)
        response = self.processor.process(request, doer_id)
        return self.renderer.render(response)
