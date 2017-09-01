import gpxpy.parser as parser

class GPXData:

    """Creates a new object representing the GPX file contents.

    Parameters:
    path    The path to the .gpx file
    """
    def __init__(self, path):
        self._data_time = []
        self._data_latitude = []
        self._data_longitude = []
        self._data_elevation = []
        self._data_speed = []

        with open(path, 'r') as file:
            gpx_parser = parser.GPXParser(file)
            gpx = gpx_parser.parse()

            # TODO: make this defined behaviour even if the lists are empty
            track = gpx.tracks[0]
            segment = track.segments[0]
            first_time_point = segment.points[0].time.timestamp()
            for point_index, point in enumerate(segment.points):
                # rel_time is measured in seconds from the first fix
                rel_time = point.time.timestamp() - first_time_point
                self._data_time.append(rel_time)
                self._data_latitude.append(point.latitude)
                self._data_longitude.append(point.longitude)
                self._data_elevation.append(point.elevation)
                self._data_speed.append(segment.get_speed(point_index))

        # the first speed value is null --> fix this
        self._data_speed[0] = 0.

        self._data = {
            'time': self._data_time,
            'latitude': self._data_latitude,
            'longitude': self._data_longitude,
            'elevation': self._data_elevation,
            'speed': self._data_speed,
        }

    def get_data(self):
        return self._data
    
    def get_first_data_point(self):
        # TODO: make this defined behaviour even if the lists are empty
        point = {
            'time': self._data_time[0],
            'latitude': self._data_latitude[0],
            'longitude': self._data_longitude[0],
            'elevation': self._data_elevation[0],
            'speed': self._data_speed[0],
        }
        return point
