#!/bin/bash

echo "NODE_ENV: $NODE_ENV"

if [[ "$NODE_ENV" == "production" ]] || [[ "$NODE_ENV" == "preview" ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi
