#!/bin/bash

echo "ENV: $ENV"

if [[ "$ENV" == "production" ]] || [[ "$ENV" == "preview" ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi
