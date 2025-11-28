# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Kopiraj SVE projekte (API, Domain, EFDataAccess, itd.)
COPY . .

# Restore zavisnosti za ceo solution (ako ima .sln) ili samo za API
RUN dotnet restore "api.csproj"

# Build i publish API projekta (automatski će uključiti sve zavisnosti)
RUN dotnet publish "api.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Kopiraj objavljeni output
COPY --from=build /app/publish .

# Pokreni aplikaciju
ENTRYPOINT ["dotnet", "api.dll"]
