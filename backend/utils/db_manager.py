import sqlite3
import os
import sys

class DBManager:
    def __init__(self, db_path):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        # Create database and tables if they don't exist
        # Schema is in root/database/schema.sql
        # This file is in root/backend/utils/db_manager.py
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        schema_path = os.path.join(BASE_DIR, 'database', 'schema.sql')
        if not os.path.exists(schema_path):
            print(f"Error: Schema file not found at {schema_path}")
            return

        with open(schema_path, 'r') as f:
            schema = f.read()

        conn = self._get_connection()
        try:
            conn.executescript(schema)
            conn.commit()
            
            # Auto-seed if patients table is empty
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM patients")
            count = cursor.fetchone()['count']
            
            if count == 0:
                print("Database initialized. Seeding initial data...")
                # Import migrate here to avoid circular dependency
                ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                sys.path.append(os.path.join(ROOT_DIR, 'database'))
                try:
                    from migrate_data import migrate
                    migrate(db=self)
                except ImportError as e:
                    print(f"Warning: Could not import migrate_data for seeding: {e}")
                except Exception as e:
                    print(f"Error during auto-seeding: {e}")
                    
        finally:
            conn.close()

    def execute_query(self, query, params=(), commit=False):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, params)
            if commit:
                conn.commit()
                return cursor.lastrowid
            return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            print(f"Database Error: {e}")
            return None
        finally:
            conn.close()

    def execute_many(self, query, params_list, commit=True):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.executemany(query, params_list)
            if commit:
                conn.commit()
            return True
        except Exception as e:
            print(f"Database Error: {e}")
            return False
        finally:
            conn.close()
