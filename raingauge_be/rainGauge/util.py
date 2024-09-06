import datetime 


def get_date_from_get_arg(arg_str):
    """
    Converts a date from a GET query into a date object.
    If this doesn't work, it will use the timestamp from the record instead
    """

    try:
        date_obj = datetime.datetime.strptime(arg_str, '%Y-%m-%dT%H:%M')
        return date_obj
    
    except:
        return None