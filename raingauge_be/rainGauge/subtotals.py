## Premise: sending users ~28k records is unnecessary. Although we don't want to couple
## the front and backend too closely, it's worth considering that presently the graph
## displays at a maximum width of 760px, so ~28k records = ~37 datapoints crammed into
## each pixel = proooobably overkill

from django.db.models import Min, Max

def get_subtotal_config():
    NUM_RECORDS_PER_HOUR = 4
    ASCENDING_SUPPORTED_SIZES_IN_HOURS = [
        1 / NUM_RECORDS_PER_HOUR, 
        1, 3, 6, 12, 24
    ]

    return {
        'API_RESPONSE_RECORD_LIMIT': 1000,
        'NUM_RECORDS_PER_HOUR': NUM_RECORDS_PER_HOUR,
        'FALLBACK_SIZE_IN_HOURS': ASCENDING_SUPPORTED_SIZES_IN_HOURS[len(ASCENDING_SUPPORTED_SIZES_IN_HOURS) - 1],
        'ASC_SIZES_IN_HOURS': ASCENDING_SUPPORTED_SIZES_IN_HOURS
    }


def get_subtotals(query_set):
    """
        Converts a query set of RainGaugeReadings into JSON-able subtotal objects.
        Output:
        {
            'firstTimestamp': Date,
            'lastTimestamp': Date,
            'total': Float,
            'numReadings': Integer,
            'max': {
                'reading': Float,
                'count': Integer,
                'timestamp': Date,
            },
            'min': {
                'reading': Float,
                'count': Integer,
                'timestamp': Date,
            },
        }
    """

    size_in_hours = get_size_in_hours(query_set)
    sorted = query_set.order_by('timestamp')
    config = get_subtotal_config()

    subtotals = []
    working_subtotal = None

    working_min_hour = None
    working_max_hour = None
    working_hour_subtotal = 0

    for record in sorted:
        if working_subtotal == None:
            working_subtotal = create_new_subtotal_from(record)
        else:
            working_subtotal = update_subtotal(working_subtotal, record)

        if size_in_hours > 1:
            newSubtotal, newMin, newMax = update_min_max_hour_data(record, working_hour_subtotal, working_min_hour, working_max_hour)
            working_min_hour = newMin
            working_max_hour = newMax
            working_hour_subtotal = newSubtotal

        # If this reading is at the end of the subtotal block, store the now-finished working subtotal and reset
        if (    size_in_hours >= 1 and is_timestamp_end_of_full_hour_block(record, size_in_hours)
            or  size_in_hours == 1 / config['NUM_RECORDS_PER_HOUR']
            ) :
                if size_in_hours > 1:
                    working_subtotal['minHour'] = working_min_hour
                    working_subtotal['maxHour'] = working_max_hour
                    working_min_hour = None
                    working_max_hour = None

                subtotals.append(working_subtotal)
                working_subtotal = None

    # If the data ended partway through a subtotal time block, there could be an incomplete block: store that too
    if not working_subtotal == None:
        subtotals.append(working_subtotal)

    return subtotals


def get_size_in_hours(filtered_query_set):
    """
    For the specified data, get the highest resolution of data that's supported and within the 
    chosen response size limit for the API
    """
    config = get_subtotal_config()
    data_size = filtered_query_set.count()

    for this_size in config['ASC_SIZES_IN_HOURS']:
        num_subtotals = data_size / config['NUM_RECORDS_PER_HOUR'] / this_size

        if num_subtotals <= config['API_RESPONSE_RECORD_LIMIT']:
            return this_size
        
    return config['FALLBACK_SIZE_IN_HOURS']


def is_timestamp_end_of_full_hour_block(reading, numHours):
    # The HH:00 reading covers the rain that fell between HH:45 and HH:00, so it should be the 
    # last subtotal in each hour, rather than the first
    intNumHours = int(numHours)
    return reading.timestamp.hour % intNumHours == 0 and reading.timestamp.minute == 00


def create_new_subtotal_from(record):
    default = {
        'firstTimestamp': record.timestamp,
        'lastTimestamp': record.timestamp,
        'total': record.reading,
        'numReadings': 1,
        'max': {
            'reading': record.reading,
            'count': 1,
            'timestamp': record.timestamp,
        },
        'min': {
            'reading':  record.reading,
            'count': 1,
            'timestamp': record.timestamp,
        },
    }

    return default


def update_subtotal(subtotal, record):
    newMax = update_min_max_object(subtotal['max'], record.reading, record.timestamp, record.reading > subtotal['max']['reading'])
    newMin = update_min_max_object(subtotal['min'], record.reading, record.timestamp, record.reading < subtotal['min']['reading'])

    return {
        'firstTimestamp': subtotal['firstTimestamp'],
        'lastTimestamp': record.timestamp,
        'total' : subtotal['total'] + record.reading,
        'numReadings': subtotal['numReadings'] + 1,
        'max': newMax,
        'min': newMin,
    }


def update_min_max_object(subtotalMinOrMaxObj, reading, timestamp, want_replace):
    # GOAL:
    # Min and Max should both behave in the following way:

    #   If the new record exceeds the previous min/max:
    #       Record its reading as the new min/max reading
    #       Restart the count at "1"
    #       Record its timestamp

    #   If the new record equals the previous min/max:
    #       +1 to the count
    #       Remove the now-meaningless timestamp, since we have more than


    if want_replace:
        count = 1
        reading = reading
        timestamp = timestamp

    elif reading == subtotalMinOrMaxObj['reading']:
        count = subtotalMinOrMaxObj['count'] + 1
        reading = reading
        timestamp = None

    else:
        count = subtotalMinOrMaxObj['count']
        reading = subtotalMinOrMaxObj['reading']
        timestamp = subtotalMinOrMaxObj['timestamp']

    return {
        'count': count,
        'reading': reading,
        'timestamp': timestamp
    }


def create_new_min_max_object(timestamp, total):
    return {
        'count': 1,
        'reading': total,
        'timestamp': timestamp
    } 


def update_min_max_hour_data(record, subtotal_in, min_in, max_in):

    updated_subtotal = 0 if record.timestamp.minute == 15 else subtotal_in + record.reading

    if record.timestamp.minute == 00:
        updated_min_hour = \
            create_new_min_max_object(record.timestamp, updated_subtotal) \
            if min_in == None \
            else update_min_max_object(min_in, updated_subtotal, record.timestamp, updated_subtotal < min_in['reading'])
        
        updated_max_hour = \
            create_new_min_max_object(record.timestamp, updated_subtotal) \
            if max_in == None \
            else update_min_max_object(max_in, updated_subtotal, record.timestamp, updated_subtotal > max_in['reading'])
    else:
        updated_min_hour = min_in
        updated_max_hour = max_in

    return updated_subtotal, updated_min_hour, updated_max_hour


def get_empty_working_hour():
    return {
        'total': 0,
        'last_timestamp': None,
    }


def find_min_group_and_total(hour_groups):
    total = hour_groups.aggregate(Min('total'))['total__min']
    filtered = hour_groups.filter(total=total)
    return total, filtered


def find_max_group_and_total(hour_groups):
    total = hour_groups.aggregate(Max('total'))['total__max']
    filtered = hour_groups.filter(total=total)

    if len(filtered) == 0:
        for hg in hour_groups:
            if hg['total'] > 0:
                print(f"{hg['hour']} {hg['total']}")

    return total, filtered


def format_group_data(total, group):
    count = len(group)

    if count <= 1:
        print(f"count = { count }")

    return {
        'reading': total,
        'count': count,
        'description': None if count > 1 else group[0]['hour']
    }