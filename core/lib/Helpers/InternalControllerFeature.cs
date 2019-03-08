using System;
using System.Reflection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace our.orders.Helpers
{

    /// <summary>
    /// Discover internal controllers
    /// </summary>
    /// <seealso cref="Microsoft.AspNetCore.Mvc.Controllers.ControllerFeatureProvider" />
    internal class InternalControllerFeature : ControllerFeatureProvider
    {
        private const string ControllerTypeNameSuffix = "Controller";


        protected override bool IsController(TypeInfo typeInfo)
        {
            if (!typeInfo.IsClass)
            {
                return false;
            }

            if (typeInfo.IsAbstract)
            {
                return false;
            }

            if (typeInfo.IsNested)
            {
                return false;
            }

            //if (!typeInfo.IsVisible)
            //{
            //    return false;
            //}

            if (typeInfo.ContainsGenericParameters)
            {
                return false;
            }


            if (typeInfo.IsDefined(typeof(NonControllerAttribute)))
            {
                return false;
            }

            if (!typeInfo.Name.EndsWith(ControllerTypeNameSuffix, StringComparison.OrdinalIgnoreCase) &&
                !typeInfo.IsDefined(typeof(ControllerAttribute)))
            {
                return false;
            }

            return true;
        }
    }
}