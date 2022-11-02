import re

from goodtiming.core.request import Request
from goodtiming.core.response import Response

import goodtiming.core.database
import goodtiming.util.stringutil


class ReportTimingModule:
    def parsers(self):
        return [ReportPresentTimingParser(), ReportPastTimingParser()]

    def processors(self):
        return [ReportTimingProcessor()]

    def renderers(self):
        return [ReportPresentTimingRenderer(), ReportPastTimingRenderer()]


class ReportPresentTimingParser:
    def parse(self, message):
        match = re.match(_(r'^i am (?P<timing>.+)$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('REPORT-PRESENT-TIMING', {
            'timing': match.group('timing'),
        })


class ReportPastTimingParser:
    def parse(self, message):
        match = re.match(_(r'^i was (?P<timing>.+)$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('REPORT-PAST-TIMING', {
            'timing': match.group('timing'),
        })


class ReportTimingProcessor:
    def __init__(self):
        self.database = goodtiming.core.database.Database()

    def process(self, request, doer_id):
        if request.kind != 'REPORT-PRESENT-TIMING' and request.kind != 'REPORT-PAST-TIMING':
            return None

        self.database.execute('UPDATE doer SET current_timing = %s WHERE doer_id = %s', (request.arguments['timing'], doer_id))

        rows = self.database.fetch('SELECT plan FROM todo WHERE doer_id = %s AND LOWER(timing) LIKE LOWER(%s)', (doer_id, '%{}%'.format(request.arguments['timing'])))
        plans = [row[0] for row in rows]
        return Response(request.kind, {
            'plans': plans,
        })


class ReportPresentTimingRenderer:
    def render(self, response):
        if response.kind != 'REPORT-PRESENT-TIMING':
            return None
        plans = response.arguments['plans']
        if len(plans) == 0:
            return _('Nothing to do.')
        elif len(plans) == 1:
            return _('Go {plan}.').format(plan=plans[0])
        else:
            return _('Go do these things:\n{plans}').format(plans=goodtiming.util.stringutil.format_items(plans))


class ReportPastTimingRenderer:
    def render(self, response):
        if response.kind != 'REPORT-PAST-TIMING':
            return None
        plans = response.arguments['plans']
        if len(plans) == 0:
            return _('Nothing to do.')
        elif len(plans) == 1:
            return _('You should have done {plan}.').format(plan=plans[0])
        else:
            return _('You should have done these things:\n{plans}').format(plans=goodtiming.util.stringutil.format_items(plans))
