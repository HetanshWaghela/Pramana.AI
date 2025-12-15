from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    """User model for authentication."""
    
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to chats
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


class Chat(Base):
    """Chat/Conversation model for storing user conversations."""
    
    __tablename__ = "chats"

    id = Column(String(36), primary_key=True, index=True)  # UUID
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="New Chat")
    preview = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to user and messages
    user = relationship("User", back_populates="chats")
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def __repr__(self):
        return f"<Chat(id={self.id}, title={self.title})>"


class ChatMessage(Base):
    """Individual message within a chat."""
    
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String(36), ForeignKey("chats.id"), nullable=False, index=True)
    message_type = Column(String(20), nullable=False)  # 'human' or 'ai'
    content = Column(Text, nullable=False)
    message_id = Column(String(100), nullable=True)  # Optional external message ID
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to chat
    chat = relationship("Chat", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, type={self.message_type})>"
