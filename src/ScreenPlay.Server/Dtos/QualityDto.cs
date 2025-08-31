using System.ComponentModel.DataAnnotations;

namespace ScreenPlay.Server.Dtos;

public class QualityDto
{
    [Required]
    public QualityProfileDto Quality { get; set; }
}

public class QualityProfileDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    public string Source { get; set; }

    [Required]
    public int Resolution { get; set; }
}