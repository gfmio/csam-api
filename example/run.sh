#! /bin/sh

# Run the MongoDB container
docker run -p 27017:27017 -d mongo:3.3.12

# Run the Redis container
docker run -p 6379:6379 -d redis:3.0.7

# Start the API server
npm run watch
