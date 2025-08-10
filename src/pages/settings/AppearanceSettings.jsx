import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';

export default function AppearanceSettings() {
  const { user } = useOutletContext();
  const [theme, setTheme] = useState('system');

  const themes = [
    { id: 'light', name: 'Claro', icon: SunIcon },
    { id: 'dark', name: 'Escuro', icon: MoonIcon },
    { id: 'system', name: 'Sistema', icon: MonitorIcon },
  ];

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    if (selectedTheme === 'system') {
      // Usar preferência do sistema
    } else {
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    }
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
                  className={`rounded-lg border p-4 text-center ${
                    theme === t.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <t.icon className="mx-auto h-6 w-6 mb-2" />
                  <span className="block text-sm font-medium">{t.name}</span>
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
                <div className="flex space-x-2">
                  {['indigo', 'blue', 'green', 'red', 'purple', 'yellow'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full bg-${color}-500`}
                      onClick={() => {
                        // TO DO: mudança de cor
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}