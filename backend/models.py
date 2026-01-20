from typing import Optional
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username:str=Field(index=True,unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    
class UserCreate(SQLModel):
    username:str
    email: str
    password: str