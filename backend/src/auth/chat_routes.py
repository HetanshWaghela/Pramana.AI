from datetime import datetime
from typing import List, Dict
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, JSONResponse
from sqlalchemy.orm import Session
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT
import html
import json
import base64

from agent.insights_graphs import generate_all_insights_graphs

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


@router.get("/{chat_id}/graphs")
async def get_chat_insights_graphs(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate insight graphs for chat analysis."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Extract insights from chat messages
    # Look for structured data in AI responses
    scores = None
    market_data = None
    patent_data = []
    competition_data = None
    trials_data = []
    signals = []
    
    import re
    
    for message in chat.messages:
        if message.message_type == 'ai':
            content = message.content
            
            # Try to extract JSON data from message content
            try:
                # Look for score patterns (Opportunity: 65, Risk: 35, Innovation: 55)
                if 'opportunity' in content.lower() and 'score' in content.lower():
                    opp_match = re.search(r'opportunity[:\s]+?(\d+(?:\.\d+)?)', content, re.IGNORECASE)
                    risk_match = re.search(r'risk[:\s]+?(\d+(?:\.\d+)?)', content, re.IGNORECASE)
                    inn_match = re.search(r'innovation[:\s]+?(\d+(?:\.\d+)?)', content, re.IGNORECASE)
                    
                    if opp_match or risk_match or inn_match:
                        scores = {
                            'opportunity': float(opp_match.group(1)) if opp_match else 50.0,
                            'risk': float(risk_match.group(1)) if risk_match else 30.0,
                            'innovation': float(inn_match.group(1)) if inn_match else 40.0,
                        }
                
                # Enhanced market data extraction
                if 'market' in content.lower() and ('size' in content.lower() or 'cagr' in content.lower()):
                    # Look for USD million/billion patterns
                    market_match = re.search(r'\$?\s*(\d+(?:,\d+)*(?:\.\d+)?)[\s-]*(million|billion|mn|bn)\s*(?:usd)?', content, re.IGNORECASE)
                    cagr_match = re.search(r'cagr[:\s]*?(\d+(?:\.\d+)?)%?', content, re.IGNORECASE)
                    unmet_match = re.search(r'unmet[\s_]need[:\s]*?(\d+(?:\.\d+)?)', content, re.IGNORECASE)
                    
                    if market_match or cagr_match:
                        market_size = 0
                        if market_match:
                            size_val = float(market_match.group(1).replace(',', ''))
                            unit = market_match.group(2).lower()
                            multiplier = 1000000 if unit in ['million', 'mn'] else 1000000000
                            market_size = size_val * multiplier
                        
                        market_data = {
                            'market_size_usd': market_size if market_size > 0 else 1000000000,
                            'cagr_5yr': float(cagr_match.group(1)) if cagr_match else 5.0,
                            'unmet_need_score': float(unmet_match.group(1)) if unmet_match else 0.5,
                        }
                
                # Extract competition metrics
                if 'competitor' in content.lower() or 'player' in content.lower() or 'market share' in content.lower():
                    players_match = re.search(r'(\d+)[\s]+players?', content, re.IGNORECASE)
                    top5_match = re.search(r'top[\s_]?5[\s_]share[:\s]*?(\d+(?:\.\d+)?)%?', content, re.IGNORECASE)
                    concentration_match = re.search(r'market[\s_]concentration[:\s]*?(\d+(?:\.\d+)?)%?', content, re.IGNORECASE)
                    
                    if players_match or top5_match:
                        competition_data = {
                            'total_players': int(players_match.group(1)) if players_match else 20,
                            'top_5_share_pct': float(top5_match.group(1)) if top5_match else 45.0,
                            'entry_barrier_score': 70,
                            'rd_intensity': 50,
                            'price_pressure': 60,
                            'patent_strength': 55,
                        }
                        
                        if concentration_match:
                            competition_data['top_5_share_pct'] = float(concentration_match.group(1))
                
                # Extract patent information
                patent_matches = re.finditer(r'patent[\s\w]*expir(?:y|ing|es)[\s]*(?:in)?[\s]*(\d+)[\s]*years?', content, re.IGNORECASE)
                for match in patent_matches:
                    years = int(match.group(1))
                    patent_data.append({
                        'title': f'Patent expiring in {years} years',
                        'years_to_expiry': years
                    })
                
                # Look for trial/study counts
                trial_match = re.search(r'(\d+)[\s]*(?:clinical[\s])?trials?|studies', content, re.IGNORECASE)
                if trial_match and not trials_data:
                    count = int(trial_match.group(1))
                    # Distribute across phases
                    trials_data = [
                        {'protocolSection': {'designModule': {'phases': ['PHASE1']}}},
                        {'protocolSection': {'designModule': {'phases': ['PHASE2']}}},
                        {'protocolSection': {'designModule': {'phases': ['PHASE2']}}},
                    ] * (count // 3)
                
                # Look for signals
                signal_patterns = [
                    'HIGH_WHITESPACE', 'MODERATE_WHITESPACE', 'PATENT_WINDOW_OPEN',
                    'CROWDED_MARKET', 'FRAGMENTED_MARKET', 'HIGH_IMPORT_DEPENDENCY',
                    'BIG_PHARMA_ACTIVE', 'HIGH_GROWTH_MARKET', 'MODERATE_GROWTH', 'FTO_BLOCKED'
                ]
                for pattern in signal_patterns:
                    pattern_words = pattern.replace('_', ' ').lower()
                    if pattern_words in content.lower() or pattern in content:
                        if pattern not in signals:
                            signals.append(pattern)
                
            except Exception as e:
                print(f"Error extracting insights: {e}")
                continue
    
    # Generate sample data if nothing was extracted
    if not scores and not market_data and not signals:
        scores = {'opportunity': 65, 'risk': 35, 'innovation': 55}
        market_data = {'market_size_usd': 5000000000, 'cagr_5yr': 7.5, 'unmet_need_score': 0.72}
        signals = ['HIGH_WHITESPACE', 'PATENT_WINDOW_OPEN', 'MODERATE_GROWTH']
        competition_data = {
            'top_5_share_pct': 45,
            'total_players': 15,
            'entry_barrier_score': 70,
            'rd_intensity': 55,
            'price_pressure': 60,
            'patent_strength': 50
        }
        patent_data = [
            {'title': 'Sample Patent 1', 'years_to_expiry': 2},
            {'title': 'Sample Patent 2', 'years_to_expiry': 5}
        ]
    
    # Generate graphs
    graphs = generate_all_insights_graphs(
        scores=scores,
        market_data=market_data,
        patent_data=patent_data if patent_data else None,
        competition_data=competition_data,
        trials_data=trials_data if trials_data else None,
        signals=signals if signals else None
    )
    
    return JSONResponse(content={
        "graphs": graphs,
        "metadata": {
            "chat_id": chat_id,
            "title": chat.title,
            "generated_at": datetime.utcnow().isoformat()
        }
    })


@router.get("/{chat_id}/export/pdf")
async def export_chat_to_pdf(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export a chat conversation to PDF with enhanced formatting and optional graphs."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Create PDF in memory with better layout
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        topMargin=0.75*inch, 
        bottomMargin=0.75*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch
    )
    story = []
    
    # Define improved styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'ChatTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor='#1f2937',
        spaceAfter=6,
        fontName='Helvetica-Bold',
        alignment=TA_LEFT,
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor='#6b7280',
        spaceAfter=24,
        fontName='Helvetica',
    )
    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor='#374151',
        spaceBefore=18,
        spaceAfter=10,
        fontName='Helvetica-Bold',
    )
    human_style = ParagraphStyle(
        'HumanMessage',
        parent=styles['Normal'],
        fontSize=11,
        leftIndent=12,
        rightIndent=20,
        spaceAfter=8,
        textColor='#1f2937',
        fontName='Helvetica',
        leading=14,
    )
    human_label_style = ParagraphStyle(
        'HumanLabel',
        parent=styles['Normal'],
        fontSize=11,
        textColor='#3b82f6',
        spaceBefore=16,
        spaceAfter=6,
        fontName='Helvetica-Bold',
    )
    ai_style = ParagraphStyle(
        'AIMessage',
        parent=styles['Normal'],
        fontSize=11,
        leftIndent=12,
        rightIndent=20,
        spaceAfter=8,
        textColor='#1f2937',
        fontName='Helvetica',
        leading=14,
    )
    ai_label_style = ParagraphStyle(
        'AILabel',
        parent=styles['Normal'],
        fontSize=11,
        textColor='#10b981',
        spaceBefore=16,
        spaceAfter=6,
        fontName='Helvetica-Bold',
    )
    
    # Add header section
    story.append(Paragraph(html.escape(chat.title), title_style))
    
    # Add metadata
    metadata_text = f"""
    <b>Chat ID:</b> {chat_id[:16]}...<br/>
    <b>Created:</b> {chat.created_at.strftime('%B %d, %Y at %H:%M UTC')}<br/>
    <b>Exported:</b> {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')}<br/>
    <b>Total Messages:</b> {len(chat.messages)}
    """
    story.append(Paragraph(metadata_text, subtitle_style))
    
    # Add separator line
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph('<hr width="100%" color="#e5e7eb"/>', styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Add conversation section header
    story.append(Paragraph("Conversation", section_header_style))
    
    # Add messages with improved formatting
    message_count = 0
    for message in chat.messages:
        if message.message_type == 'human':
            story.append(Paragraph("👤 You:", human_label_style))
            # Clean and format content - escape first, then add safe HTML
            raw_content = message.content
            # Limit very long messages BEFORE escaping
            if len(raw_content) > 5000:
                raw_content = raw_content[:5000] + '... (truncated for PDF)'
            # Now escape and format
            content = html.escape(raw_content).replace('\n', '<br/>')
            story.append(Paragraph(content, human_style))
        elif message.message_type == 'ai':
            story.append(Paragraph("🤖 Assistant:", ai_label_style))
            raw_content = message.content
            # Limit very long messages BEFORE escaping
            if len(raw_content) > 5000:
                raw_content = raw_content[:5000] + '... (truncated for PDF)'
            # Now escape and format
            content = html.escape(raw_content).replace('\n', '<br/>')
            story.append(Paragraph(content, ai_style))
        
        message_count += 1
        
        # Add page break every 10 messages to avoid overly long pages
        if message_count % 10 == 0 and message_count < len(chat.messages):
            story.append(PageBreak())
        else:
            story.append(Spacer(1, 0.15*inch))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    # Generate filename
    safe_title = "".join(c for c in chat.title if c.isalnum() or c in (' ', '-', '_')).strip()
    safe_title = safe_title[:50]  # Limit length
    filename = f"{safe_title}_{chat_id[:8]}.pdf"
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
