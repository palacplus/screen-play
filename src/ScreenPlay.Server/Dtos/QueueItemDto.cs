using System.ComponentModel.DataAnnotations;

namespace ScreenPlay.Server.Dtos;

public class QueueItemDto
{
    [Required]
    public int MovieId { get; set; }

    [Required]
    public QualityDto Quality { get; set; }

    [Required]
    public DateTime Added { get; set; }

    [Required]
    public long Size { get; set; }
    
    [Required]
    public string Status { get; set; }

    [Required]
    public long Sizeleft { get; set; }

    [Required]
    public DateTime EstimatedCompletionTime { get; set; }

    [Required]
    public MovieDto Movie { get; set; }
}
