using System.ComponentModel.DataAnnotations;

namespace our.orders.Payments.PostFinance
{
    public class PostFinanceConfiguration
    {

        public PostFinanceConfiguration(string sHASIGN, string pSPID, string COM, string uSERID, string pSWD, bool Sandbox = false)
        {
            this.SHASIGN = sHASIGN;
            this.PSPID = pSPID;
            this.USERID = uSERID;
            this.PSWD = pSWD;
            this.COM = COM;
            this.Sandbox = Sandbox;
        }

        /// <summary>
        /// Company Name
        /// </summary>
        /// <returns></returns>

        public string COM { get; }

        /// <summary>
        /// Unique character string for order data validation. 
        /// A string hashed with the SHA-1 algorithm will always be 40 characters long.
        /// </summary>
        /// <returns></returns>

        public string SHASIGN { get; }

        /// <summary>
        /// Affiliation name in our system. AN, 30
        /// </summary>
        /// <returns></returns>
        public string PSPID { get; }

        /// <summary>
        /// Name of your application (API) user. 
        /// Please refer to the User Manager documentation 
        /// for information on how to create an API user.
        /// </summary>
        /// <returns></returns>
        public string USERID { get; }

        /// <summary>
        /// Password of the API user (USERID).
        /// </summary>
        /// <returns></returns>
        public string PSWD { get; }

        /// <summary>
        /// Sandbox mode
        /// </summary>
        /// <returns></returns>
        public bool Sandbox { get; }
    }
}