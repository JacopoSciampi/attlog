FROM maven:3.8.3-openjdk-11 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn package

FROM openjdk:11-jre-slim

WORKDIR /app

COPY --from=build /app/target/tcp-receiver-1.0-SNAPSHOT.jar .

CMD ["java", "-jar", "tcp-receiver-1.0-SNAPSHOT.jar.jar"]