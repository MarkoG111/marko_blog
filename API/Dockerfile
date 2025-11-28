# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Kopiraj SVE projekte
COPY . .

# Restore zavisnosti preko solution fajla
RUN dotnet restore "My_Blog.sln"

# Build i publish API projekta
RUN dotnet publish "API/api.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Kopiraj objavljeni output
COPY --from=build /app/publish .

# Pokreni aplikaciju
ENTRYPOINT ["dotnet", "api.dll"]