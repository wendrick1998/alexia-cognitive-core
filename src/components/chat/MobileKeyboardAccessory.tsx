
import { cn } from '@/lib/utils';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import QuickActionsBar from './QuickActionsBar';
import KeyboardActionButtons from './KeyboardActionButtons';

interface MobileKeyboardAccessoryProps {
  onInsertText: (text: string) => void;
  onDone: () => void;
  onCancel: () => void;
  onAttachment: () => void;
  isVisible: boolean;
}

const MobileKeyboardAccessory = ({
  onInsertText,
  onDone,
  onCancel,
  onAttachment,
  isVisible
}: MobileKeyboardAccessoryProps) => {
  const { hapticFeedback, deviceInfo } = useMobileOptimization();

  const handleDone = () => {
    hapticFeedback('medium');
    onDone();
  };

  const handleCancel = () => {
    hapticFeedback('light');
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300",
        "bg-gray-900/95 backdrop-blur-xl border-t border-white/10",
        deviceInfo.os === 'iOS' && "bottom-[env(keyboard-inset-height,0px)]"
      )}
      style={{
        bottom: deviceInfo.os === 'iOS' 
          ? 'env(keyboard-inset-height, 0px)' 
          : '0px'
      }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        {/* Quick Actions */}
        <QuickActionsBar
          onInsertText={onInsertText}
          onAttachment={onAttachment}
        />

        {/* Action Buttons */}
        <KeyboardActionButtons
          onCancel={handleCancel}
          onDone={handleDone}
        />
      </div>

      {/* Gesture hint */}
      <div className="flex justify-center pb-1">
        <div className="w-8 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
};

export default MobileKeyboardAccessory;
