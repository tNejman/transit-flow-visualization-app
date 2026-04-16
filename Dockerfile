FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN ./mvnw dependency:go-offline

COPY src ./src

RUN ./mvnw clean install 

RUN mv /app/target/*.jar /app/target/app.jar

FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

COPY --from=builder /app/target/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT [ "java", "-Duser.timezone=UTC", "-jar", "app.jar" ]