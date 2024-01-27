using Climax.Models;
using Climax.Services;
using Microsoft.AspNetCore.Mvc;
using Transmission.API.RPC.Common;
using Transmission.API.RPC.Entity;

namespace Climax.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TransmissionController : ControllerBase
{
    private readonly ILogger<TransmissionController> _logger;
    private readonly ITransmissionClient _client;

    public TransmissionController(
        ILogger<TransmissionController> logger,
        ITransmissionClient client
    )
    {
        _logger = logger;
        _client = client;
    }

    // GET: api/Movies/5
    [HttpGet("{id}/progress")]
    public async Task<ActionResult<Movie>> GetProgress(int id)
    {
        var sessionInfo = await _client.GetSessionInformationAsync();
        _logger.LogInformation(sessionInfo.ToString());
        return Ok();
    }
}
