import React, { useState, useRef, useEffect } from 'react';
import { generatePageContent } from './services/geminiService';
import PreviewFrame from './components/PreviewFrame';
import CodeViewer from './components/CodeViewer';
import ComponentLibrary from './components/ComponentLibrary';
import { DeviceType, SavedComponent } from './types';
import { Icons } from './components/Icon';

const INITIAL_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Bem-vindo</title>
</head>
<body class="bg-slate-900 text-white flex items-center justify-center min-h-screen">
    <div class="text-center p-8 max-w-2xl">
        <div class="mb-6 inline-block p-4 rounded-full bg-indigo-500/20 text-indigo-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Crie algo incrível
        </h1>
        <p class="text-slate-400 text-lg mb-8">
            Descreva a landing page ou componente que você deseja criar na caixa abaixo, e a IA irá construí-lo para você em segundos.
        </p>
    </div>
</body>
</html>
`;

type TemplateCategory = 'business' | 'marketing' | 'personal' | 'commerce' | 'events';

interface Template {
  icon: React.ElementType;
  label: string;
  prompt: string;
  color: string;
}

const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; items: Template[] }> = {
  business: {
    label: "Negócios & SaaS",
    items: [
      {
        icon: Icons.Rocket,
        label: "SaaS B2B",
        prompt: "Landing page para um SaaS B2B futurista com tema escuro. Inclua hero com gradiente, grid de features com ícones, cards de depoimentos e uma tabela de preços destacada.",
        color: "from-blue-500 to-cyan-500"
      },
      {
        icon: Icons.Briefcase,
        label: "Agência Digital",
        prompt: "Site institucional para agência de marketing digital. Estilo minimalista e clean, tipografia grande, seção de 'Nossos Serviços', galeria de clientes e formulário de contato.",
        color: "from-indigo-500 to-purple-500"
      },
      {
        icon: Icons.Layout,
        label: "Dashboard",
        prompt: "Layout de dashboard administrativo com sidebar lateral escura, header com busca e perfil, cards de estatísticas no topo e uma tabela de dados recente.",
        color: "from-slate-500 to-gray-500"
      }
    ]
  },
  marketing: {
    label: "Marketing",
    items: [
      {
        icon: Icons.Send,
        label: "Newsletter",
        prompt: "Página de captura para Newsletter (Squeeze Page). Foco total no formulário de email, título persuasivo, lista de benefícios em bullets e prova social logo abaixo.",
        color: "from-emerald-500 to-teal-500"
      },
      {
        icon: Icons.Download,
        label: "Ebook Grátis",
        prompt: "Página para download de Ebook. Capa do livro em 3D à esquerda, formulário à direita, seção 'O que você vai aprender' e biografia do autor no rodapé.",
        color: "from-orange-500 to-amber-500"
      },
      {
        icon: Icons.Loader,
        label: "Lista de Espera",
        prompt: "Página de 'Em Breve' (Waitlist) com contagem regressiva, campo para email viral, design moderno com gradientes e blur.",
        color: "from-pink-500 to-rose-500"
      }
    ]
  },
  personal: {
    label: "Pessoal",
    items: [
      {
        icon: Icons.Eye,
        label: "Portfólio UX",
        prompt: "Portfólio minimalista para designer UX. Foto circular de perfil, biografia curta, galeria de projetos em grid masonry e links sociais.",
        color: "from-violet-500 to-fuchsia-500"
      },
      {
        icon: Icons.Code,
        label: "Dev Profile",
        prompt: "Página pessoal para desenvolvedor. Tema terminal/hacker style, lista de skills com barras de progresso, timeline de experiência e projetos no GitHub.",
        color: "from-green-500 to-emerald-600"
      }
    ]
  },
  commerce: {
    label: "Comércio",
    items: [
      {
        icon: Icons.Zap,
        label: "Produto Físico",
        prompt: "Página de vendas para um fone de ouvido premium. Imagem hero gigante, especificações técnicas detalhadas, review de usuários e botão de compra flutuante.",
        color: "from-red-500 to-orange-500"
      },
      {
        icon: Icons.Coffee,
        label: "Cafeteria",
        prompt: "Página aconchegante para uma cafeteria artesanal. Tons terrosos, menu com preços, seção 'Sobre Nós' com foto grande e horário de funcionamento.",
        color: "from-amber-700 to-orange-800"
      }
    ]
  },
  events: {
    label: "Eventos",
    items: [
      {
        icon: Icons.Calendar,
        label: "Conferência",
        prompt: "Site para evento de tecnologia. Hero com data e local, grade de palestrantes com fotos redondas, agenda do dia e CTA para comprar ingresso.",
        color: "from-blue-600 to-indigo-700"
      },
      {
        icon: Icons.Sparkles,
        label: "Webinar",
        prompt: "Página de inscrição para Webinar ao vivo. Vídeo teaser no topo, data/hora em destaque, tópicos abordados e formulário de inscrição simples.",
        color: "from-purple-600 to-indigo-600"
      }
    ]
  }
};

function App() {
  const [currentCode, setCurrentCode] = useState<string>(INITIAL_HTML);
  const [device, setDevice] = useState<DeviceType>(DeviceType.DESKTOP);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [lastSummary, setLastSummary] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('business');
  
  // Saved Components State
  const [savedComponents, setSavedComponents] = useState<SavedComponent[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved components from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_components');
    if (saved) {
      try {
        setSavedComponents(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved components", e);
      }
    }
  }, []);

  // Save to local storage whenever components change
  useEffect(() => {
    localStorage.setItem('saved_components', JSON.stringify(savedComponents));
  }, [savedComponents]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const codeContext = currentCode === INITIAL_HTML ? undefined : currentCode;
      const response = await generatePageContent(prompt, codeContext);
      
      setCurrentCode(response.html);
      setLastSummary(response.summary);
      setPrompt('');
    } catch (error) {
      alert("Erro ao gerar conteúdo. Verifique sua chave API ou tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveComponent = () => {
    const name = window.prompt("Digite um nome para este componente/página:");
    if (!name) return;

    const newComponent: SavedComponent = {
      id: crypto.randomUUID(),
      name: name,
      code: currentCode,
      createdAt: Date.now()
    };

    setSavedComponents(prev => [newComponent, ...prev]);
    setIsLibraryOpen(true);
  };

  const handleDeleteComponent = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este componente?")) {
      setSavedComponents(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleInsertComponent = (component: SavedComponent) => {
    setPrompt(`Integre o seguinte componente salvo (${component.name}) nesta página. Mantenha o design atual harmônico e resolva conflitos de estilo. Código do componente: \n\n ${component.code}`);
    setIsLibraryOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const applyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-30 relative">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Icons.Layout className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">AI Builder</h1>
        </div>

        {/* Device Toggles */}
        <div className="hidden md:flex bg-gray-800/50 backdrop-blur-md rounded-xl p-1 border border-gray-700/50">
          <button 
            onClick={() => setDevice(DeviceType.DESKTOP)}
            className={`p-2 rounded-lg transition-all duration-300 ${device === DeviceType.DESKTOP ? 'bg-gray-700 text-white shadow-lg ring-1 ring-white/5' : 'text-gray-400 hover:text-white hover:bg-gray-700/50 hover:scale-105'}`}
            title="Desktop View"
          >
            <Icons.Monitor className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setDevice(DeviceType.TABLET)}
            className={`p-2 rounded-lg transition-all duration-300 ${device === DeviceType.TABLET ? 'bg-gray-700 text-white shadow-lg ring-1 ring-white/5' : 'text-gray-400 hover:text-white hover:bg-gray-700/50 hover:scale-105'}`}
            title="Tablet View"
          >
            <Icons.Tablet className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setDevice(DeviceType.MOBILE)}
            className={`p-2 rounded-lg transition-all duration-300 ${device === DeviceType.MOBILE ? 'bg-gray-700 text-white shadow-lg ring-1 ring-white/5' : 'text-gray-400 hover:text-white hover:bg-gray-700/50 hover:scale-105'}`}
            title="Mobile View"
          >
            <Icons.Smartphone className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className={`p-2 rounded-xl text-gray-300 transition-all duration-200 border ${isLibraryOpen ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50' : 'bg-transparent border-transparent hover:bg-gray-800 hover:text-white'}`}
            title="Biblioteca de Componentes"
          >
            <Icons.BookOpen className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-700 mx-1"></div>
          <button 
            onClick={() => setShowCode(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:text-white transition-all shadow-sm"
          >
            <Icons.Code className="w-4 h-4" />
            <span className="hidden sm:inline">Código</span>
          </button>
           <button 
            onClick={handleSaveComponent}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-indigo-300 bg-indigo-900/20 border border-indigo-500/30 hover:bg-indigo-900/40 hover:text-indigo-200 transition-all shadow-sm"
            title="Salvar na Biblioteca"
          >
            <Icons.Save className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar</span>
          </button>
          <button 
            onClick={handleDownload}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 active:scale-95 ring-1 ring-white/10"
          >
            <Icons.Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex relative overflow-hidden">
        
        {/* Preview Layer */}
        <div className="flex-1 relative bg-gray-900/50 backdrop-blur-sm flex">
          
          <div className="flex-1 relative overflow-hidden">
             <PreviewFrame html={currentCode} device={device} />
             
             {/* Overlay loading state */}
            {isGenerating && (
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <Icons.Loader className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
                </div>
                <p className="mt-4 text-lg font-medium text-indigo-300 animate-pulse">Criando sua página com IA...</p>
                <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos.</p>
                </div>
            )}
          </div>

          {/* Component Library Sidebar */}
          <ComponentLibrary 
            isOpen={isLibraryOpen} 
            onClose={() => setIsLibraryOpen(false)}
            components={savedComponents}
            onDelete={handleDeleteComponent}
            onInsert={handleInsertComponent}
          />

          {/* Code Viewer Modal */}
          {showCode && (
            <CodeViewer code={currentCode} onClose={() => setShowCode(false)} />
          )}
        </div>

      </main>

      {/* Input Area (Bottom) */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-800 p-4 md:p-6 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="max-w-4xl mx-auto w-full">
            
            {/* Category Selector */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mr-2 shrink-0">
                Categorias:
              </span>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                 <button
                    key={key}
                    onClick={() => setActiveCategory(key as TemplateCategory)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 border whitespace-nowrap ${
                      activeCategory === key 
                      ? 'bg-gray-700 text-white border-gray-600 shadow-sm' 
                      : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-800 hover:text-gray-200'
                    }`}
                 >
                   {category.label}
                 </button>
              ))}
            </div>

            {/* Template Chips for Active Category */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 animate-fadeIn">
              {TEMPLATE_CATEGORIES[activeCategory].items.map((template, index) => (
                <button
                  key={`${activeCategory}-${index}`}
                  onClick={() => applyTemplate(template.prompt)}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-200 shrink-0 hover:scale-105 active:scale-95"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br ${template.color} text-white shadow-sm`}>
                    <template.icon className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white whitespace-nowrap">
                    {template.label}
                  </span>
                </button>
              ))}
            </div>

            {lastSummary && (
                <div className="mb-3 flex items-start gap-2 text-sm text-green-400 animate-fadeIn">
                    <Icons.Check className="w-4 h-4 mt-0.5" />
                    <span>{lastSummary}</span>
                </div>
            )}
            
            <div className="relative flex items-end gap-2 bg-gray-800/80 p-2 rounded-2xl border border-gray-700/80 shadow-xl ring-1 ring-white/5 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all duration-300">
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate();
                        }
                    }}
                    placeholder={`Descreva sua página de ${TEMPLATE_CATEGORIES[activeCategory].label.toLowerCase()}...`}
                    className="w-full bg-transparent border-none text-gray-100 placeholder-gray-500 focus:ring-0 resize-none max-h-48 min-h-[44px] py-3 px-3"
                    disabled={isGenerating}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className={`mb-1 p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isGenerating || !prompt.trim() 
                        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-transparent' 
                        : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 ring-1 ring-white/10'
                    }`}
                >
                    {isGenerating ? <Icons.Loader className="w-5 h-5 animate-spin" /> : <Icons.Send className="w-5 h-5" />}
                </button>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
                Pressione Enter para enviar. Shift + Enter para quebra de linha.
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;