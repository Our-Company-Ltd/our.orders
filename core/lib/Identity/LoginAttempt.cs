using System;

namespace our.orders.Identity
{
    public class LoginAttempt
    {
        public string Id { get; set; }
        public DateTime? Date { get; set; }


        public bool Success { get; set; }


        public string RequestIP { get; set; }
    }
}