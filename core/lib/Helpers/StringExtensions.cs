/*
 * Our CMS: .net + MongoDB = ❤
 * Copyright(C) 2017 Our Company Ltd.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or(at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.If not, see<https://www.gnu.org/licenses/>.
 *
*/

using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace our.orders.Helpers
{
    /// <summary>
    /// Extension methods for <see cref="string" /> 
    /// </summary>
    public static class StringExtensions
    {
        private static readonly Regex
           _RemoveDiacriticsAllowedChars = new Regex(@"[^A-Za-z0-9\-_]", RegexOptions.Compiled),
           _MultipleDashes = new Regex(@"\-+", RegexOptions.Compiled),
           _StripTags = new Regex(@"<(.|\n)*?>", RegexOptions.Compiled);

        // /// <summary>
        // /// Creates a CRC32 Hash of the string. 
        // /// </summary>
        // /// <param name="str"> The STR. </param>
        // /// <returns></returns>
        // public static string CRC32(this string str)
        // {
        //     if (string.IsNullOrEmpty(str)) return null;
        //     var crc32 = new Crc32Algorithm();
        //     var byteArray = Encoding.ASCII.GetBytes(str);
        //     byteArray = crc32.ComputeHash(byteArray);
        //     return BitConverter.ToUInt32(byteArray, 0).ToString("X8").ToLower();
        // }

        /// <summary>
        /// converts a string to a <see cref="PathString" /> timing and appending a '/' on the first
        /// character
        /// </summary>
        /// <param name="str"> The string. </param>
        /// <returns></returns>
        public static PathString ToPathString(this string str) => new PathString("/" + str.Trim(new char[] { '/' }));

        /// <summary>
        /// Removes the diacritics in a string 
        /// </summary>
        /// <param name="stIn"> The input string </param>
        /// <returns> the string without diacritics </returns>
        public static string RemoveDiacritics(this string stIn)
        {
            if (string.IsNullOrEmpty(stIn))
                return stIn;

            stIn = _StripTags.Replace(stIn, "");
            var stFormD = stIn.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            for (var ich = 0; ich < stFormD.Length; ich++)
            {
                var uc = CharUnicodeInfo.GetUnicodeCategory(stFormD[ich]);
                if (uc != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(_RemoveDiacriticsAllowedChars.Replace(stFormD[ich].ToString(), "-"));
                }
            }

            var result = sb.ToString();
            // no trailing dash =
            result = result.TrimEnd('-');
            // normalized =
            result = result.Normalize(NormalizationForm.FormC);
            // no multiple dashes =
            result = _MultipleDashes.Replace(result, "-");

            return result;
        }

        /// <summary>
        /// Removes all leading occurrences of a the strings specified in an array from the current
        /// System.String object.
        /// </summary>
        /// <param name="target"> The target. </param>
        /// <param name="trimStrings"> The trim strings. </param>
        /// <returns></returns>
        public static string TrimStart(this string target, params string[] trimStrings)
        {
            var result = target;
            foreach (var trimString in trimStrings)
            {
                while (result.StartsWith(trimString, StringComparison.Ordinal))
                {
                    result = result.Substring(trimString.Length);
                }
            }
            return result;
        }

        /// <summary>
        /// Removes all trailing occurrences of a the strings specified in an array from the current
        /// System.String object.
        /// </summary>
        /// <param name="target"> The target. </param>
        /// <param name="trimStrings"> The trim strings. </param>
        /// <returns></returns>
        public static string TrimEnd(this string target, params string[] trimStrings)
        {
            var result = target;
            foreach (var trimString in trimStrings)
            {
                while (result.EndsWith(trimString, StringComparison.Ordinal))
                {
                    result = result.Substring(0, target.Length - trimString.Length);
                }
            }
            return result;
        }

        /// <summary>
        /// Removes all leading and trailing occurrences of a the strings specified in an array from
        /// the current System.String object.
        /// </summary>
        /// <param name="target"> The target. </param>
        /// <param name="trimStrings"> The trim strings. </param>
        /// <returns></returns>
        public static string Trim(this string target, params string[] trimStrings)
        {
            return target.TrimStart(trimStrings).TrimEnd(trimStrings);
        }


        /// <summary>
        /// Creates a MD5 of the string.
        /// </summary>
        /// <param name="str">The STR.</param>
        /// <returns></returns>
        public static string MD5(this string str)
        {
            var md5 = new MD5CryptoServiceProvider();
            var byteArray = Encoding.ASCII.GetBytes(str);
            byteArray = md5.ComputeHash(byteArray);
            return BitConverter.ToString(byteArray);
        }

        /// <summary>
        /// Creates a MD5 of the string converts it to int32 then render in X8 format.
        /// </summary>
        /// <param name="str">The STR.</param>
        /// <returns></returns>
        public static string ShortMD5(this string str)
        {
            var md5 = new MD5CryptoServiceProvider();
            byte[] byteArray = Encoding.ASCII.GetBytes(str);
            byteArray = md5.ComputeHash(byteArray);
            return BitConverter.ToUInt32(byteArray, 0).ToString("X8").ToLower();
        }

        /// <summary>
        /// Creates a CRC32 Hash of the string.
        /// </summary>
        /// <param name="str">The STR.</param>
        /// <returns></returns>
        public static string CRC32(this string str)
        {
            var crc32 = new CRC32();
            byte[] byteArray = Encoding.ASCII.GetBytes(str);
            byteArray = crc32.ComputeHash(byteArray);
            return BitConverter.ToUInt32(byteArray, 0).ToString("X8").ToLower();
        }


        /// <summary>
        /// Hashes the specified string.
        /// </summary>
        /// <param name="str">The string.</param>
        /// <returns>the hash of the string</returns>
        public static string Hash(this string str)
        {
            var md5 = new MD5CryptoServiceProvider();
            var hash = md5.ComputeHash(Encoding.ASCII.GetBytes(str));
            var stringBuilder = new StringBuilder();
            foreach (var b in hash)
            {
                stringBuilder.AppendFormat("{0:x2}", b);
            }
            return stringBuilder.ToString();
        }

        public static string Serialize<T>(this T obj)
        {
            if (obj == null) return null;
            return JsonConvert.SerializeObject(obj);
        }

        public static T DeSerialize<T>(this string serialized)
        {
            if (serialized == null) return default(T);
            return JsonConvert.DeserializeObject<T>(serialized);
        }
    }
}