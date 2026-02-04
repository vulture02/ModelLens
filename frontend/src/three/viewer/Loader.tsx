import { Html } from "@react-three/drei";

const Loader: React.FC = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        {/* Simple spinner */}
        <div 
          className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
        
        {/* Text with typing dots */}
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm">Loading</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-white rounded-full"
                style={{
                  animation: "bounce 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </Html>
  );
};

export default Loader;