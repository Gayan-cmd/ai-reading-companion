from typing import Optional
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username:str=Field(index=True,unique=True)
    email: str = Field(index=True, unique=True)
    is_verified:bool=Field(default=False)
    hashed_password: str
    
class UserCreate(SQLModel):
    username:str
    email: str
    password: str
    
class UserRead(SQLModel):
    id:int
    username: str
    email:str
    is_verified:bool
    
    