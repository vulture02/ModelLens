import { Html } from "@react-three/drei";

const Loader: React.FC = () => {
  return (
    <Html center>
      <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-lg text-white min-w-[240px]">
        <p className="text-sm mb-3">Loading 3D model</p>
        <div className="h-1.5 bg-gray-700 rounded">
          <div className="h-full w-1/3 bg-gray-300 animate-pulse rounded" />
        </div>
      </div>
    </Html>
  );
};

export default Loader;
