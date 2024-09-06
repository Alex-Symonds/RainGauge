## Premise: sending users ~28k records is unnecessary. Although we don't want to couple
## the front and backend too closely, it's worth considering that presently the graph
## displays at a maximum width of 760px, so ~28k records = ~37 datapoints crammed into
## each pixel = proooobably overkill
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
        }
    """

    size_in_hours = get_size_in_hours(query_set)
    sorted = query_set.order_by('timestamp')
    config = get_subtotal_config()

    subtotals = []
    working_subtotal = None

    for record in sorted:
        if working_subtotal == None:
            working_subtotal = create_new_subtotal_from(record)
        else:
            working_subtotal = update_subtotal(working_subtotal, record)

        # If this reading is at the end of the subtotal block, store the now-finished working subtotal and reset
        if (    size_in_hours >= 1    and is_timestamp_end_of_full_hour_block(record, size_in_hours)
            or  size_in_hours == 1 / config['NUM_RECORDS_PER_HOUR']
            ) :
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
    return {
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


def update_subtotal(subtotal, record):
    newMax = get_new_min_max_object(subtotal['max'], record, record.reading > subtotal['max']['reading'])
    newMin = get_new_min_max_object(subtotal['min'], record, record.reading < subtotal['min']['reading'])

    return {
        'firstTimestamp': subtotal['firstTimestamp'],
        'lastTimestamp': record.timestamp,
        'total' : subtotal['total'] + record.reading,
        'numReadings': subtotal['numReadings'] + 1,
        'max': newMax,
        'min': newMin,
    }


def get_new_min_max_object(subtotalMinOrMaxObj, record, want_replace):
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
        reading = record.reading
        timestamp = record.timestamp

    elif record.reading == subtotalMinOrMaxObj['reading']:
        count = subtotalMinOrMaxObj['count'] + 1
        reading = record.reading
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
