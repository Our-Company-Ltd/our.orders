using System.Xml;
using System.Xml.Serialization;

namespace our.orders.Payments.PostFinance
{

    [XmlRoot("ncresponse")]
    public class DirectLinkResponseBinding
    {
        /// <summary>
        /// Order reference.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("orderID")]
        public string OrderID { get; set; }

        /// <summary>
        /// Payment reference in PostFinance system.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("PAYID")]
        public string PaymentID { get; set; }



        /// <summary>
        /// Order amount (not multiplied by 100).
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("amount")]
        public decimal amount { get; set; }

        /// <summary>
        /// Card brand or similar information for other payment methods.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("BRAND")]
        public string BRAND { get; set; }

        /// <summary>
        /// Order currency.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("currency")]
        public string currency { get; set; }

        /// <summary>
        /// Electronic Commerce Indicator.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("ECI")]
        public string ECI { get; set; }

        /// <summary>
        /// First digit of NCERROR.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("NCSTATUS")]
        public int NCStatus { get; set; }

        /// <summary>
        /// Error code.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("NCERROR")]
        public string NCERROR { get; set; }

        /// <summary>
        /// Explanation of the error code.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("NCERRORPLUS")]

        public string NCERRORPLUS { get; set; }

        /// <summary>
        /// Payment method.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("PM")]

        public string PM { get; set; }

        /// <summary>
        /// Payment method.
        /// </summary>
        /// <returns></returns>
        [XmlAttribute("STATUS")]

        public int STATUS { get; set; }


    }

}
