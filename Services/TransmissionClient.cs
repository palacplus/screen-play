using System.Net;
using System.Text;
using Climax.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Transmission.API.RPC.Common;
using Transmission.API.RPC.Entity;

namespace Climax.Services;

public class TransmissionClient : ITransmissionClient
{
    private readonly ILogger<TransmissionClient> _logger;
    private string _sessionID;
    private string _url;

    public TransmissionClient(
        IOptions<TransmissionOptions> options,
        ILogger<TransmissionClient> logger
    )
    {
        _logger = logger;
        _url = options.Value.Url;
        _sessionID = options.Value.SessionId;
    }

    public async Task<SessionInfo> GetSessionInformationAsync()
    {
        var request = new TransmissionRequest("session-get");
        var response = await SendRequestAsync(request);
        var result = response.Deserialize<SessionInfo>();
        return result;
    }

    public async Task<TransmissionTorrents> TorrentGetAsync(string[] fields, params int[] ids)
    {
        var arguments = new Dictionary<string, object> { { "fields", fields } };

        if (ids != null && ids.Length > 0)
            arguments.Add("ids", ids);

        var request = new TransmissionRequest("torrent-get", arguments);

        var response = await SendRequestAsync(request);
        var result = response.Deserialize<TransmissionTorrents>();

        return result;
    }

    private async Task<TransmissionResponse> SendRequestAsync(TransmissionRequest request)
    {
        var result = new TransmissionResponse();

        var httpClientHandler = new HttpClientHandler()
        {
            ServerCertificateCustomValidationCallback = (_, _, _, _) =>
            {
                return true;
            }
        };
        //Prepare http web request
        var httpClient = new HttpClient(httpClientHandler);

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, _url);
        httpRequest.Headers.Add("X-Transmission-Session-Id", _sessionID);

        httpRequest.Content = new StringContent(
            request.ToJson(),
            Encoding.UTF8,
            "application/json-rpc"
        );

        //Send request and prepare response
        using (var httpResponse = await httpClient.SendAsync(httpRequest))
        {
            if (httpResponse.IsSuccessStatusCode)
            {
                var responseString = await httpResponse.Content.ReadAsStringAsync();
                result = JsonConvert.DeserializeObject<TransmissionResponse>(responseString);

                _logger.LogInformation(result.Result);
                if (result.Result != "success")
                    throw new Exception(result.Result);
            }
            else if (httpResponse.StatusCode == HttpStatusCode.Conflict)
            {
                if (httpResponse.Headers.Count() > 0)
                {
                    //If session id expired, try get session id and send request
                    if (
                        httpResponse.Headers.TryGetValues(
                            "X-Transmission-Session-Id",
                            out var values
                        )
                    )
                        _sessionID = values.First();
                    else
                        throw new Exception("Session ID Error");

                    result = await SendRequestAsync(request);
                }
            }
            else
                throw new HttpRequestException();
        }

        return result;
    }
}
