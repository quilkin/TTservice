using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace TTService
{

    [DataContract]
    public class Club
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public string Abbr { get; set; }

        public Club(int id, string club, string abbr)
        {
            ID = id;
            Name = club;
            Abbr = abbr;
        }
    }

}