#!/bin/bash

# Ensure that dist/index.js exists before running nodemon
tsc --pretty

# Function to kill all child processes
terminate_jobs() {
    jobs -p | xargs kill -9 2>/dev/null
}

# Set a trap to catch exits, signals, and terminations
trap terminate_jobs EXIT

tsc --pretty -w &
PID1=$!

nodemon dist/index.js &
PID2=$!

# Wait for any command to exit
while kill -0 $PID1 2>/dev/null && kill -0 $PID2 2>/dev/null; do
    sleep 1
done

# If we reach here, one of the commands has exited
# The trap will ensure that other running jobs are terminated
