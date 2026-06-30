const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60';

  const variants = {
    primary:
      'bg-[#EAB308] text-slate-950 shadow-sm hover:bg-[#F59E0B] active:scale-[0.98]',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98]',
    accent:
      'bg-accent-600 text-white shadow-sm hover:bg-accent-700 active:scale-[0.98]',
    outline:
      'border border-slate-300 bg-white text-slate-700 hover:border-[#FBBF24] hover:bg-[#FEF3C7] hover:text-slate-950 active:scale-[0.98]',
    danger:
      'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
