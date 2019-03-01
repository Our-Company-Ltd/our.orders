using System;
using System.Linq;
using System.Reflection;

namespace our.orders.Helpers
{
	/// <summary>
	/// extensions utilities for Objects 
	/// </summary>
	internal static class TypesExtensions
	{

		internal static bool Is<TType>(this Type t)
		{
			return t == typeof(TType);
		}
		internal static bool IsOrImplements<TInterface>(this Type t)
		{
			return t.Is<TInterface>() || Implements(t, typeof(TInterface));
		}

		internal static bool IsOrImplements(this Type t, Type interfaceType)
		{
			return t == interfaceType || Implements(t, interfaceType);
		}


		internal static bool Implements<TInterface>(this Type t)
		{
			return Implements(t, typeof(TInterface));
		}

		internal static bool Implements(this Type t, Type interfaceType)
		{
			return interfaceType != t && interfaceType.IsAssignableFrom(t);
		}

		internal static bool Extends<TBase>(this Type t)
		{
			return Extends(t, typeof(TBase));
		}

		internal static bool Extends(this Type t, Type baseType)
		{
			return t.GetTypeInfo().IsSubclassOf(baseType);
		}

		internal static Type[] GetNestedTypes(this Type t, BindingFlags bindingAttr, bool includeBaseNestedTypes)
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