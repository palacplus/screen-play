using Transmission.API.RPC.Entity;

namespace Climax.Services
{
    /// <summary>
    /// Interface for async transmission client
    /// </summary>
    public interface ITransmissionClient
    {
        /// <summary>
        /// Get information of current session (API: session-get)
        /// </summary>
        /// <returns>Session information</returns>
        Task<SessionInfo> GetSessionInformationAsync();

        /// <summary>
        /// Get fields of torrents from ids (API: torrent-get)
        /// </summary>
        /// <param name="fields">Fields of torrents</param>
        /// <param name="ids">IDs of torrents (null or empty for get all torrents)</param>
        /// <returns>Torrents info</returns>
        Task<TransmissionTorrents> TorrentGetAsync(string[] fields, params int[] ids);
    }
}
