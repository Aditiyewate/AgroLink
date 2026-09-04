# ==========================================
# STAGE 1: Build the packaged JAR file
# ==========================================
FROM maven:3.8.5-openjdk-17 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy all project files into the container
COPY . .

# Compile and package the project into a JAR file, skipping unit tests to speed up deployment
RUN mvn clean package -DskipTests

# ==========================================
# STAGE 2: Run the application
# ==========================================
FROM amazoncorretto:17-al2023-headless




# Set the working directory for execution
WORKDIR /app

# Copy the generated JAR file from the build stage into this new clean container
COPY --from=build /app/target/*.jar app.jar

# Inform Render that the application listens on port 8080
EXPOSE 8080

# Execute the application
ENTRYPOINT ["java", "-jar", "app.jar"]
