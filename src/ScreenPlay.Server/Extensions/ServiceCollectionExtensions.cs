using Microsoft.Extensions.Options;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Binds a configuration section to a specified options type, registers it with the service collection,
    /// enables DataAnnotations validation, and validates the configuration during application startup.
    /// </summary>
    /// <typeparam name="TOptions">The type of the options object to bind and validate.</typeparam>
    /// <param name="services">The service collection to which the options are added.</param>
    /// <param name="sectionName">The name of the configuration section to bind.</param>
    /// <exception cref="OptionsValidationException">Thrown if validation fails during application startup.</exception>
    public static void BindAndValidateOnStart<TOptions>(this IServiceCollection services, string sectionName)
        where TOptions : class, new()
    {
        services.AddOptions<TOptions>().BindConfiguration(sectionName).ValidateDataAnnotations().ValidateOnStart();
    }
}
