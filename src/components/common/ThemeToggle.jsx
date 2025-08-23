import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react";
import Dropdown from "./Dropdown";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system';
    }
    return 'system';
  });

  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accentColor') || 'indigo';
    }
    return 'indigo';
  });

  const colors = [
    { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
    { id: 'blue', name: 'Azul', bg: 'bg-blue-500', ring: 'ring-blue-500' },
    { id: 'green', name: 'Verde', bg: 'bg-green-500', ring: 'ring-green-500' },
    { id: 'red', name: 'Vermelho', bg: 'bg-red-500', ring: 'ring-red-500' },
    { id: 'purple', name: 'Roxo', bg: 'bg-purple-500', ring: 'ring-purple-500' },
    { id: 'yellow', name: 'Amarelo', bg: 'bg-yellow-500', ring: 'ring-yellow-500' },
  ];

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === 'system') {
      root.classList.toggle('dark', systemDark);
      localStorage.removeItem('theme');
    } else {
      root.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    // Aplicar cor de destaque ao carregar
    applyAccentColor(accentColor);
  }, []);

  const applyAccentColor = (color) => {
    const root = document.documentElement;
    
    // Remover classes de cor anteriores
    colors.forEach(c => {
      root.classList.remove(`accent-${c.id}`);
    });
    
    // Adicionar nova classe de cor
    root.classList.add(`accent-${color}`);
    
    // Definir variáveis CSS diretamente
    const colorValues = {
      indigo: { primary: '79 70 229', hover: '67 56 202' },
      blue: { primary: '59 130 246', hover: '37 99 235' },
      green: { primary: '16 185 129', hover: '5 150 105' },
      red: { primary: '239 68 68', hover: '220 38 38' },
      purple: { primary: '139 92 246', hover: '124 58 237' },
      yellow: { primary: '245 158 11', hover: '217 119 6' },
    };
    
    if (colorValues[color]) {
      root.style.setProperty('--accent-color-primary', colorValues[color].primary);
      root.style.setProperty('--accent-color-primary-hover', colorValues[color].hover);
    }
    
    // Salvar no localStorage
    localStorage.setItem('accentColor', color);
    setAccentColor(color);
  };

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleColorChange = (color) => {
    applyAccentColor(color);
  };

  const getIcon = () => {
    switch (theme) {
      case 'dark': return <Sun className="h-5 w-5" />;
      case 'light': return <Moon className="h-5 w-5" />;
      case 'system': return <Monitor className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'dark': return 'Modo escuro (mudar para claro)';
      case 'light': return 'Modo claro (mudar para sistema)';
      case 'system': return 'Modo sistema (mudar para escuro)';
      default: return 'Alternar tema';
    }
  };

  // Itens para o dropdown de cores
  const colorItems = colors.map(color => ({
    label: (
      <div className="flex items-center justify-between w-full">
        <span>{color.name}</span>
        {accentColor === color.id && (
          <Check className="w-4 h-4" />
        )}
      </div>
    ),
    action: () => handleColorChange(color.id),
    className: `flex items-center ${accentColor === color.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`
  }));

  // Trigger personalizado para o dropdown de cores
  const colorTrigger = (
    <button
      className="p-2 rounded-full text-gray-400 hover:text-custom-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Mudar cor de destaque"
    >
      <Palette className="h-5 w-5" />
    </button>
  );

  return (
    <div className="flex items-center space-x-1">
      {/* Dropdown de cores */}
      <Dropdown
        trigger={colorTrigger}
        items={colorItems}
        align="right"
        position="bottom"
        menuClassName="w-48 p-3"
        triggerClassName=""
      >
        {/* Conteúdo customizado do dropdown */}
        {(closeDropdown) => (
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 px-2">
              Cor de destaque
            </div>
            
            <div className="grid grid-cols-3 gap-2 px-2 mb-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => {
                    handleColorChange(color.id);
                    closeDropdown();
                  }}
                  className={`relative h-8 w-8 rounded-full ${color.bg} ring-2 ring-offset-2 ${
                    accentColor === color.id
                      ? 'ring-custom-primary'
                      : 'ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
                  } transition-all`}
                  aria-label={`Cor ${color.name}`}
                  title={color.name}
                >
                  {accentColor === color.id && (
                    <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 px-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {colors.find(c => c.id === accentColor)?.name}
              </div>
            </div>
          </div>
        )}
      </Dropdown>

      {/* Botão de toggle de tema */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
        aria-label={getLabel()}
      >
        {getIcon()}
      </button>
    </div>
  );
}