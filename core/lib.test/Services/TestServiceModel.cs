using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using our.orders.Models;


namespace our.orders.test.Services
{
    public interface ITestServiceModel : IModel
    {
        string FirstName { get; set; }


        string LastName { get; set; }
    }
    public class TestServiceModel : IModel, ITestServiceModel
    {
        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("Id")]
        [BsonId]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();


        public DateTime? Creation { get; set; }

        public DateTime? LastMod { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }


        public int Number { get; set; }

        public decimal Price { get; set; }


        public string Preview()
        {
            return $"{FirstName} {LastName}";
        }
    }
}