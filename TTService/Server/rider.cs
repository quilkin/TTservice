using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;


namespace TTService
{
    
    [DataContract]
    public class Rider
    {
        public enum Categories { Senior=1, Vet, Junior, Juvenile, Lady, LadyVet };

        [DataMember]
        public int ID { get; set; }
        [DataMember]
        public string Name { get; set; }
        [DataMember]
        public int Age { get; set; }
        [DataMember]
        public bool Lady { get; set; }
        [DataMember]
        public int ClubID { get; set; }
        [DataMember]
        public string Club { get; set; }
        [DataMember]
        public string Email { get; set; }
        [DataMember]
        public int Best25 { get; set; }


        public Categories Category { get; set; }
        public DateTime DOB { get; set; }
        //public TimeSpan time10;
        //public TimeSpan time25;
        //public TimeSpan timeAggregate;

        //public TimeSpan vetStandard;
        public bool inEvent;
        public string email;

        public bool justAdded;



        public Rider()
        {
            Name = "new rider";
            Age = 40;
        }
        public void UpdateCategory()
        {
            if (Age < 16)
                Category = Categories.Juvenile;
            else if (Age < 18)
                Category = Categories.Junior;
            else if (Age >= 40)
            {
                //if (Category == Categories.Lady || Category == Categories.LadyVet)
                if (Lady)
                    Category = Categories.LadyVet;
                else
                    Category = Categories.Vet;
            }
        }
        //public Rider(int id, string name, Categories cat, DateTime dob, string club)
        //{
        //    ID = id;
        //    Name = name;
        //    Category = cat;
        //    DOB = dob;
        //    Club = club;

        //    Age = (DateTime.Now.Year - dob.Year);
        //    UpdateCategory();

        //}
        public Rider(int id, string name, int age, bool lady,int clubID, int best25, string email)
        {
            ID = id;
            Name = name;
            Age = age;
            Lady = lady;
            Best25 = best25;
            Email = email;
            DOB = DateTime.Now.AddYears(-age);
            ClubID= clubID;
            UpdateCategory();
        }

        //public void FindAggregate()
        //{
        //    // calculate performance based on previous results
        //    if (time10 != TimeSpan.Zero && time25 != TimeSpan.Zero)
        //    {
        //        timeAggregate = new TimeSpan((time10.Ticks * 5 + time25.Ticks * 2) / 10);
        //    }
        //    else if (time25 != TimeSpan.Zero)
        //    {
        //        timeAggregate = new TimeSpan((time25.Ticks * 4) / 10);
        //    }
        //    else if (time10 != TimeSpan.Zero)
        //    {
        //        timeAggregate = new TimeSpan((time10.Ticks * 10) / 10);
        //    }
        //    else
        //    {
        //        // performance of rider unknown
        //        timeAggregate = new TimeSpan(23, 59, 59);
        //    }
        //}

        //public TimeSpan VetStandardTime(int distance)
        //{
        //    int ageOver40 = Age - 40;
        //    if (Category == Categories.LadyVet)
        //        ageOver40 += 8; // eight years difference on standard times
        //    if (ageOver40 >= 0)
        //    {
        //        if (distance != 10 && distance != 25)
        //        {
        //            distance = 10;
        //        }
        //        if (distance == 10)
        //        {
        //            try
        //            {
        //                vetStandard = VetStandard.TenMile[ageOver40];
        //            }
        //            catch
        //            {
        //                vetStandard = VetStandard.TenMile[VetStandard.TenMile.Length - 1];
        //            }
        //        }
        //        else
        //        {
        //            try
        //            {
        //                vetStandard = VetStandard.Twenty5Mile[ageOver40];
        //            }
        //            catch
        //            {
        //                vetStandard = VetStandard.Twenty5Mile[VetStandard.Twenty5Mile.Length - 1];
        //            }
        //        }
        //    }
        //    else
        //        vetStandard = new TimeSpan(0, 0, 0);
        //    return vetStandard;


        //}
    }
}