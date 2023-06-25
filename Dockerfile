# Base image with Rust and cargo installed
FROM rust:latest as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the project files into the container
COPY . .

# Build the project
RUN cargo build --release

# Create a new image with only the built artifacts
FROM debian:buster-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies if needed (e.g., OpenSSL, etc.)

# Copy the built artifacts from the builder stage
COPY --from=builder /app/target/release/dockerprac .

# Set the command to run your Actix web server
CMD ["./dockerprac"]

