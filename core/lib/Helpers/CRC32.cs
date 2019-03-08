using System;
using System.Collections.Generic;
using System.Security.Cryptography;

namespace our.orders.Helpers
{

    /// <summary>
    /// Implementation of the CRC-#" Algorithm for Hash (from http://damieng.com/blog/2006/08/08/calculating_crc32_in_c_and_net)
    /// </summary>
    public class CRC32 : HashAlgorithm
    {
        /// <summary>
        /// The default polynomial value
        /// </summary>
        public const UInt32 DEFAULT_POLYNOMIAL = 0xedb88320;
        /// <summary>
        /// The default seed value
        /// </summary>
        public const UInt32 DEFAULT_SEED = 0xffffffff;

        private UInt32 _Hash;
        private readonly UInt32 _Seed;
        private readonly UInt32[] _Table;
        private static UInt32[] _DefaultTable;

        /// <summary>
        /// Initializes a new instance of the <see cref="CRC32" /> class.
        /// </summary>
        public CRC32()
        {
            _Table = _InitializeTable(DEFAULT_POLYNOMIAL);
            _Seed = DEFAULT_SEED;
            Initialize();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="CRC32" /> class.
        /// </summary>
        /// <param name="polynomial">The polynomial.</param>
        /// <param name="seed">The seed.</param>
        public CRC32(UInt32 polynomial, UInt32 seed)
        {
            _Table = _InitializeTable(polynomial);
            _Seed = seed;
            Initialize();
        }

        /// <summary>
        /// Initialize
        /// </summary>
        public override sealed void Initialize()
        {
            _Hash = _Seed;
        }

        /// <summary>
        /// Calculates Hash
        /// </summary>
        /// <param name="buffer"></param>
        /// <param name="start"></param>
        /// <param name="length"></param>
        protected override void HashCore(byte[] buffer, int start, int length)
        {
            _Hash = _CalculateHash(_Table, _Hash, buffer, start, length);
        }

        /// <summary>
        /// Get the final hash
        /// </summary>
        /// <returns></returns>
        protected override byte[] HashFinal()
        {
            var hashBuffer = _UInt32ToBigEndianBytes(~_Hash);
            HashValue = hashBuffer;
            return hashBuffer;
        }

        /// <summary>
        /// defines hash size
        /// </summary>
        public override int HashSize
        {
            get { return 32; }
        }

        /// <summary>
        /// Computes the specified buffer.
        /// </summary>
        /// <param name="buffer">The buffer.</param>
        /// <returns></returns>
        public static UInt32 Compute(byte[] buffer)
        {
            return ~_CalculateHash(_InitializeTable(DEFAULT_POLYNOMIAL), DEFAULT_SEED, buffer, 0, buffer.Length);
        }

        /// <summary>
        /// Computes the specified seed.
        /// </summary>
        /// <param name="seed">The seed.</param>
        /// <param name="buffer">The buffer.</param>
        /// <returns></returns>
        public static UInt32 Compute(UInt32 seed, byte[] buffer)
        {
            return ~_CalculateHash(_InitializeTable(DEFAULT_POLYNOMIAL), seed, buffer, 0, buffer.Length);
        }

        /// <summary>
        /// Computes the specified polynomial.
        /// </summary>
        /// <param name="polynomial">The polynomial.</param>
        /// <param name="seed">The seed.</param>
        /// <param name="buffer">The buffer.</param>
        /// <returns></returns>
        public static UInt32 Compute(UInt32 polynomial, UInt32 seed, byte[] buffer)
        {
            return ~_CalculateHash(_InitializeTable(polynomial), seed, buffer, 0, buffer.Length);
        }

        private static UInt32[] _InitializeTable(UInt32 polynomial)
        {
            if (polynomial == DEFAULT_POLYNOMIAL && _DefaultTable != null)
                return _DefaultTable;

            var createTable = new UInt32[256];
            for (var i = 0; i < 256; i++)
            {
                var entry = (UInt32)i;
                for (var j = 0; j < 8; j++)
                    if ((entry & 1) == 1)
                        entry = (entry >> 1) ^ polynomial;
                    else
                        entry = entry >> 1;
                createTable[i] = entry;
            }

            if (polynomial == DEFAULT_POLYNOMIAL)
                _DefaultTable = createTable;

            return createTable;
        }

        private static UInt32 _CalculateHash(IList<uint> table, UInt32 seed, IList<byte> buffer, int start, int size)
        {
            var crc = seed;
            for (var i = start; i < size; i++)
                unchecked
                {
                    crc = (crc >> 8) ^ table[(int)(buffer[i] ^ crc & 0xff)];
                }
            return crc;
        }

        private static byte[] _UInt32ToBigEndianBytes(UInt32 x)
        {
            return new[] {
            (byte)((x >> 24) & 0xff),
            (byte)((x >> 16) & 0xff),
            (byte)((x >> 8) & 0xff),
            (byte)(x & 0xff)
        };
        }
    }
}