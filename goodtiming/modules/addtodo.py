import re

from goodtiming.core.request import Request
from goodtiming.core.response import Response

import goodtiming.core.database


class AddTodoModule:
    def parsers(self):
        return [AddTodoParser()]

    def processors(self):
        return [AddTodoProcessor()]

    def renderers(self):
        return [TodoAddedRenderer(), AlreadyToldTodoRenderer()]


class AddTodoParser:
    def parse(self, message):
        match = re.match(_(r'^(?P<plan>.+) when i am (?P<timing>.+)$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('ADD-TODO', {
            'plan': match.group('plan'),
            'timing': match.group('timing'),
        })


class AddTodoProcessor:
    def __init__(self):
        self.database = goodtiming.core.database.Database()

    def process(self, request, doer_id):
        if request.kind != 'ADD-TODO':
            return None

        try:
            self.database.execute('INSERT INTO todo (doer_id, timing, plan) VALUES (%s, %s, %s)', (doer_id, request.arguments['timing'], request.arguments['plan']))
            return Response('TODO-ADDED', {
                'plan': request.arguments['plan'],
                'timing': request.arguments['timing'],
            })
        except goodtiming.core.database.DatabaseUniqueViolation:
            return Response('ALREADY-TOLD-TODO', {})


class TodoAddedRenderer:
    def render(self, response):
        if response.kind != 'TODO-ADDED':
            return None
        return _('Okay, I will remind you to {plan} when you are {timing}.').format(**response.arguments)


class AlreadyToldTodoRenderer:
    def render(self, response):
        if response.kind != 'ALREADY-TOLD-TODO':
            return None
        return _('You already told me that.')
