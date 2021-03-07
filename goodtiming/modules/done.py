import re

from goodtiming.core.request import Request
from goodtiming.core.response import Response

import goodtiming.core.database


class DoneModule:
    def parsers(self):
        return [DoneParser()]

    def processors(self):
        return [DoneProcessor()]

    def renderers(self):
        return [DoneRenderer()]


class DoneParser:
    def parse(self, message):
        match = re.match(_(r'^(the one about )?(?P<plan_pattern>.+) is done$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('DONE', {
            'plan_pattern': match.group('plan_pattern'),
        })


class DoneProcessor:
    def __init__(self):
        self.database = goodtiming.core.database.Database()

    def process(self, request, doer_id):
        if request.kind != 'DONE':
            return None

        plan_pattern = request.arguments['plan_pattern']
        current_timing = self._get_current_timing(doer_id)
        matched_plans = self._get_matched_plans(doer_id, current_timing, plan_pattern)
        self._delete_todo(doer_id, current_timing, plan_pattern)

        return Response(request.kind, {
            'plan_pattern': plan_pattern,
            'matched_plans': matched_plans,
        })

    def _get_current_timing(self, doer_id):
        rows = self.database.fetch('SELECT current_timing FROM doer WHERE doer_id = %s', (doer_id,))
        return rows[0][0]

    def _get_matched_plans(self, doer_id, current_timing, plan_pattern):
        rows = self.database.fetch('SELECT plan FROM todo WHERE doer_id = %s AND timing LIKE %s AND plan LIKE %s', (doer_id, '%{}%'.format(current_timing), '%{}%'.format(plan_pattern)))
        return [row[0] for row in rows]

    def _delete_todo(self, doer_id, current_timing, plan_pattern):
        self.database.execute('DELETE FROM todo WHERE doer_id = %s AND timing LIKE %s AND plan LIKE %s', (doer_id, '%{}%'.format(current_timing), '%{}%'.format(plan_pattern)))


class DoneRenderer:
    def render(self, response):
        if response.kind != 'DONE':
            return None

        plan_pattern = response.arguments['plan_pattern']
        matched_plans = response.arguments['matched_plans']
        if len(matched_plans) == 0:
            return _("I couldn't find anything about {plan_pattern}.").format(plan_pattern=plan_pattern)
        elif len(matched_plans) == 1:
            return _('Great! I already marked "{plan}" as done.').format(plan=matched_plans[0])
        else:
            return _('Great! I already marked these things as done:\n{plans}').format(plans='\n'.join(matched_plans))
