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
    [AllowAnonymous]
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
    [Authorize(Roles = "Admin")]
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
            if (!MovieExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<Movie>> PostMovie(Movie movie)
    {
        if (_context.Movies == null)
        {
            return Problem("Entity set 'AppDbContext.Movies'  is null.");
        }
        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetMovie", new { id = movie.Id }, movie);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteMovie(int id)
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

        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("queue")]
    public async Task<IActionResult> AddMovieToQueue([FromBody] NewMovieDto dto)
    {
        if (_context.Movies == null)
        {
            return Problem("Entity set 'AppDbContext.Movies'  is null.");
        }
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == dto.ImdbID);
        if (movie != null)
        {
            return BadRequest("Movie already exists.");
        }

        var movieResponse = await _radarrClient.GetMovieByImdbIdAsync(dto.ImdbID);
        if (movieResponse == null)
        {
            return NotFound($"Movie with ID {dto.ImdbID} not found.");
        }
        if (movieResponse.TmdbId == 0)
        {
            return BadRequest("Movie does not have a TMDB ID.");
        }
        var request = new SearchMovieRequest(movieResponse.TmdbId);
        movieResponse = await _radarrClient.SearchMovieAsync(request);
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

        var movies = await _context.Movies.ToListAsync();
        var stats = new StatsDto
        {
            MovieCount = _context.Movies.Count(),
            UserCount = _context.Users.Count(),
            RatingsCount = _context.Ratings.Count(),
        };

        return Ok(stats);
    }

    private bool MovieExists(int id)
    {
        return (_context.Movies?.Any(e => e.Id == id)).GetValueOrDefault();
    }
}
