# Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
# remove CRLF (arquivo salvo no Windows) para o script rodar no Linux
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B package -DskipTests

# Execução
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/sus360-api.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
