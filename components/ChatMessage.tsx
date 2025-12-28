import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isBot ? 'items-start' : 'items-end'}`}>
        
        <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-end gap-3`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
            isBot 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'bg-slate-700 text-slate-300'
          }`}>
            {isBot ? <Bot size={18} /> : <User size={18} />}
          </div>

          {/* Bubble */}
          <div className={`p-4 rounded-2xl shadow-md text-sm md:text-base overflow-hidden ${
            isBot 
              ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none' 
              : 'bg-blue-600 text-white rounded-br-none'
          }`}>
            {isBot ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        </div>

        {/* Images (Graphs/Charts) */}
        {message.images && message.images.length > 0 && (
          <div className={`mt-3 space-y-3 ${isBot ? 'ml-12' : 'mr-12'}`}>
            {message.images.map((img, idx) => (
              <div key={idx} className="bg-white p-2 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                <img src={img} alt="Generated Chart" className="max-w-full h-auto rounded-lg" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};