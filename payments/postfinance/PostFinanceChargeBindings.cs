using System.ComponentModel.DataAnnotations;

namespace our.orders.Payments.PostFinance
{
    public class PostFinanceChargeBindings
        {
            [Required]
            public string OrderID { get; set; }

            /// <summary>
            /// Card/account number.
            /// </summary>
            /// <returns></returns>
            [Required]
            [StringLength(21, MinimumLength = 21)]
            public string CardNo { get; set; }

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
            /// Expiry date.
            /// </summary>
            /// <returns></returns>
            [Required]
            [RegularExpression("(0|1)[0-9]/?[0-9]{2}")]
            public string ExpiryDate { get; set; }

            /// <summary>
            /// Amount to be paid
            /// </summary>
            /// <returns></returns>
            public decimal Amount { get; set; }

        }
}