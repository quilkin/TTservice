using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace TTService
{
    [DataContract]
    public class Location
    {
        [DataMember(Name = "latitude")]
        public double Latitude { get; set; }
        [DataMember(Name = "longitude")]
        public double Longitude { get; set; }
        //[DataMember(Name = "speed")]
        //public double Speed { get; set; }
        //[DataMember(Name = "bearing")]
        //public double Bearing { get; set; }
        //[DataMember(Name = "altitude")]
        //public double Altitude { get; set; }
        [DataMember(Name = "recorded_at")]
        public String Time { get; set; }
        [DataMember(Name = "owner")]
        public int Owner { get; set; }

        public Location(double lat, double lon, String t, int ow)
        {
            Latitude = lat;
            Longitude = lon;
            Time = t;
            Owner = ow;
        }

    }
}