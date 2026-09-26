import React, { useState, useEffect } from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';

export interface AppTheme {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  borderHex: string;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'spurs-silver',
    name: 'San Antonio Spurs Metallic',
    subtitle: 'Classic Silver, Deep Obsidian & Pure White',
    badge: 'Spurs Heritage',
    bgHex: '#040711',
    cardHex: '#0B1329',
    accentHex: '#F59E0B',
    borderHex: '#334155'
  },
  {
    id: 'kingdom-gold',
    name: 'Kingdom Gold & Amber Altar',
    subtitle: 'Warm Sacred Fire, Rich Charcoal & Amber Glow',
    badge: 'Holy Fire',
    bgHex: '#120B04',
    cardHex: '#1D1207',
    accentHex: '#D97706',
    borderHex: '#78350F'
  },
  {
    id: 'men-on-fire',
    name: 'Men On Fire Flame',
    subtitle: 'Iron Sharpens Iron, Deep Ember & Blazing Orange',
    badge: 'Brotherhood Flame',
    bgHex: '#130704',
    cardHex: '#220D07',
    accentHex: '#F97316',
    borderHex: '#C2410C'
  },
  {
    id: 'women-ignited',
    name: 'Women Ignited Sacred Rose',
    subtitle: 'Royal Magenta, Sacred Sisterhood & Rose Gold',
    badge: 'Sisterhood Flame',
    bgHex: '#15050C',
    cardHex: '#240915',
    accentHex: '#F43F5E',
    borderHex: '#9F1239'
  },
  {
    id: 'dark-matter',
    name: 'Imperial Dark Matter',
    subtitle: 'Deep Cartography Obsidian & Radiant Cyan Nodes',
    badge: 'Atlas Cartography',
    bgHex: '#02040A',
    cardHex: '#070E20',
    accentHex: '#06B6D4',
    borderHex: '#1E293B'
  },
  {
    id: 'pentecost-scarlet',
    name: 'Pentecost Upper Room Scarlet',
    subtitle: 'Mighty Rushing Wind, Holy Ghost Flame & Ruby',
    badge: 'Acts 2 Outpouring',
    bgHex: '#170404',
    cardHex: '#2A0808',
    accentHex: '#EF4444',
    borderHex: '#991B1B'
  },
  {
    id: 'royal-purple',
    name: 'Mount Zion Royal Purple',
    subtitle: 'Apostolic Royalty, King’s Robe & Amethyst',
    badge: 'Priestly Heritage',
    bgHex: '#0E0517',
    cardHex: '#1B0B2E',
    accentHex: '#A855F7',
    borderHex: '#6B21A8'
  },
  {
    id: 'living-water',
    name: 'Living Waters Turquoise',
    subtitle: 'Pure River of Life, Refreshing Stream & Teal',
    badge: 'Ezekiel 47 River',
    bgHex: '#021214',
    cardHex: '#062024',
    accentHex: '#14B8A6',
    borderHex: '#0F766E'
  },
  {
    id: 'olive-grove',
    name: 'Gethsemane Olive Grove Emerald',
    subtitle: 'Watch & Pray, Everlasting Green & Altar Peace',
    badge: 'Consecrated Garden',
    bgHex: '#04130A',
    cardHex: '#092415',
    accentHex: '#10B981',
    borderHex: '#065F46'
  },
  {
    id: 'desert-solace',
    name: 'Sinai Desert Solace & Sandstone',
    subtitle: 'Still Small Voice, Pillar of Fire & Warm Sand',
    badge: 'Horeb Encounter',
    bgHex: '#140E06',
    cardHex: '#24190C',
    accentHex: '#EAB308',
    borderHex: '#854D0E'
  }
];

interface ThemeHUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
}

export const ThemeHUDModal: React.FC<ThemeHUDModalProps> = ({
  isOpen,
  onClose,
  currentThemeId = 'spurs-silver',
  onSelectTheme
}) => {
  const [selectedId, setSelectedId] = useState(currentThemeId);

  useEffect(() => {
    setSelectedId(currentThemeId);
  }, [currentThemeId]);

  if (!isOpen) return null;

  const handleApplyTheme = (id: string) => {
    setSelectedId(id);
    if (onSelectTheme) onSelectTheme(id);
    try {
      localStorage.setItem('youngfire_theme_id', id);
      const targetTheme = APP_THEMES.find(t => t.id === id);
      if (targetTheme) {
        document.documentElement.style.setProperty('--theme-bg', targetTheme.bgHex);
        document.documentElement.style.setProperty('--theme-card', targetTheme.cardHex);
        document.documentElement.style.setProperty('--theme-accent', targetTheme.accentHex);
        document.documentElement.style.setProperty('--theme-border', targetTheme.borderHex);
        document.body.style.backgroundColor = targetTheme.bgHex;
      }
      window.dispatchEvent(new CustomEvent('yf_theme_applied', { detail: { themeId: id } }));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-[#0B1329] border border-amber-500/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#070C1C] px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase font-['Outfit'] text-white">
                10 Liturgical Palettes
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Spurs Heritage, Liturgical Seasons & Sacred Sanctuary Themes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List */}
        <div className="p-5 space-y-2.5 overflow-y-auto flex-1">
          {APP_THEMES.map((theme) => {
            const isSelected = selectedId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleApplyTheme(theme.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-amber-400 bg-white/10 shadow-lg scale-[1.01]'
                    : 'border-white/10 bg-[#070C1C] hover:border-white/20'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 20px ${theme.accentHex}40` : undefined
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: theme.bgHex,
                      borderColor: theme.accentHex
                    }}
                  >
                    <div 
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: theme.accentHex }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white font-['Outfit']">{theme.name}</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                        {theme.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{theme.subtitle}</p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#070C1C] px-5 py-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Theme applies across all tabs seamlessly</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
