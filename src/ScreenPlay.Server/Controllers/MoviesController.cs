using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScreenPlay.Server.Data;
using ScreenPlay.Server.Dtos;
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
        return await _context.Movies.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Movie>> GetMovie(int id)
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

        return movie;
    }

    [HttpPut("{id}")]
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

    [HttpPost("{imdbId}/queue")]
    public async Task<IActionResult> AddMovieToQueue(string imdbId)
    {
        // TODO: Find the movie by ID to make sure it does not exist in the database
        // var movie = await _context.Movies.FirstOrDefaultAsync(m => m.ImdbId == imdbId.ToString());

        var movie = await _radarrClient.GetMovieByImdbIdAsync(imdbId.ToString());
        if (movie == null)
        {
            return NotFound($"Movie with ID {imdbId} not found.");
        }

        var addMovieRequest = new AddMovieRequest(movie.TmdbId);
        movie = await _radarrClient.PostMovieAsync(addMovieRequest);
        if (movie == null)
        {
            return BadRequest("Failed to add movie to queue.");
        }
        return Ok(movie);
    }

    private bool MovieExists(int id)
    {
        return (_context.Movies?.Any(e => e.Id == id)).GetValueOrDefault();
    }
}
