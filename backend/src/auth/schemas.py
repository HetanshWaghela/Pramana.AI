from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class UserBase(BaseModel):
    """Base schema for user."""
    email: EmailStr
    name: str


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema for token data."""
    user_id: Optional[int] = None
    email: Optional[str] = None


# Chat Schemas
class ChatMessageBase(BaseModel):
    """Base schema for chat message."""
    message_type: str  # 'human' or 'ai'
    content: str
    message_id: Optional[str] = None


class ChatMessageCreate(ChatMessageBase):
    """Schema for creating a chat message."""
    pass


class ChatMessageResponse(ChatMessageBase):
    """Schema for chat message response."""
    id: int
    chat_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatBase(BaseModel):
    """Base schema for chat."""
    title: str = "New Chat"
    preview: Optional[str] = None


class ChatCreate(ChatBase):
    """Schema for creating a chat."""
    id: Optional[str] = None  # Client can provide UUID


class ChatUpdate(BaseModel):
    """Schema for updating a chat."""
    title: Optional[str] = None
    preview: Optional[str] = None


class ChatResponse(ChatBase):
    """Schema for chat response."""
    id: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    """Schema for chat list item (without messages)."""
    id: str
    title: str
    preview: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AddMessageRequest(BaseModel):
    """Schema for adding a message to a chat."""
    messages: List[ChatMessageCreate]
