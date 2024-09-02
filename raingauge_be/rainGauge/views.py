from django.http import JsonResponse, HttpResponse
from datetime import datetime

from rainGauge.models import RainGaugeReading


def api(request):
    if request.method == 'GET':
        readings = RainGaugeReading.objects.all()
        readingsSerialised = []
        for r in readings:
            readingsSerialised.append(r.serialise())

        return JsonResponse({
           'greeting': "Hello from Django!",
           'data': readingsSerialised
        }, status = 200)

    return JsonResponse({}, 405)



def convertGetQueryToDatetime(queryStr):
    # take whatever the query parameter ends up being and turn it into a datetime object that Django can use to filter data
    return datetime.today()