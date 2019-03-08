using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Payments.BankTransfer;
using our.orders.Payments.Cash;
using our.orders.Payments.Voucher;

namespace our.orders
{
    public static class PaymentsBuilderExtension
    {
        public static OurOrdersBuilder UseDefaultPayments(this OurOrdersBuilder builder)
        {
            return builder
                .UseVouchers()
                .UseCCTerminal()
                .UseBankTransfers()
                .UseCashPayments();
        }

    }
}