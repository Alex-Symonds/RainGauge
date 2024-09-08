from django.http import JsonResponse
from rainGauge.models import RainGaugeReading

from rainGauge.subtotals import get_subtotals, get_subtotal_config
from rainGauge.util import get_date_from_get_arg

def api(request):
    if request.method == 'GET':

        # Prep info about all available data and get the config
        query_set = RainGaugeReading.objects.all()
        sorted = query_set.order_by('timestamp')
        minDate = sorted[0].timestamp
        maxDate = sorted[len(sorted) - 1].timestamp
        config = get_subtotal_config()

        # Obtain dates for the date range (from the GET params, if possible)
        start_arg = request.GET.get('start', None)
        end_arg = request.GET.get('end', None)

        start = get_date_from_get_arg(start_arg)
        end = get_date_from_get_arg(end_arg)
        if start == None or end_arg == None:
            start = minDate if start == None else start
            end = maxDate if end == None else end
        
        # Filter to the date range, then convert to subtotals so we're not handing out too much data
        filtered = query_set.filter(timestamp__gte=start, timestamp__lte=end)
        subtotals = get_subtotals(filtered)

        return JsonResponse({
           'subtotals': subtotals,
           'maxRecordsPerRequest': config['API_RESPONSE_RECORD_LIMIT'],
           'recordsPerHour': config['NUM_RECORDS_PER_HOUR'],
           'subtotalSizesInHours': config['ASC_SIZES_IN_HOURS'],
           'minDate': minDate,
           'maxDate': maxDate,
        }, status = 200)

    return JsonResponse({}, 405)