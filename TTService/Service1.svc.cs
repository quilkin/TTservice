using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Configuration;
using System.Globalization;
using System.Threading;

namespace TTService
{

    [DataContract]
    public class Login
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }
        [DataMember(Name= "pw")]
        public string PW { get; set; }
        [DataMember(Name = "email")]
        public string Email{ get; set; }
        [DataMember(Name = "code")]
        public int Code { get; set; }

        public Login(string name, string pw)
        {
            Name = name;
            PW = pw;
        }
        public Login(string name, string pw, string email)
        {
            Name = name;
            PW = pw;
            Email = email;
        }
        public int CalcCode()
        {
            return (Name.Length + PW.Length) * 417 + Email.Length;
        }
    }


    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the class name "Service1" in code, svc and config file together.
    // NOTE: In order to launch WCF Test Client for testing this service, please select Service1.svc or Service1.svc.cs at the Solution Explorer and start debugging.
    public class TTService : ITTService
    {

        SqlConnection ttConnection;

        DataTable dataRiders;
        List<Rider> riders;

        DataTable dataClubs;
        List<Club> clubs;

        DataTable dataCourses;
        List<Course> courses;

        DataTable dataEvents;
        List<Event> events;

        DataTable dataEntries;
        List<Entry> entries;

        DataTable dataLogins;

       string connection = Connections.connection;
       string smtpserver = Connections.smtpserver;
       string smtpUserName = Connections.smtpUserName;
       string smtpPassword = Connections.smtpPassword;
 
        public static string TimeString(DateTime time)
        {
            if (time == DateTime.MinValue)
                return System.DBNull.Value.ToString();
            //return time.ToString("G", DateTimeFormatInfo.InvariantInfo);
            return string.Format("{0}{1}{2} {3}:{4}:{5}",
                time.Year, time.Month.ToString("00"), time.Day.ToString("00"),
                time.Hour.ToString("00"),time.Minute.ToString("00"),time.Second.ToString("00"));
        }

        public TTService()
        {
        }

        public IEnumerable<Rider> GetRiders()
        {
            riders = new List<Rider>();
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);

            }
            string query = "SELECT riders.id, riders.name, riders.clubID, riders.age, riders.lady, riders.best25, riders.email "
                            + "FROM riders ORDER BY riders.name";
            using (SqlDataAdapter riderAdapter = new SqlDataAdapter(query, ttConnection))
            {
                dataRiders = new DataTable();
                riderAdapter.Fill(dataRiders);
                // ToDo: not efficient to convert table to  List<Rider> in order to provide the data
                int length = dataRiders.Rows.Count;
                for (int row = 0; row < length; row++)
                {
                    try
                    {
                        DataRow dr = dataRiders.Rows[row];
                        int id = (int)dr["id"];
                        string email = "";
                        if (!DBNull.Value.Equals(dr["email"]))
                            email = (string)dr["email"];
                        //int cat = (int)dr["cat"];
                        //riders.Add(new Rider(id, (string)dr["name"], (Rider.Categories)cat, (int)dr["age"], (int)dr["clubID"], (int)dr["best25"], email));
                        riders.Add(new Rider(id, (string)dr["name"], (int)dr["age"], (bool)dr["lady"],(int)dr["clubID"], (int)dr["best25"], email));

                    }
                    catch (Exception ex)
                    {
                        Trace.WriteLine(ex.Message);
                    }
                }
            }
            ttConnection.Close();
            return riders;
        }
        public IEnumerable<Club> GetClubs()
        {
            clubs = new List<Club>();
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);

            }
            string query = "SELECT * from clubs";
            using (SqlDataAdapter clubAdapter = new SqlDataAdapter(query, ttConnection))
            {
                dataClubs = new DataTable();
                clubAdapter.Fill(dataClubs);
                // ToDo: not efficient to convert table to  List<Clubs> in order to provide the data
                int length = dataClubs.Rows.Count;

                for (int row = 0; row < length; row++)
                {
                    DataRow dr = dataClubs.Rows[row];
                    clubs.Add(new Club((int)dr["id"], (string)dr["club"], (string)dr["abbr"]));
                }
            }
            ttConnection.Close();
            return clubs;
        }

        public IEnumerable<Course> GetCourses()
        {
            courses = new List<Course>();
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);

            }
            string query = "SELECT * from courses";
            using (SqlDataAdapter courseAdapter = new SqlDataAdapter(query, ttConnection))
            {
                dataCourses = new DataTable();
                courseAdapter.Fill(dataCourses);
                // ToDo: not efficient to convert table to  List<Clubs> in order to provide the data
                int length = dataCourses.Rows.Count;

                for (int row = 0; row < length; row++)
                {
                    DataRow dr = dataCourses.Rows[row];
                    courses.Add(new Course((int)dr["id"], (int)dr["distance"], (string)dr["name"]));
                }
            }
            ttConnection.Close();
            return courses;
        }

        public int Login(Login login)
        {
            string query = "SELECT Id, name, pw, email, role FROM logins";
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
               // return ex.Message;
            }
            int userRole = 0;
            using (SqlDataAdapter loginAdapter = new SqlDataAdapter(query, ttConnection))
            {
                dataLogins = new DataTable();
                loginAdapter.Fill(dataLogins);

                int length = dataLogins.Rows.Count;
                for (int row = 0; row < length; row++)
                {
                    DataRow dr = dataLogins.Rows[row];
                    string dbname = (string)dr["name"];
                    dbname = dbname.Trim();
                    string dbpw = (string)dr["pw"];
                    dbpw = dbpw.Trim();
                    if (dbname == login.Name && dbpw == login.PW)
                    {
                        userRole = (int)dr["role"];
                        break;
                    }
                }
            }
            ttConnection.Close();
            return userRole;

        }

        public string Signup(Login login)
        {
            System.Net.Mail.MailAddress emailAddr;
            string result = "OK, now please enter code from email and resubmit details";
            try
            {
                emailAddr = new System.Net.Mail.MailAddress(login.Email);
                // Valid address
            }
            catch
            {
                return("This email address appears to be invalid");
            }
            if (login.PW.Length < 4 || login.PW.Length > 10)
                return ("Password must be between 4 and 10 characters");

            string query = "SELECT Id, name, pw, email FROM logins";
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
                return ex.Message;
            }
            if (login.Code == 0)
            // not yet confirmed the signup
            {
                using (SqlDataAdapter loginAdapter = new SqlDataAdapter(query, ttConnection))
                {
                    dataLogins = new DataTable();
                    loginAdapter.Fill(dataLogins);

                    int length = dataLogins.Rows.Count;
                    for (int row = 0; row < length; row++)
                    {
                        DataRow dr = dataLogins.Rows[row];
                        string dbname = (string)dr["name"];
                        dbname = dbname.Trim();
                        string dbpw = (string)dr["pw"];
                        dbpw = dbpw.Trim();
                        if (dbname == login.Name)
                        {
                            result = "Sorry, this username has already been taken";
                            break;
                        }
                    }
                }
            }
            else if (login.Code == login.CalcCode())
            {
                query = string.Format("insert into logins (name, pw, email, clubID) values ('{0}','{1}','{2}','{3}')\n\r",
                    login.Name, login.PW, login.Email, 0);
                using (System.Data.SqlClient.SqlCommand command = new SqlCommand(query, ttConnection))
                {
                    command.ExecuteNonQuery();
                }
                result = "Thank you, you have now registered";
            }
            else
            {
                result = "There is an error with the code number, please try again";
            }
            ttConnection.Close();
            

            if (login.Code == 0)
            // not yet confirmed the signup
            {
                // create a code based on data
                login.Code = login.CalcCode();

                System.Net.Mail.MailAddress from = new System.Net.Mail.MailAddress("admin@timetrials.org.uk");
                System.Net.Mail.MailMessage message = new System.Net.Mail.MailMessage(from, emailAddr);
                message.Subject = "TimeTrials signup";
                message.Body = string.Format("Please enter the code {0} into the signup page to complete your registration", login.Code);

                try
                {
                    System.Net.Mail.SmtpClient client = new System.Net.Mail.SmtpClient(smtpserver);
                    //client.Credentials = System.Net.CredentialCache.DefaultNetworkCredentials;
                    client.Credentials = new System.Net.NetworkCredential(smtpUserName, smtpPassword);
                    client.Send(message);
                }
                catch (Exception ex)
                {
                    result = "Sorry, there is an error with the email service: " + ex.Message;
                }
            }
            return  result ;

        }

        public string SaveEvent(Event ev)
        {
            bool updated = false;
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
                return ex.Message;
            }
            try
            {

                // TODO ****** - make into a transaction
                //ev.StartTime = new DateTime(1969, 1, 1).AddMilliseconds((ev.Time));
                ev.StartTime = Event.JSTimeToNetTime(ev.Time);
                // check that event doesn't already exist
                string query = string.Format("SELECT * FROM events where DateTime ='{0}' and CourseID = '{1}'", TimeString(ev.StartTime), ev.CourseID);
                using (SqlDataAdapter eventAdapter = new SqlDataAdapter(query, ttConnection))
                {
                    dataEvents = new DataTable();
                    eventAdapter.Fill(dataEvents);
                    int length = dataEvents.Rows.Count;
                    if (length > 0)
                    {
                        int newID = 0;
                        events = new List<Event>();
                        for (int row = 0; row < length; row++)
                        {
                            DataRow dr = dataEvents.Rows[row];
                            newID = (int)dr["ID"];
                            if (ev.ID == newID)
                                // existing event has been modified, OK to continue
                                break;
                        }
                        if (ev.ID != newID)
                        {
                            string err = "Cannot save event, already an event at that time on same course";
                            Trace.WriteLine(err);
                            ttConnection.Close();
                            return err;
                        }
                    }

                }
                try
                {
                    query = "set xact_abort on begin transaction eventsave\n\r";
                    if (ev.ID == 0) // new event
                    {
                        query += string.Format("insert into events (CourseID,DateTime,ClubId) values ('{0}','{1}','{2}')\n\r",
                            ev.CourseID, TimeString(ev.StartTime), ev.ClubID);
                        query += "DECLARE @ThisEventID Int\n\r SET @ThisEventID = SCOPE_IDENTITY()\n\r";
                    }
                    else
                    {
                        // start time may have been modified to sync with other timers
                        query += string.Format("update events set DateTime = '{0}' where Id = '{1}'\n\r", TimeString(ev.StartTime), ev.ID);
                        // must remove any existing entries in case they have been modified
                        query += string.Format("delete from entries where EventId = '{0}'\n\r", ev.ID);
                        query += string.Format("DECLARE @ThisEventID Int\n\r SET @ThisEventID = '{0}'\n\r", ev.ID);
                        updated = true;
                    }
                    if (ev.Entries.Length > 0)
                    {
                        query += "insert into entries (EventId,RiderId, Number,Start,Finish,Position)";
                        bool firstentry = true;
                        foreach (Entry e in ev.Entries)
                        {
                            //DateTime start = new DateTime(1969, 1, 1).AddMilliseconds((e.Start));
                            //DateTime finish = new DateTime(1969, 1, 1).AddMilliseconds((e.Finish));
                            DateTime start = Event.JSTimeToNetTime(e.Start);
                            DateTime finish = Event.JSTimeToNetTime(e.Finish);
                            if (firstentry)
                                firstentry = false;
                            else
                                query += " UNION ALL ";
                            query += string.Format("select @ThisEventID,'{0}','{1}','{2}','{3}','{4}'\n\r",
                                e.RiderID, e.Number, TimeString(start), TimeString(finish), e.Position);


                        }
                    }
                    query += "commit transaction eventsave\n\r";
                    using (System.Data.SqlClient.SqlCommand command = new SqlCommand(query, ttConnection))
                    {
                        command.ExecuteNonQuery();
                    }
                }
                catch (SqlException ex)
                {
                    Trace.WriteLine(ex.Message);
                    return ex.Message;
                }


            }
            catch (Exception ex)
            {

                Trace.WriteLine(ex.Message);
                return ex.Message;
            }
            finally
            {
                ttConnection.Close();
            }
            string result = updated ? "Event updated OK" : "New event saved";
            return result + " with " + ev.Entries.Length + " entries";
        }

        // get a list of all events which match any parameters in argument event
        public IEnumerable<Event> LoadEvents(Event ev)
        {
            DateTime date1 = Event.JSTimeToNetTime(ev.Time);
            // select any events between first day and number of days (stored in OddData)
            DateTime date2 = ev.OddData > 0 ? date1.AddDays(1 + ev.OddData) : DateTime.MaxValue;
            int clubID = ev.ClubID;
            int courseID = ev.CourseID;

            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
            }
            string query = string.Format("SELECT * FROM events where DateTime>'{0}' and DateTime < '{1}'", TimeString(date1), TimeString(date2));
            if (clubID > 0)
                query += string.Format(" and ClubID='{0}' ", clubID);
            if (courseID > 0)
                query += string.Format(" and  CourseID='{0}' ", courseID);

            query += " ORDER BY DateTime";
            using (SqlDataAdapter eventAdapter = new SqlDataAdapter(query, ttConnection))
            {
                dataEvents = new DataTable();
                eventAdapter.Fill(dataEvents);
                int length = dataEvents.Rows.Count;
                events = new List<Event>();
                for (int row = 0; row < length; row++)
                {
                    DataRow dr = dataEvents.Rows[row];
                    DateTime start = (DateTime)dr["DateTime"];
                    //start = start.AddYears(-1969); // .NET time starts AT 0001; Javascript time starts 1970
                    events.Add(new Event((int)dr["ID"], (int)dr["CourseID"], Event.NetTimeToJSTime(start), (int)dr["ClubId"], null));

                }
            }
            ttConnection.Close();
            return events;
        }
        public IEnumerable<Entry> LoadEntries(int eventID)
        {
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
            }
            string query = string.Format("SELECT * FROM entries where EventId='{0}'", eventID);
            using (SqlDataAdapter entryAdapter = new SqlDataAdapter(query, ttConnection))
            {
                dataEntries = new DataTable();
                entryAdapter.Fill(dataEntries);
                int length = dataEntries.Rows.Count;
                entries = new List<Entry>();
                for (int row = 0; row < length; row++)
                {
                    DataRow dr = dataEntries.Rows[row];
                    DateTime start = (DateTime)dr["Start"];
                    //start = start.AddYears(-1969);
                    DateTime finish = (DateTime)dr["Finish"];
                    //finish = finish.AddYears(-1969);
                    int riderid = (int)dr["RiderId"];
                    int pos = (int)dr["Position"];
                    int number = (int)dr["Number"];
                    entries.Add(new Entry(number, Event.NetTimeToJSTime(start), Event.NetTimeToJSTime(finish), riderid, pos));
                }
            }
            ttConnection.Close();
            return entries;

        }

        public IEnumerable<Entry> SeedEntries(Event ev)
        {
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
            }
            // first, get entry list in order of best times
            string query = string.Format("SELECT * FROM  entries JOIN riders ON entries.RiderId = riders.id WHERE entries.EventId='{0}' ORDER BY riders.best25", ev.ID);
            using (SqlDataAdapter entryAdapter = new SqlDataAdapter(query, ttConnection))
            {
                dataEntries = new DataTable();
                entryAdapter.Fill(dataEntries);
                int length = dataEntries.Rows.Count;
                entries = new List<Entry>();
                for (int row = 0; row < length; row++)
                {
                    DataRow dr = dataEntries.Rows[row];
                    DateTime start = (DateTime)dr["Start"];
                    //start = start.AddYears(-1969);
                    DateTime finish = (DateTime)dr["Finish"];
                    //finish = finish.AddYears(-1969);
                    int riderid = (int)dr["RiderId"];
                    int pos = (int)dr["Position"];
                    entries.Add(new Entry((int)dr["Number"], Event.NetTimeToJSTime(start), Event.NetTimeToJSTime(finish), riderid, pos));
                }
            }
            ttConnection.Close();
            ev.SeededSort(ref entries);
            return entries;
        }

        /// <summary>
        /// mutex needed to avoid more than one client adding riders at the same time.
        /// Otherwise it is to difficult to allocate new rider IDs correctly
        /// </summary>
        private static Mutex mut = new Mutex();
        public IEnumerable<Rider> SaveNewRiders(IEnumerable<Rider> riders)
        {
            int newID = 0;

            // Wait until it is safe to enter.

            mut.WaitOne();

            List<Rider> newRiders = new List<Rider>();
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
            }

            try
            {
                foreach (Rider r in riders)
                {
                    DateTime DOB = DateTime.Now.AddYears(-r.Age);
                    if (r.Best25 < 45 * 60)
                        // assume this is a '10' time not a '25' time
                        r.Best25 = r.Best25 + r.Best25 + r.Best25 / 2;

                    string query = string.Format("insert into riders (name, clubID, age, lady,dob, best25,email) values ('{0}','{1}','{2}','{3}','{4}','{5}','{6}')\n\r",
                        r.Name, r.ClubID, r.Age, r.Lady, TimeString(DOB),r.Best25, r.Email);
                    //if (newID == 0)
                    {
                        query += "DECLARE @NewRiderID Int\n\r SET @NewRiderID = SCOPE_IDENTITY()\n\r";
                        query += "SELECT riders.id, riders.name, riders.clubID, riders.age, riders.lady, riders.best25, riders.email "
                                + "FROM riders where riders.id = @NewRiderID";
                        using (SqlDataAdapter riderAdapter = new SqlDataAdapter(query, ttConnection))
                        {
                            dataRiders = new DataTable();
                            riderAdapter.Fill(dataRiders);
                            if (dataRiders.Rows.Count > 0)
                            {
                                DataRow dr = dataRiders.Rows[0];
                                newID = (int)dr["id"];
                                Rider newRider = new Rider(newID, r.Name, r.Age, r.Lady, r.ClubID, r.Best25, r.Email);
                                newRiders.Add(newRider);
                            }
                        }
                    }
                    //else
                    //{
                    //    using (System.Data.SqlClient.SqlCommand command = new SqlCommand(query, ttConnection))
                    //    {
                    //        command.ExecuteNonQuery();
                    //    }

                    //}
                }

                ttConnection.Close();
            }

            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
            }
            finally
            {
                mut.ReleaseMutex();
            }
            return newRiders;
        }
        public string SaveChangedRiders(IEnumerable<Rider> riders)
        {
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
                return ex.Message;
            }
            try
            {
                foreach (Rider r in riders)
                {
                    if (r.Best25 < 45 * 60)
                        // assume this is a '10' time not a '25' time
                        r.Best25 = r.Best25 + r.Best25 + r.Best25 / 2;
                    DateTime DOB = DateTime.Now.AddYears(-r.Age);
                    string query = string.Format("update riders set name='{0}', clubID='{1}', age='{2}', lady='{3}',dob='{4}', best25='{5}', email='{6}'",
                        r.Name, r.ClubID, r.Age, r.Lady,TimeString(DOB), r.Best25, r.Email);
                    query += string.Format("where id='{0}'\n\r", r.ID);

                    using (System.Data.SqlClient.SqlCommand command = new SqlCommand(query, ttConnection))
                    {
                        command.ExecuteNonQuery();
                    }
                }
                ttConnection.Close();
            }

            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
                return ex.Message;
            }
            return "Riders updated OK";
        }

        /// <summary>
        /// save club list and return list of any nw clubs with their new IDs
        /// </summary>
        /// <param name="clubs">list to save</param>
        /// <returns>the list with new IDs</returns>
        public IEnumerable<Club> SaveNewClubs(IEnumerable<Club> clubs)
        {
            int newID = 0;

            // Wait until it is safe to enter.

            mut.WaitOne();

            List<Club> newClubs = new List<Club>();
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
            }

            try
            {
                foreach (Club club in clubs)
                {
                    string query = string.Format("insert into clubs (club, abbr) values ('{0}','{1}')\n\r",club.Name, club.Abbr);
                    //if (newID == 0)
                    {
                        query += "DECLARE @NewClubID Int\n\r SET @NewClubID = SCOPE_IDENTITY()\n\r";
                        query += "SELECT clubs.id, clubs.club, clubs.abbr "
                                + "FROM clubs where clubs.id = @NewClubID";
                        using (SqlDataAdapter clubAdapter = new SqlDataAdapter(query, ttConnection))
                        {
                            dataClubs = new DataTable();
                            clubAdapter.Fill(dataClubs);
                            if (dataClubs.Rows.Count > 0)
                            {
                                DataRow dr = dataClubs.Rows[0];
                                newID = (int)dr["id"];
                                Club newClub = new Club(newID, club.Name, club.Abbr);
                                newClubs.Add(newClub);
                            }
                        }
                    }
                    //else
                    //{
                    //    using (System.Data.SqlClient.SqlCommand command = new SqlCommand(query, ttConnection))
                    //    {
                    //        command.ExecuteNonQuery();
                    //    }
                    //}

                }
                ttConnection.Close();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
            }
            finally
            {
                mut.ReleaseMutex();
            }
            return newClubs;
        }
        public string EmailStartSheet(int eventID)
        {
            return EmailSheet(eventID, false);
        }
        public string EmailResultSheet(int eventID)
        {
            return EmailSheet(eventID, true);
        }
        public string EmailSheet(int eventID, bool results)
        {
            try
            {
                ttConnection = new SqlConnection(connection);
                ttConnection.Open();
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
                return ex.Message;
            }
            int emailsSent = 0;
            string invalid = "";
            string query = string.Format("SELECT riders.name,riders.email FROM  entries JOIN riders ON entries.RiderId = riders.id WHERE entries.EventId='{0}' AND riders.email is not null and riders.email!=''", eventID);
            try
            {
                using (SqlDataAdapter entryAdapter = new SqlDataAdapter(query, ttConnection))
                {
                    dataEntries = new DataTable();
                    entryAdapter.Fill(dataEntries);
                    int length = dataEntries.Rows.Count;
                    //riders = new List<Rider>();
                    System.Net.Mail.MailAddress from = new System.Net.Mail.MailAddress("admin@timetrials.org.uk");
                    System.Net.Mail.MailAddress to = new System.Net.Mail.MailAddress("admin@trurocycling.org");
                    System.Net.Mail.MailMessage message = new System.Net.Mail.MailMessage(from,to);

                    System.Net.Mail.MailAddress emailAddr;
                    System.Net.Mail.MailAddressCollection bcc = new System.Net.Mail.MailAddressCollection();
                    for (int row = 0; row < length; row++)
                    {
                        DataRow dr = dataEntries.Rows[row];
                        string name = (string)dr["name"];
                        string email = (string)dr["email"];
                       
                        try
                        {
                            emailAddr = new System.Net.Mail.MailAddress(email);
                            // Valid address
                            message.Bcc.Add(emailAddr);
                        }
                        catch
                        {
                            invalid += email;
                            invalid += "\n\r";
                        }
                    }

                    try
                    {
                        emailAddr = new System.Net.Mail.MailAddress("chrisfearnley1@gmail.com");
                        // Valid address
                        message.Bcc.Add(emailAddr);
                    }
                    catch
                    {
                        invalid += "ChrisF\n\r";
                    }

                    message.Subject = "Time Trial";
                    //message.Body = string.Format("Apologies for sending out last year's results again, please ignore!");
                    message.Body = string.Format("Dear rider\n\nThank you for entering the TCC event this year");
                    if (results)
                    {
                        message.Body += "\nPlease find attached results (2 documents). ";
                    }
                    else
                    {
                        message.Body += "\nPlease find attached the start details. Note that event start time has been moved to 8:00am.";
                        message.Body += "\nPlease could you reply to this email to acknowledge receipt.";
                    }
                    message.Body += "\n\nRegards\nTruro Cycling Club";
                    try
                    {
                        System.Net.Mail.Attachment attach1, attach2;
                        if (results)
                        {
                            attach1 = new System.Net.Mail.Attachment(@"C:\Users\Chris\Documents\tcc\TCC Open 25 July 2014.pdf");
                            attach2 = new System.Net.Mail.Attachment(@"C:\Users\Chris\Documents\tcc\TCC Open 25 July 2014 results.pdf");
                        }
                        else
                        {
                            attach1 = new System.Net.Mail.Attachment(@"C:\Users\Chris\Documents\tcc\instructions2014.pdf");
                            attach2 = new System.Net.Mail.Attachment(@"C:\Users\Chris\Documents\tcc\list2014.pdf");

                        }
                        message.Attachments.Add(attach1);
                        message.Attachments.Add(attach2);
                    }
                    catch (Exception ex)
                    {
                        Trace.WriteLine(ex.Message);
                        return "Could not find document(s) to attach to emails";
                    }
                    try
                    {
                        System.Net.Mail.SmtpClient client = new System.Net.Mail.SmtpClient(smtpserver);
                        client.Credentials = new System.Net.NetworkCredential(smtpUserName, smtpPassword);
                        client.Send(message);
                        ++emailsSent;
                    }
                    catch (Exception ex)
                    {
                        return "There is an error with the email service: " + ex.Message;
                    }
                }


            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex.Message);
                Trace.WriteLine(emailsSent + "emails sent");
                return ex.Message;
            }
            ttConnection.Close();
            if (invalid.Length > 0)
                return ("Emails sent but these appear invalid: " + invalid);
            else
                return ("All emails sent OK");
        }
    }
}
