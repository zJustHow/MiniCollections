FROM eclipse-temurin:17-jre

WORKDIR /app

COPY build/libs/MiniCollections-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS:--Xms256m -Xmx768m} -jar app.jar"]