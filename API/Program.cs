using EFDataAccess;

namespace API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            // Auto seed on startup
            SeedRunner.Run(host.Services);

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();

                    webBuilder.UseSentry(o =>
                    {
                        o.Dsn = "https://42856e7ceca42c96759e8d360f357474@o4508383067504640.ingest.de.sentry.io/4508383079235664";
                        o.Debug = true;
                        o.TracesSampleRate = 1.0;
                    });
                });
    }
}
