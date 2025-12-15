import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Activity,
  Info,
  Search,
  TextSearch,
  Brain,
  Pen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ProcessedEvent {
  title: string;
  data: string | string[] | Record<string, unknown>;
}

interface ActivityTimelineProps {
  processedEvents: ProcessedEvent[];
  isLoading: boolean;
}

export function ActivityTimeline({
  processedEvents,
  isLoading,
}: ActivityTimelineProps) {
  const [isTimelineCollapsed, setIsTimelineCollapsed] =
    useState<boolean>(false);
  const getEventIcon = (title: string, index: number) => {
    if (index === 0 && isLoading && processedEvents.length === 0) {
      return <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />;
    }
    if (title.toLowerCase().includes('generating')) {
      return <TextSearch className="h-4 w-4 text-green-600" />;
    } else if (title.toLowerCase().includes('thinking')) {
      return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
    } else if (title.toLowerCase().includes('reflection')) {
      return <Brain className="h-4 w-4 text-pink-500" />;
    } else if (title.toLowerCase().includes('research')) {
      return <Search className="h-4 w-4 text-blue-600" />;
    } else if (title.toLowerCase().includes('finalizing')) {
      return <Pen className="h-4 w-4 text-green-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  useEffect(() => {
    if (!isLoading && processedEvents.length !== 0) {
      setIsTimelineCollapsed(true);
    }
  }, [isLoading, processedEvents]);

  return (
    <Card className="border-2 border-black rounded-xl bg-[#FDE047] max-h-96 w-full min-w-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardDescription className="flex items-center justify-between min-w-0">
          <div
            className="flex items-center justify-start text-sm w-full cursor-pointer gap-2 text-gray-900 font-bold min-w-0 truncate"
            onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          >
            🔬 Research Activity
            {isTimelineCollapsed ? (
              <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
            ) : (
              <ChevronUp className="h-4 w-4 mr-2 flex-shrink-0" />
            )}
          </div>
        </CardDescription>
      </CardHeader>
      {!isTimelineCollapsed && (
        <ScrollArea className="max-h-96 overflow-y-auto">
          <CardContent>
            {isLoading && processedEvents.length === 0 && (
              <div className="relative pl-8 pb-4 min-w-0">
                <div className="absolute left-3 top-3.5 h-full w-0.5 bg-yellow-600/30" />
                <div className="absolute left-0.5 top-2 h-5 w-5 rounded-full bg-white flex items-center justify-center ring-2 ring-black">
                  <Loader2 className="h-3 w-3 text-gray-700 animate-spin" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">
                    Searching...
                  </p>
                </div>
              </div>
            )}
            {processedEvents.length > 0 ? (
              <div className="space-y-0 min-w-0">
                {processedEvents.map((eventItem, index) => (
                  <div key={index} className="relative pl-8 pb-4 min-w-0">
                    {index < processedEvents.length - 1 ||
                    (isLoading && index === processedEvents.length - 1) ? (
                      <div className="absolute left-3 top-3.5 h-full w-0.5 bg-yellow-600/40" />
                    ) : null}
                    <div className="absolute left-0.5 top-2 h-6 w-6 rounded-full bg-white flex items-center justify-center ring-2 ring-black">
                      {getEventIcon(eventItem.title, index)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 font-bold mb-0.5 truncate">
                        {eventItem.title}
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">
                        {typeof eventItem.data === 'string'
                          ? eventItem.data
                          : Array.isArray(eventItem.data)
                          ? (eventItem.data as string[]).join(', ')
                          : JSON.stringify(eventItem.data)}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && processedEvents.length > 0 && (
                  <div className="relative pl-8 pb-4 min-w-0">
                    <div className="absolute left-0.5 top-2 h-5 w-5 rounded-full bg-white flex items-center justify-center ring-2 ring-black">
                      <Loader2 className="h-3 w-3 text-gray-700 animate-spin" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 font-medium truncate">
                        Searching...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : !isLoading ? ( // Only show "No activity" if not loading and no events
              <div className="flex flex-col items-center justify-center h-full text-gray-600 pt-10 min-w-0">
                <Info className="h-6 w-6 mb-3 flex-shrink-0" />
                <p className="text-sm text-center font-medium">No activity to display.</p>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Timeline will update during processing.
                </p>
              </div>
            ) : null}
          </CardContent>
        </ScrollArea>
      )}
    </Card>
  );
}
