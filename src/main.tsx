
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // Importe e execute a configuração do i18n aqui

// Log crítico para verificar se main.tsx está executando
console.log('🚀 MAIN.TSX EXECUTANDO - Ativando sistema de roteamento completo');

// Get root element with error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ ERRO CRÍTICO: Elemento root não encontrado!');
  throw new Error("Root element not found");
}

console.log('✅ Root element encontrado:', rootElement);

try {
  console.log('🔄 Tentando criar root React...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('🔄 Tentando renderizar App com sistema completo...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('✅ Sistema de roteamento completo ativado com sucesso!');
} catch (error) {
  console.error('❌ ERRO NA RENDERIZAÇÃO DO APP:', error);
  
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
        <h1>🔴 ERRO NO SISTEMA DE ROTEAMENTO!</h1>
        <p>Fallback direto no DOM</p>
        <p>Erro: ${error.message}</p>
      </div>
    </div>
  `;
}
