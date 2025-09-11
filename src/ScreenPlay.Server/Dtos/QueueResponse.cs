
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Dtos;

public class QueueResponse
{
    public List<QueueItem> Items { get; set; }
}

public class QueueItem
{
    public QueueItem(QueueItemDto dto)
    {
        Quality = dto.Quality;
        Added = dto.Added;
        Status = dto.Status;
        Size = dto.Size;
        Sizeleft = dto.Sizeleft;
        EstimatedCompletionTime = dto.EstimatedCompletionTime;
    }
    public Movie Movie { get; set; }
    public QualityDto Quality { get; set; }
    public DateTime Added { get; set; }
    public double PercentComplete => Size > 0 ? Math.Round((double)(Size - Sizeleft) / Size * 100, 2) : 0;
    public string Status { get; set; }    
    
    private TimeSpan TimeLeft => EstimatedCompletionTime > DateTime.UtcNow 
        ? EstimatedCompletionTime - DateTime.UtcNow 
        : TimeSpan.Zero;
    public string TimeLeftFormatted => TimeLeft > TimeSpan.Zero 
        ? $"{TimeLeft.Days}d {TimeLeft.Hours}h {TimeLeft.Minutes}m {TimeLeft.Seconds}s"
        : "N/A";
    public long Size { get; set; }
    public long Sizeleft { get; set; }
    public DateTime EstimatedCompletionTime { get; set; }
}