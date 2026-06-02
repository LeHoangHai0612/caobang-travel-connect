import React from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function ContactForm() {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.");
    }, 1500);
  };

  return (
    <section className="py-16 md:py-24 bg-white" id="contact">
      <div className="container px-4">
        <div className="bg-nature-green text-white rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-light/20 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
            {/* Left Column: Info */}
            <div className="p-10 md:p-14 lg:p-16 flex flex-col justify-center">
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 text-white text-xs font-bold tracking-widest uppercase mb-6 self-start">
                Liên Hệ Tư Vấn
              </span>
              <h2 className="font-geist text-3xl md:text-4xl font-black mb-6 leading-tight">
                Bạn đã sẵn sàng cho chuyến đi để đời?
              </h2>
              <p className="text-white/80 text-base mb-10 max-w-md">
                Hãy để lại thông tin, đội ngũ chuyên gia bản địa của Cao Bằng Travel Connect sẽ tư vấn lịch trình phù hợp nhất cho bạn.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-warm-yellow shrink-0">
                    <i className="fa-solid fa-phone text-lg" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Hotline Hỗ Trợ</div>
                    <div className="font-geist font-bold text-lg">0912 345 678</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-warm-yellow shrink-0">
                    <i className="fa-solid fa-envelope text-lg" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Email Liên Hệ</div>
                    <div className="font-geist font-bold text-lg">hello@caobangtravel.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-white p-10 md:p-14 lg:p-16 text-text-dark flex flex-col justify-center">
              <h3 className="font-geist text-2xl font-black text-nature-green mb-8">
                Gửi Yêu Cầu Tư Vấn
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-text-mid uppercase tracking-wide">
                    Họ và tên *
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="Nhập họ và tên của bạn" 
                    required 
                    className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-nature-green focus-visible:ring-offset-0"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold text-text-mid uppercase tracking-wide">
                      Số điện thoại *
                    </Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="09xx xxx xxx" 
                      required 
                      className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-nature-green focus-visible:ring-offset-0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-xs font-bold text-text-mid uppercase tracking-wide">
                      Dự kiến đi ngày
                    </Label>
                    <Input 
                      id="date" 
                      type="date" 
                      className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-nature-green focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-bold text-text-mid uppercase tracking-wide">
                    Yêu cầu đặc biệt
                  </Label>
                  <textarea 
                    id="message" 
                    rows={4}
                    placeholder="Bạn muốn đi những đâu? Có yêu cầu gì đặc biệt không?" 
                    className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nature-green focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-nature-green hover:bg-teal-mid text-white font-bold text-base mt-2"
                >
                  {loading ? (
                    <><i className="fa-solid fa-spinner fa-spin mr-2" /> Đang gửi...</>
                  ) : (
                    "Gửi Yêu Cầu"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
