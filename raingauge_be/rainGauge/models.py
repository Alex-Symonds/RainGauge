from django.db import models

class RainGaugeReading(models.Model):
    """
        One reading from a rain gauge
    """
    timestamp = models.DateTimeField()
    reading = models.DecimalField(decimal_places=1, max_digits=4)
    
    def __str__(self):
        return f'Reading at {self.timestamp}: {self.reading}'
