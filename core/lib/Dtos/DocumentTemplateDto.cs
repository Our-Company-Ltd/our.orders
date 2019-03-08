
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using our.orders.Helpers;
using our.orders.Models;

namespace our.orders.Dtos
{
    public class DocumentTemplateDto : IModel
    {
        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }


        public string Title { get; set; }

        public string Description { get; set; }

        public string Template { get; set; }

        public string TemplateId { get; set; }

        public string Styles { get; set; }
        
        public string ApplyTo { get; set; }

        public string Preview() => $"{Title}";
    }
}