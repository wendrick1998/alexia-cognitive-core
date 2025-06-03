
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Log crítico para verificar se main.tsx está executando
console.log('🚀 MAIN.TSX EXECUTANDO - Entrada do app');

// Get root element with error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ ERRO CRÍTICO: Elemento root não encontrado!');
  throw new Error("Root element not found");
}

console.log('✅ Root element encontrado:', rootElement);

// Teste direto sem providers para diagnóstico
const TestApp = () => {
  console.log('🧪 TestApp renderizando diretamente');
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#00ff00',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'black',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1>🟢 MAIN.TSX FUNCIONANDO!</h1>
        <p>Renderização direta sem providers</p>
        <p>Timestamp: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

try {
  console.log('🔄 Tentando criar root React...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('🔄 Tentando renderizar TestApp...');
  root.render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  );
  
  console.log('✅ Renderização iniciada com sucesso!');
} catch (error) {
  console.error('❌ ERRO NA RENDERIZAÇÃO:', error);
  
  // Fallback direto no DOM
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      background-color: #ff0000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      text-align: center;
      padding: 20px;
    ">
      <div>
        <h1>🔴 ERRO NO REACT!</h1>
        <p>Fallback direto no DOM</p>
        <p>Erro: ${error.message}</p>
      </div>
    </div>
  `;
}
