import React, { useState, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ElementType;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'minimal';
  fullWidth?: boolean;
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  fullWidth = false
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    // Update indicator position when active tab changes
    const activeElement = document.getElementById(`tab-${activeTab}`);
    if (activeElement && variant !== 'pills') {
      const { offsetLeft, offsetWidth } = activeElement;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`
      });
    }
  }, [activeTab, variant]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const variantStyles = {
    default: {
      list: 'relative border-b border-gray-200',
      tab: (isActive: boolean) => `
        px-4 py-2 text-sm font-medium
        ${isActive
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
      `,
      indicator: 'absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-200'
    },
    pills: {
      list: 'space-x-2',
      tab: (isActive: boolean) => `
        px-3 py-1.5 text-sm font-medium rounded-full
        ${isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
      `,
      indicator: ''
    },
    minimal: {
      list: 'space-x-2',
      tab: (isActive: boolean) => `
        px-3 py-1.5 text-sm font-medium rounded-md
        ${isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
      `,
      indicator: ''
    },
    underline: {
      list: 'relative border-b border-gray-200',
      tab: (isActive: boolean) => `
        px-4 py-2 text-sm font-medium border-b-2
        ${isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
      `,
      indicator: ''
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="space-y-4">
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        <nav className={styles.list}>
          <div className={`flex ${fullWidth ? 'w-full' : ''}`}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    ${styles.tab(isActive)}
                    ${fullWidth ? 'flex-1' : ''}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    transition-colors duration-200
                    flex items-center justify-center
                  `}
                >
                  {Icon && <Icon className={`w-4 h-4 ${tab.label ? 'mr-2' : ''}`} />}
                  {tab.label}
                </button>
              );
            })}
          </div>
          {variant === 'default' && (
            <div
              className={styles.indicator}
              style={indicatorStyle}
            />
          )}
        </nav>
      </div>

      <div className="relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}