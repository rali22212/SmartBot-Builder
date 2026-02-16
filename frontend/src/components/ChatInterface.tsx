import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, User, MessageSquare, Bot, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import SparkleLoader from "@/components/ui/sparkle-loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_URL, API_BASE_URL } from "@/config";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: string;
  dbId?: string; // Database ID for deletion
}

interface ChatInterfaceProps {
  chatbotName?: string;
  organizationId?: string;
  onMessageUpdate?: (botId: string, delta: number) => void;
  onClose?: () => void;
}

const ChatInterface = ({ chatbotName, organizationId, onMessageUpdate, onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      const scrollElement = scrollViewportRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Small timeout to ensure DOM is updated before scrolling
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!organizationId) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        console.log(`Loading history for org: ${organizationId}`);
        const token = localStorage.getItem("smartbot_token");
        const response = await fetch(`${BASE_URL}/api/bot/${organizationId}/chat-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Loaded chat history:", data);

          const loadedMessages: Message[] = [];
          if (data.history) {
            const history = [...data.history].reverse();
            for (const entry of history) {
              loadedMessages.push({
                id: `user-${entry.id}`,
                role: "user",
                content: entry.query,
                timestamp: entry.timestamp.endsWith("Z") ? entry.timestamp : entry.timestamp + "Z",
              });
              loadedMessages.push({
                id: `bot-${entry.id}`,
                role: "bot",
                content: entry.response,
                timestamp: entry.timestamp.endsWith("Z") ? entry.timestamp : entry.timestamp + "Z",
                dbId: entry.id,
              });
            }
          }

          if (loadedMessages.length > 0) {
            setMessages(loadedMessages);
          } else {
            setMessages([{
              id: "welcome",
              role: "bot",
              content: "Hello! I'm here to help. How can I assist you today?",
              timestamp: new Date().toISOString()
            }]);
          }
        } else {
          console.error("Failed to load history:", response.status);
          toast.error("Failed to load chat history");
          setMessages([{
            id: "welcome",
            role: "bot",
            content: "Hello! I'm here to help. How can I assist you today?",
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error("Error loading history:", error);
        toast.error("Network error loading history");
        setMessages([{
          id: "welcome",
          role: "bot",
          content: "Hello! I'm here to help. How can I assist you today?",
          timestamp: new Date().toISOString()
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [organizationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !organizationId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const queryText = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("smartbot_token");
      const response = await fetch(`${API_BASE_URL}/query/${organizationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ query: queryText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get response");
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: result.response,
        timestamp: new Date().toISOString(),
        dbId: result.chat_id,
      };

      // Update the user message with the dbId so it can be deleted too
      setMessages(prev => {
        const updated = [...prev];
        // Find the last user message (the one we just sent) and assign the dbId
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].id === userMessage.id) {
            updated[i] = { ...updated[i], dbId: result.chat_id };
            break;
          }
        }
        return [...updated, botMessage];
      });

      // Update dashboard stats (1 user query + 1 bot response = 2 messages)
      // But typically we count "interactions" or "messages". Let's count total messages added.
      // If the dashboard counts "interactions" as user queries, sending 1.
      // If it counts total messages database rows, sending 2.
      // Based on typical "message_count", it usually counts all rows.
      if (onMessageUpdate && organizationId) {
        onMessageUpdate(organizationId, 2);
      }
    } catch (error: any) {
      console.error("Error querying bot:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ... (existing code)

  const toggleSelection = (dbId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(dbId)) {
        next.delete(dbId);
      } else {
        next.add(dbId);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    const idsToDelete = Array.from(selectedIds);

    // 1. Start Animation: Add all selected IDs to deletingIds
    setDeletingIds(prev => {
      const next = new Set(prev);
      idsToDelete.forEach(id => next.add(id));
      return next;
    });

    // Clear selection immediately so checkboxes disappear during animation (looks cleaner)
    // Or keep them? Better to keep them but maybe disable interaction.
    // Let's clear selection to remove the checkbox UI overlay and let the message disintegrate.
    setSelectedIds(new Set());

    // 2. Wait for animation
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const token = localStorage.getItem("smartbot_token");

      // 3. Delete in parallel
      const deletePromises = idsToDelete.map(dbId =>
        fetch(`${API_BASE_URL}/chat-history/${dbId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      await Promise.all(deletePromises);

      // Remove from UI
      setMessages(prev => prev.filter(msg => !msg.dbId || !idsToDelete.includes(msg.dbId)));
      toast.success(`${count} messages disintegrated`);

      // Update stats
      if (onMessageUpdate && organizationId) {
        onMessageUpdate(organizationId, -(count * 2)); // *2 for pair
      }

    } catch (error) {
      console.error("Error deleting messages:", error);
      toast.error("Failed to delete messages");
      // Revert deleting state if possible, though strict revert is hard with bulk.
      // Just clear deletingIds
      setDeletingIds(prev => {
        const next = new Set(prev);
        idsToDelete.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const promptDeleteMessage = (dbId: string) => {
    setMessageToDelete(dbId);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    const dbId = messageToDelete;
    setMessageToDelete(null); // Close dialog

    await handleDeleteMessage(dbId);
  };

  const handleDeleteMessage = async (dbId: string) => {
    if (!dbId) return;

    // 1. Start Animation: Add ID to deletingIds
    setDeletingIds(prev => new Set(prev).add(dbId));

    // 2. Wait for animation to finish (1s corresponds to CSS animation duration)
    // We can start the API call concurrently or wait. Let's wait slightly to ensure visual sync.
    await new Promise(resolve => setTimeout(resolve, 800)); // Disappear visually just before removal

    try {
      const token = localStorage.getItem("smartbot_token");
      const response = await fetch(`${API_BASE_URL}/chat-history/${dbId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove both user and bot message with this dbId
        setMessages(prev => prev.filter(msg => msg.dbId !== dbId));
        toast.success("Message disintegrated");

        // Use -2 because we delete both user query and bot response associated with dbId
        if (onMessageUpdate && organizationId) {
          onMessageUpdate(organizationId, -2);
        }
      } else {
        toast.error("Failed to delete message");
        // Revert animation state if failed
        setDeletingIds(prev => {
          const next = new Set(prev);
          next.delete(dbId);
          return next;
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(dbId);
        return next;
      });
    }
  };

  const handleClearHistory = async () => {
    if (!organizationId) return;
    setShowClearConfirm(false); // Close dialog

    try {
      const token = localStorage.getItem("smartbot_token");
      const response = await fetch(`${API_BASE_URL}/bot/${organizationId}/chat-history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Calculate how many messages were removed to update stats
        const messagesToRemove = messages.length - 1; // -1 for welcome message which is local

        setMessages([{
          id: "welcome",
          role: "bot",
          content: "Hello! I'm here to help. How can I assist you today?",
          timestamp: new Date().toLocaleTimeString()
        }]);
        toast.success("Chat history cleared");

        if (onMessageUpdate && organizationId && messagesToRemove > 0) {
          onMessageUpdate(organizationId, -messagesToRemove);
        }
      } else {
        toast.error("Failed to clear history");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    }
  };

  if (isLoadingHistory) {
    return (
      <Card className="border-border/50 bg-gradient-card backdrop-blur-sm h-[calc(100vh-220px)] min-h-[500px] flex flex-col overflow-hidden shadow-xl">
        <CardHeader className="border-b border-border/50 shrink-0 bg-background/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {chatbotName ? `Chat with ${chatbotName}` : "Chat Interface"}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs text-muted-foreground">Connecting securely...</span>
                </div>
              </div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                disabled
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 overflow-hidden gap-6">
          {/* Skeleton Bubbles */}
          <div className="flex flex-col gap-4">
            {/* Bot Message Skeleton */}
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-[250px] rounded-lg" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>

            {/* User Message Skeleton */}
            <div className="flex flex-row-reverse gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex flex-col items-end">
                <Skeleton className="h-10 w-[200px] rounded-lg bg-primary/20" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>

            {/* Bot Message Skeleton */}
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-24 w-[300px] rounded-lg" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            </div>
          </div>
        </CardContent>
        <div className="p-4 border-t border-border/50 bg-background/20 shrink-0">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </Card>
    );
  }

  // Helper to format date for separators
  const getMessageDate = (timestamp: string) => {
    const date = new Date(timestamp.endsWith("Z") ? timestamp : timestamp + "Z");
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp.endsWith("Z") ? timestamp : timestamp + "Z").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Card className="border-border/50 bg-gradient-card backdrop-blur-sm h-[calc(100vh-220px)] min-h-[500px] flex flex-col overflow-hidden shadow-xl">
        <CardHeader className="border-b border-border/50 shrink-0 bg-background/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {chatbotName ? `Chat with ${chatbotName}` : "Chat Interface"}
                </CardTitle>
                <CardDescription className="mt-1">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Your conversation is saved automatically"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="animate-in fade-in zoom-in duration-200"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedIds.size})
                </Button>
              )}
              {messages.length > 1 && selectedIds.size === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setShowClearConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
          <ScrollArea className="flex-1 h-full w-full p-4" viewportRef={scrollViewportRef}>
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => {
                const showDateSeparator = index === 0 || getMessageDate(message.timestamp) !== getMessageDate(messages[index - 1].timestamp);

                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-6">
                        <span className="bg-muted/30 text-muted-foreground text-xs font-medium px-3 py-1 rounded-full border border-border/30">
                          {getMessageDate(message.timestamp)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex gap-3 animate-fade-in group ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                        } ${message.dbId && deletingIds.has(message.dbId) ? 'animate-disintegrate' : ''}`}
                    >
                      {message.dbId && (
                        <div className={`flex items-center justify-center transition-all duration-200 ${selectedIds.size > 0 || selectedIds.has(message.dbId!)
                          ? "w-8 opacity-100 scale-100"
                          : "w-0 opacity-0 scale-0 group-hover:w-8 group-hover:opacity-100 group-hover:scale-100 overflow-hidden"
                          }`}>
                          <Checkbox
                            checked={selectedIds.has(message.dbId)}
                            onCheckedChange={() => toggleSelection(message.dbId!)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
                          />
                        </div>
                      )}
                      {message.role === "bot" ? (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full inline-flex items-center justify-center p-1.5 bg-primary/15 border border-primary/30">
                            <Bot className="h-8 w-8 text-primary " />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent/10 border border-accent/20">
                          <User className="h-4 w-4 text-accent" />
                        </div>
                      )}
                      <div
                        className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : "text-left"
                          }`}
                      >
                        <div className="inline-block">
                          <div
                            className={`rounded-lg px-4 py-2 ${message.role === "bot"
                              ? "bg-muted/50 text-foreground"
                              : "bg-primary text-primary-foreground"
                              }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 px-1 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </p>
                          {message.dbId && (
                            <button
                              onClick={() => promptDeleteMessage(message.dbId!)}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                              title="Delete this message"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 animate-fade-in flex-row">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full inline-flex items-center justify-center p-1.5 bg-primary/15 border border-primary/30">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 max-w-[80%] text-left">
                    <div className="inline-block rounded-lg px-4 py-3 bg-muted/50 text-foreground">
                      <div className="flex space-x-1 h-3 items-center">
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border/50 bg-background/20 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-input/50 border-border/50 focus:border-primary transition-all"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading}
                className="bg-gradient-button hover:shadow-glow transition-all duration-300"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent className="bg-gradient-card border-border/50 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary/20 hover:bg-primary/10 hover:text-primary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-glow-destructive"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent className="bg-gradient-card border-border/50 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This will trigger the disintegration protocol.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary/20 hover:bg-primary/10 hover:text-primary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-glow-destructive"
            >
              Snap it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatInterface;
