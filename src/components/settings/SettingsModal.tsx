import React from 'react';
import { Cpu, Palette, Zap, Sparkles, Check, Bot } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Modal } from '../common/Modal';
import { ThemeMode, OPENROUTER_PRESET_MODELS } from '../../types/ai';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    settings,
    updateSettings,
    setThemeMode,
    setAccentColor,
  } = useSettingsStore();

  const themeOptions: Array<{ id: ThemeMode; label: string; desc: string; bg: string; text: string }> = [
    { id: 'dark', label: 'Dark (OLED)', desc: 'Pure Pitch Black #000000', bg: 'bg-black border-neutral-700', text: 'text-white' },
    { id: 'dim', label: 'Dim', desc: 'Midnight Slate Navy #15202b', bg: 'bg-[#15202b] border-[#38444d]', text: 'text-white' },
    { id: 'light', label: 'Light', desc: 'Crisp Day White #ffffff', bg: 'bg-white border-neutral-300', text: 'text-black' },
  ];

  const colorOptions = [
    { label: 'Twitter Blue', hex: '#1d9bf0' },
    { label: 'Gold', hex: '#ffd400' },
    { label: 'Pink', hex: '#f91880' },
    { label: 'Emerald', hex: '#00ba7c' },
    { label: 'Purple', hex: '#7856ff' },
    { label: 'Orange', hex: '#ff7a00' },
  ];

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Settings & AI Provider"
      maxWidth="lg"
    >
      <div className="space-y-6 text-sm">
        {/* Appearance & Themes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#71767b]">
            <Palette className="w-4 h-4 text-twitter-blue" />
            <span>Display & Themes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {themeOptions.map((t) => {
              const isSelected = settings.themeMode === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setThemeMode(t.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${t.bg} ${
                    isSelected ? 'ring-2 ring-twitter-blue border-twitter-blue' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-bold text-xs ${t.text}`}>{t.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-twitter-blue stroke-[3]" />}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-2 line-clamp-1">{t.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Accent Color */}
          <div className="pt-2">
            <span className="text-xs text-[#71767b] font-medium block mb-2">Accent Color</span>
            <div className="flex items-center space-x-3">
              {colorOptions.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setAccentColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md"
                  title={c.label}
                >
                  {settings.accentColor === c.hex && (
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Engine & Provider */}
        <div className="pt-4 border-t border-[#2f3336] space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#71767b]">
            <Cpu className="w-4 h-4 text-twitter-blue" />
            <span>AI Simulation Engine</span>
          </div>

          {/* Provider Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => updateSettings({ provider: 'openrouter' })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                settings.provider === 'openrouter'
                  ? 'bg-twitter-blue/10 border-twitter-blue ring-1 ring-twitter-blue text-white'
                  : 'bg-[#16181c] border-[#2f3336] text-[#71767b] hover:text-[#e7e9ea]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#e7e9ea]">OpenRouter Cloud LLM</span>
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-[11px] mt-1 text-[#71767b]">Llama 3.3, Euryale, Hermes, Magnum, Venice</p>
            </button>

            <button
              onClick={() => updateSettings({ provider: 'simulation' })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                settings.provider === 'simulation'
                  ? 'bg-twitter-blue/10 border-twitter-blue ring-1 ring-twitter-blue text-white'
                  : 'bg-[#16181c] border-[#2f3336] text-[#71767b] hover:text-[#e7e9ea]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#e7e9ea]">Procedural Engine</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] mt-1 text-[#71767b]">Zero key, instant responses, offline-ready</p>
            </button>
          </div>

          {/* OpenRouter Settings */}
          {settings.provider === 'openrouter' && (
            <div className="space-y-3 p-3.5 bg-[#16181c] border border-[#2f3336] rounded-xl animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-[#71767b] mb-1">
                  OpenRouter API Key
                </label>
                <input
                  type="password"
                  value={settings.openRouterApiKey}
                  onChange={(e) => updateSettings({ openRouterApiKey: e.target.value })}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3 py-2 bg-[#000] border border-[#2f3336] rounded-lg text-xs text-[#e7e9ea] focus:outline-none focus:border-twitter-blue"
                />
                <p className="text-[10px] text-[#71767b] mt-1">
                  Get your key at{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-twitter-blue underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#71767b] mb-1">
                  Roleplay & Simulation Model
                </label>
                <select
                  value={settings.openRouterModel}
                  onChange={(e) => updateSettings({ openRouterModel: e.target.value })}
                  className="w-full px-3 py-2 bg-[#000] border border-[#2f3336] rounded-lg text-xs text-[#e7e9ea] focus:outline-none focus:border-twitter-blue font-mono"
                >
                  {OPENROUTER_PRESET_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — [{m.tag}] ({m.speed})
                    </option>
                  ))}
                  <option value="custom">Custom Model (Type below)</option>
                </select>
                {settings.openRouterModel && (
                  <p className="text-[10px] text-[#71767b] mt-1">
                    {OPENROUTER_PRESET_MODELS.find((m) => m.id === settings.openRouterModel)
                      ?.description || 'Custom OpenRouter model identifier.'}
                  </p>
                )}
              </div>

              {(!OPENROUTER_PRESET_MODELS.some((m) => m.id === settings.openRouterModel) ||
                settings.openRouterModel === 'custom') && (
                <div>
                  <label className="block text-xs font-bold text-[#71767b] mb-1">
                    Custom OpenRouter Model ID
                  </label>
                  <input
                    type="text"
                    value={
                      settings.openRouterModel === 'custom' ? '' : settings.openRouterModel
                    }
                    onChange={(e) => updateSettings({ openRouterModel: e.target.value })}
                    placeholder="e.g. google/gemini-2.0-flash-001"
                    className="w-full px-3 py-2 bg-[#000] border border-[#2f3336] rounded-lg text-xs text-[#e7e9ea] focus:outline-none focus:border-twitter-blue font-mono"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Autonomous World Pulse */}
        <div className="pt-4 border-t border-[#2f3336] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-xs text-[#e7e9ea] block">Living World Pulse</span>
                <span className="text-[11px] text-[#71767b]">
                  Characters post autonomously in background
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autonomousFeed}
              onChange={(e) => updateSettings({ autonomousFeed: e.target.checked })}
              className="w-4 h-4 rounded text-twitter-blue focus:ring-0 bg-[#16181c] border-[#2f3336]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2f3336] flex justify-end">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-5 py-2 bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold rounded-full text-xs transition-all shadow-md active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
