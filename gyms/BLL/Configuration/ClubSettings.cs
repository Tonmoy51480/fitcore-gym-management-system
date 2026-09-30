namespace BLL.Configuration
{
    public class ClubSettings
    {
        public const string SectionName = "ClubSettings";

        public string ClubName { get; set; } = "FITCORE Gym & Fitness";
        public string Currency { get; set; } = "$";
        public int WarningDaysThreshold { get; set; } = 7;
    }
}
