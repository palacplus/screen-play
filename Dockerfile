ARG PROJECT_NAME=ScreenPlay.Server
ARG CLIENT_NAME=ScreenPlay.Client

# Use the official .NET 9.0 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
ARG PROJECT_NAME
ARG CLIENT_NAME
ENV DOTNET_NUGET_SIGNATURE_VERIFICATION=false
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true
ENV DOTNET_RUNNING_IN_CONTAINER=true

ADD ./src/${PROJECT_NAME}/${PROJECT_NAME}.csproj /app/src/${PROJECT_NAME}/${PROJECT_NAME}.csproj
WORKDIR /app/src/${PROJECT_NAME}

RUN apk --no-cache add ca-certificates && update-ca-certificates
RUN apk add --update npm
RUN dotnet restore -r linux-musl-x64

ADD ./src/${PROJECT_NAME} /app/src/${PROJECT_NAME}
ADD ./src/${CLIENT_NAME} /app/src/${CLIENT_NAME}

WORKDIR /app/src/${PROJECT_NAME}

RUN dotnet publish --disable-parallel -c Release -r linux-musl-x64 --self-contained -o /app/out


# Use the official .NET 9.0 runtime image to run the app
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
ARG PROJECT_NAME
ARG CLIENT_NAME
ENV PROJECT_NAME=${PROJECT_NAME}
ENV CLIENT_NAME=${CLIENT_NAME}

COPY --from=build /etc/ssl/certs /etc/ssl/certs

RUN apk --no-cache add ca-certificates && update-ca-certificates
RUN apk add --update npm
RUN apk del ca-certificates
RUN apk --purge del apk-tools

COPY --chown=app:app --from=build /app/out /app
COPY --chown=app:app --from=build /app/src/${CLIENT_NAME} /app/${CLIENT_NAME}

USER app
WORKDIR /app

# Expose the port the app runs on
EXPOSE 44427

# Set the entry point for the container
CMD /app/${PROJECT_NAME}
