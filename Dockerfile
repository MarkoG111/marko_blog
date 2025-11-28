# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Kopiraj ceo repo (sada uključuje My_Blog.sln, API/, Domain/, itd.)
COPY . .

# Restore preko solution fajla (sada dostupan!)
RUN dotnet restore "My_Blog.sln"

# Publish API projekta
RUN dotnet publish "API/api.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .

# Pokreni API
ENTRYPOINT ["dotnet", "api.dll"]