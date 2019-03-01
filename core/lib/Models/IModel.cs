using System;
using System.ComponentModel.DataAnnotations;

namespace our.orders.Models
{
    public interface IPreviewable
    {
        string Preview();
    }
    public interface IModel : IPreviewable
    {

        string Id { get; set; }

        DateTime? LastMod { get; set; }

        DateTime? Creation { get; set; }


    }

    public abstract class Model : IModel
    {
        [Key]
        public string Id { get; set; }
        public DateTime? Creation { get; set; } = DateTime.UtcNow;
        public DateTime? LastMod { get; set; }

        public abstract string Preview();
    }
}