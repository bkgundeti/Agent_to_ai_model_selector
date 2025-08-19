import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bot,
  Send, 
  LogOut, 
  Loader2, 
  Moon,
  Sun,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';
import aiLogo from '@/assets/ai-logo.svg';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  attachment?: {
    name: string;
    type: string;
    size: number;
  };
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [promptCount, setPromptCount] = useState(0);
  const [responseCount, setResponseCount] = useState(0);
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Set sidebar collapsed by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      navigate('/login');
      return;
    }
    setUserEmail(email);
    setUsername(email.split('@')[0]);
    // No initial messages - start with empty chat
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB and will be skipped.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });
      
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        toast({
          title: `${validFiles.length} file(s) selected`,
          description: `Files are ready to upload.`,
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || 'Files uploaded',
      isUser: true,
      timestamp: new Date(),
      attachment: selectedFiles.length > 0 ? {
        name: selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files`,
        type: selectedFiles[0]?.type || 'multiple',
        size: selectedFiles.reduce((total, file) => total + file.size, 0)
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setPromptCount(prev => prev + 1);
    setInput('');
    setSelectedFiles([]); // Clear files after sending
    setIsLoading(true);

    try {
      let messageToSend = input;
      
      // Handle file uploads
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });
        
        const uploadResponse = await fetch('/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          const fileNames = selectedFiles.map(f => f.name).join(', ');
          messageToSend = `${input}\n[Files uploaded: ${fileNames}]`;
        }
      }

      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, message: messageToSend }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Sorry, I couldn\'t process your request.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setResponseCount(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      
      localStorage.removeItem('userEmail');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('userEmail');
      navigate('/login');
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch('/clear_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userEmail }),
      });
      
      setMessages([]); // Clear all messages
      setPromptCount(0);
      setResponseCount(0);
      
      toast({
        title: "Chat cleared",
        description: "Your chat history has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserInitial = (email: string) => {
    return email.substring(0, 1).toUpperCase();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // Empty state watermark component
  const EmptyStateWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-6 opacity-25">
        <div className="relative">
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <img src={aiLogo} alt="AI Logo" className="w-24 h-24 opacity-60 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Model Assistant
          </h3>
          <p className="text-muted-foreground max-w-md text-lg">
            Your intelligent companion for discovering and comparing AI models. 
            Upload files, ask questions, and get personalized recommendations.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <ImageIcon className="w-8 h-8 mx-auto text-primary" />
            <p className="font-medium">Image Recognition</p>
          </div>
          <div className="space-y-2">
            <FileText className="w-8 h-8 mx-auto text-accent" />
            <p className="font-medium">Text Analysis</p>
          </div>
          <div className="space-y-2">
            <Download className="w-8 h-8 mx-auto text-primary" />
            <p className="font-medium">Pricing Analysis</p>
          </div>
        </div>
      </div>
    </div>
  );

  const showWatermark = messages.length === 0;

  return (
    <div className="flex h-screen bg-gradient-background">
      {/* Mobile Responsive Overlay */}
      {!isSidebarCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      {/* Sidebar */}
      <div className={`${
        isSidebarCollapsed 
          ? isMobile ? 'w-0' : 'w-16' 
          : isMobile ? 'w-80' : 'w-80'
      } ${
        !isSidebarCollapsed && isMobile ? 'fixed z-50' : 'relative'
      } border-r border-border bg-card/50 backdrop-blur-sm flex flex-col transition-all duration-300 h-full ${
        isSidebarCollapsed && isMobile ? 'overflow-hidden' : ''
      }`}>
        {/* User Avatar Toggle for Sidebar */}
        {!(isSidebarCollapsed && isMobile) && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Avatar 
                className="w-10 h-10 bg-gradient-primary shadow-glow cursor-pointer" 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  {getUserInitial(userEmail)}
                </AvatarFallback>
              </Avatar>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{username}</h3>
                  <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isSidebarCollapsed && !(isSidebarCollapsed && isMobile) && (
          <>
            {/* Settings and Actions */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  AI Model Expert
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <DropdownMenuItem onClick={handleClearChat}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Current Chat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4 mr-2" />
                      ) : (
                        <Moon className="w-4 h-4 mr-2" />
                      )}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Chat Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src={aiLogo} alt="AI Logo" className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold bg-gradient-primary bg-clip-text text-transparent">
                    AI Model Assistant
                  </h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Get personalized AI model recommendations with pricing analysis and implementation guidance.
              </p>
            </div>

            {/* Chat Statistics */}
            <div className="p-4 border-b border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{promptCount}</div>
                  <div className="text-xs text-muted-foreground">Prompts Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{responseCount}</div>
                  <div className="text-xs text-muted-foreground">Responses</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setInput("I need help choosing an AI model for image recognition")}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image Recognition
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setInput("I need a natural language processing model")}
              >
                <FileText className="w-4 h-4 mr-2" />
                NLP Models
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setInput("Show me pricing comparison for different AI models")}
              >
                <Download className="w-4 h-4 mr-2" />
                Pricing Analysis
              </Button>
            </div>

            <div className="flex-1" />

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Powered by Advanced AI Technology
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="border-b border-border bg-card/95 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile Avatar Toggle - Show only when sidebar is collapsed on mobile */}
              {isMobile && isSidebarCollapsed && (
                <Avatar 
                  className="w-10 h-10 bg-gradient-primary shadow-glow cursor-pointer" 
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {getUserInitial(userEmail)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={aiLogo} alt="AI Logo" className="w-8 h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold truncate">AI Model Assistant</h1>
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-500" />
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                        Online
                      </Badge>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-red-500" />
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                        Offline
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 relative">
          {showWatermark && <EmptyStateWatermark />}
          <div className="p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex items-start space-x-3 ${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'} ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className={`w-10 h-10 ${message.isUser ? '' : 'bg-gradient-primary shadow-glow'}`}>
                      {message.isUser ? (
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {getUserInitial(userEmail)}
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          <Bot className="w-5 h-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <Card className={`${
                      message.isUser 
                        ? 'bg-primary text-primary-foreground shadow-glow' 
                        : 'bg-card/80 backdrop-blur-sm border-border/50'
                    }`}>
                      <CardContent className="p-4">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        
                        {message.attachment && (
                          <div className="mt-3 p-3 rounded-lg bg-black/10 dark:bg-white/10 border border-border/50">
                            <div className="flex items-center space-x-2">
                              {getFileIcon(message.attachment.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.attachment.name}</p>
                                <p className="text-xs opacity-70">{formatFileSize(message.attachment.size)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <p className={`text-xs mt-3 ${
                          message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10 bg-gradient-primary shadow-glow">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <p className="text-sm text-muted-foreground">AI is analyzing your request...</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card/95 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            {/* Selected Files Display - Above input field */}
            {selectedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="p-2 bg-card/50 rounded-lg border border-border/50 flex items-center gap-2 max-w-[240px]"
                  >
                    {getFileIcon(file.type)}
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate max-w-[140px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className={`flex items-end ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about AI models, upload files, or get recommendations..."
                  className="bg-input/50 border-border/50 focus:border-primary transition-colors min-h-[60px] max-h-[120px] resize-none custom-scrollbar"
                  disabled={isLoading}
                />
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.csv,.json"
                multiple
              />
              
              <Button
                variant="outline"
                size={isMobile ? "sm" : "icon"}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleSendMessage}
                disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                size={isMobile ? "sm" : "default"}
                className="bg-gradient-button hover:opacity-90 shadow-glow transition-all duration-300 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;