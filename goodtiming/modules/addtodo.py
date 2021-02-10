import re

from goodtiming.core.request import Request
from goodtiming.core.response import Response


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
    def process(self, request):
        if request.kind != 'ADD-TODO':
            return None
        return Response(request.kind, {
            'plan': request.arguments['plan'],
            'timing': request.arguments['timing'],
        })


class AddTodoRenderer:
    def render(self, response):
        if response.kind != 'ADD-TODO':
            return None
        return _('Okay, I will remind you to {plan} when you are {timing}.').format(**response.arguments)
