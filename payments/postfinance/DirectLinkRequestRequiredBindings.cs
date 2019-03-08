using System.ComponentModel.DataAnnotations;

namespace our.orders.Payments.PostFinance
{

    // https://e-payment-postfinance.v-psp.com/en/en/guides/integration%20guides/directlink
    public class DirectLinkRequestRequiredBindings
    {

        public DirectLinkRequestRequiredBindings(string pSPID, string oRDERID, string uSERID, string pSWD, int aMOUNT, string cURRENCY, string cARDNO, string eD, string cVC, string oPERATION)
        {
            this.PSPID = pSPID;
            this.ORDERID = oRDERID;
            this.USERID = uSERID;
            this.PSWD = pSWD;
            this.AMOUNT = aMOUNT;
            this.CURRENCY = cURRENCY;
            this.CARDNO = cARDNO;
            this.ED = eD;
            this.CVC = cVC;
            this.OPERATION = oPERATION;

        }

        /// <summary>
        /// Your affiliation name in our system. AN, 30
        /// </summary>
        /// <returns></returns>
        [Required]
        [StringLength(30)]
        public string PSPID { get; set; }

        /// <summary>
        /// Your unique order number (merchant reference).
        /// </summary>
        /// <returns></returns>
        [Required]
        [StringLength(40)]
        public string ORDERID { get; set; }

        /// <summary>
        /// Name of your application (API) user. Please refer to the User Manager documentation for information on how to create an API user.
        /// </summary>
        /// <returns></returns>
        [Required]
        [StringLength(40, MinimumLength = 2)]
        public string USERID { get; set; }

        /// <summary>
        /// Password of the API user (USERID).
        /// </summary>
        /// <returns></returns>
        [Required]
        public string PSWD { get; set; }

        /// <summary>
        /// Amount to be paid, MULTIPLIED BY 100 as the format of the amount must not contain any decimals or other separators.
        /// </summary>
        /// <returns></returns>
        [Required]
        public int AMOUNT { get; set; }

        /// <summary>
        /// ISO alpha order currency code, for example: EUR, USD, GBP, CHF, etc.
        /// </summary>
        /// <returns></returns>
        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string CURRENCY { get; set; }

        /// <summary>
        /// Card/account number.
        /// </summary>
        /// <returns></returns>
        [Required]
        [StringLength(21, MinimumLength = 21)]
        public string CARDNO { get; set; }

        /// <summary>
        /// Expiry date.
        /// </summary>
        /// <returns></returns>
        [Required]
        [RegularExpression("(0|1)[0-9]/?[0-9]{2}")]
        public string ED { get; set; }


        // /// <summary>
        // /// Signature (hashed string) to authenticate the data (see SHA-IN Signature).
        // /// </summary>
        // /// <returns></returns>
        // [Required]
        // [StringLength(128, MinimumLength = 128)]
        // public string SHASIGN { get; set; }

        /// <summary>
        /// Card Verification Code. Depending on the card brand, 
        /// the verification code will be a 3- or 4-digit code 
        /// on the front or rear of the card, an issue number, 
        /// a start date or a date of birth.
        /// </summary>
        /// <returns></returns>
        [Required]
        [StringLength(5, MinimumLength = 3)]
        public string CVC { get; set; }


        /// <summary>
        /// Defines the type of requested transaction.
        /// 
        /// You can configure a default operation (payment procedure) 
        /// in the "Global transaction parameters" tab, "Default operation code" 
        /// section of the Technical Information page. 
        /// When you send an operation value in the request, 
        /// this will overwrite the default value.
        /// 
        /// Possible values:
        /// RES: request for authorization
        /// SAL: request for direct sale
        /// RFD: refund, not linked to a previous payment, 
        ///         so not a maintenance operation on an existing transaction 
        ///         (you can not use this operation without specific permission from your acquirer).
        /// 
        /// Optional:
        /// 
        /// PAU: Request for pre-authorization: 
        ///         In agreement with your acquirer you can use this operation code 
        ///         to temporarily reserve funds on a customer's card. 
        ///         This is a common practice in the travel and rental industry. 
        ///         PAU/pre-authorization can currently only be used on MasterCard and 
        ///         Visa transactions and is supported by selected acquirers. 
        ///         This operation code cannot be set as the default in your PostFinance account. 
        ///         Should you use PAU on transactions via acquirers or with 
        ///         card brands that don't support pre-authorization, 
        ///         these transactions will not be blocked but processed as normal (RES) authorizations.
        /// </summary>
        /// <returns></returns>
        [StringLength(3, MinimumLength = 3)]
        public string OPERATION { get; set; }

    }

}
