import re

from goodtiming.core.request import Request
from goodtiming.core.response import Response

import goodtiming.core.database


class ReportTimingParser:
    def parse(self, message):
        match = re.match(_(r'^i am (?P<timing>.+)$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('REPORT-TIMING', {
            'timing': match.group('timing'),
        })


class ReportTimingProcessor:
    def __init__(self):
        self.database = goodtiming.core.database.Database()

    def process(self, request, doer_id):
        if request.kind != 'REPORT-TIMING':
            return None
        rows = self.database.fetch('SELECT plan FROM todo WHERE doer_id = %s AND timing LIKE %s', (doer_id, '%{}%'.format(request.arguments['timing'])))
        plans = [row[0] for row in rows]
        return Response(request.kind, {
            'plans': plans,
        })


class ReportTimingRenderer:
    def render(self, response):
        if response.kind != 'REPORT-TIMING':
            return None
        plans = response.arguments['plans']
        if len(plans) == 0:
            return _('Nothing to do.')
        elif len(plans) == 1:
            return _('Go {plan}.').format(plan=plans[0])
        else:
            return _('Go do these things:\n{plans}').format(plans='\n'.join(plans))
