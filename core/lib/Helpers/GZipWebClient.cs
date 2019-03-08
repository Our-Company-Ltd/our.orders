
using System;
using System.Net;

namespace our.orders.Helpers
{
    // http://stackoverflow.com/questions/4567313/uncompressing-gzip-response-from-webclient
    public class GZipWebClient : WebClient
    {

        protected override WebRequest GetWebRequest(Uri address)
        {
            WebRequest request = base.GetWebRequest(address);
            request.Proxy = null;
            if (request.GetType() == typeof(HttpWebRequest))
                ((HttpWebRequest)request).AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
            return request;
        }
    }
}
