
const ChatLoadingIndicator = () => {
  return (
    <div className="flex justify-center py-12">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Carregando conversa...</p>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;
