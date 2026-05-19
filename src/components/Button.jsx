const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center gap-2';

  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-md-soft hover:from-primary-700 hover:to-primary-600 active:scale-95',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95',
    accent: 'bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:shadow-md-soft hover:from-accent-700 hover:to-accent-600 active:scale-95',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
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
