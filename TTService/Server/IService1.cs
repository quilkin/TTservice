using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Data;

namespace TTService
{

     [ServiceContract]
    public interface ITTService
    {
        [OperationContract]
        [WebInvoke(Method = "GET", UriTemplate = "/GetRiders", ResponseFormat = WebMessageFormat.Json)]
        [ServiceKnownType(typeof(List<Rider>))]
        IEnumerable<Rider> GetRiders();

        [OperationContract]
        [WebInvoke(Method = "GET", UriTemplate = "/GetClubs", ResponseFormat = WebMessageFormat.Json)]
        [ServiceKnownType(typeof(List<Club>))]
        IEnumerable<Club> GetClubs();

        [OperationContract]
        [WebInvoke(Method = "GET", UriTemplate = "/GetCourses", ResponseFormat = WebMessageFormat.Json)]
        [ServiceKnownType(typeof(List<Course>))]
        IEnumerable<Course> GetCourses();

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/Login", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        int Login(Login login);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/Signup", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string Signup(Login login);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/SaveEvent", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string SaveEvent(Event ev);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/LoadEvents", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<Event> LoadEvents(Event ev);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/LoadEntries", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<Entry> LoadEntries(int eventID);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/SeedEntries", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<Entry> SeedEntries(Event ev);
                 
        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/SaveNewRiders", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<Rider> SaveNewRiders(IEnumerable<Rider> riders);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/SaveChangedRiders", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string SaveChangedRiders(IEnumerable<Rider> riders);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/SaveNewClubs", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<Club> SaveNewClubs(IEnumerable<Club> clubs);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/EmailStartSheet", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string EmailStartSheet(int eventid);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = "/EmailResultSheet", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string EmailResultSheet(int eventid);
    }

}
