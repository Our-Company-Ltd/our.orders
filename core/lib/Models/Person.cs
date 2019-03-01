
namespace our.orders.Models
{


    public interface IPerson
    {
        /// <summary>
        /// Gets the address.
        /// </summary>
        /// <value>The address.</value>
        string Address { get; }

        /// <summary>
        /// Gets the cell phone.
        /// </summary>
        /// <value>The cell phone.</value>
        string CellPhone { get; }

        /// <summary>
        /// Gets the city.
        /// </summary>
        /// <value>The city.</value>
        string City { get; }

        /// <summary>
        /// Gets the country iso.
        /// </summary>
        /// <value>The country iso.</value>
        string CountryIso { get; }

        /// <summary>
        /// Gets the email.
        /// </summary>
        /// <value>The email.</value>
        string Email { get; }

        /// <summary>
        /// Gets the first name.
        /// </summary>
        /// <value>The first name.</value>
        string FirstName { get; }

        /// <summary>
        /// Gets the last name.
        /// </summary>
        /// <value>The last name.</value>
        string LastName { get; }

        /// <summary>
        /// Gets the name of the organization.
        /// </summary>
        /// <value>The name of the organization.</value>
        string OrganizationName { get; }

        /// <summary>
        /// Gets the phone.
        /// </summary>
        /// <value>The phone.</value>
        string Phone { get; }

        /// <summary>
        /// Gets the postal code.
        /// </summary>
        /// <value>The postal code.</value>
        string PostalCode { get; }

        /// <summary>
        /// Gets the state.
        /// </summary>
        /// <value>The state.</value>
        string State { get; }

        /// <summary>
        /// Gets the vat number.
        /// </summary>
        /// <value>The vat number.</value>
        string VATNumber { get; }
    }
    public class Person : IPerson
    {

        public string Address { get; set; }

        public string CellPhone { get; set; }

        public string City { get; set; }

        public string CountryIso { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string OrganizationName { get; set; }

        public string Phone { get; set; }

        public string PostalCode { get; set; }

        public string State { get; set; }

        public string VATNumber { get; set; }
    }
}