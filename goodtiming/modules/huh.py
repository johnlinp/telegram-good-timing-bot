from goodtiming.core.request import Request
from goodtiming.core.response import Response


class HuhParser:
    def parse(self, message):
        return Request('HUH', {})


class HuhProcessor:
    def process(self, request, doer_id):
        if request.kind != 'HUH':
            return None
        return Response(request.kind, request.arguments)


class HuhRenderer:
    def render(self, response):
        if response.kind != 'HUH':
            return None
        return _('Huh?')

