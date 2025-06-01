# Esboços de Microinterações - Alex iA

## Introdução

Este documento apresenta esboços conceituais de microinterações para o Alex iA, traduzindo os pilares estéticos em experiências tangíveis. Cada microinteração foi projetada para comunicar a essência de "fluidez cognitiva com inteligência acessível", criando momentos de conexão emocional com o usuário.

## 1. Indicador de Processamento Cognitivo

### Conceito
Uma visualização que comunica o processo de "pensamento" do Alex iA, inspirada em sinapses neurais e ondas cerebrais.

### Comportamento
```css
@keyframes cognitive-pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
    background: radial-gradient(circle, var(--color-primary-400) 0%, var(--color-primary-300) 70%, transparent 100%);
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
    background: radial-gradient(circle, var(--color-primary-500) 0%, var(--color-primary-400) 70%, transparent 100%);
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
    background: radial-gradient(circle, var(--color-primary-400) 0%, var(--color-primary-300) 70%, transparent 100%);
  }
}

.cognitive-indicator {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.cognitive-node {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary-400);
  animation: cognitive-pulse 1.8s infinite;
}

.cognitive-node:nth-child(2) {
  animation-delay: 0.2s;
}

.cognitive-node:nth-child(3) {
  animation-delay: 0.4s;
}
```

### Aplicação
- Durante processamento de perguntas complexas
- Ao gerar respostas elaboradas
- Durante análise de documentos
- Enquanto acessa memória de longo prazo

### Variações
1. **Neuromorphic**: Nodos com sombras suaves e gradientes que parecem emergir da superfície
2. **Minimalista**: Pontos simples com animação sutil e tipografia elegante
3. **Adaptativa**: Velocidade e complexidade que se ajustam ao tipo de tarefa
4. **Fluida**: Ondas contínuas que fluem entre os nodos, sugerindo transmissão de informação

## 2. Transição de Contexto

### Conceito
Uma transição suave que comunica mudança de contexto ou tópico, inspirada em como o cérebro muda entre diferentes modos de pensamento.

### Comportamento
```css
@keyframes context-shift {
  0% {
    clip-path: circle(0% at center);
    transform: scale(0.95);
  }
  100% {
    clip-path: circle(150% at center);
    transform: scale(1);
  }
}

.context-container {
  position: relative;
  overflow: hidden;
}

.context-new {
  animation: context-shift 0.8s ease-in-out forwards;
}

.context-old {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: context-fade 0.8s ease-in-out forwards;
}

@keyframes context-fade {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
```

### Aplicação
- Ao mudar entre diferentes tópicos de conversa
- Quando se alterna entre modos (chat, análise de documento, visualização)
- Ao carregar um novo contexto de memória
- Durante transições entre diferentes LLMs

### Variações
1. **Neuromorphic**: Transição com profundidade e sombras, como camadas de pensamento
2. **Minimalista**: Fade simples com timing perfeito e sutil mudança de cor
3. **Adaptativa**: Velocidade e estilo que se ajustam à relação entre os contextos
4. **Fluida**: Movimento orgânico que sugere fluidez de pensamento

## 3. Feedback de Reconhecimento

### Conceito
Uma microinteração que comunica que o Alex iA reconheceu algo familiar, como um tópico recorrente ou preferência do usuário.

### Comportamento
```css
@keyframes recognition-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(20, 184, 166, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0);
  }
}

.recognition-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-nano) var(--space-xs);
  border-radius: var(--radius-full);
  background-color: color-mix(in srgb, var(--color-memory) 10%, transparent);
  color: var(--color-memory);
  border: 1px solid color-mix(in srgb, var(--color-memory) 30%, transparent);
  animation: recognition-pulse 2s infinite;
}

.recognition-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
```

### Aplicação
- Quando o sistema reconhece um tópico recorrente
- Ao identificar preferências do usuário
- Quando acessa informações de conversas anteriores
- Ao reconhecer padrões de uso

### Variações
1. **Neuromorphic**: Ícone com profundidade e textura que emerge sutilmente
2. **Minimalista**: Indicador sutil com tipografia elegante e ícone minimalista
3. **Adaptativa**: Intensidade que varia conforme a confiança do reconhecimento
4. **Fluida**: Animação que sugere conexão entre memórias

## 4. Resposta Adaptativa

### Conceito
Uma microinteração que comunica a adaptação do sistema às necessidades do usuário, inspirada em como sistemas inteligentes evoluem.

### Comportamento
```css
@keyframes adaptive-morph {
  0% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
  25% {
    border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
  }
  50% {
    border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
  }
  75% {
    border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
  }
  100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
}

.adaptive-container {
  position: relative;
  padding: var(--space-sm);
}

.adaptive-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
  animation: adaptive-morph 15s infinite;
  z-index: -1;
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.adaptive-container:hover .adaptive-background {
  opacity: 0.4;
}
```

### Aplicação
- Em cards de sugestões personalizadas
- Durante apresentação de respostas adaptadas ao perfil
- Em elementos de interface que evoluem com o uso
- Em visualizações de dados personalizados

### Variações
1. **Neuromorphic**: Formas orgânicas com sombras e profundidade
2. **Minimalista**: Sutis mudanças de cor e forma com timing perfeito
3. **Adaptativa**: Velocidade e complexidade que refletem o nível de personalização
4. **Fluida**: Movimento contínuo e orgânico que nunca se repete exatamente

## 5. Feedback de Sistema Multi-LLM

### Conceito
Uma microinteração que comunica qual modelo está sendo utilizado ou quando ocorre um fallback entre modelos, de forma sutil e informativa.

### Comportamento
```css
@keyframes model-transition {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.model-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-nano);
  padding: var(--space-nano) var(--space-xs);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  animation: model-transition 0.3s ease-out;
}

.model-badge.gpt {
  background-color: color-mix(in srgb, #10a37f 10%, transparent);
  color: #10a37f;
  border: 1px solid color-mix(in srgb, #10a37f 30%, transparent);
}

.model-badge.claude {
  background-color: color-mix(in srgb, #8e44ad 10%, transparent);
  color: #8e44ad;
  border: 1px solid color-mix(in srgb, #8e44ad 30%, transparent);
}

.model-badge.deepseek {
  background-color: color-mix(in srgb, #e67e22 10%, transparent);
  color: #e67e22;
  border: 1px solid color-mix(in srgb, #e67e22 30%, transparent);
}

.model-badge.fallback {
  background-color: color-mix(in srgb, var(--color-fallback) 10%, transparent);
  color: var(--color-fallback);
  border: 1px solid color-mix(in srgb, var(--color-fallback) 30%, transparent);
}
```

### Aplicação
- Ao iniciar uma resposta com um modelo específico
- Durante fallback entre modelos
- Em estatísticas de uso de diferentes modelos
- Em configurações de preferência de modelo

### Variações
1. **Neuromorphic**: Badges com profundidade e textura que sugerem diferentes "mentes"
2. **Minimalista**: Indicadores sutis com cores distintivas e tipografia elegante
3. **Adaptativa**: Tamanho e destaque que variam conforme a relevância da informação
4. **Fluida**: Transições suaves entre modelos com animação que sugere continuidade

## 6. Microinteração de Cache Semântico

### Conceito
Uma microinteração que comunica quando uma resposta vem do cache semântico, sugerindo reconhecimento e eficiência.

### Comportamento
```css
@keyframes cache-reveal {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.cache-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-nano);
  padding: var(--space-nano) var(--space-xs);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  background-color: color-mix(in srgb, var(--color-cache) 10%, transparent);
  color: var(--color-cache);
  border: 1px solid color-mix(in srgb, var(--color-cache) 30%, transparent);
  animation: cache-reveal 0.5s ease-out;
}

.cache-icon {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.cache-text {
  white-space: nowrap;
}
```

### Aplicação
- Ao apresentar respostas do cache semântico
- Em estatísticas de eficiência do sistema
- Durante apresentação de respostas rápidas
- Em indicadores de economia de recursos

### Variações
1. **Neuromorphic**: Ícone com profundidade que sugere acesso à memória
2. **Minimalista**: Indicador sutil com tipografia elegante e ícone minimalista
3. **Adaptativa**: Destaque que varia conforme a economia de tempo/recursos
4. **Fluida**: Animação que sugere recuperação rápida de informação

## 7. Feedback de Avaliação

### Conceito
Uma microinteração que responde ao feedback do usuário (👍👎 e escala 1-5), comunicando reconhecimento e aprendizado.

### Comportamento
```css
@keyframes feedback-thanks {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.feedback-button {
  padding: var(--space-nano);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-neutral-300);
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-600);
  transition: all 0.2s ease;
}

.feedback-button:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-700);
}

.feedback-button.active {
  background-color: var(--color-primary-100);
  color: var(--color-primary-600);
  border-color: var(--color-primary-300);
  animation: feedback-thanks 0.5s ease-out;
}

.feedback-thanks {
  font-size: var(--text-sm);
  color: var(--color-primary-600);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.feedback-thanks.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Aplicação
- Após receber feedback do usuário
- Durante apresentação de estatísticas de feedback
- Em configurações de preferências baseadas em feedback
- Em visualizações de aprendizado do sistema

### Variações
1. **Neuromorphic**: Botões com profundidade e feedback tátil visual
2. **Minimalista**: Interação sutil com animações precisas e elegantes
3. **Adaptativa**: Resposta que varia conforme o tipo de feedback
4. **Fluida**: Animação que sugere incorporação do feedback no sistema

## 8. Transição entre Modos Cognitivos

### Conceito
Uma microinteração que comunica a mudança entre diferentes modos cognitivos do sistema (analítico, criativo, crítico, etc.).

### Comportamento
```css
@keyframes cognitive-mode-shift {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.cognitive-mode {
  position: relative;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.5s ease;
}

.cognitive-mode::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    var(--color-primary-100), 
    var(--color-success-100), 
    var(--color-warning-100), 
    var(--color-primary-100));
  background-size: 300% 100%;
  opacity: 0.2;
  z-index: -1;
  animation: cognitive-mode-shift 2s ease forwards;
}

.cognitive-mode-icon {
  transition: transform 0.5s ease;
}

.cognitive-mode:hover .cognitive-mode-icon {
  transform: rotate(180deg);
}
```

### Aplicação
- Ao alternar entre modos analítico, criativo, crítico
- Durante mudança de abordagem para uma tarefa
- Em visualizações de diferentes perspectivas
- Em configurações de preferência de modo cognitivo

### Variações
1. **Neuromorphic**: Transição com profundidade que sugere diferentes camadas mentais
2. **Minimalista**: Mudança sutil de cor e ícone com timing perfeito
3. **Adaptativa**: Velocidade e estilo que se ajustam à distância conceitual entre modos
4. **Fluida**: Movimento orgânico que sugere transformação de pensamento

## Próximos Passos

1. **Prototipagem interativa**: Desenvolver protótipos funcionais das microinterações
2. **Testes de usabilidade**: Validar a clareza e o impacto emocional das microinterações
3. **Integração com Design System**: Incorporar as microinterações no sistema de design
4. **Documentação**: Criar guias de implementação e princípios de uso

/**
 * @created_by Manus AI
 * @date 1 de junho de 2025
 * @description Esboços conceituais de microinterações para o Alex iA
 */
