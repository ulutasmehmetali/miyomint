/*
  # Enable pg_net Extension
  
  1. Enables the pg_net extension for making HTTP requests from PostgreSQL
  2. This is required for the welcome email webhook functionality
*/

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;