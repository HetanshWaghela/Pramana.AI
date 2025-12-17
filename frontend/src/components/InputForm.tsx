import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  SquarePen,
  Brain,
  Send,
  StopCircle,
  Zap,
  Cpu,
  Bot,
  Search,
  MessageCircle,
  Calculator,
  Wrench,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_AGENTS, AgentId } from '@/types/agents';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '@/types/models';
import { getAgentById } from '@/lib/agents';
import { isValidModelId } from '@/lib/models';

// Updated InputFormProps
interface InputFormProps {
  onSubmit: (
    inputValue: string,
    effort: string,
    model: string,
    agentId: string
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
  hasHistory: boolean;
  selectedAgent: string;
  onAgentChange: (agentId: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  hasHistory,
  selectedAgent,
  onAgentChange,
}) => {
  const [internalInputValue, setInternalInputValue] = useState('');
  const [effort, setEffort] = useState('medium');
  const [model, setModel] = useState(DEFAULT_MODEL);

  const handleInternalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!internalInputValue.trim()) return;
    onSubmit(internalInputValue, effort, model, selectedAgent);
    setInternalInputValue('');
  };

  const handleModelChange = (value: string) => {
    if (isValidModelId(value)) {
      setModel(value);
    }
  };

  const handleInternalKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInternalSubmit();
    }
  };

  const isSubmitDisabled = !internalInputValue.trim() || isLoading;
  const selectedAgentInfo = getAgentById(selectedAgent);

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'search':
        return <Search className="h-4 w-4 mr-2" />;
      case 'message-circle':
        return <MessageCircle className="h-4 w-4 mr-2" />;
      case 'calculator':
        return <Calculator className="h-4 w-4 mr-2" />;
      case 'wrench':
        return <Wrench className="h-4 w-4 mr-2" />;
      default:
        return <Bot className="h-4 w-4 mr-2" />;
    }
  };

  const getModelIcon = (iconName: string, iconColor: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className={`h-4 w-4 mr-2 ${iconColor}`} />;
      case 'brain':
        return <Brain className={`h-4 w-4 mr-2 ${iconColor}`} />;
      case 'cpu':
        return <Cpu className={`h-4 w-4 mr-2 ${iconColor}`} />;
      default:
        return <Cpu className="h-4 w-4 mr-2" />;
    }
  };

  // Show effort selector for agents that can benefit from it
  const showEffortSelector = selectedAgent === AgentId.DEEP_RESEARCHER;

  return (
    <form
      onSubmit={handleInternalSubmit}
      className={`flex flex-col gap-3 p-3`}
    >
      {/* Show selected agent indicator */}
      {selectedAgentInfo && (
        <div className="flex items-center gap-2 text-sm text-gray-600 px-2 font-medium">
          <div className="w-5 h-5 bg-green-400 rounded-md border border-black flex items-center justify-center">
            <Bot className="h-3 w-3 text-black" />
          </div>
          Using {selectedAgentInfo.name}: {selectedAgentInfo.description}
        </div>
      )}

      <div
        className={`flex flex-row items-center justify-between rounded-2xl ${hasHistory ? '' : 'rounded-bl-md'
          } break-words min-h-7 bg-white border-3 border-black px-4 pt-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
      >
        <Textarea
          value={internalInputValue}
          onChange={(e) => setInternalInputValue(e.target.value)}
          onKeyDown={handleInternalKeyDown}
          placeholder="Ask me about biomedical research..."
          className={`w-full text-gray-900 placeholder-gray-400 resize-none border-0 focus:outline-none focus:ring-0 outline-none focus-visible:ring-0 shadow-none bg-transparent
                        md:text-base min-h-[56px] max-h-[200px] font-medium`}
          rows={1}
        />
        <div className="-mt-3">
          {isLoading ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-100 p-2 cursor-pointer rounded-full transition-all duration-200"
              onClick={onCancel}
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="ghost"
              className={`${isSubmitDisabled
                ? 'text-gray-400'
                : 'text-black hover:text-gray-700 hover:bg-green-100'
                } p-2 cursor-pointer rounded-full transition-all duration-200 text-base`}
              disabled={isSubmitDisabled}
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-row gap-2 flex-wrap">
          {/* Only show agent selector when no conversation history */}
          {!hasHistory && (
            <div className="flex flex-row gap-2 bg-yellow-300 border-2 border-black text-gray-900 rounded-xl rounded-t-md pl-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-w-[100%] sm:max-w-[90%]">
              <div className="flex flex-row items-center text-sm font-bold">
                <Bot className="h-4 w-4 mr-2" />
                Agent
              </div>
              <Select value={selectedAgent} onValueChange={onAgentChange}>
                <SelectTrigger className="w-[220px] bg-transparent border-none cursor-pointer font-semibold text-gray-900">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black text-gray-900 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {AVAILABLE_AGENTS.map((agent) => (
                    <SelectItem
                      key={agent.id}
                      value={agent.id}
                      className="hover:bg-yellow-100 focus:bg-yellow-100 cursor-pointer font-medium"
                    >
                      <div className="flex items-center">
                        {getAgentIcon(agent.icon)}
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Show effort selector for certain agents when no conversation history */}
          {showEffortSelector && !hasHistory && (
            <div className="flex flex-row gap-2 bg-pink-300 border-2 border-black text-gray-900 rounded-xl rounded-t-md pl-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-w-[100%] sm:max-w-[90%]">
              <div className="flex flex-row items-center text-sm font-bold">
                <Brain className="h-4 w-4 mr-2" />
                Effort
              </div>
              <Select value={effort} onValueChange={setEffort}>
                <SelectTrigger className="w-[110px] bg-transparent border-none cursor-pointer font-semibold text-gray-900">
                  <SelectValue placeholder="Effort" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black text-gray-900 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <SelectItem
                    value="low"
                    className="hover:bg-pink-100 focus:bg-pink-100 cursor-pointer font-medium"
                  >
                    Low
                  </SelectItem>
                  <SelectItem
                    value="medium"
                    className="hover:bg-pink-100 focus:bg-pink-100 cursor-pointer font-medium"
                  >
                    Medium
                  </SelectItem>
                  <SelectItem
                    value="high"
                    className="hover:bg-pink-100 focus:bg-pink-100 cursor-pointer font-medium"
                  >
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-row gap-2 bg-green-400 border-2 border-black text-gray-900 rounded-xl rounded-t-md pl-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-w-[100%] sm:max-w-[90%]">
            <div className="flex flex-row items-center text-sm font-bold ml-1">
              <Cpu className="h-4 w-4 mr-2" />
              Model
            </div>
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger className="w-[180px] bg-transparent border-none cursor-pointer font-semibold text-gray-900">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-black text-gray-900 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {AVAILABLE_MODELS.map((modelInfo) => (
                  <SelectItem
                    key={modelInfo.id}
                    value={modelInfo.id}
                    className="group hover:bg-green-100 focus:bg-green-100 cursor-pointer font-medium py-2"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        {getModelIcon(modelInfo.icon, modelInfo.iconColor)}
                        {modelInfo.name}
                      </div>
                      <span className="text-xs text-gray-500 ml-6 hidden group-hover:block">{modelInfo.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasHistory && (
          <Button
            className="bg-black border-2 border-black text-white cursor-pointer rounded-xl rounded-t-md px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            variant="default"
            onClick={() => window.location.reload()}
          >
            <SquarePen size={16} />
            New Chat
          </Button>
        )}
      </div>
    </form>
  );
};
