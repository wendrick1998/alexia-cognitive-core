
const LoadingSpinner = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando documentos...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
