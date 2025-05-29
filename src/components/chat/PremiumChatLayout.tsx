
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import ConversationsList from './ConversationsList';
import ChatArea from './ChatArea';
import { Conversation } from '@/hooks/useConversations';
import { cn } from '@/lib/utils';

interface PremiumChatLayoutProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

const PremiumChatLayout = ({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation
}: PremiumChatLayoutProps) => {
  const [showConversations, setShowConversations] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isMobile = useIsMobile();
  const layoutRef = useRef<HTMLDivElement>(null);
  const { 
    hapticFeedback, 
    createGestureDetector, 
    deviceInfo, 
    getAdaptiveStyles 
  } = useMobileOptimization();

  // Handle keyboard appearance on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height;
        setKeyboardHeight(keyboardHeight);
      }
    };

    const handleKeyboardShow = () => {
      // Adjust layout when keyboard appears
      document.body.style.transform = 'translateY(0)';
    };

    const handleKeyboardHide = () => {
      // Reset layout when keyboard disappears
      document.body.style.transform = 'translateY(0)';
      setKeyboardHeight(0);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleKeyboardShow);
    document.addEventListener('focusout', handleKeyboardHide);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleKeyboardShow);
      document.removeEventListener('focusout', handleKeyboardHide);
    };
  }, [isMobile]);

  // Add gesture support for navigation
  useEffect(() => {
    if (!layoutRef.current || !isMobile) return;
    
    const cleanup = createGestureDetector(layoutRef.current);
    
    const handleSwipe = (e: any) => {
      const { direction, velocity } = e.detail;
      
      // Only handle horizontal swipes with sufficient velocity
      if ((direction === 'left' || direction === 'right') && velocity > 0.3) {
        hapticFeedback('light');
        
        if (direction === 'right' && !showConversations) {
          // Swipe right to show conversations
          setShowConversations(true);
        } else if (direction === 'left' && showConversations && currentConversation) {
          // Swipe left to hide conversations (only if there's an active conversation)
          setShowConversations(false);
        }
      }
      
      // Pull down to refresh
      if (direction === 'down' && velocity > 0.5) {
        hapticFeedback('medium');
        // Could trigger refresh action
        console.log('Pull to refresh triggered');
      }
    };

    const handleLongPress = (e: any) => {
      hapticFeedback('medium');
      // Could show context menu
    };

    layoutRef.current.addEventListener('swipe', handleSwipe);
    layoutRef.current.addEventListener('longpress', handleLongPress);

    return () => {
      cleanup();
      if (layoutRef.current) {
        layoutRef.current.removeEventListener('swipe', handleSwipe);
        layoutRef.current.removeEventListener('longpress', handleLongPress);
      }
    };
  }, [createGestureDetector, hapticFeedback, showConversations, currentConversation, isMobile]);

  const toggleView = () => {
    hapticFeedback('selection');
    setShowConversations(!showConversations);
  };

  const adaptiveStyles = getAdaptiveStyles();

  if (isMobile) {
    return (
      <div 
        ref={layoutRef}
        className={cn(
          "h-full flex flex-col bg-black relative overflow-hidden animate-premium-fade-in",
          // Safe area support
          "pt-safe",
          deviceInfo.os === 'iOS' && "pt-[max(0px,env(safe-area-inset-top))]"
        )}
        style={{
          ...adaptiveStyles,
          paddingBottom: `${keyboardHeight > 0 ? 0 : 70}px`, // Account for bottom nav
          transform: keyboardHeight > 0 ? `translateY(-${Math.min(keyboardHeight * 0.3, 100)}px)` : 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          paddingTop: deviceInfo.os === 'iOS' 
            ? 'max(0px, env(safe-area-inset-top))' 
            : '0px'
        }}
      >
        {/* Gesture hint overlay */}
        {!currentConversation && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="glass-card px-3 py-1 text-xs text-white/60">
              Deslize → para navegar
            </div>
          </div>
        )}

        {/* Dynamic layout based on state and orientation */}
        {deviceInfo.orientation === 'landscape' && currentConversation ? (
          // Landscape: Show both conversations and chat
          <div className="flex h-full">
            <div className="w-80 border-r border-white/10">
              <ConversationsList
                conversations={conversations}
                currentConversation={currentConversation}
                onConversationSelect={(conv) => {
                  hapticFeedback('selection');
                  onConversationSelect(conv);
                }}
                onNewConversation={onNewConversation}
                isMobile={true}
                onToggleView={toggleView}
              />
            </div>
            <div className="flex-1">
              <ChatArea
                currentConversation={currentConversation}
                onBackToConversations={() => setShowConversations(true)}
                isMobile={true}
              />
            </div>
          </div>
        ) : (
          // Portrait: Show either conversations or chat
          <>
            {showConversations ? (
              <ConversationsList
                conversations={conversations}
                currentConversation={currentConversation}
                onConversationSelect={(conv) => {
                  hapticFeedback('selection');
                  onConversationSelect(conv);
                  setShowConversations(false);
                }}
                onNewConversation={onNewConversation}
                isMobile={true}
                onToggleView={toggleView}
              />
            ) : (
              <ChatArea
                currentConversation={currentConversation}
                onBackToConversations={() => {
                  hapticFeedback('selection');
                  setShowConversations(true);
                }}
                isMobile={true}
              />
            )}
          </>
        )}

        {/* Keyboard spacer */}
        {keyboardHeight > 0 && (
          <div 
            style={{ height: `${keyboardHeight}px` }}
            className="bg-black/50 backdrop-blur-sm"
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex bg-black relative overflow-hidden animate-premium-fade-in">
      {/* Conversations Sidebar - Premium Glass Design */}
      <div className="w-[320px] flex-shrink-0 relative">
        <div className="absolute inset-0 glass-card border-r border-white/5 backdrop-blur-xl">
          <ConversationsList
            conversations={conversations}
            currentConversation={currentConversation}
            onConversationSelect={onConversationSelect}
            onNewConversation={onNewConversation}
            isMobile={false}
          />
        </div>
      </div>

      {/* Chat Area - Premium Background */}
      <div className="flex-1 min-w-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/20 to-black">
          <ChatArea
            currentConversation={currentConversation}
            isMobile={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumChatLayout;
