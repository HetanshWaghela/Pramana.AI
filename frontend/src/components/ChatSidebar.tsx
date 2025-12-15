import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Edit2,
  MoreHorizontal,
  User,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  isActive?: boolean;
  colorIndex?: number;
}

// Color palette for chat history items - neo-brutalist theme colors
const chatColors = [
  { bg: 'bg-pink-100', border: 'border-pink-300', hover: 'hover:bg-pink-200', icon: 'text-pink-500' },
  { bg: 'bg-green-100', border: 'border-green-300', hover: 'hover:bg-green-200', icon: 'text-green-500' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', hover: 'hover:bg-yellow-200', icon: 'text-yellow-600' },
  { bg: 'bg-blue-100', border: 'border-blue-300', hover: 'hover:bg-blue-200', icon: 'text-blue-500' },
  { bg: 'bg-purple-100', border: 'border-purple-300', hover: 'hover:bg-purple-200', icon: 'text-purple-500' },
  { bg: 'bg-orange-100', border: 'border-orange-300', hover: 'hover:bg-orange-200', icon: 'text-orange-500' },
  { bg: 'bg-teal-100', border: 'border-teal-300', hover: 'hover:bg-teal-200', icon: 'text-teal-500' },
  { bg: 'bg-rose-100', border: 'border-rose-300', hover: 'hover:bg-rose-200', icon: 'text-rose-500' },
];

const getChatColor = (index: number) => chatColors[index % chatColors.length];

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onLogout?: () => void;
  currentChatId?: string;
  chatHistory: ChatHistory[];
  userName?: string;
  userEmail?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isCollapsed,
  onToggle,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onLogout,
  currentChatId,
  chatHistory,
  userName = 'User',
  userEmail = 'user@example.com'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Group chats by date
  const groupChatsByDate = (chats: ChatHistory[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: ChatHistory[] } = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      'Older': []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.timestamp);
      if (chatDate >= today) {
        groups['Today'].push(chat);
      } else if (chatDate >= yesterday) {
        groups['Yesterday'].push(chat);
      } else if (chatDate >= lastWeek) {
        groups['Previous 7 Days'].push(chat);
      } else if (chatDate >= lastMonth) {
        groups['Previous 30 Days'].push(chat);
      } else {
        groups['Older'].push(chat);
      }
    });

    return groups;
  };

  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedChats = groupChatsByDate(filteredChats);

  return (
    <motion.div
      className={`h-full bg-white border-r-3 border-black flex flex-col relative`}
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-yellow-300 border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Header */}
      <div className="p-4 border-b-2 border-black">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-green-400 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="font-black text-lg text-gray-900">Pramana.ai</span>
              </div>

              {/* New Chat Button */}
              <Button
                onClick={onNewChat}
                className="w-full h-11 bg-green-400 hover:bg-green-500 text-black border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </Button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="pl-10 h-10 border-2 border-gray-200 rounded-xl font-medium focus:border-black focus:ring-0"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Logo Icon */}
              <div className="w-10 h-10 bg-green-400 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-5 h-5 text-black" />
              </div>

              {/* New Chat Button */}
              <button
                onClick={onNewChat}
                className="w-10 h-10 bg-green-400 hover:bg-green-500 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3"
            >
              {Object.entries(groupedChats).map(([group, chats]) => {
                if (chats.length === 0) return null;
                return (
                  <div key={group} className="mb-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">
                      {group}
                    </h3>
                    <div className="space-y-1.5">
                      {chats.map((chat, chatIndex) => {
                        const colorScheme = getChatColor(chatIndex + (group === 'Today' ? 0 : group === 'Yesterday' ? 3 : 5));
                        const isSelected = currentChatId === chat.id;
                        
                        return (
                        <motion.div
                          key={chat.id}
                          className={`group relative rounded-xl cursor-pointer transition-all border-2 ${
                            isSelected
                              ? 'bg-yellow-300 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                              : `${colorScheme.bg} ${colorScheme.border} ${colorScheme.hover} shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]`
                          }`}
                          onMouseEnter={() => setHoveredChat(chat.id)}
                          onMouseLeave={() => setHoveredChat(null)}
                          onClick={() => onSelectChat(chat.id)}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-3 p-3">
                            <div className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white' : colorScheme.bg}`}>
                              <MessageSquare className={`w-4 h-4 ${isSelected ? 'text-black' : colorScheme.icon}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {chat.title}
                              </p>
                              <p className="text-xs text-gray-600 truncate mt-0.5">
                                {chat.preview}
                              </p>
                            </div>
                          </div>
                          
                          {/* Action buttons on hover */}
                          <AnimatePresence>
                            {hoveredChat === chat.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle edit
                                  }}
                                  className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-700" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat.id);
                                  }}
                                  className="w-7 h-7 bg-red-100 border-2 border-black rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredChats.length === 0 && (
                <div className="text-center py-8 px-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl border-2 border-gray-200 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 font-bold">
                    {searchQuery ? 'No chats found' : 'No chat history yet'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchQuery ? 'Try a different search' : 'Start a new conversation!'}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 px-2"
            >
              {chatHistory.slice(0, 5).map((chat, index) => {
                const colorScheme = getChatColor(index);
                return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                    currentChatId === chat.id
                      ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : `${colorScheme.bg} border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                  }`}
                  title={chat.title}
                >
                  <MessageSquare className={`w-4 h-4 ${currentChatId === chat.id ? 'text-black' : colorScheme.icon}`} />
                </button>
              );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / User Section */}
      <div className="border-t-2 border-black p-4">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Settings Button */}
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Settings</span>
              </button>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-pink-300 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                    >
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-700">Profile</span>
                      </button>
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <button className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-black transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-pink-300 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <User className="w-5 h-5 text-black" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatSidebar;
