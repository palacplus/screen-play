using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScreenPlay.Server.Data;
using ScreenPlay.Server.Dtos;
using ScreenPlay.Server.Extensions;
using ScreenPlay.Server.Models;
using ScreenPlay.Server.Services;

namespace ScreenPlay.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MoviesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IRadarrClient _radarrClient;

    public MoviesController(AppDbContext context, IRadarrClient radarrClient)
    {
        _context = context;
        _radarrClient = radarrClient;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Movie>>> GetMovies()
    {
        if (_context.Movies == null)
        {
            return NotFound();
        }
        var movies = await _context
            .Movies.Where(m => !m.IsDeleted)
            .Include(m => m.Ratings)
            .Include(m => m.Images)
            .ToListAsync();

        return movies;
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Movie>> GetMovie(int id)
    {
        if (_context.Movies == null)
        {
            return NotFound();
        }
        var movie = await _context
            .Movies.Where(m => !m.IsDeleted)
            .Include(m => m.Ratings)
            .Include(m => m.Images)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (movie == null)
        {
            return NotFound();
        }

        return movie;
    }

    [HttpGet("imdbid/{imdbId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Movie>> GetMovieWithImdbId(string imdbId)
    {
        if (_context.Movies == null)
        {
            return NotFound();
        }
        var movie = await _context
            .Movies.Where(m => !m.IsDeleted)
            .Include(m => m.Ratings)
            .Include(m => m.Images)
            .FirstOrDefaultAsync(m => m.ImdbId == imdbId);

        if (movie == null)
        {
            return NotFound();
        }

        return Ok(movie);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRole.Admin)]
    public async Task<IActionResult> PutMovie(int id, Movie movie)
    {
        if (id != movie.Id)
        {
            return BadRequest();
        }

        _context.Entry(movie).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRole.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMovie(int id, [FromQuery] bool deleteFiles = false)
    {
        if (_context.Movies == null)
        {
            return NotFound();
        }
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null)
        {
            return NotFound();
        }

        if (deleteFiles)
        {
            var movieFromClient = await _radarrClient.GetMovieAsync(movie.TmdbId);
            if (movieFromClient == null)
            {
                return NotFound($"Movie with ID {movie.TmdbId} not found in Radarr.");
            }
            await _radarrClient.DeleteMovieAsync(movieFromClient.Id);
            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
            return Ok($"Movie with ID {id} deleted successfully.");
        }

        movie.IsDeleted = true;
        movie.Update();
        _context.Entry(movie).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok($"Movie with ID {id} marked as deleted.");
    }

    [HttpPost("queue")]
    public async Task<IActionResult> AddMovieToQueue([FromBody] NewMovieDto dto)
    {
        if (_context.Movies == null)
        {
            return Problem("Entity set 'AppDbContext.Movies'  is null.");
        }
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == dto.ImdbID && !m.IsDeleted);
        if (movie != null)
        {
            return BadRequest("Movie already exists.");
        }

        var movieResponse = await _radarrClient.LookupMovieByImdbIdAsync(dto.ImdbID);
        if (movieResponse == null)
        {
            return NotFound($"Movie with ID {dto.ImdbID} not found.");
        }
        if (movieResponse.TmdbId == 0)
        {
            return BadRequest("Movie does not have a TMDB ID.");
        }
        var request = new QueueMovieRequest(movieResponse.TmdbId);
        movieResponse = await _radarrClient.QueueMovieAsync(request);
        if (movieResponse == null)
        {
            return BadRequest("Failed to add movie to queue.");
        }

        var validationErrors = movieResponse.Validate();

        if (validationErrors.Any())
        {
            return BadRequest(validationErrors);
        }

        movie = movieResponse.ToMovie();
        movie.EnrichWith(dto.ToMovie());

        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(AddMovieToQueue), new { id = movie.Id }, movie);
    }

    [HttpGet("stats")]
    [AllowAnonymous]
    public async Task<ActionResult<StatsDto>> GetStats()
    {
        if (_context.Movies == null)
        {
            return NotFound();
        }

        var stats = new StatsDto
        {
            MovieCount = await _context.Movies.CountAsync(),
            UserCount = await _context.Users.CountAsync(),
            RatingsCount = await _context.Ratings.CountAsync(),
        };

        return Ok(stats);
    }

    [HttpGet("queue")]
    public async Task<ActionResult<QueueResponse>> GetQueue()
    {
        var queueActivity = await _radarrClient.GetQueueActivityAsync();
        if (queueActivity == null)
        {
            return NotFound();
        }

        var movies = await _context.Movies
            .Where(m => !m.IsDeleted)
            .Where(m => queueActivity.Records.Any(r => r.Movie.TmdbId == m.TmdbId))
            .Include(m => m.Ratings)
            .Include(m => m.Images)
            .ToListAsync();

        var response = new QueueResponse
        {
            Items = queueActivity.Records
                .Select(r =>
                {
                    var movie = movies.FirstOrDefault(m => m.TmdbId == r.Movie.TmdbId && !m.IsDeleted);
                    return movie != null ? new QueueItem(r) { Movie = movie } : null;
                })
                .Where(item => item != null)
                .ToList()
        };
        return Ok(response);
    }
}
