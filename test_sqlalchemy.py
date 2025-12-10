from sqlalchemy import create_engine, text
import os

try:
    print(f"CWD: {os.getcwd()}")
    # Try relative
    engine = create_engine('sqlite:///minimal.db')
    with engine.connect() as conn:
        conn.execute(text("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)"))
        print("Relative DB created/connected!")

    # Try absolute
    abs_path = os.path.join(os.getcwd(), 'absolute.db')
    engine2 = create_engine(f'sqlite:///{abs_path}')
    with engine2.connect() as conn:
        conn.execute(text("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)"))
        print("Absolute DB created/connected!")
except Exception as e:
    print(f"Error: {e}")
