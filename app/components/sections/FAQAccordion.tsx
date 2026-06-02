import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  return (
    <section className="py-16 md:py-24 bg-beige-bg">
      <div className="container px-4 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-nature-green/10 text-nature-green text-xs font-bold tracking-widest uppercase mb-4">
            Hỗ Trợ & Giải Đáp
          </span>
          <h2 className="font-geist text-3xl md:text-4xl font-black text-text-dark mb-4">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-text-mid text-sm md:text-base">
            Những thông tin cần biết trước khi bắt đầu hành trình khám phá Cao Bằng.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left font-semibold text-text-dark hover:text-nature-green">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-text-mid leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
