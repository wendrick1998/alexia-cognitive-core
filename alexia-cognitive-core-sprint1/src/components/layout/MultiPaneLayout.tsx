
import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiPaneLayoutProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  leftTitle: string;
  rightTitle: string;
  onClose?: () => void;
  defaultLayout?: number[];
}

const MultiPaneLayout = ({ 
  leftPane, 
  rightPane, 
  leftTitle, 
  rightTitle, 
  onClose,
  defaultLayout = [50, 50] 
}: MultiPaneLayoutProps) => {
  const [layout, setLayout] = useState(defaultLayout);
  const [isLeftMaximized, setIsLeftMaximized] = useState(false);
  const [isRightMaximized, setIsRightMaximized] = useState(false);

  const maximizeLeft = () => {
    if (isLeftMaximized) {
      setLayout(defaultLayout);
      setIsLeftMaximized(false);
    } else {
      setLayout([85, 15]);
      setIsLeftMaximized(true);
      setIsRightMaximized(false);
    }
  };

  const maximizeRight = () => {
    if (isRightMaximized) {
      setLayout(defaultLayout);
      setIsRightMaximized(false);
    } else {
      setLayout([15, 85]);
      setIsRightMaximized(true);
      setIsLeftMaximized(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Split View</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLayout([50, 50])}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Reset Layout
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Resizable Panes */}
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={setLayout}
        className="flex-1"
      >
        {/* Left Pane */}
        <ResizablePanel defaultSize={layout[0]} minSize={20}>
          <div className="h-full flex flex-col">
            {/* Left Pane Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">{leftTitle}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={maximizeLeft}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                {isLeftMaximized ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Left Pane Content */}
            <div className="flex-1 overflow-hidden">
              {leftPane}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hover:bg-blue-500/20 transition-colors" />

        {/* Right Pane */}
        <ResizablePanel defaultSize={layout[1]} minSize={20}>
          <div className="h-full flex flex-col">
            {/* Right Pane Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">{rightTitle}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={maximizeRight}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                {isRightMaximized ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Right Pane Content */}
            <div className="flex-1 overflow-hidden">
              {rightPane}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MultiPaneLayout;
