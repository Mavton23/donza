import usePageTitle from "@/hooks/usePageTitle";
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SunIcon, MoonIcon, MonitorIcon, CheckIcon } from 'lucide-react';

export default function AppearanceSettings() {
  usePageTitle();
  const { user } = useOutletContext();
  const [theme, setTheme] = useState('system');
  const [accentColor, setAccentColor] = useState('indigo');

  // Carregar preferências salvas
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const savedColor = localStorage.getItem('accentColor') || 'indigo';
    
    setTheme(savedTheme);
    setAccentColor(savedColor);
    
    // Aplicar a cor salva
    applyAccentColor(savedColor);
    
    // Aplicar tema
    if (savedTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemDark);
    } else {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const themes = [
    { id: 'light', name: 'Claro', icon: SunIcon },
    { id: 'dark', name: 'Escuro', icon: MoonIcon },
    { id: 'system', name: 'Sistema', icon: MonitorIcon },
  ];

  const colors = [
    { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
    { id: 'blue', name: 'Azul', bg: 'bg-blue-500', ring: 'ring-blue-500' },
    { id: 'green', name: 'Verde', bg: 'bg-green-500', ring: 'ring-green-500' },
    { id: 'red', name: 'Vermelho', bg: 'bg-red-500', ring: 'ring-red-500' },
    { id: 'purple', name: 'Roxo', bg: 'bg-purple-500', ring: 'ring-purple-500' },
    { id: 'yellow', name: 'Amarelo', bg: 'bg-yellow-500', ring: 'ring-yellow-500' },
  ];

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    
    if (selectedTheme === 'system') {
      localStorage.removeItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemDark);
    } else {
      localStorage.setItem('theme', selectedTheme);
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    }
  };

  const applyAccentColor = (color) => {
    const root = document.documentElement;
    
    // Remover classes de cor anteriores
    colors.forEach(c => {
      root.classList.remove(`accent-${c.id}`);
    });
    
    // Adicionar nova classe de cor
    root.classList.add(`accent-${color}`);
    
    // Definir variáveis CSS diretamente também (para garantir)
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
          <SunIcon className="h-5 w-5" /> Aparência
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Personalize a aparência do sistema
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="space-y-8">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Tema
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeChange(t.id)}
                  className={`relative rounded-lg border p-4 text-center transition-all ${
                    theme === t.id
                      ? 'border-custom-primary ring-2 ring-custom-primary'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <t.icon className="mx-auto h-6 w-6 mb-2" />
                  <span className="block text-sm font-medium">{t.name}</span>
                  {theme === t.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-custom-primary rounded-full flex items-center justify-center">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Personalização
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor de destaque
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className={`relative h-10 w-10 rounded-full ${color.bg} ring-2 ring-offset-2 ${
                        accentColor === color.id
                          ? 'ring-indigo-500 dark:ring-indigo-400'
                          : 'ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
                      } transition-all`}
                      onClick={() => applyAccentColor(color.id)}
                      aria-label={`Cor ${color.name}`}
                    >
                      {accentColor === color.id && (
                        <CheckIcon className="absolute inset-0 m-auto w-5 h-5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Cor atual: {colors.find(c => c.id === accentColor)?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}