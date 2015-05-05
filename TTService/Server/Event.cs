using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace TTService
{
    [DataContract]
    public class Course
    {
        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public int Distance { get; set; }
        [DataMember]
        public string Name { get; set; }

        
        public Course(int id, int distance, string name)
        {
            ID = id;
            Name = name;
            Distance = distance;
        }
    }

    [DataContract]
    public class Entry
    {
//    // an entry for a single rider in a single event
//function Entry(ID, number, start, finish, rider) {
//    this.ID = ID;
//    this.Number = number;
//    this.Start = start;
//    this.Finish = finish;
//    this.Rider = rider;
//    this.Position = 0;

        [DataMember]
        public int EventID { get; set; }
        [DataMember]
        public int Number { get; set; }
        [DataMember]
        public long Start { get; set; }
        [DataMember]
        public long Finish { get; set; }
        [DataMember]
        public int RiderID { get; set; }
        [DataMember]
        public int Position { get; set; }

        DateTime StartTime { get; set; }
        DateTime FinishTime { get; set; }

        public Entry(int num, long start, long finish, int riderid, int pos)
        {
            Number = num;
            RiderID = riderid;
            Position = pos;
            Start = start;
            Finish = finish;
            // .NET time starts AT 0001; Javascript time starts 1970
            //StartTime = new DateTime(1969,1,1).AddMilliseconds((start));
            //FinishTime = new DateTime(1969, 1, 1).AddMilliseconds((finish));
            StartTime = Event.JSTimeToNetTime(start);
            FinishTime = Event.JSTimeToNetTime(finish);
        }
    }


    [DataContract]
    public class Event
    {
        const int maxEntries = 200;

        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public int CourseID { get; set; }
        [DataMember]
        public int ClubID { get; set; }
        // start time in millisecs
        [DataMember]
        public long Time { get; set; }
        [DataMember]
        public Entry[] Entries { get; set; }
        [DataMember]
        public int OddData { get; set; }

        public DateTime StartTime { get; set; }

        public Event(int id, int courseID, long start, int clubid,  Entry[] elist)
        {
            ID = id;
            CourseID = courseID;
            ClubID = clubid;
            StartTime = new DateTime(start);
            Time = start;
            Entries = elist;
            OddData = 0;
        }
        public static long NetTimeToJSTime(DateTime time)
        {
            DateTime t = new DateTime(1970, 1, 1);
            TimeSpan ts = time - t;
            return (long)ts.TotalMilliseconds;
        }
        public static DateTime JSTimeToNetTime(long time)
        {
            DateTime t = new DateTime(1970, 1, 1);
            return t.AddMilliseconds(time);
        }

        // sort rider order according to their previous times, as far as possible, 
        // with seeds at each 10,20,30,... and 5,15,25... etc.

        private void SeededSortPart(ref List<Entry> sortedRows, ref List<Entry> newRows, int seed)
        {
            // use a TimeSpan for start & end times, to avoid date apeparing in columns
            //TimeSpan startTimeSpan = new TimeSpan(StartTime.Hour, StartTime.Minute, 0);
            long start = this.Time;

            int ridersToSort = sortedRows.Count;
            int digitsToSort = ridersToSort / 10;
            if (seed <= ridersToSort % 10)
                ++digitsToSort;

            //for (int row = 0; row < timeTrial1.Riders.Count; row++)
            //{
            //    if (row >= ridersToSort)
            //        // rest of riders are not in event
            //        break;
                // the rider number that now needs to be first
                //int riderNumber = (int)sortedRows[row]["Number"];

                foreach (Entry rRow in sortedRows)
                {
                  //  if (rRow.Number == riderNumber)
                    {
                        //Rider r = new Rider(rRow);
                        Entry entry = new Entry(rRow.Number, rRow.Start, rRow.Finish, rRow.RiderID, rRow.Position);
                        //TimeTrial1.EventRow eRow;

                        if (newRows.Find(delegate(Entry newrow)
                        { return entry.RiderID == newrow.RiderID; }) != null)
                            // rider already placed
                            continue;

                        //eRow = timeTrial1.Event.NewEventRow();

                        //eRow.Name = r.name;
                        //eRow.Club = r.club;
                        //eRow.Category = r.cat.ToString();
                        //eRow.VetStd = r.VetStandardTime(int.Parse(this.comboDistance.Text));
                        if (digitsToSort > 0 /*&& (int)sortedRows[row]["Number"] == -1*/)
                        {
                            entry.Number = digitsToSort * 10 + seed - 10;
                            //if (seed == 10) eRow.Number -= 10; ;
                            --digitsToSort;
                        }
                        else
                            continue;

                       // entry.Start = startTimeSpan.Add(new TimeSpan(0, entry.Number, 0));
                        entry.Start = start + entry.Number * 60 * 1000;
                        //entry.TimeAggregate = ConvertTarget(r.timeAggregate);
                        newRows.Add(entry);
                    }
                }

            //}
        }

        public void SeededSort(ref List<Entry> entries)
        {
            
            long start = NetTimeToJSTime(this.StartTime);
       //     timeTrial1.Event.Rows.Clear();

        //    DataRow[] sortedRows = timeTrial1.Riders.Select("InEvent", "TargetTime asc");

        //    foreach (TimeTrial1.EventRow eRow in timeTrial1.Event.Rows)
            foreach (Entry e in entries)
            {
                if (e.Start > start)
                    start = e.Start;
            }
            int ridersToSort = entries.Count;

            // a temporary list to store the rows in before we finally sort it
            List<Entry> newRows = new List<Entry>();

            SeededSortPart(ref entries, ref newRows, 10);
            SeededSortPart(ref entries, ref newRows, 5);
            SeededSortPart(ref entries, ref newRows, 1);
            SeededSortPart(ref entries, ref newRows, 6);
            SeededSortPart(ref entries, ref newRows, 2);
            SeededSortPart(ref entries, ref newRows, 7);
            SeededSortPart(ref entries, ref newRows, 3);
            SeededSortPart(ref entries, ref newRows, 8);
            SeededSortPart(ref entries, ref newRows, 4);
            SeededSortPart(ref entries, ref newRows, 9);


            // now do the final sort
            // the rows in newRows are not in order but they now have the correct rider numbers
            //timeTrial1.Event.Rows.Clear();
            entries.Clear();
            for (int row = 1; row <= newRows.Count; row++)
            {
                foreach (Entry eRow in newRows)
                {
                    if (eRow.Number == row)
                    {
                        //timeTrial1.Event.AddEventRow(eRow);
                        entries.Add(eRow);
                       // Trace.WriteLine(eRow.Number + " " + eRow.Name);
                    }

                }
            }

        }
    }

}