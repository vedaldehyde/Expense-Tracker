FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Server.csproj", "./"]
RUN dotnet restore "Server.csproj"
COPY . .
RUN dotnet publish "Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Server.dll"]
