import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, BarChart3, MessageSquare, Sparkles } from 'lucide-react';
import { ChatMessage, ParsedData, AppState } from './types';
import { parseExcelFile, formatDataForAI } from './services/excelService';
import { initializeChat, sendMessageToGemini } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { ChatMessage as ChatMessageComponent } from './components/ChatMessage';
import { DataPreview } from './components/DataPreview';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<ParsedData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleFileSelect = async (file: File) => {
    setAppState(AppState.PROCESSING_FILE);
    try {
      // 1. Parse Excel
      const parsedData = await parseExcelFile(file);
      setData(parsedData);

      // 2. Prepare Context for Gemini (CSV format for Code Execution)
      const dataContext = formatDataForAI(parsedData);

      // 3. Initialize Chat with specific Data Analyst prompt
      await initializeChat(dataContext);

      // 4. Update UI
      setAppState(AppState.READY);
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: `**${file.name}** dosyasını analiz etmeye hazırım! 🚀\n\nVeri setindeki desenleri inceleyebilir, hesaplamalar yapabilir veya grafik çizebilirim.\n\nÖrnek: _"En yüksek ciroya sahip ilk 5 ili grafik olarak göster."_`,
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      alert("Dosya işlenirken bir hata oluştu. Lütfen geçerli bir Excel dosyası deneyin.");
      setAppState(AppState.IDLE);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || appState !== AppState.READY) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await sendMessageToGemini(userMsg.content);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        images: response.images,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetApp = () => {
    setData(null);
    setMessages([]);
    setAppState(AppState.IDLE);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-900/20">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Excel Analist <span className="text-blue-500">AI</span>
            </h1>
          </div>
        </div>
        
        {appState === AppState.READY && (
          <button 
            onClick={resetApp}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700"
          >
            <Plus size={16} />
            Yeni Dosya
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex relative">
        {appState === AppState.IDLE || appState === AppState.PROCESSING_FILE ? (
          <div className="w-full max-w-2xl mx-auto flex flex-col justify-center px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
                Verilerinizle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Sohbet Edin</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                Excel dosyanızı yükleyin. Yapay zeka sizin için analiz etsin, hesaplasın ve grafiğe döksün.
              </p>
            </div>
            
            <FileUpload 
              onFileSelect={handleFileSelect} 
              isProcessing={appState === AppState.PROCESSING_FILE} 
            />
            
            {/* Example Prompts */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900/50 hover:bg-slate-900 rounded-xl border border-slate-800 transition-colors group cursor-default">
                <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform duration-300">📊</span>
                <p className="text-sm font-medium text-slate-300">"En yüksek ciroya sahip ili bul ve göster."</p>
              </div>
              <div className="p-5 bg-slate-900/50 hover:bg-slate-900 rounded-xl border border-slate-800 transition-colors group cursor-default">
                <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform duration-300">📈</span>
                <p className="text-sm font-medium text-slate-300">"Satışların aylık dağılımını grafik çiz."</p>
              </div>
              <div className="p-5 bg-slate-900/50 hover:bg-slate-900 rounded-xl border border-slate-800 transition-colors group cursor-default">
                <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform duration-300">🔍</span>
                <p className="text-sm font-medium text-slate-300">"Hangi ürün kategorisinde kar marjı daha yüksek?"</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full h-full gap-6 p-4 md:p-6">
            {/* Left Side: Data Preview (Hidden on small screens) */}
            <div className="hidden lg:block w-1/3 h-full">
              <DataPreview data={data} />
            </div>

            {/* Right Side: Chat Interface */}
            <div className="flex-1 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden h-full">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Analiz etmek istediğiniz konuyu sorun.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <ChatMessageComponent key={msg.id} message={msg} />
                  ))
                )}
                
                {isTyping && (
                  <div className="flex w-full mb-6 justify-start">
                     <div className="flex max-w-[80%] flex-col items-start">
                        <div className="flex flex-row items-center">
                            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-600/20 text-blue-500 mr-3 flex items-center justify-center animate-pulse">
                              <Sparkles size={18} />
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                        <span className="text-xs text-slate-500 ml-12 mt-2">Hesaplanıyor ve analiz ediliyor...</span>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                  <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Örn: En yüksek satış yapılan 5 şehri grafik ile göster..."
                      className="w-full max-h-32 p-3 resize-none outline-none bg-transparent text-slate-200 placeholder:text-slate-600"
                      rows={1}
                      style={{ minHeight: '50px' }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20"
                  >
                    <Send size={20} />
                  </button>
                </div>
                <div className="text-center mt-3">
                  <p className="text-[10px] text-slate-600">Yapay zeka Python kullanarak hesaplama yapar.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;