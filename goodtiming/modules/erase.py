import re

from goodtiming.core.request import Request
from goodtiming.core.response import Response

import goodtiming.core.database
import goodtiming.util.stringutil


class EraseModule:
    def parsers(self):
        return [BareDoneParser(), PlanDoneParser(), BareCancelParser(), PlanCancelParser()]

    def processors(self):
        return [EraseProcessor()]

    def renderers(self):
        return [PlanNotFoundRenderer(), TooManyPlansRenderer(), PlanErasedRenderer()]


class PlanDoneParser:
    def parse(self, message):
        match = re.match(_(r'^(the one about )?(?P<plan_pattern>.+) is done$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('ERASE', {
            'action': 'DONE',
            'plan_pattern': match.group('plan_pattern'),
        })


class BareDoneParser:
    def parse(self, message):
        match = re.match(_(r"^(it's )?done$"), message, re.IGNORECASE)
        if not match:
            return None
        return Request('ERASE', {
            'action': 'DONE',
            'plan_pattern': None,
        })


class PlanCancelParser:
    def parse(self, message):
        match = re.match(_(r'^cancel (the one about )?(?P<plan_pattern>.+)$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('ERASE', {
            'action': 'CANCEL',
            'plan_pattern': match.group('plan_pattern'),
        })


class BareCancelParser:
    def parse(self, message):
        match = re.match(_(r'^cancel it$'), message, re.IGNORECASE)
        if not match:
            return None
        return Request('ERASE', {
            'action': 'CANCEL',
            'plan_pattern': None,
        })


class EraseProcessor:
    def __init__(self):
        self.database = goodtiming.core.database.Database()

    def process(self, request, doer_id):
        if request.kind != 'ERASE':
            return None

        plan_pattern = request.arguments['plan_pattern']
        current_timing = self._get_current_timing(doer_id)
        matched_plans = self._get_matched_plans(doer_id, current_timing, plan_pattern)
        if len(matched_plans) == 0:
            return Response('PLAN-NOT-FOUND', {
                'plan_pattern': plan_pattern,
            })
        elif len(matched_plans) > 1:
            return Response('TOO-MANY-PLANS', {
                'matched_plans': matched_plans,
            })

        matched_plan = matched_plans[0]
        self._delete_todo(doer_id, current_timing, matched_plan)

        return Response('PLAN-ERASE', {
            'action': request.arguments['action'],
            'matched_plan': matched_plan,
        })

    def _get_current_timing(self, doer_id):
        rows = self.database.fetch('SELECT current_timing FROM doer WHERE doer_id = %s', (doer_id,))
        return rows[0][0]

    def _get_matched_plans(self, doer_id, current_timing, plan_pattern):
        if plan_pattern is None:
            rows = self.database.fetch('SELECT plan FROM todo WHERE doer_id = %s AND timing LIKE %s', (doer_id, '%{}%'.format(current_timing)))
        else:
            rows = self.database.fetch('SELECT plan FROM todo WHERE doer_id = %s AND timing LIKE %s AND plan LIKE %s', (doer_id, '%{}%'.format(current_timing), '%{}%'.format(plan_pattern)))
        return [row[0] for row in rows]

    def _delete_todo(self, doer_id, current_timing, matched_plan):
        self.database.execute('DELETE FROM todo WHERE doer_id = %s AND timing LIKE %s AND plan = %s', (doer_id, '%{}%'.format(current_timing), matched_plan))


class PlanNotFoundRenderer:
    def render(self, response):
        if response.kind != 'PLAN-NOT-FOUND':
            return None

        plan_pattern = response.arguments['plan_pattern']
        if plan_pattern is None:
            return _("I couldn't find anything.").format()
        else:
            return _("I couldn't find anything about {plan_pattern}.").format(plan_pattern=response.arguments['plan_pattern'])


class TooManyPlansRenderer:
    def render(self, response):
        if response.kind != 'TOO-MANY-PLANS':
            return None

        matched_plans = response.arguments['matched_plans']
        return _('There are multiple things I found:\n{plans}\nPlease specify only one at a time.').format(plans=goodtiming.util.stringutil.format_items(matched_plans))


class PlanErasedRenderer:
    def render(self, response):
        if response.kind != 'PLAN-ERASE':
            return None

        if response.arguments['action'] == 'DONE':
            return _('Great! I already marked "{plan}" as done.').format(plan=response.arguments['matched_plan'])
        if response.arguments['action'] == 'CANCEL':
            return _('Okay, I already cancelled "{plan}".').format(plan=response.arguments['matched_plan'])
        raise AssertionError('should not happen')
