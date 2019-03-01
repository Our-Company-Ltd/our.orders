
using System.Collections.Generic;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace our.orders.Helpers
{
    // add controllers from IAppSettings to the feature
    public class ExternalControllerFeatureProvider : IApplicationFeatureProvider<ControllerFeature>
    {
        private readonly IAppSettings settings;

        public ExternalControllerFeatureProvider(IAppSettings settings)
        {
            this.settings = settings;
        }
        public void PopulateFeature(IEnumerable<ApplicationPart> parts, ControllerFeature feature)
        {
            foreach (var controllerType in settings.ExternalControllers)
            {
                feature.Controllers.Add(controllerType.GetTypeInfo());
            }
        }
    }
}