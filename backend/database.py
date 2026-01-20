from sqlmodel import SQLModel, create_engine, Session

# 1. Create a SQLite database file named 'database.db'
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# 2. Create the engine (the connection to the DB)
connect_args = {"check_same_thread": False} # Needed for SQLite
engine = create_engine(sqlite_url, connect_args=connect_args)

# 3. Helper function: Create tables if they don't exist
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# 4. Helper function: Get a session (to talk to the DB)
# We use this in our API endpoints
def get_session():
    with Session(engine) as session:
        yield session