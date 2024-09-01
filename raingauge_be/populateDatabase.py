import pandas as pd

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rainGauge.settings")
import django
django.setup()

from rainGauge.models import RainGaugeReading


def main():
    dataframe = pd.read_excel('Data.xlsx')
    model_instances = [RainGaugeReading(timestamp=row.time, reading=row.RG_A) for row in dataframe.itertuples()]
    RainGaugeReading.objects.bulk_create(model_instances)

main()