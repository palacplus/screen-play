using System.ComponentModel.DataAnnotations;

namespace Climax.Configuration;

public class TransmissionOptions
{
    public static string ConfigSection => "Transmission";

    [Required]
    public string? BaseAddress { get; set; }

    public string SessionId { get; set; } = "";

    public string Url => this.BaseAddress + "/transmission/rpc";
}
