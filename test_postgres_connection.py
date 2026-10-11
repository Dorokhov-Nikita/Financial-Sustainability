#!/usr/bin/env python
"""Test PostgreSQL connection to Supabase"""

import psycopg2
from psycopg2 import sql

# Connection details
DATABASE_URI = "postgresql+psycopg2://postgres.inuvmikfydrwazyudpem:nikkpi04040@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Parse connection string
parts = DATABASE_URI.replace("postgresql+psycopg2://", "").split("@")
user_pass = parts[0].split(":")
host_port_db = parts[1].split("/")
host_port = host_port_db[0].split(":")
db = host_port_db[1]

user = user_pass[0]
password = user_pass[1]
host = host_port[0]
port = int(host_port[1])

print(f"Connecting to: {host}:{port}/{db}")
print(f"User: {user}")

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        host=host,
        port=port,
        database=db,
        user=user,
        password=password
    )
    
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    
    tables = cursor.fetchall()
    print("\n[OK] Connected to PostgreSQL!")
    print(f"\nTables in database:")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Check user_data table structure
    cursor.execute("""
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name = 'user_data' AND table_schema = 'public'
    """)
    
    columns = cursor.fetchall()
    print(f"\nuser_data columns:")
    for col in columns:
        print(f"  - {col[0]}: {col[1]}")
    
    # Check financial_assessments table structure
    cursor.execute("""
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name = 'financial_assessments' AND table_schema = 'public'
    """)
    
    columns = cursor.fetchall()
    print(f"\nfinancial_assessments columns ({len(columns)} total):")
    for col in columns[:10]:
        print(f"  - {col[0]}: {col[1]}")
    print(f"  ... and {len(columns)-10} more")
    
    cursor.close()
    conn.close()
    
    print("\n[OK] Database structure verified!")
    
except Exception as e:
    print(f"\n[ERROR] Connection failed!")
    print(f"Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
