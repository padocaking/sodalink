import BannerSlider from '../components/BannerSlider';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Banner Slider Section */}
      <BannerSlider />
      
      {/* Page Content */}
      <div className="flex flex-col items-center p-4 flex-grow">
        <h1 className="text-4xl font-bold mb-8 mt-8 text-black">Home</h1>
      </div>
    </div>
  );
}
