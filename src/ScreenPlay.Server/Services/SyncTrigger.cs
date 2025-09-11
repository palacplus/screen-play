
namespace ScreenPlay.Server.Services;

public class SyncTrigger
{
    private TaskCompletionSource<bool> _syncRequest;
    private readonly object _lock = new object();

    public SyncTrigger()
    {
        _syncRequest = new TaskCompletionSource<bool>();
    }

    public Task WaitForSyncRequestAsync()
    {
        lock (_lock)
        {
            var tcs = _syncRequest;
            _syncRequest = new TaskCompletionSource<bool>();
            return tcs.Task;
        }
    }

    public void TriggerSync()
    {
        lock (_lock)
        {
            _syncRequest.TrySetResult(true);
        }
    }
}