using System.Net;
using System.Net.Http;

namespace ScreenPlay.Server.Tests.Helpers;

public class MockHttpMessageHandler : HttpMessageHandler
{
    private HttpResponseMessage _response;

    public void SetupResponse(HttpStatusCode statusCode, string content)
    {
        _response = new HttpResponseMessage { StatusCode = statusCode, Content = new StringContent(content) };
    }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        return Task.FromResult(_response);
    }
}