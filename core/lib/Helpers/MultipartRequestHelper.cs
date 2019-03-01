using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;
using System;
using System.IO;
using System.Text;

namespace our.orders.Helpers
{
    
    /// <summary>
    /// Utility class to handle Multipart Request 
    /// </summary>
    public static class MultipartRequestHelper
    {
        /// <summary>
        /// Gets the boundary part of the Content-Type Header. (spec says 70 characters is a
        /// reasonable limit.)
        /// <para>
        /// Content-Type: multipart/form-data; boundary="----WebKitFormBoundarymx2fSWqWSd0OxQqq"
        /// </para>
        /// </summary>
        /// <param name="contentType"> Header's type of the content. </param>
        /// <param name="lengthLimit"> The length limit of the header </param>
        /// <returns> the boundary </returns>
        /// <exception cref="InvalidDataException">
        /// Missing content-type boundary or Multipart boundary length limit {lengthLimit} exceeded.
        /// </exception>
        public static string GetBoundary(MediaTypeHeaderValue contentType, int lengthLimit)
        {
            
            var boundary = HeaderUtilities.RemoveQuotes(contentType.Boundary);
            if (string.IsNullOrWhiteSpace(boundary.ToString()))
            {
                throw new InvalidDataException("Missing content-type boundary.");
            }

            if (boundary.Length > lengthLimit)
            {
                throw new InvalidDataException(
                    $"Multipart boundary length limit {lengthLimit} exceeded.");
            }

            return boundary.ToString();
        }

        /// <summary>
        /// Determines whether [is multipart content type] [the specified content type]. 
        /// </summary>
        /// <param name="contentType"> Type of the content. </param>
        /// <returns>
        /// <c> true </c> if [is multipart content type] [the specified content type]; otherwise, <c>
        /// false </c>.
        /// </returns>
        public static bool IsMultipartContentType(string contentType)
        {
            return !string.IsNullOrEmpty(contentType)
                   && contentType.IndexOf("multipart/", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        /// <summary>
        /// Determines whether [has form data content disposition] [the specified content
        /// disposition].
        /// </summary>
        /// <param name="contentDisposition"> The content disposition. </param>
        /// <returns>
        /// <c> true </c> if [has form data content disposition] [the specified content disposition];
        /// otherwise, <c> false </c>.
        /// </returns>
        public static bool HasFormDataContentDisposition(ContentDispositionHeaderValue contentDisposition)
        {
            // Content-Disposition: form-data; name="key";
            return contentDisposition != null
                   && contentDisposition.DispositionType.Equals("form-data")
                   && string.IsNullOrEmpty(contentDisposition.FileName.ToString())
                   && string.IsNullOrEmpty(contentDisposition.FileNameStar.ToString());
        }

        /// <summary>
        /// Determines whether [has file content disposition] [the specified content disposition]. 
        /// </summary>
        /// <param name="contentDisposition"> The content disposition. </param>
        /// <returns>
        /// <c> true </c> if [has file content disposition] [the specified content disposition];
        /// otherwise, <c> false </c>.
        /// </returns>
        public static bool HasFileContentDisposition(ContentDispositionHeaderValue contentDisposition)
        {
            // Content-Disposition: form-data; name="myfile1"; filename="Misc 002.jpg"
            return contentDisposition != null
                   && contentDisposition.DispositionType.Equals("form-data")
                   && (!string.IsNullOrEmpty(contentDisposition.FileName.ToString())
                       || !string.IsNullOrEmpty(contentDisposition.FileNameStar.ToString()));
        }

        /// <summary>
        /// Gets the encoding. 
        /// </summary>
        /// <param name="section"> The section. </param>
        /// <returns></returns>
        public static Encoding GetEncoding(this MultipartSection section)
        {
            var hasMediaTypeHeader = MediaTypeHeaderValue.TryParse(section.ContentType, out MediaTypeHeaderValue mediaType);
            // UTF-7 is insecure and should not be honored. UTF-8 will succeed in most cases.
            if (!hasMediaTypeHeader || Encoding.UTF7.Equals(mediaType.Encoding))
            {
                return Encoding.UTF8;
            }
            return mediaType.Encoding;
        }
    }
}