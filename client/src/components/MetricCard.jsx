import { TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';

export const MetricCard = ({ 
  title, 
  value, 
  variant = 'secondary',
  active = false,
  onClick
}) => {

  const cardClasses = active
    ? 'bg-[#005660] text-white border-[#005660]'
    : 'bg-[#ECECEC] text-gray-700 border-gray-300 hover:bg-[#005660] hover:text-white hover:border-[#005660]';

  const iconClasses = active
    ? 'bg-[#037280] text-[#005660]'
    : 'bg-[#037280] text-[#005660]';

  // Get appropriate icon based on title
  const getIcon = () => {
    const iconProps = { 
      size: 24, 
      className: variant === 'primary' ? 'text-white' : 'text-white' 
    };
    
    if (title.toLowerCase().includes('sales')) return <TrendingUp {...iconProps} />;
    else if (title.toLowerCase().includes('order')) return <ShoppingCart {...iconProps} />;
    else if (title.toLowerCase().includes('revenue')) return <DollarSign {...iconProps} />;
    
    return <TrendingUp {...iconProps} />;
  };

  return (
    <div
      className={`p-4 sm:p-6 rounded-lg border ${cardClasses} shadow-sm transition-colors duration-200 group cursor-pointer ${active ? 'bg-[#005660] text-white border-[#005660]' : 'hover:bg-[#005660] hover:text-white'}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p 
            className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${active ? 'text-white' : 'text-gray-500'} ${!active ? 'group-hover:text-white' : ''} truncate`}
          >
            {title}
          </p>
          {/* Value */}
          <p className={`text-3xl sm:text-5xl font-bold break-words ${active ? 'text-white' : 'group-hover:text-white'}`}>
            {value}
          </p>
        </div>
        {/* Icon */}
        <div 
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${iconClasses} flex-shrink-0`}
        >
            {getIcon()}
        </div>
      </div>
    </div>
  );
};
