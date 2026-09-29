using System;
using System.Collections.Generic;

namespace DAL.EF.Models
{
    public class MembershipPlan
    {
        public int Id { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationMonths { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Member> Members { get; set; } = new List<Member>();
    }
}
