
from datetime import datetime, date

class UHILookupTables:
    """Lookup tables for UHI corrections based on sunrise/sunset times"""
    
    # Table 4: Sunrise/sunset periods (month, day) -> sunrise/sunset category
    SUNRISE_SUNSET_PERIODS = [
        ((4, 1), (4, 12), "5/18"),    # April 1 - April 12
        ((4, 13), (4, 19), "5/19"),   # April 13 - April 19
        ((4, 20), (5, 19), "4/19"),   # April 20 - May 19
        ((5, 20), (5, 25), "4/20"),   # May 20 - May 25
        ((5, 26), (7, 10), "3/20"),   # May 26 - July 10
        ((7, 11), (7, 30), "4/20"),   # July 11 - July 30
        ((7, 31), (8, 21), "4/19"),   # July 31 - August 21
        ((8, 22), (8, 30), "5/19"),   # August 22 - August 30
        ((8, 31), (9, 24), "5/18"),   # August 31 - September 24
        ((9, 25), (9, 27), "5/17"),   # September 25 - September 27
        ((9, 28), (9, 30), "6/17"),   # September 28 - September 30
    ]
    
    # Table 5: UHI factors per hour (UTC) for each sunrise/sunset category
    UHI_FACTORS = {
        "6/17": [0.748, 0.667, 0.602, 0.525, 0.449, 0.281, 0.127, 0.063, 0.019, -0.015, -0.020, 0.000, 0.030, 0.065, 0.117, 0.205, 0.335, 0.532, 0.747, 0.906, 0.975, 1.000, 0.931],
        "5/17": [0.728, 0.640, 0.573, 0.490, 0.355, 0.150, 0.078, 0.025, -0.013, -0.020, -0.001, 0.025, 0.056, 0.090, 0.165, 0.270, 0.413, 0.600, 0.803, 0.920, 0.978, 1.000, 0.925],
        "5/18": [0.807, 0.704, 0.617, 0.533, 0.435, 0.227, 0.095, 0.032, -0.009, -0.020, -0.003, 0.020, 0.048, 0.080, 0.136, 0.215, 0.325, 0.485, 0.662, 0.849, 0.932, 0.979, 1.000],
        "5/19": [0.910, 0.780, 0.675, 0.590, 0.490, 0.320, 0.120, 0.040, -0.005, -0.020, -0.004, 0.016, 0.042, 0.071, 0.111, 0.176, 0.270, 0.386, 0.546, 0.716, 0.877, 0.941, 0.981],
        "4/19": [0.900, 0.757, 0.710, 0.543, 0.413, 0.150, 0.057, 0.000, -0.020, -0.005, 0.013, 0.037, 0.063, 0.090, 0.150, 0.222, 0.318, 0.450, 0.600, 0.762, 0.890, 0.950, 0.982],
        "4/20": [1.000, 0.888, 0.728, 0.609, 0.490, 0.256, 0.079, 0.007, -0.020, -0.006, 0.010, 0.033, 0.056, 0.082, 0.128, 0.184, 0.270, 0.366, 0.506, 0.651, 0.803, 0.901, 0.958],
        "3/20": [1.000, 0.866, 0.690, 0.560, 0.380, 0.107, 0.015, -0.020, -0.007, 0.007, 0.029, 0.050, 0.074, 0.108, 0.161, 0.228, 0.312, 0.424, 0.556, 0.695, 0.838, 0.911, 0.964],
    }
    
    @staticmethod
    def get_sunrise_sunset_category(dt: datetime) -> str:
        """
        Determine the sunrise/sunset category for a given date.
        
        :param dt: datetime object
        :return: sunrise/sunset category string (e.g., "5/18")
        """
        month = dt.month
        day = dt.day
        
        for (start_month, start_day), (end_month, end_day), category in UHILookupTables.SUNRISE_SUNSET_PERIODS:
            start_date = date(dt.year, start_month, start_day)
            end_date = date(dt.year, end_month, end_day)
            current_date = date(dt.year, month, day)
            
            if start_date <= current_date <= end_date:
                return category
        
        # If date is outside the defined periods, return None or raise exception
        raise ValueError(f"Date {dt.date()} is outside defined UHI lookup periods (April 1 - September 30)")
    
    @staticmethod
    def get_uhi_factor(dt: datetime) -> float:
        """
        Get the UHI correction factor for a given datetime.
        
        :param dt: datetime object (should be in UTC)
        :return: UHI factor
        """
        category = UHILookupTables.get_sunrise_sunset_category(dt)
        hour = dt.hour
        
        # Handle hour 23 (wraps to next day)
        if hour == 23:
            return UHILookupTables.UHI_FACTORS[category][22]
        
        if hour < 0 or hour > 22:
            raise ValueError(f"Hour must be between 0 and 23, got {hour}")
        
        return UHILookupTables.UHI_FACTORS[category][hour]
    