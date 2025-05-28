
import { Skeleton } from "@/components/ui/skeleton";

export const ChatMessageSkeleton = () => (
  <div className="flex items-start space-x-4 animate-pulse">
    <Skeleton className="w-12 h-12 rounded-2xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const ChatLoadingSkeleton = () => (
  <div className="flex-1 overflow-y-auto p-6 space-y-8">
    <div className="max-w-5xl mx-auto space-y-8">
      <ChatMessageSkeleton />
      <ChatMessageSkeleton />
      <ChatMessageSkeleton />
    </div>
  </div>
);

export const ConversationCardSkeleton = () => (
  <div className="p-4 border border-slate-200/60 rounded-xl animate-pulse">
    <div className="flex items-center space-x-3 mb-2">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  </div>
);
