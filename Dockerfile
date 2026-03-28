FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Kopiramo fajl direktno bez ./ ako smo vec u WORKDIR
COPY My_Blog.sln My_Blog.sln

# Proveri da li su imena foldera API ili api - mora biti identicno kao u Windowsu
COPY API/api.csproj API/
COPY Domain/Domain.csproj Domain/
COPY Application/Application.csproj Application/
COPY Implementation/Implementation.csproj Implementation/
COPY EFDataAccess/EFDataAccess.csproj EFDataAccess/

RUN dotnet restore "My_Blog.sln"

COPY . .
# Obrati paznju: tvoj .sln kaze da je projekat u API/api.csproj
RUN dotnet publish "API/api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
# Proveri da li se izlazni dll zove api.dll ili API.dll
ENTRYPOINT ["dotnet", "api.dll"]