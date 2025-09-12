using System.ComponentModel.DataAnnotations;

namespace ScreenPlay.Server.Dtos;

public class QueueActivityDto
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public string SortKey { get; set; }

    [Required]
    public int TotalRecords { get; set; }

    [Required]
    public List<QueueItemDto> Records { get; set; }
}
