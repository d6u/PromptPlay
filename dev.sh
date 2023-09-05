#!/bin/bash

# Function to kill all child processes
terminate_jobs() {
  jobs -p | xargs kill -9 2>/dev/null
}

# Set a trap to catch exits, signals, and terminations
trap terminate_jobs EXIT

docker-compose up &
PID1=$!

uvicorn server.main:app --host 0.0.0.0 --reload &
PID2=$!

pushd front

vite &
PID3=$!

graphql-codegen -w &
PID4=$!

# Wait for any command to exit
while kill -0 $PID1 2>/dev/null && kill -0 $PID2 2>/dev/null && kill -0 $PID3 2>/dev/null && kill -0 $PID4 2>/dev/null; do
  sleep 1
done

# If we reach here, one of the commands has exited
# The trap will ensure that other running jobs are terminated
