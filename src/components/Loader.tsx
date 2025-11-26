export const Loader = () => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <span className="loading loading-spinner loading-lg text-blue-600"></span>
    </div>
  );
};

export const FullPageLoader = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      <span className="loading loading-spinner loading-lg text-blue-600 mb-4"></span>
      <p className="text-gray-600">Loading...</p>
    </div>
  );
};

export const ButtonLoader = () => {
  return <span className="loading loading-spinner loading-sm"></span>;
};
