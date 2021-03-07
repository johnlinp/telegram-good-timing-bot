import re

from goodtiming.core.request import Request
from goodtiming.core.response import Response

import goodtiming.core.database


class ShowModule:
    def parsers(self):
        return [ShowParser()]

    def processors(self):
        return [ShowProcessor()]

    def renderers(self):
        return [ShowRenderer()]


class ShowParser:
    def parse(self, message):
        match = re.match(_(r'^(what to do)|(what now)|(what should i do)$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('SHOW', {})


class ShowProcessor:
    def __init__(self):
        self.database = goodtiming.core.database.Database()

    def process(self, request, doer_id):
        if request.kind != 'SHOW':
            return None

        rows = self.database.fetch('SELECT timing, plan FROM todo WHERE doer_id = %s', (doer_id,))
        todo = {}
        for row in rows:
            timing = row[0]
            plan = row[1]
            if timing not in todo:
                todo[timing] = []
            todo[timing].append(plan)

        return Response(request.kind, {
            'todo': todo,
        })


class ShowRenderer:
    def render(self, response):
        if response.kind != 'SHOW':
            return None

        todo = response.arguments['todo']
        if len(todo) == 0:
            return _('There is nothing to do for now.')

        results = []
        for timing in todo:
            plans = todo[timing]
            results.append(_('When you are {timing}:\n{plans}').format(timing=timing, plans='\n'.join(plans)))
        return '\n'.join(results)
