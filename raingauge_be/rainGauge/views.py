from django.http import JsonResponse
from rainGauge.models import RainGaugeReading

def api(request):
    if request.method == 'GET':
        readings = RainGaugeReading.objects.all()
        readingsSerialised = []
        for r in readings:
            readingsSerialised.append(r.serialise())

        return JsonResponse({
           'data': readingsSerialised
        }, status = 200)

    return JsonResponse({}, 405)