from datetime import datetime
from typing import List
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .database import get_db
from .models import User, Chat, ChatMessage
from .schemas import (
    ChatCreate,
    ChatUpdate,
    ChatResponse,
    ChatListResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    AddMessageRequest,
)
from .utils import get_current_user

router = APIRouter(prefix="/chats", tags=["Chats"])


@router.get("", response_model=List[ChatListResponse])
async def get_user_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chats for the current user."""
    chats = db.query(Chat).filter(
        Chat.user_id == current_user.id
    ).order_by(Chat.updated_at.desc()).all()
    return chats


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat for the current user."""
    chat_id = chat_data.id or str(uuid4())
    
    # Check if chat with this ID already exists
    existing_chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if existing_chat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat with this ID already exists"
        )
    
    db_chat = Chat(
        id=chat_id,
        user_id=current_user.id,
        title=chat_data.title,
        preview=chat_data.preview
    )
    
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    
    return db_chat


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific chat with all messages."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    return chat


@router.put("/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: str,
    chat_data: ChatUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a chat's title or preview."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat_data.title is not None:
        chat.title = chat_data.title
    if chat_data.preview is not None:
        chat.preview = chat_data.preview
    
    chat.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(chat)
    
    return chat


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chat and all its messages."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    db.delete(chat)
    db.commit()
    
    return None


@router.post("/{chat_id}/messages", response_model=ChatResponse)
async def add_messages_to_chat(
    chat_id: str,
    request: AddMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add messages to a chat."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Add messages
    for msg in request.messages:
        db_message = ChatMessage(
            chat_id=chat_id,
            message_type=msg.message_type,
            content=msg.content,
            message_id=msg.message_id
        )
        db.add(db_message)
    
    # Update chat preview with first human message if exists
    human_messages = [m for m in request.messages if m.message_type == 'human']
    if human_messages:
        preview = human_messages[0].content[:100]
        chat.preview = preview
        # Also update title if it's still "New Chat"
        if chat.title == "New Chat":
            chat.title = human_messages[0].content[:50] + ("..." if len(human_messages[0].content) > 50 else "")
    
    chat.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(chat)
    
    return chat


@router.delete("/{chat_id}/messages", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chat_messages(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all messages from a chat."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).delete()
    chat.updated_at = datetime.utcnow()
    db.commit()
    
    return None
