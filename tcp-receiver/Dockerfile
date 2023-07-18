FROM maven:latest AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn package

FROM openjdk:17-jdk-slim

WORKDIR /app

COPY --from=build /app/target/tcp-receiver-1.0-SNAPSHOT.jar .

CMD ["java", "-jar", "tcp-receiver-1.0-SNAPSHOT.jar"]