#!/bin/bash

# Test auth-handler signup
curl -X POST https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/auth-handler \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvemp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNzUxODQsImV4cCI6MjA0OTY1MTE4NH0.jxSJ3qp2tmRLjfIdYVf5yDgKjdpXOwxSBwn7XXM6Lmg" \
  -d '{"action":"signup_email","email":"test@geovera.com","password":"Test123456!","full_name":"Test User"}'
