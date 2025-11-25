import React from 'react';
import { Icons } from './Icon';
import { SavedComponent } from '../types';

interface ComponentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  components: SavedComponent[];
  onDelete: (id: string) => void;
  onInsert: (component: SavedComponent) => void;
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ 
  isOpen, 
  onClose, 
  components, 
  onDelete, 
  onInsert 
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-gray-900 border-l border-gray-800 shadow-2xl z-40 transform transition-transform duration-300 animate-fadeIn flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/95 backdrop-blur">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Icons.Library className="w-5 h-5 text-indigo-400" />
          Minha Biblioteca
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
        >
          <Icons.Error className="w-5 h-5 rotate-45" /> {/* Using error icon rotated as close X */}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {components.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Icons.BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum componente salvo.</p>
            <p className="text-xs mt-1 text-gray-600">Salve o código atual para reutilizá-lo depois.</p>
          </div>
        ) : (
          components.map((comp) => (
            <div 
              key={comp.id} 
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 hover:bg-gray-800 hover:border-gray-600 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-200 text-sm truncate pr-2">{comp.name}</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(comp.id);
                  }}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Excluir"
                >
                  <Icons.Trash className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {new Date(comp.createdAt).toLocaleDateString()}
              </div>
              <button 
                onClick={() => onInsert(comp)}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
              >
                <Icons.Plus className="w-3 h-3" />
                Inserir na Página
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComponentLibrary;