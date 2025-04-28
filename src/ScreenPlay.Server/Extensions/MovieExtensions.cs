using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Extensions;

public static class MovieExtensions
{
    public static Movie EnrichWith(this Movie target, Movie source)
    {
        if (source == null)
            throw new ArgumentNullException(nameof(source));

        foreach (var property in typeof(Movie).GetProperties())
        {
            if (!property.CanWrite)
                continue;

            var targetValue = property.GetValue(target);
            var sourceValue = property.GetValue(source);
            if (IsNullOrDefault(targetValue) && sourceValue != null)
            {
                property.SetValue(target, sourceValue);
            }
        }

        return target;
    }

    private static bool IsNullOrDefault(object value)
    {
        if (value == null)
            return true;

        var type = value.GetType();
        return type.IsValueType && Activator.CreateInstance(type).Equals(value);
    }
}
