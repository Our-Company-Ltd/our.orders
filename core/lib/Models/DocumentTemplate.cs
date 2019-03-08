
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using our.orders.Helpers;

namespace our.orders.Models
{

    public class DocumentTemplate : Model
    {

        public string TemplateId { get; set; }
        public string Title { get; set; }

        public string Description { get; set; }

        public string Template { get; set; }

        public string Styles { get; set; }

        public string ApplyTo { get; set; }

        public override string Preview() => $"{Title} ({TemplateId})";
    }
}