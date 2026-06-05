const Card = ({ children, className = '', hover = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 ${
        hover ? 'hover:border-slate-300 hover:shadow-md' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
