using System;
using System.Linq;
using System.Reflection;

namespace our.orders.Helpers
{
	/// <summary>
	/// extensions utilities for Objects 
	/// </summary>
	public static class TypesExtensions
	{

		public static bool Is<TType>(this Type t)
		{
			return t == typeof(TType);
		}
		public static bool IsOrImplements<TInterface>(this Type t)
		{
			return t.Is<TInterface>() || Implements(t, typeof(TInterface));
		}

		public static bool IsOrImplements(this Type t, Type interfaceType)
		{
			return t == interfaceType || Implements(t, interfaceType);
		}


		public static bool Implements<TInterface>(this Type t)
		{
			return Implements(t, typeof(TInterface));
		}

		public static bool Implements(this Type t, Type interfaceType)
		{
			return interfaceType != t && interfaceType.IsAssignableFrom(t);
		}

		public static bool Extends<TBase>(this Type t)
		{
			return Extends(t, typeof(TBase));
		}

		public static bool Extends(this Type t, Type baseType)
		{
			return t.GetTypeInfo().IsSubclassOf(baseType);
		}

		public static Type[] GetNestedTypes(this Type t, BindingFlags bindingAttr, bool includeBaseNestedTypes)
		{
			var actualNested = t.GetNestedTypes(bindingAttr);

			if (!includeBaseNestedTypes) return actualNested;

			var basetype = t.GetTypeInfo().BaseType;
			if (basetype == null) return actualNested;

			var basenested = actualNested.Concat(basetype.GetNestedTypes(bindingAttr, true));

			return basenested.ToArray();
		}
	}
}