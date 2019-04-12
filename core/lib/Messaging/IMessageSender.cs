using System.Threading;
using System.Threading.Tasks;

namespace our.orders.Messaging
{
    public interface IMessageSender
    {

        void Send(OurOrdersMessage message);

        void Send(string destination, string subject, string body);

    }
}