import { InputForm } from './InputForm';

interface WelcomeScreenProps {
  handleSubmit: (
    submittedInputValue: string,
    effort: string,
    model: string,
    agentId: string
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
  selectedAgent: string;
  onAgentChange: (agentId: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  handleSubmit,
  onCancel,
  isLoading,
  selectedAgent,
  onAgentChange,
}) => (
  <div className="flex flex-col items-center justify-center text-center px-4 flex-1 mb-16 w-full max-w-3xl mx-auto gap-4">
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 bg-green-400 rounded-xl border-2 border-black flex items-center justify-center shadow-lg">
        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <div>
        <h1 className="text-5xl md:text-6xl font-semibold text-neutral-100 mb-3">
          Pramana.ai
        </h1>
        <p className="text-xl md:text-2xl text-neutral-400">
          Master biomedical evidence. Without the silos.
        </p>
      </div>
    </div>
    <div className="w-full mt-4">
      <InputForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onCancel}
        hasHistory={false}
        selectedAgent={selectedAgent}
        onAgentChange={onAgentChange}
      />
    </div>
    <p className="text-xs text-neutral-500">
      Powered by Groq, LangChain & LangGraph
    </p>
  </div>
);
