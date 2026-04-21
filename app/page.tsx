export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center bg-emerald-900 text-white">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1581630130932-944f5068292c?q=80&w=2070')] bg-cover bg-center"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold tracking-tight mb-4">Khám phá Cao Bằng cùng HDV Bản Địa</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Kết nối trực tiếp với những người am hiểu từng ngọn núi, con thác tại vùng đất biên cương.
          </p>
          <button className="mt-8 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-all">
            Tìm hướng dẫn viên ngay
          </button>
        </div>
      </div>

      {/* Thông tin nhanh */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Tại sao nên chọn chúng tôi?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🏔️</div>
            <h3 className="font-bold text-lg mb-2">HDV Am Hiểu</h3>
            <p className="text-gray-600 text-sm">Những người con của Cao Bằng, rành từng lối mòn, vách đá.</p>
          </div>
          <div className="p-6 border rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="font-bold text-lg mb-2">Kết Nối Trực Tiếp</h3>
            <p className="text-gray-600 text-sm">Trao đổi nhanh gọn qua Zalo/SĐT, không mất phí trung gian.</p>
          </div>
          <div className="p-6 border rounded-xl shadow-sm">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-bold text-lg mb-2">Trải Nghiệm Riêng</h3>
            <p className="text-gray-600 text-sm">Lịch trình cá nhân hóa theo sở thích của riêng bạn.</p>
          </div>
        </div>
      </div>
    </main>
  );
}