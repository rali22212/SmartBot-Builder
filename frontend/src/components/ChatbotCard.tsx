import { Calendar, MessageSquare, Globe, Trash2, Download, History } from "lucide-react";
import BotIcon from "@/components/icons/BotIcon";
import BotFocus from "@/components/icons/BotFocus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuthHeader } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatbotCardProps {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  location: string;
  onChat: () => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

const ChatbotCard = ({ id, name, description, createdAt, location, onChat, onDelete, onRefresh }: ChatbotCardProps) => {

  const handleExportBot = async () => {
    try {
      const baseUrl = `${window.location.protocol}//${window.location.hostname}:5050`;
      const response = await fetch(`${baseUrl}/api/bot/${id}/export`, {
        headers: { ...getAuthHeader() },
      });

      if (!response.ok) throw new Error('Export failed');

      const data = await response.json();

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}.smartbot`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Bot exported!', { description: `Saved as ${name}.smartbot` });
    } catch (error) {
      toast.error('Failed to export bot');
    }
  };

  const handleExportChatHistory = async () => {
    try {
      const baseUrl = `${window.location.protocol}//${window.location.hostname}:5050`;
      const response = await fetch(`${baseUrl}/api/bot/${id}/chat-history/export`, {
        headers: { ...getAuthHeader() },
      });

      if (!response.ok) throw new Error('Export failed');

      const data = await response.json();

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_chat_history.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Chat history exported!', { description: `${data.total_messages} messages saved` });
    } catch (error) {
      toast.error('Failed to export chat history');
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-gradient-card backdrop-blur-sm hover:shadow-glow transition-all duration-500 animate-fade-in">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-ai opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <BotFocus className="group-hover:animate-glow-pulse bg-gradient-hero">
            <BotIcon className="text-primary" size={30} />
          </BotFocus>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </CardDescription>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{createdAt}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportBot}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Bot (.smartbot)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportChatHistory}>
                  <History className="mr-2 h-4 w-4" />
                  Export Chat History (.json)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the chatbot and all its chat history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Chat button */}
            <Button
              size="sm"
              variant="outline"
              onClick={onChat}
              className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotCard;
